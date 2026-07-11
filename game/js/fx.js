// Juice layer: transient particles + procedural audio, driven entirely off
// sim counter deltas (foodBanked, spidersKilled) so nothing hooks into the hot
// sim loop. Purely cosmetic — headless/auto runs may spawn effects harmlessly.
// All audio is synthesized (WebAudio oscillators); no asset files, licence-clean.

export function makeFx() {
  return {
    parts: [], rings: [],
    nestGlow: 0,
    prevBanked: 0, prevKilled: 0, prevStock: 0,
    audio: null, muted: false,
  };
}

function burst(fx, x, y, col, n, spd) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const v = spd * (0.5 + Math.random());
    fx.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, max: 0.5 + Math.random() * 0.4, col, sz: 1.4 + Math.random() * 1.6 });
  }
}
function ring(fx, x, y, col, maxR, width) {
  fx.rings.push({ x, y, r: maxR * 0.15, max: maxR, life: 1, col, width });
}

// detect discrete sim events since last frame and spawn effects for them
export function fxDetect(fx, sim, world) {
  const db = sim.foodBanked - fx.prevBanked;
  if (db > 0) {
    // nest breathes brighter with recent delivery rate; occasional pulse ring
    fx.nestGlow = Math.min(1.4, fx.nestGlow + db * 0.015);
    if (Math.random() < Math.min(0.6, db * 0.05)) ring(fx, world.nest.x, world.nest.y, '255,220,150', world.nest.r + 34, 2);
  }
  fx.prevBanked = sim.foodBanked;

  // stockpile milestones — a soft tick every 200 stored
  if (((sim.foodStock / 200) | 0) > ((fx.prevStock / 200) | 0)) blip(fx, 520, 0.06, 'sine', 0.05);
  fx.prevStock = sim.foodStock;

  const dk = sim.spidersKilled - fx.prevKilled;
  if (dk > 0) {
    for (const sp of world.spiders) {
      if (!sp.alive && !sp._fxDead) {
        sp._fxDead = 1;
        burst(fx, sp.x, sp.y, '255,110,70', 22, 120);
        ring(fx, sp.x, sp.y, '255,90,60', 90, 3);
        blip(fx, 190, 0.22, 'sawtooth', 0.09, 60); // descending death tone
      }
    }
  }
  fx.prevKilled = sim.spidersKilled;
}

export function fxUpdate(fx, dt) {
  const drag = Math.pow(0.06, dt);
  for (let i = fx.parts.length - 1; i >= 0; i--) {
    const p = fx.parts[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= drag; p.vy *= drag;
    p.life -= dt / p.max;
    if (p.life <= 0) fx.parts.splice(i, 1);
  }
  for (let i = fx.rings.length - 1; i >= 0; i--) {
    const r = fx.rings[i];
    r.r += (r.max - r.r) * Math.min(1, dt * 6); r.life -= dt * 1.6;
    if (r.life <= 0) fx.rings.splice(i, 1);
  }
  fx.nestGlow = Math.max(0, fx.nestGlow - dt * 0.9);
}

export function fxDraw(ctx, fx, world) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // nest delivery glow
  if (fx.nestGlow > 0.01) {
    const n = world.nest, R = n.r + 30 + fx.nestGlow * 30;
    const g = ctx.createRadialGradient(n.x, n.y, 2, n.x, n.y, R);
    g.addColorStop(0, `rgba(255,225,160,${0.28 * Math.min(1, fx.nestGlow)})`);
    g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, R, 0, 7); ctx.fill();
  }
  for (const r of fx.rings) {
    ctx.strokeStyle = `rgba(${r.col},${0.5 * r.life})`;
    ctx.lineWidth = r.width;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 7); ctx.stroke();
  }
  for (const p of fx.parts) {
    ctx.fillStyle = `rgba(${p.col},${p.life})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * (0.4 + p.life * 0.6), 0, 7); ctx.fill();
  }
  ctx.restore();
}

// --- procedural audio (created lazily; must be resumed on a user gesture) ----
export function fxAudioStart(fx) {
  if (fx.audio || fx.muted) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  fx.audio = new AC();
  if (fx.audio.state === 'suspended') fx.audio.resume();
}
function blip(fx, freq, dur, type, gain, toFreq) {
  const ac = fx.audio;
  if (!ac || fx.muted || ac.state !== 'running') return;
  const t = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (toFreq) o.frequency.exponentialRampToValueAtTime(toFreq, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination);
  o.start(t); o.stop(t + dur);
}
