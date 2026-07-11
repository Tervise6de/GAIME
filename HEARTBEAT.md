# HEARTBEAT — session lock

Mechanism: see `AUTONOMOUS_STUDIO_PROTOCOL.md` § Session safety. Before any
write, fetch `origin/main` and read this file. If `status: active` from
another session and `last_update_utc` is under 45 minutes old, do read-only
work or exit. To claim: set the fields below, commit and push immediately —
a rejected push means another session holds the lock. Refresh
`last_update_utc` in ongoing commits; set `status: released` in your final
commit. Never force-push.

```
status: active
session: dev-ecstatic-ride-20260711
last_update_utc: 2026-07-11T01:45:00Z
note: Stage 6 Loop 4 — generalizing commander bot to BFS-derived roads; cross-seed winnability sweep. Work on branch claude/ecstatic-ride-h0dy5s.
```
