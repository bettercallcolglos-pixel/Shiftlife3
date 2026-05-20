// KineticShift Service Worker v1.1
const CACHE_NAME = 'kineticshift-v1.1';
const ASSETS = [
  '/',
  '/index.html',
  '/privacy.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install — cache all assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request)
        .then(response => {
          // Cache successful responses
          if(response && response.status === 200 && response.type === 'basic'){
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
      ).catch(() => caches.match('/index.html'))
  );
});
