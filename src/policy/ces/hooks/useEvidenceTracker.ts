/* ═══════════════════════════════════════════════════════════════
   useEvidenceTracker
   Pure helpers correlating EvidenceStatus → human-friendly summaries.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import type { EvidenceStatus, ExecutionUnit } from '../types';

export interface EvidenceSummary {
  formsLabel:      string;       // "2 / 3 forms filed"
  signaturesLabel: string;       // "1 / 2 signatures captured"
  auditIndexLabel: string;       // "Audit index created" / "Audit index pending"
  ready:           boolean;      // all 3 conditions satisfied
  missingForms:    string[];
}

export function summarizeEvidence(ev: EvidenceStatus): EvidenceSummary {
  const formsReady = ev.requiredFormsComplete >= ev.requiredFormsTotal;
  const sigReady   = ev.signaturesComplete  >= ev.signaturesRequired;
  return {
    formsLabel:      `${ev.requiredFormsComplete} / ${ev.requiredFormsTotal} forms filed`,
    signaturesLabel: `${ev.signaturesComplete} / ${ev.signaturesRequired} signatures captured`,
    auditIndexLabel: ev.auditIndexCreated ? 'Audit index created' : 'Audit index pending',
    ready:           formsReady && sigReady && ev.auditIndexCreated,
    missingForms:    [...ev.missingFormIds],
  };
}

export function useEvidenceTracker(unit: ExecutionUnit | null): EvidenceSummary | null {
  return useMemo(() => unit ? summarizeEvidence(unit.evidenceStatus) : null, [unit]);
}
