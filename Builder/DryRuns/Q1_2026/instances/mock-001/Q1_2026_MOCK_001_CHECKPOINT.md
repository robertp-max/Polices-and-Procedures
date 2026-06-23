# Q1 2026 MOCK-001 Checkpoint

**Status:** STOPPED — checkpoint only. No further execution on this instance.

---

## 1. Run Identity

| Field | Value |
|-------|-------|
| **dryRunId** | `q1-2026` |
| **dryRunInstanceId** | `mock-001` |
| **dryRunInstanceLabel** | Q1 2026 Mock 001 |
| **Local instance path** | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\Builder\DryRuns\Q1_2026\instances\mock-001` |
| **Drive root folder ID** | `1WyXbLMYVrYT3dLvdPQisiqLPE_F5Ig57` |
| **Drive root folder URL** | https://drive.google.com/drive/folders/1WyXbLMYVrYT3dLvdPQisiqLPE_F5Ig57 |
| **Drive path** | `Home_Health_CES_Evidence/01_CES/Evidence/2026/Q1/mock-001/` |
| **Date/time completed** | `2026-06-19T20:04:42.858Z` |
| **Branch** | `fix/auth-cognito-new-password-required-flow` |
| **Build result** | **PASS** (`npm run build` — `tsc -b && vite build`) |

---

## 2. What Succeeded

- **mock-001 did not exist before run** — verified locally and in Drive (`Q1/mock-001` absent prior to creation).
- **Q1 seed validated** — combined mock clinical universe passed consistency checks.
- **36 patients / 32 clinicians / 68 SVG profile images** — counts match expected seed values.
- **58 Q1 events discovered** — Jan 1 through Mar 31, 2026 (`event-discovery.json`).
- **Drive `Q1/mock-001` tree created** — `January/`, `February/`, `March/`, `_run-manifest/`, per-event folders under each month.
- **174 real Drive uploads** — all entries in `drive-upload-manifest.json` carry live `driveFileId` values.
- **175 Brad-prepared drafts** — regulatory event drafts plus disciplinary and perfect-control artifacts (`brad-prepared-packet-manifest.json`).
- **No fake Drive IDs** — every upload returned a real Google Drive file ID.
- **No PHI** — mock identities only (`.example.test`, `MOCK-*` IDs, synthetic addresses/phones).
- **No duplicate Calendar events** — canonical calendar events preserved; no new per-mock duplicate events created.
- **Wrong-role signer block verified with HTTP 403** — DON attempted governance packet sign on `governance_packet_review-20260108-01`; blocked: *"Signer lacks required governance authority domain."*
- **Rowan Ellis perfect-control artifact created** — `perfect-control-rowan-ellis.html` (MOCK-STAFF-0023).
- **Marisol Vega disciplinary draft created** — `disciplinary-marisol-vega-mock-001.html` (MOCK-STAFF-0024, 5 offenses).
- **June QAPI evidence untouched** — no writes to June 2026 acceptance/QAPI run artifacts.
- **January seed untouched** — source seed read-only; instance uses snapshots only.

---

## 3. Known Limitations

- Evidence was grouped mostly by **workflow/audit category** instead of fully **event-centered** folder layouts (only `01_brad_drafts` populated; review/signed/supporting/audit subfolders not yet used per event).
- Generated documents were **basic Brad-draft HTML shells** and did not fully use the real form renderer / `FORMS_DATASET` / `buildFormContent` print pipeline.
- **57/58 Q1 events lack `CES_EVENT_ENRICHMENTS`**, so completion stayed at 0% or partial where enrichment was absent (`completion-summary.json`).
- **Patient-linked OASIS/POC lifecycle packets** (SOC, ROC, RECERT, POC per patient) were not fully generated yet.
- **HHA/CNA/LVN wrong-role blocking for OASIS/POC** needs hardening — governance-domain mismatch blocks correctly; clinical-role OASIS blocks need stronger rules.
- **11 unresolved form IDs remain:**
  - `OP-FM-040`, `OP-FM-041`, `OP-FM-042`
  - `OP-FM-050`, `OP-FM-051`, `OP-FM-052`, `OP-FM-053`, `OP-FM-054`
  - `CL-FM-060`, `CL-FM-061`, `CL-FM-062`

---

## 4. Required Next Run Direction for mock-002

- **Do not overwrite mock-001.** Use **`mock-002`** for the next instance.
- **Group Drive folders by `month/eventId`**, not workflow category alone.
- For **each event**, create all five subfolders:
  - `01_brad_drafts`
  - `02_human_review`
  - `03_signed_packages`
  - `04_supporting_evidence`
  - `05_audit_exports`
- Use **actual Care Indeed forms** and the **form print/render pipeline** wherever form IDs exist in `FORMS_DATASET`.
- **Resolve form aliases** (`FRM-*` → canonical `*-FM-*`) before generating evidence.
- **Add or map `CES_EVENT_ENRICHMENTS`** for Q1 events before expecting completion percentages.
- Generate **patient-linked OASIS SOC / ROC / RECERT / POC packets** using the Q1 patient registry and defect map.
- Keep **Brad-prepared draft** and **human review/signature** boundaries — Brad does not sign or certify.
- Preserve **mock/no-PHI safety banners** on every generated artifact and metadata object.

---

## 5. Files / Runtime Written

### New local files and folders

**Orchestrator (uncommitted):**

- `scripts/runQ1Mock001DryRun.ts`

**Instance folder:** `Builder/DryRuns/Q1_2026/instances/mock-001/`

| File | Purpose |
|------|---------|
| `patient-registry.snapshot.json` | Frozen seed copy |
| `clinician-registry.snapshot.json` | Frozen seed copy |
| `assignment-matrix.snapshot.json` | Frozen seed copy |
| `defect-map.snapshot.json` | Frozen seed copy |
| `workflow-trigger-map.snapshot.json` | Frozen seed copy |
| `clinician-performance-map.snapshot.json` | Frozen seed copy |
| `event-discovery.json` | 58 Q1 events |
| `drive-instance-root.json` | Drive root folder pointer |
| `brad-prepared-packet-manifest.json` | 175 draft records |
| `drive-upload-manifest.json` | 174 Drive upload records |
| `calendar-sync-manifest.json` | Calendar sync attempts/results |
| `ecign-signature-manifest.json` | eCign instances + wrong-role test |
| `completion-summary.json` | Per-event completion state |
| `q1-2026-mock-001-manifest.json` | Machine-readable master manifest |
| `Q1_2026_MOCK_001_SUMMARY.md` | Human summary |
| `Q1_2026_MOCK_001_CHECKPOINT.md` | This checkpoint |

### Drive manifest files (local pointers)

- `drive-instance-root.json`
- `drive-upload-manifest.json`
- `brad-prepared-packet-manifest.json`

### `.cache/ces-metadata/evidence/` writes

- **59** event evidence pointer files (58 Q1 events + related dry-run entries).
- Pointer-only metadata — no file bytes, no `localDataUrl` / `base64`.

### eCign append-only stores touched

Written via backend `ecignStore` API only (no hand-edited JSONL). Cumulative line counts at checkpoint time:

| Store | Lines (cumulative) |
|-------|-------------------|
| `server/ecign/data/form_instances.jsonl` | 371 |
| `server/ecign/data/signatures.jsonl` | 54 |
| `server/ecign/data/audit_events.jsonl` | 310 |
| `server/ecign/data/consents.jsonl` | 47 |
| `server/ecign/data/document_versions.jsonl` | 98 |

### Re-run command and warning

```powershell
cd "C:\AI\Git\training\HomeHealth\Policies_and_Procedures"
npx tsx --tsconfig tsconfig.app.json scripts/runQ1Mock001DryRun.ts
```

**Warning:** Re-running against **mock-001 will fail** by design — the instance folder and Drive `mock-001` tree already exist. Use **mock-002** for the next execution.

---

## 6. Final Stop Confirmation

| Rule | Status |
|------|--------|
| No commits | ✓ |
| No pushes | ✓ |
| No further execution after this checkpoint | ✓ |
| No additional Drive uploads | ✓ |
| No Calendar patches | ✓ |
| No new eCign signatures | ✓ |
| No completion state modifications | ✓ |
| Ready to switch focus to UI work | ✓ |

---

*Checkpoint written: 2026-06-19. mock-001 is frozen. Proceed with mock-002 or UI work when ready.*