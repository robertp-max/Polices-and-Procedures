---
name: convert-module
description: Convert a training module (e.g. GAO-012) into a story-driven interactive architecture package — and optionally build it, run browser UAT, and apply fixes — using the STORY-MODULE-TEMPLATE pipeline and the saved story-module-architecture / story-module-build workflows. Use when the user asks to convert, storyboard, build, or UAT a catalog module, or invokes /convert-module <MODULE-ID> [build]. The argument is a module id from src/policy/journey/data/modules.ts.
---

# Convert a training module into a story architecture package

The user has opted into multi-agent orchestration by invoking this skill — run the saved Workflow; do not hand-roll agents unless the workflow is missing.

## Arguments

`$ARGUMENTS` = a module id matching `^[A-Z]{2,4}-\d{3}$` (e.g. `GAO-012`), optionally followed by source-hint file paths and/or the word `build`. If no valid module id was given, ask for one — list a few unconverted candidates from `src/policy/journey/data/modules.ts`.

- No `build` keyword → architecture package only (phases 1–7).
- `build` keyword → after the architecture package exists (this run or a prior one), continue into the build/UAT/fix pipeline (phases 8–12) via the `story-module-build` workflow.

## Preflight (do all before launching)

1. Verify the module id exists in `src/policy/journey/data/modules.ts`; capture its row (title, method, policyRefs, cmsRefs, roles).
2. Check `docs/` for an existing package for this module (`docs/<ID>-*/00-OVERVIEW.md`). If one exists, stop and ask whether to redo or resume.
3. Read `docs/Workflows/STORY-MODULE-TEMPLATE/README.md` and `docs/Workflows/STORY-MODULE-TEMPLATE/03-STORY-UNIVERSE.md` (canon is binding; note the module's likely protagonist per the roles field — if it's the first module of a role track, the story-bible agent will be creating a new protagonist and you should flag that in the final report as new canon).
4. Confirm `.claude/workflows/story-module-architecture.js` exists. If missing, follow the manual orchestration spec in `docs/Workflows/STORY-MODULE-TEMPLATE/04-MASTER-PROMPT.md` instead.

## Launch

Run the Workflow tool:

```
Workflow({
  name: 'story-module-architecture',
  args: { moduleId: '<ID>', sourceHints: [<any paths the user gave>] }
})
```

It runs in the background (~45–50 agents for a 9-scene module; recon → design → storyboards+verify → audits → fix → synthesis). While it runs, do nothing else with the package directory.

If the result is `stopped: 'CONTENT_TOO_THIN'`, report that to the user verbatim with the recon summaries and stop — the pipeline never invents curriculum; the module needs source content or a stakeholder decision first.

## After the workflow returns

Execute the result's `housekeepingForMainSession` list yourself:

1. **Append new canon** (`newStoryCanon`, plus a timeline-registry row) to `docs/Workflows/STORY-MODULE-TEMPLATE/03-STORY-UNIVERSE.md`.
2. **Spawn a separate background task** for each entry in `liveDefectsFound` (shipping-code defects are never bundled into the package).
3. **Update project memory**: add/refresh a memory pointing at the new package (pattern: the `gao001-story-architecture` memory).
4. If no subtitle was passed, note that the package folder should be renamed once the story bible's subtitle is ratified.
5. If the run surfaced a pipeline improvement, fold it back into `docs/Workflows/STORY-MODULE-TEMPLATE/` in the same effort.

## Build stage (only when `build` was requested)

After the architecture housekeeping is done (or immediately, if the package already existed):

1. Read `docs/Workflows/STORY-MODULE-TEMPLATE/05-BUILD-UAT.md` — the build/UAT/fix playbook.
2. **Narration voice:** the STANDARD voice (OASIS-E2 training narrator, `scripts/narrationTts/voiceRef.default.json`) is used automatically — do not ask. Only pass `voiceRef: {audio, text?}` if the user explicitly requests a different voice, or `skipAudio: true` if they descope audio.
3. Run `Workflow({name: 'story-module-build', args: {moduleId: '<ID>'}})` (add `packageDir` if the folder was renamed to a subtitle). Audio generation runs in parallel with browser UAT (playbook Phase 11 Tracks A∥B) via `scripts/narrationTts/generate_narration_audio.py` on the local Qwen3-TTS model, cloning the standard voice.
4. Handle the stop outcomes:
   - `PLATFORM_NOT_LANDED` → report the missing platform pieces and ask the user whether to re-run with `buildPlatform: true` (it's a large, review-worthy chunk of engineering) or land the platform separately first.
   - `PACKAGE_NOT_READY` / `STATIC_GATE_RED` / `UAT_BLOCKED` → report the details verbatim; UAT_BLOCKED usually means sign-in/auth — never stub auth to force through.
5. On success, execute `housekeepingForMainSession`: review `git diff --stat` against the do-not-touch list (quiz content, shell behavior, Brad, CES/Evidence/eCign/auth) before any commit — and do not commit unless the user asked; surface escalated UAT findings for human decisions; report audio stats (segments generated, voice used, failures/degraded-to-transcript segments); update project memory with build/UAT status.

## Final report (to the user)

Lead with the package path and 00-OVERVIEW link. Then: scene/concept counts; headline design decisions; audit findings and resolutions; `unresolvedSceneVerifications` (if any — these need human eyes); `flipableDecisions` and `openItems` (these need stakeholder answers); live defects spun off; new canon appended. Close with the recommended next module and a reminder that batching is sequential (canon registry serializes runs).
