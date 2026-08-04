/**
 * Shared synthetic workspace graph so every nav surface talks about the same
 * people, tasks, packages, and destinations. Design prototype only — no PHI.
 */
import type { StatusTone } from '../ui'

export type RelatedLink = {
  to: string
  label: string
  detail?: string
}

export type WorkItemPriority = 'critical' | 'high' | 'medium' | 'low'
export type WorkItemStatus = 'open' | 'in-progress' | 'waiting' | 'escalated' | 'done'

export type WorkQueueItem = {
  id: string
  title: string
  detail: string
  patientId?: string
  owner: string
  due: string
  priority: WorkItemPriority
  status: WorkItemStatus
  domain: string
  /** Primary deep link into another nav surface */
  href: string
  related: RelatedLink[]
}

export type EpisodeRecord = {
  id: string
  patientId: string
  period: string
  certPeriod: number
  status: 'active' | 'pending-soc' | 'recert-due' | 'discharge-planned'
  socDate: string
  oasisHref: string
  ordersOpen: number
  claimStatus: string
  related: RelatedLink[]
}

export type OasisRecord = {
  id: string
  patientId: string
  type: 'SOC' | 'ROC' | 'Recert' | 'Discharge'
  window: string
  completion: number
  status: 'in-progress' | 'locked' | 'due-soon' | 'exported'
  blocking: string[]
  related: RelatedLink[]
}

export type MessageThread = {
  id: string
  subject: string
  participants: string[]
  patientId?: string
  preview: string
  when: string
  unread: boolean
  channel: 'clinical' | 'ops' | 'billing' | 'compliance'
  related: RelatedLink[]
}

export type FormCatalogItem = {
  id: string
  title: string
  semanticId: string
  owner: string
  version: string
  status: 'current' | 'draft' | 'retired'
  use: string
  related: RelatedLink[]
}

export type ControlledDocument = {
  id: string
  title: string
  patientId?: string
  kind: 'consent' | 'order-packet' | 'assessment' | 'disclosure' | 'education'
  status: 'draft' | 'pending-signature' | 'signed' | 'void'
  signer?: string
  pages: number
  related: RelatedLink[]
}

export type VendorBaa = {
  id: string
  vendor: string
  service: string
  baaStatus: 'active' | 'expiring' | 'expired' | 'missing'
  phiScope: string
  owner: string
  renewal: string
  related: RelatedLink[]
}

export type QapiPip = {
  id: string
  title: string
  owner: string
  baseline: string
  countermeasure: string
  returnDate: string
  status: 'active' | 'effectiveness-due' | 'sustained' | 'closed'
  related: RelatedLink[]
}

export type AuthzRecord = {
  id: string
  patientId: string
  payer: string
  units: string
  remaining: string
  status: 'active' | 'expiring' | 'exhausted' | 'pending'
  related: RelatedLink[]
}

export type PriorityMeta = { tone: StatusTone; label: string }

export const PRIORITY_META: Record<WorkItemPriority, PriorityMeta> = {
  critical: { tone: 'bad', label: 'Critical' },
  high: { tone: 'warn', label: 'High' },
  medium: { tone: 'progress', label: 'Medium' },
  low: { tone: 'neutral', label: 'Low' },
}

export const WORK_STATUS_META: Record<WorkItemStatus, PriorityMeta> = {
  open: { tone: 'neutral', label: 'Open' },
  'in-progress': { tone: 'progress', label: 'In progress' },
  waiting: { tone: 'warn', label: 'Waiting' },
  escalated: { tone: 'bad', label: 'Escalated' },
  done: { tone: 'good', label: 'Done' },
}

/** Closed-loop tasks that appear on Work queue and deep-link into other screens. */
export const WORK_QUEUE: WorkQueueItem[] = [
  {
    id: 'wq-1',
    title: 'SOC OASIS review',
    detail: '7 GG / med items need confirmation before lock and claim path.',
    patientId: 'pt-elena',
    owner: 'Taylor Brooks, RN',
    due: 'Today 4:00 PM',
    priority: 'high',
    status: 'in-progress',
    domain: 'EPI',
    href: '/oasis',
    related: [
      { to: '/patients/pt-elena', label: 'Chart' },
      { to: '/episodes', label: 'Episode' },
      { to: '/billing', label: 'Claim holds' },
      { to: '/legal-evidence', label: 'SOC evidence PKG-8821' },
    ],
  },
  {
    id: 'wq-2',
    title: 'Order countersignature',
    detail: 'CMS-485 and verbal diuretic change awaiting physician intent.',
    patientId: 'pt-walter',
    owner: 'Dr. Susan Cho',
    due: 'Today 5:30 PM',
    priority: 'high',
    status: 'waiting',
    domain: 'CLN',
    href: '/orders',
    related: [
      { to: '/patients/pt-walter', label: 'Chart' },
      { to: '/documents', label: 'Signature queue' },
      { to: '/legal-evidence', label: 'Order authority PKG-8844' },
    ],
  },
  {
    id: 'wq-3',
    title: 'Authorization unit check',
    detail: 'Managed-care units near exhaustion for PT visits.',
    patientId: 'pt-margaret',
    owner: 'Billing desk',
    due: 'Tomorrow',
    priority: 'medium',
    status: 'open',
    domain: 'RCM',
    href: '/authorizations',
    related: [
      { to: '/schedule', label: 'Schedule' },
      { to: '/billing', label: 'Claims' },
      { to: '/patients/pt-margaret', label: 'Chart' },
    ],
  },
  {
    id: 'wq-4',
    title: 'Aide supervision clock',
    detail: '14-day HHA supervisory visit window closing.',
    patientId: 'pt-elena',
    owner: 'Clinical manager',
    due: 'Wed',
    priority: 'medium',
    status: 'open',
    domain: 'HHA',
    href: '/aide-supervision',
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/schedule', label: 'Schedule' },
      { to: '/competency', label: 'Competency' },
    ],
  },
  {
    id: 'wq-5',
    title: 'Missed-visit follow-up',
    detail: 'Patient unreachable after missed SN visit — notify and reschedule.',
    patientId: 'pt-raymond',
    owner: 'Taylor Brooks, RN',
    due: 'Overdue',
    priority: 'critical',
    status: 'escalated',
    domain: 'FLD',
    href: '/field-visits',
    related: [
      { to: '/messages', label: 'Messages' },
      { to: '/schedule', label: 'Reschedule' },
      { to: '/qapi', label: 'Missed-visit PIP' },
    ],
  },
  {
    id: 'wq-6',
    title: 'Legal hold package review',
    detail: 'Counsel hold on fall incident package — no disposition.',
    patientId: 'pt-walter',
    owner: 'Compliance desk',
    due: 'Open',
    priority: 'high',
    status: 'waiting',
    domain: 'DOC',
    href: '/legal-evidence',
    related: [
      { to: '/qapi', label: 'QAPI incident' },
      { to: '/documents', label: 'Documents' },
      { to: '/security', label: 'Security posture' },
    ],
  },
]

