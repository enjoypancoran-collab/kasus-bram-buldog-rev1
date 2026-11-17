// Alur utama game "Kasus Bram Buldog".
import { E, THREE, confetti, easeOut, easeInOut, linear, easeIn } from './engine.js';
import { ui } from './ui.js';
import { audio } from './audio.js';
import { FLOOR_SETS, SPOT } from './sets.js';
import { aptpi, exterior, courtroom } from './court.js';
import * as S from './script.js';
import { loadModels } from './glbchar.js';

const SFX = ['revolving', 'lift_stop', 'stairs', 'trip', 'scan', 'avalanche', 'wind', 'bell', 'door_slam', 'gavel', 'machine', 'thunder', 'cheer', 'confetti', 'aww', 'bag', 'spin', 'ding', 'applause', 'coin', 'clapper', 'robot', 'glitch', 'whoosh', 'holo', 'crunch', 'steps', 'trophy', 'pop', 'chalk'];
const MUSIC = ['jazz', 'office', 'urgent', 'court', 'win', 'sad', 'title'];
const state = { round: 1, picks: [], last: null };

// ---------- pemutar beat dialog ----------
let skipLine = null, skipScene = false;
ui.onAdvance(() => { if (skipLine) skipLine(); });
ui.onSkipScene(() => { skipScene = true; if (skipLine) skipLine(); });

function headPos(c) { const v = new THREE.Vector3(); c.head.getWorldPosition(v); return v; }
async function play(beats, ctx = {}) {
  for (const b of beats) {
    const who = ctx.cast?.[b.s] || E.chars[b.s];
    const present = who && who.root.parent;
    let camDone = false;
    for (const a of b.do || []) { const r = ctx.actions?.[a]?.(b); if (r === 'cam') camDone = true; }
    if (skipScene) continue;
    if (b.cam && ctx.cams?.[b.cam]) { ctx.cams[b.cam](); camDone = true; }
    if (!camDone) {
      if (ctx.camFor) camDone = ctx.camFor(b, who) === true;
      if (!camDone && present) E.focus(who, who.id === 'bram' ? { dist: 1.8, side: 0.35 } : { dist: 1.6, side: 1.25, outward: true, ...(ctx.focusOpt?.(b.s) || {}) });
    }
    if (present) { const hp = headPos(who); for (const c of Object.values(E.chars)) if (c !== who && c.root.parent) c.lookAtPoint(hp); who.targetYaw = 0; }
    if (who) who.setTalk(true);
    if (who && b.gest) who.gesture(b.gest, b.gestDur || 2.8);
    ui.say(b.s, S.CAST[b.s].name, b.t);
    audio.duck(true);
    await audio.voice(b.id, (fn) => { skipLine = fn; });
    skipLine = null;
    if (who) who.setTalk(false);
    audio.duck(false);
    for (const a of b.after || []) if (!skipScene) await ctx.actions?.[a]?.(b);
    if (!skipScene) await E.wait(0.18);
    while (ui.paused) await E.wait(0.2);
  }
  ui.hideDialog();
}
const say1 = (b, ctx) => play([b], ctx);

// ---------- persiapan ----------
async function boot() {
  E.init(document.getElementById('stage'));
  ui.init();
  await audio.init();
  audio.preloadAll(S.allLines().map(l => l.id), SFX, MUSIC);
  ui.progress(0.05);
  await loadModels(k => ui.progress(0.05 + k * 0.8));
  for (const id of Object.keys(S.CAST)) if (id !== 'tutor') E.char(id);
  ui.progress(0.9);
  await document.fonts?.ready;
  ui.progress(1);
  setTimeout(() => ui.doneLoading(), 300);
  titleLoop();
}

