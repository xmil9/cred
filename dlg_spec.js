//
// Specifications for properties, dialogs and controls.
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
var util = tryRequire('./util') || util || {};

///////////////////

// Specification module.
cred.spec = (function() {
  ///////////////////

  // Enum of supported physical property types. A physical type specifies how
  // the property is represented in the resource file.
  const physicalPropertyType = {
    number: 'num_physic_type',
    string: 'str_physic_type',
    identifier: 'id_physic_type',
    flags: 'flags_physic_type'
  };
  Object.freeze(physicalPropertyType);

  // Determines the physical property type of a given string value.
  // The function assumes a preprocessed value that does not contain illegal characters
  // like commas, etc.
  function physicalPropertyTypeOfValue(valueAsStr) {
    // If it is empty or enclosed in double-quotes, it's a string.
    if (
      valueAsStr.length === 0 ||
      (valueAsStr.startsWith('"') && valueAsStr.endsWith('"'))
    ) {
      return cred.spec.physicalPropertyType.string;
    }
    // If it does not contain anything but digits, '.', and optionally a '-'at the
    // beginning, then it's a number.
    else if (
      valueAsStr.search(/[^\d.]/) === -1 ||
      (valueAsStr[0] === '-' && valueAsStr.substring(1).search(/[^\d.]/) === -1)
    ) {
      return cred.spec.physicalPropertyType.number;
    }
    // If it contains binary-or characters, it's a flag sequence.
    else if (valueAsStr.includes('|')) {
      return cred.spec.physicalPropertyType.flags;
    }
    // Anything else is an identifier.
    else {
      return cred.spec.physicalPropertyType.identifier;
    }
  }

  // Converts the contents of a given string to a given physical property type.
  // Will not veridy that the given value is valid for the requested type.
  // Returns the converted value.
  function convertToPhysicalPropertyTypeValue(valueAsStr, type) {
    switch (type) {
      case cred.spec.physicalPropertyType.string: {
        return valueAsStr;
      }
      case cred.spec.physicalPropertyType.identifier: {
        return valueAsStr;
      }
      case cred.spec.physicalPropertyType.number: {
        return util.toNumber(valueAsStr);
      }
      case cred.spec.physicalPropertyType.flags: {
        return valueAsStr;
      }
      default: {
        throw new Error('Unexpected physical property type to convert to.');
      }
    }
  }

  // Enum of supported logical property types. A logical type specifies how the
  // property is represented in the UI.
  const logicalPropertyType = {
    integer: 'int_logic_type',
    float: 'float_logic_type',
    string: 'str_logic_type',
    localizedString: 'locstr_logic_type',
    identifier: 'id_logic_type',
    bool: 'bool_logic_type',
    enum: 'enum_logic_type',
    flags: 'flags_logic_type',

    // Makes the logical types iterable.
    *[Symbol.iterator]() {
      yield this.integer;
      yield this.float;
      yield this.string;
      yield this.localizedString;
      yield this.identifier;
      yield this.bool;
      yield this.enum;
      yield this.flags;
    }
  };
  Object.freeze(logicalPropertyType);

  // Enum of lables for standard properties.
  const propertyLabel = {
    anchorBottom: 'AnchorBottom',
    anchorLeft: 'AnchorLeft',
    anchorRight: 'AnchorRight',
    anchorTop: 'AnchorTop',
    applyMode: 'ApplyMode',
    autoExpand: 'AutoExpand',
    autoZoom: 'AutoZoom',
    checked: 'Checked',
    columns: 'Columns',
    commandDelay: 'CommandDelay',
    ctrlType: 'ControlType',
    customUnitIndex: 'CustomUnitIndex',
    decimals: 'Decimals',
    enabled: 'Enabled',
    expanded: 'Expanded',
    extStyleFlags: 'ExtStyleFlags',
    font: 'Font',
    fontSize: 'FontSize',
    group: 'Group',
    height: 'Height',
    id: 'ResourceName',
    image: 'Image',
    imageChecked: 'ImageChecked',
    imageCheckedDisabled: 'ImageCheckedDisabled',
    imageCheckedHot: 'ImageCheckedHot',
    imageCheckedPressed: 'ImageCheckedPressed',
    imageDisabled: 'ImageDisabled',
    imageHot: 'ImageHot',
    imageNormal: 'ImageNormal',
    imagePressed: 'ImagePressed',
    imageSizeType: 'ImageSizeType',
    imageTriState: 'ImageTriState',
    imageTriStateDisabled: 'ImageTriStateDisabled',
    imageTriStateHot: 'ImageTriStateHot',
    imageTriStatePressed: 'ImageTriStatePressed',
    incFactor: 'IncFactor',
    incValue: 'IncValue',
    itemCount: 'ItemCount',
    itemHeight: 'ItemHeight',
    itemWidth: 'ItemWidth',
    killPopup: 'KillPopup',
    left: 'Left',
    maximum: 'Max',
    maxLevel: 'MaxLevel',
    maxValue: 'MaxValue',
    minLevel: 'MinLevel',
    minValue: 'MinValue',
    minimum: 'Min',
    ownerDrawn: 'OwnerDrawn',
    paddingType: 'PaddingType',
    pageIncFactor: 'PageIncFactor',
    popPosition: 'PopPosition',
    precision: 'Precision',
    pushButtonLike: 'PushButtonLike',
    readOnly: 'ReadOnly',
    resourceClass: 'ResourceClass',
    rows: 'Rows',
    selectedItem: 'SelectedItem',
    solidColorsOnly: 'SolidColorsOnly',
    splitButtonLike: 'SplitButtonLike',
    styleFlags: 'StyleFlags',
    tabStop: 'TabStop',
    text: 'Text',
    textAlign: 'TextAlign',
    tickMarks: 'TickMarks',
    toolBarLike: 'ToolBarLike',
    tooltip: 'Tooltip',
    top: 'Top',
    penType: 'Type',
    unit: 'Unit',
    upDownArrows: 'UpDownArrows',
    visible: 'Visible',
    width: 'Width',
    zoomStyle: 'ZoomStyle'
  };
  Object.freeze(propertyLabel);

  // Enum of tags to attach contextual meaning to a property. They can be used to
  // categorize the property.
  const semanticPropertyTag = {
    id: 'id_semantic_tag',
    bounds: 'bounds_semantic_tag',

    // Makes the sematic tags iterable.
    *[Symbol.iterator]() {
      yield this.id;
      yield this.bounds;
    }
  };
  Object.freeze(semanticPropertyTag);

  ///////////////////

  // Base class for property specifications.
  // Defines attributes/properties of a property, e.g. its label, is it modifiable,
  // etc.
  class PropertySpec {
    constructor(config, logicalType) {
      // Label that identifies the property internally, e.g. in the resource.
      this._label = config.label || '';
      // Text displayed to describe the property in the UI.
      this._displayedLabel = config.displayedLabel || '';
      // Is the property required to be defined in the resource?
      this._required = typeof config.required !== 'undefined' ? config.required : true;
      // Can the property be empty, i.e. without a value?
      this._nullable = typeof config.nullable !== 'undefined' ? config.nullable : false;
      // The context that modifications to the property apply to.
      this._editContext = config.context || cred.editContext.globalDefault;
      // Can the property's value be modified?
      this._modifiable =
        typeof config.modifiable !== 'undefined' ? config.modifiable : true;
      // Should the property's value be localized?
      this._localized =
        typeof config.localized !== 'undefined' ? config.localized : false;
      // Should the property be written as labeled property?
      this._writeLabeled =
        typeof config.writeLabeled !== 'undefined' ? config.writeLabeled : true;
      // Should the property value be written as string when writing it out as a labeled
      // property?
      this._writeAsStringWhenLabeled =
        typeof config.writeAsStringWhenLabeled !== 'undefined'
          ? config.writeAsStringWhenLabeled
          : false;
      // Should the property be written as serizalied property?
      this._writeSerialized =
        typeof config.writeSerialized !== 'undefined' ? config.writeSerialized : false;
      // Should the property value be written as string when writing it out as a
      // serialized property?
      this._writeAsStringWhenSerialized =
        typeof config.writeAsStringWhenSerialized !== 'undefined'
          ? config.writeAsStringWhenSerialized
          : false;
      this._writeSerializedCaption =
        typeof config.writeSerializedCaption !== 'undefined'
          ? config.writeSerializedCaption
          : false;
      // Contextual tags for the property.
      this._tags = config.tags || [];
      this._tags.push(logicalType);
      // The logical property type.
      this._logicalType = logicalType;
    }

    get label() {
      return this._label;
    }

    get displayedLabel() {
      return this._displayedLabel;
    }

    isRequired() {
      return this._required;
    }

    isNullable() {
      return this._nullable;
    }

    get editContext() {
      return this._editContext;
    }

    isModifiable() {
      return this._modifiable;
    }

    isLocalized() {
      return this._localized;
    }

    writeLabeled() {
      return this._writeLabeled;
    }

    writeAsStringWhenLabeled() {
      return this._writeAsStringWhenLabeled;
    }

    writeSerialized() {
      return this._writeSerialized;
    }

    writeAsStringWhenSerialized() {
      return this._writeAsStringWhenSerialized;
    }

    writeSerializedCaption() {
      return this._writeSerializedCaption;
    }

    get logicalType() {
      return this._logicalType;
    }

    get tags() {
      return this._tags;
    }
  }

  // Specification for a property that holds an integer value.
  class IntegerPropertySpec extends PropertySpec {
    constructor(config) {
      super(config, logicalPropertyType.integer);
    }

    // Polymorphic function to build a DOM represetation of the property.
    buildDomComponent(propertyBuilder, propertyDefintion, $parentElem) {
      // Double-dispatch selection of function that does the actual building.
      return propertyBuilder.buildIntegerComponent(propertyDefintion, this, $parentElem);
    }
  }

  // Specification for a property that holds a floating point value.
  class FloatingPointPropertySpec extends PropertySpec {
    constructor(config) {
      super(config, logicalPropertyType.float);
    }

    // Polymorphic function to build a DOM represetation of the property.
    buildDomComponent(propertyBuilder, propertyDefintion, $parentElem) {
      // Double-dispatch selection of function that does the actual building.
      return propertyBuilder.buildFloatingPointComponent(
        propertyDefintion,
        this,
        $parentElem
      );
    }
  }

  // Specification for a property that holds a string value.
  class StringPropertySpec extends PropertySpec {
    constructor(config) {
      super(config, logicalPropertyType.string);
    }

    // Polymorphic function to build a DOM represetation of the property.
    buildDomComponent(propertyBuilder, propertyDefintion, $parentElem) {
      // Double-dispatch selection of function that does the actual building.
      return propertyBuilder.buildStringComponent(propertyDefintion, this, $parentElem);
    }
  }

  // Specification for a property that holds a localized string value.
  class LocalizedStringPropertySpec extends PropertySpec {
    constructor(config) {
      super(config, logicalPropertyType.localizedString);
    }

    // Polymorphic function to build a DOM represetation of the property.
    buildDomComponent(propertyBuilder, propertyDefintion, $parentElem) {
      // Double-dispatch selection of function that does the actual building.
      return propertyBuilder.buildLocalizedStringComponent(
        propertyDefintion,
        this,
        $parentElem
      );
    }
  }

  // Specification for a property that holds an identifier.
  class IdentifierPropertySpec extends PropertySpec {
    constructor(config) {
      super(config, logicalPropertyType.identifier);
    }

    // Polymorphic function to build a DOM represetation of the property.
    buildDomComponent(propertyBuilder, propertyDefintion, $parentElem) {
      // Double-dispatch selection of function that does the actual building.
      return propertyBuilder.buildIdentifierComponent(
        propertyDefintion,
        this,
        $parentElem
      );
    }
  }

  // Specification for a property that holds a boolean value.
  class BooleanPropertySpec extends PropertySpec {
    constructor(config) {
      super(config, logicalPropertyType.bool);
    }

    // Polymorphic function to build a DOM represetation of the property.
    buildDomComponent(propertyBuilder, propertyDefintion, $parentElem) {
      // Double-dispatch selection of function that does the actual building.
      return propertyBuilder.buildBooleanComponent(propertyDefintion, this, $parentElem);
    }
  }

  // Specification for a property that holds an enumeration.
  class EnumPropertySpec extends PropertySpec {
    constructor(config) {
      super(config, logicalPropertyType.enum);
      // Array of supported enums represented by an object with 'value' and
      // 'display' properties holding the internal value and the displayed
      // text for the enum entry.
      this._enums = config.enums;
    }

    // Polymorphic function to build a DOM represetation of the property.
    buildDomComponent(propertyBuilder, propertyDefintion, $parentElem) {
      // Double-dispatch selection of function that does the actual building.
      return propertyBuilder.buildEnumComponent(
        propertyDefintion,
        this,
        $parentElem,
        this._enums
      );
    }
  }

  // Specification for a property that holds a collection of flags.
  class FlagsPropertySpec extends PropertySpec {
    constructor(config) {
      super(config, logicalPropertyType.flags);
      // Array of supported flags represented by an object with 'textValue',
      // 'numericValue', and 'display' properties holding the internal string
      // value, the internal numeric value, and the displayed text for the flag.
      this._flags = config.flags || [];
    }

    // Polymorphic function to build a DOM represetation of the property.
    buildDomComponent(propertyBuilder, propertyDefintion, $parentElem) {
      // Double-dispatch selection of function that does the actual building.
      return propertyBuilder.buildFlagsComponent(
        propertyDefintion,
        this,
        $parentElem,
        this._flags
      );
    }

    haveFlags() {
      return this._flags.length > 0;
    }

    addFlag(flagConfig) {
      this._flags.push(flagConfig);
    }

    hasFlag(flagText) {
      return this._flags.findIndex(elem => elem.textValue === flagText) !== -1;
    }
  }

  // Factory function for property specs.
  function makePropertySpec(logicalPropType, config) {
    switch (logicalPropType) {
      case logicalPropertyType.bool: {
        return new BooleanPropertySpec(config);
      }
      case logicalPropertyType.enum: {
        return new EnumPropertySpec(config);
      }
      case logicalPropertyType.flags: {
        return new FlagsPropertySpec(config);
      }
      case logicalPropertyType.float: {
        return new FloatingPointPropertySpec(config);
      }
      case logicalPropertyType.identifier: {
        return new IdentifierPropertySpec(config);
      }
      case logicalPropertyType.integer: {
        return new IntegerPropertySpec(config);
      }
      case logicalPropertyType.localizedString: {
        return new LocalizedStringPropertySpec(config);
      }
      case logicalPropertyType.string: {
        return new StringPropertySpec(config);
      }
      default: {
        throw new Error('Unexpected logical property type.');
      }
    }
  }

  ///////////////////

  // Specification for dialogs.
  // Defines what properties dialogs support and how they and their properties
  // should be displayed.
  class DialogSpec {
    constructor() {
      // Map that associates property labels with the specs for each
      // supported property.
      this._propertySpecs = DialogSpec._createPropertySpecs();
      // Array of property labels defining the order in which properties should
      // be displayed.
      this._propertyDisplayOrder = DialogSpec._definePropertyDisplayOrder();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'Dialog';
    }

    propertySpec(label) {
      return this._propertySpecs.get(label);
    }

    *propertySpecs() {
      for (const spec of this._propertySpecs.values()) {
        yield spec;
      }
    }

    *propertyLabels() {
      for (const label of this._propertySpecs.keys()) {
        yield label;
      }
    }

    *propertyDisplayOrder() {
      for (const label of this._propertyDisplayOrder) {
        yield label;
      }
    }

    // Creates a collection of property specs for all properties that dialogs
    // support.
    static _createPropertySpecs() {
      return new Map([
        [
          propertyLabel.id,
          new IdentifierPropertySpec({
            label: propertyLabel.id,
            displayedLabel: 'Identifier',
            required: true,
            nullable: false,
            context: cred.editContext.globalOnly,
            modifiable: true,
            localized: false,
            writeLabeled: true,
            writeAsStringWhenLabeled: true,
            writeSerialized: false,
            writeAsStringWhenSerialized: true,
            writeSerializedCaption: false,
            tags: [semanticPropertyTag.id]
          })
        ],
        [
          propertyLabel.left,
          new IntegerPropertySpec({
            label: propertyLabel.left,
            displayedLabel: 'Left',
            required: true,
            nullable: false,
            context: cred.editContext.localOnly,
            modifiable: false,
            localized: false,
            writeLabeled: false,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false,
            tags: [semanticPropertyTag.bounds]
          })
        ],
        [
          propertyLabel.top,
          new IntegerPropertySpec({
            label: propertyLabel.top,
            displayedLabel: 'Top',
            required: true,
            nullable: false,
            context: cred.editContext.localOnly,
            modifiable: false,
            localized: false,
            writeLabeled: false,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false,
            tags: [semanticPropertyTag.bounds]
          })
        ],
        [
          propertyLabel.width,
          new IntegerPropertySpec({
            label: propertyLabel.width,
            displayedLabel: 'Width',
            required: true,
            nullable: false,
            context: cred.editContext.localOnly,
            modifiable: true,
            localized: false,
            writeLabeled: true,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false,
            tags: [semanticPropertyTag.bounds]
          })
        ],
        [
          propertyLabel.height,
          new IntegerPropertySpec({
            label: propertyLabel.height,
            displayedLabel: 'Height',
            required: true,
            nullable: false,
            context: cred.editContext.localOnly,
            modifiable: true,
            localized: false,
            writeLabeled: true,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false,
            tags: [semanticPropertyTag.bounds]
          })
        ],
        [
          propertyLabel.text,
          new LocalizedStringPropertySpec({
            label: propertyLabel.text,
            displayedLabel: 'Title',
            required: true,
            nullable: true,
            context: cred.editContext.localOnly,
            modifiable: true,
            localized: true,
            writeLabeled: true,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false
          })
        ],
        [
          propertyLabel.resourceClass,
          new StringPropertySpec({
            label: propertyLabel.resourceClass,
            displayedLabel: 'Resource Class',
            required: true,
            nullable: false,
            context: cred.editContext.globalOnly,
            modifiable: true,
            localized: false,
            writeLabeled: false,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false
          })
        ],
        [
          propertyLabel.font,
          new StringPropertySpec({
            label: propertyLabel.font,
            displayedLabel: 'Font',
            required: true,
            nullable: true,
            context: cred.editContext.localDefault,
            modifiable: true,
            localized: false,
            writeLabeled: false,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false
          })
        ],
        [
          propertyLabel.fontSize,
          new IntegerPropertySpec({
            label: propertyLabel.fontSize,
            displayedLabel: 'Font Size',
            required: true,
            nullable: true,
            context: cred.editContext.localDefault,
            modifiable: true,
            localized: false,
            writeLabeled: false,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false
          })
        ],
        [
          propertyLabel.killPopup,
          new BooleanPropertySpec({
            label: propertyLabel.killPopup,
            displayedLabel: 'Kill Popup',
            required: true,
            nullable: false,
            context: cred.editContext.globalDefault,
            modifiable: true,
            localized: false,
            writeLabeled: true,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false
          })
        ],
        [
          propertyLabel.paddingType,
          new EnumPropertySpec({
            label: propertyLabel.paddingType,
            displayedLabel: 'Padding Type',
            required: true,
            nullable: false,
            context: cred.editContext.globalDefault,
            modifiable: true,
            localized: false,
            writeLabeled: true,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false,
            enums: [
              {
                value: 'ACDSystems::UI::DialogPaddingTypes::Default',
                display: 'Default'
              },
              {
                value: 'ACDSystems::UI::DialogPaddingTypes::Modal',
                display: 'Modal'
              },
              {
                value: 'ACDSystems::UI::DialogPaddingTypes::Palette',
                display: 'Palette'
              },
              {
                value: 'ACDSystems::UI::DialogPaddingTypes::None',
                display: 'None'
              }
            ]
          })
        ],
        [
          propertyLabel.styleFlags,
          new FlagsPropertySpec({
            label: propertyLabel.styleFlags,
            displayedLabel: 'Style Flags',
            required: true,
            nullable: false,
            context: cred.editContext.globalDefault,
            modifiable: true,
            localized: false,
            writeLabeled: false,
            writeAsStringWhenLabeled: false,
            writeSerialized: false,
            writeAsStringWhenSerialized: false,
            writeSerializedCaption: false,
            flags: [
              {
                textValue: 'WS_CHILD',
                numericValue: 1073741824,
                display: 'WS_CHILD'
              },
              {
                textValue: 'WS_VISIBLE',
                numericValue: 268435456,
                display: 'WS_VISIBLE'
              }
            ]
          })
        ]
      ]);
    }

    // Creates an array of property labels that defines the order in which
    // properties should be displayed.
    static _definePropertyDisplayOrder() {
      return [
        propertyLabel.resourceClass,
        propertyLabel.id,
        propertyLabel.text,
        propertyLabel.left,
        propertyLabel.top,
        propertyLabel.width,
        propertyLabel.height,
        propertyLabel.font,
        propertyLabel.fontSize,
        propertyLabel.killPopup,
        propertyLabel.paddingType,
        propertyLabel.styleFlags
      ];
    }
  }

  // Factory function to create a dialog spec.
  function makeDialogSpec() {
    return new DialogSpec();
  }

  ///////////////////

  // Enum for supported types of controls.
  const controlType = {
    checkBox: 'CheckBox',
    comboBox: 'ComboBox',
    cornerBox: 'CornerBox',
    expandButton: 'ExpandButton',
    groupBox: 'GroupBox',
    imageBox: 'ImageBox',
    imageCheckBox: 'ImageCheckBox',
    imagePushButton: 'ImagePushButton',
    imageRadioButton: 'ImageRadioButton',
    inkButton: 'InkButton',
    label: 'Label',
    menuButton: 'MenuButton',
    ownerDraw: 'OwnerDraw',
    placeHolder: 'PlaceHolder',
    popupButton: 'PopupButton',
    pushButton: 'PushButton',
    radioButton: 'RadioButton',
    slider: 'Slider',
    strokeButton: 'StrokeButton',
    textBox: 'TextBox',
    verticalLine: 'VerticalLine',
    zoomItem: 'ZoomItem'
  };
  Object.freeze(controlType);

  // Bit flags for special behavior of controls.
  const controlBehavior = {
    none: 0,
    // Indicates that the control uses the positional caption property to serialize
    // properties.
    serializeProperties: 1
  };
  Object.freeze(controlBehavior);

  // Base class for control specifications.
  // Defines what properties a control supports and how it and its properties
  // should be displayed.
  class ControlSpec {
    constructor() {
      // Map that associates property labels with the specs for each
      // supported property.
      this._propertySpecs = new Map();
      // Array of property labels defining the order in which properties should
      // be displayed.
      this._propertyDisplayOrder = [];
      // Special behavior flags.
      this._behaviorFlags = controlBehavior.none;

      this._populatePropertySpecs();
      this._definePropertyDisplayOrder();
      this._setBehaviorFlags();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'Control';
    }

    propertySpec(label) {
      return this._propertySpecs.get(label);
    }

    *propertySpecs() {
      for (const spec of this._propertySpecs.values()) {
        yield spec;
      }
    }

    *propertyLabels() {
      for (const label of this._propertySpecs.keys()) {
        yield label;
      }
    }

    *propertyDisplayOrder() {
      for (const label of this._propertyDisplayOrder) {
        yield label;
      }
    }

    setBehaviorFlag(flag) {
      this._behaviorFlags |= flag;
    }

    hasBehaviorFlag(flag) {
      return (this._behaviorFlags & flag) === flag;
    }

    // Polymorphic function that populates the collection of supported property
    // specs with the properties that are common to all controls.
    _populatePropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.ctrlType,
        new IdentifierPropertySpec({
          label: propertyLabel.ctrlType,
          displayedLabel: 'Control Type',
          required: true,
          nullable: false,
          context: cred.editContext.globalOnly,
          modifiable: false,
          localized: false,
          writeLabeled: false,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.id,
        new IdentifierPropertySpec({
          label: propertyLabel.id,
          displayedLabel: 'Identifier',
          required: true,
          nullable: false,
          context: cred.editContext.globalOnly,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          tags: [semanticPropertyTag.id]
        })
      );
      this._propertySpecs.set(
        propertyLabel.left,
        new IntegerPropertySpec({
          label: propertyLabel.left,
          displayedLabel: 'Left',
          required: true,
          nullable: false,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          tags: [semanticPropertyTag.bounds]
        })
      );
      this._propertySpecs.set(
        propertyLabel.top,
        new IntegerPropertySpec({
          label: propertyLabel.top,
          displayedLabel: 'Top',
          required: true,
          nullable: false,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          tags: [semanticPropertyTag.bounds]
        })
      );
      this._propertySpecs.set(
        propertyLabel.width,
        new IntegerPropertySpec({
          label: propertyLabel.width,
          displayedLabel: 'Width',
          required: true,
          nullable: false,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          tags: [semanticPropertyTag.bounds]
        })
      );
      this._propertySpecs.set(
        propertyLabel.height,
        new IntegerPropertySpec({
          label: propertyLabel.height,
          displayedLabel: 'Height',
          required: true,
          nullable: false,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          tags: [semanticPropertyTag.bounds]
        })
      );
      this._propertySpecs.set(
        propertyLabel.resourceClass,
        new IdentifierPropertySpec({
          label: propertyLabel.resourceClass,
          displayedLabel: 'Resource Class',
          required: true,
          nullable: false,
          context: cred.editContext.globalOnly,
          modifiable: false,
          localized: false,
          writeLabeled: false,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.styleFlags,
        new FlagsPropertySpec({
          label: propertyLabel.styleFlags,
          displayedLabel: 'Style Flags',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: false,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          flags: [
            {
              textValue: 'WS_CHILD',
              numericValue: 1073741824,
              display: 'WS_CHILD'
            },
            {
              textValue: 'WS_CLIPCHILDREN',
              numericValue: 33554432,
              display: 'WS_CLIPCHILDREN'
            },
            {
              textValue: 'WS_GROUP',
              numericValue: 131072,
              display: 'WS_GROUP'
            },
            {
              textValue: 'WS_TABSTOP',
              numericValue: 65536,
              display: 'WS_TABSTOP'
            },
            {
              textValue: 'WS_VISIBLE',
              numericValue: 268435456,
              display: 'WS_VISIBLE'
            }
          ]
        })
      );
      this._propertySpecs.set(
        propertyLabel.extStyleFlags,
        new FlagsPropertySpec({
          label: propertyLabel.extStyleFlags,
          displayedLabel: 'Extended Style Flags',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: false,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          flags: [
            {
              textValue: 'WS_EX_CONTROLPARENT',
              numericValue: 65536,
              display: 'WS_EX_CONTROLPARENT'
            },
            {
              textValue: 'WS_EX_STATICEDGE',
              numericValue: 131072,
              display: 'WS_EX_STATICEDGE'
            }
          ]
        })
      );
      this._propertySpecs.set(
        propertyLabel.anchorLeft,
        new IntegerPropertySpec({
          label: propertyLabel.anchorLeft,
          displayedLabel: 'Anchor Left',
          required: true,
          nullable: false,
          context: cred.editContext.localDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.anchorTop,
        new IntegerPropertySpec({
          label: propertyLabel.anchorTop,
          displayedLabel: 'Anchor Top',
          required: true,
          nullable: false,
          context: cred.editContext.localDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.anchorRight,
        new IntegerPropertySpec({
          label: propertyLabel.anchorRight,
          displayedLabel: 'Anchor Right',
          required: true,
          nullable: false,
          context: cred.editContext.localDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.anchorBottom,
        new IntegerPropertySpec({
          label: propertyLabel.anchorBottom,
          displayedLabel: 'Anchor Bottom',
          required: true,
          nullable: false,
          context: cred.editContext.localDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.enabled,
        new BooleanPropertySpec({
          label: propertyLabel.enabled,
          displayedLabel: 'Enabled',
          required: false,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.group,
        new BooleanPropertySpec({
          label: propertyLabel.group,
          displayedLabel: 'Group',
          required: false,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.killPopup,
        new BooleanPropertySpec({
          label: propertyLabel.killPopup,
          displayedLabel: 'Kill Popup',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.tabStop,
        new BooleanPropertySpec({
          label: propertyLabel.tabStop,
          displayedLabel: 'Tab Stop',
          required: false,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.visible,
        new BooleanPropertySpec({
          label: propertyLabel.visible,
          displayedLabel: 'Visible',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.tooltip,
        new StringPropertySpec({
          label: propertyLabel.tooltip,
          displayedLabel: 'Tooltip',
          required: true,
          nullable: true,
          context: cred.editContext.localDefault,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }

    // Polymorphic function that populates the display order array
    // with the properties that are common to all controls.
    _definePropertyDisplayOrder() {
      this._propertyDisplayOrder.push(propertyLabel.ctrlType);
      // The cv resource class cannot be changed. We could display it as
      // pure information. For now don't show.
      //this._propertyDisplayOrder.push(propertyLabel.resourceClass);
      this._propertyDisplayOrder.push(propertyLabel.id);
      this._propertyDisplayOrder.push(propertyLabel.tooltip);
      this._propertyDisplayOrder.push(propertyLabel.left);
      this._propertyDisplayOrder.push(propertyLabel.top);
      this._propertyDisplayOrder.push(propertyLabel.width);
      this._propertyDisplayOrder.push(propertyLabel.height);
      this._propertyDisplayOrder.push(propertyLabel.visible);
      this._propertyDisplayOrder.push(propertyLabel.enabled);
      this._propertyDisplayOrder.push(propertyLabel.tabStop);
      this._propertyDisplayOrder.push(propertyLabel.group);
      this._propertyDisplayOrder.push(propertyLabel.killPopup);
      this._propertyDisplayOrder.push(propertyLabel.anchorLeft);
      this._propertyDisplayOrder.push(propertyLabel.anchorTop);
      this._propertyDisplayOrder.push(propertyLabel.anchorRight);
      this._propertyDisplayOrder.push(propertyLabel.anchorBottom);
      // Don't show the style and ext style flags for now. Their settings are
      // duplicated in other properties, e.g. Visible, Group, etc.
      //if (this._havePropertyFlags(propertyLabel.styleFlags)) {
      //  this._propertyDisplayOrder.push(propertyLabel.styleFlags);
      //}
      //if (this._havePropertyFlags(propertyLabel.extStyleFlags)) {
      //  this._propertyDisplayOrder.push(propertyLabel.extStyleFlags);
      //}
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      // Nothing to do here. Derived classes can set flags.
    }

    // Checks whether any flags listed are in the spec for a flags property with a
    // given label.
    _havePropertyFlags(flagsPropertyLabel) {
      let flagsSpec = this.propertySpec(flagsPropertyLabel);
      return flagsSpec && flagsSpec.haveFlags();
    }
  }

  // Specification for image box controls.
  class ImageBoxSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'ImageBox';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.imageSizeType,
        propertyLabel.id
      );
      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.image,
        propertyLabel.imageSizeType
      );
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      this.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.image,
        new IdentifierPropertySpec({
          label: propertyLabel.image,
          displayedLabel: 'Image',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageSizeType,
        new EnumPropertySpec({
          label: propertyLabel.imageSizeType,
          displayedLabel: 'Image Size Type',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: makeStandardImageSizeEnums()
        })
      );
    }
  }

  // Specification for image checkbox controls.
  class ImageCheckBoxSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'ImageCheckBox';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      this._propertyDisplayOrder.push(propertyLabel.toolBarLike);
      this._propertyDisplayOrder.push(propertyLabel.ownerDrawn);
      this._propertyDisplayOrder.push(propertyLabel.imageSizeType);
      this._propertyDisplayOrder.push(propertyLabel.imageNormal);
      this._propertyDisplayOrder.push(propertyLabel.imagePressed);
      this._propertyDisplayOrder.push(propertyLabel.imageDisabled);
      this._propertyDisplayOrder.push(propertyLabel.imageHot);
      this._propertyDisplayOrder.push(propertyLabel.imageChecked);
      this._propertyDisplayOrder.push(propertyLabel.imageCheckedPressed);
      this._propertyDisplayOrder.push(propertyLabel.imageCheckedDisabled);
      this._propertyDisplayOrder.push(propertyLabel.imageCheckedHot);
      this._propertyDisplayOrder.push(propertyLabel.imageTriState);
      this._propertyDisplayOrder.push(propertyLabel.imageTriStatePressed);
      this._propertyDisplayOrder.push(propertyLabel.imageTriStateDisabled);
      this._propertyDisplayOrder.push(propertyLabel.imageTriStateHot);
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      this.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.imageChecked,
        new IdentifierPropertySpec({
          label: propertyLabel.imageChecked,
          displayedLabel: 'Image Checked',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageCheckedDisabled,
        new IdentifierPropertySpec({
          label: propertyLabel.imageCheckedDisabled,
          displayedLabel: 'Checked Disabled',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageCheckedHot,
        new IdentifierPropertySpec({
          label: propertyLabel.imageCheckedHot,
          displayedLabel: 'Checked Hot',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageCheckedPressed,
        new IdentifierPropertySpec({
          label: propertyLabel.imageCheckedPressed,
          displayedLabel: 'Checked Pressed',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageDisabled,
        new IdentifierPropertySpec({
          label: propertyLabel.imageDisabled,
          displayedLabel: 'Image Disabled',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageHot,
        new IdentifierPropertySpec({
          label: propertyLabel.imageHot,
          displayedLabel: 'Image Hot',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageNormal,
        new IdentifierPropertySpec({
          label: propertyLabel.imageNormal,
          displayedLabel: 'Image Normal',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imagePressed,
        new IdentifierPropertySpec({
          label: propertyLabel.imagePressed,
          displayedLabel: 'Image Pressed',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriState,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriState,
          displayedLabel: 'Image Tri-state',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriStateDisabled,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriStateDisabled,
          displayedLabel: 'Tri-State Disabled',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriStateHot,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriStateHot,
          displayedLabel: 'Tri-State Hot',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriStatePressed,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriStatePressed,
          displayedLabel: 'Tri-State Pressed',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageSizeType,
        new EnumPropertySpec({
          label: propertyLabel.imageSizeType,
          displayedLabel: 'Image Size Type',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: makeStandardImageSizeEnums()
        })
      );
      this._propertySpecs.set(
        propertyLabel.ownerDrawn,
        new BooleanPropertySpec({
          label: propertyLabel.ownerDrawn,
          displayedLabel: 'Owner-draw',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.toolBarLike,
        new BooleanPropertySpec({
          label: propertyLabel.toolBarLike,
          displayedLabel: 'Toolbar-like',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for image push button controls.
  class ImagePushButtonSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'ImagePushButton';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      this._propertyDisplayOrder.push(propertyLabel.pushButtonLike);
      this._propertyDisplayOrder.push(propertyLabel.splitButtonLike);
      this._propertyDisplayOrder.push(propertyLabel.toolBarLike);
      this._propertyDisplayOrder.push(propertyLabel.ownerDrawn);
      this._propertyDisplayOrder.push(propertyLabel.imageSizeType);
      this._propertyDisplayOrder.push(propertyLabel.imageNormal);
      this._propertyDisplayOrder.push(propertyLabel.imagePressed);
      this._propertyDisplayOrder.push(propertyLabel.imageDisabled);
      this._propertyDisplayOrder.push(propertyLabel.imageHot);
      this._propertyDisplayOrder.push(propertyLabel.imageChecked);
      this._propertyDisplayOrder.push(propertyLabel.imageCheckedPressed);
      this._propertyDisplayOrder.push(propertyLabel.imageCheckedDisabled);
      this._propertyDisplayOrder.push(propertyLabel.imageCheckedHot);
      this._propertyDisplayOrder.push(propertyLabel.imageTriState);
      this._propertyDisplayOrder.push(propertyLabel.imageTriStatePressed);
      this._propertyDisplayOrder.push(propertyLabel.imageTriStateDisabled);
      this._propertyDisplayOrder.push(propertyLabel.imageTriStateHot);
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      this.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.imageChecked,
        new IdentifierPropertySpec({
          label: propertyLabel.imageChecked,
          displayedLabel: 'Image Checked',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageCheckedDisabled,
        new IdentifierPropertySpec({
          label: propertyLabel.imageCheckedDisabled,
          displayedLabel: 'Checked Disabled',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageCheckedHot,
        new IdentifierPropertySpec({
          label: propertyLabel.imageCheckedHot,
          displayedLabel: 'Checked Hot',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageCheckedPressed,
        new IdentifierPropertySpec({
          label: propertyLabel.imageCheckedPressed,
          displayedLabel: 'Checked Pressed',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageDisabled,
        new IdentifierPropertySpec({
          label: propertyLabel.imageDisabled,
          displayedLabel: 'Image Disabled',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageHot,
        new IdentifierPropertySpec({
          label: propertyLabel.imageHot,
          displayedLabel: 'Image Hot',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageNormal,
        new IdentifierPropertySpec({
          label: propertyLabel.imageNormal,
          displayedLabel: 'Image Normal',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imagePressed,
        new IdentifierPropertySpec({
          label: propertyLabel.imagePressed,
          displayedLabel: 'Image Pressed',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriState,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriState,
          displayedLabel: 'Image Tri-state',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriStateDisabled,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriStateDisabled,
          displayedLabel: 'Tri-State Disabled',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriStateHot,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriStateHot,
          displayedLabel: 'Tri-State Hot',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriStatePressed,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriStatePressed,
          displayedLabel: 'Tri-State Pressed',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageSizeType,
        new EnumPropertySpec({
          label: propertyLabel.imageSizeType,
          displayedLabel: 'Image Size Type',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: makeStandardImageSizeEnums()
        })
      );
      this._propertySpecs.set(
        propertyLabel.ownerDrawn,
        new BooleanPropertySpec({
          label: propertyLabel.ownerDrawn,
          displayedLabel: 'Owner-draw',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.pushButtonLike,
        new BooleanPropertySpec({
          label: propertyLabel.pushButtonLike,
          displayedLabel: 'Pushbutton-like',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.splitButtonLike,
        new BooleanPropertySpec({
          label: propertyLabel.splitButtonLike,
          displayedLabel: 'Splitbutton-like',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.toolBarLike,
        new BooleanPropertySpec({
          label: propertyLabel.toolBarLike,
          displayedLabel: 'Toolbar-like',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for image radio button controls.
  class ImageRadioButtonSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'ImageRadioButton';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      this._propertyDisplayOrder.push(propertyLabel.toolBarLike);
      this._propertyDisplayOrder.push(propertyLabel.ownerDrawn);
      this._propertyDisplayOrder.push(propertyLabel.imageSizeType);
      this._propertyDisplayOrder.push(propertyLabel.imageNormal);
      this._propertyDisplayOrder.push(propertyLabel.imagePressed);
      this._propertyDisplayOrder.push(propertyLabel.imageDisabled);
      this._propertyDisplayOrder.push(propertyLabel.imageHot);
      this._propertyDisplayOrder.push(propertyLabel.imageChecked);
      this._propertyDisplayOrder.push(propertyLabel.imageCheckedPressed);
      this._propertyDisplayOrder.push(propertyLabel.imageCheckedDisabled);
      this._propertyDisplayOrder.push(propertyLabel.imageCheckedHot);
      this._propertyDisplayOrder.push(propertyLabel.imageTriState);
      this._propertyDisplayOrder.push(propertyLabel.imageTriStatePressed);
      this._propertyDisplayOrder.push(propertyLabel.imageTriStateDisabled);
      this._propertyDisplayOrder.push(propertyLabel.imageTriStateHot);
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      this.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.imageChecked,
        new IdentifierPropertySpec({
          label: propertyLabel.imageChecked,
          displayedLabel: 'Image Checked',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageCheckedDisabled,
        new IdentifierPropertySpec({
          label: propertyLabel.imageCheckedDisabled,
          displayedLabel: 'Checked Disabled',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageCheckedHot,
        new IdentifierPropertySpec({
          label: propertyLabel.imageCheckedHot,
          displayedLabel: 'Checked Hot',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageCheckedPressed,
        new IdentifierPropertySpec({
          label: propertyLabel.imageCheckedPressed,
          displayedLabel: 'Checked Pressed',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageDisabled,
        new IdentifierPropertySpec({
          label: propertyLabel.imageDisabled,
          displayedLabel: 'Image Disabled',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageHot,
        new IdentifierPropertySpec({
          label: propertyLabel.imageHot,
          displayedLabel: 'Image Hot',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageNormal,
        new IdentifierPropertySpec({
          label: propertyLabel.imageNormal,
          displayedLabel: 'Image Normal',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imagePressed,
        new IdentifierPropertySpec({
          label: propertyLabel.imagePressed,
          displayedLabel: 'Image Pressed',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriState,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriState,
          displayedLabel: 'Image Tri-state',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriStateDisabled,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriStateDisabled,
          displayedLabel: 'Tri-State Disabled',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriStateHot,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriStateHot,
          displayedLabel: 'Tri-State Hot',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageTriStatePressed,
        new IdentifierPropertySpec({
          label: propertyLabel.imageTriStatePressed,
          displayedLabel: 'Tri-State Pressed',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageSizeType,
        new EnumPropertySpec({
          label: propertyLabel.imageSizeType,
          displayedLabel: 'Image Size Type',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: makeStandardImageSizeEnums()
        })
      );
      this._propertySpecs.set(
        propertyLabel.ownerDrawn,
        new BooleanPropertySpec({
          label: propertyLabel.ownerDrawn,
          displayedLabel: 'Owner-draw',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.toolBarLike,
        new BooleanPropertySpec({
          label: propertyLabel.toolBarLike,
          displayedLabel: 'Toolbar-like',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for image push button controls.
  class LabelSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'Label';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.textAlign,
        propertyLabel.text
      );
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.textAlign,
        new EnumPropertySpec({
          label: propertyLabel.textAlign,
          displayedLabel: 'Text Align',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: [
            {
              value: 'ACDSystems::UI::TextAlign::Left',
              display: 'Left'
            },
            {
              value: 'ACDSystems::UI::TextAlign::Center',
              display: 'Center'
            },
            {
              value: 'ACDSystems::UI::TextAlign::Right',
              display: 'Right'
            }
          ]
        })
      );
    }
  }

  // Specification for image push button controls.
  class PlaceHolderSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'PlaceHolder';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for image popup button controls.
  class PopupButtonSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'PopupButton';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
      this._propertyDisplayOrder.push(propertyLabel.imageNormal);
      this._propertyDisplayOrder.push(propertyLabel.itemCount);
      this._propertyDisplayOrder.push(propertyLabel.itemWidth);
      this._propertyDisplayOrder.push(propertyLabel.itemHeight);
      this._propertyDisplayOrder.push(propertyLabel.columns);
      this._propertyDisplayOrder.push(propertyLabel.rows);
      this._propertyDisplayOrder.push(propertyLabel.selectedItem);
      this._propertyDisplayOrder.push(propertyLabel.popPosition);
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      this.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: true
        })
      );
      this._propertySpecs.set(
        propertyLabel.imageNormal,
        new IdentifierPropertySpec({
          label: propertyLabel.imageNormal,
          displayedLabel: 'Image Normal',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: true,
          writeSerialized: true,
          writeAsStringWhenSerialized: true,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.itemCount,
        new IntegerPropertySpec({
          label: propertyLabel.itemCount,
          displayedLabel: 'Item Count',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.itemHeight,
        new IntegerPropertySpec({
          label: propertyLabel.itemHeight,
          displayedLabel: 'Item Height',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.itemWidth,
        new IntegerPropertySpec({
          label: propertyLabel.itemWidth,
          displayedLabel: 'Item Width',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.columns,
        new IntegerPropertySpec({
          label: propertyLabel.columns,
          displayedLabel: 'Columns',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.rows,
        new IntegerPropertySpec({
          label: propertyLabel.rows,
          displayedLabel: 'Rows',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.selectedItem,
        new IntegerPropertySpec({
          label: propertyLabel.selectedItem,
          displayedLabel: 'Selected Item',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.popPosition,
        new EnumPropertySpec({
          label: propertyLabel.popPosition,
          displayedLabel: 'Pop Position',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: [
            {
              value: '::ACDSystems::UI::PopupButton::TopRight',
              display: 'Top Right'
            },
            {
              value: '::ACDSystems::UI::PopupButton::BottomLeft',
              display: 'Bottom Left'
            }
          ]
        })
      );
    }
  }

  // Specification for image push button controls.
  class PushButtonSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'PushButton';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
      this._addStyleFlags();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }

    // Add control-specific style flags.
    _addStyleFlags() {
      let styleFlagsSpec = this._propertySpecs.get(propertyLabel.styleFlags);
      styleFlagsSpec.addFlag({
        textValue: 'BS_PUSHBUTTON',
        numericValue: 0,
        display: 'BS_PUSHBUTTON'
      });
    }
  }

  // Specification for textbox controls.
  class TextBoxSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'TextBox';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
      this._propertyDisplayOrder.push(propertyLabel.readOnly);
      this._propertyDisplayOrder.push(propertyLabel.precision);
      this._propertyDisplayOrder.push(propertyLabel.upDownArrows);
      this._propertyDisplayOrder.push(propertyLabel.incValue);
      this._propertyDisplayOrder.push(propertyLabel.minValue);
      this._propertyDisplayOrder.push(propertyLabel.maxValue);
      this._propertyDisplayOrder.push(propertyLabel.commandDelay);
      this._propertyDisplayOrder.push(propertyLabel.unit);
      this._propertyDisplayOrder.push(propertyLabel.customUnitIndex);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.commandDelay,
        new FloatingPointPropertySpec({
          label: propertyLabel.commandDelay,
          displayedLabel: 'Command Delay',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.customUnitIndex,
        new IntegerPropertySpec({
          label: propertyLabel.customUnitIndex,
          displayedLabel: 'Custom Unit Index',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.incValue,
        new FloatingPointPropertySpec({
          label: propertyLabel.incValue,
          displayedLabel: 'Increment Value',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.maxValue,
        new FloatingPointPropertySpec({
          label: propertyLabel.maxValue,
          displayedLabel: 'Max Value',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.minValue,
        new FloatingPointPropertySpec({
          label: propertyLabel.minValue,
          displayedLabel: 'Min Value',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.precision,
        new IntegerPropertySpec({
          label: propertyLabel.precision,
          displayedLabel: 'Precison',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.readOnly,
        new BooleanPropertySpec({
          label: propertyLabel.readOnly,
          displayedLabel: 'Read-Only',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.unit,
        new EnumPropertySpec({
          label: propertyLabel.unit,
          displayedLabel: 'Unit',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: makeStandardUnitEnums()
        })
      );
      this._propertySpecs.set(
        propertyLabel.upDownArrows,
        new BooleanPropertySpec({
          label: propertyLabel.upDownArrows,
          displayedLabel: 'Up/Down Arrows',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for vertical line controls.
  class VerticalLineSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'VerticalLine';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for combobox controls.
  class ComboBoxSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'ComboBox';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
      this._propertyDisplayOrder.push(propertyLabel.readOnly);
      this._propertyDisplayOrder.push(propertyLabel.precision);
      this._propertyDisplayOrder.push(propertyLabel.incValue);
      this._propertyDisplayOrder.push(propertyLabel.minValue);
      this._propertyDisplayOrder.push(propertyLabel.maxValue);
      this._propertyDisplayOrder.push(propertyLabel.commandDelay);
      this._propertyDisplayOrder.push(propertyLabel.unit);
      this._propertyDisplayOrder.push(propertyLabel.customUnitIndex);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.commandDelay,
        new FloatingPointPropertySpec({
          label: propertyLabel.commandDelay,
          displayedLabel: 'Command Delay',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.customUnitIndex,
        new IntegerPropertySpec({
          label: propertyLabel.customUnitIndex,
          displayedLabel: 'Custom Unit Index',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.incValue,
        new FloatingPointPropertySpec({
          label: propertyLabel.incValue,
          displayedLabel: 'Increment Value',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.maxValue,
        new FloatingPointPropertySpec({
          label: propertyLabel.maxValue,
          displayedLabel: 'Max Value',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.minValue,
        new FloatingPointPropertySpec({
          label: propertyLabel.minValue,
          displayedLabel: 'Min Value',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.precision,
        new IntegerPropertySpec({
          label: propertyLabel.precision,
          displayedLabel: 'Precison',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.readOnly,
        new BooleanPropertySpec({
          label: propertyLabel.readOnly,
          displayedLabel: 'Read-Only',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.unit,
        new EnumPropertySpec({
          label: propertyLabel.unit,
          displayedLabel: 'Unit',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: makeStandardUnitEnums()
        })
      );
    }
  }

  // Specification for ink button controls.
  class InkButtonSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'InkButton';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.solidColorsOnly,
        propertyLabel.text
      );
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      this.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: true
        })
      );
      this._propertySpecs.set(
        propertyLabel.solidColorsOnly,
        new BooleanPropertySpec({
          label: propertyLabel.solidColorsOnly,
          displayedLabel: 'Solid Colors Only',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for stroke button controls.
  class StrokeButtonSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'StrokeButton';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.penType,
        propertyLabel.id
      );
      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.applyMode,
        propertyLabel.penType
      );
      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.text,
        propertyLabel.applyMode
      );
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.applyMode,
        new EnumPropertySpec({
          label: propertyLabel.applyMode,
          displayedLabel: 'Apply Mode',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: [
            {
              value: '::kARROW_NONE',
              display: 'No Arrow'
            },
            {
              value: '::kARROW_LEFT',
              display: 'Left Arrow'
            },
            {
              value: '::kARROW_RIGHT',
              display: 'Right Arrow'
            },
            {
              value: '::kARROW_BOTH',
              display: 'Both Arrows'
            }
          ]
        })
      );
      this._propertySpecs.set(
        propertyLabel.penType,
        new EnumPropertySpec({
          label: propertyLabel.penType,
          displayedLabel: 'Type',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: [
            {
              value: '::kAttributeType_SolidPen',
              display: 'Solid Pens'
            },
            {
              value: '::kAttributeType_CaligraphicPen',
              display: 'Caligraphic Pens'
            },
            {
              value: '::kAttributeType_NeonPen',
              display: 'Neon Pens'
            },
            {
              value: '::kAttributeType_ParallelLinePen',
              display: 'Parallel Pens'
            },
            {
              value: '::kAttributeType_SymbolStrokePen',
              display: 'Symbol Stroke Pens'
            },
            {
              value: '::kAttributeType_Dash',
              display: 'Dashes'
            },
            {
              value: '::kAttributeType_Arrow',
              display: 'Arrows'
            }
          ]
        })
      );
    }
  }

  // Specification for slider controls.
  class SliderSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'Slider';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
      this._propertyDisplayOrder.push(propertyLabel.maximum);
      this._propertyDisplayOrder.push(propertyLabel.minimum);
      this._propertyDisplayOrder.push(propertyLabel.incFactor);
      this._propertyDisplayOrder.push(propertyLabel.pageIncFactor);
      this._propertyDisplayOrder.push(propertyLabel.tickMarks);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.incFactor,
        new FloatingPointPropertySpec({
          label: propertyLabel.incFactor,
          displayedLabel: 'Increment Factor',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.maximum,
        new FloatingPointPropertySpec({
          label: propertyLabel.maximum,
          displayedLabel: 'Maximum',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.minimum,
        new FloatingPointPropertySpec({
          label: propertyLabel.minimum,
          displayedLabel: 'Minimum',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.pageIncFactor,
        new FloatingPointPropertySpec({
          label: propertyLabel.pageIncFactor,
          displayedLabel: 'Page Inc Factor',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.tickMarks,
        new EnumPropertySpec({
          label: propertyLabel.tickMarks,
          displayedLabel: 'Tick Marks',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: [
            {
              value: 'ACDSystems::UI::Slider::None',
              display: 'None'
            },
            {
              value: 'ACDSystems::UI::Slider::Above',
              display: 'Above'
            },
            {
              value: 'ACDSystems::UI::Slider::Below',
              display: 'Below'
            },
            {
              value: 'ACDSystems::UI::Slider::Both',
              display: 'Both'
            }
          ]
        })
      );
    }
  }

  // Specification for checkbox controls.
  class CheckBoxSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'Checkbox';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for expand button controls.
  class ExpandButtonSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'ExpandButton';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.autoExpand,
        propertyLabel.text
      );
      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.expanded,
        propertyLabel.autoExpand
      );
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      this.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: true
        })
      );
      this._propertySpecs.set(
        propertyLabel.autoExpand,
        new IntegerPropertySpec({
          label: propertyLabel.autoExpand,
          displayedLabel: 'Auto Expand',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.expanded,
        new BooleanPropertySpec({
          label: propertyLabel.expanded,
          displayedLabel: 'Expanded',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for groupbox controls.
  class GroupBoxSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'GroupBox';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for owner draw controls.
  class OwnerDrawSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'OwnerDraw';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      this.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: true
        })
      );
      // Replace the standard 'killPopup' property spec with a spec that serializes the
      // property.
      this._propertySpecs.set(
        propertyLabel.killPopup,
        new BooleanPropertySpec({
          label: propertyLabel.killPopup,
          displayedLabel: 'Kill Popup',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for menu button controls.
  class MenuButtonSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'MenuButton';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for radio button controls.
  class RadioButtonSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'RadioButton';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
      util.insertAfter(
        this._propertyDisplayOrder,
        propertyLabel.checked,
        propertyLabel.text
      );
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.checked,
        new BooleanPropertySpec({
          label: propertyLabel.checked,
          displayedLabel: 'Checked',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for corner box controls.
  class CornerBoxSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'CornerBox';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      util.insertAfter(this._propertyDisplayOrder, propertyLabel.text, propertyLabel.id);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.text,
        new LocalizedStringPropertySpec({
          label: propertyLabel.text,
          displayedLabel: 'Text',
          required: true,
          nullable: true,
          context: cred.editContext.localOnly,
          modifiable: true,
          localized: true,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Specification for zoom item controls.
  class ZoomItemSpec extends ControlSpec {
    constructor() {
      super();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'ZoomItem';
    }

    // Polymorphic function that populates the collection of supported property
    // specs.
    _populatePropertySpecs() {
      super._populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    _definePropertyDisplayOrder() {
      super._definePropertyDisplayOrder();

      this._propertyDisplayOrder.push(propertyLabel.autoZoom);
      this._propertyDisplayOrder.push(propertyLabel.decimals);
      this._propertyDisplayOrder.push(propertyLabel.incFactor);
      this._propertyDisplayOrder.push(propertyLabel.minLevel);
      this._propertyDisplayOrder.push(propertyLabel.maxLevel);
      this._propertyDisplayOrder.push(propertyLabel.zoomStyle);
    }

    // Polymorphic function to set behavior flags for the control.
    _setBehaviorFlags() {
      this.setBehaviorFlag(cred.spec.controlBehavior.serializeProperties);
    }

    // Add control-specific properties.
    _addPropertySpecs() {
      this._propertySpecs.set(
        propertyLabel.autoZoom,
        new BooleanPropertySpec({
          label: propertyLabel.autoZoom,
          displayedLabel: 'Auto Zoom',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.incFactor,
        new FloatingPointPropertySpec({
          label: propertyLabel.incFactor,
          displayedLabel: 'Increment Factor',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.minLevel,
        new FloatingPointPropertySpec({
          label: propertyLabel.minLevel,
          displayedLabel: 'Minimum Level',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.maxLevel,
        new FloatingPointPropertySpec({
          label: propertyLabel.maxLevel,
          displayedLabel: 'Maximum Level',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.zoomStyle,
        new EnumPropertySpec({
          label: propertyLabel.zoomStyle,
          displayedLabel: 'Zoom Style',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false,
          enums: [
            {
              value: '::UIZoomInfo::kEditItemStyle',
              display: 'Edit Item Style'
            },
            {
              value: '::UIZoomInfo::kComboBoxStyle',
              display: 'Combobox Style'
            }
          ]
        })
      );
      this._propertySpecs.set(
        propertyLabel.decimals,
        new IntegerPropertySpec({
          label: propertyLabel.decimals,
          displayedLabel: 'Decimals',
          required: true,
          nullable: true,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: true,
          writeAsStringWhenSerialized: false,
          writeSerializedCaption: false
        })
      );
    }
  }

  // Factory function for control specs based on a given control type.
  function makeControlSpec(ctrlType) {
    switch (ctrlType) {
      case controlType.checkBox: {
        return new CheckBoxSpec();
      }
      case controlType.comboBox: {
        return new ComboBoxSpec();
      }
      case controlType.cornerBox: {
        return new CornerBoxSpec();
      }
      case controlType.expandButton: {
        return new ExpandButtonSpec();
      }
      case controlType.groupBox: {
        return new GroupBoxSpec();
      }
      case controlType.imageBox: {
        return new ImageBoxSpec();
      }
      case controlType.imageCheckBox: {
        return new ImageCheckBoxSpec();
      }
      case controlType.imagePushButton: {
        return new ImagePushButtonSpec();
      }
      case controlType.imageRadioButton: {
        return new ImageRadioButtonSpec();
      }
      case controlType.inkButton: {
        return new InkButtonSpec();
      }
      case controlType.label: {
        return new LabelSpec();
      }
      case controlType.menuButton: {
        return new MenuButtonSpec();
      }
      case controlType.ownerDraw: {
        return new OwnerDrawSpec();
      }
      case controlType.placeHolder: {
        return new PlaceHolderSpec();
      }
      case controlType.popupButton: {
        return new PopupButtonSpec();
      }
      case controlType.pushButton: {
        return new PushButtonSpec();
      }
      case controlType.radioButton: {
        return new RadioButtonSpec();
      }
      case controlType.slider: {
        return new SliderSpec();
      }
      case controlType.strokeButton: {
        return new StrokeButtonSpec();
      }
      case controlType.textBox: {
        return new TextBoxSpec();
      }
      case controlType.verticalLine: {
        return new VerticalLineSpec();
      }
      case controlType.zoomItem: {
        return new ZoomItemSpec();
      }
      default: {
        throw new Error(`Unexpected control type: ${ctrlType}.`);
      }
    }
  }

  // Creates an array of enum specs for the standard image size choices.
  function makeStandardImageSizeEnums() {
    return [
      {
        value: 'ACDSystems::UI::ImageSizeType::px16',
        display: '16x16'
      },
      {
        value: 'ACDSystems::UI::ImageSizeType::px24',
        display: '24x24'
      },
      {
        value: 'ACDSystems::UI::ImageSizeType::px32',
        display: '32x32'
      },
      {
        value: 'ACDSystems::UI::ImageSizeType::px48',
        display: '48x48'
      },
      {
        value: 'ACDSystems::UI::ImageSizeType::px64',
        display: '64x64'
      },
      {
        value: 'ACDSystems::UI::ImageSizeType::px128',
        display: '128x128'
      },
      {
        value: 'ACDSystems::UI::ImageSizeType::px256',
        display: '256x256'
      },
      {
        value: 'ACDSystems::UI::ImageSizeType::Custom',
        display: 'Custom'
      }
    ];
  }

  // Creates an array of enum specs for the standard unit choices.
  function makeStandardUnitEnums() {
    return [
      {
        value: 'ACDSystems::UI::UnitType::type_AlphaNumeric',
        display: 'Alphanumeric'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_Numeric',
        display: 'Numeric'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_Percentage',
        display: 'Percentage'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_Angle',
        display: 'Angle'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_Canvas',
        display: 'Canvas'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_CanvasXCoord',
        display: 'Canvas X-Coordinate'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_CanvasYCoord',
        display: 'Canvas Y-Coordinate'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_CanvasXDist',
        display: 'Canvas X-Distance'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_CanvasYDist',
        display: 'Canvas Y-Distance'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_Password',
        display: 'Password'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_PaperSpace',
        display: 'Paper Space'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_Latitude',
        display: 'Latitude'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_Longitude',
        display: 'Longitude'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_DMSAngle',
        display: 'Angle in Degrees Minutes Seconds'
      },
      {
        value: 'ACDSystems::UI::UnitType::type_Custom',
        display: 'Custom'
      }
    ];
  }

  ///////////////////

  // Exports
  return {
    controlBehavior: controlBehavior,
    controlType: controlType,
    convertToPhysicalPropertyTypeValue: convertToPhysicalPropertyTypeValue,
    logicalPropertyType: logicalPropertyType,
    makeControlSpec: makeControlSpec,
    makeDialogSpec: makeDialogSpec,
    makePropertySpec: makePropertySpec,
    physicalPropertyType: physicalPropertyType,
    physicalPropertyTypeOfValue: physicalPropertyTypeOfValue,
    propertyLabel: propertyLabel,
    semanticPropertyTag: semanticPropertyTag
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.spec;
