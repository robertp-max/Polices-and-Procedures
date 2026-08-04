# B02 — Administrator — Users & access / IAM

- **Routes:** `/users-access`, `/security`, `/org-master` (HashRouter base `http://127.0.0.1:5194/#`)
- **Persona:** Administrator
- **Topic:** Users & access / IAM
- **Worktree:** `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1`
- **App path:** `apps/ehr-prototype`
- **Method:** Source-first design-prototype QA of live-wired screens and synthetic data (`UsersAccessScreen.tsx`, `SecurityReliabilityScreen.tsx`, `OrgMasterScreen.tsx`, `workspace.ts` ACCESS_PRINCIPALS / SEC_CONTROLS / ORG_CONFIGS, `App.tsx` routes, `RelatedNav`). Direct `open_page` to `127.0.0.1:5194` was unavailable from this agent runtime; routes are registered and port history is present in `audit/ehr-phase1-uiux/phase0/vite-5194.log`.
- **Verdict:** **CONDITIONAL**
- **Summary:** Users & access is a mature IAM prototype surface: directory + inspector, kind/status filters, scopes tab, synthetic banner, and visual-only invite/revoke/break-glass footers. Workforce vs contractor vs service is modeled in data and filters. Dual-control is only partially surfaced (service-account revoke blocked with dual-owner copy; privileged human revoke is still a single primary button with “visual only” footnote). Break-glass is honest as non-mutating UI, but does not yet design IAM-005 grant fields (reason, patient/duration scope, step-up, expiry, notification, independent review). Security and Org master cross-link correctly and keep gaps/dual-approval visible.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| Load success · `/users-access` | OK | Routed in `App.tsx` → `UsersAccessScreen`; title “Users & access”; kicker Domain IAM. |
| Load success · `/security` | OK | → `SecurityReliabilityScreen`; title “Security & reliability”; control register + inspector. |
| Load success · `/org-master` | OK | → `OrgMasterScreen`; title “Organization & master data”; config register + inspector. |
| Title / domain kicker present | OK | IAM / SEC / GOV kickers on all three screens. |
| RelatedNav present | OK | `/users-access` → Org master, Security, Traceability; `/security` → Users & access, Vendors, Legal holds; `/org-master` → Users & access, Vendors, Requirements (`ROUTE_RELATED` in `workspace.ts`). |
| StatCards | OK | IAM: Active principals, Access reviews due, Break-glass (30d), Pending invites. SEC: Controls, At risk/gap, Not tested, Incidents (30d)=0 synthetic. GOV: Legal entity=1, Pending, Scheduled, Active/approved. |
| Filters | OK | IAM status + kind toolbars; SEC/GOV status filters; search on all three. |
| Inspector | OK | IAM tabs Overview / Scopes / Review; SEC Overview / Proof / Gaps; GOV Overview / Effective date / Change set. |
| **Break-glass honesty** | OK (with design gap) | Banner: no break-glass elevation recorded. Footer/title: “Visual only · no break-glass elevation.” History callout only when `breakGlass` set (USR-2300: “Used once in last 30d · reviewed”). Stat “Break-glass (30d)” = count of principals with history flag (1 in sample), not a live SOC feed. Buttons are not disabled but are labeled visual-only + footnote — meets prototype honesty bar. **Missing IAM-005 grant UX fields** (reason, patient/duration scope, step-up, auto-expiry, notify, after-action review) as structured design affordances. |
| **Role scopes visible** | OK | Dedicated Scopes tab lists declarative scopes per principal (e.g. `chart:read`, `note:write`, `claim:stage`). Role shown in list row and Overview. Copy states production enforces least privilege with audit on grant. |
| **Revoke dual-control** | CONDITIONAL | Service account active revoke **disabled** with “Service account revoke requires dual owner approval in production design.” Disabled accounts blocked (“Already disabled”). Active workforce/contractor: Revoke remains enabled primary with only “visual only · no revoke is written” footnote — **no dual-approver / dual-control UI for privileged human revoke**. Banner claims production dual-control for privileged roles, but the control pattern is incomplete vs service accounts. |
| **Workforce vs contractor distinction** | OK (minor visual) | `AccessPrincipalKind`: `workforce` \| `service` \| `contractor`. Kind filter chips + row/inspector chips. Sample contractor: USR-1988 “Temp contractor”, kind contractor, role Read-only QA, status disabled, scope `chart:read-deid`. Service accounts use Bot icon; **contractor reuses workforce Users icon** — distinction is chip/filter, not iconography. Only one contractor in sample. |
| Cross-links sensible | OK | Header buttons Users↔Security↔Org master; Continue-in links to Clinical, Field visits, Billing, Legal holds, etc.; Security Access review → Users & access; Migration identity stream → Users & access. |
| Incomplete work never looks complete | OK | Flask banners on all three routes; “Met” / “Active” coexist with explicit gap/at-risk/not-tested; access review “does not auto-approve”; org approve disabled for draft/scheduled/already-approved with reasons. |
| Privileged actions honesty | OK | Invite / Break-glass / Revoke / Open incident / Propose change / Approve change: title tooltips + footnotes that nothing is written/filed/activated. |

## Findings

### P0

_None._ No false production completeness, silent legal/clinical mutation, or survey-blocking false attestation on these routes. Prototype labels and non-mutating controls are consistent.

### P1

