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
    nativePort = browser.runtime.connectNative("com.dinhphu28.dictionary");

    nativePort.onDisconnect.addListener(() => {
      console.warn("Native host disconnected");
      nativePort = null;
    });

    const stateListener = (msg) => {
      if (msg?.type !== MsgType.PONG) {
        return;
      }
      if (msg.ready === true) {
        updateState(IconState.READY);
      }
      if (msg.ready === false) {
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
      if (msg?.type === MsgType.RESULT) {
        port.onMessage.removeListener(listener);
        resolve(msg);
      }
    };

    port.onMessage.addListener(listener);
    port.postMessage({ type: 1, query: word });
  });
}

async function httpLookup(word) {
  const res = await fetch(
    `http://localhost:8080/v2/lookup?q=${encodeURIComponent(word)}`,
  );
  const data = await res.json();
  return data;
}

// ----- State machine for lookups -----
const IconState = {
  READY: "ready",
  DISCONNECTED: "disconnected",
};

// const action = chrome?.action ?? browser.action;

function setIcon(state) {
  const icon128Map = {
    ready: "icons/chrome128.png",
    disconnected: "icons/chrome_gray128.png",
  };
  const icon48Map = {
    ready: "icons/chrome48.png",
    disconnected: "icons/chrome_gray48.png",
  };
  const icon32Map = {
    ready: "icons/chrome32.png",
    disconnected: "icons/chrome_gray32.png",
  };
  const icon16Map = {
    ready: "icons/chrome16.png",
    disconnected: "icons/chrome_gray16.png",
  };

  browser.action.setIcon({
    path: {
      16: icon16Map[state],
      32: icon32Map[state],
      48: icon48Map[state],
      128: icon128Map[state],
    },
  });
}

function setBadge(state) {
  if (state === IconState.READY) {
    browser.action.setBadgeText({ text: "" });
    return;
  }

  browser.action.setBadgeText({
    text: state === IconState.DISCONNECTED ? "!" : "?",
  });

  browser.action.setBadgeBackgroundColor({
    color: state === IconState.DISCONNECTED ? "#FF0000" : "#FFA500",
  });
}

function updateState(state) {
  setIcon(state);
  setBadge(state);
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
