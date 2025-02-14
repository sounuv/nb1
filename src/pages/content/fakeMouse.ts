let lastFakeMouseCoordinates = null;

export function createOrUpdateFakeMouse(targetX: number, targetY: number) {
  lastFakeMouseCoordinates = { x: targetX, y: targetY };

  let container = document.getElementById("fake-mouse-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "fake-mouse-container";
    container.style.position = "fixed";
    container.style.zIndex = "10000";
    container.style.pointerEvents = "none";
    container.style.width = "14px";
    container.style.height = "14px";
    container.style.borderRadius = "50%";
    container.style.backgroundColor = "#0056e0";

    container.style.boxShadow = `
      0px 0px 12px rgba(0, 86, 224, 0.9), 
      0px 0px 22px rgba(0, 86, 224, 0.7), 
      0px 0px 32px rgba(0, 86, 224, 0.5)
    `;

    container.style.left = `${targetX - 7}px`;
    container.style.top = `${targetY - 7}px`;
    container.style.transition = "left 0.3s ease-out, top 0.3s ease-out";

    document.body.appendChild(container);
  } else {
    container.style.left = `${targetX - 7}px`;
    container.style.top = `${targetY - 7}px`;
  }
}

export function removeFakeMouse() {
  const container = document.getElementById("fake-mouse-container");
  if (container) {
    container.remove();
  }
}
