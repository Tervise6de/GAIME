# RISKS

Live register. Update status as evidence arrives; add game-specific design,
production, market and legal risks as soon as they are known.

| Risk | Class | Severity | Status | Mitigation / test |
|---|---|---|---|---|
| **DEMAND for a weather-forecasting game is UNKNOWN** (near-empty Steam niche cuts both ways) | market | high | **OPEN — top risk** | Real-audience signal needed: capsule + one-line pitch + storm-front clip in front of humans. Cannot be settled by AI. Fallback: pivot to HIVEMIND (evidenced audience). |
| Skill ceiling too shallow — game solved once sensors placed, gets boring | design | high | mitigated | Lead-time probe: skill decays gracefully (+1/+2/+3d) leaving long-range headroom; expert +1d acc a fallible ~91%. Keep testing as sim deepens. |
| Toy single-front sim can't sustain long play / variety | production | medium | open | Deepen sim (evolving/merging fronts, seasons); re-measure skill gap after each change |
| AI judgment gets treated as market validation | process | high | mitigated | Evidence classes enforced in every log/decision; demand explicitly UNKNOWN, never called validation |
| Concept chosen from written analysis alone proves hollow in play | design | high | **closed** | Dual prototypes built; STORMWARDEN's hardest assumption PASSED (BSS +0.628) and placement + lead-time depth verified in play |
| Headless remote environment limits engine choice, running and capture | production | medium | mitigated | Vanilla JS + Canvas 2D builds, runs, is measured and screenshotted here (VERIFIED); revisit at full production |
| Overlapping autonomous sessions make competing writes | process | medium | mitigated | `HEARTBEAT.md` lock; work on a dedicated branch; never force-push; push early and often |
| Unknown-licence or ripped assets contaminate the project | legal | high | mitigated | No third-party assets used (canvas + system fonts only); `THIRD_PARTY_ASSETS.md` entry required before any asset |
| Sessions declare victory early and stop producing | process | medium | mitigated | Protocol enforced: advanced 4b→5→6 with a playable vertical-slice-shaped loop in one run |
