// Winnability sweep: run one or more bot strategies across a range of seeds in
// a single Chromium instance and report per-seed outcomes + aggregate stats.
// This is the balance-guarantee harness (fairness is checked separately by
// gen_check.mjs): a generated territory is only worth shipping if a competent
// commander can actually WIN it, not merely reach every pile.
//
// Usage:
//   node tools/win_sweep.mjs [--seeds 1-30] [--auto commander] [--fast 30]
//                            [--base http://localhost:8123] [--maxwall 60]
//   node tools/win_sweep.mjs --seeds 1-20 --auto commander,idle
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
function parseSeeds(spec) {
  const out = [];
  for (const part of spec.split(',')) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) { for (let i = +m[1]; i <= +m[2]; i++) out.push(i); }
    else out.push(+part);
  }
  return out;
}
const seeds = parseSeeds(opt('--seeds', '1-30'));
const autos = opt('--auto', 'commander').split(',');
const fast = opt('--fast', '30');
const base = opt('--base', 'http://localhost:8123');
const maxWall = parseFloat(opt('--maxwall', '60')) * 1000;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));

const rows = [];
for (const auto of autos) {
  for (const seed of seeds) {
    const url = `${base}/game/index.html?seed=${seed}&auto=${auto}&fast=${fast}`;
    await page.goto(url, { waitUntil: 'load' });
    const t0 = Date.now();
    let done = false;
    while (Date.now() - t0 < maxWall) {
      done = await page.evaluate('window.__DONE === true').catch(() => false);
      if (done) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    const res = await page.evaluate('window.__RESULTS || null').catch(() => null);
    const genAttempts = await page.evaluate('window.__SIM && window.__SIM.world ? window.__SIM.world.genAttempts : null').catch(() => null);
    if (!res) { rows.push({ auto, seed, error: 'no results', wall: (Date.now() - t0) / 1000 }); continue; }
    rows.push({
      auto, seed, won: res.won, time: res.time, food: res.foodStock,
      died: res.died, slain: res.spidersSlain, colony: res.colony,
      genAttempts, wall: +((Date.now() - t0) / 1000).toFixed(1),
    });
  }
}
await browser.close();

// per-strategy summary
const byAuto = {};
for (const r of rows) { (byAuto[r.auto] ||= []).push(r); }
console.log('\nseed  auto        won   time   food   died  slain  colony  gen');
for (const r of rows) {
  if (r.error) { console.log(`${String(r.seed).padStart(4)}  ${r.auto.padEnd(10)}  ERR  ${r.error}`); continue; }
  console.log(
    `${String(r.seed).padStart(4)}  ${r.auto.padEnd(10)}  ${r.won ? 'WIN ' : 'lose'}` +
    `  ${String(r.time).padStart(5)}  ${String(r.food).padStart(5)}  ${String(r.died).padStart(5)}` +
    `  ${String(r.slain).padStart(4)}  ${String(r.colony).padStart(6)}  ${r.genAttempts ?? '-'}`);
}
console.log('\n--- summary ---');
for (const [auto, rs] of Object.entries(byAuto)) {
  const wins = rs.filter((r) => r.won).length;
  const winRows = rs.filter((r) => r.won);
  const avgT = winRows.length ? (winRows.reduce((a, r) => a + r.time, 0) / winRows.length).toFixed(0) : '-';
  const losses = rs.filter((r) => !r.won && !r.error).map((r) => r.seed);
  console.log(`${auto}: ${wins}/${rs.length} won  (avg win time ${avgT}s)` +
    (losses.length ? `  LOSSES: ${losses.join(',')}` : ''));
}
// certified list: seeds the commander (the competence oracle) actually WON.
// This is the only sound winnability signal — no cheap structural proxy
// (guard distance, corridor sealing) separates winnable maps from unwinnable
// ones, so a shipped New-Territory pool must be sim-certified, not generated
// blind. Feed --auto commander only when emitting a pool.
const certified = [...new Set(rows.filter((r) => r.won).map((r) => r.seed))].sort((a, b) => a - b);
console.log('\nCERTIFIED ' + JSON.stringify(certified));

// machine-readable tail
console.log('\nJSON ' + JSON.stringify(rows));
