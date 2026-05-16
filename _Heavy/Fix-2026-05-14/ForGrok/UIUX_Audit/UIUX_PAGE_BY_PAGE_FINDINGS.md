# UI/UX Page-by-Page Findings
**Date**: 2026-05-15  
**Method**: 8+ Heavy subagents + main auditor + prior _Heavy reports (LAYOUT_NORMALIZATION, GVGB001, QA_UAT accessibility deep audits, eCign gap) + screenshots in ForGrok/.

**Format per surface**: Current design summary | Screenshots needed | Layout issues | Visual inconsistencies | UX friction | Accessibility issues | Mobile issues | Recommended action | Priority

---

## Core Command Center Surfaces

**`/dashboard` (DashboardPage.tsx)**
- **Summary**: Widget grid (KPI, tasks, events, evidence, notifications) in CommandCenterLayout glass card. Mix ci- tokens + slate-/orange- + arbitrary shadows/hovers. Uses SurfaceCard in places.
- **Screenshots needed**: Full dashboard desktop + tablet + iPhone SE; widget hover states; empty states.
- **Layout issues**: Dense widgets; inconsistent card treatment (some SurfaceCard, many custom rounded-2xl with custom shadow-[ ]).
- **Visual inconsistencies**: Gold vs teal accents; font-montserrat vs roboto mixed; arbitrary text-[ ] sizes.
- **UX friction**: Quick actions not always obvious; loading flash in lazy widgets.
- **Accessibility**: Icon-only in some widgets; contrast in mixed theme; tab order through widgets.
- **Mobile**: Horizontal scroll risk on widget grid; cramped on small screens; touch targets ok but dense.
- **Recommended action**: Adopt ui/ primitives (SurfaceCard, CiStatusBadge, EmptyState) + ci- tokens everywhere. Standardize widget chrome. Add mobile stack layout.
- **Priority**: High (daily driver surface).

**`/library` (LibraryPage.tsx)**
- **Summary**: Policy grid/list with search/filter, glass-interactive cards, status, due dates. Custom .glass-panel-lib + .glass-interactive-lib (backdrop-filter in dark).
- **Screenshots needed**: Grid vs list, search active, filter chips, policy card hover, mobile.
- **Layout issues**: Card padding/gap inconsistent with ui/ SurfaceCard.
- **Visual inconsistencies**: Custom glass not converging on GlassPanel; gold/teal mix; arbitrary tracking.
- **UX friction**: Policy vs form vs eCign entry points not always clear to new users.
- **Accessibility**: Card links vs buttons; filter chips keyboard.
- **Mobile**: Grid collapses but cards still wide; touch targets ok.
- **Recommended action**: Replace glass-panel-lib with GlassPanel + SurfaceCard. Enforce ci- tokens. Improve onboarding to library.
- **Priority**: High.

**`/library/:policyId` (general) + `/policies/:policyId`**
- **Summary**: PolicyDetailPage (thin) → PolicyLibraryDocumentView → SharedPolicyDetailView (carousel + Tab* + SCard for non-GV). Normalized to QA-PG-001 (SurfaceCard + teal rules + metadata grid + tabs) per LAYOUT_NORMALIZATION_REPORT.
- **Screenshots needed**: Overview tab, statements, procedures, appendices, mobile scroll, print button.
- **Layout issues**: Carousel for specialized ACHC/surveyor; long content; tab navigation.
- **Visual inconsistencies**: After normalization mostly consistent with shell; some residual SCard vs SurfaceCard.
- **UX friction**: "Which tab has the form/appendix I need?"; print fidelity surprise.
- **Accessibility**: Long content headings; tab order; appendix links.
- **Mobile**: Readable but wide tables/sections need horizontal or reflow.
- **Recommended action**: Complete migration to ui/ primitives (Tabs, SurfaceCard, DataGrid for tables). Keep carousel only for specialized.
- **Priority**: High (core compliance surface).

