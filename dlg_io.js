//
// I/O for Canvas dialog files.
//
'use strict';

///////////////////

// Imports
// These are provided through (ordered!) script tags in the HTML file.
var cred = cred || {};
var Encoding = Encoding || {};
var filesys = filesys || {};

///////////////////

// I/O module.
cred.io = (function() {
  ///////////////////

  // Reader for cv dialog resource files.
  class Reader {
    constructor(dlgFileSet) {
      this._dlgFileSet = dlgFileSet;
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
              log = cred.resource.verifyDialog(dlgResource.dialogDefinition);
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
            let [convertedContent, resourceEncoding] = decodeFileContent(fileContent);
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
      // Wrap FileReader in promise.
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
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
      let resourceSet = new cred.resource.DialogResourceSet();
      for (let i = 0; i < readResults.length; ++i) {
        let result = readResults[i];
        // If a file does not exist, the result is 'undefined'.
        if (!result) {
          // Ignore result.
        }
        // If the result is from reading a string file, process the strings.
        else if (result.strings) {
          resourceSet.addStrings(
            result.language,
            result.strings,
            result.resourceEncoding
          );
        }
        // If the result is from reading a resource file, store the resource
        // definition based on its locale.
        // Note that reading a resource file could also produce a result where
        // the 'resource' field is undefined. This happens when the resource file
        // is only including another resource file. Ignore those results.
        else if (result.resource) {
          const resultLocale = result.resource.locale;
          resourceSet.setDlgResources(resultLocale, result.resource);
          resourceSet.setImportLog(resultLocale, result.log);
        }
      }
      // Normalize all localized string properties to hold identifiers with the string
      // text in the string map.
      resourceSet.normalizeLocalizedStrings();
      return resourceSet;
    }
  }

  ///////////////////

  // Writer for cv dialog resource files.
  class Writer {
    constructor(dlgResourceSet) {
      this._dlgResourceSet = dlgResourceSet;
      this._contentGen = new cred.gen.ResourceGenerator(dlgResourceSet);
    }

    write() {
      this._dlgResourceSet.denormalizeLocalizedStrings();

      this._writeMasterFile();
      for (const language of cred.language) {
        this._writeLanguageFiles(language);
      }

      this._dlgResourceSet.normalizeLocalizedStrings();
    }

    _writeMasterFile() {
      let fileName = this._dlgResourceSet.masterFileName;
      let content = this._contentGen.generateContent(cred.locale.any);
      this._writeFile(fileName, content);
    }

    _writeLanguageFiles(language) {
      const targetLocale = cred.localeFromLanguage(language);
      let [dlgContent, strContent] = this._contentGen.generateContent(targetLocale);

      const haveDlgContent = typeof dlgContent !== 'undefined';
      if (haveDlgContent) {
        this._writeFile(
          this._dlgResourceSet.languageDialogFileName(language),
          dlgContent
        );
      }

      const encodedStrContent = encodeText(
        strContent,
        this._dlgResourceSet.sourceStringEncoding(language)
      );
      this._writeFile(
        this._dlgResourceSet.languageStringFileName(language),
        encodedStrContent
      );
    }

    _writeFile(fileName, text) {
      filesys.saveTextFile(fileName, text, $('#save-download-link')[0]);
    }
  }

  ///////////////////

  // Encodes given text for a given encoding.
  function encodeText(text, encoding) {
    if (encoding === 'ASCII') {
      encoding = 'UTF8';
    }
    //let binary = new Uint8Array(text);
    let converted = Encoding.convert(text, {
      to: encoding,
      from: 'UNICODE',
      type: 'string'
    });
    return converted;
  }

  // Detects the encoding of given file content and converts it to JS unicode.
  // Returns the converted text and the detected encoding.
  function decodeFileContent(fileContent) {
    let binary = new Uint8Array(fileContent);
    let detectedEncoding = Encoding.detect(binary);
    let converted = Encoding.convert(binary, {
      to: 'UNICODE',
      from: detectedEncoding,
      type: 'string'
    });
    return [converted, detectedEncoding];
  }

  ///////////////////

  // Represents a set of files that make up a dialog resource.
  class FileSet {
    constructor(files) {
      // Map that associates locales with their dialog files.
      this._dlgFiles = new Map();
      // Map that associates languages with their string files.
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
      this._dlgFiles.set(cred.locale.any, value);
    }

    // Returns the name of the dialog represented by this file set.
    get dialogName() {
      if (!this.masterFile) {
        return undefined;
      }
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
        throw 'No master dialog file found in file set.';
      }
      this._populateLanguageFiles(files);
    }

    // Populates language-specific files from a given array of files.
    _populateLanguageFiles(files) {
      const dlgName = this.dialogName;

      for (const lang of cred.language) {
        this._stringFiles.set(
          lang,
          FileSet._findLanguageFile(files, cred.stringFileName(dlgName, lang))
        );
        this._dlgFiles.set(
          cred.localeFromLanguage(lang),
          FileSet._findLanguageFile(files, cred.dialogFileName(dlgName, lang))
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

  // Exports
  return {
    FileSet: FileSet,
    Reader: Reader,
    Writer: Writer
  };
})();
