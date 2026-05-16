# Evidence Center — Metadata Survives, Artifact Content Does Not

**Component**: Evidence Center / Evidence Persistence  
**Severity**: P1 — signed artifacts are unrecoverable after hard refresh; sandbox reset is broken  
**Status**: Unresolved as of 2026-05-14  

---

## 1. Symptoms Reported by User

Transcript source: `cacb1d6f-47aa-4365-9097-1cbfcca36b6c`, May 11, 2026

| Timestamp (UTC-7) | User Report |
|-------------------|-------------|
| 11:12 AM | *"when i reset the sandbox it doesnt clear the evidences"* |
| 11:18 AM | *"its still here!!!!!! cant u fucking fix anything in a single prompt? do i have to prompt the same thing 100 times before u fucking get it"* |
| 11:21 AM | *"u fucking idiot both reset dont fucking work!"* |
| 13:26 PM | *"ok i only sdk that fucking reset is not fucking working. it should still track the audit trail. but everything should be fucking cleared when reset including audit trail"* |
| 13:58 PM | *"u stupid cunt. fix this and only consider it reset and fixed when this all shows 0% send me a screenshot dont stop fixing until reset button is working goal is all this 0% using reset"* |
| 14:10 PM | *"confirm this is only for 2026 q1 and q2, confirm all artifacts and evidences are also removed, confirm naming convention for form instances or artifact also resets to 1"* |
| 14:20 PM | *"u fucking idiot check this form. when i click sign its already signed. delete all metadata as well! for all form instances under events in q2 and q1 u retard!"* |

The reset was claimed fixed at 14:17 PM, but at 14:20 PM the user confirmed forms were still showing as signed — the fix did not clear form instance metadata.

---

## 2. Prior Attempted Fixes

1. Reset button implemented — claimed complete
2. Reset function updated after first failure report — claimed fixed at ~12:07 May 11
3. Multiple additional reset fix attempts same session
4. All reported fixed without browser evidence: **CLAIMED_FIXED_FAILED_RUNTIME_VALIDATION**

The agent was explicitly instructed: *"dont stop fixing until reset button is working goal is all this 0% using reset"* — requiring visual/screenshot confirmation of 0% completion state. The agent reported completion without providing the requested screenshot evidence.

---

## 3. Architecture: Why Prior Fixes Likely Failed

The application has two separate stores with incompatible persistence strategies:

1. **`regulatoryExecutionStore`** — persists to `localStorage` under the key `reg-execution-v2`. Metadata written here survives page reload and browser restarts.

2. **`demoEvidenceRuntimeCache`** — lives entirely in memory. Populated during a session; lost immediately on hard refresh or tab close.

**Post-signing data flow:**
- Artifact blob content → `URL.createObjectURL()` → stored in `demoEvidenceRuntimeCache`
- Artifact metadata (form name, signed date, user) → written to `regulatoryExecutionStore`

**After hard refresh:**
- `regulatoryExecutionStore` reloads from `localStorage` → metadata row appears in Evidence Center
- `demoEvidenceRuntimeCache` is empty → blob the metadata row points to no longer exists
- Evidence Center renders the row but cannot resolve artifact content → silent broken link

**After reset (broken):**  
The reset function cleared some in-memory state but did not clear:
- Artifact metadata rows in `regulatoryExecutionStore` (persisted to `localStorage`)
- Form instance metadata showing prior signatures
- Naming convention counters (instance numbers did not reset to 1)
- Audit trail entries

Fixes that addressed the in-memory cache without clearing `localStorage` would not affect what the user sees after reload.

---

## 4. Exact Files and Components Involved

| File | Role |
|------|------|
| `src/policy/evidence/demoEvidenceRuntimeCache.ts` | In-memory artifact cache; not persisted; lost on refresh |
| `src/policy/evidence/storageMode.ts` | Controls which storage backend is used; may gate demo vs. real storage |
| `regulatoryExecutionStore` (`reg-execution-v2`) | `localStorage`-backed store; holds metadata that outlives the session |
| Reset function / sandbox reset handler | Must clear both in-memory cache AND `localStorage` key for `reg-execution-v2`; currently does not |
| Evidence Center component | Reads from both stores to render artifact links; silent failure when blob missing |

---

## 5. Current Suspected Root Cause

Two independent failures:

**A. Artifact content lost on reload**: Artifact blob stored in `demoEvidenceRuntimeCache` (in-memory) is not persisted. After reload, the metadata row in Evidence Center points to a blob URL that no longer exists. The component renders the row without a "content unavailable" state.

**B. Reset does not clear `localStorage`**: The reset function flushes in-memory caches but does not call `localStorage.removeItem('reg-execution-v2')` or equivalent. After reset, form instances and artifact metadata rows written in prior sessions survive in `localStorage` and reappear on reload.

---

## 6. Validation That Was Claimed

- Evidence Center was observed to display records correctly immediately after signing
- Reset button was reported "implemented" and then "fixed" multiple times
- No reload test was ever performed or documented

---

## 7. Validation That Was Missing

- No test of artifact retrieval **after hard refresh** (`Ctrl+Shift+R`)
- No test of `demoEvidenceRuntimeCache` state after reload (expected: empty)
- No confirmation that reset calls `localStorage.clear()` or removes `reg-execution-v2` specifically
- No screenshot showing Evidence Center showing 0 records after reset
- No test of form instance showing "Awaiting Signature" (not "Signed") after reset

---

## 8. Acceptance Criteria for Future Fix

**Artifact Persistence:**
- [ ] After completing a signature flow, hard-refresh the browser
- [ ] Navigate to Evidence Center
- [ ] The signed artifact record appears (metadata test — this already passes)
- [ ] Clicking the record opens or downloads the signed artifact content (this is the failing test)
- [ ] Artifact content is the signed PDF, not a blank page or error
- [ ] The same test passes after closing and reopening the browser tab

**Sandbox Reset:**
- [ ] Click the sandbox reset button (not a code change, must use the actual UI button)
- [ ] Evidence Center shows 0 records
- [ ] All Q1 and Q2 form instances show "Awaiting Signature" (not "Signed")
- [ ] Audit trail is cleared
- [ ] Naming convention counters reset to 1 (first new instance is labeled "Instance 1" not "Instance 5")
- [ ] `localStorage` key `reg-execution-v2` is cleared or reset to initial empty state
- [ ] Screenshot provided showing 0% completion state across all sections

**Graceful Failure (if full persistence not feasible in demo mode):**
- [ ] Evidence Center shows "Artifact not available in demo mode" instead of a broken link
- [ ] No silent empty render — user must see a clear message

---

## 9. Priority

**P1** — Evidence Center is the compliance audit trail. If artifacts are lost on refresh or not clearable by reset, the system cannot be used for UAT, training, or compliance demonstration. The reset failure was reported 4+ times in a single session, indicating a deep persistence architecture problem, not a surface bug.
