# GAO-001 "A New Journey" — Compliance Framework Specification

## 1. GUARDRAIL SPEC

### 1.1 Forbidden / Safe Wording Table

| Forbidden (and near-miss variants) | Why | Safe Replacement |
|---|---|---|
| "Policy Attested" / "Policy Acknowledged" | Implies formal P&P attestation completed | "Scene Practice Complete" |
| "PP Complete" / "P&P Complete" / "assigned P&P complete" | Implies formal P&P workflow satisfied | "Training Module Complete" |
| "Attestation Recorded" / "Attestation Complete" / "Attestation Saved" | Near-miss — implies formal attestation write | "Practice Progress Saved" |
| "Policy Sign-off Done" / "Policy Signed" / "Signed Off on Policy" | Near-miss — implies eSign/acknowledgment | "Ready for Post-Test" |
| "Acknowledgment Recorded" / "Acknowledgment Submitted" | Near-miss — conflates training with ack workflow | "Learning Node Unlocked" |
| "You Have Acknowledged..." / "You Have Attested..." (any subject + attest/acknowledge verb about policy) | Implies legal attestation act occurred | "You Have Practiced..." / "You Have Reviewed..." |
| "Compliance Confirmed" / "Compliance Verified" (as a completion state) | Implies formal compliance sign-off | "Core Values Practice Complete" |
| "Certified" / "Certification Complete" (outside the real certificate flow) | Collides with protected certificate system | "Mission Practice Complete" |
| "Onboarding Attestation" (as used in current Page 9 callout) | Legacy phrase already flagged as attestation-adjacent — must not carry into new scenes | "Training Completion Summary" |
| "This constitutes your formal attestation" | Direct forbidden-pattern match | "This confirms you've completed the practice content" |

**Rule — near-miss test:** any completion string containing the words *attest*, *acknowledg-*, *sign(ed/off)*, or *certif-* (outside the protected certificate screen) must be rewritten before ship. Writers should run this word list against every scene's completion copy.

### 1.2 Completion-State Naming Rule (per scene)
- Every scene's terminal state uses the pattern: **"[Scene Subject] Practice Complete"** (e.g., "Mission Practice Complete," "Core Values Practice Complete," "Escalation Practice Complete," "Documentation Practice Complete").
- Module-level terminal state: **"Training Module Complete"** → **"Ready for Post-Test"**.
- Never use "Complete" alone without the word "Practice" or "Training" qualifying it — bare "Complete" reads ambiguously as policy-complete to reviewers/surveyors skimming a screenshot.
- Scene completion copy must not use second-person legal-toned verbs ("you certify," "you agree," "you attest"). Use descriptive/observational verbs: "you explored," "you practiced," "you reviewed."

### 1.3 State-Write Separation Rule (binding on engineering, not just copy)
Per shell recon: the **only** sanctioned attestation/ack write path is `Module0OrientationPage`'s `acks0` checkboxes → `useLearner()` state, and the real P&P acknowledgment workflow is a separate assigned system entirely outside this module. Therefore:
- New scene components (all 9) **must never call `useLearner()` directly** to write acknowledgment/attestation fields. Scenes only call their `onComplete` prop — a local, scene-scoped callback.
- Scene `onComplete` → may feed `sceneComplete` state inside `LessonPlayerPage` → may feed `canContinue` → may (via existing `handleNext`) write `withLessonCompleted` (training-record state only). This is the sole approved path from scene interaction to persisted state.
- Training-record writes (`withLessonCompleted`, `withModuleAssessment`, `recordExamAttempt`) are **training-progress state** and are categorically distinct from **P&P acknowledgment state** (`acks0`/orientation checkboxes and the separate eSign/CES/packet systems). No scene, narration string, or Field Note may describe a training-record write using acknowledgment/attestation language, because the underlying state it touches is not the P&P system.
- Any storyboard that proposes a checklist, signature line, or "I confirm" checkbox inside a scene must be flagged — that shape of UI is what the real P&P workflow owns, and duplicating its visual language inside training is itself a defect even without forbidden text.

---

## 2. CITATION MAP (per scene)

**Global framing rule:** every citation in Reference Notes must be introduced as informational, not adjudicated. Template stem: *"Reference: [citation] — [one-line plain description]. Informational; see policy [code] for the governing requirement."*

