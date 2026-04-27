/**
 * eCIgnWorkspace — full-screen, CI-App-branded electronic signing experience.
 *
 * Flow (strict, no skipping):
 *   Sign  →  Verify (photo, optional)  →  Review  →  Options
 *   step='sign'   step='verify'             step='review'  step='options'
 *
 * Step 1 (Sign) gates Confirm behind an explicit E-SIGN Act consent
 * checkbox + drawn signature. Step 4 (Options) presents action cards
 * (Download / Print / Save / 2nd-Signature). There is no terminal
 * "Done" button — completion is action-driven.
 *
 * Brand:  Navy #1A3778 + Orange #F04B22 (from eCIgn logo).
 */
import { useState, useCallback, useRef, useEffect, Fragment, useMemo } from 'react';
import {
  PenLine, CheckCircle2, Shield, X, Send, Printer, Download,
  ArrowLeft, Lock, Camera, RefreshCw,
  CameraOff, ChevronRight,
  FileSignature, ScanFace, Sparkles, IdCard,
} from 'lucide-react';
import eCIgnLogo from '@/assets/eCIgn.png';
import {
  type SignatureRecord,
  type SecondSigTask,
  type GeoInfo,
  type FieldEdit,
  type DemoUser,
  DEMO_SESSION,
  DEMO_STAFF,
  signerNanoid,
  fmtSignTs,
} from './FormSignatureContext';
import {
  useEcignInstance,
  UI_STEPS,
  type BackendState,
} from '@/policy/ecign/useEcignInstance';
import { ecignApi } from '@/policy/ecign/api';
import {
  recordEsignEvidence,
  queryEvidenceByContext,
  type EsignEvidenceResponse,
} from '@/policy/ecign/hhcEvidence';
import { HelpContextLink } from '@/policy/help/HelpContextLink';
import {
  type PolicyLinkMeta,
  resolvePolicyMetaList,
  type PolicyLinkSource,
} from '@/policy/services/policyLinkService';

/* ═══ Brand tokens ══════════════════════════════════════════════════ */
const NAVY       = '#1A3778';
const NAVY_DEEP  = '#122555';
const NAVY_SOFT  = '#EEF1FA';
const ORANGE     = '#F04B22';
const ORANGE_SOFT = '#FFF0EB';
const INK        = '#1F1C1B';
const MUTED      = '#747470';
const PAPER      = '#FAFBF8';
const BORDER     = '#E5E4E3';
const BORDER_SOFT = '#F0F2F5';
const CANVAS_BG  = '#FCFDFF';
const SIGNATURE_PLACEHOLDER_DATA_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160"><rect width="100%" height="100%" fill="white"/><text x="16" y="98" fill="#1A3778" font-size="28" font-family="Segoe UI, Arial, sans-serif">Signature on file</text></svg>'
)}`;

/* ═══ escHtml util ══════════════════════════════════════════════════ */
function escHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ═══ Certificate HTML builder ══════════════════════════════════════ */
interface CertParams {
  certId:           string;
  certAt:           string;
  formId:           string;
  formTitle:        string;
  formVersion:      string;
  formInstanceId:   string;
  linkedPolicyIds:  string[];
  linkedPolicyMeta: PolicyLinkMeta[];
  record:           SignatureRecord;
  eventId?:         string;
  workflowId?:      string;
  evidenceId?:      string;
  evidenceStatus?:  string;
  signatureStatus?: string;
  s3Key?:           string;
  documentHash?:    string | null;
  signatureHash?:   string | null;
  attestationText?: string;
}

function buildCertHtml(p: CertParams, logoSrc: string): string {
  const policyId = p.linkedPolicyIds[0] || p.linkedPolicyMeta[0]?.id || '—';
  const attestationText = p.attestationText || 'I attest that I have read, understood, and signed this document.';
  const fields: Array<[string, string]> = [
    ['Certificate ID', p.certId],
    ['Evidence ID', p.evidenceId || 'Pending evidence sync'],
    ['Form ID', p.formId],
    ['Policy ID', policyId],
    ['Workflow ID', p.workflowId || '—'],
    ['Event ID', p.eventId || `EVT-FORM-${p.formInstanceId}`],
    ['Signer Name', p.record.signerName],
    ['Signer Role', p.record.signerRole || '—'],
    ['Signed Timestamp', fmtSignTs(p.record.signedAt)],
    ['Signature Status', p.signatureStatus || 'SIGNED'],
    ['Status', p.evidenceStatus || 'APPROVED_EVIDENCE'],
    ['Document Hash', p.documentHash || '—'],
    ['Signature Hash', p.signatureHash || '—'],
    ['S3 Key', p.s3Key || '—'],
  ];

  return `
