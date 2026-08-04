# Care Indeed Home Health EHR — UI/UX Framework

**This is the design contract.** Every future screen in this prototype should be
indistinguishable in quality from `TodayScreen` — not because it copies Today's
layout, but because it follows the same rules this document makes explicit.
Where a rule and a real file disagree, the rule wins and the file is a bug to
fix, not a precedent to extend.

**How this fits with the other `docs/` files:**
- `CI-DESIGN-SYSTEM-SPEC.md` is the raw transcription of the source brand PDF —
  go there for the original board-by-board wording and HSB values.
- `COMPONENT-INVENTORY.md` is the exhaustive catalogue of every class and
  component that exists today, with file:line citations.
- `A11Y-AUDIT.md` is the accessibility audit — measured contrast ratios, focus
  and keyboard findings.
- **This document** is the distilled, opinionated *contract*: the principles,
  numbers, and patterns an agent should reach for when building something new,
  and the rule for why. Read this first; consult the other three for
  provenance or exhaustive detail.

Every number below was read out of the live source files
(`src/styles/tokens.css`, `src/styles/base.css`, `src/ui/`, `src/shell/`,
`src/screens/`) on 2026-08-03. Where a rule is aspirational rather than already
fully realized in the app, it's labeled as such.

---

## 1. Design principles

1. **Clinical calm over decoration.** The palette is quiet by default — white
   cards, warm-neutral ink, one accent hue — so the single orange element on a
   screen still reads as *the* important thing. Add a second decorative color
   and you spend the one signal the whole system depends on.
2. **One primary action per screen.** Exactly one `.btn-primary` should exist
   on any given view. Two competing orange buttons force the clinician to
   stop and decide which one you meant; that decision cost is what the rule
   exists to eliminate.
3. **Honesty over green dashboards.** A gate, form, or workflow with
   outstanding items is never painted `good`/green. If the real number is
   92%, the chip says `warn` or `progress` — a dashboard that lies about
   completion is worse than one that shows nothing, because it gets trusted.
4. **Density with air.** Clinical data is inherently dense — tables, stat
   grids, timelines — but every card still gets 18–20px of padding and every
   stack still gets a 12–20px gap. Density without air reads as clutter;
   density with air reads as organized.
5. **Identity is never truncated.** A patient's name is the one field that
   is allowed to wrap instead of ellipsis. A clipped name is a patient-safety
   defect wearing a layout bug's clothes — treat it accordingly.
6. **Status is legible without color.** Every status carries an icon and a
   word, never a bare color. Color blindness, grayscale printing, and a
   glance from three feet away are all real constraints in a clinical
   setting, not edge cases to deprioritize.
7. **Restraint is the premium signal.** One hue does the talking. A screen
   that reaches for five accent colors to look "designed" reads as a demo; a
   screen that spends its one orange carefully reads as a system a nurse
   trusts at 6am.

---

## 2. Brand foundations

### The palette (exact values, from `src/styles/tokens.css`)

| Ramp | 600 | 500 | 400 | 300 | 200 | 100 |
|---|---|---|---|---|---|---|
| **Orange** (primary, hue 21) | `#421700` | `#C74601` | `#E56E2E` | `#FFD5BF` | `#FFEEE5` | `#FFFAF7` |
| **Teal** (secondary, hue 182) | `#004142` | `#00797D` | `#06A6AB` | `#C4F4F5` | `#E5FEFF` | `#F7FEFF` |
| **Gray** (neutral, warm→re-struck cool) | `#1F1C1B` | `#524D4B` | `#74767A` | `#D4D9DA` | `#E4E9EA` | `#F5F8F9` |

Sentiment (alerts/status only — never brand decoration):

| | 300 | 200 | 100 |
|---|---|---|---|
| Green | `#00854D` | `#73C5A3` | `#E5F4EE` |
| Yellow | `#FFC700` | `#FFE073` | `#FFF9E5` |
| Red | `#D70101` | `#E97474` | `#FBE6E6` |

**There is no blue anywhere in this brand.** Not in the palette, not as a
"neutral" accent, not for links (links are teal), not for informational
banners. If a screen needs a fourth semantic color beyond orange/teal/gray,
the answer is *not* blue — it's one of the sentiment ramps, used correctly,
or a re-examination of whether a fourth color is actually needed.

### The rule for each ramp

- **Orange = the single primary action and key emphasis, full stop.**
  `--accent` (`orange-500`) is `.btn-primary`, the one CTA per screen, and
  nothing else. It is reserved for "the most critical and prominent element"
  on light backgrounds — never spend it on a second button, a decorative
  icon, or a section header just because it looks nice there.
- **Teal = secondary actions, links, selection, and the sidebar.**
  `.btn-teal`, `.btn-outline-accent`'s sibling `--link`, active-tab
  underlines, `chip-teal`, the `is-active` state on filter chips, and the
  entire dark clinical sidebar (`--sidebar-bg` = `teal-600`) all draw from
  this ramp. Teal is "the system is here and responding to you," not "act
  now" — don't use it where orange belongs, and don't reach for orange where
  teal's quieter emphasis is enough.
- **Warm-turned-cool neutrals carry surfaces, ink, and lines.** `--canvas`
  (page background) is `teal-100`; `--surface` (cards) is pure white;
  `--ink-strong/ink/ink-soft` step down through `gray-600/500/400`; `--line`
  and `--line-strong` are `gray-200/300`. See the note below on why the light
  steps aren't literally the DS's neutral primitives.
- **Green/yellow/red are for sentiment only — never decoration.** They exist
  exclusively to answer "is this thing good, in-progress, or bad." Don't use
  green as a fourth brand color for a "positive" marketing moment; if
  something is worth celebrating visually, that's what the single orange
  accent is for.

### The interaction ladder

The orange (primary) ramp is fully specified for interaction states —
copy this ladder for any new primary-emphasis control:

```
default   → --accent          (orange-500)
hover     → --accent-hover     (orange-600, darker)
pressed   → --accent-pressed fill (orange-300) with orange-600 ink
quiet     → --accent-quiet     (orange-200, for tinted backgrounds/badges)
```

