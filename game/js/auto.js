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

// Escalating assault on a DISTANT guard. gcommander's Dijkstra roads route
// AROUND hunters, so the two easy piles get harvested cleanly but the guarded
// rich pile is never engaged — the dominant loss mode (rich:0%, slain:0,
// died~15: too timid, not too aggressive). The naive fix (always prioritise
// the guard) over-committed and marched the colony through danger → death
// explosions. This is the disciplined middle: fire ONLY once the easy piles
// are nearly spent, then commit a STRONG march along the hunter-avoiding road
// to a staging point, and hold a persistent WAR well on the guard so the
// arriving column converts to soldiers and masses on it. Because it waits for
// the easy harvest to finish, it never splits the early game (preserving the
// baseline wins) and never marches for nothing (the colony is large and safe).
function guardAssault(fields, prev, guard, rich, nest) {
  // Route to the RICH PILE, not the guard den: the pile is guaranteed
  // reachable by the fairness check, whereas a den can sit on a blocked cell
  // (seed 2164) so routeTo to it returns no path and the march goes blind. The
  // guard sits ~70px from its pile, so a staging point ~120px out from the
  // guard along the pile road drops the converted column on it either way.
  const wp = routeTo(prev, rich.x, rich.y);
  let stage = null;
  if (wp) {
    for (let i = wp.length - 1; i >= 0; i--) {
      if (Math.hypot(wp[i][0] - guard.hx, wp[i][1] - guard.hy) >= 120) { stage = wp[i]; break; }
    }
    // strong safe march along the road, stopping short of the den
    for (let i = 0; i < wp.length - 1; i++) {
      if (Math.hypot(wp[i][0] - guard.hx, wp[i][1] - guard.hy) < 120) break;
      stampLine(fields[F.LURE], wp[i][0], wp[i][1], wp[i + 1][0], wp[i + 1][1], 34, 0.98);
    }
  }
  if (!stage) {
    const ang = Math.atan2(guard.hy - nest.y, guard.hx - nest.x);
    stage = [guard.hx - Math.cos(ang) * 130, guard.hy - Math.sin(ang) * 130];
    stampLine(fields[F.LURE], nest.x, nest.y, stage[0], stage[1], 34, 0.98);
  }
  // conversion corridor + persistent war well the soldiers ascend onto
  stampLine(fields[F.WAR], stage[0], stage[1], guard.hx, guard.hy, 48, 1.0);
  stamp(fields[F.WAR], guard.hx, guard.hy, 110, 1.0);
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
  // decide the assault BEFORE walling: a guard we are storming must NOT also be
  // FEAR-walled, or the wall repels the very column the WAR well is summoning
  // and the ants die milling at the FEAR/WAR seam (seed 4395: died 2078).
  const lesserLeft = piles.slice(1).reduce((a, p) => a + Math.max(0, p.amount), 0);
  const assaulting = guard && guard.alive && rich.amount > 0 && lesserLeft < 1150;
  // wall deep roamers (routed around anyway); leave near-nest approaches open
  for (const sp of spiders) {
    if (!sp.alive || sp === threat) continue;
    if (sp === guard && assaulting) continue;
    if (Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340) continue;
    stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 20, 1.0);
  }
  const prev = costField(sim.world);
  for (const p of piles) {
    if (p.amount <= 0) continue;
    if (p === rich && guard && guard.alive) continue;
    roadRoute(fields, prev, p, nest);
  }
  // once the easy piles are nearly exhausted, commit force to the guard so the
  // rich pile is not left on the map (the dominant loss mode). Gated late so
  // the early harvest — which the baseline wins depend on — is never split.
  if (assaulting) guardAssault(fields, prev, guard, rich, nest);
}

export const STRATEGIES = { naive, smart, warband, idle, commander, gcommander };

export function makeAutoPlayer(name, periodTicks = 240) {
  const fn = STRATEGIES[name];
  if (!fn) return null;
  return (sim) => {
    if (sim.tick % periodTicks === 1) fn(sim);
  };
}
