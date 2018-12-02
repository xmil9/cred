//
// Utility functionality for web/front-end.
//
'use strict';

///////////////////

// Namespaces
var web = web || {};

///////////////////

// Web module.
web = (function() {
  ///////////////////

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

  // Exports for util module.
  return {
    saveTextFile: saveTextFile
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = web;
