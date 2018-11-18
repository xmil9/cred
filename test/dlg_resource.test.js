//
// Tests for dialog resource representation.
//
'use strict';

var cred = cred || {};
cred = require('.././cred_types');
cred.resource = require('.././dlg_resource');
cred.spec = require('.././dlg_spec');

///////////////////

test('LayerDefinition.copy for layer without numbers', () => {
  const layer = new cred.resource.LayerDefinition('test');
  const copy = layer.copy();
  expect(copy).not.toBe(layer);
  expect(copy.name).toBe('test');
  expect(copy.countNumbers()).toBe(0);
});

test('LayerDefinition.copy for layer with numbers', () => {
  const layer = new cred.resource.LayerDefinition('test', [1, 2, 3]);
  const copy = layer.copy();
  expect(copy).not.toBe(layer);
  expect(copy.name).toBe('test');
  expect(copy.countNumbers()).toBe(3);
  expect(copy.hasNumber(1)).toBeTruthy();
  expect(copy.hasNumber(2)).toBeTruthy();
  expect(copy.hasNumber(3)).toBeTruthy();
});

test('LayerDefinition.copy for layer with one numbers', () => {
  const layer = new cred.resource.LayerDefinition('test', [10]);
  const copy = layer.copy();
  expect(copy).not.toBe(layer);
  expect(copy.name).toBe('test');
  expect(copy.countNumbers()).toBe(1);
  expect(copy.hasNumber(10)).toBeTruthy();
});

test('LayerDefinition.name', () => {
  expect(new cred.resource.LayerDefinition('test').name).toBe('test');
  expect(new cred.resource.LayerDefinition('test', [1, 2, 3]).name).toBe('test');
});

test('LayerDefinition.countNumbers', () => {
  expect(new cred.resource.LayerDefinition('test').countNumbers()).toBe(0);
  expect(new cred.resource.LayerDefinition('test', [1, 2, 3]).countNumbers()).toBe(3);
  expect(new cred.resource.LayerDefinition('test', []).countNumbers()).toBe(0);
  expect(new cred.resource.LayerDefinition('test', [10]).countNumbers()).toBe(1);
});

test('LayerDefinition.numbers with no numbers', () => {
  const layer = new cred.resource.LayerDefinition('test');
  expect(Array.from(layer.numbers())).toEqual([]);
});

test('LayerDefinition.numbers with numbers', () => {
  let layer = new cred.resource.LayerDefinition('test', [1, 2, 3]);
  expect(Array.from(layer.numbers())).toEqual([1, 2, 3]);

  layer = new cred.resource.LayerDefinition('test', [1]);
  expect(Array.from(layer.numbers())).toEqual([1]);
});

test('LayerDefinition.hasNumber', () => {
  const layer = new cred.resource.LayerDefinition('test', [1, 2, 3]);
  expect(layer.hasNumber(1)).toBeTruthy();
  expect(layer.hasNumber(2)).toBeTruthy();
  expect(layer.hasNumber(3)).toBeTruthy();
  expect(layer.hasNumber(4)).toBeFalsy();
});

test('LayerDefinition.hasNumber with no numbers', () => {
  const layer = new cred.resource.LayerDefinition('test');
  expect(layer.hasNumber(1)).toBeFalsy();
});

test('LayerDefinition.addNumber without existing numbers', () => {
  const layer = new cred.resource.LayerDefinition('test');
  layer.addNumber(1);
  expect(layer.countNumbers()).toBe(1);
  expect(layer.hasNumber(1)).toBeTruthy();
  layer.addNumber(2);
  expect(layer.countNumbers()).toBe(2);
  expect(layer.hasNumber(1)).toBeTruthy();
  expect(layer.hasNumber(2)).toBeTruthy();
});

test('LayerDefinition.addNumber with existing numbers', () => {
  const layer = new cred.resource.LayerDefinition('test', [1, 2]);
  layer.addNumber(3);
  expect(layer.countNumbers()).toBe(3);
  expect(layer.hasNumber(3)).toBeTruthy();
  layer.addNumber(4);
  expect(layer.countNumbers()).toBe(4);
  expect(layer.hasNumber(3)).toBeTruthy();
  expect(layer.hasNumber(4)).toBeTruthy();
});

test('LayerDefinition.addNumber same number again', () => {
  const layer = new cred.resource.LayerDefinition('test', [1, 2]);
  layer.addNumber(1);
  expect(layer.countNumbers()).toBe(2);
  layer.addNumber(2);
  expect(layer.countNumbers()).toBe(2);
});

