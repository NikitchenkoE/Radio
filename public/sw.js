// Service Worker for Sloboda FM PWA
// v5: Pure offline app shell. Audio & live radio streams strictly bypass service worker
// to preserve native browser audio streaming, Shoutcast/Icecast protocols and zero-latency playback.

const STATIC_CACHE_NAME = 'sloboda-pwa-static-v5';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/icon-maskable.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Audio streams, radio live streaming, and media must strictly bypass the Service Worker.
  // The browser's native audio engine handles live Icecast/Shoutcast/AAC/MP3 streams directly.
  const isMediaOrStream =
    event.request.destination === 'audio' ||
    event.request.destination === 'video' ||
    url.includes('.mp3') ||
    url.includes('.aac') ||
    url.includes('.m3u8') ||
    url.includes(':8000') ||
    url.includes(':8002') ||
    url.includes(':8094') ||
    url.includes(':8443') ||
    url.includes('/stream') ||
    url.includes('icecast') ||
    url.includes('cast.mediaonline') ||
    url.includes('suspilne.radio') ||
    url.includes('armyfm') ||
    url.includes('radiogroup.com.ua') ||
    url.includes('radio.nv.ua') ||
    url.includes('lux.fm') ||
    url.includes('perets.fm') ||
    url.includes('prosto.fm') ||
    url.includes('dreamsiteradiocp') ||
    url.includes('youtube') ||
    url.includes('googlevideo');

  if (isMediaOrStream) {
    return; // Pass through to network directly without service worker interception
  }

  // App Shell & Static assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            event.request.method === 'GET'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
