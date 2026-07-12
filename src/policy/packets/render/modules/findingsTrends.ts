import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { renderKeyValueRow, renderModulePage, renderPanel } from '../chrome';
import { renderDataTable, valueWithUnknown } from '../pagination';

export const renderFindingsTrendsModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const unknownPaths = new Set(payload.unknownPaths);
  const incidentRows = Object.entries(payload.roll.incidents.byCategory).map(([category, count]) => [category, String(count)]);
  const exceptionRows = payload.roll.exceptions.slice(0, 10).map((finding) => [
    finding.severity,
    finding.path,
    finding.reason,
    finding.remediation,
  ]);
  const bodyHtml = `
    ${renderPanel('Incident / Adverse-Event Summary (QA-FM-026)', `
      ${renderDataTable({
        headers: ['Category', 'Count'],
        rows: incidentRows,
        emptyText: 'None in window',
      })}
      ${renderKeyValueRow('Total in window', valueWithUnknown(unknownPaths, 'incidents.total', payload.roll.incidents.total))}
      ${renderKeyValueRow('Open RCAs', valueWithUnknown(unknownPaths, 'incidents.openRca', payload.roll.incidents.openRca))}
      ${renderKeyValueRow('Unreported', valueWithUnknown(unknownPaths, 'incidents.unreported', payload.roll.incidents.unreported))}
    `)}
    ${renderPanel('Infection Control (QA-FM-027)', `
      ${renderKeyValueRow('Cases in window', valueWithUnknown(unknownPaths, 'infections.total', payload.roll.infections.total))}
      ${renderKeyValueRow('Healthcare-associated', valueWithUnknown(unknownPaths, 'infections.healthcareAssociated', payload.roll.infections.healthcareAssociated))}
      ${renderKeyValueRow('Community-acquired', valueWithUnknown(unknownPaths, 'infections.communityAcquired', payload.roll.infections.communityAcquired))}
      ${renderKeyValueRow('Unreported to state', valueWithUnknown(unknownPaths, 'infections.unreportedToState', payload.roll.infections.unreportedToState))}
    `)}
    ${renderPanel('Chart Audit & Documentation Integrity (QA-FM-025)', `
      <p class="p">Chart audit denominator tied to active census (${payload.roll.census.activeCensus}) + recerts due (${payload.roll.census.recertDue}). Findings below are derived from OASIS/POC document review.</p>
      ${renderKeyValueRow('OASIS SOC not completed ≤5 days', valueWithUnknown(unknownPaths, 'documentation.oasisLateSoc', payload.roll.documentation.oasisLateSoc))}
      ${renderKeyValueRow('POC missing face-to-face encounter', valueWithUnknown(unknownPaths, 'documentation.pocMissingF2F', payload.roll.documentation.pocMissingF2F))}
      ${renderKeyValueRow('POC unsigned / pending physician signature', valueWithUnknown(unknownPaths, 'documentation.pocUnsigned', payload.roll.documentation.pocUnsignedOrMissingSignature))}
      ${renderKeyValueRow('Homebound not justified', valueWithUnknown(unknownPaths, 'documentation.homeboundNotJustified', payload.roll.documentation.homeboundNotJustified))}
      ${renderKeyValueRow('Med-reconciliation count mismatch (OASIS↔POC)', valueWithUnknown(unknownPaths, 'documentation.medReconMismatch', payload.roll.documentation.medReconMismatch))}
      ${renderKeyValueRow('Pressure injury present, no wound orders', valueWithUnknown(unknownPaths, 'documentation.pressureInjury', payload.roll.documentation.pressureInjuryNoWoundOrders))}
      ${renderKeyValueRow('OASIS high mobility need, no therapy ordered', valueWithUnknown(unknownPaths, 'documentation.therapyNeed', payload.roll.documentation.therapyNeedNoOrder))}
    `)}
    ${renderPanel('Source-data exceptions', renderDataTable({
      headers: ['Severity', 'Path', 'Reason', 'Remediation'],
      rows: exceptionRows,
      emptyText: 'No source-data exceptions recovered.',
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
