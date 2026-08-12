const CACHE_NAME = 'carta-digital-static-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
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

  // Los datos de Supabase NO se almacenan en Cache Storage.
  // Esto evita servir precios, disponibilidad, familias o configuración obsoletos.
  // Si la red falla, la aplicación recibe el error normal de Supabase y puede
  // mostrar su estado de error/carga correspondiente.
  if (url.hostname.endsWith('.supabase.co')) return;

  // Para navegación, intenta siempre obtener la versión actual. Si no hay red,
  // utiliza el index.html precargado para permitir que la SPA pueda arrancar.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Recursos estáticos: cache-first con actualización en segundo plano.
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
