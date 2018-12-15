//
// Tests for the generator component of the dialog writer.
//
'use strict';

var cred = cred || {};
cred = require('../cred_types');
cred.io = require('../dlg_io');

///////////////////

// Makes a fake Web API File object.
function makeFileStub(fileName) {
  return {
    name: fileName
  };
}

// Make a fake Web API FileList object from a given array of file names.
function makeFileListStub(files) {
  return files;
}

///////////////////

test('FileSet constructor for full set of files', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.dlg'),
    makeFileStub('kTestDlg.German.dlg'),
    makeFileStub('kTestDlg.Japan.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet).toBeDefined();
});

test('FileSet constructor for minimal set of files', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet).toBeDefined();
});

test('FileSet constructor for set of files without master file', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.English.dlg'),
    makeFileStub('kTestDlg.German.dlg'),
    makeFileStub('kTestDlg.Japan.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  expect(() => new cred.io.FileSet(files));
});

test('FileSet.masterFile getter', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.dlg'),
    makeFileStub('kTestDlg.German.dlg'),
    makeFileStub('kTestDlg.Japan.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.masterFile).toEqual(makeFileStub('kTestDlg.dlg'));
});

test('FileSet.masterFile setter', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.dlg'),
    makeFileStub('kTestDlg.German.dlg'),
    makeFileStub('kTestDlg.Japan.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  fileSet.masterFile = makeFileStub('kOtherTestDlg.dlg');
  expect(fileSet.masterFile).toEqual(makeFileStub('kOtherTestDlg.dlg'));
});

test('FileSet.masterFile setter for undefined file', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.dlg'),
    makeFileStub('kTestDlg.German.dlg'),
    makeFileStub('kTestDlg.Japan.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(() => {
    fileSet.masterFile = undefined;
  }).toThrow();
});

test('FileSet.dialogId', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.dlg'),
    makeFileStub('kTestDlg.German.dlg'),
    makeFileStub('kTestDlg.Japan.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.dialogId).toEqual('kTestDlg');
});

test('FileSet.dialogFile', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.dlg'),
    makeFileStub('kTestDlg.German.dlg'),
    makeFileStub('kTestDlg.Japan.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.dialogFile(cred.locale.any)).toEqual(makeFileStub('kTestDlg.dlg'));
  expect(fileSet.dialogFile(cred.locale.english)).toEqual(
    makeFileStub('kTestDlg.English.dlg')
  );
  expect(fileSet.dialogFile(cred.locale.german)).toEqual(
    makeFileStub('kTestDlg.German.dlg')
  );
  expect(fileSet.dialogFile(cred.locale.japanese)).toEqual(
    makeFileStub('kTestDlg.Japan.dlg')
  );
});

test('FileSet.dialogFile', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.dlg'),
    makeFileStub('kTestDlg.German.dlg'),
    makeFileStub('kTestDlg.Japan.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.stringFile(cred.language.english)).toEqual(
    makeFileStub('kTestDlg.English.str')
  );
  expect(fileSet.stringFile(cred.language.german)).toEqual(
    makeFileStub('kTestDlg.German.str')
  );
  expect(fileSet.stringFile(cred.language.japanese)).toEqual(
    makeFileStub('kTestDlg.Japan.str')
  );
});

test('FileSet.isValid for full file set', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.dlg'),
    makeFileStub('kTestDlg.German.dlg'),
    makeFileStub('kTestDlg.Japan.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.isValid()).toBeTruthy();
});

test('FileSet.isValid for minimal file set', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.isValid()).toBeTruthy();
});

test('FileSet.isValid for missing string file', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.isValid()).toBeFalsy();
});

test('FileSet.haveAllLanguageStringFiles', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.German.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.haveAllLanguageStringFiles()).toBeTruthy();
});

test('FileSet.haveAllLanguageStringFiles for missing string file', () => {
  const files = makeFileListStub([
    makeFileStub('kTestDlg.dlg'),
    makeFileStub('kTestDlg.English.str'),
    makeFileStub('kTestDlg.Japan.str')
  ]);

  const fileSet = new cred.io.FileSet(files);
  expect(fileSet.haveAllLanguageStringFiles()).toBeFalsy();
});
