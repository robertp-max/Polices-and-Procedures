# UI-Staging QA / UAT / UIUX Audit Report
**Date:** 2026-05-20  
**Scope:** `src/ui-staging/V3StagingApp.tsx`, `src/ui-staging/UIStagingPage.tsx`, `src/ui-staging/ui-staging.css`, `src/ui-staging/v3Tokens.ts`, `src/policy/pages/GVGBDetailView.tsx`  
**Auditor:** GitHub Copilot — Comprehensive Static Analysis  
**Severity Scale:** 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low · ✅ Pass

---

## Executive Summary

The V3 Veil Glass staging shell and the GVGBDetailView policy viewer are architecturally sound and production-quality in visual terms. The dark shell with the floating card layout, view transitions, directional tab animations, and watermark are all correctly implemented. However, **18 findings** across seven categories require resolution before this can be treated as a UAT-ready reference implementation. The most critical are: (1) a **color semantic inversion** where the teal accent (positive/active) is applied to overdue and incomplete states, (2) a **hard-wired policy routing bug** that renders the wrong policy for 6 of 7 cards in the library, (3) **zero functional interactivity** on all filter chips and search inputs, and (4) **missing ARIA attributes** throughout.

---

## 1. Design System & Token Compliance

### 1.1 🟠 Local V3 Token Object Duplicates Canonical `v3Tokens.ts`
**File:** `src/ui-staging/V3StagingApp.tsx` — lines 35–46  
**Issue:** The file declares a local `const V3 = { ... }` object instead of importing from `@/ui-staging/v3Tokens`. The `v3Tokens.ts` file explicitly states: *"Do not introduce local `const V3 = {...}` objects in new previews."*  
**Specific deviation found:** `V3.borderDefault: 'rgba(255,255,255,0.15)'` whereas `v3Tokens.borderSubtle` is `'rgba(255, 255, 255, 0.12)'` — a 3-point opacity discrepancy that creates inconsistent card borders across staging sections.  
**Fix:** Replace the local `V3` const with `import { v3Tokens as V3 } from '@/ui-staging/v3Tokens'` and rename one property reference (`borderDefault` → `borderSubtle`).

---

### 1.2 🔵 CSS Variables Partially Bypassed in V3StagingApp
**File:** `V3StagingApp.tsx` — throughout  
**Issue:** Hard-coded hex/rgba values are scattered in inline styles (e.g., `'rgba(0,0,0,0.2)'` for avatar backgrounds, `'#000'` for Brad AI text) rather than referencing `var(--v3-*)` or the token object. While this is a staging app and some variation is expected, it weakens the single-source-of-truth principle when theming or palette adjustments are made.  
**Fix:** Replace magic values with corresponding CSS variables or token entries; create token entries for any gaps (e.g., `surfaceDark: 'rgba(0,0,0,0.2)'`).

---

## 2. Color Semantics & Logic Bugs

