const CACHE_VERSION = 'zkawi-v3';
const LESSON_CACHE = 'zkawi-lessons-v1';
const OFFLINE_URL = '/ar';

const PRECACHE = [
  '/',
  '/ar',
  '/en',
  '/manifest.json',
  '/favicon.svg',
  '/logo-icon.svg',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION && k !== LESSON_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // AI/Mascot API — always network, no offline fallback (AI requires internet)
  if (url.pathname.startsWith('/api/v1/mascot') || url.pathname.startsWith('/api/v1/ai')) {
    return; // Let it fail naturally — client shows "تحتاج إنترنت للذكاء الاصطناعي"
  }

  // Other API routes — network first, offline JSON fallback
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request)
        .catch(() => new Response('{"Success":false,"Error":{"Code":"OFFLINE"}}', {
          headers: { 'Content-Type': 'application/json' },
        }))
    );
    return;
  }

  // Static assets — cache first
  if (url.pathname.match(/\.(svg|png|jpg|webp|woff2|css|js)$/)) {
    e.respondWith(
      caches.match(e.request)
        .then(cached => cached ?? fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
          }
          return res;
        }))
    );
    return;
  }

  // Lesson content — check lesson cache first (pre-cached content)
  if (url.pathname.includes('/lessons/')) {
    e.respondWith(
      caches.match(e.request, { cacheName: LESSON_CACHE })
        .then(cached => cached ?? fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => caches.match(OFFLINE_URL)))
    );
    return;
  }

  // HTML pages — network first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(c => c ?? caches.match(OFFLINE_URL)))
  );
});

// ─── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'sync-progress') {
    e.waitUntil(SyncStudentProgress());
  }
  if (e.tag === 'sync-signals') {
    e.waitUntil(SyncLearningSignals());
  }
});

async function SyncStudentProgress() {
  try {
    const db = await OpenIDB();
    const pendingProgress = await GetAllFromStore(db, 'pendingProgress');
    for (const item of pendingProgress) {
      const res = await fetch('/api/v1/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) await DeleteFromStore(db, 'pendingProgress', item.id);
    }
  } catch { /* silent fail */ }
}

async function SyncLearningSignals() {
  try {
    const db = await OpenIDB();
    const pending = await GetAllFromStore(db, 'pendingSignals');
    for (const item of pending) {
      const res = await fetch('/api/v1/mastery/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) await DeleteFromStore(db, 'pendingSignals', item.id);
    }
  } catch { /* silent fail */ }
}

// ─── IndexedDB helpers ────────────────────────────────────────────────────────
function OpenIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('zkawi-offline', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('pendingProgress')) db.createObjectStore('pendingProgress', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('pendingSignals')) db.createObjectStore('pendingSignals', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('cachedLessons')) db.createObjectStore('cachedLessons', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function GetAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function DeleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ─── Pre-cache lessons (called from main app) ─────────────────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'PRECACHE_LESSON' && e.data.url) {
    caches.open(LESSON_CACHE).then(c => c.add(e.data.url)).catch(() => {});
  }
});