| Scene | May Cite | Framing | Must NOT Cite / Must Not Mislabel |
|---|---|---|---|
| 1 — Welcome / Orientation | Part 484 generally; ACHC accreditation (fact of); HR-TA-001 §6.9 | "Care Indeed operates under 42 CFR Part 484 and is ACHC-accredited — informational context for your role." | No §484.50 or §484.110 yet (too early/unearned) |
| 2 — Mission | §484.60 (Plan of Care/individualized care) | "Reference: 42 CFR §484.60 — care must be individualized to the patient's assessed needs. Informational; supports the 'Patient-Centered' mission phrase." | Do NOT cite §484.110 as Patient Rights (legacy defect). Do NOT introduce §484.50 here — reserve for Scene 7. |
| 3 — Vision (4 Pillars) | ACHC Home Health Standards (survey-readiness pillar); CMS State Operations Manual Appendix B (survey protocol) | "Reference: CMS SOM Appendix B — describes the survey protocol ACHC/CMS use. Informational." | No Part 484 condition-level citations needed; avoid implying vision pillars are themselves regulatory text |
| 4 — Core Values | HR-TA-005 Appendix A (orientation checklist, informational) | "Reference: HR-TA-005 Appendix A — general orientation checklist. Informational." | No CFR citations required; do not attach §484.110 to "Integrity/documentation" values here — save documentation citation for Scene 5 |
| 5 — Home Health Differences / Documentation-as-Defense | **§484.110 — Clinical Records** (correct usage) | "Reference: 42 CFR §484.110 — Conditions of Participation: Clinical Records. Governs documentation completeness and retention. Informational." | Must NOT be relabeled "Patient Rights" anywhere. Must not appear paired with dignity/respect language. |
| 6 — Mandatory Reporting (elder abuse/neglect) | Part 484 generally (staff responsibility); state APS/mandated-reporter concept (kept generic — no specific statute number unless legally validated) | "Reference: Federal and state law require reporting of suspected abuse, neglect, or exploitation. Your state's Adult Protective Services (APS) framework governs external reporting; Compliance/supervisor initiates it. Informational." | Do NOT cite a specific state Penal/WIC section unless separately validated (guardrail 6). Do NOT cite §484.50 here as if patient-rights language substitutes for reporting duty. |
| 7 — Patient Refusal / Rights | **§484.50 — Patient Rights** (correct usage, first appearance) | "Reference: 42 CFR §484.50 — Conditions of Participation: Patient Rights. Covers dignity, informed participation, and the right to refuse treatment. Informational." | Must NOT be relabeled Clinical Records. Do not cite §484.110 here even though refusal must be documented — documentation duty is a consequence, not the rights citation itself (keep the two citations conceptually separate in the same scene if both appear). |
| 8 — Escalation Decision (suspected neglect follow-through) | Repeats §484.50 (patient dignity during the encounter) only if directly relevant; primary citation is the reporting-duty concept, not a new CFR number; ACHC survey-interview expectation | "Reference: Staff may be interviewed by a surveyor about how a concern was handled. Reporting duties are informational context, not legal advice." | Same restriction as Scene 6 on state statute numbers; do not introduce §484.110 as a reporting citation |
| 9 — Survey Readiness / Completion | Part 484 generally; ACHC deemed-status survey concept; CMS SOM Appendix B | "Reference: Surveyors may ask any staff member about mission, reporting, and documentation practices at any time. Informational." | No new/single CFR number should be introduced as "the" survey citation — keep general |

**Standing rule:** §484.50 and §484.110 must never both be cited as if interchangeable, and neither may appear without its correct one-line descriptor from this table. Any storyboard draft that pairs "dignity/respect" with §484.110, or "documentation/clinical record" with §484.50, is a hard defect.

---

## 3. MANDATORY REPORTING LANGUAGE PLACEMENT

**Exact sentence (verbatim, no paraphrase, no partial use):**
> "Follow agency mandatory reporting protocol immediately; do not investigate or confront — your job stops at reporting the facts."

