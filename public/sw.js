// ============================================================
// SERVICE WORKER — Expense Tracker PWA
// ============================================================
// This service worker implements:
//   1. Cache-first strategy for static assets (app shell)
//   2. Network-first strategy for dynamic requests
//   3. Proper install / activate / fetch lifecycle handling
//   4. Versioned cache naming for safe updates
//   5. Automatic cleanup of old caches on activation
// ============================================================

// ----- Versioned Cache Names -----
// Bump CACHE_VERSION when you deploy new static assets.
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `expense-tracker-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `expense-tracker-dynamic-${CACHE_VERSION}`;

// ----- Static Assets to Pre-cache (App Shell) -----
// These files are cached during the install phase so the app
// can load instantly on repeat visits and work fully offline.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// ============================================================
// INSTALL EVENT
// ============================================================
// Fired when the browser registers a new service worker.
// We open the static cache and pre-cache all app shell assets.
// skipWaiting() ensures the new SW activates immediately
// without waiting for existing tabs to close.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing — Cache Version:', CACHE_VERSION);

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching app shell assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force the waiting SW to become the active SW immediately
        return self.skipWaiting();
      })
  );
});

// ============================================================
// ACTIVATE EVENT
// ============================================================
// Fired when the service worker takes control of the page.
// Here we clean up old caches that no longer match the current
// CACHE_VERSION, preventing stale data from lingering.
// clients.claim() lets the new SW control all open tabs right away.
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating — Cache Version:', CACHE_VERSION);

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete caches that belong to our app but have an old version
              return (
                (name.startsWith('expense-tracker-static-') ||
                  name.startsWith('expense-tracker-dynamic-')) &&
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE
              );
            })
            .map((oldCache) => {
              console.log('[Service Worker] Deleting old cache:', oldCache);
              return caches.delete(oldCache);
            })
        );
      })
      .then(() => {
        // Take control of all clients (tabs) immediately
        return self.clients.claim();
      })
  );
});

// ============================================================
// FETCH EVENT
// ============================================================
// Intercepts every network request made by the app.
//
// Strategy:
//   • Static assets (same-origin, navigation, JS, CSS, images)
//     → CACHE-FIRST: try the cache, fall back to network, then
//       cache the network response for next time.
//
//   • Dynamic / API requests (or anything else)
//     → NETWORK-FIRST: try the network, fall back to cache.
//       This ensures we get fresh data when online, but still
//       serve cached responses when offline.
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests (POST, PUT, DELETE are not cacheable)
  if (request.method !== 'GET') return;

  // Determine if this is a request for a static asset
  const url = new URL(request.url);
  const isStaticAsset =
    url.origin === self.location.origin &&
    (request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'image' ||
      request.destination === 'font' ||
      request.destination === 'manifest' ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.json') ||
      url.pathname === '/');

  if (isStaticAsset) {
    // ----- CACHE-FIRST Strategy -----
    // 1. Look in cache first
    // 2. If not found, fetch from network
    // 3. Clone response and store in cache for future use
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((networkResponse) => {
            // Only cache successful responses
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === 'basic'
            ) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // If both cache and network fail for a navigation request,
            // return the cached index.html (SPA fallback)
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
    );
  } else {
    // ----- NETWORK-FIRST Strategy -----
    // 1. Try to fetch from the network
    // 2. If successful, cache the response in the dynamic cache
    // 3. If network fails, fall back to cached response
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200
          ) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});
