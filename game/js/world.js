// World: geometry, fields, food, spiders, nest.
// Seed 7 is the handcrafted "First Season" map (all balance evidence lives
// there). Any other seed generates a territory with structural fairness
// guarantees: every pile reachable from the nest, the two lesser piles
// outside hunter ground, the richest pile guarded, dens away from the nest.
import { mulberry32 } from './rng.js';

export const W = 1280, H = 720;
export const CELL = 8;                       // field grid cell size (px)
export const GW = W / CELL, GH = H / CELL;   // 160 x 90

export const F = { LURE: 0, FEAR: 1, WAR: 2, TRAIL: 3 };
export const DECAY = [0.99971, 0.99971, 0.9988, 0.99808]; // per-tick @60Hz

function buildBlocked(rocks) {
  const blocked = new Uint8Array(GW * GH);
  for (const r of rocks) {
    const x0 = Math.max(0, ((r.x - r.r) / CELL) | 0), x1 = Math.min(GW - 1, ((r.x + r.r) / CELL) | 0);
    const y0 = Math.max(0, ((r.y - r.r) / CELL) | 0), y1 = Math.min(GH - 1, ((r.y + r.r) / CELL) | 0);
    for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
      const dx = gx * CELL + CELL / 2 - r.x, dy = gy * CELL + CELL / 2 - r.y;
      if (dx * dx + dy * dy < r.r * r.r) blocked[gy * GW + gx] = 1;
    }
  }
  for (let gx = 0; gx < GW; gx++) { blocked[gx] = 1; blocked[(GH - 1) * GW + gx] = 1; }
  for (let gy = 0; gy < GH; gy++) { blocked[gy * GW] = 1; blocked[gy * GW + GW - 1] = 1; }
  return blocked;
}

function buildHomeDist(blocked, nest) {
  const homeDist = new Float32Array(GW * GH).fill(1e9);
  const q = [];
  const ngx = (nest.x / CELL) | 0, ngy = (nest.y / CELL) | 0;
  homeDist[ngy * GW + ngx] = 0; q.push(ngx, ngy);
  let head = 0;
  while (head < q.length) {
    const cx = q[head++], cy = q[head++];
    const d = homeDist[cy * GW + cx];
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = cx + ox, ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const idx = ny * GW + nx;
      if (blocked[idx]) continue;
      const nd = d + (ox && oy ? 1.4142 : 1);
      if (nd < homeDist[idx]) { homeDist[idx] = nd; q.push(nx, ny); }
    }
  }
  return homeDist;
}

function handcraftedLayout(rng) {
  const rocks = [];
  const rock = (x, y, r) => rocks.push({ x, y, r });
  for (let i = 0; i < 6; i++) rock(430 + i * 52, 150 + (rng() - 0.5) * 20, 34 + rng() * 10);
  for (let i = 0; i < 5; i++) rock(520 + i * 56, 560 + (rng() - 0.5) * 24, 30 + rng() * 10);
  rock(330, 430, 40); rock(900, 170, 46); rock(1010, 330, 36); rock(770, 606, 34);
  return {
    rocks,
    nest: { x: 170, y: 360, r: 34 },
    piles: [
      { x: 660, y: 300, amount: 900, r: 42, rate: 6, budget: 0, label: 'rich' },
      { x: 1090, y: 560, amount: 700, r: 36, rate: 5, budget: 0, label: 'far' },
      { x: 1060, y: 120, amount: 600, r: 32, rate: 4, budget: 0, label: 'high' },
    ],
    spiders: [
      { x: 620, y: 260, hx: 620, hy: 260, tr: 120, hp: 260, maxhp: 260, a: rng() * 6.28, alive: true },
      { x: 800, y: 400, hx: 800, hy: 400, tr: 110, hp: 260, maxhp: 260, a: rng() * 6.28, alive: true },
    ],
  };
}

