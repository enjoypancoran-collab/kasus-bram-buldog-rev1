// Antarmuka HTML di atas kanvas 3D.
import { audio } from './audio.js';
const $ = (id) => document.getElementById(id);
const COLORS = { bram: '#e8b84a', wendi: '#7fd1ff', hakim: '#ff8a7a', panitera: '#d6c6ff', tutor: '#7ff0d8' };

let advanceFn = null, skipSceneFn = null;
const Q = new URLSearchParams(location.search);
export const AUTO = Q.has('auto');
const autoDelay = (fn, ms = 400) => AUTO && setTimeout(fn, ms);
export const ui = {
  pool: [], allNames: [], paused: false,
  init() {
    const adv = () => { if (advanceFn) advanceFn(); };
    $('dialog').addEventListener('click', adv);
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); adv(); }
    });
    $('skipBtn').onclick = () => { if (skipSceneFn) skipSceneFn(); };
    const tp = () => { this.paused = !this.paused; $('pauseBtn').textContent = this.paused ? '▶ Lanjut' : '⏸ Jeda'; $('pausedTag').classList.toggle('hidden', !this.paused); audio.pauseVoice(this.paused); };
    $('pauseBtn').onclick = tp;
    window.addEventListener('keydown', (e) => { if (e.target.tagName !== 'TEXTAREA' && e.code === 'KeyP') tp(); });
    $('muteBtn').onclick = () => { $('muteBtn').textContent = audio.toggleMute() ? '🔇' : '🔊'; };
    $('fsBtn').onclick = () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => {}); };
    $('bagBtn').onclick = () => $('bagList').classList.toggle('hidden');
  },
  onAdvance(fn) { advanceFn = fn; },
  onSkipScene(fn) { skipSceneFn = fn; },
  progress(k) { $('loadFill').style.width = Math.round(k * 100) + '%'; },
  doneLoading() { $('loading').classList.add('hidden'); },
  titleScreen() {
    return new Promise(res => {
      $('title').classList.remove('hidden');
      const ta = $('names'), btn = $('playBtn');
      try { const saved = localStorage.getItem('bb_names'); if (saved && !ta.value) ta.value = saved; } catch {}
      const upd = () => {
        const n = parse(ta.value);
        $('nameCount').textContent = `${n.length} nama`;
        btn.disabled = n.length < 5;
        try { localStorage.setItem('bb_names', ta.value); } catch {}
      };
      if (AUTO) ta.value = Array.from({ length: 15 }, (_, i) => 'Peserta ' + (i + 1)).join('\n');
      ta.oninput = upd; upd();
      autoDelay(() => btn.click(), 600);
      btn.onclick = () => {
        const names = parse(ta.value);
        $('title').classList.add('hidden');
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        res(names);
      };
    });
  },
  hud(on) { $('hud').classList.toggle('hidden', !on); $('controls').classList.toggle('hidden', !on); },
  setRound(n) { $('hudRound').textContent = `Putaran ${n}`; },
  setFloor(t) { $('hudFloor').textContent = t || ''; },
  bag(picks) {
    $('bagCount').textContent = `${picks.length}/5`;
    $('bagList').innerHTML = picks.length ? picks.map((p, i) => `<div>${i + 1}. <b>${p.title}</b><br><small>dari ${p.by} · dipilih ${p.picker}</small></div>`).join('') : '<div>Tas masih kosong.</div>';
    const b = $('bagBtn'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  },
  floorCard(num, title) {
    const fc = $('floorCard'); fc.querySelector('.fc-num').textContent = num; fc.querySelector('.fc-title').textContent = title;
    fc.classList.remove('hidden'); fc.style.animation = 'none'; void fc.offsetWidth; fc.style.animation = '';
    setTimeout(() => fc.classList.add('hidden'), 2700);
  },
  say(who, name, text) {
    $('dialog').classList.remove('hidden');
    const n = $('dlgName'); n.textContent = name; n.style.background = COLORS[who] || '#f6d98a';
    $('dlgText').textContent = text;
  },
  hideDialog() { $('dialog').classList.add('hidden'); },
  // Pilihan bukti dengan undian nama
  choice(cards) {
    return new Promise(res => {
      const box = $('choice'); box.classList.remove('hidden', 'spokes');
      const cw = $('cards'); cw.innerHTML = '';
      const els = cards.map((c, i) => {
        const d = document.createElement('div'); d.className = 'card locked';
        d.innerHTML = `<span class="c-side">${i === 0 ? '◀ Kiri' : 'Kanan ▶'}</span><div class="c-by">dari ${c.byName}</div><h3>${c.title}</h3><p>${c.text}</p>`;
        cw.appendChild(d); return d;
      });
      let picker = null;
      this.setupSpin((name) => { picker = name; els.forEach(e => e.classList.remove('locked')); const want = Q.get('pick'); let i = Math.random() < 0.5 ? 0 : 1; if (want) { const t = want.split(',')[(window.__floorN||1)-1] || want[0]; i = cards.findIndex(c => c.type === (t === 'a' ? 'arsitek' : 'karya')); } autoDelay(() => els[i].click(), 500); });
      els.forEach((el, i) => el.onclick = () => {
        if (!picker || this.spinning) return;
        audio.sfx('pop', 0.7);
        const pi = this.pool.indexOf(picker); if (pi >= 0) this.pool.splice(pi, 1);
        $('spinBtn').classList.add('hidden'); $('refillBtn').classList.add('hidden');
        el.classList.add('chosen'); els.forEach((o, j) => j !== i && o.classList.add('dropped'));
        setTimeout(() => { box.classList.add('hidden'); res({ card: cards[i], picker }); }, 900);
      });
    });
  },
  spokes() {
    return new Promise(res => {
      const box = $('choice'); box.classList.remove('hidden'); box.classList.add('spokes');
      $('cards').innerHTML = '';
      const btn = $('spinBtn');
      this.setupSpin((name) => {
        const done = document.createElement('button'); done.className = 'btn gold'; done.textContent = 'Pembelaan selesai ✓';
        done.onclick = () => { done.remove(); box.classList.add('hidden'); box.classList.remove('spokes'); res(name); };
        btn.after(done); autoDelay(() => done.click(), 800);
      }, 'Juru Bicara PTP');
    });
  },
  setupSpin(onPicked, label = 'Siapa yang memilih?') {
    document.querySelector('.spin-label').textContent = label;
    const btn = $('spinBtn'), refill = $('refillBtn'), list = $('reelList');
    $('spinResult').textContent = ''; this.lastSpun = null; this.spinning = false;
    const showPool = () => {
      $('poolCount').textContent = this.pool.length ? `${this.pool.length} nama belum diundi` : 'Semua nama sudah memilih';
      refill.classList.remove('hidden');
      btn.disabled = this.pool.length === 0;
    };
    btn.textContent = 'SPIN 🎲';
    list.style.transition = 'none'; list.style.transform = 'translateY(0)';
    list.innerHTML = '<div>? ? ?</div>';
    btn.classList.remove('hidden'); showPool();
    autoDelay(() => btn.click(), 500);
    refill.onclick = () => { if (this.spinning) return; this.pool = [...this.allNames]; showPool(); audio.sfx('pop', 0.6); };
    btn.onclick = () => {
      if (!this.pool.length || this.spinning) return;
      this.spinning = true; btn.disabled = true; refill.disabled = true;
      const cand = this.pool.length > 1 && this.lastSpun ? this.pool.filter(n => n !== this.lastSpun) : this.pool;
      const name = cand[Math.floor(Math.random() * cand.length)]; this.lastSpun = name;
      const seq = []; const src = this.allNames.length ? this.allNames : this.pool;
      for (let i = 0; i < 34; i++) seq.push(src[Math.floor(Math.random() * src.length)]);
      seq.push(name);
      list.innerHTML = seq.map(n => `<div>${esc(n)}</div>`).join('');
      list.style.transition = 'none'; list.style.transform = 'translateY(0)'; void list.offsetWidth;
      list.style.transition = 'transform 3.2s cubic-bezier(.12,.8,.18,1)';
      list.style.transform = `translateY(-${(seq.length - 1) * 64}px)`;
      audio.sfx('spin', 0.6);
      setTimeout(() => {
        audio.sfx('ding', 0.8);
        this.spinning = false; refill.disabled = false;
        $('spinResult').innerHTML = `Giliran <b>${esc(name)}</b> — silakan pilih!`;
        btn.textContent = 'SPIN ULANG 🎲'; showPool();
        onPicked(name);
      }, 3300);
    };
  },
  stamp(text, sub, cls) {
    const s = $('stampText'); s.className = cls; s.innerHTML = `${text}<small>${sub || ''}</small>`;
    $('stamp').classList.remove('hidden'); s.style.animation = 'none'; void s.offsetWidth; s.style.animation = '';
  },
  hideStamp() { $('stamp').classList.add('hidden'); },
  recap({ round, picks, verdict, label, hint, arsitek }) {
    return new Promise(res => {
      $('recap').classList.remove('hidden');
      $('recapTitle').textContent = `Putusan: ${label}`;
      const k = picks.length - arsitek;
      $('recapMeter').innerHTML = `<div class="meterbar"><div style="flex:${Math.max(k, .001)};background:var(--karya)">${k ? 'Karya ' + k : ''}</div><div style="flex:${Math.max(arsitek, .001)};background:var(--arsitek)">${arsitek ? 'Arsitek ' + arsitek : ''}</div></div><div class="meter-legend"><span>Bukti karya: ${k}</span><span>Bukti arsitek: ${arsitek}</span></div>`;
      $('recapList').innerHTML = picks.map((p, i) => `<li><span class="n">${i + 1}</span><span class="t">${p.title}<br><span class="who">Lantai ${p.floor} · dari ${p.by} · dipilih oleh ${esc(p.picker)}</span></span><span class="badge ${p.type}">${p.type === 'karya' ? 'Karya' : 'Arsitek'}</span></li>`).join('');
      const win = verdict === 'C';
      $('ruleBtn').classList.add('hidden');
      $('againBtn').classList.toggle('hidden', win);
      $('againBtn').textContent = 'Coba Lagi ▶';
      $('homeBtn').textContent = win ? 'Selesai' : 'Layar Awal';
      if (win) {
        $('recapRule').innerHTML = '';
        $('recapQ').innerHTML = '<b>Diskusi:</b> Dari bukti arsitek yang dibawa Bram, berapa yang benar-benar sudah dimiliki PTP Kemenkeu hari ini? Bukti arsitek mana yang paling mungkin mulai kita bangun tahun depan?';
        $('recapCredits').innerHTML = `<b>Tim Pembela PTP</b><br>${this.allNames.map(esc).join(' · ')}`;
      } else {
        $('recapRule').innerHTML = hint ? `<b>Petunjuk hakim:</b> ${hint}` : '';
        $('recapQ').innerHTML = '<b>Diskusi:</b> Menurut kalian, kenapa hakim memutus seperti itu?';
        $('recapCredits').innerHTML = '';
      }
      $('againBtn').onclick = () => { $('recap').classList.add('hidden'); res('again'); };
      $('homeBtn').onclick = () => { $('recap').classList.add('hidden'); res('home'); };
      window.__recap = (window.__recap || 0) + 1;
      autoDelay(() => (win || window.__recap >= (+Q.get('rounds') || 2) ? $('homeBtn') : $('againBtn')).click(), 2500);
    });
  },
};
function parse(t) { return t.split('\n').map(s => s.trim()).filter(Boolean).filter((v, i, a) => a.indexOf(v) === i); }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
