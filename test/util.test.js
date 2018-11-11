//
// Tests for utility functionality.
//
'use strict';

const util = require('.././util');

///////////////////

test('toNumber for integers', () => {
  expect(util.toNumber('1')).toBe(1);
  expect(util.toNumber('0')).toBe(0);
  expect(util.toNumber('-1')).toBe(-1);
  expect(util.toNumber('10000')).toBe(10000);
});

test('toNumber for floating point numbers', () => {
  expect(util.toNumber('1.0')).toBe(1.0);
  expect(util.toNumber('0.0')).toBe(0.0);
  expect(util.toNumber('-1.0')).toBe(-1.0);
  expect(util.toNumber('10000.0')).toBe(10000.0);
  expect(util.toNumber('1.123')).toBe(1.123);
  expect(util.toNumber('-1.123')).toBe(-1.123);
  expect(util.toNumber('0.0000001')).toBe(0.0000001);
});

///////////////////

test('insertAfter in middle', () => {
  expect(util.insertAfter([1, 2], 0, 1)).toEqual([1, 0, 2]);
  expect(util.insertAfter([1, 2, 3], 0, 1)).toEqual([1, 0, 2, 3]);
  expect(util.insertAfter([1, 2, 3], 0, 2)).toEqual([1, 2, 0, 3]);
  expect(util.insertAfter(['1', '2', '3'], '0', '2')).toEqual(['1', '2', '0', '3']);
});

test('insertAfter at end', () => {
  expect(util.insertAfter([1], 0, 1)).toEqual([1, 0]);
  expect(util.insertAfter([1, 2, 3], 0, 3)).toEqual([1, 2, 3, 0]);
  expect(util.insertAfter(['1', '2', '3'], '0', '3')).toEqual(['1', '2', '3', '0']);
});

test('insertAfter with missing reference element', () => {
  expect(util.insertAfter([1, 2], 0, 3)).toEqual([1, 2, 0]);
  expect(util.insertAfter(['1', '2', '3'], '0', '4')).toEqual(['1', '2', '3', '0']);
});

test('insertAfter for empty array', () => {
  expect(util.insertAfter([], 0, 1)).toEqual([0]);
  expect(util.insertAfter([], '0', '')).toEqual(['0']);
});

///////////////////

test('copyArrayShallow for array of primitives', () => {
  const src = [1, 2, 3];
  const copy = util.copyArrayShallow(src);
  // Same content.
  expect(copy).toEqual(src);
  // Different objects.
  expect(copy).not.toBe(src);
});

test('copyArrayShallow for array of objects', () => {
  const src = [{ a: 1, b: 2 }, { c: 1, d: 2 }];
  const copy = util.copyArrayShallow(src);
  // Same content.
  expect(copy).toEqual(src);
  // Different objects.
  expect(copy).not.toBe(src);
  // It's a shallow copy. The references of the element object are the same.
  expect(copy[0]).toBe(src[0]);
  expect(copy[1]).toBe(src[1]);
});

test('copyArrayShallow for array of arrays', () => {
  const src = [[1, 2, 3], ['a', 'b']];
  const copy = util.copyArrayShallow(src);
  // Same content.
  expect(copy).toEqual(src);
  // Different objects.
  expect(copy).not.toBe(src);
  // It's a shallow copy. The references of the element arrays are the same.
  expect(copy[0]).toBe(src[0]);
  expect(copy[1]).toBe(src[1]);
});

test('copyArrayShallow for empty array', () => {
  const src = [];
  const copy = util.copyArrayShallow(src);
  expect(copy).toEqual(src);
  expect(copy).not.toBe(src);
});

///////////////////

test('hasValue for maps of primitives', () => {
  const map = new Map([[1, 'a'], ['2', 'b'], [3, 'c']]);
  expect(util.hasValue(map, 'a')).toBeTruthy();
  expect(util.hasValue(map, 'b')).toBeTruthy();
  expect(util.hasValue(map, 'c')).toBeTruthy();
  expect(util.hasValue(map, 'd')).toBeFalsy();
  expect(util.hasValue(map, 1)).toBeFalsy();
});

test('hasValue for maps of objects', () => {
  const elem1 = { a: 1 };
  const elem2 = { b: 2, c: 3 };
  const elem3 = { z: 26 };
  const map = new Map([['a', elem1], [2, elem2], ['z', elem3]]);
  expect(util.hasValue(map, elem1)).toBeTruthy();
  expect(util.hasValue(map, elem2)).toBeTruthy();
  expect(util.hasValue(map, elem3)).toBeTruthy();
  expect(util.hasValue(map, { a: 1 })).toBeFalsy();
  expect(util.hasValue(map, 'a')).toBeFalsy();
});

test('hasValue for empty map', () => {
  const map = new Map();
  expect(util.hasValue(map, 3)).toBeFalsy();
  expect(util.hasValue(map, '')).toBeFalsy();
});

///////////////////

test('isSurroundedBy for single characters', () => {
  expect(util.isSurroundedBy('"abcd"', '"')).toBeTruthy();
  expect(util.isSurroundedBy('"abcd"', '#')).toBeFalsy();
  expect(util.isSurroundedBy('aaaaaa', 'a')).toBeTruthy();
});

test('isSurroundedBy for multi-characters patterns', () => {
  expect(util.isSurroundedBy('""abcd""', '""')).toBeTruthy();
  expect(util.isSurroundedBy('"abcd"', '""')).toBeFalsy();
  expect(util.isSurroundedBy('xyzabcdxyz', 'xyz')).toBeTruthy();
  expect(util.isSurroundedBy('xyzabcdxyyz', 'xyz')).toBeFalsy();
});

test('isSurroundedBy for empty string', () => {
  expect(util.isSurroundedBy('', '*')).toBeFalsy();
});

test('isSurroundedBy for empty pattern', () => {
  expect(util.isSurroundedBy('abc', '')).toBeTruthy();
  expect(util.isSurroundedBy('', '')).toBeTruthy();
});

test('isSurroundedBy for empty pattern', () => {
  expect(util.isSurroundedBy('abc', '')).toBeTruthy();
  expect(util.isSurroundedBy('', '')).toBeTruthy();
});

///////////////////

test('isHexDigit for hex characters', () => {
  const hexChars = '0123456789aAbBcCdDeEF';
  for (let i = 0; i < hexChars.length; ++i) {
    expect(util.isHexDigit(hexChars[i])).toBeTruthy();
  }
});

test('isHexDigit for non-hex characters', () => {
  const chars = 'gGhHiIjJkKlLmMoOpPqQrRsStTuUvVwWxXyYzZ!@#$%^&*()_-+=;:"?.,<>';
  for (let i = 0; i < chars.length; ++i) {
    expect(util.isHexDigit(chars[i])).toBeFalsy();
  }
});

test('isHexDigit for unicode characters', () => {
  // Hex escape sequence.
  expect(util.isHexDigit('\xA9')).toBeFalsy();
  // Unicode escape sequence (up to four digits long).
  expect(util.isHexDigit('\u2665')).toBeFalsy();
  // ES6 unicode escape sequences (at least 5 digits long, no max).
  expect(util.isHexDigit('\u{1D306}')).toBeFalsy();
});

test('isHexDigit for non-char strings', () => {
  expect(util.isHexDigit('')).toBeFalsy();
  expect(util.isHexDigit('12')).toBeFalsy();
  expect(util.isHexDigit('abc')).toBeFalsy();
});
