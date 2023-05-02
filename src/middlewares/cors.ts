import { Headers } from '../shared/types';

export const ALLOWED_METHODS = 'GET,OPTIONS';
export const ALLOWED_ORIGIN = '*';

export default function (request: Request) {
  const headers = request.headers;

  const hasOrigin = headers.has(Headers.Origin);
  const hasMethod = headers.has(Headers.RequestMethod);
  const hasHeaders = headers.has(Headers.RequestHeaders);

  if (hasOrigin && hasMethod && hasHeaders) {
    return new Response(null, {
      headers: {
        [Headers.AllowHeaders]: headers.get(Headers.RequestHeaders)!,
        [Headers.AllowMethods]: ALLOWED_METHODS,
        [Headers.AllowOrigin]: ALLOWED_ORIGIN,
        [Headers.MaxAge]: '86400',
      },
    });
  }

  return new Response(null, {
    headers: {
      Allow: ALLOWED_METHODS,
    },
  });
}
