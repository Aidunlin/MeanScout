// Workbox handles everything offline-related
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.1.5/workbox-sw.js");
workbox.loadModule("workbox-strategies");
workbox.routing.registerRoute(
  () => { return true },
  new workbox.strategies.NetworkFirst({ cacheName: "meanscout" })
);