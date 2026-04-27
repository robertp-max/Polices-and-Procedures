/**
 * PDF assembly — produces a single HTML document containing:
 *   1. Template pages (untouched, byte-faithful)
 *   2. Watermark stamp injected into footer band on every template page
 *   3. Appended pages: Certificate · Identity & Device · Audit Trail · Hash Manifest
 *
 * The HTML is print-ready; the client renders via window.print() to PDF.
 * No template DOM is mutated — watermark is overlay-positioned in the existing
 * footer area; appended pages use `page-break-before: always`.
 */
import { store, type FormInstanceRow, type SignatureRow, type AuditRow } from './store.js';
import { sha256 } from './hashChain.js';

const NAVY = '#1A3778', ORANGE = '#F04B22', INK = '#1F1C1B', MUTED = '#747470', BORDER = '#E5E4E3';

function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface NetworkLocationView {
  ip_address: string;
  city: string;
  state_region: string;
  country: string;
  postal: string;
  org_isp: string;
  source: string;
  captured_at: string;
  user_agent: string;
  lookup_status: string;
  failure_reason: string;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v && typeof v === 'object');
}

function networkLocationFromAudit(event?: AuditRow): NetworkLocationView {
  const raw = (isObject(event?.payload?.network_location)
    ? event?.payload?.network_location
    : (isObject(event?.network?.network_location) ? event?.network?.network_location : undefined)) as Record<string, unknown> | undefined;

  if (raw) {
    return {
      ip_address: String(raw.ip_address ?? event?.network?.ip ?? 'Unavailable'),
      city: String(raw.city ?? 'Unavailable'),
      state_region: String(raw.state_region ?? 'Unavailable'),
      country: String(raw.country ?? 'Unavailable'),
      postal: String(raw.postal ?? 'Unavailable'),
      org_isp: String(raw.org_isp ?? 'Unavailable'),
      source: String(raw.source ?? event?.network?.source ?? 'stored_network_metadata'),
      captured_at: String(raw.captured_at ?? event?.occurred_at_utc ?? 'Unavailable'),
      user_agent: String(raw.user_agent ?? event?.network?.user_agent ?? 'Unavailable'),
      lookup_status: String(raw.lookup_status ?? 'lookup_failed'),
      failure_reason: String(raw.failure_reason ?? ''),
    };
  }

  const geo = isObject(event?.network?.geo) ? event?.network?.geo : {};
  const ip = String(event?.network?.ip ?? 'Unavailable');
  const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff:127.');
  return {
    ip_address: ip,
    city: String(geo.city ?? 'Unavailable'),
    state_region: String(geo.region ?? 'Unavailable'),
    country: String(geo.country ?? 'Unavailable'),
    postal: String(geo.postal ?? 'Unavailable'),
    org_isp: String(geo.org ?? 'Unavailable'),
    source: String(event?.network?.source ?? 'legacy_network_geo'),
    captured_at: String(event?.occurred_at_utc ?? 'Unavailable'),
    user_agent: String(event?.network?.user_agent ?? 'Unavailable'),
    lookup_status: isLocal ? 'private_or_local_ip' : 'lookup_failed',
    failure_reason: isLocal ? 'private_or_local_ip' : 'legacy_network_metadata_missing',
  };
}

/** Build watermark stamp (kept in sync with FormSigningWorkspace.buildAuditStampHtml). */
export function watermarkHtml(certId: string, signer: string, signedAt: string, hashShort: string): string {
  return `<div class="ecign-watermark"
    style="font-family:'Segoe UI',Arial,sans-serif;font-size:9px;color:#52525B;
           opacity:.85;border-top:1px solid ${BORDER};padding:4px 8px;
           display:flex;align-items:center;gap:6px;">
    <span style="font-weight:700;color:${NAVY}">eCIgn</span>
    <span style="color:${ORANGE}">·</span>
    <span style="font-family:monospace">${esc(certId)}</span>
    <span style="color:${ORANGE}">·</span>
    <span>${esc(signer)}</span>
    <span style="color:${ORANGE}">·</span>
    <span>${esc(signedAt)}</span>
    <span style="color:${ORANGE}">·</span>
    <span style="font-family:monospace">hash ${esc(hashShort)}</span>
  </div>`;
}

interface AppendedPagesArgs {
  instance: FormInstanceRow;
  signatures: SignatureRow[];
  audit: AuditRow[];
  certId: string;
}