///////////////////

test('StringMap construction', () => {
  const strMap = new cred.resource.StringMap();
  expect(Array.from(strMap).length).toEqual(0);
});

test('StringMap.add to empty map', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'hello', cred.language.english);
  expect(Array.from(strMap).length).toEqual(1);
  expect(strMap.text('str1', cred.language.english)).toEqual('hello');
});

test('StringMap.add to populated map', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'hello', cred.language.english);
  strMap.add('str2', 'world', cred.language.english);
  expect(Array.from(strMap).length).toEqual(2);
  expect(strMap.text('str2', cred.language.english)).toEqual('world');
});

test('StringMap.add for different strings to multiple languages', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'hello', cred.language.english);
  strMap.add('str2', 'world', cred.language.german);
  strMap.add('str3', '!', cred.language.japanese);
  expect(Array.from(strMap).length).toEqual(3);
  expect(strMap.text('str1', cred.language.english)).toEqual('hello');
  expect(strMap.text('str2', cred.language.german)).toEqual('world');
  expect(strMap.text('str3', cred.language.japanese)).toEqual('!');
});

test('StringMap.add for same string to multiple languages', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'hello', cred.language.english);
  strMap.add('str1', 'hello', cred.language.german);
  strMap.add('str1', 'hello', cred.language.japanese);
  expect(Array.from(strMap).length).toEqual(3);
  expect(strMap.text('str1', cred.language.english)).toEqual('hello');
  expect(strMap.text('str1', cred.language.german)).toEqual('hello');
  expect(strMap.text('str1', cred.language.japanese)).toEqual('hello');
});

test('StringMap.add for multiple strings to multiple languages', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'hello', cred.language.english);
  strMap.add('str2', 'world', cred.language.english);
  strMap.add('str3', 'test', cred.language.german);
  strMap.add('str4', 'case', cred.language.german);
  strMap.add('str5', 'other', cred.language.japanese);
  strMap.add('str6', 'language', cred.language.japanese);
  expect(Array.from(strMap).length).toEqual(6);
  expect(strMap.text('str1', cred.language.english)).toEqual('hello');
  expect(strMap.text('str2', cred.language.english)).toEqual('world');
  expect(strMap.text('str3', cred.language.german)).toEqual('test');
  expect(strMap.text('str4', cred.language.german)).toEqual('case');
  expect(strMap.text('str5', cred.language.japanese)).toEqual('other');
  expect(strMap.text('str6', cred.language.japanese)).toEqual('language');
});

test('StringMap.add for string with same id but different text to multiple languages', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'hello', cred.language.english);
  strMap.add('str1', 'hallo', cred.language.german);
  strMap.add('str1', 'konichiva', cred.language.japanese);
  expect(Array.from(strMap).length).toEqual(3);
  expect(strMap.text('str1', cred.language.english)).toEqual('hello');
  expect(strMap.text('str1', cred.language.german)).toEqual('hallo');
  expect(strMap.text('str1', cred.language.japanese)).toEqual('konichiva');
});

test('StringMap.add with empty string', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', '', cred.language.english);
  expect(Array.from(strMap).length).toEqual(1);
  expect(strMap.text('str1', cred.language.english)).toEqual('');
});

test('StringMap.add to overwrite string', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);
  strMap.add('str1', 'bbb', cred.language.english);
  expect(Array.from(strMap).length).toEqual(1);
  expect(strMap.text('str1', cred.language.english)).toEqual('bbb');
});

test('StringMap.remove for string existing in all languages', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);
  strMap.add('str1', 'bbb', cred.language.german);
  strMap.add('str1', 'ccc', cred.language.japanese);
  strMap.add('str2', '111', cred.language.english);
  strMap.add('str2', '222', cred.language.german);
  strMap.add('str2', '333', cred.language.japanese);

  strMap.remove('str2');
  expect(Array.from(strMap).length).toEqual(3);
  expect(strMap.text('str1', cred.language.english)).toEqual('aaa');
  expect(strMap.text('str1', cred.language.german)).toEqual('bbb');
  expect(strMap.text('str1', cred.language.japanese)).toEqual('ccc');
});

