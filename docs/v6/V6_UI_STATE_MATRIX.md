# V6 UI State Matrix

> **Authority & scope.** This document is the canonical per-template / per-component-family
> state contract for V6. It resolves P0-8 ("State/responsive/a11y layers are ~0% specified")
> by specifying states **once per template (~28) and once per shared primitive**, not per page
> (56). A pageview is **not covered** until its template's six state categories
> (interaction / empty / loading / error / responsive / permission) are satisfied here.
>
> **Ground truth.** Synthesis `RESOLVED_WITH_BLOCKERS`. Canonical route table = 56 views
> (54 router routes + 2 overlay/auth). Identify every screen by stable **hash-id**, never by
> path or template (templates `matrix`/`evidence`/`reports`/`detail`/`board` are reused across
> 3–7 routes — P1-1).
>
> **Typography LOCK (governs all copy in this doc).** Roboto self-hosted at weights **300 + 500
> only** (no 400, no 700, no Google Fonts CDN). Weight **500 (`font-medium`)** is permitted ONLY
> on: page titles / h1–h2, sidebar/nav labels, status/ToneBadge text. **Everything else is 300
> (`font-light`)** — body, tables, KPI numbers, card titles, subheadings, chips, empty/error/loading
> copy. BANNED: `font-semibold` / `font-bold` / `font-extrabold` / `font-black`, weights 600–900.
> Hierarchy via size / color / opacity / spacing / casing. eCIgn navy `#1A3778` / orange `#F04B22`
> is an authorized **palette** exception (tokenized) — NOT a weight exception.
>
> **Token LOCK.** All color/tone/motion/radius/shadow values come from `src/index.css` CSS custom
> properties (single token home; `tokens.css` deleted). No raw hex, no stock-Tailwind palette
> classes in component code. Status from typed `STATUS → TONE → LABEL` map (`statusTone.ts`),
> never a substring regex; UNKNOWN → slate + dev warning. Tone conveyed by **text + glyph**, never
> color alone (WCAG 1.4.1).
>
> **Motion LOCK.** Durations: `--motion-fast` 120ms (hover/press/tab/row), `--motion-base` 200ms
> (cards/popovers/toasts/route content), `--motion-slow` 280ms (drawers/sidebar/bottom-sheet).
> Easings: `--ease-standard` enter/move, `--ease-exit` leave. No enter/exit > 300ms. Global
> `@media (prefers-reduced-motion: reduce)` collapses durations to ~0.01ms and sets `animation:none`
> on the pulse. Reduced-motion is a Stage-C axe gate.

---

## 0. How to read this matrix

### 0.1 The eleven state slots

Every family below is specified across these slots. A blank slot means **"inherits the primitive
default unchanged"** — it is still covered, not undefined.

| Slot | Definition |
|---|---|
| **default** | Resolved data present, idle, not focused/hovered/selected. |
| **loading** | First fetch in flight, no prior data (full-region indicator). |
| **skeleton** | Structural placeholder used during loading when layout shape is known (preferred over spinner for tables/cards/boards). |
| **empty** | Fetch resolved with zero rows/items (the "happy zero" — distinct from error). |
| **error** | Fetch failed, or a write failed. Always offers a retry affordance. |
| **permission-denied** | Authn OK but authz denies this view/action (403-class). Distinct copy + no retry. |
| **offline-retry** | Network unreachable / request aborted. Non-destructive, auto-retry-on-reconnect where safe. |
| **success** | A write/transition completed (toast or inline confirm). |
| **selected** | Item is the active selection (row, lane card, nav item, tab, calendar day). |
| **hover** | Pointer over an interactive, elevatable surface. |
| **focus** | `:focus-visible` keyboard focus ring (never `outline:none`). |
| **disabled** | Control present but non-interactive (gated step, insufficient permission, in-flight). |

### 0.2 Global rules applied to every row (do not repeat per family)

