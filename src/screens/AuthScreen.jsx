import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'
import LegalModal from '../components/LegalModal'

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

  /* glassmorphism y btn-auth neon definidos en index.css */
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

  const [tab,           setTab]           = useState('login')
  const [loading,       setLoading]       = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [legalModal, setLegalModal] = useState(null) // 'terms' | 'privacy' | null

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    setGoogleLoading(false)
  }

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
    if (!termsAccepted) { setRegError('Debes aceptar los términos para continuar.'); return }
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

            {/* Separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
              <span style={{ fontSize: 12, color: '#444', flexShrink: 0 }}>o</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                color: '#efefed', fontSize: 14, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color .2s, background .2s',
                opacity: googleLoading ? .6 : 1,
              }}
            >
              {/* Google G logo */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'Redirigiendo...' : 'Continuar con Google'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 14 }}>
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
                {/* Terms checkbox */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '4px 0 14px' }}>
                  <input
                    type="checkbox"
                    id="terms-check"
                    checked={termsAccepted}
                    onChange={e => { setTermsAccepted(e.target.checked); if (e.target.checked) setRegError('') }}
                    style={{ marginTop: 2, accentColor: '#00D4FF', flexShrink: 0, width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="terms-check" style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, cursor: 'pointer' }}>
                    Acepto los{' '}
                    <span
                      onClick={e => { e.preventDefault(); setLegalModal('terms') }}
                      style={{ color: '#00D4FF', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Términos y Condiciones
                    </span>
                    {' '}y la{' '}
                    <span
                      onClick={e => { e.preventDefault(); setLegalModal('privacy') }}
                      style={{ color: '#00D4FF', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      Política de Privacidad
                    </span>
                  </label>
                </div>

                <button className="btn-auth" onClick={handleRegister} disabled={loading}>
                  {loading
                    ? <span style={{ opacity: .6 }}>Creando cuenta...</span>
                    : <><i className="ti ti-user-plus" style={{ fontSize: 16 }}></i>Crear cuenta</>}
                </button>

                {/* Separator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
                  <span style={{ fontSize: 12, color: '#444', flexShrink: 0 }}>o</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
                </div>

                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
                    color: '#efefed', fontSize: 14, fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'border-color .2s, background .2s',
                    opacity: googleLoading ? .6 : 1,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  {googleLoading ? 'Redirigiendo...' : 'Continuar con Google'}
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
    {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </>
  )
}
