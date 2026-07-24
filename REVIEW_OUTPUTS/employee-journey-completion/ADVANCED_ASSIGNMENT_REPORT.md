# Advanced Training Assignment Report

_Master Correction Prompt §7. Source: `advancedAssignmentMap.generated.ts` + `getAdvancedCollection`. Status: **IMPLEMENTED / VERIFIED**._

## Modules (single canonical id each — no forks)

| Module id | Title | Canonical roles (modules.ts) | Effective portal audience |
|---|---|---|---|
| cms-485 | CMS-485 Plan of Care & Compliance Integration | RN, DON | RN, DON, PT, ADM |
| qapi | Quality Assessment & Performance Improvement | RN, DON | RN, DON, PT, ADM |
| oasis-e2-soc | OASIS-E2 Start of Care Assessment | RN, DON, PT, OT, SLP | RN, DON, PT, OT, SLP, ADM |
| documentation-matters | CMS Documentation Matters / Defensibility | ALL_CLINICAL | (all clinical) + ADM |

`ADVANCED_PORTAL_MINIMUM_AUDIENCE = [PT, RN, DON, ADM]` is applied as a **floor**, unioned
with each module's canonical `modules.ts` roles — so PT/RN/DON/ADM always see Advanced, and
canonical disciplines (e.g. OT/SLP on OASIS) are **never dropped**. `ownerAdded` / `canonical`
/ `effective` are recorded per module for audit.

## Visibility (both contexts)

- **Onboarding / role development** — `AdvancedWorkspace` at `/journey/training/advanced`.
- **Annual & Recurring Requirements** — surfaced in the rebuilt Annual page's **Advanced
  Training** section (verified live for taylor-rn: all 4 modules with Launch + effective
  audiences). Previously the Advanced route was orphaned (no nav link); it is now shown in
  the Annual IA.

The same canonical module id is reused across contexts (no second id, no forked content).

## ADM scope note

For Administrator, the Advanced section renders a scope warning: "Leadership / oversight
learning — does not expand clinical scope or authorize OASIS assessment."

## Remaining

A dedicated nav link to the standalone `/journey/training/advanced` route from the Training
workspace is still recommended (it is currently reachable via the Annual page and direct URL).
