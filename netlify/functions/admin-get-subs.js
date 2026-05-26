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

  // Both queries use service role → bypass RLS entirely
  const [profilesRes, subsRes] = await Promise.all([
    supabase.from('profiles').select('id, name, email, role, created_at').neq('role', 'admin').order('created_at'),
    supabase.from('subscriptions').select('*'),
  ])

  if (profilesRes.error) {
    console.error('admin-get-subs profiles error:', profilesRes.error.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: profilesRes.error.message }) }
  }
  if (subsRes.error) {
    console.error('admin-get-subs subs error:', subsRes.error.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: subsRes.error.message }) }
  }

  const subMap = {}
  for (const s of (subsRes.data || [])) subMap[s.user_id] = s

  const rows = (profilesRes.data || []).map(p => {
    const s = subMap[p.id] || {}
    return {
      user_id:            p.id,
      name:               p.name  || '—',
      email:              p.email || '—',
      joined_at:          p.created_at,
      plan:               s.plan               || 'free',
      started_at:         s.started_at         || null,
      expires_at:         s.expires_at         || null,
      stripe_customer_id: s.stripe_customer_id || null,
    }
  })

  console.log(`admin-get-subs: ${rows.length} users for ${user.email}`)
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, rows }) }
}
