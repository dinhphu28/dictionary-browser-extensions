// Chrome MV3 uses chrome.*, add shim for Firefox later if needed
self.addEventListener("message", () => {}); // keeps worker alive briefly

let nativePort = null;

function ensureNativePort() {
  if (nativePort) return nativePort;

  try {
    nativePort = chrome.runtime.connectNative(
      "com.dinhphu28.dictionary",
    );

    nativePort.onDisconnect.addListener(() => {
      console.warn("Native host disconnected");
      nativePort = null;
    });

    return nativePort;
  } catch (e) {
    console.warn("Native messaging not available:", e);
    return null;
  }
}

function nativeLookup(word) {
  return new Promise((resolve, reject) => {
    const port = ensureNativePort();
    if (!port) {
      reject("No native messaging host");
      return;
    }

    const listener = (msg) => {
      port.onMessage.removeListener(listener);
      resolve(msg);
    };

    port.onMessage.addListener(listener);

    port.postMessage({ query: word });
  });
}

function httpLookup(word) {
  return fetch(
    `http://localhost:8080/v2/lookup?q=${encodeURIComponent(word)}`,
  ).then((r) => r.json());
}

// NOTE: This is a fallback worker that uses a local HTTP server for lookups.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "lookup") return;

  // httpLookup(msg.word)
  //   .then((data) => sendResponse({ ok: true, data }))
  //   .catch((err) => sendResponse({ ok: false, error: String(err) }));
  //
  // // IMPORTANT for async responses
  // return true;

  // NOTE: NEW VERSION USING NATIVE MESSAGING
  (async () => {
    // NOTE: 1) Try native messaging first
    try {
      const data = await nativeLookup(msg.word);
      sendResponse({ ok: true, data, source: "native" });
      return;
    } catch (err) {
      console.warn("Native lookup failed, falling back to HTTP:", err);
    }

    // NOTE: 2) Fallback to HTTP backend
    try {
      const data = await httpLookup(msg.word);
      sendResponse({ ok: true, data, source: "http" });
      return;
    } catch (err) {
      console.error("Both native and HTTP lookup failed:", err);
      sendResponse({ ok: false, error: String(err) });
    }
  })();

  // IMPORTANT for async responses
  return true;
});
