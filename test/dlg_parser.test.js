//
// Tests for the parser component of the dialog reader.
//
'use strict';

var cred = cred || {};
cred = require('../cred_types');
cred.lexer = require('../dlg_lexer');
cred.parser = require('../dlg_parser');
cred.spec = require('../dlg_spec');

///////////////////

test('cred.parser.parseDialog for undefined tokens', () => {
  expect(cred.parser.parseDialog(undefined, cred.locale.any)).toBeUndefined();
});

test('cred.parser.parseDialog for no tokens', () => {
  expect(cred.parser.parseDialog([], cred.locale.any)).toBeUndefined();
});

test('cred.parser.parseDialog for including other dialog file', () => {
  const tokens = cred.lexer.analyse('#include "kSymbolConvert.dlg"');
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes).toBeUndefined();
});

test('cred.parser.parseDialog for including multiple other dialog files', () => {
  const content =
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.dlg"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.dlg"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.dlg"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ';
  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.any);
  expect(dlgRes).toBeUndefined();
});

test('cred.parser.parseDialog for minimal dialog', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);

  expect(dlgRes.version).toEqual('1.1');
  expect(Array.from(dlgRes.includedHeaders())).toEqual(['ResourceDefines.h']);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.id)).toEqual('dlgId');
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.left)).toEqual(0);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.top)).toEqual(0);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.width)).toEqual(10);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.height)).toEqual(20);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.text)).toEqual('strId');
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.resourceClass)).toEqual(
    'className'
  );
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.styleFlags)).toEqual(0);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.font)).toEqual('');
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.fontSize)).toEqual(0);
  expect(Array.from(dlgRes.controls())).toEqual([]);
  expect(Array.from(dlgRes.layers())).toEqual([]);
});

test('cred.parser.parseDialog for missing C++ header', () => {
  const content =
    '// Version [1.1] //\n                                                      ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing version', () => {
  const content =
    '#include "ResourceDefines.h"                                               ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing English string include', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing German string include', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing Japanese string include', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for string includes in different order', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_GERMAN                                                          ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#elif defined RES_US                                                       ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes).toBeDefined();
});

test('cred.parser.parseDialog for missing string include line', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing #else-#error', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing #endif', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for serialized dialog string property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"{[Tooltip=""test""]}",0,0,10,20,strId,  ' +
    '"",0,"",0)                                                                 ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.tooltip)).toEqual('test');
});

test('cred.parser.parseDialog for serialized dialog integer number property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"{[MaxValue=50]}",0,0,10,20,strId,       ' +
    '"",0,"",0)                                                                 ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.maxValue)).toEqual(50);
});

test('cred.parser.parseDialog for serialized dialog floating point number property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"{[MaxValue=50.123]}",0,0,10,20,strId,       ' +
    '"",0,"",0)                                                                 ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.maxValue)).toEqual(50.123);
});

test('cred.parser.parseDialog for serialized dialog negative number property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"{[MaxValue=-50]}",0,0,10,20,strId,       ' +
    '"",0,"",0)                                                                 ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.maxValue)).toEqual(-50);
});

test('cred.parser.parseDialog for serialized flag property not supported', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"{[ExtStyleFlags=WS_CHILD|WS_VISIBLE|187]}",' +
    '0,0,10,20,strId,"",0,"",0)                                                ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.extStyleFlags)).toEqual(0);
});

test('cred.parser.parseDialog for serialized dialog identifier property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"{[Tooltip=a_str_id]}",0,0,10,20,strId,  ' +
    '"",0,"",0)                                                                 ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.tooltip)).toEqual('a_str_id');
});

test('cred.parser.parseDialog for multiple serialized dialog properties', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"{[Tooltip=""test""][MinValue=10][Visible=0]}"' +
    ',0,0,10,20,strId,"",0,"",0)                                                ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.tooltip)).toEqual('test');
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.minValue)).toEqual(10);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.visible)).toEqual(0);
});

