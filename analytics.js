// Performance Analytics & Error Tracking Module

const Analytics = {
  computeStats(vocabList, state) {
    const totalWords = vocabList.length;
    const stageCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const weakWords = [];

    let totalReps = 0;
    let dueCount = 0;
    const now = Date.now();

    vocabList.forEach(item => {
      const stage = item.stage || 1;
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;

      if (item.srs) {
        if (item.srs.reps) totalReps += item.srs.reps;
        if (item.srs.dueDate && item.srs.dueDate <= now) dueCount++;
        if (item.srs.easeFactor < 2.0 || item.srs.interval <= 1 || stage === 1) {
          weakWords.push(item);
        }
      }
    });

    const masteredCount = stageCounts[4] || 0;

    return {
      totalWords,
      masteredCount,
      dueCount,
      stageCounts,
      weakWords: weakWords.slice(0, 8),
      xp: state.xp || 0,
      streak: state.streak || 1,
      accuracy: state.totalQuizzes ? Math.round((state.correctQuizzes / state.totalQuizzes) * 100) : 100
    };
  },

  renderDashboard(containerId, stats, onPracticeWeak) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const weakPills = stats.weakWords.map(w => `<span class="weak-pill">${w.word} <small>(${w.meaning})</small></span>`).join("");
    const fallbackMsg = '<p class="muted">Aucun mot faible identifié. Excellent travail !</p>';

    container.innerHTML = `
      <div class="analytics-grid">
        <div class="stat-box">
          <span class="label">BIBLIOTHÈQUE</span>
          <div class="value">${stats.totalWords}</div>
          <small>Mots enregistrés</small>
        </div>
        <div class="stat-box">
          <span class="label">MOMENTUM STREAK</span>
          <div class="value" style="color:var(--orange)">🔥 ${stats.streak}d</div>
          <small>Jours consécutifs</small>
        </div>
        <div class="stat-box">
          <span class="label">RÉVISIONS DUES</span>
          <div class="value" style="color:var(--yellow)">⚡ ${stats.dueCount}</div>
          <small>Mots à revoir aujourd'hui</small>
        </div>
        <div class="stat-box">
          <span class="label">ACCURACY</span>
          <div class="value" style="color:var(--green)">${stats.accuracy}%</div>
          <small>Taux de réussite global</small>
        </div>
      </div>

      <div class="mastery-section">
        <h3>🧬 Mastery Progression Breakdown</h3>
        <div class="mastery-bar-container">
          <div class="mastery-bar stage-1" style="width: ${(stats.stageCounts[1] / stats.totalWords) * 100}%" title="L1 Recognition: ${stats.stageCounts[1]}"></div>
          <div class="mastery-bar stage-2" style="width: ${(stats.stageCounts[2] / stats.totalWords) * 100}%" title="L2 Recall: ${stats.stageCounts[2]}"></div>
          <div class="mastery-bar stage-3" style="width: ${(stats.stageCounts[3] / stats.totalWords) * 100}%" title="L3 Production: ${stats.stageCounts[3]}"></div>
          <div class="mastery-bar stage-4" style="width: ${(stats.stageCounts[4] / stats.totalWords) * 100}%" title="L4 Automaticity: ${stats.stageCounts[4]}"></div>
        </div>
        <div class="mastery-legend">
          <span style="color:#26e6ff">● L1 Recognition (${stats.stageCounts[1]})</span>
          <span style="color:#ffd43b">● L2 Recall (${stats.stageCounts[2]})</span>
          <span style="color:#ff5a1f">● L3 Production (${stats.stageCounts[3]})</span>
          <span style="color:#63f28a">● L4 Automaticity (${stats.stageCounts[4]})</span>
        </div>
      </div>

      <div class="weak-section">
        <div class="section-row">
          <h3>🎯 Weak Words & Focus Target</h3>
          <button id="practiceWeakBtn" class="neon-mini">Entraîner les mots faibles →</button>
        </div>
        <div class="weak-tags">
          ${weakPills || fallbackMsg}
        </div>
      </div>
    `;

    const weakBtn = document.getElementById("practiceWeakBtn");
    if (weakBtn && onPracticeWeak) {
      weakBtn.addEventListener("click", () => onPracticeWeak(stats.weakWords));
    }
  }
};

window.Analytics = Analytics;
