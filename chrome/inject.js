console.log('on inject', document, window);

//console.log('data', getDocumentText(document));

function getDocumentText(document) {
  return document.all[0].innerText;
}

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
      console.log('runtime.onMessage', arguments);
      if(message == "getText") {
        sendResponse({data: getDocumentText(document), method: "getText"});
      }
    }
);