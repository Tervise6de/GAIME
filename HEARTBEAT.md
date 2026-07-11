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
session: dev-20260711-fok54l
last_update_utc: 2026-07-11T13:05:00Z
note: guard-clearing done — gcommander 56%→85% over the full 40-seed set (3 verified iterations), honest docs, media, gen_difficulty tool; build GREEN, baseline untouched; no session active
```
