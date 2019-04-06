//
// Tests for the generator component of the dialog writer.
//
'use strict';

var cred = cred || {};
cred = require('../types');
cred.io = require('../io');
cred.resource = require('../resource');
const testutil = require('./test_util');

///////////////////

test('FileSet constructor for full set of files', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.dlg'),
    testutil.makeFileStub('kTestDlg.German.dlg'),
    testutil.makeFileStub('kTestDlg.Japan.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet).toBeDefined();
});

test('FileSet constructor for minimal set of files', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet).toBeDefined();
});

test('FileSet constructor for set of files without master file', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.English.dlg'),
    testutil.makeFileStub('kTestDlg.German.dlg'),
    testutil.makeFileStub('kTestDlg.Japan.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  expect(() => new cred.io.FileSet(files));
});

test('FileSet.masterFile getter', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.dlg'),
    testutil.makeFileStub('kTestDlg.German.dlg'),
    testutil.makeFileStub('kTestDlg.Japan.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.masterFile).toEqual(testutil.makeFileStub('kTestDlg.dlg'));
});

test('FileSet.masterFile setter', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.dlg'),
    testutil.makeFileStub('kTestDlg.German.dlg'),
    testutil.makeFileStub('kTestDlg.Japan.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  fileSet.masterFile = testutil.makeFileStub('kOtherTestDlg.dlg');
  expect(fileSet.masterFile).toEqual(testutil.makeFileStub('kOtherTestDlg.dlg'));
});

test('FileSet.masterFile setter for undefined file', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.dlg'),
    testutil.makeFileStub('kTestDlg.German.dlg'),
    testutil.makeFileStub('kTestDlg.Japan.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(() => {
    fileSet.masterFile = undefined;
  }).toThrow();
});

test('FileSet.dialogId', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.dlg'),
    testutil.makeFileStub('kTestDlg.German.dlg'),
    testutil.makeFileStub('kTestDlg.Japan.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.dialogId).toEqual('kTestDlg');
});

test('FileSet.dialogFile', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.dlg'),
    testutil.makeFileStub('kTestDlg.German.dlg'),
    testutil.makeFileStub('kTestDlg.Japan.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.dialogFile(cred.locale.any)).toEqual(
    testutil.makeFileStub('kTestDlg.dlg')
  );
  expect(fileSet.dialogFile(cred.locale.english)).toEqual(
    testutil.makeFileStub('kTestDlg.English.dlg')
  );
  expect(fileSet.dialogFile(cred.locale.german)).toEqual(
    testutil.makeFileStub('kTestDlg.German.dlg')
  );
  expect(fileSet.dialogFile(cred.locale.japanese)).toEqual(
    testutil.makeFileStub('kTestDlg.Japan.dlg')
  );
});

test('FileSet.dialogFile', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.dlg'),
    testutil.makeFileStub('kTestDlg.German.dlg'),
    testutil.makeFileStub('kTestDlg.Japan.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.stringFile(cred.language.english)).toEqual(
    testutil.makeFileStub('kTestDlg.English.str')
  );
  expect(fileSet.stringFile(cred.language.german)).toEqual(
    testutil.makeFileStub('kTestDlg.German.str')
  );
  expect(fileSet.stringFile(cred.language.japanese)).toEqual(
    testutil.makeFileStub('kTestDlg.Japan.str')
  );
});

test('FileSet.isValid for full file set', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.dlg'),
    testutil.makeFileStub('kTestDlg.German.dlg'),
    testutil.makeFileStub('kTestDlg.Japan.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.isValid()).toBeTruthy();
});

test('FileSet.isValid for minimal file set', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.isValid()).toBeTruthy();
});

test('FileSet.isValid for missing string file', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.isValid()).toBeFalsy();
});

test('FileSet.haveAllLanguageStringFiles', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.German.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.haveAllLanguageStringFiles()).toBeTruthy();
});

test('FileSet.haveAllLanguageStringFiles for missing string file', () => {
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg'),
    testutil.makeFileStub('kTestDlg.English.str'),
    testutil.makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.haveAllLanguageStringFiles()).toBeFalsy();
});

///////////////////