The teal (secondary/link) ramp only formalizes the first two steps —
`--link` (`teal-500`) → `--link-hover` (`teal-600`). There is no dedicated
teal "pressed" token; don't invent one ad hoc in a screen stylesheet — reuse
`teal-300`/`teal-600` combinations already established elsewhere (e.g. the
active tab underline, the checked-checkbox fill) rather than adding a new
pairing.

### Sentiment 300-steps are for icons and borders, never text

`green-300`, `yellow-300`, and `red-300` exist to color a small icon glyph, a
chip border, or a status-dot — not to color a sentence. This is why
`--status-warn` is deliberately **not** aliased to `yellow-300` (`#FFC700`,
which is too light to read as text) but hardcoded to `#B58D00`, a darker
warning ink derived from the same family. The same logic applies to
`--gray-300`: it is documented in `tokens.css` itself as "input borders,
placeholder — never body text," because it measures ~1.4:1 against white and
is functionally invisible as a sentence.

### Why the light neutrals were re-struck cool

The source design system's neutral ramp is warm (hue 21, the same hue as the
orange primary). On this app's teal canvas, that warmth read as an orange
cast bleeding into every "neutral" surface — cards looked faintly peach
against the teal background instead of reading as calm and separate. The
three light neutral steps (`gray-100/200/300`) were deliberately re-struck
cool-neutral so brand warmth stays exactly where it belongs — the orange
ramp — and neutrals stay neutral.

---

## 3. Type system

Two typefaces, one job each:

- **`--font-display` (Montserrat, medium/500 weight)** — every heading
  (`h1`–`h4` default to it via `base.css`), every `.card-title`, every
  `.screen-title`, and **every number**, anywhere, always paired with
  `font-variant-numeric: tabular-nums`.
- **`--font-body` (Roboto)** — everything else: paragraphs, labels, table
  cells, chip text, form inputs. The `body` element sets this as the
  document default at 14px/1.5 line-height.

### The size/weight/line-height ladder actually in use

| Role | Size / line-height | Weight | Family | Example |
|---|---|---|---|---|
| Screen title | 22px / 30px | 500 (h1 default) | Montserrat | `.screen-title` |
| Patient identity name | 20px / 26px | 500 (h2 default) | Montserrat | `.pb-name` |
| Card title (large) | 16–17px (inline override) | 500 | Montserrat | `<h2 className="card-title" style={{fontSize:17}}>` |
| Card title (default) | 15px | 500 | Montserrat | `.card-title` |
| Body / table cell | 13–13.5px | 400 | Roboto | `.table td`, `.queue-title` |
| Small / secondary | 12–12.5px | 400 | Roboto | `.stat-card-sub`, `.pb-meta` |
| Micro / metadata | 11–11.5px | 400–500 | Roboto | `.visit-type`, `.queue-due` |
| Kicker (uppercase label) | 10–10.5px | 500 | Roboto | `.card-kicker`, `.table th` |

### The uppercase-kicker pattern

`.card-kicker` (10.5px, weight 500, `letter-spacing: 0.09em`,
`text-transform: uppercase`) is how the app labels a section above its real
content — "SOC completion," "Clinical work queue," "Field schedule." **Author
the string in sentence case in the JSX** (`kicker="SOC completion"`, not
`"SOC COMPLETION"`) and let the CSS `text-transform` do the visual uppercase —
this keeps the underlying copy grep-able and screen-reader-sane while still
rendering uppercase. Table headers (`.table th`) and the sidebar's nav-group
labels (`.shell-nav-label`, tighter at `letter-spacing: 0.14em`) are the same
pattern at a different size.

### The numeric rule

Any number that matters — a stat-card value, a percentage, a ring's center
label, a week-stat count — is `font-family: var(--font-display)` with
`font-variant-numeric: tabular-nums`, regardless of what surrounds it:

```css
.stat-card-value {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 28px;
  font-variant-numeric: tabular-nums;
}
```

Tabular numerals mean a column of numbers (a table, a stat grid, a ring
updating) never visually jitters as digit widths change — non-negotiable for
anything clinical that gets scanned quickly.

---

## 4. Space, radius, elevation

### Spacing rhythm

