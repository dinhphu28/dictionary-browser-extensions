async function lookup(word) {
  const response = await browser.runtime.sendMessage({
    type: "lookup",
    word: word,
  });
  // return data;
  if (!response || !response.ok) {
    throw response?.error || "Lookup failed";
  }
  return response.data;
}
