import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Camera, CheckCircle2, CloudUpload, XCircle } from 'lucide-react';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { MANDATED_EVENTS_EXPANDED } from '@/policy/data/mandatedEventsExpanded';
import { CalendarApi, type EvidenceHealthResponse, type ManifestFolder, type SourceExtractionApiResult } from '@/policy/services/calendarApi';
import {
  buildEvidenceIdentityScope, buildIdempotencyKey, detectFormat, extractRecordFromCell,
  parseSourceFile, sanitizeFileName, type EvidenceSourceRecord, type SourceSystem,
} from '@/policy/evidence/intake';
import { applyDriveOutcome, persistCanonicalEvidence } from '@/policy/evidence/intake/intakeService';
import {
  generatePacket as generateAlphaPacket,
  getSignatureRequirements,
  scheduleSignatureTasks,
type AlphaPacketPreview,
type AdmissionStudioFields,
} from './alpha/defensibleAlphaDriver';

type AlphaSignatureRequirement = {
  name?: string;
  role?: string;
  status?: string;
  source?: string;
};

const PRE_READINESS_EVENT_FOLDER_ID = '1oWEQxrPWoy8bBIDG1a-5afQU9vEYWmU0';
const PRE_READINESS_START = '2026-01-01';
const PRE_READINESS_END = '2026-06-30';
const QUARTERLY_QAPI_EVENT_IDS = new Set(['qapi_meeting-20260205-04', 'qapi_meeting-20260507-08']);

const ADMISSION_BILLING_ROUTES = [
  { id: 'PRIVATE_PAY', icon: '$', title: 'Private Pay', desc: 'Patient/family pays directly. Rate schedule and payment authorization.' },
  { id: 'LONG_TERM_CARE_INSURANCE', icon: 'LTC', title: 'Long-Term Care Insurance', desc: 'Services may be submitted to the long-term care insurance carrier.' },
  { id: 'MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE', icon: 'MA', title: 'Medicare Advantage / Private Insurance', desc: 'Coverage depends on plan rules, eligibility, and authorization.' },
  { id: 'ORIGINAL_MEDICARE_FFS', icon: 'M', title: 'Original Medicare FFS', desc: 'Original Medicare home health coverage and notice rules.' },
  { id: 'MEDI_CAL_OR_MEDICAID', icon: 'MC', title: 'Medi-Cal / Medicaid', desc: 'Program coverage and patient responsibility limits.' },
  { id: 'VA_WORKERS_COMP_OR_OTHER_CONTRACT', icon: 'VA', title: "VA / Workers' Comp / Contract", desc: 'Services coordinated through an authorized sponsor.' },
  { id: 'PENDING_VERIFICATION', icon: '?', title: 'Pending Verification', desc: 'Coverage is not final; preliminary estimate language only.' },
  { id: 'NOT_APPLICABLE_NO_BILLABLE_SERVICES', icon: 'NA', title: 'No Billable Services', desc: 'No billable services are admitted under this packet.' },
];

function isPatientAdmissionTemplate(title: string) {
  return /patient[-_\s]*admission/i.test(title);
}

/* ── Source-extraction (verification-first) helpers ── */

// Human labels for the admission review panel, keyed by server field key.
const ADMISSION_FIELD_LABELS: Record<string, string> = {
  patient_name: 'Patient name', medical_record: 'Medical record #', date_of_birth: 'Date of birth',
  address: 'Patient address', phone: 'Patient phone', county: 'County',
  start_of_care: 'Start of care', primary_physician: 'Primary physician', physician_phone: 'Physician phone',
  physician_fax: 'Physician fax', admitting_clinician: 'Admitting clinician', f2f_date: 'Face-to-face date',
  diagnosis: 'Primary diagnosis', services_ordered: 'Services ordered',
  payer: 'Payer / insurance', payer_id: 'Policy / member ID',
  representative_name: 'Representative / conservator', representative_relationship: 'Relationship to patient',
  legal_authority: 'Legal authority', emergency_contact_name: 'Emergency contact name',
  emergency_contact_phone: 'Emergency contact phone', primary_language: 'Primary language',
  interpreter_needed: 'Interpreter needed', advance_directive_status: 'Advance directive status',
};
// Review-panel section order (fields carry a `group` from the extraction schema).
const ADMISSION_GROUP_ORDER = [
  'Patient', 'Admission / Physician', 'Diagnosis / Clinical', 'Services Ordered',
  'Payer / Billing Route', 'Representative / Legal Authority', 'Emergency Preparedness',
  'Interpreter / Language', 'Advance Directives', 'Other',
];
// Fields that do not flow into the packet body — shown read-only. (Address & phone
// now DO fill the body field tables, so the set is empty; kept for future use.)
const ADMISSION_FIELDS_NOT_IN_PACKET = new Set<string>([]);

function seedVerifiedFields(ex: SourceExtractionApiResult): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of ex.extraction.fields) out[f.key] = f.value ?? '';
  return out;
}

// Deterministic map of Brad's free-text payer -> an ADMISSION_BILLING_ROUTES id, so
// the billing step can pre-select what Brad identified (blank if no clear match).
// Exported for regression tests — NOT an LLM call (payer text is already extracted).
export function payerToRoute(payer: string): string {
  const p = (payer || '').toLowerCase();
  if (!p.trim()) return '';
  if (/\bno\b.*billable|not applicable|\bn\/?a\b/.test(p)) return 'NOT_APPLICABLE_NO_BILLABLE_SERVICES';
  if (/pending|unverified|not (yet )?(verified|confirmed)/.test(p)) return 'PENDING_VERIFICATION';
  // Medi-Cal family — includes San Mateo's managed-care plan (HPSM) and the CCS
  // Whole Child Model transition, which are Medi-Cal even without the literal word.
  if (/medi-?cal|medicaid|\bhpsm\b|health plan of san mateo|ccs (transition|whole child)/.test(p)) return 'MEDI_CAL_OR_MEDICAID';
  if (/medicare advantage|\bma\b|advantage|private insurance|commercial/.test(p)) return 'MEDICARE_ADVANTAGE_OR_PRIVATE_INSURANCE';
  if (/original medicare|medicare (part a|ffs|fee)|fee-for-service|\bffs\b/.test(p)) return 'ORIGINAL_MEDICARE_FFS';
  if (/\bmedicare\b/.test(p)) return 'ORIGINAL_MEDICARE_FFS';
  if (/long-?term care|\bltc\b/.test(p)) return 'LONG_TERM_CARE_INSURANCE';
  if (/\bva\b|veteran|workers'? comp|contract|sponsor/.test(p)) return 'VA_WORKERS_COMP_OR_OTHER_CONTRACT';
  if (/private pay|self-?pay|out of pocket|family pays/.test(p)) return 'PRIVATE_PAY';
  return '';
}

// Human label for a billing-route id (empty string if unknown).
function routeLabelFor(routeId: string): string {
  return ADMISSION_BILLING_ROUTES.find((r) => r.id === routeId)?.title || '';
}

// Brad's deterministic billing-route suggestion (never an LLM call — payer text
// was already extracted; this maps it). Null when no payer / no clear match.
export type BradRouteSuggestion = {
  routeId: string;
  routeLabel: string;
  payerText: string;
  confidence?: number;
  sourceEvidence?: string;
};
// Audit record of the user's Step-2 confirmation. Preserves Brad's original
// suggestion even when overridden — the packet renders only the CONFIRMED route.
export type BillingRouteConfirmation = {
  confirmedRouteId: string;
  confirmedRouteLabel: string;
  confirmedAt: string;
  confirmedBy?: string;
  overridden: boolean;
  originalSuggestedRouteId?: string;
  originalSuggestedRouteLabel?: string;
};

// Pure builder for the Step-2 confirmation record. `overridden` is true only when
// Brad had a suggestion AND the user confirmed a DIFFERENT route. Exported for tests.
export function buildBillingRouteConfirmation(
  suggestion: BradRouteSuggestion | null,
  confirmedRouteId: string,
  confirmedAt: string,
  confirmedBy?: string,
): BillingRouteConfirmation {
  return {
    confirmedRouteId,
    confirmedRouteLabel: routeLabelFor(confirmedRouteId),
    confirmedAt,
    confirmedBy,
    overridden: !!suggestion && suggestion.routeId !== confirmedRouteId,
    originalSuggestedRouteId: suggestion?.routeId,
    originalSuggestedRouteLabel: suggestion?.routeLabel,
  };
}

// Map server snake_case keys -> the studio's profile keys. Route is intentionally
// left to the billing step (selectedBillingRoute) so we stay in the studio's
// route-id space; address/phone are dropped (no packet field exists).
function mapServerToStudio(v: Record<string, string>): AdmissionStudioFields {
  return {
    name: v.patient_name || '',
    mr: v.medical_record || '',
    dob: v.date_of_birth || '',
    soc: v.start_of_care || '',
    dx: v.diagnosis || '',
    physician: v.primary_physician || '',
    admitting_clinician: v.admitting_clinician || '',
    address: v.address || '',
    phone: v.phone || '',
    payer: v.payer || '',
    county: v.county || '',
    physician_phone: v.physician_phone || '',
    physician_fax: v.physician_fax || '',
    f2f_date: v.f2f_date || '',
    services_ordered: v.services_ordered || '',
    payer_id: v.payer_id || '',
    representative_name: v.representative_name || '',
    representative_relationship: v.representative_relationship || '',
    legal_authority: v.legal_authority || '',
    emergency_contact_name: v.emergency_contact_name || '',
    emergency_contact_phone: v.emergency_contact_phone || '',
    primary_language: v.primary_language || '',
    interpreter_needed: v.interpreter_needed || '',
    advance_directive_status: v.advance_directive_status || '',
  };
}

type PrivatePayRateRow = { desc?: string; rate?: string; min?: string; week?: string };
export type PrivatePayRates = {
  rn?: PrivatePayRateRow; lvn?: PrivatePayRateRow; pt?: PrivatePayRateRow; ot?: PrivatePayRateRow;
  slp?: PrivatePayRateRow; msw?: PrivatePayRateRow; hha?: PrivatePayRateRow; other?: PrivatePayRateRow;
  weeklyCost?: string; monthlyCost?: string; suppliesMarkup?: string; mileage?: string;
  holiday?: string; weekend?: string; rush?: string;
};
// Which §8 rows are per-visit (rate only) vs hourly (rate + minimum hours).
const PRIVATE_PAY_SERVICES: Array<{ key: keyof PrivatePayRates; label: string; perVisit: boolean; hasDesc: boolean }> = [
  { key: 'rn', label: 'Skilled Nursing (RN)', perVisit: false, hasDesc: true },
  { key: 'lvn', label: 'Skilled Nursing (LVN)', perVisit: false, hasDesc: true },
  { key: 'pt', label: 'Physical Therapy (PT)', perVisit: true, hasDesc: false },
  { key: 'ot', label: 'Occupational Therapy (OT)', perVisit: true, hasDesc: false },
  { key: 'slp', label: 'Speech-Language Pathology (SLP)', perVisit: true, hasDesc: false },
  { key: 'msw', label: 'Medical Social Work (MSW)', perVisit: true, hasDesc: false },
  { key: 'hha', label: 'Home Health Aide (HHA)', perVisit: false, hasDesc: true },
  { key: 'other', label: 'Other', perVisit: false, hasDesc: true },
];

const ADMISSION_SOURCE_HINT_RE = /\b(patient\s+admission|admission\s+packet|start\s+of\s+care|\bsoc\b|oasis|assessment|patient\s+assessment|referral|intake|plan\s+of\s+care|\b485\b|face[-\s]*to[-\s]*face|physician\s+order)\b/i;
const QAPI_SOURCE_HINT_RE = /\b(qapi|quality\s+assurance|performance\s+improvement|committee|minutes|infection\s+log|incident\s+log|complaints?|pip|kpi|dashboard)\b/i;

function inferSourceIntent(name: string, text?: string): 'admission' | 'qapi' | '' {
  const haystack = `${name || ''}\n${(text || '').slice(0, 4000)}`;
  if (ADMISSION_SOURCE_HINT_RE.test(haystack)) return 'admission';
  if (QAPI_SOURCE_HINT_RE.test(haystack)) return 'qapi';
  return '';
}

/* ════════════════════════════════════════════════════════════════
   Studio pane — the branded Packet Studio rendered INLINE (in-page)
   via an embedded, app-light-themed studio document, plus a slim
   toolbar that folds in the one useful Intake capability: drop source
   files → parse, resolve created-date, classify, and FILE into the
   Evidence Library (and Drive when reachable).
   ════════════════════════════════════════════════════════════════ */

async function readText(file: File): Promise<{ text?: string; headBytes: Uint8Array }> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const fmt = detectFormat(file.name, file.type, bytes.subarray(0, 8));
  const text = ['json', 'csv', 'tsv', 'markdown', 'txt'].includes(fmt) ? new TextDecoder('utf-8').decode(bytes) : undefined;
  return { text, headBytes: bytes.subarray(0, 8) };
}
function b64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = ''; const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

