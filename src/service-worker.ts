// https://kit.svelte.dev/docs/service-workers

/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from "$service-worker";

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = `MeanScout-${version}`;
const ASSETS = [...build, ...files];

sw.oninstall = (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
};

sw.onactivate = (event) => {
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key != CACHE_NAME) await caches.delete(key);
    }
  }

  event.waitUntil(deleteOldCaches());
};

sw.onfetch = (event) => {
  if (event.request.method != "GET") return;

  async function respond() {
    const cache = await caches.open(CACHE_NAME);

    try {
      const response = await fetch(event.request);

      if (response.status == 200) {
        cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      return cache.match(event.request);
    }
  }

  event.respondWith(respond() as Response | PromiseLike<Response>);
};
