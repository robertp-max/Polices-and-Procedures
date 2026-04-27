# Policy Lifecycle — Developer Documentation

> Reference for engineers extending or integrating with the **Policy Lifecycle Workspace**.
> Implementation lives in `src/policy/lifecycle/` and `src/policy/pages/PolicyLifecyclePage.tsx`.
> Schema target lives in `migrations/002_policy_lifecycle_schema.sql`.

---

## 0. Current v1 Implementation Status

**Implemented**
- 5-state lifecycle (DRAFT · REVIEW · APPROVED · PUBLISHED · ARCHIVED) — no "Deprecated"
- Unified route `/policy-lifecycle` (and `/policy-lifecycle/:policyId`) with redirects from `/drafts`, `/drafts/:policyId`, `/review`, `/publish`
- All seeded policies registered as DRAFT, `createdBy = TJ Padilla` (`robertp@careindeed.com`, AI Researcher)
- **Lifecycle seed now uses real policy corpus** (`src/policy/lifecycle/lifecycleSeed.ts` → `src/policy/data/policyCorpus.ts`) — same 278 policies as `/library`; placeholder/stub/demo/test records are excluded at build time
- Provenance strip in the workspace top bar: "Source: Real Policy Corpus · N policies"
- Empty state when corpus is empty: "No lifecycle-ready policies found. Import real policy corpus to begin."
- Pure state machine with append-only history events
- FNV-style 64-bit chain hash linking each history entry to its predecessor
- Self-approval guard (author cannot approve their own policy)
- Rationale guard (≥ 8 chars required for `requestRevision`, `reject`, `archive`, `reopenForRevision`)
- Auditor-mode guard (every transition blocked while auditor mode is on)
- Three-pane workspace with state filter chips, queues, mode chips, history timeline, action rail
- Left rail search across `policyId`, `title`, `ownerSteward`, `subdomainCode`, `domainCode`, and creator name
- Selected-policy strip in top bar (state chip · id · title · creator)
- v2 placeholder panels visible: Required Approvals, eCIgn Signatures, Evidence Checklist, Audit Trail, Publish Readiness, Acknowledgment Status
- Help Center category "Policy Lifecycle" (6 articles, including a Developer subcategory)
- SQL DDL `migrations/002_policy_lifecycle_schema.sql` (states vocabulary, envelopes, history, partial index, touch trigger)

**Not yet implemented (tracked for v2+)**
- Real server persistence (lifecycle currently lives in the Zustand store seeded at app load)
- Full PolicyVersion relational model with atomic Active/Superseded swap
- eCIgn signature enforcement in the `approve` ceremony
- Materialization of the approver matrix (`PolicyApproval` rows generated on submit-for-review)
- Required-comment anchoring against policy sections in REVIEW
- 14-day acknowledgment SLA engine with escalation
- CES lifecycle event subscription (publish → MyTasks fan-out)
- Audit Mode evidence pack export
- Distribution checks for Google Drive, SCORM, intranet during publish readiness
- Multi-user reviewer routing (UI currently uses a single `DEMO_REVIEWER` for the approve intent)

**Known fix history**
- v1.0.1 — Replaced `usePolicyLifecycleStore(s => s.countsByState())` with a `useMemo` over the stable `envelopes` record. The previous selector returned a fresh object every render, triggering React 18's "getSnapshot should be cached" warning and an infinite render loop on `/policy-lifecycle`. **Rule:** never return a newly-constructed object or array from a Zustand selector consumed via `useStore(selector)` without `shallow`. Select the raw stable slice and derive in `useMemo`.- v1.0.2 — Replaced `loadFrameworkSeed()` in `lifecycleStore.ts` with `loadLifecycleSeed()`. Previous behavior loaded the entire `frameworkSeed.generated.ts` corpus (253 records, 243 `sourceType=\"placeholder\"`), causing the lifecycle workspace to show stub placeholder policies. New behavior loads from `policyCorpus.ts` (278 real policies, same list as `/library`). Placeholder/demo/test/stub entries are excluded by a validation guard inside `policyCorpus.ts`. `PolicyLifecyclePage.tsx` now looks up policy titles from `getCorpusPolicy()` rather than `usePolicyStore`.
---

## 1. Module Layout

```
src/policy/data/
└── policyCorpus.ts        ── Authoritative 278-policy corpus (same dataset as /library)

src/policy/lifecycle/
├── index.ts               ── public re-exports
├── types.ts               ── canonical 5-state model + ancillary types
├── stateMachine.ts        ── pure transition function + guards
├── lifecycleSeed.ts       ── seed source (wraps policyCorpus, validates, exports provenance)
└── lifecycleStore.ts      ── Zustand store (envelopes by policyId)

src/policy/pages/
└── PolicyLifecyclePage.tsx   ── three-pane unified workspace

migrations/
└── 002_policy_lifecycle_schema.sql
```

