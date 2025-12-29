let popup = null;

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null;
  }
}

document.addEventListener("mouseup", async () => {
  removePopup();

  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (!text) return;

  // only single word
  if (text.split(/\s+/).length !== 1) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // create popup container
  popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = `${rect.bottom + 6}px`;
  popup.style.left = `${rect.left}px`;
  popup.style.maxWidth = "400px";
  popup.style.maxHeight = "300px";
  popup.style.overflow = "auto";
  popup.style.padding = "10px";
  popup.style.background = "white";
  popup.style.border = "1px solid #ccc";
  popup.style.borderRadius = "10px";
  popup.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
  popup.style.zIndex = 999999;

  popup.innerHTML = `<b>Loading "${text}"…</b>`;
  document.body.appendChild(popup);

  try {
    const response = await fetch(
      `http://localhost:8080/lookup?q=${encodeURIComponent(text)}`,
    );

    if (!response.ok) {
      popup.innerHTML = `<i>No entry found for "${text}".</i>`;
      return;
    }

    const data = await response.json();

    // render HTML body from API
    popup.innerHTML = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Arial">
        <div style="font-weight: bold; font-size: 18px; margin-bottom: 4px;">
          ${data.headword}
        </div>
        <div>${data.html}</div>
      </div>
    `;
  } catch (err) {
    popup.innerHTML = `<i>Error: ${err}</i>`;
  }
});

// click anywhere closes popup
document.addEventListener("mousedown", (e) => {
  if (popup && !popup.contains(e.target)) {
    removePopup();
  }
});
