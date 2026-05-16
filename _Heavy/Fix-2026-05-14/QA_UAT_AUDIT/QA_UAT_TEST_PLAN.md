# QA/UAT Test Plan — Manual Browser + Automated Tests

**Date:** 2026-05-14  
**Status:** Ready for execution after the current audit. All tests are designed to be run against a clean `npm run dev` instance with demo auth bypass.

---

## Prerequisites (for every tester)

1. Fresh clone or clean working tree on `main`.
2. `cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures`
3. Create `.env` (or use existing) with:
   ```
   VITE_LOCAL_DEMO_AUTH_BYPASS=true
   ```
4. `npm install`
5. `npm run dev` (this runs both web + api via concurrently)
6. Open `http://localhost:5173` (or the Vite port shown).
7. Login with any demo user (e.g., `robertp@careindeed.com` / any password) — Super Admin role is recommended for full visibility.
8. **Important:** Use Incognito or a fresh browser profile for each major test flow to avoid localStorage pollution.

---

## Test 1: Vercel Static Demo Entry Readiness

**Goal:** Verify the app can be served as a pure static site (no backend) and still allow meaningful demo interaction.

**Steps:**
1. Build the static bundle: `npm run build`
2. Serve the `dist/` folder with any static server (e.g., `npx serve dist` or Vercel preview).
3. Open the static site (no `localhost:8787` API).
4. Attempt login using the demo bypass path.
5. Navigate to:
   - Dashboard
   - Library (open any policy)
   - CES Board (if visible)
   - Evidence Center
   - Forms Library
6. Attempt to open a form (expect limited functionality — no real signing or evidence upload).

**Expected:**
- App shell loads without 404 or module errors.
- Demo auth works.
- Policy library and read-only views function.
- Any feature requiring `/api/` shows graceful degradation or demo placeholder.

**Pass Criteria:** No console errors on initial load; core read-only navigation works.

**Runtime Proof Required:** Yes (static serve + browser).

---

## Test 2: DON Assistant → DON Two-Signer CES Workflow (Critical)

**Goal:** Validate the full "DON Assistant completes form → DON verifies and signs" flow produces a **single canonical artifact** and correct audit trail.

**Preconditions:**
- A regulatory event exists that requires a form with two signers (DON Assistant + DON).
- Event has a requirement of type `FORM_COMPLETION` + `SIGNATURE_REQUIRED`.

**Steps:**
1. Login as **DON Assistant**.
2. Go to CES Board or the specific event in WorkflowExecutionPanel.
3. Locate the form requirement row.
4. Click **"Complete Form"**.
5. Fill the form (at least one field on each page if multi-page).
6. Save draft if available, then mark complete.
7. **Switch role** to **DON** (use role switcher or logout/login as DON user).
8. Return to the same event.
9. The requirement should now show a signer task for DON (or "Verify Signature").
10. Click the signature / verify action.
11. In the eCign signer workspace:
    - Review the form (should be read-only or pre-filled from previous completion).
    - Add signature.
    - Finalize.
12. After finalization, immediately:
    - Open **Evidence Center** for the event.
    - Open **Audit Mode** for the event.
    - Open **Artifact Viewer** via any generated links.

**Critical Assertions (must all be true):**
- Only **one** `signed_package` artifact exists for the `canonicalFormInstanceId` (no v1 + v2 detached records).
- Evidence Center shows the artifact with **both** signer names/roles.
- Audit Trail contains entries for both `FORM_COMPLETED` (DON Assistant) and `SIGNED_PACKAGE_CREATED` / `ARTIFACT_LOCKED` (DON).
- All audit entries for this form instance use the **same** `targetId` / artifactId at the top level (not buried in `after`).
- Clicking any "Open Signed Artifact", "Download", or "Print" from Evidence / Audit resolves to the **same** artifact content + certificate showing both signers.
- The `form_instance_id` in the URL throughout the flow is stable and matches the one stored in the evidence record.

**Pass Criteria:** Single artifactId chain from first completion through final signature. No duplicate or orphaned evidence records.

**Runtime Proof Required:** Yes — this is the highest-risk flow.

---

