# Universal Invariants — binding on every story-module conversion

These rules are module-agnostic and **binding**. They were extracted from `docs/GAO-001-A-New-Journey/design/` (the worked exemplar; read those files for full rationale and examples). A storyboard or design doc that violates §§1–5 is an automatic FAIL in verification — rewrite before proceeding. §§6–13 failures require rewrite unless a documented rationale is attached.

---

## 1. Canonical identity preservation

Unchanged per module, always: module ID and catalog row; source page structure mapped 1:1 to scenes; duration intent; existing quiz/assessment content (delivery-only change — any content edit is a named stakeholder decision); the protected outer LMS shell (progress pills, Save & Exit, player controls, routing, quiz engine, certificates, P&P acknowledgment workflow, CES, Evidence, eSign, packets). Scenes fill the workspace slot (`<div className="h-full w-full">`) and nothing else. No invented curriculum: only dramatize what the recon content inventory documents.

**Expansion rule (policy-grounded only):** where a scene needs depth beyond the source inventory — examples, definitions, rationale, or volume to meet the narration floor (§9.5) — the expansion must be grounded in the module's referenced policies (catalog `policyRefs`): read the actual P&P text in the policy library, keep the expansion consistent with it, and carry its citation in Reference Notes per §4. An expansion that can't be traced to the source inventory or a referenced policy is invented curriculum → raise it as a stakeholder item, never ship it silently.

## 2. Compliance wording guardrails

### 2.1 Forbidden / safe wording

| Forbidden (incl. near-misses) | Safe replacement pattern |
|---|---|
| "Policy Attested" / "Policy Acknowledged" | "[Subject] Practice Complete" |
| "PP Complete" / "P&P Complete" / "assigned P&P complete" | "Training Module Complete" |
| "Attestation Recorded/Complete/Saved" | "Practice Progress Saved" |
| "Policy Sign-off Done" / "Policy Signed" / "Signed Off on Policy" | "Ready for Post-Test" |
| "Acknowledgment Recorded/Submitted" | "Learning Node Unlocked" |
| "You Have Acknowledged/Attested…" | "You Have Practiced/Reviewed…" |
| "Compliance Confirmed/Verified" (as completion state) | "[Subject] Practice Complete" |
| "Certified" / "Certification Complete" (outside the real certificate flow) | "[Subject] Practice Complete" |
| "This constitutes your formal attestation" | "This confirms you've completed the practice content" |

**Near-miss word test (run against every completion string):** any completion copy containing *attest*, *acknowledg-*, *sign(ed/off)*, or *certif-* (outside the protected certificate screen) is rewritten before ship.

### 2.2 Completion-state naming

- Scene terminal state: **"[Scene Subject] Practice Complete"**. Module terminal: **"Training Module Complete"** → **"Ready for Post-Test"** (when a post-test exists).
- Never bare "Complete" without "Practice"/"Training" qualifying it.
- No second-person legal-toned verbs ("you certify/agree/attest") — descriptive verbs only ("you explored/practiced/reviewed").

## 3. State-write separation (binding on engineering and on storyboard shape)

- Scene components **never** write learner acknowledgment/attestation state and never call `useLearner()` directly to do so. Scenes communicate only via their `onComplete` prop.
- Training-record writes (`withLessonCompleted`, `withModuleAssessment`, `recordExamAttempt`) are categorically distinct from P&P acknowledgment state and must never be described with attestation/acknowledgment language anywhere (copy, narration, Field Notes).
- No scene UI may visually mimic the acknowledgment workflow: no "I confirm" checkboxes, signature lines, or sign-off buttons inside training scenes. A storyboard proposing one is a defect even with clean wording.

## 4. Citation hygiene

