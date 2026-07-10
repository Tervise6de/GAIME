// Stage-6 DEPTH probe: does skill headroom exist beyond a 1-day forecast?
// A thin game would be one where tomorrow is easy and 2+ days out is a
// coin-flip. A game with room to master would show skill DECAYING gracefully
// with lead time — harder, but still beating the naive null at 2 and 3 days.
//
// For each day the forecaster reads the air ~L days upwind (town - wind*L, the
// air that arrives in L days if the wind holds) and calls the sky L days out.
// Persistence at lead L = today's sky. Scored against the realized weather L
// days later. Farther-upwind reads are noisier AND the "wind holds" assumption
// decays with L, so this measures real information vs lead time.
//
// Usage: node tools/leadtime.mjs [days] [seed1,seed2,...]
import { makeAtmo, step, townState, pressureAt, moistureAt, prevailingWind, classify, TICKS_PER_DAY, TOWN } from '../prototypes/stormwarden/js/atmo.js';
import { makeNoise } from '../prototypes/stormwarden/js/instruments.js';
import { probsFromCat, brier } from '../prototypes/stormwarden/js/forecast.js';

const days = parseInt(process.argv[2] || '90', 10);
const seeds = (process.argv[3] || '7,11,23,42,101').split(',').map((s) => parseInt(s, 10));
const LEADS = [1, 2, 3];

function instrumentForecastAtLead(a, noise, L) {
  const pw = prevailingWind(a.time);
  const px = TOWN.x - pw.x * L, py = TOWN.y - pw.y * L;
  const nz = 2.0 + L * 1.3;                     // farther upwind = noisier
  const P = pressureAt(a, px, py) + noise() * nz;
  const Q = moistureAt(a, px, py) + noise() * nz * 2.4;
  const conf = Math.max(0.42, 0.80 - (L - 1) * 0.12);   // less sure farther out
  return probsFromCat(classify(P, Q), conf);
}

const agg = {};
for (const L of LEADS) agg['inst' + L] = { b: 0, a: 0, n: 0 };
for (const L of LEADS) agg['pers' + L] = { b: 0, a: 0, n: 0 };

for (const seed of seeds) {
  const a = makeAtmo(seed); const noise = makeNoise(seed);
  while (a.time < 1.0) step(a);
  // record realized categories and the forecasts issued each day
  const cats = [townState(a).cat];
  const fc = { 1: [], 2: [], 3: [] };            // instrument forecasts per lead
  const today = [cats[0]];                       // persistence source per day
  for (let d = 0; d < days; d++) {
    for (const L of LEADS) fc[L].push(instrumentForecastAtLead(a, noise, L));
    today.push(townState(a).cat);
    for (let i = 0; i < TICKS_PER_DAY; i++) step(a);
    cats.push(townState(a).cat);
  }
  for (let d = 0; d < days; d++) {
    for (const L of LEADS) {
      const actual = cats[d + L];
      if (actual == null) continue;
      const pI = fc[L][d];
      const gI = agg['inst' + L]; gI.b += brier(pI, actual); gI.a += (pI.indexOf(Math.max(...pI)) === actual ? 1 : 0); gI.n++;
      const pP = probsFromCat(today[d], 0.60);
      const gP = agg['pers' + L]; gP.b += brier(pP, actual); gP.a += (today[d] === actual ? 1 : 0); gP.n++;
    }
  }
}

console.log(`\n=== skill vs lead time — means over ${seeds.length} seeds x ${days} days ===`);
console.log('  lead | instrument Brier/acc | persistence Brier/acc | BSS');
for (const L of LEADS) {
  const I = agg['inst' + L], P = agg['pers' + L];
  const ib = I.b / I.n, ia = 100 * I.a / I.n, pb = P.b / P.n, pa = 100 * P.a / P.n;
  console.log(`   +${L}d | ${ib.toFixed(3)} / ${ia.toFixed(0)}%        | ${pb.toFixed(3)} / ${pa.toFixed(0)}%         | ${(1 - ib / pb).toFixed(3)}`);
}
