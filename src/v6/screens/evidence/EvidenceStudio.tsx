import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { CalendarApi, type BradTrainingResponse, type ManifestFolder } from '@/policy/services/calendarApi';
import StudioLanding from './StudioLanding';
import { FolderOpen, Calendar, ClipboardCheck, Landmark, Stethoscope, ShieldCheck, AlertTriangle, Users, GraduationCap, Settings, FileStack } from 'lucide-react';
import { workspaceCompactTabClass, workspaceTabActiveClass, workspaceTabInactiveClass } from '@/components/theme/workspaceTabChrome';

/* ════════════════════════════════════════════════════════════════════════════
   Evidence Studio — DefenCIble UI (ported from the approved design
   `defencible_packets.tsx`). This pass applies the VISUAL design only; the real
   generation / Drive / signer wiring (UX) is reconnected in a follow-up so the
   look matches the approved screenshots exactly first.
   ════════════════════════════════════════════════════════════════════════════ */

export type EvidenceStudioTab = 'library' | 'studio' | 'edit' | 'signatures';

const TAB_FROM_INITIAL: Record<EvidenceStudioTab, string> = {
  library: 'DRIVE',
  studio: 'CREATE PACKET',
  edit: 'EDIT PACKET',
  signatures: 'SIGNATURE TRACKER',
};

// --- DATA ---
interface Template { id: string; name: string; desc: string; tags: string[]; requiresEvent: boolean }
interface PayerRoute { id: string; name: string; desc: string; badge?: string }
interface EventItem { id: string; title: string; date: string; endDate: string; completed: boolean }
interface Signer { role: string; name: string }
interface Packet { id: string; template: string; event: string; date: string; status: string }
interface ChatMessage { role: 'brad' | 'user'; text: string }

const TEMPLATES: Template[] = [
  { id: 'CI-HH-ADM-001', name: 'Patient Admission Packet', desc: 'Full patient admission agreement with 42 CFR § 484.50 rights and all standard consents.', tags: ['ADMISSION', 'REQUIRED'], requiresEvent: false },
  { id: 'QAPI-QRT-001', name: 'QAPI Quarterly Committee Meeting', desc: 'Full quarterly QAPI committee review with KPIs, PIPs, incidents, infection control, chart audits.', tags: ['ACHC REQUIRED', 'QUARTERLY', '8 FORMS'], requiresEvent: true },
  { id: 'QAPI-MTH-001', name: 'QAPI Monthly Committee Meeting', desc: 'Monthly QAPI committee review: rolling KPIs, open PIPs, new incidents, complaints.', tags: ['ACHC REQUIRED', 'MONTHLY', '9 FORMS'], requiresEvent: true },
  { id: 'GOV-BRD-001', name: 'Governing Body / Board Meeting', desc: 'Annual or quarterly governing body review of agency operations, financials, compliance.', tags: ['CMS REQUIRED', 'ANNUAL / QUARTERLY', '5 FORMS'], requiresEvent: true },
  { id: 'INC-REV-001', name: 'Patient Safety Committee', desc: 'Review of adverse events, near-misses, sentinel events, root cause analyses, and trends.', tags: ['BEST PRACTICE', 'QUARTERLY', '4 FORMS'], requiresEvent: true },
  { id: 'CUST-001', name: 'Custom Meeting Packet', desc: 'Build a custom packet from scratch. Define your own sections, forms, and signatures.', tags: ['FLEXIBLE', 'ANY FREQUENCY'], requiresEvent: true },
];

const PAYER_ROUTES: PayerRoute[] = [
  { id: 'PRIVATE_PAY', name: 'Private Pay', desc: 'Patient/family pays directly. Rate schedule, tokenized payment authorization.' },
  { id: 'LTC', name: 'Long-Term Care Insurance', desc: 'LTC insurer covers eligible services; patient responsibility for non-covered.' },
  { id: 'MA', name: 'Medicare Advantage / Private Insurance', desc: 'Prior auth, copay/coinsurance, denial responsibility.' },
  { id: 'FFS', name: 'Original Medicare (FFS)', desc: 'Part A home health benefit. $0 covered. CMS notice matrix.', badge: 'US' },
  { id: 'MEDICAL', name: 'Medi-Cal / Medicaid', desc: 'No balance billing. Legal review for any patient responsibility.' },
  { id: 'VA', name: "VA / Workers' Comp / Contract", desc: 'Contracted payer; authorization, scope, claim submission.' },
  { id: 'PENDING', name: 'Pending Verification', desc: 'Payer not yet confirmed. Estimates only; finalize by deadline.' },
  { id: 'NA', name: 'N/A — No Billable Services', desc: 'Administrative/intake only. No payment clauses.' },
];

const EVENTS: EventItem[] = [
  { id: 'evt-882', title: 'Q2 2026 QAPI Review', date: '2026-06-30', endDate: '2026-07-05', completed: false },
  { id: 'evt-875', title: 'May 2026 QAPI Meeting', date: '2026-05-31', endDate: '2026-06-05', completed: false },
  { id: 'evt-812', title: 'Patient Fall Incident - J. Doe', date: '2026-04-15', endDate: '2026-04-18', completed: false },
];

type AccentKey = 'gold' | 'teal' | 'blue' | 'green' | 'safety' | 'purple' | 'aqua' | 'orange';
type IconKey = 'ces' | 'year' | 'qapi' | 'governance' | 'clinical' | 'infection' | 'safety' | 'advisory' | 'training' | 'custom' | 'mock' | 'admission' | 'draft';
type DriveFolder = {
  name: string;
  number?: string;
  subtitle?: string;
  meta?: string;
  accent: AccentKey;
  icon: IconKey;
  pageDesc?: string;
  children?: DriveFolder[];
  /** Real Google Drive folder ID — when set, the card browses Drive inside the app. */
  folderId?: string;
  /** Secondary escape hatch to open the backing folder/file in Google Drive. */
  folderUrl?: string;
  fileUrl?: string;
  fileType?: string;
  isFile?: boolean;
};

const ACCENTS: Record<AccentKey, { from: string; to: string }> = {
  gold: { from: '#FCD34D', to: '#D97706' },
  teal: { from: '#2DD4BF', to: '#007C7A' },
  blue: { from: '#60A5FA', to: '#2563EB' },
  green: { from: '#4ADE80', to: '#16A34A' },
  safety: { from: '#FB923C', to: '#DC2626' },
  purple: { from: '#C084FC', to: '#7C3AED' },
  aqua: { from: '#22D3EE', to: '#0891B2' },
  orange: { from: '#FBBF24', to: '#E87722' },
};

const ICONS: Record<IconKey, typeof FolderOpen> = {
  ces: FolderOpen, year: Calendar, qapi: ClipboardCheck, governance: Landmark,
  clinical: Stethoscope, infection: ShieldCheck, safety: AlertTriangle,
  advisory: Users, training: GraduationCap, custom: Settings,
  mock: FileStack, admission: ClipboardCheck, draft: FileStack,
};

