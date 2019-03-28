//
// HTML helper functionality.
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

///////////////////

// HTML module.
var html = (function() {
  ///////////////////

  // Creates a div element.
  // Returns the element in jQuery representation.
  function makeDivElement(className) {
    let $div = $(document.createElement('div'));
    if (className) {
      $div.addClass(className);
    }
    return $div;
  }

  // Creates a label element.
  // Returns the element in jQuery representation.
  function makeLabelElement(text, forValue) {
    let $label = $(document.createElement('label')).text(text);
    if (typeof forValue !== 'undefined') {
      $label.attr({ for: forValue });
    }
    return $label;
  }

  // Creates an input element.
  // Returns the element in jQuery representation.
  function makeInputElement(inputType, id, disabled, value) {
    let $input = $(document.createElement('input')).attr({
      type: `${inputType}`,
      id: id,
      disabled: disabled
    });
    if (typeof value !== 'undefined') {
      $input.attr({ value: value });
    }
    return $input;
  }

  // Creates an select element.
  // Returns the element in jQuery representation.
  function makeSelectElement(id, disabled) {
    let $select = $(document.createElement('select')).attr({
      id: id,
      disabled: disabled
    });
    return $select;
  }

  // Creates an option element.
  // Returns the element in jQuery representation.
  function makeOptionElement(displayedText, value) {
    let $option = $(document.createElement('option'))
      .attr({
        value: value
      })
      .text(displayedText);
    return $option;
  }

  // Creates a fieldset element.
  // Returns the element in jQuery representation.
  function makeFieldsetElement(disabled, id) {
    let $fieldset = $(document.createElement('fieldset')).attr({ disabled: disabled });
    if (typeof id !== 'undefined') {
      $fieldset.attr({ id: id });
    }
    return $fieldset;
  }

  // Creates a span element.
  // Returns the element in jQuery representation.
  function makeSpanElement(text) {
    let $span = $(document.createElement('span'));
    if (typeof text !== 'undefined') {
      $span.text(text);
    }
    return $span;
  }

  // Creates a link element.
  // Returns the element in jQuery representation.
  function makeLinkElement(text) {
    let $link = $(document.createElement('a'));
    if (typeof text !== 'undefined') {
      $link.text(text);
    }
    return $link;
  }

  // Adds given class names to a given HTML element.
  function addClasses($elem, classNames) {
    for (let i = 0; i < classNames.length; ++i) {
      $elem.addClass(classNames[i]);
    }
    return $elem;
  }

  ///////////////////

  // Exports
  return {
    addClasses: addClasses,
    makeDivElement: makeDivElement,
    makeFieldsetElement: makeFieldsetElement,
    makeInputElement: makeInputElement,
    makeLabelElement: makeLabelElement,
    makeLinkElement: makeLinkElement,
    makeOptionElement: makeOptionElement,
    makeSelectElement: makeSelectElement,
    makeSpanElement: makeSpanElement
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = html;
