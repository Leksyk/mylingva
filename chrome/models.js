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
  this.word = word;
  this.lang = lang;
};

/**
 * Represents word in the user's dictionary.
 * Word & language uniquely identify the object.
 *
 * @param word
 * @param {!Lang} lang
 * @param {!WordStatus} status
 * @param {number} numTimesSeen how many times user's seen this word in a text?
 * @param {number} numTimesUsed how many times user's used this word on his own.
 * @constructor
 */
Word = function(word, lang, status, numTimesSeen, numTimesUsed) {
  this.word = word;
  this.lang = lang;
  this.status = status;
  this.numTimesSeen = numTimesSeen;
  this.numTimesUsed = numTimesUsed;
  // TODO: How about 'part of speech'?
};

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