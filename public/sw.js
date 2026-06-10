const CACHE = 'weshtv-v1'

const STATIC = [
    '/',
    '/manifest.json',
    '/favicon.svg',
    '/icon-192.png',
    '/icon-512.png',
]

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(STATIC))
    )
})

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    )
})