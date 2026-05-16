# CES/eCIgn Execution Architecture — Forensic Analysis & Reconciliation

**Date:** 2026-05-12  
**Scope:** Real current implementation — no ideals, no redesign  
**Status:** Pre-implementation analysis only

---

## PART 1 — REAL CURRENT DATAFLOW MAP

### Entry point: a user opens the evidence page for an event

```
User navigates to /evidence?event_id=qapi_meeting-20260507-08
  │
  ▼
useEventExecutionDataflow (useEventExecutionDataflow.ts)
  │
  ├── store.ensureEventInstance(event)              → creates/retrieves EventInstance
  ├── deriveDefaultEventTasks(event, eventId)        → GENERATES TASKS FROM SCRATCH (every render)
  │     ├── For each processFlow step  → 1 task per step (10 tasks for Q2 QAPI)
  │     ├── For each requiredForm NOT in processFlow → 1 more task per uncovered form
  │     ├── For event.minutes → 1 more task
  │     ├── For each event.approvals[] → 1 more task per approval rule
  │     └── For each formId in any task → 1 signer sub-task per required signer role
  │           (DEFAULT: DON + Administrator = 2 signer tasks per form)
  │           = 10 forms × 2 signers = 20 SIGNER TASKS CREATED ON TOP
  │
  ├── mergeDerivedEventTasksWithOverrides(eventId, derived, overrides)
  │     → Merges with store.taskOverridesByEventId[eventId]
  │     → Overrides WIN over derived on matching IDs
  │
  ├── Hydrate task.generated_form_instance_ids[]
  │     → Loose match by formId in generatedFormInstancesByEventId
  │     → If no match found: FABRICATES a canonical ID (formatCesFormInstanceId)
  │     → NOTE: fabricated ID ≠ any real form instance in the store
  │
  ├── For each task, build evidenceRollup
  │     → evidenceTaskIdMatchesTask(task, doc.taskId)
  │     → Checks requiredFormsSatisfied (looks at store.generatedFormInstancesByEventId)
  │     → Checks requiredEvidenceSatisfied
  │
  └── buildCesTaskRequirements() for each task   → REQUIREMENTS COMPUTED (not stored)
        ├── FORM_COMPLETION req    (25% weight)  → from task.status === 'done'
        ├── SIGNATURE_REQUIRED req (25% weight)  → from store.approvals count
        ├── LOCK_REQUIRED req      (5% weight)   → from ANY evidence with status=EVIDENCE_LOCKED
        └── (for non-form tasks only) SUPPORTING_EVIDENCE_UPLOAD (25% weight)
        NOTE: all completion % are derived, never stored
```

### Task count for Q2 QAPI (event `qapi_meeting-20260507-08`)

| Source | Count | Description |
|--------|-------|-------------|
| processFlow steps | 10 | q2-pre-dashboard, q2-pre-chart-audit, … |
| requiredForms not in processFlow | 0 | All 8 forms ARE referenced in processFlow steps |
| event.minutes | 1 | minutes:qapi_meeting-20260507-08 |
| event.approvals | 0 | None defined for this event |
| signer sub-tasks (DON × 8 forms) | 8 | SIGN-{eventId}-{formId}-DON |
| signer sub-tasks (Admin × 8 forms) | 8 | SIGN-{eventId}-{formId}-ADMINISTRATOR |
| **TOTAL GENERATED** | **27 tasks** | Per render, every render |

**The user sees ~8-10 tasks in the evidence panel. The system internally generates 27.** 
The signer tasks (16 of 27) are hidden from the evidence panel but COUNT against completion scoring.

---

## PART 2 — ARTIFACT/EVIDENCE LIFECYCLE (actual runtime)

### Happy path — user signs form QA-FM-021

