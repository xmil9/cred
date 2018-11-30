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

///////////////////

test('DialogResource construction', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.german);
  expect(dlgRes.locale).toEqual(cred.locale.german);
  expect(dlgRes.version).toEqual('');
  expect(Array.from(dlgRes.includedHeaders()).length).toEqual(0);
  expect(dlgRes.dialogDefinition).toBeDefined();
  expect(dlgRes.dialogId).toEqual('');
  expect(Array.from(dlgRes.controls()).length).toEqual(0);
});

test('DialogResource.copyAs', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.english);
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      'myid'
    )
  );
  dlgRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  dlgRes.addLayer(new cred.resource.LayerDefinition('test-layer', [1, 2]));
  dlgRes.addIncludedHeader('test-header.h');

  const copy = dlgRes.copyAs(cred.locale.german);
  expect(copy).toBeDefined();
  expect(copy).not.toBe(dlgRes);
  expect(copy.locale).toEqual(cred.locale.german);
  expect(copy.version).toEqual('');
  expect(copy.dialogDefinition).not.toBe(dlgRes.dialogDefinition);
  const dlgId = copy.dialogPropertyValue(cred.spec.propertyLabel.id);
  expect(dlgId).toEqual('myid');
  const copiedCtrl = copy.control('label-id');
  expect(copiedCtrl).toBeDefined();
  expect(copiedCtrl).not.toBe(dlgRes.control('label-id'));
  expect(Array.from(copy.includedHeaders()).length).toEqual(1);
  expect(Array.from(copy.layers()).length).toEqual(1);
});

test('DialogResource.locale for language locale', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.japanese);
  expect(dlgRes.locale).toEqual(cred.locale.japanese);
});

test('DialogResource.locale for master locale', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  expect(dlgRes.locale).toEqual(cred.locale.any);
});

test('DialogResource.dialogId', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      'mydlg'
    )
  );

  expect(dlgRes.dialogId).toEqual('mydlg');
});

test('DialogResource.dialogId without id property', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  expect(dlgRes.dialogId).toEqual('');
});

test('DialogResource.stringFileName for language locales', () => {
  const languages = new Map([
    [cred.locale.english, 'English.str'],
    [cred.locale.german, 'German.str'],
    [cred.locale.japanese, 'Japan.str']
  ]);

  for (const [lang, fileSufffix] of languages) {
    const dlgRes = new cred.resource.DialogResource(lang);
    dlgRes.addLabeledProperty(
      cred.spec.propertyLabel.id,
      cred.resource.makePropertyDefinition(
        cred.spec.propertyLabel.id,
        cred.spec.physicalPropertyType.identifier,
        'mydlg'
      )
    );
    expect(dlgRes.stringFileName()).toEqual('mydlg.' + fileSufffix);
  }
});

test('DialogResource.stringFileName for master locale', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      'mydlg'
    )
  );
  expect(dlgRes.stringFileName()).toBeUndefined();
});

test('DialogResource.dialogDefinition', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  expect(dlgRes.dialogDefinition).toBeDefined();
});

test('DialogResource.dialogPropertyValue', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      'mydlg'
    )
  );
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      10
    )
  );
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.id)).toEqual('mydlg');
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.left)).toEqual(10);
});

test('DialogResource.addPositionalProperty for new property', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);

  dlgRes.addPositionalProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.enabled)).toEqual(0);
});

test('DialogResource.addPositionalProperty for existing property', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  // Should replace the existing property.
  dlgRes.addPositionalProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.enabled)).toEqual(0);
});

test('DialogResource.addLabeledProperty for new property', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);

  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.enabled)).toEqual(0);
});

test('DialogResource.addLabeledProperty for existing property', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  // Should not replace the existing property.
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.enabled)).toEqual(1);
});

test('DialogResource.addSerializedProperty for new property', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);

  dlgRes.addSerializedProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.enabled)).toEqual(0);
});

test('DialogResource.addSerializedProperty for existing property', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      1
    )
  );

  // Should replace the existing property.
  dlgRes.addSerializedProperty(
    cred.spec.propertyLabel.enabled,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.enabled,
      cred.spec.physicalPropertyType.number,
      0
    )
  );
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.enabled)).toEqual(0);
});

test('DialogResource.control for existing control', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  expect(dlgRes.control('label-id')).toBeDefined();
});

test('DialogResource.control for not existing control', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  expect(dlgRes.control('label-id')).toBeUndefined();
});

test('DialogResource.controls', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  dlgRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.pushButton, 'button-id')
  );

  const ctrlArray = Array.from(dlgRes.controls());
  expect(ctrlArray.length).toEqual(2);
  expect(ctrlArray.findIndex(elem => elem.id === 'label-id')).not.toEqual(-1);
  expect(ctrlArray.findIndex(elem => elem.id === 'button-id')).not.toEqual(-1);
});

test('DialogResource.controls for no controls', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  const ctrlArray = Array.from(dlgRes.controls());
  expect(ctrlArray.length).toEqual(0);
});

test('DialogResource.addControlDefinition for first control', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  expect(dlgRes.control('label-id')).toBeDefined();
});

test('DialogResource.addControlDefinition for multiple controls', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  dlgRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.pushButton, 'button-id')
  );

  expect(dlgRes.control('label-id')).toBeDefined();
  expect(dlgRes.control('button-id')).toBeDefined();
});

test('DialogResource.addControlDefinition for existing control', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  expect(() =>
    dlgRes.addControlDefinition(
      new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
    )
  ).toThrow();
});

test('DialogResource.includedHeaders', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addIncludedHeader('header1.h');
  dlgRes.addIncludedHeader('header2.h');

  const headerArray = Array.from(dlgRes.includedHeaders());
  expect(headerArray.length).toEqual(2);
  expect(headerArray.includes('header1.h')).toBeTruthy();
  expect(headerArray.includes('header2.h')).toBeTruthy();
});

test('DialogResource.includedHeaders for no headers', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  const headerArray = Array.from(dlgRes.includedHeaders());
  expect(headerArray.length).toEqual(0);
});

test('DialogResource.addIncludedHeader for first header', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addIncludedHeader('header1.h');
  expect(Array.from(dlgRes.includedHeaders()).includes('header1.h')).toBeTruthy();
});

test('DialogResource.addIncludedHeader for multiple headers', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addIncludedHeader('header1.h');
  dlgRes.addIncludedHeader('header2.h');

  const headerArray = Array.from(dlgRes.includedHeaders());
  expect(headerArray.includes('header1.h')).toBeTruthy();
  expect(headerArray.includes('header2.h')).toBeTruthy();
});

test('DialogResource.addIncludedHeader for existing header', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addIncludedHeader('header1.h');
  dlgRes.addIncludedHeader('header1.h');

  const headerArray = Array.from(dlgRes.includedHeaders());
  expect(headerArray.length).toEqual(1);
  expect(headerArray.includes('header1.h')).toBeTruthy();
});

test('DialogResource.addIncludedHeader for case insensitive header', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addIncludedHeader('header1.h');
  dlgRes.addIncludedHeader('Header1.h');

  const headerArray = Array.from(dlgRes.includedHeaders());
  expect(headerArray.length).toEqual(1);
  expect(headerArray.includes('header1.h')).toBeTruthy();
});

