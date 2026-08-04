# R05 — Uncommitted work inventory

| Field | Value |
| --- | --- |
| Agent | R05 |
| Mode | **REVIEW ONLY** (no commits, no product edits) |
| Worktree | `Policies_and_Procedures_V2_worktrees/merge-local-app-surfaces-2026-08-03` |
| Branch | `codex/merge-local-app-surfaces-2026-08-03` |
| Tracking | up to date with `origin/codex/merge-local-app-surfaces-2026-08-03` |
| HEAD | `dae8e24b` — `feat(compliance): Vendor + Contractor management UI under Registry & Contracts (UI only)` |
| Recon date | 2026-08-03 |
| Index / staged | **empty** (nothing in the index) |
| Verdict | **PASS** — inventory complete |

---

## 1. Full `git status --porcelain`

```
 M public/advanced-training/oasis-e2-soc/index.html
 M src/index.css
 M src/policy/journey/components/advanced/AdvancedTrainingPlayer.tsx
 M src/policy/journey/components/advanced/DocumentationDefensibilityPanel.tsx
 M src/policy/journey/components/advanced/QapiTrainingPanel.tsx
 M src/v6/screens/pageviews/ReceptionScreen.tsx
?? audit/recon-2026-08-03/
```

**Summary counts**

| Kind | Count | Notes |
| --- | --- | --- |
| Modified (unstaged) | **6** | All product/UI paths; none staged |
| Staged | **0** | Clean index |
| Untracked | **1 path** | `audit/recon-2026-08-03/` (recon package; not product) |
| Deleted / renames / conflicts | **0** | None |

`git status` narrative confirms: branch matches origin tip; all six files are **“Changes not staged for commit”** only.

---

## 2. Diffstat (unstaged)

```
 public/advanced-training/oasis-e2-soc/index.html                 | 57 +++++++++++++++++--
 src/index.css                                                    | 14 +++++
 src/policy/journey/components/advanced/AdvancedTrainingPlayer.tsx | 10 ++--
 .../components/advanced/DocumentationDefensibilityPanel.tsx      |  2 +-
 src/policy/journey/components/advanced/QapiTrainingPanel.tsx     |  6 +-
 src/v6/screens/pageviews/ReceptionScreen.tsx                     | 65 ++++++++++++----------
 6 files changed, 111 insertions(+), 43 deletions(-)
```

**Per-file numstat** (`insertions` / `deletions`):

| Path | + | − |
| --- | ---: | ---: |
| `public/advanced-training/oasis-e2-soc/index.html` | 51 | 6 |
| `src/index.css` | 14 | 0 |
| `src/policy/journey/components/advanced/AdvancedTrainingPlayer.tsx` | 5 | 5 |
| `src/policy/journey/components/advanced/DocumentationDefensibilityPanel.tsx` | 1 | 1 |
| `src/policy/journey/components/advanced/QapiTrainingPanel.tsx` | 5 | 1 |
| `src/v6/screens/pageviews/ReceptionScreen.tsx` | 35 | 30 |
| **Total** | **111** | **43** |

Cached/staged diffstat: **empty**.

---

## 3. Per-file summary (6 modified)

### 3.1 `src/v6/screens/pageviews/ReceptionScreen.tsx`

| | |
| --- | --- |
| Diff | +35 / −30 (~65 lines touched) |
| Theme | **Reception launcher correctness + a11y** |
| Freeze class | **MUST-COMMIT** |

**What changed**

1. **Launch URL fixes**
   - `JOURNEY_URL`: `…/journey/training?persona=…` → `…/journey?persona=…`
   - `CONNECT_URL`: `http://127.0.0.1:5192/` → `http://127.0.0.1:5192/?view=home`
2. **Command palette semantics**
   - Results list: `div[role=listbox]` + `button[role=option]` → real `<ul>` / `<li>` with native `<a target="_blank" rel="noopener noreferrer">` when enabled; disabled items as non-interactive `div[aria-disabled]`.
   - Removes custom Enter/Space `onKeyDown` + `window.open` path; relies on native link activation.
   - Adds `aria-label` on workspace launcher card and palette links (“opens in a new tab”).
3. **Misc a11y / security hygiene**
   - Prototype shell external link: `rel="noreferrer"` → `rel="noopener noreferrer"`.
   - Drops unused `KeyboardEvent` type import.

**Why must-commit for freeze:** Incorrect Journey/Connect destinations ship broken handoffs from the default post-login surface. Command-palette keyboard/semantics fix is product a11y on the same screen. Leaving this uncommitted means freeze does **not** match the worktree operators actually run.

---

### 3.2 `public/advanced-training/oasis-e2-soc/index.html`

| | |
| --- | --- |
| Diff | +51 / −6 |
| Theme | **OASIS-E2 SOC static shell — brand orange contrast under journey/light themes** |
| Freeze class | **MUST-COMMIT** (with advanced-training WCAG unit) |

**What changed**

- Injects a `<style>` block forcing WCAG-friendlier brand orange (`#C74601` / `#9F3600`) and stronger secondary/muted text tokens when `body[data-theme="journey"|"light"]`.
- Overrides secondary buttons, primary/confirm buttons, and linear-gradient orange CTAs (including inline-style attribute selectors) to the darker orange + white text.
- Ensures trailing newline at EOF (formatting only).
- Fonts link formatting only (no functional font change).

**Why must-commit:** Static advanced-training asset shipped under `public/`; uncommitted contrast rules will not ship with freeze. Coherent with React-side `.advanced-training-wcag` work.

---

### 3.3 `src/index.css`

