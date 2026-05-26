import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import ManageSubscriptionButton from '../components/ManageSubscriptionButton'

function Toast({ msg, ok }) {
  return (
    <div style={{
      padding: '9px 14px', borderRadius: 8, fontSize: 13, marginTop: 8,
      background: ok ? 'rgba(29,158,117,.1)' : 'rgba(224,85,85,.1)',
      border: `1px solid ${ok ? 'rgba(29,158,117,.3)' : 'rgba(224,85,85,.3)'}`,
      color: ok ? 'var(--green)' : 'var(--red)',
    }}>
      {msg}
    </div>
  )
}

export default function Perfil() {
  const { currentUser, subscription } = useContext(AppContext)
  const { updateName, updatePassword }  = useAuth()

  const isPro      = subscription?.plan === 'pro'
  const hasStripe  = Boolean(subscription?.stripe_customer_id)
  const isGoogle   = currentUser?.provider === 'google'

  // ── Name ──────────────────────────────────────────────────────────────────
  const [name,        setName]        = useState(currentUser?.name || '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMsg,     setNameMsg]     = useState(null)

  const handleSaveName = async () => {
    if (!name.trim() || name.trim() === currentUser?.name) return
    setNameLoading(true)
    setNameMsg(null)
    const res = await updateName(name.trim())
    setNameMsg(res.ok ? { text: 'Nombre actualizado ✓', ok: true } : { text: res.error, ok: false })
    setNameLoading(false)
  }

  // ── Password ───────────────────────────────────────────────────────────────
  const [pass,         setPass]         = useState('')
  const [pass2,        setPass2]        = useState('')
  const [passLoading,  setPassLoading]  = useState(false)
  const [passMsg,      setPassMsg]      = useState(null)

  const handleSavePass = async () => {
    if (pass.length < 6) { setPassMsg({ text: 'Mínimo 6 caracteres.', ok: false }); return }
    if (pass !== pass2)  { setPassMsg({ text: 'Las contraseñas no coinciden.', ok: false }); return }
    setPassLoading(true)
    setPassMsg(null)
    const res = await updatePassword(pass)
    if (res.ok) { setPass(''); setPass2('') }
    setPassMsg(res.ok ? { text: 'Contraseña actualizada ✓', ok: true } : { text: res.error, ok: false })
    setPassLoading(false)
  }

  // ── Trial info ────────────────────────────────────────────────────────────
  const trialEndFormatted = currentUser?.trialEndDate
    ? new Date(currentUser.trialEndDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Mi perfil</div>
          <div className="page-sub">Gestiona tu cuenta y suscripción</div>
        </div>
      </div>

      {/* Avatar + plan */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #00D4FF, #0099bb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 700, color: '#000',
        }}>
          {(currentUser?.name || currentUser?.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#efefed' }}>{currentUser?.name || '—'}</div>
          <div style={{ fontSize: 13, color: '#8a8a85', marginTop: 2 }}>{currentUser?.email}</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {isGoogle && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: 'rgba(66,133,244,.15)', color: '#4285F4', border: '1px solid rgba(66,133,244,.3)' }}>
                Google
              </span>
            )}
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: isPro ? 'var(--accent)' : 'rgba(255,255,255,.07)',
              color: isPro ? '#fff' : '#8a8a85',
            }}>
              {isPro ? '⚡ Plan PRO' : 'Plan FREE'}
            </span>
          </div>
        </div>
      </div>

      {/* Plan info */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#efefed', marginBottom: 14 }}>
          {isPro ? 'Suscripción PRO' : 'Prueba gratuita'}
        </div>
        {isPro ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#8a8a85' }}>
              Tienes acceso completo a todas las funciones de Episodio Uno.
            </div>
            {hasStripe && <ManageSubscriptionButton />}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentUser?.trialDaysLeft > 0 ? (
              <>
                <div style={{
                  background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.2)',
                  borderRadius: 10, padding: '12px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '.07em', color: 'rgba(0,212,255,.6)', marginBottom: 4 }}>
                      Días restantes
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
                      {currentUser.trialDaysLeft}
                    </div>
                  </div>
                  {trialEndFormatted && (
                    <div style={{ fontSize: 12, color: '#555', textAlign: 'right' }}>
                      Vence el<br />
                      <span style={{ color: '#8a8a85' }}>{trialEndFormatted}</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                  Cuando termine tu prueba necesitarás activar el plan PRO para seguir usando la app.
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--red)' }}>
                Tu prueba gratuita ha expirado.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit name */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#efefed', marginBottom: 14 }}>Nombre</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            value={name}
            onChange={e => { setName(e.target.value); setNameMsg(null) }}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            placeholder="Tu nombre completo"
            disabled={nameLoading}
          />
          <button
            className="btn btn-dark"
            onClick={handleSaveName}
            disabled={nameLoading || !name.trim() || name.trim() === currentUser?.name}
          >
            {nameLoading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
        {nameMsg && <Toast msg={nameMsg.text} ok={nameMsg.ok} />}
      </div>

      {/* Change password */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 14, color: '#efefed', marginBottom: 4 }}>
          {isGoogle ? 'Establecer contraseña' : 'Cambiar contraseña'}
        </div>
        <div style={{ fontSize: 12, color: '#555', marginBottom: 14, lineHeight: 1.6 }}>
          {isGoogle
            ? 'Añade una contraseña para poder iniciar sesión también con email.'
            : 'Introduce una nueva contraseña para tu cuenta.'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            className="form-input"
            type="password"
            placeholder="Nueva contraseña (mín. 6 caracteres)"
            value={pass}
            onChange={e => { setPass(e.target.value); setPassMsg(null) }}
            disabled={passLoading}
          />
          <input
            className="form-input"
            type="password"
            placeholder="Confirmar contraseña"
            value={pass2}
            onChange={e => { setPass2(e.target.value); setPassMsg(null) }}
            onKeyDown={e => e.key === 'Enter' && handleSavePass()}
            disabled={passLoading}
          />
          <button
            className="btn btn-dark"
            onClick={handleSavePass}
            disabled={passLoading || !pass || !pass2}
            style={{ alignSelf: 'flex-start' }}
          >
            {passLoading ? 'Guardando…' : isGoogle ? 'Establecer contraseña' : 'Cambiar contraseña'}
          </button>
        </div>
        {passMsg && <Toast msg={passMsg.text} ok={passMsg.ok} />}
      </div>
    </div>
  )
}
