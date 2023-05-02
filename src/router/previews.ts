import { Request } from 'itty-router';
import { sendError, sendResponse } from './index';
import {
  buildPlaylist,
  buildPreviewsBlob,
  buildVideoUrls,
  fetchVideoData,
  fetchVideoPreviews,
  makeBaseUrl,
} from '../shared/utils';

export default async function ({ params }: Request): Promise<Response> {
  const id = params!.id;
  let previews = await PREVIEWS.get(id);

  if (!previews) {
    const videoData = await fetchVideoData(id);

    if (videoData) {
      const urls = buildVideoUrls(id, videoData);
      const baseUrl = makeBaseUrl(videoData.seek_previews_url);

      const previewsData = await fetchVideoPreviews(videoData.seek_previews_url);
      previews = buildPreviewsBlob(baseUrl, previewsData);

      PREVIEWS.put(id, previews);

      const playlist = buildPlaylist(urls.reverse());
      await PLAYLISTS.put(id, playlist);
    }
  }

  if (previews) {
    return sendResponse(previews);
  }

  return sendError('previews', id);
}
