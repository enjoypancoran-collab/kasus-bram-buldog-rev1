// Tokoh 3D dari Meshy (GLB ber-rig) dengan API yang sama seperti Character prosedural.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { Character, PEOPLE } from './characters.js';
import { audio } from './audio.js';

// tinggi mulut di atas tulang kepala (meter), disetel per tokoh
export const MOUTH = { bram: 0.058, hakim: 0.065, panitera: 0.05, wendi: 0.042, rudi: 0.052, maria: 0.042, kevin: 0.04, siti: 0.048, bayu: 0.042, lestari: 0.038, fajar: 0.048, ratna: 0.036, nanda: 0.037, yosef: 0.036 };
export const MOUTH_W = {};

export const MODELS = {};
const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
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
  talks: ['talk_with_hands_open', 'talk_with_right_hand_open', 'talk_with_left_hand_raised', 'talk_with_left_hand_on_hip', 'talk_passionately'],
  listen: ['agree_gesture', 'hand_on_hip_gesture', 'confused_scratch', 'scheming_hand_rub'],
  jazz: ['jazz_hands', 'cheer_with_both_hands'],
  scheme: ['scheming_hand_rub', 'talk_with_hands_open'],
  agree: ['agree_gesture', 'talk_with_right_hand_open'],
  hip: ['talk_with_left_hand_on_hip', 'hand_on_hip_gesture', 'talk_with_left_hand_raised'],
  scratch: ['confused_scratch', 'shrug'],
  raise: ['talk_with_left_hand_raised', 'talk_with_right_hand_open'],
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
    this.root.updateMatrixWorld(true);
    this.buildMouth();
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
    return this.actions[kind] ? kind : null;
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
  buildMouth() {
    const hb = this.bones.Head; if (!hb) return;
    let sm = null; this.model.traverse(o => { if (o.isSkinnedMesh && !sm) sm = o; });
    if (!sm) return;
    const V = THREE.Vector3, Q = THREE.Quaternion;
    const bi = sm.skeleton.bones.indexOf(hb); if (bi < 0) return;
    // arah depan & atas wajah dalam ruang lokal tulang kepala (dari pose bind: tokoh menghadap +z)
    const qb = new Q(), qm = new Q(), tv = new V(), ts = new V();
    sm.skeleton.boneInverses[bi].clone().invert().decompose(tv, qb, ts);
    sm.bindMatrix.decompose(tv, qm, ts);
    const qbi = qb.clone().invert();
    this.faceFwd = new V(0, 0, 1).applyQuaternion(qm).applyQuaternion(qbi).normalize();
    this.faceUp = new V(0, 1, 0).applyQuaternion(qm).applyQuaternion(qbi).normalize();
    const qw = hb.getWorldQuaternion(new Q());
    const fwd = this.faceFwd.clone().applyQuaternion(qw).normalize(), up = this.faceUp.clone().applyQuaternion(qw).normalize();
    const hp = hb.getWorldPosition(new V());
    const center = hp.clone().addScaledVector(up, MOUTH[this.id] ?? 0.075);
    const meshes = []; this.model.traverse(o => { if (o.isMesh && o !== this.mouth) meshes.push(o); });
    const rc = new THREE.Raycaster(center.clone().addScaledVector(fwd, 1.2), fwd.clone().negate(), 0, 2.4);
    const hit = rc.intersectObjects(meshes, false)[0];
    const p = hit ? hit.point.clone() : center.clone().addScaledVector(fwd, 0.12);
    p.addScaledVector(fwd, 0.006);
    const mat = new THREE.MeshBasicMaterial({ color: '#4a1218', polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, side: THREE.DoubleSide });
    const mouth = new THREE.Group();
    mouth.add(new THREE.Mesh(new THREE.CircleGeometry(1, 28), mat));
    const tongue = new THREE.Mesh(new THREE.CircleGeometry(0.55, 20), new THREE.MeshBasicMaterial({ color: '#c8505a', side: THREE.DoubleSide }));
    tongue.position.set(0, -0.45, 0.01); mouth.add(tongue);
    const right = new V().crossVectors(up, fwd).normalize(), up2 = new V().crossVectors(fwd, right).normalize();
    const qMouth = new Q().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up2, fwd));
    hb.add(mouth);
    mouth.position.copy(hb.worldToLocal(p.clone()));
    mouth.quaternion.copy(qw.clone().invert().multiply(qMouth));
    const ws = hb.getWorldScale(new V());
    mouth.scale.set(1 / ws.x, 1 / ws.y, 1 / ws.z);
    this.mouth = mouth; this.mouthW = (MOUTH_W[this.id] ?? 0.017); this.mouthBase = mouth.scale.clone(); this.mouthOpen = 0;
    mouth.visible = false;
  }
  updateMouth(dt) {
    if (!this.mouth) return;
    let target = 0;
    if (this.state.talk || window.__mouthDebug) {
      let lv2 = null; const lv = audio.level();
      if (window.__mouthDebug) lv2 = 1;
      target = lv2 ?? (lv < 0 ? (0.35 + 0.65 * Math.abs(Math.sin(this.t * 13) * Math.sin(this.t * 5.3))) : Math.min(1, lv * 1.6));
    }
    this.mouthOpen += (target - this.mouthOpen) * Math.min(1, dt * 22);
    const o = this.mouthOpen, b = this.mouthBase, w = this.mouthW;
    this.mouth.visible = o > 0.04;
    this.mouth.scale.set(b.x * w * (0.85 + 0.25 * o), b.y * w * 0.75 * o + 1e-5, b.z);
  }
  setTalk(on) {
    if (on && !this.state.talk) {
      const opts = CLIP.talks.filter(n => this.actions[n] && n !== this.lastTalk);
      this.talkKind = opts.length ? opts[Math.floor(Math.random() * opts.length)] : null;
      this.lastTalk = this.talkKind;
    }
    this.state.talk = on;
  }
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
    if (this.walkTarget && window.__ff) { const wt = this.walkTarget; this.root.position.x = wt.x; this.root.position.z = wt.z; this.walkTarget = null; st.walk = 0; wt.res(); }
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
    // pendengar sesekali bergerak (mengangguk, tangan di pinggang, dll.)
    if (!st.walk && !st.talk && !st.gesture && this.find('listen')) {
      this.idleT = (this.idleT ?? 3 + Math.random() * 3) - dt;
      if (this.idleT <= 0) { this.idleT = 5 + Math.random() * 4; const ls = CLIP.listen.filter(n => this.actions[n]); if (ls.length) { st.gesture = '@' + ls[Math.floor(Math.random() * ls.length)]; st.gT = 0; st.gDur = 2.6; } }
    }
    let k = 0;
    const G = st.gesture;
    if (G) {
      st.gT += dt;
      k = Math.min(1, st.gT * 5) * Math.min(1, Math.max(0, (st.gDur - st.gT) * 4));
      const map = { cheer: 'cheer', lift: this.find('victory') ? 'victory' : 'talk', bow: this.find('bow') ? 'bow' : null, shrug: this.find('shrug') ? 'shrug' : 'talk',
        facepalm: this.find('scratch') ? 'scratch' : this.find('shrug') ? 'shrug' : 'talk', weigh: 'talk', give: 'raise', point: 'raise', hammer: this.find('angry') ? 'angry' : 'talk', think: 'idle', sad: 'idle',
        jazz: 'jazz', scheme: 'scheme', agree: 'agree', hip: 'hip', scratch: 'scratch', raise: 'raise', listen: 'listen' };
      if (G[0] === '@' && !st.walk && !st.talk) want = G.slice(1);
      else if (G[0] === '@') st.gesture = null;
      else if (map[G] && !st.walk) want = map[G];
      if (st.gT >= st.gDur) st.gesture = null;
    }
    const a = this.actions[this.find(want)];
    if (want === 'walk' && this.actions.walk) this.actions.walk.timeScale = st.walk === 2 ? 1.7 : 1.1;
    this.play(want, 0.3);
    if (a && a !== this.actions.walk) a.timeScale = 1;
    this.mixer.update(dt);
    // jaga wajah tetap menghadap ke depan tokoh (klip Meshy kadang memutar badan)
    if (this.faceFwd && this.bones.Head) {
      if (st.walk) this.body.rotation.y *= Math.max(0, 1 - dt * 6);
      else {
        this.model.updateMatrixWorld(true);
        const f = this.faceFwd.clone().applyQuaternion(this.bones.Head.getWorldQuaternion(_q)).applyQuaternion(this.root.getWorldQuaternion(_q2).invert());
        const yaw = Math.atan2(f.x, f.z);
        this.body.rotation.y = THREE.MathUtils.clamp(this.body.rotation.y - yaw * Math.min(1, dt * 4) * 0.85, -1.3, 1.3);
      }
    }
    // gestur tambahan di atas animasi
    const sp = this.bones.Spine02 || this.bones.Spine01;
    if (G === 'sad' && sp) sp.rotateX(0.45 * k);
    if (G === 'bow' && !this.find('bow') && sp) sp.rotateX(0.7 * k);
    if (G === 'cheer' && !this.find('cheer')) this.body.position.y = Math.abs(Math.sin(st.gT * 9)) * 0.15 * k; else this.body.position.y = 0;
    this.syncAnchors();
    this.updateMouth(dt);
  }
}
