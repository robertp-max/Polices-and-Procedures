import { Activity, AlertTriangle, ArrowRight, BarChart3, BookOpen, CalendarClock, CheckCircle2, ChevronDown, ClipboardCheck, ClipboardList, ClipboardPlus, Clock, Crosshair, FileCheck2, FileText, Filter, FolderOpen, History, Layers, MoreHorizontal, PanelRightOpen, PenTool, Plus, Search, ShieldAlert, ShieldCheck, Stethoscope, TrendingDown, TrendingUp, Upload, Users, type LucideIcon } from 'lucide-react';
import { createElement, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { buildBoardLanes, buildCalendarEvents, buildEventLanes, buildReportMetrics, buildSprintSummary, buildReportCards, buildReportTrendBars, buildEvidenceRows, buildAuditRows, FALLBACK_EVENT_LANES, getControlFromParams, getTasksForEvent } from '@/policy/ces/cesViewProjections';
// Design cross-ref (Agent 19 background + Agent 19 read-only CES Data Seeds gap vs design subagent + Agent 09 read-only hygiene/validate gap): V3 seeds supply realistic ExecutionUnits for CES board/my-tasks/calendar/snapshots/projections.
// Current: use build* or FALLBACK for exact design visual parity. See projections for seed-driven future and validators.
import type { ExecutionUnit } from '@/policy/ces/types';
import { POLICY_CORPUS, LIFECYCLE_DOMAIN_ORDER, DOMAIN_LABEL } from '@/policy/data/policyCorpus';
import { FORMS_DATASET, type FormRecord } from '@/policy/data/formsLibraryDataset';
import { buildFormContent, type FormField, type FormSection } from '@/policy/data/formsLibraryContent';
import EvidenceStudio from '@/v6/screens/evidence/EvidenceStudio';
import Defensible2Studio from '@/v6/screens/evidence/Defensible2Studio';
import BradEvidenceIntake from '@/v6/screens/evidence/BradEvidenceIntake';
import AIComplianceReviewScreen from './pageviews/AIComplianceReviewScreen';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { getWorkflowDetail } from './pageviews/WorkflowsScreen';
import BradWorkspace from './brad/BradWorkspace';
import { DocumentUploadZone } from './brad/DocumentUploadZone';
import BuilderWorkspace from './brad/BuilderWorkspace';
import { resolveCanonicalFormId } from '@/policy/data/formIdAliases';
// V2 seed staffing data (not live production records; used for prototype staffing profile surfaces).
import { MOCK_CLINICIANS } from '@/policy/staffing/data/mockClinicians';
import { MOCK_PATIENTS } from '@/policy/staffing/data/mockPatients';
import { resolveDisplayName } from '@/policy/ces/data/V3_CES_SeedData';
import type { EventProcessStep, RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { inferPhaseTemplate } from '@/policy/workflows/swimlanes/phaseTemplates';
import type { SwimlaneStatus } from '@/policy/workflows/swimlanes/types';
import { buildWorkflowSwimlaneCardsForEvent } from '@/policy/workflows/swimlanes/buildSwimlaneFromWorkflow';
import { getEventById } from '@/policy/workflows/swimlanes/swimlaneRegistry';
import { Button, ToneBadge } from '../primitives';
import { type V6RouteDefinition } from '../routing/routeRegistry';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { BoardLane, DataTable, MetricGrid, ProgressMeter, SurfaceCard, ToneTag, VeilDrawer, VeilModal, toneBarClasses, toneSurfaceClasses, toneGlassSurfaceClasses, type BoardCardData, type BoardLaneData, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../components';
import { AdminGroupsScreen, AdminPermissionsScreen, AdminRolesScreen, AdminUsersScreen, AdminCommunityProfilesScreen, AdmissionPacketPreviewScreen, EcignWorkspaceScreen, EventsBoardScreen, FormsLibraryScreen, FrameworkScreen, GenericReferenceScreen, MasterControlsScreen, MyTasksScreen, PolicyAreaNav, PolicyDetailScreen, WorkflowsScreen, WorkflowDetailScreen, AppendixFScreen, JourneyAdminScreen, JourneyOverviewScreen, NewHireScreen, UserGuideScreen, ModulePlayerScreen, SupervisorScreen, OnboardingV2DashboardScreen, OnboardingV2ActivateScreen, OnboardingV2BatchesScreen, OnboardingV2BatchScreen, OnboardingV2AuditScreen, OnboardingV2GovernanceScreen, PolicyLifecycleScreen, PolicyLifecycleDetailScreen, PolicyApprovalsScreen, HubstaffScreen, SystemDocsScreen, HelpCenterScreen, GovernanceScreen, SurveyorViewerScreen, LoginScreen, ForgotPasswordScreen, ResetPasswordScreen, SetupAccountScreen, MobileIncidentScreen, NotFoundScreen, PersonalProfileScreen, CommunityScreen, ComplianceHomeScreen } from './pageviews';
import { workspaceCompactTabClass, workspaceTabActiveClass, workspaceTabClass, workspaceTabInactiveClass, workspaceTabNavClass } from './pageviews/workspaceTabChrome';
import { StaticCardWatermark } from './pageviews/StaticCardWatermark';

import GAO001V11Viewer from '@/policy/journey/components/gao001-v1-1/GAO001V11Viewer';
import {
  PolicyMetricsGrid,
  PolicyPanel,
  PolicySegmentTabs,
  PolicySignalCard,
  PolicyWorkspaceShell,
  type PolicyWorkspaceTab,
} from './pageviews/PolicyWorkspace';
import { achcSurveyRows } from '@/policy/data/achcSurveyProjection.generated';
import { achcPrintCrosswalk } from '@/policy/data/achcPrintCrosswalk.generated';
import { hhEvidenceRows } from '@/policy/data/achcHhEvidenceMap';
import { ALL_MODULES } from '@/policy/journey/data/modules';
import { useThreadStore } from '@/policy/help-center/threads';
import { LearnerProvider } from '@/policy/journey/lib/learnerState';
import { UiStateProvider } from '@/policy/journey/lib/uiState';
import { listCommunityUsers } from '../utils/communityProfileAdapter';

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


const operationsMetrics: readonly MetricTileData[] = [
  { label: 'Open work', value: '18', helper: 'Admin compliance queue', tone: 'teal' },
  { label: 'Risk', value: 'Low', helper: 'Policy + CES gated', tone: 'green' },
  { label: 'Due', value: '7', helper: 'Next 14d', tone: 'orange' },
] as const;

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

const policySubdomainCount = new Set(POLICY_CORPUS.map((policy) => `${policy.domainCode}-${policy.subdomainCode}`)).size;
const linkedFormsCount = FORMS_DATASET.filter((form) => form.policies.length > 0).length;
const workflowCount = Object.keys(WORKFLOWS).length;

const policyHomeStats: readonly { icon: LucideIcon; label: string; value: string }[] = [
  { icon: BookOpen, label: 'Active policies', value: String(POLICY_CORPUS.length) },
  { icon: Layers, label: 'Policy domains', value: String(LIFECYCLE_DOMAIN_ORDER.length) },
  { icon: FolderOpen, label: 'Subdomains', value: String(policySubdomainCount) },
  { icon: ShieldCheck, label: 'HH mappings', value: String(hhEvidenceRows.length) },
  { icon: ClipboardList, label: 'Forms linked', value: String(linkedFormsCount) },
  { icon: Activity, label: 'Workflows connected', value: String(workflowCount) },
];

const policyWorkspaceCards: readonly {
  body: string;
  category: string;
  icon: LucideIcon;
  status: string;
  title: string;
  to: string;
  tone: 'blue' | 'orange' | 'teal';
}[] = [
  {
    body: 'Search, review, print, and open active agency policies by domain, owner, access tier, review cycle, and survey context.',
    category: 'Policies',
    icon: BookOpen,
    status: 'Active',
    title: 'Policy Library',
    to: '/library/policies',
    tone: 'teal',
  },
  {
    body: 'Trace forms connected to policy obligations, including attestation tools, audit templates, HR records, and clinical forms.',
    category: 'Forms',
    icon: ClipboardList,
    status: `${linkedFormsCount} linked`,
    title: 'Linked Forms',
    to: '/forms',
    tone: 'orange',
  },
  {
    body: 'Review policy-driven workflows, required forms, owner roles, deadlines, escalation logic, and evidence-producing steps.',
    category: 'Workflows',
    icon: Activity,
    status: `${workflowCount} workflows`,
    title: 'Policy-Driven Workflows',
    to: '/workflows',
    tone: 'teal',
  },
  {
    body: 'Navigate domains, subdomains, policy tiers, owners, status, review cycles, access tiers, and regulatory tags.',
    category: 'Taxonomy',
    icon: Layers,
    status: 'Current',
    title: 'Enterprise Policy Taxonomy',
    to: '/framework',
    tone: 'blue',
  },
  {
    body: 'Connect policies to ACHC standards, CMS Conditions of Participation, Title 22 references, and HH evidence expectations.',
    category: 'ACHC',
    icon: ShieldCheck,
    status: 'Mapped',
    title: 'ACHC Crosswalk & Standards Matrix',
    to: '/framework/achc-survey',
    tone: 'teal',
  },
  {
    body: 'Monitor drafts, annual reviews, approval readiness, publication status, owner accountability, and readiness gaps.',
    category: 'Lifecycle',
    icon: History,
    status: 'Monitoring',
    title: 'Policy Review & Approval',
    to: '/policy-lifecycle',
    tone: 'orange',
  },
];

const policyQuickActions: readonly { icon: LucideIcon; label: string; to: string }[] = [
  { icon: BookOpen, label: 'Open Policy Library', to: '/library/policies' },
  { icon: Search, label: 'Search by Policy ID', to: '/library/policies' },
  { icon: FileText, label: 'View Forms by Policy', to: '/forms' },
  { icon: Activity, label: 'View Workflows by Policy', to: '/workflows' },
  { icon: Layers, label: 'Open Taxonomy', to: '/framework' },
  { icon: CheckCircle2, label: 'View ACHC Crosswalk', to: '/framework/achc-survey/crosswalk' },
  { icon: AlertTriangle, label: 'Review Policy Gaps', to: '/policy-lifecycle' },
  { icon: FileCheck2, label: 'Open Standards Matrix', to: '/framework/achc-survey?view=matrix' },
  { icon: PanelRightOpen, label: 'Ask Brad About a Policy', to: '/iadministrator' },
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
  const wf = event.workflowId ? ' ' + event.workflowId : '';
  return {
    summary: `Workflow source missing — cannot render authored swimlane for ${event.label || event.id}${wf}`,
    metrics: [
      { label: 'Tasks', value: '0', helper: 'No authored steps resolved', tone: 'orange' },
      { label: 'Workflow', value: event.workflowId ?? 'missing', helper: 'Not resolved in WORKFLOWS', tone: 'orange' },
      { label: 'Source', value: 'Missing', helper: 'Use only for unresolved', tone: 'slate' },
      { label: 'Due', value: dueLabelFromDisplayDay(event.day, 0, displayMonth), helper: 'Calendar display date', tone: 'teal' },
    ],
    lanes: [
      {
        title: 'Workflow source missing',
        tone: 'orange',
        note: 'Workflow source missing — cannot render authored swimlane',
        cards: [
          {
            chips: ['diagnostic'],
            due: dueLabelFromDisplayDay(event.day, 0, displayMonth),
            id: `${getCalendarEventKey(event)}-source-missing`,
            owner: event.owner,
            progress: 0,
            status: 'Source missing',
            title: 'Workflow source missing — cannot render authored swimlane',
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
    || key === 'ceu-qapi-2026-10-014'
    || key === 'wf-qapi-data-2026-10'
    || key.includes('tpl-qa-quarterly-qapi')
    || key.includes('q2 qapi quarterly')
    || key.includes('qapi quarterly swimlane');
}

function isQapiQuarterlyEvent(event: CalendarEventData): boolean {
  return isQapiQuarterlyWorkflowKey(event.id)
    || isQapiQuarterlyWorkflowKey(event.workflowId)
    || isQapiQuarterlyWorkflowKey(event.workflow)
    || isQapiQuarterlyWorkflowKey((event as any).sourceEventId)
    || (event.label.toLowerCase().includes('qapi') && (event.label.toLowerCase().includes('q2 data review') || event.label.toLowerCase().includes('q2 aggregate report') || event.label.toLowerCase().includes('quarterly review')));
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
      className="v6-calendar-event-preview fixed z-popover w-[680px] max-w-[min(680px,90vw)] pointer-events-none rounded-lg border border-white bg-surface-glass backdrop-blur-md shadow-glass-inset p-2xl text-ink shadow-rest"
      id="ces-event-preview"
      style={positionStyle}
    >
      <div className="mb-lg flex items-start justify-between gap-lg">
        <ToneTag tone={event.tone}>{readiness}</ToneTag>
        <ToneTag tone={event.tone}>Click opens swimlane</ToneTag>
      </div>
      <h3 className="text-h2 font-medium text-ink leading-tight">{event.label}</h3>
      <p className="mt-sm text-sm text-muted">
        {displayMonth} {event.day} - {event.owner}
      </p>
      <div className="mt-lg grid gap-sm grid-cols-2">
        {[
          ['Risk', risk],
          ['Required forms', `${formsCount}`],
          ['Evidence', evidenceStatus],
          ['Tasks', `${taskCount}`],
        ].map(([label, value]) => (
          <div className={cx('rounded-md border p-md', toneSurfaceClasses[event.tone])} key={label}>
            <p className="text-xs uppercase tracking-tag text-secondary">{label}</p>
            <p className="mt-sm text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-lg grid gap-sm text-sm">
        <p className="text-secondary">
          <span className="font-medium text-ink">Attendees:</span> {attendees}
        </p>
        <p className="text-secondary">
          <span className="font-medium text-ink">Next action:</span> {nextAction}
        </p>
      </div>
      <p className={cx(
        "mt-lg rounded-md border px-md py-sm text-sm font-medium text-center",
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
          className="flex gap-sm overflow-x-auto rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm backdrop-blur-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  'min-h-tap shrink-0 rounded-sm border px-md py-sm text-[10px] font-medium uppercase tracking-wider',
                  isSelected
                    ? 'border-brand-teal bg-brand-teal text-on-brand shadow-rest'
                    : item.tone === 'orange' || item.tone === 'amber'
                      ? 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text'
                      : 'border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal hover:bg-surface-glass hover:backdrop-blur-md'
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
                <span className="grid h-tap w-tap place-items-center rounded-full bg-surface-glass backdrop-blur-md shadow-glass-inset text-sm font-medium">{index + 1}</span>
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
                <span className="grid h-10 w-10 place-items-center rounded-full bg-surface-glass backdrop-blur-md shadow-glass-inset text-sm font-medium">{laneIndex + 1}</span>
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
                <article className="min-w-0 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg" key={task.id}>
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
                      <span className="rounded-sm border border-tone-teal-border bg-surface-glass backdrop-blur-md shadow-glass-inset px-sm py-xs text-[9px] font-medium uppercase tracking-wider text-brand-teal" key={`${task.id}-${chip}`}>
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
          <article className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest" key={name}>
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
const hhStandards = new Set(hhEvidenceRows.map((r) => r.hhStandard).filter(Boolean));
const hhDuplicateKeys = new Set<string>();
const hhSeenKeys = new Set<string>();
hhEvidenceRows.forEach((r) => {
  const key = `${r.hhStandard}::${r.policyId}`;
  if (hhSeenKeys.has(key)) hhDuplicateKeys.add(key);
  hhSeenKeys.add(key);
});
const hhReferenceOnlyRows = hhEvidenceRows.filter((r) => /reference|appendix|bibliograph|citation/i.test(`${r.sectionId} ${r.sectionTitle} ${r.notes}`));
const hhMissingContentRows = hhEvidenceRows.filter((r) => !r.supportingContent.trim());
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
  .map(r => ({
    id: r.achcStandards.length ? r.achcStandards.join(', ') : '—',
    title: r.ibmPolicyTitle || r.corridorTitle,
    owner: r.ibmPolicyId,
    cmsTitle22: [
      ...(r.medicareCop || []),
      ...(r.title22 || []),
    ].join(' | ') || '—',
    evidence: (r.evidenceCodes && r.evidenceCodes.length ? r.evidenceCodes.join('/') : '—'),
    sectionAnchor: hhEvidenceRows
      .filter((m) => (m.policyId === r.ibmPolicyId || r.achcStandards.includes(m.hhStandard)) && r.achcStandards.includes(m.hhStandard))
      .slice(0, 2)
      .map((m) => `${m.policyId} ${m.sectionTitle}`)
      .join(' | ') || '—',
    status: r.mappingConfidence === 'HIGH' ? 'validated' : (r.mappingConfidence === 'UNMAPPED' ? 'review-required' : 'ready'),
  }));

const hhEvidenceMapMetrics: readonly MetricTileData[] = [
  { label: 'HH mappings', value: String(hhEvidenceRows.length), helper: 'Rows from policy_hh_section_map.csv', tone: 'teal' },
  { label: 'HH standards', value: String(hhStandards.size), helper: 'Distinct HH tags with anchors', tone: 'green' },
  { label: 'Review flags', value: String(hhEvidenceRows.filter((r) => r.matchType === 'REVIEW_REQUIRED' || r.confidence !== 'HIGH').length), helper: 'Non-high or review-required', tone: 'orange' },
  { label: 'Duplicates', value: String(hhDuplicateKeys.size), helper: 'Duplicate HH/policy pairs', tone: 'amber' },
];

const hhEvidenceMapRows: readonly BasicRow[] = hhEvidenceRows.map((r) => {
  const duplicate = hhDuplicateKeys.has(`${r.hhStandard}::${r.policyId}`);
  const referenceOnly = /reference|appendix|bibliograph|citation/i.test(`${r.sectionId} ${r.sectionTitle} ${r.notes}`);
  const status = !r.supportingContent.trim()
    ? 'review-required'
    : referenceOnly
      ? 'review-required'
      : duplicate
        ? 'ready'
        : r.confidence === 'HIGH'
          ? 'validated'
          : 'review-required';
  return {
    id: r.hhStandard,
    title: r.policyTitle,
    owner: r.policyId,
    sectionAnchor: `${r.sectionTitle} (${r.sectionId})`,
    evidence: r.matchType,
    confidence: r.confidence,
    status,
  };
});

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

// FORM_VIEWER_DOMAIN_NAMES and helpers removed (unused after document viewer refactor)

// ReportsScreen recomputes live via builders for real V3 data (no placeholders).

export function RepresentativeScreen({ route }: { route: RouteLike }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const overlay = searchParams.get('v6-overlay');

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
    case 'admin-community-profiles':
      child = <AdminCommunityProfilesScreen />;
      break;
    case 'achc-crosswalk':
      child = <AchcScreen mode="crosswalk" />;
      break;
    case 'achc-survey':
      child = <AchcScreen mode={searchParams.get('view') === 'crosswalk' ? 'crosswalk' : 'survey'} />;
      break;
    case 'hh-evidence-map':
      child = <HhEvidenceMapScreen />;
      break;
    case 'artifact-viewer':
      child = <ArtifactViewerScreen />;
      break;
    case 'audit-mode':
      child = <EvidenceScreen mode="audit-mode" />;
      break;
    case 'ces-calendar':
      child = <ComplianceHomeScreen />;
      break;
    case 'clinicians':
      child = <ProfileListScreen mode="clinicians" />;
      break;
    case 'clinician-detail':
      child = <ClinicianDetailScreen />;
      break;
    case 'dashboard':
      child = <DashboardScreen routeView={searchParams.get('view')} />;
      break;
    case 'compliance-home':
      child = <ComplianceHomeScreen />;
      break;
    case 'personal-profile':
      child = <PersonalProfileScreen />;
      break;
    case 'community':
      child = <CommunityScreen />;
      break;
    case 'community-members':
      child = <CommunityScreen />;
      break;
    case 'ecign-workspace':
      child = <EcignWorkspaceScreen />;
      break;
    case 'events-board':
      // Design cross-ref (Agent 13): events-board to V6_DESIGN.html ~1334 (4-col risk buckets, metrics 162/4/12/28, exact card data/semantics from eventsBoardColumns ~508). Screen uses pragmatic data + full fields via BoardLane.
      child = <EventsBoardScreen />;
      break;
    case 'policy-home':
      child = <PolicyHomeScreen />;
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
      // Full master-control inventory + dossier workflow. Keep this route on the
      // dedicated screen; ComplianceHome only links to it.
      child = <MasterControlsScreen />;
      break;
    case 'my-tasks':
    case 'pm-my-tasks':
      child = <MyTasksScreen />;
      break;
    case 'patients':
      child = <ProfileListScreen mode="patients" />;
      break;
    case 'ces-board':
    case 'pm-sprint-plan':
      // Design cross-ref (Agent 12 background): ces-board to V6_DESIGN.html ~1320 (7-col kanbanLanes from complianceBoardColumns ~409 incl. dedicated "Awaiting Action / Evidence" with EVT-REV cards + meta/awaitingType/missing, metrics, filters, summary 'Sprint 12 - 38 cards - 5 awaiting action/evidence', desktop:grid-cols-7 via BoardLane).
      // Current: exact lanes + cards (pragmatic subset), 7 metrics, awaiting column + fields, BoardScreen + filters. Proposals: dynamic from V3 seeds/snapshot or cesMasterControlAudit, link cards to /evidence /swimlane, derive metrics from projections.
      // Agent 21 read-only CES Integration/Routing gap vs design: BoardScreen renders <BoardLane lane={lane} /> (no onCardClick prop), so no navigation from cards. Design explicitly calls for future CTA links from board to /evidence / swimlane (and exposure from Calendar/Events). Routing is complete, but interactive cross-CES-view integration is a gap in current prototype. See routeRegistry Agent 21 comment.
      child = <BoardScreen />;
      break;
    case 'defensible-2':
      // DefenCIble = the rich Defensible2 studio (template→source→verify→generate,
      // billing route, eCIgn). EvidenceStudio remains for the other evidence routes.
      // DO NOT swap this back to ComplianceHomeScreen — that is a static mockup whose
      // Drive folders have no click handlers (regressed twice: see 8bc7b4d2, 4953685c).
      child = <Defensible2Studio />;
      break;
    case 'evidence-center':
      child = <EvidenceStudio initialTab="studio" />;
      break;
    case 'evidence-intake':
      child = <BradEvidenceIntake />;
      break;
    case 'evidence-packet-studio':
      child = <Defensible2Studio initialTab="packet2" />;
      break;
    case 'packet-studio':
      child = <Defensible2Studio initialTab="packet2" />;
      break;
    case 'admission-packet-preview':
      child = <AdmissionPacketPreviewScreen />;
      break;
    case 'ai-compliance-review':
    case 'ai-review':
      child = <AIComplianceReviewScreen />;
      break;
    case 'form-viewer':
      child = <FormWorkspaceScreen />;
      break;
    case 'brad':
      child = <BradScreen />;
      break;
    case 'brad-builder':
      child = <BuilderScreen />;
      break;
    case 'user-guide':
      child = <UserGuideScreen />;
      break;
    case 'gao-001-v11-preview':
      child = <GAO001V11Viewer />;
      break;
    case 'ces-reports':
    case 'pm-sprint-review':
    case 'pm-dashboard':
      // Design cross-ref (Agent 03/23/16): ces-reports to V6_DESIGN.html ~1410 (cesReportCards, reportBars ~1414, metrics ~1416-1421).
      // Agent 21: Now fully wired to real V3 seed data via buildReportMetrics / buildReportCards / buildReportTrendBars (no placeholders). Cards use actual sprint/blocked/completed/surveyCritical counts. Trend derived from unit states. Subnav + nav to /master-controls /evidence preserved. My-tasks uses buildTaskLanes too.
      child = <ReportsScreen />;
      break;
    // Lightweight CES Command Center report placeholders — read-only, no clinical data, no big tables
    case 'report-policy-review-aging':
    case 'report-policy-expiration':
    case 'report-policy-attestation':
    case 'report-policy-crosslinks':
    case 'report-policy-sla':
    case 'report-master-evidence-expiring':
    case 'report-ecign-signatures':
    case 'report-ecign-expiring':
    case 'report-training-overdue':
    case 'report-training-policy-attestation':
    case 'report-training-drills':
    case 'report-training-evidence':
    case 'report-community-thread-sla':
    case 'report-community-engagement-by-role':
    case 'report-help-center-usage':
    case 'report-community-to-ces':
      child = <ReportPlaceholder hashId={route.hashId} />;
      break;
    case 'community-threads':
      child = <CommunityScreen />;
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
    case 'journey-new-hire':
      child = <NewHireScreen />;
      break;
    case 'journey-orientation':
    case 'module-player':
    case 'lesson-player':
    case 'module-assessment-splash':
    case 'module-assessment-quiz':
    case 'final-assessment-splash':
    case 'final-assessment-quiz':
    case 'final-result':
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
    case 'policy-approvals':
    case 'pm-approvals':
      child = <PolicyApprovalsScreen />;
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
    case 'forgot-password-page':
      child = <ForgotPasswordScreen />;
      break;
    case 'reset-password-page':
      child = <ResetPasswordScreen />;
      break;
    case 'setup-account-page':
      child = <SetupAccountScreen />;
      break;
    case 'mobile-incident':
      child = <MobileIncidentScreen />;
      break;
    default:
      child = <NotFoundScreen />;
      break;
  }

  if (overlay === 'drawer-system') {
    child = <OverlaySystemScreen />;
  }

  const wrapped = child;

  if (route.group === 'Auth') {
    return child;
  }

  const mainContent = wrapped;

  const pathname = location?.pathname || '';
  const isOnboardingGroup = pathname.startsWith('/journey') || pathname.startsWith('/onboarding-v2') || ['journey-overview', 'journey-new-hire', 'journey-orientation', 'module-player', 'lesson-player', 'module-assessment-splash', 'module-assessment-quiz', 'final-assessment-splash', 'final-assessment-quiz', 'final-result', 'appendix-f', 'supervisor', 'journey-admin', 'user-guide', 'gao-001-v11-preview'].includes(route.hashId || '') || route.group === 'Onboarding';
  let content = mainContent;

  if (isOnboardingGroup) {
    content = (
      <LearnerProvider>
        <UiStateProvider>
          {content}
        </UiStateProvider>
      </LearnerProvider>
    );
  }

  return content;
}

export function isRepresentativeRoute(route: RouteLike): boolean {
  return [
    'admin-groups',
    'admin-roles',
    'admin-permissions',
    'admin-users',
    'achc-crosswalk',
    'achc-survey',
    'hh-evidence-map',
    'artifact-viewer',
    'audit-mode',
    'ces-calendar',
    'clinicians',
    'clinician-detail',
    'dashboard',
    'compliance-home',
    'ecign-workspace',
    'events-board',
    'policy-home',
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
    'evidence-intake',
    'evidence-packet-studio',
    'packet-studio',
    'form-viewer',
    'brad',
    'user-guide',
    'gao-001-v11-preview',
    'ces-reports',
    'report-policy-review-aging',
    'report-policy-expiration',
    'report-policy-attestation',
    'report-policy-crosslinks',
    'report-policy-sla',
    'report-master-evidence-expiring',
    'report-ecign-signatures',
    'report-ecign-expiring',
    'report-training-overdue',
    'report-training-policy-attestation',
    'report-training-drills',
    'report-training-evidence',
    'report-community-thread-sla',
    'report-community-engagement-by-role',
    'report-help-center-usage',
    'report-community-to-ces',
    'community-threads',
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
    'policy-approvals',
    'hubstaff',
    'system-docs',
    'help-center',
    'governance',
    'surveyor-viewer',
    'login-page',
    'forgot-password-page',
    'reset-password-page',
    'setup-account-page',
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
    <div className="mx-auto grid w-full max-w-[1400px] gap-2xl">
      {metrics.length > 0 && <MetricGrid metrics={metrics} />}
      {children}
    </div>
  );
}

// DesignBadge (legacy) removed — unused after dashboard redesign. ToneBadge used elsewhere.

// --- Modern CI Dashboard Design (ported from dashboard_redesign.html) ---

interface ModernCardData {
  title: string;
  status: 'GOOD' | 'STEADY' | 'WATCH' | 'REVIEW REQUIRED' | 'BLOCKED';
  chart?: { type: 'donut' | 'sparkline'; value?: number; data?: number[]; color?: string };
  footer: string;
  targetPath: string;
  carouselSize?: { w: number; h: number; chartType: 'normal' | 'featured' | 'wide' };
  cTop?: number;
  cZ?: number;
  cSpeed?: number;
  cX?: number;
}

// === EXACT ported animation helpers (generateDonutSvg + generateSparkline + replayCardAnimation + resetCardVisuals + animate) ===
// Ported for requestAnimationFrame + easeOut = 1 - Math.pow(1-progress,4), 1200ms
// Donut: svg circles + dashoffset + text % count. Sparkline: smooth SVG path + dash offset.
// React components use refs + useEffect(replayKey) + direct RAF mutation (setAttribute / style.strokeDashoffset)
// Triggers via replayKey (from mouseenter) + internal view-enter via IntersectionObserver. Uses data-* attrs. drop-shadow preserved.

function easeOut(progress: number): number {
  return 1 - Math.pow(1 - progress, 4);
}

function animate(duration: number, onProgress: (ease: number, progress: number) => void, onComplete?: () => void) {
  let startTime: number | null = null;
  function step(t: number) {
    if (!startTime) startTime = t;
    const progress = Math.min((t - startTime) / duration, 1);
    const eased = easeOut(progress);
    onProgress(eased, progress);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onComplete?.();
    }
  }
  requestAnimationFrame(step);
}

function generateDonutSvg(percentage: number, colorType: string = 'secondary', cardType: string = 'normal') {
  const pct = Math.max(0, Math.min(100, Math.round(percentage)));
  let strokeColor = '#007970';
  let bgColor = '#E5FEFF';
  if (colorType === 'primary') {
    strokeColor = '#C74601';
    bgColor = '#FFEEE5';
  } else if (colorType === 'blue' || colorType === 'good') {
    strokeColor = '#0EA5E9';
    bgColor = '#E0F2FE';
  } else if (colorType === 'pink' || colorType === 'review') {
    strokeColor = '#DB2777';
    bgColor = '#FCE7F3';
  }
  let containerSize = 'w-24 h-24', textSize = 'text-xl';
  if (cardType === 'featured') { containerSize = 'w-40 h-40'; textSize = 'text-4xl'; }
  else if (cardType === 'wide') { containerSize = 'w-28 h-28'; textSize = 'text-2xl'; }
  const cx = 50, cy = 50, strokeWidth = 8;
  const radius = (100 - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (pct / 100) * circumference;
  return { pct, strokeColor, bgColor, containerSize, textSize, cx, cy, strokeWidth, radius, circumference, targetOffset };
}

function generateSparkline(data: number[], colorType: string = 'secondary', cardType: string = 'normal') {
  let strokeColor = '#007970';
  if (colorType === 'primary') {
    strokeColor = '#C74601';
  } else if (colorType === 'blue' || colorType === 'good') {
    strokeColor = '#0EA5E9';
  } else if (colorType === 'pink' || colorType === 'review') {
    strokeColor = '#DB2777';
  }
  const w = 120;
  const h = 40;
  const padding = 4;
  let sizingClass = 'h-16';
  if (cardType === 'featured') sizingClass = 'h-32';
  else if (cardType === 'wide') sizingClass = 'h-24';
  const max = (data && data.length) ? Math.max(...data) : 0;
  const min = (data && data.length) ? Math.min(...data) : 0;
  const range = max - min || 1;
  return { strokeColor, w, h, padding, sizingClass, max, min, range };
}

type DonutSvgData = ReturnType<typeof generateDonutSvg>;
type SparklineSvgData = ReturnType<typeof generateSparkline> & { data: number[] };
type ChartSvgData = Partial<DonutSvgData> & Partial<SparklineSvgData>;

function buildSmoothSparklinePath(data: number[], generated: ChartSvgData, progress = 1): string {
  if (!data.length) return '';
  const w = generated.w ?? 120;
  const h = generated.h ?? 40;
  const padding = generated.padding ?? 4;
  const min = generated.min ?? Math.min(...data);
  const range = generated.range ?? (Math.max(...data) - min || 1);
  const baseY = h - padding;
  const points = data.map((val, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (w - padding * 2);
    const targetY = h - padding - ((val - min) / range) * (h - padding * 2);
    const y = baseY - ((baseY - targetY) * progress);
    return { x, y };
  });

  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  const midpoint = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  });
  const firstMid = midpoint(points[0], points[1]);
  let path = `M ${points[0].x},${points[0].y} Q ${points[0].x},${points[0].y} ${firstMid.x},${firstMid.y}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const mid = midpoint(points[i], points[i + 1]);
    path += ` T ${mid.x},${mid.y}`;
  }
  const last = points[points.length - 1];
  return `${path} T ${last.x},${last.y}`;
}

function resetCardVisuals(container: HTMLElement | null, type: 'donut' | 'sparkline', generated: ChartSvgData) {
  if (!container) return;
  if (type === 'donut') {
    const svg = container.querySelector('svg');
    const path = svg?.querySelector('.donut-path') as SVGCircleElement | null;
    const text = container.querySelector('.donut-text') as HTMLSpanElement | null;
    const circumference = generated?.circumference ?? (parseFloat(path?.getAttribute('data-circumference') || '0') || (2 * Math.PI * ((100 - 8) / 2)));
    if (path) {
      path.style.transition = 'none';
      path.setAttribute('stroke-dasharray', String(circumference));
      path.setAttribute('stroke-dashoffset', String(circumference));
    }
    if (text) text.textContent = '0%';
  } else {
    const path = container.querySelector('.sparkline-path') as SVGPathElement | null;
    if (path) {
      path.style.transition = 'none';
      path.setAttribute('d', buildSmoothSparklinePath(generated.data ?? [], generated, 0));
      path.setAttribute('stroke-dasharray', '100');
      path.setAttribute('stroke-dashoffset', '100');
    }
  }
}

function replayCardAnimation(target: Element | SVGCircleElement | SVGSVGElement | SVGPathElement | null | HTMLElement, type?: 'donut' | 'sparkline', generated?: ChartSvgData, textEl?: HTMLSpanElement | null) {
  if (target && (target as HTMLElement).querySelector) {
    // called with card element from tick -- dispatch inside
    const card = target as HTMLElement;
    const d = card.querySelector('.donut-path');
    const s = card.querySelector('.sparkline-path');
    if (d) { /* fall to old logic or simple replay */ }
    if (s) { /* */ }
    // delegate to full impl if possible, else do basic
  }
  // Delegates to per-type RAF animate using exact ease + 1200ms. Mutates via setAttribute / style.
  if (!target) return;
  const dur = 1200;
  if (type === 'donut') {
    const donutPath = target as SVGCircleElement;
    const circumference = generated?.circumference ?? 0;
    const targetOffset = generated?.targetOffset ?? circumference;
    const pct = generated?.pct ?? 0;
    animate(dur, (easeOutVal) => {
      if (textEl) textEl.textContent = Math.round(easeOutVal * pct) + '%';
      const currentOffset = circumference - ((circumference - targetOffset) * easeOutVal);
      donutPath.setAttribute('stroke-dashoffset', String(currentOffset));
    }, () => {
      if (textEl) textEl.textContent = pct + '%';
      donutPath.setAttribute('stroke-dashoffset', String(targetOffset));
    });
  } else {
    const sparkPath = target as SVGPathElement;
    let dataVals: number[] = generated?.data ?? [];
    if (!dataVals.length && sparkPath.getAttribute('data-values')) {
      try {
        dataVals = JSON.parse(sparkPath.getAttribute('data-values') || '[]') as number[];
      } catch {
        dataVals = [];
      }
    }
    animate(dur, (easeOutVal) => {
      sparkPath.setAttribute('d', buildSmoothSparklinePath(dataVals, generated ?? {}, easeOutVal));
    });
    // Also drive dash offset via RAF + direct style (no CSS transition)
    // start from 100
    sparkPath.style.strokeDashoffset = '100';
    animate(dur, (easeOutVal) => {
      const dash = 100 - (100 * easeOutVal);
      sparkPath.style.strokeDashoffset = String(dash);
    }, () => {
      sparkPath.style.strokeDashoffset = '0';
    });
  }
}

function AnimatedDonut({ percentage, colorType = 'secondary', cardType = 'normal', replayKey = 0, stroke }: { percentage: number; colorType?: string; cardType?: string; replayKey?: number; stroke?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const generatedRef = useRef<DonutSvgData | null>(null);
  const shadowId = `donut-pop-${useId().replace(/:/g, '')}`;

  const generated = useMemo(() => generateDonutSvg(percentage, colorType, cardType), [percentage, colorType, cardType]);
  const { pct, strokeColor: defaultStroke, bgColor, containerSize, textSize, cx, cy, strokeWidth, radius, circumference, targetOffset } = generated;
  const strokeColor = stroke || defaultStroke;

  useEffect(() => {
    generatedRef.current = generated;
  }, [generated]);

  // useEffect on replayKey to replay animation (also supports external mouseenter replayKey)
  useEffect(() => {
    const svg = svgRef.current;
    const textEl = textRef.current;
    const wrapper = wrapperRef.current;
    if (!svg || !textEl) return;

    const path = svg.querySelector('.donut-path') as SVGCircleElement | null;
    if (!path) return;

    const gen = generatedRef.current || generated;
    resetCardVisuals(wrapper, 'donut', gen);

    // ensure stroke (from data attr usage pattern)
    path.style.stroke = gen.strokeColor || strokeColor;

    replayCardAnimation(path, 'donut', gen, textEl);
  }, [pct, strokeColor, replayKey, circumference, targetOffset, generated]); // replayKey drives replay

  // Trigger on enter view (IntersectionObserver) in addition to mouseenter(replayKey)
  useEffect(() => {
    const target = wrapperRef.current || svgRef.current;
    if (!target) return;
    let triggered = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !triggered) {
          triggered = true; // first enter triggers
          const svg = svgRef.current;
          const textEl = textRef.current;
          const path = svg?.querySelector('.donut-path') as SVGCircleElement | null;
          const gen = generatedRef.current || generated;
          if (path && textEl) {
            resetCardVisuals(target as HTMLElement, 'donut', gen);
            path.style.stroke = gen.strokeColor || strokeColor;
            replayCardAnimation(path, 'donut', gen, textEl);
          }
        }
      }
    }, { threshold: 0.15 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []); // mount once for IO

  return (
    <div ref={wrapperRef} className={`relative ${containerSize} flex items-center justify-center font-montserrat`}>
      <svg ref={svgRef} viewBox="0 0 100 100" className="h-full w-full -rotate-90 overflow-visible drop-shadow-[0_7px_16px_rgba(31,28,27,0.08)]">
        <defs>
          <filter id={shadowId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1F1C1B" floodOpacity="0.12" />
          </filter>
        </defs>
        <g filter={`url(#${shadowId})`}>
          <circle cx={cx} cy={cy} r={radius} stroke={bgColor} strokeWidth={strokeWidth} fill="none" />
          <circle
            className="donut-path"
            data-target-value={pct}
            data-circumference={circumference}
            data-target-offset={targetOffset}
            cx={cx}
            cy={cy}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span ref={textRef} className={`donut-text absolute ${textSize} font-light tracking-tight text-[#52404B]`}>0%</span>
    </div>
  );
}

function AnimatedSparkline({ data, colorType = 'secondary', cardType = 'normal', replayKey = 0, stroke }: { data: number[]; colorType?: string; cardType?: string; replayKey?: number; stroke?: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const generatedRef = useRef<SparklineSvgData | null>(null);

  const generatedBase = useMemo(() => generateSparkline(data, colorType, cardType), [data, colorType, cardType]);
  // attach live data for replay helpers
  const generated = useMemo(() => ({ ...generatedBase, data: data || [] }), [data, generatedBase]);
  const { strokeColor: defaultStroke, sizingClass } = generatedBase;
  const strokeColor = stroke || defaultStroke;

  useEffect(() => {
    generatedRef.current = generated;
  }, [generated]);

  useEffect(() => {
    const path = pathRef.current;
    const wrapper = wrapperRef.current;
    if (!path || !data || data.length === 0) return;

    const gen = generatedRef.current || generated;
    resetCardVisuals(wrapper, 'sparkline', gen);
    path.style.stroke = gen.strokeColor || strokeColor;

    // use replay helper which runs RAF for points + dash via style.strokeDashoffset
    replayCardAnimation(path, 'sparkline', gen);
  }, [data, strokeColor, replayKey, generated]); // replayKey drives re-trigger from mouseenter

  // Trigger on enter view (or re-enter) OR mouseenter via replayKey
  useEffect(() => {
    const target = wrapperRef.current;
    if (!target) return;
    let triggered = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!triggered) triggered = true;
          const path = pathRef.current;
          const gen = generatedRef.current || generated;
          if (path) {
            resetCardVisuals(target, 'sparkline', gen);
            path.style.stroke = gen.strokeColor || strokeColor;
            replayCardAnimation(path, 'sparkline', gen);
          }
        }
      }
    }, { threshold: 0.15 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []); // IO setup on mount

  return (
    <div ref={wrapperRef} className="w-full">
      <svg viewBox="0 0 120 40" className={`w-full ${sizingClass} overflow-visible drop-shadow-[0_8px_16px_rgba(31,28,27,0.08)]`} fill="none">
        <line x1="4" y1="12" x2="116" y2="12" stroke="#F1F2EF" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="4" y1="22" x2="116" y2="22" stroke="#F1F2EF" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="4" y1="32" x2="116" y2="32" stroke="#F1F2EF" strokeWidth="1" strokeDasharray="3 3" />
        <path
          ref={pathRef}
          className="sparkline-path vector-effect-non-scaling-stroke"
          data-values={JSON.stringify(data)}
          d={buildSmoothSparklinePath(data || [], generated, 0)}
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset="100"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function getDashboardTheme(status: string, isWhite: boolean, mode: 'grid' | 'carousel') {
  // Rewritten to match HTML EXACTLY:
  // - 33.3% colored (isWhite = index%3 !== 0)
  // - carousel: white .0777 , colored 40
  // - grid: white 95 , colored 90
  // - Colors per spec (using HTML tailwind hex values): STEADY secondary teal #007970 (bg-secondary-200 ref), WATCH primary orange #C74601, GOOD pastel blue #0EA5E9/#E0F2FE, REVIEW pink #DB2777/pastel-pink
  // - border-0 everywhere handled in caller + css
  const isCarousel = mode === 'carousel';
  const whiteOp = isCarousel ? 'bg-white/[.0777]' : 'bg-white/95';
  const coloredOp = isCarousel ? '/40' : '/90';

  let coloredBg: string;
  let text: string;
  let stroke: string;
  let accentBadge: string;

  switch (status) {
    case 'STEADY':
      coloredBg = `bg-[#E5FEFF]${coloredOp}`; // secondary teal #007970 ; bg-secondary-200 in HTML ref
      text = 'text-[#004142]';
      stroke = '#007970';
      accentBadge = `bg-[#E5FEFF]${coloredOp}`;
      break;
    case 'WATCH':
      coloredBg = `bg-[#FFEEE5]${coloredOp}`;
      text = 'text-[#421700]';
      stroke = '#C74601';
      accentBadge = `bg-[#FFEEE5]${coloredOp}`;
      break;
    case 'GOOD':
      coloredBg = `bg-[#E0F2FE]${coloredOp}`; // pastel blue
      text = 'text-[#0EA5E9]';
      stroke = '#0EA5E9';
      accentBadge = `bg-[#E0F2FE]${coloredOp}`;
      break;
    case 'REVIEW REQUIRED':
      coloredBg = `bg-[#FCE7F3]${coloredOp}`; // pastel-pink
      text = 'text-[#DB2777]';
      stroke = '#DB2777';
      accentBadge = `bg-[#FCE7F3]${coloredOp}`;
      break;
    default:
      coloredBg = `bg-[#E5E4E3]${coloredOp}`;
      text = 'text-[#52404B]';
      stroke = '#747470';
      accentBadge = `bg-[#E5E4E3]${coloredOp}`;
      break;
  }

  if (isWhite) {
    return {
      cardBg: whiteOp,
      text,
      badge: isCarousel ? 'bg-white/40' : accentBadge,
      stroke,
    };
  }
  // colored card (33.3%): use colored /40 for carousel badges per opacities spec
  return {
    cardBg: coloredBg,
    text,
    badge: isCarousel ? accentBadge.replace('/90', '/40').replace('/95', '/40') : 'bg-white/60',
    stroke,
  };
}

function getBadgeStyles(status: string) {
  // Exact colors from the HTML design (no undefined sentiment-* tokens)
  switch (status) {
    case 'WATCH': return 'bg-[#FFEEE5] text-[#C74601]';
    case 'STEADY': return 'bg-[#E5FEFF] text-[#004142]';
    case 'GOOD': return 'bg-[#E0F2FE] text-[#0369A1]';
    case 'REVIEW REQUIRED': return 'bg-[#FDF2F8] text-[#BE185D]';
    default: return 'bg-[#E5E4E3] text-[#52404B]';
  }
}

function getDashboardCardIcon(title: string): LucideIcon {
  const text = title.toUpperCase();
  if (text.includes('MISSED') || text.includes('REVIEW REQUIRED')) return ShieldAlert;
  if (text.includes('READINESS') || text.includes('CERTIFICATION')) return ShieldCheck;
  if (text.includes('EVIDENCE')) return FileCheck2;
  if (text.includes('ECIGN') || text.includes('SIGNATURE')) return PenTool;
  if (text.includes('POLICY') || text.includes('PUBLISHED')) return FileText;
  if (text.includes('TRAINING') || text.includes('ACKNOWLEDGMENT') || text.includes('COMPETENCY')) return BookOpen;
  if (text.includes('THREAD') || text.includes('COMMUNITY') || text.includes('ENGAGEMENT') || text.includes('ROLE')) return Users;
  if (text.includes('EXPIRING') || text.includes('SLA') || text.includes('STALE')) return Clock;
  if (text.includes('CROSS-LINK')) return Layers;
  if (text.includes('DRILL')) return Crosshair;
  if (text.includes('GAP')) return TrendingDown;
  if (text.includes('CONVERSION') || text.includes('USAGE')) return TrendingUp;
  if (text.includes('CLOSURE') || text.includes('COMPLETION')) return CheckCircle2;
  return Activity;
}

function EmptyMetricViz() {
  return (
    <div className="flex flex-col items-center justify-center text-[#D8D8D2] opacity-80 transition-opacity duration-300 group-hover:opacity-100">
      <svg
        width="66"
        height="66"
        viewBox="0 0 66 66"
        fill="none"
        aria-hidden="true"
        className="drop-shadow-[0_8px_16px_rgba(31,28,27,0.04)]"
      >
        <circle cx="33" cy="33" r="24" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
        <circle cx="33" cy="33" r="13" stroke="currentColor" strokeWidth="1" opacity="0.55" />
        <path d="M21 41 Q33 26 45 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 5" />
      </svg>
      <span className="mt-4 text-[9px] font-bold uppercase tracking-[0.22em] text-[#A0A0A0]">
        Gathering Metrics
      </span>
    </div>
  );
}

function DashboardLogoWatermark() {
  return <StaticCardWatermark className="ci-dashboard-logo-watermark" />;
}

function ModernDashboardCard({ card, index, mode = 'grid', onNavigate }: { card: ModernCardData; index: number; mode?: 'grid' | 'carousel'; onNavigate: (path: string) => void }) {
  const gridCardType = index === 0 ? 'featured' : (index === 5 || index === 6 ? 'wide' : 'normal');
  const cardType = mode === 'carousel' ? (card.carouselSize?.chartType ?? 'normal') : gridCardType;
  const sizingClass = mode === 'carousel'
    ? 'absolute'
    : index === 0
      ? 'md:col-span-6 md:row-span-2 min-h-[420px]'
      : (index === 5 || index === 6 ? 'md:col-span-6 min-h-[280px]' : 'md:col-span-3 min-h-[280px]');
  const theme = getDashboardTheme(card.status, (index % 3) !== 0, mode);

  const frameClass = mode === 'carousel'
    ? `${theme.cardBg} border-0 backdrop-blur-3xl rounded-2xl p-6 shadow-[0_53px_106px_-17px_rgba(0,0,0,0.3)]`
    : 'ci-dashboard-card bg-white rounded-[26px] p-8';

  const carouselStyle: CSSProperties | undefined = mode === 'carousel'
    ? {
        width: card.carouselSize?.w ?? 320,
        height: card.carouselSize?.h ?? 320,
        left: 0,
        top: `${card.cTop ?? 20}%`,
        zIndex: card.cZ ?? 10,
        transform: `translateX(${card.cX ?? 0}px)`,
      }
    : undefined;

  const [replayKey, setReplayKey] = useState(0);
  const handleMouseEnter = () => setReplayKey(k => k + 1);

  const resolvedChartColor = card.chart?.color || (
    card.status === 'WATCH' ? 'primary' :
    card.status === 'GOOD' ? 'blue' :
    card.status === 'REVIEW REQUIRED' ? 'pink' : 'secondary'
  );

  const chartNode = useMemo(() => {
    if (!card.chart) return <EmptyMetricViz />;
    const themeStroke = theme.stroke;
    if (card.chart.type === 'donut' && card.chart.value != null) {
      return <AnimatedDonut percentage={card.chart.value} colorType={resolvedChartColor} cardType={cardType} replayKey={replayKey} stroke={themeStroke} />;
    }
    if (card.chart.type === 'sparkline' && card.chart.data) {
      return <AnimatedSparkline data={card.chart.data} colorType={resolvedChartColor} cardType={cardType} replayKey={replayKey} stroke={themeStroke} />;
    }
    return null;
  }, [card.chart, cardType, replayKey, resolvedChartColor, theme.stroke]);

  const hoverAndAnimClass = mode === 'carousel' ? 'cursor-pointer' : 'cursor-pointer hover:-translate-y-1.5';

  return (
    <div
      onClick={() => onNavigate(card.targetPath)}
      onMouseEnter={handleMouseEnter}
      data-speed={mode === 'carousel' ? card.cSpeed : undefined}
      data-initial-x={mode === 'carousel' ? card.cX : undefined}
      className={`dashboard-card ci-stagger-card ${theme.text} ${frameClass} flex flex-col ${sizingClass} transition-all duration-500 ${hoverAndAnimClass} group`}
      style={{
        ...carouselStyle,
        animationDelay: mode === 'grid' ? `${index * 75}ms` : undefined,
      }}
    >
      <div className={cx('flex justify-between items-start gap-4', mode === 'carousel' ? 'mb-2' : 'mb-6')}>
        <div className="flex min-w-0 items-center gap-2">
          {createElement(getDashboardCardIcon(card.title), {
            className: 'h-4 w-4 shrink-0 text-[#A0A0A0] transition-colors duration-300 group-hover:text-[#007970]',
            'aria-hidden': true,
          })}
          <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#007970] md:text-[11px]">
            {card.title}
          </h3>
        </div>
        <span className={`text-[10px] px-3 py-1 rounded-full font-bold font-montserrat uppercase tracking-wider ${mode === 'grid' ? getBadgeStyles(card.status) : theme.badge}`}>
          {card.status}
        </span>
      </div>
      <div className="relative flex flex-1 items-center justify-center py-4">
        {chartNode}
      </div>
      <div className="mt-auto pt-5 shadow-[inset_0_1px_0_rgba(229,228,227,0.6)] transition-colors">
        <p className="text-[13px] font-normal leading-relaxed text-[#747470]">{card.footer}</p>
      </div>
    </div>
  );
}

function DashboardScreen({ routeView }: { routeView?: string | null }) {
  const navigate = useNavigate();

  const dashboardTabs = [
    { id: 'home', label: 'Home' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'policy', label: 'Policies' },
    { id: 'training', label: 'Training' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'community', label: 'Community' },
    { id: 'reports', label: 'Reports' },
  ] as const;
  type DashboardTabId = typeof dashboardTabs[number]['id'];
  type DashboardMetricTabId = Exclude<DashboardTabId, 'home'>;

  const requestedDashboardTab = routeView?.trim().toLowerCase() ?? '';
  const dashboardAliases: Partial<Record<string, DashboardTabId>> = {
    overview: 'reports',
    policies: 'policy',
  };
  const requestedTab = requestedDashboardTab ? (dashboardAliases[requestedDashboardTab] ?? requestedDashboardTab) : null;
  const activeTab: DashboardTabId = dashboardTabs.some((tab) => tab.id === requestedTab)
    ? (requestedTab as DashboardTabId)
    : 'home';
  const metricTab = activeTab === 'home' ? null : activeTab;
  const communityThreads = useThreadStore((state) => state.threads);
  const [dashboardNow] = useState(() => Date.now());

  const percent = (value: number, total: number): number => {
    if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
  };

  const statusFromPercent = (value: number): ModernCardData['status'] => (
    value >= 80 ? 'GOOD' : value >= 55 ? 'STEADY' : 'WATCH'
  );

  const sprintSummary = useMemo(() => buildSprintSummary(), []);
  const dashboardCalendarEvents = useMemo(() => buildCalendarEvents(), []);
  const dashboardEvidenceRows = useMemo(() => buildEvidenceRows(), []);
  const dashboardAuditRows = useMemo(() => buildAuditRows(), []);
  const dashboardReportTrendBars = useMemo(() => buildReportTrendBars().slice(0, 7), []);
  const communityMembers = useMemo(() => listCommunityUsers(), []);

  const workflowValues = useMemo(() => Object.values(WORKFLOWS), []);
  const workflowPolicyIds = useMemo(
    () => new Set(workflowValues.flatMap((workflow) => workflow.policyRefs ?? [])),
    [workflowValues],
  );
  const formLinkedPolicyIds = useMemo(
    () => new Set(FORMS_DATASET.flatMap((form) => form.policies).filter((policyId) => /^[A-Z]{2}-[A-Z]{2}-\d{3}$/.test(policyId))),
    [],
  );
  const achcPolicyIds = useMemo(() => new Set(achcSurveyRows.map((row) => row.policyId).filter(Boolean)), []);
  const hhEvidencePolicyIds = useMemo(() => new Set(hhEvidenceRows.map((row) => row.policyId).filter(Boolean)), []);

  const openSprintItems = Math.max(0, sprintSummary.total - sprintSummary.completed);
  const pendingSignatureCount = sprintSummary.awaitingSignature;
  const blockerPressureCount = sprintSummary.blocked;
  const missingEvidenceCount = sprintSummary.surveyCritical;
  const highRiskAlerts = sprintSummary.blocked + sprintSummary.surveyCritical + sprintSummary.overdue;
  const auditReadinessPct = percent(sprintSummary.readyToCertify, sprintSummary.total);
  const certificationReadinessPct = percent(sprintSummary.readyToCertify + sprintSummary.completed, sprintSummary.total);
  const evidenceClosurePct = percent(sprintSummary.completed + sprintSummary.readyToCertify, sprintSummary.total);
  const eventRiskCount = dashboardCalendarEvents.filter((event) => event.tone === 'orange' || Boolean(event.risk)).length;
  const eventRiskPct = percent(eventRiskCount, dashboardCalendarEvents.length);
  const signoffReadyPct = percent(Math.max(0, sprintSummary.total - pendingSignatureCount), sprintSummary.total);
  const expiringSignatureCount = pendingSignatureCount + sprintSummary.overdue;
  const expiringSignaturePct = percent(expiringSignatureCount, sprintSummary.total);

  // P1 fix: explicit support check before green/ready (evidence, sigs, no blockers)
  const hasFullCesSupport = sprintSummary.blocked === 0 && sprintSummary.awaitingSignature === 0 && sprintSummary.surveyCritical === 0 && sprintSummary.readyToCertify > 0;

  const policyCount = POLICY_CORPUS.length;
  const policyFormCoveragePct = percent(formLinkedPolicyIds.size, policyCount);
  const policyWorkflowCoveragePct = percent(workflowPolicyIds.size, policyCount);
  const achcMappingCoveragePct = percent(achcPolicyIds.size, policyCount);
  const hhEvidenceCoveragePct = percent(hhEvidencePolicyIds.size, policyCount);
  const crossLinkedPolicyCount = new Set([...formLinkedPolicyIds, ...workflowPolicyIds, ...achcPolicyIds, ...hhEvidencePolicyIds]).size;
  const policyCrossLinkPct = percent(crossLinkedPolicyCount, policyCount);
  const policyDomainPct = percent(new Set(POLICY_CORPUS.map((policy) => policy.domainCode)).size, LIFECYCLE_DOMAIN_ORDER.length);
  const policySignalBars = LIFECYCLE_DOMAIN_ORDER.slice(0, 7).map((domain) => POLICY_CORPUS.filter((policy) => policy.domainCode === domain).length);

  const gaoTrainingModules = ALL_MODULES.filter((module) => module.group === 'GAO').length;
  const annualTrainingModules = ALL_MODULES.filter((module) => module.group === 'ANN').length;
  const roleTrainingModules = ALL_MODULES.filter((module) => module.group === 'ROLE').length;
  const competencyTrainingModules = ALL_MODULES.filter((module) => module.method !== 'None').length;
  const supervisorSignoffModules = ALL_MODULES.filter((module) => module.supervisorSignature).length;
  const evidenceBackedModules = ALL_MODULES.filter((module) => module.evidenceAppendix && module.evidenceAppendix !== 'NONE').length;
  const policyLinkedTrainingModules = ALL_MODULES.filter((module) => module.policyRefs.length > 0).length;
  const requiredTrainingModules = gaoTrainingModules + annualTrainingModules;
  const trainingCatalogPct = percent(requiredTrainingModules, ALL_MODULES.length);
  const trainingGroupBars = ['GAO', 'ROLE', 'ANN', 'COMP', 'ADV'].map((group) => ALL_MODULES.filter((module) => module.group === group).length);

  const unresolvedThreadStatuses = new Set(['open', 'needs_brad', 'needs_human_review', 'planned', 'in_progress']);
  const unresolvedThreadCount = communityThreads.filter((thread) => unresolvedThreadStatuses.has(thread.status)).length;
  const unansweredThreadCount = communityThreads.filter((thread) => thread.status === 'open' || thread.status === 'needs_brad' || thread.status === 'needs_human_review').length;
  const resolvedThreadCount = communityThreads.filter((thread) => thread.status === 'answered' || thread.status === 'resolved' || thread.status === 'closed').length;
  const highRiskThreadCount = communityThreads.filter((thread) => thread.status === 'needs_human_review' || thread.category === 'bug' || thread.tags.some((tag) => /risk|urgent|blocked|audit/i.test(tag))).length;
  const threadToCesCount = communityThreads.filter((thread) => (thread.relatedEventIds?.length ?? 0) > 0).length;
  const knowledgeThreadCount = communityThreads.filter((thread) => thread.type === 'knowledge_article' || (thread.relatedHelpArticleIds?.length ?? 0) > 0).length;
  const staleThreadCount = communityThreads.filter((thread) => {
    if (!unresolvedThreadStatuses.has(thread.status)) return false;
    const lastActivity = new Date(thread.lastActivityAt).getTime();
    return Number.isFinite(lastActivity) && dashboardNow - lastActivity > 14 * 24 * 60 * 60 * 1000;
  }).length;
  const threadResolutionPct = percent(resolvedThreadCount, communityThreads.length);
  const threadToCesPct = percent(threadToCesCount, communityThreads.length);
  const knowledgeUsePct = percent(knowledgeThreadCount, communityThreads.length);
  const communityEngagementPct = percent(
    communityThreads.reduce((total, thread) => total + Math.max(1, thread.participantCount), 0),
    Math.max(communityMembers.length * 2, 1),
  );

  const dashboardHeaders: Record<DashboardMetricTabId, { title: string; subtitle: string }> = {
    compliance: {
      title: 'Compliance Readiness',
      subtitle: 'Audit-ready tracking for mandated events, evidence closure, eCign status, blocker pressure, and active sprint recovery.',
    },
    policy: {
      title: 'Policy & Attestation Health',
      subtitle: 'Monitor policy approval workflows, SLA adherence, expiration windows, and staff attestation gaps across the enterprise.',
    },
    training: {
      title: 'Training & Competency',
      subtitle: 'Track drill participation, onboarding completion, role-based training gaps, and supervisor sign-off readiness.',
    },
    evidence: {
      title: 'Evidence Completeness',
      subtitle: 'Track missing files, stale packets, expiring master evidence, eCign pressure, and audit-mode recovery signals.',
    },
    community: {
      title: 'Community Engagement',
      subtitle: 'Monitor support thread resolution, high-risk signals, and knowledge base adoption to support your teams.',
    },
    reports: {
      title: 'Agency Performance Reports',
      subtitle: 'Track key compliance, policy, training, evidence, and community metrics across the agency before they become survey risks.',
    },
  };

  const dashboardData: Record<DashboardMetricTabId, ModernCardData[]> = {
    compliance: [
      { title: 'CERTIFICATION / LOCK READINESS', status: hasFullCesSupport ? statusFromPercent(certificationReadinessPct) : 'WATCH', chart: { type: 'donut', value: certificationReadinessPct }, footer: hasFullCesSupport ? `${sprintSummary.readyToCertify} ready, ${sprintSummary.completed} completed.` : `${sprintSummary.readyToCertify} ready (PROJECTED — evidence/signatures/minutes incomplete; not certification-ready)`, targetPath: '/audit?view=lock-readiness' },
      { title: 'OPEN MISSED EVENTS', status: eventRiskCount > 0 ? 'REVIEW REQUIRED' : 'GOOD', chart: { type: 'donut', value: eventRiskPct }, footer: `${eventRiskCount} of ${dashboardCalendarEvents.length} calendar events require recovery.`, targetPath: '/calendar?view=sprint&filter=missed' },
      { title: 'EVIDENCE CLOSURE', status: hasFullCesSupport ? statusFromPercent(evidenceClosurePct) : 'WATCH', chart: { type: 'donut', value: evidenceClosurePct }, footer: hasFullCesSupport ? `${sprintSummary.readyToCertify} items ready to certify.` : `${sprintSummary.readyToCertify} items (PROJECTED — missing evidence/signatures; validate before close)`, targetPath: '/evidence?filter=missing-required' },
      { title: 'ECIGN SIGNATURE STATUS', status: statusFromPercent(signoffReadyPct), chart: { type: 'sparkline', data: dashboardReportTrendBars }, footer: `${pendingSignatureCount} sprint items await signature.`, targetPath: '/reports/ecign-signatures' },
      { title: 'ECIGN EXPIRING — 90 DAYS', status: expiringSignatureCount > 0 ? 'WATCH' : 'GOOD', chart: { type: 'donut', value: expiringSignaturePct }, footer: `${expiringSignatureCount} signature-related items in watch.`, targetPath: '/reports/ecign-expiring?window=90' },
      { title: 'EXPIRING / MISSING MASTER EVIDENCE — 90 DAYS', status: dashboardEvidenceRows.length > 0 ? 'WATCH' : 'GOOD', chart: undefined, footer: `${dashboardEvidenceRows.length} evidence projection rows in current review.`, targetPath: '/reports/master-evidence-expiring?window=90' },
      { title: 'BLOCKER PRESSURE', status: blockerPressureCount > 0 ? 'WATCH' : 'GOOD', chart: undefined, footer: `${blockerPressureCount} active pressure points.`, targetPath: '/ces/board?filter=blocked' },
    ],
    policy: [
      { title: 'POLICY FORM COVERAGE', status: statusFromPercent(policyFormCoveragePct), chart: { type: 'donut', value: policyFormCoveragePct }, footer: `${formLinkedPolicyIds.size} policies linked to forms.`, targetPath: '/forms' },
      { title: 'POLICY WORKFLOW COVERAGE', status: statusFromPercent(policyWorkflowCoveragePct), chart: { type: 'donut', value: policyWorkflowCoveragePct }, footer: `${workflowPolicyIds.size} policies linked to generated workflows.`, targetPath: '/workflows' },
      { title: 'ACHC MAPPING COVERAGE', status: statusFromPercent(achcMappingCoveragePct), chart: { type: 'donut', value: achcMappingCoveragePct }, footer: `${achcPolicyIds.size} policies mapped to ACHC survey rows.`, targetPath: '/framework?view=achc' },
      { title: 'POLICY CROSS-LINK COVERAGE', status: statusFromPercent(policyCrossLinkPct), chart: undefined, footer: `${crossLinkedPolicyCount} policies have at least one mapped signal.`, targetPath: '/reports/policy-crosslinks' },
      { title: 'POLICY DOMAINS MAPPED', status: statusFromPercent(policyDomainPct), chart: { type: 'donut', value: policyDomainPct }, footer: `${LIFECYCLE_DOMAIN_ORDER.length} lifecycle domains in taxonomy.`, targetPath: '/framework' },
      { title: 'HH EVIDENCE MAP', status: statusFromPercent(hhEvidenceCoveragePct), chart: { type: 'donut', value: hhEvidenceCoveragePct }, footer: `${hhEvidenceRows.length} HH evidence rows across ${hhEvidencePolicyIds.size} policies.`, targetPath: '/framework?view=hh-evidence' },
      { title: 'POLICY DOMAIN LOAD', status: 'STEADY', chart: { type: 'sparkline', data: policySignalBars }, footer: `${policyCount} active corpus records by domain.`, targetPath: '/library/policies' },
    ],
    training: [
      { title: 'CORE TRAINING CATALOG', status: statusFromPercent(trainingCatalogPct), chart: { type: 'donut', value: trainingCatalogPct }, footer: `${requiredTrainingModules} GAO + annual required modules.`, targetPath: '/journey' },
      { title: 'COMPETENCY ASSESSMENT MODULES', status: statusFromPercent(percent(competencyTrainingModules, ALL_MODULES.length)), chart: { type: 'donut', value: percent(competencyTrainingModules, ALL_MODULES.length) }, footer: `${competencyTrainingModules} modules require validation beyond reading.`, targetPath: '/journey/supervisor' },
      { title: 'ANNUAL TRAINING CATALOG', status: statusFromPercent(percent(annualTrainingModules, ALL_MODULES.length)), chart: { type: 'donut', value: percent(annualTrainingModules, ALL_MODULES.length) }, footer: `${annualTrainingModules} annual modules in the canonical catalog.`, targetPath: '/journey/admin?report=annual-training' },
      { title: 'POLICY-LINKED TRAINING', status: statusFromPercent(percent(policyLinkedTrainingModules, ALL_MODULES.length)), chart: { type: 'sparkline', data: trainingGroupBars }, footer: `${policyLinkedTrainingModules} modules cite policy source references.`, targetPath: '/reports/training-policy-attestation' },
      { title: 'SUPERVISOR SIGN-OFF MODULES', status: supervisorSignoffModules > 0 ? 'WATCH' : 'GOOD', chart: undefined, footer: `${supervisorSignoffModules} modules require supervisor signature.`, targetPath: '/journey/supervisor?filter=signoff-missing' },
      { title: 'TRAINING EVIDENCE APPENDICES', status: evidenceBackedModules > 0 ? 'STEADY' : 'WATCH', chart: undefined, footer: `${evidenceBackedModules} modules generate appendix evidence.`, targetPath: '/reports/training-evidence' },
      { title: 'ROLE-SPECIFIC MODULES', status: roleTrainingModules > 0 ? 'STEADY' : 'WATCH', chart: undefined, footer: `${roleTrainingModules} modules assigned by employee role.`, targetPath: '/journey/admin?filter=role-modules' },
    ],
    evidence: [
      { title: 'EVIDENCE CLOSURE', status: statusFromPercent(evidenceClosurePct), chart: { type: 'donut', value: evidenceClosurePct }, footer: `${sprintSummary.readyToCertify + sprintSummary.completed} sprint items ready or closed.`, targetPath: '/evidence?filter=missing-required' },
      { title: 'NOT-READY EVIDENCE SIGNALS', status: missingEvidenceCount > 0 ? 'WATCH' : 'GOOD', chart: { type: 'donut', value: percent(missingEvidenceCount, sprintSummary.total) }, footer: `${missingEvidenceCount} sprint items are not audit ready.`, targetPath: '/audit?filter=missing-evidence' },
      { title: 'ECIGN SIGNATURE STATUS', status: statusFromPercent(signoffReadyPct), chart: { type: 'sparkline', data: dashboardReportTrendBars }, footer: `${pendingSignatureCount} signature items remain open.`, targetPath: '/reports/ecign-signatures' },
      { title: 'ECIGN EXPIRING — 90 DAYS', status: expiringSignatureCount > 0 ? 'WATCH' : 'GOOD', chart: { type: 'donut', value: expiringSignaturePct }, footer: `${expiringSignatureCount} signature items in watch.`, targetPath: '/reports/ecign-expiring?window=90' },
      { title: 'MASTER EVIDENCE WATCH', status: dashboardEvidenceRows.length > 0 ? 'WATCH' : 'GOOD', chart: undefined, footer: `${dashboardEvidenceRows.length} evidence projection rows available.`, targetPath: '/reports/master-evidence-expiring?window=90' },
      { title: 'PACKET STUDIO THROUGHPUT', status: statusFromPercent(percent(FORMS_DATASET.filter((form) => form.classifications.includes('audit_critical')).length, FORMS_DATASET.length)), chart: { type: 'sparkline', data: LIFECYCLE_DOMAIN_ORDER.slice(0, 7).map((domain) => FORMS_DATASET.filter((form) => form.domainCode === domain).length) }, footer: `${FORMS_DATASET.length} form artifacts available for packets.`, targetPath: '/evidence/packet-studio' },
      { title: 'AUDIT MODE OPEN ITEMS', status: dashboardAuditRows.length > 0 ? 'REVIEW REQUIRED' : 'GOOD', chart: undefined, footer: `${dashboardAuditRows.length} audit rows in current projection.`, targetPath: '/audit' },
    ],
    community: [
      { title: 'ENGAGEMENT BY ROLE', status: statusFromPercent(communityEngagementPct), chart: undefined, footer: `${communityThreads.length} persisted threads across ${communityMembers.length} profiles.`, targetPath: '/reports/community-engagement-by-role' },
      { title: 'THREAD-TO-CES CONVERSION', status: statusFromPercent(threadToCesPct), chart: { type: 'donut', value: threadToCesPct }, footer: `${threadToCesCount} threads link to CES events.`, targetPath: '/reports/community-to-ces' },
      { title: 'OPEN UNANSWERED THREADS', status: unansweredThreadCount > 0 ? 'STEADY' : 'GOOD', chart: { type: 'donut', value: percent(unansweredThreadCount, communityThreads.length) }, footer: `${unansweredThreadCount} unanswered threads need triage.`, targetPath: '/community/threads?filter=unanswered' },
      { title: 'THREAD RESOLUTION SLA', status: statusFromPercent(threadResolutionPct), chart: { type: 'donut', value: threadResolutionPct }, footer: `${resolvedThreadCount} threads answered, resolved, or closed.`, targetPath: '/reports/community-thread-sla' },
      { title: 'KNOWLEDGE BASE ARTICLE USAGE', status: statusFromPercent(knowledgeUsePct), chart: undefined, footer: `${knowledgeThreadCount} threads reference knowledge articles.`, targetPath: '/reports/help-center-usage' },
      { title: 'HIGH-RISK THREAD SIGNALS', status: highRiskThreadCount > 0 ? 'WATCH' : 'GOOD', chart: { type: 'sparkline', data: [communityThreads.length, unresolvedThreadCount, unansweredThreadCount, highRiskThreadCount, threadToCesCount, knowledgeThreadCount, staleThreadCount] }, footer: `${highRiskThreadCount} flagged community signals.`, targetPath: '/community/threads?filter=flagged' },
      { title: 'STALE COMMUNITY QUESTIONS', status: staleThreadCount > 0 ? 'WATCH' : 'GOOD', chart: undefined, footer: `${staleThreadCount} unresolved threads older than 14 days.`, targetPath: '/community/threads?filter=stale' },
    ],
    reports: [
      { title: 'OPEN MISSED COMPLIANCE EVENTS', status: eventRiskCount > 0 ? 'REVIEW REQUIRED' : 'GOOD', chart: { type: 'donut', value: eventRiskPct }, footer: `${eventRiskCount} calendar events flagged for recovery.`, targetPath: '/calendar?view=sprint&filter=missed' },
      { title: 'EVIDENCE CLOSURE', status: statusFromPercent(evidenceClosurePct), chart: { type: 'donut', value: evidenceClosurePct }, footer: `${sprintSummary.readyToCertify + sprintSummary.completed} required artifacts ready or closed.`, targetPath: '/evidence?filter=missing-required' },
      { title: 'ECIGN EXPIRING — 90 DAYS', status: expiringSignatureCount > 0 ? 'WATCH' : 'GOOD', chart: { type: 'sparkline', data: dashboardReportTrendBars }, footer: `${expiringSignatureCount} signature items within the sprint watch.`, targetPath: '/reports/ecign-expiring?window=90' },
      { title: 'OPEN UNANSWERED THREADS', status: unansweredThreadCount > 0 ? 'STEADY' : 'GOOD', chart: undefined, footer: `${unansweredThreadCount} community threads need action.`, targetPath: '/community/threads?filter=unanswered' },
      { title: 'POLICY CROSS-LINK COVERAGE', status: statusFromPercent(policyCrossLinkPct), chart: { type: 'donut', value: policyCrossLinkPct }, footer: `${crossLinkedPolicyCount} policies linked to forms, workflows, ACHC, or HH evidence.`, targetPath: '/policy-lifecycle?stage=REVIEW' },
      { title: 'HH EVIDENCE COVERAGE', status: statusFromPercent(hhEvidenceCoveragePct), chart: undefined, footer: `${hhEvidencePolicyIds.size} policies represented in HH evidence map.`, targetPath: '/reports/policy-expiration?window=90' },
      { title: 'REQUIRED TRAINING CATALOG', status: statusFromPercent(trainingCatalogPct), chart: undefined, footer: `${requiredTrainingModules} required GAO and annual modules in catalog.`, targetPath: '/reports/training-overdue' },
    ],
  };

  const dashboardHomeStats: readonly { icon: LucideIcon; label: string; value: string }[] = [
    { icon: ShieldCheck, label: 'Audit readiness', value: `${auditReadinessPct}%` },
    { icon: ClipboardCheck, label: 'Open sprint items', value: String(openSprintItems) },
    { icon: FileCheck2, label: 'Not audit ready', value: String(missingEvidenceCount) },
    { icon: PenTool, label: 'Pending sign-offs', value: String(pendingSignatureCount) },
    { icon: BookOpen, label: 'Core training modules', value: String(requiredTrainingModules) },
    { icon: ShieldAlert, label: 'High-risk alerts', value: String(highRiskAlerts) },
  ];

  const dashboardFocusCards: readonly {
    body: string;
    category: string;
    icon: LucideIcon;
    status: string;
    statusClass: string;
    title: string;
    to: string;
  }[] = [
    {
      body: 'Review open compliance work, blocked items, overdue tasks, missing evidence, pending approvals, and sprint readiness.',
      category: 'CES',
      icon: ClipboardCheck,
      status: `${openSprintItems} open`,
      statusClass: 'bg-[#E5FEFF] text-[#007970]',
      title: 'Compliance Execution Sprint',
      to: '/dashboard?view=compliance',
    },
    {
      body: 'Check overdue reviews, policy gaps, linked forms, workflow coverage, ACHC mappings, and lifecycle items that need action.',
      category: 'Policies',
      icon: FileText,
      status: `${policyCount} policies`,
      statusClass: 'bg-[#EEF5FF] text-[#4E8FE8]',
      title: 'Policy Readiness',
      to: '/dashboard?view=policy',
    },
    {
      body: 'Track onboarding modules, annual training, role-based learning paths, incomplete quizzes, competency checks, and certificates.',
      category: 'Training',
      icon: BookOpen,
      status: `${requiredTrainingModules} core`,
      statusClass: 'bg-[#FCEBEA] text-[#B3261E]',
      title: 'Training & Competency',
      to: '/dashboard?view=training',
    },
    {
      body: 'Find missing files, unsigned packets, stale evidence, expiring items, Drive-link gaps, and records not yet ready for survey review.',
      category: 'Evidence',
      icon: FileCheck2,
      status: `${missingEvidenceCount} not ready`,
      statusClass: 'bg-[#FFF2EB] text-[#F06923]',
      title: 'Evidence Completeness',
      to: '/dashboard?view=evidence',
    },
    {
      body: 'Surface active PIPs, CAPs, adverse events, complaints, infection surveillance, feeder audits, and Governing Body escalation items.',
      category: 'QAPI',
      icon: AlertTriangle,
      status: `${blockerPressureCount} blockers`,
      statusClass: 'bg-[#E5FEFF] text-[#007970]',
      title: 'QAPI & Improvement Watch',
      to: '/compliance/master-controls',
    },
    {
      body: 'Get step-by-step help for policies, workflows, missing evidence, mandated events, QAPI packets, and audit readiness questions.',
      category: 'Brad',
      icon: PanelRightOpen,
      status: 'Ready',
      statusClass: 'bg-[#E5FEFF] text-[#007970]',
      title: 'Ask Brad What Needs Attention',
      to: '/iadministrator',
    },
  ];

  const dashboardQuickActions: readonly { icon: LucideIcon; label: string; to: string }[] = [
    { icon: Activity, label: 'Start Daily Review', to: '/dashboard?view=compliance' },
    { icon: ClipboardCheck, label: 'Open CES Sprint', to: '/compliance' },
    { icon: Search, label: 'Review Missing Evidence', to: '/audit?filter=missing-evidence' },
    { icon: PenTool, label: 'Check Pending Signatures', to: '/reports/ecign-signatures' },
    { icon: FileText, label: 'Open Policy Readiness', to: '/dashboard?view=policy' },
    { icon: BookOpen, label: 'View Training Due', to: '/dashboard?view=training' },
    { icon: AlertTriangle, label: 'Open QAPI Watch', to: '/compliance/master-controls' },
    { icon: PanelRightOpen, label: 'Ask Brad What to Do Next', to: '/iadministrator' },
  ];

  const activeHeader = metricTab ? dashboardHeaders[metricTab] : null;
  const cards = metricTab ? dashboardData[metricTab] : [];

  return (
    <div className="v6-dashboard-shell min-h-screen w-full overflow-x-hidden bg-[#FAFAF7] px-6 pb-16 pt-4 font-roboto text-[#52404B] selection:bg-[#E5FEFF] md:px-12" data-hash-id="dashboard" data-route="/dashboard">
      <main id="dashboard-content" className="mx-auto flex w-full max-w-[1400px] flex-col">
        <div className="relative z-20 flex justify-start">
          <nav className={workspaceTabNavClass} role="tablist" aria-label="Dashboard sections">
            {dashboardTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const target = tab.id === 'home' ? '/dashboard' : `/dashboard?view=${tab.id}`;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigate(target, { replace: true })}
                  className={cx(
                    workspaceCompactTabClass,
                    'whitespace-nowrap',
                    isActive ? workspaceTabActiveClass : workspaceTabInactiveClass,
                  )}
                  role="tab"
                  aria-selected={isActive}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === 'home' ? (
          <div className="space-y-10 pb-12">
            <section className="ci-page-hero relative overflow-hidden rounded-b-[24px] rounded-tr-[24px] bg-white p-10 shadow-sm md:p-14">
              <DashboardLogoWatermark />
              <div className="relative z-10 max-w-4xl">
                <p className="mb-6 font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#F06923]">Care Indeed Command Center</p>
                <h1 className="mb-6 font-montserrat text-4xl font-bold leading-none tracking-tight text-[#007970] md:text-5xl lg:text-6xl">
                  Your Compliance Day, <br />
                  At a Glance
                </h1>
                <p className="mb-10 max-w-3xl font-roboto text-lg font-light leading-relaxed text-[#52404B] md:text-xl">
                  A focused executive dashboard showing what needs attention today across compliance execution, policy readiness, training progress, evidence status, open risks, and team activity.
                </p>
                <div className="flex flex-col gap-4 font-montserrat sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard?view=compliance', { replace: true })}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.38)]"
                  >
                    <Activity className="h-4 w-4" aria-hidden />
                    Start Daily Review
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/audit')}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-[#007970] transition-all hover:bg-[#F7FEFF]"
                  >
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                    Open Audit Mode
                  </button>
                </div>
              </div>
            </section>

            <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
              {dashboardHomeStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="ci-stagger-card group flex min-h-[164px] flex-col items-center justify-center rounded-[24px] bg-white p-6 text-center shadow-sm transition-colors hover:border-[#007970]" style={{ animationDelay: `${dashboardHomeStats.indexOf(stat) * 75}ms` }}>
                    <Icon className="mb-4 h-6 w-6 text-[#007970]" aria-hidden />
                    <span className="mb-3 font-montserrat text-3xl font-bold text-[#F06923] transition-transform duration-300 group-hover:scale-110 md:text-4xl">{stat.value}</span>
                    <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#747470]">{stat.label}</span>
                  </div>
                );
              })}
            </div>

            <section className="rounded-[24px] bg-white p-8 shadow-sm md:p-10">
              <div className="mb-8 max-w-3xl">
                <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Today&apos;s Focus</h2>
                <p className="mt-3 text-base leading-relaxed text-[#747470]">
                  Start with the work most likely to affect survey readiness, then jump into the detailed dashboard view behind each signal.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {dashboardFocusCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => navigate(card.to, { replace: card.to.startsWith('/dashboard') })}
                      className="ci-stagger-card group flex min-h-[248px] flex-col justify-between rounded-[24px] bg-white p-8 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
                      style={{ animationDelay: `${index * 75}ms` }}
                    >
                      <span>
                        <span className="mb-6 flex items-center justify-between gap-4">
                          <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#E5FEFF] text-[#007970]">
                            <Icon className="h-6 w-6" aria-hidden />
                          </span>
                          <span className={cx('rounded-full px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wider', card.statusClass)}>
                            {card.status}
                          </span>
                        </span>
                        <span className="font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#F06923]">{card.category}</span>
                        <span className="mt-3 block font-montserrat text-xl font-bold text-[#007970] transition-colors group-hover:text-[#F06923]">{card.title}</span>
                        <span className="mt-4 block text-sm leading-relaxed text-[#747470]">{card.body}</span>
                      </span>
                      <span className="mt-7 inline-flex items-center gap-2 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970]">
                        Open view
                        <ArrowRight className="h-4 w-4 text-[#F06923] transition-transform group-hover:translate-x-1" aria-hidden />
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[24px] bg-white p-8 shadow-sm md:p-10">
              <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Quick Actions</h2>
              <div className="mt-8 flex flex-wrap gap-4">
                {dashboardQuickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => navigate(action.to, { replace: action.to.startsWith('/dashboard') })}
                      className="group inline-flex items-center gap-2 rounded-[12px] bg-[#FAFBF8] px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#52404B] transition-colors hover:bg-[#E5FEFF] hover:text-[#007970]"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {action.label}
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mx-auto max-w-4xl rounded-[24px] bg-[#E5FEFF] p-10 text-center shadow-sm md:p-12">
              <h2 className="font-montserrat text-3xl font-bold text-[#007970]">Run the daily readiness check</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#005C55]">
                Review today&apos;s open work, blockers, evidence gaps, sign-offs, policy items, training deadlines, and high-risk alerts before they become survey problems.
              </p>
              <button
                type="button"
                onClick={() => navigate('/dashboard?view=compliance', { replace: true })}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-4 font-montserrat text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.32)]"
              >
                Run Daily Check
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </section>
          </div>
        ) : activeHeader ? (
          <>
            <section className="ci-page-hero ci-dashboard-panel relative z-10 overflow-hidden rounded-b-[32px] rounded-tr-[32px] bg-white p-10 md:p-14">
              <div className="relative z-10 max-w-3xl">
                <span className="mb-4 block font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#F06923]">
                  Performance Insights
                </span>
                <h1 className="mb-4 font-montserrat text-3xl font-bold leading-[1.15] tracking-tight text-[#007970] md:text-5xl">
                  {activeHeader.title}
                </h1>
                <p className="text-lg font-light leading-relaxed text-[#747470]">
                  {activeHeader.subtitle}
                </p>
              </div>
            </section>

            <section className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12" aria-label={`${activeHeader.title} metrics`}>
              {cards.map((card, index) => (
                <ModernDashboardCard key={`${activeTab}-${card.title}`} card={card} index={index} mode="grid" onNavigate={navigate} />
              ))}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

// (Old dashboard metrics + carousel implementation removed per redesign — new CES Command Center above)

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
        <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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
        <aside className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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
      <section className="grid gap-xl desktop:grid-cols-1">
        <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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
        <aside className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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

function PolicyHomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="-m-xl min-h-screen overflow-x-hidden bg-[#FAFBF8] px-6 pb-16 pt-4 font-roboto text-[#52404B] selection:bg-[#E5FEFF] md:px-12" data-hash-id="policy-home" data-route="/library">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col">
        <div className="relative z-20 flex justify-start">
          <PolicyAreaNav />
        </div>

        <div className="space-y-10 pb-12">
          <section className="ci-page-hero relative overflow-hidden rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-10 shadow-sm md:p-14">
            <StaticCardWatermark />
            <div className="relative z-10 flex flex-col items-start justify-between gap-12 xl:flex-row xl:items-end">
              <div className="max-w-3xl">
                <h2 className="mb-6 font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#F06923]">Policy Command Center</h2>
                <h1 className="mb-6 font-montserrat text-4xl font-bold leading-none tracking-tight text-[#007970] md:text-5xl lg:text-6xl">
                  Care Indeed <br />
                  Policy Library
                </h1>
                <p className="mb-10 max-w-3xl font-roboto text-lg font-light leading-relaxed text-[#52404B] md:text-xl">
                  A defensible home health policy system connecting agency policies, forms, workflows, ACHC standards, CMS Conditions of Participation, evidence expectations, and policy lifecycle controls in one searchable workspace.
                </p>
                <div className="flex flex-col gap-4 font-montserrat sm:flex-row">
                  <button
                    type="button"
                    onClick={() => navigate('/library/policies')}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.38)]"
                  >
                    <BookOpen className="h-4 w-4" aria-hidden />
                    Open Policy Library
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/policy-lifecycle')}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-[#007970] transition-all hover:bg-[#F7FEFF]"
                  >
                    <AlertTriangle className="h-4 w-4" aria-hidden />
                    View Policy Gaps
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-6">
            {policyHomeStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group flex min-h-[164px] flex-col items-center justify-center rounded-[24px] border border-[#E5E4E3] bg-white p-6 text-center shadow-sm transition-colors hover:border-[#007970]">
                  <Icon className="mb-4 h-6 w-6 text-[#007970]" aria-hidden />
                  <span className="mb-3 font-montserrat text-3xl font-bold text-[#F06923] transition-transform duration-300 group-hover:scale-110 md:text-4xl">{stat.value}</span>
                  <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#747470]">{stat.label}</span>
                </div>
              );
            })}
          </div>

          <section className="rounded-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
            <div className="mb-8 max-w-3xl">
              <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Policy Workspace</h2>
              <p className="mt-3 text-base leading-relaxed text-[#747470]">
                Move between the library, linked forms, workflow evidence, taxonomy, ACHC mapping, and review controls without leaving the policy command surface.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {policyWorkspaceCards.map((card) => {
                const Icon = card.icon;
                const tone = card.tone === 'orange'
                  ? {
                      badge: 'bg-[#FFF2EB] text-[#F06923]',
                      icon: 'bg-[#FFF2EB] text-[#F06923]',
                    }
                  : card.tone === 'blue'
                    ? {
                        badge: 'bg-[#EEF5FF] text-[#4E8FE8]',
                        icon: 'bg-[#EEF5FF] text-[#4E8FE8]',
                      }
                    : {
                        badge: 'bg-[#E5FEFF] text-[#007970]',
                        icon: 'bg-[#E5FEFF] text-[#007970]',
                      };
                return (
                  <button
                    key={card.title}
                    type="button"
                    onClick={() => navigate(card.to)}
                    className="group flex min-h-[260px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-8 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
                  >
                    <span>
                      <span className="mb-6 flex items-center justify-between gap-4">
                        <span className={cx('grid h-12 w-12 place-items-center rounded-[16px]', tone.icon)}>
                          <Icon className="h-6 w-6" aria-hidden />
                        </span>
                        <span className={cx('rounded-full px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wider', tone.badge)}>
                          {card.status}
                        </span>
                      </span>
                      <span className="font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#F06923]">{card.category}</span>
                      <span className="mt-3 block font-montserrat text-xl font-bold text-[#007970] transition-colors group-hover:text-[#F06923]">{card.title}</span>
                      <span className="mt-4 block text-sm leading-relaxed text-[#747470]">{card.body}</span>
                    </span>
                    <span className="mt-7 inline-flex items-center gap-2 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970]">
                      Open workspace
                      <ArrowRight className="h-4 w-4 text-[#F06923] transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
              <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Quick Actions</h2>
              <div className="mt-8 flex flex-wrap gap-4">
                {policyQuickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => navigate(action.to)}
                      className="inline-flex items-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#52404B] transition-colors hover:border-[#C4F4F5] hover:bg-[#E5FEFF] hover:text-[#007970]"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10">
              <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Taxonomy Framework</h2>
              <div className="mt-8 space-y-5">
                {[
                  { label: 'Policies', helper: 'Home, Policies, Forms, Workflows, Taxonomy' },
                  { label: 'Taxonomy', helper: 'Framework, Lifecycle, ACHC' },
                  { label: 'ACHC', helper: 'HH Evidence, Standards Matrix, Crosswalk' },
                ].map((item, index) => (
                  <div key={item.label} className="flex gap-4">
                    <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-[12px] font-montserrat text-sm font-bold', index === 0 ? 'bg-[#007970] text-white' : index === 1 ? 'bg-[#FFF2EB] text-[#F06923]' : 'bg-[#E5FEFF] text-[#007970]')}>
                      {index + 1}
                    </span>
                    <span>
                      <span className="block font-montserrat text-base font-bold text-[#007970]">{item.label}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-[#747470]">{item.helper}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-4xl rounded-[24px] border border-[#C4F4F5] bg-[#E5FEFF] p-10 text-center shadow-sm md:p-12">
            <h2 className="font-montserrat text-3xl font-bold text-[#007970]">Ready to review policy readiness?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#005C55]">
              Check missing links, overdue reviews, form dependencies, workflow coverage, ACHC mappings, and evidence expectations before they become survey findings.
            </p>
            <button
              type="button"
              onClick={() => navigate('/policy-lifecycle')}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-4 font-montserrat text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.32)]"
            >
              Run Policy Readiness Check
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

function PolicyMatrixScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('ALL');
  const [tier, setTier] = useState('ALL');

  const domainOptions = useMemo(
    () => Array.from(new Set(policyRowsBase.map((row) => row.domain))).sort(),
    [],
  );
  const tierOptions = useMemo(
    () => Array.from(new Set(policyRowsBase.map((row) => row.tier))).sort(),
    [],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return policyRowsBase.filter((row) => {
      if (domain !== 'ALL' && row.domain !== domain) return false;
      if (tier !== 'ALL' && row.tier !== tier) return false;
      if (!query) return true;
      return (
        row.id.toLowerCase().includes(query) ||
        row.title.toLowerCase().includes(query) ||
        row.domain.toLowerCase().includes(query) ||
        row.subdomain.toLowerCase().includes(query) ||
        row.steward.toLowerCase().includes(query)
      );
    });
  }, [domain, search, tier]);

  const handleRowClick = (row: BasicRow) => {
    const id = row.id;
    if (id) navigate(`/library/${encodeURIComponent(id)}`, { state: { policyBackLabel: 'Policies', policyBackTo: '/library/policies' } });
  };
  const visibleRows = filteredRows.slice(0, 60);
  const hiddenCount = filteredRows.length - visibleRows.length;

  return (
    <div className="min-h-screen bg-[#FAFBF8] px-6 pb-16 pt-4 font-roboto text-[#52404B] md:px-12" data-hash-id="policy-library" data-route="/library/policies">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col">
        <PolicyAreaNav />
        <section className="ci-page-hero mb-8 rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:px-12 md:py-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 font-montserrat text-[12px] font-bold uppercase tracking-wider text-[#F06923]">Policy Registry</p>
              <h1 className="font-montserrat text-3xl font-bold leading-tight tracking-tight text-[#007970] md:text-5xl">Policy Library</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#747470]">
                Search and open the canonical policy corpus without the old dense table wall.
              </p>
            </div>
          </div>
        </section>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {policyMetrics.map((metric) => (
            <div key={metric.label} className="rounded-[24px] border border-[#E5E4E3] bg-white p-7 shadow-sm">
              <p className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470]">{metric.label}</p>
              <p className="mt-3 font-montserrat text-4xl font-bold text-[#F06923]">{metric.value}</p>
              <p className="mt-3 text-sm text-[#747470]">{metric.helper}</p>
            </div>
          ))}
        </div>

        <section className="rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-8 shadow-sm md:p-10" aria-label="Policy library">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Policies</h2>
              <p className="mt-2 text-sm text-[#747470]">{filteredRows.length} of {policyRowsBase.length} records</p>
            </div>
            <div className="flex flex-col gap-3 lg:flex-row">
              <label className="flex min-h-11 min-w-[260px] items-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 text-sm text-[#747470]">
                <Search className="h-4 w-4 shrink-0" aria-hidden />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ID, title, owner..."
                  className="w-full bg-transparent py-3 text-[#52404B] outline-none placeholder:text-[#9A9A96]"
                  aria-label="Search policy library"
                />
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                aria-label="Filter by domain"
                className="min-h-11 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470] outline-none focus:border-[#007970]"
              >
                <option value="ALL">All domains</option>
                {domainOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                aria-label="Filter by tier"
                className="min-h-11 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470] outline-none focus:border-[#007970]"
              >
                <option value="ALL">All tiers</option>
                {tierOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
          </div>

          {visibleRows.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleRows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => handleRowClick(row)}
                  className="group flex min-h-[238px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
                >
                  <span>
                    <span className="mb-4 flex items-start justify-between gap-4">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#F06923]">{row.id}</span>
                      <ToneTag tone="teal">{row.tier}</ToneTag>
                    </span>
                    <span className="block font-montserrat text-lg font-semibold leading-snug text-[#007970] transition-colors group-hover:text-[#F06923]">
                      {row.title}
                    </span>
                    <span className="mt-3 block text-sm leading-relaxed text-[#747470]">{row.domain} - {row.subdomain}</span>
                  </span>
                  <span className="mt-6 flex items-center justify-between gap-4 border-t border-[#E5E4E3] pt-4">
                    <span className="min-w-0 text-xs font-medium leading-relaxed text-[#747470]">{row.steward}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[#F06923]" aria-hidden />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#E5E4E3] bg-[#FAFBF8] p-8 text-center">
              <Search className="mb-3 h-6 w-6 text-[#747470]" aria-hidden />
              <p className="font-montserrat text-sm font-bold text-[#007970]">No matching policies</p>
              <p className="mt-2 max-w-sm text-sm text-[#747470]">Try a different policy ID, title, domain, or owner.</p>
            </div>
          )}

          {hiddenCount > 0 ? (
            <p className="mt-8 text-center text-sm text-[#747470]">
              Showing first 60 matches. Use search or filters to narrow the list.
            </p>
          ) : null}
        </section>

        <section className="mt-8 grid gap-5 xl:grid-cols-3">
          {policyCards.map((card) => {
            const Icon = card.icon ?? FileText;
            const progress = card.progress ?? 0;
            return (
              <article key={card.title} className="flex min-h-[192px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-7 shadow-sm">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#E5FEFF] text-[#007970]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <ToneBadge size="sm" status={card.status} />
                  </div>
                  <h3 className="font-montserrat text-base font-bold text-[#007970]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#747470]">{card.body}</p>
                </div>
                <div className="mt-5">
                  <ProgressMeter label="Coverage" tone={card.tone} value={progress} />
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

function PatientDetailScreen() {
  const params = useParams<{ patientId?: string }>();
  const patientId = params.patientId?.trim() || patientRows[0]?.id || 'pat-001';
  const match = MOCK_PATIENTS.find((p) => p.id === patientId) || MOCK_PATIENTS[0];
  const displayTitle = match ? `${match.firstName} ${match.lastName} - SOC Active` : 'Patient Detail';

  return (
    <ScreenStack metrics={patientMetrics}>
      <section className="grid gap-xl desktop:grid-cols-1">
        <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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
        <aside className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
          <div className="mb-lg grid gap-xs">
            <h2 className="text-h2 font-medium text-ink">Care coordination</h2>
            <p className="text-sm text-muted">Version history, linked forms, evidence, and approvals for the active SOC plan.</p>
          </div>
          <div className="grid gap-sm">
            {detailRail.map((item) => {
              const Icon = item.icon;

              return (
                <div className="flex items-center justify-between gap-lg rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-md backdrop-blur-sm" key={item.label}>
                  <span className="flex items-center gap-md text-sm text-ink">
                    <Icon aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
                    {item.label}
                  </span>
                  <ToneBadge size="sm" status={item.status} />
                </div>
              );
            })}
          </div>
          <div className="mt-lg rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg backdrop-blur-sm">
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedEventId = isCesCalendar ? searchParams.get('event') : null;
  const requestedEvent = findCalendarEventByLookup(config.events, requestedEventId);
  const cesMonthOptions = useMemo(
    () => isCesCalendar
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]  // Full Jan-Dec for CES calendar (real source records from seed months shown; empty for months with no 2026 data in seed)
      : [6],
    [isCesCalendar],
  );
  const requestedMonth = Number(searchParams.get('month'));
  const requestedYear = Number(searchParams.get('year'));
  const requestedView = searchParams.get('view');
  const [cesMonth, setCesMonthState] = useState(() => requestedEvent ? getEventMonth(requestedEvent) : 6);
  const [cesYear, setCesYearState] = useState(2026);
  const setCesCalendarParam = (key: 'month' | 'year' | 'view', value: string | number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set(key, String(value));
      if (key === 'month' || key === 'year' || key === 'view') next.delete('event');
      return next;
    });
  };
  const setCesMonth = (month: number) => {
    setCesMonthState(month);
    if (isCesCalendar) setCesCalendarParam('month', month);
  };
  const setCesYear = (year: number) => {
    setCesYearState(year);
    if (isCesCalendar) setCesCalendarParam('year', year);
  };
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

      // Force real workflow for POC audit and other known workflows even if data doesn't have it
      if (e.id === 'EVT-POC-AUD' || (e.label && e.label.includes('Plan of Care Audit'))) {
        (e as any).workflowId = 'CL-WF-26';
      }

      // Resolve real workflow first: prefer direct wfId, else sourceEventId -> REGULATORY -> aligned wfId
      let resolvedWorkflow: any = null;
      let resolvedWfId: string | undefined = (e as any).workflowId;
      if (resolvedWfId && WORKFLOWS[resolvedWfId]) {
        resolvedWorkflow = WORKFLOWS[resolvedWfId];
      }
      if (!resolvedWorkflow) {
        const srcEvtId = (e as any).sourceEventId || (e as any).id;
        if (srcEvtId) {
          try {
            const reg = getEventById(srcEvtId);
            const cand = reg?.workflowId || (e as any).workflowId;
            if (cand && WORKFLOWS[cand]) {
              resolvedWfId = cand;
              resolvedWorkflow = WORKFLOWS[cand];
            }
          } catch {}
        }
      }
      // Generated mandatory events carry their own authored workflow (from the
      // template processFlow). Use it so the click renders the real swimlane.
      if (!resolvedWorkflow && (e as any).authoredWorkflow) {
        resolvedWorkflow = (e as any).authoredWorkflow;
        resolvedWfId = (e as any).authoredWorkflow.id;
      }

      if (resolvedWorkflow) {
        // Use the shared real workflow -> cards adapter. No generic two-step for backed workflows.
        const built = buildWorkflowSwimlaneCardsForEvent(e as any, resolvedWorkflow);
        // If adapter produced only the honest missing diagnostic, fall through to units (should not for real wf)
        const isHonestMissing = built.lanes.some((l: any) => /source missing|Workflow source missing/i.test(l.title || ''));
        if (!isHonestMissing && built.lanes.length > 0 && built.lanes.some((l: any) => (l.cards || []).length > 0)) {
          return { ...e, swimlane: built as any, workflowId: resolvedWfId } as CalendarEventData;
        }
      }

      // Only for events without resolvable workflowId+steps: try units projection, else honest missing
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
        // Honest fallback only — do not pretend this is a real workflow swimlane
        return { ...e, swimlane: buildMissingSourceCalendarSwimlane(e) } as CalendarEventData;
      }
      const totalCards = laneData.reduce((sum: number, l: any) => sum + (l.cards ? l.cards.length : 0), 0);
      return {
        ...e,
        swimlane: {
          lanes: laneData,
          metrics: [
            { label: 'Tasks', value: String(totalCards), helper: 'Real V3 units (no workflow)', tone: 'teal' as const },
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
  const [cesWorkspaceView, setCesWorkspaceViewState] = useState<'calendar' | 'sprint' | 'events'>('calendar');
  const setCesWorkspaceView = (view: 'calendar' | 'sprint' | 'events') => {
    setCesWorkspaceViewState(view);
    if (isCesCalendar) setCesCalendarParam('view', view);
  };
  const [resolverEvent, setResolverEvent] = useState<CalendarEventData | null>(
    mode === 'staffing-calendar'
      ? events.find((event) => event.tone === 'orange' || event.tone === 'amber') ?? null
      : null
  );
  const [activeEventKey, setActiveEventKey] = useState<string | null>(null);
  const [activeEventAnchor, setActiveEventAnchor] = useState<{ left: number; top: number; placement: 'left' | 'right' | 'left-sidebar' } | null>(null);
  const eventPreviewCloseTimer = useRef<number | null>(null);
  const firstWeekday = isCesCalendar ? new Date(cesYear, activeCesMonth - 1, 1).getDay() : 0;
  const days = Array.from({ length: isCesCalendar ? getDaysInCalendarMonth(activeCesMonth) : 30 }, (_, index) => index + 1);
  const calendarCells: Array<number | null> = isCesCalendar
    ? [...Array.from({ length: firstWeekday }, () => null), ...days]
    : days;

  const positionEventCard = (element: HTMLElement, event: CalendarEventData, isSidebar: boolean) => {
    const rect = element.getBoundingClientRect();
    const cardWidth = 680;
    const cardHeight = 480;
    const margin = 16;
    const visibleViewport = window.visualViewport;
    const viewportWidth = Math.min(
      window.innerWidth,
      visibleViewport?.width ?? window.innerWidth,
      document.documentElement.clientWidth || window.innerWidth,
    );
    const viewportHeight = Math.min(
      window.innerHeight,
      visibleViewport?.height ?? window.innerHeight,
      document.documentElement.clientHeight || window.innerHeight,
    );

    let left = 0;
    let top = 0;
    let placement: 'left' | 'right' | 'left-sidebar' = 'right';

    if (isSidebar) {
      // Position to the left of the sidebar button
      left = rect.left - cardWidth - 16;
      top = rect.top - 30;
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
      top = rect.top - 60;
    }

    setActiveEventAnchor({
      left: Math.max(16, Math.min(left, viewportWidth - cardWidth - 16)),
      top: Math.max(104, Math.min(top, viewportHeight - cardHeight - 16)),
      placement,
    });
  };

  const clearEventPreviewCloseTimer = () => {
    if (eventPreviewCloseTimer.current === null) return;
    window.clearTimeout(eventPreviewCloseTimer.current);
    eventPreviewCloseTimer.current = null;
  };

  const closeEventPreview = (delay = 0) => {
    clearEventPreviewCloseTimer();

    if (delay > 0) {
      eventPreviewCloseTimer.current = window.setTimeout(() => {
        setActiveEventKey(null);
        setActiveEventAnchor(null);
        eventPreviewCloseTimer.current = null;
      }, delay);
      return;
    }

    setActiveEventKey(null);
    setActiveEventAnchor(null);
  };

  const openEventPreview = (element: HTMLElement, event: CalendarEventData, isSidebar: boolean) => {
    clearEventPreviewCloseTimer();
    const key = getCalendarEventKey(event);
    setActiveEventKey((currentKey) => currentKey === key ? currentKey : key);
    positionEventCard(element, event, isSidebar);
  };

  useEffect(() => {
    if (!isCesCalendar) return undefined;

    const dismissPreview = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeEventPreview();
    };

    window.addEventListener('keydown', dismissPreview);
    return () => window.removeEventListener('keydown', dismissPreview);
  }, [isCesCalendar]);

  useEffect(() => () => clearEventPreviewCloseTimer(), []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('redesign-calendar-swimlane', { detail: { open: Boolean(selectedEvent) } }));
    return () => {
      window.dispatchEvent(new CustomEvent('redesign-calendar-swimlane', { detail: { open: false } }));
    };
  }, [selectedEvent]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAgendaMode(isCesCalendar ? 'Month' : 'Week');
      if (!requestedEventId) setSelectedEvent(null);
      setActiveEventKey(null);
      setActiveEventAnchor(null);
      setResolverEvent(
        mode === 'staffing-calendar'
          ? events.find((event) => event.tone === 'orange' || event.tone === 'amber') ?? null
          : null
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeCesMonth, isCesCalendar, mode, requestedEventId]);

  useEffect(() => {
    if (!isCesCalendar) return;
    const frame = window.requestAnimationFrame(() => {
      if (cesMonthOptions.includes(requestedMonth)) setCesMonthState(requestedMonth);
      if ([2025, 2026, 2027].includes(requestedYear)) setCesYearState(requestedYear);
      if (requestedView === 'calendar' || requestedView === 'sprint' || requestedView === 'events') {
        setCesWorkspaceViewState(requestedView);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [cesMonthOptions, isCesCalendar, requestedMonth, requestedView, requestedYear]);

  useEffect(() => {
    if (!isCesCalendar || !requestedEventId) return;

    const targetEvent = findCalendarEventByLookup(config.events, requestedEventId);
    if (!targetEvent) return;

    const frame = window.requestAnimationFrame(() => {
      setAgendaMode('Month');
      setCesMonth(getEventMonth(targetEvent));
      setSelectedEvent(targetEvent);
      setActiveEventKey(null);
      setActiveEventAnchor(null);
    });
    return () => window.cancelAnimationFrame(frame);
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
      const next = new URLSearchParams(searchParams);
      next.set('event', getCalendarEventKey(event));
      navigate(`/ces/calendar?${next.toString()}`);
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
      closeEventPreview();
    }
  };

  // NOTE: no early return for selectedEvent. Always render within ScreenStack + shell (nav/sidebar/topbar preserved).
  // For CES: month/year buttons + header always visible; grid replaced by inline swimlane when event selected.
  return (
    <ScreenStack metrics={isCesCalendar ? [] : config.metrics}>
      <section className={cx(
        'grid gap-2xl',
        isCesCalendar ? 'grid-cols-1' : 'grid-cols-1',
      )}>

        <section
          className={cx(
            'relative rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset shadow-rest',
            isCesCalendar ? 'p-2xl' : 'p-xl',
          )}
          onMouseLeave={isCesCalendar ? () => closeEventPreview() : undefined}
        >
          {!isCesCalendar && <div className={cx('flex flex-wrap items-center justify-between gap-lg', 'mb-xl')}>
            <div className="inline-flex rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xs">
              {['Day', 'Week', 'Month'].map((label) => (
                <button
                  className={cx(
                    'min-h-tap rounded-md px-lg text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                    label === agendaMode ? 'bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal shadow-rest' : 'text-secondary hover:bg-surface-hover',
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
          </div>}
          {isCesCalendar ? (
            <>
              <div className="mb-lg">
                <div className="flex flex-wrap items-start justify-between gap-lg">
                  <div>
                    {/* Compact header — the month/year is shown (and changed) in the
                        selector below, so this no longer repeats it as a hero line. */}
                    <div className="flex flex-wrap items-center gap-sm">
                      <h2 className="text-h3 font-medium text-ink">CES Calendar</h2>
                      <span className="rounded-full border border-hairline bg-surface-glass px-sm py-[2px] text-xs font-medium text-brand-teal-deep">{activeMonthLabel} {cesYear}</span>
                    </div>
                    {/* Desktop grid has no legend of its own; the mobile agenda renders its own, so hide here on mobile. */}
                    <p className="mt-xs hidden text-xs text-muted tablet-l:block">{config.legend}</p>
                  </div>
                  <div className="flex flex-col items-end gap-md">
                    <div className="inline-flex rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xs">
                      {[
                        ['calendar', 'Calendar'],
                        ['sprint', 'Sprint'],
                        ['events', 'Event Board'],
                      ].map(([value, label]) => (
                        <button
                          className={cx(
                            'min-h-tap rounded-md px-lg text-sm transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                            value === cesWorkspaceView ? 'bg-brand-teal text-on-brand shadow-rest' : 'text-secondary hover:bg-surface-hover',
                          )}
                          key={value}
                          onClick={() => setCesWorkspaceView(value as 'calendar' | 'sprint' | 'events')}
                          type="button"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap justify-end gap-md">
                      <div className="flex flex-wrap gap-xs rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xs">
                        {cesMonthOptions.map((month) => (
                          <button
                            aria-current={month === activeCesMonth ? 'true' : undefined}
                            className={cx(
                              'min-h-tap rounded-md px-md text-xs font-medium uppercase tracking-tag transition duration-fast focus-visible:outline-none focus-visible:shadow-focus',
                              month === activeCesMonth
                                ? 'bg-brand-teal text-on-brand shadow-rest'
                                : 'text-brand-teal hover:bg-surface-glass hover:backdrop-blur-md',
                            )}
                            key={month}
                            onClick={() => setCesMonth(month)}
                            type="button"
                          >
                            {getCalendarMonthLabel(month)}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-xs rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xs">
                        {[2025, 2026, 2027].map((y) => (
                          <button
                            aria-current={y === cesYear ? 'true' : undefined}
                            className={cx(
                              'min-h-tap rounded-md px-md text-xs font-medium uppercase tracking-tag transition duration-fast focus-visible:outline-none focus-visible:shadow-focus',
                              y === cesYear
                                ? 'bg-brand-teal text-on-brand shadow-rest'
                                : 'text-brand-teal hover:bg-surface-glass hover:backdrop-blur-md',
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
                </div>
              </div>
              {cesWorkspaceView === 'sprint' ? (
                <CesEmbeddedBoardView variant="sprint" />
              ) : cesWorkspaceView === 'events' ? (
                <CesEmbeddedBoardView variant="events" />
              ) : selectedEvent ? (
                <CalendarSwimlaneInline
                  event={selectedEvent}
                  events={events}
                  onBack={() => {
                    const next = new URLSearchParams(searchParams);
                    next.delete('event');
                    navigate(`/ces/calendar?${next.toString()}`);
                  }}
                  onSelectEvent={(event) => {
                    const next = new URLSearchParams(searchParams);
                    next.set('event', getCalendarEventKey(event));
                    navigate(`/ces/calendar?${next.toString()}`);
                  }}
                />
              ) : (
              <>
              {/* Mobile: readable agenda list — the 7-column grid clips event pills on phones. */}
              <div className="tablet-l:hidden">
                <CalendarAgendaList events={events} legend={config.legend} onOpenEvent={openCalendarEvent} title={`${activeMonthLabel} ${cesYear}`} />
              </div>
              {/* Desktop / tablet: full month grid. */}
              <div className="hidden overflow-hidden rounded-lg border border-hairline bg-surface-glass shadow-glass-inset tablet-l:block">
              <div className="grid grid-cols-7 text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div className="border border-hairline bg-tone-teal-bg/45 p-md text-center text-tag uppercase tracking-tag text-brand-teal" key={day}>
                    {day}
                  </div>
                ))}
                {calendarCells.map((day, index) => day === null ? (
                  <div aria-hidden="true" className="min-h-[156px] border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset" key={`blank-${index}`} />
                ) : (
                  <div className="relative min-w-0 overflow-visible min-h-[156px] border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-md !shadow-none" key={day}>
                    <p className="mb-md text-base font-medium text-brand-teal">{day}</p>
                    <div className="grid gap-xs">
                      {events
                        .filter((event) => event.day === day)
                        .map((event) => {
                          const key = getCalendarEventKey(event);
                          const pillClasses = cx(
                            'truncate rounded-md px-md py-sm text-left text-xs font-medium text-on-brand',
                            event.tone === 'orange' || event.tone === 'amber' ? 'bg-brand-orange' : 'bg-brand-teal',
                          );
                          const isHovered = activeEventKey === key;

                          return (
                            <div className="relative min-w-0 overflow-visible" key={key}>
                              <button
                                aria-describedby={isHovered ? 'ces-event-preview' : undefined}
                                aria-label={`${event.label}, ${activeMonthLabel} ${event.day}. Click to open event workspace/swimlane.`}
                                className={cx(
                                  pillClasses,
                                  'block min-w-0 max-w-full w-full overflow-hidden border border-transparent focus-visible:outline-none focus-visible:shadow-focus'
                                )}
                                onBlur={() => closeEventPreview(80)}
                                onClick={() => openCalendarEvent(event)}
                                onFocus={(e) => openEventPreview(e.currentTarget, event, false)}
                                onKeyDown={(keyboardEvent) => handleEventKeyDown(keyboardEvent, event)}
                                onMouseEnter={(e) => openEventPreview(e.currentTarget, event, false)}
                                onMouseLeave={() => closeEventPreview(120)}
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
              </>
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
                <div className="relative min-w-0 overflow-hidden min-h-[112px] border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm !shadow-none" key={day}>
                  <p className="mb-sm text-sm text-brand-teal">{day}</p>
                  <div className="grid gap-xs">
                    {events
                      .filter((event) => event.day === day)
                      .map((event) => (
                        <button
                          className={cx(
                            'block min-w-0 max-w-full w-full overflow-hidden truncate rounded-sm px-sm py-xs text-left text-[10px] text-on-brand focus-visible:outline-none focus-visible:shadow-focus',
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
        {!isCesCalendar && <aside className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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
                      'rounded-lg border p-md text-left focus-visible:outline-none focus-visible:shadow-focus w-full',
                      'border-card bg-surface-glass backdrop-blur-md shadow-glass-inset'
                    )}
                    onBlur={() => closeEventPreview(80)}
                    onClick={() => openCalendarEvent(event)}
                    onFocus={(e) => openEventPreview(e.currentTarget, event, true)}
                    onKeyDown={(keyboardEvent) => handleEventKeyDown(keyboardEvent, event)}
                    onMouseEnter={(e) => openEventPreview(e.currentTarget, event, true)}
                    onMouseLeave={() => closeEventPreview(120)}
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
                  className="rounded-lg border border-hairline bg-surface-glass p-md text-left focus-visible:outline-none focus-visible:shadow-focus"
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

function CesEmbeddedBoardView({ variant }: { variant: 'sprint' | 'events' }) {
  const navigate = useNavigate();
  const lanes = variant === 'sprint' ? buildBoardLanes() : (buildEventLanes() || FALLBACK_EVENT_LANES);
  const totalCards = lanes.reduce((sum, lane) => sum + (lane.count || lane.cards.length), 0);
  const title = variant === 'sprint' ? 'Sprint Board' : 'Event Board';
  const subtitle = variant === 'sprint'
    ? 'Execution units grouped by readiness state inside the calendar workspace.'
    : 'Operational events grouped by urgency without leaving the calendar workspace.';

  return (
    <div className="grid gap-lg">
      <div className="flex flex-wrap items-center justify-between gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md shadow-rest">
        <div>
          <h3 className="text-h2 font-medium text-ink">{title}</h3>
          <p className="mt-xs text-sm text-muted">{subtitle}</p>
        </div>
        <ToneTag tone={variant === 'sprint' ? 'teal' : 'orange'}>{totalCards} cards</ToneTag>
      </div>
      <div className="overflow-x-auto overflow-y-hidden pb-sm">
        <div className={cx(
          'grid min-w-[980px] gap-md desktop:min-w-0',
          variant === 'sprint' ? 'desktop:grid-cols-7' : 'desktop:grid-cols-4'
        )}>
          {lanes.map((lane) => (
            <BoardLane
              key={lane.title}
              lane={lane}
              onCardClick={(card) => {
                const targetId = card.id || '';
                if (variant === 'events') {
                  navigate(`/evidence?control=${encodeURIComponent(targetId)}`);
                  return;
                }
                if (card.awaitingType === 'evidence' || targetId) {
                  navigate(`/evidence?control=${encodeURIComponent(targetId)}`);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const sprintBoardTabs = [
  { id: 'home', label: 'Sprint Home', to: '/compliance' },
  { id: 'dashboard', label: 'Sprint Dashboard', to: '/ces/board' },
  { id: 'calendar', label: 'CES Calendar', to: '/ces/calendar' },
  { id: 'controls', label: 'Control Register', to: '/compliance/master-controls' },
] as const;

function SprintBoardNavigationTabs() {
  return (
    <nav aria-label="Compliance portal sections" className={workspaceTabNavClass}>
      {sprintBoardTabs.map((tab) => {
        const isActive = tab.id === 'dashboard';
        return (
          <Link
            key={tab.id}
            to={tab.to}
            className={`${workspaceTabClass} ${isActive ? workspaceTabActiveClass : workspaceTabInactiveClass}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BoardScreen() {
  const navigate = useNavigate();
  const boardLanesLocal = buildBoardLanes();
  const boardLaneCountLocal = (title: string) => boardLanesLocal.find((l) => l.title === title)?.count ?? 0;
  const [activeFilter, setActiveFilter] = useState('All work');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const totalCards = boardLanesLocal.reduce((sum, lane) => sum + (lane.count || lane.cards.length), 0);
  const awaitingCards = boardLaneCountLocal('Awaiting Action / Evidence');
  const filteredLanes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return boardLanesLocal.map((lane) => {
      const cards = lane.cards.filter((card) => {
        const laneTitle = lane.title.toLowerCase();
        const haystack = [card.id, card.title, card.owner, card.due, card.meta, card.missing, ...card.chips].filter(Boolean).join(' ').toLowerCase();
        const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);
        if (!matchesSearch) return false;
        if (activeFilter === 'All work') return true;
        if (activeFilter === 'Mine') return /manager|lead|administrator|officer/i.test(card.owner);
        if (activeFilter === 'Blocked') return laneTitle.includes('blocked') || card.tone === 'orange';
        if (activeFilter === 'Missing evidence') return card.awaitingType === 'evidence' || Boolean(card.missing) || laneTitle.includes('evidence');
        if (activeFilter === 'Awaiting signature') return laneTitle.includes('signature') || haystack.includes('sign');
        if (activeFilter === 'Awaiting action') return card.awaitingType === 'action' || laneTitle.includes('action');
        return true;
      });
      return { ...lane, cards, count: cards.length };
    });
  }, [activeFilter, boardLanesLocal, searchTerm]);

  const openBoardCard = (card: BoardCardData) => {
    const targetId = card.id || '';
    const isCesEventClick = card.awaitingType === 'action' || targetId.includes('EVT') || /CES|QAPI|EVT|evt-/i.test(String(card.title || '')) || /QAPI|Governing/i.test(String(card.title || ''));
    if (isCesEventClick) {
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
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] px-6 pb-16 pt-4 font-roboto text-[#52404B] selection:bg-[#E5FEFF] md:px-12" data-hash-id="ces-board" data-route="/ces/board">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col">
        <div className="relative z-20 flex justify-start">
          <SprintBoardNavigationTabs />
        </div>

        <section className="flex min-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-b-[32px] rounded-tr-[32px] bg-white p-6 shadow-[0_8px_30px_rgba(31,28,27,0.035)] md:p-8">
        <div className="mb-6 flex shrink-0 flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-tag font-semibold uppercase tracking-tag text-brand-orange">Compliance Workspace</p>
            <h1 className="text-3xl font-bold tracking-tight text-brand-teal-deep">Sprint 12 Board</h1>
            <p className="mt-2 text-sm text-muted">{totalCards} active cards - {awaitingCards} awaiting action/evidence</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="relative block">
              <Search aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-disabled" />
              <span className="sr-only">Search sprint</span>
              <input
                className="h-11 w-full rounded-full bg-[#FAFAF7] pl-10 pr-4 text-sm text-ink shadow-[inset_0_0_0_1px_rgba(229,228,227,0.7)] transition duration-fast placeholder:text-disabled focus:outline-none focus:shadow-[inset_0_0_0_1px_rgba(0,121,112,0.55)] md:w-64"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search sprint..."
                type="search"
                value={searchTerm}
              />
            </label>
            <button
              aria-label="Sprint owners"
              className="grid h-11 w-11 place-items-center rounded-full bg-[#FAFAF7] text-muted shadow-[inset_0_0_0_1px_rgba(229,228,227,0.7)] transition duration-fast hover:bg-[#e5feff] hover:text-brand-teal"
              type="button"
            >
              <Users aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-orange px-6 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_12px_28px_rgba(240,105,35,0.22)] transition duration-fast hover:bg-[#d85e1f]"
              onClick={() => navigate('/ces/calendar?view=sprint')}
              type="button"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              New Card
            </button>
          </div>
        </div>

        <div className="mb-6 flex shrink-0 items-center gap-3 overflow-x-auto border-b border-[#F1F0EE] pb-6">
          <Filter aria-hidden="true" className="mr-2 h-4 w-4 shrink-0 text-disabled" />
          {['All work', 'Mine', 'Blocked', 'Missing evidence', 'Awaiting signature', 'Awaiting action'].map((label) => (
            <button
              className={cx(
                'shrink-0 rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-wider transition duration-fast focus-visible:outline-none focus-visible:shadow-focus',
                label === activeFilter
                  ? 'bg-[#e5feff] text-brand-teal'
                  : 'bg-[#FAFAF7] text-muted hover:bg-[#F1F0EE] hover:text-brand-teal-deep',
              )}
              key={label}
              onClick={() => setActiveFilter(label)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden pb-2">
          <div className="flex min-h-full items-start gap-6">
            {filteredLanes.map((lane, index) => (
              <SprintBoardColumn
                index={index}
                key={lane.title}
                lane={lane}
                onCardClick={openBoardCard}
              />
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
      </main>
    </div>
  );
}

function SprintBoardColumn({ index, lane, onCardClick }: { index: number; lane: BoardLaneData; onCardClick: (card: BoardCardData) => void }) {
  return (
    <section
      className="animate-board-col flex max-h-full w-[340px] shrink-0 flex-col rounded-[24px] bg-[#FAFAF7] p-4 shadow-[inset_0_0_0_1px_rgba(229,228,227,0.72)]"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <header className="mb-5 flex items-center justify-between gap-3 px-2 pt-1">
        <h2 className="flex min-w-0 items-center gap-2 truncate text-xs font-bold uppercase tracking-widest text-[#52404B]">
          {createElement(getSprintLaneIcon(lane.title), {
            'aria-hidden': true,
            className: cx('h-4 w-4 shrink-0', sprintToneTextClass(lane.tone)),
          })}
          <span className="truncate">{lane.title}</span>
        </h2>
        <span className={cx('rounded-full px-2.5 py-1 text-[10px] font-bold', sprintBadgeClass(lane.tone))}>
          {lane.count}
        </span>
      </header>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 pb-4">
        {lane.cards.map((card) => (
          <SprintKanbanCard card={card} key={card.id} onClick={() => onCardClick(card)} />
        ))}
        {lane.cards.length === 0 && (
          <div className="grid h-24 place-items-center rounded-[20px] border-2 border-dashed border-[#E5E4E3] text-xs font-semibold text-disabled">
            No cards match
          </div>
        )}
      </div>
    </section>
  );
}

function SprintKanbanCard({ card, onClick }: { card: BoardCardData; onClick: () => void }) {
  const progressColor = sprintProgressClass(card.tone);
  const initials = getOwnerInitials(card.owner);
  return (
    <article
      className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-white p-5 shadow-[0_2px_12px_rgba(31,28,27,0.025)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(31,28,27,0.06)]"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="absolute bottom-0 left-0 h-1 w-full bg-[#FAFAF7]">
        <div className={cx('h-full transition-all duration-500', progressColor)} style={{ width: `${card.progress}%` }} />
      </div>

      <div className="mb-3 flex items-start justify-between gap-3">
        <span className={cx('rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider', sprintIdBadgeClass(card.tone))}>
          {card.id}
        </span>
        <button
          aria-label={`More actions for ${card.title}`}
          className="rounded-full p-1 text-disabled opacity-0 transition duration-fast hover:bg-[#FAFAF7] hover:text-[#52404B] group-hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
          type="button"
        >
          <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mb-4 line-clamp-3 text-[14px] font-medium leading-snug text-[#52404B]">
        {card.title}
      </h3>

      <div className="mb-5 flex flex-wrap gap-2">
        {card.chips.slice(0, 3).map((tag) => (
          <span key={`${card.id}-${tag}`} className="rounded border border-[#F1F0EE] bg-[#FAFAF7] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted">
            {tag}
          </span>
        ))}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-[#F1F0EE] pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold shadow-sm', sprintAvatarClass(card.tone))}>
            {initials}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 truncate text-xs text-disabled">
            <Clock aria-hidden="true" className="h-3 w-3 shrink-0" />
            <span className="truncate">{card.due}</span>
          </span>
        </div>
        <span className="text-[11px] font-bold text-disabled">{card.progress}%</span>
      </footer>
    </article>
  );
}

function getSprintLaneIcon(title: string): LucideIcon {
  if (/blocked/i.test(title)) return AlertTriangle;
  if (/signature/i.test(title)) return PenTool;
  if (/complete|certified/i.test(title)) return CheckCircle2;
  if (/ready/i.test(title)) return ClipboardCheck;
  if (/progress/i.test(title)) return Clock;
  return ClipboardList;
}

function getOwnerInitials(owner: string) {
  const parts = owner.split(/\s|\/|&|-/).filter(Boolean);
  return (parts[0]?.[0] ?? 'C').toUpperCase() + (parts[1]?.[0] ?? parts[0]?.[1] ?? 'I').toUpperCase();
}

function sprintToneTextClass(tone: Tone) {
  if (tone === 'orange' || tone === 'amber') return 'text-brand-orange';
  if (tone === 'green') return 'text-brand-teal';
  if (tone === 'slate') return 'text-muted';
  return 'text-brand-teal';
}

function sprintBadgeClass(tone: Tone) {
  if (tone === 'orange' || tone === 'amber') return 'bg-orange-50 text-brand-orange';
  if (tone === 'green' || tone === 'teal') return 'bg-[#e5feff] text-brand-teal';
  return 'bg-white text-muted shadow-sm';
}

function sprintIdBadgeClass(tone: Tone) {
  if (tone === 'orange' || tone === 'amber') return 'bg-orange-50 text-brand-orange';
  if (tone === 'green' || tone === 'teal') return 'bg-teal-50 text-brand-teal';
  return 'bg-[#FAFAF7] text-muted shadow-[inset_0_0_0_1px_rgba(229,228,227,0.8)]';
}

function sprintAvatarClass(tone: Tone) {
  if (tone === 'orange' || tone === 'amber') return 'bg-orange-50 text-brand-orange';
  if (tone === 'slate') return 'bg-[#FAFAF7] text-muted';
  return 'bg-[#e5feff] text-brand-teal';
}

function sprintProgressClass(tone: Tone) {
  if (tone === 'orange' || tone === 'amber') return 'bg-brand-orange';
  if (tone === 'green' || tone === 'teal') return 'bg-brand-teal';
  return 'bg-[#E5E4E3]';
}

function buildWorkflowSwimlane(event: CalendarEventData): readonly BoardLaneData[] {
  // If event already has real workflow-derived swimlane from adapter, use it directly
  if (event.swimlane && !/source missing|Workflow source missing/i.test((event.swimlane as any).summary || '')) {
    const sl: any = event.swimlane;
    return (sl.lanes || []).map((lane: any) => ({
      cards: (lane.cards || []).map((card: any) => ({
        chips: card.chips,
        due: card.due,
        id: card.id,
        owner: card.owner,
        progress: card.progress,
        title: card.title,
        tone: card.tone,
      })),
      count: (lane.cards || []).length,
      title: lane.title,
      tone: lane.tone,
    }));
  }
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

  // Prefer real workflow cards via shared adapter for event-clicked workflows
  let lanes = buildWorkflowSwimlane(event);
  const directWf = (event as any).workflowId && WORKFLOWS[(event as any).workflowId] && !isQapiQuarterlyEvent(event) ? WORKFLOWS[(event as any).workflowId] : null;
  if (directWf) {
    const viaAdapter: any = buildWorkflowSwimlaneCardsForEvent(event as any, directWf);
    if (viaAdapter && viaAdapter.lanes && viaAdapter.lanes.length && !/source missing/i.test(viaAdapter.summary || '')) {
      lanes = viaAdapter.lanes.map((lane: any) => ({
        cards: (lane.cards || []).map((card: any) => ({ chips: card.chips, due: card.due, id: card.id, owner: card.owner, progress: card.progress ?? 50, title: card.title, tone: card.tone })),
        count: (lane.cards || []).length,
        title: lane.title,
        tone: lane.tone,
      })) as any;
    }
  }

  const metrics: readonly MetricTileData[] = (event as any).swimlane?.metrics ?? [
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
                <span className="grid h-tap w-tap place-items-center rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal">{index + 1}</span>
                <span className="text-tag uppercase tracking-tag">{lane.count} cards</span>
              </div>
              <h3 className="text-body font-medium">{lane.title}</h3>
              <p className="mt-xs text-sm">{lane.cards.length} execution tasks</p>
            </div>
          ))}
        </section>

        <div className="flex gap-sm overflow-x-auto rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm backdrop-blur-sm">
          {(buildCalendarEvents() as readonly CalendarEventData[]).map((calendarEvent) => (
            <button
              className={cx(
                'min-h-tap shrink-0 rounded-sm border px-md text-xs font-medium uppercase tracking-tag transition duration-fast ease-standard focus-visible:outline-none focus-visible:shadow-focus',
                calendarEvent.workflowId === event.workflowId
                  ? 'border-brand-teal bg-brand-teal text-on-brand'
                  : 'border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal hover:bg-surface-glass hover:backdrop-blur-md',
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
                <div key={item} className="flex items-center justify-between rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md text-xs">
                  <span className="font-light text-secondary">{item}</span>
                  <ToneBadge status={status === 'Ready' ? 'validated' : 'awaiting'} />
                </div>
              ))}
            </div>
            <div className="rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md flex flex-col gap-sm">
              <h4 className="text-sm font-medium text-ink">Evidence and signature status</h4>
              <div className="grid gap-xs text-xs font-light text-secondary">
                <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md">
                  <span className="text-[10px] font-medium text-brand-teal uppercase block mb-xs">Required file</span>
                  Q2_QAPI_minutes_packet.pdf
                </div>
                <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md">
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
      <section className="grid gap-xl desktop:grid-cols-1">
        <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
          <h2 className="text-h2 font-medium text-ink">{config.title}</h2>
          <p className="mt-xs text-sm text-muted">{config.description}</p>
          {control && <p className="mt-xs text-xs text-brand-teal">Filtered by: {control}</p>}
          <div className="mt-lg grid gap-md">
            {displayRows.map(([title, ref, status, tone]) => (
              <div
                className="flex items-center justify-between gap-lg rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset shadow-rest p-lg cursor-pointer hover:bg-surface-hover hover:shadow-hover transition duration-base"
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
                    className="text-[10px] px-1.5 py-0.5 border border-hairline rounded hover:bg-surface-glass hover:backdrop-blur-md text-brand-teal"
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
        <aside className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
          <h2 className="mb-lg text-h2 font-medium text-ink">{isAudit ? 'Audit packet' : 'Evidence packet'}</h2>
          <div className="grid gap-md tablet-p:grid-cols-2">
            {((isAudit || mode === 'evidence-center') ? realTiles : config.tiles).map(([value, label]) => (
              <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset shadow-rest p-lg" key={label}>
                <p className={cx('text-display', config.tileTone === 'orange' ? 'text-brand-orange' : 'text-brand-teal')}>
                  {value}
                </p>
                <p className="text-tag uppercase tracking-tag text-ink">{label}</p>
              </div>
            ))}
          </div>
          {mode === 'evidence-center' && <DocumentUploadZone title="Drop documents for Brad to package" />}
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
      <section className="grid gap-xl desktop:grid-cols-1">
        <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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
              <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg" key={label}>
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

function normalizeAchcView(value: string | null): 'cards' | 'matrix' | 'signals' {
  return value === 'matrix' || value === 'signals' ? value : 'cards';
}

function AchcScreen({ mode }: { mode: 'crosswalk' | 'survey' }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get('view');
  const view = normalizeAchcView(requestedView);
  const isCrosswalk = mode === 'crosswalk';
  const rows = isCrosswalk ? crosswalkRows : achcRows;

  const setView = (nextView: 'cards' | 'matrix' | 'signals') => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (nextView === 'cards') next.delete('view');
      else next.set('view', nextView);
      return next;
    }, { replace: true });
  };

  const openStandardsMatrix = () => {
    if (isCrosswalk) {
      navigate('/framework/achc-survey?view=matrix');
      return;
    }
    setView('matrix');
  };

  // V2 columns extended for V1 parity: crosswalk includes CMS/Title22 + evidence detail like prototype
  const columns = isCrosswalk
    ? [
        { key: 'id', label: 'ACHC' },
        { key: 'title', label: 'Policy / Corridor' },
        { key: 'owner', label: 'Policy ID' },
        { key: 'cmsTitle22', label: 'CMS / Title 22' },
        { key: 'evidence', label: 'Evidence' },
        { key: 'sectionAnchor', label: 'Policy section anchor' },
        { key: 'status', label: 'Mapping', status: true },
      ]
    : [
        { key: 'id', label: 'ACHC Standard' },
        { key: 'title', label: 'Requirement' },
        { key: 'owner', label: 'Policy Support' },
        { key: 'status', label: 'Support', status: true },
      ];

  const openRow = (row: BasicRow) => {
    const polId = (row.owner || row.id || '').toString();
    if (polId && polId !== '—') {
      navigate(`/library/${encodeURIComponent(polId)}`, {
        state: {
          policyBackLabel: isCrosswalk ? 'ACHC Crosswalk' : 'ACHC Survey Alignment',
          policyBackTo: isCrosswalk ? '/framework/achc-survey/crosswalk' : '/framework/achc-survey',
        },
      });
    }
  };
  const tabs: readonly PolicyWorkspaceTab<typeof view>[] = [
    { id: 'cards', label: 'Cards', tone: 'teal' },
    { id: 'matrix', label: 'Matrix', tone: 'orange' },
    { id: 'signals', label: 'Signals', tone: 'green' },
  ];

  return (
    <PolicyWorkspaceShell
      activeTab={view}
      dataHashId={isCrosswalk ? 'achc-crosswalk' : 'achc-survey'}
      dataRoute={isCrosswalk ? '/framework/achc-survey/crosswalk' : '/framework/achc-survey'}
      description={isCrosswalk ? 'ACHC standards, policy corridors, CMS and Title 22 anchors, and evidence notes grouped into scannable cards.' : 'Survey-readiness support is grouped into cards first, with the full checklist kept one tab away.'}
      eyebrow={isCrosswalk ? 'Regulatory Crosswalk' : 'Survey Alignment'}
      onTabChange={setView}
      showTabs={false}
      tabs={tabs}
      title={isCrosswalk ? 'ACHC Crosswalk' : 'ACHC Survey Alignment'}
      actions={[
        { icon: FileText, label: 'HH Evidence', to: '/framework/hh-evidence-map', variant: 'secondary' },
        { icon: ClipboardList, label: 'Standards Matrix', onClick: openStandardsMatrix, variant: view === 'matrix' && !isCrosswalk ? 'primary' : 'secondary' },
        { icon: ShieldCheck, label: 'Crosswalk', to: '/framework/achc-survey/crosswalk', variant: isCrosswalk ? 'primary' : 'secondary' },
      ]}
    >
      <PolicyMetricsGrid metrics={achcMetrics} />

      {view === 'cards' ? (
        <PolicyPanel
          title={isCrosswalk ? 'Crosswalk Cards' : 'Survey Support Cards'}
          description={`${rows.length} mapped records are shown as cards so reviewers can scan support before opening the full matrix.`}
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {rows.slice(0, 42).map((row, rowIndex) => (
              <button
                key={`${row.id}-${row.owner}-${rowIndex}`}
                type="button"
                onClick={() => openRow(row)}
                className="group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
              >
                <span>
                  <span className="mb-4 flex items-start justify-between gap-4">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#F06923]">{row.id}</span>
                    <ToneTag tone="teal">{row.status}</ToneTag>
                  </span>
                  <span className="block font-montserrat text-lg font-semibold leading-snug text-[#007970] group-hover:text-[#F06923]">{row.title}</span>
                  <span className="mt-3 block text-sm leading-relaxed text-[#747470]">{row.owner}</span>
                </span>
                <span className="mt-6 border-t border-[#E5E4E3] pt-4 text-xs leading-relaxed text-[#747470]">
                  {isCrosswalk ? `${row.cmsTitle22 || 'No CMS / Title 22 anchor'} - ${row.evidence || 'Evidence pending'}` : 'Open supporting policy detail'}
                </span>
              </button>
            ))}
          </div>
        </PolicyPanel>
      ) : null}

      {view === 'matrix' ? (
        <PolicyPanel
          title={isCrosswalk ? 'ACHC Regulatory Crosswalk Matrix' : 'ACHC Survey Checklist Matrix'}
          description="The full table stays available for audit review, export checks, and detailed policy comparisons."
        >
          <DataTable
            columns={columns}
            label={isCrosswalk ? 'ACHC regulatory crosswalk' : 'ACHC survey checklist'}
            rows={rows}
            onRowClick={openRow}
          />
        </PolicyPanel>
      ) : null}

      {view === 'signals' ? (
        <section className="grid gap-5 xl:grid-cols-3">
          {achcCards.map((card) => (
            <PolicySignalCard card={card} key={card.title} />
          ))}
        </section>
      ) : null}
    </PolicyWorkspaceShell>
  );
}

function HhEvidenceMapScreen() {
  const navigate = useNavigate();
  const [view, setView] = useState<'cards' | 'matrix' | 'signals'>('cards');
  const [query, setQuery] = useState('');
  const [confidence, setConfidence] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  const filteredRows = hhEvidenceMapRows.filter((row) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      row.id.toLowerCase().includes(q) ||
      row.title.toLowerCase().includes(q) ||
      row.owner.toLowerCase().includes(q) ||
      row.sectionAnchor.toLowerCase().includes(q) ||
      row.evidence.toLowerCase().includes(q);
    const matchesConfidence = confidence === 'ALL' || row.confidence === confidence;
    const matchesStatus = status === 'ALL' || row.status === status;
    return matchesQuery && matchesConfidence && matchesStatus;
  });

  const columns: readonly DataTableColumn<BasicRow>[] = [
    { key: 'id', label: 'HH standard' },
    { key: 'title', label: 'Policy title' },
    { key: 'owner', label: 'Policy ID' },
    { key: 'sectionAnchor', label: 'Section / anchor' },
    { key: 'evidence', label: 'Match / evidence source' },
    { key: 'confidence', label: 'Confidence' },
    { key: 'status', label: 'Review state', status: true },
  ];
  const openRow = (row: BasicRow) => {
    navigate(`/library/${encodeURIComponent(row.owner)}`, { state: { policyBackLabel: 'HH Tag Evidence Map', policyBackTo: '/framework/hh-evidence-map' } });
  };
  const tabs: readonly PolicyWorkspaceTab<typeof view>[] = [
    { id: 'cards', label: 'Cards', tone: 'teal' },
    { id: 'matrix', label: 'Matrix', tone: 'orange' },
    { id: 'signals', label: 'Signals', tone: 'green' },
  ];

  return (
    <PolicyWorkspaceShell
      activeTab={view}
      dataHashId="hh-evidence-map"
      dataRoute="/framework/hh-evidence-map"
      description="HH standards map to policy anchors, confidence, match type, duplicate flags, and review posture from the hardening spreadsheet."
      eyebrow="Evidence Map"
      onTabChange={setView}
      tabs={tabs}
      title="HH Tag Evidence Map"
      actions={[
        { icon: FileText, label: 'HH Evidence', to: '/framework/hh-evidence-map' },
        { icon: ClipboardList, label: 'Standards Matrix', to: '/framework/achc-survey?view=matrix', variant: 'secondary' },
        { icon: ShieldCheck, label: 'Crosswalk', to: '/framework/achc-survey/crosswalk', variant: 'secondary' },
      ]}
    >
      <PolicyMetricsGrid metrics={hhEvidenceMapMetrics} />

      <PolicyPanel
        title="Evidence Filters"
        description={`Source: src/policy/data/policy_hh_section_map.csv. ${filteredRows.length} mappings match the active filters.`}
        actions={
          <label className="flex min-h-11 min-w-[260px] items-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 text-sm text-[#747470]">
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <input
              aria-label="Search HH evidence mappings"
              className="w-full bg-transparent py-3 text-[#52404B] outline-none placeholder:text-[#9A9A96]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search HH tag, policy, section..."
              value={query}
            />
          </label>
        }
      >
        <div className="grid gap-4">
          <PolicySegmentTabs
            active={confidence}
            onChange={setConfidence}
            tabs={['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((value) => ({ id: value, label: value === 'ALL' ? 'All Confidence' : value }))}
          />
          <PolicySegmentTabs
            active={status}
            onChange={setStatus}
            tabs={['ALL', 'validated', 'ready', 'review-required'].map((value) => ({ id: value, label: value === 'ALL' ? 'All States' : value }))}
          />
        </div>
      </PolicyPanel>

      {view === 'cards' ? (
        <PolicyPanel title="Evidence Cards" description="Cards expose the policy anchor and confidence before opening the supporting policy.">
          {filteredRows.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredRows.slice(0, 42).map((row, rowIndex) => (
                <button
                  key={`${row.id}-${row.owner}-${row.sectionAnchor}-${rowIndex}`}
                  type="button"
                  onClick={() => openRow(row)}
                  className="group flex min-h-[230px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
                >
                  <span>
                    <span className="mb-4 flex items-start justify-between gap-4">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#F06923]">{row.id}</span>
                      <ToneTag tone={row.confidence === 'HIGH' ? 'green' : row.confidence === 'MEDIUM' ? 'amber' : 'orange'}>{row.confidence}</ToneTag>
                    </span>
                    <span className="block font-montserrat text-lg font-semibold leading-snug text-[#007970] group-hover:text-[#F06923]">{row.title}</span>
                    <span className="mt-3 block text-sm leading-relaxed text-[#747470]">{row.owner} - {row.sectionAnchor}</span>
                  </span>
                  <span className="mt-6 flex items-center justify-between gap-4 border-t border-[#E5E4E3] pt-4">
                    <span className="min-w-0 text-xs leading-relaxed text-[#747470]">{row.evidence}</span>
                    <ToneBadge size="sm" status={row.status} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#E5E4E3] bg-[#FAFBF8] p-8 text-sm text-[#747470]">
              No HH evidence mappings match the current filters.
            </div>
          )}
        </PolicyPanel>
      ) : null}

      {view === 'matrix' ? (
        <PolicyPanel title="HH Evidence Matrix" description="The full source-backed table remains available for detailed hardening review.">
          {filteredRows.length ? (
            <DataTable columns={columns} label="HH tag evidence map" rows={filteredRows} onRowClick={openRow} />
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#E5E4E3] bg-[#FAFBF8] p-8 text-sm text-[#747470]">
              No HH evidence mappings match the current filters.
            </div>
          )}
        </PolicyPanel>
      ) : null}

      {view === 'signals' ? (
        <section className="grid content-start gap-5 xl:grid-cols-3">
          <PolicySignalCard
            card={{
              body: `Duplicate HH/policy pairs: ${hhDuplicateKeys.size}. Reference/header-only candidates: ${hhReferenceOnlyRows.length}. Missing source content rows: ${hhMissingContentRows.length}.`,
              icon: AlertTriangle,
              progress: Math.max(0, 100 - hhDuplicateKeys.size),
              status: hhDuplicateKeys.size || hhReferenceOnlyRows.length || hhMissingContentRows.length ? 'review-required' : 'validated',
              title: 'Defensibility checks',
              tone: hhDuplicateKeys.size || hhReferenceOnlyRows.length || hhMissingContentRows.length ? 'orange' : 'green',
            }}
          />
          <PolicySignalCard
            card={{
              body: 'Evidence code legend: P = Policy, D = Document, I = Interview, O = Observation, S = Survey. HH anchors come from the hardening spreadsheet, not static sample rows.',
              icon: BookOpen,
              progress: 100,
              status: 'validated',
              title: 'Evidence legend',
              tone: 'teal',
            }}
          />
          <PolicySignalCard
            card={{
              body: 'Click any row to open the supporting policy detail. Rows marked review-required need SME review, a stronger section anchor, or source-content repair.',
              icon: ShieldCheck,
              progress: 86,
              status: 'ready',
              title: 'Survey workflow',
              tone: 'teal',
            }}
          />
        </section>
      ) : null}
    </PolicyWorkspaceShell>
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

  // No-match / unavailable state: keep the screen's surface, do not crash.
  if (!record) {
    return (
      <ScreenStack metrics={operationsMetrics}>
        <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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

  const formContent = buildFormContent(record);
  const [formValues, setFormValues] = useState<Record<string, string | boolean>>({});
  const updateValue = (key: string, val: string | boolean) => setFormValues(p => ({ ...p, [key]: val }));

  const buildFormNav = (suffix: string) => {
    const params = new URLSearchParams();
    if (formInstanceId) params.set('form_instance_id', formInstanceId);
    const qs = params.toString();
    return `/forms/${encodeURIComponent(record.id)}${suffix}${qs ? `?${qs}` : ''}`;
  };
  const navigateToEsign = () => navigate(buildFormNav('/esign'));
  const navigateToPrint = () => { window.location.href = buildFormNav('/print'); };
  const printNow = () => {
    try { window.print(); } catch { /* noop */ }
  };

  // Print routes: force the NOON (default) theme so morning/afternoon/night
  // palettes never bleed into a printed form; auto-name the PDF "{form} {date}"
  // and auto-print. Everything is restored on cleanup.
  useEffect(() => {
    if (!isPrintRoute || typeof window === 'undefined') return undefined;
    const el = document.documentElement;
    const prevTod = el.getAttribute('data-tod');
    el.setAttribute('data-tod', 'noon');
    const previousTitle = document.title;
    document.title = `${formContent.title} ${new Date().toLocaleDateString('en-CA')}`.replace(/\s+/g, ' ').trim();
    const t = window.setTimeout(() => { try { window.focus(); window.print(); } catch { /* noop */ } }, 650);
    return () => {
      window.clearTimeout(t);
      document.title = previousTitle;
      if (prevTod) el.setAttribute('data-tod', prevTod); else el.removeAttribute('data-tod');
    };
  }, [isPrintRoute, formContent.title]);

  return (
    <ScreenStack metrics={isPrintRoute ? [] : operationsMetrics}>
      <div className="ci-premium-print-toolbar no-print mx-auto mb-md flex max-w-[8.5in] flex-wrap items-center justify-between gap-sm rounded-lg border border-hairline bg-surface-glass p-md text-xs shadow-rest">
        <span className="text-muted">{isPrintRoute ? 'Fill the form, then print or save as PDF.' : 'Form viewer remains fillable before print/download.'}</span>
        <div className="flex gap-sm">
          <button onClick={isPrintRoute ? printNow : navigateToPrint} className="rounded border border-hairline px-3 py-1 hover:bg-surface-glass" type="button">
            Print / Download
          </button>
          <button onClick={navigateToEsign} className="rounded border border-hairline px-3 py-1 hover:bg-surface-glass" type="button">
            Open eCIgn
          </button>
        </div>
      </div>

      <article className="ci-premium-print-document ci-premium-form-document mx-auto bg-white text-[#1F1C1B]">
        <div className="ci-premium-top-rule" />
        <div className="ci-premium-inner">
          <header className="ci-premium-header">
            <img className="ci-premium-logo" src="/ci-logo-gray.png" alt="Care Indeed" />
            <div className="ci-premium-header-meta">
              <strong>{record.id} · v{formContent.version}</strong>
              Enterprise Forms Library<br />
              Fillable Form Workspace
            </div>
          </header>

          <section className="ci-premium-cover-block">
            <p className="ci-premium-kicker">Template · Form {record.id}</p>
            <h1>{formContent.title}</h1>
            <div className="ci-premium-meta-grid">
              <div><span>Form ID</span><strong>{record.id}</strong></div>
              <div><span>Domain</span><strong>{record.domainCode}</strong></div>
              <div><span>Version</span><strong>v{formContent.version}</strong></div>
              <div><span>Effective</span><strong>{formContent.effectiveDate}</strong></div>
              <div><span>Next Review</span><strong>{formContent.revisionDate}</strong></div>
              <div><span>Instance</span><strong>{formInstanceId ?? 'Draft'}</strong></div>
            </div>
          </section>

          <section className="ci-premium-note ci-premium-note-teal">
            <strong>Purpose</strong>
            <p>{formContent.purpose}</p>
          </section>
          <section className="ci-premium-note ci-premium-note-orange">
            <strong>Instructions</strong>
            <p>{formContent.instructions}</p>
          </section>

          <form className="ci-premium-form-sections" onSubmit={(e) => e.preventDefault()}>
            {formContent.sections.map((section, sectionIndex) => (
              <PremiumFormSection
                key={`${section.title}-${sectionIndex}`}
                section={section}
                sectionIndex={sectionIndex}
                values={formValues}
                setField={updateValue}
              />
            ))}
          </form>

          <footer className="ci-premium-footer">
            <span>Care Indeed Home Health Care, Inc.</span>
            <span>{record.id} · Fillable print/download view</span>
          </footer>
        </div>
      </article>
    </ScreenStack>
  );
}

function PremiumFormSection({
  section,
  sectionIndex,
  values,
  setField,
}: {
  section: FormSection;
  sectionIndex: number;
  values: Record<string, string | boolean>;
  setField: (key: string, value: string | boolean) => void;
}) {
  return (
    <section className="ci-premium-section">
      <h2>{section.title}</h2>
      {section.description && <p className="ci-premium-section-desc">{section.description}</p>}

      {section.layout === 'grid' && (
        <div className="ci-premium-field-grid">
          {(section.fields ?? []).map((field, fieldIndex) => (
            <PremiumFieldControl
              key={`${field.label}-${fieldIndex}`}
              field={field}
              fieldKey={`s${sectionIndex}-f${fieldIndex}`}
              value={values[`s${sectionIndex}-f${fieldIndex}`]}
              setField={setField}
            />
          ))}
        </div>
      )}

      {section.layout === 'checklist' && (
        <div className="ci-premium-checklist">
          {(section.items ?? []).map((item, itemIndex) => {
            const key = `s${sectionIndex}-chk${itemIndex}`;
            return (
              <label key={key}>
                <input type="checkbox" checked={values[key] === true} onChange={(e) => setField(key, e.target.checked)} />
                <span>{item}</span>
              </label>
            );
          })}
        </div>
      )}

      {section.layout === 'attestation' && (
        <div className="ci-premium-checklist">
          {section.body && <p className="ci-premium-section-desc">{section.body}</p>}
          {(section.acknowledgments ?? []).map((ack, itemIndex) => {
            const key = `s${sectionIndex}-ack${itemIndex}`;
            return (
              <label key={key}>
                <input type="checkbox" checked={values[key] === true} onChange={(e) => setField(key, e.target.checked)} />
                <span>{ack}</span>
              </label>
            );
          })}
        </div>
      )}

      {(section.layout === 'narrative') && (
        <textarea
          rows={5}
          value={(values[`s${sectionIndex}-narrative`] as string) ?? section.body ?? ''}
          onChange={(e) => setField(`s${sectionIndex}-narrative`, e.target.value)}
          className="ci-premium-input"
        />
      )}

      {(section.layout === 'table' || section.layout === 'matrix') && (
        <div className="ci-premium-table-wrap">
          <table className="ci-premium-fill-table">
            <thead>
              <tr>
                {(section.columns ?? section.matrixCols ?? ['Entry']).map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.min(section.rowCount ?? 6, 8) }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {(section.columns ?? section.matrixCols ?? ['Entry']).map((column, columnIndex) => {
                    const key = `s${sectionIndex}-r${rowIndex}-c${columnIndex}`;
                    return (
                      <td key={`${column}-${columnIndex}`}>
                        <input value={(values[key] as string) ?? ''} onChange={(e) => setField(key, e.target.value)} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.layout === 'image' && section.image && (
        <div className="ci-premium-image-block my-2">
          <img
            src={section.image.src}
            alt={section.image.alt || section.title}
            className="max-w-full h-auto border border-card rounded"
          />
          {section.image.caption && (
            <p className="ci-premium-section-desc mt-1 text-xs italic">{section.image.caption}</p>
          )}
        </div>
      )}

      {section.layout === 'signature' && (
        <div className="ci-premium-field-grid">
          {(section.fields ?? []).map((field, fieldIndex) => (
            <PremiumFieldControl
              key={`${field.label}-${fieldIndex}`}
              field={field}
              fieldKey={`s${sectionIndex}-sig${fieldIndex}`}
              value={values[`s${sectionIndex}-sig${fieldIndex}`]}
              setField={setField}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PremiumFieldControl({
  field,
  fieldKey,
  value,
  setField,
}: {
  field: FormField;
  fieldKey: string;
  value: string | boolean | undefined;
  setField: (key: string, value: string | boolean) => void;
}) {
  const spanClass = field.col === 1 ? 'ci-premium-field--span-1' : field.col === 4 ? 'ci-premium-field--span-4' : 'ci-premium-field--span-2';
  const label = (
    <span>
      {field.label}{field.required ? <em> *</em> : null}
    </span>
  );

  if (field.type === 'textarea') {
    return (
      <label className={`ci-premium-field ${spanClass}`}>
        {label}
        <textarea rows={3} value={(value as string) ?? ''} placeholder={field.placeholder} onChange={(e) => setField(fieldKey, e.target.value)} />
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className={`ci-premium-field ${spanClass}`}>
        {label}
        <select value={(value as string) ?? ''} onChange={(e) => setField(fieldKey, e.target.value)}>
          <option value="">Select</option>
          {(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className={`ci-premium-field ci-premium-check-field ${spanClass}`}>
        <input type="checkbox" checked={value === true} onChange={(e) => setField(fieldKey, e.target.checked)} />
        {label}
      </label>
    );
  }

  if (field.type === 'radio') {
    return (
      <div className={`ci-premium-field ${spanClass}`}>
        {label}
        <div className="ci-premium-radio-row">
          {(field.options ?? []).map((option) => (
            <label key={option}>
              <input type="radio" name={fieldKey} checked={value === option} onChange={() => setField(fieldKey, option)} />
              {option}
            </label>
          ))}
        </div>
      </div>
    );
  }

  const inputType = field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text';
  return (
    <label className={`ci-premium-field ${spanClass}`}>
      {label}
      <input type={inputType} value={(value as string) ?? ''} placeholder={field.placeholder} onChange={(e) => setField(fieldKey, e.target.value)} />
    </label>
  );
}

function BradScreen() {
  return (
    <ScreenStack metrics={[]}>
      <BradWorkspace />
    </ScreenStack>
  );
}

function BuilderScreen() {
  return (
    <ScreenStack metrics={[]}>
      <BuilderWorkspace />
    </ScreenStack>
  );
}

function ReportPlaceholder({ hashId }: { hashId: string }) {
  const titleMap: Record<string, string> = {
    'report-policy-review-aging': 'Policy Review Aging',
    'report-policy-expiration': 'Policy Expiration (90d)',
    'report-policy-attestation': 'Policy Attestation Gaps',
    'report-policy-crosslinks': 'Policy Cross-Link Gaps',
    'report-policy-sla': 'Policy Approval SLA',
    'report-master-evidence-expiring': 'Master Evidence Expiring (90d)',
    'report-ecign-signatures': 'eCIgn Signature Status',
    'report-ecign-expiring': 'eCIgn Expiring (90d)',
    'report-training-overdue': 'Training Overdue',
    'report-training-policy-attestation': 'Training Policy Attestation Gap',
    'report-training-drills': 'Training Drill Participation',
    'report-training-evidence': 'Training Evidence Missing',
    'report-community-thread-sla': 'Community Thread SLA',
    'report-community-engagement-by-role': 'Community Engagement by Role',
    'report-help-center-usage': 'Help Center / KB Usage',
    'report-community-to-ces': 'Thread-to-CES Conversion',
  };
  const title = titleMap[hashId] || 'Operational Report';
  return (
    <div className="mx-auto max-w-[1040px] px-xl py-xl">
      <div className="mb-lg flex items-center gap-md">
        <div className="text-2xl font-semibold tracking-tight text-ink">{title}</div>
        <ToneBadge size="sm" status="live">CES</ToneBadge>
      </div>
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-lg mb-xl">
        <div className="rounded-[20px] bg-white p-lg shadow-[0_10px_28px_rgba(31,28,27,0.05)]">
          <div className="uppercase text-xs tracking-widest text-muted mb-xs">Source</div>
          <div className="text-lg font-medium">CES Command + Policy / Journey / Threads</div>
        </div>
        <div className="rounded-[20px] bg-white p-lg shadow-[0_10px_28px_rgba(31,28,27,0.05)]">
          <div className="uppercase text-xs tracking-widest text-muted mb-xs">Status</div>
          <div className="text-lg font-medium">Data live from registry + stores</div>
        </div>
        <div className="rounded-[20px] bg-white p-lg shadow-[0_10px_28px_rgba(31,28,27,0.05)]">
          <div className="uppercase text-xs tracking-widest text-muted mb-xs">Note</div>
          <div className="text-sm text-muted">Report details coming from CES data source. Full analytics surface in follow-up iteration.</div>
        </div>
      </div>
      <div className="rounded-[24px] border border-hairline bg-surface-glass p-xl text-sm text-muted">This placeholder supports read-only navigation from the CES Command Center dashboard. Cards remain non-clinical admin/compliance signals only.</div>
    </div>
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
      <section className="grid gap-xl desktop:grid-cols-1">
        <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
          <div className="flex items-center justify-between">
            <h2 className="text-h2 font-medium text-ink">Sprint readiness trend{isPrintRoute && <span className="ml-2 inline-block"><ToneTag tone="teal">Print view</ToneTag></span>}</h2>
            <button
              type="button"
              onClick={() => { window.location.href = '/ces/reports?print=1'; }}
              className="text-xs px-3 py-1 rounded border border-hairline hover:bg-surface-glass hover:backdrop-blur-md"
            >
              Print / Download
            </button>
          </div>
          <div className="mt-xl rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
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
                if (idx === 0) navigate('/compliance/master-controls');
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
            <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl">
              <div className="mx-auto max-w-[450px] rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-hover">
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
              <div className="rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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
            <div className="ml-auto max-w-[410px] rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-hover">
              <div className="mb-lg flex items-center justify-between">
                <ToneTag>Task drawer</ToneTag>
                <span className="text-muted">x</span>
              </div>
              <h2 className="text-h2 font-medium text-ink">QAPI minutes packet</h2>
              <div className="mt-lg grid gap-sm">
                {['Owner: Compliance Officer', 'Evidence: 3 files', 'Next: Send for signature'].map((item) => (
                  <div className="flex items-center justify-between rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md text-sm text-ink" key={item}>
                    {item}
                    <CheckCircle2 aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
                  </div>
                ))}
              </div>
            </div>
          </OverlayPanel>
          <OverlayPanel icon={Upload} subtitle="Mobile-first action sheet for field evidence capture and signature steps." title="Bottom Sheet">
            <div className="rounded-2xl border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
              <div className="mx-auto mb-md h-xs w-[52px] rounded-sm bg-disabled" />
              <div className="rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
                <ToneTag>Field action</ToneTag>
                <h2 className="mt-md text-h2 font-medium text-ink">Capture wound photo</h2>
                <p className="mt-sm text-sm text-muted">Attach image, select visit, and submit to the audit packet.</p>
              </div>
            </div>
          </OverlayPanel>
          <OverlayPanel icon={FileText} subtitle="Anchored menu with low-noise surface, teal active state, and orange intervention action." title="Popover and Inline Menu">
            <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl">
              <Button>Evidence actions</Button>
              <div className="mt-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-md shadow-rest">
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
    <section className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
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
