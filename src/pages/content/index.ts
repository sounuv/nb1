/**
 * DO NOT USE import someModule from '...';
 *
 * Chrome extensions don't support modules in content scripts.
 * If you want to use other modules in content scripts, you need to import them via these files.
 *
 */
import("@pages/content/injected");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OMNIBOX_INPUT") {
    // Repasse a mensagem para o contexto da página para que o React a capture
    window.postMessage({ type: "NB1_OMNIBOX_INPUT", payload: message.payload }, "*");
    // Envie uma resposta para fechar o message port corretamente
    sendResponse({ status: "received" });
  }
});