//
// Tests for the SVG layout view.
//
'use strict';

const $ = require('jquery');
var cred = require('../cred_types');
cred.spec = require('../dlg_spec');
cred.svglayout_internal = require('../dlg_svg_layout_internal');
const geom = require('../geom');
// Need to import SVG module to be able to globally mock it. However, the module is
// not directly used in this file, so ESLint flags it as unused var. The following
// line turns this warning off.
// eslint-disable-next-line no-unused-vars
const svg = require('../svg');

// Mock impl for the SVG module.
// This will replace the SVG module globally in all loaded modules of this file!
jest.mock('../svg', () => ({
  // Jest mock module are not allowed to have dependencies on any code outside
  // themselves. Therefore, we have to inject the dependencies explicitly.
  injectDocument(document) {
    this.document = document;
  },

  // Reimplementation of svg.create() because the original cannot be called.
  // Not ideal!
  create: function(tag, parent, attribs) {
    if (!this.document) {
      throw new Error('Document not injected.');
    }
    const svgNamespace = 'http://www.w3.org/2000/svg';
    const elem = this.document.createElementNS(svgNamespace, tag);
    for (const key in attribs) {
      elem.setAttributeNS(null, key, attribs[key]);
    }
    parent.appendChild(elem);
    return elem;
  },

  svgFromScreenPoint: function(pt) {
    return pt;
  },

  screenFromSvgPoint: function(pt) {
    return pt;
  }
}));

///////////////////

// HTML body with a SVG root element.
const htmlBodyWithSvgRoot =
  'div' +
  '  <svg id="svgRoot" width="100" height="100" viewBox="0 0 100 100">' +
  '  </svg>' +
  '</div>';

// HTML body with a SVG root and a sub element.
const htmlBodyWithSvgItem =
  'div' +
  '  <svg id="svgRoot" width="100" height="100" viewBox="0 0 100 100">' +
  '    <rect id="svgElem" x="1" y="2" width="10" height="20"></rect>' +
  '  </svg>' +
  '</div>';

function setupHtmlDocument(htmlTemplate) {
  document.body.innerHTML = htmlTemplate;
  svg.injectDocument(document);
}

// Helper class to mock the controller.
class ControllerMock {
  constructor() {
    this.notifyItemBoundsModifiedCalled = false;
  }

  notifyItemBoundsModified() {
    this.notifyItemBoundsModifiedCalled = true;
  }
}

// Helper class to mock SvgDisplay objects.
class SvgDisplayMock {
  constructor(htmlElem) {
    this.htmlElement = htmlElem;
    this.controller = new ControllerMock();
    this.updateSelectionCalled = false;
    this.clearSelectionCalled = false;
    this.selectItemCalled = false;
    this.deselectItemCalled = false;
  }

  injectSelection(selection) {
    this._selection = selection;
  }

  updateSelection() {
    this.updateSelectionCalled = true;
  }

  clearSelection() {
    this.clearSelectionCalled = true;
  }

  selectItem() {
    this.selectItemCalled = true;
  }

  deselectItem(svgItem) {
    this.deselectItemCalled = true;
    if (this._selection) {
      this._selection.remove(svgItem);
    }
  }
}

// Helper class to mock DialogResource objects.
class DialogResourceMock {
  constructor(dlg, ctrls) {
    this._dlg = dlg;
    this._ctrls = ctrls;
  }

  get dialog() {
    return this._dlg;
  }

  dialogPropertyValue(key) {
    return this._dlg.property(key);
  }

  *controls() {
    yield* this._ctrls;
  }
}

// Helper class to mock Dialog objects.
class DialogMock {
  constructor(id, props) {
    this.id = id;
    this._props = props;
  }

  isDialog() {
    return true;
  }

  property(key) {
    return this._props.get(key);
  }
}

// Helper class to mock Control objects.
class ControlMock {
  constructor(id, type, props) {
    this.id = id;
    this.type = type;
    this._props = props;
  }

  isDialog() {
    return false;
  }

  property(key) {
    // Return a Property object stub.
    return { value: this._props.get(key) };
  }
}

// Creates a jQuery mouse event at a given client position.
function makeMouseEvent(type, at) {
  const event = new $.Event(type);
  event.clientX = at.x;
  event.clientY = at.y;
  return event;
}

// Simulates a mouse drag by triggering mouse-down, -move, and -up events.
function simulateMouseDrag($elem, from, distance) {
  $elem.trigger(makeMouseEvent('mousedown', from));

  for (let offset = 1; offset <= distance; ++offset) {
    $elem.trigger(
      makeMouseEvent('mousemove', {
        x: from.x + offset,
        y: from.y + offset
      })
    );
  }

  $elem.trigger(
    makeMouseEvent('mouseup', {
      x: from.x + distance,
      y: from.y + distance
    })
  );
}

///////////////////

test('mousePosition for valid event', () => {
  const mouseEvent = {
    clientX: 10,
    clientY: 20
  };
  expect(cred.svglayout_internal.mousePosition(mouseEvent)).toEqual(
    new geom.Point(10, 20)
  );
});

test('mousePosition for invalid event', () => {
  const mouseEvent = {
    unsupportedPropertyX: 10,
    unsupportedPropertyY: 20
  };
  expect(() => cred.svglayout_internal.mousePosition(mouseEvent)).toThrow();
});

///////////////////

test('isDragMove for horizontal drag with default tolerance', () => {
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 90, y: 20 })
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 110, y: 20 })
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: -100, y: 20 }, { x: -90, y: 20 })
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: -100, y: 20 }, { x: -110, y: 20 })
  ).toBeTruthy();
});

test('isDragMove for vertical drag with default tolerance', () => {
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 100, y: 25 })
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 100, y: 15 })
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: -20 }, { x: 100, y: -25 })
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: -20 }, { x: 100, y: -15 })
  ).toBeTruthy();
});

