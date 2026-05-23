import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'
import AdminUsers         from '../pages/admin/AdminUsers'
import AdminSuscripciones from '../pages/admin/AdminSuscripciones'
import AdminStats         from '../pages/admin/AdminStats'
import AdminSettings      from '../pages/admin/AdminSettings'
import AllModals          from '../components/AllModals'

export default function AdminScreen() {
  const { adminPage, setAdminPage, doLogout, currentUser } = useContext(AppContext)

  const navItems = [
    { id: 'users',         icon: 'ti-users',       label: 'Usuarios' },
    { id: 'suscripciones', icon: 'ti-credit-card', label: 'Suscripciones' },
    { id: 'stats',         icon: 'ti-chart-bar',   label: 'Estadísticas' },
    { id: 'settings',      icon: 'ti-settings',    label: 'Configuración' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8 }}>
          <EpisodioUnoLogo dark width={110} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--purple)', background: 'rgba(139,92,246,.12)', padding: '2px 7px', borderRadius: 20 }}>Admin</span>
        </div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item${adminPage === item.id ? ' active' : ''}`}
            onClick={() => setAdminPage(item.id)}
          >
            <i className={`ti ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}
        <div className="nav-divider"></div>
        <button className="nav-item" onClick={doLogout}><i className="ti ti-logout"></i><span>Salir</span></button>
        <div className="sidebar-user" style={{ marginTop: 12 }}>
          <div className="sidebar-avatar" style={{ background: '#EEEDFE', borderColor: '#AFA9EC', color: '#3C3489' }}>
            {currentUser?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <div className="sidebar-user-name">{currentUser?.name || 'Administrador'}</div>
            <div className="sidebar-user-role" style={{ color: 'var(--purple)', fontSize: 10 }}>administrador</div>
          </div>
        </div>
      </aside>
      <main className="app-main">
        {adminPage === 'users'         && <AdminUsers />}
        {adminPage === 'suscripciones' && <AdminSuscripciones />}
        {adminPage === 'stats'         && <AdminStats />}
        {adminPage === 'settings'      && <AdminSettings />}
      </main>
      <AllModals />
    </div>
  )
}
