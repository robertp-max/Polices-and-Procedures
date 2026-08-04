#!/usr/bin/env node
/**
 * Scaffold first-pass pageviews for every planned nav item.
 * Synthetic UI only — no production clinical authority.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCREENS = path.join(ROOT, 'src', 'screens')
const DATA = path.join(ROOT, 'src', 'data')

/** @type {Array<{
 *  name: string, prefix: string, route: string, navLabel: string, domainId: string,
 *  title: string, sub: string, primary: string, secondary: string,
 *  stats: Array<{kicker:string,value:string,sub:string,accent:string}>,
 *  columns: string[], rows: Array<string[]>, emptyTitle?: string
 * }>} */
const PAGEVIEWS = [
  {
    name: 'WorkQueue', prefix: 'wq', route: '/work-queue', navLabel: 'My work queue', domainId: 'COR',
    title: 'My work queue', sub: 'Closed-loop tasks, SLAs, and ownership — synthetic queue for design evaluation.',
    primary: 'Claim next item', secondary: 'Filter queue',
    stats: [
      { kicker: 'Open', value: '18', sub: 'Across all owners', accent: 'teal' },
      { kicker: 'Due today', value: '6', sub: 'Needs action before EOD', accent: 'warn' },
      { kicker: 'Overdue', value: '2', sub: 'Escalation candidates', accent: 'bad' },
      { kicker: 'Completed today', value: '9', sub: 'With completion evidence', accent: 'good' },
    ],
    columns: ['Work item', 'Patient', 'Owner', 'Due', 'Priority', 'State'],
    rows: [
      ['SOC OASIS review', 'Elena Martinez', 'Taylor Brooks, RN', 'Today 4:00 PM', 'High', 'In progress'],
      ['Order countersignature', 'Walter Feld', 'Dr. Susan Cho', 'Today 5:30 PM', 'High', 'Waiting'],
      ['Authorization unit check', 'Priya Desai', 'Billing desk', 'Tomorrow', 'Medium', 'Open'],
      ['Aide supervision clock', 'James Okonkwo', 'Clinical manager', 'Wed', 'Medium', 'Open'],
      ['Missed-visit follow-up', 'Rosa Alvarez', 'Taylor Brooks, RN', 'Overdue', 'Critical', 'Escalated'],
    ],
  },
  {
    name: 'Episodes', prefix: 'epi', route: '/episodes', navLabel: 'Episodes & certification', domainId: 'EPI',
    title: 'Episodes & certification', sub: 'Home-health episode state, certification periods, and transition readiness.',
    primary: 'Open episode', secondary: 'New certification period',
    stats: [
      { kicker: 'Active episodes', value: '42', sub: 'Branch cohort', accent: 'teal' },
      { kicker: 'Cert due ≤7d', value: '5', sub: 'Physician signature windows', accent: 'warn' },
      { kicker: 'SOC this week', value: '3', sub: 'New payment periods', accent: 'orange' },
      { kicker: 'Transfers open', value: '1', sub: 'Hospitalization handoff', accent: 'progress' },
    ],
    columns: ['Patient', 'Episode', 'SOC', 'Day', 'Cert window', 'Status'],
    rows: [
      ['Elena Martinez', 'EP-24081', 'Jul 29', '6 / 60', 'Primary cert open', 'Active'],
      ['Walter Feld', 'EP-24055', 'Jul 12', '23 / 60', 'Recert due in 4d', 'At risk'],
      ['Priya Desai', 'EP-24090', 'Aug 1', '3 / 60', 'Primary cert open', 'Active'],
      ['James Okonkwo', 'EP-23998', 'Jun 20', '45 / 60', 'Recert signed', 'Active'],
    ],
  },
  {
    name: 'OasisAssessments', prefix: 'oas', route: '/oasis', navLabel: 'OASIS assessments', domainId: 'EPI',
    title: 'OASIS assessments', sub: 'Time-point selection, package versioning, review, lock, and CMS file readiness — synthetic.',
    primary: 'Continue assessment', secondary: 'Validation report',
    stats: [
      { kicker: 'In progress', value: '7', sub: 'Field + QA review', accent: 'progress' },
      { kicker: 'Ready for lock', value: '2', sub: 'Clinical review complete', accent: 'teal' },
      { kicker: 'Submission holds', value: '1', sub: 'Rejection repair', accent: 'bad' },
      { kicker: 'Accepted (30d)', value: '28', sub: 'Reconciled responses', accent: 'good' },
    ],
    columns: ['Patient', 'Time point', 'Package', 'Owner', 'Completeness', 'Status'],
    rows: [
      ['Elena Martinez', 'SOC', 'OASIS-E2', 'Taylor Brooks, RN', '82%', 'In progress'],
      ['Walter Feld', 'Recert', 'OASIS-E2', 'Marcus Webb, PT', '100%', 'Ready for lock'],
      ['Priya Desai', 'SOC', 'OASIS-E2', 'Taylor Brooks, RN', '41%', 'In progress'],
      ['Rosa Alvarez', 'Transfer', 'OASIS-E2', 'Clinical QA', '96%', 'Rejection repair'],
    ],
  },
  {
    name: 'Medications', prefix: 'med', route: '/medications', navLabel: 'Medications', domainId: 'CLN',
    title: 'Medications & allergies', sub: 'Sourced lists, discrepancies, and reconciliation proposals — never auto-filed.',
    primary: 'Start reconciliation', secondary: 'Allergy list',
    stats: [
      { kicker: 'Active meds', value: '11', sub: 'Elena sample chart', accent: 'teal' },
      { kicker: 'Discrepancies', value: '2', sub: 'Need clinician resolution', accent: 'warn' },
      { kicker: 'High-risk flags', value: '1', sub: 'Anticoagulant', accent: 'bad' },
      { kicker: 'Allergies', value: '1', sub: 'Penicillin · rash', accent: 'neutral' },
    ],
    columns: ['Drug', 'Dose / route / freq', 'Source', 'Status', 'Flag'],
    rows: [
      ['Metoprolol', '25 mg PO BID', 'Discharge list', 'Active', 'Dose unconfirmed'],
      ['Apixaban', '5 mg PO BID', 'Bottle photo', 'Active', 'High-risk'],
      ['Acetaminophen', '650 mg PO PRN', 'Patient report', 'Proposed', 'Needs reconcile'],
      ['Lisinopril', '10 mg PO daily', 'PCP list', 'Active', '—'],
    ],
  },
  {
    name: 'FieldVisits', prefix: 'fld', route: '/field-visits', navLabel: 'Field visits & EVV', domainId: 'FLD',
    title: 'Field visits & EVV', sub: 'Point-of-care capture, offline outbox, and applicability-driven EVV — synthetic.',
    primary: 'Open visit packet', secondary: 'Outbox status',
    stats: [
      { kicker: 'Today\'s visits', value: '14', sub: 'Branch field force', accent: 'teal' },
      { kicker: 'Unsynced', value: '3', sub: 'Encrypted outbox', accent: 'warn' },
      { kicker: 'EVV exceptions', value: '1', sub: 'Applicable cohort only', accent: 'bad' },
      { kicker: 'Offline ready', value: '100%', sub: 'Device check-in OK', accent: 'good' },
    ],
    columns: ['Visit', 'Clinician', 'Window', 'EVV', 'Sync', 'State'],
    rows: [
      ['SN · Elena Martinez', 'Taylor Brooks', '2:00–3:00 PM', 'N/A (Medicare)', 'Synced', 'Documentation due'],
      ['PT · Walter Feld', 'Marcus Webb', '10:00–11:00 AM', 'N/A', 'Synced', 'Completed'],
      ['HHA · James Okonkwo', 'Priya Natarajan', '1:00–2:00 PM', 'Required', 'Queued', 'In field'],
      ['SN · Rosa Alvarez', 'On-call RN', 'Missed window', 'N/A', '—', 'Exception'],
    ],
  },
  {
    name: 'AideSupervision', prefix: 'hha', route: '/aide-supervision', navLabel: 'Aide supervision', domainId: 'HHA',
    title: 'Aide supervision', sub: 'Plan-authorized services, supervision clocks, and observation requirements.',
    primary: 'Schedule supervision', secondary: 'Clock rules',
    stats: [
      { kicker: 'Active aide patients', value: '16', sub: 'With HHA services', accent: 'teal' },
      { kicker: 'Due ≤7 days', value: '4', sub: 'Skilled + non-skilled clocks', accent: 'warn' },
      { kicker: 'Overdue', value: '1', sub: 'Escalation open', accent: 'bad' },
      { kicker: 'Observations done', value: '9', sub: 'This period', accent: 'good' },
    ],
    columns: ['Patient', 'Aide', 'Clock type', 'Next due', 'Last observation', 'Status'],
    rows: [
      ['James Okonkwo', 'Priya Natarajan', 'Skilled 14-day', 'Fri', 'Jul 28', 'On track'],
      ['Rosa Alvarez', 'Sam Ortiz', 'Non-skilled 60-day', 'Overdue', 'Jun 12', 'Escalated'],
      ['Elena Martinez', 'Priya Natarajan', 'Skilled 14-day', 'Aug 12', 'Aug 1', 'On track'],
    ],
  },
  {
    name: 'Authorizations', prefix: 'authz', route: '/authorizations', navLabel: 'Authorizations', domainId: 'RCM',
    title: 'Authorizations', sub: 'Payer units, windows, and utilization — separate from clinical necessity.',
    primary: 'Request authorization', secondary: 'Utilization ledger',
    stats: [
      { kicker: 'Active auths', value: '31', sub: 'Branch', accent: 'teal' },
      { kicker: 'Units ≤10%', value: '4', sub: 'Near exhaustion', accent: 'warn' },
      { kicker: 'Expiring ≤14d', value: '3', sub: 'Renewal work', accent: 'orange' },
      { kicker: 'Holds', value: '2', sub: 'Claim readiness', accent: 'bad' },
    ],
    columns: ['Patient', 'Payer', 'Service', 'Units left', 'Window', 'Status'],
    rows: [
      ['Elena Martinez', 'Medicare', 'SN visits', 'Unlimited*', 'Payment period', 'Open'],
      ['Walter Feld', 'Medicare Adv.', 'PT', '4 / 20', 'Ends Aug 20', 'Near limit'],
      ['Priya Desai', 'Commercial', 'SN', '0 / 12', 'Ends Aug 5', 'Hold'],
    ],
  },
  {
    name: 'BeneficiaryNotices', prefix: 'ben', route: '/beneficiary-notices', navLabel: 'Beneficiary notices', domainId: 'BEN',
    title: 'Beneficiary notices & appeals', sub: 'NOMNC, DENC, delivery clocks, and expedited review — synthetic drills only.',
    primary: 'Start NOMNC packet', secondary: 'Appeal timeline',
    stats: [
      { kicker: 'Open notices', value: '3', sub: 'Delivery required', accent: 'warn' },
      { kicker: 'Appeals active', value: '1', sub: 'BFCC-QIO path', accent: 'progress' },
      { kicker: 'Due ≤48h', value: '2', sub: 'Clock-sensitive', accent: 'bad' },
      { kicker: 'Completed (30d)', value: '11', sub: 'With acknowledgments', accent: 'good' },
    ],
    columns: ['Patient', 'Notice', 'Trigger', 'Deliver by', 'Recipient', 'Status'],
    rows: [
      ['Walter Feld', 'NOMNC', 'Service end proposed', 'Tomorrow 5 PM', 'Beneficiary', 'Draft'],
      ['Rosa Alvarez', 'DENC', 'Expedited appeal', 'Today 3 PM', 'Representative', 'In delivery'],
      ['James Okonkwo', 'NOMNC', 'Discharge planning', 'Thu', 'Beneficiary', 'Acknowledged'],
    ],
  },
  {
    name: 'QapiProgramme', prefix: 'qapi', route: '/qapi', navLabel: 'QAPI programme', domainId: 'QAP',
    title: 'QAPI programme', sub: 'PIPs, RCA, CAP, and effectiveness — no closure on task completion alone.',
    primary: 'Open active PIP', secondary: 'Effectiveness board',
    stats: [
      { kicker: 'Active PIPs', value: '2', sub: 'Agency control', accent: 'teal' },
      { kicker: 'CAPs open', value: '5', sub: 'With owners', accent: 'warn' },
      { kicker: 'Due effectiveness', value: '1', sub: 'Return evidence needed', accent: 'orange' },
      { kicker: 'Closed w/ proof', value: '4', sub: 'Last 2 quarters', accent: 'good' },
    ],
    columns: ['PIP / CAP', 'Owner', 'Baseline', 'Countermeasure', 'Return', 'Status'],
    rows: [
      ['Hospitalization · HF cohort', 'QAPI lead', '22.4%', 'After-hours pathway', 'Sep 15', 'Active'],
      ['Fall events · SOC week', 'DON', '6 events', 'Home safety kit', 'Aug 30', 'Effectiveness due'],
      ['Missed-visit communication', 'Ops director', '4.1%', 'Call-tree drill', 'Closed', 'Sustained'],
    ],
  },
  {
    name: 'CmsQuality', prefix: 'hqr', route: '/cms-quality', navLabel: 'CMS quality reporting', domainId: 'HQR',
    title: 'CMS quality reporting', sub: 'HHQRP completeness, HHVBP monitoring, and conditional HHCAHPS posture.',
    primary: 'Run completeness', secondary: 'Public reporting snapshot',
    stats: [
      { kicker: 'Assessment completeness', value: '96.2%', sub: 'Threshold watch', accent: 'teal' },
      { kicker: 'Rejected files', value: '1', sub: 'Repair queue', accent: 'bad' },
      { kicker: 'HHVBP measures', value: '12', sub: 'Monitored', accent: 'progress' },
      { kicker: 'HHCAHPS', value: 'Exempt*', sub: 'Volume determination on file', accent: 'neutral' },
    ],
    columns: ['Measure / file', 'Cohort', 'Deadline', 'Owner', 'CMS response', 'Status'],
    rows: [
      ['OASIS completeness', 'Eligible episodes', 'Month-end', 'OASIS coordinator', '—', 'On track'],
      ['Quality file batch', 'July', 'Submitted', 'Quality desk', 'Accepted', 'Closed'],
      ['Rejection repair', '1 assessment', '48h', 'Clinical QA', 'Rejected', 'Open'],
    ],
  },
  {
    name: 'Competency', prefix: 'cmp', route: '/competency', navLabel: 'Competency & in-service', domainId: 'QAP',
    title: 'Competency & in-service', sub: 'Role-required education, observation, remediation, and assignment gates.',
    primary: 'Assign training', secondary: 'Due roster',
    stats: [
      { kicker: 'Due ≤14d', value: '8', sub: 'Staff assignments', accent: 'warn' },
      { kicker: 'Overdue', value: '2', sub: 'Blocks field assignment', accent: 'bad' },
      { kicker: 'Completed (30d)', value: '37', sub: 'With evidence', accent: 'good' },
      { kicker: 'Remediation open', value: '3', sub: 'Observation failed', accent: 'orange' },
    ],
    columns: ['Staff', 'Requirement', 'Due', 'Evidence', 'Gate', 'Status'],
    rows: [
      ['Priya Natarajan, HHA', 'Annual competency', 'Aug 10', 'Observation form', 'Assignment', 'Due soon'],
      ['Sam Ortiz, HHA', 'In-service · infection', 'Overdue', 'Missing', 'Blocked', 'Overdue'],
      ['Taylor Brooks, RN', 'OASIS competency', 'Sep 1', 'Quiz + observation', 'Clear', 'On track'],
    ],
  },
  {
    name: 'EmergencyPrep', prefix: 'emp', route: '/emergency', navLabel: 'Emergency preparedness', domainId: 'EMP',
    title: 'Emergency preparedness', sub: 'Patient-specific profiles, command posture, and exercise evidence.',
    primary: 'Open patient profile', secondary: 'Exercise calendar',
    stats: [
      { kicker: 'Profiles current', value: '94%', sub: 'Active patients', accent: 'teal' },
      { kicker: 'Power-dependent', value: '6', sub: 'Device / oxygen', accent: 'warn' },
      { kicker: 'Exercises YTD', value: '2', sub: 'With after-action', accent: 'good' },
      { kicker: 'Missing profiles', value: '3', sub: 'SOC this week', accent: 'bad' },
    ],
    columns: ['Patient', 'Priority', 'Dependencies', 'Evacuation', 'Last review', 'Status'],
    rows: [
      ['Elena Martinez', 'High', 'Walker · lives alone', 'Caregiver neighbor', 'SOC day 1', 'Current'],
      ['Walter Feld', 'Critical', 'O2 concentrator', 'Daughter on file', 'Jul 20', 'Needs refresh'],
      ['James Okonkwo', 'Medium', 'None documented', 'Self', 'Missing', 'Incomplete'],
    ],
  },
  {
    name: 'LegalEvidence', prefix: 'leg', route: '/legal-evidence', navLabel: 'Legal evidence', domainId: 'DOC',
    title: 'Legal evidence packages', sub: 'Retention-locked packages, holds, and hash verification — design only.',
    primary: 'Assemble package', secondary: 'Legal hold list',
    stats: [
      { kicker: 'Packages (30d)', value: '14', sub: 'Signed manifests', accent: 'teal' },
      { kicker: 'Legal holds', value: '2', sub: 'Disposition blocked', accent: 'warn' },
      { kicker: 'Hash mismatches', value: '0', sub: 'Last verification run', accent: 'good' },
      { kicker: 'Pending signatures', value: '3', sub: 'Package incomplete', accent: 'progress' },
    ],
    columns: ['Package', 'Patient / matter', 'Contents', 'Hold', 'Verified', 'Status'],
    rows: [
      ['PKG-8821', 'Elena Martinez · SOC', 'Notes, OASIS draft, orders', 'No', 'Yes', 'Draft'],
      ['PKG-8790', 'Incident · fall', 'Timeline, photos, notifications', 'Yes', 'Yes', 'On hold'],
      ['PKG-8755', 'Discharge packet', 'Instructions, signatures', 'No', 'Yes', 'Sealed'],
    ],
  },
  {
    name: 'DataExports', prefix: 'dex', route: '/data-exports', navLabel: 'Data & exports', domainId: 'DAT',
    title: 'Data, analytics & exports', sub: 'Derived views with lineage — not transactional clinical authority.',
    primary: 'Request export', secondary: 'Lineage report',
    stats: [
      { kicker: 'Scheduled extracts', value: '9', sub: 'Nightly + weekly', accent: 'teal' },
      { kicker: 'Stale views', value: '1', sub: 'Labeled in UI', accent: 'warn' },
      { kicker: 'Export jobs today', value: '4', sub: 'Completed with counts', accent: 'good' },
      { kicker: 'Failed jobs', value: '0', sub: 'Last 24h', accent: 'good' },
    ],
    columns: ['Dataset', 'Consumer', 'Last refresh', 'Lineage', 'PHI boundary', 'Status'],
    rows: [
      ['Visit productivity', 'Ops dashboard', '06:10 today', 'FHIR → warehouse', 'De-identified', 'Current'],
      ['Claim readiness', 'Revenue desk', 'Stale 18h', 'Domain services', 'Limited PHI', 'Stale'],
      ['Quality measures', 'QAPI', 'Yesterday', 'OASIS + claims', 'Aggregate', 'Current'],
    ],
  },
  {
    name: 'UsersAccess', prefix: 'iam', route: '/users-access', navLabel: 'Users & access', domainId: 'IAM',
    title: 'Users & access', sub: 'Workforce identity, least privilege, and break-glass — synthetic directory.',
    primary: 'Invite user', secondary: 'Break-glass log',
    stats: [
      { kicker: 'Active users', value: '48', sub: 'Workforce + service', accent: 'teal' },
      { kicker: 'Access reviews due', value: '5', sub: 'Quarterly cadence', accent: 'warn' },
      { kicker: 'Break-glass (30d)', value: '1', sub: 'Reviewed', accent: 'progress' },
      { kicker: 'Revocations pending', value: '0', sub: 'Same-day target', accent: 'good' },
    ],
    columns: ['User', 'Role', 'Last access', 'MFA', 'Review', 'Status'],
    rows: [
      ['Taylor Brooks', 'RN · case manager', 'Today', 'On', 'Current', 'Active'],
      ['Marcus Webb', 'PT', 'Yesterday', 'On', 'Due Sep', 'Active'],
      ['Billing bot', 'Service account', 'Today', 'N/A', 'Owner: Finance', 'Active'],
      ['Temp contractor', 'Read-only QA', 'Jul 2', 'On', 'Expired', 'Disabled'],
    ],
  },
  {
    name: 'OrgMaster', prefix: 'gov', route: '/org-master', navLabel: 'Organization & master data', domainId: 'GOV',
    title: 'Organization & master data', sub: 'Legal entity boundary, effective-dated configuration, and controlled change.',
    primary: 'Propose change', secondary: 'Effective-date calendar',
    stats: [
      { kicker: 'Legal entity', value: '1', sub: 'Care Indeed Home Health Care, Inc.', accent: 'teal' },
      { kicker: 'Pending changes', value: '3', sub: 'Awaiting approval', accent: 'warn' },
      { kicker: 'Branches', value: '1', sub: 'Campbell', accent: 'neutral' },
      { kicker: 'Config versions', value: '12', sub: 'This year', accent: 'progress' },
    ],
    columns: ['Config set', 'Owner', 'Effective', 'Version', 'Change', 'Status'],
    rows: [
      ['Service area', 'Administrator', 'Aug 1', 'v4', 'ZIP expansion', 'Approved'],
      ['Payer contracts', 'Finance', 'Pending', 'v7-draft', 'New MA plan', 'In review'],
      ['Discipline matrix', 'DON', 'Jul 15', 'v3', 'OT capacity', 'Active'],
    ],
  },
  {
    name: 'Interoperability', prefix: 'fhr', route: '/interoperability', navLabel: 'Interoperability', domainId: 'FHR',
    title: 'Interoperability', sub: 'FHIR adapters, partner rails, and contract tests — design prototype.',
    primary: 'View adapter', secondary: 'Contract tests',
    stats: [
      { kicker: 'Adapters', value: '11', sub: 'Declared interfaces', accent: 'teal' },
      { kicker: 'Failing tests', value: '1', sub: 'Needs owner', accent: 'bad' },
      { kicker: 'Events (24h)', value: '1.2k', sub: 'Synthetic volume', accent: 'progress' },
      { kicker: 'Replay queue', value: '0', sub: 'Clear', accent: 'good' },
    ],
    columns: ['Adapter', 'Direction', 'Transport', 'Owner', 'Last test', 'Status'],
    rows: [
      ['Hospital ADT', 'Inbound', 'HL7 v2', 'Integration', 'Pass', 'Healthy'],
      ['Lab results', 'Inbound', 'FHIR R4', 'Integration', 'Pass', 'Healthy'],
      ['EVV aggregator', 'Outbound', 'Alternate EVV', 'Ops', 'Fail', 'Attention'],
      ['Accounting export', 'Outbound', 'SFTP', 'Finance', 'Pass', 'Healthy'],
    ],
  },
  {
    name: 'AiGovernance', prefix: 'aig', route: '/ai-governance', navLabel: 'AI governance', domainId: 'AIG',
    title: 'AI governance', sub: 'Approved intended uses, human control, evaluation, and kill switch — Brad remains assistive only.',
    primary: 'Review proposal', secondary: 'Kill-switch drill',
    stats: [
      { kicker: 'Approved uses', value: '4', sub: 'Documented intents', accent: 'teal' },
      { kicker: 'Pending eval', value: '1', sub: 'Shadow mode', accent: 'progress' },
      { kicker: 'Overrides (7d)', value: '23', sub: 'Human edits', accent: 'neutral' },
      { kicker: 'Prohibited blocks', value: '0', sub: 'Auto-action denied', accent: 'good' },
    ],
    columns: ['Capability', 'Intended use', 'Human gate', 'Eval status', 'Kill switch', 'State'],
    rows: [
      ['Brad draft assist', 'Visit note draft', 'Required', 'Live monitor', 'Armed', 'Approved'],
      ['Med list extract', 'Proposal only', 'Required', 'Shadow', 'Armed', 'Evaluation'],
      ['OASIS suggestion', 'Not authorized', 'Hard deny', 'Blocked', 'N/A', 'Prohibited'],
    ],
  },
  {
    name: 'SecurityReliability', prefix: 'sec', route: '/security', navLabel: 'Security & reliability', domainId: 'SEC',
    title: 'Security & reliability', sub: 'Targets, observability, and incident posture — not a production SOC console.',
    primary: 'Open incident drill', secondary: 'SLO dashboard',
    stats: [
      { kicker: 'Core availability target', value: '99.9%', sub: 'Proposed baseline', accent: 'teal' },
      { kicker: 'Open vulns (high)', value: '0', sub: 'Prototype scan', accent: 'good' },
      { kicker: 'RPO target', value: '≤15m', sub: 'Proposed', accent: 'neutral' },
      { kicker: 'Incidents (30d)', value: '0', sub: 'Synthetic env', accent: 'good' },
    ],
    columns: ['Control', 'Target', 'Last proof', 'Owner', 'Gap', 'Status'],
    rows: [
      ['Backup restore drill', '≤4h RTO', 'Jun tabletop', 'Platform', 'None', 'Met'],
      ['Access review', 'Quarterly', 'Due soon', 'Security', '5 users', 'At risk'],
      ['WCAG 2.2 AA', 'AA', 'In progress', 'Product', 'Focus ring fixed', 'Improving'],
    ],
  },
  {
    name: 'Migration', prefix: 'mig', route: '/migration', navLabel: 'Migration & adoption', domainId: 'MIG',
    title: 'Migration & adoption', sub: 'WellSky export readiness, pilot cohorts, and rehearsed rollback.',
    primary: 'Open export inventory', secondary: 'Rollback drill',
    stats: [
      { kicker: 'Export domains', value: '14', sub: 'Inventoried', accent: 'teal' },
      { kicker: 'Pilot patients', value: '0', sub: 'Not authorized', accent: 'neutral' },
      { kicker: 'Rollback drills', value: '1', sub: 'Tabletop only', accent: 'progress' },
      { kicker: 'Blockers', value: '2', sub: 'Contract + export fidelity', accent: 'warn' },
    ],
    columns: ['Workstream', 'Owner', 'Evidence', 'Risk', 'Next gate', 'Status'],
    rows: [
      ['WellSky export inventory', 'Migration lead', 'Partial sample', 'High', 'Contract analysis', 'Open'],
      ['Identity mapping', 'IAM', 'Draft map', 'Medium', 'Pilot criteria', 'Draft'],
      ['Rollback drill', 'Platform', 'Tabletop notes', 'Medium', 'Live drill', 'Scheduled'],
    ],
  },
  {
    name: 'Traceability', prefix: 'trc', route: '/traceability', navLabel: 'Traceability', domainId: 'TRC',
    title: 'Semantic traceability', sub: 'Canonical IDs, workflow disposition, and development authorization gates.',
    primary: 'Open authority register', secondary: 'Gap report',
    stats: [
      { kicker: 'Canonical namespaces', value: '12', sub: 'Registered', accent: 'teal' },
      { kicker: 'Workflow IDs', value: '166', sub: 'Disposition in progress', accent: 'progress' },
      { kicker: 'Unresolved collisions', value: '0*', sub: 'Prototype claim', accent: 'good' },
      { kicker: 'Dev authorization', value: 'Blocked', sub: 'Not build authorized', accent: 'bad' },
    ],
    columns: ['Object type', 'Count', 'Owner', 'Versioned', 'Gaps', 'Status'],
    rows: [
      ['Requirements', '170 shalls', 'Product', 'Yes', '0', 'Baseline'],
      ['Workflows', '166 IDs', 'Clinical ops', 'Partial', 'Step depth', 'In review'],
      ['UI routes', '104 targets', 'UX', 'Yes', 'Many planned', 'In prototype'],
      ['Forms', '349 sources', 'Forms lead', 'Yes', 'Field schemas', 'Gate open'],
    ],
  },
]

