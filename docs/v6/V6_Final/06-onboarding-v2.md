# 06 - Onboarding v2 (Compliance Activation Dashboard, Batches, Gates & Audit)

**View Registration:** Multiple views under group "Onboarding v2"
- `onboarding-v2-dashboard` → Label: "Onboarding v2 Dashboard", Route: `/onboarding-v2/dashboard`, Icon: `sparkles`, Template: `dashboard`
- `onboarding-v2-batches` → Label: "Batches", Route: `/onboarding-v2/batches`, Icon: `package-check`, Template: `matrix`
- `onboarding-v2-batch` → Label: "Batch View", Route: `/onboarding-v2/batches/:batchId`, Icon: `package-open`, Template: `detail`
- `onboarding-v2-audit` → Label: "Audit Readiness", Route: `/onboarding-v2/audit`, Icon: `clipboard-check`, Template: `evidence`
- `onboarding-v2-governance` → Label: "Onboarding Governance", Route: `/onboarding-v2/governance`, Icon: `shield`, Template: `reports`
- Also: `onboarding-v2-activate` (template `form`)

Descriptions (from view configs):
- Dashboard: "Audit-grade Compliance Activation Dashboard. Live KPIs from batch/unit state, subject gates (5 fixed), phase distribution, reconciled evidence, hash-chained audit feed. Powered by engine ingest + reconcile."
- Batches: Matrix list of batches.
- Batch View: "Subject roster, gate status (Field/SystemAccess etc.), phase accordions, units with evidence/signature tabs, audit timeline. Dynamic per batchId."
- Audit: "Subject dossier, hash-chain verification, GateTiles, UnitTables by evidence type, overrides, full AuditTimeline."
- Governance: "Override grants (dual-sig), active vendors, policy version bindings, readiness reports."
- Activate: Ingest trigger + reconciliation preview (NEW_HIRE / ROLE_CHANGE / VENDOR_ONBOARD etc.).

**PNG Confirmation:** File exists at `Reference/V6/06-onboarding-v2.png` (96,948 bytes, timestamp 2026-06-19). Static capture primarily shows the shared prototype shell (sidebar navigation with "Onboarding" / "Onboarding v2" group, top search bar, CareIndeed logo, user "TP" avatar) with a Brad chat modal overlay visible; dynamic UI content (KPIs, batch tables, gate tiles, action queues, subject roster) is rendered client-side via React-in-HTML in index.html. Additional runtime screenshots captured in `tmp-ui-verify-screenshots/redesign-rest-seeded/onboarding-v2-dashboard.png` and `onboarding-v2-batch.png`.

## Layout & Structure
- **Overall App Shell (shared):** 
  - Collapsible left sidebar (292px; groups include "Onboarding" legacy + new "Onboarding v2" containing the five+ views above). Active nav: `bg-[#004142] text-white`.
  - Main: `TopBar` (ToneBadge group "Onboarding v2" + h2 title + description + icon action buttons) + conditional top metrics grid (omitted for `template === 'dashboard'`).
  - Content area uses responsive grids: `grid-cols-1 ... xl:grid-cols-5` for main + rail.
- **Dashboard (onboarding-v2-dashboard, template 'dashboard'):** Uses `DashboardPrototype`.
  - Top internal 4-5 column `MetricTile` grid (inside prototype).
  - 3-col / 2-col split: left action queue panel + right signals/cards + gate context.
- **Batches list (onboarding-v2-batches, template 'matrix'):** `MatrixPrototype` → left `DataTable` (xl:col-span-3) + right `SurfaceCard`s (col-span-2). Top metrics row shown because not 'dashboard'.
- **Batch detail (onboarding-v2-batch, template 'detail'):** `DetailPrototype` (generic left panel + right rail preview). Config passes `records`, `gateTiles`, `batchDetail` for richer intended rendering (subject roster table, gate tiles, phase accordions, unit tabs, audit timeline). Generic proto shows title/desc + cards + right preview rail.
- **Audit Readiness (onboarding-v2-audit, template 'evidence'):** `EvidencePrototype` → left evidence list cards + right audit packet tiles. Uses `records` as audit table data.
- **Governance (onboarding-v2-governance, template 'reports'):** `ReportsPrototype` → left bar chart area + right cards. Uses records for overrides table + metrics.
- Metrics row (when shown): `grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4` of `MetricCard` > `MetricTile`.
- Common: `p-4 md:p-8` content padding, rounded-2xl cards, `shadow-soft`, `hover-lift`.

## Dashboard KPIs (onboardingV2DashboardKpis)
Defined at index.html ~762-768 and mapped to metrics for the dashboard view:

