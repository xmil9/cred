//
// I/O for Canvas dialog files.
//
'use strict';

///////////////////

// Attempts to require a given file. Returns undefined if 'require' is not available.
// Helps to use the calling js file in both node.js and browser environments. In a
// node.js environment the passed dependency will be loaded through the require
// mechanism. In a browser environment this function will return undefined and the
// dependency has to be loaded through a script tag.
function tryRequire(file) {
  return typeof require !== 'undefined' ? require(file) : undefined;
}

// Dependencies
var cred = tryRequire('./cred_types') || cred || {};
cred.lexer = tryRequire('./dlg_lexer') || cred.lexer || {};
cred.parser = tryRequire('./dlg_parser') || cred.parser || {};
cred.gen = tryRequire('./dlg_generator') || cred.gen || {};
cred.resource = tryRequire('./dlg_resource') || cred.resource || {};
// Acquire Encoding library and make it accessible as 'encoding' for naming consistency.
var Encoding = tryRequire('./encoding.min.js') || Encoding || {};
var encoding = Encoding;

///////////////////

// I/O module.
cred.io = (function() {
  ///////////////////

  // Represents a set of files that make up a dialog resource.
  class FileSet {
    // Takes a Web API FileList object.
    constructor(files) {
      // Map that associates locales with their dialog files. Each file is a Web API
      // File object.
      this._dlgFiles = new Map();
      // Map that associates languages with their string files. Each file is a Web API
      // File object.
      this._stringFiles = new Map();

      this._populate(files);
    }

    // Returns the master .dlg file of the set. Returns 'undefined' if
    // the file does not exist (which means the set is invalid).
    get masterFile() {
      return this._dlgFiles.get(cred.locale.any);
    }

    // Sets the master file of the set.
    set masterFile(value) {
      if (!value) {
        throw new Error('Master file cannot be null or empty.');
      }
      this._dlgFiles.set(cred.locale.any, value);
    }

    // Returns the id of the dialog represented by this file set.
    get dialogId() {
      let fileName = this.masterFile.name;
      return fileName.substring(0, fileName.length - 4);
    }

    // Returns a locale-specific .dlg file. Returns 'undefined' if
    // the file does not exist.
    dialogFile(locale) {
      return this._dlgFiles.get(locale);
    }

    // Returns a language-specific string file. Returns 'undefined'
    // if the file does not exist (which means the set is invalid).
    stringFile(language) {
      return this._stringFiles.get(language);
    }

    // Checks if the set is valid.
    isValid() {
      return !!this.masterFile && this.haveAllLanguageStringFiles();
    }

    // Checks if all language-specific string files are available.
    haveAllLanguageStringFiles() {
      return (
        this.stringFile(cred.language.english) &&
        this.stringFile(cred.language.japanese) &&
        this.stringFile(cred.language.german)
      );
    }

    // Populates this object with an array of files. The files that belong together
    // to define a dialog are identified and stored.
    _populate(files) {
      this.masterFile = FileSet._findMasterFile(files);
      if (!this.masterFile) {
        throw new Error('No master dialog file found in file set.');
      }
      this._populateLanguageFiles(files);
    }

    // Populates language-specific files from a given array of files.
    _populateLanguageFiles(files) {
      const dlgid = this.dialogId;

      for (const lang of cred.language) {
        this._stringFiles.set(
          lang,
          FileSet._findLanguageFile(files, cred.stringFileName(dlgid, lang))
        );
        this._dlgFiles.set(
          cred.localeFromLanguage(lang),
          FileSet._findLanguageFile(files, cred.dialogFileName(dlgid, lang))
        );
      }
    }

    // Finds the master dialog file in an array of files.
    // Returns the master file or 'undefined', if not found.
    static _findMasterFile(files) {
      // Use the first encountered file that has a .dlg extension and no language
      // id in its name.
      for (let i = 0; i < files.length; ++i) {
        let fileName = files[i].name;
        const numPeriods = (fileName.match(/\./g) || []).length;
        if (numPeriods == 1 && fileName.endsWith(cred.fileExtension.dialogFile)) {
          return files[i];
        }
      }
      return undefined;
    }

    // Finds a language-specific file for a given dialog in an array of files.
    // Returns the file object or 'undefined'.
    static _findLanguageFile(files, fileName) {
      for (let i = 0; i < files.length; ++i) {
        if (files[i].name === fileName) {
          return files[i];
        }
      }
      return undefined;
    }
  }

  ///////////////////

  // Reader for cv dialog resource files.
  class Reader {
    constructor(
      // cred.io.FileSet object holding the dialog files to read.
      dlgFileSet,
      // Allow to inject file reader object to read individual files.
      fileReader = undefined,
      // Allow to inject function to decode text, e.g. from Shift-JIS.
      decodeText = decodeFileContent,
      // Allow to inject crypto API.
      crypto = window.crypto
    ) {
      this._dlgFileSet = dlgFileSet;
      this._fileReader = fileReader;
      this._decodeText = decodeText;
      this._crypto = crypto;
    }

    // Starts processing the files in the dialog file set.
    // Returns a dialog resource set.
    read() {
      let self = this;
      return new Promise((resolve, reject) => {
        // Start read operations for all files and wait for them to finish.
        Promise.all(self._readDialogSetFiles())
          .then(readResults => {
            const resourceSet = self._buildDialogResourceSet(readResults);
            resolve(resourceSet);
          })
          .catch(err => reject(err));
      });
    }

    // Initiates the read operations for all files that are part of the dialog
    // set.
    // Returns an array with promises for each operation.
    _readDialogSetFiles() {
      let readPromises = [];
      // Initiate reading the locale-specific files.
      for (const locale of cred.locale) {
        const lang = cred.languageFromLocale(locale);
        // If a file does not exist, 'undefined' is added to the array.
        // Non-promise objects in the array passed to Promise.all() will be
        // copied directly into the result array of Promise.all().
        readPromises.push(this._readDialogFile(locale));
        if (lang) {
          readPromises.push(this._readStringFile(lang));
        }
      }
      return readPromises;
    }

    // Reads and parses the dialog file for a given locale asynchronously.
    // Returns a promise that receives a dialog resource object representing
    // the dialog defined by the file.
    _readDialogFile(locale) {
      let dlgFile = this._dlgFileSet.dialogFile(locale);
      if (!dlgFile) {
        return undefined;
      }

      let self = this;
      return new Promise((resolve, reject) => {
        // Read the selected file into memory.
        self
          ._readFile(dlgFile)
          // Parse and verify its contents.
          .then(fileContent => {
            let dlgResource = cred.parser.parseDialog(
              cred.lexer.analyse(fileContent),
              locale
            );
            let log = undefined;
            if (dlgResource) {
              log = cred.resource.verifyDialog(dlgResource.dialog);
            }
            resolve({
              resource: dlgResource,
              log: log
            });
          })
          .catch(err => reject(err));
      });
    }

    // Reads and parses the string file for a given language asynchronously.
    // Returns a promise that receives an object with a 'strings' property whose
    // value is a StringMap read from the file.
    _readStringFile(language) {
      let strFile = this._dlgFileSet.stringFile(language);
      if (!strFile) {
        return undefined;
      }

      let self = this;
      return new Promise((resolve, reject) => {
        // Read the selected file into memory.
        self
          ._readFile(strFile, false)
          // Parse its contents.
          .then(fileContent => {
            let [convertedContent, resourceEncoding] = self._decodeText(fileContent);
            let stringMap = cred.parser.parseStrings(
              cred.lexer.analyse(convertedContent),
              language
            );
            resolve({
              language: language,
              strings: stringMap,
              resourceEncoding: resourceEncoding
            });
          })
          .catch(err => reject(err));
      });
    }

    // Reads a given file asynchronously.
    // Returns a promise that receives the file's content.
    _readFile(file, asText = true) {
      let self = this;
      // Wrap FileReader in promise.
      return new Promise((resolve, reject) => {
        // If available use supplied file reader, otherwise instantiate one.
        let reader = self._fileReader;
        if (typeof reader === 'undefined') {
          reader = new FileReader();
        }
        // Set up callbacks.
        reader.onload = event => {
          let content = event.target.result;
          resolve(content);
        };
        reader.onerror = () => {
          reject('Error loading file.');
        };
        reader.onabort = () => {
          reject('File loading aborted.');
        };
        // Start reading.
        if (asText) {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      });
    }

    // Builds a dialog resource set from the results of reading the individual
    // dialog files.
    _buildDialogResourceSet(readResults) {
      const builder = new cred.resource.DialogResourceSetBuilder();
      builder.setCrypto(this._crypto);

      for (let i = 0; i < readResults.length; ++i) {
        let result = readResults[i];
        // If a file does not exist, the result is 'undefined'.
        if (!result) {
          // Ignore result.
        }
        // If the result is from reading a string file, process the strings.
        else if (result.strings) {
          builder.addStrings(result.language, result.strings, result.resourceEncoding);
        }
        // If the result is from reading a resource file, store the resource
        // definition based on its locale.
        // Note that reading a resource file could also produce a result where
        // the 'resource' field is undefined. This happens when the resource file
        // is only including another resource file. Ignore those results.
        else if (result.resource) {
          builder.addResource(result.resource, result.log);
        }
      }

      const resSet = builder.build();
      // Normalize all localized string properties to hold identifiers with the string
      // text in the string map.
      resSet.normalizeLocalizedStrings();
      return resSet;
    }
  }

  ///////////////////

  // Writer for cv dialog resource files.
  class Writer {
    constructor(
      dlgResourceSet,
      // Allow to inject a function to write a text file. Will be passed two arguments,
      // the file name and the text content.
      writeTextFile,
      // Allow to inject function to encode text, e.g. to Shift-JIS.
      encode = encodeText
    ) {
      this._dlgResourceSet = dlgResourceSet;
      this._contentGen = new cred.gen.ResourceGenerator(dlgResourceSet);
      this._writeTextFile = writeTextFile;
      this._encodeText = encode;
    }

    // Starts the write process.
    write() {
      this._dlgResourceSet.denormalizeLocalizedStrings();

      this._writeMasterFile();
      for (const language of cred.language) {
        this._writeLanguageFiles(language);
      }

      this._dlgResourceSet.normalizeLocalizedStrings();
    }

    // Writes the master dialog file.
    _writeMasterFile() {
      let fileName = this._dlgResourceSet.masterFileName;
      let content = this._contentGen.generateContent(cred.locale.any);
      this._writeTextFile(fileName, content);
    }

    // Writes the dialog and string files of a given language.
    _writeLanguageFiles(language) {
      const targetLocale = cred.localeFromLanguage(language);
      let [dlgContent, strContent] = this._contentGen.generateContent(targetLocale);

      const haveDlgContent = typeof dlgContent !== 'undefined';
      if (haveDlgContent) {
        this._writeTextFile(
          this._dlgResourceSet.languageDialogFileName(language),
          dlgContent
        );
      }

      const encodedStrContent = this._encodeText(
        strContent,
        this._dlgResourceSet.sourceStringEncoding(language)
      );
      this._writeTextFile(
        this._dlgResourceSet.languageStringFileName(language),
        encodedStrContent
      );
    }
  }

  ///////////////////

  // Encodes given text for a given encoding.
  function encodeText(text, targetEncoding) {
    if (targetEncoding === 'ASCII') {
      targetEncoding = 'UTF8';
    }
    //let binary = new Uint8Array(text);
    let converted = encoding.convert(text, {
      to: targetEncoding,
      from: 'UNICODE',
      type: 'string'
    });
    return converted;
  }

  // Detects the encoding of given file content and converts it to JS unicode.
  // Returns the converted text and the detected encoding.
  function decodeFileContent(fileContent) {
    let binary = new Uint8Array(fileContent);
    let detectedEncoding = encoding.detect(binary);
    let converted = encoding.convert(binary, {
      to: 'UNICODE',
      from: detectedEncoding,
      type: 'string'
    });
    return [converted, detectedEncoding];
  }

  ///////////////////

  // Exports
  return {
    FileSet: FileSet,
    Reader: Reader,
    Writer: Writer
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.io;
