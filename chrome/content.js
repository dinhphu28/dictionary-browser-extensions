// Firefox compatibility shim
if (typeof browser === "undefined") {
  var browser = chrome;
}

let popup = null;
let shadowRoot = null;

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null;
    shadowRoot = null;
  }
}

function lookup(word) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "lookup", word },
      (response) => {
        if (!response || !response.ok) reject(response?.error);
        else resolve(response.data);
      }
    );
  });
}

document.addEventListener("mouseup", async (event) => {
  // if popup exists and the click is inside it → ignore
  if (popup) {
    const path = event.composedPath(); // works with Shadow DOM
    if (path.includes(popup)) {
      return; // do NOT close or rebuild popup
    }
  }
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
    const notFoundPopup = `<i class="dictionary-popup">No entry found for "${text}".</i>`;

    const data = await lookup(text);

    if (Array.isArray(data) && data.length === 0) {
      wrapper.innerHTML = notFoundPopup;
      return;
    }

    wrapper.innerHTML = `
    <div class="dictionary-popup">
      ${data
        .map(
          (dict) => `
          <div class="dictionary-section">
            <div class="dictionary-header">
              ${dict.dictionary || dict.full_name}
            </div>

            ${dict.entries
              .map(
                (entry) => `
                <div class="dictionary-entry">
                  <div class="entry-body clamp" data-expanded="false">
                    ${entry.html}
                  </div>
                  <div class="more-toggle">More</div>
                </div>
              `,
              )
              .join("")}
          </div>
        `,
        )
        .join("")}
    </div>
  `;
  } catch (err) {
    wrapper.innerHTML = `<i>Error: ${err}</i>`;
  }

  wrapper.querySelectorAll(".more-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = btn.previousElementSibling;
      const expanded = body.getAttribute("data-expanded") === "true";

      if (expanded) {
        body.classList.add("clamp");
        body.setAttribute("data-expanded", "false");
        btn.textContent = "More";
      } else {
        body.classList.remove("clamp");
        body.setAttribute("data-expanded", "true");
        btn.textContent = "Less";
      }
    });
  });
});

document.addEventListener("mousedown", (e) => {
  if (popup && !popup.contains(e.target)) {
    removePopup();
  }
});