// 2026 → event cards. Accent strip per event type.
const CES_2026_EVENTS: DriveFolder[] = [
  { name: 'QAPI Quarterly Committee Meeting', number: '01', accent: 'teal', icon: 'qapi', meta: 'Q2 · DUE JUN 30', subtitle: 'Quarterly QAPI governance packet: dashboards, PIP status, incident trends, complaint review, infection-control summaries, minutes, action items, and final packet approval.' },
  { name: 'QAPI Monthly Committee Meeting', number: '02', accent: 'teal', icon: 'qapi', meta: 'MONTHLY · OPEN', subtitle: 'Monthly quality review packet: KPI trends, open PIPs, incidents, complaints, grievances, action items, and committee minutes.' },
  { name: 'Annual QAPI Program Evaluation', number: '03', accent: 'teal', icon: 'qapi', meta: 'ANNUAL · DUE DEC', subtitle: 'Annual evaluation of 12-month QAPI performance, PIP outcomes, quality trends, program effectiveness, and next-year recommendations.' },
  { name: 'Governing Body / Board Meeting', number: '04', accent: 'gold', icon: 'governance', meta: 'GOVERNANCE · QUARTERLY', subtitle: 'Governance record: board agenda, administrator report, compliance updates, QAPI escalations, policy approvals, motions, and minutes.' },
  { name: 'Clinical Record Review Committee', number: '05', accent: 'blue', icon: 'clinical', meta: 'CLINICAL · MONTHLY', subtitle: 'Clinical audit packet: chart review findings, OASIS/documentation issues, plan-of-care/order gaps, medication reconciliation, corrective actions, escalations.' },
  { name: 'Infection Control Committee', number: '06', accent: 'green', icon: 'infection', meta: 'SURVEILLANCE · QUARTERLY', subtitle: 'Infection surveillance packet: infection trends, outbreak review, hand hygiene/PPE audits, antibiotic stewardship, corrective actions, and minutes.' },
  { name: 'Patient Safety Committee', number: '07', accent: 'safety', icon: 'safety', meta: 'SAFETY · QUARTERLY', subtitle: 'Safety review packet: falls, adverse events, near misses, RCA/CAPA tracking, staff and patient safety risks, and assigned follow-up actions.' },
  { name: 'CAG / PAC Advisory Meeting', number: '08', accent: 'purple', icon: 'advisory', meta: 'ADVISORY · ANNUAL', subtitle: 'Advisory meeting packet: community input, professional advisory recommendations, patient feedback, clinical program updates, and documented minutes.' },
  { name: 'Staff In-Service / Training', number: '09', accent: 'aqua', icon: 'training', meta: 'TRAINING · AS SCHEDULED', subtitle: 'Training evidence packet: session objectives, attendance, competency records, LMS attestations, remediation follow-up, and staff education docs.' },
  { name: 'Custom Meeting Packet', number: '10', accent: 'gold', icon: 'custom', meta: 'CUSTOM · ANY CADENCE', subtitle: 'User-defined event packet: custom agendas, source documents, minutes, evidence references, action items, and optional approval workflow.' },
];

const DRIVE_TREE: DriveFolder[] = [
  {
    name: 'CES Events', accent: 'gold', icon: 'ces', meta: '3 YEARS',
    subtitle: 'Compliance event packets by year, month, and workflow.',
    pageDesc: 'Compliance event evidence organized by year. Open a year to review generated packets, meeting records, evidence files, minutes, approvals, and audit-ready documentation.',
    children: [
      { name: '2029', number: '2029', accent: 'gold', icon: 'year', meta: '3 EVENTS · SCHEDULED', subtitle: 'Future scheduled compliance events.', pageDesc: 'Future-year compliance events scheduled or generated for long-range planning, recurring cadence validation, and forward evidence readiness.', children: [] },
      { name: '2028', number: '2028', accent: 'gold', icon: 'year', meta: '4 EVENTS · PLANNED', subtitle: 'Upcoming planned evidence year.', pageDesc: 'Planned compliance events for upcoming governance, QAPI, safety, clinical review, and accreditation-readiness workflows.', children: [] },
      { name: '2026', number: '2026', accent: 'gold', icon: 'year', meta: '246 EVENTS · ACTIVE', subtitle: 'Active compliance evidence year.', pageDesc: 'Primary operating year — active and completed compliance events, generated packets, evidence files, minutes, signatures, and audit-ready records.', children: CES_2026_EVENTS },
    ],
  },
  {
    name: 'Brad Training', accent: 'aqua', icon: 'training', meta: 'TRAINING LIBRARY', subtitle: 'Guides, LMS modules, and Brad workflow training.',
    pageDesc: 'Training library — onboarding, annual compliance modules, competency attestations, and Brad workflow guides.',
    children: [
      { name: 'CNA / HHA Onboarding', number: 'L1', accent: 'aqua', icon: 'training', meta: 'LMS MODULE', subtitle: 'Core onboarding modules, competencies, and attestations.' },
      { name: 'Annual ACHC Training', number: 'L2', accent: 'aqua', icon: 'training', meta: 'LMS MODULE', subtitle: 'Annual compliance refreshers and accreditation-readiness training.' },
      { name: 'Brad Workflow Guides', number: 'L3', accent: 'aqua', icon: 'training', meta: 'GUIDE', subtitle: 'How-to guides for packet generation, signing, and evidence filing.' },
    ],
  },
  {
    name: 'Mock Event Packets', accent: 'orange', icon: 'mock', meta: 'SYNTHETIC · UAT', subtitle: 'Synthetic UAT packets for packet-generation testing.',
    pageDesc: 'Synthetic UAT packets used to exercise packet generation, rendering, and signature flows without real PHI.',
    children: [
      { name: 'QAPI Quarterly — UAT Sample', number: 'U1', accent: 'teal', icon: 'qapi', meta: 'SYNTHETIC · DRAFT', subtitle: 'Generated test packet for QAPI quarterly rendering + signature flow.' },
      { name: 'Governing Body — UAT Sample', number: 'U2', accent: 'gold', icon: 'governance', meta: 'SYNTHETIC · DRAFT', subtitle: 'Generated test packet for governance rendering validation.' },
      { name: 'Admission — UAT Sample', number: 'U3', accent: 'blue', icon: 'admission', meta: 'SYNTHETIC · DRAFT', subtitle: 'Generated test admission packet for eCIgn signer-flow testing.' },
    ],
  },
  {
    name: 'Patient Admission Packet', accent: 'blue', icon: 'admission', meta: 'LIVE FROM DRIVE', subtitle: 'Admission, consent, privacy, billing route, and eCIgn packet.',
    pageDesc: 'Patient admission packet sections — admission agreement, privacy, financial/billing route, and the eCIgn certificate with audit trail.',
    children: [
      { name: 'Admission Agreement', number: 'A', accent: 'blue', icon: 'admission', meta: 'CONSENT', subtitle: 'Admission agreement and 42 CFR §484.50 patient rights.' },
      { name: 'Notice of Privacy Practices', number: 'B', accent: 'blue', icon: 'admission', meta: 'HIPAA', subtitle: 'Privacy practices acknowledgment and ROI authorization.' },
      { name: 'Financial / Billing Route', number: 'C', accent: 'blue', icon: 'admission', meta: 'PAYER', subtitle: 'Selected payer route, rate schedule, and financial responsibility.' },
      { name: 'eCIgn Certificate', number: 'D', accent: 'blue', icon: 'admission', meta: 'SIGNED', subtitle: 'Electronic signature certificate and audit trail.' },
    ],
  },
  {
    name: 'Draft Evidence Packets', accent: 'purple', icon: 'draft', meta: '2 DOCS PENDING', subtitle: 'Drafts, uploaded sources, and evidence pending review.',
    pageDesc: 'Drafts, uploaded source documents, and evidence pending review before they are filed to a year/event.',
    children: [
      { name: 'Draft — QAPI Q2 (uploaded sources)', number: 'D1', accent: 'purple', icon: 'draft', meta: 'PENDING REVIEW', subtitle: 'Draft packet with uploaded source documents awaiting review.' },
      { name: 'Draft — Incident Review (pending)', number: 'D2', accent: 'purple', icon: 'draft', meta: 'PENDING REVIEW', subtitle: 'Draft evidence pending validation and approval.' },
    ],
  },
];

