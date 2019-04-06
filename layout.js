//
// Abstraction for the dialog layout of the cv resource editor.
//
'use strict';

///////////////////

// Attempts to require a given file. Returns undefined if 'require' is not available.
// Helps to use the calling js file in both node.js and browser environments. In a
// node.js environment the passed dependency will be loaded through the require
// mechanism. In a browser environment this function will return undefined and the
// dependency has to be loaded through a script tag.
function tryRequire(file) {
  return typeof require !== 'undefined' ? require(file) : undefined;
}

// Dependencies
var cred = cred || {};
cred.svglayout = tryRequire('./svg_layout') || cred.svglayout || {};

///////////////////

// Layout module.
cred.layout = (function() {
  ///////////////////

  // Exports
  return {
    // Use SVG layout.
    Layout: cred.svglayout.SvgLayout
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.layout;
