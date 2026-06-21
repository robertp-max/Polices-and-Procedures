# V6 Interaction & Motion Spec

> **Authority & scope.** This document is the single source of truth for *motion language*, *per-surface transition behavior*, *reduced-motion alternatives*, the *meaningful-React feature map*, and *keyboard / command-palette behavior* for V6. It is downstream of and conformed to the canonical contracts in the V6 synthesis (route table, typography LOCK, token home, 14-family component catalog, acceptance gates). Where any other V6 doc disagrees on a timing value, easing curve, overlay dimension, or reduced-motion rule, **this document and `src/index.css` win.**
>
> **Token home.** Every duration and easing named here is a CSS custom property declared once in `src/index.css` and surfaced through `tailwind.config.js` `theme.extend`. Screen and component code references the **token**, never a raw `ms` value, never an ad-hoc `duration-[420ms]`, never an inline `cubic-bezier(...)`. The gate fails any new timing literal or new bezier in component source.
>
> **Typography LOCK reminder (governs all text in motion too).** Roboto only, weights **300** and **500**. Weight 500 permitted *only* on page titles / h1–h2 headers, sidebar/nav labels, and status/ToneBadge text. Everything else is 300. No Inter/Montserrat, no 600/700/800/900. Motion never compensates for missing weight — hierarchy comes from size/color/opacity/spacing, and so does any "emphasis" you might be tempted to animate.

---

## 1. Motion principles

Motion in V6 serves an audit/compliance audience. It exists to **explain change**, not to decorate. Seven principles govern every transition below.

1. **Motion is a courtesy, never a payload.** No information is ever conveyed *only* by movement. If an animation fails to run (reduced-motion, slow device, JS error), the user must still see the same end state with the same meaning. Status is text + glyph + tone, never a flash or a slide.

2. **Fast ceiling.** No enter or exit animation exceeds **300ms**. The prototype's 600ms `fade-in-up` and 0.7s drawer are retired. Long, luxurious motion reads as lag on dense data screens and actively obstructs reviewers scanning evidence.

3. **Enter is gentle, exit is quick.** Things arriving use `--ease-standard` (decelerate-in). Things leaving use `--ease-exit` (accelerate-out) and a shorter duration, so dismissals feel responsive and never make the user wait to move on.

4. **One timing registry, no second source.** Durations and easings come from the token set in §2. Overlay open/close, toast lifetime, hover-card delay, and route content all draw from the *same* registry. There is no "toast is 3000ms here but 3500ms there."

5. **Animate presence, not just CSS.** Conditionally-mounted overlays (modal, drawer, popover, palette, toast) use a **presence wrapper** that animates the exit *before* unmount. Components are never yanked from the DOM mid-fade.

6. **Movement is reserved and earned.** Hover-lift (`translateY(-2px)`) belongs to *elevatable cards only* — never the active nav item, never full-width panels, never table rows. There is exactly one press-scale token (`~0.98`). Pulsing/looping animation is restricted to a single skeleton-loading shimmer and is killed entirely under reduced-motion.

7. **Reduced-motion is a first-class path, not a fallback hack.** A global `@media (prefers-reduced-motion: reduce)` block collapses every duration to ~0.01ms and sets `animation: none` on all looping animations. This is verified by a Stage-C axe gate; "we'll add it later" is not permitted.

---

## 2. The canonical scales

These tokens live in `src/index.css`. Nothing below this section re-derives them.

### 2.1 Duration scale

| Token | Value | Assigned to |
|---|---|---|
| `--motion-fast` | **120ms** | hover, press/active, tab switch, row hover, popover/palette enter, focus-ring appearance, chip toggle, icon state |
| `--motion-base` | **200ms** | cards, popovers, toasts, route-content swap, modal fade+scale, backdrop fade, overlay *exit* (all exits cap at base) |
| `--motion-slow` | **280ms** | drawers (slide in), sidebar collapse/expand width, mobile bottom-sheet |

