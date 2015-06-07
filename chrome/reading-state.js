/**
 * Temporary page-specific state of text and all its words.
 *
 * @constructor
 * @param {boolean} failOnDuplicatedDOMElements
 * TODO: Remove failOnDuplicatedDOMElements when creating DOM elements for each word is done.
 *
 */
ReadingState = function(failOnDuplicatedDOMElements) {
  /** @private {!Map<!Element, string>} */
  this.words_ = new Map();
  /** @private {!Map<string, !WordStatus>} */
  this.wordsStatuses_ = new Map();
  // TODO: Extend this to maintain/lookup context (within reading-state) of each word.
  this.failOnDuplicatedDOMElements_ = failOnDuplicatedDOMElements
};

/**
 * Adds the given (sequential) word to the reading state and associates it with the provided
 * DOM Element.
 *
 * @param {!WordKey} wordKey
 * @param {!Element} domElement
 * @param {?WordContext} context
 */
ReadingState.prototype.addWord = function(wordKey, domElement, context) {
  if (context) {
    throw new Error('Adding word context is not supported');
  }
  if (this.failOnDuplicatedDOMElements_ && this.words_.has(domElement)) {
    var message = 'DOMElement is already registered in ReadingState';
    console.error(message, domElement, wordKey);
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
  return this.wordStatuses.get(wordKey.valueOf());
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
