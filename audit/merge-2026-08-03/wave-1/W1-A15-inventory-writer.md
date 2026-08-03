# W1-A15 — Inventory / Report Writer

| Field | Value |
| --- | --- |
| Agent | W1-A15 (Inventory/Report Writer) |
| Wave | 1 |
| Date | 2026-08-03 |
| Worktree | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Inventory file | `MERGE_INVENTORY_2026-08-03.md` |
| **Result** | **PASS** |

---

## Mission

1. Review `MERGE_INVENTORY_2026-08-03.md` for accuracy: inclusions, exclusions, Drive URLs (5188 working; 5187/5173 **not** working Drive), Fable exclusion, static EHR path.
2. If incomplete, update additively and commit: `docs: refresh merge inventory after wave-1 verification` (no amend).
3. Confirm inventory does **not** present 5187/5173 as working Drive.

---

## Verdict: **PASS**

Inventory content was **substantively accurate** on all hard requirements before edit. Gaps were **bookkeeping / reinforcement** only:

- Missing polish commit `60f17bb5` in the commits table; branch tip still pointed at `5af4f6fd`.
- Drive section used soft “Not the working Drive URL” wording; strengthened so **only 5188** is canonical working Drive and **5187 / 5173 are explicitly NOT working Drive**.
- Added a Wave-1 verification matrix tied to worktree evidence.

**No false claim** that 5187 or 5173 is working Drive was present before or after the refresh.

---

## Accuracy review (required claims)

### 1. Inclusions

| Inclusion | Inventory says | Worktree check | Status |
| --- | --- | --- | --- |
| Reception launcher | Listed v6 routing/shell + `ReceptionScreen.tsx` from `reception_area` | Files present; commit `79f25bd4` matches file set | **OK** |
| EHR handoff URL | `http://127.0.0.1:5191/` | `ReceptionScreen.tsx` `route: 'http://127.0.0.1:5191'` | **OK** |
| qapi docs | `docs/ehr-development-inventory.md`, `docs/ehr-uiux-discovery-plan.md` | Both exist; commit `2aca52cf` | **OK** |
| Static EHR mirror | `apps/ehr-prototype-static/` from Temp (not Fable), serve **5191** | Path exists; `index.html` title *Care Indeed Home Health EHR Prototype*; README documents Temp source + Fable ban | **OK** |

### 2. Exclusions

| Exclusion | Inventory says | Status |
| --- | --- | --- |
| Fable `EHR_Prototype` | Hard ban; never used as source; not in diff | **OK** — confirmed in Method, exclusions table, Confirmation, static-EHR section, and `apps/ehr-prototype-static/README.md` |
| Dirty root bulk untracked | Merge only in worktree | **OK** (documented intent) |
| Connect / Journey | External, not in this branch | **OK** — separate section; not in `7b0b6ae6..HEAD` merge file list |
| Secrets | Never staged | **OK** |

### 3. Drive URLs (critical)

| Port / URL | Required classification | Inventory classification | Status |
| --- | --- | --- | --- |
| **5188** `http://127.0.0.1:5188/evidence` (+ `/evidence/defensible-2`) | **Working Drive** | **Working Drive (only)**; health via `/api/calendar/evidence/health` with env + API **8790** | **OK** |
| **5187** `http://127.0.0.1:5187/compliance` | **NOT** working Drive | Explicitly **NOT working Drive** (UI may load; not verified Drive stack) | **OK** |
| **5173** `http://localhost:5173/evidence/defensible-2` | **NOT** working Drive | Explicitly **NOT working Drive** (older baseline) | **OK** |

Supporting base code (not a dirty-root merge):

- `server/googleDrive.ts`, `server/googleDriveAuth.ts`
- `server/routes/calendar.ts` → `GET /api/calendar/evidence/health` returns 200/`drive.reachable` or 503

Inventory correctly states Drive is **runtime/env**, not a missing merge from dirty root, and **do not commit credentials**.

### 4. Fable exclusion

- Stated in Method row, exclusions table, Confirmation, static EHR section, and static app README.
- `git diff --name-only 7b0b6ae6..HEAD` shows only reception sources, qapi docs, `apps/ehr-prototype-static/**`, and inventory — **no Fable path**.

### 5. Static EHR path

| Item | Value |
| --- | --- |
| Destination (canonical) | `apps/ehr-prototype-static/` |
| Source | `%LOCALAPPDATA%\Temp\care-indeed-ehr-prototype-local` (documented) |
| Local URL | `http://127.0.0.1:5191/` |
| Title | Care Indeed Home Health EHR Prototype |
| Serve | `npx --yes serve apps/ehr-prototype-static -l 5191` |
| Isolation | Static only; no auth/API/shared-state wiring |

---

## Incomplete items fixed (additive)

| Gap | Fix |
| --- | --- |
| Commits table omitted `60f17bb5` | Added row: `docs: add build/QA results to merge inventory` |
| Branch tip still `5af4f6fd` | Updated to pre-refresh tip `60f17bb5` |
| Drive wording could be misread by skimming | Strengthened: **only 5188** working; **5187/5173 NOT working Drive** |
| No wave-1 verification stamp | Added **Wave-1 inventory verification (W1-A15)** matrix |

---

## Commit

| Field | Value |
| --- | --- |
| Message | `docs: refresh merge inventory after wave-1 verification` |
| SHA | `e03bb59ef98e5286f5934cfe6fa0b524cad9e570` |
| Short | `e03bb59e` |
| Amend? | **No** (new commit on tip of `60f17bb5`) |
| Files | `MERGE_INVENTORY_2026-08-03.md` only |

```
e03bb59e docs: refresh merge inventory after wave-1 verification
60f17bb5 docs: add build/QA results to merge inventory
5af4f6fd docs: record local app surfaces merge inventory 2026-08-03
```

---

## Confirmation checklist (agent gate)

- [x] Inventory reviewed for inclusions
- [x] Inventory reviewed for exclusions (incl. Fable)
- [x] Static EHR path `apps/ehr-prototype-static/` correct
- [x] **5188** documented as working Drive
- [x] **5187** documented as **NOT** working Drive
- [x] **5173** documented as **NOT** working Drive
- [x] Inventory updated additively where incomplete
- [x] Commit created (no amend)
- [x] Report written to `audit/merge-2026-08-03/wave-1/W1-A15-inventory-writer.md`

---

## Notes / non-blockers

- Drive health “HTTP 200 / `drive.reachable: true`” remains a **runtime** claim (main checkout + local `.env` + API 8790). Inventory correctly scopes that as env-backed, not as something this merge branch “ships” as credentials.
- Wave-1 evidence dir also has `audit/merge-2026-08-03/evidence/W1-A13-npm-run-build.log` (partial log header observed); build PASS remains as previously recorded in inventory — not re-litigated by W1-A15.
- `audit/` remains untracked after this agent’s inventory-only commit (report path is for wave audit consumption).

---

## Final result

**PASS** — Inventory accurate on Drive (5188 only), non-Drive ports (5187/5173), Fable exclusion, and static EHR path; incomplete metadata/reinforcement fixed in commit `e03bb59e`.
