# R07 — Governance V3 tree + control readiness engine

| Field | Value |
| --- | --- |
| Agent | **R07** (Governance / Controls presence recon) |
| Mode | **REVIEW ONLY** — no product edits |
| Date | 2026-08-03 |
| Worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| HEAD | `dae8e24bf661b5f66ac612eb36da4e824883b5bb` |
| Merge base (original package) | `7b0b6ae68456aa4aa353a69009ea3465767e48ec` |
| **Verdict** | **PASS** |

---

## Mission

1. Verify the **governance V3** tree is present and wired into the app.
2. Verify **`controlReadinessEngine`** (P4) and related **P3 canonical registry** artifacts + commits are on HEAD.
3. Report high-level file counts.
4. Emit **PASS / PARTIAL** only (presence recon — not a full QA re-run).

---

## Verdict: **PASS**

| Check | Result | Evidence |
| --- | --- | --- |
| Governance V3 tree on disk | **YES** | `src/v6/screens/governance/v33/**` (168 files) |
| Governance entry surface | **YES** | `GovernanceScreen.tsx` → `MyJourneyApp` under `v33` |
| Routes registered | **YES** | ~20 `/governance*` routes in `routeRegistry.ts`; router fans out `governance/*` |
| Commit `4cbc8d50` (merge latest V3 portal) | **YES** (ancestor of HEAD) | 335 files, +107,852 / −122 |
| Commit `78336eef` (tabletop completion) | **YES** (ancestor of HEAD) | 7 files, +395 / −56 |
| Commit `d88c04b0` (P3 canonical registry) | **YES** (ancestor of HEAD) | 9 files, +9,298 / −2,098 |
| Commit `99165afe` (P4 readiness engine) | **YES** (ancestor of HEAD) | 3 files, +183 / −14 |
| `controlReadinessEngine.ts` present | **YES** | `src/policy/data/controlReadinessEngine.ts` (5,117 bytes) |
| Engine unit tests present | **YES** | `controlReadinessEngine.test.ts` (11 `it` cases) |
| Engine wired into inventory loader | **YES** | `masterControlInventory.ts` imports `deriveControlReadiness` |
| P3 registry + drift gate | **YES** | 4 public JSON copies byte-identical; `controls:generate` / `controls:verify` scripts |
| Canonical control count | **YES** | **116** controls in registry JSON |
| Server GB supporting routes | **YES** | `governanceComplianceEvidence`, `governanceReferences`, `governanceTabletopPackets` (+ tests) |

**Scope note:** This is a **presence / ancestry / structure** recon. Vitest was **not** re-executed here. Prior inventory claimed `npx vitest run src/v6/screens/governance/v33` → 20 files / 240 tests **PASS**; that claim is **not re-validated** in R07.

---

## 1. Related commits (all on HEAD)

| SHA | Subject | Role | Ancestor of HEAD? |
| --- | --- | --- | --- |
| `4cbc8d50` | `feat(governance): merge latest V3 portal` | Bulk V3 portal + `public/gb-visuals/**` | **YES** (`git merge-base --is-ancestor` → 0) |
| `78336eef` | `fix(governance): connect tabletop completion actions` | Post-merge tabletop/compliance evidence fix | **YES** |
| `d88c04b0` | `feat(controls): P3 canonical registry — merge split, provenance, drift gate` | Canonical registry + generator + verify gate | **YES** |
| `99165afe` | `feat(controls): P4 deterministic readiness engine (single source)` | `controlReadinessEngine` + inventory wiring | **YES** |

Timeline (from recon master report Phase B): governance portal merge **16:49**, tabletop fix **17:38**, controls P3/P4 **18:49** — all **after** the 32-agent audit tip `13051d6e`, so prior wave QA is **stale relative to these surfaces**.

### Commit path footprints

**`4cbc8d50` (V3 portal merge)** — 335 paths; includes `src/v6/screens/governance/**`, large `public/gb-visuals/**` asset pack, inventory doc touch.

**`78336eef` (tabletop completion)**

```
server/routes/governanceComplianceEvidence.ts
src/v6/screens/governance/v33/MyJourneyApp.tsx
src/v6/screens/governance/v33/compliance/compliance.css
src/v6/screens/governance/v33/compliance/complianceEvidenceAdapter.ts
src/v6/screens/governance/v33/tabletop2026/TabletopHub.tsx
src/v6/screens/governance/v33/tabletop2026/tests/records.test.ts
src/v6/screens/governance/v33/v33-globals.css
```

**`d88c04b0` (P3 registry)**

```
package.json  (+ controls:generate / controls:verify)
public/MASTER_CONTROL_INVENTORY_DATA_MODEL.json
public/data/MASTER_CONTROL_INVENTORY_DATA_MODEL.json
public/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json
public/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json
scripts/generateControlRegistry.ts
scripts/verifyControlRegistry.ts
src/policy/data/masterControlInventory.ts
src/policy/data/masterControlInventory.test.tsx
```

**`99165afe` (P4 engine)**

```
src/policy/data/controlReadinessEngine.ts
src/policy/data/controlReadinessEngine.test.ts
src/policy/data/masterControlInventory.ts
```

---

## 2. Governance V3 tree — structure & counts

### Totals

