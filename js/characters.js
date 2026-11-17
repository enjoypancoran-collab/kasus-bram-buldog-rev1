// Tokoh kartun 3D prosedural dengan animasi sederhana.
import * as THREE from 'three';

// ---------- material & util ----------
const grad = (() => {
  const d = new Uint8Array([90, 170, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
const matCache = new Map();
export function toon(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!opts.map && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: grad, ...opts });
  if (!opts.map) matCache.set(key, m);
  return m;
}
const OUTLINE = new THREE.MeshBasicMaterial({ color: 0x1a1410, side: THREE.BackSide });
const geoCache = new Map();
function g(key, make) { if (!geoCache.has(key)) geoCache.set(key, make()); return geoCache.get(key); }
const sph = (r, ws = 20, hs = 14) => g(`s${r}_${ws}`, () => new THREE.SphereGeometry(r, ws, hs));
const cap = (r, l) => g(`c${r}_${l}`, () => new THREE.CapsuleGeometry(r, l, 6, 14));
const box = (x, y, z) => g(`b${x}_${y}_${z}`, () => new THREE.BoxGeometry(x, y, z));
const cyl = (rt, rb, h, s = 18) => g(`y${rt}_${rb}_${h}_${s}`, () => new THREE.CylinderGeometry(rt, rb, h, s));
const tor = (r, t) => g(`t${r}_${t}`, () => new THREE.TorusGeometry(r, t, 8, 24));

function mesh(geo, mat, parent, pos = [0, 0, 0], scale = null, outline = false) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (scale) m.scale.set(...scale);
  m.castShadow = true;
  parent.add(m);
  if (outline) {
    const o = new THREE.Mesh(geo, OUTLINE);
    o.scale.setScalar(1.06);
    m.add(o);
  }
  return m;
}

// ---------- tekstur kain ----------
function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const TEX = {
  batik: () => canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#7a4a1e'; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#e0b04a'; x.lineWidth = 5;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const cx = i * 32 + 16, cy = j * 32 + 16;
      x.beginPath(); x.arc(cx, cy, 10, 0, Math.PI * 2); x.stroke();
      x.beginPath(); x.moveTo(cx - 14, cy); x.lineTo(cx + 14, cy); x.moveTo(cx, cy - 14); x.lineTo(cx, cy + 14); x.stroke();
    }
  }, [2, 2]),
  plaid: () => canvasTex(64, 64, (x, w, h) => {
    x.fillStyle = '#b3262b'; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(20,20,30,0.55)'; x.fillRect(0, 24, w, 14); x.fillRect(24, 0, 14, h);
    x.fillStyle = 'rgba(255,255,255,0.25)'; x.fillRect(0, 50, w, 3); x.fillRect(50, 0, 3, h);
  }, [3, 3]),
  ermine: () => canvasTex(64, 64, (x, w, h) => {
    x.fillStyle = '#f7f5ee'; x.fillRect(0, 0, w, h); x.fillStyle = '#111';
    for (let i = 0; i < 6; i++) { const px = (i * 23) % 60 + 4, py = (i * 37) % 56 + 4; x.fillRect(px, py, 4, 9); }
  }, [3, 2]),
  knit: () => canvasTex(32, 32, (x, w, h) => {
    x.fillStyle = '#7d8088'; x.fillRect(0, 0, w, h); x.strokeStyle = '#6a6d75'; x.lineWidth = 2;
    for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(i * 4, 0); x.lineTo(i * 4 + 2, h); x.stroke(); }
  }, [4, 4]),
  gamer: () => canvasTex(128, 128, (x, w, h) => {
    x.fillStyle = '#1b1b1f'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#e8e8e8'; x.beginPath(); x.ellipse(64, 70, 34, 18, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#1b1b1f'; x.fillRect(42, 66, 14, 4); x.fillRect(47, 61, 4, 14);
    x.beginPath(); x.arc(80, 66, 3, 0, 7); x.arc(88, 72, 3, 0, 7); x.fill();
  }),
};

