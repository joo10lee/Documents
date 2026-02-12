// sw.js - 아주 기본적인 서비스 워커
self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
  });
  
  self.addEventListener('fetch', (e) => {
    // 앱이 작동하기 위한 필수 빈 처리
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  });