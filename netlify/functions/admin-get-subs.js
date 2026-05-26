const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const token = event.headers.authorization?.replace('Bearer ', '')
  if (!token) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Missing auth token' }) }

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Invalid token' }) }

  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'naredo.carlosx@gmail.com'
  if (callerProfile?.role !== 'admin' && user.email !== ADMIN_EMAIL) {
    return { statusCode: 403, headers: HEADERS, body: JSON.stringify({ error: 'Admin role required' }) }
  }

  const { data: subs, error } = await supabase.from('subscriptions').select('*')
  if (error) {
    console.error('admin-get-subs supabase error:', error.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) }
  }

  console.log(`admin-get-subs: returning ${(subs || []).length} subscriptions for ${user.email}`)
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, subs: subs || [] }) }
}
