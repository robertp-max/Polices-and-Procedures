# POLICY VIEWER CONSOLIDATION WITH DELETION — FINAL REPORT

**Date:** 2026-05-14
**Execution Mode:** LOCKED — POLICY VIEWER CONSOLIDATION WITH DELETION
**Canonical Standard:** PolicyDetailPage.tsx (general) + GVGBDetailView.tsx (GV-GB-001 specimen only)
**Status:** Analysis complete, proof gathered, verification commands executed. Deletions identified. Stopped before commit/push/deploy.

---

## 1. All Routes/Imports/Usages Identified (Comprehensive Search)

### Files with Active Usages (Retained)

**SharedPolicyDetailView.tsx**
- Imported/used by:
  - `src/policy/components/PolicyLibraryDocumentView.tsx` (wraps it as the rendering engine)
  - `src/policy/pages/AchcSurveyAlignmentPage.tsx`
  - `src/policy/pages/PolicyLifecyclePage.tsx`
  - `src/policy/pages/SurveyorPolicyViewerPage.tsx`
  - `src/policy/help/articles/master-controls.ts` (documentation reference only)

**PolicyLibraryDocumentView.tsx**
- Imported/used by:
  - `src/policy/pages/AchcSurveyAlignmentPage.tsx`
  - `src/policy/pages/PolicyLifecyclePage.tsx`
  - `src/policy/pages/SurveyorPolicyViewerPage.tsx`

These are **specialized ACHC/surveyor/lifecycle wrappers** and are retained as the "minimal specialized wrapper" per task rules. They no longer serve standard policy detail (LibraryPage and /library/:id now use canonical PolicyDetailPage).

### Files with Zero Active References (Deletion Candidates)

**GVPolicyDetailView.tsx**
- Only self-reference + comment in PolicyDetailPage.tsx (historical note).
- **Zero imports** from any active code.
- Proof: `find` + `grep` returned only its own file + one comment.

**CLPolicyDetailView.tsx**
- Only self-reference + comment in PolicyDetailPage.tsx.
- **Zero imports** from any active code.

**PolicyDetailModal.tsx**
- Only self-definition + one comment in PolicyDetailPage.tsx.
- **Zero active imports** or route usage.
- Was an old modal-based viewer, no longer wired anywhere.

**No other policy detail/viewer components** found with active standard usage.

---

## 2. Route Map — Replacements to Canonical

**Standard Policy Routes (Now Canonical)**
- `/library` → LibraryPage (cards navigate to canonical)
- `/library/:policyId` → PolicyDetailPage (canonical)
- `/policies/:policyId` → PolicyDetailPage (canonical)
- `/policies` → redirect to /library (deep-link safe)

**Specialized Routes (Minimal Wrapper Retained)**
- `/surveyor/policy/:policyId` → SurveyorPolicyViewerPage → PolicyLibraryDocumentView → SharedPolicyDetailView (ACHC/surveyor specialized only)
- `/policy-lifecycle/:policyId` → PolicyLifecyclePage → PolicyLibraryDocumentView → SharedPolicyDetailView (specialized)
- `/framework/achc-survey` (with policy drill) → AchcSurveyAlignmentPage → PolicyLibraryDocumentView → SharedPolicyDetailView (ACHC specialized overlays preserved)

**GV-GB-001 Specimen**
- Handled exclusively inside PolicyDetailPage.tsx special case → GVGBDetailView.tsx (canonical owner, untouched)

No standard policy route uses the old maroon viewers anymore.

---

## 3. Deletion Actions (Only Zero-Reference Files)

The following files were identified with **zero active imports/usages** after exhaustive search:

**Deleted:**
- `src/policy/pages/GVPolicyDetailView.tsx`
- `src/policy/pages/CLPolicyDetailView.tsx`
- `src/policy/components/PolicyDetailModal.tsx`

**Proof before deletion (as required):**
- `grep` and `find` commands across `src/` returned only self-references + one historical comment in PolicyDetailPage.tsx.
- No route in App.tsx references them.
- No component imports them.

**Retained (with justification):**
- `SharedPolicyDetailView.tsx` + `PolicyLibraryDocumentView.tsx`: Minimal specialized wrapper required for ACHC/surveyor/lifecycle modes. Per task, ACHC/surveyor may keep specialized overlays. These no longer power standard policy detail (maroon legacy eliminated from standard paths).
- `GVGBDetailView.tsx`: Canonical specimen owner (explicitly allowed).
- `PolicyDetailPage.tsx`: Canonical standard viewer.

**No new viewers/routes/components created.** All changes were reconnections to existing canonical `PolicyDetailPage`/`GVGBDetailView`.

---

## 4. Browser Validation Checklist (Completed)

- `/library/QA-PG-001` → Uses PolicyDetailPage (light canonical, no maroon)
- `/policies/QA-PG-001` → Uses PolicyDetailPage (light canonical)
- Library grid card click → Navigates to `/library/:id` (canonical)
- `/surveyor/policy/QA-PG-001` → Still uses specialized PolicyLibraryDocumentView/Shared (allowed for ACHC)
- `/policy-lifecycle/:id` and ACHC drill-down → Specialized wrapper retained
- `/print/GV-GB-001` → GVGBPrintDocument (canonical print, previously fixed)
- No maroon/dark red standard policy cards or tab bars observed on standard routes after consolidation.
- ACHC specialized surfaces retain their overlays but no longer leak the old maroon standard viewer into normal policy viewing.

---

## 5. Verification Commands Executed

```bash
npx tsc -b --noEmit          → exit 0 (clean)
npm run build                → exit 0 (successful)
npx tsx scripts/verify-feature-access.mjs → exit 0 (all checks passed, including policyLibrary.view)
```

---

## 6. Summary of Consolidation

- **Maroon legacy viewer eliminated** from all standard policy routes and Library list.
- Duplicate/orphan viewers removed.
- Standard policy experience unified under `PolicyDetailPage.tsx` + `GVGBDetailView.tsx` (GV-GB-001).
- ACHC/surveyor/lifecycle keep minimal specialized wrapper (PolicyLibraryDocumentView + SharedPolicyDetailView) as explicitly permitted.
- No maroon styling leaks into canonical policy detail.
- Deep-link compatibility preserved.
- No new components/routes/viewers created.
- No policy content, print renderers, forms, eCign, evidence, or other protected areas touched.

**Files Deleted:** 3 (GVPolicyDetailView, CLPolicyDetailView, PolicyDetailModal)
**Files Retained with Active Purpose:** PolicyDetailPage, GVGBDetailView, SharedPolicyDetailView (specialized only), PolicyLibraryDocumentView (specialized only)

---

**Execution stopped before commit/push/deploy as required.**

All safeguards followed. The maroon legacy policy viewer has been fully removed from standard surfaces.