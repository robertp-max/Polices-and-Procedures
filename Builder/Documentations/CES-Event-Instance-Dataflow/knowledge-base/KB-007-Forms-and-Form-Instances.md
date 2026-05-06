# KB-007 — Forms and form instances

## Summary

**Required forms** come from the RegulatoryEvent definition. The **Required Forms** tab lists them with logical file paths under the instance folder. **Generated form instances** are first-class records (`EventFormInstance`) tied to `eventId`, `formId`, policies, optional workflow, and `folderPath`.

## Required forms (definition)

Each required form entry includes:

- A stable **form id** (`formId` or `id`)
- **Label** and optional **due offset**
- A **status** in seed data that the store may override via `setFormStatus` / effective status helpers

## Form instances (runtime)

`generateFormInstance(eventId, formId, policyIds, workflowId?)` creates a row in `generatedFormInstancesByEventId[eventId]` with:

- Unique `id` for the instance artifact
- `folderPath` under `forms/completed` pattern (via folder helpers / store logic)

## How forms connect to tasks

- Process flow steps may list **`requiredFormIds`** — those forms are represented on the **step task** already.
- Standalone required forms become their own **`requiredForm`** tasks when not covered by a step.

## Satisfaction rollups

In `buildEventExecutionDataflow`, a task’s **`requiredFormsSatisfied`** checks, per `formIds` on the task:

- Whether a **generated instance** exists for that form, **or**
- Whether `effectiveFormStatus` for that required form is **`complete`**

If not satisfied, completion messaging may show **Missing required form completion**.

## See also

- [KB-004](./KB-004-Tasks-Derivation-and-Stable-Identity.md)
- [KB-005](./KB-005-Required-Tasks-and-Certification-Gates.md)
