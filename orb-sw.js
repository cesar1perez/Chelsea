// Chelsea · Orb 4.0 — Service Worker
// Abre sin internet (la app y tus datos locales). La voz y Sheets sí necesitan red.
// Las peticiones a Google (Apps Script) NUNCA se guardan en caché.
var CACHE = "chelsea-v4-2";
var ARCHIVOS = ["index.html", "orb-manifest.json", "orb-icon-192.png", "orb-icon-512.png", "orb-chelsea.jpg"];
self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (n) {
    return Promise.all(n.filter(function (x) { return x !== CACHE; }).map(function (x) { return caches.delete(x); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // Sheets va directo a la red
  // Red primero para la app (así siempre tienes la versión nueva); caché si no hay internet
  e.respondWith(
    fetch(e.request).then(function (r) {
      var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copia); }); return r;
    }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); }); })
  );
});
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (l) {
    for (var i = 0; i < l.length; i++) if ("focus" in l[i]) return l[i].focus();
    if (clients.openWindow) return clients.openWindow("index.html");
  }));
});
