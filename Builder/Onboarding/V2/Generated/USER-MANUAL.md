# Onboarding v2 — End User Manual

**Audience:** Compliance Officers, Administrators, Clinical Managers, Branch Managers, Executive Leadership.
**Module URL:** `/onboarding-v2`
**Version:** 1.0

---

## How to think about Onboarding v2

Every new hire, role change, vendor engagement, policy version update, or annual revalidation creates a **batch**. A batch is a bundle of **units** — one unit per regulatory or policy requirement that the subject must satisfy. Each unit collects **evidence** and **signatures**, and as units complete, **gates** open. When all required gates open, the subject is *Field Cleared*, *Bill-Ready*, *System-Provisioned*, *Vendor-Engaged*, or *Governance-Active* — depending on the gate.

Everything is hash-chained. Nothing is hidden. Surveyors can read every action from this module.

---

## 1. Sign in and orient

1. From the left rail, click **Onboarding v2** (sparkles icon).
2. The sub-rail offers five surfaces:
   - **Dashboard** — at-a-glance batch health
   - **Activate** — start a new batch
   - **Batches** — search/filter every batch
   - **Audit Readiness** — surveyor-grade dossier per subject
   - **Governance** — overrides, vendor engagements, policy bindings

The first time you arrive, the **Dashboard** opens with the seeded demo data so you can explore safely.

---

## 2. Activate a subject

**Use this when:** you have a new hire, a role change, a vendor onboarding, a policy version update, or a scheduled annual revalidation.

