# UI/UX Drift and Redundancy Report
**Date**: 2026-05-15  
**Agent**: 019e2d5f-6dae-7c43-bf0c-d9b55faee516 (58 tool calls, 205s, ruthless deep dive) + cross-reference with LAYOUT_NORMALIZATION, GVGB001_CANONICAL_UX_REFINEMENT, POLICY_VIEWER_CONSOLIDATION_DELETE, QA_UAT reports, and prior agent outputs.

---

## Executive Summary of Drift

The application has a **mature token + primitive architecture** (`ui/*`: SurfaceCard, GlassPanel, Tabs, ActionButton, CiStatusBadge, DataGrid, EmptyState + --ci-* vars in index.css) but **systemic under-adoption and fragmentation**. Prior consolidation efforts (May 2026) deleted some orphans (GVPolicyDetailView, CLPolicyDetailView, PolicyDetailModal) and aligned SharedPolicyDetailView partially to QA-PG-001, but measurable drift remains:

- **3+ active policy detail renderers** (GVGBDetailView specimen with local UI, PolicyDetailPage + PolicyLibraryDocumentView + SharedPolicyDetailView with SCard/GenericSectionPanel/carousel, DemoPage near-duplicate).
- **6+ Tabs families**, **8+ Card/Surface families**, multiple Button, StatusBadge, EmptyState, Loading, Table, and **5 distinct Print/Packet systems**.
- **Parallel design systems**: Main CI-ION one-glass (CommandCenterLayout + ui/) vs CES (theme.ts + CesCard + navy/orange primitives) vs eCign/FormSigning (NAVY/ORANGE hardcoded + custom packet builder) vs Journey V1 cinematic vs Onboarding V2 light professional vs domain palettes (FrameworkShowcase) vs Demo heavy glass.
- Orphaned backups still present: `DashboardPage.tsx.backup`, `MasterCalendarPage.tsx.backup`, `TaxonomyPage.old.tsx`.
- 2313+ inline `style={{` + widespread hardcoded hex (`#1F1C1B`, `#E5E4E3`, `#007970`, `#C74601`, slate-/gray-* , arbitrary `text-[26px]`, `tracking-[0.22em]`, `rounded-[14px]`, `shadow-[...]`).
- "One-glass, no stacked sub-cards" philosophy (index.css + CommandCenterLayout comments) violated on most pages.
- Legacy glass utilities disabled but custom .glass-* and glass-over-glass still appear (Library, Demo, iAdmin, CES drawers).

**Risk**: High maintenance, visual inconsistency for users (especially policy detail + signed packets), accessibility gaps, redesign scope explosion, compliance evidence fidelity issues.

---

## Detailed Redundancy Mapping (Ruthless)

