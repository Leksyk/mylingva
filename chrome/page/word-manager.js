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
  if (domElement.nodeType == 3 && isDomElementVisible(domElement.parentNode)) {
    this.processText_(domElement.textContent, domElement);	  
  }
	
  var childNodeNumber = domElement.childNodes.length;
  for (var i = 0; i < childNodeNumber; i++) {
    this.processDomElement_(domElement.childNodes[i]);
  }
};

/**
 * Parses the text into sentences and calls the word processing function.
 * @param {string} text
 * @param {Element} domElement
 */
WordManager.prototype.processText_ = function(text, domElement) {
  if (!domElement.parentNode) {
    return;
  }
	
  var lastCharacter = text.substr(text.length - 1);  
  
  var sentencesFromText = this.parseSentences_(text + ".");
  var sentanceWrapper = document.createElement('span');
  
  for (i = 0; i < sentencesFromText.length; i++) {
	if(i == sentencesFromText.length - 1) {
		sentencesFromText[i] = sentencesFromText[i].substring(
		    0, sentencesFromText[i].length - 2) + lastCharacter;
	}
    this.processWords_ (sentencesFromText[i], sentanceWrapper);
  }
  
  domElement.parentNode.replaceChild(sentanceWrapper, domElement);
};

/**
 * Parses the given text into sentences, returning a sentence array.
 * @returns {Array}
 */
WordManager.prototype.parseSentences_ = function(text) {	
  var splitText = text.match(/\(?[^\.\?\!]+[\.!\?]\)?/g);
  
  if (!splitText) {
    return [text];
  }

  var sentences = [];
  for (var i = 0; i < splitText.length; i++) {
    if(splitText[i]) {
      sentences.push(splitText[i]);
    }  
  }
		
  return sentences;
};

/**
 * Returns a unique ID for a given word in our detected language.
 * @param word
 * @returns {String}
 */
WordManager.prototype.getWordId_ = function(word) {
	return "w-" + formatText(word) +"-" + this.language_;
};

/**
 * Parses the text, saves the resulting words and wraps them inside spans in the DOM.
 * @param {string} text
 * @param {Element} domElement
 */
WordManager.prototype.processWords_ = function(text, domElement) {
  var splitText = text.split(/\s+/);
  
  for (var i = 0; i < splitText.length; i++) {
    if (splitText[i]) {
      var wordSpan = document.createElement('span');
      
      wordSpan.innerHTML = " " + splitText[i];
      wordSpan.setAttribute("id", this.getWordId_(formatText(splitText[i].toLowerCase())));
      domElement.appendChild(wordSpan);	
      
      if (formatText(splitText[i].toLowerCase())) {
	    this.readingState_.addWord(new WordKey(formatText(splitText[i].toLowerCase()), this.language_), wordSpan, null);
      }
    }
  }
};

