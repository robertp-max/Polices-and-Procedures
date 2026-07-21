# Pipeline — the phase-by-phase conversion playbook

Seven phases, each producing checked-in markdown. Every agent in every phase receives: the module's catalog row, `02-UNIVERSAL-INVARIANTS.md`, the relevant skeleton from `skeletons/`, and the pointer to the matching GAO-001 exemplar document. Phases 3–5 additionally receive the outputs of earlier phases.

A phase is **done** when its documents satisfy the skeleton's done-criteria. Do not start scene storyboards before design is done — GAO-001's audits traced every late defect to a scene drafted against an assumption a design doc later contradicted.

---

## Phase 1 — Recon (4 parallel agents, read-only)

Ground truth before any design. Each agent writes one `recon/` document.

| Agent | Question it answers | Skeleton |
|---|---|---|
| Content inventory | Where does this module's source content live, page by page? Every concept, table row, list item, citation, scenario, quiz/assessment item — enumerated with file:line refs. **Also documents current-delivery defects** (e.g. GAO-001's narration-coverage gap) and reports content *richness* | `recon/content-inventory.skeleton.md` |
| Shell integration | What contract does the module render inside? Card structure, discriminator, `onComplete` wiring, persistence, `canContinue`, both completion stores | `recon/shell-integration.skeleton.md` |
| Engine patterns | What interaction machinery already exists to reuse? (Pre-engine: prototype analysis. Post-engine: engine capability survey — which templates/primitives exist, what's missing for this module) | `recon/engine-patterns.skeleton.md` |
| Narration infrastructure | How narration is stored/keyed/played today; manifest patterns; audio asset conventions | `recon/narration-infrastructure.skeleton.md` |

**Gate:** if content inventory reports the module has no substantive source content (some catalog rows are method-only), STOP and surface to the user — the pipeline converts content, it does not invent curriculum.

## Phase 2 — Design (5 parallel agents)

Each writes one `design/` document, grounded in recon + invariants.

1. **Story bible** — protagonist (per `03-STORY-UNIVERSE.md` rules), cast, arc, scene-to-story mapping, continuity devices, voice rules. Must reuse established universe canon; new canon gets flagged for the universe registry.
2. **UX architecture** — assign a layout template (invariants §7 catalog) to each scene with rationale; specify `SceneConfig` shape deltas if the module needs anything the engine lacks; restate the quality bar.
3. **Narration system** — build the module's **concept checklist** from the content inventory (one conceptId per fact/citation/row/step); define narration segment naming; set per-scene coverage expectations.
4. **Compliance framework** — the module's **citation map** (per scene: may-cite / framing / must-not-cite, from catalog `cmsRefs`+`policyRefs` + content), wording guardrails instantiation, verbatim-sentence requirements if the module touches mandatory-reporting content, scenario realism limits for any depicted clinical/HR situations, and the module's **audit checklist** for Phase 4 verifiers.
5. **Learning framework** — per-scene objectives, assessment alignment map (quiz map if `method: Quiz`; behavioral rehearsal map for ReturnDemo/Scenario/etc.), pacing budget summing to the module's duration intent, interaction-learning fit table, retention devices.

**Gate:** design docs must not contradict each other (scene count, template assignments, cast names). One quick cross-read before Phase 3.

## Phase 3 — Scene storyboards (1 agent per scene, parallel, then verify+revise per scene)

Each scene agent writes `scenes/scene-NN-<slug>.md` per `skeletons/scene.skeleton.md` (12 sections, **real draft copy** — Field Notes, Reference Notes, and complete narration scripts for all four tiers, not placeholders). Grounded against: content inventory (its scene's concepts), all five design docs, and the scene's generated art if any exists.

**Per-scene adversarial verification (pipeline, not barrier):** as each storyboard lands, a hostile reviewer runs the module's audit checklist (design/04 §5 equivalent) plus invariants §§3–6 against it. Any Section A–D-class failure → the scene agent revises → re-verify. Cap at 2 revision rounds; unresolved items escalate to the final report.

## Phase 4 — Global audits (3 parallel agents, after all scenes pass)

These need cross-scene sight, so they run after Phase 3 completes (a genuine barrier):

1. **Coverage audit** — join the full concept checklist against all nine-or-N storyboards' narration plans; table of every source concept → scene → segment. Flags: unmapped concepts, concepts mapped only to scene-start/complete tiers, assessment items without a teaching home.
2. **Continuity audit** — cast/prop/phrase consistency across scenes and against `03-STORY-UNIVERSE.md`; flags unnamed recurring characters, retired terminology, prop drift, story-universe contradictions with other converted modules.
3. **Feasibility audit** — every storyboard element against the real shell/engine contract; output is an ordered implementation ticket list with effort ratings (S/M/L) and risk notes, separating platform blockers from module work.

## Phase 5 — Fix pass

One agent (or a small pipeline) applies every coverage and continuity finding directly to the scene files, then a verifier mechanically re-checks the compliance invariants (forbidden strings, verbatim sentences, citation labels) across the revised files. Feasibility findings are **not** fixes — they become 00-OVERVIEW ticket-list content.

## Phase 6 — Synthesis

Write `00-OVERVIEW.md` per its skeleton: package map, story-in-a-paragraph, headline design decisions, narration/compliance/learning summaries, audit resolutions, implementation plan (tickets, build order, handoff split), **decisions made during synthesis (flip-able)**, and **open items for stakeholders**. This is the only document a stakeholder must read; it links to everything else.

## Phase 7 — Housekeeping

- Append new story canon to `03-STORY-UNIVERSE.md`.
- If the conversion found live defects in shipping code, raise them as separate background tasks — never bundle into the redesign.
- Save/refresh the project memory pointer for the new package.
- If the pipeline itself needed adjusting, update this template (README §7).

---

## Orchestration notes

- **Budget models:** per standing user directive, every subagent runs with an explicit model override — `sonnet` for recon/design/storyboard/verify/audit/fix, `haiku` only for mechanical string-scan checks.
- **Pipeline over barrier:** Phase 3's storyboard→verify→revise chain is per-scene independent — run it as a pipeline. Phases 4 and 6 are true barriers.
- **Agent outputs:** each agent Writes its document to the package folder and returns only a short structured summary (path, scene/concept counts, flags). Never pass full documents through return values.
- **Resumability:** every phase's artifacts are files. A later session resumes by reading the package folder and continuing from the first missing/failed document.
