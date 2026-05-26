const CACHE = 'episodio-v2'

// Recursos del app shell que se cachean al instalar
const SHELL = [
  '/',
  '/index.html',
]

// ── Instalación: cachea el shell ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  )
  self.skipWaiting()
})

// ── Activación: elimina cachés viejas ─────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ── Push notifications ────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() || {}
  const title   = data.title || 'Episodio Uno'
  const options = {
    body:    data.body  || '',
    icon:    '/icons/icon-192x192.png',
    badge:   '/icons/icon-72x72.png',
    data:    { url: data.url || '/' },
    vibrate: [100, 50, 100],
    tag:     data.tag || 'episodio-uno',
    renotify: true,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus()
      }
      return clients.openWindow(url)
    })
  )
})

// ── Fetch: estrategia según el tipo de recurso ────────────────
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Supabase y APIs externas → siempre red, sin cachear
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('jsdelivr.net') ||
    request.method !== 'GET'
  ) return

  // App shell y assets → cache-first, fallback a red
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached

      return fetch(request).then(response => {
        // Solo cachear respuestas válidas
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response
        }
        const clone = response.clone()
        caches.open(CACHE).then(cache => cache.put(request, clone))
        return response
      }).catch(() => {
        // Sin red y sin caché → devuelve el index.html para que React maneje el error
        if (request.destination === 'document') {
          return caches.match('/index.html')
        }
      })
    })
  )
})
