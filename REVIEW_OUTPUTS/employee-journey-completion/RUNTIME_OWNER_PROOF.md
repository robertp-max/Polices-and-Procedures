# Runtime Owner Proof — localhost:5190

_Generated as the mandatory gate before any edit (Master Correction Prompt §1)._

## Listening process

```
Get-NetTCPConnection -LocalPort 5190 -State Listen  →  OwningProcess = 22512

ProcessId       : 22512
ParentProcessId : 16584
ExecutablePath  : C:\Program Files\nodejs\node.exe
CommandLine     : "node" "…\Policies_and_Procedures_V2_worktrees\GOVERNING_BODY_PORTAL\
                  apps\employee-journey\node_modules\.bin\..\vite\bin\vite.js"
                  --port 5190 --strictPort
```

The Vite dev server binding port 5190 runs out of the **GOVERNING_BODY_PORTAL** worktree's
`apps/employee-journey` package.

## Git state of the proven worktree

| Field | Value |
|-------|-------|
| toplevel | `C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2_worktrees/GOVERNING_BODY_PORTAL` |
| branch | `feature/governing-body-portal` |
| HEAD | `ca058df442cb9515069efee1a0dddde052735317` |
| remote (origin) | `https://github.com/robertp-max/Polices-and-Procedures.git` |
| `git status --short` | **clean — 0 changed files** |

## Decision

The serving worktree is **clean** (no dirty/uncommitted files), so no isolation copy is
required (Master Correction Prompt §1). All correction work proceeds directly in this
worktree on branch `feature/governing-body-portal`, staging exact paths only, and pushes to
that same branch. No deploy.
