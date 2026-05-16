# Document design inventory report

**Repo:** `Policies_and_Procedures`  
**Date:** 2026-05-08  
**Scope:** `src/`, `server/`, `scripts/`, `Builder/`, `public/` — document-facing UI, print/PDF surfaces, brand tokens, duplicate markdown/table renderers, and design-reference artifacts.

**Approved light references (canonical intent, not runtime imports):**

- `Builder/Policies/FormsPrintLightDesign.html`
- `Builder/Policies/PolicyPrintDownloadDesignLight.html`
- `Builder/Policies/PolicyViewerDesignLight.html`
- `Builder/Policies/PolicyViewer_eCFRReferenceDesignLight.html`

## Legend — design family

| Family | Meaning |
|--------|---------|
| **APPROVED_LIGHT_DESIGN** | Aligns with approved light kit (teal `#007970`, orange `#C74600` / `#C74601`, neutrals `#1F1C1B` / `#524048` / `#E5E4E3`, paper `#FAFBF8`) or is an explicit approved reference file. |
| **LEGACY_GOLD_MUSTARD** | Gold/mustard (`#D4AF37`, `#FFC107`, `#B8860B`, Tailwind `ci-teal` aliased to gold, dark CI-ION shell) still present in code or config. |
| **ECIGN_CERTIFICATE_PACKET** | eCIgn signing UI + print/PDF packet HTML (navy/orange cert band, watermark footer, cloned DOM + injected `<style>`). |
| **FORM_VIEWER_PRINT** | Forms library viewer, print route, iframe print helper, form dataset styling. |
| **POLICY_VIEWER** | Policy library / detail / surveyor / lifecycle embed / GV specimen views. |
| **APPENDIX_PRINT** | Standalone appendix print routes (GV-GB-001 appendices). |
| **UNKNOWN_OR_DUPLICATE** | Prototype HTML, backups, trash, or alternate doc system not clearly one family. |

## Legend — usage

| Tag | Meaning |
|-----|---------|
| **ACTIVE** | Imported by app routes or other live modules. |
| **REFERENCED** | Not a route but imported from active code (e.g. `printForm`). |
| **ORPHAN** | No `import` from production `src/`; may still be useful as reference. |
| **ARCHIVE** | Under `Bin-(thrash)/` or obvious backup `.old` / `.backup`. |

## Legend — risk

| Level | Meaning |
|-------|---------|
| **HIGH** | User-visible path can ship wrong colors, wrong print layout, or fight global `@media print`. |
| **MEDIUM** | Duplicate patterns (GFM tables, meta grids) or partial overlap with canonical light. |
| **LOW** | Docs-only, demos, or clearly isolated. |

---

## 1. Route map (document / print surfaces)

| Route / entry | Component / file | Family |
|---------------|------------------|--------|
| `/library`, `/library/:policyId`, `/policies/:policyId` | `PolicyDetailPage` → `GVGBDetailView` (only `GV-GB-001`) or tabbed doc | Mixed: specimen **LEGACY_GOLD_MUSTARD** + rest **POLICY_VIEWER** / **APPROVED_LIGHT_DESIGN** |
| `/print/:policyId` | `PrintPage` | **APPROVED_LIGHT_DESIGN** (inline) + overlap with policy print tree |
| `/print/GV-GB-001` | `GVGBPrintDocument` | **LEGACY_GOLD_MUSTARD** (`TEAL = '#D4AF37'`) |
| `/print/GV-GB-001/appendix/:appendixId` | `GVGBAppendixPrint` | **LEGACY_GOLD_MUSTARD** + **APPENDIX_PRINT** |
| `/forms`, `/forms/:formId` | `FormsPage`, `FormViewer` | **FORM_VIEWER_PRINT** + **ECIGN_CERTIFICATE_PACKET** (post-sign) |
| `/forms/:formId/print` | `FormPrintView` | **FORM_VIEWER_PRINT** |
| `/surveyor/policy/:policyId` | `SurveyorPolicyViewerPage` → `PolicyLibraryDocumentView` | **POLICY_VIEWER** |
| `/policy-lifecycle` (View embed) | `PolicyLibraryDocumentView` | **POLICY_VIEWER** |
| `/framework/achc-survey` | `AchcSurveyAlignmentPage` + `PolicyLibraryDocumentView` | **POLICY_VIEWER** |
| `/journey/appendix-f` | `AppendixFPage` | **LEGACY_GOLD_MUSTARD** accents on journey chrome |
| `/artifacts/:artifactId` | `ArtifactViewerPage` | Not primary document design — **LOW** |
| `/viewer/:referenceId`, `/events/:referenceId`, `/tasks/:referenceId` | `GenericReferenceViewer` | **UNKNOWN_OR_DUPLICATE** / **LOW** |
| `/iadministrator` | `FormRenderer`, `RightPanelPreview`, etc. | **FORM_VIEWER_PRINT** + `window.print()` — **MEDIUM** |
| `/demo` | `DemoPage` | Demo — **LOW** |
| `/audit` | `AuditModePage` + `surveyPacket` HTML | Workflow audit print HTML — **UNKNOWN_OR_DUPLICATE** vs policy/forms DS |

