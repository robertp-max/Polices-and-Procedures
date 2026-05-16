# QA/UAT Test Execution Log Template

**Purpose:** Standardized template for recording results of the manual browser tests defined in `QA_UAT_TEST_PLAN.md`.

**Location:** All logs should be saved inside this folder: `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/execution-logs/`

---

## Test Execution Header (Copy for every run)

```
Test ID: CES-002
Test Name: DON Assistant completes form → DON signs as second signer (artifact identity & audit trail)
Date / Time: YYYY-MM-DD HH:MM
Tester: [Name]
Environment: npm run dev (localhost)
Browser: [Chrome / Edge / Firefox] + Version
Role Switch Method: [Logout/Login | Role Switcher]
Build / Patch Applied: [None | Patch 2026-05-14-P0-01 | Other]
Pre-test State: Clean database / seeded event?
```

---

## Step-by-Step Execution Log

**Step 1: Login as DON Assistant**
- Time:
- User:
- Event ID used:
- Form ID used:
- Notes / Issues:

**Step 2: Complete the Form**
- Clicked "Complete Form" at:
- `form_instance_id` captured from URL:
- Fields filled (list 3+):
- Time of "Mark as Complete":
- Evidence Center after completion (screenshot / artifact IDs):
- Audit Trail `FORM_COMPLETED` entityId:

**Step 3: Switch to DON**
- Switch method:
- Time:
- Re-opened event:
- Did the signer task for DON appear with the same `form_instance_id`? (Yes / No / Partial)
- Notes:

**Step 4: DON Signs**
- Entered eCign workspace:
- Could see previous form data? (Yes / No / Partial)
- Finalized signature at:
- New `signedPackageArtifactId`:
- Evidence Center after signing — number of `signed_package` records for this `canonicalFormInstanceId`:
- List of all artifact IDs for this formInstanceId:

**Step 5: Audit Trail Verification (Critical)**
- Open Audit Mode for the event.
- Locate the two `SIGNED_PACKAGE_CREATED` / `ARTIFACT_LOCKED` events (one from each signer).
- For each:
  - Action:
  - entityId (top level):
  - targetKind present? (Yes/No):
  - targetId present? (Yes/No):
  - canonicalFormInstanceId visible in after? (Yes/No):
  - "View Artifact" link works? (Yes/No — what did it resolve to?)

**Step 6: Evidence Center & Artifact Viewer**
- Evidence Center shows how many signed artifacts for this formInstanceId?
- Clicking from different places resolves to the same content? (Yes/No)
- Any "orphan" or duplicate records visible?

**Step 7: Post-Test Observations**
- Any console errors?
- Any unexpected behavior?
- Overall reproduction of P0-01 bug? (Yes / No / Partial)

---

## Pass / Fail Determination

**Current State (before fix) Expected Result:**
- Two different `EV-` artifact IDs for the same `canonicalFormInstanceId`
- Audit links from first signer may point to stale or broken records
- No `EVIDENCE_SUPERSEDED` event
- No `supersedesEvidenceId` linkage on the evidence docs

**After Correct Fix Applied Expected Result:**
- Single logical artifact (or proper supersede chain with version + linkage)
- Both audit events point to the same (or correctly linked) `entityId`
- Clean top-level `targetKind` + `targetId` on audit events
- Evidence Center shows coherent history

**Test Result:** [ PASS / FAIL / BLOCKED / PARTIAL ]

**Evidence Attached:**
- Screenshots: [list filenames]
- Exported audit JSON (if possible):
- Console log excerpt:

**Tester Signature:** ___________________________   Date: ___________

---

## Template for Other Critical Tests

Use the same header format for:
- CES-001: Vercel Static Demo Entry
- CES-003: eCign Download/Print/Open Artifact Consistency
- AUD-001: Audit Trail Link Test
- FORM-001: Form URL Hydration (`?form_instance_id`)
- PRINT-001: Policy Print vs GV-GB-001 Target Design
- CAL-001: Calendar/Sprint/Kanban/Gantt Sync
- PERM-001: Trainer/Onboarding Permission Boundaries

---

**This template is pre-approved for use in all future QA/UAT manual testing sessions.**