//
// Tests for the SVG layout view.
//
'use strict';

const $ = require('jquery');
var cred = require('../cred_types');
cred.svglayout = require('../dlg_svg_layout');
cred.svglayout_internal = require('../dlg_svg_layout_internal');
const geom = require('../geom');

///////////////////

// Mock controller that SVGLayout objects are injected with.
class ControllerMock {
  constructor(config) {
    if (document.body.innerHTML === '') {
      throw new Error(
        'Document HTML needs to be set up before instantiating a mock controller.'
      );
    }
    this._config = config;
    this._displayElems = collectHtmlDisplayElements();
    this.notifyItemSelected = jest.fn();
    this.notifySelectionCleared = jest.fn();
    this.notifyItemBoundsModified = jest.fn();
  }

  displayHtmlElements() {
    return this._displayElems;
  }

  get currentLocale() {
    return this._config.currentLocale;
  }

  dialogResource(locale) {
    return this._config.dialogResources.get(locale);
  }

  isLinkedToMaster(locale) {
    return this._config.linkedLocales.includes(locale);
  }

  linkedLocales() {
    return this._config.linkedLocales;
  }
}

// Collects all HTML elements of the current document that have a class of
// 'dialog-display' and returns them in a map associated with the locale that
// they represent.
function collectHtmlDisplayElements() {
  const unassociatedDisplayElems = $('.dialog-display');
  const displayElems = new Map();
  for (let i = 0; i < unassociatedDisplayElems.length; ++i) {
    const locale = $(unassociatedDisplayElems[i]).data('locale');
    displayElems.set(locale, unassociatedDisplayElems[i]);
  }
  return displayElems;
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

// Creates a mocked dialog resource object.
function makeDialogResourceForSvgDisplayTests(ctrls = new Map()) {
  const dlgMock = new DialogMock(
    'mydlg',
    new Map([[cred.spec.propertyLabel.width, 50], [cred.spec.propertyLabel.height, 45]])
  );
  return new DialogResourceMock(dlgMock, ctrls);
}

// Accesses private data of a given layout object.
// Returns the SVG dispaly for a given locale.
function spyOnLayoutDisplay(layout, locale) {
  return layout._svgDisplays.get(locale);
}

// Returns the HTML content for the tab section of the cred page.
function makeTabsHtml() {
  return (
    '<div class="tabs">' +
    '    <button class="tab default-tab" data-contentid="master-tab">Master</button>' +
    '    <button class="tab" data-contentid="en-tab">English</button>' +
    '    <button class="tab" data-contentid="jp-tab">Japanese</button>' +
    '    <button class="tab" data-contentid="de-tab">German</button>' +
    '</div>' +
    '<div id="panes">' +
    '    <div id="display-pane">' +
    '        <div id="display-header">' +
    '            <input type="checkbox" id="linked-flag">' +
    '            <label>Linked to Master</label>' +
    '        </div>' +
    '        <!-- Tab content -->' +
    '        <div id="master-tab" class="tab-content">' +
    '            <div id="any-display" class="dialog-display" data-locale="any"></div>' +
    '        </div>' +
    '        <div id="en-tab" class="tab-content">' +
    '            <div id="en-display" class="dialog-display" data-locale="en"></div>' +
    '        </div>' +
    '        <div id="jp-tab" class="tab-content">' +
    '            <div id="jp-display" class="dialog-display" data-locale="jp"></div>' +
    '        </div>' +
    '        <div id="de-tab" class="tab-content">' +
    '            <div id="de-display" class="dialog-display" data-locale="de"></div>' +
    '        </div>' +
    '    </div>' +
    '    <div id="property-pane">' +
    '        <div id="item-title">Properties</div>' +
    '        <div id="property-list"></div>' +
    '    </div>' +
    '</div>'
  );
}

///////////////////

// Sets up a test environment for SvgLayout tests.
function setupSvgLayoutTestEnv(config) {
  document.body.innerHTML = makeTabsHtml();
  const layout = new cred.svglayout.SvgLayout(new geom.Size(0, 0));
  const controllerMock = new ControllerMock(config);
  layout.controller = controllerMock;
  return [layout, controllerMock];
}

test('SvgLayout.controller', () => {
  const [layout, controllerMock] = setupSvgLayoutTestEnv();
  layout.controller = controllerMock;

  layout.notifyItemSelected({});
  expect(controllerMock.notifyItemSelected).toBeCalled();
});

test('SvgLayout.selectedItem for locale without display', () => {
  const [layout] = setupSvgLayoutTestEnv();
  expect(layout.selectedItem(cred.locale.english)).toBeUndefined();
});

test('SvgLayout.selectedItem for locale with display', () => {
  const ctrl = new ControlMock(
    'svgElem',
    cred.spec.controlType.label,
    new Map([
      [cred.spec.propertyLabel.left, 3],
      [cred.spec.propertyLabel.top, 5],
      [cred.spec.propertyLabel.width, 3],
      [cred.spec.propertyLabel.height, 4]
    ])
  );
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.english, makeDialogResourceForSvgDisplayTests([ctrl])]
    ])
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.onDialogLoadedNotification();

  const svgDisplay = spyOnLayoutDisplay(layout, cred.locale.english);
  const svgItem = new cred.svglayout_internal.SvgItem(
    document.getElementById('svgElem'),
    svgDisplay,
    cred.editBehavior.all
  );
  svgDisplay.selectItem(svgItem);

  expect(layout.selectedItem(cred.locale.english)).toBe(svgItem);
});

