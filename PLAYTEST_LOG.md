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

## 2026-07-10 ~20:25 UTC — Stage 5 comparison: HIVEMIND vs STORMWARDEN
Both prototypes built and exercised (HIVEMIND @ c7f1bca; STORMWARDEN @ 67c63ab).
Compared on the protocol's eight Stage-5 criteria using IMPLEMENTATION evidence
only. Score: + favours that prototype, ~ even.

- Central promise present in play (the decisive criterion):
    STORMWARDEN +  — its hardest assumption (a learnable skill gradient beating
    the naive null) PASSED cleanly, pre-registered, across 5 seeds, first tuned
    run, no metric redefinition. HIVEMIND ~ — its pre-registered throughput
    claim FAILED; the verb only showed value after an in-run brood-economy
    reframing (then routing → 4.5x colony), and a naive "warband" still matches
    throughput. Real but messier, conditional evidence. [VERIFIED FACT both]
- Meaningful decisions: STORMWARDEN + — each forecast is a crisp judgment with
    a consequence (Brier + lives). HIVEMIND ~ — decisions exist but are muddied
    by legibility gaps (invisible spider territory, no long-range lure).
- Clarity / onboarding: STORMWARDEN + — read instruments → call tomorrow.
    HIVEMIND − — indirect field-painting reads as "mushy"; players must build
    roads not point (per its own playtest weaknesses).
- Responsiveness / game feel: HIVEMIND + — thousands of agents reacting to a
    brushstroke is tactile and immediate. STORMWARDEN ~ — turn-based daily loop,
    satisfying-reveal but not kinetic. [CREATIVE JUDGMENT]
- Visual communication: HIVEMIND + (spectacle ceiling: swarm rivers, mass
    battles) vs STORMWARDEN + (a legible weather map with a violet storm front
    visibly bearing down on the town — see media/proto/sw_front|storm.png).
    Both screenshot-strong; call it ~, HIVEMIND slightly higher ceiling.
- Depth potential: ~ even. HIVEMIND: emergent ecology, species, scenarios.
    STORMWARDEN: sensor-budget economy, seasons/regions, multi-day forecasts,
    townsfolk stakes. Both have credible content axes.
- Repeatability: STORMWARDEN + — deterministic seeded seasons, trivially
    reproducible (node harness). HIVEMIND + — also seeded/deterministic. ~.
- Production burden: STORMWARDEN + — a systemic sim + UI; no swarm-scale perf
    or cross-biome AI-legibility problem. HIVEMIND − — perf at 3200+ agents
    (measured ~1ms/tick, OK now) plus AI legibility across many biomes is the
    stated hard production risk.

Tally: STORMWARDEN leads on central-promise, decisions, clarity, repeatability,
production burden; HIVEMIND leads on responsiveness and visual ceiling; depth
even. The criteria Stage 5 weighs most (is the promise actually in play?
meaningful decisions? clarity? feasible to build?) favour STORMWARDEN.

The one axis HIVEMIND clearly wins is OUTSIDE these eight: audience demand —
Empires of the Undergrowth (~16.8k reviews, Overwhelmingly Positive) is a
STRONG PROXY that HIVEMIND's audience exists, while STORMWARDEN's demand is
UNKNOWN (near-empty niche). Protocol forbids treating that proxy as validation,
and demand is carried forward as STORMWARDEN's #1 Stage-6 risk.

Decision: WINNER = STORMWARDEN; FALLBACK = HIVEMIND (preserved, genuinely
strong — the pivot target if a demand test comes back weak). Logged in
DECISION_LOG 2026-07-10.

## 2026-07-10 ~20:45 UTC — Stage 6: sensor PLACEMENT is a real decision @ 0947a3e→(this)
- Hypothesis / what was tested: Stage 4b stubbed the concept's actual verb —
  "place sensors" — as two fixed, perfectly-placed lookouts, so the player's
  real decision (WHERE to spend a scarce sensor budget) was untested, and
  expert accuracy sat implausibly high (92.7%). PRE-REGISTERED: "with the SAME
  instrument decision rule, if SKILLED placement (sensors on the upwind
  streamline) cannot beat NAIVE placement (sensors clustered on the town) by
  Brier Skill Score >= +0.15 AND accuracy uplift >= +8 pts over a season, then
  sensor placement is a fake choice and you would just cluster on the town."
- How it was run: instruments.js made placement-aware (a mis-placed sensor
  reports the WRONG airmass; sensors too far from the incoming streamline give
  no upwind read at all → the forecaster falls back to the barometer alone,
  lower confidence). tools/placement.mjs sweeps placements across 5 seeds x 60
  days. Backward-compat verified: default (no sensors) instrument is unchanged
  at Brier 0.186 (the Stage-4b number). Playable build wired up: human places 3
  sensors by clicking, then forecasts the season; driven end-to-end via
  Playwright (media/proto/sw_place.png, sw_forecast.png).
- Observed result (facts, means over 5 seeds x 60 days, identical decision rule):
    persistence (null)   Brier 0.500  acc 67.3%   storm hit/miss 6.6/2.4
    onTown  (naive)      Brier 0.378  acc 77.0%   storm hit/miss 7.0/2.0
    random  (blind)      Brier 0.392  acc 79.0%   storm hit/miss 7.8/1.2
    spread  (hedge)      Brier 0.194  acc 92.3%   storm hit/miss 8.2/0.8
    upwindLine (skill)   Brier 0.207  acc 91.3%   storm hit/miss 8.4/0.6
    fixed lookouts (4b)  Brier 0.186  acc 92.7%   storm hit/miss 8.8/0.2
  BSS skilled vs persistence +0.586; BSS skilled vs NAIVE +0.453; accuracy
  uplift skilled−naive +14.3 pts. Pre-registered claim PASSED (~3x margin).
  Playable human-driven run (seed 42, skilled placement + trust-upwind-sensor
  heuristic): Brier 0.290, acc 90%, caught 12/14 storms, reputation +12 — a
  believable human result sitting between naive and optimal. No page errors.
