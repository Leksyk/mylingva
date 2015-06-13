/**
 * Updates the word's status.
 * @param {WordKey} wordKey
 * @param {WordStatus} wordStatus
 */
function updateSelectedWord(wordKey, wordStatus) {
	//TODO: implement word status update.
}

/**
 * Adds a new option to the context menu.
 * @param {Element} menu
 * @param {WordStatus} option
 * @param {WordKey} wordKey
 */
function addMenuOption(menu, option, wordKey) {
  var textOption = ['KNOWN', 'FAMILIAR', 'UNKNOWN', 'IGNORED'];

  var optionItem = document.createElement('p');
  optionItem.innerHTML = textOption[option - 2];
  closeButton.addEventListener('click', function(e) {
	  updateSelectedWord(wordKey, option);});
  menu.appendChild(optionItem);
}

function createUpdateMenu(wordKey) {
  var element = document.getElementById('mylingva-status-updater');

  if (element) {
    element.parentElement.removeChild(element);
  }

  var contextMenu = document.createElement('div');

  var closeButton = document.createElement('p');
  closeButton.innerHTML = 'x';
  closeButton.style.textAlign = 'right';
  closeButton.style.fontSize = 'x-small';
  closeButton.addEventListener('click', function(e) { contextMenu.style.visibility = 'hidden';});
  contextMenu.appendChild(closeButton);

  var menuHeader = document.createElement('p');
  menuHeader.setAttribute('id','menu-header');
  menuHeader.innerHTML = 'Set word status for "' + wordKey.word + '":';
  contextMenu.appendChild(menuHeader);

  addMenuOption(contextMenu, WordStatus.IGNORED);
  addMenuOption(contextMenu, WordStatus.UNKNOWN);
  addMenuOption(contextMenu, WordStatus.FAMILIAR);
  addMenuOption(contextMenu, WordStatus.KNOWN);

  contextMenu.setAttribute('id', 'mylingva-status-updater');
  contextMenu.classList.add('mylingva-status-updater');
  contextMenu.style.visibility = 'visible';

  document.documentElement.appendChild(contextMenu);

  return contextMenu;
}

/**
 * Displays the status updater menu.
 * @param {Event} e
 * @param {WordKey} wordKey
 */
function showUpdateMenu(e, wordKey) {
  createUpdateMenu(wordKey);

  var statusUpdater = createUpdateMenu(wordKey);

  statusUpdater.style.left = pageXOffset + e.clientX+"px";
  statusUpdater.style.top = pageYOffset + e.clientY + "px";
}