test('Reader for dialog with linked languages', () => {
  const masterContent =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kTestDlg.English.str"                                          ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kTestDlg.German.str"                                           ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kTestDlg.Japan.str"                                            ' +
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
  const enStrContent = '#define	strId	"Title"';
  const deStrContent = '#define	strId	"Ueberschrift"';
  const jpStrContent = '#define	strId	"jp-word"';
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg', masterContent),
    testutil.makeFileStub('kTestDlg.English.str', enStrContent),
    testutil.makeFileStub('kTestDlg.German.str', deStrContent),
    testutil.makeFileStub('kTestDlg.Japan.str', jpStrContent)
  ]);
  const fileSet = new cred.io.FileSet(files);
  const fileReaderMock = new testutil.FileReaderMock();
  const textDecodeStub = jest.fn(fileContent => [fileContent, 'UTF-8']);
  const reader = new cred.io.Reader(
    fileSet,
    fileReaderMock,
    textDecodeStub,
    testutil.makeCryptoNodeAdapter()
  );
  reader
    .read()
    .then(dlgResSet => {
      expect(dlgResSet).toBeDefined();
      expect(fileReaderMock.wasReadAsTextCalled).toBeTruthy();
      expect(fileReaderMock.wasReadAsArrayBufferCalled).toBeTruthy();
      expect(textDecodeStub).toBeCalled();
      expect(
        dlgResSet
          .dialogResource(cred.locale.any)
          .dialogPropertyValue(cred.spec.propertyLabel.width)
      ).toEqual(10);
      expect(Array.from(dlgResSet.languageStrings(cred.language.english))[0][1]).toEqual(
        'Title'
      );
      expect(Array.from(dlgResSet.languageStrings(cred.language.german))[0][1]).toEqual(
        'Ueberschrift'
      );
      expect(Array.from(dlgResSet.languageStrings(cred.language.japanese))[0][1]).toEqual(
        'jp-word'
      );
    })
    .catch(err => {
      throw new Error('Test failed. Unexpected error: ' + err);
    });
});

test('Reader for dialog with unlinked languages', () => {
  const masterContent =
    '#ifdef RES_US                                                              ' +
    '  #include "kSymbolConvert.English.dlg"                                    ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kSymbolConvert.German.dlg"                                     ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kSymbolConvert.Japan.dlg"                                      ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ';
  const enContent =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kTestDlg.English.str"                                          ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kTestDlg.German.str"                                           ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kTestDlg.Japan.str"                                            ' +
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
  const deContent =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kTestDlg.English.str"                                          ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kTestDlg.German.str"                                           ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kTestDlg.Japan.str"                                            ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,20,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';
  const jpContent =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kTestDlg.English.str"                                          ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kTestDlg.German.str"                                           ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kTestDlg.Japan.str"                                            ' +
    '#else                                                                      ' +
    '  #error "Translation"                                                     ' +
    '#endif                                                                     ' +
    'begin_dialog_definition_ex_(dlgId,"",0,0,30,20,strId,"className",0,"",0)   ' +
    '  begin_dialog_properties()                                                ' +
    '  end_dialog_properties()                                                  ' +
    '  begin_control_definitions()                                              ' +
    '  end_control_definitions()                                                ' +
    'end_dialog_definition_ex_()                                                ' +
    '#if 0                                                                      ' +
    'BEGIN_LAYERS                                                               ' +
    'END_LAYERS                                                                 ' +
    '#endif                                                                     ';
  const enStrContent = '#define	strId	"Title"';
  const deStrContent = '#define	strId	"Ueberschrift"';
  const jpStrContent = '#define	strId	"jp-word"';
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg', masterContent),
    testutil.makeFileStub('kTestDlg.English.dlg', enContent),
    testutil.makeFileStub('kTestDlg.German.dlg', deContent),
    testutil.makeFileStub('kTestDlg.Japan.dlg', jpContent),
    testutil.makeFileStub('kTestDlg.English.str', enStrContent),
    testutil.makeFileStub('kTestDlg.German.str', deStrContent),
    testutil.makeFileStub('kTestDlg.Japan.str', jpStrContent)
  ]);
  const fileSet = new cred.io.FileSet(files);
  const fileReaderMock = new testutil.FileReaderMock();
  const textDecodeStub = jest.fn(fileContent => [fileContent, 'UTF-8']);
  const reader = new cred.io.Reader(
    fileSet,
    fileReaderMock,
    textDecodeStub,
    testutil.makeCryptoNodeAdapter()
  );
  reader
    .read()
    .then(dlgResSet => {
      expect(dlgResSet).toBeDefined();
      expect(fileReaderMock.wasReadAsTextCalled).toBeTruthy();
      expect(fileReaderMock.wasReadAsArrayBufferCalled).toBeTruthy();
      expect(textDecodeStub).toBeCalled();
      expect(dlgResSet.dialogResource(cred.locale.any)).toBeUndefined();
      expect(
        dlgResSet
          .dialogResource(cred.locale.english)
          .dialogPropertyValue(cred.spec.propertyLabel.width)
      ).toEqual(10);
      expect(
        dlgResSet
          .dialogResource(cred.locale.german)
          .dialogPropertyValue(cred.spec.propertyLabel.width)
      ).toEqual(20);
      expect(
        dlgResSet
          .dialogResource(cred.locale.japanese)
          .dialogPropertyValue(cred.spec.propertyLabel.width)
      ).toEqual(30);
      expect(Array.from(dlgResSet.languageStrings(cred.language.english))[0][1]).toEqual(
        'Title'
      );
      expect(Array.from(dlgResSet.languageStrings(cred.language.german))[0][1]).toEqual(
        'Ueberschrift'
      );
      expect(Array.from(dlgResSet.languageStrings(cred.language.japanese))[0][1]).toEqual(
        'jp-word'
      );
    })
    .catch(err => {
      throw new Error('Test failed. Unexpected error: ' + err);
    });
});

