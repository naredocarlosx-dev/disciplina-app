const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
}

// Maps daysLeft to email type and push copy
const DAY_TYPE_MAP = {
  7: { email: 'trial_warning_7', pushTitle: 'Tu prueba termina en 7 días ⏳', pushBody: 'Activa PRO para no perder tus rachas y hábitos.' },
  3: { email: 'trial_warning_3', pushTitle: 'Solo 3 días de prueba 🔥',        pushBody: 'No pierdas tu progreso — activa PRO hoy.' },
  1: { email: 'trial_warning_1', pushTitle: 'Mañana termina tu prueba ⚠️',     pushBody: 'Último aviso — activa PRO para continuar.' },
  0: { email: 'trial_expired',   pushTitle: 'Tu prueba ha terminado',           pushBody: 'Activa PRO para volver a usar Episodio Uno.' },
}

async function callSendEmail(payload) {
  const base = process.env.URL || 'http://localhost:8888'
  const res = await fetch(`${base}/.netlify/functions/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `send-email error ${res.status}`)
  return data.id
}

async function callSendPush(userId, title, pushBody) {
  const base = process.env.URL || 'http://localhost:8888'
  try {
    await fetch(`${base}/.netlify/functions/send-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: [userId], title, pushBody, url: '/', tag: 'trial' }),
    })
  } catch (err) {
    console.error('send-push failed:', err.message)
  }
}

// ── Handler ────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping trial expiry check')
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, skipped: true }) }
  }

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, email, trial_end_date')
    .not('trial_end_date', 'is', null)
    .eq('status', 'active')

  if (error) {
    console.error('profiles fetch error:', error.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) }
  }

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('plan', 'pro')

  const proIds = new Set((subs || []).map(s => s.user_id))
  const results = []

  for (const p of profiles || []) {
    if (proIds.has(p.id) || !p.email) continue

    const trialEnd = new Date(p.trial_end_date)
    trialEnd.setUTCHours(0, 0, 0, 0)
    const daysLeft = Math.round((trialEnd - today) / (1000 * 60 * 60 * 24))

    const typeMap = DAY_TYPE_MAP[daysLeft]
    if (!typeMap) continue

    try {
      const id = await callSendEmail({ type: typeMap.email, email: p.email, name: p.name })
      console.log(`Trial email (${typeMap.email}) sent to ${p.email} — id: ${id}`)
      // Also send push notification (fire-and-forget)
      callSendPush(p.id, typeMap.pushTitle, typeMap.pushBody)
      results.push({ email: p.email, type: typeMap.email, id })
    } catch (err) {
      console.error(`Failed to send to ${p.email}:`, err.message)
      results.push({ email: p.email, type: typeMap.email, error: err.message })
    }
  }

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ ok: true, processed: results.length, results }),
  }
}
