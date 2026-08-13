// Spaced Repetition Engine (SuperMemo SM-2 Algorithm & 4-Stage Mastery Model)

const SRS = {
  // Grades: 1 = Again (Failed), 2 = Hard, 3 = Good, 4 = Easy
  calculate(srsData, grade) {
    let { interval = 1, easeFactor = 2.5, reps = 0 } = srsData || {};
    grade = Math.max(1, Math.min(4, Number(grade)));

    if (grade < 3) {
      reps = 0;
      interval = 1;
    } else {
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      reps += 1;
    }

    // Adjust Ease Factor (SM-2 formula adaptation)
    easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const ONE_DAY_MS = 86400000;
    const dueDate = Date.now() + interval * ONE_DAY_MS;

    return {
      interval,
      easeFactor: Number(easeFactor.toFixed(2)),
      reps,
      dueDate,
      lastReviewed: Date.now()
    };
  },

  updateStage(item, srsResult) {
    const { reps, interval } = srsResult;
    let stage = 1; // Stage 1: Recognition
    if (reps >= 5 && interval >= 14) {
      stage = 4; // Stage 4: Automaticity
    } else if (reps >= 3 && interval >= 7) {
      stage = 3; // Stage 3: Production
    } else if (reps >= 1 && interval >= 3) {
      stage = 2; // Stage 2: Recall
    }
    return stage;
  },

  getStageLabel(stage) {
    switch (Number(stage)) {
      case 1: return { text: "L1 · Recognition", class: "stage-1", color: "#26e6ff" };
      case 2: return { text: "L2 · Recall", class: "stage-2", color: "#ffd43b" };
      case 3: return { text: "L3 · Production", class: "stage-3", color: "#ff5a1f" };
      case 4: return { text: "L4 · Automaticity", class: "stage-4", color: "#63f28a" };
      default: return { text: "L1 · Recognition", class: "stage-1", color: "#26e6ff" };
    }
  },

  getDueWords(vocabList) {
    const now = Date.now();
    return vocabList.filter(item => {
      if (!item.srs || !item.srs.dueDate) return true;
      return item.srs.dueDate <= now;
    });
  }
};

window.SRS = SRS;