**Hard rules.** `--motion-slow` (280ms) is the longest legal animation; nothing reaches 300ms. There is no `--motion-slower`. Exits never use `--motion-slow` — a drawer slides *in* at 280ms but *out* at 200ms.

### 2.2 Easing scale

| Token | Curve | Use |
|---|---|---|
| `--ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | all **enter** and **move** (decelerate into rest) |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | all **leave** (accelerate away) |

Only two curves exist. No `ease-in-out`, no `linear` (except the reduced-motion collapse), no per-component beziers. The skeleton shimmer is the single exception and uses a contained keyframe, not a transition curve.

### 2.3 `src/index.css` declaration (canonical)

```css
:root {
  --motion-fast: 120ms;
  --motion-base: 200ms;
  --motion-slow: 280ms;
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-exit:     cubic-bezier(0.4, 0, 1, 1);

  /* derived, registry-owned constants (no magic numbers in components) */
  --motion-hover-lift: -2px;     /* elevatable cards only */
  --motion-press-scale: 0.98;    /* single press token */
  --motion-popover-rise: 4px;    /* popover/palette translateY on enter */
  --motion-modal-scale-from: 0.98;
  --toast-lifetime: 3000ms;      /* single unified value */
  --hovercard-open-delay: 0ms;
  --hovercard-close-delay: 180ms; /* intent buffer; replaces prototype 1000ms */
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .v6-skeleton { animation: none !important; }   /* kill the shimmer */
  .v6-pulse    { animation: none !important; }   /* kill any infinite pulse */
}
```

`tailwind.config.js` mirrors these so utility classes resolve to the same tokens:

```js
theme: {
  extend: {
    transitionDuration: { fast: 'var(--motion-fast)', base: 'var(--motion-base)', slow: 'var(--motion-slow)' },
    transitionTimingFunction: { standard: 'var(--ease-standard)', exit: 'var(--ease-exit)' },
  }
}
```

---

## 3. Per-surface transitions

Each surface specifies: **enter**, **exit**, **easing**, **what moves**, and the **reduced-motion alternative**. Durations are tokens, not literals.

### 3.1 Route / page content

- **Enter:** opacity `0 → 1` over `--motion-base` (200ms), `--ease-standard`. **No translate** on route swap — the prototype's `fade-in-up` translate is retired (it competes with content the reviewer is trying to read and triggers layout shift).
- **Exit:** previous content is not cross-faded; React Router swaps and the new content fades in. Sidebar and Topbar are *outside* the routed `<Outlet>` and never animate on navigation.
- **What moves:** opacity only.
- **Reduced-motion:** content appears instantly at full opacity. No flash, no jump.
- **Note:** the View Transitions API is **rejected** for V6 (cosmetic; conflicts with reduced-motion for an audit audience).

### 3.2 Sidebar (collapse / expand)

- **Transition:** width animates `292px ⇄ 88px` over `--motion-slow` (280ms), `--ease-standard`.
- **What moves:** the sidebar `width` and the content region's left offset, in lockstep (same token, same curve) so there is no tearing. Nav-label text fades (`--motion-fast`) and is `aria-hidden` + `display:none` at the end of collapse so it is not a tab stop or screen-reader target in the rail state.
- **Active nav item never lifts or scales** (principle 6). Its only motion is the focus-visible ring on focus.
- **Reduced-motion:** width snaps to the target; labels appear/disappear instantly.

### 3.3 Drawer (VeilDrawer — right desktop / bottom-sheet mobile)

- **Enter:** backdrop opacity `0 → 1` over `--motion-base` (200ms); panel slides from edge (`translateX(100%) → 0` desktop, `translateY(100%) → 0` mobile bottom-sheet) over `--motion-slow` (280ms), `--ease-standard`.
- **Exit:** panel slides back over `--motion-base` (200ms), `--ease-exit`; backdrop fades over `--motion-base`. **Exit completes before unmount** via the presence wrapper.
- **What moves:** transform (slide) + backdrop opacity. No scale.
- **A11y (built once on the primitive):** portal to `document.body`, focus trap, return focus to the trigger on close, `role="dialog"` + `aria-modal="true"`, body scroll-lock, close on Escape + backdrop click, background `inert`/`aria-hidden`.
- **Reduced-motion:** panel and backdrop appear/disappear instantly; focus management is unchanged (a11y behavior is never reduced).
- **Note:** PersonalOpsDrawer is this primitive, **not a route** — it is open/close React state, replacing the prototype's `#personal-ops-panel` magic hash.

