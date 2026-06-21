# 08-admin-roles-permissions.png — Admin Roles, Permissions, Groups & Users

**File confirmed:** Exists at `Reference/V6/08-admin-roles-permissions.png` (based on V6 prototype shell captures).

**View Registrations (Admin group in VIEW_GROUPS):**
- `admin-groups` — Label: "Admin User Groups", Route: `/admin/user-groups`, Icon: `users-round`, Template: `admin`
- `admin-roles` — Label: "Admin Roles", Route: `/admin/roles`, Icon: `key-round`, Template: `admin`
- `admin-permissions` — Label: "Permission Catalog", Route: `/admin/permissions`, Icon: `shield-check`, Template: `admin`
- `admin-users` — Label: "User Assignments", Route: `/admin/users`, Icon: `user-cog`, Template: `admin`

All four share the `admin` template and are rendered exclusively via **AdminPrototype**.

**PNG Confirmation:** File exists at `Reference/V6/08-admin-roles-permissions.png`. Visual read shows the shared prototype shell (sidebar navigation with "ADMINISTRATION / KNOWLEDGE" section listing admin items such as Roles & Permissions / User Groups / Users / Audit, top search bar, CareIndeed logo, "TP" user avatar) with Brad Administrator modal visible in the main content area. Specific admin table content (DataTable grids) and prototype panels are rendered client-side via React in `index.html` when the corresponding `admin-*` view id is active (via hash or `getInitialViewId`).

## Layout & Structure (from index.html shell + AdminPrototype)
- **Shared shell:** 
  - Left sidebar (collapsible, "Admin" group section).
  - TopBar / PageHeader: `ToneBadge` with group "Admin", `<h2>` title (e.g. "Admin Roles"), description paragraph (default: `${label} prototype for the active app route ${route}.`).
  - Metrics row (generic, 4 tiles, since `template !== 'dashboard'`): defaults from `view()` — Open work / Risk / Due soon / Evidence.
- **AdminPrototype** (function at ~3159):
  ```jsx
  <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
    <div className="xl:col-span-3">
      <DataTable view={{ ...view, records, tableHeaders: headers }} />
    </div>
    <div className="xl:col-span-2 rounded-2xl border border-brand-neutral-200 bg-white p-5 shadow-soft">
      <h3 className="font-heading text-base font-extrabold">Permission matrix preview</h3>
      ... (hardcoded perm rows + ToneBadges)
      {view.cards && ... <SurfaceCard ...>}
    </div>
  </div>
  ```
- Uses `view.records` (or fallback `adminRows`) and `view.tableHeaders` (or default groups headers).
- No special casing inside AdminPrototype by view.id — each registration supplies its own minimal `records` + `tableHeaders`.

## DataTable (shared renderer for all admin tables + many others)
- Defined at ~1911.
- Not a native `<table>`: CSS Grid (`display: grid`) with `gridTemplateColumns: repeat(${columnCount}, minmax(0, 1fr))`.
- Header row: `bg-brand-neutral-50`, uppercase, `font-extrabold`, `tracking-widest`, `text-brand-neutral-400`, `text-[10px]`.
- Body rows: `divide-y`, `hover:bg-brand-teal-50/40`, `px-4 py-3 text-sm`.
- Cell logic:
  - Col 0: `font-heading text-xs font-extrabold text-brand-teal-500`
  - Col 1: `text-xs font-medium text-brand-teal-600`
  - Last col: wrapped in `<ToneBadge tone={statusPattern.test(value) ? 'orange' : 'teal'}>`
  - Other cols: `text-xs leading-relaxed text-brand-neutral-400`
- `statusPattern` regex: `due|watch|blocked|draft|limited|review|partial|missing|pending|unknown|gap|required|deficient|risk|fail|awaiting|inprogress` (case-insensitive) → orange badge; else teal.
- Column count derived from headers or longest record row.

## Tables for Roles, Permissions, Users, Groups

### 1. User Groups Table (admin-groups)
**Headers:** `['Group', 'Users', 'Access scope', 'Status']` (4 columns)

**Records (seeded in registration):**
```js
[
  ['Super Admin', '8', 'Full platform', 'Enabled'],
  ['Compliance', '12', 'Policy, CES, Evidence', 'Enabled'],
  ['Clinical RN', '34', 'Patients, Journey, Tasks', 'Enabled'],
  ['Onboarding', '18', 'Journey and taxonomy', 'Limited'],
]
```
- Fallback `adminRows` (if no records) is nearly identical but uses "8 users" phrasing.
- Status rendering:
  - "Enabled" → teal badge (no statusPattern match)
  - "Limited" → orange badge (matches `limited`)
- Typical use: RBAC overview of platform user cohorts + high-level scope + enablement.

### 2. Roles Table (admin-roles)
**Headers:** `['Role', 'Scope', 'Status']` (3 columns)

