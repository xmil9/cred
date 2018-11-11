//
// Utility functionality.
//
'use strict';

///////////////////

// Namespaces
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
  function insertAfter(arr, elem, afterElem) {
    let idx = arr.indexOf(afterElem);
    if (idx === -1) {
      idx = arr.length;
    }
    idx++;
    arr.splice(idx, 0, elem);
    return arr;
  }

  // Returns shallow copy of array.
  function copyArrayShallow(arr) {
    return arr.slice();
  }

  // Checks whether a given map contains a given value.
  function hasValue(map, value) {
    for (const val of map.values()) {
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

  // Checks whether a passed character (a string) is a hexadecimal character.
  function isHexDigit(char) {
    return char.length == 1 && '0123456789abcdefABCDEF'.indexOf(char) !== -1;
  }

  // Generates a UUID. The UUID conforms to RFC4122 since the spec allows UUIDs
  // created randomly. However, since the time and machine are not accounted for
  // there is a (small) chance of collisions.
  // Source:
  // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (
        c ^
        (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }

  ///////////////////

  // Exports for util module.
  return {
    copyArrayShallow: copyArrayShallow,
    hasValue: hasValue,
    insertAfter: insertAfter,
    isHexDigit: isHexDigit,
    isSurroundedBy: isSurroundedBy,
    toNumber: toNumber,
    uuidv4: uuidv4
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = util;
