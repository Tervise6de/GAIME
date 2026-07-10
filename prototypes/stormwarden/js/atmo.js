// STORMWARDEN atmosphere truth-sim.
// Parametric weather: pressure centers drift roughly west->east; wind is
// quasi-geostrophic; humidity rides the wind and the lows; precipitation
// emerges from low pressure + falling trend + moisture. The player never
// sees this state — only instruments sample it (noisily).
import { mulberry32 } from './rng.js';

export const MAP_W = 900, MAP_H = 720;
export const TOWN = { x: 640, y: 400 };
// The telegraph network is the concept's core: stations upstream of the
// weather give tomorrow's causes a place to be OBSERVED. Two on-map
// outposts (hours ahead) + two far stations (1-3 days ahead, off-map west).
export const OUTPOSTS = [
  { name: 'West Ridge', x: 240, y: 300 },
  { name: 'Salt Marsh', x: 300, y: 560 },
  { name: 'Cape Farrow', x: -520, y: 360, far: true },
  { name: 'Isle Greywater', x: -1150, y: 430, far: true },
];

export const TUNE = {
  spawnPerDay: 0.55,        // expected new pressure systems per day
  lowShare: 0.62,           // fraction of systems that are lows
  maxLows: 4,               // concurrent lows cap over the whole 3000px corridor
  lowStr: [-28, -11],       // hPa depth range for lows
  highStr: [8, 20],
  radius: [170, 280],
  driftX: [190, 320],       // px per day eastward
  driftY: [-30, 30],
  lifeDays: [10, 17],       // must survive the ~2600px corridor to the town
  humidOceanWind: 0.26,     // RH boost for west/southwest wind
  humidLowCarry: 0.22,      // RH boost near a moist low
  rainThresh: 0.50,         // precip potential thresholds
  stormThresh: 0.86,
};

export function makeAtmo(seed) {
  const rng = mulberry32(seed);
  const a = {
    rng, seed,
    hour: 0,                 // absolute sim hour
    systems: [],             // pressure centers
    // per-hour histories at town + outposts (for instruments & trends)
    townHist: [],            // {h, p, rh, windDir, windSpd, precip}
    outHist: OUTPOSTS.map(() => []),
  };
  // pre-seed systems scattered across the whole corridor so day 1 has
  // weather in transit at every range
  for (let i = 0; i < 4; i++) spawnSystem(a, -1500 + rng() * 1900);
  return a;
}

function rr(rng, [a, b]) { return a + rng() * (b - a); }

function spawnSystem(a, atX = null) {
  const { rng } = a;
  let isLow = rng() < TUNE.lowShare;
  if (isLow && a.systems.filter((s) => s.str < 0).length >= TUNE.maxLows) isLow = false;
  a.systems.push({
    x: atX !== null ? atX : -1250 - rng() * 450,
    y: 80 + rng() * (MAP_H - 160),
    str: isLow ? rr(rng, TUNE.lowStr) : rr(rng, TUNE.highStr),
    r: rr(rng, TUNE.radius),
    vx: rr(rng, TUNE.driftX) / 24,       // per hour
    vy: rr(rng, TUNE.driftY) / 24,
    ageH: 0,
    lifeH: rr(rng, TUNE.lifeDays) * 24,
    moist: 0.35 + rng() * 0.6,           // how much moisture a low carries
  });
}

// pressure (hPa) at a point
export function pressureAt(a, x, y) {
  let p = 1013;
  for (const s of a.systems) {
    const dx = x - s.x, dy = y - s.y;
    const fade = Math.min(1, s.ageH / 12) * Math.min(1, Math.max(0, (s.lifeH - s.ageH) / 24));
    p += s.str * fade * Math.exp(-(dx * dx + dy * dy) / (2 * s.r * s.r));
  }
  return p;
}

// wind vector at a point (px/h scale, direction meteorological)
export function windAt(a, x, y) {
  const e = 6;
  const dpdx = (pressureAt(a, x + e, y) - pressureAt(a, x - e, y)) / (2 * e);
  const dpdy = (pressureAt(a, x, y + e) - pressureAt(a, x, y - e)) / (2 * e);
  // geostrophic: rotate gradient 90° (NH), plus slight inflow to lows
  let wx = -dpdy * 40 - dpdx * 8;
  let wy = dpdx * 40 - dpdy * 8;
  // prevailing westerly
  wx += 2.2;
  return { wx, wy, spd: Math.hypot(wx, wy) };
}

// relative humidity 0..1 at a point
export function humidityAt(a, x, y, noise = 0) {
  const w = windAt(a, x, y);
  // wind provenance: from the west/southwest (wx>0, wy<0-ish) = oceanic moist
  const oceanic = Math.max(0, w.wx) / (Math.abs(w.wx) + Math.abs(w.wy) + 6);
  let rh = 0.42 + TUNE.humidOceanWind * oceanic * 2.2;
  // moisture carried by nearby moist lows
  for (const s of a.systems) {
    if (s.str >= 0) continue;
    const d = Math.hypot(x - s.x, y - s.y);
    rh += TUNE.humidLowCarry * s.moist * Math.exp(-d * d / (2 * s.r * s.r * 1.3));
  }
  // high pressure dries
  const p = pressureAt(a, x, y);
  rh -= Math.max(0, p - 1016) * 0.012;
  return Math.min(0.99, Math.max(0.12, rh + noise));
}

