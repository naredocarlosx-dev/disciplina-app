const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // ── Verify JWT → must be admin ─────────────────────────────────────────────
  const token = event.headers.authorization?.replace('Bearer ', '')
  if (!token) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Missing auth token' }) }

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Invalid token' }) }

  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'naredo.carlosx@gmail.com'
  if (callerProfile?.role !== 'admin' && user.email !== ADMIN_EMAIL) {
    return { statusCode: 403, headers: HEADERS, body: JSON.stringify({ error: 'Admin role required' }) }
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body
  try { body = JSON.parse(event.body || '{}') } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { action, targetUserId, targetEmail, targetName, months } = body
  if (!action || !targetUserId) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'action and targetUserId required' }) }
  }

  // ── Execute action ─────────────────────────────────────────────────────────
  try {
    const now = new Date().toISOString()

    // Check if subscription row exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', targetUserId)
      .maybeSingle()

    const upsert = async (values) => {
      const { error } = existing
        ? await supabase.from('subscriptions').update(values).eq('user_id', targetUserId)
        : await supabase.from('subscriptions').insert({ user_id: targetUserId, ...values })
      if (error) throw new Error(`Supabase: ${error.message}`)
    }

    if (action === 'activate') {
      await upsert({ plan: 'pro', status: 'active', started_at: now, expires_at: null })

    } else if (action === 'revoke') {
      await upsert({ plan: 'free', status: 'cancelled', expires_at: null })

    } else if (action === 'promo') {
      const numMonths = Math.max(1, parseInt(months, 10) || 1)
      const expires = new Date()
      expires.setDate(expires.getDate() + numMonths * 30)
      await upsert({ plan: 'pro', status: 'active', started_at: now, expires_at: expires.toISOString() })

    } else {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) }
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) }

  } catch (err) {
    console.error('admin-subscription error:', err)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
