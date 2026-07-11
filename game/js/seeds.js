// Certified territory pool for "New Territory" (the N key).
//
// WHY THIS EXISTS (VERIFIED FACT, 2026-07-11): a map that passes the
// generator's FAIRNESS guarantees (every pile reachable, lesser piles outside
// hunter ground, nest not buried) is NOT necessarily WINNABLE. Across seeds
// 1-100 the competence oracle (auto=commander) won 95/100 (95%); the ~5% tail
// (seeds 3, 36, 55, 60, 88) is fair but unwinnable, and its difficulty is
// EMERGENT — no cheap structural proxy tested (guard distance, pile distance,
// mid-hunter corridor sealing) separated the unwinnable maps from winnable
// ones. So winnability can only be certified by SIMULATION, and the
// human-facing pool must be sim-vetted, not generated blind.
//
// This list is every seed the commander oracle actually WON in
// tools/win_sweep.mjs on the current build. Regenerate after ANY change to
// world generation or the commander bot:
//   node tools/win_sweep.mjs --seeds 1-100 --auto commander --fast 40
// and copy the CERTIFIED line here. Seed 7 is the hand-tuned reference map.
export const CERTIFIED_SEEDS = [
  1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39,
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 56, 57, 58,
  59, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77,
  78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 89, 90, 91, 92, 93, 94, 95, 96,
  97, 98, 99, 100,
];

// CORE band: the certified seeds whose oracle win-time falls in 210-360s —
// a consistent-difficulty rotation for the first-hour experience (the full
// certified set also holds sub-210s "gentle" maps and a few ~370s "stiff"
// ones). Post-tuning difficulty is already tight (win-times 139-375s, median
// 256), so this is a light selection, not a per-map quota rewrite. Difficulty
// tiers set up a future easy->hard campaign order. Regenerate with the sweep.
export const CORE_SEEDS = [
  1, 4, 5, 7, 8, 9, 11, 12, 14, 15, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27,
  31, 32, 33, 34, 37, 40, 41, 45, 46, 47, 48, 49, 52, 53, 54, 56, 57, 58,
  62, 63, 64, 65, 66, 67, 68, 70, 71, 72, 78, 79, 80, 82, 84, 85, 86, 89,
  90, 92, 93, 94, 95, 96, 97, 98, 99, 100,
];

// Pick a core seed other than the one just played, so New Territory always
// changes the map at a consistent difficulty. Deterministic given `rnd` (0..1)
// for testability. Falls back to the full certified set if needed.
export function nextCertifiedSeed(current, rnd) {
  const src = CORE_SEEDS.length > 1 ? CORE_SEEDS : CERTIFIED_SEEDS;
  const pool = src.filter((s) => s !== current);
  if (pool.length === 0) return current;
  return pool[Math.min(pool.length - 1, Math.floor(rnd * pool.length))];
}
