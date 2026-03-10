// Admin API Edge Function
// Provides admin-only operations for dashboard

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jwt = authHeader.substring(7)

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route based on path and method
    const url = new URL(req.url)
    const path = url.pathname.replace('/admin-api', '')

    // Create admin client for bypassing RLS
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // GET /stats - Dashboard statistics
    if (req.method === 'GET' && path === '/stats') {
      const { data: orderStats } = await adminClient.rpc('get_order_stats')
      const { data: productStats } = await adminClient.rpc('get_product_stats')
      
      // Get recent orders
      const { data: recentOrders } = await adminClient
        .from('orders')
        .select('*, profiles(display_name)')
        .order('created_at', { ascending: false })
        .limit(10)

      return new Response(
        JSON.stringify({
          orders: orderStats?.[0] || {},
          products: productStats?.[0] || {},
          recentOrders: recentOrders || []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /orders - List all orders with pagination
    if (req.method === 'GET' && path === '/orders') {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '20')
      const offset = (page - 1) * limit

      const { data: orders, error, count } = await adminClient
        .from('orders')
        .select('*, profiles(display_name, email), order_items(*, products(name))', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          orders,
          pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil((count || 0) / limit)
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PATCH /orders/:id - Update order status
    if (req.method === 'PATCH' && path.startsWith('/orders/')) {
      const orderId = path.split('/')[2]
      const { status, tracking_number, notes } = await req.json()

      const updateData: any = {}
      if (status) updateData.status = status
      if (tracking_number !== undefined) updateData.tracking_number = tracking_number
      if (notes !== undefined) updateData.notes = notes

      const { data, error } = await adminClient
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ order: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /products - List all products (including inactive)
    if (req.method === 'GET' && path === '/products') {
      const { data: products, error } = await adminClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ products }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /products - Create new product
    if (req.method === 'POST' && path === '/products') {
      const productData = await req.json()

      const { data, error } = await adminClient
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ product: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PATCH /products/:id - Update product
    if (req.method === 'PATCH' && path.startsWith('/products/')) {
      const productId = path.split('/')[2]
      const productData = await req.json()

      const { data, error } = await adminClient
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ product: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /products/:id - Delete product
    if (req.method === 'DELETE' && path.startsWith('/products/')) {
      const productId = path.split('/')[2]

      const { error } = await adminClient
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /inventory/adjust - Adjust inventory
    if (req.method === 'POST' && path === '/inventory/adjust') {
      const { product_id, amount, reason } = await req.json()

      // Get current stock
      const { data: product } = await adminClient
        .from('products')
        .select('stock_quantity')
        .eq('id', product_id)
        .single()

      if (!product) {
        return new Response(
          JSON.stringify({ error: 'Product not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const newStock = product.stock_quantity + amount
      if (newStock < 0) {
        return new Response(
          JSON.stringify({ error: 'Insufficient stock' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update stock
      const { error: updateError } = await adminClient
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', product_id)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log the change
      await adminClient
        .from('inventory_logs')
        .insert({
          product_id,
          change_amount: amount,
          reason,
          previous_stock: product.stock_quantity,
          new_stock: newStock,
          created_by: user.id
        })

      return new Response(
        JSON.stringify({ success: true, new_stock: newStock }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
