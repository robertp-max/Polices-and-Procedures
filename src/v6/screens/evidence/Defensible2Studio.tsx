// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Defensible2StudioLanding from './Defensible2StudioLanding';
import { CesEvidenceSearch } from './CesEvidenceSearch';
import { CalendarApi } from '../../../policy/services/calendarApi';
import { ecignApi } from '../../../policy/ecign/api';
import { getEcignSignerIdentity } from '../../../policy/ecign/signerIdentity';

// Color-code the real Drive folders by name so the grid keeps its event-domain palette.
const FOLDER_PALETTE = ['text-[#FACC15]', 'text-[#3B82F6]', 'text-[#2DD4BF]', 'text-[#FB923C]', 'text-[#A855F7]', 'text-[#22C55E]', 'text-[#EC4899]'];
const colorForFolder = (name, idx) => {
  const n = (name || '').toLowerCase();
  if (n.includes('admission') || n.includes('01_ces')) return 'text-[#3B82F6]';
  if (n.includes('mock')) return 'text-[#FB923C]';
  if (n.includes('event packet')) return 'text-[#2DD4BF]';
  if (n.includes('brad') || n.includes('training')) return 'text-[#A855F7]';
  return FOLDER_PALETTE[idx % FOLDER_PALETTE.length];
};

// --- MOCK DATA ---
const TEMPLATES = [
  { id: 'CI-HH-ADM-001', name: 'Patient Admission Packet', desc: 'Full patient admission agreement with 42 CFR § 484.50 rights and all standard consents.', tags: ['ADMISSION', 'REQUIRED'], requiresEvent: false },
  { id: 'QAPI-QRT-001', name: 'QAPI Quarterly Committee Meeting', desc: 'Full quarterly QAPI committee review with KPIs, PIPs, incidents, infection control, chart audits.', tags: ['ACHC REQUIRED', 'QUARTERLY', '8 FORMS'], requiresEvent: true },
  { id: 'QAPI-MTH-001', name: 'QAPI Monthly Committee Meeting', desc: 'Monthly QAPI committee review: rolling KPIs, open PIPs, new incidents, complaints.', tags: ['ACHC REQUIRED', 'MONTHLY', '9 FORMS'], requiresEvent: true },
  { id: 'GOV-BRD-001', name: 'Governing Body / Board Meeting', desc: 'Annual or quarterly governing body review of agency operations, financials, compliance.', tags: ['CMS REQUIRED', 'ANNUAL / QUARTERLY', '5 FORMS'], requiresEvent: true },
  { id: 'INC-REV-001', name: 'Patient Safety Committee', desc: 'Review of adverse events, near-misses, sentinel events, root cause analyses, and trends.', tags: ['BEST PRACTICE', 'QUARTERLY', '4 FORMS'], requiresEvent: true },
  { id: 'CUST-001', name: 'Custom Meeting Packet', desc: 'Build a custom packet from scratch. Define your own sections, forms, and signatures.', tags: ['FLEXIBLE', 'ANY FREQUENCY'], requiresEvent: true }
];

const templateColors = ['#FACC15', '#FB923C', '#78716C', '#22C55E', '#06B6D4', '#2563EB', '#64748B', '#A855F7', '#EC4899'];

const PAYER_ROUTES = [
  { id: 'PRIVATE_PAY', name: 'Private Pay', desc: 'Patient/family pays directly. Rate schedule, tokenized payment authorization.' },
  { id: 'LTC', name: 'Long-Term Care Insurance', desc: 'LTC insurer covers eligible services; patient responsibility for non-covered.' },
  { id: 'MA', name: 'Medicare Advantage / Private Insurance', desc: 'Prior auth, copay/coinsurance, denial responsibility.' },
  { id: 'FFS', name: 'Original Medicare (FFS)', desc: 'Part A home health benefit. $0 covered. CMS notice matrix.', badge: 'US' },
  { id: 'MEDICAL', name: 'Medi-Cal / Medicaid', desc: 'No balance billing. Legal review for any patient responsibility.' },
  { id: 'VA', name: 'VA / Workers\' Comp / Contract', desc: 'Contracted payer; authorization, scope, claim submission.' },
  { id: 'PENDING', name: 'Pending Verification', desc: 'Payer not yet confirmed. Estimates only; finalize by deadline.' },
  { id: 'NA', name: 'N/A — No Billable Services', desc: 'Administrative/intake only. No payment clauses.' }
];

const EVENTS = [
  { id: 'evt-901', title: 'Q3 2026 QAPI Review (Current)', date: '2026-09-30', endDate: '2026-10-05', completed: false, type: 'QAPI' },
  { id: 'evt-882', title: 'Q2 2026 QAPI Review (Last)', date: '2026-06-30', endDate: '2026-07-05', completed: true, type: 'QAPI' },
  { id: 'evt-875', title: 'Q1 2026 QAPI Review (Last 2)', date: '2026-03-31', endDate: '2026-04-05', completed: true, type: 'QAPI' },
  { id: 'evt-812', title: 'Patient Fall Incident - J. Doe', date: '2026-04-15', endDate: '2026-04-18', completed: false, type: 'INCIDENT' },
  { id: 'evt-801', title: 'Annual Governing Board', date: '2025-12-15', endDate: '2025-12-20', completed: true, type: 'BOARD' },
];

const MOCK_FOLDERS = [
  { name: '2026 QAPI Reviews', subtext: '4 PACKETS', color: 'text-[#FACC15]', audit: 'Audit: Clean', sync: 'Sync: 1h ago' },
  { name: 'Admissions 2026', subtext: '142 PACKETS', color: 'text-[#3B82F6]', audit: 'Audit: 2 Warn', sync: 'Sync: 5m ago' },
  { name: 'Incident Reports', subtext: '18 PACKETS', color: 'text-[#FACC15]', audit: 'Audit: Clean', sync: 'Sync: 2d ago' },
  { name: 'Governing Board', subtext: '5 PACKETS', color: 'text-[#2DD4BF]', audit: 'Audit: Clean', sync: 'Sync: 1w ago' },
  { name: 'Mock Event Packets', subtext: 'LIVE FROM DRIVE', color: 'text-[#FB923C]', audit: 'Audit: Clean', sync: 'Sync: Just now' },
  { name: 'Draft Evidence Packets', subtext: '2 DOCS', color: 'text-[#A855F7]', audit: 'Audit: Pending', sync: 'Sync: Paused' },
];

// --- ICONS ---
const GoogleDriveIcon = ({ className }) => (
  <img 
    src="/assets/media/googledrive_logo.png" 
    alt="Google Drive" 
    className={className} 
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "https://storage.googleapis.com/gweb-workspace-assets/uploads/7uffzv9dk4sn-3AGHIcGci6RiNYtjf3Lfo2-4827a14a4409138cad096de1af549f60-drive_2026-192px.optimized.svg";
    }}
  />
);

const FolderIcon = ({ className }) => (
  <svg viewBox="0 0 100 75" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 22V15C6 12.2386 8.23858 10 11 10H32.5858C33.6467 10 34.6642 10.4214 35.4142 11.1716L41.4142 17.1716C42.1642 17.9216 43.1817 18.3431 44.2426 18.3431H89C91.7614 18.3431 94 20.5817 94 23.3431V64C94 66.7614 91.7614 69 89 69H11C8.23858 69 6 66.7614 6 64V22Z" 
          stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="white" />
  </svg>
);

const DocIcon = () => (
  <svg className="w-5 h-5 text-[#747470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
);

const BRAD_LOADER_CSS = `
  @keyframes def2-rainbow-line {
    0% { filter: hue-rotate(0deg) drop-shadow(0 0 2px rgba(255,255,255,0.4)); transform: scale(1); }
    50% { filter: hue-rotate(180deg) drop-shadow(0 0 6px rgba(255,255,255,0.9)); transform: scale(1.05); }
    100% { filter: hue-rotate(360deg) drop-shadow(0 0 2px rgba(255,255,255,0.4)); transform: scale(1); }
  }
  .def2-anim-star-1 { animation: def2-rainbow-line 1.5s linear infinite; transform-origin: center; }
  .def2-anim-star-2 { animation: def2-rainbow-line 1.5s linear infinite; animation-delay: -0.5s; transform-origin: center; }
  .def2-anim-star-3 { animation: def2-rainbow-line 1.5s linear infinite; animation-delay: -1s; transform-origin: center; }
  @keyframes def2-slide-progress {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(250%); }
  }
  .def2-animate-progress { animation: def2-slide-progress 2s ease-in-out infinite; }
`;

const OutlineStar = ({ className, animClass }) => (
  <svg viewBox="0 0 100 100" className={`absolute z-20 ${className} ${animClass}`} overflow="visible" aria-hidden="true">
    <defs>
      <linearGradient id="def2BradRainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="33%" stopColor="#9B72CB" />
        <stop offset="66%" stopColor="#D96570" />
        <stop offset="100%" stopColor="#F9AB00" />
      </linearGradient>
    </defs>
    <path
      d="M 50 2 C 50 25, 25 50, 2 50 C 25 50, 50 75, 50 98 C 50 75, 75 50, 98 50 C 75 50, 50 25, 50 2 Z"
      fill="none"
      stroke="url(#def2BradRainbowGrad)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BradGeneratingOverlay = () => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
    <style dangerouslySetInnerHTML={{ __html: BRAD_LOADER_CSS }} />
    <div className="pointer-events-auto relative z-10 w-full max-w-[480px] rounded-[24px] border border-gray-100 bg-white p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:p-10">
      <div className="relative mx-auto mb-8 h-28 w-28">
        <img src="https://careindeed.com/apple-icon.png?2e01fae8dd8e47f4" alt="Care Indeed" className="relative z-10 block h-full w-full object-contain" />
        <OutlineStar className="h-[26%] w-[26%] -right-[2%] -top-[2%]" animClass="def2-anim-star-1" />
        <OutlineStar className="h-[18%] w-[18%] -bottom-[4%] left-[2%]" animClass="def2-anim-star-2" />
        <OutlineStar className="h-[8%] w-[8%] left-[12%] top-[25%]" animClass="def2-anim-star-3" />
      </div>
      <h2 className="mb-2 text-lg font-bold tracking-tight text-gray-900">Brad is generating the packet</h2>
      <p className="mb-8 text-[13px] font-medium text-gray-700">Brad is mapping content to packet sections...</p>
      <div className="w-full">
        <div className="relative mb-4 h-1 w-full overflow-hidden rounded-full bg-gray-200/50">
          <div className="def2-animate-progress absolute bottom-0 left-0 top-0 w-1/3 rounded-full bg-[#008080]" />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="font-semibold text-[#008080]">Step 2 of 5</span>
          <span className="font-medium text-gray-600">Content Mapping</span>
        </div>
      </div>
    </div>
  </div>
);

