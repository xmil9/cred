//
// App-wide types and constants.
//
'use strict';

///////////////////

// Cred module.
var cred = (function() {
  ///////////////////
  // Language and locales.

  // Enum of supported languages.
  const language = {
    english: 'en',
    japanese: 'jp',
    german: 'de',

    // Makes the languages iterable.
    *[Symbol.iterator]() {
      yield this.english;
      yield this.japanese;
      yield this.german;
    }
  };
  Object.freeze(language);

  // Enum for the locale that a resource applies to.
  const locale = {
    any: 'any',
    english: language.english,
    japanese: language.japanese,
    german: language.german,

    // Makes the locales iterable.
    *[Symbol.iterator]() {
      yield this.any;
      yield this.english;
      yield this.japanese;
      yield this.german;
    }
  };
  Object.freeze(locale);

  // Returns the locale corresponding to a given language.
  function localeFromLanguage(fromLanguage) {
    switch (fromLanguage) {
      case language.english: {
        return locale.english;
      }
      case language.japanese: {
        return locale.japanese;
      }
      case language.german: {
        return locale.german;
      }
      default: {
        throw new Error('Unexpected language value.');
      }
    }
  }

  // Returns the language corresponding to a given locale.
  // Returns a given replacement for the 'any' locale.
  function languageFromLocale(fromLocale, replaceAnyWith = undefined) {
    switch (fromLocale) {
      case locale.english: {
        return language.english;
      }
      case locale.japanese: {
        return language.japanese;
      }
      case locale.german: {
        return language.german;
      }
      case locale.any: {
        return replaceAnyWith;
      }
      default: {
        throw new Error('Unexpected locale value.');
      }
    }
  }

  ///////////////////
  // Parsing

  // Enum of supported token kinds.
  const tokenKind = {
    comma: 'comma',
    binaryOr: 'or',
    openParenthesis: 'open(',
    closeParenthesis: 'close)',
    number: 'num',
    directive: 'directive',
    comment: 'comment',
    string: 'str',
    identifier: 'id',
    keyword: 'key'
  };
  Object.freeze(tokenKind);

  // Returns the humanly readable name for a given kind of token.
  function tokenKindName(kind) {
    switch (kind) {
      case tokenKind.comma: {
        return 'comma';
      }
      case tokenKind.binaryOr: {
        return 'binary-or';
      }
      case tokenKind.openParenthesis: {
        return 'opening parenthesis';
      }
      case tokenKind.closeParenthesis: {
        return 'closing parenthesis';
      }
      case tokenKind.number: {
        return 'number';
      }
      case tokenKind.directive: {
        return 'directive';
      }
      case tokenKind.comment: {
        return 'comment';
      }
      case tokenKind.string: {
        return 'string';
      }
      case tokenKind.identifier: {
        return 'identifier';
      }
      case tokenKind.keyword: {
        return 'keyword';
      }
      default: {
        return '';
      }
    }
  }

  // Label that identifies a control caption within a serialized property string.
  const serializedCaptionLabel = 'Caption=';

  ///////////////////
  // I/O

  const resourceVersion = '1.1';

  // Map that associates languages with the labels that identify
  // their files.
  const languageFileLabels = new Map([
    [language.english, 'English'],
    [language.japanese, 'Japan'],
    [language.german, 'German']
  ]);
  Object.freeze(languageFileLabels);

  // Extensions for dialog files.
  const fileExtension = {
    dialogFile: '.dlg',
    stringFile: '.str'
  };
  Object.freeze(fileExtension);

  // Returns the file name of a dialog resource file for a given dialog name and a given
  // locale.
  function dialogFileName(dialogId, locale) {
    let langLabel = '';
    const lang = languageFromLocale(locale);
    if (lang) {
      langLabel = '.' + languageFileLabels.get(lang);
    }
    return dialogId + langLabel + fileExtension.dialogFile;
  }

  // Returns the file name of a dialog string file for a given dialog name and a given
  // locale.
  function stringFileName(dialogId, language) {
    const langLabel = '.' + languageFileLabels.get(language);
    return dialogId + langLabel + fileExtension.stringFile;
  }

  ///////////////////
  // Editing

  // Bit flags for supported editing behavior.
  const editBehavior = {
    // Basic flags.
    none: 0,
    moveable: 1,
    resizableUp: 2,
    resizableLeft: 4,
    resizableDown: 8,
    resizableRight: 16,
    selectable: 32,
    // Combinations of basic flags.
    resizableFully: 30,
    all: 63
  };
  Object.freeze(editBehavior);

  // Indicates the context that a modification applies to. Global context will affect all
  // locales, local context only the current locale.
  const editContext = {
    globalDefault: 'global',
    globalOnly: 'global_only',
    localDefault: 'local',
    localOnly: 'local_only'
  };
  Object.freeze(editContext);

  ///////////////////

  // Exports
  return {
    dialogFileName: dialogFileName,
    editBehavior: editBehavior,
    editContext: editContext,
    fileExtension: fileExtension,
    language: language,
    languageFileLabels: languageFileLabels,
    languageFromLocale: languageFromLocale,
    locale: locale,
    localeFromLanguage: localeFromLanguage,
    resourceVersion: resourceVersion,
    serializedCaptionLabel: serializedCaptionLabel,
    stringFileName: stringFileName,
    tokenKind: tokenKind,
    tokenKindName: tokenKindName
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred;
