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

// Maps daysLeft to the email type handled by send-email.js
const DAY_TYPE_MAP = { 7: 'trial_warning_7', 3: 'trial_warning_3', 1: 'trial_warning_1', 0: 'trial_expired' }

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

    const emailType = DAY_TYPE_MAP[daysLeft]
    if (!emailType) continue

    try {
      const id = await callSendEmail({ type: emailType, email: p.email, name: p.name })
      console.log(`Trial email (${emailType}) sent to ${p.email} — id: ${id}`)
      results.push({ email: p.email, type: emailType, id })
    } catch (err) {
      console.error(`Failed to send to ${p.email}:`, err.message)
      results.push({ email: p.email, type: emailType, error: err.message })
    }
  }

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ ok: true, processed: results.length, results }),
  }
}
