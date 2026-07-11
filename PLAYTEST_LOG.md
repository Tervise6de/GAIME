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

## 2026-07-11 ~02:00 UTC — Stage 6 Loop 4: generated maps proven BEATABLE
- Hypothesis / what was tested: the ASSUMPTION left open by Loop 3 —
  generated territories are not merely structurally FAIR but actually
  WINNABLE by competent play (and still punish weak play). Requires a
  map-agnostic commander bot (the Loop-3 one used seed-7 waypoints).
- How it was run: rebuilt the commander around a hunter-avoiding Dijkstra
  pathfinder over the field grid (game/js/auto.js) — LURE harvest roads to
  unguarded piles + a hybrid LURE-approach / WAR-conversion road that drives
  soldiers into the guard's den. Swept via tools/bot_sweep.mjs across 24
  generated seeds (1000..3231, step 97) at fast=30; weak-play controls
  (naive/idle) on seed 7 + 5 generated seeds; static geometry features
  dumped by tools/gen_stats.mjs and correlated with win-time.
- Observed result (facts):
  (1) WINNABILITY: commander WINS 24/24 generated seeds, winRate 1.0.
      Win-time min 161.5 / median 319.5 / max 472.8 s (limit 480). Seed-7
      regression intact (commander WINS t≈417; slower than the old
      hardcoded t=175 but a clean win).
  (2) DISCRIMINATION: naive and idle LOSE on every tested seed. naive
      collapses the colony (luring straight into guards → 4000-7400 deaths,
      0 stored); idle stores 0-752 of 1200. Maps are neither trivial nor
      unwinnable.
  (3) DIFFICULTY is EMERGENT, not statically predictable: Pearson r of
      win-time vs distSum +0.08, vs distMax -0.07, vs guardTr +0.13 — all
      ~0. Only "route exposure" (how much a pile's straight nest-line
      crosses hunter ground) correlates, and NEGATIVELY (r=-0.45): hunters
      sitting ON the routes make maps EASIER (clearing the mandatory guard
      opens the direct path). So a cheap generation-time difficulty filter
      on geometry is not viable — the reliable difficulty gauge is the
      bot-oracle run offline.
  (4) Engineering notes surfaced along the way (each fixed and re-verified):
      a naive per-call tuple heap caused GC that stalled the page (→ reused
      buffers + parallel-array heap); a huge flat hunter penalty caused
      map-arcing detours that starved far piles (→ tapered penalty + FEAR
      walls); an all-WAR assault road caused a 1266-death meatgrinder on
      seed 1291 (→ WAR confined to the den's conversion zone, ~614 deaths);
      a WAR stub near the den stranded the assault entirely on maps where
      harvest roads out-competed it (seed 1485: guard untouched, lost a
      winnable map → continuous pathfinder-derived assault road).
- Evidence class: VERIFIED FACT for all bot numbers (deterministic seeded
  sims, these seeds). The commander is a STRONG PROXY (upper bound) for
  skilled-human winnability — it proves the maps CAN be won and that doing
  so requires using every verb; it does NOT prove a median human wins, nor
  that the pacing feels fair (CREATIVE JUDGMENT / UNKNOWN — needs humans).
- Weaknesses found: (1) difficulty spread is wide (162-473s) and the hardest
  seed (2067) wins with only ~7s margin — a slightly-worse-than-oracle human
  would lose it; the spread is partly bot inefficiency (high-death seeds),
  not pure map difficulty, so win-time overstates difficulty on those.
  (2) No static difficulty normalizer found; curation needs the offline
  oracle. (3) Human feel still the top unknown, untestable here.
- Action taken: committed the generalized bot (two commits) + bot_sweep.mjs
  + gen_stats.mjs; winnability assumption RESOLVED to VERIFIED-for-bot;
  difficulty-normalization approach reframed (offline oracle, not static
  heuristic) in BACKLOG/DECISION_LOG.