async function titleLoop() {
  while (true) {
    // latar ruang sidang berputar pelan
    const ct = courtroom(); E.setSet({ group: ct.g, bg: ct.bg, tick: ct.tick });
    const hk = E.char('hakim'); placeHakim(ct, hk);
    E.follow = (dt) => { const t = E.time * 0.06; E.camera.position.set(Math.sin(t) * 12, 6 + Math.sin(t * 0.7) * 1.5, 6 + Math.cos(t) * 6); E.look.set(0, 6.5, -6); };
    const startMusic = () => { audio.music('title', 0.25); window.removeEventListener('pointerdown', startMusic); window.removeEventListener('keydown', startMusic); };
    window.addEventListener('pointerdown', startMusic); window.addEventListener('keydown', startMusic);
    const names = await ui.titleScreen();
    ui.allNames = names; ui.pool = [...names];
    state.round = 1; state.last = null;
    ui.hud(true);
    while (true) {
      ui.setRound(state.round);
      const res = await playRound();
      if (res === 'home') break;
      state.round++;
    }
    ui.hud(false);
  }
}

async function playRound() {
  state.picks = []; ui.bag([]); skipScene = false;
  const JUMP = new URLSearchParams(location.search).get('jump');
  if (JUMP === 'court') {
    const pk = (new URLSearchParams(location.search).get('pick') || 'k,a,k,a,a,k,a').split(',');
    state.picks = S.FLOORS.map((f, i) => { const t = pk[i] === 'a' ? 'arsitek' : 'karya'; const c = t === 'arsitek' ? f.arsitek : f.karya; return { floor: f.n, type: t, title: c.title, by: S.CAST[t === 'arsitek' ? f.arsitekBy : f.karyaBy].name, picker: 'Peserta ' + (i + 1), court: c.court }; });
    ui.pool.splice(0, 5);
  } else {
    const from = JUMP && JUMP[0] === 'f' ? +JUMP.slice(1) : 1;
    if (from === 1) { if (state.round === 1) await prolog(); else await round2Intro(); }
    for (const f of S.FLOORS) { if (f.n < from) continue; skipScene = false; state.picks.push(await playFloor(f)); ui.bag(state.picks); }
  }
  skipScene = false;
  await toCourt();
  const verdict = await trial();
  ui.setFloor('');
  const v = S.VERDICTS[verdict];
  const arsitek = state.picks.filter(p => p.type === 'arsitek').length;
  const r = await ui.recap({ round: state.round, picks: state.picks, verdict, label: v.label, hint: v.hint, arsitek });
  state.last = verdict;
  ui.hideStamp();
  return r;
}

// ---------- prolog ----------
async function prolog() {
  ui.setFloor('Prolog');
  const set = aptpi(); E.setSet({ group: set.g, bg: set.bg });
  const wendi = E.add(E.char('wendi'), 1.4, -0.3, 0), bram = E.add(E.char('bram'), -5.0, 1.4, Math.PI / 2);
  wendi.hold('chips');
  audio.music('jazz', 0.22);
  E.cut([0.6, 1.8, 4.2], [0.4, 1.3, -1]);
  // Wendi mondar-mandir sambil mengunyah keripik
  const pace = (async () => { for (let i = 0; i < 2; i++) { await wendi.walkTo(-0.6, -0.2, 1.1); audio.sfx('crunch', 0.6); await wendi.walkTo(1.6, -0.3, 1.1); } })();
  await E.wait(2.2);
  audio.sfx('steps', 0.7);
  await E.tween(0.6, e => set.door.rotation.y = -e * 1.4);
  E.camTo([-0.5, 1.7, 4.0], [-2.5, 1.3, 1.2], 1.2);
  await bram.walkTo(-1.3, 1.0, 1.4);
  await pace;
  wendi.faceTo(-1.3, 1.0); bram.faceTo(1.0, 0.2); wendi.hold('tablet');
  audio.sfx('bag', 0.9);
  const ctx = {
    actions: {
      handMap: () => { wendi.gesture('give', 1.6); E.tween(0.8, e => { set.map.position.set(0.4 - e * 1.2, 0.82 + Math.sin(e * Math.PI) * 0.6, -1.0 + e * 1.4); }); setTimeout(() => { set.map.visible = false; }, 900); },
      thunder: async () => { wendi.gesture('facepalm', 1.4); set.thunder(); await E.wait(3.4); },
      liftBag: () => { bram.gesture('lift', 1.8); },
    },
    cams: { bramCloseFront: () => { const p = bram.root.position; E.camTo([p.x + 0.2, 1.75, p.z + 1.3], [p.x, 1.6, p.z], 0.8); } },
  };
  await play(S.PROLOG.slice(0, 13), ctx);
  await play([S.PROLOG[13]], ctx);
  // keluar gedung, berlari ke Menara Pembelajaran
  const ex = exterior(); E.setSet({ group: ex.g, bg: ex.bg, fog: ex.fog, tick: ex.tick });
  E.add(bram, -22, 2.6, Math.PI / 2);
  E.cut([-14, 1.6, 9], [-20, 1.2, 2.6]);
  audio.sfx('whoosh', 0.7);
  E.follow = () => { E.camera.position.set(bram.root.position.x + 4, 1.8, 9); E.look.set(bram.root.position.x + 1, 1.3, 2); };
  await bram.walkTo(-6, 2.2, 2.6, true);
  E.follow = null;
  bram.faceTo(-6, -6);
  E.camTo([-3, 1.4, 8], [-6, 14, -6], 2.5);
  await say1(S.PROLOG[14], { camFor: () => true });
}

