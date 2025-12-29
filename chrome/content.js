let popup = null;
let shadowRoot = null;

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null;
    shadowRoot = null;
  }
}

document.addEventListener("mouseup", async () => {
  removePopup();

  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (!text) return;
  if (text.split(/\s+/).length !== 1) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // container in page
  popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = `${rect.bottom + 6}px`;
  popup.style.left = `${rect.left}px`;
  popup.style.zIndex = 999999;

  document.body.appendChild(popup);

  // 🌟 SHADOW ROOT (CSS isolation)
  shadowRoot = popup.attachShadow({ mode: "open" });

  // --- load your 2 CSS files ---
  const defaultCss = document.createElement("link");
  defaultCss.rel = "stylesheet";
  defaultCss.href = chrome.runtime.getURL("DefaultStyle.css");

  const customCss = document.createElement("link");
  customCss.rel = "stylesheet";
  customCss.href = chrome.runtime.getURL("CustomStyle.css");

  // popup inner wrapper (so your CSS can target it)
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<b>Loading "${text}"…</b>`;

  shadowRoot.appendChild(defaultCss);
  shadowRoot.appendChild(customCss);
  shadowRoot.appendChild(wrapper);

  try {
    const response = await fetch(
      `http://localhost:8080/lookup?q=${encodeURIComponent(text)}`,
    );

    if (!response.ok) {
      wrapper.innerHTML = `<i class="dictionary-popup">No entry found for "${text}".</i>`;
      return;
    }

    const data = await response.json();

    wrapper.innerHTML = `
      <div class="dictionary-popup">
        <!-- <div class="headword">${data.headword}</div> -->
        <div class="entry-html">${data.html}</div>
      </div>
    `;
  } catch (err) {
    wrapper.innerHTML = `<i>Error: ${err}</i>`;
  }
});

document.addEventListener("mousedown", (e) => {
  if (popup && !popup.contains(e.target)) {
    removePopup();
  }
});