```
FormSigningWorkspace renders
  │
  ├── getOrCreateFormInstance(eventId, formId, taskId, requirementId)
  │     → ISSUE: matching uses (eventId, formId, taskId) — different requirementId 
  │       shapes from different call sites previously created duplicates
  │       (partially fixed in previous session)
  │
  ├── User completes form fields
  ├── User clicks Sign
  ├── eCIgn backend API called (local demo: localStorage)
  ├── backendState becomes 'signed_locked'
  │
  └── useEffect fires when backendState === 'signed_locked'
        │
        ├── buildPacketHtml(effectiveRecord) → generates HTML string
        ├── packetPdfDataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(html)
        │
        ├── exec.uploadEvidence(hhcEventId, {
        │     kind: 'signed_package',
        │     mimeType: 'text/html',
        │     localDataUrl: packetPdfDataUrl,   ← FULL HTML stored here initially
        │     linkedFormInstanceId: canonicalFormInstanceId,
        │     taskId: parentTaskId,
        │   })
        │     │
        │     └── Inside uploadEvidence():
        │           ├── Validates (policyId, workflowId, eventId, taskId)
        │           ├── Creates EvidenceDoc with id='EV-{timestamp36}-{random4}'
        │           ├── status = 'EVIDENCE_LOCKED' ← immediately locked
        │           ├── stashDemoEvidenceDataUrl(id, localDataUrl)
        │           │     → writes to localStorage: 'ces_ev_data_' + id
        │           └── stores in state.evidence[eventId][]
        │
        ├── exec.uploadEvidence(hhcEventId, {..., kind: 'signed_certificate', ...})
        │     → SAME html content stored as SECOND artifact with different kind
        │
        └── state.evidence[eventId] now contains 2 new artifacts
              + any existing ones from prior signers (if multi-signer flow)
```

### Persistence — what survives a page refresh

```
Zustand persist middleware runs:
  partialize: state => ({
    evidence: stripEvidenceLargePayloads(state.evidence),   ← strips localDataUrl
    generatedFormInstancesByEventId: state.generatedFormInstancesByEventId,
    approvals: state.approvals,
    taskOverridesByEventId: state.taskOverridesByEventId,
    taskAuditByEventId: state.taskAuditByEventId,
    ...
  })

stripEvidenceLargePayloads() removes .localDataUrl from each EvidenceDoc before writing to localStorage.

RUNTIME localDataUrl survives in:
  - In-memory Zustand state (lost on refresh)
  - localStorage key: 'ces_ev_data_' + evidenceId  (written by stashDemoEvidenceDataUrl)

ON REFRESH:
  - EvidenceDoc is rehydrated WITHOUT localDataUrl (it was stripped)
  - resolveEvidenceDataUrl(doc) first checks doc.localDataUrl → null
  - Then checks localStorage.getItem('ces_ev_data_' + doc.id)
  - IF the stash key exists → URL is recovered
  - IF the stash key is gone (quota eviction, manual clear, new Playwright context) → MISSING
```

---

## PART 3 — THE CRITICAL RENDERABILITY BUG

### What `classifyEvidencePreview()` actually does

```typescript
function classifyEvidencePreview(doc: EvidenceDoc): 'image' | 'pdf' | 'html' | 'file' | 'missing' {
  const url = resolveEvidenceDataUrl(doc);
  if (!url) return 'missing';
  // checks mime/name for image/pdf/html...
  if (url.startsWith('data:text/html') || mime.includes('html') || lowerName.endsWith('.html'))
    return 'html';
  return 'file';
}
```

**The classification falls through to 'html' based on MIME TYPE and FILE NAME alone, NOT on whether the content actually renders.**

This means:
- An EvidenceDoc with `mimeType: 'text/html'` and `name: 'form.html'` → classified as 'html'
- Even if `resolveEvidenceDataUrl(doc)` returns `undefined` or a broken URL
- The previewMode becomes 'html'
- The iframe renders `src=""` (empty string)
- **The task still shows as complete because the EvidenceDoc exists in the store with status=EVIDENCE_LOCKED**

### What the completion gate actually checks

