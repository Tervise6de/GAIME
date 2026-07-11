// Certified territory pool for "New Territory" (the N key).
//
// WHY THIS EXISTS (VERIFIED FACT, 2026-07-11): a map that passes the
// generator's FAIRNESS guarantees (every pile reachable, lesser piles outside
// hunter ground, nest not buried) is NOT necessarily WINNABLE. Across seeds
// 1-60 the competence oracle (auto=commander) won 56/60 (~93%); the ~7% tail
// (seeds 3, 36, 55, 60) is fair but unwinnable, and its difficulty is
// EMERGENT — no cheap structural proxy tested (guard distance, pile distance,
// mid-hunter corridor sealing) separated the unwinnable maps from winnable
// ones. So winnability can only be certified by SIMULATION, and the
// human-facing pool must be sim-vetted, not generated blind.
//
// This list is every seed the commander oracle actually WON in
// tools/win_sweep.mjs on the current build. Regenerate after ANY change to
// world generation or the commander bot:
//   node tools/win_sweep.mjs --seeds 1-60 --auto commander --fast 40
// and copy the CERTIFIED line here. Seed 7 is the hand-tuned reference map.
export const CERTIFIED_SEEDS = [
  1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
  49, 50, 51, 52, 53, 54, 56, 57, 58, 59,
];

// Pick a certified seed other than the one just played, so New Territory always
// changes the map. Deterministic given `rnd` (0..1) for testability.
export function nextCertifiedSeed(current, rnd) {
  const pool = CERTIFIED_SEEDS.filter((s) => s !== current);
  if (pool.length === 0) return current;
  return pool[Math.min(pool.length - 1, Math.floor(rnd * pool.length))];
}
