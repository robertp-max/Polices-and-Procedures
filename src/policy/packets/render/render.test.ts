import { describe, expect, it } from 'vitest';

import type { AddendumReference } from '@/policy/qapi/personnelActionAddendum';
import type { QapiRollup } from '@/policy/qapi/qapiExtraction';
import { renderQapiPacketHtmlFromRollup } from '@/policy/qapi/renderQapiPacket';

describe('model-driven packet renderer', () => {
  it('preserves unrecovered source values, synthetic watermark, and lock banner', () => {
    const html = renderQapiPacketHtmlFromRollup(baseRollup(), baseReference(), {
      unknownPaths: ['incidents.total', 'labs.criticalUnreported'],
      syntheticWatermark: 'SYNTHETIC / UAT ONLY — outside agency mock data, not real PHI',
      sourceAgency: 'Outside Mock Agency',
      datasetId: 'QAPI-Q2-DS-001',
      approvers: [{ role: 'DON', name: 'Dakota Director', authorityConfirmed: true }],
    });

    expect(html).toContain('UNKNOWN — SOURCE NOT RECOVERED');
    expect(html).toContain('SYNTHETIC UAT DATA — NO REAL PHI — NOT FOR PRODUCTION');
    expect(html).toContain('SYNTHETIC / UAT ONLY — outside agency mock data, not real PHI');
    expect(html).toContain('NOT LOCKABLE — 1 blocking item(s)');
  });

  it('renders analysis modules before supporting form pages', () => {
    const html = renderQapiPacketHtmlFromRollup(baseRollup(), baseReference(), {
      approvers: [{ role: 'DON', name: 'Dakota Director', authorityConfirmed: true }],
    });

    const dashboardIndex = html.indexOf('data-module-id="qapi-rich-kpi-dashboard"');
    const formsIndex = html.indexOf('data-module-id="qapi-completed-source-forms"');
    expect(dashboardIndex).toBeGreaterThan(-1);
    expect(formsIndex).toBeGreaterThan(-1);
    expect(dashboardIndex).toBeLessThan(formsIndex);
  });
});

function baseRollup(): QapiRollup {
  return {
    window: {
      eventDate: '2026-07-10',
      quarterStart: '2026-04-01',
      quarterEnd: '2026-06-30',
      dataThroughDate: '2026-06-30',
      packetType: 'final',
      title: 'Q2 2026 QAPI Review (Final)',
      quarterLabel: 'Q2 2026',
    },
    census: {
      patientsInScope: 12,
      activeCensus: 9,
      discharged: 2,
      recertDue: 3,
      highAcuity: 4,
      uniquePatients: 11,
      duplicateClientIds: ['PT-002'],
    },
    highRisk: {
      immediateActionCases: 1,
      qapiRequiredCases: 2,
      topFlags: [{ flag: 'fall_with_injury', count: 1 }],
      systemicThemes: [],
    },
    incidents: {
      total: 2,
      byCategory: { fall: 1, medication: 1 },
      openRca: 1,
      unreported: 0,
      excludedFutureDated: 0,
    },
    infections: {
      total: 1,
      healthcareAssociated: 1,
      communityAcquired: 0,
      unreportedToState: 0,
      excludedFutureDated: 0,
    },
    labs: {
      criticalTotal: 1,
      criticalUnreported: 1,
    },
    documentation: {
      oasisLateSoc: 1,
      pocMissingF2F: 1,
      pocUnsignedOrMissingSignature: 0,
      homeboundNotJustified: 1,
      medReconMismatch: 0,
      pressureInjuryNoWoundOrders: 0,
      therapyNeedNoOrder: 0,
    },
    exceptions: [{
      pass: false,
      severity: 'blocker',
      path: 'labs',
      reason: 'Critical lab value not reported to physician within policy.',
      remediation: 'Complete physician-notification audit before lock.',
    }],
  };
}

function baseReference(): AddendumReference {
  return {
    addendumId: 'QAPI-HR-ADDENDUM-2026-Q2',
    hash: 'hash-001',
    personnelActionReviewsOpened: 1,
    countByCategory: { unreported_critical_labs: 1 },
    statusSummary: 'Confidential personnel action review opened.',
    confidentialityStatement: 'Confidential personnel details retained under restricted access.',
  };
}
