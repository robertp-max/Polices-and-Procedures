# Developer Maintenance Guide

## 1) Adding New Components or Pages

## New page

1. Create file under `src/policy/pages/...`.
2. Add lazy import and route in `src/App.tsx`.
3. Decide whether route should be:
   - standalone (outside `CommandCenterLayout`) or
   - in-shell (inside `CommandCenterLayout`).
4. Wire to existing stores/services; avoid creating duplicate state source.
5. Update `Component_Registry.md` and `Page_and_Route_Map.md`.

## New reusable component

1. Place under appropriate subtree:
   - shared: `src/policy/components`
   - regulatory: `src/policy/components/regulatory`
   - workflow: `src/policy/workflows/components`
   - journey: `src/policy/journey/components`
2. Keep props typed and stable.
3. Ensure print/no-print class behavior if rendered in printable contexts.

---

## 2) Adding Policies and Forms

## Policy

- If policy metadata or lifecycle data changes, update source seed and adapter chain:
  - `frameworkSeed.generated.ts` (or generation source)
  - `frameworkSeedAdapter.ts`
  - `policyStore` consumers
- If printable policy body is required:
  - update `policyContentMap.ts` / generated specimen content chain.

## Form

1. Update source form files (`Builder/Forns/*.txt`) where applicable.
2. Run forms build pipeline (`scripts/formsSystemBuild.ts`) and reconcile outputs.
3. Verify `FORMS_DATASET` includes:
   - `id`, `name`, `policies`, domain metadata.
4. Add/adjust content override in `formsLibraryContent.ts` when needed.
5. Verify rendering in:
   - `FormsPage`
   - `FormViewer`
   - `FormPrintView`

---

## 3) Linking Entities Safely

## Policy ↔ Form links

- Maintain policy IDs in `FormRecord.policies[]`.
- Run `scripts/verifyPolicyCoverage.ts`.
- Fix any unmatched policy IDs before merging.

## Workflow ↔ Form/Policy links

- Update workflow markdown source.
- Re-run `scripts/compileWorkflows.ts`.
- Confirm generated graph contains expected `byForm`/`byPolicy` links.

## Control inventory ↔ policy links

- Ensure `source_policy_ids` in MCI JSON match policy ID taxonomy.
- Validate MCI page still loads from static path in target environment.

---

## 4) Avoiding Stale Data

1. Never hand-edit generated files when compiler/build scripts are source of truth.
2. After updating sources, run corresponding scripts:
   - workflow: `scripts/compileWorkflows.ts`
   - forms: `scripts/formsSystemBuild.ts`
   - coverage: `scripts/verifyPolicyCoverage.ts`
3. Clear/rebuild caches when IA or generated mappings drift:
   - `.cache/forms-build/*`
   - `.cache/ia-index/*` (rebuild using IA index script)
4. Re-verify route usage for legacy files (`*.old.tsx`, alternate app files).

---

## 5) Testing Changes

## Minimum checks

- Route-level smoke test for touched pages in `src/App.tsx`.
- Component interaction test for affected stores/actions.
- Print test for:
  - policy route (`/print/:policyId`)
  - form route (`/forms/:formId/print`)
  - GV-GB custom routes
- Brad test:
  - `/api/ia/health` ready
  - query and chat SSE complete
  - references load

## Data integrity checks

- Policy/form linkage coverage script.
- Workflow compiler output diffs.
- Regulatory execution state behavior with lock/certification flows.

---

## 6) Consistency Rules

1. Route definitions belong in `src/App.tsx` unless intentional nested route app.
2. Keep IDs taxonomy-consistent (`XX-...-NNN` patterns) across policies/forms/workflows.
3. Use single source of truth per data domain (store + generated/static source).
4. Keep `Needs confirmation` markers when ambiguity exists; do not infer silently.

---

## 7) Avoid Breaking Print System

1. Keep dedicated print routes outside layout.
2. Preserve route ordering for specialized print paths before generic policy print.
3. Maintain `no-print` and print CSS contract in both global and local print components.
4. Keep iframe cleanup behavior in `printForm.ts`.
5. Validate orientation handling and table overflow in print preview.

---

## 8) Avoid Breaking Brad

1. Keep IA router contract stable (`/api/ia/*`).
2. Preserve SSE event shape (`phase1`, `complete`) expected by hooks.
3. Do not remove responder guardrails:
   - citation materialization from passage map
   - raw dump prevention
   - scenario fallback
   - emergency lead enforcement
