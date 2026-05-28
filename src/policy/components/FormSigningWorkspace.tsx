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
  ArrowLeft, Lock, RefreshCw, ChevronRight,
  FileSignature, ScanFace, Sparkles, IdCard,
} from 'lucide-react';
import eCIgnLogo from '@/assets/eCIgn.png';
import {
  type SignatureRecord,
  type SecondSigTask,
  type GeoInfo,
  type FieldEdit,
  type DemoUser,
  type FormSignerSlot,
  type SignerTask,
  DEMO_STAFF,
  signerNanoid,
  fmtSignTs,
} from './FormSignatureContext';
import {
  useEcignInstance,
  UI_STEPS,
  type BackendState,
} from '@/policy/ecign/useEcignInstance';
import { ecignApi, ATTESTATION_TEXT, sha256Hex } from '@/policy/ecign/api';
import {
  recordEsignEvidence,
  queryEvidenceByContext,
  type EsignEvidenceResponse,
} from '@/policy/ecign/hhcEvidence';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useEnforcementStore } from '@/policy/stores/enforcementStore';
import { getFlag as getPmFlag } from '@/policy/pm/featureFlags';
import { buildArtifactRoute } from '@/policy/artifacts/artifactRoute';
import { buildSignerRosterHtml, type RosterSignerEntry } from '@/policy/ecign/buildSignerRosterHtml';
import {
  captureSignedFormSnapshot,
  isolateSignedSnapshotHtml,
  recommendSnapshotEncoding,
} from '@/policy/ecign/captureSignedFormSnapshot';
import { useEcignSignerIdentity } from '@/policy/ecign/signerIdentity';
// Single app logo - using the one file specified by user
import ciLogoWhite from '@/assets/ci-logo-white.png';
import { HelpContextLink } from '@/policy/help/HelpContextLink';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
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

function decodeHtmlDataUrl(dataUrl: string): string | undefined {
  if (!dataUrl.startsWith('data:text/html')) return undefined;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return undefined;
  const meta = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  try {
    if (/;base64/i.test(meta)) {
      const binary = atob(payload.replace(/\s/g, ''));
      const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    }
    return decodeURIComponent(payload);
  } catch {
    return undefined;
  }
}
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

function isCanonicalCesFormInstanceId(value: string, eventId: string, formId: string): boolean {
  if (!value || value.startsWith('fi_')) return false;
  return value.startsWith(`${eventId}-${formId}-`);
}

/** External API mirror ids — never treat as canonical CES artifact targets. */
function isInternalMirrorEvidenceId(value: string | undefined): boolean {
  return Boolean(value && (/^ECIGN-INTERNAL-MIRROR-/i.test(value) || /^STUB-ESIGN-/i.test(value)));
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
  signerIp?:        string;
  signerLocation?:  string;
  signerCity?:      string;
  signerState?:     string;
  signerCountry?:   string;
  signerPostal?:    string;
  signerOrgIsp?:    string;
  signerSource?:    string;
  signerCapturedAt?: string;
  signerUserAgent?: string;
  signerLookupStatus?: string;
  signerFailureReason?: string;
  // Identity attribution (formerly in standalone Identity Evidence page)
  signerEmail?:        string;
  signerUserId?:       string;
  authMethod?:         string;
  mfaVerifiedAt?:      string;
  // Device evidence (formerly in standalone Identity Evidence page)
  devicePlatform?:     string;
  deviceName?:         string;
  deviceManufacturer?: string;
  deviceModel?:        string;
  deviceProcessor?:    string;
  deviceOs?:           string;
  deviceOsVersion?:    string;
}

interface NetworkLocationShape {
  ip_address?: string;
  city?: string;
  state_region?: string;
  country?: string;
  postal?: string;
  org_isp?: string;
  source?: string;
  captured_at?: string;
  user_agent?: string;
  lookup_status?: string;
  failure_reason?: string;
}

interface AuditEventShape {
  event_id?: string;
  occurred_at_utc?: string;
  action?: string;
  actor?: {
    user_id?: string;
    name?: string;
    role?: string;
    email?: string;
    auth_method?: string;
    mfa_verified_at?: string;
  };
  network?: {
    ip?: string;
    user_agent?: string;
    source?: string;
    network_location?: NetworkLocationShape;
    geo?: {
      city?: string;
      region?: string;
      country?: string;
      postal?: string;
      org?: string;
    };
    device?: {
      name?: string;
      manufacturer?: string;
      model?: string;
      processor?: string;
      os?: string;
      os_version?: string;
      platform?: string;
    };
  };
  subject?: {
    id?: string;
    document_hash?: string;
  };
  hash?: string;
  payload?: Record<string, unknown> & {
    network_location?: NetworkLocationShape;
  };
}

function asAuditEventShape(v: Record<string, unknown>): AuditEventShape {
  return v as AuditEventShape;
}

function buildFourColumnKvTable(rows: Array<[string, string]>): string {
  const htmlRows: string[] = [];
  for (let i = 0; i < rows.length; i += 2) {
    const [k1, v1] = rows[i];
    const pair2 = rows[i + 1];
    if (pair2) {
      const [k2, v2] = pair2;
      htmlRows.push(`<tr><th>${escHtml(k1)}</th><td>${escHtml(v1)}</td><th>${escHtml(k2)}</th><td>${escHtml(v2)}</td></tr>`);
    } else {
      htmlRows.push(`<tr><th>${escHtml(k1)}</th><td>${escHtml(v1)}</td><th></th><td></td></tr>`);
    }
  }
  return `<table class="tbl tbl-quad"><tbody>${htmlRows.join('')}</tbody></table>`;
}

