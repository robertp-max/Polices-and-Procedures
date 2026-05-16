# eCIgn Signed Artifact Failure — Post-Sign Actions Open Wrong Content

**Component**: Electronic Signature / Form Signing Flow (eCIgn)  
**Severity**: P0 — core compliance workflow produces unretrievable signed documents; CMS defensibility risk  
**Status**: Unresolved as of 2026-05-14  

---

## 1. Component Sub-Areas (per forensic instructions)

| Sub-Area | Status |
|----------|--------|
| Pre-sign form renderer | UNKNOWN — form renders in template mode when form_instance_id missing (see DEFECT-Q2-003) |
| Signed artifact generator | BROKEN — generates new PDF instead of storing the one produced at signing |
| Signed PDF download | BROKEN — downloads form template HTML, not stored signed PDF |
| Print signed artifact | BROKEN — print route drifted; opens wrong content (see PRINT_AND_SIGNED_PDF_ROUTE_DRIFT.md) |
| Certificate artifact | UNVALIDATED — no browser test of certificate page content |
| Artifact viewer | BROKEN — opens form HTML template not stored artifact |
| Evidence center link | BROKEN — metadata row present; artifact content lost on reload |
| Audit trail link | BROKEN — `targetKind`/`targetId` not populated in audit entries (DEFECT-Q2-006) |

---

## 2. Symptoms Reported by User

Transcript source: `cacb1d6f-47aa-4365-9097-1cbfcca36b6c`, May 11, 2026, 00:34 UTC-7

> *"why is it so fucking difficult for u to fucking understand to fucking use the fucking pdf generated at the fucking end of the ecign and fucking use the fucking pdf for the fucking artifact. after fucking ecigning fucking download the fucking pdf gen"*

Transcript source: `cacb1d6f-47aa-4365-9097-1cbfcca36b6c`, May 11, 2026, 15:15 UTC-7

> *"u are fucking missing the point! it is fucking important that the fucking pdf generated is the same fucking pdf saved in the evidence for it to be defensible dont fucking generate a new fucking pdf are u fucking really this fucking stupid"*

Transcript source: `cacb1d6f-47aa-4365-9097-1cbfcca36b6c`, May 11, 2026, 15:32 UTC-7

> *"please review ecign documentations including requirement for cms defensibility and legal binding eligibility. also make sure after the forms are initially signed, it will create a task for the second signer third and or forth and it. it must use the same pdf throughout the entire process of the instance and generating additional pages and certificates"*

Summary of symptoms:
- After completing a form signature flow, clicking "Download PDF," "Print," or "Open Artifact" does not open the signed document
- The content displayed or downloaded is the live form HTML template, not the stored signed PDF
- The AI agent repeatedly generated a **new PDF** instead of retrieving the **same PDF** that was signed
- Signed artifacts cannot be reliably located in Evidence Center after page reload
- Multi-signer PDF chain not implemented: second, third, and fourth signers do not receive tasks; same PDF not passed through the chain
- Audit trail links in Evidence Center point to empty/broken artifact IDs (DEFECT-Q2-006, Playwright-confirmed)

---

## 3. Prior Attempted Fixes

1. General "signing flow" refactors performed during multiple prior passes
2. Signing UI rendered correctly (confirmation screen visible) — declared "working"
3. An "eCIgn Multi-Signer PDF Chain and CMS Defensibility Plan" was created and implementation was triggered (`cacb1d6f`, May 11, 2026, 16:28) — no browser validation followed
4. Agent edited `FormSignatureFlow.tsx` and related components multiple times without validating artifact retrieval behavior

All prior fixes: **CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION**

---

## 4. Why Prior Fixes Likely Failed

The signing flow in `FormSignatureFlow.tsx` writes a signed artifact reference to a store, but the post-signature action handlers (Download, Print, Open) resolve the artifact through a different path — one that re-renders the form template rather than retrieving the stored file.

Contributing factors:

1. **No deterministic filename standard**: Without a canonical naming convention like `{formId}_{formInstanceId}_{eventId}_{signedAt}_SIGNED.pdf`, the artifact written during signing cannot be reliably looked up by downstream components.

