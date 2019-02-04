//
// Tests for dialog specs.
//
'use strict';

var cred = require('../cred_types');
cred.spec = require('../dlg_spec');

///////////////////

test('spec.makePropertySpec', () => {
  for (const type of cred.spec.logicalPropertyType) {
    const spec = cred.spec.makePropertySpec(type, {});
    expect(spec).toBeDefined();
    expect(spec.logicalType).toBe(type);
  }
});

test('spec.makePropertySpec for unknown property type', () => {
  expect(() => cred.spec.makePropertySpec('wrong type', {})).toThrow();
});

test('PropertySpec.label default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.label).toEqual('');
});

test('PropertySpec.label', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
    label: 'test'
  });
  expect(spec.label).toEqual('test');
});

test('PropertySpec.displayedLabel default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.displayedLabel).toEqual('');
});

test('PropertySpec.displayedLabel', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
    displayedLabel: 'test'
  });
  expect(spec.displayedLabel).toEqual('test');
});

test('PropertySpec.isRequired default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.isRequired()).toBeTruthy();
});

test('PropertySpec.isRequired', () => {
  for (const val of [true, false]) {
    const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
      required: val
    });
    expect(spec.isRequired()).toEqual(val);
  }
});

test('PropertySpec.isNullable default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.isNullable()).toBeFalsy();
});

test('PropertySpec.isNullable', () => {
  for (const val of [true, false]) {
    const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
      nullable: val
    });
    expect(spec.isNullable()).toEqual(val);
  }
});

test('PropertySpec.editContext default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.editContext).toEqual(cred.editContext.globalDefault);
});

test('PropertySpec.editContext', () => {
  for (const val of [
    cred.editContext.globalDefault,
    cred.editContext.globalOnly,
    cred.editContext.localDefault,
    cred.editContext.localOnly
  ]) {
    const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
      context: val
    });
    expect(spec.editContext).toEqual(val);
  }
});

test('PropertySpec.isModifiable default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.isModifiable()).toBeTruthy();
});

test('PropertySpec.isModifiable', () => {
  for (const val of [true, false]) {
    const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
      modifiable: val
    });
    expect(spec.isModifiable()).toEqual(val);
  }
});

test('PropertySpec.isLocalized default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.isLocalized()).toBeFalsy();
});

test('PropertySpec.isLocalized', () => {
  for (const val of [true, false]) {
    const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
      localized: val
    });
    expect(spec.isLocalized()).toEqual(val);
  }
});

test('PropertySpec.writeLabeled default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.writeLabeled()).toBeTruthy();
});

test('PropertySpec.writeLabeled', () => {
  for (const val of [true, false]) {
    const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
      writeLabeled: val
    });
    expect(spec.writeLabeled()).toEqual(val);
  }
});

test('PropertySpec.writeAsStringWhenLabeled default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.writeAsStringWhenLabeled()).toBeFalsy();
});

test('PropertySpec.writeAsStringWhenLabeled', () => {
  for (const val of [true, false]) {
    const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
      writeAsStringWhenLabeled: val
    });
    expect(spec.writeAsStringWhenLabeled()).toEqual(val);
  }
});

test('PropertySpec.writeSerialized default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.writeSerialized()).toBeFalsy();
});

test('PropertySpec.writeSerialized', () => {
  for (const val of [true, false]) {
    const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
      writeSerialized: val
    });
    expect(spec.writeSerialized()).toEqual(val);
  }
});

test('PropertySpec.writeAsStringWhenSerialized default', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  expect(spec.writeAsStringWhenSerialized()).toBeFalsy();
});

test('PropertySpec.writeAsStringWhenSerialized', () => {
  for (const val of [true, false]) {
    const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
      writeAsStringWhenSerialized: val
    });
    expect(spec.writeAsStringWhenSerialized()).toEqual(val);
  }
});

test('PropertySpec.logicalType', () => {
  for (const type of cred.spec.logicalPropertyType) {
    expect(cred.spec.makePropertySpec(type, {}).logicalType).toBe(type);
  }
});

test('PropertySpec.tags default', () => {
  for (const type of cred.spec.logicalPropertyType) {
    const spec = cred.spec.makePropertySpec(type, {});
    expect(spec.tags).toEqual([type]);
  }
});

