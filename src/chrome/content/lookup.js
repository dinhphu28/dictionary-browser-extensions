async function lookup(word) {
  return await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "lookup", word }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
        return;
      }
      if (!response || !response.ok) {
        reject(response?.error || "Lookup failed");
        return;
      }
      resolve(response.data);
    });
  });
}
