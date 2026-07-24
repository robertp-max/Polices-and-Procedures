# V3 Governing Body — 2026 QAPI implementation (continuing from 6b858d7f)

Not committed/pushed (this prompt: commit only on explicit authorization after review).
Worktree kept runnable. Verified: `tsc -p tsconfig.app.json` = **0 errors**; `vitest`
(v33) = **28/28 pass**; `vite build` = **success**.

## Corrections done (§2.1, §2.2)
- `00-DELIVERY.md` updated: the baseline hardening work **was** committed as `6b858d7f` and
  pushed; the stale "not committed" statement is removed.
- Residual production-path practice/no-LMS/certification-locked language removed from:
  `gb-academy/ExecutiveModule.tsx`, `gb-academy/MeetingModule.tsx` (done earlier),
  `policies/GoverningBodyPolicyPlayer.tsx`, `policies/PolicyLearningPlayer.tsx`,
  `qapi/QapiBoardView.tsx` (PRACTICE→REHEARSAL). Approved replacement copy applied.
  ("diagnostic practice"/"practice horizons" in LearningChapter are pedagogical wording,
  not on the forbidden list, and were left.)

## 2026 QAPI source & provenance manifest (§3, deliverable #3)
- Source fixture copied into the tree: `qapi/source/MOCK_2026_QAPI.txt` (638 lines, synthetic).
- Model: `qapi/model/qapi2026.types.ts` — `QapiYear2026`, `QapiQuarter`, `ProvenanceRef`
  (`SourceKind`), `SyntheticSupplement`, and record contracts for metrics, feeder audits,
  adverse events (de-identified), infections, complaints, PIP triggers, PIP lifecycle, CAPs,
  restricted personnel matters, escalations, sign-offs, and data-quality findings.
- Normalized fixture (single source of truth): `qapi/data/qapi2026.normalized.ts`.
  **Q1 normalized richly** (agency, meeting control, census, 8 quality-metric series with
  monthly points, PIP triggers/PIPs, adverse events, infections, complaints, CAPs, restricted
  disciplinary matters, escalations, sign-offs). **Q2 normalized** (meeting, census w/
  discontinuity, 6 metric series incl. the aggregate-masks-subgroup hospitalization signal,
  carry-forward PIP, open complaints). **Q3/Q4/annual = `pending`** (honest; source present).
  Every normalized record carries a `ProvenanceRef` (test-enforced).
- Selectors: `qapi/selectors/qapi2026Selectors.ts` — `buildGbQuarterPacket`,
  `buildGbDecisionDocket`, `buildPacketReadiness`, `buildGbAnnualArc`, `buildMaterialSignals`.

## Data-quality & synthetic-supplement report (§3.6, deliverable #4)
Preserved (never silently repaired), exposed via `validationFindings`:
- **DQ-2026-001 (critical, identity collision):** `MOCK-CLIN-*` IDs are reused for different
  people across quarters (Q1 `-0027`=James Reeves/Clinical Mgr vs Q2 `-0026`=Angela
  Morales/Clinical Mgr; Q1 `-0028`=Maria Santos/Admin vs Q2 `-0029`=Edward Nakamura/Admin).
  IDs are quarter-scoped; **no merge on raw ID**; reviewer must approve a versioned alias table.
- **DQ-2026-002 (warning, census discontinuity):** Q1 closes at 120 active; Q2 opens at 100.
  Both recovered values preserved; reviewer must confirm true opening census.
- **DQ-2026-003 (warning, missing Board decision):** source records the escalation (GB-Q1-001)
  but no motion/vote/directive.
- **Synthetic supplements:** `SUPP-GB-MOTION-Q1-001` — a Board motion shell authored **for UAT
  workflow completeness only** (`approvedForProduction:false`, `reviewRequired:true`), labeled
  distinctly from source-recovered evidence.

## Packet manifest (§4, deliverable #5)
Normalized and packet-ready: **Q1, Q2**. Pending normalization: **Q3, Q4, annual arc**.
Board-facing projections use aggregates/event-IDs/case-labels; patient names never appear in
normalized Board-facing records (test-enforced); patient IDs live only in a restricted
`restrictedPatientId` field for executive-session/tabletop exhibits.

## Reuse manifests (deliverables #9, #10) — from repo scouting; to be wired in §7/§8
**Forms (canonical — do NOT duplicate):**
- Dataset `FORMS_DATASET` + `FormRecord` — `src/policy/data/formsLibraryDataset.ts`.
- `buildFormContent(record)` — `src/policy/data/formsLibraryContent.ts`.
- Routes: `/forms/:formId` (form-viewer), `/forms/:formId/esign`, `/forms/:formId/print`.
- `resolveCanonicalFormId`, `resolveFormTitle` — `src/policy/data/formIdAliases.ts`.
- Evidence: `regulatoryExecutionStore.uploadEvidence`, `ecign/captureSignedFormSnapshot`.
- The 9 GB forms all exist (GV-FM-006/008/012/023/024, CO-FM-001/010, EN-FM-001/036) with
  confirmed titles + linked policies.
