import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'

/* ─── Futuristic background (same system as Landing.jsx) ─────────────────── */
const AUTH_CSS = `
  .auth-bg {
    position: fixed; inset: 0; z-index: 0;
    background: #000; overflow: hidden; pointer-events: none;
  }
  .auth-bg__glow {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 65% 50% at 50% 38%, rgba(0,212,255,.065) 0%, transparent 65%);
    animation: auth-glow 7s ease-in-out infinite;
  }
  @keyframes auth-glow { 0%,100% { opacity:.6; } 50% { opacity:1; } }
  .auth-bg__grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(0,212,255,.028) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,.028) 1px, transparent 1px);
    background-size: 80px 80px;
  }
  .auth-bg__grid-persp {
    position: absolute; bottom: -8%; left: -130%; right: -130%; height: 52%;
    background-image:
      linear-gradient(rgba(0,212,255,.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,212,255,.055) 1px, transparent 1px);
    background-size: 80px 80px;
    transform: perspective(340px) rotateX(62deg);
    transform-origin: center bottom;
    animation: auth-grid-scroll 10s linear infinite;
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 78%);
    mask-image: linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 78%);
  }
  @keyframes auth-grid-scroll {
    from { background-position: center 0; } to { background-position: center 80px; }
  }
  @keyframes auth-twinkle-xl { 0%,100%{opacity:.18;transform:scale(1);}  50%{opacity:.75;transform:scale(1.25);} }
  @keyframes auth-twinkle-lg { 0%,100%{opacity:.1; transform:scale(1);}  50%{opacity:.55;transform:scale(1.45);} }
  @keyframes auth-twinkle-md { 0%,100%{opacity:.06;transform:scale(1);}  50%{opacity:.35;transform:scale(1.7);}  }
  @keyframes auth-twinkle-sm { 0%,100%{opacity:.03;transform:scale(1);}  50%{opacity:.22;transform:scale(2);}    }
  .auth-bg__p { position:absolute; border-radius:50%; background:#00D4FF; }
  .auth-bg__p--xl { box-shadow:0 0 16px 4px rgba(0,212,255,.55),0 0 32px 8px rgba(0,212,255,.25),0 0 50px 12px rgba(0,212,255,.1); filter:blur(1.5px); animation:auth-twinkle-xl ease-in-out infinite; }
  .auth-bg__p--lg { box-shadow:0 0 10px 2px rgba(0,212,255,.5),0 0 20px 5px rgba(0,212,255,.2); filter:blur(0.5px); animation:auth-twinkle-lg ease-in-out infinite; }
  .auth-bg__p--md { box-shadow:0 0 6px rgba(0,212,255,.45); animation:auth-twinkle-md ease-in-out infinite; }
  .auth-bg__p--sm { box-shadow:0 0 3px rgba(0,212,255,.35); animation:auth-twinkle-sm ease-in-out infinite; }

  /* ── Card glassmorphism ── */
  .auth-wrap { background: transparent !important; position: relative; z-index: 1; }
  .auth-card {
    background: rgba(0,0,0,.55) !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    border: 1px solid rgba(0,212,255,.18) !important;
    box-shadow: 0 0 40px rgba(0,212,255,.07), 0 24px 64px rgba(0,0,0,.6) !important;
  }

  /* ── Botones neon ── */
  .btn-auth {
    background: #00D4FF !important; color: #000 !important; font-weight: 700 !important;
    box-shadow: 0 0 18px rgba(0,212,255,.35) !important;
  }
  .btn-auth:hover:not(:disabled) {
    background: #19daff !important;
    box-shadow: 0 0 28px rgba(0,212,255,.55) !important;
  }
  .btn-auth:disabled {
    background: rgba(0,212,255,.35) !important;
    color: rgba(0,0,0,.5) !important;
    box-shadow: none !important;
  }
`

