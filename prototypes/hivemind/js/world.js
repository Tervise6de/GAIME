// World: geometry, fields, food, spiders, nest. Fixed layout, seeded variation.
import { mulberry32 } from './rng.js';

export const W = 1280, H = 720;
export const CELL = 8;                       // field grid cell size (px)
export const GW = W / CELL, GH = H / CELL;   // 160 x 90

export const F = { LURE: 0, FEAR: 1, WAR: 2, TRAIL: 3 };
export const DECAY = [0.99971, 0.99971, 0.9988, 0.99808]; // per-tick @60Hz

export function makeWorld(seed) {
  const rng = mulberry32(seed);
  const fields = [0, 1, 2, 3].map(() => new Float32Array(GW * GH));
  const scratch = new Float32Array(GW * GH);
  const blocked = new Uint8Array(GW * GH);

  // --- rocks: partial walls shaping three route options ---
  const rocks = [];
  function rock(x, y, r) { rocks.push({ x, y, r }); }
  // wall segment above center corridor
  for (let i = 0; i < 6; i++) rock(430 + i * 52, 150 + (rng() - 0.5) * 20, 34 + rng() * 10);
  // wall segment below center, leaving a bottom lane
  for (let i = 0; i < 5; i++) rock(520 + i * 56, 560 + (rng() - 0.5) * 24, 30 + rng() * 10);
  // scatter
  rock(330, 430, 40); rock(900, 170, 46); rock(1010, 330, 36); rock(760, 640, 34);

  for (const r of rocks) {
    const x0 = Math.max(0, ((r.x - r.r) / CELL) | 0), x1 = Math.min(GW - 1, ((r.x + r.r) / CELL) | 0);
    const y0 = Math.max(0, ((r.y - r.r) / CELL) | 0), y1 = Math.min(GH - 1, ((r.y + r.r) / CELL) | 0);
    for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
      const dx = gx * CELL + CELL / 2 - r.x, dy = gy * CELL + CELL / 2 - r.y;
      if (dx * dx + dy * dy < r.r * r.r) blocked[gy * GW + gx] = 1;
    }
  }
  // border walls
  for (let gx = 0; gx < GW; gx++) { blocked[gx] = 1; blocked[(GH - 1) * GW + gx] = 1; }
  for (let gy = 0; gy < GH; gy++) { blocked[gy * GW] = 1; blocked[gy * GW + GW - 1] = 1; }

  const nest = { x: 170, y: 360, r: 34 };

  // --- home distance field (BFS from nest through walkable cells) ---
  const homeDist = new Float32Array(GW * GH).fill(1e9);
  {
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
  }

  // --- food piles: rich pile inside spider ground; safer piles further away ---
  const piles = [
    { x: 660, y: 300, amount: 900, r: 42, label: 'rich' },   // guarded
    { x: 1090, y: 560, amount: 550, r: 36, label: 'far' },   // safe via bottom lane
    { x: 1060, y: 120, amount: 450, r: 32, label: 'high' },  // safe via top, longer
  ];

  // --- spiders guarding the middle ---
  const spiders = [
    { x: 620, y: 260, hx: 620, hy: 260, tr: 120, hp: 260, maxhp: 260, a: rng() * 6.28, alive: true },
    { x: 800, y: 400, hx: 800, hy: 400, tr: 110, hp: 260, maxhp: 260, a: rng() * 6.28, alive: true },
  ];

  return { rng, fields, scratch, blocked, rocks, nest, homeDist, piles, spiders };
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
