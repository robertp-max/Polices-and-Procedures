# V6 Component & Cohesion Spec

> **Authority & scope.** This document is the authoritative component contract layer for V6. It is downstream of and must conform to the canonical contracts in the V6 synthesis (route table, typography LOCK, single token home `src/index.css`, the 14-family catalog in `V6_DESIGN_VISUALIZATION.md` sec 5, the motion registry, and the a11y/responsive gates). Where any other V6 doc disagrees with the canonical contracts, the canonical contracts win and that doc is to be conformed, not this one.
>
> **Repo.** All V6 artifacts live in `C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2`. The live prototype reference is `C:/AI/Git/training/HomeHealth/Policies_and_Procedures/src/policy/pages/Redesign/index.html` (read-only reference; its 236 bold usages, CDN loads, substring status regex, and div-grid table are **prototype defects**, not targets).
>
> **Typography LOCK (non-negotiable).** Roboto only, self-hosted at weights **300 and 500 only** (no 400, no 700, no Google Fonts CDN). Weight 500 (`font-medium`) is permitted ONLY on: page titles / `h1`–`h2`, sidebar/nav labels, and status/ToneBadge text. Everything else — body, tables, KPI numbers, card titles, subheadings, chips — is 300 (`font-light`). BANNED: `font-semibold` / `font-bold` / `font-extrabold` / `font-black`, and `font-weight` 600/700/800/900. Build hierarchy via **size / color / opacity / spacing / casing**, never weight. eCIgn brand navy `#1A3778` / orange `#F04B22` is an authorized **tokenized** palette exception only — it does **not** relax the weight rule.
>
> **Token discipline.** One token home: `src/index.css` CSS custom properties; `tailwind.config` `theme.extend` references them. No raw hex (`bg-[#..]`, `text-[#..]`), no stock-Tailwind palette classes (`emerald-`, `amber-`, `slate-`, `violet-`, `blue-`, `red-`, `gray-`) for semantic state. Status comes from the typed `STATUS -> TONE -> LABEL` map in `statusTone.ts`, never a substring regex; unknown status falls back to slate + dev warning.
>
> **Motion discipline.** All transitions reference the canonical motion tokens (`--motion-fast 120ms` / `--motion-base 200ms` / `--motion-slow 280ms`; `--ease-standard` / `--ease-exit`). No raw ms, no ad-hoc `duration-[n]`, no new cubic-beziers in screen code. Global `@media (prefers-reduced-motion: reduce)` collapses durations to ~0.01ms and sets `animation: none` on the pulse.

---

## Table of Contents

