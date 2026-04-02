const CACHE_NAME = 'winstreak-v3-cache';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Custom network-first caching strategy
  event.respondWith(
    fetch(event.request).then(response => {
      // Don't cache API requests or extension requests
      if (!response || response.status !== 200 || response.type !== 'basic' || event.request.url.includes('/api/')) {
        return response;
      }

      // Clone response to put in cache
      const responseToCache = response.clone();
      caches.open(CACHE_NAME)
        .then(cache => {
          cache.put(event.request, responseToCache);
        });

      return response;
    }).catch(() => {
      // If network fails (offline), return from cache
      return caches.match(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  // Clean up old caches
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