export const EPISODES: EpisodeRecord[] = [
  {
    id: 'ep-elena',
    patientId: 'pt-elena',
    period: 'Jul 29 – Sep 26',
    certPeriod: 1,
    status: 'active',
    socDate: 'Jul 29',
    oasisHref: '/oasis',
    ordersOpen: 4,
    claimStatus: 'Holds · POC + OASIS',
    related: [
      { to: '/patients/pt-elena', label: 'Chart' },
      { to: '/oasis', label: 'OASIS SOC' },
      { to: '/orders', label: 'Orders' },
      { to: '/billing', label: 'Claims' },
      { to: '/legal-evidence', label: 'SOC package' },
    ],
  },
  {
    id: 'ep-walter',
    patientId: 'pt-walter',
    period: 'Jul 12 – Sep 9',
    certPeriod: 1,
    status: 'active',
    socDate: 'Jul 12',
    oasisHref: '/oasis',
    ordersOpen: 1,
    claimStatus: 'NOA submitted',
    related: [
      { to: '/patients/pt-walter', label: 'Chart' },
      { to: '/medications', label: 'Medications' },
      { to: '/legal-evidence', label: 'Incident hold' },
    ],
  },
  {
    id: 'ep-harold',
    patientId: 'pt-harold',
    period: 'Pending SOC',
    certPeriod: 1,
    status: 'pending-soc',
    socDate: 'Aug 4 (scheduled)',
    oasisHref: '/oasis',
    ordersOpen: 3,
    claimStatus: 'Not started',
    related: [
      { to: '/intake', label: 'Referral' },
      { to: '/schedule', label: 'SOC visit' },
      { to: '/authorizations', label: 'Auth' },
    ],
  },
  {
    id: 'ep-dorothy',
    patientId: 'pt-dorothy',
    period: 'Jun 12 – Aug 10',
    certPeriod: 2,
    status: 'recert-due',
    socDate: 'Jun 12',
    oasisHref: '/oasis',
    ordersOpen: 1,
    claimStatus: 'Final holds · recert POC',
    related: [
      { to: '/orders', label: 'Recert POC' },
      { to: '/oasis', label: 'Recert OASIS' },
      { to: '/billing', label: 'Final claim' },
    ],
  },
]

export const OASIS_RECORDS: OasisRecord[] = [
  {
    id: 'oas-elena-soc',
    patientId: 'pt-elena',
    type: 'SOC',
    window: 'Jul 29 – Aug 2',
    completion: 82,
    status: 'in-progress',
    blocking: ['GG0170 confirmation', 'Medication items', 'Lock not available'],
    related: [
      { to: '/patients/pt-elena', label: 'Chart' },
      { to: '/episodes', label: 'Episode' },
      { to: '/clinical', label: 'Clinical desk' },
      { to: '/cms-quality', label: 'QRP threshold' },
      { to: '/billing', label: 'Claim holds' },
    ],
  },
  {
    id: 'oas-dorothy-recert',
    patientId: 'pt-dorothy',
    type: 'Recert',
    window: 'Due Aug 6',
    completion: 0,
    status: 'due-soon',
    blocking: ['Visit not started', 'Prior period export check'],
    related: [
      { to: '/schedule', label: 'Recert visit' },
      { to: '/episodes', label: 'Episode' },
      { to: '/cms-quality', label: 'CMS quality' },
    ],
  },
  {
    id: 'oas-june-soc',
    patientId: 'pt-june',
    type: 'SOC',
    window: 'Jun 30 · locked',
    completion: 100,
    status: 'exported',
    blocking: [],
    related: [
      { to: '/data-exports', label: 'Vendor file' },
      { to: '/cms-quality', label: 'Submission log' },
    ],
  },
]

export const MESSAGE_THREADS: MessageThread[] = [
  {
    id: 'msg-1',
    subject: 'Elena gait progress',
    participants: ['Marcus Webb, PT', 'Taylor Brooks, RN'],
    patientId: 'pt-elena',
    preview: 'Elena did 20 ft with the walker today — big improvement.',
    when: 'Yesterday',
    unread: true,
    channel: 'clinical',
    related: [
      { to: '/patients/pt-elena', label: 'Chart' },
      { to: '/field-visits', label: 'PT visit' },
      { to: '/clinical', label: 'Clinical' },
    ],
  },
  {
    id: 'msg-2',
    subject: 'POC signature nudge',
    participants: ['Taylor Brooks, RN', 'Physician desk'],
    patientId: 'pt-elena',
    preview: 'CMS-485 still unsigned · claim path blocked.',
    when: 'Today 8:10 AM',
    unread: true,
    channel: 'ops',
    related: [
      { to: '/orders', label: 'Orders' },
      { to: '/documents', label: 'Signature queue' },
      { to: '/billing', label: 'Holds' },
    ],
  },
  {
    id: 'msg-3',
    subject: 'Missed visit · Raymond',
    participants: ['Scheduling', 'Taylor Brooks, RN'],
    patientId: 'pt-raymond',
    preview: 'No answer on two call attempts — escalate per policy?',
    when: 'Today 7:40 AM',
    unread: true,
    channel: 'ops',
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/work-queue', label: 'Work queue' },
      { to: '/qapi', label: 'Missed-visit PIP' },
    ],
  },
  {
    id: 'msg-4',
    subject: 'BAA renewal · Labs-R-Us',
    participants: ['Privacy officer', 'Vendor desk'],
    preview: 'BAA expires in 28 days — block new PHI until renewed.',
    when: 'Mon',
    unread: false,
    channel: 'compliance',
    related: [
      { to: '/vendors', label: 'Vendors & BAAs' },
      { to: '/security', label: 'Security' },
      { to: '/interoperability', label: 'Interfaces' },
    ],
  },
]

export const FORM_CATALOG: FormCatalogItem[] = [
  {
    id: 'frm-1',
    title: 'Service agreement & consents',
    semanticId: 'CL-FM-001',
    owner: 'Admissions',
    version: 'v4.2',
    status: 'current',
    use: 'SOC admission packet',
    related: [
      { to: '/documents', label: 'Documents' },
      { to: '/intake', label: 'Intake' },
      { to: '/legal-evidence', label: 'Evidence packages' },
    ],
  },
  {
    id: 'frm-2',
    title: 'CMS-485 plan of care',
    semanticId: 'CL-FM-029',
    owner: 'Clinical',
    version: 'v8.0',
    status: 'current',
    use: 'Physician orders / certification',
    related: [
      { to: '/orders', label: 'Orders' },
      { to: '/documents', label: 'Signature queue' },
      { to: '/episodes', label: 'Episodes' },
    ],
  },
  {
    id: 'frm-3',
    title: 'Home safety evaluation',
    semanticId: 'CL-FM-112',
    owner: 'Clinical',
    version: 'v2.1',
    status: 'current',
    use: 'SOC / ROC safety',
    related: [
      { to: '/clinical', label: 'Clinical' },
      { to: '/field-visits', label: 'Field visits' },
    ],
  },
  {
    id: 'frm-4',
    title: 'Beneficiary notice · HHABN',
    semanticId: 'BN-FM-003',
    owner: 'Revenue',
    version: 'v1.4',
    status: 'current',
    use: 'Non-covered services notice',
    related: [
      { to: '/beneficiary-notices', label: 'Notices' },
      { to: '/billing', label: 'Billing' },
    ],
  },
  {
    id: 'frm-5',
    title: 'Incident report',
    semanticId: 'QA-FM-014',
    owner: 'QAPI',
    version: 'v3.0',
    status: 'current',
    use: 'Risk event package',
    related: [
      { to: '/qapi', label: 'QAPI' },
      { to: '/legal-evidence', label: 'Legal evidence' },
    ],
  },
]