```typescript
// LOCK_REQUIRED completion:
const lockCompletion = usableEvidence.some(doc => doc.status === 'EVIDENCE_LOCKED') ? 100 : 0;

// FORM_COMPLETION:
const formCompletion = task.status === 'done' ? 100 : ...

// SIGNATURE_REQUIRED:
const signed = countApprovedSignatures(eventId, task, approvals);
const signatureCompletion = Math.round((signed / Math.max(1, signerTarget)) * 100);
```

**NOT ONE OF THESE CHECKS WHETHER THE DOCUMENT ACTUALLY RENDERS.**

- `LOCK_REQUIRED = 100` ← if ANY evidence with status=EVIDENCE_LOCKED exists, regardless of renderability
- `FORM_COMPLETION = 100` ← if task.status === 'done', regardless of content
- `SIGNATURE_REQUIRED = 100` ← if approval records exist in `state.approvals`, regardless of linked artifact

### The Playwright tests confirm this exact failure

The Q2 QAPI walkthrough Playwright tests inject fabricated evidence directly into localStorage:

```javascript
// From q2-qapi-complete-walkthrough.spec.ts:
evList.push({
  id: evId,
  status: 'EVIDENCE_LOCKED',
  mimeType: 'text/html',
  name: `${form.id}-Q2-QAPI-SignedPackage.html`,
  // localDataUrl: NOT stored in the evidence record itself
  // — stored in localStorage under ces_ev_data_${evId}
  ...
});
// Separately:
localStorage.setItem(`ces_ev_data_${evId}`, signedHtml);
```

The Playwright assertion `expect(evidenceCount.lockedCount).toBeGreaterThanOrEqual(8)` checks that 8 records have status=EVIDENCE_LOCKED.

**It never asserts that the HTML renders in a browser, survives a navigation, or is accessible cross-context.**

The FIX-A deep test DOES verify iframe rendering within the same test session (blob URL from the stash), but this is a same-tab scenario where the cache is hot. A real user opening the artifact viewer in a new tab after a page refresh would get a blank iframe.

---

## PART 4 — REDUNDANCY INVENTORY

### R1 — Task multiplication: 3 representations of the same operational obligation

**Same form QA-FM-021 produces:**

| Task | ID Format | Source | Visible? | Completion method |
|------|-----------|--------|----------|-------------------|
| processFlow task | `TASK-{eventId}-PROCESSFLOW-Q2-PRE-PIP...` | `deriveDefaultEventTasks` | ✅ Yes | task.status = 'done' |
| signer task (DON) | `SIGN-{eventId}-QA-FM-021-DON` | `deriveDefaultEventTasks` | ❌ Hidden | approval record exists |
| signer task (Admin) | `SIGN-{eventId}-QA-FM-021-ADMINISTRATOR` | `deriveDefaultEventTasks` | ❌ Hidden | approval record exists |

**The signer tasks (16 total for Q2 QAPI) are generated fresh on every render. They have no persistence path in `taskOverridesByEventId`. Their completion state is derived purely from `approvals[]`.**

### R2 — Evidence multiplication: 2 artifacts per signing event, potentially growing to 4

Per form, per signing:
- `signed_package` artifact (HTML)
- `signed_certificate` artifact (SAME HTML, different kind)

For a 2-signer flow: prior artifacts are removed and re-uploaded → up to 4 artifacts exist transiently.

**The `signed_certificate` is THE SAME HTML AS `signed_package`.** There is no separate certificate content. The kind field is the only differentiator.

### R3 — Form instance fabrication on every dataflow rebuild

```typescript
// In useEventExecutionDataflow.ts:
const nextSeq = mergedFormInstances.filter(inst => inst.formId === fid).length + 1;
return formatCesFormInstanceId(eventId, fid, nextSeq);
```

When a task has a `formId` but no matching form instance in the store, the system **silently fabricates an ID**. This fabricated ID is then passed to components that try to look it up — they find nothing, and the form opens blank.

### R4 — Evidence linking by taskId is fragile

