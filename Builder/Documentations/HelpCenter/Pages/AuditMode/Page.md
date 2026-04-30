# Page: Audit Mode

**Route:** `/audit`  
**File:** `src/policy/pages/AuditModePage.tsx`  
**Access:** All authenticated users (read-only enforced for all)

---

## Page Purpose

Audit Mode provides a read-only, surveyors-eye view of the agency's compliance state. It displays every event's current audit status, evidence, and certification record. No data can be created or modified while in Audit Mode.

---

## UI Layout

| Region | Description |
|---|---|
| Audit Mode Banner | Persistent red/orange banner indicating Audit Mode is active |
| Event Status Grid | All events grouped by domain with their `AuditState` classification |
| Risk Score Panel | Organization-wide risk score (0–100) with driver breakdown |
| Filter Bar | Filter by domain, state, or risk level |
| Event Row Expand | Click to expand an event and see its evidence, steps, and approval history |
| Export Button | Generate CSV or JSON audit report for surveyor submission |

---

## Key Actions

- View compliance state for every tracked event (read-only)
- Filter events by domain, audit state, or risk level
- Expand an event to see all evidence, steps, and approval records
- Export the full audit report as CSV or JSON

---

## Audit States (9-State System)

| State | Description |
|---|---|
| `audit_ready` | All requirements met, within SLA |
| `sla_warning` | Requirements met but approaching deadline |
| `sla_urgent` | Very close to deadline |
| `overdue` | Past deadline, not yet certified |
| `in_progress` | Work has begun but not complete |
| `scheduled` | Upcoming, no work started |
| `blocked` | Unresolved dependency |
| `certified_locked` | Certified and immutably locked |
| `grace_period` | Past deadline but within grace window |

---

## Data Used

| Data | Source |
|---|---|
| Event audit states | `auditState.ts` FSM (computed from execution state) |
| Risk scores | `riskScoring.ts` computeRiskScore() |
| Evidence | `regulatoryExecutionStore` |
| Lock state | `enforcementStore` |

---

## Permissions

- All authenticated users can enter Audit Mode
- All mutations are blocked regardless of role while Audit Mode is active
- Toggling Audit Mode on/off requires `admin`, `super_admin`, or `auditor` role

---

## Audit Impact

- Toggling Audit Mode ON is logged: `AUDIT_MODE_ENABLED`
- Toggling Audit Mode OFF is logged: `AUDIT_MODE_DISABLED`
- Exporting the audit report is logged: `AUDIT_EXPORT`
