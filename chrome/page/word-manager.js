/**
 * Handles the parsing of the page content as well as saving the words.
 *
 * @param {!Element} pageContent
 * @param {!Lang} language
 * @param {!ReadingState} readingState
 * @constructor
 */
WordManager = function(pageContent, language, readingState) {
  this.pageContent_ = pageContent;
  this.language_ = language;
  this.readingState_ = readingState;
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

