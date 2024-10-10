self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('pwa-cache').then(cache => {
            return cache.addAll([
                './',
                './index.html',
                './privacy.html',
                './styles.css',
                './script.js',
                './icon-192.png',
                './icon-512.png',
                'https://cdn.jsdelivr.net/npm/luxon@3.5.0/build/global/luxon.min.js',
                'https://cdn.jsdelivr.net/npm/tz-lookup@6.1.25/tz.min.js',
                'https://cdn.jsdelivr.net/npm/astronomy-engine@2.1.19/astronomy.browser.min.js',
                'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.js',
                'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/flatpickr.min.css',
                'https://cdn.jsdelivr.net/npm/flatpickr@4.6.13/dist/themes/dark.min.css'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
