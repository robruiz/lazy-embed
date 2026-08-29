import { newE2EPage } from '@stencil/core/testing';

const YT_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const YT_ID = 'dQw4w9WgXcQ';

async function setup(content: string) {
  const page = await newE2EPage({
    html: content,
  });
  await page.waitForChanges();
  return page;
}

describe('lazy-embed', () => {
  it('renders as hydrated', async () => {
    const page = await setup('<lazy-embed></lazy-embed>');
    const el = await page.find('lazy-embed');
    expect(el).toHaveClasses(['hydrated']);
  });

  it('shows the preview image and no iframe before activation', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}" preview-image="https://example.com/preview.jpg"></lazy-embed>`);
    const img = await page.find('lazy-embed >>> .preview-image');
    const iframe = await page.find('lazy-embed >>> iframe');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('https://example.com/preview.jpg');
    expect(iframe).toBeNull();
  });

  it('derives a YouTube thumbnail when no preview image is given', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}"></lazy-embed>`);
    const img = await page.find('lazy-embed >>> .preview-image');
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe(`https://i.ytimg.com/vi/${YT_ID}/hqdefault.jpg`);
  });

  it('loads the iframe on play button click', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}" preview-image="https://example.com/preview.jpg"></lazy-embed>`);
    const button = await page.find('lazy-embed >>> button.play-overlay');
    await button.click();
    await page.waitForChanges();

    const iframe = await page.find('lazy-embed >>> iframe');
    const buttonAfter = await page.find('lazy-embed >>> button.play-overlay');
    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute('src')).toBe(`https://www.youtube.com/embed/${YT_ID}?autoplay=1`);
    expect(buttonAfter).toBeNull();
  });

  it('loads the iframe via keyboard activation', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}"></lazy-embed>`);
    const button = await page.find('lazy-embed >>> button.play-overlay');
    await button.focus();
    await page.keyboard.press('Enter');
    await page.waitForChanges();

    const iframe = await page.find('lazy-embed >>> iframe');
    expect(iframe).not.toBeNull();
  });

  it('respects autoplay=false', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}" autoplay="false"></lazy-embed>`);
    const button = await page.find('lazy-embed >>> button.play-overlay');
    await button.click();
    await page.waitForChanges();

    const iframe = await page.find('lazy-embed >>> iframe');
    expect(iframe.getAttribute('src')).toBe(`https://www.youtube.com/embed/${YT_ID}`);
  });

  it('uses youtube-nocookie.com when privacy mode is enabled', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}" youtube-nocookie="true"></lazy-embed>`);
    const button = await page.find('lazy-embed >>> button.play-overlay');
    await button.click();
    await page.waitForChanges();

    const iframe = await page.find('lazy-embed >>> iframe');
    expect(iframe.getAttribute('src')).toBe(`https://www.youtube-nocookie.com/embed/${YT_ID}?autoplay=1`);
  });

  it('resets to the preview state and loads the new video when src changes', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}"></lazy-embed>`);
    const el = await page.find('lazy-embed');
    const button = await page.find('lazy-embed >>> button.play-overlay');
    await button.click();
    await page.waitForChanges();

    el.setProperty('src', 'https://vimeo.com/148751763');
    await page.waitForChanges();

    // Back to preview state with the new video's play control
    const buttonAfter = await page.find('lazy-embed >>> button.play-overlay');
    expect(buttonAfter).not.toBeNull();

    await buttonAfter.click();
    await page.waitForChanges();

    const iframe = await page.find('lazy-embed >>> iframe');
    expect(iframe.getAttribute('src')).toBe('https://player.vimeo.com/video/148751763?autoplay=1');
  });

  it('applies a custom aspect ratio via computed style', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}" aspect-ratio="4:3"></lazy-embed>`);
    const aspectRatio = await page.evaluate(() => {
      const container = document
        .querySelector('lazy-embed')
        .shadowRoot.querySelector('.lazy-embed-container');
      return getComputedStyle(container).aspectRatio;
    });
    expect(aspectRatio).toBe('4 / 3');
  });

  it('applies an explicit height instead of the aspect ratio', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}" height="300px"></lazy-embed>`);
    const height = await page.evaluate(() => {
      const container = document
        .querySelector('lazy-embed')
        .shadowRoot.querySelector('.lazy-embed-container');
      return getComputedStyle(container).height;
    });
    expect(height).toBe('300px');
  });

  it('renders a disabled placeholder for an invalid src', async () => {
    const page = await setup('<lazy-embed src="not-a-url"></lazy-embed>');
    const button = await page.find('lazy-embed >>> button.play-overlay');
    const disabledOverlay = await page.find('lazy-embed >>> .play-overlay--disabled');
    expect(button).toBeNull();
    expect(disabledOverlay).not.toBeNull();
  });

  it('loads the video through the public loadVideo method', async () => {
    const page = await setup(`<lazy-embed src="${YT_URL}"></lazy-embed>`);
    const el = await page.find('lazy-embed');
    await el.callMethod('loadVideo');
    await page.waitForChanges();

    const iframe = await page.find('lazy-embed >>> iframe');
    expect(iframe).not.toBeNull();
  });

  it('does not load the video when loadVideo is called with an invalid src', async () => {
    const page = await setup('<lazy-embed src="not-a-url"></lazy-embed>');
    const el = await page.find('lazy-embed');
    await el.callMethod('loadVideo');
    await page.waitForChanges();

    const iframe = await page.find('lazy-embed >>> iframe');
    expect(iframe).toBeNull();
  });
});