test('Reader for invalid dialog', () => {
  const masterContent =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    //'#ifdef RES_US                                                              ' +
    '  #include "kTestDlg.English.str"                                          ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kTestDlg.German.str"                                           ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kTestDlg.Japan.str"                                            ' +
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
  const enStrContent = '#define	strId	"Title"';
  const deStrContent = '#define	strId	"Ueberschrift"';
  const jpStrContent = '#define	strId	"jp-word"';
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg', masterContent),
    testutil.makeFileStub('kTestDlg.English.str', enStrContent),
    testutil.makeFileStub('kTestDlg.German.str', deStrContent),
    testutil.makeFileStub('kTestDlg.Japan.str', jpStrContent)
  ]);
  const fileSet = new cred.io.FileSet(files);
  const fileReaderMock = new testutil.FileReaderMock();
  const textDecodeStub = jest.fn(fileContent => [fileContent, 'UTF-8']);
  const reader = new cred.io.Reader(
    fileSet,
    fileReaderMock,
    textDecodeStub,
    testutil.makeCryptoNodeAdapter()
  );
  reader
    .read()
    .then((/*dlgResSet*/) => {
      // Should not get here.
      expect(true).toBeFalsy();
    })
    .catch(err => {
      expect(err).toBeDefined();
    });
});

test('Reader for dialog with invalid string file', () => {
  const masterContent =
    '#include "ResourceDefines.h" // Version [1.1] //\n                         ' +
    '#ifdef RES_US                                                              ' +
    '  #include "kTestDlg.English.str"                                          ' +
    '#elif defined RES_GERMAN                                                   ' +
    '  #include "kTestDlg.German.str"                                           ' +
    '#elif defined RES_JAPAN                                                    ' +
    '  #include "kTestDlg.Japan.str"                                            ' +
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
  const enStrContent = '#define	strId	"Title"';
  const deStrContent = 'invalid';
  const jpStrContent = '#define	strId	"jp-word"';
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg', masterContent),
    testutil.makeFileStub('kTestDlg.English.str', enStrContent),
    testutil.makeFileStub('kTestDlg.German.str', deStrContent),
    testutil.makeFileStub('kTestDlg.Japan.str', jpStrContent)
  ]);
  const fileSet = new cred.io.FileSet(files);
  const fileReaderMock = new testutil.FileReaderMock();
  const textDecodeStub = jest.fn(fileContent => [fileContent, 'UTF-8']);
  const reader = new cred.io.Reader(
    fileSet,
    fileReaderMock,
    textDecodeStub,
    testutil.makeCryptoNodeAdapter()
  );
  reader
    .read()
    .then((/*dlgResSet*/) => {
      // Should not get here.
      expect(true).toBeFalsy();
    })
    .catch(err => {
      expect(err).toBeDefined();
    });
});

///////////////////

// Helper function that takes a file list (as file list stub object) and processes
// the content into a dialog resource set.
// Returns a promise resolving to the dialog resource set.
function makeDialogResourceSetFromFileListStubAsync(fileListStub) {
  return new Promise((resolve, reject) => {
    const fileSet = new cred.io.FileSet(fileListStub);
    const fileReaderMock = new testutil.FileReaderMock();
    const textDecodeStub = jest.fn(fileContent => [fileContent, 'UTF-8']);
    const reader = new cred.io.Reader(
      fileSet,
      fileReaderMock,
      textDecodeStub,
      testutil.makeCryptoNodeAdapter()
    );
    reader
      .read()
      .then(dlgResSet => resolve(dlgResSet))
      .catch(err => reject(err));
  });
}

