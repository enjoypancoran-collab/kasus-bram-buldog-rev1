// Lingkungan tujuh lantai Menara Pembelajaran + visual bukti.
import { E, THREE, toon, holo, txt, sign, canvasTexture, easeOut, easeIn, easeBack, linear, confetti } from './engine.js';
import { makeRobot } from './characters.js';
import { audio } from './audio.js';

// ---------- helper ----------
export function B(parent, w, h, d, color, pos, opts = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), opts.mat || toon(color, opts.m));
  m.position.set(...pos); m.castShadow = opts.cast !== false; m.receiveShadow = true;
  if (opts.rot) m.rotation.set(...opts.rot);
  parent.add(m); return m;
}
export function C(parent, rt, rb, h, color, pos, opts = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, opts.seg || 20), opts.mat || toon(color, opts.m));
  m.position.set(...pos); m.castShadow = true; m.receiveShadow = true; if (opts.rot) m.rotation.set(...opts.rot);
  parent.add(m); return m;
}
export function S(parent, r, color, pos, opts = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), opts.mat || toon(color, opts.m));
  m.position.set(...pos); m.castShadow = true; parent.add(m); return m;
}
const glow = (c) => new THREE.MeshBasicMaterial({ color: c });
export function floorTex(a, b, n = 8, rep = 6) {
  const t = canvasTexture(256, 256, (x, W) => { const s = W / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = (i + j) % 2 ? a : b; x.fillRect(i * s, j * s, s, s); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t;
}
export function woodTex(base = '#8a5a35', line = '#6e4426', rep = 4) {
  const t = canvasTexture(256, 256, (x, W, H) => { x.fillStyle = base; x.fillRect(0, 0, W, H); x.strokeStyle = line; x.lineWidth = 3; for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(0, i * 16 + 4); x.lineTo(W, i * 16 + 4 + Math.sin(i) * 3); x.stroke(); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); return t;
}
export function room(o) {
  const g = new THREE.Group();
  const w = o.w || 12, d = o.d || 10, h = o.h || 4.2;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w, d + 6), o.floorMat || toon(o.floor || '#9a9a9a'));
  fl.rotation.x = -Math.PI / 2; fl.position.z = 3 - 0; fl.receiveShadow = true; g.add(fl);
  const wm = o.wallMat || toon(o.wall || '#d9d4c8');
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wm); back.position.set(0, h / 2, -d / 2); back.receiveShadow = true; g.add(back);
  for (const sx of [-1, 1]) { const s = new THREE.Mesh(new THREE.PlaneGeometry(d + 6, h), wm); s.position.set(sx * w / 2, h / 2, 3); s.rotation.y = -sx * Math.PI / 2; s.receiveShadow = true; g.add(s); }
  if (o.ceiling !== false) { const c = new THREE.Mesh(new THREE.PlaneGeometry(w, d + 6), toon(o.ceil || '#eeeae2')); c.rotation.x = Math.PI / 2; c.position.set(0, h, 3); g.add(c); }
  if (o.trim) B(g, w, 0.18, 0.05, o.trim, [0, 0.09, -d / 2 + 0.03], { cast: false });
  lights(g, o);
  return g;
}
export function lights(g, o = {}) {
  const hemi = new THREE.HemisphereLight(o.sky || '#ffffff', o.ground || '#5a5048', o.hemi ?? 1.15); g.add(hemi);
  const key = new THREE.DirectionalLight(o.keyC || '#fff4e0', o.key ?? 2.0);
  key.position.set(...(o.keyPos || [3, 7, 6])); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); const sc = key.shadow.camera; sc.left = sc.bottom = -9; sc.right = sc.top = 9; sc.far = 40; key.shadow.bias = -0.0005;
  g.add(key); g.add(key.target);
  g.userData.key = key; g.userData.hemi = hemi;
  return { hemi, key };
}
// posisi standar adegan lantai
export const SPOT = { bram: [0, 1.15], left: [-1.6, -0.45], right: [1.6, -0.45], enter: [0, 4.5] };
function holoPos(h, side, y = 2.1, z = -1.55, x = 1.75) { h.position.set(side * (x + 0.55), y + 0.25, z - 0.15); h.rotation.y = -side * 0.28; return h; }

// panel diagram alur bertahap
function drawFlow(x, W, H, boxes, stage, accent = '#ffd66b') {
  txt(x, boxes.title, W / 2, 46, 40, '#ffffff');
  const n = boxes.items.length; const bw = W * 0.78, bh = (H - 120) / n - 14;
  boxes.items.forEach((it, i) => {
    const y = 90 + i * (bh + 14), hi = stage >= (it.stage || 0);
    if (!hi) return;
    x.strokeStyle = it.hl && stage >= it.hl ? accent : '#7fdcff'; x.lineWidth = it.hl && stage >= it.hl ? 7 : 4;
    x.fillStyle = it.hl && stage >= it.hl ? 'rgba(255,214,107,0.22)' : 'rgba(95,208,255,0.12)';
    x.fillRect((W - bw) / 2, y, bw, bh); x.strokeRect((W - bw) / 2, y, bw, bh);
    txt(x, it.t, W / 2, y + bh / 2, Math.min(34, bh * 0.42), it.hl && stage >= it.hl ? '#fff3c4' : '#dff6ff', 700);
    if (i < n - 1 && stage >= (boxes.items[i + 1].stage || 0)) { x.fillStyle = '#7fdcff'; x.beginPath(); x.moveTo(W / 2 - 14, y + bh + 2); x.lineTo(W / 2 + 14, y + bh + 2); x.lineTo(W / 2, y + bh + 13); x.fill(); }
  });
}

