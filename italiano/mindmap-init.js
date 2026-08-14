(() => {
  let mapInstance = null;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const vocab = () => Array.isArray(window.ITALIANO_VOCAB) ? window.ITALIANO_VOCAB : [];
  const stateIndex = () => { try { return Number(JSON.parse(localStorage.getItem('neonItaliano_v1') || '{}').current || 0); } catch (_) { return 0; } };
  const mount = () => {
    const box = $('#mapbox');
    if (!box || !window.NeonItalianMindMap) return;
    if (!mapInstance) mapInstance = new window.NeonItalianMindMap(box);
    const v = vocab();
    if (!v.length) return;
    const select = $('#mapWord');
    if (select && select.options.length !== v.length) {
      select.innerHTML = '';
      v.forEach((w, i) => { const o = document.createElement('option'); o.value = i; o.textContent = `${w.word} · ${w.translation}`; select.appendChild(o); });
    }
    const i = Math.max(0, Math.min(v.length - 1, select ? Number(select.value || stateIndex()) : stateIndex()));
    if (select) select.value = String(i);
    mapInstance.loadWord(v[i]);
  };
  const bind = () => {
    document.addEventListener('click', e => {
      if (e.target.closest('[data-go="map"]')) setTimeout(mount, 40);
    });
    $('#mapWord')?.addEventListener('change', e => {
      const v = vocab(), i = Number(e.target.value);
      if (v[i] && mapInstance) mapInstance.loadWord(v[i]);
    });
    window.speakCurrent = text => {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text || ''); u.lang = 'it-IT'; u.rate = .88; speechSynthesis.speak(u);
    };
    if ($('#map')?.classList.contains('active')) setTimeout(mount, 50);
  };
  document.addEventListener('DOMContentLoaded', bind);
})();
