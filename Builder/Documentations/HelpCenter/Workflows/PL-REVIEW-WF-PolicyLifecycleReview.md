# Workflow: Policy Lifecycle Review (PL-REVIEW-WF)

**Workflow ID:** `PL-REVIEW-WF`  
**Domain:** All domains (GV, CL, QA, HR, CO, FN, OP, EN, IT, RM)  
**Linked Policy:** Applicable to all policies in `policyStore`  
**Risk Band:** `moderate`  
**Cadence Kind:** `time_based`  
**Cadence Interval:** `annually`

---

## Trigger

This workflow is triggered **annually** for each policy that is in `PUBLISHED` state and has not been reviewed within the past 12 months. The auto-generation engine creates a `policy_review_cycle` event for each eligible policy.

The `event_id` format: `policy_review_cycle-{policy_id}-{YYYY}-01`

---

## Steps

| # | Step | Role | Required |
|---|---|---|---|
| 1 | Compliance Officer initiates review for all due policies | Compliance Officer | Yes |
| 2 | Assign reviewer(s) for each policy | Administrator | Yes |
| 3 | Reviewer reads current policy and assesses against current regulations | Reviewer | Yes |
| 4 | Reviewer documents findings (no changes needed / changes needed) | Reviewer | Yes |
| 5 | If changes needed: update policy content in DRAFT state | Policy Author | Conditional |
| 6 | Submit updated policy to REVIEW state (triggers PolicyLifecycleWorkflow) | Policy Author | Conditional |
| 7 | If no changes needed: document "current and accurate" determination | Reviewer | Conditional |
| 8 | Clinical Manager signs off on clinical policies | Clinical Manager | For CL domain |
| 9 | Upload review documentation as evidence | Administrator | Yes |
| 10 | Submit for approval | Compliance Officer | Yes |
| 11 | Administrator certifies the review event | Administrator | Yes |

---

## Dependencies

- Policy must be in `PUBLISHED` state when review begins
- Reviewer must be assigned and have an active account
- For clinical policies (CL domain): Clinical Manager signature required
- If policy changes are made, the full `PolicyLifecycleWorkflow` runs as a nested workflow

---

## Inputs

| Input | Description | Required |
|---|---|---|
| Policy document | The current published policy text | Yes |
| Regulatory reference | Current applicable regulations | Yes |
| Prior review record | Prior review evidence (if any) | No |

---

## Outputs

| Output | Type | Where Stored |
|---|---|---|
| Review determination record | Evidence document | Evidence under `event_id` |
| Updated policy (if changed) | New policy version | `policyStore` |
| Review certification record | Lock entry | `enforcementStore` |

---

## Linked Forms

| Form ID | Form Name | Required Stage |
|---|---|---|
| `CO-FM-001` | Annual Policy Review Determination Form | Steps 4/7 |

---

## Linked Tasks

- Annual review tasks auto-assigned to Compliance Officer at start of Q1
- Individual policy review tasks assigned to designated reviewers
- Policy update tasks created if changes are needed

---

## Evidence Generated

| Evidence Kind | Description | `event_id` |
|---|---|---|
| `policy_attestation` | Signed review determination | `policy_review_cycle-{policy_id}-{YYYY}-01` |
| `signed_form` | Annual Policy Review form | Same `event_id` |

---

## Approval Body

| Stage | Role | Basis |
|---|---|---|
| Review sign-off | `clinical_manager` (for CL domain) | CMS CoP §484.105(b) |
| Certification | `admin` | CMS CoP §484.105(b)(2) |

---

## Timeline & SLA

| Milestone | Timing |
|---|---|
| Review triggered | January 1 each year (for all eligible policies) |
| Review completion deadline | March 31 (Q1 end) |
| Clinical sign-off deadline | April 15 |
| Certification deadline | April 30 |
| SLA warning | 7 days before deadline |

---

## Exception Handling

| Exception | Required Action |
|---|---|
| Reviewer unavailable | Reassign to backup reviewer; document in review record |
| Major regulatory change mid-year | Trigger out-of-cycle review for affected policies |
| Policy requires full rewrite | Elevate to Compliance Officer; may extend deadline with documentation |

---

## Quality Indicators

- 100% of required policies reviewed annually
- Zero policies in service with an overdue review date during survey period
- All review decisions documented and accepted evidence present

---

## Revision History

| Date | Change | Author |
|---|---|---|
| 2026-01-01 | Initial workflow definition | Compliance Officer |
