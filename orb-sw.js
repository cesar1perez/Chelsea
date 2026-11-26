// Orb — Service Worker mínimo para que la app instalada abra sin internet
// Ojos, botones y registro local funcionan offline.
// El reconocimiento de voz de Chrome NO funciona offline: necesita internet.
// Fase 2.3: al tocar una notificación de recordatorio, vuelve a abrir el Orb.
// Fase 2.8: caché orb-v2-9 (Chelsea se ve seguro + Blanco cálido;
// sin este cambio el teléfono seguiría sirviendo la 2.7 desde la caché).
var CACHE = "orb-v2-9";
var ARCHIVOS = ["orb-ojos-fase2-9.html", "orb-manifest.json", "orb-icon-192.png", "orb-icon-512.png", "orb-chelsea.jpg"];
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
      return caches.match("orb-ojos-fase2-9.html");
    })
  );
});
self.addEventListener("notificationclick", function(e) {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(lista) {
      for (var i = 0; i < lista.length; i++) {
        if (lista[i].url.indexOf("orb-ojos-fase2-9.html") !== -1) return lista[i].focus();
      }
      if (clients.openWindow) return clients.openWindow("orb-ojos-fase2-9.html");
    })
  );
});
