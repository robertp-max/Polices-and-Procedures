import {
  AlertTriangle,
  BarChart3,
  Bot,
  BookOpen,
  CalendarClock,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  ClipboardPlus,
  FileCheck2,
  FileText,
  FolderOpen,
  History,
  PanelRightOpen,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, ToneBadge } from '../primitives';
import { type V6RouteDefinition } from '../routing/routeRegistry';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import {
  BoardLane,
  ChatThread,
  DataTable,
  MetricGrid,
  ProgressMeter,
  SurfaceCard,
  ToneTag,
  toneBarClasses,
  toneSoftTileClasses,
  toneSurfaceClasses,
  type BoardLaneData,
  type ChatMessageData,
  type DataTableColumn,
  type MetricTileData,
  type SurfaceCardData,
} from '../components';

type RouteLike = Omit<V6RouteDefinition, 'phase'>;
type BasicRow = Record<string, string>;

interface ActionRow {
  body: string;
  due: string;
  icon: LucideIcon;
  owner: string;
  progress: number;
  status: string;
  title: string;
  tone: Tone;
}

const operationsMetrics: readonly MetricTileData[] = [
  { label: 'Open work', value: '24', helper: 'Current visible queue', tone: 'teal' },
  { label: 'Risk', value: 'Low', helper: 'Policy gated and monitored', tone: 'green' },
  { label: 'Due soon', value: '6', helper: 'Next 14 calendar days', tone: 'orange' },
  { label: 'Evidence', value: '92%', helper: 'Survey-ready completeness', tone: 'teal' },
];

const dashboardMetrics: readonly MetricTileData[] = [
  { label: 'Active census', value: '128', helper: '36 recert windows open', tone: 'teal' },
  { label: 'Visits today', value: '74', helper: '6 need schedule attention', tone: 'orange' },
  { label: 'Coverage', value: '92%', helper: 'Weekend pool pending', tone: 'green' },
  { label: 'High acuity', value: '17', helper: 'CHF, wound, post-CVA', tone: 'orange' },
];

const dashboardActions: readonly ActionRow[] = [
  {
    body: 'Same-day RN backup needs owner confirmation before the SOC visit window closes.',
    due: 'Today',
    icon: ClipboardPlus,
    owner: 'Clinical Manager',
    progress: 64,
    status: 'review-required',
    title: 'Reassign SOC coverage for Elena Vargas',
    tone: 'orange',
  },
  {
    body: 'Recert review packet is ready after the plan-of-care attachment is confirmed.',
    due: 'Jun 22',
    icon: FileCheck2,
    owner: 'QAPI Nurse',
    progress: 82,
    status: 'ready',
    title: 'Close Robert Hale recert plan review',
    tone: 'teal',
  },
  {
    body: 'Weekend CHHA pool has one route without a confirmed backup assignee.',
    due: 'Jun 24',
    icon: Users,
    owner: 'Scheduler',
    progress: 48,
    status: 'blocked',
    title: 'Resolve CHHA weekend coverage gap',
    tone: 'orange',
  },
  {
    body: 'Wound photo protocol evidence is captured and waiting for compliance approval.',
    due: 'Jun 26',
    icon: Camera,
    owner: 'Compliance Officer',
    progress: 76,
    status: 'uploaded',
    title: 'Approve wound photo protocol evidence',
    tone: 'teal',
  },
];

const dashboardCards: readonly SurfaceCardData[] = [
  {
    body: 'SOC backup and weekend coverage are the highest priority service-continuity actions.',
    icon: AlertTriangle,
    progress: 64,
    status: 'review-required',
    title: 'Service continuity',
    tone: 'orange',
  },
  {
    body: 'Recert packets, medication teaching, and wound protocol evidence are trending ready.',
    icon: Stethoscope,
    progress: 82,
    status: 'ready',
    title: 'Clinical readiness',
    tone: 'teal',
  },
  {
    body: 'Credential renewal and route load remain stable with one follow-up required.',
    icon: Users,
    progress: 76,
    status: 'active',
    title: 'Staff posture',
    tone: 'teal',
  },
];

const policyMetrics: readonly MetricTileData[] = [
  { label: 'Framework Policies', value: '269', helper: 'Canonical corpus', tone: 'teal' },
  { label: 'Active', value: '269', helper: 'Published and searchable', tone: 'green' },
  { label: 'Review Cycle', value: 'Annual', helper: 'Default policy cadence', tone: 'orange' },
  { label: 'Regulatory Boards', value: '7', helper: 'Mapped sources', tone: 'teal' },
];

const policyRows: readonly BasicRow[] = [
  { id: 'GV-GB-001', title: 'Governing Body Authority & Responsibilities', owner: 'Administrator', status: 'active' },
  { id: 'GV-GB-006', title: 'Conflict of Interest Disclosure', owner: 'Governing Body', status: 'review-required' },
  { id: 'CL-SD-010', title: 'Start of Care Clinical Assessment', owner: 'DON', status: 'active' },
  { id: 'QA-QM-004', title: 'QAPI Indicator Review', owner: 'QAPI Nurse', status: 'in-review' },
  { id: 'HR-CG-021', title: 'Personnel File Completeness', owner: 'HR Credentialing', status: 'approved' },
  { id: 'RM-EM-003', title: 'Emergency Drill After-Action', owner: 'Compliance Officer', status: 'active' },
];

const tableColumns: readonly DataTableColumn<BasicRow>[] = [
  { key: 'id', label: 'Policy ID' },
  { key: 'title', label: 'Policy Title' },
  { key: 'owner', label: 'Owner Steward' },
  { key: 'status', label: 'Status', status: true },
];

const clinicianMetrics: readonly MetricTileData[] = [
  { label: 'Active clinicians', value: '42', helper: 'RN, LVN, PT, OT, MSW', tone: 'teal' },
  { label: 'Credential compliance', value: '96%', helper: '2 renewals due', tone: 'green' },
  { label: 'Open caseload', value: '184', helper: 'Bay Area service area', tone: 'blue' },
  { label: 'Training due', value: '7', helper: 'Before next field visit', tone: 'orange' },
];

const patientListMetrics: readonly MetricTileData[] = [
  { label: 'Active census', value: '128', helper: '36 recert windows open', tone: 'teal' },
  { label: 'SOC starts', value: '9', helper: 'Next 7 days', tone: 'orange' },
  { label: 'High acuity', value: '17', helper: 'CHF, wounds, post-CVA', tone: 'orange' },
  { label: 'Plan alignment', value: '94%', helper: 'Signed and current', tone: 'green' },
];

const clinicianRows: readonly BasicRow[] = [
  { id: 'CLN-2041', title: 'Maria Delgado, RN', owner: '18-patient caseload', status: 'compliant' },
  { id: 'CLN-2049', title: 'James Kwon, PT', owner: '12-patient caseload', status: 'renewal due' },
  { id: 'CLN-2055', title: 'Aisha Rahman, OT', owner: '8-patient caseload', status: 'compliant' },
  { id: 'CLN-2060', title: 'Priya Singh, RN', owner: '14-patient caseload', status: 'training due' },
  { id: 'CLN-2068', title: 'Luis Mendez, LVN', owner: 'Weekend coverage pool', status: 'compliant' },
  { id: 'CLN-2072', title: 'Nora Patel, MSW', owner: 'Discharge planning support', status: 'watch' },
];

