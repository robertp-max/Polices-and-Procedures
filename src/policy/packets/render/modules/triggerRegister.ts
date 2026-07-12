import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { renderModulePage, renderPanel } from '../chrome';
import { renderDataTable, UNKNOWN_SOURCE_NOT_RECOVERED } from '../pagination';

export const renderTriggerRegisterModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const unknownPaths = new Set(payload.unknownPaths);
  const triggerRows = [
    [
      'High-risk patient flag rollup',
      payload.roll.highRisk.qapiRequiredCases > 0 ? 'Triggered' : 'No trigger recovered',
      'QAPI committee review',
      'High-risk rollup',
    ],
    [
      'Immediate-action high-risk flags',
      payload.roll.highRisk.immediateActionCases > 0 ? 'Triggered' : 'No trigger recovered',
      'Clinical leadership escalation',
      'high_risk_flags',
    ],
    [
      'Open RCA count',
      triggerState(unknownPaths, 'incidents.openRca', payload.roll.incidents.openRca),
      'RCA completion workflow',
      'QA-FM-026',
    ],
    [
      'Unreported critical labs',
      triggerState(unknownPaths, 'labs.criticalUnreported', payload.roll.labs.criticalUnreported),
      'PIP/CAP and physician-notification audit',
      'Lab log',
    ],
    [
      'Confidential personnel-review addendum',
      payload.addendumRequired ? 'Triggered' : 'No trigger recovered',
      'Restricted personnel-review workflow',
      payload.ref.addendumId,
    ],
  ];
  const bodyHtml = renderPanel('Triggered Workflow and Dependency Register', renderDataTable({
    headers: ['Trigger', 'State', 'Dependency / workflow', 'Source'],
    rows: triggerRows,
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

function triggerState(unknownPaths: ReadonlySet<string>, path: string, count: number): string {
  if (unknownPaths.has(path)) {
    return UNKNOWN_SOURCE_NOT_RECOVERED;
  }
  return count > 0 ? 'Triggered' : 'No trigger recovered';
}
