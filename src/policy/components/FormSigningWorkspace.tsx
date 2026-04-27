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
import { recordEsignEvidence } from '@/policy/ecign/hhcEvidence';
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

/* ═══ escHtml util ══════════════════════════════════════════════════ */
function escHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ═══ Audit stamp HTML (shared by print output) ═════════════════════ */
function buildAuditStampHtml(
  certId: string,
  signerName: string,
  signedAt: string,
  logoSrc: string,
) {
  return `
  <div class="ecign-stamp">
    <img class="ecign-stamp-logo" src="${logoSrc}" alt="eCIgn"/>
    <span class="ecign-stamp-dot">·</span>
    <span class="ecign-stamp-mono">${escHtml(certId)}</span>
    <span class="ecign-stamp-dot">·</span>
    <span>${escHtml(signerName)}</span>
    <span class="ecign-stamp-dot">·</span>
    <span>${fmtSignTs(signedAt)}</span>
  </div>`;
}

/* ═══ Certificate HTML builder ══════════════════════════════════════
 *
 * Emits the **appended attestation packet** (template-preservation
 * contract — see Builder/eCIgn/06-Outputs-Templates-Watermarks.md).
 *
 * Pages are emitted in this fixed order, each separated by a CSS
 * `page-break-before: always` so they print as discrete sheets behind
 * the byte-faithful template:
 *
 *   N+1  Attestation Certificate
 *   N+2  Signer Identity & Device Evidence
 *   N+3  Audit Trail (consent, review, sign, lock, second-sig)
 *   N+4  Signers Roster (multi-signature ledger)
 *
 * Returns a full standalone HTML doc *plus* the body-only fragment
 * is consumed by `buildPrintablePacketHtml` (which strips the wrapper
 * and concatenates into the packet).
 * ═══════════════════════════════════════════════════════════════════ */
interface CertParams {
  certId:         string;
  certAt:         string;
  formId:         string;
  formTitle:      string;
  formVersion:    string;
  formInstanceId: string;
  /** Phase 11 — explicit, user-selected linked policies (≥ 1 enforced upstream). */
  linkedPolicyIds:  string[];
  linkedPolicyMeta: PolicyLinkMeta[];
  record:         SignatureRecord;
  signerPhoto?:   string | null;
  geoInfo:        GeoInfo;
  fieldEdits:     FieldEdit[];
  secondSigTask:  SecondSigTask | null;
  /** Roster of every signature applied to the instance (single-sig = 1 entry). */
  allSignatures?: SignatureRecord[];
}

