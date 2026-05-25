# UI-Staging Implementation Plan
**Synthesized from:** QA/UAT/UIUX Audit (2026-05-20) + 16-Agent Blueprint + Page Completeness Matrix + Structural Baseline  
**Date:** 2026-05-20  
**Owner:** Engineering  

---

## Source Documents (Input to This Plan)

| Doc | Produced By | Key Contribution |
|-----|-------------|-----------------|
| `UI-STAGING-QA-UAT-UIUX-AUDIT-2026-05-20.md` | GitHub Copilot static analysis | 25 findings with exact file:line, severity ratings, fix descriptions |
| `00_PAGE_COMPLETENESS_MATRIX.md` | Grok 4.3 swarm prep | Per-page completeness scoring, mock data inventory, V3 fidelity ratings |
| `00_EXPLORATION_BASELINE_STRUCTURAL.md` | Grok 4.3 swarm prep | File structure, token drift analysis, import graph, class usage map |
| `00_16_AGENT_DEPLOYMENT_BLUEPRINT.md` | Grok 4.3 swarm prep | 16 specialized audit dimensions with expected deliverable scope |

---

## Consolidated Issue Register

Cross-referenced across all four sources. Items marked `[QA]` = from my audit, `[PCM]` = Page Completeness Matrix, `[SB]` = Structural Baseline.

| ID | Severity | Source | File(s) | Line(s) | Issue |
|----|----------|--------|---------|---------|-------|
| I-01 | 🔴 P0 | [QA] | V3StagingApp.tsx | ~636,759,1832 | Teal accent used on overdue/pending states — semantic inversion |
| I-02 | 🔴 P0 | [QA] | V3StagingApp.tsx | ~1664 | "Expired" credential same teal color as "Verified" |
| I-03 | 🟠 P1 | [QA] | V3StagingApp.tsx | 1199-1205 | All 7 policy cards route to GV-GB-001 regardless of selection |
| I-04 | 🟠 P1 | [QA][PCM] | V3StagingApp.tsx | throughout | All search `<input>` are decorative — no onChange/filter logic |
| I-05 | 🟠 P1 | [QA][PCM] | V3StagingApp.tsx | throughout | All filter/tab chips are hardcoded `index === 0` active — non-interactive |
| I-06 | 🟠 P1 | [QA] | V3StagingApp.tsx | ~35 | Local `V3` const duplicates and deviates from canonical `v3Tokens.ts` |
| I-07 | 🟠 P1 | [QA] | GVGBDetailView.tsx | ~770 | Tab `role` semantics missing (no `role="tab"`, `role="tablist"`, `role="tabpanel"`) |
| I-08 | 🟠 P1 | [QA] | V3StagingApp.tsx | throughout | All search inputs missing `aria-label` |
| I-09 | 🟠 P1 | [QA] | V3StagingApp.tsx | ~405 | `<aside>` sidebar missing `aria-label="Main navigation"` |
| I-10 | 🟡 P2 | [QA] | V3StagingApp.tsx | ~968,1070 | Brad AI Send button and input have no handler |
| I-11 | 🟡 P2 | [QA] | V3StagingApp.tsx | ~2410 | "Critical" domain count same color as "Compliant" in DomainLibraryPage |
| I-12 | 🟡 P2 | [QA] | GVGBDetailView.tsx | ~710 | Procedures sub-tab defaults to `'6.2'` not `'6.1'` |
| I-13 | 🟡 P2 | [QA] | V3StagingApp.tsx | ~480 | Filter chips missing `aria-pressed` |
| I-14 | 🟡 P2 | [QA] | V3StagingApp.tsx | ~432 | Nav items missing `aria-current="page"` |
| I-15 | 🟡 P2 | [QA][PCM] | V3StagingApp.tsx | ~1580 | DomainLibrary subdomain chips are `<span>` not `<button>` — not keyboard accessible |
| I-16 | 🟡 P2 | [QA] | V3StagingApp.tsx | ~300 | Sidebar + card min-width collision at 768–900px viewport |
| I-17 | 🟡 P2 | [QA] | GVGBDetailView.tsx | ~620 | Compliance 8.3 scrollable overflow has no visual affordance (gradient fade needed) |
| I-18 | 🟡 P2 | [PCM][SB] | V3StagingApp.tsx | throughout | Index-based React keys in ~6 `.map()` calls |
| I-19 | 🔵 P3 | [QA][SB] | V3StagingApp.tsx | throughout | 2244 LOC monolith — no extracted V3 primitives |
| I-20 | 🔵 P3 | [SB] | ui-staging.css | throughout | ~600 LOC vestigial classes from pre-consolidation era (`.v3-shell-*`, `.v3-login-*` etc.) — dead weight |
| I-21 | 🔵 P3 | [QA][SB] | V3StagingApp.tsx | throughout | Brad AI user bubble uses black text (`#000`, `#001512`) in dark shell |
| I-22 | 🔵 P3 | [PCM] | V3StagingApp.tsx | ~93 | Hardcoded May 2026 dates in TASKS array — will become stale |
| I-23 | 🔵 P3 | [QA] | GVGBDetailView.tsx | ~640 | ArrowKey global handler bypasses focus guard — could conflict with nested elements |
| I-24 | 🔵 P3 | [QA] | V3StagingApp.tsx | throughout | Action buttons (Add Physician, Start eCign, Document, Launch) — no stub handlers |
| I-25 | 🔵 P3 | [QA] | GVGBDetailView.tsx | ~680 | ViewAppendices FormViewer has no loading state on tab switch |

