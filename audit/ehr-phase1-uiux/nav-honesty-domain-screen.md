# Nav honesty + DomainScreen polish

**App:** `apps/ehr-prototype`  
**Date:** 2026-08-03  
**Gate:** `npm run verify` — **PASS** (`tsc --noEmit -p .` + `scripts/verify-design.mjs`)

## 1. Audit method

1. Enumerated every `NavItem` in `src/data/navigation.ts` (`status: built | planned | substitute`).
2. Cross-checked every `status: 'built'` `to` path against real `<Route path=…>` entries in `src/App.tsx`.
3. Confirmed every `status: 'planned'` target matches `/domain/:domainId` (uppercase domain id from `REGISTER_DOMAINS`).
4. Reviewed `DomainScreen` for honest “not implemented” copy and requirement-domain content from `REQUIREMENT_REGISTER`.

## 2. Built items ↔ routes

| Nav label | `to` | Route in `App.tsx` | Verdict |
| --- | --- | --- | --- |
| Today | `/today` | `/today` → `TodayScreen` | OK |
| Patients | `/patients` | `/patients` (+ chart params) | OK |
| Referral & intake | `/intake` | `/intake` → `ReferralIntakeScreen` | OK |
| Schedule | `/schedule` | `/schedule` → `ScheduleScreen` | OK |
| Clinical | `/clinical` | `/clinical` → `ClinicalScreen` | OK |
| Orders | `/orders` | `/orders` → `OrdersScreen` | OK |
| Billing & claims | `/billing` | `/billing` → `BillingScreen` | OK |
| Quality & compliance | `/quality` | `/quality` → `QualityScreen` | OK |
| Reports | `/reports` | `/reports` → `ReportsScreen` | OK |
| Design system | `/design-system` | `/design-system` → `DesignSystemScreen` (outside shells) | OK |

**False built items fixed:** none. All 10 `built` entries resolve to a real route.

> Note: AGENTS.md still documents a historical gap where Design system was `built` without a route. That gap is closed in `App.tsx` (live gallery at `/#/design-system`). No nav status change was required.

## 3. Planned items → DomainScreen

| Count | Rule | Result |
| --- | ---: | --- |
| Planned nav items | 21 | All `to: /domain/{DOMAIN_ID}` |
| Domain ids used | COR, EPI, CLN, FLD, HHA, RCM, BEN, QAP, HQR, EMP, DOC, DAT, IAM, GOV, FHR, AIG, SEC, MIG, TRC | All present in `REGISTER_DOMAINS` |
| Catch-all risk | Planned no longer falls through `*` → Today | `/domain/:domainId` is registered under `AppShell` |

`status: 'substitute'` (4 items) correctly remain rails (`integrationId` → external Connect / Policy Suite links), not `built`.

## 4. DomainScreen honesty + polish

### Honesty (copy + data)

- Title status: **Not implemented in this prototype** with `StatusChip tone="neutral"` → “Not built”.
- Copy no longer claims the entire *domain* is empty when sibling surfaces exist (e.g. CLN has Clinical + Orders built while Medications is planned).
- Related nav areas in the same domain are listed with real status:
  - `built` → `StatusChip good` “Built” (and an internal `Link` when not a rail)
  - `planned` → `StatusChip neutral` “Not built”
  - `substitute` → `StatusChip progress` “Connected rail”
- Summary chips count built / not-built / rails for the domain.
- Requirements body still filters `REQUIREMENT_REGISTER` by `domainId` and labels the sample honestly (“sampled statements”, foot note CI-EHR-SRS-PM-001 / not all 170).
- Unknown `domainId` path: calm empty state + single primary “Back to Today”.

### UI/UX Framework alignment

| Principle | Application |
| --- | --- |
| Clinical calm | White cards, hairline separation, orange only on notice icon + single CTA |
| One primary action | Single `.btn-primary`: “Open requirements register” (unknown domain: “Back to Today”) |
| Status never colour-alone | All operational status via `StatusChip` (icon + label); priority MUST/SHOULD/CONDITIONAL also via `StatusChip` |
| Density with air | 18–20px card padding, 8–16px stack gaps, calm area rows |
| Prefix discipline | `.dom-*` only (`domain.css` registered as `dom` in `verify-design.mjs`) |

### Files touched

| File | Change |
| --- | --- |
| `src/screens/DomainScreen.tsx` | Honesty copy, StatusChip everywhere for status/priority, area list with links for built siblings, one primary CTA |
| `src/screens/domain.css` | Calm area rows, summary strip, req card structure polish |
| `src/data/navigation.ts` | No change required (already honest) |
| `src/App.tsx` | No change required (routes already complete) |

**Shared-file etiquette:** no shared shell/ui/token/App.tsx/navigation edits in this change — screen-local only.

## 5. Verification

```text
npm run verify
# 0 error(s), 0 warning(s) across 50 files
# Design guardrail: PASS
```

## 6. Residual notes (out of scope)

- AGENTS.md §1 still describes Design system as unwired; docs drift only — not fixed here to avoid shared-doc scope creep.
- Substitute items open external rails via `integrationId`; their `to: /mvp-policy#…` is unused when `integrationId` is set (AppShell branch). Status remains `substitute`, not `built`.
- Multiple planned items can share a domain id (e.g. two EPI entries, two QAP entries) — DomainScreen correctly aggregates all nav areas for that domain.
