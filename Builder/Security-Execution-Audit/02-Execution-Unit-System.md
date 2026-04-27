# 02 — Execution Unit (CEU) System

**Layer:** Execution Unit (EUL)
**Principle:** A CEU is the **only** unit of work in the platform. If something must be done, signed, approved, reviewed, evidenced, or remediated — it is a CEU.

---

## 1. CEU Structure

```
ExecutionUnit (CEU) {
  id: CeuId
  shortCode: string                         // human reference, e.g. CEU-2026-04-00231
  title: string
  description: string

  source: {
    system: 'onboarding' | 'policy_lifecycle' | 'audit' | 'calendar' | 'ecign' | 'ces' | 'manual'
    sourceId: string                        // foreign reference
    correlationId: string                   // ties grouped CEUs together
  }

  policyRef?: PolicyVersionRef              // see §6
  formRef?: FormRef
  patientRef?: PatientRef                   // PHI-tagged

  classification: {
    domain: 'clinical' | 'admin' | 'compliance' | 'governance' | 'survey' | 'phi'
    riskTier: 'low' | 'standard' | 'high' | 'critical'
    phi: boolean
  }

  ownership: {
    assigneeUserId?: UserId
    assigneeGroupId?: GroupId               // group-assigned until claimed
    requiredRoles: GroupId[]                // must be member of one
    reviewerUserId?: UserId
    requiresReviewer: boolean
  }

  evidence: {
    required: EvidenceRequirement[]
    submitted: EvidenceArtifact[]
  }

  signatures: {
    required: SignatureRequirement[]        // each has role + ecignTemplateId
    collected: SignatureRecord[]            // ecignSignatureId references
  }

  dependencies: {
    blockedBy: CeuId[]                      // hard prerequisites
    relatedTo: CeuId[]                      // soft links
    parentId?: CeuId
    childIds: CeuId[]
    bundleId?: string                       // batch grouping
  }

  schedule: {
    createdAt: ISODateTime
    dueAt?: ISODateTime
    slaHours?: number
    startedAt?: ISODateTime
    completedAt?: ISODateTime
  }

  state: CeuState                            // see doc 03
  stateHistory: CeuStateTransition[]         // append-only

  metadata: Record<string, unknown>
  version: number                            // optimistic lock
}
```

---

## 2. Source → CEU Mapping

| Source system | Trigger | CEU produced |
|---------------|---------|--------------|
| Onboarding Engine | New hire step reached | `Onboarding Step CEU` (per step), bundled by hire |
| Policy Lifecycle | New policy version drafted | `Policy Approval CEU` per required approver |
| Policy Lifecycle | Policy published | `Policy Acknowledgement CEU` per affected role/user |
| Audit (CES sprints) | Recurring compliance event due | `Compliance Execution CEU` |
| Calendar | Scheduled event (e.g., quarterly review) | `Scheduled Compliance CEU` |
| eCIgn | Signature requested | `Signature CEU` (if not already a child of another CEU) |
| Audit findings | Survey gap or self-audit finding | `Remediation CEU` |
| Manual (Compliance) | Ad-hoc directed work | `Manual CEU` (must include reason) |

Rule: **every** inbound work source goes through `Integration Layer → CEU normalization`. Subsystems must not store their own task records for compliance-relevant work.

---

## 3. Ownership & Assignment

- Initial assignment may be **group-level** (e.g., "RN") or **user-level**.
- Group-assigned CEUs require an explicit `claim()` action by an eligible user.
- Reassignment is logged (`CEU_REASSIGNED`) and requires an authorized actor (assignee's manager, Compliance, or override).
- An assignee must satisfy `ownership.requiredRoles` at the time of action; if their assignment changes, the CEU is auto-reassigned and the prior assignee loses execute rights.

---

## 4. Required Roles per CEU (examples)

| CEU type | Executor | Reviewer | Approver |
|----------|----------|----------|----------|
| Onboarding Step | New hire (or Onboarding Specialist) | Onboarding Specialist | — |
| Policy Approval | Director / Executive | — | (the approver itself) |
| Policy Acknowledgement | Affected user | — | — |
| Compliance Execution | Domain owner (Clinical/Admin) | Compliance | — |
| Remediation | Owner of finding | Compliance | Director (high risk) |
| Signature | Designated signer (per `SignatureRequirement.role`) | — | — |

---

## 5. Signature Requirements

```
SignatureRequirement {
  id
  role: GroupId | 'self' | 'witness'
  ecignTemplateId: string
  order?: number                 // sequential signing
  optional: boolean              // default false
}
SignatureRecord {
  requirementId
  ecignSignatureId               // canonical artifact id in eCIgn
  signedByUserId
  signedAt
  ipAddress, userAgent
  documentHash                   // hash of signed payload at signing time
}
```
- Signatures **must** route through eCIgn. Direct DB writes to `signatures.collected` outside the eCIgn callback are rejected and audited as `SIGNATURE_BYPASS_ATTEMPT`.
- A CEU cannot transition to `Completed` while any required, non-optional signature is missing.

---

## 6. Evidence Requirements

```
EvidenceRequirement {
  id
  kind: 'document' | 'attestation' | 'screenshot' | 'system_check' | 'training_record'
  description
  acceptedMimeTypes?: string[]
  validatorId?: string           // server-side validator (e.g., training hours min)
}
EvidenceArtifact {
  requirementId
  artifactRef                    // storage id
  contentHash                    // sha256
  submittedByUserId
  submittedAt
  validatedAt?
  validatorResult?: 'pass' | 'fail' | 'manual_review'
}
```

---

## 7. Dependency Chains

- `blockedBy` is a hard DAG. Adding a cycle is rejected.
- A blocked CEU cannot be `InProgress`; attempts emit `CEU_BLOCKED_ATTEMPT`.
- When a blocking CEU completes, blocked dependents are re-evaluated and (if no other blockers) move to `NotStarted` → ready.
- `parentId` / `childIds` model decomposition (e.g., a hire onboarding has many step children).
- `bundleId` groups related but independent CEUs (batch UI, batch metrics).

---

## 8. PolicyVersionRef Linkage

```
PolicyVersionRef {
  policyId
  policyCode                     // e.g. RM-OS-002
  versionId
  versionNumber
  effectiveDate
  contentHash
}
```
- Every CEU originating from policy lifecycle carries an immutable `PolicyVersionRef` snapshot.
- If the underlying policy is republished, **existing CEUs are not silently rebased.** A new CEU is generated linked to the new version. The old CEU records its `policyRef` permanently for audit.

---

## 9. Due Dates & SLA

- `dueAt` is computed from source rules (regulatory deadline, SLA hours from creation, calendar event date).
- `slaHours` defines the "at risk" threshold (entered at 80% of SLA elapsed).
- Past-due CEUs auto-transition to `AtRisk` then to escalation per Doc 03.

---

## 10. Batching & Grouping

- **Bundle** — operational grouping (e.g., "Q2 2026 Annual Reviews"). Surface together in CES board.
- **Batch operation** — Compliance can act across a bundle (assign, set due date, escalate). Each per-CEU mutation is logged individually.
- **Parent/Child** — semantic decomposition; parent state is derived from children (see Doc 03).

---

## 11. Anti-Patterns (rejected by design)

- Free-text checklists in UI that do not materialize as CEUs.
- Subsystem-private "todo" tables.
- Marking a CEU complete without satisfying signatures/evidence.
- Editing a completed CEU in place (a remediation CEU must be created instead).
