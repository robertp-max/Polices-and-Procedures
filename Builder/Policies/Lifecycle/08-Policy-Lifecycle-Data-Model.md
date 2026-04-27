# 08 — Policy Lifecycle Data Model

> Canonical entities, fields, and relationships. Designed to enforce the invariants from [03](03-Policy-Lifecycle-Architecture.md) and the rules from [06](06-Compliance-Enforcement-Model.md), and to integrate cleanly with the existing eCIgn schema in [migrations/001_ecign_schema.sql](../../../migrations/001_ecign_schema.sql).

Notation: `*` = required, `•` = optional, `→ Entity` = foreign key, `[]` = collection.

---

## 1. Entity Diagram

```
Policy ──1───*── PolicyVersion ──1───*── PolicyLifecycleInstance
   │                  │                       │
   │                  ├───*── ApprovalRequirement
   │                  ├───*── SignatureRequirement ──1───1── ecign.signatures
   │                  ├───*── ReviewComment
   │                  ├───*── DistributionRecord
   │                  └───*── PolicyAuditEvent ─── chained ─── ecign.audit_events
   │
   └───*── PolicyAssignment ──*───1── AcknowledgmentRecord
```

---

## 2. Policy (logical record, never lifecycle-stated)

```
Policy
  id*                    string   e.g. "CL-OA-006"
  domainCode*            string   e.g. "CL"
  subdomainCode*         string   e.g. "OA"
  title*                 string
  tier*                  enum     REQUIRED | RECOMMENDED | OPTIONAL
  reviewCycle*           enum     ANNUAL | QUARTERLY | BIENNIAL | TRIENNIAL | AS_NEEDED
  ownerRole*             string   role name (never a person)
  accessTier*            int      1..4
  retentionFloorYears*   int      derived from domain rules; minimum age before T11 archive
  lifecycleState*        enum     ACTIVE | ARCHIVED          (NOTE: only two values)
  activeVersionId        → PolicyVersion   nullable iff lifecycleState=ARCHIVED
  description*           text
  archivedAt             datetime nullable; non-null iff ARCHIVED
  archiveJustificationId → ArchiveJustification  nullable
  createdAt*             datetime
  updatedAt*             datetime
```

**Notes**

- The `Policy` row carries only `ACTIVE` or `ARCHIVED`. There is no `Deprecated`. Stage progress lives on `PolicyVersion`.
- `activeVersionId` is the materialized pointer that satisfies INV-1 and is updated atomically inside the T8 transaction.

---

## 3. PolicyVersion (immutable snapshot)

```
PolicyVersion
  id*                    uuid
  policyId* → Policy
  versionNumber*         string    "X.Y" semantic
  state*                 enum      draft_open | in_review | pending_approval |
                                   approved_locked | active | superseded | archived
  reviewStage            enum      INTERNAL | COMPLIANCE | null  (only meaningful when state=in_review)
  isLocked*              bool      true once state ≥ approved_locked
  changeSummary*         text      ≥ 10 chars
  contentRef*            string    pointer to canonical content (markdown/html)
  contentHash*           string    SHA256 of canonical bytes
  effectiveDate          date      required at T6
  approvedDate           date      set on T6
  activatedAt            datetime  set on T8
  supersededAt           datetime  set when this version becomes superseded
  supersedes → PolicyVersion       prior version pointer
  supersededBy → PolicyVersion     successor pointer (set at T8 swap)
  revisionRound*         int       starts at 0; +1 on each T2 loop
  createdBy*             userId    used to enforce R8 (no self-approval)
  createdAt*             datetime
  updatedAt*             datetime
  templateVersion*       string    e.g. "EN-FM-004 v3"
  sections*              jsonb     section content blocks per template
  metadata               jsonb     editable metadata (effective date editable only while pending_approval)
```

**Constraints**

- Unique `(policyId, versionNumber)`.
- Partial unique index `(policyId) WHERE state='active'` enforces INV-1 at the database level.
- `effectiveDate >= approvedDate` checked at T6.
- `state='active'` requires `policy.activeVersionId = this.id` (materialized invariant).

---

## 4. PolicyLifecycleInstance (per-version lifecycle telemetry)

A small companion row capturing live timers and counters for the version. Rebuilt deterministically from events, but materialized for fast queries.

