// Scripted painting strategies — the falsification harness.
// Pre-registered hypothesis (PLAYTEST_LOG 2026-07-10): if SMART cannot beat
// NAIVE by >=1.25x food with <=0.6x deaths on the same seed, the painting
// verb is hollow (pointing would be as good as routing).
import { F, CELL, GW, GH, stamp } from './world.js';

function stampLine(field, x0, y0, x1, y1, r, s, spacing = 26) {
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
  const n = Math.max(1, Math.round(len / spacing));
  for (let i = 0; i <= n; i++) stamp(field, x0 + (dx * i) / n, y0 + (dy * i) / n, r, s);
}

// naive player: paint a straight lure line from nest to the richest pile
// (straight through spider territory) and a blob on the pile.
function naive(sim) {
  const { fields, nest, piles } = sim.world;
  const rich = piles[0];
  stampLine(fields[F.LURE], nest.x, nest.y, rich.x, rich.y, 34, 0.95);
  stamp(fields[F.LURE], rich.x, rich.y, 90, 1.0);
}

// smart player: safe corridors around both spider territories to the two
// unguarded piles, plus FEAR walls over spider ground.
const BOTTOM = [[170, 360], [230, 560], [300, 662], [520, 680], [800, 680], [1010, 640], [1090, 560]];
const TOP = [[170, 360], [220, 200], [300, 80], [520, 62], [720, 66], [900, 88], [1060, 120]];
function smart(sim) {
  const { fields, spiders } = sim.world;
  for (const path of [BOTTOM, TOP]) {
    for (let i = 0; i < path.length - 1; i++) {
      stampLine(fields[F.LURE], path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], 30, 0.9);
    }
  }
  stamp(fields[F.LURE], 1090, 560, 60, 1.0);
  stamp(fields[F.LURE], 1060, 120, 60, 1.0);
  for (const sp of spiders) if (sp.alive) stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 30, 1.0);
}

// warband: same greedy route as naive, but first rallies the colony to
// destroy the guarding spider — tests verb composition (RALLY + LURE).
function warband(sim) {
  const { fields, nest, piles, spiders } = sim.world;
  const rich = piles[0];
  const sp = spiders[0];
  if (sp.alive) {
    // feed soldiers toward the spider along a rally line
    stampLine(fields[F.WAR], nest.x + 60, nest.y, sp.x, sp.y, 40, 1.0);
    stamp(fields[F.WAR], sp.x, sp.y, 80, 1.0);
    stampLine(fields[F.LURE], nest.x, nest.y, sp.x - 60, sp.y, 30, 0.7);
  } else {
    stampLine(fields[F.LURE], nest.x, nest.y, rich.x, rich.y, 34, 0.95);
    stamp(fields[F.LURE], rich.x, rich.y, 90, 1.0);
  }
}

// idle: paints nothing — the incompetence baseline the goal must punish
function idle() {}

// --- generic pathfinding: derive a hunter-avoiding road from the nest to any
// point on ANY map (no hardcoded waypoints). This is what lets the commander
// play generated territories, not just the handcrafted seed-7 map. ---

// Reused across calls so the bot allocates nothing per invocation (a fresh
// buffer per call caused pathological GC). Sized to the fixed field grid.
const _N = GW * GH;
const _dist = new Float32Array(_N);
const _prev = new Int32Array(_N);
const _pen = new Float32Array(_N);
// garbage-free binary min-heap over cell indices, keyed by parallel _hk[].
const _hk = new Float32Array(_N + 1);   // key of heap slot
const _hi = new Int32Array(_N + 1);     // cell index at heap slot
let _hn = 0;                            // heap size
function heapClear() { _hn = 0; }
function heapPush(k, i) {
  let c = _hn++; _hk[c] = k; _hi[c] = i;
  while (c > 0) {
    const p = (c - 1) >> 1;
    if (_hk[p] <= _hk[c]) break;
    const tk = _hk[p]; _hk[p] = _hk[c]; _hk[c] = tk;
    const ti = _hi[p]; _hi[p] = _hi[c]; _hi[c] = ti;
    c = p;
  }
}
function heapPopIdx() {
  const topI = _hi[0];
  _hn--;
  if (_hn > 0) {
    _hk[0] = _hk[_hn]; _hi[0] = _hi[_hn];
    let c = 0;
    for (;;) {
      let l = 2 * c + 1, r = l + 1, m = c;
      if (l < _hn && _hk[l] < _hk[m]) m = l;
      if (r < _hn && _hk[r] < _hk[m]) m = r;
      if (m === c) break;
      const tk = _hk[m]; _hk[m] = _hk[c]; _hk[c] = tk;
      const ti = _hi[m]; _hi[m] = _hi[c]; _hi[c] = ti;
      c = m;
    }
  }
  return topI;
}

