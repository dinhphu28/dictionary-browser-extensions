let popup = null;
let shadowRoot = null;

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null;
    shadowRoot = null;
  }
}
