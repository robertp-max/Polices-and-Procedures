# Duty Overlay Matrix

Source: `apps/employee-journey/app/journey/_generated/personaWorkflowMap.generated.ts` (`DutyFlag`, `DUTY_OVERLAYS`).

Duty overlays are additive: a persona's base reference set (universal + persona) is merged with any duty-flag overlays assigned to that individual, via `getPersonaWorkflowReferences(roleCode, duties)`. All duty-overlay references are typed `conditional`.

## Duty flag → workflow id(s)

| Duty flag | Workflow id(s) |
|---|---|
| `DRIVER` | OP-WF-09 |
| `INTAKE` | CL-WF-01, OP-WF-07, OP-WF-08, OP-WF-11 |
| `SCHEDULING` | OP-WF-12 |
| `ON_CALL` | OP-WF-13 |
| `OASIS_ASSESSOR` | CL-WF-05 |
| `HHA_SUPERVISOR` | CL-WF-10 |
| `QAPI_MEMBER` | QA-WF-02, QA-WF-03, QA-WF-04, QA-WF-10 |
| `COMPLIANCE` | CO-WF-15 |
| `HR` | HR-WF-08 |
| `FINANCE` | FN-WF-01 |
| `IT_SECURITY` | IT-WF-16 |

## Merge / de-dup rule
`getPersonaWorkflowReferences()` combines `UNIVERSAL_WORKFLOW_REFERENCES + PERSONA_WORKFLOW_REFERENCES[persona] + duties.flatMap(DUTY_OVERLAYS)`, then de-dupes by workflow id, keeping the strongest `referenceType` seen across all three sources (`leadership > core > conditional > awareness`). Example: if a persona already has CL-WF-05 as `core` and also carries the `OASIS_ASSESSOR` duty flag (which contributes it as `conditional`), the stronger `core` typing wins.

Result set is sorted by workflow id ascending. This function never returns `GV-WF-01`, `GV-WF-02`, `GV-WF-13`, or `GV-WF-14` — those ids are absent from every source list (universal, persona, and duty overlays alike), so no combination of duties can surface them.
