// NEON ENGLISH V0.2 — Main Core Application Logic

let currentIndex = 0;
let currentTab = "memory";
let timerId = null;
let deferredPrompt = null;
let mindmapInstance = null;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// Load state or initialize with default structure
let state = JSON.parse(localStorage.getItem("neonState_v2") || 'null');
if (!state) {
  state = {
    xp: 0,
    mastered: 0,
    streak: 1,
    mode: "restless",
    totalQuizzes: 0,
    correctQuizzes: 0,
    vocab: window.INITIAL_VOCAB || []
  };
} else if (!state.vocab || state.vocab.length === 0) {
  state.vocab = window.INITIAL_VOCAB || [];
}

// Ensure all entries have SRS and Stage fields
state.vocab = state.vocab.map(item => ({
  ...item,
  stage: item.stage || 1,
  srs: item.srs || { interval: 1, easeFactor: 2.5, dueDate: Date.now(), reps: 0, lastReviewed: null }
}));

function saveState() {
  localStorage.setItem("neonState_v2", JSON.stringify(state));
  updateHeaderStats();
}

function updateHeaderStats() {
  const stats = Analytics.computeStats(state.vocab, state);
  $("#xp").textContent = state.xp;
  $("#mastered").textContent = stats.stageCounts[4] || 0;
  $("#streak").textContent = state.streak;
  $("#srsDueBadge").textContent = stats.dueCount;
}

// Screen Navigation
function go(id) {
  $$(".screen").forEach(x => x.classList.toggle("active", x.id === id));
  $$(".nav").forEach(x => x.classList.toggle("active", x.dataset.screen === id));

  if (id === "universe") renderWord();
  if (id === "mindmap-screen") initOrUpdateMindMap();
  if (id === "srs-screen") renderSRSDeck();
  if (id === "blurting") setupBlurtScreen();
  if (id === "hunt") newHunt();
  if (id === "story-screen") setupStoryScreen();
  if (id === "analytics-screen") renderAnalyticsScreen();
}

$$("[data-screen]").forEach(b => b.addEventListener("click", () => go(b.dataset.screen)));

// Brain Mode Toggle
$$(".modes button").forEach(b => b.addEventListener("click", () => {
  $$(".modes button").forEach(x => x.classList.remove("selected"));
  b.classList.add("selected");
  state.mode = b.dataset.mode;
  $("#modeTitle").textContent = {
    focused: "🟢 Focused",
    restless: "🟡 Restless",
    overloaded: "🔴 Overloaded",
    tired: "🔵 Tired"
  }[state.mode];
  saveState();
}));

// Word Universe Functions
function renderWord() {
  if (!state.vocab.length) return;
  const w = state.vocab[currentIndex % state.vocab.length];
  $("#wordTitle").textContent = w.word;

  const stageData = SRS.getStageLabel(w.stage);
  const stageBadge = $("#wordStageBadge");
  if (stageBadge) {
    stageBadge.textContent = stageData.text;
    stageBadge.className = `stage-pill ${stageData.class}`;
  }

  $("#wordCard").innerHTML = `
    <div class="eyebrow">${w.category.toUpperCase()} · MEMORY CARD</div>
    <h1>${w.word}</h1>
    <div class="meaning">${w.meaning}</div>
    <div class="phonetic">${w.phonetic}</div>
    <div class="hook">
      <b>🧠 MEMORY HOOK (Approche 1)</b><br>${w.hook}
    </div>
  `;
  renderTab();
}