### 2.1 🔴 Teal (Positive Accent) Applied to Overdue and Pending States — Semantic Inversion
**Files:** `V3StagingApp.tsx` — `DashboardPage` task list, `MyPlannerPage` columns, `MissedVisitsPage`  
**Issue:** The teal color `#00D1C1` (the brand's "positive / active / compliant" accent) is used to highlight **overdue tasks** and **undocumented/pending** missed visits:

```tsx
// DashboardPage — overdue tasks get the positive teal border
border: task.overdue ? `1px solid rgba(0, 209, 193, 0.33)` : ...
background: task.overdue ? 'rgba(0, 209, 193, 0.03)' : 'transparent'

// MissedVisitsPage — undocumented entries also get teal highlight
border: !visit.documented ? `1px solid rgba(0, 209, 193, 0.33)` : ...
```

This is a **semantic inversion**: teal reads as "good," but it is being used to call attention to bad/warning states. A user relying on color semantics will misread these as positive statuses.  
**Fix:** Use a distinct amber/warning token (e.g., `orangeLight: '#FFA059'` at 0.33 opacity, or introduce a `--v3-warning: rgba(255,160,89,0.33)` token) for all overdue/pending/incomplete highlight states.

---

### 2.2 🔴 "Expired" Credential Status Gets Same Color as "Verified" — Identical Visual Treatment
**File:** `V3StagingApp.tsx` — `ReferringPhysiciansPage`  
**Issue:**
```tsx
color: doc.credential === 'Verified' ? V3.tealLight 
     : doc.credential === 'Expired' ? V3.tealLight   // ← BUG: same teal
     : V3.textSecondary
```
Dr. Susan Martinez's credential is **Expired** but renders in the same teal green as "Verified" — indistinguishable to any user.  
**Fix:** Assign `V3.orangeLight` (or a dedicated red token) to the `'Expired'` branch.

---

### 2.3 🟠 Brad AI User Message Label Is Black on Dark Background
**File:** `V3StagingApp.tsx` — `BradPage`  
**Issue:**
```tsx
const user = message.from === 'Admin User'
<div style={{ fontSize: 11, fontWeight: 700, color: user ? '#000' : V3.tealLight }}>
  {message.from}
</div>
<div style={{ color: user ? '#001512' : V3.textPrimary }}>
  {message.body}
</div>
```
When `user = true`, both the sender label (`#000`) and body text (`#001512`) are near-black. The message bubble background is `rgba(0,209,193,0.1)` — a very dark teal tint — making black text meet the W3C AA contrast threshold, but barely. The real issue is that these values are designed for a light background; when the chat is placed in the V3 dark shell this color is **visually inconsistent** — the user bubble appears to be a "light island" mid-dark-page with jarring black text.  
**Fix:** Use `V3.textPrimary` (`#FFFFFF`) for user message text, and use a slightly elevated glass background (e.g., `rgba(0,209,193,0.18)`) for the bubble.

---

### 2.4 🟡 `V3StagingApp` "Critical" Count Uses Same Teal as "Compliant" in Domain Library
**File:** `V3StagingApp.tsx` — `DomainLibraryPage`  
**Issue:**
```tsx
<div style={{ fontSize: '18px', fontWeight: 600, color: V3.tealLight }}>{domain.compliant}</div>
// ...
<div style={{ fontSize: '18px', fontWeight: 600, color: V3.tealLight }}>{domain.critical}</div>
```
Both "Compliant" and "Critical" KPI metrics use identical teal color. The "Critical" count is a **concern metric** — it should visually contrast with the positive "Compliant" reading. For CL domain: 15 critical controls get the same green as 34 compliant ones.  
**Fix:** Use `V3.orangeLight` for the "Critical" count to establish semantic differentiation.

---

## 3. Functional Interactivity Gaps (UAT Blockers)

### 3.1 🟠 All Search Inputs Are Decorative — No Handler Attached
**Affected pages:** DashboardPage header, CliniciansPage, PatientsPage, PolicyLibraryPage, DomainLibraryPage, ReferringPhysiciansPage, FormsLibraryPage, UserGuidesPage, BradPage  
**Issue:** Every `<input>` element lacks `onChange`, `onInput`, or any filtering logic. Typing produces no result. This makes the search fields **non-functional UI chrome**.  
**Fix for UAT:** At minimum, attach a controlled `value` + `onChange` to each search field and filter the rendered dataset client-side. For staging, even a naive `filter(item => JSON.stringify(item).toLowerCase().includes(searchTerm))` makes the demo credible.

---

### 3.2 🟠 All Filter Chips / Domain Tabs Are Static — Cannot Change Active State
**Affected pages:** CliniciansPage (status chips), PolicyLibraryPage (domain + lifecycle tabs), FormsLibraryPage (status chips), CalendarPage (category chips), VisitSchedulePage (Today/This Week + Zone tabs), MissedVisitsPage (reason filter)  
**Issue:** Active state is hardcoded to `index === 0` — clicking other chips does nothing. The `onClick` on these is omitted entirely.  
**Fix:** Introduce a `const [activeFilter, setActiveFilter] = useState(0)` per page and toggle on click.

---

### 3.3 🟡 Brad AI "Send" Button Has No Handler
**File:** `V3StagingApp.tsx` — `BradPage`  
**Issue:** The Send button and input have no `onClick` or `onKeyDown` for submit. For a demo of an "AI Copilot," this is the primary interaction point — it must at minimum append the user message to the `messages` array and show a canned response.  
**Fix:** Convert `messages` to `useState`, add `onKeyDown` Enter handler and `onClick` to Send, append a stubbed Brad response.

---

### 3.4 🟠 All Policy Library Cards Route to GV-GB-001 Regardless of Which Card Is Clicked
**File:** `V3StagingApp.tsx` — `PolicyLibraryPage`, `PolicyDetailPage`  
**Issue:**
```tsx
// Every card navigates to 'policy-detail'
onClick={() => navigate('policy-detail')}

// PolicyDetailPage always renders GVGBDetailView — hardcoded
function PolicyDetailPage({ navigate }) {
  return <GVGBDetailView onBackToLibrary={() => navigate('library')} />
}
```
Clicking "QAPI Trend Escalation Standard" or "ePHI Access Control Matrix" opens the "Governing Body Authority" detail view — misleading in a demo context.  
**Fix options:** Either (a) only navigate to detail on the GV-GB-001 card and show a "Full viewer coming soon" toast/modal for others, or (b) pass the policy `id` through state and conditionally render `<SharedPolicyDetailView policyId={id} />` (the generic viewer already exists at `src/policy/components/SharedPolicyDetailView.tsx`).

---

### 3.5 🔵 "Add Physician", "Start eCign", "Open", "Document" Buttons Have No Handlers
**Files:** `ReferringPhysiciansPage`, `FormsLibraryPage`, `MissedVisitsPage`  
**Issue:** Action buttons have no `onClick`. In a UAT context, these should at minimum show a toast or modal stub.  
**Fix:** Add no-op handlers with `console.log` or a `window.alert('Feature coming soon')` for UAT sessions, or wire to the real action flows.

---

## 4. Accessibility (A11y)

### 4.1 🟠 All Search Inputs Missing `aria-label`
**Issue:** Every `<input>` search field uses only `placeholder` for its accessible name. Placeholders disappear on type and are not read as labels by all screen readers.  
**Example:**
```tsx
<input placeholder="Search operations, policies..." 
  style={{ background: 'transparent', border: 'none', ... }} />
```
**Fix:** Add `aria-label="Search operations and policies"` to each search input.

---

### 4.2 🟠 Sidebar Nav Has No `aria-label`
**File:** `V3StagingApp.tsx`  
**Issue:** The `<aside>` element has no `aria-label="Main navigation"`. Screen readers will announce it as a generic "complementary landmark."  
**Fix:** `<aside aria-label="Main navigation">`.

---

### 4.3 🟠 Tab Buttons in GVGBDetailView Lack ARIA Tab Role Semantics
**File:** `GVGBDetailView.tsx` — sticky nav row  
**Issue:** The 7 section tabs ("Overview & Definitions", "Policy Statements", etc.) are styled as tabs with active underlines but implemented as plain `<button>` elements without:
- `role="tab"`
- `aria-selected={activeTab === id}`
- Wrapping `role="tablist"`
- `role="tabpanel"` on the content area

Screen readers cannot interpret this as a tab widget — they'll read it as 7 disconnected buttons.  
**Fix:**
```tsx
<div role="tablist" aria-label="Policy sections" ...>
  <button role="tab" aria-selected={activeTab === id} ...>
```
And wrap the content `<div>` with `role="tabpanel"`.

---

### 4.4 🟡 Filter/Category Chips Missing `aria-pressed`
**Issue:** Every active filter chip (index === 0 hard-coded active state) has no `aria-pressed="true"` to communicate selection state to screen readers.  
**Fix:** Add `aria-pressed={activeFilter === index}` to each chip button.

---

### 4.5 🟡 Nav Items in V3StagingApp Sidebar Missing `aria-current`
**Issue:** Active nav items get visual styling but no `aria-current="page"` attribute.  
**Fix:** Add `aria-current={active ? 'page' : undefined}` to each nav button.

---

### 4.6 🔵 Keyboard Navigation: GVGBDetailView Tab Arrow Keys Compete with Browser
**File:** `GVGBDetailView.tsx` — `useEffect` keyboard handler  
**Issue:** The `ArrowLeft`/`ArrowRight` handler calls `e.preventDefault()` — this suppresses browser default behavior (horizontal scroll, slider controls) globally while the policy viewer is mounted. This could interfere with other keyboard-navigable elements inside the content panels (e.g., scrollable tables, the forms within `ViewAppendices`).  
**Fix:** Only intercept arrow keys when the focus is on the tab bar itself, not globally. Move `e.preventDefault()` inside a guard checking `document.activeElement` is within the tab strip.

---

### 4.7 🔵 GVGBDetailView Procedure Subtabs Default to `'6.2'` — Not the First Tab
**File:** `GVGBDetailView.tsx` — `ViewProcedures`  
**Issue:**
```tsx
const [activeSub, setActiveSub] = useState('6.2');
```
`PROCEDURE_SUBTABS` is ordered `['6.1', '6.2', '6.3', '6.4', '6.5']`. The component loads showing tab **6.2 — Core Responsibilities** (the most complex section with 6 subsections) rather than 6.1, which is the natural entry point.  
**UX impact:** Users landing on the Procedures tab see a large warning banner and a wall of nested tables before seeing the simpler establishment steps.  
**Fix:** Change to `useState('6.1')`.

---

## 5. Policy Viewer (GVGBDetailView) — Specific Findings

### 5.1 ✅ Directional Tab Animation
Correctly implemented. `direction` state, `contentKey` increment, CSS classes `gvgb-enter-right` / `gvgb-enter-left`, and `ANIMATION_CONFIG` centralised const — all working per spec.

### 5.2 ✅ View Transitions API Integration in V3StagingApp
`performRouteTransition` with graceful fallback — correct.

### 5.3 ✅ GVGBDetailView Sticky Nav Row
`sticky top-0 z-20` within `contain: paint` wrapper — renders cleanly without interfering with the shell's z-index 9000 layer since it's scoped to the content pane.

### 5.4 ✅ `useShellStore` Detail Mode Toggle
Calls `setDetailMode(true)` on mount and restores on unmount — correct lifecycle management.

### 5.5 🟡 `ViewCompliance` 8.3 Section Has Hidden Overflow Without Scroll Affordance
**Issue:** The "Common Failure Points" card has `max-h-[420px] overflow-y-auto` but there is no visible scrollbar (CSS hides scrollbars globally in `.v3-staging-shell *`), and no gradient fade or scroll indicator at the bottom.  
**Fix:** Add a bottom gradient fade to the card:
```css
.gvgb-scroll-fade::after {
  content: '';
  position: sticky;
  bottom: 0;
  display: block;
  height: 32px;
  background: linear-gradient(to top, #ffffff, transparent);
  pointer-events: none;
}
```
Note: This is inside a light card (`bg-white`) not the dark shell, so fade to white is correct here.

### 5.6 🔵 `FormViewer` Inside `ViewAppendices` Has No Explicit Loading State
**Issue:** `<FormViewer formId={active.id} enableEmbeddedSigning />` loads async form data with no explicit fallback beyond whatever `FormViewer` provides internally. If `getFormsForPolicy('GV-GB-001')` returns an empty array, the component renders a text fallback — this is handled. But the loading state between form ID changes (when switching appendix tabs) has no skeleton or spinner.  
**Fix:** Wrap `FormViewer` in a `<Suspense fallback={<div>Loading form...</div>}>` or verify `FormViewer`'s internal loading UI is sufficient.

### 5.7 🔵 Print Route `openPolicyPrintRoute` — No Validation of Form ID
**File:** `GVGBDetailView.tsx` — `ViewAppendices`  
**Issue:**
```tsx
onClick={() => openPolicyPrintRoute(`/print/GV-GB-001/appendix/${encodeURIComponent(active.id)}`)}
```
`active.id` is URL-encoded but not validated against known form IDs before routing. If `active` is undefined (edge case), this will throw.  
**Fix:** Guard: `if (active?.id) openPolicyPrintRoute(...)` (already partially guarded by the early return, but the early return is on `!active` before `forms[0]` — tight).

---

## 6. Navigation & Routing

### 6.1 🔵 `'policy-detail'` Is in the `SectionId` Type but Not in `NAV_GROUPS`
**File:** `V3StagingApp.tsx`  
**Issue:** `policy-detail` exists as a navigable section but has no sidebar entry. This is intentional (it's a drill-down, not a top-level nav item), but it means the "back" affordance (← Library button inside GVGBDetailView) is the **only** exit. If a user copies the URL or the state is lost, there's no direct sidebar re-entry.  
**Recommendation:** This is acceptable for a staging SPA, but note it if this pattern is adopted for production.

### 6.2 🟡 Calendar, Visit Schedule, Missed Visits Show Static May 2026 Data
**Issue:** The calendar hardcodes `May 2026` as the header and date `20` as "today." The VisitSchedulePage dynamically uses `new Date().toLocaleDateString(...)` for its header (correct), but the event data array is static. As the staging environment is accessed in future dates, the "today" marker and overdue task markers will become stale.  
**Fix:** Either (a) derive all dates dynamically from `new Date()`, or (b) add a prominent staging timestamp disclaimer ("Data as of 2026-05-20").

---

## 7. Performance & Code Architecture

### 7.1 🟡 `V3StagingApp.tsx` Is a ~2,100-Line Monolith
**Issue:** All 20+ page components are defined in a single file. This is common in staging/prototype contexts but creates:
- Long compile times in watch mode
- Difficult code review and targeted editing
- Risk of accidental scope collisions

**Recommendation:** Not a blocker for UAT, but note this before any production promotion. Split into `V3StagingPages/` sub-directory.

### 7.2 🔵 Missing `type="button"` on Several Buttons in V3StagingApp
**Affected:** `ReferringPhysiciansPage` "Add Physician" button (has no `type="button"`), subdomain `<span>` elements that have `className="btn-smooth-hover"` but are not `<button>` elements.  
**Issue:** `<span>` with a button class is not keyboard-accessible — it won't receive focus via Tab and won't trigger on Enter/Space.  
**Fix:** Convert subdomain chips in DomainLibraryPage to `<button type="button">` elements.

### 7.3 🔵 `useEffect` Dependency Warning Potential in GVGBDetailView
**Issue:** The keyboard navigation `useEffect` in `GVGBDetailView.tsx` depends on `activeTab` but the dependency is listed — this is correct. However, calling `setActiveTab` inside `useEffect` with `activeTab` in deps will re-register the handler on every tab change. The cleanup `return () => window.removeEventListener(...)` ensures no double-registration. ✅ No actual bug, but worth noting.

---

## 8. Responsive Design

### 8.1 🟡 Sidebar + Card Layout May Overflow at 768–900px Breakpoint
**File:** `V3StagingApp.tsx`  
**Issue:** The outer shell uses `flex: 1` with `overflow: 'hidden'`. The content card has `minWidth: 'min(980px, 95vw)'`. On viewports between 768px (mobile threshold) and ~1240px (where 77.7% of the parent exceeds 980px), the sidebar (260px when open) may push the card below minimum comfortable reading width.  
**Test case:** At 900px viewport with sidebar open: available for card = 900 - 260 - 56px padding = ~584px, but `minWidth` forces it to `min(980, 855) = 855px` → horizontal scroll occurs inside the shell.  
**Fix:** Reduce `minWidth` on tablet to `min(720px, 95vw)` or auto-close the sidebar at ≤900px viewport.

### 8.2 🔵 GVGBDetailView Tab Strip Overflow Not Visible on 375px Viewport
**File:** `GVGBDetailView.tsx`  
**Issue:** The sticky nav row has `overflow-x: auto` on the tab container, but the 7 tab labels at 13px (`font-montserrat font-semibold`) will require ~900px to display without scrolling. On mobile, the tab strip will scroll horizontally — this is acceptable but there is **no visual affordance** (no scroll shadow or "→" indicator) that more tabs exist off-screen.  
**Fix:** Add a right-side gradient fade on the tab strip container to indicate horizontal scroll.

---

## 9. Summary Table

| # | Severity | Category | Finding |
|---|----------|----------|---------|
| 2.1 | 🔴 Critical | Color Semantics | Teal accent on overdue/pending states (semantic inversion) |
| 2.2 | 🔴 Critical | Color Semantics | "Expired" credential same color as "Verified" |
| 3.4 | 🟠 High | Functional | All policy cards route to GV-GB-001 detail regardless of selection |
| 3.1 | 🟠 High | Functional | All search inputs non-functional |
| 3.2 | 🟠 High | Functional | All filter chips static / non-interactive |
| 2.3 | 🟠 High | Color / Contrast | Brad AI user message black text in dark shell |
| 4.1 | 🟠 High | A11y | Search inputs missing aria-label |
| 4.2 | 🟠 High | A11y | Sidebar nav missing aria-label |
| 4.3 | 🟠 High | A11y | GVGBDetailView tabs missing ARIA tab role semantics |
| 1.1 | 🟠 High | Design System | Local V3 token const deviates from canonical v3Tokens.ts |
| 3.3 | 🟡 Medium | Functional | Brad AI Send button has no handler |
| 2.4 | 🟡 Medium | Color Semantics | "Critical" count same teal as "Compliant" in Domain Library |
| 4.4 | 🟡 Medium | A11y | Filter chips missing aria-pressed |
| 4.5 | 🟡 Medium | A11y | Nav items missing aria-current |
| 4.7 | 🟡 Medium | UX | GVGBDetailView Procedures default subtab is 6.2 not 6.1 |
| 5.5 | 🟡 Medium | UX | Compliance 8.3 scrollable overflow has no affordance |
| 6.2 | 🟡 Medium | Data | Static May 2026 date data will become stale |
| 8.1 | 🟡 Medium | Responsive | Sidebar + card min-width collision at 768–900px |
| 3.5 | 🔵 Low | Functional | Action buttons (Add Physician, Start eCign, Document) no-ops |
| 1.2 | 🔵 Low | Design System | Hard-coded magic values bypass CSS variable tokens |
| 4.6 | 🔵 Low | A11y | Arrow key handler interferes with nested keyboard navigable elements |
| 5.6 | 🔵 Low | UX | FormViewer in appendices has no loading state for tab switch |
| 5.7 | 🔵 Low | Code | openPolicyPrintRoute form ID not guarded |
| 7.2 | 🔵 Low | Code | Subdomain chips are `<span>` not `<button>` — not keyboard accessible |
| 8.2 | 🔵 Low | Responsive | GVGBDetailView tab strip no horizontal scroll affordance on mobile |

---

## 10. Passing Items (Notable Quality Wins)

| # | Area | Finding |
|---|------|---------|
| ✅ | View Transitions | `performRouteTransition` with `document.startViewTransition` + fallback — correctly implemented |
| ✅ | GVGBDetailView Animation | Directional `gvgb-enter-right` / `gvgb-enter-left` with `ANIMATION_CONFIG` singleton — clean and maintainable |
| ✅ | GVGBDetailView Sticky Nav | `sticky top-0 z-20` within `contain: paint` — no z-index conflicts with shell |
| ✅ | Theme Isolation | `UIStagingPage.tsx` removes `data-theme`, restores on unmount — correct lifecycle |
| ✅ | TypeScript | Zero TS errors across all three audited files |
| ✅ | V3 token file | `v3Tokens.ts` is well-structured and matches `ui-staging.css :root` |
| ✅ | Shell CSS | `animate-butter-shift`, `btn-smooth-hover`, `v3-invisible-glare` — correctly defined and scoped |
| ✅ | Document title | `GVGBDetailView` sets and restores `document.title` on mount/unmount |
| ✅ | Keyboard tab nav | Arrow key navigation between GVGBDetailView tabs — implemented with correct cleanup |
| ✅ | Mobile detection | `viewportWidth < 768` + `useEffect` resize handler — correctly reactive |
| ✅ | Watermark accessibility | `aria-hidden` on decorative watermark image — correct |
| ✅ | Back navigation | `GVGBDetailView` `onBackToLibrary` prop pattern correctly decouples from router context |
| ✅ | GVGBDetailView initial render | `contentKey === 0` guard prevents enter animation on first load |
| ✅ | Print route | `openPolicyPrintRoute` used consistently for full policy and per-appendix print targets |
| ✅ | Policy metadata | All real Care Indeed / CFR data — no Lorem Ipsum placeholders |

---

## 11. Priority Fix Order for Next Sprint

**Phase 1 — Before any stakeholder UAT session:**
1. Fix 2.2 — "Expired" credential color bug (5-minute fix)
2. Fix 2.1 — Overdue/pending semantic color inversion (10 minutes — swap teal for orange on warning states)
3. Fix 3.4 — Policy library card routing (route only GV-GB-001 to detail; show modal stub for others)
4. Fix 4.7 — GVGBDetailView procedures default subtab to 6.1

**Phase 2 — Core interactivity for credible demo:**
5. Fix 3.1 — Attach search filter handlers to Clinicians, Patients, Policy Library
6. Fix 3.2 — Make domain + lifecycle filter chips stateful in Policy Library
7. Fix 3.3 — Brad AI stub reply on Send

**Phase 3 — Accessibility baseline (required before any compliance review audience):**
8. Fix 4.1 — `aria-label` on all search inputs
9. Fix 4.2 — `aria-label` on `<aside>` nav
10. Fix 4.3 — ARIA tab semantics on GVGBDetailView nav
11. Fix 1.1 — Migrate to canonical `v3Tokens` import

**Phase 4 — Polish and hardening:**
12–25: Remaining medium and low items per section 9 table above.

---

*Report generated by static analysis of source files at commit state 2026-05-20.*  
*No runtime or browser execution was performed. Screenshot-based visual verification recommended as a complementary step.*
