// Jazz Buddy Service Worker — v7 Modular
// SayMy Tech Developers
const CACHE = 'jazz-buddy-v10';
const FONTS_CACHE = 'jazz-buddy-fonts-v1';

// All app assets — cache everything for full offline support
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // Styles
  './css/base.css',
  './css/features.css',
  // JavaScript modules (load order matters)
  './js/01-core.js',
  './js/02-engine.js',
  './js/03-responses.js',
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
  // Icons
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
];

const FONT_ORIGINS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// ── INSTALL — pre-cache everything ────────────────────────────────
self.addEventListener('install', e => {
  console.log('[SW] Installing Jazz Buddy v7...');
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => {
        console.log('[SW] Pre-caching', CORE_ASSETS.length, 'assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Pre-cache complete');
        return self.skipWaiting();
      })
      .catch(err => console.error('[SW] Pre-cache failed:', err))
  );
});

// ── ACTIVATE — clean old caches ────────────────────────────────────
self.addEventListener('activate', e => {
  console.log('[SW] Activating...');
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE && k !== FONTS_CACHE)
          .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      ))
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// ── FETCH — serve from cache, fallback to network ──────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Google Fonts — cache first, long TTL
  if (FONT_ORIGINS.includes(url.hostname)) {
    e.respondWith(
      caches.open(FONTS_CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(response => {
            cache.put(e.request, response.clone());
            return response;
          }).catch(() => cached);
        })
      )
    );
    return;
  }

  // Same-origin (all our JS, CSS, HTML, icons) — cache first
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') return response;
            const clone = response.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, clone));
            return response;
          })
          .catch(() => caches.match('./index.html'));
      })
    );
    return;
  }

  // External — network, no caching
  e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
});

// ── PUSH NOTIFICATIONS ─────────────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  let data = { title: 'Jazz Buddy 🎷', body: 'Your friend is thinking of you.' };
  try { data = e.data.json(); } catch(err) { data.body = e.data.text(); }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './icons/icon-192.png',
      badge: './icons/icon-72.png',
      vibrate: [200, 100, 200, 100, 200],
      tag: 'jazz-buddy-notif',
      renotify: true,
      data: { url: './' }
    })
  );
});

// ── NOTIFICATION CLICK ─────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

// ── MESSAGES FROM APP ──────────────────────────────────────────────
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data && e.data.type === 'SCHEDULE_NOTIFS') {
    console.log('[SW] Notification scheduling requested for:', e.data.profile?.name);
  }
});

// ── BACKGROUND SYNC ────────────────────────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'jazz-check-in-reminder') {
    e.waitUntil(
      self.registration.showNotification('Jazz Buddy ☀️', {
        body: 'Time for your daily check-in. 2 minutes. It matters.',
        icon: './icons/icon-192.png',
        badge: './icons/icon-72.png',
        tag: 'checkin-reminder',
      })
    );
  }
});
