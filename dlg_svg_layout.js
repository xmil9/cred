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
var $ = tryRequire('jquery') || $ || {};
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
    constructor(displayMargin = new geom.Size(50, 50)) {
      this._controller = undefined;
      // Map that associates locales with HTML elements that serve as
      // containers for the SVG displays for the locales.
      this._containerHtmlElems = new Map();
      // Map that associates locales with their SVG displays.
      this._svgDisplays = new Map();
      // Margin to the left and top of the dialog display.
      this._displayMargin = displayMargin;
    }

    // Performs initial setup operations.
    setup() {}

    set controller(value) {
      this._controller = value;
    }

    // Populates given HTML containers with SVG displays that show the
    // dialog resources.
    populate(displayContainers) {
      this._containerHtmlElems = displayContainers;
      const displaySize = SvgLayout._calcDisplaySize(this._containerHtmlElems);

      for (let locale of cred.locale) {
        this._buildDisplay(locale, displaySize);
      }
    }

    // Clears the SVG content from the HTML containers.
    clear() {
      // Wipe out the DOM content.
      for (let [, containerElem] of this._containerHtmlElems) {
        $(containerElem).empty();
      }
      // Clear the data structures.
      this._containerHtmlElems.clear();
      this._svgDisplays.clear();
    }

    // Returns the item that is selected in the display for a given locale.
    selectedItem(locale) {
      if (this._svgDisplays.has(locale)) {
        return this._svgDisplays.get(locale).selectedItem;
      }
      return undefined;
    }

    // --- Notifications ---
    // These notification funtions are called by objects within the layout module
    // and forwared the calls to the controller. The layout object basically serves
    // as proxy for the controller to all objects within the layout module. It calls
    // the actual controller with the correct 'source' parameter.

    // Called from within the layout module to forward a notification to the controller
    // that a given item was selected.
    notifyItemSelected(item) {
      this._controller.notifyItemSelected(this, item);
    }

    // Called from within the layout module to forward a notification to the controller
    // that the selection of the current locale was cleared.
    notifySelectionCleared() {
      this._controller.notifySelectionCleared(this);
    }

    // Called from within the layout module to forward a notification to the controller
    // that the bounds of the currently selected item have changed.
    notifyItemBoundsModified(bounds) {
      this._controller.notifyItemBoundsModified(this, bounds);
      // Apply bounds change to all linked SVG displays.
      this._setBounds(bounds, true);
    }

    // Called from within the layout module to forward a notification to the controller
    // that a control with given resource id, type and bounds should be added.
    notifyAddControl(resourceId, ctrlType, bounds) {
      this._controller.notifyAddControl(this, resourceId, ctrlType, bounds);
    }

    // Called from within the layout module to forward a notification to the controller
    // that a control was added.
    notifyControlAdded(ctrlItem) {
      this._controller.notifyControlAdded(this, ctrlItem);
      // Add a control item to all linked SVG displays.
      this._addControlToLinkedDisplays(ctrlItem);
    }

    // --- Notification handlers ---
    // These functions are called by the controller to signal certain events in the
    // system. They orchestrate the layouts reaction to the event.

    // Notifies the layout that a new dialog was loaded.
    onDialogLoadedNotification() {
      this.clear();
      this.populate(this._controller.displayHtmlElements());
    }

    // Notifies the layout that the bounds of the currently selected item have
    // changed.
    onItemBoundsModifiedNotification(bounds) {
      this._setBounds(bounds, false);
    }

    // Notifies the layout that the link status of the currently active locale has
    // changed.
    onLinkedToMasterModifiedNotification(isLinked) {
      this._updateLinkingToMasterLocale(this._controller.currentLocale, isLinked);
    }

    // Notifies the layout that the user wants to create a control with the given type.
    onAddControlChosenNotification(ctrlType) {
      this._addControlInteractively(ctrlType);
    }

    // --- Internal functions ---

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
            this._displayMargin,
            this._containerHtmlElems.get(locale),
            resource,
            this
          )
        );
      }
    }

    // Creates a SVG display object.
    static _makeDisplay(
      displaySize,
      displayMargin,
      htmlContainer,
      dlgResource,
      controllerProxy
    ) {
      const vboxBounds = SvgLayout._calcViewboxBounds(
        displaySize,
        displayMargin,
        cred.svglayout_internal.SvgDialog.resourceBounds(dlgResource)
      );
      const svgDisplay = new cred.svglayout_internal.SvgDisplay(
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
      for (const locale of cred.locale) {
        const elemSize = cred.svglayout_internal.htmlElementSize(
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
    static _calcViewboxBounds(displaySize, displayMargin, dlgBounds) {
      // The empty space to the right and bottom of the dialog layout.
      const fillerSpace = displaySize.subtract(displayMargin.add(dlgBounds.size()));
      // Using negative values as left and top coordinates causes the dialog
      // which is positioned at (0, 0) on the canvas to be offset from the
      // left and top of the viewbox by those amounts.
      return new geom.Rect(
        -displayMargin.w,
        -displayMargin.h,
        dlgBounds.width + fillerSpace.w,
        dlgBounds.height + fillerSpace.h
      );
    }

    // Sets the bounds of all items that are affected by a bounds modification.
    _setBounds(bounds, excludeSelectedItem) {
      const linkedItems = this._findLinkedItems(excludeSelectedItem);
      for (const item of linkedItems) {
        item.setBounds(bounds);
      }
    }

    // Returns an array of SVG items that are linked to the currently selected item.
    // The currently selected item is in-/excluded in the returned array depending on
    // a passed flag.
    _findLinkedItems(excludeSelectedItem) {
      const selectedItem = this.selectedItem(this._controller.currentLocale);
      const selectedItemId = selectedItem.uniqueId;

      const linkedItems = [];
      const displays = this._findLinkedDisplays(false);
      for (const display of displays) {
        if (typeof display !== 'undefined') {
          const matchingItem = display.findItemWithId(selectedItemId);
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
    // The current display is in-/excluded in the returned array depending on a passed
    // flag.
    _findLinkedDisplays(excludeCurrentDisplay) {
      const linkedDisplays = [];
      const currentLocale = this._controller.currentLocale;

      if (this._controller.isLinkedToMaster(currentLocale)) {
        for (const locale of this._controller.linkedLocales()) {
          if (!(excludeCurrentDisplay && locale === currentLocale)) {
            linkedDisplays.push(this._svgDisplays.get(locale));
          }
        }
      } else {
        if (!excludeCurrentDisplay) {
          const currentDisplay = this._svgDisplays.get(currentLocale);
          linkedDisplays.push(currentDisplay);
        }
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

    // Starts the process of adding a control to the dialog.
    _addControlInteractively(ctrlType) {
      const display = this._svgDisplays.get(this._controller.currentLocale);
      if (display) {
        display.addControlInteractively(ctrlType);
      }
    }

    // Adds a given control item to all displays that are linked to the current display.
    _addControlToLinkedDisplays(ctrlItem) {
      const displays = this._findLinkedDisplays(true);
      for (const display of displays) {
        display.addControlFromResource(ctrlItem.resource());
      }
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
