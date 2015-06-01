function getDocumentContent(document) {
	return document.documentElement.outerHTML;
}

// Content scripts registration.
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      if(request.method == "getText") {
        sendResponse({data: getDocumentContent(document), method: "getText"});
      }
    }
);

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.detectLanguage(tab.id, function(language) {
    console.log('language', language, tab);
    var onInjected = function() {
      console.log('injected');
      chrome.tabs.sendMessage(tab.id, 'getText', function() {
        console.log('after getText', arguments);
    	
        var wordManager = new WordManager(arguments[0].data, language);
        wordManager.processPageContent();
         
      });
    };
    var url = new URL(tab.url);
    var domain = url.protocol + '//' + url.hostname + '/';
    console.log('domain', domain);
    chrome.permissions.request({
      permissions: ['tabs'],
      origins: [domain]
    }, function(granted) {
      if (granted) {
        chrome.tabs.executeScript(tab.id, {
          file: 'inject.js',
          runAt: 'document_idle'
        }, onInjected);
      } else {
        throw Error('Permissions rejected');
      }
    });
  });
});