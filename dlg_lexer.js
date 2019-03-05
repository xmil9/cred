//
// Lexer for Canvas dialogs.
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
var util = tryRequire('./util') || util || {};

///////////////////

// Lexer module.
cred.lexer = (function() {
  ///////////////////

  // Represents a token produced by the lexer.
  class Token {
    constructor(kind, value, fileName, lineNum) {
      this._kind = kind;
      this._value = value;
      this._fileName = fileName;
      this._lineNum = lineNum;
    }

    // Check token kind.
    isKind(kind) {
      return this._kind === kind;
    }

    // Check token kind and value.
    isMatch(kind, value) {
      return (
        this._kind === kind && (typeof value === 'undefined' || this._value === value)
      );
    }

    // Access the kind.
    get kind() {
      return this._kind;
    }

    // Returns the name for this kind of token.
    get name() {
      return cred.tokenKindName(this._kind);
    }

    // Access the value.
    get value() {
      return this._value;
    }

    // Returns string indicating the location of the token in the source file.
    location() {
      return `File: ${this._fileName}, Line: ${this._lineNum}`;
    }
  }

  ///////////////////

  // Lexer state that processes situations when no specific state has been determined
  // yet. This happens at the beginning of the text or between tokens.
  class UndecidedState {
    constructor(lexer) {
      this._lexer = lexer;
    }

    // Processes the next character.
    // Returns the state to continue with.
    next(ch) {
      // Skip whitespaces until we find something else.
      if (isWhitespace(ch)) {
        return this;
      }

      // Identify the the state to transition into based on the given character.
      // For tokens that consist of a single character, the token can be generated
      // immediately.
      switch (ch) {
        case '#': {
          return new DirectiveState(this._lexer, ch);
        }
        case '/': {
          return new CommentState(this._lexer, ch);
        }
        case '"': {
          return new StringState(this._lexer, ch);
        }
        case ',': {
          this._lexer.storeToken(cred.tokenKind.comma, ch);
          return this;
        }
        case '|': {
          this._lexer.storeToken(cred.tokenKind.binaryOr, ch);
          return this;
        }
        case '(': {
          this._lexer.storeToken(cred.tokenKind.openParenthesis, ch);
          return this;
        }
        case ')': {
          this._lexer.storeToken(cred.tokenKind.closeParenthesis, ch);
          return this;
        }
      }

      if (isValidCharToStartNumber(ch)) {
        return new NumberState(this._lexer, ch);
      } else if (isValidCharToStartIdentifier(ch)) {
        return new IdentifierState(this._lexer, ch);
      }

      throw new Error(
        `Unexpected character "${ch}" in file ${this._lexer.fileName} on line ${
          this._lexer.lineNumber
        }.`
      );
    }

    // Called when the the input text has ended while this state is active.
    terminate() {
      // Do nothing.
    }
  }

  // Lexer state that processes C directives.
  class DirectiveState {
    constructor(lexer, firstChar) {
      this._lexer = lexer;
      this._value = firstChar;
    }

    // Processes the next character.
    // Returns the state to continue with.
    next(ch) {
      // Check if the directive has ended and try to match it to a valid
      // directive keyword.
      if (isWhitespace(ch)) {
        this._storeToken();
        return new UndecidedState(this._lexer);
      }

      // Keep on reading the directive.
      this._value += ch;
      return this;
    }

    // Called when the the input text has ended while this state is active.
    terminate() {
      if (this._value.length > 0) {
        this._storeToken();
      }
    }

    // Returns all supported keywords for directives.
    // Note that '#if defined' is missing because it will be processed as
    // as #if-token followed by a identifier token with value 'defined'.
    // The parser will recognize this combination of tokens as '#if defined'.
    static get keywords() {
      return [
        '#if',
        '#ifdef',
        '#elif',
        '#else',
        '#endif',
        '#include',
        '#error',
        '#define'
      ];
    }

    // Returns the directive keyword that matches the given text or undefined,
    // if not found.
    static _findMatch(text) {
      return DirectiveState.keywords.find(elem => {
        return elem === text;
      });
    }

    _storeToken() {
      let matchedKeyword = DirectiveState._findMatch(this._value);
      if (!matchedKeyword) {
        throw new Error(
          `Illegal directive "${this._value}" in file ${this._lexer.fileName} on line ${
            this._lexer.lineNumber
          }.`
        );
      }
      this._lexer.storeToken(cred.tokenKind.directive, matchedKeyword);
    }
  }

  // Lexer state that processes comments.
  class CommentState {
    constructor(lexer, firstChar) {
      this._lexer = lexer;
      this._value = firstChar;
    }

    // Processes the next character.
    // Returns the state to continue with.
    next(ch) {
      if (this._value === '/' && ch !== '/') {
        throw new Error(
          `Comment must start with "//" in file ${this._lexer.fileName} on line ${
            this._lexer.lineNumber
          }.`
        );
      }

      // Check if the comment has ended.
      if (isEOL(ch)) {
        // Put EOL char back before storing the token to make sure the line count is
        // accurate.
        this._lexer.backUpBy(1);
        this._storeToken();
        return new UndecidedState(this._lexer);
      }

      // Keep on reading the comment.
      this._value += ch;
      return this;
    }

    // Called when the the input text has ended while this state is active.
    terminate() {
      this._storeToken();
    }

    _storeToken() {
      this._lexer.storeToken(cred.tokenKind.comment, this._value);
    }
  }

  // Lexer state that processes numbers.
  class NumberState {
    constructor(lexer, firstChar) {
      this._lexer = lexer;
      this._value = firstChar;
    }

    // Processes the next character.
    // Returns the state to continue with.
    next(ch) {
      // Check if the number has ended.
      if (!isValidNumberChar(ch)) {
        // Put EOL char back before storing the token to make sure the line count is
        // accurate.
        this._lexer.backUpBy(1);
        this._storeToken();
        return new UndecidedState(this._lexer);
      }

      // Keep on reading the number.
      this._value += ch;
      return this;
    }

    // Called when the the input text has ended while this state is active.
    terminate() {
      if (this._value.length > 0) {
        this._storeToken();
      }
    }

    _storeToken() {
      this._lexer.storeToken(cred.tokenKind.number, util.toNumber(this._value));
    }
  }

  // Lexer state that processes strings.
  class StringState {
    constructor(lexer) {
      this._lexer = lexer;
      // Don't store the surrounding double quotes.
      this._value = '';
      this._insideNestedString = false;
    }

    // Processes the next character.
    // Returns the state to continue with.
    next(ch) {
      // Check if the string has ended.
      if (ch === '"') {
        let nextChar = this._lexer.peekAheadBy(1);
        if (this._insideNestedString) {
          // End nested string treatment and continue reading the outer string.
          this._insideNestedString = false;
        } else if (this._isNestedString()) {
          // Start nested string treatment and continue reading the inner string.
          this._insideNestedString = true;
        } else if (nextChar === '"' && !this._isSpecialCaseForEmptySerializedCaption()) {
          // If the next character is another double quote then it's an escape
          // sequence. Store both.
          this._value += ch;
          this._value += nextChar;
          this._lexer.skipAheadBy(1);
          return this;
        } else {
          // Otherwise the string has ended.
          this._storeToken();
          return new UndecidedState(this._lexer);
        }
      }

      // Keep on reading the string.
      this._value += ch;
      return this;
    }

    // Called when the the input text has ended while this state is active.
    terminate() {
      if (this._value.length > 0) {
        this._storeToken();
      }
    }

    _storeToken() {
      this._lexer.storeToken(cred.tokenKind.string, this._value);
    }

    // Checks for situations where nested strings can occurr.
    _isNestedString() {
      // No special nested string cases right now.
      return false;
    }

    // Detect special case where consecutive double-quotes are not an escape sequence.
    _isSpecialCaseForEmptySerializedCaption() {
      return this._value.endsWith(cred.serializedCaptionLabel);
    }
  }

  // Lexer state that processes identifiers and keywords.
  class IdentifierState {
    constructor(lexer, firstChar) {
      this._lexer = lexer;
      this._value = firstChar;
    }

    // Processes the next character.
    // Returns the state to continue with.
    next(ch) {
      // Check if the identifier has ended.
      if (!isValidIdentifierChar(ch)) {
        // Put EOL char back before storing the token to make sure the line count is
        // accurate.
        this._lexer.backUpBy(1);
        this._storeToken();
        return new UndecidedState(this._lexer);
      }

      // Keep on reading the number.
      this._value += ch;
      return this;
    }

    // Called when the the input text has ended while this state is active.
    terminate() {
      if (this._value.length > 0) {
        this._storeToken();
      }
    }

    // Returns all supported keywords for cv dialog resources.
    static get keywords() {
      return [
        'begin_dialog_definition_ex_',
        'end_dialog_definition_ex_',
        'begin_dialog_properties',
        'end_dialog_properties',
        'define_dialog_property',
        'declare_control',
        'begin_control_definitions',
        'end_control_definitions',
        'begin_control_ex',
        'end_control_ex',
        'define_property'
      ];
    }

    // Checks if the collected text matches a keyword for cv dialog resources.
    isKeyword() {
      let text = this._value;
      return IdentifierState.keywords.find(elem => {
        return elem === text;
      });
    }

    _storeToken() {
      this._lexer.storeToken(
        this.isKeyword() ? cred.tokenKind.keyword : cred.tokenKind.identifier,
        this._value
      );
    }
  }

  // Lexer for processing CV dialogs.
  class Lexer {
    constructor(text, fileName) {
      this._text = text;
      this._fileName = fileName;
      this._lineNum = 1;
      this._pos = 0;
      this._tokens = [];
    }

    // Starts analysing the text.
    // Returns an array of tokens.
    analyse() {
      let currentState = new UndecidedState(this);

      while (this._pos < this._text.length && typeof currentState !== 'undefined') {
        let ch = this._text.charAt(this._pos);
        this.skipAheadBy(1);
        currentState = currentState.next(ch);
      }

      // Give state chance to store its token.
      if (typeof currentState !== 'undefined') {
        currentState.terminate();
      }

      return this._tokens;
    }

    // Stores a token.
    storeToken(id, value) {
      this._tokens.push(new Token(id, value, this._fileName, this._lineNum));
    }

    // Skips ahead by a given number of characters.
    skipAheadBy(numChars) {
      const prevPos = this._pos;
      this._pos += numChars;
      if (this._pos > this._text.length) {
        this._pos = this._text.length;
      }
      // Pass the consumed text to the line counting code. The char at the new current pos
      // hasn't been consumed yet, so it is excluded from the consumed text!
      this._incLineCount(this._text.substring(prevPos, this._pos));
      return this._pos;
    }

    // Backs up a given number of characters.
    backUpBy(numChars) {
      const prevPos = this._pos;
      this._pos -= numChars;
      if (this._pos < 0) {
        this._pos = 0;
      }
      // Pass the un-consumed text to the line counting code. The char at the new current pos
      // hasn't been consumed yet, so it need to be part of the un-consumed text!
      this._decLineCount(this._text.substring(this._pos, prevPos));
      return this._pos;
    }

    // Returns the next few characters. Will not change the read position of the
    // lexer.
    peekAheadBy(numChars) {
      let numCharsLeft = this._text.length - this._pos;
      let endIdx = this._pos + Math.min(numChars, numCharsLeft);
      return this._text.substring(this._pos, endIdx);
    }

    // Returns name of the currently processed file.
    get fileName() {
      return this._fileName;
    }

    // Returns the current line number.
    get lineNumber() {
      return this._lineNum;
    }

    // Increases the line count according to the given text that was consumed by the lexer.
    _incLineCount(consumedText) {
      this._lineNum += util.countSubstring(consumedText, '\n');
    }

    // Decreases the line count according to the given text that was un-consumed by the lexer.
    _decLineCount(unconsumedText) {
      this._lineNum -= util.countSubstring(unconsumedText, '\n');
    }
  }

  // Runs lexical analysis on the given text.
  // Returns the identified tokens.
  function analyse(text, fileName) {
    let lexer = new Lexer(text, fileName);
    return lexer.analyse();
  }

  ///////////////////

  // Checks whether a passed character is a whitespace character.
  function isWhitespace(ch) {
    return /\s/.test(ch);
  }

  // Checks whether a passed character is a numeral.
  function isNumeral(ch) {
    const Ascii_0 = 48;
    const Ascii_9 = 57;
    let code = ch.charCodeAt(0);
    return Ascii_0 <= code && code <= Ascii_9;
  }

  // Checks whether a passed character is an ANSI letter.
  function isAnsiLetter(ch) {
    const Ascii_a = 97;
    const Ascii_z = 122;
    const Ascii_A = 65;
    const Ascii_Z = 90;
    let code = ch.charCodeAt(0);
    return (Ascii_A <= code && code <= Ascii_Z) || (Ascii_a <= code && code <= Ascii_z);
  }

  // Checks whether a passed character is an end-of-line character.
  function isEOL(ch) {
    return ch === '\n';
  }

  // Checks whether a passed character is valid as first character of an identifier.
  function isValidCharToStartIdentifier(ch) {
    // Allow ':' because of c++ namespace qualifiers for the global namespace, e.g.
    // ::ACDSystems::UI::PopupButton::TopRight.
    return isAnsiLetter(ch) || ch === '_' || ch == ':';
  }

  // Checks whether a passed character is valid as inner character of an identifier.
  function isValidIdentifierChar(ch) {
    // Allow ':' because of c++ namespace qualifiers, e.g. UI::DialogPadding::None.
    return isAnsiLetter(ch) || isNumeral(ch) || ch === '_' || ch == ':';
  }

  // Checks whether a passed character is valid as first character of a number.
  function isValidCharToStartNumber(ch) {
    return isNumeral(ch) || ch == '-';
  }

  // Checks whether a passed character is valid as inner character of a number.
  function isValidNumberChar(ch) {
    return isNumeral(ch) || ch === '.';
  }

  ///////////////////

  // Exports
  return {
    analyse: analyse,
    Token: Token
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.lexer;
