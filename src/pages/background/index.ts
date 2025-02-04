import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import "webextension-polyfill";

reloadOnUpdate("pages/background");
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded");

// Configura o comportamento do side panel para abrir quando o usuário clicar no ícone de ação
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Erro ao configurar side panel:", error));

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

// Listener unificado para tratar as mensagens recebidas
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Background recebeu mensagem:", message, "Sender:", sender);

  // Lógica para injetar funções (por exemplo, mainWorld.js)
  if (message.action === "injectFunctions") {
    if (message.tabId == null) {
      console.log("No active tab found for injection.");
    } else {
      chrome.scripting.executeScript({
        target: { tabId: message.tabId },
        files: ["assets/js/mainWorld.js"],
        world: "MAIN",
      });
    }
    return true;
  }

  // Lógica para redirecionar o usuário para a aba ativa
  if (message.action === "FOCUS_TAB") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.update(tabs[0].id, { active: true });
      }
    });
    return;
  }

  // Lógica para abrir o side panel
  if (message.action === "openSidePanel") {
    let tabId = sender.tab && sender.tab.id;
    if (!tabId) {
      // Se sender.tab não estiver definido, busca a aba ativa
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          tabId = tabs[0].id;
          chrome.sidePanel.open({ tabId, windowId: chrome.windows.WINDOW_ID_CURRENT }).catch((error) => {
            console.error("Erro ao abrir o side panel:", error);
          });
        } else {
          console.error("Nenhuma aba ativa encontrada");
        }
      });
    } else {
      chrome.sidePanel.open({ tabId }).catch((error) => {
        console.error("Erro ao abrir o side panel:", error);
      });
    }
    return;
  }

  // Lógica para fechar o side panel
  if (message.action === "closeSidePanel") {
    chrome.sidePanel
      .setOptions({ enabled: false })
      .then(() => chrome.sidePanel.setOptions({ enabled: true }))
      .catch((error) => {
        console.error("Erro ao fechar o side panel:", error);
      });
    return;
  }
});

