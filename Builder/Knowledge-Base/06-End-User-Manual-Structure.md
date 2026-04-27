# 06 — End-User Manual Structure

> **Location:** `Builder/Knowledge-Base/06-End-User-Manual-Structure.md`
> **Status:** Authoritative role-based end-user manual structure. Each manual is a long-form companion to the KB articles; it is read once on onboarding and referenced during incidents.

> **Target folder:** `Builder/Knowledge-Base/End-User-Manuals/<Role>/`. One folder per role; numbered sections inside.

---

## 1. Manual structure (every role)

Every role manual contains the same nine sections:

| # | Section | What it answers |
|---|---|---|
| 1 | Role definition | Who you are in CI-App; tier; reporting line |
| 2 | What you see | The screens and surfaces you have access to |
| 3 | What you must do | Mandatory tasks and cadence |
| 4 | What you must NOT do | Hard-prohibited actions and why |
| 5 | Common errors | The 5–10 errors you will encounter; cause; resolution |
| 6 | Escalation path | Who to contact when stuck; in-app and out-of-band channels |
| 7 | Evidence you generate | What artifacts you produce, where they live, how they're used |
| 8 | Cadence reference | Daily / weekly / sprint / monthly checklist |
| 9 | Related KB articles | Slug list with links |

> The body of each section links into KB articles (do not duplicate). If a fact is not in a KB article, the manual flags a gap in `04-Knowledge-Base-Article-Plan.md`.

---

## 2. Compliance Officer

| Field | Content |
|---|---|
| **Tier** | 3 |
| **Primary screens** | `/ces/board`, `/ces/calendar`, `/ces/reports`, `/ces/workloads`, `/audit`, `/library` |
| **Must do** | Open every sprint, assign owners + signers, monitor blocked items, run end-of-sprint closure, run monthly retrospective, generate survey packets on demand. |
| **Must NOT do** | Reschedule mandated calendar events without governance exception. Bypass workflow sequence. Approve own work. |
| **Common errors** | Late-flagged items unaddressed; missing approver tier; evidence type mismatch; calendar drift; sprint closed with incomplete signatures. |
| **Escalation** | Administrator (Tier 1) for tier or governance exceptions; Auditor channel for survey support. |
| **Evidence generated** | Sprint closure report; monthly retrospective; survey packet; amendment register entries. |
| **Cadence** | Daily: triage blocked. Weekly: workload rebalance. Sprint close: evidence + signature audit. Monthly: retrospective + amendment review. |
| **KB articles** | `ces/board-overview`, `ces/sprint-cadence`, `ces/closing-a-sprint`, `ces/monthly-retrospective`, `ces/calendar-primacy`, `audit-reporting/audit-mode-walkthrough`, `audit-reporting/survey-packet`, `audit-reporting/compliance-metrics`, `administration/regulatory-calendar-management`, `administration/policy-lifecycle`, `administration/amendment-register`, `troubleshooting/calendar-drift`, `troubleshooting/why-blocked` |

## 3. Administrator

| Field | Content |
|---|---|
| **Tier** | 1 |
| **Primary screens** | `/dashboard`, `/iAdministrator`, `/ces/reports`, `/audit`, `/admin/*` (planned) |
| **Must do** | Govern role assignments, approve governance exceptions, sign Tier-1-required documents, oversee executive metrics, sign off on monthly retrospectives. |
| **Must NOT do** | Modify workflow definitions without lifecycle review. Edit signed documents. Disable enforcement rules. |
| **Common errors** | Tier misconfiguration; calendar source missing; export blocked due to missing signatures; iAdministrator sync drift. |
| **Escalation** | Engineering (developer reference); legal counsel for ESIGN/UETA defensibility questions. |
| **Evidence generated** | Governance exception approvals; tier-1 signatures; executive report exports. |
| **Cadence** | Weekly: dashboard review. Sprint: closure sign-off. Monthly: retrospective sign-off + amendment register review. |
| **KB articles** | `getting-started/welcome`, `getting-started/roles-and-tiers`, `audit-reporting/executive-reports`, `audit-reporting/compliance-metrics`, `administration/tier-and-approver-config`, `administration/iadministrator-overview`, `administration/governance-exceptions`, `signatures-ecign/defensibility`, `signatures-ecign/void-a-signed-document` |

## 4. Workflow Owner

| Field | Content |
|---|---|
| **Tier** | typically 3–4 |
| **Primary screens** | `/ces/board`, WorkflowDrawer, `/forms/*` for owned forms |
| **Must do** | Drive a workflow instance from Prep → Audit; ensure each step has correct evidence; request signatures; close steps in order. |
| **Must NOT do** | Skip steps. Self-approve. Replace evidence after lock. |
| **Common errors** | Blocked dependency; missing evidence; signer unavailable; tier mismatch on second-sig request. |
| **Escalation** | Compliance Officer for reassignment, blocked items > 2 days, governance exception. |
| **Evidence generated** | Step evidence files, workflow completion record. |
| **Cadence** | Daily: progress owned units. Sprint close: confirm completion + evidence. |
| **KB articles** | `ces/working-an-execution-unit`, `workflows-evidence/workflow-lifecycle`, `workflows-evidence/capturing-evidence`, `workflows-evidence/blocked-items`, `workflows-evidence/delegation`, `signatures-ecign/single-signature`, `signatures-ecign/multi-signature`, `troubleshooting/why-blocked`, `troubleshooting/evidence-missing` |

