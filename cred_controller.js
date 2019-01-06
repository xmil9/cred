//
// Controller for mediating interacions between app and ui.
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

// Controller module.
cred.controller = (function() {
  ///////////////////

  // Orchestrates the interactions between the different parts of the app.
  class Controller {
    constructor(app, model, view, layout) {
      if (!app || !model || !view || !layout) {
        throw new Error('Invalid arguments. Required argument missing.');
      }

      this._app = app;
      this._model = model;
      this._view = view;
      this._layout = layout;
      // Array of all controlled components. Makes using them generically easier.
      // They are ordered from lowest to highest level because this is usually the
      // sequence you want them to process notifications.
      this._controlledLowToHighLevel = [model, layout, view, app];

      // Hook up controller to other components.
      this._model.controller = this;
      this._layout.controller = this;
      this._view.controller = this;
    }

    // --- External interface ---

    // Initializes other controlled components when called by app at startup.
    setup() {
      for (let i = 0; i < this._controlledLowToHighLevel.length; ++i) {
        if (this._controlledLowToHighLevel[i] !== this._app) {
          this._controlledLowToHighLevel[i].setup();
        }
      }
    }

    // Returns the currently displayed locale.
    get currentLocale() {
      return this._view.currentLocale;
    }

    // Returns the language for the currently displayed locale.
    currentLanguage(replaceAnyWith = undefined) {
      return cred.languageFromLocale(this._view.currentLocale, replaceAnyWith);
    }

    // Returns the dialog resource for a given locale.
    dialogResource(locale) {
      return this._model.dialogResource(locale);
    }

    isLinkedToMaster(locale) {
      return this._model.isLinkedToMaster(locale);
    }

    *linkedLocales() {
      yield* this._model.linkedLocales();
    }

    lookupString(stringId) {
      return this._model.lookupString(
        stringId,
        this.currentLanguage(cred.language.english)
      );
    }

    get selectedItem() {
      return this._layout.selectedItem(this.currentLocale);
    }

    // Returns map that associates locales with the HTML elements that serve as
    // containers for displaying the dialog.
    displayHtmlElements() {
      return this._view.displayHtmlElements();
    }

    // Returns whether a given property for the current item is set to have global
    // effect when edited.
    isCurrentPropertyGlobal(propertyLabel) {
      return this._view.isPropertyGlobal(propertyLabel);
    }

    // --- Notifications ---

    notifyErrorOccurred(source, errMsg) {
      this._dispatch(source, 'onErrorOccurredNotification', errMsg);
    }

    notifyDialogLoaded(source, dlgResourceSet) {
      this._dispatch(source, 'onDialogLoadedNotification', dlgResourceSet);
      this._dispatch(source, 'onAfterDialogLoadedNotification');
    }

    notifyFilesChosen(source, files) {
      this._dispatch(source, 'onFilesChosenNotification', files);
    }

    notifySaveChosen(source) {
      this._dispatch(source, 'onSaveChosenNotification');
    }

    notifyLocaleSwitched(source, locale) {
      this._dispatch(source, 'onLocaleSwitchedNotification', locale);
    }

    notifyItemSelected(source, item) {
      this._dispatch(source, 'onItemSelectedNotification', item);
    }

    notifySelectionCleared(source) {
      this._dispatch(source, 'onSelectionClearedNotification');
    }

    notifyItemIdModified(source, id) {
      this._dispatch(source, 'onItemIdModifiedNotification', id);
    }

    notifyItemBoundsModified(source, bounds) {
      this._dispatch(source, 'onItemBoundsModifiedNotification', bounds);
    }

    notifyItemPropertyModified(source, propertyLabel, value) {
      this._dispatch(source, 'onItemPropertyModifiedNotification', propertyLabel, value);
    }

    notifyItemLocalizedStringPropertyModified(source, propertyLabel, value) {
      this._dispatch(
        source,
        'onItemLocalizedStringPropertyModifiedNotification',
        propertyLabel,
        value
      );
    }

    notifyItemFlagPropertyModified(source, propertyLabel, flagText, flagValue, isSet) {
      this._dispatch(
        source,
        'onItemFlagPropertyModifiedNotification',
        propertyLabel,
        flagText,
        flagValue,
        isSet
      );
    }

    notifyLinkedToMasterModified(source, isLinked) {
      this._dispatch(source, 'onLinkedToMasterModifiedNotification', isLinked);
    }

    // --- Internal functions ---

    // Dispatches notifications to the controlled components.
    _dispatch(source, notificationFunc) {
      // Extract all parameters that are passed in addition to the named ones
      // into an array. They will be forwarded to the notified objects.
      let forwardedArgs = Array.from(arguments).slice(2);
      // Call the given notification function for all controlled objects that
      // support it. Skip the source object that initiated the call, if one
      // is given.
      for (let i = 0; i < this._controlledLowToHighLevel.length; ++i) {
        let target = this._controlledLowToHighLevel[i];
        if (target !== source && notificationFunc in target) {
          target[notificationFunc](...forwardedArgs);
        }
      }
    }
  }

  ///////////////////

  // Exports
  return {
    Controller: Controller
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.controller;