test('DialogResource.layers', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLayer(new cred.resource.LayerDefinition('layer 1'));
  dlgRes.addLayer(new cred.resource.LayerDefinition('layer 2'));

  const layerArray = Array.from(dlgRes.layers());
  expect(layerArray.length).toEqual(2);
  expect(layerArray.findIndex(elem => elem.name === 'layer 1')).not.toEqual(-1);
  expect(layerArray.findIndex(elem => elem.name === 'layer 2')).not.toEqual(-1);
});

test('DialogResource.layers for no layers', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  const layerArray = Array.from(dlgRes.layers());
  expect(layerArray.length).toEqual(0);
});

test('DialogResource.addLayer for first layer', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLayer(new cred.resource.LayerDefinition('layer 1'));
  expect(
    Array.from(dlgRes.layers()).findIndex(elem => elem.name === 'layer 1')
  ).not.toEqual(-1);
});

test('DialogResource.addLayer for multiple layers', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLayer(new cred.resource.LayerDefinition('layer 1'));
  dlgRes.addLayer(new cred.resource.LayerDefinition('layer 2'));

  const layerArray = Array.from(dlgRes.layers());
  expect(layerArray.findIndex(elem => elem.name === 'layer 1')).not.toEqual(-1);
  expect(layerArray.findIndex(elem => elem.name === 'layer 2')).not.toEqual(-1);
});

test('DialogResource.addLayer for existing layer', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addLayer(new cred.resource.LayerDefinition('layer 1'));
  dlgRes.addLayer(new cred.resource.LayerDefinition('layer 1'));

  // No duplicate
  const layerArray = Array.from(dlgRes.layers());
  expect(layerArray.length).toEqual(2);
});

test('DialogResource.updateDialogId', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.english);
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      'myid'
    )
  );

  dlgRes.updateDialogId('other-id');
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.id)).toEqual('other-id');
});

test('DialogResource.updateDialogId for not existing id', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.english);

  dlgRes.updateDialogId('other-id');
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.id)).toEqual('other-id');
});

test('DialogResource.updateControlId', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  dlgRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );

  dlgRes.updateControlId('label-id', 'other-id');
  expect(dlgRes.control('other-id')).toBeDefined();
});

test('DialogResource.updateControlId for not existing control', () => {
  const dlgRes = new cred.resource.DialogResource(cred.locale.any);
  expect(() => dlgRes.updateControlId('label-id', 'other-id')).not.toThrow();
});

///////////////////

// Helper function that creates a dialog resource with a given id for a given locale.
function makeDialogResource(locale, id) {
  const dlgRes = new cred.resource.DialogResource(locale);
  dlgRes.addLabeledProperty(
    cred.spec.propertyLabel.id,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.id,
      cred.spec.physicalPropertyType.identifier,
      id
    )
  );
  return dlgRes;
}

test('DialogResourceSetBuilder.addResource for linked resources', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  const masterResource = makeDialogResource(cred.locale.any, 'myid');
  builder.addResource(masterResource);
  const resSet = builder.build();

  expect(resSet.dialogResource(cred.locale.any)).toBe(masterResource);
  // Unspecified locale resources are linked to the master resource.
  for (const lang of cred.language) {
    expect(resSet.dialogResource(cred.localeFromLanguage(lang))).toBe(masterResource);
  }
  // Empty import logs.
  for (const lang of cred.language) {
    expect(resSet.importLog(lang)).toBeDefined();
    expect(resSet.importLog(lang).length).toEqual(0);
  }
});

test('DialogResourceSetBuilder.addResource for linked and unlinked resources', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  const masterResource = makeDialogResource(cred.locale.any, 'myid');
  builder.addResource(masterResource);
  const deResource = makeDialogResource(cred.locale.german, 'myid');
  builder.addResource(deResource);
  const resSet = builder.build();

  expect(resSet.dialogResource(cred.locale.any)).toBe(masterResource);
  expect(resSet.dialogResource(cred.locale.german)).toBe(deResource);
  expect(resSet.dialogResource(cred.locale.english)).toBe(masterResource);
  expect(resSet.dialogResource(cred.locale.japanese)).toBe(masterResource);
  // Empty import logs.
  for (const lang of cred.language) {
    expect(resSet.importLog(lang)).toBeDefined();
    expect(resSet.importLog(lang).length).toEqual(0);
  }
});

test('DialogResourceSetBuilder.addResource with import logs', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  const masterResource = makeDialogResource(cred.locale.any, 'myid');
  builder.addResource(masterResource, ['entry 1', 'entry 2']);
  const deResource = makeDialogResource(cred.locale.german, 'myid');
  builder.addResource(deResource, ['de 1']);
  const resSet = builder.build();

  expect(resSet.importLog(cred.locale.any).length).toEqual(2);
  expect(resSet.importLog(cred.locale.german).length).toEqual(1);
  expect(resSet.importLog(cred.locale.english).length).toEqual(0);
});

test('DialogResourceSetBuilder.addStrings for all languages', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  const masterResource = makeDialogResource(cred.locale.any, 'myid');
  builder.addResource(masterResource);
  const deResource = makeDialogResource(cred.locale.german, 'myid');
  builder.addResource(deResource);
  const enMap = new cred.resource.StringMap();
  enMap.add('str1', 'hello', cred.language.english);
  builder.addStrings(cred.language.english, enMap);
  const deMap = new cred.resource.StringMap();
  deMap.add('str1', 'hallo', cred.language.german);
  builder.addStrings(cred.language.english, deMap);
  const jpMap = new cred.resource.StringMap();
  jpMap.add('str1', 'konitchiva', cred.language.japanese);
  builder.addStrings(cred.language.english, jpMap);
  const resSet = builder.build();

  expect(resSet.lookupString('str1', cred.language.english)).toEqual('hello');
  expect(resSet.lookupString('str1', cred.language.german)).toEqual('hallo');
  expect(resSet.lookupString('str1', cred.language.japanese)).toEqual('konitchiva');
});

test('DialogResourceSetBuilder.addStrings for one language', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  const masterResource = makeDialogResource(cred.locale.any, 'myid');
  builder.addResource(masterResource);
  const deResource = makeDialogResource(cred.locale.german, 'myid');
  builder.addResource(deResource);
  const deMap = new cred.resource.StringMap();
  deMap.add('str1', 'hallo', cred.language.german);
  builder.addStrings(cred.language.english, deMap);
  const resSet = builder.build();

  expect(resSet.lookupString('str1', cred.language.german)).toEqual('hallo');
  expect(resSet.lookupString('str1', cred.language.english)).toBeUndefined();
  expect(resSet.lookupString('str1', cred.language.japanese)).toBeUndefined();
});

