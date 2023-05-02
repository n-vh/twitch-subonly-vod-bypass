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
  let playlist = await PLAYLISTS.get(id);

  if (!playlist) {
    const videoData = await fetchVideoData(id);

    if (videoData) {
      const urls = buildVideoUrls(id, videoData);
      const baseUrl = makeBaseUrl(videoData.seek_previews_url);

      const previewsData = await fetchVideoPreviews(videoData.seek_previews_url);
      const previews = buildPreviewsBlob(baseUrl, previewsData);

      PREVIEWS.put(id, previews);

      playlist = buildPlaylist(urls.reverse());
      await PLAYLISTS.put(id, playlist);
    }
  }

  if (playlist) {
    return sendResponse(playlist);
  }

  return sendError('playlist', id);
}
