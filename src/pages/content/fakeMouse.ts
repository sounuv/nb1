import { sleep } from "../../helpers/utils";

// Variável para armazenar a última posição conhecida (útil para re-inserir o elemento)
let lastFakeMouseCoordinates: { x: number; y: number } | null = null;

/**
 * Cria ou atualiza a posição do fake mouse, composto por uma bolinha azul e um label.
 * O label "Number One" ficará branco e posicionado no estilo 1:30/2:00 em relação à bolinha.
 */
export function createOrUpdateFakeMouse(targetX: number, targetY: number) {
  lastFakeMouseCoordinates = { x: targetX, y: targetY };

  let container = document.getElementById("fake-mouse-container");

  if (!container) {
    // Cria o container com tamanho fixo; mesmo que a bolinha seja 12x12, o container
    // terá dimensões pequenas para permitir que o label fique fora dele (com overflow visível)
    container = document.createElement("div");
    container.id = "fake-mouse-container";
    container.style.position = "fixed";
    container.style.zIndex = "10000";
    container.style.pointerEvents = "none";
    container.style.width = "12px";
    container.style.height = "12px";
    // Garanta que o overflow esteja visível para o label
    container.style.overflow = "visible";
    container.style.left = `${targetX}px`;
    container.style.top = `${targetY}px`;

    // Cria a bolinha azul
    const circle = document.createElement("div");
    circle.id = "fake-mouse-circle";
    circle.style.width = "12px";
    circle.style.height = "12px";
    // Usando um azul mais claro
    circle.style.backgroundColor = "#5bc0de";
    circle.style.borderRadius = "50%";
    circle.style.position = "absolute";
    circle.style.top = "0";
    circle.style.left = "0";
    // Adiciona uma borda preta para destaque
    circle.style.border = "1px solid black";

    // Cria o label "Number One"
    const label = document.createElement("div");
    label.id = "fake-mouse-label";
    label.textContent = "Number One";
    label.style.position = "absolute";
    label.style.color = "white"; // Texto branco
    label.style.fontSize = "10px";
    label.style.whiteSpace = "nowrap";
    // Posiciona o label aproximadamente no ângulo de 1:30 ou 2:00.
    // Ajuste os valores conforme necessário:
    label.style.top = "-12.5px";   // um pouco acima da bolinha
    label.style.left = "10px";     // um pouco à direita da bolinha

    container.appendChild(circle);
    container.appendChild(label);

    document.body.appendChild(container);
  } else {
    // Se o container já existe, apenas atualiza sua posição
    container.style.left = `${targetX}px`;
    container.style.top = `${targetY}px`;
  }

  // (Opcional) Animação de clique na bolinha: breve efeito de escala
  const circle = document.getElementById("fake-mouse-circle");
  if (circle) {
    circle.style.transition = "transform 0.1s ease";
    circle.style.transform = "scale(0.8)";
    setTimeout(() => {
      circle.style.transform = "scale(1)";
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

/**
 * (Opcional) Função para re-inserir o fake mouse caso ele seja removido pelo DOM.
 * Essa estratégia pode ajudar se o elemento some devido a re-renderizações.
 */
export function ensureFakeMousePersist() {
  const container = document.getElementById("fake-mouse-container");
  if (!container && lastFakeMouseCoordinates) {
    createOrUpdateFakeMouse(lastFakeMouseCoordinates.x, lastFakeMouseCoordinates.y);
  }
}
