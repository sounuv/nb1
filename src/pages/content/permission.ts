export const injectMicrophonePermissionIframe = () => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("id", "permissionsIFrame");
  iframe.setAttribute("allow", "microphone");
  iframe.src = chrome.runtime.getURL("/src/pages/permission/index.html");
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.zIndex = "9999"; // Ensure it is on top of other elements
  document.body.appendChild(iframe);
};