1. [How to read this spec](#1-how-to-read-this-spec)
2. [Two-tier component model](#2-two-tier-component-model)
3. [Component contract template](#3-component-contract-template)
4. [Catalog — Shell & Navigation](#4-catalog--shell--navigation)
5. [Catalog — Leaf Primitives](#5-catalog--leaf-primitives)
6. [Catalog — Surfaces](#6-catalog--surfaces)
7. [Catalog — Data & Operational](#7-catalog--data--operational)
8. [Catalog — Overlays](#8-catalog--overlays)
9. [Template-level state matrix (~28 specs cover 56 pages)](#9-template-level-state-matrix)
10. [Pageview coverage matrix (56 rows)](#10-pageview-coverage-matrix)
11. [Cohesion rules (enforced)](#11-cohesion-rules-enforced)
12. [Shared-vs-page-specific decision rule](#12-shared-vs-page-specific-decision-rule)

---

## 1. How to read this spec

- **A pageview is "covered"** only when its *template's* six state categories are specified (interaction / empty / loading / error / responsive / permission). States are specified **once per template (~28)**, not once per page (56). Pages inherit.
- **Identify every screen by its stable hash-id** (the canonical key in the route table), never by path or template. Templates `matrix` / `evidence` / `reports` / `detail` / `board` / `calendar` / `docs` are intentionally reused across 3–7 routes.
- **`INFERRED_FROM_V6_SYSTEM`** marks screens with no reference PNG. They are built by inheriting catalog components and a named sibling's config; they ship in the phase noted.
- **No screen may define a catalog primitive.** Screens compose shared components + a small, declared set of page-specific widgets.

---

## 2. Two-tier component model

**Tier 1 — Leaf primitives** (atomic, stateful once): `Button`, `Input`, `Select`, `Badge`, plus form-field wrappers (`FormField`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`). Each ships the full state set (empty/loading/error/disabled/focus) exactly once; everything else inherits.

**Tier 2 — 14 composite families** (the single shared catalog, ratified from `V6_DESIGN_VISUALIZATION.md` sec 5):

| # | Family | Group |
|---|--------|-------|
| 1 | `AppShell` | Shell & Nav |
| 2 | `Sidebar` | Shell & Nav |
| 3 | `Topbar` / `PageHeader` | Shell & Nav |
| 4 | `MetricTile` | Surfaces |
| 5 | `SurfaceCard` | Surfaces |
| 6 | `ToneBadge` | Surfaces |
| 7 | `DataTable` | Data & Operational |
| 8 | `BoardLane` | Data & Operational |
| 9 | `VeilModal` | Overlays |
| 10 | `VeilDrawer` | Overlays |
| 11 | `CommandPalette` | Overlays |
| 12 | `ChatThread` | Data & Operational |
| 13 | `ProgressMeter` | Surfaces |
| 14 | `ChecklistTable` | Data & Operational |

All 14 families **plus** the leaf primitives are built and Opus-signed-off in **V6-0**, before any screen fan-out. `BoardLane` must be parameterized by a column-config and proven on all four board variants (6/4/3/4-col) in V6-0.

**Banned legacy identifiers** (never reuse as component names): `CommandCenterLayout`, `PolicyViewer32`, `PolicyDetailPage`, `LibraryPage`, `FormViewer`, `FormPrintView`, `PrintPage`, `GVGBPrintDocument`, `GVGBAppendixPrint`, `TravelightBG`, `DotGrid`, `GlobalDotBackground`, `v3Tokens`, `SharedPolicyDetailView`, `PolicyLibraryDocumentView`. V6-native names (`FormViewerV6`, `LibraryPageV6`) are legal once the gate adds word boundaries.

---

## 3. Component contract template

Every catalog entry below is specified against this fixed shape:

- **Purpose** — what it is for; the one job it owns.
- **Visual contract** — tokens it must consume (surface/border/shadow/radius/text/tone); typography weights allowed.
- **Variants** — named, closed set.
- **Props (load-bearing)** — the props that change contract, not an exhaustive TS interface.
- **Interaction states** — hover / focus-visible / active/press / selected.
- **Keyboard** — keys the component must handle.
- **Focus** — focus order, trap, return-focus where applicable.
- **Loading / Disabled** — skeleton and inert presentations.
- **Responsive** — behavior across 360 / 768 / 1024 / 1280 / 1536.
- **Motion** — which motion tokens it uses, for what transition.
- **Shared vs page** — confirmation it is shared, plus what a page is allowed to pass in.

---

## 4. Catalog — Shell & Navigation

### 4.1 `AppShell`
- **Purpose** — the single application chrome: fixed `Sidebar` + `Topbar` + a routed content `<Outlet>` content region. Every real route renders inside exactly one `AppShell`. Auth (`/login`) renders **outside** the shell.
- **Visual contract** — page background surface token; content region max-width + gutter from spacing tokens; no raw hex; no shadow on the shell frame itself (shadows belong to cards/overlays).
- **Variants** — `default`, `audit-density` (compact gutters for evidence/audit screens). No third variant.
- **Props** — `children`/`Outlet`, `density`. The shell owns no route literals.
- **Interaction states** — none on the frame; delegates to Sidebar/Topbar.
- **Keyboard** — hosts the skip-link (`Skip to content`) as the first focusable element; `Cmd/Ctrl-K` opens `CommandPalette` from anywhere inside the shell.
- **Focus** — skip-link target is the content region; route change moves focus to the content region's `h1`.
- **Loading** — route-level `Suspense` fallback renders inside the content region only; Sidebar/Topbar stay interactive.
- **Disabled** — n/a.
- **Responsive** — 1280+/1536: sidebar **292px** expanded. 1024: sidebar **88px** collapsed (icon rail). 768/360: sidebar becomes a `VeilDrawer` (off-canvas), Topbar shows a menu trigger. Content gutters tighten at each tier; body never horizontally scrolls.
- **Motion** — sidebar width transition `--motion-slow` + `--ease-standard`. Route-content swap fade `--motion-base` (honor reduced-motion).
- **Shared vs page** — SHARED. Pages provide only the routed content; they never re-create chrome.

### 4.2 `Sidebar`
- **Purpose** — primary nav: grouped route links (Overview / CES / Taxonomy / Onboarding / Onboarding v2 / System / Admin / Auth-excluded), CareIndeed logo (full + collapsed), and the global filter input that drives `visibleGroups` across all views.
- **Visual contract** — hairline border (`--border-hairline`, `#004142/10`); active item uses tone/teal token background, not raw hex; **nav labels are weight 500** (one of the three permitted 500 contexts); group headers and counts are 300.
- **Variants** — `expanded` (292px), `collapsed` (88px icon rail), `drawer` (mobile off-canvas inside `VeilDrawer`).
- **Props** — `groups` (config), `activeHashId`, `filterValue`, `onFilterChange`, `collapsed`. **Composer owns all route literals**; grok renders nav as placeholders in Stage A and must not author path strings.
- **Interaction states** — hover (subtle surface), focus-visible (ring token), active/selected (teal token + accessible current marker via `aria-current="page"`, not color alone).
- **Keyboard** — `Tab`/`Shift-Tab` through links; `Enter`/`Space` activate; filter input is a standard textbox; `Esc` closes the drawer variant.
- **Focus** — drawer variant traps focus and returns it to the menu trigger on close.
- **Loading** — nav is static config, never skeletoned; filter results update with `useDeferredValue`.
- **Disabled** — items with no permission render hidden (not disabled) per permission state.
- **Responsive** — 1280+: expanded. 1024: collapsed rail with tooltips on hover/focus. ≤768: drawer.
- **Motion** — width/transform `--motion-slow`; hover `--motion-fast`. No hover-lift on the active item.
- **Shared vs page** — SHARED. Pages pass only `activeHashId`.

### 4.3 `Topbar` / `PageHeader`
- **Purpose** — `Topbar` is the persistent top strip (breadcrumb, search/command trigger, personal-ops drawer trigger, user). `PageHeader` is the per-screen header rendered at the top of the content region and **emits the single `h1`**.
- **Visual contract** — hairline bottom border; title `h1` at weight **500**; subheading/description weight 300; action buttons follow the canonical button hierarchy.
- **Variants** — `PageHeader`: `default`, `with-tabs`, `with-actions`, `with-context-toggle`. `Topbar`: `default`, `with-overflow` (mobile action overflow menu).
- **Props** — `title` (required), `headingLevel` (required; defaults to 1; **no hardcoded `h3`**), `breadcrumb` (route-derived), `actions`, `tabs`.
- **Interaction states** — action buttons inherit `Button` states; tab toggles show selected via `aria-selected` + token, URL-backed via `useSearchParams`.
- **Keyboard** — tabs are a roving-tabindex tablist (`Arrow` keys move, `Enter`/`Space` select); command trigger responds to `Cmd/Ctrl-K`.
- **Focus** — on route change focus lands on the `PageHeader` `h1`.
- **Loading** — title may skeleton; breadcrumb hidden until route resolves.
- **Disabled** — actions disable individually.
- **Responsive** — ≤768 Topbar collapses secondary actions into an overflow menu; breadcrumb truncates to last two crumbs.
- **Motion** — tab indicator slide `--motion-fast`; overflow menu fade `--motion-base`.
- **Shared vs page** — SHARED. Exactly one `PageHeader` per route; it is the only `h1` source.

---

## 5. Catalog — Leaf Primitives

### 5.1 `Button`
- **Purpose** — all clickable actions. Canonical hierarchy: **primary** = teal solid; **secondary** = teal outline; **tertiary** = ghost; **orange is reserved for attention/urgency, never a generic primary**. Destructive uses a ratified destructive token OR a confirm-modal, never bare orange.
- **Visual contract** — teal/orange/ghost from tone tokens; radius from the 8/12/16/24/32 ramp; rest/hover shadow tokens only; label weight 300 (buttons are not a 500 context).
- **Variants** — `primary` | `secondary` | `tertiary` | `destructive` | `icon-only`.
- **Props** — `variant`, `size`, `loading`, `disabled`, `iconLeft`/`iconRight`, `aria-label` (required for `icon-only`).
- **Interaction states** — hover, focus-visible (ring token, never `outline-none`), active/press (one press-scale token ~0.98), selected (for toggle buttons).
- **Keyboard** — `Enter`/`Space` activate; native `<button>`.
- **Focus** — visible focus-visible ring always.
- **Loading** — spinner replaces leading icon, label stays, button becomes `aria-busy` and non-interactive.
- **Disabled** — reduced-opacity token + `disabled` attr + `aria-disabled`.
- **Responsive** — `min-h-44` touch floor on all tiers.
- **Motion** — hover/press `--motion-fast`.
- **Shared vs page** — SHARED.

### 5.2 `Input` / `Textarea`
- **Purpose** — single- and multi-line text entry, wrapped by `FormField` for label/help/error.
- **Visual contract** — card border token, focus ring token, text weight 300; placeholder lower-opacity text token.
- **Variants** — `text` | `search` | `password` | `textarea`.
- **Props** — `value`, `onChange`, `invalid`, `disabled`, `describedById`.
- **Interaction states** — hover (border darken), focus-visible (ring), invalid (error border + `aria-invalid`), dirty.
- **Keyboard** — native; search variant clears on `Esc`.
- **Focus** — programmatically focusable; first invalid field is focused on submit.
- **Loading** — read-only skeleton bar.
- **Disabled** — token opacity + `disabled`.
- **Responsive** — full-width within field column; stacks at ≤768.
- **Motion** — focus ring `--motion-fast`.
- **Shared vs page** — SHARED.

### 5.3 `Select`
- **Purpose** — single/multi choice from a closed list.
- **Visual contract** — matches `Input`; chevron from Lucide; menu uses `SurfaceCard` elevation.
- **Variants** — `single` | `multi` | `combobox` (filterable).
- **Props** — `options`, `value`, `onChange`, `searchable`, `invalid`, `disabled`.
- **Interaction states** — hover, focus-visible, open, selected option (check glyph + token).
- **Keyboard** — `Enter`/`Space`/`Down` open; `Arrow` navigate; `Enter` select; `Esc` close; type-ahead.
- **Focus** — listbox focus management; returns focus to trigger on close.
- **Loading** — disabled with spinner in trigger.
- **Disabled** — token opacity.
- **Responsive** — menu becomes bottom-sheet at ≤768.
- **Motion** — menu fade+translateY `--motion-base`.
- **Shared vs page** — SHARED.

### 5.4 `Badge`
- **Purpose** — neutral, non-semantic count/label chip (e.g. nav counts). For *status* semantics use `ToneBadge`.
- **Visual contract** — neutral surface/text tokens; weight 300 (a plain Badge is NOT a 500 context — only `ToneBadge` status text is).
- **Variants** — `count` | `label`.
- **Props** — `children`, `size`.
- **Interaction states** — none (decorative); if interactive, promote to `Button`.
- **Keyboard / Focus** — n/a unless interactive.
- **Loading / Disabled** — n/a.
- **Responsive** — intrinsic.
- **Motion** — none.
- **Shared vs page** — SHARED.

### 5.5 `FormField`, `Checkbox`, `RadioGroup`, `Switch`
- **Purpose** — labeled field wrapper + boolean/choice controls for form-viewer and eCIgn surfaces.
- **Visual contract** — label weight 300; error text uses red tone token; focus ring token.
- **Variants** — field: `default` | `inline` | `required`. Controls: standard.
- **Props** — `label`, `help`, `error`, `required`, `disabled`, `dirty`.
- **Interaction states** — validation / dirty / error / disabled (specified once here; pages inherit).
- **Keyboard** — `Space` toggles checkbox/switch; `Arrow` within `RadioGroup`.
- **Focus** — label `htmlFor` association; error announced via `aria-describedby` + `aria-live`.
- **Loading** — field skeleton.
- **Disabled** — token opacity + `disabled`.
- **Responsive** — single-column stack at ≤768; label-above on all tiers below laptop.
- **Motion** — error reveal `--motion-fast`.
- **Shared vs page** — SHARED.

---

## 6. Catalog — Surfaces

### 6.1 `SurfaceCard`
- **Purpose** — the base panel for grouped content (sections, KPI groups, list containers, viewer panes).
- **Visual contract** — surface/glass token bg; card border `#E5E4E3` token; **exactly one of two shadow tokens** (rest / hover); radius from the ramp; titles weight 300.
- **Variants** — `default` | `interactive` (elevatable) | `inset` | `glass`.
- **Props** — `as`, `padding` (density token), `elevation` (`rest`|`hover`), `header`, `footer`.
- **Interaction states** — hover-lift `translateY(-2px)` **only** on `interactive` cards (never on full-width panels or active nav).
- **Keyboard** — interactive cards are wrapped in a real `<button>`/link, not a clickable div.
- **Focus** — interactive variant shows focus-visible ring.
- **Loading** — skeleton block presentation.
- **Disabled** — n/a (non-interactive) / token opacity (interactive).
- **Responsive** — full-width stack at ≤768; multi-card grids reflow to 1-col.
- **Motion** — hover-lift + shadow swap `--motion-fast`/`--motion-base`.
- **Shared vs page** — SHARED.

### 6.2 `MetricTile`
- **Purpose** — single KPI: big number + label + optional delta/trend.
- **Visual contract** — KPI **number is weight 300** (numbers must read precisely, never bold, never animated counters); label 300; delta uses tone tokens (green/red) with glyph + sign, not color alone.
- **Variants** — `default` | `with-delta` | `with-sparkline` | `compact`.
- **Props** — `value`, `label`, `delta`, `tone`, `trend`.
- **Interaction states** — none by default; `interactive` wraps in link/button if it navigates.
- **Keyboard / Focus** — only if interactive (then focus-visible ring).
- **Loading** — number + label skeleton bars.
- **Disabled** — n/a.
- **Responsive** — tiles in a flex/grid that wraps; ≤768 two-up then one-up; numbers never truncate.
- **Motion** — none on the number (no counter animation); container hover only if interactive.
- **Shared vs page** — SHARED.

### 6.3 `ToneBadge`
- **Purpose** — the single semantic status chip. Renders `STATUS -> TONE -> LABEL` from `statusTone.ts`.
- **Visual contract** — tone token sets (bg/border/text/dot); **status text is weight 500** (one of the three permitted 500 contexts); conveys tone via **text + glyph/dot**, not color alone (WCAG 1.4.1); pastel text contrast verified AA.
- **Variants** — `solid` | `soft` | `dot-only` (dot + text, still text-labeled).
- **Props** — `status` (typed key), `size`. **No free-text color**; tone is derived, never passed as raw hex.
- **Interaction states** — none (decorative).
- **Keyboard / Focus** — n/a.
- **Loading / Disabled** — n/a.
- **Responsive** — intrinsic; wraps with its row.
- **Motion** — none.
- **Shared vs page** — SHARED. Unknown status -> slate token + dev warning.
- **Canonical tone vocabulary** — teal = ready/complete; orange = attention/blocked; green = pass/certified; amber = awaiting/pending; slate = upcoming/backlog; blue/violet/red only if added with full token sets. No screen invents a tone.

### 6.4 `ProgressMeter`
- **Purpose** — linear/stepped progress for journeys, lifecycle, onboarding gates, eCIgn step progress.
- **Visual contract** — track + fill from tone tokens (teal default); percentage label weight 300; stepped variant uses dot+label nodes.
- **Variants** — `bar` | `stepped` | `radial`.
- **Props** — `value`/`max`, `steps`, `currentStep`, `tone`.
- **Interaction states** — none; stepped nodes may be links (then focus-visible).
- **Keyboard** — stepped links are tab-navigable; non-interactive bar is `role="progressbar"` with `aria-valuenow`.
- **Focus** — visible ring on interactive nodes.
- **Loading** — indeterminate shimmer (reduced-motion: static).
- **Disabled** — token opacity.
- **Responsive** — stepped collapses labels to numbers at ≤768; bar full-width.
- **Motion** — fill transition `--motion-base`; indeterminate animation disabled under reduced-motion.
- **Shared vs page** — SHARED.

---

## 7. Catalog — Data & Operational

### 7.1 `DataTable`
- **Purpose** — the single tabular component for matrix / admin / profiles / library / forms-library / evidence list surfaces.
- **Visual contract** — rendered as a **semantic `<table>`** with `<thead>/<th scope>` and `<caption>` (or an explicit ARIA grid for editable variants) — **never a bare div CSS-grid** (the prototype div-grid at `index.html:2029` is a defect). Hairline row borders; header text weight 300; one density token set (comfortable / compact). Status cells render `ToneBadge` (text + glyph, never color-only).
- **Variants** — `read` | `selectable` | `editable-grid` | `virtualized`.
- **Props** — `columns`, `rows`, `density`, `sort`, `filter`, `onRowActivate`, `selection`, `emptyLabel`.
- **Interaction states** — row hover, row focus-visible, selected row (checkbox + token, not color alone), sortable header (aria-sort).
- **Keyboard** — header sort via `Enter`/`Space`; row activation via `Enter`; full keyboard nav preserved even when virtualized; checkbox `Space`.
- **Focus** — logical tab order through interactive cells; virtualization must not break focus.
- **Loading** — explicit skeleton rows (`aria-busy`).
- **Disabled** — disabled rows use token opacity + `aria-disabled`.
- **Empty / Error** — dedicated empty-state row (icon + message + optional action) and error-state row (message + retry).
- **Responsive** — below laptop: `overflow-x-auto` + min-width keeping ID/title/status (never `overflow-hidden` on data grids). Below tablet: stacked card-list. Fixed in the shared primitive so every table inherits.
- **Motion** — row hover `--motion-fast`; no row enter/exit animation on large lists.
- **Shared vs page** — SHARED. Virtualize ONLY the documented-large lists (Policy Library ~269, Evidence ~445, Lifecycle ~279); never virtualize small admin tables.

### 7.2 `BoardLane`
- **Purpose** — the single kanban/lane component for all board screens (ces-board, events-board, workflow-swimlane, my-tasks). Parameterized by column-config.
- **Visual contract** — lane header weight 300 + count `Badge`; cards are `SurfaceCard interactive`; status via `ToneBadge`; chart/dataviz tokens replace the ~40 raw CES-board hexes.
- **Variants** — driven by `columnConfig` (proven on 6/4/3/4-col). No per-screen forked lane.
- **Props** — `columnConfig`, `cards`, `onCardMove`, `filters`, `emptyLaneLabel`.
- **Interaction states** — card hover-lift, card focus-visible, drag-over lane highlight, selected card.
- **Keyboard** — dnd-kit **keyboard sensor** for drag-reorder (pick up / move / drop via keyboard); card activation via `Enter`.
- **Focus** — focus preserved through a keyboard move; returns to the moved card.
- **Loading** — per-lane skeleton cards.
- **Disabled** — read-only board disables drag, keeps navigation.
- **Empty** — empty-lane placeholder per lane.
- **Responsive** — **horizontal-scroll fixed-min-width lane track** (`flex` + `overflow-x-auto`), NOT `md:grid-cols-2` wrap; collapses to a single column only at mobile.
- **Motion** — card move `--motion-base` `--ease-standard`; hover-lift `--motion-fast`; disabled under reduced-motion.
- **Shared vs page** — SHARED. URL-backed filter chips via `useSearchParams`.

### 7.3 `ChatThread`
- **Purpose** — conversational surface for the iAdministrator (brad) chat screen.
- **Visual contract** — message bubbles as `SurfaceCard inset`; author label weight 300; timestamps via `formatTimestamp` (explicit timezone, no relative format on audit-adjacent content); composer uses `Input textarea` + `Button primary`.
- **Variants** — `default` | `with-suggestions`.
- **Props** — `messages`, `onSend`, `pending`, `suggestions`.
- **Interaction states** — composer focus-visible; send hover/press; streaming message shows pending indicator.
- **Keyboard** — `Enter` sends, `Shift-Enter` newline; `Esc` blurs composer.
- **Focus** — focus stays in composer after send; new message announced via `aria-live="polite"`.
- **Loading** — typing/pending indicator (reduced-motion: static dots).
- **Disabled** — composer disabled while pending if required.
- **Empty** — first-run prompt with suggestion chips.
- **Responsive** — full-height column; composer pinned bottom; ≤768 composer single-line expandable.
- **Motion** — message enter fade `--motion-base`; pending indicator honors reduced-motion.
- **Shared vs page** — SHARED (single consumer today, but contract-owned).

### 7.4 `ChecklistTable`
- **Purpose** — ordered, completable task/step lists for journeys, onboarding gates, eCIgn steps, supervisor sign-offs.
- **Visual contract** — semantic list/table; checkbox + label (weight 300); completion via `ToneBadge` (text + glyph); locked steps shown with lock glyph, not color alone.
- **Variants** — `read` | `completable` | `gated` (steps unlock in order).
- **Props** — `items`, `onToggle`, `gated`, `currentStep`, `disabledReason`.
- **Interaction states** — item hover, focus-visible, checked, locked (disabled + reason), error (validation on completable).
- **Keyboard** — `Space` toggles; locked items are `aria-disabled` with `aria-describedby` reason.
- **Focus** — focus advances to the next unlocked step on completion in gated mode.
- **Loading** — skeleton rows.
- **Disabled** — locked/gated steps use token opacity + reason.
- **Empty** — "no items" placeholder.
- **Responsive** — single-column on all tiers; labels wrap, never truncate.
- **Motion** — check transition `--motion-fast`; step unlock `--motion-base`.
- **Shared vs page** — SHARED.

---

## 8. Catalog — Overlays

> All blocking/floating overlays share ONE combined a11y + motion contract: portal to `document.body`, **trap focus**, **return focus on close**, `role="dialog"` + `aria-modal="true"`, **lock body scroll**, close on **Escape** + backdrop, `inert`/`aria-hidden` on background, and a **presence wrapper that animates exit before unmount**. Built once in V6-0.

### 8.1 `VeilModal`
- **Purpose** — centered blocking dialog (confirms, destructive confirms, focused forms).
- **Visual contract** — `SurfaceCard` elevated; backdrop scrim token; title weight 300 (modal title is a heading inside the dialog, not the page `h1`).
- **Variants** — `default` | `confirm` | `destructive` | `form`.
- **Props** — `open`, `onClose`, `title`, `description`, `footerActions`, `initialFocusRef`.
- **Interaction states** — backdrop hover (no-op), action buttons inherit `Button`.
- **Keyboard** — `Esc` closes; `Tab` cycles within trap; default/cancel buttons reachable.
- **Focus** — focus moves to `initialFocusRef` (or first focusable) on open; returns to invoker on close.
- **Loading** — footer primary can be `loading`.
- **Disabled** — confirm disabled until preconditions met.
- **Responsive** — centered on desktop; near-full-width with margin at ≤768.
- **Motion** — fade + scale 0.98→1, `--motion-base`; exit before unmount; reduced-motion collapses.
- **Shared vs page** — SHARED.

### 8.2 `VeilDrawer`
- **Purpose** — edge-anchored panel (personal-ops drawer, mobile sidebar, contextual detail panels, mobile `Select`/filter sheets).
- **Visual contract** — surface token; hairline divider; right-anchored on desktop, **bottom-sheet on mobile**.
- **Variants** — `right` | `left` | `bottom-sheet`.
- **Props** — `open`, `onClose`, `side`, `title`, `children`, `widthToken`.
- **Interaction states** — drag handle (bottom-sheet) focusable; close button focus-visible.
- **Keyboard** — `Esc` closes; focus trapped; `Tab` cycles.
- **Focus** — returns focus to the trigger on close.
- **Loading** — content region skeleton; chrome stays.
- **Disabled** — n/a.
- **Responsive** — `right` drawer on desktop → `bottom-sheet` at ≤768. The `personal-ops` drawer is canonical here (NOT a route, a state).
- **Motion** — slide-in 280ms `--ease-standard` / out 200ms `--ease-exit`; reduced-motion collapses.
- **Shared vs page** — SHARED. The legacy `#personal-ops-panel` magic hash and `redesign-calendar-swimlane` CustomEvent are converted to React state/context; no `hashchange`/`window.lucide`/`data-lucide` in V6 source.

### 8.3 `CommandPalette` / `Popover`
- **Purpose** — `CommandPalette` is the `Cmd/Ctrl-K` launcher over the VIEW registry (56 views). `Popover` is the lightweight non-modal floating surface (menus, hover-cards).
- **Visual contract** — `SurfaceCard` elevation; result list reuses `DataTable`-style rows or a listbox; weight 300.
- **Variants** — `command-palette` | `menu-popover` | `hover-card`.
- **Props** — palette: `open`, `commands`, `onSelect`. popover: `anchorRef`, `open`, `placement`.
- **Interaction states** — palette query highlight; result hover/active; selected.
- **Keyboard** — palette: `Cmd/Ctrl-K` open, `Arrow` navigate, `Enter` select, `Esc` close, type-to-filter. Popover/hover-card also opens **on focus**, closes on `Esc`.
- **Focus** — palette traps focus + returns to invoker; menu-popover returns focus to anchor; hover-card is non-modal (no trap) but focusable.
- **Loading** — palette shows "searching…" row.
- **Disabled** — unavailable commands hidden by permission.
- **Empty** — "no results" row.
- **Responsive** — palette centered, near-full-width at ≤768; hover-card repositions within viewport.
- **Motion** — fade + translateY(4px) `--motion-fast`; hover-card close ≤200ms with re-enter intent buffer (replaces prototype 1000ms delay).
- **Shared vs page** — SHARED.

---

## 9. Template-level state matrix

> Specify each template's six categories ONCE; every page on that template inherits. ~28 templates cover all 56 pages. Categories: **Interaction · Empty · Loading · Error · Responsive · Permission**.

| Template | Interaction | Empty | Loading | Error | Responsive | Permission |
|---|---|---|---|---|---|---|
| `dashboard` | MetricTile/card hover (interactive only); URL-backed range toggle | "No data for range" per tile/section | Tile + chart skeletons; shell interactive | Per-section error card + retry; root boundary | Tiles wrap 4→2→1; charts stack; right rail → below at <lg | Hide tiles/sections lacking permission |
| `profiles` | Row activate → detail; sortable headers | Empty `DataTable` row | Table skeleton rows | Table error row + retry | Table scroll <laptop, card-stack <tablet | Hide unpermitted rows/columns |
| `detail` | Tab/section nav (URL-backed); inline actions | Empty section placeholders | Pane skeletons | Per-pane error + retry | 3-pane → stacked; context pane → drawer at mobile | Section/action gating; read-only fallback |
| `calendar` | Day/Week/Month toggle (URL-backed); event hover-card (opens on focus) | "No events" agenda message | Grid/agenda skeleton | Error banner + retry | 7-col grid ≥laptop; single-col agenda below | Hide unpermitted event types |
| `chat` | Composer send; suggestion chips | First-run prompt | Pending/typing indicator | Send-failed message + retry | Full-height; composer pinned | Disable composer w/o permission |
| `board` | Card drag (keyboard + pointer); filter chips (URL-backed) | Empty-lane placeholders | Per-lane skeleton cards | Lane error + retry | Horizontal-scroll lanes; 1-col mobile | Read-only board disables drag |
| `matrix` | Sort/filter; row activate; bulk-select (where applicable) | Empty matrix row | Skeleton rows | Error row + retry | Scroll <laptop, card-stack <tablet | Hide rows/columns; gate edit actions |
| `evidence` | Filter; row/cell activate; preview | "No evidence" empty | Skeleton rows; preview spinner | Error row + retry | Dense compact density; scroll/stack | Audit-role gating; redact unpermitted |
| `reports` | Range/filter; export action | "No results" empty | Chart + table skeletons | Error card + retry | Charts stack; tables scroll/stack | Hide reports lacking permission |
| `framework` | Node expand/select; navigate to sub-route | Empty taxonomy | Tree skeleton | Error + retry | Tree collapses to accordion <tablet | Hide unpermitted branches |
| `achc-survey` | Step nav; status filter | "No items" empty | Skeleton list | Error + retry | Multi-col → stacked | Gate by survey role |
| `achc-crosswalk` | Crosswalk cell hover/activate (own PATH, not query) | Empty crosswalk | Skeleton grid | Error + retry | Horizontal scroll; stack <tablet | Gate by survey role |
| `form-viewer` | Field fill (read/fill only); section nav | "No form" / unassigned | Field skeletons | Field + form error; retry | 3-col → stacked; sticky section nav → top | Read-only if not assigned |
| `ecign` | 6 ordered no-skip steps; sign action | n/a (gated entry) | Step + signer skeleton | Signing error + retry (no optimistic UI) | Stack steps; signature pad full-width mobile | Block if not authorized signer |
| `reference-viewer` | Zoom/page nav; download | "Not found" empty | Document skeleton | Load error + retry | 3-pane collapse; viewer full-width mobile | Gate by document permission |
| `journey` | Module/step nav; progress | "No journey assigned" | Skeleton steps | Error + retry | Stacked steps; progress reflow | Gate by enrollment |
| `module-player` | Play/advance; checklist toggle | "No content" | Player + checklist skeleton | Playback error + retry | Player scales; controls wrap | Gate by enrollment |
| `docs` | TOC nav; in-page anchors | "No content" | Article skeleton | Error + retry | TOC → top accordion <tablet | Public/role gating |
| `lifecycle` | Stage nav (DRAFT→…→ARCHIVED); stage actions | "No policy" | Stage skeleton | Error + retry; **no optimistic stage advance** | Horizontal stage rail scroll; stack mobile | Gate stage transitions by role |
| `login` | Submit; new-password-required flow | n/a | Submit spinner | Auth error message; field-level | Centered card; full-width mobile | n/a (pre-auth) |

Templates reused without divergent state needs (`dashboard` reused by onboarding-v2-dashboard; `detail` by clinician/patient/policy/batch/activate/surveyor/mobile-incident; `matrix` by library/forms-library/workflows/master-controls/admin×4/onboarding-v2-batches; `evidence` by audit/onboarding-v2-audit; `reports` by ces-reports/governance/hubstaff/journey-admin/onboarding-v2-governance; `calendar` by master/staffing/ces-calendar; `board` by ces-board/events-board/workflow-swimlane/my-tasks; `docs` by appendix-f/user-guide/system-docs/help-center; `journey` by journey-overview/journey-v1/supervisor) inherit the row above for their template. **A page is covered iff its template row is fully specified above.**

---

## 10. Pageview coverage matrix

> 56 rows = 54 router routes + login + events-board(INFERRED). Columns: **PAGEVIEW (hash) · TEMPLATE · SHARED components · PAGE-SPECIFIC widgets · STATES (template row) · RESPONSIVE · DATA · A11Y · Reference**. Identify by **hash-id**. `INFERRED_FROM_V6_SYSTEM` rows inherit components from the named sibling.

| # | Pageview (hash) | Template | Shared components | Page-specific widgets | States | Responsive | Data | A11y | Reference |
|---|---|---|---|---|---|---|---|---|---|
| 1 | dashboard | dashboard | AppShell, Sidebar, PageHeader, MetricTile, SurfaceCard, ToneBadge, DataTable | KPI cluster, activity feed | §9 dashboard | tiles 4→2→1; rail→below | dashboard metrics, recent activity | 1×h1; tile labels; AA tones | PNG |
| 2 | clinicians | profiles | + DataTable, ToneBadge | clinician roster filters | §9 profiles | table scroll/stack | clinician list | table semantics; row links | PNG |
| 3 | clinician-detail | detail | + SurfaceCard, ToneBadge, ProgressMeter, ChecklistTable | credential pane, schedule pane | §9 detail | 3-pane→stack; context→drawer | clinician profile | 1×h1; tab a11y | PNG |
| 4 | patients | profiles | + DataTable, ToneBadge | patient roster filters | §9 profiles | table scroll/stack | patient list | table semantics | PNG |
| 5 | patient-detail | detail | + SurfaceCard, ToneBadge, ProgressMeter | care-plan pane, visits pane | §9 detail | 3-pane→stack | patient profile | tab a11y | PNG |
| 6 | master-calendar | calendar | + SurfaceCard, ToneBadge | event hover-card | §9 calendar | grid≥laptop; agenda below | events | hover-on-focus; date-grid a11y | PNG |
| 7 | staffing-calendar | calendar | + SurfaceCard, ToneBadge | staffing event card | §9 calendar | grid/agenda | staffing events | as calendar | PNG |
| 8 | brad | chat | + ChatThread, Button, Input | suggestion chips | §9 chat | full-height; composer pinned | chat history | aria-live messages | PNG |
| 9 | ces-calendar | calendar | + SurfaceCard, ToneBadge | CES event card | §9 calendar | grid/agenda | CES events | as calendar | PNG |
| 10 | ces-board | board | + BoardLane, SurfaceCard, ToneBadge | 4-col CES config | §9 board | lane scroll; 1-col mobile | CES cards | dnd keyboard sensor | PNG |
| 11 | events-board | board | + BoardLane, SurfaceCard, ToneBadge | 4-col events config | §9 board | lane scroll | event cards | dnd keyboard sensor | **INFERRED_FROM_V6_SYSTEM** (inherit ces-board 4-col + LIVE dashboard 4-col baseline; built per phase) |
| 12 | workflows | matrix | + DataTable, ToneBadge | workflow filters | §9 matrix | scroll/stack | workflow list | table semantics | PNG |
| 13 | workflow-swimlane | board | + BoardLane, SurfaceCard, ToneBadge | swimlane column config | §9 board | lane scroll | workflow stages | dnd keyboard | PNG |
| 14 | master-controls | matrix | + DataTable, ToneBadge | control-grid columns | §9 matrix | scroll/stack | controls | table semantics | PNG |
| 15 | audit-mode | evidence | + DataTable, ToneBadge | audit filters, evidence preview | §9 evidence | compact; scroll/stack | audit records | redaction; AA tones | PNG |
| 16 | evidence-center | evidence | + DataTable(virtualized ~445), ToneBadge | evidence preview pane | §9 evidence | scroll/stack | evidence (~445) | virtualized + a11y headers | PNG |
| 17 | ces-reports | reports | + SurfaceCard, MetricTile, DataTable | report charts | §9 reports | charts stack | CES reports | chart text alternatives | PNG |
| 18 | mobile-incident | detail | + SurfaceCard, ToneBadge, ChecklistTable | incident task pane | §9 detail | mobile-first stacked | incident/task | tab a11y; 44px targets | PNG |
| 19 | my-tasks | board | + BoardLane, SurfaceCard, ToneBadge | task lane config | §9 board | lane scroll | my tasks | dnd keyboard | PNG |
| 20 | framework | framework | + SurfaceCard, ToneBadge | taxonomy tree | §9 framework | tree→accordion | framework nodes | tree ARIA | PNG |
| 21 | achc-survey | achc-survey | + DataTable, ToneBadge, ProgressMeter | survey step list | §9 achc-survey | multi-col→stack | survey items | step a11y | PNG |
| 22 | achc-crosswalk | achc-crosswalk | + DataTable, ToneBadge | crosswalk grid | §9 achc-crosswalk | h-scroll; stack | crosswalk map | grid a11y; **own PATH /framework/achc-survey/crosswalk** | PNG |
| 23 | policy-library | matrix | + DataTable(virtualized ~269), ToneBadge | library filters | §9 matrix | scroll/stack | policies (~269) | virtualized + a11y | PNG |
| 24 | policy-detail | detail | + SurfaceCard, ToneBadge, ProgressMeter | multi-pane policy view | §9 detail | 3-pane→stack | policy doc | tab a11y; 1×h1 | PNG |
| 25 | forms-library | matrix | + DataTable, ToneBadge | forms filters | §9 matrix | scroll/stack | forms list | table semantics | PNG |
| 26 | form-viewer | form-viewer | + FormField, Input, Select, Checkbox, RadioGroup, ToneBadge | 7 section layouts × 11 field types (read/fill) | §9 form-viewer | 3-col→stack; sticky nav→top | form schema | field a11y; **/forms/:formId** | PNG |
| 27 | ecign-workspace | ecign | + ProgressMeter, ChecklistTable, FormField, ToneBadge, VeilModal | 6 ordered no-skip steps, signature pad, navy/orange brand | §9 ecign | stack; pad full-width mobile | form + signing state | step a11y; no optimistic UI; **/forms/:formId/esign** | PNG |
| 28 | artifact-viewer | reference-viewer | + SurfaceCard, ToneBadge | artifact document pane | §9 reference-viewer | 3-pane collapse | artifact | viewer a11y | PNG |
| 29 | generic-reference | reference-viewer | + SurfaceCard, ToneBadge | reference document pane | §9 reference-viewer | 3-pane collapse | reference | viewer a11y | PNG |
| 30 | journey-overview | journey | + ProgressMeter, ChecklistTable, SurfaceCard | journey map | §9 journey | stacked steps | journey state | progress a11y | PNG |
| 31 | journey-v1 | journey | + ProgressMeter, ChecklistTable | v1 journey map | §9 journey | stacked | journey v1 | progress a11y | PNG |
| 32 | module-player | module-player | + ProgressMeter, ChecklistTable, Button | content player, step checklist | §9 module-player | player scales | module content | playback a11y | PNG |
| 33 | appendix-f | docs | + SurfaceCard | doc TOC + article | §9 docs | TOC→accordion | appendix-f content | heading order; 1×h1 | PNG |
| 34 | supervisor | journey | + ChecklistTable, ToneBadge | supervisor sign-off list | §9 journey | stacked | supervisor tasks | checklist a11y | PNG |
| 35 | journey-admin | reports | + DataTable, MetricTile | enrollment reports | §9 reports | charts/table stack | journey admin data | table semantics | PNG |
| 36 | user-guide | docs | + SurfaceCard | guide TOC + article | §9 docs | TOC→accordion | guide content | heading order | PNG |
| 37 | onboarding-v2-dashboard | dashboard | + MetricTile, SurfaceCard, ToneBadge, DataTable | onboarding KPIs | §9 dashboard | tiles 4→2→1 | onboarding metrics | tile labels | PNG |
| 38 | onboarding-v2-activate | detail | + SurfaceCard, ChecklistTable, ToneBadge | activation pane | §9 detail | stack | activation state | tab a11y | PNG |
| 39 | onboarding-v2-batches | matrix | + DataTable, ToneBadge | batch filters | §9 matrix | scroll/stack | batch list | table semantics | PNG |
| 40 | onboarding-v2-batch | detail | + SurfaceCard, ChecklistTable, ToneBadge | batch detail pane | §9 detail | stack | batch detail | tab a11y | PNG |
| 41 | onboarding-v2-audit | evidence | + DataTable, ToneBadge | hash-chain audit view | §9 evidence | compact scroll/stack | onboarding audit | redaction; AA | PNG |
| 42 | onboarding-v2-governance | reports | + DataTable, MetricTile | override reports (label "Onboarding Overrides") | §9 reports | stack | governance data | table semantics; disambiguated label | PNG |
| 43 | policy-lifecycle | lifecycle | + ProgressMeter, ToneBadge, DataTable(virtualized ~279) | DRAFT→REVIEW→APPROVED→PUBLISHED→ARCHIVED rail | §9 lifecycle | stage rail scroll | lifecycle (~279) | stage a11y; **no bare /:policyId** | PNG |
| 44 | hubstaff | reports | + DataTable, MetricTile | time/activity report | §9 reports | stack | hubstaff data | table semantics | PNG |
| 45 | system-docs | docs | + SurfaceCard | doc sections (:sectionId static for MVP) | §9 docs | TOC→accordion | system docs | heading order | PNG |
| 46 | help-center | docs | + SurfaceCard | help articles (/help/* splat, single view MVP) | §9 docs | TOC→accordion | help content | heading order | PNG |
| 47 | governance | reports | + DataTable, MetricTile | governance reports | §9 reports | stack | governance data | table semantics | PNG |
| 48 | admin-groups | matrix | + DataTable, ToneBadge | user-group grid (no virtualize) | §9 matrix | scroll/stack | groups | table semantics | PNG |
| 49 | admin-roles | matrix | + DataTable, ToneBadge | roles grid | §9 matrix | scroll/stack | roles | table semantics | PNG |
| 50 | admin-permissions | matrix | + DataTable, ToneBadge | RBAC permission-matrix grid | §9 matrix | scroll/stack | permissions | grid a11y; not color-only | PNG |
| 51 | admin-users | matrix | + DataTable, ToneBadge | users grid | §9 matrix | scroll/stack | users | table semantics | PNG |
| 52 | surveyor-viewer | detail | + SurfaceCard, ToneBadge | surveyor policy pane | §9 detail | stack | policy (surveyor view) | tab a11y | PNG |
| 53 | journey-admin (admin overview ref) | reports | + DataTable | — (see #35) | §9 reports | stack | — | — | (alias of 35; single component) |
| 54 | system documentation index | docs | + SurfaceCard | — (see #45) | §9 docs | accordion | — | — | (alias of 45; single component) |
| 55 | login-page | login | + SurfaceCard(glass), Input, Button, FormField | CareIndeed logo, new-password-required flow | §9 login | centered; full-width mobile | auth/Cognito | field-level errors; **outside AppShell** | **INFERRED_FROM_V6_SYSTEM** (inherit glass surface + logo from shell; wired in V6-3/auth-last) |
| 56 | events-board (see #11) | board | (see #11) | (see #11) | §9 board | (see #11) | (see #11) | (see #11) | **INFERRED_FROM_V6_SYSTEM** (canonical row at #11) |

> **Coverage assertion (Definition of Done).** 56/56 rows green. A router-config test must equate the count of router-registered real routes (54) to the count of `is-real-route` rows, and must assert both INFERRED rows (events-board, login-page) are present and built in their stated phase. Rows 53/54/56 are explicit aliases noting a single canonical component (no duplicate switch case). No bare top-level `/:param`; lifecycle deep-link is `/policy-lifecycle/:policyId` only.

---

## 11. Cohesion rules (enforced)

1. **One token source of truth.** `src/index.css` CSS custom properties; `tailwind.config theme.extend` references them. No raw hex (`bg-[#..]`/`text-[#..]`) and no stock-Tailwind palette classes (`emerald-/amber-/slate-/violet-/blue-/red-/gray-`) for semantic state in component code — gate-enforced on source.
2. **Status semantics from one typed map.** `STATUS -> TONE -> LABEL` in `statusTone.ts`, never a substring regex; unknown → slate + dev warning; tone conveyed by **text + glyph**, not color alone.
3. **Fixed tone vocabulary.** teal = ready/complete; orange = attention/blocked; green = pass/certified; amber = awaiting/pending; slate = upcoming/backlog; blue/violet/red only if added with full token sets. No screen invents a tone.
4. **One icon family app-wide:** `lucide-react`. FontAwesome / `fa-` banned and gate-listed. No `window.lucide.createIcons` / `data-lucide`.
5. **Radius only from 8/12/16/24/32.** Card shadows exactly two tokens (rest, hover); arbitrary `box-shadow` banned.
6. **Every interactive primitive ships the full state set** (hover / focus-visible / active / disabled, + selected/loading/success/empty where applicable). Destructive uses a ratified destructive token OR confirm-modal, never bare orange.
7. **Overlay widths/radii and open/close/toast timings from the single overlay + motion token registry** — no per-component magic numbers; toast unified at 3000ms.
8. **Dates/timestamps via `formatDate`/`formatTimestamp`;** audit/eCIgn include timezone (UTC/ISO-8601 storage); relative formats banned on audit surfaces.
9. **One `DataTable` + one density token set;** matrix/admin/profiles/forms reuse them.
10. **Primary/secondary button roles fixed;** orange reserved for attention/urgency.
11. **Shared primitives built once in V6-0 and imported;** screens never fork a catalog primitive.
12. **eCIgn brand (navy `#1A3778` / orange `#F04B22`) is an authorized tokenized palette exception;** QA must not flag it off-palette and builders must not recolor it to app teal. It is a **palette** exception only — it does NOT relax the weight LOCK.
13. **Typography LOCK (restated as a cohesion invariant).** Roboto 300/500 only; weight 500 only on page titles/`h1`–`h2`, nav labels, ToneBadge status text; everything else 300; `font-semibold/bold/extrabold/black` and `font-weight` 600–900 banned; no Inter/Montserrat; hierarchy via size/color/opacity/spacing/casing.
14. **Motion from the single registry.** `--motion-fast/base/slow` + `--ease-standard/exit`; no enter/exit > 300ms; global `prefers-reduced-motion` collapse + `animation: none` on the pulse, verified by a Stage-C axe gate.
15. **A11y baseline is a component contract, not a page chore.** Exactly one `h1` per route (`PageHeader` emits it, `headingLevel` required, no skipped levels); `DataTable` is a semantic table or explicit ARIA grid; all overlays portal + trap + return focus + `role=dialog`/`aria-modal` + scroll-lock + Escape + backdrop; visible focus-visible ring on all controls; `min-h-44` touch floor; per-route axe gate (serious+critical fail) at 360/768/1024/1280/1536.

---

## 12. Shared-vs-page-specific decision rule

A capability is **SHARED** (must be a catalog component, built in V6-0) when **any** holds: it appears on 2+ pageviews; it carries semantic status/tone; it is an overlay; it is a form control; it is the chrome (shell/nav/header); or it renders tabular/board/metric/progress data. A capability may be **PAGE-SPECIFIC** only when **all** hold: it appears on exactly one pageview; it composes existing shared components/tokens (no new primitive, no raw hex, no new tone, no new motion timing, no new radius/shadow); and it adds no new interaction/a11y contract beyond what its template already specifies. Page-specific widgets are enumerated per row in §10 and are the **only** non-catalog UI a screen may introduce. When in doubt, it is SHARED.

> **Net:** ~28 template state specs (§9) cover all 56 pageviews (§10); the 14-family catalog + leaf primitives (§§4–8) are the only sanctioned building blocks; cohesion rules (§11) and the decision rule (§12) keep 14 parallel workers from inventing divergent solutions. Conform every other V6 doc to the canonical contracts before fan-out.