const patientRows: readonly BasicRow[] = [
  { id: 'HH-88291', title: 'Elena Vargas', owner: 'CHF, Type 2 DM', status: 'soc active' },
  { id: 'HH-88402', title: 'Robert Hale', owner: 'Post-CVA', status: 'recert due' },
  { id: 'HH-88701', title: 'Amina Yusuf', owner: 'Diabetic wound care', status: 'active' },
  { id: 'HH-88910', title: 'George Lin', owner: 'Post-op hip', status: 'discharge prep' },
  { id: 'HH-89012', title: 'Marisol Chen', owner: 'COPD exacerbation', status: 'high acuity' },
  { id: 'HH-89104', title: 'Anthony Bell', owner: 'Medication teaching', status: 'visit gap' },
];

const profileColumns: readonly DataTableColumn<BasicRow>[] = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Name' },
  { key: 'owner', label: 'Coverage' },
  { key: 'status', label: 'Status', status: true },
];

const profileFocus = {
  clinicians: {
    bars: [
      ['Credentials', 100, 'teal'],
      ['Training', 92, 'teal'],
      ['Visit documentation', 86, 'teal'],
      ['Schedule load', 74, 'orange'],
    ],
    metrics: clinicianMetrics,
    rows: clinicianRows,
    status: 'field ready',
    subtitle: '18-patient caseload - CHF and SOC-heavy route',
    title: 'Maria Delgado, RN',
  },
  patients: {
    bars: [
      ['Care plan', 94, 'teal'],
      ['Signed orders', 78, 'orange'],
      ['Medication reconciliation', 88, 'teal'],
      ['Visit coverage', 64, 'orange'],
    ],
    metrics: patientListMetrics,
    rows: patientRows,
    status: 'needs coverage',
    subtitle: 'CHF, Type 2 DM - SOC active - RN backup pending',
    title: 'Elena Vargas',
  },
} as const;

const policyCards: readonly SurfaceCardData[] = [
  {
    body: 'The policy library keeps every framework record in one searchable corpus.',
    icon: BookOpen,
    progress: 92,
    status: 'validated',
    title: 'Canonical corpus',
    tone: 'teal',
  },
  {
    body: 'Every row exposes owner, status, and survey-facing review context.',
    icon: ShieldCheck,
    progress: 84,
    status: 'ready',
    title: 'Survey-ready context',
    tone: 'teal',
  },
  {
    body: 'Lifecycle and evidence handoffs stay visible without reusing legacy viewers.',
    icon: History,
    progress: 67,
    status: 'in-review',
    title: 'Version control',
    tone: 'orange',
  },
];

const patientMetrics: readonly MetricTileData[] = [
  { label: 'Open work', value: '24', helper: 'Current visible queue', tone: 'teal' },
  { label: 'Risk', value: 'Low', helper: 'Policy gated and monitored', tone: 'green' },
  { label: 'Due soon', value: '6', helper: 'Next 14 calendar days', tone: 'orange' },
  { label: 'Evidence', value: '92%', helper: 'Survey-ready completeness', tone: 'teal' },
];

const patientCards: readonly SurfaceCardData[] = [
  {
    body: 'SOC plan is active with CHF education, medication reconciliation, and skilled nursing cadence.',
    icon: ClipboardPlus,
    progress: 88,
    status: 'ready',
    title: 'Care plan state',
    tone: 'teal',
  },
  {
    body: 'RN backup still needs confirmation before the afternoon SOC visit window.',
    icon: CalendarClock,
    progress: 64,
    status: 'review-required',
    title: 'Coverage need',
    tone: 'orange',
  },
  {
    body: 'CHF and diabetes monitoring require medication teaching and follow-up call within 48 hours.',
    icon: Stethoscope,
    progress: 72,
    status: 'review-required',
    title: 'Clinical risk',
    tone: 'orange',
  },
];

const clinicianDetailCards: readonly SurfaceCardData[] = [
  {
    body: 'RN license, BLS, OASIS competency, and annual training are current with one renewal watch.',
    icon: ShieldCheck,
    progress: 96,
    status: 'compliant',
    title: 'Credential file',
    tone: 'green',
  },
  {
    body: '18-patient caseload with CHF and SOC-heavy route balancing weekday coverage pressure.',
    icon: Users,
    progress: 82,
    status: 'active',
    title: 'Assigned patients',
    tone: 'teal',
  },
  {
    body: 'Visit documentation is trending ready; two notes still need final QA review before lock.',
    icon: FileCheck2,
    progress: 68,
    status: 'review-required',
    title: 'Documentation',
    tone: 'orange',
  },
];

const detailRail = [
  { label: 'Version chain', status: 'ready', icon: History },
  { label: 'Linked forms', status: 'ready', icon: ClipboardList },
  { label: 'Evidence capture', status: 'review-required', icon: FolderOpen },
  { label: 'Approval history', status: 'ready', icon: ShieldCheck },
] as const;

const calendarMetrics: readonly MetricTileData[] = [
  { label: 'Events', value: '8', helper: 'June operations focus', tone: 'teal' },
  { label: 'Coverage checks', value: '3', helper: 'Two need attention', tone: 'orange' },
  { label: 'Clinical reviews', value: '4', helper: 'Chart and recert work', tone: 'green' },
  { label: 'Credential watch', value: '2', helper: 'Renewal windows', tone: 'amber' },
];

const calendarEvents = [
  { day: 2, label: 'SOC coverage review', owner: 'Clinical Manager', progress: 52, tone: 'orange' },
  { day: 4, label: 'Clinician case conference', owner: 'Director of Nursing', progress: 72, tone: 'teal' },
  { day: 7, label: 'Medication reconciliation audit', owner: 'QAPI Nurse', progress: 82, tone: 'teal' },
  { day: 11, label: 'High-acuity staffing huddle', owner: 'Scheduler', progress: 52, tone: 'orange' },
  { day: 15, label: 'Recertification window lock', owner: 'Clinical Manager', progress: 72, tone: 'orange' },
  { day: 18, label: 'Credential renewal checkpoint', owner: 'HR Credentialing', progress: 76, tone: 'orange' },
  { day: 22, label: 'Visit note timeliness review', owner: 'Compliance Officer', progress: 66, tone: 'teal' },
  { day: 26, label: 'Weekend coverage confirmation', owner: 'Operations Lead', progress: 70, tone: 'teal' },
] as const satisfies readonly { day: number; label: string; owner: string; progress: number; tone: Tone }[];

const staffingCalendarMetrics: readonly MetricTileData[] = [
  { label: 'Coverage', value: '92%', helper: 'Weekend pool pending', tone: 'green' },
  { label: 'Visit gaps', value: '6', helper: '2 high-acuity routes', tone: 'orange' },
  { label: 'Available clinicians', value: '38', helper: 'RN, LVN, PT, OT, MSW', tone: 'teal' },
  { label: 'Swaps', value: '3', helper: 'Next 7 days', tone: 'amber' },
];

const staffingCalendarEvents = [
  { day: 2, label: 'RN coverage', owner: 'Maria Delgado, RN', progress: 86, tone: 'teal' },
  { day: 4, label: 'PT visit cluster', owner: 'James Kwon, PT', progress: 70, tone: 'blue' },
  { day: 8, label: 'CHHA gap', owner: 'Scheduling Lead', progress: 42, tone: 'orange' },
  { day: 12, label: 'SOC start', owner: 'Priya Singh, RN', progress: 90, tone: 'green' },
  { day: 17, label: 'LVN swap', owner: 'Operations Lead', progress: 58, tone: 'amber' },
  { day: 19, label: 'Recert visit', owner: 'Clinical Manager', progress: 82, tone: 'teal' },
  { day: 23, label: 'Wound care route', owner: 'Aisha Rahman, OT', progress: 48, tone: 'orange' },
  { day: 28, label: 'Weekend pool', owner: 'Scheduler', progress: 74, tone: 'blue' },
] as const satisfies readonly { day: number; label: string; owner: string; progress: number; tone: Tone }[];

