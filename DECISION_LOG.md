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

---

## 2026-07-11 — Commander bot generalized; generated maps 87.5% bot-winnable

- Decision: replace the seed-7-hardcoded commander bot (fixed BOTTOM/TOP lanes
  and literal pile coordinates) with a fully world-derived planner, and adopt
  cross-seed bot-winnability as the balance oracle behind the existing
  structural fairness guarantees.
- What the generalized commander does (all paths derived at runtime):
  * `safeField()` — Dijkstra cost field from the nest that penalizes live
    hunter territory, so harvest roads bend AROUND kill zones (general-map
    equivalent of seed 7's hand-placed edge lanes).
  * `routeDown()` — steepest-descent path extraction from any cost field.
  * `routeBlocker()` — detects a hunter sitting on a pile's route; that pile is
    not roaded until the blocker falls (generalizes "kill the guard first").
  * Assault march routes around bystander hunters (safeField excluding the
    target den); FEAR-walls every live hunter except the one being assaulted.
- Evidence (VERIFIED FACT, this build, scripted bot, deterministic seeds):
  cross-seed sweep seeds 100-123 (24 generated maps), commander vs idle,
  headless. Result: 21/24 WIN (87.5%); idle wins 0/24 (no trivially-winnable
  map). Win-time min 187s / median 314s / max 479s (mean 329s). Seed 7
  regression preserved: commander WINS t=269.6 net 1202, idle LOSES. Artifact:
  tools/sweep_results_seed100-123.json; harness: tools/sweep_winnability.mjs.
- The 3 losses (103/106/110) were all timeouts at net 1000-1180 sharing one
  signature: the rich pile stays contested (original guard + a nearby roamer
  and/or a progress-triggered wave) while the two lesser piles (700+600=1300)
  sit only ~100 above the 1200 quota, so tight-margin harvesting runs out of
  the 480s clock. This is a GENERATION balance gap, not a bot-capability gap —
  the fairness generator guarantees reachability, not winnable margin.
- Rejected this session: a "harvest-first" economy heuristic for the bot
  (only fight for locked piles when clean food < quota need). It fixed one
  loss but REGRESSED the tuned seed 7 (269s→372s, deaths 430→911) because the
  on/off mustFight toggle made the bot half-commit to assaults. Reverted.
- Evidence class: winnability rate and win-times VERIFIED FACT (scripted bot,
  not human). "Bot-winnable" is a STRONG PROXY for "human-winnable with
  skill", not proof of fun or of human completion.
- Next (normalization, not done this session — needs a full re-sweep budget to
  verify without regressing seed 7): gate generated layouts on a cheap
  winnable-margin heuristic (guarantee two lesser piles are cleanly reachable
  and total the quota with margin), or run this sweep as an offline generation
  acceptance test and reject the ~12% hardest seeds.
