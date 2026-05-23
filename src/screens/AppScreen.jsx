import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { PiggyBank } from 'lucide-react'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'
import Dashboard  from '../pages/Dashboard'
import Habitos    from '../pages/Habitos'
import Ahorro     from '../pages/Ahorro'
import Comidas    from '../pages/Comidas'
import Fitness    from '../pages/Fitness'
import Inventario from '../pages/Inventario'
import Precios    from '../pages/Precios'
import AllModals  from '../components/AllModals'

export default function AppScreen() {
  const { appPage, setAppPage, doLogout, currentUser, subscription, getAlerts } = useContext(AppContext)
  const alerts    = getAlerts()
  const isPro     = subscription?.plan === 'pro'

  const navItems = [
    { id: 'dashboard',  icon: 'ti-home',    label: 'Inicio' },
    { id: 'habitos',    icon: 'ti-check',   label: 'Hábitos' },
    { id: 'ahorro',     Icon: PiggyBank,    label: 'Ahorro' },
    { id: 'comidas',    icon: 'ti-salad',   label: 'Comidas' },
    { id: 'fitness',    icon: 'ti-barbell', label: 'Fitness' },
    { id: 'inventario', icon: 'ti-package', label: 'Cocina', badge: alerts.total },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="logo">
          <EpisodioUnoLogo dark width={120} />
        </div>

        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item${appPage === item.id ? ' active' : ''}`}
            onClick={() => setAppPage(item.id)}
          >
            {item.Icon
            ? <item.Icon size={18} strokeWidth={2} />
            : <i className={`ti ${item.icon}`}></i>}
            <span>{item.label}</span>
            {item.badge > 0 && <span className="badge">{item.badge}</span>}
          </button>
        ))}

        <div className="nav-divider"></div>

        {/* Planes — muestra badge PRO si ya tiene el plan */}
        <button
          className={`nav-item${appPage === 'precios' ? ' active' : ''}`}
          onClick={() => setAppPage('precios')}
        >
          <i className="ti ti-bolt"></i>
          <span>Planes</span>
          {isPro && (
            <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, background: 'var(--accent)', color: '#fff', padding: '1px 6px', borderRadius: 20 }}>
              PRO
            </span>
          )}
        </button>

        <div className="nav-divider"></div>

        <button className="nav-item" onClick={doLogout}>
          <i className="ti ti-logout"></i>
          <span>Salir</span>
        </button>

        <div className="sidebar-user" style={{ marginTop: 12 }}>
          <div className="sidebar-avatar">{currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
          <div>
            <div className="sidebar-user-name">{currentUser?.name || 'Usuario'}</div>
            <div className="sidebar-user-role">{isPro ? 'Plan PRO' : 'Plan FREE'}</div>
          </div>
        </div>
      </aside>

      <main className="app-main">
        {appPage === 'dashboard'  && <Dashboard />}
        {appPage === 'habitos'    && <Habitos />}
        {appPage === 'ahorro'     && <Ahorro />}
        {appPage === 'comidas'    && <Comidas />}
        {appPage === 'fitness'    && <Fitness />}
        {appPage === 'inventario' && <Inventario />}
        {appPage === 'precios'    && <Precios />}
      </main>

      <AllModals />
    </div>
  )
}
