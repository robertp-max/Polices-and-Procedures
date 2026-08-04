# Component & Convention Inventory — Care Indeed Home Health EHR Prototype

Read this before building any new screen. It is a precise, code-grounded map of every
token, utility class, shared component, shell, and recurring layout pattern already in
this codebase — plus the gaps you'll hit if you don't reuse them. Every claim below was
verified against the source on 2026-08-03; file:line citations point at
`apps/ehr-prototype/src/...` unless stated otherwise.

Companion doc: `docs/CI-DESIGN-SYSTEM-SPEC.md` is the raw extraction from the 10-board CI
Design System PDF (source of truth for *why* a value was chosen). This document is the
*code-level* reference — what's actually implemented and how to call it.

---

## 0. Orientation

- `src/styles/tokens.css` — all design tokens (CSS custom properties on `:root`).
- `src/styles/base.css` — reset + shared utility classes (buttons, chips, cards, tables, fields, popovers, avatars, screen layout helpers).
- `src/ui/index.tsx` + `src/ui/ui.css` — the shared component kit (9 components + 1 type).
- `src/components/PatientBanner.tsx` + `patient-banner.css` — the one non-kit shared component (patient identity banner).
- `src/shell/AppShell.tsx` / `DocShell.tsx` / `CommandPalette.tsx` + their CSS — the two page shells and the ⌘K palette.
- `src/screens/*.tsx` + one CSS file each — 12 screens, each with its own class prefix (see §1 of the parent task / §6 below).

Every color in every file below resolves to a `var(--token)` with exactly the exceptions
catalogued in §7.1. There is no Tailwind and no CSS-in-JS.

---

## 1. Design tokens — `src/styles/tokens.css` (123 lines)

All tokens live on `:root`. They come in two tiers: **primitives** (raw ramp values, named
`--<hue>-<step>`) and **role aliases** (semantic names that point at a primitive, or in a
few cases hold a hand-picked literal). Always consume role aliases in screen/shell CSS;
reach for a primitive only when you need a specific ramp step a role alias doesn't expose
(e.g. `var(--green-300)` for a custom `ProgressRing` color, as `PatientChartScreen.tsx:211`
does).

### 1.1 Brand ramps (primitives)

| Token | Value | Role / usage note |
|---|---|---|
| `--orange-600` | `#421700` | darkest orange; hover-state ink for `--accent-hover` |
| `--orange-500` | `#C74601` | **primary CTA** — light backgrounds only (tokens.css:11) |
| `--orange-400` | `#E56E2E` | mid orange — icon tints, secondary accents |
| `--orange-300` | `#FFD5BF` | pressed-state fill; also `--line-brand` |
| `--orange-200` | `#FFEEE5` | CTA/highlight tint **on dark backgrounds**, and light-mode brand tint fill |
| `--orange-100` | `#FFFAF7` | faintest orange wash (rare) |
| `--teal-600` | `#004142` | darkest teal; sidebar background, link-hover ink |
| `--teal-500` | `#00797D` | **secondary CTA** / key text where orange is absent |
| `--teal-400` | `#06A6AB` | mid teal — default chart/progress color, focus-adjacent accents. Carries a contrast WARN per the dataviz audit — always pair with a direct label, never rely on hue alone |
| `--teal-300` | `#C4F4F5` | focus-ring color source; light teal borders |
| `--teal-200` | `#E5FEFF` | light teal fills (chip-teal bg, hover states) |
| `--teal-100` | `#F7FEFF` | `--canvas` (app background) and `--surface-teal-tint` |

### 1.2 Neutrals (primitives, warm hue 21 — but re-struck cool on the three light steps)

| Token | Value | Role / usage note |
|---|---|---|
| `--gray-600` | `#1F1C1B` | headings → `--ink-strong` |
| `--gray-500` | `#524D4B` | body text → `--ink` |
| `--gray-400` | `#74767A` | secondary text → `--ink-soft`; also `--viz-other` |
| `--gray-300` | `#D4D9DA` | input borders, placeholder text — **never body text** (tokens.css:32) → `--line-strong` |
| `--gray-200` | `#E4E9EA` | hairlines, subtle accents → `--line`, `--viz-track` |
| `--gray-100` | `#F5F8F9` | subtle surfaces (hover fills, sunken panels) |

Design note baked into the file (tokens.css:29-31): the DS's native light neutrals are
warm (hue 21), which read as an orange cast on the teal canvas, so `gray-300/200/100`
were deliberately re-struck cool. Brand warmth is reserved for the orange ramp only.

### 1.3 Sentiment (primitives — alerts/status only; the 300-step is never text)

| Token | Value | Role |
|---|---|---|
| `--green-300` / `-200` / `-100` | `#00854D` / `#73C5A3` / `#E5F4EE` | success ramp → `--status-good`, `--status-good-bg` |
| `--yellow-300` / `-200` / `-100` | `#FFC700` / `#FFE073` / `#FFF9E5` | warning ramp → `--status-warn-icon`, `--status-warn-bg` (note: `--status-warn` the *text* color is NOT yellow-300, see below) |
| `--red-300` / `-200` / `-100` | `#D70101` / `#E97474` / `#FBE6E6` | error ramp → `--status-bad`, `--status-bad-bg` |

### 1.4 Typography, radius, shadow (primitives)

- `--font-display: 'Montserrat', 'Segoe UI', sans-serif` — headings, subheadings, **all numeric values** (stat figures, KPIs, tabular data) per the numbers convention.
- `--font-body: 'Roboto', 'Segoe UI', sans-serif` — body copy, UI chrome.
- Radius scale: `--r-xs 8px`, `--r-sm 12px`, `--r-md 16px`, `--r-lg 24px`, `--r-xl 32px`, `--r-pill 999px`. In practice screens use `xs` (icon tiles, small chips), `sm` (cards-within-cards, form controls), `md` (top-level `.card`, drawer, columns) almost exclusively; `lg`/`xl` are defined but not exercised by any screen today — available headroom, not dead code.
- Elevation: `--shadow-1` (resting card), `--shadow-2` (hover-lift), `--shadow-3` (unused by any screen today), `--shadow-pop` (popover/drawer/command-palette). All are warm-tinted `rgba(0,33,34,…)` — never pure black.

### 1.5 Role aliases — surfaces