// =====================================================================
// LANTAI 1 — Lobi & Galeri Piala
// =====================================================================
function lobby() {
  const g = room({ w: 13, d: 10, h: 5, floorMat: toon('#ffffff', { map: floorTex('#e9e4da', '#cfc8ba', 8, 5) }), wall: '#e8dfcf', trim: '#7a5b2a', hemi: 1.2 });
  // lemari piala
  for (let i = -2; i <= 2; i++) {
    const cab = new THREE.Group(); cab.position.set(i * 2.25, 0, -4.6); g.add(cab);
    B(cab, 2, 3.6, 0.06, '#4a2e1a', [0, 1.8, -0.28]);
    for (const sx of [-1, 1]) B(cab, 0.08, 3.6, 0.6, '#5a3a22', [sx * 0.96, 1.8, 0]);
    B(cab, 2, 0.12, 0.6, '#5a3a22', [0, 3.56, 0]); B(cab, 2, 0.12, 0.6, '#5a3a22', [0, 0.06, 0]);
    B(cab, 1.84, 3.4, 0.03, '#d8f0ff', [0, 1.85, 0.31], { m: { transparent: true, opacity: 0.12 }, cast: false });
    const cl = new THREE.PointLight('#fff2c4', 3, 2.5); cl.position.set(0, 3.2, 0.2); cab.add(cl);
    for (let r = 0; r < 4; r++) {
      B(cab, 1.84, 0.04, 0.5, '#7a5233', [0, 0.45 + r * 0.82, 0.02]);
      for (let k = 0; k < 4; k++) {
        const tg = new THREE.Group(); tg.position.set(-0.66 + k * 0.44, 0.5 + r * 0.82, 0.05); cab.add(tg);
        const gold = toon(['#f2c230', '#d8d8de', '#c8803a'][(i + r + k + 6) % 3], { emissive: '#3a2a00' });
        C(tg, 0.11, 0.05, 0.2, null, [0, 0.22, 0], { mat: gold }); C(tg, 0.02, 0.02, 0.12, null, [0, 0.07, 0], { mat: gold }); B(tg, 0.16, 0.05, 0.16, '#2a1d14', [0, 0.02, 0]);
      }
    }
  }
  B(g, 13, 0.5, 0.2, '#7a5b2a', [0, 4.75, -4.9]);
  const banner = sign('GALERI PIALA PTP', 4.2, 0.6, { bg: '#7a1b26', color: '#f6d98a', border: '#e8b84a', font: 'Playfair Display, serif' }); banner.position.set(0, 4.25, -4.28); g.add(banner);
  // pot tanaman
  for (const sx of [-1, 1]) { C(g, 0.35, 0.28, 0.6, '#c8b79a', [sx * 5.4, 0.3, -1]); S(g, 0.55, '#3f8a4a', [sx * 5.4, 1.0, -1]); }
  // pintu putar
  const door = new THREE.Group(); door.position.set(-4.2, 0, 2.6); g.add(door);
  C(door, 1.1, 1.1, 0.12, '#666', [0, 3.0, 0]); C(door, 1.1, 1.1, 0.06, '#888', [0, 0.03, 0]);
  const wings = new THREE.Group(); door.add(wings);
  for (let k = 0; k < 4; k++) { const p = B(wings, 1.05, 2.9, 0.05, '#bfe6ff', [0.52, 1.5, 0], { m: { transparent: true, opacity: 0.35 } }); p.parent.remove(p); const piv = new THREE.Group(); piv.rotation.y = k * Math.PI / 2; piv.add(p); wings.add(piv); }
  C(wings, 0.05, 0.05, 2.95, '#888', [0, 1.5, 0]);
  // piala bersinar untuk hologram karya
  const sparkle = [];
  const holoK = (side) => holoPos(holo(2.6, 1.7, (x, W, H, t) => {
    txt(x, '🏆 PUlUHAN PIALA PTP 🏆'.replace('l', 'L'), W / 2, 60, 46, '#ffe9a8');
    ['Juara Inovasi Pembelajaran', 'Best E-Learning', 'Juara Video Pembelajaran', 'Inovasi Digital Terbaik', 'Juara Gamifikasi'].forEach((s, i) => {
      const y = 150 + i * 92 + Math.sin(t * 2 + i) * 4; x.fillStyle = 'rgba(255,214,107,0.18)'; x.fillRect(120, y - 34, W - 240, 68);
      txt(x, '★ ' + s + ' ★', W / 2, y, 36, '#fff3c4', 700);
    });
  }, { color: '#ffd66b' }), side);
  const holoA = (side) => holoPos(holo(2.6, 1.9, (x, W, H, t, st) => drawFlow(x, W, H, {
    title: 'ANALISIS MASALAH KINERJA', items: [
      { t: 'Unit minta pelatihan: "pegawai sering salah input"' },
      { t: 'Analisis akar masalah: pengetahuan? prosedur? aplikasi?' },
      { t: 'Ditemukan: prosedur membingungkan', stage: 1 },
      { t: 'Rekomendasi: Microlearning + Panduan Kerja 1 Halaman', stage: 1, hl: 1 },
      { t: 'Pelatihan Klasikal Hanya 2 Hari', stage: 1, hl: 1 },
    ] }, st)), side);
  return {
    g, bg: new THREE.Color('#e8dfcf'), holoK, holoA,
    async intro(bram) {
      // Bram terputar di pintu putar
      E.cut([-1.6, 1.7, 5.6], [-4.2, 1.3, 2.4]);
      const pivot = new THREE.Group(); pivot.position.copy(door.position); g.add(pivot);
      g.remove(bram.root); pivot.add(bram.root); bram.root.position.set(0.55, 0, 0); bram.root.rotation.y = 0;
      audio.sfx('revolving', 0.9);
      await E.tween(1.8, (e) => { wings.rotation.y = e * Math.PI * 6; pivot.rotation.y = e * Math.PI * 6; }, easeIn);
      const wp = new THREE.Vector3(); bram.root.getWorldPosition(wp); pivot.remove(bram.root); g.remove(pivot); g.add(bram.root);
      bram.root.position.set(wp.x, 0, wp.z);
      E.tween(1.2, e => { wings.rotation.y += 0.2 * (1 - e); });
      bram.gesture('shrug', 1.0); E.camTo([0.5, 1.7, 5.2], [-1, 1.2, 1.2], 1.4);
      await bram.walkTo(-1.6, 1.8, 1.2);
      bram.root.rotation.z = 0;
      await bram.walkTo(...SPOT.bram, 1.6);
      bram.faceTo(0, -2);
    },
    tick(dt, t) { door.rotation.y += 0; },
  };
}

