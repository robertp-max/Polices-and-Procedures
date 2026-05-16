# Care Indeed — PTO Policy Corpus Audit Report
**Date:** 2026-05-13
**Scope:** HR policy corpus, policyCorpus.ts, policyContentMap.ts, FN-WORKFLOWS.md, HR-WORKFLOWS.md
**Auditor:** iAdministrator (AI Corpus Analysis)
**Status:** READ-ONLY — No files were modified

---

## 1. Executive Finding

**PTO accrual policy: NOT FOUND.**

There is no active, standalone PTO accrual policy anywhere in the Care Indeed policy and procedure corpus. No policy document defines PTO eligibility rules, accrual rates, caps, carryover, payout, or an approval process. Every mention of PTO or vacation in the corpus is either a workflow input label, a California Labor Code compliance reference in the separation policy, or a blank orientation checklist row with no backing policy ID.

The HR policy subdomain taxonomy has no Compensation & Benefits (HR-CB) subdomain. The identifier `HR-CO-001` exists in the corpus, but it refers to **Worker Classification (CA AB5 / 1099)** — not compensation. This is a naming collision that creates false confidence during searches.

Brad has **zero loaded HR policy content** in `policyContentMap.ts`. He cannot answer any HR question from corpus content — only from general training data.

---

## 2. Evidence Table

| Search Term | File Found | Policy/Workflow ID | Relevant Section | What It Proves | Gap or Issue |
|---|---|---|---|---|---|
| PTO | `FN-WORKFLOWS.md` | FN-WF-12 — Payroll Processing | § 5 Inputs: "Timekeeping; PTO; rates; deductions" | PTO exists as a payroll variable | No PTO policy backing this input. Pure procedural reference. |
| PTO | `HR-WORKFLOWS.md` + `workflows.generated.ts` | HR-WF-10 — Leave of Absence | Process overview: "FMLA/CFRA, PDL, Paid Family Leave, ADA, USERRA, PTO" | PTO is included in leave administration | No accrual rates, eligibility, or caps defined. Reference only. |
| Paid time off / vacation | `HR Policy.md` | HR-ER-005 — Separation & Exit Process | § 4.3(a): "Final wages including all accrued, unused vacation shall be paid on the last day…" (CA Labor Code § 201) | Vacation accrual is acknowledged as a legal obligation | No PTO/vacation policy ID cross-referenced. Accrual terms undefined. |
| Benefits overview | `HR Policy.md` | HR-TA-005 — Employee Orientation | § 6.2.2(s): "Benefits overview and enrollment procedures" | Benefits orientation is required | Policy reference column is blank ("—"). No backing policy ID. |
| Benefits enrollment | `HR Policy.md` | HR-TA-005 Appendix A | Row 27: "Benefits overview and enrollment" | Same checklist item in the signed document | Policy reference column is blank ("—"). Zero cross-reference. |
| Time and attendance | `HR Policy.md` | HR-TA-005 Appendix A | Row 26: "Time and attendance requirements" | Attendance orientation is required | Policy reference column is blank ("—"). No backing policy ID. |
| Paid Time Off Offered | `MASTER-POLICY-FORMS-DOCUMENTATION.md` | EAP Referral Form (linked to HR-ER-001, RM-SS-002) | Section 2 field: "Paid Time Off Offered? (Y/N)" | A form captures whether PTO was offered after trauma events | Not a policy. Binary Y/N field only. No PTO definition. |
| Compensation adjustments | `HR Policy.md` | HR-ER-001 § 4.6 | "Performance evaluation results shall be considered in decisions regarding compensation adjustments…" | Compensation decisions are evaluation-driven | No compensation/pay adjustment policy cross-referenced. Cross-ref section (§ 9) omits it. |
| HR-CO | `HR-WORKFLOWS.md`, `workflows.generated.ts` | HR-CO-001 — Worker Classification | Referenced in HR-WF-16 (Contractor/1099 Classification) | HR-CO-001 exists in the corpus | **Naming collision:** HR-CO means "Contractor/Classification," not Compensation. Zero PTO content. |
| HR-CB | All files | — | — | No HR-CB subdomain | The entire Compensation & Benefits subdomain does not exist in the taxonomy. |
| HR-WM | `policyCorpus.ts` | HR-WM-001 through HR-WM-007 | Staffing, Contractor Mgmt, Employee Health, Safety, Personnel Files, Volunteers | HR-WM subdomain is Workforce Management | No compensation, benefits, or PTO policies in this subdomain. |
| HR-ER | `policyCorpus.ts` | HR-ER-001 through HR-ER-009 | Performance, Discipline, Grievance, Harassment, Substance, Separation, Diversity, Remote Work, Abuse Reporting | HR-ER subdomain is Employee Relations | No compensation or PTO policy in this subdomain. |
| policyContentMap.ts | `policyContentMap.ts` | All HR IDs | Full file searched | No HR policies have loaded content | Brad has zero HR corpus content accessible. All HR answers are from general LLM training only. |
| CO-CP-008 | `policyCorpus.ts` | — | HR-TA-005 § 9.2 cross-references CO-CP-008 "Compliance Training & Education" | Cross-reference exists in HR-TA-005 | **Ghost ID:** CO-CP subdomain in policyCorpus.ts ends at CO-CP-007. CO-CP-008 does not exist in the active corpus. |

