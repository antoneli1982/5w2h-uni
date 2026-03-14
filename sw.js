// SW v20 — sem cache de HTML, sempre busca da rede
const CACHE = 'v20';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  // Nunca cacheia — sempre vai à rede
  // Em offline usa cache como fallback
  const req = e.request;
  if(req.method !== 'GET') return;
  e.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
