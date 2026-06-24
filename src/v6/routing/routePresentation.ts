import {
  BarChart3,
  BookMarked,
  BookOpen,
  Bot,
  CalendarDays,
  ClipboardList,
  ClipboardPlus,
  Columns3,
  FileSearch,
  FileText,
  FolderOpen,
  HeartPulse,
  HelpCircle,
  History,
  Landmark,
  LayoutDashboard,
  Library,
  ListChecks,
  LockKeyhole,
  PanelRightOpen,
  PanelsTopLeft,
  ScanSearch,
  Shield,
  ShieldCheck,
  Smartphone,
  UserCheck,
  UserCog,
  UserRoundCheck,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { type V6RouteHashId } from './routeRegistry';

interface RouteLike {
  description: string;
  group: string;
  hashId: V6RouteHashId;
  title: string;
}

export interface RouteChrome {
  description?: string;
  eyebrow: string;
  icon?: LucideIcon;
  navGroup?: string;
  navLabel?: string;
  title?: string;
}

export const DRAWER_SYSTEM_CHROME: RouteChrome = {
  description:
    'Right drawer and bottom sheets for task detail, evidence, workflow execution. Responsive stacked layers for progressive disclosure.',
  eyebrow: 'Prototypes & Overlays',
  icon: PanelRightOpen,
  navGroup: 'System',
  navLabel: 'Drawer System',
  title: 'Drawer System',
};

interface SidebarSection {
  hashIds: readonly V6RouteHashId[];
  label: string;
}

export const SIDEBAR_SECTIONS = [
  { label: 'Dashboard / Command Center', hashIds: ['dashboard'] },
  {
    label: 'Policy Library',
    hashIds: [
      'policy-library',
      'policy-detail',
      'policy-lifecycle',
      'policy-lifecycle-detail',
      'taxonomy',
      'framework',
      'achc-survey',
      'achc-crosswalk',
      'generic-reference',
    ],
  },
  {
    label: 'Forms',
    hashIds: ['forms-library', 'form-viewer', 'ecign-workspace', 'artifact-viewer'],
  },
  {
    label: 'CES / Compliance Execution',
    hashIds: [
      'ces-calendar',
      'ces-board',
      'events-board',
      'workflows',
      'workflow-swimlane',
      'master-controls',
      'ces-reports',
      'mobile-incident',
      'my-tasks',
    ],
  },
  { label: 'Calendar', hashIds: ['master-calendar', 'staffing-calendar'] },
  { label: 'Evidence Center', hashIds: ['evidence-center'] },
  { label: 'Audit Mode', hashIds: ['audit-mode'] },
  {
    label: 'Journey / Training',
    hashIds: [
      'journey-overview',
      'journey-v1',
      'module-player',
      'appendix-f',
      'supervisor',
      'journey-admin',
      'user-guide',
      'onboarding-v2-dashboard',
      'onboarding-v2-activate',
      'onboarding-v2-batches',
      'onboarding-v2-batch',
      'onboarding-v2-audit',
      'onboarding-v2-governance',
    ],
  },
  {
    label: 'Staffing / Clinical',
    hashIds: ['clinicians', 'clinician-detail', 'patients', 'patient-detail'],
  },
  { label: 'iAdministrator', hashIds: ['brad'] },
  {
    label: 'User Management / Identity Admin',
    hashIds: ['admin-groups', 'admin-roles', 'admin-permissions', 'admin-users', 'surveyor-viewer'],
  },
  { label: 'System / Settings', hashIds: ['system-docs', 'help-center', 'governance', 'hubstaff'] },
] as const satisfies readonly SidebarSection[];

const routeChrome: Partial<Record<V6RouteHashId, RouteChrome>> = {
  'achc-crosswalk': {
    description: 'Regulatory crosswalk tying CMS, Title 22, ACHC standards, policy owners, and evidence support levels.',
    eyebrow: 'Taxonomy',
    icon: Workflow,
    title: 'ACHC Crosswalk',
  },
  'achc-survey': {
    description: 'Survey alignment workspace for policy readiness, ACHC standards, evidence checklists, and owner action.',
    eyebrow: 'Taxonomy',
    icon: ShieldCheck,
    title: 'ACHC Survey Alignment',
  },
  'admin-groups': {
    description: 'Administrative user-group matrix with member counts, linked roles, permission posture, and governance review state.',
    eyebrow: 'Admin',
    icon: Users,
    title: 'User Groups',
  },
  'admin-roles': {
    description: 'Role matrix for privilege scope, user-group links, permission bundles, and review posture.',
    eyebrow: 'Admin',
    icon: Shield,
    title: 'Roles',
  },
  'admin-permissions': {
    description: 'Permission catalog showing scope, linked roles, risk posture, and governance readiness.',
    eyebrow: 'Admin',
    icon: LockKeyhole,
    title: 'Permissions',
  },
  'admin-users': {
    description: 'Administrative user matrix with role assignments, MFA/access state, audit signals, and security review cards.',
    eyebrow: 'Admin',
    icon: UserCog,
    title: 'Users',
  },
  'artifact-viewer': {
    description: 'Read-only artifact packet with verification state, linked policies, evidence hash, and source metadata.',
    eyebrow: 'Taxonomy',
    icon: FileSearch,
    title: 'Artifact Viewer',
  },
  'audit-mode': {
    description: 'Read-only audit queue for missing evidence, pending approvals, certified packets, and survey readiness.',
    eyebrow: 'Compliance Execution (CES)',
    icon: ScanSearch,
    title: 'Audit Mode',
  },
  brad: {
    description:
      'Decision-support workspace for primary operations triage, staffing risk, coverage decisions, and generated work products.',
    eyebrow: 'iAdministrator',
    icon: Bot,
    navGroup: 'iAdministrator',
    navLabel: 'iAdministrator',
    title: 'iAdministrator',
  },
  'ces-board': {
    description: 'Operational Kanban board for sprint execution, blockers, evidence, signatures, and owner handoffs.',
    eyebrow: 'Compliance Execution (CES)',
    icon: Columns3,
    navLabel: 'Kanban Board',
    title: 'Kanban Board',
  },
  'ces-calendar': {
    description: 'Sprint calendar for evidence-upload targets, lock milestones, survey packets, and compliance checkpoints.',
    eyebrow: 'Compliance Execution (CES)',
    icon: CalendarDays,
    title: 'CES Calendar',
  },
  'ces-reports': {
    description:
      'Executive CES reporting for sprint readiness, blockers, evidence throughput, signature aging, and survey exposure.',
    eyebrow: 'Compliance Execution (CES)',
    icon: BarChart3,
  },
  clinicians: {
    description: 'Clinician roster with caseload capacity, credential posture, training state, and coverage assignments.',
    eyebrow: 'Clinician Profiles',
    icon: Users,
    navLabel: 'Clinician Profiles',
    title: 'Clinician Profiles',
  },
  'clinician-detail': {
    description: 'Credential posture, assigned patients, training status, and active compliance requirements.',
    eyebrow: 'Clinician Profiles',
    icon: UserRoundCheck,
    title: 'Maria Delgado, RN',
  },
  dashboard: {
    description: 'Primary operations command center for census pressure, staffing coverage, urgent tasks, and clinical risk.',
    eyebrow: 'Dashboard',
    icon: LayoutDashboard,
  },
  'ecign-workspace': {
    description: 'Signing workspace for required forms, signer sequencing, consent readiness, and certificate evidence state.',
    eyebrow: 'Taxonomy',
    icon: FileText,
    title: 'eCIgn Signing Workspace',
  },
  'events-board': {
    description: 'Event execution board grouped by readiness, owner action, evidence state, and survey-facing risk.',
    eyebrow: 'Compliance Execution (CES)',
    icon: PanelsTopLeft,
    title: 'Events Board',
  },
  'evidence-center': {
    description:
      'Evidence repository for policies, forms, eCIgn certificates, source files, audit indexes, and retention state.',
    eyebrow: 'Compliance Execution (CES)',
    icon: FolderOpen,
  },
  'form-viewer': {
    description: 'Structured form renderer with sections, validation, signer requirements, and linked policy context.',
    eyebrow: 'Taxonomy',
    icon: ClipboardList,
    title: 'GV-FM-006 - Conflict of Interest Disclosure',
  },
  'forms-library': {
    description: 'Forms matrix for required artifacts, signer posture, evidence linkage, and readiness state.',
    eyebrow: 'Taxonomy',
    icon: ClipboardList,
    title: 'Forms Library',
  },
  framework: {
    description: 'Regulatory framework taxonomy connecting ACHC, CMS, Title 22, OSHA, policies, forms, and evidence support.',
    eyebrow: 'Taxonomy',
    icon: Library,
    title: 'Framework',
  },
  taxonomy: {
    description: 'Regulatory framework taxonomy (V1 parity alias) for domains, policies, forms, workflows, and authorities.',
    eyebrow: 'Taxonomy',
    icon: Library,
    navLabel: 'Taxonomy (legacy)',
    title: 'Taxonomy',
  },
  'generic-reference': {
    description: 'Reference viewer with source metadata, evidence hash state, linked requirements, and review posture.',
    eyebrow: 'Taxonomy',
    icon: FileSearch,
    title: 'Reference Viewer',
  },
  governance: { eyebrow: 'System Documentation', icon: Landmark },
  'help-center': { eyebrow: 'System Documentation', icon: HelpCircle },
  hubstaff: { eyebrow: 'Hubstaff', icon: BarChart3 },
  'journey-admin': { eyebrow: 'Onboarding', icon: BarChart3 },
  'journey-overview': { eyebrow: 'Onboarding', icon: ListChecks },
  'journey-v1': { eyebrow: 'Onboarding', icon: ListChecks },
  'master-calendar': {
    description:
      'Daily operations calendar for SOC starts, recertification locks, staffing huddles, audits, and coverage checkpoints.',
    eyebrow: 'Calendar',
    icon: CalendarDays,
  },
  'master-controls': {
    description: 'Control inventory matrix for operational risk tier, source status, evidence posture, and audit readiness.',
    eyebrow: 'Compliance Execution (CES)',
    icon: ShieldCheck,
    title: 'Master Controls',
  },
  'mobile-incident': { eyebrow: 'Compliance Execution (CES)', icon: Smartphone },
  'module-player': { eyebrow: 'Onboarding', icon: BookOpen },
  'my-tasks': {
    description: 'Personal compliance task board with due work, blocked items, evidence chips, and owner action context.',
    eyebrow: 'Compliance Execution (CES)',
    icon: ListChecks,
    title: 'My Tasks',
  },
  'onboarding-v2-activate': { eyebrow: 'Onboarding v2', icon: ShieldCheck },
  'onboarding-v2-audit': { eyebrow: 'Onboarding v2', icon: ScanSearch },
  'onboarding-v2-batch': { eyebrow: 'Onboarding v2', icon: ListChecks },
  'onboarding-v2-batches': { eyebrow: 'Onboarding v2', icon: ListChecks },
  'onboarding-v2-dashboard': { eyebrow: 'Onboarding v2', icon: LayoutDashboard },
  'onboarding-v2-governance': { eyebrow: 'Onboarding v2', icon: Shield, navLabel: 'Onboarding Overrides' },
  patients: {
    description: 'Patient roster with clinical focus, coverage gaps, schedule state, and high-risk indicators.',
    eyebrow: 'Patient Profiles',
    icon: HeartPulse,
    navLabel: 'Patient Profiles',
    title: 'Patient Profiles',
  },
  'patient-detail': {
    description: 'Care plan, clinician assignments, documentation gaps, visit cadence, and high-risk indicators.',
    eyebrow: 'Patient Profiles',
    icon: ClipboardPlus,
    title: 'Elena Vargas - SOC Active',
  },
  'policy-detail': {
    description: 'Policy detail view with metadata, lifecycle state, linked forms, evidence readiness, and approval context.',
    eyebrow: 'Taxonomy',
    icon: FileText,
    title: 'Policy Detail',
  },
  'policy-library': {
    description: 'Canonical policy corpus with lifecycle state, owner stewardship, review cycles, and survey context.',
    eyebrow: 'Taxonomy',
    icon: BookOpen,
  },
  'policy-lifecycle': { eyebrow: 'Policy Lifecycle', icon: History },
  'policy-lifecycle-detail': { eyebrow: 'Policy Lifecycle', icon: History },
  'staffing-calendar': {
    description: 'Staffing calendar for clinician availability, visit conflicts, shift coverage, and acuity pressure.',
    eyebrow: 'Calendar',
    icon: CalendarDays,
    title: 'Staffing Calendar',
  },
  supervisor: { eyebrow: 'Onboarding', icon: UserCheck },
  'surveyor-viewer': { eyebrow: 'Admin', icon: FileSearch },
  'system-docs': { eyebrow: 'System Documentation', icon: BookMarked },
  'user-guide': {
    description:
      'Step-by-step procedures, policy citations and survey-ready expectations. Persona-specific guides. Contextual links to full Help Center articles.',
    eyebrow: 'Onboarding',
    icon: BookMarked,
  },
  workflows: {
    description: 'Workflow library matrix linking CES workstreams to policy owners, required forms, evidence capture, and swimlane handoffs.',
    eyebrow: 'Compliance Execution (CES)',
    icon: Workflow,
    navLabel: 'Workflows Library',
    title: 'Workflows Library',
  },
  'workflow-swimlane': {
    description:
      'Swimlane execution view for a mandatory event from intake through evidence build, review, signature, and final packet lock.',
    eyebrow: 'Compliance Execution (CES)',
    icon: Workflow,
    title: 'Workflow Swimlane',
  },
};

export function getRouteChrome(route: RouteLike | undefined): RouteChrome {
  if (!route) return { eyebrow: 'System', navGroup: 'System', title: 'Route Not Found' };

  const override = routeChrome[route.hashId];
  const navGroup = override?.navGroup ?? override?.eyebrow ?? route.group;

  return {
    ...override,
    description: override?.description ?? route.description,
    eyebrow: override?.eyebrow ?? route.group,
    navGroup,
    navLabel: override?.navLabel ?? route.title,
    title: override?.title ?? route.title,
  };
}