function renderTab() {
  if (!state.vocab.length) return;
  const w = state.vocab[currentIndex % state.vocab.length];
  const c = $("#tabContent");

  if (currentTab === "memory") {
    c.innerHTML = `
      <div><b>Synonyms</b><br>${w.synonyms.map(x => `<span class="pill">${x}</span>`).join("") || "—"}</div>
      <div style="margin-top:10px"><b>Opposites</b><br>${w.antonyms.map(x => `<span class="pill">${x}</span>`).join("") || "—"}</div>
      <div class="example">“${w.example}”</div>
      <div class="translation">${w.translation}</div>
    `;
  } else if (currentTab === "links") {
    c.innerHTML = `
      <b>🔗 Word Network (Approche 3)</b>
      <p>${w.links.map(x => `<span class="pill">${x}</span>`).join("")}</p>
      <p style="margin-top:12px"><b>Collocations & Expressions</b></p>
      <p>${w.collocations.map(x => `<span class="pill">${x}</span>`).join("")}</p>
    `;
  } else if (currentTab === "story") {
    c.innerHTML = `
      <b>🎭 Mini-story</b>
      <p class="example">${w.story}</p>
      <p class="translation">${w.personal || "Fais une pause et visualise l'histoire dans ton esprit."}</p>
    `;
  } else if (currentTab === "speak") {
    c.innerHTML = `
      <b>🗣️ Shadowing Practice</b>
      <p class="example">“${w.example}”</p>
      <button class="primary-btn" onclick="speakCurrent()">🔊 Écouter & Répéter</button>
      <p class="translation" style="margin-top:12px">Répète immédiatement à voix haute en imitant le rythme et l'intonation.</p>
    `;
  }
}

$$(".tab").forEach(b => b.addEventListener("click", () => {
  $$(".tab").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  currentTab = b.dataset.tab;
  renderTab();
}));

$("#nextWord").addEventListener("click", () => {
  currentIndex++;
  state.xp += 10;
  saveState();
  renderWord();
});

function gradeCurrentWord(grade) {
  const w = state.vocab[currentIndex % state.vocab.length];
  const srsResult = SRS.calculate(w.srs, grade);
  w.srs = srsResult;
  w.stage = SRS.updateStage(w, srsResult);

  if (grade >= 3) state.xp += 25;
  saveState();
  renderWord();
}
window.gradeCurrentWord = gradeCurrentWord;

