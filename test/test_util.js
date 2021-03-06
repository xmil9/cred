//
// Utilities for testing.
//
'use strict';

const cred = require('../types');
cred.io = require('../io');
const crypto = require('crypto');

///////////////////

var testutil = (function() {
  ///////////////////

  // Makes a fake Web API File object.
  function makeFileStub(fileName, content = '') {
    return {
      name: fileName,
      content: content
    };
  }

  // Makes a fake Web API FileList object from a given array of file names.
  function makeFileListStub(files) {
    return files;
  }

  // Mock for Web API FileReader.
  class FileReaderMock {
    constructor() {
      this.onload = undefined;
      this.onerror = undefined;
      this.onabort = undefined;
      this.wasReadAsTextCalled = false;
      this.wasReadAsArrayBufferCalled = false;
    }

    readAsText(file) {
      this.wasReadAsTextCalled = true;
      this.onload({ target: { result: file.content } });
    }

    readAsArrayBuffer(file) {
      this.wasReadAsArrayBufferCalled = true;
      this.onload({ target: { result: file.content } });
    }
  }

  // Mock for writing text content to a file.
  class FileWriterMock {
    constructor() {
      this._filesWritten = new Map();
    }

    get writtenFiles() {
      return this._filesWritten;
    }

    writeFile(fileName, text) {
      this._filesWritten.set(fileName, text);
    }
  }

  // Makes an adapter to map node's crypto module to window.crypto functionality.
  function makeCryptoNodeAdapter() {
    return {
      getRandomValues(arr) {
        return crypto.randomBytes(arr.length);
      }
    };
  }

  // Fakes reading a dialog resource set. Instead of accessing the file system, files are
  // simulated through data structures and populated with given content.
  // Returns a promise that resolves to the dialog resource set object that is built from
  // the files.
  function readDialogResourceSetAsyncStub(dlgName, contentMap) {
    return new Promise((resolve, reject) => {
      const files = makeFileListStub([
        makeFileStub(`${dlgName}.dlg`, contentMap.get(cred.locale.any).dialog),
        makeFileStub(
          `${dlgName}.English.dlg`,
          contentMap.get(cred.locale.english).dialog
        ),
        makeFileStub(`${dlgName}.German.dlg`, contentMap.get(cred.locale.german).dialog),
        makeFileStub(`${dlgName}.Japan.dlg`, contentMap.get(cred.locale.japanese).dialog),
        makeFileStub(
          `${dlgName}.English.str`,
          contentMap.get(cred.locale.english).strings
        ),
        makeFileStub(`${dlgName}.German.str`, contentMap.get(cred.locale.german).strings),
        makeFileStub(`${dlgName}.Japan.str`, contentMap.get(cred.locale.japanese).strings)
      ]);
      const fileSet = new cred.io.FileSet(files);
      const fileReaderStub = new FileReaderMock();
      const textDecodeStub = fileContent => [fileContent, 'UTF-8'];
      const reader = new cred.io.Reader(
        fileSet,
        fileReaderStub,
        textDecodeStub,
        makeCryptoNodeAdapter()
      );
      reader
        .read()
        .then(dlgResSet => {
          resolve(dlgResSet);
        })
        .catch(err => reject(err));
    });
  }

  // Creates a dialog resource set builder object whose crypto API is redirected to use
  // node's crypto module.
  function makeDialogResourceSetBuilderForNode() {
    const builder = new cred.resource.DialogResourceSetBuilder();
    builder.setCrypto(testutil.makeCryptoNodeAdapter());
    return builder;
  }

  ///////////////////

  // Exports for testutil module.
  return {
    FileReaderMock: FileReaderMock,
    FileWriterMock: FileWriterMock,
    makeCryptoNodeAdapter: makeCryptoNodeAdapter,
    makeDialogResourceSetBuilderForNode: makeDialogResourceSetBuilderForNode,
    makeFileListStub: makeFileListStub,
    makeFileStub: makeFileStub,
    readDialogResourceSetAsyncStub: readDialogResourceSetAsyncStub
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = testutil;
