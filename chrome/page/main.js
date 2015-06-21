/**
 * Communicates messages to the extensions.
 * @constructor
 */
TargetPageDispatcher = function(extensionId) {
  /** @private {string} */
  this.extensionId_ = extensionId;
  this.reconnectToExtension_();
};

TargetPageDispatcher.prototype.reconnectToExtension_ = function(opt_continuation) {
  if (this.port_) {
    try {
      this.port_.disconnect();
    } catch (e) {
      console.warn('Failed on port.disconnect(). Likely lost the extension. Ignoring.');
    } finally {
      this.port_ = null;
    }
  }
  var retryLater = setTimeout.bind(window, this.reconnectToExtension_.bind(this), 1000);
  try {
    this.port_ = chrome.runtime.connect(this.extensionId_);
  } catch (e) {
    console.warn('Unable to connect to the extension. Will try again', e);
    retryLater();
    return;
  }
  this.port_.onDisconnect.addListener(function() {
    console.warn('Disconnected from the extension port. Reconnecting...');
    retryLater();
  });
  if (opt_continuation) {
    opt_continuation();
  }
};

TargetPageDispatcher.prototype.sendInternal_ = function(message) {
  var sendMessage = function(msg) {
    // Do not bind to port since its instance might change.
    this.port_.postMessage(msg);
  }.bind(this, message);
  try {
    sendMessage();
  } catch (e) {
    this.reconnectToExtension_(sendMessage);
  }
};

/**
 * Communicates the updates/contexts of the given word to the extensions. Updates/contexts are
 * taken from the ReadingState.
 *
 * @param {!Array<!WordUpdates>} wordUpdates
 * @param {?string} url
 *
 */
TargetPageDispatcher.prototype.updateWords = function(wordUpdates, url) {
  this.sendInternal_({
    method: 'save-words',
    url: url,
    words: JSON.stringify(wordUpdates)
  });
};

/**
 * Root controller for the target page code. Connects all the pieces of target page code together.
 *
 * @constructor
 * @param {string} extId
 * @param {boolean} incognitoMode
 * @param {!Lang} language
 */
TargetPageRootController = function(extId, incognitoMode, language) {
  console.log('TargetPageRootController()', arguments);
  this.dispatcher_ = new TargetPageDispatcher(extId);
  /** @private {!ReadingState} */
   this.readingState_ = new ReadingState(false);
  /** @private {!PageMenuModule} */
   this.pageMenu_ = new PageMenuModule(extId);
   this.pageMenu_.buildUi();
  /** @private {!WordManager} */
   this.wordManager_ = new WordManager(document.documentElement, language,
       this.readingState_, this.dispatcher_, incognitoMode, window.location.toString());
};

/**
 * Initializes the extension within the target page.
 * Returns list of all the words used in the page.
 *
 * @return {!Array<string>} string representation of WordKey(s).
 */
TargetPageRootController.prototype.init = function() {
  // TODO: Convert this to async operation and call the extension back once done.
  this.wordManager_.processPageContent();
  return this.readingState_.getWordsKeyStrs();
};

/**
 * Updates the given words on the page, reading state and menus.
 *
 * @param {!Array<!Word>} words
 */
TargetPageRootController.prototype.updateWords = function(words) {
  var wordToStatus = {};
  for (var word of words) {
    this.wordManager_.updateWordStatus(Word.prototype.getKey.call(word).valueOf(), word.status);
    // The deserialized word doesn't have the right prototype set so need to call this way.
    var wordKey = Word.prototype.getKey.call(word);
    wordToStatus[wordKey.valueOf()] = word.status;
  }
  this.readingState_.setWordsStatuses(wordToStatus);
  this.pageMenu_.updateWordStats(this.readingState_.getWordStats());
};

/**
 * Accepts the mapping from words to their statuses as known by the extension.
 * @param {!Object<string, !WordStatus>} wordToStatus - word is string representation of WordKey.
 */
TargetPageRootController.prototype.setWordsStatuses = function(wordToStatus) {
  this.readingState_.setWordsStatuses(wordToStatus);
  for (var wordKeyStr of Object.keys(wordToStatus)) {
    var status = wordToStatus[wordKeyStr];
    this.wordManager_.updateWordStatus(wordKeyStr, status);
  }
  this.pageMenu_.updateWordStats(this.readingState_.getWordStats());
};

TargetPageRootController.prototype.selectWord = function(wordKey) {
  this.pageMenu_.selectWord(wordKey);
};

(function() {
  var rootController = null;

  chrome.runtime.onMessage.addListener(
      function (message, sender, sendResponse) {
        console.info(message.method, message);
        try {
          switch (message.method) {
            case 'init':
              rootController = new TargetPageRootController(
                  message.extId, message.incognitoMode, message.language);
              var response = rootController.init();
              sendResponse(response);
              break;

            case 'set-words-statuses':
              rootController.setWordsStatuses(message.wordToStatus);
              break;

            case 'update-words':
              rootController.updateWords(message.words);
              break;

            default:
              console.error('Unrecognized message: ' + JSON.stringify(message));
          }
        } catch (e) {
          console.error(e);
        }
      }
  );
})();