# AUTONOMOUS STUDIO PROTOCOL

Permanent rules for the GAIME experiment. Read the section for the current
stage each session; read the whole file when entering a new stage.

## Mission — highest priority

Find and validate a compelling core game interaction that is:

1. **distinctive** — not a default genre clone;
2. **visually communicable** — a stranger understands the hook from a screenshot or 10-second clip;
3. **capable of supporting a larger Steam game** — depth, content axes, reasons to keep playing;
4. **worth continued investment** — evidence, not enthusiasm, says to continue.

The objective is NOT to ship the smallest finished game. It is to discover
whether a distinctive, compelling, potentially marketable concept exists and
deserves continuing. The finished commercial game may later need human
developers, artists, contractors, financing or a publisher — that is
acceptable. What must be cheap is testing the most important gameplay
assumptions through economical prototypes.

## Non-negotiable rules

1. Do not optimize for making the smallest completed game.
2. Do not select the first technically viable concept.
3. Do not default to a generic survivor-like, roguelite, idle game,
   platformer, card battler, farming game or simple puzzle game.
4. A familiar genre is acceptable only when the player fantasy or core
   interaction is meaningfully distinctive.
5. "Uses AI" is not itself a game concept.
6. Procedural generation is not automatically valuable.
7. Do not confuse documentation with progress. Playable, verified work is progress.
8. Do not claim market validation from AI judgment alone.
9. Separate verified facts, strong proxies, weak proxies, assumptions,
   creative judgments and unknowns (see Evidence classes).
10. Test the hardest important assumption, not merely the easiest attractive feature.
11. Preserve the last known good runnable build (record its commit in `PROJECT_STATE.md`).
12. Keep all third-party asset and dependency licences documented in `THIRD_PARTY_ASSETS.md`.
13. Never use ripped, copyrighted or unknown-licence assets.
14. Do not add secrets, credentials or unrelated services to the repository.
15. Do not ask the founder for normal creative or technical decisions —
    decide, log, proceed.
16. When blocked on one task, continue another independent task.
17. Do not create meaningless filler merely to use tokens.

## Evidence classes

Label every material claim in logs, decisions and reports as one of:

- **VERIFIED FACT** — directly observed here (ran the build, read the output).
- **STRONG PROXY** — solid external evidence (e.g. sustained sales/review data of close comparables).
- **WEAK PROXY** — suggestive signal (trends, anecdotes, single reviews).
- **ASSUMPTION** — believed but untested.
- **CREATIVE JUDGMENT** — taste; owned as taste.
- **UNKNOWN** — flagged, not papered over.

AI judgment about fun or marketability is at best creative judgment — never validation.

## Repository conventions

- `prototypes/<slug>/` — Stage 4 prototypes (both kept; loser is the fallback).
- `game/` — winner development from Stage 6 onward.
- `media/` — screenshots, GIFs, recordings for reports.
- `builds/` — packaged builds, if committing them is sensible; otherwise exact
  reproducible build instructions in `HANDOFF.md` and `MORNING_REPORT.md`.
- Decisions → `DECISION_LOG.md` (append-only). Playtests → `PLAYTEST_LOG.md`
  (append-only). `HANDOFF.md` is overwritten each session. Risks → `RISKS.md`.

## Stage process

Stage codes in parentheses match `PROJECT_STATE.md`.

### Stage 1 — Brief opportunity research (RESEARCH)
Use current public evidence where available: what sells on Steam, where
audiences are underserved, what small teams have recently made work. Classify
everything by evidence class. Research informs decisions but must not consume
more than ~20% of the first autonomous run. Timebox it and move on.

### Stage 2 — Generate concepts (CONCEPTS)
Generate at least 10 meaningfully different PC game concepts in `CONCEPTS.md`.
Evaluate each concisely against all fifteen criteria: player fantasy; core
interaction; intended audience; reason to notice it; reason to buy it; reason
to recommend or stream it; comparable games; differentiation; screenshot and
trailer potential; price and business-model hypothesis; prototype scope;
launch scope; hardest design risk; hardest production risk; cheapest useful
falsification test. Rules 2–6 apply with full force here.

