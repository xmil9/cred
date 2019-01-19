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
    this.notifyItemSelectedCalled = false;
    this.notifySelectionClearedCalled = false;
  }

  notifyItemBoundsModified() {
    this.notifyItemBoundsModifiedCalled = true;
  }

  notifyItemSelected() {
    this.notifyItemSelectedCalled = true;
  }

  notifySelectionCleared() {
    this.notifySelectionClearedCalled = true;
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

// Sets up a test environment for SvgItem tests.
function setupSvgItemTestEnv(behaviorFlags = cred.editBehavior.none) {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgElem = document.getElementById('svgElem');
  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const svgItem = new cred.svglayout_internal.SvgItem(
    svgElem,
    svgDisplayMock,
    behaviorFlags
  );
  return [svgItem, svgElem, svgDisplayMock];
}

test('SvgItem.svgDisplay', () => {
  const [svgItem, , svgDisplayMock] = setupSvgItemTestEnv();
  expect(svgItem.svgDisplay).toBe(svgDisplayMock);
});

test('SvgItem.htmlElement', () => {
  const [svgItem, svgElem] = setupSvgItemTestEnv();
  expect(svgItem.htmlElement).toBe(svgElem);
});

test('SvgItem.controller', () => {
  const [svgItem, , svgDisplayMock] = setupSvgItemTestEnv();
  expect(svgItem.controller).toBe(svgDisplayMock.controller);
});

test('SvgItem.position', () => {
  const [svgItem] = setupSvgItemTestEnv();
  expect(svgItem.position).toEqual(new geom.Point(1, 2));
});

test('SvgItem.setPosition without notification', () => {
  const [svgItem, , svgDisplayMock] = setupSvgItemTestEnv();
  svgItem.setPosition({ x: 3, y: 4 }, false);

  expect(svgItem.bounds).toEqual(new geom.Rect(3, 4, 10, 20));
  expect(svgDisplayMock.controller.notifyItemBoundsModifiedCalled).toBeFalsy();
});

test('SvgItem.setPosition with notification', () => {
  const [svgItem, , svgDisplayMock] = setupSvgItemTestEnv();
  svgItem.setPosition({ x: 3, y: 4 }, true);

  expect(svgItem.bounds).toEqual(new geom.Rect(3, 4, 10, 20));
  expect(svgDisplayMock.controller.notifyItemBoundsModifiedCalled).toBeTruthy();
});

test('SvgItem.bounds', () => {
  const [svgItem] = setupSvgItemTestEnv();
  expect(svgItem.bounds).toEqual(new geom.Rect(1, 2, 10, 20));
});

test('SvgItem.setBounds without notification', () => {
  const [svgItem, , svgDisplayMock] = setupSvgItemTestEnv();
  svgItem.setBounds({ left: 3, top: 4, width: 30, height: 40 }, false);

  expect(svgItem.bounds).toEqual(new geom.Rect(3, 4, 30, 40));
  expect(svgDisplayMock.controller.notifyItemBoundsModifiedCalled).toBeFalsy();
});

test('SvgItem.setBounds with notification', () => {
  const [svgItem, , svgDisplayMock] = setupSvgItemTestEnv();
  svgItem.setBounds({ left: 3, top: 4, width: 30, height: 40 }, true);

  expect(svgItem.bounds).toEqual(new geom.Rect(3, 4, 30, 40));
  expect(svgDisplayMock.controller.notifyItemBoundsModifiedCalled).toBeTruthy();
});

test('SvgItem.isMoveable when moveable', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.moveable);
  expect(svgItem.isMoveable).toBeTruthy();
});

test('SvgItem.isMoveable when not moveable', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.none);
  expect(svgItem.isMoveable).toBeFalsy();
});

test('SvgItem.isSelectable when selectable', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.selectable);
  expect(svgItem.isSelectable).toBeTruthy();
});

test('SvgItem.isSelectable when not selectable', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.none);
  expect(svgItem.isSelectable).toBeFalsy();
});

test('SvgItem.isResizable when fully resizable', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.resizableFully);
  expect(svgItem.isResizable(cred.editBehavior.resizableDown)).toBeTruthy();
  expect(svgItem.isResizable(cred.editBehavior.resizableUp)).toBeTruthy();
  expect(svgItem.isResizable(cred.editBehavior.resizableLeft)).toBeTruthy();
  expect(svgItem.isResizable(cred.editBehavior.resizableRight)).toBeTruthy();
});

