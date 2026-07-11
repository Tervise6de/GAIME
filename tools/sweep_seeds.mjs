// Headless winnability sweep: runs the full game loop (sim + scenario + auto
// player) to completion for a range of seeds, entirely in Node — no browser.
// This is the balance oracle behind the Loop-4 claim that generated maps are
// bot-winnable. Usage:
//   node tools/sweep_seeds.mjs [auto=commander] [count=24] [start=1000]
import { makeWorld } from '../game/js/world.js';
import { makeSim, step, antsAlive } from '../game/js/sim.js';
import { makeAutoPlayer } from '../game/js/auto.js';
import { makeScenarioState, updateScenario, SCENARIO } from '../game/js/scenario.js';

const arg = (k, d) => { const a = process.argv.slice(2).find((s) => s.startsWith(k + '=')); return a ? a.split('=')[1] : d; };
const autoName = arg('auto', 'commander');
const count = parseInt(arg('count', '24'), 10);
const start = parseInt(arg('start', '1000'), 10);
const DT = 1 / 60;
const MAX_TICKS = Math.ceil(SCENARIO.timeLimit / DT) + 60;

function runSeed(seed) {
  const world = makeWorld(seed);
  const sim = makeSim(world);
  const auto = makeAutoPlayer(autoName);
  const sc = makeScenarioState();
  while (!sc.over && sim.tick < MAX_TICKS) {
    if (auto) auto(sim);
    step(sim, DT);
    updateScenario(sc, sim, world);
  }
  const s = sc.endStats || {};
  return {
    seed, gen: world.genAttempts, won: !!s.won,
    stock: Math.round(s.foodStock || sim.foodStock),
    time: +(s.time || sim.time).toFixed(1),
    died: s.died || sim.antsDied, slain: s.spidersSlain || sim.spidersKilled,
    colony: s.colony ?? antsAlive(sim),
    taken: world.piles.map((p) => p.taken || 0),
  };
}

const seeds = [7, ...Array.from({ length: count }, (_, i) => start + i)];
let wins = 0;
const times = [];
console.log(`# sweep auto=${autoName} seeds=[7, ${start}..${start + count - 1}] quota=${SCENARIO.quota} limit=${SCENARIO.timeLimit}s`);
console.log('seed    gen  won   stock  time   died  slain colony  taken');
for (const seed of seeds) {
  const r = runSeed(seed);
  if (r.won) { wins++; times.push(r.time); }
  const flag = r.won ? 'WIN ' : 'loss';
  console.log(
    `${String(r.seed).padEnd(7)} ${String(r.gen).padStart(2)}  ${flag}  ${String(r.stock).padStart(5)}  ${String(r.time).padStart(5)}  ${String(r.died).padStart(5)} ${String(r.slain).padStart(4)}  ${String(r.colony).padStart(5)}  [${r.taken.join(',')}]`,
  );
}
const gen = seeds.length - 1; // excluding seed 7
const genWins = wins - (seeds[0] === 7 && runSeed(7).won ? 1 : 0);
const avg = times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : 'n/a';
const mn = times.length ? Math.min(...times).toFixed(1) : 'n/a';
const mx = times.length ? Math.max(...times).toFixed(1) : 'n/a';
console.log(`\n# ${wins}/${seeds.length} won  | win-time avg ${avg}s  min ${mn}s  max ${mx}s  (limit ${SCENARIO.timeLimit}s)`);
