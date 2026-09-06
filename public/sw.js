const CACHE_NAME = "huavoi-studio-shell-v2";
const APP_SHELL = ["/", "/dashboard", "/manifest.webmanifest", "/icon", "/apple-icon"];

function shouldBypassCache(requestUrl) {
  // Never cache Next.js build / HMR assets — stale chunks cause
  // "module factory is not available" after deploys or local rebuilds.
  if (requestUrl.pathname.startsWith("/_next/")) {
    return true;
  }

  // Avoid caching API and auth traffic.
  if (requestUrl.pathname.startsWith("/api/")) {
    return true;
  }

  return false;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (shouldBypassCache(requestUrl)) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.match("/dashboard") || cache.match("/");
      })
    );
    return;
  }

  // App-shell assets only: cache-first for the known shell list.
  const isAppShellAsset = APP_SHELL.includes(requestUrl.pathname);
  if (!isAppShellAsset) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return networkResponse;
      });
    })
  );
});
