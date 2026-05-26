import { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import EpisodioUnoLogo from '../components/EpisodioUnoLogo'
import { usePWA } from '../hooks/usePWA'

const CHIPS = [
  { label: 'Ejercicio',   cat: 'fitness' },
  { label: 'Lectura',     cat: 'mental'  },
  { label: 'Meditación',  cat: 'mental'  },
  { label: 'Agua',        cat: 'salud'   },
  { label: 'Dormir bien', cat: 'salud'   },
]

const OB_TIERS = [
  { size: 12, cls: 'xl', minDur: 5,   step: 0.6  },
  { size: 8,  cls: 'lg', minDur: 3,   step: 0.45 },
  { size: 5,  cls: 'md', minDur: 1.8, step: 0.35 },
  { size: 3,  cls: 'sm', minDur: 1.2, step: 0.25 },
]
const OB_PARTICLES = Array.from({ length: 50 }, (_, i) => {
  const t = OB_TIERS[i % 4]
  return {
    left: `${(i * 23 + 7) % 100}%`,
    top:  `${(i * 41 + 13) % 100}%`,
    size: t.size,
    cls:  `auth-bg__p auth-bg__p--${t.cls}`,
    dur:  `${(t.minDur + (Math.floor(i / 4) % 5) * t.step).toFixed(1)}s`,
    del:  `-${((i * 0.67) % t.minDur).toFixed(1)}s`,
  }
})

export default function OnboardingScreen() {
  const { setScreen, addHabit } = useContext(AppContext)
  const { isStandalone, isIOS, canInstallNatively, triggerInstall } = usePWA()

  const [step,         setStep]         = useState(1)
  const [habitName,    setHabitName]    = useState('')
  const [selectedChip, setSelectedChip] = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [installing,   setInstalling]   = useState(false)

  const chipCat = CHIPS.find(c => c.label === selectedChip)?.cat || 'salud'

  const handleChip = (label) => {
    setSelectedChip(label)
    setHabitName(label)
  }

  const handleHabitInput = (val) => {
    setHabitName(val)
    if (selectedChip && val !== selectedChip) setSelectedChip(null)
  }

  const goToApp = async () => {
    if (saving) return
    setSaving(true)
    if (habitName.trim()) {
      await addHabit({ name: habitName.trim(), cat: chipCat })
    }
    localStorage.setItem('onboarding_completed', 'true')
    setScreen('app')
  }

  const handleInstall = async () => {
    setInstalling(true)
    await triggerInstall()
    setInstalling(false)
    setStep(5)
  }

  return (
    <>
    <div className="auth-bg">
      <div className="auth-bg__glow" />
      <div className="auth-bg__grid" />
      <div className="auth-bg__grid-persp" />
      {OB_PARTICLES.map((p, i) => (
        <div key={i} className={p.cls} style={{
          left: p.left, top: p.top,
          width: p.size + 'px', height: p.size + 'px',
          animationDuration: p.dur, animationDelay: p.del,
        }} />
      ))}
    </div>

    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <EpisodioUnoLogo dark width={160} />
        </div>

        {/* Dot progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <div key={n} style={{
              width: n === step ? 22 : 8, height: 8, borderRadius: 4,
              background: n <= step ? '#00D4FF' : 'rgba(0,212,255,.2)',
              transition: 'all .3s ease',
            }} />
          ))}
        </div>

        {step === 1 && (
          <div key="s1" className="onboard-step">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <i className="onboard-icon ti ti-bolt" style={{
                fontSize: 52, color: '#00D4FF', display: 'block', marginBottom: 16,
                textShadow: '0 0 24px rgba(0,212,255,.8), 0 0 48px rgba(0,212,255,.35)',
              }} />
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>Bienvenido a Episodio Uno</div>
              <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75 }}>
                La disciplina no es un rasgo de personalidad.<br />
                Es un sistema. Vamos a construir el tuyo,<br />
                un hábito a la vez.
              </div>
            </div>
            <button className="btn-auth" onClick={() => setStep(2)}>
              <i className="ti ti-arrow-right" style={{ fontSize: 16 }}></i>Comenzar
            </button>
          </div>
        )}

        {step === 2 && (
          <div key="s2" className="onboard-step">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>¿Cuál será tu primer hábito?</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                Elige uno al que puedas comprometerte cada día.
              </div>
            </div>

            <div className="form-row-m">
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Meditar 10 minutos"
                value={habitName}
                onChange={e => handleHabitInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && habitName.trim() && setStep(3)}
                maxLength={60}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 22 }}>
              {CHIPS.map(c => (
                <button
                  key={c.label}
                  onClick={() => handleChip(c.label)}
                  style={{
                    padding: '5px 13px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
                    border: selectedChip === c.label ? '1px solid #00D4FF' : '1px solid rgba(0,212,255,.3)',
                    background: selectedChip === c.label ? 'rgba(0,212,255,.15)' : 'transparent',
                    color: selectedChip === c.label ? '#00D4FF' : 'rgba(0,212,255,.6)',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button className="btn-auth" onClick={() => setStep(3)} disabled={!habitName.trim()}>
              <i className="ti ti-check" style={{ fontSize: 16 }}></i>Agregar hábito
            </button>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span
                onClick={() => { setHabitName(''); setSelectedChip(null); setStep(3) }}
                style={{ fontSize: 13, color: 'var(--text3)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Saltar por ahora
              </span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div key="s3" className="onboard-step">
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span className="onboard-icon" style={{ fontSize: 52, display: 'block', marginBottom: 14 }}>⚡</span>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>¡Tu episodio 1 comienza hoy!</div>

              {habitName.trim() && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 16px', borderRadius: 99, marginBottom: 14,
                  background: 'rgba(0,212,255,.1)', border: '1px solid rgba(0,212,255,.25)',
                  fontSize: 13, color: '#00D4FF', fontWeight: 600,
                }}>
                  <i className="ti ti-check" style={{ fontSize: 12 }}></i>
                  {habitName.trim()}
                </div>
              )}

              <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75 }}>
                Cada gran cambio empieza con una sola acción.<br />
                Tu streak empieza hoy.
              </div>
            </div>
            <button className="btn-auth" onClick={() => setStep(4)}>
              <i className="ti ti-arrow-right" style={{ fontSize: 16 }}></i>Siguiente
            </button>
          </div>
        )}

        {step === 4 && (
          <div key="s4" className="onboard-step">
            {isStandalone ? (
              /* Already installed — skip to notifications */
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 52, display: 'block', marginBottom: 14 }}>✅</span>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>¡Ya tienes la app instalada!</div>
                <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 28 }}>
                  Episodio Uno ya está en tu pantalla de inicio.
                </div>
                <button className="btn-auth" onClick={() => setStep(5)}>
                  <i className="ti ti-arrow-right" style={{ fontSize: 16 }}></i>Siguiente
                </button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <i className="onboard-icon ti ti-device-mobile" style={{
                    fontSize: 44, color: '#00D4FF', display: 'block', marginBottom: 12,
                    textShadow: '0 0 20px rgba(0,212,255,.6)',
                  }} />
                  <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                    Lleva Episodio Uno contigo
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
                    Instala la app para acceso rápido desde tu pantalla de inicio.
                  </div>
                </div>

                {/* iOS (Safari y Chrome) — mismas instrucciones: botón Compartir */}
                {isIOS && (
                  <div style={{
                    background: 'rgba(0,212,255,.05)', border: '1px solid rgba(0,212,255,.15)',
                    borderRadius: 10, padding: '14px', marginBottom: 16,
                  }}>
                    {[
                      { n: '1', t: 'Toca el botón Compartir ↑', i: 'ti-share' },
                      { n: '2', t: 'Toca "Añadir a pantalla de inicio"', i: 'ti-plus' },
                      { n: '3', t: 'Confirma tocando "Añadir"', i: 'ti-check' },
                    ].map(s => (
                      <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(0,212,255,.15)', border: '1px solid rgba(0,212,255,.35)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: '#00D4FF',
                        }}>{s.n}</div>
                        <i className={`ti ${s.i}`} style={{ color: '#00D4FF', fontSize: 14, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: '#c0c0c0' }}>{s.t}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Android / Chrome — native prompt */}
                {canInstallNatively && (
                  <button
                    className="btn-auth"
                    onClick={handleInstall}
                    disabled={installing}
                    style={{ marginBottom: 8 }}
                  >
                    {installing
                      ? <span style={{ opacity: .6 }}>Instalando…</span>
                      : <><i className="ti ti-download" style={{ fontSize: 16 }}></i>Instalar ahora</>}
                  </button>
                )}

                {/* Skip / fallback */}
                <button
                  className={canInstallNatively ? undefined : 'btn-auth'}
                  onClick={() => setStep(5)}
                  style={canInstallNatively ? {
                    display: 'block', width: '100%', textAlign: 'center',
                    marginTop: 8, background: 'none', border: 'none',
                    color: 'var(--text3)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
                  } : undefined}
                >
                  {canInstallNatively
                    ? 'Continuar sin instalar'
                    : <><i className="ti ti-arrow-right" style={{ fontSize: 16 }}></i>Siguiente</>}
                </button>
              </>
            )}
          </div>
        )}

        {step === 5 && (
          <div key="s5" className="onboard-step">
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <i className="onboard-icon ti ti-bell" style={{
                fontSize: 44, color: '#00D4FF', display: 'block', marginBottom: 12,
                textShadow: '0 0 20px rgba(0,212,255,.6)',
              }} />
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                Activa las notificaciones
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>
                Te avisaremos cuando tengas hábitos pendientes,<br />
                tu racha esté en riesgo o tu stock esté bajo.
              </div>
            </div>

            <div style={{
              background: 'rgba(0,212,255,.05)', border: '1px solid rgba(0,212,255,.12)',
              borderRadius: 10, padding: '14px 16px', marginBottom: 20,
            }}>
              {[
                { icon: '🔥', label: 'Rachas en riesgo' },
                { icon: '✅', label: 'Hábitos pendientes' },
                { icon: '🍽️', label: 'Recordatorios de comidas' },
                { icon: '📦', label: 'Stock crítico de inventario' },
                { icon: '💪', label: 'Rutinas de gym' },
              ].map(n => (
                <div key={n.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 16, width: 24, textAlign: 'center', flexShrink: 0 }}>{n.icon}</span>
                  <span style={{ fontSize: 13, color: '#c0c0c0' }}>{n.label}</span>
                </div>
              ))}
            </div>

            {'Notification' in window && Notification.permission !== 'denied' ? (
              <button
                className="btn-auth"
                onClick={async () => {
                  await Notification.requestPermission()
                  localStorage.setItem('notifications_asked', 'true')
                  goToApp()
                }}
                style={{ marginBottom: 8 }}
              >
                <i className="ti ti-bell" style={{ fontSize: 16 }}></i>Activar notificaciones
              </button>
            ) : (
              <button className="btn-auth" onClick={goToApp} disabled={saving} style={{ marginBottom: 8 }}>
                <i className="ti ti-rocket" style={{ fontSize: 16 }}></i>Ir a mi app
              </button>
            )}

            <button
              onClick={() => { localStorage.setItem('notifications_asked', 'true'); goToApp() }}
              disabled={saving}
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: 'none', border: 'none', color: 'var(--text3)',
                fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Ahora no
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
