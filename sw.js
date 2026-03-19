// Jazz Buddy Service Worker v10 — FORCE FRESH
// SayMy Tech Developers
const CACHE = 'jazz-buddy-v10';
const FONTS_CACHE = 'jazz-buddy-fonts-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/features.css',
  './js/01-core.js',
  './js/02-engine.js',
  './js/03-responses.js',
  './js/03b-responses-expanded.js',
  './js/03c-jazz-fun.js',
  './js/18-human.js',
  './js/19-stories.js',
  './js/04-ui-panels.js',
  './js/05-send.js',
  './js/06-checkin-goals-crisis.js',
  './js/07-intelligence.js',
  './js/08-voice.js',
  './js/09-auth.js',
  './js/10-tour.js',
  './js/11-customization.js',
  './js/12-notifications.js',
  './js/13-personality.js',
  './js/14-init.js',
  './js/15-v8-intelligence.js',
  './js/16-v8-productivity.js',
  './js/17-v8-ui.js',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
];

self.addEventListener('install', e => {
  console.log('[SW] Installing Jazz Buddy v10...');
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => caches.open(CACHE))
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => {
        console.log('[SW] Pre-cache complete');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', e => {
  console.log('[SW] Activating v10...');
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE && k !== FONTS_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => {
        console.log('[SW] Active.');
      })
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const FONT_ORIGINS = ['fonts.googleapis.com','fonts.gstatic.com'];

  if (FONT_ORIGINS.includes(url.hostname)) {
    e.respondWith(
      caches.open(FONTS_CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(r => { cache.put(e.request, r.clone()); return r; });
        })
      )
    );
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(r => {
          if (r && r.status === 200) {
            const clone = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return r;
        }).catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  e.respondWith(fetch(e.request).catch(() => new Response('', {status:503})));
});

self.addEventListener('push', e => {
  if (!e.data) return;
  let data = {title:'Jazz Buddy',body:'Your friend is thinking of you.'};
  try { data = e.data.json(); } catch(err) {}
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: './icons/icon-192.png', badge: './icons/icon-72.png',
    tag: 'jazz-buddy', data: {url:'./'}
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
