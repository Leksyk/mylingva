/**
 * Persistent in-browser storage for user's dictionary.
 *
 * @constructor
 */
LocalDb = function() {
};

/**
 * Retrieves the word by it's key.
 *
 * @param {!WordKey} wordKey
 * @return {Word}
 */
LocalDb.prototype.lookup = function(wordKey) {
  throw new Error('Not implemented');
};

/**
 * Retrieves relations to the given wordKey.
 *
 * @param {!WordKey} wordKey
 * @return {!Array<WordRelation>}
 */
LocalDb.prototype.lookupRelations = function(wordKey) {
  throw new Error('Not implemented');
};

/**
 * Retrieves contexts of the given word.
 *
 * @param {!WordKey} wordKey
 * @param {?number} opt_limit max number or most recent contexts to return. Default = 5.
 * @return {!Array<WordContext>}
 */
LocalDb.prototype.lookupContexts = function(wordKey, opt_limit) {
  // TODO: Single lookup method for relations and contexts? Depends on how they will be used.
  throw new Error('Not implemented');
};

/**
 * Persists the given word.
 * @param {!Word} word
 */
LocalDb.prototype.save = function(word) {
  throw new Error('Not implemented');
};

/**
 * Persists the relation for the given word key.
 *
 * @param {!WordKey} wordKey
 * @param {!WordRelation} relation
 */
LocalDb.prototype.addRelation = function(wordKey, relation) {
  throw new Error('Not implemented');
};

/**
 *
 * @param {!WordKey} wordKey
 * @param {!WordContext} context
 */
LocalDb.prototype.addContext = function(wordKey, context) {
  throw new Error('Not implemented');
};
