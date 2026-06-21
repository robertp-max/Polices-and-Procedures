# 11 - Profiles (Clinician/Patient) (clinicians, patients, *-detail)

**View Registrations:**
- `clinicians` (group: "Clinician Profiles")
  - Label: "Clinician Profiles"
  - Route: `/clinicians`
  - Icon: `users`
  - Template: `profiles`
  - Description: (from header) Clinician Profiles
  - records: clinicianRecords (6 rows)
  - tableHeaders: ['ID', 'Clinician', 'Coverage', 'Status']
  - Metrics:
    ```js
    metric('Active clinicians', '42', 'RN, LVN, PT, OT, MSW', 'teal'),
    metric('Credential compliance', '96%', '2 renewals due', 'green'),
    metric('Open caseload', '184', 'Bay Area service area', 'blue'),
    metric('Training due', '7', 'Before next field visit', 'orange'),
    ```
  - selectedRecord: { title: 'Maria Delgado, RN', subtitle: '18-patient caseload - CHF and SOC-heavy route', status: 'Field ready' }
  - profileBars: [['Credentials', 100, 'teal'], ['Training', 92, 'teal'], ['Visit documentation', 86, 'teal'], ['Schedule load', 74, 'orange']]

- `clinician-detail` (group: "Clinician Profiles")
  - Label: "Clinician Detail"
  - Route: `/clinicians/:clinicianId`
  - Icon: `user-round-check`
  - Template: `detail`
  - title: 'Maria Delgado, RN'
  - description: 'Credential posture, assigned patients, training status, and active compliance requirements.'
  - records: clinicianRecords
  - cards: [Credential file, Assigned patients, Documentation]

- `patients` (group: "Patient Profiles")
  - Label: "Patient Profiles"
  - Route: `/patients`
  - Icon: `heart-pulse`
  - Template: `profiles`
  - Description: (from header) Patient Profiles
  - records: patientRecords (6 rows)
  - tableHeaders: ['ID', 'Patient', 'Clinical focus', 'Status']
  - Metrics:
    ```js
    metric('Active census', '128', '36 recert windows open', 'teal'),
    metric('SOC starts', '9', 'Next 7 days', 'orange'),
    metric('High acuity', '17', 'CHF, wounds, post-CVA', 'red'),
    metric('Plan alignment', '94%', 'Signed and current', 'green'),
    ```
  - selectedRecord: { title: 'Elena Vargas', subtitle: 'CHF, Type 2 DM - SOC active - RN backup pending', status: 'Needs coverage' }
  - profileBars: [['Care plan', 94, 'teal'], ['Signed orders', 78, 'orange'], ['Medication reconciliation', 88, 'teal'], ['Visit coverage', 64, 'orange']]

- `patient-detail` (group: "Patient Profiles")
  - Label: "Patient Detail"
  - Route: `/patients/:patientId`
  - Icon: `clipboard-plus`
  - Template: `detail`
  - title: 'Elena Vargas - SOC Active'
  - description: 'Care plan, clinician assignments, documentation gaps, visit cadence, and high-risk indicators.'
  - records: patientRecords
  - cards: [Care plan state, Coverage need, Clinical risk]

**PNG Confirmation:** File exists at `Reference/V6/11-profiles-clinician-patient.png` (96,948 bytes). Visual read primarily shows shared shell/sidebar (with "Clinician Profiles", "Patient Profiles" nav entries under Primary Operations) + Brad modal overlay. Profile tables, profile cards/bars, and detail cards are dynamically rendered client-side via React/JSX in index.html (ProfilesPrototype + DetailPrototype + DataTable).

## Layout & Structure
- **Shell + Top metrics:** Generic metrics grid (4 `MetricTile`s per view config) rendered before content when `activeView.template !== 'dashboard'`.
- Page header: `ToneBadge` (group e.g. "Clinician Profiles"), title, description.
- **ProfilesPrototype** (lines ~2536-2578) for `profiles` template:
  - Grid: `grid grid-cols-1 gap-6 xl:grid-cols-3`
    - Left (xl:col-span-2): `<DataTable view={view} />`
    - Right: Profile summary card `rounded-2xl border ... bg-white p-5 shadow-soft`
      - Header: selected.title (h3) + subtitle (p) + `ToneBadge` (status)
      - `space-y-4` progress bars from `profileBars`
      - "Open detail" CTA button (brand-orange-500)
- **DetailPrototype** (lines ~2660-2692) for `detail` template:
  - Grid: `grid grid-cols-1 gap-6 xl:grid-cols-5`
    - Left (xl:col-span-3): Header `ToneBadge` + large title + description para + grid of up to 3 `SurfaceCard`s (md:grid-cols-3)
    - Right (xl:col-span-2): "Right panel preview" with list of metadata rows (Version chain, Linked forms, Evidence capture, Approval history) + `ToneBadge`s
- Navigation: Sidebar groups "Clinician Profiles" and "Patient Profiles" each contain list + detail entries.

## Profile Tables (DataTable ~1911-1955)
Shared component for both clinician and patient list views:
- `overflow-hidden rounded-2xl border ... bg-white shadow-soft`
- Header row: `grid ... bg-brand-neutral-50` with `text-[10px] font-heading font-extrabold uppercase tracking-widest text-brand-neutral-400`
  - Uses `view.tableHeaders`
