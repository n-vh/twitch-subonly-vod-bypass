import { KrakenVideo, Url } from './types';
import { CLIENT_ID, KRAKEN_HEADER } from './constants';

export function buildVideoUrls(videoId: string, data: KrakenVideo): Url[] {
  const url = new URL(data.seek_previews_url);

  const basePattern = '/:uuid/:type/:file';
  const uploadPattern = '/:channel/:id' + basePattern;

  const pattern = data.broadcast_type === 'upload' ? uploadPattern : basePattern;
  const params = parsePathname(url.pathname, pattern);

  return Object.entries(data.resolutions)
    .filter(([key, value]) => value.length)
    .map(([quality, res]) => {
      const path = `${params.uuid}/${quality}`;

      const urls = {
        archive: `${url.origin}/${path}/index-dvr.m3u8`,
        highlight: `${url.origin}/${path}/highlight-${videoId}.m3u8`,
        upload: `${url.origin}/${params.channel}/${params.id}/${path}/index-dvr.m3u8`,
      };

      return { res, url: urls[data.broadcast_type] };
    });
}

export function buildPlaylist(urls: Url[]) {
  let playlist = '#EXTM3U\n';
  let bandwidth = 100;

  for (const { res, url } of urls) {
    playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth--},RESOLUTION=${res}\n`;
    playlist += `${url}\n`;
  }

  return playlist;
}

export function buildPreviewsBlob(baseUrl: string, config: any) {
  if (!config) return '';

  let tracks = 'WEBVTT\n\n';

  let column = 0;
  let row = 0;
  let timestamp = 0;
  let timeString = '00:00:00.000';

  for (let i = 0; i < config.count; i++) {
    const url = baseUrl + config.images[0];
    const newTimeString = parseTimestamp(timestamp);

    tracks += `${i + 1}\n`;
    tracks += `${timeString} --> ${newTimeString}\n`;
    tracks += `${url}#xywh=${column},${row},${config.width},${config.height}\n\n`;

    column += config.width;
    timestamp += Number(config.interval);
    timeString = newTimeString;

    if (column + config.width > config.cols * config.width) {
      column = 0;
      row += config.height;
    }
  }

  return tracks;
}

export function makeBaseUrl(url: string) {
  return url.substring(0, url.lastIndexOf('/') + 1);
}

function parsePathname(pathname: string, pattern: string) {
  pathname = pathname.substring(1);
  pattern = pattern.substring(2);

  const parts = pathname.split('/');
  const keys = pattern.split('/:');

  const object: Record<string, string> = {};

  parts.forEach((part, index) => {
    if (part.length) {
      Object.assign(object, {
        [keys[index]]: part,
      });
    }
  });

  return object;
}

function parseTimestamp(time: number) {
  const pad = (nb: string | number, size = 2) => ('000' + nb).slice(size * -1);

  const h = Math.floor(time / 60 / 60);
  const m = Math.floor(time / 60) % 60;
  const s = Math.floor(time - m * 60);
  const ms = time.toFixed(3).slice(-3);

  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
}

export function fetchVideoData(videoId: string) {
  return request<KrakenVideo>(`https://api.twitch.tv/kraken/videos/${videoId}`, {
    headers: {
      Accept: KRAKEN_HEADER,
      'Client-Id': CLIENT_ID,
    },
  });
}

export async function fetchVideoPreviews(url: string) {
  const data = await request<any>(url);
  return data?.[0] || null;
}

export async function request<T extends any>(
  input: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(input, init);

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.error(e);
  }

  return null;
}