export function appendedPagesHtml(a: AppendedPagesArgs): string {
  const { instance, signatures, audit, certId } = a;
  const docHash = instance.document_hash ?? '';
  const chainHead = audit.length ? audit[audit.length - 1].hash : 'GENESIS';
  const latestSigAudit = [...audit].reverse().find((e) => e.action === 'signature.applied');
  const networkLocation = networkLocationFromAudit(latestSigAudit);
  const device = latestSigAudit && typeof latestSigAudit.network?.device === 'object' && latestSigAudit.network?.device
    ? latestSigAudit.network.device as Record<string, unknown>
    : {};
  const certBytes = Buffer.from(JSON.stringify({ instance, signatures }), 'utf8');
  const certHash = sha256(certBytes);
  const manifestHash = sha256(`${docHash}|${chainHead}|${certHash}`);

  const pageBreak = `<div style="page-break-before:always"></div>`;

  return `
${pageBreak}
<section class="ecign-appended" style="font-family:'Segoe UI',Arial,sans-serif;color:${INK};padding:24px">
  <header style="border-bottom:3px solid ${ORANGE};padding-bottom:14px;margin-bottom:18px">
    <div style="font-size:10px;letter-spacing:.14em;color:${ORANGE};font-weight:700;text-transform:uppercase">
      eCIgn · Internal Attestation Certificate</div>
    <h1 style="font-size:22px;color:${NAVY};margin:6px 0 0">${esc(instance.form_id)} — Certificate</h1>
  </header>
  <h2 style="font-size:11px;letter-spacing:.14em;color:${NAVY};text-transform:uppercase;margin-bottom:10px">System</h2>
  <div>CI-App / eCIgn — Cert ID <code>${esc(certId)}</code></div>
  <h2 style="font-size:11px;letter-spacing:.14em;color:${NAVY};text-transform:uppercase;margin:18px 0 10px">Document</h2>
  <div>${esc(instance.form_id)} · version <code>${esc(instance.document_version_id)}</code> ·
       instance <code>${esc(instance.instance_id)}</code></div>
  <h2 style="font-size:11px;letter-spacing:.14em;color:${NAVY};text-transform:uppercase;margin:18px 0 10px">Signatures</h2>
  ${signatures.map(s => `
    <div style="display:flex;gap:14px;align-items:center;border:1px solid ${BORDER};
         border-radius:6px;padding:10px;margin-bottom:8px">
      <img src="${s.signature_png}" alt="" style="height:48px;border:1px solid ${BORDER}"/>
      <div>
        <div style="font-weight:600">${esc(s.signer_name)} · ${esc(s.signer_role)}</div>
        <div style="font-size:11px;color:${MUTED}">${esc(s.signed_at_utc)}</div>
        <div style="font-size:10px;color:${MUTED};font-family:monospace">${esc(s.signature_id)} · ${esc(s.signature_hash.slice(0,16))}…</div>
      </div>
    </div>`).join('')}
  <h2 style="font-size:11px;letter-spacing:.14em;color:${NAVY};text-transform:uppercase;margin:18px 0 10px">Attestation</h2>
  <p style="font-style:italic;color:${MUTED}">"I agree to use an electronic signature, I have reviewed this document in full, and I intend to sign it."</p>
  <p>Confirmed at: <code>${esc(instance.attestation_confirmed_at)}</code></p>
</section>

${pageBreak}
<section style="font-family:'Segoe UI',Arial,sans-serif;color:${INK};padding:24px">
  <h1 style="font-size:18px;color:${NAVY};border-bottom:2px solid ${ORANGE};padding-bottom:6px">
    Identity &amp; Device Evidence</h1>
  ${signatures.map(s => `
    <div style="margin-top:12px">
      <h2 style="font-size:11px;letter-spacing:.14em;color:${NAVY};text-transform:uppercase">${esc(s.signer_name)}</h2>
      <table style="width:100%;font-size:11px;border-collapse:collapse">
        <tbody>
          <tr><td style="color:${MUTED};width:28%">User ID</td><td>${esc(s.signer_user_id)}</td></tr>
          <tr><td style="color:${MUTED}">Email</td><td>${esc(s.signer_email)}</td></tr>
          <tr><td style="color:${MUTED}">Signed at (UTC)</td><td>${esc(s.signed_at_utc)}</td></tr>
          <tr><td style="color:${MUTED}">IP Address</td><td>${esc(networkLocation.ip_address)}</td></tr>
          <tr><td style="color:${MUTED}">City</td><td>${esc(networkLocation.city)}</td></tr>
          <tr><td style="color:${MUTED}">Region</td><td>${esc(networkLocation.state_region)}</td></tr>
          <tr><td style="color:${MUTED}">Country</td><td>${esc(networkLocation.country)}</td></tr>
          <tr><td style="color:${MUTED}">Postal</td><td>${esc(networkLocation.postal)}</td></tr>
          <tr><td style="color:${MUTED}">Org / ISP</td><td>${esc(networkLocation.org_isp)}</td></tr>
          <tr><td style="color:${MUTED}">Source</td><td>${esc(networkLocation.source)}</td></tr>
          <tr><td style="color:${MUTED}">Captured At</td><td>${esc(networkLocation.captured_at)}</td></tr>
          <tr><td style="color:${MUTED}">Lookup Status</td><td>${esc(networkLocation.lookup_status)}</td></tr>
          <tr><td style="color:${MUTED}">Failure Reason</td><td>${esc(networkLocation.failure_reason || '—')}</td></tr>
          <tr><td style="color:${MUTED}">User Agent</td><td>${esc(networkLocation.user_agent)}</td></tr>
          <tr><td style="color:${MUTED}">Device Model</td><td>${esc(device.model ?? '')}</td></tr>
          <tr><td style="color:${MUTED}">Platform</td><td>${esc(device.platform ?? '')}</td></tr>
        </tbody>
      </table>
    </div>`).join('')}
</section>

${pageBreak}
<section style="font-family:'Segoe UI',Arial,sans-serif;color:${INK};padding:24px">
  <h1 style="font-size:18px;color:${NAVY};border-bottom:2px solid ${ORANGE};padding-bottom:6px">
    Audit Trail Timeline (${audit.length} events)</h1>
  <table style="width:100%;font-size:10px;border-collapse:collapse;margin-top:10px">
    <thead><tr style="background:#F7F7F7">
      <th style="text-align:left;padding:6px;border-bottom:1px solid ${BORDER}">#</th>
      <th style="text-align:left;padding:6px;border-bottom:1px solid ${BORDER}">UTC</th>
      <th style="text-align:left;padding:6px;border-bottom:1px solid ${BORDER}">Action</th>
      <th style="text-align:left;padding:6px;border-bottom:1px solid ${BORDER}">Actor</th>
      <th style="text-align:left;padding:6px;border-bottom:1px solid ${BORDER}">Hash</th>
    </tr></thead>
    <tbody>
      ${audit.map((e, i) => `<tr>
        <td style="padding:4px 6px">${i + 1}</td>
        <td style="padding:4px 6px;font-family:monospace">${esc(e.occurred_at_utc)}</td>
        <td style="padding:4px 6px">${esc(e.action)}</td>
        <td style="padding:4px 6px">${esc(e.actor.name)}</td>
        <td style="padding:4px 6px;font-family:monospace">${esc(e.hash.slice(0,16))}…</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <p style="margin-top:14px;font-size:10px;color:${MUTED}">Hash chain head: <code>${esc(chainHead)}</code></p>
</section>

${pageBreak}
<section style="font-family:'Segoe UI',Arial,sans-serif;color:${INK};padding:24px">
  <h1 style="font-size:18px;color:${NAVY};border-bottom:2px solid ${ORANGE};padding-bottom:6px">
    Document Integrity Manifest</h1>
  <table style="width:100%;font-size:11px;margin-top:14px">
    <tbody>
      <tr><td style="color:${MUTED};width:32%">Document hash (SHA-256)</td><td><code>${esc(docHash)}</code></td></tr>
      <tr><td style="color:${MUTED}">Audit chain head</td><td><code>${esc(chainHead)}</code></td></tr>
      <tr><td style="color:${MUTED}">Certificate hash</td><td><code>${esc(certHash)}</code></td></tr>
      <tr><td style="color:${MUTED};font-weight:700">Manifest hash</td><td><code>${esc(manifestHash)}</code></td></tr>
      <tr><td style="color:${MUTED}">Hash algorithm</td><td>SHA-256</td></tr>
      <tr><td style="color:${MUTED}">Verification</td><td>Recompute SHA-256 of document bytes; compare with document hash. Run POST /api/audit/verify-chain to verify the audit chain.</td></tr>
    </tbody>
  </table>
</section>`;
}

export async function buildSignedDocumentBundle(instanceId: string, certId: string) {
  const instance = await store.getInstance(instanceId);
  if (!instance) throw new Error('INSTANCE_NOT_FOUND');
  const signatures = await store.listSignatures(instanceId);
  const audit = await store.listAudit(instanceId);
  const signer = signatures[signatures.length - 1];
  const watermark = signer
    ? watermarkHtml(certId, signer.signer_name,
        new Date(signer.signed_at_utc).toLocaleString(),
        (instance.document_hash ?? '').slice(0, 12))
    : '';
  const appended = appendedPagesHtml({ instance, signatures, audit, certId });
  return { instance, watermark, appended };
}
