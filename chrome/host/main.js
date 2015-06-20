
/**
 * The connected client ports.
 * @type {!Object<number, !chrome.tabs.Tab>}
 */
var clientTabs = {};

function injectScripts(tabId, scripts, callback) {
  // Recursively pass itself to the callback to executeScript until all the scripts are loaded.
  var script = scripts[0];
  scripts = scripts.slice(1);
  callback = scripts.length > 0 ? injectScripts.bind(null, tabId, scripts, callback) : callback;
  chrome.tabs.executeScript(tabId, {
    file: script,
    runAt: 'document_idle'
  }, callback);
}

function injectCss(tabId, file, callback) {
  chrome.tabs.insertCSS(tabId, {
    file: file,
    runAt: 'document_idle'
  }, callback);
}

/**
 * Accepts the list of words, retrieves their statuses and sends the update message to the given
 * tab to update its word statuses.
 *
 * @param {number} tabId
 * @param {string} wordKeyStrs - string representation of WordKey.
 */
function communicateWordsStatuses(tabId, wordKeyStrs) {
  console.log('communicate words statuses', arguments);
  var result = {};
  var localDb = new LocalDb();
  for (var wordKeyStr of wordKeyStrs) {
    var word = localDb.lookup(WordKey.parse(wordKeyStr));
    result[wordKeyStr] = word ? word.status : WordStatus.UNKNOWN;
  }
  chrome.tabs.sendMessage(tabId, {
    method: 'set-words-statuses',
    wordToStatus: result
  });
}

/**
 * Sends the given message to all the connected clients.
 *
 * @param {!Object} message
 */
function communicateToAllClients(message) {
  for (var tabId of Object.keys(clientTabs)) {
    chrome.tabs.sendMessage(parseInt(tabId), message);
  }
}

/**
 * Notifies all the connected clients that the given words got changed.
 *
 * @param {!Array<!WordUpdates>} wordKeys
 */
function communicateWordUpdates(wordKeys) {
  if (wordKeys.length == 0) {
    return;
  }
  var localDb = new LocalDb();
  var words = [];
  for (var wk of wordKeys) {
    words.push(localDb.lookup(WordKey.parse(wk.wordKey)));
  }
  communicateToAllClients({
    method: 'update-words',
    words: words
  });
}

/**
 * Initializes the extension code on the target page side.
 *
 * @param {number} tabId
 * @param {!Lang} language
 */
function initClientScript(tabId, language) {
  chrome.tabs.sendMessage(tabId, {
    method: 'init',
    extId: chrome.runtime.id,
    language: language
  }, communicateWordsStatuses.bind(null, tabId));
}

/**
 * Converts language code to Lang enum.
 *
 * @param {string} langCode
 * @returns {!Lang}
 */
function getLanguageEnum(langCode) {
  var result = Lang.parse(langCode);
  if (!result) {
    alert("MyLingva does not support " + langCode + " yet.");
  }
  return result;
}

/**
 * Asynchronously detects language of the given tab and passes it to the callback.
 * @param {number} tabId
 * @param {Function<!Lang>} callback
 */
function detectLanguage(tabId, callback) {
  chrome.tabs.detectLanguage(tabId, function(langCode) {
    var lang = getLanguageEnum(langCode);
    callback(lang);
  });
}

/**
 * Persists the given updates to the local-db.
 *
 * @param {!Array<!WordUpdates>} words
 */
function saveWords(words) {
  var localDb = new LocalDb();
  var updatedWordKeys = [];
  for (var updates of words) {
    console.log('Persisting update: ', updates);
    
    var wordKey = WordKey.parse(updates.wordKey);

    if (updates.status) {
      var word = new Word(wordKey.word, wordKey.lang, updates.status);
      localDb.save(word);
    }
    // This is not efficient - this operation should make one update per word.
    for (var context of updates.new_contexts) {
      localDb.addContext(updates.wordKey, context);
    }

    updatedWordKeys.push(wordKey);
  }
  communicateWordUpdates(words);
}

/**
 * Client-side scripts in order of their dependencies.
 *
 * @const {!Array<string>}
 */
var CLIENT_SCRIPTS = [
  'common/models.js',
  'page/helpers.js',
  'page/reading-state.js',
  'page/word-manager.js',
  'page/context-popup.js',
  'libs/angular.js',
  'libs/jquery.js',
  'page/menu.js',
  'page/main.js'
];

chrome.browserAction.onClicked.addListener(function(tab) {
  setupGoogleAnalytics();
  detectLanguage(tab.id, function(language) {
    sendStartEvent(tab.incognito ? '' : tab.url, language);
    var url = new URL(tab.url);
    var domain = url.protocol + '//' + url.hostname + '/';
    chrome.permissions.request({
      permissions: ['tabs'],
      origins: [domain]
    }, function(granted) {
      if (granted) {
        function injectCssAndInit(tabId, language) {
          // Do not wait for inject css since it's OK to have it finished after statuses arrive.
          injectCss(tabId, 'page/styles.css', null);
          initClientScript(tabId, language);
        }
        injectScripts(tab.id, CLIENT_SCRIPTS, injectCssAndInit.bind(null, tab.id, language));
      } else {
        throw Error('Permissions rejected');
      }
    });
  });
});

chrome.runtime.onConnect.addListener(function(port) {
  var tab = port.sender.tab;
  console.info('Connected client port', tab.id, tab.url, tab);
  port.onDisconnect.addListener(function(port) {
    var tab = port.sender.tab;
    console.info('Disconnected client port', tab.id, tab.url, tab);
    delete clientTabs[tab.id];
  });
  clientTabs[tab.id] = tab;
  port.onMessage.addListener(function(tab, msg) {
    console.info('Received message', msg.method, 'from', tab.id, tab.url, tab);
    try {
      switch (msg.method) {
        case 'save-words':
          var words = JSON.parse(msg.words);
          saveWords(words);
          break;

        default:
          console.error('Unexpected message: ' + JSON.stringify(msg));
      }
    } catch (e) {
      console.error(e);
    }
  }.bind(null, tab));
});