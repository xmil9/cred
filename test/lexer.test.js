//
// Tests for the lexer component of the dialog reader.
//
'use strict';

var cred = cred || {};
cred = require('../types');
cred.lexer = require('../lexer');

///////////////////

test('Token constructor', () => {
  const token = new cred.lexer.Token(cred.tokenKind.string, 's');
  expect(token.kind).toEqual(cred.tokenKind.string);
  expect(token.value).toEqual('s');
});

test('Token.isKind', () => {
  const token = new cred.lexer.Token(cred.tokenKind.comma, ',');
  expect(token.isKind(cred.tokenKind.comma)).toBeTruthy();
  expect(token.isKind(cred.tokenKind.keyword)).toBeFalsy();
});

test('Token.isMatch', () => {
  const token = new cred.lexer.Token(cred.tokenKind.identifier, 'some_id');
  expect(token.isMatch(cred.tokenKind.identifier, 'some_id')).toBeTruthy();
  expect(token.isMatch(cred.tokenKind.keyword, 'some_id')).toBeFalsy();
  expect(token.isMatch(cred.tokenKind.identifier, 'other_id')).toBeFalsy();
});

test('Token.kind', () => {
  const token = new cred.lexer.Token(cred.tokenKind.identifier, 'some_id');
  expect(token.kind).toEqual(cred.tokenKind.identifier);
});

test('Token.name', () => {
  const token = new cred.lexer.Token(cred.tokenKind.identifier, 'some_id');
  expect(token.name).toEqual('identifier');
});

test('Token.value', () => {
  const token = new cred.lexer.Token(cred.tokenKind.identifier, 'some_id');
  expect(token.value).toEqual('some_id');
});

///////////////////

test('cred.lexer.analyse string', () => {
  const tokens = cred.lexer.analyse('"test string"', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.string, 'test string')).toBeTruthy();
});

test('cred.lexer.analyse escaped double-quote', () => {
  const tokens = cred.lexer.analyse('"a""b"', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.string, 'a""b')).toBeTruthy();
});

test('cred.lexer.analyse empty string', () => {
  const tokens = cred.lexer.analyse('""', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.string, '')).toBeTruthy();
});

test('cred.lexer.analyse identifier', () => {
  const tokens = cred.lexer.analyse('my_id', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.identifier, 'my_id')).toBeTruthy();
});

test('cred.lexer.analyse identifier with special characters', () => {
  const tokens = cred.lexer.analyse('id1234567890_:', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.identifier, 'id1234567890_:')).toBeTruthy();
});

test('cred.lexer.analyse identifier starting with underscore', () => {
  const tokens = cred.lexer.analyse('_id:', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.identifier, '_id:')).toBeTruthy();
});

test('cred.lexer.analyse integer number', () => {
  const tokens = cred.lexer.analyse('100', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.number, 100)).toBeTruthy();
});

test('cred.lexer.analyse floating point number', () => {
  const tokens = cred.lexer.analyse('100.262', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.number, 100.262)).toBeTruthy();
});

test('cred.lexer.analyse negative numbers', () => {
  let tokens = cred.lexer.analyse('-1', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.number, -1)).toBeTruthy();

  tokens = cred.lexer.analyse('-36.33', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.number, -36.33)).toBeTruthy();
});

test('cred.lexer.analyse #include directive', () => {
  const tokens = cred.lexer.analyse('#include "ResourceDefines.h"', 'someFile.txt');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].isMatch(cred.tokenKind.directive, '#include')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.string, 'ResourceDefines.h')).toBeTruthy();
});

test('cred.lexer.analyse #if directive', () => {
  const tokens = cred.lexer.analyse('#if 0', 'someFile.txt');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].isMatch(cred.tokenKind.directive, '#if')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.number, 0)).toBeTruthy();
});

test('cred.lexer.analyse #ifdef directive', () => {
  const tokens = cred.lexer.analyse('#ifdef RES_US', 'someFile.txt');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].isMatch(cred.tokenKind.directive, '#ifdef')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.identifier, 'RES_US')).toBeTruthy();
});

test('cred.lexer.analyse #elif directive', () => {
  const tokens = cred.lexer.analyse('#elif RES_US', 'someFile.txt');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].isMatch(cred.tokenKind.directive, '#elif')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.identifier, 'RES_US')).toBeTruthy();
});

test('cred.lexer.analyse #else directive', () => {
  const tokens = cred.lexer.analyse('#else', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.directive, '#else')).toBeTruthy();
});

test('cred.lexer.analyse #endif directive', () => {
  const tokens = cred.lexer.analyse('#endif', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.directive, '#endif')).toBeTruthy();
});

