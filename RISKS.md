# RISKS

Live register. Update status as evidence arrives. Severity: high/med/low.

| Risk | Class | Severity | Status | Mitigation / test |
|---|---|---|---|---|
| Humans bounce off indirect control ("ants won't obey") | design | high | OPEN — top risk | Onboarding built; NEXT: 5-10 human playtests of single-file build; kill-signal defined in MORNING_REPORT |
| Depth claims rest on ONE handcrafted map | design | high | mitigated | Generator has fairness guarantees (40/40) AND is now bot-winnable across seeds: map-general commander wins 23/30 (77%) generated seeds; seed-7 anchor preserved; lazy bots still lose on generated maps |
| ~23% of generated maps are NOT bot-winnable (balance/AI tail) | design | med | OPEN | Residual losers are death-bleed near-misses + specific hard geometry (pincers); no cheap structural gate separates them (validated); options: economy tuning, smarter bot, or accept as difficulty variance — needs human data to prioritise (BACKLOG) |
| AI judgment treated as market validation | process | high | mitigated | Evidence classes enforced; report separates proven vs assumed; no wishlist data claimed |
| Programmer-art ceiling caps marketability | production | med | open | Art-direction spike before any marketing beat (report condition #3) |
| Automatic colony growth removes a core economic choice | design | med | open | Brood throttle verb planned (BACKLOG Now #2); economics quantified in PLAYTEST_LOG |
| Human playtesting impossible from this environment | process | med | open | Founder-run playtests of zero-install build; results feed PLAYTEST_LOG |
| Steam packaging of web tech (wrapper, perf, cert) | production | low-med | open | Known paths (Electron/Tauri/port); decide after playtests pass |
| Overlapping autonomous sessions corrupt state | process | med | mitigated (worked in practice) | HEARTBEAT.md lock; never force-push; push early |
| Unknown-licence assets contaminate project | legal | high | mitigated | Zero third-party runtime assets so far; THIRD_PARTY_ASSETS.md gate stands |
| Concept chosen from analysis alone proves hollow | design | high | CLOSED | Dual prototypes + falsification tests done (Stages 4-5) |
