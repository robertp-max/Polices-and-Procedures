import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Download,
  FileJson,
  FileLock2,
  FileStack,
  FileText,
  FlaskConical,
  Gavel,
  Hash,
  Link2,
  LockKeyhole,
  Package,
  Scale,
  Search,
  ShieldAlert,
  Signature,
  Stamp,
} from 'lucide-react'
import { elena, getPatient } from '../data/patients'
import { RelatedNav } from '../components/RelatedNav'
import { Drawer, EmptyState, PatientAvatar, ProgressBar, StatCard, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './leg.css'

/* ──────────────────────────────────────────────────────────────────────────
 * Legal evidence packages (DOC domain)
 * Max-effort design prototype for retention-locked manifests, legal hold,
 * signature chains, custody, and export readiness. All data is synthetic.
 * Anchors DOC-005 · ADR 03 · legal record.
 * ────────────────────────────────────────────────────────────────────────── */

type PackageStatus = 'draft' | 'pending-signatures' | 'on-hold' | 'sealed' | 'attention'
type PurposeKind = 'soc' | 'incident' | 'discharge' | 'order' | 'disclosure' | 'survey'
type StatusFilter = 'all' | PackageStatus
type PurposeFilter = 'all' | PurposeKind
type DetailTab = 'overview' | 'artifacts' | 'custody' | 'exports'
type AssembleStep = 0 | 1 | 2 | 3

type EvidenceItem = {
  id: string
  kind: string
  label: string
  version: string
  source: string
  signed: boolean
  pinned: boolean
}

type CustodyEvent = {
  id: string
  at: string
  actor: string
  action: string
  detail: string
}

type LegalPackage = {
  id: string
  title: string
  matter: string
  purposeKind: PurposeKind
  purpose: string
  patientId?: string
  status: PackageStatus
  hold: boolean
  holdReason?: string
  holdOwner?: string
  hashOk: boolean
  hash: string
  hashVerifiedAt: string
  retention: string
  wormClass: string
  assembledAt: string
  assembledBy: string
  completeness: number
  items: EvidenceItem[]
  signatures: { role: string; name: string; state: 'signed' | 'pending' | 'n/a'; at?: string }[]
  policyVersions: { label: string; version: string }[]
  custody: CustodyEvent[]
  exports: { format: string; readiness: 'ready' | 'blocked' | 'partial'; note: string }[]
  disposition: string
  reqIds: string[]
}

const PURPOSE_META: Record<PurposeKind, { label: string; short: string }> = {
  soc: { label: 'SOC defense', short: 'SOC' },
  incident: { label: 'Incident', short: 'Incident' },
  discharge: { label: 'Discharge', short: 'Discharge' },
  order: { label: 'Order authority', short: 'Orders' },
  disclosure: { label: 'Disclosure', short: 'Disclosure' },
  survey: { label: 'Survey readiness', short: 'Survey' },
}

const STATUS_META: Record<PackageStatus, { tone: StatusTone; label: string }> = {
  draft: { tone: 'warn', label: 'Draft' },
  'pending-signatures': { tone: 'progress', label: 'Pending signatures' },
  'on-hold': { tone: 'bad', label: 'On hold' },
  sealed: { tone: 'good', label: 'Sealed' },
  attention: { tone: 'warn', label: 'Hash attention' },
}

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending-signatures', label: 'Pending signatures' },
  { key: 'on-hold', label: 'On hold' },
  { key: 'sealed', label: 'Sealed' },
  { key: 'attention', label: 'Hash attention' },
]

const PURPOSE_FILTERS: { key: PurposeFilter; label: string }[] = [
  { key: 'all', label: 'All purposes' },
  { key: 'soc', label: 'SOC defense' },
  { key: 'incident', label: 'Incident' },
  { key: 'discharge', label: 'Discharge' },
  { key: 'order', label: 'Order authority' },
  { key: 'disclosure', label: 'Disclosure' },
  { key: 'survey', label: 'Survey' },
]

const ASSEMBLE_PURPOSES: { kind: PurposeKind; title: string; body: string }[] = [
  { kind: 'soc', title: 'SOC defense', body: 'Pin notes, OASIS, orders, and POC for payment-period defense.' },
  { kind: 'incident', title: 'Incident package', body: 'Timeline, notifications, photos, and review trail under hold when needed.' },
  { kind: 'discharge', title: 'Discharge package', body: 'Teaching, acknowledgments, and reconciled meds for permanent record.' },
  { kind: 'order', title: 'Order authority', body: 'Verbal/telephone orders with read-back and countersignature path.' },
  { kind: 'disclosure', title: 'Disclosure set', body: 'Minimum-necessary inventory, release set, and delivery proof.' },
  { kind: 'survey', title: 'Survey readiness', body: 'Cross-cutting evidence for ACHC / CMS survey retrieval.' },
]

const ASSEMBLE_PIN_CHECKS = [
  'Exact FHIR and document versions (no floating “latest”)',
  'Policy / template / rule version labels',
  'Signature intent, role, and time zone',
  'Communications and external acknowledgments when applicable',
  'Manifest hash target + retention class',
] as const