- **Single h1 per route**, emitted by `PageHeader` (`headingLevel` prop required; no skipped levels) — a11y gate asserts exactly one h1.
- **Focus ring**: `--focus-ring` token on every interactive control; visible on `:focus-visible`; icon-only buttons carry an accessible name.
- **Reduced motion**: all transitions reference motion tokens; honored globally.
- **Touch floor**: `min-h-44` on interactive elements (responsive gate checks bounding boxes).
- **Toast**: single unified `3000ms` auto-dismiss; `role="status"` (success) / `role="alert"` (error); dismissable; pauses on hover/focus.
- **Skeleton vs spinner**: prefer skeleton where layout shape is known (tables, cards, boards, calendar grid). Spinner only for indeterminate point actions (button busy).
- **Error copy pattern**: `Heading (what failed) + one-line cause-neutral body + primary "Try again" + secondary "Contact support" where applicable`. Never expose stack/HTTP codes to the user.
- **Permission-denied copy pattern**: state the restriction plainly, name the action to take ("Ask an administrator for the *X* role"), offer a safe back-nav. **No retry button** (retrying changes nothing).
- **Announcements**: status-region updates go through a single app-level polite live region (`aria-live="polite"`) for loading/empty/success; errors that interrupt a task use `aria-live="assertive"` / `role="alert"`. Route changes announce the new page title.

### 0.3 Responsive breakpoints (canonical, from synthesis)

`360` (mobile) · `768` (tablet) · `1024` (laptop) · `1280` (desktop) · `1536` (wide).
Sidebar `292px` expanded / `88px` collapsed. Context/right rails engage at **lg (1024)**, not xl.
Machine-checkable at Stage C: `document.scrollWidth ≤ viewport` (no body h-scroll), 44px targets,
tables scroll-or-stack, boards horizontal-scroll, calendar agenda below laptop.

---

# PART A — LEAF PRIMITIVES

> Built and Opus-signed-off in **V6-0** before any screen. Every leaf ships its full state set
> **once**; pages and composites inherit. A screen may **never** fork a catalog primitive.

## A1. Button

| Slot | Behavior & copy | A11y / announcement |
|---|---|---|
| default | Primary = teal solid; secondary = teal outline; tertiary = ghost; **orange reserved for attention/urgency only**, never generic primary. Label weight **300** (it is not a title/nav/status). | `<button type>` explicit; accessible name = visible label or `aria-label` for icon-only. |
| loading | Busy state: inline spinner replaces leading icon, label stays, width locked (no reflow). Pointer disabled. | `aria-busy="true"`; if label changes to "Saving…" announce via the action's live region. |
| empty | n/a | — |
| error | On action failure the button returns to default; error surfaces via toast/inline, not on the button. | error toast `role="alert"`. |
| permission-denied | Renders **disabled** with a tooltip/`aria-describedby` naming the required role; or is omitted entirely per page policy. | disabled reason exposed to AT, not color-only. |
| offline-retry | Action queued or blocked with "You're offline — we'll retry" inline note for safe actions only (never signing/evidence/audit writes). | polite announce. |
| success | Returns to default; success conveyed by toast or adjacent inline check (text + glyph). | `role="status"`. |
| selected | Toggle buttons use `aria-pressed`; segmented control uses `aria-selected` on tab role. | state via ARIA, not color alone. |
| hover | Background/ър border token shift over `--motion-fast`; press-scale `~0.98` (one token). | — |
| focus | `--focus-ring` visible. | — |
| disabled | Reduced-opacity token; `cursor:not-allowed`; not in tab order via `disabled`. | `disabled` attr (not `aria-disabled` unless focus needed for tooltip). |

## A2. Input / Select / form field

| Slot | Behavior & copy | A11y |
|---|---|---|
| default | Hairline border token; label weight 300; placeholder is hint, never the label. | `<label for>` always; required marked in text + `aria-required`. |
| loading | Async-populated selects show inline skeleton in the control; field disabled until options arrive. | `aria-busy`. |
| empty | Select with no options: "No options available" item, control disabled. | announced. |
| error | Validation: error token border + inline message **below** field (text, weight 300) — never color-only. | `aria-invalid="true"`, `aria-describedby` → message; on submit, focus first invalid field. |
| permission-denied | Field rendered **read-only** (value visible) when user may view but not edit. | `readonly` + helper text "Read-only — you don't have edit rights." |
| offline-retry | Dirty unsaved values preserved locally; "Not saved — offline" banner. | polite. |
| success | Saved state: brief inline "Saved" + check, then fades; dirty flag cleared. | `role="status"`. |
| selected/dirty | Dirty token (subtle) on changed fields; selected option highlighted. | — |
| hover | Border token shift `--motion-fast`. | — |
| focus | `--focus-ring`; combobox `aria-expanded`/`aria-activedescendant`. | — |
| disabled | Opacity token; excluded from tab order. | `disabled`. |

