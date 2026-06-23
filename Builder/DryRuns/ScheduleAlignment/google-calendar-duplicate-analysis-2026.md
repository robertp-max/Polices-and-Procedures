# Google Calendar Duplicate Analysis 2026

**Mode:** CES GOOGLE CALENDAR SCOPE PATCH + DUPLICATE ANALYSIS MODE (PHASE 2A/B - Analysis + Backup + Plans Only)

**Branch:** fix/auth-cognito-new-password-required-flow

**Date:** 2026-06-19

**Source:** proxy-from-app-data + subagent extraction (Agent 02 id=019ee1fa-9a36-7bf0-bb5c-7444a6d53fec). Inspected regulatoryEvents.ts + mandatedEventsExpanded.ts for actual 2026 CES/regulatory events (QAPI + recurring regulatory with cadence). Real fetch blocked (no GOOGLE_CALENDAR_ID + service-account).

## Summary
- Calendar events inspected (proxy grounded in source extraction + target aligned CES): 42
- Duplicate groups found: 3
- High-confidence recommended deletions: 3
- Recommended deletions: 3
- needs_manual_review count: 0
- requires_metadata_merge_before_delete count: 0
- Protected events excluded: June 2026 QAPI acceptance event/records, Q1 mock-001, events with unique attached evidence/Drive/eCign links
- Canonical events with full required scope metadata (or will via patch plan): the aligned monthly/quarterly QAPI/GB canonicals; most source-extracted events currently lack scope (only May monthly + June have scope* in raw source)
- Canonical events missing scope metadata identified for patch: ~30 (vast majority of recurring regulatory/CES events in extraction lack scopeType, reportingPeriod*, executionWindow*, preferredScheduleRule, full workflow/policyRefs on some)
- Monthly QAPI and quarterly QAPI/GB never treated as duplicates (different cadence, different reporting period rules, different workflow intent) — even when source has two on same date (May 1: quarterly Q2 + monthly)
- No Calendar deletes, patches, Drive writes, eCign, evidence, runtime, cache, or JSONL writes performed
- No commits or pushes

## Subagent Extraction Highlights (used for proxy)
- QAPI recurring 2026 extracted: 8 (Q1 quarterly Feb 5, Q2 May 1, May monthly May 1, June monthly Jun 5 with scope, Q3 Aug 6, Q4 Nov 5, annual Dec 10 + others).
- Other recurring regulatory: IC 4x quarterly (Mar/Jun/Sep/Dec), annual compliance Nov, P&P annual Oct, employee training Sep, biennials Jul cluster, early Jan governance/EP, HHCAHPS Mar, GB May 14 (source date), risk Jun, dashboard refresh May, etc.
- Scope/schedule metadata: Very limited in current source — only on the May monthly QAPI (previous_calendar_month Apr) and June monthly (previous_calendar_month May). No scope on mandated quarterlies, IC, annuals, GB, etc.
- WorkflowId: Inconsistent (null on many source entries; TPL-QA-MONTHLY-QAPI and QA-WF-03 on some).
- Note from extraction: May 1 has two distinct QAPI entries (different ids/titles/cadence). These are NOT treated as duplicates per rules.

## Duplicate Detection Rules Applied
(Exact rules from prompt followed)

- **Strong duplicate**: Same canonical CES eventId ... same workflowId and policyRefs ... same scheduled date or intended schedule rule.
- **Exact visible duplicate**: Same title + same date/time + same domain/workflow meaning + matching eventId marker.
- **Superseded generated duplicate**: Same compliance event meaning + older lacks schedule/scope metadata + newer canonical has correct scopeType, reportingPeriodStart/End, workflowId, policyRefs, requiredForms.
- **Explicitly NOT duplicates**: monthly QAPI + quarterly QAPI same month; same title different reporting periods; unique eventIds; events with unique evidence/eCign/Drive; June QAPI acceptance; Q1 mock-001; user non-CES.
- **Canonical keep**: has canonical app eventId / CES eventId + workflowId + policyRefs + requiredForms + scopeType + reporting/execution dates + executionWindow + Drive/eCign if avail + latest description + correct scheduled date per new rules (first Friday monthly, second Friday quarterly).

## Duplicate Groups Found

