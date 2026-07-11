# DECISION_LOG

Append-only. Newest entry at the bottom. Never rewrite past entries — if a
decision is reversed, append a new entry that supersedes it.

Entry template:

```
## [YYYY-MM-DD UTC] — [decision title]
- Stage:
- Decision:
- Alternatives considered:
- Evidence class: (verified fact / strong proxy / weak proxy / assumption / creative judgment / unknown)
- Why:
- Reversibility / exit condition:
```

---

## 2026-07-10 — Repository operating system established
- Stage: SETUP_COMPLETE
- Decision: Adopt this repository-state operating system — CLAUDE.md boot
  sequence, permanent protocol, PROJECT_STATE/HANDOFF/BACKLOG, append-only
  decision and playtest logs, risk register, licence register, heartbeat
  session lock. No game-related decisions were made in setup.
- Alternatives considered: external trackers or wikis (rejected — sessions
  are ephemeral and the repository is the only durable shared memory).
- Evidence class: creative judgment
- Why: fresh autonomous sessions must be able to resume from repository
  state alone, without human briefing.
- Reversibility / exit condition: process files may be amended by future
  sessions when evidence shows a better process; the protocol's
  non-negotiable rules are permanent.

## 2026-07-10 — Finalists selected: HIVEMIND (C01) and STORMWARDEN (C02)
- Stage: TWO_FINALISTS
- Decision: Prototype C01 HIVEMIND (indirect pheromone-painting swarm
  command) and C02 STORMWARDEN (systemic frontier weather-forecasting
  expertise sim). Preserve C03 GRAINSIEGE as noted runner-up in BACKLOG.
- Alternatives considered: 12-concept slate in CONCEPTS.md; C03 GRAINSIEGE
  scored close to C01 but shares its "simulated world" hook with Noita's
  proven territory (weaker differentiation); C12 MIDNIGHT ZONING strong
  premise but prototype cannot cheaply test its hardest risk (two coupled
  full sims needed before the tradeoff question is even askable).
- Evidence class: market scan findings are STRONG/WEAK PROXIES as labelled
  in CONCEPTS.md; the selection itself is CREATIVE JUDGMENT constrained by
  those proxies. Explicitly NOT market validation.
- Why: A = best evidence-backed audience + most visually communicable +
  new verb in a proven fantasy. B = protocol-mandated unconventional
  high-conviction preserve: empty niche, one-line pitch, structural
  comparable (Papers Please) is a multi-million seller. The two differ in
  fantasy, verb, pacing and audience, maximizing information from the
  dual-prototype comparison.
- Reversibility / exit condition: Stage 5 comparison on implementation
  evidence; loser preserved as fallback; both can lose to C03 if both
  falsification tests fail.

## 2026-07-10 — Prototype technology: vanilla JS + Canvas 2D, zero runtime deps
- Stage: TWO_FINALISTS → DUAL_PROTOTYPES
- Decision: Prototypes are plain HTML + ES-module JavaScript + Canvas 2D.
  No engine, no bundler, no runtime dependencies. Dev-only tooling:
  Playwright (already provisioned in the environment) for automated
  running, measurement, screenshots and input simulation; Python http.server
  for serving. Winner may later migrate if evidence demands.
- Alternatives considered: Godot (cannot render headlessly here — cannot
  inspect actual behaviour, violating the run-and-verify loop); Phaser/PixiJS
  (adds licence/dependency surface for little prototype gain); native
  (no Windows build possible from this container, poor verifiability).
- Evidence class: environment capabilities VERIFIED FACT (Chromium +
  Playwright + ffmpeg present, checked); "web tech is Steam-credible for 2D"
  STRONG PROXY (Vampire Survivors/CrossCode shipped web-tech-based).
- Why: only stack in this environment where the studio can BUILD, RUN,
  MEASURE and SCREENSHOT real behaviour — the protocol's core loop.
- Reversibility: prototypes are disposable by design; tech re-evaluated at
  WINNER_DEVELOPMENT and VERTICAL_SLICE.

## 2026-07-10 — Stage 5 winner: HIVEMIND. Fallback: STORMWARDEN.
- Stage: PROTOTYPE_COMPARISON → WINNER_DEVELOPMENT
- Decision: Develop HIVEMIND. Preserve STORMWARDEN untouched under
  prototypes/ as the fallback.