| Token | Points at | Note |
|---|---|---|
| `--canvas` | `var(--teal-100)` | app/body background |
| `--surface` | literal `#FFFFFF` | cards — **hand-typed literal, not aliased to a gray step** |
| `--surface-sunken` | literal `#FFFFFF` | inner panels; same value as `--surface` today — panels are separated by hairlines (`--line`), not by a fill tint (tokens.css:72-73) |
| `--surface-brand-tint` | `var(--orange-200)` | orange-tinted panel fill |
| `--surface-teal-tint` | `var(--teal-100)` | teal-tinted panel fill |

### 1.6 Role aliases — sidebar (dark teal panel)

`--sidebar-bg` (`teal-600`), `--sidebar-bg-raised` (`rgba(255,255,255,.06)`),
`--sidebar-active` (`rgba(255,255,255,.10)`), `--sidebar-ink` (`#FFFFFF` literal),
`--sidebar-ink-dim` (`rgba(255,255,255,.64)`), `--sidebar-ink-faint`
(`rgba(255,255,255,.42)`), `--sidebar-line` (`rgba(255,255,255,.10)`). These are consumed
by both `AppShell`'s sidebar **and** `req.css`'s `.req-rail` (Requirements screen's own
dark side-nav) — the only two places in the app with a dark surface. Reuse this exact set
if you ever add a third dark panel; do not invent new sidebar-ink rgba values.

### 1.7 Role aliases — ink, lines, interactive, status

