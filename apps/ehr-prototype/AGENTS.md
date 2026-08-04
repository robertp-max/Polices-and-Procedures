># AGENTS.md — Care Indeed Home Health EHR prototype

Read this file first, in full, before touching any code in this app. It is written so you
can act without exploring the codebase first.

---

## 1. Start here

**What this is.** A premium, CI-brand-faithful **design prototype** of a Home Health EHR,
built on 100% **synthetic data**. It is a visual/interaction prototype for evaluating
product design — not a certified clinical system, not connected to any real patient data,
and not authorized for clinical or legal use.

**Stack.** React 19 + TypeScript (`strict`, `verbatimModuleSyntax` — see rule 6 below), Vite 6,
`react-router-dom` v7 **HashRouter**, `lucide-react` icons. No Tailwind, no CSS-in-JS —
every screen owns one plain CSS file with hand-written classes.

**Run it.**
```bash
npm install
npm run dev   # http://localhost:5194 — strictPort, already running in most sessions; do not start a second instance
```
Verify any file compiles without opening a browser:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5194/src/screens/YourScreen.tsx
# 200 = compiles, 500 = broken (read the terminal running `npm run dev` for the Vite error)
```
Typecheck the whole app:
```bash
npx tsc --noEmit -p .
```

**Read next, in this order:**
1. [`docs/CI-DESIGN-SYSTEM-SPEC.md`](docs/CI-DESIGN-SYSTEM-SPEC.md) — the extracted CI brand
   board (colour, type, radius, buttons, fields). This is the source of truth behind
   every value in `src/styles/tokens.css`.
2. [`docs/COMPONENT-INVENTORY.md`](docs/COMPONENT-INVENTORY.md) — full API docs for every
   token, every `base.css` utility class, every `src/ui` export, both shells, and every
   recurring layout pattern already built at least once (copy-from file:line citations
   included). **Check this before writing any new CSS.**
3. [`docs/A11Y-AUDIT.md`](docs/A11Y-AUDIT.md) — the accessibility contract for this app,
   including exact token pairings that fail contrast (folded into §2 below).

> **Live gallery:** `/design-system` is registered in `src/App.tsx` (outside AppShell/
> DocShell as a full-width developer surface) and the sidebar "Design system" item in
> `src/data/navigation.ts` is `status: 'built'`. Prefer the live gallery when exploring
> kit components; the three docs above remain the written contract.

---

## 2. Non-negotiable rules

1. **Colours only from `var(--token)`.** Never write a raw hex value in a screen, shell, or
   component stylesheet. If the colour you need has no token, add one to
   `src/styles/tokens.css` (with a comment) — don't inline it. (A handful of legacy raw-hex
   spots already exist as tracked debt; don't add new ones, and prefer fixing one if you're
   already editing that file.)
2. **No blue, anywhere.** The CI brand is orange (primary), teal (secondary), warm
   hue-21 neutrals, and green/yellow/red for sentiment only.
3. **Status is never colour-alone.** Always icon + label. Use `<StatusChip tone=... />`
   from `src/ui` or a `.chip-good|warn|bad|neutral` class — never a bare coloured span.
4. **Scrolling must be instant.** `scrollIntoView({ block: 'start' })` / `scrollTo(...)`
   with **no** `behavior: 'smooth'`. Smooth scrolling silently no-ops on this app's nested
   scroll containers (`.shell-content` in `AppShell`, the doc-content column in `DocShell`).
5. **One stylesheet per screen, imported only by that screen, with a unique class prefix**
   not already in this map:
   `bill→.bill- · bp→.bp- · chart→.chart- · clin→.clin- · domain→.domain- · intake→.intake- ·
   ord→.ord- · pts→.pts- · qual→.qual- · rep→.rep- · req→.req- · sched→.sched-`.
   (`today.css` uses `.slice-`/`.queue-`/`.brad-` instead of `.today-` — known pre-existing
   debt, do not copy this pattern for a new screen.)
6. **`import type` for every type-only import** (`verbatimModuleSyntax` is on in
   `tsconfig.json` — a plain `import { Foo }` where `Foo` is a type is a build error, not a
   lint warning).
7. **Numbers use `var(--font-display)` (Montserrat) + `font-variant-numeric: tabular-nums`.**
   Copy the exact two-line recipe from `src/ui/ui.css` (`StatCard`'s value styling) onto any
   new standalone numeric display — don't reinvent it.
8. **Wide tables live in an `overflow-x: auto` wrapper**, e.g.
   `.xxx-table-wrap { overflow-x: auto }` around `table.table.xxx-table { min-width: Npx }`
   (see `pts.css`, `ord.css`, `bill.css`, `bp.css` for the exact pattern). The page body
   itself must **never** scroll horizontally.
9. **Reuse `src/ui` and `base.css` before writing new component CSS.** This app already has
   ~15 independent hand-rolled "stat tile grid" implementations, 3 independent timeline
   implementations, 3 independent stepper implementations, and 3 independent 40px
   field-input reimplementations that all duplicate something that already exists —
   `docs/COMPONENT-INVENTORY.md` lists every one with a file:line to copy from. Adding a
   16th is a regression, not a feature.
10. **Never bind `onClick` to a `<div>`/`<span>`.** Use a real `<button>`/`<a>`; for a
    clickable table row use `tabIndex={0} role="button"` plus an `onKeyDown` that handles
    both Enter and Space and calls `e.preventDefault()`. If the row contains its own nested
    button/link, guard the row handler with `if (e.target !== e.currentTarget) return` so
    activating the inner control doesn't double-fire the row action (this bug exists today
    in `BillingScreen.tsx` and `OrdersScreen.tsx` — don't copy it into a new screen).
11. **Every icon-only control needs `aria-label`; every purely decorative icon needs
    `aria-hidden`.** Don't add `aria-label` to an icon that already sits next to visible text.
12. **`role="progressbar"` must always carry a real `aria-label`** describing what is
    progressing (`ProgressBar` in `src/ui` does not do this today — pass one yourself at the
    call site until it's fixed; `ProgressRing`'s `label` prop is the correct pattern to copy).
13. **Don't trust `aria-modal="true"` on `Drawer` or the command palette.** Neither
    component today traps focus, closes on Escape reliably, or restores focus to the
    trigger on close. If you touch either file, fix all three together, and say so loudly
    in your report per §8 — don't patch one screen's usage around the bug.
14. **Never use `--gray-300` (or `--green-300`/`--yellow-300`/`--red-300`) as a text
    colour.** They exist for borders/icons/placeholders only. Use `--ink`/`--ink-soft`/
    `--ink-strong` for text.
15. **Before shipping a new chip/badge/status colour pairing, check its contrast**, not just
    its neighbour's. Known **failing** pairings already in this codebase — don't add a new
    use of any of them without also fixing the contrast:
    - `--focus-ring` (`teal-300`) against any light surface (`--surface`, `--canvas`,
      `--gray-100`) ≈ 1.1–1.2:1 — invisible. (It's fine, 9.6:1, on the dark sidebar —
      the bug is the light-surface case, not the dark one.)
    - `--status-warn` text on `--status-warn-bg` = 2.94:1 (`chip-warn`).
    - white text on `--orange-400` = 3.18:1 (avatar-apricot, active nav/rail badges).
    - `--sidebar-ink-faint` as real text on `--sidebar-bg` = 3.31:1 (use
      `--sidebar-ink-dim` instead, 5.64:1).
16. **Wrap new CSS transitions/animations to respect** `@media (prefers-reduced-motion: reduce)` —
    nothing in this app does today; don't assume a short duration makes it exempt.
17. **Give every `<th>` an explicit `scope="col"` or `scope="row"`.** Copy the correct
    pattern from `BusinessPlanScreen.tsx`, not the bare `<th>` in `PatientsScreen.tsx`/
    `OrdersScreen.tsx`/`BillingScreen.tsx`/`PatientChartScreen.tsx`.

---

## 3. Clinical-safety and data rules

- **All data is synthetic.** Never introduce real patient data, real PHI, or anything that
  could be mistaken for it. Every screen, and the top bar's synthetic-data ribbon, must keep
  saying so — don't remove or soften that disclosure.
- **Nothing may fabricate a completed clinical or legal action.** A button that would
  file, sign, or submit something is either **visual-only** (does nothing / shows a toast)
  or **opens a review drawer** for a human to actually act on. Never make such a button
  silently mark something "Signed"/"Filed"/"Submitted" in state.
- **Never render an incomplete compliance/QA gate as complete.** If a gate, form, or sprint
  item is 0% done in the source data, the UI must show that plainly — no rounding up, no
  optimistic status.
- **Brad (clinical assist) framing is always "Review, don't replace."** Brad drafts, flags,
  and suggests; a clinician reviews and acts. Never wire a Brad surface to auto-file or
  auto-sign anything.
- **This bar has already been missed once** — `src/data/requirementsSpec.ts`'s
  `TASKS_NOTE` currently states "the source states a corpus total of 5,350 planning tasks…",
  which is not present anywhere in the cited canonical source. Don't repeat this pattern:
  see §5 for the rule this violates and how to avoid it.

---

## 4. How to add a screen

There is no scaffolding CLI — copy the closest existing screen as your template.

1. **Copy a template.** Pick an `AppShell` example (e.g. `OrdersScreen.tsx` + `ord.css`) or
   a `DocShell` example (`RequirementsScreen.tsx` + `req.css`) depending on step 2.
   ```bash
   cp src/screens/OrdersScreen.tsx src/screens/YourScreen.tsx
   ```
2. **Choose a shell.**
   - `AppShell` (default): clinical sidebar + top bar + ⌘K command palette. Use this unless
     you're building a standalone document page-view.
   - `DocShell`: no sidebar, centers content at `max-width: 1040px`, used today only by
     `/business-plan` and `/requirements`. **`DocShell` does not mount the command palette**
     — ⌘K is dead on any route under it. That's expected today, not something to silently
     "fix" without flagging it per §8 (`DocShell.tsx` is a shared file).
3. **Register the route** in `src/App.tsx`, inside the correct shell's `<Route element={...}>`
   block:
   ```tsx
   <Route path="/your-slug" element={<YourScreen />} />
   ```
   `App.tsx` is a **shared file** — see §8 before editing it.
4. **Add it to the sidebar** (AppShell routes only, and only once it genuinely renders
   working content) by adding a `NavItem` to the right group in
   `src/data/navigation.ts`:
   ```ts
   { to: '/your-slug', label: 'Your label', icon: SomeLucideIcon, domainId: 'XXX', status: 'built' }
   ```
   **Never set `status: 'built'` before the route actually works.** `navigation.ts`'s own
   header comment states this rule explicitly ("Navigation must never imply a capability
   exists when it does not") — `/design-system` is the positive example (route +
   `status: 'built'` stay in lockstep; see §1).
5. **Root JSX** must be:
   ```tsx
   <div className="screen">
     <div className="screen-head">
       <div>
         <h1 className="screen-title">Your Screen</h1>
         <div className="screen-sub">One-line status summary</div>
       </div>
       <div className="screen-actions">{/* buttons */}</div>
     </div>
     {/* body */}
   </div>
   ```
   No second outer scroll container — `AppShell`'s `.shell-content` (or `DocShell`'s
   content column) owns the only page scroller.
6. **New stylesheet**, one file, unique prefix per §2 rule 5, imported only by this screen:
   ```tsx
   import './yourscreen.css'
   ```
7. **Reach for `src/ui` before writing new CSS**: `StatCard` for KPI tiles, `StatusChip` for
   any status, `ProgressBar`/`ProgressRing` (with a real label) for progress, `Tabs` for
   tabbed UI, `Drawer` for click-through detail, `PatientAvatar`/`PatientBanner` for patient
   identity, `EmptyState` for zero-result states, `Sparkline` (with a `label`) for inline
   trend viz.

**Definition of done** for a new/changed screen — all of §6 below passes, plus:
- No raw hex in the new stylesheet; no blue.
- Every status uses `StatusChip` or a `chip-*` class, never colour alone.
- Any clickable table row/card follows §2 rule 10 (keyboard-operable, no double-fire).
- Wide tables wrapped per §2 rule 8.
- If you added a sidebar entry, it's `status: 'built'` only because the route truly works.

---

## 5. How to extend the data layer

- **Types** live in `src/data/types.ts`. Add/extend interfaces there first.
- **Records** live in one file per domain in `src/data/` (`patients.ts`, `clinical.ts`,
  `businessPlan.ts`, `requirementsSpec.ts`, `navigation.ts`). Add new synthetic records to
  the matching file; don't scatter data literals inside screen components.
- **Content presented as "sourced" must be traceable to an actual source you can point to.**
  Before adding any headline statistic, figure, or "the source states X" note, grep the
  actual cited source text for it. `requirementsSpec.ts`'s own header comment sets the bar:
  content must be **verbatim** where it claims to be verbatim, and any **sample** must be
  labeled as a sample (e.g. "showing N of 170"), never presented as the full set. A real,
  live violation of this rule already exists in this codebase — `TASKS_NOTE` (see §3) — do
  not add a second one. If you can't verify a number against its cited source, either omit
  it or label it explicitly as unverified.
- **Never silently reuse identifiers from a different corpus.** This repo's separate Policy
  P&P ACHC-crosswalk system has its own real `Corridor`, `CL-PA`/`FN-BL`/`IT-AC`, and
  `HH-map` identifiers (`scripts/validateCorridorAlignment.ts`, `src/policy/data/*`,
  elsewhere in this monorepo — **not** part of this app). If content from that system is
  ever genuinely relevant to the EHR prototype's Requirements screen, cite it explicitly as
  a distinct, named source — never fold its figures into this app's own blocker/stat set
  as if they came from the same document.
- Keep every synthetic dataset obviously synthetic (fake names, fake MRNs, fake dates) —
  never copy real production-shaped identifiers even as a "placeholder."

---

## 6. Verification gate before you finish

A task touching this app is **not done** until all of these pass:

```bash
# 1. Typecheck the whole app
npx tsc --noEmit -p .

# 2. Confirm every file you touched actually compiles (Vite transform, not just tsc)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5194/src/screens/YourScreen.tsx
# repeat per changed file — 200 required, 500 means read the dev-server terminal output

# 3. Manual design-token audit (this app has no `npm run verify:design` script yet —
#    until one exists, this grep is the gate). Run from the app root:
grep -rn "#[0-9a-fA-F]\{3,6\}" src/screens/*.css src/shell/*.css src/ui/ui.css src/components/*.css
#    every hit must be one of the already-documented, deliberate exceptions in
#    docs/COMPONENT-INVENTORY.md — a new hit is a defect, fix it before finishing.
```
4. **Browser-check every route you touched** — the dev server at `http://localhost:5194`
   is already running; don't start or stop it. Load the route(s), and if you added a sidebar
   entry, click it from the sidebar too (not just the URL) to confirm nav wiring.

If `npm run build` is ever relevant to your task, note that it runs `tsc -b && vite build`
— broader/stricter project-reference build, not the same as `tsc --noEmit -p .`.

---

## 7. Known traps

1. **Every CSS request 500s.** Cause: `postcss.config.js` missing or broken. This app needs
   its own empty `postcss.config.js` (`export default { plugins: {} }`) — without it, Vite
   walks up to the parent repo's Tailwind PostCSS config, which isn't installed here, and
   every `.css` import fails. Vite **caches** the bad resolution — after fixing the file,
   restart the dev server, a page refresh alone won't pick it up.
2. **Blank screen / stale content after an edit that looks correct.** Cause: a compiled
   `.js` file has been emitted into `src/` and Vite is resolving it **before** your `.tsx`
   file (Vite prefers `.js` over `.tsx` on an ambiguous import). Never emit compiled JS into
   `src/`; if you see a `.js` sibling next to a `.tsx` file you're editing, delete it — it's
   gitignored (`src/**/*.js`) but will still shadow your source locally until removed.
3. **Visits/appointments sort in the wrong order** (e.g. "9:00 AM" sorting after
   "11:00 AM"). Cause: comparing 12-hour time strings lexically. Always parse to minutes
   (or a real `Date`) before comparing/sorting times — never compare the raw string.
4. **`npm run dev` fails with "port already in use" or silently binds a different app.**
   Ports 5191/5192/5193 belong to other apps on this machine — this app owns **5194** only
   (`vite.config.ts` and `package.json`'s `dev` script both hardcode it with `strictPort`).
   Don't repoint this app at another port to work around a conflict; find and stop
   whatever's wrong instead.
5. **A new chip/badge/focus state "looks invisible" or "looks unreadable."** Before assuming
   it's a browser bug, check it against the failing-pairing list in §2 rule 15 — several
   tokens in this app's own palette measure below WCAG minimums against certain surfaces,
   most notably `--focus-ring` on every light surface.

---

## 8. File ownership etiquette for parallel agents

Multiple agents may be working in this app at once. Claim narrowly:

- **Yours to edit freely:** the one screen `.tsx` + its one `.css` file you were asked to
  build or fix, and any new file under `src/data/` you're adding records to.
- **Shared — do not edit casually, and never in the same change as your screen work:**
  `src/App.tsx`, `src/styles/tokens.css`, `src/styles/base.css`, everything under
  `src/ui/`, `src/shell/` (`AppShell.tsx`, `DocShell.tsx`, `CommandPalette.tsx` + their
  CSS), and `src/data/navigation.ts`.
- **If a shared file genuinely must change** (new route in `App.tsx`, new token in
  `tokens.css`, a fix to a shared kit component, a new nav entry) — make the change, but
  **say so explicitly in your final report**: name the shared file, what you changed, and
  why a screen-local fix wasn't possible. Don't bury a shared-file edit inside an unrelated
  screen change with no mention of it.
- If you find a shared file already mid-edit (e.g. a new screen file or stylesheet that
  exists but isn't wired into `App.tsx`/`navigation.ts` yet), don't "finish" someone else's
  wiring as a side effect of your own task — flag it in your report instead.

---

## 9. Commit conventions

Conventional Commits, present tense, scoped to `ehr-prototype`:
```
type(ehr-prototype): summary in present tense

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
```
`type` is one of `feat|fix|style|docs|refactor|test|chore`. Real precedent from this app's
history:
```
feat(ehr-prototype): CI-branded Home Health EHR design prototype
style(ehr-prototype): white card containers, cool neutrals, edge side nav
docs(ehr-prototype): bring UAT report current, park remaining checks
```
