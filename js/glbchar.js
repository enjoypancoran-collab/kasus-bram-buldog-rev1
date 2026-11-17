// Tokoh 3D dari Meshy (GLB ber-rig) dengan API yang sama seperti Character prosedural.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { Character, PEOPLE } from './characters.js';

export const MODELS = {};
export const MODEL_IDS = ['bram', 'hakim', 'panitera', 'wendi', 'rudi', 'maria', 'kevin', 'siti', 'bayu', 'lestari', 'fajar', 'ratna', 'nanda', 'yosef'];

const grad = (() => {
  const d = new Uint8Array([120, 185, 230, 255]);
  const t = new THREE.DataTexture(d, 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();

export async function loadModels(onProgress) {
  const loader = new GLTFLoader();
  let done = 0; const total = MODEL_IDS.length * 2;
  const tick = () => { done++; onProgress?.(done / total); };
  await Promise.all(MODEL_IDS.map(async id => {
    try {
      const [main, walk] = await Promise.all([
        loader.loadAsync(`assets/models/${id}.glb`).finally(tick),
        loader.loadAsync(`assets/models/${id}_walk.glb`).catch(() => null).finally(tick),
      ]);
      main.scene.traverse(o => {
        if (o.isMesh) {
          const old = o.material;
          o.material = new THREE.MeshToonMaterial({ map: old.map, gradientMap: grad, side: THREE.DoubleSide });
          if (o.material.map) o.material.map.colorSpace = THREE.SRGBColorSpace;
          o.castShadow = true; o.frustumCulled = false;
        }
      });
      const clips = {};
      for (const c of main.animations) clips[c.name.toLowerCase()] = c;
      if (walk?.animations[0]) clips.walk = walk.animations[0];
      MODELS[id] = { scene: main.scene, clips };
    } catch (e) { console.warn('model gagal dimuat, pakai versi prosedural:', id, e); }
  }));
}

export function makeChar(id, opts = {}) {
  if (MODELS[id] && !opts.procedural) return new GLBCharacter(id, opts);
  return new Character(id, opts);
}

const CLIP = {
  idle: ['idle'],
  talk: ['talk_with_hands_open'],
  passion: ['talk_passionately'],
  angry: ['stand_talking_angry'],
  cheer: ['cheer_with_both_hands', 'cheer_with_both_hands_up', 'victory_fist_pump', 'happy_sway_standing'],
  victory: ['victory_fist_pump', 'cheer_with_both_hands', 'cheer_with_both_hands_up'],
  bow: ['formal_bow'],
  shrug: ['shrug'],
  sway: ['happy_sway_standing'],
};

export class GLBCharacter {
  constructor(id, opts = {}) {
    this.id = id; this.isGLB = true;
    this.p = { ...PEOPLE[id], ...opts };
    this.lite = true;
    this.root = new THREE.Group(); this.root.name = id;
    this.body = new THREE.Group(); this.root.add(this.body);
    const src = MODELS[id];
    this.model = SkeletonUtils.clone(src.scene); this.body.add(this.model);
    this.bones = {};
    this.model.traverse(o => { if (o.isBone) this.bones[o.name] = o; if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
    this.mixer = new THREE.AnimationMixer(this.model);
    this.actions = {};
    for (const [k, c] of Object.entries(src.clips)) this.actions[k] = this.mixer.clipAction(c);
    this.cur = null; this.t = Math.random() * 10;
    this.state = { walk: 0, talk: false, gesture: null, gT: 0 };
    this.props = {}; this.ears = [];
    // jangkar kepala & tangan, sejajar dengan arah tokoh
    this.head = new THREE.Group(); this.root.add(this.head);
    this.arms = [{ hand: new THREE.Group() }, { hand: new THREE.Group() }];
    this.arms.forEach(a => this.root.add(a.hand));
    this.scale = 1;
    this.root.updateMatrixWorld(true);
    this.play('idle', 0);
    this.mixer.update(Math.random() * 3);
    this.model.updateMatrixWorld(true);
    const top = new THREE.Box3().setFromObject(this.model, true).max.y;
    const hb = new THREE.Vector3(); this.bones.Head?.getWorldPosition(hb);
    this.headUp = Math.max(0.08, (top - hb.y) * 0.45);
    this.syncAnchors();
    this.headH = this.head.position.y;
    this.legLen = this.headH - 0.76;
  }
  // tinggi kepala (dipakai kamera)
  find(kind) {
    for (const n of CLIP[kind] || [kind]) if (this.actions[n]) return n;
    return null;
  }
  play(kind, fade = 0.3, once = false) {
    const name = this.find(kind) || this.find('idle');
    if (!name || name === this.cur) return;
    const a = this.actions[name];
    a.reset(); a.enabled = true; a.setEffectiveWeight(1);
    a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = once;
    if (this.cur && fade > 0) a.crossFadeFrom(this.actions[this.cur], fade, true);
    else if (this.cur) this.actions[this.cur].stop();
    a.play(); this.cur = name;
  }
  syncAnchors() {
    const v = new THREE.Vector3();
    const set = (bone, obj, up = 0) => { if (!bone) return; bone.getWorldPosition(v); this.root.worldToLocal(v); obj.position.copy(v); obj.position.y += up; };
    set(this.bones.Head, this.head, this.headUp ?? 0.08);
    set(this.bones.LeftHand, this.arms[0].hand);
    set(this.bones.RightHand, this.arms[1].hand);
  }
  hold(kind, handIdx = 1) { return Character.prototype.hold.call(this, kind, handIdx); }
  m(...a) { return Character.prototype.m.call(this, ...a); }
  setTalk(on) { this.state.talk = on; }
  gesture(name, dur = 1.6) { this.state.gesture = name; this.state.gT = 0; this.state.gDur = dur; }
  lookAtPoint() {}
  faceTo(x, z) { this.root.rotation.y = Math.atan2(x - this.root.position.x, z - this.root.position.z); }
  place(x, z, rotY = 0) { this.root.position.set(x, this.root.position.y, z); this.root.rotation.y = rotY; }
  walkTo(x, z, speed = 1.6, run = false) {
    return new Promise(res => { this.walkTarget = { x, z, speed: run ? speed * 2.1 : speed, res, run }; });
  }
  update(dt) {
    this.t += dt;
    const st = this.state;
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
    // pilih animasi
    let want = st.walk ? 'walk' : st.talk ? (this.talkKind || 'talk') : 'idle';
    let k = 0;
    const G = st.gesture;
    if (G) {
      st.gT += dt;
      k = Math.min(1, st.gT * 5) * Math.min(1, Math.max(0, (st.gDur - st.gT) * 4));
      const map = { cheer: 'cheer', lift: this.find('victory') ? 'victory' : 'talk', bow: this.find('bow') ? 'bow' : null, shrug: this.find('shrug') ? 'shrug' : 'talk',
        facepalm: this.find('shrug') ? 'shrug' : 'talk', weigh: 'talk', give: 'talk', point: 'talk', hammer: this.find('angry') ? 'angry' : 'talk', think: 'idle', sad: 'idle' };
      if (map[G] && !st.walk) want = map[G];
      if (st.gT >= st.gDur) st.gesture = null;
    }
    const a = this.actions[this.find(want)];
    if (want === 'walk' && this.actions.walk) this.actions.walk.timeScale = st.walk === 2 ? 1.7 : 1.1;
    this.play(want, 0.3);
    if (a && a !== this.actions.walk) a.timeScale = 1;
    this.mixer.update(dt);
    // gestur tambahan di atas animasi
    const sp = this.bones.Spine02 || this.bones.Spine01;
    if (G === 'sad' && sp) sp.rotateX(0.45 * k);
    if (G === 'bow' && !this.find('bow') && sp) sp.rotateX(0.7 * k);
    if (G === 'cheer' && !this.find('cheer')) this.body.position.y = Math.abs(Math.sin(st.gT * 9)) * 0.15 * k; else this.body.position.y = 0;
    this.syncAnchors();
  }
}