const cesCalendarMetrics: readonly MetricTileData[] = [
  { label: 'Sprint events', value: '12', helper: 'Evidence and review locks', tone: 'teal' },
  { label: 'Lock windows', value: '4', helper: 'Two need owner action', tone: 'orange' },
  { label: 'Reviews', value: '7', helper: 'Survey packet work', tone: 'green' },
  { label: 'Signature holds', value: '3', helper: 'Board packet timing', tone: 'amber' },
];

const cesCalendarEvents = [
  { day: 3, label: 'Evidence upload target', owner: 'Compliance Officer', progress: 62, tone: 'orange' },
  { day: 5, label: 'QAPI review', owner: 'QAPI Nurse', progress: 84, tone: 'teal' },
  { day: 9, label: 'Board minutes packet', owner: 'Administrator', progress: 48, tone: 'orange' },
  { day: 13, label: 'Workflow lock', owner: 'Systems', progress: 76, tone: 'teal' },
  { day: 16, label: 'Signature sweep', owner: 'Governing Body', progress: 58, tone: 'amber' },
  { day: 20, label: 'Audit packet export', owner: 'Compliance Officer', progress: 90, tone: 'green' },
  { day: 24, label: 'Surveyor preview', owner: 'Administrator', progress: 72, tone: 'teal' },
  { day: 27, label: 'Final lock', owner: 'Operations Lead', progress: 66, tone: 'orange' },
] as const satisfies readonly { day: number; label: string; owner: string; progress: number; tone: Tone }[];

const calendarConfigs = {
  'ces-calendar': {
    events: cesCalendarEvents,
    legend: 'Teal events are ready; orange events need owner action before packet lock.',
    metrics: cesCalendarMetrics,
    railTone: 'orange',
    railTitle: 'CES Milestones',
    title: 'June 2026',
  },
  'master-calendar': {
    events: calendarEvents,
    legend: 'Teal events are ready; orange events need owner action.',
    metrics: calendarMetrics,
    railTone: 'orange',
    railTitle: 'Upcoming Events',
    title: 'June 2026',
  },
  'staffing-calendar': {
    events: staffingCalendarEvents,
    legend: 'Staffing coverage, swaps, and high-acuity visit gaps remain visible by day.',
    metrics: staffingCalendarMetrics,
    railTone: 'orange',
    railTitle: 'Shift Gaps',
    title: 'June 2026',
  },
} as const;

const boardMetrics: readonly MetricTileData[] = [
  { label: 'Upcoming', value: '6', helper: 'Not yet opened', tone: 'slate' },
  { label: 'Ready', value: '7', helper: 'Can start now', tone: 'green' },
  { label: 'Blocked', value: '4', helper: 'Evidence/signature gaps', tone: 'orange' },
  { label: 'Certified', value: '9', helper: 'Completed and locked', tone: 'green' },
];

const boardLanes: readonly BoardLaneData[] = [
  {
    title: 'Upcoming',
    tone: 'slate',
    count: 6,
    cards: [
      {
        chips: ['Prep', 'GV-GB-001'],
        due: 'May 20',
        id: 'CEU-1201',
        owner: 'Compliance Officer',
        progress: 18,
        title: 'Validate governing body roster',
        tone: 'teal',
      },
      {
        chips: ['Documentation'],
        due: 'May 22',
        id: 'CEU-1204',
        owner: 'DON',
        progress: 24,
        title: 'Queue annual policy manual review',
        tone: 'slate',
      },
    ],
  },
  {
    title: 'Ready',
    tone: 'green',
    count: 7,
    cards: [
      {
        chips: ['Ready', 'Evidence'],
        due: 'May 24',
        id: 'CEU-1241',
        owner: 'Systems',
        progress: 88,
        title: 'Emergency drill after-action report',
        tone: 'green',
      },
      {
        chips: ['Training'],
        due: 'May 23',
        id: 'CEU-1243',
        owner: 'DON',
        progress: 72,
        title: 'HIPAA training completion sweep',
        tone: 'teal',
      },
    ],
  },
  {
    title: 'In Progress',
    tone: 'teal',
    count: 12,
    cards: [
      {
        chips: ['Review', 'QA'],
        due: 'May 19',
        id: 'CEU-1218',
        owner: 'Maria Gonzalez, RN',
        progress: 72,
        title: 'QAPI indicator data - Q2 aggregate report',
        tone: 'teal',
      },
      {
        chips: ['Clinical', 'Audit'],
        due: 'May 20',
        id: 'CEU-1220',
        owner: 'Clinical Manager',
        progress: 54,
        title: '60-day care plan recertification reviews',
        tone: 'teal',
      },
    ],
  },
  {
    title: 'Awaiting Signature',
    tone: 'amber',
    count: 5,
    cards: [
      {
        chips: ['Signature', 'GB'],
        due: 'May 21',
        id: 'CEU-1230',
        owner: 'Patricia Hale',
        progress: 62,
        title: 'Q2 Governing Body pre-read packet',
        tone: 'orange',
      },
      {
        chips: ['eCIgn'],
        due: 'May 21',
        id: 'CEU-1231',
        owner: 'Governing Body',
        progress: 68,
        title: 'Incident reporting procedure approval',
        tone: 'amber',
      },
    ],
  },
  {
    title: 'Blocked',
    tone: 'orange',
    count: 4,
    cards: [
      {
        chips: ['Evidence missing'],
        due: 'May 17',
        id: 'CEU-1232',
        owner: 'Admin Designee',
        progress: 28,
        title: 'TB screening documentation for contract clinicians',
        tone: 'orange',
      },
      {
        chips: ['SLA urgent'],
        due: 'May 16',
        id: 'CEU-1234',
        owner: 'Administrator',
        progress: 22,
        title: 'Background check results - 2 pending hires',
        tone: 'orange',
      },
    ],
  },
  {
    title: 'Completed',
    tone: 'green',
    count: 9,
    cards: [
      {
        chips: ['Certified'],
        due: 'May 8',
        id: 'CEU-1240',
        owner: 'Accounting',
        progress: 100,
        title: 'Personnel file completeness audit - Q1 new hires',
        tone: 'green',
      },
      {
        chips: ['Locked'],
        due: 'May 16',
        id: 'CEU-1242',
        owner: 'DON',
        progress: 100,
        title: 'Medication reconciliation accuracy audit',
        tone: 'green',
      },
    ],
  },
];

const evidenceMetrics: readonly MetricTileData[] = [
  { label: 'Artifacts', value: '445', helper: 'Indexed and searchable', tone: 'teal' },
  { label: 'Locked', value: '318', helper: 'Hash and certificate saved', tone: 'green' },
  { label: 'Needs upload', value: '11', helper: 'Owner action required', tone: 'orange' },
  { label: 'Retention', value: '7 yrs', helper: 'Default compliance window', tone: 'teal' },
];

const evidenceRows = [
  ['Signed policy packet', 'GV-GB-001', 'locked', 'teal'],
  ['Meeting minutes', 'GV-FM-005', 'pending upload', 'orange'],
  ['QAPI report', 'QA-QM-001', 'validated', 'teal'],
  ['Training attestation', 'EN-FM-001', 'pending', 'amber'],
  ['eCIgn certificate packet', 'GV-FM-006', 'promoted', 'green'],
  ['Survey rollup export', 'AU-2026-0618', 'uploaded', 'teal'],
] as const satisfies readonly (readonly [string, string, string, Tone])[];

