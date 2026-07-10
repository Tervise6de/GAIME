// Instruments: the only honest windows the forecaster has into the truth sim.
// Every reading is NOISY. The upwind lookout sensors are the skill instrument —
// they show the forecaster what is heading for the town before it arrives.
import { mulberry32 } from './rng.js';
import { pressureAt, moistureAt, windAt, temperatureAt, tendency, TOWN, prevailingWind } from './atmo.js';

// A private noise stream so instrument reads never perturb the atmosphere
// trajectory — every strategy sees the identical weather for a given seed.
export function makeNoise(seed) {
  const rng = mulberry32((seed >>> 0) ^ 0x1d3f);
  return () => (rng() + rng() + rng()) / 3 - 0.5;  // ~centred, softer tails
}

export function readInstruments(a, noise) {
  const P = pressureAt(a, TOWN.x, TOWN.y) + noise() * 1.2;
  const Q = moistureAt(a, TOWN.x, TOWN.y) + noise() * 4.0;
  const T = temperatureAt(a, TOWN.x, TOWN.y) + noise() * 1.2;
  const w = windAt(a, TOWN.x, TOWN.y);
  const tend = tendency(a, 12) + noise() * 0.8;

  // Two upwind lookout stations, ~1 and ~2 days upwind at mean wind speed.
  // A distant reading is noisier than the barometer on the porch.
  const pw = prevailingWind(a.time);
  const near = { x: TOWN.x - pw.x * 1.0, y: TOWN.y - pw.y * 1.0 };
  const far = { x: TOWN.x - pw.x * 2.0, y: TOWN.y - pw.y * 2.0 };
  const lookNear = {
    P: pressureAt(a, near.x, near.y) + noise() * 2.4,
    Q: moistureAt(a, near.x, near.y) + noise() * 6.0,
    x: near.x, y: near.y,
  };
  const lookFar = {
    P: pressureAt(a, far.x, far.y) + noise() * 3.4,
    Q: moistureAt(a, far.x, far.y) + noise() * 8.0,
    x: far.x, y: far.y,
  };
  return { P, Q, T, wind: w, tend, lookNear, lookFar };
}
