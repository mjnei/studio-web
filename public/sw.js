/**
 * Service Worker for Huavoi Studio
 * Handles push notifications
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

// Push event - Display notification
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received");

  let notificationData = {
    title: "Huavoi Studio",
    body: "You have a new notification",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    data: {},
  };

  // Parse push payload
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        title: payload.title || notificationData.title,
        body: payload.body || notificationData.body,
        icon: payload.icon || notificationData.icon,
        badge: payload.badge || notificationData.badge,
        tag: payload.notification_id || "notification",
        data: {
          notification_id: payload.notification_id,
          action_url: payload.action_url,
          notification_type: payload.notification_type,
          ...payload.data,
        },
      };
    } catch (error) {
      console.error("[SW] Failed to parse push payload:", error);
    }
  }

  // Display the notification
  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: false,
      vibrate: [200, 100, 200],
    }
  );

  event.waitUntil(promiseChain);
});

// Notification click event - Open app or navigate
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.data);

  event.notification.close();

  const actionUrl = event.notification.data?.action_url || "/notifications";

  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus().then((client) => {
            if (client.navigate) {
              return client.navigate(actionUrl);
            }
          });
        }
      }

      // Open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(actionUrl);
      }
    })
  );
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
