document.addEventListener("mouseup", async (event) => {
  // if popup exists and click is inside → ignore
  if (popup) {
    const path = event.composedPath();
    if (path.includes(popup)) return;
  }

  removePopup();

  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (!text) return;
  if (text.split(/\s+/).length !== 1) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  const root = createPopupAtRect(rect);
  attachPopupStyles(root);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<b>Loading "${text}"…</b>`;
  root.appendChild(wrapper);

  try {
    const data = await lookup(text);
    wrapper.innerHTML = renderDictionaryResults(data, text);
    wireMoreLessToggles(wrapper);
  } catch (err) {
    wrapper.innerHTML = `<i>Error: ${err}</i>`;
  }
});

document.addEventListener("mousedown", (e) => {
  if (popup && !popup.contains(e.target)) {
    removePopup();
  }
});
