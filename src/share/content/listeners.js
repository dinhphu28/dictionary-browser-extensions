// document.addEventListener("mouseup", async (event) => {
//   // if popup exists and click is inside → ignore
//   if (popup) {
//     const path = event.composedPath();
//     if (path.includes(popup)) return;
//   }
//
//   removePopup();
//
//   const selection = window.getSelection();
//   const text = selection.toString().trim();
//
//   if (!text) return;
//   if (text.split(/\s+/).length !== 1) return;
//
//   const range = selection.getRangeAt(0);
//   const rect = range.getBoundingClientRect();
//
//   const root = createPopupAtRect(rect);
//   attachPopupStyles(root);
//
//   const wrapper = document.createElement("div");
//   wrapper.innerHTML = `<b>Loading "${text}"…</b>`;
//   root.appendChild(wrapper);
//
//   try {
//     const data = await lookup(text);
//     wrapper.innerHTML = renderDictionaryResults(data, text);
//     wireMoreLessToggles(wrapper);
//   } catch (err) {
//     wrapper.innerHTML = `<i>Error: ${err}</i>`;
//   }
// });
//
// document.addEventListener("mousedown", (e) => {
//   if (popup && !popup.contains(e.target)) {
//     removePopup();
//   }
// });

// NOTE: The following implements an Apple-like delayed lookup on selection.

// ===== Lookup delay config =====
const LOOKUP_DELAY = 300; // ms, Apple-like

let lookupTimer = null;
let pendingSelection = null;

// ===== Helpers =====

function cancelPendingLookup() {
  if (lookupTimer) {
    clearTimeout(lookupTimer);
    lookupTimer = null;
  }
  pendingSelection = null;
}

async function triggerLookup() {
  if (!pendingSelection) return;

  const { text, rect } = pendingSelection;
  pendingSelection = null;

  removePopup();

  const root = createPopupAtRect(rect);
  attachPopupStyles(root);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<b>Loading "${text}"…</b>`;
  root.appendChild(wrapper);

  try {
    const data = await lookup(text);
    wrapper.innerHTML = renderDictionaryResults(data, text);
    wireMoreLessToggles(wrapper);
    requestAnimationFrame(() => {
      positionPopup(rect);
    });
  } catch (err) {
    wrapper.innerHTML = `<i>Error: ${err}</i>`;
  }
}

// ===== Event listeners =====

// Mouse up → schedule lookup
document.addEventListener("mouseup", (event) => {
  // If popup exists and click is inside it → ignore
  if (popup) {
    const path = event.composedPath();
    if (path.includes(popup)) return;
  }

  cancelPendingLookup();

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const text = selection.toString().trim();
  if (!text) return;

  // Only single-word lookup
  if (text.split(/\s+/).length !== 1) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  pendingSelection = { text, rect };

  lookupTimer = setTimeout(() => {
    triggerLookup();
  }, LOOKUP_DELAY);
});

// Any mouse down cancels pending lookup
document.addEventListener("mousedown", (event) => {
  cancelPendingLookup();

  if (popup && !popup.contains(event.target)) {
    removePopup();
  }
});

// Scroll outside popup removes popup
document.addEventListener("scroll", (event) => {
  if (popup && !popup.contains(event.target)) {
    removePopup();
  }
});

// Keydown cancels pending lookup
// (Especially important for keyboard-based selection changes)
document.addEventListener("keydown", () => {
  cancelPendingLookup();
});

// Scroll cancels pending lookup (capture = true is important)
document.addEventListener(
  "scroll",
  () => {
    cancelPendingLookup();
  },
  true,
);

// Selection change cancels pending lookup
document.addEventListener("selectionchange", () => {
  cancelPendingLookup();
});
