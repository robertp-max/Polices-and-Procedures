# Build, UAT & Fix — phases 8–12 (from architecture package to working module)

Extends `01-PIPELINE.md`. Input: a completed architecture package (`docs/<ID>-*/` with 00-OVERVIEW + scenes + audits). Output: the module implemented, UAT-verified in a real browser, fixes applied, and a UAT report checked into the package.

Run via the saved workflow `story-module-build` (`.claude/workflows/story-module-build.js`) or `/convert-module <ID> build`.

---

## Phase 8 — Build gate (1 agent + a human decision)

Before writing any code:

1. **Package check** — 00-OVERVIEW exists; scene storyboards exist; no unresolved CRITICAL audit findings.
2. **Stakeholder decisions** — read 00-OVERVIEW's open items + flip-able decisions. Items marked as blocking implementation (e.g. GAO-001's narration-audio and camera decisions) either have answers or the build proceeds on the overview's recommended defaults **with the defaults restated in the final report**. Never silently pick a non-recommended option.
3. **Platform readiness** — verify in code (not from stale recon) whether the platform tickets are landed: scene engine (`useSceneEngine`/`SceneConfig`), the layout template shells this module needs, shared primitives, `SceneRegistry` discriminator, `sceneProgress` persistence, narration manifest support, coverage CI script.
   - **Not landed and `buildPlatform` not requested → STOP.** Platform work is architecture-level (GAO-001 00-OVERVIEW §8.4) and its own review unit. Re-run with `buildPlatform: true` to build it first inside this pipeline.

## Phase 9 — Build

Ordered to keep parallel agents from colliding:

1. **Platform sub-phase (only if gated in; serialized agents, shared files):** engine + types → template shells needed by this module → shared primitives → persistence + registry discriminator → coverage/forbidden-string CI script. Each step type-checks before the next starts.
2. **Per-scene sub-phase (parallel-safe):** one agent per scene creates **new files only** — the scene's `SceneConfig` data module, its narration data module (`narration/<id>.sceneNN.narration.ts` with conceptIds/tiers per the storyboard §9), and its component only if the assigned template genuinely requires bespoke code. Scene agents never edit shared files. Verbatim sentences are copy-pasted from the canonical source string, never retyped.
3. **Integration sub-phase (1 agent, serial):** all shared-file wiring — scene registration, narration manifest keys, exports, and the v6 import path that makes the new code visible to `tsc` (see gotcha below).

**Build rules (binding):**
- Touch nothing on the do-not-touch list: quiz/assessment content, shell behavior (Save & Exit, pills, routing, `handleNext` semantics), Brad (`npm run verify:brad-protection` must stay green if any shared file even looks Brad-adjacent), CES/Evidence/eCign/sign-in/onboarding systems.
- No scene component writes learner acknowledgment state; `onComplete` only (invariants §3).
- **tsc gotcha:** `tsconfig.app.json` only includes `src/v6` + transitive imports — new `src/policy/**` code is invisible to typecheck until integration wires the import. The static gate is meaningless before integration lands.

## Phase 10 — Static verification gate

All must pass before browser UAT (fix inline, up to the fix-round cap):

