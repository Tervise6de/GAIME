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
