import { p as promiseResolve, b as bootstrapLazy } from './index-CAMS5NHk.js';
export { s as setNonce } from './index-CAMS5NHk.js';
import { g as globalScripts } from './app-globals-DQuL1Twl.js';

/*
 Stencil Client Patch Browser v4.31.0 | MIT Licensed | https://stenciljs.com
 */

var patchBrowser = () => {
  const importMeta = import.meta.url;
  const opts = {};
  if (importMeta !== "") {
    opts.resourcesUrl = new URL(".", importMeta).href;
  }
  return promiseResolve(opts);
};

patchBrowser().then(async (options) => {
  await globalScripts();
  return bootstrapLazy([["lazy-embed",[[1,"lazy-embed",{"src":[1],"previewImage":[1,"preview-image"],"alt":[1],"width":[1],"height":[1],"videoTitle":[1,"video-title"],"loadOnVisible":[4,"load-on-visible"],"loadOnParentOpen":[1,"load-on-parent-open"],"loadOnClickSelector":[1,"load-on-click-selector"],"loaded":[32],"loadVideo":[64]},[[0,"click","handleClick"]]]]]], options);
});
//# sourceMappingURL=lazy-embed.js.map

//# sourceMappingURL=lazy-embed.js.map