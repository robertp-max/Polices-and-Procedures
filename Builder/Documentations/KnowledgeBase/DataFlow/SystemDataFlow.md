# System Data Flow

## End-to-End Path
User -> API -> Lambda -> DynamoDB -> S3 -> Audit

## Flow Detail
1. User initiates action from UI page/component.
2. API route receives request and performs validation/auth checks.
3. Lambda-style compute/service logic applies business rules and orchestration.
4. DynamoDB-style persistence stores operational state and metadata.
5. S3-style object storage stores evidence artifacts and exported documents.
6. Audit layer records append-only trace events for reconstruction and review.

## Traceability Keys
- policy_id: links action to governing policy/control requirement.
- workflow_id: links action to workflow instance/state path.
- event_id: links action to schedule/event context.

## Architectural Alignment Notes
- Route inventory confirms API layer presence in server routes.
- Workflow and evidence tokens are present in policy workflow and regulatory modules.
- GAP: exact cloud runtime wiring (Lambda, DynamoDB table names, S3 bucket names) requires direct infrastructure manifest cross-reference for full environment-specific mapping.
