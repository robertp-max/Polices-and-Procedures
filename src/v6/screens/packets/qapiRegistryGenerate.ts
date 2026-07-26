/**
 * Packet Studio integration helper — generate QAPI from registries
 *
 * Wire into PacketStudioScreen:
 *   import { tryGenerateQapiFromRegistries } from './qapiRegistryGenerate';
 *
 * On "Generate" for QAPI quarterly:
 *   const result = await tryGenerateQapiFromRegistries({ store, periodId, agencyId, start, end });
 *   if (result.status === 'ready') use result.model
 *   if (result.status === 'needs_ingest') show result.blocking + ingest CTA
 *   if (result.status === 'blocked') show result.blocking
 *
 * Target: src/v6/screens/packets/qapiRegistryGenerate.ts
 */

import type { QapiRegistryStore } from '../../../policy/packets/qapi/ingest/ingestQapiDump';
import { loadPeriodRegistries } from '../../../policy/packets/qapi/ingest/ingestQapiDump';
import { buildModelFromRegistries, type QapiModelFromRegistries } from './generateFromRegistries';
import { evaluateComplaintLockGate } from '../../../policy/packets/qapi/validation/complaintLockGates';
import type { QapiPeriodRegistries } from '../../../policy/packets/qapi/registries/qapiRegistries';

export type RegistryGenerateResult =
  | {
      status: 'ready';
      model: QapiModelFromRegistries;
      registries: QapiPeriodRegistries;
      complaintGate: { total: number; verified_zero: boolean };
    }
  | {
      status: 'needs_ingest' | 'blocked';
      registries: QapiPeriodRegistries;
      blocking: string[];
      model: QapiModelFromRegistries;
    };

export async function tryGenerateQapiFromRegistries(opts: {
  store: QapiRegistryStore;
  periodId: string;
  agencyId: string;
  periodStart: string;
  periodEnd: string;
}): Promise<RegistryGenerateResult> {
  const registries = await loadPeriodRegistries(
    opts.store,
    opts.periodId,
    opts.agencyId,
    opts.periodStart,
    opts.periodEnd
  );

  const model = buildModelFromRegistries(registries);
  const complaintGate = evaluateComplaintLockGate(registries);

  const blocking = [
    ...registries.completeness.blocking_findings,
    ...(complaintGate.ok ? [] : complaintGate.blocking),
  ];

  // de-dupe messages
  const uniqueBlocking = [...new Set(blocking)];

  if (uniqueBlocking.length === 0 && model.readiness === 'READY_TO_GENERATE') {
    return {
      status: 'ready',
      model,
      registries,
      complaintGate: {
        total: complaintGate.total,
        verified_zero: complaintGate.verified_zero,
      },
    };
  }

  const needsIngest =
    registries.feeder_audits.length === 0 &&
    !registries.population &&
    registries.complaints.length === 0;

  return {
    status: needsIngest ? 'needs_ingest' : 'blocked',
    registries,
    blocking: uniqueBlocking,
    model,
  };
}
