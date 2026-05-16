# Grok Build CLI — End-User Guide

**Audience:** anyone on this Windows workstation (`razer`) who wants to use the official xAI **Grok Build** terminal agent against this repo or any other repo on disk.

**Status:** Installed machine-wide for the current Windows user. Verified version: `grok 0.1.210`.

> The official binary is named **`grok`**. A convenience shim named **`grok-build`** is also installed and simply forwards to `grok`, so either command works from any folder.

---

## 1. What this tool is (and is not)

| | Description |
| --- | --- |
| **What it is** | The official xAI Grok Build TUI — a terminal coding agent from xAI that runs locally, reads/writes files in the current folder, and can call your installed shell tools, MCP servers, and the web. |
| **What it is not** | It is **not** a SaaS / IDE plugin. It runs as a local process. Whatever it edits, it edits on this machine using your Windows user account. |
| **Distribution** | Installed by `https://x.ai/cli/install.sh` (verified — that script downloads a real native Windows `.exe` under Git Bash). |
| **Installed from** | `curl -fsSL https://x.ai/cli/install.sh \| bash` run inside Git Bash. |
| **Binary location** | `C:\Users\razer\.grok\bin\grok.exe` (and `agent.exe` alias) |
| **Shim location** | `C:\Users\razer\.grok\bin\grok-build.cmd` (forwards to `grok.exe`) |
| **PATH entry** | `%USERPROFILE%\.grok\bin` is on the **User PATH** (persists across all new shells, all folders, this user only). |
| **Config / state** | `C:\Users\razer\.grok\` — `config.toml`, `auth.json`, `downloads\`, `bin\`, `completions\`. **All state is per-user, not per-repo.** |

---

## 2. Daily usage pattern

Open any PowerShell window. Then:

```powershell
cd C:\AI\Git\some-project
grok-build          # or:  grok
```

That drops you into the interactive `grok>` TUI scoped to the current folder. Type natural-language prompts. Type `/help` for slash commands, `/quit` to exit.

For another repo:

```powershell
cd C:\AI\Git\another-project
grok-build
```

For a **single-shot** prompt (no TUI, prints the answer and exits — great for scripts):

```powershell
grok -p "Summarize the top 5 risks in this repo. Read-only. No edits."
```

---

## 3. First-run authentication

The CLI installs without auth. On first interactive launch, the welcome screen will offer to sign in. Two supported flows:

```powershell
grok login                # default: opens a browser
grok login --oauth        # explicit browser/OAuth flow via auth.x.ai
grok login --device-auth  # device-code flow for headless / no-browser environments
```

Auth tokens are stored at `C:\Users\razer\.grok\auth.json` (per-user). Treat that file like a credential — never commit it, never paste its contents into chat.

**BYOK (bring your own xAI API key)** — if you'd rather bill the CLI against your own xAI account instead of the platform default:

1. Inside the `grok>` TUI, run:
   ```
   /api-key add xai
   /api-key test xai
   ```
2. The key is stored locally in `~/.grok/`. Don't paste it into prompts or commit it.

---

## 4. Useful subcommands (verified against `grok --help`)

```text
grok                  # launch interactive TUI in CWD
grok -p "prompt"      # single-shot, prints to stdout, exits
grok -c               # continue most recent session for this CWD
grok -r               # resume by session id (or most recent if omitted)
grok --check          # append a self-verification loop (headless mode)
grok --best-of-n 3    # run task 3 ways in parallel, pick best (headless)
grok -w feature-x     # start the session inside a NEW git worktree

