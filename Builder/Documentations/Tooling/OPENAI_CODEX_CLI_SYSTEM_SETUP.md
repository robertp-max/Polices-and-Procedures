# OpenAI Codex CLI System Setup

Date: 2026-05-25

## Purpose

Install and configure OpenAI Codex CLI as a global, system-level coding driver that can be launched from any repository or terminal on this Windows machine without storing credentials or configuration inside application repos.

## System Prerequisites Found

- OS: Microsoft Windows 11 Pro, version 10.0.26200, 64-bit
- Shell checked: Windows PowerShell 5.1.26100.8457
- Node.js: v22.22.0
- npm: 11.6.2
- Python: 3.14.3
- Git: 2.52.0.windows.1
- Global npm prefix: `C:\Users\razer\AppData\Roaming\npm`
- PATH readiness: global npm prefix is present on PATH
- Codex shim path:
  - PowerShell: `C:\Users\razer\AppData\Roaming\npm\codex.ps1`
  - cmd: `C:\Users\razer\AppData\Roaming\npm\codex.cmd`

## Installation Method Used

Official OpenAI package source: npm package `@openai/codex`.

Install command used:

```powershell
npm install -g @openai/codex
```

Installed version confirmed:

```text
codex-cli 0.133.0
```

Global command name:

```powershell
codex
```

## Authentication Method and Status

Authentication method selected: ChatGPT device authorization through Codex CLI.

Command started:

```powershell
codex login --device-auth
```

Status at documentation time:

```text
Not logged in
```

No API key, token, or credential was written to any project folder. Codex stores user-level auth state under the user's Codex home, not inside repos.

To complete or retry authentication safely:

```powershell
codex login --device-auth
codex login status
```

Alternative safe auth methods:

```powershell
# Browser-based ChatGPT OAuth
codex login

# API key login, only if needed for automation.
# Paste or pipe the key directly; do not store it in a repo.
codex login --with-api-key
```

## User-Level Safe Defaults

User-level config file:

```text
C:\Users\razer\.codex\config.toml
```

Configured default:

```toml
approval_policy = "untrusted"
sandbox_mode = "read-only"
allow_login_shell = false

[sandbox_workspace_write]
network_access = false
```

This default is intended to:

- Auto-approve known-safe read-only inspection.
- Allow harmless repo inspection and diff previews.
- Require confirmation for file modifications, package installs, dependency upgrades, git commits, deletions, and system-impacting shell commands.
- Avoid network access from workspace-write sandbox mode unless explicitly changed.
- Keep credentials and config outside project folders.

Configured profiles:

- `repo-inspect`: read-only, low-friction inspection.
- `implementation`: workspace-write with approval requests.
- `autonomous-refactor`: workspace-write with approval requests.
- `production-sensitive`: read-only, strict inspection.
- `full-auto-local`: workspace-write with `approval_policy = "never"`; risky and not the global default.

## Launch Verification

Confirmed `codex --version` works from:

- PowerShell in `C:\AI\CIION`
- PowerShell in `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`
- PowerShell with `-NoProfile`
- `cmd.exe`

Windows Terminal should work when using the same user PATH and a PowerShell or cmd profile.

Cursor/VS Code terminal readiness was confirmed through the current integrated terminal environment.

## How to Launch From Any Repo

From any repo directory:

```powershell
cd C:\path\to\repo
codex
```

For read-only inspection:

```powershell
codex --profile repo-inspect
```

For a one-shot non-interactive read-only prompt:

```powershell
codex exec --profile repo-inspect "Inspect the repo structure and summarize the top-level folders. Do not edit files."
```

For implementation work with approval prompts:

```powershell
codex --profile implementation
```

## Safe First Smoke Test

Run from:

```powershell
cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures
```

Smoke test prompt:

```powershell
codex exec --profile repo-inspect "Inspect the repo structure and summarize the top-level folders. Do not edit files."
```

Expected behavior:

- Codex launches from the repo.
- Codex can inspect the top-level folder structure.
- Codex does not edit files.
- If authentication is incomplete, Codex exits with a login/authentication message.

