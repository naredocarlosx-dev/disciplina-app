import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'

const NEON   = '#00D4FF'
const BG     = '#000'
const CARD   = '#111'
const BORDER = '#222'
const GRAY   = '#888'

/* ─── reusable styles ─────────────────────────────────────────────────────── */
const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: NEON, color: '#000', fontWeight: 700, fontSize: 14,
  padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer',
  boxShadow: `0 0 18px rgba(0,212,255,.35)`, transition: 'box-shadow .2s, transform .15s',
  fontFamily: "'DM Sans', sans-serif",
}
const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'transparent', color: '#fff', fontWeight: 500, fontSize: 14,
  padding: '10px 22px', borderRadius: 8, border: `1px solid ${BORDER}`,
  cursor: 'pointer', transition: 'border-color .2s, color .2s',
  fontFamily: "'DM Sans', sans-serif",
}
const sectionLabel = {
  display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: 2,
  textTransform: 'uppercase', color: NEON, marginBottom: 12,
}

/* ─── Feature cards data ──────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: 'ti-flame-off',
    title: 'Baja la presión',
    desc: 'No es transformar tu vida de golpe. Es solo el episodio 1. Pequeño, manejable, tuyo.',
  },
  {
    icon: 'ti-user-star',
    title: 'Tú eres el protagonista',
    desc: 'Cada hábito completado es un capítulo de tu historia. La app lo registra y lo celebra.',
  },
  {
    icon: 'ti-trending-up',
    title: 'Progreso gradual',
    desc: 'La app evoluciona contigo. Tu racha crece, tus metas avanzan. Episodio a episodio.',
  },
]

const STEPS = [
  { n: '01', title: 'Crea tu cuenta gratis',     desc: 'En menos de 30 segundos. Sin tarjeta.' },
  { n: '02', title: 'Elige tus hábitos diarios',  desc: 'Desde hábitos básicos hasta rutinas avanzadas.' },
  { n: '03', title: 'Construye tu racha',         desc: 'Marca cada día completado y ve cómo crece tu racha.' },
  { n: '04', title: 'Desbloquea tu mejor versión', desc: 'Consistencia + tiempo = resultados reales.' },
]

const FREE_FEATURES = [
  'Hasta 3 hábitos diarios',
  '1 meta de ahorro',
  'Planificador de comidas',
  'Rutinas de fitness',
  'Inventario de cocina',
]
const PRO_FEATURES = [
  'Hábitos ilimitados',
  'Metas de ahorro ilimitadas',
  'Todo lo del plan gratuito',
  'Soporte prioritario',
  'Acceso a funciones nuevas primero',
]

export default function Landing() {
  const { setScreen } = useContext(AppContext)
  const goAuth = () => setScreen('auth')

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5vw', height: 60,
      }}>
        <EpisodioUnoLogo width={130} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={btnSecondary} onClick={goAuth}>Iniciar sesión</button>
          <button style={btnPrimary}   onClick={goAuth}>Empieza gratis</button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '120px 5vw 80px',
        background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,.14) 0%, transparent 65%)`,
        position: 'relative',
      }}>
        <div style={{ maxWidth: 740 }}>
          <div style={{ ...sectionLabel, marginBottom: 20 }}>
            <i className="ti ti-bolt" style={{ marginRight: 6 }}></i>Tu disciplina empieza aquí
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 700, lineHeight: 1.1,
            letterSpacing: '-1.5px', marginBottom: 24, color: '#fff',
          }}>
            La disciplina no se construye de golpe.
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: GRAY, lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 40px',
          }}>
            Se construye episodio por episodio. Cada hábito, cada racha, cada día es un capítulo de algo más grande.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={{ ...btnPrimary, fontSize: 15, padding: '13px 28px' }} onClick={goAuth}>
              <i className="ti ti-arrow-right" style={{ fontSize: 16 }}></i>
              Empieza gratis
            </button>
            <button style={{ ...btnSecondary, fontSize: 15, padding: '13px 28px' }} onClick={goAuth}>
              Iniciar sesión
            </button>
          </div>
          <p style={{ marginTop: 20, fontSize: 12, color: '#555' }}>Sin tarjeta de crédito · Gratis para siempre en plan básico</p>
        </div>
      </section>

      {/* ── ¿QUÉ ES EPISODIO UNO? ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 5vw', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
          <div style={sectionLabel}>La app</div>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-.5px', marginBottom: 16 }}>
            ¿Qué es Episodio Uno?
          </h2>
          <p style={{ color: GRAY, fontSize: 16, maxWidth: 480, margin: '0 auto 52px', lineHeight: 1.7 }}>
            Una app diseñada para que el primer paso sea fácil. Sin presión, sin perfeccionismo.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
                padding: '32px 28px', textAlign: 'left',
                transition: 'border-color .2s',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, marginBottom: 20,
                  background: `rgba(0,212,255,.1)`, border: `1px solid rgba(0,212,255,.2)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <i className={`ti ${f.icon}`} style={{ fontSize: 20, color: NEON }}></i>
                </div>
                <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 10 }}>{f.title}</div>
                <div style={{ color: GRAY, fontSize: 14, lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ¿CÓMO FUNCIONA? ────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 5vw', borderTop: `1px solid ${BORDER}`, background: '#050505' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={sectionLabel}>Proceso</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-.5px' }}>
              ¿Cómo funciona?
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 24, alignItems: 'flex-start',
                paddingBottom: i < STEPS.length - 1 ? 32 : 0,
                position: 'relative',
              }}>
                {/* left column: number + line */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: `rgba(0,212,255,.1)`, border: `1px solid rgba(0,212,255,.35)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, color: NEON,
                    boxShadow: `0 0 12px rgba(0,212,255,.15)`,
                  }}>
                    {s.n}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 1, flex: 1, minHeight: 28, background: BORDER, margin: '6px 0' }}></div>
                  )}
                </div>
                {/* right: content */}
                <div style={{ paddingTop: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 5 }}>{s.title}</div>
                  <div style={{ color: GRAY, fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ────────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 5vw', borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={sectionLabel}>Planes</div>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-.5px', marginBottom: 12 }}>
              Empieza gratis. Escala cuando quieras.
            </h2>
            <p style={{ color: GRAY, fontSize: 15 }}>Sin sorpresas. Sin anuncios. Sin vender tus datos.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

            {/* FREE */}
            <div style={{
              background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '36px 32px',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: GRAY, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Gratuito</div>
              <div style={{ fontSize: 42, fontWeight: 800, marginBottom: 4 }}>$0</div>
              <div style={{ fontSize: 13, color: GRAY, marginBottom: 28 }}>Para siempre</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#ccc' }}>
                    <i className="ti ti-check" style={{ color: NEON, fontSize: 15, flexShrink: 0 }}></i>{f}
                  </li>
                ))}
              </ul>
              <button style={{ ...btnSecondary, width: '100%', justifyContent: 'center' }} onClick={goAuth}>
                Empieza gratis
              </button>
            </div>

            {/* PRO */}
            <div style={{
              background: `linear-gradient(135deg, #0a0a0a 0%, #0d1a1f 100%)`,
              border: `1px solid rgba(0,212,255,.4)`,
              borderRadius: 16, padding: '36px 32px', position: 'relative',
              boxShadow: `0 0 40px rgba(0,212,255,.08)`,
            }}>
              <div style={{
                position: 'absolute', top: -12, right: 24,
                background: NEON, color: '#000', fontSize: 10, fontWeight: 800,
                padding: '3px 12px', borderRadius: 99, letterSpacing: 1, textTransform: 'uppercase',
              }}>
                Más popular
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: NEON, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>PRO</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 42, fontWeight: 800 }}>$50</span>
                <span style={{ fontSize: 14, color: GRAY }}>MXN/mes</span>
              </div>
              <div style={{ fontSize: 13, color: GRAY, marginBottom: 28 }}>Todo desbloqueado</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PRO_FEATURES.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#fff' }}>
                    <i className="ti ti-bolt" style={{ color: NEON, fontSize: 14, flexShrink: 0, filter: `drop-shadow(0 0 4px ${NEON})` }}></i>{f}
                  </li>
                ))}
              </ul>
              <button style={{
                ...btnPrimary, width: '100%', justifyContent: 'center',
                fontSize: 15, padding: '12px 0',
              }} onClick={goAuth}>
                <i className="ti ti-bolt" style={{ fontSize: 15 }}></i>
                Activar PRO
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid ${BORDER}`, padding: '40px 5vw',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center',
        justifyContent: 'space-between', gap: 20,
      }}>
        <EpisodioUnoLogo width={120} />
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: GRAY, cursor: 'pointer' }}>Privacidad</span>
          <span style={{ fontSize: 13, color: GRAY, cursor: 'pointer' }}>Términos</span>
          <span style={{ fontSize: 13, color: GRAY, cursor: 'pointer' }} onClick={goAuth}>Iniciar sesión</span>
        </div>
        <div style={{ fontSize: 12, color: '#555' }}>
          © 2026 Episodio Uno. Todos los derechos reservados.
        </div>
      </footer>

    </div>
  )
}
