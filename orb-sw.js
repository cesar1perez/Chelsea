// Orb — Service Worker mínimo para que la app instalada abra sin internet
// Ojos, botones y registro local funcionan offline.
// El reconocimiento de voz de Chrome NO funciona offline: necesita internet.
// Fase 2.3: al tocar una notificación de recordatorio, vuelve a abrir el Orb.
// Fase 2.19: caché orb-v2-20 — solo cambia el número de versión. Sigue
// sirviendo index.html (en GitHub Pages el HTML vive como index.html;
// el cambio de la 2.9b se mantiene: nada de orb-ojos-fase2-9.html).
var CACHE = "orb-v2-20";
var ARCHIVOS = ["index.html", "orb-manifest.json", "orb-icon-192.png", "orb-icon-512.png", "orb-chelsea.jpg"];
self.addEventListener("install", function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ARCHIVOS); }));
});
self.addEventListener("activate", function(e) {
  e.waitUntil(caches.keys().then(function(nombres) {
    return Promise.all(nombres.filter(function(n){ return n !== CACHE; }).map(function(n){ return caches.delete(n); }));
  }));
});
self.addEventListener("fetch", function(e) {
  e.respondWith(
    caches.match(e.request).then(function(r) { return r || fetch(e.request); }).catch(function() {
      return caches.match("index.html");
    })
  );
});
self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(lista) {
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].url.indexOf("index.html") !== -1) return lista[i].focus();
      }
      if (clients.openWindow) return clients.openWindow("index.html");
    })
  );
});
