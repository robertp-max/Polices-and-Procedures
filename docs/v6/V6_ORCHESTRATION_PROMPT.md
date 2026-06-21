# V6 Orchestration Prompt — paste into the GPT orchestrator

> Coordinates grok (build) + composer (workers), with Opus as architect/QA. Companion to
> `docs/v6/V6_IMPLEMENTATION_PLAN.md`. Work happens ONLY in
> `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2` on a branch off
> `v2/designless-baseline`. Never touch the original repo, copies, or Drive snapshots.

## MISSION
Build the V6 **light** design on top of the designless baseline. Bring V6's OWN shell,
tokens, CSS, components, and routes. Reconnect the preserved CES/process logic
(`CES_PROCESS_KEEP_MANIFEST.txt`) screen by screen. No old-design bleed — ever.

## HARD CONSTRAINTS (enforce on every worker, every merge)
1. **Gate is law.** After every change: `npm run verify:designless` must pass (build +
   `scripts/check-designless.mjs`). It fails on legacy colors (maroon/CI-ION/dark hexes),
   legacy component names, legacy routes (`/library` `/forms` `/print` `/appendix` as old
   viewers), or stale `.js` under `src`. A red gate blocks the merge. No exceptions.
2. **Fresh names only.** Never name a V6 component with a legacy name the gate watches
   (`PolicyViewer32`, `FormViewer`, `CommandCenterLayout`, `TravelightBG`, `DotGrid`, …).
   Old UI files are deleted — do not try to import them. Importing preserved `.ts` LOGIC is allowed.
3. **No bulk re-include.** Re-include preserved logic into `tsconfig.app.json` ONLY the exact
   modules a screen wires. Never broaden to all of `src/policy/**`. If a reconnected file has
   an inert import to a deleted UI file, remove/stub it — do not resurrect old UI.
4. **Light only.** All color/spacing/type from the V6 token set derived from
   `Reference/Prototype/CareIndeed Production Light Mode Design Spec.md`. No dark, no maroon, no gold.
5. **Foundation gates the fan-out.** Do NOT start screens until V6-0 (design system) and V6-1
   (shell + routing) are built and Opus-approved.

## EXECUTION ORDER
**V6-0 Design system (composer → Opus sign-off):** V6 light tokens (`src/v6/theme/tokens.css`
+ tailwind `theme.extend`) + primitives (`src/v6/ui/*`) from the spec. Gate green.

**V6-1 Shell + routing (composer → Opus sign-off):** `src/v6/shell/V6Shell.tsx` from the
main-shell mockup; rewrite `App.tsx` to a V6 router with placeholders for unbuilt screens;
add `src/v6/**` to `tsconfig.app.json`. Gate green.

**V6-2 Screens (pipeline; assign each screen independently):** order Taxonomy → Policy
Library → Policy Detail → Policy Print/Download → Forms Library → Compliance Calendar →
Dashboard → remaining V6_Final surfaces. For each screen:
- **A (grok):** build the V6 screen + sub-components from `src/policy/pages/Redesign/<screen>.html`
  using V6 tokens/primitives; typed mock data first. Return diff.
- **B (composer):** re-include + wire the specific preserved stores/services/types/data from
  `CES_PROCESS_KEEP_MANIFEST.txt`; swap mock → real selectors; fix inert broken imports.
- **C (Opus QA):** gate green · parity vs mockup · route resolves in V6 shell · no legacy
  imports/names/colors · CES chain intact. Only then merge.

**V6-3 Hardening (Opus + composer):** auth bootstrap, error boundaries, env, README, CI runs
`verify:designless`. Final full-app gate + parity sweep.

## WORKER ROUTING
- **grok** → Stage A screen/component builds (parallelize across screens).
- **composer** → V6-0 tokens/primitives, Stage B reconnection, route registration, transforms.
- **Opus** → V6-0/V6-1 sign-off + Stage C QA per screen.

## REPORTING (after each screen)
Report: files added, `verify:designless` result, preserved modules re-included (paths),
any inert import fixed, parity notes vs mockup. Surface anything that would require importing
old UI as a STOP — never work around the gate.

## DEFINITION OF DONE
Every designed screen renders in V6 light with mockup parity; `verify:designless` green in CI;
CES process chain wired and working; zero legacy design in `dist/`.
