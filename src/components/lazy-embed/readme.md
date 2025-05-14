# lazy-embed



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute                | Description                                                                                         | Type      | Default           |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------- | --------- | ----------------- |
| `alt`                 | `alt`                    | Alternative text for the preview image                                                              | `string`  | `'Video preview'` |
| `height`              | `height`                 | Height of the embed (can be px or %)                                                                | `string`  | `'auto'`          |
| `loadOnClickSelector` | `load-on-click-selector` | CSS selector for elements that should trigger video loading when clicked                            | `string`  | `''`              |
| `loadOnParentOpen`    | `load-on-parent-open`    | Whether to load the video automatically when a parent element with the specified selector is opened | `string`  | `''`              |
| `loadOnVisible`       | `load-on-visible`        | Whether to load the video automatically when it becomes visible                                     | `boolean` | `false`           |
| `previewImage`        | `preview-image`          | URL of the preview image to display before loading the video                                        | `string`  | `undefined`       |
| `src`                 | `src`                    | URL of the video to embed (YouTube, Vimeo, etc.)                                                    | `string`  | `undefined`       |
| `videoTitle`          | `video-title`            | Title of the video (for accessibility)                                                              | `string`  | `''`              |
| `width`               | `width`                  | Width of the embed (can be px or %)                                                                 | `string`  | `'100%'`          |


## Methods

### `loadVideo() => Promise<void>`

Load the video by replacing the preview image with the embed iframe

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