<section class="ecign-cert-page">
  <div class="header">
    <img class="logo" src="${logoSrc}" alt="eCIgn"/>
    <div>
      <div class="badge">eCIgn Certificate</div>
      <h1>eCIgn Signature Certificate</h1>
      <p class="intro">This certificate is appended to the printed packet and captures immutable eSign evidence metadata.</p>
    </div>
  </div>
  <div class="section">
    <h2>Document Context</h2>
    <div class="grid2">
      <div class="f"><div class="lbl">Form Title</div><div class="val">${escHtml(p.formTitle)}</div></div>
      <div class="f"><div class="lbl">Form Version</div><div class="val">v${escHtml(p.formVersion)}</div></div>
      <div class="f"><div class="lbl">Form Instance ID</div><div class="val mono">${escHtml(p.formInstanceId)}</div></div>
      <div class="f"><div class="lbl">Certified At</div><div class="val">${fmtSignTs(p.certAt)}</div></div>
    </div>
  </div>
  <div class="section">
    <h2>Evidence Metadata</h2>
    <table class="tbl">
      <tbody>${fields.map(([k, v]) => `<tr><th>${escHtml(k)}</th><td>${escHtml(v)}</td></tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="section">
    <h2>Attestation Text</h2>
    <p class="attestation">${escHtml(attestationText)}</p>
    <div class="sig-box">
      <img class="sig-img" src="${p.record.signatureDataUrl}" alt="Signature of ${escHtml(p.record.signerName)}"/>
    </div>
  </div>
</section>`;
}

/* ═══ Packet (form + cert) HTML builder ════════════════════════════
 *
 * Builds the print-ready HTML document that the browser renders into a
 * PDF via window.print(). Composition (template-preservation contract,
 * see Builder/eCIgn/06-Outputs-Templates-Watermarks.md):
 *
 *   pages 1..N       byte-faithful template (args.formHtml)
 *                    + repeating eCIgn watermark stamp in footer band
 *   page  N+1        appended cert packet (args.certHtml)
 *
 * `styleAssets` MUST include BOTH the document's <link rel="stylesheet">
 * tags AND its inline <style> blocks. In Vite dev mode all CSS is
 * injected as inline <style>, so omitting them yields the unstyled
 * output documented in Builder/eCIgn/06 §B.4.
 * ═══════════════════════════════════════════════════════════════════ */
function buildPrintablePacketHtml(args: {
  formTitle: string;
  formHtml: string;
  certHtml: string;
  certId: string;
  signerName: string;
  signedAt: string;
  logoSrc: string;
  /** Combined <link> + <style> tags, in head-source order. */
  styleAssets: string;
}) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>${escHtml(args.formTitle)} — eCIgn Packet</title>
${args.styleAssets}
<style>
  /* ── Packet overrides (do NOT touch form layout) ── */
  @page{margin:0.5in 0.75in 0.55in 0.75in}
  @media print{
    html,body{background:white !important;margin:0 !important;padding:0 !important}
    /* Global print CSS can hide popup nodes via body:has(...) guards. */
    .ecign-print-root,.ecign-print-root *{visibility:visible !important}
    body:has(.form-page) .ecign-cert-section,
    body:has(.form-page) .ecign-cert-section *,
    body:has(.form-page) .ecign-footer,
    body:has(.form-page) .ecign-footer *{visibility:visible !important}
    .ecign-cert-section{page-break-before:always;break-before:page}
    .ecign-print-root,.ecign-print-root .form-page{height:auto !important;min-height:0 !important;overflow:visible !important}
    /* Hide the on-screen action bar / close affordances if cloned */
    .no-print,.print\\:hidden{display:none !important}
  }
  html,body{margin:0;padding:0;background:white}
  .ecign-print-root{position:relative;background:white;min-height:100vh}
  /* ── Certificate section (appended after original form pages) ── */
  .ecign-cert-section{
    max-width:760px;margin:0 auto;padding:40px 24px 80px;
    font-family:'Segoe UI',Arial,sans-serif;color:${INK};
  }
  .ecign-cert-section .header{display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:3px solid ${ORANGE};margin-bottom:24px}
  .ecign-cert-section .logo{height:40px;object-fit:contain}
  .ecign-cert-section h1{font-size:22px;font-weight:700;margin:0 0 8px;color:${NAVY}}
  .ecign-cert-section h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:${NAVY};margin:0 0 16px}
  .ecign-cert-section .badge{display:inline-block;padding:3px 10px;background:${ORANGE_SOFT};color:${ORANGE};border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px;border:1px solid ${ORANGE}40}
  .ecign-cert-section .intro{color:${MUTED};font-size:13px;margin-top:8px;line-height:1.6}
  .ecign-cert-section .section{padding:20px 0;border-bottom:1px solid ${BORDER}}
  .ecign-cert-section .grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 24px}
  .ecign-cert-section .f{display:flex;flex-direction:column}
  .ecign-cert-section .lbl{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:${MUTED};font-weight:700;margin-bottom:3px}
  .ecign-cert-section .val{font-size:13px;color:${INK};overflow-wrap:anywhere;word-break:break-word}
  .ecign-cert-section .val.mono{font-family:monospace;font-size:11px;overflow-wrap:anywhere;word-break:break-all}
  .ecign-cert-section .attestation{font-size:13px;line-height:1.55;color:${INK}}
  .ecign-cert-section .sig-box{border:1px solid ${BORDER};border-radius:8px;padding:12px;background:${PAPER};display:inline-block;margin-top:12px}
  .ecign-cert-section .sig-img{height:60px;max-width:220px;object-fit:contain;display:block}
  .ecign-cert-section .tbl{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
  .ecign-cert-section .tbl th{width:190px;background:${PAPER};border-bottom:1px solid ${BORDER};padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:${MUTED};vertical-align:top}
  .ecign-cert-section .tbl td{padding:6px 8px;border-bottom:1px solid #F0F0EE;overflow-wrap:anywhere;word-break:break-word}
  /* ── Single watermark footer — once per page via position:fixed ── */
  .ecign-footer{
    position:fixed;bottom:0;left:0;right:0;height:22px;
    background:rgba(255,255,255,0.97);border-top:1px solid ${ORANGE};
    display:flex;align-items:center;gap:8px;padding:0 16px;
    font-size:8px;color:${NAVY};font-family:'Segoe UI',Arial,sans-serif;z-index:9999
  }
  .ecign-footer-logo{height:12px;object-fit:contain;opacity:.8}
  .ecign-footer-dot{color:${ORANGE}}
  .ecign-footer-mono{font-family:monospace;font-size:8px}
</style>
</head><body>
  <div class="ecign-print-root">
    ${args.formHtml}
    <div class="ecign-cert-section">${args.certHtml}</div>
    <div class="ecign-footer">
      <img class="ecign-footer-logo" src="${args.logoSrc}" alt="eCIgn"/>
      <span class="ecign-footer-dot">·</span>
      <span class="ecign-footer-mono">${escHtml(args.certId)}</span>
      <span class="ecign-footer-dot">·</span>
      <span>${escHtml(args.signerName)}</span>
      <span class="ecign-footer-dot">·</span>
      <span>${fmtSignTs(args.signedAt)}</span>
      <span class="ecign-footer-dot">·</span>
      <span style="font-weight:700">SIGNED</span>
    </div>
  </div>
</body></html>`;
}

/* ═══ Small UI primitives ══════════════════════════════════════════ */

function InfoRow({ label, value, mono = false, icon }: { label: string; value: string; mono?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'white', border: `1px solid ${BORDER}`, color: NAVY }}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <dt
          className="font-montserrat font-bold text-[9px] uppercase tracking-[0.14em]"
          style={{ color: MUTED }}
        >
          {label}
        </dt>
        <dd
          className={`text-[12.5px] leading-snug ${mono ? 'font-mono text-[11px]' : 'font-roboto font-medium'}`}
          style={{ color: INK, wordBreak: 'break-all', overflowWrap: 'anywhere' }}
        >
          {value || '—'}
        </dd>
      </div>
    </div>
  );
}

function StepPill({
  n, label, state,
}: {
  n: number;
  label: string;
  state: 'done' | 'active' | 'pending';
}) {
  const dot =
    state === 'done'   ? { bg: NAVY,    fg: '#fff',  border: NAVY }   :
    state === 'active' ? { bg: ORANGE,  fg: '#fff',  border: ORANGE } :
                         { bg: '#fff',  fg: MUTED,   border: BORDER };
  const textColor = state === 'pending' ? MUTED : INK;
  const weight    = state === 'active' ? 'font-bold' : 'font-semibold';

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center font-montserrat font-bold text-[11px] transition-colors"
        style={{ background: dot.bg, color: dot.fg, border: `1.5px solid ${dot.border}` }}
      >
        {state === 'done' ? <CheckCircle2 size={13} /> : n}
      </div>
      <span
        className={`font-roboto text-[11px] ${weight} hidden sm:inline`}
        style={{ color: textColor }}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector({ active }: { active: boolean }) {
  return (
    <div
      className="h-[2px] w-6 sm:w-10 shrink-0 transition-colors"
      style={{ background: active ? NAVY : BORDER }}
    />
  );
}

/** Pill state for a UI step, relative to the backend-driven active index. */
function pillStateForBackend(activeIdx: number, pillIdx: number): 'done' | 'active' | 'pending' {
  if (pillIdx < activeIdx) return 'done';
  if (pillIdx === activeIdx) return 'active';
  return 'pending';
}

function SectionCard({
  title, icon, children, accent = 'navy',
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: 'navy' | 'orange';
}) {
  const tint = accent === 'orange' ? ORANGE : NAVY;
  const bg   = accent === 'orange' ? ORANGE_SOFT : NAVY_SOFT;
  return (
    <div
      className="rounded-[14px] bg-white p-5 md:p-6"
      style={{ border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(26,55,120,0.04)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: bg, color: tint }}
        >
          {icon}
        </div>
        <h3
          className="font-montserrat font-bold text-[10px] uppercase tracking-[0.16em]"
          style={{ color: INK }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

/* ═══ Props ════════════════════════════════════════════════════════ */
export interface eCIgnWorkspaceProps {
  certId:               string;
  fieldId:              string;
  formId:               string;
  formTitle:            string;
  formVersion:          string;
  formInstanceId:       string;
  geoInfo:              GeoInfo;
  fieldEdits:           FieldEdit[];
  signatures:           Map<string, SignatureRecord>;
  secondSigTask:        SecondSigTask | null;
  /** Policy links selected by the parent form context (e.g., EN-FM-001 in Forms Library). */
  linkedPolicyIds?:     string[];
  /** Fallback policy IDs from form metadata when no explicit linked IDs were provided. */
  policies:             string[];
  /** Phase 11 — Where the form was opened from (drives auto-link rules). */
  formSource?:          PolicyLinkSource;
  /** Phase 11 — Parent task ID, when opened from a Task/Obligation. */
  parentTaskId?:        string;
  /** HHC Phase 1 — The regulatory/calendar event_id this signing belongs to.
   *  When provided, eSign evidence is indexed under this ID in the Evidence Center.
   *  Falls back to "EVT-FORM-{formInstanceId}" if omitted. */
  hhcEventId?:          string;
  /** HHC Phase 1 — The workflow_id context for this signing (e.g. WF-GV-FM-017). */
  hhcWorkflowId?:       string;
  getPrintableFormHtml: () => string;
  onConfirm:            (record: SignatureRecord) => void;
  onClose:              () => void;
  onRequestSecond:      (task: SecondSigTask) => void;
}

/* ═══ eCIgnWorkspace ═══════════════════════════════════════════════ */
export function eCIgnWorkspace({
  certId,
  fieldId,
  formId,
  formTitle,
  formVersion,
  formInstanceId,
  geoInfo: _geoInfo,
  fieldEdits,
  signatures,
  secondSigTask: initialSecondSigTask,
  linkedPolicyIds: linkedPolicyIdsProp,
  policies,
  formSource = 'forms_library',
  parentTaskId,
  hhcEventId,
  hhcWorkflowId,
  getPrintableFormHtml,
  onConfirm,
  onClose,
  onRequestSecond,
}: eCIgnWorkspaceProps) {
  const linkedPolicyIds = useMemo<string[]>(() => {
    if (Array.isArray(linkedPolicyIdsProp) && linkedPolicyIdsProp.length > 0) {
      return [...linkedPolicyIdsProp];
    }
    return [...policies];
  }, [linkedPolicyIdsProp, policies]);
  const linkedPolicyMeta = useMemo(
    () => resolvePolicyMetaList(linkedPolicyIds),
    [linkedPolicyIds],
  );
  /* ── Backend instance is the single source of truth ─────────────── */
  const {
    instance, loading, error, busy,
    acceptConsent, verifyIdentity, acknowledgeReview,
    applySignature: applyServerSignature, lockDocument,
  } = useEcignInstance({ formId, formVersion, fieldId });

  /* Map backend state → UI step. UI never drives state itself. */
  const backendState: BackendState = (instance?.state ?? 'created') as BackendState;
  const activeIdx = Math.max(0, UI_STEPS.findIndex(s => s.backend === backendState));

  /* ── HHC compliance evidence mirror: when the eCIgn document locks (terminal),
     post a DOCUMENT_SIGNED evidence record + audit row to the Phase-1 backend.
     Fires exactly once per (instance_id, lock event) via a ref guard.        */
  const hhcMirroredRef = useRef<string | null>(null);
  const [hhcEvidenceResult, setHhcEvidenceResult] = useState<
    (EsignEvidenceResponse & {
      form_instance_id: string;
      signature_hash:   string;
      document_hash:    string | null;
      attestation_text: string;
      signer_name:      string;
      signer_role:      string;
      signed_at:        string;
      searched_events:  string[];
      refreshed_count:  number;
    }) | null
  >(null);
  useEffect(() => {
    if (backendState !== 'signed_locked') return;
    if (!instance) return;
    const key = `${instance.instance_id}:locked`;
    if (hhcMirroredRef.current === key) return;
    hhcMirroredRef.current = key;
    const sigHash = (instance.manifest_hash || instance.document_hash || '').toString();
    if (!sigHash) return;            // nothing to attest yet
    // Use the regulatory event_id if provided; fall back to a stable derived key
    // so that evidence is not indexed under the transient form_instance_id.
    const resolvedEventId    = hhcEventId    || `EVT-FORM-${formInstanceId}`;
    const resolvedWorkflowId = hhcWorkflowId || undefined;
    const attestationText = 'I attest that I have read, understood, and signed this document.';
    void (async () => {
      try {
        const r = await recordEsignEvidence({
          policy_id:        linkedPolicyIds[0] || policies[0],
          workflow_id:      resolvedWorkflowId,
          event_id:         resolvedEventId,
          form_id:          formId,
          form_instance_id: formInstanceId,   // stored separately — NOT used as event key
          document_id:      String(instance.document_version_id || formId),
          document_hash:    instance.document_hash || null,
          signature_hash:   sigHash,
          attestation_text: attestationText,
          signer_id:        DEMO_SESSION.id,
          signer_name:      DEMO_SESSION.name,
          signer_role:      DEMO_SESSION.role,
          signer_email:     DEMO_SESSION.email,
          signed_at:        instance.locked_at_utc || new Date().toISOString(),
        });
        // Immediately refresh evidence from backend using all available context keys.
        const evidenceRefresh = await queryEvidenceByContext({
          event_id: r.event_id,
          event_candidates: [
            resolvedEventId,
            `EVT-FORM-${formInstanceId}`,
            formInstanceId, // fallback legacy key probe
          ],
          evidence_id: r.evidence_id,
          form_id: r.form_id,
          policy_id: r.policy_id,
        });

        setHhcEvidenceResult({
          ...r,
          form_instance_id: formInstanceId,
          signature_hash: sigHash,
          document_hash: instance.document_hash || null,
          attestation_text: attestationText,
          signer_name: DEMO_SESSION.name,
          signer_role: DEMO_SESSION.role,
          signed_at: instance.locked_at_utc || new Date().toISOString(),
          searched_events: evidenceRefresh.searched_events,
          refreshed_count: evidenceRefresh.matches.length,
        });
        console.info('[hhc.esign.evidence]', r);
      } catch (e) {
        console.warn('[hhc.esign.evidence] failed', e);
      }
    })();
  }, [backendState, instance, linkedPolicyIds, policies, formInstanceId, formId, hhcEventId, hhcWorkflowId]);

  /* ── Local-only UI state (presentational, never gates progression) ── */
  const [localRecord,    setLocalRecord]    = useState<SignatureRecord | null>(null);
  const [showSecondSig,  setShowSecondSig]  = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [localTask,      setLocalTask]      = useState<SecondSigTask | null>(initialSecondSigTask);
  const certAt = useState(() => new Date().toISOString())[0];
  const effectiveRecord = useMemo<SignatureRecord>(() => {
    if (localRecord) return localRecord;
    const firstKnown = signatures.values().next().value as SignatureRecord | undefined;
    if (firstKnown) return firstKnown;
    return {
      fieldId,
      signerName: DEMO_SESSION.name,
      signerRole: DEMO_SESSION.role,
      signerEmail: DEMO_SESSION.email,
      signedAt: instance?.locked_at_utc || certAt,
      signatureDataUrl: SIGNATURE_PLACEHOLDER_DATA_URL,
    };
  }, [localRecord, signatures, fieldId, instance, certAt]);

  /* ── Signature canvas — only mounted on the SIGNED screen ───────── */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || backendState !== 'reviewed') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = NAVY;
    ctx.lineWidth   = 2.4;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    let down = false;
    const getXY = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (canvas.width  / r.width),
        y: (e.clientY - r.top)  * (canvas.height / r.height),
      };
    };
    const onDown = (e: PointerEvent) => { down = true; ctx.beginPath(); const { x, y } = getXY(e); ctx.moveTo(x, y); e.preventDefault(); };
    const onMove = (e: PointerEvent) => { if (!down) return; const { x, y } = getXY(e); ctx.lineTo(x, y); ctx.stroke(); setEmpty(false); e.preventDefault(); };
    const onUp   = () => { down = false; };
    canvas.addEventListener('pointerdown',  onDown);
    canvas.addEventListener('pointermove',  onMove);
    canvas.addEventListener('pointerup',    onUp);
    canvas.addEventListener('pointerleave', onUp);
    return () => {
      canvas.removeEventListener('pointerdown',  onDown);
      canvas.removeEventListener('pointermove',  onMove);
      canvas.removeEventListener('pointerup',    onUp);
      canvas.removeEventListener('pointerleave', onUp);
    };
  }, [backendState]);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
  };

  /* ── Camera (IDENTITY screen only) ───────────────────────────────── */
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camStream,   setCamStream]   = useState<MediaStream | null>(null);
  const [camError,    setCamError]    = useState('');
  const [signerPhoto, setSignerPhoto] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setCamError('');
    try {
      if (!window.isSecureContext) {
        setCamError('Camera requires a secure context. Use https:// or http://localhost.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      setCamStream(stream);
    } catch {
      setCamError('Camera access denied or unavailable.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    camStream?.getTracks().forEach(t => t.stop());
    setCamStream(null);
  }, [camStream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const c = document.createElement('canvas');
    c.width  = video.videoWidth;
    c.height = video.videoHeight;
    c.getContext('2d')?.drawImage(video, 0, 0);
    setSignerPhoto(c.toDataURL('image/jpeg', 0.88));
    stopCamera();
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setSignerPhoto(null);
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (!camStream || !videoRef.current) return;
    const v = videoRef.current;
    v.srcObject = camStream;
    v.muted     = true;
    void v.play().catch(() => undefined);
  }, [camStream]);

  // auto-start when entering IDENTITY; stop when leaving
  useEffect(() => {
    if (backendState === 'disclosed' && !camStream && !signerPhoto) {
      void startCamera();
    }
    if (backendState !== 'disclosed') stopCamera();
  // intentional: avoid camStream/signerPhoto dep loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendState]);

  /* ── Action: apply signature → backend transitions to attested ─── */
  const handleApplySignature = useCallback(async () => {
    if (empty) return;
    const dataUrl = canvasRef.current?.toDataURL('image/png') ?? '';
    const rec: SignatureRecord = {
      fieldId,
      signerName:       DEMO_SESSION.name,
      signerRole:       DEMO_SESSION.role,
      signerEmail:      DEMO_SESSION.email,
      signedAt:         new Date().toISOString(),
      signatureDataUrl: dataUrl,
    };
    setLocalRecord(rec);
    await applyServerSignature(dataUrl);
    onConfirm(rec);
  }, [empty, fieldId, onConfirm, applyServerSignature]);

  /* ── Second signer (LOCKED screen action) ────────────────────────── */
  const handleSelectApprover = useCallback(async (user: DemoUser) => {
    if (!instance) return;
    const task: SecondSigTask = {
      taskId:         `task_${signerNanoid(12)}`,
      type:           'signature_request',
      formInstanceId,
      assignedTo:     user.id,
      assignedBy:     DEMO_SESSION.id,
      status:         'pending',
      createdAt:      new Date().toISOString(),
      // Phase 11 — task INHERITS the parent artifact's linked policy set.
      linkedPolicyIds: [...linkedPolicyIds],
      sourcePolicyContext: {
        source:        formSource,
        parentTaskId,
      },
    };
    try { await ecignApi.requestSecondSignature(instance.instance_id, user.id); }
    catch { /* surface via local state only */ }
    setLocalTask(task);
    onRequestSecond(task);
    setShowSecondSig(false);
  }, [instance, formInstanceId, onRequestSecond, linkedPolicyIds, formSource, parentTaskId]);

  const buildPacketHtml = useCallback((record: SignatureRecord) => {
    /* ── Style harvest ──────────────────────────────────────────────
     * Vite dev injects every stylesheet as an inline <style> block; in
     * production they ship as <link rel="stylesheet">. Collect BOTH so
     * the packet renders identically in either mode (fixes the
     * unstyled IMG1 issue documented in 06-Outputs §B.4).
     */
    const styleAssets = Array.from(document.head.querySelectorAll('link[rel="stylesheet"], style'))
      .map(node => {
        if (node.tagName === 'LINK') {
          const href = (node as HTMLLinkElement).href;
          return `<link rel="stylesheet" href="${href}"/>`;
        }
        return `<style>${(node as HTMLStyleElement).innerHTML}</style>`;
      })
      .join('\n');

    const signatureHash = (instance?.manifest_hash || instance?.document_hash || '').toString() ||
      hhcEvidenceResult?.signature_hash ||
      '';

    const certHtml = buildCertHtml({
      certId, certAt, formId, formTitle, formVersion, formInstanceId,
      linkedPolicyIds, linkedPolicyMeta,
      record,
      eventId: hhcEvidenceResult?.event_id || hhcEventId || `EVT-FORM-${formInstanceId}`,
      workflowId: hhcEvidenceResult?.workflow_id || hhcWorkflowId,
      evidenceId: hhcEvidenceResult?.evidence_id,
      evidenceStatus: hhcEvidenceResult?.status,
      signatureStatus: hhcEvidenceResult?.signature_status || 'SIGNED',
      s3Key: hhcEvidenceResult?.s3_key,
      documentHash: hhcEvidenceResult?.document_hash || instance?.document_hash || null,
      signatureHash,
      attestationText: hhcEvidenceResult?.attestation_text,
    }, eCIgnLogo);
    const html = buildPrintablePacketHtml({
      formTitle,
      formHtml:   getPrintableFormHtml(),
      certHtml,
      certId,
      signerName: record.signerName,
      signedAt:   record.signedAt,
      logoSrc:    eCIgnLogo,
      styleAssets,
    });

    return html;
  }, [
    certId,
    certAt,
    formId,
    formTitle,
    formVersion,
    formInstanceId,
    linkedPolicyIds,
    linkedPolicyMeta,
    instance,
    hhcEvidenceResult,
    hhcEventId,
    hhcWorkflowId,
    getPrintableFormHtml,
  ]);

  const openPacketWindow = useCallback((opts?: { fallbackDownload?: boolean }) => {
    const html = buildPacketHtml(effectiveRecord);
    const win = window.open('', '_blank', 'width=840,height=980');
    if (!win) {
      if (opts?.fallbackDownload) {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formId}-eCIgn-signature-packet.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
      return;
    }

    win.document.write(html);
    win.document.title = `${formId} - eCIgn Signature Packet`;
    win.document.close();

    const triggerPrint = () => {
      win.focus();
      win.print();
    };
    triggerPrint();
    win.addEventListener('load', triggerPrint, { once: true });
    setTimeout(() => {
      triggerPrint();
    }, 450);
  }, [buildPacketHtml, effectiveRecord, formId]);

  /* ── Print packet (FINALIZE action) ─────────────────────────────── */
  const handlePrint = useCallback(() => {
    openPacketWindow();
  }, [openPacketWindow]);

  /* ── Download packet (FINALIZE action) ──────────────────────────── */
  const handleDownload = useCallback(() => {
    // Save-as-PDF still uses browser print; if popup is blocked, fall back
    // to downloading the packet HTML so users can still open/print locally.
    openPacketWindow({ fallbackDownload: true });
  }, [
    openPacketWindow,
  ]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
  const timeNow = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="eCIgn Signing Workspace"
      style={{ background: '#F4F6FB' }}
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white relative" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between px-5 md:px-8 h-16 gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={eCIgnLogo}
              alt="eCIgn"
              className="h-9 md:h-10 w-auto object-contain shrink-0 select-none"
              draggable={false}
            />
            <div className="hidden md:flex flex-col pl-4 min-w-0" style={{ borderLeft: `1px solid ${BORDER}` }}>
              <span className="font-montserrat font-bold text-[9px] uppercase tracking-[0.18em]" style={{ color: ORANGE }}>
                Electronic Signing Workspace
              </span>
              <span className="font-roboto text-[12px] font-semibold truncate max-w-[44vw]" style={{ color: NAVY }}>
                {formTitle}
              </span>
            </div>
          </div>

          {/* Center: dynamic 6-step pills driven by backend state */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            {UI_STEPS.map((s, i) => (
              <Fragment key={s.key}>
                <StepPill n={i + 1} label={s.label} state={pillStateForBackend(activeIdx, i)} />
                {i < UI_STEPS.length - 1 && <StepConnector active={activeIdx >= i + 1} />}
              </Fragment>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden lg:inline font-mono text-[10.5px]" style={{ color: MUTED }}>
              {certId}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-90"
              style={{ background: NAVY_SOFT, color: NAVY }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div style={{ height: 3, background: ORANGE }} />
      </div>

      {/* ── Mobile step indicator (also dynamic) ─────────────────── */}
      <div
        className="md:hidden shrink-0 bg-white px-5 py-3 flex items-center gap-2 overflow-x-auto"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        {UI_STEPS.map((s, i) => (
          <Fragment key={s.key}>
            <StepPill n={i + 1} label={s.label} state={pillStateForBackend(activeIdx, i)} />
            {i < UI_STEPS.length - 1 && <StepConnector active={activeIdx >= i + 1} />}
          </Fragment>
        ))}
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Loading / bootstrap error */}
        {loading && !instance && (
          <div className="max-w-md mx-auto p-10 text-center">
            <div className="font-roboto text-[13px]" style={{ color: MUTED }}>
              Opening signature instance…
            </div>
          </div>
        )}
        {!loading && !instance && error && (
          <div className="max-w-md mx-auto p-10">
            <div
              className="px-4 py-3 rounded-xl font-roboto text-[12.5px]"
              style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' }}
            >
              <div className="font-semibold uppercase tracking-wider text-[10px] mb-1">
                {error.code}
              </div>
              {error.message}
            </div>
          </div>
        )}

        {/* Persistent error banner (action-time failures, e.g. CONSENT_REQUIRED) */}
        {instance && error && (
          <div className="max-w-3xl mx-auto pt-4 px-6">
            <div
              className="px-3.5 py-2.5 rounded-lg flex items-start gap-2 font-roboto text-[12px]"
              style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' }}
            >
              <Lock size={13} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold uppercase tracking-wider text-[10px] mb-0.5">
                  Blocked · {error.code}
                </div>
                <div>{error.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* ════ State-driven screen switch ════
            UI NEVER assumes state — it always reflects backend state. */}
        {instance && (() => {
          switch (backendState) {

            /* ── CONSENT ─────────────────────────────────────────── */
            case 'created':
              return (
                <div className="max-w-3xl mx-auto p-6 md:p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: NAVY_SOFT, color: NAVY }}
                    >
                      <Shield size={22} />
                    </div>
                    <div>
                      <span className="font-montserrat font-bold text-[9px] uppercase tracking-[0.22em]" style={{ color: ORANGE }}>
                        Step 1 of 6 · Consent
                      </span>
                      <h2 className="font-montserrat font-bold text-[22px] md:text-[26px] leading-tight mt-1" style={{ color: NAVY }}>
                        Electronic signature consent
                      </h2>
                      <p className="font-roboto text-[13px] mt-1.5" style={{ color: MUTED }}>
                        E-SIGN Act requires explicit consent before any electronic signature is captured. This consent is recorded in the audit chain.
                      </p>
                      <div className="mt-2">
                        <HelpContextLink slug="signing-step-4-signature" label="How does signing work?" />
                      </div>
                    </div>
                  </div>

                  <SectionCard title="Disclosure" icon={<Sparkles size={13} />}>
                    <p className="font-roboto text-[12.5px] leading-relaxed" style={{ color: INK }}>
                      You are about to sign <strong>{formId} v{formVersion}</strong> ({formTitle}). Your signature will be cryptographically bound to this exact document version and recorded in a tamper-evident audit chain.
                    </p>
                  </SectionCard>

                  <label
                    className="mt-5 flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors"
                    style={{
                      background: consentChecked ? NAVY_SOFT : 'white',
                      border: `1px solid ${consentChecked ? NAVY : BORDER}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer"
                      style={{ accentColor: NAVY }}
                    />
                    <span className="font-roboto text-[12.5px] leading-relaxed" style={{ color: INK }}>
                      <strong>I agree to use an electronic signature</strong>, I have reviewed this document in full, and I intend to sign it.
                    </span>
                  </label>

                  <div className="mt-6 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => { void acceptConsent(); }}
                      disabled={!consentChecked || busy === 'consent'}
                      className="px-6 py-2.5 rounded-xl font-roboto text-[12px] font-bold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: ORANGE, color: '#fff' }}
                    >
                      {busy === 'consent' ? 'Recording consent…' : <>Accept &amp; Continue <ChevronRight size={14} className="text-white" /></>}
                    </button>
                  </div>
                </div>
              );

            /* ── IDENTITY_VERIFIED (after disclose) ────────────────── */
            case 'disclosed':
              return (
                <div className="max-w-2xl mx-auto p-6 md:p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ORANGE_SOFT, color: ORANGE }}>
                      <ScanFace size={22} />
                    </div>
                    <div>
                      <span className="font-montserrat font-bold text-[9px] uppercase tracking-[0.22em]" style={{ color: ORANGE }}>
                        Step 2 of 6 · Identity
                      </span>
                      <h2 className="font-montserrat font-bold text-[22px] md:text-[24px] leading-tight mt-1" style={{ color: NAVY }}>
                        Verify your identity
                      </h2>
                      <p className="font-roboto text-[13px] mt-1.5" style={{ color: MUTED }}>
                        Capture an optional photo for the attestation certificate, then verify your identity to proceed.
                      </p>
                    </div>
                  </div>

                  <SectionCard title="Signer Identity" icon={<IdCard size={13} />}>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <InfoRow label="Name"  value={DEMO_SESSION.name} />
                      <InfoRow label="Role"  value={DEMO_SESSION.role} />
                      <InfoRow label="Email" value={DEMO_SESSION.email} mono />
                      <InfoRow label="Date"  value={today} />
                      <InfoRow label="Time"  value={timeNow} />
                    </dl>
                  </SectionCard>

                  <div
                    className="relative rounded-[20px] overflow-hidden mt-5 mb-5 bg-black"
                    style={{ aspectRatio: '4/3', boxShadow: '0 10px 30px rgba(18,37,85,0.12)' }}
                  >
                    {signerPhoto ? (
                      <img src={signerPhoto} alt="Signer" className="w-full h-full object-cover" />
                    ) : camStream ? (
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
                        {camError ? (
                          <>
                            <CameraOff size={44} className="text-white/40" />
                            <p className="font-roboto text-[12px] text-center text-white/60 max-w-xs px-6">{camError}</p>
                          </>
                        ) : (
                          <>
                            <Camera size={44} className="text-white/40" />
                            <p className="font-roboto text-[12px] text-white/50">Starting camera…</p>
                          </>
                        )}
                      </div>
                    )}
                    {signerPhoto && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full font-roboto text-[11px] font-semibold" style={{ background: '#16A34A', color: 'white' }}>
                        <CheckCircle2 size={12} className="text-white" /> Photo captured
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                      {!camStream && !signerPhoto && (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-roboto text-[12px] font-bold"
                          style={{ background: NAVY, color: '#fff' }}
                        >
                          <Camera size={14} className="text-white" /> {camError ? 'Try Again' : 'Start Camera'}
                        </button>
                      )}
                      {camStream && !signerPhoto && (
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-roboto text-[12px] font-bold"
                          style={{ background: ORANGE, color: '#fff', boxShadow: '0 6px 18px rgba(240,75,34,0.35)' }}
                        >
                          <Camera size={14} className="text-white" /> Capture Photo
                        </button>
                      )}
                      {signerPhoto && (
                        <button
                          type="button"
                          onClick={retakePhoto}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-roboto text-[12px] font-semibold"
                          style={{ borderColor: BORDER, color: NAVY, background: 'white' }}
                        >
                          <RefreshCw size={13} /> Retake
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => { void verifyIdentity(); }}
                      disabled={busy === 'identity'}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-roboto text-[12px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: NAVY, color: '#fff' }}
                    >
                      {busy === 'identity' ? 'Verifying…' : <><CheckCircle2 size={14} className="text-white" /> Verify Identity</>}
                    </button>
                  </div>
                </div>
              );

            /* ── REVIEW_ACK (after verify) ─────────────────────────── */
            case 'verified':
              return (
                <div className="max-w-3xl mx-auto p-6 md:p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: NAVY_SOFT, color: NAVY }}>
                      <PenLine size={22} />
                    </div>
                    <div>
                      <span className="font-montserrat font-bold text-[9px] uppercase tracking-[0.22em]" style={{ color: ORANGE }}>
                        Step 3 of 6 · Review
                      </span>
                      <h2 className="font-montserrat font-bold text-[22px] md:text-[26px] leading-tight mt-1" style={{ color: NAVY }}>
                        Review the document
                      </h2>
                      <p className="font-roboto text-[13px] mt-1.5" style={{ color: MUTED }}>
                        Review {formId} v{formVersion} in full. Acknowledging review records a timestamped audit event.
                      </p>
                    </div>
                  </div>

                  <SectionCard title="Document Edit Trail" icon={<PenLine size={13} />}>
                    {fieldEdits.length === 0 ? (
                      <p className="font-roboto text-[12.5px]" style={{ color: MUTED }}>No field edits recorded for this instance.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-lg" style={{ border: `1px solid ${BORDER_SOFT}` }}>
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr style={{ background: PAPER, borderBottom: `1px solid ${BORDER}` }}>
                              {['#', 'Field', 'Previous', 'New Value'].map(h => (
                                <th key={h} className="px-3 py-2 font-montserrat font-bold text-[9px] uppercase tracking-[0.1em]" style={{ color: MUTED }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {fieldEdits.map(e => (
                              <tr key={e.seq} className="border-b last:border-0" style={{ borderColor: BORDER_SOFT }}>
                                <td className="px-3 py-2 font-mono text-[10px]" style={{ color: MUTED }}>{e.seq}</td>
                                <td className="px-3 py-2 font-roboto text-[11px]" style={{ color: INK }}>{e.fieldLabel}</td>
                                <td className="px-3 py-2 font-roboto text-[11px]" style={{ color: MUTED }}>{e.oldValue || '—'}</td>
                                <td className="px-3 py-2 font-roboto text-[11px]" style={{ color: INK }}>{e.newValue || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>

                  <div className="mt-6 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => { void acknowledgeReview(); }}
                      disabled={busy === 'review'}
                      className="px-6 py-2.5 rounded-xl font-roboto text-[12px] font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: ORANGE, color: '#fff' }}
                    >
                      {busy === 'review' ? 'Recording review…' : <>Acknowledge Review <ChevronRight size={14} className="text-white" /></>}
                    </button>
                  </div>
                </div>
              );

            /* ── SIGNED (canvas) ──────────────────────────────────── */
            case 'reviewed':
              return (
                <div className="max-w-3xl mx-auto p-6 md:p-10">
                  <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                    <div>
                      <span className="font-montserrat font-bold text-[9px] uppercase tracking-[0.22em]" style={{ color: ORANGE }}>
                        Step 4 of 6 · Signature
                      </span>
                      <h2 className="font-montserrat font-bold text-[22px] md:text-[26px] leading-tight mt-1" style={{ color: NAVY }}>
                        Draw your signature
                      </h2>
                      <p className="font-roboto text-[13px] mt-1.5" style={{ color: MUTED }}>
                        Use your mouse, trackpad, or finger. Your signature will be cryptographically bound to <strong>{formId} v{formVersion}</strong>.
                      </p>
                    </div>
                    {!empty && (
                      <button
                        type="button"
                        onClick={handleClearCanvas}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-roboto text-[11px] font-semibold self-start"
                        style={{ background: 'white', color: NAVY, border: `1px solid ${BORDER}` }}
                      >
                        <RefreshCw size={12} /> Clear
                      </button>
                    )}
                  </div>

                  <div
                    className="relative rounded-[20px] overflow-hidden bg-white"
                    style={{
                      border: `2px dashed ${empty ? `${NAVY}33` : NAVY}`,
                      minHeight: 280,
                      backgroundImage:  `radial-gradient(${NAVY}0D 1px, transparent 1px)`,
                      backgroundSize:   '16px 16px',
                      backgroundColor:  CANVAS_BG,
                    }}
                  >
                    <div
                      className="absolute left-8 right-8"
                      style={{ bottom: 54, borderBottom: `1px dashed ${NAVY}33`, pointerEvents: 'none' }}
                    />
                    <span
                      className="absolute left-8 bottom-3 font-roboto text-[9px] select-none uppercase tracking-[0.18em] pointer-events-none"
                      style={{ color: `${NAVY}80` }}
                    >
                      × Signature line
                    </span>
                    <canvas
                      ref={canvasRef}
                      width={1400}
                      height={420}
                      className="absolute inset-0 w-full h-full touch-none"
                      style={{ cursor: 'crosshair' }}
                    />
                    {empty && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <PenLine size={28} style={{ color: `${NAVY}55` }} />
                        <span className="font-roboto text-[12px] mt-2" style={{ color: `${NAVY}88` }}>
                          Sign here
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleApplySignature}
                      disabled={empty || busy === 'sign'}
                      className="px-6 py-2.5 rounded-xl font-roboto text-[12px] font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: ORANGE, color: '#fff' }}
                    >
                      {busy === 'sign' ? 'Applying signature…' : <>Apply Signature <ChevronRight size={14} className="text-white" /></>}
                    </button>
                  </div>
                </div>
              );

            /* ── ATTESTED (lock) ──────────────────────────────────── */
            case 'attested':
              return (
                <div className="max-w-3xl mx-auto p-6 md:p-10">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: ORANGE_SOFT, color: ORANGE }}>
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <span className="font-montserrat font-bold text-[9px] uppercase tracking-[0.22em]" style={{ color: ORANGE }}>
                        Step 5 of 6 · Attestation
                      </span>
                      <h2 className="font-montserrat font-bold text-[22px] md:text-[26px] leading-tight mt-1" style={{ color: NAVY }}>
                        Attestation captured
                      </h2>
                      <p className="font-roboto text-[13px] mt-1.5" style={{ color: MUTED }}>
                        Your signature has been bound to <strong>{formId} v{formVersion}</strong>. Lock the document to compute the document hash, append the manifest, and run compliance checks.
                      </p>
                    </div>
                  </div>

                  <SectionCard title="Signature" icon={<FileSignature size={13} />}>
                    {effectiveRecord ? (
                      <div className="rounded-xl p-4" style={{ background: PAPER, border: `1px dashed ${BORDER}` }}>
                        <img src={effectiveRecord.signatureDataUrl} alt="Signature" className="h-16 w-full object-contain object-left" />
                      </div>
                    ) : (
                      <p className="font-roboto text-[12.5px]" style={{ color: MUTED }}>Signature applied on the server.</p>
                    )}
                  </SectionCard>

                  <div className="mt-6 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => { void lockDocument(); }}
                      disabled={busy === 'lock'}
                      className="px-6 py-2.5 rounded-xl font-roboto text-[12px] font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: ORANGE, color: '#fff', boxShadow: '0 8px 20px rgba(240,75,34,0.30)' }}
                    >
                      {busy === 'lock' ? 'Locking document…' : <><Lock size={14} className="text-white" /> Lock Document</>}
                    </button>
                  </div>
                </div>
              );

            /* ── LOCKED (terminal) — Finalize: only Download / Print / 2nd-sig ── */
            case 'signed_locked':
              if (showSecondSig) {
                return (
                  <SecondSignerPicker
                    onCancel={() => setShowSecondSig(false)}
                    onSelect={handleSelectApprover}
                  />
                );
              }
              return (
                <div className="max-w-4xl mx-auto p-6 md:p-12 flex flex-col items-center">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                      <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                      <span className="font-montserrat font-bold text-[10px] uppercase tracking-[0.16em]" style={{ color: '#065F46' }}>
                        Document Signed &amp; Sealed
                      </span>
                    </div>
                    <h2 className="font-montserrat font-bold text-[26px] md:text-[30px] leading-tight" style={{ color: NAVY_DEEP }}>
                      Finalize
                    </h2>
                    <p className="font-roboto text-[13px] mt-2" style={{ color: MUTED }}>
                      Your attestation is complete and locked on the server. Choose how to handle the finalized document.
                    </p>
                    {instance?.document_hash && (
                      <p className="font-mono text-[10.5px] mt-3" style={{ color: MUTED }}>
                        doc_hash {String(instance.document_hash).slice(0, 16)}… · manifest {String(instance.manifest_hash ?? '').slice(0, 16)}…
                      </p>
                    )}
                    {hhcEvidenceResult && (
                      <div className="mt-5 text-left rounded-2xl p-4 md:p-5" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={15} style={{ color: '#059669', marginTop: 2, flexShrink: 0 }} />
                          <div className="min-w-0">
                            <div className="font-montserrat font-bold text-[10px] uppercase tracking-[0.14em]" style={{ color: '#065F46' }}>
                              Saved Evidence Confirmation
                            </div>
                            <div className="font-roboto text-[12px] mt-1" style={{ color: '#065F46' }}>
                              Evidence saved and refreshed from backend ({hhcEvidenceResult.refreshed_count} match{hhcEvidenceResult.refreshed_count === 1 ? '' : 'es'}).
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 font-mono text-[10.5px]" style={{ color: '#065F46' }}>
                          <div><span className="font-montserrat">Evidence ID:</span> {hhcEvidenceResult.evidence_id}</div>
                          <div>
                            <span className="font-montserrat">Event ID:</span> {hhcEvidenceResult.event_id}
                            {hhcEvidenceResult.event_id.startsWith('EVT-FORM-FI') && (
                              <span className="ml-2 px-1.5 py-0.5 rounded text-[9px]" style={{ background: '#D1FAE5', border: '1px solid #6EE7B7' }}>
                                Form-generated event
                              </span>
                            )}
                          </div>
                          <div><span className="font-montserrat">Form ID:</span> {hhcEvidenceResult.form_id}</div>
                          <div><span className="font-montserrat">Policy ID:</span> {hhcEvidenceResult.policy_id}</div>
                          <div><span className="font-montserrat">Workflow ID:</span> {hhcEvidenceResult.workflow_id}</div>
                          <div><span className="font-montserrat">Status:</span> {hhcEvidenceResult.status} / {hhcEvidenceResult.signature_status}</div>
                          <div className="md:col-span-2 break-all"><span className="font-montserrat">S3 key:</span> {hhcEvidenceResult.s3_key}</div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const q = new URLSearchParams({
                                event_id: hhcEvidenceResult.event_id,
                                evidence_id: hhcEvidenceResult.evidence_id,
                                form_id: hhcEvidenceResult.form_id,
                                policy_id: hhcEvidenceResult.policy_id,
                              });
                              window.open(`/evidence?${q.toString()}`, '_blank', 'noopener');
                            }}
                            className="px-3 py-1.5 rounded-lg border text-[11px] font-montserrat font-semibold"
                            style={{ borderColor: '#6EE7B7', color: '#065F46', background: 'white' }}
                          >
                            View in Evidence Center
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="group relative text-left rounded-2xl bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                      style={{ border: '1px solid #BFDBFE' }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                        <Download size={22} />
                      </div>
                      <h3 className="font-montserrat font-bold text-[15px] mb-1" style={{ color: NAVY_DEEP }}>Download PDF</h3>
                      <p className="font-roboto text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
                        Save a local copy of the signed document and certificate.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="group relative text-left rounded-2xl bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                      style={{ border: '1px solid #DDD6FE' }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                        <Printer size={22} />
                      </div>
                      <h3 className="font-montserrat font-bold text-[15px] mb-1" style={{ color: NAVY_DEEP }}>Print Document</h3>
                      <p className="font-roboto text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
                        Send the signed document directly to your printer.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => { if (!localTask) setShowSecondSig(true); }}
                      disabled={!!localTask}
                      className={[
                        'group relative text-left rounded-2xl bg-white p-6 transition-all',
                        localTask
                          ? 'opacity-70 cursor-not-allowed'
                          : 'hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]',
                      ].join(' ')}
                      style={{ border: '1px solid #A7F3D0' }}
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: '#ECFDF5', color: '#059669' }}>
                        <Send size={22} />
                      </div>
                      <h3 className="font-montserrat font-bold text-[15px] mb-1" style={{ color: NAVY_DEEP }}>
                        {localTask ? '2nd Signature Pending' : 'Send for Signature'}
                      </h3>
                      <p className="font-roboto text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
                        {localTask
                          ? `Awaiting ${DEMO_STAFF.find(u => u.id === localTask.assignedTo)?.name ?? 'reviewer'}.`
                          : 'Forward this document to another party for countersigning.'}
                      </p>
                    </button>
                  </div>

                  <div className="mt-10 flex items-center gap-2 font-roboto text-[11px]" style={{ color: MUTED }}>
                    <Shield size={12} /> Securely processed by eCIgn
                  </div>
                </div>
              );

            case 'voided':
            case 'expired':
              return (
                <div className="max-w-md mx-auto p-10 text-center">
                  <div className="font-montserrat font-bold text-[18px]" style={{ color: NAVY }}>
                    Instance {backendState}
                  </div>
                  <p className="font-roboto text-[12.5px] mt-2" style={{ color: MUTED }}>
                    This signing instance is no longer active.
                  </p>
                </div>
              );

            default:
              return null;
          }
        })()}
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="px-5 md:px-8 py-3.5 flex items-center justify-between gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 font-roboto text-[11px]" style={{ color: MUTED }}>
            <Shield size={12} /> Backend state: <strong style={{ color: INK }}>{backendState}</strong>
            {instance?.instance_id && (
              <span className="font-mono ml-2">· {instance.instance_id.slice(0, 12)}…</span>
            )}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border font-roboto text-[12px] font-semibold transition-colors hover:bg-[#F4F6FB]"
            style={{ borderColor: BORDER, color: MUTED, background: 'white' }}
          >
            {backendState === 'signed_locked' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ═══ SecondSignerPicker ═══════════════════════════════════════════ */
function SecondSignerPicker({
  onCancel, onSelect,
}: {
  onCancel: () => void;
  onSelect: (user: DemoUser) => void;
}) {
  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10">
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-1.5 font-roboto text-[12px] mb-6 transition-colors hover:underline"
        style={{ color: MUTED }}
      >
        <ArrowLeft size={14} /> Back to certificate
      </button>

      <div className="flex items-start gap-4 mb-8">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: NAVY_SOFT, color: NAVY }}
        >
          <Send size={20} />
        </div>
        <div>
          <h3 className="font-montserrat font-bold text-[22px] leading-tight mb-1" style={{ color: NAVY }}>
            Send for second signature
          </h3>
          <p className="font-roboto text-[13px]" style={{ color: MUTED }}>
            Signed as <strong style={{ color: INK }}>{DEMO_SESSION.name}</strong> · {DEMO_SESSION.role}. Only one-tier-above approvers are selectable.
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {DEMO_STAFF.map(user => {
          const ok   = user.tier === DEMO_SESSION.tier - 1;
          const self = user.id === DEMO_SESSION.id;
          return (
            <li key={user.id}>
              <button
                type="button"
                disabled={!ok}
                onClick={() => ok && onSelect(user)}
                className={[
                  'w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all',
                  ok
                    ? 'cursor-pointer bg-white hover:border-[#1A3778] hover:shadow-[0_6px_20px_rgba(26,55,120,0.10)] hover:-translate-y-0.5'
                    : 'opacity-40 cursor-not-allowed bg-white',
                ].join(' ')}
                style={{ border: `1px solid ${BORDER}` }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-montserrat font-bold text-[11px] shrink-0"
                  style={{ background: ok ? NAVY : '#F2F2F0', color: ok ? 'white' : MUTED }}
                >
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-roboto font-bold text-[13px]" style={{ color: INK }}>{user.name}</div>
                  <div className="font-roboto text-[11px] mt-0.5" style={{ color: MUTED }}>{user.role}</div>
                </div>
                {ok && (
                  <span
                    className="flex items-center gap-1 font-montserrat text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                    style={{ background: ORANGE_SOFT, color: ORANGE }}
                  >
                    One tier up
                  </span>
                )}
                {self && (
                  <span className="font-roboto text-[9px] px-2 py-0.5 rounded bg-[#F2F2F0]" style={{ color: MUTED }}>You</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default eCIgnWorkspace;
