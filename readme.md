# Lazy Embed: A Web Component for Lazy-Loaded Video Embeds

[![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)](https://stenciljs.com)

Lazy Embed is a lightweight, customizable web component that improves website performance by lazy-loading video embeds from YouTube, Vimeo, and other sources. Videos load only when needed, saving bandwidth and improving page load speed.

[Live Demo](https://robruiz.github.io/lazy-embed/)

## Features

- 🚀 **Performance**: Only loads videos when they're needed
- 🔍 **SEO-friendly**: Preview images load immediately while heavy video embeds are deferred
- 🎮 **Multiple trigger options**: Load videos on click, visibility, or other custom events
- 📱 **Responsive**: Automatically adapts to different screen sizes
- 🌐 **Framework-agnostic**: Works in any web project - no framework required
- ✨ **Simple API**: Easy to implement with just a few attributes

## Installation

### Option 1: Direct Script Import (CDN)

Add this to your HTML page:

```html
<script type="module" src="https://unpkg.com/@robcruiz/lazy-embed"></script>
```


### Option 2: NPM Installation

```shell script
npm install @robcruiz/lazy-embed
```


Then import it in your JavaScript:

```javascript
// ESM import
import '@robcruiz/lazy-embed';

// Or CommonJS
require('@robcruiz/lazy-embed');
```


## Basic Usage

```html
<lazy-embed 
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
  preview-image="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  alt="YouTube video"
  video-title="Example video">
</lazy-embed>
```


## Available Properties

| Property | Description | Type | Default |
|----------|-------------|------|---------|
| `src` | URL of the video to embed (YouTube, Vimeo, etc.) | `string` | required |
| `preview-image` | URL of the preview image to display | `string` | required |
| `alt` | Alternative text for the preview image | `string` | `'Video preview'` |
| `width` | Width of the embed (px or %) | `string` | `'100%'` |
| `height` | Height of the embed (px or %) | `string` | `'auto'` |
| `video-title` | Title of the video (for accessibility) | `string` | `''` |
| `load-on-visible` | Load video when it becomes visible in viewport | `boolean` | `false` |
| `load-on-parent-open` | CSS selector for parent element that triggers loading when opened | `string` | `''` |
| `load-on-click-selector` | CSS selector for elements that trigger loading when clicked | `string` | `''` |

## Advanced Usage Examples

### Load When Visible in Viewport

```html
<lazy-embed 
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
  preview-image="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  load-on-visible="true">
</lazy-embed>
```


### Load When Parent Element Opens

```html
<div id="accordion-item">
  <button>Open Section</button>
  <div class="content">
    <lazy-embed 
      src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
      preview-image="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
      load-on-parent-open="#accordion-item.active">
    </lazy-embed>
  </div>
</div>
```


### Load When External Element is Clicked

```html
<button id="load-video-btn">Load Video</button>

<lazy-embed 
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
  preview-image="https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  load-on-click-selector="#load-video-btn">
</lazy-embed>
```


## Browser Support

This component works in all modern browsers that support:
- Web Components (Custom Elements v1)
- IntersectionObserver API
- MutationObserver API

## Development

This component was built with [Stencil.js](https://stenciljs.com/), a toolchain for building reusable, scalable web components.

If you want to customize or contribute to this component:

```shell script
# Clone the repository
git clone https://github.com/robruiz/lazy-embed.git
cd lazy-embed

# Install dependencies
npm install

# Start the development server
npm start

# Build for production
npm run build

# Run tests
npm test
```


Learn more about building with Stencil at their [official documentation](https://stenciljs.com/docs/introduction).

## License

MIT