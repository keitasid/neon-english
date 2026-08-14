const CACHE = "neon-english-v0.2.2";
const ASSETS = [
  "./",
  "./index.html?v=0.2.2",
  "./styles.css?v=0.2.2",
  "./app.js?v=0.2.2",
  "./srs.js?v=0.2.2",
  "./mindmap.js?v=0.2.2",
  "./story.js?v=0.2.2",
  "./importer.js?v=0.2.2",
  "./analytics.js?v=0.2.2",
  "./data/vocabulary.js?v=0.2.2",
  "./manifest.webmanifest",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE) {
            console.log("[ServiceWorker English] Deleting old cache:", k);
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("./index.html?v=0.2.2") || caches.match("./index.html"))
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
      }).catch(() => caches.match("./index.html?v=0.2.2"));
    })
  );
});