test('DialogResourceSetBuilder.build', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  const masterResource = makeDialogResource(cred.locale.any, 'myid');
  builder.addResource(masterResource, ['master 1', 'master 2']);
  const enResource = makeDialogResource(cred.locale.english, 'myid');
  builder.addResource(enResource, []);
  const deResource = makeDialogResource(cred.locale.german, 'myid');
  builder.addResource(deResource, ['de 1']);
  const enMap = new cred.resource.StringMap();
  enMap.add('str1', 'hello', cred.language.english);
  builder.addStrings(cred.language.english, enMap);
  const deMap = new cred.resource.StringMap();
  deMap.add('str1', 'hallo', cred.language.german);
  builder.addStrings(cred.language.english, deMap);
  const jpMap = new cred.resource.StringMap();
  jpMap.add('str1', 'konitchiva', cred.language.japanese);
  builder.addStrings(cred.language.english, jpMap);

  const resSet = builder.build();

  expect(resSet.dialogResource(cred.locale.any)).toBe(masterResource);
  expect(resSet.dialogResource(cred.locale.english)).toBe(enResource);
  expect(resSet.dialogResource(cred.locale.german)).toBe(deResource);
  expect(resSet.dialogResource(cred.locale.japanese)).toBe(masterResource);
  expect(resSet.importLog(cred.locale.any).length).toEqual(2);
  expect(resSet.importLog(cred.locale.english).length).toEqual(0);
  expect(resSet.importLog(cred.locale.german).length).toEqual(1);
  expect(resSet.lookupString('str1', cred.language.english)).toEqual('hello');
  expect(resSet.lookupString('str1', cred.language.german)).toEqual('hallo');
  expect(resSet.lookupString('str1', cred.language.japanese)).toEqual('konitchiva');
});

test('DialogResourceSetBuilder detect unnecessary master resource for fully unlinked language resources', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  const masterResource = makeDialogResource(cred.locale.any, 'myid');
  builder.addResource(masterResource);
  const enResource = makeDialogResource(cred.locale.english, 'myid');
  builder.addResource(enResource);
  const deResource = makeDialogResource(cred.locale.german, 'myid');
  builder.addResource(deResource);
  const jpResource = makeDialogResource(cred.locale.japanese, 'myid');
  builder.addResource(jpResource);

  expect(() => builder.build()).toThrow();
});

test('DialogResourceSetBuilder detect missing master resource for linked language resources', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  const enResource = makeDialogResource(cred.locale.english, 'myid');
  builder.addResource(enResource);
  const deResource = makeDialogResource(cred.locale.german, 'myid');
  builder.addResource(deResource);

  expect(() => builder.build()).toThrow();
});

test('DialogResourceSetBuilder detect mismatched dialog id', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  const masterResource = makeDialogResource(cred.locale.any, 'myid');
  builder.addResource(masterResource);
  const enResource = makeDialogResource(cred.locale.english, 'myid');
  builder.addResource(enResource);
  const deResource = makeDialogResource(cred.locale.german, 'otherid');
  builder.addResource(deResource);

  expect(() => builder.build()).toThrow();
});

test('DialogResourceSetBuilder detect unpopulated builder object', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  expect(() => builder.build()).toThrow();
});

///////////////////

// Helper function that creates a dialog resource set from a given array of resources.
// The resouce set does not have any strings or import logs.
function makeDialogResourceSet(resources) {
  const builder = new cred.resource.DialogResourceSetBuilder();
  for (const resource of resources) {
    builder.addResource(resource, []);
  }
  for (const lang of cred.language) {
    builder.addStrings(lang, new cred.resource.StringMap(), 'TEXT');
  }
  return builder.build();
}

// Helper function that creates a dialog resource set from a given array of resources
// and import logs.
function makeDialogResourceSetWithLogs(resourceAndLogArray) {
  const builder = new cred.resource.DialogResourceSetBuilder();
  for (const [res, log] of resourceAndLogArray) {
    builder.addResource(res, log);
  }
  for (const lang of cred.language) {
    builder.addStrings(lang, new cred.resource.StringMap(), 'TEXT');
  }
  return builder.build();
}

// Helper function that creates a dialog resource set from a given array of resources
// and an array of arrays of id, text, language tuples.
function makeDialogResourceSetWithStrings(resources, strings) {
  const builder = new cred.resource.DialogResourceSetBuilder();
  for (const resource of resources) {
    builder.addResource(resource, []);
  }
  for (const lang of cred.language) {
    const langStrMap = new cred.resource.StringMap();
    strings.filter(elem => elem[2] === lang).forEach(elem => {
      langStrMap.add(...elem);
    });
    builder.addStrings(lang, langStrMap, 'TEXT');
  }
  return builder.build();
}

test('DialogResourceSet.masterFileName', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  expect(resSet.masterFileName).toEqual('myid.dlg');
});

test('DialogResourceSet.languageDialogFileName for english dialog', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.english, 'myid')
  ]);
  expect(resSet.languageDialogFileName(cred.language.english)).toEqual(
    'myid.English.dlg'
  );
});

test('DialogResourceSet.languageDialogFileName for german dialog', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.german, 'myid')
  ]);
  expect(resSet.languageDialogFileName(cred.language.german)).toEqual('myid.German.dlg');
});

test('DialogResourceSet.languageDialogFileName for japanese dialog', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);
  expect(resSet.languageDialogFileName(cred.language.japanese)).toEqual('myid.Japan.dlg');
});

test('DialogResourceSet.languageDialogFileName for linked language', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  expect(resSet.languageDialogFileName(cred.language.english)).toEqual(
    'myid.English.dlg'
  );
});

test('DialogResourceSet.languageStringFileName for english dialog', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.english, 'myid')
  ]);
  expect(resSet.languageStringFileName(cred.language.english)).toEqual(
    'myid.English.str'
  );
});

test('DialogResourceSet.languageStringFileName for german dialog', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.german, 'myid')
  ]);
  expect(resSet.languageStringFileName(cred.language.german)).toEqual('myid.German.str');
});

test('DialogResourceSet.languageStringFileName for japanese dialog', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);
  expect(resSet.languageStringFileName(cred.language.japanese)).toEqual('myid.Japan.str');
});

test('DialogResourceSet.languageStringFileName for linked language', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  expect(resSet.languageStringFileName(cred.language.japanese)).toEqual('myid.Japan.str');
});

test('DialogResourceSet.dialogId', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  expect(resSet.dialogId).toEqual('myid');
});

test('DialogResourceSet.dialogResource for master locale', () => {
  const masterRes = makeDialogResource(cred.locale.any, 'myid');
  const resSet = makeDialogResourceSet([masterRes]);
  expect(resSet.dialogResource(cred.locale.any)).toBe(masterRes);
});

test('DialogResourceSet.dialogResource for unlinked resource', () => {
  const enRes = makeDialogResource(cred.locale.english, 'myid');
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    enRes
  ]);
  expect(resSet.dialogResource(cred.locale.english)).toBe(enRes);
});

test('DialogResourceSet.dialogResource for linked resource', () => {
  const masterRes = makeDialogResource(cred.locale.any, 'myid');
  const resSet = makeDialogResourceSet([masterRes]);
  expect(resSet.dialogResource(cred.locale.english)).toBe(masterRes);
});

test('DialogResourceSet.unlinkedDialogResources for mix of linked and unlinked resources', () => {
  const masterRes = makeDialogResource(cred.locale.any, 'myid');
  const deRes = makeDialogResource(cred.locale.german, 'myid');
  const resSet = makeDialogResourceSet([masterRes, deRes]);

  const unlinkedArray = Array.from(resSet.unlinkedDialogResources());
  expect(unlinkedArray.length).toEqual(2);
  expect(unlinkedArray.includes(masterRes)).toBeTruthy();
  expect(unlinkedArray.includes(deRes)).toBeTruthy();
});

