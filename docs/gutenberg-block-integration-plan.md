# Gutenberg Block Integration Plan — `lazy-embed`

This document is the handoff plan for integrating the `lazy-embed` web
component into a WordPress Gutenberg block via the custom block dev system.

## 1. What the component provides (post-update)

- Fully reactive: `src` changes re-parse the URL and reset to preview state
  (safe for the editor, where attributes change on every keystroke).
- Accessible: the play overlay is a real `<button>` (focus + Enter/Space).
- Configurable embed: `autoplay`, `youtube-nocookie`, `params`,
  `aspect-ratio` (or explicit `height`).
- Auto-derived YouTube thumbnail when `preview-image` is omitted.
- Validated sources: empty/non-URL `src` renders a disabled placeholder
  instead of a broken iframe.
- Build outputs available: `dist/lazy-embed/lazy-embed.esm.js` (ES module,
  self-defining) and `dist/lazy-embed/lazy-embed.cjs.js`.

## 2. Packaging strategy

Recommended: **npm dependency + enqueue the built ESM bundle.**

1. `npm install @robcruiz/lazy-embed` in the block system's plugin/theme.
2. Do **not** let the bundler tree-shake the component into per-block chunks.
   Import the prebuilt ESM file directly in the block's front-end entry (or
   enqueue it as a static asset) so the custom element is registered exactly
   once per page:
   ```js
   import '@robcruiz/lazy-embed/dist/lazy-embed/lazy-embed.esm.js';
   ```
3. Register the script as a WordPress asset and reference it in `block.json`:
   ```json
   {
     "viewScript": ["lazy-embed-component", "lazy-embed-block-view"],
     "editorScript": "file:./index.js"
   }
   ```
   - `lazy-embed-component` = the Stencil ESM build, registered with
     `wp_register_script()` (module type handled by WP 6.3+ script modules or
     a plain script tag; the ESM bundle self-registers the element).
   - Only `viewScript` strictly needs it, but including it in the editor too
     makes the preview interactive.

If the custom block dev system already has a shared "runtime chunks" or
"vendor scripts" mechanism, the component belongs there, not in each block
bundle — the element must be defined once, and `customElements.define` throws
on double-definition.

## 3. Block shape

Attributes mirror the component props 1:1 (kebab-case in markup, camelCase in
block attributes):

| Block attribute | Component prop | Type | Default |
|---|---|---|---|
| `src` | `src` | string | `''` |
| `previewImage` | `preview-image` | string | `''` |
| `alt` | `alt` | string | `'Video preview'` |
| `videoTitle` | `video-title` | string | `''` |
| `aspectRatio` | `aspect-ratio` | string | `'16:9'` |
| `height` | `height` | string | `'auto'` |
| `autoplay` | `autoplay` | boolean | `true` |
| `youtubeNocookie` | `youtube-nocookie` | boolean | `false` |
| `params` | `params` | string | `''` |

Skip exposing `load-on-visible`, `play-on-visible`, `load-on-parent-open`,
`load-on-click-selector` in the block UI at first — they are page-builder
patterns, not editor concerns. Keep them available via block filters/later
iterations if needed.

### Editor (`Edit` component)

- Render a real `<lazy-embed>` inside the block preview. The component works
  in the editor DOM because it is just a custom element.
