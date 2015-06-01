/**
 * Temporary page-specific state of text and all its words.
 *
 * @constructor
 * @param {!LocalDb} localDb
 */
ReadingState = function(localDb) {
  /** @private {!LocalDb} */
  this.locaDb_ = localDb;
  /** @private {!Map<!Element, string>} */
  this.words_ = new Map();
  /** @private {!Map<string, !WordStatus>} */
  this.wordsStatuses_ = new Map();
  // TODO: Extend this to maintain/lookup context (within reading-state) of each word.
};

/**
 * Adds the given (sequential) word to the reading state and associates it with the provided
 * DOM Element.
 *
 * @param {!WordKey} wordKey
 * @param {!Element} domElement
 * @param {!WordContext} context
 */
ReadingState.prototype.addWord = function(wordKey, domElement, context) {
  if (wordContext) {
    throw new Error('Adding word context is not supported');
  }
  if (this.words_.has(domElement)) {
    var message = 'DOMElement is already registered in ReadingState';
    console.log(message, domElement, wordKey);
    throw Error(message);
  }
  var keyStr = wordKey.valueOf();
  this.words_.set(domElement, keyStr);
  if (!this.wordsStatuses_.has(keyStr)) {
    // We don't know the status.
    this.wordsStatuses_.set(keyStr, WordStatus.NONE);
  }
};

/**
 * Updates the status of the given word key.
 *
 * @param {!WordKey} wordKey
 * @param {!WordStatus} status
 */
ReadingState.prototype.updateWordStatus = function(wordKey, status) {
  this.wordsStatuses_.set(wordKey.valueOf(), status);
};

/**
 * Return the status of the given word key.
 * @param {!WordKey} wordKey
 * @returns {!WordStatus}
 */
ReadingState.prototype.getWordStatus = function(wordKey) {
  var keyStr = wordKey.valueOf();
  var result = this.wordStatuses.get(keyStr);
  if (!result || result == WordStatus.NONE) {
    var word = this.locaDb_.lookup(wordKey);
    if (word) {
      result = word.status;
    } else {
      result = WordStatus.UNKNOWN;
    }
    this.wordsStatuses_.set(keyStr, result);
  }
  return result;
};

/**
 * Returns all the words_ with the given status sorted alphabetically.
 *
 * @param {!WordStatus} status
 * @return {!Array<Word>}
 */
ReadingState.prototype.getWordsByStatus = function(status) {
  throw new Error('Not implemented');
};

ReadingState.prototype.updateLocalDb = function(addContexts) {
  if (addContexts) {
    throw new Error('Updating contexts is not implemented!');
  }
  this.wordsStatuses_.forEach(function(keyStr, status) {
    var wordKey = WordKey.parse(keyStr);
    if (status == WordStatus.NONE) {
      status = this.getWordStatus(wordKey);
    }
    var word = this.localDb_.lookup(wordKey);
    if (!word || (status != word.status && status != WordStatus.NONE)) {
      if (word) {
        word.status = status;
      } else {
        word = new Word(wordKey.word, wordKey.lang, status, 1, 0);
      }
      this.locaDb_.save(word);
    }
  }, this);
};
