# Course of Action: Pull Real CES Data + Seed V3 Veil Drawers/Folders/Modals

**Date**: 2026-05-20  
**Context**: User directive "sorry save for now. advise course of action pull data and seed v3?" on the approved 16-Agent Veil Implementation Function Audit for CES Decluttering.

**Goal**: Before (or in parallel with) wiring the `glassVariant="v3-veil"` calls and removing legacy `ci-right-panel` / CES_TOKENS, give the new veiled drawers, folders, and modals **real, rich, production-shaped data** (evidence trees with FolderOpen, full task timelines, signatures, workflow steps). This turns the "veiled replacements" into functional demos that match the PDF mocks and the spec's "rich content" requirement, instead of flat legacy lists or empty shells.

This directly closes the gaps flagged in the plan (Agent 05 Folders, Agent 11 Data Fidelity, Agent 14 UAT Flows, and the Status Report's "rich content from real mocks").

---

## Recommended 4-Phase Action Plan (Save for Now — No 16-Agent Swarm Yet)

### Phase 0: Quick Audit of Existing Data Shapes (30-45 min, read-only)
Run these exact commands / greps (or let me do them):

```bash
# 1. Canonical evidence + folder shapes
grep -n "Evidence\|Folder\|evidenceDir\|eventFolders" src/policy/stores/regulatoryExecutionStore.ts src/policy/compliance-execution/types.ts src/policy/ces/data/*.ts 2>/dev/null | head -40

# 2. Task / Workflow detail shapes used in the current drawers
grep -n "TaskDetail\|WorkflowUnit\|SignatureRoster\|EvidenceStatus" src/policy/pm/ src/policy/ces/ src/policy/components/pm/TaskDetailRightPanel.tsx | head -30

# 3. What the spec docs expect for "rich content" in the V3 replacements
grep -A 20 -E "rich content|exact PDF|folders|FolderOpen" docs/CES_Evidence_and_Tasks_Right_Panel_V3_Drawers_To_Implement.md
```

**Deliverable**: A 1-page `src/policy/ces/data/V3_CES_Data_Shapes.md` (or inline comments) listing the 4-5 core interfaces that the veiled drawers must consume.

### Phase 1: Pull & Normalize Real Data (1-2 hours)
Create a new file (recommended location so it is easy to import from both production drawers and ui-staging):

**`src/policy/ces/data/V3_CES_SeedData.ts`** (or `src/policy/data/cesV3Seeds.ts`)

Export typed seeds that mirror the real stores:

```ts
export const V3_EvidenceFolderTree = [
  {
    id: 'ev-fold-001',
    name: 'Q1 QAPI Evidence',
    type: 'folder',
    status: 'complete',
    children: [ /* real-shaped evidence items with SHA, dates, signer, url */ ],
    // ... exact fields from regulatoryExecutionStore + eventFolders.ts
  },
  // ... 3-4 more folders for tasks, incidents, HR, etc.
];

export const V3_TaskDetailSeed = { /* full Assignment, Timeline events, eCIgn forms, Audit log, linked evidence folders */ };

export const V3_WorkflowUnitSeed = { /* steps, EvidenceStatusPanel data, SignatureRoster, ChildTasks with folders */ };

export const V3_SignatureRosterSeed = [ /* 2-4 signers with status, dates */ ];
```

**Rules**:
- Use the **exact TypeScript interfaces** from `compliance-execution/types.ts`, `regulatoryExecutionStore`, `pm/types.ts`.
- Pull 2-3 realistic examples per type (not 20; enough for demo + audit).
- Make the seeds "PDF-faithful" (match the calm, low-density layouts in APP_Screenshots.pdf for right panels).
- Add a `// TODO wire to real store selector when veil is active` comment on every top-level export.

**Optional but powerful**: Also export a tiny `useV3CESSeed()` hook that returns the above (so drawers can `const data = isV3 ? useV3CESSeed() : realStoreData`).

### Phase 2: Seed the Veil Primitives (30-60 min, minimal change)
Update the 4-5 key components (only the `isV3` / `glassVariant === 'v3-veil'` branches):

- `GlobalTaskDrawer.tsx` → pass `V3_TaskDetailSeed` (and folders) down to TaskDetailRightPanel when v3.
- `WorkflowDrawer (ces version)` → replace the CES_TOKENS-driven flat lists with `V3_WorkflowUnitSeed` + folder trees inside the v3-veil-glass-panel.
- `TaskDetailRightPanel.tsx` and `EvidencePanel.tsx` (the new V3 versions or the isV3 sections) → render folder trees + rich sections from the seeds.
- `VeilModal.tsx` (when used for evidence approvals or task confirmations) → seed with relevant folder or task slice.
- Any `RightDrawer` / `BottomSheet` usage in MasterCalendar / MyTasks that flips to v3-veil.

Add a dev-only toggle or feature flag (`pm/featureFlags.ts` or local `const USE_V3_SEED = true;`) so you can instantly see the veiled drawers populated with real-shaped data while the legacy ci paths remain untouched.

**Result**: Opening a task or workflow unit in a v3-veiled drawer now shows **folders, real evidence items, signatures, timelines** — exactly the functional replacement the spec and PDF demand.

### Phase 3: Hand-off to the 16-Agent Veil Function Audit (or direct wiring)
Once the seeds exist:
- The 16 agents (especially 05, 11, 14, 03, 07, 16) will have concrete, high-fidelity material to audit "does the veiled drawer actually deliver the full functional content inside the glass?"
- The master scorecard will be far more valuable ( "Veil + Data Fidelity: 65% (primitive 30% + seeded content 35%)" instead of "0%").
- The P0/P1 patches from Agent 16 will be "wire the seeds + flip the glassVariant calls in calendar:372, my-tasks:370, board:212".

You can then decide: run the 16-agent swarm for the diagnostic report, or go straight to the minimal wiring PRs (the "1-line patch" style recommended in the plan).

---

## Immediate Next Steps I Recommend (You Choose Order)

1. **Today / tomorrow**: I (or you) run the Phase 0 greps and create the `V3_CES_SeedData.ts` skeleton with 2-3 evidence folders + 1 full task + 1 workflow unit. (I can generate the first draft in <10 min once you confirm the file path.)

2. Drop the seed file into the Veil-Declutter-Function-Audit folder as `02_V3_CES_SEED_DATA_DRAFT.ts` for review.

3. Wire the seeds into **one** high-visibility surface first (e.g. the WorkflowDrawer used by SprintExecutionBoard) behind the `glassVariant` check — this gives an instant "before/after" visual for the PDF comparison.

4. When ready, say "seed the rest + flip the calendar/my-tasks" or "now deploy the 16 agents on the seeded state".

This "pull data and seed v3" work is the highest-leverage thing you can do while "saving for now" — it makes the eventual veil implementation **demonstrably functional** instead of just pretty glass over empty or legacy content.

---

**Status**: Plan frozen per your "save for now". This seeding plan is the advised bridge that makes the 16-agent audit (or the direct Claude wiring) dramatically more effective.

Ready when you are — just say the word (or "generate the seed file now") and we'll pull the real shapes and populate the veiled drawers with proper folders and rich CES data.