function generatedLayout(rng) {
  const nest = { x: 130 + rng() * 90, y: 180 + rng() * 360, r: 34 };
  const rocks = [];
  const rock = (x, y, r) => rocks.push({ x, y, r });
  // two loose wall motifs + scatter, none allowed to bury the nest
  for (let w = 0; w < 2; w++) {
    const segs = 4 + (rng() * 3 | 0);
    let wx = 380 + rng() * 260, wy = 90 + rng() * 500;
    const dir = rng() * Math.PI * (rng() < 0.5 ? 0.14 : -0.14);
    for (let i = 0; i < segs; i++) {
      rock(wx, wy, 30 + rng() * 12);
      wx += Math.cos(dir) * 54; wy += Math.sin(dir) * 54;
    }
  }
  for (let i = 0; i < 4; i++) {
    let x, y;
    do { x = 260 + rng() * 950; y = 60 + rng() * 600; }
    while (Math.hypot(x - nest.x, y - nest.y) < 180);
    rock(x, y, 30 + rng() * 18);
  }
  // piles: richest guarded later; amounts fixed, positions sampled
  const amounts = [[900, 6, 42, 'rich'], [700, 5, 36, 'far'], [600, 4, 32, 'high']];
  const piles = [];
  for (const [amount, rate, r, label] of amounts) {
    for (let tries = 0; tries < 80; tries++) {
      const x = 480 + rng() * 720, y = 70 + rng() * 580;
      if (Math.hypot(x - nest.x, y - nest.y) < 300) continue;
      if (piles.some((p) => Math.hypot(x - p.x, y - p.y) < 260)) continue;
      piles.push({ x, y, amount, r, rate, budget: 0, label });
      break;
    }
  }
  if (piles.length < 3) return null;
  // hunter dens: one guards the richest pile, one roams mid-map
  const rich = piles[0];
  const ga = rng() * Math.PI * 2;
  const guard = { hx: rich.x + Math.cos(ga) * 70, hy: rich.y + Math.sin(ga) * 70, tr: 115 + rng() * 15 };
  let mid = null;
  for (let tries = 0; tries < 80; tries++) {
    const x = 420 + rng() * 560, y = 120 + rng() * 480;
    if (Math.hypot(x - nest.x, y - nest.y) < 330) continue;
    // the two lesser piles must stay outside hunter ground
    if (piles.slice(1).some((p) => Math.hypot(x - p.x, y - p.y) < 115 + 40 + p.r)) continue;
    if (Math.hypot(x - guard.hx, y - guard.hy) < 240) continue;
    mid = { hx: x, hy: y, tr: 100 + rng() * 20 };
    break;
  }
  if (!mid) return null;
  if (piles.slice(1).some((p) => Math.hypot(guard.hx - p.x, guard.hy - p.y) < guard.tr + p.r)) return null;
  const mkSpider = (d) => ({ x: d.hx, y: d.hy, hx: d.hx, hy: d.hy, tr: d.tr, hp: 260, maxhp: 260, a: rng() * 6.28, alive: true });
  return { rocks, nest, piles, spiders: [mkSpider(guard), mkSpider(mid)] };
}

export function makeWorld(seed) {
  const rng = mulberry32(seed);
  const fields = [0, 1, 2, 3].map(() => new Float32Array(GW * GH));
  const scratch = new Float32Array(GW * GH);

  for (let attempt = 0; attempt < 60; attempt++) {
    const layout = seed === 7 ? handcraftedLayout(rng) : generatedLayout(rng);
    if (!layout) continue;
    const { rocks, nest, piles, spiders } = layout;
    // nest must not be buried
    const blocked = buildBlocked(rocks);
    const nIdx = ((nest.y / CELL) | 0) * GW + ((nest.x / CELL) | 0);
    if (blocked[nIdx]) continue;
    const homeDist = buildHomeDist(blocked, nest);
    // FAIRNESS GUARANTEE: every pile reachable from the nest on foot
    const reachable = piles.every((p) => {
      const idx = ((p.y / CELL) | 0) * GW + ((p.x / CELL) | 0);
      return homeDist[idx] < 1e8;
    });
    if (!reachable) continue;
    return { rng, fields, scratch, blocked, rocks, nest, homeDist, piles, spiders, seed, genAttempts: attempt + 1 };
  }
  // fallback: the handcrafted map always works
  const layout = handcraftedLayout(rng);
  const blocked = buildBlocked(layout.rocks);
  const homeDist = buildHomeDist(blocked, layout.nest);
  return { rng, fields, scratch, blocked, ...layout, homeDist, seed, genAttempts: -1 };
}

export function idxAt(x, y) {
  const gx = Math.min(GW - 1, Math.max(0, (x / CELL) | 0));
  const gy = Math.min(GH - 1, Math.max(0, (y / CELL) | 0));
  return gy * GW + gx;
}

// stamp a radial blob into a field: v = max(v, s*falloff)
export function stamp(field, x, y, r, s) {
  const x0 = Math.max(0, ((x - r) / CELL) | 0), x1 = Math.min(GW - 1, ((x + r) / CELL) | 0);
  const y0 = Math.max(0, ((y - r) / CELL) | 0), y1 = Math.min(GH - 1, ((y + r) / CELL) | 0);
  for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
    const dx = gx * CELL + CELL / 2 - x, dy = gy * CELL + CELL / 2 - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < r * r) {
      const f = 1 - Math.sqrt(d2) / r;
      const i = gy * GW + gx;
      const v = s * f;
      if (v > field[i]) field[i] = v;
    }
  }
}

export function erase(fields, x, y, r) {
  const x0 = Math.max(0, ((x - r) / CELL) | 0), x1 = Math.min(GW - 1, ((x + r) / CELL) | 0);
  const y0 = Math.max(0, ((y - r) / CELL) | 0), y1 = Math.min(GH - 1, ((y + r) / CELL) | 0);
  for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
    const dx = gx * CELL + CELL / 2 - x, dy = gy * CELL + CELL / 2 - y;
    if (dx * dx + dy * dy < r * r) {
      const i = gy * GW + gx;
      for (const k of [F.LURE, F.FEAR, F.WAR]) fields[k][i] *= 0.15;
    }
  }
}
