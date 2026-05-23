import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'

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
  )
}
