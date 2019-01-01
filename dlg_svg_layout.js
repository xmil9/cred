//
// SVG dialog layout for cv resource editor.
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
cred.svglayout_internal =
  tryRequire('./dlg_svg_layout_internal') || cred.svglayout_internal || {};
var geom = tryRequire('./geom') || geom || {};

///////////////////

// SVG layout module.
cred.svglayout = (function() {
  ///////////////////

  // Dialog layout with SVG.
  class SvgLayout {
    constructor() {
      this._controller = undefined;
      // Map that associates locales with HTML elements that serve as
      // containers for the SVG displays for the locales.
      this._containerHtmlElems = new Map();
      // Map that associates locales with their SVG displays.
      this._svgDisplays = new Map();

      this._clearDisplays();
    }

    // Performs initial setup operations.
    setup() {}

    set controller(value) {
      this._controller = value;
    }

    // Returns the item that is selected in the display for a given locale.
    selectedItem(locale) {
      if (this._svgDisplays.has(locale)) {
        return this._svgDisplays.get(locale).selectedItem;
      }
      return undefined;
    }

    // Notifications
    // These notification funtions are called by objects within the layout module
    // and forwared the calls to the controller. The layout object basically serves
    // as proxy for the controller to all objects within the layout module. It calls
    // the actual controller with the correct 'source' parameter.

    notifyItemSelected(item) {
      this._controller.notifyItemSelected(this, item);
    }

    notifySelectionCleared() {
      this._controller.notifySelectionCleared(this);
    }

    notifyItemBoundsModified(bounds) {
      this._controller.notifyItemBoundsModified(this, bounds);
      // Apply bounds change to all linked SVG displays.
      this._setBounds(bounds, true);
    }

    // Notification handlers.
    // These functions are called by the controller to signal certain events in the
    // system. They orchestrate the layouts reaction to the event.

    onDialogLoadedNotification() {
      this.clear();
      this._populate(this._controller.displayHtmlElements());
    }

    onItemBoundsModifiedNotification(bounds) {
      this._setBounds(bounds, false);
    }

    onLinkedToMasterModifiedNotification(isLinked) {
      this._updateLinkingToMasterLocale(this._controller.currentLocale, isLinked);
    }

    // Populates given HTML containers with SVG displays that show the
    // dialog resources.
    _populate(displayContainers) {
      this._containerHtmlElems = displayContainers;
      const displaySize = SvgLayout._calcDisplaySize(this._containerHtmlElems);

      for (let locale of cred.locale) {
        this._buildDisplay(locale, displaySize);
      }
    }

    // Clears the SVG content from the HTML containers.
    clear() {
      this._clearDisplays();
      for (let [, containerElem] of this._containerHtmlElems) {
        $(containerElem).empty();
      }
    }

    // Builds the display for a given locale
    _buildDisplay(locale, displaySize) {
      $(this._containerHtmlElems.get(locale)).empty();

      let resource = this._controller.dialogResource(locale);
      if (typeof resource === 'undefined') {
        this._svgDisplays.delete(locale);
      } else {
        this._svgDisplays.set(
          locale,
          SvgLayout._makeDisplay(
            displaySize,
            this._containerHtmlElems.get(locale),
            resource,
            this
          )
        );
      }
    }

    // Clears the content of all displays.
    _clearDisplays() {
      for (let locale of cred.locale) {
        if (this._containerHtmlElems.get(locale)) {
          $(this._containerHtmlElems.get(locale)).empty();
        }
        this._svgDisplays.delete(locale);
      }
    }

    // Creates a SVG display object.
    static _makeDisplay(displaySize, htmlContainer, dlgResource, controllerProxy) {
      const vboxBounds = SvgLayout._calcViewboxBounds(
        displaySize,
        cred.svglayout_internal.SvgDialog.resourceBounds(dlgResource)
      );
      let svgDisplay = new cred.svglayout_internal.SvgDisplay(
        displaySize,
        vboxBounds,
        htmlContainer,
        controllerProxy
      );
      svgDisplay.buildDialog(dlgResource).buildControls();
      return svgDisplay;
    }

    // Calculates the size of the SVG displays. Since all but the active
    // locale tab are hidden only one container will have a non-zero size.
    static _calcDisplaySize(containerElements) {
      for (let locale of cred.locale) {
        let elemSize = cred.svglayout_internal.htmlElementSize(
          containerElements.get(locale)
        );
        if (elemSize.w > 0 || elemSize.h > 0) {
          return elemSize;
        }
      }
      return new geom.Size(0, 0);
    }

    // Calculates the bounds of the SVG viewbox, so that the dialog appears at
    // a visually appealing position on the screen. The viewbox represents the
    // "window" through which the SVG content on the SVG "canvas" is viewed.
    static _calcViewboxBounds(displaySize, dlgBounds) {
      // The margin to the left and top of the dialog layout.
      const margin = new geom.Size(50, 50);
      // The empty space to the right and bottom of the dialog layout.
      const fillerSpace = displaySize.subtract(margin.add(dlgBounds.size()));
      // Using negative values as left and top coordinates causes the dialog
      // which is positioned at (0, 0) on the canvas to be offset from the
      // left and top of the viewbox by those amounts.
      return new geom.Rect(
        -margin.w,
        -margin.h,
        dlgBounds.width + fillerSpace.w,
        dlgBounds.height + fillerSpace.h
      );
    }

    // Sets the bounds of all items that are affected by a bounds modification.
    _setBounds(bounds, excludeSelectedItem) {
      let linkedItems = this._findLinkedItems(excludeSelectedItem);
      for (let item of linkedItems) {
        item.setBounds(bounds);
      }
    }

    // Returns an array of SVG items that are linked to the currently selected item.
    // The currently selected item is included in the returned array.
    _findLinkedItems(excludeSelectedItem) {
      let selectedItem = this.selectedItem(this._controller.currentLocale);
      let selectedItemId = selectedItem.id;

      let linkedItems = [];
      let displays = this._findLinkedDisplays();
      for (let display of displays) {
        if (typeof display !== 'undefined') {
          let matchingItem = display.findItemWithId(selectedItemId);
          if (
            typeof matchingItem !== 'undefined' &&
            !(excludeSelectedItem && matchingItem === selectedItem)
          ) {
            linkedItems.push(matchingItem);
          }
        }
      }

      return linkedItems;
    }

    // Returns an array of display objects that are linked to the current display.
    // The current display is included in the returned array.
    _findLinkedDisplays() {
      let linkedDisplays = [];
      const currentLocale = this._controller.currentLocale;

      if (this._controller.isLinkedToMaster(currentLocale)) {
        for (let locale of this._controller.linkedLocales()) {
          linkedDisplays.push(this._svgDisplays.get(locale));
        }
      } else {
        let currentDisplay = this._svgDisplays.get(currentLocale);
        linkedDisplays.push(currentDisplay);
      }

      return linkedDisplays;
    }

    // Updates the linking of the resource of a given locale to the master resource.
    _updateLinkingToMasterLocale(locale) {
      // Rebuild the display for the changed locale and for the master display
      // because it could have been affected, too.
      const displaySize = SvgLayout._calcDisplaySize(this._containerHtmlElems);
      this._buildDisplay(locale, displaySize);
      this._buildDisplay(cred.locale.any, displaySize);
    }
  }

  ///////////////////

  // Exports
  return {
    SvgLayout: SvgLayout
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.svglayout;
