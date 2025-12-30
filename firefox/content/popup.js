function createPopupAtRect(rect) {
  popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = `${rect.bottom + 6}px`;
  popup.style.left = `${rect.left}px`;
  popup.style.zIndex = 999999;

  document.body.appendChild(popup);

  shadowRoot = popup.attachShadow({ mode: "open" });
  return shadowRoot;
}

function attachPopupStyles(root) {
  const defaultCss = document.createElement("link");
  defaultCss.rel = "stylesheet";
  defaultCss.href = chrome.runtime.getURL("DefaultStyle.css");

  const customCss = document.createElement("link");
  customCss.rel = "stylesheet";
  customCss.href = chrome.runtime.getURL("CustomStyle.css");

  root.appendChild(defaultCss);
  root.appendChild(customCss);
}
