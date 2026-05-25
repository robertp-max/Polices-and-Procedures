# Comprehensive Exploration Report: UI-Staging Module (Current State)

**Date of Analysis**: 2026-05-20  
**Workspace**: `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`  
**Primary Files Analyzed**: `src/ui-staging/*`, `docs/UIUX/`, `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/` and subpaths, `src/App.tsx`, related CSS/TS.  
**Tools Used**: `list_dir`, `read_file` (with targeted offsets/limits on 2244-line TSX and 2157-line CSS), `grep` (content, files_with_matches, count, regex for classes/imports/SectionId/functions/keyframes).

---

### 1. All Files in `src/ui-staging/` and `_archive`

**Current `src/ui-staging/` (5 entries, no `components/` subdir — previous multi-file V3*Preview* structure was consolidated/removed):**

- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\_archive\DashboardPage.tsx` (1266 LOC — legacy monolithic V3 Dashboard with tasks, KPIs, GSAP references in comments; archived post-consolidation)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\ui-staging.css` (2157 LOC — comprehensive V3 token `:root` + keyframes + legacy preview classes)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\UIStagingPage.tsx` (33 LOC)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\V3StagingApp.tsx` (2244 LOC — current monolithic core)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures\src\ui-staging\v3Tokens.ts` (57 LOC — canonical TS mirror, **unused** in current `V3StagingApp.tsx`)

**No other files** (no `components/`, no remaining V3ClinicianListPreview.tsx etc. — docs/UIUX references are historical).

**Route Integration** (`src/App.tsx:197`): Standalone lazy route `<Route path="/ui-staging" element={<UIStagingPage />} />` (outside `CommandCenterLayout`/`ProtectedRoute` for isolated visual lab use).

---

### 2. Detailed Structural Breakdown of `V3StagingApp.tsx`

**Total LOC**: 2244 lines (confirmed via line-count grep).

**Number of inner page functions/components**: ~25 (plus helpers). Key ones:
- `performRouteTransition` (View Transitions API fallback)
- `HeaderBlock`
- `PageContent` (central switch router)
- Main export `V3StagingApp`
- 20+ dedicated page renderers: `DashboardPage`, `MyPlannerPage`, `CliniciansPage`, `PatientsPage`, `CalendarPage`, `BradPage`, `PolicyLibraryPage`, `PolicyDetailPage`, `FormsLibraryPage`, `EvidencePage`, `OnboardingPage`, `DomainLibraryPage`, `ReferringPhysiciansPage`, `VisitSchedulePage`, `MissedVisitsPage`, `HubstaffPage`, `UserGuidesPage`, `SopLibraryPage`, `TrainingMaterialsPage`, `HelpCenterPage`, `DemoPage`, `AuditTrailPage`.

**All `SectionId` values** (22 total, defined lines 47-70):
```ts
type SectionId =
  | 'dashboard' | 'my-planner' | 'clinicians' | 'patients' | 'calendar'
  | 'visit-schedule' | 'missed-visits' | 'referring-physicians'
  | 'library' | 'policy-detail' | 'domain-library' | 'sop-library' | 'audit-trail'
  | 'forms' | 'evidence' | 'onboarding' | 'brad' | 'hubstaff'
  | 'user-guides' | 'training-materials' | 'help-center' | 'demo'
```

**Dedicated implementations vs. fallbacks** (`PageContent` switch, lines 573-620):
- **All 22 have dedicated case returns** to their named functions (e.g., `'dashboard' → <DashboardPage>`, `'policy-detail' → <PolicyDetailPage>`, `'audit-trail' → <AuditTrailPage>`).
- **Only default fallback**: `DashboardPage` (for unknown sections).
- `policy-detail` is **not** in primary `NAV_GROUPS` (accessed via `navigate('policy-detail')` from `PolicyLibraryPage`).
- Many pages are thin/static visual mocks (fake tabs, non-functional buttons, hardcoded arrays).

**Key excerpt** (nav + state + switch skeleton):
```tsx
const NAV_GROUPS: NavGroup = [ /* 7 groups: OVERVIEW(2), CLINICAL(6), COMPLIANCE(5), ... RESOURCES(4) */ ];

