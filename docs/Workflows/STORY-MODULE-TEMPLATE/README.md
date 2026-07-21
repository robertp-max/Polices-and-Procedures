# Story-Module Template — turning any training module into a story-driven interactive journey

**Derived from:** `docs/GAO-001-A-New-Journey/` (the reference implementation — read it whenever a skeleton section is unclear; it is the worked example for every document type here).
**Applies to:** every module in the canonical catalog (`src/policy/journey/data/modules.ts`) — the remaining GAO modules (GAO-002…GAO-027) and the role-track modules (ADM/DON/RN/…).
**Status:** Template v1 — extracted 2026-07-07, before the GAO-001 engine build has landed. See §6 for what gets cheaper once the engine exists.

---

## 1. What this template produces

For a module `<ID>` (e.g. GAO-012), a complete architecture package at:

```
docs/<ID>-<Subtitle-In-Kebab-Case>/
  00-OVERVIEW.md            ← master synthesis: decisions, plan, open items
  recon/
    content-inventory.md    ← ground truth: every concept in the source content
    shell-integration.md    ← the protected-shell contract this module renders inside
    engine-patterns.md      ← reusable interaction patterns / engine capabilities available
    narration-infrastructure.md
  design/
    01-story-bible.md       ← cast, arc, continuity devices, voice rules (module-specific)
    02-ux-architecture.md   ← template-per-scene assignment, engine config, quality bar
    03-narration-system.md  ← concept checklist → narration segment mapping
    04-compliance-framework.md ← citation map, wording guardrails, scenario limits
    05-learning-framework.md   ← objectives, assessment alignment, pacing budget
  scenes/
    scene-01-*.md … scene-NN-*.md  ← one full storyboard per source page/scene
  audits/
    coverage-audit.md       ← every source concept traced to a scene+narration home
    continuity-audit.md     ← story/cast/prop consistency
    feasibility-audit.md    ← implementation constraints → ticket list
```

The subtitle is the module's story title (GAO-001's was *"A New Journey"*). Pick it during the story-bible phase, not before.

## 2. The five documents in this template

| File | What it is | Who reads it |
|---|---|---|
| `README.md` | This file — orientation and parameterization | You, first |
| `01-PIPELINE.md` | The phase-by-phase orchestration playbook (recon → design → storyboards → verify → audits → fix → synthesize) | The session running the conversion |
| `02-UNIVERSAL-INVARIANTS.md` | **Binding** module-agnostic rules: compliance wording, state-write separation, citation hygiene, narration tiers + CI gates, redundancy contract, quality bar, layout catalog, pacing rules | Every agent in every phase |
| `03-STORY-UNIVERSE.md` | The shared Care Indeed story world: established cast, continuity registry, rules for reusing vs. introducing characters | Story-bible and storyboard authors |
| `04-MASTER-PROMPT.md` | Copy-paste one-message kickoff prompt + the full orchestration spec (phases, agent counts, models, gates) — the fallback when the workflow/skill aren't available | Anyone launching a conversion |
| `05-BUILD-UAT.md` | Phases 8–12: build the module from its package, browser UAT (Track A) in parallel with Qwen3-TTS voice-clone narration audio (Track B, `scripts/narrationTts/generate_narration_audio.py`), fix loop, UAT report | The session building a converted module |
| `skeletons/` | One skeleton per output document, with per-section instructions and done-criteria | The agent writing that document |
| `automation/` | **Reference copies** of the two live automation files: the workflow script (live: `.claude/workflows/story-module-architecture.js`) and the `/convert-module` skill (live: `.claude/skills/convert-module/SKILL.md`). Edit the live files; re-copy here | Anyone browsing the package |

## 3. Parameterization — what varies per module

Every module is one row of `src/policy/journey/data/modules.ts`. The pipeline takes these parameters:

| Parameter | Source | Effect |
|---|---|---|
| `moduleId` | catalog `id` | Package folder name, sceneId prefixes (`<ID>-S03`), narration ids |
| `title` | catalog `title` | Subject matter; recon starts here |
| `policyRefs` / `cmsRefs` | catalog | Seeds for the per-module **citation map** (design/04). Every citation gets its correct plain-English label per INVARIANTS §4 |
| `method` + `passThreshold` | catalog | Drives design/05's **assessment alignment**: `Quiz` → quiz-alignment map, quiz preserved unchanged; `None` → objectives + retrieval moments only; `ReturnDemo`/`Scenario`/`CaseStudy`/etc. → the scene interactions themselves must rehearse the assessed behavior |
| `roles` | catalog | Protagonist selection (see `03-STORY-UNIVERSE.md`) — ALL-roles modules use the shared new-hire protagonist; role-track modules use that track's protagonist |
| Source content location | **recon finds it** | GAO-001's lived in `CareIndeedOnboardingLMS.tsx`; others live in `trainingContent.*.ts`, advanced-training data files, or may be thin. Recon reports the location and richness — never assume |
| Scene count | **recon finds it** | Scenes map 1:1 to the source page structure. Do not invent or merge pages; if the source has no page structure, the design phase proposes one and flags it as a stakeholder decision |