test('StringMap.remove for string not existing in all languages', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);
  strMap.add('str1', 'bbb', cred.language.german);
  strMap.add('str1', 'ccc', cred.language.japanese);
  strMap.add('str2', '111', cred.language.english);
  strMap.add('str2', '333', cred.language.japanese);

  strMap.remove('str2');
  expect(Array.from(strMap).length).toEqual(3);
  expect(strMap.text('str1', cred.language.english)).toEqual('aaa');
  expect(strMap.text('str1', cred.language.german)).toEqual('bbb');
  expect(strMap.text('str1', cred.language.japanese)).toEqual('ccc');
});

test('StringMap.remove for string not existing at all', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);
  strMap.add('str1', 'bbb', cred.language.german);
  strMap.add('str1', 'ccc', cred.language.japanese);
  strMap.add('str2', '111', cred.language.english);
  strMap.add('str2', '333', cred.language.japanese);

  strMap.remove('str3');
  expect(Array.from(strMap).length).toEqual(5);
});

test('StringMap.remove until map empty', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);
  strMap.add('str1', 'bbb', cred.language.german);
  strMap.add('str1', 'ccc', cred.language.japanese);
  strMap.add('str2', '111', cred.language.english);
  strMap.add('str2', '333', cred.language.japanese);

  strMap.remove('str2');
  strMap.remove('str1');
  expect(Array.from(strMap).length).toEqual(0);
});

test('StringMap.text for string that exists in each language', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);
  strMap.add('str1', 'bbb', cred.language.german);
  strMap.add('str1', 'ccc', cred.language.japanese);

  expect(strMap.text('str1', cred.language.english)).toEqual('aaa');
  expect(strMap.text('str1', cred.language.german)).toEqual('bbb');
  expect(strMap.text('str1', cred.language.japanese)).toEqual('ccc');
});

test('StringMap.text for string that exists in requested language', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);

  expect(strMap.text('str1', cred.language.english)).toEqual('aaa');
});

test('StringMap.text for string that does not exists in requested language', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);

  expect(strMap.text('str1', cred.language.german)).toBeUndefined();
});

test('StringMap.text for empty map', () => {
  const strMap = new cred.resource.StringMap();
  expect(strMap.text('str1', cred.language.english)).toBeUndefined();
});

test('StringMap iterator', () => {
  const elems = [
    ['str1', 'aaa', cred.language.english],
    ['str1', 'bbb', cred.language.german],
    ['str1', 'ccc', cred.language.japanese],
    ['str2', '111', cred.language.english],
    ['str2', '222', cred.language.german],
    ['str3', 'zzz', cred.language.japanese]
  ];
  const strMap = new cred.resource.StringMap();
  for (const elem of elems) {
    strMap.add(elem[0], elem[1], elem[2]);
  }

  expect(Array.from(strMap).length).toEqual(elems.length);
  // Check that each added element is returned exactly once.
  for (const [id, text, lang] of strMap) {
    const pos = elems.findIndex(
      elem => elem[0] === id && elem[1] === text && elem[2] === lang
    );
    expect(pos).not.toEqual(-1);

    elems.splice(pos, 1);
  }
  expect(elems.length).toEqual(0);
});

test('StringMap iterator for empty string map', () => {
  const strMap = new cred.resource.StringMap();
  expect(Array.from(strMap).length).toEqual(0);
});

test('StringMap.languageStrings for strings in all languages', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);
  strMap.add('str1', 'bbb', cred.language.german);
  strMap.add('str1', 'ccc', cred.language.japanese);
  strMap.add('str2', '111', cred.language.english);
  strMap.add('str2', '222', cred.language.german);
  strMap.add('str2', '333', cred.language.japanese);

  const langStrings = Array.from(strMap.languageStrings(cred.language.german));
  expect(langStrings.length).toEqual(2);
  expect(
    langStrings.findIndex(elem => elem[0] === 'str1' && elem[1] === 'bbb')
  ).not.toEqual(-1);
  expect(
    langStrings.findIndex(elem => elem[0] === 'str2' && elem[1] === '222')
  ).not.toEqual(-1);
});

test('StringMap.languageStrings for different strings in different languages', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);
  strMap.add('str2', 'bbb', cred.language.german);
  strMap.add('str3', 'ccc', cred.language.japanese);
  strMap.add('str5', '111', cred.language.english);
  strMap.add('str6', '222', cred.language.german);
  strMap.add('str7', '333', cred.language.japanese);

  const langStrings = Array.from(strMap.languageStrings(cred.language.japanese));
  expect(langStrings.length).toEqual(2);
  expect(
    langStrings.findIndex(elem => elem[0] === 'str3' && elem[1] === 'ccc')
  ).not.toEqual(-1);
  expect(
    langStrings.findIndex(elem => elem[0] === 'str7' && elem[1] === '333')
  ).not.toEqual(-1);
});

