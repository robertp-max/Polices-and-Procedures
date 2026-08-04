# R10 — Inventory staleness audit

**Mode:** REVIEW ONLY (no product edits)
**Agent:** R10 inventory-stale
**Date:** 2026-08-03
**Artifact under review:** `MERGE_INVENTORY_2026-08-03.md`
**Compared against:** worktree / branch HEAD `dae8e24bf661b5f66ac612eb36da4e824883b5bb`
**Branch:** `codex/merge-local-app-surfaces-2026-08-03`
**Base (still correct):** `onboarding_specialized` @ `7b0b6ae6`
**Inventory last content commit:** `7f40b8a1` (*feat(ehr): add wizard-of-oz MVP policy rails*, 2026-08-03 19:11)
**HEAD tip after inventory:** `dae8e24b` (*Vendor + Contractor management UI*, 19:15) — **not reflected in inventory**

---

## Verdict

| Field | Value |
| --- | --- |
| Inventory current vs HEAD? | **NO — STALE** |
| Gaps documented in this report? | **YES** |
| **R10 result** | **PASS** (staleness found and enumerated; gate is “gaps documented,” not “inventory already rewritten”) |

`MERGE_INVENTORY_2026-08-03.md` remains useful as a historical merge narrative for reception + static EHR + early EHR app + governance + MVP rails, but it is **not a complete description of committed HEAD** and it **does not match the dirty working tree** on reception launchers.

---

## Scope of comparison

| Lens | Tip / state |
| --- | --- |
| Inventory commits table (max) | Ends at `e2b1e4c8` (9 feature rows) |
| Inventory body (latest sections) | Includes governance V3 + Compliance refresh + Wizard-of-Oz MVP (through ~`7f40b8a1`) |
| Committed HEAD | `dae8e24b` — **31** commits on `7b0b6ae6..HEAD` |
| Working tree (uncommitted) | 6 modified product files + untracked `audit/recon-2026-08-03/` |
| Prior 32-agent QA tip | `13051d6e` — inventory Build/QA and W1-A15 claims predate Phase B expansion |

Cross-ref: `audit/recon-2026-08-03/RECONCILIATION_REPORT.md` (same HEAD; Phase A/B/C timeline).

---

## 1. Outdated or incomplete claims (primary list)

### 1.1 Commit ledger incomplete

| Inventory claim | Reality at HEAD | Status |
| --- | --- | --- |
| “Commits on merge branch” lists 9 SHAs ending at `e2b1e4c8` | Branch has **31** commits from base; 12 product commits after `e2b1e4c8` alone | **STALE / incomplete** |
| Implied tip ≈ full EHR import @ `e2b1e4c8` | Tip is `dae8e24b` | **STALE** |
| W1-A15 verification “pre-refresh tip `60f17bb5`” | Correct as a **historical** check; no longer describes branch tip | **STALE as current status** |

**Missing from inventory commit table (post-`e2b1e4c8`, product):**

| Commit | Subject (abbrev.) | Inventory coverage |
| --- | --- | --- |
| `efc9b1ca` | finish EHR reception integration | Partial via later body text only |
| `affbb058` | fix reception workspace launch destinations | Body URLs only |
| `76838548` | fix reception external launcher targets | Body URLs only |
| `c6be5bb0` | fix governing body reception launcher | Body only |
| `4cbc8d50` | feat(governance): merge latest V3 portal | **Body section yes; commits table no** |
| `78336eef` | fix(governance): tabletop completion actions | **Undocumented** |
| `a724b101` | ehr-prototype business plan / requirements sync | **Undocumented** |
| `d88c04b0` | controls P3 canonical registry | Partial (Compliance section SHAs only) |
| `99165afe` | controls P4 readiness engine | Partial |
| `c607b9ec` | compliance execution workspace sync | Partial |
| `7f40b8a1` | EHR wizard-of-oz MVP policy rails | **Body section yes; commits table no** |
| **`dae8e24b`** | **Vendor + Contractor management UI (UI only)** | **MISSING entirely** |

