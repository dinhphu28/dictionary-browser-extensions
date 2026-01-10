function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createPopupAtRect(rect) {
  popup = document.createElement("div");

  popup.style.position = "fixed";
  popup.style.zIndex = 999999;

  /* 🔑 CRITICAL FIX */
  popup.style.width = "fit-content";
  popup.style.maxWidth = "480px";
  popup.style.visibility = "hidden"; // prevent flicker

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

function positionPopup(rect) {
  if (!popup) return;

  const margin = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const popupRect = popup.getBoundingClientRect();

  /* ---- Vertical placement ---- */
  let top;
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;

  if (spaceBelow >= popupRect.height + margin) {
    top = rect.bottom + margin;
  } else if (spaceAbove >= popupRect.height + margin) {
    top = rect.top - popupRect.height - margin;
  } else {
    top = clamp(
      rect.bottom + margin,
      margin,
      viewportHeight - popupRect.height - margin,
    );
  }

  /* ---- Horizontal placement ---- */
  let left = clamp(rect.left, margin, viewportWidth - popupRect.width - margin);

  popup.style.top = `${Math.round(top)}px`;
  popup.style.left = `${Math.round(left)}px`;
  popup.style.visibility = "visible";
}