```js
const onboardingV2DashboardKpis = [
  { label: 'Open batches', value: '5', note: 'Active, not completed/withdrawn', tone: 'teal' },
  { label: 'Blocked units', value: '1', note: 'Pre-conditions or override gating', tone: 'orange' },
  { label: 'Awaiting signature', value: '3', note: 'eCIgn envelopes pending (Maria HIPAA/COC/AUP)', tone: 'amber' },
  { label: 'Awaiting evidence', value: '2', note: 'Forms / uploads needed', tone: 'teal' },
  { label: 'Overdue units', value: '0', note: 'Past SLA dueAt', tone: 'green' },
];
```

- Rendered as `MetricTile` inside `DashboardPrototype` (4-col on xl).
- Tones drive tile bg/border (teal-50 / orange-50 / amber-50 / green) + value size.
- Also shown in matrix views via top row + specific per-view metrics (e.g. batches view has `Active 5 / Blocked 1`).

## Batch List (onboardingV2Batches + matrix table)
Data (~748-755):

```js
const onboardingV2Batches = [
  ['BATCH-00000001', 'Maria Hernandez', 'NEW_HIRE', 'RN', '2026-04-24', 'InProgress', '5/12'],
  ['BATCH-00000002', 'Daniel Park', 'NEW_HIRE', 'HHA', '2026-04-27', 'Blocked', '1/14'],
  ['BATCH-00000003', 'Aiyana Whitefeather', 'NEW_HIRE', 'BILLING', '2026-04-15', 'InProgress', '7/9'],
  ['BATCH-00000004', 'Jordan Reeves', 'ROLE_CHANGE', 'CLINICAL_MANAGER,RN', '2026-03-28', 'InProgress', '9/15'],
  ['BATCH-00000005', 'Priya Iyer', 'NEW_HIRE', 'INTAKE', '2026-04-25', 'PendingActivation', '0/8'],
  ['BATCH-00000006', 'NorthStar Medical Transcription, LLC', 'VENDOR_ONBOARD', 'VENDOR', '2026-04-26', 'InProgress', '2/4'],
];
```

- Table headers in matrix/dashboard: `['Batch', 'Subject', 'Trigger', 'Role', 'Effective', 'Units', 'Status']`
- Render: `DataTable` (grid layout with header row bg-brand-neutral-50, row hovers). First col bold teal ID, last col `ToneBadge` (orange for blocked/inprogress states via regex).
- Also embedded as `records` inside onboarding-v2-dashboard's `DashboardPrototype` (action queue + batch cards).

## Subject Roster (onboardingV2Subjects)
Derived (~746):

```js
const onboardingV2Subjects = onboardingV2Workforce.map(...) // e.g.
[{ id: 'WM-001', name: 'Maria Hernandez, Maria', role: 'RN', batch: 'BATCH-00000001', status: 'Active' }, ...]
```

- Workforce base (~735): WM-001..005 + vendors (V-001).
- Used in `onboarding-v2-batch` detail view `records` + tableHeaders `['ID', 'Subject', 'Role', 'Batch', 'Progress', 'Gate', 'Status']`.
- Intended in Batch View: roster grid/table showing progress + gate status per subject. Statuses: Active / Prospect / PendingActivation / Blocked.

## Gates (onboardingV2Gates + batchDetail.gates)
Defined ~770-776 (5 fixed gates):

```js
const onboardingV2Gates = [
  { gateId: 'FieldClearance', outcome: 'Fail', missing: 4, subject: 'WM-002' },
  { gateId: 'BillingClearance', outcome: 'Pass', missing: 0, subject: 'WM-003' },
  { gateId: 'SystemAccessClearance', outcome: 'AwaitingSignature', missing: 3, subject: 'WM-001' },
  { gateId: 'VendorEngagement', outcome: 'Fail', missing: 2, subject: 'V-001' },
  { gateId: 'GovernanceActive', outcome: 'Pass', missing: 0, subject: 'WM-004' },
];
```

Per-batch in `onboardingV2BatchDetail` (~757-760):
- BATCH-00000001 (Maria): gates FieldClearance (Fail,4), SystemAccessClearance (AwaitingSignature,3); phases PreHire 3/5, Training 2/4.
- BATCH-00000002 (Daniel): FieldClearance (Fail,1); status 'Blocked'.

- Passed as `gateTiles` to dashboard + batch views.
- Intended UI: Gate tiles/cards showing gateId, colored outcome badge (Fail=red/orange, Pass=green, AwaitingSignature=amber), missing count. Re-eval after evidence/sig completion. Used for blocking + queue prioritization.
- Outcomes drive ToneBadge (orange/amber/teal/green).

## Audit Items (onboardingV2AuditItems)
~778-782:

