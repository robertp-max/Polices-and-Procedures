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
  { label: 'Dashboard', hashIds: ['dashboard'] },
  { label: 'Clinician Profiles', hashIds: ['clinicians', 'clinician-detail'] },
  { label: 'Patient Profiles', hashIds: ['patients', 'patient-detail'] },
  { label: 'Calendar', hashIds: ['master-calendar', 'staffing-calendar'] },
  { label: 'Brad', hashIds: ['brad'] },
  {
    label: 'Compliance Execution (CES)',
    hashIds: [
      'ces-calendar',
      'ces-board',
      'events-board',
      'workflows',
      'workflow-swimlane',
      'master-controls',
      'audit-mode',
      'evidence-center',
      'ces-reports',
      'mobile-incident',
      'my-tasks',
    ],
  },
  {
    label: 'Taxonomy',
    hashIds: [
      'framework',
      'achc-survey',
      'achc-crosswalk',
      'policy-library',
      'policy-detail',
      'forms-library',
      'form-viewer',
      'ecign-workspace',
      'artifact-viewer',
      'generic-reference',
    ],
  },
  {
    label: 'Onboarding',
    hashIds: [
      'journey-overview',
      'journey-v1',
      'module-player',
      'appendix-f',
      'supervisor',
      'journey-admin',
      'user-guide',
    ],
  },
  {
    label: 'Onboarding v2',
    hashIds: [
      'onboarding-v2-dashboard',
      'onboarding-v2-activate',
      'onboarding-v2-batches',
      'onboarding-v2-batch',
      'onboarding-v2-audit',
      'onboarding-v2-governance',
    ],
  },
  {
    label: 'System',
    hashIds: ['policy-lifecycle', 'hubstaff', 'system-docs', 'help-center', 'governance', 'policy-lifecycle-detail'],
  },
  { label: 'Admin', hashIds: ['admin-groups', 'admin-roles', 'admin-permissions', 'admin-users', 'surveyor-viewer'] },
] as const satisfies readonly SidebarSection[];

const routeChrome: Partial<Record<V6RouteHashId, RouteChrome>> = {
  'achc-crosswalk': { eyebrow: 'Taxonomy', icon: Workflow },
  'achc-survey': { eyebrow: 'Taxonomy', icon: ShieldCheck },
  'admin-groups': { eyebrow: 'Admin', icon: Users },
  'admin-permissions': { eyebrow: 'Admin', icon: LockKeyhole },
  'admin-roles': { eyebrow: 'Admin', icon: Shield },
  'admin-users': { eyebrow: 'Admin', icon: UserCog },
  'artifact-viewer': { eyebrow: 'Taxonomy', icon: FileSearch },
  'audit-mode': { eyebrow: 'Compliance Execution (CES)', icon: ScanSearch },
  brad: {
    description:
      'Decision-support workspace for primary operations triage, staffing risk, coverage decisions, and generated work products.',
    eyebrow: 'Brad',
    icon: Bot,
    navGroup: 'Brad',
    navLabel: 'Brad',
    title: 'Brad',
  },
  'ces-board': {
    description: 'Operational Kanban board for sprint execution, blockers, evidence, signatures, and owner handoffs.',
    eyebrow: 'Compliance Execution (CES)',
    icon: Columns3,
    navLabel: 'Kanban Board',
    title: 'Kanban Board',
  },
  'ces-calendar': { eyebrow: 'Compliance Execution (CES)', icon: CalendarDays },
  'ces-reports': {
    description:
      'Executive CES reporting for sprint readiness, blockers, evidence throughput, signature aging, and survey exposure.',
    eyebrow: 'Compliance Execution (CES)',
    icon: BarChart3,
  },
  clinicians: { eyebrow: 'Clinician Profiles', icon: Users },
  'clinician-detail': { eyebrow: 'Clinician Profiles', icon: UserRoundCheck },
  dashboard: {
    description: 'Primary operations command center for census pressure, staffing coverage, urgent tasks, and clinical risk.',
    eyebrow: 'Dashboard',
    icon: LayoutDashboard,
  },
  'ecign-workspace': { eyebrow: 'Taxonomy', icon: FileText },
  'events-board': { eyebrow: 'Compliance Execution (CES)', icon: PanelsTopLeft },
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
  'forms-library': { eyebrow: 'Taxonomy', icon: ClipboardList },
  framework: { eyebrow: 'Taxonomy', icon: Library },
  governance: { eyebrow: 'System', icon: Landmark },
  'help-center': { eyebrow: 'System', icon: HelpCircle },
  hubstaff: { eyebrow: 'System', icon: BarChart3 },
  'journey-admin': { eyebrow: 'Onboarding', icon: BarChart3 },
  'journey-overview': { eyebrow: 'Onboarding', icon: ListChecks },
  'journey-v1': { eyebrow: 'Onboarding', icon: ListChecks },
  'master-calendar': {
    description:
      'Daily operations calendar for SOC starts, recertification locks, staffing huddles, audits, and coverage checkpoints.',
    eyebrow: 'Calendar',
    icon: CalendarDays,
  },
  'master-controls': { eyebrow: 'Compliance Execution (CES)', icon: ShieldCheck },
  'mobile-incident': { eyebrow: 'Compliance Execution (CES)', icon: Smartphone },
  'module-player': { eyebrow: 'Onboarding', icon: BookOpen },
  'my-tasks': { eyebrow: 'Compliance Execution (CES)', icon: ListChecks },
  'onboarding-v2-activate': { eyebrow: 'Onboarding v2', icon: ShieldCheck },
  'onboarding-v2-audit': { eyebrow: 'Onboarding v2', icon: ScanSearch },
  'onboarding-v2-batch': { eyebrow: 'Onboarding v2', icon: ListChecks },
  'onboarding-v2-batches': { eyebrow: 'Onboarding v2', icon: ListChecks },
  'onboarding-v2-dashboard': { eyebrow: 'Onboarding v2', icon: LayoutDashboard },
  'onboarding-v2-governance': { eyebrow: 'Onboarding v2', icon: Shield, navLabel: 'Onboarding Overrides' },
  patients: { eyebrow: 'Patient Profiles', icon: HeartPulse },
  'patient-detail': {
    description: 'Care plan, clinician assignments, documentation gaps, visit cadence, and high-risk indicators.',
    eyebrow: 'Patient Profiles',
    icon: ClipboardPlus,
    title: 'Elena Vargas - SOC Active',
  },
  'policy-detail': { eyebrow: 'Taxonomy', icon: FileText },
  'policy-library': {
    description: 'Canonical policy corpus with lifecycle state, owner stewardship, review cycles, and survey context.',
    eyebrow: 'Taxonomy',
    icon: BookOpen,
  },
  'policy-lifecycle': { eyebrow: 'System', icon: History },
  'policy-lifecycle-detail': { eyebrow: 'System', icon: History },
  'staffing-calendar': { eyebrow: 'Calendar', icon: CalendarDays },
  supervisor: { eyebrow: 'Onboarding', icon: UserCheck },
  'surveyor-viewer': { eyebrow: 'Admin', icon: FileSearch },
  'system-docs': { eyebrow: 'System', icon: BookMarked },
  'user-guide': {
    description:
      'Step-by-step procedures, policy citations and survey-ready expectations. Persona-specific guides. Contextual links to full Help Center articles.',
    eyebrow: 'Onboarding',
    icon: BookMarked,
  },
  workflows: { eyebrow: 'Compliance Execution (CES)', icon: Workflow, navLabel: 'Workflows Library' },
  'workflow-swimlane': { eyebrow: 'Compliance Execution (CES)', icon: Workflow },
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
