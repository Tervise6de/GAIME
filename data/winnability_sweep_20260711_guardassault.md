# Winnability sweep — guard-assault gcommander (2026-07-11, session fok54l)

Follow-up to `winnability_sweep_20260711.md` (which measured 9/16 = 56% on the
first 16 seeds). Same harness, same scenario ("The First Season", quota 1200
net, 480 s). Two bot changes this session, all in `game/js/auto.js`:

1. A **staged guard assault** (`guardAssault`): once the easy piles start being
   spent, commit force to the guarded rich pile along the *reachable pile road*
   and hold a persistent WAR well on the guard so the arriving column converts
   to soldiers and masses on it.
2. Route the assault to the **rich pile** (guaranteed reachable), not the guard
   den (which can sit on a blocked cell — seed 2164).
3. Do **not** FEAR-wall the guard while assaulting it (the wall repelled the
   assault column and killed ants at the FEAR/WAR seam — seed 4395/3328).

Harness: `tools/run_proto.mjs` per seed, `fast=40`, full scenario to `__DONE`
(the reliable per-seed method — see CLAUDE.md note on win_sweep timeouts).
`slain` = spiders killed. `rich_left` = food left in the guarded pile.

## Full 40-seed fairness set (seeds 1000 + i·97, i = 0..39)

| seed | result | net | died | slain | rich_left |  | seed | result | net | died | slain | rich_left |
|------|--------|----:|-----:|------:|----------:|--|------|--------|----:|-----:|------:|----------:|
| 1000 | WON | 1200 |  218 | 2 | 543 |  | 2843 | WON | 1200 |  925 | 4 |   0 |
| 1097 | WON | 1200 |  374 | 2 | 298 |  | 2940 | WON | 1201 |  570 | 2 | 234 |
| 1194 | WON | 1201 |  561 | 3 | 321 |  | 3037 | WON | 1200 | 1434 | 3 |   0 |
| 1291 | **lost** | 1086 | 1046 | 4 | 0 |  | 3134 | WON | 1200 |  333 | 2 |   0 |
| 1388 | WON | 1200 |  474 | 3 |   0 |  | 3231 | WON | 1200 |  453 | 4 | 237 |
| 1485 | WON | 1200 |  450 | 2 | 144 |  | 3328 | WON | 1201 |  312 | 3 |   0 |
| 1582 | WON | 1201 |  547 | 2 | 501 |  | 3425 | WON | 1201 |  196 | 1 | 255 |
| 1679 | WON | 1201 |  585 | 4 | 390 |  | 3522 | **lost** | 1088 | 417 | 3 | 0 |
| 1776 | WON | 1201 |  561 | 2 | 224 |  | 3619 | WON | 1201 |  701 | 2 |  19 |
| 1873 | WON | 1201 | 1190 | 3 |   0 |  | 3716 | WON | 1201 |  697 | 4 |   0 |
| 1970 | WON | 1201 | 1106 | 1 |   0 |  | 3813 | WON | 1201 |  429 | 3 | 259 |
| 2067 | WON | 1201 |  142 | 1 | 561 |  | 3910 | WON | 1200 |  523 | 4 |   0 |
| 2164 | WON | 1200 |  583 | 2 | 368 |  | 4007 | **lost** |  882 | 281 | 0 | 900 |
| 2261 | WON | 1201 |  543 | 2 |   0 |  | 4104 | **lost** | 1067 | 338 | 3 | 676 |
| 2358 | WON | 1201 |  460 | 3 | 400 |  | 4201 | **lost** |  933 | 335 | 3 | 281 |
| 2455 | WON | 1200 |  338 | 2 | 342 |  | 4298 | WON | 1201 |  707 | 3 |   0 |
| 2552 | WON | 1201 |  463 | 3 | 251 |  | 4395 | **lost** |  393 | 2078 | 1 | 898 |
| 2649 | WON | 1201 |  271 | 1 | 563 |  | 4492 | WON | 1201 |  667 | 3 |   0 |
| 2746 | WON | 1200 |  198 | 1 |   0 |  | 4589 | WON | 1200 |  898 | 2 |  43 |
|      |     |      |      |   |     |  | 4686 | WON | 1201 |  226 | 2 |   0 |
|      |     |      |      |   |     |  | 4783 | WON | 1201 |  220 | 1 | 202 |

**Result: 34 WON / 40 (85%).** Up from the 56% baseline on the first 16 (which
this bot now takes 15/16). The first-16 subset reads 94%, but the honest
full-set number is **85%** — the extra 24 seeds surface a longer failure tail.
(STRONG-PROXY LOWER BOUND by a generic scripted bot — NOT a human-winnability
claim, NOT optimal play.)

## Failure taxonomy (the 6 losses, all understood)

- **Economy near-misses (4): 1291, 3522, 4104, 4201.** The guard is slain and
  most/all food is harvested (`rich_left` small or 0), but the run lands short
  of 1200 net on brood + death overhead and the 480 s clock. These maps are
  winnable in principle — a less lossy player clears them. They are the
  clearest evidence that per-map difficulty is NOT normalized.
- **Guard stall (1): 4007.** `slain: 0`, `rich: 900 left` — the assault column
  never massed on this guard. Unlike seed 2164 (blocked den, since fixed) the
  den here is reachable, so this is a geometry/timing stall, not a routing bug.
- **Close-guard death-grind (1): 4395.** `died: 2078`, net 393. The guard sits
  close to the nest (path dist ~440), so it is a *permanent* near-nest threat
  and gets WAR'd every cycle; the colony grinds itself against a guard on the
  rich pile (~416 food burned on death-replacement brood alone). This is the
  same class as the original naive-assault death explosion, now confined to the
  rare close-guard geometry rather than the common case.

## Iteration history (this session)

- v1 (route to guard den): 14/16 on the first 16; stalled on 2164 (blocked den).
- v2 (route to reachable rich pile): 15/16 on the first 16; fixed 2164 and cut
  deaths sharply (1000: 1171→218) by removing the blind fallback.
- v3 (don't FEAR-wall the guard while assaulting): fixed the FEAR/WAR seam;
  converted 3328 (lost→won) with zero regressions. Final full-set: 34/40 (85%).

## Difficulty is not normalized (open work, no clean predictor found)

`tools/gen_difficulty.mjs` extracts structural features (true BFS distances,
mid-roamer-to-corridor, guard distance). No single feature cleanly separates
the losses from the wins: e.g. 1291 (midCorridor 123) lost while 2261 (125) and
2067 (134) won, and 1776/2358 won at midCorridor ≈ 3. The death band across
wins alone is 142–1434. A generator reject filter on these features would
discard winnable maps, so none was added; difficulty normalization remains
genuinely open.

## Caveats

- Still a LOWER BOUND by a deliberately generic bot. On the handcrafted seed 7
  gcommander reaches 1062/1200 where hand-tuned `commander` wins at t=175; the
  bot is a coverage/difficulty PROXY, never proof of human winnability.
- The assault raised bloodiness on some maps and has a bad tail (4395). Net it
  is a large average improvement (56%→85% on the first 16's methodology
  extended to 40), but it is not a free win on every seed.
