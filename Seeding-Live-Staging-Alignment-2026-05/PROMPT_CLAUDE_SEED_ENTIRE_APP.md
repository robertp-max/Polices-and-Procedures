# PROMPT — Seed the Entire V3 App (Full Surface Coverage)

**Target AI**: Claude (Sonnet 4 / Opus recommended for deep codebase reasoning)  
**Context**: You are continuing the V3 CES seeding work. The user will paste this entire file as the first message (or attach the folder).  
**Date prepared**: 2026-05-21  
**Goal**: Expand from "CES-only" seeding to **complete, high-fidelity, toggleable seeding of the entire application** inside the V3 glass staging harness (`/ui-staging`).

---

## 1. Project Overview (Read This First)

This is **ci-policy-app** — an enterprise Home Health (HH) agency platform for:

- Policy & Procedure lifecycle management (ACHC, CMS, state, payer-specific)
- **CES** — Compliance Execution System (sprints, regulatory events, execution units, evidence, signatures, workflows)
- Evidence Center + eCIgn (electronic signature + form capture)
- Forms library & dynamic form rendering
- Audit readiness, surveys, risk scoring
- Onboarding (multiple generations: legacy + v2 engine)
- Journey / SCORM training & competency tracking
- Staffing, visit scheduling, missed visits, clinician credentialing
- Brad AI Copilot (workflow intelligence + proposal generation)
- Hubstaff time tracking sync
- iAdministrator deep admin surfaces
- Full audit trails, enforcement, governance

**Tech stack**:
- Frontend: React 19 + TypeScript + Vite + Zustand + React Router + Tailwind + @dnd-kit
- Backend: Express + AWS (DynamoDB, Cognito, SES) + Vercel
- Heavy codegen: many `.generated.ts` files for policies, workflows, ACHC crosswalks, forms catalog

**Current V3 Design System** (critical):
- "Veil glass" / flat-glass aesthetic — see `src/ui-staging/v3Tokens.ts` and `ui-staging.css`
- **Strict rules** documented in `Seeding-Live-Staging-Alignment-2026-05/DESIGN_ISSUES.md`:
  - Flat only. No fake depth, no translateY/scale on hover, no box-shadow elevation.
  - Teal (`#00D1C1`) is the single source of truth for all status/progress/state. No rainbow colors.
  - No gratuitous bordered cards around single values or list items.
  - White space + typography + alignment create hierarchy.
  - Orange (`#FFA059`) only for micro-section labels.
- Every harness surface must obey these rules when seeded.

---

## 2. Current Seeding State (What Already Exists)

**Only CES surfaces are properly seeded** (as of 2026-05-21):

- `src/policy/compliance-execution/seededMode.tsx` — `SeededModeProvider`, `useSeededMode()`, `useSeededSnapshot()`
- `src/policy/ces/data/V3_CES_SeedData.ts` + `V3_CES_SnapshotBuilder.ts` — personas, execution units, sprints, regulatory events, metrics
- Injection point: `src/policy/compliance-execution/complianceExecutionStore.ts:266` (if `seededSnapshot` return it)
- Harness usage: `V3StagingApp.tsx` wraps the whole app in `<SeededModeProvider buildSnapshot={buildV3SeededSnapshot} initiallyActive={true}>`
- Surfaces that benefit today:
  - `ces-calendar` → `CesCalendarV3.tsx` (high-fidelity custom harness calendar)
  - `ces-board` → real `CesBoardPage` (full production drag/drop + drawers work because they read `useComplianceExecution`)

Everything else in the 20+ nav sections uses **static hardcoded arrays** inside `V3StagingApp.tsx` (TASKS, CLINICIANS, PATIENTS, hand-rolled policy lists, etc.). These are low-fidelity, inconsistent across pages, and break the "entire app" illusion.

**Read immediately**:
- `Seeding-Live-Staging-Alignment-2026-05/SEEDING_STATUS.md` (full architecture + "how to add a new domain")
- `Seeding-Live-Staging-Alignment-2026-05/DESIGN_ISSUES.md`
- `src/ui-staging/V3StagingApp.tsx` (the entire 1800+ line file — understand every SectionId and its current renderer)
- `src/policy/compliance-execution/` (store + types + adapters)
- `src/policy/ces/data/`

---

## 3. Mission: Seed the Entire App

Make **every** item in `NAV_GROUPS` (and every `SectionId`) render with realistic, consistent, production-shaped data when seeded mode is ON.

