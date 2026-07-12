import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { renderModulePage, renderPanel } from '../chrome';
import { renderDataTable, valueWithUnknown } from '../pagination';

export const renderActionRegisterModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const unknownPaths = new Set(payload.unknownPaths);
  const rows = [
    [
      'Resolve source-data exceptions',
      payload.roll.exceptions.length ? `${payload.roll.exceptions.length} finding(s)` : 'No recovered source exception',
      'QAPI Lead',
      'Before final lock',
    ],
    [
      'Close open RCAs',
      `${payload.roll.incidents.openRca} open RCA(s)`,
      'Clinical Manager',
      'Committee-assigned due date',
    ],
    [
      'Review critical lab reporting',
      `${valueWithUnknown(unknownPaths, 'labs.criticalUnreported', payload.roll.labs.criticalUnreported)} unreported critical lab(s)`,
      'DON / Compliance Officer',
      'Before certification review',
    ],
    [
      'Confirm eCIgn approver authority',
      payload.approvers.length ? `${payload.approvers.length} approver role(s)` : 'No approver roster supplied',
      'Administrator',
      'Before signature routing',
    ],
  ];
  const bodyHtml = renderPanel('Action-item, workflow, and accountability register', renderDataTable({
    headers: ['Action item', 'Source-recovered basis', 'Owner capacity', 'Deadline basis'],
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