test('DialogResourceSet.unlinkedDialogResources for only unlinked resources', () => {
  const enRes = makeDialogResource(cred.locale.english, 'myid');
  const deRes = makeDialogResource(cred.locale.german, 'myid');
  const jpRes = makeDialogResource(cred.locale.japanese, 'myid');
  const resSet = makeDialogResourceSet([enRes, deRes, jpRes]);

  const unlinkedArray = Array.from(resSet.unlinkedDialogResources());
  expect(unlinkedArray.length).toEqual(3);
  expect(unlinkedArray.includes(enRes)).toBeTruthy();
  expect(unlinkedArray.includes(deRes)).toBeTruthy();
  expect(unlinkedArray.includes(jpRes)).toBeTruthy();
});

test('DialogResourceSet.unlinkedDialogResources for only linked resources', () => {
  const masterRes = makeDialogResource(cred.locale.any, 'myid');
  const resSet = makeDialogResourceSet([masterRes]);

  const unlinkedArray = Array.from(resSet.unlinkedDialogResources());
  expect(unlinkedArray.length).toEqual(1);
  expect(unlinkedArray.includes(masterRes)).toBeTruthy();
});

test('DialogResourceSet.isLinkedToMaster for linked resource', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  expect(resSet.isLinkedToMaster(cred.locale.german)).toBeTruthy();
});

test('DialogResourceSet.isLinkedToMaster for unlinked resource', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.german, 'myid')
  ]);

  expect(resSet.isLinkedToMaster(cred.locale.german)).toBeFalsy();
});

test('DialogResourceSet.isLinkedToMaster for master resource of linked resources', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  // Always true.
  expect(resSet.isLinkedToMaster(cred.locale.any)).toBeTruthy();
});

test('DialogResourceSet.isLinkedToMaster for master resource of unlinked resources', () => {
  const enRes = makeDialogResource(cred.locale.english, 'myid');
  const deRes = makeDialogResource(cred.locale.german, 'myid');
  const jpRes = makeDialogResource(cred.locale.japanese, 'myid');
  const resSet = makeDialogResourceSet([enRes, deRes, jpRes]);
  // Always true.
  expect(resSet.isLinkedToMaster(cred.locale.any)).toBeTruthy();
});

test('DialogResourceSet.linkToMaster for unlinked resource', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.english, 'myid'),
    makeDialogResource(cred.locale.german, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);
  resSet.linkToMaster(cred.locale.english);
  expect(resSet.isLinkedToMaster(cred.locale.english)).toBeTruthy();
  expect(resSet.isLinkedToMaster(cred.locale.german)).toBeFalsy();
  expect(resSet.isLinkedToMaster(cred.locale.japanese)).toBeFalsy();
});

test('DialogResourceSet.linkToMaster for linked resource', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  resSet.linkToMaster(cred.locale.english);
  expect(resSet.isLinkedToMaster(cred.locale.english)).toBeTruthy();
  expect(resSet.isLinkedToMaster(cred.locale.german)).toBeTruthy();
  expect(resSet.isLinkedToMaster(cred.locale.japanese)).toBeTruthy();
});

test('DialogResourceSet.unlinkFromMaster for unlinked resource', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.english, 'myid'),
    makeDialogResource(cred.locale.german, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);
  resSet.unlinkFromMaster(cred.locale.english);
  expect(resSet.isLinkedToMaster(cred.locale.english)).toBeTruthy();
  expect(resSet.isLinkedToMaster(cred.locale.german)).toBeFalsy();
  expect(resSet.isLinkedToMaster(cred.locale.japanese)).toBeFalsy();
});

test('DialogResourceSet.linkToMaster for linked resource', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  resSet.unlinkFromMaster(cred.locale.english);
  expect(resSet.isLinkedToMaster(cred.locale.english)).toBeFalsy();
  expect(resSet.isLinkedToMaster(cred.locale.german)).toBeTruthy();
  expect(resSet.isLinkedToMaster(cred.locale.japanese)).toBeTruthy();
});

test('DialogResourceSet.areAllLanguagesUnlinked for all unlinked resources', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.english, 'myid'),
    makeDialogResource(cred.locale.german, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);
  expect(resSet.areAllLanguagesUnlinked()).toBeTruthy();
});

test('DialogResourceSet.areAllLanguagesUnlinked for all linked resources', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  expect(resSet.areAllLanguagesUnlinked()).toBeFalsy();
});

test('DialogResourceSet.areAllLanguagesUnlinked for mixed resources', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  resSet.unlinkFromMaster(cred.locale.english);
  expect(resSet.areAllLanguagesUnlinked()).toBeFalsy();
});

test('DialogResourceSet.areAllLanguagesLinked for only unlinked resources', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.english, 'myid'),
    makeDialogResource(cred.locale.german, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);
  expect(resSet.areAllLanguagesLinked()).toBeFalsy();
});

test('DialogResourceSet.areAllLanguagesLinkedfor only linked resources', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  expect(resSet.areAllLanguagesLinked()).toBeTruthy();
});

test('DialogResourceSet.areAllLanguagesLinked for mixed resources', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  resSet.unlinkFromMaster(cred.locale.english);
  expect(resSet.areAllLanguagesLinked()).toBeFalsy();
});

test('DialogResourceSet.linkedLocales for only unlinked resources', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.english, 'myid'),
    makeDialogResource(cred.locale.german, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);
  const linkedArray = Array.from(resSet.linkedLocales());
  expect(linkedArray.length).toEqual(1);
  expect(linkedArray.includes(cred.locale.any)).toBeTruthy();
});

test('DialogResourceSet.linkedLocales for only linked resources', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  const linkedArray = Array.from(resSet.linkedLocales());
  for (const locale of cred.locale) {
    expect(linkedArray.includes(locale)).toBeTruthy();
  }
});

test('DialogResourceSet.linkedLocales for mixed resources', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.german, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);
  const linkedArray = Array.from(resSet.linkedLocales());
  expect(linkedArray.length).toEqual(2);
  expect(linkedArray.includes(cred.locale.any)).toBeTruthy();
  expect(linkedArray.includes(cred.locale.english)).toBeTruthy();
});

test('DialogResourceSet.importLog for no logs', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.german, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);
  expect(resSet.importLog(cred.locale.any)).toEqual([]);
  expect(resSet.importLog(cred.locale.english)).toEqual([]);
  expect(resSet.importLog(cred.locale.german)).toEqual([]);
});

test('DialogResourceSet.importLog', () => {
  const resSet = makeDialogResourceSetWithLogs([
    [makeDialogResource(cred.locale.any, 'myid'), ['any 1', 'any 2']],
    [makeDialogResource(cred.locale.german, 'myid'), []],
    [makeDialogResource(cred.locale.japanese, 'myid'), ['jp 1']]
  ]);
  expect(resSet.importLog(cred.locale.any)).toEqual(['any 1', 'any 2']);
  expect(resSet.importLog(cred.locale.english)).toEqual([]);
  expect(resSet.importLog(cred.locale.german)).toEqual([]);
  expect(resSet.importLog(cred.locale.japanese)).toEqual(['jp 1']);
});

