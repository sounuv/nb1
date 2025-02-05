
let lastFakeMouseCoordinates: { x: number; y: number } | null = null;

export function createOrUpdateFakeMouse(targetX: number, targetY: number) {
  lastFakeMouseCoordinates = { x: targetX, y: targetY };

  let container = document.getElementById("fake-mouse-container");

  if (!container) {
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
    container.style.transition = "left 0.3s ease-out, top 0.3s ease-out";

    const mouseIcon = document.createElement("img");
    mouseIcon.id = "fake-mouse-icon";
    mouseIcon.style.width = "24px";
    mouseIcon.style.height = "24px";
    mouseIcon.style.position = "absolute";
    mouseIcon.style.top = "0";
    mouseIcon.style.left = "0";
    mouseIcon.src = chrome.runtime.getURL("cursor.png");
    mouseIcon.style.rotate = "30deg";

    container.appendChild(mouseIcon);
    document.body.appendChild(container);
  } else {
    container.style.left = `${targetX}px`;
    container.style.top = `${targetY}px`;
  }

  const mouseIcon = document.getElementById("fake-mouse-icon");
  if (mouseIcon) {
    mouseIcon.style.transition = "transform 0.1s ease";
    mouseIcon.style.transform = "scale(0.8)";
    setTimeout(() => {
      mouseIcon.style.transform = "scale(1)";
    }, 100);
  }
}

export function removeFakeMouse() {
  const container = document.getElementById("fake-mouse-container");
  if (container) {
    container.remove();
  }
}
