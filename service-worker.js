const CACHE_NAME = "sheets-pro-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./ป.58พื้นที่.html",
  "./SCB.html",
  "./manifest.json",
  "./service-worker.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// ✅ install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ✅ activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// ✅ fetch (รองรับ offline navigation หน้า 2/3)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // ✅ ถ้าเป็นการเปิดหน้าเว็บ (navigate) ให้ fallback ไป cache
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then(res => res || caches.match("./index.html")))
    );
    return;
  }

  // ไฟล์ทั่วไป
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((networkRes) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, networkRes.clone());
            return networkRes;
          });
        }).catch(() => cached)
      );
    })
  );
});
