// Membuat efek suara dan musik latar lewat ElevenLabs Sound Generation.
// Jalankan: ELEVEN_API_KEY=... node tools/gen_sfx.mjs
import fs from 'node:fs';
const KEY = process.env.ELEVEN_API_KEY;
const SFX = {
  revolving: ['revolving glass door spinning very fast with whooshing air, cartoon', 2.5],
  lift_stop: ['old elevator jolting to a sudden stop with metal clunk and cable creak', 2],
  stairs: ['fast footsteps running up concrete stairs, echo', 3],
  trip: ['person tripping over a cable then short electronic error alarm beeps', 2.5],
  scan: ['futuristic laser scanner beam sweep then low error buzzer', 2.5],
  avalanche: ['big avalanche of paper documents and books sliding and falling', 3],
  wind: ['strong rooftop wind gusts, city ambience far below', 5],
  bell: ['large clock tower bell striking four times', 6],
  door_slam: ['huge heavy wooden courtroom double doors slamming shut with echo', 2.5],
  gavel: ['heavy wooden gavel strike echoing loudly in a huge stone courtroom', 2],
  machine: ['large mechanical platform rising with grinding gears and hydraulic hiss', 3],
  thunder: ['dramatic thunder clap with rolling rumble', 3.5],
  cheer: ['crowd of office workers cheering and clapping joyfully indoors', 4],
  confetti: ['confetti cannon pop with paper confetti rustling', 2],
  aww: ['disappointed crowd sighing aww together', 2.5],
  bag: ['paper document slipping into leather briefcase then latch click', 1.2],
  spin: ['slot machine reel spinning with fast ticking that slows down', 3],
  ding: ['bright game show winner ding bell', 1.2],
  applause: ['warm audience applause', 3],
  coin: ['8-bit retro video game coin collect sound', 0.8],
  clapper: ['film clapperboard snap', 0.8],
  robot: ['small friendly hovering robot humming and chirping', 2.5],
  glitch: ['digital glitch distortion, robot voice malfunction, static burst', 2],
  whoosh: ['fast cinematic whoosh transition', 1.2],
  holo: ['sci-fi hologram appearing shimmer chime', 1.5],
  crunch: ['person crunching potato chips', 1.5],
  steps: ['confident leather shoe footsteps on marble floor', 2.5],
  trophy: ['shiny sparkle chime with metallic trophy clink', 1.5],
  pop: ['soft cartoon pop', 0.6],
  chalk: ['marker squeaking on whiteboard', 1.5],
};
const MUSIC = {
  jazz: ['playful cool jazz detective background music, upright bass walking line, brushed drums, muted trumpet, instrumental, loopable', 22],
  office: ['light upbeat quirky office background music, pizzicato strings and marimba, instrumental, loopable', 22],
  urgent: ['urgent ticking suspense music, fast strings ostinato and clock ticking, instrumental, loopable', 20],
  court: ['dramatic tense orchestral courtroom music, low strings, timpani, choir hum, instrumental, loopable', 22],
  win: ['triumphant orchestral victory fanfare with brass and cymbals, celebration', 10],
  sad: ['comedic sad trombone wah wah wah fail sting', 4],
  title: ['epic cinematic legal drama main theme, bold brass, orchestral hits, a little playful, instrumental', 20],
};
async function gen(id, [text, dur], dir, loop) {
  const out = `assets/audio/${dir}/${id}.mp3`;
  if (fs.existsSync(out)) return;
  for (const useLoop of loop ? [true, false] : [false]) {
    const body = { text, duration_seconds: dur, prompt_influence: 0.5 };
    if (useLoop) body.loop = true;
    const r = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
      method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.ok) { fs.writeFileSync(out, Buffer.from(await r.arrayBuffer())); process.stdout.write('.'); return; }
    const t = await r.text(); console.log('\n', id, r.status, t.slice(0, 160));
  }
}
const jobs = [...Object.entries(SFX).map(([k, v]) => () => gen(k, v, 'sfx', false)),
              ...Object.entries(MUSIC).map(([k, v]) => () => gen(k, v, 'music', true))];
let i = 0;
await Promise.all([1, 2, 3].map(async () => { while (i < jobs.length) await jobs[i++](); }));
console.log('\nselesai');
