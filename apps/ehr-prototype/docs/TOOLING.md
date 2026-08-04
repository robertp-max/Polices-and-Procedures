# Tooling

Two zero-dependency Node scripts keep the prototype consistent. Both run on
Windows and Unix; both are wired into `package.json`.

## `npm run verify:design` — the guardrail

Static checker over `src/`. **Exit 1 on any violation**, so it can gate CI or
an agent's definition of done. Rules:

| Rule | What it catches | Fix |
|---|---|---|
| R1 raw-hex | Any hex colour outside `styles/tokens.css` | Use a `var(--token)`; if genuinely deliberate, add an audited `HEX_ALLOWLIST` entry with a reason |
| R2 no-blue | Blue-dominant hex or blue CSS keywords (teal is brand, never flagged) | Use the orange/teal ramps |
| R3 no-smooth-scroll | `behavior:'smooth'` / `scroll-behavior: smooth` | Scroll instantly — smooth silently no-ops on this app's nested scrollers |
| R4 class-prefix | A screen stylesheet defining classes outside its registered prefix | Use the file's prefix, or register a new screen in `PREFIX_REGISTRY` |
| R5 shadow-js | Compiled `.js` inside `src/` | Delete it — it shadows the `.tsx` under Vite |
| R6 import-type | `import {…} from '../data/types'` without `import type` | `verbatimModuleSyntax` requires type-only imports |

Flags: `--json` for machine-readable output, `--quiet` to suppress per-finding
detail.

Extending: add a rule block in `scripts/verify-design.mjs` following the
existing pattern (`add(rule, level, file, line, text, fix)`), and document it
in the table above. New screens must be registered in `PREFIX_REGISTRY`.

## `npm run new:screen -- <Name>` — the scaffold

Generates `src/screens/<Name>Screen.tsx` + `src/screens/<prefix>.css` from
idiomatic templates (screen head, stat strip, table card with overflow wrapper,
empty state). Never overwrites. Prints the follow-up steps it does **not** do:
route registration in `App.tsx`, prefix registration in the guardrail,
navigation entry, and the verification gate.

Options: `--prefix xyz` to override the derived prefix, `--dry-run` to preview.

## `npm run verify` — the full gate

`tsc --noEmit` + the design guardrail. A change is not done until this passes
and the touched routes render in the browser without console errors.
