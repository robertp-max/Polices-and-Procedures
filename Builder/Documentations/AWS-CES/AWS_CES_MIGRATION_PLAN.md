# AWS CES Migration Plan

## Principles

- Keep frontend data model unchanged.
- Keep CES as projection/read-only layer.
- No duplicate source of truth: AWS becomes persistence target; local store remains fallback mode.

## Phases

1. **Contract Freeze**
   - Lock current `EventInstance`, `EventTask`, `EventFormInstance`, `Evidence`, `Audit` shapes.
   - Confirm `useEventExecutionDataflow` remains UI contract.
2. **Backend Bootstrap**
   - Deploy Cognito, API Gateway, Lambda, DynamoDB, S3.
   - Implement endpoints in `AWS_CES_API_CONTRACT.md`.
3. **Adapter Introduction**
   - Add `src/policy/services/complianceExecutionApi.ts` with:
     - `demoLocal` mode delegating to existing store flows.
     - `awsRemote` mode calling API and mapping back to existing types.
4. **Dual-Mode Verification**
   - Run `validate:event-dataflow` and `validate:aws-ces-mapping`.
   - Compare dataflow outputs from both modes for representative events.
5. **Controlled Rollout**
   - Feature flag `CES_EXECUTION_MODE=demoLocal|awsRemote`.
   - Enable `awsRemote` in staging first, then production.
6. **Cutover**
   - Set `awsRemote` as default.
   - Keep `demoLocal` as explicit fallback path.

## Data Migration Notes

- Existing local/demo persisted snapshots are optional seed sources.
- If importing historical local data:
  - preserve `eventId`, `taskId`, `taskSourceId`, `recordVersion`, audit chronology.
  - compute/retain audit hash chain per event.

## Risk Controls

- No changes to drawer, CES board, dashboard, workflows, forms, print surfaces.
- Strictly map backend DTOs to existing frontend types.
- Block deployment if validation script reports missing required mapping keys.

## Exit Criteria

- All required APIs deployed and authorization enforced.
- Evidence remains event/task bound with integrity fields.
- Certification remains lock + immutable snapshot.
- Audit remains append-only and hash-chain-ready.
- Frontend toggles modes without UI rewrites.
