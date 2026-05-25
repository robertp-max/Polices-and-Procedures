# Enforcement Design — Mechanical Guardrails for the Canonical Contract

**Status:** DRAFT (Phase 0)
**Owner:** Engineering Lead + Visual Language Police Chair
**Goal:** Replace "porous correctness" with mechanically enforced rules. Every rule below must either block a PR, fail CI, or scream in dev mode.

---

## 1. Static Enforcement (ESLint)

### 1.1 `no-restricted-imports` — Legacy Component Boundary

Block new imports of:

| Module pattern | Replacement | Allow-list (if any) |
|----------------|-------------|---------------------|
| `**/CesCard` | `SurfaceCard` / `GlassPanel` | CES tree only if CES Option B chosen |
| `**/SCard`, `**/GenericSectionPanel` | `SurfaceCard` | — |
| `**/PmTaskCard` | canonical `TaskCard` (to be built) | — |
| `**/StatusBadge` (legacy) | canonical `Badge` | — |
| `iAdministrator/**` | per migration plan | — |

Seeded with current usage as `// eslint-disable-next-line` so existing violations are visible but every *new* addition requires an explicit override.

### 1.2 `no-restricted-syntax` — Raw Values

- Block hex literals (`/#[0-9a-fA-F]{3,8}/`) in `.tsx`/`.ts`/`.css` under `src/policy/**` outside `src/policy/styles/tokens/**`.
- Block arbitrary Tailwind values (`/\[[^\]]+\]/`) in className strings under `src/policy/**` outside an explicit allow-list.

### 1.3 `no-restricted-syntax` — Legacy CSS Classes

Block string literals containing `glass-interactive-lib`, `glass-panel-lib`, `ci-premium-*` outside their original module.

### 1.4 Custom rule — `policy/no-shell-frame-override`

Flag known shell-frame violators in className strings: `h-full w-full` at page root, `-mx-3`, `-mx-4`, `-mx-6`, `bg-white` on top-level surface containers, and self-nested `ShellContentFrame` (AST check).

---

## 2. Runtime Enforcement (Dev-Mode Assertions)

### 2.1 `ShellFrame` boundary assertion

`ShellContentFrame` writes `data-shell-frame="1"` to its root. A dev-mode `MutationObserver` walks first-level descendants and warns if any descendant carries:
- `h-full w-full` *and* has no sibling padding boundary,
- a `bg-*` class that opacifies Layer 0,
- a nested `data-shell-frame="1"` (self-nesting).

Warnings render as a red overlay banner + console.error in `NODE_ENV !== 'production'`.

### 2.2 `GlassComposition` layer assertion

`GlassPanel` writes `data-glass-layer="1|2|3"`. Dev-mode check warns if a Layer-1 panel contains a descendant Layer-1 panel (violates 3-layer model).

### 2.3 Reduced-motion assertion

`TravelightBG` and any animated decorative canvas must respect `prefers-reduced-motion`. Dev mode flips a query param `?force-rm=1` to verify static fallback renders.

---

## 3. Visual Regression

**Tool selection (decision required in Phase 0):** **Playwright + `@playwright/test` snapshots**, stored under `tests/visual/__screenshots__/`.

Rationale: already installed (`playwright.config.ts` present); avoids new SaaS dependency; runs in CI; supports per-surface flag overrides via URL.

- **Baselines:** committed PNGs per surface × (light, dark) × (desktop, mobile).
- **Mock sources of truth:** `Top Picks/` and `v2/` mock files referenced by filename in each test.
- **Flake-triage owner:** Engineering Lead. Flake budget: < 2% per week or visual job is the team's #1 priority.
- **First three baselines (Phase 1):** Dashboard, Policy Detail, Evidence Center.

---

## 4. CI Gates (in order)

1. `eslint --max-warnings 0` on `src/policy/**`.
2. `tsc --noEmit`.
3. `vitest run` (unit + contract).
4. `playwright test tests/visual` (visual regression).
5. `axe` accessibility scan on each canonical reference surface.
6. `legacy-inventory:assert` — fails if any legacy count exceeds the baseline (deletion-only ratchet).

---

## 5. Code Ownership (`CODEOWNERS`)

```
src/policy/ui/**             @vlp-chair @design-lead @eng-lead
src/policy/styles/**         @vlp-chair @design-lead
src/policy/**/ShellFrame*    @vlp-chair @eng-lead
tests/visual/**              @eng-lead @vlp-chair
scripts/legacy-inventory.mjs @eng-lead
```

---

## 6. What is NOT enforced statically (and must rely on VLP review)

- 4-sided breathing-room *visual* result (caught by visual regression, not lint).
- Typography density / micro-text (caught by VLP bi-weekly gallery).
- Mock fidelity beyond pixel diff (caught by VLP sign-off).
