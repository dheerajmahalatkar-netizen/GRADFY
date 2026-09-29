// GRADFY Resilient Service Worker v2.4
const CACHE_NAME = 'gradfy-cache-v2.4';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networked = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline and requesting page navigation, serve app shell
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return cached;
        });

      return cached || networked;
    })
  );
});
