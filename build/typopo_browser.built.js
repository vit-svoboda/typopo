(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typopo = require('./typopo');

window.Typopo = { createCorrector: _typopo.createCorrector, getDefaultConfiguration: _typopo.getDefaultConfiguration };

},{"./typopo":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.getDefaultConfiguration = getDefaultConfiguration;
exports.normalizeConfiguration = normalizeConfiguration;

var _patterns = require('./patterns');

var _patterns2 = _interopRequireDefault(_patterns);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultValues = {
  'remove-empty-lines': true,
  'language': 'en',
  'exceptions': {
    exceptionPatterns: ['webUrlPattern', 'emailAddressPattern']
  },
  'patterns': _patterns2.default
};

function objMap(obj, callback) {
  return Object.keys(obj).reduce(function (aggregate, key) {
    aggregate[key] = callback(key, obj[key], obj);
    return aggregate;
  }, {});
}

function returnProp(propName) {
  return function (obj) {
    return obj[propName];
  };
}

function normalizeExceptionsConfig(exceptionsConfiguration) {
  var exceptionConfig = exceptionsConfiguration || {};
  var exceptionDefaultValues = defaultValues['exceptions'];
  return objMap(exceptionDefaultValues, function (key, value) {
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== _typeof(exceptionConfig[key])) {
      return value;
    }

    return exceptionConfig[key];
  });
}

function denormalizeExceptions(config) {
  var exceptionPatterns = config.exceptions.exceptionPatterns.map(function (patternName) {
    if (!config.patterns[patternName]) {
      throw new Error('Exception pattern ' + patternName + ' is not in config.patterns.');
    }
    return config.patterns[patternName];
  });

  return Object.assign({}, config.exceptions, { exceptionPatterns: exceptionPatterns });
}

function isString(arg) {
  return typeof arg === 'string';
}

function isStringMap(arg) {
  return (typeof arg === 'undefined' ? 'undefined' : _typeof(arg)) === 'object' && Object.keys(arg).every(function (key) {
    return isString(arg[key]);
  });
}

function verifyPatternsObject(patterns) {
  Object.keys(patterns).forEach(function (patternName) {
    if (!isString(patterns[patternName]) && !isStringMap(patterns[patternName])) {
      throw new Error('The pattern ' + patternName + ' in configuration is neither a string nor a map of strings.');
    }
  });
}

function normalizePatterns(patternsConfiguration) {
  var patternsConfig = patternsConfiguration || {};
  verifyPatternsObject(patternsConfig);

  return Object.assign({}, defaultValues['patterns'], patternsConfig);
}

var configurationNormalizer = {
  'remove-empty-lines': function removeEmptyLines(value) {
    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === _typeof(true) ? value : defaultValues['remove-empty-lines'];
  },
  'language': function language(value) {
    return ['en', 'sk', 'cs', 'rue'].includes(value) ? value : defaultValues['language'];
  },
  'patterns': normalizePatterns,
  'exceptions': normalizeExceptionsConfig
};

var configurationDenormalizer = {
  'exceptions': denormalizeExceptions,
  'remove-empty-lines': returnProp('remove-empty-lines'),
  'language': returnProp('language'),
  'patterns': returnProp('patterns')
};

function getDefaultConfiguration() {
  return Object.assign({}, defaultValues);
}