**`/library/GV-GB-001` (GVGBDetailView.tsx — specimen)**
- **Summary**: Special cased in PolicyDetailPage. Compact sticky header on non-overview tabs (saves ~160px), custom TabButton + sub-tabs (PROCEDURE_SUBTABS + form appendices), local Card/SectionTitle/SimpleTable, keyboard nav, gvgb-enter keyframes, SectionTitle with #007970 teal rule. Preserved as "honored specimen" per GVGB001_CANONICAL_UX_REFINEMENT and CANONICAL_POLICY_VIEW reports.
- **Screenshots needed**: Overview vs non-overview (sticky header), procedures sub-tabs, appendix rendering, keyboard focus, print.
- **Layout issues**: Local UI (Card/SectionTitle/TabButton) diverges from normalized QA-PG-001 / ui/ primitives.
- **Visual inconsistencies**: Hardcoded #1F1C1B/#524048/#E5E4E3/#007970/#C74601 + exact montserrat 13px tracking-0.22em vs shell tokens.
- **UX friction**: "Why does GV-GB-001 look different from QA-PG-001?"; sticky header helpful but inconsistent pattern.
- **Accessibility**: Good keyboard (added in refinement); contrast ok in light; labeling in appendices.
- **Mobile**: Sticky header helps; sub-tabs cramped.
- **Recommended action**: **Preserve as specimen** (do not normalize content or special behavior). Replace local Card/SectionTitle/TabButton/SimpleTable with ui/ primitives (SurfaceCard + ui/Tabs + CiStatusBadge + DataGrid) while keeping sticky + animations + content. Update DESIGN_OWNERS.md to mark GVGBDetailView as "GV-GB-001 only — do not copy pattern."
- **Priority**: Medium (specimen protected; visual drift fix still valuable).

**`/forms` + `/forms/:formId` (FormsPage + FormViewer + FormSigningWorkspace)**
- **Summary**: Forms grid → FormViewer (embedded mode, FormBody paper) + FormSigningWorkspace (eCIgn modal, signed_locked Options with Download/Print/Send cards, buildPrintablePacketHtml using getPrintableFormHtml clone + cert + audit + roster + fixed ci-brand-header + eCign footer).
- **Screenshots needed**: Forms grid, form detail, signing flow (all states), signed_locked Options (Download/Print cards), packet preview (desktop + mobile), multi-signer, print/PDF output.
- **Layout issues**: Embedded .form-frame vs standalone .form-page header divergence; packet header battles (ci-brand-header vs FormBody header).
- **Visual inconsistencies**: eCign navy/orange + paper vs shell one-glass; "Enterprise Forms Library · Signed Document Package" banner vs clean FormBody teal rule + title (two renderers problem, reported in session memory).
- **UX friction**: After signing WAPI → Options screen sometimes white-screen or incorrect visual (header/logo/title); Print/Download fidelity surprise.
- **Accessibility**: **High risk** (prior Full_App_Accessibility_Compliance_Audit + FormViewer/FormSigningWorkspace deep dive): uncontrolled inputs, labeling in dynamic/conditional sections, keyboard in signing, dialog roles, multi-signer flow.
- **Mobile**: Signing on phone cramped; packet preview issues.
- **Recommended action**: Unify packet renderer (remove conflicting ci-brand-header; let FormBody provide clean form identity + eCign legal overlays). Fix embedded vs standalone header. Accessibility remediation on FormViewer/FormSigningWorkspace (labels, keyboard, dialogs). Mobile signing improvements. Add visual regression for signed packets.
- **Priority**: **Critical** (legal defensibility + user friction on signed evidence).

