chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "decode-emoji",
      title: "Decode Emoji Smuggle",
      contexts: ["selection"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "decode-emoji") {
    // We can't use the stego logic here easily without importing it
    // But we can send a message to the popup or inject a script
    // For now, let's just open the popup or log it
    console.log("Decoding selected text:", info.selectionText);
    
    // In a real extension, we would use a sidepanel or an overlay
    // For MVP, we'll suggest opening the popup
  }
});
