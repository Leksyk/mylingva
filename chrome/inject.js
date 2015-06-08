function getDocumentContent(document) {
  return document.documentElement;
}

function init(language) {
  var wordManager = new WordManager(getDocumentContent(document), language);
  wordManager.processPageContent();
  return true;
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      console.log('runtime.onMessage', arguments);
      switch (message.method) {
        case 'init':
          sendResponse(init(message.language));
          break;

        default:
          throw new Error('Unrecognized message: ' + message);
      }
    }
);