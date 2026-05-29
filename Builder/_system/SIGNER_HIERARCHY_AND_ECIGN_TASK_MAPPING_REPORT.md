# Signer Hierarchy and eCIgn Task Mapping Report

## Files inspected
- `src/policy/workflows/swimlanes/buildSwimlaneFromEvent.ts`
- `src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts`
- `src/policy/workflows/swimlanes/buildFallbackSwimlane.ts`
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx`
- `src/policy/workflows/swimlanes/types.ts`
- `src/policy/workflows/swimlanes/swimlaneRegistry.ts`
- `src/policy/compliance-execution/eventTaskAdapter.ts`
- `src/policy/compliance-execution/useEventExecutionDataflow.ts`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/evidence/cesEvidenceHierarchy.ts`
- `src/policy/ces/signerTaskFactory.ts`
- `src/policy/components/FormViewer.tsx`
- `src/policy/components/FormSigningWorkspace.tsx`
- `src/policy/ecign/useEcignSession.ts`
- `src/policy/ecign/useEcignInstance.ts`
- `src/policy/data/formsLibraryDataset.ts`
- `src/policy/data/formsLibraryContent.ts`
- `src/policy/data/regulatoryEvents.ts`
- `src/policy/data/workflows.generated.ts`

## Files changed
- `src/policy/ecign/types.ts`
- `src/policy/ecign/signerHierarchy.ts`
- `src/policy/ecign/signatureTaskBuilder.ts`
- `src/policy/ecign/signaturePathResolver.ts`
- `src/policy/workflows/swimlanes/types.ts`
- `src/policy/workflows/swimlanes/buildSwimlaneFromEvent.ts`
- `src/policy/workflows/swimlanes/buildSwimlaneFromWorkflow.ts`
- `src/policy/workflows/swimlanes/SwimlaneExecutionMap.tsx`
- `src/policy/stores/regulatoryExecutionStore.ts`
- `src/policy/ces/signerTaskFactory.ts`
- `package.json`
- `Builder/_system/audit-signer-hierarchy-and-ecign-task-mapping.ts`

## Signer hierarchy config created/updated
- Added canonical eCIgn signing types in `src/policy/ecign/types.ts`.
- Added domain and role normalization rules in `src/policy/ecign/signerHierarchy.ts`.
- Added deterministic signature requirement and signer-task ID builders in `src/policy/ecign/signatureTaskBuilder.ts`.
- Added canonical signature-path resolver in `src/policy/ecign/signaturePathResolver.ts`.

## Domain hierarchy mapping
- Governance: owner `Administrator`, reviewer `Administrator`, signer `Governing Body Chair`, final approver `Governing Body`.
- Clinical: owner `Assigned Owner`, reviewer `Clinical Manager`, signer `Clinical Manager` and `Director of Nursing`, final approver `Administrator`.
- QAPI: owner `QAPI Lead / Chair`, reviewers `Clinical Manager`, `Compliance Officer`, `Infection Preventionist`, `Data Analyst / Quality Source`, signer `QAPI Lead / Chair`, final approver `Governing Body` when required.
- Compliance: owner `Compliance Officer`, reviewer `Administrator`, signer `Compliance Officer`, final approver `Administrator` or `Governing Body`.
- HR: owner `HR`, reviewer `Administrator` or `Supervisor`, signer `Employee`, `Supervisor`, `HR`, or `Administrator`, final approver `Administrator`.
- Finance: owner `Finance`, reviewer `Finance / CFO`, signer `Finance / CFO` or `Administrator`, final approver `Governing Body`.
- Operations: owner `Operations`, reviewer `Administrator` or `Operations Director`, signer `Operations Director` or `Administrator`, final approver `Administrator`.
- IT / Security: owner `IT / Security`, reviewer `IT Director / CISO` or `Compliance Officer`, signer `IT / Security` or `Compliance Officer`, final approver `Administrator` or `Governing Body`.
- Risk: owner `Risk Manager`, reviewer `Compliance Officer` or `Administrator`, signer `Risk Manager` or `Administrator`, final approver `Governing Body`.
- Evidence / eCIgn System stays non-human and is used only for final package/lock orchestration.