// precip potential & category at a point for the CURRENT hour
export function precipAt(a, x, y) {
  const p = pressureAt(a, x, y);
  const rh = humidityAt(a, x, y);
  const depth = Math.max(0, 1013 - p);
  const g = gustAt(a, x, y);
  const pot = 0.024 * depth + (rh - 0.55) * 1.0 + Math.min(0.2, g * 0.006);
  if (pot > TUNE.stormThresh) return { cat: 2, pot };
  if (pot > TUNE.rainThresh) return { cat: 1, pot };
  return { cat: 0, pot };
}

// effective wind including gustiness inside deep lows (gradient is calm at
// the exact center of a low; real storms are not)
export function gustAt(a, x, y) {
  const w = windAt(a, x, y);
  const depth = Math.max(0, 1013 - pressureAt(a, x, y));
  return w.spd + depth * 0.9;
}

export function tempAt(a, x, y, hour) {
  const w = windAt(a, x, y);
  const p = pressureAt(a, x, y);
  // southerly warm, northerly cold (screen y: south = +y)
  const meridional = w.wy / (w.spd + 4);       // + = wind blowing southward (from north)
  const diurnal = 4.5 * Math.sin(((hour % 24) - 9) / 24 * Math.PI * 2);
  return 18.5 - meridional * 8 + (1013 - p) * 0.06 + diurnal;
}

function record(a) {
  const noise = () => (a.rng() - 0.5);
  const sample = (x, y, hist) => {
    const w = windAt(a, x, y);
    hist.push({
      h: a.hour,
      p: pressureAt(a, x, y) + noise() * 1.4,
      rh: humidityAt(a, x, y, noise() * 0.06),
      windDir: Math.atan2(w.wy, w.wx),
      windSpd: gustAt(a, x, y) + noise() * 2,
      precip: precipAt(a, x, y).cat,
      temp: tempAt(a, x, y, a.hour),
    });
    if (hist.length > 24 * 8) hist.shift();
  };
  sample(TOWN.x, TOWN.y, a.townHist);
  OUTPOSTS.forEach((o, i) => sample(o.x, o.y, a.outHist[i]));
}

export function stepHour(a) {
  const { rng } = a;
  for (const s of a.systems) {
    s.x += s.vx + (rng() - 0.5) * 1.2;
    s.y += s.vy + (rng() - 0.5) * 1.2;
    s.ageH++;
  }
  a.systems = a.systems.filter((s) => s.ageH < s.lifeH && s.x < MAP_W + 400);
  if (rng() < TUNE.spawnPerDay / 24) spawnSystem(a);
  a.hour++;
  record(a);
}

// aggregate the NEXT 24 hours into the day's truth at the town — the thing
// forecasts are scored against. Mutates atmosphere (advances a day).
export function advanceDay(a) {
  let rainH = 0, stormH = 0, maxT = -99, maxW = 0;
  const frames = [];
  for (let i = 0; i < 24; i++) {
    stepHour(a);
    const pc = precipAt(a, TOWN.x, TOWN.y);
    if (pc.cat >= 1) rainH++;
    if (pc.cat === 2) stormH++;
    const t = tempAt(a, TOWN.x, TOWN.y, a.hour);
    if ((a.hour % 24) >= 12 && (a.hour % 24) <= 16) maxT = Math.max(maxT, t);
    maxW = Math.max(maxW, gustAt(a, TOWN.x, TOWN.y));
    frames.push(snapshotLite(a));
  }
  const precip = stormH >= 2 ? 2 : rainH >= 3 ? 1 : 0;
  const temp = maxT < 15 ? 0 : maxT <= 24 ? 1 : 2;
  return { precip, temp, rainH, stormH, maxT: +maxT.toFixed(1), maxW: +maxW.toFixed(1), frames };
}

function snapshotLite(a) {
  return { hour: a.hour, systems: a.systems.map((s) => ({ x: s.x, y: s.y, str: s.str, r: s.r })) };
}

// latest instrument readings + 24h trends (what the UI and bots may use)
export function readInstruments(a) {
  const t = a.townHist, n = t.length;
  if (!n) return null;
  const now = t[n - 1];
  const ago = t[Math.max(0, n - 25)];
  const outs = OUTPOSTS.map((o, i) => {
    const h = a.outHist[i], m = h.length;
    const cur = h[m - 1], prev = h[Math.max(0, m - 25)];
    return { name: o.name, p: cur.p, trend: cur.p - prev.p, windDir: cur.windDir, windSpd: cur.windSpd };
  });
  const sky = now.precip === 2 ? 'thunderheads' : now.precip === 1 ? 'rain falling'
    : now.rh > 0.78 ? 'towering cloud' : now.rh > 0.62 ? 'overcast'
    : now.rh > 0.5 ? 'high cirrus' : 'clear skies';
  return {
    p: now.p, pTrend: now.p - ago.p, rh: now.rh,
    windDir: now.windDir, windSpd: now.windSpd, temp: now.temp, sky, outs,
  };
}