- Evidence class: VERIFIED FACT (all numbers, this sim/seeds/rules).
- Weaknesses found / surprises: (1) GOOD surprise — `spread` (0.194) edges out
  `upwindLine` (0.207): hedging against wind-meander with N/S coverage beats
  doubling up on the 2-day-upwind point. So placement is not a single dominant
  answer — there's a real lead-time-vs-coverage metagame (the depth we wanted).
  (2) Naive placement still beats persistence (0.378 vs 0.500) because the
  barometer tendency is always available — so even a novice isn't helpless; the
  skill gap is the ~14 pts from novice→expert. (3) Skilled expert accuracy is
  now a fallible 91% (was 92.7% with ideal lookouts) — the "too easy" risk is
  reduced but not gone; deeper sims (fronts, multi-day) should push it lower.
- Action taken: kept and committed. Sensor placement is now a proven, playable
  core decision. Next: a scarce-budget economy / upgrade path and a real
  demand test are the top remaining items.

## 2026-07-10 ~21:00 UTC — Stage 6 DEPTH probe: skill vs forecast lead time
- Hypothesis / what was tested: is there skill HEADROOM beyond a 1-day forecast,
  or is the game thin (tomorrow easy, 2+ days a coin-flip)? For each day the
  forecaster reads the air ~L days upwind (town − wind·L) and calls the sky L
  days out; scored against the realized weather L days later. Persistence at
  lead L = today's sky. Farther-upwind reads are noisier and the "wind holds"
  assumption decays with L, so this measures real information vs lead time.
- How it was run: tools/leadtime.mjs, 5 seeds x 90-day seasons, no browser
  (ideal upwind sampling — an information upper-ish bound, not placed sensors).
- Observed result (facts, means over 5 seeds x 90 days):
    lead  instrument Brier/acc   persistence Brier/acc   BSS(inst vs pers)
     +1d  0.163 / 92%            0.649 / 52%             +0.748
     +2d  0.283 / 87%            0.771 / 40%             +0.633
     +3d  0.400 / 82%            0.846 / 33%             +0.527
  Instrument skill decays gracefully with lead (Brier 0.163→0.283→0.400; acc
  92→87→82%) yet still beats persistence decisively at every range. Persistence
  collapses with lead (52→40→33%), so the ACCURACY GAP widens at range (+40,
  +47, +49 pts) — long-range forecasting is where expertise matters most.
- Evidence class: VERIFIED FACT (this sim/seeds/rules). Note this uses ideal
  upwind sampling, so real placed-sensor play would sit a little below these
  curves — the SHAPE (graceful decay, persistent skill gap) is the finding.
- Weaknesses found: single-front toy sim; a real game needs richer dynamics
  (evolving/merging fronts, seasonality) to sustain the +3d challenge over long
  play. But the core question is answered: depth exists.
- Action taken: committed tools/leadtime.mjs. This justifies a multi-day
  "outlook" as a concrete higher-skill tier / content axis (BACKLOG). Supports
  the "capable of supporting a larger game" mission criterion with real evidence.

## 2026-07-10 ~21:15 UTC — Stage 6: 3-day OUTLOOK is now PLAYABLE
- Hypothesis / what was tested: turn the measured lead-time depth into a felt,
  played decision — does a committed 3-day outlook (call tomorrow, +2 and +3)
  create a real, layered decision that ties to sensor placement, without
  breaking the working build?
- How it was run: rebuilt the human loop — each day the player commits a 3-day
  outlook (TAB picks a horizon, 1–4 set its sky, Q/W/E set confidence which
  honestly DECAYS with lead); each horizon is scored against the weather that
  many days later via a pending-forecast buffer and per-lead scorers. Headless/
  view/demo/auto modes left unchanged (committed evidence preserved). Driven
  end-to-end via Playwright, seed 42, full 60-day season, NO page errors.
- Observed result (facts, scripted "human" that reuses the 1-day upwind read
  for ALL three horizons — deliberately naive on the longer leads):
    +1d  Brier 0.290  acc 90%   (near sensor is right for tomorrow)
    +2d  Brier 0.590  acc 56%
    +3d  Brier 0.707  acc 33%
  Reputation +13, caught 12/14 storms. The degradation 90→56→33% is the
  INTENDED signal: reusing tomorrow's read for the whole outlook is a poor
  long-range strategy; leadtime.mjs shows reading FARTHER-upwind sensors at
  each lead recovers +3d to ~82%. So the outlook is a genuine harder decision
  that rewards near-vs-far sensor placement. Screenshot media/proto/sw_outlook.png
  shows the three horizons with live per-lead accuracy and multi-lead resolution.
- Evidence class: VERIFIED FACT (ran it; numbers observed). The claim that
  players will FIND this depth engaging is UNKNOWN (needs humans).
- Weaknesses found: the scripted driver can't demonstrate a skilled far-sensor
  outlook strategy through the UI (it always reads "nearest upwind"); a human
  would place a far sensor and read it for +3d. The near-vs-far placement
  tradeoff is now expressible but its optimum isn't yet auto-verified in-UI.
- Action taken: committed. The playable core loop now layers placement +
  multi-day forecasting — a vertical-slice-shaped loop, not just a toy.