test('PropertySpec.tags for one contextual tag', () => {
  let spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
    tags: ['a']
  });
  expect(spec.tags).toEqual(expect.arrayContaining(['a']));
});

test('PropertySpec.tags for multiple contextual tags', () => {
  let spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {
    tags: ['a', 'b', 'c']
  });
  expect(spec.tags).toEqual(expect.arrayContaining(['a', 'b', 'c']));
});

test('IntegerPropertySpec.buildDomComponent', () => {
  // We want to test that IntegerPropertySpec.buildDomComponent calls a function named
  // buildIntegerComponent on a passed builder object and that it returns the return
  // value of that function.
  const buildComponentMock = jest.fn(() => 'return value');
  const propBuilder = {
    buildIntegerComponent: buildComponentMock
  };
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.integer, {});
  const res = spec.buildDomComponent(propBuilder, {}, {});
  expect(buildComponentMock).toBeCalled();
  expect(res).toBe('return value');
});

test('FloatingPointPropertySpec.buildDomComponent', () => {
  // See comment for IntegerPropertySpec.buildDomComponent.
  const buildComponentMock = jest.fn(() => 'return value');
  const propBuilder = {
    buildFloatingPointComponent: buildComponentMock
  };
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.float, {});
  const res = spec.buildDomComponent(propBuilder, {}, {});
  expect(buildComponentMock).toBeCalled();
  expect(res).toBe('return value');
});

test('StringPropertySpec.buildDomComponent', () => {
  // See comment for IntegerPropertySpec.buildDomComponent.
  const buildComponentMock = jest.fn(() => 'return value');
  const propBuilder = {
    buildStringComponent: buildComponentMock
  };
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.string, {});
  const res = spec.buildDomComponent(propBuilder, {}, {});
  expect(buildComponentMock).toBeCalled();
  expect(res).toBe('return value');
});

test('LocalizedStringPropertySpec.buildDomComponent', () => {
  // See comment for IntegerPropertySpec.buildDomComponent.
  const buildComponentMock = jest.fn(() => 'return value');
  const propBuilder = {
    buildLocalizedStringComponent: buildComponentMock
  };
  const spec = cred.spec.makePropertySpec(
    cred.spec.logicalPropertyType.localizedString,
    {}
  );
  const res = spec.buildDomComponent(propBuilder, {}, {});
  expect(buildComponentMock).toBeCalled();
  expect(res).toBe('return value');
});

test('IdentifierPropertySpec.buildDomComponent', () => {
  // See comment for IntegerPropertySpec.buildDomComponent.
  const buildComponentMock = jest.fn(() => 'return value');
  const propBuilder = {
    buildIdentifierComponent: buildComponentMock
  };
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.identifier, {});
  const res = spec.buildDomComponent(propBuilder, {}, {});
  expect(buildComponentMock).toBeCalled();
  expect(res).toBe('return value');
});

test('BooleanPropertySpec.buildDomComponent', () => {
  // See comment for IntegerPropertySpec.buildDomComponent.
  const buildComponentMock = jest.fn(() => 'return value');
  const propBuilder = {
    buildBooleanComponent: buildComponentMock
  };
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.bool, {});
  const res = spec.buildDomComponent(propBuilder, {}, {});
  expect(buildComponentMock).toBeCalled();
  expect(res).toBe('return value');
});

test('EnumPropertySpec.buildDomComponent', () => {
  // See comment for IntegerPropertySpec.buildDomComponent.
  const buildComponentMock = jest.fn(() => 'return value');
  const propBuilder = {
    buildEnumComponent: buildComponentMock
  };
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.enum, {});
  const res = spec.buildDomComponent(propBuilder, {}, {});
  expect(buildComponentMock).toBeCalled();
  expect(res).toBe('return value');
});

test('FlagsPropertySpec.buildDomComponent', () => {
  // See comment for IntegerPropertySpec.buildDomComponent.
  const buildComponentMock = jest.fn(() => 'return value');
  const propBuilder = {
    buildFlagsComponent: buildComponentMock
  };
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.flags, {});
  const res = spec.buildDomComponent(propBuilder, {}, {});
  expect(buildComponentMock).toBeCalled();
  expect(res).toBe('return value');
});

