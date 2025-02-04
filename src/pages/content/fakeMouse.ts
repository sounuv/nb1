import { sleep } from "../../helpers/utils";

// Variável para armazenar a última posição conhecida (útil para re-inserir o elemento)
let lastFakeMouseCoordinates: { x: number; y: number } | null = null;

/**
 * Cria ou atualiza a posição do fake mouse, composto por uma imagem de mouse real e um label.
 * O label "Number One" ficará branco e posicionado aproximadamente no ângulo 1:30/2:00.
 */
export function createOrUpdateFakeMouse(targetX: number, targetY: number) {
  lastFakeMouseCoordinates = { x: targetX, y: targetY };

  let container = document.getElementById("fake-mouse-container");

  if (!container) {
    // Cria o container com tamanho fixo para a imagem e permite que o label fique visível (overflow visible)
    container = document.createElement("div");
    container.id = "fake-mouse-container";
    container.style.position = "fixed";
    container.style.zIndex = "10000";
    container.style.pointerEvents = "none";
    container.style.width = "24px";
    container.style.height = "24px";
    container.style.overflow = "visible";
    container.style.left = `${targetX}px`;
    container.style.top = `${targetY}px`;

    // Cria o elemento de imagem que representa o mouse real
    const mouseIcon = document.createElement("img");
    mouseIcon.id = "fake-mouse-icon";
    mouseIcon.style.width = "24px";
    mouseIcon.style.height = "24px";
    mouseIcon.style.position = "absolute";
    mouseIcon.style.top = "0";
    mouseIcon.style.left = "0";
    mouseIcon.style.rotate = "30deg"
    // Usa chrome.runtime.getURL para obter o caminho absoluto da imagem (cursor.png está na pasta public)
    mouseIcon.src = chrome.runtime.getURL("cursor.png");

    // Cria o label "Number One"
    const label = document.createElement("div");
    label.id = "fake-mouse-label";
    label.textContent = "Number One";
    label.style.position = "absolute";
    label.style.color = "white"; // Texto branco
    label.style.fontSize = "10px";
    label.style.whiteSpace = "nowrap";
    // Posiciona o label aproximadamente na posição 1:30/2:00 em relação à imagem
    label.style.top = "-9px"; // um pouco acima da imagem
    label.style.left = "20px";   // um pouco à direita da imagem

    container.appendChild(mouseIcon);
    container.appendChild(label);
    document.body.appendChild(container);
  } else {
    // Se o container já existe, apenas atualiza sua posição
    container.style.left = `${targetX}px`;
    container.style.top = `${targetY}px`;
  }

  // (Opcional) Animação de clique: breve efeito de escala na imagem
  const mouseIcon = document.getElementById("fake-mouse-icon");
  if (mouseIcon) {
    mouseIcon.style.transition = "transform 0.1s ease";
    mouseIcon.style.transform = "scale(0.8)";
    setTimeout(() => {
      mouseIcon.style.transform = "scale(1)";
    }, 100);
  }
}

/**
 * Remove o fake mouse da tela.
 */
export function removeFakeMouse() {
  const container = document.getElementById("fake-mouse-container");
  if (container) {
    container.remove();
  }
}

