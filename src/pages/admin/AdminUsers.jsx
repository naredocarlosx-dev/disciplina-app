import { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'

export default function AdminUsers() {
  const { authState, openModal, toggleUserStatus, removeUserFromState } = useContext(AppContext)
  const [search,        setSearch]        = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting,      setDeleting]      = useState(false)
  const [toast,         setToast]         = useState(null)

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError })
    setTimeout(() => setToast(null), 4000)
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete || deleting) return
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/.netlify/functions/admin-delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ targetUserId: confirmDelete.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Error al eliminar')
      removeUserFromState(confirmDelete.id)
      showToast(`Usuario "${confirmDelete.name}" eliminado correctamente`)
      setConfirmDelete(null)
    } catch (err) {
      showToast(err.message, true)
    } finally {
      setDeleting(false)
    }
  }

  const users    = authState.users
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const total    = users.length
  const active   = users.filter(u => u.status === 'active').length
  const admins   = users.filter(u => u.role === 'admin').length
  const inactive = total - active

  return (
    <div>
      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.isError ? '#2a1010' : '#0d1f17',
          border: `1px solid ${toast.isError ? 'var(--red)' : '#1a4d2e'}`,
          color: toast.isError ? 'var(--red)' : '#4ade80',
          padding: '12px 18px', borderRadius: 10, fontSize: 13, maxWidth: 360,
          boxShadow: '0 4px 20px rgba(0,0,0,.5)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Confirmation modal ── */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,.72)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}
          onClick={e => { if (e.target === e.currentTarget && !deleting) setConfirmDelete(null) }}
        >
          <div style={{
            background: '#111', border: '1px solid #2a2a2a',
            borderRadius: 14, padding: '28px 28px 24px', maxWidth: 400, width: '90%',
            boxShadow: '0 8px 40px rgba(0,0,0,.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(224,85,85,.15)', border: '1px solid rgba(224,85,85,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--red)', fontSize: 16,
              }}>
                <i className="ti ti-trash" />
              </div>
              <span style={{ fontWeight: 600, fontSize: 15, color: '#efefed' }}>Eliminar usuario</span>
            </div>
            <p style={{ fontSize: 14, color: '#8a8a85', lineHeight: 1.6, margin: '0 0 8px' }}>
              ¿Estás seguro que quieres eliminar a{' '}
              <strong style={{ color: '#efefed' }}>{confirmDelete.name}</strong>?
            </p>
            <p style={{ fontSize: 13, color: '#555', margin: '0 0 24px' }}>
              Esta acción no se puede deshacer. Se eliminarán todos sus datos y su acceso a la plataforma.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                className="btn btn-dark"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
                style={{ fontSize: 13 }}
              >
                Cancelar
              </button>
              <button
                className="btn"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{
                  background: 'var(--red)', border: 'none', color: '#fff',
                  fontSize: 13, opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <div className="page-title">Gestión de usuarios</div>
          <div className="page-sub">Administra las cuentas de la plataforma</div>
        </div>
        <button className="btn btn-dark" onClick={() => openModal('add-user')}>
          <i className="ti ti-user-plus"></i>Agregar usuario
        </button>
      </div>

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="metric-card accent-blue"><div className="metric-label">Total usuarios</div><div className="metric-val c-blue">{total}</div></div>
        <div className="metric-card accent-green"><div className="metric-label">Activos</div><div className="metric-val c-green">{active}</div></div>
        <div className="metric-card accent-purple"><div className="metric-label">Administradores</div><div className="metric-val c-purple">{admins}</div></div>
        <div className="metric-card accent-amber"><div className="metric-label">Inactivos</div><div className="metric-val c-amber">{inactive}</div></div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar usuario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ fontSize: 13, color: 'var(--text3)', marginLeft: 'auto' }}>{filtered.length} de {total} usuarios</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: u.role === 'admin' ? '#EEEDFE' : 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: u.role === 'admin' ? '#3C3489' : 'var(--green-dark)' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text2)' }}>{u.email}</td>
                  <td><span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>{u.role === 'admin' ? 'Administrador' : 'Usuario'}</span></td>
                  <td>
                    <span className={`status-dot ${u.status === 'active' ? 'status-active' : 'status-inactive'}`}></span>
                    {u.status === 'active' ? 'Activo' : 'Inactivo'}
                  </td>
                  <td style={{ color: 'var(--text3)' }}>{u.created}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" onClick={() => openModal('edit-user', { user: u })} aria-label="Editar"><i className="ti ti-edit"></i></button>
                      <button className="btn-icon" onClick={() => toggleUserStatus(u.id)} aria-label="Estado" title={u.status === 'active' ? 'Desactivar' : 'Activar'}>
                        <i className={`ti ti-${u.status === 'active' ? 'eye-off' : 'eye'}`}></i>
                      </button>
                      {u.role !== 'admin' && (
                        <button className="btn-icon" onClick={() => setConfirmDelete(u)} aria-label="Eliminar" style={{ color: 'var(--red)' }}>
                          <i className="ti ti-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
