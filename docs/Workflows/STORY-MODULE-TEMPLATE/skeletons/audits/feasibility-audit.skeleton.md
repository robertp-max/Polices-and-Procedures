# Skeleton — audits/feasibility-audit.md

**Purpose:** every storyboard element priced against the real shell/engine state. Output is the implementation ticket list, not storyboard edits.
**Exemplar:** `docs/GAO-001-A-New-Journey/audits/feasibility-audit.md`

## Required sections

1. **Platform dependency status** — which platform tickets (engine, templates, primitives, persistence, discriminator, CI checks — README §6) this module depends on and their landed/not-landed status from recon. Not-landed = blockers, listed first.
2. **Per-scene feasibility** — each scene against the shell/engine contract: what's config-only, what needs new engineering, specific risks (art-coordinate brittleness, resume corners, keyboard equivalence for novel interactions, narrow-viewport behavior).
3. **Effort table** — S/M/L per scene with the riskiest piece named per scene.
4. **Build order recommendation** — cheapest-proof-first ordering with rationale.
5. **Field-failure risks** — anything that can fail on real users' machines (permissions, media, network) ranked; each with a recommended default + fallback.
6. **Ticket list** — ordered, deduplicated (one persistence ticket, not N per-scene restatements), each ticket sized and marked platform vs. module.

## Done when

The ticket list could be handed to an implementer as-is; no scene's storyboard assumes machinery this audit hasn't confirmed or ticketed.
