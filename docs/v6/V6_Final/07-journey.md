# 07 - Journey / Onboarding (journey-overview, journey-v1, module-player, supervisor, appendix-f)

**Agent:** 05 (Journey / Onboarding pageviews)  
**Base:** 07-journey.png

**Focused Views (from VIEW_GROUPS registration):**
- `journey-overview` (group: "Onboarding")
  - Route: `/journey`
  - Icon: `route`
  - Template: `journey`
  - Description: "Phase-gated competency journey for new hires. GAO + role-specific modules with gating, evidence, and supervisor sign-off."
- `journey-v1` (group: "Onboarding")
  - Route: `/journey/v1-journey`
  - Icon: `map`
  - Template: `journey`
  - Description: "Legacy topic/lesson view with onboarding and annual ACHC tracks. Lesson cards and assessments."
- `module-player` (group: "Onboarding")
  - Route: `/journey/module/:moduleId`
  - Icon: `play-circle`
  - Template: `journey`
  - Description: "SCORM or EvidenceCapture player. Method-aware: Quiz vs ReturnDemo/SkillsCheckoff vs SupervisedVisit."
- `appendix-f` (group: "Onboarding")
  - Route: `/journey/appendix-f`
  - Icon: `scroll-text`
  - Template: `matrix`
  - Description: "HR-TA-001 Appendix F — Pre-Employment Screening Checklist (HARD STOP). Every item must be PASS or N/A + HR Director signature before any work or orientation begins."
- `supervisor` (group: "Onboarding")
  - Route: `/journey/supervisor`
  - Icon: `user-check`
  - Template: `profiles`
  - Description: "DON / preceptor roster. Progress by GAO/Role/Supervised/Annual, clearance gates (HR-TA-005 App B), supervised visit logging, escalations, and remediation."

**PNG Confirmation:** File exists at `Reference/V6/07-journey.png` (96,948 bytes, timestamp 2026-06-19). Static capture shows shared prototype shell (sidebar, TopBar, metrics). Dynamic content (learner rail, module cards, tables, player) is rendered client-side via `JourneyPrototype` (and `MatrixPrototype`/`ProfilesPrototype` for appendix/supervisor) in index.html. Companion tmp-ui screenshot (journey-overview.png) exists but is 0-byte placeholder.

**Files Confirmed (via list_dir + terminal):**
- `Reference/V6/07-journey.png` (base visual reference)
- `Reference/V6/07-journey.md` (this file — newly created)
- `index.html` (276,683 bytes) — contains all seeds + JourneyPrototype + view registrations + supporting components
- `tmp-ui-verify-screenshots/redesign-rest-seeded/journey-overview.png` (0 bytes, placeholder)
- Related: 06-onboarding-v2.png (adjacent), other V6 pngs + existing .md (01-04, my-tasks, README.md)
- No prior 07-journey.md existed (confirmed absent)

