# Winnability sweep — guard-assault gcommander (2026-07-11, session fok54l)

Follow-up to `winnability_sweep_20260711.md` (the 9/16 baseline). Same harness,
same 16 seeds, same scenario ("The First Season", quota 1200 net, 480 s). The
only change is in the bot: `gcommander` gained a **staged guard assault**
(`guardAssault` in `game/js/auto.js`) that, once the easy piles start being
spent, commits force to the guarded rich pile along the *reachable pile road*
and holds a persistent WAR well on the guard so the arriving column converts to
soldiers and masses on it.

Harness: `tools/run_proto.mjs` per seed, `fast=40`, full scenario to `__DONE`
(the reliable per-seed method — see CLAUDE.md note on win_sweep timeouts).
`slain` = spiders killed. `rich_left` = food remaining in the guarded pile.

| seed | BEFORE (9/16) | AFTER | net (after) | died | slain | rich_left |
|------|---------------|-------|------------:|-----:|------:|----------:|
| 1000 | WON  | WON  | 1200 |  218 | 2 | 543 |
| 1097 | WON  | WON  | 1200 |  374 | 2 | 298 |
| 1194 | WON  | WON  | 1201 |  561 | 3 | 321 |
| 1291 | lost 854 | lost 1086 | 1086 | 1046 | 4 |   0 |
| 1388 | WON  | WON  | 1200 |  474 | 3 |   0 |
| 1485 | lost 947 | **WON** | 1200 |  450 | 2 | 144 |
| 1582 | WON  | WON  | 1201 |  547 | 2 | 501 |
| 1679 | lost 778 | **WON** | 1201 |  310 | 2 | 448 |
| 1776 | lost 913 | **WON** | 1201 |  561 | 2 | 224 |
| 1873 | WON  | WON  | 1201 | 1190 | 3 |   0 |
| 1970 | WON  | WON  | 1201 | 1106 | 1 |   0 |
| 2067 | WON  | WON  | 1201 |  142 | 1 | 561 |
| 2164 | lost 683 | **WON** | 1200 |  583 | 2 | 368 |
| 2261 | WON  | WON  | 1201 |  686 | 3 |  15 |
| 2358 | lost 566 | **WON** | 1201 |  635 | 3 | 373 |
| 2455 | lost 905 | **WON** | 1200 |  333 | 2 | 339 |

**Result: 15 WON / 16 (94%), up from 9/16 (56%). Six former losses converted;
zero regressions among the nine prior wins.** (STRONG-PROXY LOWER BOUND — a
generic scripted bot, NOT a claim about human players or optimal play.)

## Why it worked (mechanism, confirmed on seed 1485)

The dominant loss mode was never a guard the bot *couldn't* beat — it was a
guard the bot never *engaged*. gcommander's Dijkstra roads route AROUND
hunters, so on losing seeds it harvested the two easy piles cleanly
(`died ≈ 15`, `slain: 0`, `rich: 0%`) and simply left the 900-food rich pile on
the map, capping at ~1300 gathered → below the 1200 net quota after brood cost.
It was **too timid, not too aggressive**. Seed 1485 went 947 (lost) → 1200
(won), guard slain, rich harvested.

The earlier naive fix ("always prioritise the guard") over-committed and marched
the colony through danger in straight lines → death explosions (win→loss).
The disciplined version differs in two ways that matter: the march follows the
**safe pile road** (not a straight line through the roamer's territory), and
deep roamers stay **FEAR-walled**. Result: the guard dies without the colony
being fed into the mid-map hunter.

## Iteration: route to the pile, not the den (14/16 → 15/16)

The first version routed the assault to the *guard den* and reached 14/16,
stalling on **seed 2164**, whose guard den sits on a BLOCKED cell — `routeTo`
found no path, the march went blind, soldiers never massed (`slain: 0`, rich
900 untouched). Fix: route to the **rich pile** instead, which the fairness
check guarantees is reachable; the guard is ~70px away, so staging at the pile
drops the column on it regardless of den geometry. This won 2164 outright AND
cut deaths sharply on several seeds (1000: 1171→218, 2067: 462→142) because the
reachable-pile approach is cleaner than the blind fallback.

## The single residual loss (understood, and NOT a clean reject candidate)

- **1291** — a bloodbath near-miss, NOT a guard failure. All three piles fully
  harvested (rich cleared, guard slain ×4); the bot cleared the entire map but
  landed 114 net short of 1200 at the buzzer on brood + death overhead
  (`died: 1046`). Its mid roamer sits close to the nest→guard corridor
  (`midCorridor ≈ 123`), so the assault runs a gauntlet and bleeds.
- Difficulty normalization was investigated (`tools/gen_difficulty.mjs`,
  structural features via the true BFS distance field). 1291 is **not** a clean
  structural outlier: seeds 2261 (midCorridor 125) and 2067 (134) won with
  near-identical geometry, and 1776/2358 won with midCorridor ≈ 3. No single
  feature isolates it, so a generator reject filter would discard winnable maps
  too. Left honest rather than papered over; the map is winnable in principle
  (fully harvestable) — the generic bot's overhead loses it, a careful player
  should not.

## Caveats (unchanged from the prior sweep)

- Still a LOWER BOUND by a deliberately generic bot. On the handcrafted seed 7
  gcommander reaches 1062/1200 where hand-tuned `commander` wins at t=175; the
  bot is a coverage/difficulty PROXY, never proof of human winnability.
- Deaths still span a wide band (142–1190). The reachable-pile routing lowered
  the average, but per-map bloodiness is not normalized; difficulty variance
  remains open work with no clean structural predictor found yet.