async function round2Intro() {
  ui.setFloor('Sidang banding');
  const set = aptpi(); E.setSet({ group: set.g, bg: set.bg });
  const bram = E.add(E.char('bram'), 0.2, 0.6, Math.PI), wendi = E.add(E.char('wendi'), -5.0, 1.4, Math.PI / 2);
  audio.music('jazz', 0.22);
  E.cut([0.4, 1.8, 4.2], [-1, 1.3, 0]);
  await E.tween(0.4, e => set.door.rotation.y = -e * 1.4);
  await wendi.walkTo(-1.0, 0.8, 1.7, true); wendi.faceTo(0.2, 0.6); bram.faceTo(-1.0, 0.8);
  await play(state.round >= 3 ? S.ROUND3_FAIL : S.ROUND2_FAIL);
}

// ---------- lantai ----------
async function playFloor(f) {
  window.__floorN = f.n;
  const set = FLOOR_SETS[f.set]();
  const kSide = Math.random() < 0.5 ? -1 : 1, aSide = -kSide;
  const hk = set.holoK(kSide), ha = set.holoA(aSide);
  set.g.add(hk, ha);
  E.setSet({ group: set.g, bg: set.bg, fog: set.fog, tick: (dt, t) => { set.tick?.(dt, t); hk.userData.tick(dt, t); ha.userData.tick(dt, t); } });
  const bram = E.add(E.char('bram'), ...SPOT.enter, Math.PI);
  const kc = E.char(f.karyaBy), ac = E.char(f.arsitekBy);
  const pos = (s) => s < 0 ? SPOT.left : SPOT.right;
  E.add(kc, ...pos(kSide)); E.add(ac, ...pos(aSide));
  kc.faceTo(...SPOT.bram); ac.faceTo(...SPOT.bram);
  kc.hold(kc.p.prop); ac.hold(ac.p.prop);
  audio.music(f.n === 5 ? 'urgent' : 'office', 0.2);
  ui.setFloor(`Lantai ${f.n}/5`);
  ui.floorCard(`LANTAI ${f.n}`, f.title.split('— ')[1]);
  if (!skipScene) await set.intro(bram); else { bram.place(...SPOT.bram, Math.PI); }
  bram.faceTo(0, -2);
  const holoCam = (side, h) => {
    if (h === hk && set.holoCamK) return set.holoCamK(kSide);
    if (h === ha && set.holoCamA) return set.holoCamA(aSide);
    return E.camTo([side * 0.5, 2.0, 3.4], [side * 1.85, 2.0, -1.5], 1.0);
  };
  let holoOwner = null;
  const ctx = {
    actions: {
      holoK: () => { hk.userData.show(); audio.sfx('holo', 0.6); holoOwner = kc; if (f.set === 'studio') { set.dimForTrailer(true); audio.sfx('clapper', 0.9); } if (f.set === 'lobby') audio.sfx('trophy', 0.8); if (f.set === 'rooftop') audio.sfx('coin', 0.7); kc.gesture('lift', 2.0); holoCam(kSide, hk); return 'cam'; },
      hideHoloK: () => { hk.userData.hide(); if (f.set === 'studio') set.dimForTrailer(false); if (holoOwner === kc) holoOwner = null; },
      holoA: () => { ha.userData.show(); audio.sfx('holo', 0.6); holoOwner = ac; ac.gesture('point', 2.0); holoCam(aSide, ha); return 'cam'; },
      holoA2: () => { ha.userData.setStage(1); audio.sfx('pop', 0.6); ac.gesture('point', 1.6); },
      weigh: () => { bram.gesture('weigh', 2.6); E.camTo([0.9, 3.3, 4.4], [0, 0.9, -0.3], 0.9); return 'cam'; },
      glitch: () => { set.glitch(); fajarPanic(); return 'cam'; },
      vrOn: () => { bram.vr = bram.vr || addVR(bram); bram.vr.visible = true; },
      vrOff: () => { if (bram.vr) bram.vr.visible = false; },
      bookThud: () => { audio.sfx('bag', 1.0); E.shake(0.06, 0.35); },
    },
    camFor: (b, who) => {
      if (b.s === 'tutor' && set.focusRobot) { set.focusRobot(); return true; }
      if (holoOwner && who === holoOwner) { holoCam(holoOwner === kc ? kSide : aSide, holoOwner === kc ? hk : ha); return true; }
      return false;
    },
  };
  const fajarPanic = () => { const fj = E.chars.fajar; if (fj) fj.gesture('facepalm', 2); set.focusRobot?.(); };
  await play(f.beats, ctx);
  if (bram.vr) bram.vr.visible = false;
  hk.userData.hide(); ha.userData.hide(); if (f.set === 'studio') set.dimForTrailer(false);
  // pilihan
  E.camTo([0, 3.6, 4.9], [0, 0.8, -0.4], 1.0);
  kc.lookAtPoint(headPos(bram)); ac.lookAtPoint(headPos(bram));
  const card = (who, c, type) => ({ ...c, type, by: who, byName: S.CAST[who].name });
  const cards = kSide < 0 ? [card(f.karyaBy, f.karya, 'karya'), card(f.arsitekBy, f.arsitek, 'arsitek')] : [card(f.arsitekBy, f.arsitek, 'arsitek'), card(f.karyaBy, f.karya, 'karya')];
  const { card: chosen, picker } = await ui.choice(cards);
  const giver = chosen.type === 'karya' ? kc : ac, other = chosen.type === 'karya' ? ac : kc;
  giver.gesture('give', 1.6); other.gesture('shrug', 1.6);
  // berkas terbang ke tas Bram
  const paper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.22), new THREE.MeshToonMaterial({ color: '#f4ecd8', emissive: '#4a4020' }));
  set.g.add(paper);
  const p0 = headPos(giver).add(new THREE.Vector3(0, -0.3, 0.2)), p1 = headPos(bram).add(new THREE.Vector3(0.3, -0.9, 0));
  audio.sfx('whoosh', 0.6);
  await E.tween(0.9, e => { paper.position.lerpVectors(p0, p1, e); paper.position.y += Math.sin(e * Math.PI) * 0.8; paper.rotation.y = e * 8; });
  set.g.remove(paper); audio.sfx('bag', 0.9);
  bram.gesture('lift', 1.4);
  const bite = S.BITE[(f.n - 1) % S.BITE.length];
  await play([bite], {});
  return { floor: f.n, type: chosen.type, title: chosen.title, by: chosen.byName, picker, court: chosen.court };
}
function addVR(bram) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.11, 0.13), new THREE.MeshToonMaterial({ color: '#2b2f38' })); g.add(m);
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.01), new THREE.MeshBasicMaterial({ color: '#58d0ff' })); s.position.z = 0.07; g.add(s);
  g.position.set(0, 0.02, 0.15); bram.head.add(g); return g;
}