## Data Seeds (JourneyPrototype + view configs, index.html ~683-732)
```js
// Learner (journeyLearner)
const journeyLearner = {
  id: 'EMP-1001',
  name: 'Maria Santos, RN',
  role: 'RN',
  email: 'maria.santos@careindeed.example',
  hireDate: '2026-04-14',
  startDate: '2026-04-20',
  supervisor: 'Dr. Elena Navarro, RN DON',
  licenseNumber: 'RN-00123456',
  appendixFCleared: true,
  clearedForIndependentWork: false,
};

// Modules (journeyModules — 11 items; overview uses full, v1 slices 0-7)
const journeyModules = [
  { id: 'GAO-001', group: 'GAO', phase: 'GAO', title: 'Agency mission, vision, values', roles: 'ALL', policyRefs: ['EN-CM-001'], method: 'None', status: 'completed', score: 100 },
  { id: 'GAO-004', group: 'GAO', phase: 'GAO', title: 'Corporate compliance program', roles: 'ALL', policyRefs: ['CO-CP-001', 'CO-CP-004'], method: 'Quiz', status: 'completed', score: 85 },
  { id: 'GAO-007', group: 'GAO', phase: 'GAO', title: 'HIPAA privacy — PHI handling, minimum necessary', roles: 'ALL', policyRefs: ['CO-HP-001', 'CO-HP-004'], cmsRefs: ['45 CFR 164'], method: 'Quiz', status: 'completed', score: 92 },
  { id: 'GAO-013', group: 'GAO', phase: 'GAO', title: 'Infection prevention — PPE, hand hygiene', roles: 'ALL', policyRefs: ['CL-SD-016'], cmsRefs: ['42 CFR 484.70'], method: 'ReturnDemo', status: 'completed', score: 100 },
  { id: 'GAO-014', group: 'GAO', phase: 'GAO', title: 'Bloodborne pathogen exposure control', roles: 'ALL', policyRefs: ['RM-OS-001'], cmsRefs: ['OSHA 29 CFR 1910.1030'], method: 'Quiz', status: 'in-progress', score: 65 },
  { id: 'GAO-EXAM', group: 'GAO', phase: 'GAO', title: 'General Orientation Competency Quiz', roles: 'ALL', policyRefs: ['HR-TA-005 Appendix D'], method: 'Quiz', prerequisites: ['GAO-001','GAO-004','GAO-007','GAO-013'], evidenceAppendix: 'HRTA005_D', supervisorSignature: true, status: 'locked', score: null },
  { id: 'RN-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'EHR system — full navigation and documentation', roles: ['RN'], policyRefs: ['CL-CD-001', 'IT-UP-001'], method: 'ReturnDemo', status: 'completed', score: 100 },
  { id: 'RN-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'OASIS training — item-level, completion, timing', roles: ['RN'], policyRefs: ['CL-OA-001'], method: 'CodingExercise', status: 'in-progress', score: null },
  { id: 'RN-008', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Medication management & reconciliation', roles: ['RN'], policyRefs: ['CL-SD-012','CL-SD-013'], method: 'SkillsCheckoff', status: 'available', score: null },
  { id: 'RN-SUP', group: 'ROLE', phase: 'SUPERVISED', title: 'Supervised patient visits (min 2)', roles: ['RN'], policyRefs: ['HR-TA-005 §6.3'], method: 'SupervisedVisit', supervisedVisitsRequired: 2, evidenceAppendix: 'HRTA005_E', supervisorSignature: true, status: 'locked', score: null },
  { id: 'ANN-001', group: 'ANN', phase: 'ANN', title: 'Compliance / Code of Conduct', roles: 'ALL', policyRefs: ['CO-CP-001'], method: 'Quiz', status: 'available', score: null },
];

// Phases (journeyPhases — used for timeline rail; pct reflects learner progress)
const journeyPhases = [
  { id: 'PRE_DAY_1', label: 'Pre-Day-1', pct: 100 },
  { id: 'GAO', label: 'Core Journey', pct: 60 },
  { id: 'ROLE', label: 'Clinical Role', pct: 25 },
  { id: 'SUPERVISED', label: 'Supervised', pct: 0 },
  { id: 'CLEARED', label: 'Cleared', pct: 0 },
  { id: 'ANN', label: 'Annual', pct: 10 },
  { id: 'DRILL', label: 'Drills', pct: 0 },
];

// Per-module state overrides (seedModuleStates)
const seedModuleStates = {
  'GAO-001': { status: 'completed', score: 100 },
  'GAO-004': { status: 'completed', score: 85 },
  'GAO-007': { status: 'completed', score: 92 },
  'GAO-013': { status: 'completed', score: 100 },
  'GAO-014': { status: 'in-progress', score: 65 },
  'GAO-EXAM': { status: 'locked' },
  'RN-001': { status: 'completed', score: 100 },
  'RN-002': { status: 'in-progress' },
  'RN-008': { status: 'available' },
  'RN-SUP': { status: 'locked' },
};
```