Evidence documents are linked to tasks via `doc.taskId`. But:
- The task ID is derived deterministically from `(eventId, taskSourceId)` via `buildDeterministicTaskId()`
- `taskSourceId` = `processFlow:q2-pre-pip-remeasure` → deterministic hash
- But `uploadEvidence()` receives `parentTaskId` from `FormSigningWorkspace`, which uses `parentTaskId` from URL params
- If the URL taskId doesn't match the deterministic task ID, `evidenceTaskIdMatchesTask()` may fail
- Result: evidence exists in the store but is not linked to any task → orphan evidence

### R5 — `countApprovedSignatures()` has a bug: it counts ALL approvals for the event

```typescript
function countApprovedSignatures(eventId: string, task: Task, approvals: ApprovalRequest[]): number {
  const formId = 'form_id' in task ? task.form_id : undefined;
  return approvals.filter(ap =>
    ap.eventId === eventId
    && ap.status === 'approved'
    && (
      (formId && ap.targetKind === 'form' && ap.targetId === formId)
      || ap.targetKind === 'event'    // ← matches ALL event-level approvals
      || ap.targetKind === 'report'   // ← matches ALL report approvals
      || ap.targetKind === 'minutes'  // ← matches ALL minutes approvals
    )
  ).length;
}
```

**One `event`-level approval record makes EVERY form task in that event show 100% signature completion.** The `signerTarget` for a form task is 2, but if there's even one `targetKind: 'event'` approval, `signed` becomes 1, and `signatureCompletion` becomes 50%.

This means event-level approvals inflate per-task signature scores across the board.

### R6 — `stripEvidenceLargePayloads` removes the only render path on persist

```
EvidenceDoc.localDataUrl → stripped before persist → gone after refresh
  ↓
resolveEvidenceDataUrl() → checks localStorage ('ces_ev_data_' + id)
  ↓
If the 'ces_ev_data_' key is missing → returns undefined
  ↓
classifyEvidencePreview() → returns 'missing' IF url is falsy BUT
  ↓
Wait — classifyEvidencePreview checks url first:
  const url = resolveEvidenceDataUrl(doc);
  if (!url) return 'missing';
  ...
  if (mime.includes('html') || lowerName.endsWith('.html')) return 'html';

But look at line 151:
  if (url.startsWith('data:text/html') || mime.includes('html') || lowerName.endsWith('.html'))

The condition is an OR. If mime is 'text/html' and url IS defined (from cache),
then previewMode = 'html' ← correct.

BUT: useHtmlToPdfBlobUrl is called ONLY when shouldConvert is true:
  const isSignedArtifact = ... ['signed_package', ...].includes(doc.artifactType)
  const { pdfBlobUrl } = useHtmlToPdfBlobUrl(rawEvidenceHtmlSrc, isSignedArtifact && previewMode === 'html', ...)

So if previewMode is 'html' AND rawEvidenceHtmlSrc is defined (from cache)
→ blob URL is created → iframe renders correctly.

IF the 'ces_ev_data_' key expires or is absent:
→ url = undefined from resolveEvidenceDataUrl
→ classifyEvidencePreview returns 'missing'
→ iframe renders the "File data not found" fallback
→ BUT the evidence record still has status=EVIDENCE_LOCKED
→ lockCompletion = 100
→ task still shows complete
```

### R7 — Two signer task generation systems running simultaneously

`eventTaskAdapter.ts` (lines 197-261):
- Generates signer tasks as `EventTask[]` records inline during `deriveDefaultEventTasks()`
- Uses format: `SIGN-{eventId}-{formId}-{SIGNER_ROLE}`

`signerTaskFactory.ts`:
- Exports `generateSignerTasksForForm()`, `generateAllSignerTasks()`
- Generates `CesSignerTask[]` with format: `${eventId}::${formId}::SIGNER::${signerRole}`
- Has its own `CesSignerTask` type distinct from `EventTask`