### Placement (binding)
- **Scene 6**: must appear verbatim in (a) narration at the feedback tier (after learner's decision point) and (b) Field Notes for the node that unlocks the reporting decision. Field Notes may add framing text around it but must reproduce the sentence unaltered, not summarized.
- **Scene 8**: same dual placement (narration feedback tier + Field Notes), applied to the escalation-follow-through decision point.
- No paraphrased near-equivalents ("report right away," "let your supervisor handle it") may substitute in these two scenes' feedback/Field Notes slots — the exact sentence is the compliance-defensible unit; paraphrase elsewhere in the scene is fine as long as this sentence also appears intact at the specified tiers.
- Source precedent: this exact sentence already exists at `src/policy/journey/components/CoreValuesInteractiveViewer.tsx:142` as a correct-answer option — reuse that string verbatim (copy-paste, do not retype) to guarantee character-for-character match.

### Binding behavioral rules for scenes 6 and 8
1. **No investigation/confrontation coaching.** No branch, "wrong answer" option, or narration line may coach the learner to ask the family member/caregiver follow-up questions aimed at determining guilt, confront a suspected abuser, or independently contact APS from the home. Wrong-answer options may *depict* these as tempting-but-incorrect choices (with feedback explaining why), but no path may reward or validate them.
2. **Reasonable-suspicion standard — no proof required.** Narration and Field Notes must state plainly that reporting is triggered by *reasonable suspicion*, not by certainty or proof. Safe phrasing: "You do not need proof to report — reasonable suspicion is enough, and it is required." Never write "only report if you are sure" or "confirm it's real before reporting."
3. **Non-graphic depiction constraint (abuse scenario, Scene 6/8 source material — Mr. Torres-style bruising example).** Permitted: clinical-observational language (location, size, color of bruising; timeline — "not present last visit"; patient's verbatim quote; caregiver's location during visit). Forbidden: graphic/sensationalized description, speculative narrative about how the injury occurred, dialogue that dramatizes fear/violence, any depiction of the alleged act itself. Keep the register clinical and restrained, matching the existing Scenario 1 tone.
4. **Objective vs. subjective documentation — safe examples to show:**
   - Objective (safe/correct model): "Two bruises noted on left upper arm, approximately 2cm, purple-blue in color, not present at prior visit on [date]. Patient stated, 'I am clumsy, I bump into things.' Patient's son was in an adjacent room during observation."
   - Subjective (safe example of what NOT to write, shown as a contrast/teaching example, not as a model to emulate): "Patient's son is probably abusing him" or "I think something is wrong at home" — flag these explicitly as conclusions/opinions that do not belong in the clinical record; the correct action is to document facts and report suspicion through the proper channel (verbally/via incident process), not to write accusations into the chart.

---

## 4. SCENARIO REALISM LIMITS

### Scene 7 — Patient Refusal
**May depict:** patient (capacity assumed/unimpaired unless the storyboard explicitly states otherwise) declining a treatment/task; clinician explaining risks/benefits in plain language; clinician offering alternatives; clinician documenting the refusal and the education given; clinician notifying supervisor/care team per protocol.
**Must depict (non-negotiable beats):** (1) capacity is assumed — no cognitive-impairment framing used as a workaround to override refusal; (2) risks are explained *before* documentation, not skipped; (3) zero coercion — no pressure tactics, guilt language, or "just do it anyway" branch is ever rewarded; (4) the resolution always ends in document + notify, never in silent compliance with the refusal nor in overriding it.
**Must NOT depict:** clinician proceeding with treatment against refusal; clinician arguing/pressuring/bargaining coercively; framing refusal as a "problem patient" or non-compliance issue; any suggestion that refusal must be "talked down" until the patient agrees.
**Patient-rights framing (ties to §484.50):** narration/Field Notes should state plainly: "Patients have the right to refuse treatment. Your role is to ensure the refusal is informed — explain risks and alternatives — then respect the decision, document it, and notify the care team."

### Scene 8 — Suspected Neglect/Abuse Follow-Through
**May depict:** the clinician's internal decision process after Scene 6's observation; a conversation with a supervisor (clinician relaying facts, supervisor confirming next steps); a depiction of "what happens after you report" (supervisor/Compliance-led external reporting) to reassure learners reporting isn't solely on them.
**Must NOT depict:** the clinician personally contacting APS/law enforcement as the primary/rewarded path (that responsibility routes through supervisor/Compliance per the mandated sentence); any resolution scene showing an outcome/verdict about the family (no confirmation of guilt or innocence — the training scene ends at "reported, followed protocol," not at "and it turned out..."); confrontation with the family member as a valid branch.
**Escalation chain wording (must match Scene 6/8 sentence exactly in spirit and, at the specified tiers, verbatim):** "You report facts and reasonable suspicion to your supervisor. Supervisor/Compliance leads any required external reporting. Your job is not to investigate, confirm, or delay — it is to document, report, and let the process work." This wording may be paraphrased in narration/Field Notes *outside* the exact-sentence placements specified in Section 3, but must never contradict it (e.g., must never imply the clinician should wait for supervisor availability before reporting internally, or that the clinician should gather more evidence first).

---

## 5. AUDIT CHECKLIST (verbatim for verification agents — run against every scene storyboard)

**A. Forbidden wording**
- [ ] No instance of "Policy Attested," "Policy Acknowledged," "PP Complete," "assigned P&P complete," or any near-miss (attestation recorded, policy sign-off done, acknowledgment recorded/submitted, "you have acknowledged/attested," compliance confirmed/verified, certification complete outside the real cert screen).
- [ ] All scene completion strings follow "[Subject] Practice Complete" / "Training Module Complete" / "Ready for Post-Test" pattern.

**B. State-write boundary**
- [ ] Scene component does not import or call `useLearner()` directly.
- [ ] Scene only communicates via `onComplete` callback.
- [ ] No UI element (checkbox, signature line, "I confirm" button) visually mimics the P&P acknowledgment workflow.
- [ ] No copy describes a training-record write using attestation/acknowledgment language.

**C. Citation accuracy**
- [ ] §484.50 appears only in Patient Rights contexts (dignity, refusal, informed participation, grievance) — never relabeled.
- [ ] §484.110 appears only in Clinical Records/documentation contexts — never relabeled as Patient Rights.
- [ ] Each citation used in this scene matches its assigned scene(s) per the Citation Map (Section 2) — no citation appears in a scene not authorized to carry it.
- [ ] Every citation follows the Reference Note template (citation + one-line description + "Informational" qualifier).
- [ ] No unvalidated state-specific statute numbers (APS/mandated-reporter) — generic framing only.

**D. Mandatory reporting language (Scenes 6 & 8 only)**
- [ ] Exact sentence present verbatim in narration (feedback tier).
- [ ] Exact sentence present verbatim in Field Notes.
- [ ] No paraphrase substitutes for the exact sentence at these two placements.
- [ ] No branch rewards investigation, confrontation, or unilateral external reporting by the clinician.
- [ ] Reasonable-suspicion standard stated explicitly; no "must be certain/proof" language.
- [ ] Abuse-related content is non-graphic; observational/clinical register only.
- [ ] Objective documentation example shown; subjective/conclusory example shown only as contrast, clearly labeled as incorrect.

**E. Scenario realism (Scenes 7 & 8)**
- [ ] Scene 7: capacity assumed, risks explained pre-documentation, zero coercion, ends in document + notify.
- [ ] Scene 7: no branch shows treatment proceeding against refusal or patient being pressured.
- [ ] Scene 8: resolution ends at "reported, protocol followed" — no guilt/innocence verdict depicted.
- [ ] Scene 8: supervisor/Compliance shown as owner of external reporting, not the clinician.

**F. Redundancy/distribution discipline**
- [ ] Scene (experience), Field Notes (what was unlocked), Reference Notes (citations), and narration (full instructional coverage) do not duplicate identical sentences except where Section 3 mandates intentional verbatim repetition.
- [ ] Narration covers 90-100% of required concepts for the scene (mission terms / operational expectations / CMS references / documentation duties / escalation duties / reporting protocol as applicable) — not summary-only.

**G. Canonical identity preservation**
- [ ] Scene maps to one of the original 9-page structure's instructional concepts (no invented content unrelated to source inventory).
- [ ] 10-question quiz content is not altered by scene redesign (delivery-only change).
- [ ] 30-minute intent and compliance purpose preserved.

**Verdict rule for reviewers:** any single unchecked box in sections A, B, C, or D is an automatic FAIL requiring rewrite before the scene proceeds. Sections E, F, G failures require rewrite unless a documented rationale is attached.