test('cred.lexer.analyse #error directive', () => {
  const tokens = cred.lexer.analyse('#error "something went wrong"', 'someFile.txt');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].isMatch(cred.tokenKind.directive, '#error')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.string, 'something went wrong')).toBeTruthy();
});

test('cred.lexer.analyse #define directive', () => {
  const tokens = cred.lexer.analyse(
    '#define	DLGPROP_kChooseSymbolDlg_1_Text	"Cancel"',
    'someFile.txt'
  );
  expect(tokens.length).toEqual(3);
  expect(tokens[0].isMatch(cred.tokenKind.directive, '#define')).toBeTruthy();
  expect(
    tokens[1].isMatch(cred.tokenKind.identifier, 'DLGPROP_kChooseSymbolDlg_1_Text')
  ).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.string, 'Cancel')).toBeTruthy();
});

test('cred.lexer.analyse comment', () => {
  const tokens = cred.lexer.analyse('// comment', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.comment, '// comment')).toBeTruthy();
});

test('cred.lexer.analyse comma', () => {
  const tokens = cred.lexer.analyse(',', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.comma, ',')).toBeTruthy();
});

test('cred.lexer.analyse binary-or', () => {
  const tokens = cred.lexer.analyse('|', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.binaryOr, '|')).toBeTruthy();
});

