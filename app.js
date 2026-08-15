// NEON ENGLISH — Core Application Orchestrator v0.3.1

// Safe Vocabulary Loader
const CUSTOM_KEY = "neonEnglish_customVocab_v1";
let customVocab = [];
try {
  customVocab = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
} catch (_) {
  customVocab = [];
}

const rawVocab = (typeof window !== "undefined" && (window.INITIAL_VOCAB || window.VOCABULARY_DATA))
  ? (window.INITIAL_VOCAB || window.VOCABULARY_DATA)
  : (typeof INITIAL_VOCAB !== "undefined" ? INITIAL_VOCAB : (typeof VOCABULARY_DATA !== "undefined" ? VOCABULARY_DATA : []));

const initialVocab = Array.isArray(rawVocab) ? [...rawVocab] : [];
if (Array.isArray(customVocab) && customVocab.length > 0) {
  const existingIds = new Set(initialVocab.map(w => w.id || w.word));
  customVocab.forEach(item => {
    if (!existingIds.has(item.id || item.word)) {
      initialVocab.unshift(item);
    }
  });
}

const state = {
  vocab: initialVocab,
  currentTab: "memory",
  xp: 0,
  streak: 1,
  mode: "restless",
  totalQuizzes: 0,
  correctQuizzes: 0,
  lastActiveDay: new Date().toDateString(),
  ...JSON.parse(localStorage.getItem("neonState_v2") || "{}")
};

let currentIndex = 0;
let timerId = null;
let deferredPrompt = null;
let mindmapInstance = null;
let currentImmersionScenario = (window.IMMERSION_SCENARIOS && window.IMMERSION_SCENARIOS[0]) || null;

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

function saveState() {
  localStorage.setItem("neonState_v2", JSON.stringify(state));
  updateHeaderStats();
}

function updateHeaderStats() {
  const xpEl = $("#xp");
  const streakEl = $("#streak");
  const masteredEl = $("#mastered");
  const srsDueBadge = $("#srsDueBadge");

  if (xpEl) xpEl.textContent = state.xp || 0;
  if (streakEl) streakEl.textContent = state.streak || 1;

  if (window.SRS && state.vocab) {
    const dueCount = SRS.getDueWords(state.vocab).length;
    if (srsDueBadge) srsDueBadge.textContent = dueCount;
  }

  const masteredCount = state.vocab.filter(w => (w.stage || 1) === 4).length;
  if (masteredEl) masteredEl.textContent = masteredCount;
}

// Navigation & Screen Management with Global Event Delegation
function go(id) {
  if (!id) return;
  $$(".screen").forEach(x => x.classList.toggle("active", x.id === id));
  $$(".nav").forEach(x => x.classList.toggle("active", x.dataset.screen === id || x.dataset.go === id));
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "universe") renderWord();
  if (id === "mindmap-screen") initOrUpdateMindMap();
  if (id === "srs-screen") renderSRSDeck();
  if (id === "blurting") setupBlurtScreen();
  if (id === "hunt") newHunt();
  if (id === "story-screen") setupStoryScreen();
  if (id === "immersion-screen") renderImmersionScreen();
  if (id === "analytics-screen") renderAnalyticsScreen();
}
window.go = go;

// Global Click Delegation for ALL data-screen and data-go buttons
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-screen], [data-go]");
  if (target) {
    const screenId = target.dataset.screen || target.dataset.go;
    if (screenId) {
      e.preventDefault();
      go(screenId);
    }
  }
});

// Brain Mode Toggle
document.addEventListener("click", (e) => {
  const modeBtn = e.target.closest(".modes button");
  if (modeBtn) {
    $$(".modes button").forEach(x => x.classList.remove("selected"));
    modeBtn.classList.add("selected");
    state.mode = modeBtn.dataset.mode;
    const titleEl = $("#modeTitle");
    if (titleEl) {
      titleEl.textContent = {
        focused: "🟢 Focused",
        restless: "🟡 Restless",
        overloaded: "🔴 Overloaded",
        tired: "🔵 Tired"
      }[state.mode] || "🟡 Restless";
    }
    saveState();
  }
});

