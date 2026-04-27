# Onboarding v2 — Knowledge Base Article Catalog

This file mirrors the runtime Help Center articles registered in `src/policy/help/articles/onboarding-v2.ts`. They are accessible in-app at **Help Center → Onboarding v2**.

---

## Index

| # | Slug | Title | Subcategory |
|---|---|---|---|
| 1 | `ov2-overview` | Onboarding v2 — What it is and why it exists | Getting Started |
| 2 | `ov2-roles` | Role-based onboarding — 17 roles, one engine | Role-Based Onboarding |
| 3 | `ov2-ces-integration` | CES integration — sprints, calendar, reports | CES Integration |
| 4 | `ov2-evidence` | Evidence & Forms — capturing immutable artifacts | Evidence & Forms |
| 5 | `ov2-competency` | Competency validation — observed skills + cadence | Skills & Competency |
| 6 | `ov2-acknowledgments` | Policy acknowledgments — version-bound attestations | Acknowledgments |
| 7 | `ov2-ecign` | eCIgn — identity-verified envelopes for v2 | Signatures |
| 8 | `ov2-audit` | Audit & Reporting — surveyor-grade dossiers | Audit & Reporting |
| 9 | `ov2-revalidation` | Recurring revalidation — annual, biennial, rolling | Lifecycle |
| 10 | `ov2-vendor` | Vendor / Business Associate onboarding | Vendors |
| 11 | `ov2-overrides` | Compliance overrides — controlled exceptions | Governance |
| 12 | `ov2-troubleshooting` | Troubleshooting — broken chains, stuck units, suppressed work | Operations |
| 13 | `ov2-surveyor-quick` | Surveyor quick-start — read-only investigation playbook | Surveyor |

---

## 1. `ov2-overview` — Onboarding v2: What it is and why it exists

**Subcategory:** Getting Started

**Purpose.** Explain the audit-grade onboarding execution module that replaces the legacy journey for compliance-bound activations.

**When to use.** Read first when learning the v2 surface. Compliance officers, supervisors, administrators, and surveyors should all start here.

**Steps.**
1. Open Onboarding v2 → Dashboard for the live posture across all subjects.
2. Use Activate Subject to trigger a `NEW_HIRE`, `ROLE_CHANGE`, `ANNUAL_REVALIDATION`, `POLICY_VERSION_CHANGE`, or `VENDOR_ENGAGEMENT`.
3. Open any batch to inspect gates, phases, units, evidence, signatures, and the immutable audit chain.
4. Use Audit Readiness to export a per-subject dossier verifiable against hash-chained events.

**System behavior.** Activation is deterministic: a single trigger emits one batch, one set of units, and a hash-chained sequence of audit events. Every state transition writes an event keyed by sequence number with prevHash → eventHash linkage.

**Compliance impact.** Replaces ad-hoc onboarding checklists with surveyor-defensible execution: every requirement is bound to a published policy version, every artifact is content-hashed, every gate is computed from contributing requirements.

**Evidence.** Snapshot of the dashboard, exported per-subject dossier (JSON), and the live audit feed with hash-chain verification status.

**Related components.** `DashboardPage`, `ActivationPage`, `AuditReadinessPage`.

---

## 2. `ov2-roles` — Role-based onboarding: 17 roles, one engine

**Subcategory:** Role-Based Onboarding

**Purpose.** Document how role taxonomy drives the requirement set per subject.

**When to use.** When activating a new hire or changing a role; when reconciling why two subjects with the same trigger received different units.

**Steps.**
1. Open Activate Subject and pick the subject.
2. Choose roles (multi-select). Each role contributes its template requirements.
3. Inspect the reconciliation preview — already-valid evidence within window will be suppressed.
4. Activate — one batch is created with the union of role-driven requirements.

**System behavior.** Each role maps to an `OnboardingTemplate` filtered by trigger type. Templates resolve to `RoleRequirement`s and `EvidenceSchema`s; the engine emits one `OnboardingExecutionUnit` per requirement with policy-version binding.

**Compliance impact.** Guarantees that every role gets the regulator-mandated checklist, never less. Branch- and license-scoped requirements are added by the same template logic, not by manual edits.