test('DialogResourceSet.lookupString for existing string', () => {
  const resSet = makeDialogResourceSetWithStrings(
    [makeDialogResource(cred.locale.any, 'myid')],
    [
      ['str1', 'test', cred.language.english],
      ['str1', 'Test', cred.language.german],
      ['str1', 'test in jp', cred.language.japanese]
    ]
  );
  expect(resSet.lookupString('str1', cred.language.english)).toEqual('test');
  expect(resSet.lookupString('str1', cred.language.german)).toEqual('Test');
  expect(resSet.lookupString('str1', cred.language.japanese)).toEqual('test in jp');
});

test('DialogResourceSet.lookupString for not existing id', () => {
  const resSet = makeDialogResourceSetWithStrings(
    [makeDialogResource(cred.locale.any, 'myid')],
    [
      ['str1', 'test', cred.language.english],
      ['str1', 'Test', cred.language.german],
      ['str1', 'test in jp', cred.language.japanese]
    ]
  );
  expect(resSet.lookupString('str2', cred.language.english)).toBeUndefined();
  expect(resSet.lookupString('str2', cred.language.german)).toBeUndefined();
  expect(resSet.lookupString('str2', cred.language.japanese)).toBeUndefined();
});

test('DialogResourceSet.addString for not existing id', () => {
  const resSet = makeDialogResourceSetWithStrings(
    [makeDialogResource(cred.locale.any, 'myid')],
    [
      ['str1', 'test', cred.language.english],
      ['str1', 'Test', cred.language.german],
      ['str1', 'test in jp', cred.language.japanese]
    ]
  );
  resSet.addString('str2', 'added', cred.language.english);

  expect(resSet.lookupString('str2', cred.language.english)).toEqual('added');
});

test('DialogResourceSet.addString for existing id', () => {
  const resSet = makeDialogResourceSetWithStrings(
    [makeDialogResource(cred.locale.any, 'myid')],
    [
      ['str1', 'test', cred.language.english],
      ['str1', 'Test', cred.language.german],
      ['str1', 'test in jp', cred.language.japanese]
    ]
  );
  resSet.addString('str1', 'changed', cred.language.english);

  expect(resSet.lookupString('str1', cred.language.english)).toEqual('changed');
});

test('DialogResourceSet.languageStrings', () => {
  const resSet = makeDialogResourceSetWithStrings(
    [makeDialogResource(cred.locale.any, 'myid')],
    [
      ['str1', 'test', cred.language.english],
      ['str1', 'Test', cred.language.german],
      ['str1', 'test in jp', cred.language.japanese],
      ['str2', '2', cred.language.english],
      ['str3', '3', cred.language.english],
      ['str4', '4', cred.language.english]
    ]
  );

  const enStrings = Array.from(resSet.languageStrings(cred.language.english));
  expect(enStrings.length).toEqual(4);
  expect(enStrings[0][0]).toEqual('str1');
  expect(enStrings[0][1]).toEqual('test');
  expect(enStrings[2][0]).toEqual('str3');
  expect(enStrings[2][1]).toEqual('3');
});

test('DialogResourceSet.languageStrings for no strings', () => {
  const resSet = makeDialogResourceSetWithStrings(
    [makeDialogResource(cred.locale.any, 'myid')],
    [
      ['str1', 'test', cred.language.english],
      ['str1', 'Test', cred.language.german],
      ['str2', '2', cred.language.english],
      ['str3', '3', cred.language.english],
      ['str4', '4', cred.language.english]
    ]
  );

  const jpStrings = Array.from(resSet.languageStrings(cred.language.japanese));
  expect(jpStrings.length).toEqual(0);
});

test('DialogResourceSet.sourceStringEncoding', () => {
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(makeDialogResource(cred.locale.any, 'myid'), []);
  builder.addStrings(cred.language.english, new cred.resource.StringMap(), 'ANSI');
  builder.addStrings(cred.language.german, new cred.resource.StringMap(), 'UNICODE');
  builder.addStrings(cred.language.japanese, new cred.resource.StringMap(), 'SHIFT_JIS');
  const resSet = builder.build();

  expect(resSet.sourceStringEncoding(cred.language.english)).toEqual('ANSI');
  expect(resSet.sourceStringEncoding(cred.language.german)).toEqual('UNICODE');
  expect(resSet.sourceStringEncoding(cred.language.japanese)).toEqual('SHIFT_JIS');
});

test('DialogResourceSet.updateDialogId', () => {
  const resSet = makeDialogResourceSet([
    makeDialogResource(cred.locale.any, 'myid'),
    makeDialogResource(cred.locale.german, 'myid'),
    makeDialogResource(cred.locale.japanese, 'myid')
  ]);

  resSet.updateDialogId('new-id');
  expect(resSet.dialogId).toEqual('new-id');
});

test('DialogResourceSet.updateControlId', () => {
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(
    new cred.resource.ControlDefinition(cred.spec.controlType.label, 'label-id')
  );
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();
  resSet.unlinkFromMaster(cred.locale.german);

  resSet.updateControlId('label-id', 'other-id');
  for (const locale of cred.locale) {
    expect(resSet.dialogResource(locale).control('other-id')).toBeDefined();
  }
});

test('DialogResourceSet.updateControlId for not existing control', () => {
  const resSet = makeDialogResourceSet([makeDialogResource(cred.locale.any, 'myid')]);
  resSet.updateControlId('label-id', 'other-id');
  for (const locale of cred.locale) {
    expect(resSet.dialogResource(locale).control('other-id')).toBeUndefined();
  }
});

test('DialogResourceSet.updateProperty for dialog property in master resource', () => {
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      300
    )
  );
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateProperty(dlgItemMock, cred.spec.propertyLabel.left, 200, [
    cred.locale.any
  ]);

  for (const locale of cred.locale) {
    expect(
      resSet.dialogResource(locale).dialogPropertyValue(cred.spec.propertyLabel.left)
    ).toEqual(200);
  }
});

test('DialogResourceSet.updateProperty for dialog property in multiple resources', () => {
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      300
    )
  );
  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      200
    )
  );
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateProperty(dlgItemMock, cred.spec.propertyLabel.left, 100, [
    cred.locale.any,
    cred.locale.english
  ]);

  for (const locale of cred.locale) {
    expect(
      resSet.dialogResource(locale).dialogPropertyValue(cred.spec.propertyLabel.left)
    ).toEqual(100);
  }
});

test('DialogResourceSet.updateProperty for dialog property in some resources', () => {
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      300
    )
  );
  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      200
    )
  );
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  // Update for English resource only.
  resSet.updateProperty(dlgItemMock, cred.spec.propertyLabel.left, 100, [
    cred.locale.english
  ]);

  expect(
    resSet
      .dialogResource(cred.locale.english)
      .dialogPropertyValue(cred.spec.propertyLabel.left)
  ).toEqual(100);
  for (const locale of [cred.locale.any, cred.locale.german, cred.locale.japanese]) {
    expect(
      resSet.dialogResource(locale).dialogPropertyValue(cred.spec.propertyLabel.left)
    ).toEqual(300);
  }
});

