# Handbook — Test Results

_Handbook plan §10. Status: **typecheck + integrity + live smoke verified; automated
persona/print suite not added**._

## Build-time / integrity

- **Ingestion integrity gate:** `handbook:projection:generate` re-verifies every
  source SHA-256 vs the manifest and **fails closed** on drift. Run result: 48
  sections parsed, **integrity ALL VERIFIED**.
- **Legacy PDF hash:** recomputed on the archived copy = `fc84d206…`, matches the
  manifest. **2026 package:** all 8 files match the manifest.
- **Logo scanner:** `handbook:verify:logo` → **PASS, 103 files, 0 findings** (no
  unapproved logo path / inline brand-mark SVG).
- **Journey-app typecheck** (`tsc --noEmit`): 0 errors in all new handbook code
  (reader, home, references, release-status, acknowledgment, history, lib, data,
  CareIndeedBrand, shell). Only the pre-existing Cloudflare worker/db ambient notes
  remain (handled by the vinext build).

## Live smoke (Browser pane, localhost:5190)

| Route | Result |
|---|---|
| `/journey/handbook` | Draft watermark, control card (CI-HR-HB-2026, 48 sections), quicklinks, disabled-ack notice, lifecycle map — render; console no errors |
| `/journey/handbook/section/contacts` | Native render: 1 table, 1 callout, 48-item TOC, 7 policy chips, owner "HR / Compliance / Operations"; **no raw-tag leak** |
| `/journey/handbook/references` | Policies 104 / Forms 52 / Authorities 25 (match manifest); 104/104 chips linked; no overflow |
| `/journey/handbook/release-status` | **BLOCKED** banner; 21 gates (all OPEN) + 8 unsigned approvals; no overflow |
| `/journey/handbook/acknowledgment` | Locked; submit + checkbox disabled |
| `/journey/handbook/history` | Retired-2022 tombstone with hash + do-not-distribute flags |

## Not yet run (remaining)

- Automated persona matrix (18 personas incl. reviewer/HR/counsel roles), headless
  multi-viewport (320–1600px, 200%), keyboard-only and screen-reader passes, and a
  rendered print/PDF check are pending sign-off (see ACCESSIBILITY_QA / RESPONSIVE_QA
  / PRINT_QA). The in-app Browser pane renders at a fixed desktop viewport, so true
  mobile-breakpoint verification needs a real-device/headless run.
