// Stage-6 falsification: is sensor PLACEMENT a real decision? Runs the single
// instrument decision rule under different sensor placements across seeds. If
// skilled placement (upwind streamline) does not clearly beat naive placement
// (clustered on the town), then "place your sensors" is a fake choice.
//
// Usage: node tools/placement.mjs [days] [seed1,seed2,...]
import { makeAtmo, step, townState, TICKS_PER_DAY } from '../prototypes/stormwarden/js/atmo.js';
import { readInstruments, makeNoise } from '../prototypes/stormwarden/js/instruments.js';
import { STRATEGIES, makeScorer } from '../prototypes/stormwarden/js/forecast.js';
import { PLACEMENTS, randomPlacement } from '../prototypes/stormwarden/js/placements.js';

const days = parseInt(process.argv[2] || '60', 10);
const seeds = (process.argv[3] || '7,11,23,42,101').split(',').map((s) => parseInt(s, 10));

function seasonBrier(seed, sensors) {
  const atmo = makeAtmo(seed);
  const noise = makeNoise(seed);
  while (atmo.time < 1.0) step(atmo);
  const scorer = makeScorer();
  let prevCat = townState(atmo).cat;
  for (let d = 0; d < days; d++) {
    const read = readInstruments(atmo, noise, sensors);
    const today = { cat: prevCat };
    for (let i = 0; i < TICKS_PER_DAY; i++) step(atmo);
    const actual = townState(atmo).cat;
    scorer.record(STRATEGIES.instrument({ read, today, tomorrow: { cat: actual } }), actual);
    prevCat = actual;
  }
  return scorer.summary();
}
// persistence null for reference
function persistenceBrier(seed) {
  const atmo = makeAtmo(seed); const noise = makeNoise(seed);
  while (atmo.time < 1.0) step(atmo);
  const scorer = makeScorer(); let prevCat = townState(atmo).cat;
  for (let d = 0; d < days; d++) {
    const today = { cat: prevCat };
    for (let i = 0; i < TICKS_PER_DAY; i++) step(atmo);
    const actual = townState(atmo).cat;
    scorer.record(STRATEGIES.persistence({ today, tomorrow: { cat: actual } }), actual);
    prevCat = actual;
  }
  return scorer.summary();
}

const modes = [
  ['persistence (null)', null, persistenceBrier],
  ['onTown  (naive)', PLACEMENTS.onTown()],
  ['random  (blind)', null, null, true],
  ['spread  (hedge)', PLACEMENTS.spread()],
  ['upwindLine (skill)', PLACEMENTS.upwindLine()],
  ['fixed lookouts (4b)', null, seasonBrier],   // sensors=null → ideal lookouts
];

const agg = {}; modes.forEach(([n]) => (agg[n] = { b: 0, a: 0, miss: 0, hit: 0, n: 0 }));
for (const seed of seeds) {
  for (const m of modes) {
    const [name, sensors, custom, isRandom] = m;
    let s;
    if (name.startsWith('persistence')) s = persistenceBrier(seed);
    else if (name.startsWith('fixed')) s = seasonBrier(seed, null);
    else if (isRandom) s = seasonBrier(seed, randomPlacement(seed));
    else s = seasonBrier(seed, sensors);
    const g = agg[name];
    g.b += s.brier; g.a += s.accuracy; g.miss += s.misses; g.hit += s.hits; g.n++;
  }
}
console.log(`\n=== sensor placement — means over ${seeds.length} seeds x ${days} days ===`);
for (const [name] of modes) {
  const g = agg[name];
  console.log(`  ${name.padEnd(20)} Brier=${(g.b / g.n).toFixed(3)}  acc=${(100 * g.a / g.n).toFixed(1)}%  storm hit/miss=${(g.hit / g.n).toFixed(1)}/${(g.miss / g.n).toFixed(1)}`);
}
const P = agg['persistence (null)'].b / seeds.length;
const naive = agg['onTown  (naive)'].b / seeds.length;
const skill = agg['upwindLine (skill)'].b / seeds.length;
console.log(`\n  BSS skilled-placement vs persistence = ${(1 - skill / P).toFixed(3)}`);
console.log(`  BSS skilled vs naive (on-town)       = ${(1 - skill / naive).toFixed(3)}`);
console.log(`  accuracy uplift skilled - naive      = +${(100 * (agg['upwindLine (skill)'].a - agg['onTown  (naive)'].a) / seeds.length).toFixed(1)} pts`);
