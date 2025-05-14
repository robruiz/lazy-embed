import { h } from "@stencil/core";
export class LazyEmbed {
    /**
     * Reference to the host element
     */
    el;
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
    static get is() { return "lazy-embed"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() {
        return {
            "$": ["lazy-embed.css"]
        };
    }
    static get styleUrls() {
        return {
            "$": ["lazy-embed.css"]
        };
    }
    static get properties() {
        return {
            "src": {
                "type": "string",
                "attribute": "src",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "URL of the video to embed (YouTube, Vimeo, etc.)"
                },
                "getter": false,
                "setter": false,
                "reflect": false
            },
            "previewImage": {
                "type": "string",
                "attribute": "preview-image",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "URL of the preview image to display before loading the video"
                },
                "getter": false,
                "setter": false,
                "reflect": false
            },
            "alt": {
                "type": "string",
                "attribute": "alt",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Alternative text for the preview image"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "'Video preview'"
            },
            "width": {
                "type": "string",
                "attribute": "width",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Width of the embed (can be px or %)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "'100%'"
            },
            "height": {
                "type": "string",
                "attribute": "height",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Height of the embed (can be px or %)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "'auto'"
            },
            "videoTitle": {
                "type": "string",
                "attribute": "video-title",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Title of the video (for accessibility)"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "''"
            },
            "loadOnVisible": {
                "type": "boolean",
                "attribute": "load-on-visible",
                "mutable": false,
                "complexType": {
                    "original": "boolean",
                    "resolved": "boolean",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Whether to load the video automatically when it becomes visible"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "false"
            },
            "loadOnParentOpen": {
                "type": "string",
                "attribute": "load-on-parent-open",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "Whether to load the video automatically when a parent element with the specified selector is opened"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "''"
            },
            "loadOnClickSelector": {
                "type": "string",
                "attribute": "load-on-click-selector",
                "mutable": false,
                "complexType": {
                    "original": "string",
                    "resolved": "string",
                    "references": {}
                },
                "required": false,
                "optional": false,
                "docs": {
                    "tags": [],
                    "text": "CSS selector for elements that should trigger video loading when clicked"
                },
                "getter": false,
                "setter": false,
                "reflect": false,
                "defaultValue": "''"
            }
        };
    }
    static get states() {
        return {
            "loaded": {}
        };
    }
    static get methods() {
        return {
            "loadVideo": {
                "complexType": {
                    "signature": "() => Promise<void>",
                    "parameters": [],
                    "references": {
                        "Promise": {
                            "location": "global",
                            "id": "global::Promise"
                        }
                    },
                    "return": "Promise<void>"
                },
                "docs": {
                    "text": "Load the video by replacing the preview image with the embed iframe",
                    "tags": []
                }
            }
        };
    }
    static get elementRef() { return "el"; }
    static get listeners() {
        return [{
                "name": "click",
                "method": "handleClick",
                "target": undefined,
                "capture": false,
                "passive": false
            }];
    }
}
//# sourceMappingURL=lazy-embed.js.map
