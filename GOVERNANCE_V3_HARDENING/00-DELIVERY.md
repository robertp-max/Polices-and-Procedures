# V3 Governing Body — Hardening Delivery

Worktree: `GOVERNING_BODY_PORTAL` · branch `feature/governing-body-portal`.
Edited **V3 only** (`src/v6/screens/governance/v33/`). No content borrowed from V1/V2 or
the older `Governance*.tsx` files. **Not committed / not pushed / no ZIP**, per instruction.

Verification at delivery: `tsc -p tsconfig.app.json` = **0 errors**; `vitest`
acceptance suite = **16/16 pass**; `vite build` = **success**; live in-browser UAT on the
worktree dev server (`localhost:5188/governance`, demo-bypass auth) = **0 console errors**.

## 1. Changed / new files
**Modified**
- `v33/MyJourneyApp.tsx` — rebuilt IA (10→6 destinations), task-first Home, unified My Compliance, sub-tabs, breadcrumbs, readable rail labels, assessment/forensic/tabletop routing.
- `v33/gb-academy/Academy.tsx` — completion via evidence layer (not `submitted`); practice/certification-locked language removed.
- `v33/gb-academy/ExecutiveModule.tsx`, `MeetingModule.tsx` — removed "private practice record · certification locked".
- `src/v6/screens/pageviews/GovernanceScreen.tsx` — import the compliance stylesheet.

**New — `v33/compliance/`** (Part 4): `complianceTypes.ts`, `complianceCatalog.ts`, `complianceEvidenceAdapter.ts`, `complianceStore.ts`, `complianceSelectors.ts`, `useCompliance.ts`, `compliance.css`, `complianceGates.test.ts`.
**New — `v33/assessments/`**: `assessmentUtils.ts`, `courseAssessmentBank.ts`, `CourseAssessmentPlayer.tsx`, `forensicBank.ts`, `TrueFalseForensicPlayer.tsx`.
**New — `v33/tabletop/`**: `tabletopCase.ts`, `tabletopScoring.ts`, `TabletopPlayer.tsx`.

## 2. Information-architecture map
See [01-information-architecture-map.md](01-information-architecture-map.md).

## 3. Compliance data / evidence contract
`ComplianceAssignment` and `ComplianceEvidenceRecord` per spec (`complianceTypes.ts`).
Assignments derived from academy modules + policy-journey (`complianceCatalog.ts`), never
mutating generated data. Authoritative completion comes only from a **connected** evidence
service (`complianceEvidenceAdapter.ts`); the default dev adapter is honestly **disconnected**
→ items show "Preview only", nothing completes, progress never advances. localStorage holds
**draft/resume only** (`complianceStore.ts`), never authoritative.

## 4. Assessment scoring specification
- **Module** (`readCompletion`, selectors): complete only with a passing (≥92%), attested,
  zero-critical-error official record.
- **Course assessment** (`CourseAssessmentPlayer`): reviewed source-linked bank; no reveal
  until submit; lock at submit; ≥80% + zero critical + active-time floor + attestation +
  evidence save; unlocks only after all course policies complete.
- **True/False forensic** (`TrueFalseForensicPlayer`): deterministic form per learner+attempt;
  no feedback; lock at submit; binary **and** controlling-source both required for credit;
  ≥96% + every critical item fully correct; supervised remediation after attempt 3.
- **Tabletop** (`tabletopScoring.ts`): weighted rubric → percent; **critical-error gate
  overrides score**; pass needs ≥95% + zero critical + all critical exhibits inspected +
  all decisions made + transfer gate passed + attestation + evidence save.

## 5. Primary tabletop case manifest
`tabletop/tabletopCase.ts` — "Integrated Governance Under Pressure": 12 exhibits (3 decoys, 8
critical), 5 seeded contradictions, 6 required decisions across 3 rounds, 2 surveyor questions,
1 changed-facts transfer, 6-dimension 100-pt rubric, 8 automatic critical-failure gates.
*(Authored as a defensible exemplar; the engine scales to the full 25–35 exhibit / 8–12
contradiction target with no code change — see §8.)*

## 6. True/False forensic bank manifest
`assessments/forensicBank.ts` — module `GB-001`, 3 alternate forms (A/B/C), 12 authored items
in form A spanning retained-authority, quorum-vs-eligibility, conflict/recusal, aggregate-vs-
subgroup, PIP-closure, notification-vs-approval, backdating, board-vs-management, BAA, and
draft-vs-final competencies; each with a critical flag and controlling-source alignment.

## 7. Automated test results
`complianceGates.test.ts` — **16/16 pass**, covering acceptance gates #2, #5, #6, #7, #8, #10
(no-leak, live), #11, #12, #13, #14, next-requirement ordering, transfer gate, full tabletop
pass, and the practice-language removal.

## 8. UAT (in-browser, worktree dev server)
Verified live: six-item rail; Home title/primary-action/summary-cards/Required-Now (5) +
Preview-only banner; My Compliance tabs (13 modules / 13 courses / 0 completed); course
accordion with **locked** assessment + honest unlock copy; final tabletop (12 exhibits, 8
critical-failure rules, Round 1 with **0 answer-leakage markers**); module player language fixed
via HMR; mobile 375px single-column with no horizontal overflow.

## 9. Remaining work (honest status — NOT yet complete)
- **Content depth**: course banks authored for GB-01 & GB-10 (11 remaining show an honest
  "bank pending" state, never a fake quiz); forensic bank authored for GB-001 (12 items/form;
  scale to 24–30 and to other modules); tabletop exhibits/contradictions to be expanded to the
  full 25–35 / 8–12 target.
- **`ExecutiveModule.tsx` deep hardening (Part 5)**: per-stage "what counts as complete / can
  auto-fail" headers and the in-module fail→two-choice interception are not yet wired; the
  fail→forensic path is currently reachable from the tabletop remediation and from a
  `remediation_required` assignment state.
- **Tabletop forensic capstone**: uses the module forensic bank as a stand-in; a dedicated
  30–40 item / 97% capstone bank is not yet authored.
- **Screenshots**: this environment's preview pane cannot composite frames, so image
  screenshots time out; UAT was performed via DOM/accessibility inspection instead.