| | |
| --- | --- |
| Diff | +14 / −0 |
| Theme | **Global CSS hooks for advanced-training WCAG orange** |
| Freeze class | **MUST-COMMIT** (with advanced-training WCAG unit) |

**What changed**

- New utility scope `.advanced-training-wcag` setting `--brand-orange`, `--ci-orange`, `--ci-brand-orange` to `#C74601`.
- Forces `.text-brand-orange` / `.bg-brand-orange` under that scope to the darker orange.

**Why must-commit:** Without this, `AdvancedTrainingPlayer` class wiring is a no-op for token overrides.

---

### 3.4 `src/policy/journey/components/advanced/AdvancedTrainingPlayer.tsx`

| | |
| --- | --- |
| Diff | +5 / −5 |
| Theme | **Wire WCAG scope class onto all advanced training shells** |
| Freeze class | **MUST-COMMIT** (with advanced-training WCAG unit) |

**What changed**

- Adds `className="advanced-training-wcag"` to every variant root:
  - `plan_of_care`, `qapi_board`, `documentation_lab`, `oasis_lab`, and default chrome shell.
- No logic, props, or completion-handler changes.

**Why must-commit:** Activates the `index.css` contrast tokens for all advanced modules in-app.

---

### 3.5 `src/policy/journey/components/advanced/DocumentationDefensibilityPanel.tsx`

| | |
| --- | --- |
| Diff | +1 / −1 |
| Theme | **Muted text contrast tweak** |
| Freeze class | **MUST-COMMIT** (with advanced-training WCAG unit) — small but same effort |

**What changed**

- Local palette `colors.muted`: `#64748B` → `#475569` (darker slate for body/secondary copy).

**Why must-commit as unit:** Part of the same contrast pass; trivial alone, but incomplete if the rest of the WCAG unit is frozen without it.

---

### 3.6 `src/policy/journey/components/advanced/QapiTrainingPanel.tsx`

| | |
| --- | --- |
| Diff | +5 / −1 |
| Theme | **Keyboard-focusable scroll region + name** |
| Freeze class | **MUST-COMMIT** (a11y) |

**What changed**

- Scrollable content container gains `tabIndex={0}` and `aria-label="QAPI lesson content"` so the overflow region is focusable and announced.

**Why must-commit:** Accessibility behavior change on QAPI advanced training; not pure style.

---

## 4. Untracked (not among the “6 modified,” but on porcelain)

| Path | Class | Notes |
| --- | --- | --- |
| `audit/recon-2026-08-03/` | **OPTIONAL** for product freeze | Recon / agent package only. Does not affect runtime. May be committed later as audit hygiene; **not** required to freeze product surfaces. |

At inventory time, the recon tree included at least `RECONCILIATION_REPORT.md` (and this agent report under `agents/`). Treat as documentation/audit, not product delta.

---

## 5. Freeze classification rollup

| Path | Intent bucket | Classification |
| --- | --- | --- |
| `src/v6/screens/pageviews/ReceptionScreen.tsx` | Launch URL fix + command-palette a11y | **MUST-COMMIT** |
| `public/advanced-training/oasis-e2-soc/index.html` | Static OASIS contrast CSS | **MUST-COMMIT** (WCAG unit) |
| `src/index.css` | `.advanced-training-wcag` tokens | **MUST-COMMIT** (WCAG unit) |
| `…/AdvancedTrainingPlayer.tsx` | Apply WCAG class on all variants | **MUST-COMMIT** (WCAG unit) |
| `…/DocumentationDefensibilityPanel.tsx` | Muted contrast | **MUST-COMMIT** (WCAG unit) |
| `…/QapiTrainingPanel.tsx` | Focusable content region | **MUST-COMMIT** |
| `audit/recon-2026-08-03/` (untracked) | Recon docs | **OPTIONAL** |

### Recommended freeze commit grouping (if/when human asks to commit)

1. **Reception** — single commit: `ReceptionScreen.tsx` only
   Subject suggestion: `fix(reception): journey/connect URLs + command palette link a11y`
2. **Advanced training WCAG/a11y** — single commit: the other five files
   Subject suggestion: `fix(a11y): advanced training orange contrast + QAPI focus region`

Do **not** mix audit recon into product freeze commits unless explicitly requested.

### Freeze readiness implication

| Question | Answer |
| --- | --- |
| Can freeze claim “clean tree = HEAD”? | **No** — 6 unstaged product files diverge from `dae8e24b` / origin |
| Is origin missing these fixes? | **Yes** — none staged or pushed |
| Blocker severity | **Medium-high** for reception URLs; **medium** for a11y/contrast unit |
| Safe to discard? | **No** without explicit human approval — loss of URL + a11y work |
| This agent committed anything? | **No** |

---

## 6. Line-ending noise (non-blocking)

Git warned LF→CRLF on several of the modified TS/CSS paths when reading the working copy. Diff content itself is substantive (not pure EOL-only). No action required for inventory; commit tooling may renormalize on commit.

---

## 7. PASS / FAIL

| Criterion | Result |
| --- | --- |
| Full porcelain captured | **Yes** |
| Diffstat captured (unstaged + empty staged) | **Yes** |
| Each of 6 modified files summarized | **Yes** |
| Each classified must-commit vs optional | **Yes** (all 6 product files **MUST-COMMIT**; recon tree **OPTIONAL**) |
| No commits performed | **Yes** |

### **PASS** — inventory complete

Working tree is **not** freeze-clean until the six product files are committed (or explicitly discarded by a human). Untracked recon package does not block product freeze.

---

*End R05. Review-only; no git writes beyond this report file.*
