// Structural difficulty features per generated seed. Uses the true BFS path
// distance field (homeDist) — not straight-line — so it reflects how far ants
// actually walk. Prints one row per seed for correlation against bot outcomes.
import { chromium } from 'playwright';

const N = parseInt(process.argv[2] || '16', 10);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });

const rows = [];
for (let i = 0; i < N; i++) {
  const seed = 1000 + i * 97;
  await page.goto(`http://localhost:8123/game/index.html?seed=${seed}&fast=1&ticks=3`, { waitUntil: 'load' });
  await page.waitForFunction('window.__DONE === true', { timeout: 15000 });
  const r = await page.evaluate(() => {
    const w = window.__SIM.world;
    const CELL = 8, GW = 160;
    const hd = (x, y) => w.homeDist[((y / CELL) | 0) * GW + ((x / CELL) | 0)] * CELL; // px path length
    const nest = w.nest;
    const guard = w.spiders[0], mid = w.spiders[1];
    const piles = w.piles;
    // path distance from nest to each pile and to the guard den
    const pileDist = piles.map((p) => hd(p.x, p.y));
    const guardDist = hd(guard.hx, guard.hy);
    const midDist = hd(mid.hx, mid.hy);
    // guard-route exposure: how close the mid roamer sits to the straight
    // nest->guard corridor (a proxy for "the assault march runs the gauntlet")
    const ax = guard.hx - nest.x, ay = guard.hy - nest.y;
    const t = Math.max(0, Math.min(1, ((mid.hx - nest.x) * ax + (mid.hy - nest.y) * ay) / (ax * ax + ay * ay)));
    const cx = nest.x + ax * t, cy = nest.y + ay * t;
    const midToCorridor = Math.hypot(mid.hx - cx, mid.hy - cy);
    return {
      seed: w.seed,
      guardDist: Math.round(guardDist),
      midDist: Math.round(midDist),
      totalTravel: Math.round(pileDist.reduce((a, b) => a + b, 0)),
      midCorridor: Math.round(midToCorridor),
      guardTr: Math.round(guard.tr),
      midTr: Math.round(mid.tr),
    };
  });
  rows.push(r);
}
// print aligned table
const cols = ['seed', 'guardDist', 'midDist', 'totalTravel', 'midCorridor', 'guardTr', 'midTr'];
console.log(cols.join('\t'));
for (const r of rows) console.log(cols.map((c) => r[c]).join('\t'));
await browser.close();
