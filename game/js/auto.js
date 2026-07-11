// Scripted painting strategies — the falsification harness.
// Pre-registered hypothesis (PLAYTEST_LOG 2026-07-10): if SMART cannot beat
// NAIVE by >=1.25x food with <=0.6x deaths on the same seed, the painting
// verb is hollow (pointing would be as good as routing).
import { F, stamp, CELL, GW, GH } from './world.js';

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

function stampRoute(field, way, r, s) {
  for (let i = 0; i < way.length - 1; i++) {
    stampLine(field, way[i][0], way[i][1], way[i + 1][0], way[i + 1][1], r, s);
  }
}

// Dijkstra cost field from the nest where entering a live hunter's ground is
// expensive. Harvest roads descend this so they hug safe ground around the
// hunters — the general-map equivalent of seed 7's hand-placed edge lanes.
function safeField(world, except) {
  const { blocked, nest, spiders } = world;
  const N = GW * GH;
  const pen = new Float32Array(N);
  for (const sp of spiders) {
    if (!sp.alive || sp === except) continue;
    const R = sp.tr + 24, R2 = R * R;
    const gx0 = Math.max(0, ((sp.hx - R) / CELL) | 0), gx1 = Math.min(GW - 1, ((sp.hx + R) / CELL) | 0);
    const gy0 = Math.max(0, ((sp.hy - R) / CELL) | 0), gy1 = Math.min(GH - 1, ((sp.hy + R) / CELL) | 0);
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const dx = gx * CELL + CELL / 2 - sp.hx, dy = gy * CELL + CELL / 2 - sp.hy;
      if (dx * dx + dy * dy < R2) pen[gy * GW + gx] += 55;
    }
  }
  const dist = new Float32Array(N).fill(1e18);
  const heapI = new Int32Array(N + 1), heapD = new Float32Array(N + 1);
  let hn = 0;
  const push = (i, d) => {
    hn++; let c = hn;
    while (c > 1 && heapD[c >> 1] > d) { heapI[c] = heapI[c >> 1]; heapD[c] = heapD[c >> 1]; c >>= 1; }
    heapI[c] = i; heapD[c] = d;
  };
  const pop = () => {
    const ri = heapI[1], rd = heapD[1], li = heapI[hn], ld = heapD[hn]; hn--;
    let c = 1;
    while (c * 2 <= hn) {
      let ch = c * 2; if (ch < hn && heapD[ch + 1] < heapD[ch]) ch++;
      if (heapD[ch] >= ld) break;
      heapI[c] = heapI[ch]; heapD[c] = heapD[ch]; c = ch;
    }
    if (hn >= 0) { heapI[c] = li; heapD[c] = ld; }
    return [ri, rd];
  };
  const ni = ((nest.y / CELL) | 0) * GW + ((nest.x / CELL) | 0);
  dist[ni] = 0; push(ni, 0);
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  while (hn > 0) {
    const [ci, cd] = pop();
    if (cd > dist[ci]) continue;
    const cx = ci % GW, cy = (ci / GW) | 0;
    for (const [ox, oy] of NB) {
      const nx = cx + ox, ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const idx = ny * GW + nx;
      if (blocked[idx]) continue;
      const nd = cd + (ox && oy ? 1.4142 : 1) + pen[idx];
      if (nd < dist[idx]) { dist[idx] = nd; push(idx, nd); }
    }
  }
  return dist;
}

// Descend an arbitrary cost field from (tx,ty) back to its zero-source, then
// return nest->target waypoints.
function routeDown(dist, world, tx, ty) {
  const { nest } = world;
  let ci = Math.min(GH - 1, Math.max(0, (ty / CELL) | 0)) * GW +
           Math.min(GW - 1, Math.max(0, (tx / CELL) | 0));
  if (dist[ci] >= 1e17) return [[nest.x, nest.y], [tx, ty]];
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const pts = [[tx, ty]];
  for (let step = 0; step < 4000 && dist[ci] > 0; step++) {
    const cx = ci % GW, cy = (ci / GW) | 0;
    let best = -1, bestD = dist[ci];
    for (const [ox, oy] of NB) {
      const nx = cx + ox, ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const idx = ny * GW + nx;
      if (dist[idx] < bestD) { bestD = dist[idx]; best = idx; }
    }
    if (best < 0) break;
    ci = best;
    pts.push([(ci % GW) * CELL + CELL / 2, ((ci / GW) | 0) * CELL + CELL / 2]);
  }
  pts.push([nest.x, nest.y]);
  pts.reverse();
  const way = [pts[0]];
  for (let i = 1; i < pts.length - 1; i += 3) way.push(pts[i]);
  way.push(pts[pts.length - 1]);
  return way;
}

