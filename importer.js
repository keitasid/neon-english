// Vocabulary Import & Export Module

const VocabImporter = {
  parseText(input) {
    if (!input || !input.trim()) return [];

    // Try parsing as JSON first
    try {
      const parsedJSON = JSON.parse(input);
      if (Array.isArray(parsedJSON)) {
        return parsedJSON.map(item => this.normalizeItem(item));
      }
    } catch (e) {
      // Fallback to pipe-delimited line parsing
    }

    const lines = input.split("\n");
    const items = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;

      const parts = trimmed.split("|").map(p => p.trim());
      if (parts.length >= 2) {
        const word = parts[0].toUpperCase();
        const meaning = parts[1];
        const hook = parts[2] || `Association visuelle pour ${word}`;
        const synonyms = parts[3] ? parts[3].split(",").map(s => s.trim()) : [];
        const collocations = parts[4] ? parts[4].split(",").map(c => c.trim()) : [];

        items.push(this.normalizeItem({
          id: word.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          word,
          meaning,
          phonetic: `/${word.toLowerCase()}/`,
          category: "Imported",
          hook,
          synonyms,
          antonyms: [],
          collocations,
          example: `Example sentence featuring ${word}.`,
          translation: `Exemple contenant ${meaning}.`,
          links: [word, ...synonyms],
          story: `A short custom story for ${word}.`,
          personal: `Imported entry for ${word}.`
        }));
      }
    });

    return items;
  },

  normalizeItem(item) {
    const word = String(item.word || "NEW").toUpperCase();
    return {
      id: item.id || word.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Math.random().toString(36).substr(2, 4),
      word,
      meaning: item.meaning || "Signification",
      phonetic: item.phonetic || `/${word.toLowerCase()}/`,
      category: item.category || "General",
      hook: item.hook || `Visual association for ${word}`,
      synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
      antonyms: Array.isArray(item.antonyms) ? item.antonyms : [],
      collocations: Array.isArray(item.collocations) ? item.collocations : [],
      example: item.example || `Usage example of ${word}.`,
      translation: item.translation || `Traduction de l'exemple pour ${word}.`,
      links: Array.isArray(item.links) ? item.links : [word],
      story: item.story || `Context story for ${word}.`,
      personal: item.personal || `Personal association for ${word}.`,
      stage: item.stage || 1,
      srs: item.srs || { interval: 1, easeFactor: 2.5, dueDate: Date.now(), reps: 0, lastReviewed: null }
    };
  },

  exportJSON(vocabList) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vocabList, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `neon_english_vocab_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
};

window.VocabImporter = VocabImporter;
