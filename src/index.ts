import cors from './middlewares/cors';
import cache from './middlewares/cache';

addEventListener('fetch', (event) => {
  if (event.request.method === 'OPTIONS') {
    return event.respondWith(cors(event.request));
  }
  return event.respondWith(cache(event));
});
