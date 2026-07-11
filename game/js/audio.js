// Procedural, asset-free audio — a thin WebAudio synth for the same events the
// visual juice reacts to (deliveries, hunter deaths, wave arrivals). No files,
// no libraries: every sound is an oscillator envelope, so it is licence-clean.
//
// Fully guarded and OPTIONAL: the AudioContext is created lazily on the first
// real user gesture (browser autoplay policy) and every call no-ops if it does
// not exist. Headless/auto runs never gesture, so no context is ever made and
// the sim/tests are wholly unaffected — audio is a pure human-play enhancement.
let ctx = null;
let master = null;
let lastTick = -1;        // throttle for the (frequent) delivery tick

export function initAudio() {
  if (ctx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  } catch (e) { ctx = null; }        // no audio device / blocked → stay silent
}

function blip(type, f0, f1, dur, peak, delay = 0) {
  if (!ctx) return;
  try {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  } catch (e) { /* ignore transient audio errors */ }
}

// food reaches the nest — a soft, bright tick. Throttled (deliveries are
// frequent) and pitched up slightly with the burst size so a strong harvest
// reads as busier. `now` is performance.now() ms from the caller.
export function sfxDelivery(strength, now) {
  if (!ctx) return;
  if (now - lastTick < 170) return;
  lastTick = now;
  const f = 900 + Math.min(6, strength) * 70;
  blip('triangle', f, f * 1.5, 0.09, 0.10);
}

// a hunter falls — a low thud with a quick downward chirp on top.
export function sfxDeath() {
  blip('sawtooth', 180, 60, 0.28, 0.22);
  blip('square', 420, 120, 0.16, 0.09, 0.01);
}

// a reinforcement wave arrives — an ominous rising swell.
export function sfxWave() {
  blip('sawtooth', 90, 190, 0.5, 0.16);
}
