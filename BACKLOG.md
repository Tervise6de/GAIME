# BACKLOG

"Now" holds at most five items. Move items between sections instead of
duplicating them. Rejected items keep a one-line reason.

## Now

1. Difficulty normalization on the generator: win-times 272-390s and deaths
   231-1294 are too spread (data/winnability_sweep_20260711.md). Add a
   post-gen difficulty estimate (guard distance, pile spread, wave pressure)
   and reject/retune outliers so seeds play in a target band.
2. Stronger guard-clearing for gcommander (sustained rally that actually
   kills a distant guard without abandoning the nest) to raise the 56%
   winnability lower bound — the guard-priority naive attempt failed (death
   explosions), so this needs a smarter multi-front approach.
3. Brood throttle verb (paint the nest: grow vs bank) — player control over
   the growth economy discovered to dominate outcomes in Loop 1.
4. Juice pass: nest delivery pulse, spider death burst, procedural WebAudio;
   re-capture media afterwards.
5. Founder-facing: arrange 5-10 human playtests of game/dist/HIVEMIND.html
   (measure: season completed ≤3 attempts; all verbs used; voluntary
   restarts; kill-signal: "ants won't obey" quits).

## Next

- Second scenario ("The Long Drought") reusing systems, no new tech.
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