**Evidence.** Activation audit trail: `TRIGGER_RECEIVED` → `PROFILE_RESOLVED` → `TEMPLATE_SELECTED` → `BATCH_CREATED` → `REQUIREMENT_EMITTED`.

**Related components.** `ActivationPage`, `BatchViewPage`.

---

## 3. `ov2-ces-integration` — CES integration: sprints, calendar, reports

**Subcategory:** CES Integration

**Purpose.** Explain how Onboarding v2 units surface inside the Compliance Execution System.

**When to use.** When planning sprints; when verifying that an activation generated calendar items; when reviewing CES reports.

**System behavior.** Each unit emits CES-compatible events (`REQUIREMENT_EMITTED`) that the existing CES engine can ingest. Due dates are computed from the requirement cadence + SLA.

**Compliance impact.** Maintains one source of truth for compliance work: onboarding does not create a parallel queue.

**Evidence.** Cross-link from `/onboarding-v2/batches/:id` to the CES Sprint Board filtered by subject.

**Related components.** `BatchViewPage`.

---

## 4. `ov2-evidence` — Evidence & Forms: capturing immutable artifacts

**Subcategory:** Evidence & Forms

**Purpose.** Explain how evidence is captured, validated, and bound to units and policy versions.

**When to use.** When uploading a credential, attesting a form, or recording a training completion.

**Steps.**
1. Open a unit drawer → Evidence tab.
2. Select the required object type (`PSVResult`, `TrainingRecord`, `FormSubmission`, `CompetencyValidation`, etc.).
3. Provide a filename or attestation; the engine assigns a content hash and timestamp.
4. The unit recomputes status; if all evidence is present and signatures are pending, status moves to `AwaitingSignature`.

**System behavior.** Evidence is append-only. Rejection sets `status: 'Rejected'` with a reason but preserves the original record.

**Compliance impact.** Surveyor-defensible artifacts: every file has a hash; tampering is detectable.

**Evidence.** Evidence tab listing required vs. captured; rejection notes appear with reason and rejecter.

**Related components.** `EvidencePanel`, `UnitDrawer`.

---

## 5. `ov2-competency` — Competency validation: observed skills + cadence

**Subcategory:** Skills & Competency

**Purpose.** Document the recurring competency validation workflow for clinical roles.

**When to use.** New-hire skills validation, annual recompetency, post-incident remediation.

**System behavior.** A `CompetencyValidation` evidence object records observer, observed actions, and outcome. Cadence is enforced via the requirement's `cadence.recurrence`.

**Compliance impact.** Satisfies CoP §484.80 personnel competency requirements with traceable observer attribution.

**Related components.** `EvidencePanel`.

---

## 6. `ov2-acknowledgments` — Policy acknowledgments: version-bound attestations

**Subcategory:** Acknowledgments

**Purpose.** Explain how policy acknowledgments bind to a specific published policy version.

**When to use.** Onboarding day-1, after a policy version change, during annual revalidation.

**System behavior.** A `PolicyAcknowledgment` evidence object stores `policyId@policyVersion` and the content hash at the time of acknowledgment. Subsequent policy versions trigger a new acknowledgment unit.

**Compliance impact.** Eliminates the "I don't know what I signed" defense. The exact policy version and content hash are preserved.

**Related components.** `PolicyVersionLink`, `EvidencePanel`.

---

## 7. `ov2-ecign` — eCIgn: identity-verified envelopes for v2

**Subcategory:** Signatures

**Purpose.** Document how Onboarding v2 binds to eCIgn for required signatures.

**When to use.** Whenever a requirement carries one or more `signatureSpecs[]`.

**System behavior.** Each `SignatureRecord` references an envelope, signer role, binding type (`PolicyVersion`, `EvidenceObject`, `Appointment`), signed artifact URI, hash, and auth method (e.g., MFA-Push).

**Compliance impact.** Identity-verified attestations satisfy CoP and §164.312(a)(2)(i) integrity requirements.

**Related components.** `SignerStrip`, `UnitDrawer`.

---

## 8. `ov2-audit` — Audit & Reporting: surveyor-grade dossiers

**Subcategory:** Audit & Reporting

**Purpose.** Explain the per-subject hash-chained audit stream and dossier export.

**When to use.** Surveyor visits, internal QA, incident investigations, board reporting.

