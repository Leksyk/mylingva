/**
 * Handles the parsing of the page content as well as saving the words.
 *
 * @param {string} text
 * @param {string} language
 * @constructor
 */
WordManager = function(text, language) {
  this.text_ = text;
  this.language_ = this.getLanguageName_(language);
  this.readingState_ = new ReadingState(false);
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
  // TODO: Take care of the invisible elements on the original page.
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

  this.saveWordsToReadingState_(wordsFromText, domElement);
};

/**
 * Parses the given text by blank spaces and separators, returning a lower case word array.
 * @returns {Array}
 */
WordManager.prototype.parseWords_ = function(text) {
  var splitText = text.split(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~\s]/);
	
  var words = [];
  // TODO: Add words to the reading-state as we iterate through the elements.
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
 * @param {!Element} domElement
 */
WordManager.prototype.saveWordsToReadingState_ = function(words, domElement) {
  for (var i = 0; i < words.length; i++) {
    this.readingState_.addWord(new WordKey(words[i], this.language_), domElement, null);
  }
};