export default function V3StagingApp() {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(...);
  const isMobile = viewportWidth < 768;
  // ...
  <PageContent section={activeSection} ... />
}
```

---

### 3. Unique Visual Tokens / V3 `const` Usage + CSS Classes from `ui-staging.css` Actively Used in TSX

**Local `V3` const** (lines 32-45 in TSX — duplicates `v3Tokens.ts` + CSS `:root`):
```ts
const V3 = {
  baseBg, bgGradient, glass1/2/3,
  tealLight: '#00D1C1', orangeLight: '#FFA059',
  textPrimary/Secondary/Tertiary,
  borderDefault: 'rgba(255,255,255,0.15)', borderHighlight: 'rgba(255,255,255,0.33)'
} as const;
```
**Heavily duplicated inline** across every page (e.g., `style={{ border: `1px solid ${V3.borderDefault}` ... }}`). `v3Tokens.ts` is **never imported** in `V3StagingApp.tsx`.

**Actively used classes** (from exhaustive grep of `className=` in TSX; ~92 occurrences, deduped):
- `v3-staging-shell` (root shell)
- `v3-watermark-lock`
- `v3-main-content` (77.7% card)
- `v3-app-header`
- `v3-app-sidebar`
- `btn-smooth-hover` (ubiquitous on buttons/tabs)
- `animate-butter-shift` (on **every** page root div)
- `v3-invisible-glare` (core hover surface on ~50+ cards/KPIs/lists)

**CSS support** (`ui-staging.css` — 2157 LOC, rich `:root` with `--v3-*` + legacy):
- `.animate-butter-shift` + `@keyframes v3ButterShift`
- `.v3-invisible-glare` + hover
- `.btn-smooth-hover`
- Shell/layout: `.v3-staging-shell`, `.v3-main-content`, `.v3-app-header`, `.v3-app-sidebar`
- View Transitions + many `@keyframes` (`v3PageIn`, `v3SubViewIn`, `v3-vt-*`, `v3ButterShift`)
- Vestigial: Hundreds of `.v3-staging-page`, `.v3-shell-*`, `.v3-login-*`, `.v3-pageview-*`, `.v3-profile-*` etc. (from pre-consolidation previews) — mostly unused in current monolithic TSX.

**Recommendation for 16-agent QA**: Agent team focused on token fidelity should diff TSX inline styles vs. CSS vars + `v3Tokens.ts`; audit for drift in 77.7% card + border 0.33 rule + teal/orange discipline.

---

### 4. Production Imports (e.g., `GVGBDetailView`) and Integration Depth

- **Only one**: `import { GVGBDetailView } from '@/policy/pages/GVGBDetailView'` (line 30).
- **Usage**: Solely in `PolicyDetailPage` (lines 1199-1205) — **extremely shallow wrapper**:
  ```tsx
  function PolicyDetailPage({ navigate }) {
    return <div className="animate-butter-shift"> <GVGBDetailView onBackToLibrary={() => navigate('library')} /> </div>;
  }
  ```
- **Depth**: Zero data sharing, no styling overrides, no V3 token propagation into the imported component. Appears as a "demo hook" for one section only.
- No other production imports (no stores, no `Clinician*`, `Patient*`, `CommandCenterLayout`, etc.).

**QA Focus**: Verify visual parity when `GVGBDetailView` renders inside the V3 shell (does it respect 77.7% + glass?).

---

### 5. External Libs (GSAP, framer, etc.) in Staging

- **None imported or used** in `V3StagingApp.tsx` (or `UIStagingPage.tsx`).
- Imports limited to: React (`useState`/`useEffect`), `lucide-react` (icons), local PNG asset, one prod TSX.
- **CSS-driven only**: `animate-butter-shift`, View Transitions API (`document.startViewTransition`), `@keyframes` in `ui-staging.css`.
- Historical docs reference GSAP in old `DashboardPage.tsx` (archived) and Claude prompts; current code has none.

**QA Focus**: Confirm no accidental CDN/ dynamic GSAP loads; test transition smoothness on browsers without View Transitions support.

---

### 6. Navigation Model, State (`useState`), Transitions

- **State** (in `V3StagingApp`):
  - `activeSection: SectionId` (default `'dashboard'`)
  - `isNavOpen: boolean` (default `true`; toggled by hamburger)
  - `viewportWidth` → derived `isMobile = < 768`
- **Nav Model**: `NAV_GROUPS` (7 labeled groups, 21 primary items). Sidebar renders grouped `navitem`s with active styling. `navigate(id)` triggers transition then `setActiveSection`.
- **Transitions**: `performRouteTransition` (View Transitions API with fallback to direct `next()`). Pages wrap in `.animate-butter-shift` (CSS keyframe fade+slide). No framer/GSAP.
- **Other**: Resize listener; fixed full-screen shell with watermark; 77.7% constrained main card.

**Excerpt** (state + nav toggle):
```tsx
const [activeSection, setActiveSection] = useState<SectionId>('dashboard');
const [isNavOpen, setIsNavOpen] = useState(true);
// ...
<button onClick={() => setIsNavOpen(v => !v)}><Menu /></button>
```

**QA Focus**: Mobile collapse, active highlighting, View Transition flicker, keyboard nav in sidebar.

---

### 7. Obvious Code Smells

- **Monolithic file** (2244 LOC single file with 20+ page functions + all data + styles).
- **Duplicated inline styles**: Every card/KPI/list repeats `style={{ border: `1px solid ${V3.xxx}`, padding, ... }}` + identical grid patterns.
- **Mock data duplication**: `TASKS`, patient arrays, clinician lists, form lists, audit entries, training courses, etc. — scattered and inconsistent.
- **Incomplete / stub sections**: Many pages have non-functional tabs (e.g., Calendar/Visit tabs just styled buttons), static content, placeholder buttons with `cursor: 'pointer'` but no handlers. `'policy-detail'` is nav orphan.
- **Token duplication**: Local `V3`, unused `v3Tokens.ts`, CSS `:root` — drift risk.
- **Legacy CSS bloat**: 2157-line file carries hundreds of unused preview-era classes.
- **No separation**: No extracted `V3Card`, `V3PageWrapper` (historical docs planned them), no real data layer.
- **Hardcoded dates** (May 2026), fake MRNs, etc.

**QA Recommendations per Area** (for 16-agent team):
- **Agents 1-3 (Structure/Architecture)**: Refactor plan — extract components/tokens; measure duplication %.
- **Agents 4-7 (Visual/Design Fidelity)**: Pixel-diff every page vs. `APP_Screenshots.pdf` + CSS vars; flag inline vs. token usage.
- **Agents 8-10 (Functionality/Interactivity)**: Test all "buttons"/tabs for real behavior; simulate real data models.
- **Agents 11-13 (Integration/Production Hooks)**: Deep-dive `GVGBDetailView` + future prod imports; test isolation.
- **Agents 14-16 (Polish/Tech Debt)**: CSS audit (vestigial classes), mobile/responsive, accessibility (focus, ARIA in nav), transition perf.

---

### 8. Cross-References to "ui-staging" or "V3Staging" in `docs/UIUX/` and `_Heavy` Paths

**docs/UIUX/** (extensive historical audit context; 70+ hits across subdirs):
- `docs/UIUX/16_AGENT_CLAUDE_BATCH1_AUDIT/` (multiple): `X2-16_MASTER_CONSOLIDATED...md`, `Agent15_Production_Pageview_Reality_Report.md`, `Agent05_Patient_Profiles.md`, `Agent04_Clinician_Profiles.md`, `01_CLAUDEX2_ANALYSIS...md`, `00_MASTER_INDEX.md`, `99_Interim_Synthesis_Notes.md` — treat ui-staging as "visual comparison harness" vs. production reality + Claude promises; notes consolidation from 17+ files to current state; many references to old `V3*Preview*.tsx` + `DashboardPage.tsx`.
- `docs/UIUX/V3-Veil-Glass-Design-System-Implementation-Specs.md`: Positions old `src/ui-staging/DashboardPage.tsx` as "pixel-perfect living specification".
- Other: `CANONICAL_UI_SYSTEM_SPEC.md`, `UIUX_RECONSTRUCTION_MASTER_PLAN.md`, `16_Agent_Reports/*` (fidelity, mockup risk), `PHASE1_*` checklists.

**_Heavy/Fix-2026-05-14/** (source-of-truth for Claude-era work):
- `___claudeMCP/gemini/SourceOfTruth/`: `APP_Screenshots.pdf`, `Dashboard.html`, design specs, screenshots.
- `___claudeMCP/gemini/02_Design_System/V3_Veil_Glass_Design_Specs.md`, `03_Implementation_Guide/`, `04_Claude_Instructions/`, `Send_To_Claude/` copies.
- References frame ui-staging as the executable V3 lab harness post-audit.

**Other cross-refs**: `src/App.tsx` (route), `CES_*_V3_*.md` in `docs/` (validate against APP_Screenshots.pdf).

---

### 9. Reference Materials: `APP_Screenshots.pdf` Location + Design Spec Docs

- **Primary PDF**: `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/SourceOfTruth/APP_Screenshots.pdf` (36 pages — the canonical visual benchmark referenced everywhere).
- **Supporting screenshots**: `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/SourceOfTruth/` (PNG captures); `tmp-ui-verify-screenshots/`, `tmp-ui-staging-*.png` (root), `Builder/_system/screenshots/`, `Builder/_system/`.
- **Design Specs**:
  - `docs/UIUX/V3-Veil-Glass-Design-System-Implementation-Specs.md` (authoritative; references old staging Dashboard).
  - `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/02_Design_System/V3_Veil_Glass_Design_Specs.md` (and duplicate copies under `Send_To_Claude/`).
  - `_Heavy/Fix-2026-05-14/___claudeMCP/gemini/SourceOfTruth/DesignSpecs.md`, `Batch*.md`, `Dashboard.html`.
  - `docs/UIUX/CANONICAL_UI_SYSTEM_SPEC.md`, `UIUX_RECONSTRUCTION_MASTER_PLAN.md`, `16_POINT_*` series.
- **Additional Context**: `docs/UIUX/16_AGENT_CLAUDE_BATCH1_AUDIT/*` (full audit history of staging vs. Claude vs. prod).

**Overall Assessment**: The module is now a clean, self-contained **visual language demonstration harness** (V3StagingApp) rather than a multi-file preview graveyard. It excels at showcasing the dark veil-glass aesthetic and 77.7% contract in isolation but carries significant monolithic + duplication debt. It is **not** production code and should remain isolated.

**Top QA Priorities for 16-Agent Team**:
1. Visual parity matrix against `APP_Screenshots.pdf` + CSS tokens.
2. Token consolidation + removal of inline duplication.
3. Interactivity gaps and data-model fidelity.
4. Safe production import patterns (starting with GVGB).
5. Maintain isolation from `src/policy/*`.

This provides an exhaustive, actionable baseline. All file paths are absolute as required.