test('isDragMove for non-drag with default tolerance', () => {
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 102, y: 21 })
  ).toBeFalsy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 98, y: 19 })
  ).toBeFalsy();
  expect(
    cred.svglayout_internal.isDragMove({ x: -100, y: -20 }, { x: -102, y: -21 })
  ).toBeFalsy();
  expect(
    cred.svglayout_internal.isDragMove({ x: -100, y: -20 }, { x: -98, y: -19 })
  ).toBeFalsy();
});

test('isDragMove for horizontal drag with custom tolerance', () => {
  const customTol = 8;
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 90, y: 20 }, customTol)
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 110, y: 20 }, customTol)
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: -100, y: 20 }, { x: -90, y: 20 }, customTol)
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: -100, y: 20 }, { x: -110, y: 20 }, customTol)
  ).toBeTruthy();
});

test('isDragMove for vertical drag with custom tolerance', () => {
  const customTol = 8;
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 100, y: 29 }, customTol)
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 100, y: 11 }, customTol)
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: -20 }, { x: 100, y: -29 }, customTol)
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: -20 }, { x: 100, y: -11 }, customTol)
  ).toBeTruthy();
});

test('isDragMove for non-drag with custom tolerance', () => {
  const customTol = 8;
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 102, y: 21 }, customTol)
  ).toBeFalsy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 98, y: 19 }, customTol)
  ).toBeFalsy();
  expect(
    cred.svglayout_internal.isDragMove(
      { x: -100, y: -20 },
      { x: -102, y: -21 },
      customTol
    )
  ).toBeFalsy();
  expect(
    cred.svglayout_internal.isDragMove({ x: -100, y: -20 }, { x: -98, y: -19 }, customTol)
  ).toBeFalsy();
});

test('isDragMove with exact tolerance', () => {
  const customTol = 8;
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 108, y: 28 }, customTol)
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: 100, y: 20 }, { x: 92, y: 12 }, customTol)
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove(
      { x: -100, y: -20 },
      { x: -108, y: -28 },
      customTol
    )
  ).toBeTruthy();
  expect(
    cred.svglayout_internal.isDragMove({ x: -100, y: -20 }, { x: -92, y: -12 }, customTol)
  ).toBeTruthy();
});

///////////////////

test('htmlElementSize for undefined element', () => {
  expect(cred.svglayout_internal.htmlElementSize()).toEqual(new geom.Size(0, 0));
});

test('htmlElementSize for button element', () => {
  setupHtmlDocument(
    '<div>' +
      '  <button id="myid" style="width:200px;height:22px">Click</button>' +
      '</div>'
  );
  const $elem = $('#myid');
  const expectedSize = new geom.Size($elem.width(), $elem.height());
  const elem = document.getElementById('myid');
  expect(cred.svglayout_internal.htmlElementSize(elem)).toEqual(expectedSize);
});

test('htmlElementSize for hidden element', () => {
  setupHtmlDocument(
    '<div>' +
      '  <button id="myid" style="width:200px;height:22px">Click</button>' +
      '</div>'
  );
  const $elem = $('#myid');
  $elem.hide();
  const expectedSize = new geom.Size($elem.width(), $elem.height());
  const elem = document.getElementById('myid');
  expect(cred.svglayout_internal.htmlElementSize(elem)).toEqual(expectedSize);
});

///////////////////

test('toDialogCoord for object with round function', () => {
  expect(cred.svglayout_internal.toDialogCoord(new geom.Point(3.4, 5.6))).toEqual(
    new geom.Point(3, 6)
  );
});

test('toDialogCoord for object without round function', () => {
  const obj = { x: 1, y: 2 };
  expect(cred.svglayout_internal.toDialogCoord(obj)).toEqual(obj);
});

test('toDialogCoord for integer number', () => {
  expect(cred.svglayout_internal.toDialogCoord(25)).toEqual(25);
});

test('toDialogCoord for floating point number', () => {
  expect(cred.svglayout_internal.toDialogCoord(25.34)).toEqual(25);
});

test('toDialogCoord for integer string', () => {
  expect(cred.svglayout_internal.toDialogCoord('25')).toEqual(25);
});

test('toDialogCoord for floating point string', () => {
  expect(cred.svglayout_internal.toDialogCoord('25.34')).toEqual(25);
});

test('toDialogCoord for non-number string', () => {
  expect(() => cred.svglayout_internal.toDialogCoord('abc')).toThrow;
});

test('toDialogCoord for other type', () => {
  expect(() => cred.svglayout_internal.toDialogCoord(true)).toThrow();
});

///////////////////

// Sets up a default test environment for SvgItem tests.
// Returns a SvgItem object created in that environment.
function setupSvgItemTestDefaults(behaviorFlags = cred.editBehavior.none) {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgElem = document.getElementById('svgElem');
  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  return new cred.svglayout_internal.SvgItem(svgElem, svgDisplayMock, behaviorFlags);
}

test('SvgItem.svgDisplay', () => {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgElem = document.getElementById('svgElem');
  const svgDisplayMock = new SvgDisplayMock();
  const svgItem = new cred.svglayout_internal.SvgItem(svgElem, svgDisplayMock);
  expect(svgItem.svgDisplay).toBe(svgDisplayMock);
});

test('SvgItem.htmlElement', () => {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgElem = document.getElementById('svgElem');
  const svgItem = new cred.svglayout_internal.SvgItem(svgElem);
  expect(svgItem.htmlElement).toBe(svgElem);
});

test('SvgItem.controller', () => {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgElem = document.getElementById('svgElem');
  const svgDisplayMock = new SvgDisplayMock();
  const svgItem = new cred.svglayout_internal.SvgItem(svgElem, svgDisplayMock);
  expect(svgItem.controller).toBe(svgDisplayMock.controller);
});

