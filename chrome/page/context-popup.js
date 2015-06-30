/**
 * ContextPopup displayed to the user when hovering over words.
 * @param {!WordManager} wordManager
 * @param {!WordKey} wordKey
 * @constructor
 */
ContextPopup = function(wordManager, wordKey) {
  this.wordManager_ = wordManager;
  this.wordKey_ = wordKey;
};

/**
 * Updates the word's status.
 * @param {WordStatus} wordStatus
 */
ContextPopup.prototype.updateSelectedWord_ = function(wordStatus) {
  var wordKeyString = this.wordKey_.valueOf();
  this.wordManager_.updateWordStatus(wordKeyString, wordStatus);
  this.wordManager_.persistStatusChangeInReadingState(wordKeyString, wordStatus);
};

/**
 * Returns the WordStatus as string.
 * @param {WordStatus} wordStatus
 * @returns {String}
 */
ContextPopup.prototype.getStatusMenuOption_ = function(wordStatus) {
  switch (wordStatus) {
	case WordStatus.KNOWN:
	  return 'known';

	case WordStatus.FAMILIAR:
	  return 'familiar';

	case WordStatus.UNKNOWN:
	  return 'unknown';
	    
	case WordStatus.IGNORED:
      return 'ignored';

	default:
	  throw new Error('Unknown WordStatus constant: ' + wordStatus);
  }
};

/**
 * Adds a new option to the context menu.
 * @param {Element} menu
 * @param {WordStatus} wordStatus
 */
ContextPopup.prototype.addMenuOption_ = function(menu, wordStatus, title) {
  var optionItem = document.createElement('img');
  optionItem.title = title;
  optionItem.classList.add('mylingva-status-button');
  optionItem.src = chrome.extension.getURL('page/resources/'
      + this.getStatusMenuOption_(wordStatus) + '-word.png');
  
  var self = this;
  optionItem.addEventListener('click', function(e) {
	  self.updateSelectedWord_(wordStatus);});
  optionItem.addEventListener('mouseover', function(e) {
	  optionItem.classList.add('mylingva-onhover-status-button'); });
  optionItem.addEventListener('mouseout', function(e) {
	  optionItem.classList.remove('mylingva-onhover-status-button'); });
  
  menu.appendChild(optionItem);
};

/**
 * Creates an UpdateMenu DOM element and returns it.
 * @param {Element} wordSpan
 * @returns {Element}
 */
ContextPopup.prototype.createUpdateMenu_ = function(wordSpan) {
  this.hideContextPopup();
	
  var contextMenu = document.createElement('div');

  var statusMenu = document.createElement('div');

  this.addMenuOption_(statusMenu, WordStatus.IGNORED, 'Ignore this word.');
  this.addMenuOption_(statusMenu, WordStatus.UNKNOWN, 'I don\'t know this word.');
  this.addMenuOption_(statusMenu, WordStatus.FAMILIAR, 'I am familiar with this word.');
  this.addMenuOption_(statusMenu, WordStatus.KNOWN, 'I know this word.');
  contextMenu.appendChild(statusMenu);

  contextMenu.setAttribute('id', 'mylingva-context-popup');
  contextMenu.classList.add('mylingva-context-popup');
  contextMenu.addEventListener('mouseout', function(e) {
    if (!document.getElementById('mylingva-context-popup').contains(e.toElement))  {
  	  this.hideContextPopup(e);
  	  wordSpan.classList.remove('mylingva-selected-word');
  	}
  }.bind(this));

  document.documentElement.appendChild(contextMenu);

  return contextMenu;
};

/**
 * Displays the context popup.
 * @param {Event} e
 */
ContextPopup.prototype.showContextPopup = function(e) {
  var contextPopup = this.createUpdateMenu_(e.target);

  var popupRect = e.target.getBoundingClientRect();

  contextPopup.style.left = window.pageXOffset + popupRect.left + 'px';
  contextPopup.style.top = window.pageYOffset + popupRect.bottom + 'px';
};

/**
 * Hides the context popup.
 */
ContextPopup.prototype.hideContextPopup = function() {
  var element = document.getElementById('mylingva-context-popup');
  
  if (element) {
    element.parentElement.removeChild(element);
  }
};