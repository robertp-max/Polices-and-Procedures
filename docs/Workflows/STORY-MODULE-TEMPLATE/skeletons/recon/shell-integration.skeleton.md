# Skeleton — recon/shell-integration.md

**Purpose:** document the protected-shell contract the module's scenes render inside, so design never proposes something the shell can't host and never touches what it must not.
**Exemplar:** `docs/GAO-001-A-New-Journey/recon/shell-integration.md`
**Method:** read-only recon of `ModulePlayerScreen.tsx` and the module's routing/registration path. Cite `file:line`.

## Required sections

1. **Workspace slot contract** — the exact DOM/layout slot scenes fill, the shell-owned chrome around it (left rail, tabs, pills, player controls), and responsive behavior.
2. **Scene registration/discrimination** — how the shell decides which component renders for this module's cards today (registry, id, title-regex), and whether stable card ids exist.
3. **Completion & progress wiring** — where `onComplete` goes today, `canContinue`/`handleNext` behavior, which stores record completion (all of them — GAO-001 found two), and what persists across unmount/Save & Exit.
4. **Protected boundaries** — the systems scenes must never touch (per invariants §1/§3), with the specific write paths that are off-limits, and the one sanctioned path from scene interaction to persisted training state.
5. **Platform-ticket status** — which of the platform tickets (card-id discriminator, `sceneProgress` persistence, shared primitives, engine) have landed since GAO-001. Anything not landed is restated as a blocker for the feasibility audit.

## Done when

A scene implementer could wire a new scene into this module without reading shell source, and a compliance reviewer can see exactly which state writes are sanctioned.
