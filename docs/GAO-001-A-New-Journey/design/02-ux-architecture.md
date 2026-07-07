# GAO-001 UX Architecture Specification

## 1. VERDICT: Learning Unlock / Word Reveal Architecture

**ADAPT.** Reject the literal "left = puzzle map, right = Field Notes, small area = Reference Notes" as a *universal fixed layout* — recon shows the workspace column is a single flexible region (`ModulePlayerScreen.tsx:1141`, no fixed sub-grid) sitting beside a *shell-owned* 420px left rail already occupied by Content/Narration tabs. A learner-content "puzzle map" cannot colonize that rail without fighting shell chrome. Adopt the **unlock mechanic** (discover → node unlocks → explanatory reveal) as the core interaction primitive for every scene, but implement panel placement as **per-template regions inside the workspace**, not a fixed 3-column skin.

Rationale:
- Scene 4 (`CoreValuesInteractiveViewer`) already proves the mechanic works (hotspot → modal → phase-gated reveal) — reuse the *state machine*, not its single-modal layout, everywhere.
- GAO-001's own content (Section 1 recon) is heterogeneous — mission table, vision pillars, six values, scenario narratives, checkpoint quizzes, survey-readiness — a single "map + notes" skin cannot represent a decision scenario (Scene 7/8) or a comparison table (Scene 5) without distortion. Different scenes need different spatial metaphors (journey map fits Scene 1/9; decision board fits Scene 7/8; flow sequence fits Scene 6; split compare fits Scene 5).
- Redundancy goal is satisfied by the unlock mechanic's tiering (scene/Field Notes/Reference Notes/narration), independent of which layout template hosts it.

**Adapted model:** Every scene is `Discovery Nodes → Unlock Payload → Field Notes panel (always present, right-side or bottom-drawer depending on template) → optional Reference Notes strip (compact, collapsible)`. Progress/map visualization is a **template concern**, not a fixed left panel — some templates render it as a mini progress rail, others as pips, others as a literal map.

## 2. WORKSPACE LAYOUT SYSTEM

All templates fill `<div className="h-full w-full">` inside the existing workspace slot (`ModulePlayerScreen.tsx:1142`). All must degrade to single-column under `lg` breakpoint (grid already collapses there) and must be independent of the shell's Content/Narration tabs (no duplicate copy — see Section 4).

