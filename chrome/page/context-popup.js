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
ContextPopup.prototype.addMenuOption_ = function(menu, wordStatus) {
  var optionItem = document.createElement('p');
  optionItem.innerHTML = this.getStatusMenuOption_(wordStatus).toUpperCase();
  
  var self = this;
  optionItem.addEventListener('click', function(e) {
	  self.updateSelectedWord_(wordStatus);});
  menu.appendChild(optionItem);
};

/**
 * Creates an UpdateMenu DOM element and returns it.
 * @returns {Element}
 */
ContextPopup.prototype.createUpdateMenu_ = function() {
  this.hideContextPopup();
	
  var contextMenu = document.createElement('div');

  var menuHeader = document.createElement('p');
  menuHeader.innerHTML = 'Set word status for "' + this.wordKey_.word + '":';
  contextMenu.appendChild(menuHeader);

  this.addMenuOption_(contextMenu, WordStatus.IGNORED);
  this.addMenuOption_(contextMenu, WordStatus.UNKNOWN);
  this.addMenuOption_(contextMenu, WordStatus.FAMILIAR);
  this.addMenuOption_(contextMenu, WordStatus.KNOWN);

  contextMenu.setAttribute('id', 'mylingva-context-popup');
  contextMenu.classList.add('mylingva-context-popup');

  document.documentElement.appendChild(contextMenu);

  return contextMenu;
};

/**
 * Displays the context popup.
 * @param {Event} e
 */
ContextPopup.prototype.showContextPopup = function(e) {
  var contextPopup = this.createUpdateMenu_();

  contextPopup.style.left = pageXOffset + e.clientX + 'px';
  contextPopup.style.top = pageYOffset + e.clientY + 'px';
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