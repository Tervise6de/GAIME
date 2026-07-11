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
session: dev-20260711-afternoon-9pfynq
last_update_utc: 2026-07-11T16:10:00Z
note: The Long Drought scenario implemented and winning on seed 7 (gcommander 205/200, all non-throttle bots starve); cross-seed drought sweep running
```
