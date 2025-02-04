import { initializeRPC } from "./domOperations";

initializeRPC();

function injectAnimationStyles() {
  if (document.getElementById("nb1-animation-styles")) return;

  const style = document.createElement("style");
  style.id = "nb1-animation-styles";
  style.innerHTML = `
    /* Animação de rotação */
    @keyframes nb1-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Animação da aura com sombra reduzida */
    @keyframes nb1-glow {
      0% {
        box-shadow: 0 0 10px rgba(0, 150, 255, 0.6),
                    0 0 25px rgba(0, 150, 255, 0.4),
                    inset 0 0 25px rgba(0, 150, 255, 0.3);
        opacity: 0.9;
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 20px rgba(0, 150, 255, 0.8),
                    0 0 35px rgba(0, 150, 255, 0.6),
                    inset 0 0 35px rgba(0, 150, 255, 0.5);
        opacity: 1;
        transform: scale(1.05);
      }
      100% {
        box-shadow: 0 0 10px rgba(0, 150, 255, 0.6),
                    0 0 25px rgba(0, 150, 255, 0.4),
                    inset 0 0 25px rgba(0, 150, 255, 0.3);
        opacity: 0.9;
        transform: scale(1);
      }
    }
  `;
  document.head.appendChild(style);
}

function injectSideButton() {
  if (!document.getElementById("nb1-side-button-container")) {
    injectAnimationStyles();

    const container = document.createElement("div");
    container.id = "nb1-side-button-container";
    container.style.position = "fixed";
    container.style.bottom = "10px";
    container.style.right = "10px";
    container.style.width = "160px";
    container.style.height = "160px";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";

    const aura = document.createElement("div");
    aura.className = "nb1-glow-effect";
    aura.style.position = "absolute";
    aura.style.width = "80px";
    aura.style.height = "80px";
    aura.style.borderRadius = "50%";
    aura.style.background = "radial-gradient(circle, rgba(0, 150, 255, 0.7) 20%, rgba(0,0,0,0) 90%)";
    aura.style.filter = "blur(10px) brightness(1.3)";
    aura.style.animation = "nb1-glow 6s infinite alternate ease-in-out";
    aura.style.pointerEvents = "none";
    container.appendChild(aura);

    const button = document.createElement("button");
    button.id = "nb1-side-button";
    button.style.position = "relative";
    button.style.width = "120px";
    button.style.height = "120px";
    button.style.padding = "0";
    button.style.border = "none";
    button.style.borderRadius = "50%";
    button.style.cursor = "pointer";
    const spherePath = chrome.runtime.getURL("sphere.gif");
    button.style.background = `url('${spherePath}') center center / cover no-repeat`;
    button.style.backgroundColor = "transparent";
    button.style.animation = "nb1-spin 15s linear infinite";
    button.style.filter = "drop-shadow(0 0 8px rgba(0, 150, 255, 0.8))";

    container.appendChild(button);
    document.body.appendChild(container);

    let isPanelOpen = false;
    let isDragging = false;
    let hasDragged = false;
    let startX = 0, startY = 0;
    let offsetX = 0, offsetY = 0;

    button.addEventListener("click", (e) => {
      if (!hasDragged) {
        isPanelOpen = !isPanelOpen;
        chrome.runtime.sendMessage({
          action: isPanelOpen ? "openSidePanel" : "closeSidePanel",
        });
      }
    });

    container.addEventListener("mousedown", (e) => {
      isDragging = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = container.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      button.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!hasDragged && Math.sqrt(dx * dx + dy * dy) > 15) {
        hasDragged = true;
        container.style.bottom = "";
        container.style.right = "";
        const rect = container.getBoundingClientRect();
        container.style.left = rect.left + "px";
        container.style.top = rect.top + "px";
      }
      if (hasDragged) {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        container.style.left = `${x}px`;
        container.style.top = `${y}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        if (!hasDragged) {
          container.style.left = "";
          container.style.top = "";
          container.style.bottom = "10px";
          container.style.right = "10px";
        }
        isDragging = false;
        button.style.cursor = "pointer";
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectSideButton);
} else {
  injectSideButton();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const container = document.getElementById("nb1-side-button-container");
  if (!container) return;

  if (message.action === "sidePanelOpened") {
    container.style.display = "none";
    console.log("Side panel opened, hiding button");
  } else if (message.action === "sidePanelClosed") {
    container.style.display = "flex";
    console.log("Side panel closed, showing button");
  }
});
