const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase  = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function callSendEmail(payload) {
  const base = process.env.URL || 'http://localhost:8888'
  try {
    await fetch(`${base}/.netlify/functions/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('send-email call failed:', err.message)
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const sig    = event.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, secret)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }

  // ── checkout.session.completed → upgrade to PRO ───────────────────────────
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

    // Send payment_success email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', userId)
      .single()

    if (profile?.email) {
      let nextBillingDate = 'en 30 días'
      try {
        const stripeSubs = await stripe.subscriptions.list({ customer: customerId, limit: 1 })
        if (stripeSubs.data.length) {
          const ts = stripeSubs.data[0].current_period_end
          nextBillingDate = new Date(ts * 1000).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'long', year: 'numeric',
          })
        }
      } catch (_) {}
      await callSendEmail({ type: 'payment_success', email: profile.email, name: profile.name, nextBillingDate })
    }
  }

  // ── invoice.payment_failed → notify user ─────────────────────────────────
  if (stripeEvent.type === 'invoice.payment_failed') {
    const invoice    = stripeEvent.data.object
    const customerId = invoice.customer

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (sub?.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', sub.user_id)
        .single()

      if (profile?.email) {
        await callSendEmail({ type: 'payment_failed', email: profile.email, name: profile.name })
        console.log(`payment_failed email sent to ${profile.email}`)
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
