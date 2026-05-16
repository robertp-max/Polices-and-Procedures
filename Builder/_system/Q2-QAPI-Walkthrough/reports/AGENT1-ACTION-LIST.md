# AGENT 1 — Architecture Audit: CES/eCIgn/Evidence Pipeline
**Action List for Agent 2 (Implementer)**
Generated: 2026-05-12 by Agent 1 — Architecture Auditor
Event scope: `qapi_meeting-20260507-08` (Q2 QAPI Review)

---

## VERIFIED BUGS — LINE-LEVEL ACTION LIST

---

### eventTaskAdapter.ts
`src/policy/compliance-execution/eventTaskAdapter.ts`

- **LINE 6: REMOVE** — Delete the import of `resolveSignerRoles` from `signerTaskFactory`. After removing the signer sub-task loop below, this import becomes dead.
  ```ts
  // DELETE this line:
  import { resolveSignerRoles } from '@/policy/ces/signerTaskFactory';
  ```

- **LINES 197-261: REMOVE** — Delete the entire signer sub-task generation block (the `// ── Signer sub-tasks` comment through the closing `}`). This block:
  1. Iterates every task that has `formIds`
  2. Calls `resolveSignerRoles(...)` to get signer roles per form
  3. Pushes one `EventTask` with `status: 'awaiting_signature'` per (formId × role) combination
  4. For Q2 QAPI this produces **16 invisible tasks** (8 unique form IDs × 2 default signer roles: DON + Administrator) that are never visible to users but permanently drag completion scoring to ≤54%.

  **Full block to delete:**
  ```ts
  // ── Signer sub-tasks: one EventTask per required signer role per form ──
  const signerTaskSeen = new Set<string>();
  for (const parentTask of [...tasks]) {
    ...
  }
  ```
  Lines 197–261 inclusive. The `return tasks;` on line 263 remains.

- **LINE 68: EVALUATE** — `blocksOnSignerTasks: (step.requiredFormIds?.length ?? 0) > 0` — This flag references signer task gating that no longer exists after the above removal. Change to `blocksOnSignerTasks: false` or remove the field from the `EventTask` type entirely if no consumer reads it.

- **LINE 112: EVALUATE** — Same as line 68 for the `requiredForms` task block: `blocksOnSignerTasks: true`. Change to `false` or remove.

---

### cesEvidenceHierarchy.ts
`src/policy/evidence/cesEvidenceHierarchy.ts`

- **LINE 13: MODIFY** — Remove `'LOCK_REQUIRED'` from the `ExecutionRequirementType` union:
  ```ts
  // BEFORE:
  export type ExecutionRequirementType =
    | 'FORM_COMPLETION'
    | 'SUPPORTING_EVIDENCE_UPLOAD'
    | 'SIGNATURE_REQUIRED'
    | 'REVIEW_REQUIRED'
    | 'CERTIFICATION_REQUIRED'
    | 'LOCK_REQUIRED';   // ← DELETE THIS LINE

  // AFTER:
  export type ExecutionRequirementType =
    | 'FORM_COMPLETION'
    | 'SUPPORTING_EVIDENCE_UPLOAD'
    | 'SIGNATURE_REQUIRED'
    | 'REVIEW_REQUIRED'
    | 'CERTIFICATION_REQUIRED';
  ```

- **LINE 154: REMOVE** — Remove the `LOCK_REQUIRED: 5` entry from `REQUIREMENT_WEIGHTS`:
  ```ts
  // BEFORE:
  const REQUIREMENT_WEIGHTS: Record<ExecutionRequirementType, number> = {
    FORM_COMPLETION: 25,
    SUPPORTING_EVIDENCE_UPLOAD: 25,
    SIGNATURE_REQUIRED: 25,
    REVIEW_REQUIRED: 10,
    CERTIFICATION_REQUIRED: 10,
    LOCK_REQUIRED: 5,    // ← DELETE THIS LINE
  };
  ```
  The remaining 5 weights sum to 95; normalization at line 446 already re-scales everything to 100%, so no further change is needed.

