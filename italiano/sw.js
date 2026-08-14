const CACHE='neon-italiano-v1.9.2';
const ASSETS=['./','./index.html','./styles.css','./app.js','./vocabulary.js','./mindmap.js','./mindmap-init.js','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function transformedApp(request){
  const r=await fetch(request,{cache:'no-store'});
  const src=await r.text();
  const injection=`\n;(()=>{const s=document.createElement('script');s.src='./mindmap.js?v=1.9.2';s.onload=()=>{const i=document.createElement('script');i.src='./mindmap-init.js?v=1.9.2';document.head.appendChild(i)};document.head.appendChild(s)})();\n`;
  const h=new Headers(r.headers);h.set('content-type','application/javascript; charset=utf-8');
  return new Response(src+injection,{status:r.status,statusText:r.statusText,headers:h});
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith((async()=>{
    try{
      const url=new URL(e.request.url);
      if(url.pathname.endsWith('/italiano/app.js')){
        const response=await transformedApp(e.request);
        const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));
        return response;
      }
      const cached=await caches.match(e.request);if(cached)return cached;
      const response=await fetch(e.request);const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return response;
    }catch(_){return caches.match(e.request)||caches.match('./index.html');}
  })());
});
