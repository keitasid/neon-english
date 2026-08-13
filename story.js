// Automatic Contextual Story Generator

const StoryEngine = {
  templates: [
    {
      type: "quant_crisis",
      narrative: "During a sudden period of market {W1}, the senior analyst deployed a high-frequency algorithm to {W2}. Despite the extreme volatility, the automated strategy achieved a remarkable {W3}, successfully protecting the fund from severe downside risks.",
      translation: "Pendant une période soudaine de {W1_FR}, l'analyste sénior a déployé un algorithme à haute fréquence pour {W2_FR}. Malgré l'extrême volatilité, la stratégie automatisée a réalisé une remarquable {W3_FR}, protégeant avec succès le fonds contre de sévères risques."
    },
    {
      type: "investigation",
      narrative: "While conducting thorough {W1}, the compliance auditor uncovered a critical {W2} in the system logs. Realizing that the issue posed an immediate {W3}, the engineering team moved quickly to mitigate the vulnerability.",
      translation: "En effectuant des {W1_FR} approfondies, l'auditeur de conformité a découvert un {W2_FR} critique dans les journaux système. Réalisant que le problème représentait un {W3_FR} immédiat, l'équipe s'est empressée d'atténuer la vulnérabilité."
    },
    {
      type: "career_journey",
      narrative: "He decided to {W1} into quantitative finance by mastering algorithmic trading. After working hard to {W2} new technical skills, his efforts culminated in an extraordinary personal {W3}.",
      translation: "Il a décidé de {W1_FR} dans la finance quantitative en maîtrisant le trading algorithmique. Après avoir travaillé dur pour {W2_FR} de nouvelles compétences, ses efforts ont culminé dans un {W3_FR} personnel extraordinaire."
    }
  ],

  generate(words) {
    if (!words || words.length === 0) return null;
    const w1 = words[0];
    const w2 = words[1] || words[0];
    const w3 = words[2] || words[1] || words[0];

    // Pick template or generate narrative
    const tpl = this.templates[Math.floor(Math.random() * this.templates.length)];

    let text = tpl.narrative
      .replace("{W1}", `<span class="neon-badge">${w1.word}</span>`)
      .replace("{W2}", `<span class="neon-badge">${w2.word}</span>`)
      .replace("{W3}", `<span class="neon-badge">${w3.word}</span>`);

    let translation = tpl.translation
      .replace("{W1_FR}", `<b>${w1.meaning}</b>`)
      .replace("{W2_FR}", `<b>${w2.meaning}</b>`)
      .replace("{W3_FR}", `<b>${w3.meaning}</b>`);

    // Clean plain text version for TTS speech synthesis
    let rawText = tpl.narrative
      .replace("{W1}", w1.word)
      .replace("{W2}", w2.word)
      .replace("{W3}", w3.word);

    return {
      words: [w1.word, w2.word, w3.word],
      text,
      rawText,
      translation
    };
  }
};

window.StoryEngine = StoryEngine;
