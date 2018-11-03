//
// Utility functionality.
//
'use strict';

///////////////////

// Imports
var util = util || {};

///////////////////

// Utilities module.
util = (function() {
  ///////////////////

  // Converts a given string to a number.
  function toNumber(str) {
    if (str.indexOf('.') >= 0) {
      return parseFloat(str);
    }
    return parseInt(str, 10);
  }

  // Inserts a given element into a target array after a given element.
  function insertAfter(targetArray, elem, afterElem) {
    let idx = targetArray.indexOf(afterElem);
    if (idx === -1) {
      idx = targetArray.length;
    }
    idx++;
    targetArray.splice(idx, 0, elem);
    return targetArray;
  }

  // Checks whether a given map contains a given value.
  function hasValue(targetMap, value) {
    for (const val of targetMap.values()) {
      if (val === value) {
        return true;
      }
    }
    return false;
  }

  // Checks if a given string is surrounded by a given pattern.
  function isSurroundedBy(str, pattern) {
    return str.startsWith(pattern) && str.endsWith(pattern);
  }

  // Generates a UUID. The UUID conforms to RFC4122 since the spec allows UUIDs
  // created randomly. However, since the time and machine are not accounted for
  // there is a (small) chance of collisions.
  // Source:
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  ///////////////////

  // Exports
  return {
    hasValue: hasValue,
    insertAfter: insertAfter,
    isSurroundedBy: isSurroundedBy,
    toNumber: toNumber,
    uuidv4: uuidv4
  };
})();
