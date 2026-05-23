const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase  = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY   // service role para escribir sin RLS
)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  // Verificar firma de Stripe para evitar webhooks falsos
  const sig    = event.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, secret)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }

  // Solo procesamos checkout.session.completed
  if (stripeEvent.type === 'checkout.session.completed') {
    const session    = stripeEvent.data.object
    const userId     = session.metadata?.user_id
    const customerId = session.customer

    if (!userId) {
      console.error('No user_id in session metadata')
      return { statusCode: 400, body: 'Missing user_id' }
    }

    const { error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id:            userId,
          plan:               'pro',
          stripe_customer_id: customerId,
          stripe_session_id:  session.id,
          status:             'active',
          started_at:         new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('Supabase error:', error.message)
      return { statusCode: 500, body: 'Database error' }
    }

    console.log(`Usuario ${userId} actualizado a PRO`)
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
