export * from './qapiTypes';
export * from './qapiDateWindow';
export * from './qapiExtraction';
export * from './personnelActionAddendum';
export * from './validateQapiPacketForLock';
export * from './renderQapiPacket';

import type { ClinicalDump } from './qapiTypes';
/** A confidential personnel addendum is REQUIRED when any disciplinary trigger exists. */
export function needsPersonnelAddendum(dump: ClinicalDump): boolean {
  return (dump.clinicians ?? []).some((c) => (c.triggers ?? []).length > 0);
}
