import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer, ModuleRenderContext, ModuleRenderResult } from '../moduleRendererRegistry';
import { renderModulePage, renderPanel } from '../chrome';
import { renderDataTable, shouldBeginOnNewPage } from '../pagination';

export const renderCompletedSourceFormsModule: ModuleRenderer = (context) => renderFormModule(context, {
  title: 'Completed source forms',
  rows: [
    ['QA-FM-020', 'QAPI Data Dashboard', 'Recovered dashboard values rendered in Part I', 'Not labeled complete by renderer'],
    ['QA-FM-025', 'Chart Audit & Documentation Integrity', 'Recovered OASIS/POC findings rendered in Part I', 'Not labeled complete by renderer'],
    ['QA-FM-026', 'Incident / Adverse-Event Summary', 'Recovered incident counts rendered in Part I', 'Not labeled complete by renderer'],
    ['QA-FM-027', 'Infection Control line list', 'Recovered infection counts rendered in Part I', 'Not labeled complete by renderer'],
  ],
});

export const renderGeneratedPipCapRcaFormsModule: ModuleRenderer = (context) => renderFormModule(context, {
  title: 'Generated PIP/CAP/RCA/corrective-action forms',
  rows: [
    ['PIP/CAP candidate', 'Critical lab or high-risk trigger', 'Generated only after committee decision', 'Pending committee decision'],
    ['RCA follow-up', 'Open RCA count', 'Generated when RCA remains open', 'Pending owner assignment'],
    ['Corrective action', 'Source-data exception or documentation finding', 'Generated after validation review', 'Pending validation review'],
  ],
});

export const renderTriggeredWorkflowExecutionPackagesModule: ModuleRenderer = (context) => renderFormModule(context, {
  title: 'Triggered workflow execution packages',
  rows: [
    ['Clinical escalation', 'Immediate-action high-risk cases', 'Workflow package reference', 'Pending evidence package'],
    ['Restricted personnel-review workflow', 'Confidential personnel-review addendum reference', 'Restricted package reference', 'Restricted access'],
    ['Physician-notification audit', 'Critical lab reporting gap', 'Workflow package reference', 'Pending evidence package'],
  ],
});

function renderFormModule(
  context: ModuleRenderContext,
  args: { title: string; rows: readonly (readonly string[])[] },
): ModuleRenderResult {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const bodyHtml = renderPanel(args.title, renderDataTable({
    headers: ['Form / package', 'Trigger basis', 'Rendered use', 'Completion status'],
    rows: args.rows,
  }));

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: payload.packetId,
    title: args.title,
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 2, text: args.title }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    beginOnNewPage: shouldBeginOnNewPage(context.module.moduleId, context.profile),
    syntheticDetail: payload.syntheticWatermark,
  });
}