test('SvgItem.position', () => {
  const svgItem = setupSvgItemTestDefaults();
  expect(svgItem.position).toEqual(new geom.Point(1, 2));
});

test('SvgItem.setPosition without notification', () => {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgElem = document.getElementById('svgElem');
  const svgDisplayMock = new SvgDisplayMock();
  const svgItem = new cred.svglayout_internal.SvgItem(svgElem, svgDisplayMock);
  svgItem.setPosition({ x: 3, y: 4 }, false);
  expect(svgItem.bounds).toEqual(new geom.Rect(3, 4, 10, 20));
  expect(svgDisplayMock.controller.notifyItemBoundsModifiedCalled).toBeFalsy();
});

test('SvgItem.setPosition with notification', () => {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgElem = document.getElementById('svgElem');
  const svgDisplayMock = new SvgDisplayMock();
  const svgItem = new cred.svglayout_internal.SvgItem(svgElem, svgDisplayMock);
  svgItem.setPosition({ x: 3, y: 4 }, true);
  expect(svgItem.bounds).toEqual(new geom.Rect(3, 4, 10, 20));
  expect(svgDisplayMock.controller.notifyItemBoundsModifiedCalled).toBeTruthy();
});

test('SvgItem.bounds', () => {
  const svgItem = setupSvgItemTestDefaults();
  expect(svgItem.bounds).toEqual(new geom.Rect(1, 2, 10, 20));
});

test('SvgItem.setBounds without notification', () => {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgElem = document.getElementById('svgElem');
  const svgDisplayMock = new SvgDisplayMock();
  const svgItem = new cred.svglayout_internal.SvgItem(svgElem, svgDisplayMock);
  svgItem.setBounds({ left: 3, top: 4, width: 30, height: 40 }, false);
  expect(svgItem.bounds).toEqual(new geom.Rect(3, 4, 30, 40));
  expect(svgDisplayMock.controller.notifyItemBoundsModifiedCalled).toBeFalsy();
});

test('SvgItem.setBounds with notification', () => {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgElem = document.getElementById('svgElem');
  const svgDisplayMock = new SvgDisplayMock();
  const svgItem = new cred.svglayout_internal.SvgItem(svgElem, svgDisplayMock);
  svgItem.setBounds({ left: 3, top: 4, width: 30, height: 40 }, true);
  expect(svgItem.bounds).toEqual(new geom.Rect(3, 4, 30, 40));
  expect(svgDisplayMock.controller.notifyItemBoundsModifiedCalled).toBeTruthy();
});

test('SvgItem.isMoveable when moveable', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.moveable);
  expect(svgItem.isMoveable).toBeTruthy();
});

test('SvgItem.isMoveable when not moveable', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.none);
  expect(svgItem.isMoveable).toBeFalsy();
});

test('SvgItem.isSelectable when selectable', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.selectable);
  expect(svgItem.isSelectable).toBeTruthy();
});

test('SvgItem.isSelectable when not selectable', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.none);
  expect(svgItem.isSelectable).toBeFalsy();
});

test('SvgItem.isResizable when fully resizable', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.resizableFully);
  expect(svgItem.isResizable(cred.editBehavior.resizableDown)).toBeTruthy();
  expect(svgItem.isResizable(cred.editBehavior.resizableUp)).toBeTruthy();
  expect(svgItem.isResizable(cred.editBehavior.resizableLeft)).toBeTruthy();
  expect(svgItem.isResizable(cred.editBehavior.resizableRight)).toBeTruthy();
});

test('SvgItem.isSelectable when not resizable', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.none);
  expect(svgItem.isResizable(cred.editBehavior.resizableDown)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableUp)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableLeft)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableRight)).toBeFalsy();
});

test('SvgItem.isSelectable when partially resizable', () => {
  const svgItem = setupSvgItemTestDefaults(
    cred.editBehavior.resizableLeft | cred.editBehavior.resizableRight
  );
  expect(svgItem.isResizable(cred.editBehavior.resizableDown)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableUp)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableLeft)).toBeTruthy();
  expect(svgItem.isResizable(cred.editBehavior.resizableRight)).toBeTruthy();
});

test('SvgItem.drag for not moveable item', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.none);
  const result = svgItem.drag({ clientX: 10, clientY: 20 }, { x: 0, y: 0 });
  expect(result).toBeFalsy();
});

test('SvgItem.drag for moveable item without mouse-down offset', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.moveable);
  const result = svgItem.drag({ clientX: 10, clientY: 20 }, { x: 0, y: 0 });
  expect(result).toBeTruthy();
  expect(svgItem.position).toEqual(new geom.Point(10, 20));
});

test('SvgItem.drag for moveable item with mouse-down offset', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.moveable);
  const result = svgItem.drag({ clientX: 10, clientY: 20 }, { x: 2, y: 3 });
  expect(result).toBeTruthy();
  expect(svgItem.position).toEqual(new geom.Point(8, 17));
});

test('SvgItem.isSelected for selectable item', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.selectable);
  expect(svgItem.isSelected()).toBeFalsy();
  svgItem.select();
  expect(svgItem.isSelected()).toBeTruthy();
});

test('SvgItem.isSelected for not selectable item', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.none);
  expect(svgItem.isSelected()).toBeFalsy();
  svgItem.select();
  expect(svgItem.isSelected()).toBeFalsy();
});

test('SvgItem.select for selectable item', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.selectable);
  svgItem.select();
  expect(svgItem.isSelected()).toBeTruthy();
});

test('SvgItem.select for not selectable item', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.none);
  svgItem.select();
  expect(svgItem.isSelected()).toBeFalsy();
});

test('SvgItem.deselect', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.selectable);
  svgItem.select();
  svgItem.deselect();
  expect(svgItem.isSelected()).toBeFalsy();
});

