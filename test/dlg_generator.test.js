//
// Tests for the generator component of the dialog writer.
//
'use strict';

var cred = cred || {};
cred = require('../cred_types');
cred.gen = require('../dlg_generator');
const testutil = require('./test_util');

///////////////////

// Generates the content for all locales for given input data. The input date
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