4. Rebuild index after corpus or ingest/parsing changes.
5. Confirm Ollama configuration/env alignment after backend changes.

---

## 9) Needs Confirmation

1. Whether deterministic `src/policy/brad/*` should be integrated into current iAdministrator runtime path.
2. Whether MCI source JSON path is guaranteed in all deployment targets.
3. Whether session/audit storage must move from local/in-memory to shared persistence for production.

---

## 10) Onboarding System Maintenance (Existing Module)

Onboarding is implemented under `src/policy/journey/*`. Maintain it as an active subsystem.

### Safe change sequence for onboarding

1. Update module definitions in `src/policy/journey/data/modules.ts` (role, phase, policy refs, methods, prerequisites).
2. Validate gate logic compatibility in `src/policy/journey/utils/gating.ts`.
3. Verify journey page impacts:
   - `JourneyHomePage.tsx`
   - `AppendixFPage.tsx`
   - `ModulePlayerPage.tsx`
   - `SupervisorPage.tsx`
   - `AdminPage.tsx`
   - `UserGuidePage.tsx`
4. Confirm store compatibility in `src/policy/journey/stores/journeyStore.ts` (persist key/version and migration behavior).
5. Re-check role-specific paths using seeded users in `src/policy/journey/data/employees.ts`.

### Onboarding-specific regression checklist

- Appendix F hard-stop still blocks progression before sign-off.
- Learner can only open modules allowed by role and prerequisite status.
- Supervisor can log supervised visits with expected visit types.
- DON/supervisor clearance gating still requires prerequisite completion.
- Escalations are generated and can be acknowledged/resolved in admin.
- Annual training and drill modules remain visible in expected phase/group slices.
- Policy references remain visible to learners where applicable.

---

## 11) AWS Phase 1 Migration Checklist (Onboarding Impact)

This checklist tracks backend gap closure for onboarding without overstating current implementation.

### Required Phase 1 backend work

1. Identity and role claims
   - Introduce authenticated identity source and role claim mapping for onboarding actions.
2. User profile records
   - Add durable user/profile objects that map to onboarding employee entities.
3. Onboarding state persistence
   - Replace browser-only persistence with API-backed writes/reads.
4. Supervisor sign-off records
   - Persist sign-offs as immutable records with signer identity and timestamp.
5. Evidence storage and retrieval
   - Introduce presigned upload/download path and metadata index records.
6. Audit logging
   - Record onboarding mutations into append-only backend audit stream.
7. Data model alignment
   - Finalize DynamoDB/object-store indexing model and reconcile with existing R2 architecture notes.

### Keep out of scope for Phase 1

- Advanced predictive analytics and broad optimization layers.
- Full cross-domain event orchestration if core identity/persistence/audit foundations are incomplete.

---

## 12) Universal Navigation Controls — Maintenance Guide (Added 2026-04-23)

### Adding a new excluded route

Edit `src/policy/utils/navExclusions.ts` and add a new `RegExp` to the `EXCLUDED_PATTERNS` array:

```typescript
/^\/your-new-detail-route\/.+/,
```

Rules for exclusion candidates:
- Any route where the user may be filling in a form or typing.
- Any route that renders outside the shell chrome (detailMode pages, standalone print views).
- Any route where `←` / `→` keys have a native meaning (PDF viewers, sliders, carousels).

### Modifying the nav stack behavior

All state is in `src/policy/stores/navStore.ts`. The `_skipNext` flag prevents double-counting programmatic navigations — do not remove it.

If you add a new navigate call anywhere in the app (e.g., a "deep-link open" from a dashboard card), ensure it does **not** need to suppress `push()`. Most normal link/navigate calls do not need to touch `_skipNext`.

### Regression checklist for nav controls

1. Load app → navigate Dashboard → Workflows → Calendar → click Back ×2 → should return through Workflows to Dashboard.
2. Open policy detail (`/library/:policyId`) → arrow keys should NOT navigate; Back button should be hidden (chrome hidden).
3. Open form viewer (`/forms/:formId`) → arrow keys should NOT navigate.
4. Focus the global search input → arrow keys should NOT navigate.
5. Open hamburger menu → arrow keys should NOT navigate.
6. Swipe right on Dashboard → should go back one route.
7. Open a print page (`/print/*`) → no nav controls visible; keyboard arrows do not navigate.

### AWS Phase 1 impact

Navigation state is **intentionally client-only**. No AWS backend changes are required to support the nav control system in Phase 1.
