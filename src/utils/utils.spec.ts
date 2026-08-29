import { getFallbackThumbnail, normalizeAspectRatio, parseVideoUrl } from './utils';

describe('parseVideoUrl', () => {
  it('returns invalid for an empty src', () => {
    const info = parseVideoUrl('');
    expect(info.type).toBe('invalid');
    expect(info.id).toBe('');
    expect(info.embedUrl).toBe('');
  });

  it('returns invalid for a non-URL string', () => {
    const info = parseVideoUrl('not-a-url');
    expect(info.type).toBe('invalid');
    expect(info.embedUrl).toBe('');
  });

  describe('youtube', () => {
    const urls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/v/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    ];

    it.each(urls)('parses %s', (url) => {
      const info = parseVideoUrl(url);
      expect(info.type).toBe('youtube');
      expect(info.id).toBe('dQw4w9WgXcQ');
      expect(info.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
    });

    it('uses youtube-nocookie.com when requested', () => {
      const info = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ', { youtubeNocookie: true });
      expect(info.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1');
    });

    it('omits autoplay when disabled', () => {
      const info = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ', { autoplay: false });
      expect(info.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('appends extra params', () => {
      const info = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ', { params: 'start=30&loop=1' });
      expect(info.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=30&loop=1');
    });

    it('strips a leading ? from extra params', () => {
      const info = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ', { params: '?start=30' });
      expect(info.embedUrl).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=30');
    });
  });

  describe('vimeo', () => {
    const urls = [
      'https://vimeo.com/148751763',
      'https://vimeo.com/video/148751763',
      'https://player.vimeo.com/video/148751763',
    ];

    it.each(urls)('parses %s', (url) => {
      const info = parseVideoUrl(url);
      expect(info.type).toBe('vimeo');
      expect(info.id).toBe('148751763');
      expect(info.embedUrl).toBe('https://player.vimeo.com/video/148751763?autoplay=1');
    });

    it('omits autoplay when disabled', () => {
      const info = parseVideoUrl('https://vimeo.com/148751763', { autoplay: false });
      expect(info.embedUrl).toBe('https://player.vimeo.com/video/148751763');
    });
  });

  describe('generic', () => {
    it('passes through other http(s) URLs', () => {
      const url = 'https://example.com/video/player.html';
      const info = parseVideoUrl(url);
      expect(info.type).toBe('generic');
      expect(info.embedUrl).toBe(url);
    });
  });
});

describe('getFallbackThumbnail', () => {
  it('returns a thumbnail URL for youtube videos', () => {
    const info = parseVideoUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(getFallbackThumbnail(info)).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('returns empty for other types', () => {
    expect(getFallbackThumbnail(parseVideoUrl('https://vimeo.com/148751763'))).toBe('');
    expect(getFallbackThumbnail(parseVideoUrl('https://example.com/video'))).toBe('');
    expect(getFallbackThumbnail(parseVideoUrl(''))).toBe('');
  });
});

describe('normalizeAspectRatio', () => {
  it('normalizes standard ratios', () => {
    expect(normalizeAspectRatio('16:9')).toBe('16 / 9');
    expect(normalizeAspectRatio('4:3')).toBe('4 / 3');
    expect(normalizeAspectRatio('1:1')).toBe('1 / 1');
  });

  it('tolerates whitespace and decimals', () => {
    expect(normalizeAspectRatio(' 16 : 9 ')).toBe('16 / 9');
    expect(normalizeAspectRatio('1.85:1')).toBe('1.85 / 1');
  });

  it('returns null for empty or malformed input', () => {
    expect(normalizeAspectRatio('')).toBeNull();
    expect(normalizeAspectRatio(null)).toBeNull();
    expect(normalizeAspectRatio('16x9')).toBeNull();
    expect(normalizeAspectRatio('16')).toBeNull();
  });
});
