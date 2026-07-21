# Master Prompt — one-message orchestration kickoff

Three ways to launch a conversion, best first:

1. **Slash command (recommended):** type `/convert-module GAO-012` in Claude Code. Zero pasting; the skill does preflight, runs the saved workflow, and does the housekeeping.
2. **Saved workflow directly:** ask any Claude Code session to run `Workflow({name: 'story-module-architecture', args: {moduleId: 'GAO-012'}})`.
3. **The master prompt below:** paste into a fresh Claude Code session opened at this repo. Self-contained — works even if the saved workflow or skill is missing, because it carries the full orchestration spec.

Fill the two `{PLACEHOLDERS}`, paste, send.

---

## THE MASTER PROMPT (copy everything between the lines)

```text
ultracode

Convert training module {MODULE_ID} into a story-driven interactive architecture
package, exactly following the repo's template system. {OPTIONAL_SOURCE_HINTS}

AUTHORITY DOCUMENTS (read before orchestrating, in this order):
1. docs/Workflows/STORY-MODULE-TEMPLATE/README.md          — parameterization + what never changes
2. docs/Workflows/STORY-MODULE-TEMPLATE/01-PIPELINE.md     — the 7 phases you will execute
3. docs/Workflows/STORY-MODULE-TEMPLATE/02-UNIVERSAL-INVARIANTS.md — binding rules for every agent
4. docs/Workflows/STORY-MODULE-TEMPLATE/03-STORY-UNIVERSE.md — established story canon (binding)
The worked exemplar for every document type is docs/GAO-001-A-New-Journey/.

EXECUTION:
If .claude/workflows/story-module-architecture.js exists, run it via the Workflow
tool with args {"moduleId": "{MODULE_ID}"} and skip to REPORTING. Otherwise
orchestrate the phases yourself per the spec below.

ORCHESTRATION SPEC (matches the saved workflow — use it verbatim if hand-rolling):
- All subagents on budget models: sonnet for substantive work, haiku for
  mechanical string scans. Never the orchestrator's model on subagents.
- Every agent's prompt must require reading: the invariants file, its skeleton in
  docs/Workflows/STORY-MODULE-TEMPLATE/skeletons/, its GAO-001 exemplar, and the {MODULE_ID}
  catalog row in src/policy/journey/data/modules.ts.
- Package output dir: docs/{MODULE_ID}-story-architecture/ (renamed to the story
  subtitle later).

Phase 1 — RECON, 4 sonnet agents in parallel (content-inventory, shell-integration,
  engine-patterns, narration-infrastructure), each writing its recon/ doc.
  HARD GATE: if content richness = thin, STOP and report — never invent curriculum.
Phase 2 — DESIGN, 5 sonnet agents in parallel (story-bible, ux-architecture,
  narration-system, compliance-framework, learning-framework), each writing its
  design/ doc. Then 1 consistency-gate agent cross-reads all five for
  contradictions; 1 reconcile agent fixes any (recon inventory is ground truth).
Phase 3 — STORYBOARDS, pipeline per scene (N = source page count, 1:1, from recon):
  1 sonnet author writes scenes/scene-NN-<slug>.md (12 sections, REAL draft copy,
  complete 4-tier narration scripts) → 1 sonnet hostile verifier runs the module's
  design/04 §5 audit checklist → on failure, 1 sonnet reviser fixes in place →
  re-verify. Max 2 revision rounds; unresolved failures escalate to the report.
  Scenes run independently — do NOT barrier between author/verify stages.
Phase 4 — GLOBAL AUDITS (true barrier, after all scenes): 3 sonnet agents in
  parallel — coverage (full concept-checklist join, no sampling), continuity
  (incl. against 03-STORY-UNIVERSE.md), feasibility (ticket list, S/M/L).
Phase 5 — FIX: 1 sonnet agent applies every coverage+continuity finding to the
  scene files; then 1 haiku agent mechanically re-scans forbidden wording,
  verbatim-sentence character matches, and citation labels; 1 sonnet round-2
  fixer if the scan finds violations. Feasibility findings become tickets, not edits.
Phase 6 — SYNTHESIS: 1 sonnet agent reads the whole package and writes
  00-OVERVIEW.md per its skeleton (flip-able decisions + open items mandatory).
Phase 7 — HOUSEKEEPING (orchestrator, not agents): append new canon to
  docs/Workflows/STORY-MODULE-TEMPLATE/03-STORY-UNIVERSE.md (cast, props, timeline row);
  spawn separate background tasks for any live shipping-code defects recon found
  (never bundle into this package); update project memory with the package pointer;
  fold any pipeline improvements back into docs/Workflows/STORY-MODULE-TEMPLATE/.

EXPECTED SCALE: ~17 + 3-to-5 agents per scene (GAO-001, 9 scenes, took 49 agents).

HARD RULES (violations = failure):
- Delivery-only change: never edit quiz/assessment content, module IDs, page
  structure, or anything the protected LMS shell owns.
- Any judgment call a stakeholder might dispute goes in 00-OVERVIEW's flip-able
  decisions section — never silently decided.
- Never contradict established story canon; reuse cast before inventing.

REPORTING (final message): package path; scene + concept counts; headline design
decisions; audit findings and how resolved; unresolved verification failures if
any; live defects spun off; new story canon appended; flip-able decisions; open
stakeholder items; recommended next module.
```

