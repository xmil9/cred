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

  // Generates a UUID. The UUID conforms to RFC4122 since the spec allows UUIDs
  // created randomly. However, since the time and machine are not accounted for
  // there is a (small) chance of collisions.
  // Source:
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (
        c ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  ///////////////////

  // Exports for util module.
  return {
    saveTextFile: saveTextFile,
    uuidv4: uuidv4
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = web;
