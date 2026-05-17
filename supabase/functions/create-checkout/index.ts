import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
})

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get user from token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) throw new Error('Unauthorized')

    // Get organization from profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) throw new Error('Organization not found')
    const organizationId = profile.organization_id

    // Check for existing active subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('organization_id', organizationId)
      .single()

    if (subscription?.status === 'active') {
      return new Response(
        JSON.stringify({ error: 'Active subscription already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create or get Stripe customer
    const { data: subData } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', organizationId)
      .single()

    let customerId = subData?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { organization_id: organizationId },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          organization_id: organizationId,
          stripe_customer_id: customerId,
        })
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: Deno.env.get('STRIPE_PRICE_ID') ?? '',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('APP_URL') ?? ''}/payment-success`,
      cancel_url: `${Deno.env.get('APP_URL') ?? ''}/payment-cancelled`,
      client_reference_id: organizationId,
      metadata: { organization_id: organizationId },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        status: 400
      }
    )
  }
})