| Context | Value | Where |
|---|---|---|
| Root screen rhythm (between screen-head, banner, cards) | **20px** | `.screen { gap: 20px }` |
| Card interior padding (default) | **20px** all sides | `.card-pad` |
| Card interior padding (stat tile — tighter, asymmetric) | 18px 20px 16px | `.stat-card` |
| Patient banner padding | 18px 22px (extra horizontal air — it's the first thing in the room) | `.pb` |
| Gap between peer cards/tiles in a grid | **14px** | `.today-stats`, `.today-columns`, `.intake-stats` |
| Gap between rows in a card-list grid | 12px | `.visit-strip`, `.intake-column-body` |
| Padding inside a stacked interactive row | 13px 12px | `.queue-row` |
| Tight icon+label cluster gap | 5–8px | `.chip`, `.slice-lead` |

**Rule of thumb for new screens:** 20px for a card's own padding, 14px
between sibling cards, 12–13px between rows stacked inside one card, 6–8px
inside a single icon+label cluster. Don't invent a fifth spacing value
without a reason — these four cover every established layout in the app.

### Radius ladder — which components take which step

```css
--r-xs:   8px;   /* small tiles/icons, popover rows, focus-ring corner radius */
--r-sm:  12px;   /* the "clickable content unit" radius */
--r-md:  16px;   /* the card-container radius */
--r-lg:  24px;   /* reserved — not yet used by any screen */
--r-xl:  32px;   /* reserved — not yet used by any screen */
--r-pill: 999px; /* buttons, chips, avatars, tab badges, mode-switch */
```

- **`r-xs` (8px):** small icon tiles (`.slice-lead-icon`, `.sched-rail-icon`),
  `.popover-row`, and the default `:focus-visible` corner radius in
  `base.css`.
- **`r-sm` (12px):** the recipe for anything that is itself a clickable or
  input-like unit sitting inside a card — `.queue-row`, `.visit-card`,
  `.intake-card`, `.brad-suggestion`, `.field-input`. If you're building a
  new row/tile that lives inside a `.card`, this is its radius.
- **`r-md` (16px):** reserved for the outer card boundary itself — `.card`,
  `.stat-card`, `.popover`, `.intake-column-body`. One radius, one meaning:
  "this is a container."
- **`r-lg`/`r-xl`:** genuinely unused headroom in the token set. Don't invent
  a use for them just to spend them — if a new component needs a radius
  larger than 16px, that's worth a second look at whether it should be that
  large at all before reaching for `r-lg`.
- **`r-pill`:** every button, every chip, every avatar, every count badge.
  The one deliberate exception: `Drawer` has **no** radius at all — it's a
  viewport-edge panel (`position: fixed; right: 0`), and edge-attached
  panels don't get rounded corners, exactly like the sidebar doesn't.

### Elevation — when each shadow applies

```css
--shadow-1: 0 1px 2px rgba(0,33,34,.04), 0 1px 3px rgba(0,33,34,.06);  /* resting card */
--shadow-2: 0 2px 6px rgba(0,33,34,.05), 0 8px 24px rgba(0,33,34,.07); /* hover-lift */
--shadow-3: 0 4px 12px rgba(0,33,34,.08), 0 16px 40px rgba(0,33,34,.10); /* reserved, unused */
--shadow-pop: 0 8px 20px rgba(0,33,34,.10), 0 20px 48px rgba(0,33,34,.14); /* overlay-level */
```

All four are warm-tinted (`rgba(0, 33, 34, …)` — the same hue as the dark
teal, not neutral black) — that warmth is what keeps the shadow ladder from
reading as generic Bootstrap gray.

- **`shadow-1`** — every card's resting state (`.card`, `.stat-card`).
- **`shadow-2`** — the hover-lift on anything clickable that isn't a plain
  button: `.visit-card:hover`, `.intake-card:hover`. This is the "you're
  about to click this" cue, paired with a 1px `translateY` and a border
  color shift to teal.
- **`shadow-3`** — currently unused by any screen. It's reserved as a step
  between a hovering card and a full overlay; don't manufacture a use for it
  without a real "heavier than hover, lighter than overlay" need.
- **`shadow-pop`** — reserved for things that float *above the whole page*,
  not just above their row: `.popover`, `Drawer`, the command palette. If
  your new element covers other content rather than just lifting off its
  neighbors, it wants `shadow-pop`, not `shadow-2`.
- `.btn-primary` carries its own bespoke orange-tinted double shadow
  (`rgba(66,23,0,.2)` / `rgba(199,70,1,.22)`) instead of the neutral ladder —
  intentional: the one CTA on the page gets a shadow that reads as "warm
  orange light," not generic elevation. Don't "simplify" it to `--shadow-1`.

---

## 5. Layout system

### The page skeleton

Every screen is exactly one `.screen` root — no second outer scroller,
because the shell (`.shell-content` or `.doc-content`) already owns the only
page scrollbar:

```tsx
<div className="screen">
  <div className="screen-head">
    <div>
      <h1 className="screen-title">…</h1>
      <div className="screen-sub">…</div>
    </div>
    <div className="screen-actions">{/* zero or more secondary buttons */}</div>
  </div>
  {/* cards, grids, tables — whatever the screen needs */}
</div>
```

### The two shells — when to choose each

| | `AppShell` | `DocShell` |
|---|---|---|
| Chrome | 256px dark-teal sidebar, top bar, ⌘K command palette, notifications bell, synthetic-data ribbon | CI lockup header + mode switcher + "Back to the EHR," **no sidebar** |
| Mounts `CommandPalette`? | Yes | **No** — known gap, ⌘K is dead on DocShell routes |
| Current routes | 10 of 12 screens — everything reachable from clinical sidebar nav | Exactly 2: `/business-plan`, `/requirements` |
| Choose it for | Any operational/clinical workflow screen — this is the default answer | Only a standalone, document-style reference surface that is conceptually *outside* the day-to-day clinical app |

**Default to `AppShell`.** `DocShell` is the deliberate exception for two
specific reference documents, not a second normal choice. If you're adding a
third `DocShell` consumer, first decide whether the ⌘K gap needs closing —
don't silently let a third screen inherit a broken command palette.

### Canonical layout patterns

Each pattern below is real, working CSS — copy the cited file, don't
reinvent the shape.

**a) Stat strip** — the "how healthy is my day" glance row. Always exactly
four `<StatCard>`s, always the first content block after the identity
banner.

```css
.xxx-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
@media (max-width: 1280px) { .xxx-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
```
*Copy from:* `today.css:3-8` (also `intake.css`, `ord.css`, `qual.css`,
`bill.css`). Use the 1280px breakpoint — `rep.css` breaks at 1180px instead;
that's drift, not a second convention to match.

**b) Two-column content + rail** — a primary work list beside a fixed
360px companion panel (never make the rail the primary column).

```css
.xxx-columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 14px;
  align-items: start;
}
@media (max-width: 1180px) { .xxx-columns { grid-template-columns: 1fr; } }
```
*Copy from:* `today.css:77-83` (also `qual.css:12-18`).

**c) Card grid** — a uniform grid of tiles (e.g. today's visit cards).

```css
.xxx-strip {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}
```
*Copy from:* `today.css:208-213` (`.visit-strip`). Use `auto-fill`, not
`auto-fit` — `auto-fill` holds empty trailing column-width so the grid
doesn't visually recenter as the last row nearly fills. `req.css:261` uses
`auto-fit` at one spot; that's known drift, not a second option to pick
from.

**d) Kanban board** — status-pipeline columns of cards (referral intake).

```css
.xxx-board { display: flex; align-items: flex-start; gap: 14px; overflow-x: auto; padding-bottom: 8px; }
.xxx-column { display: flex; flex-direction: column; flex: 1 1 250px; min-width: 244px; max-width: 300px; }
.xxx-column-body {
  flex: 1; display: flex; flex-direction: column; gap: 10px; padding: 12px;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--r-md); min-height: 140px;
}
```
*Copy from:* `intake.css:12-90` — treat this as canonical. A second
independent kanban implementation already exists at `req.css:430-470`; don't
create a third, and if you touch either, consider promoting this shape into
`src/ui`.

**e) Table card** — wide data in a scrollable wrapper; the page body itself
must never scroll horizontally.

