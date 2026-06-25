# Merge Instructions for V2_GCPMerge

This guide explains how to merge the recovered Plan of Care / Journey LMS migration changes into the unified GCP merge worktree at:
`C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_GCPMerge`

---

## Method A: Standard Git Merge (Recommended)

Since the recovery branch `recovery/gemini-poc-journey-lms-20260625` has been pushed to the remote repository, you can pull it directly into your GCP worktree.

1. Open a terminal inside the GCP worktree directory:
   ```powershell
   cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_GCPMerge
   ```

2. Make sure you are on the target integration branch:
   ```powershell
   git checkout integration/brad-builder-google-cloud-deploy
   ```

3. Fetch the newly pushed branch from remote:
   ```powershell
   git fetch origin
   ```

4. Perform the merge:
   ```powershell
   git merge origin/recovery/gemini-poc-journey-lms-20260625 --no-commit --no-ff
   ```
   *(We recommend `--no-commit --no-ff` so you can inspect the merge and resolve any minor conflicts first.)*

5. Resolve any conflicts in configuration or manifest files.
6. Verify the build passes:
   ```powershell
   npx tsc -b
   npm run build
   ```
7. Commit the merge:
   ```powershell
   git commit -m "merge: integrate Gemini Plan of Care & Journey LMS migration"
   ```

---

## Method B: Local Patch Application (Fallback)

If you prefer to apply the changes as a patch directly from the V2 worktree:

1. Generate the patch in the source worktree:
   ```powershell
   cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2
   git diff origin/evidence..recovery/gemini-poc-journey-lms-20260625 > gemini_lms_recovery.patch
   ```

2. Apply the patch in the GCPMerge worktree:
   ```powershell
   cd C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2_GCPMerge
   git apply --reject --whitespace=fix C:\AI\Git\training\HomeHealth\Policies_and_Procedures_V2\gemini_lms_recovery.patch
   ```

3. Review rejected hunks and apply them manually.
4. Verify the build and delete the `.patch` file.
