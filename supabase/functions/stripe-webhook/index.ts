// Edge Function: Stripe Webhook Handler
// Configure in Stripe Dashboard: https://your-project.supabase.co/functions/v1/stripe-webhook
// Required env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

serve(async (req) => {
  // Security: Only accept POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  // Security: Verify webhook secret is configured
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return new Response('Webhook not configured', { status: 500 })
  }

  try {
    // Get the raw body
    const body = await req.text()

    // Verify webhook signature (authenticates request is from Stripe)
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const orderId = session.metadata?.order_id

        if (orderId) {
          // Update order status to paid
          await supabaseClient
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'processing',
            })
            .eq('id', orderId)

          console.log(`Order ${orderId} marked as paid`)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object
        const orderId = session.metadata?.order_id

        if (orderId) {
          await supabaseClient
            .from('orders')
            .update({ payment_status: 'failed' })
            .eq('id', orderId)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object
        // Find order by payment intent
        const { data: orders } = await supabaseClient
          .from('orders')
          .select('id')
          .eq('payment_intent_id', charge.payment_intent)
          .single()

        if (orders) {
          await supabaseClient
            .from('orders')
            .update({ payment_status: 'refunded' })
            .eq('id', orders.id)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