- **Framing template (every Reference Note):** *"Reference: [citation] — [one-line plain description]. Informational; see policy [code] for the governing requirement."* Citations are informational, never adjudicated.
- **Every citation number travels with its correct plain-English label** — in Reference Notes and when spoken in narration ("…484.50, the Patient Rights rule…"). Never a bare number.
- **Correct labels for citations used in the catalog** (never swap, never relabel):
  - 42 CFR §484.50 — **Patient Rights** (dignity, informed participation, right to refuse, grievance)
  - 42 CFR §484.55 — Comprehensive Assessment
  - 42 CFR §484.60 — Care Planning / individualized Plan of Care
  - 42 CFR §484.65 — QAPI
  - 42 CFR §484.70 — Infection Prevention and Control
  - 42 CFR §484.80 — Home Health Aide services (…(h) = aide supervision)
  - 42 CFR §484.102 — Emergency Preparedness
  - 42 CFR §484.105 — Organization and Administration of Services (…(b) Governing Body, …(c) Clinical Manager)
  - 42 CFR §484.110 — **Clinical Records** (documentation completeness/retention — NOT Patient Rights)
  - 42 CFR §484.115 — Personnel Qualifications
  - 45 CFR Part 164 — HIPAA Privacy & Security Rules
  - 29 CFR §1910.1030 — OSHA Bloodborne Pathogens
  - The §484.50 ↔ §484.110 swap is the known historical defect — any draft pairing dignity/rights language with §484.110 or documentation language with §484.50 is a hard defect.
- **Per-module citation map required:** design/04 assigns each citation to specific scenes with framing; a citation appearing in a scene not authorized to carry it is a defect. Introduce citations where they're *earned* by the content, not front-loaded.
- **No unvalidated state statute numbers** (APS/mandated-reporter, penal codes) — generic framing only, unless separately legally validated.

## 5. Verbatim compliance sentences

Some sentences are compliance-defensible units that must appear **character-for-character** — CI-checked, never paraphrased at their mandated placements.

