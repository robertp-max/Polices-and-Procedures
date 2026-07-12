import type { QapiPacketRenderPayload } from '@/policy/qapi/renderQapiPacket';

import type { ModuleRenderer } from '../moduleRendererRegistry';
import { escapeHtml, renderModulePage, renderPanel } from '../chrome';
import { renderDataTable, statusWithUnknown, valueWithUnknown } from '../pagination';

export const renderKpiDashboardModule: ModuleRenderer = (context) => {
  const payload = context.module.payload as QapiPacketRenderPayload;
  const census = payload.roll.census;
  const unknownPaths = new Set(payload.unknownPaths);
  const denominator = census.activeCensus || census.uniquePatients || census.patientsInScope;
  const rows: Array<[string, string | number, string | number, string, string]> = [
    ['Patients in scope', census.patientsInScope, census.patientsInScope, '—', 'Source census'],
    [
      'Unique patients (de-duped)',
      census.uniquePatients,
      census.patientsInScope,
      census.duplicateClientIds.length ? `${census.duplicateClientIds.length} duplicate ID(s) flagged` : 'clean',
      'Census reconciliation',
    ],
    ['Active census', census.activeCensus, census.patientsInScope, '—', 'admission_status'],
    ['Recerts due', census.recertDue, denominator, '—', 'admission_status'],
    ['High-risk cases (QAPI-required)', payload.roll.highRisk.qapiRequiredCases, census.patientsInScope, '—', 'high_risk_flags'],
    [
      'Immediate-action cases',
      payload.roll.highRisk.immediateActionCases,
      census.patientsInScope,
      payload.roll.highRisk.immediateActionCases ? 'escalate' : 'none',
      'high_risk_flags',
    ],
    [
      'Incidents (in window)',
      valueWithUnknown(unknownPaths, 'incidents.total', payload.roll.incidents.total),
      census.patientsInScope,
      `${valueWithUnknown(unknownPaths, 'incidents.openRca', payload.roll.incidents.openRca)} open RCA`,
      'QA-FM-026',
    ],
    [
      'Infections (in window)',
      valueWithUnknown(unknownPaths, 'infections.total', payload.roll.infections.total),
      census.patientsInScope,
      `rate context: HCA ${valueWithUnknown(unknownPaths, 'infections.healthcareAssociated', payload.roll.infections.healthcareAssociated)}`,
      'QA-FM-027',
    ],
    [
      'Critical labs unreported',
      valueWithUnknown(unknownPaths, 'labs.criticalUnreported', payload.roll.labs.criticalUnreported),
      valueWithUnknown(unknownPaths, 'labs.criticalTotal', payload.roll.labs.criticalTotal),
      statusWithUnknown(
        unknownPaths,
        'labs.criticalUnreported',
        payload.roll.labs.criticalUnreported ? 'PIP candidate' : 'ok',
      ),
      'Lab log',
    ],
  ];
  const bodyHtml = `
    ${renderPanel('Rich KPI dashboard', `
      ${renderDataTable({
        headers: ['Indicator', 'Numerator', 'Denominator', 'Result vs Target', 'Source'],
        rows,
      })}
      <p class="muted">Chart visuals are intentionally deferred to WP-4.6; this placeholder preserves the accessible table behind each KPI.</p>
      ${payload.roll.window.packetType === 'interim'
        ? `<p class="muted">Excluded as post-${escapeHtml(payload.roll.window.dataThroughDate)}: ${payload.roll.incidents.excludedFutureDated} incident(s), ${payload.roll.infections.excludedFutureDated} infection(s).</p>`
        : ''}
    `)}
  `;

  return renderModulePage({
    model: context.model,
    module: context.module,
    profile: context.profile,
    pageNumber: context.pageNumber,
    totalPages: context.totalPages,
    banner: payload.packetId,
    title: 'QAPI Data Dashboard (QA-FM-020)',
    bodyHtml,
    contentBlocks: [{ kind: 'heading', level: 2, text: 'Rich KPI dashboard' }],
    lockStatusText: payload.lock.statusText,
    lockPassed: payload.lock.pass,
    syntheticDetail: payload.syntheticWatermark,
  });
};