| Location | Files | Notes |
| --- | --- | --- |
| `src/v6/screens/governance/` (all) | **173** | `.ts` 95 · `.tsx` 62 · `.css` 15 · `.txt` 1 |
| `…/governance/v33/` only | **168** | Primary V3 product surface |
| Non-v33 governance shell files | **5** | `GovernanceOffice.tsx`, academy catalog/player, `governanceApi.ts`, `governance-office.css` |
| Test files under `v33/**` | **20** | Matches prior inventory “20 files” claim shape |
| `public/gb-visuals/**` | **78** | Academy / scene PNGs from V3 merge |

### `v33` subdirectory file counts

| Subdir | Files |
| --- | --- |
| `tabletop2026/` | 66 |
| `qapi/` | 17 |
| `gb-academy/` | 15 |
| `compliance/` | 13 |
| `tabletop/` | 11 |
| `policies/` | 10 |
| `generated/` | 6 |
| `remediation/` | 6 |
| `assessments/` | 5 |
| `forms/` | 5 |
| `navigation/` | 3 |
| `integrations/` | 1 |
| `references/` | 1 |
| v33 root files | 9 |

### Key entry / wiring paths (absolute)

| Role | Path |
| --- | --- |
| Screen entry | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\src\v6\screens\pageviews\GovernanceScreen.tsx` |
| V3 app shell | `…\src\v6\screens\governance\v33\MyJourneyApp.tsx` (105,684 bytes) |
| Route table | `…\src\v6\routing\routeRegistry.ts` (`/governance`, `/governance/meetings*`, `/governance/oversight`, `/governance/academy*`, …) |
| Router fan-out | `…\src\v6\routing\router.tsx` (`isGovernanceRoute`, `governance/*`) |

`GovernanceScreen` mounts V3 only:

```tsx
// GovernanceScreen.tsx — imports MyJourneyApp + v33 CSS packs; renders <MyJourneyApp />
```

---

## 3. Control readiness engine (P4) + registry (P3)

### Engine

| Artifact | Path | Size |
| --- | --- | --- |
| Engine | `src/policy/data/controlReadinessEngine.ts` | 5,117 B |
| Tests | `src/policy/data/controlReadinessEngine.test.ts` | 2,953 B |
| Consumer | `src/policy/data/masterControlInventory.ts` | 8,743 B |
| Types | `src/policy/types/masterControlInventory.ts` | 7,062 B |

**Behavior (presence-level):** pure `deriveControlReadiness(input)` → 12 operational states (`NOT_APPLICABLE` … `OK`) with deterministic blocker order and a `legacy` map down to `MasterControlReadinessStatus`. Header documents single-source rule: surfaces must not invent their own readiness.

**Test cases present (11):** OK, NOT_APPLICABLE, NOT_CONFIGURED (×2), OPEN_CRITICAL_DEFICIENCY, DOCUMENTATION_MISSING, EVIDENCE_EXPIRED, EVIDENCE_MISSING, SIGNOFF_PENDING, VERIFICATION_OVERDUE, READY_FOR_VERIFICATION.

### Canonical registry copies (P3)

All four public copies **byte-identical** (SHA256 prefix `A16E461EB167…`, size **152,221** bytes each):

1. `public/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`
2. `public/data/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`
3. `public/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`
4. `public/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json`

| Metric | Value |
| --- | --- |
| `controls[]` length | **116** |
| Generator | `scripts/generateControlRegistry.ts` → `npm run controls:generate` |
| Drift gate | `scripts/verifyControlRegistry.ts` → `npm run controls:verify` |
| Related lifecycle scripts | `sync:master-control-inventory`, `build:master-controls`, predev/prebuild sync |

### Server support (governance evidence / tabletop packets)

| File | Role |
| --- | --- |
| `server/routes/governanceComplianceEvidence.ts` (+ `.test.ts`) | Compliance evidence API (touched by `78336eef`) |
| `server/routes/governanceReferences.ts` (+ test) | GB reference documents |
| `server/routes/governanceTabletopPackets.ts` (+ test) | Tabletop packet delivery |
| `server/routes/compliance.ts` | Adjacent compliance routes |

---

## 4. Residual risks / non-blocking notes

| Item | Severity | Note |
| --- | --- | --- |
| No R07 vitest re-run | Low for *presence* | Inventory claims 240 v33 tests PASS; not re-proven at HEAD |
| Surfaces land after 32-agent package tip | Medium for *release QA* | Governance + controls commits are **post-`13051d6e`**; need fresh QA for full green |
| Dual governance shell | Info | Non-v33 `GovernanceOffice` / academy files still sit beside v33; entry uses v33 |
| Controls UI consumers | Info | `MasterControlsScreen` / `ComplianceHomeScreen` load inventory seed; readiness truth is engine-backed via `masterControlInventory` |

None of the above reduce the **presence** verdict below **PASS**.

---

## 5. PASS/PARTIAL criteria applied

| Criterion | Met? |
| --- | --- |
| Governance V3 tree present under `src/v6/screens/governance/v33` | **Yes** (168 files) |
| App entry wires to V3 | **Yes** |
| Related governance commits on HEAD | **Yes** (`4cbc8d50`, `78336eef`) |
| `controlReadinessEngine` present + wired + tested | **Yes** |
| P3 registry + drift tooling present; copies consistent | **Yes** (116 controls, 4 identical copies) |
| Related control commits on HEAD | **Yes** (`d88c04b0`, `99165afe`) |

**→ PASS** (not PARTIAL: no missing primary artifact or missing commit ancestry).

---

## 6. Product edits

**None.** Review-only recon; only this report file was written under `audit/recon-2026-08-03/agents/`.