---

## 3. Gap Analysis — HR-TA-005 (Employee Orientation & Onboarding)

**Overall Assessment:** HR-TA-005 is structurally sound and well-written. The gaps are cross-reference failures for two orientation topics that point to non-existent policies.

### 3.1 Missing Cross-References

| Location | Topic | Current Policy Reference | Issue |
|---|---|---|---|
| § 6.2.2 item (r) + Appendix A Row 26 | "Time and attendance requirements" | `—` (blank) | No backing policy. An attendance/timekeeping policy (`HR-TA-004` covers Licensure Verification, not timekeeping). There is no dedicated attendance/punctuality policy ID in the corpus. |
| § 6.2.2 item (s) + Appendix A Row 27 | "Benefits overview and enrollment procedures" | `—` (blank) | No benefits/compensation policy exists in the corpus. This blank is a symptom of the missing HR-CB subdomain. |
| § 9.2 Cross-Referenced Policies | CO-CP-008 "Compliance Training & Education" | Listed as a cross-reference | **Ghost policy ID.** CO-CP subdomain ends at CO-CP-007. CO-CP-008 is not in policyCorpus.ts. Must be corrected or the policy must be created. |

### 3.2 Metadata Issues

| Field | Current Value | Issue |
|---|---|---|
| Supersedes | "N/A (Initial Version)" | Version 6.0 labeled as initial. If previous versions existed under a different ID or file, this should be updated. Minor flag. |

### 3.3 ACHC Tag Check

ACHC tags were not observed within the extracted HR-TA-005 policy text (no `ACHC:` tag markers found in the section read). The absence of ACHC standard tags within the policy body is a gap if ACHC accreditation alignment is expected at the policy level. This requires comparison to the GV-GB-001 standard template format.

### 3.4 Policy Content Gap

HR-TA-005 correctly lists benefits orientation as a required topic but cannot deliver substantive content because the backing policy does not exist. During an orientation, the trainer has no authoritative policy to reference when explaining PTO eligibility, accrual, enrollment deadlines, or benefits carriers. This is an onboarding compliance risk.

---

## 4. Gap Analysis — HR-ER-001 (Performance Evaluation & Review)

### 4.1 Generation Artifact — Confirmed

**Location:** Line 3291 in `Builder/Policies/extracted_full/HR Policy.md`, immediately following `END OF POLICY HR-ER-001`.

**Exact text of artifact:**
```
I'm continuing without stopping. Policies HR-ER-002 through HR-ER-009 follow. Due to the massive volume, I'll maintain full GV-GB-001 standard but use efficient formatting where sections are structurally identical to preceding policies (headers, version control, acknowledgment forms follow established patterns).
```

**Assessment:** This is raw LLM generation commentary that was included verbatim in the extracted policy file. It is not part of any policy. It will appear in any full-document export and will be visible to Brad if this section is ever embedded in the corpus. It must be deleted.

### 4.2 Missing Policy Header Fields

HR-ER-001's header table is missing two fields that are present in other HR policies (e.g., HR-TA-005):

| Missing Field | HR-TA-005 Has | HR-ER-001 Has |
|---|---|---|
| Domain | HR — Human Resources | *(absent)* |
| Subdomain | TA — Talent Acquisition & Onboarding | *(absent)* |

**Recommendation:** Add `Domain: HR — Human Resources` and `Subdomain: ER — Employee Relations` to the HR-ER-001 policy header.

### 4.3 Classification Tier Inconsistency

| Field | HR-ER-001 Value | HR-TA-005 Value | Issue |
|---|---|---|---|
| Classification Tier | `ESSENTIAL` | `REQUIRED` | Different tier labels within the same domain. The policyCorpus.ts entry for HR-ER-001 should be verified. If both are meant to be `REQUIRED`, this is a generation inconsistency in the document. |

### 4.4 Compensation Cross-Reference Gap

**Policy Statement 4.6** reads:
> "Performance evaluation results shall be considered in decisions regarding compensation adjustments, promotions, additional training assignments, and corrective action."

**Section 9 References** lists: `HR-TA-006`, `HR-TD-003`, `HR-TD-001`, `HR-ER-002`, `QA-PI-005`, `GV-GB-001 § 6.2.2.4`

**Gap:** No compensation policy is cross-referenced despite the direct mention of compensation adjustments as an evaluation outcome. When this policy is used, there is no authoritative source for how compensation decisions are made, who approves them, or what the pay band structure looks like. This is a broken chain of policy authority.

### 4.5 Duplicate Section / Structural Issue

The policy jumps from Section 6.4 directly to a combined "§ 7–8. Documentation & Compliance Monitoring" without separate § 7 and § 8 headings. This is inconsistent with the standard policy template. While not a content error, it creates an incomplete structural record that may be flagged during ACHC audits.

---

## 5. PTO Policy Recommendation

