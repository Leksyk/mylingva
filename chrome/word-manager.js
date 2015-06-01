/**
 * Handles the parsing of the page content as well as saving the words.
 *
 * @param {string} text
 * @param {string} language
 * @constructor
 */
WordManager = function(text, language, localDb) {
  this.text_ = text;
  this.language_ = this.getLanguageName_(language);
  
  this.localDb_ = new LocalDb();
  this.readingState_ = new ReadingState(localDb);
};

/**
 * Converts the page text HTML string into an Element Object and calls the processing function.
 */
WordManager.prototype.processPageContent = function() {
  var parser = new DOMParser();
  var domElement = parser.parseFromString(this.text_, "text/xml");
	
  this.processDomElement_(domElement);
};

/**
 * Traverses the DOM element tree and calls a text parsing function for each leaf.
 * @param {Element} domElement
 */
WordManager.prototype.processDomElement_ = function(domElement) {
	for (var i = 0; i < domElement.children.length; i++) {
		if (domElement.children[i].children.length > 0) {
			this.processDomElement_(domElement.children[i]);
		} else {
			if (domElement.children[i].textContent) {
				this.processWords_(domElement.children[i].textContent, domElement.children[i]);
			}
		}
	}
};

/**
 * Parses the text and saves the resulting words.
 * @param {string} text
 * @param {Element} domElement
 */
WordManager.prototype.processWords_ = function(text, domElement) {
  var wordsFromText = this.parseWords_(text);
  
  this.saveWordsToLocalDb_(wordsFromText);
  //this.saveWordsToReadingState_(wordsFromText, domElement); /* TODO: Discuss DOM Element */
};

/**
 * Parses the given text by blank spaces and separators, returning a lower case word array.
 * @returns {Array}
 */
WordManager.prototype.parseWords_ = function(text) {
  var splitText = text.split(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~\s]/);
	
  var words = [];
	
  for (var i = 0; i < splitText.length; i++) {
    if (splitText[i] != "") {
      words.push(splitText[i].toLowerCase());
    }
  }
  
  return words;
};

/**
 * Returns the language's name in the Lang enum.
 * @param {string} language
 * @returns {Lang}
 */
WordManager.prototype.getLanguageName_ = function(language) {
  var langMap = {
      'en': Lang.ENGLISH,
		  'uk': Lang.UKRAINIAN,
		  'ro': Lang.ROMANIAN};
 
  var result = langMap[language];
  if (!result) {
    // TODO: User needs a nice dialog with an explanation.
    throw new Error('Not supported language: ' + language);
  }
  return result;
};

/**
 * Saves words to the ReadingState.
 * @param {Array} words
 */
WordManager.prototype.saveWordsToReadingState_ = function(words, domElement) {
  for (var i = 0; i < words.length; i++) {
    this.readingState_.addWord(words[i], domElement);
  }
};

/**
 * Saves words to the LocalDb.
 * @param {!Array<string>} words
 */
WordManager.prototype.saveWordsToLocalDb_ = function(words) {
  words.forEach(function(word) {
    var savedWord = this.localDb_.lookup(new WordKey(word, this.language_));
    if (savedWord) {
      // TODO: More changes can come from reading-state.
      savedWord.numTimesSeen++;
      this.localDb_.save(savedWord);
    } else {
      // TODO: The right status has to come from the reading-state.
      this.localDb_.save(new Word(word, this.language_, WordStatus.UNKNOWN, 0, 0));
    }
  }, this);
};
