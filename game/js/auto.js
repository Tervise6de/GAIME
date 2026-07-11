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

// commander: the full-competence bot — clears the guard, harvests the rich
// pile, roads out to the far piles, and rallies against every hunter that
// threatens the nest approaches. If the scenario is winnable, this wins it.
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
  if (!spiders[0].alive && rich.amount > 0) {
    stampLine(fields[F.LURE], nest.x, nest.y, rich.x, rich.y, 34, 0.95);
    stamp(fields[F.LURE], rich.x, rich.y, 70, 1.0);
  }
  // roads to the unguarded piles (bottom + top lanes)
  for (const path of [BOTTOM, TOP]) {
    for (let i = 0; i < path.length - 1; i++) {
      stampLine(fields[F.LURE], path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], 28, 0.85);
    }
  }
  stamp(fields[F.LURE], 1090, 560, 55, 1.0);
  stamp(fields[F.LURE], 1060, 120, 55, 1.0);
}

// --- generalized commander: derives every route from the actual map, so it
// plays generated seeds, not just the handcrafted one. Same doctrine as
// `commander` (fight the guard, harvest the rich pile, road out to the lesser
// piles) but with map-derived geometry and spider-avoiding detours. Used by
// the cross-seed winnability sweep (tools/sweep_winnable.mjs).
// Spider-aware route planner. The ants' own homeDist field avoids rocks but
// not hunters — and a hunter roams its whole territory (tr) killing anything
// inside, so a road THROUGH a territory bleeds the colony (observed: 5358
// deaths vs 679 when routing around). So we run a fresh Dijkstra from the nest
// whose per-cell entry cost is inflated inside every live territory: the
// cheapest path bends around hunters when a detour exists, yet still finds a
// way through if a pile can only be reached across one. Recomputed each
// planning cycle because hunters (and waves) move. Returns a cost field.
const NBR8 = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];

function planField(world, spiders) {
  const { blocked, nest } = world;
  const N = GW * GH;
  const pen = new Float32Array(N);
  for (const sp of spiders) {
    if (!sp.alive) continue;
    const R = sp.tr + 72;                          // clear the whole roam disk with margin
    const x0 = Math.max(0, (sp.hx - R) / CELL | 0), x1 = Math.min(GW - 1, (sp.hx + R) / CELL | 0);
    const y0 = Math.max(0, (sp.hy - R) / CELL | 0), y1 = Math.min(GH - 1, (sp.hy + R) / CELL | 0);
    for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
      const dx = gx * CELL + CELL / 2 - sp.hx, dy = gy * CELL + CELL / 2 - sp.hy;
      if (dx * dx + dy * dy < R * R) pen[gy * GW + gx] += 50;  // >> base step
    }
  }
  const cost = new Float32Array(N).fill(1e9);
  const done = new Uint8Array(N);
  const heap = [];                                 // binary min-heap of [cost, idx]
  const push = (c, i) => {
    heap.push([c, i]); let k = heap.length - 1;
    while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } }
    return top;
  };
  const ni = ((nest.y / CELL) | 0) * GW + ((nest.x / CELL) | 0);
  cost[ni] = 0; push(0, ni);
  while (heap.length) {
    const [c, i] = pop();
    if (done[i]) continue; done[i] = 1;
    const gx = i % GW, gy = (i / GW) | 0;
    for (const [ox, oy, w] of NBR8) {
      const nx = gx + ox, ny = gy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const j = ny * GW + nx;
      if (blocked[j] || done[j]) continue;
      const nc = c + w + pen[j];
      if (nc < cost[j]) { cost[j] = nc; push(nc, j); }
    }
  }
  return cost;
}

// Trace the cheapest path from a pile back to the nest by descending the
// planned cost field, returning a coarse world-space polyline (pile-end first).
function traceField(cost, sx, sy) {
  let gx = Math.min(GW - 1, Math.max(0, sx / CELL | 0));
  let gy = Math.min(GH - 1, Math.max(0, sy / CELL | 0));
  const pts = [{ x: sx, y: sy }];
  for (let step = 0; step < 800; step++) {
    let best = cost[gy * GW + gx], bx = gx, by = gy;
    for (const [ox, oy] of NBR8) {
      const nx = gx + ox, ny = gy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const d = cost[ny * GW + nx];
      if (d < best) { best = d; bx = nx; by = ny; }
    }
    if (bx === gx && by === gy) break;             // local minimum: at the nest
    gx = bx; gy = by;
    if (step % 4 === 0) pts.push({ x: gx * CELL + CELL / 2, y: gy * CELL + CELL / 2 });
    if (best <= 0.1) break;
  }
  return pts;
}

// Paint a LURE road along the planned (spider-avoiding) path to a pile, then
// blob the pile head.
function routeTo(cost, field, nest, pile, blobR) {
  const path = traceField(cost, pile.x, pile.y);
  path.push({ x: nest.x, y: nest.y });
  for (let i = 0; i < path.length - 1; i++) {
    stampLine(field, path[i].x, path[i].y, path[i + 1].x, path[i + 1].y, 30, 0.88);
  }
  stamp(field, pile.x, pile.y, blobR, 1.0);
}

function general(sim) {
  const { fields, nest, piles, spiders } = sim.world;
  const rich = piles[0];
  // fight one battle at a time: nearest live hunter that presses the nest or
  // still guards the unexhausted rich pile
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
  // FEAR walls over every OTHER live hunter: foragers sense FEAR as repulsion
  // and — crucially — loaded ants returning home add FEAR*30 to their
  // home-distance (sim.js), so the walls bend the RETURN trip around hunters
  // too. Without this, ants stream OUT safely on the LURE road but die coming
  // back through territory (the dominant loss on generated seeds). The hunter
  // currently being converted is left clear so its WAR strike still lands.
  for (const sp of spiders) {
    if (sp.alive && sp !== threat) stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 40, 1.0);
  }
  // plan spider-aware roads once per cycle (hunters move, so replan each time)
  const cost = planField(sim.world, spiders);
  // harvest the rich pile once its guard is dead
  if (!spiders[0].alive && rich.amount > 0) routeTo(cost, fields[F.LURE], nest, rich, 70);
  // road out to the two lesser piles along the planned corridors
  for (const p of piles.slice(1)) if (p.amount > 0) routeTo(cost, fields[F.LURE], nest, p, 55);
}

export const STRATEGIES = { naive, smart, warband, idle, commander, general };

export function makeAutoPlayer(name, periodTicks = 240) {
  const fn = STRATEGIES[name];
  if (!fn) return null;
  return (sim) => {
    if (sim.tick % periodTicks === 1) fn(sim);
  };
}