const PACKAGES: LegalPackage[] = [
  {
    id: 'PKG-8821',
    title: 'SOC evidence bundle',
    matter: 'Start of care · payment period open',
    purposeKind: 'soc',
    purpose:
      'Preserve SOC skilled nursing note, draft OASIS-E2, physician orders, and plan of care versions for later claim and survey defense.',
    patientId: 'pt-elena',
    status: 'draft',
    hold: false,
    hashOk: true,
    hash: 'sha256:a9f3c21e…7b02',
    hashVerifiedAt: 'Today · 11:55 AM',
    retention: 'Medical record · 7 years (proposed CA HHA)',
    wormClass: 'WORM-proposed · not production',
    assembledAt: 'Today · 11:42 AM',
    assembledBy: 'Taylor Brooks, RN',
    completeness: 62,
    items: [
      { id: 'i1', kind: 'Note', label: 'SOC skilled nursing note', version: 'v3 draft', source: 'Clinical note', signed: false, pinned: true },
      { id: 'i2', kind: 'Assessment', label: 'OASIS-E2 SOC package', version: '82% complete', source: 'OASIS workspace', signed: false, pinned: true },
      { id: 'i3', kind: 'Order', label: 'Physician orders · hip aftercare', version: 'v1', source: 'Orders', signed: true, pinned: true },
      { id: 'i4', kind: 'Plan', label: 'Plan of care draft', version: 'v2', source: 'Clinical', signed: false, pinned: false },
    ],
    signatures: [
      { role: 'Assembling clinician', name: 'Taylor Brooks, RN', state: 'pending' },
      { role: 'Clinical manager', name: 'Dana Whitfield, RN', state: 'pending' },
      { role: 'Package seal', name: '—', state: 'n/a' },
    ],
    policyVersions: [
      { label: 'SOC documentation policy', version: 'POL-SOC-v4.2' },
      { label: 'OASIS lock procedure', version: 'SOP-OASIS-v1.8' },
    ],
    custody: [
      { id: 'c1', at: 'Today · 11:42 AM', actor: 'Taylor Brooks, RN', action: 'Assembled draft', detail: 'Pinned 4 candidate artifacts from chart context.' },
      { id: 'c2', at: 'Today · 11:48 AM', actor: 'System (synthetic)', action: 'Hash preview', detail: 'Manifest hash computed for draft contents.' },
    ],
    exports: [
      { format: 'Human-readable PDF packet', readiness: 'partial', note: 'Blocked until signatures complete' },
      { format: 'Machine-readable manifest (JSON)', readiness: 'partial', note: 'Draft export only' },
    ],
    disposition: 'Open · seal when signatures and completeness ≥ 100%',
    reqIds: ['DOC-005', 'FRM-001'],
  },
  {
    id: 'PKG-8790',
    title: 'Incident evidence package',
    matter: 'Fall without injury · risk event',
    purposeKind: 'incident',
    purpose: 'Timeline, notifications, photos, and supervisor review under legal hold pending family inquiry.',
    patientId: 'pt-walter',
    status: 'on-hold',
    hold: true,
    holdReason: 'Counsel requested hold pending family inquiry',
    holdOwner: 'External counsel · privacy desk',
    hashOk: true,
    hash: 'sha256:44bc91aa…0d3f',
    hashVerifiedAt: 'Jul 31 · 9:12 AM',
    retention: 'Incident + legal hold · disposition blocked',
    wormClass: 'Hold supersedes routine disposition',
    assembledAt: 'Jul 30 · 4:18 PM',
    assembledBy: 'QAPI desk',
    completeness: 100,
    items: [
      { id: 'i1', kind: 'Timeline', label: 'Event chronology', version: 'v2 sealed', source: 'Incident desk', signed: true, pinned: true },
      { id: 'i2', kind: 'Photo', label: 'Home environment photos (3)', version: 'v1', source: 'Field capture', signed: true, pinned: true },
      { id: 'i3', kind: 'Notice', label: 'Internal incident notification', version: 'v1', source: 'Comms', signed: true, pinned: true },
      { id: 'i4', kind: 'Review', label: 'Supervisor review note', version: 'v1', source: 'Clinical', signed: true, pinned: true },
    ],
    signatures: [
      { role: 'Reporter', name: 'Marcus Webb, PT', state: 'signed', at: 'Jul 30 · 3:40 PM' },
      { role: 'Supervisor', name: 'Dana Whitfield, RN', state: 'signed', at: 'Jul 30 · 4:05 PM' },
      { role: 'Legal hold', name: 'Counsel · hold active', state: 'signed', at: 'Jul 30 · 5:22 PM' },
    ],
    policyVersions: [
      { label: 'Incident reporting policy', version: 'POL-INC-v3.1' },
      { label: 'Legal hold procedure', version: 'SOP-HOLD-v2.0' },
    ],
    custody: [
      { id: 'c1', at: 'Jul 30 · 3:40 PM', actor: 'Marcus Webb, PT', action: 'Reported', detail: 'Fall without injury captured in field visit.' },
      { id: 'c2', at: 'Jul 30 · 4:18 PM', actor: 'QAPI desk', action: 'Assembled package', detail: 'Pinned timeline, photos, notices, review.' },
      { id: 'c3', at: 'Jul 30 · 5:22 PM', actor: 'Counsel', action: 'Legal hold applied', detail: 'Disposition and destructive overwrite blocked.' },
      { id: 'c4', at: 'Jul 31 · 9:12 AM', actor: 'Integrity job', action: 'Hash verified', detail: 'Independent recompute matched manifest.' },
    ],
    exports: [
      { format: 'Human-readable PDF packet', readiness: 'ready', note: 'Hold watermark applied in production design' },
      { format: 'Machine-readable manifest (JSON)', readiness: 'ready', note: 'Includes hold metadata' },
    ],
    disposition: 'Blocked · legal hold active',
    reqIds: ['DOC-005', 'SEC-006'],
  },
  {
    id: 'PKG-8755',
    title: 'Discharge instruction package',
    matter: 'Discharge planned · patient education',
    purposeKind: 'discharge',
    purpose: 'Sealed discharge instructions and patient acknowledgment for permanent medical record.',
    patientId: 'pt-dorothy',
    status: 'sealed',
    hold: false,
    hashOk: true,
    hash: 'sha256:0fe277d4…91c8',
    hashVerifiedAt: 'Aug 1 · 9:20 AM',
    retention: 'Medical record · 7 years (proposed CA HHA)',
    wormClass: 'WORM-proposed · sealed immutable',
    assembledAt: 'Aug 1 · 9:05 AM',
    assembledBy: 'Iris Duan, RN',
    completeness: 100,
    items: [
      { id: 'i1', kind: 'Instructions', label: 'Discharge teaching sheet', version: 'v1 sealed', source: 'Clinical', signed: true, pinned: true },
      { id: 'i2', kind: 'Signature', label: 'Patient/representative acknowledgment', version: 'v1', source: 'eCign rail', signed: true, pinned: true },
      { id: 'i3', kind: 'Med list', label: 'Reconciled discharge meds', version: 'v1', source: 'Medications', signed: true, pinned: true },
    ],
    signatures: [
      { role: 'Discharging clinician', name: 'Iris Duan, RN', state: 'signed', at: 'Aug 1 · 9:05 AM' },
      { role: 'Patient / representative', name: 'Dorothy Liang (or representative)', state: 'signed', at: 'Aug 1 · 9:12 AM' },
      { role: 'Package seal', name: 'System seal', state: 'signed', at: 'Aug 1 · 9:15 AM' },
    ],
    policyVersions: [
      { label: 'Discharge education policy', version: 'POL-DC-v2.4' },
    ],
    custody: [
      { id: 'c1', at: 'Aug 1 · 9:05 AM', actor: 'Iris Duan, RN', action: 'Assembled', detail: 'Pinned teaching, ack, med list for discharge-planned episode.' },
      { id: 'c2', at: 'Aug 1 · 9:15 AM', actor: 'System seal', action: 'Sealed', detail: 'Manifest hash locked; amendments require new package.' },
    ],
    exports: [
      { format: 'Human-readable PDF packet', readiness: 'ready', note: 'Sealed watermark' },
      { format: 'Machine-readable manifest (JSON)', readiness: 'ready', note: 'SHA-256 included' },
    ],
    disposition: 'Retained · routine medical-record class',
    reqIds: ['DOC-005'],
  },
  {
    id: 'PKG-8844',
    title: 'Order authority package',
    matter: 'Verbal order · countersignature pending',
    purposeKind: 'order',
    purpose: 'Capture verbal order, read-back, and physician countersignature path without backdating.',
    patientId: 'pt-walter',
    status: 'pending-signatures',
    hold: false,
    hashOk: true,
    hash: 'sha256:c8110bb2…44e1',
    hashVerifiedAt: 'Today · 9:02 AM',
    retention: 'Medical record · 7 years (proposed CA HHA)',
    wormClass: 'WORM-proposed · not production',
    assembledAt: 'Today · 8:50 AM',
    assembledBy: 'Taylor Brooks, RN',
    completeness: 75,
    items: [
      { id: 'i1', kind: 'Order', label: 'Verbal order · diuretic change', version: 'v1', source: 'Orders', signed: true, pinned: true },
      { id: 'i2', kind: 'Read-back', label: 'Read-back confirmation', version: 'v1', source: 'Orders', signed: true, pinned: true },
      { id: 'i3', kind: 'Signature', label: 'Physician countersignature', version: 'pending', source: 'eCign rail', signed: false, pinned: true },
    ],
    signatures: [
      { role: 'Receiving RN', name: 'Taylor Brooks, RN', state: 'signed', at: 'Today · 8:50 AM' },
      { role: 'Ordering physician', name: 'Dr. Susan Cho', state: 'pending' },
      { role: 'Package seal', name: '—', state: 'n/a' },
    ],
    policyVersions: [
      { label: 'Verbal order policy', version: 'POL-VO-v1.9' },
      { label: 'Signature intent standard', version: 'STD-SIG-v1.2' },
    ],
    custody: [
      { id: 'c1', at: 'Today · 8:50 AM', actor: 'Taylor Brooks, RN', action: 'Received verbal order', detail: 'Read-back completed with patient present.' },
      { id: 'c2', at: 'Today · 8:55 AM', actor: 'System (synthetic)', action: 'Countersign request', detail: 'Sent to ordering physician queue (visual only).' },
    ],
    exports: [
      { format: 'Human-readable PDF packet', readiness: 'blocked', note: 'Awaiting physician countersignature' },
      { format: 'Machine-readable manifest (JSON)', readiness: 'partial', note: 'Draft export allowed for review' },
    ],
    disposition: 'Open · cannot seal with pending countersignature',
    reqIds: ['DOC-005', 'ORD-001'],
  },
  {
    id: 'PKG-8701',
    title: 'Disclosure packet',
    matter: 'Records request · attorney',
    purposeKind: 'disclosure',
    purpose: 'Controlled disclosure set with minimum-necessary inventory and delivery proof.',
    status: 'sealed',
    hold: false,
    hashOk: true,
    hash: 'sha256:19de55f0…c6ab',
    hashVerifiedAt: 'Jul 10 · 3:05 PM',
    retention: 'Disclosure log · policy period',
    wormClass: 'Disclosure log class',
    assembledAt: 'Jul 10 · 2:40 PM',
    assembledBy: 'HIM desk',
    completeness: 100,
    items: [
      { id: 'i1', kind: 'Index', label: 'Minimum-necessary inventory', version: 'v1', source: 'HIM', signed: true, pinned: true },
      { id: 'i2', kind: 'Export', label: 'Released document set', version: 'v1', source: 'Export service', signed: true, pinned: true },
      { id: 'i3', kind: 'Delivery', label: 'Delivery / receipt proof', version: 'v1', source: 'HIM', signed: true, pinned: true },
    ],
    signatures: [
      { role: 'HIM reviewer', name: 'Alex Chen', state: 'signed', at: 'Jul 10 · 2:40 PM' },
      { role: 'Privacy officer', name: 'Jordan Lee', state: 'signed', at: 'Jul 10 · 2:55 PM' },
      { role: 'Package seal', name: 'System seal', state: 'signed', at: 'Jul 10 · 3:00 PM' },
    ],
    policyVersions: [
      { label: 'Release of information policy', version: 'POL-ROI-v5.0' },
      { label: 'Minimum necessary standard', version: 'STD-MN-v1.1' },
    ],
    custody: [
      { id: 'c1', at: 'Jul 10 · 1:10 PM', actor: 'HIM desk', action: 'Request intake', detail: 'Attorney request validated against authorization.' },
      { id: 'c2', at: 'Jul 10 · 3:00 PM', actor: 'System seal', action: 'Sealed & logged', detail: 'Disclosure accounting entry created (synthetic).' },
    ],
    exports: [
      { format: 'Human-readable PDF packet', readiness: 'ready', note: 'Released set + accounting' },
      { format: 'Machine-readable manifest (JSON)', readiness: 'ready', note: 'Includes recipient and purpose' },
    ],
    disposition: 'Retained · disclosure log class',
    reqIds: ['DOC-005', 'IAM-004'],
  },
  {
    id: 'PKG-8688',
    title: 'ACHC survey evidence set',
    matter: 'Mock survey · clinical record sample',
    purposeKind: 'survey',
    purpose: 'Cross-cutting package for surveyors: rights, assessment, care planning, and QAPI linkage samples.',
    patientId: 'pt-elena',
    status: 'attention',
    hold: false,
    hashOk: false,
    hash: 'sha256:b2e10a77…expected mismatch',
    hashVerifiedAt: 'Today · 7:30 AM',
    retention: 'Survey readiness · ephemeral rehearsal class',
    wormClass: 'Rehearsal · not WORM',
    assembledAt: 'Yesterday · 4:00 PM',
    assembledBy: 'Compliance desk',
    completeness: 88,
    items: [
      { id: 'i1', kind: 'Rights', label: 'Patient rights acknowledgment', version: 'v1', source: 'Admission', signed: true, pinned: true },
      { id: 'i2', kind: 'Assessment', label: 'Comprehensive assessment summary', version: 'v2', source: 'Clinical', signed: true, pinned: true },
      { id: 'i3', kind: 'QAPI', label: 'PIP excerpt · HF cohort', version: 'v1', source: 'QAPI', signed: false, pinned: false },
      { id: 'i4', kind: 'Policy', label: 'Effective policy citations', version: 'stale pin', source: 'Policy register', signed: true, pinned: true },
    ],
    signatures: [
      { role: 'Compliance assembler', name: 'Riley Okonkwo', state: 'signed', at: 'Yesterday · 4:00 PM' },
      { role: 'Clinical manager', name: 'Dana Whitfield, RN', state: 'pending' },
      { role: 'Package seal', name: '—', state: 'n/a' },
    ],
    policyVersions: [
      { label: 'Survey readiness playbook', version: 'PB-SURVEY-v0.9' },
      { label: 'Policy citation set', version: 'PIN-STALE · re-pin required' },
    ],
    custody: [
      { id: 'c1', at: 'Yesterday · 4:00 PM', actor: 'Riley Okonkwo', action: 'Assembled rehearsal set', detail: 'Mixed sealed and draft artifacts for mock survey.' },
      { id: 'c2', at: 'Today · 7:30 AM', actor: 'Integrity job', action: 'Hash mismatch', detail: 'Pinned policy citation set changed after assemble.' },
    ],
    exports: [
      { format: 'Human-readable PDF packet', readiness: 'blocked', note: 'Integrity attention blocks export' },
      { format: 'Machine-readable manifest (JSON)', readiness: 'blocked', note: 'Re-pin required before export' },
    ],
    disposition: 'Open · re-pin policy versions and re-verify hash',
    reqIds: ['DOC-005', 'TRC-001', 'QAP-002'],
  },
]

