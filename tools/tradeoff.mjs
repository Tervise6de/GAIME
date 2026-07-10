// Stage-6 confirmation: is the near-vs-far sensor PLACEMENT tradeoff genuine?
// Scores placed-sensor forecasts PER LEAD. If a near cluster wins the +1d call
// but a far-reaching placement wins the +3d outlook, then placement is a real
// tradeoff (spend coverage on short-term precision OR long-term warning), not a
// single dominant "put them upwind" answer.
//
// Usage: node tools/tradeoff.mjs [days] [seed1,seed2,...]
import { makeAtmo, step, townState, pressureAt, moistureAt, prevailingWind, tendency, classify, TICKS_PER_DAY, TOWN } from '../prototypes/stormwarden/js/atmo.js';
import { makeNoise } from '../prototypes/stormwarden/js/instruments.js';
import { probsFromCat, brier } from '../prototypes/stormwarden/js/forecast.js';

const days = parseInt(process.argv[2] || '90', 10);
const seeds = (process.argv[3] || '7,11,23,42,101').split(',').map((s) => parseInt(s, 10));
const USEFUL_R = 11;
const LEADS = [1, 2, 3];

const PLACEMENTS = {
  nearCluster: [{ x: TOWN.x - 5, y: TOWN.y }, { x: TOWN.x - 5, y: TOWN.y - 2 }, { x: TOWN.x - 5, y: TOWN.y + 2 }],
  farReach:    [{ x: TOWN.x - 5, y: TOWN.y }, { x: TOWN.x - 10, y: TOWN.y }, { x: TOWN.x - 15, y: TOWN.y }],
  allFar:      [{ x: TOWN.x - 15, y: TOWN.y }, { x: TOWN.x - 15, y: TOWN.y - 2 }, { x: TOWN.x - 15, y: TOWN.y + 2 }],
};

// Per-lead forecast from placed sensors: nearest sensor to the L-day-upwind
// point reads that air; if none is close enough, fall back to the barometer.
function forecastLead(a, noise, sensors, L, loc) {
  const pw = prevailingWind(a.time);
  const ideal = { x: TOWN.x - pw.x * L, y: TOWN.y - pw.y * L };
  let best = null, bestD = Infinity;
  for (const s of sensors) { const d = Math.hypot(s.x - ideal.x, s.y - ideal.y); if (d < bestD) { bestD = d; best = s; } }
  const estP_tend = loc.P + loc.tend * 1.9 * L;
  if (!best || bestD > USEFUL_R) {
    const estQ = loc.Q + (loc.tend < -1.2 ? 9 * L : loc.tend > 1.2 ? -7 * L : 0);
    return probsFromCat(classify(estP_tend, estQ), 0.5);
  }
  const sP = pressureAt(a, best.x, best.y) + noise() * (2.4 + L * 0.6);
  const sQ = moistureAt(a, best.x, best.y) + noise() * (6 + L * 1.5);
  const estP = 0.6 * sP + 0.4 * estP_tend;
  const estQ = 0.7 * sQ + 0.3 * loc.Q;
  let conf = 0.74 - (L - 1) * 0.10;
  if (bestD > 5) conf -= 0.08;
  return probsFromCat(classify(estP, estQ), Math.max(0.4, conf));
}

const names = Object.keys(PLACEMENTS);
const agg = {}; for (const n of names) for (const L of LEADS) agg[n + L] = { b: 0, a: 0, n: 0 };

for (const seed of seeds) {
  for (const name of names) {
    const sensors = PLACEMENTS[name];
    const a = makeAtmo(seed); const noise = makeNoise(seed);
    while (a.time < 1.0) step(a);
    const cats = [townState(a).cat]; const fc = { 1: [], 2: [], 3: [] };
    for (let d = 0; d < days; d++) {
      const loc = { P: pressureAt(a, TOWN.x, TOWN.y), Q: moistureAt(a, TOWN.x, TOWN.y), tend: tendency(a, 12) };
      for (const L of LEADS) fc[L].push(forecastLead(a, noise, sensors, L, loc));
      for (let i = 0; i < TICKS_PER_DAY; i++) step(a);
      cats.push(townState(a).cat);
    }
    for (let d = 0; d < days; d++) for (const L of LEADS) {
      const actual = cats[d + L]; if (actual == null) continue;
      const p = fc[L][d]; const g = agg[name + L];
      g.b += brier(p, actual); g.a += (p.indexOf(Math.max(...p)) === actual ? 1 : 0); g.n++;
    }
  }
}

console.log(`\n=== sensor placement tradeoff — Brier (acc%) per lead, means over ${seeds.length} seeds x ${days} days ===`);
console.log('  placement      |   +1d        |   +2d        |   +3d');
for (const name of names) {
  const cell = (L) => { const g = agg[name + L]; return `${(g.b / g.n).toFixed(3)} (${(100 * g.a / g.n).toFixed(0)}%)`; };
  console.log(`  ${name.padEnd(14)} | ${cell(1).padEnd(12)} | ${cell(2).padEnd(12)} | ${cell(3)}`);
}
const best = (L) => names.reduce((b, n) => (agg[n + L].b < agg[b + L].b ? n : b), names[0]);
console.log(`\n  best placement at +1d: ${best(1)} · at +2d: ${best(2)} · at +3d: ${best(3)}`);
