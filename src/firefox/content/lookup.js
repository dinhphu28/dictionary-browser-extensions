async function lookup(word) {
  const data = await browser.runtime.sendMessage({
    type: "lookup",
    word: word,
  });
  return data;
}
