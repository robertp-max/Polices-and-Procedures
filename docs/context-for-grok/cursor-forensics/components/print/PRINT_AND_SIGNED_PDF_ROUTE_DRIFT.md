# Print and Signed PDF Route Drift

**Component**: Print Routes / Signed PDF Delivery  
**Severity**: P1 — document output broken; compliance audit trail incomplete  
**Status**: Unresolved as of 2026-05-14  

---

## 1. Symptoms Reported by User

- "Print" action in a signed form context opens the wrong content, or opens the live form template instead of the finalized signed document
- Print route navigates to an unexpected component or produces a blank print dialog
- Signed PDF download links resolve to incorrect or empty content
- No visible error message when route targets a stale or wrong component

**CES UAT evidence (transcript `3cf17f83`, May 10–11, 2026):**

From DEFECT-Q2-005 screenshot analysis (`07-01-no-sign-button.png`):
- Form shows "Awaiting Signature" banner but the form renders in template/read-only mode
- Print, Save as Evidence, and Download buttons are visible in the form header
- However, no Playwright confirmation that these buttons produce correct output

The UAT confirmed Print button is **visually present** but did not validate whether clicking Print produces the signed PDF vs. a blank page or template render. This remains unvalidated.

---

## 2. Prior Attempted Fixes

- Print route was registered during an earlier sprint
- General form component refactors may have moved the component targeted by the print route without updating the route definition
- No dedicated print route audit was performed
- Print button visual presence was used as evidence of "working print" — **CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION**

---

## 3. Why Prior Fixes Likely Failed

Route drift occurs when a component is renamed, moved, or replaced during a refactor, but the route definition referencing it is not updated in the same change. React Router (or the equivalent routing layer) silently fails to match the old path to the new component, resulting in either:

- A blank render (route matched but component returns nothing)
- A fallback render (route missed, default/404 component rendered)
- The old component rendered (if the old file was not deleted, just superseded)

Print routes are especially vulnerable because they are:
1. Defined separately from the main navigation routes
2. Only exercised through specific user actions (not regular navigation)
3. Often passed an `artifactId` parameter that itself may be broken (see ECIGN_SIGNED_ARTIFACT_FAILURE.md)

**Compounding dependency**: The print route depends on the `artifactId` written during the signing flow. If that `artifactId` is incorrect (see ECIGN) or if the artifact blob has expired (in-memory), the print route will render empty content with no error — even if the route itself resolves to the correct component.

This means the print route has **two independent failure points**:
1. Route target may have drifted to a stale or wrong component
2. Even with the correct route, the artifact content may be unavailable (see EVIDENCE_CENTER_METADATA_ONLY.md)

---

## 4. Exact Files and Components Involved

| File | Role |
|------|------|
| Router configuration file(s) | Defines print and signed-PDF route paths and their target components |
| Print route component | Renders content for printing; should retrieve and display the stored signed artifact |
| `FormSignatureFlow.tsx` | Initiates the post-signature action that triggers the print route |
| Signed artifact store / evidence store | Source of artifact content that the print route should retrieve |
| `demoEvidenceRuntimeCache.ts` | In-memory cache; if print route depends on object URL from here, print breaks after reload |

---

## 5. Current Suspected Root Cause

The print route target component has drifted from the route definition during a prior refactor. The route still resolves (no 404) but renders either the wrong component or an empty component. Because the signed PDF delivery depends on both:
1. Correct route resolution, AND
2. Correct artifact ID (which is broken per ECIGN_SIGNED_ARTIFACT_FAILURE.md)

...the print path has two independent failure points. Even fixing the route drift alone will not produce a working print if the artifact retrieval is also broken.

---

## 6. Validation That Was Claimed

- Form signature flow was confirmed to reach the confirmation screen
- Print button was confirmed to be visually present in the UI

---

## 7. Validation That Was Missing

- No test of actually clicking "Print" and confirming the print dialog opens with signed content
- No inspection of which component the print route resolves to in the current build
- No test of the signed PDF download link producing a valid, openable file
- No cross-check between the `artifactId` passed to the print route and the `artifactId` in the signed artifact store
- No test after hard page refresh (to rule out in-memory artifact dependency)

---

## 8. Acceptance Criteria for Future Fix

- [ ] "Print" action after signing opens the browser print dialog with the signed form content (not a blank page or the live template)
- [ ] The print route resolves to the correct component in the current build (confirmed by inspecting React DevTools or route logs)
- [ ] The `artifactId` passed to the print route matches the `artifactId` written during signing
- [ ] Signed PDF download produces an openable file containing the signed form content
- [ ] Both tests pass after a hard page refresh (no dependency on in-memory object URLs)
- [ ] No silent failures: if the artifact is unavailable, a clear error message is shown rather than a blank page
- [ ] This fix is tested **after** ECIGN_SIGNED_ARTIFACT_FAILURE is resolved — print cannot pass if artifact storage is broken

---

## 9. Fix Order Dependency

**Do not attempt to fix print route in isolation.** The print route fix depends on:
1. eCIgn signed artifact fix (artifact must be stored and retrievable)
2. Evidence Center persistence fix (artifact must survive page reload)

Fix order: ECIGN → Evidence → Print

---

## 10. Priority

**P1** — Print and download are the two mechanisms by which signed compliance forms are extracted from the system. If both are broken, signed forms cannot be archived, shared, or submitted to regulators. This is a CMS documentation risk.