// =====================================================================
// LANTAI 2 — Studio Produksi
// =====================================================================
function studio() {
  const g = room({ w: 13, d: 10, h: 5, floor: '#2b2b30', wall: '#3a3a42', ceil: '#222', hemi: 0.75, key: 1.4 });
  B(g, 7, 4, 0.1, '#2fb34a', [-1.5, 2.2, -4.9], { cast: false });
  // lampu sorot
  const spots = [];
  for (const [x, z] of [[-4, 1], [4, 1], [-4.5, -3]]) {
    const st = new THREE.Group(); st.position.set(x, 0, z); g.add(st);
    C(st, 0.03, 0.03, 2.2, '#222', [0, 1.1, 0]); const hd = C(st, 0.25, 0.18, 0.4, '#151515', [0, 2.3, 0], { rot: [Math.PI / 2.6, 0, 0] });
    const sl = new THREE.SpotLight('#fff1d6', 25, 14, 0.5, 0.5); sl.position.set(x, 2.4, z); sl.target.position.set(0, 0.5, 0); g.add(sl, sl.target); spots.push(sl);
  }
  // kamera di rel
  B(g, 8, 0.06, 0.3, '#555', [0, 0.03, 3.4]);
  const camRig = new THREE.Group(); camRig.position.set(-2.5, 0, 3.4); g.add(camRig);
  C(camRig, 0.05, 0.05, 1.4, '#222', [0, 0.7, 0]); B(camRig, 0.5, 0.35, 0.7, '#1a1a1a', [0, 1.5, 0]); C(camRig, 0.12, 0.12, 0.3, '#111', [0, 1.5, -0.45], { rot: [Math.PI / 2, 0, 0] });
  // monitor
  for (let i = 0; i < 3; i++) { B(g, 0.9, 0.55, 0.06, '#111', [3.2 + i * 0.95, 1.4, -4.6]); B(g, 0.82, 0.48, 0.02, '#4fa3ff', [3.2 + i * 0.95, 1.4, -4.56], { m: { emissive: '#1a3f70' } }); }
  B(g, 3.2, 0.8, 0.8, '#2a2a2e', [4.15, 0.4, -4.3]);
  // lift
  const lift = new THREE.Group(); lift.position.set(4.6, 0, 2.2); lift.rotation.y = -Math.PI / 2; g.add(lift);
  B(lift, 1.8, 3.2, 0.2, '#8a8f99', [0, 1.6, 0]);
  const doorL = B(lift, 0.6, 2.6, 0.06, '#c9ced8', [-0.3, 1.3, 0.12]); const doorR = B(lift, 0.6, 2.6, 0.06, '#c9ced8', [0.3, 1.3, 0.12]);
  B(lift, 1.3, 2.7, 0.05, '#111', [0, 1.35, 0.06]);
  // layar trailer (hologram karya berupa layar besar)
  const holoK = (side) => {
    const h = holo(4.2, 2.36, (x, W, H, t) => {
      x.fillStyle = '#05070c'; x.fillRect(0, 0, W, H);
      const grd = x.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#ff9a3c'); grd.addColorStop(1, '#3b0f4a'); x.fillStyle = grd; x.fillRect(0, 70, W, H - 140);
      x.fillStyle = '#120818'; for (let i = 0; i < 14; i++) { const bx = ((i * 97 - t * 120) % (W + 200) + W + 200) % (W + 200) - 100, bh = 120 + (i * 53) % 200; x.fillRect(bx, H - 70 - bh, 80, bh); }
      x.fillStyle = '#000'; x.fillRect(0, 0, W, 70); x.fillRect(0, H - 70, W, 70);
      const a = Math.min(1, Math.max(0, (t - 1) / 1.5)); x.globalAlpha = a;
      txt(x, 'KETIKA ANGGARAN NEGARA', W / 2, H / 2 - 40, 62, '#ffffff', 900); txt(x, 'DIPERTARUHKAN...', W / 2, H / 2 + 40, 62, '#ffd66b', 900);
      x.globalAlpha = 1; txt(x, 'dibuat dengan AI  •  kualitas bioskop', W / 2, H - 35, 26, '#aaa', 600);
    }, { color: '#ffffff' });
    h.position.set(-1.5, 2.3, -4.7); h.children[0].material.blending = THREE.NormalBlending; return h;
  };
  const holoA = (side) => {
    const h = holo(3.4, 2.2, (x, W, H, t, st) => {
      txt(x, 'PETA KEBUTUHAN BELAJAR KEMENKEU', W / 2, 44, 40, '#ffffff');
      const isl = [[200, 220, 'DJA'], [470, 170, 'DJPb'], [760, 240, 'DJP'], [300, 470, 'DJBC'], [620, 470, 'Setjen'], [860, 450, 'BPPK']];
      isl.forEach(([cx, cy, n], i) => {
        x.fillStyle = 'rgba(95,208,255,0.18)'; x.beginPath(); x.ellipse(cx, cy, 110, 70, 0, 0, 7); x.fill(); x.strokeStyle = '#7fdcff'; x.lineWidth = 3; x.stroke();
        txt(x, n, cx, cy - 40, 28, '#dff6ff');
        for (let k = 0; k < 3; k++) { x.fillStyle = (k + i) % 2 ? '#ff4d4d' : '#4dff88'; x.beginPath(); x.arc(cx - 40 + k * 40, cy + 10 + (k % 2) * 16, 11 + Math.sin(t * 4 + k) * 2, 0, 7); x.fill(); }
      });
      x.strokeStyle = '#4dff88'; x.lineWidth = 4; x.setLineDash([12, 10]); x.beginPath(); x.moveTo(200, 220); x.lineTo(470, 170); x.lineTo(760, 240); x.lineTo(620, 470); x.lineTo(300, 470); x.stroke(); x.setLineDash([]);
      if (st >= 1) { [[470, 600, 'Program lama A: DIHENTIKAN'], [470, 650, 'Program lama B: DIGABUNG']].forEach(([cx, cy, s]) => txt(x, s, cx + 40, cy, 30, '#bbbbbb', 700)); txt(x, '● kesenjangan belum tersentuh', 240, H - 26, 24, '#ff7a7a', 700); }
    });
    return holoPos(h, side, 2.1, -1.6, 1.6);
  };
  return {
    g, bg: new THREE.Color('#151518'), holoK, holoA,
    async intro(bram) {
      E.cut([1.6, 1.6, 3.6], [4.4, 1.3, 2.2]);
      bram.root.position.set(4.9, 0.6, 2.2); bram.root.rotation.y = -Math.PI / 2;
      doorL.position.x = -0.15; doorR.position.x = 0.15;
      audio.sfx('lift_stop', 0.9); E.shake(0.08, 0.5);
      await E.wait(0.7); await E.tween(0.5, e => { doorL.position.x = -0.15 - e * 0.12; doorR.position.x = 0.15 + e * 0.12; });
      bram.gesture('lift', 1.0); await E.wait(0.6);
      await E.tween(0.6, e => { bram.root.position.x = 4.9 - e * 0.9; bram.root.position.y = 0.6 + Math.sin(e * Math.PI) * 0.5 - e * 0.6; }, linear);
      bram.root.position.y = 0;
      E.camTo([0.8, 1.7, 5.0], [0, 1.2, 0.5], 1.6);
      await bram.walkTo(...SPOT.bram, 1.6); bram.faceTo(0, -2);
    },
    dimForTrailer(on) { spots.forEach(s => E.tween(0.6, e => s.intensity = on ? 25 * (1 - e) + 3 * e : 3 * (1 - e) + 25 * e)); },
    tick(dt, t) { camRig.position.x = -2.5 + Math.sin(t * 0.4) * 1.5; },
  };
}

