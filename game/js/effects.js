// Procedural, asset-free juice: delivery pulses at the nest and death bursts at
// slain hunters. Purely COSMETIC — driven by observed sim events, never feeding
// back into the deterministic sim (uses Math.random, which is UI-only here, not
// the seeded sim RNG). Kept in its own layer so the sim stays pure and testable.
const MAXP = 500;

export function makeEffects() {
  return {
    px: new Float32Array(MAXP), py: new Float32Array(MAXP),
    vx: new Float32Array(MAXP), vy: new Float32Array(MAXP),
    life: new Float32Array(MAXP), max: new Float32Array(MAXP),
    r: new Float32Array(MAXP), cr: new Uint8Array(MAXP), cg: new Uint8Array(MAXP), cb: new Uint8Array(MAXP),
    head: 0,
    nestPulse: 0,          // 0..1 glow at the nest, driven by delivery rate
    ringR: 0, ringA: 0,    // expanding shock ring on the last hunter death
    ringX: 0, ringY: 0,
  };
}

function emit(fx, x, y, vx, vy, life, rad, cr, cg, cb) {
  const i = fx.head; fx.head = (fx.head + 1) % MAXP;
  fx.px[i] = x; fx.py[i] = y; fx.vx[i] = vx; fx.vy[i] = vy;
  fx.life[i] = life; fx.max[i] = life; fx.r[i] = rad;
  fx.cr[i] = cr; fx.cg[i] = cg; fx.cb[i] = cb;
}

// a hunter falls: warm ember burst + a shock ring
export function deathBurst(fx, x, y) {
  fx.ringX = x; fx.ringY = y; fx.ringR = 12; fx.ringA = 0.9;
  const n = 26;
  for (let k = 0; k < n; k++) {
    const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 190;
    const warm = Math.random();
    emit(fx, x, y, Math.cos(a) * sp, Math.sin(a) * sp, 0.5 + Math.random() * 0.7,
      1.6 + Math.random() * 2.4, 255, 90 + (warm * 120) | 0, 40 + (warm * 40) | 0);
  }
}

// food reaches the nest: bump the pulse and flick an occasional golden spark
export function deliveryPing(fx, x, y, strength) {
  fx.nestPulse = Math.min(1.2, fx.nestPulse + 0.05 * strength);
  const sparks = Math.min(4, Math.round(strength));
  for (let k = 0; k < sparks; k++) {
    const a = Math.random() * Math.PI * 2, sp = 20 + Math.random() * 55;
    emit(fx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, Math.cos(a) * sp, Math.sin(a) * sp - 20,
      0.4 + Math.random() * 0.4, 1.2 + Math.random() * 1.6, 255, 220, 150);
  }
}

export function updateEffects(fx, dt) {
  for (let i = 0; i < MAXP; i++) {
    if (fx.life[i] <= 0) continue;
    fx.life[i] -= dt;
    fx.px[i] += fx.vx[i] * dt; fx.py[i] += fx.vy[i] * dt;
    fx.vx[i] *= 0.92; fx.vy[i] = fx.vy[i] * 0.92 + 60 * dt; // drag + gentle settle
  }
  fx.nestPulse *= 0.94;
  if (fx.ringA > 0) { fx.ringR += 260 * dt; fx.ringA -= 1.6 * dt; }
}

export function drawEffects(ctx, fx, nest) {
  // nest delivery pulse — a breathing golden ring that scales with recent income
  if (fx.nestPulse > 0.01) {
    const p = fx.nestPulse;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(nest.x, nest.y, nest.r * 0.5, nest.x, nest.y, nest.r + 12 + p * 26);
    g.addColorStop(0, `rgba(255,225,150,${0.05 + p * 0.14})`);
    g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nest.x, nest.y, nest.r + 12 + p * 26, 0, 7); ctx.fill();
    ctx.restore();
  }
  // hunter death shock ring
  if (fx.ringA > 0.02) {
    ctx.save();
    ctx.strokeStyle = `rgba(255,120,70,${fx.ringA})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(fx.ringX, fx.ringY, fx.ringR, 0, 7); ctx.stroke();
    ctx.restore();
  }
  // particles (additive embers / sparks)
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < MAXP; i++) {
    if (fx.life[i] <= 0) continue;
    const a = fx.life[i] / fx.max[i];
    ctx.fillStyle = `rgba(${fx.cr[i]},${fx.cg[i]},${fx.cb[i]},${a * 0.9})`;
    ctx.beginPath(); ctx.arc(fx.px[i], fx.py[i], fx.r[i] * (0.4 + a * 0.6), 0, 7); ctx.fill();
  }
  ctx.restore();
}