test('cred.parser.parseDialog for multiple serialized dialog properties with whitespace around them', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"{ [Tooltip=""test""]  [MinValue=10]     ' +
    '[Visible=0]  }",0,0,10,20,strId,"",0,"",0)                                 ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.tooltip)).toEqual('test');
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.minValue)).toEqual(10);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.visible)).toEqual(0);
});

test('cred.parser.parseDialog for positional style flags dialog property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"",                   ' +
    'WS_CHILD|WS_VISIBLE|187,"",0)                                              ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.styleFlags)).toEqual(187);
});

test('cred.parser.parseDialog for misspelled begin_dialog_definition_ex_ keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialo_definition_ex_("",0,0,10,20,strId,"",0,"",0)                   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for misspelled end_dialog_definition_ex_ keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialo_definition_ex_("",0,0,10,20,strId,"",0,"",0)                   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definitoin_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing positional id dialog property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_("",0,0,10,20,strId,"",0,"",0)                  ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing positional coordinate dialog property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,10,20,strId,"",0,"",0)              ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing last positional dialog property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"",0,"")              ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for positional id dialog property with wrong type', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(4,"",0,0,10,20,strId,"",0,"",0)                ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for positional font dialog property with wrong type', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,strId,"",0,wrong,0)            ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for positional text dialog property as string', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,"string","",0,"",0)            ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.text)).toEqual('string');
});

test('cred.parser.parseDialog for labeled integer number dialog property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '    define_dialog_property(KillPopup,1)                                    ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.killPopup)).toEqual(1);
});

test('cred.parser.parseDialog for labeled floating point number dialog property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '    define_dialog_property(Precision,3.4)                                  ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.precision)).toEqual(3.4);
});

test('cred.parser.parseDialog for labeled negtive number dialog property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '    define_dialog_property(Precision,-3.4)                                  ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.precision)).toEqual(-3.4);
});

test('cred.parser.parseDialog for labeled identifier dialog property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '    define_dialog_property(PaddingType,DialogPaddingTypes::Default)        ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.paddingType)).toEqual(
    'DialogPaddingTypes::Default'
  );
});

test('cred.parser.parseDialog for labeled string dialog property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '    define_dialog_property(Tooltip,"test")                                 ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.tooltip)).toEqual('test');
});

test('cred.parser.parseDialog for multiple labeled dialog properties', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '    define_dialog_property(Tooltip,"test")                                 ' +
    '    define_dialog_property(PaddingType,DialogPaddingTypes::Default)        ' +
    '    define_dialog_property(KillPopup,1)                                    ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.tooltip)).toEqual('test');
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.paddingType)).toEqual(
    'DialogPaddingTypes::Default'
  );
  expect(dlgRes.dialogPropertyValue(cred.spec.propertyLabel.killPopup)).toEqual(1);
});

test('cred.parser.parseDialog for labeled dialog property with missing label', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '    define_dialog_property(,5)                                             ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for labeled dialog property with missing value', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '    define_dialog_property(Tooltip,)                                       ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for misspelled begin_dialog_properties keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begn_dialog_properties()                                                 ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for misspelled end_dialog_properties keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_proprties()                                                   ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for misspelled define_dialog_property keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '    defne_dialog_property(Tooltip,"aa")                                    ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for control declaration', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId')).toBeDefined();
  expect(dlgRes.control('ctrlId').id).toEqual('ctrlId');
  expect(dlgRes.control('ctrlId').type).toEqual(cred.spec.controlType.pushButton);
});

test('cred.parser.parseDialog for control declaration with numeric id', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,100)                                          ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control(100)).toBeDefined();
  expect(dlgRes.control(100).id).toEqual(100);
  expect(dlgRes.control(100).type).toEqual(cred.spec.controlType.pushButton);
});

