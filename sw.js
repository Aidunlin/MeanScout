importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.3/workbox-sw.js')
workbox.routing.registerRoute(
  new RegExp('\w*\.*$'),
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'meanscout' })
)
