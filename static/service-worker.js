const CACHE_NAME = "image-processor-cache-v1";
const urlsToCache = [
    "/",
    "/static/styles.css",
    "/static/script.js",
    "/static/icons/icon-192x192.png",
    "/static/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
    console.log("Service Worker Installed");
    event.waitUntil(
      caches.open("static-cache").then((cache) => {
        return cache.addAll(["/"]);
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  

// Update service worker
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