```tsx
<section className="card">
  <div className="xxx-table-wrap">
    <table className="table xxx-table">…</table>
  </div>
</section>
```
```css
.xxx-table-wrap { overflow-x: auto; }
.xxx-table { min-width: 900px; } /* size to what your columns actually need */
```
*Copy from:* `pts.css:76-80` (900px), `ord.css:24-28` (980px). Give every
`<th>` an explicit `scope="col"` (or `scope="row"` for row headers) — copy
the pattern already done correctly in `BusinessPlanScreen.tsx`.

**f) Filter row** — a search field plus toggle chips, each chip carrying
its own live count.

```tsx
<div className="xxx-toolbar">
  <label className="field-input xxx-search">
    <Search size={15} strokeWidth={1.75} aria-hidden />
    <input aria-label="Search …" value={query} onChange={e => setQuery(e.target.value)} />
  </label>
  <div className="xxx-chips" role="group" aria-label="Filter … by …">
    {FILTERS.map(f => (
      <button
        key={f.key} type="button"
        className={'xxx-chip' + (active === f.key ? ' is-active' : '')}
        aria-pressed={active === f.key}
        onClick={() => setActive(f.key)}
      >
        {f.label}
        <span className="xxx-chip-count">{counts[f.key]}</span>
      </button>
    ))}
  </div>
</div>
```
*Copy from:* `pts.css:17-60` + `PatientsScreen.tsx:96-120`. Don't ship a
filter chip without its count badge — the row doubles as a summary.

**g) Workspace rail** — a fixed-width, screen-local left rail (distinct
from the app's global sidebar).

```css
.xxx-rail { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; }
```
*Copy from:* `sched.css:17-40`. A workspace rail is light-surfaced and holds
only *that screen's own* context/summary — never navigation to other
routes; that job belongs to `AppShell`'s sidebar alone.

**h) Sticky TOC (scrollspy)** — for a long single-column reading surface
under `DocShell`.

```css
.xxx-toc-inner {
  position: sticky; top: 8px;
  display: flex; flex-direction: column; gap: 10px;
  max-height: calc(100vh - 32px); overflow-y: auto;
}
```
```tsx
useEffect(() => {
  const sections = ids.map(id => document.getElementById(id)).filter((el): el is HTMLElement => el != null)
  if (sections.length === 0) return
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting)
    if (visible.length > 0) {
      const top = visible.reduce((a, b) => a.boundingClientRect.top < b.boundingClientRect.top ? a : b)
      setActive(top.target.id)
    }
  }, { rootMargin: '-15% 0px -70% 0px', threshold: [0, 1] })
  sections.forEach(s => observer.observe(s))
  return () => observer.disconnect()
}, [])

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ block: 'start' }) // no `behavior` — instant only
}
```
*Copy from:* `bp.css:568-609` + `BusinessPlanScreen.tsx:14-37`. For a
workspace with real, distinct routed sections rather than one long scroll,
use the `req-rail` pattern instead (`req.css:40-125`) — an actual nav list,
not an `IntersectionObserver`.

**i) Drawer detail** — click-through detail without losing list context.

```tsx
<Drawer
  open={!!selected}
  onClose={() => setSelected(null)}
  title={selected ? selected.name : ''}
  sub={selected ? `${selected.age} yrs · ${selected.diagnosis}` : undefined}
>
  {selected && <>{/* detail content */}</>}
</Drawer>
```
*Copy from:* `ReferralIntakeScreen.tsx:201-207` (also `BillingScreen.tsx:219`,
`OrdersScreen.tsx:278`). **Known gap** (tracked in `A11Y-AUDIT.md`): `Drawer`
does not trap focus, close on Escape, or restore focus to its trigger. Don't
copy that gap forward as if it were correct behavior — if you're touching
`Drawer`, fix it once in `src/ui/index.tsx` for every screen, rather than
patching around it at a single call site.

---

## 6. Component catalogue

All of the following (except `PatientBanner`) live in `src/ui/index.tsx` and
are imported via `import { … } from '../ui'`.

### StatCard
**Use when** a single glanceable metric belongs in a 4-up stat strip.
```ts
function StatCard(props: {
  icon: ReactNode
  kicker: string
  value: ReactNode
  sub: string
  accent?: 'teal' | 'orange' | 'good' | 'warn' | 'bad'   // default 'teal'
  meter?: { pct: number }                                 // only for true ratios
})
```
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
`accent` maps to raw sentiment tokens (`--green-300`, `--yellow-300`,
`--red-300`) for the 3px edge bar and icon color, not the `--status-*`
aliases — deliberate, since it's driving a thin accent bar and a small icon
glyph, not body text. Only attach `meter` when `value` is literally a
completion percentage — a fact-only stat ("Next visit · 2:30 PM") never gets
a fake progress bar.

### ProgressBar
**Use when** an inline determinate progress needs to sit under a value.
```ts
function ProgressBar({ pct, color }: { pct: number; color?: string })
```
**Known gap:** renders `role="progressbar"` with `aria-valuenow/min/max` but
no accessible name anywhere it's called. Until the component itself carries
a `label` prop (see `ProgressRing` below for the template), wrap new usages
with a visually-hidden label rather than shipping a fifth unnamed instance.

### ProgressRing
**Use when** the same completion story needs a circular, higher-emphasis
treatment (a patient-chart headline number).
```ts
function ProgressRing({ pct, size = 64, stroke = 6, color = 'var(--teal-400)', label }: {
  pct: number; size?: number; stroke?: number; color?: string; label?: string
})
```
Always pass `label` — this is the one progress primitive that already does
accessibility correctly (`role="img" aria-label={label ?? `${pct}%`}`).

### StatusChip
**Use when** anything renders a status — visit status, order status, gate
status, billing hold. This is the enforced "status is never color alone"
mechanism: it cannot render without an icon because the icon is baked into
the tone map.
```ts
type StatusTone = 'good' | 'warn' | 'bad' | 'neutral' | 'progress'
function StatusChip({ tone, children }: { tone: StatusTone; children: ReactNode })
```
```tsx
<StatusChip tone="warn">Note due</StatusChip>
```
Never hand-roll `<span className="chip chip-warn">` for a *status* — the
raw `.chip-*` classes exist for non-status badges (episode tags, filter
counts), not for status, which always goes through `StatusChip`.