// Word Universe Functions
function renderWord() {
  if (!state.vocab || !state.vocab.length) return;
  const w = state.vocab[currentIndex % state.vocab.length];
  if (!w) return;

  const titleEl = $("#wordTitle");
  if (titleEl) titleEl.textContent = w.word;

  if (window.SRS) {
    const stageData = SRS.getStageLabel(w.stage || 1);
    const stageBadge = $("#wordStageBadge");
    if (stageBadge) {
      stageBadge.textContent = stageData.text;
      stageBadge.className = `stage-pill ${stageData.class}`;
    }
  }

  const wordCard = $("#wordCard");
  if (wordCard) {
    wordCard.innerHTML = `
      <div class="label">${w.category || "FINANCE & STRATEGY"}</div>
      <h1>${w.word}</h1>
      <div class="meaning">${w.meaning || w.translation || ""}</div>
      <div class="phonetic">${w.phonetic || ""}</div>
      <div class="hook"><b>🧠 Memory Hook:</b> ${w.hook || "Association visuelle"}</div>
    `;
  }

  renderActiveTab();
}

function renderActiveTab() {
  if (!state.vocab || !state.vocab.length) return;
  const w = state.vocab[currentIndex % state.vocab.length];
  const tabContent = $("#tabContent");
  if (!tabContent || !w) return;

  const splitList = val => Array.isArray(val) ? val : String(val || "").split(/\s*[·,;•]\s*/).filter(Boolean);
  const synonyms = splitList(w.synonyms);
  const antonyms = splitList(w.antonyms);
  const collocations = splitList(w.collocations);

  if (state.currentTab === "memory") {
    tabContent.innerHTML = `
      <p><b>Approche 1 — Ancrage Mental :</b></p>
      <p style="font-size:15px; margin-top:6px;">${w.hook || "Visualise le mot en contexte."}</p>
      <div style="margin-top:14px;">
        <span class="label">IMAGE VISUELLE :</span>
        <p style="margin-top:4px; font-style:italic;">Imagine une situation concrète où tu dois utiliser <b>${w.word}</b>.</p>
      </div>
    `;
  } else if (state.currentTab === "links") {
    const synHTML = synonyms.map(s => `<span class="pill">${s}</span>`).join("") || '<span class="muted">Aucun</span>';
    const antHTML = antonyms.map(a => `<span class="pill" style="border-color:rgba(80,124,109,0.4)">${a}</span>`).join("") || '<span class="muted">Aucun</span>';
    const colHTML = collocations.map(c => `<span class="pill" style="border-color:rgba(201,178,124,0.4)">${c}</span>`).join("") || '<span class="muted">Aucune</span>';

    tabContent.innerHTML = `
      <div><span class="label">🔗 SYNONYMES :</span><div style="margin-top:6px;">${synHTML}</div></div>
      <div style="margin-top:14px;"><span class="label">⚡ ANTONYMES :</span><div style="margin-top:6px;">${antHTML}</div></div>
      <div style="margin-top:14px;"><span class="label">💼 COLLOCATIONS & FORMES :</span><div style="margin-top:6px;">${colHTML}</div></div>
    `;
  } else if (state.currentTab === "story") {
    tabContent.innerHTML = `
      <span class="label">CONTEXTUAL MINI-STORY :</span>
      <p class="example" style="font-size:16px;">${w.story || w.example || ""}</p>
      <button class="primary-btn" onclick="speakCurrent('${(w.story || w.example || "").replace(/'/g, "\\'")}')" style="margin-top:10px">🔊 Écouter l'histoire</button>
    `;
  } else if (state.currentTab === "speak") {
    tabContent.innerHTML = `
      <span class="label">🗣️ SHADOWING PRACTICE :</span>
      <p class="example">${w.example || w.word}</p>
      <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
        <button class="primary-btn" onclick="speakCurrent('${(w.example || w.word).replace(/'/g, "\\'")}')">🔊 Écouter</button>
        <button class="secondary-btn" onclick="markShadowingDone()">✓ J'ai répété à voix haute (+15 XP)</button>
      </div>
    `;
  }
}

