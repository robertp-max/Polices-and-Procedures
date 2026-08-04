# R08 — Exclusions (Fable `EHR_Prototype` / Connect / Employee Journey)

**Mode:** REVIEW ONLY (no product code changes)
**Agent:** R08
**Date:** 2026-08-03
**Worktree:** `Policies_and_Procedures_V2_worktrees/merge-local-app-surfaces-2026-08-03`
**Branch:** `codex/merge-local-app-surfaces-2026-08-03`
**Range:** `7b0b6ae6..HEAD`
**Base:** `7b0b6ae68456aa4aa353a69009ea3465767e48ec`
**HEAD:** `dae8e24bf661b5f66ac612eb36da4e824883b5bb`
**Commits in range:** 31
**Paths in `git diff --name-only`:** 599

---

## Verdict

| Check | Result |
| --- | --- |
| No **Fable** / **`EHR_Prototype`** worktree paths in name-only delta | **PASS** |
| No **Connect** application source trees in name-only delta | **PASS** |
| No **employee-journey** application source trees in name-only delta | **PASS** |
| **Overall R08** | **PASS** |

---

## Method

```text
git diff --name-only 7b0b6ae6..HEAD
git ls-files '*EHR_Prototype*' '*Fable*' '*employee-journey*' '*employee_journey*' '*EmployeeJourney*'
```

Filters applied to the 599 name-only paths:

| Pattern class | Intent |
| --- | --- |
| `EHR_Prototype`, `Fable`, `worktrees/…/EHR` | Ban Fable worktree path segments as merge-tree members |
| `^connect/`, `^employee-journey/`, `packages/connect/`, path segment `/employee-journey/` | Ban external Connect / Journey **source trees** |
| Loose `connect` / `journey` substring | Noise classification (audit filenames vs host LMS) |

This agent scores **path names only** (per task). Content provenance of files under approved destinations (e.g. inventory notes that `apps/ehr-prototype` was later filled from branch/worktree material) is out of band for FAIL/PASS here; see inventory notes below.

---

## 1. Fable / `EHR_Prototype` paths — **PASS**

### Strict (exclusion) hits

| Query | Matches in `7b0b6ae6..HEAD` name-only |
| --- | --- |
| Path contains `EHR_Prototype` (underscore Fable tree name) | **0** |
| Path contains `Fable` | **0** |
| Path contains `worktrees` / absolute machine path as a path component | **0** |
| `git ls-files '*EHR_Prototype*' '*Fable*'` at HEAD | **empty** |

### Allowed EHR paths present (not Fable tree paths)

These **do** appear and are **in-scope merge destinations**, not the banned Fable worktree root:

| Prefix | Count | Role |
| --- | --- | --- |
| `apps/ehr-prototype/` | 67 | Interactive Vite EHR app (merge-tree product surface) |
| `apps/ehr-prototype-static/` | 21 | Static mirror (Temp provenance; isolation README) |

**Apps tree in delta is only these two prefixes** (88 `apps/*` paths total). No third EHR tree and no path shaped like:

- `…/EHR_Prototype/…`
- `Policies_and_Procedures_V2_worktrees/EHR_Prototype/…`
- `Fable/…`

### Note (provenance vs path names)

`MERGE_INVENTORY_2026-08-03.md` documents later **content** sourcing into destination `apps/ehr-prototype/` (including user-requested overlay from the Fable worktree / `origin/EHR_Prototype`). That does **not** introduce Fable **path names** into the merge tree. R08 path-name gate remains **PASS**. Content-lineage risk, if any, belongs to inventory / product review, not this exclusion path check.

---

## 2. Connect source trees — **PASS**

| Query | Matches |
| --- | --- |
| Paths under `connect/`, `apps/connect/`, `packages/connect/` | **0** |
| Product paths whose names embed a Connect app tree | **0** |
| Submodule / `.gitmodules` for Connect | **none** |
| Root `package.json` dependency on Connect app package | **none** (`connect-history-api-fallback` only — unrelated history-API polyfill) |

### Substring `connect` (name-only) — audit only

| Path | Classification |
| --- | --- |
| `audit/merge-2026-08-03/wave-1/W1-A10-connect-repo-analyst.md` | Separation **audit report** (not Connect source) |
| `audit/merge-2026-08-03/wave-2/W2-QA10-connect-separation-qa.md` | Separation **QA report** (not Connect source) |

Reception is expected to **link out** to Connect (e.g. `http://127.0.0.1:5192/`) without vendoring Connect sources. That is compatible with this PASS.

---

## 3. Employee Journey source trees — **PASS**

| Query | Matches |
| --- | --- |
| Paths under `employee-journey/`, `employee_journey/`, `EmployeeJourney` | **0** |
| `git ls-files '*employee-journey*' '*employee_journey*' '*EmployeeJourney*'` | **empty** |
| Submodule for employee-journey | **none** |

### Substring `journey` (name-only) — **not** the external Journey repo

Hits fall into host product / audit categories already distinguished by Wave-2 QA11:

| Category | Examples | Verdict |
| --- | --- | --- |
| Host policy LMS | `src/policy/journey/**` (training modules, DON/ACHC, advanced training) | **Not** external `employee-journey` repo; pre-existing host surface extended in range |
| Governance generated | `src/v6/screens/governance/v33/generated/policyJourney.*`, `MyJourneyApp.tsx` | Host governance portal, not employee-journey app tree |
| Audit reports | `W1-A11-journey-link-verifier.md`, `W2-QA11-journey-link-qa.md` | Documentation of external link separation |

No path names match the external Employee Journey application root or a vendor copy of that repo.

---

## 4. Top-level delta shape (context)

| Top-level prefix | Path count |
| --- | --- |
| `src` | 245 |
| `audit` | 93 |
| `apps` | 88 (`ehr-prototype` + `ehr-prototype-static` only) |
| `public` | 83 |
| `server` | 79 |
| `scripts` | 5 |
| `docs` | 2 |
| root misc (`.gitignore`, `package.json`, inventory, eslint) | 4 |

No excluded top-level trees (`connect`, `employee-journey`, `EHR_Prototype`, `Fable`).

---

## 5. Consistency with prior audits

| Source | Claim | R08 re-check at HEAD `dae8e24b` |
| --- | --- | --- |
| W2-QA15 / W2-QA01 (tip `13051d6e` era) | No Fable / Connect / Journey **source** paths | Still true on name-only at HEAD |
| W2-QA10 / W2-QA11 | Connect & Journey stay external | Still true (links/docs only) |
| Recon `RECONCILIATION_REPORT.md` §3 | Fable name-only PASS; Connect/Journey repos PASS | **Confirmed** |

Prior 32-agent package is **stale for product QA** after `13051d6e`, but the **exclusion path-name invariant** still holds at current HEAD.

---

## 6. Residual notes (do not flip R08)

1. **Allowed** `apps/ehr-prototype*` destinations dominate “ehr-prototype” substring matches; do not confuse hyphenated merge paths with underscore Fable `EHR_Prototype`.
2. Host `src/policy/journey/**` is **not** the external `employee-journey` tree.
3. Inventory may still describe Fable/branch **content** provenance for `apps/ehr-prototype`; R08 does not re-litigate that — only path membership.
4. Uncommitted worktree dirt (if any) is outside `7b0b6ae6..HEAD` name-only and was not scored here.

---

## Final score

```text
R08 EXCLUSIONS: PASS
  - Fable / EHR_Prototype paths in git diff --name-only 7b0b6ae6..HEAD: ABSENT
  - Connect source trees in name-only: ABSENT
  - employee-journey source trees in name-only: ABSENT
```
