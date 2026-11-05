const CACHE_NAME = 'mrq-schedule-v15';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './apple-touch-icon.png',
  './favicon-32.png',
  './favicon-64.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 智慧快取策略：HTML 頁面「Network First（網路優先）」，確保每次點開 App 都能拿到最新版！
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // Google Apps Script API 放行直接連線
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  const isHtml = event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html');

  if (isHtml) {
    // 網路優先：只要有連網，一律向伺服器拿最新 HTML，斷網離線時才用本機快取
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request) || caches.match('./index.html'))
    );
    return;
  }

  // 靜態圖示資源：先用快取秒開，背景檢查更新
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
