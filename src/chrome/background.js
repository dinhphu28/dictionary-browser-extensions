// Chrome MV3 uses chrome.*, add shim for Firefox later if needed
self.addEventListener("message", () => {}); // keeps worker alive briefly

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "lookup") return;

  fetch(`http://localhost:8080/lookup?q=${encodeURIComponent(msg.word)}`)
    .then(r => r.json())
    .then(data => sendResponse({ ok: true, data }))
    .catch(err => sendResponse({ ok: false, error: String(err) }));

  // IMPORTANT for async responses
  return true;
});

