(() => {
  'use strict';

  // Load custom imported vocabulary if present
  const CUSTOM_KEY = 'neonItaliano_customVocab_v1';
  let customVocab = [];
  try {
    customVocab = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
  } catch (_) {
    customVocab = [];
  }

  const initialVocab = Array.isArray(window.ITALIANO_VOCAB) ? [...window.ITALIANO_VOCAB] : [];
  if (Array.isArray(customVocab) && customVocab.length > 0) {
    const existingWords = new Set(initialVocab.map(w => String(w.word).toUpperCase()));
    customVocab.forEach(item => {
      if (!existingWords.has(String(item.word).toUpperCase())) {
        initialVocab.unshift(item);
      }
    });
  }
  window.ITALIANO_VOCAB = initialVocab;
  const VOCAB = window.ITALIANO_VOCAB;

  const KEY = 'neonItaliano_v1';
  const DAY = 86400000, MINUTE = 60000;
  const defaultState = {
    xp: 0,
    streak: 1,
    lastDay: '',
    mood: 'pronto',
    current: 0,
    reviews: {},
    known: {},
    signals: {},
    stats: { seen: 0, correct: 0, blurts: 0, hunts: 0, productions: 0, stories: 0 }
  };

  let state;
  try {
    state = { ...defaultState, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch (_) {
    state = { ...defaultState };
  }

  state.reviews ||= {};
  state.known ||= {};
  state.signals ||= {};
  state.stats = { ...defaultState.stats, ...(state.stats || {}) };

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const today = () => new Date().toISOString().slice(0, 10);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let mindmapInstance = null;
  let currentImmersionScenario = (window.ITALIANO_IMMERSION_SCENARIOS && window.ITALIANO_IMMERSION_SCENARIOS[0]) || null;

  function updateStreak() {
    const t = today();
    if (!state.lastDay) state.lastDay = t;
    else if (state.lastDay !== t) {
      const d = Math.round((new Date(t) - new Date(state.lastDay)) / DAY);
      state.streak = d === 1 ? (state.streak || 1) + 1 : 1;
      state.lastDay = t;
    }
  }

  function dueCount() {
    const now = Date.now();
    return VOCAB.reduce((n, _, i) => n + (state.reviews[i] && (state.reviews[i].due || 0) <= now ? 1 : 0), 0);
  }

  function newCount() {
    return VOCAB.reduce((n, _, i) => n + (!state.reviews[i] ? 1 : 0), 0);
  }

  function nextCardIndex() {
    const now = Date.now();
    const due = VOCAB.map((_, i) => i).filter(i => state.reviews[i] && (state.reviews[i].due || 0) <= now);
    if (due.length) return due[Math.floor(Math.random() * due.length)];
    const fresh = VOCAB.map((_, i) => i).filter(i => !state.reviews[i]);
    if (fresh.length) return fresh[0];
    return (state.current + 1) % Math.max(1, VOCAB.length);
  }

  function show(screen) {
    $$('.screen').forEach(x => x.classList.toggle('active', x.id === screen));
    $$('nav button').forEach(b => b.classList.toggle('active', b.dataset.go === screen));
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (screen === 'learn') renderLearn();
    if (screen === 'immersion-screen') renderImmersionScreen();
    if (screen === 'map') renderMap();
    if (screen === 'srs') renderSrs();
    if (screen === 'blurt') renderBlurt();
    if (screen === 'hunt') newHunt();
    if (screen === 'story') renderStory();
    if (screen === 'statsScreen') renderStats();
    renderHeader();
  }
  window.show = show;

  function renderHeader() {
    const due = dueCount();
    if ($('#due')) $('#due').textContent = due;
    if ($('#xp')) $('#xp').textContent = state.xp || 0;
    if ($('#known')) $('#known').textContent = Object.values(state.known).filter(Boolean).length;
    if ($('#streak')) $('#streak').textContent = state.streak || 1;
    if ($('#srsDue')) $('#srsDue').textContent = due;
  }

  function currentWord() {
    return VOCAB[state.current % Math.max(1, VOCAB.length)] || {};
  }

  function reviewFor(i) {
    return state.reviews[i] || null;
  }

  function signalFor(i) {
    return state.signals[i] || { blurt: 0, production: 0, story: 0 };
  }

  function masteryLabel(i) {
    const r = reviewFor(i), s = signalFor(i);
    if (!r) return '🆕 Nouveau';
    if (r.reps >= 3 && (s.blurt >= 70 || s.production >= 1)) return '🟢 Actif (L4)';
    if (r.reps >= 2) return '🟡 Rappel (L3)';
    return '🔵 Reconnu (L1/L2)';
  }

  function renderLearn() {
    const w = currentWord(), i = state.current % Math.max(1, VOCAB.length), r = reviewFor(i);
    if ($('#word')) $('#word').textContent = w.word || '';
    if ($('#card')) {
      $('#card').innerHTML = `
        <h1>${esc(w.word)}</h1>
        <div class="translation">${esc(w.translation)}</div>
        <div class="phonetic">${esc(w.phonetic || '')} · ${esc(w.level || 'B1')}</div>
        <div style="margin-top:10px;opacity:.85;font-size:.9rem">${masteryLabel(i)} · ${r ? `révisions ${r.reps || 0} · intervalle ${formatInterval((r.interval || 0) * DAY)}` : 'première rencontre'}</div>
      `;
    }
    renderTab('memory');
    updateGradeLabels();
  }

  function updateGradeLabels() {
    const i = state.current % Math.max(1, VOCAB.length), r = reviewFor(i), buttons = $$('[data-grade]');
    if (!buttons.length) return;
    if (!r || !r.reps) {
      buttons[0].innerHTML = '🔴 Encore <small>10 min</small>';
      buttons[1].innerHTML = '🟠 Difficile <small>1 j</small>';
      buttons[2].innerHTML = '🟡 Bien <small>3 j</small>';
      buttons[3].innerHTML = '🟢 Facile <small>7 j</small>';
      return;
    }
    buttons[0].innerHTML = '🔴 Encore <small>10 min</small>';
    buttons[1].innerHTML = `🟠 Difficile <small>${previewInterval(r, 2)}</small>`;
    buttons[2].innerHTML = `🟡 Bien <small>${previewInterval(r, 3)}</small>`;
    buttons[3].innerHTML = `🟢 Facile <small>${previewInterval(r, 4)}</small>`;
  }

  function formatInterval(ms) {
    if (!ms || ms < DAY) return `${Math.max(1, Math.round(ms / MINUTE))} min`;
    const d = Math.max(1, Math.round(ms / DAY));
    return d === 1 ? '1 j' : `${d} j`;
  }

  function calculateInterval(r, grade) {
    const interval = r.interval || 0, ease = r.ease || 2.5;
    if (grade === 1) return 10 * MINUTE;
    if (grade === 2) return Math.max(DAY, interval ? interval * 1.2 * DAY : DAY);
    if (!r.reps) return grade === 4 ? 7 * DAY : 3 * DAY;
    if (r.reps === 1) return grade === 4 ? 10 * DAY : 6 * DAY;
    const m = grade === 4 ? ease * 1.35 : grade === 3 ? ease : 1.2;
    return Math.max(DAY, interval * m * DAY);
  }

  function previewInterval(r, g) {
    return formatInterval(calculateInterval(r, g));
  }

  function renderTab(tab) {
    const w = currentWord(), i = state.current % Math.max(1, VOCAB.length), s = signalFor(i);
    $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const blocks = {
      memory: `
        <div class="info">
          <div><b>🧠 MEMORY HOOK</b>${esc(w.hook)}</div>
          <div><b>🇫🇷 SENS</b>${esc(w.translation)}</div>
          <div><b>🔊 PRONONCIATION</b>${esc(w.phonetic || '')}</div>
        </div>
      `,
      links: `
        <div class="info">
          <div><b>🔗 SYNONYMES</b>${esc(w.synonyms || '—')}</div>
          <div><b>↔️ ANTONYMES</b>${esc(w.antonyms || '—')}</div>
          <div><b>🧩 COLLOCATIONS</b>${esc(w.collocations || '—')}</div>
        </div>
      `,
      story: `
        <div class="info">
          <div><b>🇮🇹 EXEMPLE</b>${esc(w.example)}</div>
          <div><b>🇫🇷 TRADUCTION</b>${esc(w.exampleFr)}</div>
          <div><b>🎭 MINI-STORY</b>${esc(w.story)}</div>
          <div><b>🇫🇷 TRADUCTION</b>${esc(w.storyFr)}</div>
          <button class="continue" id="markStory">✓ J’AI RACONTÉ L’HISTOIRE</button>
        </div>
      `,
      speak: `
        <div class="panel">
          <b>🗣️ SHADOWING & PRODUCTION</b>
          <p class="hint">Écoute → répète 3 fois → crée une phrase originale avec <strong>${esc(w.word)}</strong>.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">
            <button class="continue" id="shListen" style="margin-bottom:0">🔊 ÉCOUTER</button>
            <button class="neon-mini" id="shSlow">🐢 Lent</button>
            <button class="neon-mini" id="shFast">⚡ Rapide</button>
          </div>
          <button class="continue" id="markProduction" style="margin-top:8px">✓ J’AI PRODUIT MA PHRASE</button>
          <p class="hint">Production enregistrée : ${s.production || 0} fois.</p>
        </div>
      `
    };

    if ($('#content')) $('#content').innerHTML = blocks[tab] || '';

    $('#shListen')?.addEventListener('click', () => speak(w.example || w.word, 0.88));
    $('#shSlow')?.addEventListener('click', () => speak(w.example || w.word, 0.68));
    $('#shFast')?.addEventListener('click', () => speak(w.example || w.word, 1.05));

    $('#markProduction')?.addEventListener('click', () => {
      const x = signalFor(i);
      x.production = (x.production || 0) + 1;
      state.signals[i] = x;
      state.stats.productions++;
      state.xp += 10;
      save();
      renderTab('speak');
      renderHeader();
    });

    $('#markStory')?.addEventListener('click', () => {
      const x = signalFor(i);
      x.story = (x.story || 0) + 1;
      state.signals[i] = x;
      state.stats.stories++;
      state.xp += 8;
      save();
      renderTab('story');
      renderHeader();
    });
  }

  function schedule(i, grade) {
    const r = state.reviews[i] || { interval: 0, reps: 0, ease: 2.5 }, s = signalFor(i);
    let effective = grade;
    const blurt = Number(s.blurt || 0), production = Number(s.production || 0);

    if (grade >= 3 && blurt >= 70 && production >= 1) effective = Math.min(4, grade + 1);
    else if (grade >= 3 && blurt < 30 && production === 0) effective = Math.max(2, grade - 1);

    const oldEase = r.ease || 2.5, nextMs = calculateInterval(r, effective);
    if (effective === 1) r.ease = Math.max(1.3, oldEase - 0.2);
    else if (effective === 2) r.ease = Math.max(1.3, oldEase - 0.08);
    else if (effective === 4) r.ease = Math.min(3.2, oldEase + 0.08);
    else r.ease = oldEase;

    r.reps = effective === 1 ? 0 : (r.reps || 0) + 1;
    r.interval = nextMs / DAY;
    r.lastGrade = grade;
    r.effectiveGrade = effective;
    r.lastReviewed = Date.now();
    r.due = Date.now() + nextMs;
    r.lapses = (r.lapses || 0) + (effective === 1 ? 1 : 0);
    r.blurt = blurt;
    r.production = production;
    r.story = Number(s.story || 0);
    state.reviews[i] = r;

    if (effective >= 3 && r.reps >= 2 && (blurt >= 40 || production >= 1)) state.known[i] = true;
    else if (effective === 1) delete state.known[i];

    state.xp += grade * 5 + (effective > grade ? 5 : 0);
    state.stats.seen++;
    if (grade >= 3) state.stats.correct++;
    save();
    renderHeader();
  }

  function gradeCurrent(grade) {
    const i = state.current % Math.max(1, VOCAB.length);
    schedule(i, grade);
    state.signals[i] = { blurt: 0, production: 0, story: 0 };
    state.current = nextCardIndex();
    save();
    renderLearn();
  }

  // INTERACTIVE MIND MAP ENGINE INTEGRATION
  function renderMap() {
    const select = $('#mapWord');
    if (!VOCAB.length) return;

    if (select && (!select.options.length || select.options.length !== VOCAB.length)) {
      select.innerHTML = '';
      VOCAB.forEach((w, i) => {
        const o = document.createElement('option');
        o.value = i;
        o.textContent = `${w.word} · ${w.translation}`;
        select.appendChild(o);
      });
    }

    if (select) {
      select.value = String(state.current % VOCAB.length);
      select.onchange = (e) => {
        state.current = Number(e.target.value);
        save();
        if (mindmapInstance) {
          mindmapInstance.loadWord(VOCAB[state.current % VOCAB.length]);
        }
      };
    }

    const resetBtn = $('#resetMindmapView');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (mindmapInstance) mindmapInstance.resetView();
      };
    }

    const canvas = $('#mindmapCanvas');
    if (canvas && window.NeonItalianMindMap) {
      if (!mindmapInstance) {
        mindmapInstance = new window.NeonItalianMindMap('mindmapCanvas');
      }
      mindmapInstance.loadWord(VOCAB[state.current % VOCAB.length]);
    }
  }

  // MODE IMMERSION (ITALIAN SCENARIOS)
  function renderImmersionScreen() {
    const scenarios = window.ITALIANO_IMMERSION_SCENARIOS || [];
    const grid = $('#immersionGrid');
    const viewer = $('#scenarioViewer');

    if (grid) {
      grid.innerHTML = scenarios.map(sc => `
        <div class="scenario-card" onclick="selectImmersionScenario('${sc.id}')">
          <span class="scenario-icon">${sc.icon}</span>
          <h3>${sc.title}</h3>
          <p>${sc.desc}</p>
        </div>
      `).join('');
    }

    if (viewer) {
      if (currentImmersionScenario) {
        viewer.classList.remove('hidden');
        $('#immersionTitle').textContent = `${currentImmersionScenario.icon} ${currentImmersionScenario.title}`;
        $('#immersionDesc').textContent = currentImmersionScenario.desc;

        const list = $('#dialogueList');
        if (list) {
          list.innerHTML = currentImmersionScenario.dialogue.map((line, idx) => `
            <div class="dialogue-bubble ${line.role}">
              <div class="dialogue-header">
                <span class="dialogue-speaker">${line.speaker.toUpperCase()}</span>
                <button class="neon-mini" onclick="speakItalian('${line.audio.replace(/'/g, "\\'")}')">🔊 Ascolta</button>
              </div>
              <div class="dialogue-text">${line.text}</div>
              <div id="trans_${idx}" class="dialogue-translation hidden">${line.translation}</div>
              <div class="dialogue-actions">
                <button class="continue" onclick="toggleTranslation('trans_${idx}')" style="padding:6px 10px; font-size:12px; margin-bottom:0; width:auto;">👁️ Traduzione</button>
                <button class="neon-mini" onclick="practiceShadowingLine('${line.audio.replace(/'/g, "\\'")}')">🗣️ Ripeti (+10 XP)</button>
              </div>
            </div>
          `).join('');
        }
      } else {
        viewer.classList.add('hidden');
      }
    }
  }

  function selectImmersionScenario(id) {
    const sc = (window.ITALIANO_IMMERSION_SCENARIOS || []).find(s => s.id === id);
    if (sc) {
      currentImmersionScenario = sc;
      renderImmersionScreen();
      $('#scenarioViewer')?.scrollIntoView({ behavior: 'smooth' });
    }
  }
  window.selectImmersionScenario = selectImmersionScenario;

  function toggleTranslation(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden');
  }
  window.toggleTranslation = toggleTranslation;

  function practiceShadowingLine(audioText) {
    speak(audioText, 0.88);
    state.xp += 10;
    save();
    renderHeader();
  }
  window.practiceShadowingLine = practiceShadowingLine;

  function renderSrs() {
    const due = dueCount(), fresh = newCount();
    if ($('#srsDue')) $('#srsDue').textContent = due;
    const panel = $('#srsDue')?.closest('.panel');
    if (panel) {
      const p = panel.querySelector('p');
      if (p) {
        p.innerHTML = due
          ? `<strong>${due}</strong> carte${due > 1 ? 's' : ''} à revoir maintenant. ${fresh} nouveau${fresh > 1 ? 'x' : ''} mot${fresh > 1 ? 's' : ''} reste${fresh > 1 ? 'nt' : ''} disponible${fresh > 1 ? 's' : ''}.<br><small>Le SRS combine rappel, production et storytelling.</small>`
          : `${fresh} nouveau${fresh > 1 ? 'x' : ''} mot${fresh > 1 ? 's' : ''} disponible${fresh > 1 ? 's' : ''}. Les cartes solides s'espacent automatiquement.`;
      }
    }
  }

  function renderBlurt() {
    const w = currentWord();
    if ($('#blurtWord')) $('#blurtWord').textContent = w.word;
    if ($('#blurtInput')) $('#blurtInput').value = '';
    if ($('#blurtResult')) $('#blurtResult').innerHTML = '';
  }

  function normalize(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9à-ÿ' ]/gi, ' ').replace(/\s+/g, ' ').trim();
  }

  function tokenSet(s) {
    return new Set(normalize(s).split(/\s+/).filter(t => t.length > 2));
  }

  function fieldRecall(input, target) {
    const targetTokens = tokenSet(target);
    if (!targetTokens.size) return 0;
    const inputTokens = tokenSet(input);
    let hit = 0;
    targetTokens.forEach(t => { if (inputTokens.has(t)) hit++; });
    return Math.min(1, hit / targetTokens.size);
  }

  function blurtCheck() {
    const i = state.current % Math.max(1, VOCAB.length), w = currentWord(), text = $('#blurtInput').value.trim(), s = signalFor(i);
    const meaning = fieldRecall(text, w.translation), synonyms = fieldRecall(text, w.synonyms), collocations = fieldRecall(text, w.collocations), example = fieldRecall(text, w.example), target = fieldRecall(text, w.word);
    const phraseBonus = /\b(sono|sei|è|era|ero|abbiamo|hanno|ho|hai|devo|posso|voglio|mi|ti|si|ci|non|che|per|con|a|di)\b/i.test(text) ? 1 : 0;
    const breakdown = {
      meaning: Math.round(meaning * 100),
      synonyms: Math.round(synonyms * 100),
      collocations: Math.round(collocations * 100),
      example: Math.round(example * 100),
      target: Math.round(target * 100),
      production: phraseBonus ? 100 : 0
    };
    const score = Math.round(meaning * 25 + synonyms * 15 + collocations * 20 + example * 15 + target * 10 + phraseBonus * 15);
    s.blurt = Math.max(s.blurt || 0, score);
    s.blurtBreakdown = breakdown;
    state.signals[i] = s;
    state.stats.blurts++;
    state.xp += Math.max(5, Math.round(score / 5));
    save();

    const label = score >= 80 ? '🔥 Rappel exceptionnel' : score >= 60 ? '🟢 Très bon rappel' : score >= 40 ? '🟡 Bon début' : '🔵 À renforcer';
    if ($('#blurtResult')) {
      $('#blurtResult').innerHTML = `
        <div class="panel">
          <h2>${score}%</h2>
          <p><strong>${label}</strong></p>
          <div class="info">
            <div><b>🇫🇷 SENS · 25%</b>${breakdown.meaning}%</div>
            <div><b>🔗 SYNONYMES · 15%</b>${breakdown.synonyms}%</div>
            <div><b>🧩 COLLOCATIONS · 20%</b>${breakdown.collocations}%</div>
            <div><b>💬 EXEMPLE · 15%</b>${breakdown.example}%</div>
            <div><b>🎯 MOT CIBLE · 10%</b>${breakdown.target}%</div>
            <div><b>🗣️ PRODUCTION · 15%</b>${breakdown.production}%</div>
          </div>
          <p><strong>Attendu :</strong> ${esc(w.translation)}</p>
          <p><strong>Collocations :</strong> ${esc(w.collocations)}</p>
          <p><strong>Signal SRS :</strong> ${score >= 70 ? 'fort — une bonne note SRS peut maintenant espacer davantage la carte.' : 'à renforcer — le SRS évitera de l’espacer trop vite.'}</p>
        </div>
      `;
    }
    renderHeader();
  }

  function newHunt() {
    if (VOCAB.length < 4) return;
    const answer = currentWord();
    const pool = VOCAB.filter((_, i) => i !== (state.current % VOCAB.length)).sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [answer, ...pool].sort(() => Math.random() - 0.5);

    if ($('#huntQuestion')) $('#huntQuestion').textContent = `🇫🇷 ${answer.translation}`;
    if ($('#huntChoices')) {
      $('#huntChoices').innerHTML = choices.map(w => `<button data-answer="${esc(w.word)}">${esc(w.word)}</button>`).join('');
      $$('#huntChoices button').forEach(b => b.addEventListener('click', () => {
        const ok = b.dataset.answer === answer.word;
        state.stats.hunts++;
        state.xp += ok ? 15 : 3;
        if (ok) state.stats.correct++;
        save();
        if ($('#huntFeedback')) {
          $('#huntFeedback').innerHTML = ok ? '<p style="color:var(--neon);font-weight:bold;">🟢 Corretto ! +15 XP</p>' : `<p style="color:var(--coral);font-weight:bold;">🔴 La risposta era <strong>${esc(answer.word)}</strong>.</p>`;
        }
        renderHeader();
      }));
    }
    if ($('#huntFeedback')) $('#huntFeedback').innerHTML = '';
  }

  function renderStory() {
    const w = currentWord();
    if ($('#storyText')) {
      $('#storyText').innerHTML = `
        <div class="info">
          <div><b>🇮🇹 ITALIANO</b>${esc(w.story)}</div>
          <div><b>🇫🇷 FRANÇAIS</b>${esc(w.storyFr)}</div>
          <div><b>🎯 MOT CIBLE</b>${esc(w.word)} — ${esc(w.translation)}</div>
        </div>
      `;
    }
  }

  function speak(text, rate = 0.88) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'it-IT';
    u.rate = rate;
    speechSynthesis.speak(u);
  }
  window.speakItalian = speak;

  function renderStats() {
    if (window.ItalianAnalytics) {
      const stats = window.ItalianAnalytics.computeStats(VOCAB, state);
      window.ItalianAnalytics.renderDashboard('analyticsContent', stats, (weakWords) => {
        if (weakWords.length > 0) {
          const firstWeakIdx = VOCAB.findIndex(w => w.word === weakWords[0].word);
          if (firstWeakIdx !== -1) state.current = firstWeakIdx;
          show('learn');
        }
      });
    }
  }

  // ➕ NUOVA PAROLA MODAL
  function initAddWordModal() {
    const modal = $('#addWordModal');
    $('#openAddWordBtn')?.addEventListener('click', () => modal.classList.remove('hidden'));
    $('#closeAddWordBtn')?.addEventListener('click', () => modal.classList.add('hidden'));

    $('#saveNewWordBtn')?.addEventListener('click', () => {
      const word = ($('#newWord')?.value || '').trim().toUpperCase();
      const translation = ($('#newTranslation')?.value || '').trim();
      const phonetic = ($('#newPhonetic')?.value || '').trim();
      const hook = ($('#newHook')?.value || '').trim() || 'Associa a un’immagine forte.';
      const synonyms = ($('#newSynonyms')?.value || '').trim();
      const antonyms = ($('#newAntonyms')?.value || '').trim();
      const collocations = ($('#newCollocations')?.value || '').trim();
      const example = ($('#newExample')?.value || '').trim() || `Uso ${word} in contesto.`;
      const exampleFr = ($('#newExampleFr')?.value || '').trim() || '';
      const story = ($('#newStory')?.value || '').trim() || example;

      if (!word || !translation) {
        alert('Inserisci almeno la parola e la sua traduzione.');
        return;
      }

      const newObj = {
        word,
        translation,
        phonetic: phonetic || `[${word.toLowerCase()}]`,
        level: 'B1',
        hook,
        synonyms,
        antonyms,
        collocations,
        example,
        exampleFr: exampleFr || translation,
        story,
        storyFr: exampleFr || translation
      };

      // Save in custom storage
      try {
        const stored = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
        stored.unshift(newObj);
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(stored));
      } catch (_) {}

      VOCAB.unshift(newObj);
      state.current = 0;
      state.xp += 50;
      save();

      modal.classList.add('hidden');
      ['#newWord', '#newTranslation', '#newPhonetic', '#newHook', '#newSynonyms', '#newAntonyms', '#newCollocations', '#newExample', '#newExampleFr', '#newStory'].forEach(sel => {
        const el = $(sel);
        if (el) el.value = '';
      });

      alert(`🔥 La parola "${word}" è stata aggiunta al tuo Universo Italiano! (+50 XP)`);
      show('learn');
    });
  }

  // Modal Importer & Reset
  function initModals() {
    const modal = $('#importerModal'), input = $('#importInput'), feedback = $('#importFeedback');
    $('#openImportBtn')?.addEventListener('click', () => modal?.classList.remove('hidden'));
    $('#closeImportBtn')?.addEventListener('click', () => modal?.classList.add('hidden'));

    $('#doExportBtn')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(VOCAB, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'neon-italiano-vocabulaire.json';
      a.click();
      URL.revokeObjectURL(a.href);
      if (feedback) {
        feedback.textContent = `📤 Export creato : ${VOCAB.length} schede.`;
      }
    });

    $('#doImportBtn')?.addEventListener('click', () => {
      try {
        const raw = input.value.trim();
        if (!raw) throw Error('Incolla testo o JSON.');
        let arr;
        if (raw.startsWith('[') || raw.startsWith('{')) {
          arr = JSON.parse(raw);
          if (!Array.isArray(arr)) arr = [arr];
        } else {
          arr = raw.split(/\n+/).filter(Boolean).map(line => {
            const p = line.split('|').map(x => x.trim());
            return {
              word: p[0],
              translation: p[1] || '',
              hook: p[2] || 'Associa a un’immagine forte.',
              synonyms: p[3] || '',
              antonyms: '',
              collocations: p[4] || '',
              example: p[5] || '',
              exampleFr: '',
              story: p[5] || '',
              storyFr: '',
              phonetic: '',
              level: 'B1'
            };
          });
        }

        const clean = arr.filter(x => x.word && x.translation);
        if (!clean.length) throw Error('Formato vuoto o non valido.');

        const old = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '[]');
        const map = new Map([...old, ...clean].map(x => [String(x.word).toUpperCase(), x]));
        localStorage.setItem(CUSTOM_KEY, JSON.stringify([...map.values()]));

        if (feedback) feedback.textContent = `⚡ ${clean.length} scheda(e) importata(e). Ricaricamento...`;
        setTimeout(() => location.reload(), 1200);
      } catch (err) {
        if (feedback) feedback.textContent = `❌ ${err.message}`;
      }
    });

    $('#resetBtn')?.addEventListener('click', () => {
      if (confirm('Reimpostare tutti i progressi SRS, XP, Blurting e statistiche? Il vocabolario personalizzato sarà conservato.')) {
        localStorage.removeItem(KEY);
        location.reload();
      }
    });
  }

  function bind() {
    updateStreak();
    initAddWordModal();
    initModals();

    $$('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
    $$('[data-tab]').forEach(b => b.addEventListener('click', () => renderTab(b.dataset.tab)));
    $$('[data-grade]').forEach(b => b.addEventListener('click', () => gradeCurrent(Number(b.dataset.grade))));

    $$('.mood').forEach(b => b.addEventListener('click', () => {
      $$('.mood').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.mood = b.dataset.mood;
      if ($('#moodLabel')) $('#moodLabel').textContent = b.textContent.replace(/^\S+\s/, '');
      save();
    }));

    $('#next')?.addEventListener('click', () => {
      state.current = nextCardIndex();
      save();
      renderLearn();
    });

    $('#blurtCheck')?.addEventListener('click', blurtCheck);
    $('#storySpeak')?.addEventListener('click', () => speak(currentWord().story));

    renderHeader();
    renderLearn();
  }

  // Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=2.0.0').then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA Italiano] Nuova versione disponibile, ricaricamento...');
                window.location.reload();
              }
            });
          }
        });
      }).catch(err => console.error('[PWA Italiano] SW Registration failed:', err));
    });
  }

  document.addEventListener('DOMContentLoaded', bind);
})();
