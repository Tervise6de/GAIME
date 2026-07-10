// Forecast strategies + scoring. Each strategy turns today's evidence into a
// probability forecast over tomorrow's four categories. Scoring uses the
// multi-category Brier score (lower = better) plus a Papers-Please-style
// consequence ledger for storm warnings (lives ride on the call).
import { classify, CATS } from './atmo.js';

// Ordinal-smeared probability vector: `conf` mass on `cat`, the rest bleeding
// to neighbouring categories (CLEAR-CLOUDY-RAIN-STORM are an ordered scale).
export function probsFromCat(cat, conf) {
  const p = [0, 0, 0, 0];
  p[cat] = conf;
  const rem = 1 - conf;
  let wsum = 0; const w = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) if (i !== cat) { w[i] = Math.pow(0.45, Math.abs(i - cat)); wsum += w[i]; }
  for (let i = 0; i < 4; i++) if (i !== cat) p[i] = rem * (w[i] / wsum);
  return p;
}

// Climatological base rates — MEASURED from a 5-seed x 60-day headless sweep of
// this sim (see PLAYTEST_LOG / tools/season.mjs), not guessed. Using the true
// base rates makes the climatology baseline as strong (fair) as it can be.
export const CLIMO = [0.46, 0.21, 0.18, 0.15];

export const STRATEGIES = {
  // Null model 1: tomorrow will be like today.
  persistence: (ctx) => probsFromCat(ctx.today.cat, 0.60),

  // Null model 2: always predict the long-run climate.
  climatology: () => CLIMO.slice(),

  // The skill claim: read the sky. What is upwind now arrives tomorrow, and a
  // falling barometer means the low is closing in.
  instrument: (ctx) => {
    const r = ctx.read;
    // project barometer tendency forward ~1 day (tend is the 12h change)
    const estP_tend = r.P + r.tend * 1.9;
    const estP = 0.55 * r.lookNear.P + 0.45 * estP_tend;
    let estQ = 0.7 * r.lookNear.Q + 0.3 * r.Q;
    // a strong wet low still two days out lifts storm/rain odds a touch
    if (r.lookFar.P < r.lookNear.P - 3 && r.lookFar.Q > 55) estQ += 4;
    const cat = classify(estP, estQ);
    // confident when the upwind picture and the barometer agree
    const tendWet = r.tend < -1.2;
    const lookWet = r.lookNear.Q > r.Q + 4 || r.lookNear.P < r.P - 3;
    let conf = 0.66;
    if (tendWet === lookWet) conf += 0.09;         // signals agree
    if (r.lookFar.Q > 58 && r.lookNear.Q > 55) conf += 0.05;
    conf = Math.min(0.83, conf);
    return probsFromCat(cat, conf);
  },

  // Upper bound reference only (peeks at truth). NOT a skill claim.
  oracle: (ctx) => probsFromCat(ctx.tomorrow.cat, 0.90),
};

export function brier(p, actualCat) {
  let s = 0;
  for (let i = 0; i < 4; i++) { const o = i === actualCat ? 1 : 0; s += (p[i] - o) * (p[i] - o); }
  return s;
}

export function makeScorer() {
  return {
    days: 0, brierSum: 0, correct: 0,
    hits: 0, misses: 0, falseAlarms: 0, correctRej: 0,
    stormDays: 0, perCat: [0, 0, 0, 0], perCatCorrect: [0, 0, 0, 0],
    log: [],
    record(p, actualCat) {
      this.days++;
      this.brierSum += brier(p, actualCat);
      const pred = p.indexOf(Math.max(...p));
      if (pred === actualCat) this.correct++;
      this.perCat[actualCat]++;
      if (pred === actualCat) this.perCatCorrect[actualCat]++;
      const warned = p[3] >= 0.4;                 // storm warning issued?
      if (actualCat === 3) {
        this.stormDays++;
        if (warned) this.hits++; else this.misses++;
      } else if (warned) this.falseAlarms++; else this.correctRej++;
      this.log.push({ pred, actual: actualCat, p: p.map((x) => +x.toFixed(2)), warned });
    },
    summary() {
      const rep = this.hits * 2 - this.misses * 5 - this.falseAlarms * 1;
      return {
        days: this.days,
        brier: +(this.brierSum / this.days).toFixed(4),
        accuracy: +(this.correct / this.days).toFixed(4),
        stormDays: this.stormDays,
        hits: this.hits, misses: this.misses,
        falseAlarms: this.falseAlarms, correctRej: this.correctRej,
        reputation: rep,
      };
    },
  };
}