### Tabs
**Use when** a screen or drawer switches between named sub-views.
```ts
function Tabs({ items, active, onChange }: {
  items: { key: string; label: string; count?: number }[]
  active: string
  onChange: (key: string) => void
})
```
**Known gap:** no arrow-key roving focus (each tab is still Tab-key
reachable as a real button, so it's not broken, just an incomplete ARIA
Tabs pattern). Fix it here once if you fix it at all — don't hand-roll a
second `role="tablist"` with the same gap.

### PatientAvatar
**Use when** a patient's initials-in-a-circle appears anywhere — roster
row, banner, drawer header.
```ts
function PatientAvatar({ first, last, tone, size }: {
  first: string; last: string; tone: string; size?: 'sm' | 'lg'
})
```
`tone` must be one of `'teal' | 'apricot' | 'plum' | 'sage' | 'sand'`
(the `base.css` `avatar-*` classes). Anything else silently falls back to
teal with no warning — check your own data against that literal set; the
component won't catch a typo for you.

### EmptyState
**Use when** a list/table/section has zero rows, for any reason.
```ts
function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string })
```
Write **different copy for true-zero vs. filtered-to-zero** — see Section 7.
No action slot exists yet (see gap list below).

### Drawer
**Use when** a click-through detail view shouldn't cost the user their
place in a list.
```ts
function Drawer({ open, onClose, title, sub, children }: {
  open: boolean; onClose: () => void; title: ReactNode; sub?: ReactNode; children: ReactNode
})
```
See layout pattern (i) above for the real call-site shape and the
focus/Escape gap.

### Sparkline
**Use when** a single-series micro-trend sits inline next to a value.
```ts
function Sparkline({ points, width = 120, height = 36, color = 'var(--viz-1)', label }: {
  points: number[]; width?: number; height?: number; color?: string; label?: string
})
```
`label` is optional in the type but not in practice — always pass it. An
unlabeled sparkline is a decorative squiggle to a screen reader and to a
colorblind user reading only the shape.

### PatientBanner
*(`src/components/PatientBanner.tsx` — not in the `ui` kit, but the
de-facto standard for "this screen is about one patient.")*
```ts
function PatientBanner(props: {
  patient: Patient
  cta?: { label: string; to: string }
  compact?: boolean
})
```
Renders identity (avatar + full, unwrapped name), an episode-status chip,
flag chips, the three-fact strip (primary dx / allergies / episode day),
and an optional single `btn-primary` CTA. Episode-status → chip-color and
the "only the literal string `'Fall risk'` gets `chip-warn`, everything else
gets `chip-neutral`" mapping are both **hardcoded inside the component**,
not data-driven — if new data introduces a new episode status or a new
flag that should read as a warning, edit `PatientBanner.tsx` itself. Don't
work around it with a second banner component.

### What does NOT exist yet

Build these fresh when you need them — don't fake them with something
adjacent:

- **Loading/skeleton state.** Every screen today reads synchronous static
  arrays; nothing async exists yet. When the first real data source lands,
  design the loading state as a visual sibling of `EmptyState` (icon +
  message shape), not an unrelated spinner bolted on.
- **Error state.** Same story — no error UI exists anywhere in the app.
- **A focus-trapping modal.** `Drawer` and the command palette both *look*
  modal but neither traps focus, closes on Escape reliably, or restores
  focus. Don't copy either as "how modals work here" until that gap is
  closed (tracked in `A11Y-AUDIT.md`).