test('SvgLayout.populate with single dialog resource', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()]
    ])
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.populate(collectHtmlDisplayElements());

  expect(spyOnLayoutDisplay(layout, cred.locale.english)).toBeDefined();
  expect(spyOnLayoutDisplay(layout, cred.locale.german)).toBeUndefined();
  expect(spyOnLayoutDisplay(layout, cred.locale.japanese)).toBeUndefined();
  expect(spyOnLayoutDisplay(layout, cred.locale.any)).toBeUndefined();
  const svgElems = document.getElementsByTagName('svg');
  expect(svgElems.length).toEqual(1);
});

test('SvgLayout.populate with multiple dialog resources', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.any, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.german, makeDialogResourceForSvgDisplayTests()]
    ])
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.populate(collectHtmlDisplayElements());

  expect(spyOnLayoutDisplay(layout, cred.locale.english)).toBeDefined();
  expect(spyOnLayoutDisplay(layout, cred.locale.german)).toBeDefined();
  expect(spyOnLayoutDisplay(layout, cred.locale.japanese)).toBeUndefined();
  expect(spyOnLayoutDisplay(layout, cred.locale.any)).toBeDefined();
  const svgElems = document.getElementsByTagName('svg');
  expect(svgElems.length).toEqual(3);
});

test('SvgLayout.clear', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()]
    ])
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.populate(collectHtmlDisplayElements());
  layout.clear();

  for (const locale in cred.locale) {
    expect(spyOnLayoutDisplay(layout, locale)).toBeUndefined();
  }
  const svgElems = document.getElementsByTagName('svg');
  expect(svgElems.length).toEqual(0);
});

test('SvgLayout.notifyItemSelected', () => {
  const [layout, controllerMock] = setupSvgLayoutTestEnv();
  layout.notifyItemSelected({});

  expect(controllerMock.notifyItemSelected).toBeCalled();
});

test('SvgLayout.notifySelectionCleared', () => {
  const [layout, controllerMock] = setupSvgLayoutTestEnv();
  layout.notifySelectionCleared();

  expect(controllerMock.notifySelectionCleared).toBeCalled();
});

test('SvgLayout.notifyItemBoundsModified for a linked locale', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.any, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.german, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.japanese, makeDialogResourceForSvgDisplayTests()]
    ]),
    currentLocale: cred.locale.english,
    linkedLocales: [cred.locale.any, cred.locale.english, cred.locale.japanese]
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.populate(collectHtmlDisplayElements());

  const activeDisplay = spyOnLayoutDisplay(layout, controllerConfig.currentLocale);
  const activeDlgItem = activeDisplay.findItemWithId('mydlg');
  activeDisplay.selectItem(activeDlgItem);

  const originalBounds = activeDlgItem.bounds;
  const modifiedBounds = new geom.Rect(0, 0, 100, 80);
  layout.notifyItemBoundsModified(modifiedBounds);

  // Local function that returns the bounds of the dialog item for a given locale.
  const dlgItemBounds = function(locale) {
    const dlgItem = spyOnLayoutDisplay(layout, locale).findItemWithId('mydlg');
    return dlgItem.bounds;
  };
  // Dialog items of linked locales should have modified bounds. Note that the
  // dialog item for the active locale still has the original bounds! The reason
  // is that SvgLayout.notifyItemBoundsModified get called from within the layout
  // component, so in a real workflow the modification has already been applied
  // to the active item. Of course, in our test this has not actually happened.
  expect(dlgItemBounds(cred.locale.any)).toEqual(modifiedBounds);
  expect(dlgItemBounds(cred.locale.english)).toEqual(originalBounds);
  expect(dlgItemBounds(cred.locale.german)).toEqual(originalBounds);
  expect(dlgItemBounds(cred.locale.japanese)).toEqual(modifiedBounds);
});

