# CLAUDE.md — Boot sequence for every session

GAIME is an autonomous overnight experiment: discover, prototype and validate a
distinctive, commercially credible PC game concept for Steam. Sessions are
ephemeral; this repository is the studio's only memory. Full rules live in
`AUTONOMOUS_STUDIO_PROTOCOL.md` — do not copy them here.

## Boot sequence (in order, before any work)

1. Read `PROJECT_STATE.md` — current stage, concept, hypothesis, last known good commit.
2. Read `HANDOFF.md` — what the last session did and the next three actions.
3. Read the section of `AUTONOMOUS_STUDIO_PROTOCOL.md` for the current stage
   (read the whole protocol only when entering a new stage).
4. Run the session-safety check below before any write.
5. Inspect recent commits (`git log --oneline -15`) and the current
   implementation — build and run what exists.
6. Continue from the latest state. Never restart the project or re-litigate
   settled decisions (see `DECISION_LOG.md`).

You do NOT need to read every historical file. State + handoff + the current
protocol stage is enough to begin. Consult the logs only when relevant.

## How to work

- Work on the highest-value unresolved assumption, not the easiest attractive feature.
- Build, run, evaluate and improve actual playable work. Documentation is not progress.
- Record real observed results in `PLAYTEST_LOG.md`; improve or remove weak work.
- Commit verified working states as you go; push before ending. Never end a
  session with unpushed work.
- Before ending: update `PROJECT_STATE.md`, overwrite `HANDOFF.md` (snapshot,
  not history), refresh `BACKLOG.md`, release `HEARTBEAT.md`.
- One completed feature, one green build or a few playtests is NOT session
  completion. Continue while meaningful work and runtime remain.
- Do not ask the founder for normal creative or technical decisions — decide,
  log it in `DECISION_LOG.md`, and proceed. If blocked on one task, continue
  another independent task.

## Session safety (mandatory)

1. `git fetch origin main`, then read `HEARTBEAT.md` as of `origin/main`.
2. If it shows `status: active` from a different session with
   `last_update_utc` under 45 minutes old, another session is likely working:
   do read-only analysis or exit cleanly. Do not make competing writes.
3. Otherwise claim it: set `status: active`, your session id and the current
   UTC time; commit and push immediately. A rejected (non-fast-forward) push
   means another session got there first — fetch and re-check.
4. Refresh the heartbeat timestamp in your ongoing commits (at least every
   ~30 minutes of work). Set `status: released` in your final commit.

- NEVER force-push. Never rewrite pushed history.
- Before risky changes, create a git checkpoint (commit or tag) first.
- If the build breaks and cannot be repaired efficiently, return to the last
  known good commit recorded in `PROJECT_STATE.md`.

## Build & test commands

None yet — no technology has been selected. When it is, record the exact
build / run / test commands HERE and in `HANDOFF.md`, and keep them current.

## File map

| File | Role |
|---|---|
| `PROJECT_STATE.md` | Canonical current state — update every session |
| `HANDOFF.md` | Snapshot for the next session — overwrite every session |
| `BACKLOG.md` | Now / Next / Later / Rejected ("Now" ≤ 5 items) |
| `AUTONOMOUS_STUDIO_PROTOCOL.md` | Permanent rules and the stage process |
| `HEARTBEAT.md` | Session lock — claim before writing, release at end |
| `CONCEPTS.md` | Stage 2 concept evaluations |
| `DECISION_LOG.md` | Append-only decisions with evidence class |
| `PLAYTEST_LOG.md` | Append-only observed playtest results |
| `RISKS.md` | Live risk register |
| `THIRD_PARTY_ASSETS.md` | Licence record — required before committing any asset |
| `MORNING_REPORT.md` | End-of-run report for the founder |
