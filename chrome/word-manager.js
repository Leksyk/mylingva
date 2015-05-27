/**
 * Handles the parsing of the page text as well as saving the words.
 *
 * @param {string} text
 * @param {string} language
 * @constructor
 */
WordManager = function(text, language) {
  this.text_ = text;
  this.language_ = language;
  this.localDb_ = new LocalDb();
};

/**
 * Parses the text and saves the resulting words.
 */
WordManager.prototype.processWords = function() {
  if (this.language_ != 'en' && this.language_ != 'uk') {
    throw new Error('Language not supported');
  }

  wordsFromText = this.parseWords_();
  this.saveWords_(wordsFromText);
};

/**
 * Parses the given text by blank spaces and separators, returning a lower case word array.
 * @returns {Array}
 */
WordManager.prototype.parseWords_ = function() {
  var splitText = this.text_.split(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\-\.\/:;<=>\?@\[\]\^_`\{\|\}~\s]/);
	
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
 * @returns {Lang}
 */
WordManager.prototype.getLanguageName_ = function() {
  if(this.language_ == 'en') {
    return Lang.ENGLISH;
  }
  else if(this.language_ == 'uk') {
    return Lang.UKRAINIAN;
  }
};

/**
 * Saves words to the LocalDb.
 * @param words
 */
WordManager.prototype.saveWords_ = function(words) {
  var language = this.getLanguageName_();
	
  for (var i = 0; i < words.length; i++) {
    this.localDb_.save({'lang' : language,
			'word' : words[i]});
  }
};
