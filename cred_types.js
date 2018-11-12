//
// App-wide types and constants.
//
'use strict';

///////////////////

// Namespace
var cred = cred || {};

///////////////////
// Language and locales.

// Enum of supported languages.
cred.language = {
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
Object.freeze(cred.language);

// Enum for the locale that a resource applies to.
cred.locale = {
  any: 'any',
  english: cred.language.english,
  japanese: cred.language.japanese,
  german: cred.language.german,

  // Makes the locales iterable.
  *[Symbol.iterator]() {
    yield this.any;
    yield this.english;
    yield this.japanese;
    yield this.german;
  }
};
Object.freeze(cred.locale);

// Returns the locale corresponding to a given language.
cred.localeFromLanguage = function(language) {
  switch (language) {
    case cred.language.english: {
      return cred.locale.english;
    }
    case cred.language.japanese: {
      return cred.locale.japanese;
    }
    case cred.language.german: {
      return cred.locale.german;
    }
    default: {
      throw new Error('Unexpected language value.');
    }
  }
};

// Returns the language corresponding to a given locale.
// Returns a given replacement for the 'any' locale.
cred.languageFromLocale = function(locale, replaceAnyWith = undefined) {
  switch (locale) {
    case cred.locale.english: {
      return cred.language.english;
    }
    case cred.locale.japanese: {
      return cred.language.japanese;
    }
    case cred.locale.german: {
      return cred.language.german;
    }
    case cred.locale.any: {
      return replaceAnyWith;
    }
    default: {
      throw new Error('Unexpected locale value.');
    }
  }
};

///////////////////
// Tokens

// Enum of supported token kinds.
cred.tokenKind = {
  comma: 'comma',
  logicalOr: 'or',
  openParenthesis: 'open(',
  closeParenthesis: 'close)',
  number: 'num',
  directive: 'directive',
  comment: 'comment',
  string: 'str',
  identifier: 'id',
  keyword: 'key'
};
Object.freeze(cred.tokenKind);

// Returns the humanly readable name for a given kind of token.
cred.tokenKindName = function(kind) {
  switch (kind) {
    case cred.tokenKind.comma: {
      return 'comma';
    }
    case cred.tokenKind.logicalOr: {
      return 'logical-or';
    }
    case cred.tokenKind.openParenthesis: {
      return 'opening parenthesis';
    }
    case cred.tokenKind.closeParenthesis: {
      return 'closing parenthesis';
    }
    case cred.tokenKind.number: {
      return 'number';
    }
    case cred.tokenKind.directive: {
      return 'directive';
    }
    case cred.tokenKind.comment: {
      return 'comment';
    }
    case cred.tokenKind.string: {
      return 'string';
    }
    case cred.tokenKind.identifier: {
      return 'identifier';
    }
    case cred.tokenKind.keyword: {
      return 'keyword';
    }
    default: {
      return '';
    }
  }
};

///////////////////
// I/O

cred.resourceVersion = '1.1';

// Map that associates languages with the labels that identify
// their files.
cred.languageFileLabels = new Map([
  [cred.language.english, 'English'],
  [cred.language.japanese, 'Japan'],
  [cred.language.german, 'German']
]);
Object.freeze(cred.languageFileLabels);

// Extensions for dialog files.
cred.fileExtension = {
  dialogFile: '.dlg',
  stringFile: '.str'
};
Object.freeze(cred.fileExtension);

// Returns the file name of a dialog resource file for a given dialog name and a given
// locale.
cred.dialogFileName = function(dialogName, locale) {
  let langLabel = '';
  const lang = cred.languageFromLocale(locale);
  if (lang) {
    langLabel = '.' + cred.languageFileLabels.get(lang);
  }
  return dialogName + langLabel + cred.fileExtension.dialogFile;
};

// Returns the file name of a dialog string file for a given dialog name and a given
// locale.
cred.stringFileName = function(dialogName, language) {
  const langLabel = '.' + cred.languageFileLabels.get(language);
  return dialogName + langLabel + cred.fileExtension.stringFile;
};

///////////////////
// Editing

// Bit flags for supported editing behavior.
cred.editBehavior = {
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
Object.freeze(cred.editBehavior);

// Indicates the context that a modification applies to. Global context will affect all
// locales, local context only the current locale.
cred.editContext = {
  globalDefault: 'global',
  globalOnly: 'global_only',
  localDefault: 'local',
  localOnly: 'local_only'
};
Object.freeze(cred.editContext);

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred;
