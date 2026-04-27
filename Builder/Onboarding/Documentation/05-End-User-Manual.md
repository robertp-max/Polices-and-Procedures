# 05 — End User Manual (Role-Based)

> **Audience**: Operators of the platform.
> **Format**: One section per role. Each section answers: what they see, what they must do, what they must NOT do, how to complete tasks, how to resolve blockers, how to handle signatures, and how to verify compliance.
>
> **Roles covered**:
> 1. Compliance Officer
> 2. Administrator
> 3. Clinical Manager
> 4. Assignee (the person assigned to a unit — RN observer, supervisor, intake coordinator, etc.)
> 5. Signer (subject of a signature — workforce member, vendor, governance role)
> 6. Auditor (internal or external surveyor)

---

## 1. Compliance Officer

### What you see
- **Onboarding Dashboard** with KPIs, readiness contribution, live event feed, tabbed lists for New Hires / Role Changes / Reactivations / Revalidations / Vendors / Governance.
- **Activations** queue and the Role-Based Activation screen.
- **Batch View** for any active or historical batch.
- **Audit Readiness View** for any subject.
- **Overrides ledger** and **Enforcement & Gates** views.

### What you must do
- Activate onboarding for new hires, role changes, reactivations, vendors, and governance appointments.
- Review reconciliation previews before activating.
- Sign batch closure attestations on `BATCH_COMPLETED`.
- Review and approve override requests (multi-sig with Administrator); never approve open-ended overrides.
- Investigate Blocked batches and refusals; remediate or escalate.
- Maintain the override ledger and the readiness score on the dashboard.

### What you must NOT do
- Bypass evidence or signatures via direct database access.
- Approve a bulk policy acknowledgment.
- Grant an override without a stated reason and a bounded `valid_until`.
- Delete or attempt to alter audit events.
- Treat onboarding as a checklist or paperwork process.

### How to complete typical tasks

**Activate onboarding for a new hire**
1. **Onboarding → Activations → New Activation**.
2. Select the subject, trigger `NEW_HIRE`, role(s), effective date, scope.
3. Review template preview + reconciliation preview.
4. Click **Activate**. The engine creates the batch; you are routed to the Batch View.

**Close a batch**
1. Open the Batch View. Confirm all units are `Completed` or `Suppressed` and all gates are `Pass`.
2. Click **Attest & Close**. Complete eCIgn attestation.
3. The system seals the dossier and updates the readiness score.

**Approve an override**
1. Open the override request (from the failing unit/gate or the Overrides queue).
2. Verify the reason is concrete and the `valid_until` is bounded (default ≤ 30 days).
3. Sign via eCIgn. The Administrator must sign next.
4. The override becomes active on second signature.

### How to resolve blockers
- **Blocked batch**: open the failing gate or dependency; remediate the missing requirement; the batch transitions out of Blocked automatically once the cause is cleared.
- **Stuck Awaiting Signature**: re-issue the eCIgn envelope or escalate per spec.
- **Reconciliation surprise**: open the audit event; verify the source evidence is genuinely valid and within window.
- **Hash chain alert**: do not export dossiers; engineering escalation.

### How to handle signatures
- All your signatures are eCIgn. Identity verification is mandatory.
- For overrides, you sign first; the Administrator signs second.

### How to verify compliance
- Use **Audit Readiness View** for a subject; run **Surveyor Quick Answers**.
- Export a signed dossier when external evidence is required; the export is itself audited.

---

## 2. Administrator

### What you see
- The same Onboarding surfaces as the Compliance Officer (dashboard, batches, dossiers).
- A higher-trust action set: appointment acceptance signing, dual-signature override approvals, governance-active gate state.

### What you must do
- Sign your appointment acceptance and annual attestations.
- Co-sign overrides initiated by the Compliance Officer.
- Maintain the Delegation of Authority matrix (review and re-sign on change).
- Ensure governance roles (CO, Privacy Officer, Security Officer, Medical Director) remain current.

### What you must NOT do
- Approve overrides without a Compliance Officer first signature.
- Approve override windows beyond policy maximum without escalation.
- Bypass governance appointment workflows.

### How to complete typical tasks

**Sign appointment acceptance**
1. Open the Signature View on the Appointment unit.
2. Review the appointment letter at pinned version.
3. Sign via eCIgn.

**Co-sign an override**
1. Open the override pending your signature.
2. Confirm reason and validity window.
3. Sign via eCIgn (sequential after Compliance Officer).

### How to resolve blockers
- **Governance Active gate failing**: open the affected appointment unit; ensure attestation and qualification evidence are current.
- **Delegation matrix out of date**: re-author and re-sign on change.

### How to handle signatures
- All your signatures route through eCIgn.
- Multi-sig sequential ordering is enforced by the engine; do not request out-of-order signing.

### How to verify compliance
- Review the **Overrides ledger** at least weekly.
- Review the **Governance** tab on the dashboard for currency.

---

## 3. Clinical Manager

### What you see
- **Sprint Board** with onboarding bundles assigned to your branch / domain.
- **Batch View** for clinicians under your supervision.
- **Competency Validation View** for clinicians you observe.
- Compliance Calendar entries for HHA supervisory visits, in-service hours, and competency revalidations.

### What you must do
- Sign clinical leadership appointment and supervisory acknowledgments.
- Observe and finalize competency validations for clinicians where qualified.
- Maintain HHA supervisory visit cadence per CoP.
- Review and sign QAPI participation evidence where applicable.
- Triage Blocked clinical units; escalate to Compliance Officer when needed.