```js
const onboardingV2AuditItems = [
  ['REQ-UNIV-HIPAA', 'Maria Hernandez', 'AwaitingSignature', 'IT-HIPAA-PRIVACY@2026.01', 'Sign via eCIgn'],
  ['REQ-HHA-COMP-12', 'Daniel Park', 'Blocked', 'CL-HHA-484.80@2026.01', 'Assign RN observer'],
  ['REQ-UNIV-BG', 'Maria Hernandez', 'Completed', 'HR-BG-001@2026.01', '—'],
];
```

- Used in `onboarding-v2-audit` (evidence template) as `records` + headers `['Requirement', 'Subject', 'Status', 'Policy Ref', 'Action']`.
- Rendered via EvidencePrototype list or DataTable. Statuses feed badges and action recommendations.
- Dashboard/audit mention "hash-chained per-subject" + events: UNIT_STATE_CHANGED, EVIDENCE_CAPTURED, SIGNATURE_REQUESTED. Chain verified.

## Active Overrides (Governance)
~784-786:

```js
const onboardingV2ActiveOverrides = [
  ['OV-0001', 'SystemAccessClearance', 'License PSV + dual sig pending; valid 30d', 'Active'],
];
```

- `onboarding-v2-governance` records + headers `['Override', 'Gate', 'Reason', 'Valid Window']`.
- Metrics: Active overrides '1' (amber).

## Action Queue & Cards (Dashboard specific)
In onboarding-v2-dashboard config:
- `actionRows`: 3 prioritized items (e.g. "Resolve Daniel Park HHA COMP-12 blocker" orange 15%, signatures amber 55%, TB screening teal 70%).
- Rendered in `DashboardPrototype` left panel: icon tile (tone bg), title, meta, owner + `ToneBadge` due, progress bar (h-1.5).
- `cards` (SurfaceCard): 'Batches live', 'Gates + subjects', 'Audit posture' (with progress %).

Also in activate view: reconciliation cards, form sections preview.

## UI Elements (Common + Onboarding-specific)
- **MetricTile**: Large value (3xl), small uppercase label + note. Tone-colored tile (border + bg). Used for KPIs and top metrics.
- **SurfaceCard**: Icon tile (tone), ToneBadge, title, body text, optional progress bar (h-2). Hover `-translate-y-0.5 shadow-lift`.
- **DataTable** (matrix/batches/audit): CSS grid rows (no <table>), header uppercase tracking-widest, ID bold teal, status last-col as ToneBadge. Hover `hover:bg-brand-teal-50/40`.
- **ToneBadge**: Pill with dot + uppercase text. Tones: teal (ready/Active), orange (urgent/Blocked/Fail), amber (awaiting), green (Pass/Completed).
- **Action rows** (dashboard): Bordered neutral-50 cards, progress fill using `tones[...].bar`.
- **Gate / Phase indicators**: Intended per gateTile + batchDetail.phases: small accordions or tiles for PreHire/Training (done/total), outcome badges.
- **Units / Roster progress**: "5/12", "1/14" strings; progress % in subject rows.
- **Right rails**: In splits, cards or preview lists (e.g. "Version chain", "Evidence capture").
- **Buttons/CTAs**: Orange primary ("Advance"), teal secondary. Icon buttons (lucide).
- **Styling**: `rounded-2xl`, `shadow-soft`, brand-teal-*/orange-*/neutral-*, backdrop-blur on shell. Responsive stacks. Icons injected via lucide.
- **Progress motif**: Recurring h-1.5 / h-2 bars across actions, surface cards, and units.
- Special dashboard handling skips generic top metrics row.

**Source Sections (index.html):**
- Seeds: onboardingV2* consts ~734-786 (workforce, vendors, batches, batchDetail, kpis, gates, auditItems, overrides).
- View defs: VIEW_GROUPS ~1632-1694 (onboarding v2 section).
- metric/card helpers ~1027-1033; view() factory ~1035.
- Prototypes: Evidence ~2580, Detail ~2660, Reports ~4104, Dashboard ~4127, Matrix ~4203.
- Table/UI components: DataTable ~1911, ToneBadge ~1866, MetricTile ~1875, SurfaceCard ~1885.
- Shell + render: App ~4558, renderTemplate ~4212, PageHeader/TopBar ~4371, conditional metrics ~4594.
- Tones palette ~129-160.
- Related: legacy journey views ~1495+ also reference gates/phases.

**Notes:** Prototype render is illustrative/general (generic Detail/Evidence etc. do not fully wire every batchDetail/gateTiles prop yet). The data + view descriptions define the full intended surfaces for subject roster, gate status tiles, phase accordions, unit evidence/signature tabs, hash-chain audit timelines, and override governance. Engine concepts (reconcile, REQUIREMENTS, hash chain, state machine) referenced in activate/desc cards.
