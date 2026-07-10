// Map-generation fairness check: N random seeds must all produce maps where
// every pile is BFS-reachable from the nest, lesser piles sit outside hunter
// ground, and the nest is not buried. Prints a summary + any violations.
import { chromium } from 'playwright';

const N = parseInt(process.argv[2] || '40', 10);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });

let ok = 0, fails = [];
for (let i = 0; i < N; i++) {
  const seed = 1000 + i * 97;
  await page.goto(`http://localhost:8123/game/index.html?seed=${seed}&fast=1&ticks=3`, { waitUntil: 'load' });
  await page.waitForFunction('window.__DONE === true', { timeout: 15000 });
  const r = await page.evaluate(() => {
    const w = window.__SIM.world;
    const CELL = 8, GW = 160;
    const reach = w.piles.map((p) => w.homeDist[((p.y / CELL) | 0) * GW + ((p.x / CELL) | 0)] < 1e8);
    const guarded = w.piles.filter((p, i) => i > 0 && w.spiders.some(
      (s) => Math.hypot(s.hx - p.x, s.hy - p.y) < s.tr + p.r));
    const nestClear = !w.blocked[((w.nest.y / CELL) | 0) * GW + ((w.nest.x / CELL) | 0)];
    const denFar = w.spiders.every((s) => Math.hypot(s.hx - w.nest.x, s.hy - w.nest.y) >= 240);
    return {
      seed: w.seed, attempts: w.genAttempts, piles: w.piles.length,
      allReachable: reach.every(Boolean), lesserGuarded: guarded.length,
      nestClear, denFar,
    };
  });
  const pass = r.allReachable && r.lesserGuarded === 0 && r.nestClear && r.denFar && r.piles === 3 && r.attempts !== -1;
  if (pass) ok++;
  else fails.push(r);
}
console.log(JSON.stringify({ checked: N, ok, fails }, null, 2));
await browser.close();