test('SvgItem react to mouse-down event', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.selectable);

  const initialMousePos = { x: 3, y: 4 };
  // Zero distance means click.
  const dragDist = 0;
  simulateMouseDrag($('#svgElem'), initialMousePos, dragDist);

  expect(svgItem.isSelected()).toBeTruthy();
});

test('SvgItem react to mouse-down event for not selectable item', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.none);

  const initialMousePos = { x: 3, y: 4 };
  // Zero distance means click.
  const dragDist = 0;
  simulateMouseDrag($('#svgElem'), initialMousePos, dragDist);

  expect(svgItem.isSelected()).toBeFalsy();
});

test('SvgItem react to mouse-move large enough to trigger dragging', () => {
  const svgItem = setupSvgItemTestDefaults(
    cred.editBehavior.selectable | cred.editBehavior.moveable
  );

  const initialItemPos = svgItem.position;
  const initialMousePos = { x: 3, y: 4 };
  const dragDist = 10;
  simulateMouseDrag($('#svgElem'), initialMousePos, dragDist);

  expect(svgItem.isSelected()).toBeTruthy();
  expect(svgItem.position).toEqual(
    new geom.Point(initialItemPos.x + dragDist, initialItemPos.y + dragDist)
  );
});

test('SvgItem react to mouse-move too small to trigger dragging', () => {
  const svgItem = setupSvgItemTestDefaults(
    cred.editBehavior.selectable | cred.editBehavior.moveable
  );

  const initialItemPos = svgItem.position;
  const initialMousePos = { x: 3, y: 4 };
  const dragDist = 2;
  simulateMouseDrag($('#svgElem'), initialMousePos, dragDist);

  expect(svgItem.isSelected()).toBeTruthy();
  expect(svgItem.position).toEqual(initialItemPos);
});

test('SvgItem react to mouse-move when item is not movable', () => {
  const svgItem = setupSvgItemTestDefaults(cred.editBehavior.selectable);

  const initialItemPos = svgItem.position;
  const initialMousePos = { x: 3, y: 4 };
  const dragDist = 10;
  simulateMouseDrag($('#svgElem'), initialMousePos, dragDist);

  expect(svgItem.isSelected()).toBeTruthy();
  expect(svgItem.position).toEqual(initialItemPos);
});

///////////////////

// Sets up a default test environment for SvgDialog tests.
// Returns a SvgDialog object created in that environment.
function setupSvgDialogTestDefaults(ctrls) {
  setupHtmlDocument(htmlBodyWithSvgRoot);
  svg.injectDocument(document);

  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const dlgResMock = new DialogResourceMock(
    new DialogMock(
      'mydlg',
      new Map([[cred.spec.propertyLabel.width, 20], [cred.spec.propertyLabel.height, 10]])
    ),
    ctrls
  );

  return new cred.svglayout_internal.SvgDialog(dlgResMock, svgDisplayMock);
}

test('SvgDialog - creation of SVG element for dialog', () => {
  const svgDlg = setupSvgDialogTestDefaults();
  expect(svgDlg.htmlElement).toBeDefined();
});

test('SvgDialog.resource', () => {
  setupHtmlDocument(htmlBodyWithSvgRoot);
  svg.injectDocument(document);

  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const dlgMock = new DialogMock(
    'mydlg',
    new Map([[cred.spec.propertyLabel.width, 20], [cred.spec.propertyLabel.height, 10]])
  );
  const dlgResMock = new DialogResourceMock(dlgMock);

  const svgDlg = new cred.svglayout_internal.SvgDialog(dlgResMock, svgDisplayMock);
  expect(svgDlg.resource()).toBe(dlgMock);
});

test('SvgDialog.itemSpec', () => {
  const svgDlg = setupSvgDialogTestDefaults();
  expect(svgDlg.itemSpec()).toBeDefined();
});

test('SvgDialog.id', () => {
  const svgDlg = setupSvgDialogTestDefaults();
  expect(svgDlg.id).toEqual('mydlg');
});

test('SvgDialog.isDialog', () => {
  const svgDlg = setupSvgDialogTestDefaults();
  expect(svgDlg.isDialog()).toBeTruthy();
});

test('SvgDialog.buildControls', () => {
  const ctrls = [
    new ControlMock(
      'ctrl1',
      cred.spec.controlType.label,
      new Map([
        [cred.spec.propertyLabel.left, 3],
        [cred.spec.propertyLabel.top, 5],
        [cred.spec.propertyLabel.width, 3],
        [cred.spec.propertyLabel.height, 4]
      ])
    ),
    new ControlMock(
      'ctrl2',
      cred.spec.controlType.pushButton,
      new Map([
        [cred.spec.propertyLabel.left, 13],
        [cred.spec.propertyLabel.top, 15],
        [cred.spec.propertyLabel.width, 5],
        [cred.spec.propertyLabel.height, 6]
      ])
    )
  ];
  const svgDlg = setupSvgDialogTestDefaults(ctrls);
  svgDlg.buildControls();
  expect(svgDlg.findControlItemWithId('ctrl1')).toBeDefined();
  expect(svgDlg.findControlItemWithId('ctrl2')).toBeDefined();
});

test('SvgDialog.resourceBounds', () => {
  const dlgResMock = new DialogResourceMock(
    new DialogMock(
      'mydlg',
      new Map([
        [cred.spec.propertyLabel.width, 200],
        [cred.spec.propertyLabel.height, 300]
      ])
    )
  );

  expect(cred.svglayout_internal.SvgDialog.resourceBounds(dlgResMock)).toEqual(
    new geom.Rect(0, 0, 200, 300)
  );
});

test('SvgDialog.resourceBounds for dialog resource without width and height properties', () => {
  const dlgResMock = new DialogResourceMock(new DialogMock('mydlg', new Map()));
  expect(cred.svglayout_internal.SvgDialog.resourceBounds(dlgResMock)).toEqual(
    new geom.Rect(0, 0, 0, 0)
  );
});