test('cred.lexer.analyse opening parenthesis', () => {
  const tokens = cred.lexer.analyse('(', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
});

test('cred.lexer.analyse closinging parenthesis', () => {
  const tokens = cred.lexer.analyse(')', 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse begin_dialog_definition_ex_ keyword', () => {
  const tokens = cred.lexer.analyse('begin_dialog_definition_ex_()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(
    tokens[0].isMatch(cred.tokenKind.keyword, 'begin_dialog_definition_ex_')
  ).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse end_dialog_definition_ex_ keyword', () => {
  const tokens = cred.lexer.analyse('end_dialog_definition_ex_()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(
    tokens[0].isMatch(cred.tokenKind.keyword, 'end_dialog_definition_ex_')
  ).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse begin_dialog_properties keyword', () => {
  const tokens = cred.lexer.analyse('begin_dialog_properties()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(
    tokens[0].isMatch(cred.tokenKind.keyword, 'begin_dialog_properties')
  ).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse end_dialog_properties keyword', () => {
  const tokens = cred.lexer.analyse('end_dialog_properties()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].isMatch(cred.tokenKind.keyword, 'end_dialog_properties')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse define_dialog_property keyword', () => {
  const tokens = cred.lexer.analyse('define_dialog_property()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(
    tokens[0].isMatch(cred.tokenKind.keyword, 'define_dialog_property')
  ).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse declare_control keyword', () => {
  const tokens = cred.lexer.analyse('declare_control()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].isMatch(cred.tokenKind.keyword, 'declare_control')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse begin_control_definitions keyword', () => {
  const tokens = cred.lexer.analyse('begin_control_definitions()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(
    tokens[0].isMatch(cred.tokenKind.keyword, 'begin_control_definitions')
  ).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse end_control_definitions keyword', () => {
  const tokens = cred.lexer.analyse('end_control_definitions()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(
    tokens[0].isMatch(cred.tokenKind.keyword, 'end_control_definitions')
  ).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse begin_control_ex keyword', () => {
  const tokens = cred.lexer.analyse('begin_control_ex()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].isMatch(cred.tokenKind.keyword, 'begin_control_ex')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse end_control_ex keyword', () => {
  const tokens = cred.lexer.analyse('end_control_ex()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].isMatch(cred.tokenKind.keyword, 'end_control_ex')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse define_property keyword', () => {
  const tokens = cred.lexer.analyse('define_property()', 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].isMatch(cred.tokenKind.keyword, 'define_property')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.openParenthesis, '(')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.closeParenthesis, ')')).toBeTruthy();
});

test('cred.lexer.analyse handling of spaces', () => {
  const textWithoutSpaces = 'abc,12|"ff" "gg"a b#include define_property';
  const tokensWithoutSpaces = cred.lexer.analyse(textWithoutSpaces, 'someFile.txt');
  const textWithSpaces =
    '   abc  ,  12   |   "ff"   "gg" a    b  #include    define_property  ';
  const tokensWithSpaces = cred.lexer.analyse(textWithSpaces, 'someFile.txt');
  expect(tokensWithSpaces).toEqual(tokensWithoutSpaces);
});

test('cred.lexer.analyse comma separated ids, strings, numbers', () => {
  const tokens = cred.lexer.analyse('kChooseSymbolDlg,"test",530.6,392', 'someFile.txt');
  expect(tokens.length).toEqual(7);
  expect(tokens[0].isMatch(cred.tokenKind.identifier, 'kChooseSymbolDlg')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.comma, ',')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.string, 'test')).toBeTruthy();
  expect(tokens[3].isMatch(cred.tokenKind.comma, ',')).toBeTruthy();
  expect(tokens[4].isMatch(cred.tokenKind.number, 530.6)).toBeTruthy();
  expect(tokens[5].isMatch(cred.tokenKind.comma, ',')).toBeTruthy();
  expect(tokens[6].isMatch(cred.tokenKind.number, 392)).toBeTruthy();
});

test('cred.lexer.analyse binary-or separated ids, strings, numbers', () => {
  const tokens = cred.lexer.analyse('kChooseSymbolDlg|"test"|530.6|392', 'someFile.txt');
  expect(tokens.length).toEqual(7);
  expect(tokens[0].isMatch(cred.tokenKind.identifier, 'kChooseSymbolDlg')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.binaryOr, '|')).toBeTruthy();
  expect(tokens[2].isMatch(cred.tokenKind.string, 'test')).toBeTruthy();
  expect(tokens[3].isMatch(cred.tokenKind.binaryOr, '|')).toBeTruthy();
  expect(tokens[4].isMatch(cred.tokenKind.number, 530.6)).toBeTruthy();
  expect(tokens[5].isMatch(cred.tokenKind.binaryOr, '|')).toBeTruthy();
  expect(tokens[6].isMatch(cred.tokenKind.number, 392)).toBeTruthy();
});

test('cred.lexer.analyse double-quotes for empty caption in serialized properties', () => {
  const tokens = cred.lexer.analyse('"Caption="""', 'someFile.txt');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].isMatch(cred.tokenKind.string, 'Caption=')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.string, '')).toBeTruthy();
});

test('cred.lexer.analyse identifier for caption in serialized properties', () => {
  const tokens = cred.lexer.analyse('"Caption="mycaptionid', 'someFile.txt');
  expect(tokens.length).toEqual(2);
  expect(tokens[0].isMatch(cred.tokenKind.string, 'Caption=')).toBeTruthy();
  expect(tokens[1].isMatch(cred.tokenKind.identifier, 'mycaptionid')).toBeTruthy();
});

test('cred.lexer.analyse token location on first line', () => {
  const content = 'firstToken';
  const tokens = cred.lexer.analyse(content, 'someFile.txt');
  expect(tokens.length).toEqual(1);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
});

test('cred.lexer.analyse token location on second line', () => {
  const content = 'firstToken "secondToken"\nthirdToken';
  const tokens = cred.lexer.analyse(content, 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('2')).not.toEqual(-1);
});

test('cred.lexer.analyse token location after empty line', () => {
  const content = 'firstToken "secondToken"\n\nthirdToken';
  const tokens = cred.lexer.analyse(content, 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('3')).not.toEqual(-1);
});

// Reading identifier tokens at the end of a line puts the EOL char back into the un-read stream.
// This can cause problems for the line counting code.
test('cred.lexer.analyse token location with an identifier token as last token on previous line', () => {
  const content = 'firstToken secondToken\nthirdToken';
  const tokens = cred.lexer.analyse(content, 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('2')).not.toEqual(-1);
});

// Reading number tokens at the end of a line puts the EOL char back into the un-read stream.
// This can cause problems for the line counting code.
test('cred.lexer.analyse token location with a number token as last token on previous line', () => {
  const content = 'firstToken 1000\nthirdToken';
  const tokens = cred.lexer.analyse(content, 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('2')).not.toEqual(-1);
});

// Reading comment tokens at the end of a line puts the EOL char back into the un-read stream.
// This can cause problems for the line counting code.
test('cred.lexer.analyse token location with a comment token as last token on previous line', () => {
  const content = 'firstToken // a comment\nthirdToken';
  const tokens = cred.lexer.analyse(content, 'someFile.txt');
  expect(tokens.length).toEqual(3);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[0].location().indexOf('1')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('someFile.txt')).not.toEqual(-1);
  expect(tokens[2].location().indexOf('2')).not.toEqual(-1);
});

test('cred.lexer.analyse illegal character', () => {
  const content = '$';
  expect(() => cred.lexer.analyse(content, 'someFile.txt')).toThrow();
});

test('cred.lexer.analyse illegal directive', () => {
  const content = '#wrong';
  expect(() => cred.lexer.analyse(content, 'someFile.txt')).toThrow();
});

test('cred.lexer.analyse illegal comment', () => {
  const content = 'token / wrong comment';
  expect(() => cred.lexer.analyse(content, 'someFile.txt')).toThrow();
});
