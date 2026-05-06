# AWS CES API Contract

## Event Instances

- `GET /events`
  - Query: `from`, `to`, `status`, `policyId`, `workflowId`
  - Returns event instance summaries.
- `GET /events/{eventId}`
  - Returns full event package compatible with `useEventExecutionDataflow`.
- `POST /events/ensure-instance`
  - Body: `{ sourceEventId }`
  - Idempotently ensures stable event instance.
- `POST /events/manual`
  - Body: `{ sourceEventId, scheduledDate, generatedFrom, createdBy }`
- `PATCH /events/{eventId}`
  - Body: partial patch (restricted fields).
- `POST /events/{eventId}/cancel`
  - Body: `{ reason }`
- `POST /events/{eventId}/certify`
  - Body: `{ reason?, overrideReason?, certificationId? }`
  - Enforces completeness + writes immutable snapshot.

## Tasks

- `GET /events/{eventId}/tasks`
- `POST /events/{eventId}/tasks`
  - Body matches `EventTask` input contract (including `taskSourceId`, `isRequired`).
- `PATCH /events/{eventId}/tasks/{taskId}`
- `POST /events/{eventId}/tasks/{taskId}/cancel`
  - Body: `{ reason }`
- `POST /events/{eventId}/tasks/{taskId}/restore`
  - Body: `{ reason? }`

## Forms

- `GET /events/{eventId}/forms`
- `POST /events/{eventId}/forms/{formId}/generate`
- `PATCH /events/{eventId}/forms/{formInstanceId}`

## Evidence

- `POST /events/{eventId}/tasks/{taskId}/evidence/init-upload`
  - Body: `{ filename, mimeType, fileSize, checksum, policyIds?, workflowId?, formIds? }`
  - Returns pre-signed upload URL + `evidenceId`.
- `POST /events/{eventId}/tasks/{taskId}/evidence/{evidenceId}/complete-upload`
  - Verifies object exists, finalizes metadata.
- `GET /events/{eventId}/tasks/{taskId}/evidence`
- `GET /evidence/{evidenceId}/download`
  - Returns pre-signed download URL.

## Audit

- `GET /events/{eventId}/audit`
- `GET /audit/recent`
- `GET /audit/hash-chain/verify`

Audit records returned by these endpoints include:

- `entityType`, `entityId`, `action`
- `actorId`, `actorRole`, `timestamp`
- `before`, `after`, `reason`
- `recordVersion`, `prevHash`, `currentHash`

## Indexes

- `GET /policies/{policyId}/events`
- `GET /workflows/{workflowId}/events`
- `GET /events?from=&to=&status=`
- `GET /events/incomplete`

## Mutation Enforcement (Lambda)

All mutating endpoints enforce:

- event exists
- event not certified/locked unless admin override with reason
- task belongs to event
- evidence belongs to task
- required tasks cannot cancel/delete without reason
- certification blocked unless required tasks/forms/evidence/approvals pass
- immutable certification snapshot created at certification
- append-only audit write for every mutation
