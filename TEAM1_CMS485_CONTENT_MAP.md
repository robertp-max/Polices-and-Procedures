# TEAM 1 — CMS-485 CONTENT_MAP.md

**ModuleId (proposed canonical)**: cms-485 (host) → GAO-01 CMS-485 Plan of Care and Compliance Integration (per master spec)  
**Source repo**: C:\AI\Git\training\CI-ION\CI-ION_CMS-485_Plan_of_Care  
**Host data**: src/policy/journey/data/advancedTraining/cms485PlanOfCare.data.ts + cms485PlanOfCareCases.data.ts  
**Narration fidelity**: Preserved verbatim from host cards + repo sources unless typo documented.

## Module Record (current + recommended)

- id: "cms-485" (compat) / code: "GAO-01"
- title: "CMS-485 Plan of Care and Compliance Integration"
- duration: "2.0 hr" (host)
- questionCount / simulator cases: 3 final cases (host + repo)
- assessmentType: "simulator" (final cases)
- passThreshold: 80 (repo engine) / currently 100 in host adapter for cases
- uiVariant: "plan_of_care"
- completionGate: "Complete Plan of Care simulator final cases."
- policyRefs: ["CL-CP-001"]
- workflowId / eventId: TBD (recommend "wf-cms485-poc", "evt-cms485-completion")
- evidenceOutput: ["poc-audit-evidence", "case-rationale-review", "signature-gate"]
- narrationMapStatus: "verified" (host cards already have full scripts)

## Lessons / Cards / Narration (from host data + repo trainingCards + sections)

Host lessons (from cms485PlanOfCare.data.ts evidence):

1. **l1 — Foundation** (estMinutes: 10)
   - Scenario: ADR review, coherent story requirement.
   - Cards (examples):
     - cms_485_l1_s1_overview: "What CMS-485 Is and Why It Matters"
       - narration_script / transcript_text: full ~88s text starting "What exactly is the CMS-485..." (preserved)
       - learner_facing_content, why_it_matters, key terms (CMS-485, POC, ADR, Certification Period, Defensibility)
     - cms_485_l1_s1_delivery, cms_485_l1_s1_challenge
   - Additional cards for s2 (Regulatory?), etc.

2. **l2** (multiple s3/s4)
3. **l3**
4. **l4**
5. **l5**

Repo source alignment:
- SECTIONS in trainingCards.ts: 'Foundation', 'Regulatory Authority', 'Certification Lifecycle', 'Orders & Signatures', 'Eligibility' (maps to lessons l1+)
- Each TrainingCard = {title, section, objective, bullets, auditFocus?, challenge: {scenario, question, options[0=correct], correctLogic }}
- Narration: separate audio + challenges in repo trainingCards map to host card narrations.

**Exact source paths for items**:
- Host cards + transcripts: `src/policy/journey/data/advancedTraining/cms485PlanOfCare.data.ts` (lines ~60+ for first lesson)
- Training card defs: `C:\AI\Git\training\CI-ION\CI-ION_CMS-485_Plan_of_Care\src\data\trainingCards.ts`
- Additional generated: `src/data/additionalContent.generated.ts` (repo)
- Audio locations (host): `src/policy/journey/data/cms485AudioLocations.ts` (maps "cms-485.lesson.l1.s1.overview" etc.)

## Quiz / Challenge / Simulator Cases

**Final assessment (simulator)**: 3 cases (mandatory rationale review per repo COMPREHENSIVE + deliverable md)

Cases (exact from host + repo):
1. **case-1-henderson** (George Henderson — Post-Acute Cardiac + Wound + DM)
   - Evidence: vitals, safetyRisks, medications, oasisFindings, physicianOrders, socNarrative, hiddenClues
   - Fields: interactive CMS-485 boxes (formBoxNumber), type single/multi-select
   - Source repo: `.../src/features/final-exam/data/case1-henderson.ts`
   - Host: `src/policy/journey/data/advancedTraining/cms485PlanOfCareCases.data.ts`

2. case-2-alvarez (Maria Alvarez)
3. case-3-okafor (Emmanuel Okafor)

**Scoring / pass / remediation** (repo engine/scoring.ts):
- PASSING_THRESHOLD = 80
- Domains: principal-diagnosis, secondary-diagnoses, homebound-status, skilled-need, visit-frequency, goals, interventions, disciplines
- Post-submit: mandatory ReviewMode (all options + rationales)
- Host adapter currently: pass_percent: 100, questions as case-1/2/3 placeholders

**Challenge cards** (non-final): embedded in lessons via trainingCards.challenge + host cards.

**Media / audio**: .wav in repo src/assets/ ; mapped via app_location ids like "cms-485.lesson.l1.s1.overview"

## Completion / Remediation Path

- View all lesson cards → complete simulator cases with rationale review → score >= pass → evidence record + signature gate (Journey)
- Remediation: ReviewMode + retake loop (repo design) or Journey remediation.

## Source File Path Summary for Every Item

- Narration text: host cms485PlanOfCare.data.ts (cards[].narration_script)
- Case data: host cases.data.ts + repo final-exam/data/case*.ts
- Card definitions: repo trainingCards.ts + host cards
- Simulator engine: repo features/final-exam/engine/scoring.ts + types
- UI shell (to be replaced): repo components + features/final-exam/components (keep logic, not generic shell)
- Host integration points: contentV2Adapter.ts (special cms-485), Cms485AssessmentQuizPage.tsx, ModulePlayerScreen.tsx

**Preservation note**: All narration_script and transcript_text in host data must be treated as authoritative mapping from the repo source. Do not rewrite text.

## Gaps / Notes

- Full lesson count / exact card IDs beyond l1 need full file read of trainingCards for complete list (sections suggest 5+ lessons).
- Audio file-to-id mapping needs audit (host has partial locations).
- 3 final cases verified present in both repo and host.
- Pass threshold alignment needed (document decision in impl plan).

**Status**: Content map ready for cross-team review and Journey ModuleDef extension. Narration fidelity high.
