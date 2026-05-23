import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'

const FAQ_ITEMS = [
  { q: '¿Episodio Uno es gratuita?', a: 'Tiene un plan gratuito con acceso a todas las funciones principales. El plan PRO desbloquea hábitos y metas ilimitadas por $50 MXN/mes.' },
  { q: '¿Mis datos están seguros? ¿Se guardan en la nube?', a: 'Sí, tus datos se guardan de forma segura en la nube con Supabase. Puedes acceder desde cualquier dispositivo iniciando sesión con tu cuenta.' },
  { q: '¿Puedo usar Episodio Uno en mi teléfono?', a: 'Sí. La app está diseñada con diseño responsivo y funciona correctamente en dispositivos móviles. También puedes instalarla como PWA desde tu navegador.' },
  { q: '¿Qué pasa si cierro el navegador? ¿Se pierden mis datos?', a: 'Los datos se guardan en localStorage y persisten entre sesiones. Solo necesitas volver a iniciar sesión para continuar desde donde lo dejaste.' },
  { q: '¿Hay un panel de administrador?', a: 'Sí. El administrador tiene acceso a un panel especial donde puede ver todos los usuarios registrados, activar o desactivar cuentas y cambiar roles. El acceso demo es con correo admin@disciplina.com y contraseña admin123.' },
  { q: '¿Por qué frases de Brian Tracy específicamente?', a: 'Brian Tracy es uno de los autores de desarrollo personal más reconocidos del mundo, especializado en hábitos, productividad y metas. Sus frases son prácticas, directas y motivadoras para empezar el día con enfoque.' },
  { q: '¿Puedo crear varios usuarios?', a: 'Sí. Cualquier persona puede registrarse con nombre, correo y contraseña. Cada usuario tiene su propio acceso. El administrador gestiona todas las cuentas desde el panel de administración.' },
  { q: '¿Cómo funcionan las alertas de inventario?', a: 'Cada producto tiene una cantidad máxima de referencia. Cuando el stock baja al 3% o menos, aparece una alerta crítica en el dashboard y en la sección de cocina. Si llega a cero se marca como "agotado" con alerta roja.' }
]

