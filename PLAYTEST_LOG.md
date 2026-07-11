# PLAYTEST_LOG

Append-only record of actual builds, runs and playtests. Newest at the
bottom. Record only what was actually observed — never imagined or expected
behaviour. Every entry names the commit it tested.

Entry template:

```
## [YYYY-MM-DD HH:MM UTC] — <prototype/build name> @ <commit>
- Hypothesis / what was tested:
- How it was run:
- Observed result (facts only):
- Evidence class:
- Weaknesses found:
- Action taken:
```

---

## 2026-07-10 ~20:10 UTC — HIVEMIND prototype, first falsification runs
- Hypothesis / what was tested: PRE-REGISTERED — "if SMART routing cannot
  beat NAIVE straight-line luring by >=1.25x food with <=0.6x deaths on the
  same seed, the painting verb is hollow." Scenario: guarded rich pile,
  two safe-but-distant piles, 2 spiders, seed 7, 120 sim-seconds, scripted
  strategies (naive / smart routing / warband composition).
- How it was run: headless Chromium via tools/run_proto.mjs, fast=10,
  deterministic seeded sim, results from window.__RESULTS.
- Observed result (facts): Run 1 (no brood economy): naive gross 900 food /
  4025 deaths; smart 391 / 83; warband (rally-kill-then-harvest) 900 / 36,
  spider killed. Pre-registered claim FAILED on throughput (smart gross
  0.43x naive) — free respawns made mass sacrifice viable, and long safe
  routes taxed round-trip time. Run 2 (brood costs food beyond initial
  reserves): naive ends stock 0, colony collapsed to 664; smart stock 0 but
  colony 2987 (income converted to population); warband stock 471, colony
  at cap 3200, 36 deaths. Perf: ~1.0 ms/sim-tick at 3200 agents (headless).
- Evidence class: VERIFIED FACT for all numbers (this scenario, this seed,
  scripted bots); CREATIVE JUDGMENT that the warband column *looks*
  dramatic (screenshot media/proto/hm_battle.png).
- Weaknesses found: (1) deaths must cost resources or meatgrinder play
  dominates — fixed in-run by brood economy, retained; (2) route length is
  a heavy hidden tax — good tradeoff material, needs surfacing to players;
  (3) spider territories are invisible to a human player; (4) lure has no
  long-range attraction — players must build roads, not point (this is the
  interesting part of the verb, but onboarding must teach it explicitly).
- Action taken: brood-cost economy kept; committed; comparison vs
  STORMWARDEN pending its build.

## 2026-07-10 ~20:45 UTC — STORMWARDEN prototype: calibration + falsification
- Hypothesis / what was tested: PRE-REGISTERED — "the sim has a learnable
  skill gradient iff an instrument-informed forecaster beats persistence by
  >=10pp accuracy, below a 92% ceiling, with sane base rates (wet 20-50%,
  storm 3-20%)."
- How it was run: headless bot runs (climo/persist/instrument) over 400-day
  careers; feature/truth dumps (1000 days) fitted offline (two-stage
  logistic); coefficients hard-coded into the bot; validated on seeds never
  used in fitting. Interactive UI played via scripted clicks (3 days).
- Observed result (facts):
  (1) v1 sky was degenerate: a 960hPa mega-low parked over the region
      (systems too strong, stacked, and initially too slow to traverse —
      lows died before reaching town, wet rate 0.5%). Two calibration
      passes fixed base rates to wet 16-26%, storm 3-12% across seeds.
  (2) v2 FAILED the pre-registered test: instrument bot 47-54% vs
      persistence 76-84%. Cause found in data: weather crossed from the
      westernmost observable station to town in <1 day, so tomorrow's
      causes were UNOBSERVABLE at forecast time. The information did not
      exist in the world — no bot or human could have it.
  (3) Added far-west telegraph stations (1-3 days upstream) and refit:
      HELD-OUT validation PASSES — instrument 91.5/91.7/91.7% vs
      persistence 78.2/83.0/76.5% (gaps +13.3/+8.7/+15.2pp, mean +12.4);
      storm recall 76-88% vs 50-60%; false alarms 2-7 vs 11-18 per 400
      days; game score +24-54%. Consistent ~91.7% ceiling = skill headroom.
  (4) Interactive loop works: 3 days played by mouse clicks; ledger,
      reputation, resolution banners all function; day 4 reached, rep
      50->60.
- Evidence class: VERIFIED FACT for all numbers (this sim, these seeds);
  the LR bot is an *upper bound proxy* for human-learnable skill — whether
  humans FEEL the tension is CREATIVE JUDGMENT / UNKNOWN.
- Weaknesses found: (1) the concept's viability hinged on observation
  range — discovered, fixed, and now understood as the game's actual core
  system (the telegraph network IS the tech tree); (2) anemometer display
  undersells storm wind (gust model added but map wind arrows still
  understate); (3) temp forecasting is shallow (wind-provenance only);
  (4) human fun/tension untested and untestable in this environment.
