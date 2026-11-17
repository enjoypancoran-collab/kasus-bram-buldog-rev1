// Ruang APTPI (prolog), eksterior gedung, dan ruang sidang.
import { E, THREE, toon, sign, canvasTexture, txt, easeOut, easeIn, easeInOut, linear, confetti } from './engine.js';
import { B, C, S, room, lights, floorTex, woodTex, glow } from './sets.js';
import { Character } from './characters.js';
import { makeChar } from './glbchar.js';
import { audio } from './audio.js';

// =====================================================================
// Ruang Rapat APTPI
// =====================================================================
export function aptpi() {
  const g = room({ w: 10, d: 8, h: 3.6, floorMat: toon('#ffffff', { map: woodTex('#9a7350', '#7f5c3e', 5) }), wall: '#e9e1d2', trim: '#6b4a2f', hemi: 1.15 });
  // papan tulis
  const wbTex = canvasTexture(1024, 512, (x, W, H) => {
    x.fillStyle = '#fbfbf8'; x.fillRect(0, 0, W, H);
    x.strokeStyle = '#d33'; x.lineWidth = 9; for (let k = 0; k < 4; k++) { x.beginPath(); x.ellipse(W / 2, H / 2, 300 + k * 18, 120 + k * 12, k * 0.05, 0, 7); x.stroke(); }
    x.fillStyle = '#1b3a8a'; x.font = '900 130px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('GRADING 12?!', W / 2, H / 2);
    x.font = '700 40px Inter'; x.fillStyle = '#333'; x.fillText('naik?? naik?? NAIK!!', W / 2, H - 50);
  });
  const wb = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), toon('#ffffff', { map: wbTex })); wb.position.set(-1.2, 1.8, -3.95); g.add(wb);
  B(g, 3.3, 1.7, 0.05, '#bbb', [-1.2, 1.8, -3.99]);
  // meja + kursi
  B(g, 3.0, 0.08, 1.4, '#6b4a2f', [0.6, 0.76, -1.2]); for (const [x, z] of [[-0.8, -1.8], [2, -1.8], [-0.8, -0.6], [2, -0.6]]) B(g, 0.08, 0.76, 0.08, '#4a3220', [x, 0.38, z]);
  for (let i = 0; i < 3; i++) { const ch = new THREE.Group(); ch.position.set(-0.4 + i * 1.0, 0, -2.2); g.add(ch); B(ch, 0.5, 0.06, 0.5, '#2f3a4a', [0, 0.48, 0]); B(ch, 0.5, 0.6, 0.06, '#2f3a4a', [0, 0.8, -0.22]); }
  // jendela + gedung mahkamah di kejauhan
  const winTex = canvasTexture(512, 512, (x, W, H) => {
    const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#8cc6ff'); gr.addColorStop(1, '#e8f4ff'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    x.fillStyle = '#d9cdb8'; x.fillRect(150, 220, 220, 292); x.fillRect(225, 90, 70, 140); x.fillStyle = '#7a1b26'; x.beginPath(); x.moveTo(215, 92); x.lineTo(305, 92); x.lineTo(260, 40); x.fill();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(260, 140, 24, 0, 7); x.fill();
    x.fillStyle = '#b9ad98'; for (let k = 0; k < 6; k++) x.fillRect(165 + k * 34, 300, 14, 212);
  });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.8), new THREE.MeshBasicMaterial({ map: winTex })); win.position.set(3.0, 1.9, -3.95); g.add(win);
  for (const [w, h, x, y] of [[2.4, 0.1, 3.0, 2.85], [2.4, 0.1, 3.0, 0.95], [0.1, 2, 1.85, 1.9], [0.1, 2, 4.15, 1.9], [0.08, 2, 3.0, 1.9]]) B(g, w, h, 0.08, '#f4f1ea', [x, y, -3.9]);
  // jam dinding 08.00
  const clk = canvasTexture(256, 256, (x) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(128, 128, 118, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 10; x.stroke(); x.lineCap = 'round'; x.lineWidth = 12; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + Math.cos(-Math.PI / 2 + 8 / 12 * Math.PI * 2) * 55, 128 + Math.sin(-Math.PI / 2 + 8 / 12 * Math.PI * 2) * 55); x.stroke(); x.lineWidth = 7; x.beginPath(); x.moveTo(128, 128); x.lineTo(128, 40); x.stroke(); });
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.35, 32), new THREE.MeshBasicMaterial({ map: clk })); clock.position.set(1.2, 2.9, -3.95); g.add(clock);
  const logo = sign('APTPI Kemenkeu', 1.6, 0.4, { bg: '#22335e', color: '#f6d98a', border: '#e8b84a' }); logo.position.set(1.2, 2.35, -3.94); g.add(logo);
  // pintu
  const door = new THREE.Group(); door.position.set(-4.1, 0, 1.4); door.rotation.y = Math.PI / 2; g.add(door);
  const dl = new THREE.Group(); dl.position.set(-0.5, 0, 0); door.add(dl); B(dl, 1.0, 2.2, 0.06, '#6b4a2f', [0.5, 1.1, 0]);
  const flash = new THREE.PointLight('#cfe6ff', 0, 30); flash.position.set(3, 3, -3); g.add(flash);
  // map (berkas) di meja
  const map = B(g, 0.35, 0.03, 0.26, '#c9a35a', [0.4, 0.82, -1.0]);
  return {
    g, bg: new THREE.Color('#e9e1d2'),
    door: dl, map,
    async thunder() { audio.sfx('thunder', 0.9); for (let k = 0; k < 3; k++) { flash.intensity = 60; await E.wait(0.07); flash.intensity = 0; await E.wait(0.09); } E.shake(0.06, 0.5); },
  };
}

