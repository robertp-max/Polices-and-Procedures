# AWS CES Data Model

## Table Strategy

Use one primary DynamoDB table: `CesExecution`.

- **PK**: `PK` (string)
- **SK**: `SK` (string)
- **Entity discriminator**: `entityType`
- **Recommended GSIs**:
  - `GSI1PK` / `GSI1SK` for policy/workflow/date/status lookups.
  - `GSI2PK` / `GSI2SK` for audit recency and cross-event indexing.

Single-table keeps writes transactional and read-model assembly fast while staying readable through clear key prefixes.

## Entity Key Patterns

- **EventInstance**
  - `PK = EVENT#{eventId}`
  - `SK = META`
- **EventTask**
  - `PK = EVENT#{eventId}`
  - `SK = TASK#{taskId}`
- **EventFormInstance**
  - `PK = EVENT#{eventId}`
  - `SK = FORM#{formInstanceId}`
- **EvidenceMetadata**
  - `PK = EVENT#{eventId}`
  - `SK = EVIDENCE#{evidenceId}`
- **EventExecutionAudit**
  - `PK = EVENT#{eventId}`
  - `SK = AUDIT#{timestamp}#{auditId}`
- **Cross Event Index Row (optional materialized helper)**
  - `PK = INDEX#POLICY#{policyId}` or `INDEX#WORKFLOW#{workflowId}`
  - `SK = EVENT#{eventId}#{scheduledDate}`

## Common Record Fields (All Applicable Entities)

All records carry the following where applicable:

- `eventId`
- `sourceEventId`
- `taskId`
- `policyIds`
- `workflowId`
- `formIds`
- `status`
- `folderPath`
- `createdAt`
- `updatedAt`
- `createdBy`
- `recordVersion`

## EventInstance Item

- `entityType = eventInstance`
- `eventId`, `sourceEventId`, `scheduledDate`, `generatedFrom`, `status`, `lockState`
- `certificationState`
- `certificationSnapshot` (immutable once set)
- `folderPath`
- `recordVersion`

## EventTask Item

- `entityType = task`
- `taskId`, `taskSourceId`, `taskSourceType`
- `isRequired`, `requirementSource`
- `status`, `blockedReason`, `completionBlockedReason`
- `policyIds`, `workflowId`, `formIds`, `evidenceIds`
- `folderPath`
- `recordVersion`

## EventFormInstance Item

- `entityType = formInstance`
- `formInstanceId`, `formId`, `eventId`
- `policyIds`, `workflowId`, `status`
- `folderPath`
- `recordVersion`

## EvidenceMetadata Item

- `entityType = evidence`
- `evidenceId`, `eventId`, `taskId`
- `policyIds`, `workflowId`, `formIds`
- `objectPath`, `folderPath`, `status`
- `checksum`, `fileSize`, `mimeType`, `uploadedAt`
- `recordVersion`

## EventExecutionAudit Item

- `entityType = audit`
- `auditId`, `eventId`, `entityTypeRef`, `entityId`
- `action`, `actorId`, `actorRole`, `reason`
- `before`, `after`
- `recordVersion`
- `prevHash`, `currentHash`
- `timestamp`

## S3 Mapping

Evidence metadata record references:

- `objectPath = evidence/{policy_id}/{workflow_id}/{event_id}/{evidence_id}/{filename}`

Fallback tokens:

- `policy_id = UNASSIGNED-POLICY`
- `workflow_id = UNASSIGNED-WORKFLOW`
