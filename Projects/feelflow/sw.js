// sw.js - Service Worker (Updated: 0217-1526)
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // 앱이 작동하기 위한 필수 빈 처리
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});