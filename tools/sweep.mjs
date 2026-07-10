// Headless, browser-free winnability/difficulty sweep. Imports the sim
// modules directly (they have no DOM dependency) and runs the exact main-loop
// tick order, so results are identical to the game — just far faster than
// driving Chromium, which matters for many-seed sweeps where losing runs go
// the full time limit.
//
// Usage:
//   node tools/sweep.mjs [--auto commander] [--seeds 20] [--from 1000]
//                        [--seedlist 7,11,23] [--maxtime 480]
// Prints one line per seed + a summary. Exit code 1 if any invariant fails
// (a seed the bot cannot win, or a positive control that unexpectedly wins).
import { runSeed as runSeedShared, SCENARIO } from './sim_runner.mjs';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const has = (n) => args.includes(n);

const autoName = opt('--auto', 'commander');
const maxTime = parseFloat(opt('--maxtime', String(SCENARIO.timeLimit)));
const seedlist = opt('--seedlist', null);
const from = parseInt(opt('--from', '1000'), 10);
const nSeeds = parseInt(opt('--seeds', '20'), 10);
const json = has('--json');

const seeds = seedlist
  ? seedlist.split(',').map((s) => parseInt(s.trim(), 10))
  : Array.from({ length: nSeeds }, (_, i) => from + i);

const runSeed = (seed) => runSeedShared(seed, autoName, maxTime);

if (!json) console.log(`sweep auto=${autoName} quota=${SCENARIO.quota} timeLimit=${maxTime}s  (${seeds.length} seeds)`);
const rows = [];
for (const seed of seeds) {
  const r = runSeed(seed);
  rows.push(r);
  if (!json) {
    const tag = r.won ? 'WIN ' : 'LOSE';
    console.log(
      `  seed ${String(r.seed).padStart(6)}  ${tag}  food ${String(r.food).padStart(4)}/${r.quota}` +
      `  t=${String(r.time).padStart(5)}  died ${String(r.died).padStart(4)}  slain ${r.slain}` +
      `  gen#${r.genAttempts}`);
  }
}

if (json) {
  console.log(JSON.stringify({ auto: autoName, rows }, null, 2));
} else {
  const wins = rows.filter((r) => r.won);
  const winT = wins.map((r) => r.time).sort((a, b) => a - b);
  const med = winT.length ? winT[winT.length >> 1] : null;
  console.log(`summary: ${wins.length}/${rows.length} won` +
    (winT.length ? `  win-time min/med/max = ${winT[0]}/${med}/${winT[winT.length - 1]}s` : ''));
}

// invariants for CI-style use: commander should win every seed; idle never should
const wins = rows.filter((r) => r.won).length;
let bad = false;
if (autoName === 'commander' && wins !== rows.length) { console.error(`FAIL: commander lost ${rows.length - wins} seed(s)`); bad = true; }
if (autoName === 'idle' && wins !== 0) { console.error(`FAIL: idle won ${wins} seed(s)`); bad = true; }
process.exit(bad ? 1 : 0);
