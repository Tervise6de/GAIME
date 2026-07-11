// Cross-seed winnability / difficulty sweep for the HIVEMIND "First Season".
// Runs the generalized commander bot (and optionally the idle baseline) across
// many GENERATED seeds headless, then reports the winnability rate and the
// difficulty spread (win-time distribution). This is the balance oracle that
// backs the fairness guarantees in world.js with actual bot-winnability
// evidence.
//
// Usage:
//   node tools/sweep_winnability.mjs [--start 100] [--count 24] [--fast 20]
//                                    [--cap 40] [--idle] [--out sweep.json]
// Seeds are start..start+count-1 (seed 7 is the handcrafted map and is skipped
// if it falls in range unless --includeHandcrafted is passed).
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const flag = (name) => args.includes(name);

const start = parseInt(opt('--start', '100'), 10);
const count = parseInt(opt('--count', '24'), 10);
const fast = parseInt(opt('--fast', '20'), 10);
const capSec = parseFloat(opt('--cap', '45'));      // wall-clock cap per seed
const alsoIdle = flag('--idle');
const includeHand = flag('--includeHandcrafted');
const outFile = opt('--out', null);
const base = opt('--base', 'http://localhost:8123/game/index.html');

const seeds = [];
for (let s = start; s < start + count; s++) if (s !== 7 || includeHand) seeds.push(s);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));

async function runOne(seed, auto) {
  const url = `${base}?seed=${seed}&auto=${auto}&fast=${fast}`;
  await page.goto(url, { waitUntil: 'load' });
  const t0 = Date.now();
  let done = false;
  while (Date.now() - t0 < capSec * 1000) {
    done = await page.evaluate('window.__DONE === true').catch(() => false);
    if (done) break;
    await new Promise((r) => setTimeout(r, 150));
  }
  const res = await page.evaluate('window.__RESULTS || null').catch(() => null);
  const gen = await page.evaluate('window.__SIM ? window.__SIM.world.genAttempts : null').catch(() => null);
  return { seed, auto, done, wallSec: +((Date.now() - t0) / 1000).toFixed(1), genAttempts: gen, res };
}

const rows = [];
for (const seed of seeds) {
  const c = await runOne(seed, 'commander');
  let idle = null;
  if (alsoIdle) idle = await runOne(seed, 'idle');
  const r = c.res || {};
  rows.push({
    seed,
    won: !!r.won,
    time: r.time ?? null,
    foodStock: r.foodStock ?? null,
    gathered: r.gathered ?? null,
    died: r.died ?? null,
    spidersSlain: r.spidersSlain ?? null,
    genAttempts: c.genAttempts,
    done: c.done,
    idleWon: idle ? !!(idle.res && idle.res.won) : null,
  });
  const wt = rows[rows.length - 1];
  console.error(`seed ${String(seed).padStart(4)}  ${wt.won ? 'WIN ' : 'LOSS'}  ` +
    `t=${String(wt.time).padStart(6)}  net=${String(wt.foodStock).padStart(5)}  ` +
    `gross=${String(wt.gathered).padStart(5)}  died=${String(wt.died).padStart(5)}  ` +
    `slain=${wt.spidersSlain}  gen=${wt.genAttempts}` +
    (wt.idleWon !== null ? `  idleWon=${wt.idleWon}` : ''));
}

const wins = rows.filter((r) => r.won);
const winTimes = wins.map((r) => r.time).filter((t) => t != null).sort((a, b) => a - b);
const pct = (p) => winTimes.length ? winTimes[Math.min(winTimes.length - 1, Math.floor(p * winTimes.length))] : null;
const mean = (xs) => xs.length ? +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : null;

const summary = {
  seeds: seeds.length,
  wins: wins.length,
  winRate: +(wins.length / seeds.length).toFixed(3),
  losses: rows.filter((r) => !r.won).map((r) => r.seed),
  idleWins: alsoIdle ? rows.filter((r) => r.idleWon).map((r) => r.seed) : 'skipped',
  winTime: winTimes.length ? {
    min: winTimes[0], p25: pct(0.25), median: pct(0.5), p75: pct(0.75), max: winTimes[winTimes.length - 1],
    mean: mean(winTimes),
  } : null,
  meanDied: mean(wins.map((r) => r.died).filter((x) => x != null)),
  meanGross: mean(wins.map((r) => r.gathered).filter((x) => x != null)),
};

console.error('\n=== SUMMARY ===');
console.error(JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ params: { start, count, fast, capSec }, summary, rows }, null, 2));

if (outFile) {
  const fs = await import('fs');
  fs.writeFileSync(outFile, JSON.stringify({ params: { start, count, fast, capSec }, summary, rows }, null, 2));
  console.error(`\nwrote ${outFile}`);
}

await browser.close();
