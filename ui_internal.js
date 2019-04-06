//
// Internal functionality for the UI module.
// Exposed as submodule to allow testing it.
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
var $ = tryRequire('jquery') || $ || {};
var cred = tryRequire('./types') || cred || {};
var geom = tryRequire('./geom') || geom || {};
var html = tryRequire('./html') || html || {};
var util = tryRequire('./util') || util || {};

///////////////////

// Controller module.
cred.ui_internal = (function() {
  ///////////////////

  // Handles interactions with the display header area. This is the area that shows
  // controls above the layout display.
  class DisplayHeader {
    constructor(controllerProxy) {
      // A proxy object that calls the actual controller with the correct
      // 'source' parameter.
      this._controllerProxy = controllerProxy;
    }

    setup() {
      let self = this;
      $('#linked-flag').on('change', event => self._onLinkedToMasterChanged(event));
    }

    get controller() {
      return this._controllerProxy;
    }

    // Updates the header's content to the currently active locale.
    update() {
      const currentLocale = this.controller.currentLocale;
      let $linkedFlag = $('#linked-flag');
      $linkedFlag.prop('checked', this.controller.isLinkedToMaster(currentLocale));
      $linkedFlag.prop('disabled', currentLocale === cred.locale.any);
    }

    _onLinkedToMasterChanged() {
      this.controller.notifyLinkedToMasterModified($('#linked-flag').is(':checked'));
    }
  }

  ///////////////////

  // Represents the properties pane.
  class PropertyPane {
    constructor(controllerProxy) {
      // A proxy object that calls the actual controller with the correct
      // 'source' parameter.
      this._controllerProxy = controllerProxy;
      // Helper class for building property components dynamically.
      this._propertyBuilder = new PropertyComponentBuilder(controllerProxy);
      // Map that associates property labels with component objects for
      // those properties.
      this._propertyComponents = new Map();
    }

    setup() {}

    get controller() {
      return this._controllerProxy;
    }

    // Populates the fields of the property pane with the values of a given
    // layout item.
    populate(item) {
      this.clear();
      this._setTitle(item.itemSpec().title + ' Properties');
      this._buildProperties(item);
      this._registerEvents();
    }

    // Clears all fields in the property pane.
    clear() {
      this._setTitle('Properties');
      this._unregisterEvents();
      $('#property-list').empty();
      this._propertyComponents.clear();
    }

    // Sets the values of bounds related properties to given bounds.
    setBounds(bounds) {
      const label = cred.spec.propertyLabel;
      $(makePropertyIdSelector(label.left)).val(bounds.left);
      $(makePropertyIdSelector(label.top)).val(bounds.top);
      $(makePropertyIdSelector(label.width)).val(bounds.width);
      $(makePropertyIdSelector(label.height)).val(bounds.height);
    }

    // Updates the pane's content to the currently selected item.
    update() {
      let selectedItem = this.controller.selectedItem;
      if (selectedItem) {
        this.populate(selectedItem);
      } else {
        this.clear();
      }
    }

    // --- Event handlers ---

    // Sets up event handlers.
    _registerEvents() {
      this._registerPropertyTypeHandlers();
      this._registerSemanticPropertyHandlers();
    }

    // Register handlers for each property type.
    _registerPropertyTypeHandlers() {
      const self = this;

      // Collection of custom handlers for specific property types.
      const typeHandlers = new Map([
        [
          cred.spec.logicalPropertyType.localizedString,
          this._onLocalizedStringPropertyChanged
        ],
        [cred.spec.logicalPropertyType.bool, this._onBooleanPropertyChanged],
        [cred.spec.logicalPropertyType.flags, this._onFlagsPropertyChanged]
      ]);

      for (const logicalType of cred.spec.logicalPropertyType) {
        let $tagged = $(`.${logicalType}`);
        if (typeHandlers.has(logicalType)) {
          // Use a custom type handler.
          $tagged.on('change.propertyType', e =>
            typeHandlers.get(logicalType).call(self, e)
          );
        } else {
          // Use the default handler.
          $tagged.on('change.propertyType', e => self._onPropertyChanged(e));
        }
      }
    }

    // Register property handlers for semantic tags.
    _registerSemanticPropertyHandlers() {
      const self = this;

      // Collection of handlers for semantic tags.
      const semanticHandlers = new Map([
        [cred.spec.semanticPropertyTag.id, this._onIdChanged],
        [cred.spec.semanticPropertyTag.bounds, this._onBoundsChanged]
      ]);

      for (const tag of cred.spec.semanticPropertyTag) {
        let $tagged = $(`.${tag}`);
        $tagged.on(`change.${tag}`, e => semanticHandlers.get(tag).call(self, e));
        // For elements with semantic handlers remove the property type handler.
        $tagged.off('change.propertyType');
      }
    }

    // Removes event handlers.
    _unregisterEvents() {
      $(`.${cred.spec.semanticPropertyTag.id}`).off('change.id');
      $(`.${cred.spec.semanticPropertyTag.bounds}`).off('change.bounds');

      for (const tag of cred.spec.semanticPropertyTag) {
        $(`.${tag}`).off('change.propertyType');
      }
    }

    // Handles changes to the values of properties.
    _onPropertyChanged(event) {
      let $targetElem = $(event.target);
      const value = $targetElem.val();
      const propLabel = extractPropertyLabelFromHtmlId($targetElem.attr('id'));
      this.controller.notifyItemPropertyModified(propLabel, value);
    }

    // Handles changes to the values of localized string properties.
    _onLocalizedStringPropertyChanged(event) {
      let $targetElem = $(event.target);
      const value = $targetElem.val();
      const propLabel = extractPropertyLabelFromHtmlId($targetElem.attr('id'));
      this.controller.notifyItemLocalizedStringPropertyModified(propLabel, value);
    }

    // Handles changes to the values of boolean properties.
    _onBooleanPropertyChanged(event) {
      let $targetElem = $(event.target);
      const value = $targetElem.is(':checked');
      const propLabel = extractPropertyLabelFromHtmlId($targetElem.attr('id'));
      this.controller.notifyItemPropertyModified(propLabel, value);
    }

    // Handles changes to the values of flags properties.
    _onFlagsPropertyChanged(event) {
      let $targetElem = $(event.target);
      let $flagFieldset = $targetElem.parentsUntil('.component-container', 'fieldset');

      const propLabel = extractPropertyLabelFromHtmlId($flagFieldset.attr('id'));
      const isSet = $targetElem.is(':checked');
      const flagText = extractFlagTextFromHtmlId($targetElem.attr('id'));
      const flagValue = util.toNumber($targetElem.val());

      this.controller.notifyItemFlagPropertyModified(
        propLabel,
        flagText,
        flagValue,
        isSet
      );
    }

    // Handles changes to the id property in the pane.
    _onIdChanged() {
      const id = $(makePropertyIdSelector(cred.spec.propertyLabel.id)).val();
      this.controller.notifyItemIdModified(id);
    }

    // Handles changes to the values of bounds related properties in the pane.
    _onBoundsChanged() {
      const propertyLabel = cred.spec.propertyLabel;
      const bounds = new geom.Rect(
        $(makePropertyIdSelector(propertyLabel.left)).val(),
        $(makePropertyIdSelector(propertyLabel.top)).val(),
        $(makePropertyIdSelector(propertyLabel.width)).val(),
        $(makePropertyIdSelector(propertyLabel.height)).val()
      );
      this.controller.notifyItemBoundsModified(bounds);
    }

    // --- Internal functions ---

    // Sets the title of the properties pane to a given text.
    _setTitle(titleText) {
      $('#item-title').text(titleText);
    }

    // Populate pane with HTML elements for the properties supported by the
    // item.
    _buildProperties(item) {
      const spec = item.itemSpec();
      const definition = item.resource();
      let $containerElem = $('#property-list');

      for (const label of spec.propertyDisplayOrder()) {
        const propSpec = spec.propertySpec(label);
        const propDefinition = definition.property(label);
        if (propDefinition) {
          // Build the appropriate DOM structure using double-dispatch between
          // the property spec and property builder classes.
          let component = propSpec.buildDomComponent(
            this._propertyBuilder,
            propDefinition,
            $containerElem
          );
          this._propertyComponents.set(label, component);
        } else if (propSpec.isRequired()) {
          throw new Error(
            `Defintion for required property ${label} for control ${
              spec.title
            } is missing.`
          );
        }
      }
    }
  }

  ///////////////////

  // Builds HTML components for each type of property.
  class PropertyComponentBuilder {
    constructor(controller) {
      this._controller = controller;
    }

    buildIntegerComponent(propertyDefintion, propertySpec, $parentElem) {
      return new IntegerPropertyComponent(propertyDefintion, propertySpec, $parentElem);
    }

    buildFloatingPointComponent(propertyDefintion, propertySpec, $parentElem) {
      return new FloatingPointPropertyComponent(
        propertyDefintion,
        propertySpec,
        $parentElem
      );
    }

    buildIdentifierComponent(propertyDefintion, propertySpec, $parentElem) {
      return new IdentifierPropertyComponent(
        propertyDefintion,
        propertySpec,
        $parentElem
      );
    }

    buildStringComponent(propertyDefintion, propertySpec, $parentElem) {
      return new StringPropertyComponent(propertyDefintion, propertySpec, $parentElem);
    }

    buildLocalizedStringComponent(propertyDefintion, propertySpec, $parentElem) {
      return new LocalizedStringPropertyComponent(
        propertyDefintion,
        propertySpec,
        $parentElem,
        this._controller,
        // Localized string components have to be disabled for the master locale
        // because it has no designated language.
        this._controller.currentLocale === cred.locale.any
      );
    }

    buildBooleanComponent(propertyDefintion, propertySpec, $parentElem) {
      return new BooleanPropertyComponent(propertyDefintion, propertySpec, $parentElem);
    }

    buildEnumComponent(propertyDefintion, propertySpec, $parentElem, enums) {
      return new EnumPropertyComponent(
        propertyDefintion,
        propertySpec,
        $parentElem,
        enums
      );
    }

    buildFlagsComponent(propertyDefintion, propertySpec, $parentElem, flags) {
      return new FlagsPropertyComponent(
        propertyDefintion,
        propertySpec,
        $parentElem,
        flags
      );
    }
  }

  ///////////////////

  // Base class for HTML components for properties. A HTML component is a set of
  // HTML elements that represent the property to the user.
  class PropertyComponent {
    constructor(propDefintion, propSpec) {
      if (!propDefintion || !propSpec) {
        throw new Error('Invalid arguments. Property defintion and spec required.');
      }
      // The defintion of the property containing the data read from the
      // resource for this property.
      this._propDefinition = propDefintion;
      // The spec of the property.
      this._propSpec = propSpec;
    }

    get propertyDefinition() {
      return this._propDefinition;
    }

    get propertySpec() {
      return this._propSpec;
    }

    // Builds an container element for the elements of this component.
    // Returns the element in jQuery representation.
    buildComponentContainerElement() {
      return html.makeDivElement('component-container');
    }

    // Builds an container element for the elements on one line of a component.
    // Returns the element in jQuery representation.
    buildLineContainerElement() {
      return html.makeDivElement('line-container');
    }

    // Builds an container element for elements that form a block in a component.
    // Returns the element in jQuery representation.
    buildBlockContainerElement() {
      return html.makeDivElement('block-container');
    }

    // Builds a label element for the property of this component.
    // Returns the element in jQuery representation.
    buildLabelElement() {
      return html.makeLabelElement(this.propertySpec.displayedLabel + ':');
    }

    // Builds an input element for the property of this component.
    // Returns the element in jQuery representation.
    buildInputElement(inputType, value) {
      let $input = html.makeInputElement(
        inputType,
        makeHtmlPropertyId(this.propertySpec.label),
        !this.propertySpec.isModifiable(),
        value
      );
      html.addClasses($input, this.propertySpec.tags);
      return $input;
    }

    // Builds a checkbox element for the property of this component.
    // Returns the element in jQuery representation.
    buildCheckboxElement() {
      let $checkbox = html.makeInputElement(
        'checkbox',
        makeHtmlPropertyId(this.propertySpec.label),
        !this.propertySpec.isModifiable()
      );
      const isChecked =
        this.propertyDefinition.value === true || this.propertyDefinition.value === 1;
      $checkbox.attr({ checked: isChecked });
      html.addClasses($checkbox, this.propertySpec.tags);
      return $checkbox;
    }

    // Builds a collection of  HTML elements that represent an enum component.
    // Returns a select element in jQuery representation.
    buildEnumElement(enums) {
      const elemId = makeHtmlPropertyId(this.propertySpec.label);
      let $select = html.makeSelectElement(elemId, !this.propertySpec.isModifiable());
      html.addClasses($select, this.propertySpec.tags);

      for (let i = 0; i < enums.length; ++i) {
        const isActive = enums[i].value === this.propertyDefinition.value;
        let $option = html
          .makeOptionElement(enums[i].display, enums[i].value)
          .prop('selected', isActive);
        $select.append($option);
      }

      return $select;
    }

    // Builds a collection of  HTML elements that represent a flags component.
    // Returns a fieldset element in jQuery representation.
    buildFlagsElement(flags) {
      let $fieldset = html.makeFieldsetElement(
        !this.propertySpec.isModifiable(),
        makeHtmlPropertyId(this.propertySpec.label)
      );
      html.addClasses($fieldset, this.propertySpec.tags);

      let $leftColumn = html.makeDivElement('leftColumn');
      $fieldset.append($leftColumn);
      let $rightColumn = html.makeDivElement('rightColumn');
      $fieldset.append($rightColumn);

      for (let i = 0; i < flags.length; ++i) {
        let $flagElem = this._buildFlagElement(flags[i]);
        if (i % 2 === 0) {
          $leftColumn.append($flagElem);
        } else {
          $rightColumn.append($flagElem);
        }
      }

      return $fieldset;
    }

    // Builds the HTML element combination that represents one flag in a set of
    // flags.
    // Returns a span element in jQuery representation.
    _buildFlagElement(flagSpec) {
      let $span = html.makeSpanElement();

      const flagId = makeHtmlFlagId(flagSpec.textValue);
      let $flagCheckbox = html.makeInputElement(
        'checkbox',
        flagId,
        false,
        flagSpec.numericValue
      );
      const isSet = this.propertyDefinition.isSet(flagSpec.textValue);
      $flagCheckbox.attr({ checked: isSet });
      $span.append($flagCheckbox);

      let $flagLabel = html.makeLabelElement(flagSpec.display);
      $span.append($flagLabel);

      return $span;
    }

    // Builds the HTML element for an image checkbox.
    buildGlobalImageCheckboxElement() {
      let $imageCheckbox = html
        .makeDivElement()
        .attr({
          id: makeHtmlImageCheckboxId(this.propertyDefinition.label)
        })
        .addClass('global-image-checkbox')
        .on('click', e => {
          const $target = $(e.target);
          // Toggle flag that is used in CSS to apply an image.
          if (!$target.hasClass('disabled')) {
            $target.toggleClass('checked');
          }
          this._setApplicabilityTooltip($target);
        });

      const editContext = this.propertySpec.editContext;
      const isLocal =
        editContext === cred.editContext.localDefault ||
        editContext === cred.editContext.localOnly;
      if (isLocal) {
        $imageCheckbox.addClass('checked');
      }
      this._setApplicabilityTooltip($imageCheckbox);

      const isDisabled =
        editContext === cred.editContext.globalOnly ||
        editContext === cred.editContext.localOnly;
      if (isDisabled) {
        $imageCheckbox.addClass('disabled');
      }

      return $imageCheckbox;
    }

    _setApplicabilityTooltip($elem) {
      const tooltip = $elem.hasClass('checked')
        ? 'Local property. Its value applies only to the current locale.'
        : 'Global property. Its value applies to all locales.';
      $elem.prop('title', tooltip);
    }
  }

  // Component for integer value properties.
  class IntegerPropertyComponent extends PropertyComponent {
    constructor(propDefintion, propSpec, $parentElem) {
      super(propDefintion, propSpec);
      this._$inputElem = undefined;

      this._buildDomStructure($parentElem);
    }

    // Builds the DOM elements that represent the property.
    _buildDomStructure($parentElem) {
      const self = this;

      let $componentContainer = this.buildComponentContainerElement();
      $parentElem.append($componentContainer);

      let $lineContainer = this.buildLineContainerElement();
      $componentContainer.append($lineContainer);

      $lineContainer
        .append(this.buildLabelElement())
        .append(this.buildGlobalImageCheckboxElement());

      this._$inputElem = this.buildInputElement('number', this.propertyDefinition.value);
      this._$inputElem.on('change.integer_comp', e => self._onValueChanged(e));
      $lineContainer.append(this._$inputElem);
    }

    // Handles 'change' events for the generated input element.
    _onValueChanged(event) {
      // Replace entered value with rounded integer value.
      let $target = $(event.target);
      $target.val(Math.round(util.toNumber($target.val())));
    }
  }

  // Component for floating point value properties.
  class FloatingPointPropertyComponent extends PropertyComponent {
    constructor(propDefintion, propSpec, $parentElem) {
      super(propDefintion, propSpec);
      this._$inputElem = undefined;

      this._buildDomStructure($parentElem);
    }

    // Builds the DOM elements that represent the property.
    _buildDomStructure($parentElem) {
      let $componentContainer = this.buildComponentContainerElement();
      $parentElem.append($componentContainer);

      let $lineContainer = this.buildLineContainerElement();
      $componentContainer.append($lineContainer);

      $lineContainer
        .append(this.buildLabelElement())
        .append(this.buildGlobalImageCheckboxElement());

      this._$inputElem = this.buildInputElement('number', this.propertyDefinition.value);
      $lineContainer.append(this._$inputElem);
    }
  }

  // Component for identifier properties.
  class IdentifierPropertyComponent extends PropertyComponent {
    constructor(propDefintion, propSpec, $parentElem) {
      super(propDefintion, propSpec);
      this._$inputElem = undefined;

      this._buildDomStructure($parentElem);
    }

    // Builds the DOM elements that represent the property.
    _buildDomStructure($parentElem) {
      let $componentContainer = this.buildComponentContainerElement();
      $parentElem.append($componentContainer);

      let $lineContainer = this.buildLineContainerElement();
      $componentContainer.append($lineContainer);

      $lineContainer
        .append(this.buildLabelElement())
        .append(this.buildGlobalImageCheckboxElement());

      this._$inputElem = this.buildInputElement('text', this.propertyDefinition.value);
      $lineContainer.append(this._$inputElem);
    }
  }

  // Component for string properties.
  class StringPropertyComponent extends PropertyComponent {
    constructor(propDefintion, propSpec, $parentElem) {
      super(propDefintion, propSpec);
      this._$inputElem = undefined;

      this._buildDomStructure($parentElem);
    }

    // Builds the DOM elements that represent the property.
    _buildDomStructure($parentElem) {
      let $componentContainer = this.buildComponentContainerElement();
      $parentElem.append($componentContainer);

      let $lineContainer = this.buildLineContainerElement();
      $componentContainer.append($lineContainer);

      $lineContainer
        .append(this.buildLabelElement())
        .append(this.buildGlobalImageCheckboxElement());

      this._$inputElem = this.buildInputElement('text', this.propertyDefinition.value);
      $lineContainer.append(this._$inputElem);
    }
  }

  // Component for localized string properties.
  class LocalizedStringPropertyComponent extends PropertyComponent {
    constructor(propDefintion, propSpec, $parentElem, stringLookup, disable) {
      super(propDefintion, propSpec);
      this._$inputElem = undefined;
      this._stringLookup = stringLookup;
      this._disable = disable;

      this._buildDomStructure($parentElem);
    }

    // Builds the DOM elements that represent the property.
    _buildDomStructure($parentElem) {
      let $componentContainer = this.buildComponentContainerElement();
      $parentElem.append($componentContainer);

      let $lineContainer = this.buildLineContainerElement();
      $componentContainer.append($lineContainer);

      $lineContainer
        .append(this.buildLabelElement())
        .append(this.buildGlobalImageCheckboxElement());

      let localizedString = '';
      if (this.propertyDefinition.type === cred.spec.physicalPropertyType.identifier) {
        localizedString = this._stringLookup.lookupString(this.propertyDefinition.value);
      }
      this._$inputElem = this.buildInputElement('text', localizedString);
      if (this._disable) {
        this._$inputElem.attr({ disabled: true });
      }
      $lineContainer.append(this._$inputElem);
    }
  }

  // Component for boolean properties.
  class BooleanPropertyComponent extends PropertyComponent {
    constructor(propDefintion, propSpec, $parentElem) {
      super(propDefintion, propSpec);
      this._$inputElem = undefined;

      this._buildDomStructure($parentElem);
    }

    // Builds the DOM elements that represent the property.
    _buildDomStructure($parentElem) {
      let $componentContainer = this.buildComponentContainerElement();
      $parentElem.append($componentContainer);

      let $lineContainer = this.buildLineContainerElement();
      $lineContainer.addClass('checkbox-line');
      $componentContainer.append($lineContainer);

      $lineContainer
        .append(this.buildLabelElement())
        .append(this.buildGlobalImageCheckboxElement());

      this._$inputElem = this.buildCheckboxElement();
      $lineContainer.append(this._$inputElem);
    }
  }

  // Component for enum properties.
  class EnumPropertyComponent extends PropertyComponent {
    constructor(propDefintion, propSpec, $parentElem, enums) {
      super(propDefintion, propSpec);
      // Supported enums. See EnumPropertySpec for description of the data
      // structure.
      this._enums = enums;
      this._$selectElem = undefined;

      this._buildDomStructure($parentElem);
    }

    // Builds the DOM elements that represent the property.
    _buildDomStructure($parentElem) {
      let $componentContainer = this.buildComponentContainerElement();
      $parentElem.append($componentContainer);

      let $lineContainer = this.buildLineContainerElement();
      $componentContainer.append($lineContainer);

      $lineContainer
        .append(this.buildLabelElement())
        .append(this.buildGlobalImageCheckboxElement());

      this._$enumElem = this.buildEnumElement(this._enums);
      $lineContainer.append(this._$enumElem);
    }
  }

  // Component for flag properties.
  class FlagsPropertyComponent extends PropertyComponent {
    constructor(propDefintion, propSpec, $parentElem, flags) {
      super(propDefintion, propSpec);
      // Supported flags. See FlagsPropertySpec for description of the data
      // structure.
      this._flags = flags;
      this._$flagsElem = undefined;

      this._buildDomStructure($parentElem);
    }

    // Builds the DOM elements that represent the property.
    _buildDomStructure($parentElem) {
      let $componentContainer = this.buildComponentContainerElement();
      $parentElem.append($componentContainer);

      let $blockContainer = this.buildBlockContainerElement();
      $componentContainer.append($blockContainer);

      $blockContainer
        .append(this.buildLabelElement())
        .append(this.buildGlobalImageCheckboxElement());

      this._$flagsElem = this.buildFlagsElement(this._flags);
      $blockContainer.append(this._$flagsElem);
    }
  }

  ///////////////////

  // Funtions related to content ids of tab elements.
  // Keep them together in one place to simplify maintenance.

  // Returns the associated locale for a given content id.
  function localeFromContentId(contentId) {
    const tabId = contentId.split('-')[0];
    switch (tabId) {
      case 'master': {
        return cred.locale.any;
      }
      case 'en': {
        return cred.locale.english;
      }
      case 'jp': {
        return cred.locale.japanese;
      }
      case 'de': {
        return cred.locale.german;
      }
      default: {
        throw new Error('Invalid tab content id.');
      }
    }
  }

  // Returns the content id of a given HTML element.
  function contentIdFromHtmlElement(htmlElement) {
    return $(htmlElement).data('contentid');
  }

  ///////////////////

  // Returns an id for a given property label. The id is used as an HTML attribute.
  function makeHtmlPropertyId(propLabel) {
    return `${propLabel}-property`;
  }

  // Returns a jQuery selector for a given property label.
  function makePropertyIdSelector(propLabel) {
    return `#${makeHtmlPropertyId(propLabel)}`;
  }

  // Returns the property label that was used to create a given HTML id.
  function extractPropertyLabelFromHtmlId(htmlId) {
    return htmlId.replace('-property', '');
  }

  // Returns an id for a given flag text of a flags property. The id is used as an
  // HTML attribute.
  function makeHtmlFlagId(flagText) {
    return `${flagText}-flag`;
  }

  // Returns the flag text that was used to create a given HTML id.
  function extractFlagTextFromHtmlId(htmlId) {
    return htmlId.replace('-flag', '');
  }

  // Returns an id for an image checkbox with a given label.
  function makeHtmlImageCheckboxId(propLabel) {
    return `${propLabel}-global`;
  }

  ///////////////////

  // Exports
  return {
    contentIdFromHtmlElement: contentIdFromHtmlElement,
    DisplayHeader: DisplayHeader,
    localeFromContentId: localeFromContentId,
    makeHtmlFlagId: makeHtmlFlagId,
    makeHtmlImageCheckboxId: makeHtmlImageCheckboxId,
    PropertyComponent: PropertyComponent,
    PropertyComponentBuilder: PropertyComponentBuilder,
    PropertyPane: PropertyPane
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.ui_internal;
