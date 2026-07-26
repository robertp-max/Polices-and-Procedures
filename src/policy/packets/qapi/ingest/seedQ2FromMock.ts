/**
 * Seed ParsedQapiDump from the attached Q2 synthetic mock (answer-key numbers).
 * Use for UAT of ingest → registries → generateFromRegistries.
 *
 * This is NOT runtime source data — it is a test helper that materializes
 * the counts from mockq2synth.md / QAPI Q2 2026 RAW MOCK into ParsedQapiDump.
 *
 * Target (test only): src/policy/packets/qapi/ingest/seedQ2FromMock.ts
 */

import type { ParsedQapiDump } from './ingestQapiDump';

export function seedQ2_2026_ParsedDump(): ParsedQapiDump {
  const period = {
    reporting_period_id: '2026-Q2',
    period_start: '2026-04-01',
    period_end: '2026-06-30',
    agency_id: 'CARE-INDEED',
    source_classification: 'synthetic' as const,
  };

  return {
    ...period,

    population: {
      snapshot_id: 'POP-2026-Q2',
      patients_in_scope: 112,
      active_census: 100,
      high_acuity: 12,
      new_soc: 42,
      recertifications: 18,
      resumptions_of_care: 6,
      discharges: 35,
      transfers_to_inpatient: 7,
      payer_mix: '~60% Medicare, ~30% Medicaid, ~10% Other',
      service_areas: ['North', 'South', 'East', 'West'],
      oasis_cms485_records: 154,
    },

    visit_utilization: [
      {
        month: '2026-04',
        scheduled_visits: 48,
        completed_visits: 42,
        missed_visits: 6,
        missed_visit_rate: 12.5,
        compliance: 87.5,
      },
      {
        month: '2026-05',
        scheduled_visits: 52,
        completed_visits: 45,
        missed_visits: 7,
        missed_visit_rate: 13.5,
        compliance: 86.5,
      },
      {
        month: '2026-06',
        scheduled_visits: 50,
        completed_visits: 39,
        missed_visits: 11,
        missed_visit_rate: 22.0,
        compliance: 78.0,
      },
    ],

    complaints: [
      {
        complaint_id: 'CMP-Q2-001',
        case_class: 'informal_complaint',
        category: 'Communication',
        received_at: '2026-04-09T00:00:00Z',
        intake_channel: 'phone',
        received_by: 'MOCK-CLIN-0003',
        narrative_restricted: '[RESTRICTED]',
        packet_summary_deid: 'Communication — clinician responsiveness',
        allegation_safety_indicators: [],
        immediate_risk: false,
        ane_screening: 'negative',
        status: 'RESOLVED',
        resolution_at: '2026-04-19T00:00:00Z',
        resolution_business_days: 10,
        communications: [],
        classification_history: [],
        patient_id_restricted: 'MOCK-PT-0011',
      },
      {
        complaint_id: 'CMP-Q2-002',
        case_class: 'informal_complaint',
        category: 'Scheduling',
        received_at: '2026-04-20T00:00:00Z',
        intake_channel: 'phone',
        received_by: 'MOCK-CLIN-0003',
        narrative_restricted: '[RESTRICTED]',
        packet_summary_deid: 'Scheduling — missed visit',
        allegation_safety_indicators: [],
        immediate_risk: false,
        ane_screening: 'negative',
        status: 'RESOLVED',
        resolution_at: '2026-05-02T00:00:00Z',
        resolution_business_days: 12,
        communications: [],
        classification_history: [],
        patient_id_restricted: 'MOCK-PT-0024',
      },
      {
        complaint_id: 'CMP-Q2-003',
        case_class: 'informal_complaint',
        category: 'Clinical',
        received_at: '2026-05-01T00:00:00Z',
        intake_channel: 'phone',
        received_by: 'MOCK-CLIN-0003',
        narrative_restricted: '[RESTRICTED]',
        packet_summary_deid: 'Clinical — medication concern',
        allegation_safety_indicators: [],
        immediate_risk: false,
        ane_screening: 'unknown',
        status: 'UNDER_REVIEW',
        communications: [],
        classification_history: [],
        patient_id_restricted: 'MOCK-PT-0037',
      },
      {
        complaint_id: 'CMP-Q2-004',
        case_class: 'informal_complaint',
        category: 'Communication',
        received_at: '2026-05-15T00:00:00Z',
        intake_channel: 'phone',
        received_by: 'MOCK-CLIN-0003',
        narrative_restricted: '[RESTRICTED]',
        packet_summary_deid: 'Communication — response time',
        allegation_safety_indicators: [],
        immediate_risk: false,
        ane_screening: 'negative',
        status: 'RESOLVED',
        resolution_at: '2026-05-25T00:00:00Z',
        resolution_business_days: 10,
        communications: [],
        classification_history: [],
        patient_id_restricted: 'MOCK-PT-0049',
      },
      {
        complaint_id: 'CMP-Q2-005',
        case_class: 'informal_complaint',
        category: 'Scheduling',
        received_at: '2026-05-28T00:00:00Z',
        intake_channel: 'phone',
        received_by: 'MOCK-CLIN-0003',
        narrative_restricted: '[RESTRICTED]',
        packet_summary_deid: 'Scheduling — missed visit',
        allegation_safety_indicators: [],
        immediate_risk: false,
        ane_screening: 'negative',
        status: 'RESOLVED',
        resolution_at: '2026-06-07T00:00:00Z',
        resolution_business_days: 10,
        communications: [],
        classification_history: [],
        patient_id_restricted: 'MOCK-PT-0058',
      },
      {
        complaint_id: 'CMP-Q2-006',
        case_class: 'informal_complaint',
        category: 'Clinical',
        received_at: '2026-06-09T00:00:00Z',
        intake_channel: 'phone',
        received_by: 'MOCK-CLIN-0003',
        narrative_restricted: '[RESTRICTED]',
        packet_summary_deid: 'Clinical — wound care concern',
        allegation_safety_indicators: [],
        immediate_risk: false,
        ane_screening: 'unknown',
        status: 'UNDER_REVIEW',
        communications: [],
        classification_history: [],
        patient_id_restricted: 'MOCK-PT-0067',
      },
      {
        complaint_id: 'CMP-Q2-007',
        case_class: 'informal_complaint',
        category: 'Communication',
        received_at: '2026-06-21T00:00:00Z',
        intake_channel: 'phone',
        received_by: 'MOCK-CLIN-0003',
        narrative_restricted: '[RESTRICTED]',
        packet_summary_deid: 'Communication — clinician attitude',
        allegation_safety_indicators: [],
        immediate_risk: false,
        ane_screening: 'negative',
        status: 'UNDER_REVIEW',
        communications: [],
        classification_history: [],
        patient_id_restricted: 'MOCK-PT-0089',
      },
    ],

    adverse_events: [
      { event_id: 'AE-Q2-001', event_type: 'Hospitalization', event_date: '2026-04-08', rca_required: true, rca_id: 'RCA-Q2-001', rca_status: 'Open', unreported: false, patient_id_restricted: 'MOCK-PT-0008' },
      { event_id: 'AE-Q2-002', event_type: 'Hospitalization', event_date: '2026-04-17', rca_required: true, rca_id: 'RCA-Q2-002', rca_status: 'Open', unreported: false, patient_id_restricted: 'MOCK-PT-0014' },
      { event_id: 'AE-Q2-003', event_type: 'Hospitalization', event_date: '2026-04-29', rca_required: true, rca_id: 'RCA-Q2-003', rca_status: 'Completed', unreported: false, patient_id_restricted: 'MOCK-PT-0020' },
      { event_id: 'AE-Q2-004', event_type: 'Hospitalization', event_date: '2026-05-11', rca_required: true, rca_id: 'RCA-Q2-004', rca_status: 'Open', unreported: false, patient_id_restricted: 'MOCK-PT-0033' },
      { event_id: 'AE-Q2-005', event_type: 'Hospitalization', event_date: '2026-05-22', rca_required: true, rca_id: 'RCA-Q2-005', rca_status: 'Open', unreported: false, patient_id_restricted: 'MOCK-PT-0047' },
      { event_id: 'AE-Q2-006', event_type: 'Hospitalization', event_date: '2026-06-05', rca_required: true, rca_id: 'RCA-Q2-006', rca_status: 'Completed', unreported: false, patient_id_restricted: 'MOCK-PT-0061' },
      { event_id: 'AE-Q2-007', event_type: 'Hospitalization', event_date: '2026-06-19', rca_required: true, rca_id: 'RCA-Q2-007', rca_status: 'Open', unreported: false, patient_id_restricted: 'MOCK-PT-0079' },
    ],

    rcas: [
      { rca_id: 'RCA-Q2-001', event_id: 'AE-Q2-001', status: 'Open' },
      { rca_id: 'RCA-Q2-002', event_id: 'AE-Q2-002', status: 'Open' },
      { rca_id: 'RCA-Q2-003', event_id: 'AE-Q2-003', status: 'Completed' },
      { rca_id: 'RCA-Q2-004', event_id: 'AE-Q2-004', status: 'Open' },
      { rca_id: 'RCA-Q2-005', event_id: 'AE-Q2-005', status: 'Open' },
      { rca_id: 'RCA-Q2-006', event_id: 'AE-Q2-006', status: 'Completed' },
      { rca_id: 'RCA-Q2-007', event_id: 'AE-Q2-007', status: 'Open' },
    ],

    infections: [
      { infection_id: 'INF-Q2-001', infection_type: 'MRSA', classification: 'Healthcare-associated (HAI)', onset_date: '2026-04-14', reported_to_state: true, cluster_flag: 'CLUSTER-001', status: 'Resolved', patient_id_restricted: 'MOCK-PT-0006' },
      { infection_id: 'INF-Q2-002', infection_type: 'MRSA', classification: 'Healthcare-associated (HAI)', onset_date: '2026-04-21', reported_to_state: true, cluster_flag: 'CLUSTER-001', status: 'Resolved', patient_id_restricted: 'MOCK-PT-0023' },
      { infection_id: 'INF-Q2-003', infection_type: 'MRSA', classification: 'Healthcare-associated (HAI)', onset_date: '2026-05-02', reported_to_state: true, cluster_flag: 'CLUSTER-001', status: 'Resolved', patient_id_restricted: 'MOCK-PT-0041' },
      { infection_id: 'INF-Q2-004', infection_type: 'UTI', classification: 'Healthcare-associated (HAI)', onset_date: '2026-05-18', reported_to_state: true, status: 'Resolved', patient_id_restricted: 'MOCK-PT-0055' },
      { infection_id: 'INF-Q2-005', infection_type: 'Wound Infection', classification: 'Healthcare-associated (HAI)', onset_date: '2026-06-07', reported_to_state: true, status: 'Resolved', patient_id_restricted: 'MOCK-PT-0072' },
      { infection_id: 'INF-Q2-006', infection_type: 'Pneumonia', classification: 'Community-acquired', onset_date: '2026-06-12', reported_to_state: false, status: 'Resolved', patient_id_restricted: 'MOCK-PT-0088' },
      { infection_id: 'INF-Q2-007', infection_type: 'URI/Influenza', classification: 'Community-acquired', onset_date: '2026-06-24', reported_to_state: false, status: 'Resolved', patient_id_restricted: 'MOCK-PT-0094' },
    ],

    // 40 feeder audits — simplified as 10 batches × complete (expand IDs as needed)
    feeder_audits: Array.from({ length: 40 }, (_, i) => {
      const n = i + 1;
      const domain =
        n <= 12 ? 'clinical' : n <= 20 ? 'compliance' : n <= 26 ? 'qapi' : n <= 30 ? 'hr' : n <= 35 ? 'risk' : 'it';
      const wfPrefix =
        domain === 'clinical' ? 'CL-WF' : domain === 'compliance' ? 'CO-WF' : domain === 'qapi' ? 'QA-WF' : domain === 'hr' ? 'HR-WF' : domain === 'risk' ? 'RM-WF' : 'IT-WF';
      return {
        audit_id: `AUD-Q2-${String(n).padStart(3, '0')}`,
        workflow_id: `${wfPrefix}-${20 + (n % 10)}`,
        domain: domain as 'clinical' | 'compliance' | 'qapi' | 'hr' | 'risk' | 'it',
        audit_name: `Q2 feeder audit ${n}`,
        findings_count: n % 3,
        status: 'COMPLETE' as const,
        signed_by: 'MOCK-CLIN-0003',
        signed_at: '2026-06-30T00:00:00Z',
        source_pointer: `SRC-AUD-001#${n}`,
      };
    }),

    pip_triggers: [
      { trigger_id: 'PIP-T-001', trigger_type: 'threshold', source_indicator: 'Documentation-audit compliance <95%', state: 'PENDING_AUTHORIZED_REVIEW', source_record_ids: ['QA-FM-025'] },
      { trigger_id: 'PIP-T-002', trigger_type: 'threshold', source_indicator: 'AUD-CL-002 audit finding', state: 'PENDING_AUTHORIZED_REVIEW', source_record_ids: ['QA-FM-025'] },
      { trigger_id: 'PIP-T-003', trigger_type: 'cluster', source_indicator: 'CLUSTER-001 MRSA HAI x3', state: 'TRIGGERED', linked_pip_id: 'PIP-Q2-001', source_record_ids: ['QA-FM-027'] },
      { trigger_id: 'PIP-T-004', trigger_type: 'threshold', source_indicator: 'Adverse event rate 7.0 per 100', state: 'TRIGGERED', linked_pip_id: 'PIP-Q2-002', source_record_ids: ['QA-FM-026'] },
      { trigger_id: 'PIP-T-005', trigger_type: 'threshold', source_indicator: 'Complaint rate 7.0 per 100', state: 'TRIGGERED', linked_pip_id: 'PIP-Q2-003', source_record_ids: ['Complaint log'] },
      { trigger_id: 'PIP-T-006', trigger_type: 'threshold', source_indicator: 'Med-reconciliation <95% 3 months', state: 'TRIGGERED', linked_pip_id: 'PIP-Q2-005', source_record_ids: ['QA-FM-025'] },
      { trigger_id: 'PIP-T-007', trigger_type: 'trend', source_indicator: 'Missed-visit compliance worsening', state: 'TRIGGERED', linked_pip_id: 'PIP-Q2-006', source_record_ids: ['Visit log'] },
      { trigger_id: 'PIP-T-008', trigger_type: 'threshold', source_indicator: 'Documentation defect rate >5%', state: 'TRIGGERED', linked_pip_id: 'PIP-Q2-007', source_record_ids: ['QA-FM-025'] },
    ],

    pips: [
      { pip_id: 'PIP-Q2-001', trigger_indicator: 'Infection event rate ≥2%', trigger_date: '2026-05-02', status: 'Active — In Progress', owner: 'DON / Infection Control', remeasurement_date: '2026-09-30' },
      { pip_id: 'PIP-Q2-002', trigger_indicator: 'Adverse event rate >5 per 100', trigger_date: '2026-05-07', status: 'Active — In Progress', owner: 'Clinical Manager', remeasurement_date: '2026-09-30' },
      { pip_id: 'PIP-Q2-003', trigger_indicator: 'Complaint rate >3 per 100', trigger_date: '2026-05-07', status: 'Active — In Progress', owner: 'Compliance Officer', remeasurement_date: '2026-09-30' },
      { pip_id: 'PIP-Q2-004', trigger_indicator: 'OASIS accuracy 3 months below', trigger_date: '2026-05-07', status: 'Active — Governing Body Enhanced Intervention', owner: 'Governing Body / DON', remeasurement_date: '2026-07-31' },
      { pip_id: 'PIP-Q2-005', trigger_indicator: 'Med-reconciliation 3 months below', trigger_date: '2026-05-07', status: 'Active — PIP Charter within 14 days', owner: 'Governing Body / Clinical Manager', remeasurement_date: '2026-05-21' },
      { pip_id: 'PIP-Q2-006', trigger_indicator: 'Missed visit rate worsening', trigger_date: '2026-05-07', status: 'Active — CAP with monthly reporting', owner: 'Governing Body / Scheduler' },
      { pip_id: 'PIP-Q2-007', trigger_indicator: 'Discharge documentation 3 months below', trigger_date: '2026-05-07', status: 'Active — Process redesign review', owner: 'Governing Body / QA Coordinator', remeasurement_date: '2026-07-31' },
      { pip_id: 'PIP-Q2-008', trigger_indicator: 'Clinician documentation pattern', trigger_date: '2026-05-07', status: 'Active — PENDING AUTHORIZED REVIEW', owner: 'Compliance Officer' },
    ],

    kpi_observations: [
      { metric_id: 'KPI-HOSP', indicator: 'Acute-care hospitalization rate', month: 'Q2', numerator: 7, denominator: 100, rate: 7.0, target: 8.0, status: 'MET' },
      { metric_id: 'KPI-AE', indicator: 'Adverse event rate per 100', month: 'Q2', numerator: 7, denominator: 100, rate: 7.0, target: 5.0, status: 'NOT_MET' },
      { metric_id: 'KPI-INF', indicator: 'Infection event rate (HAI)', month: 'Q2', numerator: 5, denominator: 100, rate: 5.0, target: 2.0, status: 'NOT_MET' },
      { metric_id: 'KPI-DOC', indicator: 'Documentation-audit compliance', month: 'Q2', numerator: 128, denominator: 140, rate: 91.4, target: 95.0, status: 'NOT_MET' },
      { metric_id: 'KPI-MEDREC', indicator: 'Medication-reconciliation compliance', month: 'Q2', numerator: 125, denominator: 140, rate: 89.3, target: 95.0, status: 'NOT_MET' },
      { metric_id: 'KPI-MISS', indicator: 'Missed-visit compliance', month: 'Q2', numerator: 126, denominator: 150, rate: 84.0, target: 95.0, status: 'NOT_MET' },
      { metric_id: 'KPI-CMP', indicator: 'Complaint rate per 100', month: 'Q2', numerator: 7, denominator: 100, rate: 7.0, target: 3.0, status: 'NOT_MET' },
      { metric_id: 'KPI-ATT', indicator: 'QAPI committee attendance rate', month: 'Q2', numerator: 8, denominator: 8, rate: 100.0, target: 90.0, status: 'MET' },
    ],

    attendance: [
      { meeting_id: 'qapi_meeting-20260507-08', meeting_date: '2026-05-07', role: 'Director of Nursing (Chair)', name_or_clinician_id: 'MOCK-CLIN-0001', presence: 'Present' },
      { meeting_id: 'qapi_meeting-20260507-08', meeting_date: '2026-05-07', role: 'Clinical Manager', name_or_clinician_id: 'MOCK-CLIN-0002', presence: 'Present' },
      { meeting_id: 'qapi_meeting-20260507-08', meeting_date: '2026-05-07', role: 'Compliance Officer', name_or_clinician_id: 'MOCK-CLIN-0003', presence: 'Present' },
      { meeting_id: 'qapi_meeting-20260507-08', meeting_date: '2026-05-07', role: 'Medical Director', name_or_clinician_id: 'MOCK-MD-001', presence: 'Present' },
      { meeting_id: 'qapi_meeting-20260507-08', meeting_date: '2026-05-07', role: 'Administrator', name_or_clinician_id: 'MOCK-CLIN-0031', presence: 'Present' },
      { meeting_id: 'qapi_meeting-20260507-08', meeting_date: '2026-05-07', role: 'QA Coordinator', name_or_clinician_id: 'MOCK-CLIN-0004', presence: 'Present' },
      { meeting_id: 'qapi_meeting-20260507-08', meeting_date: '2026-05-07', role: 'QAPI Chair (Alt)', name_or_clinician_id: 'MOCK-CLIN-QAPI', presence: 'Present' },
      { meeting_id: 'qapi_meeting-20260507-08', meeting_date: '2026-05-07', role: 'Governing Body Representative', name_or_clinician_id: 'MOCK-GB-001', presence: 'Present' },
    ],

    source_register: [
      { source_label: 'SRC-CEN-001', filename_or_ref: 'census_q2', class: 'Raw source', location: 'ingest', period: 'quarter', use: 'population', purpose: 'Census reconciliation' },
      { source_label: 'SRC-CMP-001', filename_or_ref: 'complaint_log_q2', class: 'Raw source', location: 'ingest', period: 'quarter', use: 'B12', purpose: 'Complaint/grievance' },
      { source_label: 'SRC-AE-001', filename_or_ref: 'ae_log_q2', class: 'Raw source', location: 'ingest', period: 'quarter', use: 'B10', purpose: 'Adverse events' },
      { source_label: 'SRC-INF-001', filename_or_ref: 'infection_log_q2', class: 'Raw source', location: 'ingest', period: 'quarter', use: 'B11', purpose: 'Infection surveillance' },
      { source_label: 'SRC-AUD-001', filename_or_ref: 'feeder_audits_q2', class: 'Completed audit register', location: 'ingest', period: 'quarter', use: 'B5', purpose: '40 feeder audits' },
    ],
  };
}