- Comparison on the eight protocol criteria (evidence in PLAYTEST_LOG):
  * Clarity: SW higher for the loop; HM moderate (fields need teaching) —
    tractable design work.
  * Responsiveness: HM real-time, paint→response in seconds, 60fps at 3200
    agents (VERIFIED); SW day-based by design (not a defect, but lower
    kinetic energy).
  * Meaningful decisions: HM verified via economy runs (route risk vs
    distance vs clearing threats; 471 vs 0 net stock between strategies);
    SW verified skill gradient but small per-day decision space (2 calls +
    confidence).
  * Depth potential: HM strong (verb composition demonstrated; castes,
    enemies, terrain, multi-nest all natural); SW real but narrower (its
    best axis — building the observation network — was discovered in
    prototyping and is genuinely good).
  * Repeatability: HM scenario/seed variety; SW risks daily sameness.
  * Visual communication: HM excellent (hm_battle.png IS the pitch); SW
    handsome but static.
  * Production burden: SW lowest; HM moderate (emergent art, no character
    animation; content = scenario design).
  * Central promise present: HM yes in play (paint intent → thousands
    comply → consequences emerge); SW skill is real (proven) but mortal
    stakes are text so promise is partial.
- Market proxies (Stage 1): colony-swarm fantasy has proven loyal audience
  (EotU 16.8k reviews 94%+); 2025 breakouts spread through clip-able
  kinetic moments — HM generates them, SW does not.
- Evidence class: measurements VERIFIED FACT; audience mapping STRONG
  PROXY; "which is more fun" remains CREATIVE JUDGMENT — mitigated by
  choosing the one whose remaining risks (readability, painting UX) are
  fixable by design rather than dependent on unproven human tension.
- Why not SW: its residual risk (is daily judgment tense or tedious?) is
  human-dependent and cannot be reduced further in this environment, while
  HM's residual risks can be worked tonight.
- Reversibility / exit condition: SW fallback stays runnable; pivot if HM
  onboarding/readability work fails to make scripted-novice completion
  possible, or morning verdict rejects it.

## 2026-07-11 — Generalized bot (gcommander) added; winnability is a proven lower bound, not settled
- Stage: WINNER_DEVELOPMENT (Stage 6)
- Decision: Ship a generalized, map-driven commander (`gcommander`) as a
  SEPARATE strategy and keep the hand-tuned `commander` untouched as the seed-7
  balance baseline. Treat the cross-seed sweep as a difficulty/winnability
  PROXY, not proof. Keep difficulty normalization and a stronger guard-clearing
  bot on the backlog.
- Alternatives considered: (a) generalize `commander` in place — REJECTED, it
  would destroy the verified seed-7 baseline and all scripted-doctrine evidence;
  (b) add a guard-priority heuristic to raise win-rate — TRIED and REJECTED, it
  caused death explosions (seed 1000 win→loss, 433→2825 deaths) and lowered
  win-rate to 8/16; (c) keep tuning gcommander to win seed 7 — REJECTED as
  overfitting to one map with diminishing returns.
- Evidence class: VERIFIED FACT (9/16 generated-map wins; baseline commander
  still wins seed 7 at t=175; 5/7 losses are rich:0% guard-not-cleared). The
  winnability conclusion is a STRONG-PROXY LOWER BOUND — generated maps are
  broadly winnable by a generic player and their losses trace to a fixable
  strategy gap, not structural unfairness. Human winnability remains UNKNOWN.
- Why: converts "generated maps are winnable" from ASSUMPTION to a measured
  lower bound, and surfaces two concrete, honest gaps (guard-clearing AI;
  difficulty variance) instead of papering over them.
- Reversibility / exit condition: gcommander is additive and isolated; if a
  formal difficulty-normalization pass or a stronger bot supersedes this
  measurement, append a new entry. Baseline commander and both prototypes
  remain the last known good runnable references.

## 2026-07-11 — Shepherd assault + brood throttle; static difficulty normalization REJECTED on evidence
- Stage: WINNER_DEVELOPMENT (Stage 6)
- Decision: (1) Give gcommander a muster→march→strike guard assault built on a
  single MOVING WAR peak (a "shepherd blob" erased and re-stamped ~45px along
  the safe route each repaint) instead of any static painted gradient. (2) Add
  a brood-throttle verb: FEAR painted over the nest holds the brood (with a
  "home overrides fear" ring so returners still deliver); gcommander banks once
  pop>1400 and stores>500. (3) REJECT the planned static difficulty
  normalization pass: measured correlations between static layout features and
  observed difficulty are too weak to build on (best |r|=0.47 totalDetour vs
  win-time, n=14; deaths correlate with nothing, |r|<=0.23).
