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

// ── HTML email builder ─────────────────────────────────────────────────────
function wrap(inner) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Episodio Uno</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111111;border:1px solid rgba(0,212,255,.18);border-radius:16px;overflow:hidden">
      <!-- neon top bar -->
      <tr><td style="height:3px;background:linear-gradient(90deg,#00D4FF,rgba(0,212,255,.3))"></td></tr>
      <!-- content -->
      <tr><td style="padding:36px 36px 32px">
        <!-- logo -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
          <tr>
            <td style="width:36px;height:36px;background:#00D4FF;border-radius:8px;text-align:center;vertical-align:middle;font-size:18px">⚡</td>
            <td style="padding-left:10px;font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-.3px">Episodio Uno</td>
          </tr>
        </table>
        ${inner}
        <!-- footer -->
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:36px;border-top:1px solid #1c1c1c;padding-top:20px">
          <tr><td style="font-size:12px;color:#3a3a3a;line-height:1.6">
            Episodio Uno &middot; Tu sistema de disciplina personal<br/>
            <a href="https://episodiouno.com" style="color:#3a3a3a;text-decoration:none">episodiouno.com</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

function ctaButton(text) {
  return `<table cellpadding="0" cellspacing="0" style="margin-bottom:0">
    <tr><td style="border-radius:9px;background:#00D4FF">
      <a href="https://episodiouno.com"
         style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#000;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
        ${text}
      </a>
    </td></tr>
  </table>`
}

function buildEmail(action, name, months, expiresDate) {
  const hi = name ? `Hola, ${name}` : 'Hola'
  const features = ['Hábitos ilimitados','Metas de ahorro ilimitadas','Planificador de comidas','Rutinas de fitness','Inventario de cocina']

  if (action === 'activate') {
    return {
      subject: 'Bienvenido a Episodio Uno PRO',
      text: `${hi}\n\nTu cuenta ha sido actualizada a Plan PRO. Ahora tienes acceso completo a todas las funciones de Episodio Uno:\n\n${features.map(f => `• ${f}`).join('\n')}\n\nEmpieza tu episodio hoy: https://episodiouno.com\n\n— Episodio Uno`,
      html: wrap(`
        <h1 style="font-size:22px;font-weight:700;color:#efefed;margin:0 0 8px;line-height:1.3">Bienvenido a Plan PRO</h1>
        <p style="font-size:14px;color:#8a8a85;margin:0 0 20px">${hi}</p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 12px">
          Tu cuenta ha sido actualizada a
          <strong style="color:#00D4FF">Plan PRO</strong>.
          Ahora tienes acceso completo a todas las funciones de Episodio Uno:
        </p>
        <table cellpadding="0" cellspacing="0" style="margin:0 0 24px">
          ${features.map(f =>
            `<tr><td style="padding:5px 0;font-size:14px;color:#8a8a85">
               <span style="color:#00D4FF;margin-right:8px">+</span>${f}
             </td></tr>`
          ).join('')}
        </table>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 28px">Empieza tu episodio hoy.</p>
        ${ctaButton('Ir a mi app')}
      `),
    }
  }

  if (action === 'revoke') {
    return {
      subject: 'Tu plan PRO ha sido actualizado',
      text: `${hi}\n\nTu plan PRO ha sido desactivado. Tu cuenta ha vuelto al plan gratuito.\n\nSi tienes dudas escríbenos a noreply@episodiouno.com\n\n— Episodio Uno`,
      html: wrap(`
        <h1 style="font-size:22px;font-weight:700;color:#efefed;margin:0 0 8px;line-height:1.3">Plan actualizado</h1>
        <p style="font-size:14px;color:#8a8a85;margin:0 0 20px">${hi}</p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 16px">
          Tu plan PRO ha sido desactivado. Tu cuenta ha vuelto al
          <strong style="color:#efefed">plan gratuito</strong>.
        </p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 28px">
          Si tienes preguntas, contáctanos en
          <a href="mailto:noreply@episodiouno.com" style="color:#00D4FF;text-decoration:none">noreply@episodiouno.com</a>.
        </p>
      `),
    }
  }

  if (action === 'promo') {
    const numMonths = parseInt(months, 10) || 1
    const mesLabel  = numMonths === 1 ? '1 mes gratis' : `${numMonths} meses gratis`
    const expiresStr = expiresDate
      ? expiresDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
      : '—'

    return {
      subject: `Tienes ${mesLabel} de Episodio Uno PRO`,
      text: `${hi}\n\nTe hemos regalado ${mesLabel} de Plan PRO. Tu acceso premium estara activo hasta el ${expiresStr}.\n\nDisfruta todas las funciones: https://episodiouno.com\n\n— Episodio Uno`,
      html: wrap(`
        <h1 style="font-size:22px;font-weight:700;color:#efefed;margin:0 0 8px;line-height:1.3">${mesLabel} de Episodio Uno PRO</h1>
        <p style="font-size:14px;color:#8a8a85;margin:0 0 20px">${hi}</p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 20px">
          Te hemos regalado <strong style="color:#00D4FF">${mesLabel}</strong> de Plan PRO.
          Tu acceso premium estara activo hasta el
          <strong style="color:#ffffff">${expiresStr}</strong>.
        </p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px">
          <tr><td style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:14px 18px">
            <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#555">Acceso PRO activo hasta</p>
            <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#ffffff">${expiresStr}</p>
          </td></tr>
        </table>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 28px">Disfruta todas las funciones.</p>
        ${ctaButton('Ir a mi app')}
      `),
    }
  }

  return null
}

// ── Handler ────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Verify JWT → admin only
  const token = event.headers.authorization?.replace('Bearer ', '')
  if (!token) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Missing auth token' }) }

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Invalid token' }) }

  const { data: callerProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'naredo.carlosx@gmail.com'
  if (callerProfile?.role !== 'admin' && user.email !== ADMIN_EMAIL) {
    return { statusCode: 403, headers: HEADERS, body: JSON.stringify({ error: 'Admin role required' }) }
  }

  let body
  try { body = JSON.parse(event.body || '{}') } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { action, targetEmail, targetName, months, expiresAt } = body
  if (!action || !targetEmail) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'action and targetEmail required' }) }
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email skipped')
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, skipped: true }) }
  }

  const expiresDate = expiresAt ? new Date(expiresAt) : null
  const email = buildEmail(action, targetName, months, expiresDate)

  if (!email) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: `Unknown action: ${action}` }) }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'Episodio Uno <noreply@episodiouno.com>',
        to:      [targetEmail],
        subject: email.subject,
        html:    email.html,
        text:    email.text,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || `Resend error ${res.status}`)

    console.log(`Email sent (${action}) to ${targetEmail} — id: ${data.id}`)
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, id: data.id }) }

  } catch (err) {
    console.error('send-admin-email error:', err.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
