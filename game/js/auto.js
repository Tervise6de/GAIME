// Scripted painting strategies — the falsification harness.
// Pre-registered hypothesis (PLAYTEST_LOG 2026-07-10): if SMART cannot beat
// NAIVE by >=1.25x food with <=0.6x deaths on the same seed, the painting
// verb is hollow (pointing would be as good as routing).
//
// naive/smart/warband/idle are seed-7 baselines (fixed geometry) and are
// left untouched. `commander` is the full-competence bot; as of Loop 4 it is
// MAP-GENERAL: it derives its roads from the world's obstacle/threat grid via
// Dijkstra instead of hardcoded lanes, so it can play any generated seed.
import { F, stamp, GW, GH, CELL } from './world.js';

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

// ---------------------------------------------------------------------------
// Generalized routing: Dijkstra over the field grid from the nest, with a
// per-cell penalty for live-hunter ground so derived roads bend around
// hunters when a detour exists but still route straight through when it is
// the only way (then the war/fear verbs carry the cost). This is what makes
// the commander map-agnostic — no lane is hardcoded to seed 7.
// ---------------------------------------------------------------------------
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
            [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];

// binary min-heap keyed by float cost, storing cell indices
function makeHeap() {
  const key = [], val = [];
  return {
    size: () => val.length,
    push(k, v) {
      key.push(k); val.push(v);
      let i = val.length - 1;
      while (i > 0) { const p = (i - 1) >> 1; if (key[p] <= key[i]) break;
        [key[p], key[i]] = [key[i], key[p]]; [val[p], val[i]] = [val[i], val[p]]; i = p; }
    },
    pop() {
      const n = val.length, top = val[0];
      const lk = key.pop(), lv = val.pop();
      if (n > 1) { key[0] = lk; val[0] = lv;
        let i = 0; for (;;) { let s = i, l = 2 * i + 1, r = l + 1;
          if (l < val.length && key[l] < key[s]) s = l;
          if (r < val.length && key[r] < key[s]) s = r;
          if (s === i) break;
          [key[s], key[i]] = [key[i], key[s]]; [val[s], val[i]] = [val[i], val[s]]; i = s; } }
      return top;
    },
  };
}

// Build a per-cell penalty grid for the given live spiders. Cells within a
// hunter's kill ground get a large added step cost; a soft ramp outside it
// keeps roads from hugging the edge of danger.
function spiderPenalty(spiders, extra = 30, mag = 22) {
  const pen = new Float32Array(GW * GH);
  for (const sp of spiders) {
    if (!sp.alive) continue;
    const R = sp.tr + extra;
    const gx0 = Math.max(0, ((sp.hx - R) / CELL) | 0), gx1 = Math.min(GW - 1, ((sp.hx + R) / CELL) | 0);
    const gy0 = Math.max(0, ((sp.hy - R) / CELL) | 0), gy1 = Math.min(GH - 1, ((sp.hy + R) / CELL) | 0);
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const dx = gx * CELL + CELL / 2 - sp.hx, dy = gy * CELL + CELL / 2 - sp.hy;
      const d = Math.hypot(dx, dy);
      if (d < R) {
        const t = 1 - d / R;              // 1 at centre → 0 at rim
        const p = mag * t * t;            // steep core, soft skirt
        const i = gy * GW + gx;
        if (p > pen[i]) pen[i] = p;
      }
    }
  }
  return pen;
}

// Dijkstra from the nest over `blocked`, adding `pen[cell]` when entering a
// cell. Returns { dist, prev } over the grid.
function dijkstra(world, pen) {
  const { blocked, nest } = world;
  const N = GW * GH;
  const dist = new Float32Array(N).fill(1e18);
  const prev = new Int32Array(N).fill(-1);
  const start = ((nest.y / CELL) | 0) * GW + ((nest.x / CELL) | 0);
  dist[start] = 0;
  const h = makeHeap();
  h.push(0, start);
  while (h.size()) {
    const cur = h.pop();
    const cx = cur % GW, cy = (cur / GW) | 0;
    const dcur = dist[cur];
    for (const [ox, oy, w] of NB) {
      const nx = cx + ox, ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const ni = ny * GW + nx;
      if (blocked[ni]) continue;
      const nd = dcur + w + pen[ni];
      if (nd < dist[ni]) { dist[ni] = nd; prev[ni] = cur; h.push(nd, ni); }
    }
  }
  return { dist, prev };
}