**Lazy route definitions:** `src/App.tsx`.

---

## 2. File inventory

### 2A. Approved reference artifacts (not bundled)

| Path | Family | Usage | Affects | Risk | Next action |
|------|--------|-------|---------|------|-------------|
| `Builder/Policies/PolicyViewerDesignLight.html` | **APPROVED_LIGHT_DESIGN** | ORPHAN | Reference | LOW | **lock as canonical** |
| `Builder/Policies/PolicyPrintDownloadDesignLight.html` | **APPROVED_LIGHT_DESIGN** | ORPHAN | Reference | LOW | **lock as canonical** |
| `Builder/Policies/FormsPrintLightDesign.html` | **APPROVED_LIGHT_DESIGN** | ORPHAN | Reference | LOW | **lock as canonical** |
| `Builder/Policies/PolicyViewer_eCFRReferenceDesignLight.html` | **APPROVED_LIGHT_DESIGN** | ORPHAN | Reference | LOW | **lock as canonical** |

### 2B. Builder prototypes / duplicates

| Path | Family | Usage | Risk | Next action |
|------|--------|-------|------|-------------|
| `Builder/PolicyDetailView.html` | **APPROVED_LIGHT_DESIGN** (mostly) | ORPHAN | MEDIUM | **archive** or **needs review** vs TS |
| `Builder/FinalPolicylbrary.html` | **UNKNOWN_OR_DUPLICATE** | ORPHAN | LOW | **archive** |
| `Builder/FormsLibraryFindal.html` | **UNKNOWN_OR_DUPLICATE** | ORPHAN | LOW | **archive** |
| `Builder/GlassmorphicDesign.html` | **LEGACY_GOLD_MUSTARD** / dark | ORPHAN | LOW | **archive** |
| `Builder/TaxonomyCoverPage.html` | Mixed | ORPHAN | LOW | **archive** |
| `Builder/Policies/CIHHCBRANDKIT.HTML` | Brand | ORPHAN | LOW | **keep** |
| `Builder/Policies/ModalNav.html`, `OrgChart.html` | Misc | ORPHAN | LOW | **archive** |
| `Builder/Policies/correctdesign-and-errors/*` | QA assets | ORPHAN | LOW | **keep** |

### 2C. Policy viewer (React)

| Path | Family | Usage | Routes | Risk | Next action |
|------|--------|-------|--------|------|-------------|
| `src/policy/components/SharedPolicyDetailView.tsx` | **POLICY_VIEWER** + **APPROVED_LIGHT_DESIGN** + `.policy-print-only` | ACTIVE | Library, lifecycle, ACHC, surveyor | HIGH | **keep**; **lock as canonical** for in-shell policy print |
| `src/policy/components/PolicyLibraryDocumentView.tsx` | **POLICY_VIEWER** | ACTIVE | Surveyor, lifecycle, ACHC | MEDIUM | **keep** |
| `src/policy/pages/LibraryPage.tsx` | **POLICY_VIEWER** | ACTIVE | `/library` | MEDIUM | **keep** |
| `src/policy/pages/PolicyDetailPage.tsx` | **POLICY_VIEWER** + light | ACTIVE | `/library/:id`, `/policies/:id` | HIGH | **keep** |
| `src/policy/pages/SurveyorPolicyViewerPage.tsx` | **POLICY_VIEWER** | ACTIVE | `/surveyor/policy/:id` | MEDIUM | **keep** |
| `src/policy/pages/GVGBDetailView.tsx` | **LEGACY_GOLD_MUSTARD** | ACTIVE | GV-GB-001 | HIGH | **neutralize legacy** or **needs review** (specimen) |
| `src/policy/pages/GVPolicyDetailView.tsx` | **LEGACY_GOLD_MUSTARD** | ORPHAN | — | MEDIUM | **archive** / **delete after confirmation** |
| `src/policy/pages/CLPolicyDetailView.tsx` | **LEGACY_GOLD_MUSTARD** | ORPHAN | — | MEDIUM | **archive** / **delete after confirmation** |
| `src/policy/components/PolicyDetailModal.tsx` | **POLICY_VIEWER** | ORPHAN | — | MEDIUM | **archive** or consolidate |
| `src/policy/components/PolicyAppendicesPanel.tsx` | **FORM_VIEWER_PRINT** | ACTIVE | Policy appendices | MEDIUM | **keep** |
| `src/policy/pages/AchcSurveyAlignmentPage.tsx` | Embeds policy doc | ACTIVE | `/framework/achc-survey` | LOW–MED | **keep** |