- **A shared form-control component.** `.field-input` is a CSS recipe
  hand-copied three times (`PatientsScreen.tsx`'s search field, `sched.css`'s
  `.sched-field`, `req.css`'s `.req-select`/`.req-search`) — there is no
  `<Field>`/`<Select>` component. A fourth form control should promote this
  recipe into `src/ui`, not add a fourth CSS reimplementation.
- **A promoted Timeline or Stepper.** Both shapes are independently
  implemented 2–3 times already (`chart.css`/`ord.css`/`bp.css` for
  timelines; `today.css`/`bp.css` for steppers) with zero shared code —
  the single strongest promotion candidate in the whole app. A fourth
  timeline or a third stepper is the trigger to promote one of the
  existing three, not to write another.
- **Toasts, a menu/dropdown, pagination, a confirmation dialog.** None
  exist. Design them from the token system (Sections 2–4), not by reskinning
  an unrelated existing pattern.

### The promotion rule

A screen-local pattern earns a place in `src/ui` when **(a)** it appears, or
would need to appear, in three or more screens with the same essential
shape, and **(b)** the differences across those screens are only data, not
structure. Two screens sharing a shape is an acceptable, cheap coincidence —
leave it screen-local, under that screen's own class prefix. Three screens
sharing a shape is a maintenance liability: move it into
`src/ui/index.tsx` with its styles in `src/ui/ui.css`, exactly like the nine
components already there, and update all three call sites to use it.

---

## 7. Interaction and state

- **Every interactive element needs a visible hover state**, established in
  the same commit as its click handler, not retrofitted later. The pattern
  already exists everywhere — `.table tbody tr:hover`, `.tab:hover`,
  `.visit-card:hover` — match it.
- **Focus must always be visible.** The mechanism is a single global rule:
  `:focus-visible { box-shadow: var(--focus-ring); border-radius: var(--r-xs); }`
  (`base.css:45`). **Known defect** (measured in `A11Y-AUDIT.md`): this
  token is ~1.1–1.2:1 against `--surface`/`--canvas`/`--gray-100` — nearly
  invisible on almost every light surface in the app, even though it passes
  at 9.6:1 on the dark sidebar. Don't work around this locally with a
  second, competing focus treatment on your new component — if you're
  touching `tokens.css` and can fix `--focus-ring` at the root (verify
  ≥3:1 against `--surface` *and* re-check the sidebar still passes), that's
  the one-token fix that repairs every focusable element in the app at
  once.
- **Required states for any data view:** populated, true-zero,
  filtered-to-zero, error, truncated. (Loading is not currently needed —
  all data is static — but see the gap list in Section 6 for the day it is.)
  - *Populated* — the default; no special handling.
  - *True-zero* — `EmptyState` stating nothing exists at all (e.g. "No
    medications on file" / "No medications have been recorded for this
    patient.").
  - *Filtered-to-zero* — `EmptyState` stating the filter/search produced
    zero, plus how to recover (e.g. "No patients match these filters" /
    "Try a different search term or clear the filter chips."). **These two
    must never share the same sentence** — a clinician needs to know
    whether to widen a filter or trust the absence is real.
  - *Error* — not implemented anywhere yet; when needed, treat it as a
    visual sibling of `EmptyState`, not a stack trace or a toast.
  - *Truncated* — patient identity is never truncated (Section 1); anything
    else that might overflow gets the table+scroll-wrapper pattern (Section
    5e) or an explicit "+N more," never a silent `overflow: hidden` clip.
- **Empty-state writing recipe:** `title` names the absence in the object's
  own vocabulary ("No orders," not "Nothing here" or "Empty"); `sub` is
  optional, and when present states either *why* (a synthetic or
  unstarted-workflow reason) or *what to do next* (widen a filter) — never
  both, and keep it to one sentence.
- **Drawers vs. navigation.** Open a `Drawer` when staying on the list
  matters more than having a dedicated URL — a roster row, an order, a
  referral card, a notification. Use React Router navigation when the
  destination is a first-class work surface a clinician would bookmark,
  deep-link, or expect Back-button semantics for — the patient chart,
  Today, Schedule. If unsure: "would losing the list state annoy the user
  more than not having a URL?" — yes → `Drawer`; no → navigate.
- **Scrolling is always instant.** Never pass `behavior: 'smooth'` to
  `scrollIntoView`/`scrollTo` anywhere in this app. It silently no-ops
  against this app's nested scroll containers — both shells set
  `scroll-behavior: auto` explicitly (`shell.css:228`, `doc-shell.css:49`)
  specifically to guard against an implicit smooth default creeping back
  in. Copy the working instant-scroll pattern from
  `BusinessPlanScreen.tsx:32–34`.

---

## 8. Data visualisation rules

The validated categorical pair for this app:

```css
--viz-1: var(--teal-400);   /* #06A6AB */
--viz-2: var(--orange-400); /* #E56E2E */
```

This pair passed the dataviz six-checks validator run against this token
set, but the validator flagged a **contrast WARN on the teal** (`#06A6AB`
doesn't clear normal-text contrast on light surfaces at small sizes). That
WARN is exactly why **every chart in this app direct-labels its marks** —
`Sparkline` and `ProgressRing` both already take a `label` prop for this
reason; never ship a mark that relies on the viewer distinguishing teal
from a legend key at a glance.

Concrete rules:

- **Two series max before folding.** More than two categorical series folds
  into a gray "Other" bucket (`--viz-other`, `gray-400`) or splits into
  separate small-multiple facets — never a three-plus-color categorical
  legend.
- **Sequential data uses one hue, light → dark** — built from the existing
  teal ramp (`teal-200 → 300 → 400`, extending toward `teal-600` only if a
  fourth or fifth step is genuinely needed). Never a rainbow gradient.
- **Never a dual axis.** Two differently-scaled series on one chart with
  two y-axes is the single easiest way to mislead a clinical reader; use two
  small-multiple charts instead.
- **A legend is required for two or more series**, and the legend entry
  itself follows the same "never color alone" rule as `StatusChip` — an
  icon or shape plus a label, not a bare color swatch.
- **Direct-label single-series marks** (the current `Sparkline`/
  `ProgressRing` pattern) rather than relying on an axis or a separate key —
  given the teal contrast WARN above, this isn't optional polish, it's the
  mitigation for a known, measured shortfall.

---

## 9. Accessibility contract

Lifted as-is from `A11Y-AUDIT.md` — this is the checklist any new component
or screen must satisfy before it ships.

1. Never bind `onClick` to a `<div>`/`<span>`. Use a real `<button>`/`<a>`,
   or — only for full table rows — `tabIndex={0}` + `role="button"` + an
   `onKeyDown` that handles both Enter and Space and calls
   `e.preventDefault()`.
2. If a clickable row/card contains its own nested interactive element (a
   button/link inside a cell), guard the row's `onKeyDown` (and `onClick`)
   with `if (e.target !== e.currentTarget) return;` so activating the inner
   control doesn't also fire the row's action.
3. Every icon-only control needs `aria-label`; every purely decorative icon
   needs `aria-hidden`. Don't add `aria-label` to icons that sit next to
   visible text — that's redundant.
4. Any `role="progressbar"` must carry an `aria-label` (or
   `aria-labelledby`) describing *what* is progressing, not just its value —
   pass a label prop, don't rely on `aria-valuenow` alone.
5. Any modal-style overlay (Drawer, popovers, the command palette) must:
   move focus inside itself on open, trap Tab/Shift+Tab within its own
   focusable elements, close on Escape, and restore focus to the triggering
   element on close. Don't set `aria-modal="true"` unless all of that is
   actually true.
6. Reuse the shared `Tabs` component for anything that looks like tabs —
   don't hand-roll another `role="tablist"`. If you must, implement
   ArrowLeft/ArrowRight/Home/End keyboard navigation, not just
   role/`aria-selected`.
7. Never use `--gray-300` (or the sentiment -300 steps: `--green-300`/
   `--yellow-300`/`--red-300`) as a text color. They exist for icons,
   borders, and placeholders only — pick `--ink`/`--ink-soft`/`--ink-strong`
   for text, always.
8. Before shipping a new chip/badge/status color pairing, compute its
   contrast ratio (foreground vs. its *actual* background, not the token's
   neighbor) and require ≥4.5:1 for normal text, ≥3:1 for large/bold
   ≥18.66px text or non-text UI components (borders, focus rings, icons).
9. Any focus indicator must hit ≥3:1 against the surface behind it. Because
   `--surface`/`--canvas`/`--gray-100` are all near-white, `--teal-300`
   alone does not qualify — check new components against light *and* dark
   backgrounds before trusting the shared `--focus-ring` token, and flag it
   if you find a spot where it isn't visible.
10. Escape must close anything that opened with a click/Enter and visually
    covers other content (drawers, popovers, the command palette) — wire it
    at the container level, not only on one inner input.
11. Never use `behavior: 'smooth'` for `scrollIntoView`/`scrollTo` in this
    app — it silently no-ops on the nested scroll containers here. Always
    scroll instantly.
12. Wrap new CSS animations/transitions so they respect
    `@media (prefers-reduced-motion: reduce)` — don't assume short
    durations are automatically fine.
13. On every route change, update `document.title` and move focus to the
    new screen's `<main>`/`<h1>` — don't leave focus wherever the
    triggering control was.
14. Give every `<th>` an explicit `scope="col"` or `scope="row"` — copy the
    pattern already used correctly in `BusinessPlanScreen.tsx`.
15. Don't hardcode a raw hex color in a screen/shell stylesheet. Every color
    must come from a `var(--token)` in `tokens.css` — if the color you need
    doesn't have a token yet, add one there (with a comment) instead of
    inlining hex, so its contrast can be tracked in one place.

### Token pairings to avoid as text (measured, from `A11Y-AUDIT.md`)

| Pairing | Ratio | Verdict |
|---|---|---|
| `--focus-ring` (teal-300) on `--surface`/`--canvas`/`--gray-100` | ~1.1–1.2:1 | Fails — invisible on light surfaces (passes 9.6:1 on the dark sidebar; don't "fix" the dark case) |
| `--status-warn` (`#B58D00`) on `--status-warn-bg` | 2.94:1 | Fails 4.5:1 for text-sized chip content |
| `--green-300` on `--green-100` (chip-good) | 4.15:1 | Marginal fail |
| `--gray-400` on `--gray-100` (chip-neutral) | 4.26:1 | Marginal fail |
| `--gray-300` as text color on white | 1.42:1 | Catastrophic fail — icons/borders/placeholders only |
| `--orange-400` background with white text | 3.18:1 | Fails 4.5:1 — recurs at avatar-apricot, active `.shell-nav-badge`, active `.req-rail-badge` |
| `#6E8B6B` (avatar-sage, untokenized) with white text | 3.77:1 | Fails |
| `#B08D57` (avatar-sand, untokenized) with white text | 3.09:1 | Fails |
| `--sidebar-ink-faint` (42% white) on `--sidebar-bg` | 3.31:1 | Fails for real text — use `--sidebar-ink-dim` (64%, 5.64:1) for anything that isn't purely decorative |
| `--chip-bad` (red-300/red-100) | 4.51:1 | **Passes** — use as a calibration target |
| `--teal-500` link on white | 5.21:1 | **Passes** |

---

## 10. Content and tone

- **Sentence case everywhere in UI copy** — screen titles, button labels,
  kickers, chip text. Author kickers in sentence case in the JSX
  (`kicker="SOC completion"`) and let CSS `text-transform: uppercase` do the
  visual rendering — never author a literal all-caps string, which would
  double up on the transform. Real examples already in the app: "Good
  afternoon, Taylor," "Start visit documentation," "Continue SOC,"
  "Referral & intake."
- **No exclamation marks.** Confirmed across every screen's visible copy —
  keep it that way. Clinical software states facts; it doesn't cheer.
- **Plain clinical language over jargon-as-drama.** "Note due," "Open
  orders," "Record integrity" — not "Action required!!" or "Critical
  alert." Say what is true, not how alarmed the reader should feel.
- **"Review, don't replace"** is the fixed framing for anything AI-assisted
  (Brad, or any future assist surface), verbatim from the app's own copy:
  the panel is titled "Review, don't replace"; the note underneath states
  plainly that "Nothing is filed, signed, or submitted without clinician
  review"; and every suggestion's call to action reads "Review in
  medication list" — never "Approve," "Sign," or "Submit." Any new
  AI-assist surface must repeat this shape:
  1. Label the panel with the same "Review, don't replace" framing.
  2. State the non-action explicitly, in one sentence, near the top.
  3. Give every individual suggestion a `Sources:` line so a clinician can
     trace where a draft came from.
  4. Word every button as a review action, never a completed one.
- **Labeling samples and synthetic data.** Every shell already carries a
  disclosure — match its exact wording rather than paraphrasing a new one:
  - Sidebar footer: *"Design prototype"* / *"Synthetic data only · no
    PHI"*
  - Top ribbon: *"Synthetic patient data · design prototype only · not
    approved for clinical use or PHI"*
  - `DocShell` chip: *"Synthetic · design prototype"*

  New screens inherit these automatically from their shell — don't add a
  fourth, differently-worded disclosure. If a screen shows a partial or
  sample data set, add a specific, additional sentence near that data
  (e.g. "Showing 46 of 170 rows") — *in addition to*, never instead of, the
  shell-level disclosure.
- **A gate with outstanding items is never shown as satisfied.** The single
  most load-bearing honesty rule in the app. Never color a `StatusChip` or
  a stat's accent `good`/green unless the underlying number is genuinely
  100% (or the metric has no remaining item by definition) — a 92%-complete
  gate gets `warn` or `progress`, not `good`. When reporting a real number
  from a real source, state it as measured; never round up, and never
  present a figure or an identifier from an unrelated system as if it
  belonged to the document you're citing.

---

## 11. A worked example — `TodayScreen` as the reference implementation

Read `src/screens/TodayScreen.tsx` end to end alongside this walkthrough;
every choice below is a deliberate application of Sections 1–10, not an
accident of "it looked fine."

**Patient banner comes immediately after the greeting, before any stats.**
`<PatientBanner patient={elena} cta={{ label: 'Continue SOC', to: … }} />`
sits directly under the `screen-head`. There is no "select a patient" step
— the clinician's most urgent patient is simply *there*, with full identity
(never truncated), the moment the screen loads.

**Exactly one `.btn-primary` on the whole screen — and it isn't in the
header.** The `screen-actions` row has two buttons, "My schedule"
(`btn-secondary`) and "Start visit documentation" (`btn-teal`) — neither is
orange. The single `btn-primary` on this page is "Continue SOC," embedded
inside the patient banner. That's the principle from Section 1 applied
precisely: the *most clinically important* action (finish this specific
patient's SOC) outranks generic navigation, so it — and only it — gets the
one orange affordance on the page.

**The vertical-slice stepper makes an abstract lifecycle concrete.** The
`.slice` card (`Referral → SOC → POC → visit → claim-ready → QAPI`) doesn't
just list today's tasks — it shows *where this specific episode sits* in
the whole compliance chain, with `is-done`/`is-current`/`is-todo` dot states
doing the explaining instead of a paragraph of prose.

**Four stat tiles, and meters only where they're honest.** SOC completion
(`orange` accent, meter — it's genuinely a percentage), Next visit (`teal`,
no meter — it's a fact, not a ratio, so it doesn't fake a progress bar),
Open orders (`warn` accent, no meter — a count with urgency, not a
completion), Record integrity (`good` accent, meter at 11/13 — a real
ratio, colored `good` only because the *chip*, not the number, still shows
"2 checks blocking claim readiness" in the sub-line so nothing is
overstated). This is Section 1's honesty principle enacted at the
component-prop level, not just in prose.

**The work queue reserves red for the one thing that actually blocks
claim-readiness.** `.queue-blocking` — a red chip — appears only on items
that are true blockers; every other queue row is otherwise neutral. Because
red isn't spent decoratively anywhere else on the row, it still means
something when it appears. Each row is a real, native `<label>` +
`<input type="checkbox">`, so it's keyboard-operable for free, no custom
keydown handler required.

**The assist panel names its own limits before its content.** The Brad
panel is titled "Review, don't replace," states in the very next sentence
that nothing is filed/signed/submitted without clinician review, and every
suggestion ends with a `Sources:` line — the reader can trace the claim.
The panel's own CTA is "Review in medication list," never "Approve."

**Anti-patterns it avoids, by inspection:** no raw hex anywhere in
`today.css` outside the two documented app-wide exceptions; no truncated
patient name (`.pb-name`, `.queue-title` both wrap); every visit card pairs
a `StatusChip` icon+label, never a bare color; the field-schedule sort uses
`timeToMinutes()` to parse "2:30 PM"-style strings before comparing, rather
than a naive string sort that would put "9:00 AM" after "11:00 AM"; the
four stat tiles are gridded 4-up (collapsing to 2-up under 1280px), never
stacked full-width; and nothing on the page claims a clinical action (a
signature, a filed claim) that hasn't actually happened.

---

## 12. Anti-patterns

| Don't | Do instead | Why |
|---|---|---|
| Hardcode a raw hex in a screen/shell stylesheet (`color: #fff`) | `color: var(--ink-inverse)` — or add a new token if none fits | Contrast and theming both route through `tokens.css`; a literal hex can't be tracked or repaired in one place. Eight stray `#fff` instances already exist as debt (`base.css:140,241`; `today.css:132,179`; `shell.css:186`; `rep.css:36`; `req.css:125`) — don't add a ninth. |
| Truncate a patient's name with `text-overflow: ellipsis` | Let the name wrap; truncate secondary metadata only if anything | A clipped identity is a patient-safety defect, not a layout nicety — `.pts-patient-name` and `.pb-name` both deliberately allow wrapping. |
| Compare 12-hour time strings directly (`"9:00 AM" < "11:00 AM"`) | Parse to minutes first, then compare (`timeToMinutes`, `TodayScreen.tsx:30-36`) | String comparison sorts "9:00 AM" after "11:00 AM" because `'9' > '1'` lexically — a real bug this app has already hit once. |
| Communicate status by color alone (a bare colored dot or row tint) | `StatusChip` (icon + label) or `.chip-good/warn/bad` with visible text | Color-blind users and grayscale printing must still be able to read status — enforced structurally by `StatusChip`'s tone map. |
| `scrollIntoView`/`scrollTo` with `behavior: 'smooth'` | Omit `behavior` (instant by default) | Smooth scrolling silently no-ops inside this app's nested scroll containers — a real, previously-hit bug; both shells set `scroll-behavior: auto` explicitly to guard against it. |
| Tint a card's fill to match the teal canvas (`background: var(--teal-100)` on a `.card`) | Keep `--surface` pure white; separate inner panels with a `1px solid var(--line)` hairline, not a fill | `--surface`/`--surface-sunken` are both literal `#FFFFFF` by design — a card reads as "the calm object on the canvas," not a second wash of canvas color. |
| Show a dashboard as green/complete while a gate still has outstanding items | Match chip/accent tone to the real number — `warn`/`progress` for anything short of 100% | This is Section 1's core honesty rule; `RequirementsScreen`'s stated 0-of-349-forms posture is the standard to match, not the exception. |
| Present an invented figure or an identifier borrowed from an unrelated system as if it were sourced from the cited document | State the real source, or mark the figure as illustrative/unverified | Confirmed defect on this app: five headline Requirements statistics and three blocker write-ups were shown with full confidence but don't appear in the cited canonical source, and some reuse real identifiers (`Corridor`, `CL-PA/FN-BL/IT-AC`) from an unrelated system elsewhere in this repo. This framework exists partly to stop that pattern from recurring. |
| Stack `<StatCard>`s full-width, one per row | Grid them 4-up, collapsing to 2-up under 1280px | A stat strip is a glance row, not a list — stacking defeats the "read it in one eye-sweep" purpose stat cards exist for. Copy the grid from `today.css:3-8`. |
| Use `--gray-300` (or any sentiment `-300` step) as a text color | Use `--ink`/`--ink-soft`/`--ink-strong` for text; reserve `-300` steps for icons/borders/placeholders | `--gray-300` on white measures 1.42:1 — a live violation already exists (`today.css:153`, `.queue-row.is-done .queue-detail`); `tokens.css` documents this rule in its own comment. |
| Put white text on `--orange-400`, avatar-sage, or avatar-sand fills | Use `--orange-500`/`--orange-600`, or a pairing that clears 4.5:1 with white | `--orange-400` + white measures 3.18:1 (fails), and recurs at `avatar-apricot`, the active `.shell-nav-badge`, and the active `.req-rail-badge` — a systemic pairing to stop reusing, not a one-off typo. |
| Ship an unnamed `role="progressbar"` | Attach an accessible name describing what's progressing, following `ProgressRing`'s `label` prop as the template | Today a screen reader announces only "NN% progress bar" at every `ProgressBar` call site — indistinguishable when more than one appears in the same table. |
