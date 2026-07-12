import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { renderKeyValueRow, renderModulePage, renderPanel } from '../chrome';
import { renderDataTable, UNKNOWN_SOURCE_NOT_RECOVERED } from '../pagination';

export const renderDerivationAppendixModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const unknownRows = payload.unknownPaths.map((path) => [
    path,
    UNKNOWN_SOURCE_NOT_RECOVERED,
    'Rendered explicitly instead of a false zero / OK / compliant value',
  ]);
  const bodyHtml = `
    ${renderPanel('Source derivation, reconciliation, and evidence provenance', `
      ${renderKeyValueRow('Packet ID', payload.packetId)}
      ${renderKeyValueRow('Source agency', payload.sourceAgency ?? 'Care Indeed Home Health')}
      ${renderKeyValueRow('Dataset ID', payload.datasetId ?? '—')}
      ${renderKeyValueRow('Derived notice', payload.derivedNotice ?? 'No derived-source notice supplied')}
      ${renderKeyValueRow('Content hash', context.module.contentHash ?? 'Not sealed')}
    `)}
    ${renderPanel('Unrecovered source paths', renderDataTable({
      headers: ['Path', 'Rendered value', 'Reason'],
      rows: unknownRows,
      emptyText: 'No unrecovered source paths were supplied.',
    }))}
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