// ---------- data tokoh ----------
export const PEOPLE = {
  bram:    { sex: 'm', h: 1.82, w: 1.12, skin: '#f1c9a5', hair: 'slick', hairC: '#16120f', brows: 'thick', jacket: '#a8693a', shirt: '#f3e6c8', pants: '#8f5a31', vest: '#9b6034', neck: 'bowtie', neckC: '#e0a526', ears: 'bulldog', pin: true, prop: 'briefcase', mouth: 'smirk' },
  wendi:   { sex: 'm', h: 1.75, w: 0.84, skin: '#c68a5e', hair: 'neat', hairC: '#1a1410', beard: 'short', mustache: 'thin', jacket: '#22335e', shirt: '#ffffff', pants: '#2b2b33', lanyard: true, prop: 'tablet' },
  hakim:   { sex: 'm', h: 1.8, w: 1.15, skin: '#f0cfb4', hair: 'judgeWig', hairC: '#f4f1ea', brows: 'bushyWhite', glasses: 'pince', nose: 'long', robe: '#9e1b22', trim: 'ermine', neck: 'jabot', prop: 'gavel' },
  panitera:{ sex: 'm', h: 1.5, w: 0.82, skin: '#e8c4a4', hair: 'clerkWig', hairC: '#f4f1ea', glasses: 'round', mustache: 'whiteThin', robe: '#1d1d22', prop: 'files' },
  rudi:    { sex: 'm', h: 1.68, w: 1.42, skin: '#b97d52', hair: 'buzz', hairC: '#16120f', mustache: 'thick', shirtTex: 'batik', shirt: '#7a4a1e', sleeves: 'short', pants: '#2e2e36', lanyard: true, prop: 'trophy' },
  maria:   { sex: 'f', h: 1.8, w: 0.98, skin: '#5b3a29', hair: 'curlyShort', hairC: '#120d0b', glasses: 'thin', jacket: '#6b7a3a', shirt: '#ffffff', pants: '#26262c', lanyard: true, prop: 'clipboard' },
  kevin:   { sex: 'm', h: 1.86, w: 0.78, skin: '#f2d3b3', hair: 'bangs', hairC: '#121010', hoodie: '#18181c', shirt: '#18181c', pants: '#3b5b8c', shoes: '#f5f5f5', headphones: true, lanyard: true, prop: 'clapper' },
  siti:    { sex: 'f', h: 1.6, w: 1.0, skin: '#b98256', hair: 'hijab', hairC: '#9cc7e8', glasses: 'thin', shirt: '#efe2c4', skirt: '#24305a', lanyard: true, prop: 'scroll' },
  yohana:  { sex: 'f', h: 1.62, w: 0.95, skin: '#efd2a8', hair: 'long', hairC: '#120f0d', shirt: '#ffffff', jacketTex: 'plaid', jacket: '#b3262b', pants: '#3a5684', shoes: '#f0f0f0', lanyard: true, prop: 'stick360' },
  darto:   { sex: 'm', h: 1.55, w: 1.32, skin: '#b47a4e', hair: 'bald', shirt: '#ffffff', sleeves: 'short', vestTex: 'knit', vest: '#7d8088', pants: '#6b4a2f', pencil: true, lanyard: true, prop: 'scroll' },
  togar:   { sex: 'm', h: 1.9, w: 1.35, skin: '#a8704a', hair: 'curlyBig', hairC: '#120e0c', shirt: '#f08a24', sleeves: 'short', pants: '#c9b48a', watch: true, lanyard: true, prop: 'tablet', mouth: 'grin' },
  ayu:     { sex: 'f', h: 1.65, w: 0.8, skin: '#f5d9c0', hair: 'bob', hairC: '#0f0d0c', glasses: 'rimless', shirt: '#ffffff', pants: '#7b7f88', lanyard: true, prop: 'tablet' },
  fajar:   { sex: 'm', h: 1.72, w: 1.0, skin: '#ecc9a0', hair: 'sidepart', hairC: '#121010', glasses: 'thick', shirt: '#9cc4ea', sleeves: 'rolled', pants: '#30343f', lanyard: true, prop: null },
  ratna:   { sex: 'f', h: 1.58, w: 1.45, skin: '#e9c79c', hair: 'hijab', hairC: '#4b2a5c', jacket: '#7c7f86', skirt: '#3a3550', lanyard: true, prop: 'folder' },
  nanda:   { sex: 'f', h: 1.48, w: 0.82, skin: '#bf8657', hair: 'ponytail', hairC: '#120e0c', jacket: '#f5c542', shirt: '#ffffff', culottes: '#d9c7a3', shoes: '#f5f5f5', lanyard: true, prop: null, mouth: 'grin' },
  yosef:   { sex: 'm', h: 1.88, w: 0.82, skin: '#4e3426', hair: 'curlyShortGrey', hairC: '#9a9a9a', glasses: 'reading', jacket: '#6f737c', shirt: '#ffffff', pants: '#2a2a30', lanyard: true, prop: 'report' },
  bayu:    { sex: 'm', h: 1.7, w: 1.45, skin: '#b47c50', hair: 'longTied', hairC: '#120e0c', beard: 'stubble', shirtTex: 'gamer', shirt: '#1b1b1f', jacket: '#4a6d9c', pants: '#5d6640', vr: true, lanyard: true, prop: null, mouth: 'grin' },
  lestari: { sex: 'f', h: 1.64, w: 1.0, skin: '#f3d7c2', hair: 'shortSilver', hairC: '#c9c9cc', glasses: 'chain', jacket: '#a3442f', shirt: '#f3e6c8', pants: '#1f1f24', lanyard: true, prop: 'book' },
};