function markShadowingDone() {
  state.xp += 15;
  const w = state.vocab[currentIndex % state.vocab.length];
  if (w) w.productionCount = (w.productionCount || 0) + 1;
  saveState();
  alert(`🔥 Shadowing enregistré pour "${w ? w.word : "le mot"}" ! +15 XP`);
}
window.markShadowingDone = markShadowingDone;

document.addEventListener("click", (e) => {
  const tabBtn = e.target.closest(".tabs button");
  if (tabBtn) {
    $$(".tabs button").forEach(x => x.classList.remove("active"));
    tabBtn.classList.add("active");
    state.currentTab = tabBtn.dataset.tab;
    renderActiveTab();
  }
});

$("#nextWord")?.addEventListener("click", () => {
  if (state.vocab && state.vocab.length) {
    currentIndex = (currentIndex + 1) % state.vocab.length;
    renderWord();
  }
});

function gradeCurrentWord(grade) {
  if (!state.vocab || !state.vocab.length) return;
  const w = state.vocab[currentIndex % state.vocab.length];
  if (window.SRS) {
    const srsResult = SRS.calculate(w.srs, grade);
    w.srs = srsResult;
    w.stage = SRS.updateStage(w, srsResult);
  }

  state.xp += grade * 10;
  saveState();

  currentIndex = (currentIndex + 1) % state.vocab.length;
  renderWord();
}
window.gradeCurrentWord = gradeCurrentWord;

// Mind Map Functions
function initOrUpdateMindMap() {
  if (!state.vocab || !state.vocab.length) return;
  const select = $("#mindmapWordSelect");
  if (select) {
    select.innerHTML = state.vocab.map((w, idx) => `<option value="${idx}">${w.word} (${w.meaning || w.translation || ""})</option>`).join("");
    select.value = currentIndex % state.vocab.length;
    select.onchange = (e) => {
      currentIndex = Number(e.target.value);
      if (mindmapInstance) mindmapInstance.loadWord(state.vocab[currentIndex]);
    };
  }

  if (!mindmapInstance && window.NeonMindMap) {
    mindmapInstance = new window.NeonMindMap("mindmapCanvas");
  }
  if (mindmapInstance) {
    mindmapInstance.loadWord(state.vocab[currentIndex % state.vocab.length]);
  }

  const resetBtn = $("#resetMindmapView");
  if (resetBtn) {
    resetBtn.onclick = () => {
      if (mindmapInstance) mindmapInstance.resetView();
    };
  }
}

// SRS Practice Deck Functions
let srsQueue = [];
let srsQueueIdx = 0;
let isAnswerRevealed = false;

function renderSRSDeck() {
  if (!state.vocab || !state.vocab.length) return;
  srsQueue = window.SRS ? SRS.getDueWords(state.vocab) : state.vocab;
  if (srsQueue.length === 0) srsQueue = state.vocab;
  srsQueueIdx = 0;
  showSRSCard();
}

function showSRSCard() {
  const card = $("#srsCardInner");
  if (!card) return;
  if (srsQueueIdx >= srsQueue.length) {
    card.innerHTML = `
      <h2>🎉 Review Session Complete!</h2>
      <p class="muted">Tu as révisé tous les mots dus pour aujourd'hui.</p>
      <button class="primary-btn" onclick="go('home')" style="margin-top:15px">Retour à l'accueil</button>
    `;
    return;
  }

  const w = srsQueue[srsQueueIdx];
  isAnswerRevealed = false;

  card.innerHTML = `
    <span class="eyebrow">RECALL CHALLENGE · CARD ${srsQueueIdx + 1}/${srsQueue.length}</span>
    <h1 style="font-size:46px; margin:15px 0;">${w.word}</h1>
    <div id="srsAnswerArea" class="hidden">
      <div class="meaning" style="color:var(--yellow); font-weight:800; font-size:24px;">${w.meaning || w.translation || ""}</div>
      <div class="phonetic" style="margin:8px 0;">${w.phonetic || ""}</div>
      <div class="hook" style="text-align:left; margin:15px 0;"><b>🧠 Hook :</b> ${w.hook}</div>
      <p class="example" style="font-size:15px;">${w.example || ""}</p>
    </div>
    <div id="srsActionArea" style="margin-top:20px;">
      <button id="revealAnswerBtn" class="primary-btn">👁️ Révéler la réponse</button>
    </div>
  `;

  $("#revealAnswerBtn")?.addEventListener("click", () => {
    isAnswerRevealed = true;
    $("#srsAnswerArea")?.classList.remove("hidden");
    const actionArea = $("#srsActionArea");
    if (actionArea) {
      actionArea.innerHTML = `
        <div class="grade-btns">
          <button onclick="submitSRSGrade(1)" class="grade-btn g1">🔴 Again (1d)</button>
          <button onclick="submitSRSGrade(2)" class="grade-btn g2">🟠 Hard</button>
          <button onclick="submitSRSGrade(3)" class="grade-btn g3">🟡 Good</button>
          <button onclick="submitSRSGrade(4)" class="grade-btn g4">🟢 Easy</button>
        </div>
      `;
    }
  });
}

