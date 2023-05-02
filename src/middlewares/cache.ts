import { router } from '../router';

export default async function (e: FetchEvent): Promise<Response> {
  const cacheUrl = new URL(e.request.url);
  const cacheKey = new Request(cacheUrl.toString(), e.request);

  const cache = caches.default;

  let response = await cache.match(cacheKey);

  if (!response) {
    response = await router.handle(e.request);

    e.waitUntil(cache.put(cacheKey, response!.clone()));
  }

  return response!;
}
