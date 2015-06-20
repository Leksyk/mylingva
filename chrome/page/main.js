var readingState = null;
var messagePort = null;
var wordManager = null;
var pageMenu = null;
var extensionId = null;

function reconnectToExtension() {
  if (messagePort) {
    try {
      messagePort.disconnect();
    } catch (e) {
      console.warn('Failed on messagePort.disconnect(). Likely lost the extension. Ignoring.');
    } finally {
      messagePort = null;
    }
  }
  messagePort = chrome.runtime.connect(extensionId);
  messagePort.onDisconnect.addListener(function() {
    console.warn('Disconnected from the extension port. Reconnecting...');
    setTimeout(reconnectToExtension, 50);
  });
}

/**
 * Initializes the extension within the target page.
 * Returns list of all the words used in the page.
 *
 * @param {string} extId
 * @param {boolean} saveContexts
 * @param {!Lang} language
 * @return {!Array<string>} string representation of WordKey(s).
 */
function init(extId, incognitoMode, language) {
  console.log('init', arguments);
  extensionId = extId;
  reconnectToExtension(extId);
  readingState = new ReadingState(false);
  pageMenu = new PageMenuModule(extId);
  pageMenu.buildUi();
  wordManager = new WordManager(document.documentElement, language, readingState,
      incognitoMode, window.location.toString());
  // TODO: Convert this to async operation and call the extension back once done.
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
  pageMenu.updateWordStats(readingState.getWordStats());
}

/**
 * Updates the given words on the page, reading state and menus.
 *
 * @param {!Array<!Word>} words
 */
function updateWords(words) {
  var wordToStatus = {};
  for (var word of words) {
    wordManager.updateWordStatus(Word.prototype.getKey.call(word).valueOf(), word.status);
    // The deserialized word doesn't have the right prototype set so need to call this way.
    var wordKey = Word.prototype.getKey.call(word);
    wordToStatus[wordKey.valueOf()] = word.status;
  }
  readingState.setWordsStatuses(wordToStatus);
  pageMenu.updateWordStats(readingState.getWordStats());
}

/**
 * Given that all the updates are made to the readingState, communicates
 * those updates (to the given word) to the localDb (hosted in the extension).
 * TODO: Give this as a callback to the popup UI.
 */
function communicateWordUpdatesToLocalDb(wordKeyStr) {
  var wordKey = WordKey.parse(wordKeyStr);
  var message = {
    method: 'save-words',
    words: JSON.stringify([readingState.getWordUpdates(wordKey)])
  };
  if (messagePort == null) {
    reconnectToExtension();
  }
  for (var i = 0, attempts = 3; i < attempts; ++i) {
    try {
      messagePort.postMessage(message);
      break;
    } catch (e) {
      // If extension got restarted we lose the connection and get error here.
      console.warn('Error while posting message', e, 'Reconnecting...');
      reconnectToExtension();
    }
  }
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      console.info(message.method, message);
      try {
        switch (message.method) {
          case 'init':
            sendResponse(init(message.extId, message.incognitoMode, message.language));
            break;

          case 'set-words-statuses':
            setWordsStatuses(message.wordToStatus);
            break;

          case 'update-words':
            updateWords(message.words);
            break;

          default:
            console.error('Unrecognized message: ' + JSON.stringify(message));
        }
      } catch (e) {
        console.error(e);
      }
    }
);