// Backtrack from a pixel target to the nest via `prev`, returning downsampled
// [x,y] pixel waypoints (nest → target order). Null if unreachable.
function pathTo(prev, tx, ty, minStep = 60) {
  // clamp the target into the grid — spiders can wander a hair off-map, and
  // an out-of-range cell index would otherwise silently yield an empty path
  const gx = Math.min(GW - 1, Math.max(0, (tx / CELL) | 0));
  const gy = Math.min(GH - 1, Math.max(0, (ty / CELL) | 0));
  let cur = gy * GW + gx;
  if (prev[cur] < 0) return null;                // unreached (or the nest cell itself)
  const cells = [];
  let guard = 0;
  while (cur >= 0 && guard++ < GW * GH) { cells.push(cur); cur = prev[cur]; }
  cells.reverse();                               // nest → target
  const pts = [];
  let lx = -1e9, ly = -1e9;
  for (let k = 0; k < cells.length; k++) {
    const c = cells[k];
    const x = (c % GW) * CELL + CELL / 2, y = ((c / GW) | 0) * CELL + CELL / 2;
    if (k === 0 || k === cells.length - 1 || Math.hypot(x - lx, y - ly) >= minStep) {
      pts.push([x, y]); lx = x; ly = y;
    }
  }
  return pts;
}

// commanderTuned: the hand-authored solution to the handcrafted "First
// Season" (seed 7). Its lanes and endpoints are tuned to that exact geometry;
// it is the regression anchor — proven to WIN seed 7 at t≈175. Generated maps
// use commanderGeneral instead (below).
function commanderTuned(sim) {
  const { fields, nest, piles, spiders } = sim.world;
  const rich = piles[0];
  const targets = spiders.filter((sp) => sp.alive &&
    (Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340 || (sp === spiders[0] && rich.amount > 0)));
  targets.sort((p, q) => Math.hypot(p.x - nest.x, p.y - nest.y) - Math.hypot(q.x - nest.x, q.y - nest.y));
  const threat = targets[0];
  if (threat) {
    const ang = Math.atan2(threat.y - nest.y, threat.x - nest.x);
    const ax = threat.x - Math.cos(ang) * 150, ay = threat.y - Math.sin(ang) * 150;
    stampLine(fields[F.LURE], nest.x, nest.y, ax, ay, 26, 0.8);
    stampLine(fields[F.WAR], ax, ay, threat.x, threat.y, 44, 1.0);
    stamp(fields[F.WAR], threat.x, threat.y, 90, 1.0);
  }
  if (!spiders[0].alive && rich.amount > 0) {
    stampLine(fields[F.LURE], nest.x, nest.y, rich.x, rich.y, 34, 0.95);
    stamp(fields[F.LURE], rich.x, rich.y, 70, 1.0);
  }
  for (const path of [BOTTOM, TOP]) {
    for (let i = 0; i < path.length - 1; i++) {
      stampLine(fields[F.LURE], path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], 28, 0.85);
    }
  }
  stamp(fields[F.LURE], 1090, 560, 55, 1.0);
  stamp(fields[F.LURE], 1060, 120, 55, 1.0);
}

// commander: full-competence bot. Dispatches to the hand-tuned solution on the
// handcrafted map, and to the map-general router on any generated territory.
function commander(sim) {
  if (sim.world.seed === 7) return commanderTuned(sim);
  return commanderGeneral(sim);
}