// Does a live hunter still hold this pile's ground?
function guardOf(world, pile) {
  return world.spiders.find((sp) => sp.alive &&
    Math.hypot(sp.hx - pile.x, sp.hy - pile.y) < sp.tr + pile.r + 40);
}

// The nearest live hunter whose territory a route still crosses (sampled along
// the polyline). A pile behind such a hunter must not be roaded to yet — the
// hunter has to be cleared first, or foragers march straight into the kill
// zone. This is what generalizes seed 7's "kill the guard first" to maps where
// a hunter sits on the ONLY corridor to a pile.
function routeBlocker(way, live, nest) {
  let best = null, bestD = 1e18;
  for (const sp of live) {
    const R = sp.tr + 8;
    for (let i = 0; i < way.length - 1; i++) {
      const [x0, y0] = way[i], [x1, y1] = way[i + 1];
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
      const steps = Math.max(1, Math.round(len / 12));
      for (let k = 0; k <= steps; k++) {
        const px = x0 + (dx * k) / steps, py = y0 + (dy * k) / steps;
        if (Math.hypot(px - sp.hx, py - sp.hy) < R) {
          const d = Math.hypot(sp.hx - nest.x, sp.hy - nest.y);
          if (d < bestD) { bestD = d; best = sp; }
          i = way.length; break;
        }
      }
    }
  }
  return best;
}

// commander: the full-competence bot. Derives everything from the live world:
// a hunter-aware cost field yields safe harvest routes, route-blocking hunters
// are assaulted one at a time, off-route dens are FEAR-walled, and roads are
// laid only to piles whose route is currently clear. Because no path is
// hand-placed it wins generated maps, not just the tuned seed 7. If the
// scenario is winnable, this wins it.
function commander(sim) {
  const world = sim.world;
  const { fields, nest, piles, spiders } = world;
  const live = spiders.filter((sp) => sp.alive);
  const safe = safeField(world);

  // plan a safe route to each pile that still holds food; note any hunter that
  // still blocks that route.
  const foodPiles = piles.filter((p) => p.amount > 0);
  const routes = new Map();
  const mustClear = new Set();                  // hunters we must kill to progress
  for (const p of foodPiles) {
    const way = routeDown(safe, world, p.x, p.y);
    routes.set(p, way);
    const b = routeBlocker(way, live, nest);
    if (b) mustClear.add(b);
    const g = guardOf(world, p);
    if (g) mustClear.add(g);
  }
  // hunters pressing the nest approaches must also be answered
  const pressers = live.filter((sp) => Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340);
  for (const sp of pressers) mustClear.add(sp);

  // fight ONE battle at a time: the nearest hunter that must fall
  const targets = [...mustClear].sort((a, b) =>
    Math.hypot(a.hx - nest.x, a.hy - nest.y) - Math.hypot(b.hx - nest.x, b.hy - nest.y));
  const threat = targets[0];

  // FEAR-wall every live hunter we are NOT currently assaulting, so foragers
  // steer clear of the kill zones. Without this the colony bleeds ants into
  // the hunters and the food stockpile erodes on respawn costs.
  for (const sp of live) {
    if (sp !== threat) stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 30, 1.0);
  }
  if (threat) {
    // march the war caste to the hunter along a route that avoids the OTHER
    // live hunters (penalize all dens except the target), then a conversion
    // zone on the target den. Without excluding the other dens the march
    // funnels foragers through a bystander hunter's kill zone.
    const way = routeDown(safeField(world, threat), world, threat.hx, threat.hy);
    const pen = way[Math.max(0, way.length - 2)];   // last waypoint before the den
    stampRoute(fields[F.LURE], way.slice(0, -1).concat([pen]), 26, 0.8);
    stampLine(fields[F.WAR], pen[0], pen[1], threat.hx, threat.hy, 44, 1.0);
    stamp(fields[F.WAR], threat.hx, threat.hy, 90, 1.0);
  }
  // road only to piles whose route is currently clear of live hunters
  for (const p of foodPiles) {
    const way = routes.get(p);
    if (routeBlocker(way, live, nest) || guardOf(world, p)) continue;
    stampRoute(fields[F.LURE], way, 30, 0.9);
    stamp(fields[F.LURE], p.x, p.y, 62, 1.0);
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