- Controls (InspectorControls):
  - URL field (or reuse `core`'s URL pattern from embed blocks) → `src`.
  - Aspect ratio select (16:9 / 4:3 / 1:1 / custom) → `aspectRatio`.
  - Toggle: privacy mode → `youtubeNocookie`.
  - Toggle: autoplay → `autoplay`.
  - Advanced text field → `params`.
- Optional nicety: when `src` is a YouTube URL, prefill `previewImage` and
  `videoTitle` from the video ID (thumbnail from
  `https://i.ytimg.com/vi/<id>/maxresdefault.jpg`). The component already
  falls back to a derived thumbnail, so this is cosmetic only.
- Because the component resets to preview state on `src` change, editing the
  URL in the sidebar updates the preview live with no remount needed.

### Save (`save` function / `save.js`)

Static markup, mirroring attributes to kebab-case:

```jsx
export const save = ({ attributes }) => (
  <div {...useBlockProps.save()}>
    <lazy-embed
      src={attributes.src}
      preview-image={attributes.previewImage}
      alt={attributes.alt}
      video-title={attributes.videoTitle}
      aspect-ratio={attributes.aspectRatio}
      autoplay={attributes.autoplay ? 'true' : 'false'}
      youtube-nocookie={attributes.youtubeNocookie ? 'true' : 'false'}
      params={attributes.params}
    />
  </div>
);
```

Notes:

- Custom elements in `save()` output are fine; `wp.element.createElement`
  handles unknown tags. If using raw `createElement`, pass the kebab-case
  attributes via a spread on the element (JSX above already does).
- Booleans must be serialized as `"true"`/`"false"` strings — Stencil parses
  boolean props from attributes, and absent means `false` except where the
  default is `true` (autoplay). Consider always writing the attribute
  explicitly to avoid ambiguity between old/new content.
- This is a **dynamic-friendly** block: if the custom block system prefers
  PHP `render_callback` over static save, the same markup can be emitted from
  PHP and `save` can return `null`. PHP rendering has the advantage of
  keeping server-side control (e.g., stripping `autoplay` for embed policies).

## 4. Sanitization / KSES considerations

- `src` and `params` are the only user-controlled strings that end up in the
  iframe URL. Validate in `Edit` (URL input) and, if using PHP rendering,
  escape with `esc_url()` / allow-list `params` keys.
- `<lazy-embed>` will not be in KSES' allowed tags for non-superadmin users.
  If content is saved by limited users, either add the tag + attributes to
  `wp_kses_allowed_html` via filter, or use a dynamic block
  (`render_callback`) so stored post content is only the attribute JSON.

## 5. Styles

- The component is shadow-DOM encapsulated; no theme CSS can leak in or out.
- The block wrapper (`useBlockProps`) should not add padding/margins around
  the element beyond what themes normally apply to figures/embeds.
- If theme-level styling of the play button is desired later, expose CSS
  custom properties (e.g., `--lazy-embed-accent`) in the component first —
  flag this as a possible follow-up.

## 6. Testing / QA checklist for the block system

- [ ] Two instances of the block on one page → no
      `customElements.define` duplicate error (component loaded once).
- [ ] Editing `src` in the sidebar updates the preview without selecting the
      block again (validates the `@Watch` reset path).
- [ ] Front end: click loads iframe; keyboard Tab → Enter loads iframe.
- [ ] `autoplay=false` renders an embed URL without `autoplay=1`.
- [ ] `youtube-nocookie` swaps the embed host.
- [ ] Invalid URL shows the disabled placeholder, not a broken iframe.
- [ ] Aspect-ratio variants render at correct ratios on the front end.
- [ ] Block validation: change markup serialization once and do not touch it
      after — attribute order/serializations breaking `save()` validation is
      the classic migration bug with custom-element blocks.
- [ ] Editor console clean (no 404s for the component script).

## 7. Suggested iteration order

1. Wire up the component asset (register + `viewScript`) with a hard-coded
   test block → confirm the custom element hydrates in both editor and front
   end. This is the riskiest step in any custom block system; do it first.
2. Add block attributes + `Edit` controls, no `Save` (dynamic render) or
   static save per the system's convention.
3. Add sanitization rules and KSES handling.
4. Add QA pass from section 6, then polish (prefill thumbnail, spacing
   presets, alignment support via `getAlignmentsSupport`).

## 8. Open questions for the handoff

- Static vs dynamic block convention in the custom block dev system?
- Is there a central asset-registration layer for shared scripts?
- Any embed allow-list requirements (e.g., only YouTube/Vimeo permitted)?
- Does the system target WP 6.3+ (native script modules) or older (script
  tag injection)?
