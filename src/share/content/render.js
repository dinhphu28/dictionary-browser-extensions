const MatchType = {
  EXACT_MATCH: 1,
  APPROXIMATE_MATCH: 2,
};

function renderDictionaryResults(data, query) {
  if (Array.isArray(data) && data.length === 0) {
    return `<i class="dictionary-popup">No entry found for "${query}".</i>`;
  }
  const matchType = data.match_type;
  const suggestSentence = `
    <div class="suggest-sentence">
      <i>Did you mean: <b>${data.suggestions[0]}</b>?</i>
    </div>
  `;

  const metaSentence =
    matchType === MatchType.APPROXIMATE_MATCH ? suggestSentence : "";

  return `
    <div class="dictionary-popup">
      ${metaSentence}
      ${data.lookup_results
        .map(
          (dict) => `
          <div class="dictionary-section">
            <div class="dictionary-header">
              ${dict.dictionary || dict.full_name}
            </div>

            ${dict.entries
              .map(
                (entry) => `
                  <div class="dictionary-entry">
                    <div class="entry-body clamp" data-expanded="false">
                      ${entry.html}
                    </div>
                    <div class="more-toggle">More</div>
                  </div>
                `,
              )
              .join("")}
          </div>
        `,
        )
        .join("")}
    </div>
  `;
}