const auditMetrics: readonly MetricTileData[] = [
  { label: 'Audit ready', value: '18', helper: 'Instances in view', tone: 'teal' },
  { label: 'Missing evidence', value: '2', helper: 'Requires upload', tone: 'orange' },
  { label: 'Pending approval', value: '4', helper: 'Awaiting approver', tone: 'amber' },
  { label: 'Certified locked', value: '12', helper: 'Final audit state', tone: 'green' },
];

const auditRows = [
  ['QAPI Committee Review Packet', 'QA-WF-03', 'ready to certify', 'teal'],
  ['Governing Body minutes signature', 'GV-FM-005', 'pending approval', 'orange'],
  ['TB screening contractor file', 'HR-FM-012', 'missing evidence', 'orange'],
  ['Emergency drill after-action', 'RM-WF-04', 'certified locked', 'green'],
  ['HIPAA training completion roster', 'HR-TR-101', 'ready to certify', 'teal'],
] as const satisfies readonly (readonly [string, string, string, Tone])[];

const evidenceConfigs = {
  'audit-mode': {
    description: 'Survey-facing readiness queue with missing evidence, pending approvals, and certified locked packets.',
    metrics: auditMetrics,
    rows: auditRows,
    tileTone: 'orange',
    tiles: [
      ['18', 'Ready'],
      ['2', 'Missing'],
      ['4', 'Pending'],
      ['12', 'Locked'],
    ],
    title: 'Audit health queue',
  },
  'evidence-center': {
    description: 'Every item links to policy, workflow, owner, source file, content hash, and retention state.',
    metrics: evidenceMetrics,
    rows: evidenceRows,
    tileTone: 'teal',
    tiles: [
      ['269', 'Policies'],
      ['128', 'Forms'],
      ['445', 'Evidence'],
      ['72', 'Approvals'],
    ],
    title: 'Evidence hierarchy',
  },
} as const;

const artifactMetrics: readonly MetricTileData[] = [
  { label: 'Artifact', value: 'EV-4519', helper: 'Evidence package summary', tone: 'teal' },
  { label: 'Status', value: 'Valid', helper: 'Hash verified', tone: 'green' },
  { label: 'Linked docs', value: '7', helper: 'Policies and forms', tone: 'teal' },
  { label: 'Review', value: '1 gap', helper: 'Needs approver note', tone: 'orange' },
];

const achcMetrics: readonly MetricTileData[] = [
  { label: 'Standards', value: '42', helper: 'ACHC items tracked', tone: 'teal' },
  { label: 'Mapped', value: '38', helper: 'Policy support attached', tone: 'green' },
  { label: 'Needs action', value: '4', helper: 'Evidence or owner gap', tone: 'orange' },
  { label: 'Packet state', value: '92%', helper: 'Survey-ready posture', tone: 'teal' },
];

const achcRows: readonly BasicRow[] = [
  { id: 'ACHC-HH4-1A', title: 'Governing body oversight evidence', owner: 'GV-GB-001', status: 'validated' },
  { id: 'ACHC-HH5-2B', title: 'Clinical record review cadence', owner: 'CL-SD-010', status: 'ready' },
  { id: 'ACHC-HH6-1C', title: 'QAPI performance indicators', owner: 'QA-QM-004', status: 'review-required' },
  { id: 'ACHC-HH7-3A', title: 'Personnel file completeness', owner: 'HR-CG-021', status: 'validated' },
  { id: 'ACHC-HH8-2D', title: 'Emergency drill after-action', owner: 'RM-EM-003', status: 'pending' },
];

const crosswalkRows: readonly BasicRow[] = [
  { id: '42 CFR 484.105', title: 'Organization and administration', owner: 'ACHC HH4-1A', status: 'direct' },
  { id: '42 CFR 484.55', title: 'Comprehensive assessment', owner: 'ACHC HH5-2B', status: 'partial' },
  { id: '42 CFR 484.65', title: 'QAPI program', owner: 'ACHC HH6-1C', status: 'direct' },
  { id: 'Title 22 74723', title: 'Personnel records', owner: 'ACHC HH7-3A', status: 'direct' },
  { id: 'OSHA 1910.1030', title: 'Exposure control', owner: 'ACHC HH8-2D', status: 'review-required' },
];

const achcCards: readonly SurfaceCardData[] = [
  {
    body: 'Policy support is attached for most survey standards, with owner gaps visible in the matrix.',
    icon: ShieldCheck,
    progress: 92,
    status: 'validated',
    title: 'Survey alignment',
    tone: 'teal',
  },
  {
    body: 'Open standards need updated evidence files before packet export.',
    icon: AlertTriangle,
    progress: 64,
    status: 'review-required',
    title: 'Evidence needs',
    tone: 'orange',
  },
  {
    body: 'ACHC, CMS, and Title 22 support levels are tracked without query-string view modes.',
    icon: BookOpen,
    progress: 78,
    status: 'ready',
    title: 'Regulatory crosswalk',
    tone: 'teal',
  },
];

const formFields = [
  ['Full legal name', 'Thomas Parker', 'complete'],
  ['Title / Role', 'Compliance Officer', 'complete'],
  ['Date of appointment', '2026-01-08', 'complete'],
  ['Disclosure type', 'Potential outside relationship', 'review-required'],
  ['Financial interest', 'Care vendor consulting relationship', 'review-required'],
] as const;

const bradMetrics: readonly MetricTileData[] = [
  { label: 'Risk signals', value: '3', helper: '1 high severity', tone: 'orange' },
  { label: 'Actions queued', value: '8', helper: '4 due this week', tone: 'teal' },
  { label: 'Docs generated', value: '12', helper: 'Last 30 days', tone: 'green' },
  { label: 'Confidence', value: 'High', helper: 'Grounded to policy corpus', tone: 'teal' },
];

const bradMessages: readonly ChatMessageData[] = [
  { sender: 'user', body: 'What needs attention before end of day in Primary Operations?' },
  {
    sender: 'assistant',
    body:
      'Three items: SOC backup for Elena Vargas, CHHA weekend coverage, and James Kwon credential renewal evidence. The SOC backup has the highest service-continuity risk.',
  },
  { sender: 'user', body: 'Who should own the SOC backup?' },
  {
    sender: 'assistant',
    body:
      'Assign to the Clinical Manager with Maria Delgado as primary RN. I would keep Scheduling copied because the visit is inside the same-day coverage window.',
  },
];

const bradCards: readonly SurfaceCardData[] = [
  {
    body: 'SOC backup and CHHA weekend pool are the highest priority service-continuity actions.',
    icon: AlertTriangle,
    progress: 64,
    status: 'review-required',
    title: 'Coverage risk',
    tone: 'orange',
  },
  {
    body: 'Robert Hale recert and Amina Yusuf wound evidence can close after nurse review.',
    icon: Stethoscope,
    progress: 78,
    status: 'ready',
    title: 'Clinical context',
    tone: 'teal',
  },
  {
    body: 'Assign Clinical Manager to SOC backup, keep Scheduling copied, and set a 3:00 PM checkpoint.',
    icon: Sparkles,
    progress: 82,
    status: 'ready',
    title: 'Recommended next action',
    tone: 'teal',
  },
];

const guideEntries = [
  ['Day 0 - Pre-Day-1 (Appendix F hard stop)', 'All items PASS/NA + HR Director signature before any work (HR-TA-001).'],
  ['GAO Phase (27 modules + EXAM)', 'Quizzes at 80%, EXAM with dual sign-off. 3 business days remediation window.'],
  ['ROLE + Supervised', 'Role-specific modules plus supervised visits per 42 CFR 484.80. Dual sign for skills.'],
  ['Clearance (App B)', 'DON signature for independent practice. GAO-EXAM plus visits required.'],
  ['Escalations & Remediation', 'Overdue training and competency fails trigger 60-day plans.'],
  ['Contextual User-Guide Links', 'Dashboard, Calendar, Forms, Signing, Audit, Evidence, and Master Controls.'],
] as const;