test('StringMap.languageStrings for no strings in language', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str2', 'bbb', cred.language.german);
  strMap.add('str3', 'ccc', cred.language.japanese);
  strMap.add('str6', '222', cred.language.german);
  strMap.add('str7', '333', cred.language.japanese);

  const langStrings = Array.from(strMap.languageStrings(cred.language.english));
  expect(langStrings.length).toEqual(0);
});

test('StringMap.languageStrings for empty string map', () => {
  const strMap = new cred.resource.StringMap();
  const langStrings = Array.from(strMap.languageStrings(cred.language.english));
  expect(langStrings.length).toEqual(0);
});

test('StringMap.sourceEncoding for existing encoding', () => {
  const strMap = new cred.resource.StringMap();
  strMap.setSourceEncoding(cred.language.english, 'my encoding');
  expect(strMap.sourceEncoding(cred.language.english)).toEqual('my encoding');
});

test('StringMap.sourceEncoding for no encoding', () => {
  const strMap = new cred.resource.StringMap();
  expect(strMap.sourceEncoding(cred.language.english)).toBeUndefined();
});

test('StringMap.copyWithRegeneratedIds', () => {
  const strMap = new cred.resource.StringMap();
  strMap.add('str1', 'aaa', cred.language.english);
  strMap.add('str1', 'bbb', cred.language.german);
  strMap.add('str1', 'ccc', cred.language.japanese);
  strMap.add('str2', '111', cred.language.english);
  strMap.setSourceEncoding(cred.language.german, 'ascii');
  strMap.setSourceEncoding(cred.language.japanese, 'shift-jis');

  let idCount = 0;
  const idGenerator = () => ++idCount;
  const [copy, mapping] = strMap.copyWithRegeneratedIds(idGenerator);

  expect(copy).toBeDefined();
  expect(copy).not.toBe(strMap);
  expect(mapping).toBeDefined();
  expect(Array.from(copy).length).toEqual(Array.from(strMap).length);
  expect(copy.text('str1', cred.language.english)).toBeUndefined();
  expect(copy.text(mapping.get('str1'), cred.language.english)).toEqual('aaa');
  expect(copy.sourceEncoding(cred.language.german)).toEqual('ascii');
  expect(copy.sourceEncoding(cred.language.japanese)).toEqual('shift-jis');
});

///////////////////

test('makePropertyDefinition for number property', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.number,
    1
  );
  expect(prop).toBeDefined();
  expect(prop.type).toEqual(cred.spec.physicalPropertyType.number);
});

test('makePropertyDefinition for string property', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.string,
    'something'
  );
  expect(prop).toBeDefined();
  expect(prop.type).toEqual(cred.spec.physicalPropertyType.string);
});

test('makePropertyDefinition for identifier property', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.identifier,
    'MY_ID'
  );
  expect(prop).toBeDefined();
  expect(prop.type).toEqual(cred.spec.physicalPropertyType.identifier);
});

test('makePropertyDefinition for flags property', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    15
  );
  expect(prop).toBeDefined();
  expect(prop.type).toEqual(cred.spec.physicalPropertyType.flags);
});

test('PropertyDefinition.label', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.number,
    1
  );
  expect(prop.label).toEqual('test');
});

test('PropertyDefinition.type', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.number,
    1
  );
  expect(prop.type).toEqual(cred.spec.physicalPropertyType.number);
});

test('PropertyDefinition.value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.number,
    1
  );
  expect(prop.value).toEqual(1);
});

test('PropertyDefinition.valueAsString', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.number,
    1
  );
  expect(prop.valueAsString()).toEqual('1');
});

test('NumericPropertyDefinition.copy', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.number,
    1
  );
  const copy = prop.copy();
  expect(copy).toBeDefined();
  expect(copy).not.toBe(prop);
  expect(copy.label).toEqual(prop.label);
  expect(copy.type).toEqual(prop.type);
  expect(copy.value).toEqual(prop.value);
});

test('NumericPropertyDefinition.hasValue with value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.number,
    1
  );
  expect(prop.hasValue()).toBeTruthy();
});

test('NumericPropertyDefinition.hasValue with no value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.number,
    undefined
  );
  expect(prop.hasValue()).toBeFalsy();
});