- Action taken: committed as Stage 4 second prototype; proceed to Stage 5
  comparison.

## 2026-07-10 ~22:00 UTC — HIVEMIND Stage 6 Loop 1: goal structure (game/)
- Hypothesis / what was tested: a win/lose scenario ("The First Season")
  can make every verb NECESSARY and discriminate competence: full play
  wins; each lazy doctrine loses differently.
- How it was run: five scripted doctrines (commander / warband / smart /
  naive / idle) headless on seed 7 after each tuning change; per-pile
  extraction instrumented.
- Observed result (facts, final tuning): commander WINS t=175s (stores
  1200/1200, 4 hunters slain); warband loses 511/1200 (war without
  economy); smart loses 348/1200 (roads without war); naive loses by
  colony collapse t=30s (queued its nation inside a hunter's territory);
  idle loses 0/1200. Full escalation (progress-triggered waves at stores
  300/700/1100) unfolds before the win.
- Design knowledge extracted along the way (each verified by a failed run):
  (1) free respawns → meatgrinder play dominates → brood must cost food;
  (2) a large starting colony + instant roads → quota sniped in 15s → start
      small (250), earn the swarm;
  (3) clock-triggered waves can be outrun → trigger escalation on PROGRESS;
  (4) unlimited pile flow → one firehose road suffices → rate-limit piles
      (6/5/4 per s) so parallel roads are the skill;
  (5) unbounded WAR conversion bankrupts the economy → soldier caste capped
      at 35% of colony; war is a managed slice;
  (6) an accidental 38px terrain pinch silently killed a route — terrain
      passability must be readable (real-game art requirement);
  (7) rate-limited piles make queuing IN danger lethal — teachable drama.
- Evidence class: VERIFIED FACT (deterministic seeded runs, this map);
  bot doctrines are proxies for player skill levels (STRONG PROXY for
  discrimination, ASSUMPTION for human pacing/fun).
- Weaknesses: single map (seed-7 waypoints hardcoded in bots); growth is
  automatic (no player brood control — backlog: brood throttle verb);
  onboarding absent.
- Action taken: committed; Loop 2 = onboarding.

## 2026-07-10 ~23:20 UTC — Stage 6 Loop 3: generated territories with guarantees
- Hypothesis / what was tested: [N] "new territory" can produce genuinely
  different maps that keep the scenario structurally fair, without
  invalidating the balance evidence on the handcrafted map.
- How it was run: tools/gen_check.mjs across 40 seeds (1000..4783);
  seed-7 regression via commander bot; dist rebuild verified from file://.
- Observed result (facts): 40/40 generated maps satisfy all guarantees
  (3 piles placed, every pile BFS-reachable from nest, both lesser piles
  outside hunter ground, dens ≥240px from nest, nest never buried, no
  generator fallbacks used). Seed 7 remains byte-identical in behaviour:
  commander WINS at t=175. Escalation waves on generated maps now target
  the road to the busiest pile instead of fixed coordinates.
- Evidence class: VERIFIED FACT (structural guarantees); ASSUMPTION that
  generated maps are also well-BALANCED (quota tuning was done on seed 7;
  bot-winnability across seeds needs the generalized commander — next).
- Weaknesses: no difficulty normalization across seeds; commander bot
  cannot play generated maps (hardcoded waypoints) so winnability is
  structurally plausible but unproven off seed 7.
- Action taken: committed; balance sweep across seeds moved to backlog Now.

## 2026-07-11 ~07:35 UTC — Final morning run: live build re-verification
- Hypothesis / what was tested: the overnight-1 build is still GREEN and its
  depth claim ("only full competence wins") reproduces on a fresh checkout,
  not just from the prior session's recorded numbers.
- How it was run: `npm install` to restore Playwright; `python3 -m http.server
  8123`; headless bot matrix on seed 7 via tools/run_proto.mjs (fast=20-25);
  single-file dist re-run + screenshot.
- Observed result (facts): seed 7 — commander WON 1200/1200, season lasted
  175s, 679 fallen; smart LOST at 949/1200; warband LOST 0 gathered; naive
  LOST (colony collapsed below survival); idle LOST 0/1200. Five doctrines →
  five distinct outcomes. `game/dist/HIVEMIND.html` re-run reaches the
  identical win card ("THE COLONY ENDURES"), screenshot captured. No code
  changed; build needed no repair.
- Evidence class: VERIFIED FACT (all outcomes directly observed this run).
- Weaknesses: still all scripted — no human has played. Verification is on
  seed 7's handcrafted map; generated-map balance remains unproven (backlog).
- Action taken: stamped MORNING_REPORT.md with re-verification block +
  observed matrix; refreshed PROJECT_STATE/HANDOFF; released heartbeat.

## 2026-07-11 ~08:40 UTC — Generalized commander + cross-seed winnability sweep
- Hypothesis / what was tested: are the generated territories actually
  WINNABLE, not merely structurally fair? The hand-tuned commander only plays
  seed 7 (hardcoded lanes), so this had never been tested. Built gcommander (a
  generic, map-driven bot: hunter-avoiding Dijkstra routes, FEAR walls over
  deep dens, nearest-threat war conversion) and swept 16 generated seeds.
- How it was run: game/js/auto.js gcommander; tools/win_sweep.mjs + per-seed
  tools/run_proto.mjs at fast=40 to __DONE. Full table: data/winnability_sweep_20260711.md.
- Observed result (facts): gcommander WINS 9/16 (56%). Baseline commander
  still WINS seed 7 at t=175 (preserved untouched). gcommander on seed 7 gets
  1062/1200. Of the 7 losses, 5 show rich:0% + slain:0 — the guarded rich pile
  (largest source) is never opened because the generic war approach doesn't
  kill a distant guard; those maps cap at far+high ≈1300 gathered → under the
  1200 net quota after costs. Winners: t=272-390s, deaths 231-1294 (wide
  difficulty spread). Confirmed per-pile: on generated maps the two lesser
  piles are almost always harvested 100% (far/high), unlike seed 7 where the
  two upper-right piles starve the third — the seed-7 starvation was geometry-
  specific.
- Evidence class: VERIFIED FACT (all runs observed here). The 56% is a
  STRONG-PROXY LOWER BOUND on winnability by a weak generic heuristic — NOT
  proof any map is unwinnable, NOT a claim about humans. Losses trace to a
  fixable strategy gap (guard-clearing), not structural unfairness.
- Weaknesses: gcommander is not an optimizer; a guard-priority variant was
  tried and made it WORSE (over-commits, nest undefended, death explosions,
  8/16) so it was reverted. True winnability needs either a stronger bot or
  human play. Difficulty is not normalized across seeds.
- Action taken: shipped gcommander as a new strategy (baseline commander
  preserved as the seed-7 balance reference); committed win_sweep tool + data
  table; guard-priority change reverted. Difficulty normalization + a
  guard-clearing bot stay on the backlog.

## 2026-07-11 ~10:40 UTC — Guard-clearing bot (gcmdr2): concurrent second front
- Hypothesis / what was tested: can a disciplined guard-clearing routine raise
  the 56% winnability lower bound WITHOUT the death explosion that sank the
  earlier guard-priority attempt? Diagnosis first: a naive "gate the guard
  attack on nest-safe" variant turned out BYTE-IDENTICAL to gcommander (the old
  bot already fought the guard exactly when it was the sole nearest target), so
  the real gap was that the far guard is never the nearest target while waves
  press the nest, and so is never attacked at all.
