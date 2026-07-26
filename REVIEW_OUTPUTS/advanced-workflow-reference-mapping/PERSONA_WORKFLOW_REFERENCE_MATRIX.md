# Persona → Workflow Reference Matrix

Source: `apps/employee-journey/app/journey/_generated/personaWorkflowMap.generated.ts` and `workflowPersonaManifest.generated.json`. Generated from the owner-directed §15 persona/workflow matrix, hand-encoded in `scripts/generatePersonaWorkflowMap.ts` and validated against the 206-id `workflowCatalog.generated.ts`.

## Reference-type model
Each persona↔workflow link carries one `WorkflowReferenceType`:
- `core` — standard duty-relevant reference
- `conditional` — applies only under a stated condition (e.g., "authorized assessor only")
- `awareness` — reference-only, explicitly does **not** grant assessment/OASIS/scope authority (used heavily for LVN, PTA, COTA, MSW against clinical-assessment workflows)
- `leadership` — oversight/leadership-tier reference (DON and ADM)

When a workflow is reachable through more than one source (universal + persona + duty overlay), the strongest type wins in this order: `leadership > core > conditional > awareness`.

## Universal set (applies to every persona)
23 references shared by all personas, covering compliance (CO-WF-01/02/03/09), enterprise (EN-WF-03), HR (HR-WF-03/07/10/11/12/13/14/17), IT/Security (IT-WF-02/03/05/10/11/16), and risk management (RM-WF-04/08/09/10) — all typed `core`.

## Per-persona reference counts (from `workflowPersonaManifest.generated.json`)

| Persona | Reference count |
|---|---|
| RN | 36 |
| LVN | 28 |
| HHA | 19 |
| PT | 26 |
| PTA | 24 |
| OT | 26 |
| COTA | 24 |
| SLP | 26 |
| MSW | 25 |
| DON | 64 |
| ADM | 128 |
| GENERAL | 28 |

- `personaCount: 12`, `totalReferences: 494` (universal + persona + duty-overlay entries combined, pre-dedup), `unresolved: []` — **0 unresolved ids**. Every workflow id referenced by any persona resolves to a real entry in the 206-workflow catalog.
- No persona receives the full 206-workflow library as references — RN's 36 and ADM's 128 (the largest set, reflecting leadership-tier breadth) are both bounded subsets, confirmed by the automated check `getPersonaWorkflowReferences('RN').length < WORKFLOW_LIBRARY_COUNT`.

## Personas carrying explicit scope notes
The following personas have `awareness`- or `conditional`-typed references with an attached `scopeNote` disclaiming assessment/OASIS authority:
- **LVN** — awareness notes: "does not authorize the LVN to perform the initial comprehensive assessment or OASIS" (CL-WF-04/05/06/18).
- **PTA** — awareness notes: "does not imply assessment or OASIS authority" (CL-WF-02/03/04/05/06/18).
- **COTA** — same awareness-note pattern as PTA (CL-WF-02/03/04/05/06/18).
- **MSW** — awareness notes: "does not imply comprehensive-assessment or OASIS authority" (CL-WF-02/03/04/05/06).
- **PT / OT / SLP** — `conditional` note on CL-WF-05 (OASIS): "OASIS, authorized assessor only."

## Leadership tier
- **DON** (64 refs) includes 3 `leadership`-typed governance references (GV-WF-04/06/11) plus a broad `core` set across Clinical, Compliance, HR, QAPI, and Risk Management.
- **ADM** (128 refs) is almost entirely `leadership`-typed — full Compliance (22), Finance (15), most Governance, all HR (17), all IT/Security (20), all Operations (13), all QAPI (12), and all Risk Management (15) domains, plus 5 core clinical references. This is the largest persona set and is asserted (`ADM references include leadership-type references`) rather than assumed.

## GB / governance exclusion
- No `"GB"` key exists in `PERSONA_WORKFLOW_REFERENCES` — asserted directly by `verifyJourneyCorrections.ts`.
- `GV-WF-01`, `GV-WF-02`, `GV-WF-13`, `GV-WF-14` are excluded from every persona's reference list, including DON and ADM — asserted by the same script. DON/ADM only carry the specific governance-adjacent GV ids the owner-directed matrix allows (e.g., DON's GV-WF-04/06/11 as "Leadership reference").