test('SvgItem.isSelectable when not resizable', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.none);
  expect(svgItem.isResizable(cred.editBehavior.resizableDown)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableUp)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableLeft)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableRight)).toBeFalsy();
});

test('SvgItem.isSelectable when partially resizable', () => {
  const [svgItem] = setupSvgItemTestEnv(
    cred.editBehavior.resizableLeft | cred.editBehavior.resizableRight
  );
  expect(svgItem.isResizable(cred.editBehavior.resizableDown)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableUp)).toBeFalsy();
  expect(svgItem.isResizable(cred.editBehavior.resizableLeft)).toBeTruthy();
  expect(svgItem.isResizable(cred.editBehavior.resizableRight)).toBeTruthy();
});

test('SvgItem.drag for not moveable item', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.none);
  const result = svgItem.drag({ clientX: 10, clientY: 20 }, { x: 0, y: 0 });
  expect(result).toBeFalsy();
});

test('SvgItem.drag for moveable item without mouse-down offset', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.moveable);
  const result = svgItem.drag({ clientX: 10, clientY: 20 }, { x: 0, y: 0 });
  expect(result).toBeTruthy();
  expect(svgItem.position).toEqual(new geom.Point(10, 20));
});

test('SvgItem.drag for moveable item with mouse-down offset', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.moveable);
  const result = svgItem.drag({ clientX: 10, clientY: 20 }, { x: 2, y: 3 });
  expect(result).toBeTruthy();
  expect(svgItem.position).toEqual(new geom.Point(8, 17));
});

test('SvgItem.isSelected for selectable item', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.selectable);
  expect(svgItem.isSelected()).toBeFalsy();
  svgItem.select();
  expect(svgItem.isSelected()).toBeTruthy();
});

test('SvgItem.isSelected for not selectable item', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.none);
  expect(svgItem.isSelected()).toBeFalsy();
  svgItem.select();
  expect(svgItem.isSelected()).toBeFalsy();
});

test('SvgItem.select for selectable item', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.selectable);
  svgItem.select();
  expect(svgItem.isSelected()).toBeTruthy();
});

test('SvgItem.select for not selectable item', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.none);
  svgItem.select();
  expect(svgItem.isSelected()).toBeFalsy();
});

test('SvgItem.deselect', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.selectable);
  svgItem.select();
  svgItem.deselect();
  expect(svgItem.isSelected()).toBeFalsy();
});

test('SvgItem react to mouse-down event', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.selectable);

  const initialMousePos = { x: 3, y: 4 };
  // Zero distance means click.
  const dragDist = 0;
  simulateMouseDrag($('#svgElem'), initialMousePos, dragDist);

  expect(svgItem.isSelected()).toBeTruthy();
});

test('SvgItem react to mouse-down event for not selectable item', () => {
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.none);

  const initialMousePos = { x: 3, y: 4 };
  // Zero distance means click.
  const dragDist = 0;
  simulateMouseDrag($('#svgElem'), initialMousePos, dragDist);

  expect(svgItem.isSelected()).toBeFalsy();
});

