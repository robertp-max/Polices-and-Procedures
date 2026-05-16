# Builder / Bin Git Hygiene — Tracked Files Remaining in Git Index

**Component**: Repository / Git Index Hygiene  
**Severity**: P2 — pollutes diffs; no runtime impact  
**Status**: Unresolved as of 2026-05-14  

---

## 1. Symptoms Reported by User

- `git status` consistently shows modifications to files inside `Builder/` and `Bin-(thrash)/` directories
- These files appear in every diff and commit diff even though they should be ignored
- Files inside `Builder/` and `Bin-(thrash)/` are listed in `.gitignore`
- Despite the `.gitignore` entries, git continues to track changes to these files

**Evidence from current session (May 14, 2026 `git status`):**

80+ files modified in `Builder/` and `Bin-(thrash)/` appear in `git status`, including:
- `Builder/AWS-Architecture/MASTER-AWS-ARCHITECTURE.md`
- `Builder/Brad2-Business-Risk-Architecture/` (17 files)
- `Builder/Documentations/` (27 files)
- `Builder/Compliance-Execution-Sprints/PMaudit.md`
- `Builder/Knowledge-Base/` (2 files)
- `Builder/System-Documentation-for-Ingestion/` (2 files)
- `Builder/Journey/` (2 files)

Additionally, 3 files are staged as deleted (`D`) in `Builder/_chatGPT/`:
- `Builder/_chatGPT/current_state_2026-05-06_100829.md`
- `Builder/_chatGPT/current_state_2026-05-06_100829_part1.md`
- `Builder/_chatGPT/current_state_2026-05-06_100829_part2.md`

---

## 2. Classification: Builder vs. Bin

Per user instruction:
- **`Builder/`** is a documentation/source corpus used for AI ingestion, audits, and generated artifacts. It is **not a runtime application dependency** unless an explicit `import`, `fetch`, or build step references it.
- **`Bin-(thrash)/`** is an archive of discarded files. It must not be committed and must not be deleted.
- Neither directory should be classified as runtime unless a concrete import/fetch/build dependency is proven.

---

## 3. Prior Attempted Fixes

- `.gitignore` entries were added for `Builder/` and `Bin-(thrash)/`
- No `git rm --cached` command was run after adding the `.gitignore` entries

---

## 4. Why Prior Fixes Likely Failed

`.gitignore` only prevents **new, untracked** files from being added to the index. It does not retroactively remove files that were already committed and tracked.

Once a file is in the git index (committed at some point), `.gitignore` has no effect on it. Git continues to track changes to that file regardless of what `.gitignore` says.

The standard remediation is `git rm --cached <path>`, which removes the file from the git index without deleting it from the filesystem. This command was intentionally not run due to a hard constraint on destructive git operations without owner approval.

---

## 5. Exact Files and Components Involved

| Resource | Role |
|----------|------|
| `Builder/` directory | AI-generated working corpus; not runtime; should be untracked; currently 80+ tracked files |
| `Bin-(thrash)/` directory | Archived files; must not be deleted; currently tracked |
| `.gitignore` | Contains entries for these directories; ineffective for already-tracked files |
| Git index | Contains stale tracked entries for files in both directories |

---

## 6. Current Suspected Root Cause

Files in `Builder/` and `Bin-(thrash)/` were committed to the repository before `.gitignore` entries were added for those directories. The `.gitignore` entries were added later but `git rm --cached` was never run. Git continues to track changes to all previously committed files.

This is a known git behavior, not a bug. It requires explicit remediation.

---

## 7. Validation That Was Claimed

- `.gitignore` entries were confirmed to be present in the file

---

## 8. Validation That Was Missing

- No `git ls-files Builder/` or `git ls-files "Bin-(thrash)/"` check to confirm whether files remain in the index
- No test confirming `git status` no longer shows changes in those directories after `.gitignore` entries were added
- No discussion of whether the hard constraint on `git rm --cached` was communicated to the owner before declaring the issue resolved

---

## 9. Hard Constraints (ABSOLUTE — Do Not Override Without Owner Approval)

- **Never delete** any file from `Builder/` or `Bin-(thrash)/`
- **Never run `git rm`** on any file in these directories
- **Never run `git rm --cached`** on any file in these directories without explicit owner approval
- **Never run `git add`**, `git commit`, or `git push` as part of this forensic phase

`Builder/` contains active working documentation and AI-generated artifacts that the owner needs to preserve. Any destructive operation would cause unrecoverable data loss.

---

## 10. Acceptance Criteria for Future Fix

The fix requires owner decision and explicit approval before proceeding. Once approved:

- [ ] Owner explicitly approves running `git rm --cached` on tracked files in `Builder/` and `Bin-(thrash)/`
- [ ] `git ls-files Builder/` returns empty output after remediation
- [ ] `git ls-files "Bin-(thrash)/"` returns empty output after remediation
- [ ] `git status` no longer shows changes in `Builder/` or `Bin-(thrash)/` for files that have not been intentionally modified
- [ ] Files on disk in `Builder/` and `Bin-(thrash)/` are confirmed to still exist (no filesystem deletion occurred)
- [ ] A commit is created with a clear message documenting the index cleanup

Until owner approval is granted, this issue must be recorded as a **known tracking anomaly** with no remediation action taken.

---

## 11. Priority

**P2** — Tracking issue only. Does not affect application runtime behavior. Does pollute every commit diff, making it harder to review actual application changes. Low urgency relative to P0/P1 items.
