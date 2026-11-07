// pocket-wiki service worker: precache the app shell, serve it network-first.
// Online, every request goes to the network and refreshes the cache, so a new
// deploy shows up on the next load. Offline, the cached copy is used.
// FILES only needs the files for a first offline load; any other same-origin
// file is cached the first time it is fetched online.
const CACHE = 'pocket-wiki-v3';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './css/style.css',
  './js/skin-init.js',
  './js/app.js',
  './js/diff.js',
  './js/seed.js',
  './js/special.js',
  './js/storage.js',
  './js/wikitext.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req).then((res) => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) =>
      hit || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
