# HEARTBEAT — session lock

Mechanism: see `AUTONOMOUS_STUDIO_PROTOCOL.md` § Session safety. Before any
write, fetch `origin/main` and read this file. If `status: active` from
another session and `last_update_utc` is under 45 minutes old, do read-only
work or exit. To claim: set the fields below, commit and push immediately —
a rejected push means another session holds the lock. Refresh
`last_update_utc` in ongoing commits; set `status: released` in your final
commit. Never force-push.

```
status: released
session: morning-20260711-ecstatic-ride
last_update_utc: 2026-07-11T05:25:00Z
note: Loop 4 + 48-seed winnability sample (42/48=87.5%) done; morning report refreshed with honest figure; failure geometry characterized for next session. Work on branch claude/ecstatic-ride-9oqbd4; no session active
```
