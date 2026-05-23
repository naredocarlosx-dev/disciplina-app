import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ResetPasswordScreen() {
  const { confirmNewPassword } = useAuth()

  const [pass,    setPass]    = useState('')
  const [pass2,   setPass2]   = useState('')
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState(null) // { text, ok }

  const handleSubmit = async () => {
    if (loading) return
    if (pass.length < 6) {
      setMsg({ text: 'La contraseña debe tener al menos 6 caracteres.', ok: false })
      return
    }
    if (pass !== pass2) {
      setMsg({ text: 'Las contraseñas no coinciden.', ok: false })
      return
    }

    setLoading(true)
    setMsg(null)
    const result = await confirmNewPassword(pass)
    if (result.ok) {
      setMsg({ text: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.', ok: true })
      setPass('')
      setPass2('')
    } else {
      setMsg({ text: result.error, ok: false })
    }
    setLoading(false)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark"><i className="ti ti-bolt"></i></div>
          <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.3px' }}>Disciplina</span>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Nueva contraseña</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Elige una contraseña segura para tu cuenta.</div>
        </div>

        {msg && (
          <div style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-xs)',
            fontSize: 13,
            marginBottom: 16,
            background: msg.ok ? 'var(--green-light)' : 'var(--red-light)',
            color:      msg.ok ? 'var(--green-dark)'  : 'var(--red)',
            border:     `1px solid ${msg.ok ? 'rgba(29,158,117,.3)' : 'rgba(224,85,85,.3)'}`,
          }}>
            <i className={`ti ti-${msg.ok ? 'circle-check' : 'alert-circle'}`} style={{ fontSize: 14, verticalAlign: '-2px', marginRight: 6 }}></i>
            {msg.text}
          </div>
        )}

        {!msg?.ok && (
          <>
            <div className="form-row-m">
              <label className="form-label-m">Nueva contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                disabled={loading}
              />
            </div>
            <div className="form-row-m">
              <label className="form-label-m">Confirmar contraseña</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repite tu contraseña"
                value={pass2}
                onChange={e => setPass2(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                disabled={loading}
              />
            </div>
            <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <span style={{ opacity: .6 }}>Guardando...</span>
                : <><i className="ti ti-lock" style={{ fontSize: 16 }}></i>Guardar contraseña</>}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
