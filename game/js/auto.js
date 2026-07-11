// Scripted painting strategies — the falsification harness.
// Pre-registered hypothesis (PLAYTEST_LOG 2026-07-10): if SMART cannot beat
// NAIVE by >=1.25x food with <=0.6x deaths on the same seed, the painting
// verb is hollow (pointing would be as good as routing).
import { F, stamp, erase, GW, GH, CELL } from './world.js';
import { ST, antsAlive } from './sim.js';
import { SCENARIO } from './scenario.js';

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
function countSoldiers(sim) {
  let n = 0;
  for (let i = 0; i < sim.count; i++) if (sim.alive[i] && sim.astate[i] === ST.SOLDIER) n++;
  return n;
}

// Guard assault doctrine: a trickle of soldiers loses to a hunter (its kill
// radius exceeds their attack radius), so the guard must be hit by one MASS.
// Static painted gradients cannot transport that mass — every stamp's center
// is a local WAR maximum, so soldiers park on the stamps like beads on a
// string (observed on seed 1485). Instead a single SHEPHERD blob is erased
// and re-stamped one step further along the safe route each repaint, and the
// pack follows its one moving peak: muster at the nest doorstep where
// recruit density is highest, march the blob to the guard, strike. Nest
// defence always pre-empts the assault — over-committing is what killed the
// previous guard-priority attempt (DECISION_LOG 2026-07-11).
const MUSTER_POP = 450;        // colony size that can afford an army
const MUSTER_FORCE_T = 120;    // ...or just strike late rather than never
const STRIKE_AT = 60;          // brigade size that folds a 260hp hunter fast
const MUSTER_PATIENCE = 12;    // repaints before marching with what we have
const STRIKE_FLOOR = 25;       // never march with less than this
const WAVE_BROKE = 10;         // survivors below this: fall back and re-muster
const MARCH_STEP = 45;         // px the shepherd blob advances per repaint

