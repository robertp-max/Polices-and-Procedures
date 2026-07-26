/**
 * Complaint lock-gate helpers (Slice 1 companion)
 *
 * Production rules:
 * - Complaint KPI total MUST equal count of ComplaintCase rows for the period
 * - Display of 0 requires ZeroComplaintAttestation
 * - Missing source → MISSING_SOURCE blocking finding (never shown as verified zero)
 *
 * Target: src/policy/packets/qapi/validation/complaintLockGates.ts
 */

import type {
  ComplaintCase,
  ZeroComplaintAttestation,
  MissingComplaintSourceFinding,
  QapiPeriodRegistries,
} from '../registries/qapiRegistries';

export type ComplaintGateResult =
  | { ok: true; total: number; verified_zero: boolean }
  | { ok: false; blocking: string[]; total: number; verified_zero: boolean };

/**
 * Evaluate complaint reconciliation for lock eligibility.
 */
export function evaluateComplaintLockGate(regs: QapiPeriodRegistries): ComplaintGateResult {
  const blocking: string[] = [];
  const total = regs.complaints.length;
  const hasAttestation = !!regs.zero_complaint_attestation;
  const sourcePresent = regs.completeness.complaints_source_present || total > 0;

  if (!sourcePresent && total === 0 && !hasAttestation) {
    blocking.push(
      'MISSING_SOURCE: No complaint registry rows and no ZeroComplaintAttestation for period ' +
        regs.reporting_period_id
    );
  }

  if (total === 0 && hasAttestation) {
    if (blocking.length > 0) {
      return { ok: false, blocking, total: 0, verified_zero: true };
    }
    return { ok: true, total: 0, verified_zero: true };
  }

  if (total === 0 && !hasAttestation) {
    blocking.push(
      'Zero complaints requires ZeroComplaintAttestation (cannot display verified zero without attestation)'
    );
  }

  const complaintKpis = regs.kpi_observations.filter(
    (k) =>
      /complaint/i.test(k.indicator) ||
      /complaint/i.test(k.metric_id) ||
      k.metric_id === 'KPI-CMP'
  );
  for (const k of complaintKpis) {
    if (k.numerator != null && k.numerator !== total) {
      blocking.push(
        `Complaint KPI numerator (${k.numerator}) does not equal ComplaintCase row count (${total}) for ${k.metric_id}`
      );
    }
  }

  const verifiedZero = total === 0 && hasAttestation;
  if (blocking.length > 0) {
    return { ok: false, blocking, total, verified_zero: verifiedZero };
  }
  return { ok: true, total, verified_zero: verifiedZero };
}

export function buildZeroComplaintAttestation(opts: {
  reporting_period_id: string;
  agency_id: string;
  attested_by: string;
  register_version: string;
}): ZeroComplaintAttestation {
  return {
    reporting_period_id: opts.reporting_period_id,
    agency_id: opts.agency_id,
    queried_at: new Date().toISOString(),
    register_version: opts.register_version,
    result: 'VERIFIED_ZERO',
    attested_by: opts.attested_by,
    integrity_sha256: `sha256:pending:zero-complaint:${opts.reporting_period_id}`,
  };
}

export function buildMissingComplaintSourceFinding(
  reporting_period_id: string
): MissingComplaintSourceFinding {
  return {
    reporting_period_id,
    code: 'MISSING_SOURCE',
    blocking: true,
    message: `Complaint/grievance source not available for ${reporting_period_id}. Cannot treat as verified zero.`,
  };
}

/**
 * De-identified B12 table rows from ComplaintCase register.
 * Never includes narrative_restricted.
 */
export function buildB12DeidRows(complaints: ComplaintCase[]): Array<{
  record: string;
  received: string;
  class: string;
  category: string;
  status: string;
  resolution_time: string | null;
  disposition: string;
  source: string;
}> {
  return complaints.map((c) => ({
    record: c.complaint_id,
    received: c.received_at.slice(0, 10),
    class: c.case_class,
    category: c.category,
    status: c.status,
    resolution_time:
      c.resolution_business_days != null ? String(c.resolution_business_days) : null,
    disposition: c.disposition ?? c.packet_summary_deid,
    source: c.source_artifact_id ?? 'registry',
  }));
}