export const CONTROLLED_DOCUMENTS: ControlledDocument[] = [
  {
    id: 'cdoc-1',
    title: 'Plan of care · CMS-485',
    patientId: 'pt-elena',
    kind: 'order-packet',
    status: 'pending-signature',
    signer: 'Dr. Susan Cho',
    pages: 4,
    related: [
      { to: '/orders', label: 'Orders' },
      { to: '/patients/pt-elena', label: 'Chart' },
      { to: '/forms', label: 'Form CL-FM-029' },
      { to: '/billing', label: 'Claim holds' },
    ],
  },
  {
    id: 'cdoc-2',
    title: 'Service agreement & consents',
    patientId: 'pt-elena',
    kind: 'consent',
    status: 'signed',
    signer: 'Elena Martinez / representative',
    pages: 6,
    related: [
      { to: '/patients/pt-elena', label: 'Chart' },
      { to: '/forms', label: 'Forms library' },
      { to: '/legal-evidence', label: 'Evidence' },
    ],
  },
  {
    id: 'cdoc-3',
    title: 'Verbal order · diuretic change',
    patientId: 'pt-walter',
    kind: 'order-packet',
    status: 'pending-signature',
    signer: 'Dr. Susan Cho',
    pages: 2,
    related: [
      { to: '/orders', label: 'Orders' },
      { to: '/legal-evidence', label: 'PKG-8844' },
      { to: '/medications', label: 'Medications' },
    ],
  },
  {
    id: 'cdoc-4',
    title: 'Discharge teaching sheet',
    patientId: 'pt-harold',
    kind: 'education',
    status: 'draft',
    pages: 3,
    related: [
      { to: '/forms', label: 'Forms' },
      { to: '/legal-evidence', label: 'Discharge package' },
    ],
  },
]

export const VENDOR_BAAS: VendorBaa[] = [
  {
    id: 'vnd-1',
    vendor: 'WellSky (incumbent EHR)',
    service: 'Clinical / billing system of record',
    baaStatus: 'active',
    phiScope: 'Full clinical + claims',
    owner: 'IT + Compliance',
    renewal: 'Jan 2027',
    related: [
      { to: '/migration', label: 'Migration' },
      { to: '/interoperability', label: 'Interfaces' },
      { to: '/security', label: 'Security' },
    ],
  },
  {
    id: 'vnd-2',
    vendor: 'Labs-R-Us interface',
    service: 'Lab results inbound',
    baaStatus: 'expiring',
    phiScope: 'Lab results + identifiers',
    owner: 'Interoperability',
    renewal: '28 days',
    related: [
      { to: '/interoperability', label: 'Interfaces' },
      { to: '/messages', label: 'Compliance thread' },
      { to: '/security', label: 'Security' },
    ],
  },
  {
    id: 'vnd-3',
    vendor: 'Clearinghouse rail',
    service: '837I / 835 / eligibility',
    baaStatus: 'active',
    phiScope: 'Claims + eligibility',
    owner: 'Revenue cycle',
    renewal: 'Sep 2026',
    related: [
      { to: '/billing', label: 'Billing' },
      { to: '/authorizations', label: 'Auth' },
    ],
  },
  {
    id: 'vnd-4',
    vendor: 'Field telemetry pilot',
    service: 'GPS / EVV capture device',
    baaStatus: 'missing',
    phiScope: 'Location + visit events',
    owner: 'Field ops',
    renewal: 'Blocked',
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/security', label: 'Security' },
    ],
  },
]

export const QAPI_PIPS: QapiPip[] = [
  {
    id: 'pip-1',
    title: 'Hospitalization · HF cohort',
    owner: 'QAPI lead',
    baseline: '22.4%',
    countermeasure: 'After-hours pathway',
    returnDate: 'Sep 15',
    status: 'active',
    related: [
      { to: '/quality', label: 'Quality desk' },
      { to: '/cms-quality', label: 'CMS quality' },
      { to: '/reports', label: 'Reports' },
    ],
  },
  {
    id: 'pip-2',
    title: 'Fall events · SOC week',
    owner: 'DON',
    baseline: '6 events',
    countermeasure: 'Home safety kit',
    returnDate: 'Aug 30',
    status: 'effectiveness-due',
    related: [
      { to: '/legal-evidence', label: 'Incident packages' },
      { to: '/emergency', label: 'Emergency prep' },
      { to: '/competency', label: 'In-service' },
    ],
  },
  {
    id: 'pip-3',
    title: 'Missed-visit communication',
    owner: 'Ops director',
    baseline: '4.1%',
    countermeasure: 'Call-tree drill',
    returnDate: 'Closed',
    status: 'sustained',
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/messages', label: 'Messages' },
      { to: '/work-queue', label: 'Work queue' },
    ],
  },
]

export const AUTHORIZATIONS: AuthzRecord[] = [
  {
    id: 'authz-1',
    patientId: 'pt-margaret',
    payer: 'Managed care',
    units: 'PT 12 visits',
    remaining: '2 visits',
    status: 'expiring',
    related: [
      { to: '/schedule', label: 'Schedule' },
      { to: '/billing', label: 'Billing' },
      { to: '/work-queue', label: 'Work queue' },
    ],
  },
  {
    id: 'authz-2',
    patientId: 'pt-elena',
    payer: 'Medicare',
    units: 'PDGM period',
    remaining: 'Open',
    status: 'active',
    related: [
      { to: '/episodes', label: 'Episode' },
      { to: '/billing', label: 'Claims' },
    ],
  },
  {
    id: 'authz-3',
    patientId: 'pt-june',
    payer: 'Medi-Cal',
    units: 'SN 20 visits',
    remaining: '0 · pending reauth',
    status: 'exhausted',
    related: [
      { to: '/billing', label: 'Billing' },
      { to: '/beneficiary-notices', label: 'Notices' },
    ],
  },
]

