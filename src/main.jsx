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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

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
