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
const BOTTOM = [[170, 360], [230, 560], [300, 650], [520, 668], [800, 668], [1000, 640], [1090, 560]];
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

export const STRATEGIES = { naive, smart, warband };

export function makeAutoPlayer(name, periodTicks = 240) {
  const fn = STRATEGIES[name];
  if (!fn) return null;
  return (sim) => {
    if (sim.tick % periodTicks === 1) fn(sim);
  };
}