There is exactly **one** writer to lifecycle state: `usePolicyLifecycleStore.apply()`.
Any other code path that mutates a policy state directly is a defect.

---

## 2. The Five Canonical States

```ts
type LifecycleState = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
```

There is no `Deprecated` state by design.
Old work is either superseded (a new active version is published) or archived (legally retired with justification).

### Allowed transitions

| From       | Intent              | To         | Guard requirements                          |
|------------|---------------------|------------|---------------------------------------------|
| DRAFT      | submitForReview     | REVIEW     | —                                           |
| DRAFT      | archive             | ARCHIVED   | rationale ≥ 8 chars                         |
| REVIEW     | requestRevision     | DRAFT      | rationale ≥ 8 chars                         |
| REVIEW     | reject              | DRAFT      | rationale ≥ 8 chars                         |
| REVIEW     | approve             | APPROVED   | actor.userId ≠ envelope.createdBy.userId    |
| REVIEW     | archive             | ARCHIVED   | rationale ≥ 8 chars                         |
| APPROVED   | publish             | PUBLISHED  | —                                           |
| APPROVED   | requestRevision     | DRAFT      | rationale ≥ 8 chars                         |
| APPROVED   | archive             | ARCHIVED   | rationale ≥ 8 chars                         |
| PUBLISHED  | reopenForRevision   | DRAFT      | rationale ≥ 8 chars                         |
| PUBLISHED  | archive             | ARCHIVED   | rationale ≥ 8 chars                         |
| ARCHIVED   | —                   | —          | terminal                                    |

Every other (from, intent) pair is rejected with `INVALID_TRANSITION`.

### Cross-cutting guards

- **Auditor mode** — when `useAuditorModeStore.getState().enabled === true`, every transition is rejected with `AUDITOR_MODE_BLOCK`.
- **Self-approval** — `approve` requires the actor to differ from the envelope creator. Returns `SELF_APPROVAL_FORBIDDEN`.
- **Rationale floor** — `requestRevision`, `reject`, `archive`, and `reopenForRevision` require a trimmed rationale of at least 8 characters. Returns `MISSING_RATIONALE`.
- **Terminal** — any intent on `ARCHIVED` returns `ALREADY_TERMINAL`.

---

## 3. Public API

```ts
import {
  usePolicyLifecycleStore,
  TJ_PADILLA,
  STATE_ORDER, STATE_LABEL, STATE_COLOR, MODES_BY_STATE,
  legalIntents, transition, createEnvelope,
  type LifecycleState, type LifecycleIntent,
  type LifecycleActor, type LifecycleHistoryEntry,
  type PolicyLifecycleEnvelope, type LifecycleTransitionResult,
} from '@/policy/lifecycle';
```

### Reading state

```ts
const env = usePolicyLifecycleStore(s => s.getEnvelope(policyId));
const reviewQueue = usePolicyLifecycleStore(s => s.byState('REVIEW'));
const counts = usePolicyLifecycleStore(s => s.countsByState());
```

### Mutating state

```ts
const result = usePolicyLifecycleStore.getState().apply(
  policyId,
  'approve',          // intent
  reviewerActor,      // LifecycleActor
  rationaleString,    // optional unless guard demands it
  signatureRefOrNull, // optional eCIgn ref
);

if (!result.ok) {
  // result.code is one of:
  //   INVALID_TRANSITION | MISSING_RATIONALE | SELF_APPROVAL_FORBIDDEN
  //   AUDITOR_MODE_BLOCK | ALREADY_TERMINAL  | NOT_FOUND
  showToast(result.message);
} else {
  // result.next is the updated envelope
  // result.event is the appended history entry (chain hash included)
}
```

### Pure transition (testing)

`stateMachine.ts` exposes `transition(envelope, ctx)` and `createEnvelope(policyId, actor)` as pure functions. They take optional `now`, `idGen`, and `hash` injectors so tests can produce deterministic chain hashes.

```ts
const res = transition(envelope, {
  intent: 'approve',
  actor: reviewer,
  now:   () => '2026-01-01T00:00:00.000Z',
  idGen: () => 'LCY-TEST-1',
  hash:  () => 'deadbeefdeadbeef',
});
```

---

## 4. Store Seeding

`lifecycleStore.ts` calls `loadFrameworkSeed()` and creates one envelope per policy via `createEnvelope(p.id, TJ_PADILLA)`.

```ts
export const TJ_PADILLA: LifecycleActor = {
  userId: 'usr-tj-padilla',
  name:   'TJ Padilla',
  email:  'robertp@careindeed.com',
  role:   'AI Researcher',
};
```

All seeded policies start in **DRAFT** with TJ Padilla as the immutable `createdBy`.
`apply('approve', TJ_PADILLA, …)` therefore fails with `SELF_APPROVAL_FORBIDDEN` for every seeded policy — by design.

---

## 5. History & Hash Chain

Each successful transition appends one `LifecycleHistoryEntry` to `envelope.history`.