test('FlagsPropertySpec.haveFlags without flags', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.flags, {});
  expect(spec.haveFlags()).toBeFalsy();
});

test('FlagsPropertySpec.haveFlags with flags', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.flags, {
    flags: [{ textValue: 'test', numericValue: 2, display: 'my flag' }]
  });
  expect(spec.haveFlags()).toBeTruthy();
});

test('FlagsPropertySpec.addFlag', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.flags, {});
  spec.addFlag({ textValue: 'test', numericValue: 2, display: 'my flag' });
  expect(spec.haveFlags()).toBeTruthy();
  expect(spec.hasFlag('test')).toBeTruthy();

  spec.addFlag({ textValue: 'another test', numericValue: 4, display: 'my other flag' });
  expect(spec.hasFlag('another test')).toBeTruthy();
});

test('FlagsPropertySpec.hasFlag', () => {
  const spec = cred.spec.makePropertySpec(cred.spec.logicalPropertyType.flags, {});
  expect(spec.hasFlag('test')).toBeFalsy();

  spec.addFlag({ textValue: 'test', numericValue: 2, display: 'my flag' });
  expect(spec.hasFlag('test')).toBeTruthy();

  spec.addFlag({ textValue: 'another test', numericValue: 4, display: 'my other flag' });
  expect(spec.hasFlag('another test')).toBeTruthy();
});

///////////////////

test('spec.makeControlSpec', () => {
  for (const type of [
    cred.spec.controlType.imagePushButton,
    cred.spec.controlType.label,
    cred.spec.controlType.placeHolder,
    cred.spec.controlType.pushButton,
    cred.spec.controlType.textBox,
    cred.spec.controlType.comboBox,
    cred.spec.controlType.inkButton,
    cred.spec.controlType.slider
  ]) {
    const spec = cred.spec.makeControlSpec(type);
    expect(spec).toBeDefined();
  }
});

test('ControlSpec.propertySpec', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  const ctrlTypePropSpec = ctrlSpec.propertySpec(cred.spec.propertyLabel.ctrlType);
  expect(ctrlTypePropSpec).toBeDefined();
  expect(ctrlTypePropSpec.label).toEqual(cred.spec.propertyLabel.ctrlType);
});

test('ControlSpec.propertySpecs', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  const propSpecGen = ctrlSpec.propertySpecs();
  expect(propSpecGen).toBeDefined();
  const generatedPropSpecs = Array.from(propSpecGen);
  expect(generatedPropSpecs.length).toBeGreaterThan(0);
});

test('ControlSpec.propertyLabels', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  const propLabelGen = ctrlSpec.propertyLabels();
  expect(propLabelGen).toBeDefined();
  const generatedPropLabels = Array.from(propLabelGen);
  expect(generatedPropLabels.length).toBeGreaterThan(0);
});

test('ControlSpec.propertyDisplayOrder', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  const displayOrderGen = ctrlSpec.propertyDisplayOrder();
  expect(displayOrderGen).toBeDefined();
  const generatedDisplayOrder = Array.from(displayOrderGen);
  expect(generatedDisplayOrder.length).toBeGreaterThan(0);
});

test('ControlSpec.setBehaviorFlag', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  ctrlSpec.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
  expect(
    ctrlSpec.hasBehaviorFlag(cred.spec.controlBehavior.serializeProperties)
  ).toBeTruthy();
});

test('ControlSpec.hasBehaviorFlag', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  expect(
    ctrlSpec.hasBehaviorFlag(cred.spec.controlBehavior.serializeProperties)
  ).toBeFalsy();
  ctrlSpec.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
  expect(
    ctrlSpec.hasBehaviorFlag(cred.spec.controlBehavior.serializeProperties)
  ).toBeTruthy();
});

test('ControlSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [
    cred.spec.propertyLabel.ctrlType,
    cred.spec.propertyLabel.id,
    cred.spec.propertyLabel.left,
    cred.spec.propertyLabel.top,
    cred.spec.propertyLabel.width,
    cred.spec.propertyLabel.height,
    cred.spec.propertyLabel.resourceClass,
    cred.spec.propertyLabel.styleFlags,
    cred.spec.propertyLabel.extStyleFlags,
    cred.spec.propertyLabel.anchorLeft,
    cred.spec.propertyLabel.anchorTop,
    cred.spec.propertyLabel.anchorRight,
    cred.spec.propertyLabel.anchorBottom,
    cred.spec.propertyLabel.enabled,
    cred.spec.propertyLabel.group,
    cred.spec.propertyLabel.killPopup,
    cred.spec.propertyLabel.tabStop,
    cred.spec.propertyLabel.visible,
    cred.spec.propertyLabel.tooltip
  ]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

