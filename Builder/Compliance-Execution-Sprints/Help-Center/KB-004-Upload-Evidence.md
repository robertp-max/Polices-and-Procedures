# KB-004 — How to Upload Evidence

**Audience:** Anyone uploading a document. **Time to read:** 2 minutes.

## The easy way (recommended)

Always upload from the **Sprint Board card** of the unit you are completing.
This auto-tags the file with `event_id`, `workflow_id`, and `policy_id`.

1. Open the unit drawer.
2. Click **Upload Evidence**.
3. Pick the file. Done.

## The manual way (Evidence Center)

If you must upload directly from `/evidence`:

1. Click **Upload File**.
2. Fill in the three required fields:
   - **Policy ID** (e.g., `QA-PG-001`)
   - **Workflow ID** (e.g., `CL-WF-POC-AUDIT-001`)
   - **Event ID** (canonical format: `{eventSubType}-{YYYYMMDD}-{NN}`)
3. Optionally add a **Form ID** if the document satisfies a specific form.
4. Pick the file and click **Upload**.

## Status lifecycle (what happens after upload)

```
PENDING_UPLOAD → UPLOADED → VALIDATED → PROMOTED → APPROVED_EVIDENCE → SIGNED
```

You can usually leave the unit alone once the file shows **VALIDATED** —
the rest is automatic. If status reaches **FAILED**, the file is rejected
(usually due to mime type, size, or hash mismatch). Re-upload.

## Accepted file types

PDF, PNG, JPG, DOCX, XLSX. Max 50 MB per file.

## Where files live

```
evidence/{policy_id}/{workflow_id}/{event_id}/{evidence_id}
```

This path is immutable. Files cannot be deleted; new versions are uploaded
as new evidence records linked to the same unit.

## Related

- [KB-002 — How to Complete an Execution Unit](KB-002-Complete-Execution-Unit.md)
- [KB-014 — Understanding Event IDs](KB-014-Event-IDs.md)