test('Writer for dialog with linked languages', done => {
  const masterContent =
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
  const enStrContent = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrContent = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrContent = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg', masterContent),
    testutil.makeFileStub('kTestDlg.English.str', enStrContent),
    testutil.makeFileStub('kTestDlg.German.str', deStrContent),
    testutil.makeFileStub('kTestDlg.Japan.str', jpStrContent)
  ]);

  makeDialogResourceSetFromFileListStubAsync(files)
    .then(dlgResSet => {
      const fileWriterMock = new testutil.FileWriterMock();
      const textEncodeStub = jest.fn(text => text);
      const writer = new cred.io.Writer(
        dlgResSet,
        (fileName, text) => fileWriterMock.writeFile(fileName, text),
        textEncodeStub
      );
      writer.write();

      expect(fileWriterMock.writtenFiles.size).toEqual(4);
      expect(fileWriterMock.writtenFiles.has('kTestDlg.dlg')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.English.str')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.German.str')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.Japan.str')).toBeTruthy();
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('Writer for dialog with linked and unlinked languages', done => {
  const masterContent =
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
  const enContent = '#include "kTestDlg.dlg"\n';
  const deContent =
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
  const jpContent = '#include "kTestDlg.dlg"\n';
  const enStrContent = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrContent = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrContent = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg', masterContent),
    testutil.makeFileStub('kTestDlg.English.dlg', enContent),
    testutil.makeFileStub('kTestDlg.German.dlg', deContent),
    testutil.makeFileStub('kTestDlg.Japane.dlg', jpContent),
    testutil.makeFileStub('kTestDlg.English.str', enStrContent),
    testutil.makeFileStub('kTestDlg.German.str', deStrContent),
    testutil.makeFileStub('kTestDlg.Japan.str', jpStrContent)
  ]);

  makeDialogResourceSetFromFileListStubAsync(files)
    .then(dlgResSet => {
      const fileWriterMock = new testutil.FileWriterMock();
      const textEncodeStub = jest.fn(text => text);
      const writer = new cred.io.Writer(
        dlgResSet,
        (fileName, text) => fileWriterMock.writeFile(fileName, text),
        textEncodeStub
      );
      writer.write();

      expect(fileWriterMock.writtenFiles.size).toEqual(7);
      expect(fileWriterMock.writtenFiles.has('kTestDlg.dlg')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.English.dlg')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.German.dlg')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.Japan.dlg')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.English.str')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.German.str')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.Japan.str')).toBeTruthy();
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});

test('Writer for dialog with unlinked languages', done => {
  const masterContent =
    '#ifdef RES_US\n' +
    '    #include "kTestDlg.English.dlg"\n' +
    '#elif defined RES_GERMAN\n' +
    '    #include "kTestDlg.German.dlg"\n' +
    '#elif defined RES_JAPAN\n' +
    '    #include "kTestDlg.Japan.dlg"\n' +
    '#else\n' +
    '    #error "Translation"\n' +
    '#endif\n';
  const enContent =
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
  const deContent =
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
  const jpContent =
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
  const enStrContent = '#define DLGPROP_kTestDlg_0_Text "Title"\n';
  const deStrContent = '#define DLGPROP_kTestDlg_0_Text "Ueberschrift"\n';
  const jpStrContent = '#define DLGPROP_kTestDlg_0_Text "jp-word"\n';
  const files = testutil.makeFileListStub([
    testutil.makeFileStub('kTestDlg.dlg', masterContent),
    testutil.makeFileStub('kTestDlg.English.dlg', enContent),
    testutil.makeFileStub('kTestDlg.German.dlg', deContent),
    testutil.makeFileStub('kTestDlg.Japan.dlg', jpContent),
    testutil.makeFileStub('kTestDlg.English.str', enStrContent),
    testutil.makeFileStub('kTestDlg.German.str', deStrContent),
    testutil.makeFileStub('kTestDlg.Japan.str', jpStrContent)
  ]);

  makeDialogResourceSetFromFileListStubAsync(files)
    .then(dlgResSet => {
      const fileWriterMock = new testutil.FileWriterMock();
      const textEncodeStub = jest.fn(text => text);
      const writer = new cred.io.Writer(
        dlgResSet,
        (fileName, text) => fileWriterMock.writeFile(fileName, text),
        textEncodeStub
      );
      writer.write();

      expect(fileWriterMock.writtenFiles.size).toEqual(7);
      expect(fileWriterMock.writtenFiles.has('kTestDlg.dlg')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.English.dlg')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.German.dlg')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.Japan.dlg')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.English.str')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.German.str')).toBeTruthy();
      expect(fileWriterMock.writtenFiles.has('kTestDlg.Japan.str')).toBeTruthy();
      done();
    })
    .catch(err => {
      // Will fail.
      expect(err).toBeUndefined();
    });
});
