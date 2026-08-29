export type VideoType = 'youtube' | 'vimeo' | 'generic' | 'invalid';

export interface VideoInfo {
  type: VideoType;
  id: string;
  embedUrl: string;
}

export interface ParseOptions {
  autoplay?: boolean;
  youtubeNocookie?: boolean;
  params?: string;
}

const INVALID_VIDEO_INFO: VideoInfo = {
  type: 'invalid',
  id: '',
  embedUrl: '',
};

/**
 * Derive the embed URL for a video URL.
 *
 * YouTube and Vimeo URLs are parsed to their canonical embed form. Any other
 * http(s) URL is treated as a generic iframe source. Anything else (empty,
 * non-URL strings) is invalid and will render as a disabled placeholder.
 */
export function parseVideoUrl(src: string, options: ParseOptions = {}): VideoInfo {
  if (!src) {
    return { ...INVALID_VIDEO_INFO };
  }

  const autoplay = options.autoplay ?? true;
  const nocookie = options.youtubeNocookie ?? false;
  const extraParams = (options.params || '').replace(/^[?&\s]+/, '');

  const query: string[] = [];
  if (autoplay) {
    query.push('autoplay=1');
  }
  if (extraParams) {
    query.push(extraParams);
  }
  const queryString = query.length > 0 ? `?${query.join('&')}` : '';

  // YouTube: watch, youtu.be, embed, v, e, and shorts URLs.
  const youtubeMatch = src.match(
    /(?:youtube\.com\/(?:shorts\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i,
  );
  if (youtubeMatch && youtubeMatch[1]) {
    const host = nocookie ? 'www.youtube-nocookie.com' : 'www.youtube.com';
    return {
      type: 'youtube',
      id: youtubeMatch[1],
      embedUrl: `https://${host}/embed/${youtubeMatch[1]}${queryString}`,
    };
  }

  // Vimeo: vimeo.com/123456, vimeo.com/video/123456, player.vimeo.com/video/123456.
  const vimeoMatch = src.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      id: vimeoMatch[1],
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}${queryString}`,
    };
  }

  // Generic: pass through only well-formed http(s) URLs.
  if (/^https?:\/\//i.test(src)) {
    return {
      type: 'generic',
      id: '',
      embedUrl: src,
    };
  }

  return { ...INVALID_VIDEO_INFO };
}

/**
 * Fallback thumbnail URL for a known video type, used when no preview image
 * is provided. Returns an empty string when no fallback is available.
 */
export function getFallbackThumbnail(info: VideoInfo): string {
  if (info.type === 'youtube' && info.id) {
    return `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`;
  }
  return '';
}

/**
 * Convert an "16:9" style aspect ratio string to the CSS form "16 / 9".
 * Returns null for empty or malformed input.
 */
export function normalizeAspectRatio(ratio: string): string | null {
  const match = ratio && ratio.trim().match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  if (!match) {
    return null;
  }
  return `${match[1]} / ${match[2]}`;
}
