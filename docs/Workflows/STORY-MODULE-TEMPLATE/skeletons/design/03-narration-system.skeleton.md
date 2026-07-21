# Skeleton — design/03-narration-system.md

**Purpose:** the module's concept checklist and its mapping discipline — the artifact that makes "narration is instructionally complete" checkable rather than aspirational.
**Exemplar:** `docs/GAO-001-A-New-Journey/design/03-narration-system.md`
**Inputs:** recon/content-inventory (the concept source) + narration-infrastructure, invariants §9.

## Required sections

1. **Concept checklist** — one `conceptId` per fact/citation/table-row/protocol-step from the content inventory, with `sourceRef` back to the inventory's numbering and `requiredForScene`. Multi-fact source items split into separate concepts. This is the module's coverage contract — completeness here is what the coverage audit verifies against.
2. **Verbatim units** — any character-for-character sentences this module carries (invariants §5), each with canonical source string location and mandated placements.
3. **Segment naming & storage plan** — narration id scheme (`<moduleId>.sNN.node.<slug>.<tier>`), data module paths, audio manifest keys, per the infrastructure recon.
4. **Tier expectations per scene** — expected segment counts per tier per scene given node counts; where feedback-tier segments are required (every judgment node, both branches).
4b. **Volume budget** — per-scene narration word targets summing to **≥ ~4,800 words module-wide** (the 30-minute narration floor, invariants §9.5). If the source inventory can't sustain it, name the policy-grounded expansions (invariants §1) that will — with their `policyRefs` — or raise a stakeholder item here.
5. **CI registration** — how this module's checklist plugs into the coverage/forbidden-string/verbatim build checks (or the ticket to extend them if they don't cover this module yet).

## Done when

Every inventory concept appears exactly once in the checklist; a storyboard author can name any segment without inventing conventions; the coverage audit can run as a mechanical join.
