/**
 * buildSignerRosterHtml — Generates the Signer Roster page for multi-signer
 * eCIgn packets. This is always the last appended page (page N+4 per spec).
 *
 * Shows all required signer slots with their current status:
 *   - Signed entries: green indicator, signature image, timestamp, field_id
 *   - Pending entries: orange indicator, due date
 *   - Declined entries: crimson indicator, reason
 *
 * Includes the template integrity legal block at the bottom.
 */

export interface RosterSignerEntry {
  index: number;
  fieldId: string;
  role: string;
  name?: string;
  email?: string;
  status: 'signed' | 'pending' | 'overdue' | 'declined' | 'awaiting_group';
  signedAt?: string;
  signatureDataUrl?: string;
  dueDate?: string;
  declineReason?: string;
  sequenceGroup: number;
}

export interface RosterPageOptions {
  formId: string;
  formTitle: string;
  formVersion: string;
  formInstanceId: string;
  entries: RosterSignerEntry[];
  logoSrc?: string;
}

export function buildSignerRosterHtml(opts: RosterPageOptions): string {
  const { formId, formTitle, formVersion, formInstanceId, entries, logoSrc } = opts;

  const entryRows = entries.map(e => {
    const statusColor = e.status === 'signed' ? '#16a34a'
      : e.status === 'pending' ? '#ea580c'
      : e.status === 'overdue' ? '#dc2626'
      : e.status === 'declined' ? '#991b1b'
      : '#6b7280';

    const statusLabel = e.status === 'signed' ? `Signed ${e.signedAt ? new Date(e.signedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : ''}`
      : e.status === 'pending' ? `Pending${e.dueDate ? ' · Due ' + new Date(e.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}`
      : e.status === 'overdue' ? 'Overdue'
      : e.status === 'declined' ? `Declined: ${e.declineReason || 'No reason given'}`
      : `Awaiting Group ${e.sequenceGroup} completion`;

    const signatureBlock = e.status === 'signed' && e.signatureDataUrl
      ? `<img src="${e.signatureDataUrl}" alt="Signature" style="max-height:42px;max-width:180px;object-fit:contain;margin-top:4px;" />`
      : e.status === 'pending' || e.status === 'awaiting_group'
      ? '<div style="height:42px;border:1px dashed #d1d5db;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:10px;">Awaiting signature</div>'
      : '';

    const borderStyle = e.status === 'declined' ? 'border:1px dashed #991b1b;' : 'border:1px solid #e5e7eb;';

    return `
      <div style="${borderStyle}border-radius:6px;padding:12px 16px;margin-bottom:8px;background:#fafafa;">
        <div style="display:flex;align-items:flex-start;gap:16px;">
          <div style="flex:0 0 auto;min-width:24px;font-weight:700;font-size:14px;color:#1A3778;">${e.index}.</div>
          <div style="flex:1;">
            <div style="font-weight:600;font-size:13px;color:#1f2937;">${e.name || '(Unassigned)'}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:2px;">${e.role}${e.email ? ' · ' + e.email : ''}</div>
            <div style="font-size:10px;color:#9ca3af;margin-top:2px;">Field: <code style="font-family:monospace;background:#f3f4f6;padding:1px 4px;border-radius:2px;">${e.fieldId}</code> · Group ${e.sequenceGroup}</div>
            <div style="margin-top:6px;display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${statusColor};"></span>
              <span style="font-size:11px;font-weight:500;color:${statusColor};">${statusLabel}</span>
            </div>
          </div>
          <div style="flex:0 0 auto;width:200px;text-align:center;">
            ${signatureBlock}
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="ecign-page" style="page-break-before:always;padding:32px 24px;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid #1A3778;">
        ${logoSrc ? `<img src="${logoSrc}" alt="eCIgn" style="height:28px;" />` : ''}
        <div>
          <div style="font-size:16px;font-weight:700;color:#1A3778;letter-spacing:0.5px;">SIGNER ROSTER</div>
          <div style="font-size:10px;color:#6b7280;margin-top:2px;">Multi-Signature Ledger</div>
        </div>
      </div>

      <div style="margin-bottom:16px;padding:10px 14px;background:#f0f4ff;border:1px solid #c7d2fe;border-radius:6px;">
        <div style="font-size:11px;color:#1A3778;font-weight:600;">REQUIRED SIGNERS (${entries.length})</div>
        <div style="font-size:10px;color:#6b7280;margin-top:4px;">
          Form: ${formId} · ${formTitle} · Version ${formVersion}<br/>
          Instance: ${formInstanceId}
        </div>
      </div>

      ${entryRows}

      <div style="margin-top:24px;padding:14px 16px;background:#fefce8;border:1px solid #fde68a;border-radius:6px;font-size:10px;color:#92400e;line-height:1.6;">
        <div style="font-weight:700;font-size:11px;margin-bottom:6px;">TEMPLATE INTEGRITY STATEMENT</div>
        The form template above this packet is byte-identical to the unsigned template at
        <code style="font-family:monospace;background:#fef3c7;padding:1px 4px;border-radius:2px;">/forms/${formId}/print</code>
        for version v${formVersion}. Field values are user data and are recorded in the certificate hash,
        not in the template snapshot. Each signer's identity, signature image, timestamp, and device
        evidence are independently captured in the audit trail and certificate pages preceding this roster.
      </div>

      <div style="margin-top:16px;text-align:center;font-size:9px;color:#9ca3af;">
        Generated by eCIgn · Care Indeed Home Health Care, Inc. · ${new Date().toISOString()}
      </div>
    </section>
  `;
}