**Steps.**
1. Open Audit Readiness → pick the subject.
2. Confirm chain status reads `Verified` (re-derived from prevHash linkage).
3. Walk the eight tabs (Required Files, Training Records, Skills Validation, Background Verification, OIG-LEIE, Health & Safety, Active Policies, Audit Timeline).
4. Click **Export dossier** to produce a JSON bundle.

**System behavior.** `verifyChain()` walks every event in subject-stream sequence, recomputes `eventHash`, and validates `prevHash` linkage.

**Compliance impact.** Eliminates "the records were altered" challenges. A broken chain is detected, reported, and surfaced visually.

**Related components.** `AuditReadinessPage`, `AuditTimeline`.

---

## 9. `ov2-revalidation` — Recurring revalidation: annual, biennial, rolling

**Subcategory:** Lifecycle

**Purpose.** Document how recurring requirements re-emit themselves.

**When to use.** Whenever a credential, training, or attestation has a cadence.

**System behavior.** The `CREDENTIAL_EXPIRY_WINDOW` and `ANNUAL_REVALIDATION` triggers consult `cadence.preExpiryWindowDays` to surface units before expiry. The reconciler suppresses requirements that have already been refreshed within the window.

**Compliance impact.** Prevents lapses; provides audit trail for proactive remediation.

**Related components.** `ActivationPage` (manual trigger today; cron in production).

---

## 10. `ov2-vendor` — Vendor / Business Associate onboarding

**Subcategory:** Vendors

**Purpose.** Document the vendor-engagement subset of Onboarding v2.

**When to use.** Onboarding a Business Associate, Non-BA vendor, or contractor.

**System behavior.** `VENDOR_ENGAGEMENT` trigger emits BAA, security questionnaire, and OIG check requirements bound to the vendor classification.

**Compliance impact.** Satisfies HIPAA §164.502(e) BAA requirements with traceable artifact binding.

**Related components.** `GovernancePage`.

---

## 11. `ov2-overrides` — Compliance overrides: controlled exceptions

**Subcategory:** Governance

**Purpose.** Explain the override request, approval, and expiry workflow.

**When to use.** When a regulatory deadline cannot be met for a documented reason.

**Steps.**
1. Governance → Request override → pick subject + gate + reason + validity window.
2. Submit; the gate is reported as `Conditional Override` while the missing requirements remain itemized.
3. Remediate the missing items before expiry; the override is then no longer needed.

**System behavior.** Active overrides are consulted by `evaluateGate()`. Outcome flips from `Fail` to `Conditional` but `missingRequirementIds[]` persists.

**Compliance impact.** Provides an honest, auditable exception flow. The breach is preserved, not hidden.

**Related components.** `GovernancePage`.

---

## 12. `ov2-troubleshooting` — Broken chains, stuck units, suppressed work

**Subcategory:** Operations

**Purpose.** Diagnose the most common operational issues.

**Steps.**
1. **Hash chain `Broken at #N`**: stop using subject for patient care; do not modify records; contact administrator. Investigate event `N-1` to `N+1` for tampering or partial writes.
2. **Unit stuck in `AwaitingSignature`**: open Signatures tab → confirm envelope status; resend if needed.
3. **Activation produced fewer units than expected**: read the reconciliation preview — items are suppressed when valid evidence already exists in window.
4. **Gate stuck in `AwaitingEvidence`**: walk every contributing requirement in the gate's missing list; capture evidence on each.

**Compliance impact.** Faster remediation, clearer triage.

---

## 13. `ov2-surveyor-quick` — Surveyor quick-start: read-only investigation playbook

**Subcategory:** Surveyor

**Purpose.** Give a surveyor (or internal QA reviewer) the fastest path to verifying compliance posture for a subject or sample.

**Steps.**
1. Audit Readiness → pick the subject under question.
2. Confirm hash-chain verification reads `Verified`.
3. Use the **Active Policies** tab to confirm exact policy versions binding the subject's clearances.
4. Use the **Required Files** and **Training Records** tabs to spot-check evidence.
5. Use the **Audit Timeline** tab to walk the chronology of activation, evidence capture, signatures, and gate evaluations.
6. **Export dossier** to take an offline copy.

**Compliance impact.** Reduces audit time-on-site and dramatically reduces follow-up inquiries.

**Related components.** `AuditReadinessPage`, `AuditTimeline`.
