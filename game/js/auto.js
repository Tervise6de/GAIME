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

// --- generalized routing (map-driven commander) ---------------------------
// A hunter-avoiding cost field grown from the nest by Dijkstra: passable
// cells cost their step length plus a penalty inside live hunter territory,
// so extracted routes detour around dens when a detour exists and cut
// through only when there is no alternative. This replaces the seed-7
// hardcoded lanes so the bot can play ANY generated territory.
const NB = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];

function costField(world) {
  const { blocked, nest, spiders } = world;
  const N = GW * GH;
  const penalty = new Float32Array(N);
  for (const sp of spiders) {
    if (!sp.alive) continue;
    const pr = sp.tr + 20;
    const gx0 = Math.max(0, ((sp.hx - pr) / CELL) | 0), gx1 = Math.min(GW - 1, ((sp.hx + pr) / CELL) | 0);
    const gy0 = Math.max(0, ((sp.hy - pr) / CELL) | 0), gy1 = Math.min(GH - 1, ((sp.hy + pr) / CELL) | 0);
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const dx = gx * CELL + CELL / 2 - sp.hx, dy = gy * CELL + CELL / 2 - sp.hy;
      if (dx * dx + dy * dy < pr * pr) penalty[gy * GW + gx] += 6;
    }
  }
  const dist = new Float32Array(N).fill(Infinity);
  const prev = new Int32Array(N).fill(-1);
  // binary min-heap of cell indices keyed by dist
  const heap = new Int32Array(N + 1); const hk = new Float32Array(N + 1); let hs = 0;
  const push = (idx, k) => {
    let i = ++hs; heap[i] = idx; hk[i] = k;
    while (i > 1 && hk[i >> 1] > hk[i]) { const pi = i >> 1;
      const ti = heap[i]; heap[i] = heap[pi]; heap[pi] = ti;
      const tk = hk[i]; hk[i] = hk[pi]; hk[pi] = tk; i = pi; }
  };
  const pop = () => {
    const top = heap[1], topk = hk[1]; heap[1] = heap[hs]; hk[1] = hk[hs]; hs--;
    let i = 1; for (;;) { const l = i << 1, r = l + 1; let m = i;
      if (l <= hs && hk[l] < hk[m]) m = l; if (r <= hs && hk[r] < hk[m]) m = r;
      if (m === i) break; const ti = heap[i]; heap[i] = heap[m]; heap[m] = ti;
      const tk = hk[i]; hk[i] = hk[m]; hk[m] = tk; i = m; }
    return [top, topk];
  };
  const s0 = (((nest.y / CELL) | 0) * GW) + ((nest.x / CELL) | 0);
  dist[s0] = 0; push(s0, 0);
  while (hs > 0) {
    const [cur, cd] = pop();
    if (cd > dist[cur]) continue;
    const cx = cur % GW, cy = (cur / GW) | 0;
    for (const [ox, oy, base] of NB) {
      const nx = cx + ox, ny = cy + oy;
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue;
      const idx = ny * GW + nx;
      if (blocked[idx]) continue;
      const nd = cd + base + penalty[idx];
      if (nd < dist[idx]) { dist[idx] = nd; prev[idx] = cur; push(idx, nd); }
    }
  }
  return prev;
}

// reconstruct a route from nest to (x,y), downsampled to waypoints
function routeTo(prev, x, y) {
  let idx = (((y / CELL) | 0) * GW) + ((x / CELL) | 0);
  const pts = [];
  for (let g = 0; idx >= 0 && g < 6000; g++) {
    pts.push([(idx % GW) * CELL + CELL / 2, ((idx / GW) | 0) * CELL + CELL / 2]);
    idx = prev[idx];
  }
  pts.reverse();
  if (pts.length < 2) return null;
  const wp = [pts[0]];
  for (let i = 5; i < pts.length; i += 5) wp.push(pts[i]);
  wp.push(pts[pts.length - 1]);
  return wp;
}

