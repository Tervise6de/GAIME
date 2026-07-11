// Cross-seed winnability / difficulty proxy sweep.
// Runs the GENERALIZED commander (gcommander) headless across N generated
// seeds and reports, per seed: win/loss, net stores, gathered, deaths, and
// how completely each pile was harvested. This is a DIFFICULTY/BALANCE PROXY,
// not proof of human winnability — gcommander is a fixed generic heuristic
// that under-serves distant piles (see PLAYTEST_LOG). What it measures well is
// RELATIVE variance across generated maps: are they consistently reachable and
// harvestable, or do some collapse / trivialise?
//
// Usage: node tools/win_sweep.mjs [count] [fast] [firstSeed] [stride]
import { chromium } from 'playwright';

// Either a strided range (count fast first stride) or an explicit seed list
// via --seeds=1,2,3 (fast is then argv[3] if numeric, else default 60).
const seedsArg = process.argv.find((a) => a.startsWith('--seeds='));
const explicit = seedsArg ? seedsArg.slice('--seeds='.length).split(',').map(Number) : null;
const N = parseInt(process.argv[2] || '16', 10);
const fast = parseInt((process.argv[3] && /^\d+$/.test(process.argv[3]) ? process.argv[3] : '') || '40', 10);
const first = parseInt(process.argv[4] || '1000', 10);
const stride = parseInt(process.argv[5] || '97', 10);
const WALL = parseInt((process.env.WALL_MS || '200000'), 10);
const seeds = explicit || Array.from({ length: N }, (_, i) => first + i * stride);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

const rows = [];
for (const seed of seeds) {
  // FRESH page per seed: reusing one page across many long runs accumulates
  // slowdown and false-times-out the longer games. A clean slate each time
  // matches run_proto's behaviour and keeps wall-time honest.
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:8123/game/index.html?seed=${seed}&auto=gcommander&fast=${fast}`, { waitUntil: 'load' });
  // poll __DONE like tools/run_proto.mjs does — waitForFunction proved
  // unreliable on long/losing games (false timeouts; see CLAUDE.md note,
  // now fixed here)
  const t0 = Date.now();
  let done = false;
  while (Date.now() - t0 < WALL) {
    done = await page.evaluate('window.__DONE === true').catch(() => false);
    if (done) break;
    await new Promise((res) => setTimeout(res, 250));
  }
  const r = done ? await page.evaluate(() => window.__RESULTS).catch(() => null) : null;
  if (!r) {
    console.error(`seed ${seed}: TIMEOUT (no __DONE after ${WALL}ms)`);
    rows.push({ seed, won: null, stores: null, timeout: true });
    await page.close();
    continue;
  }
  await page.close();
  const piles = r.piles.map((p) => `${p.label}:${Math.round(100 * p.taken / (p.taken + p.left || 1))}%`).join(' ');
  rows.push({
    seed, won: r.won, stores: r.foodStock, gathered: r.gathered,
    died: r.died, time: r.time, cov: piles, gclog: r.gclog,
  });
  console.error(`seed ${seed}: ${r.won ? 'WON ' : 'lost'} stores=${r.foodStock} gathered=${r.gathered} died=${r.died} t=${r.time} | ${piles}`);
}
await browser.close();

const done = rows.filter((r) => r.won !== null);
const wins = done.filter((r) => r.won).length;
const stores = done.map((r) => r.stores).sort((a, b) => a - b);
const mean = stores.reduce((a, b) => a + b, 0) / (stores.length || 1);
const median = stores.length ? stores[stores.length >> 1] : 0;
console.log(JSON.stringify({
  bot: 'gcommander', seeds: seeds.length, completed: done.length,
  wins, winRate: +(wins / (done.length || 1)).toFixed(3),
  storesMean: Math.round(mean), storesMedian: median,
  storesMin: stores[0], storesMax: stores[stores.length - 1],
  quota: 1200, rows,
}, null, 2));
