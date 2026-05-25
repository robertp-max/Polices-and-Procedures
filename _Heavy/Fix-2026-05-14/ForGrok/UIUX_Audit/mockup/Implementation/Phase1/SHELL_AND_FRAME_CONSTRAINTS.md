# Shell & Frame Constraint Specification

**Phase 1 deliverable — constraint only.**
**Derived from:** Canonical UI System Spec §4 (Constrained Page View Contract), §5 (Shell Architecture Contract).
**Visual source of truth:** `01_Dashboard_Desktop_v2.jpg`, `03_PolicyDetail_Desktop_v2.jpg`, `04_CESBoard_Desktop_v2.jpg`, `01_Dashboard_Mobile_v2.jpg`.

---

## 1. The 4-Sided Constrained Page View Contract (Non-Negotiable)

> **Rule SF-1.** Every operational page view **MUST** preserve a continuous, visible Layer 0 backdrop band on **all four sides** of its primary glass composition. The Layer 0 band **MUST** be unbroken — no opaque fills, no decorative shapes, no inner cards may bridge the gap to the shell edge.

> **Rule SF-2.** The Layer 0 band is the perceptual mechanism that makes glass legible. Any rule that conflicts with SF-1 is invalid.

### Desktop inset (canonical values, locked)

| Token | Value | Source |
|-------|-------|--------|
| `--shell-inset` | `clamp(16px, 1.6vw, 28px)` | `CommandCenterLayout` (existing) |
| `--shell-radius-desktop` | `1.5rem` (`rounded-3xl`) | Canonical Spec §4 |
| `--shell-radius-mobile` | `0` (full-bleed shell, inset moves inward) | Canonical Spec §4 |

> **Rule SF-3.** The shell inset value **MUST** be sourced from `--shell-inset`. Hard-coded equivalents (`p-4`, `p-6`, arbitrary `pt-[18px]`) on any page root or layout container are **prohibited**.

### Mobile inset (canonical values, locked)

| Token | Value |
|-------|-------|
| `--page-inset-mobile-x` | `16px` (left + right) |
| `--page-inset-mobile-top` | `12px` below safe-area inset |
| `--page-inset-mobile-bottom` | `12px` above bottom tab bar / safe-area inset |

> **Rule SF-4.** On mobile the shell is full-bleed; the 4-sided band is produced *inside* the page by `ConstrainedPageContent`. Content **MUST NOT** kiss the device bezel.

### Multi-card compositions

> **Rule SF-5.** When a page renders multiple Layer 1/Layer 2 cards (e.g. Dashboard KPI row + Task Overview row), the 4-sided band applies to the **outer bounding box of the entire card group**, not to each card individually. Inner gutters between cards are governed by Rule SP-2 (spacing scale), not by SF-1.

### Anti-patterns (prohibited, all severities = blocking)

| ID | Anti-pattern | Why prohibited |
|----|--------------|----------------|
| SF-A1 | `className="h-full w-full"` at page root | Forces full-bleed and overrides the inset. |
| SF-A2 | Negative horizontal margin (`-mx-3`, `-mx-4`, `-mx-6`) on a child of `ShellContentFrame` | Cancels the inset and bleeds the glass to the shell edge. |
| SF-A3 | `bg-white`, `bg-ci-bg`, or any opaque `bg-*` on the page root container | Replaces the Layer 0 backdrop with an opaque fill; destroys glass legibility. |
| SF-A4 | Self-nested `ShellContentFrame` | Two insets compound; spec allows exactly one. |
| SF-A5 | Per-page custom rail or sidebar that replaces the shell's nav zones | Forks the shell; violates §5. |
| SF-A6 | Inline `style={{ padding: 0 }}` or Tailwind `p-0` on the page root | Bypasses the inset contract. |

---

## 2. Primitive Roles: `ShellContentFrame` vs `ConstrainedPageContent`

> **Rule SF-6.** These are two distinct primitives with non-overlapping responsibilities. Pages **MUST** use both in the order: `ShellFrame → ShellContentFrame → ConstrainedPageContent → page body`.

### `ShellFrame` (existing)

- Owns: viewport-level chrome (status bar, top nav, side rail, bottom tab on mobile), Layer 0 backdrop (`TravelightBG` or light gutter).
- Pages **MUST NOT** render `ShellFrame` themselves; it is composed once in the app root.

### `ShellContentFrame` (existing)

- Owns: the `clamp(16px, 1.6vw, 28px)` shell inset on desktop; `rounded-3xl` clipping; ensures Layer 0 is visible on all four sides.
- Emits attribute: `data-shell-frame="1"` (required for runtime assertion).
- Pages **MUST** wrap their content in exactly one `ShellContentFrame` instance.
- `ShellContentFrame` **MUST NOT** be nested inside itself (SF-A4).

### `ConstrainedPageContent` (new in Phase 1)

