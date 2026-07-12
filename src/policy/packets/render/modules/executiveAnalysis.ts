import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { renderKeyValueRow, renderModulePage, renderPanel } from '../chrome';
import { renderDataTable } from '../pagination';

export const renderExecutiveAnalysisModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const expected = payload.attendeesExpected;
  const present = payload.attendeesPresent;
  const quorum = payload.quorumOverride
    ?? `${present.length} of ${expected.length} present — ${present.length >= Math.ceil(expected.length / 2) ? 'quorum met' : 'NO QUORUM'}`;
  const attendeeRows = payload.attendanceNote
    ? [[payload.attendanceNote, 'Recovered source note', 'Requires confirmation against source']]
    : expected.map((role) => [role, 'Expected', present.includes(role) ? 'Present' : 'Not recorded']);
  const bodyHtml = `
    ${renderPanel('Meeting', `
      ${renderKeyValueRow('Date', payload.roll.window.eventDate)}
      ${renderKeyValueRow('Chair', payload.chair)}
      ${renderKeyValueRow('Recorder', payload.recorder)}
      ${renderKeyValueRow('Quorum', quorum)}
    `)}
    ${renderPanel('Attendees', renderDataTable({
      headers: ['Role or source note', 'Expected', 'Presence'],
      rows: attendeeRows,
    }))}
    ${renderPanel('Executive analysis', `
      <p class="p">QAPI review covers census reconciliation, high-risk patient flags, incidents, infection-control counts, critical laboratory reporting, chart-audit findings, triggered workflow determinations, committee decisions, and lock readiness for ${payload.roll.window.quarterLabel}.</p>
    `)}
  `;

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: payload.packetId,
    title: 'Agenda & Quorum Roster',
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 2, text: 'Agenda & Quorum Roster' }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    syntheticDetail: payload.syntheticWatermark,
  });
};