test('StringPropertyDefinition.copy', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.string,
    'str'
  );
  const copy = prop.copy();
  expect(copy).toBeDefined();
  expect(copy).not.toBe(prop);
  expect(copy.label).toEqual(prop.label);
  expect(copy.type).toEqual(prop.type);
  expect(copy.value).toEqual(prop.value);
});

test('StringPropertyDefinition.hasValue with value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.string,
    'str'
  );
  expect(prop.hasValue()).toBeTruthy();
});

test('StringPropertyDefinition.hasValue with no value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.string,
    undefined
  );
  expect(prop.hasValue()).toBeFalsy();
});

test('StringPropertyDefinition.valueAsString', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.string,
    'str'
  );
  expect(prop.valueAsString()).toEqual('"str"');
});

test('IdentifierPropertyDefinition.copy', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.identifier,
    'ID'
  );
  const copy = prop.copy();
  expect(copy).toBeDefined();
  expect(copy).not.toBe(prop);
  expect(copy.label).toEqual(prop.label);
  expect(copy.type).toEqual(prop.type);
  expect(copy.value).toEqual(prop.value);
});

test('IdentifierPropertyDefinition.hasValue with value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.identifier,
    'ID'
  );
  expect(prop.hasValue()).toBeTruthy();
});

test('IdentifierPropertyDefinition.hasValue with no value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.identifier,
    undefined
  );
  expect(prop.hasValue()).toBeFalsy();
});

test('FlagsPropertyDefinition.value for undefined value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    undefined
  );
  expect(prop.value).toEqual(0);
});

test('FlagsPropertyDefinition.value for string value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    'str'
  );
  expect(prop.value).toEqual(0);
});

test('FlagsPropertyDefinition.copy', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  prop.addFlag('A', 1);
  prop.addFlag('B', 2);
  prop.addFlag('C', 4);

  const copy = prop.copy();
  expect(copy).toBeDefined();
  expect(copy).not.toBe(prop);
  expect(copy.label).toEqual(prop.label);
  expect(copy.type).toEqual(prop.type);
  expect(copy.value).toEqual(prop.value);
  expect(copy.valueAsString()).toEqual(prop.valueAsString());
});

test('FlagsPropertyDefinition.hasValue with flags', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  prop.addFlag('A', 1);

  expect(prop.hasValue()).toBeTruthy();
});

test('FlagsPropertyDefinition.hasValue without flags', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );

  expect(prop.hasValue()).toBeFalsy();
});

test('FlagsPropertyDefinition.hasValue with no value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    undefined
  );
  expect(prop.hasValue()).toBeFalsy();
});

test('FlagsPropertyDefinition.valueAsString without flags', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  expect(prop.valueAsString()).toEqual('0');
});

test('FlagsPropertyDefinition.valueAsString with one flag', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  prop.addFlag('A', 1);

  expect(prop.valueAsString()).toEqual('A | 1');
});

test('FlagsPropertyDefinition.valueAsString with multiple flags', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  prop.addFlag('A', 1);
  prop.addFlag('B', 2);
  prop.addFlag('C', 4);
  prop.addFlag('D', 8);

  expect(prop.valueAsString()).toEqual('A | B | C | D | 15');
});

test('FlagsPropertyDefinition.valueAsString with flags and other value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    64
  );
  prop.addFlag('A', 1);
  prop.addFlag('B', 2);

  expect(prop.valueAsString()).toEqual('A | B | 67');
});

test('FlagsPropertyDefinition.addFlag to no flags', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  prop.addFlag('A', 1);

  expect(prop.valueAsString()).toEqual('A | 1');
});

test('FlagsPropertyDefinition.addFlag to existing flags', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    32
  );
  prop.addFlag('A', 1);
  prop.addFlag('B', 2);

  expect(prop.valueAsString()).toEqual('A | B | 35');
});

test('FlagsPropertyDefinition.removeFlag for existing flag', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    32
  );
  prop.addFlag('A', 1);
  prop.addFlag('B', 2);

  prop.removeFlag('A', 1);
  expect(prop.valueAsString()).toEqual('B | 34');
});

test('FlagsPropertyDefinition.removeFlag for not existing flag', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    32
  );
  prop.addFlag('A', 1);
  prop.addFlag('B', 2);

  prop.removeFlag('C', 4);
  expect(prop.valueAsString()).toEqual('A | B | 35');
});

