# R03 — Dual EHR apps inventory (static 5191 vs interactive 5194)

| Field | Value |
| --- | --- |
| **Agent** | R03 |
| **Scope** | `apps/ehr-prototype-static` vs `apps/ehr-prototype`; live ports **5191** / **5194**; Reception target; Fable exclusion |
| **Worktree (cwd)** | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03` |
| **Captured** | 2026-08-03 ~19:28 local (America/Los_Angeles) |
| **Mode** | REVIEW ONLY — no product edits |
| **Verdict** | **PASS** |

---

## 1. Executive finding

There are **two distinct EHR artifacts** in the merge worktree:

1. **Static vinext/Codex mirror** — `apps/ehr-prototype-static` (legacy handoff, port **5191** convention).
2. **Interactive Vite + React source app** — `apps/ehr-prototype` (canonical redesign, port **5194**).

**Live attribution (confirmed):**

| Port | Role | Owner path | Fable? |
| --- | --- | --- | --- |
| **5194** | Interactive EHR (Reception target) | **merge** `…\merge-local-app-surfaces-2026-08-03\apps\ehr-prototype` | **No** |
| **5191** | Static EHR fallback (still up) | `%LOCALAPPDATA%\Temp\care-indeed-ehr-prototype-local` (byte-identical to vendored static) | **No** |

Reception launcher constant is **`http://127.0.0.1:5194`** (not 5191). Port **5194 is merge `apps/ehr-prototype`, not Fable’s `EHR_Prototype` worktree.**

---

## 2. Live ports — PID / cmdline / CWD

### 2.1 Port **5194** — interactive EHR (Reception target)

| Field | Value |
| --- | --- |
| **State** | Listen on `127.0.0.1:5194` |
| **PID** | **35740** (`node.exe`) |
| **Cmdline** | `"C:\Program Files\nodejs\node.exe" C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\apps\ehr-prototype\node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5194 --strictPort` |
| **CWD (PEB)** | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\merge-local-app-surfaces-2026-08-03\apps\ehr-prototype\` |
| **StartTime** | 2026-08-03 14:30:22 |
| **Related** | `esbuild.exe` PID **29472** under merge `apps\ehr-prototype\node_modules\@esbuild\…` |
| **HTTP** | **200**; HTML title **Care Indeed · Home Health EHR**; `/src/main.tsx` → **200** (Vite dev transform) |
| **Not Fable** | Cmdline and CWD are under **`merge-local-app-surfaces-2026-08-03`**. No live `node`/`vite` process serves from `…\EHR_Prototype\…`. Fable worktree **exists on disk** (`…\Policies_and_Procedures_V2_worktrees\EHR_Prototype`) but is **not** bound to 5194. |

Config parity:

- `apps/ehr-prototype/package.json` → `"dev": "vite --port 5194 --strictPort"`
- `apps/ehr-prototype/vite.config.ts` → `server.port: 5194`, `strictPort: true`

### 2.2 Port **5191** — static EHR (legacy / fallback)

| Field | Value |
| --- | --- |
| **State** | Listen on `127.0.0.1:5191` |
| **PID** | **33276** (`python.exe`) |
| **Cmdline** | `"C:\Python314\python.exe" -m http.server 5191 --bind 127.0.0.1` |
| **CWD (PEB)** | `C:\Users\razer\AppData\Local\Temp\care-indeed-ehr-prototype-local\` |
| **StartTime** | 2026-08-03 12:15:52 |
| **HTTP** | **200**; title **Care Indeed Home Health EHR Prototype** |
| **Asset fingerprint** | vinext hashes: `index-B6csGzFL.css`, `index-CcITSQVe.js`, `framework-CXnKph_e.js`, `page-DYDiOo50.js`, Geist fonts under `_vinext_fonts/` |
| **Parity with vendored tree** | Temp `index.html` SHA-256 **`0C101E08…EF03F88`** **matches** `apps/ehr-prototype-static/index.html` |

Note: live 5191 serves the **Temp mirror** documented as the original static source, not `npx serve apps/ehr-prototype-static`. Content is the same artifact family as the vendored static tree.

---

## 3. Inventory — `apps/ehr-prototype-static`

| Aspect | Detail |
| --- | --- |
| **Kind** | Compiled **static** site (vinext / RSC / rolldown asset names; `meta name="codex-preview"`) |
| **Editable source** | **None** in-repo (no `src/`, no `package.json`) |
| **Tracked files** | **21** (git `ls-files`) |
| **Layout** | `index.html`, `favicon.svg`, `README.md`, `assets/*.js|css`, `assets/_vinext_fonts/**/*.woff2` |
| **Title** | Care Indeed Home Health EHR Prototype |
| **Documented URL** | `http://127.0.0.1:5191/` |
| **Documented origin** | `%LOCALAPPDATA%\Temp\care-indeed-ehr-prototype-local` (deployed prototype pull — **not** Fable worktree) |
| **Isolation rules (README)** | Standalone; no policy-app wiring; **must not** use Fable `EHR_Prototype` as source |
| **Serve recipe** | `npx --yes serve apps/ehr-prototype-static -l 5191` (or `python -m http.server` from mirror) |
| **Stale claim in README** | Still says *“Reception launcher opens `http://127.0.0.1:5191/`”* — **outdated** vs current Reception (**5194**) |