## 5. Staff / Assignee

| Field | Content |
|---|---|
| **Tier** | 4 (or operational, no tier) |
| **Primary screens** | `/dashboard` (My Work), `/ces/board` (filtered to own assignments), `/forms/*` |
| **Must do** | Complete assigned execution-unit steps; attach required evidence; sign when prompted. |
| **Must NOT do** | Reassign your own work. Approve. Edit a signed document. |
| **Common errors** | "Step locked"; "Tier insufficient"; "Identity check failed"; missing evidence. |
| **Escalation** | Workflow Owner first; Compliance Officer if blocked > 1 sprint day. |
| **Evidence generated** | Per-step evidence files, signatures with identity + device + geo. |
| **Cadence** | Daily: clear My Work queue. |
| **KB articles** | `getting-started/your-first-sprint`, `ces/working-an-execution-unit`, `workflows-evidence/capturing-evidence`, `workflows-evidence/blocked-items`, `signatures-ecign/single-signature`, `troubleshooting/why-wont-it-sign`, `troubleshooting/print-rejected`, `troubleshooting/access-denied` |

## 6. Approver / Signer

| Field | Content |
|---|---|
| **Tier** | typically 1–3, dependent on signature requirement |
| **Primary screens** | `/dashboard` (Pending Signatures), `/forms/:id` |
| **Must do** | Review document content; complete the 6-step signing lifecycle (Disclosure → Identity → Review → Signature → Attestation → Lock); for second-sig, validate request comes from a strictly lower tier. |
| **Must NOT do** | Sign without reviewing the appended pages. Sign on behalf of another signer. Bypass identity check. |
| **Common errors** | "Hash mismatch"; "Camera blocked"; "Tier rejected for second-sig"; "Decline reason required". |
| **Escalation** | Compliance Officer for re-issue or void requests. Tier ≤ 2 only can void. |
| **Evidence generated** | Signature record + appended Certificate, Identity & Device, Audit Trail, Roster pages. |
| **Cadence** | Same-day on every Pending Signature notification. |
| **KB articles** | `signatures-ecign/single-signature`, `signatures-ecign/multi-signature`, `signatures-ecign/decline-and-reissue`, `signatures-ecign/template-preservation`, `signatures-ecign/audit-trail`, `troubleshooting/why-wont-it-sign`, `troubleshooting/access-denied` |

## 7. Auditor / Surveyor view

| Field | Content |
|---|---|
| **Tier** | Read-only audit role; tied to Compliance Officer credentials during a survey |
| **Primary screens** | `/audit`, `/ces/reports`, `/library` (read-only), `/forms/:id/print` |
| **Must do** | Use Audit Mode to traverse evidence by date / workflow / signer. Generate survey packet. Read appended pages on signed documents. Trace each calendar event to its evidence. |
| **Must NOT do** | Mutate any artifact. Request signatures. Reassign work. |
| **Common errors** | Aggregate stale; survey packet build blocked due to missing signature; void instance hidden by filter. |
| **Escalation** | Compliance Officer for clarification; Administrator for export approvals. |
| **Evidence consumed** | Survey packets; signed PDFs with all 4 appended pages; sprint closure reports; amendment register; control matrices. |
| **Cadence** | On-demand during a survey; quarterly during internal audits. |
| **KB articles** | `audit-reporting/audit-mode-walkthrough`, `audit-reporting/survey-packet`, `audit-reporting/compliance-metrics`, `signatures-ecign/audit-trail`, `signatures-ecign/defensibility`, `forms-library/form-print-view` |

---

## 8. Cross-role concerns (one shared section per manual)

| Concern | Rule |
|---|---|
| Identity | Every authenticated action records user, tier, IP, device fingerprint. |
| Evidence | Every closure event must have evidence; missing evidence blocks closure. |
| Calendar | The mandated calendar is authoritative. The sprint adapts. |
| Lock | Locked artifacts (signed documents, closed sprints, filed evidence) are read-only. Editing requires governance exception or void + re-issue. |
| Help | Every screen has a contextual `?` icon. Tap it before asking a colleague. |

---

## 9. Authoring rules

1. One folder per role under `End-User-Manuals/`.
2. File names: `01-Role-Definition.md`, `02-What-You-See.md`, …, `09-Related-KB-Articles.md`.
3. Each section ≤ 800 words. The whole manual is ≤ 6 000 words.
4. Cross-link to KB articles by slug, not duplicate copy.
5. Each manual ends with a printable checklist (`99-Checklist.md`) suitable for posting at a workstation.
6. Manuals are versioned (header `Version: vYYYY.MM.DD`); changes go through `EN-LC-001` policy lifecycle.
