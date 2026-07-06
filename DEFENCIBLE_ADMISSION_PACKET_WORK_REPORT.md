# DefenCIble — Patient Admission Packet Work Report

**Period:** 2026-06-30 → 2026-07-01
**Area:** DefenCIble "Create Packet" → Patient Admission Packet (Brad extraction + 63-page render + billing route)
**Test patient (UAT):** Esperanza "Espie" Milagros Reyes — Eval 7 ("Incomprehensibly Complex / Break the Administrator")

---

## 1. Goal

Make the DefenCIble **Create Packet** flow turn an uploaded clinical source into a **filled, page-faithful 63-page Patient Admission Packet** matching the blank 63-page master template, driven by verified (not invented) data.

---

## 2. Root-cause findings

| Symptom | Root cause | Status |
|---|---|---|
| Brad "outputs the same patient" on any PDF | Repo had **no PDF text extraction** — the studio only read 6 cover AcroForm fields | Fixed (Phase-1 extractor) |
| Patient address/phone bled into Care Indeed's §5-B disclosure block ("indefensible") | Ambiguous `address`/`phone` labels filled every table | Fixed (patient-scoped table fill) |
| Preview showed only ~2 pages / 51 pages, not 63 | Browser/studio **cannot paginate** the form template on-screen (browsers only paginate in print) | Fixed (server-side render) |
| 503 "renderer unavailable" | tsx/esbuild injects a `__name()` helper into `page.evaluate` functions that doesn't exist in the browser → `ReferenceError` | Fixed (string-eval shim) |
| Billing route showed "Pending Verification" despite a 100%/3-read Medi-Cal payer | Review screen used `selectedBillingRoute \|\| identified`, and the default was the truthy `'PENDING_VERIFICATION'` — masking Brad's identified route | Fixed (this session) |

---

## 3. Work completed

### 3.1 Source extraction pipeline (Brad) — 2026-06-30
- `server/pdfText.ts` — `extractPdf()` via `unpdf` + AcroForm via `pdf-lib` (with detached-ArrayBuffer copy fix).
- `server/sourceExtraction.ts` — Claude CLI reads the source **3× and reconciles by majority + confidence**; returns field map, `needsReview`, source→field snippets, conflicts. **Never invents** (null + REVIEW when absent). Requires `BRAD_PROVIDER=claude`.
- `server/sourcePipeline.ts` — `ingestSource()` classify → extract → 3× read → persist raw source + extraction sidecar. `TEMPLATE_FIELD_SPECS.admission` expanded from 10 → ~24 **grouped** fields (Patient / Admission-Physician / Diagnosis / Services / Payer-Billing / Representative-Legal / Emergency / Interpreter-Language / Advance Directives).
- Endpoint: `POST /api/calendar/intake/extract-source`.
- **Verified on Eval 7:** 19–20/24 fields at 3/3 agreement, correct nulls for absent fields (patient phone, SOC, physician fax, admitting clinician), conflicts surfaced, no invention.

### 3.2 Server-side 63-page render — 2026-06-30 → 07-01
- **`server/admissionPacketPdf.ts` (new)** — `renderAdmissionPdf(fields)` reads the 63-page form template `CareIndeed_Patient_Admission_Packet_Letter_Form_Logo.html`, launches Chromium, applies the `__name` shim, fills:
  - cover (`.cover-field` label→span),
  - body (`table.data-table`, **patient-scoped** so address/phone never bleed into agency disclosure blocks),
  - payer checkbox ☐→☑ + policy-id,
  - `.form-line` fields (language / representative relationship / legal authority),
  then renders with Playwright `preferCSSPageSize` → true 63 pages. Timeout-guarded.
- `server/htmlToPdf.ts` — added `htmlToPdfForced()` (bypasses the render gate).
- `server/routes/calendar.ts` — added `POST /intake/render-admission {fields}` → `{pdfBase64, pageCount, filled}` (503 if renderer unavailable).
- Client: `CalendarApi.renderAdmission(fields)`; driver `generatePacket` admission branch calls it and returns a `pdfUrl` preview (bypasses the studio entirely).
- **Verified:** live endpoint `POST /api/calendar/intake/render-admission` → **HTTP 200, pageCount 63, filled 27**; saved `output/Espie_admission_63page.pdf` (672 KB), independently re-counted at **63 pages**; address occurs only in patient blocks (disclosure leak clean).

