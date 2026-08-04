/**
 * Application navigation, derived from the requirements register.
 *
 * The requirements baseline (CI-EHR-SRS-PM-001) defines 27 domains and 104
 * target pageviews. This file is the single source of truth for the operator-
 * facing navigation those domains imply, so the sidebar reflects the real
 * scope of the programme rather than only the screens that happen to be built.
 *
 * Honesty rule: an area that is not built yet is marked `planned` and routes to
 * the shared DomainScreen, which shows that domain's actual requirement
 * statements and states plainly that it is not implemented. Navigation must
 * never imply a capability exists when it does not.
 *
 * `domainId` links each item back to REGISTER_DOMAINS in requirementsSpec.ts.
 */
import {
  Activity, ArrowRightLeft, Award, Bot, Building2, CalendarDays, ClipboardList,
  Database, FileSignature, FileStack, FileText, FolderOpen, GitBranch,
  GraduationCap, Handshake, Inbox, KeyRound, LayoutDashboard, ListChecks, Lock,
  MapPin, MessagesSquare, Network, Palette, Pill, Receipt, Scale, ShieldCheck,
  Siren, Stethoscope, TrendingUp, UserCheck, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type NavStatus = 'built' | 'planned'

export interface NavItem {
  /** Route path. Planned areas use /domain/:domainId. */
  to: string
  label: string
  icon: LucideIcon
  /** Requirement domain id from REGISTER_DOMAINS (requirementsSpec.ts). */
  domainId?: string
  status: NavStatus
  /** Count badge — synthetic workload, shown only for built areas. */
  badge?: number
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

const planned = (domainId: string) => `/domain/${domainId}`

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/today', label: 'Today', icon: LayoutDashboard, domainId: 'COR', status: 'built' },
      { to: planned('COR'), label: 'My work queue', icon: ListChecks, domainId: 'COR', status: 'planned' },
      { to: '/patients', label: 'Patients', icon: Users, domainId: 'PAT', status: 'built' },
      { to: '/intake', label: 'Referral & intake', icon: Inbox, domainId: 'REF', status: 'built', badge: 6 },
      { to: '/schedule', label: 'Schedule', icon: CalendarDays, domainId: 'SCH', status: 'built' },
      { to: planned('COR'), label: 'Messages', icon: MessagesSquare, domainId: 'COR', status: 'planned' },
    ],
  },
  {
    label: 'Care delivery',
    items: [
      { to: '/clinical', label: 'Clinical', icon: Stethoscope, domainId: 'CLN', status: 'built', badge: 3 },
      { to: planned('EPI'), label: 'Episodes & certification', icon: ClipboardList, domainId: 'EPI', status: 'planned' },
      { to: planned('EPI'), label: 'OASIS assessments', icon: Activity, domainId: 'EPI', status: 'planned' },
      { to: '/orders', label: 'Orders', icon: FileSignature, domainId: 'CLN', status: 'built', badge: 4 },
      { to: planned('CLN'), label: 'Medications', icon: Pill, domainId: 'CLN', status: 'planned' },
      { to: planned('FLD'), label: 'Field visits & EVV', icon: MapPin, domainId: 'FLD', status: 'planned' },
      { to: planned('HHA'), label: 'Aide supervision', icon: UserCheck, domainId: 'HHA', status: 'planned' },
    ],
  },
  {
    label: 'Revenue cycle',
    items: [
      { to: '/billing', label: 'Billing & claims', icon: Receipt, domainId: 'RCM', status: 'built' },
      { to: planned('RCM'), label: 'Authorizations', icon: KeyRound, domainId: 'RCM', status: 'planned' },
      { to: planned('BEN'), label: 'Beneficiary notices', icon: FileText, domainId: 'BEN', status: 'planned' },
    ],
  },
  {
    label: 'Quality & compliance',
    items: [
      { to: '/quality', label: 'Quality & compliance', icon: ShieldCheck, domainId: 'QAP', status: 'built' },
      { to: planned('QAP'), label: 'QAPI programme', icon: Award, domainId: 'QAP', status: 'planned' },
      { to: planned('HQR'), label: 'CMS quality reporting', icon: TrendingUp, domainId: 'HQR', status: 'planned' },
      { to: planned('QAP'), label: 'Competency & in-service', icon: GraduationCap, domainId: 'QAP', status: 'planned' },
      { to: planned('EMP'), label: 'Emergency preparedness', icon: Siren, domainId: 'EMP', status: 'planned' },
    ],
  },
  {
    label: 'Records',
    items: [
      { to: planned('DOC'), label: 'Documents & signatures', icon: FolderOpen, domainId: 'DOC', status: 'planned' },
      { to: planned('FRM'), label: 'Forms library', icon: FileStack, domainId: 'FRM', status: 'planned' },
      { to: planned('DOC'), label: 'Legal evidence', icon: Scale, domainId: 'DOC', status: 'planned' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/reports', label: 'Reports', icon: TrendingUp, domainId: 'DAT', status: 'built' },
      { to: planned('DAT'), label: 'Data & exports', icon: Database, domainId: 'DAT', status: 'planned' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: planned('IAM'), label: 'Users & access', icon: Lock, domainId: 'IAM', status: 'planned' },
      { to: planned('GOV'), label: 'Organization & master data', icon: Building2, domainId: 'GOV', status: 'planned' },
      { to: planned('FHR'), label: 'Interoperability', icon: Network, domainId: 'FHR', status: 'planned' },
      { to: planned('AIG'), label: 'AI governance', icon: Bot, domainId: 'AIG', status: 'planned' },
      { to: planned('SEC'), label: 'Security & reliability', icon: ShieldCheck, domainId: 'SEC', status: 'planned' },
      { to: planned('TPR'), label: 'Vendors & BAAs', icon: Handshake, domainId: 'TPR', status: 'planned' },
      { to: planned('MIG'), label: 'Migration & adoption', icon: ArrowRightLeft, domainId: 'MIG', status: 'planned' },
      { to: planned('TRC'), label: 'Traceability', icon: GitBranch, domainId: 'TRC', status: 'planned' },
      { to: '/design-system', label: 'Design system', icon: Palette, domainId: 'UIX', status: 'built' },
    ],
  },
]

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap(g => g.items)

export const NAV_COUNTS = {
  total: ALL_NAV_ITEMS.length,
  built: ALL_NAV_ITEMS.filter(i => i.status === 'built').length,
  planned: ALL_NAV_ITEMS.filter(i => i.status === 'planned').length,
}
