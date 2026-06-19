# Workflow P&P Reference Review - Collected Agent Outputs

**Note:** This file consolidates raw outputs from all 30 parallel review-only subagents deployed for the SAFE REVIEW-ONLY task.  
Each agent's full output (or key structured findings) is appended as it completes.  
All work is review-only. No files in the codebase were edited.

**Date started:** 2026-06-15  
**Working directory:** C:\AI\Git\training\HomeHealth\Policies_and_Procedures  
**Git branch (from initial agents):** fix/auth-cognito-new-password-required-flow  

---

## Agent 01: Dir confirmation + git status + initial workflow file listing and policy ref extraction from Builder/Policies/Workflows

**Task ID:** (from initial spawn)

**Key findings (summarized from output):**
- Working directory confirmed as C:\AI\Git\training\HomeHealth\Policies_and_Procedures
- Branch: fix/auth-cognito-new-password-required-flow
- Many modified and untracked files (including previous audit report in Builder/Documentations/)
- Files in Builder/Policies/Workflows/: ALL-WORKFLOWS-COMBINED.md, AUDIT_REPORT.md, CL-WORKFLOWS*.md, CO-WORKFLOWS*.md, EN-WORKFLOWS.md, FN-WORKFLOWS.md, GV-WORKFLOWS.md, HR-WORKFLOWS*.md, IT-WORKFLOWS*.md, OP-WORKFLOWS.md, QA-WORKFLOWS*.md, RM-WORKFLOWS*.md, PP_AMENDMENT_REGISTER.md
- Detailed per-workflow policy references extracted from the MD sources (e.g., CL-WF-26 references CL-PA-005, CL-PA-007; many others list specific policy IDs per domain).

(Full raw output available in subagent logs if needed.)

---

## Agent 02: Deep review of generated workflow data files for policy references

**Key findings:**
- Inspected `workflows.generated.ts`, `workflowGraph.generated.ts`, `workflowTemplates.generated.ts`, `regulatoryEvents.ts`
- Extracted policyRefs arrays, policyReferences, workflowId links, and specific IDs (CL-PA-*, QA-PG-*, GV-GB-*, etc.)
- Noted heavy use of CL-PA-xxx in audit workflows vs actual corpus.
- POC audit (CL-WF-26) prominently uses non-canonical CL-PA-005 / CL-PA-007.

---

## Agent 03: Build canonical list of valid policy IDs from library sources