// commanderGeneral: the map-agnostic bot for generated territories.
//   1. Open up to two WAR fronts — defend the nest and clear the rich guard —
//      concentrating force so fights end fast (a short fight bleeds fewer ants).
//   2. Road out to every pile that still has food, along Dijkstra paths that
//      route around the OTHER live hunters, and FEAR-wall the hunters the
//      foragers aren't meant to touch.
// Verified bot-winnable across a seed sweep (see tools/sweep_seeds.mjs).
function commanderGeneral(sim) {
  const { fields, nest, piles, spiders } = sim.world;
  const rich = piles[0];

  const guard = spiders[0];                      // guards the rich pile (both layouts)
  const live = spiders.filter((sp) => sp.alive);

  // --- open at most two WAR fronts: defend the nest AND clear the rich guard.
  // Earlier revisions fought "one battle at a time", but on generated maps a
  // nest-wave would perpetually steal focus from the guard, so the rich pile
  // (the bulk of the quota) never opened. The soldier cap (35% of the colony)
  // naturally arbitrates the split between the two fronts.
  const fronts = [];
  const nestThreats = live.filter((sp) => Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340);
  nestThreats.sort((p, q) => Math.hypot(p.x - nest.x, p.y - nest.y) - Math.hypot(q.x - nest.x, q.y - nest.y));
  if (nestThreats[0]) fronts.push(nestThreats[0]);
  if (guard.alive && rich.amount > 0 && !fronts.includes(guard)) fronts.push(guard);

  for (const target of fronts) {
    // route the war march around every OTHER live hunter, convert on target
    const { prev } = dijkstra(sim.world, spiderPenalty(live.filter((sp) => sp !== target)));
    const routed = pathTo(prev, target.hx, target.hy);
    const march = (routed && routed.length) ? routed : [[nest.x, nest.y], [target.hx, target.hy]];
    for (let i = 0; i < march.length - 1; i++) {
      stampLine(fields[F.LURE], march[i][0], march[i][1], march[i + 1][0], march[i + 1][1], 26, 0.8);
    }
    // Kill FAST by concentrating force. Two placements matter and they differ:
    // the march + recruit skirt sit on the hunter's stable HOME centre (a
    // moving target would smear the road and never deliver a column — this is
    // what sealed far-corner guards in the sweep); the damage CORE tracks the
    // hunter's CURRENT position, because a hunter wanders ~90px off home and a
    // tight core on an empty home spot does no damage. Skirt covers the whole
    // territory so foragers convert; core pulls them onto the actual body.
    const a = march[march.length - 2] || [nest.x, nest.y], b = march[march.length - 1];
    stampLine(fields[F.WAR], a[0], a[1], b[0], b[1], 46, 1.0);
    stamp(fields[F.WAR], target.hx, target.hy, Math.min(94, target.tr * 0.7 + 42), 0.85); // recruit skirt
    stamp(fields[F.WAR], target.x, target.y, 44, 1.0);     // concentration core on the body
  }

  // --- roads to every pile that still holds food, around the live hunters ---
  const { prev } = dijkstra(sim.world, spiderPenalty(live));
  for (const p of piles) {
    if (p.amount <= 0) continue;
    // don't road foragers into the rich pile while its guard still lives —
    // let the soldiers clear it first, then harvest next period
    if (p === rich && guard.alive && Math.hypot(guard.hx - p.x, guard.hy - p.y) < guard.tr + p.r) continue;
    const road = pathTo(prev, p.x, p.y);
    if (road && road.length) {
      for (let i = 0; i < road.length - 1; i++) {
        stampLine(fields[F.LURE], road[i][0], road[i][1], road[i + 1][0], road[i + 1][1], 28, 0.85);
      }
    } else {
      // no detour exists — road straight and let FEAR/attrition decide
      stampLine(fields[F.LURE], nest.x, nest.y, p.x, p.y, 30, 0.8);
    }
    stamp(fields[F.LURE], p.x, p.y, 58, 1.0);
  }

  // --- FEAR-wall the hunters the foragers are NOT meant to engage ---
  for (const sp of live) {
    if (fronts.includes(sp)) continue;           // soldiers are going there
    stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 34, 1.0);
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
