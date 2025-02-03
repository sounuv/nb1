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

// Outros listeners (como injectFunctions ou FOCUS_TAB) permanecem aqui...

// Listener para o input da Omnibox


// Outra solução
chrome.omnibox.onInputEntered.addListener((inputText: string) => {
  // Opcional: Se desejar, ainda pode enviar para a aba ativa ou fazer outra lógica.
  // Mas agora, para atualizar a UI (side panel), envie uma mensagem para a extensão:
  chrome.storage.local.set({ omniboxInput: inputText });

  chrome.runtime.sendMessage({ type: "NB1_OMNIBOX_INPUT", payload: inputText })
    .then((response) => {
      console.log("Mensagem enviada para o side panel com sucesso:", response);
    })
    .catch((error) => {
      console.error("Erro ao enviar mensagem:", error);
    });

  // Abre o side panel (certifique-se de passar o tabId se necessário)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].id) {
      chrome.sidePanel.open({ tabId: tabs[0].id }).catch((error) => {
        console.error("Erro ao abrir o side panel:", error);
      });
    }
  });
});