```ts
chainHash = hash(`${priorChainHash}|${policyId}|${fromState}->${toState}|${actor.userId}|${timestamp}`);
```

The default client-side hash is a fast 64-bit FNV-style digest used purely for visualization and tamper-evidence in the dev console. The **persistence layer** (when wired) MUST overwrite with the canonical SHA-256 chain stored in `ecign.audit_events`. The shapes are compatible — only the algorithm differs.

A discontinuity between `entry[i].chainHash` and `hash(entry[i-1].chainHash + …)` is a P0 incident.

---

## 6. Workspace UI

`PolicyLifecyclePage.tsx` mounts at:

- `/policy-lifecycle` — empty selection + queue
- `/policy-lifecycle/:policyId` — policy selected
- query params: `?stage=DRAFT|REVIEW|APPROVED|PUBLISHED|ARCHIVED`, `?mode=edit|review|approve|publish|view`

Layout:

```
┌─ Top bar: title + state filter chips (with counts) ─┐
├──────────┬──────────────────────────┬───────────────┤
│  Queues  │  Header + History        │  Actions      │
│  by      │  (mode-aware center)     │  (right rail) │
│  state   │                          │               │
└──────────┴──────────────────────────┴───────────────┘
```

- **Left rail** — sectioned by state, sorted by policyId. Click selects a policy and switches to the default mode for its current state.
- **Center** — colored header card (state-themed), description, mode body placeholder, and the **Lifecycle History** timeline (newest first) with chain hashes.
- **Right rail** — current state badge, rationale textarea, available action buttons (driven by `legalIntents(envelope)`), success/failure message strip.

Mode-to-state map is enforced by `MODES_BY_STATE`. Disabled mode chips are dimmed and uninteractable.

---

## 7. Old Route Redirects

| Old route               | Redirects to                          |
|-------------------------|---------------------------------------|
| `/drafts`               | `/policy-lifecycle?stage=DRAFT`       |
| `/drafts/:policyId`     | `/policy-lifecycle`                   |
| `/review`               | `/policy-lifecycle?stage=REVIEW`      |
| `/publish`              | `/policy-lifecycle?stage=APPROVED`    |

These redirects ship for one release cycle, then are removed.

The legacy page implementations (`DraftsPage`, `DraftPolicyPage`, `ReviewPage`, `PublishPage`) and `draftStore` were moved to `Bin-(thrash)/` in the prior task and are not referenced.

---

## 8. Schema Target

`migrations/002_policy_lifecycle_schema.sql` defines:

- `policy_lifecycle_states` — controlled vocabulary (5 rows, no `Deprecated`)
- `policy_lifecycle_envelopes` — one row per policyId, FK to states
- `policy_lifecycle_history` — append-only, chained, FK to envelope
- `ix_policy_lifecycle_envelopes_active` — partial index for non-archived lookups
- `trg_policy_lifecycle_envelopes_touch` — auto-updates `updated_at`

The schema mirrors `types.ts` field-for-field. When the persistence layer is wired, the in-memory Zustand envelope is the authoritative shape.

---

## 9. Testing Recipes

```ts
// Approve must reject the author
const env = createEnvelope('CL-OA-006', TJ_PADILLA);
const review = transition(env, { intent: 'submitForReview', actor: TJ_PADILLA });
const r = transition(review.next, { intent: 'approve', actor: TJ_PADILLA });
expect(r.ok).toBe(false);
expect(r.code).toBe('SELF_APPROVAL_FORBIDDEN');

// Rationale guard
const r2 = transition(review.next, {
  intent: 'requestRevision', actor: someReviewer, rationale: 'too short',
});
expect(r2.code).toBe('MISSING_RATIONALE'); // 9 chars but trimmed length passes — pick "x"
```

Snapshot tests should fix `now`, `idGen`, and `hash` to keep chain hashes deterministic.

---

## 10. Extension Points

- **Real eCIgn signatures** — populate `signatureRef` on `apply()` calls. The envelope already carries it through to history.
- **Server bridge** — replace `defaultHash` in `stateMachine.ts` with a SHA-256 wrapper and persist via a `policyLifecycleApi` adapter; the store's `apply` is the only place to wire it.
- **CES integration** — subscribe `selectQueues()` from `lifecycleStore.ts` to the CES event bus to materialize `policy_authoring`, `policy_review`, and `policy_publish` execution units.
- **Audit Mode replay** — read `policy_lifecycle_history` ordered by `(policy_id, timestamp ASC)` and reconstruct the state by reapplying intents through `transition()`.

---

## 11. Anti-patterns

- ❌ Direct `set({ envelopes: … })` outside `apply()` / `registerPolicy()` / `__resetToSeed()`.
- ❌ Adding a `Deprecated` literal anywhere in the codebase. The state vocabulary is closed.
- ❌ Bypassing the `rationale` guard by sending whitespace.
- ❌ Approving as the same `userId` that created the envelope.
- ❌ Mutating `LifecycleHistoryEntry.chainHash` after creation.
