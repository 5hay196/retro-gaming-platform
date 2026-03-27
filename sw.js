const CACHE_NAME = 'retro-arcade-v1';
const ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './css/games.css',
  './js/app.js',
  './js/utils.js',
  './js/audio-engine.js',
  './js/games/pong.js',
  './js/games/tetris.js',
  './js/games/snake.js',
  './js/games/breakout.js',
  './js/games/space-invaders.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