## Recommended Usage Rules

- Start with `repo-inspect` for unfamiliar repos.
- Do not use Codex to commit unless explicitly requested.
- Keep secrets out of prompts, screenshots, copied terminal output, and repo files.
- Review every proposed file change before approval.
- Use `implementation` only after the scope is clear.
- Use `production-sensitive` for regulated, healthcare, credentialed, or customer-data-adjacent repos.
- Prefer explicit prompts such as "do not edit files" or "show a plan first" for audits and architecture review.
- For dependency changes, ask Codex to explain the package, version, risk, and rollback before approving install commands.

## Approval and Execution Modes

The installed CLI supports approval policies and sandbox modes.

Useful approval policies:

- `untrusted`: auto-runs only known-safe read-only operations; prompts for other actions.
- `on-request`: lets Codex request approval when it needs elevated action.
- `never`: does not prompt; risky for daily work.

Useful sandbox modes:

- `read-only`: safest default for inspection.
- `workspace-write`: allows writes inside the workspace, with network disabled here by default.
- `danger-full-access`: no practical filesystem sandbox; avoid except in isolated throwaway environments.

The true bypass flag exists:

```powershell
codex --dangerously-bypass-approvals-and-sandbox
```

or:

```powershell
codex exec --dangerously-bypass-approvals-and-sandbox "..."
```

Do not enable this globally. It skips approval prompts and sandboxing and should only be used inside an externally hardened disposable VM/container with no secrets and no important mounted files.

## Temporarily Enable Always-Approve Mode

Safer sandboxed always-approve profile:

```powershell
codex --profile full-auto-local
```

or:

```powershell
codex exec --profile full-auto-local "..."
```

Return to safe mode:

```powershell
codex --profile repo-inspect
```

or just run:

```powershell
codex
```

The global default remains read-only/untrusted unless the user-level config is changed.

## Recommended Mode by Workflow

- Architecture review: `repo-inspect`
- Repo inspection: `repo-inspect`
- Implementation: `implementation`
- Autonomous refactoring: `autonomous-refactor`, only in a clean git worktree after reviewing scope
- Production-sensitive repos: `production-sensitive`

Avoid `full-auto-local` and `--dangerously-bypass-approvals-and-sandbox` for production, healthcare, credentialed, or customer-data-adjacent repos.

## Known Limitations Compared With Other CLIs

- Compared with Grok CLI: Codex is better suited to OpenAI account/model workflows and local repo-aware coding, but Grok may be preferred when the desired behavior depends on xAI/Grok-specific models or live web behavior.
- Compared with Claude: Codex has a different approval/sandbox model and model ecosystem. Claude may be preferred for workflows already standardized around Claude Code memory, MCP conventions, or Anthropic-specific models.
- Compared with local Qwen: Codex depends on OpenAI authentication and remote model access. Local Qwen can run without sending code to a remote provider, but usually needs local model/runtime setup and may have weaker out-of-the-box coding-agent safety controls.
- Windows sandbox behavior can differ from macOS/Linux. Keep the read-only default for first inspection and use `/status` inside Codex to verify effective permissions.

## Uninstall and Rollback

Uninstall global Codex CLI:

```powershell
npm uninstall -g @openai/codex
```

Confirm removal:

```powershell
Get-Command codex -ErrorAction SilentlyContinue
cmd /c where codex
```

Remove user-level Codex config if desired:

```powershell
Remove-Item "C:\Users\razer\.codex\config.toml"
```

Log out and clear cached Codex authentication:

```powershell
codex logout
```

Do not delete the full `C:\Users\razer\.codex` folder unless you intentionally want to remove all Codex sessions, memories, cached auth, and local user configuration.

## Final Setup Status

- Global install: complete
- Global command launch: complete
- User-level safe defaults: complete
- Repo-local config changes: none
- Secrets exposed or stored in repos: none
- Authentication: pending user completion
- Model-backed smoke test: pending authentication
