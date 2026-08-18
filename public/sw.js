const CACHE_NAME = 'carta-digital-static-v3';
const BASE_PATH = '/carta-camborio';
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // The service worker only belongs to the CartaDigitalQR subpath.
  if (url.origin !== self.location.origin || !url.pathname.startsWith(`${BASE_PATH}/`)) {
    return;
  }

  // Supabase data must never be stored in Cache Storage.
  if (url.hostname.endsWith('.supabase.co')) return;

  // Navigation always prefers the current network response. If offline,
  // fall back to the cached SPA entry point for this subpath.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(`${BASE_PATH}/index.html`))
    );
    return;
  }

  // Static resources use cache-first with a background network refresh.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkRequest = fetch(request).then((response) => {
        if (response && response.ok && response.type === 'basic') {
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()))
          );
        }
        return response;
      });

      return cachedResponse || networkRequest;
    })
  );
});