Audit-only commits between early inventory and `f05cca59` are also omitted (expected for a product inventory, but the table still oversells completeness).

---

### 1.2 EHR ports / dual-app story

| Inventory claim | HEAD / live reality | Status |
| --- | --- | --- |
| EHR launcher → `http://127.0.0.1:5194/` | **Still true** in committed + working `ReceptionScreen.tsx` (`EHR_PROTOTYPE_URL`) | **CURRENT** |
| `apps/ehr-prototype` dev URL 5194; `strictPort` | Confirmed in `apps/ehr-prototype/vite.config.ts` and package `dev` script | **CURRENT** |
| Static fallback 5191 (`apps/ehr-prototype-static`) | Tree still present; serve note still valid | **CURRENT as fallback path** |
| Dual ports documented as active product story | Inventory mentions both, but W1-A15 and early narrative still mix “static mirror handoff” with “source app” without stating **5194 is the Reception target and 5191 is legacy fallback only** as a hard contract | **PARTIAL / needs hardening** |
| Historical wave-1 era: some agents still thought EHR → 5191 | Inventory correctly moved to 5194 for launcher; do not regress | **OK if readers use latest body** |

**Not stale (port number itself):** 5194 for interactive EHR is accurate.
**Gap:** inventory does **not** record that live 5194 is now served from **this merge worktree’s** `apps/ehr-prototype` (Fable/`EHR_Prototype` worktree is no longer the runtime owner of 5194). Recon live sample documented that attribution elsewhere; inventory still implies source tree copy without current process ownership.

---

### 1.3 Vendor / Contractor (largest product gap in inventory)

| Inventory claim / omission | HEAD reality | Status |
| --- | --- | --- |
| No section for Vendor Management or Contractor Management product surfaces | **`dae8e24b`** adds UI under Registry & Contracts | **OMISSION / STALE** |
| “Vendor BAAs” only as Wizard-of-Oz handoff to Master Control `CTRL-042` on 5201 | Still true for **EHR MVP rails** (`apps/ehr-prototype` → `getIntegrationHref('vendorBaaControl')`) | **CURRENT for MVP only** |
| Implied vendor story = control dossier deep-link | **Also** full mock-backed app routes: `/compliance/vendors*`, `/compliance/contractors*` | **INCOMPLETE** |

**Present on HEAD but absent from inventory:**

- `src/v6/screens/pageviews/VendorManagementScreen.tsx`
- `src/v6/screens/pageviews/ContractorManagementScreen.tsx`
- `src/v6/screens/pageviews/ComplianceManagementShell.tsx`
- `src/complianceManagement/{api,mockData,types}.ts` (mock / UI-only)
- ≥10 vendor + contractor routes in `src/v6/routing/routeRegistry.ts`
- CES nav awareness in `navigationManifest.ts` (`vendor-management`, `contractor-management`)

**Residual product caveats (should be inventoried, not just “merged”):**

- Explicit **UI only** — no real `/api/vendors` or `/api/contractors`
- Weak Compliance Home / Master Controls deep-link discovery (copy vs navigable entry)
- Not covered by the 32-agent wave QA package

Word “vendor” in inventory almost only means **“vendor static EHR mirror”** (`e0c678ed`) or **CTRL-042 BAA handoff** — not the management module.

---

### 1.4 Governance

