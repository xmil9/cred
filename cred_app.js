//
// Cv resource editor application.
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
var cred = tryRequire('./cred_types') || cred || {};

///////////////////

// App module.
cred.app = (function() {
  ///////////////////

  // Represents the cred application.
  class App {
    constructor() {
      this._model = new cred.resource.ResourceManager();
      this._layout = new cred.layout.Layout();
      this._view = new cred.ui.Ui();
      this._controller = new cred.controller.Controller(
        this,
        this._model,
        this._view,
        this._layout
      );

      this._registerEvents();
    }

    // Sets up the application.
    _setup() {
      this._controller.setup();
    }

    _registerEvents() {
      $(document).ready(() => cred.appInstance._setup());
    }
  }

  ///////////////////

  // Exports
  return {
    App: App
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.app;

///////////////////

// App instance.
cred.appInstance = new cred.app.App();