function tsxFor(p) {
  const accentMap = { teal: 'teal', orange: 'orange', good: 'good', warn: 'warn', bad: 'bad', progress: 'progress', neutral: 'teal' }
  const statsJsx = p.stats.map((s, i) => `        <StatCard
          key={${i}}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="${s.kicker.replace(/"/g, '\\"')}"
          value="${s.value.replace(/"/g, '\\"')}"
          sub="${s.sub.replace(/"/g, '\\"')}"
          accent="${accentMap[s.accent] || 'teal'}"
        />`).join('\n')
  const head = p.columns.map(c => `<th>${c}</th>`).join('')
  const body = p.rows.map((r, ri) => {
    const cells = r.map((c, ci) => {
      if (ci === r.length - 1) {
        const tone = /overdue|escalat|fail|hold|block|reject|critical|prohibited/i.test(c) ? 'bad'
          : /risk|warn|due|near|stale|attention|draft|pending|repair/i.test(c) ? 'warn'
          : /progress|waiting|evaluation|shadow|improving|scheduled/i.test(c) ? 'progress'
          : /active|healthy|current|pass|good|closed|sealed|met|clear|on track|sustained|approved|synced|completed/i.test(c) ? 'good'
          : 'neutral'
        return `<td><StatusChip tone="${tone}">${c}</StatusChip></td>`
      }
      return `<td>${c}</td>`
    }).join('')
    return `                  <tr key={${ri}}>${cells}</tr>`
  }).join('\n')

  return `import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './${p.prefix}.css'

/** Synthetic first-pass pageview for ${p.navLabel} (${p.domainId}). Design prototype only. */
const ROWS = ${JSON.stringify(p.rows)} as const

export default function ${p.name}Screen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ROWS
    return ROWS.filter(row => row.some(cell => cell.toLowerCase().includes(q)))
  }, [query])

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain ${p.domainId} · first-pass prototype</div>
          <h1 className="screen-title">${p.title}</h1>
          <div className="screen-sub">${p.sub}</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? '${p.title}'); setDrawerOpen(true) }}>
            ${p.primary}
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="${p.prefix}-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="${p.prefix}-stats">
${statsJsx}
      </div>

      <section className="card" aria-label="${p.title} list">
        <div className="${p.prefix}-toolbar">
          <label className="${p.prefix}-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search ${p.title}</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">${p.secondary}</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="${p.prefix}-table-wrap">
            <table className="table">
              <thead>
                <tr>${head}</tr>
              </thead>
              <tbody>
${body}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? '${p.title}'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="${p.prefix}-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> ${p.navLabel}</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="${p.prefix}-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
`
}