| Inventory claim | HEAD reality | Status |
| --- | --- | --- |
| Governing Body V3 from `codex/governing-body-v3-executive-readiness-os` @ `f67b794a` + worktree files | Large `src/v6/screens/governance/**` (~173 files) + `server/governance` + `server/routes/governance*.ts` present | **Largely CURRENT** as inclusion claim |
| Routes `/governance`, meetings, decisions, workflows, evidence, academy, … | Registered in `routeRegistry.ts` under Governing Body family | **CURRENT** |
| Local route `http://127.0.0.1:5201/governance` | Policy app on 5201 is the merge worktree surface used in inventory browser checks | **CURRENT as intended local origin** |
| Reception Governing Body → `/governance` | Committed + WT: `GOVERNING_BODY_PORTAL_ROUTE = '/governance'` | **CURRENT** |
| Browser correction table (tabletop, academy GB-001, Executive Readiness Office) | Historical PASS at write time; **not re-proven at `dae8e24b`** | **STALE as living QA** |
| No mention of `78336eef` tabletop completion fix | Landed after governance merge | **OMISSION** |
| Explicitly not older `feature/governing-body-portal` | Still correct intent | **CURRENT** |

**Gap type:** governance **presence** is documented; governance **post-merge fixes**, test/browser currency, and relationship to vendor/controls expansions are not.

---

### 1.5 Reception launcher URLs (committed vs inventory vs working tree)

| Target | Inventory | Committed HEAD `dae8e24b` | Working tree (uncommitted) | Status |
| --- | --- | --- | --- | --- |
| EHR | `http://127.0.0.1:5194/` | same | same | **CURRENT** |
| Governing Body | `/governance` | same | same | **CURRENT** |
| Find A Home Care | Cloud Run FAHC provider login | same | same | **CURRENT** |
| Journey | `http://127.0.0.1:5193/journey/training?persona=taylor-rn` | **same as inventory** | `…/journey?persona=taylor-rn` (**drops `/training`**) | **Inventory matches HEAD; STALE vs WT** |
| Connect | `http://127.0.0.1:5192/` | **same as inventory** | `http://127.0.0.1:5192/?view=home` | **Inventory matches HEAD; STALE vs WT** |
| All destinations `_blank` | Claimed PASS | Present | a11y/`noopener` polish uncommitted | **Partial** |

**R10 note:** inventory Journey/Connect strings are **not wrong for pure committed HEAD**. They **are** outdated relative to the user’s uncommitted reception corrections already in this worktree. Any “ship the dirty tree” decision must refresh inventory to the WT URLs.

---

### 1.6 Local URL table / reception preview port

| Inventory claim | Reality | Status |
| --- | --- | --- |
| Reception preview `http://127.0.0.1:5179/reception` (reception_area worktree) | Merge worktree browser proofs and recon use **`5201`** for this branch’s Vite policy app | **STALE as primary merge reception URL** |
| Local app URLs table lists Drive, 5179 reception, EHR 5194/5191, Connect, Journey, qapi 5187 | Missing: **merge policy app 5201**, **Governance**, **Compliance**, **Vendor/Contractor**, **MVP rails 5201 handoffs** (MVP has its own section but not the table) | **INCOMPLETE** |
| Browser checks mix 5179 (snapshot table) and 5201 (governance correction table) | Two different origins without a single “canonical merge UI port” row | **CONFUSING / partial** |

---

### 1.7 Build / QA snapshot currency

| Inventory claim | Reality | Status |
| --- | --- | --- |
| `npm run build` **PASS** | Claim from earlier inventory/gate era; **not re-run/re-certified for `dae8e24b` in this R10** | **UNVERIFIED at HEAD** |
| `npm run lint` **PASS** — 0 errors; 712 warnings | Wave-2 final release at `13051d6e` was **NO-GO** (lint/tests red); later `f05cca59` claims gate close — inventory numbers may predate vendor/gov expansion | **STALE / conflicted with wave-2 tip** |
| `npm test` **PASS** — 72 files, 792 tests | Same: not proven for tip with vendor + controls + governance tabletop fix | **STALE as HEAD certificate** |
| Sibling `src/**/*.js` shadows: none | Not re-checked this agent | **N/A this pass** |
| Drive health 5188 / `drive.reachable: true` | Runtime/env; not re-probed here | **N/A this pass** (claim type is env-dependent) |
| Wave-1 inventory verification table all **OK** | Valid only through early tip (~`60f17bb5` / pre-Phase B) | **STALE as current gate** |

