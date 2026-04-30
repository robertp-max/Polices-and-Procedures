# Audit Guide

## How to Retrieve Evidence
1. Open evidence and audit-focused pages (Evidence Center, Audit Mode, and workflow detail panels).
2. Filter by date, owner, policy domain, or workflow/event context.
3. Export or collect evidence records and supporting documents.

## How to Trace policy_id, workflow_id, event_id
- policy_id: identify governing policy requirement behind each action.
- workflow_id: identify workflow instance and transition chain.
- event_id: identify event schedule anchor and closure context.
- Cross-reference these three keys across page actions, API payloads, and evidence records to reconstruct full execution history.

## Where Logs Are Stored
- Application/server route handlers emit operational responses.
- Evidence and audit-related modules maintain trace records and integrity surfaces.
- GAP: environment-specific storage targets (exact table/bucket/log group names) require infrastructure deployment manifest confirmation.

## How Immutability Works
- Audit model expectation is append-only trace capture for compliance defensibility.
- Existing modules include hash/evidence/audit semantics in workflow and regulatory surfaces.
- Immutability review checks should confirm no destructive update path overwrites historical records.
