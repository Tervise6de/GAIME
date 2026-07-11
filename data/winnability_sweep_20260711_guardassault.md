# Winnability sweep — guard-assault gcommander (2026-07-11, session fok54l)

Follow-up to `winnability_sweep_20260711.md`. Same harness, same 16 seeds, same
scenario ("The First Season", quota 1200 net, 480 s). The only change is in the
bot: `gcommander` gained a **staged guard assault** (`guardAssault` in
`game/js/auto.js`) that, once the two easy piles are being spent, commits force
to the guarded rich pile along the *hunter-avoiding Dijkstra road* and holds a
persistent WAR well on the guard so the arriving column converts to soldiers
and masses on it.

Harness: `tools/run_proto.mjs` per seed, `fast=40`, full scenario to `__DONE`
(the reliable per-seed method — see CLAUDE.md note on win_sweep timeouts).
`slain` = spiders killed. `rich_left` = food remaining in the guarded pile.

| seed | BEFORE | AFTER | net (after) | died | slain | rich_left |
|------|--------|-------|------------:|-----:|------:|----------:|
| 1000 | WON  | WON  | 1201 | 1171 | 1 | 312 |
| 1097 | WON  | WON  | 1201 |  407 | 3 | 341 |
| 1194 | WON  | WON  | 1201 |  442 | 2 |   0 |
| 1291 | lost 854 | lost 1178 | 1178 |  716 | 3 |   0 |
| 1388 | WON  | WON  | 1200 |  274 | 2 |  53 |
| 1485 | lost 947 | **WON** | 1201 |  122 | 1 | 239 |
| 1582 | WON  | WON  | 1201 | 1136 | 2 | 331 |
| 1679 | lost 778 | **WON** | 1201 |  306 | 2 | 445 |
| 1776 | lost 913 | **WON** | 1201 |  636 | 3 | 123 |
| 1873 | WON  | WON  | 1201 | 1190 | 3 |   0 |
| 1970 | WON  | WON  | 1201 |  636 | 3 |  70 |
| 2067 | WON  | WON  | 1201 |  462 | 1 | 392 |
| 2164 | lost 683 | lost 886 |  886 |  150 | 0 | 900 |
| 2261 | WON  | WON  | 1201 |  621 | 2 |   0 |
| 2358 | lost 566 | **WON** | 1201 | 1181 | 2 | 257 |
| 2455 | lost 905 | **WON** | 1201 |  191 | 2 | 334 |

**Result: 14 WON / 16 (88%), up from 9/16 (56%). Five former losses converted;
zero regressions among the nine prior wins.** (STRONG-PROXY LOWER BOUND — a
generic scripted bot, NOT a claim about human players or optimal play.)

## Why it worked (mechanism, confirmed on seed 1485)

The dominant loss mode was never a guard the bot *couldn't* beat — it was a
guard the bot never *engaged*. gcommander's Dijkstra roads route AROUND
hunters, so on losing seeds it harvested the two easy piles cleanly
(`died ≈ 15`, `slain: 0`, `rich: 0%`) and simply left the 900-food rich pile on
the map, capping at ~1300 gathered → below the 1200 net quota after brood cost.
It was **too timid, not too aggressive**. Seed 1485 went 947 (lost) → 1201
(won), guard slain, rich 661 harvested.

The earlier naive fix ("always prioritise the guard") over-committed and marched
the colony through danger in straight lines → death explosions (win→loss).
The disciplined version differs in two ways that matter: the march follows the
**safe Dijkstra road** (not a straight line through the roamer's territory), and
deep roamers stay **FEAR-walled**. Result: the guard dies without the colony
being fed into the mid-map hunter.

## The two residual losses (both understood)

- **2164** — the only true residual. `slain: 0`, `rich: 900 left`, `died: 150`:
  the safe route to *this* guard never lets soldiers mass on it (a
  geometry-specific stall). A genuine generic-bot limitation.
- **1291** — a near-miss, NOT a guard failure. All three piles fully harvested
  (rich 900 taken, guard slain ×3); the bot cleared the entire map but landed
  22 net short of 1200 at the buzzer on brood + death overhead (`died: 716`).
  The map is effectively winnable — a less lossy player clears it. This is an
  economy/difficulty data point, not a winnability wall.

## Caveats (unchanged from the prior sweep)

- Still a LOWER BOUND by a deliberately generic bot. On the handcrafted seed 7
  gcommander reaches 1062/1200 where hand-tuned `commander` wins at t=175; the
  bot is a coverage/difficulty PROXY, never proof of human winnability.
- Deaths rose on several wins (e.g. 1000: 433→1171). The bot's force management
  is crude; a careful player would bleed far less, so the higher bot death
  count makes this lower bound *more* conservative, not less. Difficulty
  normalization (win-time/death spread) remains open work.