## 4. What never varies (canonical identity preservation)

For every module, unchanged and non-negotiable:

1. The module ID, its place in the catalog, prerequisites, and pass thresholds.
2. The source page structure mapped 1:1 to scenes, and the module's duration intent.
3. Any existing quiz/assessment content — **delivery-only change**. If a storyboard needs a quiz answer changed, that is a stakeholder decision, never a silent edit (GAO-001 precedent: §9.1 pillar-canon decision).
4. The protected outer LMS shell: progress pills, Save & Exit, player controls, routing, quiz engine, certificates, P&P acknowledgment workflow, CES, Evidence, eSign, packets. Scenes live inside the workspace slot only.
5. Everything in `02-UNIVERSAL-INVARIANTS.md`.

## 5. Quick start

**Slash command (easiest):** type `/convert-module GAO-012` in Claude Code. The skill (`.claude/skills/convert-module/SKILL.md`) does preflight (catalog check, existing-package check, canon read), runs the saved workflow, then does the post-run housekeeping and reports.

**Build it too:** `/convert-module GAO-012 build` continues into phases 8–12 (`05-BUILD-UAT.md`) via the `story-module-build` workflow — implementation, browser UAT in parallel with voice-cloned narration audio (provide a 5–15s voice sample + exact transcript; samples under `C:\AI\Voice\`), fix loop, UAT report.

**Orchestrated directly:** run the saved workflow —

```
Workflow name: story-module-architecture
args: { "moduleId": "GAO-012", "sourceHints": ["optional file paths if known"] }
```

The script lives at `.claude/workflows/story-module-architecture.js`. GAO-001 took ~49 agents end-to-end; expect similar for content-rich modules, less for thin ones. Per standing directive, all subagents run on budget models (sonnet/haiku overrides are set in the script).

**From a fresh session / no workflow available:** paste the master prompt from `04-MASTER-PROMPT.md` — it carries the complete orchestration spec inline.

**Batching:** sequential only, one module per run — the story-universe registry serializes canon between modules (see `04-MASTER-PROMPT.md` §Batching).

**Manual / incremental:** follow `01-PIPELINE.md` phase by phase, handing each agent (or doing yourself) the matching skeleton + the invariants file. Phases are checkpointed — you can stop after any phase and resume later; each phase's outputs are ordinary markdown files in the package folder.

**Either way, before starting:** read the module's catalog row, read `03-STORY-UNIVERSE.md` for established canon, and check `docs/` for already-converted modules whose canon you must not contradict.

## 6. One-time platform work vs. per-module work

GAO-001's feasibility audit produced two kinds of tickets. Do not re-litigate the platform kind per module:

- **Platform (once, then reused):** scene engine (`useSceneEngine`, `SceneConfig`), the six layout template shells, shared primitives (`<SceneModal>`, `<ChoiceButton>`, `useSceneAudio`, focus-trap/reduced-motion framework), `SceneRegistry` card-id discriminator, `sceneProgress` persistence, narration manifest extension, the CI coverage/forbidden-string checks. Tracked in GAO-001's 00-OVERVIEW §8.
- **Per-module (every time):** `SceneConfig` data per scene, Field/Reference Notes copy, narration scripts per tier, scene art, citation placement, assessment alignment. This is the Fast-Fable-shaped work.

Until the platform work lands, every module package's feasibility audit must restate the platform dependencies as blockers. After it lands, point at the engine docs instead and audit only the module's novel needs (a new layout template, a new interaction kind).

## 7. Keeping the template honest

- When a module conversion discovers a better pattern, update this template **in the same effort** and note the change here (like the Brad protection manifest: silent drift = regression).
- When a module establishes new story canon (a character, a prop, a phrase), append it to `03-STORY-UNIVERSE.md` in the same effort.
- The GAO-001 package remains the worked exemplar. If this template and GAO-001's docs disagree, the template wins for *new* modules — but flag the disagreement.