**Key findings:**
- Canonical list built from `policyCorpus.ts`, `allPoliciesContent.generated.ts`, Builder/Policies/*.md, tmp-policy-ids.txt, framework seeds.
- CL domain uses CL-CP-*, CL-SD-*, CL-CA-*, CL-CD-*, CL-PR-*, CL-OA-* (no CL-PA-*).
- Listed ~278 policies grouped by domain (GV, CO, QA, RM, CL, OP, HR, IT, FN, EN).
- Confirmed that CL-PA-005, CL-PA-007 etc. referenced in workflows **do not exist** in the canonical corpus.

---

## Agent 04: Special focus on Plan of Care Audit workflow and QAPI/clinical audit workflows

**Key findings:**
- Detailed extraction of CL-WF-26 from CL-WORKFLOWS-AUDIT.md.
- Exact references: CL-PA-005 Plan of Care; CL-PA-007 Care Coordination + 42 CFR citations.
- Confirmed mismatch with canonical (should map to CL-CP-001 / CL-CC-101).
- QA-WF-03 requires pre-input completeness from all 12 CL audits + 6 QA support audits.
- Many CL-PA-xxx used across the audit layer; none resolve in policyCorpus.

---

## Agent 05: Broad search for all workflow policy references across source and generated files

**Key findings:**
- Comprehensive inventory from autogen/templateRegistry.ts, all Builder/Policies/Workflows/*.md, generated .ts, regulatory events, UI components, journey modules, CES, etc.
- Listed hundreds of specific policyRefs (TPL-*, WF-*, event policyRefs).
- Highlighted form ID leakage into policyRefs (e.g. OP-FM-005).
- Confirmed volume and that many audit refs use non-canonical IDs.

---

## Agent 06: Inspect remaining workflow/event related source files for completeness

**Key findings:**
- Additional files: mandatedEventsExpanded.ts, eventAlignmentPolicy.ts, eventWorkflowAlignment.ts, multiYearEvents.ts, compliance-execution/*, ces/*, stores/regulatoryExecutionStore.ts, etc.
- 'missing_workflow_link' classifications in alignment policy even when WFs exist in Builder MDs.
- Detailed drift analysis between Builder source MDs, generated files, and runtime data.
- Many policyRefs in runtime come from workflow alignment but use IDs outside the canonical corpus.

---

## Agent 11: Detailed extraction from QA and CL workflow source MD files, focus on audits and Plan of Care

**Full key extraction (from CL-WORKFLOWS-AUDIT.md and related):**

**Clinical Quality Audit Layer (CL-WF-26 to CL-WF-37):**
- CL-WF-26 — PLAN OF CARE AUDIT  
  Policy references: CL-PA-005 Plan of Care; CL-PA-007 Care Coordination; 42 CFR § 484.60; 42 CFR § 484.55
  Full 13-section structure extracted (triggers, roles, steps with CO-FM-021/022/024 + CL-FM-005, escalation, audit requirements, etc.).
  Feeds QA-WF-03 and CO-WF-04.

- Similar detailed refs for CL-WF-27 (CL-PA-003), CL-WF-28 (CL-PA-008), CL-WF-29 (CL-PA-010), CL-WF-30 (CL-PA-002 + CL-PA-005), etc.

**QAPI Support Audit Layer (QA-WF-13 to QA-WF-18):**
- All required as pre-input for QA-WF-03.
- QA-WF-18 — POLICY EFFECTIVENESS MONITORING: Maps every defect to governing policy ID.

**QA-WF-03 — QUARTERLY QAPI COMMITTEE REVIEW:**
- Explicitly states the committee MAY NOT convene unless ALL upstream audit workflows (the 12 CL + 6 QA support + HR/RM/IT layers) have produced evidence.
- Policy refs: QA-PG-001, QA-PG-002, GV-GB-001 + 42 CFR § 484.65.

**Policy Reference Mismatches vs Canonical:**
- Workflow sources heavily use CL-PA-xxx and CL-IC-001.
- Canonical (policyCorpus.ts) has no CL-PA or CL-IC subdomains.
- Canonical uses CL-CP-001 (Plan of Care), CL-CP-002, CL-CP-005 (Coordination), CL-SD-*, CL-CA-*, CL-OA-*, etc.
- Same non-canonical refs propagated in ALL-WORKFLOWS-COMBINED.md and operational CL-WORKFLOWS.md.

No other unique audit workflows found beyond the documented layers.

---

## Agent 12: Cross compare workflow refs vs canonical policy list for mismatches and drift

**Key mismatches (runtime vs canonical):**
- Heavy CL-PA-* (CL-PA-001 to CL-PA-014) in workflows.generated.ts and source MDs — **completely absent** from policyCorpus.ts.
- HR-OIG-001, RM-RP-001, CL-POC-001, OP-FM-005 (form leakage into policyRefs).
- Source docs (Builder MDs) reference broader set than what ends up in runtime generated bundles or the corpus.
- Drift: workflows.generated.ts compiled from Builder MDs (uses CL-PA-*), but canonical corpus and eventDisplayModel filtering use different namespace.
- 2026-06-12 prior audit's "12 missing" (including several HR-*) still unresolved; CL-PA cluster matches the pattern.

**Drift summary:**
- Builder source MDs (Workflows/*.md) → generated files (mirror the bad refs) → runtime (policyCorpus + display filters use canonical).
- eventAlignmentPolicy marks many events as 'missing_workflow_link' even when the target WF exists in the MDs.

---

## Agent 13: Review additional workflow-adjacent files for policy refs (from previous collection)

**Key areas covered:** brad/workflowSchedule.ts, pm/* (taskProjection, etc.), swimlanes/*, ces/*, FormSigningWorkspace.tsx, compliance-execution/*, autogen/*, stores/*, etc.

**Findings:**
- Heavy propagation of policyRefs + workflowId from REGULATORY_EVENTS + WORKFLOWS.
- CES seeds use many synthetic wf-* and policyRefs.
- FormSigningWorkspace and policyLinkService handle linkedPolicyIds / workflow context.
- Strong overall alignment between MD sources and generated, but the canonical vs workflow-declared ID namespace drift remains the core issue.
- No new production-broken refs beyond the already-identified CL-PA-* and template-specific missing ones (HR-TR-010 etc.).

---

## Agent 18: HR workflows P&P review (many missing per prior audit)

**Key files:** Builder/Policies/Workflows/HR-WORKFLOWS.md, HR-WORKFLOWS-AUDIT.md, extracted_full/HR Policy.md, tmp-policy-ids.txt, prior 2026-06-12 audit report.

**Extracted references:**
- Operational: HR-TA-001 to HR-TA-006, HR-TR-001 to HR-TR-003, HR-PM-001, HR-ER-001 to HR-ER-005, HR-CO-001, HR-HS-001, HR-WM-00x, etc.
- Audit layer: HR-WF-18 to HR-WF-21 (training compliance, competency revalidation, license/exclusion monitoring, staff file audit).
- Template-driven: HR-TR-010 (OSHA BBP), HR-TR-011 (HIPAA), HR-CR-020 (OIG), HR-CV-040 (competency) — these appear in `src/policy/autogen/templateRegistry.ts`.

**Missing per prior audit + confirmation:**
- HR-TR-010, HR-TR-011, HR-CR-020, HR-CV-040 **do not exist as standalone dedicated policies**.
- They have only indirect coverage via broader "HR Policy.md" domain manual or the HR-TA/TD series.
- Canonical inventory (extracted_full + tmp-policy-ids.txt) covers HR-TA-001..006, HR-TD-001..005, HR-ER-001..009, HR-WM-001..007, HR-JD-*, but not the specific TR-010/011/CR/CV template IDs.
- Additional gaps: missing/ghost cross-refs in HR-TA-005 (no HR-CB-* subdomain), CO-CP-008 ghost ID referenced in HR-TA-005.

**Ties to Clinical/HHA/POC:**
- Very strong dedicated coverage: HR-WF-05 is entirely "HOME HEALTH AIDE TRAINING & COMPETENCY (42 CFR § 484.80)".
- Detailed steps for registry verification, 17-skill competency eval (HR-FM-017), 14-day RN supervision (CL-FM-014), 60-day on-site observation (CL-FM-014A), 12-hour annual in-service (HR-FM-018), annual re-eval.
- Hardened in the audit layer (HR-WF-18/19).
- Cross-references heavily into CL-SD-005, CL-WF-11/25, onboarding, performance/discipline.
- Training/competency gaps directly trigger CAPs, PIPs, QA-WF-03, and PoC (plan of correction) risk. HHA failures = immediate CoP-level survey risk.

**Overall for HR:** Workflows are operationally complete and survey-ready post-audit, but the exact template-declared policy IDs (especially the TR-0xx ones) remain missing or indirect in the upstream policy corpus — exactly as flagged in the 2026-06-12 report.

---

## Summary of Accumulated Findings (will be expanded as more agents complete)

**Major Patterns Across All Agents:**
- The dominant issue is **namespace drift** between workflow source definitions (Builder/Policies/Workflows/*.md) and the runtime canonical policy corpus (`policyCorpus.ts`).
- CL audit layer (especially POC audit CL-WF-26) heavily uses `CL-PA-xxx` IDs that simply do not exist in the canonical list.
- Several templateRegistry-declared IDs (HR-TR-010/011, HR-CR-020, HR-CV-040, CL-HHA-001/002, CO-QR-001, etc.) are missing as standalone policies.
- Form IDs leaking into `policyRefs` arrays (e.g. OP-FM-005).
- QA-WF-03 has a hard "all upstream audits must complete" gate that references the non-canonical IDs.
- `eventAlignmentPolicy.ts` classifies many events as 'missing_workflow_link' even when the target workflow exists in the MD sources.
- Builder/_system/ reports document 133+ unresolved policy refs in swimlane generation.
- Strong operational coverage in the workflows themselves (especially HHA/POC related), but the declared policy anchors are often stale, indirect, or non-existent in the canonical corpus.

**Next steps for this collection file:**
- As each remaining agent completes, its full output (or key structured section) will be appended here.
- Once all 30 have reported, a final synthesized version of the required report format (sections 1-8) can be generated from this collection.

---

*This file will be updated incrementally as new agent outputs arrive.*