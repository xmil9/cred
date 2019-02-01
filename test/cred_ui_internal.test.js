//
// Tests for the internal functionality of the UI module.
//
'use strict';

var $ = require('jquery');
var cred = require('../cred_types');
cred.spec = require('../dlg_spec');
cred.ui_internal = require('../cred_ui_internal');

///////////////////

// Mocks property objects.
class PropertyMock {
  constructor(value, label, type) {
    this.value = value;
    this.label = label;
    this.type = type;
  }

  isSet(val) {
    return this.value === val;
  }
}

// Mocks property spec objects.
class PropertySpecMock {
  constructor(displayedLabel, label) {
    this.displayedLabel = displayedLabel;
    this.label = label;
    this.tags = [];
  }

  isModifiable() {
    return true;
  }
}

// Mocks controller objects.
class ControllerMock {
  constructor(locale, isLinked) {
    this.currentLocale = locale;
    this._isLinked = isLinked;
    this.notifyItemPropertyModifiedCalled = false;
    this.notifyItemLocalizedStringPropertyModifiedCalled = false;
    this.notifyItemFlagPropertyModifiedCalled = false;
    this.notifyItemIdModifiedCalled = false;
    this.notifyItemBoundsModifiedCalled = false;
    this.notifyLinkedToMasterModifiedCalled = false;
  }

  lookupString() {
    return 'localized text';
  }

  isLinkedToMaster() {
    return this._isLinked;
  }

  notifyItemPropertyModified() {
    this.notifyItemPropertyModifiedCalled = true;
  }

  notifyItemLocalizedStringPropertyModified() {
    this.notifyItemLocalizedStringPropertyModifiedCalled = true;
  }

  notifyItemFlagPropertyModified() {
    this.notifyItemFlagPropertyModifiedCalled = true;
  }

  notifyItemIdModified() {
    this.notifyItemIdModifiedCalled = true;
  }

  notifyItemBoundsModified() {
    this.notifyItemBoundsModifiedCalled = true;
  }

  notifyLinkedToMasterModified() {
    this.notifyLinkedToMasterModifiedCalled = true;
  }
}

// Mocks SVG item objects.
class SvgItemMock {
  constructor(definition, spec) {
    this._spec = spec;
    this._definition = definition;
  }

  itemSpec() {
    return this._spec;
  }

  resource() {
    return this._definition;
  }
}

// Mocks the definition of resource objects.
class ResourceDefinitinMock {
  constructor() {}

  property(label) {
    return new PropertyMock('100', 'My ' + label, cred.spec.physicalPropertyType.string);
  }
}

// Checks whether a given image checkbox for a global/local context indicator
// is set to indicate local content.
function hasLocalContext($globalImageCheckbox) {
  // The local edit context is indicated by 'checked' as class attribute.
  return $globalImageCheckbox.hasClass('checked');
}

// Checks whether the state of a given image checkbox for a global/local context
// indicator can be switched.
function canSwitchContext($globalImageCheckbox) {
  // Class attribute 'disabled' indicates that the context cannot be switched.
  return !$globalImageCheckbox.hasClass('disabled');
}

///////////////////

test('makeHtmlFlagId', () => {
  expect(cred.ui_internal.makeHtmlFlagId('Test')).toEqual('Test-flag');
});

test('makeHtmlImageCheckboxId', () => {
  expect(cred.ui_internal.makeHtmlImageCheckboxId('Test')).toEqual('Test-global');
});

test('localeFromContentId', () => {
  expect(cred.ui_internal.localeFromContentId('master-tab')).toEqual(cred.locale.any);
  expect(cred.ui_internal.localeFromContentId('en-tab')).toEqual(cred.locale.english);
  expect(cred.ui_internal.localeFromContentId('de-tab')).toEqual(cred.locale.german);
  expect(cred.ui_internal.localeFromContentId('jp-tab')).toEqual(cred.locale.japanese);
});

test('localeFromContentId for invalid content id', () => {
  expect(() => cred.ui_internal.localFromContentId('invalid')).toThrow();
});