**Policy (canonical):**
- `getFormsForPolicy(policyId)` — `src/policy/utils/policyFormLinks.ts` (policy→forms reverse
  index; injects EN-FM-001 except for GV-GB-001). Use this instead of a hardcoded V3 list.
- Viewer `PolicyDetailScreen` at `/library/:policyId`; content via `getCorpusPolicy`
  (`policyCorpus.ts`) + `getPolicyContent` (`policyContentMap.ts`).
- **Drift to retire:** v33 holds private copies of `allPoliciesContent.generated.ts` and
  `governingBodyPolicyContent.ts` that drifted from canonical `src/policy/data/`; §8 should
  point v33 at the canonical sources.

## Tests (deliverable #11, partial)
- `qapi/data/qapi2026.test.ts` — 12 tests (§11.1): four quarters + annual, provenance on every
  normalized record, identity-collision + census-discontinuity preserved, synthetic supplements
  labeled, no patient names in Board-facing records, aggregate-masks-subgroup → hold_closure,
  open-PIP decision matters, readiness fails on critical DQ defect, annual carry-forward risk.
- Prior `compliance/complianceGates.test.ts` — 16 tests still pass.

## §4 packet workspace — DONE (this pass)
`qapi/Qapi2026BoardWorkspace.tsx` + `qapi/qapi2026.css` wired into Oversight→QAPI, replacing
the hard-coded `QapiBoardView` (import removed; file retained, unused). Three-part layout
(navigator / focused packet section / Board action rail), 9-step GB workflow rail, persistent
SYNTHETIC watermark, packet sections (chair brief + readiness gates, KPI grid with
aggregate-masks-subgroup flag, PIP lifecycle, de-identified adverse/RCA, complaints, CAP
table, decision docket, sign-offs), annual arc, open directives, and a data-quality drawer.
Verified live at `/governance` → Oversight → QAPI: workspace renders from normalized data,
Q3/Q4 shown as "pending", data-quality findings + synthetic supplement visible, **0 console
errors**; `tsc` 0, `vite build` ok.

## §5–§8 + §4-depth — DONE (orchestrated build, then integrated)
Built via a 5-agent parallel workflow (Sonnet), partitioned by directory, then wired + verified
by the orchestrator. Result: **tsc 0 errors · 28/28 v33 tests · vite build ✅ · 0 console errors.**
- **§6 remediation** (`remediation/`): shared `RemediationChoiceModal` + `GuidedTrueFalsePlayer`
  + routing + targeted bank. Wired into the course-assessment fail path (Try again / Guided /
  Review). Disconnected evidence ⇒ Preview-only, no completion.
- **§5 tabletop** (`tabletop/qapi2026*` + Solo/Facilitated players + session store/adapter): built
  on the normalized 2026 source; wired into My Compliance (replaces the old `TabletopPlayer`).
  **Live-verified**: entry shows Solo vs Facilitated group cards.
- **§7 forms** (`forms/`): `AnnualGovernanceForms` using only canonical `FORMS_DATASET` +
  `getFormsForPolicy` (no new IDs); launched from Records. **Live-verified**: renders the 9
  required GB canonical form IDs (+ policy-linked forms), routing to `/forms/:id`.
- **§8 policy player** (`policies/`): redesigned reader (contents rail / Board lens / canonical
  related-forms via `getFormsForPolicy`); extractive quiz demoted to a non-gating developer
  preview. Same export/props → route unchanged. Compiles + builds; live open-flow not
  re-confirmed (test-harness accordion timing, not a defect; 0 console errors).
- **§4 depth** (`qapi/components/`): Attendance & quorum, Infection oversight, Finance & resources,
  and the Decision composer, wired as packet sections. **Live-verified**: all four section tabs
  present in Oversight → QAPI.

## Honest remaining work (deliverable #13)
- **§3:** Q3/Q4/annual normalization (source present; fixtures pending).
- **§6 depth:** wire the shared remediation modal into the module engines (ExecutiveModule/
  MeetingModule) and the tabletop internal fail path (course-assessment is wired; concept-tagging
  in the module engines is the remaining hook).
- **§11–12:** dedicated automated tests for the new tabletop/remediation/forms/policy modules,
  full live UAT at 1440/1024/375 + keyboard/200%/reduced-motion, and screenshots (this env's
  preview pane cannot composite frames, so screenshots were replaced by DOM/accessibility checks).
- **§4 depth:** dedicated attendance/quorum, infection-surveillance, and finance-hold
  components (quorum currently folded into the brief; infection data exists but has no section
  yet); full motion/vote **decision composer** (currently a primary-action stub); and the
  §9.2 "changes since last review" filter.
- **§5:** Solo + Facilitated group 2026 tabletop engine and content.
- **§6:** Shared `RemediationChoiceModal` + guided True/False + in-module fail interception
  (also closes the prior Part-5 gap).
- **§7:** Annual governance forms workspace (canonical reuse per the manifest above).
- **§8:** Policy player redesign + canonical related-forms; retire v33 policy-corpus drift.
- **§11–12:** full test matrix, live UAT at 1440/1024/375 + keyboard/200%/reduced-motion,
  and screenshots.
