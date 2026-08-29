# lazy-embed



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute                | Description                                                                                                                                  | Type      | Default           |
| --------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------- |
| `alt`                 | `alt`                    | Alternative text for the preview image                                                                                                       | `string`  | `'Video preview'` |
| `aspectRatio`         | `aspect-ratio`           | Aspect ratio used when height is "auto" (e.g. "16:9", "4:3", "1:1")                                                                          | `string`  | `'16:9'`          |
| `autoplay`            | `autoplay`               | Whether the embedded video should autoplay once loaded. Note: browsers may still block autoplay if the video has sound.                      | `boolean` | `true`            |
| `height`              | `height`                 | Explicit height of the embed. When left as "auto", the embed is sized by the aspectRatio prop instead.                                       | `string`  | `'auto'`          |
| `loadOnClickSelector` | `load-on-click-selector` | CSS selector for elements that should trigger video loading when clicked                                                                     | `string`  | `''`              |
| `loadOnParentOpen`    | `load-on-parent-open`    | CSS selector for a parent element that triggers loading when it becomes visible                                                              | `string`  | `''`              |
| `loadOnVisible`       | `load-on-visible`        | Load only the preview image when the component becomes visible in the viewport                                                               | `boolean` | `false`           |
| `params`              | `params`                 | Extra query parameters to append to the embed URL (e.g. "start=30&loop=1")                                                                   | `string`  | `''`              |
| `playOnVisible`       | `play-on-visible`        | Load the video when it becomes visible in the viewport, without user interaction                                                             | `boolean` | `false`           |
| `previewImage`        | `preview-image`          | URL of the preview image to display before loading the video. When omitted, a YouTube thumbnail is derived automatically for YouTube videos. | `string`  | `undefined`       |
| `src`                 | `src`                    | URL of the video to embed (YouTube, Vimeo, or any other iframe URL)                                                                          | `string`  | `undefined`       |
| `videoTitle`          | `video-title`            | Title of the video (used for the iframe title, for accessibility)                                                                            | `string`  | `''`              |
| `width`               | `width`                  | Width of the embed (can be px or %)                                                                                                          | `string`  | `'100%'`          |
| `youtubeNocookie`     | `youtube-nocookie`       | Load YouTube videos via youtube-nocookie.com (enhanced privacy mode)                                                                         | `boolean` | `false`           |


## Methods

### `loadVideo() => Promise<void>`

Load the video by replacing the preview image with the embed iframe

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
