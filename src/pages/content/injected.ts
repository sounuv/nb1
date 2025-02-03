import { initializeRPC } from "./domOperations";

initializeRPC();

function injectSideButton() {
  if (!document.getElementById("nb1-side-button")) {
    const button = document.createElement("button");
    button.id = "nb1-side-button";
    button.innerText = "☰";
    button.style.position = "fixed";
    button.style.bottom = "10px";
    button.style.right = "10px";
    button.style.width = "50px";
    button.style.height = "50px";
    button.style.borderRadius = "10px";
    button.style.backgroundColor = "#007bff";
    button.style.color = "white";
    button.style.border = "none";
    button.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    button.style.cursor = "grab";
    button.style.zIndex = "9999";

    // Variável para rastrear se o sidepanel está aberto
    let isPanelOpen = false;

    // Variáveis para controle do arraste
    let isDragging = false;
    let hasDragged = false;
    let startX = 0, startY = 0;
    let offsetX = 0, offsetY = 0;

    // Evento de clique: dispara somente se não houve arraste
    button.addEventListener("click", (e) => {
      // Se o botão não foi arrastado (ou seja, foi apenas clicado)
      if (!hasDragged) {
        isPanelOpen = !isPanelOpen;
        chrome.runtime.sendMessage({
          action: isPanelOpen ? "openSidePanel" : "closeSidePanel",
        });
      }
    });

    button.addEventListener("mousedown", (e) => {
      isDragging = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
      // Calcula o offset atual do mouse em relação ao botão
      const rect = button.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      button.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      // Verifica a distância movida para determinar se é um arraste
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!hasDragged && Math.sqrt(dx * dx + dy * dy) > 5) {
        hasDragged = true;
        // Remove as propriedades de posicionamento fixo com bottom/right
        button.style.bottom = "";
        button.style.right = "";
        // Define left e top com base na posição atual
        const rect = button.getBoundingClientRect();
        button.style.left = rect.left + "px";
        button.style.top = rect.top + "px";
      }
      if (hasDragged) {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        if (!hasDragged) {
          // Se não houve arraste, restaura a posição original
          button.style.left = "";
          button.style.top = "";
          button.style.bottom = "10px";
          button.style.right = "10px";
        }
        isDragging = false;
        button.style.cursor = "grab";
      }
    });

    document.body.appendChild(button);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectSideButton);
} else {
  injectSideButton();
}
