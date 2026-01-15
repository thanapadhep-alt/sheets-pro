const CACHE_NAME = "sheets-pro-v10"; // ✅ เปลี่ยนเลขทุกครั้งที่แก้

const ASSETS = [
  "./",
  "./index.html",
  "./SCB.html",
  "./ป.58พื้นที่.html",
  "./manifest.json",
  "./service-worker.js",

  "./libs/xlsx.full.min.js",

  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // ✅ HTML / refresh / navigation: ใช้ cache ก่อน (สำคัญมาก)
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        });
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // ✅ ไฟล์อื่น ๆ: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
