import { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import { PiggyBank } from 'lucide-react'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'
import TourOverlay from '../components/TourOverlay'
import ProGate     from '../components/ProGate'
import InstallBanner from '../components/InstallBanner'
import { usePWA }  from '../hooks/usePWA'
import Dashboard  from '../pages/Dashboard'
import Habitos    from '../pages/Habitos'
import Ahorro     from '../pages/Ahorro'
import Comidas    from '../pages/Comidas'
import Fitness    from '../pages/Fitness'
import Inventario from '../pages/Inventario'
import Precios    from '../pages/Precios'
import Instalar       from '../pages/Instalar'
import Notificaciones from '../pages/Notificaciones'
import Perfil         from '../pages/Perfil'
import AllModals      from '../components/AllModals'

const TOURS = {
  dashboard: {
    key: 'home',
    steps: [
      { target: 'dash-greeting',  title: 'Resumen del día',  text: 'Tu saludo personalizado y la fecha de hoy.',                                   placement: 'bottom' },
      { target: 'dash-completed', title: 'Completados hoy',  text: 'Cuántos hábitos has completado hasta este momento.',                           placement: 'bottom' },
      { target: 'dash-streak',    title: 'Racha máxima',     text: 'Tu racha más larga. ¡No la rompas!',                                           placement: 'bottom' },
      { target: 'dash-progress',  title: 'Progreso del día', text: 'Tu porcentaje de avance diario en tiempo real.',                                placement: 'bottom' },
      { target: 'dash-chart',     title: 'Progreso semanal', text: 'La gráfica de tu avance en los últimos 7 días.',                               placement: 'top'    },
    ],
  },
  habitos: {
    key: 'habits',
    steps: [
      { target: 'habits-add',    title: 'Nuevo hábito',   text: 'Toca aquí para agregar un nuevo hábito a tu lista.',                              placement: 'bottom' },
      { target: 'habits-list',   title: 'Mis hábitos',    text: 'Marca cada hábito al completarlo. Tu racha sube automáticamente.',                placement: 'bottom' },
      { target: 'habits-streak', title: 'Rachas activas', text: 'Los días consecutivos que has mantenido cada hábito sin faltar.',                 placement: 'top'    },
    ],
  },
  precios: {
    key: 'precios',
    steps: [
      { target: 'precios-plan',      title: 'Tu plan actual', text: 'Ve tu plan aquí. Activa PRO para desbloquear hábitos y metas ilimitados.',    placement: 'bottom' },
      { target: 'precios-subscribe', title: 'Activa PRO',     text: 'Por solo $49 MXN/mes desbloqueas todo sin ningún límite.',                    placement: 'top'    },
    ],
  },
}

export default function AppScreen() {
  const { appPage, setAppPage, doLogout, currentUser, subscription, getAlerts } = useContext(AppContext)
  const alerts    = getAlerts()
  const isPro     = subscription?.plan === 'pro'
  const { isStandalone } = usePWA()

  const [tourCfg, setTourCfg] = useState(null)

  useEffect(() => {
    const cfg = TOURS[appPage]
    if (!cfg) { setTourCfg(null); return }
    if (localStorage.getItem(`tour_${cfg.key}_done`)) { setTourCfg(null); return }
    // Delay so the page has time to render before we measure elements
    const t = setTimeout(() => setTourCfg(cfg), 480)
    return () => { clearTimeout(t); }
  }, [appPage])

  const navItems = [
    { id: 'dashboard',  icon: 'ti-home',    label: 'Inicio' },
    { id: 'habitos',    icon: 'ti-check',   label: 'Hábitos' },
    { id: 'ahorro',     Icon: PiggyBank,    label: 'Ahorro' },
    { id: 'comidas',    icon: 'ti-salad',   label: 'Comidas' },
    { id: 'fitness',    icon: 'ti-barbell', label: 'Fitness' },
    { id: 'inventario', icon: 'ti-package', label: 'Cocina',   badge: isPro ? alerts.total : 0, pro: true },
    { id: 'instalar',       icon: 'ti-download', label: 'Instalar',       hidden: isStandalone },
    { id: 'notificaciones', icon: 'ti-bell',     label: 'Notificaciones' },
    { id: 'perfil',         icon: 'ti-user',     label: 'Perfil' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="logo">
          <EpisodioUnoLogo dark width={120} />
        </div>

        {navItems.filter(item => !item.hidden).map(item => (
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
            {item.pro && !isPro && (
              <span style={{
                marginLeft: 'auto', fontSize: 9, fontWeight: 700,
                background: 'rgba(255,184,0,.15)', color: '#FFB800',
                border: '1px solid rgba(255,184,0,.35)',
                padding: '1px 6px', borderRadius: 20, letterSpacing: .5,
              }}>PRO</span>
            )}
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

        <a
          className="nav-item"
          href="https://www.instagram.com/episodio.uno?igsh=cXQ3d3NjdWVoaWR6&utm_source=qr"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
          </svg>
          <span>Instagram</span>
        </a>

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
        {appPage !== 'instalar' && <InstallBanner />}
        {appPage === 'dashboard'  && <Dashboard />}
        {appPage === 'habitos'    && <Habitos />}
        {appPage === 'ahorro'     && <Ahorro />}
        {appPage === 'comidas'    && <Comidas />}
        {appPage === 'fitness'    && <Fitness />}
        {appPage === 'inventario' && (
          isPro
            ? <Inventario />
            : <ProGate
                title="Inventario de cocina"
                description="El inventario de cocina está disponible en el plan PRO. Controla tu stock, recibe alertas de productos por agotarse y nunca te quedes sin ingredientes."
              />
        )}
        {appPage === 'precios'    && <Precios />}
        {appPage === 'instalar'       && <Instalar />}
        {appPage === 'notificaciones' && <Notificaciones />}
        {appPage === 'perfil'         && <Perfil />}
      </main>

      <AllModals />

      {tourCfg && (
        <TourOverlay
          steps={tourCfg.steps}
          tourKey={tourCfg.key}
          onDone={() => setTourCfg(null)}
        />
      )}
    </div>
  )
}