test('SvgDialog.findControlItemWithId for existing control', () => {
  const ctrl = new ControlMock(
    'myctrl',
    cred.spec.controlType.label,
    new Map([
      [cred.spec.propertyLabel.left, 3],
      [cred.spec.propertyLabel.top, 5],
      [cred.spec.propertyLabel.width, 3],
      [cred.spec.propertyLabel.height, 4]
    ])
  );
  const svgDlg = setupSvgDialogTestDefaults([ctrl]);
  svgDlg.buildControls();

  const svgCtrl = svgDlg.findControlItemWithId('myctrl');
  expect(svgCtrl).toBeDefined();
  expect(svgCtrl.resource()).toBe(ctrl);
});

test('SvgDialog.findControlItemWithId for not existing control', () => {
  const ctrl = new ControlMock(
    'myctrl',
    cred.spec.controlType.label,
    new Map([
      [cred.spec.propertyLabel.left, 3],
      [cred.spec.propertyLabel.top, 5],
      [cred.spec.propertyLabel.width, 3],
      [cred.spec.propertyLabel.height, 4]
    ])
  );
  const svgDlg = setupSvgDialogTestDefaults([ctrl]);
  svgDlg.buildControls();

  expect(svgDlg.findControlItemWithId('other')).toBeUndefined();
});

///////////////////

// Sets up a default test environment for SvgDialog tests.
// Returns a SvgDialog object created in that environment.
function setupSvgControlTestDefaults() {
  setupHtmlDocument(htmlBodyWithSvgRoot);
  svg.injectDocument(document);

  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const ctrlMock = new ControlMock(
    'myctrl',
    cred.spec.controlType.label,
    new Map([
      [cred.spec.propertyLabel.left, 3],
      [cred.spec.propertyLabel.top, 5],
      [cred.spec.propertyLabel.width, 40],
      [cred.spec.propertyLabel.height, 22]
    ])
  );

  return new cred.svglayout_internal.SvgControl(ctrlMock, svgDisplayMock);
}

test('SvgControl - creation of SVG element for control', () => {
  const svgCtrl = setupSvgControlTestDefaults();
  expect(svgCtrl.htmlElement).toBeDefined();
});

test('SvgControl.resource', () => {
  setupHtmlDocument(htmlBodyWithSvgRoot);
  svg.injectDocument(document);

  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const ctrlMock = new ControlMock(
    'myctrl',
    cred.spec.controlType.label,
    new Map([
      [cred.spec.propertyLabel.left, 3],
      [cred.spec.propertyLabel.top, 5],
      [cred.spec.propertyLabel.width, 40],
      [cred.spec.propertyLabel.height, 22]
    ])
  );

  const svgCtrl = new cred.svglayout_internal.SvgControl(ctrlMock, svgDisplayMock);
  expect(svgCtrl.resource()).toBe(ctrlMock);
});

test('SvgControl.itemSpec', () => {
  const svgCtrl = setupSvgControlTestDefaults();
  expect(svgCtrl.itemSpec()).toBeDefined();
});

test('SvgControl.id', () => {
  const svgCtrl = setupSvgControlTestDefaults();
  expect(svgCtrl.id).toEqual('myctrl');
});

test('SvgControl.isDialog', () => {
  const svgCtrl = setupSvgControlTestDefaults();
  expect(svgCtrl.isDialog()).toBeFalsy();
});

test('SvgControl.resourceBounds', () => {
  const ctrlMock = new ControlMock(
    'myctrl',
    cred.spec.controlType.label,
    new Map([
      [cred.spec.propertyLabel.left, 3],
      [cred.spec.propertyLabel.top, 5],
      [cred.spec.propertyLabel.width, 40],
      [cred.spec.propertyLabel.height, 22]
    ])
  );

  expect(cred.svglayout_internal.SvgControl.resourceBounds(ctrlMock)).toEqual(
    new geom.Rect(3, 5, 40, 22)
  );
});

test('SvgControl.resourceBounds for control resource without properties', () => {
  const ctrlMock = new ControlMock('myctrl', cred.spec.controlType.label, new Map());
  expect(cred.svglayout_internal.SvgControl.resourceBounds(ctrlMock)).toEqual(
    new geom.Rect(0, 0, 0, 0)
  );
});

///////////////////

// Subclass of SelectionMarker to test the SelectionMarker functinality.
class TestMarker extends cred.svglayout_internal.SelectionMarker {
  constructor(id, pos, isEnabled, selectedSvgItem, svgDisplay) {
    super(id, pos, isEnabled, selectedSvgItem, svgDisplay);
    this.positionOnSelectedItemWasCalled = false;
    this.adjustBoundsWasCalled = false;
  }

  static positionOnItem(svgItem) {
    return svgItem.bounds.center();
  }

  static topLeftPositionOnItem(svgItem) {
    return TestMarker.positionOnItem(svgItem).subtract(
      cred.svglayout_internal.SelectionMarker.markerOffset
    );
  }

  _positionOnSelectedItem() {
    this.positionOnSelectedItemWasCalled = true;
    return TestMarker.positionOnItem(this.selectedItem);
  }

  _adjustBounds(bounds, offset) {
    this.adjustBoundsWasCalled = true;
    // Move, don't resize.
    return new geom.Rect(
      bounds.left + offset.x,
      bounds.top + offset.y,
      bounds.width,
      bounds.height
    );
  }
}

// Sets up a default test environment for SelectionMarker tests.
// Returns a SelectionMarker object created in that environment.
function setupSelectionMarkerTestDefaults(isEnabled) {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const svgElem = document.getElementById('svgElem');
  const svgItem = new cred.svglayout_internal.SvgItem(
    svgElem,
    svgDisplayMock,
    cred.editBehavior.all
  );

  return new TestMarker(
    'mymarker',
    TestMarker.positionOnItem(svgItem),
    isEnabled,
    svgItem,
    svgDisplayMock
  );
}

