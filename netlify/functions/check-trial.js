const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { email } = body
  if (!email) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'email required' }) }
  }

  const { data } = await supabase
    .from('profiles')
    .select('trial_used')
    .ilike('email', email.trim())
    .eq('trial_used', true)
    .maybeSingle()

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ trialUsed: !!data }),
  }
}
