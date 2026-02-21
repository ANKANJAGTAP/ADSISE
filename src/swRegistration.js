// ============================================================
// Service Worker Registration — Expense Tracker PWA
// ============================================================
// This module handles registering the service worker located
// at /sw.js. It is imported and called in main.jsx.
//
// Registration only happens in production-like environments
// where the browser supports service workers.
//
// The service worker file (sw.js) lives in /public so Vite
// serves it at the root of the built site.
// ============================================================

export function registerServiceWorker() {
  // Check if the browser supports service workers
  if ('serviceWorker' in navigator) {
    // Wait for the page to fully load before registering
    // to avoid competing with critical resource loading
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          // Scope '/' means the SW controls all pages on the origin
          scope: '/',
        });

        console.log(
          '[SW Registration] Service worker registered successfully. Scope:',
          registration.scope
        );

        // Listen for updates to the service worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[SW Registration] New service worker installing...');

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log(
                '[SW Registration] New service worker activated — fresh content available.'
              );
            }
          });
        });
      } catch (error) {
        console.error('[SW Registration] Registration failed:', error);
      }
    });
  } else {
    console.warn('[SW Registration] Service workers are not supported in this browser.');
  }
}
