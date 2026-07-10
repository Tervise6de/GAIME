# RISKS

Live register. Update status as evidence arrives; add game-specific design,
production, market and legal risks as soon as they are known.

| Risk | Class | Severity | Status | Mitigation / test |
|---|---|---|---|---|
| AI judgment gets treated as market validation | process | high | open | Evidence classes enforced everywhere; morning report separates proven vs assumed |
| Overlapping autonomous sessions make competing writes | process | medium | mitigated | `HEARTBEAT.md` lock; never force-push; push early and often |
| Headless remote environment limits engine choice, running and capture | production | medium | open | Verify a candidate technology builds AND runs here before adopting it |
| Unknown-licence or ripped assets contaminate the project | legal | high | mitigated | `THIRD_PARTY_ASSETS.md` entry required before any asset is committed |
| Concept chosen from written analysis alone proves hollow in play | design | high | open | Dual prototypes and implementation-evidence comparison (Stages 4–5) |
| Sessions declare victory early and stop producing | process | medium | open | Protocol: one feature/build/playtest ≠ done; continue while runtime remains |
