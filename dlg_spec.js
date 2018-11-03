//
// Specifications for properties, dialogs and controls.
//
'use strict';

///////////////////

// Imports
// These are provided through (ordered!) script tags in the HTML file.
var cred = cred || {};
var util = util || {};

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
    commandDelay: 'CommandDelay',
    ctrlType: 'Type',
    customUnitIndex: 'CustomUnitIndex',
    enabled: 'Enabled',
    extStyleFlags: 'ExtStyleFlags',
    font: 'Font',
    fontSize: 'FontSize',
    group: 'Group',
    height: 'Height',
    id: 'ResourceName',
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
    incValue: 'IncValue',
    killPopup: 'KillPopup',
    left: 'Left',
    maxValue: 'MaxValue',
    minValue: 'MinValue',
    ownerDrawn: 'OwnerDrawn',
    paddingType: 'PaddingType',
    precision: 'Precision',
    pushButtonLike: 'PushButtonLike',
    readOnly: 'ReadOnly',
    resourceClass: 'ResourceClass',
    splitButtonLike: 'SplitButtonLike',
    styleFlags: 'StyleFlags',
    tabStop: 'TabStop',
    text: 'Text',
    textAlign: 'TextAlign',
    toolBarLike: 'ToolBarLike',
    tooltip: 'Tooltip',
    top: 'Top',
    unit: 'Unit',
    upDownArrows: 'UpDownArrows',
    visible: 'Visible',
    width: 'Width'
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
        typeof config._writeAsStringWhenSerialized !== 'undefined'
          ? config._writeAsStringWhenSerialized
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

    get isRequired() {
      return this._required;
    }

    get isNullable() {
      return this._nullable;
    }

    get editContext() {
      return this._editContext;
    }

    get isModifiable() {
      return this._modifiable;
    }

    get isLocalized() {
      return this._localized;
    }

    get writeLabeled() {
      return this._writeLabeled;
    }

    get writeAsStringWhenLabeled() {
      return this._writeAsStringWhenLabeled;
    }

    get writeSerialized() {
      return this._writeSerialized;
    }

    get writeAsStringWhenSerialized() {
      return this._writeAsStringWhenSerialized;
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
      this._flags = config.flags;
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
      return typeof this._flags !== 'undefined' && this._flags.length > 0;
    }

    addFlag(flagConfig) {
      this._flags.push(flagConfig);
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
      this._propertyDisplayOrder = DialogSpec.definePropertyDisplayOrder();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'Dialog';
    }

    propertySpec(label) {
      return this._propertySpecs.get(label);
    }

    get propertySpecs() {
      return this._propertySpecs;
    }

    get propertyDisplayOrder() {
      return this._propertyDisplayOrder;
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
            writeAsStringWhenSerialized: false
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
            writeAsStringWhenSerialized: false
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
            writeAsStringWhenSerialized: false
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
            writeAsStringWhenSerialized: false
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
            writeAsStringWhenSerialized: false
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
    static definePropertyDisplayOrder() {
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

  // Bit flags for special behavior of controls.
  const controlBehavior = {
    none: 0,
    // Indicates that the control uses the positional caption property to serialize
    // properties.
    serializeProperties: 1
  };
  Object.freeze(cred.controlBehavior);

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

      this.populatePropertySpecs();
      this.definePropertyDisplayOrder();
      this.setBehaviorFlags();
    }

    // Polymorphic function that returns a description of what the spec is for.
    get title() {
      return 'Control';
    }

    propertySpec(label) {
      return this._propertySpecs.get(label);
    }

    get propertySpecs() {
      return this._propertySpecs;
    }

    get propertyDisplayOrder() {
      return this._propertyDisplayOrder;
    }

    setBehaviorFlag(flag) {
      this._behaviorFlags |= flag;
    }

    hasBehaviorFlag(flag) {
      return (this._behaviorFlags & flag) === flag;
    }

    // Polymorphic function that populates the collection of supported property
    // specs with the properties that are common to all controls.
    populatePropertySpecs() {
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          flags: [
            {
              textValue: 'WS_CHILD',
              numericValue: 1073741824,
              display: 'WS_CHILD'
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
          flags: []
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.enabled,
        new BooleanPropertySpec({
          label: propertyLabel.enabled,
          displayedLabel: 'Enabled',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.group,
        new BooleanPropertySpec({
          label: propertyLabel.group,
          displayedLabel: 'Group',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
        })
      );
      this._propertySpecs.set(
        propertyLabel.tabStop,
        new BooleanPropertySpec({
          label: propertyLabel.tabStop,
          displayedLabel: 'Tab Stop',
          required: true,
          nullable: false,
          context: cred.editContext.globalDefault,
          modifiable: true,
          localized: false,
          writeLabeled: true,
          writeAsStringWhenLabeled: false,
          writeSerialized: false,
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
        })
      );
    }

    // Polymorphic function that populates the display order array
    // with the properties that are common to all controls.
    definePropertyDisplayOrder() {
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
      // if (this._havePropertyFlags(propertyLabel.styleFlags))
      //     this._propertyDisplayOrder.push(propertyLabel.styleFlags);
      // if (this._havePropertyFlags(propertyLabel.extStyleFlags))
      //     this._propertyDisplayOrder.push(propertyLabel.extStyleFlags);
    }

    // Polymorphic function to set behavior flags for the control.
    setBehaviorFlags() {
      // Nothing to do here. Derived classes can set flags.
    }

    // Checks whether any flags listed are in the spec for a flags property with a
    // given label.
    _havePropertyFlags(flagsPropertyLabel) {
      let flagsSpec = this.propertySpec(flagsPropertyLabel);
      return flagsSpec && flagsSpec.haveFlags();
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
    populatePropertySpecs() {
      super.populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    definePropertyDisplayOrder() {
      super.definePropertyDisplayOrder();

      this._propertyDisplayOrder.push(propertyLabel.pushButtonLike);
      this._propertyDisplayOrder.push(propertyLabel.splitButtonLike);
      this._propertyDisplayOrder.push(propertyLabel.toolBarLike);
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
    setBehaviorFlags() {
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          writeAsStringWhenSerialized: true
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
          enums: [
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
          ]
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
    populatePropertySpecs() {
      super.populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    definePropertyDisplayOrder() {
      super.definePropertyDisplayOrder();

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
          writeAsStringWhenSerialized: false
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
    populatePropertySpecs() {
      super.populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    definePropertyDisplayOrder() {
      super.definePropertyDisplayOrder();

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
          writeAsStringWhenSerialized: false
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
    populatePropertySpecs() {
      super.populatePropertySpecs();
      this._addPropertySpecs();
      this._addStyleFlags();
    }

    // Polymorphic function that populates the display order array.
    definePropertyDisplayOrder() {
      super.definePropertyDisplayOrder();

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
          writeAsStringWhenSerialized: false
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

  // Specification for image push button controls.
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
    populatePropertySpecs() {
      super.populatePropertySpecs();
      this._addPropertySpecs();
    }

    // Polymorphic function that populates the display order array.
    definePropertyDisplayOrder() {
      super.definePropertyDisplayOrder();

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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          writeAsStringWhenSerialized: false
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
          enums: [
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_AlphaNumeric',
              display: 'Alphanumeric'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_Numeric',
              display: 'Numeric'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_Percentage',
              display: 'Percentage'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_Angle',
              display: 'Angle'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_Canvas',
              display: 'Canvas'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_CanvasXCoord',
              display: 'Canvas X-Coordinate'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_CanvasYCoord',
              display: 'Canvas Y-Coordinate'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_CanvasXDist',
              display: 'Canvas X-Distance'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_CanvasYDist',
              display: 'Canvas Y-Distance'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_Password',
              display: 'Password'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_PaperSpace',
              display: 'Paper Space'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_Latitude',
              display: 'Latitude'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_Longitude',
              display: 'Longitude'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_DMSAngle',
              display: 'Angle in Degrees Minutes Seconds'
            },
            {
              value: 'Unit,ACDSystems::UI::UnitType::type_Custom',
              display: 'Custom'
            }
          ]
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
          writeAsStringWhenSerialized: false
        })
      );
    }
  }

  // Factory function for control specs based on a given control type.
  function makeControlSpec(ctrlType) {
    switch (ctrlType) {
      case 'ImagePushButton': {
        return new ImagePushButtonSpec();
      }
      case 'Label': {
        return new LabelSpec();
      }
      case 'PlaceHolder': {
        return new PlaceHolderSpec();
      }
      case 'PushButton': {
        return new PushButtonSpec();
      }
      case 'TextBox': {
        return new TextBoxSpec();
      }
      default: {
        throw 'Unexpected control type.';
      }
    }
  }

  ///////////////////

  // Exports
  return {
    controlBehavior: controlBehavior,
    logicalPropertyType: logicalPropertyType,
    makeControlSpec: makeControlSpec,
    makeDialogSpec: makeDialogSpec,
    physicalPropertyType: physicalPropertyType,
    propertyLabel: propertyLabel,
    semanticPropertyTag: semanticPropertyTag
  };
})();