**journey-overview view config (excerpt):** includes `progress`, 4 metrics (GAO 60%, Role 25%, Appendix F Signed, Cleared No), and 3 cards (Phase rail, Gates & prereqs, Evidence & sigs).

**appendix-f records (excerpt):** 15 rows (e.g. #1 Criminal background PASS via HR-TA-002, #5 License PENDING, etc.) + tableHeaders + metrics + cards.

**supervisor records (excerpt):** 5 learner rows (Maria 60%/25%/0/2 In progress; others for HHA/LVN/OT/DON) + tableHeaders + selectedRecord + profileBars + metrics + cards.

## Layout & Structure (Generic + Journey-specific)
- **Shell (all views):** Collapsible sidebar nav (Onboarding group active), TopBar/PageHeader (teal ToneBadge + title + description), optional 4-col MetricCard grid above content (skipped only for dashboard).
- **JourneyPrototype({ view })** (index.html ~3037-3157):
  - `id = view.id || 'journey-overview'`
  - Pulls `learner`, `modules`, `phases`, `progress`, `selectedModule`
  - **Special case `module-player`:** Card header with ID + title + method + locked/unlocked badge. Then conditional:
    - Locked → red alert box.
    - Non-Scorm (ReturnDemo/SkillsCheckoff/SupervisedVisit) → 2-col evidence capture panel (SATISFACTORY rating, notes, dual Supervisor/Learner labels) + SignaturePad preview.
    - Default (Quiz etc.) → ScormPlayer/Quiz surface with score.
  - **Special case `journey-v1`:** Onboarding/Annual ACHC tabs + 3-col grid of lesson cards (ID, title, method/policy, ToneBadge status).
  - **Default (journey-overview + fallbacks):** `grid xl:grid-cols-12`:
    - col-span-3: **Learner sidebar** (detailed below)
    - col-span-6: **Modules** grid (detailed below)
    - col-span-3: **Gates** panel (Appendix F signed note, GAO-EXAM pending, supervised visits required)
- For `appendix-f`: falls through to `MatrixPrototype` → DataTable (full checklist) + 2-col cards (SurfaceCard).
- For `supervisor`: `ProfilesPrototype` → DataTable (roster) + right panel (selected learner profile with progress bars + status) + metrics/cards.

## Timeline (Phases Rail)
- Rendered in default JourneyPrototype learner sidebar as stacked list:
  - Each: `rounded-xl bg-brand-neutral-50 px-3 py-2` row with `font-bold` label + `font-mono text-brand-teal-600` `{pct}%`
  - Order: Pre-Day-1 (100%) → Core Journey (60%) → Clinical Role (25%) → Supervised (0%) → Cleared (0%) → Annual (10%) → Drills (0%)
- Visualizes gated progression: PRE → GAO → ROLE → SUPERVISED → CLEARED drives unlock. Current GAO 60%.
- Used in journey-overview and supervisor contexts (profileBars mirror GAO/Role/Supervised/Annual).

## Modules (Grid / "Table" Representation)
- Default view: `grid grid-cols-1 md:grid-cols-2 gap-3` of module cards.
  - Each: `rounded-xl border ... bg-brand-neutral-50 p-3`
    - Header: `font-mono text-[10px] text-brand-orange-500` ID + bold title; right ToneBadge (status)
    - Meta: `{method} · {policyRefs}`
    - If score: `{score}%` in teal
    - If supervisorSignature: amber "Supervisor signature required"
- Status derived from `seedModuleStates` (or module.status):
  - completed → green
  - in-progress → teal
  - locked → orange
  - available → slate
- journey-v1 variant: similar but simpler 3-col cards, fewer fields, top filter tabs.
- module-player: single focused module header (not grid).
- No traditional <table> for main modules (card grid for scannability); tables reserved for appendix-f checklist and supervisor roster.

## Progress (Metrics, Bars, Status)
- **Top metrics** (4 MetricTiles via view.metrics, teal/orange/green/amber tones):
  - journey-overview: GAO complete 60% (4 of 6), Role modules 25%, Appendix F Signed, Cleared No.
  - module-player: Method, Status Complete, Score 100%.
  - appendix-f: Items 15, Complete 12/15, Pending 2, Signature Required.
  - supervisor: Roster 14, Escalations 1, Cleared 4, GAO-EXAM pending 3.
- **Inline progress:** SurfaceCard has h-2 bg bars (width % + tone color). Module cards show % score when present.
- **Phase pcts:** Rail shows % per phase. profileBars in supervisor: horizontal % labels + value (e.g. GAO Complete 60 teal).
- **State indicators:** ToneBadge dots, colored backgrounds, "Appendix F cleared/pending" dot (emerald/orange), locked alerts.
- Progress drives gating: e.g. GAO-EXAM locked until prereqs + supervisor review; RN-SUP locked until visits.

## Learner View (Sidebar + Profile)
- Left panel (xl:col-span-3) in overview:
  - "Learner" label + name (xl bold) + role · Start date
  - Dot + "Appendix F cleared" (true → emerald, else orange)
  - Phases rail (timeline)
- supervisor view augments:
  - Uses ProfilesPrototype right panel: selectedRecord title/subtitle/status badge
  - profileBars list (GAO, Role, Supervised, Annual) with % 
  - Roster DataTable shows multiple learners' progress (GAO/Role/Supervised/Esc/Status)
- Shared across: supervisor name "Dr. Elena Navarro, RN DON"; learner "Maria Santos, RN"

## Appendix-F Specific (Checklist / Matrix View)
- DataTable with columns: #, Check Item (HR-TA-001), Policy Ref, Status
- Statuses use last-col ToneBadge (PASS/NA → teal; PENDING → orange)
- Cards highlight "Hard stop gate" + "HR Director signoff"
- Hard stop: No work permitted (incl. GAO) until all PASS/NA + signed.

## Supervisor Specific
- Roster DataTable + selected learner focus panel
- Profile progress bars + quick actions card (log visit, remediation, escalations)
- Clearance gate callout referencing HR-TA-005 App B

## Key UI Elements & Styling
- Consistent with global: `rounded-2xl` / `rounded-xl`, `shadow-soft`, `hover-lift` on cards.
- Brand teal (#004142 dark, #00797D, #06A6AB), orange accent, neutral cards.
- ToneBadge: colored pill + dot (teal/green positive, orange/amber warning, slate default).
- Icons via lucide (route, play-circle, user-check, scroll-text, etc.).
- Responsive: stacks on mobile; 12-col on xl for overview.
- Interactions noted in UI: "Clicking card simulates player"

## Other Views / Related
- journey-admin (not focused): catalog matrix + evidence/esc metrics.
- user-guide: docs list (Day 0 pre, GAO phase, ROLE+Supervised).
- Ties into onboarding-v2 (separate 06) and HR-TA-005 / policy refs (GAO-EXAM, Appendix D/E, etc.).
- Gating, dual signatures, evidenceAppendices, and method-specific players are core patterns.

**Source Sections:** VIEW_GROUPS registration ~1495-1619 (Onboarding items), seeds ~683-732 (journeyLearner/Modules/Phases/seedModuleStates), JourneyPrototype ~3037-3157 (all branches + default grid), MatrixPrototype ~4203, ProfilesPrototype ~2536, DataTable ~1911, MetricTile/SurfaceCard/ToneBadge ~1866-1909, renderTemplate ~4231, tones ~129, App/TopBar/metrics ~4590-4600, metric/card/view helpers ~1027-1046.

(Generated from analysis of index.html + V6 assets. Matches base 07-journey.png shell + runtime renders.)
