// public/service-worker.js
const CACHE_NAME = 'kmu-likelion-v1.1'; // 캐시 버전을 변경하여 새 캐시 강제 적용
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/static/js/main.js',
  '/static/css/main.css',
];

// 서비스 워커 설치 및 캐시 저장
self.addEventListener('install', (event) => {
  // 즉시 활성화하여 이전 서비스 워커를 대체
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // console.log('캐시 생성됨');
        return cache.addAll(urlsToCache);
      })
  );
});

// 네트워크 요청 캐치하여 캐시된 응답 반환 - 네트워크 우선 전략으로 변경
self.addEventListener('fetch', (event) => {
  // HTML 파일은 항상 네트워크에서 가져오도록 처리
  if (event.request.url.includes('/index.html') || event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .catch((error) => {
          // 네트워크 실패 시에만 캐시 사용
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 다른 자원들에 대해서는 네트워크 우선, 실패 시 캐시 사용
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 유효한 응답이면 캐시 업데이트
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 요청 실패 시 캐시에서 제공
        return caches.match(event.request);
      })
  );
});

// 활성화 시 즉시 제어권 얻기
self.addEventListener('activate', (event) => {
  // 새 서비스 워커가 즉시 페이지를 제어하도록 함
  self.clients.claim();
  
  // 이전 버전의 캐시 삭제
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

// 주기적으로 업데이트 확인 - 선택사항
// 6시간마다 캐시 업데이트 (밀리초 단위)
const SIX_HOURS = 6 * 60 * 60 * 1000;
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-cache') {
    event.waitUntil(updateCache());
  }
});

// 수동 업데이트 함수
async function updateCache() {
  const cache = await caches.open(CACHE_NAME);
  for (const url of urlsToCache) {
    try {
      await cache.add(url);
    } catch (error) {
      console.error(`Failed to update cache for ${url}:`, error);
    }
  }
}