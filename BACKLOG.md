# BACKLOG

"Now" holds at most five items. Move items between sections instead of
duplicating them. Rejected items keep a one-line reason.

## Now

1. Difficulty normalization: the general bot wins 42/48 generated seeds
   (Loop 4, 87.5%) but loses 6 (12, 18, 27, 31, 46, 48). ROOT CAUSE
   (geometry analysis of the near-misses): a lesser pile placed very far
   from the nest (high=944px on s12, far=919px on s18, vs typical ≤820)
   whose route is ALSO spider-blocked — the colony stays healthy but banks
   the last pile too slowly and the winter clock (480s) runs out. 5 of 6 are
   time-outs, not collapses; seed 31 (274/1200) is a distinct opening-stall
   worth its own look. Cheapest fix: cap max pile→nest path length in
   generatedLayout
   (world.js) to ~880px (winners reach 910 clear, so gate on distance AND
   route-clearance, not distance alone), then RE-SWEEP 2-25 — changing the
   accept criteria remaps every seed's layout, so re-verify winnability and
   the seed-7 exemption still holds. Keep commander win-time 250-350s.
2. Brood throttle verb (paint the nest: grow vs bank) — player control over
   the growth economy discovered to dominate outcomes in Loop 1.
3. Juice pass: nest delivery pulse, spider death burst, procedural WebAudio;
   re-capture media afterwards.
4. Second scenario ("The Long Drought") reusing systems, no new tech.
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
