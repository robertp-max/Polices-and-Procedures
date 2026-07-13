import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { escapeHtml, renderKeyValueRow, renderModulePage, renderPanel, renderRawNotice } from '../chrome';

export const renderCoverModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const roll = payload.roll;
  const title = `${roll.window.packetType === 'interim' ? 'Interim ' : ''}${roll.window.quarterLabel} QAPI Committee Packet`;
  const bodyHtml = `
    ${payload.derivedNotice ? renderRawNotice(`<b>BRAD-DERIVED DRAFT — REQUIRES HUMAN REVIEW.</b> ${escapeHtml(payload.derivedNotice)}`, 'warning') : ''}
    ${renderPanel('Quarterly QAPI analytical report', `
      ${renderKeyValueRow('Packet ID', payload.packetId)}
      ${renderKeyValueRow('Reporting period', `${roll.window.quarterStart} → ${roll.window.quarterEnd}`)}
      ${renderKeyValueRow('Data-through date', roll.window.dataThroughDate)}
      ${renderKeyValueRow('Packet type', roll.window.packetType.toUpperCase())}
      ${renderKeyValueRow('Policy refs', payload.policyIds.join(', '))}
    `)}
    ${renderPanel('Scope statement', `
      <p class="p">This packet is the model-driven ${roll.window.quarterLabel} QAPI analytical report. It preserves source-recovered values, validation findings, addendum references, and signature readiness without converting missing source evidence to compliant values.</p>
    `)}
  `;

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: `${payload.packetId} · ${roll.window.quarterLabel}`,
    title,
    eyebrow: 'Care Indeed Home Health Care, Inc.',
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 1, text: title }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    syntheticDetail: payload.syntheticWatermark,
  });
};