/** Hub of primary related destinations for each built route (for RelatedNav). */
export const ROUTE_RELATED: Record<string, RelatedLink[]> = {
  '/today': [
    { to: '/work-queue', label: 'Work queue' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/clinical', label: 'Clinical' },
    { to: '/messages', label: 'Messages' },
  ],
  '/work-queue': [
    { to: '/today', label: 'Today' },
    { to: '/orders', label: 'Orders' },
    { to: '/oasis', label: 'OASIS' },
    { to: '/legal-evidence', label: 'Legal evidence' },
  ],
  '/patients': [
    { to: '/intake', label: 'Intake' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/episodes', label: 'Episodes' },
  ],
  '/intake': [
    { to: '/patients', label: 'Patients' },
    { to: '/schedule', label: 'Schedule SOC' },
    { to: '/authorizations', label: 'Auth' },
  ],
  '/schedule': [
    { to: '/field-visits', label: 'Field visits' },
    { to: '/work-queue', label: 'Work queue' },
    { to: '/patients', label: 'Patients' },
  ],
  '/messages': [
    { to: '/work-queue', label: 'Work queue' },
    { to: '/orders', label: 'Orders' },
    { to: '/vendors', label: 'Vendors' },
  ],
  '/clinical': [
    { to: '/orders', label: 'Orders' },
    { to: '/medications', label: 'Medications' },
    { to: '/oasis', label: 'OASIS' },
    { to: '/documents', label: 'Documents' },
  ],
  '/episodes': [
    { to: '/oasis', label: 'OASIS' },
    { to: '/orders', label: 'Orders' },
    { to: '/billing', label: 'Billing' },
  ],
  '/oasis': [
    { to: '/episodes', label: 'Episodes' },
    { to: '/cms-quality', label: 'CMS quality' },
    { to: '/billing', label: 'Claims' },
    { to: '/clinical', label: 'Clinical' },
  ],
  '/orders': [
    { to: '/documents', label: 'Signatures' },
    { to: '/medications', label: 'Medications' },
    { to: '/legal-evidence', label: 'Order packages' },
  ],
  '/medications': [
    { to: '/orders', label: 'Orders' },
    { to: '/clinical', label: 'Clinical' },
    { to: '/patients', label: 'Patients' },
  ],
  '/field-visits': [
    { to: '/schedule', label: 'Schedule' },
    { to: '/aide-supervision', label: 'Aide supervision' },
    { to: '/work-queue', label: 'Work queue' },
  ],
  '/aide-supervision': [
    { to: '/field-visits', label: 'Field visits' },
    { to: '/competency', label: 'Competency' },
    { to: '/schedule', label: 'Schedule' },
  ],
  '/billing': [
    { to: '/authorizations', label: 'Authorizations' },
    { to: '/orders', label: 'Orders' },
    { to: '/oasis', label: 'OASIS' },
    { to: '/beneficiary-notices', label: 'Notices' },
  ],
  '/authorizations': [
    { to: '/billing', label: 'Billing' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/work-queue', label: 'Work queue' },
  ],
  '/beneficiary-notices': [
    { to: '/billing', label: 'Billing' },
    { to: '/forms', label: 'Forms' },
    { to: '/documents', label: 'Documents' },
  ],
  '/quality': [
    { to: '/qapi', label: 'QAPI programme' },
    { to: '/cms-quality', label: 'CMS quality' },
    { to: '/legal-evidence', label: 'Evidence' },
  ],
  '/qapi': [
    { to: '/quality', label: 'Quality' },
    { to: '/legal-evidence', label: 'Incident packages' },
    { to: '/competency', label: 'Competency' },
  ],
  '/cms-quality': [
    { to: '/oasis', label: 'OASIS' },
    { to: '/data-exports', label: 'Exports' },
    { to: '/qapi', label: 'QAPI' },
  ],
  '/competency': [
    { to: '/aide-supervision', label: 'Aide supervision' },
    { to: '/qapi', label: 'QAPI' },
    { to: '/emergency', label: 'Emergency prep' },
  ],
  '/emergency': [
    { to: '/qapi', label: 'QAPI' },
    { to: '/patients', label: 'Patients' },
    { to: '/security', label: 'Security' },
  ],
  '/documents': [
    { to: '/forms', label: 'Forms library' },
    { to: '/orders', label: 'Orders' },
    { to: '/legal-evidence', label: 'Legal evidence' },
  ],
  '/forms': [
    { to: '/documents', label: 'Documents' },
    { to: '/legal-evidence', label: 'Evidence' },
    { to: '/beneficiary-notices', label: 'Notices' },
  ],
  '/legal-evidence': [
    { to: '/documents', label: 'Documents' },
    { to: '/qapi', label: 'QAPI' },
    { to: '/orders', label: 'Orders' },
    { to: '/requirements', label: 'DOC-005' },
  ],
  '/reports': [
    { to: '/data-exports', label: 'Exports' },
    { to: '/qapi', label: 'QAPI' },
    { to: '/cms-quality', label: 'CMS quality' },
  ],
  '/data-exports': [
    { to: '/reports', label: 'Reports' },
    { to: '/cms-quality', label: 'CMS quality' },
    { to: '/legal-evidence', label: 'Evidence export' },
  ],
  '/users-access': [
    { to: '/org-master', label: 'Org master' },
    { to: '/security', label: 'Security' },
    { to: '/traceability', label: 'Traceability' },
  ],
  '/org-master': [
    { to: '/users-access', label: 'Users & access' },
    { to: '/vendors', label: 'Vendors' },
    { to: '/requirements', label: 'Requirements' },
  ],
  '/interoperability': [
    { to: '/vendors', label: 'Vendors' },
    { to: '/migration', label: 'Migration' },
    { to: '/data-exports', label: 'Exports' },
  ],
  '/ai-governance': [
    { to: '/clinical', label: 'Clinical' },
    { to: '/security', label: 'Security' },
    { to: '/traceability', label: 'Traceability' },
  ],
  '/security': [
    { to: '/users-access', label: 'Users & access' },
    { to: '/vendors', label: 'Vendors' },
    { to: '/legal-evidence', label: 'Legal holds' },
  ],
  '/vendors': [
    { to: '/interoperability', label: 'Interoperability' },
    { to: '/security', label: 'Security' },
    { to: '/migration', label: 'Migration' },
  ],
  '/migration': [
    { to: '/vendors', label: 'Vendors' },
    { to: '/interoperability', label: 'Interfaces' },
    { to: '/data-exports', label: 'Exports' },
  ],
  '/traceability': [
    { to: '/requirements', label: 'Requirements' },
    { to: '/ai-governance', label: 'AI governance' },
    { to: '/legal-evidence', label: 'Evidence' },
  ],
}

/* ──────────────────────────────────────────────────────────────────────────
 * Domain sample sets for platform / governance redesigns (DAT · IAM · GOV ·
 * FHR · AIG · SEC · MIG · TRC). Appended only — do not reorder existing exports.
 * ────────────────────────────────────────────────────────────────────────── */

export type DataExportStatus = 'current' | 'stale' | 'failed' | 'running'
export type DataExportPhi = 'de-identified' | 'limited-phi' | 'aggregate' | 'full-phi-gated'
export type DataExportRecord = {
  id: string
  dataset: string
  consumer: string
  lastRefresh: string
  lineage: string
  phiBoundary: DataExportPhi
  status: DataExportStatus
  owner: string
  schedule: string
  rowCount: string
  purpose: string
  related: RelatedLink[]
  reqIds: string[]
}

export const DATA_EXPORTS: DataExportRecord[] = [
  {
    id: 'DEX-101',
    dataset: 'Visit productivity',
    consumer: 'Ops dashboard',
    lastRefresh: 'Today · 06:10',
    lineage: 'FHIR Encounter → warehouse fact',
    phiBoundary: 'de-identified',
    status: 'current',
    owner: 'Analytics desk',
    schedule: 'Nightly 05:30 PT',
    rowCount: '42.1k visits · 90d',
    purpose: 'Field capacity and productivity without chart-level PHI.',
    related: [
      { to: '/reports', label: 'Reports' },
      { to: '/field-visits', label: 'Field visits' },
    ],
    reqIds: ['DAT-001', 'DAT-003'],
  },
  {
    id: 'DEX-118',
    dataset: 'Claim readiness',
    consumer: 'Revenue desk',
    lastRefresh: 'Stale · 18h',
    lineage: 'Domain services → billing staging',
    phiBoundary: 'limited-phi',
    status: 'stale',
    owner: 'Revenue integrity',
    schedule: 'Hourly (paused overnight)',
    rowCount: '312 open claims',
    purpose: 'Pre-submission readiness with MRN-level linkage under limited PHI rules.',
    related: [
      { to: '/billing', label: 'Billing' },
      { to: '/authorizations', label: 'Authorizations' },
    ],
    reqIds: ['DAT-002', 'BIL-001'],
  },
  {
    id: 'DEX-130',
    dataset: 'Quality measures',
    consumer: 'QAPI programme',
    lastRefresh: 'Yesterday · 22:00',
    lineage: 'OASIS + claims aggregate',
    phiBoundary: 'aggregate',
    status: 'current',
    owner: 'QAPI desk',
    schedule: 'Daily 22:00 PT',
    rowCount: '14 measure cells',
    purpose: 'Aggregate quality cells for PIP selection — not patient-level export.',
    related: [
      { to: '/qapi', label: 'QAPI' },
      { to: '/cms-quality', label: 'CMS quality' },
    ],
    reqIds: ['DAT-004', 'QAP-001'],
  },
  {
    id: 'DEX-141',
    dataset: 'Legal evidence export job',
    consumer: 'HIM / counsel',
    lastRefresh: 'Jul 31 · 09:12',
    lineage: 'DOC packages → dual-format packet',
    phiBoundary: 'full-phi-gated',
    status: 'current',
    owner: 'HIM desk',
    schedule: 'On demand · dual-control',
    rowCount: '2 sealed packages',
    purpose: 'Human-readable + machine-readable legal packets with hash verify.',
    related: [
      { to: '/legal-evidence', label: 'Legal evidence' },
      { to: '/documents', label: 'Documents' },
    ],
    reqIds: ['DOC-005', 'DAT-005'],
  },
  {
    id: 'DEX-155',
    dataset: 'iQIES quality extract',
    consumer: 'CMS quality desk',
    lastRefresh: 'Failed · retry queued',
    lineage: 'OASIS lock store → iQIES staging',
    phiBoundary: 'limited-phi',
    status: 'failed',
    owner: 'Quality ops',
    schedule: 'Weekly Monday 02:00 PT',
    rowCount: '— failed before count',
    purpose: 'CMS quality extract rehearsal; failure is labeled and does not silent-retry forever.',
    related: [
      { to: '/cms-quality', label: 'CMS quality' },
      { to: '/oasis', label: 'OASIS' },
    ],
    reqIds: ['DAT-006', 'CMS-002'],
  },
  {
    id: 'DEX-162',
    dataset: 'Staff roster de-id',
    consumer: 'Workforce planning',
    lastRefresh: 'Running · 12%',
    lineage: 'IAM directory → analytics sandbox',
    phiBoundary: 'de-identified',
    status: 'running',
    owner: 'People ops',
    schedule: 'Weekly Sunday',
    rowCount: 'In progress',
    purpose: 'Capacity planning without direct identifiers.',
    related: [
      { to: '/users-access', label: 'Users & access' },
      { to: '/reports', label: 'Reports' },
    ],
    reqIds: ['DAT-007', 'IAM-002'],
  },
]

export type AccessPrincipalKind = 'workforce' | 'service' | 'contractor'
export type AccessAccountStatus = 'active' | 'disabled' | 'pending-invite' | 'review-due'
export type AccessPrincipal = {
  id: string
  name: string
  kind: AccessPrincipalKind
  role: string
  lastAccess: string
  mfa: 'on' | 'off' | 'n/a'
  review: string
  status: AccessAccountStatus
  owner: string
  scopes: string[]
  breakGlass?: string
  related: RelatedLink[]
  reqIds: string[]
}

export const ACCESS_PRINCIPALS: AccessPrincipal[] = [
  {
    id: 'USR-2201',
    name: 'Taylor Brooks, RN',
    kind: 'workforce',
    role: 'RN · case manager',
    lastAccess: 'Today · 11:40',
    mfa: 'on',
    review: 'Current · next Nov',
    status: 'active',
    owner: 'Clinical manager',
    scopes: ['chart:read', 'note:write', 'order:request', 'export:none'],
    related: [
      { to: '/clinical', label: 'Clinical' },
      { to: '/security', label: 'Security' },
    ],
    reqIds: ['IAM-001', 'IAM-003'],
  },
  {
    id: 'USR-2214',
    name: 'Marcus Webb, PT',
    kind: 'workforce',
    role: 'Physical therapist',
    lastAccess: 'Yesterday · 16:05',
    mfa: 'on',
    review: 'Due Sep',
    status: 'review-due',
    owner: 'Therapy lead',
    scopes: ['chart:read', 'visit:write', 'export:none'],
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/security', label: 'Security' },
    ],
    reqIds: ['IAM-001', 'IAM-005'],
  },
  {
    id: 'SVC-004',
    name: 'Billing bot',
    kind: 'service',
    role: 'Service account · claims staging',
    lastAccess: 'Today · 06:02',
    mfa: 'n/a',
    review: 'Owner: Finance',
    status: 'active',
    owner: 'Revenue integrity',
    scopes: ['claim:read', 'claim:stage', 'export:limited'],
    related: [
      { to: '/billing', label: 'Billing' },
      { to: '/data-exports', label: 'Exports' },
    ],
    reqIds: ['IAM-002', 'IAM-006'],
  },
  {
    id: 'USR-1988',
    name: 'Temp contractor',
    kind: 'contractor',
    role: 'Read-only QA',
    lastAccess: 'Jul 2 · 10:11',
    mfa: 'on',
    review: 'Expired',
    status: 'disabled',
    owner: 'QA desk',
    scopes: ['chart:read-deid'],
    related: [
      { to: '/qapi', label: 'QAPI' },
      { to: '/traceability', label: 'Traceability' },
    ],
    reqIds: ['IAM-004', 'IAM-005'],
  },
  {
    id: 'USR-2300',
    name: 'Jordan Lee',
    kind: 'workforce',
    role: 'Privacy officer',
    lastAccess: 'Today · 08:15',
    mfa: 'on',
    review: 'Current',
    status: 'active',
    owner: 'Compliance',
    scopes: ['audit:read', 'hold:request', 'export:gated'],
    breakGlass: 'Used once in last 30d · reviewed',
    related: [
      { to: '/legal-evidence', label: 'Legal holds' },
      { to: '/security', label: 'Security' },
    ],
    reqIds: ['IAM-004', 'SEC-006'],
  },
  {
    id: 'USR-2311',
    name: 'Alex Chen',
    kind: 'workforce',
    role: 'HIM specialist',
    lastAccess: 'Pending first login',
    mfa: 'off',
    review: 'Invite open 4d',
    status: 'pending-invite',
    owner: 'HIM desk',
    scopes: ['roi:prepare', 'doc:read'],
    related: [
      { to: '/documents', label: 'Documents' },
      { to: '/legal-evidence', label: 'Evidence' },
    ],
    reqIds: ['IAM-001', 'DOC-005'],
  },
]

export type OrgConfigStatus = 'active' | 'approved' | 'in-review' | 'draft' | 'scheduled'
export type OrgConfigRecord = {
  id: string
  configSet: string
  owner: string
  effective: string
  version: string
  change: string
  status: OrgConfigStatus
  summary: string
  legalEntity: string
  branch: string
  related: RelatedLink[]
  reqIds: string[]
}

export const ORG_CONFIGS: OrgConfigRecord[] = [
  {
    id: 'GOV-040',
    configSet: 'Service area',
    owner: 'Administrator',
    effective: 'Aug 1 · 00:00 PT',
    version: 'v4',
    change: 'ZIP expansion · South Bay',
    status: 'approved',
    summary: 'Adds ZIP clusters for scheduled SOC capacity without changing legal entity.',
    legalEntity: 'Care Indeed Home Health Care, Inc.',
    branch: 'Campbell',
    related: [
      { to: '/schedule', label: 'Schedule' },
      { to: '/intake', label: 'Intake' },
    ],
    reqIds: ['GOV-001', 'GOV-003'],
  },
  {
    id: 'GOV-041',
    configSet: 'Payer contracts',
    owner: 'Finance',
    effective: 'Pending approval',
    version: 'v7-draft',
    change: 'New Medicare Advantage plan',
    status: 'in-review',
    summary: 'Draft MA contract terms; no claims routing until dual approval and effective date.',
    legalEntity: 'Care Indeed Home Health Care, Inc.',
    branch: 'Campbell',
    related: [
      { to: '/billing', label: 'Billing' },
      { to: '/authorizations', label: 'Authorizations' },
    ],
    reqIds: ['GOV-002', 'BIL-003'],
  },
  {
    id: 'GOV-038',
    configSet: 'Discipline matrix',
    owner: 'DON',
    effective: 'Jul 15 · 00:00 PT',
    version: 'v3',
    change: 'OT capacity slots',
    status: 'active',
    summary: 'Effective-dated OT availability used by scheduling suggestions only.',
    legalEntity: 'Care Indeed Home Health Care, Inc.',
    branch: 'Campbell',
    related: [
      { to: '/schedule', label: 'Schedule' },
      { to: '/competency', label: 'Competency' },
    ],
    reqIds: ['GOV-001', 'SCH-002'],
  },
  {
    id: 'GOV-042',
    configSet: 'Branch hours',
    owner: 'Operations',
    effective: 'Sep 1 · scheduled',
    version: 'v2-scheduled',
    change: 'Saturday intake window',
    status: 'scheduled',
    summary: 'Future-effective hours; does not alter after-hours clinical escalation paths yet.',
    legalEntity: 'Care Indeed Home Health Care, Inc.',
    branch: 'Campbell',
    related: [
      { to: '/intake', label: 'Intake' },
      { to: '/emergency', label: 'Emergency prep' },
    ],
    reqIds: ['GOV-003'],
  },
  {
    id: 'GOV-043',
    configSet: 'Document retention classes',
    owner: 'Compliance',
    effective: 'Draft only',
    version: 'v1-draft',
    change: 'Align DOC retention labels',
    status: 'draft',
    summary: 'Proposed retention class labels for legal evidence — not production WORM policy.',
    legalEntity: 'Care Indeed Home Health Care, Inc.',
    branch: 'All branches',
    related: [
      { to: '/legal-evidence', label: 'Legal evidence' },
      { to: '/documents', label: 'Documents' },
    ],
    reqIds: ['GOV-004', 'DOC-005'],
  },
]

export type AdapterDirection = 'inbound' | 'outbound' | 'bidirectional'
export type AdapterHealth = 'healthy' | 'attention' | 'down' | 'shadow'
export type InterfaceAdapter = {
  id: string
  name: string
  direction: AdapterDirection
  transport: string
  owner: string
  lastTest: string
  testResult: 'pass' | 'fail' | 'skip'
  status: AdapterHealth
  vendor?: string
  events24h: string
  contract: string
  purpose: string
  related: RelatedLink[]
  reqIds: string[]
}

export const INTERFACE_ADAPTERS: InterfaceAdapter[] = [
  {
    id: 'FHR-01',
    name: 'Hospital ADT',
    direction: 'inbound',
    transport: 'HL7 v2 · MLLP',
    owner: 'Integration',
    lastTest: 'Today · pass',
    testResult: 'pass',
    status: 'healthy',
    vendor: 'Regional health system',
    events24h: '184',
    contract: 'ADT^A01/A02/A03 · patient match',
    purpose: 'Ingest admissions and transfers for intake triage; never auto-creates SOC.',
    related: [
      { to: '/intake', label: 'Intake' },
      { to: '/vendors', label: 'Vendors' },
    ],
    reqIds: ['FHR-001', 'INT-002'],
  },
  {
    id: 'FHR-04',
    name: 'Lab results',
    direction: 'inbound',
    transport: 'FHIR R4 · Observation',
    owner: 'Integration',
    lastTest: 'Today · pass',
    testResult: 'pass',
    status: 'healthy',
    vendor: 'Reference lab',
    events24h: '62',
    contract: 'Observation · DiagnosticReport',
    purpose: 'Display lab results in chart context with source attribution.',
    related: [
      { to: '/clinical', label: 'Clinical' },
      { to: '/vendors', label: 'Vendors' },
    ],
    reqIds: ['FHR-002'],
  },
  {
    id: 'FHR-07',
    name: 'EVV aggregator',
    direction: 'outbound',
    transport: 'Alternate EVV API',
    owner: 'Ops',
    lastTest: 'Yesterday · fail',
    testResult: 'fail',
    status: 'attention',
    vendor: 'State EVV aggregator',
    events24h: '9 failed · 0 ok',
    contract: 'Visit complete · geo optional',
    purpose: 'Outbound EVV punches. Failures are visible and queued — not silently dropped.',
    related: [
      { to: '/field-visits', label: 'Field visits' },
      { to: '/vendors', label: 'Vendors' },
      { to: '/security', label: 'Security' },
    ],
    reqIds: ['FHR-003', 'FLD-004'],
  },
  {
    id: 'FHR-09',
    name: 'Accounting export',
    direction: 'outbound',
    transport: 'SFTP · CSV',
    owner: 'Finance',
    lastTest: 'Jul 30 · pass',
    testResult: 'pass',
    status: 'healthy',
    vendor: 'ERP GL',
    events24h: '1 batch',
    contract: 'Daily AR summary · no clinical notes',
    purpose: 'Finance export under limited PHI boundary.',
    related: [
      { to: '/billing', label: 'Billing' },
      { to: '/data-exports', label: 'Exports' },
    ],
    reqIds: ['FHR-004', 'DAT-002'],
  },
  {
    id: 'FHR-12',
    name: 'eCign signature rail',
    direction: 'bidirectional',
    transport: 'Vendor API · webhook',
    owner: 'Documents',
    lastTest: 'Shadow · skip',
    testResult: 'skip',
    status: 'shadow',
    vendor: 'eCign',
    events24h: '0 (shadow)',
    contract: 'Signature request + receipt',
    purpose: 'External signature authority remains external until DOC gates authorize production.',
    related: [
      { to: '/documents', label: 'Documents' },
      { to: '/legal-evidence', label: 'Legal evidence' },
      { to: '/vendors', label: 'Vendors' },
    ],
    reqIds: ['FHR-005', 'DOC-003'],
  },
  {
    id: 'FHR-15',
    name: 'Patient Access API',
    direction: 'outbound',
    transport: 'FHIR R4 · SMART',
    owner: 'Interop',
    lastTest: 'Down · cert expired',
    testResult: 'fail',
    status: 'down',
    vendor: 'Internal gateway',
    events24h: '0',
    contract: 'Patient/$everything subset',
    purpose: 'Patient access prototype surface — certificate rotation pending security.',
    related: [
      { to: '/security', label: 'Security' },
      { to: '/patients', label: 'Patients' },
    ],
    reqIds: ['FHR-006', 'SEC-004'],
  },
]

export type AiCapabilityState = 'approved' | 'evaluation' | 'prohibited' | 'paused'
export type AiCapability = {
  id: string
  name: string
  intendedUse: string
  humanGate: string
  evalStatus: string
  killSwitch: 'armed' | 'tripped' | 'n/a'
  state: AiCapabilityState
  owner: string
  overrides7d: number
  purpose: string
  related: RelatedLink[]
  reqIds: string[]
}

export const AI_CAPABILITIES: AiCapability[] = [
  {
    id: 'AIG-01',
    name: 'Brad draft assist',
    intendedUse: 'Visit note draft suggestions',
    humanGate: 'Required · clinician must accept',
    evalStatus: 'Live monitor',
    killSwitch: 'armed',
    state: 'approved',
    owner: 'Clinical informatics',
    overrides7d: 18,
    purpose: 'Assistive drafting only. Never seals notes or signs orders.',
    related: [
      { to: '/clinical', label: 'Clinical' },
      { to: '/field-visits', label: 'Field visits' },
    ],
    reqIds: ['AIG-001', 'AIG-003'],
  },
  {
    id: 'AIG-02',
    name: 'Med list extract',
    intendedUse: 'Proposal-only medication list',
    humanGate: 'Required · pharmacist/RN confirm',
    evalStatus: 'Shadow mode',
    killSwitch: 'armed',
    state: 'evaluation',
    owner: 'Pharmacy liaison',
    overrides7d: 5,
    purpose: 'Shadow proposals compared to human lists; no chart write in evaluation.',
    related: [
      { to: '/medications', label: 'Medications' },
      { to: '/security', label: 'Security' },
    ],
    reqIds: ['AIG-002', 'MED-001'],
  },
  {
    id: 'AIG-03',
    name: 'OASIS suggestion',
    intendedUse: 'Not authorized',
    humanGate: 'Hard deny',
    evalStatus: 'Blocked',
    killSwitch: 'n/a',
    state: 'prohibited',
    owner: 'Compliance',
    overrides7d: 0,
    purpose: 'Auto-suggesting OASIS responses is prohibited until AIG + OAS gates open.',
    related: [
      { to: '/oasis', label: 'OASIS' },
      { to: '/traceability', label: 'Traceability' },
    ],
    reqIds: ['AIG-004', 'OAS-001'],
  },
  {
    id: 'AIG-04',
    name: 'Schedule optimizer',
    intendedUse: 'Route suggestions for ops',
    humanGate: 'Required · scheduler confirms',
    evalStatus: 'Live monitor',
    killSwitch: 'armed',
    state: 'approved',
    owner: 'Scheduling lead',
    overrides7d: 9,
    purpose: 'Suggests routing; never auto-books visits or changes patient preference without human.',
    related: [
      { to: '/schedule', label: 'Schedule' },
      { to: '/field-visits', label: 'Field visits' },
    ],
    reqIds: ['AIG-001', 'SCH-003'],
  },
  {
    id: 'AIG-05',
    name: 'Claim denial narrative',
    intendedUse: 'Draft appeal language',
    humanGate: 'Required · biller edits',
    evalStatus: 'Paused for eval refresh',
    killSwitch: 'tripped',
    state: 'paused',
    owner: 'Revenue integrity',
    overrides7d: 0,
    purpose: 'Kill switch tripped during model refresh — no narratives generated until re-arm.',
    related: [
      { to: '/billing', label: 'Billing' },
      { to: '/security', label: 'Security' },
    ],
    reqIds: ['AIG-003', 'BIL-004'],
  },
]

export type SecControlStatus = 'met' | 'at-risk' | 'improving' | 'gap' | 'not-tested'
export type SecControl = {
  id: string
  control: string
  target: string
  lastProof: string
  owner: string
  gap: string
  status: SecControlStatus
  category: 'resilience' | 'access' | 'a11y' | 'privacy' | 'observability'
  purpose: string
  related: RelatedLink[]
  reqIds: string[]
}

export const SEC_CONTROLS: SecControl[] = [
  {
    id: 'SEC-11',
    control: 'Backup restore drill',
    target: '≤4h RTO',
    lastProof: 'Jun tabletop',
    owner: 'Platform',
    gap: 'None · live restore still due',
    status: 'met',
    category: 'resilience',
    purpose: 'Demonstrate restore path for EHR config and synthetic chart stores.',
    related: [
      { to: '/migration', label: 'Migration' },
      { to: '/org-master', label: 'Org master' },
    ],
    reqIds: ['SEC-001', 'SEC-002'],
  },
  {
    id: 'SEC-14',
    control: 'Access review',
    target: 'Quarterly',
    lastProof: 'Due soon',
    owner: 'Security',
    gap: '5 users past window',
    status: 'at-risk',
    category: 'access',
    purpose: 'Least-privilege recertification for workforce and service accounts.',
    related: [
      { to: '/users-access', label: 'Users & access' },
      { to: '/traceability', label: 'Traceability' },
    ],
    reqIds: ['SEC-003', 'IAM-005'],
  },
  {
    id: 'SEC-18',
    control: 'WCAG 2.2 AA',
    target: 'AA',
    lastProof: 'In progress audit',
    owner: 'Product',
    gap: 'Focus ring fixed · contrast residual',
    status: 'improving',
    category: 'a11y',
    purpose: 'Accessibility posture for clinical and ops surfaces.',
    related: [
      { to: '/requirements', label: 'Requirements' },
    ],
    reqIds: ['SEC-005', 'UX-002'],
  },
  {
    id: 'SEC-20',
    control: 'Legal hold enforcement',
    target: 'Disposition blocked',
    lastProof: 'Synthetic package sample',
    owner: 'Privacy',
    gap: 'WORM not production',
    status: 'gap',
    category: 'privacy',
    purpose: 'Holds must block destructive overwrite; prototype shows labels only.',
    related: [
      { to: '/legal-evidence', label: 'Legal evidence' },
      { to: '/documents', label: 'Documents' },
    ],
    reqIds: ['SEC-006', 'DOC-005'],
  },
  {
    id: 'SEC-22',
    control: 'Audit log completeness',
    target: '100% privileged actions',
    lastProof: 'Not tested end-to-end',
    owner: 'Platform',
    gap: 'Export path unproven',
    status: 'not-tested',
    category: 'observability',
    purpose: 'Privileged IAM and export actions must leave immutable audit trails.',
    related: [
      { to: '/users-access', label: 'Users & access' },
      { to: '/data-exports', label: 'Exports' },
    ],
    reqIds: ['SEC-004', 'IAM-004'],
  },
  {
    id: 'SEC-25',
    control: 'Vendor BAA gate',
    target: 'No PHI without active BAA',
    lastProof: 'Register review',
    owner: 'Compliance',
    gap: '1 missing BAA vendor',
    status: 'at-risk',
    category: 'privacy',
    purpose: 'Interfaces and credentials stay dark when BAA is missing or expired.',
    related: [
      { to: '/vendors', label: 'Vendors' },
      { to: '/interoperability', label: 'Interoperability' },
    ],
    reqIds: ['SEC-007', 'TPR-001'],
  },
]

export type MigStreamStatus = 'open' | 'draft' | 'scheduled' | 'blocked' | 'complete'
export type MigRisk = 'high' | 'medium' | 'low'
export type MigrationStream = {
  id: string
  workstream: string
  owner: string
  evidence: string
  risk: MigRisk
  nextGate: string
  status: MigStreamStatus
  progress: number
  purpose: string
  related: RelatedLink[]
  reqIds: string[]
}

export const MIGRATION_STREAMS: MigrationStream[] = [
  {
    id: 'MIG-01',
    workstream: 'WellSky export inventory',
    owner: 'Migration lead',
    evidence: 'Partial sample extracts',
    risk: 'high',
    nextGate: 'Contract analysis',
    status: 'open',
    progress: 35,
    purpose: 'Catalog exportable domains and fidelity gaps before any pilot cutover.',
    related: [
      { to: '/data-exports', label: 'Exports' },
      { to: '/vendors', label: 'Vendors' },
    ],
    reqIds: ['MIG-001', 'MIG-002'],
  },
  {
    id: 'MIG-02',
    workstream: 'Identity mapping',
    owner: 'IAM',
    evidence: 'Draft principal map',
    risk: 'medium',
    nextGate: 'Pilot criteria',
    status: 'draft',
    progress: 48,
    purpose: 'Map legacy users and service accounts to least-privilege roles.',
    related: [
      { to: '/users-access', label: 'Users & access' },
      { to: '/security', label: 'Security' },
    ],
    reqIds: ['MIG-003', 'IAM-001'],
  },
  {
    id: 'MIG-03',
    workstream: 'Rollback drill',
    owner: 'Platform',
    evidence: 'Tabletop notes only',
    risk: 'medium',
    nextGate: 'Live drill',
    status: 'scheduled',
    progress: 60,
    purpose: 'Rehearse rollback without patient impact; live drill not yet authorized.',
    related: [
      { to: '/security', label: 'Security' },
      { to: '/org-master', label: 'Org master' },
    ],
    reqIds: ['MIG-004', 'SEC-002'],
  },
  {
    id: 'MIG-04',
    workstream: 'Clinical chart cutover',
    owner: 'Clinical ops',
    evidence: 'None · blocked',
    risk: 'high',
    nextGate: 'Build authorization',
    status: 'blocked',
    progress: 10,
    purpose: 'No live chart cutover until requirements, prototypes, and evidence gates clear.',
    related: [
      { to: '/clinical', label: 'Clinical' },
      { to: '/requirements', label: 'Requirements' },
      { to: '/traceability', label: 'Traceability' },
    ],
    reqIds: ['MIG-005', 'TRC-001'],
  },
  {
    id: 'MIG-05',
    workstream: 'Forms catalog migration',
    owner: 'Forms lead',
    evidence: 'Semantic ID mapping sample',
    risk: 'low',
    nextGate: 'Field schema freeze',
    status: 'open',
    progress: 55,
    purpose: 'Map form semantic IDs; no production form seal in this prototype.',
    related: [
      { to: '/forms', label: 'Forms' },
      { to: '/documents', label: 'Documents' },
    ],
    reqIds: ['MIG-006', 'FRM-001'],
  },
  {
    id: 'MIG-06',
    workstream: 'Interface dual-run',
    owner: 'Integration',
    evidence: 'Shadow ADT compare',
    risk: 'medium',
    nextGate: 'Partner sign-off',
    status: 'draft',
    progress: 40,
    purpose: 'Dual-run hospital ADT against legacy without writing clinical authority.',
    related: [
      { to: '/interoperability', label: 'Interoperability' },
      { to: '/intake', label: 'Intake' },
    ],
    reqIds: ['MIG-007', 'FHR-001'],
  },
]

export type TraceObjectStatus = 'baseline' | 'in-review' | 'in-prototype' | 'gate-open' | 'blocked'
export type TraceObject = {
  id: string
  objectType: string
  count: string
  owner: string
  versioned: string
  gaps: string
  status: TraceObjectStatus
  coverage: number
  purpose: string
  related: RelatedLink[]
  reqIds: string[]
}

export const TRACE_OBJECTS: TraceObject[] = [
  {
    id: 'TRC-REQ',
    objectType: 'Requirements',
    count: '170 shalls',
    owner: 'Product',
    versioned: 'Yes · register',
    gaps: '0 collisions claimed',
    status: 'baseline',
    coverage: 100,
    purpose: 'Canonical shall-statements that authorize build only after gates.',
    related: [
      { to: '/requirements', label: 'Requirements' },
    ],
    reqIds: ['TRC-001'],
  },
  {
    id: 'TRC-WF',
    objectType: 'Workflows',
    count: '166 IDs',
    owner: 'Clinical ops',
    versioned: 'Partial',
    gaps: 'Step depth incomplete',
    status: 'in-review',
    coverage: 62,
    purpose: 'Workflow IDs link screens to operational procedures.',
    related: [
      { to: '/clinical', label: 'Clinical' },
      { to: '/work-queue', label: 'Work queue' },
    ],
    reqIds: ['TRC-002'],
  },
  {
    id: 'TRC-UI',
    objectType: 'UI routes',
    count: '104 targets',
    owner: 'UX',
    versioned: 'Yes',
    gaps: 'Many planned pageviews',
    status: 'in-prototype',
    coverage: 78,
    purpose: 'Route inventory for nav redesign and design-system coverage.',
    related: [
      { to: '/requirements', label: 'Requirements' },
      { to: '/ai-governance', label: 'AI governance' },
    ],
    reqIds: ['TRC-003'],
  },
  {
    id: 'TRC-FRM',
    objectType: 'Forms',
    count: '349 sources',
    owner: 'Forms lead',
    versioned: 'Yes',
    gaps: 'Field schemas open',
    status: 'gate-open',
    coverage: 54,
    purpose: 'Form semantic IDs must stay unique before development of e-sign flows.',
    related: [
      { to: '/forms', label: 'Forms' },
      { to: '/documents', label: 'Documents' },
    ],
    reqIds: ['TRC-004', 'FRM-001'],
  },
  {
    id: 'TRC-DOC',
    objectType: 'Legal packages',
    count: '6 samples',
    owner: 'Compliance',
    versioned: 'Yes · DOC-005',
    gaps: 'WORM not production',
    status: 'in-prototype',
    coverage: 70,
    purpose: 'Evidence packages link requirements to export and hold posture.',
    related: [
      { to: '/legal-evidence', label: 'Legal evidence' },
      { to: '/documents', label: 'Documents' },
    ],
    reqIds: ['TRC-005', 'DOC-005'],
  },
  {
    id: 'TRC-INT',
    objectType: 'Interfaces',
    count: '11 adapters',
    owner: 'Integration',
    versioned: 'Yes',
    gaps: 'Contract tests incomplete',
    status: 'blocked',
    coverage: 41,
    purpose: 'Adapters cannot go production without BAA, contract tests, and SEC gates.',
    related: [
      { to: '/interoperability', label: 'Interoperability' },
      { to: '/vendors', label: 'Vendors' },
    ],
    reqIds: ['TRC-006', 'FHR-001'],
  },
]
