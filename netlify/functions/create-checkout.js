const Stripe = require('stripe')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let userId
  try {
    const body = JSON.parse(event.body || '{}')
    userId = body.userId
  } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  if (!userId) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'userId is required' }) }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price:    process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      // user_id viaja en metadata para recuperarlo en el webhook
      metadata: { user_id: userId },
      subscription_data: {
        metadata: { user_id: userId },
      },
      success_url: 'https://episodiouno.com/success',
      cancel_url:  'https://episodiouno.com/cancel',
    })

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    console.error('Stripe error:', err.message)
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
