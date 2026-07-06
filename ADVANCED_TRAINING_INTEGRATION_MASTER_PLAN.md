# ADVANCED_TRAINING_INTEGRATION_MASTER_PLAN.md

**Coordinator**: Grok 32-agent (4 teams of 8)  
**Scope**: Local repo only. Integrate 4 CI-ION training repos into host `src/policy/journey` ADV expansion.  
**Preservation**: ≥97% existing Journey UX (launch, cards, stats, player flow, store, gating, evidence, signatures, no-PHI footer).  
**Goal**: Cohesive Care Indeed clinical training cockpit with 4 domain-specific UIs. Replace Gemini generic identical shells for GAO-01/02 and add 03/04.  
**Date**: 2026-06-30

## 1. Executive Summary

All 4 repos locally accessible and inventoried with file evidence. Host Journey already has partial Gemini-started integration for cms-485 and qapi (data, adapter, LMS track, special player labels, cases). 

**Readiness**:
- Content/narration: high fidelity in repos (exact scripts, cards, cases, rationales, audio).
- Current UI: generic (shared Journey player + quiz page for ADV) — not acceptable per spec.
- Opportunity: repo features provide excellent seeds (CMS485Form + rationale review; OASIS Item/Evidence; Documentation scenarios + auditorConclusion; QAPI indicators/PIP).

**Recommendation**: Introduce shared `AdvancedTrainingPlayer` shell + 4 uiVariant inner panels. Extend ADV track to 4 modules (GAO-01..04). Keep ids compat where needed. All changes additive/minimal to core Journey contracts.

Repo readiness scores: 85-92% (full content + simulator logic present; porting required).

## 2. Repo Readiness Score

- CMS-485 (TEAM1): 90 — excellent cases + form simulator + narration mapped in host already.
- Documentation (TEAM2): 88 — 8 modules + 15+ practice scenarios + rich rationale/auditor fields + audio.
- OASIS-E2 (TEAM3): 85 — massive item-level audio + rationale + evidence anchors (largest asset).
- QAPI (TEAM4): 87 — structure parallels CMS485; indicators/PIP/RCA content present.

Content/narration completeness: 90+ (verbatim csv + wav + cards verified).

Gemini UI compatibility: 3/10 (generic, identical patterns).

## 3. Content/Narration Completeness Score

All teams have source-of-truth files with exact narration text. Host has already captured cms-485/qapi narrations in data files (preserve 100%). Other two ready for extraction.

## 4. Gemini UI Compatibility Score

Low. Identical shells for CMS-485/QAPI. Specialized seeds exist in repo final-exam / simulator folders. Must supersede with domain variants.

## 5. Exact Modules to Create/Update

1. **GAO-01** CMS-485 Plan of Care and Compliance Integration
   - id: "cms-485" (compat) + code GAO-01
   - domain: CMS_485
   - uiVariant: plan_of_care
   - assessmentType: simulator
   - completionGate: "Complete Plan of Care simulator final cases."
   - passThreshold: 80 (align repo)
   - 5 lessons + 3 final cases (Henderson, Alvarez, Okafor)

2. **GAO-02** Quality Assessment and Performance Improvement (QAPI) Training
   - id: "qapi"
   - domain: QAPI
   - uiVariant: qapi_board
   - assessmentType: hybrid
   - completionGate: "Complete QAPI case lab and final knowledge check."

3. **GAO-03** OASIS-E2 Start of Care Assessment
   - New
   - domain: OASIS_E2
   - uiVariant: oasis_lab
   - assessmentType: case_lab
   - completionGate: "Complete SOC coding simulator and rationale checks."
   - Key items: GG, M0300 wound, B/C/D behavioral, meds, homebound/skilled

4. **GAO-04** CMS Documentation Matters / Documentation Defensibility
   - New
   - domain: DOCUMENTATION
   - uiVariant: documentation_lab
   - assessmentType: hybrid
   - completionGate: "Complete documentation defensibility scenarios."
   - 8 modules + practice lab (15) + final

## 6. Recommended Advanced Training Information Architecture

- Track: "ADV" in CareIndeedOnboardingLMS / journey catalog
- Landing: header "Advanced Training", subtitle "Specialized Compliance & Plan of Care • Reports to Clinical Manager / DON"
- 4 cards (differentiated micro visuals + chips: Role, Duration, Scenes, Simulator/Quiz/CaseLab, Policy refs, Mapped narration ✓, Evidence ✓)
- Completion gate per track or per module.
- Launch → AdvancedTrainingPlayer (shared) with variant inner.
- Store / evidence / signature / clearance unchanged.

## 7. New UI Design Specification

**Preserve** (97%+):
- Header/subtitle/gate/footer no-PHI.
- Card stats model (% Complete, Questions, Best Score).
- Launch, progress, completion tracking, prerequisites, evidence capture, scoring, gates.