test('SvgItem react to mouse-move large enough to trigger dragging', () => {
  const [svgItem] = setupSvgItemTestEnv(
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
  const [svgItem] = setupSvgItemTestEnv(
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
  const [svgItem] = setupSvgItemTestEnv(cred.editBehavior.selectable);

  const initialItemPos = svgItem.position;
  const initialMousePos = { x: 3, y: 4 };
  const dragDist = 10;
  simulateMouseDrag($('#svgElem'), initialMousePos, dragDist);

  expect(svgItem.isSelected()).toBeTruthy();
  expect(svgItem.position).toEqual(initialItemPos);
});

///////////////////

// Sets up a test environment for SvgDialog tests.
function setupSvgDialogTestEnv(ctrls) {
  setupHtmlDocument(htmlBodyWithSvgRoot);
  svg.injectDocument(document);

  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const dlgMock = new DialogMock(
    'mydlg',
    new Map([[cred.spec.propertyLabel.width, 20], [cred.spec.propertyLabel.height, 10]])
  );
  const dlgResMock = new DialogResourceMock(dlgMock, ctrls);
  const svgDlg = new cred.svglayout_internal.SvgDialog(dlgResMock, svgDisplayMock);

  return [svgDlg, dlgMock];
}

test('SvgDialog - creation of SVG element for dialog', () => {
  const [svgDlg] = setupSvgDialogTestEnv();
  expect(svgDlg.htmlElement).toBeDefined();
});

test('SvgDialog.resource', () => {
  const [svgDlg, dlgMock] = setupSvgDialogTestEnv();
  expect(svgDlg.resource()).toBe(dlgMock);
});

test('SvgDialog.itemSpec', () => {
  const [svgDlg] = setupSvgDialogTestEnv();
  expect(svgDlg.itemSpec()).toBeDefined();
});

test('SvgDialog.id', () => {
  const [svgDlg] = setupSvgDialogTestEnv();
  expect(svgDlg.id).toEqual('mydlg');
});

test('SvgDialog.isDialog', () => {
  const [svgDlg] = setupSvgDialogTestEnv();
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
  const [svgDlg] = setupSvgDialogTestEnv(ctrls);
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
  const [svgDlg] = setupSvgDialogTestEnv([ctrl]);
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
  const [svgDlg] = setupSvgDialogTestEnv([ctrl]);
  svgDlg.buildControls();

  expect(svgDlg.findControlItemWithId('other')).toBeUndefined();
});

///////////////////

// Sets up a test environment for SvgDialog tests.
function setupSvgControlTestEnv() {
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

  return [svgCtrl, ctrlMock];
}

test('SvgControl - creation of SVG element for control', () => {
  const [svgCtrl] = setupSvgControlTestEnv();
  expect(svgCtrl.htmlElement).toBeDefined();
});

test('SvgControl.resource', () => {
  const [svgCtrl, ctrlMock] = setupSvgControlTestEnv();
  expect(svgCtrl.resource()).toBe(ctrlMock);
});

test('SvgControl.itemSpec', () => {
  const [svgCtrl] = setupSvgControlTestEnv();
  expect(svgCtrl.itemSpec()).toBeDefined();
});

test('SvgControl.id', () => {
  const [svgCtrl] = setupSvgControlTestEnv();
  expect(svgCtrl.id).toEqual('myctrl');
});

test('SvgControl.isDialog', () => {
  const [svgCtrl] = setupSvgControlTestEnv();
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

// Sets up a test environment for SelectionMarker tests.
function setupSelectionMarkerTestEnv(isEnabled) {
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
    isEnabled,
    svgItem,
    svgDisplayMock
  );

  return [marker, svgItem];
}

test('SelectionMarker - creation of marker element', () => {
  const [marker] = setupSelectionMarkerTestEnv(true);
  expect(marker.htmlElement).toBeDefined();
});

test('SelectionMarker - enabled marker is moveable', () => {
  const [marker] = setupSelectionMarkerTestEnv(true);
  expect(marker.isMoveable).toBeTruthy();
});

test('SelectionMarker - enabled marker is not moveable', () => {
  const [marker] = setupSelectionMarkerTestEnv(false);
  expect(marker.isMoveable).toBeFalsy();
});

test('SelectionMarker.markerOffset', () => {
  expect(cred.svglayout_internal.SelectionMarker.markerOffset).toBeGreaterThan(0);
});

test('SelectionMarker.markerSize', () => {
  expect(cred.svglayout_internal.SelectionMarker.markerSize).toBeGreaterThan(0);
});

test('SelectionMarker.selectedItem', () => {
  const [marker, svgItem] = setupSelectionMarkerTestEnv(false);
  expect(marker.selectedItem).toBe(svgItem);
});

test('SelectionMarker.drag for disabled marker', () => {
  const [marker] = setupSelectionMarkerTestEnv(false);
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('SelectionMarker.drag for enabled marker', () => {
  const [marker] = setupSelectionMarkerTestEnv(true);
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
  const [marker] = setupSelectionMarkerTestEnv(true);
  marker.select();

  // Selection markers themselves cannot be selected, so the call should have no
  // effect.
  expect(marker.isSelected()).toBeFalsy();
});

test('SelectionMarker.deselect', () => {
  const [marker] = setupSelectionMarkerTestEnv(true);
  marker.select();
  marker.deselect();

  expect(marker.isSelected()).toBeFalsy();
});

test('SelectionMarker.update', () => {
  const [marker] = setupSelectionMarkerTestEnv(true);
  marker.selectedItem.setPosition(new geom.Point(5, 6), false);
  marker.update();

  expect(marker.position).toEqual(TestMarker.topLeftPositionOnItem(marker.selectedItem));
});

///////////////////

// Sets up a test environment for concrete selection marker tests.
function setupSpecificSelectionMarkerTestEnv(markerType, editFlags) {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgRootElem = document.getElementById('svgRoot');
  const svgDisplayMock = new SvgDisplayMock(svgRootElem);
  const svgElem = document.getElementById('svgElem');
  const svgItem = new cred.svglayout_internal.SvgItem(svgElem, svgDisplayMock, editFlags);
  return new markerType(svgItem, svgDisplayMock);
}

test('LeftTopSelectionMarker - creation of marker element', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.LeftTopSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBe(document.getElementsByClassName('nw-marker')[0]);
});

test('LeftTopSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.LeftTopSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('LeftTopSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.TopSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBe(document.getElementsByClassName('n-marker')[0]);
});

test('TopSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.TopSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('TopSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.RightTopSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBe(document.getElementsByClassName('ne-marker')[0]);
});

test('RightTopSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.RightTopSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('RightTopSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.RightSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBe(document.getElementsByClassName('e-marker')[0]);
});

test('RightSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.RightSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('RightSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.RightBottomSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBe(document.getElementsByClassName('se-marker')[0]);
});