const GoogleUploadingOverlay = () => (
  <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
    <div className="pointer-events-auto w-full max-w-[460px] rounded-[24px] border border-gray-100 bg-white p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:p-10">
      <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
        <GoogleDriveIcon className="relative z-10 h-20 w-20" />
        <div className="absolute inset-0 rounded-full border-[6px] border-[#EAE4E3] border-t-[#007970] animate-spin" />
      </div>
      <h2 className="mb-2 text-lg font-bold tracking-tight text-gray-900">Uploading to Google Drive</h2>
      <p className="mb-8 text-[13px] font-medium text-gray-700">Saving the generated packet and attaching the real document preview...</p>
      <div className="flex items-center justify-center gap-2 text-xs">
        <span className="font-semibold text-[#008080]">Step 4 of 5</span>
        <span className="font-medium text-gray-600">Drive Sync</span>
      </div>
    </div>
  </div>
);

const CareIndeedMark = ({ small = false }) => (
  <div className={`flex items-center gap-2 ${small ? 'scale-75 origin-left' : ''}`}>
    <div className="relative h-12 w-12">
      <div className="absolute left-4 top-0 h-5 w-5 rounded-full border-[3px] border-[#ff6b2c]" />
      <div className="absolute bottom-1 left-0 h-8 w-8 rounded-full border-[3px] border-[#ff6b2c] border-r-transparent border-t-transparent" />
      <div className="absolute bottom-0 left-2 h-7 w-7 rounded-full border-[3px] border-[#ff6b2c] border-r-transparent border-t-transparent" />
      <div className="absolute bottom-0 left-4 h-6 w-6 rounded-full border-[3px] border-[#ff6b2c] border-r-transparent border-t-transparent" />
    </div>
    <div>
      <div className="font-montserrat text-3xl font-medium leading-none text-[#3b3b3b]">CareIndeed</div>
      <div className="font-roboto text-[8px] font-medium text-[#524D4B]">The Heart of Home Health.</div>
    </div>
  </div>
);

const EcignMark = () => (
  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-white shadow-[0_10px_24px_rgba(26,55,120,0.14)]">
    <div className="relative h-8 w-8">
      <div className="absolute inset-0 rounded-full border-[3px] border-[var(--ecign-navy)]" />
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ecign-orange)]" />
      <div className="absolute -right-1 top-1/2 h-2 w-4 -translate-y-1/2 rounded-full bg-white" />
    </div>
  </div>
);

const ECIGN_VIEWS = ['My action needed', 'Waiting on others', 'Copied to me', 'Created by me', 'All open', 'Completed'];
const ECIGN_SOURCES = ['All sources', 'CES', 'Patient Admission', 'QAPI', 'Incident', 'Custom'];
const ECIGN_RELATIONSHIPS = ['All relationships', 'Assigned to me', 'Copied to me', 'Created by me'];
const CLOSED_ECIGN_STATES = new Set(['signed_locked', 'voided', 'expired', 'cancelled', 'completed']);