**These two systems produce differently-typed, differently-ID'd representations of the same signing obligation. The `signerTaskFactory.ts` exports are not used in the main `eventTaskAdapter` flow — `eventTaskAdapter.ts` has its own inline implementation. `signerTaskFactory.ts` appears to be a dead/parallel implementation.**

### R8 — LOCK_REQUIRED requirement is redundant with EVIDENCE_LOCKED status

`LOCK_REQUIRED` at 5% weight checks: `usableEvidence.some(doc => doc.status === 'EVIDENCE_LOCKED')`.

`status === 'EVIDENCE_LOCKED'` is set **immediately** when `uploadEvidence()` is called. There is no separate "lock" user action. The "lock" is automatic.

So `LOCK_REQUIRED` is always satisfied the instant any evidence is uploaded. It is a no-op completion gate masquerading as a meaningful requirement.

### R9 — `requiredSignerTarget` always returns 2 for form tasks

```typescript
function requiredSignerTarget(task: Task): number {
  if ('required_signers' in task && Array.isArray(task.required_signers) ...) return task.required_signers.length;
  if ('form_id' in task && task.form_id) return 2;
  return 1;
}
```

Every form task requires 2 signatures. But `countApprovedSignatures()` checks against `state.approvals[]` which are approval records, NOT eCIgn signatures. A user signing via eCIgn creates an `uploadEvidence()` call — NOT an `approvals[]` record. So the signature counter and the actual signing action are disconnected.

After a form is signed via eCIgn:
- `state.evidence[]` gets a `signed_package` artifact ✅
- `state.approvals[]` gets an approval record ONLY IF `requestApproval` + `decideApproval` was called explicitly
- `SIGNATURE_REQUIRED` completionPercentage depends on `state.approvals[]`
- **If no approval record is added, SIGNATURE_REQUIRED stays at 0% forever even though the form was signed**

---

## PART 5 — ROOT CAUSE ANALYSIS

### RCA-1: Task explosion root cause

`deriveDefaultEventTasks()` is called on every render of `useEventExecutionDataflow`. It generates:
1. processFlow tasks
2. form tasks (for uncovered forms)
3. minutes tasks
4. approval tasks
5. SIGNER SUB-TASKS FOR ALL OF THE ABOVE

The signer sub-tasks are added by iterating over the tasks just created in the SAME call. Every form task generates N signer tasks inline. This happens on every component mount.

**The signer task count scales as `O(forms × signerRoles)` = 8 forms × 2 roles = 16 additional tasks on top of the operational tasks. These 16 tasks show up in sprint boards and completion scoring but have no direct user-facing action in the evidence panel.**

### RCA-2: False completion root cause

`buildCesTaskRequirements()` computes completion from:
- `task.status === 'done'` (form completion)
- `approvals.filter(ap => ...)` count (signatures)
- `usableEvidence.some(doc => doc.status === 'EVIDENCE_LOCKED')` (lock)

None of these verify that the underlying document actually renders. The system confuses **record existence** with **evidence validity**.

**A task is declared 100% complete if:**
- Status was set to 'done' in overrides (no form completion required)
- AND any approved approval record exists for this event
- AND any EVIDENCE_LOCKED record exists for this task

**None of these require the document to open, render, survive refresh, or remain linked to the canonical form instance.**

### RCA-3: Evidence isolation root cause (cross-tab/refresh failure)

The Zustand persist layer correctly strips `localDataUrl` to prevent localStorage quota exhaustion. The `stashDemoEvidenceDataUrl()` function writes the URL to a separate `ces_ev_data_` key. This design is correct but has a critical gap:

**In a new Playwright browser context, localStorage is empty. The `ces_ev_data_` keys don't exist. `resolveEvidenceDataUrl()` returns `undefined`. The artifact viewer shows "file data not found." The task still shows as 100% complete because the EvidenceDoc record exists with status=EVIDENCE_LOCKED.**

