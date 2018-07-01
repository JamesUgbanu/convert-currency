var staticCacheName = 'curren-static-v7';
var contentImgsCache = 'curren-content-imgs';
var allCaches = [
  staticCacheName,
  contentImgsCache
];

 self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll([
        '/',
        '/style.css',
        '/script.js',
        '/db.js'
      ]);
    })
  );
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith('curren-') &&
                 !allCaches.includes(cacheName);
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  let requestUrl = new URL(event.request.url);
   
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
  
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
