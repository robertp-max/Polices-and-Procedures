# Skeleton — scenes/scene-NN-<slug>.md (the 12-section storyboard)

**Purpose:** a self-contained implementation spec for one scene — an implementer should need this file, the design docs, and nothing else. **Real draft copy throughout**: actual Field Notes text, actual Reference Notes text, complete narration scripts. Placeholders are a phase failure.
**Exemplar:** `docs/GAO-001-A-New-Journey/scenes/scene-04-values.md` (the quality benchmark)
**Inputs:** this scene's slice of the concept checklist (design/03 §1), all five design docs, invariants, the scene's generated art if it exists.

## The 12 sections

1. **Story Beat** — where the protagonist is in story time, what happens, the emotional note (from the story bible's structure table).
2. **Learner Role** — what the learner watches vs. decides; how agency is exercised in this scene.
3. **Workspace & Visual Concept** — the assigned layout template, the scene art/space description, region placement of Field/Reference Notes per design/02, responsive behavior.
4. **Learning Nodes** — the node list with each node's `conceptIds` from the checklist. Every checklist concept assigned to this scene appears on exactly one node. Respect the pacing budget's max-node count.
5. **Interaction Pattern** — the mechanic per node kind (hotspot/choice/step/branch), unlock gating, completion rule, attempt/hint behavior (max 2 failures → direct hint), resume behavior.
6. **Per-Node Specs** — one subsection per node: label, position/affordance, the interaction, choice options with `isCorrect` and full feedback text for every option (wrong-answer feedback explains *why* the tempting choice fails, in-story).
7. **Field Notes** — the actual per-node Field Notes copy (plain-language, new phrasing, no citations — invariants §10).
8. **Reference Notes** — the actual citation lines per the framing template (invariants §4), only citations this scene is authorized to carry per the citation map.
9. **Narration Plan** — complete draft scripts for all four tiers: `scene_start`, every `node_unlock`, every `feedback` branch, `scene_complete` — each tagged with narration id and `conceptIds`, meeting this scene's word budget from design/03 §4b (module floor: invariants §9.5). Verbatim units (invariants §5) placed exactly where design/04 mandates, copy-pasted from the canonical source. Any content beyond the source inventory follows the policy-grounded expansion rule (invariants §1) — cite the policy in Reference Notes.
10. **Audio & Microinteractions** — SFX moments (as flavor guidance against the shared `useSceneAudio` enum), unlock flourishes, reduced-motion equivalents.
11. **Accessibility** — keyboard path through every interaction, focus management, aria-live usage (short state changes only), transcript behavior.
12. **QA Risks** — what an implementer or tester is most likely to get wrong in this scene specifically (state machine corners, resume edge cases, art-coordinate brittleness).

## Done when

- Every assigned concept has a node and a primary narration segment; the scene passes the full interaction quality bar (invariants §11) on paper.
- Completion wording is safe; citations match the citation map; verbatim units are character-exact.
- All copy is real draft text an implementer could ship for review.