test('DialogResourceSet.updateProperty for control property in master resource', () => {
  const labelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  labelCtrl.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      200
    )
  );
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(labelCtrl);
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateProperty(ctrlItemMock, cred.spec.propertyLabel.left, 300, [
    cred.locale.any
  ]);

  for (const locale of cred.locale) {
    expect(
      resSet
        .dialogResource(locale)
        .control('label-id')
        .property(cred.spec.propertyLabel.left).value
    ).toEqual(300);
  }
});

test('DialogResourceSet.updateProperty for control property in multiple resources', () => {
  const masterLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  masterLabelCtrl.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      200
    )
  );
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(masterLabelCtrl);

  const deLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  deLabelCtrl.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      200
    )
  );
  const deRes = new cred.resource.DialogResource(cred.locale.german);
  deRes.addControlDefinition(deLabelCtrl);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(deRes, []);
  const resSet = builder.build();

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateProperty(ctrlItemMock, cred.spec.propertyLabel.left, 300, [
    cred.locale.any,
    cred.locale.german
  ]);

  for (const locale of cred.locale) {
    expect(
      resSet
        .dialogResource(locale)
        .control('label-id')
        .property(cred.spec.propertyLabel.left).value
    ).toEqual(300);
  }
});

test('DialogResourceSet.updateProperty for control property in some resources', () => {
  const masterLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  masterLabelCtrl.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      200
    )
  );
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(masterLabelCtrl);

  const deLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  deLabelCtrl.addLabeledProperty(
    cred.spec.propertyLabel.left,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.left,
      cred.spec.physicalPropertyType.number,
      200
    )
  );
  const deRes = new cred.resource.DialogResource(cred.locale.german);
  deRes.addControlDefinition(deLabelCtrl);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(deRes, []);
  const resSet = builder.build();

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  // Update for german resouce only.
  resSet.updateProperty(ctrlItemMock, cred.spec.propertyLabel.left, 300, [
    cred.locale.german
  ]);

  expect(
    resSet
      .dialogResource(cred.locale.german)
      .control('label-id')
      .property(cred.spec.propertyLabel.left).value
  ).toEqual(300);
  for (const locale of [cred.locale.any, cred.locale.english, cred.locale.japanese]) {
    expect(
      resSet
        .dialogResource(locale)
        .control('label-id')
        .property(cred.spec.propertyLabel.left).value
    ).toEqual(200);
  }
});

test('DialogResourceSet.updateLocalizedStringProperty for dialog property in resource linked to master', () => {
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(
    cred.spec.propertyLabel.text,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.text,
      cred.spec.physicalPropertyType.identifier,
      'str-id'
    )
  );
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();
  resSet.addString('str-id', 'initial', cred.language.english);
  resSet.addString('str-id', 'initial', cred.language.german);
  resSet.addString('str-id', 'initial', cred.language.japanese);

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateLocalizedStringProperty(
    dlgItemMock,
    cred.spec.propertyLabel.text,
    'changed',
    cred.locale.german
  );

  expect(resSet.lookupString('str-id', cred.language.english)).toEqual('initial');
  expect(resSet.lookupString('str-id', cred.language.german)).toEqual('changed');
  expect(resSet.lookupString('str-id', cred.language.japanese)).toEqual('initial');
});

test('DialogResourceSet.updateLocalizedStringProperty for dialog property in unlinked resource', () => {
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(
    cred.spec.propertyLabel.text,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.text,
      cred.spec.physicalPropertyType.identifier,
      'str-id'
    )
  );
  const jpRes = new cred.resource.DialogResource(cred.locale.japanese);
  jpRes.addLabeledProperty(
    cred.spec.propertyLabel.text,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.text,
      cred.spec.physicalPropertyType.identifier,
      'str-id'
    )
  );
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(jpRes, []);
  const resSet = builder.build();
  resSet.addString('str-id', 'initial', cred.language.english);
  resSet.addString('str-id', 'initial', cred.language.german);
  resSet.addString('str-id', 'initial', cred.language.japanese);

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateLocalizedStringProperty(
    dlgItemMock,
    cred.spec.propertyLabel.text,
    'changed',
    cred.locale.japanese
  );

  expect(resSet.lookupString('str-id', cred.language.english)).toEqual('initial');
  expect(resSet.lookupString('str-id', cred.language.german)).toEqual('initial');
  expect(resSet.lookupString('str-id', cred.language.japanese)).toEqual('changed');
});

test('DialogResourceSet.updateLocalizedStringProperty for dialog property in master resource', () => {
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(
    cred.spec.propertyLabel.text,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.text,
      cred.spec.physicalPropertyType.identifier,
      'str-id'
    )
  );
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();
  resSet.addString('str-id', 'initial', cred.language.english);
  resSet.addString('str-id', 'initial', cred.language.german);
  resSet.addString('str-id', 'initial', cred.language.japanese);

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  // Should not change any strings because the master locale has no strings.
  resSet.updateLocalizedStringProperty(
    dlgItemMock,
    cred.spec.propertyLabel.text,
    'changed',
    cred.locale.any
  );

  expect(resSet.lookupString('str-id', cred.language.english)).toEqual('initial');
  expect(resSet.lookupString('str-id', cred.language.german)).toEqual('initial');
  expect(resSet.lookupString('str-id', cred.language.japanese)).toEqual('initial');
});

test('DialogResourceSet.updateLocalizedStringProperty for non-identifier dialog property', () => {
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(
    cred.spec.propertyLabel.text,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.text,
      // String instead of identifier property!
      cred.spec.physicalPropertyType.string,
      'str'
    )
  );
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };

  expect(() =>
    resSet.updateLocalizedStringProperty(
      dlgItemMock,
      cred.spec.propertyLabel.text,
      'changed',
      cred.locale.german
    )
  ).toThrow();
});

test('DialogResourceSet.updateLocalizedStringProperty for control property in resource linked to master', () => {
  const masterLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  masterLabelCtrl.addLabeledProperty(
    cred.spec.propertyLabel.text,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.text,
      cred.spec.physicalPropertyType.identifier,
      'str-id'
    )
  );
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(masterLabelCtrl);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();
  resSet.addString('str-id', 'initial', cred.language.english);
  resSet.addString('str-id', 'initial', cred.language.german);
  resSet.addString('str-id', 'initial', cred.language.japanese);

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateLocalizedStringProperty(
    ctrlItemMock,
    cred.spec.propertyLabel.text,
    'changed',
    cred.locale.german
  );

  expect(resSet.lookupString('str-id', cred.language.english)).toEqual('initial');
  expect(resSet.lookupString('str-id', cred.language.german)).toEqual('changed');
  expect(resSet.lookupString('str-id', cred.language.japanese)).toEqual('initial');
});

test('DialogResourceSet.updateLocalizedStringProperty for control property in unlinked resource', () => {
  const masterLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  masterLabelCtrl.addLabeledProperty(
    cred.spec.propertyLabel.text,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.text,
      cred.spec.physicalPropertyType.identifier,
      'str-id'
    )
  );
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(masterLabelCtrl);

  const enLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  enLabelCtrl.addLabeledProperty(
    cred.spec.propertyLabel.text,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.text,
      cred.spec.physicalPropertyType.identifier,
      'str-id'
    )
  );
  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addControlDefinition(enLabelCtrl);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();
  resSet.addString('str-id', 'initial', cred.language.english);
  resSet.addString('str-id', 'initial', cred.language.german);
  resSet.addString('str-id', 'initial', cred.language.japanese);

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateLocalizedStringProperty(
    ctrlItemMock,
    cred.spec.propertyLabel.text,
    'changed',
    cred.locale.english
  );

  expect(resSet.lookupString('str-id', cred.language.english)).toEqual('changed');
  expect(resSet.lookupString('str-id', cred.language.german)).toEqual('initial');
  expect(resSet.lookupString('str-id', cred.language.japanese)).toEqual('initial');
});