**`/evidence` (EvidenceCenterPage + CesEvidenceHierarchyPanel)**
- **Summary**: Evidence list + hierarchy tree; integration with CES tasks and eCign artifacts.
- **Screenshots needed**: Hierarchy expanded, artifact preview, mobile.
- **Layout issues**: Tree navigation dense; status indicators.
- **Visual inconsistencies**: Mix shell + evidence-specific.
- **UX friction**: Finding signed package vs raw evidence.
- **Accessibility**: Tree ARIA, keyboard navigation in hierarchy.
- **Mobile**: Hierarchy cramped; horizontal scroll risk.
- **Recommended action**: Adopt ui/ primitives for hierarchy/list. Improve mobile (accordion or bottom sheet). Unify with ArtifactViewer.
- **Priority**: High (compliance evidence surface).

**`/ces/*` (CesDashboard, CesBoard, CesWorkloads, CesReports, MyTasks, PM overlays)**
- **Summary**: CES parallel system (ces/theme.ts CES_TOKENS navy/orange + primitives.tsx CesCard + board/ components + CesRoleReviewSwitcher + WorkflowExecutionPanel).
- **Screenshots needed**: Board (kanban), dashboard widgets, task detail drawer, workload, reports, mobile board, role switcher.
- **Layout issues**: Dense; visual weight differs from shell; PM overlays bolted on.
- **Visual inconsistencies**: Navy/orange vs ci- gold/teal; CesCard vs SurfaceCard; own badges.
- **UX friction**: Role switching, evidence attachment, sprint vs unified calendar confusion.
- **Accessibility**: Board keyboard/drag, table tab order, status ARIA.
- **Mobile**: Board/kanban poor (horizontal or cramped); task execution on phone.
- **Recommended action**: Map CES tokens to ci- or document as specialized. Replace CesCard/primitives with ui/. Unify board visual weight. Mobile-first board (card stack or improved horizontal). Improve PM overlay polish.
- **Priority**: **Critical** (daily execution surface for compliance team).

**`/onboarding-v2/*` (Dashboard, Activation, Batches, AuditReadiness, Governance) + `/journey/*` (Home, V1, ModulePlayer, StagingM01, Supervisor)**
- **Summary**: Onboarding V2 light professional (OnboardingV2Layout 260px rail + white main; KpiTile, StatusPill, GateTile, UnitDrawer, AuditTimeline, reconciliation preview, hash-chain). Journey V1 cinematic dark glass + theatrical StagingM01 (5-slot absolute carousel, video, tints, narration HUD, pre-assess/debrief).
- **Screenshots needed**: V2 dashboard + activation (reconciliation bars) + batch view + UnitDrawer + AuditReadiness; Journey home + module player + StagingM01 carousel states + supervisor; mobile versions.
- **Layout issues**: V2 wide drawer + 9/3 grid; Journey complex absolute positioning.
- **Visual inconsistencies**: Stark drift (light audit vs dark cinematic); both diverge from shell one-glass in different ways.
- **UX friction**: "Which onboarding?" confusion; V2 excellent (reconciliation preview, gates, hash verification) but mobile weak; StagingM01 visually outstanding but fragile on phone.
- **Accessibility**: V2 good structure; Journey carousel keyboard/touch; supervisor signing.
- **Mobile**: V2 drawer/grid poor; StagingM01 carousel (vw offsets, fixed heights) breaks or scrolls badly; training for field clinicians compromised.
- **Recommended action**: Decide V1 vs V2 ownership or clear migration path in UI/docs. Make V2 default. Apply shell glass + primitives where appropriate. Mobile overhaul (bottom sheet drawer, simplified carousel, responsive player). Embed help in flows.
- **Priority**: High (user onboarding + compliance activation).

**`/calendar` (MasterCalendarPage + MobileIncidentExecutionPage)**
- **Summary**: Unified calendar (events, tasks, sprints, evidence). Drill-down to MobileIncidentExecutionPage (event/workflow/task/evidence/approval stages).
- **Screenshots needed**: Month view, sprint toggle, event detail, mobile, drill-down flow.
- **Layout issues**: Dense cells; event popovers.
- **Visual inconsistencies**: Good shell integration but some custom.
- **UX friction**: Sprint vs unified calendar toggle not obvious to all users.
- **Accessibility**: Calendar keyboard navigation, ARIA for events.
- **Mobile**: Usable but dense; drill-down good.
- **Recommended action**: Continue as canonical. Improve mobile density + touch. Better visual distinction for sprint vs event.
- **Priority**: Medium (strong surface).