```
PolicyLifecycleInstance
  versionId* → PolicyVersion (1:1)
  internalReviewStartedAt    datetime
  internalReviewDueAt        datetime    +15 business days
  complianceReviewStartedAt  datetime
  complianceReviewDueAt      datetime    +10 business days
  pendingApprovalSince       datetime
  unresolvedRequiredCount    int
  approvalRequirementsMet    int
  approvalRequirementsTotal  int
  acknowledgmentReachPct     decimal(5,2)
  hashChainIntact            bool
  lastEventHash              string
```

This row is the cheap source for queue rendering and dashboard tiles.

---

## 5. ApprovalRequirement

Materialized when a version enters `pending_approval`.

```
ApprovalRequirement
  id*                  uuid
  versionId* → PolicyVersion
  role*                enum      GoverningBodyChair | ComplianceOfficer | Administrator |
                                 DepartmentDirector | Legal
  required*            bool      true means the requirement must be met for T6
  signatureId          → ecign.signatures   nullable until met
  signerUserId         userId    nullable until met
  meetingMinutesRef    string    e.g. "GV-FM-005#2026-Q2-minutes"
  met*                 bool      derived = (signatureId IS NOT NULL AND minutesRefValid)
  metAt                datetime
  rejectedReason       text      if a signer rejected with rationale
```

Unique `(versionId, role)`.

---

## 6. SignatureRequirement (form-level, distinct from approvals)

For acknowledgment forms and bespoke attestations attached to a version (not just approvals).

```
SignatureRequirement
  id*                       uuid
  versionId* → PolicyVersion
  audienceRole*             enum      RN | LVN | Admin | All | Custom
  formInstanceId            → ecign.form_instances
  attestationTextRef*       string    pointer to attestation text
  attestationTextHash*      string    SHA256 of attestation
  required*                 bool
  acknowledgmentDeadlineDays* int     default 14
```

---

## 7. ReviewComment

```
ReviewComment
  id*                 uuid
  versionId* → PolicyVersion
  reviewerUserId*     userId
  reviewerRole*       string
  reviewStage*        enum      INTERNAL | COMPLIANCE
  commentType*        enum      Required | Suggestion | General
  sectionId*          string    section anchor (template section)
  charRangeStart      int
  charRangeEnd        int
  body*               text
  suggestedRevision   text
  resolutionStatus*   enum      Open | Resolved | Dismissed
  resolutionRationale text     required when status=Dismissed
  resolvedByUserId    userId   set on resolution
  resolvedAt          datetime
  createdAt*          datetime
```

Required-comment count for INV / R4 = `count(state.versionId, type='Required', resolutionStatus='Open')`.

---

## 8. DistributionRecord

One row per channel per activation event.

```
DistributionRecord
  id*               uuid
  versionId* → PolicyVersion
  channel*          enum      Portal | GoogleDrive | SCORM | Print | Email
  target*           string    audience or location identifier
  dispatchedAt*     datetime
  status*           enum      success | partial | failed | deferred
  failureReason     text
  retryCount        int       default 0
  artifactRef       string    e.g. drive file id, SCORM upload id
  dispatchedBy*     userId
```

R14 references this table to determine whether T8 may proceed.

---

## 9. PolicyAssignment

Acknowledgment assignment generated automatically on T8 from the audience profile.

```
PolicyAssignment
  id*                  uuid
  policyId* → Policy
  versionId* → PolicyVersion
  assigneeUserId*      userId
  assigneeRole*        string
  assignedAt*          datetime    = activation time
  dueAt*               datetime    = activation + acknowledgmentDeadlineDays
  status*              enum        Assigned | Completed | Waived | Overdue
  waivedReason         text        required when Waived
  waivedByUserId       userId
  acknowledgmentRecordId → AcknowledgmentRecord  nullable
```

R5 background job flips `status` to `Overdue` at `dueAt + 0`.

---

## 10. AcknowledgmentRecord

```
AcknowledgmentRecord
  id*                 uuid
  assignmentId* → PolicyAssignment (1:1)
  signatureId* → ecign.signatures
  attestationTextHash* string
  acknowledgedAt*      datetime
  ipAddressHash        string    optional, for forensic correlation
  userAgentHash        string    optional
  signedSignatureHash* string
```

R17 enforces signer ↔ assignee equality at write time.

---

## 11. PolicyAuditEvent  (mirror of ecign.audit_events)

The lifecycle workspace writes to a thin local table that is kept in lockstep with `ecign.audit_events`. This table exists for fast UI rendering of the audit trail; the canonical record is in `ecign.audit_events`.

