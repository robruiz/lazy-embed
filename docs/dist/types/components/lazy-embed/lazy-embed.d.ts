export declare class LazyEmbed {
    /**
     * Reference to the host element
     */
    el: HTMLElement;
    /**
     * URL of the video to embed (YouTube, Vimeo, etc.)
     */
    src: string;
    /**
     * URL of the preview image to display before loading the video
     */
    previewImage: string;
    /**
     * Alternative text for the preview image
     */
    alt: string;
    /**
     * Width of the embed (can be px or %)
     */
    width: string;
    /**
     * Height of the embed (can be px or %)
     */
    height: string;
    /**
     * Title of the video (for accessibility)
     */
    videoTitle: string;
    /**
     * Whether to load the video automatically when it becomes visible
     */
    loadOnVisible: boolean;
    /**
     * Whether to load the video automatically when a parent element with the specified selector is opened
     */
    loadOnParentOpen: string;
    /**
     * CSS selector for elements that should trigger video loading when clicked
     */
    loadOnClickSelector: string;
    /**
     * Whether the video has been loaded
     */
    loaded: boolean;
    /**
     * IntersectionObserver instance for detecting when the component is visible
     */
    private observer;
    /**
     * MutationObserver instance for detecting when a parent element is opened
     */
    private mutationObserver;
    /**
     * Store references to elements and their click event handlers
     */
    private clickTriggerElements;
    /**
     * Parsed video information
     */
    private videoInfo;
    /**
     * Component lifecycle method that runs when the component is first connected to the DOM
     */
    connectedCallback(): void;
    /**
     * Component lifecycle method that runs when the component is disconnected from the DOM
     */
    disconnectedCallback(): void;
    /**
     * Parse the video URL to extract information needed for embedding
     */
    private parseVideoUrl;
    private setupExternalClickListeners;
    /**
     * Set up IntersectionObserver to detect when the component is visible
     */
    private setupIntersectionObserver;
    /**
     * Set up MutationObserver to detect when a parent element is opened
     */
    private setupMutationObserver;
    /**
     * Load the video by replacing the preview image with the embed iframe
     */
    loadVideo(): Promise<void>;
    /**
     * Listen for click events on the preview image
     */
    handleClick(): void;
    render(): any;
}
