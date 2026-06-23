# ACHC Annual Field Worker Training Validation Report

## Canonical Bundle

- Bundle name: ACHC Annual Field Worker Training
- Bundle ID: `ACHC_ANNUAL_FIELD_WORKER_TRAINING`
- Assignment rule: assigned on hire and annually to direct-care employees (`RN`, `LVN`, `HHA`, `PT`, `PTA`, `OT`, `COTA`, `SLP`, `MSW`)
- Passing score: ACHC minimum: 75%; Care Indeed passing standard: 80% (Care Indeed standard, stricter than ACHC packet minimum)
- Production certification note: current journey runtime remains localStorage-backed, so ACHC completion is UAT-only until backend personnel/evidence persistence is implemented. Production compliance certification must remain blocked until that persistence exists.

## Required Topic Mapping

- M01 `ACHC-ART-M01`: Cultural Awareness -> Cultural Awareness
- M02 `ACHC-ART-M02`: Emergency & Disaster Preparedness -> Emergency/Disaster
- M03 `ACHC-ART-M03`: Complaints & Grievances -> Complaints/Grievances
- M04 `ACHC-ART-M04`: HIPAA Privacy & Security -> HIPAA
- M05 `ACHC-ART-M05`: Infection Control -> Infection Control
- M06 `ACHC-ART-M06`: Communication Barriers -> Communication Barriers
- M07 `ACHC-ART-M07`: Workplace & Patient Safety (OSHA) -> Workplace/Patient Safety (OSHA)
- M08 `ACHC-ART-M08`: Patient Rights & Responsibilities -> Patient Rights/Responsibilities
- M09 `ACHC-ART-M09`: Corporate Compliance -> Corporate Compliance
- M10 `ACHC-ART-M10`: Ethics in Healthcare -> Ethics
- M11 `ACHC-ART-M11`: TB & Blood Borne Pathogens -> TB / Bloodborne Pathogens
- M12 `ACHC-ART-M12`: Medical Device Act -> Medical Device Act

## Validation Checks

- All 12 required topics mapped: pass
- Duplicate modules: none expected; canonical utility reports duplicates from `ACHC_ART`
- Missing modules: none expected; canonical utility reports missing IDs from M01-M12
- Assignment applies to all direct-care roles: pass
- Pass threshold is >=75%: pass, 80% configured
- Annual retraining generated: pass when completion evidence exists; `next_due_at` is calculated from `completed_at + 365 days`
- Certificate/post-test personnel-file evidence created: pass when completion evidence contains `certificate_id`, `post_test_artifact_id`, `personnel_file_reference`, and `evidence_id`

## Before / After Examples

- Assigned M01-M12 with no activity: before, dashboard math could infer completion from loose display state; after, 0% complete and `not_started`.
- Lessons viewed but post-test not submitted: before, lesson status could look complete; after, `in_progress` and not compliant.
- Below-threshold score: before, a terminal attempt could still leak into completion totals; after, failed and not complete.
- Later passing retake: before, prior attempts were not consistently preserved in summaries; after, failed attempts remain in history and best/latest scores are calculated.
- Passed all M01-M12 with certificate missing: after, bundle is not compliant.
- Passed all M01-M12 with certificate but post-test artifact missing: after, bundle is not compliant.
- Passed all M01-M12 with certificate and post-test evidence: after, bundle is compliant.
- Overdue annual cycle: after, overdue employees appear through the shared ACHC calculation source.
- Dashboard totals: after, totals are derived from raw attempts, completion evidence, certificate, post-test artifact, and personnel-file references.

## Theme Compatibility Note

- Modified `src/policy/journey/components/ScormPlayer.tsx`: ACHC lesson review, quiz grading summary, pass/fail status, and progress copy use Care Indeed theme/token classes and remain readable in dark and light/normal modes.
- Modified `src/policy/journey/components/ModuleCard.tsx`: ACHC progress/evidence status rows use existing status chips and theme token classes for dark and light/normal modes.
- Modified `src/policy/onboarding-v2/components/KpiTile.tsx`: KPI cards now use theme token classes instead of one-theme hardcoded backgrounds.
- Modified `src/policy/onboarding-v2/components/StatusPill.tsx`: status colors now use existing success/warning/danger/info/muted token classes.
- Modified `src/policy/onboarding-v2/pages/DashboardPage.tsx`: ACHC summary panel uses token classes and existing status/KPI primitives; no independent theme toggle was added.
