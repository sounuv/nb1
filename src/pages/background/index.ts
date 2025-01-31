import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import "webextension-polyfill";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded");

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "injectFunctions") {
    if (message.tabId == null) {
      console.log("no active tab found");
    } else {
      chrome.scripting.executeScript({
        target: { tabId: message.tabId },
        files: ["assets/js/mainWorld.js"],
        world: "MAIN",
      });
    }
    return true;
  }

  // 🔹 Lógica para redirecionar o usuário para a aba onde ele estava antes
  if (message.action === "FOCUS_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.update(tabs[0].id, { active: true });
      }
    });
  }
});
