import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { renderKeyValueRow, renderModulePage, renderPanel } from '../chrome';
import { renderDataTable, valueWithUnknown } from '../pagination';

export const renderSourceUtilizationModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const unknownPaths = new Set(payload.unknownPaths);
  const sourceRows = [
    ['Source census', String(payload.roll.census.patientsInScope), 'Census reconciliation and duplicate-client review'],
    ['QA-FM-026', String(valueWithUnknown(unknownPaths, 'incidents.total', payload.roll.incidents.total)), 'Incident / adverse-event summary'],
    ['QA-FM-027', String(valueWithUnknown(unknownPaths, 'infections.total', payload.roll.infections.total)), 'Infection-control line list'],
    ['Lab log', String(valueWithUnknown(unknownPaths, 'labs.criticalTotal', payload.roll.labs.criticalTotal)), 'Critical lab reporting review'],
    ['OASIS / CMS-485', String(payload.roll.census.activeCensus + payload.roll.census.recertDue), 'Chart-audit denominator context'],
  ];
  const bodyHtml = `
    ${renderPanel('Source provenance', `
      ${renderKeyValueRow('Source agency', payload.sourceAgency ?? 'Care Indeed Home Health')}
      ${renderKeyValueRow('Source dataset', payload.datasetId ?? '—')}
      ${renderKeyValueRow('Review quarter', payload.roll.window.quarterLabel)}
      ${renderKeyValueRow('Data-through date', payload.roll.window.dataThroughDate)}
    `)}
    ${renderPanel('Source, feeder-workflow, and form utilization analysis', renderDataTable({
      headers: ['Source / form', 'Recovered count', 'Use in packet'],
      rows: sourceRows,
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