1. Click **Activate** in the sub-rail.
2. **Subject:** pick the workforce member or vendor.
3. **Trigger:** pick the trigger type (`NEW_HIRE`, `ROLE_CHANGE`, `BRANCH_TRANSFER`, `POLICY_VERSION_CHANGE`, `ANNUAL_REVALIDATION`, `VENDOR_ENGAGEMENT`, `CREDENTIAL_EXPIRY_WINDOW`).
4. **Roles:** pick one or more roles whose requirements should be emitted.
5. **Reconciliation preview:** the panel below tells you which requirements will be **emitted**, **suppressed** (because valid evidence already exists), and **escalated** (because they're past due or expiring soon). Read this carefully before activating.
6. **Activate.** The batch is created, units are emitted, the audit chain is appended.

The page navigates you to the new batch.

> **Tip:** For `POLICY_VERSION_CHANGE`, only the requirements that bind to the new policy version are emitted. The rest are reconciled.

---

## 3. Drive a batch to completion

1. Click **Batches** → pick a batch.
2. The header shows the subject, trigger, roles, effective date, due date, and overall status.
3. The **Gate Strip** shows the five gates and their current outcome (Pass / AwaitingEvidence / AwaitingSignature / Fail / Conditional Override).
4. The **Phase Accordions** group units by phase: `PreEmployment`, `Day1Orientation`, `Pre30Day`, `Pre90Day`, `Steady`, `Trigger`.
5. Click any unit to open the **Unit Drawer**:
   - **Overview** — requirement metadata, dependencies, due date.
   - **Evidence** — each required `objectType` with its capture status. Click **Capture evidence** to attach a file or attestation. Hash and timestamp are recorded automatically.
   - **Signatures** — each required signature with signer role + binding. Click **Sign** to attest (mock) or **Decline** with reason.
   - **Audit** — the unit's slice of the subject hash chain.

As each unit becomes `Completed`, the gate strip recalculates live. When every required gate passes, the batch auto-seals and is marked `Completed`.

---

## 4. Read the Dashboard

- **KPI strip:** open batches, blocked units, overdue items, active overrides, average days-to-clear by gate.
- **Phase histogram:** unit counts grouped by phase + status. Use this to spot bottlenecks.
- **Recent activity:** the last ~30 audit events across all subjects, with type icons and timestamps.

Click any KPI to drill into the matching batch list filter.

---

## 5. Audit Readiness — assemble a surveyor dossier

1. **Audit Readiness** in the sub-rail.
2. Pick a subject.
3. The page shows:
   - **Identity** card (name, role, branch, hire date, supervisor).
   - **Hash chain status** — `Verified` (green) or `Broken at #N` (red). If broken, do not let the subject visit a patient and contact your administrator immediately.
   - Eight tabs: **Required Files / Training Records / Skills Validation / Background Verification / OIG-LEIE Checks / Health & Safety / Active Policies / Audit Timeline**.
4. **Export dossier** produces a JSON bundle with every event, evidence object, signature record, gate evaluation, and override active for that subject. This is the surveyor handoff.

---

## 6. Governance — request an override

**Use this when:** a regulatory deadline cannot be met for a documented reason, and you need to keep the subject moving while remediation is in progress.

1. **Governance** → **Request override**.
2. Pick the subject, the gate, and provide a clear reason (regulatory citation if applicable) and a validity window (default 30 days).
3. Submit. The override appears immediately under **Active overrides** with its expiry.
4. The affected gate now reports `Conditional Override` instead of `Fail` — but the missing requirements remain visible in every subsequent gate evaluation, so the breach is never hidden.

> **Important:** Overrides require dual signature in production. The current build is a single-click demo flow; do not use for live decisions.

---

## 7. Common scenarios (quick recipes)

### A new RN starts Monday
1. Activate → pick the RN → trigger `NEW_HIRE` → roles `RN` → reconcile preview → Activate.
2. Open the new batch → walk Day1Orientation phase → capture orientation attendance evidence + signatures.
3. PreEmployment phase will show suppressed items if the candidate's PSV evidence was already captured during recruiting.

### CMS publishes a Conditions of Participation update
1. Activate → trigger `POLICY_VERSION_CHANGE` → choose the affected policy in the trigger payload — only requirements bound to that policy version are emitted.
2. Each affected workforce member receives a re-attestation unit; supervisors see the queue under their batch list.

### A surveyor walks in
1. Audit Readiness → pick the subject under question → confirm chain status `Verified` → **Export dossier** → present.
2. Use the **Active Policies** tab to show the exact policy versions binding the subject's clearances right now.

---

## 8. What changed from the old onboarding (`/journey`)

- **Determinism.** Same trigger always produces the same batch shape.
- **Hash chain.** Every event is integrity-anchored; tampering is detectable.
- **Reconciliation.** Repeat work is suppressed, not silently re-emitted.
- **Five gates with clear semantics.** Field-Ready means *can see a patient*. Bill-Ready means *can be billed*. No ambiguity.
- **Override is auditable.** A failed gate that's been override'd still tells you what's missing.

The legacy `/journey` module remains available; v2 is additive.

---

## 9. Frequently asked questions

**Q: Why did my requirement get suppressed?**
The reconciliation engine found valid evidence already on file inside the cadence window (annual / biennial / monthly / Rolling12mo). The original evidence remains the source of truth.

**Q: A unit is `Blocked`. What does that mean?**
A dependency unit hasn't completed yet. Open the drawer's **Overview** tab to see which dependency.

**Q: The gate strip says `Conditional Override`. Is the gate passing?**
Effectively yes for operational purposes, but the missing requirements remain itemized in every gate evaluation and the audit chain. Treat it as a tracked exception, not a clean pass.

**Q: Can I delete an evidence file?**
No. You can reject it (with reason). Rejection is recorded but the original record is preserved.

**Q: What happens if the hash chain breaks?**
Stop using the subject for patient care immediately, do not modify any records, and contact your administrator. The break point is reported on the Audit Readiness page.

---

## 10. Where to get help

- In-app: top-right **Help** → category **Onboarding v2** has 13 articles indexed by surface.
- Module owner: Compliance Officer.
- Defect reporting: file an issue against the `onboarding-v2` module label.
