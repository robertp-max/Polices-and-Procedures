# AWS CES Security Rules

## Identity and Roles

Use Cognito User Pool groups mapped to application roles:

- `SuperAdmin`
- `Administrator`
- `DON`
- `ComplianceOfficer`
- `QAPICommittee`
- `Clinician`
- `Auditor`
- `ReadOnly`

JWT includes `sub`, `email`, group claims, and optional tenant/facility claims.

## Authorization Matrix

- **Clinician**
  - Can update assigned tasks to completion states.
  - Can upload evidence for assigned tasks.
  - Cannot certify events.
- **DON**
  - Can approve clinical/QAPI items.
  - Can certify assigned clinical/QAPI events.
- **ComplianceOfficer**
  - Can certify compliance events.
  - Full read access to audit endpoints.
- **Auditor**
  - Read-only across events/tasks/forms/evidence/audit.
- **ReadOnly**
  - Read-only without audit verification endpoints unless explicitly granted.
- **Administrator**
  - Broad management rights, no audit deletion.
- **SuperAdmin**
  - Can override certified lock only with explicit `overrideReason`.
  - Cannot delete audit records.

## Immutable and Append-Only Controls

- Audit records are append-only:
  - `PutItem` with conditional expressions on unique `SK`.
  - no `UpdateItem` permission for audit entity keys.
- Certification snapshot immutable:
  - allow write only when empty (`attribute_not_exists(certificationSnapshot)`).
- Evidence integrity fields immutable after create:
  - deny updates to `checksum`, `fileSize`, `mimeType`, `uploadedAt`.

## S3 Controls

- Evidence bucket settings:
  - Versioning enabled.
  - SSE-KMS encryption.
  - Block Public Access.
  - Object Ownership: Bucket owner enforced.
- Prefix protections:
  - `evidence/` delete deny except breakglass role.
  - `audit/` write-once strategy, future Object Lock compliance mode.
- Lifecycle:
  - `exports/` expiration by policy.
  - `raw/` temporary uploads expiration after validation window.

## Enforcement Invariants

Every mutation validates:

- event and entity ownership/binding (`task.eventId == eventId`, `evidence.taskId == taskId`)
- lock/certification rule with role-based override
- required-task cancellation reason
- certification readiness (tasks/forms/evidence/approvals)
- audit emission with hash-chain fields
