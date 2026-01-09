// Chrome MV3 uses chrome.*, add shim for Firefox later if needed
self.addEventListener("message", () => {}); // keeps worker alive briefly

let nativePort = null;

function ensureNativePort() {
  if (nativePort) return nativePort;

  try {
    nativePort = browser.runtime.connectNative("com.dinhphu28.dictionary");

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
    port.postMessage({ type: 1, query: word });
  });
}

async function httpLookup(word) {
  const res = await fetch(
    `http://localhost:8080/lookup?q=${encodeURIComponent(msg.word)}`,
  );
  const data = await res.json();
  return data;
}

// NOTE: This is a fallback worker that uses a local HTTP server for lookups.

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "lookup") return;

  return (async () => {
    // NOTE: 1) Try native messaging first
    try {
      const nativeMessage = await nativeLookup(msg.word);
      // NOTE: data is in nativeMessage.result
      const data = nativeMessage.result;
      console.log("DATA FROM NATIVE:", data);
      return { ok: true, data, source: "native" };
    } catch (err) {
      console.warn("Native lookup failed, falling back to HTTP:", err);
    }

    // NOTE: 2) Fallback to HTTP backend
    try {
      const data = await httpLookup(msg.word);
      return { ok: true, data, source: "http" };
    } catch (err) {
      console.error("Both native and HTTP lookup failed:", err);
      return { ok: false, error: String(err) };
    }
  })();
});
