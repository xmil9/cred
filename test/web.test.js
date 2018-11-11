//
// Tests for web utility functionality.
//
'use strict';

const crypto = require('crypto');
const util = require('.././util');
const web = require('.././web');

///////////////////

// Provide window.crypto.getRandomValues Web API by redirecting to node's crypto
// module.
function defineCrypto() {
  if (typeof global.crypto === 'undefined') {
    Object.defineProperty(global.self, 'crypto', {
      value: {
        getRandomValues: arr => crypto.randomBytes(arr.length)
      }
    });
  }
}

///////////////////

test('saveTextFile', () => {
  // Need to mock Web API calls in saveTextFile.
});

///////////////////

test('uuidv4 format', () => {
  defineCrypto();

  let uuid = undefined;
  for (let caseNum = 0; caseNum < 20; ++caseNum) {
    uuid = web.uuidv4();
    expect(uuid.length).toBe(36);

    const isValidUuidChar = function(char) {
      return util.isHexDigit(char) || char === '-';
    };
    for (let i = 0; i < uuid.length; ++i) {
      expect(isValidUuidChar(uuid[i])).toBeTruthy();
    }

    for (const idx of [8, 13, 18, 23]) {
      expect(uuid[idx]).toEqual('-');
    }
    // 14th digit has to be '4' to indicate format version 4.
    expect(uuid[14]).toEqual('4');
  }
});

test('uuidv4 uniqueness', () => {
  defineCrypto();

  let uuids = new Set();
  for (let i = 0; i < 100; ++i) {
    const uuid = web.uuidv4();
    expect(uuids.has(uuid)).toBeFalsy();
    uuids.add(uuid);
  }
});