- Ink: `--ink-strong` (gray-600), `--ink` (gray-500), `--ink-soft` (gray-400), `--ink-inverse` (`#FFFFFF` literal).
- Lines: `--line` (gray-200), `--line-strong` (gray-300), `--line-brand` (orange-300).
- Interactive: `--accent` (orange-500), `--accent-hover` (orange-600), `--accent-pressed` (orange-300), `--accent-quiet` (orange-200), `--link` (teal-500), `--link-hover` (teal-600), `--focus-ring` = `0 0 0 3px var(--teal-300)` (a full box-shadow value, not a color — apply it directly to `box-shadow`, see base.css:45).
- Status (icons/borders use the 300 step; fills use the 100 step; **text stays gray** except warn):
  - `--status-good` = `var(--green-300)`, bg `var(--green-100)`.
  - `--status-warn` = **literal `#B58D00`**, a hand-picked readable ink derived from the yellow family — **not** `var(--yellow-300)`, which is too light/saturated for text (tokens.css:110). `--status-warn-icon` = `var(--yellow-300)` (icon/border only). `--status-warn-bg` = `var(--yellow-100)`.
  - `--status-bad` = `var(--red-300)`, bg `var(--red-100)`.
  - Consequence for API authors: anything that maps a UI "tone" straight to a sentiment-ramp step (see `StatCard`'s `accent` prop, §2.1) is bypassing this warn/warn-icon split — fine for a decorative left-bar or icon, wrong if ever used for text.

### 1.8 Data-viz

`--viz-1` (teal-400), `--viz-2` (orange-400), `--viz-other` (gray-400, "fold >2 series into
gray Other or facet"), `--viz-track` (gray-200, used by both `ProgressBar`'s and
`ProgressRing`'s track). Sequential scales should ramp through teal. `--viz-1` fails a
contrast check on its own — every consumer (`Sparkline`, chart legends) must direct-label
the mark; never rely on the hue to carry meaning.

---

## 2. Base utilities — `src/styles/base.css` (312 lines)

Loaded once globally (imported by the app entry). Everything here is a plain class, no
build-time class generation.

### 2.1 Buttons

Base `.btn` (base.css:57-73): inline-flex, 38px tall, full pill radius, 13.5px/500 label,
8px icon gap, `transform: translateY(0.5px)` on `:active`, `opacity:.45` + `cursor:not-allowed` on `:disabled`. Compose with exactly one variant + optionally one size class:

| Variant class | Look | Use for |
|---|---|---|
| `.btn-primary` | orange fill, white text, dual drop-shadow | the one primary action per view |
| `.btn-teal` | teal fill, white text | secondary CTA when orange is already used elsewhere on screen (e.g. DocShell's "Back to the EHR", doc-shell.css consumer) |
| `.btn-secondary` | white fill, `line-strong` border | default secondary action |
| `.btn-outline-accent` | transparent, orange border/text, orange-200 hover fill | lower-emphasis brand action |
| `.btn-ghost` | no border, `--r-xs` radius, gray-100 hover | lowest-emphasis inline action (icon-only toolbar buttons etc.) |
| `.btn-inline` | text-only, teal link color, underline on hover | least prominent per DS — "open walkthrough" style links (`TodayScreen.tsx:91`) |

Sizes: `.btn-sm` (30px/12.5px), `.btn-lg` (44px/14.5px). Default (no size class) is 38px/13.5px. Example real usage:

```tsx
// src/screens/PatientsScreen.tsx:85-92
<button className="btn btn-secondary">
  <Download size={15} strokeWidth={2} aria-hidden />
  Export list
</button>
<button className="btn btn-primary">
  <UserPlus size={15} strokeWidth={2} aria-hidden />
  Add patient
</button>
```

Icon-only button: `.icon-btn` (36px circle, `--ink-soft` → `--ink-strong` + gray-100 fill
on hover) with optional `.icon-btn-badge` (absolute top-right numeric pill, 2px `--surface`
ring so it "punches through" whatever it sits on — see `AppShell.tsx:161-163` for the
notification-bell badge, the only consumer).

### 2.2 Chips / badges

`.chip` base (22px tall pill, 11px/500 label) + exactly one tone class:
`chip-outline`, `chip-brand`, `chip-teal`, `chip-good`, `chip-warn`, `chip-bad`,
`chip-neutral`. These are the raw building block `StatusChip` wraps with an icon — reach
for a bare `.chip` when you need a label-only badge that isn't a status (e.g. payer chips,
`"Prototype"` badge in the top bar) and reach for `StatusChip` (§3.4) whenever the chip
communicates state, so it always carries an icon too.

### 2.3 Cards

`.card` (white, 1px `--line` border, `--r-md`, `--shadow-1`) is the single elevation
primitive everything sits on. `.card-pad` adds 20px padding (compose as `className="card card-pad"`). `.card-title` (15px/500, Montserrat) and `.card-kicker` (10.5px/500, uppercase, letter-spaced, `--ink-soft`) are the two heading styles used inside a card — `.card-kicker` doubles as the label above `StatCard`'s value.

### 2.4 Popover

`.popover` (340px, max-height 420px, `--shadow-pop`) + `.popover-head` / `.popover-row`
(`.is-unread` variant tints teal-100) / `.popover-row-title` / `-detail` / `-when`. The
**only** consumer today is the notification bell (`AppShell.tsx:164-176`) — this is a
reusable recipe, not yet a component; if you need a second popover, copy this markup
rather than inventing new classes.

### 2.5 Avatar

`.avatar` (34px circle, white initials, Montserrat 600) + exactly 5 tone classes:
`avatar-teal` (`var(--teal-500)`), `avatar-apricot` (`var(--orange-400)`), `avatar-plum`
(**raw** `#8A5A83`), `avatar-sage` (**raw** `#6E8B6B`), `avatar-sand` (**raw** `#B08D57`).
Sizes: `.avatar-lg` (52px/17px), `.avatar-sm` (26px/10px). Never construct this by hand —
use the `PatientAvatar` component (§3.6), which is the only thing that knows the
tone-name whitelist and its safe fallback.

### 2.6 Tables

`.table` (border-collapse, uppercase 10.5px letter-spaced `<th>`, 13.5px `<td>`, gray-100
row hover, `.is-clickable` cursor). Always wrap in an `overflow-x: auto` div and give the
`<table>` a `min-width` when columns are numerous — see §6.7 for the exact recipe every
screen uses.

### 2.7 Forms

`.field` / `.field-label` / `.field-input` (40px, `--line-strong` border → `--gray-400` on
hover → `--teal-400` + focus-ring on `:focus-within`) / `.field-help` / `.field.is-error`
(red border + red help text). `.field-input` wraps its `<input>` so a leading icon can sit
inline (see `PatientsScreen.tsx:97-106`, the search box). **This is the only tokenized
form-control recipe in the app** — see §7.4 for the three screens that reimplemented it
under a different name instead of reusing it.

### 2.8 Misc / screen scaffolding

- `.divider` — 1px `--line` hairline.
- `.kicker-row` — flex row, space-between, for a kicker + trailing action.
- `.screen` — the **required outer wrapper** for every routed screen: `display:flex; flex-direction:column; gap:20px`. Every one of the 12 screens' root element carries this class (sometimes combined with a screen-specific modifier, e.g. `"screen bp-screen"` in `BusinessPlanScreen.tsx:40`).
- `.screen-head` / `.screen-title` (22px/30px) / `.screen-sub` (13px, `--ink-soft`) / `.screen-actions` — the standard page header row: title + subtitle on the left, action buttons on the right, wraps on narrow viewports.

---

## 3. Shared UI kit — `src/ui/index.tsx` + `src/ui/ui.css`

Import path is `'../ui'` from any screen (barrel is `src/ui/index.tsx` itself — there is
no separate `index.ts` re-export file). Below, every prop, default, and rendered DOM
shape is taken directly from the source.

### 3.1 `StatusTone`

```ts
export type StatusTone = 'good' | 'warn' | 'bad' | 'neutral' | 'progress'
```
The one shared vocabulary for "how is this thing doing" across the whole app. Used by
`StatusChip` directly; screens also thread it through their own local status→tone maps
(e.g. `RISK_TONE`, `STATUS_TONE`, `VISIT_STATUS_TONE` — every screen defines its own
`Record<DomainStatus, StatusTone>` lookup rather than the kit providing one, see §7.3).

### 3.2 `StatCard`

```ts
function StatCard(props: {
  icon: ReactNode
  kicker: string
  value: ReactNode
  sub: string
  accent?: 'teal' | 'orange' | 'good' | 'warn' | 'bad'   // default 'teal'
  meter?: { pct: number }
})
```
Renders a `.card`-shaded tile (`.stat-card`) with a 3px tinted left rail
(`--stat-accent` CSS var, set inline per the `accent` map: teal→`--teal-400`,
orange→`--orange-400`, good→`--green-300`, warn→`--yellow-300`, bad→`--red-300` —
**note this reads straight off the sentiment ramp, not the `--status-*` role aliases**),
an icon + `.card-kicker` head row, a large Montserrat value (28px, tabular-nums), an
optional embedded `ProgressBar` when `meter` is passed, and a `.stat-card-sub` caption.
No built-in click/link behavior — it's presentational only.

Real usage (`TodayScreen.tsx:98-127`, one of five `StatCard`-consuming screens: Today,
Referral&Intake, Orders, Quality, Billing, and Requirements):
```tsx
<StatCard
  icon={<ClipboardCheck size={16} strokeWidth={1.75} />}
  kicker="SOC completion"
  value={<>{elena.socCompletion}<small>%</small></>}
  sub="7 items need review before signature"
  accent="orange"
  meter={{ pct: elena.socCompletion }}
/>
```
Wrap 4 of these in the `.xxx-stats` grid recipe (§6.1) — never fewer than 4 is the
established norm, though nothing enforces it.

### 3.3 `ProgressBar` / `ProgressRing`

```ts
function ProgressBar({ pct, color }: { pct: number; color?: string })
function ProgressRing({ pct, size = 64, stroke = 6, color = 'var(--teal-400)', label }: {
  pct: number; size?: number; stroke?: number; color?: string; label?: string
})
```
`ProgressBar` renders `role="progressbar"` with `aria-valuenow/min/max` wired from `pct`
— a real accessible progress meter. Its `color` default is *not* a JS default parameter;
if omitted, the inline style simply never sets `--progress-color`, and CSS's own fallback
(`var(--progress-color, var(--teal-400))`, ui.css:52) supplies teal. `ProgressRing`, by
contrast, defaults `color` via a JS default parameter. Functionally identical outcome,
but know the mechanism differs before you assume you can query/override one the same way
as the other.

`ProgressRing` is an accessible `role="img"` span wrapping an SVG track + a rotated
(`-90deg`, so 12 o'clock is the start) colored arc, with the percentage printed in the
middle (`font-size: size * 0.26`). `label` becomes the `aria-label`; if omitted it falls
back to `` `${pct}%` `` — always pass a real label in a clinical context. Only consumer
today: `PatientChartScreen.tsx:207-213`, record-integrity ring:
```tsx
<ProgressRing
  pct={(patient.integrity.passed / patient.integrity.total) * 100}
  size={52}
  stroke={5}
  color="var(--green-300)"
  label={`${patient.integrity.passed} of ${patient.integrity.total} checks passing`}
/>
```

### 3.4 `StatusChip`

```ts
function StatusChip({ tone, children }: { tone: StatusTone; children: ReactNode })
```
The canonical "status is never color-alone" primitive (ui/index.tsx:69-85). Internal
`TONE_STYLE` map fixes bg/fg/icon per tone: `good`→`CheckCircle2`, `warn`→`AlertTriangle`,
`bad`→`XCircle`, `neutral`→`CircleDashed`, `progress`→`Clock3` (all `size=12,
strokeWidth=2`). You cannot render a `StatusChip` without an icon — this is enforced by
the component, not a convention screens have to remember. Always pass the *label text*
that matches the tone (the component does not supply default copy).

### 3.5 `Tabs`

```ts
function Tabs({ items, active, onChange }: {
  items: { key: string; label: string; count?: number }[]
  active: string
  onChange: (key: string) => void
})
```
Renders `role="tablist"` / `role="tab"` buttons with `aria-selected`; a numeric
`.tab-count` badge appears only when `count != null && count > 0`. **Accessibility gap**:
there is no roving-tabindex / arrow-key handling — every tab button is independently
`Tab`-focusable and only `aria-selected` communicates state, which is a partial
implementation of the WAI-ARIA Tabs pattern (arrow-key navigation between tabs is
expected but absent). Used on `OrdersScreen` (counts per status), `PatientChartScreen`
(chart sections), `ClinicalScreen` (worklist filters), and `RequirementsScreen` (domain
filter on the register table) — always controlled from the parent's own `useState`, never
internal state.

### 3.6 `PatientAvatar`

```ts
function PatientAvatar({ first, last, tone, size }: {
  first: string; last: string; tone: string; size?: 'sm' | 'lg'
})
```
Renders `first[0] + last[0]` inside `.avatar avatar-{tone}`. `tone` is validated against
the 5-entry whitelist (`teal/apricot/plum/sage/sand`) and **silently falls back to
`teal`** for anything else — so a typo'd or future tone string never throws, it just
quietly loses its intended color. `size` omitted renders the default 34px.

### 3.7 `EmptyState`

```ts
function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string })
```
Centers icon + Montserrat title + optional plain-text `sub`. **No action slot** — if a
screen wants a "clear filters" or "add new" affordance next to an empty state, it has to
place that button itself outside the component (e.g. `PatientsScreen` puts "Add patient"
in the page header, not attached to its `EmptyState`). Used for zero-result lists
(`PatientsScreen.tsx:130`), and for every "nothing on file yet" chart tab
(`PatientChartScreen.tsx:305,428,437,492,525,571,609` — timeline/plan-of-care/assessments/
visits/orders/medications/documents all use the identical recipe).

### 3.8 `Drawer`

```ts
function Drawer({ open, onClose, title, sub, children }: {
  open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode
})
```
The one shared "detail panel" primitive — a right-edge fixed panel (`min(480px,92vw)`)
over a scrim, `role="dialog" aria-modal="true"`. **Returns `null` outright when `!open`**
(ui/index.tsx:136) rather than toggling a CSS class — three consequences to know before
you build on it:
1. Any local state inside `children` resets every time the drawer reopens (full
   unmount/remount).
2. The CSS has slide-in/fade-in keyframes (`drawer-slide`, `drawer-fade`, ui.css:169-170)
   but **no exit animation** — because the element is removed from the DOM the instant
   `open` flips false, there is no time window for an exit transition to play.
3. There is **no Escape-key handler, no focus trap, and no auto-focus / return-focus
   management** inside `Drawer` itself. Contrast this with `CommandPalette`, which does
   wire `Escape` explicitly (`CommandPalette.tsx:75`). Every screen using `Drawer` today
   only closes it via the scrim click or the header's close button.

Real usage (`OrdersScreen.tsx:278-283`):
```tsx
<Drawer
  open={!!selected}
  onClose={() => setSelected(null)}
  title={selected ? selected.summary : ''}
  sub={selected ? `${CATEGORY_META[selected.category].label} · ${STATUS_META[selected.status].label}` : undefined}
>
  {/* drawer body content */}
</Drawer>
```
Nine of twelve screens use `Drawer` for click-through detail (Orders, Billing,
Referral&Intake, Quality, Clinical, Reports, Requirements, PatientChart, Schedule's "Add
visit" form) — it is the dominant detail/edit affordance in the app, alongside the
clinical-safety rule that anything inside it is "review, don't replace" (no drawer body
anywhere fabricates a completed sign/submit action).

### 3.9 `Sparkline`

```ts
function Sparkline({ points, width = 120, height = 36, color = 'var(--viz-1)', label }: {
  points: number[]; width?: number; height?: number; color?: string; label?: string
})
```
Hand-rolled single-series line chart: min/max-normalizes `points` into an SVG `path`,
draws a highlighted circle marker on the last point, and renders `role="img"
aria-label={label}`. **`label` is optional** — if a caller omits it, the SVG has no
accessible name at all (the visible `.sparkline-label` text next to it is also
caller-supplied and independently optional), which conflicts with the app's own dataviz
rule that `--viz-1` marks must always be direct-labeled. Always pass `label`. Consumers:
`ReportsScreen.tsx:208,226,251,280` and `QualityScreen.tsx:216`.

---

## 4. `PatientBanner` — `src/components/PatientBanner.tsx` + `patient-banner.css`

```ts
function PatientBanner({ patient, cta, compact }: {
  patient: Patient
  cta?: { label: string; to: string }
  compact?: boolean
})
```
Renders a `<section className="pb card">` (`.pb-compact` modifier tightens padding) with
`aria-label="Patient {first} {last}"`. Structure:
- **Identity row** (`.pb-identity`): `PatientAvatar size="lg"` + name (`h2.pb-name`) +
  an episode-status chip chosen by a hardcoded switch on `patient.episode.status`
  (`active`→`chip-teal` "Active episode", `pending-soc`→`chip-brand` "SOC pending",
  `discharge-planned`→`chip-neutral` "Discharge planned") + one chip per
  `patient.flags[]` entry, where **only the literal string `'Fall risk'` gets
  `chip-warn`** — every other flag value (including future ones, e.g. "Recert window")
  renders as `chip-neutral` regardless of actual severity (`PatientBanner.tsx:24-26`).
  This is a hardcoded string match, not a data-driven severity field — a real trap for
  anyone adding a new flag that should visually read as a warning.
- **Meta line** (`.pb-meta`): age · pronouns · MRN · payer, plus a `MapPin`-icon city.
- **Facts strip** (`.pb-facts`, a `--surface-sunken` sub-panel): primary diagnosis;
  allergies (each rendered with a red `ShieldAlert` icon, or the plain string "No known
  allergies" when the array is empty); episode (`CalendarRange` icon, SOC date, "Day X of
  Y").
- **Optional CTA** (`.pb-cta`, `btn btn-primary`): only rendered when `cta` is passed;
  calls `navigate(cta.to)` on click. Used once, on `PatientChartScreen.tsx:169`, gated to
  a single specific patient ID (`id === 'pt-elena'`) — i.e. today only one synthetic
  patient in the whole roster ever shows a banner CTA.

Minimal usage:
```tsx
<PatientBanner
  patient={patient}
  cta={{ label: 'Continue SOC', to: '/patients/pt-elena/assessments' }}
/>
```

---

## 5. Shells

### 5.1 `AppShell` (`src/shell/AppShell.tsx` + `shell.css`, 337 lines)

Renders the persistent clinical chrome: a 256px dark-teal sidebar (216px below
1100px, `shell.css:333-337`) + a main column, as a CSS grid (`.shell`,
`height:100vh; overflow:hidden` — **this element is the only outer scroll boundary in
the clinical app**; a screen must never introduce a second page-level scroller).

- **Sidebar**: logo, a full-width `btn-primary` "New referral" CTA
  (navigates `/intake`), then three `NAV` groups (Workspace / Care delivery /
  Operations) of `NavLink`s with icon + label + optional numeric badge, and a fixed
  "Design prototype · Synthetic data only" footer card. Active-route styling adds a 3px
  orange rail on the left edge (`.shell-nav-item.is-active::before`).
- **Top bar** (`shell-topbar`, 60px): product name + "Prototype" chip; a search button
  that **opens `CommandPalette`** (also triggered globally by ⌘K/Ctrl+K, wired in a
  `useEffect` keydown listener, `AppShell.tsx:52-61`); a 3-way `.mode-switch`
  (Business Plan / Requirements / Prototype) whose active state is derived from
  `location.pathname.startsWith(...)`, not from an explicit route param; a Messages
  icon-button (**no `onClick` — non-functional placeholder**); a notification bell with
  a `.popover` (closes on outside-click via a `mousedown` document listener + ref, and on
  every route change); and a user identity button (**also non-functional — no
  `onClick`**).
- **Synthetic-data ribbon** (`.shell-ribbon`): a permanent orange banner directly under
  the top bar, present on every AppShell route.
- **Content**: `<Outlet/>` inside `<main class="shell-content">` — `overflow-y:auto`,
  `padding:24px`, and **explicitly `scroll-behavior: auto`** (shell.css:228) per the
  app's instant-scroll rule (smooth scrolling silently no-ops here).

**Which routes**: everything except `/business-plan` and `/requirements` (`App.tsx:20-34`
— Today, Patients, Patient chart, Intake, Schedule, Clinical, Orders, Quality, Billing,
Reports).

**What a screen may assume**: it is mounted inside a flex column that already scrolls and
already has 24px of padding; the screen's own root must be `<div className="screen">`
(§2.8) and must not add its own outer scroll container or its own page padding.

### 5.2 `DocShell` (`src/shell/DocShell.tsx` + `doc-shell.css`, 58 lines)

A standalone "document pageview" shell with **no clinical sidebar** — just a top bar (CI
logomark + brand text, the same `.mode-switch`, a synthetic-data chip, and a "Back to the
EHR" teal button that navigates `/today`) and a `<main class="doc-content">` that is the
scroll container (`overflow-y:auto; padding: 36px 28px 72px`).

**CSS contract every consumer must know**: `doc-shell.css:53` centers the screen's root
element automatically — `.doc-content > .screen { max-width: 1040px; margin: 0 auto; }`.
`BusinessPlanScreen` relies on exactly this (a centered reading column). `RequirementsScreen`
**opts out** of it deliberately, because it wants a full-bleed dark side-nav like
`AppShell`'s rather than a centered document:
```css
/* req.css:12-13 */
.doc-content:has(.req-pm) { padding: 0; }
.doc-content > .req-pm { max-width: none; margin: 0; }
```
This `:has()` selector detects the presence of `.req-pm` as a *descendant marker* to
retarget the parent `.doc-content`'s own padding/width rules — a screen-authored opt-out
of its shell's default layout, not a prop or shell API. If you add a third DocShell
screen that also wants full-bleed, copy this exact technique (and remember `:has()` needs
a reasonably modern engine — fine for this Vite/Chromium-era prototype, worth knowing if
you ever need to support something else).

**Which routes**: `/business-plan`, `/requirements` only (`App.tsx:35-38`).

**Important cross-shell gap**: `DocShell` does not mount `CommandPalette` and does not
register the ⌘K listener — so ⌘K only works while inside `AppShell`. A user reading the
Business Plan or Requirements pageview has no palette access at all, even though the
palette's own `DESTINATIONS` list includes both of those routes as jump targets
(`CommandPalette.tsx:20-21`).

### 5.3 `CommandPalette` (`src/shell/CommandPalette.tsx`, 105 lines)

A ⌘K/Ctrl+K modal (mounted once by `AppShell`, controlled by `AppShell`'s own
`paletteOpen` state — the component itself is stateless w.r.t. open/closed). Search
matches patients (name/MRN/dx substring, capped to 6 results when a query is typed, 3
when empty) plus a static `DESTINATIONS` array of every screen. Full keyboard support:
`ArrowUp`/`ArrowDown` move a `cursor` index, `Enter` navigates, **`Escape` explicitly
closes** (`CommandPalette.tsx:75`) — the one dialog in the app that does implement this,
unlike `Drawer`.

---

## 6. Recurring layout patterns across the 12 screens

Every pattern below appears in ≥2 places (or is a strong single-instance candidate worth
copying verbatim). "Copy from" gives the best/most-complete instance to start from.

### 6.1 Stat-strip grid (4-up KPI row)

```css
.xxx-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
@media (max-width: 1280px) { .xxx-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
```
Copy from: `today.css:3-8`. Byte-identical (down to the 1280px breakpoint) in
`intake.css:3-8`, `ord.css:3-8`, `qual.css:3-8`, `bill.css:3-8`. Always holds exactly 4
`StatCard`s. **Drift**: `rep.css:44-49` (`.rep-kpis`) is the same shape but breaks at
1180px instead of 1280px, and `req.css` doesn't use this recipe at all for its own KPI
row (`req-stat-grid`, see §6.8). Five independent copies of one grid rule — a prime
candidate to promote to a `.stat-grid` utility in `base.css` or a `<StatGrid>` wrapper in
the kit.

### 6.2 Two-column content + fixed-width rail

```css
.xxx-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 14px;
  align-items: start;
}
@media (max-width: 1180px) { .xxx-columns { grid-template-columns: 1fr; } }
```
Copy from: `today.css:77-83` (`.today-columns`, main queue + Brad assist rail). Identical
in `qual.css:12-18` (`.qual-columns`, integrity/holds/focus main + `.qual-side` rail).

### 6.3 Kanban column board (two independent implementations)

Copy from: `intake.css:12-90` — `.intake-board` (flex row, `overflow-x:auto`) of
`.intake-column` (`flex: 1 1 250px; min-width:244px; max-width:300px`) each containing an
`.intake-column-body` card stack of `.intake-card` buttons. Real markup:
`ReferralIntakeScreen.tsx:145-199`.

A second, structurally identical but entirely separate implementation exists in
`req.css:430-470` (`.req-kanban` / `.req-kanban-col` / `.req-kanban-card`, the sprint
board on the Requirements screen) — same flex-row/overflow-x-auto/fixed-column shape,
different class names, no shared CSS. If you need a third kanban board, factor one of
these into a shared recipe instead of writing a third copy.

### 6.4 Timeline (dot + connector rail + content)

Three independent implementations of the same idiom:
- `chart.css:121-129` (`.chart-timeline*`) — patient-chart activity timeline.
- `ord.css:103-122` (`.ord-timeline*`) — order status history inside the order drawer.
- `bp.css:476-490` (`.bp-roadmap*`) — business-plan roadmap phases (numbered circle
  instead of a plain dot, otherwise the same shape).

All three share the same skeleton: a flex row per item, a narrow rail column holding a
dot/number + a `flex:1; width:2px` connector line, and a content column with a
`padding-bottom` for vertical rhythm on all but the last item. This is the single
strongest "promote to the kit" candidate in the codebase — a `<Timeline items={...}/>`
component would collapse three CSS files' worth of near-identical rules into one.

### 6.5 Horizontal step/progress stepper (distinct from the timeline above — no connector rail, dots sit inline on a horizontal bar)

- `today.css:34-73` (`.slice-steps`/`.slice-step`/`.slice-dot`/`.slice-bar`) — the
  "vertical slice" SOC-to-signature stepper on the Today dashboard.
- `bp.css:381-386` (`.bp-stepper`/`.bp-step`/`.bp-step-dot`/`.bp-step-bar`) — the AI
  pipeline stepper in the Business Plan.
- `req.css:275-298` (`.req-stepper`/`.req-step`/`.req-step-num`) is a *different* variant
  again — vertical, numbered-circle steps with a description each, closer in spirit to
  §6.4's timeline than to the horizontal dot-bar above. Three bespoke stepper widgets,
  zero shared code.

### 6.6 Filter chip row

Copy from: `pts.css:17-60` (`.pts-chips`/`.pts-chip` + `.is-active` + a trailing
`.pts-chip-count` badge). Single occurrence today (`PatientsScreen.tsx:107-120`) but
fully generic — good candidate for a `<ChipFilterGroup>` kit component if a second screen
needs the same "pill filter row with counts" affordance.

### 6.7 Table + horizontal-scroll wrapper

The universal convention for wide tables:
```html
<div class="xxx-table-wrap"><!-- overflow-x: auto -->
  <table class="table xxx-table"><!-- min-width: Npx --></table>
</div>
```
Copy from: `pts.css:76-80` (min-width 900px) / `ord.css:24-28` (980px) /
`bill.css:22-23` (760px) / `bp.css:446-447` (640px) / `req.css:543`. The page body itself
never scrolls horizontally — only the wrapper does. `min-width` values are content-driven
per table, not tokenized, which is correct (they aren't design decisions).

### 6.8 "N-column small-stat-card" grids — the single biggest duplication in the app

Beyond §6.1's `StatCard`-based strip, there are **at least nine more** independently
coded "grid of small labeled stat tiles" patterns, none sharing code with each other or
with `StatCard`:
- `sched.css:45-58` `.sched-week-stats` (2-col).
- `clin.css:104-134` `.clin-vitals-grid` (5-col → 3-col, vitals mini-tiles).
- `bp.css`: `.bp-stat-grid`/`-grid-3` (227-244), `.bp-quad-grid` (196-210),
  `.bp-posture-row` (160-173), `.bp-org-grid` (494-505), `.bp-funds-grid` (419-432),
  `.bp-adr-grid` (363-377), `.bp-numbered-grid`/`-grid-3` (312-330), `.bp-bbb-grid`
  (344-359), `.bp-assurance-grid` (461-472) — nine near-identical 2/3/4-column
  `var(--surface)` + `1px var(--line)` + `--r-sm` card grids in one file alone.
- `req.css`: `.req-stat-grid` (261, `auto-fit`), `.req-state-grid` (487-493),
  `.req-arch-grid` (335), `.req-charter-flags` (363), `.req-doc-control-grid` (587) — five
  more.
- `rep.css:44-60` `.rep-kpis`/`.rep-kpi`.

None of these reuse `StatCard` even where the shape is identical (kicker + value +
caption) — see the Reports-screen gap in §7.2. This is the top consolidation opportunity
for whoever owns the kit next: a single `<StatGrid columns={n}><StatTile/></StatGrid>`
pair would replace on the order of 15 bespoke CSS blocks.

### 6.9 Responsive auto-fill/auto-fit card grid — inconsistent keyword choice

`today.css:210` (`.visit-strip`) uses `repeat(auto-fill, minmax(210px, 1fr))`.
`req.css:261` (`.req-stat-grid`) uses `repeat(auto-fit, minmax(210px, 1fr))`. Same
intent (a responsive card row), different CSS grid keyword — `auto-fill` leaves empty
trailing tracks when there are few items (cards stay their natural width, gap at the
end), `auto-fit` collapses those tracks so remaining cards stretch to fill the row. Pick
one deliberately per use case; today the choice looks incidental rather than intentional.

### 6.10 Sticky mini-TOC vs. dark side-nav rail — two different "left/right rail" mechanisms, don't conflate them

- **Scrollspy TOC** (`bp.css:568-609` `.bp-toc`/`.bp-toc-inner` (`position: sticky`) +
  `.bp-toc-link.is-active`), driven by an `IntersectionObserver` in the screen itself:
  ```tsx
  // BusinessPlanScreen.tsx:14-37
  const [active, setActive] = useState<string>(bp.TOC_ITEMS[0].id)
  useEffect(() => {
    const sections = bp.TOC_ITEMS.map(t => document.getElementById(t.id)).filter(Boolean)
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting)
      if (visible.length > 0) {
        const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
        setActive(top.target.id)
      }
    }, { rootMargin: '-15% 0px -70% 0px', threshold: [0, 1] })
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: 'start' }) // no `behavior:'smooth'` — instant, per the app's scroll rule
  }
  ```
  This is a **single continuous document** with a floating table of contents that
  highlights whichever section is currently on screen. Only `BusinessPlanScreen` does
  this today.
- **Dark side-nav rail** (`req.css:40-125` `.req-rail`/`.req-rail-item`): a real
  navigation list (switches which "screen-within-a-screen" is rendered, like tabs),
  styled to match `AppShell`'s sidebar language (same `--sidebar-*` tokens, same
  active-item orange rail-mark). This is *routing between distinct views*, not
  scrollspy over one document — visually similar (dark rail, orange active mark) but a
  completely different interaction model from the TOC above. Don't reach for the
  IntersectionObserver approach if what you actually want is `req-rail`'s tab-like
  switch, or vice versa.

### 6.11 Fixed-width left rail (workspace detail panel)

Copy from: `sched.css:17-95` `.sched-rail` (240px fixed, stacks to a full-width row under
900px) — week stats + coverage list next to the main week grid. A simpler cousin of
§6.2's two-column pattern, but the rail comes first (left) and is a self-contained detail
panel rather than a companion/assist panel.

### 6.12 Clickable list row with hover-reveal "go" affordance — duplicated under two prefixes

`today.css:97-157` `.queue-row` and `qual.css:35-77` `.qual-int-row` are the same pattern
implemented twice: a clickable row (checkbox or icon leading edge, title+detail body,
trailing meta) whose "open/navigate" chevron/icon is `opacity:0` at rest and fades in
`on :hover` (`.queue-go`/`.qual-int-go`, both `opacity 130ms ease, transform 130ms ease`).
Good candidate for a shared `<ActionRow>` if a third instance shows up.

### 6.13 Worklist card (title + chips + inline progress + trailing action)

Copy from: `clin.css:11-76` `.clin-card` — clickable patient-identity head row, a chip
row, a text+progress main row, and a trailing action slot. Single occurrence
(`ClinicalScreen`) but a clean, reusable "record row" shape if another worklist screen is
added later.

---

## 7. Gaps, inconsistencies, and traps

Ordered roughly most- to least-consequential for an agent building new screens.

### 7.1 Raw hex color instances (should be `var(--token)`, per the "colors come only from tokens" rule)

Verified by grepping every `.css` file for `#[0-9A-Fa-f]{3,6}` and excluding
`tokens.css` itself (which is expected to hold literals — it *defines* the ramp):

| File | Line | Value | Context |
|---|---|---|---|
| `styles/base.css` | 140 | `#fff` | `.icon-btn-badge` text color |
| `styles/base.css` | 241 | `#fff` | `.avatar` text color |
| `styles/base.css` | 246 | `#8A5A83` | `.avatar-plum` fill — no token exists for this hue |
| `styles/base.css` | 247 | `#6E8B6B` | `.avatar-sage` fill — no token exists |
| `styles/base.css` | 248 | `#B08D57` | `.avatar-sand` fill — no token exists |
| `screens/today.css` | 132 | `#fff` | `.queue-check` checked-state icon color |
| `screens/today.css` | 179 | `#fff` | `.brad-mark` icon color |
| `shell/shell.css` | 186 | `#fff` | `.mode-switch-item.is-active` text color |
| `screens/rep.css` | 36 | `#fff` | `.rep-hero-mark` icon color |
| `screens/req.css` | 125 | `#fff` | `.req-rail-item.is-active .req-rail-badge` text color |
| `screens/req.css` | 148 | `#FFD9C7` | `.req-rail-gate .status-chip` — **deliberate**, commented as "needs its own contrast pairing" for a status chip sitting on the dark rail (req.css:145-149) |

Net: **8 raw `#fff` instances** across `base.css`/`today.css`/`shell.css`/`rep.css`/
`req.css` (all trivially replaceable with `var(--ink-inverse)`, which already exists and
already equals white), **3 non-tokenized brand-adjacent avatar colors** (plum/sage/sand —
all three are in active use in `data/patients.ts`, so they aren't dead code; they simply
never got promoted into `tokens.css`), and **1 deliberate, commented exception**
(`#FFD9C7`). If you add a design-token linter, allowlist only `req.css:148`.

### 7.2 One-off screen CSS that duplicates a kit component's job

- **`ReportsScreen`'s `.rep-kpi`** (`rep.css:51-78`) is structurally the same "icon +
  kicker + big value + caption" shape as `StatCard`, reimplemented from scratch instead
  of reused. `ReportsScreen.tsx` never imports `StatCard` at all — confirmed via source
  (its only kit imports are `Drawer` and `Sparkline`).
- See §6.8 for the much larger version of this problem across `bp.css`/`req.css`/
  `sched.css`/`clin.css` — none of those "stat tile grid" recipes route through
  `StatCard`, even where the visual result is nearly identical.
- See §6.4/§6.5 for the timeline and stepper widgets — three independent
  implementations each, zero shared code, and none live in `src/ui`.

### 7.3 No shared status/tone lookup — every screen reinvents `Record<DomainStatus, StatusTone>`

`StatusTone` (§3.1) is centralized, but the *mapping* from a domain status string (order
status, claim status, visit status, assessment status, integrity-check status, referral
stage...) to a `StatusTone` is redefined locally and independently in nearly every
screen: `STATUS_TONE`/`STATUS_LABEL` (Billing), `VISIT_STATUS_TONE`/`_LABEL` (Today,
Schedule), `RISK_TONE`/`_LABEL` (Patients), `INTEGRITY_TONE`, `ORDER_STATUS`,
`ASSESS_STATUS`, `DOC_STATUS` (all in `PatientChartScreen`), `STATUS_META`
(Orders/`ord.css` consumer), etc. Not a bug — each domain genuinely has different
statuses — but there's no shared naming convention for these lookup objects (some are
`Record<X, StatusTone>`, some are `Record<X, {tone, label}>`), so an agent grepping for
"how do I map a new status to a chip" has to read several different shapes before
picking one. Recommend standardizing on the `{tone, label}` object-map shape (the more
common of the two) if you touch this again.

### 7.4 Form-control styling duplicated instead of reusing `.field-input`

`base.css`'s `.field`/`.field-input` (§2.7) is the one tokenized text-input recipe, and
exactly one screen uses it as intended — `PatientsScreen.tsx:97` (`className="field-input pts-search"`). Two other screens define their own near-identical input styling instead of composing `.field-input`:
- `sched.css:225-243` `.sched-field select/input` — same 40px height, same
  `--line-strong` border, same `--r-sm` radius, same hover/focus-visible treatment as
  `.field-input`, just under a different class name (`ScheduleScreen`'s "Add visit" form).
- `req.css:183-192` `.req-select` and `req.css:529-540` `.req-search` — both a slightly
  shorter 34px variant of the same recipe, again independently defined.

None of these three are wrong-looking (the visual language is consistent because
everyone still points at the same tokens), but there is no single `.field-input`-derived
"select" or "compact input" variant — each screen guessed its own name and duplicated the
rule set instead of extending the shared one.

### 7.5 `today.css` prefix inconsistency (called out as known debt)

Every other screen stylesheet's classes start with its file's own prefix
(`bill.css`→`.bill-`, `bp.css`→`.bp-`, etc. — see the project's established convention
list). `today.css` predates that convention: its classes are `.slice-*`, `.queue-*`, and
`.brad-*` — three different prefixes, none of them `.today-*` — except for `.today-stats`
and `.today-columns`, which *do* follow the convention. So the file is roughly half
migrated. Do not add a fourth prefix to this file; if you touch it, prefer folding new
rules under whichever of the three existing prefixes they conceptually belong to.

### 7.6 `req.css` also reaches outside its own prefix (documented opt-out, not a bug)

`req.css` styles `.doc-content` directly (`req.css:12`) to opt out of `DocShell`'s
centered-column default (§5.2) — the one legitimate, intentional exception to "a
screen's CSS only touches classes under its own prefix."

### 7.7 `Drawer` accessibility gaps (see §3.8 for full detail)

No Escape-to-close, no focus trap, no autofocus/return-focus, and no exit animation
(the component unmounts instantly rather than animating out). Every screen's drawer
content inherits all four gaps since none of them layer on their own handling.

### 7.8 `Tabs` accessibility gap (see §3.5)

Renders the ARIA roles (`tablist`/`tab`/`aria-selected`) but not arrow-key roving focus —
a partial implementation of the WAI-ARIA Tabs pattern.

### 7.9 No loading state anywhere in the app

Grepped for `loading|skeleton|Spinner|isLoading|Suspense` across `src/` — the only hit is
an unrelated string in `data/requirementsSpec.ts`. Every screen reads its data
synchronously from static synthetic arrays (`src/data/*.ts`), so there has never been a
need for a loading affordance — but there is also **no established skeleton/spinner
pattern** in `base.css` or the kit. The first screen that wires up an actual async data
source (e.g. a real API call) will have nothing to copy and will have to invent the
pattern from scratch.

### 7.10 No error state anywhere in the app

Same root cause as §7.9 — all data is guaranteed to exist (it's hardcoded), so no screen
has ever needed a "failed to load" / retry affordance. `EmptyState` (§3.7) is used only
for legitimate zero-result cases (e.g. a filter matching nothing), never for an error
condition, and it has no visual variant (icon tint, etc.) that would distinguish "there's
genuinely nothing here" from "something went wrong."

### 7.11 `PatientAvatar`'s tone whitelist is invisible at the call site

(See §3.6.) Passing any `tone` string outside the 5-entry whitelist silently renders
teal — no TypeScript error (the prop is typed as plain `string`, not a union), no console
warning. An agent copy-pasting a new avatar tone from data will not find out it was
ignored without visually inspecting the page.

### 7.12 `PatientBanner`'s flag-to-severity mapping is a single hardcoded string match

(See §4.) `f === 'Fall risk'` is the only branch that produces `chip-warn`; every other
`flags[]` entry — including ones that arguably deserve visual warning treatment — renders
as `chip-neutral`. If you add a new flag value anywhere in `data/patients.ts` and expect
it to look like a warning, it won't, unless you also edit `PatientBanner.tsx`.

### 7.13 Ad hoc `rgba()` shadows outside the `--shadow-*` token set

A handful of components use a hand-tuned `rgba(...)` box-shadow instead of one of the
four `--shadow-*` tokens: `.btn-primary` (base.css:78, `rgba(66,23,0,.2)` /
`rgba(199,70,1,.22)`), `.brad-mark` (today.css:180, `rgba(0,121,125,.3)`),
`.rep-hero-mark` (rep.css:37, same teal rgba), `.mode-switch-item.is-active`
(shell.css:187, `rgba(0,65,66,.35)`). These are all warm/teal-tinted like the token
shadows (consistent *intent*), just not expressed through a shared variable — low-risk,
but worth knowing before you assume `--shadow-1/2/3/pop` is the complete elevation
vocabulary.

---

## 8. Quick-reference cheat sheet

```
Screen root:           <div className="screen"> ... </div>
Page header:            .screen-head > .screen-title + .screen-sub, .screen-actions
4-up KPI row:           .xxx-stats grid + 4x <StatCard>           (§6.1)
Main + rail:            .xxx-columns grid (1fr 360px)             (§6.2)
Kanban board:           .xxx-board > .xxx-column > .xxx-card       (§6.3, 2 impls)
Timeline:               dot + connector + content, 3 impls        (§6.4 — promote me)
Stepper:                horizontal dot-bar (2 impls) or numbered vertical (1) (§6.5)
Filter chips:           .pts-chip + .is-active + count badge       (§6.6)
Wide table:             .xxx-table-wrap { overflow-x:auto } > table.table.xxx-table (min-width) (§6.7)
Detail panel:           <Drawer open onClose title sub> ... </Drawer>  — no Escape/focus-trap (§3.8, §7.7)
Status pill:            <StatusChip tone="good|warn|bad|neutral|progress">Label</StatusChip>
Patient identity chip:  <PatientAvatar first last tone size?>
Empty list:             <EmptyState icon title sub?>  — no action slot (§3.7)
Search input:           <label className="field-input pts-search"><Search/><input/></label> (§2.7, §7.4)
Form select/compact:    reuse .field-input — do NOT invent a new sched-field/req-select-style class (§7.4)
Colors:                 var(--token) only — see §7.1 for the 12 exceptions to fix
```
