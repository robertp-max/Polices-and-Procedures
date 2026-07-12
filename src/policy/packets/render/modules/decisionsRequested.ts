import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { renderKeyValueRow, renderModulePage, renderPanel } from '../chrome';
import { renderList } from '../pagination';

export const renderDecisionsRequestedModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const decisionItems = [
    `Ratify the ${payload.roll.window.quarterLabel} QAPI report (${payload.roll.window.packetType}).`,
    'Approve new PIP candidates flagged by the dashboard.',
    'Assign owners and due dates for open RCA, source-exception, and documentation-integrity actions.',
    ...(payload.addendumRequired
      ? ['Acknowledge the confidential personnel-action addendum (restricted access).']
      : []),
  ];
  const bodyHtml = `
    ${renderPanel('Decisions requested', renderList(decisionItems))}
    ${renderPanel('Governing Body packet summary', `
      ${renderKeyValueRow('Packet ID', payload.packetId)}
      ${renderKeyValueRow('Committee packet type', payload.roll.window.packetType.toUpperCase())}
      ${renderKeyValueRow('QAPI-required high-risk cases', payload.roll.highRisk.qapiRequiredCases)}
      ${renderKeyValueRow('Open source exceptions', payload.roll.exceptions.length)}
      ${renderKeyValueRow('Confidential addendum reference', payload.addendumRequired ? payload.ref.addendumId : 'Not required by recovered source triggers')}
    `)}
  `;

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: payload.packetId,
    title: 'Governing Body Summary & Confidential Addendum Reference',
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 2, text: context.module.title }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    syntheticDetail: payload.syntheticWatermark,
  });
};
