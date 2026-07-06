# UAT_ADVANCED_TRAINING_EVIDENCE_INDEX.md

- Git outputs: branch, HEAD, status, diff (see master report).
- File existence: list_dir on advancedTraining and advanced/ directories.
- Code structure: read_file on AdvancedTrainingPlayer.tsx (rail/center/right/no-PHI), panels (distinct JSX).
- Titles and registration: grep on CareIndeedOnboardingLMS.tsx (4 exact titles, moduleIds, ALL_MODULES).
- Dispatch: grep on ModulePlayerScreen.tsx (isAdvancedModule + AdvancedTrainingPlayer).
- Narration: grep on data files (narration_script/transcript_text present).
- Stats: read on card render ( % Complete, Questions, Best Score boxes).
- Artifacts: grep/read on panels (noPhi: true, moduleId, score, timestamp).
- Red flags / PHI: grep searches clean for bad terms in ADV paths.
- Build/lint: targeted npx tsc and eslint = 0 issues in ADV files.
- Contract: read_file on advancedTrainingContract.ts (defines required fields).

No browser screenshots (CLI environment). Full runtime would require manual dev server + browser.