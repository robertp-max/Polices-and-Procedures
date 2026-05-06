# KB-004 — Task derivation and stable identity

## Summary

Default **EventTask** rows are **derived** from the RegulatoryEvent definition. The store may **override** or **add** tasks. Merging uses **`taskSourceId`** first so re-derivation does not duplicate logical work.

## Derivation sources (`eventTaskAdapter.ts`)

| Source | `taskSourceType` | Typical `taskSourceId` | Notes |
|--------|------------------|------------------------|-------|
| Process flow step | `processFlow` | `processFlow:{stepId}` | Carries `formIds` from `step.requiredFormIds`. |
| Required form (standalone) | `requiredForm` | `form:{formId}` | Only if not already covered by a step’s required forms. |
| Minutes | `minutes` | `minutes:{eventId}` | `source` is `generated` in adapter; type is `minutes`. |
| Approval rule | `approval` | `approval:{id or targetKind:targetLabel}` | `isRequired` follows `approval.required`. |

Default derived tasks are **`isRequired: true`** with `requirementSource` set from policy/workflow/regulation context.

## Task id stability

Task **database id** uses a deterministic pattern based on `eventId` + normalized `taskSourceId` (see `stableTaskId` / `buildDeterministicTaskId` in code). This keeps ids stable across refreshes and re-runs of derivation.

## Merge rules (`buildEventExecutionDataflow`)

1. Start from **derived** tasks keyed by `taskSourceId`.
2. Apply **overrides** from `taskOverridesByEventId[eventId]`:
   - If override has same `taskSourceId`, **merge** fields (override wins on conflicts).
   - Else match by `taskId` or add new entries.

## User-visible impact

- Operators may see tasks that **disappear** from default lists when **soft-deleted** — they are not “gone” from compliance history; they can be **restored**.
- **Generate from form/step** creates or ensures tasks so evidence and forms have a clear anchor.

## See also

- [KB-005](./KB-005-Required-Tasks-and-Certification-Gates.md)
- [KB-011](./KB-011-State-Machine-and-Auto-Progression.md)
