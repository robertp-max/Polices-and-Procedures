# GAO-001 "A New Journey" — Story Architecture & Interaction Blueprint

**Module:** GAO-001 — Agency Mission, Vision & Values (Medicare-certified, ACHC-accredited HHA orientation)
**Working subtitle:** *A New Journey*
**Status:** Architecture complete — ready for stakeholder review, then engine build (UltraCode/Fable) and scene implementation (Fast Fable)
**Date:** 2026-07-06

---

## 1. What this package is

A complete storyboard and interaction architecture for converting GAO-001 from static page content into a story-driven interactive training journey following Alex Reyes, a newly hired Care Indeed Home Health clinician, through their first week. It was produced by a multi-phase orchestration: codebase recon → design system (story, UX, narration, compliance, learning) → 9 per-scene storyboards, each adversarially verified → global coverage/continuity/feasibility audits → a targeted fix pass resolving every audit finding.

**Preserved (canonical identity — unchanged):** module ID GAO-001; the 9-scene structure mapped 1:1 to the original 9 pages; the ~30-minute duration intent (pacing budget totals 31 min); the existing 10-question quiz (delivery-only change — see §9.1 for the one decision made to keep it untouched); the compliance purpose; the protected outer LMS shell (progress pills, Save & Exit, player controls, routing, quiz engine, certificates, P&P acknowledgment workflow, CES, Evidence, eSign, packets).

**Changed (delivery only):** everything inside the module workspace — layouts, interactions, narration, content distribution.

### Package map

| Path | Contents |
|---|---|
| `00-OVERVIEW.md` | This document — decisions, architecture summary, implementation plan, open items |
| `design/01-story-bible.md` | Alex Reyes character sheet, cast canon, week structure, continuity devices, voice/tone rules, story-instruction seam |
| `design/02-ux-architecture.md` | Learning-unlock verdict, 6 layout templates, scene engine (`SceneConfig`/`useSceneEngine`), redundancy contract, quality bar, handoff split |
| `design/03-narration-system.md` | 4-tier narration model, coverage accounting + CI gate, storage/delivery, accessibility & records defensibility, writing rules |
| `design/04-compliance-framework.md` | Forbidden/safe wording table, state-write separation, per-scene citation map, mandatory-reporting placement, scenario realism limits, audit checklist |
| `design/05-learning-framework.md` | Per-scene objectives, quiz alignment map, interaction-learning fit, 30-min pacing budget, retention devices, redundancy-as-pedagogy |
| `scenes/scene-01…09-*.md` | The 9 full storyboards (story beat, learner role, workspace concept, learning nodes, interaction pattern, Field Notes copy, Reference Notes copy, complete narration drafts, audio/microinteractions, accessibility, QA risks) |
| `audits/*.md` | The three global audit reports (coverage, continuity, feasibility). All coverage/continuity findings have been applied to the scene files; feasibility findings are tracked as implementation tickets in §8 |
| `recon/*.md` | Codebase ground truth: source content inventory (incl. verbatim current narration + quiz), shell integration contract, prototype pattern analysis, narration infrastructure |

---

## 2. The story in one paragraph

Alex Reyes, 34, an experienced acute-care/SNF RN, joins Care Indeed for their first-ever home health role. Monday: orientation at the welcome desk (Scene 1) and a mission briefing with preceptor **Dana Whitfield, RN** (Scene 2). Tuesday: the vision pillars (Scene 3), then a shadow visit with **Mr. Sam Okafor** where values become decisions (Scene 4). Wednesday: Alex processes how different home health is from facility care (Scene 5), then Dana's regulatory-responsibility and mandatory-reporting briefing (Scene 6). Thursday: supervised-solo visits — **Mr. Ray Torres** refuses part of his care (Scene 7), and minutes later Alex notices bruising on his forearm (Scene 8, which also carries the **Mrs. Linh Chen / Grace Chen** off-scope-request scenario). Friday: Dana debriefs the week on a journey map and Alex walks into the post-test ready (Scene 9). The arc is *competent outsider → oriented insider* — grounded and professional, never melodramatic. Narration is close-third on Alex; instruction is always voiced through Dana's speech or Alex's recalled reasoning, never disembodied lecture.

