// Cross-seed winnability sweep. Runs the map-derived `general` bot on N
// generated seeds in a single browser and reports, per seed, whether the
// full-competence bot can win "The First Season". This measures whether the
// generated territories are actually BEATABLE (a balance guarantee), not just
// structurally fair (reachability, which world.js already guarantees).
//
// Usage: node tools/sweep_winnable.mjs [--seeds 2-25] [--auto general] [--fast 16]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const spec = opt('--seeds', '2-25');
const auto = opt('--auto', 'general');
const fast = opt('--fast', '16');
const base = opt('--base', 'http://localhost:8123/game/index.html');

let seeds = [];
if (spec.includes('-')) { const [a, b] = spec.split('-').map(Number); for (let s = a; s <= b; s++) seeds.push(s); }
else seeds = spec.split(',').map(Number);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));

const rows = [];
for (const seed of seeds) {
  const url = `${base}?seed=${seed}&auto=${auto}&fast=${fast}`;
  await page.goto(url, { waitUntil: 'load' });
  // drive to completion with a wall-clock guard
  const t0 = Date.now();
  let done = false;
  while (Date.now() - t0 < 90_000) {
    done = await page.evaluate('window.__DONE === true').catch(() => false);
    if (done) break;
    await new Promise((r) => setTimeout(r, 120));
  }
  const r = await page.evaluate('window.__RESULTS || null').catch(() => null);
  const genAttempts = await page.evaluate('window.__SIM ? window.__SIM.world.genAttempts : null').catch(() => null);
  const row = r
    ? { seed, won: r.won, food: r.foodStock, quota: 1200, died: r.died, slain: r.spidersSlain, time: r.time, gen: genAttempts }
    : { seed, won: null, note: 'no result (timeout)' };
  rows.push(row);
  console.error(`seed ${seed}: ${row.won ? 'WIN ' : 'loss'} food=${row.food}/${row.quota} died=${row.died} t=${row.time} gen=${row.gen}`);
}

const wins = rows.filter((r) => r.won === true).length;
const played = rows.filter((r) => r.won !== null).length;
console.log(JSON.stringify({
  auto, fast: +fast, seeds: spec,
  winnable: wins, played, winRate: +(wins / played).toFixed(3),
  losses: rows.filter((r) => r.won === false).map((r) => ({ seed: r.seed, food: r.food })),
  rows,
}, null, 2));
await browser.close();
