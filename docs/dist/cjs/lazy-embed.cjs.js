'use strict';

var index = require('./index-BSKcLhN8.js');
var appGlobals = require('./app-globals-V2Kpy_OQ.js');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
/*
 Stencil Client Patch Browser v4.31.0 | MIT Licensed | https://stenciljs.com
 */

var patchBrowser = () => {
  const importMeta = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('lazy-embed.cjs.js', document.baseURI).href));
  const opts = {};
  if (importMeta !== "") {
    opts.resourcesUrl = new URL(".", importMeta).href;
  }
  return index.promiseResolve(opts);
};

patchBrowser().then(async (options) => {
  await appGlobals.globalScripts();
  return index.bootstrapLazy([["lazy-embed.cjs",[[1,"lazy-embed",{"src":[1],"previewImage":[1,"preview-image"],"alt":[1],"width":[1],"height":[1],"videoTitle":[1,"video-title"],"loadOnVisible":[4,"load-on-visible"],"loadOnParentOpen":[1,"load-on-parent-open"],"loadOnClickSelector":[1,"load-on-click-selector"],"loaded":[32],"loadVideo":[64]},[[0,"click","handleClick"]]]]]], options);
});

exports.setNonce = index.setNonce;
//# sourceMappingURL=lazy-embed.cjs.js.map

//# sourceMappingURL=lazy-embed.cjs.js.map