// =====================================================================
// LANTAI 3 — Ruang Imersif 360
// =====================================================================
function immersive() {
  const g = room({ w: 13, d: 10, h: 5, floor: '#26283a', wall: '#1d1f2c', ceil: '#15161f', hemi: 0.6, key: 1.2 });
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.4, 48), toon('#3a2f5a')); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.01; rug.receiveShadow = true; g.add(rug);
  // kubah proyeksi 360
  const domeTex = canvasTexture(2048, 512, (x, W, H) => {
    x.fillStyle = '#e9e2d0'; x.fillRect(0, 0, W, H); x.fillStyle = '#c9b48a'; x.fillRect(0, H * 0.72, W, H * 0.28);
    for (let i = 0; i < 8; i++) {
      const cx = i * 256 + 128; x.fillStyle = '#5a6b7a'; x.fillRect(cx - 100, H * 0.42, 200, H * 0.3);
      x.fillStyle = '#9fd0ff'; x.fillRect(cx - 90, H * 0.2, 180, H * 0.2);
      x.fillStyle = '#2a3a4a'; x.font = '900 34px Inter'; x.textAlign = 'center'; x.fillText('LOKET ' + (i + 1), cx, H * 0.17);
      x.fillStyle = '#f4f1e6'; for (let k = 0; k < 4; k++) x.fillRect(cx - 70 + k * 36, H * 0.38 - k * 6, 30, 22);
    }
    x.fillStyle = '#2a3a4a'; x.font = '900 46px Inter'; x.fillText('KANTOR PELAYANAN (SIMULASI 360)', W / 2, 60);
  });
  domeTex.wrapS = THREE.RepeatWrapping;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(6, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.58), new THREE.MeshBasicMaterial({ map: domeTex, side: THREE.BackSide, transparent: true, opacity: 0 }));
  dome.position.set(0, 0, 0); g.add(dome);
  // hotspot
  const hots = [];
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const h = S(g, 0.12, null, [Math.sin(a) * 4.5, 1.6 + (i % 2) * 0.4, Math.cos(a) * 4.5 - 0.5], { mat: new THREE.MeshBasicMaterial({ color: '#ffdd55', transparent: true, opacity: 0 }) }); hots.push(h); }
  const tripod = new THREE.Group(); tripod.position.set(0, 0, -2.5); g.add(tripod);
  for (let k = 0; k < 3; k++) { const l = C(tripod, 0.02, 0.02, 1.4, '#222', [Math.sin(k * 2.1) * 0.25, 0.65, Math.cos(k * 2.1) * 0.25]); l.rotation.set(Math.cos(k * 2.1) * 0.35, 0, -Math.sin(k * 2.1) * 0.35); }
  S(tripod, 0.12, '#111', [0, 1.4, 0]);
  const holoK = (side) => {
    const o = new THREE.Group(); let tgt = 0, cur = 0;
    o.userData = { show() { tgt = 1; }, hide() { tgt = 0; }, setStage() {}, tick(dt, t) { cur += (tgt - cur) * Math.min(1, dt * 2); dome.material.opacity = cur * 0.95; dome.rotation.y = t * 0.05; hots.forEach((h, i) => h.material.opacity = cur * (0.6 + Math.sin(t * 4 + i) * 0.4)); } };
    return o;
  };
  // jalur belajar bercahaya di lantai
  const path = new THREE.Group(); g.add(path); path.visible = false;
  const stations = ['Pegawai Baru', 'Pelatihan Dasar', 'Tugas Nyata + Mentor', 'Komunitas Praktik', 'Pelatihan Lanjutan', 'Penilaian di Tempat Kerja'];
  const pts = stations.map((_, i) => new THREE.Vector3(-4 + i * 1.6, 0.03, -1.8 + Math.sin(i * 1.3) * 0.9));
  const curve = new THREE.CatmullRomCurve3(pts);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.08, 8), new THREE.MeshBasicMaterial({ color: '#4dff88', transparent: true, opacity: 0.9 })); path.add(tube);
  const posts = stations.map((s, i) => {
    const p = new THREE.Group(); p.position.copy(pts[i]); path.add(p);
    C(p, 0.04, 0.04, 1.2, '#4dff88', [0, 0.6, 0], { mat: glow('#4dff88') });
    const lab = sign(s, 1.2, 0.3, { bg: '#0d2a1a', color: '#bfffd6', border: '#4dff88', basic: true }); lab.position.set(0, 1.35, 0); p.add(lab);
    return p;
  });
  const mini = sign('360°', 0.5, 0.3, { bg: '#ffdd55', color: '#222', border: false, basic: true }); mini.position.set(0, 1.75, 0); mini.visible = false; posts[2].add(mini);
  const holoA = () => {
    const o = new THREE.Group(); let tgt = 0, cur = 0;
    o.userData = { show() { tgt = 1; path.visible = true; }, hide() { tgt = 0; }, setStage(s) { mini.visible = s >= 1; }, tick(dt, t) { cur += (tgt - cur) * Math.min(1, dt * 3); path.scale.set(1, cur, 1); tube.material.opacity = cur * (0.7 + Math.sin(t * 5) * 0.2); if (cur < 0.02 && !tgt) path.visible = false; mini.position.y = 1.75 + Math.sin(t * 3) * 0.05; } };
    return o;
  };
  const kl = g.userData.key, hm = g.userData.hemi;
  return {
    g, bg: new THREE.Color('#0d0e14'), holoK, holoA,
    holoCamK: (side) => E.camTo([-side * 2.6, 1.6, 2.4], [side * 1.2, 2.3, -3.2], 1.4),
    holoCamA: () => E.camTo([0, 4.2, 3.2], [0, 0.4, -1.6], 1.4),
    async intro(bram) {
      kl.intensity = 0; hm.intensity = 0.05;
      E.cut([0, 1.7, 5.4], [0, 1.2, 0]);
      bram.root.position.set(0, 0, 4.2); bram.faceTo(0, 0);
      audio.sfx('stairs', 0.8);
      await bram.walkTo(0, 2.0, 1.0);
      await E.wait(0.3); audio.sfx('holo', 0.8);
      await E.tween(0.8, e => { kl.intensity = e * 1.2; hm.intensity = 0.05 + e * 0.55; });
      dome.material.opacity = 0.95; E.camTo([0, 1.4, 4.4], [0, 1.7, 0], 1.2);
      bram.gesture('shrug', 1.6);
      await E.tween(1.6, e => { bram.root.rotation.y = Math.PI + e * Math.PI * 2; });
      await E.tween(0.6, e => dome.material.opacity = 0.95 * (1 - e));
      await bram.walkTo(...SPOT.bram, 1.4); bram.faceTo(0, -2);
    },
  };
}

// =====================================================================
// LANTAI 4 — Ruang Data
// =====================================================================
function dataRoom() {
  const g = room({ w: 13, d: 10, h: 4.5, floor: '#2a3646', wall: '#22303f', ceil: '#141c26', hemi: 1.0, key: 1.7, keyC: '#e6f2ff' });
  for (const x of [-3, 3]) { const pl = new THREE.PointLight('#5fc0ff', 12, 9); pl.position.set(x, 3.2, 0.5); g.add(pl); }
  const leds = [];
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) {
    const r = new THREE.Group(); r.position.set(sx * 4.9, 0, 2.6 - i * 1.6); g.add(r);
    B(r, 0.9, 2.6, 1.2, '#20262e', [0, 1.3, 0]);
    for (let k = 0; k < 10; k++) { const l = B(r, 0.04, 0.05, 0.9, null, [-sx * 0.46, 0.4 + k * 0.2, 0], { mat: glow('#38b6ff') }); leds.push(l); }
  }
  // kabel bercahaya di lantai
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-4.5, 0.04, 3), new THREE.Vector3(-1, 0.04, 2.6), new THREE.Vector3(0.5, 0.04, 3.4), new THREE.Vector3(4.5, 0.04, 2.8)]), 40, 0.04, 6), glow('#38b6ff'));
  g.add(cable);
  const alarm = new THREE.PointLight('#ff2a2a', 0, 14); alarm.position.set(0, 3.8, 1); g.add(alarm);
  // papan skor (hologram karya)
  const coins = [];
  const holoK = (side) => {
    const h = holo(3.4, 2.2, (x, W, H, t) => {
      txt(x, '🏅 PAPAN SKOR E-LEARNING 🏅', W / 2, 46, 42, '#ffe9a8');
      const names = ['Rina', 'Dodi', 'Sari', 'Agus', 'Maya', 'Tono'];
      const order = names.map((n, i) => ({ n, s: 900 + Math.round(Math.sin(t * 0.8 + i * 1.7) * 150) + i * 7 })).sort((a, b) => b.s - a.s);
      order.forEach((o, i) => { const y = 120 + i * 82; x.fillStyle = i === 0 ? 'rgba(255,214,107,0.3)' : 'rgba(95,208,255,0.14)'; x.fillRect(110, y - 32, W - 220, 64); txt(x, `#${i + 1}`, 170, y, 34, '#ffd66b', 900); txt(x, o.n, 380, y, 34, '#ffffff', 700, 'left'); txt(x, o.s + ' poin', W - 160, y, 32, '#bff3ff', 700, 'right'); });
    }, { color: '#ffd66b' });
    return holoPos(h, side, 2.0, -1.6, 1.7);
  };
  const islands = new THREE.Group(); islands.visible = false; g.add(islands);
  const isl = ['LMS', 'Manajemen\nPengetahuan', 'Data\nKepegawaian'].map((n, i) => {
    const o = new THREE.Group(); islands.add(o);
    C(o, 0.55, 0.3, 0.35, null, [0, 0, 0], { mat: new THREE.MeshBasicMaterial({ color: '#2c7fd1', transparent: true, opacity: 0.8 }) });
    const s = sign(n, 1.1, 0.5, { bg: '#0a2240', color: '#bfe6ff', border: '#5fd0ff', basic: true }); s.position.y = 0.55; o.add(s);
    o.userData.home = new THREE.Vector3(-2.2 + i * 2.2, 2.4, -2.4); o.position.copy(o.userData.home); return o;
  });
  const report = holo(1.8, 1.4, (x, W, H, t) => {
    txt(x, 'RAPOR BELAJAR PEGAWAI', W / 2, 50, 44, '#ffffff');
    ['Pelatihan diikuti: 12', 'Pengetahuan dibagikan: 7', 'Perubahan kinerja: naik'].forEach((s, i) => txt(x, s, 120, 150 + i * 80, 40, '#dff6ff', 700, 'left'));
    x.strokeStyle = '#4dff88'; x.lineWidth = 6; x.beginPath(); for (let i = 0; i < 8; i++) x.lineTo(130 + i * 100, H - 80 - i * 18 - Math.sin(i + t) * 6); x.stroke();
    txt(x, '🔒 akses terbatas', W - 170, 50, 30, '#ffd66b', 700);
  });
  report.position.set(0, 1.9, -1.6); g.add(report);
  let stA = 0, curA = 0, tgtA = 0;
  const holoA = () => {
    const o = new THREE.Group();
    o.userData = { show() { tgtA = 1; islands.visible = true; }, hide() { tgtA = 0; report.userData.hide(); }, setStage(s) { stA = s; if (s >= 1) report.userData.show(); }, tick(dt, t) {
      curA += (tgtA - curA) * Math.min(1, dt * 3); islands.visible = curA > 0.02;
      isl.forEach((o2, i) => { const target = stA >= 1 ? new THREE.Vector3(0, 3.2, -2.2) : o2.userData.home; o2.position.lerp(target, Math.min(1, dt * (stA >= 1 ? 1.5 : 4))); o2.scale.setScalar(curA * (stA >= 1 ? 0.6 : 1)); o2.rotation.y = Math.sin(t + i) * 0.2; });
      report.userData.tick(dt);
    } };
    return o;
  };
  return {
    g, bg: new THREE.Color('#0b1016'), holoK, holoA,
    holoCamA: () => E.camTo([0, 2.0, 3.6], [0, 2.3, -2], 1.4),
    async intro(bram) {
      E.cut([2.2, 1.5, 5.2], [0, 1.0, 2.5]);
      bram.root.position.set(-4, 0, 3.2); bram.faceTo(4, 3);
      await bram.walkTo(-0.6, 3.0, 1.8);
      audio.sfx('trip', 0.9); bram.gesture('facepalm', 1.4);
      bram.root.rotation.x = 0.35; E.shake(0.1, 0.4);
      cable.material.color.set('#ff2a2a'); alarm.intensity = 30;
      for (let k = 0; k < 3; k++) { await E.wait(0.25); alarm.intensity = 0; await E.wait(0.2); alarm.intensity = 30; }
      bram.root.rotation.x = 0; alarm.intensity = 0; cable.material.color.set('#38b6ff');
      await bram.walkTo(...SPOT.bram, 1.6); bram.faceTo(0, -2);
    },
    tick(dt, t) { leds.forEach((l, i) => l.visible = Math.sin(t * 6 + i * 1.7) > -0.6); },
  };
}

