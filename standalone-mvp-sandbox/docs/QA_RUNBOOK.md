# Standalone MVP QA Runbook

Use synthetic learners only. Do not use PHI or real learner records.

## Steps

1. Open `standalone-mvp-sandbox/index.html`.
2. Confirm the page header says standalone MVP sandbox only, not Moodle production, no real learner data, no live certificates, and no PHI.
3. Select each synthetic learner.
4. Confirm incomplete required gates block certificate status.
5. Confirm the passing learner shows `Certificate available - sandbox only`.
6. Confirm the optional clinical skipped learner also shows `Certificate available - sandbox only` when required gates pass.
7. Confirm optional clinical support activities are labeled optional, non-credit, non-gating, not clinical-hour credit, and excluded from online CE certificate progress.
8. Confirm QA scenarios show expected block/pass outcomes.
9. Confirm audit packet preview is a mock checklist only and creates no evidence files.

## Expected Negative Results

- Missing legal name blocks certificate.
- Missing CNA number blocks certificate.
- Missing online cap acknowledgement blocks certificate.
- Skipped theory blocks certificate.
- Skipped interaction blocks certificate.
- Insufficient active-time blocks certificate.
- Failed final exam blocks certificate.
- Missing affidavit blocks certificate.
- Admin hold blocks certificate.
- Direct certificate URL access is conceptually blocked before gates complete.
- Optional clinical skipped does not block certificate when required gates pass.

