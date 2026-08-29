import { Component, Prop, State, Method, Element, Watch, h } from '@stencil/core';
import { getFallbackThumbnail, normalizeAspectRatio, parseVideoUrl, VideoInfo } from '../../utils/utils';

@Component({
  tag: 'lazy-embed',
  styleUrl: 'lazy-embed.css',
  shadow: true,
})
export class LazyEmbed {
  /**
   * Reference to the host element
   */
  @Element() el: HTMLElement;

  /**
   * URL of the video to embed (YouTube, Vimeo, or any other iframe URL)
   */
  @Prop() src: string;

  /**
   * URL of the preview image to display before loading the video.
   * When omitted, a YouTube thumbnail is derived automatically for YouTube videos.
   */
  @Prop() previewImage: string;

  /**
   * Alternative text for the preview image
   */
  @Prop() alt: string = 'Video preview';

  /**
   * Width of the embed (can be px or %)
   */
  @Prop() width: string = '100%';

  /**
   * Explicit height of the embed. When left as "auto", the embed is sized
   * by the aspectRatio prop instead.
   */
  @Prop() height: string = 'auto';

  /**
   * Aspect ratio used when height is "auto" (e.g. "16:9", "4:3", "1:1")
   */
  @Prop() aspectRatio: string = '16:9';

  /**
   * Title of the video (used for the iframe title, for accessibility)
   */
  @Prop() videoTitle: string = '';

  /**
   * Whether the embedded video should autoplay once loaded.
   * Note: browsers may still block autoplay if the video has sound.
   */
  @Prop() autoplay: boolean = true;

  /**
   * Load YouTube videos via youtube-nocookie.com (enhanced privacy mode)
   */
  @Prop() youtubeNocookie: boolean = false;

  /**
   * Extra query parameters to append to the embed URL (e.g. "start=30&loop=1")
   */
  @Prop() params: string = '';

  /**
   * Load the video when it becomes visible in the viewport, without user interaction
   */
  @Prop() playOnVisible: boolean = false;

  /**
   * Load only the preview image when the component becomes visible in the viewport
   */
  @Prop() loadOnVisible: boolean = false;

  /**
   * CSS selector for a parent element that triggers loading when it becomes visible
   */
  @Prop() loadOnParentOpen: string = '';

  /**
   * CSS selector for elements that should trigger video loading when clicked
   */
  @Prop() loadOnClickSelector: string = '';

  /**
   * Whether the video has been loaded
   */
  @State() loaded: boolean = false;

  /**
   * Whether the preview image has been loaded
   */
  @State() imageLoaded: boolean = false;

  /**
   * IntersectionObserver instance for detecting when the component is visible (for video loading)
   */
  private playObserver: IntersectionObserver;

  /**
   * IntersectionObserver instance for detecting when the component is visible (for image loading)
   */
  private imageObserver: IntersectionObserver;

  /**
   * MutationObserver instance for detecting when a parent element is opened
   */
  private mutationObserver: MutationObserver;

  /**
   * Store references to elements and their click event handlers
   */
  private clickTriggerElements: { element: Element; handler: EventListener }[] = [];

  /**
   * Parsed video information
   */
  private videoInfo: VideoInfo;

  /**
   * Component lifecycle method that runs when the component is first connected to the DOM
   */
  connectedCallback() {
    this.parseVideoUrl();
    this.imageLoaded = this.shouldLoadImageImmediately();

    if (this.playOnVisible) {
      this.setupPlayIntersectionObserver();
    }

    if (this.loadOnVisible && this.resolvedPreviewImage) {
      this.setupImageIntersectionObserver();
    }

    if (this.loadOnParentOpen) {
      this.setupMutationObserver();
    }

    if (this.loadOnClickSelector) {
      this.setupExternalClickListeners();
    }
  }

  /**
   * Re-parse the video URL and reset the component state whenever the src
   * attribute changes. This keeps the component reactive in environments
   * (like the Gutenberg editor) where attributes are updated dynamically.
   */
  @Watch('src')
  handleSrcChange() {
    this.parseVideoUrl();
    this.imageLoaded = this.shouldLoadImageImmediately();

    if (this.loaded) {
      // The source changed underneath a loaded video: drop back to the
      // preview state so the new URL is not silently ignored.
      this.loaded = false;
    }

    if (this.loadOnVisible && this.resolvedPreviewImage && !this.imageObserver) {
      this.setupImageIntersectionObserver();
    }
  }

  /**
   * Rebuild the embed URL when embed-affecting props change
   */
  @Watch('autoplay')
  @Watch('youtubeNocookie')
  @Watch('params')
  handleEmbedOptionChange() {
    this.parseVideoUrl();
  }