test('cred.parser.parseDialog for minimal control definition', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId')).toBeDefined();
  expect(dlgRes.control('ctrlId').id).toEqual('ctrlId');
  expect(dlgRes.control('ctrlId').type).toEqual(cred.spec.controlType.pushButton);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.ctrlType).value
  ).toEqual(cred.spec.controlType.pushButton);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.resourceClass).value
  ).toEqual('Button');
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.id).value).toEqual(
    'ctrlId'
  );
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.left).value).toEqual(
    445
  );
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.top).value).toEqual(
    360
  );
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.width).value).toEqual(
    75
  );
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.height).value).toEqual(
    22
  );
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.styleFlags).value
  ).toEqual(0);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.extStyleFlags).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for minimal control definition with numeric id', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,101)                                          ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,101,labelId,445,360,75,22,0,0)      ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control(101)).toBeDefined();
  expect(dlgRes.control(101).id).toEqual(101);
  expect(dlgRes.control(101).type).toEqual(cred.spec.controlType.pushButton);
  expect(dlgRes.control(101).property(cred.spec.propertyLabel.ctrlType).value).toEqual(
    cred.spec.controlType.pushButton
  );
  expect(
    dlgRes.control(101).property(cred.spec.propertyLabel.resourceClass).value
  ).toEqual('Button');
  expect(dlgRes.control(101).property(cred.spec.propertyLabel.id).value).toEqual(101);
  expect(dlgRes.control(101).property(cred.spec.propertyLabel.left).value).toEqual(445);
  expect(dlgRes.control(101).property(cred.spec.propertyLabel.top).value).toEqual(360);
  expect(dlgRes.control(101).property(cred.spec.propertyLabel.width).value).toEqual(75);
  expect(dlgRes.control(101).property(cred.spec.propertyLabel.height).value).toEqual(22);
  expect(dlgRes.control(101).property(cred.spec.propertyLabel.styleFlags).value).toEqual(
    0
  );
  expect(
    dlgRes.control(101).property(cred.spec.propertyLabel.extStyleFlags).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for serialized control string property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[ImageNormal=""SYMP_FIND_BUTTON_ICON""]}",445,360,75,22,0,0)             ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.imageNormal).value
  ).toEqual('SYMP_FIND_BUTTON_ICON');
});

test('cred.parser.parseDialog for serialized control integer number property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[ToolBarLike=0]}",445,360,75,22,0,0)                                     ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.toolBarLike).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for serialized control floating point number property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[ToolBarLike=3.0]}",445,360,75,22,0,0)                                   ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.toolBarLike).value
  ).toEqual(3.0);
});

test('cred.parser.parseDialog for serialized control negative number property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[ToolBarLike=-3]}",445,360,75,22,0,0)                                   ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.toolBarLike).value
  ).toEqual(-3);
});

test('cred.parser.parseDialog for serialized flag control property not supported', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[ExtStyleFlags=WS_CHILD|WS_VISIBLE|187]}",445,360,75,22,0,0)             ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.extStyleFlags).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for serialized control identifier property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[Tooltip=StringId]}",445,360,75,22,0,0)                                  ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.tooltip).value
  ).toEqual('StringId');
});

test('cred.parser.parseDialog for multiple serialized control properties', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[Tooltip=StringId][ToolBarLike=0]}",445,360,75,22,0,0)                   ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.tooltip).value
  ).toEqual('StringId');
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.toolBarLike).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for multiple serialized control properties with whitespace around them', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '" {  [Tooltip=StringId]  [ToolBarLike=0]  } ",445,360,75,22,0,0)           ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.tooltip).value
  ).toEqual('StringId');
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.toolBarLike).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for empty serialized control properties', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,"{}",445,360,75,22,0,0)      ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId')).toBeDefined();
  expect(Array.from(dlgRes.control('ctrlId').properties()).length).toEqual(9);
});

