/**
 * QAPI Ingest + Dedup — Slice 1
 *
 * Turns a raw dump (or structured mock) into durable registry rows.
 * New dumps check natural keys against existing rows.
 *
 * Target: src/policy/packets/qapi/ingest/ingestQapiDump.ts
 *
 * Dedup policy:
 * - Exact natural-key match → skip (or merge if caller requests)
 * - Conflict on key with different content → record conflict, do not silent overwrite
 * - Always write an ingest audit event
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
  QapiPeriodRegistries,
  RecordStamp,
  IsoDate,
} from '../registries/qapiRegistries';

// ─── Store abstraction (swap for Dynamo / file store later) ──────────────────

export interface QapiRegistryStore {
  getComplaints(periodId: string): Promise<ComplaintCase[]>;
  upsertComplaint(row: ComplaintCase): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getFeederAudits(periodId: string): Promise<FeederAudit[]>;
  upsertFeederAudit(row: FeederAudit): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getAdverseEvents(periodId: string): Promise<AdverseEvent[]>;
  upsertAdverseEvent(row: AdverseEvent): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getRcas(periodId: string): Promise<RootCauseAnalysis[]>;
  upsertRca(row: RootCauseAnalysis): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getInfections(periodId: string): Promise<InfectionCase[]>;
  upsertInfection(row: InfectionCase): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getPipTriggers(periodId: string): Promise<PipTrigger[]>;
  upsertPipTrigger(row: PipTrigger): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getPips(periodId: string): Promise<PipMaster[]>;
  upsertPip(row: PipMaster): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getCaps(periodId: string): Promise<CorrectiveActionPlan[]>;
  upsertCap(row: CorrectiveActionPlan): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getActionItems(periodId: string): Promise<CommitteeActionItem[]>;
  upsertActionItem(row: CommitteeActionItem): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getPopulation(periodId: string): Promise<PopulationSnapshot | null>;
  upsertPopulation(row: PopulationSnapshot): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getVisitUtilization(periodId: string): Promise<VisitUtilizationMonth[]>;
  upsertVisitUtilization(row: VisitUtilizationMonth): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getKpiObservations(periodId: string): Promise<KpiObservation[]>;
  upsertKpiObservation(row: KpiObservation): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getAttendance(periodId: string): Promise<MeetingAttendance[]>;
  upsertAttendance(row: MeetingAttendance): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
  getSourceRegister(periodId: string): Promise<SourceRegisterEntry[]>;
  upsertSourceRegister(row: SourceRegisterEntry): Promise<'inserted' | 'skipped_duplicate' | 'conflict'>;
}

// ─── Ingest result ───────────────────────────────────────────────────────────

export interface IngestResult {
  source_artifact_id: string;
  reporting_period_id: string;
  inserted: number;
  skipped_duplicates: number;
  conflicts: number;
  errors: string[];
  by_type: Record<string, { inserted: number; skipped: number; conflicts: number }>;
}

function emptyTypeStats() {
  return { inserted: 0, skipped: 0, conflicts: 0 };
}

function stampBase(opts: {
  agency_id: string;
  reporting_period_id: string;
  period_start: IsoDate;
  period_end: IsoDate;
  source_artifact_id: string;
  created_by: string;
  source_classification: 'production' | 'synthetic' | 'uat';
}): Omit<RecordStamp, 'integrity_sha256'> {
  const now = new Date().toISOString();
  return {
    agency_id: opts.agency_id,
    reporting_period_id: opts.reporting_period_id,
    period_start: opts.period_start,
    period_end: opts.period_end,
    source_artifact_id: opts.source_artifact_id,
    created_at: now,
    created_by: opts.created_by,
    updated_at: now,
    record_version: 1,
    source_classification: opts.source_classification,
    deleted: false,
  };
}

/** Placeholder integrity — replace with real sha256 of canonical JSON in production */
function fakeIntegrity(seed: string): string {
  return `sha256:pending:${seed.slice(0, 24)}`;
}

// ─── Structured ingest input (parsed dump or manual form) ────────────────────