test('RightBottomSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.RightBottomSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('RightBottomSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.BottomSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBe(document.getElementsByClassName('s-marker')[0]);
});

test('BottomSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.BottomSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('BottomSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.LeftBottomSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBe(document.getElementsByClassName('sw-marker')[0]);
});

test('LeftBottomSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.LeftBottomSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('LeftBottomSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.LeftSelectionMarker,
    cred.editBehavior.all
  );
  expect(marker.htmlElement).toBe(document.getElementsByClassName('w-marker')[0]);
});

test('LeftSelectionMarker.drag for disabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
    cred.svglayout_internal.LeftSelectionMarker,
    cred.editBehavior.none
  );
  const result = marker.drag({ clientX: 10, clientY: 20 }, { x: 1, y: 1 });

  expect(result).toBeFalsy();
});

test('LeftSelectionMarker.drag for enabled marker', () => {
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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
  const marker = setupSpecificSelectionMarkerTestEnv(
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

// Sets up a test environment for Selection tests.
function setupSelectionTestEnv() {
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

  return [selection, svgItem, svgDisplayMock];
}

test('Selection construction', () => {
  const [selection] = setupSelectionTestEnv();
  expect(selection).toBeDefined();
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.selectedItem when nothing is selected', () => {
  const [selection] = setupSelectionTestEnv();
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.selectedItem when an itemn is selected', () => {
  const [selection, svgItem] = setupSelectionTestEnv();
  selection.add(svgItem);
  expect(selection.selectedItem).toBe(svgItem);
});

test('Selection.add to empty selection', () => {
  const [selection, svgItem] = setupSelectionTestEnv();
  selection.add(svgItem);
  expect(selection.selectedItem).toBe(svgItem);
});

test('Selection.add to existing selection', () => {
  const [selection, svgItem] = setupSelectionTestEnv();
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
  const [selection, svgItem] = setupSelectionTestEnv();
  selection.add(svgItem);
  selection.remove(svgItem);
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.remove when other item is selected', () => {
  const [selection, svgItem] = setupSelectionTestEnv();
  selection.add(svgItem);
  selection.remove({ something: 'else' });
  expect(selection.selectedItem).toBe(svgItem);
});

test('Selection.clear when item is selected', () => {
  const [selection, svgItem] = setupSelectionTestEnv();
  selection.add(svgItem);
  selection.clear();
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.clear when nothing is selected', () => {
  const [selection] = setupSelectionTestEnv();
  selection.clear();
  expect(selection.selectedItem).toBeUndefined();
});

test('Selection.update', () => {
  const [selection, svgItem, svgDisplay] = setupSelectionTestEnv();
  selection.add(svgItem);
  const prevItemPos = svgItem.position;

  const markerElem = document.getElementsByClassName('nw-marker')[0];
  const markerItem = new cred.svglayout_internal.SvgItem(markerElem, svgDisplay);
  const prevMarkerPos = markerItem.position;

  // Offset the selected item.
  const offset = 2;
  svgItem.setPosition(prevItemPos.add(offset));
  selection.update();

  // Marker should be offset, too.
  const expectedMarkerPos = prevMarkerPos.add(offset);
  expect(markerItem.position).toEqual(expectedMarkerPos);
});

///////////////////

// Sets up a test environment for SvgDisplay tests.
function setupSvgDisplayTestEnv() {
  setupHtmlDocument(htmlBodyWithSvgItem);
  const svgRootElem = document.getElementById('svgRoot');
  const mockedController = new ControllerMock();
  const svgDisplay = new cred.svglayout_internal.SvgDisplay(
    { w: 100, h: 100 },
    { left: 0, top: 0, width: 100, height: 100 },
    svgRootElem,
    mockedController
  );

  return [svgDisplay, mockedController];
}

// Creates a mocked dialog resource object.
function makeDialogResourceForSvgDisplayTests(ctrls = new Map()) {
  const dlgMock = new DialogMock(
    'mydlg',
    new Map([[cred.spec.propertyLabel.width, 20], [cred.spec.propertyLabel.height, 10]])
  );
  return new DialogResourceMock(dlgMock, ctrls);
}

test('SvgDisplay construction', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  expect(svgDisplay).toBeDefined();
});

test('SvgDisplay.htmlElement', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  expect(svgDisplay.htmlElement).toBeDefined();
});

test('SvgDisplay.controller', () => {
  const [svgDisplay, controller] = setupSvgDisplayTestEnv();
  expect(svgDisplay.controller).toBe(controller);
});

test('SvgDisplay.buildDialog', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  const svgDlg = svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());

  expect(svgDlg).toBeDefined();
});