test('SelectionMarker - creation of marker element', () => {
  const marker = setupSelectionMarkerTestDefaults(true);
  expect(marker.htmlElement).toBeDefined();
});

test('SelectionMarker - enabled marker is moveable', () => {
  const marker = setupSelectionMarkerTestDefaults(true);
  expect(marker.isMoveable).toBeTruthy();
});

test('SelectionMarker - enabled marker is not moveable', () => {
  const marker = setupSelectionMarkerTestDefaults(false);
  expect(marker.isMoveable).toBeFalsy();
});

test('SelectionMarker.markerOffset', () => {
  expect(cred.svglayout_internal.SelectionMarker.markerOffset).toBeGreaterThan(0);
});

test('SelectionMarker.markerSize', () => {
  expect(cred.svglayout_internal.SelectionMarker.markerSize).toBeGreaterThan(0);
});

test('SelectionMarker.selectedItem', () => {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const svgElem = document.getElementById('svgElem');
  const svgItem = new cred.svglayout_internal.SvgItem(
    svgElem,
    svgDisplayMock,
    cred.editBehavior.all
  );
  const marker = new TestMarker(
    'mymarker',
    TestMarker.positionOnItem(svgItem),
    true,
    svgItem,
    svgDisplayMock
  );

  expect(marker.selectedItem).toBe(svgItem);
});

test('SelectionMarker.drag for disabled marker', () => {
  const marker = setupSelectionMarkerTestDefaults(false);
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('SelectionMarker.drag for enabled marker', () => {
  const marker = setupSelectionMarkerTestDefaults(true);
  const prevMarkerPos = marker.position;
  const prevItemPos = marker.selectedItem.position;

  const dragEndPos = new geom.Point(10, 20);
  const mouseDownOffset = new geom.Point(1, 1);
  const adjustedDragEndPos = dragEndPos.subtract(mouseDownOffset);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const dragOffset = adjustedDragEndPos.subtract(prevMarkerPos);
  const expectedItemPos = prevItemPos.add(dragOffset);
  expect(result).toBeTruthy();
  expect(marker.selectedItem.position).toEqual(expectedItemPos);
});

test('SelectionMarker.select', () => {
  const marker = setupSelectionMarkerTestDefaults(true);
  marker.select();

  // Selection markers themselves cannot be selected, so the call should have no
  // effect.
  expect(marker.isSelected()).toBeFalsy();
});

test('SelectionMarker.deselect', () => {
  const marker = setupSelectionMarkerTestDefaults(true);
  marker.select();
  marker.deselect();

  expect(marker.isSelected()).toBeFalsy();
});

test('SelectionMarker.update', () => {
  const marker = setupSelectionMarkerTestDefaults(true);
  marker.selectedItem.setPosition(new geom.Point(5, 6), false);
  marker.update();

  expect(marker.position).toEqual(TestMarker.topLeftPositionOnItem(marker.selectedItem));
});

///////////////////

// Sets up a default test environment for concrete selection marker tests.
// Returns a selection marker object created in that environment.
function setupSpecificSelectionMarkerTestDefaults(markerType, editFlags) {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const svgElem = document.getElementById('svgElem');
  const svgItem = new cred.svglayout_internal.SvgItem(svgElem, svgDisplayMock, editFlags);
  return new markerType(svgItem, svgDisplayMock);
}

test('LeftTopSelectionMarker - creation of marker element', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftTopSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBeDefined();
});

test('LeftTopSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftTopSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('LeftTopSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftTopSelectionMarker,
    cred.editBehavior.all
  );
  const prevMarkerPos = marker.position;
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(5, 6);
  const mouseDownOffset = new geom.Point(1, 1);
  const adjustedDragEndPos = dragEndPos.subtract(mouseDownOffset);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const dragOffset = adjustedDragEndPos.subtract(prevMarkerPos);
  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left + dragOffset.x,
    prevItemBounds.top + dragOffset.y,
    prevItemBounds.width - dragOffset.x,
    prevItemBounds.height - dragOffset.y
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('LeftTopSelectionMarker.drag - prevent invalid item dimensions', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftTopSelectionMarker,
    cred.editBehavior.all
  );
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(15, 20);
  const mouseDownOffset = new geom.Point(1, 1);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const expectedItemBounds = new geom.Rect(
    prevItemBounds.right - 1,
    prevItemBounds.bottom - 1,
    1,
    1
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('LeftTopSelectionMarker.update', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftTopSelectionMarker,
    cred.editBehavior.all
  );
  marker.selectedItem.setPosition(new geom.Point(10, 12), false);
  marker.update();

  const expectedPos = marker.selectedItem.bounds
    .leftTop()
    .subtract(cred.svglayout_internal.SelectionMarker.markerOffset);
  expect(marker.position).toEqual(expectedPos);
});

///////////////////

test('TopSelectionMarker - creation of marker element', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.TopSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBeDefined();
});

test('TopSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.TopSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('TopSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.TopSelectionMarker,
    cred.editBehavior.all
  );
  const prevMarkerPos = marker.position;
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(5, 6);
  const mouseDownOffset = new geom.Point(1, 1);
  const adjustedDragEndPos = dragEndPos.subtract(mouseDownOffset);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const dragOffset = adjustedDragEndPos.subtract(prevMarkerPos);
  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left,
    prevItemBounds.top + dragOffset.y,
    prevItemBounds.width,
    prevItemBounds.height - dragOffset.y
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('TopSelectionMarker.drag - prevent invalid item dimensions', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.TopSelectionMarker,
    cred.editBehavior.all
  );
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(15, 20);
  const mouseDownOffset = new geom.Point(1, 1);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left,
    prevItemBounds.bottom - 1,
    prevItemBounds.width,
    1
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('TopSelectionMarker.update', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.TopSelectionMarker,
    cred.editBehavior.all
  );
  marker.selectedItem.setPosition(new geom.Point(10, 12), false);
  marker.update();

  const expectedPos = marker.selectedItem.bounds
    .centerTop()
    .subtract(cred.svglayout_internal.SelectionMarker.markerOffset);
  expect(marker.position).toEqual(expectedPos);
});

