const V="ha-08bc384ad0",PRE=["/hebrew/app/", "/hebrew/app/manifest.webmanifest", "/hebrew/app/icons/icon-192.png", "/hebrew/app/icons/icon-512.png", "/hebrew/app/icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(PRE.map(u=>c.add(u).catch(()=>0)))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith("ha-")&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
if(r.mode==="navigate"){e.respondWith(fetch(r).then(x=>{const y=x.clone();caches.open(V).then(c=>c.put(r,y));return x}).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match("/hebrew/app/"))));return}
e.respondWith(caches.match(r).then(x=>x||fetch(r).then(y=>{if(y.ok){const z=y.clone();caches.open(V).then(c=>c.put(r,z))}return y})))});
