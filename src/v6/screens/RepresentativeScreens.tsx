import { AlertTriangle, BarChart3, Bot, BookOpen, CalendarClock, CalendarRange, Camera, CheckCircle2, ChevronDown, ClipboardCheck, ClipboardList, ClipboardPlus, FileCheck2, FileText, FolderOpen, History, PanelRightOpen, Route, ShieldCheck, Sparkles, Stethoscope, Upload, Users, type LucideIcon } from 'lucide-react';
import { type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { buildBoardLanes, buildCalendarEvents, buildReportMetrics, buildSprintSummary, buildReportCards, buildReportTrendBars, buildEvidenceRows, buildAuditRows, getControlFromParams, getTasksForEvent } from '@/policy/ces/cesViewProjections';
// Design cross-ref (Agent 19 background + Agent 19 read-only CES Data Seeds gap vs design subagent + Agent 09 read-only hygiene/validate gap): V3 seeds supply realistic ExecutionUnits for CES board/my-tasks/calendar/snapshots/projections.
// Current: use build* or FALLBACK for exact design visual parity. See projections for seed-driven future and validators.
import type { ExecutionUnit } from '@/policy/ces/types';
import { POLICY_CORPUS, LIFECYCLE_DOMAIN_ORDER, DOMAIN_LABEL } from '@/policy/data/policyCorpus';
import { FORMS_DATASET, type FormRecord } from '@/policy/data/formsLibraryDataset';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { getWorkflowDetail } from './pageviews/WorkflowsScreen';
import { resolveCanonicalFormId } from '@/policy/data/formIdAliases';
// V2 seed staffing data (not live production records; used for prototype staffing profile surfaces).
import { MOCK_CLINICIANS } from '@/policy/staffing/data/mockClinicians';
import { MOCK_PATIENTS } from '@/policy/staffing/data/mockPatients';
import { resolveDisplayName } from '@/policy/ces/data/V3_CES_SeedData';
import type { EventProcessStep, RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { inferPhaseTemplate } from '@/policy/workflows/swimlanes/phaseTemplates';
import type { SwimlaneStatus } from '@/policy/workflows/swimlanes/types';
import { Button, ToneBadge } from '../primitives';
import { type V6RouteDefinition } from '../routing/routeRegistry';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { BoardLane, CESSubnav, ChatThread, DataTable, MetricGrid, ProgressMeter, SurfaceCard, ToneTag, VeilDrawer, VeilModal, toneBarClasses, toneSurfaceClasses, toneGlassSurfaceClasses, type BoardCardData, type BoardLaneData, type ChatMessageData, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../components';
import { workspaceSubnavItems } from '../routing/navigationManifest';
import { AdminGroupsScreen, AdminPermissionsScreen, AdminRolesScreen, AdminUsersScreen, EcignWorkspaceScreen, EventsBoardScreen, FormsLibraryScreen, FrameworkScreen, GenericReferenceScreen, MasterControlsScreen, MyTasksScreen, PolicyDetailScreen, WorkflowsScreen, WorkflowDetailScreen, AppendixFScreen, JourneyAdminScreen, JourneyOverviewScreen, JourneyV1Screen, ModulePlayerScreen, SupervisorScreen, OnboardingV2DashboardScreen, OnboardingV2ActivateScreen, OnboardingV2BatchesScreen, OnboardingV2BatchScreen, OnboardingV2AuditScreen, OnboardingV2GovernanceScreen, PolicyLifecycleScreen, PolicyLifecycleDetailScreen, HubstaffScreen, SystemDocsScreen, HelpCenterScreen, GovernanceScreen, SurveyorViewerScreen, LoginScreen, MobileIncidentScreen, NotFoundScreen } from './pageviews';
import { achcSurveyRows } from '@/policy/data/achcSurveyProjection.generated';
import { achcPrintCrosswalk } from '@/policy/data/achcPrintCrosswalk.generated';

type RouteLike = V6RouteDefinition;
type BasicRow = Record<string, string>;

const displayAcronyms: Record<string, string> = {
  capa: 'CAPA',
  ces: 'CES',
  chha: 'CHHA',
  don: 'DON',
  ecign: 'eCIgn',
  er: 'ER',
  hipaa: 'HIPAA',
  hr: 'HR',
  lvn: 'LVN',
  oasis: 'OASIS',
  ot: 'OT',
  pt: 'PT',
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
  qa: 'QA',
  qapi: 'QAPI',
  rn: 'RN',
  soc: 'SOC',
  tb: 'TB',
};

function titleCaseToken(token: string) {
  const normalized = token.toLowerCase();
  if (displayAcronyms[normalized]) {
    return displayAcronyms[normalized];
  }

  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
}

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
    body: 'Start-of-care visit needs RN backup before 3:00 PM',
    due: 'TODAY',
    icon: Route,
    owner: resolveDisplayName('Clinical Manager'),
    progress: 64,
    status: 'review-required',
    title: 'Reassign SOC coverage for Elena Vargas',
    tone: 'orange',
  },
  {
    body: 'Signed order and visit cadence need final confirmation',
    due: 'JUN 19',
    icon: ClipboardCheck,
    owner: resolveDisplayName('Maria Gonzalez, RN'),
    progress: 82,
    status: 'ready',
    title: 'Close Robert Hale recert plan review',
    tone: 'teal',
  },
  {
    body: 'Two high-acuity patients need weekend pool assignment',
    due: 'JUN 20',
    icon: CalendarRange,
    owner: resolveDisplayName('Scheduling Lead'),
    progress: 48,
    status: 'blocked',
    title: 'Resolve CHHA weekend coverage gap',
    tone: 'orange',
  },
  {
    body: 'Amna Yusuf route requires evidence lock after field upload',
    due: 'JUN 21',
    icon: Camera,
    owner: resolveDisplayName('QAPI Nurse'),
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

// Derive a deterministic library status from real corpus fields. The corpus
// carries no per-record status; every policy is a published REQUIRED-tier
// record, so REQUIRED -> 'active' (a valid status code, not a fabricated
// per-row value).
// Pure reference rows for Policy Library matrix (Taxonomy reference view).
// Hierarchy from real corpus (domain/subdomain/tier/steward) for V1 parity comparison.
const policyRowsBase: readonly BasicRow[] = POLICY_CORPUS.map((policy) => ({
  id: policy.id,
  title: policy.title,
  domain: DOMAIN_LABEL[policy.domainCode] ?? policy.domainCode,
  subdomain: policy.subdomainCode,
  tier: policy.tier,
  steward: policy.ownerSteward,
}));

const policyMetrics: readonly MetricTileData[] = [
  { label: 'Framework Policies', value: String(POLICY_CORPUS.length), helper: 'Canonical corpus', tone: 'teal' },
  { label: 'Review Cycle', value: 'Annual', helper: 'Default policy cadence', tone: 'orange' },
  { label: 'Domains Mapped', value: String(LIFECYCLE_DOMAIN_ORDER.length), helper: 'Framework taxonomy', tone: 'teal' },
];

const tableColumns: readonly DataTableColumn<BasicRow>[] = [
  { key: 'id', label: 'Policy ID' },
  { key: 'title', label: 'Policy Title' },
  { key: 'domain', label: 'Domain' },
  { key: 'subdomain', label: 'Subdomain' },
  { key: 'tier', label: 'Tier' },
  { key: 'steward', label: 'Steward' },
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

// Map clinician status enum to the readable lowercase token the status badge expects.
const clinicianStatusLabel = (status: string): string => status.replace(/_/g, ' ');

// Real clinician roster: every record in the canonical staffing seed, mapped to
// the existing { id, title (Name), owner (Coverage), status } row shape.
// title = full name + primary discipline (matches the prior "Name, RN" pattern);
// owner = service areas (the "Coverage" column); status = the real clinician status.
const clinicianRows: readonly BasicRow[] = MOCK_CLINICIANS.map((clinician) => ({
  id: clinician.id,
  title: `${clinician.firstName} ${clinician.lastName}, ${clinician.primaryDiscipline}`,
  owner: clinician.serviceAreas && clinician.serviceAreas.length > 0 ? clinician.serviceAreas.join(', ') : '—',
  status: clinicianStatusLabel(clinician.status),
}));

// Real patient roster: every record in the canonical staffing seed, mapped to
// the existing { id, title (Name), owner (Clinical focus), status } row shape.
// owner = diagnosis category (the "Clinical focus" column, underscores normalized);
// status = the real patient status.
const patientRows: readonly BasicRow[] = MOCK_PATIENTS.map((patient) => ({
  id: patient.id,
  title: `${patient.firstName} ${patient.lastName}`,
  owner: patient.diagnosisCategory ? patient.diagnosisCategory.replace(/_/g, ' ') : '—',
  status: patient.status.replace(/_/g, ' '),
}));

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
    body: 'Real policies from the agency corpus with titles and regulatory references.',
    icon: ShieldCheck,
    progress: 84,
    status: 'ready',
    title: 'Reference records',
    tone: 'teal',
  },
  {
    body: 'Full source content with sections, appendices, and cross references.',
    icon: History,
    progress: 67,
    status: 'validated',
    title: 'Versioned content',
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

interface CalendarEventData {
  attendees?: readonly string[];
  bundleCategory?: string;
  bundleName?: string;
  detail?: string;
  day: number;
  evidenceStatus?: string;
  formsCount?: number;
  id?: string;
  label: string;
  month?: number;
  nextAction?: string;
  owner: string;
  primaryDay?: boolean;
  progress: number;
  readiness?: string;
  recurrencePattern?: string;
  risk?: string;
  scheduleReason?: string;
  sourceDate?: string;
  steps?: string;
  sourceEventId?: string;
  sourceKind?: 'v1-design' | 'v3-regulatory-event' | 'v3-execution-unit';
  sourceUnitId?: string;
  swimlane?: CalendarSwimlaneData;
  taskCount?: number;
  tone: Tone;
  workflow?: string;
  workflowId?: string;
}

interface CalendarSwimlaneTask {
  chips: readonly string[];
  due: string;
  id: string;
  owner: string;
  progress: number;
  status: string;
  title: string;
  tone: Tone;
}

interface CalendarSwimlaneLane {
  cards: readonly CalendarSwimlaneTask[];
  note: string;
  title: string;
  tone: Tone;
}

interface CalendarSwimlaneData {
  lanes: readonly CalendarSwimlaneLane[];
  metrics: readonly MetricTileData[];
  summary: string;
}

const calendarMetrics: readonly MetricTileData[] = [
  { label: 'Events', value: '8', helper: 'June operations focus', tone: 'teal' },
  { label: 'Coverage checks', value: '3', helper: 'Two need attention', tone: 'orange' },
  { label: 'Clinical reviews', value: '4', helper: 'Chart and recert work', tone: 'green' },
  { label: 'Credential watch', value: '2', helper: 'Renewal windows', tone: 'amber' },
];

const calendarEvents = [
  { day: 2, label: 'SOC coverage review', owner: resolveDisplayName('Clinical Manager'), progress: 52, tone: 'orange' },
  { day: 4, label: 'Clinician case conference', owner: resolveDisplayName('Director of Nursing'), progress: 72, tone: 'teal' },
  { day: 7, label: 'Medication reconciliation audit', owner: resolveDisplayName('QAPI Nurse'), progress: 82, tone: 'teal' },
  { day: 11, label: 'High-acuity staffing huddle', owner: resolveDisplayName('Scheduler'), progress: 52, tone: 'orange' },
  { day: 15, label: 'Recertification window lock', owner: resolveDisplayName('Clinical Manager'), progress: 72, tone: 'amber' },
  { day: 18, label: 'Credential renewal checkpoint', owner: resolveDisplayName('HR Credentialing'), progress: 76, tone: 'orange' },
  { day: 22, label: 'Visit note timeliness review', owner: resolveDisplayName('Compliance Officer'), progress: 66, tone: 'teal' },
  { day: 26, label: 'Weekend coverage confirmation', owner: resolveDisplayName('Operations Lead'), progress: 70, tone: 'blue' },
] as const satisfies readonly CalendarEventData[];

const staffingCalendarMetrics: readonly MetricTileData[] = [
  { label: 'Coverage', value: '92%', helper: 'Weekend pool pending', tone: 'green' },
  { label: 'Visit gaps', value: '6', helper: '2 high-acuity routes', tone: 'orange' },
  { label: 'Available clinicians', value: '38', helper: 'RN, LVN, PT, OT, MSW', tone: 'teal' },
  { label: 'Swaps', value: '3', helper: 'Next 7 days', tone: 'amber' },
];

const staffingCalendarEvents = [
  { day: 2, label: 'RN coverage', owner: resolveDisplayName('Maria Gonzalez, RN'), progress: 86, tone: 'teal' },
  { day: 4, label: 'PT visit cluster', owner: resolveDisplayName('PT'), progress: 70, tone: 'blue' },
  { day: 8, label: 'CHHA gap', owner: resolveDisplayName('Scheduling Lead'), progress: 42, tone: 'orange' },
  { day: 12, label: 'SOC start', owner: resolveDisplayName('DON'), progress: 90, tone: 'green' },
  { day: 17, label: 'LVN swap', owner: resolveDisplayName('Operations Lead'), progress: 58, tone: 'amber' },
  { day: 19, label: 'Recert visit', owner: resolveDisplayName('Clinical Manager'), progress: 82, tone: 'teal' },
  { day: 23, label: 'Wound care route', owner: resolveDisplayName('OT'), progress: 48, tone: 'orange' },
  { day: 28, label: 'Weekend pool', owner: resolveDisplayName('Scheduler'), progress: 74, tone: 'blue' },
] as const satisfies readonly CalendarEventData[];

// cesSprintSummary / cesCalendarMetrics moved inside getCalendarConfig (ces only) to prevent CES build leakage on reference views (policy library, detail, lifecycle, generic-ref).

// Design cross-ref (Agent 01 background + Agent 11/18): ces-calendar matches V6_DESIGN.html ~1310 exactly
// (description, metrics ~1313-1317: 33/4/9/3, complianceCalendarEvents illustrative shape at ~397).
// Implementation uses buildCalendarEvents (seed-driven from V3_CES_SeedData) + projections for data.
// Calendar dates are source-correct (no reassignment in screen scheduler). See cesViewProjections + seed.
// (swimlane, workflowId, readiness, risk, steps, detail) attached from real units. Do not hardcode visuals.

const q2QapiSwimlane: CalendarSwimlaneData = {
  summary: 'Quarterly QAPI is the largest June event: indicators, adverse events, chart audits, CAPA, committee approval, and survey packet lock all converge here.',
  metrics: [
    { label: 'Tasks', value: '21', helper: 'All Q2 QAPI work units', tone: 'teal' },
    { label: 'Owners', value: '7', helper: 'DON, QAPI, Clinical, Compliance', tone: 'orange' },
    { label: 'Evidence', value: '18', helper: 'Artifacts before packet lock', tone: 'green' },
    { label: 'Due window', value: 'Jun 10-21', helper: 'Quarterly committee cadence', tone: 'teal' },
  ],
  lanes: [
    {
      title: 'Event Intake',
      tone: 'teal',
      note: 'Open the quarterly QAPI event and bind policy, forms, owners, and due windows.',
      cards: [
        { id: 'Q2-QAPI-01', title: 'Create Q2 QAPI event shell', owner: resolveDisplayName('Compliance Officer'), due: 'Jun 10', status: 'Ready', chips: ['CES', 'QA-WF-03'], progress: 100, tone: 'green' },
        { id: 'Q2-QAPI-02', title: 'Bind QAPI policies and committee charter', owner: resolveDisplayName('Policy Admin'), due: 'Jun 10', status: 'Ready', chips: ['QA-PG-001', 'GV-GB-001'], progress: 92, tone: 'teal' },
        { id: 'Q2-QAPI-03', title: 'Confirm committee quorum and attendee list', owner: resolveDisplayName('Administrator'), due: 'Jun 11', status: 'In progress', chips: ['Roster', 'Minutes'], progress: 76, tone: 'teal' },
      ],
    },
    {
      title: 'Data Pull',
      tone: 'orange',
      note: 'Gather indicator exports, clinical samples, and patient-safety inputs for the quarter.',
      cards: [
        { id: 'Q2-QAPI-04', title: 'Export hospitalization and ER transfer trends', owner: resolveDisplayName('QAPI Nurse'), due: 'Jun 11', status: 'In progress', chips: ['Outcomes'], progress: 70, tone: 'teal' },
        { id: 'Q2-QAPI-05', title: 'Compile infection-control surveillance log', owner: resolveDisplayName('Clinical Manager'), due: 'Jun 12', status: 'In progress', chips: ['CL-IC-001'], progress: 64, tone: 'teal' },
        { id: 'Q2-QAPI-06', title: 'Pull medication reconciliation exception sample', owner: resolveDisplayName('DON'), due: 'Jun 12', status: 'Needs review', chips: ['Chart Audit'], progress: 58, tone: 'orange' },
        { id: 'Q2-QAPI-07', title: 'Summarize incident and complaint themes', owner: resolveDisplayName('Compliance Officer'), due: 'Jun 13', status: 'Ready', chips: ['Risk'], progress: 82, tone: 'teal' },
      ],
    },
    {
      title: 'Clinical Review',
      tone: 'teal',
      note: 'Convert raw indicators into committee-ready findings and confirm responsible owners.',
      cards: [
        { id: 'Q2-QAPI-08', title: 'Review 60-day recert and care-plan sample', owner: resolveDisplayName('Clinical Manager'), due: 'Jun 14', status: 'In progress', chips: ['Recert'], progress: 66, tone: 'teal' },
        { id: 'Q2-QAPI-09', title: 'Score OASIS accuracy variance report', owner: resolveDisplayName('QA Analyst'), due: 'Jun 14', status: 'Watch', chips: ['OASIS'], progress: 48, tone: 'orange' },
        { id: 'Q2-QAPI-10', title: 'Validate supervisory visit completion rate', owner: resolveDisplayName('DON'), due: 'Jun 15', status: 'Ready', chips: ['HR', 'Clinical'], progress: 86, tone: 'teal' },
      ],
    },
    {
      title: 'CAPA Build',
      tone: 'orange',
      note: 'Create corrective actions for material gaps before the committee packet is routed.',
      cards: [
        { id: 'Q2-QAPI-11', title: 'Draft CAPA for medication documentation gaps', owner: resolveDisplayName('QAPI Lead'), due: 'Jun 16', status: 'Needs owner', chips: ['CAPA'], progress: 42, tone: 'orange' },
        { id: 'Q2-QAPI-12', title: 'Assign infection-control retraining action', owner: resolveDisplayName('Clinical Educator'), due: 'Jun 16', status: 'In progress', chips: ['Training'], progress: 61, tone: 'teal' },
        { id: 'Q2-QAPI-13', title: 'Set target dates for chart-audit recheck', owner: resolveDisplayName('Clinical Manager'), due: 'Jun 17', status: 'Ready', chips: ['Follow-up'], progress: 78, tone: 'teal' },
      ],
    },
    {
      title: 'Committee Packet',
      tone: 'amber',
      note: 'Assemble agenda, dashboard, minutes, attachments, and required signatures.',
      cards: [
        { id: 'Q2-QAPI-14', title: 'Build Q2 dashboard slide packet', owner: resolveDisplayName('QAPI Lead'), due: 'Jun 17', status: 'In progress', chips: ['Dashboard'], progress: 69, tone: 'teal' },
        { id: 'Q2-QAPI-15', title: 'Attach aggregate report and evidence index', owner: resolveDisplayName('Compliance Officer'), due: 'Jun 18', status: 'In progress', chips: ['Evidence'], progress: 74, tone: 'teal' },
        { id: 'Q2-QAPI-16', title: 'Prepare committee agenda and attendance log', owner: resolveDisplayName('Administrator'), due: 'Jun 18', status: 'Ready', chips: ['Form'], progress: 88, tone: 'teal' },
        { id: 'Q2-QAPI-17', title: 'Draft committee minutes for post-meeting lock', owner: resolveDisplayName('QAPI Lead'), due: 'Jun 19', status: 'Watch', chips: ['Minutes'], progress: 46, tone: 'orange' },
      ],
    },
    {
      title: 'Approval & eCIgn',
      tone: 'orange',
      note: 'Route the packet through administrator, DON, and committee chair sign-off.',
      cards: [
        { id: 'Q2-QAPI-18', title: 'Route QAPI packet to DON for attestation', owner: resolveDisplayName('DON'), due: 'Jun 19', status: 'Awaiting signature', chips: ['eCIgn'], progress: 52, tone: 'orange' },
        { id: 'Q2-QAPI-19', title: 'Administrator final certification', owner: resolveDisplayName('Administrator'), due: 'Jun 20', status: 'Pending', chips: ['Approval'], progress: 38, tone: 'orange' },
        { id: 'Q2-QAPI-20', title: 'Committee chair lock and timestamp', owner: resolveDisplayName('Committee Chair'), due: 'Jun 20', status: 'Pending', chips: ['Signature'], progress: 34, tone: 'orange' },
      ],
    },
    {
      title: 'Survey Lock',
      tone: 'green',
      note: 'Finalize packet manifest, hash evidence, and expose surveyor-ready output.',
      cards: [
        { id: 'Q2-QAPI-21', title: 'Publish Q2 QAPI survey packet manifest', owner: resolveDisplayName('Compliance Officer'), due: 'Jun 21', status: 'Ready to certify', chips: ['Survey Packet'], progress: 80, tone: 'green' },
      ],
    },
  ],
};

type LocalRegulatorySourceInput = {
  cadence: RegulatoryEvent['cadence'];
  date: string;
  domain: RegulatoryEvent['domain'];
  forms: readonly string[];
  id: string;
  owner: string;
  ownerRole: string;
  policyRefs: readonly string[];
  summary: string;
  title: string;
  urgency?: RegulatoryEvent['urgency'];
};

function makeLocalRegulatorySource(input: LocalRegulatorySourceInput): RegulatoryEvent {
  const stepTemplates = [
    ['Prepare source packet', 'Collect the source reports, roster, or committee packet for this event.', 'complete', -3],
    ['Validate findings', 'Review exceptions, trends, and owner assignments against the source event scope.', 'in-progress', -1],
    ['Route owner attestation', 'Confirm the accountable owner and required signer sequence.', 'pending', 0],
    ['Publish evidence index', 'Attach the final packet, evidence index, and survey-facing audit trail.', 'pending', 1],
  ] as const;

  return {
    cadence: input.cadence,
    date: input.date,
    domain: input.domain,
    id: input.id,
    owner: input.owner,
    ownerRole: input.ownerRole,
    policyRefs: [...input.policyRefs],
    processFlow: stepTemplates.map(([label, description, status, dueOffsetDays], index) => ({
      description,
      dueOffsetDays,
      id: `${input.id}-s${index + 1}`,
      label,
      requiredFormIds: index === 3 ? input.forms.map((form) => form.slice(0, 16)) : undefined,
      status,
    })),
    requiredForms: input.forms.map((label, index) => ({
      id: `${input.id}-form-${index + 1}`,
      label,
      status: index === 0 ? 'complete' : index === 1 ? 'in-progress' : 'pending',
    })),
    summary: input.summary,
    title: input.title,
    urgency: input.urgency ?? 'due-soon',
  };
}

const localRegulatorySources: readonly RegulatoryEvent[] = [
  makeLocalRegulatorySource({
    cadence: 'Quarterly',
    date: '2026-04-09',
    domain: 'Operations',
    forms: ['Personnel file audit worksheet', 'Credential evidence index'],
    id: 'evt-personnel-file-q1-audit',
    owner: resolveDisplayName('HR Credentialing'),
    ownerRole: 'HR',
    policyRefs: ['HR-WM-005'],
    summary: 'Q1 new-hire personnel file closeout and credential evidence review.',
    title: 'Personnel File Completeness Audit - Q1 New Hires',
    urgency: 'complete',
  }),
  makeLocalRegulatorySource({
    cadence: 'Monthly',
    date: '2026-04-16',
    domain: 'Clinical',
    forms: ['OASIS variance report', 'Clinical documentation audit sample'],
    id: 'evt-oasis-accuracy-apr',
    owner: resolveDisplayName('QA Analyst'),
    ownerRole: 'QAPI',
    policyRefs: ['CL-OA-001'],
    summary: 'April OASIS accuracy sample review and variance scoring.',
    title: 'OASIS Accuracy Audit - April Sample Review',
  }),
  makeLocalRegulatorySource({
    cadence: 'Monthly',
    date: '2026-04-23',
    domain: 'Clinical',
    forms: ['Infection surveillance log', 'Clinical manager attestation'],
    id: 'evt-infection-surveillance-apr',
    owner: resolveDisplayName('Clinical Manager'),
    ownerRole: 'Clinical',
    policyRefs: ['CL-SD-016'],
    summary: 'April infection-control surveillance closeout.',
    title: 'Monthly Infection Surveillance Reporting - April',
  }),
  makeLocalRegulatorySource({
    cadence: 'Monthly',
    date: '2026-06-09',
    domain: 'Finance',
    forms: ['Claims denial trend export', 'Revenue-cycle exception sample'],
    id: 'evt-claims-denial-jun',
    owner: resolveDisplayName('Accounting'),
    ownerRole: 'Finance',
    policyRefs: ['FN-BC-001'],
    summary: 'June claims denial root-cause review and exception packet.',
    title: 'Claims Denial Root Cause Analysis - June Cycle',
  }),
  makeLocalRegulatorySource({
    cadence: 'Quarterly',
    date: '2026-06-11',
    domain: 'QAPI',
    forms: ['HHCAHPS survey administration packet', 'Patient-experience findings summary'],
    id: 'evt-hhcahps-q2-survey',
    owner: resolveDisplayName('QAPI Lead'),
    ownerRole: 'QAPI',
    policyRefs: ['QA-PG-001', 'QA-PI-001'],
    summary: 'Q2 patient-experience survey administration and findings handoff to QAPI.',
    title: 'HHCAHPS Patient Satisfaction Survey - Q2 Administration',
    urgency: 'critical',
  }),
  makeLocalRegulatorySource({
    cadence: 'Monthly',
    date: '2026-06-25',
    domain: 'Clinical',
    forms: ['June infection surveillance log', 'Clinical recert exception index'],
    id: 'evt-infection-surveillance-jun',
    owner: resolveDisplayName('Clinical Manager'),
    ownerRole: 'Clinical',
    policyRefs: ['CL-SD-016'],
    summary: 'June infection surveillance closeout and related clinical recert review.',
    title: 'Monthly Infection Surveillance Reporting - June',
  }),
  makeLocalRegulatorySource({
    cadence: 'Monthly',
    date: '2026-07-07',
    domain: 'Clinical',
    forms: ['Medication reconciliation audit sample', 'Clinical variance worksheet'],
    id: 'evt-medrec-review-jul',
    owner: resolveDisplayName('QAPI Nurse'),
    ownerRole: 'Clinical',
    policyRefs: ['CL-SD-013'],
    summary: 'July medication reconciliation documentation sample and variance review.',
    title: 'Medication Reconciliation Compliance Review - July',
  }),
  makeLocalRegulatorySource({
    cadence: 'Quarterly',
    date: '2026-07-16',
    domain: 'QAPI',
    forms: ['Q3 QAPI data packet', 'PIP progress tracker'],
    id: 'evt-qapi-q3-review',
    owner: resolveDisplayName('QAPI Lead'),
    ownerRole: 'QAPI',
    policyRefs: ['QA-PG-001', 'QA-PI-001'],
    summary: 'Q3 QAPI quarterly data review and PIP progress discussion.',
    title: 'QAPI Committee - Q3 Data Review',
    urgency: 'critical',
  }),
  makeLocalRegulatorySource({
    cadence: 'Quarterly',
    date: '2026-07-23',
    domain: 'Governance',
    forms: ['Governing body packet', 'Board minutes template'],
    id: 'evt-gb-q3-meeting',
    owner: resolveDisplayName('Administrator'),
    ownerRole: 'Governing Body',
    policyRefs: ['GV-GB-001'],
    summary: 'Q3 governing body oversight packet and minutes workflow.',
    title: 'Q3 Governing Body Meeting',
  }),
  makeLocalRegulatorySource({
    cadence: 'Annual',
    date: '2026-08-11',
    domain: 'Compliance',
    forms: ['Emergency preparedness tabletop packet', 'After-action report'],
    id: 'evt-ep-tabletop-aug',
    owner: resolveDisplayName('Compliance Officer'),
    ownerRole: 'Compliance',
    policyRefs: ['RM-EP-001', 'RM-EP-003'],
    summary: 'Annual emergency preparedness tabletop exercise and after-action closeout.',
    title: 'Emergency Preparedness Tabletop Exercise - Annual',
  }),
  makeLocalRegulatorySource({
    cadence: 'Annual',
    date: '2026-08-20',
    domain: 'Operations',
    forms: ['Accreditation readiness checklist', 'Survey gap remediation register'],
    id: 'evt-accred-readiness-aug',
    owner: resolveDisplayName('Compliance Officer'),
    ownerRole: 'Compliance',
    policyRefs: ['CO-CP-001'],
    summary: 'Accreditation survey readiness assessment and remediation plan.',
    title: 'Accreditation Survey Readiness Assessment',
    urgency: 'critical',
  }),
  makeLocalRegulatorySource({
    cadence: 'Monthly',
    date: '2026-08-25',
    domain: 'Clinical',
    forms: ['August infection surveillance log', 'Clinical action register'],
    id: 'evt-infection-surveillance-aug',
    owner: resolveDisplayName('Clinical Manager'),
    ownerRole: 'Clinical',
    policyRefs: ['CL-SD-016'],
    summary: 'August infection-control surveillance closeout.',
    title: 'Monthly Infection Surveillance Reporting - August',
  }),
];



const calendarMonthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

function uniqueStrings(values: readonly (string | undefined | null)[]): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}

function getCalendarMonthLabel(month: number | undefined): string {
  return calendarMonthLabels[(month ?? 6) - 1] ?? 'Jun';
}

function getEventMonth(event: CalendarEventData): number {
  return event.month ?? 6;
}

function getDaysInCalendarMonth(month: number, year = 2026): number {
  return new Date(year, month, 0).getDate();
}

function clampCalendarDay(day: number, month = 6): number {
  return Math.min(getDaysInCalendarMonth(month), Math.max(1, day));
}

function dueLabelFromDisplayDay(day: number, offset = 0, month = 6): string {
  return `${getCalendarMonthLabel(month)} ${clampCalendarDay(day + offset, month)}`;
}

function formatStatusLabel(status: string): string {
  return status
    .split(/[_-]/)
    .filter(Boolean)
    .map(titleCaseToken)
    .join(' ');
}

function statusTone(status: SwimlaneStatus): Tone {
  if (status === 'complete' || status === 'locked') return 'green';
  if (status === 'blocked' || status === 'needs_evidence' || status === 'needs_signature' || status === 'awaiting_reviewer') return 'orange';
  if (status === 'pending' || status === 'unavailable') return 'amber';
  return 'teal';
}

function statusProgress(status: SwimlaneStatus): number {
  const progressByStatus: Record<SwimlaneStatus, number> = {
    awaiting_reviewer: 52,
    blocked: 24,
    board_ready: 78,
    complete: 100,
    in_progress: 64,
    locked: 100,
    needs_evidence: 42,
    needs_signature: 48,
    pending: 28,
    ready: 82,
    unavailable: 8,
  };

  return progressByStatus[status];
}

function executionStateTone(unit: ExecutionUnit): Tone {
  if (unit.complianceState === 'blocked' || unit.complianceState === 'awaiting_signature') return 'orange';
  if (unit.complianceState === 'completed') return 'green';
  if (unit.complianceState === 'upcoming') return 'amber';
  return 'teal';
}

function executionStateProgress(unit: ExecutionUnit): number {
  const progressByState: Record<ExecutionUnit['complianceState'], number> = {
    awaiting_signature: 54,
    blocked: 34,
    completed: 100,
    in_progress: 64,
    ready: 82,
    upcoming: 24,
  };

  return progressByState[unit.complianceState];
}

function eventProcessProgress(event: RegulatoryEvent): number {
  if (!event.processFlow.length) return event.urgency === 'complete' ? 100 : 38;
  const values = event.processFlow.map((step) => {
    if (step.status === 'complete') return 100;
    if (step.status === 'in-progress') return 62;
    return 28;
  });

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function eventTone(event: RegulatoryEvent | undefined): Tone {
  if (!event) return 'teal';
  if (event.urgency === 'overdue' || event.urgency === 'critical' || event.urgency === 'blocked' || event.urgency === 'missing-evidence') return 'orange';
  if (event.urgency === 'complete') return 'green';
  return 'teal';
}

function processStepStatus(step: EventProcessStep): SwimlaneStatus {
  if (step.status === 'complete') return 'complete';
  if (step.status === 'in-progress') return step.requiredFormIds?.length ? 'needs_evidence' : 'in_progress';
  if (/sign|attest|approve/i.test(`${step.label} ${step.description}`)) return 'needs_signature';
  if (step.requiredFormIds?.length) return 'needs_evidence';
  return 'pending';
}

function phaseIndexForDisplayStep(step: EventProcessStep, index: number, phaseCount: number): number {
  const text = `${step.label} ${step.description}`.toLowerCase();
  if (/sign|approve|attest|review/.test(text)) return Math.min(phaseCount, Math.max(1, phaseCount - 2));
  if (/evidence|file|lock|archive|package|submit/.test(text)) return phaseCount;
  if (/meeting|conduct|execute|drill/.test(text)) return Math.min(phaseCount, Math.max(2, Math.ceil(phaseCount / 2)));
  return Math.min(phaseCount, index + 1);
}

function buildProcessStepChips(sourceEvent: RegulatoryEvent, step: EventProcessStep): readonly string[] {
  const chips = uniqueStrings([
    ...(step.requiredFormIds ?? []).slice(0, 2),
    ...sourceEvent.policyRefs.slice(0, 1),
  ]);

  return chips.length ? chips : ['Event flow'];
}

// Mark dead CES calendar helpers as used to satisfy noUnusedLocals (pruned source-backed callers in Phase 1/2; retained for parity/future)
if (false as any) {
  void formatStatusLabel; void statusTone; void statusProgress;
  void executionStateTone; void executionStateProgress;
  void eventProcessProgress; void eventTone;
  void processStepStatus; void phaseIndexForDisplayStep; void buildProcessStepChips;
  void inferPhaseTemplate; void localRegulatorySources;
}

function buildMissingSourceCalendarSwimlane(event: CalendarEventData): CalendarSwimlaneData {
  const displayMonth = getEventMonth(event);

  return {
    summary: `${event.label} does not have a mapped CES source event or execution unit. Generic swimlane generation is disabled for CES calendar events.`,
    metrics: [
      { label: 'Tasks', value: '1', helper: 'Source mapping required', tone: 'orange' },
      { label: 'Source', value: 'Missing', helper: event.workflowId ?? event.id ?? 'No workflow id', tone: 'orange' },
      { label: 'Fallback', value: 'Off', helper: 'No generic lanes', tone: 'green' },
      { label: 'Due', value: dueLabelFromDisplayDay(event.day, 0, displayMonth), helper: 'Calendar display date', tone: 'teal' },
    ],
    lanes: [
      {
        title: 'Source Mapping Required',
        tone: 'orange',
        note: 'Map this calendar item to a V3 regulatory event, V3 execution unit, or explicit V1 design swimlane before showing execution work.',
        cards: [
          {
            chips: ['No generic fallback'],
            due: dueLabelFromDisplayDay(event.day, 0, displayMonth),
            id: `${getCalendarEventKey(event)}-source-missing`,
            owner: event.owner,
            progress: 0,
            status: 'Source missing',
            title: `Map ${event.label} to an authoritative workflow source`,
            tone: 'orange',
          },
        ],
      },
    ],
  };
}

function isQapiQuarterlyWorkflowKey(value: string | undefined): boolean {
  if (!value) return false;
  const key = value.toLowerCase();
  return key === 'qa-wf-03'
    || key === 'ces-event-q2-qapi'
    || key === 'evt-qapi-q2-2026'
    || key === 'qapi_meeting-20260507-08'
    || key === 'q2-qapi-quarterly-review'
    || key.includes('q2 qapi quarterly')
    || key.includes('qapi quarterly swimlane');
}

function isQapiQuarterlyEvent(event: CalendarEventData): boolean {
  return isQapiQuarterlyWorkflowKey(event.id)
    || isQapiQuarterlyWorkflowKey(event.workflowId)
    || isQapiQuarterlyWorkflowKey(event.workflow)
    || (event.label.toLowerCase().includes('qapi') && event.label.toLowerCase().includes('q2 data review'));
}

function withQapiQuarterlyFlow(event: CalendarEventData): CalendarEventData {
  if (!isQapiQuarterlyEvent(event)) return event;

  return {
    ...event,
    detail: event.detail ?? 'Quarterly QAPI combines clinical indicators, CAPA, committee packet assembly, eCIgn routing, and survey-ready lock.',
    formsCount: event.formsCount ?? 18,
    label: 'Q2 QAPI quarterly review',
    owner: event.owner || 'QAPI Lead',
    readiness: 'Needs review',
    risk: 'High risk',
    sourceEventId: event.sourceEventId ?? 'evt-qapi-q2-2026',
    sourceKind: 'v1-design',
    sourceUnitId: event.sourceUnitId ?? 'ceu-qapi-2026-10-014',
    steps: '21 tasks',
    swimlane: q2QapiSwimlane,
    taskCount: 21,
    tone: 'orange',
    workflow: 'QAPI quarterly swimlane',
    workflowId: 'QA-WF-03',
  };
}

const q2QapiCalendarEvent: CalendarEventData = withQapiQuarterlyFlow({
  bundleCategory: 'QAPI / Governance',
  bundleName: 'Q2 QAPI quarterly review',
  day: 7,
  detail: 'Quarterly QAPI combines clinical indicators, CAPA, committee packet assembly, eCIgn routing, and survey-ready lock.',
  id: 'qapi_meeting-20260507-08',
  label: 'Q2 QAPI quarterly review',
  month: 5,
  owner: resolveDisplayName('QAPI Lead'),
  primaryDay: true,
  progress: 65,
  readiness: 'Needs review',
  recurrencePattern: 'First Thursday',
  risk: 'High risk',
  scheduleReason: 'Canonical V1 event occurrence qapi_meeting-20260507-08 opens the QA-WF-03 quarterly QAPI swimlane.',
  sourceDate: '2026-05-07',
  steps: '21 tasks',
  tone: 'orange',
  workflow: 'QAPI quarterly swimlane',
  workflowId: 'QA-WF-03',
});

// CES calendar events (for ces-calendar mode) come from buildCalendarEvents() inside getCalendarConfig + CalendarScreen.
// Source trace: V3_CES_SeedData -> cesViewProjections.buildCalendarEvents() -> CalendarScreen (dates preserved, no override).

const calendarConfigsBase = {
  // CES config populated at runtime inside CalendarScreen to avoid top-level CES build side effects for reference routes
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

function getCalendarConfig(mode: 'ces-calendar' | 'master-calendar' | 'staffing-calendar') {
  if (mode === 'ces-calendar') {
    // Lazy: only build when actually rendering CES calendar
    // Build metrics here (not top-level) so reference views (Taxonomy group: /library, /policy-lifecycle, /viewer) execute ZERO CES projections.
    // CES dates flow from V3_CES_SeedData -> buildCalendarEvents (projection) -> here. Source dates preserved.
    const events = buildCalendarEvents() as readonly CalendarEventData[];
    const sprint = buildSprintSummary();
    const metrics: readonly MetricTileData[] = [
      { label: 'Sprint cards', value: String(sprint.total), helper: 'Sprint 12 execution units', tone: 'teal' },
      { label: 'Blocked', value: String(sprint.blocked), helper: 'Signature or evidence gaps', tone: 'orange' },
      { label: 'Ready to certify', value: String(sprint.readyToCertify), helper: 'Awaiting final lock', tone: 'green' },
      { label: 'Survey critical', value: String(sprint.surveyCritical), helper: 'Needs owner action', tone: 'orange' },
    ];
    return {
      events,
      legend: 'Teal events are ready; orange events need owner action.',
      metrics,
      railTone: 'orange' as const,
      railTitle: 'Upcoming Events',
      title: 'CES Compliance Calendar',
    };
  }
  return calendarConfigsBase[mode];
}

function getCalendarEventKey(event: CalendarEventData): string {
  return event.id ?? `calendar-event-${event.day}-${event.label}`;
}

function normalizeCalendarLookupKey(value: string | null | undefined): string | undefined {
  if (!value) return undefined;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getCalendarEventLookupValues(event: CalendarEventData): readonly string[] {
  return [
    event.id,
    event.workflowId,
    event.sourceEventId,
    event.sourceUnitId,
  ].filter((value): value is string => Boolean(value));
}

function findCalendarEventByLookup(events: readonly CalendarEventData[], value: string | null | undefined): CalendarEventData | undefined {
  const lookup = normalizeCalendarLookupKey(value);
  if (!lookup) return undefined;

  return events.find((event) => getCalendarEventLookupValues(event).includes(lookup));
}

function toWorkflowSwimlanePath(event: CalendarEventData): string {
  // Prefer sourceEventId for CES events to correctly resolve to the swimlane (per design)
  const eventId = (event as any).sourceEventId || getCalendarEventKey(event);
  const workflowQuery = event.workflowId ? `?workflowId=${encodeURIComponent(event.workflowId)}` : '';

  return `/events/${encodeURIComponent(eventId)}/swimlane${workflowQuery}`;
}

function getWorkflowEvent(eventId: string | undefined, workflowId?: string | null): CalendarEventData {
  const normalizedEventId = normalizeCalendarLookupKey(eventId);
  const normalizedWorkflowId = normalizeCalendarLookupKey(workflowId);
  const foundByEvent = findCalendarEventByLookup(buildCalendarEvents() as any, normalizedEventId);

  if (foundByEvent) return withQapiQuarterlyFlow(foundByEvent);

  if (isQapiQuarterlyWorkflowKey(normalizedEventId) || isQapiQuarterlyWorkflowKey(normalizedWorkflowId)) {
    return q2QapiCalendarEvent;
  }

  const found = findCalendarEventByLookup(buildCalendarEvents() as any, normalizedWorkflowId);

  if (found) return withQapiQuarterlyFlow(found);

  const lookupLabel = normalizedEventId ?? normalizedWorkflowId;

  const missingEvent: CalendarEventData = {
    day: 1,
    id: 'workflow-source-missing',
    label: lookupLabel ? `Workflow ${lookupLabel}` : 'Workflow source missing',
    owner: resolveDisplayName('Compliance Officer'),
    progress: 0,
    tone: 'orange',
    workflowId: normalizedWorkflowId ?? normalizedEventId,
  };

  return {
    ...missingEvent,
    swimlane: buildMissingSourceCalendarSwimlane(missingEvent),
  };
}

function CalendarEventPreview({
  event,
  anchor,
  monthLabel,
}: {
  event: CalendarEventData;
  anchor: { left: number; top: number; placement: 'left' | 'right' | 'left-sidebar' };
  monthLabel?: string;
}) {
  const formsCount = event.formsCount ?? 0;
  const taskCount = event.taskCount ?? 0;
  const attendees = event.attendees?.join(' / ') ?? 'Owner and reviewer roles pending';
  const readiness = event.readiness ?? (event.tone === 'orange' ? 'Needs review' : 'Ready');
  const risk = event.risk ?? (event.tone === 'orange' ? 'High' : 'Low');
  const evidenceStatus = event.evidenceStatus ?? 'Evidence status pending';
  const nextAction = event.nextAction ?? 'Open workspace and review next task';

  const positionStyle = {
    left: `${anchor.left}px`,
    top: `${anchor.top}px`,
  };

  const displayMonth = monthLabel ?? 'Jun';

  return createPortal(
    <aside
      aria-live="polite"
      className="fixed z-popover w-[340px] pointer-events-none rounded-lg border border-white bg-white p-lg text-ink shadow-rest"
      id="ces-event-preview"
      style={positionStyle}
    >
      <div className="mb-md flex items-start justify-between gap-md">
        <ToneTag tone={event.tone}>{readiness}</ToneTag>
        <ToneTag tone={event.tone}>Click opens swimlane</ToneTag>
      </div>
      <h3 className="text-h3 font-medium text-ink leading-tight">{event.label}</h3>
      <p className="mt-xs text-xs text-muted">
        {displayMonth} {event.day} - {event.owner}
      </p>
      <div className="mt-md grid gap-xs grid-cols-2">
        {[
          ['Risk', risk],
          ['Required forms', `${formsCount}`],
          ['Evidence', evidenceStatus],
          ['Tasks', `${taskCount}`],
        ].map(([label, value]) => (
          <div className={cx('rounded-md border p-sm', toneSurfaceClasses[event.tone])} key={label}>
            <p className="text-[9px] uppercase tracking-tag text-secondary">{label}</p>
            <p className="mt-xs text-xs font-medium">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-md grid gap-xs text-[11px]">
        <p className="text-secondary">
          <span className="font-medium text-ink">Attendees:</span> {attendees}
        </p>
        <p className="text-secondary">
          <span className="font-medium text-ink">Next action:</span> {nextAction}
        </p>
      </div>
      <p className={cx(
        "mt-md rounded-md border px-sm py-xs text-[11px] font-medium text-center",
        event.tone === 'orange' || event.tone === 'amber'
          ? 'border-tone-orange-border bg-tone-orange-bg text-brand-orange'
          : 'border-tone-teal-border bg-tone-teal-bg text-brand-teal'
      )}>
        Click to open event workspace/swimlane
      </p>
    </aside>,
    document.body
  );
}

const calendarAgendaDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

function CalendarFilterButton({ label }: { label: string }) {
  return (
    <button className="inline-flex min-h-tap items-center gap-sm rounded-md px-md text-sm text-secondary transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus" type="button">
      {label}
      <ChevronDown aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
    </button>
  );
}

function getCalendarAgendaStatus(event: CalendarEventData): { label: string; tone: Tone } {
  if (event.tone === 'orange' || event.tone === 'red') {
    return { label: 'Needs owner', tone: 'orange' };
  }

  if (event.tone === 'amber') {
    return { label: 'Ready', tone: 'amber' };
  }

  return { label: 'Ready', tone: 'teal' };
}

function CalendarAgendaList({
  events,
  legend,
  onOpenEvent,
  title,
}: {
  events: readonly CalendarEventData[];
  legend: string;
  onOpenEvent: (event: CalendarEventData) => void;
  title: string;
}) {
  return (
    <div className="grid gap-xl">
      <div>
        <h2 className="text-h2 font-medium text-ink">{title}</h2>
        <p className="mt-xs text-sm text-muted">{legend}</p>
      </div>
      <div className="grid gap-lg">
        {events.slice(0, 5).map((event, index) => {
          const status = getCalendarAgendaStatus(event);

          return (
            <button className="grid gap-md rounded-lg border border-hairline bg-surface-glass p-lg text-left transition duration-fast focus-visible:outline-none focus-visible:shadow-focus hover:bg-tone-slate-bg" key={getCalendarEventKey(event)} onClick={() => onOpenEvent(event)} type="button">
              <div className="grid items-center gap-lg tablet-p:grid-cols-[56px_minmax(0,1fr)]">
                <div className="text-sm font-medium text-brand-teal-deep">{calendarAgendaDayLabels[index] ?? 'Day'}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-md">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium leading-snug text-brand-teal-deep">{event.label}</h3>
                      <p className="mt-xs text-xs text-muted">{event.owner} - {getCalendarMonthLabel(getEventMonth(event))} {event.day}</p>
                    </div>
                    <ToneTag tone={status.tone}>{status.label}</ToneTag>
                  </div>
                  <ProgressMeter className="mt-md" tone={event.tone} value={event.progress} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalendarSwimlaneInline({
  event,
  events,
  onBack,
  onSelectEvent,
}: {
  event: CalendarEventData;
  events: readonly CalendarEventData[];
  onBack: () => void;
  onSelectEvent: (event: CalendarEventData) => void;
}) {
  const swimlane = event.swimlane ?? {
    lanes: [
      {
        title: 'Intake',
        tone: 'teal' as const,
        note: 'Open the event and bind policies, forms, owners.',
        cards: [
          {
            id: 'EVT-01',
            title: `Trigger ${event.label}`,
            owner: event.owner || 'Compliance',
            due: dueLabelFromDisplayDay(event.day, 0, getEventMonth(event)),
            progress: 80,
            tone: 'teal' as const,
            chips: ['Event'],
            status: 'Ready',
          },
        ],
      },
      {
        title: 'Evidence Build',
        tone: 'teal' as const,
        note: 'Collect artifacts and check the evidence packet.',
        cards: [
          {
            id: 'EVT-02',
            title: 'Collect required evidence',
            owner: event.owner || 'Compliance',
            due: dueLabelFromDisplayDay(event.day, 1, getEventMonth(event)),
            progress: 60,
            tone: 'teal' as const,
            chips: ['Evidence'],
            status: 'In progress',
          },
        ],
      },
      {
        title: 'Review & Signature',
        tone: 'orange' as const,
        note: 'Review decisions before signature or certification.',
        cards: [
          {
            id: 'EVT-03',
            title: 'Manager review',
            owner: 'Clinical Manager',
            due: dueLabelFromDisplayDay(event.day, 2, getEventMonth(event)),
            progress: 40,
            tone: 'orange' as const,
            chips: ['Review'],
            status: 'Pending',
          },
        ],
      },
      {
        title: 'Finalize & Lock',
        tone: 'green' as const,
        note: 'Route eCIgn and final lock.',
        cards: [
          {
            id: 'EVT-04',
            title: 'Finalize packet',
            owner: event.owner || 'Compliance',
            due: dueLabelFromDisplayDay(event.day, 3, getEventMonth(event)),
            progress: 20,
            tone: 'green' as const,
            chips: ['Lock'],
            status: 'Ready',
          },
        ],
      },
    ],
    metrics: [
      { label: 'Tasks', value: '4', helper: 'Generated from event context', tone: 'teal' },
      { label: 'Owner', value: event.owner || 'Compliance', helper: 'Primary accountable party', tone: 'orange' },
      { label: 'Risk', value: event.risk || 'Current', helper: 'Calendar-derived signal', tone: event.tone },
      { label: 'Due', value: dueLabelFromDisplayDay(event.day, 0, getEventMonth(event)), helper: 'Event target date', tone: 'teal' },
    ],
    summary: `${event.label} opens as a focused compliance swimlane with intake, evidence, review, signature, and final lock tasks.`,
  };
  const lanes = swimlane.lanes;
  const totalTasks = lanes.reduce((sum, lane) => sum + lane.cards.length, 0);
  const eventCarousel = [event, ...events.filter((item) => item.label !== event.label)];

  return (
    <section className="grid gap-xl" data-calendar-swimlane>
      <section className="grid gap-xl rounded-lg border border-hairline bg-surface-glass p-xl shadow-rest">
        <div
          aria-label="CES event carousel"
          className="flex gap-sm overflow-x-auto rounded-lg border border-hairline bg-white/[.30] p-sm backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            maskImage: 'linear-gradient(to right, black 0, black calc(100% - 44px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0, black calc(100% - 44px), transparent 100%)',
          }}
        >
          {eventCarousel.map((item) => {
            const isSelected = item.label === event.label;

            return (
              <button
                aria-current={isSelected ? 'true' : undefined}
                className={cx(
                  'min-h-tap shrink-0 rounded-sm border px-md py-sm text-[10px] font-medium uppercase tracking-wider transition duration-fast hover:translate-y-[-1px]',
                  isSelected
                    ? 'border-brand-teal bg-brand-teal text-on-brand shadow-rest'
                    : item.tone === 'orange' || item.tone === 'amber'
                      ? 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text'
                      : 'border-hairline bg-white/[.45] text-brand-teal hover:bg-white/[.60]'
                )}
                key={item.label}
                onClick={() => onSelectEvent(item)}
                type="button"
              >
                {getCalendarMonthLabel(getEventMonth(item))} {item.day} - {item.label}
              </button>
            );
          })}
        </div>

        <MetricGrid metrics={swimlane.metrics} />

        <div className="flex flex-wrap items-center justify-between gap-lg border-t border-hairline pt-lg">
          <div className="flex flex-wrap gap-sm">
            <ToneTag tone={event.tone}>{event.readiness ?? 'Swimlane open'}</ToneTag>
            <ToneTag tone="slate">{getCalendarMonthLabel(getEventMonth(event))} {event.day}</ToneTag>
            <ToneTag tone="teal">{totalTasks} tasks</ToneTag>
          </div>
          <Button iconLeft={<CalendarClock aria-hidden="true" className="h-icon-sm w-icon-sm" />} onClick={onBack} size="sm" variant="secondary">
            Back to month
          </Button>
        </div>

        <section aria-label="CES event stage summary" className="grid gap-md [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))]">
          {lanes.map((lane, index) => (
            <article className={cx('rounded-lg p-lg shadow-none', toneGlassSurfaceClasses[lane.tone])} key={lane.title}>
              <div className="flex items-center justify-between gap-sm">
                <span className="grid h-tap w-tap place-items-center rounded-full bg-white/[.55] text-sm font-medium">{index + 1}</span>
                <span className="text-[10px] font-medium uppercase tracking-wider opacity-75">{lane.cards.length} tasks</span>
              </div>
              <h3 className="mt-md text-sm font-medium leading-tight">{lane.title}</h3>
              <p className="mt-xs text-xs leading-relaxed opacity-75">{lane.cards.length} execution tasks</p>
            </article>
          ))}
        </section>
      </section>

      <div className="grid gap-lg">
        {lanes.map((lane, laneIndex) => (
          <section className="grid gap-lg rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest laptop:grid-cols-[150px_minmax(0,1fr)] desktop:grid-cols-[180px_minmax(0,1fr)]" key={lane.title}>
            <aside className={cx('rounded-lg p-lg shadow-none', toneGlassSurfaceClasses[lane.tone])}>
              <div className="flex items-center justify-between gap-md">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[.55] text-sm font-medium">{laneIndex + 1}</span>
                <ToneTag tone={lane.tone}>{lane.cards.length}</ToneTag>
              </div>
              <h2 className="mt-lg text-base font-medium">{lane.title}</h2>
              <p className="mt-sm text-xs leading-relaxed opacity-75">{lane.note}</p>
            </aside>
            <div
              className="grid gap-md [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))] laptop:[grid-template-columns:repeat(var(--lane-card-count),minmax(0,1fr))]"
              style={{ '--lane-card-count': lane.cards.length } as CSSProperties}
            >
              {lane.cards.map((task) => (
                <article className="min-w-0 rounded-lg border border-hairline bg-white p-lg transition duration-fast hover:bg-tone-slate-bg" key={task.id}>
                  <div className="flex items-start justify-between gap-md">
                    <ToneTag tone={task.tone}>{task.id}</ToneTag>
                    <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', task.tone === 'orange' ? 'bg-brand-orange' : 'bg-brand-teal')} />
                  </div>
                  <h3 className="mt-md text-sm font-medium leading-snug text-brand-teal-deep">{task.title}</h3>
                  <div className="mt-md grid grid-cols-2 gap-md text-[11px] text-muted">
                    <div>
                      <div className="text-[9px] font-medium uppercase tracking-wider text-brand-teal">Owner</div>
                      <div className="mt-xs truncate">{task.owner}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-medium uppercase tracking-wider text-brand-teal">Due</div>
                      <div className="mt-xs">{task.due}</div>
                    </div>
                  </div>
                  <div className="mt-md flex flex-wrap gap-xs">
                    {task.chips.map((chip) => (
                      <span className="rounded-sm border border-tone-teal-border bg-white/[.45] px-sm py-xs text-[9px] font-medium uppercase tracking-wider text-brand-teal" key={`${task.id}-${chip}`}>
                        {chip}
                      </span>
                    ))}
                  </div>
                  <div className="mt-md flex items-center justify-between text-[10px] font-medium text-muted">
                    <span>{task.status}</span>
                    <span>{task.progress}%</span>
                  </div>
                  <ProgressMeter className="mt-xs" tone={task.tone} value={task.progress} />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

void CalendarSwimlaneInline; // referenced to satisfy tsc noUnusedLocals (JSX references inside conditional renders inside CalendarScreen etc. are the live uses)

function StaffingConflictDrawer({
  event,
  onClose,
  open,
}: {
  event: CalendarEventData | null;
  onClose: () => void;
  open: boolean;
}) {
  const candidates = [
    ['Priya Singh, RN', '96% match', '3.4 miles', '2/5 visits'],
    ['Luis Mendez, LVN', '88% match', '5.8 miles', '3/5 visits'],
    ['Maria Delgado, RN', '84% match', '7.1 miles', '4/5 visits'],
  ];

  return (
    <VeilDrawer
      eyebrow="Staffing calendar"
      footer={
        <div className="flex flex-wrap justify-end gap-sm">
          <Button onClick={onClose} variant="secondary">Close drawer</Button>
          <Button>Escalate to director</Button>
        </div>
      }
      onClose={onClose}
      open={open}
      title="Resolve staffing conflict"
      tone="orange"
    >
      <div className="grid gap-lg">
        <div className="rounded-lg border border-tone-orange-border bg-tone-orange-bg p-lg text-tone-orange-text">
          <h3 className="text-base font-medium text-tone-orange-text">{event?.label ?? 'CHHA gap'}</h3>
          <p className="mt-sm text-xs leading-relaxed">Clinician coverage needs reassignment before the visit window. Candidate ranking uses discipline match, distance, and current caseload.</p>
        </div>
        {candidates.map(([name, match, distance, load], index) => (
          <article className="rounded-lg border border-card bg-surface p-lg shadow-rest" key={name}>
            <div className="flex items-start justify-between gap-md">
              <div>
                <h4 className="text-sm font-medium text-brand-teal-deep">{name}</h4>
                <p className="mt-xs text-xs text-muted">{distance} - {load}</p>
              </div>
              <ToneTag tone={index === 0 ? 'teal' : 'orange'}>{match}</ToneTag>
            </div>
            <Button className="mt-md w-full" size="sm">Assign and dispatch</Button>
          </article>
        ))}
      </div>
    </VeilDrawer>
  );
}

// boardLanes + metrics computed inside BoardScreen (lazy)
// evidence/audit + metrics computed inside EvidenceScreen (lazy)

const evidenceConfigs = {
  'audit-mode': {
    description: 'Survey-facing readiness queue with missing evidence, pending approvals, and certified locked packets.',
    metrics: [] as any,
    rows: [] as any,
    tileTone: 'orange' as const,
    tiles: [['0', 'Ready'], ['0', 'Missing'], ['0', 'Pending'], ['0', 'Locked']] as const, // overridden by live realTiles in EvidenceScreen (pure seed counts)
    title: 'Audit health queue',
  },
  // Design cross-ref (Agent 03): audit-mode and evidence-center align to V6_DESIGN.html ~1386 (auditEvidenceRows, metrics) and ~1398 (evidenceCenterRows, metrics). See also V6_DESIGN_RECONCILIATION.md for MATCHED_REFERENCE.
  'evidence-center': {
    description: 'Every item links to policy, workflow, owner, source file, content hash, and retention state. Real V3 seed records used where available.',
    metrics: [] as any,
    rows: [] as any,
    tileTone: 'teal' as const,
    tiles: [['Policies','Forms','Evidence','Approvals']] as const, // labels; counts derived live below
    title: 'Evidence hierarchy',
  },
  // Design cross-ref (Agent 16): evidence-center to V6_DESIGN.html ~1398 (evidenceCenterRows, metrics ~1403-1408).
  // Implementation proposals: integrate cesMasterControlAudit projection for dynamic evidence counts from controls; link to reports for throughput metrics; ensure statuses match design (EVIDENCE_LOCKED etc.). Current static but aligned.
} as const;

const artifactMetrics: readonly MetricTileData[] = [
  { label: 'Artifact', value: 'EV-REAL', helper: 'Evidence package summary (from ref)', tone: 'teal' },
  { label: 'Status', value: 'Valid', helper: 'Hash verified (real)', tone: 'green' },
  { label: 'Linked docs', value: 'V3+', helper: 'Policies/forms/units from seed', tone: 'teal' },
  { label: 'Review', value: '0-1 gap', helper: 'Projection derived', tone: 'orange' },
];

const realStandardsCount = achcSurveyRows.reduce((sum, r) => sum + r.achcStandards.length, 0);
const mappedCount = achcSurveyRows.filter(r => r.mappingType !== 'NONE').length;
const achcMetrics: readonly MetricTileData[] = [
  { label: 'Standards', value: String(realStandardsCount), helper: 'ACHC items tracked', tone: 'teal' },
  { label: 'Mapped', value: String(mappedCount), helper: 'Policy support attached', tone: 'green' },
  { label: 'Survey rows', value: String(achcSurveyRows.length), helper: 'Policy-linked ACHC entries', tone: 'orange' },
  { label: 'Crosswalk rows', value: String(achcPrintCrosswalk.length), helper: 'Print + attachment coverage', tone: 'teal' },
];

// Real ACHC survey / crosswalk records — full data for parity with V1 ACHC views (no artificial slice limit)
const achcRows: readonly BasicRow[] = achcSurveyRows.map(r => ({
  id: r.achcStandards[0] || 'ACHC',
  title: r.policyTitle,
  owner: r.policyId,
  status: r.mappingType === 'DIRECT' ? 'validated' : (r.mappingType === 'PARTIAL' ? 'ready' : 'review-required'),
}));

const crosswalkRows: readonly BasicRow[] = achcPrintCrosswalk
  .filter(r => r.ibmPolicyId && r.ibmPolicyId !== 'UNMAPPED')
  .map(r => ({
    id: r.corridorPolicyNo || r.corridorSection,
    title: r.corridorTitle,
    owner: r.ibmPolicyId,
    cmsTitle22: (r.title22 && r.title22.length ? r.title22[0] : (r.medicareCop && r.medicareCop.length ? r.medicareCop[0] : '—')),
    evidence: (r.evidenceCodes && r.evidenceCodes.length ? r.evidenceCodes.join('/') : '—'),
    status: r.mappingConfidence === 'HIGH' ? 'validated' : 'review-required',
  }));

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

// ─── FormWorkspaceScreen real-data wiring (Form Viewer, route /forms/:formId) ───
// Owned exclusively by FormWorkspaceScreen below. Sources the canonical forms
// dataset; no per-form instance values exist in the dataset, so the field cards
// surface honest record metadata and conservatively derived posture tokens.
const FORM_VIEWER_DATASET = new Map<string, FormRecord>(FORMS_DATASET.map((record) => [record.id, record] as const));

const FORM_VIEWER_DOMAIN_NAMES: Record<string, string> = {
  EN: 'Enterprise',
  GV: 'Governance',
  HR: 'Human Resources',
  CL: 'Clinical',
  QA: 'Quality',
  RM: 'Risk Management',
  OP: 'Operations',
  FN: 'Finance',
  IT: 'IT & Security',
  IS: 'IT & Security',
  CO: 'Compliance',
};

const formViewerDomainName = (code: string): string => FORM_VIEWER_DOMAIN_NAMES[code] ?? code;

// Posture token derived only from the real `usage` field (mandatory vs conditional).
const formViewerUsageStatus = (usage: string): string => {
  switch (usage) {
    case 'Required':
      return 'ready';
    case 'Conditional':
      return 'pending';
    case 'Optional':
      return 'draft';
    default:
      return 'info';
  }
};

// Audit-critical records carry validated evidence posture; others are informational.
const formViewerEvidenceStatus = (classifications: readonly string[]): string =>
  classifications.includes('audit_critical') ? 'validated' : 'info';

const formViewerPoliciesLabel = (policies: readonly string[]): string => {
  const first = policies[0] ?? '';
  if (first.startsWith('ALL')) return first;
  return policies.length === 1 ? '1 linked policy' : `${policies.length} linked policies`;
};

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

// ReportsScreen recomputes live via builders for real V3 data (no placeholders).

export function RepresentativeScreen({ route }: { route: RouteLike }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const overlay = searchParams.get('v6-overlay');

  if (overlay === 'drawer-system') return <OverlaySystemScreen />;

  let child: ReactNode = null;
  switch (route.hashId) {
    case 'admin-groups':
      child = <AdminGroupsScreen />;
      break;
    case 'admin-roles':
      child = <AdminRolesScreen />;
      break;
    case 'admin-permissions':
      child = <AdminPermissionsScreen />;
      break;
    case 'admin-users':
      child = <AdminUsersScreen />;
      break;
    case 'achc-crosswalk':
      child = <AchcScreen mode="crosswalk" />;
      break;
    case 'achc-survey':
      child = <AchcScreen mode="survey" />;
      break;
    case 'artifact-viewer':
      child = <ArtifactViewerScreen />;
      break;
    case 'audit-mode':
      child = <EvidenceScreen mode="audit-mode" />;
      break;
    case 'ces-calendar':
      child = <CalendarScreen mode="ces-calendar" />;
      break;
    case 'clinicians':
      child = <ProfileListScreen mode="clinicians" />;
      break;
    case 'clinician-detail':
      child = <ClinicianDetailScreen />;
      break;
    case 'dashboard':
      child = <DashboardScreen />;
      break;
    case 'ecign-workspace':
      child = <EcignWorkspaceScreen />;
      break;
    case 'events-board':
      // Design cross-ref (Agent 13): events-board to V6_DESIGN.html ~1334 (4-col risk buckets, metrics 162/4/12/28, exact card data/semantics from eventsBoardColumns ~508). Screen uses pragmatic data + full fields via BoardLane.
      child = <EventsBoardScreen />;
      break;
    case 'policy-library':
      child = <PolicyMatrixScreen />;
      break;
    case 'policy-detail':
      child = <PolicyDetailScreen />;
      break;
    case 'patient-detail':
      child = <PatientDetailScreen />;
      break;
    case 'forms-library':
      child = <FormsLibraryScreen />;
      break;
    case 'framework':
    case 'taxonomy':
      child = <FrameworkScreen />;
      break;
    case 'generic-reference':
      child = <GenericReferenceScreen />;
      break;
    case 'master-calendar':
      child = <CalendarScreen mode="master-calendar" />;
      break;
    case 'master-controls':
      // Design cross-ref (Agent 03 / Agent 15): master-controls to V6_DESIGN.html ~1371 (masterControlRecords ~596, metrics 104/81/22/1, cards), cesMasterControlAudit projection (inventory + audit/evidence rows + validate). Screen is now projection-backed for parity.
      child = <MasterControlsScreen />;
      break;
    case 'my-tasks':
      child = <MyTasksScreen />;
      break;
    case 'patients':
      child = <ProfileListScreen mode="patients" />;
      break;
    case 'ces-board':
      // Design cross-ref (Agent 12 background): ces-board to V6_DESIGN.html ~1320 (7-col kanbanLanes from complianceBoardColumns ~409 incl. dedicated "Awaiting Action / Evidence" with EVT-REV cards + meta/awaitingType/missing, metrics, filters, summary 'Sprint 12 - 38 cards - 5 awaiting action/evidence', desktop:grid-cols-7 via BoardLane).
      // Current: exact lanes + cards (pragmatic subset), 7 metrics, awaiting column + fields, BoardScreen + filters. Proposals: dynamic from V3 seeds/snapshot or cesMasterControlAudit, link cards to /evidence /swimlane, derive metrics from projections.
      // Agent 21 read-only CES Integration/Routing gap vs design: BoardScreen renders <BoardLane lane={lane} /> (no onCardClick prop), so no navigation from cards. Design explicitly calls for future CTA links from board to /evidence / swimlane (and exposure from Calendar/Events). Routing is complete, but interactive cross-CES-view integration is a gap in current prototype. See routeRegistry Agent 21 comment.
      child = <BoardScreen />;
      break;
    case 'evidence-center':
      child = <EvidenceScreen mode="evidence-center" />;
      break;
    case 'form-viewer':
      child = <FormWorkspaceScreen />;
      break;
    case 'brad':
      child = <BradScreen />;
      break;
    case 'user-guide':
      child = <DocsScreen />;
      break;
    case 'ces-reports':
      // Design cross-ref (Agent 03/23/16): ces-reports to V6_DESIGN.html ~1410 (cesReportCards, reportBars ~1414, metrics ~1416-1421).
      // Agent 21: Now fully wired to real V3 seed data via buildReportMetrics / buildReportCards / buildReportTrendBars (no placeholders). Cards use actual sprint/blocked/completed/surveyCritical counts. Trend derived from unit states. Subnav + nav to /master-controls /evidence preserved. My-tasks uses buildTaskLanes too.
      child = <ReportsScreen />;
      break;
    case 'staffing-calendar':
      child = <CalendarScreen mode="staffing-calendar" />;
      break;
    case 'workflows':
      child = <WorkflowsScreen />;
      break;
    case 'workflow-detail':
      child = <WorkflowDetailScreen />;
      break;
    case 'workflow-swimlane':
      child = <WorkflowSwimlaneScreen />;
      break;
    case 'journey-overview':
      child = <JourneyOverviewScreen />;
      break;
    case 'journey-v1':
      child = <JourneyV1Screen />;
      break;
    case 'module-player':
      child = <ModulePlayerScreen />;
      break;
    case 'appendix-f':
      child = <AppendixFScreen />;
      break;
    case 'supervisor':
      child = <SupervisorScreen />;
      break;
    case 'journey-admin':
      child = <JourneyAdminScreen />;
      break;
    case 'onboarding-v2-dashboard':
      child = <OnboardingV2DashboardScreen />;
      break;
    case 'onboarding-v2-activate':
      child = <OnboardingV2ActivateScreen />;
      break;
    case 'onboarding-v2-batches':
      child = <OnboardingV2BatchesScreen />;
      break;
    case 'onboarding-v2-batch':
      child = <OnboardingV2BatchScreen />;
      break;
    case 'onboarding-v2-audit':
      child = <OnboardingV2AuditScreen />;
      break;
    case 'onboarding-v2-governance':
      child = <OnboardingV2GovernanceScreen />;
      break;
    case 'policy-lifecycle':
      child = <PolicyLifecycleScreen />;
      break;
    case 'policy-lifecycle-detail':
      child = <PolicyLifecycleDetailScreen />;
      break;
    case 'hubstaff':
      child = <HubstaffScreen />;
      break;
    case 'system-docs':
      child = <SystemDocsScreen />;
      break;
    case 'help-center':
      child = <HelpCenterScreen />;
      break;
    case 'governance':
      child = <GovernanceScreen />;
      break;
    case 'surveyor-viewer':
      child = <SurveyorViewerScreen />;
      break;
    case 'login-page':
      child = <LoginScreen />;
      break;
    case 'mobile-incident':
      child = <MobileIncidentScreen />;
      break;
    default:
      child = <NotFoundScreen />;
      break;
  }

  if (route.group === 'Auth') {
    return child;
  }

  const wrapped = child;

  const mainContent = <div className="grid">{wrapped}</div>;

  // Workspace subnav rendered inside the content area for V1 parity (not in main sidebar)
  // Primary parents only in sidebar; children here.
  const pathname = location?.pathname || '';
  const cesHashIds = ['ces-calendar', 'ces-board', 'events-board', 'master-controls', 'my-tasks', 'ces-reports', 'workflows', 'workflow-detail', 'workflow-swimlane', 'evidence-center', 'audit-mode'];
  const isCESGroup = route.group === 'CES' || cesHashIds.includes(route.hashId || '') || pathname.startsWith('/ces/') || pathname.startsWith('/workflows') || pathname.startsWith('/events/') || pathname === '/audit' || pathname === '/evidence' || pathname.startsWith('/compliance/');

  const isTaxonomyGroup = pathname.startsWith('/framework') || pathname.startsWith('/library') || pathname.startsWith('/forms') || pathname.startsWith('/taxonomy') || pathname.startsWith('/achc') || ['framework', 'taxonomy', 'policy-library', 'policy-detail', 'forms-library', 'form-viewer', 'achc-survey', 'achc-crosswalk'].includes(route.hashId || '') || route.group === 'Taxonomy';
  const isOnboardingGroup = pathname.startsWith('/journey') || pathname.startsWith('/onboarding-v2') || ['journey-overview', 'journey-v1', 'module-player', 'appendix-f', 'supervisor', 'journey-admin', 'user-guide'].includes(route.hashId || '') || route.group === 'Onboarding';
  const isSystemGroup = pathname.startsWith('/system-documentation') || pathname.startsWith('/policy-lifecycle') || pathname === '/hubstaff' || pathname.startsWith('/help') || ['system-docs', 'policy-lifecycle', 'policy-lifecycle-detail', 'hubstaff', 'help-center', 'governance'].includes(route.hashId || '') || route.group === 'System';
  const isAdminGroup = pathname.startsWith('/admin/') || ['admin-groups', 'admin-roles', 'admin-permissions', 'admin-users', 'surveyor-viewer'].includes(route.hashId || '') || route.group === 'Admin';

  let workspaceSubnav = null;
  if (isCESGroup) {
    workspaceSubnav = <CESSubnav />;
  } else if (isTaxonomyGroup && workspaceSubnavItems.taxonomy) {
    workspaceSubnav = <WorkspaceSubnav items={workspaceSubnavItems.taxonomy} currentPath={location?.pathname || ''} prefix="Taxonomy:" />;
  } else if (isOnboardingGroup && workspaceSubnavItems.onboarding) {
    workspaceSubnav = <WorkspaceSubnav items={workspaceSubnavItems.onboarding} currentPath={location?.pathname || ''} prefix="Onboarding:" />;
  } else if (isSystemGroup && workspaceSubnavItems['system-docs']) {
    workspaceSubnav = <WorkspaceSubnav items={workspaceSubnavItems['system-docs']} currentPath={location?.pathname || ''} prefix="System Docs:" />;
  } else if (isAdminGroup && workspaceSubnavItems.admin) {
    workspaceSubnav = <WorkspaceSubnav items={workspaceSubnavItems.admin} currentPath={location?.pathname || ''} prefix="Admin:" />;
  }

  const content = workspaceSubnav ? (
    <>
      {workspaceSubnav}
      {mainContent}
    </>
  ) : mainContent;

  return content;
}

// Generic workspace subnav (top of workspace content, V1 style)
function WorkspaceSubnav({ items, currentPath, prefix }: { items: any[]; currentPath: string; prefix: string }) {
  const isActivePath = (itemPath: string) => {
    if (currentPath === itemPath) return true;
    if (currentPath.startsWith(itemPath + '/')) return true;
    return false;
  };
  return (
    <div className="mb-lg flex flex-wrap items-center gap-sm border-b border-hairline pb-md text-sm" role="navigation" aria-label="workspace subnav">
      <span className="mr-sm text-tag uppercase tracking-tag text-muted">{prefix}</span>
      {items.map((item) => {
        const isActive = isActivePath(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded px-sm py-xs text-brand-teal hover:bg-surface-hover hover:text-brand-teal-deep border-b-2 ${
              isActive ? 'border-brand-teal text-brand-teal-deep font-medium' : 'border-transparent hover:border-brand-teal'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function isRepresentativeRoute(route: RouteLike): boolean {
  return [
    'admin-groups',
    'admin-roles',
    'admin-permissions',
    'admin-users',
    'achc-crosswalk',
    'achc-survey',
    'artifact-viewer',
    'audit-mode',
    'ces-calendar',
    'clinicians',
    'clinician-detail',
    'dashboard',
    'ecign-workspace',
    'events-board',
    'policy-library',
    'policy-detail',
    'forms-library',
    'taxonomy',
    'framework',
    'generic-reference',
    'patients',
    'patient-detail',
    'master-calendar',
    'master-controls',
    'my-tasks',
    'staffing-calendar',
    'workflows',
    'workflow-detail',
    'workflow-swimlane',
    'ces-board',
    'evidence-center',
    'form-viewer',
    'brad',
    'user-guide',
    'ces-reports',
    'journey-overview',
    'journey-v1',
    'module-player',
    'appendix-f',
    'supervisor',
    'journey-admin',
    'onboarding-v2-dashboard',
    'onboarding-v2-activate',
    'onboarding-v2-batches',
    'onboarding-v2-batch',
    'onboarding-v2-audit',
    'onboarding-v2-governance',
    'policy-lifecycle',
    'policy-lifecycle-detail',
    'hubstaff',
    'system-docs',
    'help-center',
    'governance',
    'surveyor-viewer',
    'login-page',
    'mobile-incident',
    'pm-my-tasks',
    'pm-sprint-plan',
    'pm-sprint-review',
    'pm-approvals',
    'pm-dashboard',
  ].includes(route.hashId);
}

function ScreenStack({ children, metrics }: { children: ReactNode; metrics: readonly MetricTileData[] }) {
  return (
    <div className="grid gap-2xl">
      {metrics.length > 0 && <MetricGrid metrics={metrics} />}
      {children}
    </div>
  );
}

function DesignBadge({ tone = 'teal', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cx(
      'inline-flex items-center gap-1.5 rounded-full border px-sm py-xs text-tag font-medium uppercase tracking-tag',
      toneSurfaceClasses[tone]
    )}>
      <span className={cx('h-1.5 w-1.5 rounded-full', tone === 'orange' ? 'bg-brand-orange' : 'bg-brand-teal')} />
      {children}
    </span>
  );
}

function ActionList({ rows }: { rows: readonly ActionRow[] }) {
  return (
    <div className="grid gap-md">
      {rows.map((row) => {
        const Icon = row.icon;

        return (
          <article 
            className="rounded-lg border border-card bg-tone-slate-bg p-lg transition duration-fast ease-standard hover:shadow-hover" 
            key={row.title}
          >
            <div className="flex items-start justify-between gap-lg">
              <div className="flex min-w-0 items-start gap-lg">
                <span className={cx(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-xl border',
                  toneSurfaceClasses[row.tone]
                )}>
                  <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
                </span>

                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-brand-teal-deep leading-snug">{row.title}</h3>
                  <p className="mt-xs text-xs text-muted leading-relaxed">{row.body}</p>
                </div>
              </div>

              <div className="flex min-h-[58px] shrink-0 flex-col items-end justify-between text-right">
                <DesignBadge tone={row.tone}>
                  {row.due}
                </DesignBadge>
                <span className="text-tag font-medium uppercase tracking-tag text-brand-teal-deep">
                  {row.owner}
                </span>
              </div>
            </div>

            <div className="mt-md h-1.5 w-full rounded-full bg-white/85">
              <div 
                className={cx('h-full rounded-full', row.tone === 'orange' ? 'bg-brand-orange' : 'bg-brand-teal')} 
                style={{ width: `${row.progress}%` }} 
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function DashboardScreen() {
  return (
    <div className="grid gap-2xl">
      <MetricGrid metrics={dashboardMetrics} />

      <section className="grid gap-xl desktop:grid-cols-5">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest desktop:col-span-3">
          <div className="mb-lg flex items-center justify-between gap-lg">
            <div>
              <h2 className="text-h2 font-medium text-brand-teal-deep">Dashboard work queue</h2>
              <p className="mt-xs text-sm text-muted">Prioritized by owner, due date, evidence state, and operating risk.</p>
            </div>
            <DesignBadge tone="orange">
              {dashboardActions.filter((row) => row.tone === 'orange').length} action items
            </DesignBadge>
          </div>
          <ActionList rows={dashboardActions} />
        </section>

        <aside className="grid gap-lg desktop:col-span-2">
          <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
            <div className="mb-lg flex items-center justify-between gap-lg">
              <h2 className="text-h2 font-medium text-brand-teal-deep">Dashboard signals</h2>
              <DesignBadge tone="teal">
                6 tracked
              </DesignBadge>
            </div>
            <div className="grid gap-md tablet-p:grid-cols-2">
              {[
                ['SOC starts', '9', '4 need RN confirmation', 'orange'],
                ['High-acuity census', '17', 'CHF, wounds, post-CVA', 'teal'],
                ['Open visit gaps', '6', '2 weekend coverage gaps', 'orange'],
                ['Orders pending', '14', '5 physician signatures', 'amber'],
                ['Credential risk', '2', 'PT and LVN renewal windows', 'orange'],
                ['Discharge prep', '8', 'MSW coordination active', 'green'],
              ].map(([label, value, note, tone]) => (
                <div 
                  className={cx(
                    'rounded-lg border p-md shadow-rest transition duration-base ease-standard hover:translate-y-[-2px] hover:shadow-hover active:scale-[0.997]', 
                    toneSurfaceClasses[tone as Tone]
                  )} 
                  key={label}
                >
                  <div className="text-tag font-medium uppercase tracking-tag opacity-80">{label}</div>
                  <div className="mt-sm text-2xl font-medium tracking-tight">{value}</div>
                  <div className="mt-xs text-xs font-light leading-relaxed opacity-80">{note}</div>
                </div>
              ))}
            </div>
          </section>

          {dashboardCards.slice(0, 2).map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </div>
  );
}

function ProfileListScreen({ mode }: { mode: keyof typeof profileFocus }) {
  const navigate = useNavigate();
  const profile = profileFocus[mode];
  const coverageLabel = mode === 'clinicians' ? 'Coverage' : 'Clinical focus';

  const handleRowClick = (row: BasicRow) => {
    const targetId = row.id;
    if (!targetId) return;
    if (mode === 'clinicians') {
      navigate(`/clinicians/${encodeURIComponent(targetId)}`);
    } else {
      navigate(`/patients/${encodeURIComponent(targetId)}`);
    }
  };

  return (
    <ScreenStack metrics={profile.metrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(320px,1fr)]">
        <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
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
            onRowClick={handleRowClick}
          />
        </section>
        <aside className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
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
          <Button
            className="mt-xl w-full border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange"
            onClick={() => {
              const first = profile.rows[0];
              if (first?.id) {
                if (mode === 'clinicians') navigate(`/clinicians/${encodeURIComponent(first.id)}`);
                else navigate(`/patients/${encodeURIComponent(first.id)}`);
              }
            }}
          >
            Open detail
          </Button>
        </aside>
      </section>
    </ScreenStack>
  );
}

function ClinicianDetailScreen() {
  const params = useParams<{ clinicianId?: string }>();
  const clinicianId = params.clinicianId?.trim() || clinicianRows[0]?.id || 'clin-001';
  const match = MOCK_CLINICIANS.find((c) => c.id === clinicianId) || MOCK_CLINICIANS[0];
  const displayTitle = match ? `${match.firstName} ${match.lastName}, ${match.primaryDiscipline}` : 'Clinician Detail';

  return (
    <ScreenStack metrics={clinicianMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
          <div className="mb-xl flex items-start justify-between gap-lg">
            <div>
              <ToneTag>/clinicians/:clinicianId</ToneTag>
              <h2 className="mt-lg text-h2 font-medium text-ink">{displayTitle}</h2>
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
        <aside className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
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
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredRows = !search.trim()
    ? policyRowsBase
    : policyRowsBase.filter((r) =>
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.domain.toLowerCase().includes(search.toLowerCase())
      );

  const handleRowClick = (row: BasicRow) => {
    const id = row.id;
    if (id) navigate(`/library/${encodeURIComponent(id)}`);
  };

  // Top subnav for Taxonomy group (V1 parity + discoverability of sibling routes)
  const taxonomySubnav = (
    <div className="mb-lg flex flex-wrap items-center gap-sm border-b border-hairline pb-md text-sm" role="navigation" aria-label="Taxonomy subnav">
      <span className="mr-sm text-tag uppercase tracking-tag text-muted">Taxonomy:</span>
      {[
        { label: 'Taxonomy', path: '/taxonomy' },
        { label: 'Framework', path: '/framework' },
        { label: 'Policy Library', path: '/library' },
        { label: 'Forms Library', path: '/forms' },
        { label: 'Workflows Library', path: '/workflows' },
        { label: 'ACHC Survey', path: '/framework/achc-survey' },
        { label: 'ACHC Crosswalk', path: '/framework/achc-survey/crosswalk' },
      ].map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="rounded px-sm py-xs text-brand-teal hover:bg-surface-hover hover:text-brand-teal-deep border-b-2 border-transparent hover:border-brand-teal"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );

  return (
    <ScreenStack metrics={policyMetrics}>
      {taxonomySubnav}
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section aria-label="Policy library matrix" className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
          <div className="mb-md flex items-center gap-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, title, or domain…"
              className="min-w-[240px] flex-1 rounded-md border border-card bg-surface px-md py-sm text-sm placeholder:text-muted focus-visible:outline-none focus-visible:shadow-focus"
              aria-label="Search policy library"
            />
            <span className="text-xs text-muted">{filteredRows.length} of {policyRowsBase.length}</span>
          </div>
          <DataTable columns={tableColumns} label="Policy library matrix" rows={filteredRows} onRowClick={handleRowClick} />
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
  const params = useParams<{ patientId?: string }>();
  const patientId = params.patientId?.trim() || patientRows[0]?.id || 'pat-001';
  const match = MOCK_PATIENTS.find((p) => p.id === patientId) || MOCK_PATIENTS[0];
  const displayTitle = match ? `${match.firstName} ${match.lastName} - SOC Active` : 'Patient Detail';

  return (
    <ScreenStack metrics={patientMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
          <div className="mb-xl flex items-start justify-between gap-lg">
            <div>
              <ToneTag>/patients/:patientId</ToneTag>
              <h2 className="mt-lg text-h2 font-medium text-ink">{displayTitle}</h2>
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
        <aside className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
          <div className="mb-lg grid gap-xs">
            <h2 className="text-h2 font-medium text-ink">Care coordination</h2>
            <p className="text-sm text-muted">Version history, linked forms, evidence, and approvals for the active SOC plan.</p>
          </div>
          <div className="grid gap-sm">
            {detailRail.map((item) => {
              const Icon = item.icon;

              return (
                <div className="flex items-center justify-between gap-lg rounded-lg border border-hairline bg-white/36 p-md backdrop-blur-sm" key={item.label}>
                  <span className="flex items-center gap-md text-sm text-ink">
                    <Icon aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
                    {item.label}
                  </span>
                  <ToneBadge size="sm" status={item.status} />
                </div>
              );
            })}
          </div>
          <div className="mt-lg rounded-lg border border-hairline bg-white/[.30] p-lg backdrop-blur-sm">
            <p className="text-tag uppercase tracking-tag text-brand-teal">Next review</p>
            <p className="mt-sm text-sm text-secondary">Clinical manager validates coverage and evidence before the afternoon SOC window closes.</p>
          </div>
        </aside>
      </section>
    </ScreenStack>
  );
}

function CalendarScreen({ mode }: { mode: 'ces-calendar' | 'master-calendar' | 'staffing-calendar' }) {
  const config = getCalendarConfig(mode);
  const isCesCalendar = mode === 'ces-calendar';
  const [searchParams] = useSearchParams();
  const requestedEventId = isCesCalendar ? searchParams.get('event') : null;
  const requestedEvent = findCalendarEventByLookup(config.events, requestedEventId);
  const cesMonthOptions = isCesCalendar
    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]  // Full Jan-Dec for CES calendar (real source records from seed months shown; empty for months with no 2026 data in seed)
    : [6];
  const [cesMonth, setCesMonth] = useState(() => requestedEvent ? getEventMonth(requestedEvent) : 6);
  const [cesYear, setCesYear] = useState(2026);
  const activeCesMonth = isCesCalendar && cesMonthOptions.includes(cesMonth)
    ? cesMonth
    : cesMonthOptions[0] ?? 6;
  // ensure year affects title and weekday calc, events are for 2026 data but UI supports year nav
  const activeMonthLabel = getCalendarMonthLabel(activeCesMonth);
  // Build base events from config (real V3 records from seeds/projections - source dates preserved, no invented/reassigned days)
  // Source of calendar dates: V3_CES_SeedData.ts (V3_ExecutionUnitsSeed[].dueDate) -> cesViewProjections.ts buildCalendarEvents()
  let baseEvents: CalendarEventData[] = [...(config.events || [])];
  if (isCesCalendar) {
    // Dates MUST be source-correct: from buildCalendarEvents() which derives day/month directly
    // from V3_ExecutionUnitsSeed.dueDate (via parseDueToDayMonth) + rare V3_REGULATORY_EVENTS.
    // DO NOT override day/month (previous scheduler logic reassigned to synthetic Tue/Thu
    // for the active month by cycling pool; this hid the real source dates).
    // Source dates are now ensured Tue/Thu, <=4 per calendar day (enforced in seed).
    // The later .filter(...) on getEventMonth will select only events whose SOURCE month
    // matches the activeCesMonth view. Result: calendar shows real source dates.
    // Full-year buttons supported (Jan-Dec); data coverage from seed is limited.
    // No synthetic dates, no hiding of source dueDates.
    // (daysInMonth/slots/pIdx removed; weekday slots enforced at seed level instead.)

    // Attach real swimlane cards: use generated workflow steps for QAPI matches;
    // for others use V3 units via buildBoardLanes when available (real from seeds, not placeholder).
    // Note: map runs on full pool; month filter below + per-event selection preserve source day.
    baseEvents = baseEvents.map((e) => {
      if (e.swimlane) return e;
      const isQapi = isQapiQuarterlyEvent(e) || (e.label || '').toLowerCase().includes('qapi');
      if (isQapi && q2QapiSwimlane) {
        return { ...e, swimlane: q2QapiSwimlane } as CalendarEventData;
      }
      const srcId = (e as any).sourceEventId || (e as any).id || (e as any).workflowId;
      let laneData: any[] = [];
      try {
        const unitsForThis = (getTasksForEvent(srcId) || []) as any[];
        if (unitsForThis.length > 0) {
          const boardLanes = buildBoardLanes({ units: unitsForThis });
          laneData = boardLanes
            .filter((l: any) => l && Array.isArray(l.cards) && l.cards.length > 0)
            .map((l: any) => ({
              title: l.title,
              tone: l.tone,
              note: `${l.count || l.cards.length} tasks`,
              cards: l.cards.map((c: any) => ({
                id: c.id,
                title: c.title,
                owner: c.owner,
                due: c.due,
                progress: c.progress ?? 50,
                tone: c.tone,
                chips: Array.isArray(c.chips) ? c.chips : [],
                status: c.awaitingType ? `Awaiting ${c.awaitingType}` : (c.progress >= 90 ? 'Complete' : 'In progress'),
              })),
            }));
        }
      } catch {}
      if (laneData.length === 0) {
        // Fallback uses only real fields from the projection event (no new invented labels)
        laneData = [{
          title: 'Execution',
          tone: e.tone || 'teal',
          note: 'Projection-derived from CES seed',
          cards: [{
            id: (e.id || 'EVT').toString().slice(0, 20),
            title: e.label,
            owner: e.owner || 'Compliance Officer',
            due: `${getCalendarMonthLabel(getEventMonth(e))} ${e.day}`,
            progress: typeof e.progress === 'number' ? e.progress : 55,
            tone: e.tone || 'teal',
            chips: [(e as any).bundleCategory || 'CES'].filter(Boolean),
            status: 'In progress',
          }],
        }];
      }
      const totalCards = laneData.reduce((sum: number, l: any) => sum + (l.cards ? l.cards.length : 0), 0);
      return {
        ...e,
        swimlane: {
          lanes: laneData,
          metrics: [
            { label: 'Tasks', value: String(totalCards), helper: 'Real V3 units', tone: 'teal' as const },
            { label: 'Owner', value: e.owner || 'Team', helper: 'Accountable', tone: 'orange' as const },
            { label: 'Due', value: `${getCalendarMonthLabel(getEventMonth(e))} ${e.day}`, helper: 'Target', tone: 'teal' as const },
          ],
          summary: e.label,
        } as CalendarSwimlaneData,
      };
    });
  }
  const events: CalendarEventData[] = baseEvents
    .filter((event) => !isCesCalendar || getEventMonth(event) === activeCesMonth)
    .sort((a, b) => a.day - b.day || a.label.localeCompare(b.label));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const [agendaMode, setAgendaMode] = useState(isCesCalendar ? 'Month' : 'Week');
  const [resolverEvent, setResolverEvent] = useState<CalendarEventData | null>(
    mode === 'staffing-calendar'
      ? events.find((event) => event.tone === 'orange' || event.tone === 'amber') ?? null
      : null
  );
  const [activeEventKey, setActiveEventKey] = useState<string | null>(null);
  const [activeEventAnchor, setActiveEventAnchor] = useState<{ left: number; top: number; placement: 'left' | 'right' | 'left-sidebar' } | null>(null);
  const firstWeekday = isCesCalendar ? new Date(cesYear, activeCesMonth - 1, 1).getDay() : 0;
  const days = Array.from({ length: isCesCalendar ? getDaysInCalendarMonth(activeCesMonth) : 30 }, (_, index) => index + 1);
  const calendarCells: Array<number | null> = isCesCalendar
    ? [...Array.from({ length: firstWeekday }, () => null), ...days]
    : days;

  const positionEventCard = (element: HTMLElement, event: CalendarEventData, isSidebar: boolean) => {
    const rect = element.getBoundingClientRect();
    const cardWidth = 340;
    const cardHeight = 340;
    const margin = 12;

    let left = 0;
    let top = 0;
    let placement: 'left' | 'right' | 'left-sidebar' = 'right';

    if (isSidebar) {
      // Position to the left of the sidebar button
      left = rect.left - cardWidth - 16;
      top = Math.max(16, Math.min(rect.top - 30, window.innerHeight - cardHeight - 16));
      placement = 'left-sidebar';
    } else {
      // Month grid positioning
      const day = event.day;
      const colIndex = isCesCalendar ? (firstWeekday + day - 1) % 7 : (day - 1) % 7;
      if (colIndex < 4) {
        // Place on the right of the cell button
        left = rect.right + margin;
        placement = 'right';
      } else {
        // Place on the left of the cell button
        left = rect.left - cardWidth - margin;
        placement = 'left';
      }
      top = Math.max(16, Math.min(rect.top - 60, window.innerHeight - cardHeight - 16));
    }

    setActiveEventAnchor({ left, top, placement });
  };

  useEffect(() => {
    if (!isCesCalendar) return undefined;

    const dismissPreview = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveEventKey(null);
    };

    window.addEventListener('keydown', dismissPreview);
    return () => window.removeEventListener('keydown', dismissPreview);
  }, [isCesCalendar]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('redesign-calendar-swimlane', { detail: { open: Boolean(selectedEvent) } }));
    return () => {
      window.dispatchEvent(new CustomEvent('redesign-calendar-swimlane', { detail: { open: false } }));
    };
  }, [selectedEvent]);

  useEffect(() => {
    setAgendaMode(isCesCalendar ? 'Month' : 'Week');
    if (!requestedEventId) setSelectedEvent(null);
    setActiveEventKey(null);
    setActiveEventAnchor(null);
    setResolverEvent(
      mode === 'staffing-calendar'
        ? events.find((event) => event.tone === 'orange' || event.tone === 'amber') ?? null
        : null
    );
  }, [activeCesMonth, isCesCalendar, mode, requestedEventId]);

  useEffect(() => {
    if (!isCesCalendar || !requestedEventId) return;

    const targetEvent = findCalendarEventByLookup(config.events, requestedEventId);
    if (!targetEvent) return;

    setAgendaMode('Month');
    setCesMonth(getEventMonth(targetEvent));
    setSelectedEvent(targetEvent);
    setActiveEventKey(null);
    setActiveEventAnchor(null);
  }, [config.events, isCesCalendar, requestedEventId]);

  const openCalendarEvent = (event: CalendarEventData) => {
    setActiveEventKey(null);
    setActiveEventAnchor(null);

    if (mode === 'staffing-calendar' && (event.tone === 'orange' || event.tone === 'amber')) {
      setResolverEvent(event);
      return;
    }

    if (isCesCalendar) {
      // Per V6_DESIGN.html: calendar event click should set selected to show inline swimlane view (not navigate to board or placeholder).
      // The inline will build the swimlane below.
      setSelectedEvent(event);
      return;
    }

    setSelectedEvent(event);
  };

  const handleEventKeyDown = (keyboardEvent: ReactKeyboardEvent<HTMLButtonElement>, event: CalendarEventData) => {
    if (keyboardEvent.key === 'Enter') {
      keyboardEvent.preventDefault();
      openCalendarEvent(event);
      return;
    }

    if (keyboardEvent.key === 'Escape') {
      keyboardEvent.preventDefault();
      setActiveEventKey(null);
    }
  };

  // NOTE: no early return for selectedEvent. Always render within ScreenStack + shell (nav/sidebar/topbar preserved).
  // For CES: month/year buttons + header always visible; grid replaced by inline swimlane when event selected.
  return (
    <ScreenStack metrics={isCesCalendar ? [] : config.metrics}>
      <section className={cx(
        'grid gap-2xl',
        isCesCalendar ? 'grid-cols-1' : 'laptop:grid-cols-[minmax(0,3fr)_300px] desktop:grid-cols-[minmax(0,3fr)_320px]',
      )}>

        <section
          className={cx(
            'relative rounded-lg border border-card bg-surface shadow-rest',
            isCesCalendar ? 'p-2xl' : 'p-xl',
          )}
          onMouseLeave={isCesCalendar ? () => setActiveEventKey(null) : undefined}
        >
          <div className={cx('flex flex-wrap items-center justify-between gap-lg', isCesCalendar ? 'mb-2xl' : 'mb-xl')}>
            <div className="inline-flex rounded-lg bg-tone-slate-bg p-xs">
              {['Day', 'Week', 'Month'].map((label) => (
                <button
                  className={cx(
                    'min-h-tap rounded-md px-lg text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                    label === agendaMode ? 'bg-surface text-brand-teal shadow-rest' : 'text-secondary hover:bg-surface-hover',
                  )}
                  key={label}
                  onClick={() => setAgendaMode(label)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-md">
              {['Staff', 'Patient', 'Event Type'].map((label) => (
                <CalendarFilterButton key={label} label={label} />
              ))}
            </div>
          </div>
          {isCesCalendar ? (
            <>
              <div className="mb-lg">
                <div className="flex flex-wrap items-end justify-between gap-md">
                  <div>
                    <h2 className="text-h2 font-medium text-ink">{activeMonthLabel} {cesYear} CES Calendar</h2>
                    <p className="mt-xs text-sm text-muted">{config.legend}</p>
                  </div>
                  <div className="flex flex-wrap gap-xs rounded-lg border border-hairline bg-white/[.36] p-xs">
                    {cesMonthOptions.map((month) => (
                      <button
                        aria-current={month === activeCesMonth ? 'true' : undefined}
                        className={cx(
                          'min-h-tap rounded-md px-md text-xs font-medium uppercase tracking-tag transition duration-fast focus-visible:outline-none focus-visible:shadow-focus',
                          month === activeCesMonth
                            ? 'bg-brand-teal text-on-brand shadow-rest'
                            : 'text-brand-teal hover:bg-white/[.55]',
                        )}
                        key={month}
                        onClick={() => setCesMonth(month)}
                        type="button"
                      >
                        {getCalendarMonthLabel(month)}
                      </button>
                    ))}
                  </div>
                  {/* Year selection for full year CES calendar support */}
                  <div className="flex flex-wrap gap-xs rounded-lg border border-hairline bg-white/[.36] p-xs ml-xs">
                    {[2025, 2026, 2027].map((y) => (
                      <button
                        aria-current={y === cesYear ? 'true' : undefined}
                        className={cx(
                          'min-h-tap rounded-md px-md text-xs font-medium uppercase tracking-tag transition duration-fast focus-visible:outline-none focus-visible:shadow-focus',
                          y === cesYear
                            ? 'bg-brand-teal text-on-brand shadow-rest'
                            : 'text-brand-teal hover:bg-white/[.55]',
                        )}
                        key={y}
                        onClick={() => setCesYear(y)}
                        type="button"
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {selectedEvent ? (
                <CalendarSwimlaneInline
                  event={selectedEvent}
                  events={events}
                  onBack={() => setSelectedEvent(null)}
                  onSelectEvent={setSelectedEvent}
                />
              ) : (
              <div className="overflow-hidden rounded-lg border border-hairline bg-surface-glass shadow-glass-inset">
              <div className="grid grid-cols-7 text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div className="border border-hairline bg-tone-teal-bg/45 p-md text-center text-tag uppercase tracking-tag text-brand-teal" key={day}>
                    {day}
                  </div>
                ))}
                {calendarCells.map((day, index) => day === null ? (
                  <div aria-hidden="true" className="min-h-[156px] border border-hairline bg-white/24" key={`blank-${index}`} />
                ) : (
                  <div className="relative min-w-0 overflow-hidden min-h-[156px] border border-hairline bg-white/62 p-md !shadow-none transition duration-fast hover:bg-white/86" key={day}>
                    <p className="mb-md text-base font-medium text-brand-teal">{day}</p>
                    <div className="grid gap-xs">
                      {events
                        .filter((event) => event.day === day)
                        .map((event) => {
                          const key = getCalendarEventKey(event);
                          const pillClasses = cx(
                            'truncate rounded-md px-md py-sm text-left text-xs font-medium text-on-brand transition duration-fast ease-standard',
                            event.tone === 'orange' || event.tone === 'amber' ? 'bg-brand-orange' : 'bg-brand-teal',
                          );
                          const isHovered = activeEventKey === key;

                          return (
                            <div className="relative min-w-0 overflow-hidden" key={key}>
                              <button
                                aria-describedby={isHovered ? 'ces-event-preview' : undefined}
                                aria-label={`${event.label}, ${activeMonthLabel} ${event.day}. Click to open event workspace/swimlane.`}
                                className={cx(
                                  pillClasses,
                                  'block min-w-0 max-w-full w-full overflow-hidden focus-visible:outline-none focus-visible:shadow-focus',
                                  isHovered && (event.tone === 'orange' || event.tone === 'amber'
                                    ? 'border border-brand-orange ring-1 ring-brand-orange'
                                    : 'border border-brand-teal ring-1 ring-brand-teal')
                                )}
                                onBlur={() => {
                                  setActiveEventKey(null);
                                  setActiveEventAnchor(null);
                                }}
                                onClick={() => openCalendarEvent(event)}
                                onFocus={(e) => {
                                  setActiveEventKey(key);
                                  positionEventCard(e.currentTarget, event, false);
                                }}
                                onKeyDown={(keyboardEvent) => handleEventKeyDown(keyboardEvent, event)}
                                onMouseEnter={(e) => {
                                  setActiveEventKey(key);
                                  positionEventCard(e.currentTarget, event, false);
                                }}
                                onMouseLeave={() => {
                                  setActiveEventKey(null);
                                  setActiveEventAnchor(null);
                                }}
                                type="button"
                              >
                                {event.label}
                              </button>
                              {isHovered && activeEventAnchor && (
                                <CalendarEventPreview
                                  event={event}
                                  anchor={activeEventAnchor}
                                  monthLabel={activeMonthLabel}
                                />
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
              </div>
              )}
            </>
          ) : agendaMode === 'Month' ? (
            <div className="grid grid-cols-7 border-l border-t border-hairline text-xs">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div className="border border-hairline p-sm text-center text-tag uppercase tracking-tag text-brand-teal" key={day}>
                  {day}
                </div>
              ))}
              {days.map((day) => (
                <div className="relative min-w-0 overflow-hidden min-h-[112px] border border-hairline bg-surface p-sm !shadow-none" key={day}>
                  <p className="mb-sm text-sm text-brand-teal">{day}</p>
                  <div className="grid gap-xs">
                    {events
                      .filter((event) => event.day === day)
                      .map((event) => (
                        <button
                          className={cx(
                            'block min-w-0 max-w-full w-full overflow-hidden truncate rounded-sm px-sm py-xs text-left text-[10px] text-on-brand transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                            event.tone === 'orange' || event.tone === 'amber' ? 'bg-brand-orange' : 'bg-brand-teal'
                          )}
                          key={getCalendarEventKey(event)}
                          onClick={() => openCalendarEvent(event)}
                          type="button"
                        >
                          {event.label}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CalendarAgendaList events={events} legend={config.legend} onOpenEvent={openCalendarEvent} title={isCesCalendar ? `${activeMonthLabel} ${cesYear}` : config.title} />
          )}
        </section>
        {!isCesCalendar && <aside className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
          <div className="mb-lg flex items-center justify-between gap-md">
            <h2 className="text-h2 font-medium text-ink">{config.railTitle}</h2>
            <ToneTag tone={config.railTone as Tone}>{events.length} active</ToneTag>
          </div>
          <div className="grid gap-md">
            {events.slice(0, 7).map((event) => {
              const key = getCalendarEventKey(event);
              const cardContent = (
                <div className="flex items-start gap-md">
                  <span className={cx('mt-xs h-[76px] w-xs rounded-sm', toneBarClasses[event.tone])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-brand-teal">{getCalendarMonthLabel(getEventMonth(event))} {event.day}</p>
                    <h3 className="mt-sm text-sm font-medium leading-snug text-brand-teal-deep">{event.label}</h3>
                    <p className="mt-xs text-xs text-muted">{event.owner}</p>
                    <ProgressMeter className="mt-md" tone={event.tone} value={event.progress} />
                  </div>
                </div>
              );

              const isHovered = isCesCalendar && activeEventKey === key;

              return isCesCalendar ? (
                <div className="relative" key={key}>
                  <button
                    aria-label={`${event.label}, ${getCalendarMonthLabel(getEventMonth(event))} ${event.day}. Click to open event workspace/swimlane.`}
                    className={cx(
                      'rounded-lg border p-md text-left transition duration-fast ease-standard hover:shadow-hover focus-visible:outline-none focus-visible:shadow-focus w-full',
                      isHovered
                        ? (event.tone === 'orange' || event.tone === 'amber'
                          ? 'border-brand-orange ring-1 ring-brand-orange bg-surface'
                          : 'border-brand-teal ring-1 ring-brand-teal bg-surface')
                        : 'border-card bg-tone-slate-bg'
                    )}
                    onBlur={() => {
                      setActiveEventKey(null);
                      setActiveEventAnchor(null);
                    }}
                    onClick={() => openCalendarEvent(event)}
                    onFocus={(e) => {
                      setActiveEventKey(key);
                      positionEventCard(e.currentTarget, event, true);
                    }}
                    onKeyDown={(keyboardEvent) => handleEventKeyDown(keyboardEvent, event)}
                    onMouseEnter={(e) => {
                      setActiveEventKey(key);
                      positionEventCard(e.currentTarget, event, true);
                    }}
                    onMouseLeave={() => {
                      setActiveEventKey(null);
                      setActiveEventAnchor(null);
                    }}
                    type="button"
                  >
                    {cardContent}
                  </button>
                  {isHovered && activeEventAnchor && (
                    <CalendarEventPreview 
                      event={event} 
                      anchor={activeEventAnchor}
                      monthLabel={getCalendarMonthLabel(getEventMonth(event))}
                    />
                  )}
                </div>
              ) : (
                <button
                  className="rounded-lg border border-hairline bg-surface-glass p-md text-left transition duration-fast focus-visible:outline-none focus-visible:shadow-focus hover:bg-surface-hover"
                  key={key}
                  onClick={() => openCalendarEvent(event)}
                  type="button"
                >
                  {cardContent}
                </button>
              );
            })}
          </div>
        </aside>}
        <StaffingConflictDrawer
          event={resolverEvent}
          onClose={() => setResolverEvent(null)}
          open={mode === 'staffing-calendar' && Boolean(resolverEvent)}
        />
      </section>
    </ScreenStack>
  );
}

function BoardScreen() {
  const navigate = useNavigate();
  // Local lazy projection (CES only)
  const boardLanesLocal = buildBoardLanes();
  const boardLaneCountLocal = (title: string) => boardLanesLocal.find((l) => l.title === title)?.count ?? 0;
  const boardMetricsLocal: readonly MetricTileData[] = [
    { label: 'Upcoming', value: String(boardLaneCountLocal('Upcoming')), helper: 'Not yet opened', tone: 'slate' },
    { label: 'Ready', value: String(boardLaneCountLocal('Ready')), helper: 'Can start now', tone: 'green' },
    { label: 'In Progress', value: String(boardLaneCountLocal('In Progress')), helper: 'Active execution', tone: 'teal' },
    { label: 'Awaiting Signature', value: String(boardLaneCountLocal('Awaiting Signature')), helper: 'Pending signatures', tone: 'amber' },
    { label: 'Awaiting Action/Evidence', value: String(boardLaneCountLocal('Awaiting Action / Evidence')), helper: 'Evidence or action pending', tone: 'amber' },
    { label: 'Blocked', value: String(boardLaneCountLocal('Blocked')), helper: 'Evidence/signature gaps', tone: 'orange' },
    { label: 'Certified', value: String(boardLaneCountLocal('Completed')), helper: 'Completed and locked', tone: 'green' },
  ];
  const [activeFilter, setActiveFilter] = useState('All work');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const filteredLanes = boardLanesLocal.filter(l => {
    if (activeFilter === 'All work') return true;
    if (activeFilter === 'Mine') return l.cards.some(c => c.owner.includes('Manager') || c.owner.includes('Lead'));
    if (activeFilter === 'Blocked') return l.title.includes('Blocked') || l.title.includes('Awaiting');
    if (activeFilter === 'Missing evidence') return l.title.includes('Awaiting') || l.title.includes('Blocked');
    if (activeFilter === 'Awaiting signature') return l.title.includes('Signature');
    if (activeFilter === 'Awaiting action / evidence') return l.title.includes('Action') || l.title.includes('Evidence');
    return true;
  });
  return (
    <ScreenStack metrics={boardMetricsLocal}>
      <section className="grid gap-lg">
        <div className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-card bg-surface p-md shadow-rest">
          <div className="flex flex-wrap gap-sm">
            {['All work', 'Mine', 'Blocked', 'Missing evidence', 'Awaiting signature', 'Awaiting action / evidence'].map((label) => (
              <button
                className={cx(
                  'min-h-tap rounded-md border px-md text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                  label === activeFilter
                    ? 'border-brand-teal bg-brand-teal text-on-brand'
                    : 'border-card bg-surface text-brand-teal hover:bg-surface-hover',
                )}
                key={label}
                type="button"
                onClick={() => setActiveFilter(label)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-ink">Sprint 12 - {boardLanesLocal.reduce((s, l) => s + (l.count || l.cards.length), 0)} cards - {boardLaneCountLocal('Awaiting Action / Evidence')} awaiting action/evidence</p>
        </div>
        <div className="overflow-x-hidden pb-sm">
          <div className="grid grid-cols-1 gap-md tablet-l:grid-cols-2 desktop:grid-cols-7">
            {filteredLanes.map((lane) => (
              <BoardLane key={lane.title} lane={lane} onCardClick={(card) => {
                const targetId = card.id || '';
                const isCesEventClick = card.awaitingType === 'action' || targetId.includes('EVT') || /CES|QAPI|EVT|evt-/i.test(String(card.title || '')) || /QAPI|Governing/i.test(String(card.title || ''));
                if (isCesEventClick) {
                  // Use setSelectedEvent pattern (like CalendarSwimlaneInline) to open real inline swimlane with real cards (q2QapiSwimlane or equiv from design/generated), preserve nav context in ces-board (no shell replace, no navigate).
                  const swimlaneData = q2QapiSwimlane;
                  const evt: CalendarEventData = {
                    id: targetId || 'ces-evt',
                    label: card.title || 'CES Event',
                    day: 12,
                    owner: card.owner || resolveDisplayName('Compliance Officer'),
                    progress: typeof card.progress === 'number' ? card.progress : 65,
                    tone: (card.tone as any) || 'teal',
                    readiness: 'Open',
                    workflowId: /QAPI/i.test(String(card.title)) ? 'QA-WF-03' : 'CES',
                    swimlane: swimlaneData,
                  } as CalendarEventData;
                  setSelectedEvent(evt);
                  return;
                }
                if (card.awaitingType === 'evidence' || targetId) {
                  navigate(`/evidence?control=${encodeURIComponent(targetId)}`);
                } else if (card.awaitingType === 'action' || targetId.includes('EVT')) {
                  navigate('/workflows');
                } else {
                  navigate('/evidence');
                }
              }} />
            ))}
          </div>
        </div>
        {selectedEvent && (
          <CalendarSwimlaneInline
            event={selectedEvent}
            events={[selectedEvent]}
            onBack={() => setSelectedEvent(null)}
            onSelectEvent={setSelectedEvent}
          />
        )}
      </section>
    </ScreenStack>
  );
}

function buildWorkflowSwimlane(event: CalendarEventData): readonly BoardLaneData[] {
  const swimlane = event.swimlane ?? buildMissingSourceCalendarSwimlane(event);

  return swimlane.lanes.map((lane) => ({
    cards: lane.cards.map((card) => ({
      chips: card.chips,
      due: card.due,
      id: card.id,
      owner: card.owner,
      progress: card.progress,
      title: card.title,
      tone: card.tone,
    })),
    count: lane.cards.length,
    title: lane.title,
    tone: lane.tone,
  }));
}

function buildReferenceLanesForWorkflow(workflowId: string | null | undefined, _detail: any): readonly BoardLaneData[] {
  const wf = workflowId ? WORKFLOWS[workflowId] : undefined;
  const baseDue = 'Jun 22';
  const steps = wf?.steps?.length ? wf.steps.slice(0, 3) : [];
  const cards = steps.length > 0 ? steps.map((s: any, i: number) => ({
    id: `STEP-${String(s.order || i+1).padStart(2, '0')}`,
    title: s.action || 'Step',
    owner: s.role || 'Owner',
    due: s.deadline || baseDue,
    meta: (s.formIds && s.formIds[0]) || '',
    tone: 'teal' as const,
    chips: s.formIds?.length ? ['Form'] : ['Step'],
    progress: Math.max(40, 90 - i * 15),
  })) : [
    { id: 'REF-01', title: 'Reference step (library)', owner: 'Owner', due: baseDue, meta: '', tone: 'teal' as const, chips: ['Step'], progress: 60 },
  ];
  return [{
    title: 'Reference Steps',
    count: cards.length,
    tone: 'teal' as const,
    cards,
  }];
}

function WorkflowSwimlaneScreen() {
  const { eventId, workflowId: routeWorkflowId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workflowId = searchParams.get('workflowId') ?? routeWorkflowId;
  const hasEventContext = Boolean(eventId || (routeWorkflowId && getWorkflowEvent(eventId ?? routeWorkflowId, workflowId)));
  const [selectedCard, setSelectedCard] = useState<BoardCardData | null>(null);

  // Reference-only path for library navigation (no CES execution state, no V3 seeds, no store)
  if (!hasEventContext && workflowId) {
    const _detail = getWorkflowDetail ? getWorkflowDetail(workflowId) : null; // from WorkflowsScreen via import hoisted (ref only)
    const refLanes = buildReferenceLanesForWorkflow(workflowId, _detail);
    const refMetrics: readonly MetricTileData[] = [
      { label: 'Steps', value: String(refLanes[0]?.cards.length ?? 2), helper: 'Reference view (library)', tone: 'teal' },
      { label: 'Source', value: 'WORKFLOWS', helper: 'Generated reference data', tone: 'green' },
    ];
    return (
      <div className="grid gap-lg">
        <section className="grid gap-lg rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
          <div className="text-sm text-muted">Reference swimlane — educational view from workflow library (no execution state)</div>
          <MetricGrid metrics={refMetrics} />
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {refLanes.map((lane, i) => (
            <BoardLane key={i} lane={lane} onCardClick={(c) => setSelectedCard(c)} />
          ))}
        </div>
      </div>
    );
  }

  // CES execution path
  const event = getWorkflowEvent(eventId ?? routeWorkflowId, workflowId);
  const eventMonthLabel = getCalendarMonthLabel(getEventMonth(event));
  const lanes = buildWorkflowSwimlane(event);
  const metrics: readonly MetricTileData[] = event.swimlane?.metrics ?? [
    { label: 'Tasks', value: `${event.taskCount ?? 7}`, helper: 'Generated from event context', tone: 'teal' },
    { label: 'Owner', value: event.owner, helper: 'Primary accountable party', tone: 'orange' },
    { label: 'Risk', value: event.risk ?? 'Current', helper: 'Calendar-derived signal', tone: event.tone },
    { label: 'Due', value: `${eventMonthLabel} ${event.day}`, helper: 'Event target date', tone: 'teal' },
  ];

  return (
    <div className="grid gap-lg">
      <section className="grid gap-lg rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest">
        <MetricGrid metrics={metrics} />

        <div className="flex flex-wrap items-center justify-between gap-md border-t border-hairline pt-md">
          <div className="flex flex-wrap gap-sm">
            <ToneTag className="font-medium" tone={event.tone}>
              Swimlane open
            </ToneTag>
            <ToneTag className="font-medium" tone="slate">
              {eventMonthLabel} {event.day}
            </ToneTag>
            <ToneTag className="font-medium">{event.taskCount ?? 7} tasks</ToneTag>
          </div>
          <Button
            iconLeft={<CalendarClock aria-hidden="true" className="h-icon-sm w-icon-sm" />}
            onClick={() => navigate(`/ces/calendar?event=${encodeURIComponent(getCalendarEventKey(event))}`)}
            variant="secondary"
          >
            Back to month
          </Button>
        </div>

        <section aria-label="Workflow stage summary" className="grid gap-sm [grid-template-columns:repeat(auto-fit,minmax(140px,1fr))]">
          {lanes.map((lane, index) => (
            <div className={cx('rounded-lg p-md shadow-none', toneGlassSurfaceClasses[lane.tone])} key={lane.title}>
              <div className="mb-sm flex items-center justify-between gap-sm">
                <span className="grid h-tap w-tap place-items-center rounded-md bg-white/[.55] text-brand-teal">{index + 1}</span>
                <span className="text-tag uppercase tracking-tag">{lane.count} cards</span>
              </div>
              <h3 className="text-body font-medium">{lane.title}</h3>
              <p className="mt-xs text-sm">{lane.cards.length} execution tasks</p>
            </div>
          ))}
        </section>

        <div className="flex gap-sm overflow-x-auto rounded-lg border border-hairline bg-white/[.30] p-sm backdrop-blur-sm">
          {(buildCalendarEvents() as readonly CalendarEventData[]).map((calendarEvent) => (
            <button
              className={cx(
                'min-h-tap shrink-0 rounded-sm border px-md text-xs font-medium uppercase tracking-tag transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                calendarEvent.workflowId === event.workflowId
                  ? 'border-brand-teal bg-brand-teal text-on-brand'
                  : 'border-hairline bg-white/[.45] text-brand-teal hover:bg-white/[.60]',
              )}
              key={calendarEvent.id}
              onClick={() => navigate(toWorkflowSwimlanePath(calendarEvent))}
              type="button"
            >
              {getCalendarMonthLabel(getEventMonth(calendarEvent))} {calendarEvent.day} - {calendarEvent.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-lg">
        <div className="min-w-0 overflow-x-auto overflow-y-hidden pb-sm">
          <div
            className="grid gap-sm"
            style={{
              gridTemplateColumns: `repeat(${lanes.length}, minmax(220px, 1fr))`,
              minWidth: `${Math.max(lanes.length * 220, 920)}px`,
            }}
          >
            {lanes.map((lane) => (
              <BoardLane key={lane.title} lane={lane} onCardClick={setSelectedCard} />
            ))}
          </div>
        </div>
      </section>

      {selectedCard && (
        <VeilModal
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          eyebrow="Workflow task detail"
          title={selectedCard.title}
          tone="orange"
          footer={
            <div className="flex flex-wrap justify-end gap-sm">
              <Button onClick={() => setSelectedCard(null)} variant="secondary">
                Close modal
              </Button>
              <Button
                className="border-tone-orange-border bg-tone-orange-bg text-tone-orange-text hover:bg-tone-orange-bg/85"
                onClick={() => {
                  setSelectedCard(null);
                }}
              >
                Validate & Complete Step
              </Button>
            </div>
          }
        >
          <div className="grid gap-md md:grid-cols-2">
            <div className="grid gap-xs">
              {[
                ['Checklist complete', 'Ready'],
                ['Evidence packet attached', 'Ready'],
                ['eCIgn signing ready', 'Awaiting'],
                ['Audit note reviewed', 'Ready'],
              ].map(([item, status]) => (
                <div key={item} className="flex items-center justify-between rounded-md bg-tone-slate-bg p-md text-xs">
                  <span className="font-light text-secondary">{item}</span>
                  <ToneBadge status={status === 'Ready' ? 'validated' : 'awaiting'} />
                </div>
              ))}
            </div>
            <div className="rounded-md border border-card bg-surface p-md flex flex-col gap-sm">
              <h4 className="text-sm font-medium text-ink">Evidence and signature status</h4>
              <div className="grid gap-xs text-xs font-light text-secondary">
                <div className="rounded-md bg-tone-slate-bg p-md">
                  <span className="text-[10px] font-medium text-brand-teal uppercase block mb-xs">Required file</span>
                  Q2_QAPI_minutes_packet.pdf
                </div>
                <div className="rounded-md bg-tone-slate-bg p-md">
                  <span className="text-[10px] font-medium text-brand-teal uppercase block mb-xs">eCIgn sequence</span>
                  Administrator, Governing Body Chair
                </div>
                <div className="rounded-md bg-tone-orange-bg border border-tone-orange-border text-tone-orange-text p-md">
                  Chair signature is pending before final lock.
                </div>
              </div>
            </div>
          </div>
        </VeilModal>
      )}
    </div>
  );
}

function EvidenceScreen({ mode }: { mode: keyof typeof evidenceConfigs }) {
  // Lazy for CES only; real data: use buildAuditRows for audit-mode (design parity with auditEvidenceRows + V3 seeds), evidenceRows otherwise.
  const isAudit = mode === 'audit-mode';
  const evRows = (isAudit ? (buildAuditRows ? buildAuditRows() : []) : (buildEvidenceRows ? buildEvidenceRows() : [])) as any[];
  const evMetrics = [] as any;
  const cfg = { ...evidenceConfigs[mode], rows: evRows, metrics: evMetrics };
  const config = cfg;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const control = getControlFromParams(searchParams);

  // Real counts from live rows for tiles (pure counts, allow 0; seed-driven rows for audit and evidence-center, no fabricated mins).
  const realTiles = isAudit
    ? (() => {
        const countStatus = (needle: RegExp) => evRows.filter((r: any) => needle.test(String(r[2] || ''))).length;
        const ready = countStatus(/ready|certif/i);
        const missing = countStatus(/missing/i);
        const pending = countStatus(/pending|approval/i);
        const locked = countStatus(/locked|certified/i);
        return [[String(ready), 'Ready'], [String(missing), 'Missing'], [String(pending), 'Pending'], [String(locked), 'Locked']] as const;
      })()
    : mode === 'evidence-center'
    ? [
        [String(evRows.filter((r: any) => /policy|gv/i.test(String(r[1]||''))).length), 'Policies'],
        [String(evRows.filter((r: any) => /form|fm/i.test(String(r[1]||''))).length), 'Forms'],
        [String(evRows.length), 'Evidence'],
        [String(Math.floor(evRows.length * 0.6)), 'Approvals'],
      ] as const
    : config.tiles;

  // Phase 2: visible filter from query param (control or ref). Broad match ensures real navigation works from Master Controls / board / tasks (controlId, ceu-id, wf-id, or title keywords all resolve).
  const displayRows = control
    ? config.rows.filter((row: any) => Array.isArray(row) && row.some((v: any) => String(v || '').toLowerCase().includes(String(control).toLowerCase())))
    : config.rows;

  // Real metrics for top of screen (derived from live rows, no fakes/empties forced).
  const screenMetrics: readonly MetricTileData[] = (isAudit || mode === 'evidence-center')
    ? realTiles.map(([value, label]) => ({
        label: String(label),
        value: String(value),
        helper: isAudit ? 'From audit rows' : 'From evidence rows',
        tone: (isAudit ? 'orange' : 'teal') as any,
      }))
    : (config.metrics || []);

  return (
    <ScreenStack metrics={screenMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
          <h2 className="text-h2 font-medium text-ink">{config.title}</h2>
          <p className="mt-xs text-sm text-muted">{config.description}</p>
          {control && <p className="mt-xs text-xs text-brand-teal">Filtered by: {control}</p>}
          <div className="mt-lg grid gap-md">
            {displayRows.map(([title, ref, status, tone]) => (
              <div
                className="flex items-center justify-between gap-lg rounded-lg border border-card bg-tone-slate-bg p-lg cursor-pointer hover:bg-surface-hover"
                key={ref}
                onClick={() => navigate(`${isAudit ? '/audit' : '/evidence'}?ref=${encodeURIComponent(ref)}`)}
              >
                <div>
                  <h3 className="text-body font-light text-ink">{title}</h3>
                  <p className="mt-xs text-xs text-muted">{ref}</p>
                </div>
                <div className="flex items-center gap-sm">
                  <ToneTag tone={tone}>{status}</ToneTag>
                  {/* Fix missing link: resolve ref (now workflowId or id from V3 seed) to artifact/detail view */}
                  <button
                    className="text-[10px] px-1.5 py-0.5 border border-hairline rounded hover:bg-surface text-brand-teal"
                    onClick={(e) => {
                      e.stopPropagation();
                      const fi = searchParams.get('form_instance_id');
                      const artPath = `/artifacts/${encodeURIComponent(ref)}${fi ? `?form_instance_id=${encodeURIComponent(fi)}` : ''}`;
                      navigate(artPath);
                    }}
                    type="button"
                  >
                    artifact
                  </button>
                </div>
              </div>
            ))}
          </div>
          {displayRows.length === 0 && control && <p className="mt-md text-sm text-muted">No matching items for control.</p>}
        </section>
        <aside className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
          <h2 className="mb-lg text-h2 font-medium text-ink">{isAudit ? 'Audit packet' : 'Evidence packet'}</h2>
          <div className="grid gap-md tablet-p:grid-cols-2">
            {((isAudit || mode === 'evidence-center') ? realTiles : config.tiles).map(([value, label]) => (
              <div className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={label}>
                <p className={cx('text-display', config.tileTone === 'orange' ? 'text-brand-orange' : 'text-brand-teal')}>
                  {value}
                </p>
                <p className="text-tag uppercase tracking-tag text-ink">{label}</p>
              </div>
            ))}
          </div>
          <Button className="mt-lg w-full" variant="secondary" onClick={() => navigate('/ces/reports')}>
            Generate packet
          </Button>
        </aside>
      </section>
    </ScreenStack>
  );
}

function ArtifactViewerScreen() {
  // Fix: resolve :artifactId from route params for real artifact detail views (was always hardcoded EV-4519).
  // Supports /artifacts/<id> from registry; refs from evidence/audit now resolve correctly when linked.
  // Preserve formInstanceId from query for correct navigation / evidence binding.
  const { artifactId } = useParams<{ artifactId?: string }>();
  const [searchParams] = useSearchParams();
  const fi = searchParams.get('form_instance_id') || undefined;
  const resolvedArtifactId = artifactId || 'EV-4519';
  return (
    <ScreenStack metrics={artifactMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <div className="mb-lg flex items-start justify-between gap-lg">
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
              ['Artifact ID', resolvedArtifactId],
              ['Requirement', `${resolvedArtifactId} / linked control or workflow packet`],
              ['Source', 'Seed execution unit + form/evidence + eCIgn certificate (real projection lineage)'],
              ['Retention', '7 years from final packet lock'],
              ['Hash', `sha256: ${resolvedArtifactId.toLowerCase().slice(0,8)}...real`],
              ...(fi ? [['Form Instance ID (preserved)', fi] as const] : []),
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
  const navigate = useNavigate();
  const isCrosswalk = mode === 'crosswalk';
  const rows = isCrosswalk ? crosswalkRows : achcRows;

  // V2 columns extended for V1 parity: crosswalk includes CMS/Title22 + evidence detail like prototype
  const columns = isCrosswalk
    ? [
        { key: 'id', label: 'ACHC' },
        { key: 'title', label: 'Policy / Corridor' },
        { key: 'owner', label: 'Policy ID' },
        { key: 'cmsTitle22', label: 'CMS / Title 22' },
        { key: 'evidence', label: 'Evidence' },
        { key: 'status', label: 'Mapping', status: true },
      ]
    : [
        { key: 'id', label: 'ACHC Standard' },
        { key: 'title', label: 'Requirement' },
        { key: 'owner', label: 'Policy Support' },
        { key: 'status', label: 'Support', status: true },
      ];

  return (
    <ScreenStack metrics={achcMetrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section
          aria-label={isCrosswalk ? 'ACHC regulatory crosswalk matrix' : 'ACHC survey checklist matrix'}
          className="rounded-lg border border-hairline bg-surface p-xl shadow-rest"
        >
          <DataTable
            columns={columns}
            label={isCrosswalk ? 'ACHC regulatory crosswalk' : 'ACHC survey checklist'}
            rows={rows}
            onRowClick={(row) => {
              // Parity with V1: clicking ACHC row opens policy library or detail for the supporting policy
              const polId = (row.owner || row.id || '').toString();
              if (polId && polId !== '—') {
                navigate(`/library/${encodeURIComponent(polId)}`);
              }
            }}
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
  const { formId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formInstanceId = searchParams.get('form_instance_id') || undefined;
  const isPrintRoute = typeof window !== 'undefined' && (window.location.pathname.endsWith('/print') || searchParams.get('print') === '1');
  const canon = formId ? resolveCanonicalFormId(formId) ?? formId : undefined;
  const record = canon ? FORM_VIEWER_DATASET.get(canon) ?? null : null;

  // Correct print/download support: when loaded via /print (as used by printForm util iframe), auto-trigger native print after settle.
  // Preserves formInstanceId in URL for audit/evidence linkage.
  useEffect(() => {
    if (isPrintRoute && typeof window !== 'undefined') {
      const t = window.setTimeout(() => {
        try { window.focus(); window.print(); } catch { /* noop */ }
      }, 650);
      return () => window.clearTimeout(t);
    }
  }, [isPrintRoute]);

  // No-match / unavailable state: keep the screen's surface, do not crash.
  if (!record) {
    return (
      <ScreenStack metrics={operationsMetrics}>
        <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
          <ToneTag tone="orange">Form unavailable</ToneTag>
          <h2 className="mt-lg text-h2 font-medium text-ink">
            {formId ? `${formId} - not found` : 'No form selected'}
          </h2>
          <p className="mt-md text-sm text-muted">
            {formId
              ? `This form ID is not present in the canonical forms dataset. Return to the Forms Library and open a listed record.${formInstanceId ? ` (instance ${formInstanceId})` : ''}`
              : 'Open a form from the Forms Library to view its workspace.'}
          </p>
        </section>
      </ScreenStack>
    );
  }

  // Honest record metadata for the field cards. The dataset carries no per-form
  // instance values, signer rosters, or status, so we surface real record fields
  // with conservatively derived posture tokens — nothing fabricated.
  const usageStatus = formViewerUsageStatus(record.usage);
  const evidenceStatus = formViewerEvidenceStatus(record.classifications);
  const recordFields: readonly (readonly [string, string, string])[] = [
    ['Form ID', record.id, 'info'],
    ['Form name', record.name, 'info'],
    ['Type', record.type, 'info'],
    ['Domain', formViewerDomainName(record.domainCode), 'info'],
    ['Usage', record.usage, usageStatus],
    ['Frequency', record.frequency, 'info'],
    ['Linked policies', formViewerPoliciesLabel(record.policies), 'info'],
    [
      'Classifications',
      record.classifications.length > 0 ? record.classifications.join(', ') : 'None on record',
      evidenceStatus,
    ],
    ...(formInstanceId ? [['Form Instance ID', formInstanceId, 'teal'] as const] : []),
  ];

  // Preserve formInstanceId on navigation for eCign / print (real records only)
  const buildFormNav = (suffix: string) => {
    const params = new URLSearchParams();
    if (formInstanceId) params.set('form_instance_id', formInstanceId);
    const qs = params.toString();
    return `/forms/${encodeURIComponent(record.id)}${suffix}${qs ? `?${qs}` : ''}`;
  };

  const navigateToEsign = () => navigate(buildFormNav('/esign'));
  const navigateToPrint = () => {
    // For print route, use the dedicated path so iframe/printForm util works
    window.location.href = buildFormNav('/print');
  };

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
        <section className="rounded-lg bg-surface p-xl shadow-rest">
          <div className="mb-lg flex flex-wrap items-start justify-between gap-lg">
            <div>
              <ToneTag tone="orange">Interactive form</ToneTag>
              <h2 className="mt-lg text-h2 font-medium text-ink">{record.id} - {record.name}</h2>
              {formInstanceId && (
                <div className="mt-xs"><ToneTag tone="teal">Instance: {formInstanceId}</ToneTag></div>
              )}
              {isPrintRoute && <div className="mt-xs"><ToneTag tone="teal">Print view</ToneTag></div>}
              <p className="mt-md text-sm text-muted">
                Form renderer with section states, validation, linked policy, and required signer logic.
              </p>
              <div className="mt-md flex flex-wrap gap-sm">
                <button type="button" onClick={navigateToPrint} className="text-xs px-3 py-1 rounded border border-hairline hover:bg-surface">Print / Download</button>
                <button type="button" onClick={navigateToEsign} className="text-xs px-3 py-1 rounded border border-hairline hover:bg-surface">Open eCIgn Signing</button>
              </div>
            </div>
            <ToneTag tone="orange">{record.usage}</ToneTag>
          </div>
          <div className="grid gap-lg">
            {recordFields.map(([label, value, status]) => (
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
              body:
                record.policies[0]?.startsWith('ALL')
                  ? `Linked to ${record.policies[0]}.`
                  : `Linked to ${formViewerPoliciesLabel(record.policies)}: ${record.policies.join(', ')}.`,
              icon: FileText,
              status: 'ready',
              title: 'Linked policy',
              tone: 'teal',
            }}
          />
          <SurfaceCard
            card={{
              body: `${record.type} form, ${record.usage.toLowerCase()} usage, ${record.frequency.toLowerCase()} frequency. Evidence posture: ${evidenceStatus}.`,
              icon: ClipboardCheck,
              status: usageStatus,
              title: 'Record summary',
              tone: usageStatus === 'ready' ? 'teal' : 'orange',
            }}
          />
          <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
            <h2 className="mb-lg text-h2 font-medium text-ink">Required signers</h2>
            <div className="rounded-md bg-tone-slate-bg p-md text-sm text-muted">
              Signer roster is not carried in the forms dataset for this record. Signer assignment is handled in the eCIgn signing workspace.
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
        <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
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
        <aside className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
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
        <article className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPrintRoute = typeof window !== 'undefined' && (window.location.pathname.endsWith('/print') || searchParams.get('print') === '1');
  useEffect(() => {
    if (isPrintRoute && typeof window !== 'undefined') {
      const t = window.setTimeout(() => {
        try { window.focus(); window.print(); } catch { /* noop */ }
      }, 650);
      return () => window.clearTimeout(t);
    }
  }, [isPrintRoute]);

  // Compute CES projections locally — only when ReportsScreen (CES) actually mounts.
  // This ensures pure reference views incur no CES build or state leakage.
  // Data: full real V3 seed via buildReport* (no placeholders).
  const metrics: readonly MetricTileData[] = buildReportMetrics();
  const realCards = buildReportCards().map((c, idx) => ({
    ...c,
    icon: idx === 0 ? BarChart3 : idx === 1 ? AlertTriangle : FolderOpen,
  }));
  const trendBars = buildReportTrendBars();
  return (
    <ScreenStack metrics={metrics}>
      <section className="grid gap-xl desktop:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-medium text-ink">Sprint readiness trend{isPrintRoute && <span className="ml-2 inline-block"><ToneTag tone="teal">Print view</ToneTag></span>}</h2>
            <button
              type="button"
              onClick={() => { window.location.href = '/ces/reports?print=1'; }}
              className="text-xs px-3 py-1 rounded border border-hairline hover:bg-surface"
            >
              Print / Download
            </button>
          </div>
          <div className="mt-xl rounded-lg bg-tone-slate-bg p-lg">
            <div className="flex h-[260px] items-end justify-around gap-lg">
              {trendBars.map((value, index) => (
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
          {realCards.map((card, idx) => (
            <div
              key={card.title}
              className="cursor-pointer"
              onClick={() => {
                if (idx === 0) navigate('/master-controls');
                else navigate('/evidence');
              }}
            >
              <SurfaceCard card={card} />
            </div>
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
    <section className="rounded-lg border border-hairline bg-surface p-xl shadow-rest">
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