### Tabs (≥6 families)
- `src/policy/components/ui/Tabs.tsx` (canonical, token-driven, aria roles; used in staffing Clinician/PatientDetail, iAdministrator StudioTabs).
- `src/policy/pages/GVGBDetailView.tsx:261` (local TabButton + PROCEDURE_SUBTABS + form appendices; hardcoded #C74601 active, #524048 inactive, montserrat 13px tracking-0.22em).
- `src/policy/components/SharedPolicyDetailView.tsx` (TabOverview/Statements/Procedures/... + custom nav + carousel sectionIdx; SCard wrappers).
- `src/policy/pages/DemoPage.tsx:723+` (near-identical duplicate Tab* set — copy-paste from Shared era).
- `src/policy/components/regulatory/WorkflowExecutionPanel.tsx:367` (local TabButton + CalendarSideTabButton).
- `src/policy/journey/pages/UserGuidePage.tsx:40` (local Tab).
- Others in Journey/V2 accordions, CES boards.

**Drift**: ui/Tabs under-adopted in policy core (GVGB, Shared, Demo). Different interaction/keyboard/animation.

### Cards / Surfaces (≥8 families)
- Canonical: `ui/SurfaceCard.tsx` (ci-card), `ui/GlassPanel.tsx` (ci-glass-panel; adopted in staffing ClinicianCard/PatientCard/ShiftNeedCard, PmViews, MasterCalendar, RightDrawer).
- Locals:
  - GVGBDetailView:224 (`const Card = ... bg-white shadow-sm rounded-xl p-6 mb-6`; `SectionTitle` with #007970 rule).
  - SharedPolicyDetailView:539 (`function SCard`, `GenericSectionPanel:512` for generatedSections carousel, `DSimpleTable`, `SharedGlassTable`).
  - PrintPage:111 (`PrintSectionPanel` + PrintMeta inline).
  - FormSigningWorkspace:747 (`function SectionCard`).
  - CES primitives.tsx:14 (`CesCard` + CES_TOKENS navy/border).
  - LibraryPage: custom `.glass-panel-lib` + `.glass-interactive-lib` (backdrop-filter blur(12px) dark + #E5E4E3 light).
  - DemoPage: heavy `demo-glass-card`, `glass-card` (hardcoded #00e59b etc.).
  - FormViewer: GoverningBodyCard, AdministratorCard, ... (local tree cards).
- Many inline `bg-white rounded-xl border-[#E5E4E3] shadow-sm`, `ci-surface`, `var(--ci-surface)`, nested glass.

**Glass-over-glass risk**: Library/Demo/iAdmin/CES drawers + main shell.

### Buttons
- Canonical: `ui/ActionButton.tsx` (ci-btn--cta/secondary/ghost/danger), `ui/UtilityButton.tsx` (ci-util-btn).
- Locals: CES WorkflowDrawer:458 (local ActionButton with navy/orange/red/green tones — different API), iAdministrator AvailableActions:81 (local with #C74601 accent).
- Widespread native `<button className="bg-[#007970] font-montserrat ...">`.

### Status Badges
- Canonical: `ui/CiStatusBadge.tsx` (ci-badge--tone).
- Legacy: `components/StatusBadge.tsx` (hardcoded #FFC700/#C74600/#D70101 for LifecycleStatus; font-montserrat uppercase).
- Staffing: `staffing/components/StatusBadge.tsx` (wrapper).
- Others: CES ComplianceStateBadge/PhaseIndicator/AuditReadinessTag (own CES_TOKENS), regulatory DomainBadge/UrgencyChip, iAdmin RiskBadge, LockBadge.

### EmptyState / Loading / Error
- Canonical: `ui/EmptyState.tsx` (used in Library, Forms, staffing lists, MasterCalendar, PmViews).
- Locals/inline: PmViews:85 (wrapper), EventWorkspace:764, Dashboard:819 (EmptyBoardState), EvidenceCenter:1057, iAdmin RightPanelPreview:246, PolicyDetailPage:22 (inline rose-50), FormSigning conditionals, many others.
- Loading (13+ variants): App.tsx AppLoader/InlineLoader (border-t-[#C74601]), ArtifactViewer cyan, 10+ `Loader2 animate-spin` (size 11-16, colors #C74601/cyan/#FFC107), custom in CES/PM/FormSigning/OnboardingV1, Hubstaff (#FFC107), etc. No single primitive. Different colors/sizes.
- Error: Mostly inline rose/amber without role=alert/live regions (exceptions limited).

### Tables / DataGrid
- Canonical: `ui/DataGrid.tsx` (token-driven; staffing-only: ClinicianList, PatientList).
- Drift: GVGB SimpleTable (hardcoded #E5E4E3/#524048/#1F1C1B), Shared DSimpleTable/SharedGlassTable, PrintPage PrintSectionPanel, FormViewer/FormSigning raw tables (inline font-montserrat text-[9px] tracking + NAVY/ORANGE), WorkflowExecutionPanel tables, policy content often custom.

### Print / Packet Systems (5 distinct)
1. `GVGBPrintDocument.tsx` (`/print/GV-GB-001`; specimen + forms via FormPrintView).
2. `PrintPage.tsx` (`/print/:policyId`; general policy, PrintMeta + PrintSectionPanel inline).
3. `FormPrintView.tsx` (`/forms/:formId/print`; reuses FormBody + .form-frame + dedicated print CSS).
4. `GVGBAppendixPrint.tsx` (reuses FormPrintView + FormBody).
5. `FormSigningWorkspace.tsx:479` (`buildPrintablePacketHtml` + `buildPacketHtml:1254` + `getPrintableFormHtml` clone from FormViewer:1348; for signed_locked eCign packets; clones formPaperRef, appends cert + audit + manifest + roster, fixed ci-brand-header + eCign footer; used in ArtifactViewerPage).

**Fidelity issues**:
- Embedded FormViewer `.form-frame` vs standalone `.form-page` header divergence propagates to packet snapshots (missing metadata in some paths).
- Policy prints use custom section tables; form prints use FormBody; eCign packets add legal overlays (fixed brand header every page + eCign footer + cert/audit/manifest/roster).
- All good native browser PDF (vector), but visual output not uniform (logo placement, headers "Enterprise Forms Library · Signed Document Package" vs clean FormBody teal rule + title, title treatment).
- GVGBPrintDocument and PrintPage differ in meta/section rendering.
- Clone timing risk for dynamic sections (OrgChart, autoFills) in multi-signer.

**Common strengths**: @page Letter 0.5in, avoid-break, color-adjust:exact, some logo inlining.

**Risk**: Legal/compliance evidence (signed packets) visual or content fidelity varies by entry path.

### Other Drift
- **CES**: Full parallel (ces/theme.ts CES_TOKENS_LIGHT/DARK navy/orange/teal/gold + primitives.tsx CesCard + badges) duplicates main ui/ + ci- tokens.
- **eCign/FormSigning**: Entire separate family (heavy font-montserrat text-[9px] tracking-[0.14-0.22em] uppercase + font-roboto + NAVY/ORANGE/INK/MUTED hardcoded + custom packet HTML with fixed ci-brand-header + eCign footer).
- **Journey V1 vs Onboarding V2**: Cinematic dark glass + theatrical Staging M01 (absolute 5-slot carousel, tints, video, HUD) vs light professional audit (white cards, navy #0B2545, #E07B2C CTA, KpiTile/StatusPill/GateTile/UnitDrawer/AuditTimeline) — stark, intentional, but user-confusing and maintenance-heavy. Both under Command Center nav.
- **Library/Demo**: Custom glass not converging on SurfaceCard/GlassPanel.
- **Typography/Spacing**: montserrat/roboto + tracking-[0.22em] repeated ad-hoc vs Tailwind + --ci-*. Mixed p-/gap-/mb- vs inline padding in primitives. Container widths drift (1000px/1100px).
- **Colors**: --ci-accent (gold #FFC107) vs #C74601 (orange CTA) vs #007970 (teal) mixed with hex in non-ui files; maroon vars in CSS (legacy).
- **Orphaned files**: Backups + .old still in src/policy/pages/ (incomplete prior cleanup). DemoPhase2/3 legacy. Many iAdministrator custom components duplicate regulatory/PM patterns.

---

## Visual Consistency / Typography / Spacing (Scope 11)

**Strengths**: ci- tokens + primitives (SurfaceCard/GlassPanel/Tabs/ActionButton/DataGrid/CiStatusBadge/EmptyState) exist and partially adopted in staffing/PM. Reduced-motion and focus rings good. Some normalization done (Shared aligned to QA-PG-001 per LAYOUT_NORMALIZATION_REPORT).

**Drift (ruthless)**:
- GVGBDetailView (specimen) uses local Card/SectionTitle/SimpleTable/TabButton + hardcoded #007970/#C74601/#1F1C1B/#524048/#E5E4E3 + exact montserrat/roboto px/tracking — does **not** match ui/ or general QA-PG-001 path.
- SharedPolicyDetailView uses SCard/GenericSectionPanel/Tab* despite normalization.
- FormSigningWorkspace + eCign packet: completely separate (NAVY/ORANGE hardcoded, custom packet HTML).
- LibraryPage: custom glass-panel-lib (backdrop-filter in dark).
- DemoPage: heavy glass-card + duplicate Tab*.
- CES: own primitives + theme (duplicates badges/cards).
- Typography: montserrat/roboto + tracking-[0.22em] repeated ad-hoc vs Tailwind + --ci-*.
- Spacing: mixed Tailwind p-/gap-/mb- + inline padding in primitives + custom.
- Colors: --ci-accent (gold) vs #C74601 vs #007970 mixed with hex; maroon remnants.
- Badges/tables/empty/spinners: multiple families.
- Glass: ci-glass-panel vs custom .glass-* (nesting risk).

**Recommendations (visual)**: Enforce ui/ primitives + ci- tokens everywhere in policy detail (replace GVGB locals + Shared SCard with SurfaceCard + ui/Tabs + CiStatusBadge + EmptyState + DataGrid). Standardize typography scale + tracking in tokens. Audit all hardcoded #1F1C1B etc. Remove glass-panel-lib / demo-glass-card. Make CES converge or document as specialized.

---

## Print / Export / PDF Audit (Scope 14)

**Systems** (5 distinct; fidelity varies; no single canonical output):
- GVGBPrintDocument.tsx (`/print/GV-GB-001`; specimen + forms via FormPrintView patterns; specific @page + brand fixes).
- PrintPage.tsx (`/print/:policyId`; general policy, PrintMeta + PrintSectionPanel inline 9px/11px Montserrat/Roboto).
- FormPrintView.tsx (`/forms/:formId/print`; reuses FormBody + .form-frame + dedicated print CSS; orientation support).
- GVGBAppendixPrint.tsx (reuses FormPrintView + FormBody).
- FormSigningWorkspace.tsx (`buildPrintablePacketHtml` + `buildPacketHtml` + `getPrintableFormHtml` clone; eCign signed_locked packets; clones formPaperRef, appends certHtml + audit + manifest + rosterHtml, fixed ci-brand-header + eCign footer stamp; used in ArtifactViewerPage iframe).

**Fidelity issues**:
- Embedded FormViewer `.form-frame` vs standalone `.form-page` header divergence propagates to packet snapshots (missing metadata table in some paths).
- Policy prints use custom section tables; form prints use FormBody; eCign packets add legal overlays (fixed brand header every page + eCign footer + cert/audit/manifest/roster) absent in pure policy/form prints.
- All good native PDF (vector fidelity preferred over raster), but visual output not uniform (logo placement, headers "Enterprise Forms Library · Signed Document Package" vs clean FormBody teal rule + title, title treatment).
- GVGBPrintDocument and PrintPage differ in meta/section rendering.
- Clone timing risk for dynamic sections (OrgChart, autoFills) in multi-signer.
- Common: @page rules, avoid-break, color exact, some logo inlining.

**Recommendations**: Single PrintableDocument family (policy vs form vs signed-packet variants sharing core chrome). Standardize header (policy meta vs form vs eCign brand + legal). Unify print CSS. Test GV-GB-001 print vs QA-PG-001 print vs form print vs signed packet side-by-side (screenshots in tmp/ + ForGrok/ exist for policy detail).

---

## Redesign Roadmap (Ruthless Priorities — Scope 7)

**P0 (Immediate, high compliance risk)**:
1. Unify policy detail: Make GVGBDetailView use ui/Tabs + SurfaceCard + CiStatusBadge + EmptyState + DataGrid (replace all local Card/TabButton/SectionTitle/SimpleTable/GenericSectionPanel/SCard). Keep specimen content. PolicyDetailPage remains thin delegator. Update Shared only for specialized ACHC (per prior reports).
2. Delete or archive orphans: Remove DashboardPage.tsx.backup, MasterCalendarPage.tsx.backup, TaxonomyPage.old.tsx (and any other .backup/.old). Clean DemoPage.tsx duplicate Tab* or deprecate as demo-only.
3. Standardize loading: Single Loader primitive in ui/ (use AppLoader pattern + role=status + aria-live). Replace all animate-spin variants.
4. Buttons: Enforce ActionButton/UtilityButton; remove or alias the two local ActionButton defs (update CES WorkflowDrawer + iAdmin AvailableActions).

**P1 (Visual + Print consistency)**:
- Adopt ui/ primitives + ci- tokens across GVGB/Shared/Library/Demo/FormViewer (where non-embedded)/CES (converge or isolate).
- Typography/spacing audit: Define token scale (e.g., --text-policy-title: 22px montserrat 600 tracking-[0.22em]) in index.css; replace all text-[22px] + tracking-[0.22em] + font-montserrat inline.
- Print consolidation: Create shared print utils (PrintableSection, PrintableTable, PrintableHeader variants). Fix embedded vs standalone header divergence in FormViewer clone path. Make GVGBPrintDocument / PrintPage / FormPrintView share more chrome.
- Status/Empty/Table: Deprecate legacy StatusBadge; migrate all to CiStatusBadge + DataGrid where tabular.
- CES: Merge primitives into ui/ or document as "CES-only" with explicit token mapping.

**P2 (Longer)**:
- Remove glass-panel-lib / demo-glass-card / custom glass in Library/Demo; converge on GlassPanel.
- Full ARIA/keyboard on all new Tabs (add arrow keys to ui/Tabs; enforce in consumers). Add focus trap to RightDrawer + all modals/drawers.
- eCign packet: Document "two renderers" semantics; ensure snapshot fidelity tests.
- Global: Enforce .ci-touch-target + 44px; reduced-motion already good.
- Verification: After changes, re-run npx tsc, build, verify-feature-access; browser parity on /library/GV-GB-001 vs /library/QA-PG-001 vs /print/GV-GB-001 vs forms print vs signed packet; axe + SR + mobile (iPhone SE) on detail + evidence + CES + signing.
- Future deletions: After validation, consider deprecating remaining Shared carousel for standard routes (per memory: GVGB style as single allowed system).

**Risk if ignored**: Continued visual drift between specimen (GV-GB-001) and general policies; inconsistent print/PDF output (legal risk for eCign); maintenance burden from 5+ card/tab families; accessibility/compliance gaps in regulated surfaces.

**Files for immediate action (ruthless list)**: All listed in CANONICAL_MAP + backups in src/policy/pages/, DemoPage.tsx Tab* block, FormSigningWorkspace print funcs, CES primitives.tsx, LibraryPage glass styles, GVGBDetailView local UI block (224–272), SharedPolicyDetailView SCard/Tab* blocks, App.tsx loaders, PolicyDetailPage error inline.

**End of report.** All locations absolute. Exhaustive per instructions. Prior consolidation efforts (2026-05-14) left measurable remaining drift (backups, duplicate Tab*/Card logic, local primitives in canonical specimen). GVGBDetailView + ui/ primitives should become uncontested owners for policy surfaces.