### 3.4 Modal (VeilModal)

- **Enter:** backdrop opacity `0 → 1` over `--motion-base`; dialog fades `0 → 1` and scales `--motion-modal-scale-from (0.98) → 1` over `--motion-base` (200ms), `--ease-standard`.
- **Exit:** reverse, over `--motion-base`, `--ease-exit`; presence wrapper animates exit before unmount.
- **What moves:** opacity + subtle scale. No vertical travel.
- **A11y:** identical overlay contract as §3.3 (portal, focus-trap, return-focus, `role="dialog"`, `aria-modal`, scroll-lock, Escape, backdrop, background inert).
- **Reduced-motion:** instant show/hide; focus-trap and Escape unchanged.

### 3.5 Popover / Command Palette (Popover, CommandPalette)

- **Enter:** opacity `0 → 1` + `translateY(--motion-popover-rise: 4px) → 0` over `--motion-fast` (120ms), `--ease-standard`.
- **Exit:** reverse over `--motion-fast`, `--ease-exit`.
- **What moves:** opacity + 4px rise only. Popovers are quick because they are frequent and lightweight.
- **A11y:** CommandPalette and any blocking popover use the same overlay primitive contract (focus-trap, Escape, return-focus). Non-blocking popovers (e.g. a hover/info card) still trap nothing but **must open on focus as well as hover** and be dismissible by Escape.
- **Reduced-motion:** appears/disappears instantly at final position.

### 3.6 Tabs

- **Transition:** the active-tab indicator (underline/pill) moves to the selected tab over `--motion-fast` (120ms), `--ease-standard`. Panel content swaps with an opacity fade over `--motion-fast`.
- **What moves:** the indicator's position/width + panel opacity. Tab labels do not scale.
- **A11y:** roving tabindex, `role="tablist"/"tab"/"tabpanel"`, arrow-key navigation; the indicator move is purely cosmetic.
- **Reduced-motion:** indicator jumps to the active tab; content swaps instantly.

### 3.7 Table row (DataTable)

- **Hover:** background-color tint over `--motion-fast` (120ms). **No translate, no scale, no shadow** on rows.
- **Selection:** selected-state background + a leading accent applied instantly on click (selection is state, not motion).
- **Expand/collapse (where a row reveals detail):** height/opacity reveal over `--motion-base`, `--ease-standard`; collapse over `--motion-base`, `--ease-exit`.
- **What moves:** background only on hover; height on expand.
- **Reduced-motion:** hover tint applies instantly; expand/collapse toggles with no height animation.
- **Note:** DataTable is a semantic `<table>` (or explicit ARIA grid for editable variants), never a bare div-grid. Status stays text + glyph regardless of any motion.

### 3.8 Card (SurfaceCard / elevatable cards)

- **Hover (elevatable only):** `translateY(--motion-hover-lift: -2px)` + shadow `rest → hover` token over `--motion-fast` (120ms), `--ease-standard`.
- **Press:** `scale(--motion-press-scale: 0.98)` over `--motion-fast`, then release.
- **What moves:** 2px lift + the two-token shadow swap. Only cards explicitly marked elevatable (clickable nav cards, KPI tiles that link) lift; static surface cards and full-width panels do **not**.
- **Reduced-motion:** no lift, no scale; the hover shadow may still swap instantly to signal interactivity (a shadow change is not "motion").