const reportMetrics: readonly MetricTileData[] = [
  { label: 'Completion', value: '18%', helper: 'Current sprint completion', tone: 'orange' },
  { label: 'Audit readiness', value: '35%', helper: 'Seeded CES posture', tone: 'orange' },
  { label: 'Active blockers', value: '4', helper: 'Evidence or signature gaps', tone: 'orange' },
  { label: 'Signature SLA', value: '1 miss', helper: 'Code-computed exception', tone: 'teal' },
];

const reportCards: readonly SurfaceCardData[] = [
  {
    body: 'Sprint 12 has 33 cards, 4 blockers, and 9 cards ready for certification.',
    icon: BarChart3,
    progress: 84,
    status: 'ready',
    title: 'Sprint readiness',
    tone: 'teal',
  },
  {
    body: 'TB screening and board minutes carry the highest survey-facing risk this week.',
    icon: AlertTriangle,
    progress: 48,
    status: 'review-required',
    title: 'Survey exposure',
    tone: 'orange',
  },
  {
    body: '18 locked artifacts were added this sprint with certificate and hash traceability.',
    icon: FolderOpen,
    progress: 91,
    status: 'validated',
    title: 'Evidence throughput',
    tone: 'teal',
  },
];

const reportBars = [18, 22, 28, 31, 38, 42, 44, 49, 52, 61];

export function RepresentativeScreen({ route }: { route: RouteLike }) {
  const [searchParams] = useSearchParams();
  const overlay = searchParams.get('v6-overlay');

  if (overlay === 'drawer-system') return <OverlaySystemScreen />;

  switch (route.hashId) {
    case 'achc-crosswalk':
      return <AchcScreen mode="crosswalk" />;
    case 'achc-survey':
      return <AchcScreen mode="survey" />;
    case 'artifact-viewer':
      return <ArtifactViewerScreen />;
    case 'audit-mode':
      return <EvidenceScreen mode="audit-mode" />;
    case 'ces-calendar':
      return <CalendarScreen mode="ces-calendar" />;
    case 'clinicians':
      return <ProfileListScreen mode="clinicians" />;
    case 'clinician-detail':
      return <ClinicianDetailScreen />;
    case 'dashboard':
      return <DashboardScreen />;
    case 'policy-library':
      return <PolicyMatrixScreen />;
    case 'patient-detail':
      return <PatientDetailScreen />;
    case 'master-calendar':
      return <CalendarScreen mode="master-calendar" />;
    case 'patients':
      return <ProfileListScreen mode="patients" />;
    case 'ces-board':
      return <BoardScreen />;
    case 'evidence-center':
      return <EvidenceScreen mode="evidence-center" />;
    case 'form-viewer':
      return <FormWorkspaceScreen />;
    case 'brad':
      return <BradScreen />;
    case 'user-guide':
      return <DocsScreen />;
    case 'ces-reports':
      return <ReportsScreen />;
    case 'staffing-calendar':
      return <CalendarScreen mode="staffing-calendar" />;
    default:
      return null;
  }
}

export function isRepresentativeRoute(route: RouteLike): boolean {
  return [
    'achc-crosswalk',
    'achc-survey',
    'artifact-viewer',
    'audit-mode',
    'ces-calendar',
    'clinicians',
    'clinician-detail',
    'dashboard',
    'policy-library',
    'patients',
    'patient-detail',
    'master-calendar',
    'staffing-calendar',
    'ces-board',
    'evidence-center',
    'form-viewer',
    'brad',
    'user-guide',
    'ces-reports',
  ].includes(route.hashId);
}

function ScreenStack({ children, metrics }: { children: ReactNode; metrics: readonly MetricTileData[] }) {
  return (
    <div className="grid gap-xl">
      <MetricGrid metrics={metrics} />
      {children}
    </div>
  );
}

