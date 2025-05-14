'use strict';

var index = require('./index-BSKcLhN8.js');
var appGlobals = require('./app-globals-V2Kpy_OQ.js');

const defineCustomElements = async (win, options) => {
  if (typeof window === 'undefined') return undefined;
  await appGlobals.globalScripts();
  return index.bootstrapLazy([["lazy-embed.cjs",[[1,"lazy-embed",{"src":[1],"previewImage":[1,"preview-image"],"alt":[1],"width":[1],"height":[1],"videoTitle":[1,"video-title"],"loadOnVisible":[4,"load-on-visible"],"loadOnParentOpen":[1,"load-on-parent-open"],"loadOnClickSelector":[1,"load-on-click-selector"],"loaded":[32],"loadVideo":[64]},[[0,"click","handleClick"]]]]]], options);
};

exports.setNonce = index.setNonce;
exports.defineCustomElements = defineCustomElements;
//# sourceMappingURL=loader.cjs.js.map

//# sourceMappingURL=loader.cjs.js.map