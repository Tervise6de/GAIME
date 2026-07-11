# Cross-seed winnability / difficulty sweep — 2026-07-11

Bot: `gcommander` (generalized, map-driven commander — see `game/js/auto.js`).
Harness: `tools/run_proto.mjs` per seed, `fast=40`, full scenario to `__DONE`.
Scenario: "The First Season", quota = 1200 net stores, 480 s limit.
Seeds: 1000 + i·97, i = 0..15 (the 40-seed fairness set's first 16).

`cov` = percent of each pile's food harvested. `slain` = spiders killed.

| seed | result | net stores | gathered | died | slain | t (s) | rich | far | high |
|------|--------|-----------:|---------:|-----:|------:|------:|-----:|----:|-----:|
| 1000 | WON  | 1200 | 1637 |  433 | — | 356 |  46% | 100% | 100% |
| 1097 | WON  | 1201 | 1613 |  312 | — | 287 |  58% |  97% | 100% |
| 1194 | WON  | 1200 | 1665 |  573 | — | 355 |  65% | 100% |  86% |
| 1291 | lost | 854  | 1334 |  650 | 1 | 480 |  69% | 100% | 100% |
| 1388 | WON  | 1201 | 1774 | 1116 | — | 276 | 100% |  79% | 100% |
| 1485 | lost | 947  | 1300 |   15 | 0 | 480 |   0% | 100% | 100% |
| 1582 | WON  | 1200 | 1809 | 1294 | — | 277 |  84% | 100% |  74% |
| 1679 | lost | 778  | 1232 |  522 | 0 | 480 |   0% | 100% | 100% |
| 1776 | lost | 913  | 1513 | 1250 | — | 480 |  65% | 100% | 100% |
| 1873 | WON  | 1201 | 1789 | 1190 | — | 272 | 100% | 100% |  71% |
| 1970 | WON  | 1202 | 1598 |  231 | — | 278 |  65% | 100% |  75% |
| 2067 | WON  | 1202 | 1636 |  422 | — | 390 |  45% | 100% | 100% |
| 2164 | lost | 683  | 1164 |  654 | 0 | 480 |   0% | 100% | 100% |
| 2261 | WON  | 1200 | 1640 |  450 | — | 340 |  69% |  80% | 100% |
| 2358 | lost | 566  |  937 |  103 | 0 | 480 |   0% | 100% |  46% |
| 2455 | lost | 905  | 1302 |  235 | 0 | 480 |   0% | 100% | 100% |

**Result: 9 WON / 16 (56%).**

## What this measures (and what it does NOT)

- `gcommander` is a fixed GENERIC heuristic, deliberately not hand-tuned to any
  map. On the handcrafted seed 7 it reaches only 1062/1200, where the
  hand-tuned `commander` wins outright at t=175. So this win-rate is a **lower
  bound on winnability by a weak-ish generic player**, NOT proof that 44 % of
  maps are unwinnable, and CERTAINLY not a claim about human players.
- It is a good **relative** signal: generated maps are consistently reachable
  and their two lesser piles are almost always fully harvested (`far`/`high`
  mostly 100 %).

## The single dominant failure mode

5 of the 7 losses show **`rich:0%` with `slain:0`** — the guarded rich pile
(900 food, the largest source) is never opened because the generic WAR
approach never kills its guard. Those maps then cap out at far+high ≈ 1300
gathered, which after brood + death costs lands below the 1200 net quota.

- This is the SAME class of weakness as seed 7: the bot does not reliably
  commit force to clearing a distant guard. A guard-priority variant was
  tried and REJECTED — it over-committed, abandoned nest defence, and caused
  death explosions (e.g. seed 1000: 433 → 2825 deaths, win → loss), lowering
  the win-rate to 8/16. See PLAYTEST_LOG / DECISION_LOG 2026-07-11.

## Secondary finding: difficulty is NOT normalized

Among wins alone, clear-time spans 272–390 s and deaths span 231–1294 — a wide
spread. Generated maps are structurally fair (40/40 gen_check) but vary a lot
in how bloody/hard they play. Difficulty normalization remains open work.

---

# UPDATE (same day, later session): 16/16 after guard-clearing + brood throttle

Bot upgraded (`dev-20260711-guardclear` session): muster→march→strike guard
assault on a single moving WAR peak ("shepherd blob"), muster-stall escalation
to the nest mouth, and a brood throttle (FEAR on the nest holds brood; the
colony banks instead of growing — also a new PLAYER verb).

| seed | result | died | slain | t (s) | guard dead at |
|------|--------|-----:|------:|------:|--------------:|
| 1000 | WON | 217 | 1 | 202 | 40s |
| 1097 | WON | 273 | 3 | 307 | 40s |
| 1194 | WON | 682 | 4 | 176 | 58s |
| 1291 | WON | 602 | 4 | 218 | 42s |
| 1388 | WON | 355 | 2 | 197 | 60s |
| 1485 | WON | 176 | 2 | 284 | 68s |
| 1582 | WON | 686 | 1 | 186 | (press fight — guard denned near nest) |
| 1679 | WON | 288 | 1 | 165 | 66s |
| 1776 | WON | 632 | 3 | 264 | 132s (one re-muster) |
| 1873 | WON | 686 | 4 | 161 | 34s |
| 1970 | WON | 449 | 2 | 213 | 60s |
| 2067 | WON | 268 | 3 | 246 | 50s |
| 2164 | WON | 515 | 4 | 275 | 54s |
| 2261 | WON | 244 | 2 | 287 | 130s (one re-muster) |
| 2358 | WON | 399 | 3 | 180 | 52s |
| 2455 | WON | 172 | 1 | 192 | 94s (stall escalation) |

**Result: 16/16 (100%).** Win times 161–307 s (was 272–390 among 9 wins),
deaths 172–686 (was 231–1294). Baseline seed-7 `commander` re-verified
byte-identical (WON t=175, 679 died); full five-doctrine matrix reproduces
HEAD behaviour exactly. gcommander still loses seed 7 (1108/1200, known
source-commitment weakness on the handcrafted geometry) — `commander` remains
the seed-7 reference.

Evidence class: VERIFIED FACT for every run above; the 100% is a STRONG-PROXY
LOWER BOUND on map winnability by a scripted generic player. It says nothing
about human players. Determinism caveat: outcomes are chaotic in strategy
details (a 50px muster shift flipped three seeds in both directions), so
per-seed results are samples of dynamics, not stable per-map properties; the
union claim "every one of these 16 maps has at least one observed winning
line" is the robust statement.

## Difficulty normalization: REJECTED on measurement

Static layout features (path lengths, hunter-detour costs, den distances —
`tools/difficulty_probe.mjs`) were correlated against observed outcomes:
best |r| = 0.47 (totalDetour vs win-time, n=14); deaths correlate with
nothing (|r| <= 0.23). Difficulty spread is dominated by dynamics (wave
placement vs roads), not static geometry — a generator reject/retune band on
these features would be unfounded machinery. See DECISION_LOG 2026-07-11.
