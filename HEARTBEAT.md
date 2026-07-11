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
session: dev-ecstatic-ride-20260711
last_update_utc: 2026-07-11T09:10:00Z
note: Loop 4 complete + FINAL MORNING RUN executed (build re-verified fresh post-restart; generated-map media captured; MORNING_REPORT finalized, CONTINUE WITH CONDITIONS). Build GREEN, dist plays from file://. Work on branch claude/ecstatic-ride-h0dy5s; no session active.
```
