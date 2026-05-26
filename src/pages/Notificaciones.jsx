import { useState, useEffect, useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { supabase } from '../lib/supabase'

const PREFS_KEY = 'notif_prefs'

const DEFAULT_PREFS = {
  streaks:  true,
  habits:   true,
  meals:    true,
  stock:    true,
  gym:      true,
}

const TYPES = [
  { key: 'streaks', icon: '🔥', label: 'Rachas en riesgo',             desc: 'Cuando tu racha del día esté por romperse' },
  { key: 'habits',  icon: '✅', label: 'Hábitos pendientes',           desc: 'Recordatorio por la tarde si tienes hábitos sin completar' },
  { key: 'meals',   icon: '🍽️', label: 'Recordatorios de comidas',    desc: 'Aviso de tus comidas programadas del día' },
  { key: 'stock',   icon: '📦', label: 'Stock crítico de inventario',  desc: 'Cuando algún producto de tu cocina esté por agotarse' },
  { key: 'gym',     icon: '💪', label: 'Rutinas de gym',               desc: 'Recordatorio de tus días de entrenamiento' },
]

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - base64.length % 4) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 42, height: 24, borderRadius: 12, cursor: 'pointer',
        background: checked ? '#00D4FF' : 'rgba(255,255,255,.1)',
        border: checked ? '1px solid #00D4FF' : '1px solid #333',
        position: 'relative', flexShrink: 0, transition: 'all .2s',
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2,
        left: checked ? 21 : 3,
        transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.4)',
      }} />
    </div>
  )
}

export default function Notificaciones() {
  const { currentUser } = useContext(AppContext)
  const supported = 'Notification' in window && 'serviceWorker' in navigator

  const [permission,  setPermission]  = useState(supported ? Notification.permission : 'unsupported')
  const [prefs,       setPrefs]       = useState(() => {
    try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') } }
    catch { return DEFAULT_PREFS }
  })
  const [requesting,  setRequesting]  = useState(false)
  const [pushSaved,   setPushSaved]   = useState(false)

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  }, [prefs])

  // Check if already subscribed on mount
  useEffect(() => {
    if (permission !== 'granted' || !supported) return
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => { if (sub) setPushSaved(true) })
    )
  }, [permission, supported])

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }))

  const subscribeToPush = async () => {
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!vapidKey || !currentUser?.id) return
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing || await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      await supabase.from('push_subscriptions').upsert(
        { user_id: currentUser.id, subscription: sub.toJSON() },
        { onConflict: 'user_id' }
      )
      setPushSaved(true)
    } catch (err) {
      console.error('Push subscription error:', err)
    }
  }

  const requestPermission = async () => {
    if (!supported || permission === 'denied') return
    setRequesting(true)
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') await subscribeToPush()
    setRequesting(false)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Notificaciones</div>
          <div className="page-sub">Controla qué avisos quieres recibir</div>
        </div>
      </div>

      {/* Permission status banner */}
      {permission !== 'granted' && (
        <div className="card" style={{
          marginBottom: 20,
          background: permission === 'denied'
            ? 'rgba(224,85,85,.06)'
            : 'rgba(0,212,255,.06)',
          border: `1px solid ${permission === 'denied' ? 'rgba(224,85,85,.25)' : 'rgba(0,212,255,.2)'}`,
        }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>
              {permission === 'denied' ? '🚫' : '🔔'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: '#efefed' }}>
                {permission === 'denied'
                  ? 'Notificaciones bloqueadas'
                  : permission === 'unsupported'
                  ? 'Notificaciones no disponibles'
                  : 'Notificaciones desactivadas'}
              </div>
              <div style={{ fontSize: 13, color: '#8a8a85', lineHeight: 1.6, marginBottom: permission === 'denied' ? 0 : 12 }}>
                {permission === 'denied'
                  ? 'Has bloqueado las notificaciones para este sitio. Para activarlas, ve a la configuración de tu navegador → Permisos del sitio.'
                  : permission === 'unsupported'
                  ? 'Tu navegador no soporta notificaciones push. Instala la app para recibirlas.'
                  : 'Las notificaciones están desactivadas. Actívalas para recibir recordatorios de tus hábitos.'}
              </div>
              {permission === 'default' && (
                <button
                  onClick={requestPermission}
                  disabled={requesting}
                  style={{
                    background: '#00D4FF', color: '#000', border: 'none',
                    borderRadius: 8, padding: '8px 18px', fontSize: 13,
                    fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                    opacity: requesting ? .6 : 1,
                  }}
                >
                  {requesting ? 'Activando…' : '🔔 Activar notificaciones'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Push active confirmation */}
      {permission === 'granted' && pushSaved && (
        <div className="card" style={{
          marginBottom: 20,
          background: 'rgba(29,158,117,.06)',
          border: '1px solid rgba(29,158,117,.25)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#efefed' }}>Notificaciones push activas</div>
            <div style={{ fontSize: 12, color: '#8a8a85', marginTop: 2 }}>
              Recibirás avisos aunque la app esté cerrada.
            </div>
          </div>
        </div>
      )}

      {/* Notification type toggles */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 14, color: '#efefed', marginBottom: 16 }}>
          Tipos de notificación
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {TYPES.map((t, i) => (
            <div
              key={t.key}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 0',
                borderBottom: i < TYPES.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none',
                opacity: permission !== 'granted' ? .5 : 1,
              }}
            >
              <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: '#efefed', marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: '#555' }}>{t.desc}</div>
              </div>
              <Toggle
                checked={prefs[t.key] && permission === 'granted'}
                onChange={() => permission === 'granted' && toggle(t.key)}
              />
            </div>
          ))}
        </div>
      </div>

      {permission === 'granted' && (
        <div style={{ fontSize: 12, color: '#444', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          Las preferencias se guardan localmente en este dispositivo.
        </div>
      )}
    </div>
  )
}