test('FlagsPropertyDefinition.removeFlag for single flag', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  prop.addFlag('B', 2);

  prop.removeFlag('B', 2);
  expect(prop.valueAsString()).toEqual('0');
});

test('FlagsPropertyDefinition.removeFlag for flag but not bit value', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  prop.addFlag('B', 2);

  prop.removeFlag('B');
  expect(prop.valueAsString()).toEqual('2');
});

test('FlagsPropertyDefinition.isSet for existing flag', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  prop.addFlag('B', 2);

  expect(prop.isSet('B')).toBeTruthy();
});

test('FlagsPropertyDefinition.isSet for not existing flag', () => {
  const prop = cred.resource.makePropertyDefinition(
    'test',
    cred.spec.physicalPropertyType.flags,
    0
  );
  prop.addFlag('B', 2);

  expect(prop.isSet('A')).toBeFalsy();
});

///////////////////

test('ControlDefinition construction', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  expect(ctrl).toBeDefined();
  expect(ctrl.type).toEqual(cred.spec.controlType.imagePushButton);
  expect(ctrl.id).toEqual('myid');
});

test('ControlDefinition construction without type', () => {
  expect(() => new cred.resource.ControlDefinition(undefined, 'myid')).toThrow();
});

test('ControlDefinition construction without id', () => {
  expect(
    () =>
      new cred.resource.ControlDefinition(
        cred.spec.controlType.imagePushButton,
        undefined
      )
  ).toThrow();
});

test('ControlDefinition.copy', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  const copy = ctrl.copy();
  expect(copy).toBeDefined();
  expect(copy).not.toBe(ctrl);
  expect(copy.type).toEqual(cred.spec.controlType.imagePushButton);
  expect(copy.id).toEqual('myid');
  expect(copy.haveProperty(cred.spec.propertyLabel.enabled)).toBeTruthy();
});

test('ControlDefinition.type', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  expect(ctrl.type).toEqual(cred.spec.controlType.imagePushButton);
});

test('ControlDefinition.id getter', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  expect(ctrl.id).toEqual('myid');
});

test('ControlDefinition.id setter', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.id = 'changed_id';
  expect(ctrl.id).toEqual('changed_id');
});

test('ControlDefinition.isDialog', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  expect(ctrl.isDialog()).toBeFalsy();
});

test('ControlDefinition.haveProperty for existing property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  expect(ctrl.haveProperty(cred.spec.propertyLabel.enabled)).toBeTruthy();
});

test('ControlDefinition.haveProperty for not existing property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  expect(ctrl.haveProperty(cred.spec.propertyLabel.font)).toBeFalsy();
});

test('ControlDefinition.haveProperty for pre-defined property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );

  expect(ctrl.haveProperty(cred.spec.propertyLabel.ctrlType)).toBeTruthy();
});

test('ControlDefinition.property for existing property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  const prop = ctrl.property(cred.spec.propertyLabel.enabled);
  expect(prop).toBeDefined();
  expect(prop.value).toEqual(1);
});

test('ControlDefinition.property for not existing property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  expect(ctrl.property(cred.spec.propertyLabel.font)).toBeUndefined();
});

test('ControlDefinition.property for pre-defined property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );

  const prop = ctrl.property(cred.spec.propertyLabel.ctrlType);
  expect(prop).toBeDefined();
  expect(prop.value).toEqual(cred.spec.controlType.imagePushButton);
});

test('ControlDefinition.setProperty for new property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.setProperty(
    'my_prop',
    cred.resource.makePropertyDefinition(
      'my_prop',
      cred.spec.physicalPropertyType.string,
      'test'
    )
  );

  const prop = ctrl.property('my_prop');
  expect(prop).toBeDefined();
  expect(prop.value).toEqual('test');
});

test('ControlDefinition.setProperty for existing property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    'my_prop',
    cred.resource.makePropertyDefinition(
      'my_prop',
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  ctrl.setProperty(
    'my_prop',
    cred.resource.makePropertyDefinition(
      'my_prop',
      cred.spec.physicalPropertyType.string,
      'test'
    )
  );

  const prop = ctrl.property('my_prop');
  expect(prop).toBeDefined();
  expect(prop.type).toEqual(cred.spec.physicalPropertyType.string);
  expect(prop.value).toEqual('test');
});