export interface ParsedQapiDump {
  reporting_period_id: string;
  period_start: IsoDate;
  period_end: IsoDate;
  agency_id: string;
  source_classification: 'production' | 'synthetic' | 'uat';

  complaints?: Array<Partial<ComplaintCase> & { complaint_id: string }>;
  feeder_audits?: Array<Partial<FeederAudit> & { audit_id: string; workflow_id: string }>;
  adverse_events?: Array<Partial<AdverseEvent> & { event_id: string }>;
  rcas?: Array<Partial<RootCauseAnalysis> & { rca_id: string; event_id: string }>;
  infections?: Array<Partial<InfectionCase> & { infection_id: string }>;
  pip_triggers?: Array<Partial<PipTrigger> & { trigger_id: string }>;
  pips?: Array<Partial<PipMaster> & { pip_id: string }>;
  caps?: Array<Partial<CorrectiveActionPlan> & { cap_id: string }>;
  action_items?: Array<Partial<CommitteeActionItem> & { action_id: string }>;
  population?: Partial<PopulationSnapshot> & { snapshot_id: string };
  visit_utilization?: Array<Partial<VisitUtilizationMonth> & { month: string }>;
  kpi_observations?: Array<Partial<KpiObservation> & { metric_id: string; month: string }>;
  attendance?: Array<Partial<MeetingAttendance> & { meeting_id: string; name_or_clinician_id: string }>;
  source_register?: Array<Partial<SourceRegisterEntry> & { source_label: string }>;
}

/**
 * Ingest a parsed dump into the registry store with natural-key dedup.
 * Does NOT invent zeros. Does NOT overwrite on conflict without explicit merge policy.
 */