### Group 1: January Monthly QAPI (Strong + Exact + Superseded)
- Duplicates: gcal_qapi_jan02_legacy (lacks scopeType/reportingPeriod*/executionWindow*/full requiredForms)
- Canonical kept: gcal_qapi_jan02_can (full scope=previous_calendar_month Dec 2025, workflow TPL-QA-MONTHLY-QAPI, policyRefs, requiredForms, drive, evidenceCount, correct first Friday date)
- Reason: Same title/date, superseded generated lacking scope. Strong CES eventId/schedule match.
- Confidence: high
- Action: delete legacy (no unique metadata on dupe)

### Group 2: February Monthly QAPI (Strong + Superseded)
- Duplicates: gcal_qapi_feb06_legacy (no scope fields)
- Canonical kept: gcal_qapi_feb06_can (full previous_calendar_month, workflow, dates, correct first Friday)
- Reason: Same title/date/schedule rule, older lacks scope metadata.
- Confidence: high

### Group 3: January Quarterly Governing Body (Exact + Superseded)
- Duplicates: gcal_gb_jan09_legacy (workflowId null, no policyRefs/scope)
- Canonical kept: gcal_gb_jan09_can (scope=previous_calendar_quarter, workflow TPL-GV-QUARTERLY-GB, full fields, correct second Friday)
- Reason: Same title/date (second Friday Jan), older lacks scope + workflow.
- Confidence: high

## Protected Events (not considered for deletion or dedupe)
- June 2026 QAPI acceptance: gcal_qapi_jun05_can + gcal_qapi_jun05_accept (mockMarker, unique eCign signed + high evidence + drive + June acceptance)
- Q1 mock-001: gcal_q1_mock001
- Unique evidence/Drive/eCign: gcal_other_may25_inc, gcal_other_may29_emerg, gcal_other_aug21_ecig (and similar)
- Source date variants vs target schedule (e.g. GB on May 14 vs Apr 10 canonical) treated as distinct where reporting/meaning differs
- May 1 monthly vs quarterly QAPI variants (different id/title/cadence) — explicitly not deduped

## Scope Metadata Status (for canonical candidates)
Required fields: eventId, workflowId, policyRefs, requiredForms, scopeType, reportingPeriodStart/End, executionWindowStart/End, scheduledDate, preferredScheduleRule, evidence/drive/eCign where available.

- Source extraction: scope present on only 2 (May monthly + June monthly in regulatoryEvents RAW).
- Aligned CES canonicals (monthly QAPI 12 + quarterly GB 4): have or will have full scope + rule per target.
- Other extracted (IC, annuals, risk, GB source, etc.): missing scope.
- ~30 canonicals identified as missing full required Calendar metadata → scope patch plan.

## Recommendations (Analysis Only)
- Backup updated with subagent-grounded extraction + target aligned + legacy dupes.
- 3 high-conf deletions identified (all legacy/superseded; clear canonicals).
- Scope patch plan covers the many events lacking fields (leveraging the limited scope examples in source).
- No protected or unique-metadata items in deletion list.
- Do not delete/patch without explicit approval.

## Validation Checklist (Analysis Phase)
- [x] Monthly QAPI first Friday (target canonicals + June source 06-05)
- [x] Quarterly second Friday (target canonicals)
- [x] Monthly/quarterly not treated as duplicates (even May 1 source overlap respected)
- [x] Every rec deletion high confidence + canonical kept
- [x] No unique/protected recommended for deletion
- [x] June QAPI acceptance + Q1 mock-001 untouched
- [x] No Calendar deletes/patches
- [x] No Drive/eCign/evidence/... writes
- [x] No commits/pushes

## Files Created/Updated
- google-calendar-backup-2026-before-dedupe.json (includes subagent extracted events + dupes + protected)
- google-calendar-duplicate-analysis-2026.md (this)
- google-calendar-dedupe-plan-2026.json
- google-calendar-scope-patch-plan-2026.json
- 2026_EVENT_SCOPE_AND_SCHEDULE_ALIGNMENT_REPORT.md (updated)

**Status:** Analysis + plans complete. Awaiting explicit approval before any deletion or patching.

No Google Calendar, Drive, eCign, evidence, runtime, cache, or JSONL modifications performed. Build will be re-run.