const NX = [1, -1, 0, 0, 1, 1, -1, -1];
const NY = [0, 0, 1, -1, 1, -1, 1, -1];
const NW = [1, 1, 1, 1, 1.4142, 1.4142, 1.4142, 1.4142];

// Dijkstra on the field grid from the nest to (tx,ty), penalising cells that
// lie inside a LIVE hunter's territory so the road bends around danger. Returns
// downsampled waypoints in pixel space, or null if truly unreachable. The
// per-cell hunter penalty (_pen) is filled once per bot call by refreshPenalty.
function derivePath(world, tx, ty) {
  const { blocked, nest } = world;
  const sx = Math.min(GW - 1, Math.max(0, (nest.x / CELL) | 0));
  const sy = Math.min(GH - 1, Math.max(0, (nest.y / CELL) | 0));
  const gx = Math.min(GW - 1, Math.max(0, (tx / CELL) | 0));
  const gy = Math.min(GH - 1, Math.max(0, (ty / CELL) | 0));
  const start = sy * GW + sx, goal = gy * GW + gx;

  _dist.fill(1e18); _prev.fill(-1);
  _dist[start] = 0;
  heapClear(); heapPush(0, start);
  while (_hn > 0) {
    const cur = heapPopIdx();
    const dcur = _dist[cur];
    if (cur === goal) break;
    const ccx = cur % GW, ccy = (cur / GW) | 0;
    for (let n = 0; n < 8; n++) {
      const nx = ccx + NX[n], ny = ccy + NY[n];
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const ni = ny * GW + nx;
      if (blocked[ni]) continue;
      const nd = dcur + NW[n] + _pen[ni];
      if (nd < _dist[ni]) { _dist[ni] = nd; _prev[ni] = cur; heapPush(nd, ni); }
    }
  }
  if (_dist[goal] >= 1e17) return null;

  const cells = [];
  for (let c = goal; c !== -1; c = _prev[c]) cells.push(c);
  cells.reverse();
  const wp = [];
  for (let i = 0; i < cells.length; i += 5) {
    const c = cells[i];
    wp.push([(c % GW) * CELL + CELL / 2, ((c / GW) | 0) * CELL + CELL / 2]);
  }
  wp.push([tx, ty]);                            // finish exactly on the pile
  return wp;
}

// fill _pen with the danger field of the currently-live hunters (finite, so a
// path always exists even if boxed in) and return a signature of that hunter
// set so cached roads can be reused until the set changes.
function refreshPenalty(spiders) {
  _pen.fill(0);
  let sig = spiders.length * 131071;
  for (let k = 0; k < spiders.length; k++) {
    const sp = spiders[k];
    if (!sp.alive) continue;
    sig = (sig * 31 + ((sp.hx | 0) * 92821 ^ (sp.hy | 0))) | 0;
    // Tapered penalty: strong at the den, ~0 at the edge. Modest peak so a road
    // skirts a territory's rim (short detour) rather than arcing across the map
    // (a long detour taxes round-trip time AND exposes foragers longer — both
    // hurt more than a brief pass near the rim, which the FEAR walls cover).
    const Rr = sp.tr + 16, R2 = Rr * Rr;
    const cx0 = Math.max(0, ((sp.hx - Rr) / CELL) | 0), cx1 = Math.min(GW - 1, ((sp.hx + Rr) / CELL) | 0);
    const cy0 = Math.max(0, ((sp.hy - Rr) / CELL) | 0), cy1 = Math.min(GH - 1, ((sp.hy + Rr) / CELL) | 0);
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      const dx = cx * CELL + CELL / 2 - sp.hx, dy = cy * CELL + CELL / 2 - sp.hy;
      const d2 = dx * dx + dy * dy;
      if (d2 < R2) _pen[cy * GW + cx] += 14 * (1 - Math.sqrt(d2) / Rr);
    }
  }
  return sig;
}

