import { Router } from 'itty-router';
import { ALLOWED_ORIGIN } from '../middlewares/cors';
import { Headers } from '../shared/types';
import playlist from './playlist';
import previews from './previews';

export const router = Router();

router
  .get('/playlist/:id', playlist)
  .get('/previews/:id', previews)
  .get('*', () => {
    return new Response('What are you looking for?', {
      status: 404,
    });
  });

export function sendResponse(body: BodyInit) {
  return new Response(body, {
    headers: {
      [Headers.AllowOrigin]: ALLOWED_ORIGIN,
      'Cache-Control': 's-maxage=600',
    },
  });
}

export function sendError(route: string, id: string): Response {
  const body = {
    status: 404,
    error: 'Not Found',
    message: `Unable to fetch ${route} for video ${id}`,
  };

  return new Response(JSON.stringify(body, null, 2), {
    status: 404,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });
}
