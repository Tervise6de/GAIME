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

## 2026-07-11 — Certify New-Territory winnability by simulation, not structure
- Decision: the human-facing "New Territory" (N key) draws from a pool of
  SIM-CERTIFIED seeds (`game/js/seeds.js`), not a blind random seed. A seed is
  certified iff the generalized commander oracle actually WINS it in
  `tools/win_sweep.mjs` on the current build.
- Context / evidence (VERIFIED FACT): the Loop-3 fairness guarantees
  (reachability, lesser piles outside hunter ground, nest not buried) do NOT
  imply winnability. Across seeds 1-60 the oracle won 56/60 (~93%); the tail
  (3, 36, 55, 60) is fair yet unwinnable.
- Why not a cheap structural generation gate: I tried to find one. None of the
  structural proxies measured — guard distance from nest (loss seed-3 721px is
  LESS than winning seed-19's 1083px), max pile distance, or non-guard-hunter
  sealing of the nest->pile corridor (winners seal MORE than the loss) —
  separated unwinnable maps from winnable ones. Winnability here is emergent
  and only a simulation reveals it, so a blind gate would either pass bad maps
  or reject good ones.
- Cost / reversibility: the certified list is valid only for the current
  generator + bot; it must be regenerated (one sweep command, documented in
  seeds.js) after any change to either. Arbitrary ?seed= URLs are still
  ungated (acceptable: that path is for devs/testing, not the shipped button).
- Follow-ups: normalize difficulty across the pool (oracle win-times span
  148-466s); optionally grow the pool; a real in-generation winnability
  estimator remains open research (would need a fast sim-lite proxy).

## 2026-07-11 — Defer the brood-throttle verb (not start it this session)
- Decision: do NOT begin the brood-throttle ("grow vs bank") economy verb in
  overnight-2, despite it being the top remaining depth lever (BACKLOG Now #2).
- Reasoning: (1) it changes the core spawn/food economy, which would
  invalidate the 95-seed winnability certification just established — every
  change needs a full re-sweep + re-certify (~30+ min) to restore a trustworthy
  pool; (2) its actual value is the FELT quality of the grow-vs-bank tradeoff,
  which is human-dependent and cannot be validated in this environment; (3)
  starting it with uncertain remaining runtime risks ending on an unbalanced,
  uncertified, half-built state — worse than a clean verified milestone.
- What was done instead (all certification-neutral, fully verified): widened
  winnability evidence to 95/100 and grew the certified/CORE pools; shipped the
  juice + procedural audio + mute; refreshed report media; polished the title
  controls. All green, all pushed.
- Next session: implement brood-throttle ADDITIVELY (default-off so the bot —
  and thus certification — is unaffected unless a human uses it), then re-run
  win_sweep and re-certify seeds.js. Keep base economy untouched.