**`/artifacts/:artifactId` (ArtifactViewerPage)**
- **Summary**: Preview for signed packages (iframe HTML packet or other evidence).
- **Screenshots needed**: HTML packet preview, PDF fallback, mobile.
- **Layout issues**: Iframe sizing; fidelity depends on packet HTML.
- **Visual inconsistencies**: Depends on which packet renderer was used.
- **UX friction**: "Why does the preview look different from what I printed?"
- **Accessibility**: Iframe content accessibility (inherits from packet).
- **Mobile**: Iframe zoom/scroll issues.
- **Recommended action**: Unify packet renderer (Phase 3). Improve iframe handling or native render. Mobile responsive preview.
- **Priority**: High (evidence viewing).

**Auth pages, `/help/*`, `/system-documentation`, `/iadministrator`, `/admin/*`, `/workflows/*`, `/clinicians/*`, `/patients/*`, `/staffing-calendar`, `/taxonomy`, `/framework`, `/audit`, `/governance`, `/master-control-inventory`, `/hubstaff`, `/demo`, `/brad-proposal`**
- **Summary**: Vary from clean auth cards to lighter admin/identity, iAdmin (Brad), workflow library, staffing profiles (good primitive adoption), framework/ACHC alignment tables, audit, governance, inventory, internal staging, executive demo/proposal.
- **Screenshots needed**: Per surface (auth flow, help center, iAdmin Brad UI, admin identity, staffing list/detail, framework, audit, etc.).
- **Common issues**: Lighter polish than shell; some custom cards/tables; admin/identity often less "glass"; iAdmin has custom RightPanelPreview + StudioTabs (duplicates).
- **Recommended action**: Bring under shell + ui/ primitives. Staffing already adopting well — continue. Admin/identity polish pass. iAdmin converge on ui/ Tabs/Card.
- **Priority**: Medium (supporting surfaces).

**Standalone Prints (`/print/GV-GB-001`, `/print/:policyId`, `/print/GV-GB-001/appendix/:id`, `/forms/:formId/print`)**
- **Summary**: Dedicated print routes with good native PDF output but fidelity varies by system (see DRIFT report).
- **Screenshots needed**: GV-GB-001 print vs QA-PG-001 print vs form print vs signed packet (side-by-side).
- **Issues**: Header/logo/title treatment, embedded vs standalone divergence, extra eCign legal chrome in packets.
- **Recommended action**: Unify (Phase 3). Visual regression tests.
- **Priority**: High (compliance artifact).

---

## Summary of Page-by-Page

- **Highest friction + risk**: Forms/:id (eCign signing + signed_locked Options packet visual), CES/* (parallel system + mobile), Onboarding/Journey (fragmentation + mobile), Policy detail (GVGB vs general inconsistency).
- **Strongest**: MasterCalendar (unified), Onboarding V2 engine UX (reconciliation/gates/audit), eCign legal packet architecture (despite visual drift), staffing (good primitive adoption).
- **Mobile penalty**: Training (StagingM01, V2 BatchView/UnitDrawer), CES board, form tables, evidence hierarchy, dense calendar.
- **Accessibility hotspots**: FormViewer/FormSigningWorkspace (prior deep audit), CES boards/tables, evidence hierarchy, long policy content.

**Action**: Use this + UIUX_BROWSER_VALIDATION_CHECKLIST.md for validation pass. Prioritize P0 freeze + Phase 1 token/primitives + Phase 3 print/eCign + Phase 4 mobile on the surfaces above.