///////////////////

test('ImagePushButtonSpec creation', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.imagePushButton);
  expect(ctrlSpec).toBeDefined();
});

test('ImagePushButtonSpec.title', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.imagePushButton);
  expect(ctrlSpec.title).toEqual(expect.any(String));
});

test('ImagePushButtonSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.imagePushButton);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [
    cred.spec.propertyLabel.pushButtonLike,
    cred.spec.propertyLabel.splitButtonLike,
    cred.spec.propertyLabel.toolBarLike,
    cred.spec.propertyLabel.imageSizeType,
    cred.spec.propertyLabel.imageNormal,
    cred.spec.propertyLabel.imagePressed,
    cred.spec.propertyLabel.imageDisabled,
    cred.spec.propertyLabel.imageHot,
    cred.spec.propertyLabel.imageChecked,
    cred.spec.propertyLabel.imageCheckedPressed,
    cred.spec.propertyLabel.imageCheckedDisabled,
    cred.spec.propertyLabel.imageCheckedHot,
    cred.spec.propertyLabel.imageTriState,
    cred.spec.propertyLabel.imageTriStatePressed,
    cred.spec.propertyLabel.imageTriStateDisabled,
    cred.spec.propertyLabel.imageTriStateHot
  ]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

///////////////////

test('LabelSpec creation', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  expect(ctrlSpec).toBeDefined();
});

test('LabelSpec.title', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  expect(ctrlSpec.title).toEqual(expect.any(String));
});

test('LabelSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.label);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [cred.spec.propertyLabel.text, cred.spec.propertyLabel.textAlign]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

///////////////////

test('PlaceHolderSpec creation', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.placeHolder);
  expect(ctrlSpec).toBeDefined();
});

test('PlaceHolderSpec.title', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.placeHolder);
  expect(ctrlSpec.title).toEqual(expect.any(String));
});

test('PlaceHolderSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.placeHolder);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [cred.spec.propertyLabel.text]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

///////////////////

test('PushButtonSpec creation', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.pushButton);
  expect(ctrlSpec).toBeDefined();
});

test('PushButtonSpec.title', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.pushButton);
  expect(ctrlSpec.title).toEqual(expect.any(String));
});

test('PushButtonSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.pushButton);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [cred.spec.propertyLabel.text]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

test('PushButtonSpec added style flags', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.pushButton);
  const styleFlags = ctrlSpec.propertySpec(cred.spec.propertyLabel.styleFlags);
  expect(styleFlags.hasFlag('BS_PUSHBUTTON')).toBeTruthy();
});

///////////////////

test('TextBoxSpec creation', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.textBox);
  expect(ctrlSpec).toBeDefined();
});

test('TextBoxSpec.title', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.textBox);
  expect(ctrlSpec.title).toEqual(expect.any(String));
});

test('TextBoxSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.textBox);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [
    cred.spec.propertyLabel.text,
    cred.spec.propertyLabel.commandDelay,
    cred.spec.propertyLabel.customUnitIndex,
    cred.spec.propertyLabel.incValue,
    cred.spec.propertyLabel.maxValue,
    cred.spec.propertyLabel.minValue,
    cred.spec.propertyLabel.precision,
    cred.spec.propertyLabel.readOnly,
    cred.spec.propertyLabel.unit,
    cred.spec.propertyLabel.upDownArrows
  ]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

///////////////////

test('ComboBoxSpec creation', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.comboBox);
  expect(ctrlSpec).toBeDefined();
});

test('ComboBoxSpec.title', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.comboBox);
  expect(ctrlSpec.title).toEqual(expect.any(String));
});

