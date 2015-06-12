/**
 * Identifiers for supported languages. Keep the IDs consistent with storage proto.
 *
 * @const
 */
Lang = {
  ENGLISH: 1,
  UKRAINIAN: 2,
  ROMANIAN: 3,
  POLISH: 4
};

/**
 * Identifiers of statuses of a word. Keep the IDs consistent with storage proto.
 *
 * @const
 */
WordStatus = {
  NONE: 1,
  KNOWN: 2,
  FAMILIAR: 3,
  UNKNOWN: 4,
  IGNORED: 5
};

WordKey = function(word, lang) {
  if (!word || !lang) {
    throw new Error('Both "lang" and "word" must be set.');
  }
  this.word = word;
  this.lang = lang;
};

/**
 * @returns {string} representation of the word key.
 */
WordKey.prototype.valueOf = function() {
  if (!(this.lang && this.word)) {
    throw new Error('Both "lang" and "word" must be set.');
  }
  return this.lang + '-' + this.word;
};

/**
 * Symmetrical to valueOf() function.
 * @param {string} value
 * @return {!WordKey}
 */
WordKey.parse = function(value) {
  var sep = value.indexOf('-');
  var lang = Number.parseInt(value.substring(0, sep));
  var word = value.substring(sep + 1);
  return new WordKey(word, lang);
};

/**
 * Represents word in the user's dictionary.
 * Word & language uniquely identify the object.
 *
 * @param word
 * @param {!Lang} lang
 * @param {!WordStatus} status
 * @param {?number} opt_numTimesSeen how many times user's seen this word in a text?
 * @param {?number} opt_numTimesUsed how many times user's used this word on his own.
 * @constructor
 */
Word = function(word, lang, status, opt_numTimesSeen, opt_numTimesUsed) {
  if (!word || !lang || !status) {
    throw new Error('Both "lang" and "word" must be set.');
  }
  this.word = word;
  this.lang = lang;
  this.status = status;
  this.numTimesSeen = opt_numTimesSeen;
  this.numTimesUsed = opt_numTimesUsed;
  // TODO: How about 'part of speech'?
};

Word.prototype.valueOf = WordKey.prototype.valueOf;

/**
 * How one word is related to the other.
 */
WordRelationType = {
  /** Translation of the word into a different language. */
  TRANSLATION: 1,
  /** Description of the word in the same or in a different language. */
  DESCRIPTION: 2,
  /** Synonym of the word in the same or in a different language. */
  SYNONYM: 3,
  /** Antonym of the word in the same or in a different language. */
  ANTONYM: 4,
  /** Form of another word in the same language. */
  FORM: 5
  // TODO: Any other relations?
};

/**
 * Describes relation between two words.
 *
 * @param {!WordKey} wordKey
 * @param {!WordRelationType} type
 * @param {?string} opt_form name of the form of relation.
 * @constructor
 */
WordRelation = function(wordKey, type, opt_form) {
  this.wordKey = wordKey;
  this.type = type;
  this.form = opt_form
};

/**
 * @param {number} startIndex
 * @param {number} endIndex
 * @constructor
 */
QuotePos = function(startIndex, endIndex) {
  this.startIndex = startIndex;
  this.endIndex = endIndex;
};

/**
 * Describes the source of a word or a quote.
 *
 * @param url
 * @constructor
 */
Source = function(url) {
  this.url = url;
  // TODO: There are might be more sources other than web.
};

/**
 * User-specific context of a word.
 *
 * @param {string} sentence
 * @param {!QuotePos} quotePos position of the word inside the sentence. Needed for two reasons:
 *        1. quicker lookup rather than text search.
 *        2. the word in the sentence might be in a different form which complicates the lookup
 *           and makes it language-specific.
 * @param {Source} source
 * @constructor
 */
WordContext = function(sentence, quotePos, source) {
  this.sentence = sentence;
  this.quotePos = quotePos;
  this.source = source;
};