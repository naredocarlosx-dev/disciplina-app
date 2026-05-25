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

// ── HTML email helpers ─────────────────────────────────────────────────────
function wrap(inner) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Episodio Uno</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#111111;border:1px solid rgba(0,212,255,.18);border-radius:16px;overflow:hidden">
      <tr><td style="height:3px;background:linear-gradient(90deg,#00D4FF,rgba(0,212,255,.3))"></td></tr>
      <tr><td style="padding:36px 36px 32px">
        <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
          <tr>
            <td style="width:36px;height:36px;background:#00D4FF;border-radius:8px;text-align:center;vertical-align:middle;font-size:18px">⚡</td>
            <td style="padding-left:10px;font-size:17px;font-weight:700;color:#ffffff;letter-spacing:-.3px">Episodio Uno</td>
          </tr>
        </table>
        ${inner}
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

function buildTrialEmail(type, name) {
  const hi = name ? `Hola, ${name}` : 'Hola'

  if (type === 'warning_7') {
    return {
      subject: 'Tu prueba gratuita termina en 7 días ⏳',
      html: wrap(`
        <h1 style="font-size:22px;font-weight:700;color:#efefed;margin:0 0 8px;line-height:1.3">Tu prueba termina en 7 días</h1>
        <p style="font-size:14px;color:#8a8a85;margin:0 0 20px">${hi}</p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 16px">
          Tu período de prueba gratuito de <strong style="color:#efefed">Episodio Uno</strong> vence en
          <strong style="color:#00D4FF">7 días</strong>.
        </p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 28px">
          Activa el plan PRO ahora para no perder tus hábitos, tus rachas y todo tu progreso.
        </p>
        ${ctaButton('Activar PRO — $50 MXN/mes →')}
      `),
    }
  }

  if (type === 'warning_3') {
    return {
      subject: 'Solo 3 días de prueba gratuita restantes 🔔',
      html: wrap(`
        <h1 style="font-size:22px;font-weight:700;color:#efefed;margin:0 0 8px;line-height:1.3">Solo 3 días de prueba gratuita</h1>
        <p style="font-size:14px;color:#8a8a85;margin:0 0 20px">${hi}</p>
        <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px">
          <tr><td style="background:rgba(0,212,255,.06);border:1px solid rgba(0,212,255,.2);border-radius:10px;padding:14px 18px">
            <p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:rgba(0,212,255,.6)">Tu prueba vence en</p>
            <p style="margin:6px 0 0;font-size:28px;font-weight:700;color:#ffffff">3 días</p>
          </td></tr>
        </table>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 28px">
          No pierdas tus rachas ni tu progreso. Activa PRO y sigue construyendo tu disciplina sin interrupciones.
        </p>
        ${ctaButton('Activar PRO — $50 MXN/mes →')}
      `),
    }
  }

  if (type === 'warning_1') {
    return {
      subject: 'Mañana termina tu prueba — activa PRO hoy 🚨',
      html: wrap(`
        <h1 style="font-size:22px;font-weight:700;color:#efefed;margin:0 0 8px;line-height:1.3">Mañana termina tu prueba</h1>
        <p style="font-size:14px;color:#8a8a85;margin:0 0 20px">${hi}</p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 16px">
          Tu período de prueba gratuito termina <strong style="color:#ffffff">mañana</strong>.
          Después de eso necesitarás activar el plan PRO para continuar usando Episodio Uno.
        </p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 28px">
          Activa hoy y no pierdas ni un día de tus rachas.
        </p>
        ${ctaButton('Activar PRO ahora — $50 MXN/mes →')}
      `),
    }
  }

  if (type === 'expired') {
    return {
      subject: 'Tu prueba gratuita ha terminado — activa PRO para continuar',
      html: wrap(`
        <h1 style="font-size:22px;font-weight:700;color:#efefed;margin:0 0 8px;line-height:1.3">Tu prueba gratuita ha terminado</h1>
        <p style="font-size:14px;color:#8a8a85;margin:0 0 20px">${hi}</p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 16px">
          Gracias por probar <strong style="color:#efefed">Episodio Uno</strong> durante 3 meses.
          Tu acceso gratuito ha concluido.
        </p>
        <p style="font-size:15px;line-height:1.8;color:#8a8a85;margin:0 0 28px">
          Para continuar construyendo tus hábitos y no perder tu progreso, activa el plan PRO.
          Todos tus datos siguen ahí, esperándote.
        </p>
        ${ctaButton('Activar PRO — $50 MXN/mes →')}
        <p style="font-size:12px;color:#505050;margin:20px 0 0">
          ¿Tienes dudas? Responde este correo y con gusto te ayudamos.
        </p>
      `),
    }
  }

  return null
}

async function sendEmail(to, subject, html) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'Episodio Uno <noreply@episodiouno.com>',
      to:      [to],
      subject,
      html,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Resend error ${res.status}`)
  return data.id
}

// ── Handler ────────────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: HEADERS, body: '' }

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping trial expiry check')
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, skipped: true }) }
  }

  // Compute today's date at midnight UTC for day-level comparisons
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Fetch all active profiles that have a trial (not PRO via Stripe)
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, email, trial_end_date')
    .not('trial_end_date', 'is', null)
    .eq('status', 'active')

  if (error) {
    console.error('profiles fetch error:', error.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: error.message }) }
  }

  // Fetch subscriptions to exclude PRO users
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('user_id, plan')
    .eq('plan', 'pro')

  const proIds = new Set((subs || []).map(s => s.user_id))

  const results = []

  for (const p of profiles || []) {
    if (proIds.has(p.id)) continue // skip PRO users
    if (!p.email) continue

    const trialEnd = new Date(p.trial_end_date)
    trialEnd.setUTCHours(0, 0, 0, 0)
    const daysLeft = Math.round((trialEnd - today) / (1000 * 60 * 60 * 24))

    let emailType = null
    if (daysLeft === 7)  emailType = 'warning_7'
    else if (daysLeft === 3) emailType = 'warning_3'
    else if (daysLeft === 1) emailType = 'warning_1'
    else if (daysLeft === 0) emailType = 'expired'

    if (!emailType) continue

    try {
      const email = buildTrialEmail(emailType, p.name)
      if (!email) continue
      const id = await sendEmail(p.email, email.subject, email.html)
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
