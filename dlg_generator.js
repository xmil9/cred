//
// Resource content generation for Canvas dialog files.
//
'use strict';

///////////////////

// Imports
// These are provided through (ordered!) script tags in the HTML file.
var cred = cred || {};
var util = util || {};

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
    // string content will be undefined.
    generateContent(locale) {
      if (locale == cred.locale.any) {
        return this._generateMasterContent();
      }
      return this._generateLanguageContent(cred.languageFromLocale(locale));
    }

    _generateMasterContent() {
      if (this._dlgResourceSet.areAllLocalesUnlinked()) {
        return this._generateUnlinkedMasterContent();
      }
      return this._generateLinkedMasterContent();
    }

    _generateUnlinkedMasterContent() {
      const indent = 0;
      const dlgContent = generateAllLanguageDialogIncludes(
        this._dlgResourceSet.dialogName(),
        indent
      );
      return [dlgContent, undefined];
    }

    _generateLinkedMasterContent() {
      const dlgContent = this._generateDialogContent(cred.locale.any);
      return [dlgContent, undefined];
    }

    _generateLanguageContent(language) {
      const locale = cred.localeFromLanguage(language);
      const strContent = this._generateStringContent(language);
      let dlgContent = undefined;
      if (this._dlgResourceSet.isLinkedToMaster(locale)) {
        // Skip the dlg files when all languages are linked to the master resource.
        if (!this._dlgResourceSet.areAllLocalesLinked()) {
          dlgContent = this._generateLinkedDialogContent();
        }
      } else {
        dlgContent = this._generateDialogContent(locale);
      }
      return [dlgContent, strContent];
    }

    _generateLinkedDialogContent() {
      let text = '';
      text += makeLine(0, generateIncludeDirective(this._dlgResourceSet.masterFileName));
      return text;
    }

    _generateDialogContent(locale) {
      let dlgResource = this._dlgResourceSet.dlgResources(locale);
      let dlg = dlgResource.dialogDefinition;
      const indent = 0;
      const indented_1 = indentLevel(indent, 1);

      let text = '';
      text += generateCppIncludes(indent);
      text += newline;
      text += generateAllLanguageStringIncludes(
        this._dlgResourceSet.dialogName(),
        indent
      );
      text += newline;
      text += generateDialogDefintionBeginning(dlg, indent);
      text += generateLabeledDialogProperties(dlg, indented_1);
      text += generateControlDeclarations(dlg, indented_1);
      text += generateControlDefinitions(dlg, indented_1);
      text += generateDialogDefintionEnding(indent);
      text += newline;
      text += generateLayers(dlgResource, indent);
      return text;
    }

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
  const spacesPerIndentLevel = 4;

  function indentLevel(base, level) {
    return base + level * spacesPerIndentLevel;
  }

  function indentBy(count) {
    return ' '.repeat(count);
  }

  function makeLine(indent, content) {
    return indentBy(indent) + content + newline;
  }

  function generateIfdefDirective(condition) {
    return `#ifdef ${condition}`;
  }

  function generateElifDirective(condition) {
    return `#elif defined ${condition}`;
  }

  function generateErrorDirective(errText) {
    return `#error "${errText}"`;
  }

  function generateIncludeDirective(fileName) {
    return `#include "${fileName}"`;
  }

  function generatePropertyValue(item, propLabel) {
    return item.property(propLabel).valueAsString();
  }

  function generateDialogInclude(dlgName, locale) {
    return generateIncludeDirective(cred.dialogFileName(dlgName, locale));
  }

  function generateStringInclude(dlgName, language) {
    return generateIncludeDirective(cred.stringFileName(dlgName, language));
  }

  function generateVersionSpecifier() {
    return `// Version [${cred.resourceVersion}] //`;
  }

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

  function generateDialogDefintionBeginning(dlg, indent) {
    return makeLine(
      indent,
      'begin_dialog_definition_ex_(' + generatePositionalDialogProperties(dlg) + ')'
    );
  }

  function generateDialogDefintionEnding(indent) {
    return makeLine(indent, 'end_dialog_definition_ex_()');
  }

  function generatePositionalDialogProperties(dlg) {
    let text = '';
    text += dlg.id + ',';
    text += generateSerializedItemProperties(dlg, cred.spec.makeDialogSpec()) + ',';
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

  function generateControlDeclarations(dlg, indent) {
    let text = '';
    for (const [, ctrl] of dlg.controls) {
      text += makeLine(indent, generateControlDeclaration(ctrl));
    }
    return text;
  }

  function generateControlDeclaration(ctrl) {
    return (
      'declare_control(' +
      generatePropertyValue(ctrl, cred.spec.propertyLabel.ctrlType) +
      ',' +
      ctrl.id +
      ')'
    );
  }

  function generateControlDefinitions(dlg, indent) {
    const indented_1 = indentLevel(indent, 1);
    let text = '';
    text += makeLine(indent, 'begin_control_definitions()');
    for (const [, ctrl] of dlg.controls) {
      text += generateControlDefinition(ctrl, indented_1);
    }
    text += makeLine(indent, 'end_control_definitions()');
    return text;
  }

  function generateControlDefinition(ctrl, indent) {
    const indented_1 = indentLevel(indent, 1);
    let text = '';
    text += generateControlDefintionBeginning(ctrl, indent);
    text += generateLabeledControlProperties(ctrl, indented_1);
    text += generateControlDefintionEnding(indent);
    return text;
  }

  function generateControlDefintionBeginning(ctrl, indent) {
    return makeLine(
      indent,
      'begin_control_definitions(' + generatePositionalControlProperties(ctrl) + ')'
    );
  }

  function generateControlDefintionEnding(indent) {
    return makeLine(indent, 'end_control_ex()');
  }

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
    text += generatePropertyValue(ctrl, cred.spec.propertyLabel.extStyleFlags) + ',';
    return text;
  }

  function generateControlCaption(ctrl) {
    const ctrlSpec = cred.spec.makeControlSpec(ctrl.type);
    if (ctrlSpec.hasBehaviorFlag(cred.spec.controlBehavior.serializeProperties)) {
      return `"${generateSerializedItemProperties(ctrl, ctrlSpec)}"`;
    }

    const captionProp = ctrl.property(cred.spec.propertyLabel.text);
    return captionProp ? captionProp.valueAsString() : '""';
  }

  function generateSerializedItemProperties(item, itemSpec) {
    let text = '{';

    let numSerizalizedProps = 0;
    for (let [, propSpec] of itemSpec.propertySpecs) {
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

  function generateSerializedItemProperty(itemId, property, propertySpec) {
    let text = '';
    if (propertySpec.writeSerialized) {
      if (property) {
        if (property.hasValue()) {
          text += generateSerializedProperty(property, propertySpec);
        } else if (!propertySpec.isNullable) {
          throw `Non-nullable property '${
            propertySpec.label
          }' doesn't have a value in definition of ${itemId}.`;
        }
      } else if (propertySpec.isRequired) {
        throw `Required property '${
          propertySpec.label
        }' not present in definition of ${itemId}.`;
      }
    }
    return text;
  }

  function generateSerializedProperty(property, spec) {
    let generatedValue = property.valueAsString();
    if (spec.writeAsStringWhenLabeled) {
      // Serialized string values are surrounded by two double-quotes.
      generatedValue = `""${generatedValue}""`;
    }
    return `[${property.label}=${generatedValue}]`;
  }

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

  function generateLabeledItemProperties(item, itemSpec, indent, keyword) {
    const sortedLabels = Array.from(itemSpec.propertySpecs.keys()).sort(
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

  function generateLabeledItemProperty(itemId, property, propertySpec, keyword) {
    let text = '';
    if (propertySpec.writeLabeled) {
      const propLabel = propertySpec.label;
      if (property) {
        if (property.hasValue() || propertySpec.isNullable) {
          text += generateLabeledProperty(property, propertySpec, keyword);
        } else {
          throw `Non-nullable property '${propLabel}' doesn't have a value in control definition of ${itemId}.`;
        }
      } else if (propertySpec.isRequired) {
        throw `Required property '${propLabel}' not present in item definition of ${itemId}.`;
      }
    }
    return text;
  }

  function generateLabeledProperty(property, spec, keyword) {
    let generatedValue = property.valueAsString();
    if (spec.writeAsStringWhenLabeled && !util.isSurroundedBy(generatedValue, '"')) {
      generatedValue = `"${generatedValue}"`;
    }
    return `${keyword}(${property.label},${generatedValue})`;
  }

  function generateLayers(dlgResource, indent) {
    const indented_1 = indentLevel(indent, 1);
    let text = '';
    text += makeLine(indent, '#if 0');
    text += newline;
    text += makeLine(indent, 'BEGIN_LAYERS');
    for (let layer of dlgResource.layerDefinitions) {
      text += generateLayer(layer, indented_1);
    }
    text += makeLine(indent, 'END_LAYERS');
    text += newline;
    text += makeLine(indent, '#endif');
    return text;
  }

  function generateLayer(layerDefinition, indent) {
    const indented_1 = indentLevel(indent, 1);
    let text = '';
    text += makeLine(indent, `BEGIN_LAYER "${layerDefinition.name}"`);
    for (let val of layerDefinition.values) {
      text += makeLine(indented_1, val);
    }
    text += makeLine(indent, 'END_LAYER');
    return text;
  }

  function generateCppStringDefinition(id, text) {
    return `#define ${id} "${text}"`;
  }

  ///////////////////

  // Exports
  return {
    ResourceGenerator: ResourceGenerator
  };
})();