function normalizeConfiguration(configuration) {
  var config = configuration || {};
  var normalizedConfig = objMap(configurationNormalizer, function (key, normalize) {
    return normalize(config[key]);
  });
  var denormalizedConfig = objMap(configurationDenormalizer, function (key, denormalize) {
    return denormalize(normalizedConfig);
  });

  return denormalizedConfig;
}

},{"./patterns":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getExceptionHandler;
/*----------------------------------------------------------------------------*\
 Exceptions
 \*----------------------------------------------------------------------------*/

/*
 Identifies exceptions that will be omitted from correction of any sort

 Algorithm
 [1] Identify email addresses
 [2] Identify web URLs and IPs
 [3] Mark them as temporary exceptions in format {{typopo__exception-[i]}}

 @param {string} input text for identification of exceptions
 @returns {string} — output with identified exceptions in format {{typopo__exception-[i]}}
 */
function identify_exceptions(string) {
  var _this = this;

  this.config.exceptionPatterns.forEach(function (pattern) {
    identify_exception_set.call(_this, string, pattern);
  });

  /* [3] Mark them as temporary exceptions in format {{typopo__exception-[i]}} */
  for (var i = 0; i < this.exceptions.length; i++) {
    var replacement = "{{typopo__exception-" + i + "}}";
    string = string.replace(this.exceptions[i], replacement);
  }

  return string;
}

/*
 Identifies set of exceptions for given pattern
 Used as helper function for identify_exceptions(string)

 @param {string} input text for identification of exceptions
 @param {pattern} regular expression pattern to match exception
 */
function identify_exception_set(string, pattern) {
  var re = new RegExp(pattern, "g");
  var matched_exceptions = string.match(re);
  if (matched_exceptions != null) {
    this.exceptions = this.exceptions.concat(matched_exceptions);
  }
}

/*
 Replaces identified exceptions with real ones by change their
 temporary representation in format {{typopo__exception-[i]}} with its
 corresponding representation

 @param {string} input text with identified exceptions
 @returns {string} output with placed exceptions
 */
function place_exceptions(string) {
  for (var i = 0; i < this.exceptions.length; i++) {
    var pattern = "{{typopo__exception-" + i + "}}";
    var re = new RegExp(pattern, "g");
    var replacement = this.exceptions[i];
    string = string.replace(re, replacement);
  }

  return string;
}

function getExceptionHandler(config) {
  return {
    exceptions: [],
    identify_exceptions: identify_exceptions,
    place_exceptions: place_exceptions,
    config: config
  };
}

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*----------------------------------------------------------------------------*\
 Variables & Character replacement sets
 \*----------------------------------------------------------------------------*/

var essentialSet = {
  "\\(C\\)": "©",
  "\\(c\\)": "©",
  "\\(R\\)": "®",
  "\\(r\\)": "®",
  "\\(TM\\)": "™",
  "\\(tm\\)": "™",
  "\\+\\-": "±",
  "\\-\\+": "±"
};
var nonLatinLowercase = "áäčďéěíĺľňóôöőŕřšťúüűůýžабвгґдезіийклмнопрстуфъыьцчжшїщёєюях";
var nonLatinUppercase = "ÁÄČĎÉĚÍĹĽŇÓÔÖŐŔŘŠŤÚÜŰŮÝŽАБВГҐДЕЗІИЙКЛМНОПРСТУФЪЫЬЦЧЖШЇЩЁЄЮЯХ";
var nonLatinChars = nonLatinLowercase + nonLatinUppercase;
var lowercaseCharsEnSkCzRue = "a-z" + nonLatinLowercase;
var uppercaseCharsEnSkCzRue = "A-Z" + nonLatinUppercase;
var allChars = lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue;
/*
 (39)			dumb single quote
 (8216)		left single quotation mark
 (8217)		right single quotation mark
 (700)		modifier letter apostrophe; https://en.wikipedia.org/wiki/Modifier_letter_apostrophe
 (8219)		single high-reversed-9 quotation mark
 (8242)		prime
 (8249)		single left-pointing angle quotation mark
 (8250)		single right-pointing angle quotation mark
 */
var singleQuoteAdepts = "‚|'|‘|’|ʼ|‛|′|‹|›";
var doubleQuoteAdepts = "„|“|”|\"|«|»|″|,{2,}|‘{2,}|’{2,}|'{2,}|‹{2,}|›{2,}|′{2,}";
var space = " ";
var nbsp = " ";
var hairSpace = " "; //&#8202;
var narrowNbsp = " "; //&#8239;
var spaces = space + nbsp + hairSpace + narrowNbsp;
var terminalPunctuation = "\.\!\?";
var sentencePunctuation = "\,\:\;" + terminalPunctuation; // there is no ellipsis in the set as it is being used throughout a sentence in the middle. Rethink this group to split it into end-sentence punctuation and middle sentence punctuation
var openingBrackets = "\\(\\[\\{";
var closingBrackets = "\\)\\]\\}";
var ellipsis = "…";
var degree = "°";

/*
 Source for webUrlPattern, emailAddressPattern
 http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android/2.0_r1/android/text/util/Regex.java#Regex.0WEB_URL_PATTERN
 */
var webUrlPattern = "((?:(http|https|Http|Https|rtsp|Rtsp):\\/\\/(?:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)" + "\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,64}(?:\\:(?:[a-zA-Z0-9\\$\\-\\_" + "\\.\\+\\!\\*\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,25})?\\@)?)?" + "((?:(?:[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}\\.)+" + // named host
"(?:" + // plus top level domain
"(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])" + "|(?:biz|b[abdefghijmnorstvwyz])" + "|(?:cat|com|coop|c[acdfghiklmnoruvxyz])" + "|d[ejkmoz]" + "|(?:edu|e[cegrstu])" + "|f[ijkmor]" + "|(?:gov|g[abdefghilmnpqrstuwy])" + "|h[kmnrtu]" + "|(?:info|int|i[delmnoqrst])" + "|(?:jobs|j[emop])" + "|k[eghimnrwyz]" + "|l[abcikrstuvy]" + "|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])" + "|(?:name|net|n[acefgilopruz])" + "|(?:org|om)" + "|(?:pro|p[aefghklmnrstwy])" + "|qa" + "|r[eouw]" + "|s[abcdeghijklmnortuvyz]" + "|(?:tel|travel|t[cdfghjklmnoprtvwz])" + "|u[agkmsyz]" + "|v[aceginu]" + "|w[fs]" + "|y[etu]" + "|z[amw]))" + "|(?:(?:25[0-5]|2[0-4]" + // or ip address
"[0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\\.(?:25[0-5]|2[0-4][0-9]" + "|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1]" + "[0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}" + "|[1-9][0-9]|[0-9])))" + "(?:\\:\\d{1,5})?)" + // plus option port number +
"(\\/(?:(?:[a-zA-Z0-9\\;\\/\\?\\:\\@\\&\\=\\#\\~" + // plus option query params
"\\-\\.\\+\\!\\*\\'\\(\\)\\,\\_])|(?:\\%[a-fA-F0-9]{2}))*)?" + "(?:\\b|$)"; // and finally, a word boundary or end of
// input.  This is to stop foo.sure from
// matching as foo.su


var emailAddressPattern = "[a-zA-Z0-9\\+\\.\\_\\%\\-]{1,256}" + "\\@" + "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}" + "(" + "\\." + "[a-zA-Z0-9][a-zA-Z0-9\\-]{0,25}" + ")+";

exports.default = {
  essentialSet: essentialSet,
  nonLatinLowercase: nonLatinLowercase,
  nonLatinUppercase: nonLatinUppercase,
  nonLatinChars: nonLatinChars,
  lowercaseCharsEnSkCzRue: lowercaseCharsEnSkCzRue,
  uppercaseCharsEnSkCzRue: uppercaseCharsEnSkCzRue,
  allChars: allChars,
  singleQuoteAdepts: singleQuoteAdepts,
  doubleQuoteAdepts: doubleQuoteAdepts,
  space: space,
  nbsp: nbsp,
  hairSpace: hairSpace,
  narrowNbsp: narrowNbsp,
  spaces: spaces,
  terminalPunctuation: terminalPunctuation,
  sentencePunctuation: sentencePunctuation,
  openingBrackets: openingBrackets,
  closingBrackets: closingBrackets,
  ellipsis: ellipsis,
  degree: degree,
  webUrlPattern: webUrlPattern,
  emailAddressPattern: emailAddressPattern
};

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultConfiguration = undefined;

var _configuration = require('./configuration');

Object.defineProperty(exports, 'getDefaultConfiguration', {
  enumerable: true,
  get: function get() {
    return _configuration.getDefaultConfiguration;
  }
});
exports.createCorrector = createCorrector;

var _exceptions = require('./modules/exceptions');

var _exceptions2 = _interopRequireDefault(_exceptions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createCorrector(configuration) {
  var config = (0, _configuration.normalizeConfiguration)(configuration);
  var _config$patterns = config.patterns,
      essentialSet = _config$patterns.essentialSet,
      nonLatinChars = _config$patterns.nonLatinChars,
      lowercaseCharsEnSkCzRue = _config$patterns.lowercaseCharsEnSkCzRue,
      uppercaseCharsEnSkCzRue = _config$patterns.uppercaseCharsEnSkCzRue,
      singleQuoteAdepts = _config$patterns.singleQuoteAdepts,
      doubleQuoteAdepts = _config$patterns.doubleQuoteAdepts,
      nbsp = _config$patterns.nbsp,
      hairSpace = _config$patterns.hairSpace,
      narrowNbsp = _config$patterns.narrowNbsp,
      spaces = _config$patterns.spaces,
      terminalPunctuation = _config$patterns.terminalPunctuation,
      sentencePunctuation = _config$patterns.sentencePunctuation,
      openingBrackets = _config$patterns.openingBrackets,
      closingBrackets = _config$patterns.closingBrackets,
      ellipsis = _config$patterns.ellipsis,
      degree = _config$patterns.degree;

  /*----------------------------------------------------------------------------*\
   Essential replacements
   \*----------------------------------------------------------------------------*/

  function replace_symbols(string) {
    for (var rule in essentialSet) {
      var re = new RegExp(rule, "g");
      string = string.replace(re, essentialSet[rule]);
    }
    return string;
  }

  function replace_periods_with_ellipsis(string) {
    /* [1] replace 3 and more dots with an ellipsis */
    string = string.replace(/\.{3,}/g, "…");

    /* [2] replace 2 dots in the middle of the sentence with an aposiopesis */
    var pattern = "[" + spaces + "]\\.{2}[" + spaces + "]";
    var re = new RegExp(pattern, "g");
    string = string.replace(re, " … ");

    /* [3] replace 2 dots at the end of the sentence with full stop */
    string = string.replace(/\.{2}/g, ".");

    return string;
  }

  function remove_multiple_spaces(string) {
    return string.replace(/ {2,}/g, " ");
  }

  /*----------------------------------------------------------------------------*\
   Quotes, primes & apostrophes
   \*----------------------------------------------------------------------------*/

  /*
   Corrects improper use of double quotes and double primes
    Assumptions and Limitations
   This function assumes that double quotes are always used in pair,
   i.e. authors did not forget to close double quotes in their text.
    Algorithm
   [0] Remove extra terminal punctuation around double quotes
   [1] Swap right double quote adepts with a punctuation
   (this comes first as it is a quite common mistake that may eventually
   lead to improper identification of double primes)
   [2] Identify inches, arcseconds, seconds
   [3] Identify closed double quotes
   [4] Identify the rest as unclosed double quotes (best-effort replacement)
   [5] Fix spacing around quotes and primes
   [6] Swap back some of the double quotes with a punctuation
   [7] Remove extra punctuation around quotes
   [8] Replace all identified punctuation with appropriate punctuation in
   given language
    @param {string} string — input text for identification
   @param {string} language — language option
   @returns {string} output with properly replaces double quotes and double primes
   */
  function correct_double_quotes_and_primes(string, language) {

    /* [0] Remove extra terminal punctuation around double quotes
     e.g. “We will continue tomorrow.”. */
    var pattern = "([" + sentencePunctuation + "])(" + doubleQuoteAdepts + ")([" + sentencePunctuation + "])";
    var re = new RegExp(pattern, "g");
    string = string.replace(re, "$1$2");

    /* [1] Swap right double quote adepts with a terminal punctuation */
    pattern = "(" + doubleQuoteAdepts + ")([" + terminalPunctuation + "])";
    re = new RegExp(pattern, "g");
    string = string.replace(re, '$2$1');

    /* [2] Identify inches, arcseconds, seconds
     Note: we’re not using double_quote_adepts variable
     as commas and low-positioned quotes are omitted*/
    string = string.replace(/(\d ?)(“|”|"|″|‘{2,}|’{2,}|'{2,}|′{2,})/g, "$1{{typopo__double-prime}}");

    /* [3] Identify closed double quotes */
    pattern = "(" + doubleQuoteAdepts + ")(.*?)(" + doubleQuoteAdepts + ")";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "{{typopo__left-double-quote}}$2{{typopo__right-double-quote}}");

    /* [4.1] Identify unclosed left double quote */
    pattern = "(" + doubleQuoteAdepts + ")([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "])";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "{{typopo__left-double-quote}}$2");

    /* [4.2] Identify unclosed right double quote */
    pattern = "([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + sentencePunctuation + ellipsis + "])(" + doubleQuoteAdepts + ")";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "$1{{typopo__right-double-quote}}");

    /* [4.3] Remove remaining unidentified double quote */
    pattern = "([" + spaces + "])(" + doubleQuoteAdepts + ")([" + spaces + "])";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "$1$3");

    /* [5] Fix spacing around quotes and prime */
    string = string.replace(/(\{\{typopo__left-double-quote}})( )/g, "$1");
    string = string.replace(/( )(\{\{typopo__right-double-quote}})/g, "$2");
    string = string.replace(/( )(\{\{typopo__double-prime}})/g, "$2");

    /* [6] Swap back some of the double quotes with a punctuation
      Idea
     In [1] we have swapped all double right quotes by default with a terminal
     punctuation. However, not all double quotes wrap the whole sentence and
     there are cases when few words are quoted within a sentence. Take a look at
     examples:
     “Sentence quoted as a whole.” (full stop is placed within double quotes)
     This is “quoted expression.” (full stop is placed outside double quotes)
      Algorithm
     Match all the double quote pairs that do not precede sentence punctuation
     (and thus must be used within a sentence) and swap right double with
     a terminal punctuation.
     */
    pattern = "([^" + sentencePunctuation + "][" + spaces + "]{{typopo__left-double-quote}}.+?)([" + terminalPunctuation + "])({{typopo__right-double-quote}})";
    // console.log(pattern);
    re = new RegExp(pattern, "g");
    string = string.replace(re, "$1$3$2");

    /* [7] Remove extra comma after punctuation in direct speech,
     e.g. "“Hey!,” she said" */
    pattern = "([" + sentencePunctuation + "])([\,])";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "$1");

    /* [8] Punctuation replacement */
    string = string.replace(/(\{\{typopo__double-prime}})/g, "″");

    switch (language) {
      case "rue":
        string = string.replace(/(\{\{typopo__left-double-quote}})/g, "«");
        string = string.replace(/(\{\{typopo__right-double-quote}})/g, "»");
        break;
      case "sk":
      case "cs":
        string = string.replace(/(\{\{typopo__left-double-quote}})/g, "„");
        string = string.replace(/(\{\{typopo__right-double-quote}})/g, "“");
        break;
      case "en":
        string = string.replace(/(\{\{typopo__left-double-quote}})/g, "“");
        string = string.replace(/(\{\{typopo__right-double-quote}})/g, "”");
        break;
    }

    return string;
  }

  /*
   Corrects improper use of single quotes, single primes and apostrophes
    Assumptions and Limitations
   This function assumes that double quotes are always used in pair,
   i.e. authors did not forget to close double quotes in their text.
   Further, single quotes are used as secondary and they're properly spaced,
   e.g. ␣'word or sentence portion'␣ (and not like ␣'␣word␣'␣)
    Algorithm
   [1] Identify common apostrohe contractions
   [2] Identify single quotes
   [3] Identify feet, arcminutes, minutes
   [4] Identify residual apostrophes that have left
   [?] Swap right single quote adepts with a punctuation
   (We were swapping single quotes as part of algorithm a while a back,
   but since it is more probable that single quotes are in the middle of the
   sentence, we have dropped swapping as a part of the algorithm)
   [6] Replace all identified punctuation with appropriate punctuation in
   given language
    @param {string} string — input text for identification
   @param {string} language — language options
   @returns {string} — corrected output
   */
  function correct_single_quotes_primes_and_apostrophes(string, language) {

    /* [1.1] Identify ’n’ contractions */
    var pattern = "(" + singleQuoteAdepts + ")(n)(" + singleQuoteAdepts + ")";
    var re = new RegExp(pattern, "gi");
    string = string.replace(re, "{{typopo__apostrophe}}$2{{typopo__apostrophe}}");

    /* [1.2] Identify common contractions at the beginning or at the end
     of the word, e.g. Fish ’n’ Chips, ’em, ’cause,… */
    var contraction_examples = "em|cause|twas|tis|til|round";
    pattern = "(" + singleQuoteAdepts + ")(" + contraction_examples + ")";
    re = new RegExp(pattern, "gi");
    string = string.replace(re, "{{typopo__apostrophe}}$2");

    /* [1.3] Identify in-word contractions,
     e.g. Don’t, I’m, O’Doole, 69’ers */
    var character_adepts = "0-9" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue;
    pattern = "([" + character_adepts + "])(" + singleQuoteAdepts + ")([" + character_adepts + "])";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "$1{{typopo__apostrophe}}$3");

    /* [1.4] Identify year contractions
     e.g. ’70s, INCHEBA ’89,… */
    pattern = "(" + singleQuoteAdepts + ")([0-9]{2})";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "{{typopo__apostrophe}}$2");

    /* [2] Identify single quotes within double quotes */
    pattern = "(" + doubleQuoteAdepts + ")(.*?)(" + doubleQuoteAdepts + ")";
    re = new RegExp(pattern, "g");
    string = string.replace(re, function ($0, $1, $2, $3) {

      //identify {{typopo__left-single-quote--adept}}
      var pattern = "( )(" + singleQuoteAdepts + ")([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "])";
      var re = new RegExp(pattern, "g");
      $2 = $2.replace(re, "$1{{typopo__left-single-quote--adept}}$3");

      //identify {{typopo__right-single-quote--adept}}
      pattern = "([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "])([\.,!?])?(" + singleQuoteAdepts + ")([ ]|[\.,!?])";
      re = new RegExp(pattern, "g");
      $2 = $2.replace(re, "$1$2{{typopo__right-single-quote--adept}}$4");

      //identify single quote pairs
      pattern = "({{typopo__left-single-quote--adept}})(.*?)({{typopo__right-single-quote--adept}})";
      re = new RegExp(pattern, "g");
      $2 = $2.replace(re, "{{typopo__left-single-quote}}$2{{typopo__right-single-quote}}");

      return $1 + $2 + $3;
    });

    /* [3] Identify feet, arcminutes, minutes
     Note: we’re not using single_quote_adepts variable
     as commas and low-positioned quotes are omitted*/
    string = string.replace(/(\d)( ?)('|‘|’|‛|′)/g, "$1{{typopo__single-prime}}");

    /* [4] Identify residual apostrophes that have left */
    pattern = "(" + singleQuoteAdepts + ")";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "{{typopo__apostrophe}}");

    /* [5] Punctuation replacement */
    string = string.replace(/(\{\{typopo__single-prime}})/g, "′");
    string = string.replace(/\{\{typopo__apostrophe}}|\{\{typopo__left-single-quote--adept}}|\{\{typopo__right-single-quote--adept}}/g, "’");

    switch (language) {
      case "rue":
        string = string.replace(/\{\{typopo__left-single-quote}}/g, "‹");
        string = string.replace(/\{\{typopo__right-single-quote}}/g, "›");
        break;
      case "sk":
      case "cs":
        string = string.replace(/\{\{typopo__left-single-quote}}/g, "‚");
        string = string.replace(/\{\{typopo__right-single-quote}}/g, "‘");
        break;
      case "en":
        string = string.replace(/\{\{typopo__left-single-quote}}/g, "‘");
        string = string.replace(/\{\{typopo__right-single-quote}}/g, "’");
    }

    return string;
  }

  function correct_multiple_sign(string) {
    return remove_multiple_spaces(string.replace(/([1-9]+[ ]?[a-wz]*)([ ]{0,1}[x|×][ ]{0,1})([1-9]+[ ]{0,1}[a-wz]*)/g, "$1 × $3"));
  }

  /*
   Replaces hyphen with em or en dash
    Algorithm
   [1] Replace 3 consecutive hyphens (---) with an em dash (—)
   [2] Replace 2 consecutive hyphens (--) with an en dash (—)
   [3] Replace any hyphen or dash surrounded with spaces with an em dash
   [4] Replace hyphen or dash used in number range with an en dash
   and set proper spacing
    @param {string} string — input text for identification
   @returns {string} — output with dashes instead of hyphens
   */
  function replace_hyphen_with_dash(string, language) {
    var dashes = "-–—"; // including a hyphen

    /* [1] Replace 3 consecutive hyphens (---) with an em dash (—) */
    string = string.replace(/(---)/g, "—");

    /* [2] Replace 2 consecutive hyphens (--) with an en dash (—) */
    string = string.replace(/(--)/g, "–");

    /* [3] Replace any hyphen or dash surrounded with spaces with an em dash */
    var pattern = "[" + spaces + "][" + dashes + "][" + spaces + "]";
    var re = new RegExp(pattern, "g");
    var replacement = narrowNbsp + "—" + hairSpace;
    string = string.replace(re, replacement);

    /* [4.1] Replace hyphen or dash, placed between 2 cardinal numbers,
     with an en dash; including cases when there is an extra space
     from either one side or both sides of the dash */
    var cardinal_number = "\\d+";
    pattern = "(" + cardinal_number + ")([" + spaces + "]?[" + dashes + "][" + spaces + "]?)(" + cardinal_number + ")";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "$1–$3");

    /* [4.2] Replace hyphen or dash, placed between 2 ordinal numbers,
     with an en dash; including cases when there is an extra space
     from either one side or both sides of the dash */
    var ordinal_indicator = "";
    switch (language) {
      case "rue":
      case "sk":
      case "cs":
        ordinal_indicator = "\\.";
        break;
      case "en":
        ordinal_indicator = "st|nd|rd|th";
        break;
    }
    pattern = "(" + cardinal_number + ")(" + ordinal_indicator + ")([" + spaces + "]?[" + dashes + "][" + spaces + "]?)(" + cardinal_number + ")(" + ordinal_indicator + ")";
    re = new RegExp(pattern, "gi");
    string = string.replace(re, "$1$2–$4$5");

    return string;
  }

  function replace_dash_with_hyphen(string) {
    var pattern = "([" + lowercaseCharsEnSkCzRue + "])([–—])([" + lowercaseCharsEnSkCzRue + "])";
    var re = new RegExp(pattern, "g");
    return string.replace(re, "$1-$3");
  }

  /*----------------------------------------------------------------------------*\
   Consolidation of spaces
   \*----------------------------------------------------------------------------*/

  function remove_space_before_punctuation(string) {
    var pattern = "([" + spaces + "])([" + sentencePunctuation + closingBrackets + degree + "])";
    var re = new RegExp(pattern, "g");
    return string.replace(re, "$2");
  }

  function remove_space_after_punctuation(string) {
    var pattern = "([" + openingBrackets + "])([" + spaces + "])";
    var re = new RegExp(pattern, "g");
    return string.replace(re, "$1");
  }

  function remove_trailing_spaces(string) {
    return string.trim();
  }

  function add_space_before_punctuation(string) {
    var pattern = "([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "])([" + openingBrackets + "])([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "])";
    var re = new RegExp(pattern, "g");
    return string.replace(re, "$1 $2$3");
  }

  function add_space_after_punctuation(string) {
    var pattern = "([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "])([" + sentencePunctuation + closingBrackets + "])([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "])";
    var re = new RegExp(pattern, "g");
    return string.replace(re, "$1$2 $3");
  }

  /*
   Removes extra spaces at the beginning of each paragraph
    This could be done with a one-liner:
   return string.replace(/^\s+/gm, "");
    However, it also removes empty lines. Since, we want to handle this change
   separately, we need to
   [1] split the lines manually
   [2] and remove extra spaces at the begining of each line
   [3] join lines together to a single string
    @param {string} string — input text for identification
   @returns {string} — output with removed spaces at the beginning of paragraphs
   */
  function remove_spaces_at_paragraph_beginning(string) {
    /* [1] split the lines manually */
    var lines = string.split(/\r?\n/);

    /* [2] and remove extra spaces at the begining of each line */
    for (var i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(/^\s+/, "");
    }

    /* [3] join lines together to a single string */
    return lines.join("\n");
  }

  /*
   Removes empty lines
    @param {string} string — input text for identification
   @returns {string} — output with removed empty lines
   */
  function remove_empty_lines(string) {
    return string.replace(/^\s+/gm, "");
  }

  /*
   Consolidates the use of non-breaking spaces
    * adds non-breaking spaces after single-character prepositions
   * adds non-breaking spaces after numerals
   * adds non-breaking spaces around ×
   * removes characters between multi-character words
    @param {string} string — input text for identification
   @returns {string} — output with correctly placed non-breaking space
   */
  function consolidate_nbsp(string) {
    // removes non-breaking spaces between multi-character words
    var pattern = "([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "]{2,})([" + nbsp + narrowNbsp + "])([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "]{2,})";
    var re = new RegExp(pattern, "g");
    string = string.replace(re, "$1 $3");
    string = string.replace(re, "$1 $3"); //calling it twice to catch odd/even occurences


    // adds non-breaking spaces after numerals
    pattern = "([0-9]+)( )([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "]+)";
    re = new RegExp(pattern, "g");
    var replacement = "$1" + nbsp + "$3";
    string = string.replace(re, replacement);

    // adds non-breaking spaces around ×
    pattern = "([" + spaces + "])([×])([" + spaces + "])";
    re = new RegExp(pattern, "g");
    replacement = nbsp + "$2" + nbsp;
    string = string.replace(re, replacement);

    // adds non-breaking spaces after single-character prepositions
    pattern = "([  ])([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "]|&)( )";
    re = new RegExp(pattern, "g");
    replacement = "$1$2" + nbsp;
    string = string.replace(re, replacement);
    string = string.replace(re, replacement); //calling it twice to catch odd/even occurences

    return string;
  }

  /*
   Corrects improper spacing around ellipsis and aposiopesis
    Ellipsis (as a character) is used for 2 different purposes:
   1. as an ellipsis to omit a piece of information deliberately
   2. as an aposiopesis; a figure of speech wherein a sentence is
   deliberately broken off and left unfinished
    sources
   https://en.wikipedia.org/wiki/Ellipsis
   https://en.wikipedia.org/wiki/Aposiopesis
   http://www.liteera.cz/slovnik/vypustka
    Algorithm
   Ellipsis & Aposiopesis require different use of spacing around them,
   that is why we are correcting only following cases:
   errors:
   [1] correct spacing, when ellipsis used used around commas
   [2] correct spacing for aposiopesis at the end of the sentence in the middle of the paragraph
   [3] correct spacing for aposiopesis at the beginning of the sentence in the middle of the paragraph
   [4] correct spacing for aposiopesis at the beginning of the sentence at the beginning of the paragraph
   [5] correct spacing for aposiopesis at the end of the sentence at the end of the paragraph
    @param {string} string — input text for identification
   @returns {string} — output with corrected spacing around aposiopesis
   */
  function correct_spaces_around_ellipsis(string) {

    /* [1] correct spacing, when ellipsis used used around commas */
    var pattern = ",[" + spaces + "]?" + ellipsis + "[" + spaces + "]?,";
    var re = new RegExp(pattern, "g");
    string = string.replace(re, ", …,");

    /* [2] correct spacing for aposiopesis at the end of the sentence
     in the middle of the paragraph */
    pattern = "([" + lowercaseCharsEnSkCzRue + "])([" + spaces + "])(" + ellipsis + "[" + spaces + "][" + uppercaseCharsEnSkCzRue + "])";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "$1$3");

    /* [3] correct spacing for aposiopesis at the beginning of the sentence
     in the middle of the paragraph */
    pattern = "([" + sentencePunctuation + "][" + spaces + "]" + ellipsis + ")([" + spaces + "])([" + lowercaseCharsEnSkCzRue + "])";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "$1$3");

    /* [4] correct spacing for aposiopesis at the beginning of the sentence
     at the beginning of the paragraph */
    pattern = "(^…)([" + spaces + "])([" + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "])";
    re = new RegExp(pattern, "gm");
    string = string.replace(re, "$1$3");

    /* [5] correct spacing for aposiopesis at the end of the sentence
     at the end of the paragraph */
    pattern = "([" + lowercaseCharsEnSkCzRue + sentencePunctuation + "])([" + spaces + "])(" + ellipsis + ")(?![ " + sentencePunctuation + lowercaseCharsEnSkCzRue + uppercaseCharsEnSkCzRue + "])";
    re = new RegExp(pattern, "g");
    string = string.replace(re, "$1$3");

    return string;
  }

  /*
   Corrects accidental uppercase
    Best-effort function to fix most common accidental uppercase errors, namely:
   [1] 2 first uppercase letters (ie. UPpercase)
   [2] Swapped cases (ie. uPPERCASE)
    Algorithm does not fix other uppercase eventualities,
   e.g. mixed case (UppERcaSe) as there are many cases for corporate brands
   that could potentially match the algorithm as false positive.
    @param {string} string — input text for identification
   @returns {string} — output with corrected accidental uppercase
   */
  function correct_accidental_uppercase(string) {

    /* [1] two first uppercase letters (i.e. UPpercase) */
    var pattern = "[" + uppercaseCharsEnSkCzRue + "]{2,2}[" + lowercaseCharsEnSkCzRue + "]+";
    var re = new RegExp(pattern, "g");
    string = string.replace(re, function (string) {
      return string.substring(0, 1) + string.substring(1).toLowerCase();
    });

    /* [2.1] Swapped cases (2-letter cases, i.e. iT)
     Note that this is divided into 2 separate cases as \b in JavaScript regex
     does not take non-latin characters into a cosnideration
     */
    pattern = "[" + lowercaseCharsEnSkCzRue + "][" + uppercaseCharsEnSkCzRue + "]\\b";
    re = new RegExp(pattern, "g");
    string = string.replace(re, function (string) {
      return string.substring(0, 1) + string.substring(1).toLowerCase();
    });

    /* [2.2] Swapped cases (n-letter cases, i.e. uPPERCASE) */
    pattern = "[" + lowercaseCharsEnSkCzRue + "]+[" + uppercaseCharsEnSkCzRue + "]{2,}";
    re = new RegExp(pattern, "g");
    string = string.replace(re, function (string) {
      return string.substring(0, 1) + string.substring(1).toLowerCase();
    });

    return string;
  }

  /*----------------------------------------------------------------------------*\
   Abbreviations
   \*----------------------------------------------------------------------------*/
  /*
   Identifies differently-spelled abbreviations and replaces it with
   a temp variable, {{typopo__[abbr]}}
    Identifies given abbreviations:
   a.m., p.m., e.g., i.e.
    Algorithm
   [1] Identify e.g., i.e.
   [2] Identify a.m., p.m. (different match to avoid false positives such as:
   I am, He is the PM.)
   [3] Exclude false identifications
    @param {string} input text for identification
   @returns {string} corrected output
   */
  function identify_common_abbreviations(string) {

    /* [1] Identify e.g., i.e. */
    var abbreviations = ["eg", "ie"];
    for (var i = 0; i < abbreviations.length; i++) {
      var pattern = "(\\b[" + abbreviations[i][0] + "]\\.?[" + spaces + "]?[" + abbreviations[i][1] + "]\\.?)([" + spaces + "]?)(\\b)";
      // console.log(pattern);
      var re = new RegExp(pattern, "gi");
      var replacement = "{{typopo__" + abbreviations[i] + "}} ";
      string = string.replace(re, replacement);
    }

    /* [2] Identify a.m., p.m. */
    abbreviations = ["am", "pm"];
    for (var _i = 0; _i < abbreviations.length; _i++) {
      var _pattern = "(\\d)([" + spaces + "]?)(\\b[" + abbreviations[_i][0] + "]\\.?[" + spaces + "]?[" + abbreviations[_i][1] + "]\\.?)([" + spaces + "]?)(\\b|\\B)";
      var _re = new RegExp(_pattern, "gi");
      var _replacement = "$1 {{typopo__" + abbreviations[_i] + "}} ";
      string = string.replace(_re, _replacement);
    }

    /* [3] Exclude false identifications
     Regex \b does not catch non-latin characters so we need to exclude false
     identifications
     */
    abbreviations = ["eg", "ie", "am", "pm"];
    for (var _i2 = 0; _i2 < abbreviations.length; _i2++) {
      // non-latin character at the beginning
      var _pattern2 = "([" + nonLatinChars + "])({{typopo__" + abbreviations[_i2] + "}})";
      var _re2 = new RegExp(_pattern2, "g");
      var _replacement2 = "$1" + abbreviations[_i2];
      string = string.replace(_re2, _replacement2);

      // non-latin character at the end
      _pattern2 = "({{typopo__" + abbreviations[_i2] + "}} )([" + nonLatinChars + "])";
      _re2 = new RegExp(_pattern2, "g");
      _replacement2 = abbreviations[_i2] + "$2";
      string = string.replace(_re2, _replacement2);
    }

    return string;
  }

  /*
   Replaces identified temp abbreviation variable like {{typopo__eg}},
   with their actual representation
    @param {string} input text for identification
   @returns {string} corrected output
   */
  function place_common_abbreviations(string) {
    var abbreviations = ["eg", "ie", "am", "pm"];
    for (var i = 0; i < abbreviations.length; i++) {
      var pattern = "{{typopo__" + abbreviations[i] + "}}";
      var re = new RegExp(pattern, "g");
      var replacement = abbreviations[i][0] + "." + abbreviations[i][1] + ".";
      string = string.replace(re, replacement);
    }

    return string;
  }

  /*----------------------------------------------------------------------------*\
   Main script
   \*----------------------------------------------------------------------------*/

  /*
   Correct typos in the predefined order
     @param {string} string — input text for correction
   @returns {string} — corrected output
   */
  return function correct_typos(string) {
    var language = config.language;
    var remove_lines = config['remove-empty-lines'];

    var exceptionHandler = (0, _exceptions2.default)(config['exceptions']);

    string = exceptionHandler.identify_exceptions(string);
    string = identify_common_abbreviations(string); // needs to go before punctuation fixes

    string = replace_symbols(string, essentialSet);
    string = replace_periods_with_ellipsis(string);
    string = remove_multiple_spaces(string);

    string = correct_double_quotes_and_primes(string, language);
    string = correct_single_quotes_primes_and_apostrophes(string, language);

    string = correct_multiple_sign(string);

    string = remove_space_before_punctuation(string);
    string = remove_space_after_punctuation(string);
    string = remove_trailing_spaces(string);
    string = add_space_before_punctuation(string);
    string = add_space_after_punctuation(string);
    string = remove_spaces_at_paragraph_beginning(string);

    if (remove_lines) {
      string = remove_empty_lines(string);
    }

    string = consolidate_nbsp(string);
    string = correct_spaces_around_ellipsis(string);

    string = replace_hyphen_with_dash(string, language);
    string = replace_dash_with_hyphen(string);

    string = correct_accidental_uppercase(string);

    string = place_common_abbreviations(string); // needs to go after punctuation fixes
    string = exceptionHandler.place_exceptions(string);

    string = replace_periods_with_ellipsis(string);

    return string;
  };
}

},{"./configuration":2,"./modules/exceptions":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmNcXGJyb3dzZXJfdHlwb3BvLmpzIiwic3JjXFxjb25maWd1cmF0aW9uLmpzIiwic3JjXFxtb2R1bGVzXFxleGNlcHRpb25zLmpzIiwic3JjXFxwYXR0ZXJucy5qcyIsInNyY1xcdHlwb3BvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTs7QUFFQSxPQUFPLE1BQVAsR0FBZ0IsRUFBQyx3Q0FBRCxFQUFrQix3REFBbEIsRUFBaEI7Ozs7Ozs7Ozs7O1FDa0ZnQix1QixHQUFBLHVCO1FBS0Esc0IsR0FBQSxzQjs7QUF6RmhCOzs7Ozs7QUFHQSxJQUFNLGdCQUFnQjtBQUNwQix3QkFBc0IsSUFERjtBQUVwQixjQUFZLElBRlE7QUFHcEIsZ0JBQWM7QUFDWix1QkFBbUIsQ0FBQyxlQUFELEVBQWtCLHFCQUFsQjtBQURQLEdBSE07QUFNcEI7QUFOb0IsQ0FBdEI7O0FBVUEsU0FBUyxNQUFULENBQWdCLEdBQWhCLEVBQXFCLFFBQXJCLEVBQStCO0FBQzdCLFNBQU8sT0FBTyxJQUFQLENBQVksR0FBWixFQUFpQixNQUFqQixDQUF3QixVQUFDLFNBQUQsRUFBWSxHQUFaLEVBQW9CO0FBQ2pELGNBQVUsR0FBVixJQUFpQixTQUFTLEdBQVQsRUFBYyxJQUFJLEdBQUosQ0FBZCxFQUF3QixHQUF4QixDQUFqQjtBQUNBLFdBQU8sU0FBUDtBQUNELEdBSE0sRUFHSixFQUhJLENBQVA7QUFJRDs7QUFFRCxTQUFTLFVBQVQsQ0FBb0IsUUFBcEIsRUFBOEI7QUFDNUIsU0FBTztBQUFBLFdBQU8sSUFBSSxRQUFKLENBQVA7QUFBQSxHQUFQO0FBQ0Q7O0FBRUQsU0FBUyx5QkFBVCxDQUFtQyx1QkFBbkMsRUFBNEQ7QUFDMUQsTUFBTSxrQkFBa0IsMkJBQTJCLEVBQW5EO0FBQ0EsTUFBTSx5QkFBeUIsY0FBYyxZQUFkLENBQS9CO0FBQ0EsU0FBTyxPQUFPLHNCQUFQLEVBQStCLFVB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LGFBQVMseUJBQXlCLE1BQXpCLENBQVQ7O0FBRUEsYUFBUyw2QkFBNkIsTUFBN0IsQ0FBVDs7QUFFQSxhQUFTLDJCQUEyQixNQUEzQixDQUFULENBdENvQyxDQXNDUztBQUM3QyxhQUFTLGlCQUFpQixnQkFBakIsQ0FBa0MsTUFBbEMsQ0FBVDs7QUFFQSxhQUFTLDhCQUE4QixNQUE5QixDQUFUOztBQUVBLFdBQU8sTUFBUDtBQUNELEdBNUNEO0FBNkNEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7Y3JlYXRlQ29ycmVjdG9yLCBnZXREZWZhdWx0Q29uZmlndXJhdGlvbn0gZnJvbSAnLi90eXBvcG8nO1xuXG53aW5kb3cuVHlwb3BvID0ge2NyZWF0ZUNvcnJlY3RvciwgZ2V0RGVmYXVsdENvbmZpZ3VyYXRpb259O1xuIiwiaW1wb3J0IHBhdHRlcm5zIGZyb20gJy4vcGF0dGVybnMnO1xuXG5cbmNvbnN0IGRlZmF1bHRWYWx1ZXMgPSB7XG4gICdyZW1vdmUtZW1wdHktbGluZXMnOiB0cnVlLFxuICAnbGFuZ3VhZ2UnOiAnZW4nLFxuICAnZXhjZXB0aW9ucyc6IHtcbiAgICBleGNlcHRpb25QYXR0ZXJuczogWyd3ZWJVcmxQYXR0ZXJuJywgJ2VtYWlsQWRkcmVzc1BhdHRlcm4nXSxcbiAgfSxcbiAgJ3BhdHRlcm5zJzogcGF0dGVybnMsXG59O1xuXG5cbmZ1bmN0aW9uIG9iak1hcChvYmosIGNhbGxiYWNrKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLnJlZHVjZSgoYWdncmVnYXRlLCBrZXkpID0+IHtcbiAgICBhZ2dyZWdhdGVba2V5XSA9IGNhbGxiYWNrKGtleSwgb2JqW2tleV0sIG9iaik7XG4gICAgcmV0dXJuIGFnZ3JlZ2F0ZTtcbiAgfSwge30pO1xufVxuXG5mdW5jdGlvbiByZXR1cm5Qcm9wKHByb3BOYW1lKSB7XG4gIHJldHVybiBvYmogPT4gb2JqW3Byb3BOYW1lXTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplRXhjZXB0aW9uc0NvbmZpZyhleGNlcHRpb25zQ29uZmlndXJhdGlvbikge1xuICBjb25zdCBleGNlcHRpb25Db25maWcgPSBleGNlcHRpb25zQ29uZmlndXJhdGlvbiB8fCB7fTtcbiAgY29uc3QgZXhjZXB0aW9uRGVmYXVsdFZhbHVlcyA9IGRlZmF1bHRWYWx1ZXNbJ2V4Y2VwdGlvbnMnXTtcbiAgcmV0dXJuIG9iak1hcChleGNlcHRpb25EZWZhdWx0VmFsdWVzLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgIGlmICh0eXBlb2YodmFsdWUpICE9PSB0eXBlb2YoZXhjZXB0aW9uQ29uZmlnW2tleV0pKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4Y2VwdGlvbkNvbmZpZ1trZXldO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZGVub3JtYWxpemVFeGNlcHRpb25zKGNvbmZpZykge1xuICBjb25zdCBleGNlcHRpb25QYXR0ZXJucyA9IGNvbmZpZy5leGNlcHRpb25zLmV4Y2VwdGlvblBhdHRlcm5zLm1hcChwYXR0ZXJuTmFtZSA9PiB7XG4gICAgaWYgKCFjb25maWcucGF0dGVybnNbcGF0dGVybk5hbWVdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4Y2VwdGlvbiBwYXR0ZXJuICR7cGF0dGVybk5hbWV9IGlzIG5vdCBpbiBjb25maWcucGF0dGVybnMuYCk7XG4gICAgfVxuICAgIHJldHVybiBjb25maWcucGF0dGVybnNbcGF0dGVybk5hbWVdO1xuICB9KTtcblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnLmV4Y2VwdGlvbnMsIHtleGNlcHRpb25QYXR0ZXJuc30pO1xufVxuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiAoYXJnKSA9PT0gJ3N0cmluZyc7XG59XG5cbmZ1bmN0aW9uIGlzU3RyaW5nTWFwKGFyZykge1xuICByZXR1cm4gKHR5cGVvZiAoYXJnKSA9PT0gJ29iamVjdCcpICYmIChPYmplY3Qua2V5cyhhcmcpLmV2ZXJ5KGtleSA9PiBpc1N0cmluZyhhcmdba2V5XSkpKTtcbn1cblxuZnVuY3Rpb24gdmVyaWZ5UGF0dGVybnNPYmplY3QocGF0dGVybnMpIHtcbiAgT2JqZWN0LmtleXMocGF0dGVybnMpLmZvckVhY2goKHBhdHRlcm5OYW1lKSA9PiB7XG4gICAgaWYgKCFpc1N0cmluZyhwYXR0ZXJuc1twYXR0ZXJuTmFtZV0pICYmICFpc1N0cmluZ01hcChwYXR0ZXJuc1twYXR0ZXJuTmFtZV0pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZSBwYXR0ZXJuICR7cGF0dGVybk5hbWV9IGluIGNvbmZpZ3VyYXRpb24gaXMgbmVpdGhlciBhIHN0cmluZyBub3IgYSBtYXAgb2Ygc3RyaW5ncy5gKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemVQYXR0ZXJucyhwYXR0ZXJuc0NvbmZpZ3VyYXRpb24pIHtcbiAgY29uc3QgcGF0dGVybnNDb25maWcgPSBwYXR0ZXJuc0NvbmZpZ3VyYXRpb24gfHwge307XG4gIHZlcmlmeVBhdHRlcm5zT2JqZWN0KHBhdHRlcm5zQ29uZmlnKTtcblxuICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdFZhbHVlc1sncGF0dGVybnMnXSwgcGF0dGVybnNDb25maWcpO1xufVxuXG5jb25zdCBjb25maWd1cmF0aW9uTm9ybWFsaXplciA9IHtcbiAgJ3JlbW92ZS1lbXB0eS1saW5lcyc6ICh2YWx1ZSkgPT4gdHlwZW9mKHZhbHVlKSA9PT0gdHlwZW9mKHRydWUpID8gdmFsdWUgOiBkZWZhdWx0VmFsdWVzWydyZW1vdmUtZW1wdHktbGluZXMnXSxcbiAgJ2xhbmd1YWdlJzogKHZhbHVlKSA9PiBbJ2VuJywgJ3NrJywgJ2NzJywgJ3J1ZSddLmluY2x1ZGVzKHZhbHVlKSA/IHZhbHVlIDogZGVmYXVsdFZhbHVlc1snbGFuZ3VhZ2UnXSxcbiAgJ3BhdHRlcm5zJzogbm9ybWFsaXplUGF0dGVybnMsXG4gICdleGNlcHRpb25zJzogbm9ybWFsaXplRXhjZXB0aW9uc0NvbmZpZyxcbn07XG5cbmNvbnN0IGNvbmZpZ3VyYXRpb25EZW5vcm1hbGl6ZXIgPSB7XG4gICdleGNlcHRpb25zJzogZGVub3JtYWxpemVFeGNlcHRpb25zLFxuICAncmVtb3ZlLWVtcHR5LWxpbmVzJzogcmV0dXJuUHJvcCgncmVtb3ZlLWVtcHR5LWxpbmVzJyksXG4gICdsYW5ndWFnZSc6IHJldHVyblByb3AoJ2xhbmd1YWdlJyksXG4gICdwYXR0ZXJucyc6IHJldHVyblByb3AoJ3BhdHRlcm5zJyksXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdENvbmZpZ3VyYXRpb24oKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0VmFsdWVzKTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQ29uZmlndXJhdGlvbihjb25maWd1cmF0aW9uKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGNvbmZpZ3VyYXRpb24gfHwge307XG4gIGNvbnN0IG5vcm1hbGl6ZWRDb25maWcgPSBvYmpNYXAoY29uZmlndXJhdGlvbk5vcm1hbGl6ZXIsIChrZXksIG5vcm1hbGl6ZSkgPT4gbm9ybWFsaXplKGNvbmZpZ1trZXldKSk7XG4gIGNvbnN0IGRlbm9ybWFsaXplZENvbmZpZyA9IG9iak1hcChjb25maWd1cmF0aW9uRGVub3JtYWxpemVyLCAoa2V5LCBkZW5vcm1hbGl6ZSkgPT4gZGVub3JtYWxpemUobm9ybWFsaXplZENvbmZpZykpO1xuXG4gIHJldHVybiBkZW5vcm1hbGl6ZWRDb25maWc7XG59XG4iLCIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXFxcbiBFeGNlcHRpb25zXG4gXFwqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuLypcbiBJZGVudGlmaWVzIGV4Y2VwdGlvbnMgdGhhdCB3aWxsIGJlIG9taXR0ZWQgZnJvbSBjb3JyZWN0aW9uIG9mIGFueSBzb3J0XG5cbiBBbGdvcml0aG1cbiBbMV0gSWRlbnRpZnkgZW1haWwgYWRkcmVzc2VzXG4gWzJdIElkZW50aWZ5IHdlYiBVUkxzIGFuZCBJUHNcbiBbM10gTWFyayB0aGVtIGFzIHRlbXBvcmFyeSBleGNlcHRpb25zIGluIGZvcm1hdCB7e3R5cG9wb19fZXhjZXB0aW9uLVtpXX19XG5cbiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgdGV4dCBmb3IgaWRlbnRpZmljYXRpb24gb2YgZXhjZXB0aW9uc1xuIEByZXR1cm5zIHtzdHJpbmd9IOKAlCBvdXRwdXQgd2l0aCBpZGVudGlmaWVkIGV4Y2VwdGlvbnMgaW4gZm9ybWF0IHt7dHlwb3BvX19leGNlcHRpb24tW2ldfX1cbiAqL1xuZnVuY3Rpb24gaWRlbnRpZnlfZXhjZXB0aW9ucyhzdHJpbmcpIHtcbiAgdGhpcy5jb25maWcuZXhjZXB0aW9uUGF0dGVybnMuZm9yRWFjaChwYXR0ZXJuID0+IHtcbiAgICBpZGVudGlmeV9leGNlcHRpb25fc2V0LmNhbGwodGhpcywgc3RyaW5nLCBwYXR0ZXJuKTtcbiAgfSk7XG5cbiAgLyogWzNdIE1hcmsgdGhlbSBhcyB0ZW1wb3JhcnkgZXhjZXB0aW9ucyBpbiBmb3JtYXQge3t0eXBvcG9fX2V4Y2VwdGlvbi1baV19fSAqL1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZXhjZXB0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gXCJ7e3R5cG9wb19fZXhjZXB0aW9uLVwiICsgaSArIFwifX1cIjtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSh0aGlzLmV4Y2VwdGlvbnNbaV0sIHJlcGxhY2VtZW50KTtcbiAgfVxuXG4gIHJldHVybiBzdHJpbmc7XG59XG5cblxuLypcbiBJZGVudGlmaWVzIHNldCBvZiBleGNlcHRpb25zIGZvciBnaXZlbiBwYXR0ZXJuXG4gVXNlZCBhcyBoZWxwZXIgZnVuY3Rpb24gZm9yIGlkZW50aWZ5X2V4Y2VwdGlvbnMoc3RyaW5nKVxuXG4gQHBhcmFtIHtzdHJpbmd9IGlucHV0IHRleHQgZm9yIGlkZW50aWZpY2F0aW9uIG9mIGV4Y2VwdGlvbnNcbiBAcGFyYW0ge3BhdHRlcm59IHJlZ3VsYXIgZXhwcmVzc2lvbiBwYXR0ZXJuIHRvIG1hdGNoIGV4Y2VwdGlvblxuICovXG5mdW5jdGlvbiBpZGVudGlmeV9leGNlcHRpb25fc2V0KHN0cmluZywgcGF0dGVybikge1xuICBjb25zdCByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICBjb25zdCBtYXRjaGVkX2V4Y2VwdGlvbnMgPSBzdHJpbmcubWF0Y2gocmUpO1xuICBpZiAobWF0Y2hlZF9leGNlcHRpb25zICE9IG51bGwpIHtcbiAgICB0aGlzLmV4Y2VwdGlvbnMgPSB0aGlzLmV4Y2VwdGlvbnMuY29uY2F0KG1hdGNoZWRfZXhjZXB0aW9ucyk7XG4gIH1cbn1cblxuXG4vKlxuIFJlcGxhY2VzIGlkZW50aWZpZWQgZXhjZXB0aW9ucyB3aXRoIHJlYWwgb25lcyBieSBjaGFuZ2UgdGhlaXJcbiB0ZW1wb3JhcnkgcmVwcmVzZW50YXRpb24gaW4gZm9ybWF0IHt7dHlwb3BvX19leGNlcHRpb24tW2ldfX0gd2l0aCBpdHNcbiBjb3JyZXNwb25kaW5nIHJlcHJlc2VudGF0aW9uXG5cbiBAcGFyYW0ge3N0cmluZ30gaW5wdXQgdGV4dCB3aXRoIGlkZW50aWZpZWQgZXhjZXB0aW9uc1xuIEByZXR1cm5zIHtzdHJpbmd9IG91dHB1dCB3aXRoIHBsYWNlZCBleGNlcHRpb25zXG4gKi9cbmZ1bmN0aW9uIHBsYWNlX2V4Y2VwdGlvbnMoc3RyaW5nKSB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5leGNlcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IFwie3t0eXBvcG9fX2V4Y2VwdGlvbi1cIiArIGkgKyBcIn19XCI7XG4gICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICBjb25zdCByZXBsYWNlbWVudCA9IHRoaXMuZXhjZXB0aW9uc1tpXTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgcmVwbGFjZW1lbnQpO1xuICB9XG5cbiAgcmV0dXJuIHN0cmluZztcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRFeGNlcHRpb25IYW5kbGVyKGNvbmZpZykge1xuICByZXR1cm4ge1xuICAgIGV4Y2VwdGlvbnM6IFtdLFxuICAgIGlkZW50aWZ5X2V4Y2VwdGlvbnMsXG4gICAgcGxhY2VfZXhjZXB0aW9ucyxcbiAgICBjb25maWcsXG4gIH07XG59XG4iLCIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qXFxcbiBWYXJpYWJsZXMgJiBDaGFyYWN0ZXIgcmVwbGFjZW1lbnQgc2V0c1xuIFxcKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5jb25zdCBlc3NlbnRpYWxTZXQgPSB7XG4gIFwiXFxcXChDXFxcXClcIjogXCLCqVwiLFxuICBcIlxcXFwoY1xcXFwpXCI6IFwiwqlcIixcbiAgXCJcXFxcKFJcXFxcKVwiOiBcIsKuXCIsXG4gIFwiXFxcXChyXFxcXClcIjogXCLCrlwiLFxuICBcIlxcXFwoVE1cXFxcKVwiOiBcIuKEolwiLFxuICBcIlxcXFwodG1cXFxcKVwiOiBcIuKEolwiLFxuICBcIlxcXFwrXFxcXC1cIjogXCLCsVwiLFxuICBcIlxcXFwtXFxcXCtcIjogXCLCsVwiLFxufTtcbmNvbnN0IG5vbkxhdGluTG93ZXJjYXNlID0gXCLDocOkxI3Ej8OpxJvDrcS6xL7FiMOzw7TDtsWRxZXFmcWhxaXDusO8xbHFr8O9xb7QsNCx0LLQs9KR0LTQtdC30ZbQuNC50LrQu9C80L3QvtC/0YDRgdGC0YPRhNGK0YvRjNGG0YfQttGI0ZfRidGR0ZTRjtGP0YVcIjtcbmNvbnN0IG5vbkxhdGluVXBwZXJjYXNlID0gXCLDgcOExIzEjsOJxJrDjcS5xL3Fh8OTw5TDlsWQxZTFmMWgxaTDmsOcxbDFrsOdxb3QkNCR0JLQk9KQ0JTQldCX0IbQmNCZ0JrQm9Cc0J3QntCf0KDQodCi0KPQpNCq0KvQrNCm0KfQltCo0IfQqdCB0ITQrtCv0KVcIjtcbmNvbnN0IG5vbkxhdGluQ2hhcnMgPSBub25MYXRpbkxvd2VyY2FzZSArIG5vbkxhdGluVXBwZXJjYXNlO1xuY29uc3QgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgPSBcImEtelwiICsgbm9uTGF0aW5Mb3dlcmNhc2U7XG5jb25zdCB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZSA9IFwiQS1aXCIgKyBub25MYXRpblVwcGVyY2FzZTtcbmNvbnN0IGFsbENoYXJzID0gbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZTtcbi8qXG4gKDM5KVx0XHRcdGR1bWIgc2luZ2xlIHF1b3RlXG4gKDgyMTYpXHRcdGxlZnQgc2luZ2xlIHF1b3RhdGlvbiBtYXJrXG4gKDgyMTcpXHRcdHJpZ2h0IHNpbmdsZSBxdW90YXRpb24gbWFya1xuICg3MDApXHRcdG1vZGlmaWVyIGxldHRlciBhcG9zdHJvcGhlOyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Nb2RpZmllcl9sZXR0ZXJfYXBvc3Ryb3BoZVxuICg4MjE5KVx0XHRzaW5nbGUgaGlnaC1yZXZlcnNlZC05IHF1b3RhdGlvbiBtYXJrXG4gKDgyNDIpXHRcdHByaW1lXG4gKDgyNDkpXHRcdHNpbmdsZSBsZWZ0LXBvaW50aW5nIGFuZ2xlIHF1b3RhdGlvbiBtYXJrXG4gKDgyNTApXHRcdHNpbmdsZSByaWdodC1wb2ludGluZyBhbmdsZSBxdW90YXRpb24gbWFya1xuICovXG5jb25zdCBzaW5nbGVRdW90ZUFkZXB0cyA9IFwi4oCafCd84oCYfOKAmXzKvHzigJt84oCyfOKAuXzigLpcIjtcbmNvbnN0IGRvdWJsZVF1b3RlQWRlcHRzID0gXCLigJ584oCcfOKAnXxcXFwifMKrfMK7fOKAs3wsezIsfXzigJh7Mix9fOKAmXsyLH18J3syLH184oC5ezIsfXzigLp7Mix9fOKAsnsyLH1cIjtcbmNvbnN0IHNwYWNlID0gXCIgXCI7XG5jb25zdCBuYnNwID0gXCLCoFwiO1xuY29uc3QgaGFpclNwYWNlID0gXCLigIpcIjsgLy8mIzgyMDI7XG5jb25zdCBuYXJyb3dOYnNwID0gXCLigK9cIjsgLy8mIzgyMzk7XG5jb25zdCBzcGFjZXMgPSBzcGFjZSArIG5ic3AgKyBoYWlyU3BhY2UgKyBuYXJyb3dOYnNwO1xuY29uc3QgdGVybWluYWxQdW5jdHVhdGlvbiA9IFwiXFwuXFwhXFw/XCI7XG5jb25zdCBzZW50ZW5jZVB1bmN0dWF0aW9uID0gXCJcXCxcXDpcXDtcIiArIHRlcm1pbmFsUHVuY3R1YXRpb247IC8vIHRoZXJlIGlzIG5vIGVsbGlwc2lzIGluIHRoZSBzZXQgYXMgaXQgaXMgYmVpbmcgdXNlZCB0aHJvdWdob3V0IGEgc2VudGVuY2UgaW4gdGhlIG1pZGRsZS4gUmV0aGluayB0aGlzIGdyb3VwIHRvIHNwbGl0IGl0IGludG8gZW5kLXNlbnRlbmNlIHB1bmN0dWF0aW9uIGFuZCBtaWRkbGUgc2VudGVuY2UgcHVuY3R1YXRpb25cbmNvbnN0IG9wZW5pbmdCcmFja2V0cyA9IFwiXFxcXChcXFxcW1xcXFx7XCI7XG5jb25zdCBjbG9zaW5nQnJhY2tldHMgPSBcIlxcXFwpXFxcXF1cXFxcfVwiO1xuY29uc3QgZWxsaXBzaXMgPSBcIuKAplwiO1xuY29uc3QgZGVncmVlID0gXCLCsFwiO1xuXG4vKlxuIFNvdXJjZSBmb3Igd2ViVXJsUGF0dGVybiwgZW1haWxBZGRyZXNzUGF0dGVyblxuIGh0dHA6Ly9ncmVwY29kZS5jb20vZmlsZS9yZXBvc2l0b3J5LmdyZXBjb2RlLmNvbS9qYXZhL2V4dC9jb20uZ29vZ2xlLmFuZHJvaWQvYW5kcm9pZC8yLjBfcjEvYW5kcm9pZC90ZXh0L3V0aWwvUmVnZXguamF2YSNSZWdleC4wV0VCX1VSTF9QQVRURVJOXG4gKi9cbmNvbnN0IHdlYlVybFBhdHRlcm4gPSBcIigoPzooaHR0cHxodHRwc3xIdHRwfEh0dHBzfHJ0c3B8UnRzcCk6XFxcXC9cXFxcLyg/Oig/OlthLXpBLVowLTlcXFxcJFxcXFwtXFxcXF9cXFxcLlxcXFwrXFxcXCFcXFxcKlxcXFwnXFxcXChcXFxcKVwiICtcbiAgXCJcXFxcLFxcXFw7XFxcXD9cXFxcJlxcXFw9XXwoPzpcXFxcJVthLWZBLUYwLTldezJ9KSl7MSw2NH0oPzpcXFxcOig/OlthLXpBLVowLTlcXFxcJFxcXFwtXFxcXF9cIiArXG4gIFwiXFxcXC5cXFxcK1xcXFwhXFxcXCpcXFxcJ1xcXFwoXFxcXClcXFxcLFxcXFw7XFxcXD9cXFxcJlxcXFw9XXwoPzpcXFxcJVthLWZBLUYwLTldezJ9KSl7MSwyNX0pP1xcXFxAKT8pP1wiICtcbiAgXCIoKD86KD86W2EtekEtWjAtOV1bYS16QS1aMC05XFxcXC1dezAsNjR9XFxcXC4pK1wiICsgIC8vIG5hbWVkIGhvc3RcbiAgXCIoPzpcIiArIC8vIHBsdXMgdG9wIGxldmVsIGRvbWFpblxuICBcIig/OmFlcm98YXJwYXxhc2lhfGFbY2RlZmdpbG1ub3Fyc3R1d3h6XSlcIiArXG4gIFwifCg/OmJpenxiW2FiZGVmZ2hpam1ub3JzdHZ3eXpdKVwiICtcbiAgXCJ8KD86Y2F0fGNvbXxjb29wfGNbYWNkZmdoaWtsbW5vcnV2eHl6XSlcIiArXG4gIFwifGRbZWprbW96XVwiICtcbiAgXCJ8KD86ZWR1fGVbY2VncnN0dV0pXCIgK1xuICBcInxmW2lqa21vcl1cIiArXG4gIFwifCg/OmdvdnxnW2FiZGVmZ2hpbG1ucHFyc3R1d3ldKVwiICtcbiAgXCJ8aFtrbW5ydHVdXCIgK1xuICBcInwoPzppbmZvfGludHxpW2RlbG1ub3Fyc3RdKVwiICtcbiAgXCJ8KD86am9ic3xqW2Vtb3BdKVwiICtcbiAgXCJ8a1tlZ2hpbW5yd3l6XVwiICtcbiAgXCJ8bFthYmNpa3JzdHV2eV1cIiArXG4gIFwifCg/Om1pbHxtb2JpfG11c2V1bXxtW2FjZGdoa2xtbm9wcXJzdHV2d3h5el0pXCIgK1xuICBcInwoPzpuYW1lfG5ldHxuW2FjZWZnaWxvcHJ1el0pXCIgK1xuICBcInwoPzpvcmd8b20pXCIgK1xuICBcInwoPzpwcm98cFthZWZnaGtsbW5yc3R3eV0pXCIgK1xuICBcInxxYVwiICtcbiAgXCJ8cltlb3V3XVwiICtcbiAgXCJ8c1thYmNkZWdoaWprbG1ub3J0dXZ5el1cIiArXG4gIFwifCg/OnRlbHx0cmF2ZWx8dFtjZGZnaGprbG1ub3BydHZ3el0pXCIgK1xuICBcInx1W2Fna21zeXpdXCIgK1xuICBcInx2W2FjZWdpbnVdXCIgK1xuICBcInx3W2ZzXVwiICtcbiAgXCJ8eVtldHVdXCIgK1xuICBcInx6W2Ftd10pKVwiICtcbiAgXCJ8KD86KD86MjVbMC01XXwyWzAtNF1cIiArIC8vIG9yIGlwIGFkZHJlc3NcbiAgXCJbMC05XXxbMC0xXVswLTldezJ9fFsxLTldWzAtOV18WzEtOV0pXFxcXC4oPzoyNVswLTVdfDJbMC00XVswLTldXCIgK1xuICBcInxbMC0xXVswLTldezJ9fFsxLTldWzAtOV18WzEtOV18MClcXFxcLig/OjI1WzAtNV18MlswLTRdWzAtOV18WzAtMV1cIiArXG4gIFwiWzAtOV17Mn18WzEtOV1bMC05XXxbMS05XXwwKVxcXFwuKD86MjVbMC01XXwyWzAtNF1bMC05XXxbMC0xXVswLTldezJ9XCIgK1xuICBcInxbMS05XVswLTldfFswLTldKSkpXCIgK1xuICBcIig/OlxcXFw6XFxcXGR7MSw1fSk/KVwiICsgLy8gcGx1cyBvcHRpb24gcG9ydCBudW1iZXIgK1xuICBcIihcXFxcLyg/Oig/OlthLXpBLVowLTlcXFxcO1xcXFwvXFxcXD9cXFxcOlxcXFxAXFxcXCZcXFxcPVxcXFwjXFxcXH5cIiArIC8vIHBsdXMgb3B0aW9uIHF1ZXJ5IHBhcmFtc1xuICBcIlxcXFwtXFxcXC5cXFxcK1xcXFwhXFxcXCpcXFxcJ1xcXFwoXFxcXClcXFxcLFxcXFxfXSl8KD86XFxcXCVbYS1mQS1GMC05XXsyfSkpKik/XCIgK1xuICBcIig/OlxcXFxifCQpXCI7IC8vIGFuZCBmaW5hbGx5LCBhIHdvcmQgYm91bmRhcnkgb3IgZW5kIG9mXG4vLyBpbnB1dC4gIFRoaXMgaXMgdG8gc3RvcCBmb28uc3VyZSBmcm9tXG4vLyBtYXRjaGluZyBhcyBmb28uc3VcblxuXG5jb25zdCBlbWFpbEFkZHJlc3NQYXR0ZXJuID0gXCJbYS16QS1aMC05XFxcXCtcXFxcLlxcXFxfXFxcXCVcXFxcLV17MSwyNTZ9XCIgK1xuICBcIlxcXFxAXCIgK1xuICBcIlthLXpBLVowLTldW2EtekEtWjAtOVxcXFwtXXswLDY0fVwiICtcbiAgXCIoXCIgK1xuICBcIlxcXFwuXCIgK1xuICBcIlthLXpBLVowLTldW2EtekEtWjAtOVxcXFwtXXswLDI1fVwiICtcbiAgXCIpK1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGVzc2VudGlhbFNldCxcbiAgbm9uTGF0aW5Mb3dlcmNhc2UsXG4gIG5vbkxhdGluVXBwZXJjYXNlLFxuICBub25MYXRpbkNoYXJzLFxuICBsb3dlcmNhc2VDaGFyc0VuU2tDelJ1ZSxcbiAgdXBwZXJjYXNlQ2hhcnNFblNrQ3pSdWUsXG4gIGFsbENoYXJzLFxuICBzaW5nbGVRdW90ZUFkZXB0cyxcbiAgZG91YmxlUXVvdGVBZGVwdHMsXG4gIHNwYWNlLFxuICBuYnNwLFxuICBoYWlyU3BhY2UsXG4gIG5hcnJvd05ic3AsXG4gIHNwYWNlcyxcbiAgdGVybWluYWxQdW5jdHVhdGlvbixcbiAgc2VudGVuY2VQdW5jdHVhdGlvbixcbiAgb3BlbmluZ0JyYWNrZXRzLFxuICBjbG9zaW5nQnJhY2tldHMsXG4gIGVsbGlwc2lzLFxuICBkZWdyZWUsXG4gIHdlYlVybFBhdHRlcm4sXG4gIGVtYWlsQWRkcmVzc1BhdHRlcm4sXG59XG4iLCIvKiFcbiAqIFR5cG9wbyAxLjQuMFxuICpcbiAqIENvcHlyaWdodCAyMDE1LTE3IEJyYcWIbyDFoGFuZGFsYVxuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKlxuICogRGF0ZTogMjAxNy0wMS0xNVxuICovXG5cbmltcG9ydCB7bm9ybWFsaXplQ29uZmlndXJhdGlvbn0gZnJvbSAnLi9jb25maWd1cmF0aW9uJztcbmltcG9ydCBnZXRFeGNlcHRpb25IYW5kbGVyIGZyb20gJy4vbW9kdWxlcy9leGNlcHRpb25zJztcblxuZXhwb3J0IHtnZXREZWZhdWx0Q29uZmlndXJhdGlvbn0gZnJvbSAnLi9jb25maWd1cmF0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvcnJlY3Rvcihjb25maWd1cmF0aW9uKSB7XG4gIGNvbnN0IGNvbmZpZyA9IG5vcm1hbGl6ZUNvbmZpZ3VyYXRpb24oY29uZmlndXJhdGlvbik7XG4gIGNvbnN0IHtcbiAgICBlc3NlbnRpYWxTZXQsXG4gICAgbm9uTGF0aW5DaGFycyxcbiAgICBsb3dlcmNhc2VDaGFyc0VuU2tDelJ1ZSxcbiAgICB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZSxcbiAgICBzaW5nbGVRdW90ZUFkZXB0cyxcbiAgICBkb3VibGVRdW90ZUFkZXB0cyxcbiAgICBuYnNwLFxuICAgIGhhaXJTcGFjZSxcbiAgICBuYXJyb3dOYnNwLFxuICAgIHNwYWNlcyxcbiAgICB0ZXJtaW5hbFB1bmN0dWF0aW9uLFxuICAgIHNlbnRlbmNlUHVuY3R1YXRpb24sXG4gICAgb3BlbmluZ0JyYWNrZXRzLFxuICAgIGNsb3NpbmdCcmFja2V0cyxcbiAgICBlbGxpcHNpcyxcbiAgICBkZWdyZWUsXG4gIH0gPSBjb25maWcucGF0dGVybnM7XG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxcXG4gICBFc3NlbnRpYWwgcmVwbGFjZW1lbnRzXG4gICBcXCotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICBmdW5jdGlvbiByZXBsYWNlX3N5bWJvbHMoc3RyaW5nKSB7XG4gICAgZm9yIChjb25zdCBydWxlIGluIGVzc2VudGlhbFNldCkge1xuICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHJ1bGUsIFwiZ1wiKTtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCBlc3NlbnRpYWxTZXRbcnVsZV0pO1xuICAgIH1cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG5cblxuICBmdW5jdGlvbiByZXBsYWNlX3BlcmlvZHNfd2l0aF9lbGxpcHNpcyhzdHJpbmcpIHtcbiAgICAvKiBbMV0gcmVwbGFjZSAzIGFuZCBtb3JlIGRvdHMgd2l0aCBhbiBlbGxpcHNpcyAqL1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC9cXC57Myx9L2csIFwi4oCmXCIpO1xuXG4gICAgLyogWzJdIHJlcGxhY2UgMiBkb3RzIGluIHRoZSBtaWRkbGUgb2YgdGhlIHNlbnRlbmNlIHdpdGggYW4gYXBvc2lvcGVzaXMgKi9cbiAgICBjb25zdCBwYXR0ZXJuID0gXCJbXCIgKyBzcGFjZXMgKyBcIl1cXFxcLnsyfVtcIiArIHNwYWNlcyArIFwiXVwiO1xuICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwiIOKApiBcIik7XG5cbiAgICAvKiBbM10gcmVwbGFjZSAyIGRvdHMgYXQgdGhlIGVuZCBvZiB0aGUgc2VudGVuY2Ugd2l0aCBmdWxsIHN0b3AgKi9cbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFwuezJ9L2csIFwiLlwiKTtcblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHJlbW92ZV9tdWx0aXBsZV9zcGFjZXMoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8gezIsfS9nLCBcIiBcIik7XG4gIH1cblxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcXFxuICAgUXVvdGVzLCBwcmltZXMgJiBhcG9zdHJvcGhlc1xuICAgXFwqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuICAvKlxuICAgQ29ycmVjdHMgaW1wcm9wZXIgdXNlIG9mIGRvdWJsZSBxdW90ZXMgYW5kIGRvdWJsZSBwcmltZXNcblxuICAgQXNzdW1wdGlvbnMgYW5kIExpbWl0YXRpb25zXG4gICBUaGlzIGZ1bmN0aW9uIGFzc3VtZXMgdGhhdCBkb3VibGUgcXVvdGVzIGFyZSBhbHdheXMgdXNlZCBpbiBwYWlyLFxuICAgaS5lLiBhdXRob3JzIGRpZCBub3QgZm9yZ2V0IHRvIGNsb3NlIGRvdWJsZSBxdW90ZXMgaW4gdGhlaXIgdGV4dC5cblxuICAgQWxnb3JpdGhtXG4gICBbMF0gUmVtb3ZlIGV4dHJhIHRlcm1pbmFsIHB1bmN0dWF0aW9uIGFyb3VuZCBkb3VibGUgcXVvdGVzXG4gICBbMV0gU3dhcCByaWdodCBkb3VibGUgcXVvdGUgYWRlcHRzIHdpdGggYSBwdW5jdHVhdGlvblxuICAgKHRoaXMgY29tZXMgZmlyc3QgYXMgaXQgaXMgYSBxdWl0ZSBjb21tb24gbWlzdGFrZSB0aGF0IG1heSBldmVudHVhbGx5XG4gICBsZWFkIHRvIGltcHJvcGVyIGlkZW50aWZpY2F0aW9uIG9mIGRvdWJsZSBwcmltZXMpXG4gICBbMl0gSWRlbnRpZnkgaW5jaGVzLCBhcmNzZWNvbmRzLCBzZWNvbmRzXG4gICBbM10gSWRlbnRpZnkgY2xvc2VkIGRvdWJsZSBxdW90ZXNcbiAgIFs0XSBJZGVudGlmeSB0aGUgcmVzdCBhcyB1bmNsb3NlZCBkb3VibGUgcXVvdGVzIChiZXN0LWVmZm9ydCByZXBsYWNlbWVudClcbiAgIFs1XSBGaXggc3BhY2luZyBhcm91bmQgcXVvdGVzIGFuZCBwcmltZXNcbiAgIFs2XSBTd2FwIGJhY2sgc29tZSBvZiB0aGUgZG91YmxlIHF1b3RlcyB3aXRoIGEgcHVuY3R1YXRpb25cbiAgIFs3XSBSZW1vdmUgZXh0cmEgcHVuY3R1YXRpb24gYXJvdW5kIHF1b3Rlc1xuICAgWzhdIFJlcGxhY2UgYWxsIGlkZW50aWZpZWQgcHVuY3R1YXRpb24gd2l0aCBhcHByb3ByaWF0ZSBwdW5jdHVhdGlvbiBpblxuICAgZ2l2ZW4gbGFuZ3VhZ2VcblxuICAgQHBhcmFtIHtzdHJpbmd9IHN0cmluZyDigJQgaW5wdXQgdGV4dCBmb3IgaWRlbnRpZmljYXRpb25cbiAgIEBwYXJhbSB7c3RyaW5nfSBsYW5ndWFnZSDigJQgbGFuZ3VhZ2Ugb3B0aW9uXG4gICBAcmV0dXJucyB7c3RyaW5nfSBvdXRwdXQgd2l0aCBwcm9wZXJseSByZXBsYWNlcyBkb3VibGUgcXVvdGVzIGFuZCBkb3VibGUgcHJpbWVzXG4gICAqL1xuICBmdW5jdGlvbiBjb3JyZWN0X2RvdWJsZV9xdW90ZXNfYW5kX3ByaW1lcyhzdHJpbmcsIGxhbmd1YWdlKSB7XG5cbiAgICAvKiBbMF0gUmVtb3ZlIGV4dHJhIHRlcm1pbmFsIHB1bmN0dWF0aW9uIGFyb3VuZCBkb3VibGUgcXVvdGVzXG4gICAgIGUuZy4g4oCcV2Ugd2lsbCBjb250aW51ZSB0b21vcnJvdy7igJ0uICovXG4gICAgbGV0IHBhdHRlcm4gPSBcIihbXCIgKyBzZW50ZW5jZVB1bmN0dWF0aW9uICsgXCJdKShcIiArIGRvdWJsZVF1b3RlQWRlcHRzICsgXCIpKFtcIiArIHNlbnRlbmNlUHVuY3R1YXRpb24gKyBcIl0pXCI7XG4gICAgbGV0IHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDEkMlwiKTtcblxuICAgIC8qIFsxXSBTd2FwIHJpZ2h0IGRvdWJsZSBxdW90ZSBhZGVwdHMgd2l0aCBhIHRlcm1pbmFsIHB1bmN0dWF0aW9uICovXG4gICAgcGF0dGVybiA9IFwiKFwiICsgZG91YmxlUXVvdGVBZGVwdHMgKyBcIikoW1wiICsgdGVybWluYWxQdW5jdHVhdGlvbiArIFwiXSlcIjtcbiAgICByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCAnJDIkMScpO1xuXG4gICAgLyogWzJdIElkZW50aWZ5IGluY2hlcywgYXJjc2Vjb25kcywgc2Vjb25kc1xuICAgICBOb3RlOiB3ZeKAmXJlIG5vdCB1c2luZyBkb3VibGVfcXVvdGVfYWRlcHRzIHZhcmlhYmxlXG4gICAgIGFzIGNvbW1hcyBhbmQgbG93LXBvc2l0aW9uZWQgcXVvdGVzIGFyZSBvbWl0dGVkKi9cbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvKFxcZCA/KSjigJx84oCdfFwifOKAs3zigJh7Mix9fOKAmXsyLH18J3syLH184oCyezIsfSkvZywgXCIkMXt7dHlwb3BvX19kb3VibGUtcHJpbWV9fVwiKTtcblxuXG4gICAgLyogWzNdIElkZW50aWZ5IGNsb3NlZCBkb3VibGUgcXVvdGVzICovXG4gICAgcGF0dGVybiA9IFwiKFwiICsgZG91YmxlUXVvdGVBZGVwdHMgKyBcIikoLio/KShcIiArIGRvdWJsZVF1b3RlQWRlcHRzICsgXCIpXCI7XG4gICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgXCJ7e3R5cG9wb19fbGVmdC1kb3VibGUtcXVvdGV9fSQye3t0eXBvcG9fX3JpZ2h0LWRvdWJsZS1xdW90ZX19XCIpO1xuXG5cbiAgICAvKiBbNC4xXSBJZGVudGlmeSB1bmNsb3NlZCBsZWZ0IGRvdWJsZSBxdW90ZSAqL1xuICAgIHBhdHRlcm4gPSBcIihcIiArIGRvdWJsZVF1b3RlQWRlcHRzICsgXCIpKFtcIiArIGxvd2VyY2FzZUNoYXJzRW5Ta0N6UnVlICsgdXBwZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl0pXCI7XG4gICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgXCJ7e3R5cG9wb19fbGVmdC1kb3VibGUtcXVvdGV9fSQyXCIpO1xuXG5cbiAgICAvKiBbNC4yXSBJZGVudGlmeSB1bmNsb3NlZCByaWdodCBkb3VibGUgcXVvdGUgKi9cbiAgICBwYXR0ZXJuID0gXCIoW1wiICsgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIHNlbnRlbmNlUHVuY3R1YXRpb24gKyBlbGxpcHNpcyArIFwiXSkoXCIgKyBkb3VibGVRdW90ZUFkZXB0cyArIFwiKVwiO1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDF7e3R5cG9wb19fcmlnaHQtZG91YmxlLXF1b3RlfX1cIik7XG5cblxuICAgIC8qIFs0LjNdIFJlbW92ZSByZW1haW5pbmcgdW5pZGVudGlmaWVkIGRvdWJsZSBxdW90ZSAqL1xuICAgIHBhdHRlcm4gPSBcIihbXCIgKyBzcGFjZXMgKyBcIl0pKFwiICsgZG91YmxlUXVvdGVBZGVwdHMgKyBcIikoW1wiICsgc3BhY2VzICsgXCJdKVwiO1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDEkM1wiKTtcblxuXG4gICAgLyogWzVdIEZpeCBzcGFjaW5nIGFyb3VuZCBxdW90ZXMgYW5kIHByaW1lICovXG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLyhcXHtcXHt0eXBvcG9fX2xlZnQtZG91YmxlLXF1b3RlfX0pKCApL2csIFwiJDFcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLyggKShcXHtcXHt0eXBvcG9fX3JpZ2h0LWRvdWJsZS1xdW90ZX19KS9nLCBcIiQyXCIpO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC8oICkoXFx7XFx7dHlwb3BvX19kb3VibGUtcHJpbWV9fSkvZywgXCIkMlwiKTtcblxuXG4gICAgLyogWzZdIFN3YXAgYmFjayBzb21lIG9mIHRoZSBkb3VibGUgcXVvdGVzIHdpdGggYSBwdW5jdHVhdGlvblxuXG4gICAgIElkZWFcbiAgICAgSW4gWzFdIHdlIGhhdmUgc3dhcHBlZCBhbGwgZG91YmxlIHJpZ2h0IHF1b3RlcyBieSBkZWZhdWx0IHdpdGggYSB0ZXJtaW5hbFxuICAgICBwdW5jdHVhdGlvbi4gSG93ZXZlciwgbm90IGFsbCBkb3VibGUgcXVvdGVzIHdyYXAgdGhlIHdob2xlIHNlbnRlbmNlIGFuZFxuICAgICB0aGVyZSBhcmUgY2FzZXMgd2hlbiBmZXcgd29yZHMgYXJlIHF1b3RlZCB3aXRoaW4gYSBzZW50ZW5jZS4gVGFrZSBhIGxvb2sgYXRcbiAgICAgZXhhbXBsZXM6XG4gICAgIOKAnFNlbnRlbmNlIHF1b3RlZCBhcyBhIHdob2xlLuKAnSAoZnVsbCBzdG9wIGlzIHBsYWNlZCB3aXRoaW4gZG91YmxlIHF1b3RlcylcbiAgICAgVGhpcyBpcyDigJxxdW90ZWQgZXhwcmVzc2lvbi7igJ0gKGZ1bGwgc3RvcCBpcyBwbGFjZWQgb3V0c2lkZSBkb3VibGUgcXVvdGVzKVxuXG4gICAgIEFsZ29yaXRobVxuICAgICBNYXRjaCBhbGwgdGhlIGRvdWJsZSBxdW90ZSBwYWlycyB0aGF0IGRvIG5vdCBwcmVjZWRlIHNlbnRlbmNlIHB1bmN0dWF0aW9uXG4gICAgIChhbmQgdGh1cyBtdXN0IGJlIHVzZWQgd2l0aGluIGEgc2VudGVuY2UpIGFuZCBzd2FwIHJpZ2h0IGRvdWJsZSB3aXRoXG4gICAgIGEgdGVybWluYWwgcHVuY3R1YXRpb24uXG4gICAgICovXG4gICAgcGF0dGVybiA9IFwiKFteXCIgKyBzZW50ZW5jZVB1bmN0dWF0aW9uICsgXCJdW1wiICsgc3BhY2VzICsgXCJde3t0eXBvcG9fX2xlZnQtZG91YmxlLXF1b3RlfX0uKz8pKFtcIiArIHRlcm1pbmFsUHVuY3R1YXRpb24gKyBcIl0pKHt7dHlwb3BvX19yaWdodC1kb3VibGUtcXVvdGV9fSlcIjtcbiAgICAvLyBjb25zb2xlLmxvZyhwYXR0ZXJuKTtcbiAgICByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCBcIiQxJDMkMlwiKTtcblxuXG4gICAgLyogWzddIFJlbW92ZSBleHRyYSBjb21tYSBhZnRlciBwdW5jdHVhdGlvbiBpbiBkaXJlY3Qgc3BlZWNoLFxuICAgICBlLmcuIFwi4oCcSGV5ISzigJ0gc2hlIHNhaWRcIiAqL1xuICAgIHBhdHRlcm4gPSBcIihbXCIgKyBzZW50ZW5jZVB1bmN0dWF0aW9uICsgXCJdKShbXFwsXSlcIjtcbiAgICByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCBcIiQxXCIpO1xuXG5cbiAgICAvKiBbOF0gUHVuY3R1YXRpb24gcmVwbGFjZW1lbnQgKi9cbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvKFxce1xce3R5cG9wb19fZG91YmxlLXByaW1lfX0pL2csIFwi4oCzXCIpO1xuXG4gICAgc3dpdGNoIChsYW5ndWFnZSkge1xuICAgICAgY2FzZSBcInJ1ZVwiOlxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvKFxce1xce3R5cG9wb19fbGVmdC1kb3VibGUtcXVvdGV9fSkvZywgXCLCq1wiKTtcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLyhcXHtcXHt0eXBvcG9fX3JpZ2h0LWRvdWJsZS1xdW90ZX19KS9nLCBcIsK7XCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJza1wiOlxuICAgICAgY2FzZSBcImNzXCI6XG4gICAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC8oXFx7XFx7dHlwb3BvX19sZWZ0LWRvdWJsZS1xdW90ZX19KS9nLCBcIuKAnlwiKTtcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLyhcXHtcXHt0eXBvcG9fX3JpZ2h0LWRvdWJsZS1xdW90ZX19KS9nLCBcIuKAnFwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZW5cIjpcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLyhcXHtcXHt0eXBvcG9fX2xlZnQtZG91YmxlLXF1b3RlfX0pL2csIFwi4oCcXCIpO1xuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvKFxce1xce3R5cG9wb19fcmlnaHQtZG91YmxlLXF1b3RlfX0pL2csIFwi4oCdXCIpO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG5cblxuICAvKlxuICAgQ29ycmVjdHMgaW1wcm9wZXIgdXNlIG9mIHNpbmdsZSBxdW90ZXMsIHNpbmdsZSBwcmltZXMgYW5kIGFwb3N0cm9waGVzXG5cbiAgIEFzc3VtcHRpb25zIGFuZCBMaW1pdGF0aW9uc1xuICAgVGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgZG91YmxlIHF1b3RlcyBhcmUgYWx3YXlzIHVzZWQgaW4gcGFpcixcbiAgIGkuZS4gYXV0aG9ycyBkaWQgbm90IGZvcmdldCB0byBjbG9zZSBkb3VibGUgcXVvdGVzIGluIHRoZWlyIHRleHQuXG4gICBGdXJ0aGVyLCBzaW5nbGUgcXVvdGVzIGFyZSB1c2VkIGFzIHNlY29uZGFyeSBhbmQgdGhleSdyZSBwcm9wZXJseSBzcGFjZWQsXG4gICBlLmcuIOKQoyd3b3JkIG9yIHNlbnRlbmNlIHBvcnRpb24n4pCjIChhbmQgbm90IGxpa2Ug4pCjJ+KQo3dvcmTikKMn4pCjKVxuXG4gICBBbGdvcml0aG1cbiAgIFsxXSBJZGVudGlmeSBjb21tb24gYXBvc3Ryb2hlIGNvbnRyYWN0aW9uc1xuICAgWzJdIElkZW50aWZ5IHNpbmdsZSBxdW90ZXNcbiAgIFszXSBJZGVudGlmeSBmZWV0LCBhcmNtaW51dGVzLCBtaW51dGVzXG4gICBbNF0gSWRlbnRpZnkgcmVzaWR1YWwgYXBvc3Ryb3BoZXMgdGhhdCBoYXZlIGxlZnRcbiAgIFs/XSBTd2FwIHJpZ2h0IHNpbmdsZSBxdW90ZSBhZGVwdHMgd2l0aCBhIHB1bmN0dWF0aW9uXG4gICAoV2Ugd2VyZSBzd2FwcGluZyBzaW5nbGUgcXVvdGVzIGFzIHBhcnQgb2YgYWxnb3JpdGhtIGEgd2hpbGUgYSBiYWNrLFxuICAgYnV0IHNpbmNlIGl0IGlzIG1vcmUgcHJvYmFibGUgdGhhdCBzaW5nbGUgcXVvdGVzIGFyZSBpbiB0aGUgbWlkZGxlIG9mIHRoZVxuICAgc2VudGVuY2UsIHdlIGhhdmUgZHJvcHBlZCBzd2FwcGluZyBhcyBhIHBhcnQgb2YgdGhlIGFsZ29yaXRobSlcbiAgIFs2XSBSZXBsYWNlIGFsbCBpZGVudGlmaWVkIHB1bmN0dWF0aW9uIHdpdGggYXBwcm9wcmlhdGUgcHVuY3R1YXRpb24gaW5cbiAgIGdpdmVuIGxhbmd1YWdlXG5cbiAgIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcg4oCUIGlucHV0IHRleHQgZm9yIGlkZW50aWZpY2F0aW9uXG4gICBAcGFyYW0ge3N0cmluZ30gbGFuZ3VhZ2Ug4oCUIGxhbmd1YWdlIG9wdGlvbnNcbiAgIEByZXR1cm5zIHtzdHJpbmd9IOKAlCBjb3JyZWN0ZWQgb3V0cHV0XG4gICAqL1xuICBmdW5jdGlvbiBjb3JyZWN0X3NpbmdsZV9xdW90ZXNfcHJpbWVzX2FuZF9hcG9zdHJvcGhlcyhzdHJpbmcsIGxhbmd1YWdlKSB7XG5cbiAgICAvKiBbMS4xXSBJZGVudGlmeSDigJlu4oCZIGNvbnRyYWN0aW9ucyAqL1xuICAgIGxldCBwYXR0ZXJuID0gXCIoXCIgKyBzaW5nbGVRdW90ZUFkZXB0cyArIFwiKShuKShcIiArIHNpbmdsZVF1b3RlQWRlcHRzICsgXCIpXCI7XG4gICAgbGV0IHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdpXCIpO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCBcInt7dHlwb3BvX19hcG9zdHJvcGhlfX0kMnt7dHlwb3BvX19hcG9zdHJvcGhlfX1cIik7XG5cblxuICAgIC8qIFsxLjJdIElkZW50aWZ5IGNvbW1vbiBjb250cmFjdGlvbnMgYXQgdGhlIGJlZ2lubmluZyBvciBhdCB0aGUgZW5kXG4gICAgIG9mIHRoZSB3b3JkLCBlLmcuIEZpc2gg4oCZbuKAmSBDaGlwcywg4oCZZW0sIOKAmWNhdXNlLOKApiAqL1xuICAgIGNvbnN0IGNvbnRyYWN0aW9uX2V4YW1wbGVzID0gXCJlbXxjYXVzZXx0d2FzfHRpc3x0aWx8cm91bmRcIjtcbiAgICBwYXR0ZXJuID0gXCIoXCIgKyBzaW5nbGVRdW90ZUFkZXB0cyArIFwiKShcIiArIGNvbnRyYWN0aW9uX2V4YW1wbGVzICsgXCIpXCI7XG4gICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ2lcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwie3t0eXBvcG9fX2Fwb3N0cm9waGV9fSQyXCIpO1xuXG5cbiAgICAvKiBbMS4zXSBJZGVudGlmeSBpbi13b3JkIGNvbnRyYWN0aW9ucyxcbiAgICAgZS5nLiBEb27igJl0LCBJ4oCZbSwgT+KAmURvb2xlLCA2OeKAmWVycyAqL1xuICAgIGNvbnN0IGNoYXJhY3Rlcl9hZGVwdHMgPSBcIjAtOVwiICsgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZTtcbiAgICBwYXR0ZXJuID0gXCIoW1wiICsgY2hhcmFjdGVyX2FkZXB0cyArIFwiXSkoXCIgKyBzaW5nbGVRdW90ZUFkZXB0cyArIFwiKShbXCIgKyBjaGFyYWN0ZXJfYWRlcHRzICsgXCJdKVwiO1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDF7e3R5cG9wb19fYXBvc3Ryb3BoZX19JDNcIik7XG5cblxuICAgIC8qIFsxLjRdIElkZW50aWZ5IHllYXIgY29udHJhY3Rpb25zXG4gICAgIGUuZy4g4oCZNzBzLCBJTkNIRUJBIOKAmTg5LOKApiAqL1xuICAgIHBhdHRlcm4gPSBcIihcIiArIHNpbmdsZVF1b3RlQWRlcHRzICsgXCIpKFswLTldezJ9KVwiO1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwie3t0eXBvcG9fX2Fwb3N0cm9waGV9fSQyXCIpO1xuXG5cbiAgICAvKiBbMl0gSWRlbnRpZnkgc2luZ2xlIHF1b3RlcyB3aXRoaW4gZG91YmxlIHF1b3RlcyAqL1xuICAgIHBhdHRlcm4gPSBcIihcIiArIGRvdWJsZVF1b3RlQWRlcHRzICsgXCIpKC4qPykoXCIgKyBkb3VibGVRdW90ZUFkZXB0cyArIFwiKVwiO1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIGZ1bmN0aW9uICgkMCwgJDEsICQyLCAkMykge1xuXG4gICAgICAvL2lkZW50aWZ5IHt7dHlwb3BvX19sZWZ0LXNpbmdsZS1xdW90ZS0tYWRlcHR9fVxuICAgICAgbGV0IHBhdHRlcm4gPSBcIiggKShcIiArIHNpbmdsZVF1b3RlQWRlcHRzICsgXCIpKFtcIiArIGxvd2VyY2FzZUNoYXJzRW5Ta0N6UnVlICsgdXBwZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl0pXCI7XG4gICAgICBsZXQgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICAgICQyID0gJDIucmVwbGFjZShyZSwgXCIkMXt7dHlwb3BvX19sZWZ0LXNpbmdsZS1xdW90ZS0tYWRlcHR9fSQzXCIpO1xuXG4gICAgICAvL2lkZW50aWZ5IHt7dHlwb3BvX19yaWdodC1zaW5nbGUtcXVvdGUtLWFkZXB0fX1cbiAgICAgIHBhdHRlcm4gPSBcIihbXCIgKyBsb3dlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIHVwcGVyY2FzZUNoYXJzRW5Ta0N6UnVlICsgXCJdKShbXFwuLCE/XSk/KFwiICsgc2luZ2xlUXVvdGVBZGVwdHMgKyBcIikoWyBdfFtcXC4sIT9dKVwiO1xuICAgICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICAgICQyID0gJDIucmVwbGFjZShyZSwgXCIkMSQye3t0eXBvcG9fX3JpZ2h0LXNpbmdsZS1xdW90ZS0tYWRlcHR9fSQ0XCIpO1xuXG4gICAgICAvL2lkZW50aWZ5IHNpbmdsZSBxdW90ZSBwYWlyc1xuICAgICAgcGF0dGVybiA9IFwiKHt7dHlwb3BvX19sZWZ0LXNpbmdsZS1xdW90ZS0tYWRlcHR9fSkoLio/KSh7e3R5cG9wb19fcmlnaHQtc2luZ2xlLXF1b3RlLS1hZGVwdH19KVwiO1xuICAgICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICAgICQyID0gJDIucmVwbGFjZShyZSwgXCJ7e3R5cG9wb19fbGVmdC1zaW5nbGUtcXVvdGV9fSQye3t0eXBvcG9fX3JpZ2h0LXNpbmdsZS1xdW90ZX19XCIpO1xuXG4gICAgICByZXR1cm4gJDEgKyAkMiArICQzO1xuICAgIH0pO1xuXG5cbiAgICAvKiBbM10gSWRlbnRpZnkgZmVldCwgYXJjbWludXRlcywgbWludXRlc1xuICAgICBOb3RlOiB3ZeKAmXJlIG5vdCB1c2luZyBzaW5nbGVfcXVvdGVfYWRlcHRzIHZhcmlhYmxlXG4gICAgIGFzIGNvbW1hcyBhbmQgbG93LXBvc2l0aW9uZWQgcXVvdGVzIGFyZSBvbWl0dGVkKi9cbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvKFxcZCkoID8pKCd84oCYfOKAmXzigJt84oCyKS9nLCBcIiQxe3t0eXBvcG9fX3NpbmdsZS1wcmltZX19XCIpO1xuXG5cbiAgICAvKiBbNF0gSWRlbnRpZnkgcmVzaWR1YWwgYXBvc3Ryb3BoZXMgdGhhdCBoYXZlIGxlZnQgKi9cbiAgICBwYXR0ZXJuID0gXCIoXCIgKyBzaW5nbGVRdW90ZUFkZXB0cyArIFwiKVwiO1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwie3t0eXBvcG9fX2Fwb3N0cm9waGV9fVwiKTtcblxuXG4gICAgLyogWzVdIFB1bmN0dWF0aW9uIHJlcGxhY2VtZW50ICovXG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLyhcXHtcXHt0eXBvcG9fX3NpbmdsZS1wcmltZX19KS9nLCBcIuKAslwiKTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFx7XFx7dHlwb3BvX19hcG9zdHJvcGhlfX18XFx7XFx7dHlwb3BvX19sZWZ0LXNpbmdsZS1xdW90ZS0tYWRlcHR9fXxcXHtcXHt0eXBvcG9fX3JpZ2h0LXNpbmdsZS1xdW90ZS0tYWRlcHR9fS9nLCBcIuKAmVwiKTtcblxuXG4gICAgc3dpdGNoIChsYW5ndWFnZSkge1xuICAgICAgY2FzZSBcInJ1ZVwiOlxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFx7XFx7dHlwb3BvX19sZWZ0LXNpbmdsZS1xdW90ZX19L2csIFwi4oC5XCIpO1xuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFx7XFx7dHlwb3BvX19yaWdodC1zaW5nbGUtcXVvdGV9fS9nLCBcIuKAulwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwic2tcIjpcbiAgICAgIGNhc2UgXCJjc1wiOlxuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFx7XFx7dHlwb3BvX19sZWZ0LXNpbmdsZS1xdW90ZX19L2csIFwi4oCaXCIpO1xuICAgICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFx7XFx7dHlwb3BvX19yaWdodC1zaW5nbGUtcXVvdGV9fS9nLCBcIuKAmFwiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiZW5cIjpcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1xce1xce3R5cG9wb19fbGVmdC1zaW5nbGUtcXVvdGV9fS9nLCBcIuKAmFwiKTtcbiAgICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL1xce1xce3R5cG9wb19fcmlnaHQtc2luZ2xlLXF1b3RlfX0vZywgXCLigJlcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuXG5cbiAgZnVuY3Rpb24gY29ycmVjdF9tdWx0aXBsZV9zaWduKHN0cmluZykge1xuICAgIHJldHVybiByZW1vdmVfbXVsdGlwbGVfc3BhY2VzKHN0cmluZy5yZXBsYWNlKC8oWzEtOV0rWyBdP1thLXd6XSopKFsgXXswLDF9W3h8w5ddWyBdezAsMX0pKFsxLTldK1sgXXswLDF9W2Etd3pdKikvZywgXCIkMSDDlyAkM1wiKSk7XG4gIH1cblxuXG4gIC8qXG4gICBSZXBsYWNlcyBoeXBoZW4gd2l0aCBlbSBvciBlbiBkYXNoXG5cbiAgIEFsZ29yaXRobVxuICAgWzFdIFJlcGxhY2UgMyBjb25zZWN1dGl2ZSBoeXBoZW5zICgtLS0pIHdpdGggYW4gZW0gZGFzaCAo4oCUKVxuICAgWzJdIFJlcGxhY2UgMiBjb25zZWN1dGl2ZSBoeXBoZW5zICgtLSkgd2l0aCBhbiBlbiBkYXNoICjigJQpXG4gICBbM10gUmVwbGFjZSBhbnkgaHlwaGVuIG9yIGRhc2ggc3Vycm91bmRlZCB3aXRoIHNwYWNlcyB3aXRoIGFuIGVtIGRhc2hcbiAgIFs0XSBSZXBsYWNlIGh5cGhlbiBvciBkYXNoIHVzZWQgaW4gbnVtYmVyIHJhbmdlIHdpdGggYW4gZW4gZGFzaFxuICAgYW5kIHNldCBwcm9wZXIgc3BhY2luZ1xuXG4gICBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIOKAlCBpbnB1dCB0ZXh0IGZvciBpZGVudGlmaWNhdGlvblxuICAgQHJldHVybnMge3N0cmluZ30g4oCUIG91dHB1dCB3aXRoIGRhc2hlcyBpbnN0ZWFkIG9mIGh5cGhlbnNcbiAgICovXG4gIGZ1bmN0aW9uIHJlcGxhY2VfaHlwaGVuX3dpdGhfZGFzaChzdHJpbmcsIGxhbmd1YWdlKSB7XG4gICAgY29uc3QgZGFzaGVzID0gXCIt4oCT4oCUXCI7IC8vIGluY2x1ZGluZyBhIGh5cGhlblxuXG4gICAgLyogWzFdIFJlcGxhY2UgMyBjb25zZWN1dGl2ZSBoeXBoZW5zICgtLS0pIHdpdGggYW4gZW0gZGFzaCAo4oCUKSAqL1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKC8oLS0tKS9nLCBcIuKAlFwiKTtcblxuXG4gICAgLyogWzJdIFJlcGxhY2UgMiBjb25zZWN1dGl2ZSBoeXBoZW5zICgtLSkgd2l0aCBhbiBlbiBkYXNoICjigJQpICovXG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoLygtLSkvZywgXCLigJNcIik7XG5cblxuICAgIC8qIFszXSBSZXBsYWNlIGFueSBoeXBoZW4gb3IgZGFzaCBzdXJyb3VuZGVkIHdpdGggc3BhY2VzIHdpdGggYW4gZW0gZGFzaCAqL1xuICAgIGxldCBwYXR0ZXJuID0gXCJbXCIgKyBzcGFjZXMgKyBcIl1bXCIgKyBkYXNoZXMgKyBcIl1bXCIgKyBzcGFjZXMgKyBcIl1cIjtcbiAgICBsZXQgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICBjb25zdCByZXBsYWNlbWVudCA9IG5hcnJvd05ic3AgKyBcIuKAlFwiICsgaGFpclNwYWNlO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCByZXBsYWNlbWVudCk7XG5cbiAgICAvKiBbNC4xXSBSZXBsYWNlIGh5cGhlbiBvciBkYXNoLCBwbGFjZWQgYmV0d2VlbiAyIGNhcmRpbmFsIG51bWJlcnMsXG4gICAgIHdpdGggYW4gZW4gZGFzaDsgaW5jbHVkaW5nIGNhc2VzIHdoZW4gdGhlcmUgaXMgYW4gZXh0cmEgc3BhY2VcbiAgICAgZnJvbSBlaXRoZXIgb25lIHNpZGUgb3IgYm90aCBzaWRlcyBvZiB0aGUgZGFzaCAqL1xuICAgIGNvbnN0IGNhcmRpbmFsX251bWJlciA9IFwiXFxcXGQrXCI7XG4gICAgcGF0dGVybiA9IFwiKFwiICsgY2FyZGluYWxfbnVtYmVyICsgXCIpKFtcIiArIHNwYWNlcyArIFwiXT9bXCIgKyBkYXNoZXMgKyBcIl1bXCIgKyBzcGFjZXMgKyBcIl0/KShcIiArIGNhcmRpbmFsX251bWJlciArIFwiKVwiO1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDHigJMkM1wiKTtcblxuXG4gICAgLyogWzQuMl0gUmVwbGFjZSBoeXBoZW4gb3IgZGFzaCwgcGxhY2VkIGJldHdlZW4gMiBvcmRpbmFsIG51bWJlcnMsXG4gICAgIHdpdGggYW4gZW4gZGFzaDsgaW5jbHVkaW5nIGNhc2VzIHdoZW4gdGhlcmUgaXMgYW4gZXh0cmEgc3BhY2VcbiAgICAgZnJvbSBlaXRoZXIgb25lIHNpZGUgb3IgYm90aCBzaWRlcyBvZiB0aGUgZGFzaCAqL1xuICAgIGxldCBvcmRpbmFsX2luZGljYXRvciA9IFwiXCI7XG4gICAgc3dpdGNoIChsYW5ndWFnZSkge1xuICAgICAgY2FzZSBcInJ1ZVwiOlxuICAgICAgY2FzZSBcInNrXCI6XG4gICAgICBjYXNlIFwiY3NcIjpcbiAgICAgICAgb3JkaW5hbF9pbmRpY2F0b3IgPSBcIlxcXFwuXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImVuXCI6XG4gICAgICAgIG9yZGluYWxfaW5kaWNhdG9yID0gXCJzdHxuZHxyZHx0aFwiO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgcGF0dGVybiA9IFwiKFwiICsgY2FyZGluYWxfbnVtYmVyICsgXCIpKFwiICsgb3JkaW5hbF9pbmRpY2F0b3IgKyBcIikoW1wiICsgc3BhY2VzICsgXCJdP1tcIiArIGRhc2hlcyArIFwiXVtcIiArIHNwYWNlcyArIFwiXT8pKFwiICsgY2FyZGluYWxfbnVtYmVyICsgXCIpKFwiICsgb3JkaW5hbF9pbmRpY2F0b3IgKyBcIilcIjtcbiAgICByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnaVwiKTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgXCIkMSQy4oCTJDQkNVwiKTtcblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHJlcGxhY2VfZGFzaF93aXRoX2h5cGhlbihzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gXCIoW1wiICsgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl0pKFvigJPigJRdKShbXCIgKyBsb3dlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXSlcIjtcbiAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShyZSwgXCIkMS0kM1wiKTtcbiAgfVxuXG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxcXG4gICBDb25zb2xpZGF0aW9uIG9mIHNwYWNlc1xuICAgXFwqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblxuICBmdW5jdGlvbiByZW1vdmVfc3BhY2VfYmVmb3JlX3B1bmN0dWF0aW9uKHN0cmluZykge1xuICAgIGNvbnN0IHBhdHRlcm4gPSBcIihbXCIgKyBzcGFjZXMgKyBcIl0pKFtcIiArIHNlbnRlbmNlUHVuY3R1YXRpb24gKyBjbG9zaW5nQnJhY2tldHMgKyBkZWdyZWUgKyBcIl0pXCI7XG4gICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDJcIik7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHJlbW92ZV9zcGFjZV9hZnRlcl9wdW5jdHVhdGlvbihzdHJpbmcpIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gXCIoW1wiICsgb3BlbmluZ0JyYWNrZXRzICsgXCJdKShbXCIgKyBzcGFjZXMgKyBcIl0pXCI7XG4gICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDFcIik7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIHJlbW92ZV90cmFpbGluZ19zcGFjZXMoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy50cmltKCk7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGFkZF9zcGFjZV9iZWZvcmVfcHVuY3R1YXRpb24oc3RyaW5nKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IFwiKFtcIiArIGxvd2VyY2FzZUNoYXJzRW5Ta0N6UnVlICsgdXBwZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl0pKFtcIiArIG9wZW5pbmdCcmFja2V0cyArIFwiXSkoW1wiICsgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXSlcIjtcbiAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShyZSwgXCIkMSAkMiQzXCIpO1xuICB9XG5cblxuICBmdW5jdGlvbiBhZGRfc3BhY2VfYWZ0ZXJfcHVuY3R1YXRpb24oc3RyaW5nKSB7XG4gICAgY29uc3QgcGF0dGVybiA9IFwiKFtcIiArIGxvd2VyY2FzZUNoYXJzRW5Ta0N6UnVlICsgdXBwZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl0pKFtcIiArIHNlbnRlbmNlUHVuY3R1YXRpb24gKyBjbG9zaW5nQnJhY2tldHMgKyBcIl0pKFtcIiArIGxvd2VyY2FzZUNoYXJzRW5Ta0N6UnVlICsgdXBwZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl0pXCI7XG4gICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDEkMiAkM1wiKTtcbiAgfVxuXG5cbiAgLypcbiAgIFJlbW92ZXMgZXh0cmEgc3BhY2VzIGF0IHRoZSBiZWdpbm5pbmcgb2YgZWFjaCBwYXJhZ3JhcGhcblxuICAgVGhpcyBjb3VsZCBiZSBkb25lIHdpdGggYSBvbmUtbGluZXI6XG4gICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL15cXHMrL2dtLCBcIlwiKTtcblxuICAgSG93ZXZlciwgaXQgYWxzbyByZW1vdmVzIGVtcHR5IGxpbmVzLiBTaW5jZSwgd2Ugd2FudCB0byBoYW5kbGUgdGhpcyBjaGFuZ2VcbiAgIHNlcGFyYXRlbHksIHdlIG5lZWQgdG9cbiAgIFsxXSBzcGxpdCB0aGUgbGluZXMgbWFudWFsbHlcbiAgIFsyXSBhbmQgcmVtb3ZlIGV4dHJhIHNwYWNlcyBhdCB0aGUgYmVnaW5pbmcgb2YgZWFjaCBsaW5lXG4gICBbM10gam9pbiBsaW5lcyB0b2dldGhlciB0byBhIHNpbmdsZSBzdHJpbmdcblxuICAgQHBhcmFtIHtzdHJpbmd9IHN0cmluZyDigJQgaW5wdXQgdGV4dCBmb3IgaWRlbnRpZmljYXRpb25cbiAgIEByZXR1cm5zIHtzdHJpbmd9IOKAlCBvdXRwdXQgd2l0aCByZW1vdmVkIHNwYWNlcyBhdCB0aGUgYmVnaW5uaW5nIG9mIHBhcmFncmFwaHNcbiAgICovXG4gIGZ1bmN0aW9uIHJlbW92ZV9zcGFjZXNfYXRfcGFyYWdyYXBoX2JlZ2lubmluZyhzdHJpbmcpIHtcbiAgICAvKiBbMV0gc3BsaXQgdGhlIGxpbmVzIG1hbnVhbGx5ICovXG4gICAgbGV0IGxpbmVzID0gc3RyaW5nLnNwbGl0KC9cXHI/XFxuLyk7XG5cbiAgICAvKiBbMl0gYW5kIHJlbW92ZSBleHRyYSBzcGFjZXMgYXQgdGhlIGJlZ2luaW5nIG9mIGVhY2ggbGluZSAqL1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpbmVzW2ldID0gbGluZXNbaV0ucmVwbGFjZSgvXlxccysvLCBcIlwiKTtcbiAgICB9XG5cbiAgICAvKiBbM10gam9pbiBsaW5lcyB0b2dldGhlciB0byBhIHNpbmdsZSBzdHJpbmcgKi9cbiAgICByZXR1cm4gbGluZXMuam9pbihcIlxcblwiKTtcbiAgfVxuXG5cbiAgLypcbiAgIFJlbW92ZXMgZW1wdHkgbGluZXNcblxuICAgQHBhcmFtIHtzdHJpbmd9IHN0cmluZyDigJQgaW5wdXQgdGV4dCBmb3IgaWRlbnRpZmljYXRpb25cbiAgIEByZXR1cm5zIHtzdHJpbmd9IOKAlCBvdXRwdXQgd2l0aCByZW1vdmVkIGVtcHR5IGxpbmVzXG4gICAqL1xuICBmdW5jdGlvbiByZW1vdmVfZW1wdHlfbGluZXMoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9eXFxzKy9nbSwgXCJcIik7XG4gIH1cblxuXG4gIC8qXG4gICBDb25zb2xpZGF0ZXMgdGhlIHVzZSBvZiBub24tYnJlYWtpbmcgc3BhY2VzXG5cbiAgICogYWRkcyBub24tYnJlYWtpbmcgc3BhY2VzIGFmdGVyIHNpbmdsZS1jaGFyYWN0ZXIgcHJlcG9zaXRpb25zXG4gICAqIGFkZHMgbm9uLWJyZWFraW5nIHNwYWNlcyBhZnRlciBudW1lcmFsc1xuICAgKiBhZGRzIG5vbi1icmVha2luZyBzcGFjZXMgYXJvdW5kIMOXXG4gICAqIHJlbW92ZXMgY2hhcmFjdGVycyBiZXR3ZWVuIG11bHRpLWNoYXJhY3RlciB3b3Jkc1xuXG4gICBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIOKAlCBpbnB1dCB0ZXh0IGZvciBpZGVudGlmaWNhdGlvblxuICAgQHJldHVybnMge3N0cmluZ30g4oCUIG91dHB1dCB3aXRoIGNvcnJlY3RseSBwbGFjZWQgbm9uLWJyZWFraW5nIHNwYWNlXG4gICAqL1xuICBmdW5jdGlvbiBjb25zb2xpZGF0ZV9uYnNwKHN0cmluZykge1xuICAgIC8vIHJlbW92ZXMgbm9uLWJyZWFraW5nIHNwYWNlcyBiZXR3ZWVuIG11bHRpLWNoYXJhY3RlciB3b3Jkc1xuICAgIGxldCBwYXR0ZXJuID0gXCIoW1wiICsgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXXsyLH0pKFtcIiArIG5ic3AgKyBuYXJyb3dOYnNwICsgXCJdKShbXCIgKyBsb3dlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIHVwcGVyY2FzZUNoYXJzRW5Ta0N6UnVlICsgXCJdezIsfSlcIjtcbiAgICBsZXQgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgXCIkMSAkM1wiKTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgXCIkMSAkM1wiKTsgLy9jYWxsaW5nIGl0IHR3aWNlIHRvIGNhdGNoIG9kZC9ldmVuIG9jY3VyZW5jZXNcblxuXG4gICAgLy8gYWRkcyBub24tYnJlYWtpbmcgc3BhY2VzIGFmdGVyIG51bWVyYWxzXG4gICAgcGF0dGVybiA9IFwiKFswLTldKykoICkoW1wiICsgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXSspXCI7XG4gICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICBsZXQgcmVwbGFjZW1lbnQgPSBcIiQxXCIgKyBuYnNwICsgXCIkM1wiO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCByZXBsYWNlbWVudCk7XG5cblxuICAgIC8vIGFkZHMgbm9uLWJyZWFraW5nIHNwYWNlcyBhcm91bmQgw5dcbiAgICBwYXR0ZXJuID0gXCIoW1wiICsgc3BhY2VzICsgXCJdKShbw5ddKShbXCIgKyBzcGFjZXMgKyBcIl0pXCI7XG4gICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICByZXBsYWNlbWVudCA9IG5ic3AgKyBcIiQyXCIgKyBuYnNwO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCByZXBsYWNlbWVudCk7XG5cblxuICAgIC8vIGFkZHMgbm9uLWJyZWFraW5nIHNwYWNlcyBhZnRlciBzaW5nbGUtY2hhcmFjdGVyIHByZXBvc2l0aW9uc1xuICAgIHBhdHRlcm4gPSBcIihbwqAgXSkoW1wiICsgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXXwmKSggKVwiO1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgcmVwbGFjZW1lbnQgPSBcIiQxJDJcIiArIG5ic3A7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIHJlcGxhY2VtZW50KTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgcmVwbGFjZW1lbnQpOyAvL2NhbGxpbmcgaXQgdHdpY2UgdG8gY2F0Y2ggb2RkL2V2ZW4gb2NjdXJlbmNlc1xuXG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuXG5cbiAgLypcbiAgIENvcnJlY3RzIGltcHJvcGVyIHNwYWNpbmcgYXJvdW5kIGVsbGlwc2lzIGFuZCBhcG9zaW9wZXNpc1xuXG4gICBFbGxpcHNpcyAoYXMgYSBjaGFyYWN0ZXIpIGlzIHVzZWQgZm9yIDIgZGlmZmVyZW50IHB1cnBvc2VzOlxuICAgMS4gYXMgYW4gZWxsaXBzaXMgdG8gb21pdCBhIHBpZWNlIG9mIGluZm9ybWF0aW9uIGRlbGliZXJhdGVseVxuICAgMi4gYXMgYW4gYXBvc2lvcGVzaXM7IGEgZmlndXJlIG9mIHNwZWVjaCB3aGVyZWluIGEgc2VudGVuY2UgaXNcbiAgIGRlbGliZXJhdGVseSBicm9rZW4gb2ZmIGFuZCBsZWZ0IHVuZmluaXNoZWRcblxuICAgc291cmNlc1xuICAgaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRWxsaXBzaXNcbiAgIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Fwb3Npb3Blc2lzXG4gICBodHRwOi8vd3d3LmxpdGVlcmEuY3ovc2xvdm5pay92eXB1c3RrYVxuXG4gICBBbGdvcml0aG1cbiAgIEVsbGlwc2lzICYgQXBvc2lvcGVzaXMgcmVxdWlyZSBkaWZmZXJlbnQgdXNlIG9mIHNwYWNpbmcgYXJvdW5kIHRoZW0sXG4gICB0aGF0IGlzIHdoeSB3ZSBhcmUgY29ycmVjdGluZyBvbmx5IGZvbGxvd2luZyBjYXNlczpcbiAgIGVycm9yczpcbiAgIFsxXSBjb3JyZWN0IHNwYWNpbmcsIHdoZW4gZWxsaXBzaXMgdXNlZCB1c2VkIGFyb3VuZCBjb21tYXNcbiAgIFsyXSBjb3JyZWN0IHNwYWNpbmcgZm9yIGFwb3Npb3Blc2lzIGF0IHRoZSBlbmQgb2YgdGhlIHNlbnRlbmNlIGluIHRoZSBtaWRkbGUgb2YgdGhlIHBhcmFncmFwaFxuICAgWzNdIGNvcnJlY3Qgc3BhY2luZyBmb3IgYXBvc2lvcGVzaXMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc2VudGVuY2UgaW4gdGhlIG1pZGRsZSBvZiB0aGUgcGFyYWdyYXBoXG4gICBbNF0gY29ycmVjdCBzcGFjaW5nIGZvciBhcG9zaW9wZXNpcyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZW50ZW5jZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBwYXJhZ3JhcGhcbiAgIFs1XSBjb3JyZWN0IHNwYWNpbmcgZm9yIGFwb3Npb3Blc2lzIGF0IHRoZSBlbmQgb2YgdGhlIHNlbnRlbmNlIGF0IHRoZSBlbmQgb2YgdGhlIHBhcmFncmFwaFxuXG4gICBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIOKAlCBpbnB1dCB0ZXh0IGZvciBpZGVudGlmaWNhdGlvblxuICAgQHJldHVybnMge3N0cmluZ30g4oCUIG91dHB1dCB3aXRoIGNvcnJlY3RlZCBzcGFjaW5nIGFyb3VuZCBhcG9zaW9wZXNpc1xuICAgKi9cbiAgZnVuY3Rpb24gY29ycmVjdF9zcGFjZXNfYXJvdW5kX2VsbGlwc2lzKHN0cmluZykge1xuXG4gICAgLyogWzFdIGNvcnJlY3Qgc3BhY2luZywgd2hlbiBlbGxpcHNpcyB1c2VkIHVzZWQgYXJvdW5kIGNvbW1hcyAqL1xuICAgIGxldCBwYXR0ZXJuID0gXCIsW1wiICsgc3BhY2VzICsgXCJdP1wiICsgZWxsaXBzaXMgKyBcIltcIiArIHNwYWNlcyArIFwiXT8sXCI7XG4gICAgbGV0IHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwiLCDigKYsXCIpO1xuXG5cbiAgICAvKiBbMl0gY29ycmVjdCBzcGFjaW5nIGZvciBhcG9zaW9wZXNpcyBhdCB0aGUgZW5kIG9mIHRoZSBzZW50ZW5jZVxuICAgICBpbiB0aGUgbWlkZGxlIG9mIHRoZSBwYXJhZ3JhcGggKi9cbiAgICBwYXR0ZXJuID0gXCIoW1wiICsgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl0pKFtcIiArIHNwYWNlcyArIFwiXSkoXCIgKyBlbGxpcHNpcyArIFwiW1wiICsgc3BhY2VzICsgXCJdW1wiICsgdXBwZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl0pXCI7XG4gICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgXCIkMSQzXCIpO1xuXG5cbiAgICAvKiBbM10gY29ycmVjdCBzcGFjaW5nIGZvciBhcG9zaW9wZXNpcyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZW50ZW5jZVxuICAgICBpbiB0aGUgbWlkZGxlIG9mIHRoZSBwYXJhZ3JhcGggKi9cbiAgICBwYXR0ZXJuID0gXCIoW1wiICsgc2VudGVuY2VQdW5jdHVhdGlvbiArIFwiXVtcIiArIHNwYWNlcyArIFwiXVwiICsgZWxsaXBzaXMgKyBcIikoW1wiICsgc3BhY2VzICsgXCJdKShbXCIgKyBsb3dlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXSlcIjtcbiAgICByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCBcIiQxJDNcIik7XG5cblxuICAgIC8qIFs0XSBjb3JyZWN0IHNwYWNpbmcgZm9yIGFwb3Npb3Blc2lzIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHNlbnRlbmNlXG4gICAgIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIHBhcmFncmFwaCAqL1xuICAgIHBhdHRlcm4gPSBcIihe4oCmKShbXCIgKyBzcGFjZXMgKyBcIl0pKFtcIiArIGxvd2VyY2FzZUNoYXJzRW5Ta0N6UnVlICsgdXBwZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl0pXCI7XG4gICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ21cIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDEkM1wiKTtcblxuXG4gICAgLyogWzVdIGNvcnJlY3Qgc3BhY2luZyBmb3IgYXBvc2lvcGVzaXMgYXQgdGhlIGVuZCBvZiB0aGUgc2VudGVuY2VcbiAgICAgYXQgdGhlIGVuZCBvZiB0aGUgcGFyYWdyYXBoICovXG4gICAgcGF0dGVybiA9IFwiKFtcIiArIGxvd2VyY2FzZUNoYXJzRW5Ta0N6UnVlICsgc2VudGVuY2VQdW5jdHVhdGlvbiArIFwiXSkoW1wiICsgc3BhY2VzICsgXCJdKShcIiArIGVsbGlwc2lzICsgXCIpKD8hWyBcIiArIHNlbnRlbmNlUHVuY3R1YXRpb24gKyBsb3dlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIHVwcGVyY2FzZUNoYXJzRW5Ta0N6UnVlICsgXCJdKVwiO1xuICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIFwiJDEkM1wiKTtcblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cblxuXG4gIC8qXG4gICBDb3JyZWN0cyBhY2NpZGVudGFsIHVwcGVyY2FzZVxuXG4gICBCZXN0LWVmZm9ydCBmdW5jdGlvbiB0byBmaXggbW9zdCBjb21tb24gYWNjaWRlbnRhbCB1cHBlcmNhc2UgZXJyb3JzLCBuYW1lbHk6XG4gICBbMV0gMiBmaXJzdCB1cHBlcmNhc2UgbGV0dGVycyAoaWUuIFVQcGVyY2FzZSlcbiAgIFsyXSBTd2FwcGVkIGNhc2VzIChpZS4gdVBQRVJDQVNFKVxuXG4gICBBbGdvcml0aG0gZG9lcyBub3QgZml4IG90aGVyIHVwcGVyY2FzZSBldmVudHVhbGl0aWVzLFxuICAgZS5nLiBtaXhlZCBjYXNlIChVcHBFUmNhU2UpIGFzIHRoZXJlIGFyZSBtYW55IGNhc2VzIGZvciBjb3Jwb3JhdGUgYnJhbmRzXG4gICB0aGF0IGNvdWxkIHBvdGVudGlhbGx5IG1hdGNoIHRoZSBhbGdvcml0aG0gYXMgZmFsc2UgcG9zaXRpdmUuXG5cbiAgIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcg4oCUIGlucHV0IHRleHQgZm9yIGlkZW50aWZpY2F0aW9uXG4gICBAcmV0dXJucyB7c3RyaW5nfSDigJQgb3V0cHV0IHdpdGggY29ycmVjdGVkIGFjY2lkZW50YWwgdXBwZXJjYXNlXG4gICAqL1xuICBmdW5jdGlvbiBjb3JyZWN0X2FjY2lkZW50YWxfdXBwZXJjYXNlKHN0cmluZykge1xuXG4gICAgLyogWzFdIHR3byBmaXJzdCB1cHBlcmNhc2UgbGV0dGVycyAoaS5lLiBVUHBlcmNhc2UpICovXG4gICAgbGV0IHBhdHRlcm4gPSBcIltcIiArIHVwcGVyY2FzZUNoYXJzRW5Ta0N6UnVlICsgXCJdezIsMn1bXCIgKyBsb3dlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXStcIjtcbiAgICBsZXQgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgcmV0dXJuIChzdHJpbmcuc3Vic3RyaW5nKDAsIDEpICsgc3RyaW5nLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9KTtcblxuICAgIC8qIFsyLjFdIFN3YXBwZWQgY2FzZXMgKDItbGV0dGVyIGNhc2VzLCBpLmUuIGlUKVxuICAgICBOb3RlIHRoYXQgdGhpcyBpcyBkaXZpZGVkIGludG8gMiBzZXBhcmF0ZSBjYXNlcyBhcyBcXGIgaW4gSmF2YVNjcmlwdCByZWdleFxuICAgICBkb2VzIG5vdCB0YWtlIG5vbi1sYXRpbiBjaGFyYWN0ZXJzIGludG8gYSBjb3NuaWRlcmF0aW9uXG4gICAgICovXG4gICAgcGF0dGVybiA9IFwiW1wiICsgbG93ZXJjYXNlQ2hhcnNFblNrQ3pSdWUgKyBcIl1bXCIgKyB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXVxcXFxiXCI7XG4gICAgcmUgPSBuZXcgUmVnRXhwKHBhdHRlcm4sIFwiZ1wiKTtcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgZnVuY3Rpb24gKHN0cmluZykge1xuICAgICAgcmV0dXJuIChzdHJpbmcuc3Vic3RyaW5nKDAsIDEpICsgc3RyaW5nLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpKTtcbiAgICB9KTtcblxuICAgIC8qIFsyLjJdIFN3YXBwZWQgY2FzZXMgKG4tbGV0dGVyIGNhc2VzLCBpLmUuIHVQUEVSQ0FTRSkgKi9cbiAgICBwYXR0ZXJuID0gXCJbXCIgKyBsb3dlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXStbXCIgKyB1cHBlcmNhc2VDaGFyc0VuU2tDelJ1ZSArIFwiXXsyLH1cIjtcbiAgICByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgICByZXR1cm4gKHN0cmluZy5zdWJzdHJpbmcoMCwgMSkgKyBzdHJpbmcuc3Vic3RyaW5nKDEpLnRvTG93ZXJDYXNlKCkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuXG5cbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKlxcXG4gICBBYmJyZXZpYXRpb25zXG4gICBcXCotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cbiAgLypcbiAgIElkZW50aWZpZXMgZGlmZmVyZW50bHktc3BlbGxlZCBhYmJyZXZpYXRpb25zIGFuZCByZXBsYWNlcyBpdCB3aXRoXG4gICBhIHRlbXAgdmFyaWFibGUsIHt7dHlwb3BvX19bYWJicl19fVxuXG4gICBJZGVudGlmaWVzIGdpdmVuIGFiYnJldmlhdGlvbnM6XG4gICBhLm0uLCBwLm0uLCBlLmcuLCBpLmUuXG5cbiAgIEFsZ29yaXRobVxuICAgWzFdIElkZW50aWZ5IGUuZy4sIGkuZS5cbiAgIFsyXSBJZGVudGlmeSBhLm0uLCBwLm0uIChkaWZmZXJlbnQgbWF0Y2ggdG8gYXZvaWQgZmFsc2UgcG9zaXRpdmVzIHN1Y2ggYXM6XG4gICBJIGFtLCBIZSBpcyB0aGUgUE0uKVxuICAgWzNdIEV4Y2x1ZGUgZmFsc2UgaWRlbnRpZmljYXRpb25zXG5cbiAgIEBwYXJhbSB7c3RyaW5nfSBpbnB1dCB0ZXh0IGZvciBpZGVudGlmaWNhdGlvblxuICAgQHJldHVybnMge3N0cmluZ30gY29ycmVjdGVkIG91dHB1dFxuICAgKi9cbiAgZnVuY3Rpb24gaWRlbnRpZnlfY29tbW9uX2FiYnJldmlhdGlvbnMoc3RyaW5nKSB7XG5cbiAgICAvKiBbMV0gSWRlbnRpZnkgZS5nLiwgaS5lLiAqL1xuICAgIGxldCBhYmJyZXZpYXRpb25zID0gW1wiZWdcIiwgXCJpZVwiXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFiYnJldmlhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhdHRlcm4gPSBcIihcXFxcYltcIiArIGFiYnJldmlhdGlvbnNbaV1bMF0gKyBcIl1cXFxcLj9bXCIgKyBzcGFjZXMgKyBcIl0/W1wiICsgYWJicmV2aWF0aW9uc1tpXVsxXSArIFwiXVxcXFwuPykoW1wiICsgc3BhY2VzICsgXCJdPykoXFxcXGIpXCI7XG4gICAgICAvLyBjb25zb2xlLmxvZyhwYXR0ZXJuKTtcbiAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdpXCIpO1xuICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBcInt7dHlwb3BvX19cIiArIGFiYnJldmlhdGlvbnNbaV0gKyBcIn19IFwiO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIHJlcGxhY2VtZW50KTtcbiAgICB9XG5cblxuICAgIC8qIFsyXSBJZGVudGlmeSBhLm0uLCBwLm0uICovXG4gICAgYWJicmV2aWF0aW9ucyA9IFtcImFtXCIsIFwicG1cIl07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhYmJyZXZpYXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBwYXR0ZXJuID0gXCIoXFxcXGQpKFtcIiArIHNwYWNlcyArIFwiXT8pKFxcXFxiW1wiICsgYWJicmV2aWF0aW9uc1tpXVswXSArIFwiXVxcXFwuP1tcIiArIHNwYWNlcyArIFwiXT9bXCIgKyBhYmJyZXZpYXRpb25zW2ldWzFdICsgXCJdXFxcXC4/KShbXCIgKyBzcGFjZXMgKyBcIl0/KShcXFxcYnxcXFxcQilcIjtcbiAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdpXCIpO1xuICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBcIiQxIHt7dHlwb3BvX19cIiArIGFiYnJldmlhdGlvbnNbaV0gKyBcIn19IFwiO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmUsIHJlcGxhY2VtZW50KTtcbiAgICB9XG5cblxuICAgIC8qIFszXSBFeGNsdWRlIGZhbHNlIGlkZW50aWZpY2F0aW9uc1xuICAgICBSZWdleCBcXGIgZG9lcyBub3QgY2F0Y2ggbm9uLWxhdGluIGNoYXJhY3RlcnMgc28gd2UgbmVlZCB0byBleGNsdWRlIGZhbHNlXG4gICAgIGlkZW50aWZpY2F0aW9uc1xuICAgICAqL1xuICAgIGFiYnJldmlhdGlvbnMgPSBbXCJlZ1wiLCBcImllXCIsIFwiYW1cIiwgXCJwbVwiXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFiYnJldmlhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIG5vbi1sYXRpbiBjaGFyYWN0ZXIgYXQgdGhlIGJlZ2lubmluZ1xuICAgICAgbGV0IHBhdHRlcm4gPSBcIihbXCIgKyBub25MYXRpbkNoYXJzICsgXCJdKSh7e3R5cG9wb19fXCIgKyBhYmJyZXZpYXRpb25zW2ldICsgXCJ9fSlcIjtcbiAgICAgIGxldCByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICAgICAgbGV0IHJlcGxhY2VtZW50ID0gXCIkMVwiICsgYWJicmV2aWF0aW9uc1tpXTtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlLCByZXBsYWNlbWVudCk7XG5cbiAgICAgIC8vIG5vbi1sYXRpbiBjaGFyYWN0ZXIgYXQgdGhlIGVuZFxuICAgICAgcGF0dGVybiA9IFwiKHt7dHlwb3BvX19cIiArIGFiYnJldmlhdGlvbnNbaV0gKyBcIn19ICkoW1wiICsgbm9uTGF0aW5DaGFycyArIFwiXSlcIjtcbiAgICAgIHJlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLCBcImdcIik7XG4gICAgICByZXBsYWNlbWVudCA9IGFiYnJldmlhdGlvbnNbaV0gKyBcIiQyXCI7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgcmVwbGFjZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cblxuXG4gIC8qXG4gICBSZXBsYWNlcyBpZGVudGlmaWVkIHRlbXAgYWJicmV2aWF0aW9uIHZhcmlhYmxlIGxpa2Uge3t0eXBvcG9fX2VnfX0sXG4gICB3aXRoIHRoZWlyIGFjdHVhbCByZXByZXNlbnRhdGlvblxuXG4gICBAcGFyYW0ge3N0cmluZ30gaW5wdXQgdGV4dCBmb3IgaWRlbnRpZmljYXRpb25cbiAgIEByZXR1cm5zIHtzdHJpbmd9IGNvcnJlY3RlZCBvdXRwdXRcbiAgICovXG4gIGZ1bmN0aW9uIHBsYWNlX2NvbW1vbl9hYmJyZXZpYXRpb25zKHN0cmluZykge1xuICAgIGNvbnN0IGFiYnJldmlhdGlvbnMgPSBbXCJlZ1wiLCBcImllXCIsIFwiYW1cIiwgXCJwbVwiXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFiYnJldmlhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhdHRlcm4gPSBcInt7dHlwb3BvX19cIiArIGFiYnJldmlhdGlvbnNbaV0gKyBcIn19XCI7XG4gICAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBhYmJyZXZpYXRpb25zW2ldWzBdICsgXCIuXCIgKyBhYmJyZXZpYXRpb25zW2ldWzFdICsgXCIuXCI7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZSwgcmVwbGFjZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH1cblxuXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSpcXFxuICAgTWFpbiBzY3JpcHRcbiAgIFxcKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cbiAgLypcbiAgIENvcnJlY3QgdHlwb3MgaW4gdGhlIHByZWRlZmluZWQgb3JkZXJcblxuXG4gICBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIOKAlCBpbnB1dCB0ZXh0IGZvciBjb3JyZWN0aW9uXG4gICBAcmV0dXJucyB7c3RyaW5nfSDigJQgY29ycmVjdGVkIG91dHB1dFxuICAgKi9cbiAgcmV0dXJuIGZ1bmN0aW9uIGNvcnJlY3RfdHlwb3Moc3RyaW5nKSB7XG4gICAgY29uc3QgbGFuZ3VhZ2UgPSBjb25maWcubGFuZ3VhZ2U7XG4gICAgY29uc3QgcmVtb3ZlX2xpbmVzID0gY29uZmlnWydyZW1vdmUtZW1wdHktbGluZXMnXTtcblxuICAgIGNvbnN0IGV4Y2VwdGlvbkhhbmRsZXIgPSBnZXRFeGNlcHRpb25IYW5kbGVyKGNvbmZpZ1snZXhjZXB0aW9ucyddKTtcblxuICAgIHN0cmluZyA9IGV4Y2VwdGlvbkhhbmRsZXIuaWRlbnRpZnlfZXhjZXB0aW9ucyhzdHJpbmcpO1xuICAgIHN0cmluZyA9IGlkZW50aWZ5X2NvbW1vbl9hYmJyZXZpYXRpb25zKHN0cmluZyk7IC8vIG5lZWRzIHRvIGdvIGJlZm9yZSBwdW5jdHVhdGlvbiBmaXhlc1xuXG4gICAgc3RyaW5nID0gcmVwbGFjZV9zeW1ib2xzKHN0cmluZywgZXNzZW50aWFsU2V0KTtcbiAgICBzdHJpbmcgPSByZXBsYWNlX3BlcmlvZHNfd2l0aF9lbGxpcHNpcyhzdHJpbmcpO1xuICAgIHN0cmluZyA9IHJlbW92ZV9tdWx0aXBsZV9zcGFjZXMoc3RyaW5nKTtcblxuXG4gICAgc3RyaW5nID0gY29ycmVjdF9kb3VibGVfcXVvdGVzX2FuZF9wcmltZXMoc3RyaW5nLCBsYW5ndWFnZSk7XG4gICAgc3RyaW5nID0gY29ycmVjdF9zaW5nbGVfcXVvdGVzX3ByaW1lc19hbmRfYXBvc3Ryb3BoZXMoc3RyaW5nLCBsYW5ndWFnZSk7XG5cbiAgICBzdHJpbmcgPSBjb3JyZWN0X211bHRpcGxlX3NpZ24oc3RyaW5nKTtcblxuICAgIHN0cmluZyA9IHJlbW92ZV9zcGFjZV9iZWZvcmVfcHVuY3R1YXRpb24oc3RyaW5nKTtcbiAgICBzdHJpbmcgPSByZW1vdmVfc3BhY2VfYWZ0ZXJfcHVuY3R1YXRpb24oc3RyaW5nKTtcbiAgICBzdHJpbmcgPSByZW1vdmVfdHJhaWxpbmdfc3BhY2VzKHN0cmluZyk7XG4gICAgc3RyaW5nID0gYWRkX3NwYWNlX2JlZm9yZV9wdW5jdHVhdGlvbihzdHJpbmcpO1xuICAgIHN0cmluZyA9IGFkZF9zcGFjZV9hZnRlcl9wdW5jdHVhdGlvbihzdHJpbmcpO1xuICAgIHN0cmluZyA9IHJlbW92ZV9zcGFjZXNfYXRfcGFyYWdyYXBoX2JlZ2lubmluZyhzdHJpbmcpO1xuXG4gICAgaWYgKHJlbW92ZV9saW5lcykge1xuICAgICAgc3RyaW5nID0gcmVtb3ZlX2VtcHR5X2xpbmVzKHN0cmluZyk7XG4gICAgfVxuXG4gICAgc3RyaW5nID0gY29uc29saWRhdGVfbmJzcChzdHJpbmcpO1xuICAgIHN0cmluZyA9IGNvcnJlY3Rfc3BhY2VzX2Fyb3VuZF9lbGxpcHNpcyhzdHJpbmcpO1xuXG4gICAgc3RyaW5nID0gcmVwbGFjZV9oeXBoZW5fd2l0aF9kYXNoKHN0cmluZywgbGFuZ3VhZ2UpO1xuICAgIHN0cmluZyA9IHJlcGxhY2VfZGFzaF93aXRoX2h5cGhlbihzdHJpbmcpO1xuXG4gICAgc3RyaW5nID0gY29ycmVjdF9hY2NpZGVudGFsX3VwcGVyY2FzZShzdHJpbmcpO1xuXG4gICAgc3RyaW5nID0gcGxhY2VfY29tbW9uX2FiYnJldmlhdGlvbnMoc3RyaW5nKTsgLy8gbmVlZHMgdG8gZ28gYWZ0ZXIgcHVuY3R1YXRpb24gZml4ZXNcbiAgICBzdHJpbmcgPSBleGNlcHRpb25IYW5kbGVyLnBsYWNlX2V4Y2VwdGlvbnMoc3RyaW5nKTtcblxuICAgIHN0cmluZyA9IHJlcGxhY2VfcGVyaW9kc193aXRoX2VsbGlwc2lzKHN0cmluZyk7XG5cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9XG59XG4iXX0=

//# sourceMappingURL=maps/typopo_browser.built.js.map
