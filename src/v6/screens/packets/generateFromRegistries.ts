/**
 * Packet Studio — Generate from Registries (Slice 1)
 *
 * Preferred path when period registries are complete:
 *   loadPeriodRegistries → build model from structured rows → preview
 *
 * Falls back to existing free-text dump path only when registries are incomplete
 * or the user explicitly chooses "Refresh / Ingest new dump".
 *
 * Target: src/v6/screens/packets/generateFromRegistries.ts
 *
 * Integration point in PacketStudioScreen:
 *   1. On template = QAPI quarterly + period selected → call loadPeriodRegistries
 *   2. If completeness.blocking_findings.length === 0 → enable "Generate from records"
 *   3. Else show completeness panel + "Ingest / Refresh sources" CTA
 *   4. Generate calls this module instead of generateQapiFromSource (dump text)
 */

import type { QapiPeriodRegistries } from '../../../policy/packets/qapi/registries/qapiRegistries';

/** Minimal shape expected by existing buildQapiPacketModel / render path.
 *  Expand as you wire real model fields. Keep nulls honest — never invent 0.
 */
export interface QapiModelFromRegistries {
  identity: {
    reporting_period_id: string;
    period_start: string;
    period_end: string;
    agency_id: string;
    source: 'registries';
  };
  population: {
    patients_in_scope: number | null;
    active_census: number | null;
    high_acuity: number | null;
    new_soc: number | null;
    discharges: number | null;
  };
  kpis: Array<{
    metric_id: string;
    indicator: string;
    month: string;
    numerator: number | null;
    denominator: number | null;
    rate: number | null;
    status: string;
  }>;
  complaints: {
    total: number;
    rate_per_100: number | null;
    rows: Array<{
      complaint_id: string;
      category: string;
      status: string;
      packet_summary_deid: string;
      resolution_business_days: number | null;
    }>;
    /** true only when ZeroComplaintAttestation exists */
    verified_zero: boolean;
  };
  adverse_events: {
    total: number;
    open_rcas: number;
    rows: Array<{
      event_id: string;
      event_type: string;
      event_date: string;
      rca_status?: string;
    }>;
  };
  infections: {
    total: number;
    hai: number;
    community: number;
    rows: Array<{
      infection_id: string;
      infection_type: string;
      classification: string;
      onset_date: string;
      cluster_flag?: string;
    }>;
  };
  feeder_audits: {
    total: number;
    complete: number;
    rows: Array<{
      audit_id: string;
      workflow_id: string;
      status: string;
      signed_at: string;
    }>;
  };
  pips: {
    active: number;
    triggers: number;
    rows: Array<{ pip_id: string; status: string; owner: string; trigger_indicator: string }>;
  };
  caps: {
    open: number;
    rows: Array<{ cap_id: string; finding: string; status: string; owner: string }>;
  };
  visit_utilization: Array<{
    month: string;
    scheduled: number | null;
    completed: number | null;
    missed: number | null;
    compliance: number | null;
  }>;
  attendance: {
    present: number;
    expected: number;
    quorum_met: boolean;
  };
  blocking_findings: string[];
  readiness: 'READY_TO_GENERATE' | 'NEEDS_INGEST' | 'BLOCKED';
}

/**
 * Build a packet model slice from durable registries.
 * This is the bridge into existing buildQapiPacketModel / renderPacketModel.
 * Keep it pure — no invent, no dump regex.
 */