// ---------- menuju sidang ----------
async function toCourt() {
  ui.setFloor('Menuju sidang');
  audio.music('urgent', 0.22);
  const ex = exterior(); E.setSet({ group: ex.g, bg: ex.bg, fog: ex.fog, tick: ex.tick });
  const bram = E.add(E.char('bram'), -1, -6, Math.PI / 2); bram.root.position.y = ex.bridgeY + 0.15;
  E.follow = () => { const p = bram.root.position; E.camera.position.set(p.x - 3.5, p.y + 1.6, p.z + 6); E.look.set(p.x + 1, p.y + 1.2, p.z); };
  const bell = (async () => { await E.wait(0.8); audio.sfx('bell', 0.8); })();
  await bram.walkTo(10.5, -6, 2.4, true);
  E.follow = null;
  await bell;
  // ruang sidang: pintu hampir tertutup
  const ct = courtroom(); state.ct = ct;
  E.setSet({ group: ct.g, bg: ct.bg, tick: ct.tick });
  placeCourtCast(ct);
  E.add(bram, 0, 11.6, Math.PI);
  E.cut([2.6, 1.6, 7.2], [0, 1.4, 10.6]);
  ct.doors.forEach((d, i) => d.rotation.y = (i ? -1 : 1) * 1.2);
  E.tween(0.9, e => ct.doors.forEach((d, i) => d.rotation.y = (i ? -1 : 1) * 1.2 * (1 - e)));
  await bram.walkTo(0, 9.8, 2.4, true);
  audio.sfx('door_slam', 0.9); E.shake(0.1, 0.4);
  bram.gesture('bow', 1.0);
  await say1(S.TO_COURT[0], {});
  E.camTo([3.5, 2.0, 6.5], [0, 1.2, 2], 1.2);
  await bram.walkTo(0, 2.0, 1.8);
  bram.faceTo(0, -8);
}
function placeHakim(ct, hk) {
  ct.g.add(hk.root); hk.root.scale.setScalar(2.6); hk.root.position.set(0, 5.75, -8.1); hk.root.rotation.y = 0;
}
function placeCourtCast(ct) {
  placeHakim(ct, E.char('hakim'));
  const pan = E.add(E.char('panitera'), 2.4, -5.3, -0.5);
  const w = E.add(E.char('wendi'), -2.0, 3.0, Math.PI); w.hold('tablet');
}