```
PolicyAuditEvent
  id*                 uuid
  policyId* → Policy
  versionId           → PolicyVersion   nullable for policy-level events
  eventType*          string            namespaced (`policy.lifecycle.activated` etc.)
  actorUserId*        userId
  actorRole*          string
  occurredAt*         datetime
  payload             jsonb
  prevHash            string
  hash*               string
  ecignAuditEventId* → ecign.audit_events   FK back to canonical sink
```

R13 hash-chain check operates over `(policyId, occurredAt asc)`.

---

## 12. ArchiveJustification

```
ArchiveJustification
  id*                  uuid
  policyId* → Policy
  legalAuthority*      text       e.g. "Replaced by federal rule …"
  archivedByUserIds*   userId[]   must include Compliance Officer + Administrator
  archivalSignatures*  signatureId[]   eCIgn signatures of archivers
  retentionFloorMet*   bool       gate from R15
  archiveJustifiedAt*  datetime
```

T10 / T11 require this row.

---

## 13. Cross-Reference & Lookup Tables

```
PolicyCrossReference
  fromVersionId* → PolicyVersion
  toPolicyId*    → Policy
  toVersionId    → PolicyVersion (optional; null = "current Active")
  referenceType  enum    SUPERSEDES | CITES | DEPENDS_ON | RELATED
```

`PolicyApproverEligibility` (derived view, not stored)
- A view computing, for each user, which `(policyId, role)` combinations they can sign for, given current COI status, role, and not-creator constraint.

---

## 14. Mapping to Existing Code

The current types in [src/policy/types/types.ts](../../../src/policy/types/types.ts) map as follows:

| Existing | Replaced by | Migration note |
|---|---|---|
| `LifecycleStatus` enum (7 values incl. Archived) | Split into `Policy.lifecycleState` (2 values) and `PolicyVersion.state` (7 values, none named "Deprecated") | Compatibility shim returns the legacy string from a derived computation |
| `Policy` interface | New `Policy` (logical) | `currentVersion`, `publishedVersion`, `isPublished` removed; replaced by `activeVersionId` lookup |
| `PolicyVersion` | New `PolicyVersion` | Adds `state`, `revisionRound`, `supersededBy`, `templateVersion`, `contentHash` |
| `DraftWorkspace` | Now derived from the active draft `PolicyVersion` row | `unsavedChanges`, `validationFlags` move to client-only state |
| `ReviewComment` | New `ReviewComment` | `reviewStage`, `sectionId`, `charRange*` added; never null |
| `ApprovalDecision` | Replaced by `ApprovalRequirement` rows | Decision logged via audit events |
| `PublishJob` | Replaced by `DistributionRecord` rows | Status semantics preserved |
| `PolicyAssignment` | Extended with `assigneeUserId`, `dueAt`, `acknowledgmentRecordId` | Background job flips Overdue |

A one-time migration script (Phase 1 of [09](09-Implementation-Roadmap.md)) seeds the new tables from existing in-memory data via the existing `frameworkSeedAdapter`.

---

## 15. Required Indexes

- `PolicyVersion (policyId, state)`
- Partial unique `PolicyVersion (policyId) WHERE state='active'`
- `PolicyVersion (policyId, versionNumber)`
- `ReviewComment (versionId, commentType, resolutionStatus)`
- `ApprovalRequirement (versionId, role)`
- `PolicyAssignment (assigneeUserId, status, dueAt)`
- `DistributionRecord (versionId, channel, dispatchedAt)`
- `PolicyAuditEvent (policyId, occurredAt)`

---

## 16. Field-Level Validation Summary

| Field | Rule |
|---|---|
| `Policy.tier` | Immutable after first activation |
| `PolicyVersion.versionNumber` | Format `\d+\.\d+`; minor increments on T2; major increments on T8 |
| `PolicyVersion.changeSummary` | ≥ 10 chars; required to leave `draft_open` |
| `PolicyVersion.effectiveDate` | ≥ `approvedDate`; ≥ `today` at T8 |
| `ReviewComment.body` | Non-empty |
| `ApprovalRequirement.signerUserId` | NOT EQUAL TO `version.createdBy` (R8) |
| `PolicyAssignment.dueAt` | = `assignedAt + acknowledgmentDeadlineDays` |
| `AcknowledgmentRecord.signatureId.signerUserId` | == `assignment.assigneeUserId` (R17) |
| `ArchiveJustification.archivedByUserIds` | must include both Compliance Officer + Administrator role-bearers |

The implementation order to bring this model to life is in [09-Implementation-Roadmap.md](09-Implementation-Roadmap.md).
