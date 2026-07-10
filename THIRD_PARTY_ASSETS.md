# THIRD_PARTY_ASSETS

Every third-party asset (art, audio, fonts, models) and every dependency with
licence obligations MUST be recorded here BEFORE it is committed. Never use
ripped, copyrighted or unknown-licence assets. If the licence cannot be
established, the asset does not enter the repository.

| Name | Source | Licence | Attribution requirement | Use in project |
|---|---|---|---|---|
| playwright (npm, dev-only) | npmjs.com | Apache-2.0 | notice retained in package | Headless verification harness only — NOT shipped with the game |
| Chromium + ffmpeg (env-provided) | container image /opt/pw-browsers | BSD-3-Clause / LGPL | n/a (not redistributed) | Running/recording builds during development only |

All game code, art (procedural canvas drawing) and content in
`game/` and `prototypes/` were created in-session from scratch. No
third-party runtime assets exist. Zero fonts, images, audio or code
copied in.