// =====================================================================
// Eksterior: Menara Pembelajaran — jembatan — Mahkamah Grading
// =====================================================================
export function exterior() {
  const g = new THREE.Group();
  lights(g, { sky: '#cfe6ff', ground: '#6a6a5a', hemi: 1.2, key: 2.2, keyPos: [8, 14, 10] });
  const skyTex = canvasTexture(16, 256, (x, W, H) => { const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5aa0e8'); gr.addColorStop(1, '#dff0ff'); x.fillStyle = gr; x.fillRect(0, 0, W, H); });
  g.add(new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide, fog: false })));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), toon('#6f6f68')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; g.add(ground);
  B(g, 60, 0.02, 8, '#3a3a3e', [0, 0.01, 6], { cast: false });
  for (let i = -6; i <= 6; i++) B(g, 1.6, 0.03, 0.2, '#f4f4f4', [i * 4, 0.03, 6], { cast: false });
  B(g, 60, 0.15, 3, '#b5ada0', [0, 0.07, 1.2]);
  // Menara Pembelajaran (7 lantai)
  const tower = new THREE.Group(); tower.position.set(-6, 0, -6); g.add(tower);
  const fh = 3.2;
  for (let f = 0; f < 5; f++) {
    B(tower, 10, fh - 0.25, 9, '#dfe6ee', [0, f * fh + fh / 2, 0]);
    B(tower, 10.3, 0.25, 9.3, '#9aa6b5', [0, (f + 1) * fh - 0.12, 0]);
    for (let k = 0; k < 5; k++) B(tower, 1.4, fh * 0.6, 0.05, '#5aa8e8', [-4 + k * 2, f * fh + fh / 2, 4.53], { m: { emissive: '#103050' }, cast: false });
  }
  const tsign = sign('PUSDIKLAT', 6, 0.8, { bg: '#22335e', color: '#f6d98a', border: '#e8b84a' }); tsign.position.set(0, 3.0, 4.6); tower.add(tsign);
  B(tower, 3, 2.4, 0.1, '#2a3a4a', [0, 1.2, 4.55]);
  // Mahkamah
  const court = new THREE.Group(); court.position.set(16, 0, -8); g.add(court);
  B(court, 12, 20, 10, '#eae1cf', [0, 10, 0]);
  for (let k = 0; k < 7; k++) C(court, 0.45, 0.45, 9, '#f6efe0', [-4.5 + k * 1.5, 4.5, 5.4]);
  B(court, 12.4, 1.2, 1.4, '#e0d5bf', [0, 9.6, 5.3]);
  const pedi = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 7, 2.6, 3), toon('#e0d5bf')); pedi.rotation.set(Math.PI / 2, 0, Math.PI / 2); pedi.scale.set(1, 0.18, 1); pedi.position.set(0, 11, 5.4); court.add(pedi);
  B(court, 4, 12, 4, '#eae1cf', [0, 26, 0]); C(court, 2.9, 0.1, 4, '#7a1b26', [0, 34, 0], { seg: 4 });
  const clkTex = canvasTexture(256, 256, (x) => { x.fillStyle = '#f9f4e6'; x.beginPath(); x.arc(128, 128, 120, 0, 7); x.fill(); x.strokeStyle = '#222'; x.lineWidth = 8; x.stroke(); x.lineCap = 'round'; x.lineWidth = 12; x.beginPath(); x.moveTo(128, 128); x.lineTo(128 + 58, 128); x.stroke(); x.lineWidth = 7; x.beginPath(); x.moveTo(128, 128); x.lineTo(128, 32); x.stroke(); });
  const clock = new THREE.Mesh(new THREE.CircleGeometry(1.5, 32), new THREE.MeshBasicMaterial({ map: clkTex })); clock.position.set(0, 28, 2.02); court.add(clock);
  const csign = sign('MAHKAMAH GRADING', 8, 1.1, { bg: '#eae1cf', color: '#5a0f1a', border: false, font: 'Playfair Display, serif' }); csign.position.set(0, 11.2, 6.1); court.add(csign);
  B(court, 3, 4, 0.1, '#4a2a1a', [0, 2, 5.05]);
  // jembatan penyeberangan di lantai 7
  const bridgeY = 4 * fh + 0.1;
  const bridge = new THREE.Group(); g.add(bridge);
  B(bridge, 12, 0.3, 2.4, '#9aa6b5', [5, bridgeY, -6]);
  for (const sz of [-1, 1]) B(bridge, 12, 1.1, 0.06, '#bfe6ff', [5, bridgeY + 0.7, -6 + sz * 1.2], { m: { transparent: true, opacity: 0.3 }, cast: false });
  B(bridge, 12, 0.08, 2.5, '#9aa6b5', [5, bridgeY + 2.6, -6]);
  // pohon & mobil
  for (let i = 0; i < 8; i++) { C(g, 0.15, 0.2, 1.6, '#6b4a2f', [-20 + i * 6, 0.8, 2.6]); S(g, 1.1, '#3f8a4a', [-20 + i * 6, 2.2, 2.6]); }
  const cars = [];
  for (let i = 0; i < 4; i++) { const car = new THREE.Group(); car.position.set(-25 + i * 14, 0, i % 2 ? 4.8 : 7.2); g.add(car); B(car, 3.6, 0.9, 1.7, ['#d9443a', '#2f8fd8', '#f0c040', '#ffffff'][i], [0, 0.65, 0]); B(car, 2.0, 0.7, 1.5, '#cfe6ff', [-0.2, 1.4, 0]); for (const [x, z] of [[-1.2, -0.85], [1.2, -0.85], [-1.2, 0.85], [1.2, 0.85]]) C(car, 0.35, 0.35, 0.25, '#111', [x, 0.35, z], { rot: [Math.PI / 2, 0, 0] }); car.userData.dir = i % 2 ? -1 : 1; cars.push(car); }
  return {
    g, bg: new THREE.Color('#9cc8f0'), fog: new THREE.Fog('#cfe6ff', 60, 160), bridgeY, court, tower,
    tick(dt) { for (const c of cars) { c.position.x += c.userData.dir * dt * 7; if (c.position.x > 35) c.position.x = -35; if (c.position.x < -35) c.position.x = 35; c.rotation.y = c.userData.dir > 0 ? 0 : Math.PI; } },
  };
}

