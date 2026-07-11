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

## 2026-07-11 ~13:00 UTC — Guard-clearing (shepherd assault) + brood throttle: 16/16 generated seeds
- Hypothesis / what was tested: (1) the 5/7 "guard never dies" sweep losses
  are a fixable strategy gap; (2) economy-shortfall losses trace to unchecked
  brood spending; (3) static layout features predict per-map difficulty.
- How it was run: iterative bot development with per-change verification
  (tools/run_proto.mjs per seed at fast=40; screenshots to diagnose soldier
  behaviour); three full 16-seed sweeps; seed-7 five-doctrine matrix; UI
  click test (repaired — see below); gen_check 40 seeds; dist rebuild + run.
- Observed results (facts):
  - Static WAR gradients CANNOT transport an army: every stamp center is a
    local field maximum, so soldiers park on the stamps ("beads on a string",
    seen directly in screenshots on seed 1485). A LURE recruit road also
    fails (24 soldiers in 288s) — it loses to TRAIL-reinforced economy roads.
  - A single MOVING WAR peak (erase + re-stamp ~45px along the route per 2s)
    transports the mass reliably: guards die t=34–94s across all seeds.
  - Muster at 140px along the route stalls on maps whose route leg is a
    traffic dead spot (seed 2455: 34 soldiers in 436s); escalating the blob
    to the nest mouth after 15 stalled repaints fixes it (guard dead 94s).
  - Brood throttle (FEAR on nest = hold brood) flips every economy-shortfall
    loss: 1097 (1174→WON, deaths 2460→273), 1291 (never-won→WON t=218),
    2164 (984→WON). Implemented with a "home overrides fear" ring so nest
    FEAR cannot block deliveries.
  - Final sweep: 16/16 WINS (was 9/16 this morning). Win-time spread
    tightened 272–390→161–307s, deaths 231–1294→172–686 WITHOUT generator
    changes.
  - Difficulty-normalization premise FALSIFIED: static features vs outcomes
    best |r|=0.47 (n=14), deaths |r|<=0.23. Task re-scoped to a rejection
    (DECISION_LOG).
  - Regressions: commander seed-7 byte-identical (WON t=175, 679 died,
    matrix five distinct outcomes, dist reaches win card); gen_check 40/40.
  - Found + fixed a silently-vacuous test: click_test_hivemind's first
    mousedown was consumed by the title screen, so it had never painted
    anything since the title was added; it also had no assertions. Now it
    starts the game, paints ~5s, and asserts hint progression + deliveries
    (passes: paint-road → road-continuity → rally, 45 banked).
- Evidence class: VERIFIED FACT for all runs above; 16/16 is a STRONG-PROXY
  LOWER BOUND on winnability by a generic scripted player — NOT proof of
  human winnability or fun. Per-seed outcomes are chaotic in strategy
  details; the robust claim is the union ("each map has an observed winning
  line").
- Weaknesses: brood-throttle thresholds (pop>1400, stores>500) are tuned on
  this seed set; the throttle verb has an onboarding hint but no human has
  seen it; gcommander still loses seed 7 (known source-commitment weakness).
- Action taken: shipped (auto.js shepherd assault + throttle; sim.js brood
  hold + fear-ring; HUD "brood held"; onboarding hint; repaired click test;
  difficulty_probe tool); data table updated; DECISION_LOG entry appended.

## 2026-07-11 ~14:00 UTC — Juice pass, brood ledger, sweep-tool repair; 16/16 reproduced
- Hypothesis / what was tested: feedback effects can ship without touching
  sim determinism; the grow-vs-bank tradeoff can be made legible; the 16/16
  winnability result is reproducible with one command.
- How it was run: forced-death screenshot harness for the burst; realtime
  recording (media/gameplay_commander_seed7.webm re-captured WITH effects);
  full seed-7 matrix + click test + dist run after each change; repaired
  win_sweep.mjs re-run on all 16 reference seeds.
- Observed results (facts):
  - Delivery pulses (gold rings at nest) and hunter death bursts (shockwave
    + sparks) render correctly; zero-asset WebAudio (delivery pops, kill
    thud) is gesture-gated and provably silent/no-op headless.
  - Determinism preserved EXACTLY: commander seed 7 WON t=175 died 679;
    gcommander seed 1873 WON 1201 died 686 t=161 — byte-identical pre/post
    juice AND pre/post brood-ledger.
  - End card now shows "spent on brood N": seed-7 commander ledger reads
    gathered 1566 − brood 396 + 30 initial = 1200 stores exactly.
  - win_sweep.mjs repaired (poll __DONE instead of waitForFunction): full
    sweep completes with NO false timeouts and reproduces **16/16 WINS**
    (stores 1200-1202) in one command. CLAUDE.md caveat replaced.
  - Fresh media: juiced gameplay video, battle stills with pulses visible,
    4-shot assault sequence (muster→march→strike→roads-open) in media/proto/.
    hivemind.gif still pre-juice (no ffmpeg here).
- Evidence class: VERIFIED FACT (all directly observed this session).
- Weaknesses: audio is heard by no one yet (headless env) — synthesis
  parameters are creative judgment pending human ears; GIF stale.
- Action taken: committed juice + ledger + repaired tool; media refreshed.

## 2026-07-11 ~14:45 UTC — Art direction spike (stills quality)
- Hypothesis / what was tested: the "programmer-glow over void" look can be
  upgraded meaningfully with render-only work (no sim impact, no assets).
- How it was run: before/after stills at an identical deterministic moment
  (seed 7, commander, t≈90); iterate on the weakest element; verify with the
  standard battery.
- Observed results (facts):
  - Static world now BAKED into the pre-rendered background: soil mottling,
    grit, pebbles/twigs, craggy irregular rocks (first iteration REJECTED on
    the still — light "potato with seams" look — and re-done darker with
    short shadow chords), grain scatter around piles, nest mound rings,
    vignette. Ant head dots for directionality in stills.
  - Before/after comparison honestly better: ground reads as earth, rocks as
    dark masses, glow layers pop. Generated maps coherent too. 59-60 fps
    unchanged (rocks moved OUT of the per-frame loop).
  - Determinism byte-identical: commander seed 7 WON t=175 died 679. Click
    test PASS; dist 61.3KB reaches win card; media re-recorded (video +
    stills); before-still kept at media/proto/art_before_20260711.png.
- Evidence class: VERIFIED FACT for determinism/fps/tests; the visual
  improvement is CREATIVE JUDGMENT (self-assessed from stills; no human eyes).
- Weaknesses: still zero-asset programmatic art; ant/spider silhouettes and
  palette identity remain; hivemind.gif still pre-juice (no ffmpeg).
- Action taken: committed; art continuation stays on the backlog with the
  remaining scope noted.
