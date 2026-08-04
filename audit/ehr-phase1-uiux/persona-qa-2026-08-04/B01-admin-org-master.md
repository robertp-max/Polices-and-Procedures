# B01 — Administrator — Organization & master data / entity governance

- **Routes:** `/#/org-master`, `/#/users-access`, `/#/traceability`, `/#/requirements`
- **Persona:** Administrator (entity governance, dual-control, config integrity)
- **Base:** http://127.0.0.1:5194 (HashRouter) · worktree `ehr_phase1` · app `apps/ehr-prototype`
- **Method:** Source-backed UX QA of live screen TSX + workspace data + routes (`App.tsx`, `navigation.ts`). Vite log shows port **5194** previously ready; agent HTTP to loopback is blocked, so findings rely on code/path honesty rather than live screenshots.
- **Verdict:** **CONDITIONAL**
- **Summary:** Org master, users & access, traceability, and requirements workspaces are built, cross-linked, and honest about synthetic data and non-writes. Authorize-development is hard-blocked with explicit programme-level copy, and master-data approve/propose controls do not mutate config. Dual-control is **described** (banners, in-review callout, dual-path language) but not **demonstrable as a two-person workflow**. Entity isolation cues show a single legal entity boundary but do not surface the sibling private-duty exclusion (GOV-001 / charter) on the org-master surface itself.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Load / route wired | **OK** | All four paths registered in `App.tsx`; admin nav marks `/org-master`, `/users-access`, `/traceability` as `built`. `/requirements` lives under `DocShell`. |
| Title / domain kicker | **OK** | GOV · Organization & master data; IAM · Users & access; TRC · Semantic traceability; Requirements title + controlled-spec chips. |
| RelatedNav present | **OK** | Org master → Users, Vendors, Requirements; Users → Org master, Security, Traceability; Traceability → Requirements, AI governance, Evidence. |
| StatCards / filters / inspector | **OK** | List + inspector pattern on GOV/IAM/TRC; status filters; tabs (overview / effective|scopes|coverage / change|review|gates). |
| Dual-control for master data | **FAIL (partial)** | Copy asserts dual approval before runtime activation; in-review callout says “Awaiting dual approval” (finance/clinical path). **No second approver identity, SoD step, or dual-sign simulation** — single “Approve change” primary for eligible rows. |
| Entity isolation cues | **CONDITIONAL** | StatCard “Legal entity · 1 · Care Indeed Home Health Care, Inc.”; inspector “Single-entity boundary sample”; all `ORG_CONFIGS` share that entity. Sibling exclusion (“Care Indeed, Inc. private-duty…”) appears in requirements charter (`separateEntity`), not on org-master chrome. |
| No silent config writes | **OK** | Propose/approve/calendar have no write handlers; footnotes: “No master-data write occurs” / “visual only”. Users revoke/invite/break-glass likewise non-mutating. Data is static `ORG_CONFIGS` / `ACCESS_PRINCIPALS`. |
| Traceability / authorize-dev blocked honestly | **OK** | “Authorize development” is always `disabled`; reasons via `authorizeBlocked()`; StatCard “Dev authorization · Blocked”; banner: not build-authorized. Requirements rail + overview gate: “Not build authorized”. |
| Cross-links sensible | **OK** | Screen actions and related chips to Users, Vendors, Security, Requirements, AI governance, Legal evidence; requirement ID buttons → `/requirements`. |
| Honesty / incomplete ≠ complete | **OK** | Flask banners on all three admin surfaces; draft/scheduled/in-review statuses; approve disabled for draft/scheduled/active with explicit reason; TRC coverage meters labeled prototype. |
| Privileged IAM dual-control cue | **OK** | Banner: dual-control for privileged roles; service-account revoke blocked with dual-owner message; break-glass callout + visual-only controls. |

## Route notes

### `/org-master` (`OrgMasterScreen.tsx` · domain GOV)

- Sample config sets: service area, payer contracts (in-review), discipline matrix, branch hours (scheduled), document retention (draft).
- Status filters + search; inspector tabs Overview / Effective date / Change set.
- **Approve change:** disabled for active/approved/draft/scheduled with reason; enabled only for in-review **but** `title` + footnote still “visual only · nothing is approved” and **no `onClick` mutation**.
- Effective-dating language: scheduled sets inactive until wall-clock; “does not silently rewrite history.”
- Continue-in links per row (e.g. payer → Billing/Authorizations).

### `/users-access` (`UsersAccessScreen.tsx` · domain IAM)

- Principals mix workforce / service / contractor; MFA chips; review-due and break-glass callouts.
- Revoke disabled for disabled accounts and active service accounts (dual-owner production design).
- Invite / break-glass / revoke footnotes: no directory write recorded.

### `/traceability` (`TraceabilityScreen.tsx` · domain TRC)

