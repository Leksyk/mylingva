function getDocumentContent(document) {
	return document.documentElement;
}

// Content scripts registration.
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      if(request.method == "getDocumentContent") {
        sendResponse({data: getDocumentContent(document), method: "getDocumentContent"});
      }
    }
);

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

function initClientScript(tabId, language) {
  console.log('injected');
  chrome.tabs.sendMessage(tabId, {
    method: 'init',
    language: language
  }, function() {
    // TODO: Make init return the actual list of words found.
    // TODO: Issue another event that would update client side on statuses of those words.
    console.log('init responded with', arguments);
  });
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
  'page/main.js'
];

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.detectLanguage(tab.id, function(language) {
    console.log('language', language, tab);
    var url = new URL(tab.url);
    var domain = url.protocol + '//' + url.hostname + '/';
    console.log('domain', domain);
    chrome.permissions.request({
      permissions: ['tabs'],
      origins: [domain]
    }, function(granted) {
      if (granted) {
        injectScripts(tab.id, CLIENT_SCRIPTS, initClientScript.bind(null, tab.id, language));
      } else {
        throw Error('Permissions rejected');
      }
    });
  });
});