///////////////////

test('RightTopSelectionMarker - creation of marker element', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightTopSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBeDefined();
});

test('RightTopSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightTopSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('RightTopSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightTopSelectionMarker,
    cred.editBehavior.all
  );
  const prevMarkerPos = marker.position;
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(5, 6);
  const mouseDownOffset = new geom.Point(1, 1);
  const adjustedDragEndPos = dragEndPos.subtract(mouseDownOffset);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const dragOffset = adjustedDragEndPos.subtract(prevMarkerPos);
  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left,
    prevItemBounds.top + dragOffset.y,
    prevItemBounds.width + dragOffset.x,
    prevItemBounds.height - dragOffset.y
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('RightTopSelectionMarker.drag - prevent invalid item dimensions', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightTopSelectionMarker,
    cred.editBehavior.all
  );
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(-10, 20);
  const mouseDownOffset = new geom.Point(1, 1);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left,
    prevItemBounds.bottom - 1,
    1,
    1
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('RightTopSelectionMarker.update', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightTopSelectionMarker,
    cred.editBehavior.all
  );
  marker.selectedItem.setPosition(new geom.Point(10, 12), false);
  marker.update();

  const expectedPos = marker.selectedItem.bounds
    .rightTop()
    .subtract(cred.svglayout_internal.SelectionMarker.markerOffset);
  expect(marker.position).toEqual(expectedPos);
});

///////////////////

test('RightSelectionMarker - creation of marker element', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBeDefined();
});

test('RightSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('RightSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightSelectionMarker,
    cred.editBehavior.all
  );
  const prevMarkerPos = marker.position;
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(5, 6);
  const mouseDownOffset = new geom.Point(1, 1);
  const adjustedDragEndPos = dragEndPos.subtract(mouseDownOffset);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const dragOffset = adjustedDragEndPos.subtract(prevMarkerPos);
  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left,
    prevItemBounds.top,
    prevItemBounds.width + dragOffset.x,
    prevItemBounds.height
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('RightSelectionMarker.drag - prevent invalid item dimensions', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightSelectionMarker,
    cred.editBehavior.all
  );
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(-10, 20);
  const mouseDownOffset = new geom.Point(1, 1);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left,
    prevItemBounds.top,
    1,
    prevItemBounds.height
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('RightSelectionMarker.update', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightSelectionMarker,
    cred.editBehavior.all
  );
  marker.selectedItem.setPosition(new geom.Point(10, 12), false);
  marker.update();

  const expectedPos = marker.selectedItem.bounds
    .rightCenter()
    .subtract(cred.svglayout_internal.SelectionMarker.markerOffset);
  expect(marker.position).toEqual(expectedPos);
});

///////////////////

test('RightBottomSelectionMarker - creation of marker element', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightBottomSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBeDefined();
});

test('RightBottomSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightBottomSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('RightBottomSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightBottomSelectionMarker,
    cred.editBehavior.all
  );
  const prevMarkerPos = marker.position;
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(5, 6);
  const mouseDownOffset = new geom.Point(1, 1);
  const adjustedDragEndPos = dragEndPos.subtract(mouseDownOffset);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const dragOffset = adjustedDragEndPos.subtract(prevMarkerPos);
  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left,
    prevItemBounds.top,
    prevItemBounds.width + dragOffset.x,
    prevItemBounds.height + dragOffset.y
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('RightBottomSelectionMarker.drag - prevent invalid item dimensions', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightBottomSelectionMarker,
    cred.editBehavior.all
  );
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(-10, -20);
  const mouseDownOffset = new geom.Point(1, 1);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const expectedItemBounds = new geom.Rect(prevItemBounds.left, prevItemBounds.top, 1, 1);
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('RightBottomSelectionMarker.update', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.RightBottomSelectionMarker,
    cred.editBehavior.all
  );
  marker.selectedItem.setPosition(new geom.Point(10, 12), false);
  marker.update();

  const expectedPos = marker.selectedItem.bounds
    .rightBottom()
    .subtract(cred.svglayout_internal.SelectionMarker.markerOffset);
  expect(marker.position).toEqual(expectedPos);
});

///////////////////

test('BottomSelectionMarker - creation of marker element', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.BottomSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBeDefined();
});

test('BottomSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.BottomSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('BottomSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.BottomSelectionMarker,
    cred.editBehavior.all
  );
  const prevMarkerPos = marker.position;
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(5, 6);
  const mouseDownOffset = new geom.Point(1, 1);
  const adjustedDragEndPos = dragEndPos.subtract(mouseDownOffset);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const dragOffset = adjustedDragEndPos.subtract(prevMarkerPos);
  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left,
    prevItemBounds.top,
    prevItemBounds.width,
    prevItemBounds.height + dragOffset.y
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('BottomSelectionMarker.drag - prevent invalid item dimensions', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.BottomSelectionMarker,
    cred.editBehavior.all
  );
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(20, -20);
  const mouseDownOffset = new geom.Point(1, 1);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left,
    prevItemBounds.top,
    prevItemBounds.width,
    1
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('BottomSelectionMarker.update', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.BottomSelectionMarker,
    cred.editBehavior.all
  );
  marker.selectedItem.setPosition(new geom.Point(10, 12), false);
  marker.update();

  const expectedPos = marker.selectedItem.bounds
    .centerBottom()
    .subtract(cred.svglayout_internal.SelectionMarker.markerOffset);
  expect(marker.position).toEqual(expectedPos);
});

