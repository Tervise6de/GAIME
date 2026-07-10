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

## 2026-07-11 ~00:15 UTC — Stage 6 Loop 4: cross-seed winnability sweep + curated whitelist
- Hypothesis / what was tested: (1) a fully generalized "ceiling" bot can play
  ANY generated map, so its win/lose result is a real winnability signal;
  (2) generated maps that pass structural fairness (Loop 3) are actually
  winnable and fairly difficult. Both were previously ASSUMPTION.
- How it was run: generalized the commander bot to be map-agnostic (Dijkstra
  corridors launched on separated bearings + FEAR containment of idle hunters;
  seed 7 keeps its validated reference lanes). New browser-free harness
  `tools/sweep.mjs` (imports the sim directly, reproduces the exact main-loop
  tick order — verified identical to the Chromium harness on seed 7 commander
  WIN t=175 and idle LOSE food 0). Swept commander over 64 generated seeds
  (1000..1023, 2000..2039). Built `tools/build_whitelist.mjs` to select a
  difficulty-normalized set.
- Observed result (facts, deterministic seeded runs):
  * Winnability by the ceiling bot: **50/64 generated seeds won (78%)**.
    14 (22%) are UNWINNABLE even by perfect play (e.g. seed 1001 stalls at
    882/1200, 1013 at 769, 2037 at 795) — structural fairness does NOT imply
    balance.
  * Difficulty (win-time proxy) among winners spans **143.6s .. 470.1s**
    (~3.3x) — raw generation is NOT difficulty-normalized.
  * Root failure mode found & fixed: on generated maps the old bot marched
    ants through hunters (seed 1000: food 0, 9429 deaths — the colony
    bankrupted itself respawning slaughtered foragers). FEAR walls over idle
    hunters fixed it (seed 1000 -> WIN t=282, 225 deaths).
  * A second dynamic found: LURE decays slowly (~40s half-life) and TRAIL
    self-reinforces, so roads that merge at the nest mouth lock the swarm onto
    one pile and STARVE the others (far pile got 0/700). Launching each road
    on a separated bearing restores concurrent multi-pile harvest.
  * Curated whitelist: `build_whitelist.mjs` scanned 1000..1030 and kept 16
    seeds that the ceiling bot wins in [210,360]s AND idle loses. The kept set
    spans just **212.6s..347.5s (median 281.7s)** — a tight, fair band. The
    [N] "new territory" key now draws from this list (game/js/seeds.js), so
    players never meet an unwinnable or trivially easy generated map.
  * Regressions clean: seed 7 commander byte-identical (WIN t=175, rich 881 /
    far 700 / high 490); falsification harness holds (smart 949 food/1 death
    >> naive 0 food/4446 deaths); single-file dist rebuilt (47.2KB) and runs
    from file://.
- Evidence class: winnability & difficulty numbers = VERIFIED FACT
  (deterministic). "Ceiling bot ~= a strong human's reachable outcome" =
  STRONG PROXY (bot is competent but not provably optimal; a true-optimal
  player might win a few of the 14 "unwinnable" seeds — so 78% is a lower
  bound on winnability). Whether the 281s band feels fun to a human = ASSUMPTION.
- Weaknesses: winnability measured by one bot, not proven-optimal play;
  whitelist is 16 seeds (variety adequate, not huge); generation still emits
  ~22% unfair maps — the whitelist hides them from players but the generator
  itself is not yet balance-aware.
- Action taken: committed bot + harness (3ccac25); whitelist + main.js wiring
  + dist this commit. Next: make the generator itself balance-aware (cheap
  structural proxies) so the whitelist can be larger / on-the-fly.