1. **Privileged human revoke lacks dual-control design surface** (`UsersAccessScreen` `revokeBlocked`)  
   - Dual-control messaging/disable only for `kind === 'service' && status === 'active'`.  
   - Privacy officer / clinical workforce with elevated scopes still show a single primary **Revoke access** (visual-only footnote only).  
   - Administrator expectation: privileged revoke (and break-glass grant) should preview dual-control / second approver the same way service-account revoke and Org master dual approval do.  
   - **Evidence:** `UsersAccessScreen.tsx` `revokeBlocked` (lines ~59–65, ~470–482); contrast banner “dual-control for privileged roles” (~142–143).

2. **Break-glass UI does not design IAM-005 control path**  
   - Requirement IAM-005: reason, patient + duration scope, visible warning, step-up auth, automatic expiration, notification, independent after-the-fact review.  
   - UI offers: optional free-text history string, always-on Break-glass button (visual), Break-glass log button (visual), 30d count StatCard.  
   - Honest as non-executing, but an Admin/survey tabletop cannot walk the intended control flow on the mock.  
   - **Evidence:** `requirementsSpec.ts` IAM-005; `workspace.ts` `breakGlass?: string` on USR-2300 only; inspector/footer buttons without grant form.

3. **Requirement IDs on principals include orphans**  
   - Principals/controls reference `IAM-002`, `IAM-003`, `IAM-004`, `IAM-006` (and various SEC-*).  
   - Sample requirements register only defines **IAM-001** and **IAM-005** in `requirementsSpec.ts`.  
   - Req chips navigate to generic `/requirements` (not deep-link/filter).  
   - Risk: Admin believes full IAM corpus is linked when several IDs are not in the register sample.  
   - **Evidence:** `ACCESS_PRINCIPALS` reqIds vs grep of `id: 'IAM-` in `requirementsSpec.ts` (2 hits).

### P2

1. **Contractor iconography same as workforce** — only Service uses `Bot`; contractor vs workforce both `Users`. Kind chip compensates; still easy to miss at a glance in long directories.

2. **Thin contractor sample** — single disabled temp contractor; no active contractor with time-boxed scopes or vendor/BAA linkage from this screen (vendor surface is separate `/vendors`).

3. **Break-glass / Invite primary affordances look “hot”** — not disabled; honesty relies on title + footer. Acceptable per rubric, but Admin muscle-memory may click expecting workflow steps.

4. **Break-glass (30d) StatCard** — counts rows with `breakGlass` truthy, not time-bounded events; subcopy “Reviewed when present” is calm but metric is sample-derived, not a log length.

## What works

- Clear IAM workspace pattern: directory list + inspector, filters, empty state, StatCards, RelatedNav.
- Explicit **synthetic** banner: no directory write, privilege grant, or break-glass elevation recorded; production dual-control called out for privileged roles.
- **Scopes** are first-class and readable; least-privilege language is present.
- **Kind model** (workforce / service / contractor) is real in types, filters, chips, and sample data — contractor is not silently merged into workforce.
- **Service-account revoke dual-control** is an excellent honesty pattern (disabled + reason).
- **Access review** panel: no auto-approve; certify/reduce/revoke framing; quarterly workforce / annual service cadence sample.
- **Security** screen keeps Access review “at-risk” and Audit log completeness “not-tested” — does not pretend SOC readiness; links back to Users & access.
- **Org master** dual-approval callout for in-review payer config and legal-entity isolation (Care Indeed Home Health Care, Inc. only) supports Admin governance posture adjacent to IAM.
- Cross-route navigation among the three assigned routes is wired in headers and RelatedNav.

## Persona quote

> “I can see who is workforce, contractor, or service and what scopes they hold, and I trust that revoke and break-glass don’t silently write — but until dual-control shows up for privileged human revokes and break-glass has a real grant checklist, I would not use this screen as my survey story for emergency access or same-day access termination.”

## Route detail (Administrator lens)

### `/users-access` — Users & access

| Element | Observation |
| --- | --- |
| Sample size | 6 principals: 4 workforce, 1 service (Billing bot), 1 contractor (disabled temp) |
| MFA visibility | On/off/N/A chips; pending invite with MFA off warned |
| Review states | active, review-due, pending-invite, disabled represented |
| Actions | Invite user (visual); Break-glass (visual); Revoke (conditional disable) |
| Related | Security, Org master (header + RelatedNav) |

### `/security` — Security & reliability

| Element | Observation |
| --- | --- |
| Controls | 6 synthetic controls incl. Access review (at-risk · 5 users past window), Audit log completeness (not-tested), Vendor BAA gate (at-risk) |
| Honesty | Banner: no vulnerability remediated, no hold applied, no incident filed; drills visual only |
| IAM link | Access review + Audit log → Continue in Users & access |

### `/org-master` — Organization & master data

| Element | Observation |
| --- | --- |
| Entity | Single legal entity card: Care Indeed Home Health Care, Inc. |
| Dual control | In-review payer contracts: “Awaiting dual approval”; Approve disabled by lifecycle status with explicit reasons |
| IAM adjacency | RelatedNav to Users & access; identity lifecycle still owned by `/users-access` |

## Severity rollup

| Severity | Count |
| --- | ---: |
| P0 | 0 |
| P1 | 3 |
| P2 | 4 |
| Verdict | **CONDITIONAL** |

## Sources (absolute paths)

- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\UsersAccessScreen.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\SecurityReliabilityScreen.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\screens\OrgMasterScreen.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\data\workspace.ts` (`ACCESS_PRINCIPALS`, `SEC_CONTROLS`, `ORG_CONFIGS`, `ROUTE_RELATED`)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\data\requirementsSpec.ts` (IAM-001, IAM-005)
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\App.tsx`
- `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\ehr_phase1\apps\ehr-prototype\src\components\RelatedNav.tsx`
