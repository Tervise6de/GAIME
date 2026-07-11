// Robust cross-seed bot sweep. Like win_sweep.mjs but polls window.__DONE the
// way run_proto.mjs does (manual poll loop, not page.waitForFunction) so long
// LOSING games that run to the 480s time limit are measured reliably instead of
// false-timing-out. Runs one bot across a seed set and prints per-seed rows plus
// a summary. Use it to compare bots head-to-head on the SAME seeds.
//
// Usage:
//   node tools/bot_sweep.mjs --bot=gcommander --seeds=1000,1097,... [--fast=40] [--wall=120]
//   node tools/bot_sweep.mjs --bot=gcmdr2 --count=16 --first=1000 --stride=97
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const a = argv.find((s) => s.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : def;
};
const bot = flag('bot', 'gcommander');
const fast = parseInt(flag('fast', '40'), 10);
const wallMs = parseInt(flag('wall', '120'), 10) * 1000;
const seedsFlag = flag('seeds', null);
let seeds;
if (seedsFlag) seeds = seedsFlag.split(',').map(Number);
else {
  const count = parseInt(flag('count', '16'), 10);
  const first = parseInt(flag('first', '1000'), 10);
  const stride = parseInt(flag('stride', '97'), 10);
  seeds = Array.from({ length: count }, (_, i) => first + i * stride);
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const rows = [];
for (const seed of seeds) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:8123/game/index.html?seed=${seed}&auto=${bot}&fast=${fast}`, { waitUntil: 'load' });
  const t0 = Date.now();
  let done = false;
  while (Date.now() - t0 < wallMs) {
    done = await page.evaluate('window.__DONE === true').catch(() => false);
    if (done) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!done) {
    console.error(`seed ${seed}: TIMEOUT (no __DONE in ${wallMs / 1000}s)`);
    rows.push({ seed, won: null, timeout: true });
    await page.close();
    continue;
  }
  const r = await page.evaluate('window.__RESULTS');
  await page.close();
  const cov = r.piles.map((p) => `${p.label}:${Math.round(100 * p.taken / (p.taken + p.left || 1))}%`).join(' ');
  const slain = r.spidersSlain ?? 0;
  rows.push({ seed, won: r.won, stores: r.foodStock, gathered: r.gathered, died: r.died, slain, time: r.time, cov });
  console.error(`seed ${seed}: ${r.won ? 'WON ' : 'lost'} stores=${r.foodStock} gathered=${r.gathered} died=${r.died} slain=${slain} t=${r.time} | ${cov}`);
}
await browser.close();

const done = rows.filter((r) => r.won !== null);
const wins = done.filter((r) => r.won);
const winTimes = wins.map((r) => r.time).sort((a, b) => a - b);
const winDeaths = wins.map((r) => r.died).sort((a, b) => a - b);
const span = (a) => (a.length ? `${a[0]}–${a[a.length - 1]}` : '—');
console.log(JSON.stringify({
  bot, seeds: seeds.length, completed: done.length,
  wins: wins.length, winRate: +(wins.length / (done.length || 1)).toFixed(3),
  winTimeSpan: span(winTimes), winDeathSpan: span(winDeaths),
  rows,
}, null, 2));
