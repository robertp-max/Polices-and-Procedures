# Ownership Charter — Canonical UI Reconstruction Program

**Effective:** 2026-05-17
**Review cadence:** Quarterly

This charter names the individuals responsible for the program. Roles without names are vacant and must be filled before Phase 1 begins.

| Role | Name | Authority | Accountability |
|------|------|-----------|----------------|
| **Program Owner** | _TBD_ | Final scope & timeline decisions; budget. | Phase exit gates pass on time; reports to executive sponsor. |
| **Design Lead** | _TBD_ | Canonical Spec interpretation; mock fidelity adjudication. | Visual contract integrity across all surfaces. |
| **Engineering Lead** | _TBD_ | Enforcement implementation; primitive evolution; code review gate. | Mechanical enforcement actually blocks violations. |
| **A11y Lead** | _TBD_ | Accessibility acceptance criteria; A11y Wave execution. | Every shipped surface passes a11y evidence bundle. |
| **Visual Language Police Chair** | _TBD_ | **Merge-veto** on any PR touching shell, primitives, or any of the 14+ operational surfaces. Chairs bi-weekly cross-surface review. | Single perceptual contract is enforced; exception registry kept current. |

## Veto Mechanics

- The VLP Chair's veto is recorded as a GitHub CODEOWNERS rule on `src/policy/ui/**`, `src/policy/styles/**`, and the surface entry points listed in `ENFORCEMENT_DESIGN.md`.
- Override of a VLP veto requires the Program Owner + Design Lead jointly, logged in the Exception Registry.

## Escalation Path

VLP Chair → Design Lead → Program Owner → Executive Sponsor. SLA: 48 hours per level.

## Signatures

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Program Owner | | | |
| Design Lead | | | |
| Engineering Lead | | | |
| A11y Lead | | | |
| Visual Language Police Chair | | | |
| Executive Sponsor | | | |
