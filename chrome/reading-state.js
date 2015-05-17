/**
 * Temporary page-specific state of text and all its words.
 *
 * @constructor
 */
ReadingState = function() {
  /** @type {!Object<!Element, !Word>} */
  this.words = {};
  // TODO: Extend this to maintain/lookup context (within reading-state) of each word.
};

/**
 * Adds the given (sequential) word to the reading state and associates it with the provided
 * DOM Element.
 *
 * @param {!Word} word
 * @param {!Element} domElement
 */
ReadingState.prototype.addWord = function(word, domElement) {
  if (domElement in this.words) {
    var message = 'DOMElement is already registered in ReadingState';
    console.log(message, domElement, word);
    throw Error(message);
  }
  this.words[domElement] = word;
  throw new Error('Not implemented');
};

/**
 * Updates the status of the given word.
 *
 * @param {!WordKey} wordKey
 * @param {!WordStatus} status
 */
ReadingState.prototype.updateWordStatus = function(wordKey, status) {
  throw new Error('Not implemented');
};

/**
 * Returns all the words with the given status sorted alphabetically.
 *
 * @param {!WordStatus} status
 * @return {!Array<Word>}
 */
ReadingState.prototype.getWordsByStatus = function(status) {
  throw new Error('Not implemented');
};