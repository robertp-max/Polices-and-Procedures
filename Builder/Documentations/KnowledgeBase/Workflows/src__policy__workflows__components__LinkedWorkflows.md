# Workflow Documentation: src__policy__workflows__components__LinkedWorkflows

## Trigger
- Trigger surfaces are inferred from source file: src/policy/workflows/components/LinkedWorkflows.tsx.
- Static indicators: Click actions are implemented. Route navigation actions are implemented.

## Steps
1. Workflow entry is initiated by route, event, or user action bound to this workflow surface.
2. Inputs are validated by the workflow/store/service logic linked to this file.
3. State transitions propagate through workflow graph, runtime, or execution panel surfaces.
4. Evidence and audit linkage are expected to persist transition context.

## Dependencies
- Imports: react-router-dom, @/policy/data/workflowGraph.generated, @/policy/data/workflows.generated, ../brand
- Hooks/stores: useNavigate

## Inputs
- Expected inputs include task, user action, route params, and workflow context payloads.
- ID trace inputs:
- policy_id trace: Observed 5 token reference(s) in source.
- workflow_id trace: GAP: No direct workflow_id/workflowId token in this file.
- event_id trace: GAP: No direct event_id/eventId token in this file.

## Outputs
- Workflow state transition outcome (UI/store/service update).
- Evidence and compliance trace payload expected in downstream systems.

## Linked forms
- Form linkage token detection: Detected form-related token(s).

## Linked tasks
- Task linkage token detection: GAP: No direct task linkage token in this file.

## Evidence generated
- Evidence token detection: GAP: No direct evidence token in this file.
- Lifecycle alignment check: GAP: Upload/Validate/Promote/Evidence lifecycle terms are not directly visible in this file; alignment must be validated in linked workflow sources.
