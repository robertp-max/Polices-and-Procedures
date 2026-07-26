# Advanced Training — Audience Matrix

Source: `apps/employee-journey/app/journey/_data/advancedTraining.ts` (`ADVANCED_TRAINING_PERSONAS`, `isAdvancedTrainingRole`, `getAdvancedTraining`).

The "Advanced Training" label is a **strict UI projection**: it does not change any module's canonical role assignment. It is visible for exactly 4 roles, showing exactly the same 4 modules, in both the onboarding context (`/journey/training/advanced`) and the annual context (`/journey/training/annual`).

## Visibility by JourneyRole

| JourneyRole | Advanced Training visible? | Where OASIS-E2/SOC and Documentation Matters content lives instead |
|---|---|---|
| RN | **Yes** — 4 modules | (also visible under Advanced; no separate placement needed) |
| DON | **Yes** — 4 modules | (also visible under Advanced; no separate placement needed) |
| PT | **Yes** — 4 modules | (also visible under Advanced; no separate placement needed) |
| ADM | **Yes** — 4 modules (leadership framing) | (also visible under Advanced; no separate placement needed) |
| LVN | No | Role-Specific / Annual assignment (canonical module role list), not under the Advanced label |
| HHA | No | Role-Specific / Annual assignment |
| PTA | No | Role-Specific / Annual assignment |
| OT | No | Role-Specific / Annual assignment (OASIS activity remains limited to authorized assessors) |
| COTA | No | Role-Specific / Annual assignment |
| SLP | No | Role-Specific / Annual assignment (OASIS activity remains limited to authorized assessors) |
| MSW | No | Role-Specific / Annual assignment |
| GENERAL / office roles | No | Not applicable — these modules are not assigned to General roles |
| GB (Governing Body) | No persona | There is no GB JourneyRole in the Advanced Training model at all |

## Mechanics confirmed from source
- `ADVANCED_TRAINING_PERSONAS = ["PT", "RN", "DON", "ADM"]` — exact set, no more, no fewer.
- `isAdvancedTrainingRole(roleCode)` returns `true` only when the resolved role is in that set; every other role (including LVN, HHA, PTA, OT, COTA, SLP, MSW, GENERAL, and any GB/office code) gets `{ visible: false, modules: [] }` from `getAdvancedTraining()`.
- The four modules and their canonical assignments elsewhere (Role-Specific/Annual for OT/SLP OASIS content and for Documentation Matters across other roles) are untouched — only the "Advanced" label/collection is exclusive to PT/RN/DON/ADM.
- This 4-role / 4-module exclusivity is asserted by an automated check (`verifyJourneyCorrections.ts`, "Advanced Training strict projection §3/§4"): visible with exactly 4 ordered modules for PT/RN/DON/ADM, and hidden (0 modules) for LVN/HHA/PTA/OT/COTA/SLP/MSW/GAO.