test('SvgLayout.notifyItemBoundsModified for an unlinked locale', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.any, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.german, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.japanese, makeDialogResourceForSvgDisplayTests()]
    ]),
    currentLocale: cred.locale.english,
    linkedLocales: [cred.locale.any, cred.locale.japanese]
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.populate(collectHtmlDisplayElements());

  const activeDisplay = spyOnLayoutDisplay(layout, controllerConfig.currentLocale);
  const activeDlgItem = activeDisplay.findItemWithId('mydlg');
  activeDisplay.selectItem(activeDlgItem);

  const originalBounds = activeDlgItem.bounds;
  const modifiedBounds = new geom.Rect(0, 0, 100, 80);
  layout.notifyItemBoundsModified(modifiedBounds);

  // Local function that returns the bounds of the dialog item for a given locale.
  const dlgItemBounds = function(locale) {
    const dlgItem = spyOnLayoutDisplay(layout, locale).findItemWithId('mydlg');
    return dlgItem.bounds;
  };
  // Dialog items of other locales should have the original bounds. Note that the
  // dialog item for the active locale still has the original bounds! The reason
  // is that SvgLayout.notifyItemBoundsModified get called from within the layout
  // component, so in a real workflow the modification has already been applied
  // to the active item. Of course, in our test this has not actually happened.
  expect(dlgItemBounds(cred.locale.any)).toEqual(originalBounds);
  expect(dlgItemBounds(cred.locale.english)).toEqual(originalBounds);
  expect(dlgItemBounds(cred.locale.german)).toEqual(originalBounds);
  expect(dlgItemBounds(cred.locale.japanese)).toEqual(originalBounds);
});

test('SvgLayout.onDialogLoadedNotification', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.any, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.german, makeDialogResourceForSvgDisplayTests()]
    ])
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.onDialogLoadedNotification();

  expect(spyOnLayoutDisplay(layout, cred.locale.english)).toBeDefined();
  expect(spyOnLayoutDisplay(layout, cred.locale.german)).toBeDefined();
  expect(spyOnLayoutDisplay(layout, cred.locale.japanese)).toBeUndefined();
  expect(spyOnLayoutDisplay(layout, cred.locale.any)).toBeDefined();
  const svgElems = document.getElementsByTagName('svg');
  expect(svgElems.length).toEqual(3);
});

test('SvgLayout.onItemBoundsModifiedNotification for a linked locale', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.any, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.german, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.japanese, makeDialogResourceForSvgDisplayTests()]
    ]),
    currentLocale: cred.locale.english,
    linkedLocales: [cred.locale.any, cred.locale.english, cred.locale.japanese]
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.populate(collectHtmlDisplayElements());

  const activeDisplay = spyOnLayoutDisplay(layout, controllerConfig.currentLocale);
  const activeDlgItem = activeDisplay.findItemWithId('mydlg');
  activeDisplay.selectItem(activeDlgItem);

  const originalBounds = activeDlgItem.bounds;
  const modifiedBounds = new geom.Rect(0, 0, 100, 80);
  layout.onItemBoundsModifiedNotification(modifiedBounds);

  // Local function that returns the bounds of the dialog item for a given locale.
  const dlgItemBounds = function(locale) {
    const dlgItem = spyOnLayoutDisplay(layout, locale).findItemWithId('mydlg');
    return dlgItem.bounds;
  };
  // Dialog items of linked locales should have modified bounds. Note that the
  // dialog item for the active locale also got changed to the modified bounds.
  // The reason is that SvgLayout.onItemBoundsModifiedNotification gets called from
  // an external component to let the layout know about the modification. So,
  // the active item has to be changed, too.
  expect(dlgItemBounds(cred.locale.any)).toEqual(modifiedBounds);
  expect(dlgItemBounds(cred.locale.english)).toEqual(modifiedBounds);
  expect(dlgItemBounds(cred.locale.german)).toEqual(originalBounds);
  expect(dlgItemBounds(cred.locale.japanese)).toEqual(modifiedBounds);
});

