/**
 * Handles the parsing of the page text as well as saving the words.
 *
 * @param {string} text
 * @param {string} language
 * @constructor
 */
WordManager = function(text, language) {
  this.text_ = text;
  this.language_ = this.getLanguageName_(language);
  this.localDb_ = new LocalDb();
};

/**
 * Parses the text and saves the resulting words.
 */
WordManager.prototype.processWords = function() {
  if (this.language_ != Lang.ENGLISH && this.language_ != Lang.UKRAINIAN) {
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
 * @param {string} words
 * @returns {Lang}
 */
WordManager.prototype.getLanguageName_ = function(language) {
  var langMap = {'en': Lang.ENGLISH,
		         'uk': Lang.UKRAINIAN};
 
  return langMap[language];
};

/**
 * Saves words to the LocalDb.
 * @param {Array} words
 */
WordManager.prototype.saveWords_ = function(words) {
  for (var i = 0; i < words.length; i++) {
	  var savedWord = this.localDb_.lookup(new Word(words[i], this.language_));
	 
	if (savedWord) {
		savedWord.numTimesSeen++;
		this.localDb_.save(savedWord);	
	} else {
	  this.localDb_.save(new Word(words[i], this.language_));	
	}
  }
};
