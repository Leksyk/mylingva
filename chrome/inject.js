function getDocumentContent(document) {
  return document.documentElement.outerHTML;
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      console.log('runtime.onMessage', arguments);
      if(message == "getText") {
        sendResponse({data: getDocumentContent(document), method: "getText"});
      }
    }
);