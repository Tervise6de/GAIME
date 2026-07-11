// Procedural WebAudio — zero assets, zero dependencies. The context is
// created only from a real user gesture (autoplay policy); until then every
// sfx call is a silent no-op, so headless/bot runs are untouched.
let actx = null, master = null, lastPop = 0;

export function initAudio() {
  if (actx) return;
  try {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain();
    master.gain.value = 0.22;
    master.connect(actx.destination);
  } catch { actx = null; }
}

// soft pop as food reaches the nest — rate-limited so a busy road becomes a
// gentle patter, not a hailstorm
export function sfxDelivery() {
  if (!actx || actx.state !== 'running') return;
  const t = actx.currentTime;
  if (t - lastPop < 0.13) return;
  lastPop = t;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'triangle';
  o.frequency.value = 620 + Math.random() * 260;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.12);
}

// low thud + hiss when a hunter falls — the payoff moment of a warband
export function sfxSpiderDeath() {
  if (!actx || actx.state !== 'running') return;
  const t = actx.currentTime;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.45);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + 0.55);
  const len = (actx.sampleRate * 0.25) | 0;
  const buf = actx.createBuffer(1, len, actx.sampleRate);
  const dd = buf.getChannelData(0);
  for (let i = 0; i < len; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = actx.createBufferSource(); src.buffer = buf;
  const hp = actx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
  const hg = actx.createGain(); hg.gain.value = 0.12;
  src.connect(hp); hp.connect(hg); hg.connect(master);
  src.start(t);
}
