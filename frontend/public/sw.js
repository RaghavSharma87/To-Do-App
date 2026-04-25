// sw.js — Service Worker for task reminder notifications

const CACHE_NAME = "taskapp-v1";

// ─── Install: cache core assets ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  const action = event.action;
  const notification = event.notification;
  notification.close();

  if (action === "dismiss") return;

  // Default action or "open": navigate to home
  const targetUrl = (notification.data && notification.data.url) || "/home";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Focus an existing tab if one is open
        for (const client of windowClients) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ─── Notification close (dismissed by user) ───────────────────────────────────
self.addEventListener("notificationclose", (_event) => {
  // Could log analytics here if needed
});
