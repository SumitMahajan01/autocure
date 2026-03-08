// Edge Function: Create Stripe Checkout Session
// Deploy with: supabase functions deploy create-payment-session

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Maximum order amount in cents ($10,000)
const MAX_ORDER_AMOUNT = 1000000

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const jwt = authHeader.substring(7)

    // Create Supabase client with user JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { order_id, items, customer_email, success_url, cancel_url } = await req.json()

    // Validate required fields
    if (!order_id || !items || !Array.isArray(items) || items.length === 0 || !customer_email) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(customer_email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify order belongs to authenticated user and is unpaid
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('id, user_id, total, payment_status')
      .eq('id', order_id)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Security: Verify order belongs to current user
    if (order.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Order does not belong to user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Security: Verify order is unpaid
    if (order.payment_status !== 'unpaid') {
      return new Response(
        JSON.stringify({ error: 'Order already paid or processing' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate total from items
    const calculatedTotal = items.reduce((sum: number, item: any) => {
      return sum + (Math.round(item.price * 100) * item.quantity)
    }, 0)

    // Security: Verify amount matches order total (within 1 cent tolerance)
    const orderTotalCents = Math.round(order.total * 100)
    if (Math.abs(calculatedTotal - orderTotalCents) > 1) {
      return new Response(
        JSON.stringify({ error: 'Order total mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Security: Check maximum order amount
    if (calculatedTotal > MAX_ORDER_AMOUNT) {
      return new Response(
        JSON.stringify({ error: 'Order amount exceeds maximum allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Security: Validate item prices are positive
    for (const item of items) {
      if (!item.price || item.price <= 0 || !item.quantity || item.quantity < 1) {
        return new Response(
          JSON.stringify({ error: 'Invalid item price or quantity' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name.substring(0, 100), // Limit name length
            description: item.description?.substring(0, 500) || undefined,
            images: item.image ? [item.image.substring(0, 2048)] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: Math.min(item.quantity, 99), // Limit quantity
      })),
      mode: 'payment',
      success_url: success_url || `${req.headers.get('origin')}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/checkout?canceled=true`,
      customer_email: customer_email.toLowerCase().trim(),
      metadata: {
        order_id,
        user_id: user.id,
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minute expiry
    })

    // Update order with payment intent ID using service role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    await adminClient
      .from('orders')
      .update({
        payment_intent_id: session.id,
        payment_provider: 'stripe',
      })
      .eq('id', order_id)

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