**Proposed Policy ID:** `HR-CB-001`
**Proposed Title:** Employee Compensation & Benefits — Paid Time Off, Leave Accrual & Benefits Administration
**Domain:** HR — Human Resources
**Subdomain:** CB — Compensation & Benefits *(new subdomain, not currently in taxonomy)*
**Classification Tier:** REQUIRED
**Access Tier:** Tier 2 — Restricted
**Regulatory Anchors:** CA Labor Code §§ 201, 206.5, 227.3; FLSA; CA Healthy Workplaces Healthy Families Act (paid sick leave); IRS imputed income rules

### Required Policy Sections

| Section | Content Required |
|---|---|
| § 4 Policy Statements | PTO accrual rate (hours per pay period by tenure tier), eligibility window (when accrual begins), maximum accrual cap, carryover rules (if any), year-end rollover or use-it-or-lose-it rule, payout rules at separation per CA Labor Code § 227.3 |
| § 5 Definitions | PTO, sick leave, vacation, paid sick leave (CA-specific), accrual cap, carryover, final pay |
| § 6 Procedures | How to request PTO (form ID), approval authority, minimum notice requirements, blackout periods if any, coordination with FMLA/CFRA (HR-WF-10), how PTO feeds into payroll (FN-WF-12) |
| § 6 Benefits Enrollment | Benefits eligibility window (typically 30 days from hire), enrollment process, plan year, qualifying life event changes |
| § 7 Documentation | PTO request log, denial documentation, annual accrual statement |
| § 8 Compliance Monitoring | Audit of accrual accuracy, CA Paid Sick Leave compliance, FLSA wage-hour compliance |
| § 9 References | CA Labor Code §§ 201, 227.3; HR-TA-005 (orientation cross-ref); HR-WF-10 (leave admin); FN-WF-12 (payroll); HR-ER-005 (final pay) |

### Policies That Must Be Updated to Cross-Reference HR-CB-001

| Policy ID | Update Required |
|---|---|
| HR-TA-005 § 6.2.2(s) + Appendix A Row 27 | Replace `—` with `HR-CB-001` |
| HR-TA-005 § 6.2.2(r) + Appendix A Row 26 | Confirm timekeeping reference; add attendance policy cross-ref when created |
| HR-ER-001 § 4.6 + § 9 References | Add `HR-CB-001 (Compensation & Benefits)` to cross-references |
| HR-ER-005 § 4.3 | Add `HR-CB-001` as the authoritative source for vacation accrual terms cited in final pay section |
| FN-WF-12 (Payroll Processing) | Note `HR-CB-001` as the policy governing PTO input values |

### Corpus & System Updates Required

| Item | Action |
|---|---|
| `policyCorpus.ts` | Add `'HR-CB': ['001: Employee Compensation & Benefits — PTO, Leave Accrual & Benefits Administration']` |
| `policyContentMap.ts` | Embed policy content after HR-CB-001 is drafted and approved |
| Brad / RAG corpus | Re-embed HR domain policies after policyContentMap is updated |

---

## 6. Immediate Fixes (Priority Order)

| Priority | Item | Action | File |
|---|---|---|---|
| P1 | Generation artifact in HR Policy.md | **Delete** line 3291 (the LLM meta-commentary between END OF POLICY HR-ER-001 and the start of HR-ER-002) | `Builder/Policies/extracted_full/HR Policy.md` |
| P2 | HR-TA-005 Appendix A Row 26 & 27 + § 6.2.2(r)(s) | Replace `—` with a placeholder reference `HR-CB-001 (pending)` to flag the gap and prevent surveyor confusion | `HR Policy.md` |
| P3 | HR-ER-001 missing header fields | Add `Domain` and `Subdomain` to policy header | `HR Policy.md` |
| P4 | CO-CP-008 ghost ID in HR-TA-005 § 9.2 | Determine if CO-CP-008 "Compliance Training & Education" should be created or if the cross-reference should be corrected to CO-CP-004 (Code of Conduct) or CO-CP-001 (Compliance Program) | `HR Policy.md` |
| P5 | HR-ER-001 Classification Tier inconsistency | Align to `REQUIRED` if that is the correct tier per the standard | `HR Policy.md` |
| P6 | HR-ER-001 § 7–8 combined heading | Restore to separate `## 7. Documentation Requirements` and `## 8. Compliance Monitoring` headings per standard template | `HR Policy.md` |
| P7 | policyContentMap.ts — HR policies unloaded | After P1–P6 fixes, embed HR-TA-005, HR-ER-001, HR-ER-002 content in policyContentMap.ts so Brad can answer HR questions from corpus | `src/policy/data/policyContentMap.ts` |

---

## 7. Do Not Implement

This report is read-only. No files were modified. The above recommendations require explicit instruction before any changes are made.

---

*Report generated: 2026-05-13 | Corpus source: `Builder/Policies/extracted_full/HR Policy.md`, `Builder/Policies/Workflows/FN-WORKFLOWS.md`, `Builder/Policies/Workflows/HR-WORKFLOWS.md`, `src/policy/data/policyCorpus.ts`, `src/policy/data/policyContentMap.ts`*
