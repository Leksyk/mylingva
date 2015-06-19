/**
 * Persistent in-browser storage for user's dictionary.
 *
 * @constructor
 */
LocalDb = function() {
  /** @type {!Storage} */
  this.storage_ = localStorage;
};

/**
 * Retrieves the word by it's key.
 *
 * @param {!WordKey} wordKey
 * @return {Word}
 */
LocalDb.prototype.lookup = function(wordKey) {
  var value = this.fetchStorageObject_(wordKey);
  return value ? value.word : null;
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
  var value = this.fetchStorageObject_(word);
  if (value) {
    value.word = word;
  } else {
    value = this.createWordStorageObject_(word);
  }
  this.saveStorageObject_(word, value);
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

/**
 * Returns all the word keys saved to local-db.
 *
 * @return {!Array<!Word>}
 */
LocalDb.prototype.listWords = function() {
  var result = [];
  for (var i = 0, l = this.storage_.length; i < l; ++i) {
    var keyStr = this.storage_.key(i);
    if (keyStr.indexOf('w-') == 0) {
      keyStr = keyStr.substr(2);
      var key = WordKey.parse(keyStr);
      result.push(this.lookup(key));
    }
  }
  return result;
};

/**
 * @param {!Word|!WordKey} word
 * @return {string}
 * @private
 */
LocalDb.prototype.getWordStorageKey_ = function(word) {
  return 'w-' + WordKey.prototype.valueOf.call(word);
};

/**
 * @param {!Object} obj
 * @returns {string}
 * @private
 */
LocalDb.prototype.serialize_ = function(obj) {
  return JSON.stringify(obj);
};

/**
 * @param {string} jsonString
 * @returns {!Object}
 * @private
 */
LocalDb.prototype.deserialize_ = function(jsonString) {
  return JSON.parse(jsonString);
};

/**
 * @return {!Object}
 * @private
 */
LocalDb.prototype.createWordStorageObject_ = function(word, opt_contexts, opt_relations) {
  return {
    'word': word,
    'contexts': opt_contexts,
    'relations': opt_relations
  }
};

/**
 * @private {!Word|!WordKey}
 * @return {!Object}
 * @private
 */
LocalDb.prototype.fetchStorageObject_ = function(wordKey) {
  var key = this.getWordStorageKey_(wordKey);
  var value = this.storage_.getItem(key);
  var result = value ? this.deserialize_(value) : null;
  return result;
};

/**
 * @param {!Word|!WordKey} wordKey
 * @param {!Object} storageObj
 * @private
 */
LocalDb.prototype.saveStorageObject_ = function(wordKey, storageObj) {
  var key = this.getWordStorageKey_(wordKey);
  var value = this.serialize_(storageObj);
  this.storage_.setItem(key, value);
};