// =====================================================================
// Ruang Sidang Mahkamah Grading
// =====================================================================
export function courtroom() {
  const g = room({ w: 22, d: 22, h: 14, floorMat: toon('#ffffff', { map: woodTex('#6b3f24', '#53301b', 8) }), wall: '#b8a68a', ceil: '#7a6648', hemi: 0.9, key: 1.6, keyPos: [-6, 12, 8], keyC: '#ffe2b0' });
  g.userData.key.shadow.camera.left = g.userData.key.shadow.camera.bottom = -14; g.userData.key.shadow.camera.right = g.userData.key.shadow.camera.top = 14;
  // pilar
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) C(g, 0.6, 0.7, 14, '#cbb894', [sx * 10, 7, -9 + k * 6]);
  // jendela kaca patri
  const stained = [];
  for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) {
    const t = canvasTexture(256, 512, (x, W, H) => { const cols = ['#c0392b', '#2980b9', '#f1c40f', '#27ae60', '#8e44ad']; for (let i = 0; i < 8; i++) for (let j = 0; j < 16; j++) { x.fillStyle = cols[(i * 3 + j * 7 + k) % 5]; x.fillRect(i * 32, j * 32, 31, 31); } x.strokeStyle = '#111'; x.lineWidth = 8; for (let r = 0; r < 4; r++) { x.beginPath(); x.moveTo(128, 60 + r * 100); x.lineTo(208, 110 + r * 100); x.lineTo(128, 160 + r * 100); x.lineTo(48, 110 + r * 100); x.closePath(); x.stroke(); } });
    const w = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 6), new THREE.MeshBasicMaterial({ map: t })); w.position.set(sx * 10.95, 7.5, -7 + k * 6); w.rotation.y = -sx * Math.PI / 2; g.add(w); stained.push(w);
  }
  // cahaya miring berdebu
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.6, 14, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe8b0', transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
  shaft.position.set(-6, 6, -3); shaft.rotation.z = -0.5; g.add(shaft);
  // mimbar raksasa
  const bench = new THREE.Group(); bench.position.set(0, 0, -7.5); g.add(bench);
  const wood = toon('#ffffff', { map: woodTex('#4a2a17', '#36200f', 3) });
  B(bench, 7, 7, 3, null, [0, 3.5, 0], { mat: wood });
  B(bench, 7.6, 0.4, 3.4, '#2e1a0c', [0, 7.2, 0]);
  B(bench, 5, 2.6, 0.2, '#5a0f1a', [0, 3.6, 1.55]);
  const seal = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), toon('#e8b84a', { emissive: '#4a3000' })); seal.position.set(0, 4.0, 1.67); bench.add(seal);
  const sealT = sign('⚖', 1.2, 1.2, { bg: 'rgba(0,0,0,0)', color: '#5a0f1a', border: false, size: 180, basic: true, transparent: true }); sealT.position.set(0, 4.0, 1.68); bench.add(sealT);
  for (const sx of [-1, 1]) for (let k = 0; k < 12; k++) B(bench, 1.2, 0.25, 0.5, '#3a2210', [sx * 4.3, 0.125 + k * 0.58, 1.3 - k * 0.22]);
  const hakimSeat = new THREE.Group(); hakimSeat.position.set(0, 7.4, -0.6); bench.add(hakimSeat);
  B(hakimSeat, 2.4, 3.6, 0.4, '#5a0f1a', [0, 1.6, -0.6]);
  // timbangan raksasa di samping mimbar
  const scale = new THREE.Group(); scale.position.set(-6, 0, -6.5); g.add(scale);
  const brass = toon('#d4a845', { emissive: '#3a2a00' });
  C(scale, 0.25, 0.6, 7, null, [0, 3.5, 0], { mat: brass }); const beam = new THREE.Group(); beam.position.y = 7; scale.add(beam);
  B(beam, 4.4, 0.18, 0.18, null, [0, 0, 0], { mat: brass });
  for (const sx of [-1, 1]) { const pan = new THREE.Group(); pan.position.set(sx * 2.1, 0, 0); beam.add(pan); C(pan, 0.02, 0.02, 1.6, '#555', [0, -0.8, 0]); C(pan, 0.8, 0.5, 0.15, null, [0, -1.6, 0], { mat: brass }); pan.userData.side = sx; }
  // Meteran Putusan di dinding belakang
  const meterTex = canvasTexture(1024, 600, () => {});
  const meter = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.5), new THREE.MeshBasicMaterial({ map: meterTex, transparent: true }));
  meter.position.set(6.6, 8.6, -10.6); meter.rotation.y = -0.22; g.add(meter);
  let needle = 0, needleT = 0, zoneLit = -1;
  const ZONES = [[0, 1.5, '#d9443a', 'LEVEL PRODUKSI'], [1.5, 2.5, '#e3b13b', 'BELUM CUKUP'], [2.5, 4.5, '#3fbf6f', 'SEIMBANG'], [4.5, 5, '#d9443a', 'KERTAS']];
  const drawMeter = () => {
    const x = meterTex.userData.ctx, W = 1024, H = 600, cx = W / 2, cy = 520, R = 420;
    x.clearRect(0, 0, W, H); x.fillStyle = 'rgba(30,14,10,0.92)'; x.beginPath(); x.roundRect(10, 10, W - 20, H - 20, 40); x.fill(); x.strokeStyle = '#e8b84a'; x.lineWidth = 10; x.stroke();
    txt(x, 'METERAN PUTUSAN', cx, 60, 50, '#f6d98a', 900);
    ZONES.forEach(([a, b, col, lab], i) => {
      const a0 = Math.PI + (a / 5) * Math.PI, a1 = Math.PI + (b / 5) * Math.PI;
      x.strokeStyle = col; x.globalAlpha = zoneLit === i ? 1 : 0.55; x.lineWidth = zoneLit === i ? 90 : 70; x.beginPath(); x.arc(cx, cy, R - 40, a0, a1); x.stroke(); x.globalAlpha = 1;
      const am = (a0 + a1) / 2; x.save(); x.translate(cx + Math.cos(am) * (R - 140), cy + Math.sin(am) * (R - 140)); x.rotate(am + Math.PI / 2); txt(x, lab, 0, 0, 28, '#ffffff', 900); x.restore();
    });
    for (let k = 0; k <= 5; k++) { const a = Math.PI + k / 5 * Math.PI; x.strokeStyle = '#fff'; x.lineWidth = 6; x.beginPath(); x.moveTo(cx + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2)); x.lineTo(cx + Math.cos(a) * (R + 30), cy + Math.sin(a) * (R + 30)); x.stroke(); }
    const an = Math.PI + (needle / 5) * Math.PI;
    x.strokeStyle = '#111'; x.lineWidth = 22; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(an) * (R - 20), cy + Math.sin(an) * (R - 20)); x.stroke();
    x.strokeStyle = '#f6d98a'; x.lineWidth = 12; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(an) * (R - 20), cy + Math.sin(an) * (R - 20)); x.stroke();
    x.fillStyle = '#e8b84a'; x.beginPath(); x.arc(cx, cy, 34, 0, 7); x.fill();
    meterTex.needsUpdate = true;
  };
  drawMeter();
  // lampu gantung
  const chand = new THREE.Group(); chand.position.set(0, 12.5, -1); g.add(chand);
  C(chand, 0.03, 0.03, 1.5, '#333', [0, 0.75, 0]); const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 8, 32), brass); ring.rotation.x = Math.PI / 2; chand.add(ring);
  for (let k = 0; k < 10; k++) S(chand, 0.12, null, [Math.cos(k / 10 * Math.PI * 2) * 1.4, 0.15, Math.sin(k / 10 * Math.PI * 2) * 1.4], { mat: glow('#fff1c4') });
  const cl = new THREE.PointLight('#ffe2b0', 40, 25); cl.position.set(0, 11, -1); g.add(cl);
  // meja pembela
  B(g, 2.6, 0.9, 1.0, null, [0, 0.45, 1.0], { mat: wood }); B(g, 2.8, 0.08, 1.15, '#2e1a0c', [0, 0.93, 1.0]);
  // pintu belakang
  const doors = [];
  for (const sx of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(sx * 1.6, 0, 10.9); g.add(piv); B(piv, 1.6, 4, 0.15, '#4a2a17', [-sx * 0.8, 2, 0]); doors.push(piv); }
  // bangku pengunjung + kerumunan PTP
  const crowd = [];
  const ids = ['rudi', 'maria', 'kevin', 'siti', 'fajar', 'ratna', 'nanda', 'yosef', 'bayu', 'lestari'];
  const signs = [];
  for (let row = 0; row < 2; row++) for (const sx of [-1, 1]) {
    B(g, 6, 0.5, 0.6, null, [sx * 5.2, 0.25, 3.6 + row * 2.2], { mat: wood }); B(g, 6, 0.9, 0.12, null, [sx * 5.2, 0.75, 3.95 + row * 2.2], { mat: wood });
  }
  ids.forEach((id, i) => {
    const row = i < 5 ? 0 : 1, k = i % 5, sx = k < 2 ? -1 : 1, kk = k < 2 ? k : k - 2;
    const c = makeChar(id, { lite: true, prop: null }); c.root.position.set(sx * (3.2 + kk * 1.25), 0, 3.4 + row * 2.2); c.root.scale.setScalar(0.88); c.root.rotation.y = Math.PI; g.add(c.root); crowd.push(c);
    if (i % 3 === 0) { const s = sign(i % 2 ? 'KAMI BUKAN\nTUKANG KONTEN' : 'NAIKKAN\nGRADING KAMI!', 1.1, 0.6, { bg: '#fff8e6', color: '#7a1b26' }); s.rotation.y = Math.PI; s.position.set(0, c.legLen + 1.35, -0.05); c.root.add(s); signs.push(s); }
  });
  return {
    g, bg: new THREE.Color('#2a1d14'), bench, hakimSeat, scale, beam, meter, crowd, signs, doors, chand, stained,
    setNeedle(v) { const from = needle; return E.tween(0.8, e => { needle = from + (v - from) * e + Math.sin(e * Math.PI * 3) * 0.12 * (1 - e); drawMeter(); }, easeOut); },
    wobble() { const from = needle; return E.tween(0.6, e => { needle = from + Math.sin(e * Math.PI * 4) * 0.15 * (1 - e); drawMeter(); }); },
    lightZone(i) { zoneLit = i; drawMeter(); },
    resetMeter() { needle = 0; zoneLit = -1; drawMeter(); },
    tick(dt, t) { chand.rotation.z = Math.sin(t * 1.3) * (g.userData.sway || 0); g.userData.sway = Math.max(0, (g.userData.sway || 0) - dt * 0.05); beam.rotation.z = Math.sin(t * 0.8) * 0.02 + (g.userData.tilt || 0); crowd.forEach((c, i) => c.update(dt)); },
  };
}