The Playwright tests injected evidence into the same browser context they then verified — making the stash available. This is a testing artifact that masks real-world refresh/cross-tab failure.

### RCA-4: Signer task/approval disconnect root cause

The eCIgn signing flow creates evidence artifacts via `uploadEvidence()`. It does NOT call `requestApproval()` + `decideApproval()`. But `countApprovedSignatures()` reads from `state.approvals[]`. Result: form is signed, evidence is locked, but SIGNATURE_REQUIRED shows 0%.

The only way SIGNATURE_REQUIRED reaches 100% currently is if:
1. A separate approval workflow runs AND creates approval records, OR
2. The injected test data includes pre-fabricated approval records

In the real eCIgn signing flow, no approval records are created. SIGNATURE_REQUIRED remains blocked for all eCIgn-signed forms.

---

## PART 6 — CANONICAL EXECUTION MODEL (proposed, not implemented)

### One operational obligation = one deterministic identity chain

```
RegulatoryEvent
  │ id: 'qapi_meeting-20260507-08'
  │
  └─► EventInstance
        │ id: derived from (sourceEventId, eventDate) — one per event
        │
        └─► EventTask (one per required form — no signer sub-tasks)
              │ id: buildDeterministicTaskId(eventId, 'processFlow:q2-pre-pip-remeasure')
              │ formId: 'QA-FM-021'
              │
              ├─► FormInstance (one per task+form — reused, never duplicated)
              │     id: 'qapi_meeting-20260507-08-QA-FM-021-001'
              │     status: DRAFT → IN_PROGRESS → FORM_LOCKED
              │
              ├─► SignatureRecord (one per signer — appended, not replaced)
              │     id: 'SIG-{formInstanceId}-{signerRole}-001'
              │     signerRole: 'DON'
              │     status: 'signed'
              │     signedAt: ISO
              │
              └─► EvidenceDoc (one canonical artifact — the signed HTML packet)
                    id: 'EV-{formInstanceId}-signed-package'
                    kind: 'signed_package'
                    mimeType: 'text/html'
                    status: EVIDENCE_LOCKED
                    localDataUrl: stored in ces_ev_data_ AND verifiable on render
```

### Completion gate: renderability-first

```
TASK IS COMPLETE IF AND ONLY IF:

1. FormInstance.status === 'FORM_LOCKED'
   AND FormInstance.id matches EvidenceDoc.linkedFormInstanceId

2. At least one SignatureRecord with status='signed' exists for this formInstanceId
   (not derived from approvals[] — derived from signerTaskStatus or formInstance.signatures[])

3. EvidenceDoc.status === 'EVIDENCE_LOCKED'
   AND resolveEvidenceDataUrl(doc) returns a non-empty string
   (i.e., the actual document content is recoverable — not just a record)
```

---

## PART 7 — WHAT MUST BE REMOVED / MERGED / DEPRECATED

### REMOVE

| Item | Location | Reason |
|------|----------|--------|
| Inline signer task generation in `eventTaskAdapter.ts` (lines 197–261) | `eventTaskAdapter.ts` | Produces 16+ ephemeral tasks per Q2 event; disconnected from approval records; creates completion scoring noise |
| `LOCK_REQUIRED` as a separate requirement | `cesEvidenceHierarchy.ts` | Evidence is auto-locked on upload; this gate never blocks anything; wastes 5% of completion weight |
| `signed_certificate` as a separate artifact | `FormSigningWorkspace.tsx` | Identical content to `signed_package`; doubles evidence count; confuses the artifact viewer |
| `signerTaskFactory.ts` exports `generateSignerTasksForForm`, `generateAllSignerTasks` | `signerTaskFactory.ts` | Dead code — not called from the main task generation path |
| Form instance ID fabrication | `useEventExecutionDataflow.ts` lines 117-118 | Fabricated IDs cause blank form opens and broken linkage |

### MERGE

