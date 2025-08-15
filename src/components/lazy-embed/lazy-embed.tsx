import { Component, Prop, State, Method, Element, Listen, h } from '@stencil/core';

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
   * URL of the video to embed (YouTube, Vimeo, etc.)
   */
  @Prop() src: string;

  /**
   * URL of the preview image to display before loading the video
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
   * Height of the embed (can be px or %)
   */
  @Prop() height: string = 'auto';

  /**
   * Title of the video (for accessibility)
   */
  @Prop() videoTitle: string = '';

  /**
   * Whether to load the preview image automatically when it becomes visible
   */
  @Prop() loadOnVisible: boolean = false;

  /**
   * Whether to load the video automatically when it becomes visible
   */
  @Prop() playOnVisible: boolean = false;

  /**
   * Whether to load the video automatically when a parent element with the specified selector is opened
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
  private videoInfo: {
    type: 'youtube' | 'vimeo' | 'unknown';
    id: string;
    embedUrl: string;
  };

  /**
   * Component lifecycle method that runs when the component is first connected to the DOM
   */
  connectedCallback() {
    this.parseVideoUrl();

    if (this.playOnVisible) {
      this.setupPlayIntersectionObserver();
    }

    if (this.loadOnVisible && this.previewImage) {
      this.setupImageIntersectionObserver();
    } else if (this.previewImage) {
      // If loadOnVisible is false, load the image immediately
      this.imageLoaded = true;
    }

    if (this.loadOnParentOpen) {
      this.setupMutationObserver();
    }

    if (this.loadOnClickSelector) {
      this.setupExternalClickListeners();
    }
  }

  /**
   * Component lifecycle method that runs when the component is disconnected from the DOM
   */
  disconnectedCallback() {
    if (this.playObserver) {
      this.playObserver.disconnect();
    }

    if (this.imageObserver) {
      this.imageObserver.disconnect();
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    // Remove click event listeners
    this.clickTriggerElements.forEach(({ element, handler }) => {
      element.removeEventListener('click', handler);
    });
    this.clickTriggerElements = [];
  }

  /**
   * Parse the video URL to extract information needed for embedding
   */
  private parseVideoUrl() {
    if (!this.src) {
      this.videoInfo = {
        type: 'unknown',
        id: '',
        embedUrl: '',
      };
      return;
    }

    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const youtubeMatch = this.src.match(youtubeRegex);

    // Vimeo URL patterns
    const vimeoRegex = /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i;
    const vimeoMatch = this.src.match(vimeoRegex);

    if (youtubeMatch && youtubeMatch[1]) {
      this.videoInfo = {
        type: 'youtube',
        id: youtubeMatch[1],
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`,
      };
    } else if (vimeoMatch && vimeoMatch[1]) {
      this.videoInfo = {
        type: 'vimeo',
        id: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      };
    } else {
      // For other embed types, use the src directly
      this.videoInfo = {
        type: 'unknown',
        id: '',
        embedUrl: this.src,
      };
    }
  }

  // Add a new method to set up click event listeners
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
      }
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
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
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

  /**
   * Listen for click events on the preview image
   */
  @Listen('click')
  handleClick() {
    if (!this.loaded) {
      this.loadVideo();
    }
  }

  render() {
    const containerStyle = {
      width: this.width,
      height: this.height !== 'auto' ? this.height : null,
      position: 'relative',
    };

    if (!this.loaded) {
      return (
        <div class="lazy-embed-container" style={containerStyle}>
          <div class="preview-container">
            {this.previewImage && this.imageLoaded ? (
              <img
                src={this.previewImage}
                alt={this.alt}
                class="preview-image"
              />
            ) : (
              <div class="placeholder">
                <div class="play-button"></div>
              </div>
            )}
            <div class="play-overlay">
              <div class="play-button" aria-label="Play video"></div>
            </div>
          </div>
        </div>
      );
    } else {
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
  }
}
