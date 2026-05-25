import { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { usePWA } from '../hooks/usePWA'

const STORAGE_KEY  = 'install_banner_dismissed'
const FIRST_OPEN   = 'first_open_date'
const DAYS_DELAY   = 3

export default function InstallBanner() {
  const { setAppPage } = useContext(AppContext)
  const { isStandalone, installed } = usePWA()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone || installed) return
    if (localStorage.getItem(STORAGE_KEY)) return

    // Record first open date
    if (!localStorage.getItem(FIRST_OPEN)) {
      localStorage.setItem(FIRST_OPEN, new Date().toISOString())
      return // don't show on first day
    }

    const firstOpen  = new Date(localStorage.getItem(FIRST_OPEN))
    const daysPassed = (Date.now() - firstOpen.getTime()) / (1000 * 60 * 60 * 24)
    if (daysPassed >= DAYS_DELAY) setVisible(true)
  }, [isStandalone, installed])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      background: 'rgba(0,212,255,.07)',
      border: '1px solid rgba(0,212,255,.2)',
      borderRadius: 12, margin: '0 0 20px',
      padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideDown .3s ease',
    }}>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <span style={{ fontSize: 20 }}>📱</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: '#c0c0c0', lineHeight: 1.4 }}>
          ¿Ya instalaste la app? Es más rápido y funciona sin internet.
        </span>
      </div>

      <button
        onClick={() => setAppPage('instalar')}
        style={{
          flexShrink: 0, background: 'rgba(0,212,255,.15)',
          border: '1px solid rgba(0,212,255,.35)', color: '#00D4FF',
          borderRadius: 8, padding: '5px 12px', fontSize: 12,
          fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Cómo instalar
      </button>

      <button
        onClick={dismiss}
        aria-label="Cerrar"
        style={{
          flexShrink: 0, background: 'none', border: 'none',
          color: '#555', fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
