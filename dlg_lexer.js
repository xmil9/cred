//
// Lexer for Canvas dialogs.
//
'use strict';

///////////////////

// Namespaces
var cred = cred || {};
// Dependencies
// These are provided through (ordered!) script tags in the HTML file.
var util = util || {};

///////////////////

// Lexer module.
cred.lexer = (function() {
  ///////////////////

  // Represents a token produced by the lexer.
  class Token {
    constructor(kind, value) {
      this._kind = kind;
      this._value = value;
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
          this._lexer.storeToken(cred.tokenKind.logicalOr, ch);
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

      throw new Error(`Unexpected character ${ch}`);
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
        let matchedKeyword = DirectiveState._findMatch(this._value);
        if (!matchedKeyword) {
          throw new Error(`Illegal directive: ${this._value}`);
        }
        this._lexer.storeToken(cred.tokenKind.directive, matchedKeyword);
        return new UndecidedState(this._lexer);
      }

      // Keep on reading the directive.
      this._value += ch;
      return this;
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
      // Check if the comment has ended.
      if (isEOL(ch)) {
        let comment = this._value.trim();
        if (!CommentState._isValidComment(comment)) {
          throw new Error(`Illegal comment: ${comment}`);
        }
        this._lexer.storeToken(cred.tokenKind.comment, comment);
        return new UndecidedState(this._lexer);
      }

      // Keep on reading the comment.
      this._value += ch;
      return this;
    }

    // Checks if a given comment is valid.
    static _isValidComment(comment) {
      return comment.startsWith('//');
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
        this._lexer.storeToken(cred.tokenKind.number, util.toNumber(this._value));
        this._lexer.backUpBy(1);
        return new UndecidedState(this._lexer);
      }

      // Keep on reading the number.
      this._value += ch;
      return this;
    }
  }

  // Lexer state that processes strings.
  class StringState {
    constructor(lexer) {
      this._lexer = lexer;
      // Don't store the surrounding double quotes.
      this._value = '';
    }

    // Processes the next character.
    // Returns the state to continue with.
    next(ch) {
      // Check if the string has ended.
      if (ch === '"') {
        // If the next character is another double quote then it's an escape
        // sequence. Store both.
        // Otherwise the string has ended.
        let nextChar = this._lexer.peekAheadBy(1);
        if (nextChar === '"') {
          this._value += ch;
          this._value += nextChar;
          this._lexer.skipAheadBy(1);
        } else {
          this._lexer.storeToken(cred.tokenKind.string, this._value);
          return new UndecidedState(this._lexer);
        }
      }

      // Keep on reading the string.
      this._value += ch;
      return this;
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
        this._lexer.storeToken(
          this.isKeyword() ? cred.tokenKind.keyword : cred.tokenKind.identifier,
          this._value
        );
        this._lexer.backUpBy(1);
        return new UndecidedState(this._lexer);
      }

      // Keep on reading the number.
      this._value += ch;
      return this;
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
  }

  // Lexer for processing CV dialogs.
  class Lexer {
    constructor(text) {
      this._text = text;
      this._pos = 0;
      this._tokens = [];
    }

    // Starts analysing the text.
    // Returns an array of tokens.
    analyse() {
      let currentState = new UndecidedState(this);

      while (this._pos < this._text.length && typeof currentState !== 'undefined') {
        let ch = this._text.charAt(this._pos++);
        currentState = currentState.next(ch);
      }

      return this._tokens;
    }

    // Stores a token.
    storeToken(id, value) {
      this._tokens.push(new Token(id, value));
    }

    // Backs up a given number of characters.
    backUpBy(numChars) {
      this._pos -= numChars;
      if (this._pos < 0) {
        this._pos = 0;
      }
    }

    // Skips ahead by a given number of characters.
    skipAheadBy(numChars) {
      this._pos += numChars;
      if (this._pos > this._text.length) {
        this._pos = this._text.length;
      }
    }

    // Returns the next few characters. Will not change the read position of the
    // lexer.
    peekAheadBy(numChars) {
      let numCharsLeft = this._text.length - this._pos;
      let endIdx = this._pos + Math.min(numChars, numCharsLeft);
      return this._text.substring(this._pos, endIdx);
    }
  }

  // Runs lexical analysis on the given text.
  // Returns the identified tokens.
  function analyse(text) {
    let lexer = new Lexer(text);
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
