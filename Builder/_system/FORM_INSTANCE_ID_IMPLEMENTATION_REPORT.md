# Form Instance ID Layer — Implementation Report

**Date:** 2026-05-06  
**Phase:** Form Instance Identity (Critical Correction)  
**Status:** Complete

---

## Problem

`form_id` was being used as both the reusable template identifier and the record of a specific completed form. This meant:
- Clicking "Complete Form" multiple times created duplicate or timestamp-based instance IDs.
- Reopening the same requirement reloaded a different instance (non-idempotent).
- Evidence linked to `form_id` had no way to trace which specific completion it belonged to.
- Audit events lacked a stable, traceable `form_instance_id`.
- `QA-FM-021` (and others not in `FORMS_DATASET`) caused "Form Not Found" with no actionable feedback.

---

## Required Model (implemented)

```
Event → Task → Requirement → Form Template → Form Instance → Evidence → Audit Entry
```

---

## Files Changed

### `src/policy/compliance-execution/types.ts`
- Added `FormInstanceStatus` union type:
  `NOT_STARTED | IN_PROGRESS | COMPLETED | SIGNATURE_REQUESTED | SIGNED | LOCKED | SUPERSEDED`
- Extended `EventFormInstance` interface:
  - `id` — now uses stable `FI-{eventId}-{formId}-{padded_sequence}` format
  - `taskId?: string` — binds instance to the originating task
  - `requirementId?: string` — binds instance to the originating execution requirement
  - `status: FormInstanceStatus` — lifecycle state separate from form template
  - `sequence: number` — integer counter for this form+event combination
  - `updatedAt?: string` — timestamp of last status change

### `src/policy/stores/regulatoryExecutionStore.ts`
- Imported `FormInstanceStatus` type.
- Added `linkedFormInstanceId?: string` to `EvidenceDoc` interface and both upload input types.
- **Updated `generateFormInstance`:**
  - Now generates stable IDs: `FI-${eventId}-${formId}-${padded_seq}`
  - Counts existing (non-SUPERSEDED) instances for sequence numbering
  - Stores `status: 'IN_PROGRESS'` and `sequence` on new instances
  - Emits `FORM_INSTANCE_CREATED` audit action (was `form.generate_instance`)
- **Added `getOrCreateFormInstance` (idempotent):**
  - Looks up existing active (non-SUPERSEDED) instance for same `eventId + formId + (taskId) + (requirementId)`
  - Returns existing instance if found — **no duplicate created on repeated clicks**
  - Creates new instance only when none exists, using sequential `FI-` ID
  - Counts all instances (including SUPERSEDED) for sequence to support versioning
  - Emits `FORM_INSTANCE_CREATED` audit with full context
- **Added `setFormInstanceStatus`:**
  - Updates instance status in store
  - Emits appropriate audit action: `FORM_COMPLETED`, `FORM_LOCKED`, `FORM_SIGNED`, `FORM_SUPERSEDED`, or `FORM_STATUS_CHANGED`
  - Stores `updatedAt` timestamp

### `src/policy/components/regulatory/WorkflowExecutionPanel.tsx`
- Imported `FORMS_DATASET` from `@/policy/data/formsLibraryDataset`.
- **Added `resolveFormTemplate(formId)` utility:**
  - Checks `FORMS_DATASET.find(f => f.id === formId)`
  - Returns `{ found: true, name }` or `{ found: false, reason: "Form template X was referenced by this task but is not in the Forms Library." }`
- **Rewrote `InlineTaskActionPanel`:**
  - Added `formInstanceId` state (string | null).
  - On mount (`useEffect`), calls `store.getOrCreateFormInstance(...)` — idempotent, no duplicates.
  - Resolves form template via `resolveFormTemplate(formId)` before attempting to render `FormViewer`.
  - Updated context strip to show **7 binding IDs**:
    - `event:`, `task:`, `form template:`, `form instance:` (teal when set), `policy:`, `workflow:`, `req:`
  - **Missing template block:** amber warning UI when `formTemplateFound === false`, showing the specific message. Does not crash or show blank white panel.
  - **`FormViewer` only mounted when template is found.** If template is missing, shows instructional message.
  - **`markCompleteDisabled`** gate enforces all four conditions:
    1. Context is valid
    2. Form template was found in `FORMS_DATASET`
    3. `formInstanceId` exists (instance created)
    4. Not already marked complete
  - `markFormComplete` now calls `store.setFormInstanceStatus(eventId, formInstanceId, 'COMPLETED')` and emits `FORM_COMPLETED` audit event with `formInstanceId` in `after`.
  - Evidence upload (`SUPPORTING_EVIDENCE_UPLOAD`) now passes `linkedFormInstanceId: formInstanceId` to `store.uploadEvidence`.
  - "Open in new tab" for form type appends `&form_instance_id=...` to the route URL.