grok agent            # run Grok without the interactive UI (scripted/agent mode)
grok inspect          # show what config Grok discovers for THIS folder
grok models           # list available models
grok sessions         # list / search / restore prior sessions
grok mcp              # manage MCP server configurations
grok memory           # manage cross-session memory
grok worktree         # manage git worktrees
grok update           # check for / install a specific version
grok login            # sign in
grok version          # print version (alias: v)
grok help <command>   # detailed help for any subcommand
```

### Permission & safety flags (use these — see Section 6)

```text
--permission-mode default | acceptEdits | auto | dontAsk | bypassPermissions | plan
--allow <RULE>           # repeat to whitelist actions
--deny  <RULE>           # repeat to blacklist actions
--sandbox <PROFILE>      # filesystem/network sandbox profile (env: GROK_SANDBOX)
--max-turns <N>          # hard cap on agent turns
--disable-web-search     # turn off web search + web fetch tools
--disallowed-tools <LIST># comma-separated list of built-in tools to remove
--no-subagents           # disable subagent spawning
--no-memory              # disable cross-session memory for THIS run
--no-plan                # disable plan mode
--restore-code           # when resuming, check out the original session's commit
```

### Built-in agents (from `grok inspect`)

| Name | Purpose |
| --- | --- |
| `general-purpose` | Default. Full read/write/exec. |
| `explore` | Read-only research / Q&A. **Use this for first passes on the HomeHealth repo.** |
| `plan` | Plan-only. Will design changes without writing them. |

Switch with `--agent explore` (or `--agent plan`).

---

## 5. Sessions, history, resume

- Sessions are scoped to the **CWD** they started in.
- `grok -c` continues the most recent session for the current folder.
- `grok sessions` lets you list and restore older sessions.
- `grok -r <id> --restore-code` will **also git-checkout the commit you were on** when that session started — extremely useful for "I broke main, take me back to the snapshot from yesterday's session."

---

## 6. Safety rules — REQUIRED reading before running in the HomeHealth repo

This repo (`C:\AI\Git\training\HomeHealth\Policies_and_Procedures`) holds HIPAA / SOC 2 compliance materials, policies, audit artifacts, and architecture documents that may reference vendors, patient-adjacent data, and security posture. The Grok Build CLI runs **as your Windows user** and can read **every file in this repo (and any folder you launch it from)**.

Treat it like you'd treat a junior engineer with shell access. The defaults below are mandatory.

### 6.1 Never paste real PHI / PII into the TUI

- No real patient names, MRNs, DOBs, addresses, phone numbers, plan IDs, claim numbers, or clinical notes.
- If you need to demonstrate a workflow that touches patient data, **scrub first** or use synthetic data.
- The CLI may send your prompt and selected file context to xAI's API. Assume anything you type could leave the machine.

### 6.2 Always start in a clean repo state

```powershell
cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures
git status        # should be clean, OR every uncommitted change should be intentional
```

A clean tree means every file `grok` writes shows up in `git diff` and is trivial to revert (`git restore -SW .`).

### 6.3 Start every HomeHealth session in `explore` (read-only) mode

For the first turn or two, just learn the codebase — don't let the agent edit:

```powershell
grok-build --agent explore --permission-mode plan
```

Move to the default agent only once you've scoped a specific change.

### 6.4 Never use `--always-approve`, `--permission-mode auto`, or `--permission-mode bypassPermissions` in this repo

These disable the per-action prompts. In a compliance repo, those prompts are your audit trail. Enforce manual approval:

```powershell
grok-build --permission-mode default
```

### 6.5 Use git worktrees for risky multi-file changes

Instead of letting Grok rewrite files in your current checkout, spin up an isolated worktree it owns:

```powershell
grok-build -w grok/refactor-policies
```

Worst case, `git worktree remove` it and nothing in your main checkout was touched.

### 6.6 Disable web tools when you're working with confidential drafts

```powershell
grok-build --disable-web-search
```

Prevents the agent from fetching/posting to URLs while you're heads-down on internal-only material.

### 6.7 Don't run `grok` from sensitive parents

**Never** launch from `C:\`, `C:\Users\razer`, `C:\AI`, `C:\AI\Git`, or any other folder that contains multiple unrelated repos. The agent's "world" = the folder you launched it in. Always `cd` into the **specific repo** first.

### 6.8 Don't commit Grok state

`~/.grok/` is per-user and lives outside any repo, so this is normally a non-issue. But if you ever see a project-local `.grok/` folder appear in `git status`, add it to `.gitignore` immediately:

```gitignore
# Grok Build CLI — never commit local agent state or auth
.grok/
.grok-cli/
**/.grok/
```

---

## 7. First test against the HomeHealth repo (recommended sequence)

```powershell
# 1. Confirm the install is healthy from a fresh shell
grok --version
grok-build --version

