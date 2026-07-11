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
session: dev-20260711-difficulty-norm
last_update_utc: 2026-07-11T10:05:00Z
note: claiming lock to work on generator difficulty normalization + guard-clearing bot (next actions from HANDOFF); build verified GREEN at claim
```