test('contentIdFromHtmlElement', () => {
  document.body.innerHTML =
    '<button class="tab" data-contentid="master-tab">Master</button>';
  expect(
    cred.ui_internal.contentIdFromHtmlElement(document.getElementsByClassName('tab'))
  ).toEqual('master-tab');
});

test('contentIdFromHtmlElement when contentid is not defined as custom data', () => {
  document.body.innerHTML = '<button class="tab">Master</button>';
  expect(
    cred.ui_internal.contentIdFromHtmlElement(document.getElementsByClassName('tab'))
  ).toBeUndefined();
});

///////////////////

// Sets up a test environment for property component tests.
// Returns a Jquery element that tests can append other elements to.
function setupPropertyComponentTestEnv() {
  document.body.innerHTML = '<div id="root"></div>';
  return $('#root');
}

test('PropertyComponent constructor', () => {
  const prop = new PropertyMock();
  const spec = new PropertySpecMock();
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);

  expect(comp.propertyDefinition).toBe(prop);
  expect(comp.propertySpec).toBe(spec);
});

test('PropertyComponent constructor with missing arguments', () => {
  expect(() => new cred.ui_internal.PropertyComponent()).toThrow();
  expect(() => new cred.ui_internal.PropertyComponent('arg 1')).toThrow();
});

test('PropertyComponent.propertyDefinition', () => {
  const prop = new PropertyMock();
  const spec = new PropertySpecMock();
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);

  expect(comp.propertyDefinition).toBe(prop);
});

test('PropertyComponent.propertySpec', () => {
  const prop = new PropertyMock();
  const spec = new PropertySpecMock();
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);

  expect(comp.propertySpec).toBe(spec);
});

test('PropertyComponent.buildComponentContainerElement', () => {
  const prop = new PropertyMock();
  const spec = new PropertySpecMock();
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const elem = comp.buildComponentContainerElement();

  expect(elem).toBeDefined();
  expect($(elem).hasClass('component-container')).toBeTruthy();
  expect($('.component-container')).toBeDefined();
});

test('PropertyComponent.buildLineContainerElement', () => {
  const prop = new PropertyMock();
  const spec = new PropertySpecMock();
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildLineContainerElement();

  expect($elem).toBeDefined();
  expect($elem.hasClass('line-container')).toBeTruthy();
  expect($('.line-container')).toBeDefined();
});

test('PropertyComponent.buildBlockContainerElement', () => {
  const prop = new PropertyMock();
  const spec = new PropertySpecMock();
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildBlockContainerElement();

  expect($elem).toBeDefined();
  expect($elem.hasClass('block-container')).toBeTruthy();
  expect($('.block-container')).toBeDefined();
});

test('PropertyComponent.buildLabelElement', () => {
  const prop = new PropertyMock();
  const spec = new PropertySpecMock('Test');
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildLabelElement();

  expect($elem).toBeDefined();
  expect($elem.is('label')).toBeTruthy();
  expect($elem.text()).toEqual('Test:');
});

test('PropertyComponent.buildInputElement', () => {
  const prop = new PropertyMock();
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.text);
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildInputElement('text', 'test text');

  expect($elem).toBeDefined();
  expect($elem.is('input')).toBeTruthy();
  expect($elem.val()).toEqual('test text');
});

test('PropertyComponent.buildInputElement with class tags', () => {
  const prop = new PropertyMock();
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.text);
  spec.tags = ['tagA', 'tagB'];
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildInputElement('text', 'test text');

  expect($elem).toBeDefined();
  expect($elem.is('input')).toBeTruthy();
  expect($elem.val()).toEqual('test text');
  expect($elem.hasClass('tagA')).toBeTruthy();
  expect($elem.hasClass('tagB')).toBeTruthy();
});

test('PropertyComponent.buildCheckboxElement that is checked', () => {
  const prop = new PropertyMock(true);
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.text);
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildCheckboxElement();

  expect($elem).toBeDefined();
  expect($elem.is('input')).toBeTruthy();
  expect($elem.is(':checked')).toBeTruthy();
});

test('PropertyComponent.buildCheckboxElement that is not checked', () => {
  const prop = new PropertyMock(false);
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.text);
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildCheckboxElement();

  expect($elem).toBeDefined();
  expect($elem.is('input')).toBeTruthy();
  expect($elem.is(':checked')).toBeFalsy();
});

