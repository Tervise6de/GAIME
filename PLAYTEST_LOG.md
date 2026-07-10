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

## 2026-07-10 ~20:15 UTC — STORMWARDEN prototype, falsification runs
- Hypothesis / what was tested: PRE-REGISTERED (same quantitative bar as
  HIVEMIND) — "if an INSTRUMENT-informed forecaster cannot beat PERSISTENCE
  forecasting ('tomorrow = today') by Brier Skill Score >= +0.15 AND a
  categorical-accuracy uplift >= +8 percentage points over a season, there is
  no learnable skill gradient and the core loop is a coin-flip." Truth sim:
  signed pressure systems (highs+lows, lows carry moisture) advect east on a
  meandering prevailing wind across a 64x36 domain; town weather is read
  analytically from their superposition; four categories CLEAR/CLOUDY/RAIN/
  STORM. Four scripted forecasters: persistence (null), climatology (null,
  using the TRUE measured base rates), instrument (barometer tendency + two
  noisy upwind LOOKOUT sensors ~1-2 days out), oracle (perfect, upper bound).
- How it was run: (a) node-native harness tools/season.mjs, 5 seeds
  (7,11,23,42,101) x 60-day seasons, no browser; (b) headless Chromium via
  tools/run_proto.mjs confirmed the BROWSER build reproduces the node numbers
  exactly (seed 7 instrument Brier 0.1863 / acc 93.3% in both).
- Observed result (facts, means over 5 seeds x 60 days):
    persistence  Brier 0.500  acc 67.3%  storms hit/miss/falseAlarm 6.6/2.4/2.8
    climatology  Brier 0.689  acc 46.0%  storms 0/9/0   (never warns → all missed)
    instrument   Brier 0.186  acc 92.7%  storms 8.8/0.2/1.2
    oracle       Brier 0.014  acc 100%   storms 9/0/0
  Brier Skill Score (instrument vs persistence) = +0.628. Accuracy uplift
  = +25.3 pts. Instrument closes 65% of the persistence→oracle Brier gap.
  Measured climate CLEAR/CLOUDY/RAIN/STORM = 0.46/0.21/0.18/0.15. The stakes
  land exactly where skill lives: persistence MISSES ~2.4 storms/season
  (people caught out), climatology misses EVERY storm; instrument misses
  ~0.2/season. Pre-registered claim PASSED with >4x the required margin,
  cleanly, on the first tuned run, across all 5 seeds — no metric redefinition
  needed (contrast HIVEMIND, which needed an in-run economy reframing).
- Evidence class: VERIFIED FACT for all numbers (this sim, these seeds,
  scripted forecasters). It is NOT market validation — demand for a
  forecasting game remains UNKNOWN. STRONG PROXY (Papers Please) that the
  structural genre can sell; that is not this game selling.
- Weaknesses found: (1) instrument acc 92.7% is high — once the upwind lookout
  is correctly placed the sim is nearly solved. The OPPOSITE risk to the one
  tested: skill ceiling may be too shallow / could get boring. Persistence at
  67% shows a real 25-pt gap to climb, but Stage 6 must make expert play
  expert-but-FALLIBLE (evolving/meandering systems, multi-day forecasts,
  scarce/mis-placeable sensors). (2) The "place sensors" verb from the concept
  is currently STUBBED as two fixed correctly-placed lookouts — the actual
  player DECISION (where to spend a limited sensor budget) is untested. (3)
  Storm base rate 15% is dramatic-but-high; tune later. (4) Map letterboxes on
  16:9 with the side panel — cosmetic.
- Action taken: prototype kept and committed. Proceed to Stage 5 comparison,
  then Stage 6 targets weakness (2)/(1): a real sensor-placement decision and
  a deeper, fallible skill gradient.
