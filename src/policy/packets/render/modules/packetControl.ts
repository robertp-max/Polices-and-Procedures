import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { escapeHtml, renderKeyValueRow, renderModulePage, renderPanel } from '../chrome';
import { renderDataTable } from '../pagination';

export const renderPacketControlModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const lockFindings = payload.lock.findings.slice(0, 8).map((finding) => [
    finding.severity,
    finding.path,
    finding.reason,
    finding.remediation,
  ]);
  const bodyHtml = `
    ${renderPanel('Packet Control', `
      ${payload.sourceAgency ? renderKeyValueRow('Source agency', payload.sourceAgency) : ''}
      ${payload.datasetId ? renderKeyValueRow('Source dataset', payload.datasetId) : ''}
      ${renderKeyValueRow('Packet ID', payload.packetId)}
      ${renderKeyValueRow('Event ID', payload.eventId)}
      ${renderKeyValueRow('Workflow ID', payload.workflowId)}
      ${renderKeyValueRow('Reporting period', `${payload.roll.window.quarterStart} → ${payload.roll.window.quarterEnd}`)}
      ${renderKeyValueRow('Data-through date', payload.roll.window.dataThroughDate)}
      ${renderKeyValueRow('Packet readiness', payload.lock.pass ? 'FINAL / LOCKABLE' : 'DRAFT / REQUIRES REVIEW')}
      ${renderKeyValueRow('Policy refs', payload.policyIds.join(', '))}
      ${renderKeyValueRow('Prepared by', payload.preparedBy)}
      ${renderKeyValueRow('Reviewer', payload.reviewer)}
      ${renderKeyValueRow('Lock status', 'UNLOCKED (draft)')}
    `)}
    ${renderPanel('Validation', `
      <p class="p"><b>${escapeHtml(payload.lock.statusText)}</b></p>
      ${renderDataTable({
        headers: ['Severity', 'Path', 'Finding', 'Remediation'],
        rows: lockFindings,
        emptyText: payload.lock.pass ? 'No blocking validation findings.' : 'Packet is not lockable; validation findings are required.',
      })}
    `)}
    ${payload.roll.window.packetType === 'interim'
      ? `<div class="notice notice-warning"><b>INTERIM REVIEW.</b> Data is reported only through <b>${escapeHtml(payload.roll.window.dataThroughDate)}</b> (the meeting date). Source events after this date are excluded and will appear in the final ${escapeHtml(payload.roll.window.quarterLabel)} packet.</div>`
      : ''}
  `;

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: payload.packetId,
    title: context.module.title,
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 2, text: context.module.title }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    syntheticDetail: payload.syntheticWatermark,
  });
};
