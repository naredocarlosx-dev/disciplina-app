const HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

// ── Shared HTML template ───────────────────────────────────────────────────
function wrap(inner, footerExtra = '') {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Episodio Uno</title>
</head>
<body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">

<!-- Wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;padding:40px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

  <!-- Header -->
  <tr><td style="background:#000000;padding:0 0 24px">
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width:36px;height:36px;background:#00D4FF;border-radius:9px;text-align:center;vertical-align:middle;font-size:20px;line-height:36px">⚡</td>
        <td style="padding-left:10px;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;vertical-align:middle">Episodio Uno</td>
      </tr>
    </table>
  </td></tr>

  <!-- Card -->
  <tr><td style="background:#111111;border:1px solid rgba(0,212,255,0.18);border-radius:16px;overflow:hidden">
    <!-- Neon top bar -->
    <div style="height:3px;background:linear-gradient(90deg,#00D4FF,rgba(0,212,255,0.3))"></div>
    <!-- Content -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:36px 36px 32px">
        ${inner}
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:28px 4px 0;font-size:12px;color:#3a3a3a;line-height:1.8;text-align:center">
    © 2026 Episodio Uno &nbsp;·&nbsp;
    <a href="https://episodiouno.com" style="color:#3a3a3a;text-decoration:none">episodiouno.com</a>
    &nbsp;·&nbsp;
    <a href="mailto:noreply@episodiouno.com?subject=Cancelar%20suscripci%C3%B3n" style="color:#3a3a3a;text-decoration:none">Cancelar suscripción</a>
    ${footerExtra}
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function ctaButton(text, href = 'https://episodiouno.com') {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px">
    <tr><td style="border-radius:8px;background:#00D4FF">
      <a href="${href}"
         style="display:inline-block;padding:13px 32px;font-size:14px;font-weight:700;color:#000000;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;border-radius:8px">
        ${text}
      </a>
    </td></tr>
  </table>`
}

function h1(text) {
  return `<h1 style="font-size:22px;font-weight:700;color:#efefed;margin:0 0 8px;line-height:1.3;letter-spacing:-0.3px">${text}</h1>`
}
function sub(text) {
  return `<p style="font-size:14px;color:#8a8a85;margin:0 0 20px;line-height:1.5">${text}</p>`
}
function body(text) {
  return `<p style="font-size:15px;color:#8a8a85;line-height:1.8;margin:0 0 12px">${text}</p>`
}
function neon(text) {
  return `<strong style="color:#00D4FF">${text}</strong>`
}
function highlight(label, value) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0">
    <tr><td style="background:rgba(0,212,255,0.06);border:1px solid rgba(0,212,255,0.2);border-radius:10px;padding:14px 18px">
      <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(0,212,255,0.6)">${label}</p>
      <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:#ffffff">${value}</p>
    </td></tr>
  </table>`
}

// ── Email builders ─────────────────────────────────────────────────────────
function buildEmail(type, { name, nextBillingDate } = {}) {
  const hi = name ? `Hola, ${name}` : 'Hola'

  // 1. Bienvenida
  if (type === 'welcome') {
    return {
      subject: '¡Bienvenido a Episodio Uno! 🚀',
      html: wrap(`
        ${h1('¡Bienvenido a tu nuevo episodio!')}
        ${sub(hi)}
        ${body(`Tu cuenta en ${neon('Episodio Uno')} está lista. Aquí empieza tu sistema de disciplina personal.`)}
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0">
          ${[
            ['🔥', 'Hábitos diarios', 'Crea y rastrea hábitos. Tu racha crece cada día.'],
            ['💰', 'Metas de ahorro', 'Define cuánto quieres ahorrar y el sistema te ayuda a llegar.'],
            ['💪', 'Fitness y comidas', 'Planifica tus rutinas y tu alimentación de la semana.'],
            ['📦', 'Inventario PRO', 'Controla tu stock de cocina y recibe alertas de stock crítico.'],
          ].map(([icon, title, desc]) => `
            <tr><td style="padding:8px 0;vertical-align:top">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width:28px;vertical-align:middle;font-size:18px">${icon}</td>
                  <td style="padding-left:10px;vertical-align:middle">
                    <span style="font-size:14px;font-weight:600;color:#efefed">${title}</span>
                    <span style="font-size:13px;color:#555;padding-left:8px">${desc}</span>
                  </td>
                </tr>
              </table>
            </td></tr>
          `).join('')}
        </table>
        ${body(`Tienes ${neon('3 meses gratis')} para explorar todo. Sin tarjeta de crédito.`)}
        ${ctaButton('Ir a mi app →')}
      `),
    }
  }

  // 2. Pago exitoso
  if (type === 'payment_success') {
    const billing = nextBillingDate || 'en 30 días'
    return {
      subject: '¡Tu plan PRO está activo! ✅',
      html: wrap(`
        ${h1('¡Plan PRO activado!')}
        ${sub(hi)}
        ${body(`Tu pago de ${neon('$49 MXN')} fue procesado exitosamente. Ahora tienes acceso completo a todas las funciones de Episodio Uno.`)}
        ${highlight('Próximo cobro', billing)}
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 4px">
          ${['Hábitos ilimitados','Metas de ahorro ilimitadas','Inventario de cocina PRO','Acceso a funciones nuevas primero','Soporte prioritario'].map(f =>
            `<tr><td style="padding:5px 0;font-size:14px;color:#8a8a85">
               <span style="color:#00D4FF;margin-right:8px">✓</span>${f}
             </td></tr>`
          ).join('')}
        </table>
        ${ctaButton('Ir a mi app →')}
      `),
    }
  }

  // 3. Pago fallido
  if (type === 'payment_failed') {
    return {
      subject: 'Problema con tu pago ⚠️',
      html: wrap(`
        ${h1('No pudimos procesar tu pago')}
        ${sub(hi)}
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px">
          <tr><td style="background:rgba(224,85,85,0.08);border:1px solid rgba(224,85,85,0.25);border-radius:10px;padding:14px 18px">
            <p style="margin:0;font-size:13px;color:#e05555;line-height:1.7">
              ⚠️&nbsp; No pudimos procesar tu pago de <strong>$49 MXN</strong>. Tu acceso PRO podría verse afectado si no actualizas tu método de pago.
            </p>
          </td></tr>
        </table>
        ${body('Esto puede ocurrir por fondos insuficientes, una tarjeta vencida o un bloqueo bancario.')}
        ${body(`Actualiza tu método de pago para mantener tu acceso ${neon('PRO')} sin interrupciones.`)}
        ${ctaButton('Actualizar método de pago →')}
        <p style="font-size:12px;color:#505050;margin:20px 0 0;line-height:1.6">¿Necesitas ayuda? Responde este correo o escríbenos a
          <a href="mailto:noreply@episodiouno.com" style="color:#00D4FF;text-decoration:none">noreply@episodiouno.com</a>
        </p>
      `),
    }
  }

  // 4. Trial — 7 días
  if (type === 'trial_warning_7') {
    return {
      subject: 'Tu prueba gratuita termina en 7 días ⏳',
      html: wrap(`
        ${h1('Tu prueba termina en 7 días')}
        ${sub(hi)}
        ${body(`Tu período de prueba gratuito de ${neon('Episodio Uno')} vence en ${neon('7 días')}.`)}
        ${body('Activa el plan PRO para seguir construyendo tu disciplina sin interrupciones. Conservas todos tus hábitos, rachas y progreso.')}
        ${highlight('Precio del plan PRO', '$49 MXN / mes')}
        ${body('Cancela cuando quieras. Sin compromisos.')}
        ${ctaButton('Activar PRO — $49 MXN/mes →')}
      `),
    }
  }

  // 5. Trial — 3 días
  if (type === 'trial_warning_3') {
    return {
      subject: 'Solo 3 días de prueba — no pierdas tu progreso 🔥',
      html: wrap(`
        ${h1('Solo 3 días de prueba gratuita')}
        ${sub(hi)}
        ${highlight('Tu prueba vence en', '3 días')}
        ${body(`Has construido algo real estos meses. No dejes que se pierda.`)}
        ${body(`Activa ${neon('PRO')} hoy y mantén tus rachas, hábitos y todo tu progreso intacto.`)}
        ${ctaButton('Activar PRO — $49 MXN/mes →')}
        <p style="font-size:12px;color:#505050;margin:16px 0 0">Cancela cuando quieras. Sin compromisos.</p>
      `),
    }
  }

  // 6. Trial — 1 día
  if (type === 'trial_warning_1') {
    return {
      subject: 'Mañana termina tu prueba — activa PRO hoy',
      html: wrap(`
        ${h1('Mañana termina tu prueba')}
        ${sub(hi)}
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px">
          <tr><td style="background:rgba(255,184,0,0.06);border:1px solid rgba(255,184,0,0.25);border-radius:10px;padding:14px 18px">
            <p style="margin:0;font-size:13px;color:#FFB800;line-height:1.7">
              ⏰&nbsp; Tu acceso gratuito termina <strong>mañana</strong>. Después necesitarás el plan PRO para seguir usando la app.
            </p>
          </td></tr>
        </table>
        ${body(`Activa ${neon('PRO hoy')} y no pierdas ni un día de tus rachas.`)}
        ${body('Todos tus datos seguirán ahí, esperándote.')}
        ${ctaButton('Activar PRO ahora — $49 MXN/mes →')}
        <p style="font-size:12px;color:#505050;margin:16px 0 0">Cancela cuando quieras. Sin compromisos.</p>
      `),
    }
  }

  // 7. Trial expirado
  if (type === 'trial_expired') {
    return {
      subject: 'Tu prueba gratuita ha terminado',
      html: wrap(`
        ${h1('Tu prueba gratuita ha terminado')}
        ${sub(hi)}
        ${body(`Gracias por probar ${neon('Episodio Uno')} durante 3 meses.`)}
        ${body('Para continuar construyendo tus hábitos y mantener todo tu progreso, activa el plan PRO.')}
        ${body('Todos tus datos siguen guardados, esperando que regreses.')}
        ${ctaButton('Activar PRO — $49 MXN/mes →')}
        <p style="font-size:12px;color:#505050;margin:20px 0 0;line-height:1.6">
          ¿Tienes preguntas? Responde este correo y con gusto te ayudamos.
        </p>
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

  let body
  try { body = JSON.parse(event.body || '{}') } catch {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { type, email, name, nextBillingDate } = body
  if (!type || !email) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'type and email required' }) }
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — email skipped')
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, skipped: true }) }
  }

  const emailContent = buildEmail(type, { name, nextBillingDate })
  if (!emailContent) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: `Unknown email type: ${type}` }) }
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
        to:      [email],
        subject: emailContent.subject,
        html:    emailContent.html,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || `Resend error ${res.status}`)

    console.log(`Email [${type}] sent to ${email} — id: ${data.id}`)
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true, id: data.id }) }

  } catch (err) {
    console.error('send-email error:', err.message)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
