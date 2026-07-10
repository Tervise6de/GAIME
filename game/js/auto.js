// Scripted painting strategies — the falsification harness.
// Pre-registered hypothesis (PLAYTEST_LOG 2026-07-10): if SMART cannot beat
// NAIVE by >=1.25x food with <=0.6x deaths on the same seed, the painting
// verb is hollow (pointing would be as good as routing).
import { F, GW, GH, CELL, stamp } from './world.js';

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

// --- map-agnostic pathing (used by the generalized commander) ---------------
// Dijkstra on the CELL grid from a source pixel, with a soft penalty for
// entering live-hunter territory, so roads route AROUND hunters where a
// detour exists and only cross them when reachability forces it. Returns a
// simplified list of pixel waypoints, or null if unreachable.
function gridPath(world, sx, sy, tx, ty) {
  const { blocked, spiders } = world;
  const N = GW * GH;
  const cell = (x, y) => {
    const gx = Math.min(GW - 1, Math.max(0, (x / CELL) | 0));
    const gy = Math.min(GH - 1, Math.max(0, (y / CELL) | 0));
    return gy * GW + gx;
  };
  // per-cell hunter penalty (0 outside all live territories)
  const pen = new Float32Array(N);
  const live = spiders.filter((sp) => sp.alive);
  if (live.length) {
    for (let gy = 0; gy < GH; gy++) for (let gx = 0; gx < GW; gx++) {
      const px = gx * CELL + CELL / 2, py = gy * CELL + CELL / 2;
      for (const sp of live) {
        const rr = sp.tr + 24;
        if ((px - sp.hx) ** 2 + (py - sp.hy) ** 2 < rr * rr) { pen[gy * GW + gx] = 60; break; }
      }
    }
  }
  const start = cell(sx, sy), goal = cell(tx, ty);
  const dist = new Float32Array(N).fill(1e18);
  const prev = new Int32Array(N).fill(-1);
  dist[start] = 0;
  // binary min-heap keyed on dist
  const heap = [start];
  const hpush = (v) => {
    heap.push(v); let i = heap.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (dist[heap[p]] <= dist[heap[i]]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
  };
  const hpop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && dist[heap[l]] < dist[heap[m]]) m = l; if (r < heap.length && dist[heap[r]] < dist[heap[m]]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } }
    return top;
  };
  const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
  while (heap.length) {
    const c = hpop();
    if (c === goal) break;
    const cd = dist[c], cx = c % GW, cy = (c / GW) | 0;
    for (const [ox, oy, w] of NB) {
      const nx = cx + ox, ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const ni = ny * GW + nx;
      if (blocked[ni]) continue;
      const nd = cd + w + pen[ni];
      if (nd < dist[ni]) { dist[ni] = nd; prev[ni] = c; hpush(ni); }
    }
  }
  if (dist[goal] >= 1e18) return null;
  // reconstruct + simplify (keep every ~5th cell)
  const cells = [];
  for (let c = goal; c !== -1; c = prev[c]) cells.push(c);
  cells.reverse();
  const wp = [];
  for (let i = 0; i < cells.length; i += 5) {
    const c = cells[i];
    wp.push([(c % GW) * CELL + CELL / 2, ((c / GW) | 0) * CELL + CELL / 2]);
  }
  wp.push([tx, ty]);
  return wp;
}

function paintRoad(world, fields, from, to) {
  const wp = gridPath(world, from.x, from.y, to.x, to.y);
  if (!wp) { stampLine(fields[F.LURE], from.x, from.y, to.x, to.y, 30, 0.85); return; }
  wp.unshift([from.x, from.y]);
  for (let i = 0; i < wp.length - 1; i++) {
    stampLine(fields[F.LURE], wp[i][0], wp[i][1], wp[i + 1][0], wp[i + 1][1], 28, 0.85);
  }
}

// hand-tuned reference lanes for the handcrafted seed-7 map (BOTTOM + TOP)
function seed7Roads(fields, nest, piles, spiders) {
  const rich = piles[0];
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

// map-agnostic corridors for GENERATED maps. Each pile's road is launched out
// of the nest on a separated bearing (so TRAIL feedback can't merge the lanes
// and starve a pile), then obstacle/hunter-aware pathing carries it home.
function generatedRoads(world, fields, nest, piles, spiders) {
  const rich = piles[0];
  const live = piles.filter((p) => p.amount > 0 && !(p === rich && spiders[0].alive));
  const bearings = spreadBearings(nest, live);
  for (let k = 0; k < live.length; k++) {
    const p = live[k];
    const stage = stagePoint(world, nest, bearings[k]);
    stampLine(fields[F.LURE], nest.x, nest.y, stage.x, stage.y, 30, 0.95); // launch spur
    paintRoad(world, fields, stage, p);
    stamp(fields[F.LURE], p.x, p.y, 60, 1.0);
  }
}

// commander: the full-competence bot — clears the guard, harvests the rich
// pile, roads out to the far piles, walls foragers away from idle hunters, and
// rallies against whichever hunter presses the nest. The handcrafted seed-7
// map keeps its validated reference lanes; every generated map is played with
// map-agnostic corridors + FEAR containment. If a scenario is winnable at all,
// this bot is the ceiling that says so.
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
  if (sim.world.seed === 7) {
    seed7Roads(fields, nest, piles, spiders);
    return;
  }
  // generated maps: wall foragers away from every hunter we're NOT converting,
  // so roaming dens and reinforcement waves can't bleed the colony white
  for (const sp of spiders) {
    if (sp.alive && sp !== threat) stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 26, 0.95);
  }
  generatedRoads(sim.world, fields, nest, piles, spiders);
}

// assign each pile a launch bearing out of the nest, spreading corridors that
// share a similar heading so they leave the nest mouth as distinct lanes
function spreadBearings(nest, piles) {
  const items = piles.map((p, i) => ({ i, b: Math.atan2(p.y - nest.y, p.x - nest.x) }));
  items.sort((a, b) => a.b - b.b);
  const SEP = 0.55; // ~31 degrees minimum between adjacent corridors
  const meanBefore = items.reduce((a, it) => a + it.b, 0) / items.length;
  for (let k = 1; k < items.length; k++) {
    if (items[k].b - items[k - 1].b < SEP) items[k].b = items[k - 1].b + SEP;
  }
  // recenter so the fan straddles the original mean instead of drifting one way
  const meanAfter = items.reduce((a, it) => a + it.b, 0) / items.length;
  const shift = meanBefore - meanAfter;
  const out = new Array(piles.length);
  for (const it of items) out[it.i] = it.b + shift;
  return out;
}

// a staging point ~190px out along the bearing, pulled in if it would land in
// a wall so the launch spur stays on open ground
function stagePoint(world, nest, bearing) {
  const { blocked } = world;
  for (let R = 190; R >= 70; R -= 30) {
    const x = Math.max(20, Math.min(GW * CELL - 20, nest.x + Math.cos(bearing) * R));
    const y = Math.max(20, Math.min(GH * CELL - 20, nest.y + Math.sin(bearing) * R));
    const idx = ((y / CELL) | 0) * GW + ((x / CELL) | 0);
    if (!blocked[idx]) return { x, y };
  }
  return { x: nest.x, y: nest.y };
}

export const STRATEGIES = { naive, smart, warband, idle, commander };

export function makeAutoPlayer(name, periodTicks = 240) {
  const fn = STRATEGIES[name];
  if (!fn) return null;
  return (sim) => {
    if (sim.tick % periodTicks === 1) fn(sim);
  };
}
