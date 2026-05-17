import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const organizationId = session.client_reference_id

      if (!organizationId) throw new Error('No organizationId in session')

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          organization_id: organizationId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan: subscription.items.data[0].price.id,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object

      // Retrieve subscription from Stripe to get customer and other details if needed
      // or use the provided data.
      const { data: subData } = await supabaseAdmin
        .from('subscriptions')
        .select('organization_id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (subData) {
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subData.id)
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
})
