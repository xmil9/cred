//
// Tests for the generator component of the dialog writer.
//
'use strict';

var cred = cred || {};
cred = require('../types');
cred.gen = require('../generator');
const testutil = require('./test_util');

///////////////////

// Generates the content for all locales for given input data. The input data
// is the content from which the dialog resources are constructed that are the
// input to the content generator. Basically the workflow is a roundtrip from
// input dialog content to output dialog content.
// The input content is given as map that associates locales with an object that
// contains a the dialog and string content of the associated locale.
// Returns another content map with the generated content.
function generateContentAsync(dlgName, contentMap) {
  return new Promise((resolve, reject) => {
    testutil
      .readDialogResourceSetAsyncStub(dlgName, contentMap)
      .then(dlgResSet => {
        // Denormalization is done outside the generator.
        dlgResSet.denormalizeLocalizedStrings();
        const generator = new cred.gen.ResourceGenerator(dlgResSet);

        const generatedContent = new Map();

        for (const locale of cred.locale) {
          const [dlg, strs] = generator.generateContent(locale);
          generatedContent.set(locale, { dialog: dlg, strings: strs });
        }

        resolve(generatedContent);
      })
      .catch(err => reject(err));
  });
}

///////////////////

test('ResourceGenerator.generateContent for linked languages', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    begin_control_definitions()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for unlinked and linked languages', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    begin_control_definitions()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enDlg = '#include "kTestDlg.dlg"\n';
  const deDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,30,40,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,40)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,30)\n' +
    '    end_dialog_properties()\n' +
    '    begin_control_definitions()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const jpDlg = '#include "kTestDlg.dlg"\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: enDlg, strings: enStrings }],
    [cred.locale.german, { dialog: deDlg, strings: deStrings }],
    [cred.locale.japanese, { dialog: jpDlg, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for unlinked languages', done => {
  const masterDlg =
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.dlg"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.dlg"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.dlg"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n';
  const enDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    begin_control_definitions()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const deDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,30,40,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,40)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,30)\n' +
    '    end_dialog_properties()\n' +
    '    begin_control_definitions()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const jpDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,50,60,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,60)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,50)\n' +
    '    end_dialog_properties()\n' +
    '    begin_control_definitions()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: enDlg, strings: enStrings }],
    [cred.locale.german, { dialog: deDlg, strings: deStrings }],
    [cred.locale.japanese, { dialog: jpDlg, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with numeric id', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "100.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "100.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "100.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(100,"",0,0,10,20,DLGPROP_100_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"100")\n' +
    '        define_dialog_property(Text,DLGPROP_100_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    begin_control_definitions()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_100_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_100_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_100_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('100', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a PushButton control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(PushButton,kCancelButtonID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(PushButton,Button,kCancelButtonID,DLGPROP_kTestDlg_1_Text,445,360,75,22,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | BS_PUSHBUTTON | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,22)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,445)\n' +
    '            define_property(ResourceName,"kCancelButtonID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,360)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,75)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Press"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Druecken"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-press"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a Label control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(Label,kStatic1ID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(Label,Static,kStatic1ID,DLGPROP_kTestDlg_1_Text,10,10,280,51,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | SS_LEFT | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,51)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"kStatic1ID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(TextAlign,TextAlign::Left)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,10)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,280)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "text"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Text"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-text"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a PlaceHolder control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(PlaceHolder,kChooseSymCatTreeID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(PlaceHolder,PLACEHOLDER,kChooseSymCatTreeID,DLGPROP_kTestDlg_1_Text,8,38,173,312,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,312)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,8)\n' +
    '            define_property(ResourceName,"kChooseSymCatTreeID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,38)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,173)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "text"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Text"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-text"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a TextBox control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(TextBox,kFindText)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(TextBox,CVEditClass,kFindText,"",8,7,223,21,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(CommandDelay,5000.5)\n' +
    '            define_property(CustomUnitIndex,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,21)\n' +
    '            define_property(IncValue,1)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,8)\n' +
    '            define_property(MaxValue,9999)\n' +
    '            define_property(MinValue,-9999)\n' +
    '            define_property(Precision,0)\n' +
    '            define_property(ReadOnly,0)\n' +
    '            define_property(ResourceName,"kFindText")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,7)\n' +
    '            define_property(Unit,UI::UnitType::type_AlphaNumeric)\n' +
    '            define_property(UpDownArrows,1)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,223)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a ImagePushButton control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(ImagePushButton,kFindButton)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(ImagePushButton,IMAGEBUTTON,kFindButton,"{[ImageNormal=""SYMP_FIND_BUTTON_ICON""][PushButtonLike=1][ToolBarLike=0]}",235,5,24,24,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373952,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,24)\n' +
    '            define_property(ImageChecked,"")\n' +
    '            define_property(ImageCheckedDisabled,"")\n' +
    '            define_property(ImageCheckedHot,"")\n' +
    '            define_property(ImageCheckedPressed,"")\n' +
    '            define_property(ImageDisabled,"")\n' +
    '            define_property(ImageHot,"")\n' +
    '            define_property(ImageNormal,"SYMP_FIND_BUTTON_ICON")\n' +
    '            define_property(ImagePressed,"")\n' +
    '            define_property(ImageSizeType,UI::ImageSizeType::px24)\n' +
    '            define_property(ImageTriState,"")\n' +
    '            define_property(ImageTriStateDisabled,"")\n' +
    '            define_property(ImageTriStateHot,"")\n' +
    '            define_property(ImageTriStatePressed,"")\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,235)\n' +
    '            define_property(OwnerDrawn,0)\n' +
    '            define_property(PushButtonLike,1)\n' +
    '            define_property(ResourceName,"kFindButton")\n' +
    '            define_property(SplitButtonLike,0)\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(ToolBarLike,0)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,5)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,24)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a ImageRadioButton control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(ImageRadioButton,kRotateCWButtonID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(ImageRadioButton,IMAGEBUTTON,kRotateCWButtonID,"{[ImageNormal=""ICON_ARROW_SPIN_RIGHT""][ToolBarLike=1]}",68,13,22,17,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373906,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,17)\n' +
    '            define_property(ImageChecked,"")\n' +
    '            define_property(ImageCheckedDisabled,"")\n' +
    '            define_property(ImageCheckedHot,"")\n' +
    '            define_property(ImageCheckedPressed,"")\n' +
    '            define_property(ImageDisabled,"")\n' +
    '            define_property(ImageHot,"")\n' +
    '            define_property(ImageNormal,"ICON_ARROW_SPIN_RIGHT")\n' +
    '            define_property(ImagePressed,"")\n' +
    '            define_property(ImageSizeType,UI::ImageSizeType::Custom)\n' +
    '            define_property(ImageTriState,"")\n' +
    '            define_property(ImageTriStateDisabled,"")\n' +
    '            define_property(ImageTriStateHot,"")\n' +
    '            define_property(ImageTriStatePressed,"")\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,68)\n' +
    '            define_property(OwnerDrawn,0)\n' +
    '            define_property(ResourceName,"kRotateCWButtonID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(ToolBarLike,1)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,13)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,22)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a CheckBox control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(CheckBox,kPreviewCheckBoxID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(CheckBox,Button,kPreviewCheckBoxID,DLGPROP_kTestDlg_1_Text,10,5,75,15,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | BS_AUTOCHECKBOX | 1342373891,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,15)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"kPreviewCheckBoxID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,5)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,75)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Checkbox text"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Checkbox Text"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-text"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a ComboBox control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(ComboBox,kPresetsComboID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(ComboBox,COMBOBOXCLASS,kPresetsComboID,"",10,12,75,20,WS_CHILD | WS_CLIPCHILDREN | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1375928320,WS_EX_CONTROLPARENT | 65536)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(CommandDelay,600)\n' +
    '            define_property(CustomUnitIndex,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,20)\n' +
    '            define_property(IncValue,1)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(MaxValue,0)\n' +
    '            define_property(MinValue,0)\n' +
    '            define_property(Precision,-1)\n' +
    '            define_property(ReadOnly,0)\n' +
    '            define_property(ResourceName,"kPresetsComboID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,12)\n' +
    '            define_property(Unit,UI::UnitType::type_AlphaNumeric)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,75)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a InkButton control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(InkButton,kColorItemID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(InkButton,InkButton,kColorItemID,"{[SolidColorsOnly=1]}Caption=""",10,12,35,22,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,22)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"kColorItemID")\n' +
    '            define_property(SolidColorsOnly,1)\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,12)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,35)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a InkButton control that has a caption', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(InkButton,kColorItemID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(InkButton,InkButton,kColorItemID,"{[SolidColorsOnly=1]}Caption="DLGPROP_kTestDlg_1_Text,10,12,35,22,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,22)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"kColorItemID")\n' +
    '            define_property(SolidColorsOnly,1)\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,12)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,35)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Test caption"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Test Text"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-caption"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a Slider control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(Slider,kTransparencySliderID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(Slider,SliderClass,kTransparencySliderID,"",10,12,75,25,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,WS_EX_CONTROLPARENT | 65568)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,25)\n' +
    '            define_property(IncFactor,1)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(Max,100)\n' +
    '            define_property(Min,0)\n' +
    '            define_property(PageIncFactor,10)\n' +
    '            define_property(ResourceName,"kTransparencySliderID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(TickMarks,UI::Slider::None)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,12)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,75)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a GrouBox control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(GroupBox,kAfterGrpID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(GroupBox,Button,kAfterGrpID,DLGPROP_kTestDlg_1_Text,10,12,75,72,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | BS_MULTILINE | BS_GROUPBOX | 1342382087,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,72)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"kAfterGrpID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,12)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,75)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Group caption"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Gruppen Text"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-group"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a MenuButton control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(MenuButton,kScaleByMenuButtonID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(MenuButton,MenuButton,kScaleByMenuButtonID,DLGPROP_kTestDlg_1_Text,110,114,147,20,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,20)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,110)\n' +
    '            define_property(ResourceName,"kScaleByMenuButtonID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,114)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,147)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Menu caption"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Menu Text"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-menu"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a RadioButton control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(RadioButton,kScaleByAreaRadioID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(RadioButton,Button,kScaleByAreaRadioID,DLGPROP_kTestDlg_1_Text,30,150,75,13,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | BS_AUTORADIOBUTTON | 1342373897,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Checked,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,13)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,30)\n' +
    '            define_property(ResourceName,"kScaleByAreaRadioID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,150)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,75)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Radio caption"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Radio Text"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-radio"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a CornerBox control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(CornerBox,kCornerBoxItemID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(CornerBox,CORNERBOX,kCornerBoxItemID,"",260,105,40,40,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,40)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,260)\n' +
    '            define_property(ResourceName,"kCornerBoxItemID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,105)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,40)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a ImageCheckBox control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(ImageCheckBox,kOrientation)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(ImageCheckBox,IMAGEBUTTON,kOrientation,"{[ImageChecked=""ICON_ARROW_SPIN_LEFT""][ImageCheckedHot=""ICON_ARROW_SPIN_LEFT""][ImageNormal=""ICON_ARROW_SPIN_RIGHT""][ToolBarLike=1]}",116,40,22,17,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373905,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,17)\n' +
    '            define_property(ImageChecked,"ICON_ARROW_SPIN_LEFT")\n' +
    '            define_property(ImageCheckedDisabled,"")\n' +
    '            define_property(ImageCheckedHot,"ICON_ARROW_SPIN_LEFT")\n' +
    '            define_property(ImageCheckedPressed,"")\n' +
    '            define_property(ImageDisabled,"")\n' +
    '            define_property(ImageHot,"")\n' +
    '            define_property(ImageNormal,"ICON_ARROW_SPIN_RIGHT")\n' +
    '            define_property(ImagePressed,"")\n' +
    '            define_property(ImageSizeType,UI::ImageSizeType::Custom)\n' +
    '            define_property(ImageTriState,"")\n' +
    '            define_property(ImageTriStateDisabled,"")\n' +
    '            define_property(ImageTriStateHot,"")\n' +
    '            define_property(ImageTriStatePressed,"")\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,116)\n' +
    '            define_property(OwnerDrawn,0)\n' +
    '            define_property(ResourceName,"kOrientation")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(ToolBarLike,1)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,40)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,22)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a ImageBox control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(ImageBox,CanvasIcon)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(ImageBox,IMAGEBOX,CanvasIcon,"{[Image=""Canvas_Image""]}",10,10,48,48,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Height,48)\n' +
    '            define_property(Image,"Canvas_Image")\n' +
    '            define_property(ImageSizeType,UI::ImageSizeType::px48)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"CanvasIcon")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,10)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,48)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a VerticalLine control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(VerticalLine,kVerticalLine1)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(VerticalLine,Static,kVerticalLine1,"",121,93,1,56,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | SS_ETCHEDVERT | 1342373905,WS_EX_STATICEDGE | 131072)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,56)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,121)\n' +
    '            define_property(ResourceName,"kVerticalLine1")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,93)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,1)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a ExpandButton control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(ExpandButton,IDD_Expand)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(ExpandButton,EXPANDBUTTON,IDD_Expand,"{[AutoExpand=16]}Caption=""",1,160,18,18,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373906,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(AutoExpand,16)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Expanded,0)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,18)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,1)\n' +
    '            define_property(ResourceName,"IDD_Expand")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,160)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,18)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a ZoomItem control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(ZoomItem,ID_ZOOM_FACTOR)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(ZoomItem,ZoomItemClass,ID_ZOOM_FACTOR,"{[IncFactor=10][MinLevel=10][MaxLevel=1000][ZoomStyle=::UIZoomInfo::kEditItemStyle][Decimals=0]}",99,128,85,20,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,WS_EX_CONTROLPARENT | 65536)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(AutoZoom,1)\n' +
    '            define_property(Decimals,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,20)\n' +
    '            define_property(IncFactor,10)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,99)\n' +
    '            define_property(MaxLevel,1000)\n' +
    '            define_property(MinLevel,10)\n' +
    '            define_property(ResourceName,"ID_ZOOM_FACTOR")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,128)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,85)\n' +
    '            define_property(ZoomStyle,::UIZoomInfo::kEditItemStyle)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a OwnerDraw control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(OwnerDraw,OwnerDrawInputPrev)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(OwnerDraw,OwnerDraw,OwnerDrawInputPrev,"{[KillPopup=0]}Caption=""",50,410,125,125,WS_CHILD | WS_CLIPCHILDREN | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1375928320,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,125)\n' +
    '            define_property(KillPopup,0)\n' +
    '            define_property(Left,50)\n' +
    '            define_property(ResourceName,"OwnerDrawInputPrev")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,410)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,125)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a PopupButton control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(PopupButton,kShapePresets)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(PopupButton,POPUPBUTTON,kShapePresets,"{[ImageNormal=""EXTRUDE_SHAPE_PRESETS""]}Caption=""",10,20,36,24,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,WS_EX_CONTROLPARENT | 65536)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Columns,5)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,24)\n' +
    '            define_property(ImageNormal,"EXTRUDE_SHAPE_PRESETS")\n' +
    '            define_property(ItemCount,0)\n' +
    '            define_property(ItemHeight,24)\n' +
    '            define_property(ItemWidth,24)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(PopPosition,::ACDSystems::UI::PopupButton::TopRight)\n' +
    '            define_property(ResourceName,"kShapePresets")\n' +
    '            define_property(Rows,2)\n' +
    '            define_property(SelectedItem,-1)\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,20)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,36)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a StrokeButton control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(StrokeButton,kObjectsStrokePopupItem)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(StrokeButton,StrokeButton,kObjectsStrokePopupItem,"",67,64,42,22,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(ApplyMode,::kARROW_NONE)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,22)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,67)\n' +
    '            define_property(ResourceName,"kObjectsStrokePopupItem")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,64)\n' +
    '            define_property(Type,::kAttributeType_SolidPen)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,42)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a HorizontalLine control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(HorizontalLine,kExpandLineID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(HorizontalLine,Static,kExpandLineID,"",2,111,213,1,WS_CHILD | WS_GROUP | WS_TABSTOP | SS_ETCHEDHORZ | 1073938448,WS_EX_STATICEDGE | 131072)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,1)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,2)\n' +
    '            define_property(ResourceName,"kExpandLineID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,111)\n' +
    '            define_property(Visible,0)\n' +
    '            define_property(Width,213)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a Toolbar control', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(Toolbar,kTOOLBAR)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(Toolbar,ToolbarWindow32,kTOOLBAR,"",10,41,32,88,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | CCS_BOTTOM | CCS_LEFT | CCS_NODIVIDER | CCS_NOPARENTALIGN | CCS_NORESIZE | TBSTYLE_FLAT | TBSTYLE_WRAPABLE | 1342376655,0)\n' +
    '            define_property(Alignment,ACDSystems::UI::ToolbarAlignment::Left)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Divider,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,88)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(MoveY,0)\n' +
    '            define_property(ParentAlign,0)\n' +
    '            define_property(Resize,0)\n' +
    '            define_property(ResourceName,"kTOOLBAR")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,"")\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,41)\n' +
    '            define_property(Visible,0)\n' +
    '            define_property(Width,32)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrings = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrings = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with a control that has a numeric id', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(Label,-1)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(Label,Static,-1,DLGPROP_kTestDlg_1_Text,10,10,280,51,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | SS_LEFT | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,51)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"-1")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(TextAlign,TextAlign::Left)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,10)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,280)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "text"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Text"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-text"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('ResourceGenerator.generateContent for dialog with multiple controls with the same resource id', done => {
  const masterDlg =
    '#include "ResourceDefines.h" // Version [1.1] //\n' +
    '\n' +
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.str"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.str"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.str"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n' +
    '\n' +
    'begin_dialog_definition_ex_(kTestDlg,"",0,0,10,20,DLGPROP_kTestDlg_0_Text,"ClassName",WS_CHILD | WS_VISIBLE | 1342177280,"",0)\n' +
    '    begin_dialog_properties()\n' +
    '        define_dialog_property(Height,20)\n' +
    '        define_dialog_property(KillPopup,1)\n' +
    '        define_dialog_property(PaddingType,DialogPaddingTypes::Default)\n' +
    '        define_dialog_property(ResourceName,"kTestDlg")\n' +
    '        define_dialog_property(Text,DLGPROP_kTestDlg_0_Text)\n' +
    '        define_dialog_property(Width,10)\n' +
    '    end_dialog_properties()\n' +
    '    declare_control(Label,kStaticTextID)\n' +
    '    declare_control(Label,kStaticTextID)\n' +
    '    declare_control(Label,kStaticTextID)\n' +
    '    begin_control_definitions()\n' +
    '        begin_control_ex(Label,Static,kStaticTextID,DLGPROP_kTestDlg_1_Text,10,10,280,20,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | SS_LEFT | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,20)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"kStaticTextID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_1_Text)\n' +
    '            define_property(TextAlign,TextAlign::Left)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,10)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,280)\n' +
    '        end_control_ex()\n' +
    '        begin_control_ex(Label,Static,kStaticTextID,DLGPROP_kTestDlg_2_Text,10,40,280,20,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | SS_LEFT | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,20)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"kStaticTextID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_2_Text)\n' +
    '            define_property(TextAlign,TextAlign::Left)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,40)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,280)\n' +
    '        end_control_ex()\n' +
    '        begin_control_ex(Label,Static,kStaticTextID,DLGPROP_kTestDlg_3_Text,10,70,280,20,WS_CHILD | WS_GROUP | WS_TABSTOP | WS_VISIBLE | SS_LEFT | 1342373888,0)\n' +
    '            define_property(AnchorBottom,0)\n' +
    '            define_property(AnchorLeft,0)\n' +
    '            define_property(AnchorRight,0)\n' +
    '            define_property(AnchorTop,0)\n' +
    '            define_property(Enabled,1)\n' +
    '            define_property(Group,1)\n' +
    '            define_property(Height,20)\n' +
    '            define_property(KillPopup,1)\n' +
    '            define_property(Left,10)\n' +
    '            define_property(ResourceName,"kStaticTextID")\n' +
    '            define_property(TabStop,1)\n' +
    '            define_property(Text,DLGPROP_kTestDlg_3_Text)\n' +
    '            define_property(TextAlign,TextAlign::Left)\n' +
    '            define_property(Tooltip,"")\n' +
    '            define_property(Top,70)\n' +
    '            define_property(Visible,1)\n' +
    '            define_property(Width,280)\n' +
    '        end_control_ex()\n' +
    '    end_control_definitions()\n' +
    'end_dialog_definition_ex_()\n' +
    '\n' +
    '#if 0\n' +
    '\n' +
    'BEGIN_LAYERS\n' +
    '    BEGIN_LAYER "MasterLayer"\n' +
    '        0\n' +
    '        1\n' +
    '        2\n' +
    '        3\n' +
    '    END_LAYER\n' +
    'END_LAYERS\n' +
    '\n' +
    '#endif\n';
  const enStrings =
    '#define DLGPROP_kTestDlg_0_Text "Title"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Label 1"\n' +
    '#define DLGPROP_kTestDlg_2_Text "Label 2"\n' +
    '#define DLGPROP_kTestDlg_3_Text "Label 3"\n';
  const deStrings =
    '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n' +
    '#define DLGPROP_kTestDlg_1_Text "Text 1"\n' +
    '#define DLGPROP_kTestDlg_2_Text "Text 2"\n' +
    '#define DLGPROP_kTestDlg_3_Text "Text 3"\n';
  const jpStrings =
    '#define DLGPROP_kTestDlg_0_Text "jp-word"\n' +
    '#define DLGPROP_kTestDlg_1_Text "jp-label 1"\n' +
    '#define DLGPROP_kTestDlg_2_Text "jp-label 2"\n' +
    '#define DLGPROP_kTestDlg_3_Text "jp-label 3"\n';
  const contentMap = new Map([
    [cred.locale.any, { dialog: masterDlg, strings: undefined }],
    [cred.locale.english, { dialog: undefined, strings: enStrings }],
    [cred.locale.german, { dialog: undefined, strings: deStrings }],
    [cred.locale.japanese, { dialog: undefined, strings: jpStrings }]
  ]);

  generateContentAsync('kTestDlg', contentMap)
    .then(generatedContentMap => {
      expect(generatedContentMap).toEqual(contentMap);
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});