---

## Sprint Plan

### Sprint 0 — Bug Fixes (Same Day, ~2 hours)
**Goal:** Zero color semantic inversions before any demo or stakeholder review. Pure code fixes, no architecture work.

---

#### S0-01 · Fix overdue/pending teal highlight → orange  
**Issues:** I-01  
**Files:** `src/ui-staging/V3StagingApp.tsx`  
**Effort:** S (15 min)

Find all 3 locations where `rgba(0, 209, 193, ...)` is applied to warning/incomplete states and replace with `rgba(255, 160, 89, ...)` (V3.orangeLight at matching opacity):

1. **DashboardPage task list** (~line 636):  
   `border: task.overdue ? '1px solid rgba(0, 209, 193, 0.33)'` → `'1px solid rgba(255, 160, 89, 0.33)'`  
   `background: task.overdue ? 'rgba(0, 209, 193, 0.03)'` → `'rgba(255, 160, 89, 0.03)'`  
   Due date text: `color: task.overdue ? V3.tealLight` → `V3.orangeLight`

2. **MyPlannerPage overdue column items** (~line 759):  
   Same treatment — `border`/`background` for overdue tasks.

3. **MissedVisitsPage undocumented rows** (~line 1832):  
   `!visit.documented` border/background — teal → orange.  
   "Document" action button border+color — teal → orange.

**Acceptance:** Overdue tasks and undocumented missed visits render with amber/orange highlight; compliant/active items remain teal.

---

#### S0-02 · Fix "Expired" credential color  
**Issue:** I-02  
**File:** `src/ui-staging/V3StagingApp.tsx` (~line 1664)  
**Effort:** S (5 min)

```tsx
// Before
color: doc.credential === 'Verified' ? V3.tealLight : doc.credential === 'Expired' ? V3.tealLight : V3.textSecondary

// After
color: doc.credential === 'Verified' ? V3.tealLight
     : doc.credential === 'Expired'  ? V3.orangeLight
     : V3.textSecondary
```

**Acceptance:** Dr. Susan Martinez's "Expired" row renders orange. "Verified" remains teal. "Pending" renders textSecondary.

---

#### S0-03 · Fix "Critical" domain count color  
**Issue:** I-11  
**File:** `src/ui-staging/V3StagingApp.tsx` (DomainLibraryPage, ~line 1590)  
**Effort:** S (5 min)

```tsx
// Before: both use V3.tealLight
<div style={{ color: V3.tealLight }}>{domain.critical}</div>

// After
<div style={{ color: V3.orangeLight }}>{domain.critical}</div>
```

**Acceptance:** Critical count column reads orange; Compliant count reads teal — visually distinct.

---

#### S0-04 · GVGBDetailView procedures subtab default to '6.1'  
**Issue:** I-12  
**File:** `src/policy/pages/GVGBDetailView.tsx` (~line 710)  
**Effort:** S (2 min)

```tsx
// Before
const [activeSub, setActiveSub] = useState('6.2');

// After
const [activeSub, setActiveSub] = useState('6.1');
```