- **LINES 432-443: REMOVE** — Delete the entire `LOCK_REQUIRED` `addRequirement(...)` call and its `lockCompletion` variable:
  ```ts
  // DELETE all of this:
  const usableEvidence = linkedEvidence.filter(isEvidenceUsableForCompletion);
  const lockCompletion = usableEvidence.some(doc => doc.status === 'EVIDENCE_LOCKED') ? 100 : 0;
  addRequirement({
    suffix: 'lock',
    title: 'Evidence lock required',
    type: 'LOCK_REQUIRED',
    status: requirementStatusForCompletion(lockCompletion),
    completionPercentage: lockCompletion,
    weightPercentage: REQUIREMENT_WEIGHTS.LOCK_REQUIRED,
    evidence_id: usableEvidence.find(doc => doc.status === 'EVIDENCE_LOCKED')?.id,
    actionNeeded: lockCompletion >= 100 ? 'No action needed' : 'Promote and lock evidence package',
  });
  ```
  **Reason**: `uploadEvidence()` in `regulatoryExecutionStore.ts` unconditionally sets `status: 'EVIDENCE_LOCKED'` on every document (line 951). Therefore `lockCompletion` is always 100 the instant any evidence is uploaded — the requirement is a no-op that wastes 5% of scoring weight and adds a permanently-green row that misleads users. There is also no renderability gate: the check passes even when the data URL stash is empty and the document renders blank.

- **LINES 378-404: MODIFY — SIGNATURE_REQUIRED data source fix** — The current implementation counts `ApprovalRequest` records with `status === 'approved'`. The eCIgn signing flow in `FormSigningWorkspace.tsx` **never writes to `store.approvals[]`**. It only calls `exec.uploadEvidence(...)`, creating `signed_package` and `signed_certificate` evidence artifacts. Therefore `signatureCompletion` is permanently 0% for all eCIgn-signed forms.

  **Fix**: Replace the approval-based signature count with a `signed_package` evidence check:

  ```ts
  // REPLACE the current countApprovedSignatures call (lines 379-380):
  const signed = Math.min(signerTarget, countApprovedSignatures(eventId, task, approvals));
  const signatureCompletion = Math.round((signed / Math.max(1, signerTarget)) * 100);

  // WITH a signed_package evidence check:
  const hasSignedPackage = linkedEvidence.some(
    doc =>
      (doc.artifactType === 'signed_package' || doc.kind === 'signed_package') &&
      isEvidenceUsableForCompletion(doc),
  );
  const signatureCompletion = hasSignedPackage ? 100 : 0;
  ```

  Also update the `signatureApprovalForRow` lookup (lines 381-393) — it is only used to populate `signature_id` on the requirement row, which is informational. After this fix it can remain but will typically yield `undefined`. Leave as-is or simplify to `undefined`.

  **Impact**: For a form task that has a completed `signed_package` evidence artifact, `SIGNATURE_REQUIRED` now scores 100% instead of 0%. This unlocks the path to 100% weighted completion for those tasks.

---

### FormSigningWorkspace.tsx
`src/policy/components/FormSigningWorkspace.tsx`

- **LINES 1549-1556: REMOVE (isSubsequentSigner path)** — Delete the `signed_certificate` `exec.uploadEvidence(...)` call entirely:
  ```ts
  // DELETE (subsequent signer path — lines 1549-1556):
  certificateArtifactId = exec.uploadEvidence(hhcEventId, {
    ...versionedMeta,
    name: `${formId}-${canonicalFormInstanceId}-signed-certificate-v${signerIndex}.html`,
    kind: 'signed_certificate', mimeType: 'text/html',
    sizeLabel: `${Math.round(packetPdfDataUrl.length / 1024)} KB`,
    artifactType: 'signed_certificate',
    localDataUrl: packetPdfDataUrl,
  }, actorLabel);
  ```

- **LINES 1577-1586: REMOVE (first-signer path)** — Delete the `signed_certificate` `exec.uploadEvidence(...)` call:
  ```ts
  // DELETE (first signer path — lines 1577-1586):
  certificateArtifactId = exec.uploadEvidence(hhcEventId, {
    ...commonArtifactMeta,
    name: `${formId}-${canonicalFormInstanceId}-signed-certificate.html`,
    kind: 'signed_certificate',
    mimeType: 'text/html',
    sizeLabel: `${Math.round(packetPdfDataUrl.length / 1024)} KB`,
    artifactType: 'signed_certificate',
    note: `artifact_type=signed_certificate;canonical_form_instance_id=${canonicalFormInstanceId};ecign_session_id=${instance?.instance_id ?? ''}`,
    localDataUrl: packetPdfDataUrl,
  }, actorLabel);
  ```

