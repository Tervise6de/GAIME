// Static difficulty features per generated map (generation-only, no full sim —
// so it is cheap enough to run at "new territory" time). For each seed it dumps
// the nest→pile walking distances (from the BFS homeDist already built by the
// world) and the guard/mid hunter reach. Paired with bot_sweep win-times these
// features let us (a) predict difficulty without a 480s sim and (b) reject
// geometric outliers so generated territories land in a difficulty band.
import { chromium } from 'playwright';

const N = parseInt(process.argv[2] || '24', 10);
const firstSeed = parseInt(process.argv[3] || '1000', 10);
const step = parseInt(process.argv[4] || '97', 10);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });

const rows = [];
for (let i = 0; i < N; i++) {
  const seed = firstSeed + i * step;
  await page.goto(`http://localhost:8123/game/index.html?seed=${seed}&fast=1&ticks=3`, { waitUntil: 'load' });
  await page.waitForFunction('window.__DONE === true', { timeout: 20000 });
  const r = await page.evaluate(() => {
    const w = window.__SIM.world;
    const CELL = 8, GW = 160;
    const pd = w.piles.map((p) => Math.round(w.homeDist[((p.y / CELL) | 0) * GW + ((p.x / CELL) | 0)] * CELL));
    // exposure: how much of each pile's straight nest-line passes through hunter
    // ground (a crude proxy for how contested the route is)
    const exposure = w.piles.map((p) => {
      let hits = 0;
      for (let t = 0; t <= 20; t++) {
        const x = w.nest.x + (p.x - w.nest.x) * (t / 20), y = w.nest.y + (p.y - w.nest.y) * (t / 20);
        if (w.spiders.some((s) => Math.hypot(s.hx - x, s.hy - y) < s.tr)) hits++;
      }
      return hits;
    });
    return {
      seed: w.seed,
      pileDist: pd,                       // walking distance nest→each pile (px)
      distSum: pd.reduce((a, b) => a + b, 0),
      distMax: Math.max(...pd),
      exposure,                           // /21 samples of the straight line in hunter ground
      expSum: exposure.reduce((a, b) => a + b, 0),
      guardTr: Math.round(w.spiders[0].tr),
    };
  });
  rows.push(r);
  console.error(`seed ${r.seed} dist=[${r.pileDist}] sum=${r.distSum} max=${r.distMax} exp=[${r.exposure}] expSum=${r.expSum} guard=${r.guardTr}`);
}
console.log(JSON.stringify(rows));
await browser.close();