| What | Into | Why |
|------|------|-----|
| Signer signature tracking | `FormInstance.signatures[]` | A form instance already knows who signed it; no need for separate signer tasks |
| `signed_certificate` artifact | Into `signed_package` note/metadata | Certificate is a subset of the packet; store attestation text in the packet |
| `SIGNATURE_REQUIRED` completion source | From `state.approvals[]` → to `FormInstance.lockedBy` / `FormInstance.signatures[]` | eCIgn signing already creates the form instance record; no need for a parallel approval record |

### MAKE CANONICAL

| Item | Canonical location | Currently fragmented across |
|------|-------------------|----------------------------|
| Task completion status | `taskOverridesByEventId[eventId][taskId].status` | task.status + formInstance.status + evidence.status + approvals count |
| Signature completion | `formInstance.signatures[]` | `state.approvals[]` + signer task status + ecign session |
| Evidence renderability | `ces_ev_data_{id}` (always present if evidence is valid) | In-memory state + separate stash + persist layer strips it |
| Form instance identity | Exactly one record per `(eventId, formId, taskId)` | Multiple records possible when requirementId shapes differ |

### STOP GENERATING TASKS FOR

| Action | Currently generates | Should generate |
|--------|---------------------|----------------|
| eCIgn form signing | 1 signer task per signer role per form (×16) + 1 evidence artifact + 1 certificate artifact + 1 approval record | Nothing new — mark formInstance.status = FORM_LOCKED |
| Evidence upload (for eCIgn form) | Upload task row + evidence artifact + audit entries | Nothing — form IS the evidence |
| Subsequent signer | Remove old artifacts + upload 2 new artifacts | Append to formInstance.signatures[] only; keep one artifact |

---

## PART 8 — EVIDENCE RENDERABILITY GATE — REQUIRED IMPLEMENTATION

### What must change in `buildCesTaskRequirements()`

**Current (broken):**
```typescript
const lockCompletion = usableEvidence.some(doc => doc.status === 'EVIDENCE_LOCKED') ? 100 : 0;
```

**Required (renderability-first):**
```typescript
// Evidence is valid only if the actual document is retrievable.
// A record with status=EVIDENCE_LOCKED but no recoverable URL is a pointer, not evidence.
function isEvidenceRenderable(doc: EvidenceDoc): boolean {
  const url = peekDemoEvidenceDataUrl(doc.id) ?? doc.localDataUrl;
  if (!url) return false;
  // Must have actual content, not just a mime header
  if (url === 'data:text/html;charset=utf-8,') return false;
  if (url.length < 100) return false;
  return true;
}

const renderableEvidence = linkedEvidence.filter(
  doc => doc.status === 'EVIDENCE_LOCKED' && isEvidenceRenderable(doc)
);
const lockCompletion = renderableEvidence.length > 0 ? 100 : 0;
```

### What must change in `FormSigningWorkspace.tsx` finalize

After uploading evidence, verify the stash key was written:

```typescript
// After uploadEvidence(), verify the stash is populated:
const stashKey = `ces_ev_data_${signedPackageArtifactId}`;
const stashed = localStorage.getItem(stashKey);
if (!stashed) {
  // Re-stash explicitly — don't assume uploadEvidence() did it
  localStorage.setItem(stashKey, packetPdfDataUrl);
}
```

### What must change in `classifyEvidencePreview()`

Current logic returns 'html' based on mime+name EVEN IF url is from the stash (acceptable) or undefined (broken). The issue is downstream rendering, not the classification. The real fix is to make `LOCK_REQUIRED` only count documents that have a recoverable URL.

---

## PART 9 — SINGLE SOURCE OF TRUTH MATRIX