**Acceptance:** Opening the Procedures tab shows "6.1 Establishment and Composition" — the logical entry point.

---

#### S0-05 · Fix DomainLibrary subdomain chips span → button  
**Issue:** I-15  
**File:** `src/ui-staging/V3StagingApp.tsx` (~line 1580)  
**Effort:** S (10 min)

```tsx
// Before
<span key={sub} className="btn-smooth-hover" style={{ cursor: 'pointer', ... }}>
  {sub}
</span>

// After
<button key={sub} type="button" className="btn-smooth-hover" 
  style={{ cursor: 'pointer', background: 'transparent', ... }}>
  {sub}
</button>
```

**Acceptance:** Subdomain chips are Tab-focusable and trigger on Enter/Space.

---

### Sprint 1 — Demo-Ready Interactivity (~1 day)
**Goal:** The 4 most-visited pages have working search and filter. Policy library routes correctly. Brad AI is responsive.

---

#### S1-01 · Policy library — correct card routing  
**Issue:** I-03  
**File:** `src/ui-staging/V3StagingApp.tsx` (PolicyLibraryPage ~line 1160, PolicyDetailPage ~line 1199)  
**Effort:** M (30 min)

**Step 1:** Route only GV-GB-001 to the real detail view:
```tsx
onClick={() => {
  if (policy.id === 'GV-GB-001') {
    navigate('policy-detail');
  } else {
    // stub for non-implemented policies
    // e.g. show a toast or do nothing visible
  }
}}
```

**Step 2:** Add a visual affordance that tells users which policies have a live viewer vs. coming-soon:
- Add a `liveViewer: boolean` field to each policy object.
- Show a small "Live" badge (teal, like the current "Featured" orange badge) only on GV-GB-001.
- On click of non-live policies, add a subtle opacity flash or no-op (avoid hard alert dialogs in staging).

**Acceptance:** Clicking GV-GB-001 opens the full detail. Clicking any other policy does not navigate (or shows an appropriate "viewer not yet available" signal).

---

#### S1-02 · Live search on Policy Library  
**Issue:** I-04 (PolicyLibraryPage)  
**File:** `src/ui-staging/V3StagingApp.tsx` (~line 1090)  
**Effort:** M (30 min)

Add controlled state and filter inside `PolicyLibraryPage`:
```tsx
function PolicyLibraryPage({ navigate }) {
  const [q, setQ] = useState('');
  const filtered = policies.filter(p =>
    !q || p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.id.toLowerCase().includes(q.toLowerCase()) ||
          p.domain.toLowerCase().includes(q.toLowerCase())
  );
  // ...
  <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search policy title, owner, domain..." />
  // render `filtered` instead of `policies`
```

**Acceptance:** Typing "gov" filters to governance policies in real time. Clearing restores all cards.

---

#### S1-03 · Domain filter chips stateful in Policy Library  
**Issue:** I-05 (PolicyLibraryPage domain chips)  
**File:** `src/ui-staging/V3StagingApp.tsx` (~line 1120)  
**Effort:** M (20 min)

```tsx
const [activeDomain, setActiveDomain] = useState('All Domains');
const domains = ['All Domains','Clinical','QAPI','Safety','HR','IT','Governance'];

// Filter:
const filtered = policies.filter(p =>
  activeDomain === 'All Domains' || p.domain === activeDomain
);

// Chip active state:
background: tab === activeDomain ? 'rgba(0,209,193,0.1)' : 'transparent'
onClick={() => setActiveDomain(tab)}
```

**Acceptance:** Clicking "Clinical" shows only clinical policies. Clicking "All Domains" restores all. Domain filter composes with search (I-02 above).

---

#### S1-04 · Clinician search filter  
**Issue:** I-04 (CliniciansPage)  
**File:** `src/ui-staging/V3StagingApp.tsx` (~line 795)  
**Effort:** S (15 min)

```tsx
function CliniciansPage() {
  const [q, setQ] = useState('');
  const filtered = CLINICIANS.filter(c =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.role.toLowerCase().includes(q.toLowerCase())
  );
  // ...
  <input value={q} onChange={e => setQ(e.target.value)} ... />
  {filtered.map(person => ...)}
```

**Acceptance:** Typing "RN" filters to Marcus Sterling. Backspace restores all 6.

---

