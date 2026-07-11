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
session: overnight-2-20260711
last_update_utc: 2026-07-11T03:30:00Z
note: Stage 6 Loop 4 done (map-general commander + difficulty gate + winnability sweep). Loop 5 in progress — render-only juice pass (nest delivery glow, hunter-death bursts). Branch claude/ecstatic-ride-2ijakk (task-scoped, not main).
```
