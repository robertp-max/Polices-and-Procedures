# Feature Flag + Rollback Plan

**Status:** DRAFT (Phase 0)
**Owner:** Engineering Lead

## Principle

No surface reconstruction ships without a per-surface flag and a documented rollback procedure. A failed cut-over must be reversible in under 5 minutes without redeploying.

## Flag Mechanism

Lightweight, no SaaS dependency:

```ts
// src/policy/flags/index.ts
export type SurfaceFlag =
  | 'dashboard.v2'
  | 'evidence.v2'
  | 'policy-detail.v2'
  | 'ces.v2'
  | 'onboarding.v2-canonical'
  | 'calendar.v2'
  // ...

export function isOn(flag: SurfaceFlag): boolean { /* ... */ }
```

Sources, in priority order:

1. URL param `?ff=dashboard.v2,evidence.v2` (dev + QA).
2. `localStorage` key `ci.flags` (per-user sticky).
3. Environment variable `VITE_FLAGS` baked at build time (per-environment defaults).
4. Hard-coded default in `src/policy/flags/defaults.ts` (per-environment fallback).

## Rollback Procedure

1. **Immediate (no deploy):** Flip env var `VITE_FLAGS` on the affected environment, re-run the prebuilt assets (no rebuild needed for env-var-driven defaults). Target: < 5 min.
2. **Sticky user override:** Users on `localStorage` override are unaffected; ops broadcasts a "Clear preferences" instruction if needed.
3. **Hard rollback:** Revert the surface's entry point to v1 import (single-line PR), tag as `rollback/<surface>-<date>`, deploy.

## Worked Example (Phase 0 deliverable)

Migrate `src/policy/pages/About.tsx` (or another genuinely low-risk surface) to a flag-gated v2 placeholder. Demonstrate:

- v1 ships by default.
- `?ff=about.v2` shows v2 in dev.
- Env-var flip on staging shows v2.
- Single-line revert restores v1.

This is the *only* code that ships in Phase 0; it proves the mechanism.

## Per-Surface Flag Lifecycle

| State | Meaning |
|-------|---------|
| `default-off` | v2 exists, only opt-in. New surface during rebuild. |
| `default-on-dev` | v2 default in dev/staging, opt-out in prod. |
| `default-on-prod` | v2 live; v1 still in tree behind opt-out. |
| `v1-removed` | v1 deleted from tree. Flag removed. Surface graduates. |

VLP Chair gates each transition.

## Logging

Every flag evaluation in prod emits an anonymized counter (`flag.eval.<name>.<bool>`) so we can detect orphaned flags and stuck rollouts.
