# Wave 10 — Screenshot Index

**Source suite:** `Builder/_system/uat/wave-10-uiux-premiumization.spec.mjs`  
**Structured output:** `Builder/_system/reports/wave-10-uiux-premiumization.json`

## 1) Desktop parity captures

Per route, two theme-state captures were generated:
- `desktop-care-indeed-light-light-*`
- `desktop-ci-ion-dark-light-*`

Routes:
- `/dashboard`
- `/my-tasks`
- `/evidence`
- `/calendar?view=sprint`
- `/forms`
- `/audit`
- `/pm/dashboard`

Path root:
- `Builder/_system/screenshots/wave-10-uiux-premiumization/`

## 2) Mobile parity captures (390x844)

Per route, two theme-state captures were generated:
- `mobile-care-indeed-light-light-*`
- `mobile-ci-ion-dark-light-*`

Routes:
- `/dashboard`
- `/my-tasks`
- `/evidence`
- `/calendar?view=sprint`
- `/forms`
- `/audit`

## 3) Guided UAT captures

- `guided-uat-wave10-step-1.png`
- `guided-uat-wave10-step-2.png`

## 4) Evidence workflow captures

- `evidence-wave10-after-upload.png`
- (artifact viewer capture conditional if visible) `evidence-wave10-artifact-viewer.png`

## 5) Signer-role + task workflow captures

- `signer-role-wave10-form-surface.png`
- `calendar-wave10-task-workflow.png`

## 6) Before/after comparison map

Before (Wave 9):
- `Builder/_system/screenshots/wave-9-uiux-convergence/*`

After (Wave 10):
- `Builder/_system/screenshots/wave-10-uiux-premiumization/*`

Primary comparison pairs:
- dashboard (`desktop-*-_dashboard.png`, `mobile-*-_dashboard.png`)
- my-tasks (`desktop-*-_my-tasks.png`, `mobile-*-_my-tasks.png`)
- evidence (`desktop-*-_evidence.png`, `mobile-*-_evidence.png`)
- audit (`desktop-*-_audit.png`, `mobile-*-_audit.png`)
- pm dashboard (`desktop-*-_pm_dashboard.png`)
- guided UAT (`guided-uat-step-*` vs `guided-uat-wave10-step-*`)