export function buildModelFromRegistries(
  regs: QapiPeriodRegistries
): QapiModelFromRegistries {
  const activeCensus = regs.population?.active_census ?? null;
  const complaintTotal = regs.complaints.length;
  const ratePer100 =
    activeCensus != null && activeCensus > 0
      ? Math.round((complaintTotal / activeCensus) * 1000) / 10
      : null;

  const hai = regs.infections.filter((i) =>
    i.classification.startsWith('Healthcare-associated')
  ).length;
  const community = regs.infections.filter((i) =>
    i.classification.startsWith('Community')
  ).length;

  const openRcas = regs.rcas.filter((r) => r.status === 'Open' || r.status === 'Pending Owner').length;
  const completeAudits = regs.feeder_audits.filter((a) => a.status.startsWith('COMPLETE')).length;
  const present = regs.attendance.filter((a) => a.presence === 'Present').length;
  const expected = regs.attendance.length;

  const blocking = [...regs.completeness.blocking_findings];
  // Production rule: 0 complaints without attestation is not verified zero
  if (complaintTotal === 0 && !regs.zero_complaint_attestation) {
    blocking.push('Zero complaints requires ZeroComplaintAttestation (or MISSING_SOURCE)');
  }

  let readiness: QapiModelFromRegistries['readiness'] = 'READY_TO_GENERATE';
  if (blocking.length > 0) {
    readiness = regs.feeder_audits.length === 0 && !regs.population
      ? 'NEEDS_INGEST'
      : 'BLOCKED';
  }

  return {
    identity: {
      reporting_period_id: regs.reporting_period_id,
      period_start: regs.period_start,
      period_end: regs.period_end,
      agency_id: regs.agency_id,
      source: 'registries',
    },
    population: {
      patients_in_scope: regs.population?.patients_in_scope ?? null,
      active_census: activeCensus,
      high_acuity: regs.population?.high_acuity ?? null,
      new_soc: regs.population?.new_soc ?? null,
      discharges: regs.population?.discharges ?? null,
    },
    kpis: regs.kpi_observations.map((k) => ({
      metric_id: k.metric_id,
      indicator: k.indicator,
      month: k.month,
      numerator: k.numerator,
      denominator: k.denominator,
      rate: k.rate,
      status: k.status,
    })),
    complaints: {
      total: complaintTotal,
      rate_per_100: ratePer100,
      rows: regs.complaints.map((c) => ({
        complaint_id: c.complaint_id,
        category: c.category,
        status: c.status,
        packet_summary_deid: c.packet_summary_deid,
        resolution_business_days: c.resolution_business_days ?? null,
      })),
      verified_zero: !!regs.zero_complaint_attestation,
    },
    adverse_events: {
      total: regs.adverse_events.length,
      open_rcas: openRcas,
      rows: regs.adverse_events.map((e) => ({
        event_id: e.event_id,
        event_type: e.event_type,
        event_date: e.event_date,
        rca_status: e.rca_status,
      })),
    },
    infections: {
      total: regs.infections.length,
      hai,
      community,
      rows: regs.infections.map((i) => ({
        infection_id: i.infection_id,
        infection_type: i.infection_type,
        classification: i.classification,
        onset_date: i.onset_date,
        cluster_flag: i.cluster_flag,
      })),
    },
    feeder_audits: {
      total: regs.feeder_audits.length,
      complete: completeAudits,
      rows: regs.feeder_audits.map((a) => ({
        audit_id: a.audit_id,
        workflow_id: a.workflow_id,
        status: a.status,
        signed_at: a.signed_at,
      })),
    },
    pips: {
      active: regs.pips.filter((p) => /active/i.test(p.status)).length,
      triggers: regs.pip_triggers.length,
      rows: regs.pips.map((p) => ({
        pip_id: p.pip_id,
        status: p.status,
        owner: p.owner,
        trigger_indicator: p.trigger_indicator,
      })),
    },
    caps: {
      open: regs.caps.filter((c) => c.status.startsWith('OPEN')).length,
      rows: regs.caps.map((c) => ({
        cap_id: c.cap_id,
        finding: c.finding,
        status: c.status,
        owner: c.owner,
      })),
    },
    visit_utilization: regs.visit_utilization.map((v) => ({
      month: v.month,
      scheduled: v.scheduled_visits,
      completed: v.completed_visits,
      missed: v.missed_visits,
      compliance: v.compliance ?? null,
    })),
    attendance: {
      present,
      expected,
      quorum_met: expected > 0 && present >= expected, // simplify; real rule from membership later
    },
    blocking_findings: blocking,
    readiness,
  };
}