---

## 3. Verdict on the "learning unlock / word reveal" idea

**Adapt — adopted as the universal mechanic, rejected as a fixed layout.** The discover → unlock → Field Notes reveal loop is the core interaction primitive of every scene (it's what the Scene 4 benchmark already proves works). But the literal "left = puzzle map, right = Field Notes, small area = Reference Notes" three-panel skin is rejected: the shell already owns a 420px left rail (Content/Narration tabs), and GAO-001's content is too heterogeneous for one spatial metaphor — a comparison scene and a branching scenario need different shapes. Instead, panel placement is a **per-template concern**:

| # | Scene | Template | Interaction core |
|---|---|---|---|
| 1 | Welcome Desk | JourneyMap (desk waypoints) | Discover email / badge+camera / orientation checklist |
| 2 | Mission Briefing | DiscoveryScene | Verbatim mission card, then 5 phrase hotspots → field-scenario judgment each |
| 3 | Vision Pillars | DiscoveryScene | 4 pillar hotspots, match behavior-to-pillar |
| 4 | Core Values Field Practice | PuzzleBoard (refactored existing engine) | 4 vignette hotspots × 2-phase (identify value(s) → choose action), 6 values covered |
| 5 | Home Health vs. Facility | SplitCompare | 5 contrast dimensions, paired reveals |
| 6 | Mandatory Reporting Briefing | FlowSequence | Duty-card sort + 6-step reporting sequence assembly |
| 7 | Scenario: Patient Refusal (Torres) | DecisionBoard (strictly sequential) | 5-node refusal pathway with judgment feedback |
| 8 | Scenario: Suspected Neglect + Off-Scope Ask | Two-branch DecisionBoard | Branch 1 Chen (scope), Branch 2 Torres bruising (reporting, same visit as Scene 7) |
| 9 | Week Wrap / Readiness | JourneyMap | 8 recap pins → "Ready for Post-Test" |

Every scene passes the interaction quality bar (design/02, §5): at least one consequential choice with real wrong-answer feedback, understanding-gated unlocks, true progress indication, keyboard operability, reduced-motion safety, resumability, safe completion wording.

### Redundancy contract (the anti-duplication rule)

One fact, one home for its full form: **scene surface** = the experience (minimal text); **Field Notes** = plain-language explanation of what was just unlocked (new phrasing); **Reference Notes** = citation + terse surveyor-facing line only; **narration** = the only surface carrying full instructional completeness. The single sanctioned verbatim duplication is the mandatory-reporting sentence in Scenes 6/8 (narration + Field Notes), which is compliance-mandated.

---

## 4. Narration system (the defect fix)

The current GAO-001 narration is summary-only (recon documents this page by page, with the omitted concepts listed). The new system makes narration the **tier of record** for instructional completeness:

- **Four tiers:** `scene_start` (story orientation, 60–120 words) → `node_unlock` (the full instructional payload — every citation, table row, list item; 80–160 words/node) → `feedback` (why right/wrong, both branches) → `scene_complete` (consolidation + bridge, safe completion label).
- **Coverage accounting:** every scene ships a concept checklist derived from the recon inventory; each concept maps to exactly one primary `NarrationSegment` (optionally one reinforcement). A build-time script joins checklist against segments and **fails CI** if any concept is unmapped, if the mandatory-reporting sentence isn't a character-for-character match, or if any forbidden phrase appears in narration text. Gate at ≥90% per scene.
- **Storage:** versioned data modules (`narration/gao001.sceneNN.narration.ts`) with `conceptIds`, `transcriptFlag`, `version`, `approvedBy` — auditable independent of code.
- **Delivery:** pre-generated approved MP3 per segment (primary, records-defensible) → browser TTS labeled "Preview" (fallback only). Muting/skipping audio never blocks progress; the verbatim transcript always renders, and the training record logs text-or-audio delivery per node.

---

## 5. Compliance guardrails (binding)

- **Wording:** no "Policy Attested," "Policy Acknowledged," "PP Complete," "assigned P&P complete," or near-misses (attestation recorded, sign-off, acknowledgment submitted, compliance verified, certification complete). Completion states follow "[Subject] Practice Complete" / "Training Module Complete" / "Ready for Post-Test." The near-miss word test: any completion string containing *attest*, *acknowledg-*, *sign(ed/off)*, or *certif-* is rewritten before ship.
- **State separation (engineering-binding):** scene components never write learner acknowledgment state; they only call `onComplete`. Training-record writes (`withLessonCompleted` etc.) are categorically distinct from P&P acknowledgment state and are never described with attestation language. No scene UI may visually mimic the acknowledgment workflow (no "I confirm" checkboxes or signature lines).
- **Citations:** §484.50 = Patient Rights (first appears Scene 7; also Scene 2's dignity Reference Note per the citation map); §484.110 = Clinical Records (Scene 5 documentation-as-defense; Scene 9 recap); §484.60 = individualized plan of care (Scene 2 patient-centered; Scene 8 Chen feedback). The two must never be swapped; every citation carries its plain-English label and "Informational" framing. No unvalidated state statute numbers — APS/mandated-reporter concepts stay generic.
- **Mandatory reporting:** the exact sentence appears character-for-character in Scenes 6 and 8, in both narration and Field Notes: *"Follow agency mandatory reporting protocol immediately; do not investigate or confront — your job stops at reporting the facts."* Reasonable suspicion, not proof, triggers reporting. No branch rewards investigation, confrontation, or unilateral external reporting. Scene 8's depiction is non-graphic and clinical-observational; the story ends at "reported, protocol followed" — never at a guilt/innocence verdict.

---

## 6. Learning & quiz alignment

The 10-question quiz is preserved unchanged. Post-fix alignment: Q01 → Scene 2's verbatim on-screen mission card + narration read; Q02 → Scene 9 readiness pin; Q03 → Scene 3 "Regulatory Leadership" pillar node (see §9.1); Q04 → four spaced touches (S2 table → S6 sequence → S8 applied → S9 recap); Q05/Q08 → Scene 5; Q06 → Scene 8 Branch 1 (Chen); Q07 → Scene 4 scene-start (values are evaluated expectations for all employees) reinforced in S9; Q09 → Scene 9 (80% / 3-business-day retake / 3-attempt cap); Q10 → Scene 2 regulatory-integrity node.

Pacing: 31 minutes total across the 9 scenes (S1 2.5, S2 4.5, S3 3, S4 5, S5 3.5, S6 4, S7 2.5→~3.5 as drafted, S8 4, S9 2). Max 4–6 nodes/scene; every hotspot has a visible affordance (no pixel-hunting); max 2 failed attempts before a direct hint; wrong answers always explain why the tempting choice fails. The original page-7 knowledge checkpoints are distributed as retrieval moments (S2/S5/S9) rather than kept as a standalone quiz-like page — Scene 7 instead carries the patient-refusal scenario per the brief.

---

## 7. What the audits found and how it was resolved

Three independent global audits ran after per-scene adversarial verification. **All coverage and continuity findings have been applied to the scene files in this package.** Highlights:

- **[CRITICAL, fixed]** Scene 3's draft renamed the pillars and orphaned quiz Q03 (correct answer: "Regulatory Leadership"). Resolved per §9.1.
- **[HIGH, fixed]** The verbatim mission statement was never displayed or spoken (Q01's recognition target) → now an on-screen card + narration read in Scene 2's opening.
- **[HIGH, fixed]** Excellence and Compliance lacked dedicated teaching moments in Scene 4 → now primary values of the Missing-Supply and Documentation-Pressure vignettes respectively, with their own narration segments; a value-to-vignette matrix was added.
- **[Continuity, fixed]** Dana unnamed in Scene 2; Scene 9 recapping retired pillar names; Scene 8's bruising patient anonymized despite Scene 7 establishing Mr. Torres (now the same visit, minutes later); Chen cast unnamed; missing Okafor callbacks in Scenes 7/8; field-notebook prop drift in Scene 8; two Scene 9 Field Notes in textbook voice; PT→RN→MSW example truncated; five surveyor sample questions collapsed to three; Marcus Odom (story-bible peer) never appearing — all applied.
- **Feasibility findings are implementation constraints, not storyboard defects** — they became the ticket list in §8.

---

## 8. Implementation plan

### 8.1 Pre-existing live defects (fix independently, before or alongside this work)

1. `CoreValuesInteractiveViewer.tsx:1029` displays **"POLICY CO-CP-001 ATTESTED"** — a live forbidden-wording violation shipping today. Replace with "Core Values Practice Complete."
2. `CoreValuesInteractiveViewer.tsx:~144` cites §484.50 in a non-patient-rights context (per audit) — verify and correct.
3. `CareIndeedOnboardingLMS.tsx` GAO-001 metadata lists "42 CFR §484.110 — Condition: Patient Rights" — §484.110 is Clinical Records; Patient Rights is §484.50.

*(A background task chip has been raised for these.)*

### 8.2 Shell-side tickets (small, additive, ordered — these block scene work)

1. **Card-id addressability** — resolve whether GAO-001 content cards carry a stable id; if not, add one. Blocks the `SceneRegistry` discriminator for all 9 scenes (today's title-regex matching is fragile and has a known false-positive risk).
2. **Scene progress persistence** — add `sceneProgress[moduleId::lessonId]` snapshot via the existing `useLearner()` path + `SceneProps.initialState`. One ticket, not nine QA-risk restatements; every scene's Save & Exit/resume behavior depends on it. Today `onComplete` wires to nothing but `console.info` (`ModulePlayerScreen.tsx:1144–1155`).
3. **Narration audio decision** — fund pre-generated MP3 production (recommended; required for records defensibility) or explicitly descope to transcript + TTS-preview for v1. Decide before finalizing per-scene narration contracts (~9,000 words of script are drafted and ready either way).
4. **Shared primitives before scenes** — one `<SceneModal>` (single transition spec; the four bespoke timings in scene drafts are superseded by this contract), one `useSceneAudio()` SFX enum (the per-scene pitch descriptions are flavor guidance, not separate synths), `<ChoiceButton>`, `<ProgressChip>`, `usePhaseGate`, `useUnlockTracking`, `<MuteToggle>`, focus-trap/keyboard/reduced-motion framework.
5. **`canContinue` gating decision** — product must decide once whether scene completion hard-gates Next. Recommendation: non-blocking for v1 (matches current shell), with the in-scene "Practice Complete" state as the visible gate.
6. **Two-store sync check** — `handleNext` writes both `withLessonCompleted` and `useJourneyStore.recordLearnerCompletion`; verify both remain consistent with any gating change (silent admin-reporting discrepancy risk).
7. **Narrow-viewport budget** — verify Scenes 6/8's multi-region layouts against the shell's own `<lg` stacking before committing to their mobile behavior.

### 8.3 Per-scene build order & effort (from the feasibility audit)

| Effort | Scenes | Riskiest pieces |
|---|---|---|
| **S** | 3, 9 | PNG-coordinate overlay brittleness (S3); S9 is read-only pins |
| **M** | 1, 4, 5, 7 | S1 camera-capture fallback inside the embedded shell (highest field-failure risk in the set — see §9.2); S4 forbidden-string non-reintroduction check; S5 net-new SplitCompare template + 3-attempt auto-resolve; S7 strict sequential unlock + resume correctness |
| **L** | 2, 6, 8 | S2 review-mode vs discovery-mode dual rendering; S6 drag/tap-to-order with full keyboard equivalence (net-new engineering); S8 two-branch state machine with resume/deep-link correctness |

Suggested order: shell tickets → primitives + engine → S3 (cheapest DiscoveryScene proof) → S4 (PuzzleBoard refactor of the existing benchmark) → S1 → S5 → S2 → S6 → S7 → S8 → S9.

### 8.4 Handoff split

**UltraCode/Fable (architecture):** scene engine (`useSceneEngine`, `SceneConfig`/`SceneNode` types, state machine), persistence wiring, shared primitives, `SceneRegistry` discriminator refactor, `NarrationRef` schema + `narrationManifest.ts` extension, the six template shells, refactor of `CoreValuesInteractiveViewer` (→ PuzzleBoard reference implementation) and `GAO001Scene01WelcomeDesk` (→ JourneyMap Scene 1), the CI coverage/forbidden-string/verbatim-sentence checks.

**Fast Fable (mechanical, once engine + templates exist):** each scene's `SceneConfig` (nodes, labels, hotspot coordinates, options/feedback), Field Notes / Reference Notes copy wiring per the redundancy contract, narration script data entry per tier, scene art positioning, citation placement verification, exact-sentence insertion in Scenes 6/8.

---

## 9. Decisions made during synthesis (flip-able — flag if you disagree)

1. **Vision pillar canon = Clinical Excellence, Workforce Growth, Regulatory Leadership, Community Trust.** The brief suggested "Continuous Improvement" as a possible fourth pillar, but existing quiz Q03's correct answer literally names "Regulatory Leadership" (survey-ready every single day). Since preserving the 10-question quiz is canonical, Regulatory Leadership was restored and the continuous-improvement framing folded into other pillar narration. *Alternative:* keep Continuous Improvement and rewrite Q03's stem/options — a quiz-content change requiring stakeholder approval. *Minor cosmetic note:* Q03's distractor options still say "Workforce Development" (the original name) while the taught pillar is "Workforce Growth" per the brief; since it's only a distractor the quiz works unchanged, but for vocabulary consistency either rename the pillar back to Workforce Development or relabel that one distractor.
2. **Scene 1 badge camera:** the brief says *simulate* turning on a camera; the existing prototype uses real `getUserMedia` capture. Recommendation: ship the simulated moment (placeholder portrait) as default, keep real capture as an optional enhancement behind graceful permission fallback — real camera permission inside the embedded shell is the audit's #1 field-failure risk.
3. **Scene 8 carries both source scenarios.** The original page 8 contained two scenario challenges (bruising + off-scope request). The brief assigns Scene 7 to refusal and Scene 8 to suspected neglect; the Chen off-scope scenario (quiz Q06's target) lives as Scene 8 Branch 1 so no source scenario is lost. Branch 2 (bruising) is the same Torres visit continuing minutes after Scene 7 — one continuous story.
4. **Character rename:** current live narration calls the protagonist **Lina Reyes**; the brief specifies **Alex Reyes**. The new canon is Alex throughout; implementation replaces Lina.
5. **Knowledge-checkpoint page dissolved:** original page 7's three ungraded checkpoints are redistributed as retrieval moments (S2/S5/S9) since the brief assigns Scene 7 to the refusal scenario. No checkpoint content is lost (coverage audit verified).

## 10. Open items for stakeholders

- Approve the pillar-canon decision (§9.1) — the only item that touches quiz-adjacent content.
- Fund or descope narration audio production (§8.2.3).
- Confirm non-blocking `canContinue` for v1 (§8.2.5).
- Confirm simulated-vs-real camera for Scene 1 (§9.2).
- The mandatory-reporting sentence's canonical source string lives at `CoreValuesInteractiveViewer.tsx:142` — implementation must copy-paste, never retype, and the CI check enforces the match thereafter.
