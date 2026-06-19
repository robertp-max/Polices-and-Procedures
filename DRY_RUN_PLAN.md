# Forensic Backup Dry Run Plan - Revised

## Status

No backup has been started. No files have been copied. This revised plan replaces the prior broad plan.

## Destination

Approved backup destination pattern:

```text
C:\AI\Backups\AI_Chat_Backups\homehealth-policies-procedures-{YYYYMMDD-HHMMSS}
```

- `{YYYYMMDD-HHMMSS}` will be generated at approved execution time from the local machine clock.
- The destination is outside the repository.
- The destination is not under `C:\AI\Git\training\HomeHealth\Policies_and_Procedures`.
- The destination will not be used as a scan root and will not be recursively scanned.

## Source Scan Roots

Only these roots are in scope:

1. Repository evidence root:
   ```text
   C:\AI\Git\training\HomeHealth\Policies_and_Procedures
   ```
2. Cursor workspace/session evidence roots related to this repo only:
   ```text
   C:\Users\razer\AppData\Roaming\Cursor\User\workspaceStorage\3d279c2a041e25d59e0cd5abe69f91cc
   C:\Users\razer\AppData\Roaming\Cursor\User\workspaceStorage\be38975f7fa0b4444972db51af7760c9
   ```
3. Cursor log scan root, filtered to files containing this repo path/name or the two workspace IDs above:
   ```text
   C:\Users\razer\AppData\Roaming\Cursor\logs
   ```

The plan will not scan `C:\AI` broadly and will not touch unrelated repos under `C:\AI`.

## Git State Capture - Metadata Only

Do not copy `.git` or the `.git` object database. Capture repo state only by writing command output into metadata files in the backup destination:

```text
git status --short
git branch -vv
git log --oneline --decorate -150
git remote -v
git rev-parse HEAD
git diff --stat
git diff
git stash list --date=local
git reflog --date=local -50
```

Current estimated metadata output: 9 files, about 14,567 bytes.

## Included Repository Evidence

Exact included folders/files from the repo are limited to the following.

| Include | Rule | Estimated files | Estimated bytes |
|---|---:|---:|---:|
| `Builder\_system\reports\` | all files | 16 | 146,739 |
| `Builder\_system\screenshots\` | all files | 722 | 309,295,577 |
| `Builder\_system\downloads\` | all files | 2 | 2,171,826 |
| `Builder\_system\Q2-QAPI-Walkthrough\reports\` | all files | 5 | 87,903 |
| `Builder\_system\Q2-QAPI-Walkthrough\screenshots\` | all files | 49 | 4,470,569 |
| `Builder\_system\uat\` | all files | 24 | 389,278 |
| `Builder\_system\uat-results\` | all files | 21 | 2,528,651 |
| `Builder\_system\uat-html-report\` | all files | 1 | 524,937 |
| `Builder\_chatGPT\` | all files, if present | 12 | 66,868,896 |
| `Builder\screenshots\` | all files | 22 | 2,110,281 |
| `Builder\Q2-QAPI-Walkthrough\screenshots\` | all files | 15 | 1,443,047 |
| `tmp-ui-verify-screenshots\` | all files | 28 | 4,172,568 |
| `Project_Intelligence\logs\` | all files | 1 | 545 |
| `docs\deploy\` | all files | 1 | 6,887 |
| `docs\context-for-grok\cursor-forensics\` | all files | 11 | 90,674 |
| `Seeding-Live-Staging-Alignment-2026-05\` | evidence extensions only: `.md`, `.json`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.txt`, `.log`, `.err`, `.pid`, `.csv`, `.tsv`, `.eml`, `.pdf`, `.html`, `.htm` | 62 | 21,007,800 |
| `Builder\_system\*` top-level report/result/proof/state/fix files | selected top-level evidence files only | 16 | 2,056,444 |
| Root terminal/dev/evidence files | current root `*.log`, `*.err`, `*.pid`, `*.eml`, `npm-run-dev*.{log,err,pid}`, `validator_*.txt`, `build_output.txt`, `build_qa_*.txt`, `tmp-ui-staging*.png`, `tmp-billing.json` | 20 | 2,830,230 |
| Exact files | `Builder\Policies_and_Procedures.code-workspace`, `SAFE_DEPLOYMENT_REPORT.md` | 2 | 15,116 |

Current repository evidence estimate: 1,030 files, 420,217,968 bytes.

## Included Cursor Evidence

| Include | Rule | Estimated files | Estimated bytes |
|---|---:|---:|---:|
| `C:\Users\razer\AppData\Roaming\Cursor\User\workspaceStorage\3d279c2a041e25d59e0cd5abe69f91cc\` | all files in the workspace storage directory for the repo folder | 551 | 158,357,524 |
| `C:\Users\razer\AppData\Roaming\Cursor\User\workspaceStorage\be38975f7fa0b4444972db51af7760c9\` | all files in the workspace storage directory for the repo workspace file | 7 | 5,556,167 |
| `C:\Users\razer\AppData\Roaming\Cursor\logs\` | only individual log files containing this repo path/name or the two workspace IDs; do not copy the whole logs folder | 20 | 2,266,471 |

Current Cursor evidence estimate: 578 files, 166,180,162 bytes.

## Total Revised Estimate

Current total estimated backup payload:

```text
Files: 1,617
Bytes: 586,412,697
Size: 559.25 MiB
```

These estimates are based on a read-only scan and may change if evidence files change before approval.

## Explicit Exclusions

The backup must not copy these folders/databases/artifacts:

```text
C:\AI\Git\training\HomeHealth\Policies_and_Procedures\.git\
C:\AI\Git\training\HomeHealth\Policies_and_Procedures\.git\objects\
C:\AI\Git\training\HomeHealth\Policies_and_Procedures\node_modules\
C:\AI\Git\training\HomeHealth\Policies_and_Procedures\dist\
C:\AI\Git\training\HomeHealth\Policies_and_Procedures\build\
C:\AI\Git\training\HomeHealth\Policies_and_Procedures\coverage\
C:\AI\Git\training\HomeHealth\Policies_and_Procedures\infra\ces-api-cdk\cdk.out\
any cdk.out\ folder
any .vite\ folder
any browser cache folder, including .cache\, Cache\, Code Cache\, GPUCache\, CacheStorage\, Service Worker\CacheStorage\
C:\AI\Git\training\HomeHealth\Policies_and_Procedures\.vercel\
C:\AI\Git\training\HomeHealth\Policies_and_Procedures\.venv\
C:\AI\Backups\AI_Chat_Backups\homehealth-policies-procedures-{YYYYMMDD-HHMMSS}\
```

Because this is an include-list backup, all repo folders not listed above as included evidence are excluded by default, including source/code folders such as `src\`, `server\`, `scripts\`, `infra\`, `.github\`, `public\`, `config\`, `data\`, `migrations\`, broad `Builder\` content outside listed evidence folders, and broad `docs\` content outside listed evidence folders.

## Safety Confirmations

- `.git`, `.git\objects`, `node_modules`, `dist`, and `build` are excluded.
- The backup destination is outside the repo.
- The new backup folder will not be recursively scanned.
- Untracked files are potential evidence and will not be deleted, moved, stashed, or modified.
- No source code will be modified.
- Git state will not be changed: no add, commit, checkout, reset, stash, clean, tag, branch mutation, or push.
- AWS, GitHub, CloudFront, S3, and production state will not be changed.
- No deployment, upload, invalidation, delete, or cleanup will run.
- File copy will not start until explicit approval is given after this revised plan.
