import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { renderModulePage, renderPanel } from '../chrome';
import { renderDataTable } from '../pagination';

export const renderExcludedSourceRegisterModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const rows = [
    [
      'Post-data-through incident records',
      String(payload.roll.incidents.excludedFutureDated),
      `Excluded from ${payload.roll.window.packetType} packet through ${payload.roll.window.dataThroughDate}`,
    ],
    [
      'Post-data-through infection records',
      String(payload.roll.infections.excludedFutureDated),
      `Excluded from ${payload.roll.window.packetType} packet through ${payload.roll.window.dataThroughDate}`,
    ],
    [
      'Duplicate client IDs',
      String(payload.roll.census.duplicateClientIds.length),
      payload.roll.census.duplicateClientIds.join(', ') || 'No duplicate IDs recovered',
    ],
  ];
  const bodyHtml = renderPanel('Superseded or excluded-source register', renderDataTable({
    headers: ['Excluded / superseded source group', 'Count', 'Basis'],
    rows,
  }));

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
