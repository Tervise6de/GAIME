// Procedural audio — 100% synthesized (zero sample assets, so licence-clean).
// Deliberately minimal and gated: the AudioContext is created ONLY on a real
// user gesture (the click-to-begin), so headless/bot runs — which never click —
// stay silent and unaffected, and the sim itself is never touched (this module
// only READS sim counters each frame). All calls are wrapped so a missing or
// suspended AudioContext can never break the game loop.
export function makeAudio() {
  return {
    ctx: null, master: null, on: true,
    seenKills: 0, seenBanked: 0, lastBlip: -1, over: false,
  };
}

// Call from a genuine user-gesture handler (mousedown). Lazily builds the
// context the first time; resumes it if the browser suspended it.
export function audioResume(a) {
  try {
    if (!a.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      a.ctx = new AC();
      a.master = a.ctx.createGain();
      a.master.gain.value = 0.5;
      a.master.connect(a.ctx.destination);
    }
    if (a.ctx.state === 'suspended') a.ctx.resume();
  } catch (e) { a.ctx = null; }
}

// one enveloped oscillator voice
function voice(a, { type = 'sine', f0, f1, t = 0.12, gain = 0.2, delay = 0 }) {
  const c = a.ctx, now = c.currentTime + delay;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, now);
  if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), now + t);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, now + t);
  o.connect(g); g.connect(a.master);
  o.start(now); o.stop(now + t + 0.02);
}

// short filtered-noise burst (used for the hunter-death crunch)
function noise(a, { t = 0.18, gain = 0.25, cutoff = 900 }) {
  const c = a.ctx, now = c.currentTime;
  const n = Math.floor(c.sampleRate * t);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  let s = 1234567;                       // deterministic PRNG (no Math.random)
  for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 1073741823 - 1) * (1 - i / n); }
  const src = c.createBufferSource(); src.buffer = buf;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cutoff;
  const g = c.createGain(); g.gain.value = gain;
  src.connect(lp); lp.connect(g); g.connect(a.master);
  src.start(now);
}

// Called each frame with the current sim + scenario. Compares against what it
// last saw and voices the deltas: harvest ticks, hunter deaths, win/lose sting.
export function audioTick(a, sim, sc) {
  if (!a.ctx || !a.on) return;
  try {
    // hunter slain — low crunch + a satisfied drop
    if (sim.spidersKilled > a.seenKills) {
      a.seenKills = sim.spidersKilled;
      noise(a, { t: 0.2, gain: 0.3, cutoff: 1100 });
      voice(a, { type: 'triangle', f0: 220, f1: 90, t: 0.22, gain: 0.22 });
    }
    // harvest — a soft high tick, throttled to every ~45 stores so it pulses
    // with the economy rather than machine-gunning
    if (sim.foodBanked - a.seenBanked >= 45) {
      a.seenBanked = sim.foodBanked;
      if (sim.time - a.lastBlip > 0.05) {
        a.lastBlip = sim.time;
        voice(a, { type: 'sine', f0: 880, f1: 1180, t: 0.07, gain: 0.10 });
      }
    }
    // end sting — rising major triad on a win, falling on a loss (once)
    if (sc.over && !a.over) {
      a.over = true;
      const notes = sc.won ? [523, 659, 784, 1047] : [440, 349, 262];
      notes.forEach((f, i) => voice(a, { type: 'triangle', f0: f, t: 0.35, gain: 0.24, delay: i * 0.13 }));
    }
  } catch (e) { /* audio must never break the loop */ }
}
