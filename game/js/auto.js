// Scripted painting strategies — the falsification harness.
// Pre-registered hypothesis (PLAYTEST_LOG 2026-07-10): if SMART cannot beat
// NAIVE by >=1.25x food with <=0.6x deaths on the same seed, the painting
// verb is hollow (pointing would be as good as routing).
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

// --- generalized routing (works on ANY layout, not just seed 7) ---
// Dijkstra cost-field from the nest over the passable grid. Cost per step is
// 1 (1.414 diagonal) plus a penalty inside live-hunter territory, so extracted
// LURE roads bend AROUND the hunters the way a competent painter would draw
// them. This is the "BFS route extraction" the winnability oracle needs.
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
            [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
// cost-field state shared across one commander tick: dist[] from the nest and
// the hunter-penalty grid the smoother must not cut back across.
function costField(world) {
  const { blocked, nest, spiders } = world;
  const N = GW * GH;
  // per-cell hunter penalty (soft margin so roads keep clear of den edges)
  const pen = new Float32Array(N);
  for (const sp of spiders) {
    if (!sp.alive) continue;
    const R = sp.tr + 44, R2 = R * R;
    const gx0 = Math.max(0, ((sp.hx - R) / CELL) | 0), gx1 = Math.min(GW - 1, ((sp.hx + R) / CELL) | 0);
    const gy0 = Math.max(0, ((sp.hy - R) / CELL) | 0), gy1 = Math.min(GH - 1, ((sp.hy + R) / CELL) | 0);
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const dx = gx * CELL + CELL / 2 - sp.hx, dy = gy * CELL + CELL / 2 - sp.hy;
      if (dx * dx + dy * dy < R2) pen[gy * GW + gx] += 4;
    }
  }
  const dist = new Float32Array(N).fill(Infinity);
  // SPFA queue (non-negative weights, small grid) — fast and terse.
  const q = [];
  const s = ((nest.y / CELL) | 0) * GW + ((nest.x / CELL) | 0);
  dist[s] = 0; q.push(s); const inq = new Uint8Array(N); inq[s] = 1;
  let head = 0;
  while (head < q.length) {
    const c = q[head++]; inq[c] = 0;
    const cx = c % GW, cy = (c / GW) | 0, dc = dist[c];
    for (const [ox, oy, w] of NB) {
      const nx = cx + ox, ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const ni = ny * GW + nx;
      if (blocked[ni]) continue;
      const nd = dc + w + pen[ni];
      if (nd < dist[ni]) { dist[ni] = nd; if (!inq[ni]) { inq[ni] = 1; q.push(ni); } }
    }
  }
  return { dist, pen };
}
// True if the straight segment a->b stays on passable ground AND does not cut
// back into hunter territory (so smoothing keeps the detour the field chose).
function clearSeg(world, pen, ax, ay, bx, by) {
  const { blocked } = world;
  const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 5));
  for (let i = 0; i <= n; i++) {
    const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n;
    const gi = Math.min(GH - 1, Math.max(0, (y / CELL) | 0)) * GW + Math.min(GW - 1, Math.max(0, (x / CELL) | 0));
    if (blocked[gi] || pen[gi] > 0) return false;
  }
  return true;
}
// Extract the least-cost path from (tx,ty) back to the nest via steepest
// descent, string-pull it straight (line-of-sight), then paint the field along
// the simplified polyline toward the goal. Straight roads = short round-trips.
function routeLure(field, world, cf, tx, ty, r, s) {
  const { dist, pen } = cf;
  const raw = [];
  let cx = Math.min(GW - 1, Math.max(0, (tx / CELL) | 0));
  let cy = Math.min(GH - 1, Math.max(0, (ty / CELL) | 0));
  for (let guard = 0; guard < GW * GH; guard++) {
    raw.push([cx * CELL + CELL / 2, cy * CELL + CELL / 2]);
    if (dist[cy * GW + cx] <= 0) break;
    let found = false, bx = cx, by = cy, bd = dist[cy * GW + cx];
    for (const [ox, oy] of NB) {
      const nx = cx + ox, ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const d = dist[ny * GW + nx];
      if (d < bd) { bd = d; bx = nx; by = ny; found = true; }
    }
    if (!found) break;             // local minimum / unreachable
    cx = bx; cy = by;
  }
  raw.reverse();                   // nest -> target
  // string-pull: keep an anchor, extend to the farthest still-visible point
  const pts = [raw[0]];
  let a = 0;
  for (let j = 2; j < raw.length; j++) {
    if (!clearSeg(world, pen, raw[a][0], raw[a][1], raw[j][0], raw[j][1])) {
      pts.push(raw[j - 1]); a = j - 1;
    }
  }
  pts.push(raw[raw.length - 1]);
  for (let i = 0; i < pts.length - 1; i++) {
    stampLine(field, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], r, s);
  }
}

// commander: the full-competence bot, layout-agnostic. Clears whichever hunter
// guards the richest live pile or presses the nest, then paints cost-routed
// LURE roads to every reachable un-guarded pile. If the scenario is winnable
// on ANY seed, this wins it — that is what makes it the winnability oracle.
function guarding(sp, p) { return sp.alive && Math.hypot(sp.hx - p.x, sp.hy - p.y) < sp.tr + p.r; }
function commander(sim) {
  const { fields, nest, piles, spiders } = sim.world;
  const cf = costField(sim.world);
  // fight ONE battle at a time: the nearest live hunter that either presses
  // the nest OR guards a pile that still holds food worth taking.
  const targets = spiders.filter((sp) => sp.alive && (
    Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340 ||
    piles.some((p) => p.amount > 0 && guarding(sp, p))));
  targets.sort((p, q) => Math.hypot(p.x - nest.x, p.y - nest.y) - Math.hypot(q.x - nest.x, q.y - nest.y));
  const threat = targets[0];
  if (threat) {
    // DIRECT staging strike: LURE a march route out to a staging point just
    // short of the hunter, then a strong WAR conversion zone driving INTO it.
    // (War must aim at the hunter, so it is drawn straight, not cost-routed.)
    const ang = Math.atan2(threat.hy - nest.y, threat.hx - nest.x);
    const ax = threat.hx - Math.cos(ang) * 150, ay = threat.hy - Math.sin(ang) * 150;
    routeLure(fields[F.LURE], sim.world, cf, ax, ay, 26, 0.8);
    stampLine(fields[F.WAR], ax, ay, threat.hx, threat.hy, 44, 1.0);
    // cover the WHOLE territory: the hunter wanders up to tr from its den, so a
    // narrow blob lets it outrun its soldiers (the guard then never dies and
    // the pile behind it stays locked — the seed-2/3 loss mode).
    stamp(fields[F.WAR], threat.hx, threat.hy, threat.tr + 10, 1.0);
    stamp(fields[F.WAR], threat.x, threat.y, 70, 1.0);
  }
  // FEAR walls over every live hunter's ground protect the supply lines:
  // foragers are repelled, cutting attrition; soldiers sense only WAR, so the
  // strike above still drives home. Skip the pile a hunter guards until the
  // hunter dies (a wall there would repel the harvest we are about to open).
  for (const sp of spiders) {
    if (!sp.alive) continue;
    if (threat && sp === threat) continue;      // don't wall the fight in progress
    stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 24, 0.95);
  }
  // roads to every live pile not currently sealed behind a live hunter
  for (const p of piles) {
    if (p.amount <= 0) continue;
    if (spiders.some((sp) => guarding(sp, p))) continue;   // fight first, road later
    routeLure(fields[F.LURE], sim.world, cf, p.x, p.y, 30, 0.9);
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
