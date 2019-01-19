//
// Main script for cv resource editor.
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
cred.ui_internal = tryRequire('./ui_internal') || cred.ui_internal || {};

///////////////////

// Controller module.
cred.ui = (function() {
  ///////////////////

  // Represents the resource editor's UI.
  class Ui {
    constructor() {
      this._controller = undefined;
      this._propertyPane = new cred.ui_internal.PropertyPane(this);
      this._displayHeader = new cred.ui_internal.DisplayHeader(this);
    }

    // --- External interface ---

    // Initializes UI elements.
    setup() {
      let self = this;
      $('#open-cmd').on('click', event => self._onOpenCmdClicked(event));
      $('#file-input').on('change', event => self._onFilesSelected(event));
      $('#save-cmd').on('click', event => self._onSaveCmdClicked(event));
      $('.tab').on('click', event => self._onLocaleTabClicked(event));

      this._propertyPane.setup();
      this._displayHeader.setup();

      // Select default tab.
      $('.default-tab').click();
    }

    set controller(value) {
      this._controller = value;
    }

    get selectedItem() {
      return this._controller.selectedItem;
    }

    get currentLocale() {
      return cred.ui_internal.localeFromContentId(
        cred.ui_internal.contentIdFromHtmlElement($('.tab.active'))
      );
    }

    isLinkedToMaster(locale) {
      return this._controller.isLinkedToMaster(locale);
    }

    lookupString(stringId) {
      return this._controller.lookupString(stringId);
    }

    // Returns map of locales and associated HTML elements where the
    // dialog for each locale should be displayed.
    displayHtmlElements() {
      let displayElems = $('.dialog-display');
      let elemMap = new Map();
      for (let locale of cred.locale) {
        elemMap.set(locale, this._displayHtmlElement(locale, displayElems));
      }
      return elemMap;
    }

    // Returns whether a given property is set to have global effect when edited.
    isPropertyGlobal(propertyLabel) {
      let $globalCheckbox = $(
        `#${cred.ui_internal.makeHtmlImageCheckboxId(propertyLabel)}`
      );
      // Local when checked, global when unchecked.
      return !$globalCheckbox.hasClass('checked');
    }

    // Populates the UI with the given dialog.
    populate(dlgResourceSet) {
      $('#filename').text(dlgResourceSet.masterFileName);
    }

    // Clears the content displayed in the UI.
    clear() {
      // TODO
    }

    // Displays error information.
    showError(errMsg) {
      alert(errMsg);
    }

    // --- Notifications ---
    // Notifications to be forwared to the controller. The Ui object serves as
    // proxy for the controller to all objects that are owned by the Ui.
    // It calls the actual controller with the correct 'source' parameter.

    notifyItemIdModified(id) {
      this._controller.notifyItemIdModified(this, id);
    }

    notifyItemBoundsModified(bounds) {
      this._controller.notifyItemBoundsModified(this, bounds);
    }

    notifyItemPropertyModified(propertyLabel, value) {
      this._controller.notifyItemPropertyModified(this, propertyLabel, value);
    }

    notifyItemLocalizedStringPropertyModified(propertyLabel, value) {
      this._controller.notifyItemLocalizedStringPropertyModified(
        this,
        propertyLabel,
        value
      );
    }

    notifyItemFlagPropertyModified(propertyLabel, flagText, flagValue, isSet) {
      this._controller.notifyItemFlagPropertyModified(
        this,
        propertyLabel,
        flagText,
        flagValue,
        isSet
      );
    }

    notifyLinkedToMasterModified(isLinked) {
      this._controller.notifyLinkedToMasterModified(this, isLinked);
      // Since the UI is source of the notification it won't receive it, so we
      // have to update the other parts of the UI here.
      this._propertyPane.update();
    }

    // --- Notification handlers ---

    onDialogLoadedNotification(dlgResourceSet) {
      this.clear();
      this.populate(dlgResourceSet);
    }

    onAfterDialogLoadedNotification() {
      this._displayHeader.update();
    }

    onErrorOccurredNotification(errMsg) {
      this.showError(errMsg);
    }

    onItemSelectedNotification(item) {
      this._propertyPane.populate(item);
    }

    onSelectionClearedNotification() {
      this._propertyPane.clear();
    }

    onItemBoundsModifiedNotification(bounds) {
      this._propertyPane.setBounds(bounds);
    }

    // --- Event handlers ---

    // Handles 'click' events for the 'open' button.
    _onOpenCmdClicked() {
      // Fire 'click' event for the hidden file input element.
      $('#file-input').trigger('click');
    }

    // Handles 'click' events for the 'save' button.
    _onSaveCmdClicked() {
      this._controller.notifySaveChosen(this);
    }

    // Handles 'files selected' events for the file input element.
    _onFilesSelected(event) {
      let files = event.target.files;
      if (files.length === 0) {
        this.showError('Select a set of dialog file.');
      } else {
        this._controller.notifyFilesChosen(this, files);
      }
    }

    // Handles 'click' events for the locale tabs.
    _onLocaleTabClicked(event) {
      this._activateLocaleTab(event.target);
      this._controller.notifyLocaleSwitched(
        this,
        cred.ui_internal.localeFromContentId(
          cred.ui_internal.contentIdFromHtmlElement(event.target)
        )
      );
      // After the other app components have reacted to the locale switch
      // update the different parts of the UI.
      this._propertyPane.update();
      this._displayHeader.update();
    }

    // --- Internal functions ---

    // Returns the HTML element where the dialog for a given locale is displayed.
    // The second parameter is optional. It allows to optimize the code by avoiding
    // repeatedly getting all display elements.
    _displayHtmlElement(locale, displayElems) {
      if (!displayElems) {
        displayElems = $('#dialog-display');
      }
      for (let i = 0; i < displayElems.length; ++i) {
        if ($(displayElems[i]).data('locale') === locale) {
          return displayElems[i];
        }
      }
      return undefined;
    }

    // Activates a given locale tab.
    _activateLocaleTab(tabElement) {
      // Hide the content of all tabs.
      $('.tab-content').hide();
      // Clear 'active' flag from the class name of all tabs.
      $('.tab').attr('class', 'tab');
      // Show the associated content.
      const contentId = cred.ui_internal.contentIdFromHtmlElement(tabElement);
      $('#' + contentId).show();
      // Mark the tab as active.
      tabElement.className += ' active';
    }
  }

  ///////////////////

  // Exports
  return {
    Ui: Ui
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.ui;