function submitSRSGrade(grade) {
  const w = srsQueue[srsQueueIdx];
  if (w && window.SRS) {
    const srsResult = SRS.calculate(w.srs, grade);
    w.srs = srsResult;
    w.stage = SRS.updateStage(w, srsResult);
  }

  state.totalQuizzes = (state.totalQuizzes || 0) + 1;
  if (grade >= 3) {
    state.correctQuizzes = (state.correctQuizzes || 0) + 1;
    state.xp += 30;
  }

  saveState();
  srsQueueIdx++;
  showSRSCard();
}
window.submitSRSGrade = submitSRSGrade;

// Active Recall Blurting Functions
let blurtSeconds = 60;
function setupBlurtScreen() {
  if (!state.vocab || !state.vocab.length) return;
  const w = state.vocab[currentIndex % state.vocab.length];
  if ($("#blurtWord")) $("#blurtWord").textContent = w.word;
  if ($("#blurtInput")) $("#blurtInput").value = "";
  if ($("#blurtResult")) $("#blurtResult").classList.add("hidden");
  clearInterval(timerId);
  if ($("#timer")) $("#timer").textContent = "60";
}

$("#startBlurt")?.addEventListener("click", () => {
  clearInterval(timerId);
  blurtSeconds = 60;
  if ($("#timer")) $("#timer").textContent = "60";
  timerId = setInterval(() => {
    blurtSeconds--;
    if ($("#timer")) $("#timer").textContent = String(blurtSeconds);
    if (blurtSeconds <= 0) {
      clearInterval(timerId);
      $("#checkBlurt")?.click();
    }
  }, 1000);
});

$("#checkBlurt")?.addEventListener("click", () => {
  clearInterval(timerId);
  if (!state.vocab || !state.vocab.length) return;
  const w = state.vocab[currentIndex % state.vocab.length];
  const text = ($("#blurtInput")?.value || "").toLowerCase();

  const splitList = val => Array.isArray(val) ? val : String(val || "").split(/\s*[·,;•]\s*/).filter(Boolean);
  const terms = [
    (w.meaning || w.translation || "").toLowerCase(),
    ...splitList(w.synonyms).map(s => s.toLowerCase()),
    ...splitList(w.collocations).map(c => c.toLowerCase())
  ].filter(Boolean);

  const hit = terms.filter(t => text.includes(t));
  const res = $("#blurtResult");
  if (res) {
    res.classList.remove("hidden");
    res.innerHTML = `
      <b>🧠 Active Recall Check — ${w.word}</b>
      <p>Tu as retrouvé <b>${hit.length}/${terms.length}</b> termes et collocations clés.</p>
      <p>${terms.slice(0, 6).map(t => text.includes(t) ? `🟢 ${t}` : `🔴 ${t}`).join("<br>")}</p>
    `;
  }

  w.blurtScore = Math.round((hit.length / Math.max(1, terms.length)) * 100);
  state.xp += hit.length * 20;
  state.totalQuizzes = (state.totalQuizzes || 0) + 1;
  if (hit.length >= 2) state.correctQuizzes = (state.correctQuizzes || 0) + 1;
  saveState();
});