The toggle (seeds ON/OFF) must continue to work cleanly. When OFF, the existing toy/empty states are acceptable.

### 3.1 All Surfaces That Need Seeding (from V3StagingApp.tsx)

**OVERVIEW**
- dashboard (current static KPI cards + priority queue)
- my-planner

**CLINICAL**
- clinicians
- patients
- calendar (Visit Calendar)
- visit-schedule
- missed-visits
- referring-physicians

**COMPLIANCE**
- library (Policy Library)
- domain-library
- sop-library
- onboarding (uses `onboarding-v2/` engine + store)
- audit-trail

**FORMS & EVIDENCE**
- forms (Forms Library)
- evidence (Evidence Center — heavy store usage)
- artifact-viewer

**CES** (already done — maintain & expand)
- ces-calendar
- ces-board (real component)
- reports (Reports & Analytics)

**INTELLIGENCE**
- brad (Brad AI Copilot — brad/* + services)

**WORKFORCE**
- hubstaff

**RESOURCES & ADMIN**
- user-guides
- training-materials (journey/ SCORM data)
- help-center
- demo
- admin (users/roles/system/audit-log — security/identity/ + iAdministrator/)

There are also production pages outside the harness (`src/policy/pages/iAdministrator/` has 33 files, `MasterCalendarPage`, `EvidenceCenterPage`, `AuditModePage`, `GovernancePage`, etc.) that should eventually be exercisable with seeds, but **priority is the harness** so we can validate V3 design + interactions fast.

---

## 4. Seeding Architecture Guidance (Follow & Extend the Existing Pattern)

**Preferred approach** (from SEEDING_STATUS "How to Add Seeds for a New Domain"):

1. For domains that already flow through `useComplianceExecution` → extend the snapshot.
2. For domains with their own Zustand stores (most of them) → create parallel "seeded" hooks or store patches guarded by `import.meta.env.DEV && useSeededMode().isSeeded`.
3. Create dedicated seed data files: `src/policy/ces/data/V3_<Domain>Seed.ts` (or a new `src/policy/seed/` folder if it grows large — propose the structure).
4. Create (or extend) a `buildV3FullAppSnapshot()` or per-domain builders.
5. For surfaces that have complex real components, either:
   - Mount the real component (best, like CES Board) if the component already reads from a hook that can be seeded, or
   - Build a high-fidelity harness mirror (like CesCalendarV3) that matches the visual + interaction intent.

**Key stores / data sources you must analyze** (non-exhaustive):
- `policy/stores/` (policyStore, regulatoryExecutionStore, autogenStore, calendarStore, calendarSyncStore, reviewStore, auditorModeStore, dashboardStore, enforcementStore, frameworkStore, uiStore, navStore)
- `policy/pm/` (many stores: personalStore, pmViewSprintStore, selectedTaskStore, notificationStore, taskProjection, formInstances, etc.)
- `policy/evidence/` + `policy/ecign/`
- `policy/onboarding-v2/store/`
- `policy/journey/stores/`
- `policy/staffing/stores/`
- `policy/security/identity/` (user, role, session models)
- `policy/compliance-execution/` (the CES one we already own)
- `policy/ces/` types & services
- Generated data in `policy/data/` (masterControlInventory, regulatoryEvents, workflows, formsCatalog, etc.)

Many pages also read directly from generated files or `usePolicyStore`, `useRegulatoryExecutionStore`, etc.

**Consistency requirements**:
- One canonical set of personas (staff, clinicians, patients, "Brad", "Dee Bustos", governing body members, surveyors, etc.)
- One set of active sprints / regulatory events that all surfaces agree on
- Evidence artifacts, form instances, signatures, and completion states must be coherent across Evidence Center, CES Board, Audit Trail, Onboarding, etc.
- Dates anchored around the current "today" used in CES seeds (2026-05-21 in the snapshot)

---

## 5. Your Workflow (Start Here)

**Phase 0 — Audit & Plan (do this first, output the plan)**

1. Read all the "Read immediately" files listed in section 2.
2. Grep the codebase for every `useSelector`, `useStore`, `create(` (zustand), and `import.*from '@/policy/(stores|pm|evidence|onboarding|journey|staffing|security|ces|compliance-execution)` used by the harness pages and the real production pages they mirror.
3. Produce a **Seeding Domain Map** table:
   - Domain / Surface
   - Primary data source(s) / store(s)
   - Current harness implementation (static vs real)
   - Complexity (Low/Med/High)
   - Recommended seeding strategy (extend CES snapshot | new seeded hook | full mirror component | direct static import patch)
4. Propose folder structure for new seed files (keep CES pattern or centralize under `policy/seed/`).
5. Identify any blockers (e.g. components that do `import { REGULATORY_EVENTS } from '...' ` statically and bypass hooks — like the old MasterCalendarPage problem).
6. Recommend a phased rollout order (e.g. Dashboard + My Planner + Policy Library first, then Clinical ops, then Evidence/Forms, then Admin, then Brad/Hubstaff/Journey).

**Phase 1 — Foundation**
- Create any missing shared seed primitives (Personas, OrgUnits, Date anchors, PolicyDomain enum values, realistic policy counts per domain, etc.).
- Extend or create a master `V3_AppSeed.ts` + builder that the provider can consume.
- Make the seed toggle visible and reliable in the harness header (it already exists in some places — polish it).
- Seed Dashboard + My Planner with coherent priority queue, KPIs, and task lists that match the CES sprint data.

**Phase 2+**
- Continue domain by domain following the plan from Phase 0.
- For each domain: seed data file → injection hook(s) → update harness page (or mount real component) → verify against DESIGN_ISSUES rules.
- Update `SEEDING_STATUS.md` as you go (append new sections).

**Non-negotiables**:
- All seeded data must be realistic for a mid-size Home Health agency (30–80 clinicians, multi-state, ACHC accredited, active survey prep, ongoing PIPs, etc.).
- Interactions should feel alive (filtering, searching, clicking into detail drawers, drag/drop where applicable, progress bars that reflect real completion).
- No rainbow status colors. Everything teal.
- When seeds are OFF, do not regress existing toy states.
- Keep the harness fast (no heavy computation in buildSnapshot unless memoized).

---

## 6. Additional Context & Tips

- There is a `V3_2StagingApp.tsx` (lighter iteration). Focus on the main `V3StagingApp.tsx` first unless the user says otherwise.
- Many verification scripts exist (`npm run verify:*`, `check:evidence-phase*`). After seeding a domain, you may be asked to make the verify scripts pass against seeded data.
- Backend seeding (`seed:deeb`, Dynamo records, Cognito) exists but is secondary for now — the harness is 95% frontend data.
- The "Brad" persona has deep workflow knowledge (`policy/brad/`). Seeding Brad surfaces should eventually show realistic proposals and runtime state.
- iAdministrator pages are very deep (33 files) — they may need their own mini-harness or seeding strategy later.

---

## 7. Output Format for First Response

Please reply with:

1. **Confirmation** you have read the key files (list which ones you opened).
2. **Seeding Domain Map** (table as described in Phase 0).
3. **Proposed Architecture** (how you will extend the existing `SeededModeProvider` pattern — one giant snapshot? context composition? Zustand middleware? etc.).
4. **Phased Plan** with rough effort estimate per phase.
5. **Any clarifying questions** (data ownership, which surfaces are highest priority for the next user demo, whether we should also make real production pages seed-aware, etc.).
6. **First concrete deliverable** you want to implement (e.g. "I'll start by creating `V3_AppSeedPrimitives.ts` + seeding Dashboard + My Planner").

Then wait for user approval / priority ranking before writing large amounts of code.

---

## 8. Files You Should Have Open Before Writing Any Code

```
Seeding-Live-Staging-Alignment-2026-05/SEEDING_STATUS.md
Seeding-Live-Staging-Alignment-2026-05/DESIGN_ISSUES.md
src/ui-staging/V3StagingApp.tsx
src/ui-staging/v3Tokens.ts
src/ui-staging/ui-staging.css          (for V3 glass rules)
src/policy/compliance-execution/seededMode.tsx
src/policy/compliance-execution/complianceExecutionStore.ts
src/policy/compliance-execution/types.ts
src/policy/ces/data/V3_CES_SeedData.ts
src/policy/ces/data/V3_CES_SnapshotBuilder.ts
src/policy/stores/*.ts                  (at least the main 5-6)
src/policy/pm/*.ts                      (taskProjection, stores)
```

---

**This prompt is self-contained.** Paste the whole thing (or the file path + "read this and the two .md files in the Seeding- folder") to Claude and say "Begin Phase 0."

The user will iterate with you after Claude's first plan.

---

*End of prompt — ready for Claude.*