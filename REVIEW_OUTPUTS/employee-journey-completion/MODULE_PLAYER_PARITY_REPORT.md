# Module Player Parity Report

_Master Correction Prompt §8. Source: `modulePlayerMap.generated.ts` + `TrainingWorkspace`/`fixtures.ts`. Status: **ARCHITECTURE VERIFIED; embed-mode refinement pending**._

## How modules launch (no one-panel template)

The journey app does **not** ship a one-panel template player. Module availability and the
launch target are driven by the canonical `MODULE_PLAYER_MAP` (202 entries, classification
mirrors `ModulePlayerScreen.tsx` dispatch), not by hand-authored fixtures:

- `getModulePlayerEntry(id).playerAvailable` gates the card; `launchRef`
  (`/journey/module/<id>`) is the canonical main-app player route.
- Every role family (GAO, RN, LVN, ADM, DON, ACHC, PT/PTA/OT/COTA/SLP/MSW, HHA) and the
  advanced modules classify as `STANDALONE_PLAYER` or `CANONICAL_GENERIC_PLAYER`
  (`playerAvailable: true`) → the card launches the **canonical main-app player** same-tab.
- Only `ANN`-group modules classify `UNAVAILABLE` (the main app's `contentV2Adapter` filters
  `group==='ANN'`); those are handled in the Annual page — most are deduped into ACHC
  (player-backed), and the genuinely player-less distinct ANN items show a truthful "Module
  content in development" state, **not** a false "Unavailable" lock.

Result: **no card shows "Unavailable" where a canonical player exists.** GAO-001 additionally
has a bespoke in-app two-panel preview at `/journey/training/gao-001`.

## Same-tab (§8.4)

All launches are same-tab (`MainAppLink` → plain `<a href>`, no `_blank`/`window.open`). The
launch target is the canonical main-app player (the premium two-panel `LessonPlayerPage` /
role standalone registries), so parity is achieved by **using** the canonical player rather
than copying 85–360 KB components into a build that cannot import main-app `src` at runtime.

## Remaining / recommended

- **Chrome-free embed (§8.4 option 2):** launches currently open the canonical player with the
  full main-app chrome. Appending `?embed=1` (a main-app shell feature) would render the
  player chrome-free for a more integrated feel, but the main-app player's Back links target
  the main app's internal `/journey?tab=…`; wiring "Back to Training / Back to My Journey" to
  return to the external journey app needs a small main-app bridge and is **not yet done**.
- Source/hash parity manifest per module id: **not yet added**.
