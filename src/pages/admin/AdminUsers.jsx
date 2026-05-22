import { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'

export default function AdminUsers() {
  const { authState, openModal, toggleUserStatus, deleteUser } = useContext(AppContext)
  const [search, setSearch] = useState('')

  const users = authState.users
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const total = users.length
  const active = users.filter(u => u.status === 'active').length
  const admins = users.filter(u => u.role === 'admin').length
  const inactive = total - active

  const openEdit = (u) => {
    openModal('edit-user', { user: u })
  }

  return (
    <div>
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
                      <button className="btn-icon" onClick={() => openEdit(u)} aria-label="Editar"><i className="ti ti-edit"></i></button>
                      <button className="btn-icon" onClick={() => toggleUserStatus(u.id)} aria-label="Estado" title={u.status === 'active' ? 'Desactivar' : 'Activar'}>
                        <i className={`ti ti-${u.status === 'active' ? 'eye-off' : 'eye'}`}></i>
                      </button>
                      {u.role !== 'admin' && (
                        <button className="btn-icon" onClick={() => deleteUser(u.id)} aria-label="Eliminar" style={{ color: 'var(--red)' }}>
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
