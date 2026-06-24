import type { BradSourceSnapshot } from './sourceSnapshot.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Representative source snapshots for the MVP UI. These stand in for the
   read-only CES/event/policy view Brad would assemble from source-of-truth
   data. They are READ-ONLY inputs — Brad generates append-only objects FROM
   them and never writes back. Swap for live CES data when wired.
   ═══════════════════════════════════════════════════════════════════════════ */

const DEMO: Record<string, BradSourceSnapshot> = {
  'evt-qapi-2026-q2': {
    eventId: 'evt-qapi-2026-q2',
    eventTitle: 'Q2 2026 QAPI Committee Meeting',
    eventType: 'qapi',
    workflowId: 'wf-qapi-quarterly',
    meetingDateTime: '2026-06-25T15:00:00Z',
    attendees: ['Administrator', 'Clinical Director', 'QAPI Coordinator'],
    requiredRoles: ['Administrator', 'Clinical Director', 'QAPI Coordinator'],
    agenda: ['Review prior minutes', 'Quality metrics', 'Open PIPs', 'Incident/adverse events', 'Infection control'],
    requiredFormIds: ['form-qapi-attendance', 'form-qapi-minutes'],
    policyIds: ['pol-qapi-001', 'pol-qapi-002'],
    tasks: [
      { id: 't1', title: 'Compile quarterly metrics', status: 'complete' },
      { id: 't2', title: 'Summarize incident log', status: 'open' },
      { id: 't3', title: 'Update PIP tracker', status: 'in_progress' },
    ],
    evidenceItemIds: ['evid-metrics-q2'],
    signatures: [
      { role: 'Administrator', signed: false },
      { role: 'Clinical Director', signed: false },
    ],
    followUps: ['Distribute approved minutes within 7 days'],
    metrics: [
      { name: 'Acute care hospitalization', value: '12%', target: '<15%' },
      { name: 'Timely initiation of care', value: '96%', target: '>95%' },
    ],
    pips: [{ id: 'pip-1', title: 'Reduce patient falls', status: 'open' }],
    incidents: [{ id: 'inc-1', type: 'fall', severity: 'moderate', summary: 'Patient fall during transfer, no injury' }],
    infectionSafetyTrends: ['No infection outbreaks this quarter'],
    priorMinutesCarryover: ['Follow up on medication reconciliation workflow'],
    nextMeetingDate: '2026-09-24',
    capturedAt: '2026-06-24T12:00:00Z',
  },
  'evt-gen-2026-staff': {
    eventId: 'evt-gen-2026-staff',
    eventTitle: 'June 2026 All-Staff Operations Meeting',
    eventType: 'general',
    workflowId: 'wf-monthly-ops',
    meetingDateTime: '2026-06-26T17:00:00Z',
    attendees: ['Administrator', 'Branch Managers'],
    requiredRoles: ['Administrator', 'Branch Manager'],
    agenda: ['Operational KPIs', 'Onboarding pipeline', 'Open audit items'],
    requiredFormIds: ['form-staff-attendance'],
    policyIds: ['pol-ops-010'],
    tasks: [{ id: 't1', title: 'Pull KPI dashboard', status: 'complete' }],
    evidenceItemIds: [],
    signatures: [{ role: 'Administrator', signed: false }],
    followUps: ['Publish action items to the team board'],
    capturedAt: '2026-06-24T12:00:00Z',
  },
};

export function listDemoEventIds(): Array<{ eventId: string; eventTitle: string; eventType: string }> {
  return Object.values(DEMO).map((s) => ({ eventId: s.eventId, eventTitle: s.eventTitle, eventType: s.eventType }));
}

export function getDemoSnapshot(eventId?: string): BradSourceSnapshot {
  if (eventId && DEMO[eventId]) return DEMO[eventId];
  return DEMO['evt-qapi-2026-q2'];
}
