// Pengelola suara: dialog, efek suara, musik latar.
const BASE = 'assets/audio/';
const FAST = new URLSearchParams(location.search).has('fast');
let manifest = {};
const cache = new Map();
let music = null, musicName = null, muted = false;
let current = null;
let actx = null, analyser = null, abuf = null;
const srcMap = new WeakMap();
function hookAnalyser(a) {
  try {
    if (!actx) { actx = new (window.AudioContext || window.webkitAudioContext)(); analyser = actx.createAnalyser(); analyser.fftSize = 1024; abuf = new Uint8Array(analyser.fftSize); analyser.connect(actx.destination); }
    if (actx.state === 'suspended') actx.resume();
    if (!srcMap.has(a)) { const s = actx.createMediaElementSource(a); s.connect(analyser); srcMap.set(a, s); }
  } catch (e) { /* tanpa analyser: mulut memakai gerak acak */ }
}
export const audio = {
  async init() {
    try { manifest = await (await fetch(BASE + 'voice/manifest.json')).json(); } catch { manifest = {}; }
  },
  duration(id) { return manifest[id] || 2.5; },
  preload(list) {
    for (const src of list) if (!cache.has(src)) { const a = new Audio(src); a.preload = 'auto'; cache.set(src, a); }
  },
  preloadAll(voiceIds, sfx, mus) {
    this.preload(voiceIds.map(id => BASE + 'voice/' + id + '.mp3'));
    this.preload(sfx.map(n => BASE + 'sfx/' + n + '.mp3'));
    this.preload(mus.map(n => BASE + 'music/' + n + '.mp3'));
  },
  get(src) {
    let a = cache.get(src);
    if (!a) { a = new Audio(src); cache.set(src, a); }
    return a;
  },
  // Memutar baris dialog; resolve saat selesai (atau saat di-skip)
  voice(id, onSkipReg) {
    if (FAST) return new Promise(r => setTimeout(r, 120));
    return new Promise(res => {
      const a = this.get(BASE + 'voice/' + id + '.mp3');
      hookAnalyser(a);
      a.currentTime = 0; a.volume = muted ? 0 : 1;
      let done = false;
      const fin = () => { if (done) return; done = true; a.onended = null; clearTimeout(guard); current = null; res(); };
      let guard; const arm = (ms) => { clearTimeout(guard); guard = setTimeout(() => { if (current && current.paused) arm(1000); else fin(); }, ms); }; arm((this.duration(id) + 2.5) * 1000);
      a.onended = fin;
      current = { a, fin };
      if (onSkipReg) onSkipReg(() => { a.pause(); fin(); });
      a.play().catch(() => setTimeout(fin, this.duration(id) * 1000));
    });
  },
  // keras suara dialog yang sedang diputar (0..1), atau -1 bila tidak bisa diukur
  level() {
    if (!current || current.paused) return 0;
    if (!analyser || !srcMap.has(current.a) || actx.state !== 'running') return -1;
    analyser.getByteTimeDomainData(abuf);
    let s = 0; for (let i = 0; i < abuf.length; i++) { const v = (abuf[i] - 128) / 128; s += v * v; }
    return Math.min(1, Math.sqrt(s / abuf.length) * 5);
  },
  pauseVoice(on) { if (current) { if (on) current.a.pause(); else current.a.play().catch(() => {}); current.paused = on; } },
  stopVoice() { if (current) { current.a.pause(); current.fin(); } },
  sfx(name, vol = 0.8) {
    const src = BASE + 'sfx/' + name + '.mp3';
    const base = this.get(src);
    const a = base.cloneNode(); a.volume = muted ? 0 : vol;
    a.play().catch(() => {});
    return a;
  },
  music(name, vol = 0.28) {
    if (musicName === name) return;
    const old = music;
    if (old) fade(old, old.volume, 0, 700, () => old.pause());
    musicName = name;
    if (!name) { music = null; return; }
    const a = new Audio(BASE + 'music/' + name + '.mp3');
    a.loop = !['win', 'sad'].includes(name); a.volume = 0;
    a.play().catch(() => {});
    fade(a, 0, muted ? 0 : vol, 900);
    music = a;
  },
  duck(on) { if (music && !muted) fade(music, music.volume, on ? 0.12 : 0.28, 300); },
  toggleMute() { muted = !muted; if (music) music.volume = muted ? 0 : 0.28; return muted; },
};
function fade(a, from, to, ms, done) {
  const t0 = performance.now();
  const step = () => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    a.volume = Math.max(0, Math.min(1, from + (to - from) * k));
    if (k < 1) requestAnimationFrame(step); else done && done();
  };
  step();
}
