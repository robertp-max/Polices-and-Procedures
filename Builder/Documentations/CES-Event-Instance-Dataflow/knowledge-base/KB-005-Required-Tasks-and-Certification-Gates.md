# KB-005 — Required tasks and certification gates

## Summary

**Required tasks** (`isRequired: true` with `requirementSource`) enforce compliance behavior: they cannot be silently discarded; sensitive transitions require **reasons**; **certification** is blocked until required work, forms, evidence, and approvals are satisfied (per store + evaluator rules).

## Required task semantics

| Field | Meaning |
|-------|---------|
| `isRequired` | Task counts toward mandatory completion set. |
| `requirementSource` | Why it is required: `policy`, `workflow`, `regulation`, or `system`. |

**Soft delete** hides a task but preserves auditability; **hard delete** of required tasks is not the default path. Cancellation of required work should carry a **reason** so auditors understand exceptions.

## Completion blocking (dataflow layer)

When building `EventExecutionDataflow`, each task may get a **`completionBlockedReason`**:

- Task explicitly **blocked** with `blockedReason`
- **Required forms** linked via `formIds` not complete / no generated instance where required
- **Required evidence** missing for certain task `source` types (e.g. approval/generated rules in rollup logic)

These messages surface in the **Tasks** tab so operators know *why* Complete is not available.

## Certification gates

Certification flows (e.g. `certifyEventInstance`, `certifyEventComplete`) validate that:

- Required tasks are **complete** (or properly handled per policy)
- Required **forms** and **approvals** are satisfied
- **Snapshot** is written and instance **locked**

If certification is blocked, the UI/store should return a clear message (for example referencing incomplete required tasks).

## Admin override

Some code paths accept **`adminOverride`** with **`reason`** to allow controlled changes on locked/certified instances. This is a **governance** feature: your organization defines who may use it and how reasons are reviewed.

## See also

- [KB-007](./KB-007-Forms-and-Form-Instances.md)
- [KB-008](./KB-008-Audit-Trail-and-Hash-Chain.md)