---

## 4. Inventory — `apps/ehr-prototype`

| Aspect | Detail |
| --- | --- |
| **Kind** | Full **Vite 6 + React 19 + react-router-dom 7** design prototype (`package.name`: `ci-ehr-prototype`) |
| **Port** | **5194** (`strictPort`) |
| **Tracked app files** | **67** under `apps/ehr-prototype` (excl. `node_modules`; includes docs, public, src, configs) |
| **`src/` files** | **49** (screens, shell, ui kit, synthetic data, tokens) |
| **Title** | Care Indeed · Home Health EHR |
| **Routes (App.tsx)** | Clinical shell: `/today`, `/patients`, chart tabs, `/intake`, `/schedule`, `/clinical`, `/orders`, `/quality`, `/billing`, `/reports`. Doc shell: `/business-plan`, `/requirements`, `/mvp-policy`. |
| **Modes** | Business Plan · Requirements · MVP Policy · Prototype (EHR) |
| **Data** | Synthetic only (README / AGENTS) |
| **Dist present** | Yes (`dist/assets/index-B9-NOyP9.js`, `index-DCr8Ik7O.css`) — live 5194 is **dev** (serves `/src/main.tsx`), not necessarily `vite preview` of dist |
| **Docs** | `README.md`, `AGENTS.md`, `docs/{A11Y-AUDIT,CI-DESIGN-SYSTEM-SPEC,COMPONENT-INVENTORY,REQUIREMENTS-REVIEW,UAT-REPORT,UIUX-FRAMEWORK}.md` |
| **Provenance notes** | Merge inventory: content from `origin/EHR_Prototype` commits + later **user-requested** overlay from Fable path `EHR_Prototype\apps\ehr-prototype` **into** merge `apps/ehr-prototype`. Live process is **merge copy only**. |

### Screen / module map (`src/`)

| Area | Paths |
| --- | --- |
| Entry | `main.tsx`, `App.tsx` |
| Shell | `shell/AppShell.tsx`, `DocShell.tsx`, `CommandPalette.tsx` |
| UI kit | `ui/index.tsx`, `ui/ui.css` |
| Tokens | `styles/tokens.css`, `styles/base.css` |
| Clinical screens | `Today`, `Patients`, `PatientChart`, `ReferralIntake`, `Schedule`, `Clinical`, `Orders`, `Quality`, `Billing`, `Reports` |
| Doc screens | `BusinessPlan`, `Requirements`, `MvpPolicy` |
| Data | `patients.ts`, `clinical.ts`, `businessPlan.ts`, `requirementsSpec.ts`, `integrationTargets.ts`, `navigation.ts`, `types.ts` |
| Components | `PatientBanner.tsx` |

---

## 5. Side-by-side comparison

| Dimension | `ehr-prototype-static` (5191) | `ehr-prototype` (5194) |
| --- | --- | --- |
| Tech | Static vinext/Codex bundle | Vite + React TS source |
| Editable | No | Yes |
| Design system | Geist fonts; older prototype look | CI DS tokens (orange `#C74601`, teal, Montserrat/Roboto) |
| Live process now | `python -m http.server` from **Temp** | Vite from **merge** worktree |
| Reception target | **No longer** | **Yes** (`EHR_PROTOTYPE_URL`) |
| Fable worktree | Explicitly forbidden as source | Live server is merge path; Fable tree is sibling clone only |
| Role today | Preserved fallback / historical artifact | Canonical interactive EHR prototype |

