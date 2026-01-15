const CACHE_NAME = "sheets-pro-v5";

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

  // ✅ กรณีเปิดหน้าเว็บ / refresh / เปลี่ยนหน้า (HTML navigation)
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req).then((cached) => {
        // 1) ถ้ามีใน cache ใช้ทันที (รีเฟรช offline ได้แน่นอน)
        if (cached) return cached;

        // 2) ถ้าไม่มีค่อยไปเน็ต แล้วเก็บลง cache
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        });
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // ✅ ไฟล์อื่นๆ
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
