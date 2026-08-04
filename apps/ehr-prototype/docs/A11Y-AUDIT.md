# Accessibility & Interaction Audit — Care Indeed Home Health EHR Prototype

Scope: `src/ui/index.tsx` (shared kit), `src/shell/` (AppShell, DocShell, CommandPalette), `src/components/PatientBanner.tsx`, and all 12 screens under `src/screens/`. Read-only audit — no implementation files were modified. Contrast ratios below were computed with the standard WCAG relative-luminance formula against the literal hex values in `src/styles/tokens.css`; the script and raw numbers are reproducible from the token file alone.

Every screen has exactly one `<h1>` and no skipped heading levels (including per-workspace `h2`→`h3` nesting inside `RequirementsScreen.tsx`) — verified across all 12 screens, so heading order is **not** listed as a finding below.

---

## Blocker

### B1 — The global focus ring is invisible on every light surface in the app
**Files:** `src/styles/tokens.css:105` (`--focus-ring: 0 0 0 3px var(--teal-300)`), `src/styles/base.css:45` (`:focus-visible { outline:none; box-shadow: var(--focus-ring); }`), and every component-level `:focus-visible` override that reuses the same token — `screens/bill.css:38`, `screens/intake.css:90`, `screens/req.css:192,414,540`, `screens/sched.css:242-243`, `screens/today.css:134`.

`--teal-300` is `#C4F4F5`. Measured against the app's own backgrounds:

| Background | Token | Ratio | Verdict |
|---|---|---|---|
| `--surface` (cards, drawer, inputs) | `#FFFFFF` | **1.19:1** | Fails (need ≥3:1 for a non-text focus indicator) |
| `--gray-100` (topbar search, chip counts) | `#F5F8F9` | **1.12:1** | Fails |
| `--canvas` (page background) | `#F7FEFF` | ~1.15:1 | Fails |
| `--sidebar-bg` / `--teal-600` (dark sidebar & Requirements rail) | `#004142` | **9.60:1** | Passes |

Because `:focus-visible` is a single global rule and almost every surface in the app is white or near-white (cards, the topbar, all form fields, every table, every tab strip, the command palette, the drawer), **the keyboard focus indicator is effectively invisible almost everywhere it's needed**, and only visible in the one place (the dark sidebar / Requirements rail) that the task brief suspected would be the problem. The only components that add a second cue are form inputs, where `.field-input:focus-within` and `.sched-field input/select:focus-visible` also flip the border to `--teal-400` (`#06A6AB`, ~2.9–3.0:1 against white/canvas — borderline on its own but at least present); every button, tab, table row, nav link, and card has *only* the pale ring.

**Fix:** change `--focus-ring`'s color (not just its geometry) to something that clears 3:1 against both white and `--teal-600` — e.g. a two-layer ring (`0 0 0 2px var(--surface), 0 0 0 4px var(--ink-strong)`) or a token that's redefined per-surface (`--focus-ring` normally dark, overridden to the current pale value only inside `.shell-sidebar` / `.req-rail`). This is a one-token fix that repairs every focusable element in the app simultaneously.

### B2 — `Drawer` has no focus trap, no Escape, and no focus restoration
**File:** `src/ui/index.tsx:133-154`. Used by 8 of 12 screens (`BillingScreen`, `OrdersScreen`, `ReferralIntakeScreen`, `ScheduleScreen`, `QualityScreen`, `ReportsScreen`, `RequirementsScreen`, plus assessment panels in `PatientChartScreen`/`ClinicalScreen`).

The component renders `role="dialog" aria-modal="true"` but implements none of the behavior that makes a dialog modal:
- No effect moves focus into the drawer when it opens (focus stays wherever it was — typically the row/card that triggered it).
- No `Escape` keydown handler; the only way to close is to click the visible `×` button or the scrim.
- No focus trap: `Tab`/`Shift+Tab` walk straight through the drawer's edge into the sidebar, topbar, and page content behind the scrim, because nothing marks that content `inert` or `aria-hidden`.
- No focus restoration to the triggering element on close.

`aria-modal="true"` on an element that doesn't actually trap focus is worse than omitting it: assistive technology that honors the attribute will hide the rest of the page from its accessibility tree while sighted keyboard users can still freely tab into that "hidden" content, producing a confusing mismatch between what's announced and what's reachable. Concretely reproducible: open any drawer, press `Tab` repeatedly — focus walks into the shell sidebar nav; press `Escape` — nothing happens.