---

## 6. Reception target

**Source:** `src/v6/screens/pageviews/ReceptionScreen.tsx`

```ts
const EHR_PROTOTYPE_URL = 'http://127.0.0.1:5194';
```

| Check | Result |
| --- | --- |
| Constant | `EHR_PROTOTYPE_URL = 'http://127.0.0.1:5194'` |
| Workspace card `id: 'ehr-prototype'` | `route: EHR_PROTOTYPE_URL` |
| CTA / launch prop | `launchUrl={EHR_PROTOTYPE_URL}` (also internal route `/ehr-prototype`) |
| HEAD vs worktree | **HEAD already has 5194**; file shows `M` (other local edits may exist) |
| Wave-2 QA docs | Still describe **5191** (stale; e.g. `audit/merge-2026-08-03/wave-2/W2-QA05-ehr-launcher-qa.md`) |
| MERGE_INVENTORY | Documents EHR → **5194**, static fallback **5191** |

**Conclusion:** Product Reception handoff is **5194** (interactive merge app). Port **5191** remains a live fallback only.

---

## 7. Fable `EHR_Prototype` exclusion

| Check | Result |
| --- | --- |
| Path exists | `C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_worktrees\EHR_Prototype` **YES** (full policy monorepo worktree + `apps/ehr-prototype`) |
| Bound to 5194? | **NO** — live Vite binary + CWD under **merge-local-app-surfaces-2026-08-03** |
| Bound to 5191? | **NO** — Temp static mirror |
| Live processes with `EHR_Prototype` in product serve cmdline | **None** (only agent shells mentioning the string) |
| Static README isolation | Forbids Fable as static source |
| Historical merge note | Content was **copied into** merge `apps/ehr-prototype` by request; runtime must use merge tree — **confirmed** |

---

## 8. Residual risks (non-blocking for this recon)

1. **Dual live URLs** — 5191 and 5194 both HTTP 200; operators can open the wrong one if not using Reception.
2. **Stale docs** — `apps/ehr-prototype-static/README.md` and wave-2 EHR launcher QA still say Reception → **5191**.
3. **5191 CWD is Temp**, not `apps/ehr-prototype-static` — content-matched, but a future Temp cleanup would drop 5191 until re-served from the vendored tree.
4. **Fable worktree still on disk** — easy to start a second Vite there if someone runs `npm run dev` outside merge (would fail if 5194 already held by merge, thanks to `strictPort`).

---

## 9. Verdict matrix

| Claim | Status | Evidence |
| --- | --- | --- |
| Both apps present under merge `apps/` | **PASS** | 21 static tracked + 67 interactive tracked files |
| 5194 is **merge** `apps/ehr-prototype` | **PASS** | PID 35740 cmdline + PEB CWD |
| 5194 is **not** Fable | **PASS** | Path `merge-local-app-surfaces-2026-08-03\…`; no Fable serve process |
| 5191 is static EHR artifact | **PASS** | python http.server; vinext title/assets; Temp CWD; SHA match to vendored static |
| Reception targets 5194 | **PASS** | `EHR_PROTOTYPE_URL` in ReceptionScreen (HEAD + WT) |
| Dual-EHR story documented in inventory | **PASS** | MERGE_INVENTORY + RECONCILIATION_REPORT |

### Overall: **PASS**

Core recon objectives satisfied: dual apps inventoried, live PIDs/cmdlines captured, **5194 confirmed as merge interactive app (not Fable)**, Reception target **5194**. Residuals are documentation/ops hygiene only — not attribution failures.

---

## 10. Commands / methods used (read-only)

- `Get-NetTCPConnection -LocalPort 5191,5194 -State Listen`
- `Get-CimInstance Win32_Process` (cmdline / parent)
- PEB CWD via `NtQueryInformationProcess` + `ReadProcessMemory`
- `Invoke-WebRequest` title/asset probes on 5191/5194
- `git ls-files apps/ehr-prototype-static apps/ehr-prototype`
- `Get-FileHash` Temp vs `apps/ehr-prototype-static/index.html`
- Source reads: ReceptionScreen, package.json, vite.config.ts, both READMEs, App.tsx

**No product files modified.** This report only written under `audit/recon-2026-08-03/agents/`.
