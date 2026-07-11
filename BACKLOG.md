# BACKLOG

"Now" holds at most five items. Move items between sections instead of
duplicating them. Rejected items keep a one-line reason.

## Now

1. Brood throttle verb (paint the nest: grow vs bank) — player control over
   the growth economy that dominates outcomes. NOTE: changes the economy, so
   it will shift balance — must re-validate the seed whitelist (tools/
   build_whitelist.mjs) and seed-7 quota afterwards. Deferred this session to
   keep the shipped build's balance stable and verified.
2. Second scenario ("The Long Drought") reusing systems, no new tech —
   deepens content/replay beyond one win condition.
3. Grow the curated whitelist as more fair replay maps are needed (the
   generator emits ~22% unfair maps and structural gating proved infeasible,
   so simulation-verified curation is the ONLY fair-map source).
4. Art direction spike (palette, ant silhouettes, terrain) — programmer-glow
   is strong in motion, thin in stills.
5. Founder-facing: arrange 5-10 human playtests of game/dist/HIVEMIND.html
   (measure: season completed ≤3 attempts; all verbs used; voluntary
   restarts; kill-signal: "ants won't obey" quits).

## Next

- Art direction spike (palette, ant silhouettes, terrain texture) — current
  look is programmer-glow; strong in motion, thin in stills.
- Fauna variety: 2-3 non-spider threats/prey with distinct field responses.
- Difficulty curve: scenario parameter sweep via bot matrix (keep commander
  win-time 250-350s per scenario).
- Steam wrapper decision (Electron/Tauri vs engine port) — only after human
  playtests pass.

## Later

- Campaign structure (15-25 scenarios, biomes), sandbox mode.
- Multi-nest play; pheromone verb expansion (harvest priority, brood caste).
- Wishlist/demo funnel experiment (real market data, not proxies).
- STORMWARDEN: if pivot triggered — next step is human tension playtest of
  its daily loop; sky-learnability already proven.

## Rejected

- Building the smallest finished game first — protocol forbids; goal is
  concept validation.
- Choosing winner from written scoring alone — replaced by dual-prototype
  implementation evidence (protocol Stage 5).
- C03 GRAINSIEGE as finalist — hook overlaps Noita's proven ground; kept as
  concept only.
- Time-triggered escalation waves — competent play outruns them; replaced
  by progress-triggered waves (evidence in PLAYTEST_LOG 22:00 entry).
- Cheap gen-time structural balance gate — tested and rejected: simple map
  geometry does NOT predict winnability (PLAYTEST_LOG 2026-07-11 00:25), so
  fair maps must be simulation-verified (the whitelist), not gated at gen time.
- Shipping raw-random "new territory" seeds — 22% are unwinnable even by the
  ceiling bot; [N] now draws from the vetted whitelist instead.