test('cred.parser.parseDialog for serialized control properties with caption', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[Tooltip=StringId][ToolBarLike=0]}Caption="mycaption"",445,360,75,22,   ' +
    '0,0)                                                                       ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.text).value).toEqual(
    'mycaption'
  );
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.tooltip).value
  ).toEqual('StringId');
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.toolBarLike).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for serialized control properties with caption that has spaces', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[Tooltip=StringId][ToolBarLike=0]}Caption="my multiword caption"",       ' +
    '445,360,75,22,0,0)                                                         ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.text).value).toEqual(
    'my multiword caption'
  );
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.tooltip).value
  ).toEqual('StringId');
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.toolBarLike).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for serialized control properties with caption that has digits', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[Tooltip=StringId][ToolBarLike=0]}Caption="my caption 3"",               ' +
    '445,360,75,22,0,0)                                                         ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.text).value).toEqual(
    'my caption 3'
  );
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.tooltip).value
  ).toEqual('StringId');
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.toolBarLike).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for serialized control properties with caption that has a dash', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[Tooltip=StringId][ToolBarLike=0]}Caption="my-caption"",                 ' +
    '445,360,75,22,0,0)                                                         ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.text).value).toEqual(
    'my-caption'
  );
});

test('cred.parser.parseDialog for serialized control properties with caption that has a nultiple spaces', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[Tooltip=StringId][ToolBarLike=0]}Caption="my     caption"",             ' +
    '445,360,75,22,0,0)                                                         ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.text).value).toEqual(
    'my     caption'
  );
});

test('cred.parser.parseDialog for serialized control properties with empty caption', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,                             ' +
    '"{[Tooltip=StringId][ToolBarLike=0]}Caption=""",445,360,75,22,0,0)         ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.text).value).toEqual(
    ''
  );
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.tooltip).value
  ).toEqual('StringId');
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.toolBarLike).value
  ).toEqual(0);
});

test('cred.parser.parseDialog for empty serialized control properties with caption', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,"{}Caption=""",445,360,75,   ' +
    '22,0,0)                                                                    ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.text).value).toEqual(
    ''
  );
  expect(Array.from(dlgRes.control('ctrlId').properties()).length).toEqual(10);
});

test('cred.parser.parseDialog for no serialized control properties but caption', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,"Caption="test"",445,360,75, ' +
    '22,0,0)                                                                    ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.text).value).toEqual(
    'test'
  );
  expect(Array.from(dlgRes.control('ctrlId').properties()).length).toEqual(10);
});

test('cred.parser.parseDialog for invalid serialized control properties', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,"invalid",445,360,75,22,0,0) ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for positional style flags control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,titleId,445,360,75,22,       ' +
    'WS_CHILD|WS_VISIBLE|187,0)                                                 ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.styleFlags).value
  ).toEqual(187);
});

test('cred.parser.parseDialog for positional ext style flags control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,titleId,445,360,75,22,       ' +
    'EX_FLAG_1|EX_FLAG_2|EX_FLAG_2|7,0)                                         ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.styleFlags).value
  ).toEqual(7);
});

test('cred.parser.parseDialog for misspelled begin_control_ex_ keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_contrl_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)    ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for misspelled end_control_ex_ keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '    end_control_x()                                                        ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing positional id control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,labelId,445,360,75,22,0,0)          ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing positional coordinate control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,0,0)      ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing last positional control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0)     ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for positional id control property with wrong type', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,"ctrlId",labelId,445,360,75,22,0,0) ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for positional style flags control property with wrong type', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,"",0)  ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for positional text control property as string', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"str",0,0,10,20,titleId,"",0,"",0)          ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,"label",445,360,75,22,0,0)   ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  // Not legal unless the string contains serialized properties!
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for labeled integer number control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '	     define_property(Group,1)                                             ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(dlgRes.control('ctrlId').property(cred.spec.propertyLabel.group).value).toEqual(
    1
  );
});

test('cred.parser.parseDialog for labeled floating point number control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '	     define_property(MaxValue,100.56)                                     ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.maxValue).value
  ).toEqual(100.56);
});