### What you must NOT do
- Mark a competency Pass without observing the skill in the recorded setting.
- Sign a competency for a clinician outside your qualified-observer scope.
- Bypass the dual-signature requirement on competency.
- Approve a clinician for field work that lacks Field Clearance.

### How to complete typical tasks

**Validate an HHA's 12-subject competency**
1. Open the competency unit.
2. Select setting (Patient / Simulated).
3. Score each skill; add notes for any Needs Remediation.
4. Finalize. Sign as observer via eCIgn; HHA signs second.

**Document an HHA supervisory visit**
1. Open the supervisory visit unit on the Sprint Board.
2. Complete the form; capture observations and any deficiencies.
3. Sign via eCIgn.

### How to resolve blockers
- **Field Clearance failing for a clinician**: open the dossier; identify the failing requirement (license, BLS, TB, competency); coordinate remediation.
- **Competency Failed**: a remediation sub-batch is auto-emitted; complete it before re-attempting.

### How to handle signatures
- Observer signatures on competency are required and qualifying-role-restricted.
- Acknowledgment signatures bind to specific policy versions; do not pre-sign or bulk-sign.

### How to verify compliance
- Review the Sprint Board daily for At Risk / Blocked clinical units.
- Use the dossier of any clinician to verify their compliance state at a given date.

---

## 4. Assignee (any role)

### What you see
- Your Sprint Board column with units assigned to you.
- Each unit's **Unit Drawer** with Overview / Evidence / Signatures / Audit Timeline.
- The Help "?" affordance on every surface.

### What you must do
- Open your assigned units and complete the workflow.
- Capture required evidence; address validation feedback inline.
- Trigger required signatures via eCIgn.
- Mark the unit advanced only by completing real evidence + signature work.

### What you must NOT do
- Look for a "mark complete" button — there is none.
- Use ad hoc forms; the Forms library renders the pinned form.
- Email scanned signatures; eCIgn is the only path.

### How to complete typical tasks

**Capture evidence**
1. Open the unit → **Evidence** tab.
2. Submit the form, upload the file, or trigger the external pull.
3. Resolve validation errors inline.
4. Save. The unit advances if all required evidence is Valid.

**Request a signature**
1. Open the unit → **Signatures** tab.
2. Click **Issue Envelope** (if applicable) or wait for engine-initiated envelope.
3. Notify the signer; track progress in the side panel.

### How to resolve blockers
- **Awaiting Signature too long**: open the envelope status; re-issue or escalate.
- **Evidence rejected**: read the rejection reason; correct and resubmit.
- **Owner mismatch**: contact your supervisor to reassign through the CES Assignment Model — never edit the owner field directly.

### How to handle signatures
- You are typically the requestor or a co-signer; complete identity verification when prompted.

### How to verify compliance
- The Audit Timeline tab on each unit shows every event in order.

---

## 5. Signer

### What you see
- A notification (in-shell, email fallback) that you have a signature pending.
- The Signature View opens to the document at its pinned version with a content hash visible.

### What you must do
- Read the document.
- Confirm you understand the acknowledgment language.
- Complete identity verification.
- Sign via eCIgn.

### What you must NOT do
- Sign a stale version (the system flags this; do not override).
- Forward your signing link to a delegate; delegations are configured at the engine, not in UI.
- Sign without reading; declination with a reason is preferred to a bad-faith signature.

### How to complete typical tasks

**Acknowledge a policy**
1. Open the signature notification.
2. Read the policy in the document viewer; confirm the version + hash.
3. Click **Sign**; complete identity verification.
4. The signed artifact appears with timestamp, IP, and auth method.

**Sign as a co-signer in a multi-sig flow**
- Wait for your turn (sequential) or sign in any order (parallel) as indicated.

### How to resolve blockers
- **Identity verification failed**: contact your supervisor; the engine controls auth methods.
- **Stale acknowledgment**: a re-acknowledgment unit will appear automatically when the policy is republished.

### How to verify compliance
- Open your dossier to view all your signed artifacts.

---

## 6. Auditor (internal or external surveyor)

### What you see
- The **Audit Mode → Onboarding lens**.
- Per-subject dossier with Credentials, Acknowledgments, Competencies, Trainings, Gates, Overrides, Evidence tabs.
- **Surveyor Quick Answers** with date + skill picker.

### What you must do
- Use Surveyor Quick Answers to verify "qualified to perform X on date Y".
- Inspect signed artifacts; verify watermarks + hashes.
- Review override ledger for the period under review.
- Request a signed dossier export when needed.

### What you must NOT do
- Attempt to write or modify any record.
- Bypass the audit chain by reading raw storage.

### How to complete typical tasks

**Verify a clinician was qualified to perform a visit on a specific date**
1. Open the clinician's dossier.
2. Open **Surveyor Quick Answers**; enter the date and the skill.
3. Read the citation chain (license, competency, training, signatures).

**Export a signed dossier**
1. From the dossier, click **Export Signed Dossier (PDF)**.
2. Confirm scope and recipient.
3. The export emits an audit event; the file is watermarked and hash-verifiable.

### How to verify compliance
- Hash-verify any artifact you receive against the dossier metadata.
- Cross-check the overrides ledger; confirm bounded validity windows.
- Replay any historical batch via the **Replay** action (read-only) for reproducibility.

---

## Cross-Role Reminders

- **No "complete" button bypasses evidence + signature.** Anywhere.
- **eCIgn is the only signature pipeline.** Paper is evidence at most.
- **Bulk acknowledgments are forbidden.** One signature per policy version per subject.
- **Overrides are dual-signed, time-bounded, and audited.** They never apply retroactively.
- **The Sprint Board is the only task surface; the Compliance Calendar is the only deadline surface.**
