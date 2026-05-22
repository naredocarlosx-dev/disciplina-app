import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminStats from '../pages/admin/AdminStats'
import AdminSettings from '../pages/admin/AdminSettings'
import AllModals from '../components/AllModals'

export default function AdminScreen() {
  const { adminPage, setAdminPage, doLogout, currentUser } = useContext(AppContext)

  const navItems = [
    { id: 'users', icon: 'ti-users', label: 'Usuarios' },
    { id: 'stats', icon: 'ti-chart-bar', label: 'Estadísticas' },
    { id: 'settings', icon: 'ti-settings', label: 'Configuración' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark" style={{ background: 'var(--purple)' }}><i className="ti ti-shield"></i></div>
          <span className="logo-name">Admin</span>
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
          <div className="sidebar-avatar" style={{ background: '#EEEDFE', borderColor: '#AFA9EC', color: '#3C3489' }}>AD</div>
          <div>
            <div className="sidebar-user-name">{currentUser?.name || 'Administrador'}</div>
            <div className="sidebar-user-role" style={{ color: 'var(--purple)', fontSize: 10 }}>administrador</div>
          </div>
        </div>
      </aside>
      <main className="app-main">
        {adminPage === 'users' && <AdminUsers />}
        {adminPage === 'stats' && <AdminStats />}
        {adminPage === 'settings' && <AdminSettings />}
      </main>
      <AllModals />
    </div>
  )
}
