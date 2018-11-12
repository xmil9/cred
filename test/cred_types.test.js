//
// Tests for basic types.
//
'use strict';

var cred = require('.././cred_types');

///////////////////

test('cred.localeFromLanguage', () => {
  expect(cred.localeFromLanguage(cred.language.english)).toBe(cred.locale.english);
  expect(cred.localeFromLanguage(cred.language.german)).toBe(cred.locale.german);
  expect(cred.localeFromLanguage(cred.language.japanese)).toBe(cred.locale.japanese);
  expect(() => cred.localeFromLanguage('other')).toThrow();
});

test('cred.languageFromLocale', () => {
  expect(cred.languageFromLocale(cred.locale.english)).toBe(cred.language.english);
  expect(cred.languageFromLocale(cred.locale.german)).toBe(cred.language.german);
  expect(cred.languageFromLocale(cred.locale.japanese)).toBe(cred.language.japanese);
  expect(cred.languageFromLocale(cred.locale.any)).toBeUndefined();
  expect(() => cred.languageFromLocale('other')).toThrow();
});

test('cred.tokenKindName', () => {
  for (const tokenKind of [
    cred.tokenKind.closeParenthesis,
    cred.tokenKind.comma,
    cred.tokenKind.comment,
    cred.tokenKind.directive,
    cred.tokenKind.identifier,
    cred.tokenKind.keyword,
    cred.tokenKind.logicalOr,
    cred.tokenKind.number,
    cred.tokenKind.openParenthesis,
    cred.tokenKind.string
  ]) {
    expect(cred.tokenKindName(tokenKind)).toEqual(expect.any(String));
  }

  expect(cred.tokenKindName('other')).toEqual('');
});

test('cred.dialogFileName', () => {
  expect(cred.dialogFileName('test', cred.locale.english)).toEqual('test.English.dlg');
  expect(cred.dialogFileName('test', cred.locale.german)).toEqual('test.German.dlg');
  expect(cred.dialogFileName('test', cred.locale.japanese)).toEqual('test.Japan.dlg');
  expect(cred.dialogFileName('test', cred.locale.any)).toEqual('test.dlg');
});

test('cred.stringFileName', () => {
  expect(cred.stringFileName('test', cred.language.english)).toEqual('test.English.str');
  expect(cred.stringFileName('test', cred.language.german)).toEqual('test.German.str');
  expect(cred.stringFileName('test', cred.language.japanese)).toEqual('test.Japan.str');
});