- **LINE 1517-1518: MODIFY** — `certificateArtifactId` is still referenced in the guard (line 1593) and audit trail (lines 1603-1604). After removing the certificate upload, alias it to the package ID:
  ```ts
  // BEFORE:
  let certificateArtifactId: string;
  let signedPackageArtifactId: string;

  // AFTER:
  let signedPackageArtifactId: string;
  let certificateArtifactId: string; // will be set = signedPackageArtifactId after upload
  ```
  Then after each `signedPackageArtifactId = exec.uploadEvidence(...)` call, add:
  ```ts
  certificateArtifactId = signedPackageArtifactId;
  ```

- **LINE 1593: MODIFY** — Update the guard to only check for the package:
  ```ts
  // BEFORE:
  if (!certificateArtifactId || !signedPackageArtifactId) { return; }

  // AFTER:
  if (!signedPackageArtifactId) { return; }
  ```

  **Reason for removal**: Both `signed_package` and `signed_certificate` are uploaded with **identical `localDataUrl: packetPdfDataUrl`** (the full eCIgn packet HTML). This doubles the artifact count per signing event. The `signed_package` is already defined as "the single canonical packet (form + certificate + audit context)" — the comment at line 1589 explicitly says `signed_form_instance is intentionally not created`. The same logic applies to `signed_certificate`: it is redundant, contains no unique information, and creates duplicate entries in the Evidence Center that confuse users.

---

### regulatoryExecutionStore.ts
`src/policy/stores/regulatoryExecutionStore.ts`

- **LINE 951: MODIFY** — `uploadEvidence()` sets `status: 'EVIDENCE_LOCKED'` unconditionally without verifying the stash key was written. This is the root cause of Bug 2 (LOCK_REQUIRED is always 100%):
  ```ts
  // CURRENT (line 951):
  status: 'EVIDENCE_LOCKED',

  // PROPOSED FIX:
  status: doc.localDataUrl ? 'UPLOADED' : 'EVIDENCE_LOCKED',
  ```
  Then add a promotion step after `stashDemoEvidenceDataUrl(id, previewForStash)` (after line 961):
  ```ts
  // After stash: if localDataUrl was provided and stash succeeded, promote to LOCKED.
  if (doc.localDataUrl && previewForStash) {
    // Stash succeeded (memCache always works). Promote to EVIDENCE_LOCKED.
    newDoc.status = 'EVIDENCE_LOCKED';
  }
  ```
  **Alternative simpler fix**: Keep auto-locking as-is but add a guard that checks `peekDemoEvidenceDataUrl(id)` returns a truthy value after stash before setting locked:
  ```ts
  const stashOk = !doc.localDataUrl || !!peekDemoEvidenceDataUrl(id);
  // ... then:
  status: stashOk ? 'EVIDENCE_LOCKED' : 'UPLOADED',
  ```
  > **Note**: This bug interacts directly with Bug 2. If LOCK_REQUIRED is removed from cesEvidenceHierarchy.ts (recommended), this store fix becomes lower priority — auto-locking without stash verification only manifests as a UI display gap (blank iframe), not a scoring error.

- **LINE 1847-1924: NO CHANGE** — `getOrCreateFormInstance()` is correctly implemented. The idempotency key `(eventId, formId, taskId)` was already fixed. No action needed here.

---

### useEventExecutionDataflow.ts
`src/policy/compliance-execution/useEventExecutionDataflow.ts`

- **LINES 117-118: MODIFY** — The fallback that fabricates a form instance ID when no real instance exists:
  ```ts
  // CURRENT (lines 116-119):
  const nextSeq = mergedFormInstances.filter(inst => inst.formId === fid).length + 1;
  return formatCesFormInstanceId(eventId, fid, nextSeq);   // ← FABRICATION

  // FIX — return undefined instead of a fake ID:
  return undefined;
  ```
  Then filter out the undefined values from the resulting `ids` array:
  ```ts
  // MODIFY line 120-121:
  return { ...task, generated_form_instance_ids: ids.filter((id): id is string => Boolean(id)) };
  ```

  **Why this matters**: A fabricated ID like `CES-qapi_meeting-20260507-08-QA-FM-020-001` does not exist in the store. When `buildCesTaskRequirements` reads `task.generated_form_instance_ids?.[0]` (line 329 of cesEvidenceHierarchy.ts) and passes it to the UI as `form_instance_id`, users see a broken link. The artifact viewer tries to look up a non-existent form instance. Returning `undefined` is honest — the form hasn't been opened yet.

