/**
 * Handles the parsing of the page content as well as saving the words.
 *
 * @param {Element} pageContent
 * @param {string} language
 * @constructor
 */
WordManager = function(pageContent, language) {
  this.pageContent_ = pageContent;
  this.language_ = this.getLanguageName_(language);
  this.readingState_ = new ReadingState(false);
};

/**
 * Calls the DOM traversal function starting from the pageContent Element.
 */
WordManager.prototype.processPageContent = function() {
  this.processDomElement_(this.pageContent_);
};

/**
 * Traverses the DOM element tree and calls a text parsing function for each leaf.
 * @param {Element} domElement
 */
WordManager.prototype.processDomElement_ = function(domElement) {
  for (var i = 0; i < domElement.children.length; i++) {
    if (domElement.children[i].children.length > 0 &&
        isDomElementVisible(domElement.children[i])) {
      this.processDomElement_(domElement.children[i]);
      
      for (j = 0; j < domElement.children[i].childNodes.length; j++) {
        if (domElement.children[i].childNodes[j].nodeType == 3) {
       	  this.processText_(domElement.children[i].childNodes[j].textContent, domElement.children[i]);	  
   	    }
      }
    } else {
      if (domElement.children[i].textContent && isDomElementVisible(domElement.children[i])) {
	    this.processText_(domElement.children[i].textContent, domElement.children[i]);
	  }
	}
  }
};

/**
 * Parses the text into sentences and calls the word processing function.
 * @param {string} text
 * @param {Element} domElement
 */
WordManager.prototype.processText_ = function(text, domElement) {
  var sentencesFromText = this.parseSentences_(text);
	
  for (i = 0; i < sentencesFromText.length; i++) {
    this.processWords_ (sentencesFromText[i], domElement);
  }
};

/**
 * Parses the given text into sentences, returning a sentence array.
 * @returns {Array}
 */
WordManager.prototype.parseSentences_ = function(text) {
  var splitText = text.split(/[.!?;]+/);
	
  var sentences = [];
  for (var i = 0; i < splitText.length; i++) {
    if (splitText[i].toLowerCase().match(/[a-z]/i)) {
      sentences.push(formatSentence(splitText[i]));
    }
  }
	
  return sentences;
};

/**
 * Parses the text and saves the resulting words.
 * @param {string} text
 * @param {Element} domElement
 */
WordManager.prototype.processWords_ = function(text, domElement) {
  var splitText = text.split(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~\s]/);

  for (var i = 0; i < splitText.length; i++) {
    if (splitText[i].toLowerCase()) {
	  this.readingState_.addWord(new WordKey(splitText[i], this.language_), domElement, null);
	}
  }
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
	  alert("MyLingva does not support the page's langauge yet.");
  }
  return result;
};