#### S1-05 · Brad AI — stub conversation loop  
**Issue:** I-10  
**File:** `src/ui-staging/V3StagingApp.tsx` (BradPage ~line 967)  
**Effort:** M (30 min)

Convert static messages to state and add interaction:
```tsx
function BradPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const BRAD_STUBS = [
    'Analyzing your request...',
    'I found 3 relevant policy items. Shall I generate a remediation sprint?',
    'Understood. I\'ve drafted an action plan for the assigned owners.',
    'No gaps detected for this query. Your controls appear current.',
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'Admin User', body: input.trim() };
    const bradMsg = { from: 'Brad AI', body: BRAD_STUBS[messages.length % BRAD_STUBS.length] };
    setMessages(prev => [...prev, userMsg, bradMsg]);
    setInput('');
  };

  return (
    ...
    <input value={input} onChange={e => setInput(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && handleSend()} />
    <button onClick={handleSend} type="button">Send</button>
  );
}
```

Also fix user message text color (I-21): change `color: user ? '#000'` → `color: V3.textPrimary` and bubble background to `rgba(0,209,193,0.18)`.

**Acceptance:** Typing a message and pressing Enter or Send appends the user message and a Brad response. Conversation scrolls to latest. Input clears after send.

---

#### S1-06 · Visit Schedule — date filter chips stateful  
**Issue:** I-05 (VisitSchedulePage)  
**File:** `src/ui-staging/V3StagingApp.tsx` (~line 1700)  
**Effort:** S (15 min)

```tsx
const [activeDate, setActiveDate] = useState('Today');
const dateTabs = ['Today', 'Tomorrow', 'This Week', 'Next Week'];
// onClick={() => setActiveDate(tab)}
// active state based on activeDate === tab
```

No need for data filtering — just visual state is sufficient for this page (data is a static list). The visual feedback is the UX win.

**Acceptance:** Clicking "This Week" highlights it as active. Clicking "Today" returns to default. Zone filter chips follow same pattern.

---

### Sprint 2 — Design System Cleanup (~half day)
**Goal:** Eliminate token drift. Add ARIA baseline. Fix React warnings.

---

#### S2-01 · Migrate local V3 const to canonical v3Tokens import  
**Issue:** I-06  
**File:** `src/ui-staging/V3StagingApp.tsx` (line 32-45)  
**Effort:** M (45 min)

```tsx
// Before (line 32)
const V3 = {
  baseBg: '#05060A',
  ...
  borderDefault: 'rgba(255,255,255,0.15)',
  borderHighlight: 'rgba(255,255,255,0.33)',
} as const

// After
import { v3Tokens } from '@/ui-staging/v3Tokens';

// Then throughout the file:
// V3.tealLight → v3Tokens.tealLight   (same value, no change needed)
// V3.orangeLight → v3Tokens.orangeLight
// V3.textSecondary → v3Tokens.textSecondary
// V3.borderDefault → v3Tokens.borderSubtle  (0.12 → replaces 0.15, slight tightening)
// V3.borderHighlight → v3Tokens.border     (both 0.33, direct match)
// V3.glass3 → v3Tokens.glass3
// etc.
```

Note: `v3Tokens` does not currently export `bgGradient` as a standalone. Either add it to `v3Tokens.ts` or keep the `bgGradient` inline in the one place it's used (the shell wrapper style).

**Acceptance:** `grep "const V3 = {" src/ui-staging/V3StagingApp.tsx` returns no results. TypeScript compiles clean. All visual rendering unchanged.

---

#### S2-02 · ARIA: labels, nav, search inputs  
**Issues:** I-08, I-09, I-13, I-14  
**Files:** `src/ui-staging/V3StagingApp.tsx`  
**Effort:** M (30 min)

Add in one pass:

1. **Sidebar `<aside>`:**  
   `<aside aria-label="Main navigation" ...>`

2. **Nav items** — add `aria-current`:
   ```tsx
   <button aria-current={active ? 'page' : undefined} ...>
   ```

3. **Filter chips** — add `aria-pressed`:
   ```tsx
   <button aria-pressed={activeFilter === index} ...>
   ```
   (Wire after S1-03/S1-06 make chips stateful; until then add `aria-pressed={index === 0}`)