| Concept | Owner | Where stored (current) | Where it should live |
|---------|-------|----------------------|---------------------|
| Task exists | `deriveDefaultEventTasks()` | Computed, not stored | `taskOverridesByEventId` (overrides) + computed base (no change) |
| Task status | `taskOverridesByEventId[eventId][]` | ✅ Stored | Keep |
| Form instance identity | `generatedFormInstancesByEventId[eventId][]` | ✅ Stored | Keep — but remove loose-match fabrication |
| Form instance status | `generatedFormInstancesByEventId[eventId][].status` | ✅ Stored | Keep |
| Signatures (who signed) | `state.approvals[]` | ❌ Wrong owner — approvals is for review flows | Move to `formInstance.signatures[]` |
| Evidence content (HTML) | `ces_ev_data_{id}` in localStorage | ✅ Correct path | Keep — but validate presence before claiming completion |
| Evidence record | `state.evidence[eventId][]` | ✅ Stored | Keep — but strip signed_certificate duplicates |
| Completion % | Computed by `buildCesTaskRequirements()` | ✅ Computed | Keep — but add renderability check |
| Audit trail | `taskAuditByEventId[eventId][]` | ✅ Stored | Keep |
| Certifications | `certifications[eventId]` | ✅ Stored | Keep |

---

## PART 10 — COMPONENTS CAUSING TASK EXPLOSION

| Component | What it generates | Problem |
|-----------|------------------|---------|
| `eventTaskAdapter.ts : deriveDefaultEventTasks()` | 27 tasks for Q2 QAPI (10 operational + 16 signer + 1 minutes) | Signer tasks are ephemeral, completion-disconnected, and multiply with every form added |
| `cesEvidenceHierarchy.ts : buildCesTaskRequirements()` | LOCK_REQUIRED requirement on every task | Always 100% once any evidence exists; no operational meaning |
| `FormSigningWorkspace.tsx : finalize useEffect` | 2 EvidenceDoc records per signing (package + certificate) | Identical content; doubles evidence count; confuses artifact viewer |
| `regulatoryExecutionStore.ts : uploadEvidence()` | Immediately sets `status: 'EVIDENCE_LOCKED'` | No intermediate validation; stash may be absent |
| `useEventExecutionDataflow.ts : generated_form_instance_ids` | Fabricates form instance IDs when no real instance found | Causes blank form opens; orphan linkage |

---

## PART 11 — SUMMARY FINDINGS BEFORE ANY IMPLEMENTATION

### Critical (blocks audit defensibility)

1. **Evidence completion gate is based on record existence, not document renderability.** A task shows 100% complete even when the artifact viewer shows "File data not found."

2. **Signature completion (SIGNATURE_REQUIRED) is driven by `state.approvals[]`, which eCIgn signing DOES NOT populate.** SIGNATURE_REQUIRED is permanently at 0% for all eCIgn-signed forms unless approval records are manually injected.

3. **`ces_ev_data_` stash is absent in new browser contexts.** All signed artifacts become unrenderable after a Playwright context change, real user browser refresh with cleared localStorage, or cross-tab navigation.

### High (causes user confusion and operational noise)

4. **16 signer sub-tasks are generated for Q2 QAPI but are invisible to the user** while still counting against completion scoring. Evidence panel shows tasks as incomplete because signer tasks are unresolved.

5. **`signed_certificate` duplicates `signed_package`** — identical HTML content, different kind field. Doubles the evidence artifact count. Creates confusion in the artifact viewer when both appear.

6. **`LOCK_REQUIRED` is a no-op gate** (evidence is auto-locked on upload) masquerading as a 5% completion requirement.

### Medium (technical debt causing future fragility)

7. **Two signer task generation systems**: `eventTaskAdapter.ts` inline implementation vs `signerTaskFactory.ts` separate module. Both exist, produce different ID formats, `signerTaskFactory` appears dead.

8. **Form instance ID fabrication** in `useEventExecutionDataflow.ts` silently invents IDs for tasks with no matching form instance, causing components to open blank forms and broken artifact links.

9. **Evidence-to-task linkage is taskId string matching**, and the taskId in evidence records depends on what string was passed to `uploadEvidence()` from the URL — which may differ from the deterministic task ID.

---

*This document describes only the current real architecture. No changes have been made. Implementation plan to follow after stakeholder review.*
