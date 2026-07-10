// STORMWARDEN — the truth simulation.
//
// A small systemic atmosphere: signed pressure "systems" (highs + lows) spawn
// at the upwind (west) edge and advect east across the domain on a slowly
// meandering prevailing wind. Lows carry moisture, highs are dry. The town's
// weather each day is read analytically from the superposition of systems.
//
// The point being tested: because systems MOVE, what is upwind of the town now
// arrives tomorrow. A forecaster who reads instruments (barometric tendency +
// an upwind lookout sensor) can therefore beat a forecaster who only knows
// today's weather ("persistence"). If they cannot, there is no skill to learn.
import { mulberry32 } from './rng.js';

export const GW = 64, GH = 36, CELL = 20;      // grid → 1280 x 720 canvas
export const TICKS_PER_DAY = 12;                // 2-hourly steps
export const TOWN = { x: 46, y: 18 };
export const P0 = 1013;                          // baseline pressure (hPa)
export const Q0 = 30;                            // baseline moisture (%)

export const CATS = ['CLEAR', 'CLOUDY', 'RAIN', 'STORM'];

// Prevailing wind (grid cells per day), slowly meandering. Mean ~ due east so
// systems track west→east like real mid-latitude weather.
export function prevailingWind(day) {
  const spd = 4.8 + 0.9 * Math.sin(day * 0.55 + 0.7);
  const dir = 0.28 * Math.sin(day * 0.31);       // small north/south meander (rad)
  return { x: spd * Math.cos(dir), y: spd * Math.sin(dir) };
}

function spawnSystem(rng, day) {
  const isLow = rng() < 0.55;                    // slightly more lows than highs
  const rad = 6 + rng() * 5;
  if (isLow) {
    const amp = -(8 + rng() * 15);               // −8 .. −23 hPa
    return {
      x: -4 - rng() * 4, y: 5 + rng() * 26, rad,
      amp, qamp: 34 + rng() * 30,                // wet
      jx: (rng() - 0.5) * 0.9, jy: (rng() - 0.5) * 1.2,
      born: day, low: true,
    };
  }
  const amp = 8 + rng() * 10;                    // +8 .. +18 hPa
  return {
    x: -4 - rng() * 4, y: 5 + rng() * 26, rad,
    amp, qamp: -(12 + rng() * 12),               // dry
    jx: (rng() - 0.5) * 0.7, jy: (rng() - 0.5) * 1.0,
    born: day, low: false,
  };
}

export function makeAtmo(seed) {
  const rng = mulberry32((seed >>> 0) ^ 0x5721);
  const a = {
    seed, rng, tick: 0, time: 0,                 // time in days
    systems: [], nextSpawnDay: 0,
    history: [],                                  // town pressure samples for tendency
  };
  // Warm start: a few systems already partway across so day 1 isn't blank.
  for (let i = 0; i < 3; i++) {
    const s = spawnSystem(rng, 0);
    s.x = 4 + i * 16 + rng() * 6;
    a.systems.push(s);
  }
  a.nextSpawnDay = 1.0 + rng() * 1.2;
  return a;
}

function contribP(sys, x, y) {
  const dx = x - sys.x, dy = y - sys.y;
  return sys.amp * Math.exp(-(dx * dx + dy * dy) / (2 * sys.rad * sys.rad));
}
function contribQ(sys, x, y) {
  const r = sys.rad * 0.95, dx = x - sys.x, dy = y - sys.y;
  return sys.qamp * Math.exp(-(dx * dx + dy * dy) / (2 * r * r));
}

export function pressureAt(a, x, y) {
  let p = P0;
  for (const s of a.systems) p += contribP(s, x, y);
  return p;
}
export function moistureAt(a, x, y) {
  let q = Q0;
  for (const s of a.systems) q += contribQ(s, x, y);
  return Math.max(0, Math.min(100, q));
}

// Wind at a point: prevailing plus weak cyclonic/anticyclonic rotation around
// nearby systems (lows spin toward low pressure). Gives the wind vane meaning.
export function windAt(a, x, y) {
  const w = prevailingWind(a.time);
  let vx = w.x, vy = w.y;
  for (const s of a.systems) {
    const dx = x - s.x, dy = y - s.y, d2 = dx * dx + dy * dy;
    const infl = Math.exp(-d2 / (2 * s.rad * s.rad)) * (s.amp / 12);
    // tangential: rotate the radial vector 90°, sign from system type
    const d = Math.sqrt(d2) + 1e-3;
    vx += (-dy / d) * -infl * 1.4;
    vy += (dx / d) * -infl * 1.4;
  }
  return { x: vx, y: vy };
}

export function temperatureAt(a, x, y) {
  // Flavour only: warmer air ahead of (east of) lows, cooler behind.
  let t = 13;
  const q = moistureAt(a, x, y);
  t += (q - Q0) * 0.04;
  for (const s of a.systems) {
    if (!s.low) continue;
    const ahead = (x - s.x);                     // east of the low = warm sector
    const dy = y - s.y;
    const infl = Math.exp(-(ahead * ahead * 0.02 + dy * dy * 0.03));
    t += Math.sign(ahead) * infl * 3.5;
  }
  return t;
}

// Deterministic weather category at any point from pressure + moisture.
export function classify(P, Q) {
  if (Q >= 66 && P <= 1005) return 3;            // STORM
  if (Q >= 54 && P <= 1011) return 2;            // RAIN
  if (Q >= 42 || P <= 1010) return 1;            // CLOUDY
  return 0;                                       // CLEAR
}

export function townState(a) {
  const P = pressureAt(a, TOWN.x, TOWN.y);
  const Q = moistureAt(a, TOWN.x, TOWN.y);
  const T = temperatureAt(a, TOWN.x, TOWN.y);
  const w = windAt(a, TOWN.x, TOWN.y);
  return { P, Q, T, wind: w, cat: classify(P, Q) };
}

export function step(a) {
  const dt = 1 / TICKS_PER_DAY;
  const w = prevailingWind(a.time);
  for (const s of a.systems) {
    s.x += (w.x + s.jx) * dt;
    s.y += (w.y + s.jy) * dt;
    // gentle life cycle: systems mature then weaken as they cross
    const age = a.time - s.born;
    if (age > 2.2) { s.amp *= 0.995; s.qamp *= 0.995; }
  }
  // retire systems that have left the eastern edge
  a.systems = a.systems.filter((s) => s.x < GW + 10 && Math.abs(s.amp) > 1.2);
  // spawn upwind
  while (a.time >= a.nextSpawnDay) {
    a.systems.push(spawnSystem(a.rng, a.time));
    a.nextSpawnDay += 1.1 + a.rng() * 1.4;
  }
  a.tick++;
  a.time += dt;
  // record town pressure for tendency (keep ~1 day of samples)
  a.history.push(pressureAt(a, TOWN.x, TOWN.y));
  if (a.history.length > TICKS_PER_DAY + 2) a.history.shift();
}

// Pressure change over the last `hours` (in hPa). Falling = deteriorating.
export function tendency(a, hours = 12) {
  const back = Math.max(1, Math.round((hours / 24) * TICKS_PER_DAY));
  const h = a.history;
  if (h.length <= back) return 0;
  return h[h.length - 1] - h[h.length - 1 - back];
}