test('DialogResourceSet.updateLocalizedStringProperty for control property in master resource', () => {
  const masterLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  masterLabelCtrl.addLabeledProperty(
    cred.spec.propertyLabel.text,
    cred.resource.makePropertyDefinition(
      cred.spec.propertyLabel.text,
      cred.spec.physicalPropertyType.identifier,
      'str-id'
    )
  );
  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(masterLabelCtrl);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();
  resSet.addString('str-id', 'initial', cred.language.english);
  resSet.addString('str-id', 'initial', cred.language.german);
  resSet.addString('str-id', 'initial', cred.language.japanese);

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  // Should not change any strings because the master locale has no strings.
  resSet.updateLocalizedStringProperty(
    ctrlItemMock,
    cred.spec.propertyLabel.text,
    'changed',
    cred.locale.any
  );

  expect(resSet.lookupString('str-id', cred.language.english)).toEqual('initial');
  expect(resSet.lookupString('str-id', cred.language.german)).toEqual('initial');
  expect(resSet.lookupString('str-id', cred.language.japanese)).toEqual('initial');
});

test('DialogResourceSet.updateFlagProperty to add a flag to dialog property in master resource', () => {
  const flagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  flagsProp.addFlag('A', 1);
  flagsProp.addFlag('B', 2);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, flagsProp);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateFlagProperty(
    dlgItemMock,
    cred.spec.propertyLabel.styleFlags,
    'C',
    4,
    true,
    [cred.locale.any]
  );

  for (const locale of cred.locale) {
    expect(
      resSet
        .dialogResource(locale)
        .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
    ).toEqual(7);
  }
});

test('DialogResourceSet.updateFlagProperty to remove a flag from dialog property in master resource', () => {
  const flagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  flagsProp.addFlag('A', 1);
  flagsProp.addFlag('B', 2);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, flagsProp);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateFlagProperty(
    dlgItemMock,
    cred.spec.propertyLabel.styleFlags,
    'B',
    2,
    false,
    [cred.locale.any]
  );

  for (const locale of cred.locale) {
    expect(
      resSet
        .dialogResource(locale)
        .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
    ).toEqual(1);
  }
});

test('DialogResourceSet.updateFlagProperty to add a flag to dialog property in multiple resources', () => {
  const masterFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  masterFlagsProp.addFlag('A', 1);
  masterFlagsProp.addFlag('B', 2);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, masterFlagsProp);

  const enFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  enFlagsProp.addFlag('D', 8);

  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, enFlagsProp);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateFlagProperty(
    dlgItemMock,
    cred.spec.propertyLabel.styleFlags,
    'C',
    4,
    true,
    [cred.locale.any, cred.locale.english]
  );

  expect(
    resSet
      .dialogResource(cred.locale.english)
      .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
  ).toEqual(12);
  for (const locale of [cred.locale.any, cred.locale.german, cred.locale.japanese]) {
    expect(
      resSet
        .dialogResource(locale)
        .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
    ).toEqual(7);
  }
});

test('DialogResourceSet.updateFlagProperty to remove a flag from dialog property in multiple resources', () => {
  const masterFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  masterFlagsProp.addFlag('A', 1);
  masterFlagsProp.addFlag('B', 2);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, masterFlagsProp);

  const enFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  enFlagsProp.addFlag('B', 2);

  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, enFlagsProp);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateFlagProperty(
    dlgItemMock,
    cred.spec.propertyLabel.styleFlags,
    'B',
    2,
    false,
    [cred.locale.any, cred.locale.english]
  );

  expect(
    resSet
      .dialogResource(cred.locale.english)
      .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
  ).toEqual(0);
  for (const locale of [cred.locale.any, cred.locale.german, cred.locale.japanese]) {
    expect(
      resSet
        .dialogResource(locale)
        .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
    ).toEqual(1);
  }
});

test('DialogResourceSet.updateFlagProperty to add a flag to a dialog property in some resources', () => {
  const masterFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  masterFlagsProp.addFlag('A', 1);
  masterFlagsProp.addFlag('B', 2);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, masterFlagsProp);

  const enFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  enFlagsProp.addFlag('D', 8);

  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, enFlagsProp);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateFlagProperty(
    dlgItemMock,
    cred.spec.propertyLabel.styleFlags,
    'C',
    4,
    true,
    [cred.locale.english]
  );

  expect(
    resSet
      .dialogResource(cred.locale.english)
      .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
  ).toEqual(12);
  for (const locale of [cred.locale.any, cred.locale.german, cred.locale.japanese]) {
    expect(
      resSet
        .dialogResource(locale)
        .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
    ).toEqual(3);
  }
});

test('DialogResourceSet.updateFlagProperty to remove a flag from a dialog property in some resources', () => {
  const masterFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  masterFlagsProp.addFlag('A', 1);
  masterFlagsProp.addFlag('B', 2);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, masterFlagsProp);

  const enFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  enFlagsProp.addFlag('B', 2);

  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addLabeledProperty(cred.spec.propertyLabel.styleFlags, enFlagsProp);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const dlgItemMock = {
    id: 'unused',
    isDialog() {
      return true;
    }
  };
  resSet.updateFlagProperty(
    dlgItemMock,
    cred.spec.propertyLabel.styleFlags,
    'B',
    2,
    false,
    [cred.locale.english]
  );

  expect(
    resSet
      .dialogResource(cred.locale.english)
      .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
  ).toEqual(0);
  for (const locale of [cred.locale.any, cred.locale.german, cred.locale.japanese]) {
    expect(
      resSet
        .dialogResource(locale)
        .dialogPropertyValue(cred.spec.propertyLabel.styleFlags)
    ).toEqual(3);
  }
});

test('DialogResourceSet.updateFlagProperty to add a flag to a control property in master resource', () => {
  const flagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  flagsProp.addFlag('A', 1);
  flagsProp.addFlag('B', 2);

  const labelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  labelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, flagsProp);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(labelCtrl);
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateFlagProperty(
    ctrlItemMock,
    cred.spec.propertyLabel.styleFlags,
    'C',
    4,
    true,
    [cred.locale.any]
  );

  for (const locale of cred.locale) {
    expect(
      resSet
        .dialogResource(locale)
        .control('label-id')
        .property(cred.spec.propertyLabel.styleFlags).value
    ).toEqual(7);
  }
});

test('DialogResourceSet.updateFlagProperty to remove a flag from a control property in master resource', () => {
  const flagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  flagsProp.addFlag('A', 1);
  flagsProp.addFlag('B', 2);

  const labelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  labelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, flagsProp);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(labelCtrl);
  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  const resSet = builder.build();

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateFlagProperty(
    ctrlItemMock,
    cred.spec.propertyLabel.styleFlags,
    'A',
    1,
    false,
    [cred.locale.any]
  );

  for (const locale of cred.locale) {
    expect(
      resSet
        .dialogResource(locale)
        .control('label-id')
        .property(cred.spec.propertyLabel.styleFlags).value
    ).toEqual(2);
  }
});