///////////////////

test('LeftBottomSelectionMarker - creation of marker element', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftBottomSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBeDefined();
});

test('LeftBottomSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftBottomSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('LeftBottomSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftBottomSelectionMarker,
    cred.editBehavior.all
  );
  const prevMarkerPos = marker.position;
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(5, 6);
  const mouseDownOffset = new geom.Point(1, 1);
  const adjustedDragEndPos = dragEndPos.subtract(mouseDownOffset);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const dragOffset = adjustedDragEndPos.subtract(prevMarkerPos);
  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left + dragOffset.x,
    prevItemBounds.top,
    prevItemBounds.width - dragOffset.x,
    prevItemBounds.height + dragOffset.y
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('LeftBottomSelectionMarker.drag - prevent invalid item dimensions', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftBottomSelectionMarker,
    cred.editBehavior.all
  );
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(20, -20);
  const mouseDownOffset = new geom.Point(1, 1);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const expectedItemBounds = new geom.Rect(
    prevItemBounds.right - 1,
    prevItemBounds.top,
    1,
    1
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('LeftBottomSelectionMarker.update', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftBottomSelectionMarker,
    cred.editBehavior.all
  );
  marker.selectedItem.setPosition(new geom.Point(10, 12), false);
  marker.update();

  const expectedPos = marker.selectedItem.bounds
    .leftBottom()
    .subtract(cred.svglayout_internal.SelectionMarker.markerOffset);
  expect(marker.position).toEqual(expectedPos);
});

///////////////////

test('LeftSelectionMarker - creation of marker element', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBeDefined();
});

test('LeftSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('LeftSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftSelectionMarker,
    cred.editBehavior.all
  );
  const prevMarkerPos = marker.position;
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(5, 6);
  const mouseDownOffset = new geom.Point(1, 1);
  const adjustedDragEndPos = dragEndPos.subtract(mouseDownOffset);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const dragOffset = adjustedDragEndPos.subtract(prevMarkerPos);
  const expectedItemBounds = new geom.Rect(
    prevItemBounds.left + dragOffset.x,
    prevItemBounds.top,
    prevItemBounds.width - dragOffset.x,
    prevItemBounds.height
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('LeftSelectionMarker.drag - prevent invalid item dimensions', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftSelectionMarker,
    cred.editBehavior.all
  );
  const prevItemBounds = marker.selectedItem.bounds;

  const dragEndPos = new geom.Point(20, -20);
  const mouseDownOffset = new geom.Point(1, 1);
  const result = marker.drag(
    { clientX: dragEndPos.x, clientY: dragEndPos.y },
    mouseDownOffset
  );

  const expectedItemBounds = new geom.Rect(
    prevItemBounds.right - 1,
    prevItemBounds.top,
    1,
    prevItemBounds.height
  );
  expect(result).toBeTruthy();
  expect(marker.selectedItem.bounds).toEqual(expectedItemBounds);
});

test('LeftSelectionMarker.update', () => {
  const marker = setupSpecificSelectionMarkerTestDefaults(
    cred.svglayout_internal.LeftSelectionMarker,
    cred.editBehavior.all
  );
  marker.selectedItem.setPosition(new geom.Point(10, 12), false);
  marker.update();

  const expectedPos = marker.selectedItem.bounds
    .leftCenter()
    .subtract(cred.svglayout_internal.SelectionMarker.markerOffset);
  expect(marker.position).toEqual(expectedPos);
});

///////////////////

// Sets up a default test environment for Selection tests.
// Returns Selection and SvgItem objects created in that environment.
function setupSelectionTestDefaults() {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const selection = new cred.svglayout_internal.Selection(svgDisplayMock);
  svgDisplayMock.injectSelection(selection);

  const svgElem = document.getElementById('svgElem');
  const svgItem = new cred.svglayout_internal.SvgItem(
    svgElem,
    svgDisplayMock,
    cred.editBehavior.all
  );

  return [selection, svgItem];
}

test('Selection construction', () => {
  const [selection] = setupSelectionTestDefaults();
  expect(selection).toBeDefined();
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.selectedItem when nothing is selected', () => {
  const [selection] = setupSelectionTestDefaults();
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.selectedItem when an itemn is selected', () => {
  const [selection, svgItem] = setupSelectionTestDefaults();
  selection.add(svgItem);
  expect(selection.selectedItem).toBe(svgItem);
});

test('Selection.add to empty selection', () => {
  const [selection, svgItem] = setupSelectionTestDefaults();
  selection.add(svgItem);
  expect(selection.selectedItem).toBe(svgItem);
});

test('Selection.add to existing selection', () => {
  const [selection, svgItem] = setupSelectionTestDefaults();
  selection.add(svgItem);
  const mockedItem = {
    bounds: new geom.Rect(1, 1, 10, 10),
    isResizable() {
      return true;
    }
  };
  selection.add(mockedItem);
  expect(selection.selectedItem).toBe(mockedItem);
});

test('Selection.remove when item is selected', () => {
  const [selection, svgItem] = setupSelectionTestDefaults();
  selection.add(svgItem);
  selection.remove(svgItem);
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.remove when other item is selected', () => {
  const [selection, svgItem] = setupSelectionTestDefaults();
  selection.add(svgItem);
  selection.remove({ something: 'else' });
  expect(selection.selectedItem).toBe(svgItem);
});

test.only('Selection.clear when item is selected', () => {
  const [selection, svgItem] = setupSelectionTestDefaults();
  selection.add(svgItem);
  selection.clear();
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.clear when nothing is selected', () => {
  const [selection] = setupSelectionTestDefaults();
  selection.clear();
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.update', () => {
  // Skip because it is hard to observe.
});
