# GAIME — autonomous game studio experiment

GAIME is an experiment in autonomous game development: fresh Claude Code
sessions run overnight to discover, compare, prototype and begin developing a
commercially credible PC game intended for Steam. The goal is not to ship the
smallest finished game — it is to find out whether a distinctive, compelling,
potentially marketable concept exists and deserves continued investment.

## How it works

Sessions are ephemeral; this repository is the studio's only memory. Every
fresh session boots from `CLAUDE.md`, reads `PROJECT_STATE.md` and
`HANDOFF.md`, follows the current stage of `AUTONOMOUS_STUDIO_PROTOCOL.md`,
and continues from the latest pushed state instead of restarting. Overlapping
sessions coordinate through the `HEARTBEAT.md` lock.

## Where to look

- **`MORNING_REPORT.md`** — the latest end-of-run report; it starts with how
  to play or view the current build.
- **`HANDOFF.md`** — current snapshot, next actions and exact build/run commands.
- **`PROJECT_STATE.md`** — current stage and status at a glance.
- **`prototypes/` and `game/`** — playable work, once development begins.

## Status

Experimental. Everything here — including the game concept itself — can be
pivoted or killed based on evidence. Nothing in this repository is production
software, and the project may end at any stage with a KILL recommendation.