test('cred.parser.parseDialog for labeled negtive number control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '	     define_property(MinValue,-1)                                         ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.minValue).value
  ).toEqual(-1);
});

test('cred.parser.parseDialog for labeled identifier control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '	     define_property(ImageSizeType,ImageSizeType::px24)                   ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.imageSizeType).value
  ).toEqual('ImageSizeType::px24');
});

test('cred.parser.parseDialog for labeled string control property', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '	     define_property(Tooltip,"tip")                                       ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.tooltip).value
  ).toEqual('tip');
});

test('cred.parser.parseDialog for multiple labeled control properties', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '	     define_property(ImageSizeType,ImageSizeType::px24)                   ' +
    '	     define_property(Tooltip,"tip")                                       ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.imageSizeType).value
  ).toEqual('ImageSizeType::px24');
  expect(
    dlgRes.control('ctrlId').property(cred.spec.propertyLabel.tooltip).value
  ).toEqual('tip');
});

test('cred.parser.parseDialog for labeled control property with missing label', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '	     define_property("tip")                                               ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for labeled control property with missing value', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '	     define_property(Tooltip)                                             ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for misspelled define_property keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(id,"",0,0,10,20,titleId,"",0,"",0)             ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  declare_control(PushButton,ctrlId)                                       ' +
    '  begin_control_definitions()                                              ' +
    '    begin_control_ex(PushButton,Button,ctrlId,labelId,445,360,75,22,0,0)   ' +
    '	     defineproperty(Tooltip,"aa")                                         ' +
    '    end_control_ex()                                                       ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for layer with 4 numbers', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGIN_LAYER "Name"                                                       ' +
    '    0                                                                      ' +
    '    1                                                                      ' +
    '    2                                                                      ' +
    '    3                                                                      ' +
    '  END_LAYER                                                                ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  const layers = Array.from(dlgRes.layers());
  expect(layers.length).toEqual(1);
  expect(Array.from(layers[0].numbers())).toEqual([0, 1, 2, 3]);
});

test('cred.parser.parseDialog for layer with no numbers', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGIN_LAYER "Name"                                                       ' +
    '  END_LAYER                                                                ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  const layers = Array.from(dlgRes.layers());
  expect(layers.length).toEqual(1);
  expect(Array.from(layers[0].numbers())).toEqual([]);
});

test('cred.parser.parseDialog for multiple layers', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGIN_LAYER "Name"                                                       ' +
    '    0                                                                      ' +
    '    1                                                                      ' +
    '  END_LAYER                                                                ' +
    '  BEGIN_LAYER "2"                                                          ' +
    '    0                                                                      ' +
    '  END_LAYER                                                                ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  const dlgRes = cred.parser.parseDialog(tokens, cred.locale.english);
  const layers = Array.from(dlgRes.layers());
  expect(layers.length).toEqual(2);
  expect(Array.from(layers[0].numbers())).toEqual([0, 1]);
  expect(Array.from(layers[1].numbers())).toEqual([0]);
});

test('cred.parser.parseDialog for misspelled BEGIN_LAYERS keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYER                                                                ' +
    '  BEGIN_LAYER "Name"                                                       ' +
    '    0                                                                      ' +
    '  END_LAYER                                                                ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for misspelled END_LAYERS keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGIN_LAYER "Name"                                                       ' +
    '    0                                                                      ' +
    '  END_LAYER                                                                ' +
    'END_LYERS                                                                  ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for misspelled BEGIN_LAYER keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGI_LAYER "Name"                                                        ' +
    '    0                                                                      ' +
    '  END_LAYER                                                                ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for misspelled END_LAYER keyword', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGIN_LAYER "Name"                                                       ' +
    '    0                                                                      ' +
    '  ND_LAYER                                                                 ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing layer name', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGIN_LAYER                                                              ' +
    '    0                                                                      ' +
    '  END_LAYER                                                                ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for non-number layer number', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGIN_LAYER "1"                                                          ' +
    '    a                                                                      ' +
    '  END_LAYER                                                                ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing #if 0 in layer section', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGIN_LAYER "1"                                                          ' +
    '    0                                                                      ' +
    '  END_LAYER                                                                ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

test('cred.parser.parseDialog for missing #endif in layer section', () => {
  const content =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.str"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.str"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.str"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,10,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    '  BEGIN_LAYER "1"                                                          ' +
    '    0                                                                      ' +
    '  END_LAYER                                                                ' +
    'END_LAYERS                                                                 ';

  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseDialog(tokens, cred.locale.english)).toThrow();
});