// =====================================================================
// LANTAI 5 — Lab AI
// =====================================================================
function aiLab() {
  const g = room({ w: 13, d: 10, h: 4.5, floor: '#e9eef3', wall: '#f4f7fa', ceil: '#ffffff', hemi: 1.3, key: 1.6, trim: '#58d0ff' });
  B(g, 13, 0.08, 0.05, null, [0, 3.0, -4.95], { mat: glow('#58d0ff') });
  for (let i = 0; i < 3; i++) { B(g, 1.6, 0.9, 0.8, '#d9e2ea', [-4 + i * 4, 0.45, -4.1]); B(g, 0.6, 0.4, 0.04, '#58d0ff', [-4 + i * 4, 1.3, -4.3], { m: { emissive: '#1a6080' } }); }
  // gerbang pemindai
  const arch = new THREE.Group(); arch.position.set(0, 0, 3.0); g.add(arch);
  for (const sx of [-1, 1]) B(arch, 0.25, 2.8, 0.4, '#cfd8e2', [sx * 1.1, 1.4, 0]); B(arch, 2.45, 0.25, 0.4, '#cfd8e2', [0, 2.8, 0]);
  const beam = B(arch, 2.0, 0.03, 0.05, null, [0, 2.5, 0], { mat: new THREE.MeshBasicMaterial({ color: '#4dff88', transparent: true, opacity: 0.0 }) });
  const archLight = B(arch, 0.3, 0.12, 0.05, null, [0, 2.95, 0.21], { mat: glow('#4dff88') });
  // robot
  const robot = makeRobot(); g.add(robot); robot.position.set(0, 1.6, -1.2);
  let glitching = 0;
  const bubble = sign('PAGU BOLEH DILAMPAUI!', 1.8, 0.4, { bg: '#2a0000', color: '#ff6b6b', border: '#ff2a2a', basic: true }); bubble.visible = false; g.add(bubble);
  // tutor AI hologram + jendela peserta
  const holoK = (side) => {
    const h = holo(3.2, 2.0, (x, W, H, t) => {
      txt(x, 'TUTOR AI 24 JAM', W / 2, 44, 42, '#ffffff');
      for (let i = 0; i < 12; i++) { const cx = 110 + (i % 6) * 160, cy = 150 + Math.floor(i / 6) * 190; x.strokeStyle = '#7fdcff'; x.lineWidth = 3; x.strokeRect(cx - 65, cy - 55, 130, 110); x.fillStyle = '#7fdcff'; x.beginPath(); x.arc(cx, cy - 15, 20, 0, 7); x.fill(); x.fillRect(cx - 28, cy + 12, 56, 26); if (Math.sin(t * 3 + i) > 0.3) txt(x, '...', cx + 40, cy - 40, 30, '#ffd66b'); }
      txt(x, 'ratusan peserta, tutor masing-masing', W / 2, H - 40, 30, '#bff3ff', 600);
    });
    return holoPos(h, side, 2.25, -1.8, 1.8);
  };
  const shields = new THREE.Group(); g.add(shields); shields.visible = false;
  const labels = ['Sumber Terkurasi', 'Keamanan Data', 'Pemeriksaan Kesalahan', 'Penanggung Jawab'];
  const rings = labels.map((l, i) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.45 + i * 0.18, 28, 18), new THREE.MeshBasicMaterial({ color: ['#1f8fd8', '#1faa55', '#d9a520', '#8a4fd8'][i], transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    shields.add(s);
    const lab = sign(l, 1.4, 0.28, { bg: '#0a2240', color: '#e6f6ff', border: ['#58d0ff', '#4dff88', '#ffd66b', '#c58bff'][i], basic: true });
    lab.position.set((i % 2 ? 1 : -1) * 1.5, 0.55 - i * 0.38, 0.3); shields.add(lab); lab.visible = false; s.userData.lab = lab;
    return s;
  });
  let stA = 0, tgtA = 0, curA = 0;
  const holoA = () => {
    const o = new THREE.Group();
    o.userData = { show() { tgtA = 1; shields.visible = true; glitching = 0; }, hide() { tgtA = 0; }, setStage(s) { stA = s; }, tick(dt, t) {
      curA += (tgtA - curA) * Math.min(1, dt * 3); shields.visible = curA > 0.02; shields.position.copy(robot.position);
      rings.forEach((r, i) => { const on = stA >= 1 || i === 0; r.material.opacity = curA * (on ? 0.13 : 0.03) * (0.8 + Math.sin(t * 3 + i) * 0.2); r.rotation.y = t * (0.3 + i * 0.1); r.userData.lab.visible = curA > 0.5 && on; r.userData.lab.lookAt(E.camera.position); });
    } };
    return o;
  };
  return {
    g, bg: new THREE.Color('#e8eef4'), holoK, holoA, robot,
    holoCamA: () => E.camTo([0, 2.1, 3.9], [0, 1.5, -1.2], 1.2),
    focusRobot: () => E.camTo([0.7, 1.9, 1.6], [0, 1.6, -1.2], 0.8),
    glitch() { glitching = 1; audio.sfx('glitch', 0.9); bubble.visible = true; E.shake(0.05, 0.6); },
    async intro(bram) {
      E.cut([2.6, 1.7, 6.0], [0, 1.3, 3.0]);
      bram.root.position.set(0, 0, 5.2); bram.faceTo(0, 0);
      await bram.walkTo(0, 3.6, 1.4);
      audio.sfx('scan', 0.9);
      await E.tween(1.0, e => { beam.material.opacity = 0.9; beam.position.y = 2.5 - e * 2.3; });
      archLight.material.color.set('#ff2a2a'); beam.material.color.set('#ff2a2a');
      bram.gesture('shrug', 1.0); await E.wait(0.9);
      const ears = bram.ears; ears.forEach(e => e.visible = false); audio.sfx('pop', 0.7);
      archLight.material.color.set('#4dff88'); beam.material.opacity = 0;
      await bram.walkTo(0, 2.2, 1.4); ears.forEach(e => e.visible = true); audio.sfx('pop', 0.7);
      await bram.walkTo(...SPOT.bram, 1.4); bram.faceTo(0, -2);
    },
    tick(dt, t) {
      robot.position.y = 1.6 + Math.sin(t * 2) * 0.08; robot.rotation.y = Math.sin(t * 0.7) * 0.4;
      const red = glitching && tgtA === 0;
      robot.userData.eyes.forEach(e => e.material.color.set(red ? '#ff3030' : '#58d0ff'));
      robot.userData.ring.material.color.set(red ? '#ff3030' : '#58d0ff');
      if (red) { robot.position.x = (Math.random() - 0.5) * 0.06; }
      if (!red) bubble.visible = false;
      bubble.position.set(robot.position.x, robot.position.y + 0.55, robot.position.z); bubble.lookAt(E.camera.position);
      robot.userData.ring.rotation.z = t * 2;
    },
  };
}

