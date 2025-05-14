# lazy-embed

A web component that lazy loads video embeds (YouTube, Vimeo, etc.) to improve page performance. It displays a preview image until the video is loaded, which happens when the user clicks on the preview, when the component becomes visible in the viewport, or when a specified parent element is opened.

## Features

- Displays a preview image until the video is loaded
- Supports YouTube and Vimeo videos (and can be extended for other platforms)
- Loads the video only when needed (on click, on visibility, or when a parent element is opened)
- Fully responsive with 16:9 aspect ratio by default
- Customizable width and height
- Accessible with proper ARIA attributes

## Usage

### Basic Usage

```html
<lazy-embed 
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  preview-image="https://example.com/preview-image.jpg"
  alt="Video preview"
></lazy-embed>
```

### With Auto-Loading on Visibility

```html
<lazy-embed 
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  preview-image="https://example.com/preview-image.jpg"
  load-on-visible="true"
></lazy-embed>
```

### With Auto-Loading When Parent Element is Opened

```html
<div id="my-modal">
  <lazy-embed 
    src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    preview-image="https://example.com/preview-image.jpg"
    load-on-parent-open="#my-modal"
  ></lazy-embed>
</div>
```

### With Custom Dimensions

```html
<lazy-embed 
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  preview-image="https://example.com/preview-image.jpg"
  width="800px"
  height="450px"
></lazy-embed>
```

## Properties

| Property           | Attribute            | Description                                                                | Type      | Default         |
| ------------------ | -------------------- | -------------------------------------------------------------------------- | --------- | --------------- |
| `src`              | `src`                | URL of the video to embed (YouTube, Vimeo, etc.)                           | `string`  | `undefined`     |
| `previewImage`     | `preview-image`      | URL of the preview image to display before loading the video               | `string`  | `undefined`     |
| `alt`              | `alt`                | Alternative text for the preview image                                     | `string`  | `'Video preview'` |
| `width`            | `width`              | Width of the embed (can be px or %)                                        | `string`  | `'100%'`        |
| `height`           | `height`             | Height of the embed (can be px or %)                                       | `string`  | `'auto'`        |
| `title`            | `title`              | Title of the video (for accessibility)                                     | `string`  | `''`            |
| `loadOnVisible`    | `load-on-visible`    | Whether to load the video automatically when it becomes visible            | `boolean` | `false`         |
| `loadOnParentOpen` | `load-on-parent-open`| Selector for a parent element that, when opened, triggers loading          | `string`  | `''`            |

## Methods

### `loadVideo() => Promise<void>`

Manually load the video by replacing the preview image with the embed iframe.

## Events

None, but the component listens for click events on the preview image to load the video.

## Styling

The component uses Shadow DOM for encapsulation, but you can customize its appearance using CSS variables (to be added in future versions).

## Browser Support

This component uses modern web APIs like IntersectionObserver and MutationObserver. For older browsers, you may need to include polyfills.