### 3.9 Metric tile (MetricTile)

- **Enter:** participates in the route opacity fade only (§3.1). **No animated counters** — count-up animation is rejected (it trivializes numbers users must read precisely and has negative a11y value). Numbers render at their final value immediately.
- **Hover (if the tile links):** treated as an elevatable card (§3.8).
- **Reduced-motion:** identical (there was no count-up to remove).

### 3.10 Loading / skeleton

- **Skeleton shimmer:** a single contained keyframe (`v6-skeleton`) — a low-contrast gradient sweep — at a calm rate. This is the *only* sanctioned looping animation.
- **Suspense boundaries:** route-level `lazy + Suspense` shows the skeleton for the template's shape (table skeleton rows, board lane placeholders, tile placeholders) — specified once per template, not per page.
- **Reduced-motion:** shimmer is disabled (`animation: none` via the global block); the skeleton renders as a **static** muted placeholder. The placeholder still communicates "loading" by its shape and a static `aria-busy`/visually-hidden "Loading…" label.

### 3.11 Toast / notification

- **Enter:** slide-in + fade over `--motion-base` (200ms), `--ease-standard`.
- **Lifetime:** `--toast-lifetime` (**3000ms**, single unified value — never 3000-vs-3500).
- **Exit:** fade + slide-out over `--motion-base`, `--ease-exit`, via presence wrapper.
- **A11y:** `role="status"` (polite) for routine, `role="alert"` (assertive) for errors; toasts are not the *only* channel for compliance-critical outcomes (those also persist on the surface).
- **Reduced-motion:** appears/disappears instantly; lifetime timer and live-region announcement unchanged.

### 3.12 Progress (ProgressMeter / ChecklistTable / lifecycle, eCIgn steps)

- **Determinate bar:** width animates to the new percentage over `--motion-base` (200ms), `--ease-standard`. Width changes only on real state change, never as decoration.
- **Step completion (eCIgn 6-step, onboarding gate tiles, lifecycle DRAFT→…→ARCHIVED):** the completed step's state (icon + tone + label) updates over `--motion-fast`; **no celebratory animation** on a compliance signing flow.
- **Indeterminate:** uses the same skeleton-class loop; subject to reduced-motion kill.
- **Reduced-motion:** bar jumps to the new percentage; step states update instantly. The numeric/text percentage is always present so the bar is never the only signal.

---

## 4. Reduced-motion: consolidated contract

`prefers-reduced-motion: reduce` is honored **globally** (the `src/index.css` block in §2.3), not per-component. Summary of what changes vs. what is invariant:

**Collapsed to instant (no animation):** route fade, sidebar width, drawer slide, modal fade+scale, popover/palette rise, tab indicator + panel swap, row hover/expand, card lift/press, toast slide, progress bar width, step transitions.

**Disabled entirely:** skeleton shimmer and any pulse/loop (`animation: none`).

**Never reduced (a11y is invariant):** focus-trap, return-focus, Escape-to-close, backdrop-click-to-close, scroll-lock, `aria-modal`/`role=dialog`, live-region announcements, `aria-busy` on loaders, roving tabindex. Reducing *motion* must never reduce *operability*.

**Verification:** reduced-motion is a **Stage-C axe/Playwright gate**. The suite runs once with reduced-motion emulation and asserts no element retains a non-trivial `transition-duration`/`animation` and that the shimmer is off. Missing the global block fails the gate.

---

## 5. Meaningful-React feature map

Each accepted feature lists **location**, **benefit**, **complexity**, **a11y obligation**, **perf impact**, and **phase**. Rejected/deferred items follow with rationale. Phases reference the 18-phase plan (V6-0…V6-3 etc.).

### 5.1 Accepted

