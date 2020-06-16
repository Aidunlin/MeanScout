importScripts("./workbox/workbox-sw.js");
workbox.loadModule("workbox-strategies");
workbox.routing.registerRoute(
  () => {return true},
  new workbox.strategies.StaleWhileRevalidate({ cacheName: "meanscout" })
);