test('PropertyComponent.buildCheckboxElement with classes', () => {
  const prop = new PropertyMock(true);
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.text);
  spec.tags = ['tagA', 'tagB'];
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildCheckboxElement();

  expect($elem).toBeDefined();
  expect($elem.is('input')).toBeTruthy();
  expect($elem.hasClass('tagA')).toBeTruthy();
  expect($elem.hasClass('tagB')).toBeTruthy();
});

test('PropertyComponent.buildEnumElement', () => {
  const prop = new PropertyMock('valB');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const enums = [
    { display: 'Value A', value: 'valA' },
    { display: 'Value B', value: 'valB' }
  ];
  const $elem = comp.buildEnumElement(enums);

  expect($elem).toBeDefined();
  expect($elem.is('select')).toBeTruthy();
  const elem = $elem[0];
  expect(elem.length).toEqual(2);
  expect(elem.options[0].text).toEqual('Value A');
  expect(elem.options[0].value).toEqual('valA');
  expect(elem.options[1].text).toEqual('Value B');
  expect(elem.options[1].value).toEqual('valB');
  expect(elem.selectedIndex).toEqual(1);
});

test('PropertyComponent.buildEnumElement without enums', () => {
  const prop = new PropertyMock('valB');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const enums = [];
  const $elem = comp.buildEnumElement(enums);

  expect($elem).toBeDefined();
  expect($elem.is('select')).toBeTruthy();
  const elem = $elem[0];
  expect(elem.length).toEqual(0);
  expect(elem.selectedIndex).toEqual(-1);
});

test('PropertyComponent.buildCheckboxElement with classes', () => {
  const prop = new PropertyMock(true);
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.text);
  spec.tags = ['tagA', 'tagB'];
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const enums = [
    { display: 'Value A', value: 'valA' },
    { display: 'Value B', value: 'valB' }
  ];
  const $elem = comp.buildEnumElement(enums);

  expect($elem).toBeDefined();
  expect($elem.is('select')).toBeTruthy();
  expect($elem.hasClass('tagA')).toBeTruthy();
  expect($elem.hasClass('tagB')).toBeTruthy();
});

test('PropertyComponent.buildFlagsElement', () => {
  const prop = new PropertyMock('ValB');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const flags = [
    { display: 'Value A', textValue: 'ValA', numbericValue: 1 },
    { display: 'Value B', textValue: 'ValB', numbericValue: 2 }
  ];
  const $elem = comp.buildFlagsElement(flags);

  // Attach created element to DOM so that we can query for its children.
  const $root = setupPropertyComponentTestEnv();
  $root.append($elem);

  expect($elem).toBeDefined();
  expect($elem.is('fieldset')).toBeTruthy();
  for (const flagText of ['ValA', 'ValB']) {
    const flagElem = document.getElementById(cred.ui_internal.makeHtmlFlagId(flagText));
    expect(flagElem).toBeTruthy();
    expect($(flagElem).is('input')).toBeTruthy();
    expect($(flagElem).is(':checked')).toEqual(flagText === 'ValB');
  }
});

test('PropertyComponent.buildFlagsElement with classes', () => {
  const prop = new PropertyMock('ValB');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.tags = ['tagA', 'tagB'];
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const flags = [
    { display: 'Value A', textValue: 'ValA', numbericValue: 1 },
    { display: 'Value B', textValue: 'ValB', numbericValue: 2 }
  ];
  const $elem = comp.buildFlagsElement(flags);

  expect($elem).toBeDefined();
  expect($elem.is('fieldset')).toBeTruthy();
  expect($elem.hasClass('tagA')).toBeTruthy();
  expect($elem.hasClass('tagB')).toBeTruthy();
});