### 2D. Policy print routes

| Path | Family | Usage | Routes | Risk | Next action |
|------|--------|-------|--------|------|-------------|
| `src/policy/pages/PrintPage.tsx` | **APPROVED_LIGHT_DESIGN** + inline print CSS | ACTIVE | `/print/:policyId` | HIGH | **keep**; dedupe with `SharedPolicyDetailView` print |
| `src/policy/pages/GVGBPrintDocument.tsx` | **LEGACY_GOLD_MUSTARD** | ACTIVE | `/print/GV-GB-001` | HIGH | **neutralize legacy** |
| `src/policy/pages/GVGBAppendixPrint.tsx` | **LEGACY_GOLD_MUSTARD** + **APPENDIX_PRINT** | ACTIVE | `/print/GV-GB-001/appendix/:id` | HIGH | **neutralize legacy** |

### 2E. Forms

| Path | Family | Usage | Risk | Next action |
|------|--------|-------|------|-------------|
| `src/policy/components/FormViewer.tsx` | **FORM_VIEWER_PRINT** + **ECIGN_CERTIFICATE_PACKET** | ACTIVE | HIGH | **keep** |
| `src/policy/pages/FormPrintView.tsx` | **FORM_VIEWER_PRINT** | ACTIVE | HIGH | **keep** |
| `src/policy/utils/printForm.ts` | **FORM_VIEWER_PRINT** | REFERENCED | MEDIUM | **keep** |
| `src/policy/data/formsLibraryContent.ts` | **FORM_VIEWER_PRINT** | ACTIVE | MEDIUM | **needs review** (comments vs tokens) |
| `src/policy/pages/FormsPage.tsx` | **FORM_VIEWER_PRINT** | ACTIVE | MEDIUM | **keep** |
| `src/policy/components/FormSignatureFlow.tsx` | **FORM_VIEWER_PRINT** | ACTIVE | MEDIUM | **keep** |
| `src/policy/pages/iAdministrator/components/FormRenderer.tsx` | print triggers | ACTIVE | MEDIUM | **keep** |
| `src/policy/pages/iAdministrator/components/RightPanelPreview.tsx` | print triggers | ACTIVE | MEDIUM | **keep** |
| `src/policy/pages/DemoPage.tsx` | demo | ACTIVE | LOW | **keep** or **archive** |

### 2F. eCIgn packet

| Path | Family | Usage | Risk | Next action |
|------|--------|-------|------|-------------|
| `src/policy/components/FormSigningWorkspace.tsx` | **ECIGN_CERTIFICATE_PACKET** | ACTIVE | HIGH | **lock as canonical** (visual); do not change certificate logic in same pass |
| `server/ecign/pdf.ts` | **ECIGN_CERTIFICATE_PACKET** | ACTIVE | HIGH | **keep**; **needs review** for drift vs client |

**Docs:** `Builder/eCIgn/*.md`, `Builder/eCIgn/design` — **keep**, LOW.

### 2G. Global CSS / tokens

| Path | Family | Usage | Risk | Next action |
|------|--------|-------|------|-------------|
| `src/index.css` | Light remaps + **LEGACY** `:root` gold + global `@media print` | ACTIVE | HIGH | **lock** print infra; **needs review** vs route `<style>` |
| `tailwind.config.js` | **LEGACY_GOLD_MUSTARD** (`ci.teal` = gold) | ACTIVE | HIGH | **neutralize legacy** |
| `src/policy/utils/lightColorRemap.ts` | **APPROVED_LIGHT_DESIGN** | ACTIVE | MEDIUM | **keep** |
| `src/policy/components/CommandCenterLayout.tsx` | Gold gradient dark / teal light | ACTIVE | MEDIUM | **needs review** |
| `src/components/TravelightBG.tsx` | Gold blur | ACTIVE | LOW | **keep** or align |
| `src/policy/components/StatusBadge.tsx` | Gold for Published | ORPHAN | LOW | **archive** with modal or align |
| `src/policy/components/ui/CiStatusBadge.tsx` | Light-aligned | ACTIVE | LOW | **lock as canonical** |

### 2H. Other printable outputs

| Path | Family | Usage | Risk | Next action |
|------|--------|-------|------|-------------|
| `src/policy/audit/surveyPacket.ts` | Slate/teal audit HTML | ACTIVE | MEDIUM | **keep**; separate from policy/form DS |
| `src/policy/pages/GenericReferenceViewer.tsx` | Stub card | ACTIVE | LOW | **needs review** when built |

### 2I. Journey