// Mind Map Functions
function initOrUpdateMindMap() {
  const select = $("#mindmapWordSelect");
  if (select) {
    select.innerHTML = state.vocab.map((w, idx) => `<option value="${idx}">${w.word} (${w.meaning})</option>`).join("");
    select.value = currentIndex % state.vocab.length;
    select.onchange = (e) => {
      currentIndex = Number(e.target.value);
      if (mindmapInstance) mindmapInstance.loadWord(state.vocab[currentIndex]);
    };
  }

  if (!mindmapInstance) {
    mindmapInstance = new NeonMindMap("mindmapCanvas");
  }
  mindmapInstance.loadWord(state.vocab[currentIndex % state.vocab.length]);

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
  srsQueue = SRS.getDueWords(state.vocab);
  if (srsQueue.length === 0) srsQueue = state.vocab; // Fallback to all words if none due
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
      <div class="meaning" style="color:var(--yellow); font-weight:800; font-size:24px;">${w.meaning}</div>
      <div class="hook" style="margin:15px 0; text-align:left;"><b>🧠 Memory Hook:</b> ${w.hook}</div>
      <div class="example">“${w.example}”</div>
    </div>
    <div style="margin-top:25px;" id="srsActionArea">
      <button id="revealSrsBtn" class="primary-btn" style="width:100%;">👁️ Révéler la réponse</button>
    </div>
  `;

  $("#revealSrsBtn").addEventListener("click", () => {
    isAnswerRevealed = true;
    $("#srsAnswerArea").classList.remove("hidden");
    $("#srsActionArea").innerHTML = `
      <div class="grade-btns">
        <button onclick="submitSRSGrade(1)" class="grade-btn g1">🔴 Again (1d)</button>
        <button onclick="submitSRSGrade(2)" class="grade-btn g2">🟠 Hard</button>
        <button onclick="submitSRSGrade(3)" class="grade-btn g3">🟡 Good</button>
        <button onclick="submitSRSGrade(4)" class="grade-btn g4">🟢 Easy</button>
      </div>
    `;
  });
}

function submitSRSGrade(grade) {
  const w = srsQueue[srsQueueIdx];
  const srsResult = SRS.calculate(w.srs, grade);
  w.srs = srsResult;
  w.stage = SRS.updateStage(w, srsResult);

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
  const w = state.vocab[currentIndex % state.vocab.length];
  $("#blurtWord").textContent = w.word;
  $("#blurtInput").value = "";
  $("#blurtResult").classList.add("hidden");
  clearInterval(timerId);
  $("#timer").textContent = "60";
}

$("#startBlurt").addEventListener("click", () => {
  clearInterval(timerId);
  blurtSeconds = 60;
  $("#timer").textContent = 60;
  timerId = setInterval(() => {
    blurtSeconds--;
    $("#timer").textContent = blurtSeconds;
    if (blurtSeconds <= 0) {
      clearInterval(timerId);
      $("#timer").textContent = "TIME";
    }
  }, 1000);
});

$("#checkBlurt").addEventListener("click", () => {
  const text = $("#blurtInput").value.toLowerCase();
  const w = state.vocab[currentIndex % state.vocab.length];
  const terms = [w.meaning.toLowerCase(), ...w.synonyms.map(s => s.toLowerCase()), ...w.collocations.map(c => c.toLowerCase())];

  const hit = terms.filter(t => t && text.includes(t));
  const res = $("#blurtResult");
  res.classList.remove("hidden");
  res.innerHTML = `
    <b>🧠 Active Recall Check — ${w.word}</b>
    <p>Tu as retrouvé <b>${hit.length}/${terms.length}</b> termes et collocations clés.</p>
    <p>${terms.slice(0, 6).map(t => text.includes(t) ? `🟢 ${t}` : `🔴 ${t}`).join("<br>")}</p>
  `;

  state.xp += hit.length * 20;
  state.totalQuizzes = (state.totalQuizzes || 0) + 1;
  if (hit.length >= 2) state.correctQuizzes = (state.correctQuizzes || 0) + 1;
  saveState();
});

// Micro-Challenge Word Hunt
function newHunt() {
  if (state.vocab.length < 4) return;
  const target = state.vocab[Math.floor(Math.random() * state.vocab.length)];
  const distractors = state.vocab.filter(w => w.id !== target.id).sort(() => 0.5 - Math.random()).slice(0, 3);
  const choices = [target, ...distractors].sort(() => 0.5 - Math.random());

  $("#huntQuestion").textContent = target.meaning;
  $("#huntFeedback").classList.add("hidden");
  $("#huntChoices").innerHTML = choices.map(c => `<button onclick="answerHunt('${c.word}', '${target.word}')">${c.word}</button>`).join("");
}

function answerHunt(chosen, correct) {
  const f = $("#huntFeedback");
  f.classList.remove("hidden");
  state.totalQuizzes = (state.totalQuizzes || 0) + 1;

  if (chosen === correct) {
    f.innerHTML = "🔥 Correct ! +50 XP";
    state.xp += 50;
    state.correctQuizzes = (state.correctQuizzes || 0) + 1;
  } else {
    f.innerHTML = `🟠 Pas tout à fait. La réponse exacte était <b>${correct}</b>.`;
  }
  saveState();
  setTimeout(newHunt, 1000);
}
window.answerHunt = answerHunt;

// Story Generator Functions
function setupStoryScreen() {
  const container = $("#storyWordPickers");
  if (!container) return;
  const optionsHTML = state.vocab.map(w => `<option value="${w.id}">${w.word} (${w.meaning})</option>`).join("");

  container.innerHTML = `
    <div><label class="label">Mot 1</label><select id="sw1" class="neon-select" style="width:100%">${optionsHTML}</select></div>
    <div><label class="label">Mot 2</label><select id="sw2" class="neon-select" style="width:100%">${optionsHTML}</select></div>
    <div><label class="label">Mot 3</label><select id="sw3" class="neon-select" style="width:100%">${optionsHTML}</select></div>
  `;
}

$("#generateStoryBtn").addEventListener("click", () => {
  const id1 = $("#sw1") ? $("#sw1").value : state.vocab[0].id;
  const id2 = $("#sw2") ? $("#sw2").value : state.vocab[1].id;
  const id3 = $("#sw3") ? $("#sw3").value : state.vocab[2].id;

  const w1 = state.vocab.find(w => w.id === id1) || state.vocab[0];
  const w2 = state.vocab.find(w => w.id === id2) || state.vocab[1];
  const w3 = state.vocab.find(w => w.id === id3) || state.vocab[2];

  const storyObj = StoryEngine.generate([w1, w2, w3]);
  const out = $("#storyOutput");
  out.classList.remove("hidden");
  out.innerHTML = `
    <h3>🎭 Récit Contextuel</h3>
    <p class="example" style="font-size:17px;">${storyObj.text}</p>
    <button class="primary-btn" onclick="speakCurrent('${storyObj.rawText.replace(/'/g, "\\'")}')" style="margin:10px 0;">🔊 Écouter l'histoire</button>
    <p class="translation" style="margin-top:12px;"><b>Traduction :</b> ${storyObj.translation}</p>
  `;
});

$("#randomStoryBtn").addEventListener("click", () => {
  const shuffled = [...state.vocab].sort(() => 0.5 - Math.random());
  if (shuffled.length >= 3) {
    $("#sw1").value = shuffled[0].id;
    $("#sw2").value = shuffled[1].id;
    $("#sw3").value = shuffled[2].id;
    $("#generateStoryBtn").click();
  }
});

// Analytics Dashboard
function renderAnalyticsScreen() {
  const stats = Analytics.computeStats(state.vocab, state);
  Analytics.renderDashboard("analyticsContent", stats, (weakWords) => {
    if (weakWords.length > 0) {
      const firstWeakIdx = state.vocab.findIndex(w => w.id === weakWords[0].id);
      if (firstWeakIdx !== -1) currentIndex = firstWeakIdx;
      go("universe");
    }
  });
}

// Importer & Exporter Modal
$("#openImportBtn").addEventListener("click", () => $("#importerModal").classList.remove("hidden"));
$("#closeImportBtn").addEventListener("click", () => $("#importerModal").classList.add("hidden"));

$("#doImportBtn").addEventListener("click", () => {
  const input = $("#importInput").value;
  const newItems = VocabImporter.parseText(input);
  const fb = $("#importFeedback");
  fb.classList.remove("hidden");

  if (newItems.length > 0) {
    const existingIds = new Set(state.vocab.map(w => w.id));
    let addedCount = 0;

    newItems.forEach(item => {
      if (!existingIds.has(item.id)) {
        state.vocab.push(item);
        addedCount++;
      }
    });

    saveState();
    fb.innerHTML = `🔥 Succès ! <b>${addedCount}</b> nouveaux mots ont été ajoutés à ta bibliothèque NEON.`;
    setTimeout(() => $("#importerModal").classList.add("hidden"), 1600);
  } else {
    fb.innerHTML = `🟠 Impossible d'analyser le texte. Vérifie le format.`;
  }
});

$("#doExportBtn").addEventListener("click", () => {
  VocabImporter.exportJSON(state.vocab);
});

// Web Speech Synthesis (TTS)
function speakCurrent(customText) {
  const w = state.vocab[currentIndex % state.vocab.length];
  const textToSpeak = customText || (w ? w.example : "Hello");
  const u = new SpeechSynthesisUtterance(textToSpeak);
  u.lang = "en-US";
  u.rate = 0.88;
  speechSynthesis.speak(u);
}
window.speakCurrent = speakCurrent;

// Reset Data
$("#resetBtn").addEventListener("click", () => {
  if (confirm("Réinitialiser toute la progression et restaurer la bibliothèque par défaut ?")) {
    localStorage.removeItem("neonState_v2");
    location.reload();
  }
});

// PWA Service Worker & Install Prompt
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  $("#installBtn").classList.remove("hidden");
});

$("#installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt = null;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
}

// Initial Kickoff
updateHeaderStats();
renderWord();