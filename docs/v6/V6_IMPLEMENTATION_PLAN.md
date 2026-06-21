# V6 Implementation Plan — on the Designless Baseline

**Starting point:** `v2/designless-baseline` — neutral scaffold (`main.tsx → App.tsx →
_scaffold/ScaffoldPage.tsx`), neutral `index.css`/`tailwind.config`, build green, designless
gate passing. ~299 CES/process-logic files preserved **headless** (on disk, excluded from
`tsconfig.app.json` include, unreachable from runtime).

**Goal:** Build the V6 **light** design on top — its own shell, tokens, CSS, components,
routes — reconnecting the preserved process logic screen by screen, with **zero old-design
bleed** enforced by `npm run verify:designless` at every step.

---

## Non-negotiable guardrails (anti-bleed)

1. **V6 brings its own everything.** New shell, tokens, CSS, components, routes. The old UI
   (`CommandCenterLayout`, `PolicyViewer32`, `FormViewer`, …) was physically deleted — it
   cannot be imported. Preserved **logic** (`.ts` stores/services/types/data) *may* be wired.
2. **Use NEW component names.** The gate (`scripts/check-designless.mjs`) fails the build if
   legacy names (`PolicyViewer32`, `FormViewer`, `CommandCenterLayout`, …) or legacy colors
   (`maroon`, `ci-ion`, dark hexes `#0B0F15` etc.) appear in `dist/`. Name V6 components
   distinctly (e.g. `PolicyViewer`, `V6Shell`) and use only V6 light tokens.
3. **Gate-green between every merge.** `npm run verify:designless` (build + gate) must pass
   before any screen is merged. A red gate never gets stacked on.
4. **No bulk re-include.** Re-include preserved logic into `tsconfig.app.json` **only as a
   screen actually wires it** — never broaden to all of `src/policy/**` at once, or the whole
   old dependency graph (and its broken inert imports) comes back.

---

## Reference inputs (already in the repo)

- **Light design spec:** `src/policy/pages/Redesign/Reference/Prototype/CareIndeed Production Light Mode Design Spec.md`
- **Screen mockups:** `src/policy/pages/Redesign/*.html` (Dashboard, ComplianceCalendar, FormsLibrary, PolicyLibrary, MeetingTracker, Taxonomy) + `Reference/V6_Final/*` captions
- **Preserved-logic worklist:** `CES_PROCESS_KEEP_MANIFEST.txt` (what's available to reconnect, with broken-import notes)

---

## Phase V6-0 — Design system (foundation, build once)

*Owner: composer (build) + Opus (sign-off). Must be approved before any screen starts.*

- Extract V6 light tokens from the spec → `src/v6/theme/tokens.css` (CSS variables) +
  `tailwind.config.js` `theme.extend` (V6 colors/typography/spacing/radius/shadow). **Light only.**
- Build V6 primitives in `src/v6/ui/` (Button, Card, Input, Select, Badge, Table, Modal,
  Tabs, etc.) from the spec — the shared kit every screen consumes.
- **Gate:** `verify:designless` green; tokens contain no legacy hexes; Storybook-style
  smoke page renders primitives.

## Phase V6-1 — Shell + routing skeleton (foundation)

*Owner: composer + Opus.*

- Build `src/v6/shell/V6Shell.tsx` (layout, sidebar, topbar, nav) from the main-shell mockup.
- Rewrite `App.tsx`: V6 router with the V6 shell wrapping real routes; keep a placeholder per
  not-yet-built screen so nav never dead-ends.
- Re-include `src/v6/**` in `tsconfig.app.json`.
- **Gate:** build green; shell renders in light theme; no legacy names/colors in `dist/`.

## Phase V6-2 — Screens (the fan-out)

*Owner: gpt orchestrator drives; grok builds; composer wires; Opus QAs.*

Per screen, a 3-stage pipeline (screens run independently, in parallel):

| Stage | Owner | Work |
|---|---|---|
| **A — Build UI** | grok | Build the V6 screen + sub-components from its mockup, using V6 tokens/primitives. Static, with typed mock data first. |
| **B — Reconnect logic** | composer | Re-include the specific preserved stores/services/types/data the screen needs (`tsconfig.app` + imports per `CES_PROCESS_KEEP_MANIFEST`); replace mock data with real selectors; fix any inert broken imports in the reconnected modules. |
| **C — Verify** | Opus QA | `verify:designless` green · visual parity vs mockup · route resolves under V6 shell · no legacy imports/names/colors · CES process still intact. |

**Screen order (leaf data → richest UI):** Taxonomy → Policy Library → Policy Detail viewer
→ Policy Print/Download → Forms Library → Compliance Calendar → Dashboard → (then remaining
V6_Final surfaces: evidence/audit, admin, framework/ACHC, workflows, onboarding/journey as
scoped).

## Phase V6-3 — Hardening

*Owner: Opus + composer.*

- Re-enable auth bootstrap in `main.tsx` (Cognito flow or env-gated bypass).
- Error boundaries, loading states, env config, README, CI runs `verify:designless`.
- Final full-app gate + visual parity sweep across all screens.

---

## Definition of done

- Every designed screen renders in V6 light theme with parity to its mockup.
- `npm run verify:designless` green in CI; **no** legacy color/component/route/stale-`.js`.
- CES process chain wired and functional (event→task→form→signature→evidence→audit).
- No old shell/theme/viewer code anywhere in `dist/`.

## Fleet roles

| Model | Role |
|---|---|
| **gpt — orchestrator** | Sequences phases; gates V6-0/V6-1 before fan-out; runs the per-screen A→B→C pipeline; enforces gate-green + no-bulk-re-include between merges |
| **grok — build workers** | Stage A: build V6 screens/components from mockups (parallel per screen) |
| **composer — workers** | V6-0 tokens/primitives, Stage B logic reconnection, route registration, repetitive transforms |
| **Opus — architect/QA** | V6-0/V6-1 sign-off; Stage C parity + anti-bleed QA; reconnection correctness |