---

## Placeholders

| Placeholder | Value |
|---|---|
| `{MODULE_ID}` | Catalog id from `src/policy/journey/data/modules.ts`, e.g. `GAO-012` |
| `{OPTIONAL_SOURCE_HINTS}` | Delete, or: `Source content likely at: <paths>.` |

## Model & agent budget at a glance

| Phase | Agents | Model |
|---|---|---|
| Recon | 4 parallel | sonnet |
| Design | 5 parallel + 1 gate (+1 reconcile) | sonnet |
| Storyboards | N authors + N–3N verify/revise | sonnet |
| Global audits | 3 parallel | sonnet |
| Fix | 1–2 fixers + 1 scanner | sonnet / **haiku** (scanner) |
| Synthesis | 1 | sonnet |
| **Total (9-scene module)** | **~45–50** | |

The orchestrator itself runs on your session model; only subagents are pinned to budget models (standing directive).

## Continuing into Build + UAT + narration audio

The master prompt above produces the **architecture package** (phases 1–7). To then build the module, run browser UAT, generate voice-cloned narration audio, and apply fixes (phases 8–12), append this to the prompt — or run it later as its own message:

```text
After the architecture package is complete and its open items reviewed, continue
into build per docs/Workflows/STORY-MODULE-TEMPLATE/05-BUILD-UAT.md: run the saved workflow
story-module-build with args {"moduleId": "{MODULE_ID}"}.
Narration audio is voice-cloned locally via Qwen3-TTS
(scripts/narrationTts/generate_narration_audio.py) in parallel with browser UAT,
using the STANDARD voice (scripts/narrationTts/voiceRef.default.json — the
OASIS-E2 training narrator). If it stops with PLATFORM_NOT_LANDED, report the
missing engine pieces and ask before re-running with buildPlatform: true. Never
stub auth for UAT, never commit without being asked, and review git diff against
the do-not-touch list.
```

The standard voice is defined once in `scripts/narrationTts/voiceRef.default.json` — edit that file to change it everywhere, or pass `voiceRef: {audio, text?}` in args to override a single run (other samples under `C:\AI\Voice\`).

## Batching multiple modules

Run modules **sequentially, one per session/run** — never two in parallel. The story-universe registry is append-serialized: module B's story bible must see module A's new canon, or the timelines collide. A practical cadence: convert → review 00-OVERVIEW's open items → approve/flip decisions → next module. The open items are small (they were 4 for GAO-001) and reviewing them between runs is what keeps 41 modules from compounding one bad default 41 times.