---

### 1.8 What was merged / confirmation blocks

| Inventory claim | Reality | Status |
| --- | --- | --- |
| Method: approved copies + cherry-picks; EHR working tree added later | Still the historical method narrative | **HISTORICAL OK** |
| “Latest `EHR_Prototype` working-tree overlay — 3 modified and 9 untracked app files” | Later commits (`a724b101`, `7f40b8a1`, etc.) further changed `apps/ehr-prototype`; “3+9” snapshot is frozen-in-time | **STALE as current EHR tree description** |
| “Connect / Journey sources in diff — Not included” | Still true for **source repos** (links only) | **CURRENT** |
| Confirmation: only EHR app dir copied; dirty root not staged | Still the isolation story for Phase A; Phase B/C product commits on this branch go far beyond that copy set | **INCOMPLETE as full branch summary** |
| Intentionally excluded: older GB portal, secrets, Connect/Journey repos | Still correct | **CURRENT** |

---

### 1.9 Compliance / controls / MVP sections

| Inventory claim | Reality | Status |
| --- | --- | --- |
| Compliance refresh from GB V3 lineage (`9de7f2e0` screen, `bb35dfa2` registry, `15743682` engine) | Related controls/compliance commits present (`d88c04b0`, `99165afe`, `c607b9ec`) | **Directionally CURRENT** |
| MVP substitution table (eCign/forms/Connect/CTRL-042 on 5201) | Matches `apps/ehr-prototype/src/data/integrationTargets.ts` (`POLICY_APP_PORT = 5201`, `CONNECT_APP_PORT = 5192`) | **CURRENT for code** |
| `MasterControlsScreen` accepts `control` query param | Confirmed (`searchParams.get('control')`) | **CURRENT** |
| MVP is the only vendor story | Superseded by full Vendor UI on HEAD | **INCOMPLETE** |

---

### 1.10 Drive / API port wording

| Inventory claim | Reality | Status |
| --- | --- | --- |
| Working Drive **only** 5188; 5187/5173 **not** working Drive | Still the documented contract; wave-2 QA agreed | **CURRENT as policy** |
| API **8790** paired with 5188 | Default Vite proxy target in this tree is `http://localhost:8787` (`vite.config.ts`); 8790 is an env/runtime convention from main/Drive ops, not the package default | **POTENTIALLY CONFUSING** (not necessarily false for the main checkout Drive stack) |

---

## 2. Claims that remain accurate (non-stale anchors)

Keep these when rewriting inventory; do not “fix” them away:

1. Branch name, worktree path, base `7b0b6ae6`, safety branch `safety/onboarding_specialized-2026-08-03` @ base.
2. Reception route `/reception`, default landing, safeRedirect/`BRAD_DEFAULT_ROUTE`.
3. Reception workspaces include Compliance, Journey, Connect, Governing Body, Find A Home Care, EHR Prototype (names/roles).
4. EHR interactive app lives under `apps/ehr-prototype` on **5194**; static mirror under `apps/ehr-prototype-static` on **5191**.
5. qapi docs paths: `docs/ehr-development-inventory.md`, `docs/ehr-uiux-discovery-plan.md`.
6. Connect and Employee Journey **source** stay external.
7. Drive: only 5188 is the verified Drive surface; no credentials in repo.
8. Governance portal is V3 executive readiness lineage, not the older portal branch.
9. Wizard-of-Oz MVP rails + CTRL-042 deep-link behavior.

---

## 3. Gap matrix (inventory rewrite checklist)

