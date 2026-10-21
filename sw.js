// Cache only public static app assets; never cache GitHub API or user state.
const VERSION='slot22-static-v32';
const ASSETS=['./','./index.html','./styles.css','./app.js','./core.mjs','./catalog.mjs','./artwork.mjs','./dashboard.mjs','./capacities.mjs','./helper-plan.mjs','./helper-advice.mjs','./full-plan.mjs','./command-center.mjs','./visual-command.mjs','./upgrade-reference.mjs','./extended-reference.mjs','./upgrade-directory.mjs','./strategy-guides.mjs','./base-layouts.mjs','./base-layout-preview-catalog.mjs','./resource-ocr.mjs','./resource-hud.mjs','./resource-crop.mjs','./resource-scan.mjs','./snapshot-insights.mjs','./insights-view.mjs','./snapshot-intelligence.mjs','./intelligence-view.mjs','./experience.mjs','./pass-rewards.mjs','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('slot22-static-')&&k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.includes('/data/'))return;
 event.respondWith(fetch(event.request).then(resp=>{if(resp.ok)caches.open(VERSION).then(c=>c.put(event.request,resp.clone()));return resp;}).catch(()=>caches.match(event.request)));
});