function roadRoute(fields, prev, target, nest) {
  const wp = routeTo(prev, target.x, target.y);
  if (!wp) { stampLine(fields[F.LURE], nest.x, nest.y, target.x, target.y, 32, 0.92); return; }
  for (let i = 0; i < wp.length - 1; i++) {
    stampLine(fields[F.LURE], wp[i][0], wp[i][1], wp[i + 1][0], wp[i + 1][1], 32, 0.92);
  }
  stamp(fields[F.LURE], target.x, target.y, 70, 1.0);
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

// commander: the full-competence bot, hand-tuned for the seed-7 "First
// Season" map. Clears the guard, harvests the rich pile, roads out to the far
// piles along known-safe lanes, and rallies against hunters pressing the nest.
// This is the balance BASELINE — it wins seed 7 at t≈175 and is the reference
// for all scripted-doctrine evidence. Do not generalize it in place.
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

// gcommander: the GENERALIZED commander — no hardcoded coordinates. Derives
// hunter-avoiding roads from the live map (Dijkstra cost field), walls deep
// roamers with FEAR, converts the nearest pressing hunter, and roads every
// pile that still holds food. This is the bot that can attempt ANY generated
// territory. It is a competent GENERIC heuristic, not an optimizer: on seed 7
// it reaches ~1060/1200 (the emergent "source-commitment" problem — the
// colony over-commits to the two nearest piles and under-serves the distant
// one), where hand-tuned play wins outright. Use it as a difficulty/coverage
// PROXY across seeds, never as proof of human winnability.
function gcommander(sim) {
  const { fields, nest, piles, spiders } = sim.world;
  const rich = piles[0];
  const guard = spiders[0];
  const targets = spiders.filter((sp) => sp.alive &&
    (Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340 || (sp === guard && rich.amount > 0)));
  targets.sort((p, q) => Math.hypot(p.x - nest.x, p.y - nest.y) - Math.hypot(q.x - nest.x, q.y - nest.y));
  const threat = targets[0];
  if (threat) {
    const ang = Math.atan2(threat.y - nest.y, threat.x - nest.x);
    const ax = threat.x - Math.cos(ang) * 150, ay = threat.y - Math.sin(ang) * 150;
    stampLine(fields[F.LURE], nest.x, nest.y, ax, ay, 26, 0.8);
    stampLine(fields[F.WAR], ax, ay, threat.x, threat.y, 44, 1.0);
    stamp(fields[F.WAR], threat.x, threat.y, 90, 1.0);
  }
  // wall deep roamers (routed around anyway); leave near-nest approaches open
  for (const sp of spiders) {
    if (!sp.alive || sp === threat) continue;
    if (Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340) continue;
    stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 20, 1.0);
  }
  const prev = costField(sim.world);
  for (const p of piles) {
    if (p.amount <= 0) continue;
    if (p === rich && guard && guard.alive) continue;
    roadRoute(fields, prev, p, nest);
  }
}

// gcmdr2: gcommander + disciplined guard-clearing. gcommander's dominant loss
// mode is the guarded rich pile (900 food) never opening: reinforcement waves
// keep a NEARER hunter on the nest, so the distant guard is never the painted
// threat and the richest source stays sealed (5 of 7 losses in the 2026-07-11
// sweep were exactly this: rich 0%, guard un-slain). gcmdr2 keeps nest defence
// FIRST, but whenever nothing presses the nest it commits a war line to the
// guard to crack that pile. The "nothing presses the nest" gate is precisely
// what the earlier, REJECTED guard-priority variant lacked — that one always
// prioritised the guard, stripped the nest of soldiers and died in death
// explosions (DECISION_LOG 2026-07-11). Here the guard war is only ever painted
// when soldiers are free, and it stops being repainted (and decays, freeing its
// soldiers back to the nest) the instant a wave re-enters the 340px ring.
function gcmdr2(sim) {
  const { fields, nest, piles, spiders } = sim.world;
  const rich = piles[0];
  const guard = spiders[0];
  const strike = (sp) => {
    const ang = Math.atan2(sp.y - nest.y, sp.x - nest.x);
    const ax = sp.x - Math.cos(ang) * 150, ay = sp.y - Math.sin(ang) * 150;
    stampLine(fields[F.LURE], nest.x, nest.y, ax, ay, 26, 0.8);   // march route
    stampLine(fields[F.WAR], ax, ay, sp.x, sp.y, 44, 1.0);        // conversion zone
    stamp(fields[F.WAR], sp.x, sp.y, 90, 1.0);
  };
  // 1) nest defence first: nearest hunter whose DEN presses the nest approaches
  const pressing = spiders.filter((sp) => sp.alive && Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340);
  pressing.sort((p, q) => Math.hypot(p.x - nest.x, p.y - nest.y) - Math.hypot(q.x - nest.x, q.y - nest.y));
  const nestThreat = pressing[0];
  if (nestThreat) strike(nestThreat);
  // 2) crack the rich pile on a CONCURRENT second front — paint the guard war
  // every cycle while it lives, IN ADDITION to nest defence (not instead of
  // it). gcommander only ever fought the single nearest target, so the far
  // guard — never the nearest while waves press the nest — stayed alive and the
  // 900-food pile stayed sealed. Because the nest war above is painted first
  // and the soldier caste is a fixed slice, defence is retained; the extra
  // front just commits the surplus soldiers the old bot left idle. (The earlier
  // REJECTED variant made the guard the SOLE priority and dropped nest defence
  // entirely — that is the death-explosion trap this avoids.)
  const attackingGuard = guard && guard.alive && rich.amount > 0 && guard !== nestThreat;
  if (attackingGuard) strike(guard);
  // 3) FEAR-wall the deep roamers we are NOT currently fighting
  for (const sp of spiders) {
    if (!sp.alive || sp === nestThreat || (attackingGuard && sp === guard)) continue;
    if (Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340) continue;
    stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 20, 1.0);
  }
  // 4) roads to every pile still holding food (rich only once its guard is dead)
  const prev = costField(sim.world);
  for (const p of piles) {
    if (p.amount <= 0) continue;
    if (p === rich && guard && guard.alive) continue;
    roadRoute(fields, prev, p, nest);
  }
}

export const STRATEGIES = { naive, smart, warband, idle, commander, gcommander, gcmdr2 };

export function makeAutoPlayer(name, periodTicks = 240) {
  const fn = STRATEGIES[name];
  if (!fn) return null;
  return (sim) => {
    if (sim.tick % periodTicks === 1) fn(sim);
  };
}