function gcommander(sim) {
  const { fields, nest, piles, spiders } = sim.world;
  const st = sim._gc || (sim._gc = { phase: 'grow', musterPaints: 0, log: [] });
  const mark = (phase, extra) => {
    if (st.phase === phase) return;
    st.phase = phase;
    st.log.push(`${sim.time.toFixed(0)}s ${phase}${extra ? ' ' + extra : ''}`);
  };
  const rich = piles[0];
  const guard = spiders[0];
  const assaulting = guard && guard.alive && rich.amount > 0;

  // objective gone (guard dead / pile drained): erase the war paint so the
  // brigade demotes back to foraging instead of milling for ~40s of decay
  if (st.phase !== 'grow' && !assaulting) {
    erase(fields, guard.hx, guard.hy, guard.tr + 220);
    // wipe the shepherd blob too, or it keeps drafting the economy for ~40s
    if (st.paintPos) erase(fields, st.paintPos[0], st.paintPos[1], 120);
    st.paintPos = null; st.marchD = 0;
    mark('grow', guard.alive ? 'pile-drained' : 'guard-dead'); st.musterPaints = 0;
  }

  // brood throttle: once the workforce saturates the piles' extraction rates,
  // growth is pure waste — hold the brood and bank the difference (measured:
  // seed 1097 drained every pile yet lost 1174/1200 to 2460 deaths' respawn
  // costs). Blocked spawns also stop death-replacement, so keep a deep
  // manpower buffer and let the FEAR decay re-open brood on its own if the
  // colony thins out.
  const pop = antsAlive(sim);
  if (pop > 1400 && sim.foodStock > 500 && sim.foodStock < SCENARIO.quota) {
    stamp(fields[F.FEAR], nest.x, nest.y, 44, 1.0);
    if (!st.banked) { st.banked = true; st.log.push(`${sim.time.toFixed(0)}s brood-held pop=${pop}`); }
  }

  // a hunter denned near the nest is always the first fight
  const press = spiders
    .filter((sp) => sp.alive && Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340)
    .sort((p, q) => Math.hypot(p.x - nest.x, p.y - nest.y) - Math.hypot(q.x - nest.x, q.y - nest.y))[0];
  if (press) {
    const ang = Math.atan2(press.y - nest.y, press.x - nest.x);
    const ax = press.x - Math.cos(ang) * 150, ay = press.y - Math.sin(ang) * 150;
    stampLine(fields[F.LURE], nest.x, nest.y, ax, ay, 26, 0.8);
    stampLine(fields[F.WAR], ax, ay, press.x, press.y, 44, 1.0);
    stamp(fields[F.WAR], press.x, press.y, 90, 1.0);
  }

  // wall deep roamers; never the pressed target, never the assault target
  // (FEAR outweighs WAR for foragers, so fearing the guard blocks recruitment)
  for (const sp of spiders) {
    if (!sp.alive || sp === press || (assaulting && sp === guard)) continue;
    if (Math.hypot(sp.hx - nest.x, sp.hy - nest.y) < 340) continue;
    stamp(fields[F.FEAR], sp.hx, sp.hy, sp.tr + 20, 1.0);
  }

  const prev = costField(sim.world);
  for (const p of piles) {
    if (p.amount <= 0) continue;
    if (p === rich && guard && guard.alive) continue;
    roadRoute(fields, prev, p, nest);
  }

  if (!assaulting || press) return; // press fight owns the WAR field for now

  // safe route to the den (fall back to the pile itself if the den cell is
  // unroutable — pile reachability is generator-guaranteed)
  const wp = routeTo(prev, guard.hx, guard.hy) || routeTo(prev, rich.x, rich.y);
  if (!wp) return;
  // arclength parameterization for the shepherd blob
  const cum = [0];
  for (let i = 1; i < wp.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(wp[i][0] - wp[i - 1][0], wp[i][1] - wp[i - 1][1]));
  }
  const totalLen = cum[cum.length - 1];
  const posAt = (d) => {
    d = Math.max(0, Math.min(totalLen, d));
    let i = 1;
    while (i < cum.length - 1 && cum[i] < d) i++;
    const t = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    return [wp[i - 1][0] + (wp[i][0] - wp[i - 1][0]) * t,
      wp[i - 1][1] + (wp[i][1] - wp[i - 1][1]) * t];
  };

  const soldiers = countSoldiers(sim);
  // one moving peak: erase where the blob was, stamp where it goes
  const moveBlob = (to, r) => {
    if (st.paintPos) erase(fields, st.paintPos[0], st.paintPos[1], r + 30);
    stamp(fields[F.WAR], to[0], to[1], r, 1.0);
    st.paintPos = to;
  };

  if (st.phase === 'grow' || st.phase === 'muster') {
    if (antsAlive(sim) < MUSTER_POP && sim.time < MUSTER_FORCE_T) return; // grow first
    mark('muster', `pop=${antsAlive(sim)}`); st.musterPaints++;
    // muster off the doorstep by default; if the route's near leg is a
    // traffic dead spot and recruiting stalls (measured: 34 soldiers in 436s
    // on seed 2455's left-edge route), escalate onto the nest mouth itself —
    // the returner stream is guaranteed traffic.
    const stalled = st.musterPaints > 15;
    st.marchD = stalled ? 30 : 140;
    moveBlob(posAt(st.marchD), stalled ? 70 : 64);
    if (soldiers >= STRIKE_AT ||
        (st.musterPaints >= MUSTER_PATIENCE && soldiers >= STRIKE_FLOOR)) {
      mark('march', `soldiers=${soldiers}`);
    }
  } else if (st.phase === 'march') {
    st.marchD += MARCH_STEP;
    const at = posAt(st.marchD);
    if (Math.hypot(at[0] - guard.x, at[1] - guard.y) < 130 || st.marchD >= totalLen) {
      mark('strike', `soldiers=${soldiers}`);
    } else {
      moveBlob(at, 78);
    }
    if (soldiers < WAVE_BROKE) { mark('muster', 'wave-broke'); st.musterPaints = 0; }
  }
  if (st.phase === 'strike') {
    // close on the hunter itself, but never leap further than the pack can
    // follow — a teleporting peak strands the brigade behind an erased blob
    let to = [guard.x, guard.y];
    if (st.paintPos) {
      const dx = guard.x - st.paintPos[0], dy = guard.y - st.paintPos[1];
      const d = Math.hypot(dx, dy);
      if (d > MARCH_STEP * 1.6) {
        const k = (MARCH_STEP * 1.6) / d;
        to = [st.paintPos[0] + dx * k, st.paintPos[1] + dy * k];
      }
    }
    moveBlob(to, 85);
    if (soldiers < WAVE_BROKE) { mark('muster', 'wave-broke'); st.musterPaints = 0; }
  }
}

export const STRATEGIES = { naive, smart, warband, idle, commander, gcommander };

// gcommander repaints at half period: the shepherd blob must step often
// enough to move ~22px/s. Other strategies keep the original cadence.
export function makeAutoPlayer(name, periodTicks = name === 'gcommander' ? 120 : 240) {
  const fn = STRATEGIES[name];
  if (!fn) return null;
  return (sim) => {
    if (sim.tick % periodTicks === 1) fn(sim);
  };
}
