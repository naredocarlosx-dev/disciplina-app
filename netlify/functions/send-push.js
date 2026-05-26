const webpush = require('web-push')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'noreply@episodiouno.com'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
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

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not set — push skipped')
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, skipped: true }) }
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  // Accepts userId (single) or userIds (array)
  const userIds = body.userIds || (body.userId ? [body.userId] : null)
  const { title, pushBody, url = '/', tag } = body

  if (!userIds?.length || !title) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'userIds and title required' }) }
  }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('user_id, subscription')
    .in('user_id', userIds)

  if (error) {
    console.error('push_subscriptions fetch error:', error.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) }
  }

  const payload = JSON.stringify({ title, body: pushBody, url, tag })
  const results = []

  for (const row of subs || []) {
    try {
      await webpush.sendNotification(row.subscription, payload)
      results.push({ user_id: row.user_id, ok: true })
    } catch (err) {
      console.error(`Push failed for ${row.user_id}:`, err.message)
      // Remove stale subscription (410 = endpoint gone)
      if (err.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('user_id', row.user_id)
      }
      results.push({ user_id: row.user_id, ok: false, error: err.message })
    }
  }

  return {
    statusCode: 200,
    headers: HEADERS,
    body: JSON.stringify({ ok: true, sent: results.filter(r => r.ok).length, results }),
  }
}
