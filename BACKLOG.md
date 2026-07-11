# BACKLOG

"Now" holds at most five items. Move items between sections instead of
duplicating them. Rejected items keep a one-line reason.

## Now

1. Difficulty normalization (GENERATION side). Sweep proved 87.5% of fair
   maps are bot-winnable but the ~12% losses are tight-margin timeouts and the
   win-time spread is wide (187-479s). Gate generated layouts on a cheap
   winnable-margin heuristic (two lesser piles cleanly reachable AND totalling
   quota + margin), OR wire tools/sweep_winnability.mjs in as an offline
   generation acceptance test. VERIFY with a full re-sweep — must not regress
   seed 7 (commander WIN t≈270).
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
- Bot-side "harvest-first" economy heuristic — regressed the tuned seed 7
  (269s→372s, deaths 430→911) via an on/off mustFight toggle that half-
  commits to assaults. Reverted (DECISION_LOG 2026-07-11). Normalize on the
  generation side instead.