function ActionList({ rows }: { rows: readonly ActionRow[] }) {
  return (
    <div className="grid gap-md">
      {rows.map((row) => {
        const Icon = row.icon;

        return (
          <article className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={row.title}>
            <div className="flex items-start gap-lg">
              <span className={cx('grid h-tap w-tap place-items-center rounded-md', toneSoftTileClasses[row.tone])}>
                <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-sm flex flex-wrap items-start justify-between gap-sm">
                  <div>
                    <h2 className="text-h3 font-light text-ink">{row.title}</h2>
                    <p className="mt-xs text-sm text-muted">{row.body}</p>
                  </div>
                  <ToneBadge size="sm" status={row.status} />
                </div>
                <div className="mb-md flex flex-wrap gap-md text-xs text-secondary">
                  <span>{row.owner}</span>
                  <span>{row.due}</span>
                </div>
                <ProgressMeter tone={row.tone} value={row.progress} />
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function DashboardScreen() {
  return (
    <ScreenStack metrics={dashboardMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-lg flex items-center justify-between gap-lg">
            <div>
              <h2 className="text-h2 font-medium text-ink">Dashboard work queue</h2>
              <p className="mt-xs text-sm text-muted">Primary operations action queue with owners and due state.</p>
            </div>
            <ToneBadge status="review-required" />
          </div>
          <ActionList rows={dashboardActions} />
        </section>
        <aside className="grid gap-lg">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h2 className="mb-lg text-h2 font-medium text-ink">Dashboard signals</h2>
            <div className="mb-lg grid gap-md tablet-p:grid-cols-2">
              {[
                ['SOC starts', '9', 'orange'],
                ['High-acuity census', '17', 'teal'],
                ['Credential watch', '2', 'orange'],
                ['Ready packets', '18', 'teal'],
              ].map(([label, value, tone]) => (
                <div className={cx('rounded-lg border p-lg', toneSurfaceClasses[tone as Tone])} key={label}>
                  <p className="text-tag uppercase tracking-tag text-ink">{label}</p>
                  <p className="mt-md text-display text-ink">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-md">
              {dashboardCards.map((card) => (
                <SurfaceCard card={card} key={card.title} />
              ))}
            </div>
          </section>
        </aside>
      </section>
    </ScreenStack>
  );
}

function ProfileListScreen({ mode }: { mode: keyof typeof profileFocus }) {
  const profile = profileFocus[mode];
  const coverageLabel = mode === 'clinicians' ? 'Coverage' : 'Clinical focus';

  return (
    <ScreenStack metrics={profile.metrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-lg">
            <h2 className="text-h2 font-medium text-ink">{mode === 'clinicians' ? 'Clinician roster' : 'Patient roster'}</h2>
            <p className="mt-xs text-sm text-muted">
              {mode === 'clinicians'
                ? 'Credential posture, caseload, coverage, and training status for active field staff.'
                : 'Clinical focus, coverage gaps, and high-risk indicators for the active census.'}
            </p>
          </div>
          <DataTable
            columns={profileColumns.map((column) => (column.key === 'owner' ? { ...column, label: coverageLabel } : column))}
            label={mode === 'clinicians' ? 'Clinician roster' : 'Patient roster'}
            rows={profile.rows}
          />
        </section>
        <aside className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-xl flex items-start justify-between gap-md">
            <div>
              <h2 className="text-h2 font-medium text-ink">{profile.title}</h2>
              <p className="mt-sm text-sm text-muted">{profile.subtitle}</p>
            </div>
            <ToneBadge size="sm" status={profile.status} />
          </div>
          <div className="grid gap-lg">
            {profile.bars.map(([label, value, tone]) => (
              <ProgressMeter key={label} label={label} tone={tone as Tone} value={value as number} />
            ))}
          </div>
          <Button className="mt-xl w-full border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange">
            Open detail
          </Button>
        </aside>
      </section>
    </ScreenStack>
  );
}

function ClinicianDetailScreen() {
  return (
    <ScreenStack metrics={clinicianMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-xl flex items-start justify-between gap-lg">
            <div>
              <ToneTag>/clinicians/:clinicianId</ToneTag>
              <h2 className="mt-lg text-h2 font-medium text-ink">Maria Delgado, RN</h2>
              <p className="mt-md text-sm text-muted">
                Credential posture, assigned patients, training status, active compliance requirements, and schedule load.
              </p>
            </div>
            <Button className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange" size="sm">
              Review file
            </Button>
          </div>
          <div className="grid gap-lg tablet-l:grid-cols-3">
            {clinicianDetailCards.map((card) => (
              <SurfaceCard card={card} key={card.title} />
            ))}
          </div>
        </section>
        <aside className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <h2 className="mb-lg text-h2 font-medium text-ink">Assigned caseload</h2>
          <DataTable
            columns={[
              { key: 'id', label: 'Patient ID' },
              { key: 'title', label: 'Patient' },
              { key: 'owner', label: 'Clinical focus' },
              { key: 'status', label: 'Status', status: true },
            ]}
            label="Assigned clinician caseload"
            rows={patientRows.slice(0, 4)}
          />
        </aside>
      </section>
    </ScreenStack>
  );
}

function PolicyMatrixScreen() {
  return (
    <ScreenStack metrics={policyMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-lg">
            <h2 className="text-h2 font-medium text-ink">Policy library matrix</h2>
            <p className="mt-xs text-sm text-muted">Canonical rows expose owner stewardship, review state, and survey posture.</p>
          </div>
          <DataTable columns={tableColumns} label="Policy library matrix" rows={policyRows} />
        </section>
        <aside className="grid gap-lg">
          {policyCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </ScreenStack>
  );
}

function PatientDetailScreen() {
  return (
    <ScreenStack metrics={patientMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-xl flex items-start justify-between gap-lg">
            <div>
              <ToneTag>/patients/:patientId</ToneTag>
              <h2 className="mt-lg text-h2 font-medium text-ink">Elena Vargas - SOC Active</h2>
              <p className="mt-md text-sm text-muted">
                Care plan, clinician assignments, documentation gaps, visit cadence, and high-risk indicators.
              </p>
            </div>
            <Button className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange" size="sm">
              Advance
            </Button>
          </div>
          <div className="grid gap-lg tablet-l:grid-cols-3">
            {patientCards.map((card) => (
              <SurfaceCard card={card} key={card.title} />
            ))}
          </div>
        </section>
        <aside className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <h2 className="mb-lg text-h2 font-medium text-ink">Right panel preview</h2>
          <div className="grid gap-md">
            {detailRail.map((item) => {
              const Icon = item.icon;

              return (
                <div className="flex items-center justify-between gap-lg rounded-lg bg-tone-slate-bg p-md" key={item.label}>
                  <span className="flex items-center gap-md text-sm text-ink">
                    <Icon aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
                    {item.label}
                  </span>
                  <ToneBadge size="sm" status={item.status} />
                </div>
              );
            })}
          </div>
        </aside>
      </section>
    </ScreenStack>
  );
}

function CalendarScreen({ mode }: { mode: keyof typeof calendarConfigs }) {
  const config = calendarConfigs[mode];
  const days = Array.from({ length: 30 }, (_, index) => index + 1);

  return (
    <ScreenStack metrics={config.metrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_320px]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-xl flex flex-wrap items-center justify-between gap-lg">
            <div className="inline-flex rounded-lg bg-tone-slate-bg p-xs">
              {['Day', 'Week', 'Month'].map((label) => (
                <button
                  className={cx(
                    'min-h-tap rounded-md px-lg text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                    label === 'Month' ? 'bg-surface text-brand-teal shadow-rest' : 'text-secondary hover:bg-surface-hover',
                  )}
                  key={label}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-md">
              {['Staff', 'Patient', 'Event Type'].map((label) => (
                <button className="min-h-tap rounded-md px-md text-sm text-secondary hover:bg-surface-hover" key={label} type="button">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-lg">
            <h2 className="text-h2 font-medium text-ink">{config.title}</h2>
            <p className="mt-xs text-sm text-muted">{config.legend}</p>
          </div>
          <div className="grid grid-cols-7 border-l border-t border-card text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div className="border-b border-r border-card p-sm text-center text-tag uppercase tracking-tag text-brand-teal" key={day}>
                {day}
              </div>
            ))}
            {days.map((day) => (
              <div className="min-h-[112px] border-b border-r border-card bg-surface p-sm" key={day}>
                <p className="mb-sm text-sm text-brand-teal">{day}</p>
                <div className="grid gap-xs">
                  {config.events
                    .filter((event) => event.day === day)
                    .map((event) => (
                      <span
                        className={cx(
                          'truncate rounded-sm px-sm py-xs text-[10px] text-on-brand',
                          event.tone === 'orange' ? 'bg-brand-orange' : 'bg-brand-teal',
                        )}
                        key={`${event.day}-${event.label}`}
                      >
                        {event.label}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-lg flex items-center justify-between gap-md">
            <h2 className="text-h2 font-medium text-ink">{config.railTitle}</h2>
            <ToneTag tone={config.railTone as Tone}>{config.events.length} active</ToneTag>
          </div>
          <div className="grid gap-md">
            {config.events.slice(0, 7).map((event) => (
              <article className="rounded-lg border border-card bg-tone-slate-bg p-md" key={`${event.day}-${event.label}`}>
                <div className="flex items-start gap-md">
                  <span className={cx('mt-xs h-[76px] w-xs rounded-sm', toneBarClasses[event.tone])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-brand-teal">Jun {event.day}</p>
                    <h3 className="mt-sm text-sm font-light text-ink">{event.label}</h3>
                    <p className="mt-xs text-xs text-muted">{event.owner}</p>
                    <ProgressMeter className="mt-md" tone={event.tone} value={event.progress} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </ScreenStack>
  );
}

function BoardScreen() {
  return (
    <ScreenStack metrics={boardMetrics}>
      <section className="grid gap-lg">
        <div className="flex flex-wrap items-center justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
          <div className="flex flex-wrap gap-sm">
            {['All work', 'Mine', 'Blocked', 'Missing evidence', 'Awaiting signature'].map((label, index) => (
              <button
                className={cx(
                  'min-h-tap rounded-md border px-md text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                  index === 0
                    ? 'border-brand-teal bg-brand-teal text-on-brand'
                    : 'border-card bg-surface text-brand-teal hover:bg-surface-hover',
                )}
                key={label}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink">Sprint 12 - 33 cards - 4 blocked</p>
        </div>
        <div className="overflow-x-auto pb-sm">
          <div className="grid min-w-[1380px] grid-cols-6 gap-lg">
            {boardLanes.map((lane) => (
              <BoardLane key={lane.title} lane={lane} />
            ))}
          </div>
        </div>
      </section>
    </ScreenStack>
  );
}

function EvidenceScreen({ mode }: { mode: keyof typeof evidenceConfigs }) {
  const config = evidenceConfigs[mode];

  return (
    <ScreenStack metrics={config.metrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <h2 className="text-h2 font-medium text-ink">{config.title}</h2>
          <p className="mt-xs text-sm text-muted">{config.description}</p>
          <div className="mt-lg grid gap-md">
            {config.rows.map(([title, ref, status, tone]) => (
              <div className="flex items-center justify-between gap-lg rounded-lg border border-card bg-tone-slate-bg p-lg" key={ref}>
                <div>
                  <h3 className="text-body font-light text-ink">{title}</h3>
                  <p className="mt-xs text-xs text-muted">{ref}</p>
                </div>
                <ToneTag tone={tone}>{status}</ToneTag>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <h2 className="mb-lg text-h2 font-medium text-ink">Audit packet</h2>
          <div className="grid gap-md tablet-p:grid-cols-2">
            {config.tiles.map(([value, label]) => (
              <div className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={label}>
                <p className={cx('text-display', config.tileTone === 'orange' ? 'text-brand-orange' : 'text-brand-teal')}>
                  {value}
                </p>
                <p className="text-tag uppercase tracking-tag text-ink">{label}</p>
              </div>
            ))}
          </div>
          <Button className="mt-lg w-full" variant="secondary">
            Generate packet
          </Button>
        </aside>
      </section>
    </ScreenStack>
  );
}

function ArtifactViewerScreen() {
  return (
    <ScreenStack metrics={artifactMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-xl flex items-start justify-between gap-lg">
            <div>
              <ToneTag>/artifacts/:artifactId</ToneTag>
              <h2 className="mt-lg text-h2 font-medium text-ink">Evidence Package Summary</h2>
              <p className="mt-md text-sm text-muted">
                Stored artifact packet with document lineage, hash status, linked policy, form instance, and audit export context.
              </p>
            </div>
            <ToneBadge size="sm" status="validated" />
          </div>
          <div className="grid gap-md">
            {[
              ['Artifact ID', 'EV-4519'],
              ['Requirement', 'GV-GB-001 / Governing Body packet'],
              ['Source', 'Signed policy packet + meeting minutes + eCIgn certificate'],
              ['Retention', '7 years from final packet lock'],
              ['Hash', 'sha256: 8d9a...f42c'],
            ].map(([label, value]) => (
              <div className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={label}>
                <p className="text-tag uppercase tracking-tag text-brand-teal">{label}</p>
                <p className="mt-sm text-body text-ink">{value}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="grid gap-lg">
          <SurfaceCard
            card={{
              body: 'Hash verification, certificate roster, and source file references are ready for survey packet inclusion.',
              icon: ShieldCheck,
              progress: 94,
              status: 'validated',
              title: 'Verification status',
              tone: 'teal',
            }}
          />
          <SurfaceCard
            card={{
              body: 'One reviewer note should be sealed before export to external surveyor packet.',
              icon: AlertTriangle,
              progress: 72,
              status: 'review-required',
              title: 'Review gap',
              tone: 'orange',
            }}
          />
          <Button variant="secondary">Download packet</Button>
        </aside>
      </section>
    </ScreenStack>
  );
}

function AchcScreen({ mode }: { mode: 'crosswalk' | 'survey' }) {
  const isCrosswalk = mode === 'crosswalk';
  const rows = isCrosswalk ? crosswalkRows : achcRows;

  return (
    <ScreenStack metrics={achcMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-lg">
            <h2 className="text-h2 font-medium text-ink">{isCrosswalk ? 'ACHC regulatory crosswalk' : 'ACHC survey checklist'}</h2>
            <p className="mt-xs text-sm text-muted">
              {isCrosswalk
                ? 'CMS, Title 22, OSHA, and ACHC support levels stay visible as a distinct route, not a query-param view.'
                : 'Policies, standards, evidence readiness, and owner action are aligned for survey review.'}
            </p>
          </div>
          <DataTable
            columns={[
              { key: 'id', label: isCrosswalk ? 'Regulation' : 'ACHC Standard' },
              { key: 'title', label: 'Requirement' },
              { key: 'owner', label: isCrosswalk ? 'ACHC Ref' : 'Policy Support' },
              { key: 'status', label: 'Support', status: true },
            ]}
            label={isCrosswalk ? 'ACHC regulatory crosswalk' : 'ACHC survey checklist'}
            rows={rows}
          />
        </section>
        <aside className="grid gap-lg">
          {achcCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </ScreenStack>
  );
}

function FormWorkspaceScreen() {
  return (
    <ScreenStack metrics={operationsMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[240px_minmax(0,3fr)_minmax(320px,2fr)]">
        <aside className="rounded-lg border border-card bg-surface p-lg shadow-rest">
          <h2 className="mb-lg text-h2 font-medium text-ink">Sections</h2>
          <div className="grid gap-sm">
            {['Identity', 'Disclosure', 'Reviewer', 'Signature', 'Audit'].map((section, index) => (
              <button
                className={cx(
                  'min-h-row rounded-md px-md text-left text-sm transition duration-fast ease-standard hover:bg-surface-hover',
                  index === 0 ? 'bg-tone-teal-bg text-brand-teal' : 'bg-tone-slate-bg text-ink',
                )}
                key={section}
                type="button"
              >
                {section}
              </button>
            ))}
          </div>
        </aside>
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-xl flex flex-wrap items-start justify-between gap-lg">
            <div>
              <ToneTag tone="orange">Interactive form</ToneTag>
              <h2 className="mt-lg text-h2 font-medium text-ink">GV-FM-006 - Conflict of Interest Disclosure</h2>
              <p className="mt-md text-sm text-muted">
                Form renderer with section states, validation, linked policy, and required signer logic.
              </p>
            </div>
            <ToneTag tone="orange">2 fields need review</ToneTag>
          </div>
          <div className="grid gap-lg">
            {formFields.map(([label, value, status]) => (
              <article className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={label}>
                <div className="mb-sm flex items-center justify-between gap-md">
                  <p className="text-tag uppercase tracking-tag text-ink">{label}</p>
                  <ToneBadge size="sm" status={status} />
                </div>
                <div className="rounded-md border border-card bg-surface px-md py-md text-sm text-secondary">{value}</div>
              </article>
            ))}
          </div>
        </section>
        <aside className="grid gap-lg">
          <SurfaceCard
            card={{
              body: 'GV-GB-001 requires all governing body disclosures before publication.',
              icon: FileText,
              progress: 92,
              status: 'ready',
              title: 'Linked policy',
              tone: 'teal',
            }}
          />
          <SurfaceCard
            card={{
              body: '5 complete fields, 2 reviewer fields, and administrator review still pending.',
              icon: ClipboardCheck,
              progress: 64,
              status: 'review-required',
              title: 'Validation summary',
              tone: 'orange',
            }}
          />
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h2 className="mb-lg text-h2 font-medium text-ink">Required signers</h2>
            <div className="grid gap-sm">
              {['Thomas Parker', 'Administrator', 'Governing Body Chair'].map((signer, index) => (
                <div className="flex items-center justify-between rounded-md bg-tone-slate-bg p-md text-sm text-ink" key={signer}>
                  {signer}
                  {index === 0 ? (
                    <CheckCircle2 aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
                  ) : (
                    <span className="h-icon-sm w-icon-sm rounded-sm border border-brand-orange" />
                  )}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </ScreenStack>
  );
}

function BradScreen() {
  return (
    <ScreenStack metrics={bradMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-lg flex items-center gap-md border-b border-hairline pb-lg">
            <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-brand-teal">
              <Bot aria-hidden="true" className="h-icon-md w-icon-md" />
            </span>
            <div>
              <h2 className="text-h2 font-medium text-ink">Brad decision thread</h2>
              <p className="text-sm text-muted">Grounded response with actions, citations, and controls.</p>
            </div>
          </div>
          <ChatThread messages={bradMessages} />
        </section>
        <aside className="grid gap-lg">
          {bradCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </ScreenStack>
  );
}

function DocsScreen() {
  return (
    <ScreenStack metrics={operationsMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(280px,1fr)_minmax(0,3fr)]">
        <aside className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <h2 className="mb-lg text-h2 font-medium text-ink">Contents</h2>
          <div className="grid gap-sm">
            {guideEntries.map(([title], index) => (
              <button
                className={cx(
                  'min-h-row rounded-md px-md text-left text-sm transition duration-fast ease-standard hover:bg-surface-hover',
                  index === 0 ? 'bg-tone-teal-bg text-brand-teal' : 'bg-tone-slate-bg text-ink',
                )}
                key={title}
                type="button"
              >
                {title}
              </button>
            ))}
          </div>
        </aside>
        <article className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <ToneTag>/journey/guide</ToneTag>
          <h2 className="mt-lg text-h2 font-medium text-ink">User Guide</h2>
          <div className="mt-xl grid gap-lg">
            {guideEntries.map(([title, body]) => (
              <section className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={title}>
                <h3 className="text-body font-light text-ink">{title}</h3>
                <p className="mt-md text-sm text-muted">{body}</p>
              </section>
            ))}
          </div>
        </article>
      </section>
    </ScreenStack>
  );
}

function ReportsScreen() {
  return (
    <ScreenStack metrics={reportMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <h2 className="text-h2 font-medium text-ink">Sprint readiness trend</h2>
          <div className="mt-xl rounded-lg bg-tone-slate-bg p-lg">
            <div className="flex h-[260px] items-end justify-around gap-lg">
              {reportBars.map((value, index) => (
                <div className="flex h-full flex-1 flex-col justify-end gap-md" key={`${value}-${index}`}>
                  <div
                    className={cx('rounded-sm', index % 3 === 0 ? 'bg-brand-orange' : 'bg-brand-teal')}
                    style={{ height: `${value + 20}%` }}
                  />
                  <span className="text-center text-xs text-brand-teal">S{index + 3}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="grid gap-lg">
          {reportCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </ScreenStack>
  );
}

function OverlaySystemScreen() {
  return (
    <ScreenStack
      metrics={[
        { label: 'Drawer depth', value: '1-2', helper: 'Event/task/evidence/form/audit layers', tone: 'teal' },
        { label: 'Responsive', value: 'Right/Bottom', helper: 'md breakpoint', tone: 'orange' },
      ]}
    >
      <section className="grid gap-xl">
        <div className="grid gap-xl desktop:grid-cols-2">
          <OverlayPanel
            icon={ClipboardCheck}
            subtitle="Blocking policy or evidence decision with one orange primary action and a quiet secondary action."
            title="Centered Review Modal"
          >
            <div className="rounded-lg border border-card bg-tone-slate-bg p-xl">
              <div className="mx-auto max-w-[450px] rounded-lg border border-card bg-surface p-xl shadow-hover">
                <div className="mb-lg flex items-start justify-between">
                  <ToneTag tone="orange">Review required</ToneTag>
                  <button className="rounded-sm px-sm text-brand-teal hover:bg-surface-hover" type="button">
                    x
                  </button>
                </div>
                <h2 className="text-h2 font-medium text-ink">Publish control exception</h2>
                <p className="mt-md text-sm text-muted">
                  GV-GB-001 is ready, but one linked disclosure has not been sealed. Confirm override or return to evidence collection.
                </p>
                <div className="mt-xl grid gap-md tablet-p:grid-cols-2">
                  <div className="rounded-md bg-tone-teal-bg p-lg">
                    <p className="text-tag uppercase tracking-tag text-brand-teal">Policy</p>
                    <p className="mt-sm text-ink">GV-GB-001</p>
                  </div>
                  <div className="rounded-md bg-tone-orange-bg p-lg">
                    <p className="text-tag uppercase tracking-tag text-brand-orange">Missing</p>
                    <p className="mt-sm text-ink">GV-FM-006</p>
                  </div>
                </div>
                <div className="mt-xl flex justify-end gap-md">
                  <Button variant="secondary">Return</Button>
                  <Button className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange">
                    Request override
                  </Button>
                </div>
              </div>
            </div>
          </OverlayPanel>
          <OverlayPanel
            icon={AlertTriangle}
            subtitle="Compact irreversible action prompt with semantic orange warning treatment."
            title="Confirmation Dialog"
          >
            <div className="rounded-lg border border-tone-orange-border bg-tone-orange-bg p-xl">
              <div className="rounded-lg bg-surface p-xl shadow-rest">
                <ToneTag tone="orange">Confirm action</ToneTag>
                <h2 className="mt-lg text-h2 font-medium text-ink">Close evidence gap?</h2>
                <p className="mt-md text-sm text-muted">This will mark the packet complete and notify the assigned reviewer.</p>
                <div className="mt-xl grid gap-md tablet-p:grid-cols-2">
                  <Button className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange">Close gap</Button>
                  <Button variant="secondary">Cancel</Button>
                </div>
              </div>
            </div>
          </OverlayPanel>
        </div>
        <div className="grid gap-xl desktop:grid-cols-3">
          <OverlayPanel icon={PanelRightOpen} subtitle="Dense task detail panel with status, owner, evidence, and next action." title="Right Drawer">
            <div className="ml-auto max-w-[410px] rounded-lg border border-card bg-surface p-xl shadow-hover">
              <div className="mb-lg flex items-center justify-between">
                <ToneTag>Task drawer</ToneTag>
                <span className="text-muted">x</span>
              </div>
              <h2 className="text-h2 font-medium text-ink">QAPI minutes packet</h2>
              <div className="mt-lg grid gap-sm">
                {['Owner: Compliance Officer', 'Evidence: 3 files', 'Next: Send for signature'].map((item) => (
                  <div className="flex items-center justify-between rounded-md bg-tone-slate-bg p-md text-sm text-ink" key={item}>
                    {item}
                    <CheckCircle2 aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
                  </div>
                ))}
              </div>
            </div>
          </OverlayPanel>
          <OverlayPanel icon={Upload} subtitle="Mobile-first action sheet for field evidence capture and signature steps." title="Bottom Sheet">
            <div className="rounded-2xl border border-card bg-tone-slate-bg p-lg">
              <div className="mx-auto mb-md h-xs w-[52px] rounded-sm bg-disabled" />
              <div className="rounded-lg bg-surface p-lg shadow-rest">
                <ToneTag>Field action</ToneTag>
                <h2 className="mt-md text-h2 font-medium text-ink">Capture wound photo</h2>
                <p className="mt-sm text-sm text-muted">Attach image, select visit, and submit to the audit packet.</p>
              </div>
            </div>
          </OverlayPanel>
          <OverlayPanel icon={FileText} subtitle="Anchored menu with low-noise surface, teal active state, and orange intervention action." title="Popover and Inline Menu">
            <div className="rounded-lg border border-card bg-tone-slate-bg p-xl">
              <Button>Evidence actions</Button>
              <div className="mt-md rounded-lg border border-card bg-surface p-md shadow-rest">
                {['Open source file', 'Attach packet', 'Request override'].map((item, index) => (
                  <div
                    className={cx('rounded-md p-md text-sm', index === 2 ? 'text-brand-orange' : 'text-brand-teal')}
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </OverlayPanel>
        </div>
      </section>
    </ScreenStack>
  );
}

function OverlayPanel({
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
      <div className="mb-lg flex items-start gap-md">
        <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-brand-teal">
          <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
        </span>
        <div>
          <h2 className="text-h2 font-medium text-ink">{title}</h2>
          <p className="mt-xs text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