- Body: `divide-y divide-brand-neutral-100`
  - Each row: `grid items-center px-4 py-3 text-sm hover:bg-brand-teal-50/40`
  - Cell rules:
    - col 0 (ID): `font-heading text-xs font-extrabold text-brand-teal-500`
    - col 1 (Name): `text-xs font-medium text-brand-teal-600`
    - last col (Status): `ToneBadge` (tone orange if matches statusPattern like "due|watch|..."; else teal)
    - others: `text-xs leading-relaxed text-brand-neutral-400`
- Grid columns dynamically sized via `gridTemplateColumns: repeat(${columnCount}, minmax(0, 1fr))`

**Clinician Records (clinicianRecords ~233-240):**
```js
[
  ['CLN-2041', 'Maria Delgado, RN', '18-patient caseload', 'Compliant'],
  ['CLN-2049', 'James Kwon, PT', '12-patient caseload', 'Renewal due'],
  ['CLN-2055', 'Aisha Rahman, OT', '8-patient caseload', 'Compliant'],
  ['CLN-2060', 'Priya Singh, RN', '14-patient caseload', 'Training due'],
  ['CLN-2068', 'Luis Mendez, LVN', 'Weekend coverage pool', 'Compliant'],
  ['CLN-2072', 'Nora Patel, MSW', 'Discharge planning support', 'Watch'],
]
```
Table headers: ID | Clinician | Coverage | Status

**Patient Records (patientRecords ~242-249):**
```js
[
  ['HH-88291', 'Elena Vargas', 'CHF, Type 2 DM', 'SOC active'],
  ['HH-88402', 'Robert Hale', 'Post-CVA', 'Recert due'],
  ['HH-88701', 'Amina Yusuf', 'Diabetic wound care', 'Active'],
  ['HH-88910', 'George Lin', 'Post-op hip', 'Discharge prep'],
  ['HH-89012', 'Marisol Chen', 'COPD exacerbation', 'High acuity'],
  ['HH-89104', 'Anthony Bell', 'Medication teaching', 'Visit gap'],
]
```
Table headers: ID | Patient | Clinical focus | Status

## Profile Cards / Right Panels & Bars
- List view right panel (ProfilesPrototype): Shows pinned `selectedRecord` + 4 horizontal progress bars.
  - Label + % on top (uppercase small text).
  - Bar container: `h-2 rounded-full bg-brand-neutral-100`
  - Fill: uses `tones[toneName].bar` (teal or orange), width via inline style.
  - Example bars mix teal (good) + orange (attention).
- Detail view: Uses `SurfaceCard` components (see below) instead of bars. Also references table but focuses on context cards.
- "Open detail" button always present on profiles list right panel.

**SurfaceCard** (used in detail + other views, ~1885-1909):
- `rounded-2xl border border-brand-neutral-200 bg-white p-5 shadow-soft hover:-translate-y-0.5 hover:shadow-lift`
- Icon tile (tone bg, e.g. `tones[item.tone].tile`) + `ToneBadge`
- Title (font-extrabold text-brand-teal-600), body text, optional progress bar (h-2).

Example detail cards (clinician-detail):
- 'Credential file' (green, 100%) — "RN license, BLS, OASIS competency..."
- 'Assigned patients' (teal, 82%) — "18-patient caseload..."
- 'Documentation' (orange, 68%)

Example detail cards (patient-detail):
- 'Care plan state' (teal, 88%)
- 'Coverage need' (orange, 64%)
- 'Clinical risk' (orange, 72%)

## Status Colors & Tone System
From global `tones` (~129 in index.html):
- **teal**: Compliant / ready / positive (e.g. 96% compliance, active plans).
- **orange/amber**: Attention needed (renewal due, watch, needs coverage, orange progress).
- **green**: High compliance / complete (credential 100%).
- **red** (high acuity): Special for patient metrics.
- **blue**: Caseload / coverage metrics.
- `ToneBadge`: Colored dot + uppercase pill.
- Status detection in DataTable uses regex on value for orange vs teal badge.
- Legend/consistent: teal=ready/good posture, orange=action/risk items.

## Key Interactions & Notes
- Table rows are hoverable but no explicit onClick in prototype (nav via sidebar or "Open detail" CTA).
- Detail views share records data but render via SurfaceCards + description + right metadata panel.
- Profile bars visualize "posture" (credentials, care plan, schedule load, etc.) — tied to compliance themes.
- Sidebar labels: "Clinician Profiles" / "Patient Profiles" directly map to groups.
- Data ties into broader app (e.g. clinician caseloads reference patients, staffing calendars).
- No full detail drawer here (see modals prototype for VeilDrawer patterns).

**Related Views:** dashboard (signals reference caseloads), master-calendar/staffing-calendar (clinician assignments), ces-board, journey.

**Sources:** VIEW_GROUPS ~1098-1168 (registrations + data), clinicianRecords/patientRecords ~233-249, ProfilesPrototype ~2536, DetailPrototype ~2660, DataTable ~1911, SurfaceCard ~1885, MetricTile ~1875, ToneBadge ~1866, tones ~129, renderTemplate ~4219/4222, shell/metrics ~4594.
