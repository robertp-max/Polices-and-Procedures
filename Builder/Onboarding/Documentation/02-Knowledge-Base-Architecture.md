# 02 — Knowledge Base Architecture

> **Purpose**: Define the canonical Help Center taxonomy. The Help Center is one knowledge surface across the platform — onboarding lives inside it as a category, not as a parallel knowledge silo.
>
> **Constraints honored**:
> - eCIgn is exactly **one** category.
> - CES is the **core operational** category.
> - Onboarding is **not** modeled as a checklist anywhere.

---

## 1. Top-Level Categories

| # | Category | Owner | Audience tiers |
|---|----------|-------|----------------|
| 1 | Getting Started | Product / Compliance | All |
| 2 | Onboarding (Compliance Activation) | Compliance | T1–T4 |
| 3 | Compliance Execution (CES) — *core operational* | Compliance | T2–T4 |
| 4 | Workflows & Evidence | Compliance / Engineering | T2–T3 |
| 5 | Forms Library | Compliance | T1–T3 |
| 6 | Policy Lifecycle | Compliance | T2–T4 |
| 7 | Signatures (eCIgn) | Compliance / Engineering | T1–T4 |
| 8 | Audit & Reporting | Compliance / Audit | T3–T4 |
| 9 | Enforcement & Gates | Compliance | T2–T4 |
| 10 | Troubleshooting | Support | All |
| 11 | Developer Reference | Engineering | T3 (engineers) |

Audience tiers (from `../09-Help-Center-and-User-Manual-Plan.md` §1):
- **T1** — Workforce member (subject of onboarding)
- **T2** — Assignees (Clinical Manager, RN observer, supervisor)
- **T3** — Compliance Officer / Administrator
- **T4** — Auditor / Surveyor

---

## 2. Category → Subcategory Map

### 2.1 Getting Started
- Platform overview
- Roles and permissions
- The compliance operating model in one page (Policy → Workflow → Evidence → Signature → Gate → Audit)
- Glossary

### 2.2 Onboarding (Compliance Activation)
- What onboarding is (and is not)
- The Compliance Activation Engine
- Triggers and lifecycles (New Hire / Role Change / Reactivation / Revalidation / Vendor / Governance)
- Role-based onboarding (one subcategory per role from `../02-Policy-Aligned-Onboarding-Model.md` §3)
- Execution batches and units
- Evidence in onboarding
- Competency validation
- Policy acknowledgments
- Field/Billing/System-Access clearance
- Recurring revalidation
- Vendor onboarding
- Governance onboarding
- Overrides

### 2.3 Compliance Execution (CES)
- The Sprint Board
- Execution units and bundles
- Compliance Calendar
- Assignment model
- Recurring execution
- Sprint planning and retrospectives
- Metrics and reporting
- How onboarding bundles flow through CES

### 2.4 Workflows & Evidence
- Authoring a workflow (governance and versioning)
- Workflow lifecycle events
- Evidence object types
- Evidence schema and validation
- Reconciliation against existing evidence
- Replay and reproducibility

### 2.5 Forms Library
- The Forms library overview
- Authoring and versioning forms
- Pinning a form to a policy version
- Form submissions as evidence
- Common form patterns (acknowledgment, competency checklist, training quiz)

### 2.6 Policy Lifecycle
- Policy authoring and approval
- Versioning and content hashing
- Republish behavior and re-acknowledgment
- Policy → Requirement mapping
- Domain catalog (EN, CL, OP, FN, RM, CO, IT, QA, HR)

### 2.7 Signatures (eCIgn) — single category
- What eCIgn does (and does not do)
- Single-signer flow
- Multi-signer flow (sequential and parallel)
- Bindings: PolicyVersion, EvidenceObject, Appointment
- Watermarks, hashes, and signed artifact integrity
- Identity verification and authentication
- Decline, expiry, and re-issue
- Override flow (CO + Admin dual signature)

### 2.8 Audit & Reporting
- The audit event model
- Per-subject dossier
- Surveyor quick answers
- Dossier export (watermarked, hash-verifiable PDF)
- Readiness scoring and contributors
- Override reports
- Vendor compliance ledger
- Governance ledger

### 2.9 Enforcement & Gates
- Field Clearance
- Billing Clearance
- System Access Clearance
- Vendor Engagement
- Governance Active
- Gate evaluation API for downstream systems
- Refusal events and how to investigate them
- Overrides: when, how, and the audit trail

### 2.10 Troubleshooting
- Unit stuck in Awaiting Evidence
- Unit stuck in Awaiting Signature
- Batch in Blocked
- Reconciliation suppressed a requirement
- Assignee unresolved
- Subject withdrew
- Policy republished mid-batch
- Vendor flagged on OIG/SAM
- Hash chain mismatch alert (engineering escalation)

### 2.11 Developer Reference
- Service contracts and event envelopes
- Idempotency keys
- Replay APIs
- Gate evaluation API
- Webhooks and CES adapter contracts
- eCIgn integration contract
- Data retention and migration

---

## 3. Article Schema

Every article in every category uses this structure:

```
Title
Audience tiers (T1–T4)
Summary (≤ 3 sentences)
What it does
How to do it (numbered, with screenshots where applicable)
System behavior (what happens behind the scenes; events emitted; state transitions)
Common errors (with remediation links)
Linked workflows / forms / policies / events
Permissions required
Related articles
Last reviewed (with reviewer)
```

This schema mirrors `../09-Help-Center-and-User-Manual-Plan.md` §4 and adds a **System behavior** section so that operational and engineering audiences (T3) get behind-the-scenes context.

---

## 4. Cross-Category Linking Rules

- Onboarding articles link to CES articles for execution mechanics — never duplicate them.
- Policy acknowledgment articles link to **Signatures (eCIgn)** for the signing mechanics.
- Enforcement articles link to **Audit & Reporting** for how to investigate refusals.
- Troubleshooting articles always link to the relevant category's primary article.
- Developer Reference is reachable from every category via a "For developers" footer link.

---

## 5. In-App Surfacing

- Each onboarding surface (Dashboard, Activation, Batch View, Evidence Panel, Competency View, Signature View, Audit Readiness) carries a "?" affordance that opens the topical article in a side drawer.
- Each unit row offers contextual help based on its workflow ID.
- Each error / blocker message links directly to the relevant Troubleshooting article.
- Search is global; results are categorized and ranked by audience tier.

---

## 6. Maintenance and Governance

- Articles are versioned. A policy version change triggers a review of all articles tagged with that policy.
- Quarterly review by Compliance Officer.
- Reader feedback ("Was this helpful?") routes to a CES backlog labeled `KB-{Category}`.
- Changes to category structure require Compliance Officer + Product approval; structure changes are themselves audited.

---

## 7. Anti-Patterns (forbidden)

- Splitting eCIgn across multiple categories.
- Creating an "Onboarding Tasks" or "Onboarding Checklist" category.
- Duplicating CES content inside the Onboarding category.
- Placing developer reference inside operational categories (it lives in §2.11 only).
- Articles that describe completion paths bypassing evidence/signature.