// ---------- pembangun tokoh ----------
export class Character {
  constructor(id, opts = {}) {
    this.id = id;
    const p = this.p = { ...PEOPLE[id], ...opts };
    this.lite = !!opts.lite;
    this.root = new THREE.Group(); this.root.name = id;
    this.body = new THREE.Group(); this.root.add(this.body);
    this.t = Math.random() * 10;
    this.state = { walk: 0, talk: false, gesture: null, gT: 0 };
    this.headYaw = 0; this.targetYaw = 0;
    this.build();
  }
  m(geo, color, parent, pos, scale, ol = !this.lite, extra) {
    const mat = typeof color === 'string' || typeof color === 'number' ? toon(color, extra) : color;
    return mesh(geo, mat, parent, pos, scale, ol);
  }
  build() {
    const p = this.p, s = p.h / 1.75, w = p.w, fem = p.sex === 'f';
    this.scale = s;
    const legLen = 0.78 * s, torsoH = 0.56 * s;
    this.legLen = legLen;
    const skin = p.skin;
    const hips = this.hips = new THREE.Group(); hips.position.y = legLen; this.body.add(hips);
    const robe = !!p.robe;
    // ---- kaki
    this.legs = [];
    for (const side of [-1, 1]) {
      const leg = new THREE.Group(); leg.position.set(side * 0.1 * w, 0, 0); hips.add(leg);
      const legC = p.culottes || p.pants || '#333';
      if (!robe && !p.skirt) {
        if (p.culottes) {
          this.m(cyl(0.085 * w, 0.12 * w, legLen * 0.55), p.culottes, leg, [0, -legLen * 0.28, 0]);
          this.m(cap(0.05, legLen * 0.4), skin, leg, [0, -legLen * 0.68, 0]);
        } else this.m(cap(0.075 * Math.min(w, 1.25), legLen - 0.12), legC, leg, [0, -legLen / 2 + 0.02, 0]);
      }
      this.m(box(0.11, 0.07, 0.24), p.shoes || '#1d1a18', leg, [0, -legLen + 0.035, 0.05]);
      this.legs.push(leg);
    }
    // ---- rok / jubah
    if (robe) {
      const r = this.m(cyl(0.2 * w, 0.36 * w, legLen + torsoH * 0.9, 20), p.robe, hips, [0, -legLen / 2 + torsoH * 0.42, 0]);
      if (p.trim === 'ermine') {
        const em = toon('#ffffff', { map: TEX.ermine() });
        mesh(cyl(0.37 * w, 0.37 * w, 0.08, 20), em, hips, [0, -legLen + 0.06, 0]);
        mesh(box(0.12, torsoH * 1.4, 0.05), em, hips, [-0.1, torsoH * 0.5, 0.21 * w]);
        mesh(box(0.12, torsoH * 1.4, 0.05), em, hips, [0.1, torsoH * 0.5, 0.21 * w]);
      }
    } else if (p.skirt) {
      this.m(cyl(0.17 * w, 0.3 * w, legLen + 0.05, 20), p.skirt, hips, [0, -legLen / 2 + 0.02, 0]);
    }
    // ---- torso
    const torso = this.torso = new THREE.Group(); torso.position.y = 0.02; hips.add(torso);
    const tw = (fem ? 0.2 : 0.22) * w, td = 0.15 * Math.max(w, 0.9);
    const shirtMat = p.shirtTex ? toon('#ffffff', { map: TEX[p.shirtTex]() }) : toon(p.shirt || '#ddd');
    const body = mesh(cap(tw, torsoH - tw), shirtMat, torso, [0, torsoH / 2, 0], [1, 1, td / tw], !this.lite);
    if (p.hoodie) {
      this.m(cap(tw * 1.03, torsoH - tw), p.hoodie, torso, [0, torsoH / 2, 0], [1, 1, td / tw]);
      this.m(tor(0.13, 0.05), p.hoodie, torso, [0, torsoH + 0.02, -0.06], [1, 1, 1]).rotation.x = Math.PI / 2.4;
    }
    const jMat = p.jacketTex ? toon('#ffffff', { map: TEX[p.jacketTex]() }) : (p.jacket ? toon(p.jacket) : null);
    if (jMat && !robe) {
      // jaket terbuka: dua panel + punggung
      for (const side of [-1, 1]) {
        const pan = mesh(box(tw * 0.78, torsoH * 0.98, td * 2.08), jMat, torso, [side * tw * 0.62, torsoH / 2, -0.005], null, !this.lite);
        pan.scale.z = 1;
      }
      mesh(box(tw * 2.1, torsoH * 0.98, td * 1.2), jMat, torso, [0, torsoH / 2, -td * 0.45], null, false);
    }
    if (p.vest || p.vestTex) {
      const vm = p.vestTex ? toon('#ffffff', { map: TEX[p.vestTex]() }) : toon(p.vest);
      mesh(cap(tw * 1.02, torsoH * 0.7 - tw), vm, torso, [0, torsoH * 0.45, 0.004], [1, 1, td / tw * 1.02], false);
    }
    if (robe) this.m(cap(tw * 1.04, torsoH - tw), p.robe, torso, [0, torsoH / 2, 0], [1, 1, td / tw * 1.04]);
    // ---- leher & aksesoris leher
    const neckY = torsoH + 0.02;
    this.m(cyl(0.05, 0.06, 0.08), skin, torso, [0, neckY, 0]);
    if (p.neck === 'bowtie') {
      const bt = new THREE.Group(); bt.position.set(0, neckY - 0.03, td + 0.01); torso.add(bt);
      this.m(g('bowL', () => new THREE.ConeGeometry(0.045, 0.08, 4)), p.neckC, bt, [-0.04, 0, 0]).rotation.z = Math.PI / 2;
      this.m(g('bowL', () => new THREE.ConeGeometry(0.045, 0.08, 4)), p.neckC, bt, [0.04, 0, 0]).rotation.z = -Math.PI / 2;
      this.m(sph(0.022), p.neckC, bt, [0, 0, 0.01]);
    }
    if (p.neck === 'jabot') {
      this.m(box(0.1, 0.16, 0.04), '#fbfbf7', torso, [0, neckY - 0.1, td + 0.02]);
      this.m(box(0.06, 0.1, 0.03), '#fbfbf7', torso, [0, neckY - 0.22, td + 0.03]);
    }
    if (p.pin) this.m(sph(0.022), '#e8c24a', torso, [-tw * 0.7, torsoH * 0.78, td + 0.04], null, false, { emissive: '#5a4300' });
    if (p.lanyard) {
      const l = mesh(tor(0.1, 0.006), toon('#1b6fd1'), torso, [0, neckY - 0.12, td * 0.85], [0.8, 1.3, 1], false);
      l.rotation.x = -0.25;
      this.m(box(0.06, 0.085, 0.01), '#ffffff', torso, [0, torsoH * 0.5, td + 0.035], null, false);
    }
    if (p.headphones) {
      const hp = mesh(tor(0.1, 0.018), toon('#2a2a2a'), torso, [0, neckY + 0.01, 0.02], null, false); hp.rotation.x = Math.PI / 2.2;
      this.m(cyl(0.04, 0.04, 0.03), '#2a2a2a', torso, [-0.1, neckY, 0.05], null, false).rotation.z = Math.PI / 2;
      this.m(cyl(0.04, 0.04, 0.03), '#2a2a2a', torso, [0.1, neckY, 0.05], null, false).rotation.z = Math.PI / 2;
    }
    // ---- lengan
    this.arms = [];
    const armLen = 0.58 * s, sleeveC = robe ? p.robe : (jMat ? null : (p.hoodie || p.shirt || '#ddd'));
    for (const side of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(side * (tw + 0.05), torsoH - 0.06, 0); torso.add(sh);
      const upper = new THREE.Group(); sh.add(upper);
      upper.rotation.z = side * 0.12;
      const armR = 0.055 * Math.min(Math.max(w, 0.85), 1.3);
      if (p.sleeves === 'short') {
        this.m(cap(armR * 1.15, armLen * 0.28), p.shirtTex ? shirtMat : (p.shirt), upper, [0, -armLen * 0.16, 0]);
        this.m(cap(armR * 0.85, armLen * 0.62), skin, upper, [0, -armLen * 0.6, 0]);
      } else if (p.sleeves === 'rolled') {
        this.m(cap(armR * 1.1, armLen * 0.5), p.shirt, upper, [0, -armLen * 0.25, 0]);
        this.m(cap(armR * 0.85, armLen * 0.42), skin, upper, [0, -armLen * 0.72, 0]);
      } else {
        const sm = sleeveC ? toon(sleeveC) : jMat;
        mesh(cap(armR * 1.1, armLen * 0.86), sm, upper, [0, -armLen * 0.45, 0], null, !this.lite);
        if (robe) this.m(cyl(armR * 1.4, armR * 2.4, 0.18), p.robe, upper, [0, -armLen * 0.8, 0]);
      }
      const hand = new THREE.Group(); hand.position.y = -armLen * 0.95; upper.add(hand);
      this.m(sph(0.05), skin, hand, [0, 0, 0]);
      if (p.watch && side === -1) this.m(cyl(0.055, 0.055, 0.03), '#222', upper, [0, -armLen * 0.86, 0], null, false);
      this.arms.push({ sh, upper, hand, side });
    }
    // ---- kepala
    const head = this.head = new THREE.Group(); head.position.y = neckY + 0.17; torso.add(head);
    const hr = 0.165;
    this.m(sph(hr, 24, 18), skin, head, [0, 0, 0], [0.95, 1.06, 1]);
    if (p.hair !== 'hijab') {
      this.m(sph(0.04), skin, head, [-hr * 0.98, -0.01, 0], [0.6, 1, 1]);
      this.m(sph(0.04), skin, head, [hr * 0.98, -0.01, 0], [0.6, 1, 1]);
    }
    // wajah
    const eyeY = 0.02, eyeX = 0.058, fz = hr * 0.9;
    this.eyes = [];
    for (const sx of [-1, 1]) {
      const e = this.m(sph(0.028), '#ffffff', head, [sx * eyeX, eyeY, fz], [1, 1.15, 0.6], false);
      const pu = this.m(sph(0.016), '#1b1612', head, [sx * eyeX, eyeY - 0.003, fz + 0.016], [1, 1.1, 0.6], false);
      this.eyes.push(e, pu);
    }
    const browC = p.brows === 'bushyWhite' ? '#f2f2f2' : (p.hairC && p.hair !== 'hijab' && p.hair !== 'bald' ? p.hairC : '#2a1d16');
    const bt = p.brows === 'thick' || p.brows === 'bushyWhite' ? 0.018 : 0.011;
    this.brows = [];
    for (const sx of [-1, 1]) {
      const b = this.m(box(0.055, bt, 0.015), browC, head, [sx * eyeX, eyeY + 0.052, fz + 0.012], null, false);
      b.rotation.z = sx * -0.08; this.brows.push(b);
    }
    this.m(sph(p.nose === 'long' ? 0.028 : 0.022), skin, head, [0, -0.025, fz + 0.03], p.nose === 'long' ? [0.8, 0.9, 1.9] : [1, 0.9, 1], false);
    this.mouth = this.m(sph(0.03), '#5a2620', head, [0, -0.075, fz - 0.004], [1.2, p.mouth === 'grin' ? 0.45 : 0.25, 0.5], false);
    if (p.mouth === 'smirk') this.mouth.rotation.z = 0.15;
    // rambut
    this.buildHair(head, hr, p);
    const jaw = g('jaw', () => new THREE.SphereGeometry(hr * 1.02, 22, 12, 0, Math.PI * 2, Math.PI * 0.66, Math.PI * 0.34));
    if (p.beard === 'short') this.m(jaw, p.hairC, head, [0, 0.0, 0.006], [0.97, 1.02, 1.0], false);
    if (p.beard === 'stubble') this.m(jaw, '#3b2c22', head, [0, 0.0, 0.004], [0.965, 1.0, 0.99], false, { transparent: true, opacity: 0.45 });
    if (p.beard) { this.mouth.position.y += 0.005; this.mouth.position.z += 0.02; }
    if (p.mustache) {
      const mc = p.mustache === 'whiteThin' ? '#f2f2f2' : (p.hairC || '#1a1410');
      const th = p.mustache === 'thick' ? 0.022 : 0.012;
      for (const sx of [-1, 1]) this.m(box(0.05, th, 0.02), mc, head, [sx * 0.024, -0.052, fz + 0.022], null, false).rotation.z = sx * 0.18;
    }
    // kacamata
    if (p.glasses) this.buildGlasses(head, p.glasses, fz, eyeX, eyeY);
    if (p.ears === 'bulldog') {
      this.m(tor(hr * 1.02, 0.012), '#2a2a2a', head, [0, 0.03, -0.01], null, false).rotation.y = Math.PI / 2;
      this.ears = [];
      for (const sx of [-1, 1]) {
        const ear = new THREE.Group(); ear.position.set(sx * hr * 0.82, hr * 0.78, 0); head.add(ear);
        this.m(sph(0.07), '#7a4a28', ear, [sx * 0.03, -0.085, 0], [0.5, 1.45, 0.95]);
        this.m(sph(0.05), '#c58b63', ear, [sx * 0.04, -0.085, 0.025], [0.35, 1.15, 0.6], false);
        ear.rotation.z = sx * 0.45; this.ears.push(ear);
      }
    }
    if (p.vr) {
      this.m(box(0.24, 0.1, 0.12), '#2b2f38', head, [0, hr * 0.85, 0.08], null, true).rotation.x = -0.3;
      this.m(box(0.2, 0.04, 0.01), '#58d0ff', head, [0, hr * 0.82, 0.145], null, false, { emissive: '#1a6080' }).rotation.x = -0.3;
    }
    if (p.pencil) this.m(cyl(0.008, 0.008, 0.16, 6), '#f2c230', head, [hr * 1.05, 0.04, 0.02], null, false).rotation.z = 1.2;
    // prop
    this.props = {};
    if (p.prop) this.hold(p.prop);
    this.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  }
  buildHair(head, hr, p) {
    const c = p.hairC, H = (geo, pos, sc, ol = true) => this.m(geo, c, head, pos, sc, ol && !this.lite);
    const capTop = (k = 1.08, y = 0.03, sy = 0.95) => H(g(`hc${k}`, () => new THREE.SphereGeometry(hr * k, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.42)), [0, y, -0.01], [1, sy, 1]);
    switch (p.hair) {
      case 'slick': capTop(1.08, 0.025, 1.0); H(sph(hr * 0.9), [0, 0.02, -0.07], [1.05, 0.95, 0.9]); H(sph(0.06), [0, hr * 0.95, 0.06], [1.6, 0.7, 1]); break;
      case 'neat': capTop(1.07, 0.03); H(sph(0.05), [-0.05, hr * 0.98, 0.07], [1.8, 0.6, 1]); break;
      case 'buzz': capTop(1.03, 0.02, 0.9); break;
      case 'sidepart': capTop(1.08, 0.03); H(sph(0.06), [0.04, hr * 0.95, 0.06], [1.8, 0.7, 1]); break;
      case 'bangs': capTop(1.1, 0.03); H(box(0.24, 0.07, 0.06), [0, 0.1, hr * 0.85], null); break;
      case 'bob': capTop(1.1, 0.03); H(cyl(hr * 1.12, hr * 1.18, 0.2, 20), [0, -0.04, -0.02], [1, 1, 1]); H(box(0.26, 0.06, 0.05), [0, 0.11, hr * 0.88]); break;
      case 'long': capTop(1.09, 0.03); H(box(0.3, 0.75, 0.1), [0, -0.3, -0.11]); for (const sx of [-1, 1]) H(box(0.05, 0.4, 0.08), [sx * hr * 1.0, -0.12, 0.02]); break;
      case 'ponytail': capTop(1.07, 0.03); H(sph(0.05), [0, hr * 0.85, -hr * 0.6]); this.pony = H(cap(0.045, 0.2), [0, hr * 0.55, -hr * 1.05]); this.pony.rotation.x = 0.4; break;
      case 'longTied': capTop(1.08, 0.03); this.pony = H(cap(0.05, 0.32), [0, -0.05, -hr * 1.05]); this.pony.rotation.x = 0.25; break;
      case 'curlyBig': for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2, r = (i % 2 ? 0.95 : 0.8) * hr, yy = 0.07 + ((i * 7) % 5) * 0.025; H(sph(0.07, 10, 8), [Math.cos(a) * r, yy, Math.sin(a) * r - 0.02], null, false); } H(sph(hr * 1.1), [0, 0.1, -0.02], [1.05, 0.75, 1]); break;
      case 'curlyShort': case 'curlyShortGrey': for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; H(sph(0.045, 10, 8), [Math.cos(a) * hr * 0.85, 0.09 + (i % 3) * 0.015, Math.sin(a) * hr * 0.85 - 0.02], null, false); } capTop(1.08, 0.04); break;
      case 'shortSilver': capTop(1.1, 0.03); H(sph(hr * 0.95), [0, 0.0, -0.05], [1.08, 0.9, 0.95]); H(sph(0.06), [-0.06, hr * 0.92, 0.07], [1.7, 0.6, 1]); break;
      case 'hijab': {
        const hm = toon(c);
        mesh(g('hij', () => new THREE.SphereGeometry(hr * 1.14, 24, 16, Math.PI * 0.72, Math.PI * 1.56, 0, Math.PI)), hm, head, [0, 0.01, -0.005], [1, 1.04, 1.02], !this.lite);
        mesh(g('hijDrape', () => new THREE.ConeGeometry(0.29, 0.34, 22, 1, true)), hm, head, [0, -0.25, -0.02], [1, 1, 0.82], !this.lite).material.side = THREE.DoubleSide;
        break;
      }
      case 'judgeWig': {
        capTop(1.2, 0.05, 1.05); H(sph(hr * 1.12), [0, 0.0, -0.075], [1.08, 1.0, 1.0]);
        for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) H(sph(0.07, 12, 10), [sx * (hr * 1.18 + k * 0.012), -0.02 - k * 0.07, -0.07 - k * 0.012], null, false);
        for (let k = 0; k < 5; k++) H(sph(0.07, 12, 10), [((k % 2) - 0.5) * 0.08, -0.06 - k * 0.07, -hr * 1.05], null, false);
        break;
      }
      case 'clerkWig': capTop(1.12, 0.04); H(sph(hr * 1.05), [0, 0.0, -0.07], [1, 0.9, 1]); for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) H(cyl(0.035, 0.035, 0.08, 10), [sx * hr * 1.08, -0.01 - k * 0.06, -0.01], null, false).rotation.x = Math.PI / 2; break;
      case 'bald': this.m(sph(0.03), '#ffffff', head, [-0.05, hr * 0.85, 0.05], null, false, { transparent: true, opacity: 0.45 }); break;
    }
  }
  buildGlasses(head, type, fz, ex, ey) {
    const c = type === 'rimless' ? '#9fb8c9' : (type === 'pince' ? '#c9a24a' : '#1a1a1a');
    const r = type === 'thick' ? 0.038 : 0.034, t = type === 'thick' ? 0.009 : 0.004;
    const y = type === 'reading' ? ey - 0.03 : ey;
    for (const sx of [-1, 1]) {
      const rim = this.m(tor(r, t), c, head, [sx * ex, y, fz + 0.03], null, false);
      if (type === 'reading') rim.scale.y = 0.6;
    }
    this.m(box(0.04, t * 1.5, t * 1.5), c, head, [0, y + 0.005, fz + 0.035], null, false);
    if (type === 'chain') {
      for (const sx of [-1, 1]) this.m(cyl(0.003, 0.003, 0.22, 4), '#c9a24a', head, [sx * 0.15, y - 0.12, 0.04], null, false).rotation.z = sx * 0.2;
    }
  }
  // ---- properti di tangan
  hold(kind, handIdx = 1) {
    const hand = this.arms[handIdx].hand;
    if (this.props[handIdx]) { hand.remove(this.props[handIdx]); this.props[handIdx] = null; }
    if (!kind) return;
    const gp = new THREE.Group(); hand.add(gp); this.props[handIdx] = gp;
    const M = (geo, col, pos, sc, ex) => this.m(geo, col, gp, pos, sc, false, ex);
    switch (kind) {
      case 'briefcase': M(box(0.36, 0.26, 0.1), '#5a3a22', [0, -0.16, 0]); M(tor(0.05, 0.012), '#3a2414', [0, -0.01, 0]); break;
      case 'tablet': M(box(0.16, 0.22, 0.015), '#222', [0, -0.05, 0.05]); M(box(0.14, 0.19, 0.005), '#5fb6ff', [0, -0.05, 0.06], null, { emissive: '#1a4f80' }); break;
      case 'gavel': M(cyl(0.015, 0.015, 0.3), '#6b4423', [0, -0.08, 0.05]); M(cyl(0.05, 0.05, 0.14), '#6b4423', [0, 0.07, 0.05]).rotation.z = Math.PI / 2; break;
      case 'files': for (let i = 0; i < 9; i++) M(box(0.3, 0.035, 0.22), i % 2 ? '#f3efe2' : '#e6d8a8', [0.2 * 0, 0.1 + i * 0.04, 0.18], null).rotation.y = (i % 3 - 1) * 0.08; break;
      case 'trophy': M(cyl(0.09, 0.04, 0.16), '#f2c230', [0, 0.06, 0.08], null, { emissive: '#5a4100' }); M(cyl(0.025, 0.025, 0.1), '#f2c230', [0, -0.06, 0.08]); M(box(0.12, 0.04, 0.12), '#3a2a1a', [0, -0.12, 0.08]); break;
      case 'clipboard': M(box(0.2, 0.27, 0.015), '#8a5a35', [0, -0.05, 0.05]); M(box(0.17, 0.22, 0.005), '#ffffff', [0, -0.06, 0.06]); break;
      case 'scroll': M(cyl(0.035, 0.035, 0.32), '#efe2b8', [0, -0.02, 0.05]).rotation.z = Math.PI / 2; break;
      case 'clapper': M(box(0.2, 0.16, 0.02), '#111', [0, -0.03, 0.05]); M(box(0.2, 0.035, 0.022), '#f2f2f2', [0, 0.065, 0.05]); break;
      case 'stick360': M(cyl(0.012, 0.012, 0.6), '#222', [0, 0.25, 0.04]); M(sph(0.05), '#222', [0, 0.57, 0.04]); M(sph(0.03), '#5fd0ff', [0, 0.57, 0.08], null, { emissive: '#1a6f8a' }); break;
      case 'folder': M(box(0.24, 0.3, 0.05), '#2f4a7a', [0, -0.08, 0.05]); M(cyl(0.035, 0.035, 0.01), '#b3262b', [0, -0.08, 0.08]).rotation.x = Math.PI / 2; break;
      case 'report': M(box(0.22, 0.3, 0.04), '#f4f1e6', [0, -0.08, 0.05]); M(box(0.22, 0.04, 0.045), '#2f6b4a', [0, 0.05, 0.05]); break;
      case 'book': M(box(0.24, 0.3, 0.07), '#5a2230', [0, -0.08, 0.05]); M(box(0.2, 0.26, 0.072), '#f2ead6', [0.015, -0.08, 0.05]); break;
      case 'chips': M(box(0.16, 0.22, 0.06), '#e8392e', [0, -0.06, 0.05]); M(box(0.1, 0.06, 0.062), '#f5d020', [0, -0.05, 0.06]); break;
      case 'map': M(box(0.3, 0.22, 0.01), '#2f4a7a', [0, -0.06, 0.05]); break;
      case 'card': M(box(0.22, 0.3, 0.01), '#f4f1e6', [0, -0.06, 0.06], null, { emissive: '#4a4020' }); break;
    }
    gp.traverse(o => { if (o.isMesh) o.castShadow = true; });
    return gp;
  }
  // ---- kendali
  setTalk(on) { this.state.talk = on; }
  gesture(name, dur = 1.6) { this.state.gesture = name; this.state.gT = 0; this.state.gDur = dur; }
  lookAtPoint(v) {
    const local = this.root.worldToLocal(v.clone());
    this.targetYaw = THREE.MathUtils.clamp(Math.atan2(local.x, local.z), -0.9, 0.9);
  }
  faceTo(x, z) { this.root.rotation.y = Math.atan2(x - this.root.position.x, z - this.root.position.z); }
  place(x, z, rotY = 0) { this.root.position.set(x, this.root.position.y, z); this.root.rotation.y = rotY; }
  walkTo(x, z, speed = 1.6, run = false) {
    return new Promise(res => { this.walkTarget = { x, z, speed: run ? speed * 2.1 : speed, res, run }; });
  }
  update(dt) {
    this.t += dt;
    const st = this.state, t = this.t;
    // berjalan
    if (this.walkTarget) {
      const wt = this.walkTarget, pos = this.root.position;
      const dx = wt.x - pos.x, dz = wt.z - pos.z, d = Math.hypot(dx, dz);
      if (d < 0.05) { this.walkTarget = null; st.walk = 0; wt.res(); }
      else {
        const step = Math.min(d, wt.speed * dt);
        pos.x += dx / d * step; pos.z += dz / d * step;
        const ang = Math.atan2(dx, dz);
        let diff = ang - this.root.rotation.y; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        this.root.rotation.y += diff * Math.min(1, dt * 10);
        st.walk = wt.run ? 2 : 1;
      }
    }
    const walk = st.walk;
    const freq = walk === 2 ? 13 : 8.5, amp = walk === 2 ? 0.75 : 0.45;
    const ph = t * freq;
    this.legs[0].rotation.x = walk ? Math.sin(ph) * amp : 0;
    this.legs[1].rotation.x = walk ? -Math.sin(ph) * amp : 0;
    this.body.position.y = walk ? Math.abs(Math.cos(ph)) * 0.05 * walk : Math.sin(t * 1.8) * 0.006;
    this.torso.rotation.x = walk === 2 ? 0.18 : 0;
    // lengan dasar
    const [L, R] = this.arms;
    let lx = walk ? -Math.sin(ph) * amp * 0.9 : Math.sin(t * 1.8) * 0.03;
    let rx = walk ? Math.sin(ph) * amp * 0.9 : -Math.sin(t * 1.8) * 0.03;
    let lz = 0.08, rz = -0.08;
    // memegang properti: lengan kanan sedikit ke depan
    if (this.props[1] && !walk) rx = -0.5;
    if (this.p.prop === 'files') { rx = lx = -1.1; lz = -0.3; rz = 0.3; }
    // bicara: gerak tangan
    if (st.talk && !walk) {
      lx = -0.35 + Math.sin(t * 3.1) * 0.25; lz = 0.25 + Math.sin(t * 2.3) * 0.12;
      if (!this.props[1]) { rx = -0.3 + Math.sin(t * 2.7 + 1) * 0.25; rz = -0.25 - Math.sin(t * 2.1) * 0.1; }
    }
    // gestur
    if (st.gesture) {
      st.gT += dt; const k = Math.min(1, st.gT * 5) * Math.min(1, Math.max(0, (st.gDur - st.gT) * 4));
      const G = st.gesture;
      if (G === 'point') { rx = THREE.MathUtils.lerp(rx, -1.5, k); rz = THREE.MathUtils.lerp(rz, -0.1, k); }
      if (G === 'cheer') { lx = rx = THREE.MathUtils.lerp(0, -2.9, k); lz = 0.3; rz = -0.3; this.body.position.y += Math.abs(Math.sin(st.gT * 9)) * 0.15 * k; }
      if (G === 'sad') { this.torso.rotation.x = 0.35 * k; this.head.rotation.x = 0.35 * k; lx = rx = 0; }
      if (G === 'bow') { this.torso.rotation.x = 0.6 * k; }
      if (G === 'give') { rx = THREE.MathUtils.lerp(rx, -1.3, k); }
      if (G === 'lift') { rx = THREE.MathUtils.lerp(rx, -2.8, k); rz = -0.2; }
      if (G === 'hammer') { rx = -2.2 + Math.max(0, Math.sin(st.gT * 10)) * 1.4 * k; }
      if (G === 'facepalm') { rx = -2.4 * k; rz = 0.6 * k; this.head.rotation.x = 0.2 * k; }
      if (G === 'shrug') { lz = 0.9 * k; rz = -0.9 * k; lx = rx = -0.6 * k; }
      if (G === 'think') { rx = -2.0 * k; rz = 0.55 * k; }
      if (G === 'weigh') { lx = rx = -1.2 * k; lz = 0.5 * k; rz = -0.5 * k; this.body.rotation.z = Math.sin(st.gT * 3) * 0.08 * k; }
      if (st.gT >= st.gDur) { st.gesture = null; this.body.rotation.z = 0; this.head.rotation.x = 0; }
    } else if (!walk) { this.head.rotation.x = 0; }
    L.upper.rotation.x += (lx - L.upper.rotation.x) * Math.min(1, dt * 12);
    R.upper.rotation.x += (rx - R.upper.rotation.x) * Math.min(1, dt * 12);
    L.upper.rotation.z += (lz - L.upper.rotation.z) * Math.min(1, dt * 10);
    R.upper.rotation.z += (rz - R.upper.rotation.z) * Math.min(1, dt * 10);
    // kepala
    this.headYaw += (this.targetYaw - this.headYaw) * Math.min(1, dt * 6);
    this.head.rotation.y = this.headYaw + (st.talk ? Math.sin(t * 2.2) * 0.06 : 0);
    if (st.talk) this.head.rotation.z = Math.sin(t * 1.7) * 0.04;
    // mulut
    const open = st.talk ? 0.25 + Math.abs(Math.sin(t * 17) * Math.sin(t * 5.3)) * 0.9 : (this.p.mouth === 'grin' ? 0.45 : 0.25);
    this.mouth.scale.y += (open - this.mouth.scale.y) * Math.min(1, dt * 20);
    // kedip
    const blink = (t % 3.7) < 0.12 ? 0.1 : 1;
    for (const e of this.eyes) e.scale.y = (e.geometry.parameters.radius > 0.02 ? 1.15 : 1.1) * blink;
    // kuping buldog bergoyang
    if (this.ears) this.ears.forEach((e, i) => e.rotation.z = (i ? 1 : -1) * (0.45 + Math.sin(t * (walk ? 14 : 2)) * (walk ? 0.3 : 0.05)));
    if (this.pony) this.pony.rotation.z = Math.sin(t * (walk ? 10 : 1.5)) * (walk ? 0.3 : 0.05);
  }
}

// Robot bola untuk Lab AI
export function makeRobot() {
  const gq = new THREE.Group();
  const shell = mesh(sph(0.22, 24, 18), toon('#eef3f8'), gq, [0, 0, 0], null, true);
  const face = mesh(sph(0.18, 24, 18), toon('#1d2a3a'), gq, [0, 0.01, 0.07], [1, 0.75, 0.75], false);
  const eyes = [];
  for (const sx of [-1, 1]) eyes.push(mesh(sph(0.035), new THREE.MeshBasicMaterial({ color: '#58d0ff' }), gq, [sx * 0.065, 0.02, 0.2], [1, 1.3, 0.5], false));
  const ring = mesh(tor(0.26, 0.012), new THREE.MeshBasicMaterial({ color: '#58d0ff' }), gq, [0, 0, 0], null, false);
  ring.rotation.x = Math.PI / 2;
  gq.userData = { eyes, ring, shell, face };
  return gq;
}
