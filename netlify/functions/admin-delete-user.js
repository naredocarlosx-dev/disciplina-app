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

  // ── Verify JWT → caller must be admin ──────────────────────────────────────
  const token = event.headers.authorization?.replace('Bearer ', '')
  if (!token) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Missing auth token' }) }

  const { data: { user: caller }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !caller) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Invalid token' }) }

  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', caller.id).single()
  if (callerProfile?.role !== 'admin') {
    return { statusCode: 403, headers: HEADERS, body: JSON.stringify({ error: 'Admin role required' }) }
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let body
  try { body = JSON.parse(event.body || '{}') } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { targetUserId } = body
  if (!targetUserId) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'targetUserId required' }) }
  }

  // ── Safety checks ──────────────────────────────────────────────────────────
  if (targetUserId === caller.id) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'No puedes eliminarte a ti mismo' }) }
  }

  const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', targetUserId).single()
  if (targetProfile?.role === 'admin') {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'No se puede eliminar a otro administrador' }) }
  }

  // ── Delete in safe order ───────────────────────────────────────────────────
  // Delete related data first so FK constraints don't block auth deletion
  await Promise.allSettled([
    supabase.from('subscriptions').delete().eq('user_id', targetUserId),
    supabase.from('habit_logs').delete().eq('user_id', targetUserId),
    supabase.from('workout_logs').delete().eq('user_id', targetUserId),
    supabase.from('saving_contributions').delete().eq('user_id', targetUserId),
  ])

  await Promise.allSettled([
    supabase.from('habits').delete().eq('user_id', targetUserId),
    supabase.from('savings').delete().eq('user_id', targetUserId),
    supabase.from('workouts').delete().eq('user_id', targetUserId),
    supabase.from('meals').delete().eq('user_id', targetUserId),
    supabase.from('inventory').delete().eq('user_id', targetUserId),
    supabase.from('inventory_logs').delete().eq('user_id', targetUserId),
  ])

  // Delete profile before auth.users in case of RESTRICT FK
  await supabase.from('profiles').delete().eq('id', targetUserId)

  // Delete from auth.users — requires service role
  const { error: deleteErr } = await supabase.auth.admin.deleteUser(targetUserId)
  if (deleteErr) {
    console.error('auth.admin.deleteUser failed:', deleteErr.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: deleteErr.message }) }
  }

  console.log(`User ${targetUserId} deleted by admin ${caller.id}`)
  return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) }
}
