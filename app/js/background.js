chrome.runtime.onMessage.addListener((message) => {
  if (message.origin === 'zoom_script') {
    chrome.runtime.sendMessage({
      origin: 'background',
      action: message.action,
      data: message.data
    });
  }
});   