test('SvgLayout.onItemBoundsModifiedNotification for an unlinked locale', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.any, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.german, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.japanese, makeDialogResourceForSvgDisplayTests()]
    ]),
    currentLocale: cred.locale.english,
    linkedLocales: [cred.locale.any, cred.locale.japanese]
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.populate(collectHtmlDisplayElements());

  const activeDisplay = spyOnLayoutDisplay(layout, controllerConfig.currentLocale);
  const activeDlgItem = activeDisplay.findItemWithId('mydlg');
  activeDisplay.selectItem(activeDlgItem);

  const originalBounds = activeDlgItem.bounds;
  const modifiedBounds = new geom.Rect(0, 0, 100, 80);
  layout.onItemBoundsModifiedNotification(modifiedBounds);

  // Local function that returns the bounds of the dialog item for a given locale.
  const dlgItemBounds = function(locale) {
    const dlgItem = spyOnLayoutDisplay(layout, locale).findItemWithId('mydlg');
    return dlgItem.bounds;
  };
  // Dialog items of other locales should have the original bounds. Note that the
  // dialog item for the active locale also got changed to the modified bounds.
  // The reason is that SvgLayout.onItemBoundsModifiedNotification gets called from
  // an external component to let the layout know about the modification. So,
  // the active item has to be changed, too.
  expect(dlgItemBounds(cred.locale.any)).toEqual(originalBounds);
  expect(dlgItemBounds(cred.locale.english)).toEqual(modifiedBounds);
  expect(dlgItemBounds(cred.locale.german)).toEqual(originalBounds);
  expect(dlgItemBounds(cred.locale.japanese)).toEqual(originalBounds);
});

test('SvgLayout.onLinkedToMasterModifiedNotification to unlink locale', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.any, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.german, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.japanese, makeDialogResourceForSvgDisplayTests()]
    ]),
    currentLocale: cred.locale.english,
    linkedLocales: [cred.locale.any, cred.locale.english, cred.locale.japanese]
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.populate(collectHtmlDisplayElements());

  const originalDisplays = new Map();
  for (const locale of cred.locale) {
    originalDisplays.set(locale, spyOnLayoutDisplay(layout, locale));
  }

  layout.onLinkedToMasterModifiedNotification(false);

  // The displays for the active and the master locale should have been
  // rebuild.
  expect(spyOnLayoutDisplay(layout, cred.locale.any)).not.toBe(
    originalDisplays.get(cred.locale.any)
  );
  expect(spyOnLayoutDisplay(layout, cred.locale.english)).not.toBe(
    originalDisplays.get(cred.locale.english)
  );
  expect(spyOnLayoutDisplay(layout, cred.locale.german)).toBe(
    originalDisplays.get(cred.locale.german)
  );
  expect(spyOnLayoutDisplay(layout, cred.locale.japanese)).toBe(
    originalDisplays.get(cred.locale.japanese)
  );
});

test('SvgLayout.onLinkedToMasterModifiedNotification to link locale', () => {
  const controllerConfig = {
    dialogResources: new Map([
      [cred.locale.any, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.english, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.german, makeDialogResourceForSvgDisplayTests()],
      [cred.locale.japanese, makeDialogResourceForSvgDisplayTests()]
    ]),
    currentLocale: cred.locale.english,
    linkedLocales: [cred.locale.any, cred.locale.japanese]
  };
  const [layout] = setupSvgLayoutTestEnv(controllerConfig);

  layout.populate(collectHtmlDisplayElements());

  const originalDisplays = new Map();
  for (const locale of cred.locale) {
    originalDisplays.set(locale, spyOnLayoutDisplay(layout, locale));
  }

  layout.onLinkedToMasterModifiedNotification(true);

  // The displays for the active and the master locale should have been
  // rebuild.
  expect(spyOnLayoutDisplay(layout, cred.locale.any)).not.toBe(
    originalDisplays.get(cred.locale.any)
  );
  expect(spyOnLayoutDisplay(layout, cred.locale.english)).not.toBe(
    originalDisplays.get(cred.locale.english)
  );
  expect(spyOnLayoutDisplay(layout, cred.locale.german)).toBe(
    originalDisplays.get(cred.locale.german)
  );
  expect(spyOnLayoutDisplay(layout, cred.locale.japanese)).toBe(
    originalDisplays.get(cred.locale.japanese)
  );
});
