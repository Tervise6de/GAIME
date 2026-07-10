// Node-native season harness for STORMWARDEN — runs the truth sim + scripted
// forecasters across many seeds with NO browser, for fast falsification and
// tuning. The atmosphere / instruments / forecast modules are pure logic
// (no DOM), so they import directly. The browser build renders the same code.
//
// Usage: node tools/season.mjs [days] [seed1,seed2,...]
import { makeAtmo, step, townState, TICKS_PER_DAY } from '../prototypes/stormwarden/js/atmo.js';
import { readInstruments, makeNoise } from '../prototypes/stormwarden/js/instruments.js';
import { STRATEGIES, makeScorer } from '../prototypes/stormwarden/js/forecast.js';

const days = parseInt(process.argv[2] || '60', 10);
const seeds = (process.argv[3] || '7,11,23,42,101').split(',').map((s) => parseInt(s, 10));
const NAMES = ['persistence', 'climatology', 'instrument', 'oracle'];

function newGame(seed) {
  const atmo = makeAtmo(seed);
  const noise = makeNoise(seed);
  while (atmo.time < 1.0) step(atmo);
  return { atmo, noise, scorer: makeScorer(), prevCat: townState(atmo).cat };
}
function advanceDay(g) { for (let i = 0; i < TICKS_PER_DAY; i++) step(g.atmo); return townState(g.atmo).cat; }
function playDay(g, fn) {
  const read = readInstruments(g.atmo, g.noise);
  const today = { cat: g.prevCat };
  const actual = advanceDay(g);
  const p = fn({ read, today, tomorrow: { cat: actual } });
  g.scorer.record(p, actual);
  g.prevCat = actual;
}

const agg = {}; NAMES.forEach((n) => (agg[n] = { brier: 0, acc: 0, storms: 0, hits: 0, misses: 0, fa: 0, n: 0 }));
const catTotals = [0, 0, 0, 0];

for (const seed of seeds) {
  const line = [];
  for (const name of NAMES) {
    const g = newGame(seed);
    for (let d = 0; d < days; d++) playDay(g, STRATEGIES[name]);
    const s = g.scorer.summary();
    const a = agg[name];
    a.brier += s.brier; a.acc += s.accuracy; a.storms += s.stormDays;
    a.hits += s.hits; a.misses += s.misses; a.fa += s.falseAlarms; a.n++;
    line.push(`${name.padEnd(11)} B=${s.brier.toFixed(3)} acc=${(s.accuracy * 100).toFixed(0)}% storm=${s.stormDays} hit/miss/fa=${s.hits}/${s.misses}/${s.falseAlarms} rep=${s.reputation}`);
    if (name === 'persistence') g.scorer.perCat.forEach((c, i) => (catTotals[i] += c));
  }
  console.log(`\n--- seed ${seed} (${days} days) ---`);
  line.forEach((l) => console.log('  ' + l));
}

console.log(`\n=== MEANS over ${seeds.length} seeds (${days} days each) ===`);
for (const name of NAMES) {
  const a = agg[name];
  console.log(`  ${name.padEnd(11)} Brier=${(a.brier / a.n).toFixed(3)}  acc=${(100 * a.acc / a.n).toFixed(1)}%  storms=${(a.storms / a.n).toFixed(1)}/season  hit/miss/fa=${(a.hits / a.n).toFixed(1)}/${(a.misses / a.n).toFixed(1)}/${(a.fa / a.n).toFixed(1)}`);
}
const P = agg.persistence.brier / agg.persistence.n, I = agg.instrument.brier / agg.instrument.n, O = agg.oracle.brier / agg.oracle.n;
console.log(`\n  Brier Skill Score (instrument vs persistence) = ${(1 - I / P).toFixed(3)}`);
console.log(`  Accuracy uplift instrument-persistence = +${(100 * (agg.instrument.acc - agg.persistence.acc) / agg.persistence.n).toFixed(1)} pts`);
console.log(`  Fraction of persistence→oracle Brier gap closed = ${((P - I) / (P - O) * 100).toFixed(0)}%`);
const tot = catTotals.reduce((x, y) => x + y, 0);
console.log(`  Observed climate (CLEAR/CLOUDY/RAIN/STORM) = ${catTotals.map((c) => (c / tot).toFixed(3)).join(' / ')}`);