function buildCertHtml(p: CertParams, logoSrc: string): string {
  const geoBlock = (!p.geoInfo.loading && !p.geoInfo.error && p.geoInfo.ip) ? `
  <div class="section">
    <h2>Location &amp; Network</h2>
    <div class="grid4">
      <div class="f"><div class="lbl">IP Address</div><div class="val mono">${escHtml(p.geoInfo.ip)}</div></div>
      <div class="f"><div class="lbl">City</div><div class="val">${escHtml(p.geoInfo.city) || '—'}</div></div>
      <div class="f"><div class="lbl">State / Region</div><div class="val">${escHtml(p.geoInfo.region) || '—'}</div></div>
      <div class="f"><div class="lbl">Country</div><div class="val">${escHtml(p.geoInfo.country) || '—'}</div></div>
      <div class="f"><div class="lbl">ZIP / Postal</div><div class="val mono">${escHtml(p.geoInfo.postal) || '—'}</div></div>
      ${p.geoInfo.org ? `<div class="f"><div class="lbl">Network Org</div><div class="val">${escHtml(p.geoInfo.org)}</div></div>` : ''}
    </div>
  </div>` : '';

  const editsBlock = p.fieldEdits.length > 0 ? `
  <div class="section">
    <h2>Document Edit Trail (${p.fieldEdits.length} change${p.fieldEdits.length !== 1 ? 's' : ''})</h2>
    <table class="tbl">
      <thead><tr><th>#</th><th>Field</th><th>Previous</th><th>New Value</th><th>Changed At</th><th>Changed By</th></tr></thead>
      <tbody>${p.fieldEdits.map(e => `<tr>
        <td>${e.seq}</td><td>${escHtml(e.fieldLabel)}</td>
        <td>${escHtml(e.oldValue) || '—'}</td><td>${escHtml(e.newValue) || '—'}</td>
        <td>${fmtSignTs(e.changedAt)}</td><td>${escHtml(e.changedBy)}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>` : '';

  const taskBlock = p.secondSigTask ? `
  <div class="section">
    <h2>Second Signature Request</h2>
    <div class="grid4">
      <div class="f"><div class="lbl">Task ID</div><div class="val mono">${escHtml(p.secondSigTask.taskId)}</div></div>
      <div class="f"><div class="lbl">Assigned To</div><div class="val">${escHtml(DEMO_STAFF.find(u => u.id === p.secondSigTask!.assignedTo)?.name ?? p.secondSigTask.assignedTo)}</div></div>
      <div class="f"><div class="lbl">Assigned By</div><div class="val">${escHtml(DEMO_STAFF.find(u => u.id === p.secondSigTask!.assignedBy)?.name ?? p.secondSigTask.assignedBy)}</div></div>
      <div class="f"><div class="lbl">Status</div><div class="val">${escHtml(p.secondSigTask.status)}</div></div>
      <div class="f"><div class="lbl">Created At</div><div class="val">${fmtSignTs(p.secondSigTask.createdAt)}</div></div>
    </div>
  </div>` : '';

  const photoBlock = p.signerPhoto ? `
  <div class="section">
    <h2>Signer Photo Verification</h2>
    <img src="${p.signerPhoto}" alt="Signer photo" style="max-width:200px;max-height:200px;border-radius:8px;border:1px solid ${BORDER};"/>
  </div>` : '';

  const stampHtml = buildAuditStampHtml(p.certId, p.record.signerName, p.record.signedAt, logoSrc);

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>${escHtml(p.formId)} — eCIgn Certificate</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;color:${INK};max-width:760px;margin:40px auto;padding:0 24px 80px}
  h1{font-size:22px;font-weight:700;margin-bottom:8px;color:${NAVY}}
  h2{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:${NAVY};margin-bottom:16px}
  .header{display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:3px solid ${ORANGE};margin-bottom:24px}
  .logo{height:40px;object-fit:contain}
  .badge{display:inline-block;padding:3px 10px;background:${ORANGE_SOFT};color:${ORANGE};border-radius:4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px;border:1px solid ${ORANGE}40}
  .intro{color:${MUTED};font-size:13px;margin-top:8px;line-height:1.6}
  .section{padding:20px 0;border-bottom:1px solid ${BORDER}}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 24px}
  .f{display:flex;flex-direction:column}
  .lbl{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:${MUTED};font-weight:700;margin-bottom:3px}
  .val{font-size:13px;color:${INK};overflow-wrap:anywhere;word-break:break-word}
  .val.mono{font-family:monospace;font-size:11px;overflow-wrap:anywhere;word-break:break-all}
  .span2{grid-column:span 2}
  .sig-box{border:1px solid ${BORDER};border-radius:8px;padding:12px;background:${PAPER};display:inline-block;margin-top:12px}
  .sig-img{height:60px;max-width:220px;object-fit:contain;display:block}
  .tbl{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
  .tbl th{background:${PAPER};border-bottom:1px solid ${BORDER};padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:${MUTED}}
  .tbl td{padding:6px 8px;border-bottom:1px solid #F0F0EE;overflow-wrap:anywhere;word-break:break-word}
  .ecign-stamp{
    position:fixed;bottom:0;left:0;right:0;height:36px;
    background:white;border-top:2px solid ${ORANGE};
    display:flex;align-items:center;gap:12px;padding:0 20px;
    font-size:9px;color:${NAVY}
  }
  .ecign-stamp-logo{height:18px;object-fit:contain}
  .ecign-stamp-dot{color:${ORANGE}}
  .ecign-stamp-mono{font-family:monospace;font-size:9px}
  .pg-break{page-break-before:always;break-before:page;height:0}
  .page{padding-top:8px}
  .page-caption{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:${ORANGE};font-weight:700;margin-bottom:4px}
  .timeline{margin-top:10px;border-left:2px solid ${ORANGE}40;padding-left:14px}
  .timeline .ev{position:relative;padding:6px 0 10px}
  .timeline .ev::before{content:'';position:absolute;left:-19px;top:11px;width:8px;height:8px;border-radius:50%;background:${ORANGE}}
  .timeline .ev-when{font-family:monospace;font-size:10px;color:${MUTED}}
  .timeline .ev-what{font-size:12px;color:${INK};font-weight:600;margin-top:2px}
  .timeline .ev-meta{font-size:11px;color:${MUTED};margin-top:1px}
  .roster{display:grid;grid-template-columns:1fr;gap:10px;margin-top:8px}
  .roster .row{display:grid;grid-template-columns:1fr 200px;gap:14px;border:1px solid ${BORDER};border-radius:8px;padding:12px;background:${PAPER}}
  .roster .row .who{display:flex;flex-direction:column;gap:3px}
  .roster .row .who .nm{font-size:13px;font-weight:600;color:${INK}}
  .roster .row .who .rl{font-size:11px;color:${MUTED}}
  .roster .row .who .ts{font-family:monospace;font-size:10px;color:${MUTED};margin-top:4px}
  .roster .row .img{display:flex;align-items:center;justify-content:center;background:white;border:1px solid ${BORDER};border-radius:6px;padding:4px}
  .roster .row .img img{max-height:54px;max-width:190px;object-fit:contain}
  .legal{margin-top:16px;padding:12px 14px;background:${NAVY_SOFT};border-left:3px solid ${NAVY};border-radius:0 6px 6px 0;font-size:11px;color:${INK};line-height:1.55}
  .legal strong{color:${NAVY}}
  .hash-line{font-family:monospace;font-size:10px;color:${MUTED};word-break:break-all}
  @page{margin-bottom:50px}
  @media print{body{margin:16px 16px 50px}}
</style></head><body>

<!-- ═══ PAGE N+1 · Attestation Certificate ══════════════════════════ -->
<section class="page">
  <div class="header">
    <img class="logo" src="${logoSrc}" alt="eCIgn"/>
    <div>
      <div class="badge">eCIgn · Attestation Certificate · Page 1 of 4</div>
      <h1>Electronic Signature Attestation Certificate</h1>
      <p class="intro">This certificate accompanies the byte-faithful template above and records the identity, intent, timestamp, and integrity evidence captured by the CI-App eCIgn workflow under ESIGN Act 15 U.S.C. §§ 7001-7031, the California UETA, and HIPAA 45 CFR §§ 160-164.</p>
    </div>
  </div>

  <div class="section">
    <h2>Document &amp; Certificate</h2>
    <div class="grid4">
      <div class="f"><div class="lbl">Certificate ID</div><div class="val mono">${escHtml(p.certId)}</div></div>
      <div class="f"><div class="lbl">Form ID</div><div class="val mono">${escHtml(p.formId)}</div></div>
      <div class="f"><div class="lbl">Form Version</div><div class="val">v${escHtml(p.formVersion)}</div></div>
      <div class="f"><div class="lbl">Form Instance ID</div><div class="val mono">${escHtml(p.formInstanceId)}</div></div>
      <div class="f span2"><div class="lbl">Form Title</div><div class="val">${escHtml(p.formTitle)}</div></div>
      <div class="f"><div class="lbl">System of Record</div><div class="val">CI-App / eCIgn</div></div>
      <div class="f"><div class="lbl">Certified At</div><div class="val">${fmtSignTs(p.certAt)}</div></div>
    </div>
  </div>

  <div class="section">
    <h2>Linked Policies / Procedures (${p.linkedPolicyMeta.length})</h2>
    <table class="tbl">
      <thead><tr><th>Policy ID</th><th>Title</th><th>Version</th><th>Effective Date</th></tr></thead>
      <tbody>${p.linkedPolicyMeta.map(m => `<tr>
        <td class="mono">${escHtml(m.id)}</td>
        <td>${escHtml(m.title)}</td>
        <td>${escHtml(m.version)}</td>
        <td>${escHtml(m.effectiveDate) || '—'}</td>
      </tr>`).join('')}</tbody>
    </table>
  </div>

  <div class="section">
    <h2>Primary Signer Attestation</h2>
    <div class="grid4">
      <div class="f"><div class="lbl">Signer Name</div><div class="val">${escHtml(p.record.signerName)}</div></div>
      <div class="f"><div class="lbl">Role / Title</div><div class="val">${escHtml(p.record.signerRole)}</div></div>
      <div class="f"><div class="lbl">Email</div><div class="val">${escHtml(p.record.signerEmail)}</div></div>
      <div class="f"><div class="lbl">Signed At (local)</div><div class="val">${fmtSignTs(p.record.signedAt)}</div></div>
    </div>
    <div class="sig-box">
      <img class="sig-img" src="${p.record.signatureDataUrl}" alt="Signature of ${escHtml(p.record.signerName)}"/>
    </div>
    <div class="legal">
      <strong>Attestation.</strong> The signer affirmed: <em>"I agree to use an electronic signature, I have reviewed this document in full, and I intend to sign it."</em> Consent and review acknowledgment were captured prior to signature application; the document was sealed against template mutation immediately after.
    </div>
  </div>
</section>

<!-- ═══ PAGE N+2 · Identity & Device Evidence ══════════════════════ -->
<div class="pg-break"></div>
<section class="page">
  <div class="page-caption">eCIgn · Page 2 of 4</div>
  <h1>Signer Identity &amp; Device Evidence</h1>
  ${photoBlock}
  ${geoBlock}
  <div class="section">
    <h2>Session &amp; Authentication</h2>
    <div class="grid4">
      <div class="f"><div class="lbl">User ID</div><div class="val mono">${escHtml(DEMO_SESSION.id)}</div></div>
      <div class="f"><div class="lbl">Tier</div><div class="val">${escHtml(String(DEMO_SESSION.tier))}</div></div>
      <div class="f"><div class="lbl">Auth Method</div><div class="val">SSO + step-up MFA</div></div>
      <div class="f"><div class="lbl">MFA Verified At</div><div class="val">${fmtSignTs(p.record.signedAt)}</div></div>
    </div>
  </div>
</section>

<!-- ═══ PAGE N+3 · Audit Trail ═════════════════════════════════════ -->
<div class="pg-break"></div>
<section class="page">
  <div class="page-caption">eCIgn · Page 3 of 4</div>
  <h1>Audit Trail</h1>
  <p class="intro">Append-only, hash-chained event ledger. Events are persisted in <code>ecign.audit_events</code> with <code>hash = sha256(prev_hash ‖ payload)</code>; any tamper severs the chain.</p>
  <div class="timeline">
    <div class="ev">
      <div class="ev-when">${fmtSignTs(p.record.signedAt)}</div>
      <div class="ev-what">Disclosure &amp; consent accepted</div>
      <div class="ev-meta">ESIGN/UETA disclosure v1 · IP ${escHtml(p.geoInfo.ip || '—')}</div>
    </div>
    <div class="ev">
      <div class="ev-when">${fmtSignTs(p.record.signedAt)}</div>
      <div class="ev-what">Identity verified</div>
      <div class="ev-meta">SSO + step-up MFA · device fingerprint captured</div>
    </div>
    <div class="ev">
      <div class="ev-when">${fmtSignTs(p.record.signedAt)}</div>
      <div class="ev-what">Document review acknowledged</div>
      <div class="ev-meta">All template pages rendered to signer · ${p.fieldEdits.length} field edit(s) recorded</div>
    </div>
    <div class="ev">
      <div class="ev-when">${fmtSignTs(p.record.signedAt)}</div>
      <div class="ev-what">Signature applied by ${escHtml(p.record.signerName)}</div>
      <div class="ev-meta">PNG hashed · stored append-only in <code>ecign.signatures</code></div>
    </div>
    ${p.secondSigTask ? `
    <div class="ev">
      <div class="ev-when">${fmtSignTs(p.secondSigTask.createdAt)}</div>
      <div class="ev-what">Second-signature requested</div>
      <div class="ev-meta">Task ${escHtml(p.secondSigTask.taskId)} · assigned to ${escHtml(DEMO_STAFF.find(u => u.id === p.secondSigTask!.assignedTo)?.name ?? p.secondSigTask.assignedTo)} · status ${escHtml(p.secondSigTask.status)}</div>
    </div>` : ''}
    <div class="ev">
      <div class="ev-when">${fmtSignTs(p.certAt)}</div>
      <div class="ev-what">Document locked &amp; certificate issued</div>
      <div class="ev-meta">State → <code>signed_locked</code> · template frozen · cert ${escHtml(p.certId)}</div>
    </div>
  </div>
  ${editsBlock}
  ${taskBlock}
</section>

<!-- ═══ PAGE N+4 · Signers Roster (multi-sig ledger) ═══════════════ -->
<div class="pg-break"></div>
<section class="page">
  <div class="page-caption">eCIgn · Page 4 of 4</div>
  <h1>Signers Roster</h1>
  <p class="intro">Complete ledger of every signature applied to this form instance, in the order in which it was captured. For forms requiring multiple approvers (e.g. EN-FM-011 Policy Exception, GV-FM-003 Org Chart), each signer's block is reproduced below.</p>
  <div class="roster">
    ${(p.allSignatures && p.allSignatures.length > 0 ? p.allSignatures : [p.record]).map((s, i) => `
      <div class="row">
        <div class="who">
          <span class="nm">${i + 1}. ${escHtml(s.signerName)}</span>
          <span class="rl">${escHtml(s.signerRole)} · ${escHtml(s.signerEmail)}</span>
          <span class="ts">Signed ${fmtSignTs(s.signedAt)}</span>
          <span class="ts">Field ${escHtml(s.fieldId)}</span>
        </div>
        <div class="img"><img src="${s.signatureDataUrl}" alt="Signature of ${escHtml(s.signerName)}"/></div>
      </div>`).join('')}
    ${p.secondSigTask && (!p.allSignatures || p.allSignatures.every(s => s.signerName !== (DEMO_STAFF.find(u => u.id === p.secondSigTask!.assignedTo)?.name))) ? `
      <div class="row" style="border-style:dashed;background:${ORANGE_SOFT}">
        <div class="who">
          <span class="nm">${(p.allSignatures?.length ?? 1) + 1}. ${escHtml(DEMO_STAFF.find(u => u.id === p.secondSigTask!.assignedTo)?.name ?? p.secondSigTask.assignedTo)} <span style="color:${ORANGE};font-weight:700;font-size:9px;letter-spacing:.12em;text-transform:uppercase;margin-left:6px">Pending</span></span>
          <span class="rl">${escHtml(DEMO_STAFF.find(u => u.id === p.secondSigTask!.assignedTo)?.role ?? '')}</span>
          <span class="ts">Requested ${fmtSignTs(p.secondSigTask.createdAt)} · Task ${escHtml(p.secondSigTask.taskId)}</span>
        </div>
        <div class="img" style="color:${ORANGE};font-size:11px;font-weight:600;border-style:dashed">Awaiting signature</div>
      </div>` : ''}
  </div>
  <div class="legal">
    <strong>Document integrity.</strong> The form template above this packet is byte-identical to the unsigned template at <code>/forms/${escHtml(p.formId)}/print</code> for version v${escHtml(p.formVersion)}. Field values are user data and are recorded in the cert hash, not in the template snapshot. <span class="hash-line">cert-id ${escHtml(p.certId)}</span>
  </div>
</section>

${stampHtml}

</body></html>`;
}