function isLocalOrPrivateIp(ip: string): boolean {
  const v = (ip || '').trim().toLowerCase();
  if (!v) return false;
  if (v === '::1' || v === '127.0.0.1' || v.startsWith('::ffff:127.')) return true;
  if (v.startsWith('10.') || v.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true;
  if (v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80:')) return true;
  return false;
}

function normalizeIp(ip: string): string {
  const v = (ip || '').trim();
  if (!v) return '';
  if (v === '::1' || v.startsWith('::ffff:127.')) return '127.0.0.1';
  return v;
}

function formatDisplayIp(ip: string): string {
  const normalized = normalizeIp(ip);
  if (!normalized) return 'Unavailable';
  return isLocalOrPrivateIp(ip) ? `${normalized} (Local/Private)` : normalized;
}

function isNetworkLocationShape(value: unknown): value is NetworkLocationShape {
  return Boolean(value && typeof value === 'object');
}

function resolveNetworkLocationFromEvent(signatureEvt?: AuditEventShape): Required<NetworkLocationShape> {
  const fromPayload = signatureEvt?.payload?.network_location;
  const fromNetwork = signatureEvt?.network?.network_location;
  const raw = isNetworkLocationShape(fromPayload)
    ? fromPayload
    : (isNetworkLocationShape(fromNetwork) ? fromNetwork : undefined);

  if (raw) {
    const ipAddress = raw.ip_address || signatureEvt?.network?.ip || '';
    return {
      ip_address: ipAddress || 'Unavailable',
      city: raw.city || 'Unavailable',
      state_region: raw.state_region || 'Unavailable',
      country: raw.country || 'Unavailable',
      postal: raw.postal || 'Unavailable',
      org_isp: raw.org_isp || 'Unavailable',
      source: raw.source || signatureEvt?.network?.source || 'stored_network_metadata',
      captured_at: raw.captured_at || signatureEvt?.occurred_at_utc || 'Unavailable',
      user_agent: raw.user_agent || signatureEvt?.network?.user_agent || 'Unavailable',
      lookup_status: raw.lookup_status || 'lookup_failed',
      failure_reason: raw.failure_reason || '',
    };
  }

  // Backward compatibility for legacy audits that only stored `network.geo`.
  const legacyIp = signatureEvt?.network?.ip || '';
  const isLocal = isLocalOrPrivateIp(legacyIp);
  const legacyGeo = signatureEvt?.network?.geo;
  const hasLegacyGeo = Boolean(legacyGeo?.city || legacyGeo?.region || legacyGeo?.country || legacyGeo?.postal || legacyGeo?.org);
  return {
    ip_address: legacyIp || 'Unavailable',
    city: legacyGeo?.city || 'Unavailable',
    state_region: legacyGeo?.region || 'Unavailable',
    country: legacyGeo?.country || 'Unavailable',
    postal: legacyGeo?.postal || 'Unavailable',
    org_isp: legacyGeo?.org || 'Unavailable',
    source: signatureEvt?.network?.source || 'legacy_network_geo',
    captured_at: signatureEvt?.occurred_at_utc || 'Unavailable',
    user_agent: signatureEvt?.network?.user_agent || 'Unavailable',
    lookup_status: isLocal
      ? 'private_or_local_ip'
      : (hasLegacyGeo ? 'resolved' : 'lookup_failed'),
    failure_reason: isLocal
      ? 'private_or_local_ip'
      : (hasLegacyGeo ? '' : 'legacy_network_metadata_missing'),
  };
}

function buildAuditTrailHtml(events: AuditEventShape[], logoSrc: string = eCIgnLogo): string {
  const rows = events
    .slice()
    .sort((a, b) => (a.occurred_at_utc || '').localeCompare(b.occurred_at_utc || ''));

  const chainHead = rows.length ? (rows[rows.length - 1].hash || 'GENESIS') : 'GENESIS';

  return `
<section class="ecign-page ecign-cert-section">
  <div class="header">
    <img class="logo" src="${logoSrc}" alt="eCIgn"/>
    <div>
      <div class="badge">Audit Trail</div>
      <h1>Audit Trail Timeline</h1>
      <p class="intro">Append-only event chain for signer intent, identity, review, signature, and lock actions.</p>
    </div>
  </div>
  <div class="section">
    <table class="tbl" style="font-size:10px"><thead>
      <tr><th>#</th><th>UTC</th><th>Action</th><th>Actor / Network</th></tr>
    </thead><tbody>
      ${rows.map((e, i) => `<tr>
        <td>${i + 1}</td>
        <td>${escHtml(e.occurred_at_utc || '—')}</td>
        <td>${escHtml(e.action || '—')}<div class="meta mono">${escHtml((e.hash || '—').slice(0, 20))}</div></td>
        <td>${escHtml(e.actor?.name || e.actor?.user_id || '—')}<div class="meta">${escHtml(e.network?.ip || '—')}</div></td>
      </tr>`).join('')}
    </tbody></table>
    <p class="intro" style="margin-top:10px">Hash chain head: <span class="val mono">${escHtml(chainHead)}</span></p>
  </div>
</section>`;
}

function buildIntegrityManifestHtml(args: {
  documentHash?: string | null;
  signatureHash?: string | null;
  certId: string;
  auditEvents: AuditEventShape[];
  logoSrc?: string;
}): string {
  const logoSrc = args.logoSrc ?? eCIgnLogo;
  const chainHead = args.auditEvents.length
    ? (args.auditEvents[args.auditEvents.length - 1].hash || 'GENESIS')
    : 'GENESIS';
  return `
<section class="ecign-page ecign-cert-section">
  <div class="header">
    <img class="logo" src="${logoSrc}" alt="eCIgn"/>
    <div>
      <div class="badge">Integrity</div>
      <h1>Document Integrity Manifest</h1>
      <p class="intro">External verification map for document hash, audit chain, and certificate identity.</p>
    </div>
  </div>
  <div class="section">
    <table class="tbl"><tbody>
      <tr><th>Certificate ID</th><td>${escHtml(args.certId)}</td></tr>
      <tr><th>Document Hash (SHA-256)</th><td class="val mono">${escHtml(args.documentHash || '—')}</td></tr>
      <tr><th>Signature Hash</th><td class="val mono">${escHtml(args.signatureHash || '—')}</td></tr>
      <tr><th>Audit Chain Head</th><td class="val mono">${escHtml(chainHead)}</td></tr>
      <tr><th>Verification</th><td>Recompute SHA-256 over canonical document bytes and compare values. Verify audit chain integrity via API verify-chain.</td></tr>
    </tbody></table>
  </div>
</section>`;
}

function buildCertHtml(p: CertParams, logoSrc: string): string {
  const policyId = p.linkedPolicyIds[0] || p.linkedPolicyMeta[0]?.id || '—';
  const attestationText = p.attestationText || ATTESTATION_TEXT;

  const recordRows: Array<[string, string]> = [
    ['Certificate ID', p.certId],
    ['Evidence ID', p.evidenceId || 'Pending evidence sync'],
    ['Form ID', p.formId],
    ['Policy ID', policyId],
    ['Workflow ID', p.workflowId || '—'],
    ['Event ID', p.eventId || `EVT-FORM-${p.formInstanceId}`],
    ['Signature Status', p.signatureStatus || 'SIGNED'],
    ['Status', p.evidenceStatus || 'APPROVED_EVIDENCE'],
  ];

  const identityRows: Array<[string, string]> = [
    ['Signer Name', p.record.signerName],
    ['Signer Role', p.record.signerRole || '—'],
    ['Signer Email', p.signerEmail || p.record.signerEmail || '—'],
    ['User ID', p.signerUserId || '—'],
    ['Authentication Method', p.authMethod || 'session'],
    ['MFA Verified At (UTC)', p.mfaVerifiedAt || '—'],
    ['Signed Timestamp (UTC)', fmtSignTs(p.record.signedAt)],
  ];

  const networkRows: Array<[string, string]> = [
    ['Signer IP', p.signerIp || '—'],
    ['Signer City', p.signerCity || '—'],
    ['Signer State / Region', p.signerState || '—'],
    ['Signer Country', p.signerCountry || '—'],
    ['Signer Postal', p.signerPostal || '—'],
    ['Signer Org / ISP', p.signerOrgIsp || '—'],
    ['Signer Location', p.signerLocation || '—'],
    ['Location Source', p.signerSource || '—'],
    ['Location Captured At (UTC)', p.signerCapturedAt || '—'],
    ['Lookup Status', p.signerLookupStatus || '—'],
    ['Lookup Failure Reason', p.signerFailureReason || '—'],
  ];

  const deviceRows: Array<[string, string]> = [
    ['User Agent', p.signerUserAgent || '—'],
    ['Platform', p.devicePlatform || '—'],
    ['Device Name', p.deviceName || '—'],
    ['Manufacturer', p.deviceManufacturer || 'Not Reported'],
    ['Model', p.deviceModel || 'Not Reported'],
    ['Processor', p.deviceProcessor || 'Not Reported'],
    ['OS', p.deviceOs || 'Not Reported'],
    ['OS Version', p.deviceOsVersion || 'Not Reported'],
  ];

  const integrityRows: Array<[string, string]> = [
    ['Document Hash (SHA-256)', p.documentHash || '—'],
    ['Signature Hash', p.signatureHash || '—'],
    ['S3 Key', p.s3Key || '—'],
  ];

  return `
<section class="ecign-cert-page">
  <div class="header">
    <img class="logo" src="${logoSrc}" alt="eCIgn"/>
    <div>
      <h1>Electronic Signature Attestation Certificate</h1>
      <p class="legal-line">Executed in accordance with the Electronic Signatures in Global and National Commerce Act (ESIGN), 15 U.S.C. §§ 7001–7031, the Uniform Electronic Transactions Act (UETA), and applicable HIPAA regulations (45 CFR §§ 160–164). Signer identity, network location, and device evidence captured at signature time for ESIGN/UETA defensibility.</p>
    </div>
  </div>
  <div class="attestation-block">
    <div class="lbl">Attestation</div>
    <p class="attestation">“I agree to use an electronic signature, I have reviewed this document in full, and I intend to sign it. I understand this electronic signature is legally binding and equivalent to a handwritten signature.”</p>
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
    <h2>Evidence Metadata · Record</h2>
    ${buildFourColumnKvTable(recordRows)}
  </div>
  <div class="section">
    <h2>Evidence Metadata · Signer Identity</h2>
    ${buildFourColumnKvTable(identityRows)}
  </div>
  <div class="section">
    <h2>Evidence Metadata · Network Location</h2>
    ${buildFourColumnKvTable(networkRows)}
  </div>
  <div class="section">
    <h2>Evidence Metadata · Device</h2>
    ${buildFourColumnKvTable(deviceRows)}
  </div>
  <div class="section">
    <h2>Evidence Metadata · Document Integrity</h2>
    ${buildFourColumnKvTable(integrityRows)}
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
  appendedHtml: string;
  certId: string;
  signerName: string;
  signedAt: string;
  logoSrc: string;
  /** Care Indeed brand logo as a data URL; rendered as a banner on every page. */
  ciLogoSrc: string;
  /**
   * Combined <link> + <style> tags, in head-source order.
   * Pass an empty string when building the STORED artifact so the packet
   * stays under the 4 MB localStorage threshold and survives page reloads.
   * The certificate CSS below is self-contained and handles all rendering.
   */
  styleAssets: string;
}) {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>${escHtml(args.formTitle)} — eCIgn Packet</title>
${args.styleAssets}
<style>
  /*
   * ── Standalone-packet isolation ──────────────────────────────────────
   * The styleAssets block above includes the full CI application CSS
   * (Tailwind + brand tokens). Those rules set body background patterns
   * (the orange-arc logo watermark) that must NOT appear in the signed
   * artifact or in the artifact-viewer iframe.  All rules below use
   * !important so they win the specificity race against any rule above.
   */
  html,
  body,
  #root,
  [id^="root-"],
  .min-h-screen,
  [class*="bg-ci-bg"],
  [class*="bg-zinc"],
  [class*="bg-slate"],
  [class*="bg-gray"] {
    background: #ffffff !important;
    background-image: none !important;
    background-color: #ffffff !important;
  }
  /* Hide any nav, sidebar, topbar, or action bars baked into the form HTML */
  nav,
  header:not(.ecign-cert-section *),
  [class*="navbar"],
  [class*="sidebar"],
  [class*="topbar"],
  [class*="action-bar"],
  [class*="no-print"],
  .no-print { display: none !important; }
  /* ── Packet overrides (do NOT touch form layout) ── */
  @page{size:Letter;margin:0.5in}
  @media print{
    html,body{background:white !important;margin:0 !important;padding:0 !important}
    /* Global print CSS can hide popup nodes via body:has(...) guards. */
    .ecign-print-root,.ecign-print-root *{visibility:visible !important}
    body:has(.form-page) .ecign-cert-section,
    body:has(.form-page) .ecign-cert-section *,
    body:has(.form-frame) .ecign-cert-section,
    body:has(.form-frame) .ecign-cert-section *,
    body:has(.form-page) .ecign-footer,
    body:has(.form-frame) .ecign-footer,
    body:has(.form-page) .ecign-footer *{visibility:visible !important}
    body:has(.form-frame) .ecign-footer *{visibility:visible !important}
    .ecign-cert-section{page-break-before:auto;break-before:auto}
    .ecign-page{page-break-before:auto;break-before:auto}
    .ecign-print-root .ecign-page:first-of-type{page-break-before:always;break-before:page}
    .ecign-print-root,.ecign-print-root .form-page,.ecign-print-root .form-frame{height:auto !important;min-height:0 !important;overflow:visible !important}
    .screen-shell{background:#FFFFFF !important;padding:0 !important;margin:0 !important;max-width:none !important}
    .form-frame{
      box-shadow:none !important;border:none !important;border-radius:0 !important;
      padding:0 !important;margin:0 !important;max-width:none !important;
      width:100% !important;background:#FFFFFF !important;
    }
    .form-frame table{table-layout:fixed !important;width:100% !important;max-width:100% !important;border-collapse:collapse !important}
    .form-frame table th,.form-frame table td{word-break:break-word !important;overflow-wrap:anywhere !important;white-space:normal !important}
    .avoid-break{break-inside:avoid;page-break-inside:avoid}
    thead{display:table-header-group}
    tr,td,th{break-inside:avoid;page-break-inside:avoid}
    /* Hide the on-screen action bar / close affordances if cloned */
    .no-print,.print\\:hidden{display:none !important}
    *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;transition:none !important}
  }
  html,body{margin:0;padding:0;background:#ffffff !important;background-image:none !important}
  .ecign-print-root{position:relative;background:#ffffff !important;min-height:100vh}
  /* ── Certificate section (appended after original form pages) ── */
  .ecign-cert-section{
    max-width:none;width:100%;margin:0;padding:12px 10px 34px;
    font-family:'Segoe UI',Arial,sans-serif;color:${INK};
  }
  .ecign-cert-section .header{display:flex;align-items:center;gap:12px;padding-bottom:8px;border-bottom:2px solid ${ORANGE};margin-bottom:10px}
  .ecign-cert-section .logo{height:40px;object-fit:contain}
  .ecign-cert-section h1{font-size:22px;font-weight:700;margin:0 0 8px;color:${NAVY}}
  .ecign-cert-section h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:${NAVY};margin:0 0 16px;break-after:avoid-page;page-break-after:avoid}
  .ecign-cert-section .badge{display:inline-block;padding:3px 10px;background:${ORANGE_SOFT};color:${ORANGE};border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px;border:1px solid ${ORANGE}40}
  .ecign-cert-section .intro{color:${MUTED};font-size:13px;margin-top:8px;line-height:1.6}
  .ecign-cert-section .section{padding:10px 0;border-bottom:1px solid ${BORDER};break-inside:avoid-page;page-break-inside:avoid}
  .ecign-cert-section .grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 24px}
  .ecign-cert-section .f{display:flex;flex-direction:column}
  .ecign-cert-section .lbl{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:${MUTED};font-weight:700;margin-bottom:3px}
  .ecign-cert-section .val{font-size:13px;color:${INK};overflow-wrap:anywhere;word-break:break-word}
  .ecign-cert-section .val.mono{font-family:monospace;font-size:11px;overflow-wrap:anywhere;word-break:break-all}
  .ecign-cert-section .attestation{font-size:13px;line-height:1.55;color:${INK}}
  .ecign-cert-section .sig-box{border:1px solid ${BORDER};border-radius:8px;padding:12px;background:${PAPER};display:inline-block;margin-top:12px}
  .ecign-cert-section .sig-img{height:60px;max-width:220px;object-fit:contain;display:block}
  .ecign-cert-section .tbl{width:100%;border-collapse:collapse;font-size:10px;margin-top:4px;break-inside:avoid-page;page-break-inside:avoid}
  .ecign-cert-section .tbl th{width:190px;background:${PAPER};border-bottom:1px solid ${BORDER};padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:${MUTED};vertical-align:top}
  .ecign-cert-section .tbl td{padding:6px 8px;border-bottom:1px solid #F0F0EE;overflow-wrap:break-word;word-break:normal}
    .ecign-cert-section .tbl .meta{font-size:9px;line-height:1.25;color:${MUTED};margin-top:2px}
    .ecign-cert-section .tbl .meta.mono{font-family:monospace}
    .ecign-cert-section .tbl-quad th{width:15%;padding:4px 6px;white-space:nowrap}
    .ecign-cert-section .tbl-quad td{width:35%;padding:4px 6px;vertical-align:top}
  /* Certificate-only tightening to keep legal header/attestation compact. */
  .ecign-cert-page .header{gap:12px;padding-bottom:8px;margin-bottom:8px;border-bottom:2px solid ${ORANGE}}
  .ecign-cert-page .logo{height:28px}
  .ecign-cert-page h1{font-size:18px;line-height:1.18;margin:0 0 3px;color:${NAVY}}
  .ecign-cert-page .legal-line{font-size:9.5px;line-height:1.35;margin:0;color:${MUTED}}
  .ecign-cert-page .attestation-block{padding:6px 0 8px;margin-bottom:2px}
  .ecign-cert-page .attestation{font-size:11.5px;line-height:1.4;margin:2px 0 0;color:${INK}}
  .ecign-cert-page .section{padding:10px 0}
  .ecign-cert-page h2{margin:0 0 8px}
  .ecign-cert-page .grid2{gap:8px 16px}
  .ecign-cert-page .tbl{font-size:10px;margin-top:4px}
  .ecign-cert-page .tbl th{padding:3px 5px}
  .ecign-cert-page .tbl td{padding:3px 5px}
  .ecign-cert-page .sig-box{padding:8px;margin-top:8px}
  .ecign-cert-page .sig-img{height:48px;max-width:200px}
  /* ── Care Indeed brand header — visible on EVERY printed page ── */
  .ci-brand-header{
    position:fixed;top:0;left:0;right:0;height:34px;
    background:rgba(255,255,255,0.97);border-bottom:1px solid #007970;
    display:flex;align-items:center;gap:10px;padding:4px 18px 4px 18px;
    font-family:'Segoe UI',Arial,sans-serif;z-index:9999;
  }
  .ci-brand-header-logo{height:24px;object-fit:contain}
  .ci-brand-header-meta{display:flex;flex-direction:column;line-height:1.05}
  .ci-brand-header-meta .lib{font-size:8.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#52404B}
  .ci-brand-header-meta .org{font-size:9px;color:${MUTED};font-weight:500}
  .ci-brand-header-spacer{flex:1}
  .ci-brand-header-form{font-size:9px;color:${NAVY};font-weight:700;letter-spacing:.10em;text-transform:uppercase;text-align:right}
  /* Push the form content & appended cert pages below the fixed brand header so
     it never overlaps form text on print. */
  @page{margin-top:0.7in;margin-bottom:0.5in}
  @media print{
    .ci-brand-header{display:flex !important}
  }
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
    <!-- Care Indeed brand header pinned to every printed page -->
    <div class="ci-brand-header" aria-hidden="true">
      <img class="ci-brand-header-logo" src="${args.ciLogoSrc}" alt="Care Indeed — The Heart of Home Health"/>
      <div class="ci-brand-header-meta">
        <span class="lib">Care Indeed Home Health Care, Inc.</span>
        <span class="org">Enterprise Forms Library · Signed Document Package</span>
      </div>
      <span class="ci-brand-header-spacer"></span>
      <span class="ci-brand-header-form">${escHtml(args.formTitle)}</span>
    </div>
    ${args.formHtml}
    ${args.appendedHtml}
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

  /* ── Multi-signer (Phase 3 / 09-Multi-Signature-Flow) ── */
  /** Signer slot definitions from the form template. When provided, enables multi-signer flow. */
  signerSlots?:         FormSignerSlot[];
  /** 1-based index of the current signer in the roster (default: 1). */
  signerIndex?:         number;
  /** Total number of required signers (default: 1). */
  totalSigners?:        number;
}

/* ═══ eCIgnWorkspace ═══════════════════════════════════════════════ */
export function ECIgnWorkspace({
  certId,
  fieldId,
  formId,
  formTitle,
  formVersion,
  formInstanceId,
  geoInfo,
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
  signerSlots,
  signerIndex = 1,
  totalSigners = 1,
}: eCIgnWorkspaceProps) {
  // ── eCIgn logo as base64 data URL ────────────────────────────────
  // The Vite asset URL is localhost-relative and breaks in saved HTML packets.
  // We convert once at mount and use the data URL for all injected HTML.
  const eCIgnLogoDataUrlRef = useRef<string>(eCIgnLogo);
  // ── Care Indeed brand logo as base64 data URL ────────────────────
  // Required on EVERY page of the final PDF artifact for brand
  // defensibility. The user has demanded this be present 100+ times.
  const ciLogoDataUrlRef = useRef<string>(ciLogoWhite);
  useEffect(() => {
    let cancelled = false;
    const inline = (src: string, target: { current: string }) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (cancelled) return;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            target.current = canvas.toDataURL('image/png');
          }
        } catch { /* keep original URL on CORS failure */ }
      };
      img.src = src;
    };
    inline(eCIgnLogo, eCIgnLogoDataUrlRef);
    inline(ciLogoWhite, ciLogoDataUrlRef);
    return () => { cancelled = true; };
  }, []);

  const signer = useEcignSignerIdentity();
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
  const isMultiSigner = (signerSlots?.length ?? 0) > 1;
  const {
    instance, loading, error, busy,
    mode: ecignMode,
    acceptConsent, verifyIdentity, acknowledgeReview,
    applySignature: applyServerSignature, lockDocument,
  } = useEcignInstance({
    formId,
    formVersion,
    fieldId,
    eventId: hhcEventId,
    workflowInstanceId: hhcWorkflowId,
    ...(isMultiSigner ? {
      formInstanceId: formInstanceId,
      sharedInstance: true,
      signerSlots: signerSlots?.map(s => ({ field_id: s.field_id, role: s.role, tier: s.tier })),
      signerIndex,
      totalSigners,
    } : {}),
  });
  const emittedAuditActionsRef = useRef<Set<string>>(new Set());
  const createdArtifactsRef = useRef<{ packageId?: string; signedFormInstanceId?: string }>({});
  /** After successful finalize uploads, blocks duplicate triple-upload on effect re-runs (Strict Mode / dep churn). */
  const cesFinalizeCommittedKeyRef = useRef<string | null>(null);
  /** Synchronous guard so React Strict double-invoke cannot interleave two finalize batches. */
  const cesFinalizeSyncLockRef = useRef(false);
  /* MVP-P1-ECIGN-003 / 004 (Wave 4) — lock-gate error surface. When either the
   * role re-check (ECIGN-003) or the required-fields completeness gate
   * (ECIGN-004) blocks the LOCKED status transition, this state holds the
   * human-readable reason so the operator sees an inline banner. Cleared when
   * the user re-attempts finalize. */
  const [lockGateError, setLockGateError] = useState<{ code: 'role_mismatch' | 'missing_required'; message: string } | null>(null);
  const canonicalFormInstanceId = useMemo(() => {
    if (!hhcEventId) return formInstanceId;
    if (isCanonicalCesFormInstanceId(formInstanceId, hhcEventId, formId)) return formInstanceId;
    const resolved = useRegulatoryExecutionStore.getState().getOrCreateFormInstance({
      eventId: hhcEventId,
      formId,
      taskId: parentTaskId || undefined,
      requirementId: parentTaskId ? `${parentTaskId}::FORM_COMPLETION::${formId}` : undefined,
      policyIds: linkedPolicyIds.length > 0 ? linkedPolicyIds : (policies.length > 0 ? policies : ['UNASSIGNED-POLICY']),
      workflowId: hhcWorkflowId || undefined,
    });
    return resolved?.id || formInstanceId;
  }, [formId, formInstanceId, hhcEventId, hhcWorkflowId, linkedPolicyIds, parentTaskId, policies]);

  /* Map backend state → UI step. UI never drives state itself. */
  const backendState: BackendState = (instance?.state ?? 'created') as BackendState;
  const activeIdx = Math.max(0, UI_STEPS.findIndex(s => s.backend === backendState));

  const appendExecutionAudit = useCallback((action: string, reason?: string, after?: Record<string, unknown>) => {
    if (!hhcEventId || !parentTaskId) return;
    const key = `${instance?.instance_id ?? canonicalFormInstanceId}:${action}`;
    if (emittedAuditActionsRef.current.has(key)) return;
    emittedAuditActionsRef.current.add(key);
    useRegulatoryExecutionStore.getState().appendTaskAuditEvent(hhcEventId, 'task', parentTaskId, action, {
      reason,
      after: {
        formId,
        canonicalFormInstanceId,
        ecignSessionId: instance?.instance_id,
        ...after,
      },
    });
  }, [canonicalFormInstanceId, formId, hhcEventId, instance?.instance_id, parentTaskId]);

  useEffect(() => {
    if (!instance?.instance_id) return;
    if (!hhcEventId || !parentTaskId) return;
    if (backendState === 'created') {
      appendExecutionAudit('SIGNATURE_SESSION_CREATED', 'eCIgn signing session opened.');
    } else if (backendState === 'disclosed') {
      appendExecutionAudit('CONSENT_ACCEPTED', 'Signer accepted electronic signature disclosure.');
    } else if (backendState === 'verified') {
      appendExecutionAudit('IDENTITY_CONFIRMED', 'Signer identity was verified.');
    } else if (backendState === 'reviewed') {
      appendExecutionAudit('DOCUMENT_REVIEWED', 'Signer acknowledged full document review.');
    } else if (backendState === 'attested') {
      appendExecutionAudit('SIGNATURE_APPLIED', 'Signature image was applied.');
      appendExecutionAudit('ATTESTATION_ACCEPTED', 'Signer attestation accepted.');
    } else if (backendState === 'signed_locked') {
      appendExecutionAudit('SIGNATURE_FINALIZED', 'Document hash and manifest were finalized.');
    }
  }, [appendExecutionAudit, backendState, hhcEventId, instance?.instance_id, parentTaskId]);

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
    const key = `${instance.instance_id}:locked:${canonicalFormInstanceId}`;
    if (hhcMirroredRef.current === key) return;
    hhcMirroredRef.current = key;
    const sigHash = (instance.manifest_hash || instance.document_hash || '').toString();
    if (!sigHash) return;            // nothing to attest yet
    // Use the regulatory event_id if provided; fall back to a stable derived key.
    const resolvedEventId    = hhcEventId    || `EVT-FORM-${canonicalFormInstanceId}`;
    const resolvedWorkflowId = hhcWorkflowId || undefined;
    const attestationText = ATTESTATION_TEXT;
    void (async () => {
      try {
        const evidenceAuditRows = await ecignApi.getAuditEvents(instance.instance_id);
        const evidenceAuditEvents = Array.isArray(evidenceAuditRows)
          ? evidenceAuditRows.map((r) => asAuditEventShape(r))
          : [];
        const evidenceSignatureEvent = [...evidenceAuditEvents].reverse()
          .find((e) => e.action === 'signature.applied');
        const evidenceNetworkLocation = resolveNetworkLocationFromEvent(evidenceSignatureEvent);

        const r = await recordEsignEvidence({
          policy_id:        linkedPolicyIds[0] || policies[0],
          workflow_id:      resolvedWorkflowId,
          event_id:         resolvedEventId,
          form_id:          formId,
          form_instance_id: canonicalFormInstanceId,   // canonical CES binding for compliance traceability
          document_id:      String(instance.document_version_id || formId),
          document_hash:    instance.document_hash || null,
          signature_hash:   sigHash,
          attestation_text: attestationText,
          signer_id:        signer.id,
          signer_name:      signer.name,
          signer_role:      signer.role,
          signer_email:     signer.email,
          signed_at:        instance.locked_at_utc || new Date().toISOString(),
          network_location: {
            ip_address: evidenceNetworkLocation.ip_address,
            city: evidenceNetworkLocation.city,
            state_region: evidenceNetworkLocation.state_region,
            country: evidenceNetworkLocation.country,
            postal: evidenceNetworkLocation.postal,
            org_isp: evidenceNetworkLocation.org_isp,
            source: evidenceNetworkLocation.source,
            captured_at: evidenceNetworkLocation.captured_at,
            user_agent: evidenceNetworkLocation.user_agent,
            lookup_status: evidenceNetworkLocation.lookup_status,
            failure_reason: evidenceNetworkLocation.failure_reason || undefined,
          },
        });
        setAuditEvents(evidenceAuditEvents);
        // Immediately refresh evidence from backend using all available context keys.
        const evidenceRefresh = await queryEvidenceByContext({
          event_id: r.event_id,
          event_candidates: [
            resolvedEventId,
            `EVT-FORM-${canonicalFormInstanceId}`,
            canonicalFormInstanceId, // fallback legacy key probe
          ],
          evidence_id: r.evidence_id,
          form_id: r.form_id,
          policy_id: r.policy_id,
        });

        setHhcEvidenceResult({
          ...r,
          form_instance_id: canonicalFormInstanceId,
          signature_hash: sigHash,
          document_hash: instance.document_hash || null,
          attestation_text: attestationText,
          signer_name: signer.name,
          signer_role: signer.role,
          signed_at: instance.locked_at_utc || new Date().toISOString(),
          searched_events: evidenceRefresh.searched_events,
          refreshed_count: evidenceRefresh.matches.length,
        });
      } catch (e) {
        if (import.meta.env.DEV) {
          console.warn('[hhc.esign.evidence] failed', e);
        }
      }
    })();
  }, [
    backendState,
    canonicalFormInstanceId,
    formId,
    hhcEventId,
    hhcWorkflowId,
    instance?.document_hash,
    instance?.instance_id,
    instance?.locked_at_utc,
    instance?.manifest_hash,
    linkedPolicyIds,
    policies,
    signer.email,
    signer.id,
    signer.name,
    signer.role,
  ]);

  const [auditEvents, setAuditEvents] = useState<AuditEventShape[]>([]);
  useEffect(() => {
    if (backendState !== 'signed_locked') return;
    if (!instance?.instance_id) return;
    let cancelled = false;
    void (async () => {
      try {
        const rows = await ecignApi.getAuditEvents(instance.instance_id);
        if (cancelled) return;
        setAuditEvents(Array.isArray(rows) ? rows.map((r) => asAuditEventShape(r)) : []);
      } catch {
        if (!cancelled) setAuditEvents([]);
      }
    })();
    return () => { cancelled = true; };
  }, [backendState, instance?.instance_id]);

  /* ── Local UI state ──────────────────────────────────────────────── */
  const [localRecord,    setLocalRecord]    = useState<SignatureRecord | null>(null);
  const [showSecondSig,  setShowSecondSig]  = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [identityAttested, setIdentityAttested] = useState(false);
  const [localTask,      setLocalTask]      = useState<SecondSigTask | null>(initialSecondSigTask);
  const certAt = useState(() => new Date().toISOString())[0];
  const hasSignerIdentity = useMemo(
    () => Boolean(signer.name?.trim() && signer.email?.trim() && signer.role?.trim()),
    [signer.email, signer.name, signer.role],
  );
  const effectiveRecord = useMemo<SignatureRecord>(() => {
    if (localRecord) return localRecord;
    const firstKnown = signatures.values().next().value as SignatureRecord | undefined;
    if (firstKnown) return firstKnown;
    return {
      fieldId,
      signerName: signer.name,
      signerRole: signer.role,
      signerEmail: signer.email,
      signedAt: instance?.locked_at_utc || certAt,
      signatureDataUrl: SIGNATURE_PLACEHOLDER_DATA_URL,
    };
  }, [certAt, fieldId, instance, localRecord, signatures, signer.email, signer.name, signer.role]);

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

  /* ── Action: apply signature → backend transitions to attested ─── */
  const handleApplySignature = useCallback(async () => {
    if (empty) return;
    const dataUrl = canvasRef.current?.toDataURL('image/png') ?? '';
    const rec: SignatureRecord = {
      fieldId,
      signerName:       signer.name,
      signerRole:       signer.role,
      signerEmail:      signer.email,
      signedAt:         new Date().toISOString(),
      signatureDataUrl: dataUrl,
    };
    setLocalRecord(rec);
    await applyServerSignature(dataUrl, {
      geo: {
        city: geoInfo.city,
        region: geoInfo.region,
        country: geoInfo.country,
        postal: geoInfo.postal,
        org: geoInfo.org,
      },
      device: {
        os: navigator.userAgent,
        platform: navigator.platform,
      },
    });
    onConfirm(rec);
  }, [applyServerSignature, empty, fieldId, geoInfo, onConfirm, signer.email, signer.name, signer.role]);

  /* ── Next signer routing (LOCKED screen action) ─────────────────── */
  const handleSelectApprover = useCallback(async (user: DemoUser) => {
    if (!instance) return;
    const nextIndex = signerIndex + 1;
    const nextSlot = signerSlots?.[nextIndex - 1];
    const task: SecondSigTask = {
      taskId:         `task_${signerNanoid(12)}`,
      type:           'signature_request',
      formInstanceId: canonicalFormInstanceId,
      assignedTo:     user.id,
      assignedBy:     signer.id,
      status:         'pending',
      createdAt:      new Date().toISOString(),
      linkedPolicyIds: [...linkedPolicyIds],
      sourcePolicyContext: {
        source:        formSource,
        parentTaskId,
      },
    };
    try { await ecignApi.requestSecondSignature(instance.instance_id, user.id); }
    catch { /* surface via local state only */ }

    // Persist as a SignerTask in the execution store for multi-signer tracking
    if (hhcEventId) {
      const signerTask: SignerTask = {
        taskId: task.taskId,
        type: 'signature_request',
        formInstanceId: canonicalFormInstanceId,
        formId,
        eventId: hhcEventId,
        assignedTo: user.id,
        assignedToName: user.name,
        assignedToRole: user.role,
        assignedBy: signer.id,
        status: 'pending',
        createdAt: task.createdAt,
        slotFieldId: nextSlot?.field_id || `sig_${nextIndex}`,
        sequenceGroup: nextSlot?.sequence_group || nextIndex,
        signerIndex: nextIndex,
        totalSigners: totalSigners,
        linkedPolicyIds: [...linkedPolicyIds],
        sourcePolicyContext: task.sourcePolicyContext,
      };
      useRegulatoryExecutionStore.getState().createSignerTask(signerTask);
    }

    setLocalTask(task);
    onRequestSecond(task);
    setShowSecondSig(false);
  }, [canonicalFormInstanceId, formId, formSource, hhcEventId, instance, linkedPolicyIds, onRequestSecond, parentTaskId, signer.id, signerIndex, signerSlots, totalSigners]);

  const buildPacketHtml = useCallback((record: SignatureRecord) => {
    // Inline all <style> blocks from the document head. We intentionally
    // skip <link rel="stylesheet"> tags because those reference localhost
    // URLs that cannot resolve in an off-screen DOM or saved HTML packet.
    // In Vite dev mode ALL CSS is injected as inline <style> so this
    // captures the full Tailwind + brand token styling needed for both
    // the print view and the html2pdf.js canvas capture.
    const styleAssets = Array.from(document.head.querySelectorAll('style'))
      .map(node => `<style>${(node as HTMLStyleElement).innerHTML}</style>`)
      .join('\n');

    const signatureHash = (instance?.manifest_hash || instance?.document_hash || '').toString() ||
      hhcEvidenceResult?.signature_hash ||
      '';
    const signatureEvent = [...auditEvents].reverse().find((e) => e.action === 'signature.applied');
    const networkLocation = resolveNetworkLocationFromEvent(signatureEvent);
    const signerIp = formatDisplayIp(networkLocation.ip_address);
    const signerCity = networkLocation.city;
    const signerState = networkLocation.state_region;
    const signerCountry = networkLocation.country;
    const signerPostal = networkLocation.postal;
    const signerOrgIsp = networkLocation.org_isp;
    const signerSource = networkLocation.source;
    const signerCapturedAt = networkLocation.captured_at;
    const signerUserAgent = networkLocation.user_agent;
    const signerLookupStatus = networkLocation.lookup_status;
    const signerFailureReason = networkLocation.failure_reason;
    const signerLocation = [
      signerCity,
      signerState,
      signerCountry,
    ].filter(Boolean).join(', ');

    const actor = signatureEvent?.actor;
    const device = signatureEvent?.network?.device;
    const signerEmail = actor?.email || record.signerEmail;
    const signerUserId = actor?.user_id || '—';
    const authMethod = actor?.auth_method || 'session';
    const mfaVerifiedAt = actor?.mfa_verified_at || '—';
    const devicePlatform = device?.platform || (typeof navigator !== 'undefined' ? navigator.platform : '') || '—';
    const deviceName = device?.name || devicePlatform || 'Client Device';
    const deviceManufacturer = device?.manufacturer || 'Not Reported';
    const deviceModel = device?.model || devicePlatform || 'Not Reported';
    const deviceProcessor = device?.processor || 'Not Reported';
    const deviceOs = device?.os || (typeof navigator !== 'undefined' ? navigator.userAgent : '') || 'Not Reported';
    const deviceOsVersion = device?.os_version || 'Not Reported';

    const certHtml = buildCertHtml({
      certId, certAt, formId, formTitle, formVersion, formInstanceId: canonicalFormInstanceId,
      linkedPolicyIds, linkedPolicyMeta,
      record,
      eventId: hhcEvidenceResult?.event_id || hhcEventId || `EVT-FORM-${canonicalFormInstanceId}`,
      workflowId: hhcEvidenceResult?.workflow_id || hhcWorkflowId,
      evidenceId: hhcEvidenceResult?.evidence_id,
      evidenceStatus: hhcEvidenceResult?.status,
      signatureStatus: hhcEvidenceResult?.signature_status || 'SIGNED',
      s3Key: hhcEvidenceResult?.s3_key,
      documentHash: hhcEvidenceResult?.document_hash || instance?.document_hash || null,
      signatureHash,
      attestationText: hhcEvidenceResult?.attestation_text || ATTESTATION_TEXT,
      signerIp,
      signerCity,
      signerState,
      signerCountry,
      signerPostal,
      signerOrgIsp,
      signerSource,
      signerCapturedAt,
      signerUserAgent,
      signerLookupStatus,
      signerFailureReason,
      signerLocation,
      signerEmail,
      signerUserId,
      authMethod,
      mfaVerifiedAt,
      devicePlatform,
      deviceName,
      deviceManufacturer,
      deviceModel,
      deviceProcessor,
      deviceOs,
      deviceOsVersion,
    }, eCIgnLogoDataUrlRef.current);

    const auditTrailHtml = buildAuditTrailHtml(auditEvents, eCIgnLogoDataUrlRef.current);
    const manifestHtml = buildIntegrityManifestHtml({
      certId,
      auditEvents,
      documentHash: hhcEvidenceResult?.document_hash || instance?.document_hash || null,
      signatureHash,
      logoSrc: eCIgnLogoDataUrlRef.current,
    });

    // Build the signer roster page (spec C.4 — always last appended page)
    const rosterEntries: RosterSignerEntry[] = (signerSlots || []).map((slot, idx) => {
      const matchedSig = signatures.get(slot.field_id);
      const exec = useRegulatoryExecutionStore.getState();
      const signerTasks = exec.signerTasksByFormInstanceId?.[canonicalFormInstanceId] ?? [];
      const task = signerTasks.find(t => t.slotFieldId === slot.field_id);
      const isSelf = slot.resolver === 'self';
      const isCurrent = idx + 1 === signerIndex;
      const isPriorGroup = slot.sequence_group < (signerSlots?.[signerIndex - 1]?.sequence_group ?? 1);

      if (matchedSig || (isCurrent && record)) {
        const sig = matchedSig || record;
        return {
          index: idx + 1,
          fieldId: slot.field_id,
          role: slot.role,
          name: sig.signerName,
          email: sig.signerEmail,
          status: 'signed' as const,
          signedAt: sig.signedAt,
          signatureDataUrl: sig.signatureDataUrl,
          sequenceGroup: slot.sequence_group,
        };
      }
      return {
        index: idx + 1,
        fieldId: slot.field_id,
        role: slot.role,
        name: isSelf ? signer.name : (task?.assignedToName || undefined),
        email: isSelf ? signer.email : undefined,
        status: isPriorGroup ? ('awaiting_group' as const) : ('pending' as const),
        dueDate: task?.dueDate,
        sequenceGroup: slot.sequence_group,
      };
    });

    const rosterHtml = rosterEntries.length > 0 ? buildSignerRosterHtml({
      formId,
      formTitle,
      formVersion,
      formInstanceId: canonicalFormInstanceId,
      entries: rosterEntries,
      logoSrc: eCIgnLogoDataUrlRef.current,
    }) : '';

    const appendedHtml = `
      <section class="ecign-page ecign-cert-section">${certHtml}</section>
      ${auditTrailHtml}
      ${manifestHtml}
      ${rosterHtml}
    `;

    const html = buildPrintablePacketHtml({
      formTitle,
      formHtml:   getPrintableFormHtml(),
      appendedHtml,
      certId,
      signerName: record.signerName,
      signedAt:   record.signedAt,
      logoSrc:    eCIgnLogoDataUrlRef.current,
      ciLogoSrc:  ciLogoDataUrlRef.current,
      styleAssets,
    });

    return html;
  }, [
    certId,
    certAt,
    formId,
    formTitle,
    formVersion,
    canonicalFormInstanceId,
    linkedPolicyIds,
    linkedPolicyMeta,
    signerSlots,
    signerIndex,
    signer.name,
    signer.email,
    signatures,
    instance,
    hhcEvidenceResult,
    hhcEventId,
    hhcWorkflowId,
    geoInfo,
    auditEvents,
    getPrintableFormHtml,
  ]);

  // Store the finalized data URL so Download/Print use the exact artifact bytes.
  const [signedPacketDataUrl, setSignedPacketDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (backendState !== 'signed_locked') return;
    if (!hhcEventId) return;
    if (createdArtifactsRef.current.packageId) return;
    if (!isCanonicalCesFormInstanceId(canonicalFormInstanceId, hhcEventId, formId)) return;

    const finalizeRunKey = `${hhcEventId}|${canonicalFormInstanceId}|${instance?.instance_id ?? ''}`;
    if (cesFinalizeCommittedKeyRef.current === finalizeRunKey) return;
    if (cesFinalizeSyncLockRef.current) return;
    cesFinalizeSyncLockRef.current = true;

    const hasExistingSignedPackage = (() => {
      const exec = useRegulatoryExecutionStore.getState();
      const aliases = [hhcEventId, ...(exec.eventInstanceIdsBySourceEventId[hhcEventId] ?? [])];
      return aliases.some(alias => (exec.evidence[alias] ?? []).some(d =>
        (d.artifactType === 'signed_package' || d.kind === 'signed_package')
        && d.linkedFormInstanceId === canonicalFormInstanceId
        && d.status !== 'SUPERSEDED',
      ));
    })();

    /* ─────────────────────────────────────────────────────────────────
     * SINGLE SOURCE OF TRUTH — store the packet HTML as the artifact.
     *
     * Previously this used html2pdf.js → html2canvas → JPEG → jsPDF,
     * which rasterizes the entire form into a low-quality image, breaks
     * text, and reliably hides the Care Indeed logo. The user has asked
     * to STOP doing this and instead store the EXACT print view as the
     * artifact.
     *
     * We now store the same HTML that the print window renders. The
     * artifact viewer renders it natively (text stays vector, fonts stay
     * crisp, the Care Indeed brand header is preserved). The Download
     * button opens the same HTML in a print popup so the browser saves
     * it as a faithful PDF via its native print engine.
     * ───────────────────────────────────────────────────────────────── */
    (async () => {
    try {
    const rawPacketHtml = buildPacketHtml(effectiveRecord);
    const packetHtml = isolateSignedSnapshotHtml(rawPacketHtml);
    const signedSnapshot = captureSignedFormSnapshot({
      packetHtml,
      formInstanceId: canonicalFormInstanceId,
      filename: `${formId}-${canonicalFormInstanceId}-signed-package.html`,
      encoding: recommendSnapshotEncoding(packetHtml),
    });
    const packetPdfDataUrl = signedSnapshot.dataUrl;
    setSignedPacketDataUrl(packetPdfDataUrl);
    // Stable blob URL for Download flow — same bytes as the stored artifact.
    try {
      const blob = new Blob([packetHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch { /* non-fatal */ }
    const formSnapshotHtml = getPrintableFormHtml();
    void formSnapshotHtml;

    const exec = useRegulatoryExecutionStore.getState();
    const artifactPolicyId = linkedPolicyIds[0] || policies[0] || 'UNASSIGNED-POLICY';
    const artifactWorkflowId = hhcWorkflowId || '';
    const actorLabel = signer.name || 'Current User';
    const finalizedAt = instance?.locked_at_utc || new Date().toISOString();
    const auditRefs = ['SIGNATURE_FINALIZED', 'CERTIFICATE_CREATED', 'SIGNED_PACKAGE_CREATED', 'ARTIFACT_REGISTERED', 'ARTIFACT_LOCKED'];
    const commonArtifactMeta = {
      taskId: parentTaskId || undefined,
      policyIds: [artifactPolicyId],
      workflowId: artifactWorkflowId,
      formIds: [formId],
      linkedFormId: formId,
      linkedFormInstanceId: canonicalFormInstanceId,
      artifactVersion: formVersion,
      ecignSessionId: instance?.instance_id || undefined,
      signatureSessionId: instance?.instance_id || undefined,
      finalizedAt,
      signerName: signer.name,
      signerRole: signer.role,
      signerEmail: signer.email,
      attestationText: ATTESTATION_TEXT,
      documentHash: instance?.document_hash || null,
      manifestHash: instance?.manifest_hash || null,
      signatureHash: (instance?.manifest_hash || instance?.document_hash || null),
      auditEventRefs: auditRefs,
    };

    // SHA-256 over the exact stored snapshot bytes (decode(dataUrl) → UTF-8).
    // Used to prove post-refresh viewer/print/download fidelity.
    let snapshotSha256: string | undefined;
    try {
      const decoded = decodeHtmlDataUrl(packetPdfDataUrl);
      if (decoded) snapshotSha256 = await sha256Hex(decoded);
    } catch { /* verification-only */ }

    // Lock gates MUST pass before we create/lock any signed_package evidence.
    const aliasesForInstance = [hhcEventId, ...(exec.eventInstanceIdsBySourceEventId[hhcEventId] ?? [])];
    const linkedInstance = aliasesForInstance
      .flatMap(alias => exec.generatedFormInstancesByEventId[alias] ?? [])
      .find(item => item.id === canonicalFormInstanceId);

    let roleMismatch: { signerRole: string; currentRole: string } | null = null;
    if (getPmFlag('signer_role_recheck_before_lock')) {
      const currentActorRole = (useEnforcementStore.getState().actor.role ?? '').trim();
      const signerRoleAtSignStart = (signer.role ?? '').trim();
      if (
        currentActorRole
        && signerRoleAtSignStart
        && currentActorRole.toLowerCase() !== signerRoleAtSignStart.toLowerCase()
      ) {
        roleMismatch = { signerRole: signerRoleAtSignStart, currentRole: currentActorRole };
      }
    }

    const missingRequired: string[] = [];
    if (getPmFlag('required_fields_lock_gate') && typeof document !== 'undefined') {
      const required = Array.from(
        document.querySelectorAll<HTMLElement>('[aria-required="true"][data-field-id]'),
      );
      for (const el of required) {
        const fieldId = el.getAttribute('data-field-id') ?? '';
        const labelText = (() => {
          const id = el.id;
          if (id) {
            const lbl = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`);
            if (lbl?.textContent) return lbl.textContent.trim();
          }
          const fieldset = el.closest('fieldset');
          if (fieldset) {
            const legend = fieldset.querySelector('legend');
            if (legend?.textContent) return legend.textContent.trim();
          }
          return fieldId || 'Required field';
        })();
        const tag = el.tagName.toLowerCase();
        let filled = false;
        if (tag === 'input') {
          const inp = el as HTMLInputElement;
          if (inp.type === 'checkbox' || inp.type === 'radio') {
            filled = inp.checked;
          } else {
            filled = !!inp.value && inp.value.trim().length > 0;
          }
        } else if (tag === 'textarea') {
          const ta = el as HTMLTextAreaElement;
          filled = !!ta.value && ta.value.trim().length > 0;
        } else if (tag === 'select') {
          const sel = el as HTMLSelectElement;
          filled = !!sel.value && sel.value.trim().length > 0;
        } else {
          const txt = (el.textContent ?? '').trim();
          filled = txt.length > 0;
        }
        if (!filled) missingRequired.push(labelText.replace(/\\s*\\*?\\s*$/, ''));
      }
    }

    if (roleMismatch || missingRequired.length > 0) {
      if (roleMismatch) {
        const msg = `Lock refused: actor role "${roleMismatch.currentRole}" no longer matches signer role "${roleMismatch.signerRole}" captured at sign start. Re-sign with the correct role.`;
        setLockGateError({ code: 'role_mismatch', message: msg });
        if (parentTaskId) {
          exec.appendTaskAuditEvent(hhcEventId, 'task', parentTaskId, 'FORM_LOCK_BLOCKED_ROLE_MISMATCH', {
            reason: msg,
            before: { signerRole: roleMismatch.signerRole },
            after: { currentActorRole: roleMismatch.currentRole, canonicalFormInstanceId },
          });
        }
        appendExecutionAudit('FORM_LOCK_BLOCKED_ROLE_MISMATCH', msg, {
          signerRoleAtSignStart: roleMismatch.signerRole,
          currentActorRole: roleMismatch.currentRole,
          canonicalFormInstanceId,
        });
        console.warn('[ECIGN-003] Lock blocked: role mismatch', roleMismatch);
      } else if (missingRequired.length > 0) {
        const head = missingRequired.slice(0, 3).join(', ');
        const tail = missingRequired.length > 3 ? ` (and ${missingRequired.length - 3} more)` : '';
        const msg = `Lock refused: ${missingRequired.length} required field(s) missing — ${head}${tail}. Complete the form and re-attempt.`;
        setLockGateError({ code: 'missing_required', message: msg });
        if (parentTaskId) {
          exec.appendTaskAuditEvent(hhcEventId, 'task', parentTaskId, 'FORM_LOCK_BLOCKED_REQUIRED_FIELDS', {
            reason: msg,
            after: { missingFieldCount: missingRequired.length, missingFieldLabels: missingRequired, canonicalFormInstanceId },
          });
        }
        appendExecutionAudit('FORM_LOCK_BLOCKED_REQUIRED_FIELDS', msg, {
          missingFieldCount: missingRequired.length,
          missingFieldLabels: missingRequired,
          canonicalFormInstanceId,
        });
        console.warn('[ECIGN-004] Lock blocked: required fields missing', missingRequired);
      }

      // Physical signature occurred, but compliance lock is refused: do not create/lock evidence artifacts.
      if (linkedInstance) {
        exec.setFormInstanceStatus(linkedInstance.eventId, linkedInstance.id, 'SIGNED');
      }
      return;
    }

    setLockGateError(null);

    const isSubsequentSigner = (signerIndex > 1 && totalSigners > 1) || hasExistingSignedPackage;

    // For subsequent signers, supersede existing evidence; for first signer, upload fresh.
    let signedPackageArtifactId: string;
    let signedFormInstanceArtifactId: string | undefined;

    if (isSubsequentSigner) {
      const aliases = [hhcEventId, ...(exec.eventInstanceIdsBySourceEventId[hhcEventId] ?? [])];
      const allDocs = aliases.flatMap(alias => exec.evidence[alias] ?? []);
      const priorArtifacts = allDocs.filter(d =>
        d.linkedFormInstanceId === canonicalFormInstanceId
        && ['signed_package', 'signed_form_instance'].includes(d.artifactType || '')
        && d.status !== 'SUPERSEDED',
      );
      for (const prior of priorArtifacts) {
        exec.removeEvidence(hhcEventId, prior.id);
      }

      const versionedMeta = {
        ...commonArtifactMeta,
        artifactVersion: `${formVersion}-s${signerIndex}`,
        note: `signer_index=${signerIndex};total_signers=${totalSigners};canonical_form_instance_id=${canonicalFormInstanceId};ecign_session_id=${instance?.instance_id ?? ''}`,
      };

      signedPackageArtifactId = exec.uploadEvidence(hhcEventId, {
        ...versionedMeta,
        name: `${formId}-${canonicalFormInstanceId}-signed-package-v${signerIndex}.html`,
        kind: 'signed_package',
        sizeLabel: `${Math.round(signedSnapshot.approxBytes / 1024)} KB`,
        artifactType: 'signed_package',
        snapshotSha256,
        localDataUrl: packetPdfDataUrl,
      }, actorLabel);

      const signerTasks = exec.signerTasksByFormInstanceId?.[canonicalFormInstanceId] ?? [];
      const myTask = signerTasks.find(t => t.signerIndex === signerIndex && t.status !== 'signed');
      if (myTask) {
        exec.updateSignerTaskStatus(canonicalFormInstanceId, myTask.taskId, 'signed');
      }
    } else {
      signedPackageArtifactId = exec.uploadEvidence(hhcEventId, {
        ...commonArtifactMeta,
        name: `${formId}-${canonicalFormInstanceId}-signed-package.html`,
        kind: 'signed_package',
        sizeLabel: `${Math.round(signedSnapshot.approxBytes / 1024)} KB`,
        artifactType: 'signed_package',
        note: `artifact_type=signed_package;canonical_form_instance_id=${canonicalFormInstanceId};ecign_session_id=${instance?.instance_id ?? ''}`,
        snapshotSha256,
        localDataUrl: packetPdfDataUrl,
      }, actorLabel);

      signedFormInstanceArtifactId = undefined;
    }

    if (!signedPackageArtifactId) {
      return;
    }
    const stashKey = 'ces_ev_data_' + signedPackageArtifactId;
    if (!localStorage.getItem(stashKey)) {
      try { localStorage.setItem(stashKey, packetPdfDataUrl); } catch { /* quota */ }
    }
    cesFinalizeCommittedKeyRef.current = finalizeRunKey;
    createdArtifactsRef.current = {
      packageId: signedPackageArtifactId,
      signedFormInstanceId: signedFormInstanceArtifactId,
    };
    if (instance?.instance_id) {
      try {
        await ecignApi.registerArtifacts(instance.instance_id, {
          signed_package_artifact_id: signedPackageArtifactId,
          certificate_artifact_id: instance.certificate_artifact_id ? String(instance.certificate_artifact_id) : undefined,
        });
      } catch {
        // Evidence is the durable artifact source; this best-effort sync keeps demo-local session metadata aligned.
      }
    }

    exec.appendTaskAuditEvent(hhcEventId, 'evidence', signedPackageArtifactId, 'SIGNED_PACKAGE_CREATED', {
      after: { artifactType: 'signed_package', canonicalFormInstanceId, ecignSessionId: instance?.instance_id },
    });
    exec.appendTaskAuditEvent(hhcEventId, 'evidence', signedPackageArtifactId, 'ARTIFACT_LOCKED', {
      after: { artifactType: 'signed_package', canonicalFormInstanceId, lockedAt: finalizedAt },
    });

    const sourceEvent = REGULATORY_EVENTS.find(event =>
      event.id === hhcEventId || (exec.eventInstanceIdsBySourceEventId[event.id] ?? []).includes(hhcEventId),
    );
    const eventAliases = sourceEvent
      ? [sourceEvent.id, ...(exec.eventInstanceIdsBySourceEventId[sourceEvent.id] ?? [])]
      : [hhcEventId, ...(exec.eventInstanceIdsBySourceEventId[hhcEventId] ?? [])];
    if (sourceEvent?.approvals?.length) {
      for (const approval of sourceEvent.approvals.filter(item => item.required)) {
        const alreadyRequested = exec.approvals.some(item =>
          eventAliases.includes(item.eventId) &&
          item.targetKind === approval.targetKind &&
          item.targetLabel === approval.targetLabel &&
          item.status !== 'rejected',
        );
        if (!alreadyRequested) {
          const targetId = approval.targetKind === 'form'
            ? canonicalFormInstanceId
            : approval.targetKind === 'event'
              ? sourceEvent.id
              : parentTaskId;
          exec.requestApproval(
            hhcEventId,
            approval.targetKind,
            approval.targetLabel,
            targetId,
            `Auto-created after signed package ${signedPackageArtifactId} was locked for ${canonicalFormInstanceId}.`,
          );
        }
      }
    }

    appendExecutionAudit('SIGNED_PACKAGE_CREATED', 'Signed package artifact registered in canonical CES store.', {
      canonicalFormInstanceId,
      ecignSessionId: instance?.instance_id,
      signedPackageArtifactId,
      signedFormInstanceArtifactId: signedFormInstanceArtifactId ?? null,
    });
    appendExecutionAudit('ARTIFACT_REGISTERED', 'Finalized artifacts persisted to canonical CES snapshot.', {
      canonicalFormInstanceId,
      signedPackageArtifactId,
      signedFormInstanceArtifactId: signedFormInstanceArtifactId ?? null,
    });
    appendExecutionAudit('ARTIFACT_LOCKED', 'Finalized artifacts locked for audit/compliance review.', {
      canonicalFormInstanceId,
      signedPackageArtifactId,
      signedFormInstanceArtifactId,
    });

    if (linkedInstance) {
      exec.setFormInstanceStatus(linkedInstance.eventId, linkedInstance.id, 'SIGNED');
      exec.setFormInstanceStatus(linkedInstance.eventId, linkedInstance.id, 'LOCKED');
    }
    if (parentTaskId) {
      exec.attemptCompleteTask(hhcEventId, parentTaskId);
    }
    } finally {
      cesFinalizeSyncLockRef.current = false;
    }
    })();
  }, [
    appendExecutionAudit,
    backendState,
    buildPacketHtml,
    effectiveRecord,
    canonicalFormInstanceId,
    formId,
    formTitle,
    hhcEventId,
    hhcWorkflowId,
    formVersion,
    getPrintableFormHtml,
    instance?.document_hash,
    instance?.instance_id,
    instance?.locked_at_utc,
    instance?.manifest_hash,
    linkedPolicyIds,
    parentTaskId,
    policies,
    signer.email,
    signer.name,
    signer.role,
    signerIndex,
    totalSigners,
  ]);

  const openPacketWindow = useCallback((opts?: { fallbackDownload?: boolean }) => {
    const html = signedPacketDataUrl
      ? decodeHtmlDataUrl(signedPacketDataUrl) ?? isolateSignedSnapshotHtml(buildPacketHtml(effectiveRecord))
      : isolateSignedSnapshotHtml(buildPacketHtml(effectiveRecord));
    // Sanitise formTitle for use in filenames (strip characters illegal on Windows/macOS/Linux).
    const safeTitle = (formTitle || formId).replace(/[/\\?%*:|"<>]/g, '-').trim();
    const pdfFilename = `${safeTitle} — ${canonicalFormInstanceId}`;
    const win = window.open('', '_blank', 'width=840,height=980');
    if (!win) {
      if (opts?.fallbackDownload) {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pdfFilename} — eCIgn-Signed.html`;
        a.click();
        URL.revokeObjectURL(url);
      }
      return;
    }

    win.document.write(html);
    // Setting document.title BEFORE print() causes most browsers to use it as
    // the default filename in the "Save Print Output As" / "Print to PDF" dialog.
    win.document.title = pdfFilename;
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
  }, [buildPacketHtml, canonicalFormInstanceId, effectiveRecord, formId, formTitle, signedPacketDataUrl]);

  /* ── Print packet (FINALIZE action) ─────────────────────────────── */
  const handlePrint = useCallback(() => {
    openPacketWindow();
  }, [openPacketWindow]);

  /* ── Download = open the packet HTML in a print popup ───────────────
   *
   * The single rendering pipeline is the browser's native print engine
   * (window.print on the popup HTML). The stored artifact, the print
   * view, and the artifact viewer all use the SAME HTML, so the
   * download is byte-for-byte identical to what the user sees in print
   * preview. This is the user's stated source of truth.
   * ─────────────────────────────────────────────────────────────────── */
  const handleDownload = useCallback(() => {
    openPacketWindow({ fallbackDownload: true });
  }, [openPacketWindow]);

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

        {instance && (
          <div className="max-w-3xl mx-auto pt-3 px-6">
            <div
              className="px-3 py-2 rounded-lg font-roboto text-[11px]"
              style={{ background: '#EFF6FF', color: '#1E3A8A', border: '1px solid #BFDBFE' }}
            >
              eCIgn mode: <strong>{ecignMode.resolved}</strong>
              {ecignMode.requested !== ecignMode.resolved && (
                <span> (requested {ecignMode.requested}, fallback enabled)</span>
              )}
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
                        Confirm your signer identity and attestation to proceed.
                      </p>
                    </div>
                  </div>

                  <SectionCard title="Signer Identity" icon={<IdCard size={13} />}>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <InfoRow label="Name"  value={signer.name} />
                      <InfoRow label="Role"  value={signer.role} />
                      <InfoRow label="Email" value={signer.email} mono />
                      <InfoRow label="Timestamp" value={`${today} ${timeNow}`} />
                    </dl>
                  </SectionCard>

                  <SectionCard title="Identity Attestation" icon={<Shield size={13} />}>
                    <label
                      className="flex items-start gap-3 rounded-xl p-3"
                      style={{ background: identityAttested ? NAVY_SOFT : 'white', border: `1px solid ${identityAttested ? NAVY : BORDER}` }}
                    >
                      <input
                        type="checkbox"
                        checked={identityAttested}
                        onChange={(e) => setIdentityAttested(e.target.checked)}
                        className="mt-0.5"
                        style={{ accentColor: NAVY }}
                      />
                      <span className="font-roboto text-[12.5px] leading-relaxed" style={{ color: INK }}>
                        I attest that I am the authorized signer and this electronic signature is legally binding.
                      </span>
                    </label>

                    {!hasSignerIdentity && (
                      <p className="font-roboto text-[12px] mt-3" style={{ color: ORANGE }}>
                        Signer identity is unavailable. Please refresh your session before verifying identity.
                      </p>
                    )}
                  </SectionCard>

                  <div className="flex items-center justify-end gap-3 flex-wrap mt-5">
                    <button
                      type="button"
                      onClick={() => {
                        if (!hasSignerIdentity || !identityAttested) return;
                        void verifyIdentity();
                      }}
                      disabled={!hasSignerIdentity || !identityAttested || busy === 'identity'}
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
                    {totalSigners > 1 && (
                      <p className="font-montserrat font-semibold text-[11px] mt-2 mb-1" style={{ color: NAVY }}>
                        Signer {signerIndex} of {totalSigners}
                        {signerIndex < totalSigners ? ' — Next signer required' : ' — All signatures complete'}
                      </p>
                    )}
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
                          {isInternalMirrorEvidenceId(hhcEvidenceResult.evidence_id) ? (
                            <div className="md:col-span-2">
                              <span className="font-montserrat">External mirror:</span>{' '}
                              session-only (not a CES artifact). Use “Open signed package / form instance” for canonical evidence IDs.
                            </div>
                          ) : (
                            <div><span className="font-montserrat">Evidence ID:</span> {hhcEvidenceResult.evidence_id}</div>
                          )}
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
                          {!isInternalMirrorEvidenceId(hhcEvidenceResult.evidence_id) && (
                            <div className="md:col-span-2 break-all"><span className="font-montserrat">S3 key:</span> {hhcEvidenceResult.s3_key}</div>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const fallbackArtifactId = !isInternalMirrorEvidenceId(hhcEvidenceResult.evidence_id)
                                ? hhcEvidenceResult.evidence_id
                                : undefined;
                              const artifactId = createdArtifactsRef.current.packageId || fallbackArtifactId;
                              if (!artifactId) return;
                              const artifactUrl = buildArtifactRoute(artifactId, {
                                eventId: hhcEventId || hhcEvidenceResult.event_id,
                                taskId: parentTaskId,
                                formId,
                                formInstanceId: canonicalFormInstanceId,
                                evidenceId: artifactId,
                                type: createdArtifactsRef.current.packageId ? 'signed_package' : 'evidence',
                              });
                              window.open(artifactUrl, '_blank', 'noopener');
                            }}
                            className="px-3 py-1.5 rounded-lg border text-[11px] font-montserrat font-semibold"
                            style={{ borderColor: '#6EE7B7', color: '#065F46', background: 'white' }}
                          >
                            Open Artifact Viewer
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

      {/* MVP-P1-ECIGN-003 / 004 (Wave 4) — Lock-gate refusal banner.
          Renders ONLY when the role re-check or required-fields gate
          blocked the LOCKED transition (form instance stays SIGNED until
          the issue is corrected). role="alert" + aria-live="assertive" so
          screen readers announce immediately. */}
      {lockGateError && (
        <div
          role="alert"
          aria-live="assertive"
          className="shrink-0 px-5 md:px-8 py-3 flex items-start gap-3"
          style={{
            background: '#FEF2F2',
            borderTop: `1px solid #FCA5A5`,
            color: '#7F1D1D',
          }}
        >
          <Lock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <div className="font-roboto text-[12px] font-semibold mb-0.5">
              {lockGateError.code === 'role_mismatch'
                ? 'Lock blocked — signer role changed'
                : 'Lock blocked — required fields missing'}
            </div>
            <div className="font-roboto text-[11px] leading-snug">{lockGateError.message}</div>
          </div>
          <button
            type="button"
            onClick={() => setLockGateError(null)}
            className="shrink-0 px-2 py-1 rounded text-[10px] font-roboto font-semibold uppercase tracking-wider"
            style={{ background: 'white', border: '1px solid #FCA5A5', color: '#7F1D1D' }}
          >
            Dismiss
          </button>
        </div>
      )}

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
  const signer = useEcignSignerIdentity();
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
            Signed as <strong style={{ color: INK }}>{signer.name}</strong> · {signer.role}. Only one-tier-above approvers are selectable.
          </p>
        </div>
      </div>

      <ul className="space-y-2">
        {DEMO_STAFF.map(user => {
          const ok   = user.tier === signer.tier - 1;
          const self = user.id === signer.id;
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

export default ECIgnWorkspace;
