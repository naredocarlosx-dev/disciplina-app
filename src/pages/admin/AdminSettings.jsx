import { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'

export default function AdminSettings() {
  const { changeAdminPass, clearNonAdmins } = useContext(AppContext)
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [msg, setMsg] = useState(null)

  const handleChangePass = async () => {
    const result = await changeAdminPass({ pass1, pass2 })
    if (result.ok) {
      setMsg({ text: 'Contraseña actualizada correctamente.', ok: true })
      setPass1('')
      setPass2('')
      setTimeout(() => setMsg(null), 3000)
    } else {
      setMsg({ text: result.error, ok: false })
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Configuración</div>
          <div className="page-sub">Ajustes generales de la plataforma</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title-sm" style={{ marginBottom: 16 }}>Cambiar contraseña de administrador</div>
        <div className="form-row-m">
          <label className="form-label-m">Nueva contraseña</label>
          <input type="password" placeholder="Mínimo 6 caracteres" value={pass1} onChange={e => setPass1(e.target.value)} style={{ maxWidth: 320 }} />
        </div>
        <div className="form-row-m">
          <label className="form-label-m">Confirmar contraseña</label>
          <input type="password" placeholder="Repite la contraseña" value={pass2} onChange={e => setPass2(e.target.value)} style={{ maxWidth: 320 }} />
        </div>
        <button className="btn btn-dark btn-sm" onClick={handleChangePass}>
          <i className="ti ti-lock"></i>Cambiar contraseña
        </button>
        {msg && (
          <div style={{ fontSize: 13, marginTop: 10, color: msg.ok ? 'var(--green)' : 'var(--red)' }}>{msg.text}</div>
        )}
      </div>

      <div className="card">
        <div className="section-title-sm" style={{ marginBottom: 16 }}>Información de la plataforma</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
          <div><strong>Nombre:</strong> Disciplina v1.0</div>
          <div><strong>Tipo:</strong> Aplicación React+Vite con backend Supabase</div>
          <div><strong>Almacenamiento:</strong> Base de datos PostgreSQL (Supabase)</div>
          <div><strong>Tecnologías:</strong> React, Vite, Supabase, Chart.js, Tabler Icons</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title-sm" style={{ marginBottom: 12 }}>Zona de peligro</div>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Elimina todos los usuarios no administradores de la sesión.</p>
        <button className="btn btn-red btn-sm" onClick={clearNonAdmins}>
          <i className="ti ti-trash"></i>Eliminar usuarios no admin
        </button>
      </div>
    </div>
  )
}
