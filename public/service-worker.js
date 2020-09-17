const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/index.js',
    '/manifest.webmanifest',
    '/styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// activate
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener('message', function (event) {
    console.log('form data', event.data)
    if (event.data.hasOwnProperty('form_data')) {
        // receives form data from script.js upon submission
        form_data = event.data.form_data
    }
})

self.addEventListener('fetch', function (event) {
    console.log('I am a request with url: ', event.request.clone().url)
    if (event.request.clone().method === 'GET') {
        event.respondWith(
            // check all the caches in the browser and find out whether our request is in any of them
            caches.match(event.request.clone())
            .then(function (response) {
                if (response) {
                    // if we are here, that means there's a match return the response stored in browser
                    return response;
                }
                // no match in cache, use the network instead
                return fetch(event.request.clone());
            })
        );
    } else if (event.request.clone().method === 'POST') {
        // attempt to send request normally
        event.respondWith(fetch(event.request.clone()).catch(function (error) {
            // only save post requests in browser, if an error occurs
            savePostRequests(event.request.clone().url, form_data)
        }))
    }
});