function cssFor(p) {
  return `/* ${p.name} screen — classes prefixed .${p.prefix}- */

.${p.prefix}-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: var(--r-sm);
  background: var(--surface-brand-tint);
  color: var(--ink);
  font-size: 12.5px;
  margin-bottom: 14px;
}

.${p.prefix}-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}
@media (max-width: 1280px) {
  .${p.prefix}-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.${p.prefix}-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.${p.prefix}-search {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: min(360px, 100%);
  height: 38px;
  padding: 0 12px;
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  background: var(--surface);
  color: var(--ink-soft);
}
.${p.prefix}-search input {
  border: 0;
  outline: none;
  width: 100%;
  background: transparent;
  color: var(--ink-strong);
  font-size: 13.5px;
}

.${p.prefix}-table-wrap { overflow-x: auto; }

.${p.prefix}-drawer-copy {
  margin: 0 0 16px;
  color: var(--ink);
  font-size: 13.5px;
  line-height: 1.5;
}
.${p.prefix}-drawer-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`
}

// Write screens
const manifest = []
for (const p of PAGEVIEWS) {
  const tsxPath = path.join(SCREENS, `${p.name}Screen.tsx`)
  const cssPath = path.join(SCREENS, `${p.prefix}.css`)
  fs.writeFileSync(tsxPath, tsxFor(p))
  fs.writeFileSync(cssPath, cssFor(p))
  manifest.push({ name: p.name, prefix: p.prefix, route: p.route, navLabel: p.navLabel, domainId: p.domainId })
  console.log('wrote', p.name, p.route)
}

fs.writeFileSync(path.join(DATA, 'plannedPageviews.manifest.json'), JSON.stringify(manifest, null, 2))
console.log('manifest', manifest.length)