| Check | Command |
|---|---|
| Typecheck | `npx tsc -p tsconfig.app.json --noEmit` |
| Unit tests | `npm run test` (vitest) — including any new scene/narration tests |
| Lint (scoped) | `npx eslint <new/changed files>` — repo-wide lint is pre-existing red; scope to your files |
| Narration coverage | the coverage CI script (≥90% per scene, verbatim match, forbidden strings) — or a manual grep pass if the script isn't landed, flagged as such |
| Brad protection | `npm run verify:brad-protection` — only if anything Brad-adjacent was touched (it shouldn't be) |

## Phase 11 — two parallel tracks: Browser UAT ∥ Narration audio production

Track A (UAT) drives the browser; Track B (audio) drives the GPU — they share nothing, so they run **at the same time**. Manifest mapping (B3) waits until both finish, so audio wiring never hot-reloads the app mid-UAT.

### Track B — Narration audio: voice-clone generation + mapping

**Standard voice:** the OASIS-E2 training narrator, defined in `scripts/narrationTts/voiceRef.default.json` (currently the 59.8s splash-page narration clip). This is the default for every module — no per-run voice decision needed. Cloning runs in `x_vector_only_mode` (speaker embedding extracted from the audio), so a 40–60s narration clip works well as the reference. To change the standard voice everywhere, edit that one JSON file; to override for a single run, pass `voiceRef: {audio, text?}` (other samples live under `C:\AI\Voice\`).

1. **Export segments** — read the module's narration data modules (built in Phase 9) and emit a segments JSON: `[{id: narrationId, text, language?}]`. Every segment with `transcriptFlag`/audio expectations is included — all four tiers.
2. **Batch voice-clone generation** — run the checked-in script through the TTS venv:
   ```
   C:\AI\qwen3-tts-env\Scripts\python.exe scripts/narrationTts/generate_narration_audio.py
     --manifest <segments.json> --ref-audio <voice sample> --ref-text "<exact transcript>"
     --out-dir <narration asset dir per recon/narration-infrastructure.md> [--ext mp3]
   ```
   One file per narrationId + `generation-results.json` (durations, per-segment errors). Local Qwen3-TTS 12Hz-1.7B-Base model, one load, sequential generation — no cloud, no PHI exposure. (Manual/one-off regeneration alternative: the ComfyUI batch-upload UI at `C:\AI\QWENTTS\ComfyUI_windows_portable` with the ComfyUI-Qwen3-TTS node — same model family; the pipeline itself always uses the script.)
3. **Mapping (after both tracks finish)** — wire every generated file into the narration manifest so `hasNarrationAudio`/`narrationAssetPath` resolve each `audioLocation` key; re-run typecheck. The transcript remains the delivery-of-record fallback (invariants §9.3): a missing/failed audio file must degrade to TTS-preview + transcript, never block progress.
4. **Audio verification** — every narrationId has a file with nonzero duration (from `generation-results.json`); manifest resolves every key; **total narration duration ≥ 30 minutes** summed across all segments (invariants §9.5 — under-floor = MAJOR); **stale-audio check** — every segment's current text still matches what was generated (invariants §9.3); **spot-listen sample** — flag segments whose duration is implausible for their word count (roughly < 1s per 5 words = likely truncation); one browser check that a scene actually plays the cloned audio and the transcript panel matches. Failures become findings (severity per the same classes below) and enter the Phase 12 fix loop — regeneration uses `--only <ids>`.

**Audio production note:** generated audio is the *draft* voice track. The records-defensibility bar (invariants §9.3 — approved script, fixed timing) is met by the versioned narration text + this generated audio pair; stakeholders may later swap in studio-produced files under the same keys without code changes.

### Track A — Browser UAT (serialized — one agent drives the preview at a time)

Environment: `preview_start` with the web config from `.claude/launch.json`; navigate to the module player for `<ID>`. If sign-in blocks access, use the app's dev/demo login; if still blocked, record **UAT-BLOCKED** and stop — never stub auth to get through.

**Per-scene checklist** (one UAT pass per scene, sequential):

- [ ] Scene loads in the workspace slot; zero console errors (`preview_console_logs level=error`)
- [ ] Every node discoverable (visible affordance) and completable; completion reflects true state
- [ ] Every choice node: pick each wrong answer → distinct explanatory feedback (assert exact copy from the storyboard, via `preview_snapshot`, not screenshots)
- [ ] Understanding-gated unlocks actually gate (can't skip via double-click/keyboard)
- [ ] Completion label is the exact safe string; **forbidden-string scan of the rendered DOM** (attest/acknowledg-/sign(ed,off)/certif- word test)
- [ ] Citations render with correct labels (§484.50 vs §484.110 spot check)
- [ ] Verbatim sentences character-exact in rendered Field Notes/narration transcript
- [ ] Resume: complete ~half the nodes, reload (`preview_eval window.location.reload()`), state restores
- [ ] Keyboard-only pass: Tab/Enter/Space through every interaction; modal focus trap; Escape closes
- [ ] Reduced motion (`preview_resize colorScheme` + emulation) and narrow viewport (mobile preset) don't break layout
- [ ] Narration transcript renders verbatim; muting/skipping audio never blocks progress

**Module-level checklist** (once, after all scenes):

- [ ] Full run-through start → "Ready for Post-Test" without dead ends
- [ ] Quiz/assessment untouched: same questions, options, thresholds as the recon inventory
- [ ] Shell intact: Save & Exit, progress pills, routing behave as before the change
- [ ] Both completion stores consistent (training record + journey store — GAO-001 §8.2.6 risk)
- [ ] No learner acknowledgment/attestation state written by any scene (inspect learner state before/after)

**Severity classes:** `BLOCKER` = compliance (forbidden strings, verbatim mismatch, citation mislabel, ack-state write) or module-breaking (can't complete, crash, quiz altered). `MAJOR` = quality-bar failure (no feedback, not resumable, keyboard-inoperable). `MINOR` = polish. UAT findings quote the failing checklist line + observed evidence (snapshot text, console line).

## Phase 12 — Fix loop + report

1. Fixer agent applies fixes for every BLOCKER/MAJOR (root cause in source, never test/checklist edits; failed/truncated audio segments regenerate via `generate_narration_audio.py --only <ids>`) → re-run Phase 10 gate → re-UAT **only the failing scenes** + the module-level pass if anything shared changed → re-verify fixed audio segments.
2. Repeat up to the fix-round cap (default 3). Anything unresolved escalates — listed in the report, never silently dropped.
3. Write `docs/<ID>-*/uat/UAT-REPORT.md`: environment, checklist results per scene, findings table with severities and outcomes (fixed / escalated), audio generation stats (segments, durations, voice ref used, failures), static-gate outputs, and the defaults assumed in Phase 8. Update 00-OVERVIEW's status line (Architecture complete → **Built & UAT-passed** or **Built, N escalations open**).

**Exit criteria:** zero open BLOCKERs, static gate green, every narration segment mapped to playable audio (or explicitly listed as degraded-to-transcript), UAT report checked in, do-not-touch systems verified untouched (`git diff --stat` reviewed against the allowed paths).