## A3. Badge / ToneBadge

| Slot | Behavior & copy | A11y |
|---|---|---|
| default | Tone from `statusTone.ts` (`STATUS → TONE → LABEL`). Full token set per tone: bg/border/text/dot/bar. Text weight **500** (status text is an allowed 500 slot). Tone vocabulary fixed: teal=ready/complete, orange=attention/blocked, green=pass/certified, amber=awaiting/pending, slate=upcoming/backlog; blue/violet/red only with full token sets. | **Text label + glyph/dot**, never color alone (WCAG 1.4.1). |
| unknown status | Falls back to **slate** + emits dev warning; renders raw value as label. | still text + glyph. |
| (other slots) | Badge is non-interactive; no hover/focus/disabled/selected unless used as a filter chip → then inherits Button focus/selected (`aria-pressed`). | — |

---

# PART B — 14 COMPOSITE FAMILIES

> The single shared catalog (V6_DESIGN_VISUALIZATION sec 5). All built in V6-0.
> Composite-level states below are inherited by every template that uses them.

## B1. AppShell

| Slot | Behavior & copy | A11y / responsive |
|---|---|---|
| default | Hosts Sidebar + Topbar + `<Outlet/>` content region. | landmark roles: `banner` (Topbar), `navigation` (Sidebar), `main` (content); skip-link to `main`. |
| loading | Shell renders immediately; only the content region shows route skeleton (sidebar/topbar stay interactive). | route-level Suspense fallback in content region only. |
| error | **Root error boundary** + **content-region error boundary**: shell chrome survives, content shows error card with retry; nav remains usable. | `role="alert"` in content; focus moved to error heading. |
| offline-retry | Topbar shows a persistent "Offline" indicator; content region offers retry. | polite announce on reconnect. |
| responsive | ≥1024 sidebar+content side-by-side; 768–1023 sidebar collapses to 88px rail; <768 sidebar becomes a drawer (hamburger in Topbar). Content never body-scrolls horizontally. | — |

## B2. Sidebar

| Slot | Behavior & copy | A11y / responsive |
|---|---|---|
| default | Grouped nav (Overview/CES/Taxonomy/Onboarding/Onboarding v2/System/Admin). Labels weight **500** (nav-label slot). Drives `visibleGroups` filter across all 56 views. | `<nav aria-label>`; current item `aria-current="page"`. |
| loading | If groups are permission-gated and async, show skeleton nav items (no layout jump). | `aria-busy`. |
| empty | If a group has no permitted items, hide the group header entirely (no empty header). | — |
| permission-denied | Items the user can't access are **omitted**, not shown-disabled (avoids advertising restricted areas). | — |
| filter (P1-6) | Sidebar filter uses `useDeferredValue`/`startTransition`; no-match shows "No matching views" inline. | filter input labeled; results count announced politely. |
| selected | Active route item: teal token + `aria-current="page"`. | not color-only — weight/indicator too. |
| hover | Background token shift `--motion-fast`; **no hover-lift** on nav items (lift reserved for elevatable cards). | — |
| focus | `--focus-ring`; full keyboard traversal. | — |
| collapsed (88px) | Icon-only; label moves to `aria-label` + tooltip on focus/hover. | accessible names preserved when collapsed. |
| responsive | 292→88 at tablet; drawer + scrim + focus-trap at mobile (inherits VeilDrawer contract). | — |

## B3. Topbar / PageHeader

| Slot | Behavior & copy | A11y |
|---|---|---|
| default | PageHeader emits the route's **single h1** (weight 500); breadcrumbs derived from matched route hierarchy; primary page actions right-aligned. | exactly one h1; `headingLevel` required. |
| loading | h1 + breadcrumb skeleton lines; action buttons disabled until context loads. | route title announced when resolved. |
| error/empty | Inherit from content region (header still renders title). | — |
| responsive | <768: action cluster collapses into an overflow "More" menu; breadcrumb truncates to last segment + back. | overflow menu = focus-trapped popover. |

## B4. MetricTile (KPI)

