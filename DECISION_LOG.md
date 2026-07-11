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

## 2026-07-11 — Commander bot dispatch (hand-tuned seed 7 / general elsewhere) + far-guard difficulty gate
- Stage: WINNER_DEVELOPMENT (Loop 4).
- Decision: (a) Split the competence bot: `commanderTuned` keeps the
  hand-authored seed-7 lanes (the regression anchor, WINS t=175), while
  `commanderGeneral` derives roads via Dijkstra for any generated seed.
  (b) Normalize generated-map difficulty with ONE cheap generator constraint:
  reject layouts whose guard sits >1010px from the nest. Do NOT add pincer/
  distance gates, and do NOT keep the fragile bot experiments (progressive
  path-clearing, pincer third-front).
- Alternatives considered: (1) one fully-general bot that also wins seed 7 —
  rejected: the generic router is ~2.5x less road-efficient than the tuned
  lanes on seed 7's far-corner piles, so it lost the anchor on attrition;
  seed 7 is explicitly the handcrafted map, so its hand-tuned solution is
  legitimate. (2) Bot heuristics to win the hard tail (path-clearing, extra
  fronts) — rejected: soldier allocation is shared and capped, so each fix
  destabilised other seeds and even collapsed colonies (seed 1007). (3) A
  structural pincer/distance gate — rejected: validated against the sweep,
  it culls as many winnable maps as unwinnable ones (the bot's concentration
  already handles most pincers). (4) Easing the economy/quota on generated
  maps — rejected as risky late-session balance surgery that could break the
  seed-7 calibration and the lazy-loses signal.
- Evidence class: verified fact (30-seed deterministic sweep: 73%→77% with
  the gate, seed-7 anchor unchanged, idle/naive lose on generated maps,
  40/40 fairness guarantees intact, gate false-positive-free on the sample);
  strong proxy (competent human can win generated maps); the residual ~23%
  is a real balance/AI tail, classified assumption for human winnability.
- Why: preserve the proven anchor exactly; make winnability on arbitrary
  maps DEMONSTRATED (was 0% off seed 7) rather than perfect; take only the
  normalization that evidence shows is free of collateral damage; keep the
  build stable rather than over-fit a fragile bot.
- Reversibility: the seed dispatch and the 1010px cap are one-line reverts;
  the general bot stands alone. Residual-tail work is queued in BACKLOG.