export default function LandingScreen() {
  const { setScreen } = useContext(AppContext)
  const [openFaq, setOpenFaq] = useState(null)

  const goAuth = (e) => {
    e.preventDefault()
    setScreen('auth')
  }

  const toggleFaq = (idx) => {
    setOpenFaq(prev => prev === idx ? null : idx)
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* NAV */}
      <nav className="land-nav">
        <a href="#" className="land-logo">
          <EpisodioUnoLogo width={140} />
        </a>
        <div className="land-nav-links">
          <a href="#features">Características</a>
          <a href="#about">Quiénes somos</a>
          <a href="#faq">FAQ</a>
          <a href="#" onClick={goAuth} className="btn-cta">Iniciar sesión</a>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow"><i className="ti ti-bolt" style={{ fontSize: 13 }}></i>Hábitos que transforman</div>
          <h1 className="hero-title">Construye tu <em>mejor versión</em> cada día</h1>
          <p className="hero-sub">Episodio Uno es la app todo-en-uno para rastrear hábitos, controlar tu alimentación, alcanzar metas de ahorro y mantenerte activo. Simple, rápida y sin distracciones.</p>
          <div className="hero-actions">
            <a href="#" className="btn-hero-primary" onClick={goAuth}><i className="ti ti-arrow-right" style={{ fontSize: 16 }}></i>Comenzar gratis</a>
            <a href="#features" className="btn-hero-secondary"><i className="ti ti-eye" style={{ fontSize: 16 }}></i>Ver características</a>
          </div>
          <div className="hero-stats">
            <div><div className="hero-stat-val">6</div><div className="hero-stat-label">módulos integrados</div></div>
            <div><div className="hero-stat-val">30</div><div className="hero-stat-label">frases de Brian Tracy</div></div>
            <div><div className="hero-stat-val">100%</div><div className="hero-stat-label">tuyo, sin anuncios</div></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-mockup-bar">
            <div className="hero-mockup-dot" style={{ background: '#FF5F57' }}></div>
            <div className="hero-mockup-dot" style={{ background: '#FFBD2E' }}></div>
            <div className="hero-mockup-dot" style={{ background: '#28C840' }}></div>
          </div>
          <div className="mock-greeting">Buenos días 👋</div>
          <div className="mock-date">Miércoles, 21 de mayo de 2025</div>
          <div className="mock-quote">"Successful people are simply those with successful habits." — Brian Tracy</div>
          <div className="mock-metrics">
            <div className="mock-metric"><div className="mock-metric-val" style={{ color: '#1D9E75' }}>2/3</div><div className="mock-metric-label">Completados</div></div>
            <div className="mock-metric"><div className="mock-metric-val" style={{ color: '#BA7517' }}>5🔥</div><div className="mock-metric-label">Racha máx.</div></div>
            <div className="mock-metric"><div className="mock-metric-val" style={{ color: '#185FA5' }}>67%</div><div className="mock-metric-label">% del día</div></div>
          </div>
          <div className="mock-habit"><div className="mock-check done"></div><div className="mock-habit-name" style={{ textDecoration: 'line-through', color: '#A8A89F' }}>Ahorrar hoy</div><span className="mock-streak">🔥 3</span></div>
          <div className="mock-habit"><div className="mock-check done"></div><div className="mock-habit-name" style={{ textDecoration: 'line-through', color: '#A8A89F' }}>Seguir mi dieta</div><span className="mock-streak">🔥 5</span></div>
          <div className="mock-habit"><div className="mock-check"></div><div className="mock-habit-name">Entrenar</div><span className="mock-streak">🔥 2</span></div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" className="section-full">
        <div className="section-inner">
          <div className="section-label">Características</div>
          <h2 className="section-title">Todo lo que necesitas en un solo lugar</h2>
          <p className="section-sub">Diseñado para ser rápido, claro e intuitivo. En segundos sabes qué tienes que hacer hoy.</p>
          <div className="features-grid">
            <div className="feat-card"><div className="feat-icon feat-green"><i className="ti ti-check"></i></div><div className="feat-title">Seguimiento de hábitos</div><div className="feat-sub">Check diario, racha de días consecutivos y gráfica semanal para mantenerte motivado día tras día.</div></div>
            <div className="feat-card"><div className="feat-icon feat-amber"><i className="ti ti-piggy-bank"></i></div><div className="feat-title">Metas de ahorro</div><div className="feat-sub">Define objetivos financieros, registra aportaciones y visualiza tu avance con barra de progreso en tiempo real.</div></div>
            <div className="feat-card"><div className="feat-icon feat-blue"><i className="ti ti-salad"></i></div><div className="feat-title">Planificador de comidas</div><div className="feat-sub">5 tiempos de comida con horario por día. Vista semanal completa y plan de dieta personalizado.</div></div>
            <div className="feat-card"><div className="feat-icon feat-purple"><i className="ti ti-barbell"></i></div><div className="feat-title">Rutinas de fitness</div><div className="feat-sub">Crea rutinas, asígnalas a días de la semana y márcalas completadas desde el dashboard.</div></div>
            <div className="feat-card"><div className="feat-icon feat-red"><i className="ti ti-package"></i></div><div className="feat-title">Inventario de cocina</div><div className="feat-sub">Registra compras y consumo. Alertas automáticas al 3% de stock para nunca quedarte sin nada.</div></div>
            <div className="feat-card"><div className="feat-icon feat-surface"><i className="ti ti-quote"></i></div><div className="feat-title">Frase diaria</div><div className="feat-sub">Una frase de Brian Tracy diferente cada día. 30 frases curadas para inspirar tu jornada.</div></div>
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <div id="about" className="section">
        <div className="section-label">Quiénes somos</div>
        <h2 className="section-title">Una app hecha por personas que buscan mejorar</h2>
        <div className="about-grid">
          <div className="about-text">
            <p>Episodio Uno nació de una pregunta simple: ¿por qué es tan difícil mantener buenos hábitos si todo el mundo sabe lo que necesita hacer?</p>
            <p>La respuesta no es falta de voluntad, sino falta de sistema. Episodio Uno es ese sistema: visual, sin fricción y enfocado en lo que más importa para tu salud, finanzas y bienestar.</p>
            <p>No somos una gran corporación. Somos un equipo pequeño obsesionado con el diseño limpio y la efectividad real. Cada función fue incluida porque la usamos nosotros mismos.</p>
            <div className="about-values">
              <div className="about-value"><div className="about-value-icon"><i className="ti ti-target"></i></div><div><div className="about-value-title">Claridad sobre complejidad</div><div className="about-value-sub">Menos ruido, más acción. Cada pantalla tiene un propósito claro.</div></div></div>
              <div className="about-value"><div className="about-value-icon"><i className="ti ti-heart"></i></div><div><div className="about-value-title">Diseñado para el largo plazo</div><div className="about-value-sub">No para el día 1. Para el día 90, el día 180 y más allá.</div></div></div>
              <div className="about-value"><div className="about-value-icon"><i className="ti ti-lock"></i></div><div><div className="about-value-title">Sin anuncios, sin rastreo</div><div className="about-value-sub">Tu información es tuya. Sin vender datos, sin interrupciones.</div></div></div>
            </div>
          </div>
          <div className="about-card">
            <div className="about-card-title">Nuestra misión</div>
            <div className="about-card-sub">Hacer que la disciplina sea el camino de menor resistencia. Cuando rastrear un hábito tarda menos de 3 segundos, lo haces todos los días.</div>
            <div style={{ marginBottom: 12 }}>
              <span className="about-pill"><i className="ti ti-check" style={{ fontSize: 13 }}></i>Hábitos</span>
              <span className="about-pill"><i className="ti ti-piggy-bank" style={{ fontSize: 13 }}></i>Ahorro</span>
              <span className="about-pill"><i className="ti ti-salad" style={{ fontSize: 13 }}></i>Nutrición</span>
              <span className="about-pill"><i className="ti ti-barbell" style={{ fontSize: 13 }}></i>Fitness</span>
              <span className="about-pill"><i className="ti ti-package" style={{ fontSize: 13 }}></i>Inventario</span>
              <span className="about-pill"><i className="ti ti-chart-line" style={{ fontSize: 13 }}></i>Progreso</span>
            </div>
            <div style={{ fontSize: 13, opacity: .6, lineHeight: 1.5 }}>Versión 1.0 · Hecho con dedicación · 100% navegador local</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" className="section-full">
        <div className="section-inner">
          <div className="section-label">Preguntas frecuentes</div>
          <h2 className="section-title">Resolvemos tus dudas</h2>
          <div className="faq-list">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className={`faq-item${openFaq === idx ? ' open' : ''}`} onClick={() => toggleFaq(idx)}>
                <div className="faq-q"><span>{item.q}</span><i className="ti ti-plus"></i></div>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="land-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand"><EpisodioUnoLogo width={140} /></div>
            <div className="footer-desc">La app para construir hábitos que duran. Simple, rápida y sin distracciones. Hecha para personas que quieren mejorar de verdad.</div>
          </div>
          <div>
            <div className="footer-col-title">Navegación</div>
            <a href="#features" className="footer-link">Características</a>
            <a href="#about" className="footer-link">Quiénes somos</a>
            <a href="#faq" className="footer-link">Preguntas frecuentes</a>
            <a href="#" onClick={goAuth} className="footer-link">Iniciar sesión</a>
          </div>
          <div>
            <div className="footer-col-title">La app incluye</div>
            <a href="#" className="footer-link">Seguimiento de hábitos</a>
            <a href="#" className="footer-link">Planificador de comidas</a>
            <a href="#" className="footer-link">Metas de ahorro</a>
            <a href="#" className="footer-link">Rutinas de fitness</a>
            <a href="#" className="footer-link">Inventario de cocina</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Episodio Uno · Todos los derechos reservados</span>
          <span>Hecho con dedicación · Sin anuncios · Sin rastreo</span>
        </div>
      </footer>
    </div>
  )
}
