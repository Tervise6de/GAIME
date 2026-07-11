// Cross-seed winnability + difficulty sweep. Runs the generalized commander bot
// (a proxy for skilled play) and a control strategy across N generated seeds and
// reports, per seed: outcome, win-time, stores, per-pile extraction. The point
// is to show generated territories are not merely FAIR (gen_check.mjs) but
// actually BEATABLE by competent play, and to surface the difficulty spread.
//
// Usage: node tools/bot_sweep.mjs [count] [strategies] [fast] [firstSeed] [step]
//   count       number of seeds (default 24)
//   strategies  comma list, default "commander" (add "naive"/"idle" for controls)
//   fast        sim ticks/frame (default 30)
//   firstSeed   first seed (default 1000)
//   step        seed step (default 97; matches gen_check.mjs)
import { chromium } from 'playwright';

const count = parseInt(process.argv[2] || '24', 10);
const strategies = (process.argv[3] || 'commander').split(',').filter(Boolean);
const fast = parseInt(process.argv[4] || '30', 10);
const firstSeed = parseInt(process.argv[5] || '1000', 10);
const step = parseInt(process.argv[6] || '97', 10);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
page.setDefaultTimeout(150000);
page.on('pageerror', (e) => console.error('[pageerror]', e.message));

async function runOne(seed, strat) {
  await page.goto(`http://localhost:8123/game/index.html?seed=${seed}&auto=${strat}&fast=${fast}`, { waitUntil: 'load' });
  await page.waitForFunction('window.__DONE === true', { timeout: 150000 });
  return page.evaluate(() => ({
    seed: window.__RESULTS.seed,
    won: window.__RESULTS.won,
    time: window.__RESULTS.time,
    stock: window.__RESULTS.foodStock,
    died: window.__RESULTS.died,
    slain: window.__RESULTS.spidersSlain,
    colony: window.__RESULTS.colony,
    piles: window.__RESULTS.piles,
    attempts: window.__SIM.world.genAttempts,
  }));
}

const rows = {};
for (const strat of strategies) rows[strat] = [];
for (let i = 0; i < count; i++) {
  const seed = firstSeed + i * step;
  for (const strat of strategies) {
    let r;
    try {
      r = await runOne(seed, strat);
    } catch (e) {
      r = { seed, won: false, time: -1, stock: -1, died: -1, slain: -1, colony: -1, piles: [], dnf: true };
      console.error(`seed ${seed} ${strat.padEnd(9)} DNF  (${e.name})`);
    }
    rows[strat].push(r);
    if (r.dnf) continue;
    const piles = r.piles.map((p) => `${p.label[0]}${p.taken}`).join(' ');
    console.error(`seed ${seed} ${strat.padEnd(9)} ${r.won ? 'WIN ' : 'lose'} t=${String(r.time).padStart(5)} stock=${String(r.stock).padStart(4)} died=${r.died} slain=${r.slain} [${piles}]`);
  }
}

console.log('\n=== SUMMARY ===');
for (const strat of strategies) {
  const rs = rows[strat];
  const wins = rs.filter((r) => r.won);
  const winTimes = wins.map((r) => r.time).sort((a, b) => a - b);
  const med = winTimes.length ? winTimes[winTimes.length >> 1] : null;
  console.log(JSON.stringify({
    strategy: strat,
    seeds: rs.length,
    wins: wins.length,
    winRate: +(wins.length / rs.length).toFixed(3),
    winTime: winTimes.length ? { min: winTimes[0], median: med, max: winTimes[winTimes.length - 1] } : null,
    losses: rs.filter((r) => !r.won).map((r) => ({ seed: r.seed, stock: r.stock, colony: r.colony })),
  }));
}
await browser.close();
