import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { escapeHtml, renderKeyValueRow, renderModulePage, renderPanel } from '../chrome';
import { renderDataTable } from '../pagination';

export const renderAttachmentManifestModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const isConfidentialReference = context.module.moduleId === 'qapi-confidential-personnel-review-addendum-reference';
  const bodyHtml = isConfidentialReference
    ? renderConfidentialAddendumReference(payload)
    : renderManifest(payload);

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: payload.packetId,
    title: isConfidentialReference ? 'Confidential personnel-review addendum reference' : context.module.title,
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 2, text: context.module.title }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    syntheticDetail: payload.syntheticWatermark,
  });
};

function renderManifest(payload: QapiPacketRenderPayload): string {
  const rows = [
    ['QA-FM-020', 'QAPI Data Dashboard', 'Part I dashboard table', 'Main packet'],
    ['QA-FM-026', 'Incident / Adverse-Event Summary', 'Incident findings and RCA counts', 'Main packet'],
    ['QA-FM-027', 'Infection Control line list', 'Infection findings', 'Main packet'],
    ['QA-FM-025', 'Chart Audit & Documentation Integrity', 'Documentation findings', 'Main packet'],
    [
      payload.ref.addendumId,
      'Confidential Personnel Action Addendum — REFERENCE ONLY',
      payload.addendumRequired ? 'Restricted reference generated' : 'Not required by recovered triggers',
      'Confidential addendum',
    ],
  ];
  return renderPanel('Attachment manifest', renderDataTable({
    headers: ['Artifact ID', 'Title', 'Packet use', 'Placement'],
    rows,
  }));
}

function renderConfidentialAddendumReference(payload: QapiPacketRenderPayload): string {
  return renderPanel('Confidential Personnel Action Addendum — REFERENCE ONLY', `
    ${renderKeyValueRow('Addendum ID', payload.ref.addendumId)}
    ${renderKeyValueRow('Content hash', payload.ref.hash)}
    ${renderKeyValueRow('Reviews opened', payload.ref.personnelActionReviewsOpened)}
    ${renderKeyValueRow('By category', Object.entries(payload.ref.countByCategory).map(([category, count]) => `${category}:${count}`).join(' · ') || 'none')}
    <p class="p"><b>${escapeHtml(payload.ref.statusSummary)}</b></p>
    <div class="notice notice-blocker">${escapeHtml(payload.ref.confidentialityStatement)}</div>
  `, 'seal');
}
