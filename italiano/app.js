(() => {
  'use strict';
  const VOCAB = Array.isArray(window.ITALIANO_VOCAB) ? window.ITALIANO_VOCAB : [];
  const KEY = 'neonItaliano_v1';
  const defaultState = { xp: 0, streak: 1, lastDay: '', mood: 'pronto', current: 0, reviews: {}, known: {}, stats: { seen: 0, correct: 0, blurts: 0, hunts: 0 } };
  let state;
  try { state = { ...defaultState, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (_) { state = { ...defaultState }; }
  state.reviews ||= {}; state.known ||= {}; state.stats ||= { ...defaultState.stats };

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const today = () => new Date().toISOString().slice(0, 10);

  function updateStreak() {
    const t = today();
    if (!state.lastDay) state.lastDay = t;
    else if (state.lastDay !== t) {
      const a = new Date(state.lastDay), b = new Date(t);
      const diff = Math.round((b - a) / 86400000);
      state.streak = diff === 1 ? (state.streak || 1) + 1 : 1;
      state.lastDay = t;
    }
  }

  function dueCount() {
    const now = Date.now();
    return VOCAB.reduce((n, w, i) => n + ((state.reviews[i]?.due || 0) <= now ? 1 : 0), 0);
  }

  function show(screen) {
    $$('.screen').forEach(x => x.classList.toggle('active', x.id === screen));
    $$('nav button').forEach(b => b.classList.toggle('active', b.dataset.go === screen));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (screen === 'learn') renderLearn();
    if (screen === 'map') renderMap();
    if (screen === 'srs') renderSrs();
    if (screen === 'blurt') renderBlurt();
    if (screen === 'hunt') newHunt();
    if (screen === 'story') renderStory();
    if (screen === 'statsScreen') renderStats();
    renderHeader();
  }

  function renderHeader() {
    $('#due').textContent = dueCount();
    $('#xp').textContent = state.xp || 0;
    $('#known').textContent = Object.values(state.known).filter(Boolean).length;
    $('#streak').textContent = state.streak || 1;
    $('#srsDue').textContent = dueCount();
  }

  function currentWord() { return VOCAB[state.current % VOCAB.length] || {}; }

  function renderLearn() {
    const w = currentWord();
    $('#word').textContent = w.word || '';
    $('#card').innerHTML = `<h1>${w.word}</h1><div class="translation">${w.translation}</div><div class="phonetic">${w.phonetic} · ${w.level}</div>`;
    renderTab('memory');
  }

  function renderTab(tab) {
    const w = currentWord();
    $$('.tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    const blocks = {
      memory: `<div class="info"><div><b>🧠 MEMORY HOOK</b>${w.hook}</div><div><b>🇫🇷 SENS</b>${w.translation}</div><div><b>🔊 PRONONCIATION</b>${w.phonetic}</div></div>`,
      links: `<div class="info"><div><b>🔗 SYNONYMES</b>${w.synonyms || '—'}</div><div><b>↔️ ANTONYMES</b>${w.antonyms || '—'}</div><div><b>🧩 COLLOCATIONS</b>${w.collocations}</div></div>`,
      story: `<div class="info"><div><b>🇮🇹 EXEMPLE</b>${w.example}</div><div><b>🇫🇷 TRADUCTION</b>${w.exampleFr}</div><div><b>🎭 MINI-STORY</b>${w.story}</div><div><b>🇫🇷 TRADUCTION</b>${w.storyFr}</div></div>`,
      speak: `<div class="panel"><b>🗣️ PRODUCTION</b><p>Écoute, répète, puis crée ta propre phrase avec <strong>${w.word}</strong>.</p><button class="continue" id="speakWord">🔊 ÉCOUTER EN ITALIEN</button><p class="hint">Astuce : répète 3 fois, puis parle sans regarder.</p></div>`
    };
    $('#content').innerHTML = blocks[tab];
    $('#speakWord')?.addEventListener('click', () => speak(w.example));
  }

  function schedule(i, grade) {
    const r = state.reviews[i] || { interval: 0, reps: 0 };
    const days = { 1: 0, 2: 1, 3: Math.max(2, Math.round((r.interval || 1) * 2)), 4: Math.max(4, Math.round((r.interval || 2) * 3)) };
    r.interval = days[grade];
    r.reps = (r.reps || 0) + 1;
    r.due = Date.now() + r.interval * 86400000;
    state.reviews[i] = r;
    if (grade >= 3) state.known[i] = true;
    else delete state.known[i];
    state.xp += grade * 5;
    state.stats.seen++;
    if (grade >= 3) state.stats.correct++;
    save();
    renderHeader();
  }

  function gradeCurrent(grade) {
    schedule(state.current % VOCAB.length, grade);
    state.current = (state.current + 1) % VOCAB.length;
    save();
    renderLearn();
  }

  function renderMap() {
    const select = $('#mapWord');
    if (!select.options.length) VOCAB.forEach((w, i) => { const o = document.createElement('option'); o.value = i; o.textContent = `${w.word} · ${w.translation}`; select.appendChild(o); });
    select.value = String(state.current % VOCAB.length);
    drawMap(Number(select.value));
  }

  function drawMap(i) {
    const w = VOCAB[i];
    const nodes = [
      [w.word, 50, 50, 'center'],
      ['🧠 Mémoire', 23, 25, 'gold'],
      ['🔗 ' + (w.synonyms || 'synonymes').split(' · ')[0], 78, 25, ''],
      ['↔️ ' + (w.antonyms || 'contraire').split(' · ')[0], 78, 72, ''],
      ['🧩 ' + (w.collocations || '').split(' · ')[0], 22, 74, ''],
      ['🎭 Story', 50, 84, 'gold']
    ];
    const lines = nodes.slice(1).map(n => `<div style="position:absolute;left:50%;top:50%;width:${Math.hypot(n[1]-50,n[2]-50)}%;height:2px;background:#1e5547;transform-origin:left center;transform:rotate(${Math.atan2(n[2]-50,n[1]-50)*180/Math.PI}deg)"></div>`).join('');
    const html = lines + nodes.map((n, k) => `<button class="node ${n[3]}" style="left:${n[1]}%;top:${n[2]}%" data-node="${k}">${n[0]}</button>`).join('');
    $('#mapbox').innerHTML = html;
    $$('#mapbox .node').forEach(btn => btn.addEventListener('click', () => { state.current = i; show('learn'); }));
  }

  function renderSrs() {
    $('#srsDue').textContent = dueCount();
  }

  function renderBlurt() {
    const w = currentWord();
    $('#blurtWord').textContent = w.word;
    $('#blurtInput').value = '';
    $('#blurtResult').innerHTML = '';
  }

  function normalize(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9à-ÿ' ]/gi, ' ').replace(/\s+/g, ' ').trim(); }
  function blurtCheck() {
    const w = currentWord();
    const text = normalize($('#blurtInput').value);
    const targets = [w.word, w.translation, w.synonyms, w.collocations].flatMap(x => normalize(x).split(' · '));
    const hits = targets.filter(x => x && text.includes(x)).length;
    const score = Math.min(100, Math.round((hits / Math.max(3, Math.min(6, targets.length))) * 100));
    state.stats.blurts++; state.xp += Math.max(5, Math.round(score / 5)); save();
    $('#blurtResult').innerHTML = `<div class="panel"><h2>${score}%</h2><p>${score >= 70 ? '🔥 Excellent rappel actif.' : score >= 40 ? '🟡 Bon début : ajoute une collocation ou une phrase.' : '🔵 À revoir : relis la fiche puis retente.'}</p><p><strong>Attendu :</strong> ${w.translation}</p><p><strong>Collocations :</strong> ${w.collocations}</p></div>`;
    renderHeader();
  }

  function newHunt() {
    if (VOCAB.length < 4) return;
    const answer = currentWord();
    const pool = VOCAB.filter((_, i) => i !== (state.current % VOCAB.length)).sort(() => Math.random() - .5).slice(0, 3);
    const choices = [answer, ...pool].sort(() => Math.random() - .5);
    $('#huntQuestion').textContent = `🇫🇷 ${answer.translation}`;
    $('#huntChoices').innerHTML = choices.map((w, i) => `<button data-answer="${w.word}">${w.word}</button>`).join('');
    $('#huntFeedback').innerHTML = '';
    $$('#huntChoices button').forEach(b => b.addEventListener('click', () => {
      const ok = b.dataset.answer === answer.word;
      state.stats.hunts++; state.xp += ok ? 15 : 3; if (ok) state.stats.correct++; save();
      $('#huntFeedback').innerHTML = ok ? '<p>🟢 Correct !</p>' : `<p>🔴 La réponse était <strong>${answer.word}</strong>.</p>`;
      renderHeader();
    }));
  }

  function renderStory() {
    const w = currentWord();
    $('#storyText').innerHTML = `<div class="info"><div><b>🇮🇹 ITALIANO</b>${w.story}</div><div><b>🇫🇷 FRANÇAIS</b>${w.storyFr}</div><div><b>🎯 MOT CIBLE</b>${w.word} — ${w.translation}</div></div>`;
  }

  function renderStats() {
    const total = VOCAB.length, known = Object.values(state.known).filter(Boolean).length;
    const pct = total ? Math.round(known / total * 100) : 0;
    $('#statsTitle').textContent = `${known} / ${total} mots actifs maîtrisés`;
    $('#bar').style.width = pct + '%';
    $('#statsText').textContent = `${pct}% du parcours initial. ${state.stats.seen} évaluations SRS, ${state.stats.blurts} blurtings et ${state.stats.hunts} défis Hunt.`;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) { alert('La synthèse vocale n’est pas disponible sur ce navigateur.'); return; }
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = 'it-IT'; u.rate = .88; speechSynthesis.speak(u);
  }

  function init() {
    updateStreak(); save();
    $$('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
    $$('.mood').forEach(b => b.addEventListener('click', () => { state.mood = b.dataset.mood; $$('.mood').forEach(x => x.classList.remove('active')); b.classList.add('active'); $('#moodLabel').textContent = b.textContent.replace(/^\S+\s/, ''); save(); }));
    $$('.tabs button').forEach(b => b.addEventListener('click', () => renderTab(b.dataset.tab)));
    $('#next').addEventListener('click', () => { state.current = (state.current + 1) % VOCAB.length; save(); renderLearn(); });
    $$('[data-grade]').forEach(b => b.addEventListener('click', () => gradeCurrent(Number(b.dataset.grade))));
    $('#mapWord').addEventListener('change', e => { state.current = Number(e.target.value); save(); drawMap(state.current); });
    $('#blurtCheck').addEventListener('click', blurtCheck);
    $('#storySpeak').addEventListener('click', () => speak(currentWord().story));
    renderHeader(); renderLearn();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', init);
})();
