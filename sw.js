// UNI 5W2H — Service Worker v4 (Network First + Hard Cache Bust)
const CACHE = 'uni-5w2h-v4';
const FILES = ['/', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES.map(f => f + '?v=4')))
  );
  self.skipWaiting(); // ativa imediatamente
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // Apaga TODOS os caches antigos sem exceção
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => {
        console.log('[SW] Apagando cache antigo:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

// Network First: sempre busca servidor, cache só se offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request.url + (e.request.url.includes('?') ? '&' : '?') + 'v=4', {cache: 'no-store'})
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
  if (e.data === 'clearAll') {
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
  }
});
