# AWS CES Architecture

## Objectives

- Preserve the current frontend model and behavior:
  - `RegulatoryEvent` remains canonical parent/source.
  - `EventInstance` remains occurrence-level execution object.
  - `regulatoryExecutionStore` remains current operational model (demo/local mode).
  - CES remains projection/read-only over event dataflow.
- Add production persistence and enforcement on AWS without introducing a competing source of truth.

## AWS Services

- **Identity**: Amazon Cognito User Pool + App Client.
- **API**: API Gateway HTTP API.
- **Compute**: AWS Lambda (Node.js, TypeScript build output).
- **Data**: DynamoDB (single-table primary + optional sparse GSIs).
- **Binary Evidence + Snapshots + Audit Anchors**: S3 with versioning and protected evidence/audit prefixes.
- **Observability**: CloudWatch Logs/Metrics/Alarms.
- **Scheduling (optional)**: EventBridge Scheduler for mandated recurring instance generation.

## High-Level Flow

1. Frontend calls `complianceExecutionApi` in `awsRemote` mode.
2. API Gateway authenticates JWT from Cognito and forwards identity claims to Lambda.
3. Lambda enforces mutation rules and writes:
   - execution entity record(s) (DynamoDB),
   - append-only audit record (DynamoDB),
   - evidence metadata (DynamoDB) and pre-signed S3 upload/download.
4. For certification:
   - Lambda validates required task/form/evidence/approval rules,
   - creates immutable certification snapshot (DynamoDB + optional S3 copy),
   - locks `EventInstance`.
5. Frontend consumes identical Event Dataflow shape as today (adapter mapping only).

## Runtime Modes

- `demoLocal`: existing Zustand `regulatoryExecutionStore`.
- `awsRemote`: API-backed persistence; local state acts as cache/fallback only.
- Mode selection is adapter-driven; UI and selectors stay unchanged.

## Deployment Boundaries

- No EC2, no always-on servers.
- No separate backend “event model”; backend stores the same event/task/form/evidence/audit shape used by frontend.

## Reliability and Security Notes

- Evidence bucket versioning enabled.
- Evidence prefix delete-protected (bucket policy + IAM deny on delete for non-breakglass role).
- Audit append-only writes enforced by conditional expressions and IAM policy constraints.
- Hash chain maintained per `eventId`; optional daily anchor hash emitted to S3 audit prefix.