| Template | Regions | Responsive | Field/Reference Notes | Scenes |
|---|---|---|---|---|
| **JourneyMap** | Central path/map visual with waypoint nodes; tap node → inline expand card | Map scales via viewBox; nodes stack as vertical list <lg | Field Notes = expand card content itself (no separate panel); Reference Notes = small footer strip under expand card | 1 (Welcome/orientation), 9 (Survey Readiness/Completion) |
| **DiscoveryScene** | Full-bleed illustrated scene (SVG) with hotspots; right-side Field Notes drawer slides in on unlock; thin Reference Notes ribbon pinned bottom | <lg: scene on top (60vh), Field Notes becomes bottom sheet, Reference ribbon collapses to icon+tooltip | Field Notes = right drawer (default template for exploration scenes) | 2 (Mission), 3 (Vision) |
| **DecisionBoard** | Scenario text/illustration top or left; choice cards grid; feedback panel appears below chosen card | <lg: stacks vertically, choices become full-width buttons | Field Notes = feedback panel (post-choice); Reference Notes = citation chip attached to feedback panel | 7 (Torres refusal scenario, strictly sequential nodes), 8 (two-branch: Chen off-scope request / Torres bruising continuation) |
| **SplitCompare** | Two-column comparison (Facility vs. Home Health, or Value vs. Anti-pattern); click a column item to unlock detail in a shared reveal strip below | <lg: columns stack, becomes accordion | Field Notes = shared reveal strip; Reference Notes = small tag per item | 5 (Home Health Differences) |
| **PuzzleBoard** (retained/refactored Scene 4 engine) | Scene art + hotspot registry + 2-phase choice modal, generalized | Existing CoreValues responsive pattern, hardened for a11y | Field Notes = post-solve summary inside modal phase 3; Reference Notes = CFR chip in modal header | 4 (Core Values) |
| **FlowSequence** | Linear step rail (numbered) + active step detail pane; step advances only on correct interaction | <lg: rail becomes horizontal scroller above detail pane | Field Notes = detail pane; Reference Notes = fixed footer per step | 6 (Mandatory reporting briefing — Dana Whitfield's 4 regulatory-duty cards sort + 6-step reporting sequence) |
| **BranchingScenario** | Full scenario narrative panel + branching choice tree; wrong branch shows consequence detour then returns to decision point | <lg: single column, branch history shown as breadcrumb | Field Notes = consequence/debrief panel; Reference Notes = mandated-reporting citation block (hard-coded exact sentence, see Section 4) | Scene 8's Branch 2 (Torres bruising continuation) — implemented as the branching arm of Scene 8's DecisionBoard, not a separate scene |

Scene assignment (final, 1–9):
1. JourneyMap — Welcome/orientation (reuse/refactor `GAO001Scene01WelcomeDesk` desk hotspots as JourneyMap waypoints)
2. DiscoveryScene — Mission breakdown (5 phrase hotspots + mission-alignment table as 5 unlockable rows)
3. DiscoveryScene — Vision (4 pillar hotspots: Clinical Excellence, Workforce Growth, Regulatory Leadership, Community Trust)
4. PuzzleBoard — Core Values (existing engine, generalized/hardened)
5. SplitCompare — Home Health vs. Facility care (5 comparison rows)
6. FlowSequence — Mandatory reporting briefing (Dana Whitfield briefs Alex: 4 regulatory-duty cards sort + 6-step reporting sequence)
7. DecisionBoard, strictly sequential nodes — Mr. Ray Torres patient refusal scenario
8. DecisionBoard, two-branch/BranchingScenario — Branch 1: Mrs. Linh Chen and daughter Grace Chen off-scope request; Branch 2: same-visit Torres bruising continuation (minutes later)
9. JourneyMap — Survey readiness, cumulative recap, attestation-safe completion, evidence summary

## 3. SCENE ENGINE ARCHITECTURE

```ts
type NarrationTier = 'scene_start' | 'node_unlock' | 'feedback' | 'scene_complete';

interface NarrationRef {
  id: string;              // stable, e.g. "gao001.s02.node.patient_centered.unlock"
  tier: NarrationTier;
  text: string;            // full instructional narration (story + concept coverage)
  version: number;
  approvedBy?: string;
  approvedAt?: string;
  audioLocation?: string;  // resolves via narrationAssetPath()
}

interface SceneNode {
  id: string;
  kind: 'hotspot' | 'choice' | 'waypoint' | 'compareItem' | 'step';
  position?: { top: string; left: string }; // % for DiscoveryScene/PuzzleBoard
  label: string;
  fieldNote: string;         // explains what was unlocked (Field Notes surface ONLY)
  referenceNote?: { citation: string; text: string }; // CFR/policy/surveyor note
  narrationRefs: NarrationRef[]; // node_unlock (+feedback if choice-bearing)
  choice?: {
    options: { id: string; label: string; isCorrect: boolean; feedback: string }[];
    mandatedSentence?: string; // exact-verbatim string, required for reporting nodes
  };
}

interface SceneConfig {
  sceneId: string;              // "GAO001-S06"
  template: 'JourneyMap' | 'DiscoveryScene' | 'DecisionBoard' | 'SplitCompare' | 'PuzzleBoard' | 'FlowSequence';
  title: string;
  narrationSceneStart: NarrationRef;
  narrationSceneComplete: NarrationRef;
  nodes: SceneNode[];
  completionRule: { type: 'all_nodes' | 'threshold'; threshold?: number };
  safeCompletionLabel: string; // e.g. "Mission Practice Complete" — never attestation wording
}
```

**State machine** (per scene instance, generic hook `useSceneEngine(config)`):
`locked → discovered → resolved` per node; scene state derived as `complete = completionRule` evaluated over node statuses. No node can silently skip `discovered`. Fires `onComplete` once via `useEffect` watching derived `isComplete` (standardize on CoreValues' pattern, reject GAO001Scene01's setTimeout-in-handler pattern per recon Section "onComplete firing pattern").

**Props contract with ModulePlayerScreen** (unchanged shape, minimally extended):
```ts
interface SceneProps {
  onComplete?: () => void;
  onProgress?: (pct: number) => void; // NEW — optional, for future canContinue gating
  initialState?: SceneProgressSnapshot; // NEW — enables resume, recon Risk #1/#2
}
```
Discriminator: replace title-regex matching with a `.find()` over an ordered `SceneRegistry: { test: (card) => boolean; Component }[]` keyed on stable card id if available (recon Section 4 recommendation) — this is the one shell-file touch required, additive only, does not alter Save & Exit/pills/routing.

**Persistence:** use existing `useLearner()` write path only — no new attestation writers. Add non-attestation scene-progress snapshot to learner state under a new namespaced key (e.g. `sceneProgress[moduleId::lessonId]`), written on node-resolve and read as `initialState` on mount, closing Risk #1/#2 without inventing a new store. Do NOT wire node-level progress into `canContinue`/`handleNext` gating unless product explicitly requires it (recon Risk #3) — default to non-blocking, matching current shell behavior, but surface an in-scene "Practice Complete" state.

**Component fate:**
- `CoreValuesInteractiveViewer` → **refactor into the engine** as the reference implementation of PuzzleBoard (its `SCENE_HOTSPOTS` config is the design's proof-of-concept — lift it into `SceneConfig.nodes`, replace bespoke `InteractiveAudioSynth` with shared `useSceneAudio()`, add a11y fixes).
- `GAO001Scene01WelcomeDesk` → **port into engine** as JourneyMap Scene 1 (desk hotspots become waypoints; drop dead `explored`/`orientationChecks` state or wire it into `completionRule`; fix badge-name duplication by making it one config field).
- Build once, shared: `useSceneAudio`, `useUnlockTracking`, `<SceneModal>`, `<ChoiceButton>`, `useStepFlow`/`usePhaseGate`, `<ProgressChip>`, `<MuteToggle>` — all identified verbatim in recon Section 2 primitives table.

## 4. REDUNDANCY CONTRACT

| Surface | Contains | Never contains |
|---|---|---|
| **Scene visual** (art + hotspot labels + choice option text) | The experience: what Alex sees/does, short choice labels, immediate right/wrong signal | Full explanations, citations, policy numbers |
| **Field Notes** (per-node, revealed on unlock) | Plain-language explanation of *what was just unlocked* — the concept, in story-adjacent language | Verbatim CFR text, surveyor scripts, narration's story framing |
| **Reference Notes** (compact, per-node or per-scene) | CFR/CMS citation, policy ref code, one-line surveyor-facing reminder | Any instructional explanation (that's Field Notes' job) — citation + terse label only |
| **Narration** (4 tiers) | scene_start = story setup + stakes; node_unlock = story reaction + FULL concept coverage (must include the citation, the table row, the enumerated list item Field Notes only summarized); feedback = story consequence + why right/wrong; scene_complete = story close + bridge to next scene | Nothing verbatim-duplicated from Field Notes wording — same fact, different sentence construction |

Hard rule: **one fact, one home surface for its full form.** If a fact needs a citation, the citation's *number* lives in Reference Notes and its *meaning* lives in narration node_unlock — Field Notes references it only by consequence ("this is why...") without restating the number. Mandatory-reporting exact sentence (Section on compliance guardrails) is the **one explicit exception** — it must appear verbatim in both narration and Field Notes for scenes 6 and 8, per hard requirement.

## 5. INTERACTION QUALITY BAR (must pass, per scene)

- [ ] Learner makes at least one **consequential choice** (not a "Continue" click) with a wrong-answer path that shows real feedback, not just a checkmark
- [ ] Wrong choice produces distinct feedback tied to *why* it's wrong in-story (not generic "Incorrect")
- [ ] At least one node's unlock is **gated on understanding**, not just clicking (e.g., choice-bearing hotspot, not pure reveal-on-hover)
- [ ] Field Notes text is non-identical to scene visual text and to narration text (redundancy contract enforced)
- [ ] Narration node_unlock tier contains the full instructional fact set for that node (citation, enumerated items) — verifiable against Section 1 recon's per-page concept inventory
- [ ] Scene has a visible progress indicator (map position, node count, or step rail) reflecting true state, not decorative
- [ ] Keyboard-operable: every interactive element reachable via Tab, actionable via Enter/Space, modals trap focus and close on Escape
- [ ] Respects `prefers-reduced-motion` (ambient animations become static or reduced)
- [ ] Completion label uses only safe wording (Section: compliance guardrails #3); no forbidden attestation phrasing anywhere in scene/Field Notes/narration
- [ ] Scene works from `initialState` (resumable) — reload mid-scene does not silently reset to zero

## 6. HANDOFF SPLIT

**Architecture-level (UltraCode/Fable):**
- Scene engine core: `useSceneEngine`, `SceneConfig`/`SceneNode` types, state machine, persistence snapshot wiring into `useLearner()`
- Shared primitives: `useSceneAudio`, `useUnlockTracking`, `<SceneModal>`, `<ChoiceButton>`, `usePhaseGate`, `<ProgressChip>`, `<MuteToggle>`, reduced-motion + focus-trap + keyboard framework
- `SceneRegistry` discriminator refactor in `ModulePlayerScreen.tsx` (replace title-regex chain)
- `NarrationRef`/tier schema + `narrationManifest.ts` extension for per-node location keys
- Template shells (JourneyMap, DiscoveryScene, DecisionBoard, SplitCompare, PuzzleBoard, FlowSequence) as generic, config-driven layout components
- Refactor of `CoreValuesInteractiveViewer` and `GAO001Scene01WelcomeDesk` into the engine

**Mechanical per-scene (Fast Fable), once engine + templates exist:**
- Writing each scene's `SceneConfig` (nodes, labels, hotspot coordinates, choice options/feedback text)
- Field Notes / Reference Notes copy per node, checked against Redundancy Contract
- Narration script text per tier per scene, checked against per-page concept inventory (Section 1 recon) for 90-100% coverage
- Scene art (SVG) production/positioning within an existing template
- CFR citation placement verification (§484.50 vs §484.110 correction, §484.60 retention)
- Mandatory-reporting exact-sentence insertion into scenes 6 and 8's narration + Field Notes