---

### signerTaskFactory.ts
`src/policy/ces/signerTaskFactory.ts`

- **ENTIRE FILE: DEAD CODE — DELETE or archive**

  Confirmation of dead status:
  1. Only one file imports from this module: `eventTaskAdapter.ts` (line 6, importing only `resolveSignerRoles`).
  2. The functions `generateSignerTasksForForm`, `generateAllSignerTasks`, `buildSignerTaskId`, `areAllSignerTasksComplete`, `areAllEventSignerTasksComplete` have **zero call sites** in the codebase — they were the original signerTask generation API that was superseded by the inline loop in `eventTaskAdapter.ts` lines 197-261.
  3. The ID format in `signerTaskFactory.ts` (`{eventId}::{formId}::SIGNER::{safeRole}`) differs from the active format in `eventTaskAdapter.ts` (`SIGN-{eventId}-{formId}-{safeRole}`), confirming these are parallel implementations that were never reconciled.
  4. After removing the inline signer sub-task loop (Bug 1 fix), the import of `resolveSignerRoles` in `eventTaskAdapter.ts` also becomes dead.

  **Action**: Delete `src/policy/ces/signerTaskFactory.ts` and remove the import at `eventTaskAdapter.ts` line 6.

---

### demoEvidenceRuntimeCache.ts
`src/policy/evidence/demoEvidenceRuntimeCache.ts`

- **NO CHANGES REQUIRED** — All functions are correctly implemented:
  - `resolveEvidenceDataUrl` (lines 107-110): correctly prefers `doc.localDataUrl`, then falls back to `peekDemoEvidenceDataUrl`. No bug.
  - `peekDemoEvidenceDataUrl` (lines 31-44): correctly checks memCache then localStorage. No bug.
  - `stashDemoEvidenceDataUrl` (lines 19-29): writes to both memCache and localStorage with graceful quota-exceeded handling. The localStorage failure is silent but memCache still serves same-tab. No functional bug.
  - `dataUrlToBlobUrlForHtml` (lines 116-138): correctly handles both base64 and URL-encoded HTML data URLs. No bug.

---

### ArtifactViewerPage.tsx
`src/policy/pages/ArtifactViewerPage.tsx`

- **NO CRITICAL CHANGES REQUIRED** — The rendering logic is correct for the current artifact types.

  - `classifyEvidencePreview` (lines 140-155): correctly routes to 'missing' when `resolveEvidenceDataUrl` returns undefined. This IS the renderability gate for the viewer — if the data URL is not stashed, the user sees "File data not found" (lines 726-730) rather than a blank iframe. **The gap is upstream in the store** (Bug 8), not here.

  - The `ecignPacketPrintUrl` lookup (lines 445-457): currently tries to find a `signed_package` when viewing a `signed_certificate` artifact. After Bug 4 fix (removing `signed_certificate` uploads), no `signed_certificate` artifacts will exist, making this code path inactive but harmless.

  - **ADVISORY**: After removing `signed_certificate` from FormSigningWorkspace.tsx, audit the ArtifactViewer's artifact-type filter at line 448 (`at !== 'signed_form_instance' && at !== 'signed_certificate'`). The `signed_certificate` branch can be removed from the condition since no such artifact will exist post-fix. This is a cleanup item, not a critical bug.

---

## TASK REDUCTION SUMMARY

### Q2 QAPI Event: `qapi_meeting-20260507-08`

| Category | Count | Detail |
|---|---|---|
| processFlow tasks | 10 | All 10 steps have requiredFormIds |
| requiredForms extra tasks | 0 | All 8 forms covered by processFlow steps |
| minutes task | 1 | Has minutes section |
| approval tasks | 4 | q2-ap-min, q2-ap-pip, q2-ap-action, q2-ap-report |
| **Parent tasks (current)** | **15** | |
| Signer sub-tasks (current) | **16** | 8 unique formIds × 2 roles (DON + Administrator) |
| **TOTAL CURRENT** | **31** | |

