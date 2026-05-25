# V3 Seeding — Structural & Data Baseline Exploration Report

**Prepared**: 2026-05-20 by Grok 4.3 (pre-swarm)  
**Purpose**: Fast context for all 16 seeding agents so they do not waste time rediscovering the current state of mocks vs real data.

---

## 1. Current Mock Data Situation in UI-Staging

**File**: `src/ui-staging/V3StagingApp.tsx` (~2244 LOC)

- Contains ~18 separate hardcoded arrays (TASKS, CLINICIANS, PATIENTS, policies, domains, visits, artifacts, forms, etc.).
- Heavy use of inline `V3` token object (duplicates `v3Tokens.ts`).
- Many dates hardcoded to May 2026 (will rot).
- Almost no folder hierarchy — flat lists or very shallow trees.
- Evidence items exist only as simple strings or minimal objects (no triplet, no SHA, no folder nesting).
- Signature data is almost non-existent or single-signer only.
- No realistic workflow step state or EvidenceStatusPanel data.

**Impact on IMPLEMENTATION_PLAN**: Every S1 interactivity task (search, filter chips, domain filtering) will look weak until the underlying data has enough variety and nested structure.

---

## 2. Real Production Data Shapes (Key Sources)

| Domain              | Primary File(s)                                      | Richness | Notes for Seeding |
|---------------------|------------------------------------------------------|----------|-------------------|
| Evidence Folders    | `regulatoryExecutionStore.ts`, `cesEvidenceHierarchy.ts`, `eventFolders` | High     | Already has nested structure — must replicate exactly |
| Task / Assignment   | `taskProjection.ts`, `pm/taskProjectionCore.ts`     | High     | Rich timelines + obligations exist |
| Workflow Execution  | `complianceExecutionStore.ts`, `WorkflowDrawer.tsx` | Medium   | Steps + evidence gates exist |
| Signatures          | `signerTaskFactory.ts`, `FormSigningWorkspace.tsx`  | Medium   | Multi-signer logic is there but seeds are thin |
| Artifacts / eCIgn   | `artifactToFormInstance.ts`, `captureSignedFormSnapshot.ts` | High | Critical for the "real PDF not template" requirement |
| Personnel           | staffing types + real Clinician/Patient pages       | High     | Use real-ish names/roles/credentials |
| Calendar / Events   | `calendarSyncStore.ts`, `auditRegulatoryEvents.ts`  | High     | Must support the 4-view consistency problem |

**Key Finding**: The real stores already contain most of the shape we need. The seeding task is largely **extraction + realistic subsetting + safe export**, not invention.

---

## 3. Existing Seed / Mock Patterns Worth Reusing

- `src/policy/data/auditRegulatoryEvents.ts`
- `src/policy/journey/data/` modules
- `src/policy/pm/formInstances.ts`
- Various `*.seed.ts` or `mock*.ts` files scattered in `src/policy/`

**Recommendation**: New canonical location = `src/policy/ces/data/V3_CES_SeedData.ts` (or `src/policy/data/v3Seeds/ces.ts` if we split later).

---

## 4. Immediate Gaps the Swarm Must Close

1. **Folder depth & triplet** — almost completely missing in current staging mocks.
2. **Multi-signer history** — required for the eCIgn PDF chain work.
3. **Rich timeline + audit log** inside task detail.
4. **EvidenceStatusPanel** data inside workflows.
5. **Stale dates** everywhere.
6. **No safe dual-path** mechanism yet (`isV3` / `glassVariant`).

---

## 5. For the 16 Agents

Use this baseline + the three Veil seed docs as your "first read". Then run the Phase 0 greps from `01_DATA_PULL_AND_V3_SEED_ACTION_PLAN.md` on the real source files before proposing any seed shapes.

This baseline is intentionally short — the real depth will come from your individual domain investigations.