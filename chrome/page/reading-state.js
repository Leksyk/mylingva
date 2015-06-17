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
  /** @private {!Map<string, !WordUpdates>} */
  this.wordsUpdates_ = new Map();
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
  if (this.failOnDuplicatedDOMElements_ && this.words_.has(domElement)) {
    var message = 'DOMElement is already registered in ReadingState';
    console.error(message, domElement, wordKey);
    throw Error(message);
  }
  var keyStr = wordKey.valueOf();
  this.words_.set(domElement, keyStr);
  var updates = this.wordsUpdates_.get(keyStr);
  if (!updates) {
    updates = new WordUpdates(keyStr);
    // We don't know the status.
    updates.status = WordStatus.NONE;
    this.wordsUpdates_.set(keyStr, updates);
  }
  if (context) {
    updates.new_contexts.push(context);
    // Defence to not blow up the reading-state.
    if (updates.new_contexts.length > 10) {
      updates.new_contexts.shift();
    }
  }
};

/**
 * Updates the status of the given word key.
 *
 * @param {!WordKey} wordKey
 * @param {!WordStatus} status
 */
ReadingState.prototype.updateWordStatus = function(wordKey, status) {
  var updates = this.wordsUpdates_.get(wordKey.valueOf());
  if (!updates) {
    updates = new WordUpdates(wordKey);
    this.wordsUpdates_.set(wordKey.valueOf(), updates);
  }
  updates.status = status;
};

/**
 * Return the status of the given word key.
 * @param {!WordKey} wordKey
 * @return {!WordStatus}
 */
ReadingState.prototype.getWordUpdates = function(wordKey) {
  return this.wordsUpdates_.get(wordKey.valueOf());
};

/**
 * Returns all the words it holds.
 *
 * @return {!Array<string>} each element is a string representation of a WordKey.
 */
ReadingState.prototype.getWordsKeyStrs = function() {
  var result = [];
  for (var word of this.wordsUpdates_.keys()) {
    result.push(word);
  }
  return result;
};

/**
 * Updates words in reading state with the provided mapping to statuses.
 *
 * @param {!Object<string, !WordStatus>} wordKeyStrToStatus - word is string repr of WordKey.
 */
ReadingState.prototype.setWordsStatuses = function(wordKeyStrToStatus) {
  for (var wordKeyStr of Object.keys(wordKeyStrToStatus)) {
    this.updateWordStatus(WordKey.parse(wordKeyStr), wordKeyStrToStatus[wordKeyStr]);
  }
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