### Stage 3 — Select two finalists (TWO_FINALISTS)
Do not choose the final project from written analysis alone — that is what
Stages 4–5 are for. Choose two substantially different finalists. Preserve at
least one unconventional high-conviction concept even if its conventional
scoring is weaker. Log the selection and reasoning in `DECISION_LOG.md`.

### Stage 4 — Build two competing prototypes (DUAL_PROTOTYPES)
Build a small playable prototype of the central interaction for BOTH
finalists, each under `prototypes/`. Each prototype must test its concept's
hardest important dependency — the thing that, if false, kills the concept.
Do NOT spend time on large menus, accounts, achievements, cloud saves,
Steamworks, large stories or production infrastructure. Choose technology
that can actually be built and exercised in this environment; record build
and run commands in `CLAUDE.md` and `HANDOFF.md`.

### Stage 5 — Compare using implementation evidence (PROTOTYPE_COMPARISON)
Run and inspect both prototypes. Compare: clarity; responsiveness; meaningful
decisions; depth potential; repeatability; visual communication; production
burden; and whether the central promise is actually present in play. Record
observations in `PLAYTEST_LOG.md`, choose one winner, preserve the other as
the fallback, and log the decision with evidence classes.

### Stage 6 — Develop the winner (WINNER_DEVELOPMENT → VERTICAL_SLICE)
Develop the winner in repeated loops:

1. Identify the most important unresolved assumption.
2. Implement the smallest meaningful test of it.
3. Build and run it.
4. Inspect the actual result — never imagine it.
5. Record evidence and weaknesses in `PLAYTEST_LOG.md`.
6. Improve, remove or replace weak work.
7. Commit the verified state.
8. Update `PROJECT_STATE.md` and `BACKLOG.md`.
9. Immediately begin the next valuable task.

One completed task, one prototype, one successful build or three playtests do
NOT mean the session is complete. Continue while meaningful work and runtime
remain. Sustained Stage 6 work matures into a vertical slice
(VERTICAL_SLICE): one polished, representative loop of the real game.

### Stage 7 — Morning assessment (MORNING_ASSESSMENT)
Runs at the end of the overnight run REGARDLESS of the stage reached — the
founder must find a current `MORNING_REPORT.md` in the morning. Prepare:

- a runnable Windows build where feasible; otherwise exact reproducible launch instructions;
- controls;
- at least three gameplay screenshots where possible;
- one image clearly showing the core hook;
- a short recording or GIF where possible;
- explanation of both prototypes and why the winner was selected;
- what was actually proven vs. what remains assumed (evidence classes);
- commercial model and price hypothesis;
- prototype scope versus launch scope;
- likely staffing and production requirements;
- strongest evidence for and against continuing;
- the next validation experiment;
- recommendation: CONTINUE, CONTINUE WITH CONDITIONS, PIVOT or KILL.

The report MUST begin with the line:
"Play or view the build before reading the analysis."

## Session safety

- **Heartbeat lock.** Before any write: `git fetch origin main` and read
  `HEARTBEAT.md` at `origin/main`. If `status: active` from another session
  with `last_update_utc` under 45 minutes old, do read-only analysis or exit —
  no competing writes. Otherwise claim it (status, session id, UTC time),
  commit and push at once; a rejected non-fast-forward push means another
  session is active — fetch and re-check. Refresh the timestamp in ongoing
  commits (~every 30 minutes); set `status: released` in your final commit.
- **Never force-push.** Never rewrite pushed history. Resolve divergence by
  fetching and merging/rebasing local-only work.
- **Checkpoints.** Before risky changes, commit or tag a checkpoint.
- **Recovery.** If the build is broken and cannot be repaired efficiently,
  return to the last known good commit in `PROJECT_STATE.md` (revert or roll
  forward from it — do not rewrite history).
- Push verified work before the session ends; unpushed work does not exist.

## Session end checklist

1. Verified work committed and pushed.
2. `PROJECT_STATE.md` updated (stage, hypothesis, last known good commit, build status).
3. `HANDOFF.md` overwritten with the current snapshot and next three actions.
4. `BACKLOG.md` refreshed ("Now" ≤ 5 items).
5. New decisions in `DECISION_LOG.md`; new observations in `PLAYTEST_LOG.md`; `RISKS.md` current.
6. `HEARTBEAT.md` released.
7. End of overnight run: `MORNING_REPORT.md` rewritten per Stage 7.
