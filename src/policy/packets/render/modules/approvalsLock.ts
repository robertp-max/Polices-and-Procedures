import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { escapeHtml, renderModulePage, renderPanel } from '../chrome';
import { renderDataTable } from '../pagination';

export const renderApprovalsLockModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const roles = payload.approvers.length
    ? payload.approvers
    : [
        { role: 'Director of Nursing (DON)' },
        { role: 'Administrator' },
        { role: 'Compliance Officer' },
        { role: 'Governing Body Chair' },
      ];
  const signatureHtml = roles.map((approver) => `
    <div class="signature-block">
      <div class="signature-line"></div>
      <div class="signature-role">${escapeHtml(approver.role)}</div>
      <div class="muted">${
        approver.name
          ? `Source sign-off: ${escapeHtml(approver.name)}${approver.date ? ` — ${escapeHtml(approver.date)}` : ''}; eCIgn capture pending`
          : 'Signature / printed name / date — pending eCIgn'
      }</div>
    </div>
  `).join('');
  const findingRows = payload.lock.findings.map((finding) => [
    finding.severity,
    finding.path,
    finding.reason,
    finding.remediation,
  ]);
  const bodyHtml = `
    ${renderPanel('Approvals, eCIgn status, and lock-readiness certification', `
      <p class="p">Signatures are captured via eCIgn and bound to a signer record (id, role, authority basis, timestamp, evidence hash). Blank lines below are NOT a substitute for a signature — an unsigned line is unapproved.</p>
      ${signatureHtml}
    `)}
    ${renderPanel('Lock validation findings', renderDataTable({
      headers: ['Severity', 'Path', 'Finding', 'Remediation'],
      rows: findingRows,
      emptyText: payload.lock.pass ? 'No blocking validation findings.' : 'Packet is not lockable; validation findings are required.',
    }))}
  `;

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: payload.packetId,
    title: 'Approval & Signatures',
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 2, text: context.module.title }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    syntheticDetail: payload.syntheticWatermark,
  });
};