2. **Artifact ID mismatch**: The `artifactId` written to the evidence store during signing differs from the `artifactId` referenced in audit trail links. DEFECT-Q2-006 (Playwright-confirmed, transcript `3cf17f83`) confirmed that `targetKind` and `targetId` are not written to audit entries at the point of form completion.

3. **Object URL lifetime**: Signed artifact stored as `URL.createObjectURL()` blob in `demoEvidenceRuntimeCache` — valid only for the current browser session. After page reload, the reference exists in the store but the underlying blob is gone.

4. **Multi-signer chain absent**: The implementation does not chain signers — no task is created for the second signer using the same PDF. Each signing attempt works on the form template, not the accumulated signed artifact.

5. **No regression test**: Each fix pass edited UI behavior without validating that the artifact written during signing was the artifact retrieved afterward.

---

## 5. Exact Files and Components Involved

| File | Role |
|------|------|
| `src/policy/components/FormSignatureFlow.tsx` | Orchestrates the signing flow; writes artifact reference on completion |
| `src/policy/evidence/demoEvidenceRuntimeCache.ts` | In-memory artifact cache; not persisted; lost on refresh |
| `src/policy/evidence/storageMode.ts` | Controls storage backend; gates demo vs. real storage |
| `regulatoryExecutionStore` (`reg-execution-v2`) | `localStorage`-backed store; holds metadata but not artifact blobs |
| `WorkflowExecutionPanel.tsx` | Calls `appendTaskAuditEvent` without writing `targetKind`/`targetId` |
| Audit trail / Evidence Center component | Renders links using `artifactId`; uses a different ID than what was written |
| `AuditModePage.tsx` | Has `artifactRouteForAuditEntry` function; only renders links when `targetId` non-null |

---

## 6. Current Suspected Root Cause

Post-signature action handlers (Download, Print, Open) are resolving to the live form template render path rather than retrieving the stored signed artifact. This is caused by:

1. The action handler calling a form-render function instead of a stored-artifact-retrieval function
2. The `artifactId` referenced in the action handler not matching the `artifactId` written during the signing completion event
3. `appendTaskAuditEvent` in `WorkflowExecutionPanel.tsx` passing `formInstanceId` inside the `after` object, not as top-level `targetKind: 'form_instance'` / `targetId: formInstanceId` — confirmed in transcript `3cf17f83` assistant analysis

---

## 7. Validation That Was Claimed

- Signing flow was reported as "working" in prior sessions
- UI rendering of signature confirmation screen was confirmed visually
- "eCIgn Multi-Signer PDF Chain and CMS Defensibility Plan" implementation was declared initiated

---

## 8. Validation That Was Missing

- No test of clicking "Download PDF" after signing and confirming the file contains the signed form content (not the blank template)
- No check that the `artifactId` written during signing matches the `artifactId` used in Evidence Center links
- No test of artifact retrieval after page reload
- No test of the Print route opening the signed artifact vs. the live template
- No test of second signer receiving a task and accessing the same PDF
- No Playwright or browser evidence documenting the complete signing-to-download flow

---

## 9. Acceptance Criteria for Future Fix

- [ ] Deterministic filename convention defined and enforced: `{formId}_{formInstanceId}_{eventId}_{signedAt}_SIGNED.pdf`
- [ ] After completing a signature flow, the `artifactId` written to the evidence store is logged and confirmed
- [ ] "Download PDF" retrieves the stored signed PDF, not the form template HTML
- [ ] "Print" action sends the stored signed PDF content to the print dialog
- [ ] "Open Artifact" navigates to the stored artifact using the correct `artifactId`
- [ ] Evidence Center audit trail links resolve to the same `artifactId` written during signing
- [ ] `appendTaskAuditEvent` writes `targetKind: 'form_instance'` and `targetId: formInstanceId` at the top level
- [ ] Second signer receives a task; the task references the same PDF written by the first signer
- [ ] All of the above confirmed in-browser after a hard page refresh (no dependency on in-memory object URLs)
- [ ] Test performed with at least one real form instance signed end-to-end in the deployed environment
- [ ] Evidence: screenshot of PDF download containing signed content; screenshot of Evidence Center row linking to same file

---

## 10. Priority

**P0** — Directly blocks CMS defensibility claims. Signed documents that cannot be retrieved are worthless as compliance evidence. This is a legal and regulatory risk, not only a UX issue.
