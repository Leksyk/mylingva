var readingState = null;
var messagePort = null;
var wordManager = null;

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
  wordManager = new WordManager(document.documentElement, language, readingState);
  wordManager.processPageContent();
  return readingState.getWordsKeyStrs();
}

/**
 * Accepts the mapping from words to their statuses as known by the extension.
 * @param {!Object<string, !WordStatus>} wordToStatus - word is string representation of WordKey.
 */
function setWordsStatuses(wordToStatus) {
  console.log('setwords statuses', arguments);
  readingState.setWordsStatuses(wordToStatus);
  for (var wordKeyStr of Object.keys(wordToStatus)) {
    var status = wordToStatus[wordKeyStr];
    wordManager.updateWordStatus(wordKeyStr, status);
  }
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      switch (message.method) {
        case 'init':
          sendResponse(init(message.extId, message.language));
          break;

        case 'set-words-statuses':
          setWordsStatuses(message.wordToStatus);
          break;

        default:
          throw new Error('Unrecognized message: ' + message);
      }
    }
);