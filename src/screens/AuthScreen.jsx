import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'

export default function AuthScreen() {
  const { doLogin, doRegister, setScreen } = useContext(AppContext)

  const [tab,        setTab]        = useState('login')
  const [loading,    setLoading]    = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass,  setLoginPass]  = useState('')
  const [loginError, setLoginError] = useState('')

  const [regName,  setRegName]  = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass,  setRegPass]  = useState('')
  const [regPass2, setRegPass2] = useState('')
  const [regError, setRegError] = useState('')

  const handleLogin = async () => {
    if (loading) return
    setLoading(true)
    setLoginError('')
    const result = await doLogin(loginEmail.trim(), loginPass)
    if (!result.ok) setLoginError(result.error)
    setLoading(false)
  }

  const handleRegister = async () => {
    if (loading) return
    setLoading(true)
    setRegError('')
    const result = await doRegister({ name: regName.trim(), email: regEmail.trim(), pass: regPass, pass2: regPass2 })
    if (!result.ok) setRegError(result.error)
    setLoading(false)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark"><i className="ti ti-bolt"></i></div>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.3px' }}>Disciplina</span>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>Iniciar sesión</button>
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
          </div>
        )}

        {tab === 'register' && (
          <div>
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
          </div>
        )}

        <span className="auth-back" onClick={() => setScreen('landing')}>
          <i className="ti ti-arrow-left" style={{ fontSize: 13, verticalAlign: '-1px' }}></i> Volver al inicio
        </span>
      </div>
    </div>
  )
}