  /**
   * Component lifecycle method that runs when the component is disconnected from the DOM
   */
  disconnectedCallback() {
    if (this.playObserver) {
      this.playObserver.disconnect();
      this.playObserver = undefined;
    }

    if (this.imageObserver) {
      this.imageObserver.disconnect();
      this.imageObserver = undefined;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = undefined;
    }

    // Remove click event listeners
    this.clickTriggerElements.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
    });
    this.clickTriggerElements = [];
  }

  /**
   * The preview image to display: the explicit previewImage prop, or a
   * derived YouTube thumbnail when available.
   */
  private get resolvedPreviewImage(): string {
    return this.previewImage || getFallbackThumbnail(this.videoInfo) || '';
  }

  /**
   * Whether the preview image should be loaded immediately (when
   * load-on-visible is not enabled)
   */
  private shouldLoadImageImmediately(): boolean {
    return !this.loadOnVisible && !!this.resolvedPreviewImage;
  }

  /**
   * Parse the video URL to extract information needed for embedding
   */
  private parseVideoUrl() {
    this.videoInfo = parseVideoUrl(this.src, {
      autoplay: this.autoplay,
      youtubeNocookie: this.youtubeNocookie,
      params: this.params,
    });
  }

  /**
   * Set up click event listeners on external trigger elements
   */
  private setupExternalClickListeners() {
    if (!this.loadOnClickSelector) {
      return;
    }

    const triggerElements = document.querySelectorAll(this.loadOnClickSelector);

    if (triggerElements.length === 0) {
      console.warn(`No elements found matching selector "${this.loadOnClickSelector}"`);
      return;
    }

    triggerElements.forEach(element => {
      const clickHandler = () => {
        if (!this.loaded) {
          this.loadVideo();
        }
      };

      element.addEventListener('click', clickHandler);
      this.clickTriggerElements.push({ element, handler: clickHandler });
    });
  }

  /**
   * Set up IntersectionObserver to detect when the component is visible for video loading
   */
  private setupPlayIntersectionObserver() {
    this.playObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.loaded) {
          this.loadVideo();
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      },
    );

    this.playObserver.observe(this.el);
  }

  /**
   * Set up IntersectionObserver to detect when the component is visible for image loading
   */
  private setupImageIntersectionObserver() {
    this.imageObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.imageLoaded) {
          this.imageLoaded = true;
          this.imageObserver.disconnect();
          this.imageObserver = undefined;
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      },
    );

    this.imageObserver.observe(this.el);
  }

  /**
   * Set up MutationObserver to detect when a parent element is opened
   */
  private setupMutationObserver() {
    const parentElement = document.querySelector(this.loadOnParentOpen);

    if (!parentElement) {
      console.warn(`Parent element with selector "${this.loadOnParentOpen}" not found.`);
      return;
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'class' || mutation.attributeName === 'style')
        ) {
          // Check if the parent element is now visible
          const computedStyle = window.getComputedStyle(parentElement);
          if (
            computedStyle.display !== 'none' &&
            computedStyle.visibility !== 'hidden' &&
            !this.loaded
          ) {
            this.loadVideo();
          }
        }
      });
    });

    this.mutationObserver.observe(parentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
  }

  /**
   * Load the video by replacing the preview image with the embed iframe
   */
  @Method()
  async loadVideo() {
    if (!this.loaded && this.videoInfo.embedUrl) {
      this.loaded = true;
    }
  }

  private handlePlayClick() {
    if (!this.loaded) {
      this.loadVideo();
    }
  }

  render() {
    const containerStyle = {
      width: this.width,
      height: this.height !== 'auto' ? this.height : null,
      aspectRatio:
        this.height === 'auto' ? normalizeAspectRatio(this.aspectRatio) || '16 / 9' : null,
    };

    if (this.loaded && this.videoInfo.embedUrl) {
      return (
        <div class="lazy-embed-container" style={containerStyle}>
          <div class="embed-responsive">
            <iframe
              src={this.videoInfo.embedUrl}
              title={this.videoTitle || 'Embedded video'}
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullScreen
            ></iframe>
          </div>
        </div>
      );
    }

    const showImage = !!this.resolvedPreviewImage && this.imageLoaded;
    const playLabel = this.videoTitle || this.alt || 'Play video';

    return (
      <div class="lazy-embed-container" style={containerStyle}>
        <div class="preview-container">
          {showImage ? (
            <img
              src={this.resolvedPreviewImage}
              alt={this.alt}
              class="preview-image"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div class="placeholder"></div>
          )}
          {this.videoInfo.embedUrl ? (
            <button
              type="button"
              class="play-overlay"
              aria-label={`Play video: ${playLabel}`}
              onClick={() => this.handlePlayClick()}
            >
              <span class="play-button" aria-hidden="true"></span>
            </button>
          ) : (
            <div class="play-overlay play-overlay--disabled">
              <span class="play-button" aria-hidden="true"></span>
            </div>
          )}
        </div>
      </div>
    );
  }
}