| Path | Family | Route | Next action |
|------|--------|-------|-------------|
| `src/policy/journey/pages/AppendixFPage.tsx` | **LEGACY_GOLD_MUSTARD** / journey | `/journey/appendix-f` | **needs review** |

### 2J. Framework / taxonomy

| Path | Family | Route | Next action |
|------|--------|-------|-------------|
| `src/policy/components/FrameworkShowcase.tsx` | Dark glass | `/taxonomy` | **needs review** |
| `src/policy/components/FrameworkShowcase.css` | Dark glass | — | **needs review** |
| `src/policy/pages/FrameworkPage.tsx` | — | `/framework` | **keep** |

### 2K. Orphan / backup / trash

| Path | Next action |
|------|-------------|
| `src/policy/pages/TaxonomyPage.old.tsx` | **archive** |
| `src/policy/pages/DashboardPage.tsx.backup` | **archive** |
| `src/policy/pages/MasterCalendarPage.tsx.backup` | **archive** |
| `Bin-(thrash)/**` | **archive** / **delete after confirmation** |
| `_rewrite_demo.cjs` | **archive** |

### 2L. `public/` / `scripts/`

- **public/**: No competing policy/form print implementations identified in this inventory pass.
- **scripts/**: Smoke / tooling only; no document layout controllers.

---

## 3. Duplication hotspots

| Pattern | Locations | Risk |
|---------|-----------|------|
| GFM table renderer | `PolicyDetailPage`, `PolicyDetailModal`, `SharedPolicyDetailView`, `PrintPage`, `Bin-(thrash)/DraftPolicyPage` | MEDIUM–HIGH |
| Print cover + metadata | `SharedPolicyDetailView` `.policy-print-only`, `PrintPage` | HIGH |
| Inline `@media print` + global `index.css` | Multiple TSX + `index.css` | HIGH |
| `TEAL = '#D4AF37'` | `GVGBPrintDocument`, `GVGBAppendixPrint` | HIGH |
| Tailwind `ci-teal` → gold | `tailwind.config.js` | HIGH |

---

## 4. Decision matrix (summary)

| Item | Action |
|------|--------|
| Approved `Builder/Policies/*DesignLight.html` | **lock as canonical** (reference) |
| `SharedPolicyDetailView` + `index.css` policy print | **lock as canonical** (in-app print-from-shell) |
| `PrintPage` | **keep**; dedupe with shared print tree |
| `FormPrintView` + `FormViewer` + `printForm` | **lock as canonical** (forms) |
| `FormSigningWorkspace` + `server/ecign/pdf.ts` | **lock as canonical** (eCIgn packet visual); separate from policy light DS |
| GV gold print + `GVGBDetailView` | **neutralize legacy** or document specimen — **needs review** |
| `tailwind.config.js` ci aliases | **neutralize legacy** — **needs review** |
| Orphan views / modal / backups / Bin-(thrash) | **archive** / **delete after confirmation** |
| `surveyPacket` HTML | **keep**; classify outside policy/form print DS |

---

## 5. Verification grep anchors

- `@media print` — `src/index.css`, `PrintPage.tsx`, `FormPrintView.tsx`, `GVGBPrintDocument.tsx`, `GVGBAppendixPrint.tsx`, `FormSigningWorkspace.tsx`, `surveyPacket.ts`, `Builder/Policies/*.html`
- `#D4AF37` / `TEAL = '#D4AF37'` — GV print/appendix/detail, `tailwind.config.js`, `StatusBadge`, `TravelightBG`, `index.css` light remaps
- `policy-print-only` — `SharedPolicyDetailView.tsx`, `index.css`

---

## 6. Remediation log (post-inventory)

**2026-05-08 — Print / token pass (library on-screen viewer untouched)**

- `tailwind.config.js`: `ci.teal` / `ci.teal-dark` corrected to real brand teal (`#007970` / `#004142`); removes gold masquerading as “teal” (fixes `PrintPage` print bar, orphan `PolicyDetailModal`, any `bg-ci-teal` usage).
- `GVGBPrintDocument.tsx` / `GVGBAppendixPrint.tsx`: document accent renamed to `PRINT_ACCENT` with value `#007970` (replaces mis-set `#D4AF37` gold on **standalone print routes only**).
- `TravelightBG.tsx`: ambient orb `#D4AF37` → `#007970` at same opacity (shell only; not policy cards).
- `StatusBadge.tsx`: `Published` pill no longer uses gold (only consumed by orphan `PolicyDetailModal` on teal header — white/translucent pill).
- **Canonical lock file added:** `Builder/Documentations/DesignInventory/CANONICAL_DOCUMENT_DESIGN_REFERENCES.md`
- **Not changed per constraint:** `SharedPolicyDetailView.tsx`, `PolicyDetailPage.tsx`, `GVGBDetailView.tsx` (on-screen `/library` policy card/tab viewer).