**Forms generating signer sub-tasks** (8 unique form IDs, no FORM_OVERRIDES entries found):

| Form ID | processFlow steps using it | Signer tasks generated |
|---|---|---|
| QA-FM-020 | q2-pre-dashboard | DON + Administrator = 2 |
| QA-FM-021 | q2-pre-pip-remeasure | DON + Administrator = 2 |
| QA-FM-022 | q2-pre-action-review, q2-during-meeting, q2-post-action-publish | DON + Administrator = 2 (deduplicated) |
| QA-FM-023 | q2-post-gb-report | DON + Administrator = 2 |
| QA-FM-024 | q2-during-meeting, q2-post-minutes | DON + Administrator = 2 (deduplicated) |
| QA-FM-025 | q2-pre-chart-audit | DON + Administrator = 2 |
| QA-FM-026 | q2-pre-incident-summary | DON + Administrator = 2 |
| QA-FM-027 | q2-pre-infection-log | DON + Administrator = 2 |
| **Total** | | **16 signer sub-tasks** |

**After fixes:**

| Category | Count | Change |
|---|---|---|
| processFlow tasks | 10 | No change |
| requiredForms extra tasks | 0 | No change |
| minutes task | 1 | No change |
| approval tasks | 4 | No change |
| **Parent tasks** | **15** | No change |
| Signer sub-tasks | **0** | −16 (entire block removed) |
| **TOTAL AFTER FIX** | **15** | **−16 tasks (52% reduction)** |

---

### Requirements Removed (per task)

| Requirement | Current Weight | Status | Removal |
|---|---|---|---|
| `LOCK_REQUIRED` | 5% (pre-normalization) | Always 100% immediately — no-op | **REMOVED** |

### Requirements Changed (per task)

| Requirement | Before | After |
|---|---|---|
| `SIGNATURE_REQUIRED` | Reads `store.approvals[]` — always 0% for eCIgn-signed forms | Reads `signed_package` evidence — 100% when signed |

### Effective Weight Redistribution (form task with formId present)

| Requirement | Before (normalized) | After (normalized) |
|---|---|---|
| FORM_COMPLETION | 25/55 = **45%** | 25/50 = **50%** |
| SIGNATURE_REQUIRED | 25/55 = **45%** | 25/50 = **50%** |
| LOCK_REQUIRED | 5/55 = **9%** | — (removed) |

### Completion Score for "Form Completed + Signed" State

| State | Before | After |
|---|---|---|
| Form complete, no signature | 45% | 50% |
| Form complete + signed (eCIgn) | 45% (SIGNATURE always 0%) | **100%** |
| Form complete + approved (admin approval) | 90% (LOCK = 100% immediately) | 50% (no approval yet) |

---

## BUG CROSS-REFERENCE TABLE

| # | File | Lines | Category | Priority |
|---|---|---|---|---|
| 1 | eventTaskAdapter.ts | 6, 197-261 | REMOVE signer sub-task generation loop | **P0 — Scoring** |
| 2 | cesEvidenceHierarchy.ts | 13, 154, 432-443 | REMOVE LOCK_REQUIRED requirement | **P0 — Scoring** |
| 3 | cesEvidenceHierarchy.ts | 432-433 | (covered by Bug 2) No renderability gate on LOCK_REQUIRED | **P0 — Scoring** |
| 4 | FormSigningWorkspace.tsx | 1549-1556, 1577-1586 | REMOVE signed_certificate duplicate upload | **P1 — Artifact** |
| 5 | cesEvidenceHierarchy.ts | 379-380 | MODIFY SIGNATURE_REQUIRED to read signed_package | **P0 — Scoring** |
| 6 | useEventExecutionDataflow.ts | 117-118 | MODIFY fabricated form instance ID fallback | **P1 — Data** |
| 7 | signerTaskFactory.ts | entire file | DELETE dead code | **P2 — Cleanup** |
| 8 | regulatoryExecutionStore.ts | 951 | MODIFY auto-lock without stash verification | **P2 — Integrity** |

---

*End of Agent 1 Action List — ready for Agent 2 implementation.*