// Micro-Challenge Word Hunt
function newHunt() {
  if (!state.vocab || state.vocab.length < 4) return;
  const target = state.vocab[Math.floor(Math.random() * state.vocab.length)];
  const distractors = state.vocab.filter(w => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
  const choices = [target, ...distractors].sort(() => 0.5 - Math.random());

  if ($("#huntQuestion")) $("#huntQuestion").textContent = target.meaning || target.translation || "";
  if ($("#huntFeedback")) $("#huntFeedback").classList.add("hidden");
  if ($("#huntChoices")) {
    $("#huntChoices").innerHTML = choices.map(c => `<button onclick="answerHunt('${c.word}', '${target.word}')">${c.word}</button>`).join("");
  }
}

function answerHunt(chosen, correct) {
  const f = $("#huntFeedback");
  if (f) f.classList.remove("hidden");
  state.totalQuizzes = (state.totalQuizzes || 0) + 1;

  if (chosen === correct) {
    if (f) f.innerHTML = "🔥 Correct ! +50 XP";
    state.xp += 50;
    state.correctQuizzes = (state.correctQuizzes || 0) + 1;
  } else {
    if (f) f.innerHTML = `🟠 Pas tout à fait. La réponse exacte était <b>${correct}</b>.`;
  }
  saveState();
  setTimeout(newHunt, 1000);
}
window.answerHunt = answerHunt;

// Story Generator Functions
function setupStoryScreen() {
  const container = $("#storyWordPickers");
  if (!container || !state.vocab || !state.vocab.length) return;
  const optionsHTML = state.vocab.map(w => `<option value="${w.id || w.word}">${w.word} (${w.meaning || w.translation || ""})</option>`).join("");

  container.innerHTML = `
    <div><label class="label">Mot 1</label><select id="sw1" class="neon-select" style="width:100%">${optionsHTML}</select></div>
    <div><label class="label">Mot 2</label><select id="sw2" class="neon-select" style="width:100%">${optionsHTML}</select></div>
    <div><label class="label">Mot 3</label><select id="sw3" class="neon-select" style="width:100%">${optionsHTML}</select></div>
  `;
}

$("#generateStoryBtn")?.addEventListener("click", () => {
  if (!state.vocab || !state.vocab.length) return;
  const id1 = $("#sw1") ? $("#sw1").value : state.vocab[0].id;
  const id2 = $("#sw2") ? $("#sw2").value : (state.vocab[1] ? state.vocab[1].id : state.vocab[0].id);
  const id3 = $("#sw3") ? $("#sw3").value : (state.vocab[2] ? state.vocab[2].id : state.vocab[0].id);

  const w1 = state.vocab.find(w => (w.id || w.word) === id1) || state.vocab[0];
  const w2 = state.vocab.find(w => (w.id || w.word) === id2) || state.vocab[1] || state.vocab[0];
  const w3 = state.vocab.find(w => (w.id || w.word) === id3) || state.vocab[2] || state.vocab[0];

  if (window.StoryEngine) {
    const storyObj = StoryEngine.generate([w1, w2, w3]);
    const out = $("#storyOutput");
    if (out) {
      out.classList.remove("hidden");
      out.innerHTML = `
        <h3>🎭 Récit Contextuel</h3>
        <p class="example" style="font-size:17px;">${storyObj.text}</p>
        <button class="primary-btn" onclick="speakCurrent('${storyObj.rawText.replace(/'/g, "\\'")}')" style="margin:10px 0;">🔊 Écouter l'histoire</button>
        <p class="translation" style="margin-top:12px;"><b>Traduction :</b> ${storyObj.translation}</p>
      `;
    }
  }
});

$("#randomStoryBtn")?.addEventListener("click", () => {
  if (!state.vocab || state.vocab.length < 3) return;
  const shuffled = [...state.vocab].sort(() => 0.5 - Math.random());
  if (shuffled.length >= 3) {
    if ($("#sw1")) $("#sw1").value = shuffled[0].id || shuffled[0].word;
    if ($("#sw2")) $("#sw2").value = shuffled[1].id || shuffled[1].word;
    if ($("#sw3")) $("#sw3").value = shuffled[2].id || shuffled[2].word;
    $("#generateStoryBtn")?.click();
  }
});

// MODE IMMERSION
function renderImmersionScreen() {
  const scenarios = window.IMMERSION_SCENARIOS || [];
  const grid = $("#immersionGrid");
  const viewer = $("#scenarioViewer");

  if (grid) {
    grid.innerHTML = scenarios.map(sc => `
      <div class="scenario-card" onclick="selectImmersionScenario('${sc.id}')">
        <span class="scenario-icon">${sc.icon}</span>
        <h3>${sc.title}</h3>
        <p>${sc.desc}</p>
      </div>
    `).join("");
  }

  if (viewer) {
    if (currentImmersionScenario) {
      viewer.classList.remove("hidden");
      if ($("#immersionTitle")) $("#immersionTitle").textContent = `${currentImmersionScenario.icon} ${currentImmersionScenario.title}`;
      if ($("#immersionDesc")) $("#immersionDesc").textContent = currentImmersionScenario.desc;

      const list = $("#dialogueList");
      if (list) {
        list.innerHTML = currentImmersionScenario.dialogue.map((line, idx) => `
          <div class="dialogue-bubble ${line.role}">
            <div class="dialogue-header">
              <span class="dialogue-speaker">${line.speaker.toUpperCase()}</span>
              <button class="neon-mini" onclick="speakCurrent('${line.audio.replace(/'/g, "\\'")}')">🔊 Écouter</button>
            </div>
            <div class="dialogue-text">${line.text}</div>
            <div id="trans_${idx}" class="dialogue-translation hidden">${line.translation}</div>
            <div class="dialogue-actions">
              <button class="secondary-btn" onclick="toggleTranslation('trans_${idx}')" style="padding:6px 10px; font-size:12px;">👁️ Traduction</button>
              <button class="primary-btn" onclick="practiceShadowingLine('${line.audio.replace(/'/g, "\\'")}')" style="padding:6px 10px; font-size:12px;">🗣️ Répéter (+10 XP)</button>
            </div>
          </div>
        `).join("");
      }
    } else {
      viewer.classList.add("hidden");
    }
  }
}

function selectImmersionScenario(id) {
  const sc = (window.IMMERSION_SCENARIOS || []).find(s => s.id === id);
  if (sc) {
    currentImmersionScenario = sc;
    renderImmersionScreen();
    $("#scenarioViewer")?.scrollIntoView({ behavior: "smooth" });
  }
}
window.selectImmersionScenario = selectImmersionScenario;

function toggleTranslation(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("hidden");
}
window.toggleTranslation = toggleTranslation;

function practiceShadowingLine(audioText) {
  speakCurrent(audioText);
  state.xp += 10;
  saveState();
}
window.practiceShadowingLine = practiceShadowingLine;

// Analytics Dashboard
function renderAnalyticsScreen() {
  if (window.Analytics) {
    const stats = Analytics.computeStats(state.vocab, state);
    Analytics.renderDashboard("analyticsContent", stats, (weakWords) => {
      if (weakWords.length > 0) {
        const firstWeakIdx = state.vocab.findIndex(w => w.id === weakWords[0].id || w.word === weakWords[0].word);
        if (firstWeakIdx !== -1) currentIndex = firstWeakIdx;
        go("universe");
      }
    });
  }
}

// ➕ ADD WORD / NUOVA PAROLA MODAL
function initAddWordModal() {
  const modal = $("#addWordModal");
  $("#openAddWordBtn")?.addEventListener("click", () => modal?.classList.remove("hidden"));
  $("#closeAddWordBtn")?.addEventListener("click", () => modal?.classList.add("hidden"));

  $("#saveNewWordBtn")?.addEventListener("click", () => {
    const word = ($("#newWord")?.value || "").trim().toUpperCase();
    const meaning = ($("#newMeaning")?.value || "").trim();
    const phonetic = ($("#newPhonetic")?.value || "").trim();
    const hook = ($("#newHook")?.value || "").trim() || "Ancre visuelle forte";
    const synonyms = ($("#newSynonyms")?.value || "").trim();
    const antonyms = ($("#newAntonyms")?.value || "").trim();
    const collocations = ($("#newCollocations")?.value || "").trim();
    const example = ($("#newExample")?.value || "").trim() || `I use ${word} in context.`;
    const story = ($("#newStory")?.value || "").trim() || example;

    if (!word || !meaning) {
      alert("Veuillez renseigner au moins le mot et sa signification.");
      return;
    }

    const newObj = {
      id: "custom_" + Date.now(),
      word,
      meaning,
      phonetic: phonetic || `[${word.toLowerCase()}]`,
      category: "USER VOCABULARY",
      hook,
      synonyms: synonyms ? synonyms.split(/\s*[·,;•]\s*/).filter(Boolean) : [],
      antonyms: antonyms ? antonyms.split(/\s*[·,;•]\s*/).filter(Boolean) : [],
      collocations: collocations ? collocations.split(/\s*[·,;•]\s*/).filter(Boolean) : [],
      example,
      story,
      stage: 1,
      srs: { reps: 0, interval: 0, easeFactor: 2.5, dueDate: Date.now() }
    };

    // Save to custom vocabulary storage
    try {
      const stored = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
      stored.unshift(newObj);
      localStorage.setItem(CUSTOM_KEY, JSON.stringify(stored));
    } catch (_) {}

    state.vocab.unshift(newObj);
    state.xp += 50;
    currentIndex = 0;
    saveState();

    if (modal) modal.classList.add("hidden");
    // Clear inputs
    ["#newWord", "#newMeaning", "#newPhonetic", "#newHook", "#newSynonyms", "#newAntonyms", "#newCollocations", "#newExample", "#newStory"].forEach(sel => {
      const el = $(sel);
      if (el) el.value = "";
    });

    alert(`🔥 Le mot "${word}" a été ajouté à ton Univers Anglais ! (+50 XP)`);
    go("universe");
  });
}

// Importer & Exporter Modal
$("#openImportBtn")?.addEventListener("click", () => $("#importerModal")?.classList.remove("hidden"));
$("#closeImportBtn")?.addEventListener("click", () => $("#importerModal")?.classList.add("hidden"));

$("#doImportBtn")?.addEventListener("click", () => {
  const input = $("#importInput")?.value;
  if (!window.VocabImporter) return;
  const newItems = VocabImporter.parseText(input);
  const fb = $("#importFeedback");
  if (fb) fb.classList.remove("hidden");

  if (newItems.length > 0) {
    const existingIds = new Set(state.vocab.map(w => w.id || w.word));
    let addedCount = 0;

    newItems.forEach(item => {
      if (!existingIds.has(item.id || item.word)) {
        state.vocab.push(item);
        addedCount++;
      }
    });

    saveState();
    if (fb) fb.innerHTML = `🔥 Succès ! <b>${addedCount}</b> nouveaux mots ont été ajoutés à ta bibliothèque NEON.`;
    setTimeout(() => $("#importerModal")?.classList.add("hidden"), 1600);
  } else {
    if (fb) fb.innerHTML = `🟠 Impossible d'analyser le texte. Vérifie le format.`;
  }
});

$("#doExportBtn")?.addEventListener("click", () => {
  if (window.VocabImporter) {
    VocabImporter.exportJSON(state.vocab);
  }
});

// Web Speech Synthesis (TTS)
function speakCurrent(customText) {
  const w = state.vocab && state.vocab[currentIndex % state.vocab.length];
  const textToSpeak = customText || (w ? w.example || w.word : "Hello");
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(textToSpeak);
  u.lang = "en-US";
  u.rate = 0.88;
  speechSynthesis.speak(u);
}
window.speakCurrent = speakCurrent;

// Reset Data
$("#resetBtn")?.addEventListener("click", () => {
  if (confirm("Réinitialiser toute la progression et restaurer la bibliothèque par défaut ?")) {
    localStorage.removeItem("neonState_v2");
    localStorage.removeItem(CUSTOM_KEY);
    location.reload();
  }
});

// PWA Service Worker & Install Prompt
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  $("#installBtn")?.classList.remove("hidden");
});

$("#installBtn")?.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt = null;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js?v=0.3.1").then(reg => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              console.log("[PWA English] New version available, reloading...");
              window.location.reload();
            }
          });
        }
      });
    }).catch(err => console.error("[PWA English] SW registration failed:", err));
  });
}

// Initial Kickoff
function initApp() {
  initAddWordModal();
  updateHeaderStats();
  renderWord();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}