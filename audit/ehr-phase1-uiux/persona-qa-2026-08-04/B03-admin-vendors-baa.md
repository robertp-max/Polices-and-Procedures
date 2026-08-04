# B03 — Administrator — Vendors & BAAs (PHI gate)

- **Routes:** `/#/vendors`, `/#/interoperability`, `/#/security`, `/#/messages`
- **Base:** http://127.0.0.1:5194 (HashRouter) · worktree `ehr_phase1` · app `apps/ehr-prototype`
- **Method:** Static + route-source QA of screen TSX, `workspace.ts` fixtures, navigation, and shell (live browse of Vite failed while `MigrationScreen.tsx` had a transient babel “Duplicate declaration Shield” compile error in phase0 logs; assigned routes compile independently and were verified in source)
- **Verdict:** **CONDITIONAL**
- **Summary:** The Administrator-facing Vendors & BAAs workspace is a credible first-class in-app control plane (not a Policy Suite Master Controls handoff for primary nav). Missing BAA surfaces an explicit “PHI access blocked” callout, expiring renewals are counted and filterable, and Interfaces / Security / compliance messaging cross-links are present. Gaps for survey-ready *prototype* rigor: no sample `expired` vendor, interop adapters do not show live BAA status or auto-disable PHI paths from the BAA record, internal Messages does not demonstrate a hard PHI-to-vendor send gate, and the top-bar still opens Connect as an external rail while sidebar Messages is in-app.

## Checks

| Check | Result | Notes |
| --- | --- | --- |
| `/vendors` loads with title, honesty banner, RelatedNav, StatCards, filters, inspector | **OK** | `VendorsBaaScreen` — kicker “Domain TPR · vendors & BAAs”; sub: “PHI access gated on BAA lifecycle — in-app control plane, not Master Controls rail”; synthetic banner; `RelatedNav route="/vendors"` → Interoperability / Security / Migration; stats Vendors / PHI blocked / Expiring / Active; search + status filters; list + inspector. |
| Missing/expired BAA blocks PHI (design intent) | **CONDITIONAL** | Missing (`vnd-4` Field telemetry pilot) shows `PHI access blocked` + “Production design gates credentials and interfaces until BAA is active.” Count rolls missing+expired into “PHI blocked.” **No `expired` fixture** exists (type + filter support it; sample data does not). Prototype banner honestly states BAA status does **not** gate real PHI in this build. |
| Expiring renewals visible | **OK** | `vnd-2` Labs-R-Us · status `expiring` · renewal “28 days”; StatCard “Expiring”; filter chip “Expiring”; nav badge `2` on Vendors & BAAs (attention-oriented). Expiring does **not** use the red PHI-blocked callout (correct: still active until lapse). |
| Links to interfaces / interop | **OK** | Header action “Interoperability”; RelatedNav; per-vendor Continue-in includes Interfaces for WellSky + Labs-R-Us; Interoperability reverse-links Vendors on header, RelatedNav, many adapters, and Contract tab “Open vendors & BAAs” + copy “Production credentials stay dark until vendor BAA is active.” |
| Not external rail (primary destinations) | **OK / residual P1** | Sidebar `/vendors` and `/messages` are `status: 'built'` in-app routes (no `integrationId`). Subcopy rejects Master Controls / Connect as nav destinations. **Residual:** top-bar messages icon still `href={getIntegrationHref('connect')}` (port 5192, new tab). `integrationTargets.vendorBaaControl` and MVP Policy still describe CTRL-042 / Master Controls as a rail for BAA ownership — narrative tension with TPR in-app screen. |
| `/interoperability` related to BAA/PHI gate | **OK** | Banner requires “BAA-active vendors, contract tests, and SEC gates.” Contract tab BAA dependency language. Replay disabled for shadow/down/failing tests (visual-only). Adapter→Vendors related links present; **no per-adapter BAA status chip** or join to `VENDOR_BAAS` ids. |
| `/security` Vendor BAA gate control | **OK** | `SEC-25` “Vendor BAA gate” · target “No PHI without active BAA” · status `at-risk` · gap “1 missing BAA vendor” · related → Vendors + Interoperability · reqIds SEC-007 / TPR-001. |
| `/messages` PHI / BAA workflow | **CONDITIONAL** | In-app threads; compliance channel `msg-4` “BAA renewal · Labs-R-Us” with preview “block new PHI until renewed” and Continue-in → Vendors / Security / Interfaces. Compose is visual-only (title). **No UI that refuses a vendor/PHI-bearing message when BAA is missing/expired** (gate is narrative + inventory, not enforced in Messages). |
| Honesty: incomplete never looks complete | **OK** | Register/renew/compose/replay/drill are visual-only with footnotes; synthetic banners on all four routes. |
| Cross-links sensible for Admin TPR lens | **OK** | Vendors ↔ Interop ↔ Security ↔ Migration; Messages compliance thread ↔ Vendors; SEC-25 ↔ Vendors. Field telemetry missing BAA links Field visits + Security but **not** Interoperability (minor gap vs EVV adapter story). |