4. **All search inputs** — add `aria-label`:
   ```tsx
   // Header global search
   <input aria-label="Search operations and policies" placeholder="Search operations, policies..." />
   // Per-page search inputs
   <input aria-label="Search clinicians" placeholder="Search clinicians..." />
   <input aria-label="Search patients" placeholder="Search patients..." />
   <input aria-label="Search policy library" placeholder="Search policy title, owner, domain..." />
   // etc. — unique label per context
   ```

**Acceptance:** axe DevTools or similar tool reports zero "label" violations on the staging shell. Screen reader announces "Main navigation" when tabbing into the sidebar.

---

#### S2-03 · ARIA: GVGBDetailView tab semantics  
**Issue:** I-07  
**File:** `src/policy/pages/GVGBDetailView.tsx` (~line 770)  
**Effort:** M (30 min)

```tsx
// Tab list wrapper
<div role="tablist" aria-label="Policy sections" className="flex-1 overflow-x-auto">
  <div className="flex min-w-max h-full">
    {NAV_TABS.map(({ id, label, Icon }) => (
      <button
        key={id}
        role="tab"
        aria-selected={activeTab === id}
        id={`gvgb-tab-${id}`}
        aria-controls={`gvgb-panel-${id}`}
        onClick={() => navigateToTab(id)}
        ...
      >
        <Icon size={14} /> {label}
      </button>
    ))}
  </div>
</div>

// Content panel
<div
  key={contentKey}
  role="tabpanel"
  id={`gvgb-panel-${activeTab}`}
  aria-labelledby={`gvgb-tab-${activeTab}`}
  className={`p-5 lg:p-7 bg-[#FAFBF8] ${animClass}`}
>
  {renderContent()}
</div>
```

**Acceptance:** Screen reader announces "Policy sections tab list" when entering the nav row. Active tab announces as "selected". Panel announces its label.

---

#### S2-04 · Fix React key warnings  
**Issue:** I-18  
**File:** `src/ui-staging/V3StagingApp.tsx` (6 locations in .map())  
**Effort:** S (15 min)

Replace index-based keys with stable string keys:

```tsx
// Before (CalendarPage filter chips)
{['All', 'Clinical', ...].map((chip, index) => <button key={index}>

// After
{['All', 'Clinical', ...].map((chip) => <button key={chip}>
```

Same fix for: visit rows (use `${visit.patient}-${visit.time}`), doc rows (use `idx`+content hash or stable ID), physician rows (use `doc.npi`).

**Acceptance:** React dev console shows zero "unique key" warnings on any page.

---

### Sprint 3 — Architecture Extraction (~1 day)
**Goal:** Extract 4 shared primitives. Reduce V3StagingApp from 2244 to ~1400 LOC. Purge dead CSS.

---

#### S3-01 · Extract `V3SearchBar` component  
**Issue:** I-19  
**File:** New: `src/ui-staging/components/V3SearchBar.tsx`  
**Effort:** M (30 min)

The search bar pattern appears in 12+ pages. Extract:
```tsx
interface V3SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  maxWidth?: number;
}
export function V3SearchBar({ placeholder, value, onChange, ariaLabel, maxWidth = 380 }: V3SearchBarProps) { ... }
```

Replaces ~12 instances of the 8-line search input pattern.

---

#### S3-02 · Extract `V3KpiGrid` component  
**Issue:** I-19  
**File:** New: `src/ui-staging/components/V3KpiGrid.tsx`  
**Effort:** M (30 min)

The KPI stat grid pattern (label + big number + optional teal/orange color) appears on 14+ pages:
```tsx
interface KpiItem { label: string; value: string; color?: string; }
interface V3KpiGridProps { items: KpiItem[]; cols?: number; }
export function V3KpiGrid({ items, cols }: V3KpiGridProps) { ... }
```

---

#### S3-03 · Extract `V3FilterChips` component  
**Issue:** I-19  
**File:** New: `src/ui-staging/components/V3FilterChips.tsx`  
**Effort:** M (20 min)

```tsx
interface V3FilterChipsProps {
  options: string[];
  active: string;
  onSelect: (option: string) => void;
}
export function V3FilterChips({ options, active, onSelect }: V3FilterChipsProps) { ... }
```

---

#### S3-04 · Extract `V3DataTable` component  
**Issue:** I-19  
**File:** New: `src/ui-staging/components/V3DataTable.tsx`  
**Effort:** M (45 min)

The list-with-header-row pattern (table header `div` + rows with `borderBottom`) appears on 7 pages (Clinicians, Patients, Visit Schedule, Missed Visits, Hubstaff, Referring Physicians, Audit Trail). Abstract into:
```tsx
interface Column<T> { key: keyof T | string; label: string; flex: number; render?: (row: T) => React.ReactNode; }
interface V3DataTableProps<T> { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string; }
```

---

#### S3-05 · Purge vestigial CSS  
**Issue:** I-20  
**File:** `src/ui-staging/ui-staging.css`  
**Effort:** M (45 min)

Classes confirmed unused in current `V3StagingApp.tsx` (from structural baseline grep of all `className=` references):
- `.v3-shell-grid`, `.v3-shell-sidebar`, `.v3-shell-hamburger*`, `.v3-shell-navlist`, `.v3-shell-navitem*`, `.v3-shell-navicon`, `.v3-shell-navlabel`, `.v3-shell-main`, `.v3-shell-topbar*`, `.v3-shell-search*`, `.v3-shell-logo`
- `.v3-login-*` (all 12+ login panel classes)
- `.v3-profile-*`, `.v3-rail-*`, `.v3-content-card`
- `.v3-staging-page` (superseded by `data-v3-ui-staging-root`)
- `.v3-pageview-*`

Estimated reduction: ~600 LOC from 2157 → ~1550 LOC.

**Process:** Confirm each class is not imported/used by any OTHER file outside `ui-staging/` before deleting.

```powershell
# Verify no external usage before deleting each class
grep -r "v3-shell-grid" src/ --include="*.tsx" --include="*.ts" --include="*.css" -l
```

**Acceptance:** CSS file ≤ 1600 LOC. `npm run build` produces no errors. All 22 staging pages render identically to pre-cleanup.

---

### Sprint 4 — Polish & UX Details (~half day)

---

#### S4-01 · Compliance 8.3 scroll fade affordance  
**Issue:** I-17  
**File:** `src/policy/pages/GVGBDetailView.tsx` (~line 620) + add CSS  
**Effort:** S (20 min)

Add CSS to `src/index.css` or create a scoped class:
```css
.gvgb-scrollable-fade {
  position: relative;
}
.gvgb-scrollable-fade::after {
  content: '';
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: block;
  height: 32px;
  background: linear-gradient(to top, #ffffff 0%, transparent 100%);
  pointer-events: none;
}
```

Apply `gvgb-scrollable-fade` to the `div.space-y-3.max-h-[420px].overflow-y-auto` wrapper in `ViewCompliance`.

---

#### S4-02 · GVGBDetailView — tab strip mobile scroll indicator  
**Issue:** I — (responsive)  
**File:** `src/policy/pages/GVGBDetailView.tsx`  
**Effort:** S (15 min)

Wrap the scrollable tab container in a `relative` parent and add a fade-right gradient:
```css
/* applied to the tab strip outer div */
.gvgb-tab-strip-outer {
  position: relative;
}
.gvgb-tab-strip-outer::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 32px;
  background: linear-gradient(to left, #ffffff, transparent);
  pointer-events: none;
}
```

---

#### S4-03 · Sidebar / card responsive collision fix  
**Issue:** I-16  
**File:** `src/ui-staging/V3StagingApp.tsx` (~line 300)  
**Effort:** S (15 min)

```tsx
// Before
minWidth: isMobile ? '95vw' : 'min(980px, 95vw)',

// After
minWidth: isMobile ? '95vw' : viewportWidth < 900 ? 'min(720px, 95vw)' : 'min(980px, 95vw)',
```

Also add: auto-close sidebar when viewport < 900 (on resize event):
```tsx
useEffect(() => {
  if (viewportWidth < 900) setIsNavOpen(false);
  else setIsNavOpen(true);
}, [viewportWidth]);
```

---

#### S4-04 · Action button stub handlers  
**Issue:** I-24  
**Files:** `src/ui-staging/V3StagingApp.tsx`  
**Effort:** S (20 min)

For all no-op action buttons that currently have only styling:
- "Add Physician" (`ReferringPhysiciansPage`)
- "Start eCign", "Open" (`FormsLibraryPage`)
- "Document" (`MissedVisitsPage`)
- "Launch →" (`DemoPage`)
- "Export CSV" (`AuditTrailPage`)
- "Contact Support" (`HelpCenterPage`)

Add a shared stub handler:
```tsx
const onStubAction = (label: string) => {
  // No-op in staging — a real toaster hook would fire here
  console.info(`[Staging] Action stub invoked: ${label}`);
};
```

Then wire: `onClick={() => onStubAction('Start eCign')}`. This makes clicking feel non-broken to a demo audience without false UI feedback.

---

#### S4-05 · Stabilize TASKS array dates  
**Issue:** I-22  
**File:** `src/ui-staging/V3StagingApp.tsx` (~line 93)  
**Effort:** S (10 min)

Replace hardcoded month strings with relative dates to the current date:
```tsx
function relativeDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const TASKS: TaskItem[] = [
  { id: 't-1', ..., due: relativeDate(0),  overdue: false },
  { id: 't-2', ..., due: relativeDate(-2), overdue: true  },
  // etc.
```

**Acceptance:** Task due dates are always relative to today. Opening staging on any date shows sensible relative urgency.

---

## Summary: Sprint → Issue Mapping

| Sprint | Items | Effort Est. | Outcome |
|--------|-------|-------------|---------|
| **S0** — Bug Fixes | I-01, I-02, I-03(partial), I-11, I-12, I-15 | ~2h | Zero semantic color errors; correct default state |
| **S1** — Interactivity | I-03, I-04(key pages), I-05(key pages), I-10, I-21 | ~1d | Policy library routes correctly; 4 pages searchable; Brad responds |
| **S2** — Design System | I-06, I-07, I-08, I-09, I-13, I-14, I-18 | ~3h | Token source-of-truth unified; ARIA baseline in place |
| **S3** — Architecture | I-19, I-20 | ~1d | ~800 LOC removed from monolith; 4 primitives extracted; CSS cleaned |
| **S4** — Polish | I-16, I-17, I-22, I-24, I-25 | ~3h | Scroll affordances; auto-collapse nav; stable dates; stub handlers |

**Total estimated effort:** ~3.5 engineering days  
**Resulting state after all sprints:**  
- 🟢 Color semantics: correct  
- 🟢 Policy routing: correct  
- 🟢 Interactivity: 6–8 pages have live search/filter  
- 🟢 ARIA baseline: Pass  
- 🟢 Token drift: Eliminated  
- 🟡 Full 22-page interactivity: ~40% (up from ~18%)  
- 🟡 Data model fidelity vs production types: deferred (no production stores wired)

---

## Deferred / Out of Scope for This Plan

The following items from the 16-agent blueprint scope were assessed and deferred:

| Item | Reason for Deferral |
|------|---------------------|
| Wire real production stores (CLINICIANS, PATIENTS from staffing hooks) | Requires full production bridge design — Agent 11 scope; separate initiative |
| GSAP/framer-motion upgrade | No business need identified; CSS transitions are correct; avoid dependency |
| Full page virtualization (react-window for long lists) | Lists are ≤10 rows in staging — no runtime performance impact |
| `v3Tokens.ts` additions (bgGradient, surfaceDark, warningOrange) | Minor; add when v3Tokens.ts is being touched for I-06 |
| Agent_Reports/ individual 16-agent swarm execution | Blueprint produced by Grok; actual swarm deployment was not triggered; this plan supersedes the need for 16 separate agents by consolidating all findings |
| `Master/` consolidated 16-agent doc | This plan + the existing audit doc together serve the same decision-making purpose |

---

## Acceptance Criteria for "Sprint Complete" Sign-Off

- `npm run build` exits 0 with no TypeScript errors
- `npm run lint` exits 0 (or no new lint violations introduced)
- Visual regression: all 22 pages render in staging at 1440px, 1024px, 768px, 375px without horizontal overflow or broken layout
- No `console.error` output during normal navigation through all 22 sections
- Color audit: no instances of `#00D1C1` applied to overdue/expired/incomplete states
- Policy Library: clicking GV-GB-001 opens detail; other cards do not navigate
- Brad AI: typing and Enter sends + receives stub response
- axe DevTools: zero critical violations on Dashboard, Policy Library, and GVGBDetailView

---

*This plan supersedes the 16-agent swarm execution. All findings are consolidated here with direct code references. Ready for engineering pickup.*
