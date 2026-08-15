// NEON ITALIANO — Performance Analytics & 4-Stage Mastery Progression (L1 → L4)

const ItalianAnalytics = {
  computeStats(vocabList, state) {
    const totalWords = vocabList.length;
    const stageCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const weakWords = [];
    let dueCount = 0;
    const now = Date.now();

    vocabList.forEach((item, idx) => {
      const review = state.reviews ? state.reviews[idx] : null;
      const signal = state.signals ? state.signals[idx] : { blurt: 0, production: 0, story: 0 };

      // Compute Stage L1-L4
      let stage = 1;
      if (review && review.reps >= 1) {
        if (review.reps >= 3 && ((signal && signal.blurt >= 70) || (signal && signal.production >= 1))) {
          stage = 4; // L4 Automaticity
        } else if (review.reps >= 2 && review.ease >= 2.0) {
          stage = 3; // L3 Production
        } else {
          stage = 2; // L2 Recall
        }
      } else {
        stage = 1; // L1 Recognition
      }

      stageCounts[stage] = (stageCounts[stage] || 0) + 1;

      if (review) {
        if (review.due && review.due <= now) dueCount++;
        if (review.ease < 2.1 || (review.interval && review.interval <= 1) || (signal && signal.blurt > 0 && signal.blurt < 40)) {
          weakWords.push(item);
        }
      }
    });

    const accuracy = state.stats && state.stats.seen
      ? Math.round(((state.stats.correct || 0) / state.stats.seen) * 100)
      : 100;

    return {
      totalWords,
      masteredCount: stageCounts[4] || 0,
      dueCount,
      stageCounts,
      weakWords: weakWords.slice(0, 8),
      xp: state.xp || 0,
      streak: state.streak || 1,
      accuracy,
      stats: state.stats || {}
    };
  },

  renderDashboard(containerId, stats, onPracticeWeak) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const weakPills = stats.weakWords.map(w => `<span class="weak-pill">${w.word} <small>(${w.translation})</small></span>`).join('');
    const fallbackMsg = '<p class="hint">Nessuna parola debole identificata. Ottimo lavoro!</p>';

    container.innerHTML = `
      <div class="analytics-grid">
        <div class="stat-box">
          <span class="label">BIBLIOTECA</span>
          <div class="value">${stats.totalWords}</div>
          <small>Parole attive</small>
        </div>
        <div class="stat-box">
          <span class="label">MOMENTUM STREAK</span>
          <div class="value" style="color:var(--gold)">🔥 ${stats.streak}g</div>
          <small>Giorni consecutivi</small>
        </div>
        <div class="stat-box">
          <span class="label">RIPASSI DOVUTI</span>
          <div class="value" style="color:var(--neon)">⚡ ${stats.dueCount}</div>
          <small>Parole da ripassare</small>
        </div>
        <div class="stat-box">
          <span class="label">ACCURACY</span>
          <div class="value" style="color:var(--neon)">${stats.accuracy}%</div>
          <small>Tasso di successo globale</small>
        </div>
      </div>

      <div class="mastery-section">
        <h3>🧬 Mastery Progression Breakdown (L1 ➔ L4)</h3>
        <div class="mastery-bar-container">
          <div class="mastery-bar stage-1" style="width: ${(stats.stageCounts[1] / stats.totalWords) * 100}%" title="L1 Recognition: ${stats.stageCounts[1]}"></div>
          <div class="mastery-bar stage-2" style="width: ${(stats.stageCounts[2] / stats.totalWords) * 100}%" title="L2 Recall: ${stats.stageCounts[2]}"></div>
          <div class="mastery-bar stage-3" style="width: ${(stats.stageCounts[3] / stats.totalWords) * 100}%" title="L3 Production: ${stats.stageCounts[3]}"></div>
          <div class="mastery-bar stage-4" style="width: ${(stats.stageCounts[4] / stats.totalWords) * 100}%" title="L4 Automaticity: ${stats.stageCounts[4]}"></div>
        </div>
        <div class="mastery-legend">
          <span style="color:#507C6D">● L1 Recognition (${stats.stageCounts[1]})</span>
          <span style="color:#d8bd78">● L2 Recall (${stats.stageCounts[2]})</span>
          <span style="color:#00b880">● L3 Production (${stats.stageCounts[3]})</span>
          <span style="color:#00e6a0">● L4 Automaticity (${stats.stageCounts[4]})</span>
        </div>
      </div>

      <div class="weak-section">
        <div class="section-row" style="display:flex; justify-content:space-between; align-items:center;">
          <h3>🎯 Parole da Rinforzare</h3>
          ${stats.weakWords.length ? '<button id="practiceWeakBtn" class="neon-mini">Allenare le parole deboli →</button>' : ''}
        </div>
        <div class="weak-tags" style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">
          ${weakPills || fallbackMsg}
        </div>
      </div>
    `;

    const weakBtn = document.getElementById('practiceWeakBtn');
    if (weakBtn && onPracticeWeak) {
      weakBtn.addEventListener('click', () => onPracticeWeak(stats.weakWords));
    }
  }
};

window.ItalianAnalytics = ItalianAnalytics;