test('ControlDefinition.properties', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.font,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.font,
      cred.spec.physicalPropertyType.string,
      'Arial'
    )
  );

  const propArray = Array.from(ctrl.properties());
  expect(propArray.length).toEqual(4);
  expect(
    propArray.findIndex(elem => elem.label === cred.spec.propertyLabel.ctrlType)
  ).not.toEqual(-1);
  expect(
    propArray.findIndex(elem => elem.label === cred.spec.propertyLabel.id)
  ).not.toEqual(-1);
  expect(
    propArray.findIndex(elem => elem.label === cred.spec.propertyLabel.enabled)
  ).not.toEqual(-1);
  expect(
    propArray.findIndex(elem => elem.label === cred.spec.propertyLabel.font)
  ).not.toEqual(-1);
});

test('ControlDefinition.addPositionalProperty for new property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );

  ctrl.addPositionalProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(ctrl.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

test('ControlDefinition.addPositionalProperty for existing property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  // Should replace the existing property.
  ctrl.addPositionalProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(ctrl.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

test('ControlDefinition.addLabeledProperty for new property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );

  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(ctrl.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

test('ControlDefinition.addLabeledProperty for existing property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  // Should not replace the existing property.
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(ctrl.property(cred.spec.propertyLabel.enabled).value).toEqual(1);
});

test('ControlDefinition.addSerializedProperty for new property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );

  ctrl.addSerializedProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(ctrl.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

test('ControlDefinition.addSerializedProperty for existing property', () => {
  const ctrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.imagePushButton,
    'myid'
  );
  ctrl.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  // Should replace the existing property.
  ctrl.addSerializedProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(ctrl.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

///////////////////

test('DialogDefinition construction', () => {
  const dlg = new cred.resource.DialogDefinition();
  expect(dlg).toBeDefined();
  expect(Array.from(dlg.properties()).length).toEqual(0);
  expect(Array.from(dlg.controls()).length).toEqual(0);
});

test('DialogDefinition.copy when empty', () => {
  const dlg = new cred.resource.DialogDefinition();
  const copy = dlg.copy();
  expect(copy).toBeDefined();
  expect(copy).not.toBe(dlg);
  expect(Array.from(copy.properties()).length).toEqual(0);
  expect(Array.from(copy.controls()).length).toEqual(0);
});

test('DialogDefinition.copy when populated', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.id = 'myid';
  dlg.setProperty(
    'test',
    cred.resource.makePropertyDefinition(
      'test',
      cred.spec.physicalPropertyType.string,
      'test-value'
    )
  );
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );

  const copy = dlg.copy();
  expect(copy).toBeDefined();
  expect(copy).not.toBe(dlg);
  expect(copy.haveProperty('test')).toBeTruthy();
  const copiedCtrl = copy.control('label-id');
  expect(copiedCtrl).toBeDefined();
  expect(copiedCtrl.id).toEqual('label-id');
});

test('DialogDefinition.id getter when id is undefined', () => {
  const dlg = new cred.resource.DialogDefinition();
  expect(() => dlg.id).toThrow();
});

test('DialogDefinition.id getter when id is defined', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.id = 'myid';
  expect(dlg.id).toEqual('myid');
});

test('DialogDefinition.id setter when id is undefined', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.id = 'myid';
  expect(dlg.id).toEqual('myid');
});

test('DialogDefinition.id setter when id is defined', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.id = 'myid';

  dlg.id = 'new-id';
  expect(dlg.id).toEqual('new-id');
});

test('DialogDefinition.isDialog', () => {
  const dlg = new cred.resource.DialogDefinition();
  expect(dlg.isDialog()).toBeTruthy();
});

test('DialogDefinition.haveProperty for existing property', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      'myid'
    )
  );

  expect(dlg.haveProperty(cred.spec.propertyLabel.id)).toBeTruthy();
});

test('DialogDefinition.haveProperty for not existing property', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      'myid'
    )
  );

  expect(dlg.haveProperty(cred.spec.propertyLabel.font)).toBeFalsy();
});

test('DialogDefinition.property for existing property', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      'myid'
    )
  );

  const prop = dlg.property(cred.spec.propertyLabel.id);
  expect(prop).toBeDefined();
  expect(prop.value).toEqual('myid');
});

test('DialogDefinition.property for not existing property', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      'myid'
    )
  );

  expect(dlg.property(cred.spec.propertyLabel.font)).toBeUndefined();
});

