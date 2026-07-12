import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { renderKeyValueRow, renderModulePage, renderPanel } from '../chrome';
import { renderDataTable, renderList, UNKNOWN_SOURCE_NOT_RECOVERED } from '../pagination';

export const renderDeterminationsModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const unknownPaths = new Set(payload.unknownPaths);
  const flagRows = payload.roll.highRisk.topFlags.map((flag) => [flag.flag.replace(/_/g, ' '), String(flag.count)]);
  const determinations = [
    payload.roll.highRisk.immediateActionCases > 0
      ? 'Immediate-action high-risk cases require committee disposition and owner assignment.'
      : 'No immediate-action high-risk cases were recovered from the source rollup.',
    unknownPaths.has('labs.criticalUnreported')
      ? `Critical lab reporting gap is ${UNKNOWN_SOURCE_NOT_RECOVERED}.`
      : payload.roll.labs.criticalUnreported > 0
      ? 'Critical lab reporting gap is a PIP candidate and source-exception blocker.'
      : 'Critical lab reporting did not produce a source-recovered PIP candidate.',
    payload.addendumRequired
      ? 'Confidential personnel-review addendum reference must remain restricted and outside the main packet body.'
      : 'No confidential personnel-review addendum was required by recovered trigger counts.',
  ];
  const bodyHtml = `
    ${renderPanel('Top recurring high-risk flags', renderDataTable({
      headers: ['Flag', 'Count'],
      rows: flagRows,
      emptyText: 'None',
    }))}
    ${renderPanel('Systemic themes', payload.roll.highRisk.systemicThemes.length
      ? renderList(payload.roll.highRisk.systemicThemes)
      : '<p class="muted">No single flag reached the systemic threshold (≥5).</p>'
    )}
    ${renderPanel('PIP, CAP, RCA, personnel-review, and other action determinations', `
      ${renderList(determinations)}
      ${renderKeyValueRow('Immediate-action cases', payload.roll.highRisk.immediateActionCases)}
      ${renderKeyValueRow('QAPI-required cases', payload.roll.highRisk.qapiRequiredCases)}
    `)}
  `;

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: payload.packetId,
    title: 'High-Risk Patient Rollup',
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 2, text: context.module.title }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    syntheticDetail: payload.syntheticWatermark,
  });
};
