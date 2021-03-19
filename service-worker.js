// PWA Code adapted from https://github.com/pwa-builder/PWABuilder
const CACHE = "pwa-precache-v1";
const precacheFiles = [
  "/cate/index.html", "/cate/script.js", "/cate/style.css", 
  "/discover/index.html", "/discover/script.js", "/discover/style.css", 
  "/expo/index.html", "/expo/script.js", "/expo/style.css", 
  "/home/index.html", "/home/script.js", "/home/style.css", 
  "/loading/script.js", "/loading/style.css", 
  "/login/index.html", "/login/script.js", "/login/style.css", 
  "/login/reset/index.html", "/login/reset/script.js", "/login/reset/style.css", 
  "/profile/index.html", "/profile/script.js", "/profile/style.css", 
  "/settings/index.html", "/settings/script.js", "/settings/style.css", 
  "/settings/newpass/index.html", "/settings/newpass/script.js", "/settings/newpass/style.css", 
  "/tos/cgu.html", "/tos/index.html", "/tos/legal.html", "/tos/style.css", "/vendors/jq-swipe.js", 
  "/vendors/jquery-3.5.1.min.js", "/vendors/jquery-migrate-3.3.2.min.js", "/vendors/jquery.ba-dotimeout.min.js", "/vendors/jquery.mobile-1.4.5.min.map", "/vendors/jquery.mobile.custom.min.js", "/vendors/jquery.mobile.min.js"
];

self.addEventListener("install", function (event) {
  console.log("[PWA] Install Event processing");

  console.log("[PWA] Skip waiting on install");
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("[PWA] Caching pages during install");
      return cache.addAll(precacheFiles);
    })
  );
});

// Allow sw to control of current page
self.addEventListener("activate", function (event) {
  console.log("[PWA] Claiming clients for current page");
  event.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      let response;
      try {
        // Fetch from network first.
        response = await fetch(event.request);
        event.waitUntil(updateCache(event.request, response.clone()));
      } catch (error) {
        try {
          // Try if there's locally cached version.
          response = await fromCache(event.request);
        } catch (error) {
          console.log("[PWA] Network request failed and no cache." + error);
          throw error;
        }
      }
      return response;
    })()
  );
});

function fromCache(request) {
  // Check to see if you have it in the cache
  // Return response
  // If not in the cache, then return
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request).then(function (matching) {
      if (!matching || matching.status === 404) {
        return Promise.reject("no-match");
      }

      return matching;
    });
  });
}

function updateCache(request, response) {
  return caches.open(CACHE).then(function (cache) {
    return cache.put(request, response);
  });
}