- Alternatives considered: (a) static WAR gradient ramps for the assault —
  TRIED and REJECTED: every stamp is a local WAR maximum, so soldiers park on
  the stamps like beads on a string (observed via screenshots, seed 1485);
  (b) LURE recruit road to a staging pool — TRIED and REJECTED: it loses to
  TRAIL-reinforced economy roads (24 soldiers in 288s); (c) generator
  reject/retune band on path/detour features — REJECTED as machinery on an
  unsupported assumption; difficulty spread is driven by dynamics (wave
  placement vs roads), not static geometry.
- Evidence class: VERIFIED FACT for all bot results (each run observed);
  the win-rate remains a STRONG-PROXY LOWER BOUND on winnability, silent on
  human play. The normalization rejection is a MEASURED NEGATIVE RESULT
  (n=14-16, weak correlations), not proof no such estimator exists.
- Why: the three mechanisms address every observed loss mode — guards now die
  (t=34-92s across seeds), muster stalls escalate to the nest mouth, and
  economy shortfalls (e.g. seed 1097: all piles drained yet lost 1174/1200
  after 2460 deaths' respawn costs) flip to wins via banking. Brood throttle
  is also a PLAYER verb: it makes grow-vs-bank an expressible decision that
  Loop 1 showed dominates outcomes.
- Reversibility / exit condition: all changes additive (sim: 2 small guarded
  edits; commander baseline re-verified byte-identical — WON seed 7 t=175,
  679 died). If a future difficulty estimator shows real predictive power,
  supersede the rejection with a new entry.

## 2026-07-11 — Second scenario is an ENDURANCE inversion ("The Long Drought"); brood release semantics changed to pause-the-clock

- Stage: 6 (WINNER_DEVELOPMENT / vertical slice)
- Decision: (1) The second scenario inverts the goal structure rather than
  re-skinning the quota: survive to the returning rains (t=420) with a
  200-store reserve while piles evaporate (0.8/s each) and every ant eats
  upkeep (0.004/s, ramping in over 90s as the drought deepens). Hunters
  arrive when piles dry to dust. Scenario layer only — zero new sim tech.
  (2) Waves in the drought trigger on pile-death, not the clock: aggressive
  harvest dries piles sooner, so success still summons the hunters (the
  2026-07-10 rejection of time-triggered waves is about outrunnable clocks
  in a race goal; a fixed-duration endurance cannot be outrun, and
  pile-death timing stays coupled to player action). (3) Holding brood
  PAUSES the sim growth clock instead of banking a deficit — releasing a
  long hold no longer spawns a catch-up burst (measured: ~1600 ants in one
  tick, instant starvation). Never-held runs are bit-for-bit unchanged.
  (4) Scenario selection via ?scn= + title-screen [S]; upkeep ramp
  (90s) exists because the forced early growth curve starved EVERY strategy
  by t≈60 under flat upkeep (measured).
- Alternatives considered: (a) drought as "gather quota with shrinking
  piles" — rejected: same goal shape as First Season, proves nothing about
  generalization; (b) flat upkeep from t=0 — TRIED and REJECTED on
  measurement (universal starvation before any economy exists); (c) letting
  the growth-deficit catch-up burst stand as "realistic brood explosion" —
  rejected: it punishes exactly the verb the game teaches, invisibly;
  (d) requiring only stock>0 at the rains (no reserve) — rejected: lean
  coasting trivializes the endgame; the reserve makes the final 100s a real
  budget question.
- Evidence class: bot results VERIFIED FACT (see PLAYTEST_LOG 16:20);
  scenario tuning numbers are BALANCE JUDGMENT anchored to a strong-proxy
  lower bound (gcommander 16/16 + seed 7, all non-throttle bots starve);
  human fun/readability of the drought is UNKNOWN.
- Why: the studio's top unresolved UNBLOCKED assumption was "the systems
  generalize beyond one goal structure". The strongest possible cheap test
  is a goal that makes the previous champion strategy LOSE — commander
  (First Season winner) starving at t=221 with 2462 ants is that proof.
- Reversibility / exit condition: the scenario is additive (?scn= gated,
  default unchanged). If human playtests show the drought reads as
  bookkeeping rather than tension, retune upkeep/evap or demote it to a
  campaign-later slot; the growth-clock pause stays regardless (it fixes a
  real landmine in both scenarios).
