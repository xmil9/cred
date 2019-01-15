//
// Utility functionality.
//
'use strict';

///////////////////

// Utilities module.
var util = (function() {
  ///////////////////

  // Converts a given string to a number.
  function toNumber(str, defaultVal) {
    if (typeof str === 'undefined') {
      return defaultVal;
    }
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
  //
  // Needs to be supplied with an object that supports a getRandomValues() call
  // with the same semantics as in the window.crypto API.
  function makeUuidV4(crypto) {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  // Checks if a given string is a valid UUID.
  function isUuid(str) {
    if (str.length !== 36) {
      return false;
    }

    const dashPositions = [8, 13, 18, 23];
    for (let i = 0; i < str.length; ++i) {
      const char = str[i];
      if (dashPositions.includes(i)) {
        if (char !== '-') {
          return false;
        }
      } else if (!isHexDigit(char)) {
        return false;
      }
    }

    return true;
  }

  // Checks if a given string is a valid UUID version 4.
  function isUuidV4(str) {
    // 14th digit has to be '4' to indicate format version 4.
    return isUuid(str) && str[14] === '4';
  }

  ///////////////////

  // Exports for util module.
  return {
    copyArrayShallow: copyArrayShallow,
    hasValue: hasValue,
    insertAfter: insertAfter,
    isHexDigit: isHexDigit,
    isSurroundedBy: isSurroundedBy,
    isUuid: isUuid,
    isUuidV4: isUuidV4,
    makeUuidV4: makeUuidV4,
    toNumber: toNumber
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = util;
