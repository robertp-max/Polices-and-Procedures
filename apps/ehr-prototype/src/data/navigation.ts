/**
 * Application navigation, derived from the requirements register.
 *
 * Honesty rule: `built` items must have a real route + screen. `substitute`
 * points at existing Care Indeed rails. Remaining gaps stay `planned` only
 * when no first-pass pageview exists yet.
 */
import {
  Activity, ArrowRightLeft, Award, Bot, Building2, CalendarDays, ClipboardList,
  Database, FileSignature, FileStack, FileText, FolderOpen, GitBranch,
  GraduationCap, Handshake, Inbox, KeyRound, LayoutDashboard, ListChecks, Lock,
  MapPin, MessagesSquare, Network, Palette, Pill, Receipt, Scale, ShieldCheck,
  Siren, Stethoscope, TrendingUp, UserCheck, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { IntegrationTargetId } from './integrationTargets'

export type NavStatus = 'built' | 'planned' | 'substitute'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  domainId?: string
  status: NavStatus
  integrationId?: IntegrationTargetId
  badge?: number
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/today', label: 'Today', icon: LayoutDashboard, domainId: 'COR', status: 'built' },
      { to: '/work-queue', label: 'My work queue', icon: ListChecks, domainId: 'COR', status: 'built', badge: 18 },
      { to: '/patients', label: 'Patients', icon: Users, domainId: 'PAT', status: 'built' },
      { to: '/intake', label: 'Referral & intake', icon: Inbox, domainId: 'REF', status: 'built', badge: 6 },
      { to: '/schedule', label: 'Schedule', icon: CalendarDays, domainId: 'SCH', status: 'built' },
      { to: '/mvp-policy#connect', label: 'Messages', icon: MessagesSquare, domainId: 'COR', status: 'substitute', integrationId: 'connect' },
    ],
  },
  {
    label: 'Care delivery',
    items: [
      { to: '/clinical', label: 'Clinical', icon: Stethoscope, domainId: 'CLN', status: 'built', badge: 3 },
      { to: '/episodes', label: 'Episodes & certification', icon: ClipboardList, domainId: 'EPI', status: 'built' },
      { to: '/oasis', label: 'OASIS assessments', icon: Activity, domainId: 'EPI', status: 'built', badge: 7 },
      { to: '/orders', label: 'Orders', icon: FileSignature, domainId: 'CLN', status: 'built', badge: 4 },
      { to: '/medications', label: 'Medications', icon: Pill, domainId: 'CLN', status: 'built' },
      { to: '/field-visits', label: 'Field visits & EVV', icon: MapPin, domainId: 'FLD', status: 'built' },
      { to: '/aide-supervision', label: 'Aide supervision', icon: UserCheck, domainId: 'HHA', status: 'built' },
    ],
  },
  {
    label: 'Revenue cycle',
    items: [
      { to: '/billing', label: 'Billing & claims', icon: Receipt, domainId: 'RCM', status: 'built' },
      { to: '/authorizations', label: 'Authorizations', icon: KeyRound, domainId: 'RCM', status: 'built' },
      { to: '/beneficiary-notices', label: 'Beneficiary notices', icon: FileText, domainId: 'BEN', status: 'built' },
    ],
  },
  {
    label: 'Quality & compliance',
    items: [
      { to: '/quality', label: 'Quality & compliance', icon: ShieldCheck, domainId: 'QAP', status: 'built' },
      { to: '/qapi', label: 'QAPI programme', icon: Award, domainId: 'QAP', status: 'built' },
      { to: '/cms-quality', label: 'CMS quality reporting', icon: TrendingUp, domainId: 'HQR', status: 'built' },
      { to: '/competency', label: 'Competency & in-service', icon: GraduationCap, domainId: 'QAP', status: 'built' },
      { to: '/emergency', label: 'Emergency preparedness', icon: Siren, domainId: 'EMP', status: 'built' },
    ],
  },
  {
    label: 'Records',
    items: [
      { to: '/mvp-policy#ecign', label: 'Documents & signatures', icon: FolderOpen, domainId: 'DOC', status: 'substitute', integrationId: 'ecign' },
      { to: '/mvp-policy#forms', label: 'Forms library', icon: FileStack, domainId: 'FRM', status: 'substitute', integrationId: 'forms' },
      { to: '/legal-evidence', label: 'Legal evidence', icon: Scale, domainId: 'DOC', status: 'built' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/reports', label: 'Reports', icon: TrendingUp, domainId: 'DAT', status: 'built' },
      { to: '/data-exports', label: 'Data & exports', icon: Database, domainId: 'DAT', status: 'built' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/users-access', label: 'Users & access', icon: Lock, domainId: 'IAM', status: 'built' },
      { to: '/org-master', label: 'Organization & master data', icon: Building2, domainId: 'GOV', status: 'built' },
      { to: '/interoperability', label: 'Interoperability', icon: Network, domainId: 'FHR', status: 'built' },
      { to: '/ai-governance', label: 'AI governance', icon: Bot, domainId: 'AIG', status: 'built' },
      { to: '/security', label: 'Security & reliability', icon: ShieldCheck, domainId: 'SEC', status: 'built' },
      { to: '/mvp-policy#vendorBaaControl', label: 'Vendors & BAAs', icon: Handshake, domainId: 'TPR', status: 'substitute', integrationId: 'vendorBaaControl' },
      { to: '/migration', label: 'Migration & adoption', icon: ArrowRightLeft, domainId: 'MIG', status: 'built' },
      { to: '/traceability', label: 'Traceability', icon: GitBranch, domainId: 'TRC', status: 'built' },
      { to: '/design-system', label: 'Design system', icon: Palette, domainId: 'UIX', status: 'built' },
    ],
  },
]

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(g => g.items)

export const NAV_COUNTS = {
  total: ALL_NAV_ITEMS.length,
  built: ALL_NAV_ITEMS.filter(i => i.status === 'built').length,
  planned: ALL_NAV_ITEMS.filter(i => i.status === 'planned').length,
  substitute: ALL_NAV_ITEMS.filter(i => i.status === 'substitute').length,
}
