import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Capture install prompt as early as possible — React components may mount after it fires
window.deferredInstallPrompt = null
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.deferredInstallPrompt = e
})

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (e) {
  console.error('[main] render error:', e)
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:16px;font-family:system-ui;padding:24px">
        <p style="color:#888;font-size:14px;text-align:center">Algo salió mal</p>
        <button onclick="window.location.reload()" style="padding:12px 24px;background:#4f8ef7;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer">
          Toca para recargar
        </button>
      </div>
    `
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
  // Cuando un nuevo SW toma control (después de skipWaiting), recarga la página
  // para que el usuario obtenga el código más reciente sin limpiar caché manualmente.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}
