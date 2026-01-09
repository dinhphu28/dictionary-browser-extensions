import { IconState, updateState } from "./badge/status.js";

// Chrome MV3 uses chrome.*, add shim for Firefox later if needed
self.addEventListener("message", () => {}); // keeps worker alive briefly

const MsgType = {
  PONG: 3,
  RESULT: 1,
};

let nativePort = null;

function ensureNativePort() {
  if (!nativePort) {
    updateState(IconState.DISCONNECTED);
  }
  if (nativePort) return nativePort;

  try {
    nativePort = chrome.runtime.connectNative("com.dinhphu28.dictionary");

    nativePort.onDisconnect.addListener(() => {
      console.warn("Native host disconnected");
      nativePort = null;
    });

    const stateListener = (msg) => {
      if (msg.type === MsgType.PONG && msg.ready === true) {
        updateState(IconState.READY);
      }
      if (msg.type === MsgType.PONG && msg.ready === false) {
        updateState(IconState.DISCONNECTED);
      }
    };
    nativePort.onMessage.addListener(stateListener);
    nativePort.postMessage({ type: 2, query: "" });

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

function httpLookup(word) {
  return fetch(
    `http://localhost:8080/v2/lookup?q=${encodeURIComponent(word)}`,
  ).then((r) => r.json());
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "lookup") return;

  // NOTE: NEW VERSION USING NATIVE MESSAGING
  (async () => {
    // NOTE: 1) Try native messaging first
    try {
      const nativeMessage = await nativeLookup(msg.word);
      // NOTE: data is in nativeMessage.result
      const data = nativeMessage.result;
      sendResponse({ ok: true, data, source: "native" });
      console.log("DATA FROM NATIVE:", data);
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