**Improve / Differentiate**:
- Base card: white/glass 20-24px radius, subtle shadow, teal title.
- Top: GAO-0x + domain badge.
- Mini visual per variant (trace line / KPI spark / item evidence check / note + surveyor).
- Chips row.
- Player: shared shell (title/progress/score/policy | left lesson rail | center content/sim | right evidence/refs | bottom nav).
- Domain:
  - plan_of_care: CMS485Form + Evidence + mandatory rationale review (from repo final-exam)
  - qapi_board: KPI tiles, PIP timeline, RCA tree, committee checklist
  - oasis_lab: timepoint rail, ItemCard (data/obs/response/rationale), evidence anchors, error-risk
  - documentation_lab: excerpt comparison, defensible/weak panels, surveyor lens, scenario grid with auditorConclusion

Calm, clinical, survey-ready. High contrast. Use lucide (already in host). No pastel, no gamification beyond progress/score.

## 8. Shared Advanced Training Shell Specification

- `AdvancedTrainingPlayer.tsx` (new, in journey/components/advanced)
- Props: moduleId, variant
- Layout respects keyboard/screen reader (Journey patterns).
- Integrates existing: GateBanner, EvidenceCapture, SignaturePad when needed.
- Progress from journeyStore attempts.

## 9. Module-Specific Player Designs

See 7 + team UI findings. Port logic (scoring, cases, rationales) not the generic outer UI from repos.

## 10. Data Model Additions

Add/use `AdvancedTrainingModule` contract (per query).

Extend host ModuleDef injection with:
- code, uiVariant, assessmentType, passThreshold, evidenceOutput[], narrationMapStatus, simulatorCases?

Keep lesson + cards for narrative lessons; special final handling per variant.

Update adapter for new ids.

## 11. Journey Module Catalog Patch

- ADV track moduleIds: ["cms-485", "qapi", "oasis-e2-soc", "documentation-matters"]
- Or use GAO-01..04 consistently (alias for compat).
- Add to CareIndeedOnboardingLMS ADV definition + individual TrainingModule objects.
- Keep existing GAO numeric for orientation.

## 12. Scoring / Completion / Evidence Rules

- CMS-485: simulator 80% + mandatory rationale → evidence + recordLearnerCompletion or manual.
- Others: hybrid quiz + lab scores.
- Best score tracked via attempts (existing store).
- Evidence: addEvidence per completion artifact (cases, rationales, PIP, coded items, defensibility).
- Gates: existing Journey + supervisor for ADV.

## 13. Narration Mapping Preservation Plan

- Verbatim from repo csv / host cards.
- Map ids (e.g. Module1_Lesson1_...) to player locations.
- Use or extend cms485AudioLocations pattern + new manifests.
- Do not alter text.

## 14. Test Plan

- Per-team QA sections.
- Regression: non-ADV modules unaffected.
- Build: `npm run build`
- Manual flows for each variant.
- Narration text snapshot for first lesson of each.
- Evidence produced + gate satisfied.
- Role restrictions (OASIS RN).

## 15. Implementation Sequence

1. Status + all team reports (done).
2. Shared player shell (neutral).
3. GAO-01 plan_of_care panel + data align (highest priority, already seeded in host).
4. GAO-02 qapi_board (align existing partial).
5. GAO-03 + 04 data + panels.
6. Landing card variants + chips in LMS.
7. Audio wiring + full test.
8. Lint/build/verify.
9. Update docs / acceptance checklist.

## 16. Rollback Sequence

- Revert ADV module additions in adapter/LMS.
- Disable variant panels (conditional render).
- Restore old quiz page if needed.
- Git revert patches. Store data remains (id-keyed).

## 17. Final Acceptance Checklist

- [ ] All 4 repos inventoried with file paths.
- [ ] Narration mapped or missing flagged.
- [ ] 4 unique domain UIs (no generic identical).
- [ ] 97%+ Journey UX recognizably same (cards, stats, launch, store, gates).
- [ ] Existing Journey pages/gates unbroken.
- [ ] GAO-01/02 Gemini generic corrected.
- [ ] GAO-03/04 implemented.
- [ ] No PHI.
- [ ] Stats + gate + evidence visible.
- [ ] policy/workflow/event refs defined.
- [ ] `npm run build && npm run lint` clean (or honest report).
- [ ] Master plan + team reports present.

**Next**: Execute patches using team PATCH_PLANs (minimal). Validate with build commands. Use check-work skill if available for review.

**Files produced**:
- GROK_32_AGENT_ADVANCED_TRAINING_STATUS.md
- 4× TEAMx_*_*.md (24 reports total)
- This master.

Ready for controlled implementation.