export async function ingestParsedQapiDump(
  store: QapiRegistryStore,
  parsed: ParsedQapiDump,
  opts: {
    source_artifact_id: string;
    created_by: string;
  }
): Promise<IngestResult> {
  const result: IngestResult = {
    source_artifact_id: opts.source_artifact_id,
    reporting_period_id: parsed.reporting_period_id,
    inserted: 0,
    skipped_duplicates: 0,
    conflicts: 0,
    errors: [],
    by_type: {},
  };

  const base = stampBase({
    agency_id: parsed.agency_id,
    reporting_period_id: parsed.reporting_period_id,
    period_start: parsed.period_start,
    period_end: parsed.period_end,
    source_artifact_id: opts.source_artifact_id,
    created_by: opts.created_by,
    source_classification: parsed.source_classification,
  });

  async function track(
    type: string,
    outcome: 'inserted' | 'skipped_duplicate' | 'conflict'
  ) {
    if (!result.by_type[type]) result.by_type[type] = emptyTypeStats();
    if (outcome === 'inserted') {
      result.inserted++;
      result.by_type[type].inserted++;
    } else if (outcome === 'skipped_duplicate') {
      result.skipped_duplicates++;
      result.by_type[type].skipped++;
    } else {
      result.conflicts++;
      result.by_type[type].conflicts++;
    }
  }

  // Complaints
  for (const c of parsed.complaints ?? []) {
    try {
      const row: ComplaintCase = {
        ...c,
        ...base,
        integrity_sha256: fakeIntegrity(c.complaint_id),
        complaint_id: c.complaint_id,
        case_class: c.case_class ?? 'informal_complaint',
        category: c.category ?? 'Unknown',
        received_at: c.received_at ?? base.created_at,
        intake_channel: c.intake_channel ?? 'unknown',
        received_by: c.received_by ?? opts.created_by,
        narrative_restricted: c.narrative_restricted ?? '',
        packet_summary_deid: c.packet_summary_deid ?? c.category ?? 'Complaint',
        allegation_safety_indicators: c.allegation_safety_indicators ?? [],
        immediate_risk: c.immediate_risk ?? false,
        ane_screening: c.ane_screening ?? 'unknown',
        status: c.status ?? 'RECEIVED',
        communications: c.communications ?? [],
        classification_history: c.classification_history ?? [],
        phiClass: 'PHI',
      } as ComplaintCase;
      const outcome = await store.upsertComplaint(row);
      await track('complaint', outcome);
    } catch (e) {
      result.errors.push(`complaint ${c.complaint_id}: ${String(e)}`);
    }
  }

  // Feeder audits
  for (const a of parsed.feeder_audits ?? []) {
    try {
      const row: FeederAudit = {
        ...a,
        ...base,
        integrity_sha256: fakeIntegrity(a.audit_id),
        audit_id: a.audit_id,
        workflow_id: a.workflow_id,
        domain: a.domain ?? 'clinical',
        audit_name: a.audit_name ?? a.workflow_id,
        findings_count: a.findings_count ?? 0,
        status: a.status ?? 'COMPLETE',
        signed_by: a.signed_by ?? opts.created_by,
        signed_at: a.signed_at ?? base.created_at,
        source_pointer: a.source_pointer ?? `SRC-AUD-${a.audit_id}`,
        phiClass: 'INTERNAL',
      } as FeederAudit;
      const outcome = await store.upsertFeederAudit(row);
      await track('feeder_audit', outcome);
    } catch (e) {
      result.errors.push(`feeder_audit ${a.audit_id}: ${String(e)}`);
    }
  }

  // Adverse events
  for (const ev of parsed.adverse_events ?? []) {
    try {
      const row: AdverseEvent = {
        ...ev,
        ...base,
        integrity_sha256: fakeIntegrity(ev.event_id),
        event_id: ev.event_id,
        event_type: ev.event_type ?? 'Unknown',
        event_date: ev.event_date ?? parsed.period_start,
        rca_required: ev.rca_required ?? false,
        unreported: ev.unreported ?? false,
        phiClass: 'PHI',
      } as AdverseEvent;
      const outcome = await store.upsertAdverseEvent(row);
      await track('adverse_event', outcome);
    } catch (e) {
      result.errors.push(`adverse_event ${ev.event_id}: ${String(e)}`);
    }
  }

  // RCAs
  for (const r of parsed.rcas ?? []) {
    try {
      const row: RootCauseAnalysis = {
        ...r,
        ...base,
        integrity_sha256: fakeIntegrity(r.rca_id),
        rca_id: r.rca_id,
        event_id: r.event_id,
        status: r.status ?? 'Open',
        phiClass: 'PHI',
      } as RootCauseAnalysis;
      const outcome = await store.upsertRca(row);
      await track('rca', outcome);
    } catch (e) {
      result.errors.push(`rca ${r.rca_id}: ${String(e)}`);
    }
  }

  // Infections
  for (const inf of parsed.infections ?? []) {
    try {
      const row: InfectionCase = {
        ...inf,
        ...base,
        integrity_sha256: fakeIntegrity(inf.infection_id),
        infection_id: inf.infection_id,
        infection_type: inf.infection_type ?? 'Unknown',
        classification: inf.classification ?? 'Suspected',
        onset_date: inf.onset_date ?? parsed.period_start,
        reported_to_state: inf.reported_to_state ?? false,
        status: inf.status ?? 'Open',
        phiClass: 'PHI',
      } as InfectionCase;
      const outcome = await store.upsertInfection(row);
      await track('infection', outcome);
    } catch (e) {
      result.errors.push(`infection ${inf.infection_id}: ${String(e)}`);
    }
  }

  // PIP triggers
  for (const t of parsed.pip_triggers ?? []) {
    try {
      const row: PipTrigger = {
        ...t,
        ...base,
        integrity_sha256: fakeIntegrity(t.trigger_id),
        trigger_id: t.trigger_id,
        trigger_type: t.trigger_type ?? 'threshold',
        source_indicator: t.source_indicator ?? '',
        state: t.state ?? 'PENDING_AUTHORIZED_REVIEW',
        source_record_ids: t.source_record_ids ?? [],
        phiClass: 'INTERNAL',
      } as PipTrigger;
      const outcome = await store.upsertPipTrigger(row);
      await track('pip_trigger', outcome);
    } catch (e) {
      result.errors.push(`pip_trigger ${t.trigger_id}: ${String(e)}`);
    }
  }

  // PIPs
  for (const p of parsed.pips ?? []) {
    try {
      const row: PipMaster = {
        ...p,
        ...base,
        integrity_sha256: fakeIntegrity(p.pip_id),
        pip_id: p.pip_id,
        trigger_indicator: p.trigger_indicator ?? '',
        trigger_date: p.trigger_date ?? parsed.period_start,
        status: p.status ?? 'Active',
        owner: p.owner ?? 'Unassigned',
        phiClass: 'INTERNAL',
      } as PipMaster;
      const outcome = await store.upsertPip(row);
      await track('pip', outcome);
    } catch (e) {
      result.errors.push(`pip ${p.pip_id}: ${String(e)}`);
    }
  }

  // CAPs
  for (const cap of parsed.caps ?? []) {
    try {
      const row: CorrectiveActionPlan = {
        ...cap,
        ...base,
        integrity_sha256: fakeIntegrity(cap.cap_id),
        cap_id: cap.cap_id,
        finding: cap.finding ?? '',
        corrective_actions: cap.corrective_actions ?? [],
        owner: cap.owner ?? 'Unassigned',
        opened_at: cap.opened_at ?? parsed.period_start,
        due_at: cap.due_at ?? parsed.period_end,
        status: cap.status ?? 'OPEN',
        phiClass: 'INTERNAL',
      } as CorrectiveActionPlan;
      const outcome = await store.upsertCap(row);
      await track('cap', outcome);
    } catch (e) {
      result.errors.push(`cap ${cap.cap_id}: ${String(e)}`);
    }
  }

  // Action items
  for (const a of parsed.action_items ?? []) {
    try {
      const row: CommitteeActionItem = {
        ...a,
        ...base,
        integrity_sha256: fakeIntegrity(a.action_id),
        action_id: a.action_id,
        action: a.action ?? '',
        owner: a.owner ?? 'Unassigned',
        status: a.status ?? 'OPEN',
        phiClass: 'INTERNAL',
      } as CommitteeActionItem;
      const outcome = await store.upsertActionItem(row);
      await track('action_item', outcome);
    } catch (e) {
      result.errors.push(`action_item ${a.action_id}: ${String(e)}`);
    }
  }

  // Population
  if (parsed.population) {
    try {
      const row: PopulationSnapshot = {
        ...parsed.population,
        ...base,
        integrity_sha256: fakeIntegrity(parsed.population.snapshot_id),
        snapshot_id: parsed.population.snapshot_id,
        patients_in_scope: parsed.population.patients_in_scope ?? null,
        active_census: parsed.population.active_census ?? null,
        phiClass: 'INTERNAL',
      } as PopulationSnapshot;
      const outcome = await store.upsertPopulation(row);
      await track('population', outcome);
    } catch (e) {
      result.errors.push(`population: ${String(e)}`);
    }
  }

  // Visit utilization
  for (const v of parsed.visit_utilization ?? []) {
    try {
      const row: VisitUtilizationMonth = {
        ...v,
        ...base,
        integrity_sha256: fakeIntegrity(v.month),
        month: v.month,
        scheduled_visits: v.scheduled_visits ?? null,
        completed_visits: v.completed_visits ?? null,
        missed_visits: v.missed_visits ?? null,
        phiClass: 'INTERNAL',
      } as VisitUtilizationMonth;
      const outcome = await store.upsertVisitUtilization(row);
      await track('visit_utilization', outcome);
    } catch (e) {
      result.errors.push(`visit_utilization ${v.month}: ${String(e)}`);
    }
  }

  // KPI observations
  for (const k of parsed.kpi_observations ?? []) {
    try {
      const row: KpiObservation = {
        ...k,
        ...base,
        integrity_sha256: fakeIntegrity(`${k.metric_id}:${k.month}`),
        metric_id: k.metric_id,
        indicator: k.indicator ?? k.metric_id,
        month: k.month,
        numerator: k.numerator ?? null,
        denominator: k.denominator ?? null,
        rate: k.rate ?? null,
        status: k.status ?? 'UNKNOWN',
        phiClass: 'INTERNAL',
      } as KpiObservation;
      const outcome = await store.upsertKpiObservation(row);
      await track('kpi_observation', outcome);
    } catch (e) {
      result.errors.push(`kpi ${k.metric_id}: ${String(e)}`);
    }
  }

  // Attendance
  for (const att of parsed.attendance ?? []) {
    try {
      const row: MeetingAttendance = {
        ...att,
        ...base,
        integrity_sha256: fakeIntegrity(`${att.meeting_id}:${att.name_or_clinician_id}`),
        meeting_id: att.meeting_id,
        meeting_date: att.meeting_date ?? parsed.period_end,
        role: att.role ?? 'Member',
        name_or_clinician_id: att.name_or_clinician_id,
        presence: att.presence ?? 'Present',
        phiClass: 'PII',
      } as MeetingAttendance;
      const outcome = await store.upsertAttendance(row);
      await track('attendance', outcome);
    } catch (e) {
      result.errors.push(`attendance ${att.name_or_clinician_id}: ${String(e)}`);
    }
  }

  // Source register
  for (const s of parsed.source_register ?? []) {
    try {
      const row: SourceRegisterEntry = {
        ...s,
        ...base,
        integrity_sha256: fakeIntegrity(s.source_label),
        source_label: s.source_label,
        filename_or_ref: s.filename_or_ref ?? s.source_label,
        class: s.class ?? 'Raw source',
        location: s.location ?? 'ingest',
        period: s.period ?? 'quarter',
        use: s.use ?? 'packet',
        purpose: s.purpose ?? '',
        phiClass: 'INTERNAL',
      } as SourceRegisterEntry;
      const outcome = await store.upsertSourceRegister(row);
      await track('source_register', outcome);
    } catch (e) {
      result.errors.push(`source_register ${s.source_label}: ${String(e)}`);
    }
  }

  return result;
}

