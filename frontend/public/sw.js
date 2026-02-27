// Merxios CRM — Service Worker (App Shell Cache)
const CACHE_NAME = 'merxios-shell-v1';

// Recursos da shell que queremos em cache para carregamento instantâneo
const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Instalação: pré-cache da shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estratégia de fetch:
// - Requisições de API → sempre network (sem cache)
// - Resto → cache-first com fallback para network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Não cachear chamadas de API ou de autenticação
  if (
    url.pathname.startsWith('/webhook/') ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('clerk') ||
    url.hostname.includes('accounts')
  ) {
    return;
  }

  // Apenas requisições GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          // Cacheie apenas respostas bem-sucedidas de origem própria
          if (
            response &&
            response.status === 200 &&
            response.type === 'basic'
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('/'));
    })
  );
});