// =====================================================================
// LANTAI 5 — Gudang Modul & Ruang Evaluasi (lantai teratas)
// =====================================================================
function warehouse() {
  const g = room({ w: 14, d: 10, h: 6, floor: '#8c8578', wall: '#c9bfae', ceil: '#9a9283', hemi: 1.0, key: 1.7 });
  const books = [];
  for (const sx of [-1, 1]) for (let i = 0; i < 2; i++) {
    const sh = new THREE.Group(); sh.position.set(sx * 5.6, 0, 1.6 - i * 3); sh.rotation.y = -sx * Math.PI / 2; g.add(sh);
    for (let r = 0; r < 5; r++) { B(sh, 2.6, 0.06, 0.8, '#6b5a43', [0, 0.1 + r * 1.0, 0]); for (let k = 0; k < 8; k++) B(sh, 0.24, 0.6, 0.55, ['#d9c7a3', '#c9a46a', '#e6dcc4'][(k + r) % 3], [-1.1 + k * 0.31, 0.42 + r * 1.0, 0]); }
    for (const px of [-1.3, 1.3]) B(sh, 0.08, 5, 0.8, '#5a4a36', [px, 2.5, 0]);
  }
  // ruang kaca evaluasi
  const glass = new THREE.Group(); glass.position.set(0, 0, -4.2); g.add(glass);
  B(glass, 6, 3.4, 0.05, '#bfe6ff', [0, 1.7, 0.6], { m: { transparent: true, opacity: 0.15 }, cast: false });
  // troli + mesin konversi
  const trolley = new THREE.Group(); g.add(trolley);
  B(trolley, 0.9, 0.08, 0.6, '#555', [0, 0.35, 0]); for (const [x, z] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) S(trolley, 0.07, '#222', [x, 0.07, z]);
  B(trolley, 0.05, 1.0, 0.6, '#555', [-0.45, 0.85, 0]); for (let k = 0; k < 6; k++) B(trolley, 0.8, 0.12, 0.5, ['#d9c7a3', '#c9a46a'][k % 2], [0, 0.45 + k * 0.13, 0]);
  const machine = new THREE.Group(); g.add(machine);
  B(machine, 1.4, 1.6, 1.2, '#4a6d9c', [0, 0.8, 0]); B(machine, 0.9, 0.5, 0.05, '#111', [0, 1.7, 0.6]);
  const counterTex = canvasTexture(512, 256, () => {}); const counter = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.43), new THREE.MeshBasicMaterial({ map: counterTex })); counter.position.set(0, 1.85, 0.62); machine.add(counter);
  let count = 0, converting = false;
  const flyers = [];
  const holoK = (side) => {
    machine.position.set(side * 3.4, 0, -1.6); trolley.position.set(side * 2.2, 0, -0.9);
    const o = new THREE.Group();
    o.userData = { show() { converting = true; }, hide() { converting = false; }, setStage() {}, tick(dt, t) {
      if (converting) { count = Math.min(512, count + dt * 140); if (Math.random() < dt * 10) {
        const isCard = Math.random() < 0.5; const m = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.22), new THREE.MeshBasicMaterial({ color: isCard ? '#58d0ff' : '#ffd66b', side: THREE.DoubleSide, transparent: true }));
        m.position.copy(machine.position).add(new THREE.Vector3(0, 1.8, 0.5)); m.userData.v = new THREE.Vector3((Math.random() - 0.5) * 1.2, 1.4 + Math.random(), 0.8 + Math.random() * 0.6); m.userData.life = 0; g.add(m); flyers.push(m); } }
      for (let i = flyers.length - 1; i >= 0; i--) { const f = flyers[i]; f.userData.life += dt; f.position.addScaledVector(f.userData.v, dt); f.userData.v.y -= dt * 1.2; f.rotation.y += dt * 4; f.material.opacity = Math.max(0, 1 - f.userData.life / 2.2); if (f.userData.life > 2.2) { g.remove(f); flyers.splice(i, 1); } }
      const x = counterTex.userData.ctx; x.fillStyle = '#071018'; x.fillRect(0, 0, 512, 256); txt(x, 'MODUL TERKONVERSI', 256, 60, 40, '#7fdcff'); txt(x, String(Math.floor(count)), 256, 160, 110, '#ffd66b', 900); counterTex.needsUpdate = true;
    } };
    return o;
  };
  const holoA = (side) => {
    const h = holo(3.6, 2.2, (x, W, H, t, st) => {
      txt(x, 'EVALUASI DAMPAK KE KINERJA', W / 2, 44, 42, '#ffffff');
      const chart = (ox, title, rise, label) => {
        x.strokeStyle = '#7fdcff'; x.lineWidth = 3; x.strokeRect(ox, 110, 420, 360); txt(x, title, ox + 210, 140, 28, '#dff6ff', 700);
        txt(x, 'sebelum', ox + 70, 495, 24, '#9fc9dd', 600); txt(x, 'sesudah', ox + 350, 495, 24, '#9fc9dd', 600);
        x.strokeStyle = rise ? '#4dff88' : '#aaaaaa'; x.lineWidth = 8; x.beginPath(); x.moveTo(ox + 40, 380); x.lineTo(ox + 380, rise ? 190 : 375); x.stroke();
        if (label && st >= 1) { x.fillStyle = 'rgba(255,60,60,0.85)'; x.save(); x.translate(ox + 210, 300); x.rotate(-0.12); x.fillRect(-190, -40, 380, 80); txt(x, 'HENTIKAN & RANCANG ULANG', 0, 0, 28, '#ffffff', 900); x.restore(); }
      };
      chart(40, 'Pelatihan A: kinerja naik', true, false); chart(W - 460, 'Pelatihan B: datar', false, true);
    });
    return holoPos(h, side, 2.2, -2.6, 1.6);
  };
  const winTex = canvasTexture(1024, 512, (x, W, H) => {
    const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#6aa8e8'); gr.addColorStop(1, '#f6d7a8'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    x.fillStyle = '#e6dccb'; x.fillRect(W / 2 - 230, 250, 460, 262); x.fillRect(W / 2 - 70, 40, 140, 230); x.fillStyle = '#7a1b26'; x.beginPath(); x.moveTo(W / 2 - 90, 45); x.lineTo(W / 2, -30); x.lineTo(W / 2 + 90, 45); x.fill();
    const cx = W / 2, cy = 150; x.fillStyle = '#f9f4e6'; x.beginPath(); x.arc(cx, cy, 58, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 6; x.stroke(); x.lineCap = 'round';
    const hand = (a, len, w) => { x.lineWidth = w; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); x.stroke(); };
    hand(-Math.PI / 2 + (3.75 / 12) * Math.PI * 2, 30, 8); hand(-Math.PI / 2 + 0.75 * Math.PI * 2, 46, 5);
    txt(x, 'MAHKAMAH GRADING', W / 2, 300, 34, '#5a0f1a', 900);
    for (let i = 0; i < 12; i++) { x.fillStyle = ['#3a3550', '#4a4060'][i % 2]; const h = 120 + (i * 53) % 140; const bx = i < 6 ? i * 52 : W - (12 - i) * 52; x.fillRect(bx, H - h, 46, h); }
    x.strokeStyle = '#8a8070'; x.lineWidth = 14; x.strokeRect(7, 7, W - 14, H - 14); x.beginPath(); x.moveTo(W / 2, 0); x.lineTo(W / 2, H); x.stroke();
  });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.2), new THREE.MeshBasicMaterial({ map: winTex })); win.position.set(-3.4, 4.45, -4.94); g.add(win);
  const avalanche = [];
  return {
    g, bg: new THREE.Color('#bdb3a2'), holoK, holoA, win,
    holoCamK: (side) => E.camTo([-side * 0.8, 2.2, 3.4], [machine.position.x * 0.7, 1.6, -1.4], 1.3),
    async intro(bram) {
      E.cut([3.4, 2.2, 6.2], [-1, 1.0, 2.5]);
      bram.root.position.set(-4.2, 0, 3.6); bram.faceTo(0, 3.6);
      audio.sfx('avalanche', 1.0); E.shake(0.12, 1.0);
      for (let i = 0; i < 30; i++) { const b = B(g, 0.5, 0.12, 0.38, ['#d9c7a3', '#c9a46a', '#e6dcc4'][i % 3], [-5 + Math.random(), 2.5 + Math.random() * 2.5, 3 + Math.random() * 1.4]); b.userData.v = new THREE.Vector3(2 + Math.random() * 2, 0, (Math.random() - 0.5)); b.userData.r = Math.random() * 4; avalanche.push(b); }
      const board = B(g, 0.6, 0.12, 0.4, '#c9a46a', [-4.2, 0.06, 3.6]);
      bram.gesture('weigh', 2.2);
      await E.tween(2.0, e => {
        board.position.x = -4.2 + e * 4.2; bram.root.position.x = board.position.x; bram.root.position.y = 0.12;
        for (const b of avalanche) { b.position.addScaledVector(b.userData.v, 0.016); b.position.y = Math.max(0.06, b.position.y - 0.08); b.rotation.y += b.userData.r * 0.016; }
      }, easeOut);
      bram.root.position.y = 0; audio.sfx('pop', 0.6);
      bram.faceTo(-3.4, -5); audio.sfx('bell', 0.7);
      await E.camTo([0.4, 1.9, 3.2], [-3.4, 4.3, -4.9], 1.1); await E.wait(1.6);
      E.camTo([0.8, 1.7, 5.0], [0, 1.2, 0.5], 1.2);
      await bram.walkTo(...SPOT.bram, 1.4); bram.faceTo(0, -2);
    },
  };
}

