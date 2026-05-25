import { useState, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { usePWA } from '../hooks/usePWA'

// ── SVG illustrations ──────────────────────────────────────────────────────
const PhoneShareSVG = () => (
  <svg width="56" height="80" viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="52" height="76" rx="8" stroke="rgba(0,212,255,.35)" strokeWidth="1.5"/>
    <rect x="8" y="10" width="40" height="52" rx="3" fill="rgba(0,212,255,.05)"/>
    <rect x="20" y="68" width="16" height="4" rx="2" fill="rgba(0,212,255,.3)"/>
    {/* Share icon */}
    <rect x="15" y="57" width="26" height="10" rx="3" fill="rgba(0,212,255,.15)" stroke="rgba(0,212,255,.5)" strokeWidth="1"/>
    <path d="M24 62 L28 58 L32 62" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="28" y1="58" x2="28" y2="65" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="28" y="65.5" textAnchor="middle" fill="#00D4FF" fontSize="4.5" fontFamily="system-ui">Compartir</text>
  </svg>
)

const AddHomeScreenSVG = () => (
  <svg width="56" height="80" viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="52" height="76" rx="8" stroke="rgba(0,212,255,.35)" strokeWidth="1.5"/>
    <rect x="8" y="10" width="40" height="52" rx="3" fill="rgba(0,212,255,.05)"/>
    {/* Menu row */}
    <rect x="8" y="52" width="40" height="10" rx="2" fill="rgba(0,212,255,.1)" stroke="rgba(0,212,255,.3)" strokeWidth="1"/>
    <path d="M22 57 L28 57 M28 54 L28 60" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
    <text x="28" y="58.5" textAnchor="middle" fill="#00D4FF" fontSize="4" fontFamily="system-ui" dx="8">+ Pantalla inicio</text>
    <rect x="20" y="68" width="16" height="4" rx="2" fill="rgba(0,212,255,.3)"/>
  </svg>
)

const TapAddSVG = () => (
  <svg width="56" height="80" viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="52" height="76" rx="8" stroke="rgba(0,212,255,.35)" strokeWidth="1.5"/>
    <rect x="8" y="10" width="40" height="52" rx="3" fill="rgba(0,212,255,.05)"/>
    {/* Confirm dialog */}
    <rect x="10" y="28" width="36" height="22" rx="4" fill="#111" stroke="rgba(0,212,255,.4)" strokeWidth="1"/>
    <text x="28" y="38" textAnchor="middle" fill="#efefed" fontSize="5" fontFamily="system-ui">¿Agregar?</text>
    <rect x="20" y="42" width="16" height="5" rx="2" fill="rgba(0,212,255,.25)" stroke="#00D4FF" strokeWidth=".8"/>
    <text x="28" y="46" textAnchor="middle" fill="#00D4FF" fontSize="4" fontFamily="system-ui">Agregar</text>
    {/* Finger tap */}
    <circle cx="28" cy="44" r="5" fill="rgba(0,212,255,.12)" stroke="rgba(0,212,255,.4)" strokeWidth="1"/>
    <rect x="20" y="68" width="16" height="4" rx="2" fill="rgba(0,212,255,.3)"/>
  </svg>
)

const ChromeMenuSVG = () => (
  <svg width="56" height="80" viewBox="0 0 56 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="52" height="76" rx="8" stroke="rgba(0,212,255,.35)" strokeWidth="1.5"/>
    <rect x="8" y="10" width="40" height="52" rx="3" fill="rgba(0,212,255,.05)"/>
    {/* Three dots */}
    <circle cx="44" cy="16" r="1.5" fill="#00D4FF"/>
    <circle cx="44" cy="20" r="1.5" fill="#00D4FF"/>
    <circle cx="44" cy="24" r="1.5" fill="#00D4FF"/>
    {/* Dropdown */}
    <rect x="30" y="26" width="22" height="24" rx="3" fill="#1a1a1a" stroke="rgba(0,212,255,.3)" strokeWidth="1"/>
    <text x="41" y="35" textAnchor="middle" fill="#efefed" fontSize="4" fontFamily="system-ui">Instalar app</text>
    <line x1="32" y1="38" x2="50" y2="38" stroke="rgba(0,212,255,.15)" strokeWidth=".8"/>
    <text x="41" y="45" textAnchor="middle" fill="#8a8a85" fontSize="4" fontFamily="system-ui">Configuración</text>
    <rect x="20" y="68" width="16" height="4" rx="2" fill="rgba(0,212,255,.3)"/>
  </svg>
)

const DesktopInstallSVG = () => (
  <svg width="80" height="56" viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="76" height="46" rx="6" stroke="rgba(0,212,255,.35)" strokeWidth="1.5"/>
    <rect x="8" y="12" width="64" height="30" rx="2" fill="rgba(0,212,255,.05)"/>
    {/* Address bar with install icon */}
    <rect x="8" y="6" width="55" height="5" rx="2" fill="rgba(0,212,255,.08)" stroke="rgba(0,212,255,.2)" strokeWidth=".8"/>
    <text x="35" y="10" textAnchor="middle" fill="#555" fontSize="3.5" fontFamily="system-ui">episodiouno.com</text>
    <rect x="65" y="5.5" width="9" height="6" rx="2" fill="rgba(0,212,255,.15)" stroke="rgba(0,212,255,.4)" strokeWidth=".8"/>
    <path d="M68.5 9 L69.5 7 L70.5 9" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="69.5" y1="7" x2="69.5" y2="10" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round"/>
    <rect x="30" y="52" width="20" height="4" rx="2" fill="rgba(0,212,255,.2)"/>
  </svg>
)

// ── Step card ──────────────────────────────────────────────────────────────
function Step({ number, title, desc, svg }) {
  return (
    <div style={{
      display: 'flex', gap: 16, alignItems: 'flex-start',
      padding: '20px', borderRadius: 12,
      background: 'rgba(0,212,255,.04)',
      border: '1px solid rgba(0,212,255,.12)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(0,212,255,.12)', border: '1px solid rgba(0,212,255,.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 14, color: '#00D4FF',
      }}>
        {number}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#efefed', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#8a8a85', lineHeight: 1.6 }}>{desc}</div>
      </div>
      {svg && (
        <div style={{ flexShrink: 0, opacity: .85 }}>{svg}</div>
      )}
    </div>
  )
}

// ── iOS tab ────────────────────────────────────────────────────────────────
function IOSTab({ isSafari }) {
  if (!isSafari) {
    return (
      <div style={{
        padding: '24px', borderRadius: 12, textAlign: 'center',
        background: 'rgba(255,184,0,.05)', border: '1px solid rgba(255,184,0,.25)',
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🌐</div>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#FFB800', marginBottom: 8 }}>
          Abre esta página en Safari
        </div>
        <div style={{ fontSize: 13, color: '#8a8a85', lineHeight: 1.7 }}>
          Para instalar Episodio Uno en tu iPhone necesitas usar <strong style={{ color: '#efefed' }}>Safari</strong>.
          Copia el enlace y ábrelo en Safari para continuar.
        </div>
        <div style={{
          marginTop: 16, padding: '10px 16px', borderRadius: 8,
          background: '#1a1a1a', border: '1px solid #2a2a2a',
          fontSize: 13, color: '#00D4FF', fontFamily: 'monospace',
        }}>
          episodiouno.com
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Step
        number="1"
        title='Toca el botón "Compartir"'
        desc='En la barra inferior de Safari, toca el ícono de compartir (cuadrado con flecha hacia arriba).'
        svg={<PhoneShareSVG />}
      />
      <Step
        number="2"
        title='"Agregar a pantalla de inicio"'
        desc='Desliza el menú hacia abajo y toca la opción "En la pantalla de inicio".'
        svg={<AddHomeScreenSVG />}
      />
      <Step
        number="3"
        title='Confirma tocando "Agregar"'
        desc='Aparece una ventana de confirmación. Toca "Agregar" y la app aparecerá en tu pantalla de inicio.'
        svg={<TapAddSVG />}
      />
    </div>
  )
}

// ── Android tab ────────────────────────────────────────────────────────────
function AndroidTab({ canInstallNatively, triggerInstall, onInstalled }) {
  const [installing, setInstalling] = useState(false)
  const [done, setDone] = useState(false)

  const handleInstall = async () => {
    setInstalling(true)
    const accepted = await triggerInstall()
    setInstalling(false)
    if (accepted) { setDone(true); onInstalled?.() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {canInstallNatively ? (
        <div style={{
          padding: '20px', borderRadius: 12, textAlign: 'center',
          background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.2)',
          marginBottom: 4,
        }}>
          {done ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#4ade80' }}>¡Instalada correctamente!</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📲</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#efefed', marginBottom: 8 }}>
                Tu dispositivo está listo
              </div>
              <div style={{ fontSize: 13, color: '#8a8a85', marginBottom: 16 }}>
                Instala Episodio Uno directamente desde aquí con un solo toque.
              </div>
              <button
                onClick={handleInstall}
                disabled={installing}
                style={{
                  background: '#00D4FF', color: '#000', border: 'none',
                  borderRadius: 10, padding: '12px 28px',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: installing ? .6 : 1,
                }}
              >
                {installing ? 'Instalando…' : '⚡ Instalar ahora'}
              </button>
            </>
          )}
        </div>
      ) : (
        <Step
          number="1"
          title="Toca los tres puntos (⋮)"
          desc="En la esquina superior derecha de Chrome, toca el menú de tres puntos."
          svg={<ChromeMenuSVG />}
        />
      )}

      <Step
        number={canInstallNatively ? '1' : '2'}
        title='"Instalar aplicación" o "Agregar a pantalla de inicio"'
        desc='Selecciona la opción de instalación y confirma. La app aparecerá en tu pantalla de inicio.'
        svg={<TapAddSVG />}
      />
    </div>
  )
}

// ── Desktop tab ────────────────────────────────────────────────────────────
function DesktopTab({ canInstallNatively, triggerInstall, onInstalled }) {
  const [installing, setInstalling] = useState(false)
  const [done, setDone] = useState(false)

  const handleInstall = async () => {
    setInstalling(true)
    const accepted = await triggerInstall()
    setInstalling(false)
    if (accepted) { setDone(true); onInstalled?.() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {canInstallNatively && (
        <div style={{
          padding: '20px', borderRadius: 12, textAlign: 'center',
          background: 'rgba(0,212,255,.06)', border: '1px solid rgba(0,212,255,.2)',
          marginBottom: 4,
        }}>
          {done ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#4ade80' }}>¡Instalada correctamente!</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💻</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#efefed', marginBottom: 8 }}>
                Instala desde Chrome o Edge
              </div>
              <button
                onClick={handleInstall}
                disabled={installing}
                style={{
                  background: '#00D4FF', color: '#000', border: 'none',
                  borderRadius: 10, padding: '12px 28px',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: installing ? .6 : 1,
                }}
              >
                {installing ? 'Instalando…' : '⚡ Instalar ahora'}
              </button>
            </>
          )}
        </div>
      )}

      <Step
        number="1"
        title="Busca el ícono de instalación en la barra de direcciones"
        desc="En Chrome o Edge, aparece un ícono de descarga (↑) a la derecha de la barra de direcciones."
        svg={<DesktopInstallSVG />}
      />
      <Step
        number="2"
        title='Haz clic en "Instalar"'
        desc='Aparece un diálogo. Haz clic en "Instalar" y la app se agrega a tu escritorio y menú de inicio.'
        svg={<TapAddSVG />}
      />
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Instalar() {
  const { setAppPage } = useContext(AppContext)
  const { isStandalone, installed, isIOS, isAndroid, isSafari, canInstallNatively, triggerInstall } = usePWA()

  const defaultTab = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'
  const [tab, setTab] = useState(defaultTab)
  const [done, setDone] = useState(false)

  const TABS = [
    { id: 'ios',     label: 'iPhone / iPad' },
    { id: 'android', label: 'Android'       },
    { id: 'desktop', label: 'Mac / PC'      },
  ]

  if (isStandalone || installed || done) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>✅</div>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#efefed', marginBottom: 12 }}>
          ¡Episodio Uno está instalada!
        </div>
        <div style={{ fontSize: 15, color: '#8a8a85', marginBottom: 32 }}>
          Ya puedes acceder desde tu pantalla de inicio, incluso sin conexión.
        </div>
        <button
          className="btn btn-dark"
          onClick={() => setAppPage('dashboard')}
        >
          <i className="ti ti-home" /> Ir al inicio
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Instalar app</div>
          <div className="page-sub">Acceso rápido y funciona sin internet</div>
        </div>
      </div>

      {/* Hero */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(0,212,255,.07) 0%, rgba(0,0,0,0) 60%)',
        border: '1px solid rgba(0,212,255,.2)', marginBottom: 24,
        display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 14, flexShrink: 0,
          background: 'linear-gradient(135deg, #00D4FF 0%, #0080a0 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, boxShadow: '0 0 24px rgba(0,212,255,.3)',
        }}>
          ⚡
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#efefed', marginBottom: 4 }}>
            Episodio Uno como app nativa
          </div>
          <div style={{ fontSize: 13, color: '#8a8a85', lineHeight: 1.6 }}>
            Sin el navegador. Más rápida. Con acceso directo desde tu pantalla de inicio.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 4 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 7,
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              background: tab === t.id ? 'rgba(0,212,255,.15)' : 'transparent',
              color: tab === t.id ? '#00D4FF' : '#555',
              transition: 'all .2s',
              boxShadow: tab === t.id ? 'inset 0 0 0 1px rgba(0,212,255,.3)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        {tab === 'ios'     && <IOSTab isSafari={isSafari} />}
        {tab === 'android' && <AndroidTab canInstallNatively={canInstallNatively} triggerInstall={triggerInstall} onInstalled={() => setDone(true)} />}
        {tab === 'desktop' && <DesktopTab canInstallNatively={canInstallNatively} triggerInstall={triggerInstall} onInstalled={() => setDone(true)} />}
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <button
          onClick={() => { localStorage.setItem('pwa_installed', 'true'); setAppPage('dashboard') }}
          style={{ background: 'none', border: 'none', color: '#555', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', fontFamily: "'DM Sans', sans-serif" }}
        >
          Ya la instalé ✓
        </button>
      </div>
    </div>
  )
}
