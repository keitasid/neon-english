const CACHE = 'neon-italiano-v1.9';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './vocabulary.js', './mindmap.js', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function appResponse(request) {
  const response = await fetch(request);
  if (request.mode !== 'navigate') return response;
  try {
    const html = await response.text();
    if (html.includes('mindmap.js')) return new Response(html, {status:response.status,statusText:response.statusText,headers:response.headers});
    const injected = html.replace('</body>', '<script src="mindmap.js"></script></body>');
    const headers = new Headers(response.headers);
    headers.set('content-type','text/html; charset=utf-8');
    return new Response(injected,{status:response.status,statusText:response.statusText,headers});
  } catch (_) { return response; }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(async cached => {
    if (cached) return cached;
    try {
      const response = await appResponse(event.request);
      const copy = response.clone();
      caches.open(CACHE).then(c => c.put(event.request, copy));
      return response;
    } catch (_) { return caches.match('./index.html'); }
  }));
});
