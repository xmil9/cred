//
// File system functionality.
//
'use strict';

///////////////////

// Imports
var filesys = filesys || {};

///////////////////

// File system module.
filesys = (function() {
  ///////////////////

  // Returns the file extension of a given path.
  function extractExtension(path) {
    return path
      .split('.')
      .pop()
      .toLowerCase();
  }

  // Returns the file name including the extension of a given path.
  function extractFilename(path) {
    // Replace everything between the beginning and the last '\' or '/'
    // with an empty string.
    return path.replace(/^.*[\\/]/, '');
  }

  // Saves a given text under a given filename to the 'downloads' folder.
  // Simulates click on download link.
  function saveTextFile(fileName, text, htmlLinkElement) {
    let data = new Blob([text], { type: 'text/plain' });
    let url = window.URL.createObjectURL(data);

    htmlLinkElement.href = url;
    htmlLinkElement.download = fileName;
    htmlLinkElement.click();
  }

  ///////////////////

  // Exports
  return {
    extractExtension: extractExtension,
    extractFilename: extractFilename,
    saveTextFile: saveTextFile
  };
})();
