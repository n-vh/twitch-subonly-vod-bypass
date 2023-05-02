export enum Headers {
  AllowHeaders = 'Access-Control-Allow-Headers',
  AllowMethods = 'Access-Control-Allow-Methods',
  AllowOrigin = 'Access-Control-Allow-Origin',
  MaxAge = 'Access-Control-Max-Age',
  Origin = 'Origin',
  RequestHeaders = 'Access-Control-Request-Headers',
  RequestMethod = 'Access-Control-Request-Method',
}

enum BroadcastType {
  Archive = 'archive',
  Highlight = 'highlight',
  Upload = 'upload',
}

export interface KrakenVideo {
  broadcast_type: BroadcastType;
  url: string;
  created_at: Date;
  _id: string;
  length: number;
  muted_segments?: MutedSegment[];
  preview: Preview;
  animated_preview_url: string;
  thumbnails: Thumbnails;
  seek_previews_url: string;
  resolutions: Resolutions;
}

export interface Url {
  res: any;
  url: string;
}

interface MutedSegment {
  duration: number;
  offset: number;
}

interface Preview {
  small: string;
  medium: string;
  large: string;
  template: string;
}

interface Resolutions {
  '160p30'?: string;
  '360p30': string;
  '480p30': string;
  '720p60': string;
  chunked?: string;
  audio_only?: string;
  '1080p60'?: string;
  '144p30'?: string;
  '720p30'?: string;
}

interface Thumbnails {
  small: Thumbnail[];
  medium: Thumbnail[];
  large: Thumbnail[];
  template: Thumbnail[];
}

interface Thumbnail {
  type: string;
  url: string;
}