- Owns: the *internal* 4-sided rhythm of the page content within `ShellContentFrame`. Specifically:
  - Applies `--page-inset-*` tokens on mobile so the inset is preserved when `ShellContentFrame` collapses to full-bleed.
  - Provides the top-section breathing room above the first Layer 1/2 surface (per mocks: ≈24–32 px desktop, ≈16 px mobile).
  - Enforces the maximum content width (see Rule SF-7).
- Emits attribute: `data-page-content="1"`.

> **Rule SF-7.** Maximum content width (desktop) is `min(100%, 1440px)`, centered. Wider canvases are reserved for explicit Wide Mode (see §4 below). No page may set its own `max-w-*` value larger than this.

### Composition contract (must, verbatim)

```
ShellFrame
└─ ShellContentFrame              [data-shell-frame="1"]   (exactly one)
   └─ ConstrainedPageContent       [data-page-content="1"]  (exactly one)
      └─ <page body>                                       (no shell-frame violations)
```

Pages that need to opt out (see §4) **MUST** declare it explicitly via `<ConstrainedPageContent mode="wide" />` or `mode="full-canvas"` — not by bypassing the primitive.

---

## 3. Responsive Inset Behavior

> **Rule SF-8.** Breakpoint-driven inset behavior is defined here once. Pages **MUST NOT** redefine it locally.

| Breakpoint | Width | Shell inset | Page-internal inset | Notes |
|------------|-------|-------------|---------------------|-------|
| Mobile     | < 768 px | `0` (shell full-bleed) | `16px` x, `12px` top/bottom inside `ConstrainedPageContent` | Per `01_Dashboard_Mobile_v2.jpg`. |
| Tablet     | 768–1023 px | `clamp(16px, 1.6vw, 24px)` | `16px` x inside | Shell remains `rounded-3xl`. |
| Laptop     | 1024–1439 px | `clamp(20px, 1.6vw, 26px)` | `20px` x inside | Per `01_Dashboard_Desktop_v2.jpg`. |
| Desktop    | ≥ 1440 px | `28px` | `24px` x inside | Content width capped at 1440 (SF-7). |

> **Rule SF-9.** A page **MUST** look like its v2 mock at the breakpoint of that mock. Discrepancies are visual regressions, not "responsive variations."

---

## 4. Sanctioned Exception Modes (Closed List)

Only the modes below may break SF-1. Any other claim of exception is rejected.

| Mode | Triggered by | Allowed deviation | Required compensations |
|------|--------------|-------------------|-----------------------|
| `wide` | `<ConstrainedPageContent mode="wide" />` | Content width may exceed 1440 px up to viewport. | 4-sided band **still required**. Logged in [`EXCEPTION_REGISTRY.md`](../Phase0/EXCEPTION_REGISTRY.md). |
| `full-canvas` | `<ConstrainedPageContent mode="full-canvas" />` | Suspends the 4-sided band for the duration of the route. | Allowed **only** for: dedicated print-preview, large signature canvas (eCign signing pad), full-screen media viewer. Route is presented as a visibly different mode (e.g. solid header bar) so users do not mistake it for normal operation. |
| `presentation` | Reserved for future demo/marketing surfaces. | Per separate spec. | Out of scope for Phase 1. |

> **Rule SF-10.** Adding a new exception mode requires a Canonical Spec amendment, not a per-page override. Until amended, the closed list above is exhaustive.

---

## 5. Verification Checklist (Design Review)

A page passes the Shell & Frame review if all of the following are true:

- [ ] Layer 0 backdrop is visible as a continuous band on top, right, bottom, and left at every breakpoint (sample: 1440, 1280, 1024, 768, 390).
- [ ] DOM contains exactly one `[data-shell-frame="1"]` and exactly one `[data-page-content="1"]` for the route.
- [ ] No `h-full w-full`, `-mx-*`, opaque `bg-*`, or self-nested shell frames on any container under the page root.
- [ ] No per-page custom rail or sidebar that competes with the shell.
- [ ] Inset values match `--shell-inset` and `--page-inset-*` tokens; no hard-coded equivalents.
- [ ] If `wide` or `full-canvas` mode is used, it is declared on `ConstrainedPageContent` and logged in the Exception Registry.
- [ ] Visual diff against the named v2 mock is ≤ the tolerance in [`ENFORCEMENT_DESIGN_REVIEW.md`](ENFORCEMENT_DESIGN_REVIEW.md).

---

## 6. Out of Scope for Phase 1

The following are noted for future phases and **must not** be touched by this constraint work:

- Dashboard zone composition (KPI row, Task Overview placement). `[OUT-OF-SCOPE-P1 → Phase 2]`
- Evidence table → grid/card migration. `[OUT-OF-SCOPE-P1 → Phase 2]`
- CES Board column count and Kanban semantics. `[OUT-OF-SCOPE-P1 → Phase 2/3, per CES decision]`
- Onboarding V2 rail removal (visual treatment governed here; structural rebuild is Phase 2). `[OUT-OF-SCOPE-P1 → Phase 2]`
