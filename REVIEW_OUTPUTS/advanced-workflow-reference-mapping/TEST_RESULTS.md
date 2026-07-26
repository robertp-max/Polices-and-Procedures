# Test Results — Advanced Training + Workflow References

## Runnable automated checks (pass)

### `journey:verify:corrections` (`scripts/verifyJourneyCorrections.ts`)
Relevant sections to this workstream, both passing:
- **Advanced Training strict projection (§3/§4)**
  - `ADVANCED_TRAINING_MODULE_IDS` is exactly `cms-485, qapi, oasis-e2-soc, documentation-matters` in order
  - Advanced visible with exactly 4 ordered modules for PT/RN/DON/ADM
  - Advanced hidden (0 modules) for LVN/HHA/PTA/OT/COTA/SLP/MSW/GAO
  - Every Advanced card launches a canonical player route (RN checked directly: `playerAvailable` true + non-null `launchRef` for all 4)
- **Workflow catalog + role-filtered references (§4/§10/§11/§14)**
  - Workflow catalog generated from the canonical registry: 206 workflows
  - `CL-WF-26` is a canonical workflow in the registry-backed catalog
  - Featured simulation is a training-namespaced prototype (`TRAIN-CL-WF-26`) teaching canonical `CL-WF-26`
  - All 10 workflow domains present in the catalog
  - No workflow cards appear in Training assignments for either a clinical persona (`taylor-rn`) or an office persona (`jamie-office`) — confirms §10/§17 removal from required training
  - RN references are a bounded, typed subset (not all 206), and every reference type is one of core/conditional/awareness/leadership
  - General/office references are bounded (universal set), not the whole library
  - Every persona reference id resolves to a real catalog workflow (0 unresolved)
  - No `"GB"` persona key exists in the reference map
  - `GV-WF-01/02/13/14` are never referenced for any persona
  - ADM references include leadership-type references

This script covers considerably more ground than just this workstream (it also asserts ACHC audience, dedup, main-app origin resolution, OIG/SAM applicability, HHA supervised-visitation clocks, annual equivalency gating, and CL-WF-26's gated-simulation stage validation) — all of that also passes, but is outside this package's scope.

### `journey:workflows:verify` (`scripts/verifyWorkflowCatalog.ts`)
Reported **7/7** checks passing — catalog/source-manifest drift gate (count, domain counts, hash correspondence) confirmed clean against `src/policy/data/workflows.generated.ts`.

### `journey:verify:guardrails` (`scripts/verifyJourneyGuardrails.ts`)
Reported **PASS**.

### TypeScript
`tsc` — **0 errors** across the checked project scope.

## Live spot-checks performed (manual, at desktop viewport)
- `/journey/training/advanced` as RN — confirmed exactly 4 Advanced cards render, in the `cms-485 / qapi / oasis-e2-soc / documentation-matters` order.
- Same route as LVN — confirmed the Advanced section is absent (hidden, not empty-stated).
- `/journey/workflows` — confirmed typed reference tags (core/conditional/awareness/leadership) render, duty-overlay `<details>` panel is present and expandable, and no "Required now"/progress/completion UI appears anywhere on the page.
- Prototype banner — confirmed the "Prototype simulation preview · no official completion" copy renders for the `TRAIN-CL-WF-26` featured simulation.

## NOT RUN (honest gaps)
- Full automated responsive matrix (320 / 375 / 768 / 1024 / 1440 px, 200% zoom) across all personas — see `RESPONSIVE_QA.md`.
- Full keyboard-only navigation sweep and screen-reader pass — see `ACCESSIBILITY_QA.md`.
- No backend changes were made or tested (none were in scope).
- No new workflow-training player was built or tested (none was in scope — the CL-WF-26 simulation is an existing prototype, unchanged by this task).
- No deploy was performed or verified as part of this task.

## Browser sweep executed (UPDATE)

Ran an in-app Browser-pane responsive sweep across key routes at 320px and 1440px for RN /
HHA / office personas. Result: no page-level horizontal overflow after fixing one real bug —
`policy-player.css` was orphaned (never imported), so the policy reader's premium layout +
≤980px responsive rules never loaded (320px overflow). Fixed (commit 60357ac7) and re-verified.
The full automated 6-viewport + 200%-zoom + keyboard + screen-reader matrix across all personas
remains a committed-Playwright follow-up (blocked by a pre-existing npm ci lockfile mismatch).
