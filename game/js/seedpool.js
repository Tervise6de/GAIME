// Vetted "new territory" seed pool — the difficulty normalizer.
//
// Generated maps are structurally FAIR by construction (world.js guarantees)
// and were proven bot-WINNABLE across 24 seeds (PLAYTEST_LOG 2026-07-11). But
// difficulty is EMERGENT: no cheap geometry feature predicts the commander's
// win-time, so there is no reliable way to reject a too-hard map at generation
// time. The viable normalizer is the offline ORACLE — pre-screen seeds with the
// commander bot and ship only those it wins with a comfortable margin.
//
// This pool holds seeds where the commander wins in <=430 s (>=50 s under the
// 480 s limit) AND idle/naive still lose (the scenario stays discriminating).
// The thin-margin-but-fair seeds it excludes are recorded in HELD_OUT so a
// harder mode can use them later. Regenerate with tools/bot_sweep.mjs.
export const VETTED_SEEDS = [
  1000, 1097, 1194, 1291, 1388, 1582, 1679, 1776, 1873, 1970,
  2261, 2358, 2455, 2649, 2746, 2843, 2940, 3037, 3134, 3231,
];

// Oracle-winnable but the commander needed >=445 s (a slightly-imperfect human
// would risk the clock). Fair, not shipped in the default pool.
export const HELD_OUT = [1485, 2067, 2164, 2552];

// Pick a fresh territory from the pool, avoiding an immediate repeat. `rnd` is
// the [0,1) source (defaults to Math.random — this is UI, never the sim RNG).
export function pickSeed(exclude, rnd = Math.random) {
  const pool = VETTED_SEEDS.filter((s) => s !== exclude);
  const list = pool.length ? pool : VETTED_SEEDS;
  return list[(rnd() * list.length) | 0];
}