function accentForSection(section: string): AccentKey {
  const s = (section || '').toLowerCase();
  if (s.includes('admission')) return 'blue';
  if (s.includes('qapi')) return 'teal';
  if (s.includes('incident') || s.includes('adverse')) return 'orange';
  if (s.includes('infection')) return 'green';
  if (s.includes('govern') || s.includes('board')) return 'aqua';
  if (s.includes('draft')) return 'purple';
  return 'gold';
}
function iconForSection(section: string): IconKey {
  const s = (section || '').toLowerCase();
  if (s.includes('admission')) return 'admission';
  if (s.includes('qapi')) return 'qapi';
  if (s.includes('infection')) return 'infection';
  if (s.includes('govern') || s.includes('board')) return 'governance';
  if (s.includes('clinical')) return 'clinical';
  if (s.includes('safety')) return 'safety';
  if (s.includes('draft')) return 'draft';
  return 'year';
}

function driveFolderIdFromUrl(url?: string): string {
  if (!url) return '';
  const folderMatch = url.match(/\/folders\/([^/?#]+)/);
  if (folderMatch?.[1]) return decodeURIComponent(folderMatch[1]);
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('id') || '';
  } catch {
    return '';
  }
}

function DriveCard({ folder, onOpen }: { folder: DriveFolder; onOpen: () => void }) {
  const a = ACCENTS[folder.accent];
  const Icon = ICONS[folder.icon];
  return (
    <button type="button" onClick={onOpen} aria-label={folder.name} className="group relative w-[250px] text-left">
      <div
        className="relative flex min-h-[200px] flex-col overflow-hidden rounded-[20px] p-6 shadow-lg transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl"
        style={{ background: `linear-gradient(145deg, ${a.from} 0%, ${a.to} 100%)` }}
      >
        <div className="absolute right-4 top-5 rounded-xl bg-white/95 p-2 shadow-md">
          <Icon className="h-4 w-4" style={{ color: a.to }} />
        </div>
        {folder.number && <div className="text-3xl font-bold leading-none text-white/95">{folder.number}</div>}
        <h3 className={`${folder.number ? 'mt-3' : 'mt-1'} pr-10 text-base font-medium leading-snug text-white`}>{folder.name}</h3>
        {folder.subtitle && <p className="mt-2 text-[11px] font-light leading-relaxed text-white/90 line-clamp-4">{folder.subtitle}</p>}
        {folder.meta && <div className="mt-auto pt-4 text-[10px] font-medium uppercase tracking-wider text-white/85">{folder.meta}</div>}
      </div>
      <div className="mx-4 h-3 rounded-b-[20px] opacity-25 blur-[3px]" style={{ background: `linear-gradient(${a.to}, transparent)` }} />
    </button>
  );
}

// --- ICONS ---
const DocIcon = () => (
  <svg className="w-5 h-5 text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
);

export function EvidenceStudio({ initialTab = 'studio' }: { initialTab?: EvidenceStudioTab }) {
  const [activeTab, setActiveTab] = useState<string>(TAB_FROM_INITIAL[initialTab] ?? 'CREATE PACKET');
  const [folderPackets, setFolderPackets] = useState<Packet[]>([]);
  const [drivePath, setDrivePath] = useState<string[]>([]);
  // Real Drive folders from the CSV manifest (source of truth). Loaded when the
  // DRIVE tab opens; folder cards browse inside the app using their Drive folder IDs.
  const [realFolders, setRealFolders] = useState<ManifestFolder[]>([]);
  const [foldersErr, setFoldersErr] = useState<string | null>(null);
  const [driveExplorerLoading, setDriveExplorerLoading] = useState(false);
  const [driveExplorerErr, setDriveExplorerErr] = useState<string | null>(null);
  const [driveExplorerData, setDriveExplorerData] = useState<BradTrainingResponse | null>(null);
  const [driveExplorerTrail, setDriveExplorerTrail] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (activeTab !== 'DRIVE') return;
    let on = true;
    CalendarApi.manifestFolders()
      .then((r) => { if (on) { setRealFolders(r.folders || []); setFoldersErr(r.error ?? null); } })
      .catch((e) => { if (on) { setRealFolders([]); setFoldersErr(e instanceof Error ? e.message : 'Manifest unavailable'); } });
    return () => { on = false; };
  }, [activeTab]);
  const openDriveFolderInApp = (folderId: string, name: string, trail = driveExplorerTrail) => {
    if (!folderId) return;
    const nextTrail = [...trail, { id: folderId, name }];
    setDrivePath([]);
    setDriveExplorerTrail(nextTrail);
    setDriveExplorerLoading(true);
    setDriveExplorerErr(null);
    CalendarApi.driveFolderChildren(folderId)
      .then((data) => setDriveExplorerData(data))
      .catch((e) => {
        setDriveExplorerData(null);
        setDriveExplorerErr(e instanceof Error ? e.message : 'Google Drive folder is unavailable.');
      })
      .finally(() => setDriveExplorerLoading(false));
  };
  const resetDriveExplorer = () => {
    setDriveExplorerData(null);
    setDriveExplorerTrail([]);
    setDriveExplorerErr(null);
  };
  const realTop: DriveFolder[] = realFolders.map((f) => ({
    name: f.folderName || f.section || 'Folder',
    subtitle: f.fullFolderPath || undefined,
    meta: `${f.count} FILE${f.count === 1 ? '' : 'S'}${f.lastUpdated ? ' · ' + f.lastUpdated : ''}`,
    accent: accentForSection(f.section),
    icon: iconForSection(f.section),
    folderId: f.folderId || driveFolderIdFromUrl(f.folderUrl),
    folderUrl: f.folderUrl,
  }));
  // Walk the drive path → current level items + node (for breadcrumb + page desc).
  // Top level uses REAL manifest folders when available (else the sample tree).
  const rootLevel: DriveFolder[] = realTop.length > 0 ? realTop : DRIVE_TREE;
  let driveLevel: DriveFolder[] = rootLevel;
  let driveNode: DriveFolder | null = null;
  for (const seg of drivePath) {
    driveNode = driveLevel.find((f) => f.name === seg) ?? null;
    driveLevel = driveNode?.children ?? [];
  }
  const usingSample = realTop.length === 0;
  const liveDriveCards: DriveFolder[] = driveExplorerData
    ? [
        ...driveExplorerData.folders.map((f) => ({
          name: f.name,
          subtitle: 'Google Drive folder',
          meta: 'Folder',
          accent: 'gold' as AccentKey,
          icon: 'year' as IconKey,
          folderId: f.id,
        })),
        ...driveExplorerData.files.map((f) => ({
          name: f.name,
          subtitle: f.path || 'Google Drive file',
          meta: f.mimeType,
          accent: 'blue' as AccentKey,
          icon: 'draft' as IconKey,
          fileUrl: f.webViewLink,
          fileType: f.mimeType,
          isFile: true,
        })),
      ]
    : [];

  // --- STUDIO STATE ---
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedPayerRoute, setSelectedPayerRoute] = useState<PayerRoute | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [dataSource, setDataSource] = useState('');
  const [signers, setSigners] = useState<Signer[]>([]);

  // --- DATA SOURCE (Step 3): real document upload + Google Drive folder picker ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataDocs, setDataDocs] = useState<{ name: string; source: 'upload' | 'drive'; id?: string }[]>([]);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveErr, setDriveErr] = useState<string | null>(null);
  const [driveData, setDriveData] = useState<BradTrainingResponse | null>(null);
  const [driveTrail, setDriveTrail] = useState<{ id: string; name: string }[]>([]);
  const onFilesChosen = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setDataDocs((prev) => [...prev, ...files.map((f) => ({ name: f.name, source: 'upload' as const }))]);
    e.target.value = '';
  };
  const loadDrive = (folderId: string | undefined, trail: { id: string; name: string }[]) => {
    setDriveLoading(true); setDriveErr(null); setDriveTrail(trail);
    CalendarApi.bradTrainingDocs(folderId)
      .then((d) => setDriveData(d))
      .catch((err) => setDriveErr(err instanceof Error ? err.message : 'Google Drive is not reachable.'))
      .finally(() => setDriveLoading(false));
  };
  const openFolderModal = () => { setFolderModalOpen(true); setDriveData(null); loadDrive(undefined, []); };
  const addDriveFile = (f: { id: string; name: string }) => setDataDocs((prev) => prev.some((x) => x.id === f.id) ? prev : [...prev, { name: f.name, source: 'drive' as const, id: f.id }]);

  // Studio "Set up Signing →" posts ci-open-signature-tracker; host switches to the
  // Signature Tracker tab (fixes the Sign button that previously only toasted).
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string } | undefined;
      if (d?.type === 'ci-open-signature-tracker') setActiveTab('SIGNATURE TRACKER');
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // --- EDIT PACKET STATE ---
  const [editPacketId, setEditPacketId] = useState('');
  const [isPacketLoaded, setIsPacketLoaded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [openSig, setOpenSig] = useState<string | null>(null);

  const handleLoadPacket = () => {
    if (editPacketId.trim()) {
      setIsPacketLoaded(true);
      setChatMessages([{ role: 'brad', text: `Packet ${editPacketId} loaded. I'm Brad, your AI remediation assistant. What needs to be corrected?` }]);
    }
  };

  const handleSendFeedback = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { role: 'user', text: chatInput }]);
      setChatInput('');
      setTimeout(() => {
        setChatMessages((prev) => [...prev, { role: 'brad', text: 'I have logged this feedback and updated the packet draft. Anything else?' }]);
      }, 1000);
    }
  };

  // --- SIGNATURE TRACKER DATA ---
  const generateDates = () => {
    const now = new Date();
    const due = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const expires = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    return { due: due.toLocaleDateString(), expires: expires.toLocaleDateString() };
  };
  const trackerDates = generateDates();
  const MOCK_SIGNATURES = [
    { id: 'PKT-2026-8812', template: 'QAPI Quarterly Committee Meeting', event: 'Q2 2026 QAPI Review', signers: 'Dakota Director, Morgan MD (2 of 6 pending)', due: trackerDates.due, expires: trackerDates.expires, status: 'Pending Signatures',
      roster: [
        { name: 'Riley RN', role: 'Clinical Manager', signed: true },
        { name: 'Adrian Lindain', role: 'Billing / Accounting', signed: true },
        { name: 'Dee Bustos', role: 'Compliance / Infection Control', signed: true },
        { name: 'Avery Admin', role: 'Administrator', signed: true },
        { name: 'Dakota Director', role: 'DON / Chair', signed: false },
        { name: 'Morgan MD', role: 'Medical Director', signed: false },
      ] },
    { id: 'PKT-2026-8104', template: 'Incident Review Packet', event: 'Patient Fall Incident - J. Doe', signers: 'Avery Admin (1 of 2 pending)', due: trackerDates.due, expires: trackerDates.expires, status: 'Pending Signatures',
      roster: [
        { name: 'Dee Bustos', role: 'Compliance Officer', signed: true },
        { name: 'Avery Admin', role: 'Administrator', signed: false },
      ] },
    { id: 'PKT-2026-7741', template: 'Patient Admission Packet', event: 'Patient Adx (Original Medicare FFS)', signers: 'Eleanor Rose Whitfield (1 of 2 pending)', due: trackerDates.due, expires: trackerDates.expires, status: 'Sent to Patient',
      roster: [
        { name: 'Riley RN', role: 'Admitting Clinician', signed: true },
        { name: 'Eleanor Rose Whitfield', role: 'Patient / Representative', signed: false },
      ] },
  ];

  const handleTemplateSelect = (t: Template) => {
    setSelectedTemplate(t);
    if (t.id === 'CI-HH-ADM-001') {
      setSigners([
        { role: 'Patient / Representative', name: 'Eleanor Rose Whitfield' },
        { role: 'Admitting Clinician', name: 'Riley RN' },
      ]);
      setStep(2);
    } else {
      setSigners([
        { role: 'DON / Chair', name: 'Dakota Director' },
        { role: 'Clinical Manager', name: 'Riley RN' },
        { role: 'Billing / Accounting', name: 'Adrian Lindain' },
        { role: 'Compliance / HIPAA / Security / Infection Control Officer', name: 'Dee Bustos' },
        { role: 'Medical Director', name: 'Morgan MD' },
        { role: 'Administrator', name: 'Avery Admin' },
      ]);
      setStep(2);
    }
  };

  const resetStudio = () => {
    setStep(1);
    setSelectedTemplate(null);
    setSelectedPayerRoute(null);
    setSelectedEvent(null);
    setDataSource('');
    setSigners([]);
  };

  const handleFinish = () => {
    if (!selectedTemplate) return;
    const newPacket: Packet = {
      id: `PKT-${Math.floor(Math.random() * 10000)}`,
      template: selectedTemplate.name,
      event: selectedEvent ? selectedEvent.title : (selectedPayerRoute ? `Patient Adx (${selectedPayerRoute.name})` : 'N/A'),
      date: new Date().toLocaleDateString(),
      status: 'Sent for Signing',
    };
    setFolderPackets([newPacket, ...folderPackets]);
    resetStudio();
    setActiveTab('DRIVE');
  };

  const navTabs = ['DRIVE', 'CREATE PACKET', 'EDIT PACKET', 'SIGNATURE TRACKER'];
  const previewPacketId = selectedEvent
    ? `PKT_2026_${selectedEvent.id}`
    : selectedTemplate
      ? `PKT_2026_${selectedTemplate.id}`
      : 'PKT_2026_DRAFT';

  return (
    <div className="min-h-screen bg-transparent p-6 md:p-10" data-hash-id="evidence-center" data-route="/evidence" data-template="evidence">
      <style dangerouslySetInnerHTML={{ __html: `
        .ci-evidence-studio ::-webkit-scrollbar { display: none; }
        .ci-evidence-studio * { -ms-overflow-style: none; scrollbar-width: none; }
      ` }} />

      <div className="ci-evidence-studio max-w-[1200px] mx-auto">

        {/* TAB NAVIGATION */}
        <div className="mb-6 flex max-w-full items-stretch overflow-x-auto font-montserrat">
          {navTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`${workspaceCompactTabClass} whitespace-nowrap ${
                activeTab === tab ? workspaceTabActiveClass : workspaceTabInactiveClass
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ==================== DRIVE TAB ==================== */}
        {activeTab === 'DRIVE' && (
          <div className="animate-fade-in min-h-[500px]">
            <div className="mb-6 pb-6">
              <h2 className="text-xl text-[#007C7A] mb-1">{driveNode ? driveNode.name : 'Evidence'}</h2>
              <p className="text-sm text-muted font-light max-w-2xl">{driveNode?.pageDesc ?? 'Compliance evidence organized by area — open a folder to drill into years, events, and audit-ready documents.'}</p>
            </div>

            {/* Breadcrumb */}
            <div className="mb-8 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-disabled">
              <button type="button" onClick={() => { setDrivePath([]); resetDriveExplorer(); }} className="transition-colors hover:text-[#007C7A]">Evidence</button>
              {driveExplorerTrail.length > 0
                ? driveExplorerTrail.map((crumb, i) => (
                    <span key={crumb.id} className="flex items-center gap-2">
                      <span className="text-gray-300">/</span>
                      <button
                        type="button"
                        onClick={() => openDriveFolderInApp(crumb.id, crumb.name, driveExplorerTrail.slice(0, i))}
                        className={i === driveExplorerTrail.length - 1 ? 'text-ink' : 'transition-colors hover:text-[#007C7A]'}
                      >
                        {crumb.name}
                      </button>
                    </span>
                  ))
                : drivePath.map((seg, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className="text-gray-300">/</span>
                      <button type="button" onClick={() => setDrivePath(drivePath.slice(0, i + 1))} className={i === drivePath.length - 1 ? 'text-ink' : 'transition-colors hover:text-[#007C7A]'}>{seg}</button>
                    </span>
                  ))}
            </div>

            {drivePath.length === 0 && driveExplorerTrail.length === 0 && (
              usingSample
                ? <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-md py-sm text-xs text-amber-800">Showing <strong>sample</strong> folders — connect Google Drive{foldersErr ? ` (${foldersErr})` : ''} or set <code>DRIVE_MANIFEST_FILE_ID</code> to list the real evidence folders from the manifest.</div>
                : <div className="mb-5 rounded-lg border border-tone-teal-border bg-tone-teal-bg px-md py-sm text-xs text-brand-teal-deep">Live from the Drive manifest — {realFolders.length} folder{realFolders.length === 1 ? '' : 's'}. Click a folder to browse it inside the app.</div>
            )}
            {driveExplorerLoading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm font-light text-disabled">
                Loading Google Drive folder...
              </div>
            ) : driveExplorerErr ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-md py-sm text-sm text-red-700">
                {driveExplorerErr}
              </div>
            ) : (driveExplorerData ? liveDriveCards : driveLevel).length > 0 ? (
              <div className="flex flex-wrap gap-7">
                {(driveExplorerData ? liveDriveCards : driveLevel).map((folder, idx) => (
                  <DriveCard key={idx} folder={folder} onOpen={() => {
                    if (folder.isFile && folder.fileUrl) { window.open(folder.fileUrl, '_blank', 'noopener,noreferrer'); return; }
                    if (folder.folderId) { openDriveFolderInApp(folder.folderId, folder.name, driveExplorerTrail); return; }
                    if (folder.children) setDrivePath([...drivePath, folder.name]);
                    else if (folder.folderUrl) window.open(folder.folderUrl, '_blank', 'noopener,noreferrer');
                  }} />
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-gray-200 text-sm font-light text-disabled">
                {driveExplorerData ? 'This Google Drive folder is empty.' : `No packets generated for ${driveNode?.name ?? 'this folder'} yet.`}
              </div>
            )}

            {folderPackets.length > 0 && (
              <div className="mt-16 pt-8 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-800 mb-6">Recently Generated Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folderPackets.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl p-4 shadow-md border border-transparent hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 cursor-pointer flex gap-4 items-start">
                      <div className="mt-1"><DocIcon /></div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">{p.id}</h4>
                        <p className="text-xs font-light text-muted line-clamp-1">{p.template}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${p.status.includes('Sent') ? 'bg-teal-100 text-teal-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {p.status}
                          </span>
                          <span className="text-[10px] font-light text-disabled">{p.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== CREATE PACKET TAB — real studio (generates packet, uploads to Drive, exports file) ==================== */}
        {activeTab === 'CREATE PACKET' && (
          <div className="animate-fade-in">
            <StudioLanding />
          </div>
        )}

        {/* Prototype card flow — DISABLED (condition never matches a real tab). The real generator
            (StudioLanding → /care_indeed_pdf_studio.html) above does real generation + Google Drive
            upload + file export. Kept un-rendered so the rest of the file stays intact. */}
        {activeTab === '__prototype_cards_disabled__' && (
          <div className="space-y-6">

            {/* STAGE 1: TEMPLATE */}
            {step === 1 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-sm tracking-widest text-muted uppercase font-medium mb-6">Select a packet template</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {TEMPLATES.map((t) => (
                    <div key={t.id}
                      onClick={() => handleTemplateSelect(t)}
                      className="bg-white rounded-[24px] border border-transparent shadow-md p-6 cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between min-h-[180px]"
                    >
                      <div>
                        <h3 className="font-medium text-gray-800 text-lg mb-2 leading-tight">{t.name}</h3>
                        <p className="font-light text-sm text-muted line-clamp-3">{t.desc}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {t.tags.map((tag) => (
                          <span key={tag} className="border border-gray-200 text-muted px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 2: PAYER ROUTE OR EVENT */}
            {step === 2 && selectedTemplate && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent animate-fade-in">
                <button type="button" onClick={() => resetStudio()} className="text-[11px] font-medium uppercase tracking-wider text-disabled mb-6 hover:text-[#007C7A] transition-colors">← Back to Templates</button>

                {selectedTemplate.id === 'CI-HH-ADM-001' ? (
                  <>
                    <h2 className="text-sm tracking-widest text-[#E87722] uppercase font-medium mb-6">1 • Select Payer Route *</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {PAYER_ROUTES.map((route) => (
                        <div key={route.id}
                          onClick={() => { setSelectedPayerRoute(route); setStep(3); }}
                          className="bg-white rounded-[16px] border border-transparent shadow-md p-6 cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 min-h-[140px]"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-800 text-base">{route.name}</h3>
                            {route.badge && <span className="text-xs font-medium text-muted">{route.badge}</span>}
                          </div>
                          <p className="font-light text-sm text-muted">{route.desc}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-sm tracking-widest text-[#E87722] uppercase font-medium mb-6">1 • Select Event Context *</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {EVENTS.map((e) => (
                        <div key={e.id}
                          onClick={() => { setSelectedEvent(e); setStep(3); }}
                          className="bg-white rounded-[16px] border border-transparent shadow-md p-6 cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300"
                        >
                          <h3 className="font-medium text-gray-800 text-base mb-1">{e.title}</h3>
                          <p className="font-light text-xs text-muted uppercase tracking-wider">{e.date} &nbsp;|&nbsp; {e.id}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STAGE 3: DATA SOURCE — real upload + Google Drive folder picker */}
            {step === 3 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent animate-fade-in">
                <button type="button" onClick={() => setStep(2)} className="text-[11px] font-medium uppercase tracking-wider text-disabled mb-6 hover:text-[#007C7A] transition-colors">← Back</button>
                <h2 className="text-sm tracking-widest text-muted uppercase font-medium mb-6">2 • Select Data Source *</h2>

                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFilesChosen} aria-label="Upload documents" title="Upload documents" accept="image/*,application/pdf,.json,.csv,.tsv,.md,.txt" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button type="button" onClick={() => { setDataSource('Upload / Camera'); fileInputRef.current?.click(); }}
                    className="p-8 border border-transparent shadow-md bg-white rounded-[24px] cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 text-center">
                    <div className="font-medium text-gray-800 text-lg">Upload / Camera</div>
                    <div className="text-[10px] font-light uppercase tracking-widest text-disabled mt-3">Images, PDF, Data files</div>
                  </button>
                  <button type="button" onClick={() => { setDataSource('Folders'); openFolderModal(); }}
                    className="p-8 border border-transparent shadow-md bg-white rounded-[24px] cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 text-center">
                    <div className="font-medium text-gray-800 text-lg">Folders</div>
                    <div className="text-[10px] font-light uppercase tracking-widest text-disabled mt-3">Browse Google Drive</div>
                  </button>
                  <button type="button" onClick={() => { setDataSource('Both (Merge)'); fileInputRef.current?.click(); }}
                    className="p-8 border border-transparent shadow-md bg-white rounded-[24px] cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 text-center">
                    <div className="font-medium text-gray-800 text-lg">Both (Merge)</div>
                    <div className="text-[10px] font-light uppercase tracking-widest text-disabled mt-3">Upload + Drive folder</div>
                  </button>
                </div>

                {/* Uploaded Documents */}
                {dataDocs.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-800 mb-4">Uploaded Documents <span className="font-light text-disabled">({dataDocs.length})</span></h3>
                    <div className="space-y-2">
                      {dataDocs.map((d, i) => (
                        <div key={`${d.name}-${i}`} className="flex items-center justify-between gap-3 rounded-[14px] border border-gray-100 bg-gray-50 px-4 py-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <DocIcon />
                            <span className="truncate text-sm text-gray-800">{d.name}</span>
                            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-disabled">{d.source === 'drive' ? 'Google Drive' : 'Upload'}</span>
                          </div>
                          <button type="button" aria-label="Remove document" title="Remove document" onClick={() => setDataDocs((prev) => prev.filter((_, j) => j !== i))} className="shrink-0 text-lg leading-none text-disabled hover:text-red-500">×</button>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setStep(4)} className="mt-6 rounded-full bg-[#007C7A] px-8 py-3 text-xs font-medium uppercase tracking-wider text-white shadow-md transition-all hover:shadow-lg">Continue →</button>
                  </div>
                )}

                {/* Google Drive folder picker modal */}
                {folderModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6" onClick={() => setFolderModalOpen(false)}>
                    <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <h3 className="text-sm font-medium uppercase tracking-widest text-[#007C7A]">Select from Google Drive</h3>
                        <button type="button" aria-label="Close" title="Close" onClick={() => setFolderModalOpen(false)} className="text-xl leading-none text-disabled hover:text-ink">×</button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 border-b border-gray-50 px-6 py-3 text-[11px] font-medium uppercase tracking-wider text-disabled">
                        <button type="button" onClick={() => loadDrive(undefined, [])} className="hover:text-[#007C7A]">Drive</button>
                        {driveTrail.map((t, i) => (
                          <span key={t.id} className="flex items-center gap-2">
                            <span className="text-gray-300">/</span>
                            <button type="button" onClick={() => loadDrive(t.id, driveTrail.slice(0, i + 1))} className="hover:text-[#007C7A]">{t.name}</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex-1 overflow-y-auto px-6 py-4">
                        {driveLoading ? (
                          <div className="py-12 text-center text-sm font-light text-disabled">Loading…</div>
                        ) : driveErr ? (
                          <div className="py-12 text-center text-sm font-light text-red-500">{driveErr}</div>
                        ) : driveData && (driveData.folders.length > 0 || driveData.files.length > 0) ? (
                          <div className="space-y-2">
                            {driveData.folders.map((f) => (
                              <button key={f.id} type="button" onClick={() => loadDrive(f.id, [...driveTrail, { id: f.id, name: f.name }])} className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-teal-50/60">
                                <FolderOpen className="h-4 w-4 text-[#007C7A]" />
                                <span className="text-sm text-gray-800">{f.name}</span>
                              </button>
                            ))}
                            {driveData.files.map((f) => {
                              const added = dataDocs.some((x) => x.id === f.id);
                              return (
                                <button key={f.id} type="button" onClick={() => addDriveFile({ id: f.id, name: f.name })} className="flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-2.5 text-left hover:bg-gray-50">
                                  <span className="flex min-w-0 items-center gap-3"><DocIcon /><span className="truncate text-sm text-gray-800">{f.name}</span></span>
                                  <span className={`shrink-0 text-[10px] font-medium uppercase tracking-wider ${added ? 'text-teal-600' : 'text-disabled'}`}>{added ? '✓ Added' : 'Add'}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-12 text-center text-sm font-light text-disabled">This folder is empty.</div>
                        )}
                      </div>
                      <div className="flex justify-end border-t border-gray-100 px-6 py-4">
                        <button type="button" onClick={() => setFolderModalOpen(false)} className="rounded-full bg-gray-100 px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-secondary hover:bg-gray-200">Done</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 4: VALIDATION */}
            {step === 4 && selectedTemplate && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent animate-fade-in">
                <h2 className="text-sm tracking-widest text-muted uppercase font-medium mb-6">Validation Check</h2>

                <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-8 shadow-sm">
                  <h3 className="text-gray-800 font-medium mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                    Reviewing Data Payload
                  </h3>
                  <p className="font-light text-sm text-secondary mb-4">The defensibility engine is checking all constraints for {selectedTemplate.name}.</p>
                  <ul className="list-disc pl-5 text-sm font-light text-muted space-y-2">
                    <li>Demographic variables verified.</li>
                    <li>Clause logic mapped for {selectedPayerRoute ? selectedPayerRoute.name : 'Standard Event'}.</li>
                    {dataSource && <li>Data source linked: {dataSource}.</li>}
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(3)} className="px-8 py-3 text-xs font-medium uppercase tracking-wider text-secondary bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    Back
                  </button>
                  <button type="button" onClick={() => setStep(5)} className="px-8 py-3 text-xs font-medium uppercase tracking-wider text-white bg-[#007C7A] rounded-full shadow-md hover:shadow-lg transition-all">
                    Generate Preview
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 5: PREVIEW */}
            {step === 5 && selectedTemplate && (
              <div className="bg-[#F8FAFC] backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent animate-fade-in overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-sm tracking-widest text-[#007C7A] uppercase font-medium">Step 3 • Preview & Export</h2>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(4)} className="px-6 py-2 border border-gray-300 rounded-full text-xs font-medium text-secondary hover:bg-white transition-colors">← Back</button>
                    <button type="button" onClick={() => setStep(6)} className="px-6 py-2 bg-[#007C7A] text-white rounded-full text-xs font-medium shadow-md hover:shadow-lg transition-all">Set up Signing →</button>
                  </div>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 snap-x pt-2 px-2" style={{ scrollbarWidth: 'none' }}>
                  {[1, 2, 3, 4, 5].map((pageNum) => (
                    <div key={pageNum} className="min-w-[320px] h-[450px] bg-white rounded-[12px] shadow-md shrink-0 flex flex-col p-6 border-t-[12px] border-[#E87722] snap-start relative">
                      <div className="absolute top-4 right-4 text-[8px] font-medium text-[#E87722] tracking-widest uppercase">{selectedTemplate.id}</div>
                      <div className="w-16 h-16 bg-gray-50 rounded-full mb-6 mt-4 flex items-center justify-center text-teal-600 text-xs font-medium">Logo</div>
                      <h3 className="font-medium text-lg text-gray-900 mb-8 w-3/4 leading-tight">{selectedTemplate.name.toUpperCase()}</h3>

                      {pageNum === 1 && (
                        <div className="bg-teal-50/50 p-4 rounded-lg w-full">
                          <div className="font-medium text-xs text-teal-800 mb-2">DETAILS</div>
                          <div className="font-light text-[10px] text-muted space-y-2">
                            <p>DATE: {new Date().toLocaleDateString()}</p>
                            <p>CONTEXT: {selectedEvent ? selectedEvent.title : 'Initial Admission'}</p>
                            <p>STATUS: Generated &amp; Defensible</p>
                          </div>
                        </div>
                      )}

                      {pageNum > 1 && (
                        <div className="space-y-4 w-full opacity-60">
                          <div className="h-2 bg-gray-200 rounded-full w-full"></div>
                          <div className="h-2 bg-gray-200 rounded-full w-5/6"></div>
                          <div className="h-2 bg-gray-200 rounded-full w-4/6"></div>
                          <div className="h-2 bg-gray-200 rounded-full w-full mt-8"></div>
                          <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-6 text-[8px] font-light text-disabled">Page {pageNum}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 6: ASSIGN SIGNERS */}
            {step === 6 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent animate-fade-in">
                <div className="mb-8">
                  <h2 className="text-sm tracking-widest text-[#007C7A] uppercase font-medium mb-1 flex items-center gap-2">
                    <DocIcon /> Signature tasks - currently assigned signer roster
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {signers.map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-[16px] bg-white border border-transparent shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{s.name}</p>
                        <p className="font-light text-xs text-muted mt-1">{s.role}</p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="text-[10px] font-medium uppercase">Scheduled</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-teal-50/50 p-6 rounded-[24px] border border-teal-100/50">
                  <h3 className="font-medium text-teal-800 flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Schedule signing
                  </h3>
                  <label className="flex items-start gap-3 cursor-pointer mb-6">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" defaultChecked />
                    <span className="font-light text-sm text-teal-900">I confirm these individuals will be assigned tasks to sign this packet.</span>
                  </label>
                  <button type="button" onClick={() => setStep(7)} className="w-full md:w-auto px-10 py-4 bg-[#69A7A3] text-white rounded-xl text-sm font-medium shadow-md hover:bg-teal-700 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    Generate &amp; schedule signature tasks
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 7: FINISH / DOWNLOAD */}
            {step === 7 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent animate-fade-in flex flex-col md:flex-row gap-8 items-start">

                <div className="w-full md:w-1/3 bg-[#F8FAFC] rounded-[24px] p-6 shadow-sm border border-gray-100">
                  <div className="text-[10px] font-medium text-muted uppercase tracking-widest mb-2">PACKET ID</div>
                  <div className="flex gap-2 items-center mb-4">
                    <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium border border-gray-200 text-gray-800">{previewPacketId}</span>
                    <button type="button" className="bg-[#007C7A] text-white p-2 rounded-lg shadow hover:bg-teal-800 transition-colors">
                      <DocIcon />
                    </button>
                  </div>
                  <div className="font-light text-[10px] text-disabled mt-4 leading-relaxed">
                    Packet bound to: {selectedEvent ? selectedEvent.title : 'Admission'}<br />
                    Generated: {new Date().toLocaleDateString()}
                  </div>
                </div>

                <div className="w-full md:w-2/3">
                  <h3 className="font-medium text-xl text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#007C7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Thank you — your packet is ready.
                  </h3>
                  <p className="font-light text-sm text-secondary mb-6">
                    Please use this as your formal documentation. Please go over this packet and use the Evidence Studio if you have any corrections.
                  </p>

                  <div className="bg-gray-50 rounded-[16px] p-5 mb-8">
                    <p className="font-medium text-xs text-gray-800 mb-3">Signature tasks have been scheduled for these individuals:</p>
                    <ul className="list-disc pl-5 font-light text-xs text-secondary space-y-1">
                      {signers.map((s, i) => (
                        <li key={i}>{s.name} — {s.role}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-4 items-center">
                    <button type="button" onClick={() => handleFinish()} className="px-6 py-3 bg-[#007C7A] text-white rounded-full text-xs font-medium shadow-md hover:bg-teal-800 hover:shadow-lg transition-all flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                      Print / Download packet
                    </button>
                    <button type="button" onClick={() => handleFinish()} className="px-6 py-3 bg-white text-[#007C7A] rounded-full text-xs font-medium border border-teal-100 shadow-sm hover:bg-teal-50 transition-all flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      View completion status
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================== EDIT PACKET TAB ==================== */}
        {activeTab === 'EDIT PACKET' && (
          <div className="space-y-6 animate-fade-in">

            <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent">
              <div className="text-[10px] font-medium text-muted uppercase tracking-widest mb-2">PACKET ID</div>
              <div className="flex flex-col md:flex-row gap-4 md:items-center mb-3">
                <input
                  type="text"
                  placeholder="qapi_meeting-20260609-"
                  value={editPacketId}
                  onChange={(e) => setEditPacketId(e.target.value)}
                  className="flex-1 max-w-md bg-gray-50 border border-gray-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#007C7A] focus:bg-white transition-all"
                />
                <button type="button"
                  onClick={handleLoadPacket}
                  className="bg-[#69A7A3] text-white px-6 py-3 rounded-[12px] shadow-sm hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium w-full md:w-auto"
                >
                  <DocIcon /> Load packet
                </button>
              </div>
              <p className="font-light text-xs text-disabled">Find the Packet ID on the cover page and every page footer of a generated packet. Loading it starts a remediation thread with Brad.</p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-8 shadow-xl border border-transparent min-h-[500px] flex flex-col">
              <h3 className="font-medium text-teal-800 flex items-center gap-2 mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Remediation
              </h3>

              <div className="flex-1 bg-gray-50/50 rounded-[24px] border border-gray-100 p-6 flex flex-col justify-end mb-6 overflow-y-auto">
                {!isPacketLoaded ? (
                  <div className="flex flex-col items-center justify-center h-full text-disabled">
                    <img src="/apple-icon.png" alt="Brad" className="w-8 h-8 opacity-50 mb-4" />
                    <p className="text-sm font-light">Load a packet ID to begin.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'brad' && (
                          <img src="/apple-icon.png" alt="Brad" className="w-6 h-6 rounded shrink-0" />
                        )}
                        <div className={`p-4 rounded-[16px] text-sm font-light max-w-[80%] ${msg.role === 'user' ? 'bg-[#007C7A] text-white' : 'bg-white border border-gray-200 text-gray-800 shadow-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex gap-2 mb-4">
                  {['Correction', 'Feedback', 'Suggestion'].map((tag) => (
                    <button key={tag} type="button" className="px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs font-light text-muted hover:bg-gray-100 transition-colors">{tag}</button>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder={isPacketLoaded ? 'Type your feedback here...' : 'Load a packet first'}
                    disabled={!isPacketLoaded}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendFeedback()}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#007C7A] focus:bg-white transition-all disabled:opacity-50"
                  />
                  <button type="button"
                    disabled={!isPacketLoaded || !chatInput.trim()}
                    onClick={handleSendFeedback}
                    className="bg-[#69A7A3] text-white px-8 py-3 rounded-full shadow-md hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    Send
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================== SIGNATURE TRACKER TAB ==================== */}
        {activeTab === 'SIGNATURE TRACKER' && (
          <div className="animate-fade-in min-h-[500px]">
            <div className="mb-10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-xl text-[#007C7A] mb-1">Signature Tracker</h2>
                <p className="text-xs text-disabled font-light">Monitor open documents pending signature. Tasks have a 15-day due date and 90-day expiration.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded text-xs font-medium border border-yellow-100">3 Pending</span>
                <span className="px-3 py-1 bg-red-50 text-red-700 rounded text-xs font-medium border border-red-100">0 Overdue</span>
              </div>
            </div>

            <div className="space-y-4">
              {MOCK_SIGNATURES.map((sig, i) => {
                const open = openSig === sig.id;
                const signedCount = sig.roster.filter((r) => r.signed).length;
                return (
                <div key={i} className="overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-sm">
                  <div className="flex cursor-pointer flex-col justify-between gap-4 p-6 md:flex-row md:items-center" onClick={() => setOpenSig(open ? null : sig.id)}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{sig.id}</h3>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium uppercase tracking-wider">{sig.status}</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#007C7A]">{open ? '▲ Hide signers' : '▼ View signers'}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{sig.template}</p>
                      <p className="text-xs font-light text-muted mt-1">Context: {sig.event}</p>
                      <div className="mt-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        <span className="text-xs font-medium text-ink">Waiting on: <span className="font-light text-muted">{sig.signers}</span></span>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-4 md:gap-2 md:items-end bg-gray-50 p-4 rounded-[16px] shrink-0 border border-gray-100" onClick={(e) => e.stopPropagation()}>
                      <div className="text-left md:text-right">
                        <div className="text-[10px] font-medium text-disabled uppercase tracking-widest mb-1">DUE DATE (15 DAYS)</div>
                        <div className="text-sm font-medium text-gray-900">{sig.due}</div>
                      </div>
                      <div className="hidden md:block w-full h-px bg-gray-200"></div>
                      <div className="w-px h-8 bg-gray-200 md:hidden"></div>
                      <div className="text-left md:text-right">
                        <div className="text-[10px] font-medium text-disabled uppercase tracking-widest mb-1">EXPIRES (90 DAYS)</div>
                        <div className="text-sm font-medium text-muted">{sig.expires}</div>
                      </div>
                      <button type="button" className="hidden md:block mt-2 text-xs font-medium text-[#007C7A] hover:underline">Send Reminder</button>
                    </div>
                  </div>

                  {open && (
                    <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-5">
                      <div className="mb-3 text-[10px] font-medium uppercase tracking-widest text-disabled">Signer roster · {signedCount} of {sig.roster.length} signed</div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {sig.roster.map((r, j) => (
                          <div key={j} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{r.name}</p>
                              <p className="text-[11px] font-light text-muted">{r.role}</p>
                            </div>
                            {r.signed ? (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-teal-700">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Signed
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-orange-600">
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Pending
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default EvidenceStudio;
