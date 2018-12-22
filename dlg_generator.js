//
// Resource content generation for Canvas dialog files.
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
cred.spec = tryRequire('./dlg_spec') || cred.spec || {};
var util = tryRequire('./util') || util || {};

///////////////////

// Generator module.
cred.gen = (function() {
  ///////////////////

  // Generates the content of dialog resource and string files.
  class ResourceGenerator {
    constructor(dlgResourceSet) {
      this._dlgResourceSet = dlgResourceSet;
    }

    // Generates the dialog and string content for a given locale.
    // Returns [<dialog content>, <string content>] pair. For the master locale the
    // string content element of the pair will be undefined.
    generateContent(locale) {
      if (locale == cred.locale.any) {
        return this._generateMasterContent();
      }
      return this._generateLanguageContent(cred.languageFromLocale(locale));
    }

    // Generates the dialog content of the master resource.
    // Returns a [<dialog content>, undefined] pair.
    _generateMasterContent() {
      if (this._dlgResourceSet.areAllLanguagesUnlinked()) {
        return this._generateUnlinkedMasterContent();
      }
      return this._generateLinkedMasterContent();
    }

    // Generates the dialog content of the master resource when no language resources
    // are linked to it.
    // Returns a [<dialog content>, undefined] pair.
    _generateUnlinkedMasterContent() {
      const indent = 0;
      const dlgContent = generateAllLanguageDialogIncludes(
        this._dlgResourceSet.dialogId,
        indent
      );
      return [dlgContent, undefined];
    }

    // Generates the dialog content of the master resource when at least one language
    // resource is linked to it.
    // Returns a [<dialog content>, undefined] pair.
    _generateLinkedMasterContent() {
      const dlgContent = this._generateDialogContent(cred.locale.any);
      return [dlgContent, undefined];
    }

    // Generates the dialog and string content for a given language.
    // Returns [<dialog content>, <string content>] pair.
    _generateLanguageContent(language) {
      const locale = cred.localeFromLanguage(language);
      const strContent = this._generateStringContent(language);
      let dlgContent = undefined;
      if (this._dlgResourceSet.isLinkedToMaster(locale)) {
        // Skip the dlg files when all languages are linked to the master resource.
        // Only the master dlg file will be generated.
        if (!this._dlgResourceSet.areAllLanguagesLinked()) {
          dlgContent = this._generateLinkedDialogContent();
        }
      } else {
        dlgContent = this._generateDialogContent(locale);
      }
      return [dlgContent, strContent];
    }

    // Generates dialog content for a linked resource.
    // Returns the content as string.
    _generateLinkedDialogContent() {
      let text = '';
      text += makeLine(0, generateIncludeDirective(this._dlgResourceSet.masterFileName));
      return text;
    }

    // Generates the dialog file content for a given locale.
    // Returns the content as string.
    _generateDialogContent(locale) {
      let resource = this._dlgResourceSet.dialogResource(locale);
      let dlg = resource.dialog;
      const indent = 0;
      const indented_1 = indentLevel(indent, 1);

      let text = '';
      text += generateCppIncludes(indent);
      text += newline;
      text += generateAllLanguageStringIncludes(this._dlgResourceSet.dialogId, indent);
      text += newline;
      text += generateDialogDefintionBeginning(dlg, indent);
      text += generateLabeledDialogProperties(dlg, indented_1);
      text += generateControlDeclarations(dlg, indented_1);
      text += generateControlDefinitions(dlg, indented_1);
      text += generateDialogDefintionEnding(indent);
      text += newline;
      text += generateLayers(resource, indent);
      return text;
    }

    // Generates the string file content for a given language.
    _generateStringContent(language) {
      let text = '';
      let langGen = this._dlgResourceSet.languageStrings(language);
      for (const [id, str] of langGen) {
        text += makeLine(0, generateCppStringDefinition(id, str));
      }
      return text;
    }
  }

  ///////////////////

  const newline = '\n';
  // Number of space to insert for each level of indentation.
  const spacesPerIndentLevel = 4;

  // Returns the number of spaces to insert for a given level of indentation.
  function indentLevel(base, level) {
    return base + level * spacesPerIndentLevel;
  }

  // Returns a string with a given number of spaces.
  function indentBy(count) {
    return ' '.repeat(count);
  }

  // Returns a string with a given indent and content that is terminated by a newline.
  function makeLine(indent, content) {
    return indentBy(indent) + content + newline;
  }

  // Returns the text for a C++ #ifdef-directive.
  function generateIfdefDirective(condition) {
    return `#ifdef ${condition}`;
  }

  // Returns the text for a C++ #elif-directive.
  function generateElifDirective(condition) {
    return `#elif defined ${condition}`;
  }

  // Returns the text for a C++ #error-directive.
  function generateErrorDirective(errText) {
    return `#error "${errText}"`;
  }

  // Returns the text for a C++ #include-directive.
  function generateIncludeDirective(fileName) {
    return `#include "${fileName}"`;
  }

  // Returns the value of a property as a string.
  function generatePropertyValue(item, propLabel) {
    return item.property(propLabel).valueAsString();
  }

  // Generates the string for including a dialog file.
  function generateDialogInclude(dlgName, locale) {
    return generateIncludeDirective(cred.dialogFileName(dlgName, locale));
  }

  // Generates the string for including a string file.
  function generateStringInclude(dlgName, language) {
    return generateIncludeDirective(cred.stringFileName(dlgName, language));
  }

  // Generates the string for the version specifier of the dialog format.
  function generateVersionSpecifier() {
    return `// Version [${cred.resourceVersion}] //`;
  }

  // Generates a line containing the C++ resource includes.
  function generateCppIncludes(indent) {
    return makeLine(
      indent,
      generateIncludeDirective('ResourceDefines.h') + ' ' + generateVersionSpecifier()
    );
  }

  // Generate a block of include directives for the dialog resource files of all
  // languages.
  function generateAllLanguageDialogIncludes(dlgName, baseIndent) {
    const indented_1 = indentLevel(baseIndent, 1);

    let text = '';
    text += makeLine(baseIndent, generateIfdefDirective('RES_US'));
    text += makeLine(indented_1, generateDialogInclude(dlgName, cred.locale.english));
    text += makeLine(baseIndent, generateElifDirective('RES_GERMAN'));
    text += makeLine(indented_1, generateDialogInclude(dlgName, cred.locale.german));
    text += makeLine(baseIndent, generateElifDirective('RES_JAPAN'));
    text += makeLine(indented_1, generateDialogInclude(dlgName, cred.locale.japanese));
    text += makeLine(baseIndent, '#else');
    text += makeLine(indented_1, generateErrorDirective('Translation'));
    text += makeLine(baseIndent, '#endif');
    return text;
  }

  // Generate a block of include directives for the string resource files of all
  // languages.
  function generateAllLanguageStringIncludes(dlgName, baseIndent) {
    const indented_1 = indentLevel(baseIndent, 1);

    let text = '';
    text += makeLine(baseIndent, generateIfdefDirective('RES_US'));
    text += makeLine(indented_1, generateStringInclude(dlgName, cred.language.english));
    text += makeLine(baseIndent, generateElifDirective('RES_GERMAN'));
    text += makeLine(indented_1, generateStringInclude(dlgName, cred.language.german));
    text += makeLine(baseIndent, generateElifDirective('RES_JAPAN'));
    text += makeLine(indented_1, generateStringInclude(dlgName, cred.language.japanese));
    text += makeLine(baseIndent, '#else');
    text += makeLine(indented_1, generateErrorDirective('Translation'));
    text += makeLine(baseIndent, '#endif');
    return text;
  }

  // Generates the beginning of a dialog's definition section.
  function generateDialogDefintionBeginning(dlg, indent) {
    return makeLine(
      indent,
      'begin_dialog_definition_ex_(' + generatePositionalDialogProperties(dlg) + ')'
    );
  }

  // Generates the end of a dialog's definition section.
  function generateDialogDefintionEnding(indent) {
    return makeLine(indent, 'end_dialog_definition_ex_()');
  }

  // Generates the positional properties of a given dialog.
  function generatePositionalDialogProperties(dlg) {
    let text = '';
    text += dlg.id + ',';
    text +=
      `"${generateSerializedItemProperties(dlg, cred.spec.makeDialogSpec())}"` + ',';
    text += generatePropertyValue(dlg, cred.spec.propertyLabel.left) + ',';
    text += generatePropertyValue(dlg, cred.spec.propertyLabel.top) + ',';
    text += generatePropertyValue(dlg, cred.spec.propertyLabel.width) + ',';
    text += generatePropertyValue(dlg, cred.spec.propertyLabel.height) + ',';
    text += generatePropertyValue(dlg, cred.spec.propertyLabel.text) + ',';
    text += generatePropertyValue(dlg, cred.spec.propertyLabel.resourceClass) + ',';
    text += generatePropertyValue(dlg, cred.spec.propertyLabel.styleFlags) + ',';
    text += generatePropertyValue(dlg, cred.spec.propertyLabel.font) + ',';
    text += generatePropertyValue(dlg, cred.spec.propertyLabel.fontSize);
    return text;
  }

  // Generates the control declaration section for a given dialog.
  function generateControlDeclarations(dlg, indent) {
    let text = '';
    for (const ctrl of dlg.controls()) {
      text += makeLine(indent, generateControlDeclaration(ctrl));
    }
    return text;
  }

  // Generates the declaration for a given control.
  function generateControlDeclaration(ctrl) {
    return (
      'declare_control(' +
      generatePropertyValue(ctrl, cred.spec.propertyLabel.ctrlType) +
      ',' +
      ctrl.id +
      ')'
    );
  }

  // Generates the control definition section for a given dialog.
  function generateControlDefinitions(dlg, indent) {
    const indented_1 = indentLevel(indent, 1);
    let text = '';
    text += makeLine(indent, 'begin_control_definitions()');
    for (const ctrl of dlg.controls()) {
      text += generateControlDefinition(ctrl, indented_1);
    }
    text += makeLine(indent, 'end_control_definitions()');
    return text;
  }

  // Generates the definition for a given control.
  function generateControlDefinition(ctrl, indent) {
    const indented_1 = indentLevel(indent, 1);
    let text = '';
    text += generateControlDefintionBeginning(ctrl, indent);
    text += generateLabeledControlProperties(ctrl, indented_1);
    text += generateControlDefintionEnding(indent);
    return text;
  }

  // Generates the beginning of a control declaration.
  function generateControlDefintionBeginning(ctrl, indent) {
    return makeLine(
      indent,
      'begin_control_ex(' + generatePositionalControlProperties(ctrl) + ')'
    );
  }

  // Generates the end of a control declaration.
  function generateControlDefintionEnding(indent) {
    return makeLine(indent, 'end_control_ex()');
  }

  // Generates the positional properties for a given control.
  function generatePositionalControlProperties(ctrl) {
    let text = '';
    text += generatePropertyValue(ctrl, cred.spec.propertyLabel.ctrlType) + ',';
    text += generatePropertyValue(ctrl, cred.spec.propertyLabel.resourceClass) + ',';
    text += ctrl.id + ',';
    text += generateControlCaption(ctrl) + ',';
    text += generatePropertyValue(ctrl, cred.spec.propertyLabel.left) + ',';
    text += generatePropertyValue(ctrl, cred.spec.propertyLabel.top) + ',';
    text += generatePropertyValue(ctrl, cred.spec.propertyLabel.width) + ',';
    text += generatePropertyValue(ctrl, cred.spec.propertyLabel.height) + ',';
    text += generatePropertyValue(ctrl, cred.spec.propertyLabel.styleFlags) + ',';
    text += generatePropertyValue(ctrl, cred.spec.propertyLabel.extStyleFlags);
    return text;
  }

  // Generates the caption property for a given control.
  function generateControlCaption(ctrl) {
    const ctrlSpec = cred.spec.makeControlSpec(ctrl.type);
    if (ctrlSpec.hasBehaviorFlag(cred.spec.controlBehavior.serializeProperties)) {
      return `"${generateSerializedItemProperties(ctrl, ctrlSpec)}"`;
    }

    const captionProp = ctrl.property(cred.spec.propertyLabel.text);
    return captionProp ? captionProp.valueAsString() : '""';
  }

  // Generates the serialized properties for a given control.
  function generateSerializedItemProperties(item, itemSpec) {
    let text = '{';

    let numSerizalizedProps = 0;
    for (let propSpec of itemSpec.propertySpecs()) {
      let serialized = generateSerializedItemProperty(
        item.id,
        item.property(propSpec.label),
        propSpec
      );
      if (serialized.length > 0) {
        text += serialized;
        ++numSerizalizedProps;
      }
    }

    text += '}';
    return numSerizalizedProps > 0 ? text : '';
  }

  // // Decides whether to generate the serialized representation of a given property.
  function generateSerializedItemProperty(itemId, property, propertySpec) {
    let text = '';
    if (propertySpec.writeSerialized()) {
      if (property) {
        if (property.hasValue()) {
          text += generateSerializedProperty(property, propertySpec);
        } else if (!propertySpec.isNullable()) {
          throw new Error(
            `Non-nullable property '${
              propertySpec.label
            }' doesn't have a value in definition of ${itemId}.`
          );
        }
      } else if (propertySpec.isRequired()) {
        throw new Error(
          `Required property '${
            propertySpec.label
          }' not present in definition of ${itemId}.`
        );
      }
    }
    return text;
  }

  // Generates the serialized representation of a given property.
  function generateSerializedProperty(property, spec) {
    let generatedValue = property.valueAsString();
    if (spec.writeAsStringWhenLabeled()) {
      // Serialized string values are surrounded by two double-quotes.
      generatedValue = `""${generatedValue}""`;
    }
    return `[${property.label}=${generatedValue}]`;
  }

  // Generates the labeled properties for a given control.
  function generateLabeledControlProperties(ctrl, indent) {
    let text = '';
    text += generateLabeledItemProperties(
      ctrl,
      cred.spec.makeControlSpec(ctrl.type),
      indent,
      'define_property'
    );
    return text;
  }

  // Generates the labeled properties for a given dialog.
  function generateLabeledDialogProperties(dlg, indent) {
    let text = '';
    text += makeLine(indent, 'begin_dialog_properties()');
    text += generateLabeledItemProperties(
      dlg,
      cred.spec.makeDialogSpec(),
      indentLevel(indent, 1),
      'define_dialog_property'
    );
    text += makeLine(indent, 'end_dialog_properties()');
    return text;
  }

  // Generates the labeled properties for a given item.
  function generateLabeledItemProperties(item, itemSpec, indent, keyword) {
    const sortedLabels = Array.from(itemSpec.propertyLabels()).sort(
      // Note that the labels cannot be equal because keys of a map have to be distinct.
      (a, b) => (a > b ? 1 : -1)
    );

    let text = '';
    for (const label of sortedLabels) {
      let labeled = generateLabeledItemProperty(
        item.id,
        item.property(label),
        itemSpec.propertySpec(label),
        keyword
      );
      if (labeled.length > 0) {
        text += makeLine(indent, labeled);
      }
    }
    return text;
  }

  // Decides whether to generate the labeled representation of a given property.
  function generateLabeledItemProperty(itemId, property, propertySpec, keyword) {
    let text = '';
    if (propertySpec.writeLabeled()) {
      const propLabel = propertySpec.label;
      if (property) {
        if (property.hasValue() || propertySpec.isNullable()) {
          text += generateLabeledProperty(property, propertySpec, keyword);
        } else {
          throw new Error(
            `Non-nullable property '${propLabel}' doesn't have a value in control definition of ${itemId}.`
          );
        }
      } else if (propertySpec.isRequired()) {
        throw new Error(
          `Required property '${propLabel}' not present in item definition of ${itemId}.`
        );
      }
    }
    return text;
  }

  // Generates the labeled representation of a given property.
  function generateLabeledProperty(property, spec, keyword) {
    let generatedValue = property.valueAsString();
    if (spec.writeAsStringWhenLabeled() && !util.isSurroundedBy(generatedValue, '"')) {
      generatedValue = `"${generatedValue}"`;
    }
    return `${keyword}(${property.label},${generatedValue})`;
  }

  // Generates the layers section of a dialog resource.
  function generateLayers(dlgResource, indent) {
    const indented_1 = indentLevel(indent, 1);
    let text = '';
    text += makeLine(indent, '#if 0');
    text += newline;
    text += makeLine(indent, 'BEGIN_LAYERS');
    for (let layer of dlgResource.layers()) {
      text += generateLayer(layer, indented_1);
    }
    text += makeLine(indent, 'END_LAYERS');
    text += newline;
    text += makeLine(indent, '#endif');
    return text;
  }

  // Generates the section for a given layer of a dialog resource.
  function generateLayer(layer, indent) {
    const indented_1 = indentLevel(indent, 1);
    let text = '';
    text += makeLine(indent, `BEGIN_LAYER "${layer.name}"`);
    for (const num of layer.numbers()) {
      text += makeLine(indented_1, num);
    }
    text += makeLine(indent, 'END_LAYER');
    return text;
  }

  // Returns the string for C++ #define.
  function generateCppStringDefinition(id, text) {
    return `#define ${id} "${text}"`;
  }

  ///////////////////

  // Exports
  return {
    ResourceGenerator: ResourceGenerator
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.gen;