## Findings

### P0

_None for prototype honesty / patient-safety false completeness on these routes._ BAA non-gating of real PHI is disclosed on the vendors banner.

### P1

1. **No hard PHI messaging / interface action tied to BAA status in the Messages or Interop inspectors.**  
   Administrator expectation from TPR-002 (“Block PHI until agreements… Technical connection and production credential issuance are gated”) is only partially modeled: inventory callout + copy, not a demonstrated blocked action path from a non-compliant vendor into messaging or adapter credentials. Severity P1 for Admin persona survey story, not P0 false-completion (actions are already visual-only).

2. **Sample register lacks an `expired` BAA row.**  
   Filters and blocked math support `expired`, but fixtures only cover `active` / `expiring` / `missing`. Admin cannot walk the expired → PHI blocked path with data.

3. **Shell residual external Connect rail conflicts with “Messages is not Connect.”**  
   Sidebar `/messages` is in-app; top-bar MessagesSquare still opens Connect (`getIntegrationHref('connect')`). Undermines the “not external rail” claim for the messaging surface an Admin may use to chase BAA renewals.

4. **Dual ownership narrative: in-app TPR vs CTRL-042 Master Controls rail.**  
   Vendors screen claims in-app control plane; `integrationTargets.vendorBaaControl` + MVP Policy still position Policy Suite Master Controls / CTRL-042 as authoritative BAA gate. Admin cannot tell which system is canonical for production credential revoke.

### P2

1. Interop adapters name vendors generically (“Reference lab”) without binding to `vnd-2` Labs-R-Us expiring BAA — weak join for renewal drills.
2. Expiring vendors have no “renewal window” callout in the inspector (only list meta + global StatCard).
3. “Register vendor” primary is visual-only without `disabled` attribute (relies on title + footnote) — weaker than screens that hard-disable unsafe actions.
4. Field telemetry (`missing`) Continue-in omits Interoperability despite EVV aggregator interface existing under FHR.
5. Nav badge hardcoded `2` rather than derived from blocked+expiring counts (coincidentally aligned today).

## What works

- First-class **Vendors & BAAs** Administration nav item with honest synthetic framing and Admin-readable PHI blocked / expiring / active posture.
- Clear **missing → PHI access blocked** inspector pattern; production design language for credentials and interfaces.
- **Expiring** Labs-R-Us path with renewal countdown, compliance message thread, and deep links to Interfaces and Security.
- **Interoperability** Contract tab explicitly depends on BAA-active vendors; reverse navigation to Vendors is easy.
- **Security SEC-25** surfaces the Vendor BAA gate as an at-risk control with the correct 1-missing gap story.
- **Messages** is an in-app prototype (not sidebar rail) with a dedicated compliance BAA renewal thread — good Admin ops loop sketch.
- RelatedNav and Continue-in patterns keep TPR, FHR, SEC, and COR connected without implying production writes.

## Route evidence (source)

| Route | Screen | Data |
| --- | --- | --- |
| `/vendors` | `apps/ehr-prototype/src/screens/VendorsBaaScreen.tsx` | `VENDOR_BAAS` in `data/workspace.ts` (`vnd-1`…`vnd-4`) |
| `/interoperability` | `InteroperabilityScreen.tsx` | `INTERFACE_ADAPTERS` |
| `/security` | `SecurityReliabilityScreen.tsx` | `SEC_CONTROLS` incl. `SEC-25` |
| `/messages` | `MessagesScreen.tsx` | `MESSAGE_THREADS` incl. `msg-4` BAA renewal |

Key UI intent quotes:

- Vendors sub: *“PHI access gated on BAA lifecycle — in-app control plane, not Master Controls rail.”*
- Vendors banner: *“BAA status does not gate real PHI. Production requires executed agreements before credentials or interfaces go live.”*
- Missing/expired callout: *“PHI access blocked”* / *“gates credentials and interfaces until BAA is active.”*
- Interop Contract: *“Production credentials stay dark until vendor BAA is active.”*
- Messages sub: *“design prototype, not Connect rail.”*

## Persona quote

> “I can finally see BAAs next to interfaces and security without leaving the EHR, but until missing and expired agreements actually block a demo credential or vendor-facing message path—and until we stop half-opening Connect from the top bar—I still can’t prove the PHI gate to a surveyor or my privacy officer.”