### 3.3 End-to-end UI verification with Playwright — 2026-07-01
- Drove the **real running app** at `localhost:5173/evidence`: CREATE PACKET → Patient Admission Packet → Upload / Camera → uploaded the Eval 7 PDF → Confirm Selection → Brad 3× read → review screen.
- Captured screenshots at each step; confirmed the review page renders the grouped extracted fields correctly (name/DOB/MRN/address 100%, payer + policy id 100%, conflicts and REVIEW flags shown, correct nulls).

### 3.4 Billing-route handoff fix — 2026-07-01 (this session)
The payer was extracted correctly; the failure was the downstream **extracted payer → route suggestion → confirm step**.

- **`payerToRoute()`** made deterministic + exported; Medi-Cal branch extended to include `HPSM`, `Health Plan of San Mateo`, and `CCS transition / whole child` (all map to `MEDI_CAL_OR_MEDICAID`). No LLM call — the payer text is already extracted.
- **Default state fixed:** `selectedBillingRoute` now starts empty (was `'PENDING_VERIFICATION'`, which masked Brad's route). A `bradRouteSuggestion` memo derives route + confidence + source evidence.
- **Review screen:** billing block is now a **read-only display** of Brad's suggestion ("Medi-Cal / Medicaid" + "Brad identified" badge) — not the source of truth.
- **Step 2 · Confirm Billing Route** rebuilt per spec: bold prominent guidance; **locked card grid** (Brad's card highlighted + "Brad identified" badge, others dimmed/disabled); **"Override selection"** unlocks single-select; **"Confirm & Continue"** (→ "Use selected route" in override mode).
- **Audit trail:** pure `buildBillingRouteConfirmation()` writes `{confirmedRouteId, confirmedRouteLabel, confirmedAt, confirmedBy?, overridden, originalSuggestedRouteId, originalSuggestedRouteLabel}`, surfaced on the Ready-to-Compile step. **Packet consumes only the confirmed route.**
- **Regression tests** — `src/v6/screens/evidence/billingRoute.test.ts`: exact Espie payer → `MEDI_CAL_OR_MEDICAID` (not Pending); all mapping families; confirm/override audit cases. **8/8 pass.**

---

## 4. Verification summary

| Check | Result |
|---|---|
| Brad 3× extraction on Eval 7 | Correct values + correct nulls, no invention |
| Direct render | **63 pages, 27 fields**, mis-map clean, `output/Espie_admission_63page.pdf` |
| Live endpoint `render-admission` | **HTTP 200, pageCount 63** |
| Billing-route regression tests | **8/8 pass** |
| Playwright real-UI drive-through | Review screen renders grouped verified fields correctly |
| `tsc -b` on the files changed here | **Clean** (Defensible2StudioLanding, billingRoute.test, admissionPacketPdf, driver) |

---

## 5. Known issues / honest gaps

- **Full `tsc -b` does NOT pass** because of a **pre-existing syntax error in `src/v6/screens/pageviews/CareIndeedOnboardingLMS.tsx`** (lines ~3771–3774). That file was already modified/broken in the working tree and is **unrelated to this work** — not introduced here, not fixed here. The repo will not do a clean full build until that file's syntax is repaired.
- **In-app click-through past "Confirm & Continue" to a rendered 63-page preview** was not machine-verified end-to-end in the browser; the endpoint it calls is proven at 63 pages and the driver is wired to it.

---

## 6. Files touched

**New**
- `server/admissionPacketPdf.ts`
- `src/v6/screens/evidence/billingRoute.test.ts`

**Edited**
- `server/htmlToPdf.ts`, `server/routes/calendar.ts`, `server/sourceExtraction.ts`, `server/sourcePipeline.ts`
- `src/policy/services/calendarApi.ts`
- `src/v6/screens/evidence/Defensible2StudioLanding.tsx`
- `src/v6/screens/evidence/alpha/defensibleAlphaDriver.ts`

**Constraints honored:** did not touch Brad extraction logic for the billing fix; did not loosen confidence thresholds; did not weaken manual review or PHI handling; user-facing name kept as "Brad" (Claude CLI is internal plumbing).
