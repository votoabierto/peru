// Service worker disabled — VotoAbierto is web-only, no install prompt.
// This file exists only to unregister any previously cached service workers.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.registration.unregister())