// =====================================================================
// LANTAI 3 — Perpustakaan dan Ruang Game
// =====================================================================
function rooftop() {
  const g = new THREE.Group();
  lights(g, { sky: '#ffd6a8', ground: '#5a3a4a', hemi: 1.1, keyC: '#ffb066', key: 2.2, keyPos: [-6, 5, -4] });
  const skyTex = canvasTexture(16, 256, (x, W, H) => { const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2b2a5a'); gr.addColorStop(0.55, '#e0715a'); gr.addColorStop(1, '#ffc27a'); x.fillStyle = gr; x.fillRect(0, 0, W, H); });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })); g.add(sky);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), toon('#9c8f80')); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  for (const [w, x, z] of [[16, 0, -7], [16, 0, 7]]) B(g, w, 1.0, 0.2, '#7a6c5d', [x, 0.5, z]);
  for (const sx of [-1, 1]) B(g, 0.2, 1.0, 14, '#7a6c5d', [sx * 8, 0.5, 0]);
  // rak buku melengkung + kubah kaca
  for (let i = 0; i < 9; i++) { const a = -0.9 + i * 0.22; const sh = B(g, 1.4, 2.4, 0.5, '#6b4a2f', [Math.sin(a) * 5.5, 1.2, -Math.cos(a) * 5.5 + 1]); sh.rotation.y = -a; for (let r = 0; r < 4; r++) for (let k = 0; k < 5; k++) B(sh, 0.2, 0.42, 0.35, ['#a3442f', '#2f4a7a', '#3f8a4a', '#e0b04a'][(k + r + i) % 4], [-0.5 + k * 0.25, -0.85 + r * 0.55, 0.05], { cast: false }); }
  const domeG = new THREE.Mesh(new THREE.SphereGeometry(6.2, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#bfe6ff', transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false })); domeG.position.set(0, 0, 1); g.add(domeG);
  const ribs = new THREE.Group(); g.add(ribs); for (let i = 0; i < 8; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(6.2, 0.04, 6, 40, Math.PI), toon('#ddd')); r.rotation.set(0, i * Math.PI / 8, 0); r.position.set(0, 0, 1); ribs.add(r); }
  // bean bag + pintu tangga
  S(g, 0.55, '#3f6ad8', [2.6, 0.35, -0.9]).scale.set(1, 0.6, 1);
  S(g, 0.55, '#e8662e', [-4.4, 0.3, 1.4]).scale.set(1.1, 0.55, 1.1);
  const bag = S(g, 0.5, '#7a3fd8', [-2.2, 0.28, 2.5]); bag.scale.set(1.25, 0.5, 1.25);
  // sudut game: layar besar
  B(g, 2.6, 1.5, 0.08, '#111', [4.6, 1.6, 2.8]).rotation.y = -1.2;
  const stairDoor = new THREE.Group(); stairDoor.position.set(-5.5, 0, 4.5); g.add(stairDoor); B(stairDoor, 1.6, 2.8, 1.6, '#8a7e70', [0, 1.4, 0]); const dr = B(stairDoor, 0.9, 2.1, 0.06, '#4a3a2a', [0, 1.05, 0.82]);
  // kota & gedung mahkamah
  for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; const r = 40 + (i * 13) % 25; const h = 6 + (i * 37) % 22; B(g, 4, h, 4, ['#3a3550', '#4a4060', '#2d2a45'][i % 3], [Math.cos(a) * r, h / 2 - 12, Math.sin(a) * r], { cast: false }); }
  const court = new THREE.Group(); court.position.set(10, -12, -22); g.add(court);
  B(court, 10, 18, 8, '#e6dccb', [0, 9, 0]); for (let k = 0; k < 6; k++) C(court, 0.35, 0.35, 8, '#f4ecdc', [-3.75 + k * 1.5, 5, 4.2]);
  const tower = B(court, 3, 10, 3, '#e6dccb', [0, 23, 0]); C(court, 2.2, 0.1, 3, '#7a1b26', [0, 29.5, 0], { seg: 4 });
  const clockTex = canvasTexture(256, 256, (x) => { x.fillStyle = '#f9f4e6'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 8; x.stroke(); x.lineCap = 'round'; x.lineWidth = 12; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(-Math.PI / 2 + (3.75 / 12) * Math.PI * 2) * 60, 128 + Math.sin(-Math.PI / 2 + (3.75 / 12) * Math.PI * 2) * 60); x.stroke(); x.lineWidth = 7; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(-Math.PI / 2 + 0.75 * Math.PI * 2) * 95, 128 + Math.sin(-Math.PI / 2 + 0.75 * Math.PI * 2) * 95); x.stroke(); });
  const clock = new THREE.Mesh(new THREE.CircleGeometry(1.2, 32), new THREE.MeshBasicMaterial({ map: clockTex })); clock.position.set(0, 25, 1.52); court.add(clock);
  const cs = sign('MAHKAMAH GRADING', 7, 1, { bg: '#e6dccb', color: '#5a0f1a', border: false, font: 'Playfair Display, serif' }); cs.position.set(0, 16.5, 4.05); court.add(cs);
  // checklist (hologram arsitek)
  const holoK = (side) => {
    const h = holo(3.4, 2.2, (x, W, H, t) => {
      x.fillStyle = '#1b2a6b'; x.fillRect(0, 0, W, H); x.fillStyle = '#5ac85a'; x.fillRect(0, H - 120, W, 120);
      x.fillStyle = '#c9a46a'; for (let i = 0; i < 5; i++) { const bx = ((i * 260 - t * 160) % (W + 300) + W + 300) % (W + 300) - 150; x.fillRect(bx, H - 200, 120, 80); }
      const jy = H - 230 - Math.abs(Math.sin(t * 3)) * 120; x.fillStyle = '#a8693a'; x.fillRect(W / 2 - 40, jy - 80, 80, 80); x.fillStyle = '#f1c9a5'; x.fillRect(W / 2 - 30, jy - 140, 60, 60); x.fillStyle = '#7a4a28'; x.fillRect(W / 2 - 46, jy - 140, 16, 40); x.fillRect(W / 2 + 30, jy - 140, 16, 40);
      x.fillStyle = '#ffd66b'; for (let i = 0; i < 4; i++) { const cx = ((i * 230 + 100 - t * 160) % (W + 200) + W + 200) % (W + 200) - 100; x.beginPath(); x.arc(cx, H - 330, 24, 0, 7); x.fill(); txt(x, 'DIPA', cx, H - 330, 16, '#6b4a00', 900); }
      txt(x, 'GAME EDUKASI: PETUALANGAN ANGGARAN', W / 2, 50, 38, '#ffffff', 900); txt(x, 'SKOR ' + String(Math.floor(t * 37) % 10000).padStart(5, '0'), W - 160, 100, 30, '#ffd66b', 900);
    }, { color: '#ffd66b' });
    h.children[0].material.blending = THREE.NormalBlending;
    return holoPos(h, side, 2.1, -1.4, 1.5);
  };
  const holoA = (side) => {
    const h = holo(3.4, 2.4, (x, W, H, t, st) => {
      txt(x, 'STANDAR DESAIN PEMBELAJARAN KEMENKEU', W / 2, 46, 36, '#ffffff');
      ['Tujuan belajar jelas', 'Bisa diakses semua pegawai, termasuk penyandang disabilitas', 'Berjalan di semua LMS', 'Lolos reviu mutu'].forEach((s, i) => {
        const y = 140 + i * 105; const on = (t * 1.2) > i * 0.7; x.strokeStyle = on ? '#4dff88' : '#7fdcff'; x.lineWidth = 4; x.strokeRect(80, y - 34, 68, 68);
        if (on) txt(x, '✔', 114, y, 52, '#4dff88', 900); txt(x, s, 180, y, 32, '#dff6ff', 700, 'left');
      });
      if (st >= 1) { x.save(); x.translate(W - 200, H - 90); x.rotate(-0.15); x.strokeStyle = '#ff5a5a'; x.lineWidth = 8; x.strokeRect(-170, -45, 340, 90); txt(x, 'SESUAI STANDAR', 0, 0, 40, '#ff7a7a', 900); x.restore(); }
    });
    return holoPos(h, side, 2.2, -1.6, 1.6);
  };
  return {
    g, bg: new THREE.Color('#2b2a5a'), fog: new THREE.Fog('#d98a6a', 30, 110), holoK, holoA, court, clock,
    async intro(bram) {
      E.cut([-1.6, 1.7, 7.6], [-4.6, 1.2, 3.6]);
      bram.root.position.set(-5.5, 0, 4.2); bram.faceTo(-5.5, 8);
      audio.sfx('stairs', 0.8); await E.wait(0.7);
      await E.tween(0.35, e => dr.rotation.y = -e * 1.6); audio.sfx('whoosh', 0.6);
      await bram.walkTo(-3.2, 3.2, 1.6, true);
      // tersandung bean bag
      audio.sfx('trip', 0.9); bram.root.position.y = 0;
      E.camTo([-0.6, 1.2, 5.2], [-2.2, 0.5, 2.4], 0.6);
      await E.tween(0.45, e => { bram.root.rotation.x = e * 1.35; bram.root.position.set(-3.2 + e * 0.9, e * 0.25, 3.2 - e * 0.7); }, easeIn);
      audio.sfx('pop', 0.8); E.shake(0.05, 0.3);
      await E.tween(0.25, e => { bag.scale.set(1.25 + e * 0.1, 0.5 - e * 0.12, 1.25 + e * 0.1); });
      await E.wait(0.7);
      await E.tween(0.5, e => { bram.root.rotation.x = 1.35 * (1 - e); bram.root.position.y = 0.25 * (1 - e); bag.scale.set(1.35 - e * 0.1, 0.38 + e * 0.12, 1.35 - e * 0.1); });
      bram.root.rotation.x = 0; bram.gesture('shrug', 1.2); await E.wait(0.5);
      E.camTo([0.8, 1.8, 6.4], [0, 1.2, 0.5], 1.2);
      await bram.walkTo(...SPOT.bram, 1.6); bram.faceTo(0, -2);
    },
    tick(dt, t) { ribs.rotation.y = 0; },
  };
}

export const FLOOR_SETS = { lobby, studio, immersive, data: dataRoom, ailab: aiLab, warehouse, rooftop };
export { glow };