const AUTH_TIERS = [
  { size: 12, cls: 'xl', minDur: 5,   step: 0.6  },
  { size: 8,  cls: 'lg', minDur: 3,   step: 0.45 },
  { size: 5,  cls: 'md', minDur: 1.8, step: 0.35 },
  { size: 3,  cls: 'sm', minDur: 1.2, step: 0.25 },
]
const AUTH_PARTICLES = Array.from({ length: 50 }, (_, i) => {
  const t = AUTH_TIERS[i % 4]
  return {
    left: `${(i * 17 + 3) % 100}%`,
    top:  `${(i * 31 + 7) % 100}%`,
    size: t.size,
    cls:  `auth-bg__p auth-bg__p--${t.cls}`,
    dur:  `${(t.minDur + (Math.floor(i / 4) % 5) * t.step).toFixed(1)}s`,
    del:  `-${((i * 0.61) % t.minDur).toFixed(1)}s`,
  }
})

export default function AuthScreen() {
  const { doLogin, doRegister, setScreen } = useContext(AppContext)
  const { sendPasswordReset }              = useAuth()

  const [tab,        setTab]        = useState('login')
  const [loading,    setLoading]    = useState(false)

  const [forgotEmail,   setForgotEmail]   = useState('')
  const [forgotMsg,     setForgotMsg]     = useState(null) // { text, ok }

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass,  setLoginPass]  = useState('')
  const [loginError, setLoginError] = useState('')

  const [regName,    setRegName]    = useState('')
  const [regEmail,   setRegEmail]   = useState('')
  const [regPass,    setRegPass]    = useState('')
  const [regPass2,   setRegPass2]   = useState('')
  const [regError,   setRegError]   = useState('')
  const [regConfirm, setRegConfirm] = useState(false)

  const handleLogin = async () => {
    if (loading) return
    setLoading(true)
    setLoginError('')
    const result = await doLogin(loginEmail.trim(), loginPass)
    if (!result.ok) setLoginError(result.error)
    setLoading(false)
  }

  const handleForgot = async () => {
    if (loading || !forgotEmail.trim()) return
    setLoading(true)
    setForgotMsg(null)
    const result = await sendPasswordReset(forgotEmail)
    setForgotMsg(result.ok
      ? { text: 'Te enviamos un correo con instrucciones para restablecer tu contraseña.', ok: true }
      : { text: result.error, ok: false }
    )
    setLoading(false)
  }

  const handleRegister = async () => {
    if (loading) return
    setLoading(true)
    setRegError('')
    setRegConfirm(false)
    try {
      const result = await doRegister({ name: regName.trim(), email: regEmail.trim(), pass: regPass, pass2: regPass2 })
      if (result.needsConfirmation) setRegConfirm(true)
      else if (!result.ok) setRegError(result.error)
    } catch {
      setRegConfirm(true)
    }
    setLoading(false)
  }

  return (
    <>
    <style>{AUTH_CSS}</style>
    <div className="auth-bg">
      <div className="auth-bg__glow" />
      <div className="auth-bg__grid" />
      <div className="auth-bg__grid-persp" />
      {AUTH_PARTICLES.map((p, i) => (
        <div key={i} className={p.cls} style={{
          left: p.left, top: p.top,
          width: p.size + 'px', height: p.size + 'px',
          animationDuration: p.dur, animationDelay: p.del,
        }} />
      ))}
    </div>

    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <EpisodioUnoLogo dark width={180} />
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login'    ? ' active' : ''}`} onClick={() => setTab('login')}>Iniciar sesión</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>Crear cuenta</button>
        </div>

        {tab === 'login' && (
          <div>
            {loginError && <div className="auth-error">{loginError}</div>}
            <div className="form-row-m">
              <label className="form-label-m">Correo electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="tu@correo.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                disabled={loading}
              />
            </div>
            <div className="form-row-m">
              <label className="form-label-m">Contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                disabled={loading}
              />
            </div>
            <button className="btn-auth" onClick={handleLogin} disabled={loading}>
              {loading
                ? <span style={{ opacity: .6 }}>Entrando...</span>
                : <><i className="ti ti-login" style={{ fontSize: 16 }}></i>Entrar</>}
            </button>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span
                onClick={() => { setTab('forgot'); setForgotMsg(null); setForgotEmail('') }}
                style={{ fontSize: 13, color: 'var(--text2)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                ¿Olvidaste tu contraseña?
              </span>
            </div>
          </div>
        )}

        {tab === 'forgot' && (
          <div>
            {forgotMsg && (
              <div style={{
                padding: '10px 12px', borderRadius: 'var(--radius-xs)', fontSize: 13, marginBottom: 16,
                background: forgotMsg.ok ? 'var(--green-light)' : 'var(--red-light)',
                color:      forgotMsg.ok ? 'var(--green-dark)'  : 'var(--red)',
                border:     `1px solid ${forgotMsg.ok ? 'rgba(29,158,117,.3)' : 'rgba(224,85,85,.3)'}`,
              }}>
                <i className={`ti ti-${forgotMsg.ok ? 'circle-check' : 'alert-circle'}`} style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 6 }}></i>
                {forgotMsg.text}
              </div>
            )}
            {!forgotMsg?.ok && (
              <>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
                  Escribe tu correo y te enviaremos instrucciones para restablecer tu contraseña.
                </div>
                <div className="form-row-m">
                  <label className="form-label-m">Correo electrónico</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="tu@correo.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleForgot()}
                    disabled={loading}
                  />
                </div>
                <button className="btn-auth" onClick={handleForgot} disabled={loading || !forgotEmail.trim()}>
                  {loading
                    ? <span style={{ opacity: .6 }}>Enviando...</span>
                    : <><i className="ti ti-mail" style={{ fontSize: 16 }}></i>Enviar instrucciones</>}
                </button>
              </>
            )}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span
                onClick={() => setTab('login')}
                style={{ fontSize: 13, color: 'var(--text2)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Volver al inicio de sesión
              </span>
            </div>
          </div>
        )}

        {tab === 'register' && (
          <div>
            {regConfirm ? (
              <>
                <div style={{
                  padding: '16px', borderRadius: 'var(--radius-xs)', fontSize: 13, lineHeight: 1.7,
                  background: 'rgba(0,212,255,.08)', color: 'var(--text1)',
                  border: '1px solid rgba(0,212,255,.3)', marginBottom: 16,
                }}>
                  <i className="ti ti-mail-check" style={{ fontSize: 20, display: 'block', marginBottom: 8, color: '#00D4FF' }}></i>
                  Revisa la bandeja de entrada de tu correo para iniciar sesión.
                </div>
                <button className="btn-auth" onClick={() => setTab('login')}>
                  <i className="ti ti-login" style={{ fontSize: 16 }}></i>Volver al inicio de sesión
                </button>
              </>
            ) : (
              <>
                {regError && <div className="auth-error">{regError}</div>}
                <div className="form-row-m">
                  <label className="form-label-m">Nombre completo</label>
                  <input type="text" className="form-input" placeholder="Tu nombre" value={regName} onChange={e => setRegName(e.target.value)} disabled={loading} />
                </div>
                <div className="form-row-m">
                  <label className="form-label-m">Correo electrónico</label>
                  <input type="email" className="form-input" placeholder="tu@correo.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} disabled={loading} />
                </div>
                <div className="form-row-m">
                  <label className="form-label-m">Contraseña</label>
                  <input type="password" className="form-input" placeholder="Mínimo 6 caracteres" value={regPass} onChange={e => setRegPass(e.target.value)} disabled={loading} />
                </div>
                <div className="form-row-m">
                  <label className="form-label-m">Confirmar contraseña</label>
                  <input type="password" className="form-input" placeholder="Repite tu contraseña" value={regPass2} onChange={e => setRegPass2(e.target.value)} disabled={loading} />
                </div>
                <button className="btn-auth" onClick={handleRegister} disabled={loading}>
                  {loading
                    ? <span style={{ opacity: .6 }}>Creando cuenta...</span>
                    : <><i className="ti ti-user-plus" style={{ fontSize: 16 }}></i>Crear cuenta</>}
                </button>
              </>
            )}
          </div>
        )}

        <span className="auth-back" onClick={() => setScreen('landing')}>
          <i className="ti ti-arrow-left" style={{ fontSize: 13, verticalAlign: '-1px' }}></i> Volver al inicio
        </span>
      </div>
    </div>
    </>
  )
}