test('PropertyComponent.buildGlobalImageCheckboxElement with local-only context', () => {
  const prop = new PropertyMock(undefined, 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildGlobalImageCheckboxElement();

  expect($elem).toBeDefined();
  expect($elem.is('div')).toBeTruthy();
  expect(hasLocalContext($elem)).toBeTruthy();
  expect(canSwitchContext($elem)).toBeFalsy();
});

test('PropertyComponent.buildGlobalImageCheckboxElement with local-default context', () => {
  const prop = new PropertyMock(undefined, 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localDefault;
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildGlobalImageCheckboxElement();

  expect($elem).toBeDefined();
  expect($elem.is('div')).toBeTruthy();
  expect(hasLocalContext($elem)).toBeTruthy();
  expect(canSwitchContext($elem)).toBeTruthy();
});

test('PropertyComponent.buildGlobalImageCheckboxElement with gobal-only context', () => {
  const prop = new PropertyMock(undefined, 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.globalOnly;
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildGlobalImageCheckboxElement();

  expect($elem).toBeDefined();
  expect($elem.is('div')).toBeTruthy();
  expect(hasLocalContext($elem)).toBeFalsy();
  expect(canSwitchContext($elem)).toBeFalsy();
});

test('PropertyComponent.buildGlobalImageCheckboxElement with gobal-default context', () => {
  const prop = new PropertyMock(undefined, 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.globalDefault;
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildGlobalImageCheckboxElement();

  expect($elem).toBeDefined();
  expect($elem.is('div')).toBeTruthy();
  expect(hasLocalContext($elem)).toBeFalsy();
  expect(canSwitchContext($elem)).toBeTruthy();
});

test('PropertyComponent.buildGlobalImageCheckboxElement allows switching between contexts', () => {
  const prop = new PropertyMock(undefined, 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.globalDefault;
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildGlobalImageCheckboxElement();

  // Attach created element to DOM so that we can trigger events.
  const $root = setupPropertyComponentTestEnv();
  $root.append($elem);

  // Initially the context is global.
  expect(hasLocalContext($elem)).toBeFalsy();

  $elem.click();
  expect(hasLocalContext($elem)).toBeTruthy();

  $elem.click();
  expect(hasLocalContext($elem)).toBeFalsy();
});

test('PropertyComponent.buildGlobalImageCheckboxElement prevents switching between contexts for global-only', () => {
  const prop = new PropertyMock(undefined, 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.globalOnly;
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildGlobalImageCheckboxElement();

  // Attach created element to DOM so that we can trigger events.
  const $root = setupPropertyComponentTestEnv();
  $root.append($elem);

  expect(hasLocalContext($elem)).toBeFalsy();
  $elem.click();
  expect(hasLocalContext($elem)).toBeFalsy();
});

test('PropertyComponent.buildGlobalImageCheckboxElement prevents switching between contexts for local-only', () => {
  const prop = new PropertyMock(undefined, 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const comp = new cred.ui_internal.PropertyComponent(prop, spec);
  const $elem = comp.buildGlobalImageCheckboxElement();

  // Attach created element to DOM so that we can trigger events.
  const $root = setupPropertyComponentTestEnv();
  $root.append($elem);

  expect(hasLocalContext($elem)).toBeTruthy();
  $elem.click();
  expect(hasLocalContext($elem)).toBeTruthy();
});

///////////////////

test('PropertyComponentBuilder creation', () => {
  expect(
    new cred.ui_internal.PropertyComponentBuilder(new ControllerMock())
  ).toBeDefined();
});

test('PropertyComponentBuilder.buildIntegerComponent', () => {
  const prop = new PropertyMock('100', 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const builder = new cred.ui_internal.PropertyComponentBuilder(new ControllerMock());
  const component = builder.buildIntegerComponent(prop, spec, $root);

  expect(component).toBeDefined();
  // Check that a number input element got created in the DOM.
  const $inputs = $('input');
  expect($inputs.length).toEqual(1);
  expect($inputs[0].type).toEqual('number');
});

test('PropertyComponentBuilder.buildIntegerComponent rounding entered values', () => {
  const prop = new PropertyMock('100', 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const builder = new cred.ui_internal.PropertyComponentBuilder(new ControllerMock());
  builder.buildIntegerComponent(prop, spec, $root);

  const $input = $('input');
  $input.val('1.1111');
  $input.trigger('change');
  expect($input.val()).toEqual('1');

  $input.val('1.8');
  $input.trigger('change');
  expect($input.val()).toEqual('2');
});

test('PropertyComponentBuilder.buildFloatingPointComponent', () => {
  const prop = new PropertyMock('100', 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const builder = new cred.ui_internal.PropertyComponentBuilder(new ControllerMock());
  const component = builder.buildFloatingPointComponent(prop, spec, $root);

  expect(component).toBeDefined();
  // Check that a number input element got created in the DOM.
  const $inputs = $('input');
  expect($inputs.length).toEqual(1);
  expect($inputs[0].type).toEqual('number');
});

test('PropertyComponentBuilder.buildIdentifierComponent', () => {
  const prop = new PropertyMock('100', 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const builder = new cred.ui_internal.PropertyComponentBuilder(new ControllerMock());
  const component = builder.buildIdentifierComponent(prop, spec, $root);

  expect(component).toBeDefined();
  // Check that a text input element got created in the DOM.
  const $inputs = $('input');
  expect($inputs.length).toEqual(1);
  expect($inputs[0].type).toEqual('text');
});

test('PropertyComponentBuilder.buildStringComponent', () => {
  const prop = new PropertyMock('100', 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const builder = new cred.ui_internal.PropertyComponentBuilder(new ControllerMock());
  const component = builder.buildStringComponent(prop, spec, $root);

  expect(component).toBeDefined();
  // Check that a text input element got created in the DOM.
  const $inputs = $('input');
  expect($inputs.length).toEqual(1);
  expect($inputs[0].type).toEqual('text');
});

test('PropertyComponentBuilder.buildLocalizedStringComponent', () => {
  const prop = new PropertyMock(
    '100',
    'myimagebox',
    cred.spec.physicalPropertyType.string
  );
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const controller = new ControllerMock(cred.locale.english);
  const builder = new cred.ui_internal.PropertyComponentBuilder(controller);
  const component = builder.buildLocalizedStringComponent(prop, spec, $root);

  expect(component).toBeDefined();
  // Check that a text input element got created in the DOM.
  const $inputs = $('input');
  expect($inputs.length).toEqual(1);
  expect($inputs[0].type).toEqual('text');
});

test('PropertyComponentBuilder.buildLocalizedStringComponent with localized string', () => {
  const prop = new PropertyMock(
    '100',
    'myimagebox',
    // Setting the property type to identifier should trigger the lookup for a localized
    // string.
    cred.spec.physicalPropertyType.identifier
  );
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const controller = new ControllerMock(cred.locale.english);
  const builder = new cred.ui_internal.PropertyComponentBuilder(controller);
  builder.buildLocalizedStringComponent(prop, spec, $root);

  const $input = $('input');
  expect($input.val()).toEqual('localized text');
});

test('PropertyComponentBuilder.buildLocalizedStringComponent disabled for master locale', () => {
  const prop = new PropertyMock(
    '100',
    'myimagebox',
    cred.spec.physicalPropertyType.identifier
  );
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  // Setting the master locale as active should disable the component.
  const controller = new ControllerMock(cred.locale.any);
  const builder = new cred.ui_internal.PropertyComponentBuilder(controller);
  builder.buildLocalizedStringComponent(prop, spec, $root);

  const $input = $('input');
  expect($input.is(':disabled')).toBeTruthy();
});

test('PropertyComponentBuilder.buildLocalizedStringComponent enabled for language locale', () => {
  const prop = new PropertyMock(
    '100',
    'myimagebox',
    cred.spec.physicalPropertyType.identifier
  );
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  // Setting the german locale as active should enable the component.
  const controller = new ControllerMock(cred.locale.german);
  const builder = new cred.ui_internal.PropertyComponentBuilder(controller);
  builder.buildLocalizedStringComponent(prop, spec, $root);

  const $input = $('input');
  expect($input.is(':disabled')).toBeFalsy();
});

test('PropertyComponentBuilder.buildBooleanComponent', () => {
  const prop = new PropertyMock('100', 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const builder = new cred.ui_internal.PropertyComponentBuilder(new ControllerMock());
  const component = builder.buildBooleanComponent(prop, spec, $root);

  expect(component).toBeDefined();
  // Check that a checkbox input element got created in the DOM.
  const $inputs = $('input');
  expect($inputs.length).toEqual(1);
  expect($inputs[0].type).toEqual('checkbox');
});

test('PropertyComponentBuilder.buildEnumComponent', () => {
  const prop = new PropertyMock('100', 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const builder = new cred.ui_internal.PropertyComponentBuilder(new ControllerMock());
  const enums = [
    { display: 'Value A', value: 'valA' },
    { display: 'Value B', value: 'valB' }
  ];
  const component = builder.buildEnumComponent(prop, spec, $root, enums);

  expect(component).toBeDefined();
  // Check that a select element got created in the DOM.
  const $selects = $('select');
  expect($selects.length).toEqual(1);
  expect($selects[0].options[0].text).toEqual('Value A');
  expect($selects[0].options[1].text).toEqual('Value B');
});

test('PropertyComponentBuilder.buildFlagsComponent', () => {
  const prop = new PropertyMock('100', 'myimagebox');
  const spec = new PropertySpecMock('Test', cred.spec.propertyLabel.enabled);
  spec.editContext = cred.editContext.localOnly;
  const $root = setupPropertyComponentTestEnv();
  const builder = new cred.ui_internal.PropertyComponentBuilder(new ControllerMock());
  const flags = [
    { display: 'Value A', textValue: 'ValA', numbericValue: 1 },
    { display: 'Value B', textValue: 'ValB', numbericValue: 2 }
  ];
  const component = builder.buildFlagsComponent(prop, spec, $root, flags);

  expect(component).toBeDefined();
  // Check that a fieldset element got created in the DOM.
  const $fieldsets = $('fieldset');
  expect($fieldsets.length).toEqual(1);
});

///////////////////

// Sets up a test environment for PropertyPane tests.
function setupPropertyPaneTestEnv() {
  document.body.innerHTML =
    '<div id="property-pane">' +
    '  <div id="item-title">Properties</div>' +
    '  <div id="property-list"></div>' +
    '</div>';
}

test('PropertyPane.controller', () => {
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  expect(pane.controller).toBe(controller);
});

test('PropertyPane.populate', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  pane.populate(item);

  const $titleElem = $('#item-title');
  expect($titleElem.text()).toEqual('Dialog Properties');
  const $props = $('#property-list');
  expect($props.children().length).toBeGreaterThan(0);
});

test('PropertyPane notify controller when a property changes', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  pane.populate(item);

  const $elem = $('#FontSize-property');
  $elem.text('22');
  $elem.trigger('change');

  expect(controller.notifyItemPropertyModifiedCalled).toBeTruthy();
});

test('PropertyPane notify controller when a localized string property changes', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  pane.populate(item);

  const $elem = $('#Text-property');
  $elem.text('new text');
  $elem.trigger('change');

  expect(controller.notifyItemLocalizedStringPropertyModified).toBeTruthy();
});

test('PropertyPane notify controller when a boolean property changes', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  pane.populate(item);

  const $elem = $('#KillPopup-property');
  $elem.prop('checked', true);
  $elem.trigger('change');

  expect(controller.notifyItemPropertyModifiedCalled).toBeTruthy();
});

test('PropertyPane notify controller when a flags property changes', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  pane.populate(item);

  const $elem = $('#WS_CHILD-flag');
  $elem.prop('checked', true);
  $elem.trigger('change');

  expect(controller.notifyItemFlagPropertyModified).toBeTruthy();
});

test('PropertyPane notify controller when a id property changes', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  pane.populate(item);

  const $elem = $('#ResourceName-property');
  $elem.text('newId');
  $elem.trigger('change');

  expect(controller.notifyItemIdModified).toBeTruthy();
});

test('PropertyPane notify controller when a bounds property changes', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  pane.populate(item);

  let $elem = $('#Left-property');
  $elem.text('0');
  $elem.trigger('change');

  expect(controller.notifyItemBoundsModified).toBeTruthy();

  $elem = $('#Height-property');
  $elem.text('200');
  $elem.trigger('change');

  expect(controller.notifyItemBoundsModified).toBeTruthy();
});

test('PropertyPane.clear', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  pane.populate(item);

  pane.clear();

  const $titleElem = $('#item-title');
  expect($titleElem.text()).toEqual('Properties');
  const $props = $('#property-list');
  expect($props.children().length).toEqual(0);
});

test('PropertyPane.setBounds', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  pane.populate(item);

  pane.setBounds({ left: 111, top: 222, width: 333, height: 444 });

  const $leftElem = $('#Left-property');
  expect($leftElem.val()).toEqual('111');
  const $topElem = $('#Top-property');
  expect($topElem.val()).toEqual('222');
  const $widthElem = $('#Width-property');
  expect($widthElem.val()).toEqual('333');
  const $heightElem = $('#Height-property');
  expect($heightElem.val()).toEqual('444');
});

test('PropertyPane.update for selected item', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  const resDef = new ResourceDefinitinMock();
  const spec = cred.spec.makeDialogSpec();
  const item = new SvgItemMock(resDef, spec);
  controller.selectedItem = item;

  pane.update();

  const $titleElem = $('#item-title');
  expect($titleElem.text()).toEqual('Dialog Properties');
  const $props = $('#property-list');
  expect($props.children().length).toBeGreaterThan(0);
});

test('PropertyPane.update for no item', () => {
  setupPropertyPaneTestEnv();
  const controller = new ControllerMock();
  const pane = new cred.ui_internal.PropertyPane(controller);
  controller.selectedItem = undefined;

  pane.update();

  const $titleElem = $('#item-title');
  expect($titleElem.text()).toEqual('Properties');
  const $props = $('#property-list');
  expect($props.children().length).toEqual(0);
});

///////////////////

// Sets up a test environment for DisplayHeader tests.
function setupDisplayHeaderTestEnv() {
  document.body.innerHTML =
    '<div id="display-header">' +
    '   <input type="checkbox" id="linked-flag" disabled="">' +
    '   <label>Linked to Master</label>' +
    '</div>';
}

test('DisplayHeader notifies controller about changes in linked-to-master state', () => {
  setupDisplayHeaderTestEnv();
  const controller = new ControllerMock();
  const header = new cred.ui_internal.DisplayHeader(controller);
  header.setup();

  const $linkedFlag = $('#linked-flag');
  $linkedFlag.prop('checked', true);
  $linkedFlag.trigger('change');

  expect(controller.notifyLinkedToMasterModifiedCalled).toBeTruthy();
});

test('DisplayHeader.controller', () => {
  setupDisplayHeaderTestEnv();
  const controller = new ControllerMock();
  const header = new cred.ui_internal.DisplayHeader(controller);

  expect(header.controller).toBe(controller);
});

test('DisplayHeader linked flag should be checked when current locale is linekd', () => {
  setupDisplayHeaderTestEnv();
  const controller = new ControllerMock(cred.locale.english, true);
  const header = new cred.ui_internal.DisplayHeader(controller);

  header.update();
  const $linkedFlag = $('#linked-flag');

  expect($linkedFlag.is(':checked')).toBeTruthy();
});

test('DisplayHeader linked flag should not be checked when current locale is not linekd', () => {
  setupDisplayHeaderTestEnv();
  const controller = new ControllerMock(cred.locale.english, false);
  const header = new cred.ui_internal.DisplayHeader(controller);

  header.update();
  const $linkedFlag = $('#linked-flag');

  expect($linkedFlag.is(':checked')).toBeFalsy();
});

test('DisplayHeader linked flag should be enabled when current locale is not the master locale', () => {
  setupDisplayHeaderTestEnv();
  const controller = new ControllerMock(cred.locale.english, true);
  const header = new cred.ui_internal.DisplayHeader(controller);

  header.update();
  const $linkedFlag = $('#linked-flag');

  expect($linkedFlag.is(':disabled')).toBeFalsy();
});

test('DisplayHeader linked flag should be enabled when current locale is not the master locale', () => {
  setupDisplayHeaderTestEnv();
  const controller = new ControllerMock(cred.locale.any, true);
  const header = new cred.ui_internal.DisplayHeader(controller);

  header.update();
  const $linkedFlag = $('#linked-flag');

  expect($linkedFlag.is(':disabled')).toBeTruthy();
});
