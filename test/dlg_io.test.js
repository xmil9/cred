//
// Tests for the generator component of the dialog writer.
//
'use strict';

var cred = cred || {};
cred = require('../cred_types');
cred.io = require('../dlg_io');
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
  const textDecodeMock = jest.fn(fileContent => [fileContent, 'UTF-8']);
  const reader = new cred.io.Reader(
    fileSet,
    fileReaderMock,
    textDecodeMock,
    testutil.makeCryptoNodeAdapter()
  );
  reader
    .read()
    .then(dlgResSet => {
      expect(dlgResSet).toBeDefined();
      expect(fileReaderMock.wasReadAsTextCalled).toBeTruthy();
      expect(fileReaderMock.wasReadAsArrayBufferCalled).toBeTruthy();
      expect(textDecodeMock).toBeCalled();
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
  const textDecodeMock = jest.fn(fileContent => [fileContent, 'UTF-8']);
  const reader = new cred.io.Reader(
    fileSet,
    fileReaderMock,
    textDecodeMock,
    testutil.makeCryptoNodeAdapter()
  );
  reader
    .read()
    .then(dlgResSet => {
      expect(dlgResSet).toBeDefined();
      expect(fileReaderMock.wasReadAsTextCalled).toBeTruthy();
      expect(fileReaderMock.wasReadAsArrayBufferCalled).toBeTruthy();
      expect(textDecodeMock).toBeCalled();
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
  const textDecodeMock = jest.fn(fileContent => [fileContent, 'UTF-8']);
  const reader = new cred.io.Reader(
    fileSet,
    fileReaderMock,
    textDecodeMock,
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
  const textDecodeMock = jest.fn(fileContent => [fileContent, 'UTF-8']);
  const reader = new cred.io.Reader(
    fileSet,
    fileReaderMock,
    textDecodeMock,
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