- The change: gcmdr2 paints the guard's war zone every cycle IN ADDITION to
  nest defence (nest war painted first; fixed 35% soldier cap keeps defenders),
  committing the surplus soldiers gcommander left idle. Never drops nest defence
  — the opposite of the rejected sole-priority variant.
- How it was run: game/js/auto.js gcmdr2; new poll-based tools/bot_sweep.mjs at
  fast=40 to __DONE (robust on long losing games). Same 16 seeds as the prior
  sweep. Full table: data/gcmdr2_sweep_20260711.md.
- Observed result (facts): gcmdr2 WINS 10/16 (62.5%) vs gcommander 9/16 (56%).
  +1 win (seed 1679, rich 0%->61%), ZERO win regressions (every gcommander win
  is also a gcmdr2 win). No death explosion — win-deaths floor improved
  231->177 (seed 1000), max unchanged (1294). Seed 7: gcmdr2 == gcommander
  exactly (1062/1200) — baseline untouched. Four losses (1485,2164,2358,2455)
  stay rich:0%: the bot cannot route enough force to a distant guard while
  harvesting in time — those maps' guarded pile is required AND expensive.
- Evidence class: VERIFIED FACT (all runs observed here). 62.5% is a tightened
  STRONG-PROXY LOWER BOUND, still not proof of any map's (un)winnability and
  still silent on humans.
- Weaknesses: only +1 of 5 hard losses cracked; the remaining 4 need either a
  smarter far-guard routing (a stronger-LURE march was tried and REVERTED —
  overfit, traded 1679 for 2358) or human play. Difficulty still not normalized.
- Action taken: shipped gcmdr2 as a new strategy (gcommander + commander +
  both prototypes preserved); committed bot_sweep tool + data table; the
  stronger-LURE refinement reverted. Difficulty normalization stays on backlog;
  cracking the last 4 hard maps folded into the guard-clearing item.