| # | Gap | Severity | Inventory action |
| --- | --- | --- | --- |
| G1 | Commit table stops at `e2b1e4c8`; tip is `dae8e24b` | High | Replace ledger with full Phase A/B list or “tip + major layers” |
| G2 | Vendor + Contractor management UI missing | **Critical** | New “What was merged” section + UI-only caveat |
| G3 | Governance post-merge `78336eef` missing | Med | Append to governance section |
| G4 | Reception WT Journey/Connect URLs ≠ inventory/HEAD | High if shipping dirty tree | Commit first, then inventory both SHAs and final URLs |
| G5 | 5179 listed as reception preview; merge UI is 5201 | Med | Canonical port table: 5201 policy/merge, 5194 EHR, 5191 static, 5188 Drive, 5192/5193 external |
| G6 | Build/lint/test snapshot not re-run at tip | High for GO | Re-run and replace numbers; mark wave-2 NO-GO as historical |
| G7 | “3 modified / 9 untracked” EHR overlay frozen | Med | Describe current `apps/ehr-prototype` as multi-commit evolution |
| G8 | Dual EHR ports role clarity | Med | Explicit: Reception → **5194 only**; 5191 fallback only |
| G9 | Uncommitted WCAG/advanced-training polish not inventoried | Low–Med | “Working tree deltas” section or clear deferred |
| G10 | 32-agent QA package validity | High for release narrative | State QA certifies only through `13051d6e`; everything after needs new wave |

---

## 4. Evidence pointers (absolute paths)

| Item | Path |
| --- | --- |
| Inventory under audit | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\MERGE_INVENTORY_2026-08-03.md` |
| Reception launchers (WT) | `…\src\v6\screens\pageviews\ReceptionScreen.tsx` (lines ~37–41: 5194, `/governance`, Journey/Connect) |
| EHR port config | `…\apps\ehr-prototype\vite.config.ts` (`port: 5194`, `strictPort: true`) |
| MVP integration targets | `…\apps\ehr-prototype\src\data\integrationTargets.ts` (`POLICY_APP_PORT = 5201`) |
| Vendor routes | `…\src\v6\routing\routeRegistry.ts` (`/compliance/vendors*`) |
| Master control query | `…\src\v6\screens\pageviews\MasterControlsScreen.tsx` (`control` search param) |
| Full recon context | `…\audit\recon-2026-08-03\RECONCILIATION_REPORT.md` |
| This report | `…\audit\recon-2026-08-03\agents\R10-inventory-stale.md` |

---

## 5. Recommended inventory rewrite skeleton (do not apply in R10)

```markdown
# Merge Inventory - 2026-08-03 (rev 2)
- Tip: dae8e24b (+ note uncommitted reception/WCAG if still dirty)
- Phase A: reception, qapi docs, static EHR, audits
- Phase B: interactive EHR app, reception URL fixes, governance V3, tabletop fix
- Phase C: controls P3/P4, compliance sync, MVP rails, Vendor/Contractor UI-only
- Canonical local ports table (5201/5194/5191/5188/5192/5193)
- Explicit non-goals: real vendor APIs, Connect/Journey source merge, secrets
- QA: historical wave-1/2 tip vs re-run required at HEAD
```

---

## 6. R10 conclusion

**PASS.** `MERGE_INVENTORY_2026-08-03.md` is **stale relative to HEAD** on:

- **commit completeness** (stops narratively short of tip),
- **vendor / contractor product surface** (entire `dae8e24b` layer missing),
- **governance completeness** (post-merge tabletop fix omitted; browser table not tip-fresh),
- **reception URL table vs working tree** (Journey path + Connect `?view=home`),
- **merge UI port story** (5179 vs 5201),
- **build/QA certificate age**,
- **EHR overlay snapshot age** (3+9 file claim).

EHR **port 5194 as Reception target** and static **5191 fallback** remain directionally correct; the inventory failure mode is **incomplete evolution and missing vendor layer**, not a wrong primary EHR port number.

No product code or inventory file was modified by this agent (review-only).
