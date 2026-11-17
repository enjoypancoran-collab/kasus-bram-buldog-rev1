// Inti render, kamera, tween, dan utilitas visual.
import * as THREE from 'three';
import { Character, toon } from './characters.js';
import { makeChar } from './glbchar.js';

export const E = {
  chars: {}, tickers: new Set(), tweens: [], set: null, shakeT: 0, shakeA: 0,
  init(container) {
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    const Q = new URLSearchParams(location.search); this.lq = Q.has('lq');
    r.setPixelRatio(this.lq ? 0.5 : Math.min(window.devicePixelRatio, 1.5));
    r.setSize(window.innerWidth, window.innerHeight);
    r.shadowMap.enabled = !this.lq; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    container.appendChild(r.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.05, 400);
    this.camera.position.set(0, 1.6, 5);
    this.look = new THREE.Vector3(0, 1.4, 0); this.lookCur = this.look.clone();
    this.clock = new THREE.Clock();
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight; this.camera.updateProjectionMatrix();
      r.setSize(window.innerWidth, window.innerHeight);
    });
    // kualitas adaptif: bila fps rendah, turunkan resolusi
    let frames = 0, acc = 0, degraded = 0;
    const loop = () => {
      const raw = this.clock.getDelta(), dt = Math.min(0.1, raw);
      this.tick(dt); r.render(this.scene, this.camera);
      frames++; acc += raw;
      if (acc > 3) { const fps = frames / acc; frames = 0; acc = 0;
        if (fps < 28 && degraded < 2 && !this.lq) { degraded++; r.setPixelRatio(degraded === 1 ? 1 : 0.75); if (degraded === 2) { r.shadowMap.enabled = false; } }
      }
      requestAnimationFrame(loop);
    };
    loop();
  },
  tick(dt) {
    this.time = (this.time || 0) + dt;
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i]; tw.t += dt;
      const k = Math.min(1, tw.t / tw.d), e = tw.ease(k);
      tw.fn(e, k);
      if (k >= 1) { this.tweens.splice(i, 1); tw.res(); }
    }
    for (const fn of this.tickers) fn(dt, this.time);
    for (const c of Object.values(this.chars)) if (c.root.parent) c.update(dt);
    if (this.follow) this.follow(dt);
    this.lookCur.lerp(this.look, this.lookLerp ?? 1);
    this.camera.lookAt(this.lookCur);
    if (this.shakeT > 0) {
      this.shakeT -= dt; const a = this.shakeA * Math.max(0, this.shakeT);
      this.camera.position.x += (Math.random() - 0.5) * a; this.camera.position.y += (Math.random() - 0.5) * a;
    }
  },
  tween(d, fn, ease = easeInOut) { return new Promise(res => this.tweens.push({ t: 0, d: Math.max(0.001, d), fn, ease, res })); },
  wait(s) { return new Promise(r => setTimeout(r, s * 1000)); },
  shake(a = 0.15, t = 0.6) { this.shakeA = a; this.shakeT = t; },
  // kamera
  cut(pos, look) { this.follow = null; this.camera.position.set(...pos); this.look.set(...look); this.lookCur.copy(this.look); },
  camTo(pos, look, d = 1.2, ease = easeInOut) {
    this.follow = null;
    const p0 = this.camera.position.clone(), l0 = this.look.clone();
    const p1 = new THREE.Vector3(...pos), l1 = new THREE.Vector3(...look);
    return this.tween(d, e => { this.camera.position.lerpVectors(p0, p1, e); this.look.lerpVectors(l0, l1, e); this.lookCur.copy(this.look); }, ease);
  },
  // kamera menyorot tokoh yang sedang bicara
  focus(c, opt = {}) {
    const dist = opt.dist ?? 1.75, h = opt.h ?? 0.05;
    let side = opt.side ?? 0.55;
    const headY = c.root.position.y + c.legLen + 0.56 * c.scale + 0.2;
    const fwd = new THREE.Vector3(Math.sin(c.root.rotation.y), 0, Math.cos(c.root.rotation.y));
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
    if (opt.outward) { const a = c.root.position.x + right.x * side, b = c.root.position.x - right.x * side; if (Math.abs(b) > Math.abs(a)) side = -side; }
    const pos = c.root.position.clone().addScaledVector(fwd, dist).addScaledVector(right, side * dist * 0.5);
    pos.y = headY + h + (opt.up ?? 0);
    const look = c.root.position.clone(); look.y = headY - 0.08;
    if (opt.cut) return this.cut(pos.toArray(), look.toArray());
    return this.camTo(pos.toArray(), look.toArray(), opt.d ?? 0.7);
  },
  // tokoh
  char(id, opts) {
    const key = opts?.key || id;
    if (!this.chars[key]) this.chars[key] = makeChar(id, opts);
    return this.chars[key];
  },
  setSet(set) {
    if (this.set) { this.scene.remove(this.set.group); this.set.dispose?.(); }
    for (const c of Object.values(this.chars)) if (c.root.parent) c.root.parent.remove(c.root);
    this.tickers.clear(); this.follow = null;
    this.set = set; this.scene.add(set.group);
    this.scene.background = set.bg || new THREE.Color('#202028');
    this.scene.fog = set.fog || null;
    if (set.tick) this.tickers.add(set.tick);
  },
  add(c, x, z, rot = 0) { this.set.group.add(c.root); c.place(x, z, rot); c.root.position.y = 0; return c; },
};
export const easeInOut = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
export const easeOut = k => 1 - Math.pow(1 - k, 3);
export const easeIn = k => k * k * k;
export const linear = k => k;
export const easeBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };

