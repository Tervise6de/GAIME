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

## 2026-07-10 — Prototype winner: STORMWARDEN (C02); HIVEMIND (C01) fallback
- Stage: PROTOTYPE_COMPARISON (Stage 5)
- Decision: Select C02 STORMWARDEN as the winner to develop in Stage 6.
  Preserve C01 HIVEMIND as the fallback (kept runnable at prototypes/hivemind,
  last exercised @ c7f1bca).
- Alternatives considered: continue HIVEMIND (better-evidenced audience,
  higher visual/responsiveness ceiling). Rejected as the winner — not on taste
  but on implementation evidence: HIVEMIND's pre-registered falsification test
  FAILED on its own metric and its verb only showed value after an in-run
  economy reframing, with a naive strategy still competitive; STORMWARDEN's
  hardest-assumption test PASSED cleanly and decisively (Brier Skill Score
  +0.628, +25pts accuracy vs the persistence null, 5 seeds, no redefinition),
  with the skill landing exactly on the storm-warning stakes.
- Evidence class: prototype comparison numbers are VERIFIED FACT (ran both).
  HIVEMIND's audience advantage is a STRONG PROXY (EotU sales/reviews), NOT
  validation of THIS game. STORMWARDEN's market demand is UNKNOWN. The winner
  choice itself is CREATIVE JUDGMENT constrained by the Stage-5 criteria, which
  weight "is the central promise present in play" — where STORMWARDEN is ahead.
- Why: Stage 5 selects on implementation evidence and the eight prototype
  criteria (promise-in-play, meaningful decisions, clarity, depth, repeatability,
  visual communication, production burden). STORMWARDEN leads five, HIVEMIND two,
  one even. Lower production/technical risk and a sharper one-line hook
  ("Papers, Please but you're a frontier weather forecaster") reinforce it.
- Reversibility / exit condition: STORMWARDEN's dominant unresolved risk is
  DEMAND (unknown), not the core loop. If a cheap real-audience demand signal
  (Steam capsule / wishlist / short clip test with actual humans) comes back
  weak, PIVOT to the preserved HIVEMIND, whose audience is already evidenced.
  Secondary exit: if Stage-6 work cannot keep expert play fallible (skill
  ceiling proves too shallow once sensors are placed), reassess.

## 2026-07-10 — Stage 6: sensor placement is the core decision (scarce budget)
- Stage: WINNER_DEVELOPMENT
- Decision: Promote "where to place a limited sensor budget" to STORMWARDEN's
  central player decision. Sensors are scarce and mis-placeable; a sensor off
  the incoming streamline reports the wrong airmass or nothing useful, forcing
  a fall back to the barometer alone. The player places sensors, then forecasts.
- Alternatives considered: keep the Stage-4b fixed ideal lookouts (rejected —
  removes the actual decision and leaves accuracy implausibly high); make
  sensors free/unlimited (rejected — no tradeoff, no metagame).
- Evidence class: VERIFIED FACT — skilled placement beats naive by BSS +0.453 /
  +14.3 pts accuracy (5 seeds); an emergent lead-time-vs-meander-coverage
  tradeoff exists (`spread` ≈ `upwindLine`). See PLAYTEST_LOG 2026-07-10 ~20:45.
- Why: it makes the promised verb real and playable, creates a genuine skill
  gap (novice on-town 77% → expert upwind 91%), and pulls expert accuracy into
  a fallible band, addressing the "too easy" risk surfaced at Stage 4b.
- Reversibility / exit condition: if a scarce-budget economy plus deeper sims
  cannot keep expert play fallible and the placement metagame non-trivial,
  reconsider the loop. Independent of the still-open DEMAND risk.
