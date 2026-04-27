# 09 — Help Center and User Manual Plan

## Purpose

Define the knowledge base structure that supports onboarding as a compliance activation engine. Articles serve administrators, compliance officers, clinical managers, assignees, and surveyors.

---

## 1. Audience Tiers

| Tier | Audience | Tone |
|------|----------|------|
| T1 | Workforce member (subject of onboarding) | Plain, action-oriented |
| T2 | Assignees (CM, RN observer, supervisor) | Operational |
| T3 | Compliance Officer / Administrator | Governance, enforcement, override |
| T4 | Auditor / Surveyor | Evidence reconstruction, dossier |

Every article is tagged with one or more tiers.

---

## 2. Top-Level Categories

1. Getting Started with Onboarding
2. Role-Based Onboarding
3. Execution & Sprint Board (CES) Integration
4. Evidence & Forms
5. Competency Validation
6. Policy Acknowledgments
7. eCIgn Signatures in Onboarding
8. Audit Readiness & Per-Subject Dossier
9. Recurring Revalidation
10. Vendor & Governance Onboarding
11. Compliance Enforcement & Overrides
12. Troubleshooting & Common Blockers
13. Surveyor / Auditor Quick Answers

---

## 3. Article Catalog

### 3.1 Getting Started
- What onboarding does (and what it is *not*)
- The Compliance Activation Engine in one page
- How a hire moves from intake to field clearance
- Glossary: Profile, Template, Batch, Unit, Evidence, Signature, Gate

### 3.2 Role-Based Onboarding
- How role-based onboarding works
- Reading the Role × Requirement matrix
- Onboarding for each role (one article per role from doc 02): Administrator, Clinical Manager, RN, LVN, HHA, Therapist, QAPI Participant, Compliance Officer, Privacy/Security Officer, Office/Admin, Intake/Scheduling, Billing/Coding, Governing Body, Medical Director, Vendor, Volunteer/Student
- Role changes: how the engine recomputes requirements
- Reactivation after leave

### 3.3 Execution & CES Integration
- How onboarding creates execution units
- How units appear on the Sprint Board
- How deadlines appear on the Compliance Calendar
- How blocked or at-risk batches behave
- Sprint planning and onboarding

### 3.4 Evidence & Forms
- What counts as evidence
- How evidence is validated
- How to capture evidence per object type (form submission, file upload, external system pull, system attestation)
- Why screenshots and email confirmations are not evidence

### 3.5 Competency Validation
- How competency validation works
- Who can be an observer for which role
- HHA 12-subject competency explained
- Failed competency: remediation flow
- Annual revalidation

### 3.6 Policy Acknowledgments
- How policy acknowledgments work
- Why one signature per policy version (no bulk packets)
- What happens when a policy is republished
- Stale acknowledgments and re-signing windows

### 3.7 eCIgn Signatures in Onboarding
- How eCIgn supports onboarding
- Single-signer vs multi-signer flows
- How signatures bind to policies and evidence
- Signer identity and authentication
- Watermarks, hashes, and the signed artifact

### 3.8 Audit Readiness & Per-Subject Dossier
- How onboarding affects audit readiness
- Reading the per-subject dossier
- "Show me how this person was qualified to perform X on date Y"
- Exporting a signed dossier for a surveyor

### 3.9 Recurring Revalidation
- How revalidation triggers fire (license, TB, BLS, in-service hours, monthly exclusion)
- Pre-expiry escalation windows
- What changes when a credential lapses

### 3.10 Vendor & Governance Onboarding
- Vendor onboarding lifecycle (intake, BAA, exclusion, insurance)
- Monthly vendor exclusion checks
- Governing Body member onboarding
- Compliance Officer, Privacy Officer, Security Officer, Medical Director appointments
- Annual COI and attestation cycles

### 3.11 Compliance Enforcement & Overrides
- The hard gates (Field, Billing, System Access)
- Why a clinician cannot be scheduled before clearance
- Why a coder cannot be granted billing access before clearance
- Requesting a Compliance Officer override (dual signature, time-bounded)
- What an override looks like in the audit trail

### 3.12 Troubleshooting & Common Blockers
- Unit stuck in Awaiting Signature
- Unit stuck in Awaiting Evidence
- Batch in Blocked: how to diagnose the gate failure
- Reconciliation suppressed a requirement — how to verify
- Assignee changed mid-batch
- Subject withdrew before completion
- Policy republished mid-batch
- Vendor flagged on OIG/SAM

### 3.13 Surveyor / Auditor Quick Answers
- How to find a person's full compliance record
- How to verify a specific policy was acknowledged
- How to verify a specific competency was validated
- How to verify field/billing/system access clearance on a specific date
- How to view all overrides in a period
- How to export a signed dossier

---

## 4. Article Template

Every article uses a single template:

```
Title
Audience tiers
Summary (3 sentences)
What it does
How to do it (numbered steps with screenshots)
Required permissions
Linked workflows / forms / policies
Common errors
Related articles
Last reviewed (with reviewer)
```

---

## 5. In-App Help Surfacing

- Each onboarding surface (per doc 07) shows a "?" affordance that opens the topical article in a side drawer.
- Each unit row offers contextual help based on the unit's workflow ID.
- Each error / blocker message links directly to the relevant Troubleshooting article.

---

## 6. User Manual Compilation

The Help Center articles compile into a versioned User Manual:

- Compiled per release.
- Indexed by role and by surface.
- Includes a "What changed" diff against the prior version.
- Distributed as a watermarked PDF and as the live in-app Help Center.

---

## 7. Maintenance

- Articles are versioned. A policy version change triggers a review of all articles tagged with that policy.
- Quarterly review by Compliance Officer.
- Reader feedback ("Was this helpful?") routed to a CES backlog labeled `KB-Onboarding`.
