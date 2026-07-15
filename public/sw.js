/**
 * Service Worker for Huavoi Studio
 *
 * Note: Push notifications have been removed.
 * This service worker now only handles basic registration and messaging.
 */

// Service worker version
const VERSION = "1.0.0";

// Install event
self.addEventListener("install", (event) => {
  console.log(`[SW ${VERSION}] Service Worker installing...`);
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log(`[SW ${VERSION}] Service Worker activated`);
  event.waitUntil(self.clients.claim());
});

// Message event - Communication with the app
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch event - No caching strategy for now, just pass through
self.addEventListener("fetch", (event) => {
  // Pass through - no special handling for now
  // Could add caching strategies here in the future
});

console.log(`[SW ${VERSION}] Service Worker script loaded`);