## Test 3: eCign Download / Print / Open Signed Artifact Consistency

**Goal:** Prove that Download PDF, Print Document, Open Signed Artifact, Certificate view, Evidence Center, and Audit Trail all resolve to the identical stored artifact.

**Steps:**
1. Complete Test 2 (or use any already-signed form instance).
2. From Evidence Center, click the signed artifact row:
   - Click **Download**
   - Click **Print Document**
   - Click **Open Signed Artifact** (should go to `/artifacts/...`)
3. From Audit Trail, click any "View Artifact" link for the same signing event.
4. From the Artifact Viewer page itself, use the Download / Print / Certificate actions.
5. Compare the downloaded file hash (or content) across all paths.
6. Verify the certificate embedded in the artifact shows the correct signer sequence (DON Assistant first, DON second).

**Expected:**
- All paths produce byte-identical (or structurally identical) artifacts.
- Filename follows a consistent pattern (recommend adopting `{formId}_{formInstanceId}_{eventId}_{timestamp}_SIGNED.html`).
- No "artifact not found" or stale content.

**Pass Criteria:** Every action resolves to the same `artifactId` and the same content.

**Runtime Proof Required:** Yes.

---

## Test 4: Evidence Center Refresh + Artifact Retrieval

**Goal:** After signing and after browser refresh, Evidence Center still shows the correct latest artifact and links work.

**Steps:**
1. Complete a signed form instance (single or multi-signer).
2. Immediately refresh the Evidence Center page (or the specific event evidence tab).
3. Click every "View Artifact", "Download", and "Open in Artifact Viewer" link.
4. Close the browser tab completely, reopen, login again, navigate back to Evidence Center.
5. Repeat the clicks.

**Expected:** No data loss, no broken links, same artifactId as before refresh.

**Pass Criteria:** Evidence persists across refresh and session restart (localStorage or in-memory store hydration).

**Runtime Proof Required:** Yes.

---

## Test 5: Audit Trail Link Test

**Goal:** Every audit entry that references a form or artifact has a working "View Artifact" or "Open Form" link that resolves correctly.

**Steps:**
1. Perform any form completion + signature flow.
2. Open Audit Mode for the event.
3. For every row that mentions the form or signed package:
   - Verify `targetKind` and `targetId` are present at the top level of the audit record (not only inside `after`).
   - Click the generated link (if present).
   - Confirm it lands on the correct Artifact Viewer or Form Instance view.
4. Export the audit packet (if the button exists) and verify the exported JSON contains usable IDs.

**Pass Criteria:** No audit rows with missing top-level `targetKind`/`targetId` for form/evidence actions. All links resolve.

**Runtime Proof Required:** Yes.

---

## Test 6: Form URL Hydration Test (`?form_instance_id`)

**Goal:** Opening a form via a URL containing `?form_instance_id=XXX&event_id=YYY` restores the exact saved state (not template mode).

**Steps:**
1. As DON Assistant, start a form via the proper CES requirement link (this should generate a `form_instance_id`).
2. Fill several fields across pages.
3. Copy the full URL from the browser (including `?form_instance_id=...`).
4. Open a new incognito window, login as the same or DON user.
5. Paste the URL directly.
6. Verify the form loads with the previously entered values (not blank template).

**Expected:** Form hydrates from the instance ID. If DON Assistant filled it, DON sees the filled version in read-only or signer mode.

**Pass Criteria:** No reversion to template mode when `form_instance_id` is present.

**Runtime Proof Required:** Yes.

---

## Test 7: Policy Print / Download Design Test (GV-GB-001 Target)

**Goal:** Policy print view, browser print preview, and downloaded PDF for GV-GB-001 match the uploaded master PDF design (branding, layout, margins, logo placement). eCign signed artifact print must remain visually separate.

**Steps:**
1. Go to Policy Library.
2. Locate and open policy **GV-GB-001** (or the designated target policy that has a known good PDF).
3. From the detail view, trigger:
   - "Print View" (in-app print-optimized page)
   - Browser Print (Ctrl+P) preview
   - Download PDF
