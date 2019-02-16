//
// Parser for Canvas dialogs.
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
cred.resource = tryRequire('./dlg_resource') || cred.resource || {};
var filesys = tryRequire('./filesys') || filesys || {};
var util = tryRequire('./util') || util || {};

///////////////////

// Parser module.
cred.parser = (function() {
  ///////////////////

  // Parser base class.
  class Parser {
    constructor(tokens) {
      // Array of tokens.
      this._tokens = tokens || [];
      // Index of next token to process.
      this._tokenIdx = 0;
    }

    // Checks whether another token is available.
    haveToken() {
      return this._tokenIdx < this._tokens.length;
    }

    // Returns the number of tokens.
    countTokens() {
      return this._tokens.length;
    }

    // Returns the next token.
    nextToken() {
      if (!this.haveToken()) {
        throw new Error('Syntax error. Unexpected end of file.');
      }
      return this._tokens[this._tokenIdx++];
    }

    // Goes back one token. The next call to get a token will return the same
    // token as the previous call.
    backUpToken() {
      --this._tokenIdx;
    }

    // Returns a token that is a given number of positions ahead in the token
    // sequence.
    peekAheadBy(numTokens) {
      const peekIdx = this._tokenIdx + numTokens - 1;
      if (peekIdx >= this._tokens.length) {
        throw new Error('Peeked past end.');
      }
      return this._tokens[peekIdx];
    }

    token(idx) {
      if (idx >= this.countTokens()) {
        throw new Error('Invalid argument. Token index too high.');
      }
      return this._tokens[idx];
    }
  }

  ///////////////////

  // Parser for .dlg resource files.
  class DialogParser extends Parser {
    constructor(tokens, locale) {
      super(tokens);
      this._dlgResource = new cred.resource.DialogResource(locale);
    }

    // Starts the parsing process.
    parse() {
      if (!this.haveToken()) {
        return undefined;
      }
      if (this._isIncludingOtherDlgFile()) {
        return undefined;
      }
      this._parseIncludes(this.nextToken());
      this._parseDialogDefinition(this.nextToken());
      this._parseLayerMetadata(this.nextToken());
      return this._dlgResource;
    }

    // Checks if the file is including another .dlg file instead of defining
    // a dialog.
    _isIncludingOtherDlgFile() {
      if (this.countTokens() < 2) {
        return false;
      }
      // Check for only one .dlg include. Occurrs when language .dlg file includes the
      // master .dlg file.
      let firstToken = this.token(0);
      let secondToken = this.token(1);
      if (
        firstToken.isMatch(cred.tokenKind.directive, '#include') &&
        secondToken.isKind(cred.tokenKind.string) &&
        filesys.extractExtension(secondToken.value).toLowerCase() === 'dlg'
      ) {
        return true;
      }
      // Check for multiple .dlg includes for different languages. Occurrs when the
      // master .dlg file includes .dlg files for all unlinked languages.
      let thirdToken = this.token(2);
      let fourthToken = this.token(3);
      if (
        firstToken.isMatch(cred.tokenKind.directive, '#ifdef') &&
        thirdToken.isMatch(cred.tokenKind.directive, '#include') &&
        fourthToken.isKind(cred.tokenKind.string) &&
        filesys.extractExtension(fourthToken.value).toLowerCase() === 'dlg'
      ) {
        return true;
      }
      return false;
    }

    // Parses the 'include' section of the resource.
    _parseIncludes(token) {
      this._dlgResource.addIncludedHeader(parseInclude(this, token));
      this._dlgResource.version = parseVersion(this, this.nextToken());
      this._parseStringIncludes(this.nextToken());
    }

    // Parses the includes for the dialog's string files.
    _parseStringIncludes(token) {
      // Three ifdef's for the strings files of the supported languages.
      // Each file is parsed to collect the strings.
      this._parseStringInclude(token);
      this._parseStringInclude(this.nextToken());
      this._parseStringInclude(this.nextToken());
      // Followed by an else-error-endif block.
      parseElseDirective(this, this.nextToken());
      parseErrorDirective(this, this.nextToken());
      parseEndifDirective(this, this.nextToken());
    }

    // Parses a language specific include directive for a string file.
    _parseStringInclude(token) {
      // Read Canvas language macro from #ifdef/#elif-directive.
      let cvLangMacro = undefined;
      if (token.isMatch(cred.tokenKind.directive, '#ifdef')) {
        cvLangMacro = parseIfdefDirective(this, token);
      } else if (token.isMatch(cred.tokenKind.directive, '#elif')) {
        cvLangMacro = parseElifDirective(this, token);
      } else {
        throw new Error('Syntax error. Expected ifdef- or elif-directive.');
      }
      const lang = languageFromCanvasLanguageMacro(cvLangMacro);
      if (!lang) {
        throw new Error('Syntax error. Expected language identifier.');
      }

      // Read the file name from the include-directive.
      let fileName = parseInclude(this, this.nextToken());

      this._dlgResource.addStringFile(lang, fileName);
    }

    // Parses the definition of a dialog.
    _parseDialogDefinition(token) {
      verifyToken(token, cred.tokenKind.keyword, 'begin_dialog_definition_ex_');

      this._parsePositionalDialogProperties(this.nextToken());
      this._parseLabeledDialogProperties(this.nextToken());
      this._parseControlDeclarations(this.nextToken());
      this._parseControlDefinitions(this.nextToken());

      verifyToken(this.nextToken(), cred.tokenKind.keyword, 'end_dialog_definition_ex_');
      verifyToken(this.nextToken(), cred.tokenKind.openParenthesis);
      verifyToken(this.nextToken(), cred.tokenKind.closeParenthesis);
    }

    // Parses the positional properties of a dialog.
    _parsePositionalDialogProperties(token) {
      // Abbreviations for long names.
      const propLabel = cred.spec.propertyLabel;
      const physType = cred.spec.physicalPropertyType;
      // Define the expected properties and their order.
      const positionalSpec = [
        {
          label: propLabel.id,
          types: [physType.identifier],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: '<none>',
          types: undefined,
          func: parseSerializedProperties,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.left,
          types: [physType.number],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.top,
          types: [physType.number],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.width,
          types: [physType.number],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.height,
          types: [physType.number],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.text,
          // The title of the dialog could be either an identifier for a localized
          // string or an empty string.
          types: [physType.identifier, physType.string],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.resourceClass,
          types: [physType.string],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.styleFlags,
          types: [physType.flags],
          func: parseFlags,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.font,
          types: [physType.string],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.fontSize,
          types: [physType.number],
          func: parsePositionalProperty,
          divider: cred.tokenKind.closeParenthesis
        }
      ];

      parsePositionalProperties(this, token, positionalSpec, this._dlgResource);
    }

    // Parses the labeled properties (key-value pairs) of a dialog.
    _parseLabeledDialogProperties(token) {
      verifyToken(token, cred.tokenKind.keyword, 'begin_dialog_properties');
      verifyToken(this.nextToken(), cred.tokenKind.openParenthesis);
      verifyToken(this.nextToken(), cred.tokenKind.closeParenthesis);

      token = this.nextToken();
      while (token.isMatch(cred.tokenKind.keyword, 'define_dialog_property')) {
        parseLabeledProperty(this, token, 'define_dialog_property', this._dlgResource);
        token = this.nextToken();
      }

      verifyToken(token, cred.tokenKind.keyword, 'end_dialog_properties');
      verifyToken(this.nextToken(), cred.tokenKind.openParenthesis);
      verifyToken(this.nextToken(), cred.tokenKind.closeParenthesis);
    }

    // Parses the control declarations of a dialog.
    _parseControlDeclarations(token) {
      while (token.isMatch(cred.tokenKind.keyword, 'declare_control')) {
        this._parseControlDeclaration(token);
        token = this.nextToken();
      }

      this.backUpToken();
    }

    // Parses a control declaration.
    _parseControlDeclaration(token) {
      verifyToken(token, cred.tokenKind.keyword, 'declare_control');
      verifyToken(this.nextToken(), cred.tokenKind.openParenthesis);

      let controlType = parseIdentifier(this.nextToken());
      verifyToken(this.nextToken(), cred.tokenKind.comma);

      let controlId = parseIdentifier(this.nextToken());
      verifyToken(this.nextToken(), cred.tokenKind.closeParenthesis);

      this._dlgResource.addControl(new cred.resource.Control(controlType, controlId));
    }

    // Parses the control definitions of a dialog.
    _parseControlDefinitions(token) {
      verifyToken(token, cred.tokenKind.keyword, 'begin_control_definitions');
      verifyToken(this.nextToken(), cred.tokenKind.openParenthesis);
      verifyToken(this.nextToken(), cred.tokenKind.closeParenthesis);

      token = this.nextToken();
      while (token.isMatch(cred.tokenKind.keyword, 'begin_control_ex')) {
        this._parseControlDefinition(token);
        token = this.nextToken();
      }

      verifyToken(token, cred.tokenKind.keyword, 'end_control_definitions');
      verifyToken(this.nextToken(), cred.tokenKind.openParenthesis);
      verifyToken(this.nextToken(), cred.tokenKind.closeParenthesis);
    }

    // Parses a control definition.
    _parseControlDefinition(token) {
      verifyToken(token, cred.tokenKind.keyword, 'begin_control_ex');

      let ctrlIdToken = this.peekAheadBy(6);
      verifyToken(
        ctrlIdToken,
        cred.tokenKind.identifier,
        undefined,
        'Syntax error. Control id not found.'
      );
      let ctrlId = ctrlIdToken.value;
      let ctrl = this._dlgResource.control(ctrlId);

      this._parsePositionalControlProperties(this.nextToken(), ctrl);
      this._parseLabeledControlProperties(this.nextToken(), ctrl);

      verifyToken(this.nextToken(), cred.tokenKind.keyword, 'end_control_ex');
      verifyToken(this.nextToken(), cred.tokenKind.openParenthesis);
      verifyToken(this.nextToken(), cred.tokenKind.closeParenthesis);
    }

    // Parses the positional properties of a control.
    _parsePositionalControlProperties(token, ctrl) {
      // Abbreviations for long names.
      const propLabel = cred.spec.propertyLabel;
      const physType = cred.spec.physicalPropertyType;
      // Define the expected properties and their order.
      const positionalSpec = [
        {
          label: propLabel.ctrlType,
          types: [physType.identifier],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.resourceClass,
          types: [physType.identifier],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.id,
          types: [physType.identifier],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: '<none>',
          types: undefined,
          func: parseControlCaption,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.left,
          types: [physType.number],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.top,
          types: [physType.number],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.width,
          types: [physType.number],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.height,
          types: [physType.number],
          func: parsePositionalProperty,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.styleFlags,
          types: [physType.flags],
          func: parseFlags,
          divider: cred.tokenKind.comma
        },
        {
          label: propLabel.extStyleFlags,
          types: [physType.flags],
          func: parseFlags,
          divider: cred.tokenKind.closeParenthesis
        }
      ];

      parsePositionalProperties(this, token, positionalSpec, ctrl);
    }

    // Parses the labeled properties (key-value pairs) of a control.
    _parseLabeledControlProperties(token, ctrl) {
      while (token.isMatch(cred.tokenKind.keyword, 'define_property')) {
        parseLabeledProperty(this, token, 'define_property', ctrl);
        token = this.nextToken();
      }

      this.backUpToken();
    }

    // Parses the layer metadata section of a resource file.
    _parseLayerMetadata(token) {
      verifyToken(token, cred.tokenKind.directive, '#if');
      verifyToken(
        this.nextToken(),
        cred.tokenKind.number,
        0,
        'Syntax error. Expected "0" as condition of if-directive.'
      );

      this._parseLayers(this.nextToken());

      verifyToken(this.nextToken(), cred.tokenKind.directive, '#endif');
    }

    // Parses the layers section of a resource file.
    _parseLayers(token) {
      verifyToken(token, cred.tokenKind.identifier, 'BEGIN_LAYERS');

      token = this.nextToken();
      while (token.isMatch(cred.tokenKind.identifier, 'BEGIN_LAYER')) {
        this._parseLayer(token);
        token = this.nextToken();
      }

      verifyToken(token, cred.tokenKind.identifier, 'END_LAYERS');
    }

    // Parses a layer in the layers section of a resource file.
    _parseLayer(token) {
      verifyToken(token, cred.tokenKind.identifier, 'BEGIN_LAYER');

      const name = parseString(this.nextToken());
      let layerDef = new cred.resource.Layer(name);
      token = this.nextToken();
      while (token.isKind(cred.tokenKind.number)) {
        layerDef.addNumber(parseNumber(token));
        token = this.nextToken();
      }
      this._dlgResource.addLayer(layerDef);

      verifyToken(token, cred.tokenKind.identifier, 'END_LAYER');
    }
  }

  // Parses given tokens of a dialog resource file.
  // Returns a dialog resource object generated from tokens.
  function parseDialog(tokens, locale) {
    let parser = new DialogParser(tokens, locale);
    return parser.parse();
  }

  ///////////////////

  // Parser for .str resource files.
  class StringParser extends Parser {
    constructor(tokens, language) {
      super(tokens);
      this._language = language;
      this._stringMap = new cred.resource.StringMap();
    }

    // Starts the parsing process.
    parse() {
      let id, text;
      while (this.haveToken()) {
        [id, text] = this._parseStringDefinition(this.nextToken());
        this._stringMap.add(id, text, this._language);
      }
      return this._stringMap;
    }

    // Parses the definition of a string.
    _parseStringDefinition(token) {
      verifyToken(token, cred.tokenKind.directive, '#define');
      let id = verifyToken(this.nextToken(), cred.tokenKind.identifier);
      let text = verifyToken(this.nextToken(), cred.tokenKind.string);
      return [id, text];
    }
  }

  // Parses given tokens of a string resource file.
  // Returns a string map object generated from the tokens.
  function parseStrings(tokens, language) {
    if (typeof tokens === 'undefined') {
      throw new Error('Invalid arguments. Tokens expected.');
    }
    let parser = new StringParser(tokens, language);
    return parser.parse();
  }

  ///////////////////

  // API to handle serialized properties.

  // Parses serialized properties starting with a given token and adds the properties
  // to a given target object.
  function parseSerializedProperties(parser, token, target) {
    verifyToken(
      token,
      cred.tokenKind.string,
      undefined,
      'String with serialized properties expected.'
    );

    const serializedProps = token.value;
    const labeledValues = deserializeProperties(serializedProps);
    for (let labeledVal of labeledValues) {
      const type = typeOfSerializedPropertyValue(labeledVal.value);
      let property = cred.resource.makeProperty(
        labeledVal.label,
        type,
        convertSerializedPropertyValueToType(labeledVal.value, type)
      );
      target.addSerializedProperty(labeledVal.label, property);
    }
  }

  // Deserializes a given string of serialized label-value pairs into an array of
  // objects with 'label' and 'value' fields.
  // The serialized properties have the following format:
  //      {[label1=value1][label2=value2][label2=value2]...}
  // If a value is a string it is enclosed in two double-quotes, e.g.
  //      [label=""strval""].
  // Unfortunately, there is a special case to allow specifying the caption text
  // as whose value these properties are encoded. This is done by appending
  // 'Caption=""' (without the single quotes) after the closing curly braces of
  // the property pairs, e.g.
  //      {[label1=value1][label2=value2][label2=value2]...}Caption="caption_value"
  function deserializeProperties(serialized) {
    serialized = serialized.trim();
    let len = serialized.length;
    if (len === 0) {
      return [];
    }

    if (
      !(
        serialized.startsWith('{') || serialized.startsWith(cred.serializedCaptionLabel)
      ) ||
      !(serialized.endsWith('}') || serialized.endsWith('"'))
    ) {
      throw new Error('Invalid serialized properties.');
    }

    let serializedPairs = undefined;
    let caption = undefined;
    if (serialized.startsWith('{')) {
      [serializedPairs, caption] = serialized.split('}');
    } else {
      caption = serialized;
    }

    let props = [];
    if (serializedPairs) {
      // Trim off the starting brace. Note that the closing brace has already been
      // trimmed off by the splt operation.
      props = deserializePropertySequence(serializedPairs.substring(1));
    }
    if (caption) {
      props.push(deserializeCaptionProperty(caption));
    }
    return props;
  }

  // Deserializes a given string holding a sequence of key-value property pairs into
  // an array of  objects with 'label' and 'value' fields.
  // The property pair sequence has the following format:
  //      [label1=value1][label2=value2][label2=value2]...
  function deserializePropertySequence(pairs) {
    return (
      pairs
        // Split properties into array at '['s.
        .split('[')
        // Transform into array of property objects.
        .map(elem => {
          elem = elem.trim();
          if (elem === '') {
            return undefined;
          }
          // For each element, trim off whitespace and the left over ']'. Then split the
          // label and value.
          let [label, value] = elem.substring(0, elem.length - 1).split('=');
          // Strings are enclosed in double-double-quotes. Trim those off.
          if (value.startsWith('""') && value.endsWith('""')) {
            value = value.substring(2, value.length - 2);
          }
          // Return an object for the element.
          return {
            label: label,
            value: value
          };
        })
        // Remove undefined elements.
        .filter(elem => elem)
    );
  }

  // Deserializes the serialized caption property of a control. Returns the deserialized
  // caption property as an object with 'label' and 'value' fields.
  // The serialized caption property has the following format:
  //    Caption="my caption"
  function deserializeCaptionProperty(serializedCaption) {
    if (!serializedCaption.startsWith(cred.serializedCaptionLabel)) {
      throw new Error('Invalid serialized caption.');
    }
    return {
      label: cred.spec.propertyLabel.text,
      // Trim the label, separator, and the double-quotes around the caption value.
      value: serializedCaption.substring(
        cred.serializedCaptionLabel.length + 1,
        serializedCaption.length - 1
      )
    };
  }

  // Determines the type of a given string value.
  // Returns the physical property type.
  function typeOfSerializedPropertyValue(valueAsStr) {
    // If it is empty or enclosed in double-quotes, it's a string.
    if (
      valueAsStr.length === 0 ||
      (valueAsStr.startsWith('"') && valueAsStr.endsWith('"'))
    ) {
      return cred.spec.physicalPropertyType.string;
    }
    // If it does not contain anything but digits, '.', and '-', then it's
    // a number
    else if (valueAsStr.search(/[^\d.-]/) === -1) {
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
  // Returns the converted value.
  function convertSerializedPropertyValueToType(valueAsStr, type) {
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
        throw new Error('Flags are not supported as serialized properties. Implement!');
      }
      default: {
        throw new Error('Unexpected physical property type to convert to.');
      }
    }
  }

  ///////////////////

  // Lower level functions for parsing individual pieces of a resource file.
  // Mostly functions that get called from multiple higher level parsing functions.

  // Parses the the resource version.
  // Returns the format value as string.
  function parseVersion(parser, token) {
    // The version is kept inside a C++ comment to allow the file to be
    // included in other C++ files.
    verifyToken(token, cred.tokenKind.comment);
    let version = findVersionSpecifier(token.value);
    if (!version) {
      throw new Error('Syntax error. Expected format version.');
    }
    return version;
  }

  // Parses positional properties according to a given spec for a given target
  // object.
  function parsePositionalProperties(parser, token, positionalSpec, target) {
    verifyToken(token, cred.tokenKind.openParenthesis);

    const numPosProps = positionalSpec.length;
    for (let i = 0; i < numPosProps; ++i) {
      positionalSpec[i].func(parser, parser.nextToken(), target, positionalSpec[i]);
      verifyToken(parser.nextToken(), positionalSpec[i].divider);
    }
  }

  // Parses a positional property starting with a given token and adds the property
  // to a given target object.
  function parsePositionalProperty(parser, token, target, propertySpec) {
    let [propValue, propType] = determinePropertyValueAndType(token);
    const isTypePermitted = propertySpec.types.indexOf(propType) !== -1;
    if (!isTypePermitted) {
      throw new Error('Unexpected property type.');
    }

    let property = cred.resource.makeProperty(propertySpec.label, propType, propValue);
    target.addPositionalProperty(propertySpec.label, property);
  }

  // Parses a sequence of flags starting with a given token and adds the flags
  // to a given target object.
  function parseFlags(parser, token, target, propertySpec) {
    let property = cred.resource.makeProperty(
      propertySpec.label,
      cred.spec.physicalPropertyType.flags,
      0
    );

    while (token.isKind(cred.tokenKind.identifier)) {
      property.addFlag(parseIdentifier(token));
      verifyToken(parser.nextToken(), cred.tokenKind.binaryOr);
      token = parser.nextToken();
    }
    property.value = parseNumber(token);

    target.addPositionalProperty(propertySpec.label, property);
  }

  // Parses the caption field of a given control starting with a given token.
  // The caption field can hold either an identifier for the caption text or
  // a string with serialized properties for the control.
  function parseControlCaption(parser, token, ctrl) {
    if (token.isKind(cred.tokenKind.identifier)) {
      let property = cred.resource.makeProperty(
        cred.spec.propertyLabel.text,
        cred.spec.physicalPropertyType.identifier,
        token.value
      );
      ctrl.addLabeledProperty(cred.spec.propertyLabel.text, property);
    } else if (token.isKind(cred.tokenKind.string)) {
      parseSerializedProperties(parser, token, ctrl);
    } else {
      throw new Error('Control has invalid caption field.');
    }
  }

  // Parses a labeled property introduced by a given keyword. Assigns the
  // property to a given target object.
  function parseLabeledProperty(parser, token, keyword, target) {
    verifyToken(token, cred.tokenKind.keyword, keyword);
    verifyToken(parser.nextToken(), cred.tokenKind.openParenthesis);

    let label = parseIdentifier(parser.nextToken());
    verifyToken(parser.nextToken(), cred.tokenKind.comma);

    let [value, type] = determinePropertyValueAndType(parser.nextToken());
    verifyToken(parser.nextToken(), cred.tokenKind.closeParenthesis);

    let property = cred.resource.makeProperty(label, type, value);
    target.addLabeledProperty(label, property);
  }

  // Determines the value and type of a property based on a given token.
  // Returns a value-type tuple.
  function determinePropertyValueAndType(token) {
    switch (token.kind) {
      case cred.tokenKind.number: {
        return [token.value, cred.spec.physicalPropertyType.number];
      }
      case cred.tokenKind.string: {
        return [token.value, cred.spec.physicalPropertyType.string];
      }
      case cred.tokenKind.identifier: {
        return [token.value, cred.spec.physicalPropertyType.identifier];
      }
      default: {
        throw new Error(
          'Syntax error. Expected a number, string, or identifier as property value.'
        );
      }
    }
  }

  // Parses an include-directive.
  // Returns the name of the included file.
  function parseInclude(parser, token) {
    verifyToken(token, cred.tokenKind.directive, '#include');
    return verifyToken(
      parser.nextToken(),
      cred.tokenKind.string,
      undefined,
      'Syntax error. Expected file name of include-directive.'
    );
  }

  // Parses an ifdef-directive.
  // Returns the identifier that represents the ifdef's condition.
  function parseIfdefDirective(parser, token) {
    verifyToken(token, cred.tokenKind.directive, '#ifdef');
    return verifyToken(
      parser.nextToken(),
      cred.tokenKind.identifier,
      undefined,
      'Syntax error. Expected identifier of ifdef-directive.'
    );
  }

  // Parses an elif-directive.
  // Returns the identifier that represents the elif's condition.
  function parseElifDirective(parser, token) {
    verifyToken(token, cred.tokenKind.directive, '#elif');
    token = parser.nextToken();
    verifyToken(
      token,
      cred.tokenKind.identifier,
      undefined,
      'Syntax error. Expected identifier of elif-directive.'
    );
    // Check for an optional 'defined' that got parsed as an identifier.
    // In that case the next token will be the identifier for the elif's
    // condition
    if (token.value === 'defined') {
      token = parser.nextToken();
      verifyToken(
        token,
        cred.tokenKind.identifier,
        undefined,
        'Syntax error. Expected identifier of elif-directive.'
      );
    }
    return token.value;
  }

  // Parses an else-directive.
  function parseElseDirective(parser, token) {
    verifyToken(token, cred.tokenKind.directive, '#else');
  }

  // Parses an endif-directive.
  function parseEndifDirective(parser, token) {
    verifyToken(token, cred.tokenKind.directive, '#endif');
  }

  // Parses an error-directive.
  function parseErrorDirective(parser, token) {
    verifyToken(token, cred.tokenKind.directive, '#error');
    verifyToken(
      parser.nextToken(),
      cred.tokenKind.string,
      undefined,
      'Syntax error. Expected text of error-directive.'
    );
  }

  // Checks that a given token is an identifier and returns its value.
  // Throws an exception, if not.
  function parseIdentifier(token) {
    verifyToken(token, cred.tokenKind.identifier);
    return token.value;
  }

  // Checks that a given token is a number and returns its value.
  // Throws an exception, if not.
  function parseNumber(token) {
    verifyToken(token, cred.tokenKind.number);
    return token.value;
  }

  // Checks that a given token is a string and returns its value.
  // Throws an exception, if not.
  function parseString(token) {
    verifyToken(token, cred.tokenKind.string);
    return token.value;
  }

  ///////////////////

  // Verifies that a given token is of a given kind and optionally has a given
  // value. Throws given error, if not.
  // Returns the value of the token.
  function verifyToken(token, expectedKind, expectedValue, errMsg) {
    if (!token.isMatch(expectedKind, expectedValue)) {
      throw new Error(
        typeof errMsg !== 'undefined'
          ? errMsg
          : buildErrorMessage(token, expectedKind, expectedValue)
      );
    }
    return token.value;
  }

  // Builds a default error message based on what was expected at the point of the
  // error.
  function buildErrorMessage(token, expectedTokenKind, expectedValue) {
    let msg = 'Syntax error. Expected ';
    if (expectedValue) {
      msg += `${expectedValue} `;
    }
    const expectedTokenName = cred.tokenKindName(expectedTokenKind);
    msg += `${expectedTokenName}.`;
    return msg;
  }

  ///////////////////

  // Detects if the given text contains a version specifier of the form:
  //   Version [1.0]
  // Returns the detected version as string or 'undefined'.
  function findVersionSpecifier(text) {
    // Pattern to match the version specifier.
    // The pattern inside the brackets matches a sequence of at least one
    // digit follow by optionally more digits separated by periods.
    // Expressions inside parenthesis are captured except when ?: are the
    // first chararters inside the parenthesis. In that case it's a non-
    // capturing group. Here we only want to capture the entire version
    // value.
    let pattern = /Version \[(\d+(?:\.\d+)*)\]/i;
    let found = text.match(pattern);
    return found ? found[1] : undefined;
  }

  // Returns the language that correspondes to a Canvas language macro.
  function languageFromCanvasLanguageMacro(cvMacro) {
    const languageLookup = {
      RES_US: cred.language.english,
      RES_JAPAN: cred.language.japanese,
      RES_GERMAN: cred.language.german
    };
    return languageLookup[cvMacro];
  }

  ///////////////////

  // Exports
  return {
    parseDialog: parseDialog,
    parseStrings: parseStrings
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.parser;
