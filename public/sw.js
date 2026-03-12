const CACHE_NAME = 'votoabierto-v2'
const STATIC_ASSETS = [
  '/',
  '/candidatos',
  '/quiz',
  '/manifest.json',
  '/offline',
]

// Cache on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Network-first for API calls, cache-first for static
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // API calls: network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
          return response
        })
        .catch(() => caches.match(event.request))
    )
    return
  }

  // Static: cache first, fallback to network, then offline page
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request)
        .then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // If navigating, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/offline')
          }
          return new Response('', { status: 503, statusText: 'Offline' })
        })
    )
  )
})
