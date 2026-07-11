# Guard-clearing bot comparison — gcommander vs gcmdr2 — 2026-07-11

Follow-up to `winnability_sweep_20260711.md`. Same 16 generated seeds
(1000 + i·97, i = 0..15), same scenario ("The First Season", quota 1200,
480 s), same harness (`tools/bot_sweep.mjs`, `fast=40`, poll-based `__DONE`
detection so long LOSING games are measured reliably instead of
false-timing-out). `cov` = percent of each pile harvested; `slain` = spiders
killed.

## The change under test

`gcommander`'s dominant loss mode was the guarded 900-food "rich" pile never
opening: reinforcement waves keep a NEARER hunter on the nest, so the distant
guard is never the single nearest target the old bot painted, and it stayed
alive (5 of 7 losses were `rich:0%`, guard un-slain). `gcmdr2` adds a
**concurrent second front**: it paints the guard's war zone every cycle *in
addition to* nest defence, never *instead of* it. Because the nest war is
painted first and the soldier caste is a fixed 35 % slice, defence is retained
and the extra front only commits the surplus soldiers the old bot left idle.
This is the opposite of the earlier REJECTED guard-priority variant, which made
the guard the SOLE target, stripped the nest, and died in death explosions
(DECISION_LOG 2026-07-11).

## Head-to-head (identical seeds)

| seed | gcommander | gcmdr2 | Δ | gcmdr2 rich | gcmdr2 died |
|------|-----------|--------|---|------------:|------------:|
| 1000 | WON  | WON  | =        |  41% |  177 (was 433) |
| 1097 | WON  | WON  | =        |  58% |  312 |
| 1194 | WON  | WON  | =        |  62% |  783 (was 573) |
| 1291 | lost | lost | =        |  69% |  650 |
| 1388 | WON  | WON  | =        | 100% | 1116 |
| 1485 | lost | lost | =        |   0% |   15 |
| 1582 | WON  | WON  | =        |  84% | 1294 |
| 1679 | lost | **WON** | **+win** | 61% | 728 |
| 1776 | lost | lost | = (worse cov) | 29% (was 65%) | 597 |
| 1873 | WON  | WON  | =        | 100% | 1190 |
| 1970 | WON  | WON  | =        |  65% |  231 |
| 2067 | WON  | WON  | =        |  45% |  422 |
| 2164 | lost | lost | =        |   0% |  354 |
| 2261 | WON  | WON  | =        |  88% (was 69%) | 565 |
| 2358 | lost | lost | =        |   0% |  103 |
| 2455 | lost | lost | =        |   0% |  235 |

**gcommander: 9/16 (56 %). gcmdr2: 10/16 (62.5 %).**

- **+1 win** (seed 1679: rich pile cracked from 0 % → 61 %), **zero win
  regressions** — every map gcommander won, gcmdr2 also wins.
- **No death explosion.** The win-deaths floor actually improved (231 → 177 on
  seed 1000); the max (1294, seed 1582) is unchanged and belongs to an
  inherently bloody map. The nest-first ordering + fixed soldier cap held.
- One loss got marginally *worse* coverage (1776: rich 65 % → 29 %) — the
  second front diverted force there without a payoff. Still a loss either way;
  net effect across the set is +1.

## The four stubborn losses (1485, 2164, 2358, 2455)

All four stay `rich:0%` even with the concurrent front. `slain` on them is 0–3
and deaths are low-to-moderate (15–354): the bot is not dying, it simply cannot
route enough force the long way out to a distant guard while still harvesting
the two lesser piles in time. On these maps the far/high piles alone (1300
gross) net below the 1200 quota after brood + death costs, so the guarded pile
is *required* — and its guard is expensive relative to the reward. This is
honest evidence that a subset of generated maps are genuinely harder (an
expensively-guarded essential pile), not that the generator is broken.

A refinement that gave the guard march a stronger, wider LURE (0.95/30 vs
0.8/26) to pull more ants out was TRIED and REVERTED: it converted seed 2358
(lost → WON) but regressed seed 1679 (WON → lost) — a lateral trade with
instability, i.e. overfitting. gcmdr2 ships with the plain 0.8/26 strike.

## What this measures (and what it does NOT)

- gcmdr2 raises the **strong-proxy LOWER BOUND** on winnability by a generic
  scripted player from 56 % to **62.5 %**. It is still a lower bound, not proof
  that 37.5 % of maps are unwinnable, and says nothing about human players.
- `gcommander` is preserved untouched as the original measurement baseline; the
  hand-tuned seed-7 `commander` and both prototypes are unchanged. On seed 7
  gcmdr2 reproduces gcommander exactly (1062/1200, rich 100 %, far 2 % — the
  separate "distant-pile under-service" issue, out of scope here).
