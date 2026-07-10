// Scripted painting strategies — the falsification harness.
// Pre-registered hypothesis (PLAYTEST_LOG 2026-07-10): if SMART cannot beat
// NAIVE by >=1.25x food with <=0.6x deaths on the same seed, the painting
// verb is hollow (pointing would be as good as routing).
import { F, stamp } from './world.js';

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

export const STRATEGIES = { naive, smart, warband, idle, commander };

export function makeAutoPlayer(name, periodTicks = 240) {
  const fn = STRATEGIES[name];
  if (!fn) return null;
  return (sim) => {
    if (sim.tick % periodTicks === 1) fn(sim);
  };
}
