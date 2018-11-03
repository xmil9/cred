//
// Cv resource editor application.
//
'use strict';

///////////////////

// Imports
// These are provided through (ordered!) script tags in the HTML file.
var cred = cred || {};

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

///////////////////

// App instance.
cred.appInstance = new cred.app.App();
