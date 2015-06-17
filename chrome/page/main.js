var readingState = null;
var messagePort = null;
var wordManager = null;
var pageMenu = null;

function reconnectToExtension(extId) {
  if (messagePort) {
    try {
      messagePort.disconnect();
    } finally {
      messagePort = null;
      wordManager = null;
      readingState = null;
    }
  }
  messagePort = chrome.runtime.connect(extId);
}

/**
 * Initializes the extension within the target page.
 * Returns list of all the words used in the page.
 *
 * @param {string} extId
 * @param {!Lang} language
 * @return {!Array<string>} string representation of WordKey(s).
 */
function init(extId, language) {
  console.log('init', arguments);
  reconnectToExtension(extId);
  readingState = new ReadingState(false);
  pageMenu = new PageMenuModule(extId);
  pageMenu.buildUi();
  wordManager = new WordManager(document.documentElement, language, readingState);
  wordManager.processPageContent();
  return readingState.getWordsKeyStrs();
}

/**
 * Accepts the mapping from words to their statuses as known by the extension.
 * @param {!Object<string, !WordStatus>} wordToStatus - word is string representation of WordKey.
 */
function setWordsStatuses(wordToStatus) {
  readingState.setWordsStatuses(wordToStatus);
  for (var wordKeyStr of Object.keys(wordToStatus)) {
    var status = wordToStatus[wordKeyStr];
    wordManager.updateWordStatus(wordKeyStr, status);
  }
}

/**
 * Given that all the updates are made to the readingState, communicates
 * those update (to the given word) to the localDb (hosted in the extension).
 * TODO: Give this as a callback to the popup UI.
 */
function communicateWordUpdatesToLocalDb(wordKeyStr) {
  var wordKey = WordKey.parse(wordKeyStr);
  messagePort.postMessage({
    method: 'save-words',
    words: JSON.stringify([readingState.getWordUpdates(wordKey)])
  })
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      try {
        switch (message.method) {
          case 'init':
            sendResponse(init(message.extId, message.language));
            break;

          case 'set-words-statuses':
            setWordsStatuses(message.wordToStatus);
            break;

          default:
            console.error('Unrecognized message: ' + JSON.stringify(message));
        }
      } catch (e) {
        console.error(e);
      }
    }
);