4. Compare the three outputs visually and structurally against the original uploaded GV-GB-001 PDF.
5. Repeat the same actions from within a CES eCign signed form context (different policy or form).
6. Confirm no logo/branding bleed between the two print systems.

**Critical:**
- Do **not** modify the card view / library card design.
- Policy print must be high-fidelity to the source PDF.
- eCign print may have different (signer certificate, attestation) elements.

**Pass Criteria:** GV-GB-001 print matches the master design within acceptable tolerance (no major layout shift, logo present and correctly placed, no overflow).

**Runtime Proof Required:** Yes (visual comparison).

---

## Test 8: Calendar / Sprint / Kanban / Gantt Sync Test

**Goal:** Tasks created or updated in CES appear correctly and with correct status in the PM calendar views (and vice versa).

**Steps:**
1. Create or locate a regulatory event with required forms and signer tasks.
2. Complete the form as DON Assistant.
3. Switch to DON and sign.
4. Immediately navigate to:
   - Master Calendar (month + Gantt)
   - Sprint Plan / Kanban board for the relevant sprint
   - My Tasks (PM view)
5. Verify the task appears with the correct status ("Completed", "Signed", etc.) and correct due date.
6. Change a due date or reassign in the PM view.
7. Return to CES Board and verify the change is reflected.
8. Refresh the browser and re-check all four views.

**Expected:** Unified task projection is consistent. No duplicate tasks, no missing signer tasks, no status desync.

**Pass Criteria:** All four views (Calendar, Sprint/Kanban, Gantt, My Tasks) show the same task state after CES actions and after refresh.

**Runtime Proof Required:** Yes.

---

## Test 9: Trainer / Onboarding Permission Boundary Test

**Goal:** Confirm that a user with the "Onboarding" (Trainer) role cannot access admin-only surfaces even if the feature matrix grants limited rights.

**Steps:**
1. Login as the Onboarding demo user (`onboarding@careindeed.com` or equivalent from the matrix script).
2. Attempt to navigate to (or directly visit URLs for):
   - `/admin/users` or user provisioning UI
   - Admin permissions panel
   - System Documentation page
   - Hubstaff staging
   - BRAD proposal creation (if gated)
   - Any CES admin / evidence override functions
3. Attempt to perform a privileged action (e.g., publish policy, export full audit, replay events).
4. Verify the UI shows appropriate "insufficient permissions" messaging or hides the controls.

**Expected (from `verify-feature-access.mjs`):**
- Onboarding can see journey, basic CES, evidence, library.
- Onboarding **cannot** see admin.users, admin.permissions, systemDocumentation, hubstaff, brad (in some configs), or perform publish / override / replay.

**Pass Criteria:** Trainer is correctly sandboxed. No privilege escalation possible via URL or UI.

**Runtime Proof Required:** Yes.

---

## Automated Tests (to be run in CI or locally)

| Script | Command | What It Validates | Current Status (this audit) |
|--------|---------|-------------------|-----------------------------|
| TypeScript | `npx tsc -b --noEmit` | No type errors | **PASSED** |
| Feature Matrix | `npx tsx scripts/verify-feature-access.mjs` | Permission boundaries for all roles including Trainer | **PASSED** |
| Task Identity | `npm run verify:task-identity` | CES task canonical IDs and deduping | Not run in this session |
| Unified Projection | `npm run verify:pm-unified` | PM + CES task sync | Not run |
| Alignment | `npm run verify:alignment` | Event/task/requirement alignment | Not run |
| Evidence Phases | `npm run check:evidence-phase*` (multiple) | Evidence hierarchy correctness | Not run |

**Recommendation:** Add a `npm run qa:smoke` script that runs the typecheck + feature matrix + the three most critical verify scripts.

---

## Test Execution Log Template

When executing these tests, record results in the following format for each test:

```
Test: <Test # and Name>
Date/Time: ...
Tester: ...
Browser: ...
Result: PASS / FAIL / BLOCKED
Evidence: (screenshots, console logs, network trace)
Notes: ...
```

Attach all artifacts to the `_Heavy/Fix-2026-05-14/QA_UAT_AUDIT/` folder (they will be git-ignored).

---

**End of Test Plan**
