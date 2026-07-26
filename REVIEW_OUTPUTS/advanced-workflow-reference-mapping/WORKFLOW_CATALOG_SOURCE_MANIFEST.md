# Workflow Catalog — Source Manifest

Source: `apps/employee-journey/app/journey/_generated/workflowSourceManifest.generated.json` and `workflowCatalog.generated.ts`.

## Canonical source
- Canonical registry: `src/policy/data/workflows.generated.ts`
- SHA-256 of source at generation time: `e379a053ce474f3f3de072513731999d529bc64e85e6ab797d8652f6d73e1a1a`
- Generated artifact consumed by the journey app: `apps/employee-journey/app/journey/_generated/workflowCatalog.generated.ts`
- `workflowCount: 206`, `unresolvedCount: 0`

## Domain counts (10 domains, 206 total)

| Domain | Count |
|---|---|
| Clinical | 37 |
| Compliance | 30 |
| QAPI | 18 |
| Risk Management | 20 |
| Human Resources | 21 |
| IT / Security | 25 |
| Operations | 13 |
| Enterprise | 13 |
| Finance | 15 |
| Governance | 14 |
| **Total** | **206** |

## Drift gate
- `journey:workflows:verify` (`scripts/verifyWorkflowCatalog.ts`) checks the generated catalog against the source manifest/hash and reports 7/7 passing checks.
- `verifyJourneyCorrections.ts` independently re-asserts catalog integrity: exactly 206 workflows, all 10 domains present, and `CL-WF-26` ("Plan of Care Audit") present as a canonical workflow in the registry-backed catalog.

## CL-WF-26 note
`CL-WF-26` ("Plan of Care Audit") is canonical — it is a real entry in the 206-workflow catalog, not a training-only fixture. The training-side simulation that teaches it is a separately namespaced object, `TRAIN-CL-WF-26`, whose `teaches_workflow_id` points at canonical `CL-WF-26`; the simulation itself is presented as a prototype preview (see `WORKFLOW_REFERENCE_UI_QA.md`), not as the canonical workflow record.