///////////////////

test('cred.parser.parseStrings for undefined tokens', () => {
  expect(() => cred.parser.parseStrings(undefined, cred.language.english)).toThrow();
});

test('cred.parser.parseStrings for no tokens', () => {
  const strMap = cred.parser.parseStrings([], cred.language.english);
  expect(Array.from(strMap).length).toEqual(0);
});

test('cred.parser.parseStrings for one string', () => {
  const content = '#define	DLGPROP_kChooseSymbolDlg_1_Text	"Cancel"';
  const tokens = cred.lexer.analyse(content);
  const strMap = cred.parser.parseStrings(tokens, cred.language.english);
  const strArray = Array.from(strMap);
  expect(strArray.length).toEqual(1);
  expect(strArray[0]).toEqual([
    'DLGPROP_kChooseSymbolDlg_1_Text',
    'Cancel',
    cred.language.english
  ]);
});

test('cred.parser.parseStrings for empty string', () => {
  const content = '#define	DLGPROP_kChooseSymbolDlg_1_Text	""';
  const tokens = cred.lexer.analyse(content);
  const strMap = cred.parser.parseStrings(tokens, cred.language.english);
  const strArray = Array.from(strMap);
  expect(strArray.length).toEqual(1);
  expect(strArray[0]).toEqual([
    'DLGPROP_kChooseSymbolDlg_1_Text',
    '',
    cred.language.english
  ]);
});

test('cred.parser.parseStrings for multiple strings', () => {
  const content =
    '#define	DLGPROP_kChooseSymbolDlg_1_Text	"Cancel"                          ' +
    '#define	DLGPROP_kChooseSymbolDlg_2_Text	"OK"                              ' +
    '#define	DLGPROP_kChooseSymbolDlg_3_Text	"PlaceHolder"                     ';

  const tokens = cred.lexer.analyse(content);
  const strMap = cred.parser.parseStrings(tokens, cred.language.english);
  const strArray = Array.from(strMap);
  expect(strArray.length).toEqual(3);
  expect(strArray[0]).toEqual([
    'DLGPROP_kChooseSymbolDlg_1_Text',
    'Cancel',
    cred.language.english
  ]);
  expect(strArray[1]).toEqual([
    'DLGPROP_kChooseSymbolDlg_2_Text',
    'OK',
    cred.language.english
  ]);
  expect(strArray[2]).toEqual([
    'DLGPROP_kChooseSymbolDlg_3_Text',
    'PlaceHolder',
    cred.language.english
  ]);
});

test('cred.parser.parseStrings for misspelled #define keyword', () => {
  const content = 'define	DLGPROP_kChooseSymbolDlg_1_Text	"Cancel"';
  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseStrings(tokens, cred.language.english)).toThrow();
});

test('cred.parser.parseStrings for missing string identifier', () => {
  const content = '#define	"Cancel"';
  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseStrings(tokens, cred.language.english)).toThrow();
});

test('cred.parser.parseStrings for missing string text', () => {
  const content = '#define	id';
  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseStrings(tokens, cred.language.english)).toThrow();
});

test('cred.parser.parseStrings for non-string text', () => {
  const content = '#define	id text';
  const tokens = cred.lexer.analyse(content);
  expect(() => cred.parser.parseStrings(tokens, cred.language.english)).toThrow();
});