const DETAIL_TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'artifacts', label: 'Artifacts' },
  { key: 'custody', label: 'Custody' },
  { key: 'exports', label: 'Exports' },
]

function exportTone(r: 'ready' | 'blocked' | 'partial'): StatusTone {
  if (r === 'ready') return 'good'
  if (r === 'blocked') return 'bad'
  return 'warn'
}

function sealDisabledReason(pkg: LegalPackage): string | null {
  if (pkg.hold) return 'Legal hold blocks seal and destructive disposition.'
  if (pkg.status === 'sealed') return 'Already sealed in this sample.'
  if (!pkg.hashOk) return 'Hash attention must clear before seal.'
  if (pkg.status === 'pending-signatures' || pkg.signatures.some(s => s.state === 'pending')) {
    return 'Pending signatures block seal in production design.'
  }
  if (pkg.completeness < 100) return 'Completeness must reach 100% before seal.'
  return null
}

export default function LegalEvidenceScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [purposeFilter, setPurposeFilter] = useState<PurposeFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(PACKAGES[0]?.id ?? null)
  const [detailTab, setDetailTab] = useState<DetailTab>('overview')
  const [assembleOpen, setAssembleOpen] = useState(false)
  const [assembleStep, setAssembleStep] = useState<AssembleStep>(0)
  const [assemblePurpose, setAssemblePurpose] = useState<PurposeKind | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PACKAGES.filter(pkg => {
      if (statusFilter !== 'all' && pkg.status !== statusFilter) return false
      if (purposeFilter !== 'all' && pkg.purposeKind !== purposeFilter) return false
      if (!q) return true
      const patient = pkg.patientId ? getPatient(pkg.patientId) : undefined
      const hay = [
        pkg.id,
        pkg.title,
        pkg.matter,
        pkg.purpose,
        PURPOSE_META[pkg.purposeKind].label,
        patient ? `${patient.firstName} ${patient.lastName} ${patient.mrn}` : '',
        ...pkg.items.map(i => `${i.label} ${i.kind}`),
        ...pkg.reqIds,
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [query, statusFilter, purposeFilter])

  // Keep inspector aligned with the visible registry (filters may hide the prior selection).
  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
      return
    }
    if (!selectedId || !filtered.some(p => p.id === selectedId)) {
      setSelectedId(filtered[0].id)
      setDetailTab('overview')
    }
  }, [filtered, selectedId])

  const selected = PACKAGES.find(p => p.id === selectedId) ?? null

  const holdCount = PACKAGES.filter(p => p.hold).length
  const pendingSig = PACKAGES.filter(
    p => p.status === 'pending-signatures' || p.signatures.some(s => s.state === 'pending'),
  ).length
  const sealedCount = PACKAGES.filter(p => p.status === 'sealed').length
  const hashMismatches = PACKAGES.filter(p => !p.hashOk).length

  const selectPackage = (id: string) => {
    setSelectedId(id)
    setDetailTab('overview')
  }

  const openAssemble = () => {
    setAssembleStep(0)
    setAssemblePurpose(null)
    setAssembleOpen(true)
  }

  const sealBlock = selected ? sealDisabledReason(selected) : null

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain DOC · legal evidence</div>
          <h1 className="screen-title">Legal evidence packages</h1>
          <div className="screen-sub">
            Retention-locked manifests, legal hold, signature chain, custody, and dual-format export —
            synthetic design prototype for DOC-005.
          </div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/documents')}>
            <Signature size={15} strokeWidth={2} aria-hidden />
            Documents & signatures
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            <BookOpenCheck size={15} strokeWidth={2} aria-hidden />
            DOC-005 register
          </button>
          <button type="button" className="btn btn-primary" onClick={openAssemble}>
            <Package size={15} strokeWidth={2} aria-hidden />
            Assemble package
          </button>
        </div>
      </div>

      <div className="leg-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>
          Synthetic design prototype · nothing is sealed, held, disclosed, or written to WORM storage.
          Production requires authorized DOC requirements, independent hash verification, and evidence gates.
        </span>
      </div>

      <RelatedNav route="/legal-evidence" />

      <div className="leg-stats">
        <StatCard
          icon={<FileStack size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Packages in registry"
          value={PACKAGES.length}
          sub="Synthetic sample set for layout evaluation"
          accent="teal"
        />
        <StatCard
          icon={<LockKeyhole size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Legal holds"
          value={holdCount}
          sub="Disposition blocked until counsel releases"
          accent="warn"
        />
        <StatCard
          icon={<Hash size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Hash mismatches"
          value={hashMismatches}
          sub="Independent verify · sample includes one attention"
          accent={hashMismatches === 0 ? 'good' : 'warn'}
        />
        <StatCard
          icon={<Signature size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Pending signatures"
          value={pendingSig}
          sub={`${sealedCount} sealed in sample · incomplete stay open`}
          accent="orange"
        />
      </div>

      <div className="leg-workspace">
        {/* ── Registry ── */}
        <section className="card leg-registry" aria-label="Evidence package registry">
          <div className="leg-card-head">
            <div>
              <div className="card-kicker">Registry</div>
              <h2 className="card-title leg-card-title">Evidence packages</h2>
            </div>
            <span className="chip chip-neutral">{filtered.length} shown</span>
          </div>

          <div className="leg-toolbar">
            <label className="leg-search">
              <Search size={15} strokeWidth={2} aria-hidden />
              <span className="sr-only">Search packages</span>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search package, patient, artifact, or requirement"
              />
            </label>

            <div className="leg-filter-block">
              <span className="leg-filter-label" id="leg-status-filters">Status</span>
              <div className="leg-filters" role="toolbar" aria-labelledby="leg-status-filters">
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'leg-filter' + (statusFilter === f.key ? ' is-active' : '')}
                    aria-pressed={statusFilter === f.key}
                    onClick={() => setStatusFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="leg-filter-block">
              <span className="leg-filter-label" id="leg-purpose-filters">Purpose</span>
              <div className="leg-filters" role="toolbar" aria-labelledby="leg-purpose-filters">
                {PURPOSE_FILTERS.map(f => (
                  <button
                    key={f.key}
                    type="button"
                    className={'leg-filter leg-filter-purpose' + (purposeFilter === f.key ? ' is-active' : '')}
                    aria-pressed={purposeFilter === f.key}
                    onClick={() => setPurposeFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<FileLock2 size={26} strokeWidth={1.5} />}
              title="No packages match"
              sub="Clear filters or search. All packages on this page are synthetic."
            />
          ) : (
            <div className="leg-list" role="listbox" aria-label="Package list">
              {filtered.map(pkg => {
                const patient = pkg.patientId ? getPatient(pkg.patientId) : undefined
                const meta = STATUS_META[pkg.status]
                const isSelected = pkg.id === selectedId
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={'leg-row' + (isSelected ? ' is-selected' : '')}
                    onClick={() => selectPackage(pkg.id)}
                  >
                    <span className={'leg-row-icon' + (pkg.hold ? ' is-hold' : !pkg.hashOk ? ' is-attention' : '')} aria-hidden>
                      {pkg.hold ? <ShieldAlert size={16} strokeWidth={1.75} /> : <Scale size={16} strokeWidth={1.75} />}
                    </span>
                    <span className="leg-row-main">
                      <span className="leg-row-top">
                        <span className="leg-pkg-id">{pkg.id}</span>
                        <span className="chip chip-neutral leg-purpose-chip">{PURPOSE_META[pkg.purposeKind].short}</span>
                        <StatusChip tone={meta.tone}>{meta.label}</StatusChip>
                        {pkg.hold ? (
                          <span className="chip chip-bad">
                            <ShieldAlert size={10} strokeWidth={2.25} aria-hidden />
                            Hold
                          </span>
                        ) : null}
                      </span>
                      <span className="leg-pkg-title">{pkg.title}</span>
                      <span className="leg-pkg-matter">{pkg.matter}</span>
                      <span className="leg-pkg-meta">
                        {patient ? (
                          <span className="leg-who">
                            <PatientAvatar first={patient.firstName} last={patient.lastName} tone={patient.photoTone} size="sm" />
                            <span className="leg-who-name">{patient.firstName} {patient.lastName}</span>
                          </span>
                        ) : (
                          <span className="leg-who-name leg-who-name-soft">No patient chart link</span>
                        )}
                        <span className="leg-dot" aria-hidden />
                        <span>{pkg.items.length} artifacts</span>
                        <span className="leg-dot" aria-hidden />
                        <span className={'leg-hash' + (!pkg.hashOk ? ' is-bad' : '')}>
                          {pkg.hashOk ? 'Hash verified' : 'Hash attention'}
                        </span>
                      </span>
                    </span>
                    <span className="leg-row-meter">
                      <span className="leg-meter-label">{pkg.completeness}%</span>
                      <ProgressBar
                        pct={pkg.completeness}
                        color={
                          !pkg.hashOk
                            ? 'var(--status-warn)'
                            : pkg.completeness === 100
                              ? 'var(--status-good)'
                              : 'var(--teal-400)'
                        }
                        label={`${pkg.id} completeness ${pkg.completeness} percent`}
                      />
                    </span>
                    <ArrowRight className="leg-row-go" size={14} strokeWidth={2} aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Inspector ── */}
        <aside className="leg-inspector" aria-label="Package inspector">
          {selected ? (
            <div className="card leg-inspector-card">
              <div className="leg-inspector-head">
                <div>
                  <div className="card-kicker">Inspector</div>
                  <h2 className="card-title leg-card-title">{selected.id}</h2>
                  <p className="leg-inspector-title">{selected.title}</p>
                </div>
                <div className="leg-drawer-status">
                  <StatusChip tone={STATUS_META[selected.status].tone}>
                    {STATUS_META[selected.status].label}
                  </StatusChip>
                  {selected.hold ? <StatusChip tone="bad">Legal hold</StatusChip> : null}
                  <StatusChip tone={selected.hashOk ? 'good' : 'warn'}>
                    {selected.hashOk ? 'Hash verified' : 'Hash attention'}
                  </StatusChip>
                </div>
              </div>

              <div className="leg-tabs" role="tablist" aria-label="Package detail sections">
                {DETAIL_TABS.map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={detailTab === tab.key}
                    className={'leg-tab' + (detailTab === tab.key ? ' is-active' : '')}
                    onClick={() => setDetailTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="leg-inspector-body" role="tabpanel">
                {detailTab === 'overview' ? (
                  <div className="leg-panel">
                    {selected.patientId ? (() => {
                      const p = getPatient(selected.patientId!)
                      if (!p) return null
                      return (
                        <button
                          type="button"
                          className="leg-drawer-patient"
                          onClick={() => navigate(`/patients/${p.id}`)}
                        >
                          <PatientAvatar first={p.firstName} last={p.lastName} tone={p.photoTone} />
                          <span>
                            <strong className="leg-who-name">{p.firstName} {p.lastName}</strong>
                            <span>MRN {p.mrn} · open chart</span>
                          </span>
                          <ArrowRight size={14} strokeWidth={2} aria-hidden />
                        </button>
                      )
                    })() : (
                      <p className="leg-drawer-copy">Matter is not linked to a single patient chart.</p>
                    )}

                    <p className="leg-drawer-copy">{selected.purpose}</p>

                    {selected.hold && selected.holdReason ? (
                      <div className="leg-hold-callout" role="status">
                        <ShieldAlert size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Hold active</strong>
                          <span>{selected.holdReason}</span>
                          {selected.holdOwner ? <span className="leg-hold-owner">Owner · {selected.holdOwner}</span> : null}
                        </div>
                      </div>
                    ) : null}

                    {!selected.hashOk ? (
                      <div className="leg-attention-callout" role="status">
                        <Hash size={16} strokeWidth={2} aria-hidden />
                        <div>
                          <strong>Integrity attention</strong>
                          <span>
                            Independent verify at {selected.hashVerifiedAt} did not match the pinned manifest.
                            Re-pin changed artifacts before export or seal.
                          </span>
                        </div>
                      </div>
                    ) : null}

                    <div className="leg-drawer-grid">
                      <div>
                        <span className="card-kicker">Assembled</span>
                        <strong>{selected.assembledAt}</strong>
                        <span>{selected.assembledBy}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Retention</span>
                        <strong>{selected.retention}</strong>
                        <span>{selected.wormClass}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Manifest hash</span>
                        <strong className="leg-mono">{selected.hash}</strong>
                        <span>Verified {selected.hashVerifiedAt}</span>
                      </div>
                      <div>
                        <span className="card-kicker">Disposition</span>
                        <strong>{selected.disposition}</strong>
                        <span>Prototype labels only</span>
                      </div>
                    </div>

                    <div className="leg-section">
                      <div className="card-kicker">Policy / template pins</div>
                      <ul className="leg-policy-list">
                        {selected.policyVersions.map(pv => (
                          <li key={pv.label}>
                            <BookOpenCheck size={14} strokeWidth={2} aria-hidden />
                            <span>
                              <strong>{pv.label}</strong>
                              <span className="leg-mono-soft">{pv.version}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="leg-section">
                      <div className="card-kicker">Signature chain</div>
                      <ul className="leg-sig-list">
                        {selected.signatures.map(sig => (
                          <li key={sig.role}>
                            <span>
                              <strong>{sig.role}</strong>
                              <span>
                                {sig.name}
                                {sig.at ? ` · ${sig.at}` : ''}
                              </span>
                            </span>
                            <StatusChip
                              tone={sig.state === 'signed' ? 'good' : sig.state === 'pending' ? 'warn' : 'neutral'}
                            >
                              {sig.state === 'signed' ? 'Signed' : sig.state === 'pending' ? 'Pending' : 'N/A'}
                            </StatusChip>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="leg-req-row">
                      <Link2 size={14} strokeWidth={2} aria-hidden />
                      <span>
                        Requirements ·{' '}
                        {selected.reqIds.map((id, i) => (
                          <span key={id}>
                            {i > 0 ? ', ' : ''}
                            <button type="button" className="leg-req-link" onClick={() => navigate('/requirements')}>
                              {id}
                            </button>
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                ) : null}

                {detailTab === 'artifacts' ? (
                  <div className="leg-panel">
                    <p className="leg-drawer-copy">
                      Production DOC-005 pins exact FHIR and document versions — never floating “latest”
                      references. Incomplete pins stay visibly incomplete.
                    </p>
                    <ul className="leg-artifact-list">
                      {selected.items.map(item => (
                        <li key={item.id}>
                          <span className="leg-artifact-kind">{item.kind}</span>
                          <span className="leg-artifact-main">
                            <span className="leg-artifact-label">{item.label}</span>
                            <span className="leg-artifact-src">{item.source} · {item.version}</span>
                          </span>
                          <StatusChip tone={item.pinned ? (item.signed ? 'good' : 'warn') : 'neutral'}>
                            {!item.pinned ? 'Unpinned' : item.signed ? 'Pinned' : 'Incomplete'}
                          </StatusChip>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {detailTab === 'custody' ? (
                  <div className="leg-panel">
                    <p className="leg-drawer-copy">
                      Chain of custody is append-only in production. This timeline is a visual sample only.
                    </p>
                    <ol className="leg-custody">
                      {selected.custody.map((ev, idx) => (
                        <li key={ev.id}>
                          <span className="leg-custody-rail" aria-hidden>
                            <span className={'leg-custody-dot' + (idx === selected.custody.length - 1 ? ' is-latest' : '')} />
                            {idx < selected.custody.length - 1 ? <span className="leg-custody-line" /> : null}
                          </span>
                          <div className="leg-custody-body">
                            <div className="leg-custody-top">
                              <strong>{ev.action}</strong>
                              <span className="leg-custody-at">{ev.at}</span>
                            </div>
                            <span className="leg-custody-actor">{ev.actor}</span>
                            <span className="leg-custody-detail">{ev.detail}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}

                {detailTab === 'exports' ? (
                  <div className="leg-panel">
                    <p className="leg-drawer-copy">
                      Acceptance for DOC-005 requires both human-readable and machine-readable exports with
                      independent hash verification. Buttons below are visual only.
                    </p>
                    <ul className="leg-export-list">
                      {selected.exports.map(ex => (
                        <li key={ex.format}>
                          <span className="leg-export-icon" aria-hidden>
                            {ex.format.includes('JSON') ? <FileJson size={16} strokeWidth={1.75} /> : <FileText size={16} strokeWidth={1.75} />}
                          </span>
                          <span className="leg-export-main">
                            <strong>{ex.format}</strong>
                            <span>{ex.note}</span>
                          </span>
                          <StatusChip tone={exportTone(ex.readiness)}>
                            {ex.readiness === 'ready' ? 'Ready' : ex.readiness === 'blocked' ? 'Blocked' : 'Partial'}
                          </StatusChip>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            disabled={ex.readiness === 'blocked'}
                            title={ex.readiness === 'blocked' ? 'Blocked by integrity or signatures' : 'Visual only · no file is downloaded'}
                          >
                            <Download size={13} strokeWidth={2} aria-hidden />
                            Export
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="leg-inspector-foot">
                <div className="leg-drawer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={selected.hold}
                    title={selected.hold ? 'Hold already active' : 'Visual only · no hold is written'}
                  >
                    <Gavel size={14} strokeWidth={2} aria-hidden />
                    Request hold
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!!sealBlock}
                    title={sealBlock ?? 'Visual only · nothing is sealed'}
                  >
                    <Stamp size={14} strokeWidth={2} aria-hidden />
                    Seal package
                  </button>
                </div>
                <p className="leg-drawer-footnote">
                  {sealBlock
                    ? `Seal disabled · ${sealBlock} No durable write occurs in this prototype.`
                    : 'Seal / hold / export controls are visual only. No package is written to durable storage.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="card leg-inspector-empty">
              <EmptyState
                icon={<Scale size={26} strokeWidth={1.5} />}
                title="Select a package"
                sub="Choose a row in the registry to inspect artifacts, custody, and export readiness."
              />
            </div>
          )}

          <section className="card leg-ops" aria-label="Holds and integrity">
            <div className="leg-card-head leg-card-head-tight">
              <div>
                <div className="card-kicker">Ops strip</div>
                <h2 className="card-title leg-card-title-sm">Holds & integrity</h2>
              </div>
              <StatusChip tone={hashMismatches === 0 ? 'good' : 'warn'}>
                {hashMismatches === 0 ? 'Clean' : `${hashMismatches} attention`}
              </StatusChip>
            </div>
            <div className="leg-ops-grid">
              <div className="leg-ops-block">
                <div className="leg-ops-kicker">
                  <LockKeyhole size={13} strokeWidth={2} aria-hidden />
                  Active holds
                </div>
                {PACKAGES.filter(p => p.hold).map(pkg => (
                  <button key={pkg.id} type="button" className="leg-hold-row" onClick={() => selectPackage(pkg.id)}>
                    <span className="leg-hold-top">
                      <span className="leg-pkg-id">{pkg.id}</span>
                      <StatusChip tone="bad">On hold</StatusChip>
                    </span>
                    <span className="leg-hold-title">{pkg.title}</span>
                    <span className="leg-hold-reason">{pkg.holdReason}</span>
                  </button>
                ))}
                {holdCount === 0 ? <p className="leg-side-empty">No active holds in the sample set.</p> : null}
              </div>
              <div className="leg-ops-block">
                <div className="leg-ops-kicker">
                  <CheckCircle2 size={13} strokeWidth={2} aria-hidden />
                  Verification
                </div>
                <ul className="leg-verify-list">
                  <li>
                    <Hash size={15} strokeWidth={2} aria-hidden />
                    <div>
                      <strong>Manifest hashes</strong>
                      <span>Last independent run · {hashMismatches} mismatch{hashMismatches === 1 ? '' : 'es'}</span>
                    </div>
                  </li>
                  <li>
                    <Clock3 size={15} strokeWidth={2} aria-hidden />
                    <div>
                      <strong>Signature latency</strong>
                      <span>{pendingSig} package{pendingSig === 1 ? '' : 's'} waiting on intent</span>
                    </div>
                  </li>
                  <li>
                    <FileLock2 size={15} strokeWidth={2} aria-hidden />
                    <div>
                      <strong>Retention classes</strong>
                      <span>Proposed medical-record, hold, and disclosure · not production WORM</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* ── Assemble wizard ── */}
      <Drawer
        open={assembleOpen}
        onClose={() => setAssembleOpen(false)}
        title="Assemble package"
        sub={`Guided path · step ${assembleStep + 1} of 4 · synthetic only`}
      >
        <div className="leg-wizard">
          <ol className="leg-wizard-rail" aria-label="Assembly steps">
            {['Purpose', 'Pin versions', 'Signatures', 'Seal preview'].map((label, i) => (
              <li key={label} className={i === assembleStep ? 'is-current' : i < assembleStep ? 'is-done' : ''}>
                <span className="leg-wizard-n">{String(i + 1).padStart(2, '0')}</span>
                <span>{label}</span>
              </li>
            ))}
          </ol>

          {assembleStep === 0 ? (
            <div className="leg-panel">
              <p className="leg-drawer-copy">
                Choose why this package exists. Purpose drives which artifact classes, signatures, and
                retention class are suggested — never invents clinical facts.
              </p>
              <div className="leg-purpose-grid">
                {ASSEMBLE_PURPOSES.map(p => (
                  <button
                    key={p.kind}
                    type="button"
                    className={'leg-purpose-card' + (assemblePurpose === p.kind ? ' is-selected' : '')}
                    onClick={() => setAssemblePurpose(p.kind)}
                  >
                    <strong>{p.title}</strong>
                    <span>{p.body}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {assembleStep === 1 ? (
            <div className="leg-panel">
              <p className="leg-drawer-copy">
                Pin exact versions. Floating “latest” references are rejected by DOC-005 acceptance.
              </p>
              <div className="leg-drawer-patient" style={{ cursor: 'default' }}>
                <PatientAvatar first={elena.firstName} last={elena.lastName} tone={elena.photoTone} />
                <span>
                  <strong className="leg-who-name">
                    Example subject · {elena.firstName} {elena.lastName}
                  </strong>
                  <span>Suggested when assembling from a chart context</span>
                </span>
              </div>
              <ul className="leg-check-list">
                {ASSEMBLE_PIN_CHECKS.map(item => (
                  <li key={item}>
                    <CheckCircle2 size={15} strokeWidth={2} aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {assembleStep === 2 ? (
            <div className="leg-panel">
              <p className="leg-drawer-copy">
                Capture intent, role, and time zone. Never backdate. Signature rails (eCign) remain
                external authority until DOC gates authorize integration.
              </p>
              <ul className="leg-sig-list">
                <li>
                  <span>
                    <strong>Assembling clinician</strong>
                    <span>Taylor Brooks, RN · intent pending</span>
                  </span>
                  <StatusChip tone="warn">Pending</StatusChip>
                </li>
                <li>
                  <span>
                    <strong>Clinical manager</strong>
                    <span>Required for seal on clinical packages</span>
                  </span>
                  <StatusChip tone="neutral">N/A yet</StatusChip>
                </li>
                <li>
                  <span>
                    <strong>Package seal</strong>
                    <span>System seal after completeness + hash</span>
                  </span>
                  <StatusChip tone="neutral">N/A</StatusChip>
                </li>
              </ul>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate('/documents')}>
                <Signature size={13} strokeWidth={2} aria-hidden />
                Open signature queue
              </button>
            </div>
          ) : null}

          {assembleStep === 3 ? (
            <div className="leg-panel">
              <p className="leg-drawer-copy">
                Seal produces a signed manifest under WORM retention and optional legal hold. This
                prototype only previews the operator path — no seal is written.
              </p>
              <div className="leg-seal-preview">
                <div>
                  <span className="card-kicker">Purpose</span>
                  <strong>
                    {assemblePurpose ? PURPOSE_META[assemblePurpose].label : 'Not selected'}
                  </strong>
                </div>
                <div>
                  <span className="card-kicker">Retention class</span>
                  <strong>Medical record · 7 years (proposed)</strong>
                </div>
                <div>
                  <span className="card-kicker">Hash target</span>
                  <strong className="leg-mono">sha256:preview…only</strong>
                </div>
              </div>
            </div>
          ) : null}

          <div className="leg-drawer-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setAssembleOpen(false)}>
              Cancel
            </button>
            {assembleStep > 0 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAssembleStep(s => (Math.max(0, s - 1) as AssembleStep))}
              >
                Back
              </button>
            ) : null}
            {assembleStep < 3 ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={assembleStep === 0 && !assemblePurpose}
                onClick={() => setAssembleStep(s => (Math.min(3, s + 1) as AssembleStep))}
              >
                Continue
                <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setAssembleOpen(false)
                  selectPackage(PACKAGES[0].id)
                }}
              >
                Preview sample package
              </button>
            )}
          </div>
          <p className="leg-drawer-footnote">
            Assembly never invents clinical facts and never marks packages sealed in this prototype.
          </p>
        </div>
      </Drawer>
    </div>
  )
}
