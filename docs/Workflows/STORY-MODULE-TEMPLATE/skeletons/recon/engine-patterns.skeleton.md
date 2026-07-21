# Skeleton — recon/engine-patterns.md

**Purpose:** inventory the interaction machinery available for reuse, so design/02 assigns templates against reality and the feasibility audit prices only what's genuinely new.
**Exemplar:** `docs/GAO-001-A-New-Journey/recon/prototype-patterns.md` (written pre-engine; post-engine this becomes an engine capability survey).

## Required sections

1. **Engine status** — does `useSceneEngine`/`SceneConfig` exist yet? Which of the six layout templates (invariants §7) are implemented? Which shared primitives (`<SceneModal>`, `<ChoiceButton>`, `useSceneAudio`, `usePhaseGate`, focus-trap/reduced-motion framework) exist?
2. **Reusable patterns outside the engine** — other interactive viewers/panels in the codebase whose mechanics fit this module's content (with `file:line` and a reuse/port/avoid verdict each).
3. **Anti-patterns to avoid** — known-bad patterns from prior implementations (e.g. setTimeout-in-handler completion, invisible hotspots, duplicated config text) still present in code this module might copy from.
4. **Gap list for this module** — given the content inventory's shape, which needed interactions have no existing implementation. Feeds design/02 and the feasibility audit.

## Done when

Design/02 can assign a template to every scene knowing exactly what exists, and nothing in the gap list is discovered later during feasibility.