test('DialogDefinition.setProperty for new property', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.setProperty(
    'my_prop',
    cred.resource.makePropertyDefinition(
      'my_prop',
      cred.spec.physicalPropertyType.string,
      'test'
    )
  );

  const prop = dlg.property('my_prop');
  expect(prop).toBeDefined();
  expect(prop.value).toEqual('test');
});

test('DialogDefinition.setProperty for existing property', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addLabeledProperty(
    'my_prop',
    cred.resource.makePropertyDefinition(
      'my_prop',
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  dlg.setProperty(
    'my_prop',
    cred.resource.makePropertyDefinition(
      'my_prop',
      cred.spec.physicalPropertyType.string,
      'test'
    )
  );

  const prop = dlg.property('my_prop');
  expect(prop).toBeDefined();
  expect(prop.type).toEqual(cred.spec.physicalPropertyType.string);
  expect(prop.value).toEqual('test');
});

test('DialogDefinition.properties', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.font,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.font,
      cred.spec.physicalPropertyType.string,
      'Arial'
    )
  );

  const propArray = Array.from(dlg.properties());
  expect(propArray.length).toEqual(2);
  expect(
    propArray.findIndex(elem => elem.label === cred.spec.propertyLabel.enabled)
  ).not.toEqual(-1);
  expect(
    propArray.findIndex(elem => elem.label === cred.spec.propertyLabel.font)
  ).not.toEqual(-1);
});

test('DialogDefinition.addPositionalProperty for new property', () => {
  const dlg = new cred.resource.DialogDefinition();

  dlg.addPositionalProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlg.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

test('DialogDefinition.addPositionalProperty for existing property', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  // Should replace the existing property.
  dlg.addPositionalProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlg.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

test('DialogDefinition.addLabeledProperty for new property', () => {
  const dlg = new cred.resource.DialogDefinition();

  dlg.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlg.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

test('DialogDefinition.addLabeledProperty for existing property', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  // Should not replace the existing property.
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlg.property(cred.spec.propertyLabel.enabled).value).toEqual(1);
});

test('DialogDefinition.addSerializedProperty for new property', () => {
  const dlg = new cred.resource.DialogDefinition();

  dlg.addSerializedProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlg.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

test('DialogDefinition.addSerializedProperty for existing property', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  // Should replace the existing property.
  dlg.addSerializedProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlg.property(cred.spec.propertyLabel.enabled).value).toEqual(0);
});

test('DialogDefinition.control for existing control', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );

  const ctrl = dlg.control('label-id');
  expect(ctrl).toBeDefined();
  expect(ctrl.id).toEqual('label-id');
});

test('DialogDefinition.control for not existing control', () => {
  const dlg = new cred.resource.DialogDefinition();
  expect(dlg.control('label-id')).toBeUndefined();
});

test('DialogDefinition.controls', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.pushButton, 'button-id')
  );

  const ctrlArray = Array.from(dlg.controls());
  expect(ctrlArray.length).toEqual(2);
  expect(ctrlArray.findIndex(elem => elem.id === 'label-id')).not.toEqual(-1);
  expect(ctrlArray.findIndex(elem => elem.id === 'button-id')).not.toEqual(-1);
});

test('DialogDefinition.controls for no controls', () => {
  const dlg = new cred.resource.DialogDefinition();
  const ctrlArray = Array.from(dlg.controls());
  expect(ctrlArray.length).toEqual(0);
});

test('DialogDefinition.addControlDefinition for first control', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  expect(dlg.control('label-id')).toBeDefined();
});

test('DialogDefinition.addControlDefinition for multiple controls', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.pushButton, 'button-id')
  );

  expect(dlg.control('label-id')).toBeDefined();
  expect(dlg.control('button-id')).toBeDefined();
});

test('DialogDefinition.addControlDefinition for existing control', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  expect(() =>
    dlg.addControlDefinition(
      new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
    )
  ).toThrow();
});

test('DialogDefinition.updateControlId', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );

  dlg.updateControlId('label-id', 'new-id');
  expect(dlg.control('label-id')).toBeUndefined();
  expect(dlg.control('new-id')).toBeDefined();
});

test('DialogDefinition.updateControlId for not existing control', () => {
  const dlg = new cred.resource.DialogDefinition();
  dlg.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );

  dlg.updateControlId('other-id', 'new-id');
  expect(dlg.control('other-id')).toBeUndefined();
  expect(dlg.control('new-id')).toBeUndefined();
  expect(dlg.control('label-id')).toBeDefined();
});
