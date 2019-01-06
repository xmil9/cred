//
// File system functionality.
//
'use strict';

///////////////////

// File system module.
var filesys = (function() {
  ///////////////////

  // Returns the file extension of a given path.
  function extractExtension(path) {
    if (path.indexOf('.') === -1) {
      return '';
    }
    return path.split('.').pop();
  }

  // Returns the file name including the extension of a given path.
  function extractFileName(path) {
    // Replace everything between the beginning and the last '\' or '/'
    // with an empty string.
    return path.replace(/^.*[\\/]/, '');
  }

  ///////////////////

  // Exports
  return {
    extractExtension: extractExtension,
    extractFileName: extractFileName
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = filesys;