const addDaysIso = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const fmtShortDate = (value) => {
  if (!value) return 'Not set';
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? value : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtActivity = (value) => {
  if (!value) return 'No activity yet';
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? value : dt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};
const normalizeText = (value) => String(value ?? '').trim().toLowerCase();
const sourceForInstance = (instance) => {
  const joined = [instance.form_id, instance.workflow_instance_id, instance.event_id, instance.form_instance_id].map(normalizeText).join(' ');
  if (joined.includes('admission') || joined.includes('adm')) return 'Patient Admission';
  if (joined.includes('qapi')) return 'QAPI';
  if (joined.includes('incident') || joined.includes('inc-')) return 'Incident';
  if (joined.includes('custom')) return 'Custom';
  return 'CES';
};
const statusForItem = (item) => {
  const state = normalizeText(item.state);
  if (item.overdue && !CLOSED_ECIGN_STATES.has(state)) return 'Overdue';
  if (item.expiringSoon && !CLOSED_ECIGN_STATES.has(state)) return 'Expiring soon';
  if (state === 'signed_locked') return 'Completed';
  if (state === 'voided') return 'Cancelled';
  if (state === 'expired') return 'Expired';
  if (item.myActionNeeded) return 'Pending my signature';
  if (item.signedCount > 0 && item.signedCount < item.totalSigners) return 'Partially signed';
  if (state === 'created') return 'Draft';
  if (state === 'disclosed' || state === 'verified' || state === 'reviewed' || state === 'attested') return 'Viewed';
  return 'Sent';
};
const statusToneClass = (status) => {
  if (status === 'Overdue' || status === 'Expired') return 'bg-[#FBE6E6] text-[#D70101]';
  if (status === 'Expiring soon' || status === 'Pending my signature') return 'bg-[#FFF0E5] text-[#C74601]';
  if (status === 'Completed') return 'bg-[#E6F4ED] text-[#006B3A]';
  return 'bg-[#E5FEFF] text-[#007970]';
};
const relationshipBadgeClass = (relationship) => {
  if (relationship === 'Copied to me') return 'bg-[#F1ECFB] text-[#5B3A9B]';
  if (relationship === 'Created by me') return 'bg-[#EAF2FB] text-[#1A4E8A]';
  if (relationship === 'Waiting on others') return 'bg-[#FFF8E6] text-[#8A5C00]';
  return 'bg-[#E5FEFF] text-[#007970]';
};
const inferCreatedByCurrentUser = (instance, signer) => {
  const fields = instance.field_values || {};
  return [fields.created_by, fields.createdBy, fields.sender_user_id, fields.senderUserId, fields.generated_by, fields.generatedBy]
    .map(normalizeText)
    .includes(normalizeText(signer.id));
};
const inferCopiedToCurrentUser = (instance, signer) => {
  const fields = instance.field_values || {};
  const haystack = [
    fields.cc, fields.cc_user_ids, fields.ccUserIds, fields.copied_to, fields.copiedTo,
    fields.observers, fields.recipients,
  ].map(normalizeText).join(' ');
  return Boolean(haystack) && (haystack.includes(normalizeText(signer.id)) || haystack.includes(normalizeText(signer.email)) || haystack.includes(normalizeText(signer.name)));
};
const signerMatchesCurrentUser = (requiredSigner, signer) => {
  const values = [requiredSigner.user_id, requiredSigner.email, requiredSigner.name, requiredSigner.role].map(normalizeText);
  return values.includes(normalizeText(signer.id)) || values.includes(normalizeText(signer.email)) || values.includes(normalizeText(signer.role)) || values.includes(normalizeText(signer.name));
};
const toEcignItem = (instance, signatures, signer) => {
  const requiredSigners = Array.isArray(instance.required_signers) ? instance.required_signers : [];
  const signedFieldIds = new Set(signatures.map((sig) => String(sig.field_id ?? '')));
  const signedUserIds = new Set(signatures.map((sig) => normalizeText(sig.signer_user_id)));
  const totalSigners = Math.max(requiredSigners.length, signatures.length, 1);
  const signedCount = normalizeText(instance.state) === 'signed_locked' ? totalSigners : signatures.length;
  const assignedToMe = requiredSigners.some((rs) => signerMatchesCurrentUser(rs, signer));
  const copiedToMe = inferCopiedToCurrentUser(instance, signer);
  const createdByMe = inferCreatedByCurrentUser(instance, signer);
  const myUnsignedRequirement = requiredSigners.find((rs) => signerMatchesCurrentUser(rs, signer) && !signedFieldIds.has(String(rs.field_id ?? '')) && !signedUserIds.has(normalizeText(signer.id)));
  const dueDate = instance.field_values?.due_date || instance.field_values?.dueDate || addDaysIso(15);
  const expirationDate = instance.retention_until_utc || instance.field_values?.expiration_date || instance.field_values?.expirationDate || addDaysIso(90);
  const dueMs = new Date(dueDate).getTime();
  const expMs = new Date(expirationDate).getTime();
  const now = Date.now();
  const overdue = !Number.isNaN(dueMs) && dueMs < now && normalizeText(instance.state) !== 'signed_locked';
  const expiringSoon = !Number.isNaN(expMs) && expMs >= now && expMs < now + 7 * 24 * 60 * 60 * 1000;
  const relationship = assignedToMe && myUnsignedRequirement ? 'Assigned to me' : copiedToMe ? 'Copied to me' : createdByMe ? 'Created by me' : 'Waiting on others';
  const waiting = myUnsignedRequirement?.role || requiredSigners.find((rs) => !signedFieldIds.has(String(rs.field_id ?? '')))?.role || 'No one';
  const item = {
    id: instance.instance_id,
    title: instance.field_values?.packet_title || instance.field_values?.title || instance.form_id || 'eCIgn packet',
    context: instance.field_values?.context || instance.field_values?.event_name || instance.event_id || instance.workflow_instance_id || 'No context label',
    source: sourceForInstance(instance),
    state: instance.state,
    signedCount,
    totalSigners,
    waiting,
    dueDate,
    expirationDate,
    lastActivity: signatures[signatures.length - 1]?.signed_at_utc || instance.locked_at_utc || instance.created_at_utc,
    relationship,
    assignedToMe,
    copiedToMe,
    createdByMe,
    myActionNeeded: Boolean(myUnsignedRequirement) && !CLOSED_ECIGN_STATES.has(normalizeText(instance.state)),
    canManage: createdByMe || normalizeText(signer.role).includes('administrator') || normalizeText(signer.role).includes('director'),
    overdue,
    expiringSoon,
    eventId: instance.event_id,
    workflowId: instance.workflow_instance_id,
  };
  item.status = statusForItem(item);
  return item;
};

function EcignWorkspacePanel({ createdPackets = [] }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState('My action needed');
  const [query, setQuery] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('All relationships');
  const [sourceFilter, setSourceFilter] = useState('All sources');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [dueFilter, setDueFilter] = useState('Any due date');
  const [reminders, setReminders] = useState({});
  const [showComingSoon, setShowComingSoon] = useState(false);
  const signer = useMemo(() => getEcignSignerIdentity(), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.resolve()
      .then(async () => {
        const instances = await ecignApi.listInstances();
        const hydrated = await Promise.all(instances.map(async (instance) => {
          try {
            const signatures = await ecignApi.listSignatures(String(instance.instance_id));
            return toEcignItem(instance, signatures, signer);
          } catch {
            return toEcignItem(instance, [], signer);
          }
        }));
        return hydrated;
      })
      .then((hydrated) => {
        if (!active) return;
        const locallyCreated = createdPackets.map((packet) => ({
          id: packet.id,
          title: packet.template,
          context: packet.event,
          source: sourceForInstance({ form_id: packet.template, event_id: packet.event, field_values: {} }),
          status: 'Sent',
          state: 'sent',
          signedCount: 0,
          totalSigners: 1,
          waiting: 'Recipient',
          dueDate: addDaysIso(15),
          expirationDate: addDaysIso(90),
          lastActivity: new Date().toISOString(),
          relationship: 'Created by me',
          assignedToMe: false,
          copiedToMe: false,
          createdByMe: true,
          myActionNeeded: false,
          canManage: true,
          overdue: false,
          expiringSoon: false,
          eventId: packet.event,
          workflowId: '',
        }));
        setItems([...hydrated, ...locallyCreated]);
        setError('');
      })
      .catch((err) => {
        if (!active) return;
        setItems(createdPackets.map((packet) => ({
          id: packet.id,
          title: packet.template,
          context: packet.event,
          source: sourceForInstance({ form_id: packet.template, event_id: packet.event, field_values: {} }),
          status: 'Sent',
          state: 'sent',
          signedCount: 0,
          totalSigners: 1,
          waiting: 'Recipient',
          dueDate: addDaysIso(15),
          expirationDate: addDaysIso(90),
          lastActivity: new Date().toISOString(),
          relationship: 'Created by me',
          assignedToMe: false,
          copiedToMe: false,
          createdByMe: true,
          myActionNeeded: false,
          canManage: true,
          overdue: false,
          expiringSoon: false,
          eventId: packet.event,
          workflowId: '',
        })));
        setError(err instanceof Error ? err.message : 'eCIgn backend unavailable');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [createdPackets, signer]);

  const statuses = useMemo(() => ['All statuses', ...Array.from(new Set(items.map((item) => item.status)))], [items]);
  const openItems = items.filter((item) => !['Completed', 'Expired', 'Cancelled'].includes(item.status));
  const metrics = [
    ['Assigned to me', openItems.filter((item) => item.assignedToMe).length],
    ['Waiting on others', openItems.filter((item) => item.relationship === 'Waiting on others').length],
    ['Copied to me', openItems.filter((item) => item.copiedToMe).length],
    ['Created by me', openItems.filter((item) => item.createdByMe).length],
    ['Overdue', openItems.filter((item) => item.overdue).length],
    ['Expiring soon', openItems.filter((item) => item.expiringSoon).length],
  ];
  const filtered = items.filter((item) => {
    if (view === 'My action needed' && !item.myActionNeeded) return false;
    if (view === 'Waiting on others' && item.relationship !== 'Waiting on others') return false;
    if (view === 'Copied to me' && !item.copiedToMe) return false;
    if (view === 'Created by me' && !item.createdByMe) return false;
    if (view === 'All open' && ['Completed', 'Expired', 'Cancelled'].includes(item.status)) return false;
    if (view === 'Completed' && item.status !== 'Completed') return false;
    if (relationshipFilter !== 'All relationships' && item.relationship !== relationshipFilter) return false;
    if (sourceFilter !== 'All sources' && item.source !== sourceFilter) return false;
    if (statusFilter !== 'All statuses' && item.status !== statusFilter) return false;
    if (dueFilter === 'Overdue' && !item.overdue) return false;
    if (dueFilter === 'Expiring soon' && !item.expiringSoon) return false;
    const haystack = [item.id, item.title, item.context, item.source, item.status, item.waiting, item.eventId, item.workflowId].map(normalizeText).join(' ');
    return !query.trim() || haystack.includes(normalizeText(query));
  });
  const sendReminder = (item) => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const existing = reminders[item.id];
    if (existing?.day === todayKey) {
      setReminders({ ...reminders, [item.id]: { ...existing, blocked: true } });
      return;
    }
    setReminders({ ...reminders, [item.id]: { day: todayKey, at: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), blocked: false } });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="rounded-[32px] bg-white/95 p-6 shadow-md md:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-[#EAE4E3] pb-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <EcignMark />
            <div>
              <h2 className="font-montserrat text-2xl font-medium text-[#1F1C1B]">eCIgn</h2>
              <p className="font-roboto text-sm font-light text-[#747470]">Track packets assigned to you, copied to you, or created by you.</p>
              <p className="mt-1 font-roboto text-[11px] text-[#747470]">Signed in as {signer.name} · {signer.role}</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowComingSoon(true)} className="rounded-[16px] border border-[#EAE4E3] bg-[#FAFBF8] px-4 py-3 text-left shadow-sm">
            <span className="font-montserrat text-xs font-semibold text-[#1F1C1B]">Create custom eCIgn packet</span>
            <span className="ml-2 rounded bg-[#FFF0E5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#C74601]">Coming soon</span>
            <span className="block font-roboto text-[11px] text-[#747470]">Send a custom packet outside a CES event.</span>
          </button>
        </div>
        {error && <div className="mb-5 rounded-[14px] bg-[#FFF8E6] px-4 py-3 text-xs text-[#8A5C00]">Live eCIgn data is unavailable: {error}. Showing only packets created in this session.</div>}
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-[18px] bg-[#FAFBF8] p-4 shadow-sm">
              <div className="font-montserrat text-[10px] font-semibold uppercase tracking-widest text-[#747470]">{label}</div>
              <div className="mt-2 font-montserrat text-2xl font-medium text-[#004142]">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] bg-white/95 p-5 shadow-md">
        <div className="mb-4 flex flex-wrap gap-2">
          {ECIGN_VIEWS.map((chip) => (
            <button key={chip} type="button" onClick={() => setView(chip)} className={`rounded-full px-4 py-2 text-xs font-medium ${view === chip ? 'bg-[#E5FEFF] text-[#007970]' : 'bg-[#FAFBF8] text-[#524D4B] hover:bg-[#F1FAFA]'}`}>{chip}</button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search packet ID, title, signer, event, workflow, status" className="rounded-[14px] bg-[#FAFBF8] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#C4F4F5] md:col-span-2" />
          <select value={relationshipFilter} onChange={(e) => setRelationshipFilter(e.target.value)} className="rounded-[14px] bg-[#FAFBF8] px-3 py-3 text-sm outline-none">{ECIGN_RELATIONSHIPS.map((x) => <option key={x}>{x}</option>)}</select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="rounded-[14px] bg-[#FAFBF8] px-3 py-3 text-sm outline-none">{ECIGN_SOURCES.map((x) => <option key={x}>{x}</option>)}</select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-[14px] bg-[#FAFBF8] px-3 py-3 text-sm outline-none">{statuses.map((x) => <option key={x}>{x}</option>)}</select>
          <select value={dueFilter} onChange={(e) => setDueFilter(e.target.value)} className="rounded-[14px] bg-[#FAFBF8] px-3 py-3 text-sm outline-none md:col-start-5">
            {['Any due date', 'Overdue', 'Expiring soon'].map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {loading && <div className="rounded-[24px] bg-white/95 p-8 text-sm text-[#747470] shadow-md">Loading eCIgn packets...</div>}
        {!loading && filtered.length === 0 && <div className="rounded-[24px] bg-white/95 p-8 text-sm text-[#747470] shadow-md">No eCIgn packets match this view.</div>}
        {!loading && filtered.map((item) => (
          <article key={item.id} className="rounded-[24px] bg-white p-6 shadow-md">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-montserrat text-sm font-semibold text-[#1F1C1B]">{item.id}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusToneClass(item.status)}`}>{item.status}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${relationshipBadgeClass(item.relationship)}`}>{item.relationship}</span>
                </div>
                <h3 className="font-montserrat text-lg font-medium text-[#1F1C1B]">{item.title}</h3>
                <p className="mt-1 font-roboto text-sm text-[#747470]">Context: {item.context}</p>
                <div className="mt-4 grid gap-3 text-xs text-[#524D4B] md:grid-cols-3">
                  <div><span className="font-semibold text-[#747470]">Source</span><br />{item.source}</div>
                  <div><span className="font-semibold text-[#747470]">Signers</span><br />{item.signedCount} of {item.totalSigners} signed</div>
                  <div><span className="font-semibold text-[#747470]">Waiting on</span><br />{item.waiting}</div>
                  <div><span className="font-semibold text-[#747470]">Due</span><br />{fmtShortDate(item.dueDate)}</div>
                  <div><span className="font-semibold text-[#747470]">Expires</span><br />{fmtShortDate(item.expirationDate)}</div>
                  <div><span className="font-semibold text-[#747470]">Last activity</span><br />{fmtActivity(item.lastActivity)}</div>
                </div>
              </div>
              <div className="flex min-w-[180px] flex-col gap-2">
                {item.myActionNeeded ? (
                  <a href={`/forms/${encodeURIComponent(item.title)}/esign?form_instance_id=${encodeURIComponent(item.id)}`} className="rounded-[14px] bg-[#007970] px-4 py-2 text-center text-xs font-semibold text-white hover:bg-[#005451]">Review &amp; sign</a>
                ) : (
                  <a href={`/forms/${encodeURIComponent(item.title)}/esign?form_instance_id=${encodeURIComponent(item.id)}`} className="rounded-[14px] border border-[#EAE4E3] bg-[#FAFBF8] px-4 py-2 text-center text-xs font-semibold text-[#007970] hover:bg-[#E5FEFF]">View packet</a>
                )}
                {(item.canManage || item.relationship === 'Waiting on others') && !item.copiedToMe && (
                  <button type="button" onClick={() => sendReminder(item)} className="rounded-[14px] border border-[#EAE4E3] px-4 py-2 text-xs font-semibold text-[#524D4B] hover:bg-[#FAFBF8]">Send reminder</button>
                )}
                {reminders[item.id]?.blocked && <span className="text-[11px] text-[#8A5C00]">Reminder already sent today.</span>}
                {reminders[item.id]?.at && !reminders[item.id]?.blocked && <span className="text-[11px] text-[#007970]">Reminder sent today at {reminders[item.id].at}.</span>}
              </div>
            </div>
          </article>
        ))}
      </div>

      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F1C1B]/35 p-4 backdrop-blur-sm">
          <div className="max-w-md rounded-[28px] bg-white p-7 shadow-2xl">
            <div className="mb-4 flex items-center gap-3"><EcignMark /><h3 className="font-montserrat text-xl font-medium text-[#1F1C1B]">Create custom eCIgn packet</h3></div>
            <p className="font-roboto text-sm leading-relaxed text-[#524D4B]">Custom packet generation outside a CES event will be available later. This button does not create placeholder packets or launch a broken workflow.</p>
            <button type="button" onClick={() => setShowComingSoon(false)} className="mt-6 rounded-[14px] bg-[#007970] px-5 py-2 text-sm font-semibold text-white">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

const PacketPage = ({ page, pageNumber, compact = false, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative shrink-0 overflow-hidden rounded-[10px] bg-white text-left shadow-[0_24px_55px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-1 ${compact ? 'h-[860px] w-[620px]' : 'h-[680px] w-[390px] md:h-[760px] md:w-[500px]'}`}
    style={{
      backgroundImage: 'linear-gradient(90deg, rgba(0,121,112,0.035) 1px, transparent 1px), linear-gradient(rgba(0,121,112,0.035) 1px, transparent 1px), linear-gradient(112deg, #ffffff 0%, #ffffff 42%, #dbffff 100%)',
      backgroundSize: '28px 28px, 28px 28px, cover',
    }}
  >
    <div className="absolute left-0 right-0 top-0 h-2 bg-[#005451]" />
    <div className="absolute right-0 top-0 h-2 w-28 bg-[#d34800]" />
    <div className={`${compact ? 'p-16' : 'p-9 md:p-12'} flex h-full flex-col`}>
      <div className="flex items-start justify-between gap-8">
        {pageNumber === 1 ? <CareIndeedMark /> : <CareIndeedMark small />}
        <div className="text-right">
          <p className="font-montserrat text-[11px] font-bold uppercase tracking-[0.24em] text-[#00858a]">{page.code}</p>
          <p className="font-montserrat mt-2 text-xs uppercase tracking-[0.16em] text-[#747470]">{page.kicker}</p>
          <p className="font-montserrat mt-4 text-[11px] uppercase tracking-[0.18em] text-[#747470]">Packet ID</p>
          <p className="font-montserrat mt-1 text-xs font-bold tracking-[0.16em] text-[#005451]">QAPI_MEETING-20260507-08-1</p>
        </div>
      </div>

      <div className={pageNumber === 1 ? 'mt-24' : 'mt-10'}>
        <p className="font-montserrat text-[11px] font-bold uppercase tracking-[0.32em] text-[#d34800]">{page.label}</p>
        <h3 className={`${compact ? 'text-5xl' : 'text-3xl md:text-4xl'} mt-5 font-montserrat font-bold uppercase leading-tight text-[#004142]`}>{page.title}</h3>
        <div className="mt-9 h-1 w-28 rounded-full bg-gradient-to-r from-[#d34800] to-[#00a8a8]" />
        <p className={`${compact ? 'text-2xl' : 'text-lg'} mt-8 font-roboto font-light text-[#747470]`}>{page.subtitle}</p>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-5">
        {page.blocks.map((block) => (
          <div key={block.title} className="rounded-[14px] bg-white/82 p-5 shadow-[0_8px_28px_rgba(0,121,112,0.08)]">
            <p className="font-montserrat text-[11px] font-bold uppercase tracking-[0.18em] text-[#00858a]">{block.title}</p>
            <p className="mt-4 whitespace-pre-line font-roboto text-sm leading-relaxed text-[#524D4B]">{block.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-end justify-between border-t border-[#cceeed] pt-5">
        <p className="font-roboto text-[10px] font-bold text-[#00858a]">Care Indeed Home Health<br />890 Santa Cruz Ave # B, Menlo Park, CA 94025</p>
        <p className="text-right font-roboto text-[10px] font-bold text-[#005451]">Packet qapi_meeting-20260507-08-1<br />Page {pageNumber}</p>
      </div>
    </div>
  </button>
);

// Circular Arc 3D Button Component for Step 3 - Fully Responsive
const CircularDataSourceButton = ({ title, desc, icon, strokeColor, onClick }) => (
  <div className="relative flex flex-col items-center justify-center w-40 h-40 md:w-52 md:h-52 group cursor-pointer" onClick={onClick}>
    <svg className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-500 group-hover:scale-105" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="44" fill="none" stroke="#EAE4E3" strokeWidth="1.5" />
      <circle cx="50" cy="50" r="44" fill="none" stroke={strokeColor} strokeWidth="5" />
    </svg>
    <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full flex flex-col items-center justify-center p-2 md:p-4 text-center shadow-[0_12px_30px_rgba(0,0,0,0.08),0_2px_10px_rgba(0,0,0,0.04)] active:shadow-[inset_0_6px_12px_rgba(0,0,0,0.1)] active:translate-y-1 transition-all z-10 border-none">
      <div className="text-[#524D4B] mb-1 md:mb-2 group-hover:scale-110 transition-transform duration-300 transform scale-75 md:scale-100">
        {icon}
      </div>
      <div className="font-montserrat font-bold text-[9px] md:text-[11px] text-[#1F1C1B] tracking-wider uppercase md:mb-1">{title}</div>
      <div className="font-roboto text-[7px] md:text-[8px] text-[#747470] font-light leading-tight hidden md:block">{desc}</div>
    </div>
  </div>
);


export function Defensible2Studio(_props?: { initialTab?: string }) {
  const [activeTab, setActiveTab] = useState('CREATE PACKET');
  const [studioGenerating, setStudioGenerating] = useState(false);
  const [studioSaveStatus, setStudioSaveStatus] = useState('idle');
  const [folderPackets, setFolderPackets] = useState([]);

  // --- STUDIO STATE ---
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedPayerRoute, setSelectedPayerRoute] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dataSource, setDataSource] = useState('');
  
  // --- DRIVE SYNC STATE ---
  const [driveSyncStatus, setDriveSyncStatus] = useState('idle'); 

  // --- MODAL STATE ---
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sourceModalType, setSourceModalType] = useState(''); 
  const [selectedDriveFolder, setSelectedDriveFolder] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [signers, setSigners] = useState([]);
  const [editPacketId, setEditPacketId] = useState('');
  const [isPacketLoaded, setIsPacketLoaded] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [previewPage, setPreviewPage] = useState(0);
  const [compilePhase, setCompilePhase] = useState('idle');
  const [zoomPage, setZoomPage] = useState(null);
  // Real Drive folders from the manifest (source of truth). Loaded when the DRIVE
  // tab opens; each folder card opens its real Google Drive URL in a new tab.
  const [realFolders, setRealFolders] = useState([]);
  const [foldersErr, setFoldersErr] = useState(null);
  useEffect(() => {
    if (activeTab !== 'DRIVE') return;
    let on = true;
    CalendarApi.manifestFolders()
      .then((r) => { if (on) { setRealFolders(r.folders || []); setFoldersErr(r.error ?? null); } })
      .catch((e) => { if (on) { setRealFolders([]); setFoldersErr(e instanceof Error ? e.message : 'Manifest unavailable'); } });
    return () => { on = false; };
  }, [activeTab]);

  const handleStudioGeneratingChange = useCallback((active) => {
    setStudioGenerating(active);
    if (active) setStudioSaveStatus('idle');
  }, []);

  const handlePacketSaveStatusChange = useCallback((status) => {
    setStudioSaveStatus(status);
  }, []);

  useEffect(() => {
    if (step === 5) {
      setDriveSyncStatus('loading');
      const timer = setTimeout(() => {
        setDriveSyncStatus('synced');
      }, 2500); 
      return () => clearTimeout(timer);
    } else {
      setDriveSyncStatus('idle');
    }
  }, [step]);

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
        setChatMessages(prev => [...prev, { role: 'brad', text: 'Evidence rules checked. I have logged this feedback and updated the packet draft audit trail. Anything else?' }]);
      }, 1000);
    }
  };

  const handleCompilePacket = () => {
    setCompilePhase('brad');
    window.setTimeout(() => setCompilePhase('sync'), 1800);
    window.setTimeout(() => {
      setCompilePhase('idle');
      setPreviewPage(0);
      setStep(5);
    }, 3900);
  };

  const handleTemplateSelect = (t) => {
    setSelectedTemplate(t);
    if(t.id === 'CI-HH-ADM-001') {
      setSigners([
        { role: 'Patient / Representative', name: 'Eleanor Rose Whitfield' },
        { role: 'Admitting Clinician (RN)', name: 'Sarah Jenkins' }
      ]);
      setStep(2); 
    } else {
      setSigners([
        { role: 'Director of Nursing', name: 'Sarah Jenkins' },
        { role: 'Medical Director', name: 'Dr. Aris Thorne' },
        { role: 'Administrator', name: 'Michael Chen' },
        { role: 'Quality Assurance Lead', name: 'Elena Rodriguez' }
      ]);
      setStep(2); 
    }
  };

  const getFilteredEvents = () => {
    if (!selectedTemplate) return EVENTS;
    if (selectedTemplate.id.includes('QAPI')) {
      return EVENTS.filter(e => e.type === 'QAPI');
    }
    return EVENTS;
  };

  const handleDataSourceClick = (sourceType) => {
    setSourceModalType(sourceType);
    setShowSourceModal(true);
    setSelectedDriveFolder(null); 
  };

  const addLocalFiles = (files) => {
    const nextFiles = Array.from(files || []).map((file) => ({
      name: file.name,
      size: file.size,
      source: 'Upload',
    }));
    if (nextFiles.length) {
      setUploadedFiles((prev) => [...prev, ...nextFiles]);
    }
  };

  const addCameraFiles = (files) => {
    const nextFiles = Array.from(files || []).map((file, index) => ({
      name: file.name || `Camera capture ${uploadedFiles.length + index + 1}`,
      size: file.size,
      source: 'Camera',
    }));
    if (nextFiles.length) {
      setUploadedFiles((prev) => [...prev, ...nextFiles]);
    }
  };

  const confirmDataSource = () => {
    setDataSource(sourceModalType);
    setShowSourceModal(false);
    setStep(4);
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
    const newPacket = {
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

  const navTabs = ['DRIVE', 'CREATE PACKET', 'EDIT PACKET', 'eCIgn'];
  const previewPages = [
    {
      title: selectedTemplate?.name || 'Evidence Packet',
      eyebrow: selectedTemplate?.id || 'PKT-DRAFT',
      code: 'QAPI_QUARTERLY-2026-Q2',
      kicker: 'Internal Governance Packet',
      label: 'Care Indeed Home Health',
      section: 'Cover + Audit Routing',
      accent: '#C74601',
      subtitle: 'Q2 2026 • Executive Briefing & Pre-Read Dossier',
      blocks: [
        { title: 'Meeting Details', body: 'Date        May 7, 2026\nTime        10:00 AM - 12:00 PM\nLocation    Conference Room / Zoom\nChair       TBD' },
        { title: 'Packet Purpose', body: 'This packet supports the QAPI quarterly committee meeting review process with required documentation, data, and signature blocks.' },
      ],
      rows: ['Agency: Care Indeed Home Health', `Context: ${selectedEvent?.title || selectedPayerRoute?.name || 'Selected event'}`, `Source: ${dataSource || 'Uploaded evidence'}`],
    },
    {
      title: 'Evidence Index',
      eyebrow: 'CONTENTS',
      code: 'TOC',
      kicker: 'Table of Contents & Packet Control',
      label: 'Packet Checklist',
      section: 'Mapped Artifacts',
      accent: '#007970',
      subtitle: 'Checklist confirms source documents, minutes, dashboards, and signature lines are present.',
      blocks: [
        { title: 'Packet Checklist', body: 'Pre-read distributed\nAction item tracker\nInfection line list\nChart audit summary\nAll signature lines present' },
        { title: 'Packet Control', body: 'Prior minutes attached\nThree months dashboards included\nActive PIP status included\nGoverning body report included' },
      ],
      rows: ['Uploaded source documents', 'Google Drive evidence link', 'Required forms crosswalk'],
    },
    {
      title: 'Meeting Agenda & Quorum Roster',
      eyebrow: 'AGENDA',
      code: 'AGENDA',
      kicker: 'Meeting Agenda & Quorum Roster',
      label: 'Attendees Expected',
      section: 'Rules + Hashes',
      accent: '#008540',
      subtitle: 'Agenda packet with expected attendees, presenters, timing, and quorum checkpoints.',
      blocks: [
        { title: 'Attendees Expected', body: 'Dakota Director\nRiley RN\nBailey Billing\nCameron Compliance\nMorgan MD\nAvery Admin' },
        { title: 'Agenda', body: 'Call to order\nApprove prior minutes\nReview action tracker\nQ2 dashboard review\nPIP status\nOpen discussion' },
      ],
      rows: ['Event rules passed', 'Signer roles mapped', 'Immutable audit hash initialized'],
    },
    {
      title: 'Signature Packet',
      eyebrow: 'ROUTING',
      code: 'SIGN',
      kicker: 'Signature Routing',
      label: 'Signer Workflow',
      section: 'Signer Workflow',
      accent: '#FFC700',
      subtitle: 'Mapped signer sequence and task assignments for final approval routing.',
      blocks: [
        { title: 'Required Signers', body: signers.map((s) => s.name).join('\n') || 'Assigned signers' },
        { title: 'Routing Rules', body: '15-day due date\n90-day expiration\nReminder schedule active' },
      ],
      rows: signers.slice(0, 3).map((s) => `${s.name} — ${s.role}`),
    },
    {
      title: 'Final Filing',
      eyebrow: 'DRIVE',
      code: 'ARCHIVE',
      kicker: 'Drive Filing Control',
      label: 'Archive Status',
      section: 'Export + Archive',
      accent: '#2563EB',
      subtitle: 'Final storage, retention, and audit hash packet controls.',
      blocks: [
        { title: 'Drive Filing', body: 'Folder prepared\nRetention class assigned\nEvidence lock enabled' },
        { title: 'Audit Controls', body: 'Hash initialized\nTimestamp retained\nReady for signer routing' },
      ],
      rows: ['Drive folder prepared', 'Retention class assigned', 'Packet ready for routing'],
    },
  ];

  return (
    <div
      className="min-h-screen overflow-hidden bg-transparent font-roboto text-[#1F1C1B]"
      data-hash-id="defensible-2"
      data-route="/evidence/defensible-2"
      data-template="evidence"
      style={{ overflowAnchor: 'none' }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-roboto { font-family: 'Roboto', sans-serif; }
        @keyframes slide-progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        ::-webkit-scrollbar { display: none; }
        * { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-10 md:py-12">
        <div className="mb-10 flex justify-center">
          <div className="grid w-full max-w-[560px] grid-cols-4 rounded-full border border-white/80 bg-white/80 p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md">
            {navTabs.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`min-h-[42px] rounded-full px-3 py-2 font-montserrat text-[10px] font-bold uppercase tracking-[0.12em] transition-all md:text-xs ${
                  activeTab === tab
                    ? 'bg-[#007970] text-white shadow-[0_8px_18px_rgba(0,121,112,0.22)]'
                    : 'text-[#718096] hover:bg-[#F4F7F7] hover:text-[#1F1C1B]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ==================================================== */}
        {/* DRIVE TAB (Folder View) */}
        {/* ==================================================== */}
        {activeTab === 'DRIVE' && (
          <div className="animate-fade-in min-h-[720px]">
            <div className="mb-10 pb-6 flex items-center gap-4">
              <GoogleDriveIcon className="w-10 h-10" />
              <div>
                <h2 className="text-xl font-montserrat text-[#1F1C1B] font-medium mb-1">Google Drive Evidence</h2>
                <p className="text-xs font-roboto text-[#747470] font-light">Folders are color-coded by event domain; documents file flat inside each event.</p>
              </div>
            </div>

            <CesEvidenceSearch />

            {(() => {
              const usingSample = !realFolders || realFolders.length === 0;
              const cards = usingSample
                ? MOCK_FOLDERS.map((f) => ({ name: f.name, subtext: f.subtext, color: f.color, audit: f.audit, sync: f.sync, url: null }))
                : realFolders.map((f, idx) => ({
                    name: f.folderName || f.section || 'Folder',
                    subtext: `${f.count} FILE${f.count === 1 ? '' : 'S'}`,
                    color: colorForFolder(f.folderName, idx),
                    audit: 'Live from Drive',
                    sync: f.folderUrl ? 'Click to open' : 'No link',
                    url: f.folderUrl || null,
                  }));
              return (
                <>
                  {usingSample
                    ? <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">Showing <strong>sample</strong> folders — connect Google Drive{foldersErr ? ` (${foldersErr})` : ''} or set <code>DRIVE_MANIFEST_FILE_ID</code> to list the real evidence folders.</div>
                    : <div className="mb-6 rounded-lg border border-[#B6E8E2] bg-[#E5FEFF] px-4 py-2 text-xs text-[#007970]">Live from the Drive manifest — {realFolders.length} folder{realFolders.length === 1 ? '' : 's'}. Click a folder to open it in Google Drive.</div>}
                  <div className="flex flex-wrap gap-6 md:gap-14 pt-4 justify-start">
                    {cards.map((folder, idx) => (
                      <div
                        key={idx}
                        onClick={() => { if (folder.url) window.open(folder.url, '_blank', 'noopener,noreferrer'); }}
                        className="flex flex-col items-center w-36 cursor-pointer group bg-white rounded-[20px] p-4 hover:shadow-lg transition-all border border-transparent hover:border-[#EAE4E3]"
                      >
                        <FolderIcon className={`w-28 h-20 md:w-32 md:h-24 ${folder.color} group-hover:scale-105 transition-transform drop-shadow-md`} />
                        <span className="font-montserrat font-medium text-[#1F1C1B] text-xs md:text-sm mt-4 text-center leading-tight">{folder.name}</span>
                        <span className="font-roboto text-[9px] md:text-[10px] font-medium text-[#747470] uppercase tracking-wider mt-2 bg-[#FAFBF8] px-2 py-1 rounded">{folder.subtext}</span>
                        <div className="mt-3 flex flex-col items-center gap-1 w-full border-t border-[#EAE4E3] pt-2">
                           <span className={`text-[9px] font-roboto ${folder.audit.includes('Clean') || folder.audit.includes('Live') ? 'text-[#008540]' : 'text-[#C74601]'}`}>{folder.audit}</span>
                           <span className="text-[9px] font-roboto text-[#747470]">{folder.sync}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {folderPackets.length > 0 && (
              <div className="mt-16 pt-8 border-t border-[#EAE4E3]">
                <h3 className="font-montserrat text-sm font-medium text-[#1F1C1B] mb-6">Recently Generated Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folderPackets.map(p => (
                    <div key={p.id} className="bg-white rounded-[24px] p-4 shadow-md border-none hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 cursor-pointer flex gap-4 items-start">
                      <div className="mt-1"><DocIcon /></div>
                      <div>
                        <h4 className="font-montserrat font-medium text-sm text-[#1F1C1B]">{p.id}</h4>
                        <p className="font-roboto text-xs font-light text-[#524D4B] line-clamp-1">{p.template}</p>
                        <div className="flex justify-between items-center mt-3 gap-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-montserrat font-medium uppercase tracking-wider ${p.status.includes('Sent') ? 'bg-[#E5FEFF] text-[#007970]' : 'bg-[#FFF0E5] text-[#C74601]'}`}>
                            {p.status}
                          </span>
                          <span className="font-roboto text-[10px] font-light text-[#747470] whitespace-nowrap">{p.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* CREATE PACKET TAB (Studio Wizard) */}
        {/* ==================================================== */}
        {activeTab === 'CREATE PACKET' && (
          <div className="animate-fade-in min-h-[720px]">
            <Defensible2StudioLanding />
          </div>
        )}

        {/* Prototype wizard disabled. Defensible 2.0 uses its own studio copy so
            preview pages, Drive save, export, and logo inlining stay isolated. */}
        {activeTab === '__prototype_cards_disabled__' && (
          <div className="space-y-6">

            {/* STAGE 1: TEMPLATE */}
            {step === 1 && (
              <div className="animate-fade-in relative z-10 pt-4">
                <div className="mb-8 pl-2">
                  <h2 className="font-montserrat text-xl text-[#1F1C1B] font-medium mb-1">Select a packet template</h2>
                  <p className="font-roboto text-xs text-[#524D4B] font-light">Choose the foundational configuration for your evidence packet.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {TEMPLATES.map((t, index) => (
                    <div key={t.id} 
                      onClick={() => handleTemplateSelect(t)}
                      className="relative bg-white rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.04)] border-none overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-300 p-6 pr-14 flex flex-col min-h-[180px]"
                    >
                      <div className="w-10 h-10 bg-[#FAFBF8] rounded-full flex items-center justify-center text-[#524D4B] mb-4 shadow-sm">
                         {index === 0 && <svg className="w-5 h-5 text-[#FFC700]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                         {index === 1 && <svg className="w-5 h-5 text-[#C74601]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>}
                         {index === 2 && <svg className="w-5 h-5 text-[#524D4B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>}
                         {index === 3 && <svg className="w-5 h-5 text-[#008540]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9c1.657 0 3 4.03 3 9s-1.343 9-3 9m0-18c-1.657 0-3 4.03-3 9s1.343 9 3 9m-9-9h18"></path></svg>}
                         {index === 4 && <svg className="w-5 h-5 text-[#007970]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
                         {index === 5 && <svg className="w-5 h-5 text-[#C74601]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                      </div>
                      
                      <div className="absolute right-0 top-0 bottom-0 w-10 flex flex-col items-center pt-4" style={{ backgroundColor: templateColors[index % templateColors.length] }}>
                         <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[11px] font-montserrat font-bold shadow-sm">{index + 1}</span>
                      </div>

                      <h3 className="font-montserrat font-bold text-[#1F1C1B] text-[12px] uppercase tracking-wider mb-2 leading-tight">{t.name}</h3>
                      <p className="font-roboto font-light text-[10px] text-[#747470] leading-relaxed line-clamp-4 pr-2">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 2: PAYER ROUTE OR EVENT */}
            {step === 2 && selectedTemplate && (
              <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.04)] border-none animate-fade-in">
                <button onClick={() => resetStudio()} className="font-montserrat text-[11px] font-bold text-[#747470] uppercase tracking-widest hover:text-[#1F1C1B] transition-colors mb-6 flex items-center gap-1">
                  ← Back to Templates
                </button>
                
                {selectedTemplate.id === 'CI-HH-ADM-001' ? (
                  <>
                    <h2 className="font-montserrat text-sm font-bold tracking-[0.1em] text-[#1F1C1B] mb-8 uppercase">
                      1 • Specific Event Context (Payer Route) *
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {PAYER_ROUTES.map(route => (
                        <div key={route.id} 
                          onClick={() => { setSelectedPayerRoute(route); setStep(3); }}
                          className="relative bg-white rounded-[24px] border-none shadow-[0_8px_25px_rgba(0,0,0,0.03)] p-6 md:p-8 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_35px_rgba(0,0,0,0.07)] transition-all duration-300 min-h-[140px] flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-montserrat font-bold text-[#1F1C1B] text-sm md:text-base leading-snug pr-2">{route.name}</h3>
                              {route.badge && (
                                <span className="font-roboto text-[9px] font-bold text-[#747470] tracking-wider bg-[#FAFBF8] px-1.5 py-0.5 rounded uppercase shrink-0">
                                  {route.badge}
                                </span>
                              )}
                            </div>
                            <p className="font-roboto font-light text-xs text-[#524D4B] leading-relaxed">{route.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="font-montserrat text-sm font-bold tracking-[0.1em] text-[#1F1C1B] mb-8 uppercase">
                      1 • Specific Event *
                    </h2>
                    <p className="font-roboto text-xs text-[#524D4B] font-light mb-6">Displaying contextual events based on the {selectedTemplate.name} template.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredEvents().map(e => (
                        <div key={e.id} 
                          onClick={() => { setSelectedEvent(e); setStep(3); }}
                          className="relative bg-white rounded-[24px] border-none shadow-[0_8px_25px_rgba(0,0,0,0.03)] p-6 md:p-8 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_18px_35px_rgba(0,0,0,0.07)] transition-all duration-300 min-h-[140px] flex flex-col justify-between"
                        >
                          <div>
                            <h3 className="font-montserrat font-bold text-[#1F1C1B] text-sm md:text-base leading-snug mb-2">{e.title}</h3>
                            <p className="font-roboto font-light text-xs text-[#747470] uppercase tracking-wider">{e.date} &nbsp;|&nbsp; {e.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STAGE 3: DATA SOURCE */}
            {step === 3 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-6 md:p-8 shadow-md border-none animate-fade-in">
                <button onClick={() => setStep(2)} className="font-montserrat text-[11px] font-medium uppercase tracking-wider text-[#747470] mb-6 hover:text-[#1F1C1B] transition-colors">← Back</button>
                <div className="text-center mb-10">
                   <h2 className="font-montserrat text-sm tracking-widest text-[#1F1C1B] uppercase font-bold mb-2">2 • Select Data Source *</h2>
                   <p className="font-roboto text-xs text-[#524D4B] font-light">Choose where the source evidence will be pulled from.</p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-16 pb-8">
                  <CircularDataSourceButton 
                     title="Upload / Camera" 
                     desc="Local files & Scans" 
                     strokeColor="#9CA3AF" 
                     onClick={() => handleDataSourceClick('Upload / Camera')} 
                     icon={<svg className="w-8 h-8 md:w-10 md:h-10 text-[#747470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>}
                  />
                  <CircularDataSourceButton 
                     title="Google Drive" 
                     desc="Cloud Evidence" 
                     strokeColor="#EF4444" 
                     icon={<GoogleDriveIcon className="w-8 h-8 md:w-10 md:h-10 grayscale opacity-70" />}
                     onClick={() => handleDataSourceClick('Google Drive')} 
                  />
                  <CircularDataSourceButton 
                     title="Both (Merge)" 
                     desc="Combine Sources" 
                     strokeColor="#00C2C7" 
                     icon={<svg className="w-8 h-8 md:w-10 md:h-10 text-[#007970] opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>}
                     onClick={() => handleDataSourceClick('Both (Merge)')} 
                  />
                </div>
              </div>
            )}

            {/* STAGE 4: VALIDATION */}
            {step === 4 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-6 md:p-8 shadow-md border-none animate-fade-in">
                <h2 className="font-montserrat text-sm tracking-widest text-[#524D4B] uppercase font-bold mb-6">3 • Validation & Defensibility Check</h2>
                
                <div className="bg-white border-none rounded-[24px] p-6 mb-8 shadow-md">
                  <h3 className="font-montserrat text-[#1F1C1B] font-medium mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#008540] animate-pulse"></span>
                    Defensibility Engine: Payload Verified
                  </h3>
                  
                  <div className="space-y-3">
                     <div className="flex justify-between items-center p-3 md:p-4 bg-[#FAFBF8] rounded-[16px]">
                        <span className="font-roboto text-xs md:text-sm text-[#524D4B]">Demographic & Event Context Rules Mapped</span>
                        <span className="font-montserrat text-[10px] bg-[#E5FEFF] text-[#007970] px-2 py-1 rounded font-bold tracking-wider">PASS</span>
                     </div>
                     <div className="flex justify-between items-center p-3 md:p-4 bg-[#FAFBF8] rounded-[16px]">
                        <span className="font-roboto text-xs md:text-sm text-[#524D4B]">Source Evidence & Attachments Located (4 items)</span>
                        <span className="font-montserrat text-[10px] bg-[#E5FEFF] text-[#007970] px-2 py-1 rounded font-bold tracking-wider">PASS</span>
                     </div>
                     <div className="flex justify-between items-center p-3 md:p-4 bg-[#FAFBF8] rounded-[16px]">
                        <span className="font-roboto text-xs md:text-sm text-[#524D4B]">Required Signer Roles Mapped (Target: {signers.length} signers)</span>
                        <span className="font-montserrat text-[10px] bg-[#FFF0E5] text-[#C74601] px-2 py-1 rounded font-bold tracking-wider">READY</span>
                     </div>
                     <div className="flex justify-between items-center p-3 md:p-4 bg-[#FAFBF8] rounded-[16px]">
                        <span className="font-roboto text-xs md:text-sm text-[#524D4B]">Audit Trail & Immutable Hash Initialization</span>
                        <span className="font-montserrat text-[10px] bg-[#E5FEFF] text-[#007970] px-2 py-1 rounded font-bold tracking-wider">PASS</span>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(3)} className="font-montserrat px-6 md:px-8 py-3 text-[10px] md:text-xs font-medium uppercase tracking-wider text-[#1F1C1B] bg-[#EAE4E3] rounded-full hover:bg-[#D9D6D5] transition-colors">
                    Back
                  </button>
                  <button onClick={() => handleCompilePacket()} className="font-montserrat px-6 md:px-8 py-3 text-[10px] md:text-xs font-medium uppercase tracking-wider text-white bg-[#C74601] rounded-full shadow-md hover:bg-[#421700] hover:shadow-lg transition-all flex items-center gap-2">
                    Compile Packet
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 5: CAROUSEL PREVIEW */}
            {step === 5 && (
              <div className="animate-fade-in overflow-hidden rounded-[20px] bg-white shadow-[0_12px_45px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between gap-4 border-b border-[#EAE4E3] bg-white/90 px-6 py-4 md:px-8">
                  <button className="flex items-center gap-2 rounded-[10px] border border-[#cfe6e8] px-4 py-2 font-roboto text-sm text-[#747470]">
                    <span className="h-5 w-5 rounded border border-[#747470]" />
                    ⚙ Testing · skip iterations
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-14 rounded-full bg-[#007970]" />
                    <span className="h-2 w-14 rounded-full bg-[#007970]" />
                    <span className="h-2 w-20 rounded-full bg-[#007970]" />
                    <span className="ml-3 font-montserrat text-sm font-medium tracking-wider text-[#747470]">Step 3 · Preview & Export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setStep(4)} className="font-montserrat rounded-[10px] border border-[#cfe6e8] bg-white px-6 py-3 text-sm font-medium text-[#007970] shadow-sm transition-all hover:bg-[#FAFBF8]">← Back</button>
                    <button onClick={() => setStep(6)} className="font-montserrat rounded-[10px] bg-[#007970] px-7 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-[#004142]">Set up Signing →</button>
                  </div>
                </div>

                <div className="relative bg-gradient-to-b from-white via-[#f8ffff] to-white py-16">
                  <div className="overflow-x-auto px-12 pb-12 pt-4 [scrollbar-width:thin]">
                    <div className="flex min-w-max gap-10">
                      {previewPages.map((page, index) => (
                        <PacketPage
                          key={page.title}
                          page={page}
                          pageNumber={index + 1}
                          onClick={() => {
                            setPreviewPage(index);
                            setZoomPage(index);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 6: ASSIGN SIGNERS */}
            {step === 6 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-6 md:p-8 shadow-md border-none animate-fade-in">
                <div className="mb-8">
                   <h2 className="font-montserrat text-sm tracking-widest text-[#1F1C1B] uppercase font-bold mb-1 flex items-center gap-2">
                     <DocIcon /> 4 • Signature Workflow Routing
                   </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {signers.map((s, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-[16px] bg-white border-none shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                      <div>
                        <p className="font-montserrat font-medium text-[#1F1C1B] text-sm">{s.name}</p>
                        <p className="font-roboto font-light text-xs text-[#524D4B] mt-1">{s.role}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[#007970]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="font-montserrat text-[10px] font-medium uppercase">Pending</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-6 rounded-[24px] border-none shadow-md">
                  <h3 className="font-montserrat font-medium text-[#007970] flex items-center gap-2 mb-4">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     Confirm Workflow
                  </h3>
                  <label className="flex items-start gap-3 cursor-pointer mb-6">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-[#EAE4E3] text-[#007970] focus:ring-[#007970]" defaultChecked />
                    <span className="font-roboto font-light text-sm text-[#1F1C1B]">I verify the signer roster is complete. Assign tasks to initiate the secure signature block.</span>
                  </label>
                  <button onClick={() => setStep(7)} className="font-montserrat w-full md:w-auto px-10 py-4 bg-[#C74601] text-white rounded-full text-sm font-medium shadow-md hover:bg-[#421700] hover:shadow-lg transition-all flex items-center justify-center gap-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                     Assign and schedule signer tasks
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 7: FINISH / DOWNLOAD */}
            {step === 7 && (
              <div className="bg-white/95 backdrop-blur-sm rounded-[32px] p-6 md:p-8 shadow-md border-none animate-fade-in flex flex-col md:flex-row gap-8 items-start">
                 
                 <div className="w-full md:w-1/3 bg-[#FAFBF8] rounded-[24px] p-6 shadow-sm border border-[#EAE4E3]">
                    <div className="font-montserrat text-[10px] font-bold text-[#747470] uppercase tracking-widest mb-4">DefenCIble Metadata</div>
                    <div className="space-y-4">
                       <div>
                         <div className="font-roboto text-[10px] text-[#747470] uppercase mb-1">PACKET ID</div>
                         <div className="font-roboto font-medium text-sm text-[#1F1C1B] bg-white px-3 py-1.5 rounded border border-[#EAE4E3]">PKT_2026_{Math.floor(Math.random() * 1000)}</div>
                       </div>
                       <div>
                         <div className="font-roboto text-[10px] text-[#747470] uppercase mb-1">AUDIT HASH</div>
                         <div className="font-roboto font-mono text-xs text-[#524D4B] break-all truncate bg-white px-3 py-1.5 rounded border border-[#EAE4E3]">8f4e2d1c9b7a...</div>
                       </div>
                       <div className="font-roboto font-light text-xs text-[#524D4B] leading-relaxed pt-2 border-t border-[#EAE4E3]">
                          <span className="font-medium text-[#1F1C1B]">Context:</span> {selectedEvent ? selectedEvent.title : (selectedPayerRoute ? selectedPayerRoute.name : 'Standard')}<br/>
                          <span className="font-medium text-[#1F1C1B]">Sources:</span> 4 Items Merged<br/>
                          <span className="font-medium text-[#1F1C1B]">Generated:</span> {new Date().toLocaleDateString()}
                       </div>
                    </div>
                 </div>

                 <div className="w-full md:w-2/3">
                    <h3 className="font-montserrat font-medium text-xl md:text-2xl text-[#1F1C1B] mb-2 flex items-center gap-2">
                       <svg className="w-6 h-6 text-[#008540]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                       Packet Ready & Routing
                    </h3>
                    <p className="font-roboto font-light text-sm text-[#524D4B] mb-6">
                       The evidence file has been securely compiled to Google Drive. The audit trail is active. If remediation is needed prior to final signatures, use the Edit Packet tab.
                    </p>
                    
                    <div className="bg-white rounded-[24px] p-6 mb-8 border-none shadow-md">
                       <p className="font-montserrat font-medium text-xs text-[#1F1C1B] mb-3">Tasks dispatched for the following required signers:</p>
                       <ul className="list-disc pl-5 font-roboto font-light text-xs text-[#524D4B] space-y-2">
                         {signers.map((s, i) => (
                           <li key={i}><span className="font-medium">{s.name}</span> — {s.role}</li>
                         ))}
                       </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                       <button onClick={() => handleFinish()} className="font-montserrat w-full sm:w-auto px-6 py-3 bg-[#1F1C1B] text-white rounded-full text-xs font-medium shadow-md hover:bg-[#524D4B] transition-all flex items-center justify-center gap-2">
                          <GoogleDriveIcon className="w-4 h-4 grayscale contrast-200" />
                          View Drive Evidence
                       </button>
                       <button onClick={() => handleFinish()} className="font-montserrat w-full sm:w-auto px-6 py-3 bg-white text-[#1F1C1B] rounded-full text-xs font-medium border border-[#EAE4E3] shadow-sm hover:bg-[#FAFBF8] transition-all flex items-center justify-center gap-2">
                          Track Status in Dashboard
                       </button>
                    </div>
                 </div>
              </div>
            )}
            
          </div>
        )}

        {/* ==================================================== */}
        {/* EDIT PACKET TAB */}
        {/* ==================================================== */}
        {activeTab === 'EDIT PACKET' && (
          <div className="space-y-6 animate-fade-in min-h-[720px]">
            <div className="bg-surface-glass backdrop-blur-xl rounded-[32px] p-8 shadow-rest border border-hairline">
              <div className="font-montserrat text-[10px] font-medium text-[#747470] uppercase tracking-widest mb-2">PACKET ID</div>
              <div className="flex flex-col md:flex-row gap-4 md:items-center mb-3">
                <input 
                  type="text" 
                  placeholder="qapi_meeting-20260609-" 
                  value={editPacketId}
                  onChange={(e) => setEditPacketId(e.target.value)}
                  className="font-roboto flex-1 max-w-md bg-[#FAFBF8] border border-[#EAE4E3] rounded-[16px] px-4 py-3 text-sm focus:outline-none focus:border-[#007970] focus:bg-white transition-all"
                />
                <button 
                  onClick={handleLoadPacket}
                  className="font-montserrat bg-[#C74601] text-white px-6 py-3 rounded-full shadow-sm hover:bg-[#421700] transition-colors flex items-center justify-center gap-2 text-sm font-medium w-full md:w-auto"
                >
                  <DocIcon /> Load packet
                </button>
              </div>
              <p className="font-roboto font-light text-xs text-[#747470]">Find the Packet ID on the cover page and every page footer of a generated packet. Loading it starts a remediation thread with Brad.</p>
            </div>

            <div className="bg-surface-glass backdrop-blur-xl rounded-[32px] p-8 shadow-rest border border-hairline min-h-[500px] flex flex-col">
              <h3 className="font-montserrat font-medium text-[#1F1C1B] flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-[#007970]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Remediation
              </h3>

              <div className="flex-1 bg-white rounded-[24px] border-none shadow-md p-6 flex flex-col justify-end mb-6 overflow-y-auto">
                {!isPacketLoaded ? (
                  <div className="flex flex-col items-center justify-center h-full text-[#747470]">
                    <svg className="w-8 h-8 opacity-50 mb-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                    <p className="font-roboto text-sm font-light">Load a packet ID to begin.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'brad' && (
                           <div className="w-6 h-6 rounded-full bg-[#E5FEFF] flex items-center justify-center shrink-0">
                             <span className="font-montserrat text-[10px] font-bold text-[#007970]">B</span>
                           </div>
                        )}
                        <div className={`p-4 rounded-[16px] font-roboto text-sm font-light max-w-[80%] ${msg.role === 'user' ? 'bg-[#007970] text-white' : 'bg-[#FAFBF8] border-none text-[#1F1C1B] shadow-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {['Correction', 'Add Forms', 'Review Logic'].map(tag => (
                    <button key={tag} className="font-montserrat px-4 py-1.5 rounded-full bg-[#FAFBF8] border border-[#EAE4E3] text-xs font-light text-[#524D4B] hover:bg-[#EAE4E3] transition-colors whitespace-nowrap">{tag}</button>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="text" 
                    placeholder={isPacketLoaded ? "Type your feedback here..." : "Load a packet first"}
                    disabled={!isPacketLoaded}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendFeedback()}
                    className="font-roboto flex-1 bg-[#FAFBF8] border border-[#EAE4E3] rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#007970] focus:bg-white transition-all disabled:opacity-50"
                  />
                  <button 
                    disabled={!isPacketLoaded || !chatInput.trim()}
                    onClick={handleSendFeedback}
                    className="font-montserrat bg-[#C74601] text-white px-8 py-3 rounded-full shadow-md hover:bg-[#421700] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    Send
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==================================================== */}
        {/* eCIgn TAB */}
        {/* ==================================================== */}
        {activeTab === 'eCIgn' && (
          <div className="min-h-[720px] animate-fade-in">
            <EcignWorkspacePanel createdPackets={folderPackets} />
          </div>
        )}

        </div>

        {/* ==================================================== */}
        {/* DATA SOURCE MODALS */}
        {/* ==================================================== */}
        {showSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1C1B]/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all border-none">
              
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">
                 <h2 className="font-montserrat text-xl md:text-2xl font-medium text-[#1F1C1B] flex items-center gap-3">
                   {sourceModalType === 'Google Drive' && <GoogleDriveIcon className="w-6 h-6" />}
                   {sourceModalType === 'Upload / Camera' && <svg className="w-6 h-6 text-[#747470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>}
                   {sourceModalType === 'Both (Merge)' && <svg className="w-6 h-6 text-[#007970]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>}
                   {sourceModalType === 'Google Drive' ? 'Select from Google Drive' : sourceModalType === 'Upload / Camera' ? 'Upload or Capture' : 'Merge Data Sources'}
                 </h2>
                 <button onClick={() => setShowSourceModal(false)} className="text-[#747470] hover:text-[#1F1C1B]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
              </div>

              {/* DRIVE CONTENT */}
              {sourceModalType === 'Google Drive' && (
                <>
                  <p className="font-roboto text-sm text-[#524D4B] mb-6">Choose an evidence folder or specific files from your Google Drive integration to feed into this packet.</p>
                  <div className="flex flex-wrap gap-4 md:gap-8 mb-8 justify-center md:justify-start">
                    {MOCK_FOLDERS.slice(0, 8).map((folder, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedDriveFolder(folder.name)}
                        className={`flex flex-col items-center p-4 rounded-[20px] cursor-pointer transition-all w-28 md:w-32 shadow-sm ${
                          selectedDriveFolder === folder.name 
                            ? 'ring-2 ring-[#007970] bg-[#E5FEFF] shadow-md transform -translate-y-1 border-none' 
                            : 'border-none hover:bg-[#FAFBF8] hover:shadow-md'
                        }`}
                      >
                        <FolderIcon className={`w-16 h-16 md:w-20 md:h-20 mb-3 ${selectedDriveFolder === folder.name ? 'text-[#007970]' : folder.color}`} />
                        <span className="font-montserrat text-xs font-medium text-center text-[#1F1C1B] line-clamp-2 leading-tight">{folder.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* UPLOAD CONTENT */}
              {sourceModalType === 'Upload / Camera' && (
                <>
                  <p className="font-roboto text-sm text-[#524D4B] mb-6">Upload local files or use your device camera to scan documents directly into the platform.</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addLocalFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      addCameraFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <div className="flex flex-col md:flex-row gap-6 mb-8">
                     <button
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       onDragOver={(e) => e.preventDefault()}
                       onDrop={(e) => {
                         e.preventDefault();
                         addLocalFiles(e.dataTransfer.files);
                       }}
                       className="flex-1 border-2 border-dashed border-[#EAE4E3] rounded-[24px] flex flex-col items-center justify-center p-8 hover:bg-[#FAFBF8] hover:border-[#747470] cursor-pointer transition-colors group text-center"
                     >
                        <div className="w-16 h-16 bg-[#FAFBF8] rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                          <svg className="w-8 h-8 text-[#747470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        </div>
                        <span className="font-montserrat text-sm font-medium text-[#1F1C1B]">Drag & Drop files here</span>
                        <span className="font-roboto text-xs text-[#747470] mt-1">or click to browse local files</span>
                     </button>
                     <button
                       type="button"
                       onClick={() => cameraInputRef.current?.click()}
                       className="flex-1 border-none shadow-md rounded-[24px] flex flex-col items-center justify-center p-8 bg-[#FAFBF8] hover:bg-[#E5FEFF] transition-colors group text-center"
                     >
                        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                          <svg className="w-8 h-8 text-[#007970]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <span className="font-montserrat text-sm font-medium text-[#1F1C1B]">Open Camera Scanner</span>
                        <span className="font-roboto text-xs text-[#747470] mt-1">Capture using your device</span>
                     </button>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="mb-8 rounded-[20px] bg-[#FAFBF8] p-4 shadow-inner">
                      <div className="mb-3 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#747470]">Selected Files</div>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-[14px] bg-white px-4 py-3 shadow-sm">
                            <div className="flex min-w-0 items-center gap-3">
                              <DocIcon />
                              <div className="min-w-0">
                                <p className="truncate font-roboto text-sm text-[#1F1C1B]">{file.name}</p>
                                <p className="font-roboto text-[10px] uppercase tracking-wider text-[#747470]">{file.source}</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))} className="text-xl leading-none text-[#747470] hover:text-[#D70101]">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* MERGE CONTENT */}
              {sourceModalType === 'Both (Merge)' && (
                <>
                  <p className="font-roboto text-sm text-[#524D4B] mb-6">Select a primary folder from Google Drive, and additionally attach any local files needed for this packet.</p>
                  <div className="bg-[#FAFBF8] rounded-[24px] p-6 mb-8 flex flex-col gap-4 border-none shadow-inner">
                    <div className="flex items-center justify-between p-4 bg-white rounded-[16px] shadow-md border-none cursor-pointer hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <GoogleDriveIcon className="w-8 h-8" />
                        <div>
                          <p className="font-montserrat text-sm font-medium text-[#1F1C1B]">Select Google Drive Folder</p>
                          <p className="font-roboto text-xs text-[#747470]">Click to browse your Drive</p>
                        </div>
                      </div>
                      <span className="font-montserrat text-[#007970] text-xs font-medium uppercase tracking-wider">Browse</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-[16px] shadow-md border-none cursor-pointer hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <svg className="w-8 h-8 text-[#747470]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        <div>
                          <p className="font-montserrat text-sm font-medium text-[#1F1C1B]">Attach Local Files</p>
                          <p className="font-roboto text-xs text-[#747470]">Drop files or click to upload</p>
                        </div>
                      </div>
                      <span className="font-montserrat text-[#747470] text-xs font-medium uppercase tracking-wider">Add</span>
                    </div>
                  </div>
                </>
              )}

              {/* ACTIONS */}
              <div className="flex justify-end gap-4 border-t border-[#EAE4E3] pt-6">
                <button onClick={() => setShowSourceModal(false)} className="font-montserrat px-6 py-3 rounded-full text-xs font-medium text-[#1F1C1B] bg-[#EAE4E3] hover:bg-[#D9D6D5] transition-colors uppercase tracking-wider">
                   Cancel
                </button>
                <button 
                  onClick={confirmDataSource} 
                  disabled={(sourceModalType === 'Google Drive' && !selectedDriveFolder) || (sourceModalType === 'Upload / Camera' && uploadedFiles.length === 0)}
                  className="font-montserrat px-8 py-3 rounded-full text-xs font-medium text-white bg-[#C74601] hover:bg-[#421700] shadow-md transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   Confirm Selection
                </button>
              </div>

            </div>
          </div>
        )}

        {compilePhase === 'brad' && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-[480px] rounded-[24px] border border-transparent bg-white/[0.72] p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur-[16px] md:p-10">
              <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-[0_12px_35px_rgba(0,121,112,0.12)]">
                <span className="font-montserrat text-4xl font-bold text-[#007970]">B</span>
              </div>
              <h2 className="font-montserrat text-lg font-bold tracking-tight text-[#1F1C1B]">Brad is generating the packet</h2>
              <p className="mb-8 mt-2 font-roboto text-[13px] font-medium text-[#747470]">Brad is reviewing rules, mapping evidence, and building packet sections...</p>
              <div className="relative mb-4 h-1 w-full overflow-hidden rounded-full bg-[#EAE4E3]">
                <div className="absolute bottom-0 left-0 top-0 w-1/3 animate-[slide-progress_1.8s_ease-in-out_infinite] rounded-full bg-[#007970]" />
              </div>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="font-montserrat font-semibold text-[#007970]">Step 2 of 5</span>
                <span className="font-roboto text-[#747470]">Content Mapping</span>
              </div>
            </div>
          </div>
        )}

        {compilePhase === 'sync' && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-[520px] rounded-[28px] bg-white p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
              <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center">
                <GoogleDriveIcon className="relative z-10 h-20 w-20" />
                <div className="absolute inset-0 rounded-full border-[6px] border-[#EAE4E3] border-t-[#007970] animate-spin" />
              </div>
              <h2 className="font-montserrat text-xl font-medium text-[#1F1C1B]">Syncing with Google Drive</h2>
              <p className="mx-auto mt-3 max-w-sm font-roboto text-sm font-light leading-relaxed text-[#524D4B]">The packet is being compiled, encrypted, and securely synchronized to the designated compliance folder.</p>
              <div className="mt-8 flex justify-center gap-2">
                <span className="h-2 w-8 rounded-full bg-[#007970]" />
                <span className="h-2 w-8 rounded-full bg-[#007970]/60" />
                <span className="h-2 w-8 rounded-full bg-[#007970]/30" />
              </div>
            </div>
          </div>
        )}

        {zoomPage !== null && (
          <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#10201f]/88">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#101c1b] px-6 py-4 text-white">
              <h2 className="font-montserrat text-lg font-bold">Page {zoomPage + 1} of 31</h2>
              <div className="flex gap-4">
                <button onClick={() => setZoomPage((page) => Math.max(0, page - 1))} className="rounded-[10px] border border-white/25 px-5 py-2 font-montserrat text-sm">← Prev</button>
                <button onClick={() => setZoomPage((page) => Math.min(previewPages.length - 1, page + 1))} className="rounded-[10px] border border-white/25 px-5 py-2 font-montserrat text-sm">Next →</button>
                <button className="rounded-[10px] border border-white/25 px-5 py-2 font-montserrat text-sm">↙ Zoom</button>
                <button onClick={() => setZoomPage(null)} className="rounded-[10px] border border-white/25 px-5 py-2 font-montserrat text-sm">× Close</button>
              </div>
            </div>
            <div className="flex min-h-[calc(100vh-72px)] items-start justify-center px-6 py-12">
              <PacketPage page={previewPages[zoomPage]} pageNumber={zoomPage + 1} compact />
            </div>
          </div>
        )}

        {activeTab === 'CREATE PACKET' && studioGenerating && studioSaveStatus !== 'saving' && <BradGeneratingOverlay />}
        {activeTab === 'CREATE PACKET' && studioSaveStatus === 'saving' && <GoogleUploadingOverlay />}

      </div>
  );
}

export default Defensible2Studio;