# 2. cd into the repo
cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures

# 3. Confirm Grok sees the right roots and config
grok inspect

# 4. (One-time) sign in
grok login

# 5. Read-only smoke test — no edits, no web
grok-build --agent explore --disable-web-search --permission-mode plan
#   then at the grok> prompt:
#   > Give me a 1-paragraph summary of what this repo is for, citing 3 file paths.
#   > /quit
```

If step 3 reports `Project trusted: no`, you'll be asked to confirm trust on first interactive launch. Approve only if the path shown matches the repo you intend to work in.

---

## 8. Updating, repairing, uninstalling

**Update to the latest stable:**

```powershell
grok update
```

or, equivalently, re-run the official installer (it overwrites in place):

```powershell
& "C:\Program Files\Git\bin\bash.exe" -lc "curl -fsSL https://x.ai/cli/install.sh | bash"
```

**Pin a specific version:**

```powershell
& "C:\Program Files\Git\bin\bash.exe" -lc "curl -fsSL https://x.ai/cli/install.sh | bash -s 0.1.210"
```

**Channels** (set before install): `GROK_CHANNEL=stable | alpha | enterprise`.

**Uninstall (full):**

```powershell
# 1. Remove binaries + config + auth + sessions
Remove-Item -Recurse -Force "$Env:USERPROFILE\.grok"

# 2. Remove from User PATH
$p = [Environment]::GetEnvironmentVariable('Path','User')
$new = ($p.Split(';') | Where-Object { $_.TrimEnd('\') -ine "$Env:USERPROFILE\.grok\bin".TrimEnd('\') }) -join ';'
[Environment]::SetEnvironmentVariable('Path', $new, 'User')
```

Open a new shell and `grok --version` should now report "command not found".

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `grok` / `grok-build` not found in a NEW shell | New User PATH entry hasn't been picked up by an already-open shell | Open a fresh PowerShell window (or sign out / back in once) |
| `grok` not found in cmd.exe but works in PowerShell | `cmd.exe` was open before PATH was updated | Close & reopen cmd.exe |
| Installer fails with "Either curl or wget is required" | Running outside Git Bash | Always run the installer through `C:\Program Files\Git\bin\bash.exe` |
| Installer says "Symlink not permitted" | Windows Developer Mode off | Already handled — installer copies instead of symlinking on Windows |
| TUI looks garbled / overlaps prompt | Terminal alt-screen issues | Try `grok --no-alt-screen` |
| You want a hard transcript of what the agent did | Default sessions live in `~/.grok` | Use `grok sessions` and `grok trace` (`grok help trace`) |
| You need to disable a single tool (e.g. web fetch) | Tool is enabled by default | `--disallowed-tools web_fetch,web_search` or `--disable-web-search` |

---

## 10. Quick reference card (print this)

```text
LAUNCH:        cd <repo>;  grok-build           (or: grok)
HEADLESS:      grok -p "your single prompt"
RESUME:        grok -c           # continue most recent in this CWD
WORKTREE:      grok -w branch-name
INSPECT:       grok inspect      # show config Grok sees here
SESSIONS:      grok sessions
LOGIN:         grok login        ( --oauth | --device-auth )
UPDATE:        grok update

SAFE DEFAULTS (HomeHealth repo):
   grok-build --agent explore --permission-mode plan --disable-web-search

NEVER:
   --always-approve   --permission-mode auto   --permission-mode bypassPermissions
   running grok from C:\, C:\Users\razer, or C:\AI\Git (any multi-repo parent)
   pasting real PHI / PII / credentials into the TUI

EXIT:          /quit       inside the TUI
```

---

## 11. Where this guide lives & who maintains it

- **This file:** `docs/grok-build/GROK_BUILD_USER_GUIDE.md` (in the HomeHealth repo)
- **Install script of record:** `https://x.ai/cli/install.sh` (verified 2026-05-14)
- **Local install record:** `C:\Users\razer\.grok\bin\grok.exe` v0.1.210, installed 2026-05-14

If you re-install from a different channel, change the binary location, or roll out to additional Windows users on this box, update Section 1 and Section 8 of this document.
