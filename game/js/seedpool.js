// Vetted "new territory" seed pool — the difficulty normalizer.
//
// Generated maps are structurally FAIR by construction (world.js guarantees),
// but NOT all are beatable by the commander oracle: across 84 swept seeds it
// wins ~84% (71/84); the rest expose bot weaknesses (mostly guard-assault
// fizzle) or genuinely harder maps (PLAYTEST_LOG 2026-07-11). And difficulty is
// EMERGENT — no cheap geometry feature predicts win-time — so a too-hard map
// cannot be rejected at generation time. The viable normalizer is therefore the
// offline ORACLE: pre-screen seeds with the commander bot and ship ONLY those
// it wins with a comfortable margin. A raw random seed would ~1-in-6 hand the
// player a map the oracle itself cannot beat — this pool never does.
//
// Membership: commander win-time <= 430 s (>= 50 s under the 480 s limit) AND
// idle/naive still lose (the scenario stays discriminating; verified on a
// sample). Regenerate/extend with tools/bot_sweep.mjs (seeds 1000..9051,
// step 97, were the screening set).
export const VETTED_SEEDS = [
  1000, 1097, 1194, 1291, 1388, 1582, 1679, 1776, 1873, 1970,
  2261, 2358, 2455, 2649, 2746, 2843, 2940, 3037, 3134, 3231,
  3328, 3619, 3813, 3910, 4298, 4395, 4589, 4686, 4783, 4977,
  5171, 5268, 5365, 5462, 5656, 5753, 5850, 5947, 6044,
  6238, 6335, 6529, 6626, 6723, 6917, 7014, 7111, 7208, 7305,
  7402, 7499, 7693, 7790, 7887, 7984, 8275, 8372, 8469, 8566,
  8663, 8954, 9051,
];

// Oracle-winnable but the commander needed >=434 s (a slightly-imperfect human
// would risk the clock). Fair, held out of the default pool for a harder mode.
export const HELD_OUT = [1485, 2067, 2164, 2552, 3716, 4492, 6432, 6820, 7596];

// Screened seeds the commander could NOT win (guard-assault fizzle or genuinely
// too hard) — recorded so they are never served and so a stronger bot can be
// re-tested against them: 3425, 3522, 4007, 4104, 4201, 4880, 5074, 5559, 6141,
// 8081, 8178, 8760, 8857.

// Pick a fresh territory from the pool, avoiding an immediate repeat. `rnd` is
// the [0,1) source (defaults to Math.random — this is UI, never the sim RNG).
export function pickSeed(exclude, rnd = Math.random) {
  const pool = VETTED_SEEDS.filter((s) => s !== exclude);
  const list = pool.length ? pool : VETTED_SEEDS;
  return list[(rnd() * list.length) | 0];
}
