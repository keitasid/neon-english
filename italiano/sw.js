const CACHE = 'neon-italiano-v2.0.0';
const ASSETS = [
  './',
  './index.html?v=2.0.0',
  './styles.css?v=2.0.0',
  './app.js?v=2.0.0',
  './mindmap.js?v=2.0.0',
  './analytics.js?v=2.0.0',
  './immersion_scenarios.js?v=2.0.0',
  './vocabulary.js?v=2.0.0',
  './manifest.webmanifest?v=2.0.0'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE) {
            console.log('[SW Italiano] Suppression ancien cache:', k);
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('./index.html?v=2.0.0') || caches.match('./index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => {
      if (r) return r;
      return fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match('./index.html?v=2.0.0'));
    })
  );
});