| Feature | Location | Benefit | Complexity | A11y obligation | Perf | Phase |
|---|---|---|---|---|---|---|
| **react-router 7 data routes** (replace hash routing; delete duplicate `hashchange` listeners; convert `redesign-calendar-swimlane` CustomEvent + `#personal-ops-panel` magic hash → React state/context) | Router skeleton, all 56 views | Real URLs, nested layouts, loaders, deep-linkable; removes fragile dual hash listeners | Medium | Route changes announced; focus moves to new page heading on nav; one `<h1>` per route | + (lazy splits shrink initial bundle) | V6-1 |
| **Route-level `lazy` + `Suspense`** per top-level area | Per area in router config | Smaller first paint; isolates load cost | Low | Suspense fallback uses skeleton with `aria-busy`; focus not stolen on resolve | + | V6-1 / V6-2 |
| **`errorElement` per route + root & content-region error boundaries** | Router config; AppShell content region | A crash in content keeps Sidebar/Topbar interactive; offers retry | Low–Med | Error UI focusable, has heading + retry button with accessible name | neutral | V6-1 (skeleton), per-screen V6-2 |
| **`useDeferredValue` / `startTransition`** on the sidebar filter driving `visibleGroups` across all 56 views; and on large DataTable filters | Sidebar; large tables | Keeps typing responsive while big lists re-filter | Low–Med | Filtered result count announced via live region; focus stays in input | + (avoids jank) | V6-1 (sidebar), V6-2 (tables) |
| **List virtualization — scoped** to the 3 documented-large tables only (Policy Library ~269, Evidence ~445, Lifecycle ~279) | Those three tables | Renders thousands of rows smoothly | **Medium (a11y risk)** | Preserve keyboard nav, accessible `<th>` headers, correct row semantics; **never** virtualize small admin tables | + on large, − a11y risk if sloppy | V6-2 |
| **Skeleton / empty / error states** tied to Stage-B async reconnection | Per *template* (~28), inherited by 56 pages | Consistent loading story; no layout shift | Med | `aria-busy`, visually-hidden "Loading…"; empty states have a heading + action | neutral | V6-2 |
| **Focus-trapped overlay primitives** (VeilModal / VeilDrawer / CommandPalette) — portal, return-focus, `aria-modal`, scroll-lock, Escape, backdrop | Built once in catalog | Correct, reusable dialog behavior everywhere | Medium | This *is* the a11y contract (§3.3–3.5) | neutral | V6-0 |
| **Cmd/Ctrl-K Command Palette** over the VIEW registry (all 56 hash-ids) | Global, mounted in AppShell | Fast keyboard navigation to any screen | Medium | Full keyboard model (§6); `role` per ARIA combobox/listbox pattern; respects overlay contract | + (no extra nav chrome) | V6-3 |
| **URL-backed UI state** via `useSearchParams` / route params (calendar view-mode, board filter chips, list filters) | Calendar, boards, lists | Shareable/restorable views; wires currently-inert Day/Week/Month + tabs | Low | Toggle controls keep `aria-pressed`/`aria-selected` in sync with URL | neutral | V6-2 |
| **Nested routes + shared layouts (`Outlet`)** for list→detail pairs and the forms viewer/esign pair; route-aware breadcrumbs | List/detail areas; `/forms/:formId` ↔ `/forms/:formId/esign` | DRY layouts; breadcrumbs derive from matched hierarchy | Low | Breadcrumb is a labeled `nav` with `aria-current="page"` | neutral | V6-1 / V6-2 |

### 5.2 Rejected / deferred

| Feature | Decision | Rationale |
|---|---|---|
| **React Query / TanStack Query** | **Deferred** | Premature; react-router loaders may suffice. Revisit after Stage-B reveals the real fetch shape. |
| **Broad optimistic UI** (signing, gate-advance, task-moves) | **Deferred / restricted** | Correctness hazard for a compliance / hash-chain / dual-signature product. Allowed *only* on low-stakes interactions; **never** on signing, evidence, or audit. |
| **View Transitions API** | **Rejected** | Cosmetic cross-route animation; conflicts with reduced-motion for an audit audience. |
| **Animated counters on KPIs** | **Rejected** | Trivializes numbers users must read precisely; negative a11y value. |

