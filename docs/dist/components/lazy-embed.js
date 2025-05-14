import { p as proxyCustomElement, H, h } from './p-DWLgTPqg.js';

const lazyEmbedCss = ":host{display:block}.lazy-embed-container{position:relative;overflow:hidden;width:100%;max-width:100%}.preview-container{position:relative;width:100%;height:0;padding-bottom:56.25%;background-color:#000;cursor:pointer}.preview-image{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover}.placeholder{position:absolute;top:0;left:0;width:100%;height:100%;background-color:#000;display:flex;justify-content:center;align-items:center}.play-overlay{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;justify-content:center;align-items:center;background-color:rgba(0, 0, 0, 0.2);transition:background-color 0.3s ease}.play-overlay:hover{background-color:rgba(0, 0, 0, 0.4)}.play-button{width:68px;height:48px;background-color:rgba(0, 0, 0, 0.7);border-radius:8px;position:relative;transition:background-color 0.3s ease}.play-button::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-40%, -50%);width:0;height:0;border-style:solid;border-width:10px 0 10px 20px;border-color:transparent transparent transparent #fff}.play-overlay:hover .play-button{background-color:#ff0000}.embed-responsive{position:relative;width:100%;height:0;padding-bottom:56.25%;}.embed-responsive iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}";

const LazyEmbed$1 = /*@__PURE__*/ proxyCustomElement(class LazyEmbed extends H {
    constructor() {
        super();
        this.__registerHost();
        this.__attachShadow();
    }
    get el() { return this; }
    /**
     * URL of the video to embed (YouTube, Vimeo, etc.)
     */
    src;
    /**
     * URL of the preview image to display before loading the video
     */
    previewImage;
    /**
     * Alternative text for the preview image
     */
    alt = 'Video preview';
    /**
     * Width of the embed (can be px or %)
     */
    width = '100%';
    /**
     * Height of the embed (can be px or %)
     */
    height = 'auto';
    /**
     * Title of the video (for accessibility)
     */
    videoTitle = '';
    /**
     * Whether to load the video automatically when it becomes visible
     */
    loadOnVisible = false;
    /**
     * Whether to load the video automatically when a parent element with the specified selector is opened
     */
    loadOnParentOpen = '';
    /**
     * CSS selector for elements that should trigger video loading when clicked
     */
    loadOnClickSelector = '';
    /**
     * Whether the video has been loaded
     */
    loaded = false;
    /**
     * IntersectionObserver instance for detecting when the component is visible
     */
    observer;
    /**
     * MutationObserver instance for detecting when a parent element is opened
     */
    mutationObserver;
    /**
     * Store references to elements and their click event handlers
     */
    clickTriggerElements = [];
    /**
     * Parsed video information
     */
    videoInfo;
    /**
     * Component lifecycle method that runs when the component is first connected to the DOM
     */
    connectedCallback() {
        this.parseVideoUrl();
        if (this.loadOnVisible) {
            this.setupIntersectionObserver();
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
        if (this.observer) {
            this.observer.disconnect();
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
    parseVideoUrl() {
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
        }
        else if (vimeoMatch && vimeoMatch[1]) {
            this.videoInfo = {
                type: 'vimeo',
                id: vimeoMatch[1],
                embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
            };
        }
        else {
            // For other embed types, use the src directly
            this.videoInfo = {
                type: 'unknown',
                id: '',
                embedUrl: this.src,
            };
        }
    }
    // Add a new method to set up click event listeners
    setupExternalClickListeners() {
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
     * Set up IntersectionObserver to detect when the component is visible
     */
    setupIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !this.loaded) {
                this.loadVideo();
            }
        }, {
            rootMargin: '100px',
            threshold: 0.1,
        });
        this.observer.observe(this.el);
    }
    /**
     * Set up MutationObserver to detect when a parent element is opened
     */
    setupMutationObserver() {
        const parentElement = document.querySelector(this.loadOnParentOpen);
        if (!parentElement) {
            console.warn(`Parent element with selector "${this.loadOnParentOpen}" not found.`);
            return;
        }
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
                    // Check if the parent element is now visible
                    const computedStyle = window.getComputedStyle(parentElement);
                    if (computedStyle.display !== 'none' &&
                        computedStyle.visibility !== 'hidden' &&
                        !this.loaded) {
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
    async loadVideo() {
        if (!this.loaded && this.videoInfo.embedUrl) {
            this.loaded = true;
        }
    }
    /**
     * Listen for click events on the preview image
     */
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
            return (h("div", { class: "lazy-embed-container", style: containerStyle }, h("div", { class: "preview-container" }, this.previewImage ? (h("img", { src: this.previewImage, alt: this.alt, class: "preview-image" })) : (h("div", { class: "placeholder" }, h("div", { class: "play-button" }))), h("div", { class: "play-overlay" }, h("div", { class: "play-button", "aria-label": "Play video" })))));
        }
        else {
            return (h("div", { class: "lazy-embed-container", style: containerStyle }, h("div", { class: "embed-responsive" }, h("iframe", { src: this.videoInfo.embedUrl, title: this.videoTitle || 'Embedded video', frameborder: "0", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowfullScreen: true }))));
        }
    }
    static get style() { return lazyEmbedCss; }
}, [1, "lazy-embed", {
        "src": [1],
        "previewImage": [1, "preview-image"],
        "alt": [1],
        "width": [1],
        "height": [1],
        "videoTitle": [1, "video-title"],
        "loadOnVisible": [4, "load-on-visible"],
        "loadOnParentOpen": [1, "load-on-parent-open"],
        "loadOnClickSelector": [1, "load-on-click-selector"],
        "loaded": [32],
        "loadVideo": [64]
    }, [[0, "click", "handleClick"]]]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["lazy-embed"];
    components.forEach(tagName => { switch (tagName) {
        case "lazy-embed":
            if (!customElements.get(tagName)) {
                customElements.define(tagName, LazyEmbed$1);
            }
            break;
    } });
}
defineCustomElement$1();

const LazyEmbed = LazyEmbed$1;
const defineCustomElement = defineCustomElement$1;

export { LazyEmbed, defineCustomElement };
//# sourceMappingURL=lazy-embed.js.map

//# sourceMappingURL=lazy-embed.js.map