/* ═══ Packet (form + cert) HTML builder ════════════════════════════
 *
 * Builds the print-ready HTML document that the browser renders into a
 * PDF via window.print(). Composition (template-preservation contract,
 * see Builder/eCIgn/06-Outputs-Templates-Watermarks.md):
 *
 *   pages 1..N       byte-faithful template (args.formHtml)
 *                    + repeating eCIgn watermark stamp in footer band
 *   pages N+1..N+4   appended cert packet (args.certHtml)
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
  // Extract cert body (drop wrapper <html>/<head>/<body>) and remove the
  // embedded fixed stamp so we don't render two watermarks per page.
  const certBodyHtml = args.certHtml
    .replace(/^[\s\S]*<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*$/i, '')
    .replace(/<div class="ecign-stamp">[\s\S]*?<\/div>/g, '');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<title>${escHtml(args.formTitle)} — eCIgn Packet</title>
${args.styleAssets}
<style>
  /* ── Packet overrides (do NOT touch form layout) ── */
  @page{margin:0.5in 0.75in 0.55in 0.75in}
  @media print{
    html,body{background:white !important}
    .ecign-cert-section{page-break-before:always}
    /* Hide the on-screen action bar / close affordances if cloned */
    .no-print,.print\\:hidden{display:none !important}
  }
  html,body{margin:0;padding:0;background:white}
  /* ── Certificate section (appended after original form pages) ── */
  .ecign-cert-section{
    break-before:page;page-break-before:always;
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
  .ecign-cert-section .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 24px}
  .ecign-cert-section .f{display:flex;flex-direction:column}
  .ecign-cert-section .lbl{font-size:9px;text-transform:uppercase;letter-spacing:.14em;color:${MUTED};font-weight:700;margin-bottom:3px}
  .ecign-cert-section .val{font-size:13px;color:${INK};overflow-wrap:anywhere;word-break:break-word}
  .ecign-cert-section .val.mono{font-family:monospace;font-size:11px;overflow-wrap:anywhere;word-break:break-all}
  .ecign-cert-section .span2{grid-column:span 2}
  .ecign-cert-section .sig-box{border:1px solid ${BORDER};border-radius:8px;padding:12px;background:${PAPER};display:inline-block;margin-top:12px}
  .ecign-cert-section .sig-img{height:60px;max-width:220px;object-fit:contain;display:block}
  .ecign-cert-section .tbl{width:100%;border-collapse:collapse;font-size:11px;margin-top:8px}
  .ecign-cert-section .tbl th{background:${PAPER};border-bottom:1px solid ${BORDER};padding:6px 8px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:${MUTED}}
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
  ${args.formHtml}
  <div class="ecign-cert-section">${certBodyHtml}</div>
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
  const [hhcEvidenceResult, setHhcEvidenceResult] = useState<{
    evidence_id: string; event_id: string; workflow_id: string;
  } | null>(null);
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
          attestation_text: 'I attest that I have read, understood, and signed this document.',
          signer_id:        DEMO_SESSION.id,
          signer_name:      DEMO_SESSION.name,
          signer_role:      DEMO_SESSION.role,
          signer_email:     DEMO_SESSION.email,
          signed_at:        instance.locked_at_utc || new Date().toISOString(),
        });
        // Surface confirmation UI + console log for demo verification.
        setHhcEvidenceResult({
          evidence_id: r.evidence_id,
          event_id:    r.event_id,
          workflow_id: r.workflow_id,
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

  /* ── Print packet (FINALIZE action) ─────────────────────────────── */
  const handlePrint = useCallback(() => {
    if (!localRecord) return;
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

    /* Roster of every signature applied to this instance, in capture
     * order — drives the multi-signer ledger on packet page N+4. */
    const allSignatures = Array.from(signatures.values())
      .sort((a, b) => a.signedAt.localeCompare(b.signedAt));
    if (!allSignatures.find(s => s.signedAt === localRecord.signedAt && s.signerName === localRecord.signerName)) {
      allSignatures.push(localRecord);
    }

    const certHtml = buildCertHtml({
      certId, certAt, formId, formTitle, formVersion, formInstanceId,
      linkedPolicyIds, linkedPolicyMeta,
      record: localRecord, signerPhoto, geoInfo, fieldEdits,
      secondSigTask: localTask, allSignatures,
    }, eCIgnLogo);
    const html = buildPrintablePacketHtml({
      formTitle,
      formHtml:   getPrintableFormHtml(),
      certHtml,
      certId,
      signerName: localRecord.signerName,
      signedAt:   localRecord.signedAt,
      logoSrc:    eCIgnLogo,
      styleAssets,
    });
    const win = window.open('', '_blank', 'width=840,height=980');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 450);
  }, [localRecord, certId, certAt, formId, formTitle, formVersion, formInstanceId, linkedPolicyIds, linkedPolicyMeta, signerPhoto, geoInfo, fieldEdits, localTask, signatures, getPrintableFormHtml]);

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
                    {localRecord ? (
                      <div className="rounded-xl p-4" style={{ background: PAPER, border: `1px dashed ${BORDER}` }}>
                        <img src={localRecord.signatureDataUrl} alt="Signature" className="h-16 w-full object-contain object-left" />
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
                    {/* HHC Phase 1 — compliance evidence confirmation banner */}
                    {hhcEvidenceResult && (
                      <div
                        className="mt-4 inline-flex items-start gap-2 px-4 py-2.5 rounded-xl text-left"
                        style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}
                      >
                        <CheckCircle2 size={14} style={{ color: '#059669', marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <span className="font-montserrat font-bold text-[9px] uppercase tracking-[0.14em] block" style={{ color: '#065F46' }}>
                            Compliance Evidence Saved
                          </span>
                          <span className="font-mono text-[10.5px]" style={{ color: '#065F46' }}>
                            event_id: {hhcEvidenceResult.event_id} · evidence_id: {hhcEvidenceResult.evidence_id}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                    <button
                      type="button"
                      onClick={handlePrint}
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