| Slot | Behavior & copy | A11y |
|---|---|---|
| default | Big number weight **300** (KPI numbers are NOT a 500 slot), label below, optional delta with tone + glyph. **No animated counters** (precision matters — rejected). | number + unit in accessible text; delta direction stated in text, not arrow-only. |
| loading/skeleton | Number→shimmer bar, label→short bar; tile keeps final dimensions. | `aria-busy`. |
| empty | "—" with "No data yet" sublabel (distinct from `0`, which is a real value). | announced. |
| error | Tile shows "Couldn't load" + small retry icon button. | `role="alert"` scoped to tile. |
| permission-denied | Tile hidden if the metric is restricted (don't show a locked KPI shell). | — |
| hover | Elevatable: hover-lift `translateY(-2px)` over `--motion-fast` (allowed — discrete card). | — |
| focus | If the tile is a link/drill-through: `--focus-ring`. | link role + name. |
| responsive | Tile grid reflows 4→2→1 columns (wide→tablet→mobile); never shrinks number below legibility. | — |

## B5. SurfaceCard

| Slot | Behavior | A11y / responsive |
|---|---|---|
| default | Glass/surface token bg, hairline border, one of the two shadow tokens (rest). Title weight 300. | region role + accessible name where it groups content. |
| loading/skeleton | Title + body skeleton lines within card footprint. | `aria-busy`. |
| empty | Inline empty content (icon + one-line + optional action). | announced. |
| error | Card body → error state with retry; card chrome persists. | `role="alert"` scoped. |
| hover | Hover-lift + hover shadow token **only** if the whole card is a single interactive target; static cards do not lift. | — |
| focus | If interactive: `--focus-ring` on the card. | — |
| responsive | Cards stack to single column below tablet; padding density token tightens at mobile. | — |

## B6. ToneBadge — see **A3** (leaf-level contract; composite usage inherits it).

## B7. DataTable

> The most-reused composite. **Must be a semantic `<table>`** (`<caption>`, `<th scope>`) — not a
> div CSS-grid — or an explicit ARIA grid for editable variants. One density token set shared by
> matrix/admin/profiles/forms. Virtualize **only** the 3 documented-large tables (Policy Library
> ~269, Evidence ~445, Lifecycle ~279), preserving keyboard nav + accessible headers; never
> virtualize small admin tables.

| Slot | Behavior & copy | A11y / announcement |
|---|---|---|
| default | Sortable headers, status column via ToneBadge (text+glyph). Body weight 300. | `<table>` semantics; sort state via `aria-sort` on `<th>`. |
| loading | n/a (use skeleton). | — |
| skeleton | 5–8 placeholder rows matching column widths; header visible. | `aria-busy` on table; rowcount not announced until resolved. |
| empty | Full-width empty row: icon + "No *items* found" + (if filtered) "Clear filters" action; distinguish **no data** vs **no results for current filter**. | empty message in a spanning cell; announced politely. |
| error | Full-width error row: "Couldn't load *items*" + "Try again". Header/filters stay usable. | `role="alert"` in spanning cell. |
| permission-denied | If the dataset is restricted: replace body with permission-denied panel (no retry). Column-level redaction shows "Restricted" cells (text), not blanks. | restriction stated in text. |
| offline-retry | Banner above table; cached rows shown dimmed with "May be out of date"; auto-refetch on reconnect. | polite announce on refresh. |
| success | After inline edit/bulk action: toast + the affected row(s) briefly flash a success token (text confirm too). | `role="status"`; announce "*N* rows updated". |
| selected | Row selection via checkbox column; selected rows get token bg + persist selection count in a bulk-action bar. | row checkbox labeled; selection count announced. |
| hover | Row hover token bg over `--motion-fast`; no lift. | — |
| focus | Roving-tabindex or native focus on row/cell controls; `--focus-ring`. | full keyboard nav incl. virtualized lists. |
| disabled | Non-actionable rows dim; disabled row controls excluded from tab order. | reason in text. |
| responsive | <1024: `overflow-x-auto` + `min-width` keeping ID/title/status visible (never `overflow-hidden`). <768: collapse to stacked **card list** (label:value pairs). | h-scroll region is keyboard-scrollable + labeled. |

## B8. BoardLane (Kanban)

> Parameterized by **column-config**, proven on all 4 board variants (ces-board, events-board 4-col,
> workflow-swimlane, my-tasks). events-board is **INFERRED_FROM_V6_SYSTEM** (4-col, no PNG).

| Slot | Behavior & copy | A11y / responsive |
|---|---|---|
| default | Lanes from column-config; cards carry ToneBadge status. Lane header label weight 500 (nav/label-class). | board = list of labeled regions; cards are list items. |
| loading/skeleton | 2–3 skeleton cards per lane. | `aria-busy`. |
| empty | **Per-lane empty state**: dashed drop-zone + "Nothing here yet" (do not collapse the lane — keeps drop target). Whole-board empty: centered empty panel. | each empty lane announces its name + "empty". |
| error | Board-level error panel with retry; lanes hidden. | `role="alert"`. |
| permission-denied | Read-only board: drag disabled, cards still readable; "View only" chip in header. | drag affordance removed, not just visually. |
| offline-retry | Card moves are **queued, not optimistic** for compliance-sensitive boards; "Will sync when online". (Optimistic UI banned on signing/evidence/audit; allowed only on low-stakes task moves.) | move result announced after server confirms. |
| success | Card move confirmed → settle animation `--motion-base`; toast for cross-lane moves. | announce "Moved *card* to *lane*". |
| selected | Focused/selected card token outline. | `aria-selected`. |
| hover | Card hover-lift allowed (discrete elevatable). | — |
| focus + DnD | **dnd-kit keyboard sensor**: pick up / move / drop via keyboard; live instructions + position announcements. | drag operations fully keyboard-operable + announced. |
| disabled | Locked cards (e.g., gated) non-draggable + lock glyph + text. | reason in text. |
| responsive | ≥1024 horizontal-scroll fixed-min-width lane track (`flex overflow-x-auto`) — **not** `md:grid-cols-2` wrap. <768: single-column stacked lanes. | board scroll region keyboard-scrollable. |

## B9. VeilModal (blocking overlay)

| Slot | Behavior & copy | A11y / motion |
|---|---|---|
| default | Portal to `document.body`; backdrop scrim; centered panel; title = modal heading. | `role="dialog"` + `aria-modal="true"` + `aria-labelledby`; **focus trap**; **return focus** to invoker on close; body **scroll-lock**; background `inert`/`aria-hidden`; close on **Escape** + backdrop click. |
| loading | Confirm/submit action → primary button busy; panel content may show skeleton for async-loaded modals. | `aria-busy`. |
| error | Inline error region at top of modal body (text + glyph); primary action re-enabled to retry. | `role="alert"`; focus to error. |
| success | Close on success + parent toast; or inline success then auto-close. | `role="status"`. |
| permission-denied | Destructive/privileged confirm shows the required role and disables confirm. | reason in text. |
| disabled | Confirm disabled until required inputs valid (e.g., typed confirmation for destructive). | `aria-disabled` reason. |
| motion | Enter: fade + scale `0.98→1` over `--motion-base`; exit animates **before unmount** (presence wrapper). Reduced-motion → no scale/fade. | — |
| responsive | <768: full-width / near-full-height sheet; actions pinned to bottom. | — |

## B10. VeilDrawer (side panel / personal-ops)

> Replaces the prototype `#personal-ops-panel` magic hash + `redesign-calendar-swimlane`
> CustomEvent with React state/context (P1-3). Drawer open/close is **state, not a route**.

| Slot | Behavior | A11y / motion / responsive |
|---|---|---|
| default | Right-side panel over scrim; header + scrollable body + sticky footer actions. | same overlay contract as VeilModal (`role="dialog"`, trap, return-focus, scroll-lock, Escape, backdrop). |
| loading/skeleton | Body skeleton while panel content loads. | `aria-busy`. |
| empty | Body empty state when the panel has nothing to show. | announced. |
| error | Body error + retry; drawer stays open. | `role="alert"`. |
| success | Inline confirm + optional auto-close. | `role="status"`. |
| motion | Slide-in `--motion-slow` (280ms) `--ease-standard`; slide-out 200ms `--ease-exit`; backdrop fade 200ms. Retire prototype 0.7s. Reduced-motion → instant. | — |
| responsive | Desktop/laptop = right drawer; **mobile = bottom-sheet** (PersonalOpsDrawer canonical). | — |

## B11. CommandPalette (Cmd/Ctrl-K + Popover)

| Slot | Behavior & copy | A11y / motion |
|---|---|---|
| default | Searches the **VIEW registry** (56 hash-ids); grouped results. Input placeholder "Search views and actions…". | `role="dialog"` overlay; combobox + listbox pattern; `aria-activedescendant`; arrow-key nav; Enter to run; Escape to close + return focus. |
| loading | Async results → inline spinner in input row; keep prior results. | `aria-busy`. |
| empty | "No results for *query*" + suggestion to try a different term. | result count announced politely. |
| error | "Search unavailable" + retry (rare; registry is local). | `role="alert"`. |
| selected | Active option highlighted + `aria-selected`. | not color-only. |
| focus | Trapped within palette; first option auto-active. | — |
| motion | Fade + `translateY(4px)` over `--motion-fast` (120ms). Reduced-motion → instant. | — |
| responsive | Centered, max-width capped; near-full-width on mobile. | — |

## B12. ChatThread (iAdministrator / "brad")

| Slot | Behavior & copy | A11y |
|---|---|---|
| default | Message list (user/assistant), composer at bottom; body weight 300. | log pattern: `role="log"` `aria-live="polite"` for incoming; messages have author labels. |
| loading/streaming | Assistant typing → animated indicator (respects reduced-motion: static "…"); streamed tokens append. | streaming chunks announced politely (debounced), not per token. |
| empty | First-run: short prompt suggestions + "Ask me about…" panel. | — |
| error | Failed send → inline error bubble + "Retry" on that message; composer keeps the text. | `role="alert"` on the failed message. |
| offline-retry | Send disabled with "Offline" note; drafts preserved. | polite. |
| success | n/a (delivery implied by response). | — |
| disabled | Composer disabled while a response streams (or allow interrupt). | `aria-disabled` + reason. |
| focus | Composer focus ring; Enter sends / Shift-Enter newline (documented). | — |
| responsive | Single-column; composer pinned; safe-area aware on mobile. | — |

## B13. ProgressMeter

| Slot | Behavior & copy | A11y |
|---|---|---|
| default | Determinate bar/ring with **numeric label** (text), tone from status map. | `role="progressbar"` + `aria-valuenow/min/max` + accessible name. |
| loading | Indeterminate variant only when total is unknown. | `aria-valuetext="Loading"`. |
| empty/zero | 0% rendered explicitly (distinct from "no data"). | value announced. |
| error | "Couldn't compute progress" fallback. | `role="alert"`. |
| success/complete | 100% → completion token + check glyph + text "Complete". | `role="status"`. |
| motion | Fill transitions over `--motion-base`; reduced-motion → snap. | — |

## B14. ChecklistTable

> Backbone of onboarding-v2 gate tiles, eCIgn step list, journey modules.

| Slot | Behavior & copy | A11y |
|---|---|---|
| default | Rows = steps with state (todo/doing/done/blocked) via tone map (text+glyph), optional ordering. | semantic list/table; each item state in text. |
| loading/skeleton | Placeholder rows. | `aria-busy`. |
| empty | "No steps assigned." | announced. |
| error | Row/section error + retry. | `role="alert"`. |
| permission-denied | Steps the user can't action are read-only with reason. | text reason. |
| success | Step complete → check + tone shift + optional "Step *N* complete" announce; advances next step. | `role="status"`. |
| selected/active | Current step highlighted + `aria-current="step"`. | — |
| disabled / step-locked | **No-skip enforcement**: future steps locked until prerequisites met; lock glyph + "Complete step *N* first". | locked steps not focusable as actions; reason exposed. |
| responsive | Stacks to vertical card list below tablet. | — |

---

# PART C — TEMPLATE STATE SPECS (~28 templates → all 56 views)

> Specified **once per template**. The route table maps each of the 56 hash-ids to one template.
> Each template entry lists: the composites it composes, template-specific deltas to the inherited
> states, and responsive collapse contract. Where a state isn't called out, it **inherits** the
> composite contract above.

### C1. `dashboard` — *dashboard, onboarding-v2-dashboard*
- **Composes:** MetricTile grid + SurfaceCard charts + DataTable/BoardLane summaries.
- **loading:** tile + card skeletons in final layout (no spinner sea). **empty:** per-tile "—/No data yet". **error:** per-region error cards (one failed chart doesn't blank the page). **permission-denied:** restricted tiles omitted.
- **success/offline:** inherit. **responsive:** tiles 4→2→1; charts stack; secondary tables collapse to card-list <768.
- **Chart/dataviz** uses `--chart-*` tokens (replaces ~40 raw CES hexes); chart series labeled in legend text (not color-only).

### C2. `profiles` — *clinicians, patients*
- DataTable of people + filters. **empty:** "No clinicians match" vs "No clinicians yet". **selected:** row → navigates to `detail`. Responsive: table→card-list <768; avatar+name+status kept.

### C3. `detail` — *clinician-detail, patient-detail, policy-detail, onboarding-v2-activate, onboarding-v2-batch, mobile-incident, surveyor-viewer*
- **Composes:** PageHeader (single h1 = entity name) + SurfaceCards + ToneBadges + nested DataTables/ChecklistTables.
- **loading/skeleton:** header + section skeletons. **empty:** per-section empty (e.g., "No documents"). **error:** per-section retry; header persists. **permission-denied:** whole-record denial → panel; field-level → read-only / "Restricted".
- **policy-detail** is multi-pane (doc + metadata + history) → panes collapse to stacked sections <1024, accordion <768.
- **mobile-incident** is mobile-first (the one documented responsive page): single-column, large touch targets, action sheet.

### C4. `calendar` — *master-calendar, staffing-calendar, ces-calendar*
- **default:** 7-col month grid (laptop+); Day/Week/Month via `useSearchParams` view-mode (wire the inert toggles). **selected:** active day token + `aria-selected`. **empty:** "No events" in cell/agenda. **loading:** grid skeleton. **error:** region error + retry.
- **Hover-card** opens on **hover and focus**; close delay ~150–200ms with intent buffer (retire prototype 1000ms). **responsive:** below laptop → single-column **date-grouped agenda** (not a squeezed grid). Grid cells keyboard-navigable.

### C5. `board` — *ces-board, events-board (INFERRED 4-col), workflow-swimlane, my-tasks*
- Directly = BoardLane (B8). All board states inherit. events-board inherits 4-col column-config from ces-board + LIVE dashboard 4-col baseline.

### C6. `matrix` — *workflows, master-controls, policy-library, forms-library, admin-groups, admin-roles, admin-permissions, admin-users, onboarding-v2-batches*
- Dense DataTable with multi-facet filters + bulk actions. **empty:** no-data vs no-results-for-filter (with "Clear filters"). **permission-denied:** admin RBAC matrices show "Restricted" cells, not blanks; denial panel if whole view restricted. **policy-library** is a large table → virtualize (a11y-preserving). Responsive: filters collapse into a "Filters" drawer/sheet <768; table→card-list.

### C7. `evidence` — *audit-mode, evidence-center, onboarding-v2-audit*
- Evidence DataTable (~445 rows → virtualized) + status via tone map. **Audit surfaces:** timestamps shown **UTC/ISO with explicit timezone** (relative formats **banned** here). **offline-retry:** cached rows marked "May be out of date." **success on export:** toast + announce. Responsive: scroll-or-stack; keep hash/timestamp/status columns.

### C8. `reports` — *ces-reports, journey-admin, onboarding-v2-governance ("Onboarding Overrides"), hubstaff, governance*
- Charts + summary tables. **loading:** chart skeletons. **empty:** "No data for selected range." **error:** per-chart retry. **permission-denied:** governance/override views gate to admins (denial panel). Chart series labeled in text + legend.

### C9. `framework` — *framework*
- Taxonomy overview (cards/tree). **empty:** "No frameworks." **selected:** drills into `achc-survey`. Responsive: multi-col → single-col.

### C10. `achc-survey` — *achc-survey*
- Survey workspace. **loading/skeleton, empty, error** standard. Links to crosswalk via **distinct path** `/framework/achc-survey/crosswalk` (NOT `?view=` — P0-3).

### C11. `achc-crosswalk` — *achc-crosswalk*
- Distinct two-axis mapping grid (own template, own path). **empty:** "No mappings." Dense → horizontal+vertical scroll region (keyboard-scrollable), sticky axis headers. **error/permission** standard.

### C12. `form-viewer` — *form-viewer* (`/forms/:formId`, read/fill ONLY)
- **7 section layouts × 11 field types** (inherits A2 field states for each). **loading/skeleton:** section skeletons. **empty:** "This form has no fields." **error:** load error + retry; field-save errors inline. **permission-denied:** read-only render. **dirty/success:** unsaved indicator; save confirm. **Distinct component** from eCIgn — never a mode flag. Responsive: 3-col form regions stack to single column <1024.

### C13. `ecign` — *ecign-workspace* (`/forms/:formId/esign`, canonical signing path)
- **6 ordered, no-skip steps** (ChecklistTable B14 enforcement) + signer states. **eCIgn brand navy `#1A3778` / orange `#F04B22`** = authorized tokenized exception (QA must not flag off-palette; builders must not recolor to teal); weight rule still applies.
- **success:** each step completion announced; **no optimistic UI** (compliance/dual-signature/hash-chain) — every signing write awaits server confirm. **error:** signing failure → assertive alert + safe retry (never silently advance). **disabled/step-locked:** future steps locked. **offline:** signing actions **blocked** offline (not queued). Responsive: stepper collapses to vertical; signature surface sized for touch.

### C14. `reference-viewer` — *artifact-viewer, generic-reference*
- Document/artifact viewer (3-pane: nav + doc + meta). **loading:** doc skeleton. **empty:** "Nothing to display." **error:** "Couldn't load document" + retry. Responsive: 3-pane → collapse meta/nav into toggles <1024, stacked <768.

### C15. `journey` — *journey-overview, journey-v1, supervisor*
- Onboarding journey overview (progress + module cards via ProgressMeter B13). **empty:** "No modules assigned." **selected:** drills to module-player. Responsive: card grid → single column.

### C16. `module-player` — *module-player*
- Lesson player (content + ChecklistTable progress). **loading:** content skeleton. **success:** module-complete → ProgressMeter 100% + announce + advance. **disabled:** locked next module. Responsive: player stacks controls below content on mobile.

### C17. `docs` — *appendix-f, user-guide, system-docs, help-center*
- Long-form doc + section nav (TOC). **empty:** "No content." **error:** retry. **help-center** `/help/*` splat: article not found → in-doc 404 "Article not found" + back to index (post-MVP splat per P2-1). Responsive: TOC collapses to top dropdown <1024.

### C18. `lifecycle` — *policy-lifecycle*
- State machine view `DRAFT→REVIEW→APPROVED→PUBLISHED→ARCHIVED` (ProgressMeter/ChecklistTable). Large list (~279) → virtualized. **No bare `/:policyId`**; deep-link only `/policy-lifecycle/:policyId`. **disabled:** transitions the user can't perform are gated with reason. **success:** transition confirm + announce. Responsive: stage rail collapses to dropdown; list→card-stack.

### C19. `chat` — *brad (iAdministrator)*
- Directly = ChatThread (B12); inherits all states.

### C20. `login` — *login-page* (`/login`, INFERRED, built in V6-3 with auth)
- **Composes:** centered glass SurfaceCard + CareIndeed logo (self-hosted SVG) + form fields (A2). FontAwesome login icons migrated to **lucide-react**.
- **default:** email/password (+ new-password-required / MFA states per Cognito flow). **loading:** submit → button busy. **error:** invalid-credentials inline (text, generic — don't leak which field), `role="alert"`, focus to message. **success:** redirect + announce. **offline:** "Can't reach sign-in — check your connection." **disabled:** submit disabled until fields valid. Single h1 = "Sign in". Responsive: full-width card on mobile; never body h-scroll.

> **Overlay/auth note.** modal-system (VeilModal), drawer-system (VeilDrawer), popover-system
> (CommandPalette/Popover), and personal-ops (drawer state) are **overlays, not routes** — their
> state contracts are B9–B11 above and apply across all templates.

---

# PART D — Coverage assertion

- **28 template specs (C1–C20 + reused families)** cover **all 54 router routes**; the 2 overlay/auth
  members (login wired in V6-3; overlays as primitives) complete **56/56**.
- A template/page is **DONE** only when all six state categories
  (interaction / empty / loading / error / responsive / permission) trace to a contract here.
- **Definition of Done** asserts 56/56; a test equates router-registered real-route count to
  is-real-route rows in the single canonical matrix (this doc is the **state-matrix host** for that
  matrix). INFERRED members: **events-board** (4-col BoardLane) and **login-page** (glass + logo).
- **Stage-C gates** that consume this matrix: axe-core/playwright (serious+critical fail; one h1;
  table semantics; overlay dialog/trap; reduced-motion), responsive (no body h-scroll; 44px targets;
  tables scroll-or-stack; boards scroll; calendar agenda below laptop), typography
  (no Inter/Montserrat; no weight 600–900), and asset-CDN ban.