test('DialogResourceSet.updateFlagProperty to add a flag to control property in multiple resources', () => {
  const masterFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  masterFlagsProp.addFlag('A', 1);
  masterFlagsProp.addFlag('B', 2);

  const masterLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  masterLabelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, masterFlagsProp);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(masterLabelCtrl);

  const enFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  enFlagsProp.addFlag('D', 8);

  const enLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  enLabelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, enFlagsProp);

  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addControlDefinition(enLabelCtrl);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateFlagProperty(
    ctrlItemMock,
    cred.spec.propertyLabel.styleFlags,
    'C',
    4,
    true,
    [cred.locale.any, cred.locale.english]
  );

  expect(
    resSet
      .dialogResource(cred.locale.english)
      .control('label-id')
      .property(cred.spec.propertyLabel.styleFlags).value
  ).toEqual(12);
  for (const locale of [cred.locale.any, cred.locale.german, cred.locale.japanese]) {
    expect(
      resSet
        .dialogResource(locale)
        .control('label-id')
        .property(cred.spec.propertyLabel.styleFlags).value
    ).toEqual(7);
  }
});

test('DialogResourceSet.updateFlagProperty to remove a flag from control property in multiple resources', () => {
  const masterFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  masterFlagsProp.addFlag('A', 1);
  masterFlagsProp.addFlag('B', 2);

  const masterLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  masterLabelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, masterFlagsProp);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(masterLabelCtrl);

  const enFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  enFlagsProp.addFlag('B', 2);

  const enLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  enLabelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, enFlagsProp);

  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addControlDefinition(enLabelCtrl);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateFlagProperty(
    ctrlItemMock,
    cred.spec.propertyLabel.styleFlags,
    'B',
    2,
    false,
    [cred.locale.any, cred.locale.english]
  );

  expect(
    resSet
      .dialogResource(cred.locale.english)
      .control('label-id')
      .property(cred.spec.propertyLabel.styleFlags).value
  ).toEqual(0);
  for (const locale of [cred.locale.any, cred.locale.german, cred.locale.japanese]) {
    expect(
      resSet
        .dialogResource(locale)
        .control('label-id')
        .property(cred.spec.propertyLabel.styleFlags).value
    ).toEqual(1);
  }
});

test('DialogResourceSet.updateFlagProperty to add a flag to control property in some resources', () => {
  const masterFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  masterFlagsProp.addFlag('A', 1);
  masterFlagsProp.addFlag('B', 2);

  const masterLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  masterLabelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, masterFlagsProp);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(masterLabelCtrl);

  const enFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  enFlagsProp.addFlag('D', 8);

  const enLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  enLabelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, enFlagsProp);

  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addControlDefinition(enLabelCtrl);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateFlagProperty(
    ctrlItemMock,
    cred.spec.propertyLabel.styleFlags,
    'C',
    4,
    true,
    [cred.locale.english]
  );

  expect(
    resSet
      .dialogResource(cred.locale.english)
      .control('label-id')
      .property(cred.spec.propertyLabel.styleFlags).value
  ).toEqual(12);
  for (const locale of [cred.locale.any, cred.locale.german, cred.locale.japanese]) {
    expect(
      resSet
        .dialogResource(locale)
        .control('label-id')
        .property(cred.spec.propertyLabel.styleFlags).value
    ).toEqual(3);
  }
});

test('DialogResourceSet.updateFlagProperty to remove a flag from control property in some resources', () => {
  const masterFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  masterFlagsProp.addFlag('A', 1);
  masterFlagsProp.addFlag('B', 2);

  const masterLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  masterLabelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, masterFlagsProp);

  const masterRes = new cred.resource.DialogResource(cred.locale.any);
  masterRes.addControlDefinition(masterLabelCtrl);

  const enFlagsProp = cred.resource.makePropertyDefinition(
    cred.spec.propertyLabel.styleFlags,
    cred.spec.physicalPropertyType.flags,
    0
  );
  enFlagsProp.addFlag('B', 2);

  const enLabelCtrl = new cred.resource.ControlDefinition(
    cred.spec.controlType.label,
    'label-id'
  );
  enLabelCtrl.addLabeledProperty(cred.spec.propertyLabel.styleFlags, enFlagsProp);

  const enRes = new cred.resource.DialogResource(cred.locale.english);
  enRes.addControlDefinition(enLabelCtrl);

  const builder = new cred.resource.DialogResourceSetBuilder();
  builder.addResource(masterRes, []);
  builder.addResource(enRes, []);
  const resSet = builder.build();

  const ctrlItemMock = {
    id: 'label-id',
    isDialog() {
      return false;
    }
  };
  resSet.updateFlagProperty(
    ctrlItemMock,
    cred.spec.propertyLabel.styleFlags,
    'B',
    2,
    false,
    [cred.locale.english]
  );

  expect(
    resSet
      .dialogResource(cred.locale.english)
      .control('label-id')
      .property(cred.spec.propertyLabel.styleFlags).value
  ).toEqual(0);
  for (const locale of [cred.locale.any, cred.locale.german, cred.locale.japanese]) {
    expect(
      resSet
        .dialogResource(locale)
        .control('label-id')
        .property(cred.spec.propertyLabel.styleFlags).value
    ).toEqual(3);
  }
});

test('DialogResourceSet.normalizeLocalizedStrings for non-empty dialog string', () => {
  // const masterTextProp = cred.resource.makePropertyDefinition(
  //   cred.spec.propertyLabel.text,
  //   cred.spec.physicalPropertyType.identifier,
  //   'textStrID'
  // );
  // const masterRes = new cred.resource.DialogResource(cred.locale.any);
  // masterRes.addLabeledProperty(cred.spec.propertyLabel.text, masterTextProp);

  // const enTextProp = cred.resource.makePropertyDefinition(
  //   cred.spec.propertyLabel.text,
  //   cred.spec.physicalPropertyType.identifier,
  //   'textStrID'
  // );
  // const enRes = new cred.resource.DialogResource(cred.locale.english);
  // enRes.addLabeledProperty(cred.spec.propertyLabel.text, enTextProp);

  // const builder = new cred.resource.DialogResourceSetBuilder();
  // builder.addResource(masterRes, []);
  // builder.addResource(enRes, []);
  // const resSet = builder.build();
  // resSet.addString('textStrId', 'en text', cred.language.english);
  // resSet.addString('textStrId', 'de text', cred.language.german);
  // resSet.addString('textStrId', 'jp text', cred.language.japanese);

  // resSet.normalizeLocalizedStrings();
  // // Not the best test because we are only checking that the strings still exists. We cannot
  // // access the string ids because they are encapulated in the dialog resource set.
  // expect(resSet.languageStrings(cred.language.english).includes('en text')).toBeTruthy();
  // expect(resSet.languageStrings(cred.language.german).includes('de text')).toBeTruthy();
  // expect(resSet.languageStrings(cred.language.japanese).includes('jp text')).toBeTruthy();
});
