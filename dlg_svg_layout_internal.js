//
// Internal functionality for SVG dialog layout module.
// Exposed as submodule to allow testing it.
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
cred.spec = tryRequire('./dlg_spec') || cred.spec || {};
var geom = tryRequire('./geom') || geom || {};
var svg = tryRequire('./svg') || svg || {};
var util = tryRequire('./util') || util || {};

///////////////////

// Internal functionality of SVG layout module.
cred.svglayout_internal = (function() {
  ///////////////////

  // Represents the root SVG element in the DOM. The SVG display is the parent or
  // container of all SVG content for a dialog locale.
  class SvgDisplay {
    constructor(size, viewBox, parentHtmlElem, controllerProxy) {
      this._htmlElem = SvgDisplay.createHtmlElement(size, viewBox, parentHtmlElem);
      this._selection = new Selection(this);
      // The SVG item for the dialog that is displayed.
      this._dialogItem = undefined;
      // Proxy to the controller. Can be called as if it were the controller but
      // without having to pass a source object for notifications.
      this._controllerProxy = controllerProxy;

      this._registerEvents();
    }

    get htmlElement() {
      return this._htmlElem;
    }

    get controller() {
      return this._controllerProxy;
    }

    // Builds the SVG DOM element for the dialog.
    buildDialog(dlgResource) {
      this._selection.clear();

      this._dialogItem = new SvgDialog(dlgResource, this);
      return this._dialogItem;
    }

    get selectedItem() {
      return this._selection.selectedItem;
    }

    // Selects a given SVG DOM element.
    selectItem(svgItem) {
      this._selection.add(svgItem);
      this.controller.notifyItemSelected(svgItem);
    }

    // Deselects a given SVG DOM element.
    deselectItem(svgItem) {
      this._selection.remove(svgItem);
    }

    // Clears the selection.
    clearSelection() {
      this._selection.clear();
      this.controller.notifySelectionCleared();
    }

    // Updates the selection to changes to the selected item.
    updateSelection() {
      this._selection.update();
    }

    // Return the SVG item that is part of the display and matches a given
    // id.
    // ASSUMPTION: A dialog id is never the same as the id of one of its control!
    findItemWithId(id) {
      if (this._dialogItem.id === id) {
        return this._dialogItem;
      }
      return this._dialogItem.findControlItemWithId(id);
    }

    // Creates the root SVG DOM element.
    static createHtmlElement(size, viewBox, parentHtmlElem) {
      return svg.create('svg', parentHtmlElem, {
        width: `${size.w}`,
        height: `${size.h}`,
        viewBox: `${viewBox.left} ${viewBox.top} ${viewBox.width} ${viewBox.height}`,
        // Align the view box at the left-top of the display area.
        preserveAspectRatio: 'xMinYMin meet'
      });
    }

    // Handles mouse down events in the display area.
    _onMouseDown(event) {
      event.preventDefault();
      // When click happened in the SVG display (outside any SVG item), clear
      // the selection.
      this.clearSelection();
    }

    // Registers for events that the display processes.
    _registerEvents() {
      let self = this;
      // Register for mouse down events inside the SVG display.
      $(this._htmlElem).on('mousedown', e => self._onMouseDown(e));
    }
  }

  ///////////////////

  // Base class for all SVG DOM elements that represent parts of a dialog.
  // Provides support for editing and selecting.
  class SvgItem {
    constructor(htmlElem, svgDisplay, editFlags = cred.editBehavior.all) {
      // The HTML element of the item.
      this._htmlElem = htmlElem;
      // The SVG display that contains the item.
      this._svgDisplay = svgDisplay;
      this._editFlags = editFlags;
      this._isSelected = false;
      this._isDragged = false;

      this._registerEvents();
    }

    get svgDisplay() {
      return this._svgDisplay;
    }

    get htmlElement() {
      return this._htmlElem;
    }

    get controller() {
      return this.svgDisplay.controller;
    }

    // Returns the left-top point of the HTML element for this item.
    get position() {
      return new geom.Point(
        util.toNumber($(this._htmlElem).attr('x')),
        util.toNumber($(this._htmlElem).attr('y'))
      );
    }

    // Sets the left-top point of the HTML element for this item.
    setPosition(pos, withNotification) {
      const w = util.toNumber($(this._htmlElem).attr('width'));
      const h = util.toNumber($(this._htmlElem).attr('height'));
      this.setBounds(new geom.Rect(pos.x, pos.y, w, h), withNotification);
    }

    // Returns the bounding rectangle of the HTML element for this item.
    get bounds() {
      return new geom.Rect(
        util.toNumber($(this._htmlElem).attr('x')),
        util.toNumber($(this._htmlElem).attr('y')),
        util.toNumber($(this._htmlElem).attr('width')),
        util.toNumber($(this._htmlElem).attr('height'))
      );
    }

    // Sets the bounding rectangle of the HTML element for this item.
    setBounds(bounds, withNotification) {
      $(this._htmlElem).attr('x', bounds.left);
      $(this._htmlElem).attr('y', bounds.top);
      $(this._htmlElem).attr('width', bounds.width);
      $(this._htmlElem).attr('height', bounds.height);

      if (this._isSelected) {
        this.svgDisplay.updateSelection();
      }
      if (withNotification) {
        this.controller.notifyItemBoundsModified(this.bounds);
      }
    }

    get isMoveable() {
      return (
        (this._editFlags & cred.editBehavior.moveable) === cred.editBehavior.moveable
      );
    }

    get isSelectable() {
      return (
        (this._editFlags & cred.editBehavior.selectable) === cred.editBehavior.selectable
      );
    }

    // Returns whether the item is resizable in a given direction.
    isResizable(direction) {
      return (this._editFlags & direction) === direction;
    }

    // Polymorphic property of SVG items to handle mouse moves for the item.
    // Implemented to move the item to the position of the mouse (represented
    // by a mouse event). The second parameter is the offset of the original
    // mouse down event from the left-top corner of the item.
    // Returns whether the item is dragged.
    drag(mouseEvent, mouseDownOffset) {
      if (this.isMoveable) {
        // Update the item's position.
        this.setPosition(
          toDialogCoord(
            svg.svgFromScreenPoint(
              mousePosition(mouseEvent).subtract(mouseDownOffset),
              this._htmlElem,
              this.svgDisplay.htmlElement
            )
          ),
          true
        );
        return true;
      }
      return false;
    }

    isSelected() {
      return this.isSelectable && this._isSelected;
    }

    // Polymorphic property of SVG items to select the item.
    select() {
      if (this.isSelectable) {
        this.svgDisplay.clearSelection();
        this._isSelected = true;
        this.svgDisplay.selectItem(this);
      }
    }

    // Polymorphic property of SVG items to deselect the item.
    deselect() {
      if (this.isSelectable) {
        this._isSelected = false;
        this.svgDisplay.deselectItem(this);
      }
    }

    // Handles mouse down events.
    _onMouseDown(event) {
      event.preventDefault();
      // Stop event bubbling because we don't want the SVG display to receive
      // the event (because it would clear the selection).
      event.stopPropagation();

      this._isDragged = false;
      this._startMouseTracking(event);
    }

    // Handles mouse move events.
    _onMouseMove(event, mouseDownOffset) {
      event.preventDefault();

      const mouseOffset = this._calcMouseOffset(event);
      if (this._isDragged || isDragMove(mouseOffset, mouseDownOffset)) {
        // Select the item when starting to drag.
        if (!this._isDragged && !this._isSelected) {
          this.select();
        }
        this._isDragged = this.drag(event, mouseDownOffset);
      }
    }

    // Handles mouse up events.
    _onMouseUp(event, mouseDownOffset) {
      event.preventDefault();

      if (this._isDragged) {
        this.drag(event, mouseDownOffset);
      } else if (!this._isSelected) {
        this.select();
      }

      this._isDragged = false;
      this._stopMouseTracking();
    }

    // Registers for events that the item processes.
    _registerEvents() {
      let self = this;
      $(this._htmlElem).on('mousedown', e => self._onMouseDown(e));
    }

    // Starts tracking mouse events associated with the item.
    _startMouseTracking(mouseEvent) {
      let self = this;
      const mouseDownOffset = this._calcMouseOffset(mouseEvent);

      $(this.svgDisplay.htmlElement).on('mousemove.tracking', e =>
        self._onMouseMove(e, mouseDownOffset)
      );
      $(this.svgDisplay.htmlElement).on('mouseup.tracking', e =>
        self._onMouseUp(e, mouseDownOffset)
      );
    }

    // Stops tracking mouse events associated with the item.
    _stopMouseTracking() {
      $(this.svgDisplay.htmlElement).off('mousemove.tracking');
      $(this.svgDisplay.htmlElement).off('mouseup.tracking');
    }

    // Calculates the offset of a given mouse position to the left-top corner
    // of the item. Keeping track if this offset makes sure that editing the
    // item is accurate.
    _calcMouseOffset(mouseEvent) {
      const itemScreenPos = svg.screenFromSvgPoint(
        this.position,
        this._htmlElem,
        this.svgDisplay.htmlElement
      );
      return toDialogCoord(mousePosition(mouseEvent).subtract(itemScreenPos));
    }
  }

  ///////////////////

  // Represents the SVG item for a dialog.
  class SvgDialog extends SvgItem {
    constructor(dlgResource, svgDisplay) {
      super(
        SvgDialog._createHtmlElement(
          SvgDialog.resourceBounds(dlgResource),
          svgDisplay.htmlElement
        ),
        svgDisplay,
        cred.editBehavior.resizableRight |
          cred.editBehavior.resizableDown |
          cred.editBehavior.selectable
      );
      // Resource information for the file that contains the dialog's definition.
      this._dlgResource = dlgResource;
      // Specification for the dialog.
      this._dlgSpec = cred.spec.makeDialogSpec();
      // Map that associates controls ids with their control SVG items.
      this._controlItems = new Map();
    }

    // Polymorphic function to return the resource definition for the dialog.
    resource() {
      return this._dlgResource.dialog;
    }

    // Polymorphic function to return the specification for the dialog.
    itemSpec() {
      return this._dlgSpec;
    }

    // Polymorphic function to return the resource id of the item.
    get id() {
      return this.resource().id;
    }

    // Polymorphic function to return whether the item represents a dialog.
    isDialog() {
      return this.resource().isDialog();
    }

    // Builds the SVG items for the controls of the dialog.
    buildControls() {
      for (let ctrl of this._dlgResource.controls()) {
        this._controlItems.set(ctrl.id, new SvgControl(ctrl, this.svgDisplay));
      }
    }

    // Returns the bounds of the dialog as they are defined in the resource.
    static resourceBounds(dlgResource) {
      return new geom.Rect(
        0,
        0,
        dlgResource.dialogPropertyValue('Width'),
        dlgResource.dialogPropertyValue('Height')
      );
    }

    // Return the control item that is part of the display and matches a given
    // id.
    findControlItemWithId(id) {
      for (let [ctrlId, item] of this._controlItems) {
        if (ctrlId === id) {
          return item;
        }
      }
      return undefined;
    }

    // Creates the SVG DOM element for a dialog item.
    static _createHtmlElement(bounds, parentHtmlElem) {
      return svg.create('rect', parentHtmlElem, {
        x: `${bounds.left}`,
        y: `${bounds.top}`,
        width: `${bounds.width}`,
        height: `${bounds.height}`,
        class: 'dialog',
        'vector-effect': 'non-scaling-stroke'
      });
    }
  }

  ///////////////////

  // Represents the SVG item for a control.
  class SvgControl extends SvgItem {
    constructor(ctrlDefinition, svgDisplay) {
      super(
        SvgControl._createHtmlElement(
          SvgControl.resourceBounds(ctrlDefinition),
          svgDisplay.htmlElement
        ),
        svgDisplay,
        cred.editBehavior.all
      );
      // Resource information for the control.
      this._ctrlDefinition = ctrlDefinition;
      // Specification for this type of control.
      this._ctrlSpec = new cred.spec.makeControlSpec(ctrlDefinition.type);
    }

    // Polymorphic function to return the resource definition for the control.
    resource() {
      return this._ctrlDefinition;
    }

    // Polymorphic function to return the specification for the control's type.
    itemSpec() {
      return this._ctrlSpec;
    }

    // Polymorphic function to return the resource id of the item.
    get id() {
      return this.resource().id;
    }

    // Polymorphic function to return whether the item represents a dialog.
    isDialog() {
      return this.resource().isDialog();
    }

    // Returns the bounds of the control as they are defined in the resource.
    static resourceBounds(ctrlDefinition) {
      const propertyLabel = cred.spec.propertyLabel;
      return new geom.Rect(
        ctrlDefinition.property(propertyLabel.left).value,
        ctrlDefinition.property(propertyLabel.top).value,
        ctrlDefinition.property(propertyLabel.width).value,
        ctrlDefinition.property(propertyLabel.height).value
      );
    }

    // Creates the SVG DOM element for a control item.
    static _createHtmlElement(bounds, parentHtmlElem) {
      return svg.create('rect', parentHtmlElem, {
        x: `${bounds.left}`,
        y: `${bounds.top}`,
        width: `${bounds.width}`,
        height: `${bounds.height}`,
        class: 'control',
        'vector-effect': 'non-scaling-stroke'
      });
    }
  }

  ///////////////////

  // Represents the selected parts of a dialog.
  class Selection {
    constructor(svgDisplay) {
      this._svgDisplay = svgDisplay;
      this._selectedSvgItem = undefined;
      this._markers = [];
    }

    get selectedItem() {
      return this._selectedSvgItem;
    }

    // Add item to the selection.
    add(svgItem) {
      this._selectedSvgItem = svgItem;
      this._addMarkers(this._selectedSvgItem);
    }

    // Remove item from the selection.
    remove(svgItem) {
      if (this._selectedSvgItem === svgItem) {
        this._selectedSvgItem = undefined;
        this._removeMarkers();
      }
    }

    // Clear the selection.
    clear() {
      if (this._selectedSvgItem) {
        this._selectedSvgItem.deselect();
      }
    }

    // Updates the selection to changes to the selected items.
    update() {
      if (this._selectedSvgItem) {
        this._updateMarkers();
      }
    }

    // Adds selection markers for a selected item.
    _addMarkers(svgItem) {
      this._markers.length = 0;
      this._markers.push(new LeftTopSelectionMarker(svgItem, this._svgDisplay));
      this._markers.push(new TopSelectionMarker(svgItem, this._svgDisplay));
      this._markers.push(new RightTopSelectionMarker(svgItem, this._svgDisplay));
      this._markers.push(new RightSelectionMarker(svgItem, this._svgDisplay));
      this._markers.push(new RightBottomSelectionMarker(svgItem, this._svgDisplay));
      this._markers.push(new BottomSelectionMarker(svgItem, this._svgDisplay));
      this._markers.push(new LeftBottomSelectionMarker(svgItem, this._svgDisplay));
      this._markers.push(new LeftSelectionMarker(svgItem, this._svgDisplay));
    }

    // Updates the selection markers to changes to the selected items.
    _updateMarkers() {
      for (let i = 0; i < this._markers.length; ++i) {
        this._markers[i].update();
      }
    }

    // Removes the selection markers.
    _removeMarkers() {
      // Limit removal to the current SVG display.
      $(this._svgDisplay.htmlElement)
        .find('.selection')
        .remove();
      this._markers.length = 0;
    }
  }

  ///////////////////

  // Base class for selection markers.
  // Provides support for editing the selected item when the marker is manipulated.
  class SelectionMarker extends SvgItem {
    // The passed id is used as HTML class name for identification with CSS.
    constructor(id, pos, isEnabled, selectedSvgItem, svgDisplay) {
      super(
        SelectionMarker._createHtmlElement(id, pos, isEnabled, svgDisplay.htmlElement),
        svgDisplay,
        isEnabled ? cred.editBehavior.moveable : cred.editBehavior.none
      );
      // The SVG item that the marker is attached to.
      this._selectedSvgItem = selectedSvgItem;
    }

    // Offset of the markers left-top corner from the position on the item that
    // it marks.
    static get markerOffset() {
      return 3;
    }

    // Size of the marker.
    static get markerSize() {
      return 2 * SelectionMarker.markerOffset;
    }

    // Returns the item that the marker is attached to.
    get selectedItem() {
      return this._selectedSvgItem;
    }

    // Polymorphic property of SVG items to handle mouse moves for the item.
    // Implemented to edit the attached dialog item when the marker is moved.
    // Returns whether the item is dragged.
    drag(mouseEvent, mouseDownOffset) {
      if (this.isMoveable) {
        // New position of the marker's left-top corner.
        let draggedPos = toDialogCoord(
          svg.svgFromScreenPoint(
            mousePosition(mouseEvent).subtract(mouseDownOffset),
            this._htmlElem,
            this.svgDisplay.htmlElement
          )
        );
        // The offset to the markers current position.
        const offset = draggedPos.subtract(this.position);
        // Adjust the selected item according to the offset and the concrete
        // marker.
        this.selectedItem.setBounds(
          this.adjustBounds(this.selectedItem.bounds, offset),
          true
        );
        return true;
      }
      return false;
    }

    // Polymorphic property of SVG items to select the marker item.
    select() {
      // Do nothing for select call from SvgItem because marker items cannot be
      // selected.
      // This overrides the SvgItem default handling.
    }

    // Polymorphic property of SVG items to deselect the marker item.
    deselect() {
      // Do nothing for deselect call from SvgItem because marker items cannot be
      // selected.
      // This overrides the SvgItem default handling.
    }

    // Update the marker's position to changes in the item's position or size.
    update() {
      this.setPosition(
        this.positionOnItem().subtract(SelectionMarker.markerOffset),
        false
      );
    }

    // Creates the SVG DOM element for a selection marker.
    static _createHtmlElement(id, pos, isEnabled, parentHtmlElem) {
      const enabledTag = isEnabled ? 'enabled' : 'disabled';
      return svg.create('rect', parentHtmlElem, {
        x: `${pos.x - SelectionMarker.markerOffset}`,
        y: `${pos.y - SelectionMarker.markerOffset}`,
        width: `${SelectionMarker.markerSize}`,
        height: `${SelectionMarker.markerSize}`,
        class: `selection ${enabledTag} ${id}`
      });
    }
  }

  // The left-top selection marker of a dialog part.
  class LeftTopSelectionMarker extends SelectionMarker {
    constructor(selectedSvgItem, svgDisplay) {
      super(
        'nw-marker',
        LeftTopSelectionMarker._positionOnItem(selectedSvgItem),
        selectedSvgItem.isResizable(
          cred.editBehavior.resizableLeft | cred.editBehavior.resizableUp
        ),
        selectedSvgItem,
        svgDisplay
      );
    }

    // Polymorphic property of selection markers to return the position of the
    // marker on the item that it is attached to.
    positionOnItem() {
      return LeftTopSelectionMarker._positionOnItem(this.selectedItem);
    }

    // Returns the position of the marker on a given item.
    static _positionOnItem(item) {
      return item.bounds.leftTop();
    }

    // Polymorphic property of selection markers to adjust given bounds to the
    // marker being moved by a given offset.
    adjustBounds(bounds, offset) {
      return new geom.Rect(
        bounds.left + offset.x,
        bounds.top + offset.y,
        bounds.width - offset.x,
        bounds.height - offset.y
      );
    }
  }

  // The center-top selection marker of a dialog part.
  class TopSelectionMarker extends SelectionMarker {
    constructor(selectedSvgItem, svgDisplay) {
      super(
        'n-marker',
        TopSelectionMarker._positionOnItem(selectedSvgItem),
        selectedSvgItem.isResizable(cred.editBehavior.resizableUp),
        selectedSvgItem,
        svgDisplay
      );
    }

    // Polymorphic property of selection markers to return the position of the
    // marker on the item that it is attached to.
    positionOnItem() {
      return TopSelectionMarker._positionOnItem(this.selectedItem);
    }

    // Returns the position of the marker on a given item.
    static _positionOnItem(item) {
      return item.bounds.centerTop();
    }

    // Polymorphic property of selection markers to adjust given bounds to the
    // marker being moved by a given offset.
    adjustBounds(bounds, offset) {
      return new geom.Rect(
        bounds.left,
        bounds.top + offset.y,
        bounds.width,
        bounds.height - offset.y
      );
    }
  }

  // The right-top selection marker of a dialog part.
  class RightTopSelectionMarker extends SelectionMarker {
    constructor(selectedSvgItem, svgDisplay) {
      super(
        'ne-marker',
        RightTopSelectionMarker._positionOnItem(selectedSvgItem),
        selectedSvgItem.isResizable(
          cred.editBehavior.resizableRight | cred.editBehavior.resizableUp
        ),
        selectedSvgItem,
        svgDisplay
      );
    }

    // Polymorphic property of selection markers to return the position of the
    // marker on the item that it is attached to.
    positionOnItem() {
      return RightTopSelectionMarker._positionOnItem(this.selectedItem);
    }

    // Returns the position of the marker on a given item.
    static _positionOnItem(item) {
      return item.bounds.rightTop();
    }

    // Polymorphic property of selection markers to adjust given bounds to the
    // marker being moved by a given offset.
    adjustBounds(bounds, offset) {
      return new geom.Rect(
        bounds.left,
        bounds.top + offset.y,
        bounds.width + offset.x,
        bounds.height - offset.y
      );
    }
  }

  // The right-center selection marker of a dialog part.
  class RightSelectionMarker extends SelectionMarker {
    constructor(selectedSvgItem, svgDisplay) {
      super(
        'e-marker',
        RightSelectionMarker._positionOnItem(selectedSvgItem),
        selectedSvgItem.isResizable(cred.editBehavior.resizableRight),
        selectedSvgItem,
        svgDisplay
      );
    }

    // Polymorphic property of selection markers to return the position of the
    // marker on the item that it is attached to.
    positionOnItem() {
      return RightSelectionMarker._positionOnItem(this.selectedItem);
    }

    // Returns the position of the marker on a given item.
    static _positionOnItem(item) {
      return item.bounds.rightCenter();
    }

    // Polymorphic property of selection markers to adjust given bounds to the
    // marker being moved by a given offset.
    adjustBounds(bounds, offset) {
      return new geom.Rect(
        bounds.left,
        bounds.top,
        bounds.width + offset.x,
        bounds.height
      );
    }
  }

  // The right-bottom selection marker of a dialog part.
  class RightBottomSelectionMarker extends SelectionMarker {
    constructor(selectedSvgItem, svgDisplay) {
      super(
        'se-marker',
        RightBottomSelectionMarker._positionOnItem(selectedSvgItem),
        selectedSvgItem.isResizable(
          cred.editBehavior.resizableRight | cred.editBehavior.resizableDown
        ),
        selectedSvgItem,
        svgDisplay
      );
    }

    // Polymorphic property of selection markers to return the position of the
    // marker on the item that it is attached to.
    positionOnItem() {
      return RightBottomSelectionMarker._positionOnItem(this.selectedItem);
    }

    // Returns the position of the marker on a given item.
    static _positionOnItem(item) {
      return item.bounds.rightBottom();
    }

    // Polymorphic property of selection markers to adjust given bounds to the
    // marker being moved by a given offset.
    adjustBounds(bounds, offset) {
      return new geom.Rect(
        bounds.left,
        bounds.top,
        bounds.width + offset.x,
        bounds.height + offset.y
      );
    }
  }

  // The center-bottom selection marker of a dialog part.
  class BottomSelectionMarker extends SelectionMarker {
    constructor(selectedSvgItem, svgDisplay) {
      super(
        's-marker',
        BottomSelectionMarker._positionOnItem(selectedSvgItem),
        selectedSvgItem.isResizable(cred.editBehavior.resizableDown),
        selectedSvgItem,
        svgDisplay
      );
    }

    // Polymorphic property of selection markers to return the position of the
    // marker on the item that it is attached to.
    positionOnItem() {
      return BottomSelectionMarker._positionOnItem(this.selectedItem);
    }

    // Returns the position of the marker on a given item.
    static _positionOnItem(item) {
      return item.bounds.centerBottom();
    }

    // Polymorphic property of selection markers to adjust given bounds to the
    // marker being moved by a given offset.
    adjustBounds(bounds, offset) {
      return new geom.Rect(
        bounds.left,
        bounds.top,
        bounds.width,
        bounds.height + offset.y
      );
    }
  }

  // The left-bottom selection marker of a dialog part.
  class LeftBottomSelectionMarker extends SelectionMarker {
    constructor(selectedSvgItem, svgDisplay) {
      super(
        'sw-marker',
        LeftBottomSelectionMarker._positionOnItem(selectedSvgItem),
        selectedSvgItem.isResizable(
          cred.editBehavior.resizableLeft | cred.editBehavior.resizableDown
        ),
        selectedSvgItem,
        svgDisplay
      );
    }

    // Polymorphic property of selection markers to return the position of the
    // marker on the item that it is attached to.
    positionOnItem() {
      return LeftBottomSelectionMarker._positionOnItem(this.selectedItem);
    }

    // Returns the position of the marker on a given item.
    static _positionOnItem(item) {
      return item.bounds.leftBottom();
    }

    // Polymorphic property of selection markers to adjust given bounds to the
    // marker being moved by a given offset.
    adjustBounds(bounds, offset) {
      return new geom.Rect(
        bounds.left + offset.x,
        bounds.top,
        bounds.width - offset.x,
        bounds.height + offset.y
      );
    }
  }

  // The left-center selection marker of a dialog part.
  class LeftSelectionMarker extends SelectionMarker {
    constructor(selectedSvgItem, svgDisplay) {
      super(
        'w-marker',
        LeftSelectionMarker._positionOnItem(selectedSvgItem),
        selectedSvgItem.isResizable(cred.editBehavior.resizableLeft),
        selectedSvgItem,
        svgDisplay
      );
    }

    // Polymorphic property of selection markers to return the position of the
    // marker on the item that it is attached to.
    positionOnItem() {
      return LeftSelectionMarker._positionOnItem(this.selectedItem);
    }

    // Returns the position of the marker on a given item.
    static _positionOnItem(item) {
      return item.bounds.leftCenter();
    }

    // Polymorphic property of selection markers to adjust given bounds to the
    // marker being moved by a given offset.
    adjustBounds(bounds, offset) {
      return new geom.Rect(
        bounds.left + offset.x,
        bounds.top,
        bounds.width - offset.x,
        bounds.height
      );
    }
  }

  ///////////////////

  // Returns the position of the mouse pointer as geom.Point given a mouse event.
  function mousePosition(mouseEvent) {
    if (
      typeof mouseEvent.clientX === 'undefined' ||
      typeof mouseEvent.clientY === 'undefined'
    ) {
      throw new Error(
        'Unsupported mouse event. "clientX" and "clientY" properties expected.'
      );
    }
    return new geom.Point(mouseEvent.clientX, mouseEvent.clientY);
  }

  // Checks whether a given current mouse position is far enough from a given
  // original mouse position to qualify as a drag operation.
  function isDragMove(currentPos, originalPos, dragTolerance = 3) {
    return (
      Math.abs(currentPos.x - originalPos.x) >= dragTolerance ||
      Math.abs(currentPos.y - originalPos.y) >= dragTolerance
    );
  }

  // Returns the dimensions of a given HTML element as geom.Size object.
  function htmlElementSize(htmlElem) {
    if (!htmlElem) {
      return new geom.Size(0, 0);
    }
    let $elem = $(htmlElem);
    return new geom.Size($elem.width(), $elem.height());
  }

  // Converts a given coordinate value/object to a dialog coordinate.
  function toDialogCoord(coord) {
    const type = typeof coord;
    switch (type) {
      case 'object': {
        // Check if the object has a 'round' function, e.g. geom.Point.
        if (typeof coord.round !== 'undefined') {
          return coord.round();
        }
        return coord;
      }
      case 'number': {
        return Math.round(coord);
      }
      case 'string': {
        const num = util.toNumber(coord);
        if (isNaN(num)) {
          throw new Error('Cannot convert non-number string to dialog coordinate.');
        }
        return Math.round(num);
      }
      default: {
        throw new Error('Unexpected type to convert to dialog coordinate.');
      }
    }
  }

  ///////////////////

  // Exports
  // Export everything to allow access for test cases.
  return {
    BottomSelectionMarker: BottomSelectionMarker,
    htmlElementSize: htmlElementSize,
    isDragMove: isDragMove,
    LeftBottomSelectionMarker: LeftBottomSelectionMarker,
    LeftSelectionMarker: LeftSelectionMarker,
    LeftTopSelectionMarker: LeftTopSelectionMarker,
    mousePosition: mousePosition,
    RightBottomSelectionMarker: RightBottomSelectionMarker,
    RightSelectionMarker: RightSelectionMarker,
    RightTopSelectionMarker: RightTopSelectionMarker,
    Selection: Selection,
    SelectionMarker: SelectionMarker,
    SvgControl: SvgControl,
    SvgDialog: SvgDialog,
    SvgDisplay: SvgDisplay,
    SvgItem: SvgItem,
    toDialogCoord: toDialogCoord,
    TopSelectionMarker: TopSelectionMarker
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.svglayout_internal;