// public/service-worker.js
const CACHE_NAME = 'kmu-likelion-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/static/js/main.js', // 빌드 후 생성되는 메인 JS 파일 (실제 경로는 빌드 결과에 따라 다를 수 있음)
  '/static/css/main.css', // 빌드 후 생성되는 메인 CSS 파일
];

// 서비스 워커 설치 및 캐시 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // console.log('캐시 생성됨');
        return cache.addAll(urlsToCache);
      })
  );
});

// 네트워크 요청 캐치하여 캐시된 응답 반환
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시가 존재하면 캐시된 버전 반환
        if (response) {
          return response;
        }
        
        // 캐시가 없으면 네트워크로 요청
        return fetch(event.request)
          .then((response) => {
            // 유효한 응답이 아니면 그냥 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 향후 사용을 위해 응답 복제 및 캐싱
            let responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});

// 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});