test('SvgDisplay.buildDialog clears the selection', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());
  // Select item.
  const svgItem = new cred.svglayout_internal.SvgItem(
    document.getElementById('svgElem'),
    svgDisplay,
    cred.editBehavior.all
  );
  svgDisplay.selectItem(svgItem);
  // Builds another dialog.
  svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());

  expect(svgDisplay.selectedItem).toBeUndefined();
});

test('SvgDisplay.selectedItem', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());
  // Select item.
  const svgItem = new cred.svglayout_internal.SvgItem(
    document.getElementById('svgElem'),
    svgDisplay,
    cred.editBehavior.all
  );
  svgDisplay.selectItem(svgItem);

  expect(svgDisplay.selectedItem).toBe(svgItem);
});

test('SvgDisplay.selectedItem is undefined when nothing is selected', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());
  expect(svgDisplay.selectedItem).toBeUndefined();
});

test('SvgDisplay.selectItem', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());
  // Select item.
  const svgItem = new cred.svglayout_internal.SvgItem(
    document.getElementById('svgElem'),
    svgDisplay,
    cred.editBehavior.all
  );
  svgDisplay.selectItem(svgItem);

  expect(svgDisplay.selectedItem).toBe(svgItem);
});

test('SvgDisplay.deselectItem', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());
  const svgItem = new cred.svglayout_internal.SvgItem(
    document.getElementById('svgElem'),
    svgDisplay,
    cred.editBehavior.all
  );
  svgDisplay.selectItem(svgItem);
  svgDisplay.deselectItem(svgItem);

  expect(svgDisplay.selectedItem).toBeUndefined();
});

test('SvgDisplay.clearSelection', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());
  const svgItem = new cred.svglayout_internal.SvgItem(
    document.getElementById('svgElem'),
    svgDisplay,
    cred.editBehavior.all
  );
  svgDisplay.selectItem(svgItem);
  svgDisplay.clearSelection();

  expect(svgDisplay.selectedItem).toBeUndefined();
  expect(svgDisplay.controller.notifySelectionClearedCalled).toBeTruthy();
});

test('SvgDisplay.updateSelection', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());
  const svgItem = new cred.svglayout_internal.SvgItem(
    document.getElementById('svgElem'),
    svgDisplay,
    cred.editBehavior.all
  );
  svgDisplay.selectItem(svgItem);
  const prevItemPos = svgItem.position;

  const markerElem = document.getElementsByClassName('nw-marker')[0];
  const markerItem = new cred.svglayout_internal.SvgItem(markerElem, svgDisplay);
  const prevMarkerPos = markerItem.position;

  // Offset the selected item.
  const offset = 2;
  svgItem.setPosition(prevItemPos.add(offset));
  svgDisplay.updateSelection();

  // Marker should be offset, too.
  const expectedMarkerPos = prevMarkerPos.add(offset);
  expect(markerItem.position).toEqual(expectedMarkerPos);
});

test('SvgDisplay.findItemWithId for dialog item', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
  const dlgItem = svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests());

  expect(svgDisplay.findItemWithId('mydlg')).toBe(dlgItem);
});

test('SvgDisplay.findItemWithId for control item', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
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
  const svgDlg = svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests([ctrl]));
  svgDlg.buildControls();

  expect(svgDisplay.findItemWithId('myctrl')).toBeDefined();
});

test('SvgDisplay.findItemWithId for not existing item', () => {
  const [svgDisplay] = setupSvgDisplayTestEnv();
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
  const svgDlg = svgDisplay.buildDialog(makeDialogResourceForSvgDisplayTests([ctrl]));
  svgDlg.buildControls();

  expect(svgDisplay.findItemWithId('missing')).toBeUndefined();
});