---

## Behavior Summary

| Scenario | Result |
|---|---|
| Click "Complete Form" (first time) | `getOrCreateFormInstance` creates `FI-EVT-...-QA-FM-021-001`, sets `IN_PROGRESS` |
| Click "Complete Form" (second time) | Same `FI-...-001` returned — no new instance |
| Reopen drawer for same requirement | Existing instance loaded from store — no duplicate |
| Mark as Complete clicked | Instance status → `COMPLETED`, audit `FORM_COMPLETED` with `form_instance_id` |
| Form template missing (e.g. QA-FM-021) | Amber warning block shown, `FormViewer` not mounted, Mark as Complete disabled |
| Evidence uploaded for form | `linkedFormInstanceId` stored in `EvidenceDoc` for chain-of-custody |
| Audit trail | All form events include `formInstanceId` in `after` payload |

---

## ID Format

```
FI-{eventId}-{formId}-{zero_padded_sequence}
```

Example:
```
FI-EVT-QA-QAPIQUARTERL-20260507-008-QA-FM-021-001
```

Superseded (new version after lock):
```
FI-EVT-QA-QAPIQUARTERL-20260507-008-QA-FM-021-002
```

---

## Form Template Resolution Order

1. `FORMS_DATASET.find(f => f.id === formId)` (canonical form library)
2. If not found → clear error: `"Form template {formId} was referenced by this task but is not in the Forms Library."`
3. `FormViewer` receives the `formId` and performs its own internal content build (`buildFormContent`) as a secondary check

---

## Checks Run

All 17 new assertions in `scripts/checkEvidencePhase235.ts` pass, covering:
- FormInstanceStatus type and EventFormInstance fields
- Stable FI- ID format
- getOrCreateFormInstance idempotency
- setFormInstanceStatus exists
- resolveFormTemplate with missing-template message
- Mark as Complete gated on template found + instance exists
- Missing template shows amber warning
- EvidenceDoc has linkedFormInstanceId
- FORM_INSTANCE_CREATED and FORM_COMPLETED audit events

All prior phase checks continue to pass:
- `npm run check:evidence-phase01` ✓
- `npm run check:evidence-phase15` ✓
- `npm run check:evidence-phase2` ✓
- `npm run check:evidence-phase21` ✓
- `npm run check:evidence-phase22` ✓
- `npm run check:evidence-phase23` ✓
- `npm run check:evidence-phase235` ✓ (17/17)

---

## Known Gaps

1. **QA-FM-021 not in FORMS_DATASET** — the form template is legitimately missing from the library. The UI now shows the correct error with instructions. To fix: add `QA-FM-021` to `formsLibraryDataset.ts` with its title and metadata.
2. **Required field validation** — "required fields not satisfied" gating is not yet implemented inside `FormViewer` (form fields do not have a `required` schema). This is a future phase item.
3. **Supersede flow** — creating version `002` on lock requires calling `setFormInstanceStatus(id, 'SUPERSEDED')` first, then `getOrCreateFormInstance` again. UI for this is not yet surfaced.
4. **Evidence viewer in Evidence Center** — `linkedFormInstanceId` is stored on `EvidenceDoc` but is not yet displayed in the Evidence Center detail panel.

---

## Recommended Next Phase

**Phase 2.4** — Form template registry gap resolution:
- Identify all `form_id` values referenced by regulatory events that are not in `FORMS_DATASET`
- Add their metadata entries to `formsLibraryDataset.ts`
- Verify `buildFormContent` can generate a renderable body for each
- Confirm `FormViewer` renders actual form fields (not "Form Not Found") for all event-referenced forms