**Records (seeded):**
```js
[
  ['Clinical Manager', 'Policy + CES', 'Enabled'],
  ['QAPI Lead', 'Reports + Evidence', 'Enabled'],
]
```
- Simple 3-col layout.
- All shown "Enabled" → teal badges.
- Focus: named roles and their primary functional scope within the compliance/ops system.

### 3. Permissions Table (admin-permissions / Permission Catalog)
**Headers:** `['Permission', 'Description', 'State']` (3 columns)

**Records (seeded):**
```js
[
  ['pmTasks.view', 'PM board access', 'Granted'],
  ['journey.admin', 'Catalog edits', 'Dual approval'],
]
```
- "State" column receives ToneBadge (neither matches the statusPattern exactly → both teal, though "Dual approval" visually highlights special gating).
- Permission keys use dot notation (e.g. `pmTasks.view`, `journey.admin`).
- Typical catalog entries surface granular actions with approval semantics (Granted / Dual approval / Restricted).

### 4. User Assignments Table (admin-users)
**Headers:** `['ID', 'Name', 'Role', 'Assignments']` (4 columns)

**Records (seeded):**
```js
[
  ['u-don-01', 'Maria Gonzalez', 'DON', 'All clinical'],
  ['demo-user-careindeed', 'Ops Lead', 'Primary Ops', 'Active'],
]
```
- Col 0 (ID): teal-500 bold (e.g. `u-don-01`).
- Col 1 (Name): teal-600.
- Last col ("Assignments"): Badge treatment — "Active" renders teal; "All clinical" also teal (no trigger words).
- Maps real user identifiers to roles + domain assignments.

## Permission Matrix Preview (always-visible right panel in AdminPrototype)
Independent of active sub-view (groups/roles/permissions/users). Hardcoded:
```js
['policy.view', 'form.sign', 'ceu.override', 'audit.export', 'user.provision'].map(...)
```
- Each row: `font-mono text-xs text-brand-neutral-500` + `ToneBadge`:
  - index < 2 → teal "Granted"
  - index === 2 → orange "Dual approval"
  - else → slate "Restricted"
- Followed (if present) by `view.cards` as SurfaceCards.
- Provides a quick at-a-glance RBAC posture example alongside the active table.

## Metrics (shown above content for all admin views)
Default 4 tiles (from `view()` factory unless overridden):
- Open work: 24 — "Current visible queue" (teal)
- Risk: Low — "Policy gated and monitored" (green)
- Due soon: 6 — "Next 14 calendar days" (orange)
- Evidence: 92% — "Survey-ready completeness" (teal)

(Admin registrations do not override `metrics`.)

## Colors & Styling (consistent with global tones)
- Brand teal: `#06A6AB` (400), `#00797D` (500), `#004142` (600)
- Brand orange: `#E56E2E` (400) — used for "needs attention" states (e.g. Limited, Dual approval)
- Neutrals: cards `bg-white`, `border-brand-neutral-200`, text `#524D4B` / `#004142`
- Table: header `bg-brand-neutral-50`, row hover `bg-brand-teal-50/40`
- ToneBadge: colored dot + pill (teal / orange / amber / green / slate)
- Effects: `rounded-2xl`, `shadow-soft`, `hover-lift`
- Font: Roboto via `font-heading` (extrabold for titles), mono for permission keys.

## Key UI Elements Visible in Prototype
- Split layout: wide DataTable (3/5) + compact preview panel (2/5) on xl+.
- CSS-grid "tables" (responsive, no overflow issues noted in QA).
- Status-driven badge coloring via regex heuristic on last column.
- Consistent icon tiles + badges from global `tones` map.
- Permission matrix preview always present for admin surface — demonstrates layered access control (Granted / Dual / Restricted).
- Sidebar nav activation uses exact `id` match (`bg-[#004142] text-white`).
- Brad modal often overlays (per PNG captures).

## Notes / Differences from Other Views
- Admin sub-pages deliberately minimal seed data (2–4 rows) to illustrate the table template without overwhelming the preview panel.
- Unlike MatrixPrototype / Profiles / Onboarding tables (which sometimes use different record shapes or extra columns), admin tables strictly rely on the array-of-arrays + headers supplied per view registration.
- No cards in the base admin-* registrations (right panel shows only the matrix preview).
- All admin views route under `/admin/*` pattern.

**Source Sections (index.html):**
- VIEW_GROUPS Admin items + view() calls: ~1769–1792
- adminRows default: ~653
- view() factory (records/tableHeaders defaults): ~1035–1070
- DataTable impl + cell logic: ~1911–1955
- AdminPrototype: ~3159–3185
- renderTemplate switch: ~4232
- Generic metrics row + shell render: ~4594
- tones + ToneBadge + MetricTile: ~129, 1866, 1875
- Sidebar + active nav + PageHeader: ~4308+

**Actionable:** Use as authoritative reference for RBAC surfaces in redesign. The four admin views demonstrate consistent DataTable + preview panel pattern for roles/permissions/user management.
