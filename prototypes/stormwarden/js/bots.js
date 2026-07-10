// Automated forecasters — the falsification harness.
// Pre-registered hypothesis (PLAYTEST_LOG 2026-07-10): the sim has a
// learnable skill gradient iff INSTRUMENT accuracy beats PERSISTENCE by
// >=10 percentage points overall, while staying below a 92% ceiling, with
// sane base rates (rain-or-storm days 20-50%, storm days 3-20%).

// climatology: always the modal class
export function climo() {
  return { precip: 0, temp: 1 };
}

// persistence: tomorrow will be like today
export function persist(_inst, todayTruth) {
  return todayTruth ? { precip: todayTruth.precip, temp: todayTruth.temp } : { precip: 0, temp: 1 };
}

// instrument-informed forecaster. Two-stage logistic model FITTED ON SEED 11
// (1000 days, tools-side regression, 2026-07-10) and hard-coded here; any
// other seed is therefore held-out validation. It encodes relationships a
// player can learn: low glass + humid + windy + falling = wet; deep local
// low + gale = storm; persistence matters (yt).
const W_WET = [-0.47, 0.64, 0.005, -0.174, 0.015, 1.394, 1.485, -1.864, 1.092], B_WET = -5.678;
const W_STORM = [-0.291, 0.467, -0.186, 0.136, -0.12, 0.738, 2.39, -1.037, -0.67], B_STORM = -7.807;
const T_WET = 0.5, T_STORM = 0.4;

function features(inst, todayTruth) {
  const westLow = Math.min(inst.outs[0].p, inst.outs[1].p);
  const farLow = Math.min(inst.outs[2].p, inst.outs[3].p);
  return [
    inst.pTrend / 5,
    (inst.p - westLow) / 5,
    Math.min(inst.outs[0].trend, inst.outs[1].trend) / 5,
    (inst.p - farLow) / 10,
    Math.min(inst.outs[2].trend, inst.outs[3].trend) / 5,
    (inst.rh - 0.5) * 5,
    inst.windSpd / 10,
    (inst.p - 1013) / 8,
    todayTruth && todayTruth.precip > 0 ? 1 : 0,
  ];
}

const sig = (z) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));

export function instrument(inst, todayTruth) {
  if (!inst) return { precip: 0, temp: 1 };
  const x = features(inst, todayTruth);
  const pw = sig(B_WET + x.reduce((s, xi, i) => s + W_WET[i] * xi, 0));
  let precip = 0;
  if (pw >= T_WET) {
    const ps = sig(B_STORM + x.reduce((s, xi, i) => s + W_STORM[i] * xi, 0));
    precip = ps >= T_STORM ? 2 : 1;
  }
  // temp from wind provenance: northerly = cool, southerly = warm
  const northerly = Math.sin(inst.windDir);
  let temp = 1;
  if (northerly > 0.55 && inst.windSpd > 14) temp = 0;
  else if (northerly < -0.55 && inst.windSpd > 14) temp = 2;
  return { precip, temp, pw: +pw.toFixed(3) };
}

export const BOTS = { climo, persist, instrument };