**Fix:** on open, focus the drawer's first focusable element (or the close button); add a document-level `keydown` handler for `Escape` → `onClose`; trap `Tab` within the drawer's focusable set (or apply `inert` to `#root`'s other children while open); store and restore focus to the trigger element in a `useRef` on close.

### B3 — Command palette shares the same gaps as the Drawer
**Files:** `src/shell/CommandPalette.tsx:64-105`, `src/shell/AppShell.tsx:130-134`.

`Escape` is only wired to the search `<input>`'s own `onKeyDown` (line 74-79) — once focus moves to a result `<button>` (`cp-row`, which are real, independently tabbable buttons), `Escape` no longer closes the palette. There is no focus trap (`Tab` from the last result walks into the page behind the scrim, which is only dismissed by a `mousedown` listener — mouse-only). Nothing restores focus to the "Search" button (`AppShell.tsx:130`) that opened it.

**Fix:** same pattern as B2 — trap Tab within `.cp`, listen for `Escape` at the container level (not just the input), restore focus to the search button in `onClose`.

---

## Major

### M1 — `StatusChip`/`chip-warn` warning text fails AA contrast
**Files:** `src/styles/tokens.css:110,112`, `src/ui/index.tsx:71` (`StatusChip` warn tone), `src/styles/base.css:167` (`.chip-warn`).

`--status-warn: #B58D00` on `--status-warn-bg` (`--yellow-100`, `#FFF9E5`) measures **2.94:1** — well under the 4.5:1 required for this ~11.5px chip text. This is the app's most common "needs attention" indicator (billing holds, orders due-soon, QAPI blockers), so the failure is high-visibility, not an edge case. The code comment on the token ("readable warning ink derived from yellow family") is aspirational, not measured.

Two related pairs are also marginal AA fails, same class of problem:
- `.chip-good` / `StatusChip` good tone: `--green-300 #00854D` on `--green-100 #E5F4EE` = **4.15:1** (need 4.5).
- `.chip-neutral` / `StatusChip` neutral tone: `--gray-400 #74767A` on `--gray-100 #F5F8F9` = **4.26:1** (need 4.5).

**Fix:** darken `--status-warn` (or lighten/desaturate its background) until ≥4.5:1; nudge `--green-300` and the neutral chip's gray a shade further from their backgrounds. `.chip-bad` (red-300 on red-100 = 4.51:1) already just clears the bar — use it as the calibration target.

### M2 — `gray-300` used as real body text, contradicting the token's own contract
**File:** `src/screens/today.css:153` (`.queue-row.is-done .queue-detail { color: var(--gray-300); }`); text rendered at `src/screens/TodayScreen.tsx:151`.

`tokens.css:32` documents `--gray-300` as "input borders, placeholder — **never body text**." This one rule breaks that contract: when a "Next best action" is checked off, its detail line (`<span className="queue-detail">{a.detail}</span>`) is recolored to `--gray-300` (`#D4D9DA`), which measures **1.42:1** against the white card — the text becomes essentially unreadable, not just de-emphasized. (Every other `--gray-300` usage in the codebase is correctly an icon or border color.)

**Fix:** use `--ink-soft`/`--gray-400` (already used for the adjacent strikethrough title) instead — that's what "de-emphasized but still legible" looks like elsewhere in the app.

### M3 — `ProgressBar` exposes `role="progressbar"` with no accessible name
**File:** `src/ui/index.tsx:37-43`.

```
<div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
```

There is no `label` prop, no `aria-label`, no `aria-labelledby` — at any of its ~7 call sites (`PatientsScreen.tsx:187` episode progress, `PatientChartScreen.tsx:448,468` assessment/section completion, `QualityScreen.tsx:155` record-integrity bar, `RequirementsScreen.tsx:344,359` planning bars, plus every `StatCard` `meter`). A screen reader announces only "43% progress bar" with no indication of *what* is 43% complete — and when several appear in the same table/list (one per patient row in `PatientsScreen`), they are indistinguishable from one another by name. Contrast with `ProgressRing` in the same file (`index.tsx:45-63`), which already accepts a `label` prop and renders `role="img" aria-label={label ?? `${pct}%`}` — and is used correctly with a real label at `PatientChartScreen.tsx:212`.

**Fix:** add an optional `label` prop to `ProgressBar` that sets `aria-label`, and pass one at every call site (e.g. `"Episode day 12 of 60"`, `"OASIS-E2 assessment 82% complete"`).

### M4 — Inconsistent clickable-row semantics, plus a keyboard double-activation bug
**Files:** `src/screens/BillingScreen.tsx:166-183`, `src/screens/OrdersScreen.tsx:199-236`, `src/screens/PatientsScreen.tsx:155-167`.

All three screens implement a clickable `<tr>` with `tabIndex={0}` and an `onKeyDown` that handles `Enter`/`Space` — good, this is the right base pattern (no bare clickable `<div>`s were found anywhere in the app). But:

1. **Inconsistent role.** `OrdersScreen.tsx:203` and `PatientsScreen.tsx:159` both add `role="button"`; `BillingScreen.tsx:166-177` does not. The identical interaction pattern is announced differently by a screen reader depending which screen you're on (a plain "row" on Billing vs. a "button" elsewhere).
2. **Double-activation on keyboard.** Both the Billing and Orders rows contain their own nested real `<button>` in a cell (`bill-patient` at `BillingScreen.tsx:180`, `ord-patient-cell` at `OrdersScreen.tsx:226-236`) whose `onClick` calls `e.stopPropagation()` to avoid also opening the row's drawer. That guard only covers the **click** event. The row's `onKeyDown` never checks `e.target === e.currentTarget`, so when a keyboard user presses `Enter` while focus is on the *inner* button, the keydown still bubbles to the row handler and fires the row's own action (`openDrawer`/`openOrder`) **in addition to** the inner button's `navigate()` — a double-navigation race that a mouse user pressing the same button never triggers. Try it: `Tab` to a patient name inside a Billing claims row, press `Enter` — both the claim drawer and the patient-chart navigation fire.

**Fix:** add `role="button"` to the Billing row for consistency; guard every row `onKeyDown` with `if (e.target !== e.currentTarget) return;` (or stop propagation of the keydown from the nested buttons too).

### M5 — Avatar initials fail contrast on 3 of 5 tone colors (and the same fill color fails elsewhere it's reused)
**File:** `src/styles/base.css:231-250`.

White initials text (`color:#fff`) on each `.avatar-*` background, measured (initials are 10–17px bold, below the "large text" contrast exemption):

| Tone | Background | Ratio | Verdict |
|---|---|---|---|
| `avatar-teal` | `--teal-500 #00797D` | 5.21:1 | Pass |
| `avatar-apricot` | `--orange-400 #E56E2E` | **3.18:1** | Fail |
| `avatar-plum` | `#8A5A83` (untokenized) | 5.43:1 | Pass |
| `avatar-sage` | `#6E8B6B` (untokenized) | **3.77:1** | Fail |
| `avatar-sand` | `#B08D57` (untokenized) | **3.09:1** | Fail |

`--orange-400` specifically is a recurring "fails as a text-bearing fill" color, not a one-off: the same token is reused with white text for the active sidebar nav-item count (`shell.css:79`, 3.18:1) and the active Requirements-rail item count (`req.css:125`, 3.18:1).

**Fix:** either darken these three tones for text-bearing use (or swap to `--orange-500`/`--teal-600`-class darks for badge fills specifically), or move the initials/badge text to a dark ink color instead of white on the light tones. Also promote `avatar-plum`/`avatar-sage`/`avatar-sand` from hardcoded hex to real tokens in `tokens.css` so future contrast checks (and this one) can be automated against the token file instead of hunting hex in `base.css`.

### M6 — `--sidebar-ink-faint` fails contrast for real (non-decorative) text
**File:** `src/styles/tokens.css:84` (`--sidebar-ink-faint: rgba(255,255,255,0.42)`), used at `src/shell/shell.css:36` (`.shell-nav-label`, the "WORKSPACE / CARE DELIVERY / OPERATIONS" group headers, 10px) and `src/screens/req.css:69,107` (`.req-rail-label`, `.req-rail-item-sub`, 10–10.5px).

Blended against `--sidebar-bg` (`--teal-600 #004142`), the 42%-white text measures **3.31:1** — under the 4.5:1 required for normal-size text (this is not decorative or large text; it's real, if secondary, label copy). `--sidebar-ink-dim` (64% white, used for nav-item labels themselves) measures 5.64:1 and is fine — only the "faint" step fails.

**Fix:** raise `--sidebar-ink-faint`'s alpha (or swap it for a light-teal solid, e.g. `--teal-200`, on the dark panel) until it clears 4.5:1.

---

## Moderate

### N1 — Tab/tablist components implement no keyboard arrow-key navigation
**Files:** `src/ui/index.tsx:89-110` (`Tabs`), `src/shell/AppShell.tsx:137-149` and `src/shell/DocShell.tsx:27-39` (both `mode-switch`), `src/screens/RequirementsScreen.tsx:101-114` (`.req-chip-strip`).

All four set `role="tablist"` / `role="tab"` / `aria-selected`, matching the visual "tabs" affordance, but none implement the WAI-ARIA Tabs authoring-practice keyboard model: `ArrowLeft`/`ArrowRight` (and `Home`/`End`) should move both focus and selection among tabs, typically with a roving `tabindex` (only the selected tab is a `Tab`-stop). Here every tab is instead an independently `Tab`-focusable `<button>` — basic keyboard use (Tab to it, Enter/Space to activate) still works, but arrow keys do nothing, which will surprise both screen-reader users and sighted keyboard users who know the standard pattern. None of the four also pair their content region with `role="tabpanel"`/`aria-labelledby`.

**Fix:** add one shared keyboard handler (arrow keys move focus + call `onChange`) and reuse it across all four tab-like components; consider consolidating `mode-switch` and `.req-chip-strip` to reuse the `Tabs` component instead of re-implementing the pattern three times.

### N2 — Notifications popover has no keyboard dismissal path
**File:** `src/shell/AppShell.tsx:155-176`.

The bell popover opens on click/Enter and closes only via a `document` `mousedown` listener that checks whether the click landed outside `bellRef` (`AppShell.tsx:70-75`) — there is no `Escape` handler, and none of the popover's rows (`popover-row`, plain `<div>`s) are focusable. A keyboard-only user who opens the popover has no keyboard-driven way to close it short of tabbing to some other control and leaving it open behind the new focus. It's also marked `role="dialog"` with no `aria-modal` and no focus moved inside it, so AT gets an unexpected, effectively-inert "dialog" landmark.

**Fix:** add `Escape` → close; either move focus into the popover on open or reconsider `role="dialog"` in favor of a simpler disclosure pattern (`aria-expanded` on the toggle button + `role="region"`) since nothing here is actually modal.

### N3 — No `prefers-reduced-motion` handling anywhere
Confirmed zero matches for `prefers-reduced-motion` in the codebase. `Drawer`'s slide/fade keyframes (`ui.css:169-170`, 160–200ms), the command-palette scrim, and every hover/active `transition` in `base.css`/`ui.css`/`shell.css` run unconditionally regardless of the OS-level reduced-motion preference. Individually subtle (short, non-parallax transitions), but the task brief explicitly calls this out and it's a straightforward, one-time fix.

**Fix:** wrap animation/transition durations in `@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; } }` (or a more targeted override on the specific keyframes).

### N4 — No route-change announcement: static document title, no focus movement
**Files:** `index.html:8`, `src/App.tsx` (12+ routes, `HashRouter`).

`<title>` is set once (`"Care Indeed · Home Health EHR"`) and never updated per route; nothing moves focus to the new screen's `<h1>`/`<main>` after navigating via a sidebar link, a patient/claim/order row, or a command-palette result (confirmed: no `document.title` assignment anywhere in `src`). For a single-page app with this many distinct "pages," screen-reader users get no confirmation that navigation succeeded beyond whatever control happened to already have focus.

**Fix:** on route change, set `document.title` to `"<Screen name> · Care Indeed"` and move focus to the screen's `main`/`h1` (a small shared hook off `useLocation()` in `AppShell`/`DocShell` covers every screen at once).

---

## Minor / notes

- **N5 — Table header semantics inconsistent.** `BusinessPlanScreen.tsx` correctly uses `<th scope="col">`/`<th scope="row">` throughout (e.g. lines 298-306). `PatientsScreen.tsx:140-146`, `OrdersScreen.tsx`, `BillingScreen.tsx`, and `PatientChartScreen.tsx`'s tables all use bare `<th>` with no `scope`. Simple single-header-row tables are usually inferred correctly by AT, but worth normalizing since one screen already has the right pattern to copy.
- **N6 — `!important` tone override breaks `StatusChip`'s color contract.** `src/screens/req.css:146-149` (`.req-rail-gate .status-chip { color: #FFD9C7 !important; background: rgba(255,255,255,.14) !important; }`) forces one fixed color for *any* `StatusChip` rendered inside that container regardless of its `tone` prop. Contrast today is fine (measured 5.82:1 against the actual blended background), but the override is a landmine: reuse `.req-rail-gate` with a different tone later and the color silently stays frozen. Prefer a `StatusChip` variant/prop for "on-dark-panel" instead of an external `!important` override.
- **N7 — Dead icon button.** `src/shell/AppShell.tsx:151-153` — the "Messages" icon button has a correct `aria-label="Messages"` but no `onClick` at all; it's focusable and looks actionable but does nothing when activated. Low impact given prototype scope, but worth a visible disabled state so it doesn't read as broken.

## What's already right (confirmed, not re-litigated above)

- No clickable `<div>`s anywhere in the app — every interactive surface is a real `<button>`/`<a>`/input, or a `<tr>` with `tabIndex`+keyboard handling (see M4 for the one nested-interactive nuance).
- Every `scrollIntoView`/`scrollTo` call in the codebase correctly omits `behavior:'smooth'` (`BusinessPlanScreen.tsx:36`, `ScheduleScreen.tsx:123`) — confirmed, matches the known "smooth scroll silently no-ops here" trap.
- Icon-only buttons consistently carry `aria-label` (`Drawer`'s close button, `AppShell`'s bell/search/messages/user buttons, `PatientChartScreen`'s expand/collapse toggle) and decorative icons are consistently marked `aria-hidden`.
- `ProgressRing` and `Sparkline` both already support a text alternative (`role="img" aria-label=...`) and are used with a real label at their call sites (e.g. `PatientChartScreen.tsx:212`, `ReportsScreen.tsx:208,226,251,280`).
- `<html lang="en">` is set (`index.html:2`).
- Heading order is clean everywhere: exactly one `<h1>` per screen, and `RequirementsScreen`'s per-workspace `h3`s are always nested under that workspace's own `h2` (`WsHead`, `RequirementsScreen.tsx:145-152`) — no skipped levels.
- Status is never color-alone: `StatusChip` and every `.chip-*` pairing render an icon plus a text label (contrast defects above are about the pairing's contrast, not about color-only signaling).

---

## Accessibility rules for contributors

1. Never bind `onClick` to a `<div>` or `<span>`. Use a real `<button>`/`<a>`, or — only for full table rows — `tabIndex={0}` + `role="button"` + an `onKeyDown` that handles both `Enter` and `Space` and calls `e.preventDefault()`.
2. If a clickable row/card contains its own nested interactive element (a button/link inside a cell), guard the row's `onKeyDown` (and `onClick`) with `if (e.target !== e.currentTarget) return;` so activating the inner control doesn't also fire the row's action.
3. Every icon-only control needs `aria-label`; every purely decorative icon needs `aria-hidden`. Don't add `aria-label` to icons that sit next to visible text — that's redundant.
4. Any `role="progressbar"` must carry an `aria-label` (or `aria-labelledby`) describing *what* is progressing, not just its value — pass a `label` prop, don't rely on `aria-valuenow` alone.
5. Any modal-style overlay (`Drawer`, popovers, the command palette) must: move focus inside itself on open, trap `Tab`/`Shift+Tab` within its own focusable elements, close on `Escape`, and restore focus to the triggering element on close. Don't set `aria-modal="true"` unless all of that is actually true.
6. Reuse the shared `Tabs` component for anything that looks like tabs — don't hand-roll another `role="tablist"`. If you must, implement `ArrowLeft`/`ArrowRight`/`Home`/`End` keyboard navigation, not just `role`/`aria-selected`.
7. Never use `--gray-300` (or the sentiment `-300` steps: `--green-300`/`--yellow-300`/`--red-300`) as a text color. They exist for icons, borders, and placeholders only — pick `--ink`/`--ink-soft`/`--ink-strong` for text, always.
8. Before shipping a new chip/badge/status color pairing, compute its contrast ratio (foreground vs. its actual background, not the token's neighbor) and require ≥4.5:1 for normal text, ≥3:1 for large/bold ≥18.66px text or non-text UI components (borders, focus rings, icons).
9. Any focus indicator must hit ≥3:1 against the surface behind it. Because `--surface`/`--canvas`/`--gray-100` are all near-white, `--teal-300` alone does not qualify — check new components against light *and* dark backgrounds before trusting the shared `--focus-ring` token, and flag it if you find a spot where it isn't visible.
10. `Escape` must close anything that opened with a click/Enter and visually covers other content (drawers, popovers, the command palette) — wire it at the container level, not only on one inner input.
11. Never use `behavior: 'smooth'` for `scrollIntoView`/`scrollTo` in this app — it silently no-ops on the nested scroll containers here. Always scroll instantly.
12. Wrap new CSS animations/transitions so they respect `@media (prefers-reduced-motion: reduce)` — don't assume short durations are automatically fine.
13. On every route change, update `document.title` and move focus to the new screen's `<main>`/`<h1>` — don't leave focus wherever the triggering control was.
14. Give every `<th>` an explicit `scope="col"` or `scope="row"` — copy the pattern already used correctly in `BusinessPlanScreen.tsx`.
15. Don't hardcode a raw hex color in a screen/shell stylesheet. Every color must come from a `var(--token)` in `tokens.css` — if the color you need doesn't have a token yet, add one there (with a comment) instead of inlining hex, so its contrast can be tracked in one place.
