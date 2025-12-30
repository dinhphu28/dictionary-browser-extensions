function renderDictionaryResults(data, query) {
  if (Array.isArray(data) && data.length === 0) {
    return `<i class="dictionary-popup">No entry found for "${query}".</i>`;
  }

  return `
    <div class="dictionary-popup">
      ${data
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
