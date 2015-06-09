var readingState = null;

/**
 * Initializes the extension within the target page.
 * Returns list of all the words used in the page.
 *
 * @param {!Lang} language
 * @return {!Array<string>} string representation of WordKey(s).
 */
function init(language) {
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
  readingState.setWordsStatuses(wordToStatus);
  // TODO: Now communicate this statuses to the DOM (e.g. by setting css-classes).
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      switch (message.method) {
        case 'init':
          sendResponse(init(message.language));
          break;

        case 'set-words-statuses':
          setWordsStatuses(message.wordToStatus);
          break;

        default:
          throw new Error('Unrecognized message: ' + message);
      }
    }
);