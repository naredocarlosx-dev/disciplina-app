import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'
import SubscribeButton from '../components/SubscribeButton'

const PARTICLES = Array.from({ length: 40 }, (_, i) => {
  const tiers = [
    { size: 12, cls: 'auth-bg__p auth-bg__p--xl', minDur: 5,   step: 0.6  },
    { size: 8,  cls: 'auth-bg__p auth-bg__p--lg', minDur: 3,   step: 0.45 },
    { size: 5,  cls: 'auth-bg__p auth-bg__p--md', minDur: 1.8, step: 0.35 },
    { size: 3,  cls: 'auth-bg__p auth-bg__p--sm', minDur: 1.2, step: 0.25 },
  ]
  const tier = tiers[i % 4]
  const seed = (i * 137.508 + 29) % 100
  return {
    cls:  tier.cls,
    size: tier.size,
    left: `${(seed * 1.73 + i * 2.4) % 100}%`,
    top:  `${(seed * 2.11 + i * 1.7) % 100}%`,
    dur:  `${(tier.minDur + (seed % 8) * tier.step).toFixed(1)}s`,
    del:  `${((seed * 0.43) % 4).toFixed(1)}s`,
  }
})

export default function TrialExpiredScreen() {
  const { doLogout } = useContext(AppContext)

  return (
    <>
      {/* Particle background (reuses auth-bg CSS from index.css) */}
      <div className="auth-bg">
        <div className="auth-bg__glow" />
        <div className="auth-bg__grid" />
        <div className="auth-bg__grid-persp" />
        {PARTICLES.map((p, i) => (
          <div key={i} className={p.cls} style={{
            left: p.left, top: p.top,
            width: p.size + 'px', height: p.size + 'px',
            animationDuration: p.dur, animationDelay: p.del,
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{ marginBottom: 40 }}>
          <EpisodioUnoLogo dark width={140} />
        </div>

        {/* Lock icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(0,212,255,.07)',
          border: '1px solid rgba(0,212,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
          boxShadow: '0 0 32px rgba(0,212,255,.1)',
        }}>
          <i className="ti ti-lock" style={{ fontSize: 32, color: '#00D4FF' }} />
        </div>

        {/* Badge */}
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 2,
          textTransform: 'uppercase', color: '#FFB800',
          background: 'rgba(255,184,0,.1)', border: '1px solid rgba(255,184,0,.3)',
          padding: '3px 12px', borderRadius: 20, marginBottom: 20,
          display: 'inline-block',
        }}>
          Prueba gratuita finalizada
        </span>

        <h1 style={{
          fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700,
          color: '#efefed', letterSpacing: '-.5px',
          marginBottom: 16, lineHeight: 1.2,
        }}>
          Tu prueba gratuita ha terminado
        </h1>

        <p style={{
          fontSize: 15, color: '#8a8a85', lineHeight: 1.75,
          maxWidth: 480, marginBottom: 36,
        }}>
          Gracias por probar Episodio Uno durante 3 meses. Para continuar
          construyendo tus hábitos, activa el plan PRO.
        </p>

        <SubscribeButton label="Activar PRO — $49 MXN/mes" style={{
          background: '#00D4FF', color: '#000', border: 'none',
          fontWeight: 700, fontSize: 15, padding: '13px 32px',
          minWidth: 260,
        }} />

        <button
          onClick={doLogout}
          style={{
            marginTop: 24, background: 'none', border: 'none',
            color: '#555', fontSize: 13, cursor: 'pointer',
            textDecoration: 'underline', padding: 0,
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </>
  )
}