// ---------- helper visual ----------
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData = { canvas: c, ctx: x }; return t;
}
// Papan bertulisan
export function sign(text, w = 2, h = 0.5, opts = {}) {
  const tex = canvasTexture(1024, Math.round(1024 * h / w), (x, W, H) => {
    x.fillStyle = opts.bg || '#f4ecd8'; x.fillRect(0, 0, W, H);
    if (opts.border !== false) { x.strokeStyle = opts.border || '#3a2405'; x.lineWidth = 18; x.strokeRect(9, 9, W - 18, H - 18); }
    x.fillStyle = opts.color || '#2a1a0a'; x.textAlign = 'center'; x.textBaseline = 'middle';
    const lines = String(text).split('\n'); let fs = opts.size || Math.min(H / lines.length * 0.62, 150);
    x.font = `${opts.weight || 900} ${fs}px ${opts.font || 'Inter, sans-serif'}`;
    while (lines.some(l => x.measureText(l).width > W * 0.9) && fs > 10) { fs -= 4; x.font = `${opts.weight || 900} ${fs}px ${opts.font || 'Inter, sans-serif'}`; }
    lines.forEach((l, i) => x.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * fs * 1.15));
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), opts.basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: !!opts.transparent }) : toon('#ffffff', { map: tex }));
  return m;
}
// Panel hologram bercahaya; draw(ctx, W, H, t) dipanggil ulang bila animate
export function holo(w, h, draw, opts = {}) {
  const W = 1024, H = Math.round(1024 * h / w);
  const tex = canvasTexture(W, H, () => {});
  const g = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); g.add(plane);
  const col = opts.color || '#5fd0ff';
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, h)), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0 }));
  g.add(frame);
  let t = 0, shown = 0, target = 0, stage = 0;
  const redraw = () => {
    const x = tex.userData.ctx; x.clearRect(0, 0, W, H);
    x.fillStyle = 'rgba(6,24,42,0.86)'; x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(95,208,255,0.9)'; x.lineWidth = 10; x.strokeRect(5, 5, W - 10, H - 10);
    draw(x, W, H, t, stage);
    x.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = (t * 60) % 8; y < H; y += 8) x.fillRect(0, y, W, 2);
    tex.needsUpdate = true;
  };
  redraw();
  g.userData = {
    show() { target = 1; }, hide() { target = 0; }, setStage(s) { stage = s; redraw(); },
    tick(dt) {
      t += dt; shown += (target - shown) * Math.min(1, dt * 5);
      const fl = 0.95 + Math.sin(t * 23) * 0.03 + (Math.random() < 0.015 ? -0.25 : 0);
      mat.opacity = shown * fl; frame.material.opacity = shown;
      g.scale.setScalar(0.6 + shown * 0.4); g.visible = shown > 0.01;
      if (opts.animate !== false && shown > 0.02) redraw();
    },
  };
  g.visible = false;
  return g;
}
export function txt(x, s, X, Y, size, color = '#dff6ff', weight = 800, align = 'center') {
  x.font = `${weight} ${size}px Inter, sans-serif`; x.fillStyle = color; x.textAlign = align; x.textBaseline = 'middle'; x.fillText(s, X, Y);
}
// Partikel konfeti
export function confetti(parent, origin, n = 220, colors = ['#e8b84a', '#ff5a5a', '#5fd0ff', '#7dff9a', '#ffffff']) {
  const geo = new THREE.PlaneGeometry(0.06, 0.1);
  const ps = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: colors[i % colors.length], side: THREE.DoubleSide }));
    m.position.set(origin.x + (Math.random() - 0.5) * 8, origin.y + Math.random() * 3, origin.z + (Math.random() - 0.5) * 6);
    m.userData.v = new THREE.Vector3((Math.random() - 0.5) * 0.6, -0.6 - Math.random() * 0.9, (Math.random() - 0.5) * 0.6);
    m.userData.r = new THREE.Vector3(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    parent.add(m); ps.push(m);
  }
  const fn = (dt) => {
    for (const m of ps) {
      m.position.addScaledVector(m.userData.v, dt);
      m.rotation.x += m.userData.r.x * dt; m.rotation.y += m.userData.r.y * dt;
      if (m.position.y < 0) m.position.y = origin.y + 3;
    }
  };
  E.tickers.add(fn);
  return () => { E.tickers.delete(fn); ps.forEach(p => parent.remove(p)); };
}
export { THREE, toon };