---

## 6. Keyboard & command-palette behavior

### 6.1 Global keyboard model

| Key | Action | Notes |
|---|---|---|
| `Cmd/Ctrl + K` | Open Command Palette | Toggles closed if already open; same handler everywhere via AppShell |
| `Escape` | Close topmost overlay (palette → popover → modal → drawer) | Closes exactly one layer (the topmost), returns focus to its trigger |
| `Tab` / `Shift+Tab` | Move focus | Within an open modal/drawer/palette, focus is **trapped**; otherwise normal document order |
| `/` (slash) | Focus the active surface's primary filter/search input | Only when no input is focused and no overlay is open |
| `?` | Open keyboard-shortcuts help (a modal listing these bindings) | Standard discoverability affordance |

**Focus-visible:** every interactive control shows a visible `focus-visible` ring (the prototype's `outline-none` is removed). Icon-only buttons have accessible names. A skip link ("Skip to content") is the first tab stop and jumps focus to the routed content region.

**Hover-equivalence:** anything that opens on hover (hover/info cards, calendar event cards) also opens on **focus** and is dismissible with Escape. The calendar hover-card close delay is `--hovercard-close-delay` (180ms) with a re-enter intent buffer — replacing the prototype's 1000ms delay.

**Drag-reorder (boards, where present):** dnd-kit keyboard sensor — pick up / move / drop entirely from the keyboard; moves are announced via a live region. Never mouse-only.

### 6.2 Command Palette specifics

- **Source of truth:** the VIEW registry — all 56 views keyed by **stable hash-id** (never by path or template). Each entry shows its display label and group (Overview / CES / Taxonomy / Onboarding / Onboarding v2 / System / Admin / Auth).
- **Filtering:** typed query fuzzy-matches against display label and group. Filtering runs through `useDeferredValue` so typing never stalls.
- **Keyboard within the palette:**

  | Key | Action |
  |---|---|
  | `↑` / `↓` | Move highlight through results (wraps at ends) |
  | `Enter` | Navigate to the highlighted view (router push) and close |
  | `Escape` | Close palette, return focus to the prior element |
  | `Tab` | Trapped within the palette while open |

- **ARIA pattern:** combobox + listbox — input has `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` pointing at the highlighted option; results are a `role="listbox"` of `role="option"` items. Result count is announced via a polite live region.
- **Overlay contract:** the palette is a focus-trapped overlay (§3.5 / §5.1) — portal, return-focus, Escape, backdrop. Enter animation is the popover rise (120ms); reduced-motion shows it instantly.
- **Empty/no-match state:** a non-error "No matching views" message with a heading-level-appropriate label; never a blank box.

---

## 7. Conformance checklist (gate-facing)

- [ ] All durations/easings referenced as `src/index.css` tokens; no `ms` literals, `duration-[n]`, or inline `cubic-bezier` in component source.
- [ ] No enter/exit animation > 300ms anywhere in dist CSS; no `--motion-slow` on an exit.
- [ ] Global `@media (prefers-reduced-motion: reduce)` block present in `src/index.css`; shimmer/pulse set to `animation: none`.
- [ ] Overlay a11y contract (focus-trap, return-focus, `role=dialog`/`aria-modal`, scroll-lock, Escape, backdrop, inert background) verified on VeilModal / VeilDrawer / CommandPalette.
- [ ] Reduced-motion Stage-C axe/Playwright gate green at 360/768/1024/1280/1536.
- [ ] No animated counters; no View Transitions; no broad optimistic UI on signing/evidence/audit.
- [ ] Command Palette enumerates all 56 views by hash-id; full keyboard + ARIA combobox/listbox model present.
- [ ] Hover affordances also open on focus; calendar hover-card close ≤ 200ms with intent buffer.
