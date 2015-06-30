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
 * @param {!TargetPageDispatcher} dispatcher
 * @param {boolean} incognitoMode
 * @param {?string} url
 * @constructor
 */
WordManager = function(pageContent, language, readingState, dispatcher, incognitoMode, url) {
  this.pageContent_ = pageContent;
  this.language_ = language;
  this.readingState_ = readingState;
  this.dispatcher_ = dispatcher;
  this.incognitoMode_ = incognitoMode;
  this.url_ = url;
  /** @private {ContextPopup} */
  this.shownPopup_ = null;
};

/**
 * Calls the DOM traversal function starting from the pageContent Element.
 */
WordManager.prototype.processPageContent = function() {
  this.processDomElement_(this.pageContent_);
};

/**
 * Persists the changed status to the ReadingState.
 * @param {string} wordKeyStr
 * @param {!WordStatus} wordStatus
 */
WordManager.prototype.persistStatusChangeInReadingState =
    function(wordKeyStr, wordStatus) {
  var parameter = {};
  parameter[wordKeyStr] = wordStatus;
  
  this.readingState_.setWordsStatuses(parameter);
  var wordUpdates = [this.readingState_.getWordUpdates(WordKey.parse(wordKeyStr))];
  this.dispatcher_.updateWords(wordUpdates, this.incognitoMode_ ? null : this.url_);
};

/**
 * Updates status of the given word on the user's page.
 *
 * @param {string} wordKeyStr
 * @param {!WordStatus} wordStatus
 */
WordManager.prototype.updateWordStatus = function(wordKeyStr, wordStatus) {
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
    this.processText_(domElement);
  }
	
  var childNodeNumber = domElement.childNodes.length;
  for (var i = 0; i < childNodeNumber; i++) {
    this.processDomElement_(domElement.childNodes[i]);
  }
};

/**
 * Parses the text into sentences and calls the word processing function.
 * @param {Element} domElement
 */
WordManager.prototype.processText_ = function(domElement) {
  if (!domElement || !domElement.parentNode
    // This check will ignore both span wrappers for words/sentences and our own UI.
    || (domElement.className && domElement.className.indexOf('mylingva') >= 0)) {
    return;
  }
  var text = domElement.textContent;
  if (!text) {
    return;
  }
  var lastCharacter = text.substr(text.length - 1);
  
  if (lastCharacter != "!" && lastCharacter != "?" 
      && lastCharacter != ".") {
    lastCharacter = "";
  }
  
  var sentencesFromText = this.parseSentences_(text + ".");
  var sentenceWrapper = document.createElement('span');
  sentenceWrapper.classList.add('mylingva-span');
  
  for (var i = 0; i < sentencesFromText.length; i++) {
	  if(i == sentencesFromText.length - 1) {
      sentencesFromText[i] = sentencesFromText[i].substring(
          0, sentencesFromText[i].length - 1) + lastCharacter;
    }
    this.processWords_ (sentencesFromText[i], sentenceWrapper);
  }

  domElement.parentNode.replaceChild(sentenceWrapper, domElement);
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
  function formatText(text) {
    return text
        .replace(/(^[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~\s\d]+)/g, '')
        .replace(/([\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~\s\d]+$)/g, '')
        .trim();
  }
  return sentences;
};

/**
 * Parses the text, saves the resulting words and wraps them inside spans in the DOM.
 * @param {string} text
 * @param {Element} domElement
 */
WordManager.prototype.processWords_ = function(text, domElement) {
  var splitText = text.split(/[\s\b\\\/]+/);

  for (var i = 0, l = splitText.length; i < l; i++) {
    var word = splitText[i];
    if (word) {
      var formattedWord = formatText(word.toLowerCase());
      if (formattedWord) {
        var wordKey = new WordKey(formattedWord, this.language_);
        var wordSpan = (function(word, wordKey) {
          var wordSpan = document.createElement('span');
          wordSpan.innerHTML = ' ' + word;
          wordSpan.setAttribute('name', wordKey.valueOf());
          wordSpan.addEventListener('mouseover', function(e) {
            console.log('mouseover', e);
            this.hidePopupIfShown();
        	  this.shownPopup_ = new ContextPopup(this, wordKey);
            this.shownPopup_.showContextPopup(e);
        	  wordSpan.classList.add('mylingva-selected-word');
          }.bind(this));
          wordSpan.addEventListener('mouseout', function(e) {
            console.log('mouseout', e);
        	  if (this.shownPopup_ && !isChild(e.toElement, 'mylingva-context-popup')) {
              this.shownPopup_.hideContextPopup();
        	    wordSpan.classList.remove('mylingva-selected-word');
        	  }
          }.bind(this));
          domElement.appendChild(wordSpan);
          return wordSpan;
        }.bind(this)(word, wordKey));
        var context = this.incognitoMode_ ? null :
          // TODO: Save word position within the quote (will likely need a refactoring of this).
            new WordContext(text, null, new Source(this.url_));
        this.readingState_.addWord(wordKey, wordSpan, context);
      }
      else {
        var textNode = document.createTextNode(' ' + word);  
        domElement.appendChild(textNode);
      }
    }
  }
};

WordManager.prototype.hidePopupIfShown = function() {
  if (this.shownPopup_ != null) {
    try {
      this.shownPopup_.hideContextPopup();
    } finally {
      this.shownPopup_ = null;
    }
  }
};