// ---------- sidang ----------
async function trial() {
  const ct = state.ct, bram = E.char('bram'), hakim = E.char('hakim'), wendi = E.char('wendi');
  ui.setFloor('Ruang Sidang');
  ct.resetMeter();
  audio.music('court', 0.24);
  // kamera naik menyusuri mimbar
  E.cut([0, 0.8, 3], [0, 1.5, -6]);
  await E.camTo([0, 9.5, 3.5], [0, 9.0, -8], 3.2, easeInOut);
  const camHakim = () => E.camTo([0.8, 9.6, -1.5], [0, 9.6, -8], 0.8);
  const camBram = () => E.camTo([1.2, 1.8, -0.6], [0, 1.6, 2], 0.7);
  const gavel = () => { hakim.gesture('hammer', 0.9); setTimeout(() => { audio.sfx('gavel', 1.0); E.shake(0.18, 0.5); ct.g.userData.sway = 0.08; }, 250); };
  const focusOpt = (s) => s === 'hakim' ? { dist: 6.5, side: 0.2, h: -0.5 } : {};
  const ctx = {
    actions: {
      gavel: () => { gavel(); },
      hakimLean: () => { hakim.gesture('point', 2); camHakim(); return 'cam'; },
      liftBag: () => { bram.gesture('lift', 1.6); },
      rise: () => { riseBench(); return 'cam'; },
      thunder: async () => { audio.sfx('thunder', 0.9); E.shake(0.1, 0.6); if (ct.thunder) ct.thunder(); await E.wait(3.4); },
      sad: () => { setTimeout(() => { audio.music('sad', 0.4); audio.sfx('aww', 0.8); ct.crowd.forEach(c => c.gesture('sad', 6)); wendi.gesture('sad', 6); bram.gesture('sad', 3); ct.signs.forEach(s => E.tween(1.2, e => s.rotation.x = -e * 1.2)); E.camTo([0.5, 3.0, -2.6], [0, 1.4, 4.5], 1.6); }, 900); },
      celebrate: () => { setTimeout(() => { audio.music('win', 0.5); audio.sfx('cheer', 0.9); audio.sfx('confetti', 0.8); confetti(ct.g, new THREE.Vector3(0, 9, 2)); ct.crowd.forEach((c, i) => setTimeout(() => c.gesture('cheer', 5), i * 60)); wendi.gesture('cheer', 5); bram.gesture('cheer', 4); bram.faceTo(0, 8); wendi.faceTo(0, 8); E.camTo([0.5, 3.4, -3.2], [0, 1.4, 4.5], 1.4); }, 800); },
      calm: () => { camHakim(); return 'cam'; },
      blueprint: () => { const bp = hakim.hold('map', 0); bp.scale.setScalar(2.2); camHakim(); return 'cam'; },
    },
    focusOpt,
    camFor: (b, who) => { if (b.s === 'hakim') { camHakim(); return true; } if (b.s === 'bram') { camBram(); return true; } if (b.s === 'panitera') { E.focus(who, { dist: 2.6 }); return true; } return false; },
  };
  const riseBench = () => {
    audio.sfx('machine', 0.9);
    const b0 = ct.bench.position.y, h0 = hakim.root.position.y;
    E.tween(2.2, e => { ct.bench.position.y = b0 + e * 1.4; hakim.root.position.y = h0 + e * 1.4; });
    E.camTo([0, 6, 7], [0, 9, -8], 2.2);
  };
  await play(S.COURT_OPEN, ctx);
  // penyerahan berkas
  let arsitek = 0; const rc = { karya: 0, arsitek: 0 };
  for (const p of state.picks) {
    await play([{ ...p.court, s: 'bram' }], ctx);
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 0.3), new THREE.MeshToonMaterial({ color: '#f4ecd8', emissive: '#4a4020' }));
    ct.g.add(paper);
    const p0 = new THREE.Vector3(0.3, 1.3, 1.6), p1 = new THREE.Vector3(0, 7.7 + ct.bench.position.y, -6.4);
    E.camTo([4.5, 4.5, 4], [0, 5, -5], 1.0);
    audio.sfx('whoosh', 0.6);
    await E.tween(1.0, e => { paper.position.lerpVectors(p0, p1, e); paper.position.y += Math.sin(e * Math.PI) * 2; paper.rotation.y = e * 10; });
    ct.g.remove(paper); audio.sfx('bag', 0.7);
    E.camTo([2.6, 8.4, 5.0], [3.2, 8.6, -10], 0.8);
    if (p.type === 'arsitek') { arsitek++; await ct.setNeedle(arsitek); ct.g.userData.tilt = -0.06 * arsitek / 5; } else await ct.wobble();
    const rr = S.REACT[p.type][rc[p.type]++ % 3];
    await play([rr], ctx);
  }
  const verdict = S.verdictFor(arsitek);
  await play(S.DELIB, ctx);
  await E.wait(1.0);
  ct.lightZone({ A: 0, B: 1, C: 2, D: 3 }[verdict]);
  E.camTo([2.6, 8.4, 5.0], [3.2, 8.8, -10], 0.8); await E.wait(1.4);
  const v = S.VERDICTS[verdict];
  const stampAt = v.beats.findIndex(b => (b.do || []).includes('gavel'));
  await play(v.beats.slice(0, stampAt + 1), ctx);
  const [t1, t2] = v.label.split(' — ');
  ui.stamp(t1, t2 || '', verdict === 'C' ? 'ok' : verdict === 'B' ? 'mid' : 'bad');
  await E.wait(2.4); ui.hideStamp();
  await play(v.beats.slice(stampAt + 1), ctx);
  await E.wait(1.2);
  if (hakim.props[0]) hakim.hold(null, 0);
  ct.bench.position.y = 0;
  return verdict;
}

window.E = E; window.__state = state;
boot();
