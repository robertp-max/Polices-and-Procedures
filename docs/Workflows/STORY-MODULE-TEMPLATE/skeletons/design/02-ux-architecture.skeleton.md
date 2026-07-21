# Skeleton — design/02-ux-architecture.md

**Purpose:** assign an interaction shape to every scene and specify anything the engine must add. The unlock mechanic (discover → unlock → Field Notes reveal) is the universal primitive; layout is per-scene.
**Exemplar:** `docs/GAO-001-A-New-Journey/design/02-ux-architecture.md`
**Inputs:** recon/content-inventory + engine-patterns + shell-integration, invariants §§7–8, §11.

## Required sections

1. **Template-per-scene assignment** — table: scene / template (from invariants §7 catalog) / interaction core (one line) / rationale tied to the content's shape. If a scene needs a template variant or a genuinely new template, specify it here and flag it for feasibility pricing.
2. **Engine config deltas** — any `SceneConfig`/`SceneNode` extensions this module needs beyond the standard contract (invariants §8), stated as additive type changes. "None" is a valid and preferred answer.
3. **Redundancy contract application** — where Field Notes and Reference Notes physically live per assigned template (drawer, strip, feedback panel), confirming invariants §10 is satisfiable in each.
4. **Quality bar restatement** — the invariants §11 checklist verbatim, plus any module-specific additions (e.g. GAO-001 added resumability specifics for its two-branch scene).
5. **Handoff split** — which parts of this module's build are platform/architecture work vs. mechanical per-scene config work, referencing the platform-ticket status from recon.

## Done when

Every scene has exactly one template with a content-shape rationale; the engine delta list is complete enough that feasibility can price it; nothing here contradicts the shell contract.
