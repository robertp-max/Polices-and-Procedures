/**
 * In-memory QapiRegistryStore for UAT / local demo.
 * Replace with Dynamo-backed implementation for production.
 *
 * Target (dev only): src/policy/packets/qapi/ingest/inMemoryRegistryStore.ts
 */

import type {
  ComplaintCase,
  FeederAudit,
  AdverseEvent,
  RootCauseAnalysis,
  InfectionCase,
  PipTrigger,
  PipMaster,
  CorrectiveActionPlan,
  CommitteeActionItem,
  PopulationSnapshot,
  VisitUtilizationMonth,
  KpiObservation,
  MeetingAttendance,
  SourceRegisterEntry,
} from '../registries/qapiRegistries';
import type { QapiRegistryStore } from './ingestQapiDump';

function key(periodId: string, id: string) {
  return `${periodId}::${id}`;
}

export function createInMemoryRegistryStore(): QapiRegistryStore {
  const complaints = new Map<string, ComplaintCase>();
  const feederAudits = new Map<string, FeederAudit>();
  const adverseEvents = new Map<string, AdverseEvent>();
  const rcas = new Map<string, RootCauseAnalysis>();
  const infections = new Map<string, InfectionCase>();
  const pipTriggers = new Map<string, PipTrigger>();
  const pips = new Map<string, PipMaster>();
  const caps = new Map<string, CorrectiveActionPlan>();
  const actionItems = new Map<string, CommitteeActionItem>();
  const populations = new Map<string, PopulationSnapshot>();
  const visits = new Map<string, VisitUtilizationMonth>();
  const kpis = new Map<string, KpiObservation>();
  const attendance = new Map<string, MeetingAttendance>();
  const sources = new Map<string, SourceRegisterEntry>();

  function upsert<T extends { reporting_period_id: string }>(
    map: Map<string, T>,
    row: T,
    id: string
  ): 'inserted' | 'skipped_duplicate' | 'conflict' {
    const k = key(row.reporting_period_id, id);
    if (map.has(k)) {
      // For Slice 1: treat exact key as duplicate (no silent overwrite)
      return 'skipped_duplicate';
    }
    map.set(k, row);
    return 'inserted';
  }

  function listByPeriod<T extends { reporting_period_id: string }>(
    map: Map<string, T>,
    periodId: string
  ): T[] {
    return [...map.values()].filter((r) => r.reporting_period_id === periodId);
  }

  return {
    getComplaints: async (p) => listByPeriod(complaints, p),
    upsertComplaint: async (row) => upsert(complaints, row, row.complaint_id),

    getFeederAudits: async (p) => listByPeriod(feederAudits, p),
    upsertFeederAudit: async (row) => upsert(feederAudits, row, row.audit_id),

    getAdverseEvents: async (p) => listByPeriod(adverseEvents, p),
    upsertAdverseEvent: async (row) => upsert(adverseEvents, row, row.event_id),

    getRcas: async (p) => listByPeriod(rcas, p),
    upsertRca: async (row) => upsert(rcas, row, row.rca_id),

    getInfections: async (p) => listByPeriod(infections, p),
    upsertInfection: async (row) => upsert(infections, row, row.infection_id),

    getPipTriggers: async (p) => listByPeriod(pipTriggers, p),
    upsertPipTrigger: async (row) => upsert(pipTriggers, row, row.trigger_id),

    getPips: async (p) => listByPeriod(pips, p),
    upsertPip: async (row) => upsert(pips, row, row.pip_id),

    getCaps: async (p) => listByPeriod(caps, p),
    upsertCap: async (row) => upsert(caps, row, row.cap_id),

    getActionItems: async (p) => listByPeriod(actionItems, p),
    upsertActionItem: async (row) => upsert(actionItems, row, row.action_id),

    getPopulation: async (p) => populations.get(p) ?? null,
    upsertPopulation: async (row) => {
      if (populations.has(row.reporting_period_id)) return 'skipped_duplicate';
      populations.set(row.reporting_period_id, row);
      return 'inserted';
    },

    getVisitUtilization: async (p) => listByPeriod(visits, p),
    upsertVisitUtilization: async (row) => upsert(visits, row, row.month),

    getKpiObservations: async (p) => listByPeriod(kpis, p),
    upsertKpiObservation: async (row) =>
      upsert(kpis, row, `${row.metric_id}:${row.month}`),

    getAttendance: async (p) => listByPeriod(attendance, p),
    upsertAttendance: async (row) =>
      upsert(attendance, row, `${row.meeting_id}:${row.name_or_clinician_id}`),

    getSourceRegister: async (p) => listByPeriod(sources, p),
    upsertSourceRegister: async (row) => upsert(sources, row, row.source_label),
  };
}
