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

async function sendPromoEmail(email, name, months, expiresDate) {
  if (!process.env.RESEND_API_KEY || !email) return

  const expiresStr = expiresDate.toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const mesLabel = months === 1 ? '1 mes gratis' : `${months} meses gratis`
  const greeting = name ? `¡Hola, ${name}!` : '¡Hola!'

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Episodio Uno <noreply@episodiouno.com>',
      to:   [email],
      subject: `¡Tienes ${mesLabel} de Episodio Uno PRO!`,
      html: `
<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif">
<div style="max-width:520px;margin:40px auto;background:#111;border:1px solid rgba(0,212,255,.18);border-radius:16px;padding:40px 36px">
  <div style="font-size:40px;margin-bottom:20px">⚡</div>
  <h1 style="font-size:22px;font-weight:700;color:#efefed;margin:0 0 14px">${greeting}</h1>
  <p style="font-size:15px;line-height:1.75;color:#8a8a85;margin:0 0 8px">
    Tienes <strong style="color:#00D4FF">${mesLabel}</strong> de
    <strong style="color:#fff">Episodio Uno PRO</strong>.
  </p>
  <p style="font-size:15px;line-height:1.75;color:#8a8a85;margin:0 0 28px">
    Disfruta todas las funciones premium hasta el
    <strong style="color:#fff">${expiresStr}</strong>.
  </p>
  <a href="https://episodiouno.com"
     style="display:inline-block;background:#00D4FF;color:#000;font-weight:700;padding:13px 28px;border-radius:9px;text-decoration:none;font-size:14px;letter-spacing:.01em">
    Ir a mi app →
  </a>
  <p style="font-size:12px;color:#3a3a3a;margin-top:36px;border-top:1px solid #1c1c1c;padding-top:20px">
    Episodio Uno · Tu sistema de disciplina personal<br/>
    <a href="https://episodiouno.com" style="color:#3a3a3a">episodiouno.com</a>
  </p>
</div>
</body></html>`,
    }),
  }).catch(err => console.warn('Resend email failed:', err.message))
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
  if (callerProfile?.role !== 'admin') {
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

    if (action === 'activate') {
      if (existing) {
        await supabase.from('subscriptions')
          .update({ plan: 'pro', status: 'active', started_at: now, expires_at: null })
          .eq('user_id', targetUserId)
      } else {
        await supabase.from('subscriptions')
          .insert({ user_id: targetUserId, plan: 'pro', status: 'active', started_at: now })
      }

    } else if (action === 'revoke') {
      if (existing) {
        await supabase.from('subscriptions')
          .update({ plan: 'free', status: 'cancelled', expires_at: null })
          .eq('user_id', targetUserId)
      } else {
        await supabase.from('subscriptions')
          .insert({ user_id: targetUserId, plan: 'free', status: 'cancelled' })
      }

    } else if (action === 'promo') {
      const numMonths = Math.max(1, parseInt(months, 10) || 1)
      const expires = new Date()
      expires.setDate(expires.getDate() + numMonths * 30)

      if (existing) {
        await supabase.from('subscriptions')
          .update({ plan: 'pro', status: 'active', started_at: now, expires_at: expires.toISOString() })
          .eq('user_id', targetUserId)
      } else {
        await supabase.from('subscriptions')
          .insert({ user_id: targetUserId, plan: 'pro', status: 'active', started_at: now, expires_at: expires.toISOString() })
      }

      await sendPromoEmail(targetEmail, targetName, numMonths, expires)

    } else {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) }
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) }

  } catch (err) {
    console.error('admin-subscription error:', err)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