test('ComboBoxSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.comboBox);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [
    cred.spec.propertyLabel.text,
    cred.spec.propertyLabel.commandDelay,
    cred.spec.propertyLabel.customUnitIndex,
    cred.spec.propertyLabel.incValue,
    cred.spec.propertyLabel.maxValue,
    cred.spec.propertyLabel.minValue,
    cred.spec.propertyLabel.precision,
    cred.spec.propertyLabel.readOnly,
    cred.spec.propertyLabel.unit
  ]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

///////////////////

test('InkButtonSpec creation', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.inkButton);
  expect(ctrlSpec).toBeDefined();
});

test('InkButtonSpec.title', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.inkButton);
  expect(ctrlSpec.title).toEqual(expect.any(String));
});

test('InkButtonSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.inkButton);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [cred.spec.propertyLabel.solidColorsOnly]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

///////////////////

test('SliderSpec creation', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.slider);
  expect(ctrlSpec).toBeDefined();
});

test('SliderSpec.title', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.slider);
  expect(ctrlSpec.title).toEqual(expect.any(String));
});

test('SliderSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.slider);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [
    cred.spec.propertyLabel.text,
    cred.spec.propertyLabel.maximum,
    cred.spec.propertyLabel.minimum,
    cred.spec.propertyLabel.incFactor,
    cred.spec.propertyLabel.pageIncFactor,
    cred.spec.propertyLabel.tickMarks
  ]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

///////////////////

test('CheckBoxSpec creation', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.slider);
  expect(ctrlSpec).toBeDefined();
});

test('CheckBoxSpec.title', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.slider);
  expect(ctrlSpec.title).toEqual(expect.any(String));
});

test('CheckBoxSpec defined properties', () => {
  const ctrlSpec = cred.spec.makeControlSpec(cred.spec.controlType.slider);
  const props = Array.from(ctrlSpec.propertySpecs());
  for (const label of [cred.spec.propertyLabel.text]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});

///////////////////

test('spec.makeDialogSpec', () => {
  const spec = cred.spec.makeDialogSpec();
  expect(spec).toBeDefined();
});

test('DialogSpec.title', () => {
  const spec = cred.spec.makeDialogSpec();
  expect(spec.title).toEqual(expect.any(String));
});

test('DialogSpec.propertySpec', () => {
  const spec = cred.spec.makeDialogSpec();
  const idPropSpec = spec.propertySpec(cred.spec.propertyLabel.id);
  expect(idPropSpec).toBeDefined();
  expect(idPropSpec.label).toEqual(cred.spec.propertyLabel.id);
});

test('DialogSpec.propertySpecs', () => {
  const spec = cred.spec.makeDialogSpec();
  const propSpecGen = spec.propertySpecs();
  expect(propSpecGen).toBeDefined();
  const generatedPropSpecs = Array.from(propSpecGen);
  expect(generatedPropSpecs.length).toBeGreaterThan(0);
});

test('DialogSpec.propertySpecs', () => {
  const spec = cred.spec.makeDialogSpec();
  const propLabelGen = spec.propertyLabels();
  expect(propLabelGen).toBeDefined();
  const generatedPropLabels = Array.from(propLabelGen);
  expect(generatedPropLabels.length).toBeGreaterThan(0);
});

test('DialogSpec.propertyDisplayOrder', () => {
  const spec = cred.spec.makeDialogSpec();
  const displayOrderGen = spec.propertyDisplayOrder();
  expect(displayOrderGen).toBeDefined();
  const generatedDisplayOrder = Array.from(displayOrderGen);
  expect(generatedDisplayOrder.length).toBeGreaterThan(0);
});

test('DialogSpec defined properties', () => {
  const spec = cred.spec.makeDialogSpec();
  const props = Array.from(spec.propertySpecs());
  for (const label of [
    cred.spec.propertyLabel.id,
    cred.spec.propertyLabel.left,
    cred.spec.propertyLabel.top,
    cred.spec.propertyLabel.width,
    cred.spec.propertyLabel.height,
    cred.spec.propertyLabel.text,
    cred.spec.propertyLabel.resourceClass,
    cred.spec.propertyLabel.font,
    cred.spec.propertyLabel.fontSize,
    cred.spec.propertyLabel.killPopup,
    cred.spec.propertyLabel.paddingType,
    cred.spec.propertyLabel.styleFlags
  ]) {
    expect(props.findIndex(prop => prop.label === label)).not.toEqual(-1);
  }
});
