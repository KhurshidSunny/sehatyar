/* SehatYar service worker — shell, top FAQ pack, and same-origin audio. */
const CACHE = "sehatyar-offline-v1";
const PRECACHE = [
  "/icon-192.png",
  "/icon.png",
  "/apple-icon.png",
  "/sehatyar-logo.png",
  "/offline/top-faqs.json",
];

function isOfflineAsset(pathname) {
  if (PRECACHE.includes(pathname)) return true;
  if (pathname.startsWith("/offline/")) return true;
  return false;
}

async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(PRECACHE);
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offlinePack = await caches.match("/offline/top-faqs.json");
    if (offlinePack && request.mode === "navigate") {
      const home = await caches.match("/");
      if (home) return home;
    }
    throw new Error("Network unavailable");
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isOfflineAsset(url.pathname) || url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
  }
});