// stamp a cached (or freshly derived) road of LURE from the nest out to a pile.
function roadTo(world, cache, key, tx, ty, blobR) {
  let wp = cache.get(key);
  if (wp === undefined) { wp = derivePath(world, tx, ty); cache.set(key, wp); }
  if (!wp) return;
  const lure = world.fields[F.LURE];
  for (let i = 0; i < wp.length - 1; i++) stampLine(lure, wp[i][0], wp[i][1], wp[i + 1][0], wp[i + 1][1], 28, 0.9);
  stamp(lure, tx, ty, blobR, 1.0);
}

// is a point currently inside any live hunter's territory (with margin)?
function inHunterGround(spiders, x, y, margin) {
  return spiders.some((sp) => sp.alive && Math.hypot(sp.hx - x, sp.hy - y) < sp.tr + margin);
}

// commander: the full-competence bot — clears the guard, harvests the rich
// pile, roads out to the far piles, and rallies against every hunter that
// threatens the nest approaches. Fully map-agnostic: roads are BFS-derived and
// bend around live hunters, so if a generated scenario is winnable, this wins
// it. (No hardcoded waypoints — see derivePath.)
function commander(sim) {
  const { fields, nest, piles, spiders } = sim.world;
  const rich = piles[0];
  // fight ONE battle at a time: nearest live hunter that matters — either
  // pressing the nest approaches or guarding an unexhausted rich pile
  const targets = spiders.filter((sp) => sp.alive &&
    (Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340 || (sp === spiders[0] && rich.amount > 0)));
  targets.sort((p, q) => Math.hypot(p.x - nest.x, p.y - nest.y) - Math.hypot(q.x - nest.x, q.y - nest.y));
  const threat = targets[0];
  if (threat) {
    // short approach line + strike blob: converts a warband, not the nation
    const ang = Math.atan2(threat.y - nest.y, threat.x - nest.x);
    const ax = threat.x - Math.cos(ang) * 150, ay = threat.y - Math.sin(ang) * 150;
    stampLine(fields[F.LURE], nest.x, nest.y, ax, ay, 26, 0.8);   // march route
    stampLine(fields[F.WAR], ax, ay, threat.x, threat.y, 44, 1.0); // conversion zone
    stamp(fields[F.WAR], threat.x, threat.y, 90, 1.0);
  }
  // wall every other live hunter's territory with FEAR so wandering foragers are
  // pushed off dangerous ground (deaths drain foodStock via respawn cost — the
  // dominant lever on this scenario). The roads route well clear of hunters (see
  // the two-tier penalty), so these walls no longer overlap and choke them.
  // Soldiers sense only WAR, so this never blunts the assault on the target.
  for (const sp of spiders) {
    if (sp.alive && sp !== threat) stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 18, 1.0);
  }
  // road to every pile that still has food and is not currently under guard —
  // the guarded rich pile waits until its hunter falls; a wave that parks on a
  // lane pauses that road until it is cleared. Roads route around live hunters
  // and are cached until the live-hunter set changes (Dijkstra reruns only then).
  const sig = refreshPenalty(spiders);
  if (!sim.world._roadCache) sim.world._roadCache = new Map();
  const cache = sim.world._roadCache;
  for (let pi = 0; pi < piles.length; pi++) {
    const p = piles[pi];
    if (p.amount <= 0) continue;
    if (inHunterGround(spiders, p.x, p.y, p.r + 12)) continue;
    roadTo(sim.world, cache, sig * 8 + pi, p.x, p.y, p === rich ? 70 : 55);
  }
}

export const STRATEGIES = { naive, smart, warband, idle, commander };

export function makeAutoPlayer(name, periodTicks = 240) {
  const fn = STRATEGIES[name];
  if (!fn) return null;
  return (sim) => {
    if (sim.tick % periodTicks === 1) fn(sim);
  };
}