- **The mandatory-reporting sentence** (binding whenever a module's content touches abuse/neglect/exploitation reporting — e.g. GAO-012 and any scenario depicting suspected abuse):
  > "Follow agency mandatory reporting protocol immediately; do not investigate or confront; supervisor/Compliance assists with required external reporting, but required reporting must not be delayed."
  - Canonical source string: `src/policy/journey/components/CoreValuesInteractiveViewer.tsx:142` — **copy-paste, never retype**.
  - Placement: verbatim in narration (feedback tier) AND Field Notes at every reporting decision point. Paraphrase is fine elsewhere in the scene but never substitutes at these placements.
- Behavioral rules wherever reporting content appears: **reasonable suspicion triggers reporting, not proof** (never "confirm before reporting"); no branch may reward investigation, confrontation, or unilateral external reporting by the clinician; depictions stay non-graphic and clinical-observational; the story ends at "reported, protocol followed" — never at a guilt/innocence verdict.
- A module may declare additional verbatim units in its design/04 (e.g. a mission statement an assessment tests by recognition). Each must name its canonical source string and mandated placements.

## 6. Scenario realism limits (any depicted clinical/HR situation)

- **Patient refusal:** capacity assumed unless explicitly staged otherwise; risks explained before documentation; zero coercion ever rewarded; resolution always = document + notify, never silent compliance or override.
- **Abuse/neglect:** see §5 behavioral rules. No cartoonish villains — ambiguity is the point; family members are not written as adversaries.
- **HR/workplace scenarios** (harassment, substance, grievance, violence modules): same restraint register — depict the observable behavior and the correct procedural response; never dramatize the act itself, never depict the accused's guilt as resolved, never coach confrontation over process.
- **Patients and colleagues speak plainly and with dignity — never as props.** Objective-vs-subjective documentation examples: show the objective model as correct; show conclusory/opinion charting only as an explicitly-labeled contrast example.
- **Role-scope fit:** scenes teach to the module's catalog `roles` — never coach actions outside the audience's scope of practice (an aide module doesn't rehearse RN-only assessments). The correct depicted move for an out-of-scope situation is always escalation through the proper channel.

## 7. Layout template catalog (assign one per scene; extend only via feasibility audit)

| Template | Shape | Fits |
|---|---|---|
| **JourneyMap** | Path/map with waypoint nodes → inline expand cards | Orientation, tours, cumulative recap/summary scenes |
| **DiscoveryScene** | Illustrated scene + hotspots → Field Notes drawer | Exploratory concept content (mission phrases, pillars, named components) |
| **PuzzleBoard** | Scene art + hotspot registry + 2-phase choice modal (identify → act) | Value/principle application vignettes |
| **SplitCompare** | Two-column contrast → shared reveal strip | "X vs. Y" content (facility vs. home, correct vs. incorrect, before vs. after) |
| **FlowSequence** | Numbered step rail + active-step detail; advances on correct interaction | Strict ordered protocols (reporting chains, exposure response, escalation sequences) |
| **DecisionBoard** | Scenario narrative + choice cards + feedback panel; sequential or two-branch variants | Judgment scenarios, refusals, boundary tests, branching consequences |

Selection heuristics: enumerable concepts → DiscoveryScene/JourneyMap; contrast → SplitCompare; ordered procedure → FlowSequence; judgment under ambiguity → DecisionBoard; identify-then-act → PuzzleBoard. A module needing a genuinely new shape proposes it in design/02 and the feasibility audit prices it — don't contort content into a wrong template, and don't invent a template a existing one covers.

## 8. Scene engine contract (essentials)

- Config-driven scenes: `SceneConfig { sceneId, template, title, narrationSceneStart, narrationSceneComplete, nodes[], completionRule, safeCompletionLabel }`; nodes are `locked → discovered → resolved`, no silent skips; `onComplete` fires once via effect watching the derived complete boolean (never setTimeout-in-handler).
- Props contract: `{ onComplete?, onProgress?, initialState? }`. Resume from `initialState` is mandatory — reload mid-scene must not reset.
- Persistence: non-attestation `sceneProgress[moduleId::lessonId]` snapshots via the existing learner path; narration delivery status piggybacks on it.
- Full types and rationale: GAO-001 `design/02-ux-architecture.md` §3.

## 9. Narration system

### 9.1 The four tiers

| Tier | Job | Length |
|---|---|---|
| `scene_start` | Story orientation + stakes; NOT instructional delivery | 60–120 words |
| `node_unlock` | **The full instructional payload** — every citation, table row, list item, protocol step, one-to-one across nodes; story-voiced but instructionally complete | 80–160 words/node (scale to concept density) |
| `feedback` | Why right/wrong, both branches; corrects the misconception, never bare "Incorrect" | 40–100 words |
| `scene_complete` | Consolidate by reference + safe completion label + bridge | 50–100 words |

**Coverage rule:** the union of tiers covers 90–100% of the scene's concept checklist; `node_unlock` is the tier of record — a concept living only in scene_start/complete is a defect.

### 9.2 Coverage accounting (CI-gated)

One `conceptId` per fact/citation/table-row/protocol-step, seeded from the recon content inventory, each mapped to exactly one primary `NarrationSegment` (+ at most one reinforcement; no segment claims more than ~4–5 concepts). A build-time script fails CI if: any concept lacks a primary segment; any declared verbatim sentence (§5) isn't a character-for-character match; any forbidden phrase (§2) appears in narration text. Gate ≥90% per scene. Segments live as versioned data modules (`narration/<moduleId>.sceneNN.narration.ts`) with `conceptIds`, `transcriptFlag`, `version`, `approvedBy` — auditable independent of code.

### 9.3 Delivery & records defensibility

Pre-generated approved MP3 per segment (primary, records-defensible) → browser TTS labeled "Preview" (fallback only) → never text-with-no-audio-path silently. Muting/skipping never blocks progress; verbatim transcript always renders; training record logs text-or-audio delivery per node (`deliveredAt`, `completedViaAudio`, `completedViaTranscript`). Per-segment play/pause/replay/speed controls. `aria-live="polite"` for short state changes only — never full instructional text.

**Standard voice + stale-audio rule:** all narration audio is voice-cloned from the standard narrator defined in `scripts/narrationTts/voiceRef.default.json` (one source of truth; per-run override only by explicit user request). Audio must be regenerated whenever its segment's text changes — a text edit whose audio wasn't regenerated (word count / text no longer matching the generation record) is a MAJOR finding.

### 9.4 Writing rules

Story-integrated, not story-only (every node-unlock sentence advances the character AND states the fact plainly); citations spoken with plain-English anchors; no compression of enumerated content (N source items → all N addressed, preferably one per node); plain language throughout — conversational, roughly 8th-grade register outside mandated verbatim units, because the audience spans all roles including aides; banned: pure-summary sentences, "as you can see / in this image" (audio must stand alone), reading UI chrome aloud ("click the button"), all §2 forbidden phrases.

### 9.5 Narration volume floor (per module)

- **Total narration across all scenes ≥ 30 minutes spoken.** Draft-time proxy: ≥ ~4,800 words of narration scripts (~160 wpm) — design/03 budgets it per scene and the coverage audit reports the actual word count. Build-time verification: sum the generated segment durations (`generation-results.json`); a total under 30 minutes is a MAJOR finding.
- The floor is on narration **content volume**, not learner seat time (narration plays across interactions and is replayable), and it never licenses padding: every added segment still maps to conceptIds and passes §9.4. If the source content can't honestly sustain 30 minutes, expand per §1's policy-grounded expansion rule — or raise a stakeholder item. Filler fails review.
- Single-segment length caps (§9.1) still apply — reach the floor with more nodes/segments, never longer monologues.

## 10. Redundancy contract

One fact, one home for its full form: **scene surface** = the experience (minimal text, no citations); **Field Notes** = plain-language explanation of what was just unlocked (new phrasing); **Reference Notes** = citation + terse surveyor-facing line only (no instructional prose); **narration** = the only surface carrying full instructional completeness. Identical sentences across two of these surfaces for one node = defect — except §5's declared verbatim sentences, which are intentional legal-precision redundancy. Same *concept* re-earned in different representations across scenes is required pedagogy (see §12), not duplication.

## 11. Interaction quality bar (every scene must pass all)

- [ ] At least one consequential choice (not a "Continue" click) with a real wrong-answer path and feedback
- [ ] Wrong choices get distinct in-story feedback explaining *why* (never generic "Incorrect")
- [ ] At least one unlock gated on understanding, not just clicking
- [ ] Field Notes text non-identical to scene text and narration text
- [ ] `node_unlock` narration carries the node's full fact set, verifiable against the concept checklist
- [ ] Visible, truthful progress indicator
- [ ] Keyboard operable end-to-end; modals trap focus, Escape closes
- [ ] `prefers-reduced-motion` respected
- [ ] Completion wording safe per §2
- [ ] Resumable from `initialState`

## 12. Cognitive load, pacing, retention

- Pacing budget per scene, summing to the module's duration intent; max 4–6 nodes/scene; cap concurrent undiscovered nodes at 6 (split into sub-stages beyond that).
- Every interactive object has a persistent visible affordance — no pixel-hunting; optional guided-sequence affordance for learners who freeze; max 2 failed attempts before a direct hint; wrong branches are non-punitive (consequence explanation, return to decision point — never dead-end).
- Retention: later scenes *test transfer* of earlier scenes' protocols rather than re-teaching; assessment-critical concepts get spaced re-exposure across scenes in **non-identical phrasing** (compact rule → procedural depth → applied judgment → retrieval cue); final scene is cumulative retrieval cues, not re-display; judgment-over-recall — every scenario pairs the correct action with at least one *plausible* wrong action.

## 13. Voice, tone, and the story-instruction seam

- **Close-third narration on the protagonist** ("Alex opens the email…", never "You open…") — lets narration carry full instructional density without breaking learner identity.
- Instruction is always *attributed* — the preceptor's speech or the protagonist's recalled reasoning — never disembodied narrator lecture. Mandatory one-sentence bridge from story to instruction at each seam.
- Workplace-real dialogue; supervisors explain *why* once, clearly; protagonists' internal lines observational, not confessional; no melodrama, no exclamation points in instructional dialogue; the drama is *adaptation*, not incompetence.
- `scene_complete` keeps the story's emotional beat and the systemic completion label in separate sentences — never blended.

## 14. Verifier verdict rules

Adversarial reviewers run the module's design/04 audit checklist (built from these invariants) against every storyboard. Any failure in §§2–5 territory (wording, state-write, citations, verbatim sentences) = automatic FAIL → rewrite. §§6–13 failures = rewrite unless a documented rationale is attached and carried into 00-OVERVIEW's decisions section.
