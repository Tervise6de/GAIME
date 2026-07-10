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

// Distance beyond which a sensor is too far off the incoming streamline to be
// worth trusting for tomorrow's air — the forecaster then falls back to the
// barometer alone.
const USEFUL_R = 11;

// Pick the placed sensor nearest an ideal upwind sampling point and read the
// air AT THAT SENSOR (not the ideal point) — a mis-placed sensor reports the
// wrong airmass. Returns null if nothing is close enough to be informative.
function sampleNearest(a, noise, sensors, ideal, noiseScale) {
  let best = null, bestD = Infinity;
  for (const s of sensors) {
    const d = Math.hypot(s.x - ideal.x, s.y - ideal.y);
    if (d < bestD) { bestD = d; best = s; }
  }
  if (!best || bestD > USEFUL_R) return null;
  return {
    P: pressureAt(a, best.x, best.y) + noise() * noiseScale,
    Q: moistureAt(a, best.x, best.y) + noise() * (noiseScale * 2.5),
    x: best.x, y: best.y, offset: bestD,
  };
}

// `sensors` (optional): the player's placed sensor budget, [{x,y}, ...]. When
// omitted, two ideal fixed lookouts are used (the Stage-4b behaviour) so the
// original falsification numbers stay reproducible.
export function readInstruments(a, noise, sensors = null) {
  const P = pressureAt(a, TOWN.x, TOWN.y) + noise() * 1.2;
  const Q = moistureAt(a, TOWN.x, TOWN.y) + noise() * 4.0;
  const T = temperatureAt(a, TOWN.x, TOWN.y) + noise() * 1.2;
  const w = windAt(a, TOWN.x, TOWN.y);
  const tend = tendency(a, 12) + noise() * 0.8;

  // Where tomorrow's / the day-after's air is coming FROM, given today's wind.
  const pw = prevailingWind(a.time);
  const nearPt = { x: TOWN.x - pw.x * 1.0, y: TOWN.y - pw.y * 1.0 };
  const farPt = { x: TOWN.x - pw.x * 2.0, y: TOWN.y - pw.y * 2.0 };

  let lookNear, lookFar;
  if (!sensors) {
    lookNear = { P: pressureAt(a, nearPt.x, nearPt.y) + noise() * 2.4, Q: moistureAt(a, nearPt.x, nearPt.y) + noise() * 6.0, x: nearPt.x, y: nearPt.y, offset: 0 };
    lookFar = { P: pressureAt(a, farPt.x, farPt.y) + noise() * 3.4, Q: moistureAt(a, farPt.x, farPt.y) + noise() * 8.0, x: farPt.x, y: farPt.y, offset: 0 };
  } else {
    lookNear = sampleNearest(a, noise, sensors, nearPt, 2.4);
    lookFar = sampleNearest(a, noise, sensors, farPt, 3.4);
  }
  return { P, Q, T, wind: w, tend, lookNear, lookFar, nearPt, farPt };
}