const GOOGLE_DRIVE_LOGO = '/assets/media/googledrive_logo.png';
const CARE_INDEED_LOGO = 'https://careindeed.com/apple-icon.png?2e01fae8dd8e47f4';
const ACCEPTED_SOURCE_FILES = '.json,.csv,.tsv,.md,.markdown,.txt,.xlsx,.xls,.pdf,.docx,application/pdf';

const DEF2_LOADER_CSS = `
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

function OutlineStar({ className, animClass }: { className: string; animClass: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`absolute z-20 ${className} ${animClass}`} overflow="visible" aria-hidden="true">
      <defs>
        <linearGradient id="def2LandingRainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="33%" stopColor="#9B72CB" />
          <stop offset="66%" stopColor="#D96570" />
          <stop offset="100%" stopColor="#F9AB00" />
        </linearGradient>
      </defs>
      <path
        d="M 50 2 C 50 25, 25 50, 2 50 C 25 50, 50 75, 50 98 C 50 75, 75 50, 98 50 C 75 50, 50 25, 50 2 Z"
        fill="none"
        stroke="url(#def2LandingRainbowGrad)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BradCompileOverlay() {
  return (
    <div className="fixed inset-0 z-[980] flex items-center justify-center p-4 pointer-events-none">
      <style dangerouslySetInnerHTML={{ __html: DEF2_LOADER_CSS }} />
      <div className="pointer-events-auto relative z-10 w-full max-w-[480px] rounded-[24px] border border-gray-100 bg-white p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:p-10">
        <div className="relative mx-auto mb-8 h-28 w-28">
          <img src={CARE_INDEED_LOGO} alt="Care Indeed" className="relative z-10 block h-full w-full object-contain" />
          <OutlineStar className="h-[26%] w-[26%] -right-[2%] -top-[2%]" animClass="def2-anim-star-1" />
          <OutlineStar className="h-[18%] w-[18%] -bottom-[4%] left-[2%]" animClass="def2-anim-star-2" />
          <OutlineStar className="h-[8%] w-[8%] left-[12%] top-[25%]" animClass="def2-anim-star-3" />
        </div>
        <h2 className="mb-2 text-lg font-bold tracking-tight text-gray-900">Brad is generating the packet</h2>
        <p className="mb-8 text-[13px] font-medium text-gray-700">Brad is reviewing rules and mapping content to packet sections...</p>
        <div className="relative mb-4 h-1 w-full overflow-hidden rounded-full bg-gray-200/50">
          <div className="def2-animate-progress absolute bottom-0 left-0 top-0 w-1/3 rounded-full bg-[#008080]" />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="font-semibold text-[#008080]">Step 2 of 5</span>
          <span className="font-medium text-gray-600">Content Mapping</span>
        </div>
      </div>
    </div>
  );
}

function DriveCompileOverlay() {
  return (
    <div className="fixed inset-0 z-[980] flex items-center justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[460px] rounded-[24px] border border-gray-100 bg-white p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:p-10">
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
          <img src={GOOGLE_DRIVE_LOGO} alt="Google Drive" className="relative z-10 h-20 w-20 object-contain" />
          <div className="absolute inset-0 animate-spin rounded-full border-[6px] border-[#EAE4E3] border-t-[#007970]" />
        </div>
        <h2 className="mb-2 text-lg font-bold tracking-tight text-gray-900">Uploading to Google Drive</h2>
        <p className="mb-8 text-[13px] font-medium text-gray-700">Saving the packet and attaching the document preview...</p>
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="font-semibold text-[#008080]">Step 4 of 5</span>
          <span className="font-medium text-gray-600">Drive Sync</span>
        </div>
      </div>
    </div>
  );
}

// Brad's "reading" operating modal — shown while the 3-pass source extraction
// runs, so the user waits for Brad to finish before advancing/generating.
function BradReadingOverlay() {
  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center bg-black/30 p-4">
      <style dangerouslySetInnerHTML={{ __html: DEF2_LOADER_CSS }} />
      <div className="relative z-10 w-full max-w-[480px] rounded-[24px] border border-gray-100 bg-white p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.12)] md:p-10">
        <div className="relative mx-auto mb-8 h-28 w-28">
          <img src={CARE_INDEED_LOGO} alt="Care Indeed" className="relative z-10 block h-full w-full object-contain" />
          <OutlineStar className="h-[26%] w-[26%] -right-[2%] -top-[2%]" animClass="def2-anim-star-1" />
          <OutlineStar className="h-[18%] w-[18%] -bottom-[4%] left-[2%]" animClass="def2-anim-star-2" />
          <OutlineStar className="h-[8%] w-[8%] left-[12%] top-[25%]" animClass="def2-anim-star-3" />
        </div>
        <h2 className="mb-2 text-lg font-bold tracking-tight text-gray-900">Brad is reading your source</h2>
        <p className="mb-8 text-[13px] font-medium text-gray-700">Reading the document 3× and cross-checking every field against the source — nothing is invented. This can take up to a minute.</p>
        <div className="relative mb-4 h-1 w-full overflow-hidden rounded-full bg-gray-200/50">
          <div className="def2-animate-progress absolute bottom-0 left-0 top-0 w-1/3 rounded-full bg-[#008080]" />
        </div>
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="font-semibold text-[#008080]">Step 1 of 5</span>
          <span className="font-medium text-gray-600">Source Extraction · 3-pass verification</span>
        </div>
      </div>
    </div>
  );
}

export function Defensible2StudioLanding() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const alphaSourceFilesRef = useRef<File[]>([]);
  const compileTimersRef = useRef<number[]>([]);
  const [driveHealth, setDriveHealth] = useState<EvidenceHealthResponse | null>(null);
  const [eventId, setEventId] = useState<string>(
    REGULATORY_EVENTS.find((e) => /qapi/i.test(e.title) && (e.policyRefs?.length ?? 0) > 0 && !!e.workflowId)?.id
    ?? REGULATORY_EVENTS.find((e) => !e.isContext)?.id ?? '',
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ filed: number; uploaded: number; failed: number } | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: number }>>([]);
  const [sourceParseSummary, setSourceParseSummary] = useState({ parsed: 0, needsExtraction: 0, failed: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [camShots, setCamShots] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [attachmentsConfirmed, setAttachmentsConfirmed] = useState(false);
  const [flowStep, setFlowStep] = useState<'template' | 'event' | 'billing' | 'rates' | 'review' | 'ready' | 'preview' | 'signers' | 'complete' | 'alphaError'>('template');
  const [privatePayRates, setPrivatePayRates] = useState<PrivatePayRates>({});
  // Verification-first source extraction (server 3x-read). `extraction` holds the
  // full result for the review panel; `verifiedFields` are the user-confirmed
  // values (server snake_case keys) injected into generation.
  const [extraction, setExtraction] = useState<SourceExtractionApiResult | null>(null);
  const [verifiedFields, setVerifiedFields] = useState<Record<string, string>>({});
  // Brad's deterministic billing-route suggestion from the extracted payer text.
  // Null when no payer / no clear match. Drives the Step-2 preselect + lock.
  const bradRouteSuggestion = useMemo<BradRouteSuggestion | null>(() => {
    const payerText = (verifiedFields.payer || '').trim();
    const routeId = payerToRoute(payerText);
    if (!routeId) return null;
    const payerField = extraction?.extraction.fields.find((f) => f.key === 'payer');
    return {
      routeId,
      routeLabel: routeLabelFor(routeId),
      payerText,
      confidence: payerField?.confidence,
      sourceEvidence: payerField?.sourceSnippet,
    };
  }, [verifiedFields.payer, extraction]);
  // Distinct from "no data found": set when the extraction REQUEST itself failed
  // (API unreachable / Brad reader errored), so the review panel can say so.
  const [extractionError, setExtractionError] = useState<string | null>(null);
  // True while Brad's 3-pass read is running — gates advancing/generating so the
  // user can't proceed with an empty review before extraction finishes.
  const [extracting, setExtracting] = useState(false);
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState('');
  const [selectedSourceMode, setSelectedSourceMode] = useState('');
  const [sourceIntent, setSourceIntent] = useState<'admission' | 'qapi' | ''>('');
  // Empty until Brad's suggestion or the user's Step-2 choice fills it — a truthy
  // default (e.g. 'PENDING_VERIFICATION') previously masked Brad's identified route
  // on the review screen. The final route is written on Step-2 confirmation.
  const [selectedBillingRoute, setSelectedBillingRoute] = useState('');
  // Step-2 lock: cards are read-only (Brad's pick highlighted) until the user hits
  // "Override selection". Confirmation writes the audit record below.
  const [billingLocked, setBillingLocked] = useState(true);
  const [billingConfirmation, setBillingConfirmation] = useState<BillingRouteConfirmation | null>(null);
  const [sourceModal, setSourceModal] = useState<'' | 'upload' | 'drive' | 'merge'>('');
  const [selectedDriveFolder, setSelectedDriveFolder] = useState('');
  // Real Drive folders from the manifest (source of truth) for the "Select from
  // Google Drive" picker. Loaded when the drive/merge modal opens.
  const [driveFolders, setDriveFolders] = useState<ManifestFolder[]>([]);
  const [driveFoldersErr, setDriveFoldersErr] = useState<string | null>(null);
  useEffect(() => {
    if (sourceModal !== 'drive' && sourceModal !== 'merge') return;
    let on = true;
    CalendarApi.manifestFolders()
      .then((r) => { if (on) { setDriveFolders(r.folders || []); setDriveFoldersErr(r.error ?? null); } })
      .catch((e) => { if (on) { setDriveFolders([]); setDriveFoldersErr(e instanceof Error ? e.message : 'Manifest unavailable'); } });
    return () => { on = false; };
  }, [sourceModal]);
  const [compileStage, setCompileStage] = useState<'idle' | 'brad' | 'drive'>('idle');
  const [previewPage, setPreviewPage] = useState(0);
  const [zoomPage, setZoomPage] = useState<number | null>(null); // full-screen page viewer index
  const [reviewChecked, setReviewChecked] = useState(false);
  const [signersAssigned, setSignersAssigned] = useState(false);
  const [alphaPreview, setAlphaPreview] = useState<AlphaPacketPreview | null>(null);
  const [alphaError, setAlphaError] = useState('');
  const [alphaSigners, setAlphaSigners] = useState<AlphaSignatureRequirement[]>([]);

  // Camera capture (photograph physical documents → file as evidence).
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    compileTimersRef.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // Full-screen reader: ESC closes; lock background scroll while open.
  useEffect(() => {
    if (zoomPage === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoomPage(null); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  }, [zoomPage]);

  const events = useMemo(() => {
    const byId = new Map<string, (typeof REGULATORY_EVENTS)[number]>();
    [...REGULATORY_EVENTS, ...MANDATED_EVENTS_EXPANDED]
      .filter((event) => !event.isContext)
      .forEach((event) => byId.set(event.id, event));
    return Array.from(byId.values());
  }, []);

  useEffect(() => {
    let on = true;
    CalendarApi.evidenceHealth().then((h) => on && setDriveHealth(h)).catch(() => on && setDriveHealth({ ok: false, enabled: false, provider: 'unknown', drive: { reachable: false, error: 'unreachable' } }));
    return () => { on = false; };
  }, []);
  const driveReachable = !!driveHealth?.drive?.reachable;

  const selectedEvent = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);
  const eventMatchesSelectedTemplate = useCallback((event: (typeof events)[number]) => {
    const title = `${event.title || ''} ${event.id || ''} ${event.eventSubType || ''} ${event.category || ''}`.toLowerCase();
    const domain = String(event.domain || '').toLowerCase();
    const cadence = String(event.cadence || '').toLowerCase();
    const isQapiMeeting = domain === 'qapi' && /qapi/.test(title) && /meeting|review/.test(title);

    if (/qapi/i.test(selectedTemplateTitle) && /quarterly/i.test(selectedTemplateTitle)) {
      return QUARTERLY_QAPI_EVENT_IDS.has(event.id) || (isQapiMeeting && cadence === 'quarterly');
    }
    if (selectedTemplateTitle === 'QAPI Monthly Committee Meeting') {
      return isQapiMeeting && cadence === 'monthly';
    }
    if (selectedTemplateTitle === 'Governing Body / Board Meeting') {
      return domain === 'governance' || /governing|board/.test(title);
    }
    if (selectedTemplateTitle === 'Patient Safety Committee') {
      return /patient safety|adverse|incident|sentinel|root-cause|near-miss/.test(title);
    }
    return true;
  }, [selectedTemplateTitle]);
  const contextualEvents = useMemo(() => {
    return events
      .filter((e) => e.date)
      .filter((e) => String(e.date) >= PRE_READINESS_START && String(e.date) <= PRE_READINESS_END)
      .filter(eventMatchesSelectedTemplate)
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))
      .map((event) => ({
      ...event,
      label: event.title,
    }));
  }, [eventMatchesSelectedTemplate, events]);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(''), 3000);
  }, []);

  const resetSourceAttachments = useCallback(() => {
    alphaSourceFilesRef.current = [];
    setAttachedFiles([]);
    setResult(null);
    setSourceParseSummary({ parsed: 0, needsExtraction: 0, failed: 0 });
    setSourceIntent('');
    setAlphaPreview(null);
    setAlphaError('');
    setReviewChecked(false);
    setSignersAssigned(false);
    setExtraction(null);
    setVerifiedFields({});
    setExtractionError(null);
  }, []);

  const chooseTemplate = useCallback((title: string) => {
    setSelectedTemplateTitle(title);
    setFlowStep(isPatientAdmissionTemplate(title) ? 'billing' : 'event');
    triggerToast(`${title} selected.`);
  }, [triggerToast]);

  // Enter Step 2: preselect Brad's route and LOCK the grid (read-only). If Brad
  // had no confident payer match, start unlocked so the user must pick.
  const enterBillingStep = useCallback(() => {
    setEventId('patient-admission');
    setBillingConfirmation(null);
    if (bradRouteSuggestion) {
      setSelectedBillingRoute(bradRouteSuggestion.routeId);
      setBillingLocked(true);
    } else {
      setSelectedBillingRoute('');
      setBillingLocked(false);
    }
    setFlowStep('billing');
  }, [bradRouteSuggestion]);

  // Override mode only: select a card (does NOT advance — the user confirms below).
  const selectBillingRoute = useCallback((routeId: string) => {
    if (billingLocked) return; // cards are read-only until "Override selection"
    setSelectedBillingRoute(routeId);
  }, [billingLocked]);

  // Confirm & Continue: write the audit record (preserving Brad's original
  // suggestion) and advance. Private Pay routes to the §8 rate table first.
  const confirmBillingRoute = useCallback(() => {
    const routeId = selectedBillingRoute;
    if (!routeId) { triggerToast('Select a billing route to continue.'); return; }
    const label = routeLabelFor(routeId);
    const confirmation = buildBillingRouteConfirmation(bradRouteSuggestion, routeId, new Date().toISOString());
    const overridden = confirmation.overridden;
    setBillingConfirmation(confirmation);
    setEventId('patient-admission');
    if (routeId === 'PRIVATE_PAY') {
      setFlowStep('rates');
      triggerToast('Private Pay confirmed — enter the service rates for the §8 agreement.');
      return;
    }
    setFlowStep('ready');
    triggerToast(overridden ? `Billing route overridden to ${label}.` : `${label} confirmed.`);
  }, [selectedBillingRoute, bradRouteSuggestion, triggerToast]);

  const chooseEvent = useCallback((id: string, title: string) => {
    setEventId(id);
    setFlowStep('ready');
    triggerToast(`${title} selected.`);
  }, [triggerToast]);

  const chooseSource = useCallback((mode: string) => {
    if (mode === 'Upload / Camera') setSourceModal('upload');
    else if (mode === 'Google Drive') setSourceModal('drive');
    else setSourceModal('merge');
  }, [triggerToast]);

  const confirmSourceSelection = useCallback(async () => {
    const label = sourceModal === 'drive' ? `Google Drive${selectedDriveFolder ? ` · ${selectedDriveFolder}` : ''}` : sourceModal === 'merge' ? 'Both (Merge)' : 'Upload / Camera';
    setSelectedSourceMode(label);
    setSourceModal('');
    setAttachmentsConfirmed(true);
    const admission = sourceIntent === 'admission' || isPatientAdmissionTemplate(selectedTemplateTitle);
    if (admission) {
      setSelectedTemplateTitle('Patient Admission Packet');
      setEventId('patient-admission');
      // Brad's 3x read runs NOW (only after Confirm) — the reading modal appears,
      // then we land on the review step with the extracted fields.
      const primary = alphaSourceFilesRef.current.find((f) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf') || alphaSourceFilesRef.current[0];
      if (primary) {
        setExtracting(true);
        try {
          const ex = await CalendarApi.extractSourceFile(primary, 'admission');
          setExtraction(ex);
          setVerifiedFields(seedVerifiedFields(ex));
          setExtractionError(null);
        } catch (e) {
          setExtraction(null);
          setVerifiedFields({});
          const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: unknown }).message ?? '') : '';
          setExtractionError(msg || 'Could not reach Brad’s reader.');
          triggerToast('Couldn’t reach Brad’s reader — check the API server, or fill fields manually.');
        } finally {
          setExtracting(false);
        }
      }
      setFlowStep('review');
    } else {
      setFlowStep('event');
    }
    triggerToast(`${label} selected.`);
  }, [selectedDriveFolder, selectedTemplateTitle, sourceIntent, sourceModal, triggerToast]);

  const startCompilePacket = useCallback(async () => {
    if (sourceIntent === 'admission' && !isPatientAdmissionTemplate(selectedTemplateTitle)) {
      setSelectedTemplateTitle('Patient Admission Packet');
      setEventId('patient-admission');
      setFlowStep('billing');
      triggerToast('Assessment/admission source detected. Choose the billing route before generating.');
      return;
    }
    if (!isPatientAdmissionTemplate(selectedTemplateTitle) && alphaSourceFilesRef.current.length > 0 && sourceParseSummary.parsed === 0) {
      setAlphaError('DefenCIble could not extract usable QAPI/event data from the attached source files. Upload JSON/CSV/TXT/MD source data or switch to Patient Admission for assessment/referral documents.');
      setFlowStep('alphaError');
      triggerToast('No usable QAPI/event source data was extracted.');
      return;
    }
    // (Private-pay rates are optional — no gate. Whatever is entered fills §8; blank
    // rows stay blank in the packet.)
    compileTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    setReviewChecked(false);
    setSignersAssigned(false);
    setPreviewPage(0);
    setZoomPage(null);
    setAlphaPreview(null);
    setAlphaError('');
    setCompileStage('brad');
    // Fail-safe: never let the "Uploading to Google Drive" overlay stick. If
    // generation/sync hasn't finished in time, surface the error and clear it.
    const FAILSAFE_MS = 75_000;
    let settled = false;
    // The "drive" overlay is shown after a short delay. CRITICAL: this timer must
    // be cleared on settle — otherwise a fast failure (studio rejects before 1.8s)
    // clears the overlay, then this timer re-shows it with nothing left to clear it.
    const driveTimer = window.setTimeout(() => { if (!settled) setCompileStage('drive'); }, 1800);
    const failsafe = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      window.clearTimeout(driveTimer);
      setCompileStage('idle');
      setAlphaPreview(null);
      setAlphaError('Packet generation timed out (the API or Brad did not respond). Your source is still selected — try again, or switch source.');
      setFlowStep('alphaError');
      triggerToast('Packet generation timed out.');
    }, FAILSAFE_MS);
    const clearCompileTimers = () => { window.clearTimeout(driveTimer); window.clearTimeout(failsafe); };
    compileTimersRef.current = [driveTimer, failsafe];
    try {
      const preview = await generateAlphaPacket({
        templateId: selectedTemplateTitle,
        templateTitle: selectedTemplateTitle,
        eventId,
        eventTitle: selectedEvent?.title,
        sourceMode: selectedSourceMode,
        billingRoute: isPatientAdmissionTemplate(selectedTemplateTitle) ? selectedBillingRoute : undefined,
        // For admission, ALWAYS pass the verified field map (the driver injects it
        // and skips studio file parsing). Empty fields => studio refuses cleanly
        // (no blank packet) rather than re-parsing a PDF it cannot read.
        admissionFields: isPatientAdmissionTemplate(selectedTemplateTitle) ? mapServerToStudio(verifiedFields) : undefined,
        sourceFiles: alphaSourceFilesRef.current,
      });
      if (settled) return; // fail-safe already fired
      settled = true;
      clearCompileTimers();
      setCompileStage('drive');
      window.setTimeout(() => {
        setAlphaPreview(preview);
        setCompileStage('idle');
        setFlowStep(preview.status === 'generated' || preview.status === 'synced' ? 'preview' : 'alphaError');
        triggerToast(preview.status === 'generated' || preview.status === 'synced' ? 'Brad packet preview is ready.' : 'Brad could not generate the packet from the available data.');
      }, 900);
    } catch (error) {
      if (settled) return; // fail-safe already fired
      settled = true;
      clearCompileTimers();
      setCompileStage('idle');
      setAlphaError(error instanceof Error ? error.message : 'Brad could not return a packet preview.');
      setAlphaPreview(null);
      setFlowStep('alphaError');
    }
  }, [eventId, selectedBillingRoute, selectedEvent?.title, selectedSourceMode, selectedTemplateTitle, sourceIntent, sourceParseSummary.parsed, verifiedFields, triggerToast]);

  const printOrDownloadPacket = useCallback(() => {
    if (alphaPreview?.pdfUrl || alphaPreview?.driveUrl) {
      window.open(alphaPreview.pdfUrl || alphaPreview.driveUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    // HTML packet: open a print window with the FULL packet (all pages) and print
    // THAT — never window.print() the app screen (which prints the studio, not the packet).
    const htmlPages = (alphaPreview?.pages || []).filter((p) => p.html);
    if (htmlPages.length) {
      const w = window.open('', '_blank');
      if (!w) { triggerToast('Allow pop-ups to print/download the packet.'); return; }
      const body = htmlPages.map((p) => `<div class="print-page">${p.html}</div>`).join('');
      w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${(alphaPreview?.title || 'Patient Admission Packet')}</title>`
        + `<style>@page{size:Letter;margin:0;}html,body{margin:0;padding:0;background:#fff;}`
        + `.print-page{width:8.5in;height:11in;overflow:hidden;page-break-after:always;break-after:page;}`
        + `.print-page:last-child{page-break-after:auto;break-after:auto;}`
        + `.rendered-page,.paper,.section-paper,.cover{border-radius:0!important;box-shadow:none!important;}</style></head><body>${body}</body></html>`);
      w.document.close();
      w.focus();
      window.setTimeout(() => { try { w.print(); } catch { /* user can print manually */ } }, 500);
      triggerToast('Opened the full packet for print / download.');
      return;
    }
    triggerToast('No packet pages to print yet.');
  }, [alphaPreview, triggerToast]);

  const setupAlphaSigning = useCallback(async () => {
    if (!alphaPreview) return;
    try {
      const requirements = await getSignatureRequirements(alphaPreview.packetId);
      setAlphaSigners(requirements.signers || []);
      setFlowStep('signers');
    } catch (error) {
      setAlphaError(error instanceof Error ? error.message : 'Alpha signature requirements are unavailable.');
      setFlowStep('alphaError');
    }
  }, [alphaPreview]);

  const scheduleAlphaSigning = useCallback(async () => {
    if (!alphaPreview) return;
    try {
      await scheduleSignatureTasks(alphaPreview.packetId);
      setSignersAssigned(true);
      setFlowStep('complete');
    } catch (error) {
      setAlphaError(error instanceof Error ? error.message : 'Alpha could not schedule signer tasks.');
      setFlowStep('alphaError');
    }
  }, [alphaPreview]);

  const handleFiles = useCallback(async (list: FileList | File[] | null) => {
    if (!list || !list.length) return;
    const files = Array.from(list);
    alphaSourceFilesRef.current = alphaSourceFilesRef.current.concat(files);
    setAttachedFiles((prev) => prev.concat(files.map((file) => ({ name: file.name, size: file.size }))));
    setBusy(true);
    let filed = 0, uploaded = 0, failed = 0;
    let parsedFiles = 0, needsExtractionFiles = 0, failedFiles = 0;
    let detectedIntent: 'admission' | 'qapi' | '' = sourceIntent;
    const policyIds = selectedEvent?.policyRefs ?? [];
    const workflowId = selectedEvent?.workflowId;
    for (const file of files) {
      const { text, headBytes } = await readText(file);
      detectedIntent = detectedIntent || inferSourceIntent(file.name, text);
      const parsed = parseSourceFile({ fileName: file.name, mimeType: file.type, text, headBytes, byteLength: file.size });
      if (parsed.parseStatus !== 'parsed') {
        if (parsed.parseStatus === 'needs_extraction') needsExtractionFiles += 1;
        else { failed += 1; failedFiles += 1; }
        continue;
      }
      parsedFiles += 1;
      const fileId = `FILE-${sanitizeFileName(file.name)}-${Date.now()}`;
      for (const cell of parsed.records) {
        const rec: EvidenceSourceRecord = extractRecordFromCell(cell, {
          batchId: `studio-${Date.now()}`, sourceFileId: fileId, sourceFileName: file.name,
          sourceSystem: 'unknown' as SourceSystem, uploadedAt: new Date().toISOString(),
        });
        if (rec.status === 'needs_date_review' || !rec.filingPeriodKey) continue;
        const id = { sourceSystem: rec.sourceSystem, sourceRecordId: rec.sourceRecordId, sourceSystemCreatedAt: rec.sourceSystemCreatedAt, contentHash: rec.contentHash, sourcePointer: rec.sourcePointer };
        const persisted = persistCanonicalEvidence(rec, {
          eventKey: eventId, eventId, workflowId, policyIds,
          identityScope: buildEvidenceIdentityScope(id), idempotencyKey: buildIdempotencyKey(id),
        });
        if (!persisted.evidenceId || persisted.reused) continue;
        filed += 1;
        if (driveReachable) {
          try {
            const out = await CalendarApi.intakeUploadEvidence({
              canonicalEvidenceId: persisted.evidenceId, filingPeriodKey: rec.filingPeriodKey,
              filingQuarterKey: rec.filingQuarterKey ?? undefined, classification: rec.classification,
              title: `${rec.classification} ${rec.sourcePointer}`,
              fileName: `${sanitizeFileName(file.name)}-${rec.sourcePointer.replace(/[^A-Za-z0-9]+/g, '-')}.json`,
              mimeType: 'application/json', contentBase64: b64(JSON.stringify(cell.fields, null, 2)), eventId,
            });
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: true, driveFileId: out.driveFileId, driveFolderId: out.driveFolderId, driveFolderPath: out.driveFolderPath, driveWebViewLink: out.driveWebViewLink });
            uploaded += 1;
          } catch (e) {
            const err = e as { message?: string; code?: string };
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: false, errorCode: err.code, errorMessage: err.message });
            failed += 1;
          }
        }
      }
    }
    setSourceParseSummary((prev) => ({
      parsed: prev.parsed + parsedFiles,
      needsExtraction: prev.needsExtraction + needsExtractionFiles,
      failed: prev.failed + failedFiles,
    }));
    if (detectedIntent) {
      setSourceIntent(detectedIntent);
      if (detectedIntent === 'admission' && (!selectedTemplateTitle || /qapi/i.test(selectedTemplateTitle))) {
        setSelectedTemplateTitle('Patient Admission Packet');
        setEventId('patient-admission');
      }
    }
    // NOTE: Brad's 3x source read runs on CONFIRM (confirmSourceSelection), not on
    // file selection — so the reading modal appears only after the user confirms.
    setResult({ filed, uploaded, failed });
    setBusy(false);
    triggerToast(detectedIntent === 'admission'
      ? `${files.length} file${files.length === 1 ? '' : 's'} attached. Patient admission source detected.`
      : `${files.length} file${files.length === 1 ? '' : 's'} attached for packet binding.`);
  }, [selectedEvent, eventId, driveReachable, sourceIntent, selectedTemplateTitle, attachmentsConfirmed, triggerToast]);

  const openCamera = useCallback(async () => {
    setCameraError(null);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; void videoRef.current.play(); } }, 0);
    } catch (e) {
      setCameraError((e as Error).message || 'Camera access was denied or is unavailable.');
    }
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }, []);

  const captureDocument = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !selectedEvent) return;
    const w = video.videoWidth || 1280, h = video.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    const nextShot = camShots + 1;
    setCamShots(nextShot);
    setAttachedFiles((prev) => prev.concat({ name: `captured-scan-${nextShot}.jpg`, size: Math.round((base64.length * 3) / 4) }));
    setBusy(true);
    const ts = new Date().toISOString();
    const rec: EvidenceSourceRecord = extractRecordFromCell(
      { pointer: `camera:${Date.now()}`, fields: { capturedAt: ts, kind: 'document_photo' }, text: 'scanned document photo capture' },
      { batchId: `camera-${Date.now()}`, sourceFileId: `CAM-${Date.now()}`, sourceFileName: `document-capture-${ts.slice(0, 10)}.jpg`, sourceSystem: 'manual' as SourceSystem, uploadedAt: ts },
    );
    let filed = 0, uploaded = 0, failed = 0;
    if (rec.filingPeriodKey) {
      const id = { sourceSystem: rec.sourceSystem, sourceRecordId: rec.sourceRecordId, sourceSystemCreatedAt: rec.sourceSystemCreatedAt, contentHash: rec.contentHash, sourcePointer: rec.sourcePointer };
      const persisted = persistCanonicalEvidence(rec, {
        eventKey: eventId, eventId, workflowId: selectedEvent.workflowId, policyIds: selectedEvent.policyRefs ?? [],
        identityScope: buildEvidenceIdentityScope(id), idempotencyKey: buildIdempotencyKey(id),
      });
      if (persisted.evidenceId) {
        filed = 1;
        if (driveReachable) {
          try {
            const out = await CalendarApi.intakeUploadEvidence({
              canonicalEvidenceId: persisted.evidenceId, filingPeriodKey: rec.filingPeriodKey,
              filingQuarterKey: rec.filingQuarterKey ?? undefined, classification: rec.classification,
              title: `Document photo ${ts.slice(0, 10)}`, fileName: `document-capture-${Date.now()}.jpg`,
              mimeType: 'image/jpeg', contentBase64: base64, eventId,
            });
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: true, driveFileId: out.driveFileId, driveFolderId: out.driveFolderId, driveFolderPath: out.driveFolderPath, driveWebViewLink: out.driveWebViewLink });
            uploaded = 1;
          } catch (e) {
            const err = e as { message?: string; code?: string };
            applyDriveOutcome(eventId, persisted.evidenceId, { ok: false, errorCode: err.code, errorMessage: err.message });
            failed = 1;
          }
        }
      }
    }
    setResult({ filed, uploaded, failed });
    setBusy(false);
    triggerToast(`Captured scan ${nextShot} and attached it.`);
  }, [selectedEvent, eventId, driveReachable, camShots, triggerToast]);

  return (
    <section className="grid gap-sm">
      <input ref={fileInputRef} aria-label="Upload source documents" title="Upload source documents" type="file" multiple accept={ACCEPTED_SOURCE_FILES} className="hidden" onChange={(e) => void handleFiles(e.target.files)} />
      {/* STEP 1 — pick the packet template FIRST (before choosing a data source). */}
      {!selectedTemplateTitle && <div className="mx-auto w-full max-w-[1180px] font-roboto">
        <div className="rounded-[32px] bg-white/95 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
          <h2 className="text-center font-montserrat text-lg font-bold uppercase tracking-widest text-[#1F1C1B]">1 · Select a packet template *</h2>
          <p className="mt-4 text-center font-roboto text-sm text-[#524D4B]">Choose the packet structure first; you’ll pick the data source next.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ['Patient Admission Packet', 'Full patient admission agreement with standard consents.', '#FACC15'],
              ['QAPI Quarterly Committee Meeting', 'Quarterly QAPI committee review with KPIs, PIPs, incidents, and audits.', '#FB923C'],
              ['QAPI Monthly Committee Meeting', 'Monthly QAPI review for rolling KPIs, open PIPs, incidents, and complaints.', '#78716C'],
              ['Governing Body / Board Meeting', 'Governance review of operations, financials, compliance, and quality.', '#22C55E'],
              ['Patient Safety Committee', 'Review adverse events, near-misses, root-cause analyses, and trends.', '#06B6D4'],
              ['Custom Meeting Packet', 'Build a custom packet from attached source evidence.', '#2563EB'],
            ].map(([title, desc, color], index) => (
              <button
                key={title}
                type="button"
                className="relative min-h-[180px] overflow-hidden rounded-[24px] bg-white p-6 pr-16 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                onClick={() => chooseTemplate(title)}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFBF8] text-lg text-[#747470] shadow-sm">{index + 1}</div>
                <h3 className="font-montserrat text-sm font-bold uppercase tracking-wide text-[#1F1C1B]">{title}</h3>
                <p className="mt-3 font-roboto text-sm leading-6 text-[#747470]">{desc}</p>
                <span className="absolute bottom-0 right-0 top-0 w-10 rounded-r-[24px]" style={{ background: color }} />
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* STEP 2 — choose the data source (only after a template is selected). */}
      {selectedTemplateTitle && !attachmentsConfirmed && <div className="mx-auto w-full max-w-[1180px] font-roboto">
        <div className="rounded-[32px] bg-white/95 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="font-roboto text-sm text-[#747470]">Template: <strong className="text-[#1F1C1B]">{selectedTemplateTitle}</strong></span>
            <button type="button" onClick={() => { setSelectedTemplateTitle(''); setFlowStep('template'); }} className="rounded-full bg-[#EBE6E6] px-3 py-1 font-montserrat text-[11px] uppercase tracking-wider text-[#1F1C1B] hover:bg-[#E0DADA]">Change template</button>
          </div>
          <h2 className="text-center font-montserrat text-lg font-bold uppercase tracking-widest text-[#1F1C1B]">2 · Select Data Source *</h2>
          <p className="mt-4 text-center font-roboto text-sm text-[#524D4B]">Choose where the source evidence will be pulled from.</p>
          <div className="mt-12 flex flex-wrap justify-center gap-12">
            {[
              ['Upload / Camera', 'Local files & scans', '#9CA3AF', '⇧'],
              ['Google Drive', 'Cloud evidence', '#EF4444', 'drive'],
              ['Both (Merge)', 'Combine sources', '#06B6D4', '▢'],
            ].map(([title, desc, color, icon]) => (
              <button
                key={title}
                type="button"
                onClick={() => chooseSource(title)}
                className="flex h-[220px] w-[220px] flex-col items-center justify-center rounded-full bg-white text-center shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ border: `14px solid ${color}` }}
              >
                {icon === 'drive' ? (
                  <img src={GOOGLE_DRIVE_LOGO} alt="" className="h-10 w-10 object-contain" />
                ) : (
                  <span className="text-3xl" style={{ color }}>{icon}</span>
                )}
                <strong className="mt-4 font-montserrat text-sm uppercase tracking-wider text-[#1F1C1B]">{title}</strong>
                <span className="mt-2 font-roboto text-xs text-[#747470]">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>}

      {!attachmentsConfirmed && result && (
        <div className={`flex flex-wrap items-center gap-md rounded-lg px-md py-sm text-xs ${result.failed > 0 ? 'text-tone-orange-text' : 'text-brand-teal-deep'}`}>
          <span className="flex items-center gap-xs"><CheckCircle2 className="h-4 w-4" /> Filed {result.filed} to Library</span>
          {driveReachable && <span className="flex items-center gap-xs"><CloudUpload className="h-4 w-4" /> {result.uploaded} to Drive</span>}
          {result.failed > 0 && <span className="flex items-center gap-xs"><XCircle className="h-4 w-4" /> {result.failed} failed/skipped</span>}
        </div>
      )}

      {selectedTemplateTitle && attachmentsConfirmed && (
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 font-roboto">
          <div className="mx-auto flex w-full max-w-[900px] flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/95 px-6 py-4 text-xs shadow-[0_12px_45px_rgba(0,0,0,0.04)]">
            <span className="font-montserrat font-medium text-[#1F1C1B]">
              Source selected: {selectedSourceMode || 'Pending'}
              {attachedFiles.length > 0 ? ` · ${attachedFiles.length} file${attachedFiles.length === 1 ? '' : 's'}` : ''}
            </span>
            <button type="button" onClick={() => { resetSourceAttachments(); setAttachmentsConfirmed(false); }} className="rounded-full bg-[#EBE6E6] px-4 py-2 font-montserrat text-[11px] uppercase tracking-wider text-[#1F1C1B] hover:bg-[#E0DADA]">
              Change Source
            </button>
          </div>

          {flowStep === 'event' && <div className="rounded-[32px] bg-white/95 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
            <button type="button" onClick={() => { resetSourceAttachments(); setAttachmentsConfirmed(false); setSelectedTemplateTitle(''); setFlowStep('template'); }} className="mb-8 font-montserrat text-xs font-bold uppercase tracking-widest text-[#747470]">← Back to templates</button>
            <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest text-[#1F1C1B]">1 · Specific Event *</h2>
            <p className="mt-6 font-roboto text-sm text-[#524D4B]">
              Showing January-June 2026 events that match the selected {selectedTemplateTitle || 'packet'} template. Generated packets for these pre-readiness events are routed to Drive folder {PRE_READINESS_EVENT_FOLDER_ID}.
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {contextualEvents.length ? contextualEvents.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => chooseEvent(e.id, e.title)}
                  className="min-h-[150px] rounded-[24px] bg-white p-8 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
                >
                  <strong className="block font-montserrat text-xl font-bold text-[#1F1C1B]">{e.label}</strong>
                  <span className="mt-4 block font-roboto text-sm text-[#747470]">{e.date || 'Date TBD'} | {e.id}</span>
                </button>
              )) : (
                <div className="rounded-[24px] bg-white p-8 font-roboto text-sm text-[#747470] shadow-md md:col-span-3">
                  No January-June 2026 events match this template.
                </div>
              )}
            </div>
          </div>}

          {flowStep === 'review' && (() => {
            const ex = extraction?.extraction;
            const fieldList = ex?.fields?.length ? ex.fields.map((f) => f.key)
              : ['patient_name', 'medical_record', 'date_of_birth', 'start_of_care', 'primary_physician', 'admitting_clinician', 'payer', 'diagnosis'];
            const fieldByKey = new Map((ex?.fields ?? []).map((f) => [f.key, f]));
            const conflictByKey = new Map((ex?.conflicts ?? []).map((c) => [c.key, c.values]));
            const meta = extraction?.metadata;
            const confColor = (c: number) => c >= 0.8 ? 'bg-[#E6F6EC] text-[#008540]' : c >= 0.5 ? 'bg-[#FFF4E5] text-[#B45309]' : 'bg-[#F1EEED] text-[#747470]';
            return (
              <div className="rounded-[32px] bg-white/95 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
                <button type="button" onClick={() => { resetSourceAttachments(); setAttachmentsConfirmed(false); setSelectedTemplateTitle(''); setExtraction(null); setVerifiedFields({}); setFlowStep('template'); }} className="mb-6 font-montserrat text-xs font-bold uppercase tracking-widest text-[#747470]">← Back to templates</button>
                <h2 className="font-montserrat text-2xl font-bold text-[#1F1C1B]">Verify extracted patient details</h2>
                <p className="mt-2 font-roboto text-sm text-[#524D4B]">{ex?.validationSummary || 'Review and confirm the details below before generating. Nothing is invented — empty fields were not found in the source.'}</p>
                {extractionError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-800">Couldn’t reach Brad’s reader — is the API server running? Fields below are empty; fill them manually or go back and retry.</div>
                )}
                {!extractionError && ex?.engine === 'unavailable' && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">Brad’s automated 3-pass reading is offline — only pre-filled form values are shown. Verify everything manually below.</div>
                )}
                {meta && (
                  <p className="mt-2 font-roboto text-xs text-[#A8A29E]">Source: {meta.fileName} · {meta.format.toUpperCase()}{meta.pageCount ? ` · ${meta.pageCount} pages` : ''} · id {meta.sourceId}</p>
                )}
                {(() => {
                  const grouped = new Map<string, string[]>();
                  for (const gk of fieldList) { const g = fieldByKey.get(gk)?.group || 'Patient'; if (!grouped.has(g)) grouped.set(g, []); grouped.get(g)!.push(gk); }
                  const orderedGroups = ADMISSION_GROUP_ORDER.filter((g) => grouped.has(g)).concat([...grouped.keys()].filter((g) => !ADMISSION_GROUP_ORDER.includes(g)));
                  const renderField = (key: string) => {
                    const f = fieldByKey.get(key);
                    const readOnly = ADMISSION_FIELDS_NOT_IN_PACKET.has(key);
                    const conflict = conflictByKey.get(key);
                    return (
                      <div key={key} className="rounded-[18px] border border-[#EAE4E3] bg-white p-4">
                        <div className="flex items-center justify-between gap-2">
                          <label className="font-montserrat text-xs font-bold uppercase tracking-wide text-[#1F1C1B]">{ADMISSION_FIELD_LABELS[key] || key}</label>
                          <span className="flex items-center gap-1">
                            {f && <span className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${confColor(f.confidence || 0)}`}>{Math.round((f.confidence || 0) * 100)}%{f.agreement ? ` · ${f.agreement}/3` : ''}</span>}
                            {f?.needsReview && <span className="rounded bg-[#FFF0E5] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#C74601]">Review</span>}
                          </span>
                        </div>
                        {readOnly ? (
                          <div className="mt-2 font-roboto text-sm text-[#A8A29E]">{verifiedFields[key] || '—'} <span className="text-[10px]">(not used in packet)</span></div>
                        ) : (
                          <input
                            type="text"
                            value={verifiedFields[key] ?? ''}
                            onChange={(e) => setVerifiedFields((p) => ({ ...p, [key]: e.target.value }))}
                            placeholder="Not found — type to fill"
                            className={`mt-2 w-full rounded-lg border bg-white px-3 py-2 font-roboto text-sm text-[#1F1C1B] outline-none focus:border-[#007970] ${f?.needsReview ? 'border-[#F6C99A]' : 'border-[#EAE4E3]'}`}
                          />
                        )}
                        {conflict && conflict.length > 1 && (
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            <span className="font-roboto text-[10px] text-[#C74601]">Conflicting reads:</span>
                            {conflict.map((cv, i) => (
                              <button key={i} type="button" onClick={() => setVerifiedFields((p) => ({ ...p, [key]: cv }))} className="rounded-full border border-[#F6C99A] bg-[#FFF7EF] px-2 py-0.5 font-roboto text-[10px] text-[#C74601] hover:bg-[#FFE9D6]">{cv}</button>
                            ))}
                          </div>
                        )}
                        {f?.sourceSnippet ? (
                          <p className="mt-2 font-roboto text-[11px] italic text-[#747470]">“{f.sourceSnippet.slice(0, 140)}”</p>
                        ) : !readOnly ? (
                          <p className="mt-2 font-roboto text-[11px] text-[#A8A29E]">No source evidence — verify manually.</p>
                        ) : null}
                      </div>
                    );
                  };
                  return orderedGroups.map((g) => (
                    <div key={g} className="mt-8">
                      <h3 className="mb-3 font-montserrat text-xs font-bold uppercase tracking-widest text-[#007970]">{g}</h3>
                      <div className="grid gap-4 md:grid-cols-2">{grouped.get(g)!.map(renderField)}</div>
                    </div>
                  ));
                })()}
                {(() => {
                  // Read-only display of Brad's suggestion. The user confirms or
                  // overrides on Step 2 — this is not the final source of truth.
                  return (
                    <div className="mt-4 rounded-[18px] border border-[#EAE4E3] bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <label className="font-montserrat text-xs font-bold uppercase tracking-wide text-[#1F1C1B]">Billing route</label>
                        {bradRouteSuggestion
                          ? <span className="rounded bg-[#E6F6EC] px-1.5 py-0.5 text-[9px] font-medium text-[#008540]">Brad identified</span>
                          : <span className="rounded bg-[#F1EEED] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#747470]">Not identified</span>}
                      </div>
                      <div className="mt-2 font-roboto text-sm font-medium text-[#1F1C1B]">{bradRouteSuggestion?.routeLabel || 'Pending Verification'}</div>
                      <p className="mt-2 font-roboto text-[11px] text-[#A8A29E]">{verifiedFields.payer ? `From payer: “${verifiedFields.payer}”. You'll confirm or override this on the next step.` : 'No payer found in the source — you’ll pick the route on the next step.'}</p>
                    </div>
                  );
                })()}
                {ex?.missing?.length ? (
                  <div className="mt-6 rounded-lg border border-[#F6C99A] bg-[#FFF7EF] px-4 py-3 font-roboto text-xs text-[#9A3412]">
                    Brad could not confidently read: {ex.missing.map((k) => ADMISSION_FIELD_LABELS[k] || k).join(', ')}. Type them above or leave blank to complete by hand.
                  </div>
                ) : null}
                <div className="mt-8 flex items-center justify-end gap-3">
                  <button type="button" onClick={() => { resetSourceAttachments(); setAttachmentsConfirmed(false); setExtraction(null); setVerifiedFields({}); }} className="rounded-full bg-[#EBE6E6] px-6 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-[#1F1C1B] hover:bg-[#E0DADA]">Change source</button>
                  <button type="button" onClick={enterBillingStep} className="rounded-full bg-[#007970] px-8 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-white hover:bg-[#005f58]">Confirm &amp; continue →</button>
                </div>
              </div>
            );
          })()}

          {flowStep === 'billing' && <div className="rounded-[32px] bg-white/95 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
            <button type="button" onClick={() => { resetSourceAttachments(); setAttachmentsConfirmed(false); setSelectedTemplateTitle(''); setFlowStep('template'); }} className="mb-8 font-montserrat text-xs font-bold uppercase tracking-widest text-[#747470]">← Back to templates</button>
            <h2 className="text-center font-montserrat text-lg font-bold uppercase tracking-widest text-[#1F1C1B]">2 · Confirm Billing Route *</h2>
            {/* Prominent, bold guidance — locked vs override copy. */}
            <div className="mx-auto mt-5 max-w-2xl rounded-[18px] border border-[#CDE9E6] bg-[#F2FBFA] px-6 py-4 text-center">
              {billingLocked && bradRouteSuggestion ? (
                <p className="font-roboto text-[15px] font-semibold leading-7 text-[#1F1C1B]">
                  Brad identified the payer as <span className="text-[#007970]">“{bradRouteSuggestion.payerText}”</span> and selected <span className="text-[#007970]">“{bradRouteSuggestion.routeLabel}”</span> as the billing route.<br />
                  <span className="font-roboto text-[13px] font-normal text-[#524D4B]">If this is not correct, select “Override selection” and choose the replacement route. For compliance and best practice, only one billing route will be reflected in the final packet.</span>
                </p>
              ) : (
                <p className="font-roboto text-[15px] font-semibold leading-7 text-[#1F1C1B]">
                  {bradRouteSuggestion ? 'Override mode is active. Select the one billing route that should appear in the packet.' : 'Brad could not confidently identify a payer. Select the one billing route that should appear in the packet.'}
                  {bradRouteSuggestion ? <span className="mt-1 block font-roboto text-[12px] font-normal text-[#747470]">Brad’s original suggestion: {bradRouteSuggestion.routeLabel}</span> : null}
                </p>
              )}
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {ADMISSION_BILLING_ROUTES.map((route) => {
                const isSelected = selectedBillingRoute === route.id;
                const isBrad = bradRouteSuggestion?.routeId === route.id;
                const dimmed = billingLocked && !isSelected; // non-selected cards read-only/dim while locked
                return (
                  <button
                    key={route.id}
                    type="button"
                    disabled={billingLocked}
                    onClick={() => selectBillingRoute(route.id)}
                    className={`relative min-h-[160px] rounded-[22px] bg-white p-5 text-left shadow-md transition-all ${billingLocked ? 'cursor-default' : 'hover:-translate-y-1 hover:shadow-lg'} ${isSelected ? 'ring-2 ring-[#007970] shadow-lg' : ''} ${dimmed ? 'opacity-45' : ''}`}
                  >
                    {isSelected && isBrad && (
                      <span className="absolute right-3 top-3 rounded-full bg-[#E6F6EC] px-2 py-0.5 font-montserrat text-[9px] font-bold uppercase tracking-wide text-[#008540]">Brad identified</span>
                    )}
                    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E5FEFF] font-montserrat text-sm font-bold text-[#007970]">{route.icon}</span>
                    <strong className="block font-montserrat text-sm font-bold uppercase tracking-wide text-[#1F1C1B]">{route.title}</strong>
                    <span className="mt-3 block font-roboto text-sm leading-6 text-[#747470]">{route.desc}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex items-center justify-between gap-3">
              {billingLocked && bradRouteSuggestion ? (
                <button type="button" onClick={() => setBillingLocked(false)} className="rounded-full border border-[#C74601] bg-white px-6 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-[#C74601] hover:bg-[#FFF3EC]">Override selection</button>
              ) : bradRouteSuggestion ? (
                <button type="button" onClick={() => { setSelectedBillingRoute(bradRouteSuggestion.routeId); setBillingLocked(true); }} className="rounded-full border border-[#EAE4E3] bg-white px-6 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-[#747470] hover:bg-[#F5F2F1]">Use Brad’s selection</button>
              ) : <span />}
              <button type="button" onClick={confirmBillingRoute} disabled={!selectedBillingRoute} className="rounded-full bg-[#007970] px-8 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-white hover:bg-[#005f58] disabled:cursor-not-allowed disabled:bg-[#EBE6E6] disabled:text-[#A8A29E]">{billingLocked ? 'Confirm & Continue →' : 'Use selected route →'}</button>
            </div>
          </div>}

          {flowStep === 'rates' && (() => {
            const setRow = (key: keyof PrivatePayRates, field: keyof PrivatePayRateRow, val: string) =>
              setPrivatePayRates((prev) => ({ ...prev, [key]: { ...(prev[key] as PrivatePayRateRow | undefined), [field]: val } }));
            const setFlat = (key: keyof PrivatePayRates, val: string) => setPrivatePayRates((prev) => ({ ...prev, [key]: val }));
            const rowVal = (key: keyof PrivatePayRates) => (privatePayRates[key] as PrivatePayRateRow | undefined) || {};
            const cellCls = 'w-full rounded-[8px] border border-[#d9e4e4] bg-white px-2 py-1.5 font-roboto text-sm text-[#1F1C1B] outline-none focus:border-[#007970]';
            return (
              <div className="rounded-[32px] bg-white/95 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
                <button type="button" onClick={() => setFlowStep('billing')} className="mb-8 font-montserrat text-xs font-bold uppercase tracking-widest text-[#747470]">← Back to billing route</button>
                <h2 className="text-center font-montserrat text-lg font-bold uppercase tracking-widest text-[#1F1C1B]">2b · Private-Pay Rates</h2>
                <p className="mx-auto mt-4 max-w-2xl text-center font-roboto text-sm leading-6 text-[#524D4B]">Private Pay was selected. Enter the rates for the §8 Private-Pay Service Agreement. Blank rows stay blank in the packet — enter at least one service rate to continue.</p>
                <div className="mt-8 overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse font-roboto text-sm">
                    <thead>
                      <tr className="text-left font-montserrat text-[11px] uppercase tracking-wider text-[#747470]">
                        <th className="py-2 pr-3">Service</th><th className="py-2 px-2">Description</th><th className="py-2 px-2">Rate ($)</th><th className="py-2 px-2">Min hrs/visit</th><th className="py-2 px-2">Est. {`hrs`}/wk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PRIVATE_PAY_SERVICES.map((s) => (
                        <tr key={s.key} className="border-t border-[#eef2f2]">
                          <td className="py-2 pr-3 font-medium text-[#1F1C1B]">{s.label}</td>
                          <td className="px-2 py-2">{s.hasDesc ? <input className={cellCls} value={rowVal(s.key).desc ?? ''} onChange={(e) => setRow(s.key, 'desc', e.target.value)} placeholder="—" /> : <span className="text-[#A8A29E]">per visit</span>}</td>
                          <td className="px-2 py-2"><input className={cellCls} value={rowVal(s.key).rate ?? ''} onChange={(e) => setRow(s.key, 'rate', e.target.value)} placeholder={s.perVisit ? '/visit' : '/hr'} /></td>
                          <td className="px-2 py-2">{s.perVisit ? <span className="text-[#A8A29E]">N/A</span> : <input className={cellCls} value={rowVal(s.key).min ?? ''} onChange={(e) => setRow(s.key, 'min', e.target.value)} placeholder="—" />}</td>
                          <td className="px-2 py-2"><input className={cellCls} value={rowVal(s.key).week ?? ''} onChange={(e) => setRow(s.key, 'week', e.target.value)} placeholder="—" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <label className="font-roboto text-sm text-[#524D4B]">Estimated weekly cost ($)<input className={`mt-1 ${cellCls}`} value={privatePayRates.weeklyCost ?? ''} onChange={(e) => setFlat('weeklyCost', e.target.value)} /></label>
                  <label className="font-roboto text-sm text-[#524D4B]">Estimated monthly cost ($)<input className={`mt-1 ${cellCls}`} value={privatePayRates.monthlyCost ?? ''} onChange={(e) => setFlat('monthlyCost', e.target.value)} /></label>
                  <label className="font-roboto text-sm text-[#524D4B]">Medical supplies markup (%)<input className={`mt-1 ${cellCls}`} value={privatePayRates.suppliesMarkup ?? ''} onChange={(e) => setFlat('suppliesMarkup', e.target.value)} /></label>
                  <label className="font-roboto text-sm text-[#524D4B]">Mileage ($/mile)<input className={`mt-1 ${cellCls}`} value={privatePayRates.mileage ?? ''} onChange={(e) => setFlat('mileage', e.target.value)} /></label>
                  <label className="font-roboto text-sm text-[#524D4B]">Holiday surcharge (%)<input className={`mt-1 ${cellCls}`} value={privatePayRates.holiday ?? ''} onChange={(e) => setFlat('holiday', e.target.value)} /></label>
                  <label className="font-roboto text-sm text-[#524D4B]">Weekend / after-hours surcharge (%)<input className={`mt-1 ${cellCls}`} value={privatePayRates.weekend ?? ''} onChange={(e) => setFlat('weekend', e.target.value)} /></label>
                  <label className="font-roboto text-sm text-[#524D4B]">Rush scheduling fee ($)<input className={`mt-1 ${cellCls}`} value={privatePayRates.rush ?? ''} onChange={(e) => setFlat('rush', e.target.value)} /></label>
                </div>
                <div className="mt-10 flex justify-end">
                  <button type="button" onClick={() => setFlowStep('ready')} className="rounded-full bg-[#007970] px-8 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-white hover:bg-[#005f58]">Save rates &amp; continue →</button>
                </div>
              </div>
            );
          })()}

          {flowStep === 'ready' && <div className="rounded-[32px] bg-white/95 p-8 text-center shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
            <button type="button" onClick={() => setFlowStep(isPatientAdmissionTemplate(selectedTemplateTitle) ? (selectedBillingRoute === 'PRIVATE_PAY' ? 'rates' : 'billing') : 'event')} className="mb-8 font-montserrat text-xs font-bold uppercase tracking-widest text-[#747470]">← Back to {isPatientAdmissionTemplate(selectedTemplateTitle) ? (selectedBillingRoute === 'PRIVATE_PAY' ? 'rates' : 'billing route') : 'event'}</button>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5FEFF] text-2xl text-[#007970]">✓</div>
            <h2 className="font-montserrat text-2xl font-bold text-[#1F1C1B]">Ready to Compile Packet</h2>
            <p className="mx-auto mt-3 max-w-xl font-roboto text-sm leading-6 text-[#524D4B]">
              {isPatientAdmissionTemplate(selectedTemplateTitle)
                ? `${selectedTemplateTitle} is configured with ${ADMISSION_BILLING_ROUTES.find((route) => route.id === selectedBillingRoute)?.title || 'the selected billing route'} using ${selectedSourceMode}.`
                : `${selectedTemplateTitle} is linked to the selected event using ${selectedSourceMode}.`}
              {' '}The next action triggers Alpha generation without returning to the old studio.
            </p>
            {isPatientAdmissionTemplate(selectedTemplateTitle) && billingConfirmation && (
              <p className="mx-auto mt-3 max-w-xl font-roboto text-xs text-[#747470]">
                Confirmed billing route: <strong className="text-[#1F1C1B]">{billingConfirmation.confirmedRouteLabel}</strong>
                {billingConfirmation.overridden
                  ? ` (overrode Brad’s suggestion of ${billingConfirmation.originalSuggestedRouteLabel || '—'}). Only this route appears in the packet.`
                  : ' (Brad’s identified route, confirmed). Only this route appears in the packet.'}
              </p>
            )}
            <button type="button" onClick={startCompilePacket} className="mt-8 rounded-full bg-[#C74601] px-10 py-4 font-montserrat text-xs font-medium uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#421700] hover:shadow-lg">
              Compile Packet
            </button>
          </div>}

          {flowStep === 'preview' && <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_12px_45px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE4E3] bg-white/95 px-6 py-4 md:px-8">
              <button type="button" className="flex items-center gap-2 rounded-[10px] border border-[#cfe6e8] px-4 py-2 font-roboto text-sm text-[#747470]">
                <span className="h-5 w-5 rounded border border-[#747470]" /> Testing · skip iterations
              </button>
              <div className="flex items-center gap-3">
                <span className="h-2 w-14 rounded-full bg-[#007970]" />
                <span className="h-2 w-14 rounded-full bg-[#007970]" />
                <span className="h-2 w-20 rounded-full bg-[#007970]" />
                <span className="ml-2 font-montserrat text-sm font-medium tracking-wider text-[#747470]">Step 3 · Preview & Export</span>
              </div>
              <div className="flex items-center gap-2">
                {isPatientAdmissionTemplate(selectedTemplateTitle) && <button type="button" onClick={() => setFlowStep('review')} className="rounded-[10px] border border-[#cfe6e8] bg-white px-5 py-3 font-montserrat text-sm font-medium text-[#007970] shadow-sm hover:bg-[#FAFBF8]">← Edit fields</button>}
                <button type="button" onClick={() => setFlowStep('ready')} className="rounded-[10px] border border-[#cfe6e8] bg-white px-6 py-3 font-montserrat text-sm font-medium text-[#007970] shadow-sm hover:bg-[#FAFBF8]">← Back</button>
                <button type="button" onClick={() => void setupAlphaSigning()} className="rounded-[10px] bg-[#007970] px-7 py-3 font-montserrat text-sm font-medium text-white shadow-md hover:bg-[#004142]">Set up Signing →</button>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white via-[#f8ffff] to-white px-8 py-14">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[18px] bg-white px-5 py-4 font-roboto text-sm text-[#524D4B] shadow-sm">
                <span><strong className="font-montserrat text-[#1F1C1B]">{alphaPreview?.title || 'Alpha Packet'}</strong></span>
                <span>Packet {alphaPreview?.packetId || 'pending'} · {alphaPreview?.pageCount || 0} pages · {alphaPreview?.status || 'draft'}</span>
                {alphaPreview?.driveUrl && <a href={alphaPreview.driveUrl} target="_blank" rel="noreferrer" className="font-montserrat text-xs font-bold uppercase tracking-wider text-[#007970]">Open Drive</a>}
                {alphaPreview?.pdfUrl && <a href={alphaPreview.pdfUrl} target="_blank" rel="noreferrer" className="font-montserrat text-xs font-bold uppercase tracking-wider text-[#007970]">Open PDF</a>}
              </div>
              <div className="flex gap-10 overflow-x-auto pb-8 [scrollbar-width:thin]">
                {(alphaPreview?.pages || []).map((page, index) => (
                  <button
                    key={`${alphaPreview?.packetId}-${page.pageNumber}`}
                    type="button"
                    onClick={() => { setPreviewPage(index); setZoomPage(index); }}
                    title="Click to zoom"
                    className={`alpha-preview-frame relative h-[520px] w-[402px] shrink-0 overflow-hidden rounded-[8px] bg-white text-left shadow-[0_24px_45px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-1 ${previewPage === index ? 'ring-4 ring-[#007970]/30' : ''}`}
                  >
                    {page.html ? (
                      <div
                        className="origin-top-left scale-[0.47]"
                        style={{ width: `${page.widthInches}in`, height: `${page.heightInches}in` }}
                        dangerouslySetInnerHTML={{ __html: page.html }}
                      />
                    ) : page.previewUrl ? (
                      <iframe title={page.title || `Page ${page.pageNumber}`} src={page.previewUrl} className="h-full w-full border-0" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-8 text-center font-roboto text-sm text-[#747470]">Alpha returned page {page.pageNumber} without displayable preview HTML or URL.</div>
                    )}
                    <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 font-roboto text-[10px] font-medium text-white">Page {page.pageNumber} · ⤢ Zoom</span>
                  </button>
                ))}
                {!alphaPreview?.pages.length && (
                  <div className="flex min-h-[260px] w-full items-center justify-center rounded-[24px] bg-white p-8 text-center shadow-sm">
                    <p className="max-w-lg font-roboto text-sm text-[#524D4B]">DefenCIble Alpha did not return preview pages. The Shell will not render mock pages.</p>
                  </div>
                )}
              </div>

              <div className="grid gap-4 rounded-[22px] bg-white p-5 shadow-sm md:grid-cols-3">
                <button type="button" onClick={() => { setReviewChecked(true); triggerToast('Review checks passed.'); }} className="rounded-full bg-[#EBE6E6] px-6 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-[#1F1C1B] hover:bg-[#E0DADA]">
                  {reviewChecked ? 'Review Passed' : 'Review Checks'}
                </button>
                <button type="button" onClick={() => void setupAlphaSigning()} className="rounded-full bg-[#007970] px-6 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-white shadow-md hover:bg-[#004142]">
                  Assign Signer
                </button>
                <button type="button" onClick={printOrDownloadPacket} className="rounded-full bg-[#C74601] px-6 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-white shadow-md hover:bg-[#421700]">
                  Print / Download
                </button>
              </div>
            </div>
          </div>}

          {flowStep === 'signers' && <div className="rounded-[32px] bg-white/95 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
            <button type="button" onClick={() => setFlowStep('preview')} className="mb-8 font-montserrat text-xs font-bold uppercase tracking-widest text-[#747470]">← Back to preview</button>
            <h2 className="font-montserrat text-lg font-bold uppercase tracking-widest text-[#1F1C1B]">4 · Signature Workflow Routing</h2>
            {alphaSigners.length ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {alphaSigners.map((signer, index) => (
                  <div key={`${signer.role || signer.name || 'signer'}-${index}`} className="grid gap-3 rounded-[18px] bg-white p-5 shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-montserrat text-sm font-bold uppercase tracking-wide text-[#1F1C1B]">{signer.role || `Signer ${index + 1}`}</p>
                        <p className="mt-2 font-roboto text-sm text-[#524D4B]">{signer.name || 'Name pending assignment'}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wider ${signersAssigned ? 'bg-[#E5FEFF] text-[#007970]' : 'bg-[#FFF3E8] text-[#C74601]'}`}>
                        {signersAssigned ? 'Assigned' : signer.status || 'Pending'}
                      </span>
                    </div>
                    {signer.source && <p className="font-roboto text-xs text-[#747470]">Source: {signer.source}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[20px] bg-white p-6 shadow-sm">
                <p className="font-roboto text-sm leading-6 text-[#524D4B]">
                  DefenCIble Alpha did not return formal signature requirements for this packet. The Shell will not invent signer roles.
                </p>
              </div>
            )}
            <div className="mt-8 rounded-[24px] bg-white p-6 shadow-sm">
              <p className="font-roboto text-sm leading-6 text-[#524D4B]">
                DefenCIble will schedule signer tasks for the roster above. Names marked pending can be assigned by role in the signature tracker.
              </p>
              <button type="button" onClick={() => void scheduleAlphaSigning()} disabled={!alphaSigners.length} className="mt-6 rounded-full bg-[#C74601] px-10 py-4 font-montserrat text-xs font-medium uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#421700] disabled:cursor-not-allowed disabled:bg-[#EBE6E6] disabled:text-[#747470] disabled:shadow-none">
                Assign and Schedule Signer Tasks
              </button>
            </div>
          </div>}

          {flowStep === 'complete' && <div className="rounded-[32px] bg-white/95 p-8 shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
            <div className="grid gap-8 md:grid-cols-[320px_1fr]">
              <div className="rounded-[24px] bg-[#FAFBF8] p-6 shadow-sm">
                <div className="mb-4 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#747470]">DefenCIble Metadata</div>
                <p className="font-roboto text-xs uppercase text-[#747470]">Packet ID</p>
                <p className="mt-1 rounded border border-[#EAE4E3] bg-white px-3 py-2 font-roboto text-sm font-medium text-[#1F1C1B]">{alphaPreview?.packetId || eventId || 'pending'}</p>
                <p className="mt-5 font-roboto text-xs uppercase text-[#747470]">Audit Hash</p>
                <p className="mt-1 truncate rounded border border-[#EAE4E3] bg-white px-3 py-2 font-mono text-xs text-[#524D4B]">Alpha managed</p>
              </div>
              <div>
                <h2 className="font-montserrat text-2xl font-medium text-[#1F1C1B]">Packet Ready & Routing</h2>
                <p className="mt-3 max-w-2xl font-roboto text-sm leading-6 text-[#524D4B]">The Alpha packet preview is ready, signer tasks are scheduled, and export controls use Alpha-provided PDF or Drive metadata when available.</p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button type="button" onClick={() => setFlowStep('preview')} className="rounded-full bg-[#EBE6E6] px-8 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-[#1F1C1B] hover:bg-[#E0DADA]">Review Preview</button>
                  <button type="button" onClick={printOrDownloadPacket} className="rounded-full bg-[#C74601] px-8 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-white shadow-md hover:bg-[#421700]">Print / Download</button>
                </div>
              </div>
            </div>
          </div>}

          {flowStep === 'alphaError' && <div className="rounded-[32px] bg-white/95 p-8 text-center shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#FBE6E6] text-2xl text-[#D70101]">!</div>
            <h2 className="font-montserrat text-2xl font-bold text-[#1F1C1B]">Alpha Preview Unavailable</h2>
            <p className="mx-auto mt-3 max-w-2xl font-roboto text-sm leading-6 text-[#524D4B]">
              {alphaError || 'DefenCIble Alpha did not return generated packet preview pages. The Shell will not show mock or reconstructed packet pages.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button type="button" onClick={() => void startCompilePacket()} className="rounded-full bg-[#C74601] px-8 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-white shadow-md hover:bg-[#421700]">Retry Alpha Generation</button>
              <button type="button" onClick={() => window.open('/care_indeed_pdf_studio.html', '_blank', 'noopener,noreferrer')} className="rounded-full bg-[#EBE6E6] px-8 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-[#1F1C1B] hover:bg-[#E0DADA]">Open Alpha Legacy Studio</button>
            </div>
          </div>}
        </div>
      )}

      {cameraOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#1F1C1B]/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Camera Scanner">
          <div className="w-full max-w-3xl rounded-[32px] border-none bg-white p-6 shadow-[0_12px_45px_rgba(0,0,0,0.04)] md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-3 font-montserrat text-xl font-medium text-[#1F1C1B]">
                <Camera className="h-7 w-7 text-[#007970]" /> Camera Scanner
              </h2>
              <button type="button" onClick={closeCamera} aria-label="Close camera" className="flex h-10 w-10 items-center justify-center rounded-full text-2xl text-[#747470] transition-colors hover:bg-[#FAFBF8] hover:text-[#1F1C1B]">×</button>
            </div>

            <div className="relative mb-6 flex aspect-video items-center justify-center overflow-hidden rounded-[24px] border-none bg-white shadow-md">
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              {cameraError && (
                <div className="absolute left-4 right-4 top-4 rounded-lg bg-[#FBE6E6]/90 p-3 text-center font-roboto text-sm font-medium text-[#D70101] backdrop-blur">
                  Camera error: {cameraError}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-between gap-6 border-t border-[#EAE4E3] pt-6 sm:flex-row">
              <div className="rounded-md border-none bg-white px-4 py-2 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#524D4B] shadow-sm">
                <span className="text-sm text-[#007970]">{camShots}</span> captured
              </div>
              <div className="flex w-full gap-4 sm:w-auto">
                <button type="button" onClick={() => void captureDocument()} disabled={!!cameraError || busy} className="flex-1 rounded-full bg-[#C74601] px-10 py-4 font-montserrat text-xs font-medium uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#421700] hover:shadow-lg active:scale-95 disabled:opacity-50 sm:flex-none">
                  {busy ? 'Capturing...' : 'Capture'}
                </button>
                <button type="button" onClick={closeCamera} className="flex-1 rounded-full border-none bg-white px-10 py-4 font-montserrat text-xs font-medium uppercase tracking-wider text-[#1F1C1B] shadow-sm transition-all hover:shadow-md sm:flex-none">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sourceModal && (
        <div className="fixed inset-0 z-[950] flex items-center justify-center bg-[#1F1C1B]/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Select data source">
          <div className="w-full max-w-4xl rounded-[32px] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] md:p-10">
            <div className="mb-8 flex items-start gap-4">
              <div className="pt-1 text-2xl text-[#007970]">
                {sourceModal === 'drive' ? <img src={GOOGLE_DRIVE_LOGO} alt="" className="h-8 w-8 object-contain" /> : sourceModal === 'merge' ? '▢' : '⇧'}
              </div>
              <div className="flex-1">
                <h2 className="font-montserrat text-3xl font-medium text-[#1F1C1B]">
                  {sourceModal === 'drive' ? 'Select from Google Drive' : sourceModal === 'merge' ? 'Merge Data Sources' : 'Upload or Capture'}
                </h2>
                <p className="mt-5 font-roboto text-base leading-7 text-[#524D4B]">
                  {sourceModal === 'drive'
                    ? 'Choose an evidence folder or specific files from your Google Drive integration to feed into this packet.'
                    : sourceModal === 'merge'
                      ? 'Select a primary folder from Google Drive, and additionally attach any local files needed for this packet.'
                      : 'Upload local files or use your device camera to scan documents directly into the platform.'}
                </p>
              </div>
              <button type="button" onClick={() => setSourceModal('')} className="text-4xl leading-none text-[#747470] hover:text-[#1F1C1B]" aria-label="Close">×</button>
            </div>

            {sourceModal === 'upload' && (
              <div className="grid gap-6 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); void handleFiles(Array.from(e.dataTransfer.files)); }}
                  className={`min-h-[240px] rounded-[24px] border-2 border-dashed border-[#EAE4E3] bg-white p-10 text-center transition-all hover:-translate-y-1 hover:bg-[#E5FEFF] hover:shadow-lg ${isDragging ? 'bg-[#E5FEFF]' : ''}`}
                >
                  <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FAFBF8] text-3xl text-[#747470] shadow-sm">☁</span>
                  <strong className="block font-montserrat text-lg font-medium text-[#1F1C1B]">Drag & Drop files here</strong>
                  <span className="mt-2 block font-roboto text-sm text-[#747470]">or click to browse local files</span>
                </button>
                <button type="button" onClick={() => void openCamera()} className="min-h-[240px] rounded-[24px] bg-white p-10 text-center shadow-md transition-all hover:-translate-y-1 hover:bg-[#E5FEFF] hover:shadow-lg">
                  <span className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FAFBF8] text-[#007970] shadow-sm"><Camera className="h-9 w-9" /></span>
                  <strong className="block font-montserrat text-lg font-medium text-[#1F1C1B]">Open Camera Scanner</strong>
                  <span className="mt-2 block font-roboto text-sm text-[#747470]">Capture using your device</span>
                </button>
              </div>
            )}

            {sourceModal === 'drive' && (() => {
              const SAMPLE: Array<[string, string]> = [
                ['2026 QAPI Reviews', '#FACC15'], ['Admissions 2026', '#3B82F6'], ['Incident Reports', '#FACC15'],
                ['Governing Board', '#2DD4BF'], ['Mock Event Packets', '#FB923C'], ['Draft Evidence Packets', '#A855F7'],
              ];
              const PALETTE = ['#FACC15', '#3B82F6', '#2DD4BF', '#FB923C', '#A855F7', '#22C55E'];
              const usingSample = driveFolders.length === 0;
              const items: Array<{ name: string; color: string; sub?: string; url?: string }> = usingSample
                ? SAMPLE.map(([name, color]) => ({ name, color }))
                : driveFolders.map((f, i) => ({ name: f.folderName || f.section || 'Folder', color: PALETTE[i % PALETTE.length], sub: `${f.count} file${f.count === 1 ? '' : 's'}`, url: f.folderUrl }));
              const openFolder = (url?: string) => { if (url) window.open(url, '_blank', 'noopener,noreferrer'); };
              return (
                <>
                  {usingSample
                    ? <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">Showing <strong>sample</strong> folders — connect Google Drive{driveFoldersErr ? ` (${driveFoldersErr})` : ''} to list the real evidence folders.</div>
                    : <div className="mb-6 rounded-lg border border-[#B6E8E2] bg-[#E5FEFF] px-4 py-2 text-xs text-[#007970]">Live from the Drive manifest — {driveFolders.length} folder{driveFolders.length === 1 ? '' : 's'}. Click to select; “Open in Drive” to upload files there.</div>}
                  <div className="grid gap-8 md:grid-cols-4">
                    {items.map(({ name, color, sub, url }) => (
                      <div
                        key={name}
                        className={`flex min-h-[180px] flex-col items-center rounded-[22px] bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${selectedDriveFolder === name ? 'ring-2 ring-[#007970]' : ''}`}
                      >
                        <button type="button" onClick={() => setSelectedDriveFolder(name)} className="flex flex-1 flex-col items-center">
                          <span className="mx-auto mb-6 block h-16 w-24 rounded-[10px] border-[6px]" style={{ borderColor: color }} />
                          <span className="block whitespace-pre-line font-montserrat text-base font-medium leading-5 text-[#1F1C1B]">{name.replace(' ', '\n')}</span>
                          {sub ? <span className="mt-2 block font-roboto text-xs text-[#747470]">{sub}</span> : null}
                        </button>
                        {url && (
                          <button type="button" onClick={() => openFolder(url)} className="mt-3 rounded-full border border-[#B6E8E2] px-3 py-1 font-roboto text-xs font-medium text-[#007970] hover:bg-[#E5FEFF]">
                            Open in Drive ↗
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {sourceModal === 'merge' && (
              <div className="rounded-[26px] bg-[#FAFBF8] p-7">
                <button type="button" onClick={() => setSourceModal('drive')} className="mb-5 flex w-full items-center gap-6 rounded-[22px] bg-white p-6 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <img src={GOOGLE_DRIVE_LOGO} alt="" className="h-11 w-11 object-contain" />
                  <span className="flex-1">
                    <strong className="block font-montserrat text-xl font-medium text-[#1F1C1B]">Select Google Drive Folder</strong>
                    <span className="mt-1 block font-roboto text-sm text-[#747470]">{selectedDriveFolder || 'Click to browse your Drive'}</span>
                  </span>
                  <span className="font-montserrat text-sm font-bold uppercase tracking-wider text-[#007970]">Browse</span>
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center gap-6 rounded-[22px] bg-white p-6 text-left shadow-md transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="text-4xl text-[#747470]">⌘</span>
                  <span className="flex-1">
                    <strong className="block font-montserrat text-xl font-medium text-[#1F1C1B]">Attach Local Files</strong>
                    <span className="mt-1 block font-roboto text-sm text-[#747470]">Drop files or click to upload</span>
                  </span>
                  <span className="font-montserrat text-sm font-bold uppercase tracking-wider text-[#747470]">Add</span>
                </button>
              </div>
            )}

            <div className="mt-10 flex justify-end gap-5 border-t border-[#EAE4E3] pt-8">
              <button type="button" onClick={() => setSourceModal('')} className="rounded-full bg-[#EBE6E6] px-8 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-[#1F1C1B] hover:bg-[#E0DADA]">Cancel</button>
              <button
                type="button"
                onClick={confirmSourceSelection}
                disabled={extracting}
                className={`rounded-full px-10 py-3 font-montserrat text-xs font-medium uppercase tracking-wider text-white shadow-md ${extracting ? 'cursor-not-allowed bg-[#C9A38F]' : 'bg-[#C74601] hover:bg-[#421700]'}`}
              >
                {extracting ? 'Brad is reading…' : 'Confirm Selection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {extracting && <BradReadingOverlay />}
      {compileStage === 'brad' && <BradCompileOverlay />}
      {compileStage === 'drive' && <DriveCompileOverlay />}

      {/* Full-document reader: portaled to <body> at max z so it covers ALL app
          chrome (top bar, dock, side icons). ALL pages, scrollable, solid backdrop.
          ESC / Close / dark-gutter click exits. */}
      {zoomPage !== null && alphaPreview?.pages?.length ? createPortal(
        <div className="ci-reader fixed inset-0 flex flex-col bg-[#E8E5E1]" style={{ zIndex: 2147483600 }}>
          {/* Paper is square with a clean edge — override the studio's rounded/glow page styling. */}
          <style dangerouslySetInnerHTML={{ __html: '.ci-reader .rendered-page,.ci-reader .paper,.ci-reader .section-paper,.ci-reader .cover{border-radius:0!important;box-shadow:none!important;}' }} />
          <div className="flex items-center justify-between gap-3 border-b border-[#EAE4E3] bg-white px-6 py-3 text-[#1F1C1B]">
            <span className="truncate font-montserrat text-sm font-medium">{alphaPreview.title || 'Packet'} · {alphaPreview.pages.length} page{alphaPreview.pages.length === 1 ? '' : 's'}</span>
            <button type="button" onClick={() => setZoomPage(null)} className="shrink-0 rounded-full bg-[#007970] px-5 py-2 font-montserrat text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#005f58]">✕ Close (Esc)</button>
          </div>
          <div className="flex-1 overflow-auto px-4 py-8" onClick={(e) => { if (e.target === e.currentTarget) setZoomPage(null); }}>
            <div className="mx-auto flex w-fit flex-col items-center gap-8">
              {alphaPreview.pages.map((page, i) => (
                <div key={`${alphaPreview?.packetId}-zoom-${page.pageNumber}`}>
                  <div className="overflow-hidden bg-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]" style={{ width: '8.5in', height: '11in' }}>
                    {page.html ? (
                      <div dangerouslySetInnerHTML={{ __html: page.html }} />
                    ) : page.previewUrl ? (
                      <iframe title={`Page ${page.pageNumber}`} src={page.previewUrl} className="border-0 bg-white" style={{ width: '8.5in', height: '11in' }} />
                    ) : (
                      <div className="p-10 text-center font-roboto text-sm text-[#747470]">Page {page.pageNumber} has no preview.</div>
                    )}
                  </div>
                  <span className="mt-2 block text-center font-roboto text-xs text-[#747470]">Page {i + 1} of {alphaPreview.pages.length}</span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body,
      ) : null}

      {toastMessage && (
        <div className="fixed bottom-10 right-10 z-[1001] flex items-center gap-2 rounded-full border-none bg-[#1F1C1B] px-6 py-4 font-roboto text-sm text-white shadow-2xl">
          <span className="text-lg text-[#008540]">✔</span> {toastMessage}
        </div>
      )}
    </section>
  );
}

export default Defensible2StudioLanding;
