# HANDOFF — snapshot for the next session

Overwrite this ENTIRE file at the end of every session. It is a replaceable
snapshot, not an accumulating history — history lives in git.

- **Working branch:** `claude/ecstatic-ride-acanj0` (this session pushed here,
  not main — per the session's branch directive). Latest good commit is its
  HEAD (Loop 5, juice).
- **Current stage:** WINNER_DEVELOPMENT (loops 1-5 done). The overnight-1
  MORNING_REPORT was refreshed this session with the winnability evidence.
- **Active hypothesis:** humans can learn and enjoy the painting verb.
  Scripted play now proves BOTH depth (skill gradient) AND winnability
  (oracle beats 56/60 seeds). Human feel remains THE open question (blocked:
  no human testing from this environment).
- **What changed this session (overnight-2):**
  1. Generalized the `commander` bot into a layout-agnostic winnability ORACLE
     (SPFA cost-field from nest penalizing hunter ground → string-pulled LURE
     roads to every un-guarded pile; WAR band that tracks the wandering guard,
     re-planned every 120 ticks; FEAR walls protect supply lines). Replaced the
     seed-7-hardcoded paths.
  2. `tools/win_sweep.mjs` — cross-seed winnability harness. FINDING (VERIFIED
     FACT): fairness ≠ winnability. Oracle wins 56/60 seeds 1-60; the ~7% tail
     (3,36,55,60) is fair-but-unwinnable and NO cheap structural proxy (guard
     distance, pile distance, corridor sealing) separated it from winners.
  3. Therefore `game/js/seeds.js` — the N ("New Territory") key now draws only
     from a SIM-CERTIFIED pool (56 seeds), so players never load a broken map.
  4. Bot tuning also cut deaths hard (seed 24: 1348→316) and sped wins
     (avg 286→251s). Onboarding marker/text now map-agnostic (was seed-7).
  5. Loop 5 juice: nest delivery glow + spider-death burst — balance-neutral
     (sim writes fx/nestPulse; nothing reads them back). Plus procedural
     WebAudio (game/js/audio.js): synthesized harvest ticks, death crunch,
     win/lose stings. Gated to a real click gesture, so bots/headless stay
     silent; unheard in this env (runs-clean verified, pleasant assumed).
- **Build status:** GREEN. Seed-7 commander WINS t=305 (deterministic);
  juice verified identical win pre/post; dist `game/dist/HIVEMIND.html` (50KB)
  verified WIN from file://; click test exit 0.
- **Next three actions (highest value first):**
  1. Difficulty normalization across the certified pool (win-times 148-466s →
     aim ~250-330s), then re-run `win_sweep.mjs` and re-certify `seeds.js`.
  2. Brood-throttle verb (grow-vs-bank) for economic depth — then re-certify
     (it changes the economy the pool was certified against).
  3. Audio polish: the procedural WebAudio base shipped (audio.js); a human
     with sound should sanity-check it's pleasant (unheard from this env) and
     add ambience/mix if wanted.
- **CRITICAL maintenance rule:** `game/js/seeds.js` is only valid for the
  CURRENT generator + bot. After ANY change to world generation, the commander
  bot, or the economy, regenerate it:
  `node tools/win_sweep.mjs --seeds 1-60 --auto commander --fast 40`
  and paste the CERTIFIED line into seeds.js.
- **Exact build/run commands:** CLAUDE.md "Build & test commands". Quick
  balance re-verify after a sim change:
  `for s in commander idle; do node tools/run_proto.mjs "http://localhost:8123/game/index.html?seed=7&auto=$s&fast=12" --max 320; done`
  → commander WIN (~t=305), idle lose. Cross-seed: `node tools/win_sweep.mjs
  --seeds 1-30 --auto commander --fast 40`.
