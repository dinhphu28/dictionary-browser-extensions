browser.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "lookup") {
    const res = await fetch(
      `http://localhost:8080/lookup?q=${encodeURIComponent(msg.word)}`,
    );
    const data = await res.json();
    return data;
  }
});
