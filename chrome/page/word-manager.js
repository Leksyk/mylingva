var STATUS_TO_CSS_CLASS = {};
STATUS_TO_CSS_CLASS[WordStatus.NONE] = 'mylingva-unknown-word';
STATUS_TO_CSS_CLASS[WordStatus.UNKNOWN] = 'mylingva-unknown-word';
STATUS_TO_CSS_CLASS[WordStatus.KNOWN] = 'mylingva-known-word';
STATUS_TO_CSS_CLASS[WordStatus.FAMILIAR] = 'mylingva-familiar-word';
STATUS_TO_CSS_CLASS[WordStatus.IGNORED] = 'mylingva-ignored-word';

var CSS_CLASS_LIST = ['mylingva-known-word', 'mylingva-unknown-word',
  'mylingva-familiar-word', 'mylingva-ignored-word'];

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
 * Updates status of the given word on the user's page.
 *
 * @param {string} wordKeyStr
 * @param {!WordStatus} wordStatus
 */
WordManager.prototype.updateWordStatus = function(wordKeyStr, wordStatus) {
  console.log('update word statuses', arguments);
  var elements = document.getElementsByName(wordKeyStr);
  var targetClass = STATUS_TO_CSS_CLASS[wordStatus];
  for (var i = 0, length = elements.length; i < length; ++i) {
    var element = elements.item(i);
    for (var ci = 0, clength = CSS_CLASS_LIST.length; ci < clength; ++ci) {
      var cssClass = CSS_CLASS_LIST[ci];
      if (cssClass != targetClass) {
        element.classList.remove(cssClass);
      } else {
        element.classList.add(cssClass);
      }
    }
  }
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
  
  if (lastCharacter != "!" && lastCharacter != "?" 
      && lastCharacter != ".") {
    lastCharacter = "";
  }
  
  var sentencesFromText = this.parseSentences_(text + ".");
  var sentanceWrapper = document.createElement('span');
  
  for (i = 0; i < sentencesFromText.length; i++) {
	if(i == sentencesFromText.length - 1) {
		sentencesFromText[i] = sentencesFromText[i].substring(
		    0, sentencesFromText[i].length - 1) + lastCharacter;
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
 * Parses the text, saves the resulting words and wraps them inside spans in the DOM.
 * @param {string} text
 * @param {Element} domElement
 */
WordManager.prototype.processWords_ = function(text, domElement) {
  var splitText = text.split(/\s+/);

  for (var i = 0; i < splitText.length; i++) {
    var word = splitText[i];
    if (word) {
      var formattedWord = formatText(word.toLowerCase());
      if (formattedWord) {
        var wordKey = new WordKey(formattedWord, this.language_);
        var wordSpan = document.createElement('span');
        wordSpan.innerHTML = ' ' + word;
        wordSpan.setAttribute('name', wordKey.valueOf());
        domElement.appendChild(wordSpan);
        this.readingState_.addWord(wordKey, wordSpan, null);
      }
    }
  }
};


