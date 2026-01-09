// ----- State machine for lookups -----
export const IconState = {
  READY: "ready",
  DISCONNECTED: "disconnected",
};

const action = chrome?.action ?? browser.action;

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

  action.setIcon({
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
    action.setBadgeText({ text: "" });
    return;
  }

  action.setBadgeText({
    text: state === IconState.DISCONNECTED ? "!" : "?",
  });

  action.setBadgeBackgroundColor({
    color: state === IconState.DISCONNECTED ? "#FF0000" : "#FFA500",
  });
}

export function updateState(state) {
  setIcon(state);
  setBadge(state);
}
