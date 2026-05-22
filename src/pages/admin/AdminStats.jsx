import { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { todayKey } from '../../constants'

export default function AdminStats() {
  const { authState } = useContext(AppContext)
  const users = authState.users
  const total = users.length
  const active = users.filter(u => u.status === 'active').length
  const admins = users.filter(u => u.role === 'admin').length
  const todayReg = users.filter(u => u.created === todayKey).length
  const userPct = total ? Math.round((total - admins) / total * 100) : 0
  const adminPct = total ? Math.round(admins / total * 100) : 0
  const recent = [...users].reverse().slice(0, 5)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Estadísticas</div>
          <div className="page-sub">Resumen general de la plataforma</div>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card accent-green"><div className="metric-label">Registrados</div><div className="metric-val c-green">{total}</div></div>
        <div className="metric-card accent-blue"><div className="metric-label">Activos</div><div className="metric-val c-blue">{active}</div></div>
        <div className="metric-card accent-purple"><div className="metric-label">Admins</div><div className="metric-val c-purple">{admins}</div></div>
        <div className="metric-card accent-amber"><div className="metric-label">Registros hoy</div><div className="metric-val c-amber">{todayReg}</div></div>
      </div>

      <div className="card">
        <div className="card-title"><i className="ti ti-users"></i>Distribución de roles</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Usuarios ({total - admins})</div>
            <div className="pb-wrap" style={{ height: 10 }}>
              <div className="pb-fill pb-green" style={{ width: `${userPct}%` }}></div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Admins ({admins})</div>
            <div className="pb-wrap" style={{ height: 10 }}>
              <div className="pb-fill pb-purple" style={{ width: `${adminPct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><i className="ti ti-calendar"></i>Usuarios recientes</div>
        {recent.map(u => (
          <div key={u.id} className="habit-row">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'admin' ? '#EEEDFE' : 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: u.role === 'admin' ? '#3C3489' : 'var(--green-dark)' }}>
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{u.email}</div>
            </div>
            <span className={`role-badge ${u.role === 'admin' ? 'role-admin' : 'role-user'}`}>
              {u.role === 'admin' ? 'Admin' : 'Usuario'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