## QAPI role hierarchy mapping
- The QAPI resolver now prioritizes:
  1. `QAPI Lead / Chair`
  2. `Data Analyst / Quality Source`
  3. `Clinical Manager`
  4. `Compliance Officer`
  5. `Infection Preventionist`
  6. `Committee / Voting Members`
  7. `Scribe`
  8. `Governing Body`
  9. `Evidence / eCIgn System`
- QAPI reviewer inference is keyword-driven from task title, description, and form context so dashboards, clinical trends, infection findings, complaints, committee actions, and minutes map to the correct reviewer path.

## formInstanceId resolution rule
- Event swimlane form instances are resolved during swimlane generation, not from modal clicks.
- Event mode form actions remain:
  - `Open Form Instance`
  - `Form Instance Missing — Sync Required`
- Template mode form actions remain:
  - `Open Form Template`
- Missing event-execution instances are treated as generation defects and surfaced as honest diagnostics.

## Signer task ID rule
- Deterministic signer task format:
  - `SIGN-{eventId}-{workflowId}-{parentTaskId}-{formId}-{signatureSlot}-{signerRoleSlug}`
- Deterministic signature requirement format:
  - `SIGREQ-{eventId}-{workflowId}-{parentTaskId}-{formId}-{signatureSlot}-{signerRoleSlug}`
- Signer tasks are now built from canonical signature requirements and no longer minted from form-status side effects.

## Support-documentation task rule
- Supporting documentation remains separate from signature tasks.
- Signature-only and attestation-style forms do not generate extra support-document tasks when the signed form artifact satisfies evidence.
- Tasks that mark `requiredAdditionalDocumentation` must carry support-document rows.

## eCIgn task generation result
- Generated event/workflow swimlane nodes now carry:
  - deterministic `signatureRequirements`
  - deterministic `signatureTasks`
  - reviewer roles
  - final approver roles
  - governing-body requirement flag
  - artifact blocked reasons
- Swimlane signature workspace now renders a real signature-path view instead of a placeholder.
- The store no longer fabricates signer-task overrides when a form instance is marked signed or locked.

## Routes tested
- `/events/oig_sam_exclusion_check-20260505-01/swimlane?workflowId=CO-WF-15`
- `/events/qapi_meeting-20260507-08/swimlane`
- `/events/cost_report_filing-20260531-01/swimlane`
- `/workflows/CL-WF-26/swimlane?eventId=plan_of_care_audit-20260507-01&taskId=CL-WF-26-STEP-01`
- `/events/bbp_training-20260527-01/swimlane`
- `/events/unresolved-demo-20260531-99/swimlane?workflowId=UNKNOWN-WF-99`

## Validator results
- `npm run validate:signer-hierarchy-ecign` passed.
- Validator confirmed:
  - deterministic swimlane task IDs
  - event-mode form instance binding
  - signer-task presence for signature-required nodes
  - no duplicate signer task IDs
  - signer-task parent/event/signer identity fields
  - signature-only forms do not create unnecessary support-doc rows
  - support-doc-required forms retain support-doc rows
  - incomplete signer/support requirements keep parent nodes from complete/locked states
  - instructions exist for every node
  - no `Open / Create Form Instance` string remains in the swimlane workspace
  - `QA-WF-03` diff stayed empty

## Build result
- `npm run build` passed.

## Additional checks
- `npm run verify:task-identity` passed.
- `npm run validate:event-dataflow` passed.
- `npm run check:ecign-routes` passed.

## QA-WF-03 diff result
- `git diff -- src/policy/workflows/components/QAWorkflow03SwimlanePage.tsx` returned empty output.

## Remaining limitations
- Full click-driven browser verification for the requested routes was not executed in this run because no interactive browser automation session was available in the current toolset.
- The validator covers route/model generation and workspace integrity, but it does not yet simulate actual end-user clicks through every task node.
- Existing unrelated dirty-worktree files were preserved and not reverted.