- Object classes: Requirements (baseline 100%), Workflows (in-review 62%), UI routes, Forms (gate-open), Legal packages, Interfaces (**blocked**).
- Coverage bars + “prototype meter” language; unresolved collisions “0* · prototype claim”.
- Authorize always disabled; class-specific block reasons (blocked, in-review, coverage &lt; 70%, requirements baseline still programme-blocked, default programme unauthorized).

### `/requirements` (`RequirementsScreen.tsx` · DocShell)

- Gate callout + rail: **Planning baseline · not build authorized**.
- Register domains include GOV-001 (“Isolate the licensed legal entity”) and TRC domain; charter `separateEntity` states private-duty is not silently combined.
- Deep links from org/IAM/TRC open the workspace root, not a filtered GOV/TRC statement (prototype limitation).

## Findings

### P0

_None._ No silent legal-entity write, no false build authorization, no fake completeness of dual-control as a completed production control (controls are labeled visual/synthetic).

### P1

1. **Dual-control is narrative, not operable UX (org master).**  
   Administrator cannot demonstrate two-person approval for payer/master-data change: there is no second approver role, pending-approver list, maker/checker split, or disabled “self-approve” rule. In-review “Approve change” remains a single primary button (non-writing, but looks like one-person approval).  
   **Where:** `OrgMasterScreen.tsx` inspector foot + in-review callout; sample `GOV-041` payer contracts.  
   **Ask:** Prototype dual-control as two named steps (Propose → Approver A → Approver B) with both identities visible before any “approve” affordance lights.

2. **Sibling-entity isolation not cued on the governance surface that owns the boundary.**  
   GOV-001 and charter require Care Indeed Home Health Care, Inc. separate from Care Indeed, Inc. private duty. Org master only shows “1 legal entity” / same-entity labels — good single-tenant sample, weak isolation **warning**. Risk: board/admin walkthrough may miss the hard boundary.  
   **Where:** `ORG_CONFIGS` + org-master StatCard/inspector vs `CHARTER.separateEntity` / `GOV-001` on requirements only.  
   **Ask:** Persistent chip or callout: “Private-duty entity excluded · no blended config/KPI.”

### P2

1. **Requirement ID chips** (`GOV-001`, `IAM-*`, `TRC-*`) navigate to `/requirements` without landing on register row or domain filter — weak audit trail UX for an admin reconciling config to shall-statements.
2. **Approve enabled styling for in-review** may confuse training demos (looks clickable/actionable); only title + footnote explain visual-only. Prefer always-disabled + “Simulate dual approval (read-only)” secondary, or modal that still cannot write.
3. **Terminology drift:** “dual approval” (org master) vs “dual-control” (users/access, data exports) — align admin-facing glossary.
4. **No multi-branch isolation drill-down** beyond branch label on config rows (Campbell / All branches) — acceptable for sample size; document as intentional.

## What works

- Clear synthetic banners on GOV / IAM / TRC; no pretence of production directory or config runtime.
- Effective-date and change-set framing (append-only proposals, scheduled inactive until effective).
- Approve/revoke/authorize **disabled paths with human-readable reasons** and “no write” footnotes.
- Programme-level **Not build authorized** on requirements + always-disabled authorize on TRC.
- RelatedNav + continue-in links form a coherent admin governance loop (org ↔ users ↔ security ↔ vendors ↔ requirements ↔ evidence).
- Status never colour-alone (`StatusChip` + labels); list/inspector density matches other redesigned platform screens.
- Sample data tells a governance story: MA payer in-review, Saturday hours scheduled, retention draft, service account dual-owner revoke, interface class hard-blocked.

## Persona quote

> “I can see the entity boundary and that nothing silently writes, and I believe the ‘not build authorized’ story — but until dual approval is two people on the screen, not a sentence under a single Approve button, I will not treat master-data governance as demo-ready for survey or board.”

## Evidence map (source)

| Surface | Primary files |
| --- | --- |
| Routes / nav | `apps/ehr-prototype/src/App.tsx`, `src/data/navigation.ts` |
| Org master | `src/screens/OrgMasterScreen.tsx`, `ORG_CONFIGS` in `src/data/workspace.ts` |
| Users & access | `src/screens/UsersAccessScreen.tsx`, `ACCESS_PRINCIPALS` |
| Traceability | `src/screens/TraceabilityScreen.tsx`, `TRACE_OBJECTS` |
| Requirements / GOV-001 / gate | `src/screens/RequirementsScreen.tsx`, `src/data/requirementsSpec.ts` |
| Related links | `ROUTE_RELATED` in `src/data/workspace.ts`, `RelatedNav.tsx` |

## Severity rollup

| Severity | Count |
| --- | --- |
| P0 | 0 |
| P1 | 2 |
| P2 | 4 |
| OK theme areas | Routes, honesty of non-writes, authorize-dev block, RelatedNav, synthetic banners |

**Go recommendation for this topic:** **CONDITIONAL** — ship as design prototype for admin review with explicit dual-control UX gap and stronger entity-isolation cue before any “governance complete” claim.