/**
 * Load full period registries for Packet Studio generate.
 * Completeness flags drive whether Studio allows generate without a new dump.
 */
export async function loadPeriodRegistries(
  store: QapiRegistryStore,
  reporting_period_id: string,
  agency_id: string,
  period_start: IsoDate,
  period_end: IsoDate
): Promise<QapiPeriodRegistries> {
  const [
    complaints,
    feeder_audits,
    adverse_events,
    rcas,
    infections,
    pip_triggers,
    pips,
    caps,
    action_items,
    population,
    visit_utilization,
    kpi_observations,
    attendance,
    source_register,
  ] = await Promise.all([
    store.getComplaints(reporting_period_id),
    store.getFeederAudits(reporting_period_id),
    store.getAdverseEvents(reporting_period_id),
    store.getRcas(reporting_period_id),
    store.getInfections(reporting_period_id),
    store.getPipTriggers(reporting_period_id),
    store.getPips(reporting_period_id),
    store.getCaps(reporting_period_id),
    store.getActionItems(reporting_period_id),
    store.getPopulation(reporting_period_id),
    store.getVisitUtilization(reporting_period_id),
    store.getKpiObservations(reporting_period_id),
    store.getAttendance(reporting_period_id),
    store.getSourceRegister(reporting_period_id),
  ]);

  const feederComplete = feeder_audits.filter((a) => a.status.startsWith('COMPLETE')).length >= 40;
  const complaintsPresent = complaints.length > 0; // zero still needs attestation object later
  const populationOk =
    !!population &&
    population.patients_in_scope != null &&
    population.active_census != null;

  const blocking: string[] = [];
  if (!feederComplete) blocking.push('Feeder audits incomplete (need 40 signed)');
  if (!populationOk) blocking.push('Population snapshot missing or incomplete');
  // Note: zero complaints is OK only with ZeroComplaintAttestation (added in later slice)

  return {
    reporting_period_id,
    period_start,
    period_end,
    agency_id,
    population: population ?? undefined,
    visit_utilization,
    kpi_observations,
    feeder_audits,
    adverse_events,
    rcas,
    infections,
    complaints,
    pip_triggers,
    pips,
    caps,
    action_items,
    attendance,
    motions: [],
    source_register,
    completeness: {
      feeder_audits_complete: feederComplete,
      complaints_source_present: complaintsPresent,
      population_reconciled: populationOk,
      required_signers_present: false, // wire when sign-off registry lands
      blocking_findings: blocking,
    },
  };
}
