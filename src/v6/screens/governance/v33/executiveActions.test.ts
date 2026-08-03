// Structural + behavioral guards for the executive-readiness review fixes
// (blockers 3, 4, 5, 7). Source-scan style follows complianceGates.test.ts.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  OVERSIGHT_PROVENANCE_LEGEND,
  OVERSIGHT_QUARTERS,
  type OversightProvenance,
} from './oversightProjection';
import {
  addAgendaItem,
  clearAgendaQueue,
  listAgendaItems,
  removeAgendaItem,
  agendaQueueStorageKey,
  LEGACY_AGENDA_QUEUE_STORAGE_KEY,
  purgeLegacyAgendaQueue,
} from './agendaQueue';

const here = path.dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(path.join(here, 'MyJourneyApp.tsx'), 'utf8');
const clientSource = readFileSync(path.join(here, 'integrations', 'calendarDriveClient.ts'), 'utf8');

const VALID_PROVENANCE: OversightProvenance[] = [
  'Source recovered',
  'Calculated from recovered source',
  'Supplemental synthetic UAT',
  'Management-reported and unresolved',
  'Not recovered',
];

describe('blocker 3 — no dead executive actions', () => {
  it('removed the handler-less DECISION_TO_AGENDA_ACTIONS button map', () => {
    expect(appSource).not.toContain('DECISION_TO_AGENDA_ACTIONS');
  });

  it('never renders a bare enabled type="button" without a handler or disabled state', () => {
    // Every raw `type="button"` button in the file must carry onClick or disabled.
    const matches = appSource.match(/<button[^>]*type="button"[^>]*>/g) ?? [];
    for (const tag of matches) {
      expect(tag.includes('onClick') || tag.includes('disabled'), `dead button tag: ${tag}`).toBe(true);
    }
  });

  it('workflow "Add to agenda" resolves the linked decision, not DECISIONS[0]', () => {
    expect(appSource).not.toContain('onDecision(DECISIONS[0])>Add to agenda');
    expect(appSource).toContain('decision.workflowIds.includes(selected.workflowId)');
    expect(appSource).toContain('No board decision references this workflow');
  });

  it('scheduler posts through the real Calendar/CES client, not an invented body shape', () => {
    // The HTTP call now lives in the integration client; the screen must use it
    // rather than hand-rolling a fetch with a made-up payload.
    expect(appSource).toContain('createAdHocMeeting(');
    expect(appSource).not.toContain('startsAt:'); // the old invented field
    expect(clientSource).toContain("fetch('/api/calendar/events'");
    expect(clientSource).toContain('Idempotency-Key');
    // Real server contract (server/mappers.ts PlannerEventPayload).
    expect(clientSource).toContain('event_id:');
    expect(clientSource).toContain('date:');
    expect(clientSource).toContain('time:');
  });

  it('a 2xx that is not actually a created Google event fails closed', () => {
    // server/sync/eventSync.ts SyncResult can report ok:false / action:'failed'
    // with a 200, and google_event_id may be absent.
    expect(clientSource).toContain("wire.ok === false || wire.action === 'failed' || !googleEventId");
    expect(clientSource).toContain('No event was created.');
  });

  it('reachability is probed, never asserted as a fixed build-time claim', () => {
    expect(clientSource).toContain("fetch('/api/calendar/healthz'");
    expect(clientSource).toContain("fetch('/api/calendar/evidence/health'");
    expect(appSource).toContain('probeCalendarHealth(');
    expect(appSource).toContain('probeDriveHealth(');
    // The old blanket falsehood must be gone.
    expect(appSource).not.toContain('not connected in this build');
  });

  it('Google links come from the server, never constructed in the browser', () => {
    expect(appSource).not.toContain('https://calendar.google.com/calendar/event?eid=');
    expect(clientSource).toContain('resolveEventHtmlLink');
    expect(appSource).toContain('state.htmlLink');
  });

  it('Drive reference documents use the real listing endpoint and server links', () => {
    expect(clientSource).toContain("fetch(`/api/calendar/intake/drive-folder");
    expect(appSource).toContain('listDriveFolder(');
    expect(appSource).toContain('file.webViewLink');
  });

  it('evidence actions fail closed for Drive and signed export', () => {
    expect(appSource).toContain('No role-controlled Drive link is attached to this package');
    expect(appSource).toContain('Signed export requires the connected evidence service');
    expect(appSource).toContain("window.location.assign('/evidence')");
  });
});

describe('blocker 4 — deterministic readiness brief', () => {
  it('renders the verified brief title and non-Brad caption', () => {
    expect(appSource).toContain('Verified Governing Body Readiness Brief');
    expect(appSource).toContain('Deterministically assembled from current portal records. Brad narrative generation is not connected.');
    expect(appSource).not.toContain("BRAD'S GOVERNING BODY BRIEF");
  });
});

describe('blocker 5 — oversight projection provenance', () => {
  it('projects five quarters (Q1–Q4 + Annual) from the normalized source', () => {
    expect(OVERSIGHT_QUARTERS.map((quarter) => quarter.id)).toEqual(['Q1', 'Q2', 'Q3', 'Q4', 'Annual']);
  });

  it('every displayed value carries a valid provenance label', () => {
    for (const quarter of OVERSIGHT_QUARTERS) {
      for (const value of [quarter.changed, quarter.improved, quarter.worsened, quarter.boardDecision]) {
        expect(VALID_PROVENANCE).toContain(value.provenance);
      }
      for (const kpi of quarter.kpis) {
        expect(VALID_PROVENANCE).toContain(kpi.provenance);
        expect(VALID_PROVENANCE).toContain(kpi.priorQuarterProvenance);
      }
      for (const item of quarter.lifecycle) expect(VALID_PROVENANCE).toContain(item.provenance);
      for (const issue of quarter.dataIssues) expect(VALID_PROVENANCE).toContain(issue.provenance);
    }
  });

  it('Q3/Q4 are explicitly Not recovered — nothing invented', () => {
    for (const id of ['Q3', 'Q4'] as const) {
      const quarter = OVERSIGHT_QUARTERS.find((candidate) => candidate.id === id)!;
      expect(quarter.normalization).toBe('pending');
      expect(quarter.kpis).toHaveLength(0);
      expect(quarter.changed.provenance).toBe('Not recovered');
    }
  });

  it('normalized quarters carry KPIs recovered/calculated from source', () => {
    const q1 = OVERSIGHT_QUARTERS[0];
    expect(q1.kpis.length).toBeGreaterThan(0);
    expect(q1.kpis.every((kpi) => kpi.provenance === 'Source recovered' || kpi.provenance === 'Calculated from recovered source')).toBe(true);
  });

  it('the legend covers the full provenance union', () => {
    expect(OVERSIGHT_PROVENANCE_LEGEND.map((entry) => entry.label).sort()).toEqual([...VALID_PROVENANCE].sort());
  });
});

describe('blocker 7 — handbook explanation layering', () => {
  it('collapses detailed findings behind the exact disclosure label', () => {
    expect(appSource).toContain('View detailed legal and compliance findings');
    expect(appSource).toContain('context.executiveSummary.map');
    expect(appSource).toContain('2022 source handbook is not attached in this build');
    expect(appSource).toContain("'handbook-2026-counsel-review-draft'");
  });
});

const learnerA = 'learner-a';
const learnerB = 'learner-b';

describe('agenda queue (draft, preview-labeled, persisted)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAgendaQueue(learnerA);
  });

  it('adds, persists, dedupes, and removes items', () => {
    const added = addAgendaItem(learnerA, { decisionId: 'GB-READINESS-005', title: 'Handbook', source: 'test' });
    expect(added.ok).toBe(true);
    expect(listAgendaItems(learnerA)).toHaveLength(1);
    expect(window.localStorage.getItem(agendaQueueStorageKey(learnerA))).toContain('GB-READINESS-005');

    const duplicate = addAgendaItem(learnerA, { decisionId: 'GB-READINESS-005', title: 'Handbook', source: 'test' });
    expect(duplicate.ok).toBe(false);
    expect(listAgendaItems(learnerA)).toHaveLength(1);

    if (added.ok) removeAgendaItem(learnerA, added.item.id);
    expect(listAgendaItems(learnerA)).toHaveLength(0);
  });
});

describe('agenda queue is learner-scoped (shared-browser isolation)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    clearAgendaQueue(learnerA);
    clearAgendaQueue(learnerB);
  });

  it("learner A's queued items are invisible to learner B, and vice versa", () => {
    addAgendaItem(learnerA, { decisionId: 'GB-A-001', title: 'A item', source: 'test' });
    expect(listAgendaItems(learnerA).map((i) => i.decisionId)).toEqual(['GB-A-001']);
    expect(listAgendaItems(learnerB)).toHaveLength(0);

    addAgendaItem(learnerB, { decisionId: 'GB-B-001', title: 'B item', source: 'test' });
    expect(listAgendaItems(learnerB).map((i) => i.decisionId)).toEqual(['GB-B-001']);
    expect(listAgendaItems(learnerA).map((i) => i.decisionId)).toEqual(['GB-A-001']);

    // Same decision id is NOT a duplicate across learners.
    expect(addAgendaItem(learnerB, { decisionId: 'GB-A-001', title: 'A item', source: 'test' }).ok).toBe(true);
    expect(listAgendaItems(learnerA)).toHaveLength(1);
    expect(listAgendaItems(learnerB)).toHaveLength(2);
  });

  it('persists under gb-v3:preview:agenda:{learnerId} and never under the legacy global key', () => {
    addAgendaItem(learnerA, { decisionId: 'GB-A-002', title: 'A item', source: 'test' });
    expect(agendaQueueStorageKey(learnerA)).toBe('gb-v3:preview:agenda:learner-a');
    expect(window.localStorage.getItem('gb-v3:preview:agenda:learner-a')).toContain('GB-A-002');
    expect(window.localStorage.getItem(LEGACY_AGENDA_QUEUE_STORAGE_KEY)).toBeNull();
  });

  it('never adopts a pre-existing legacy global queue into a learner namespace', () => {
    window.localStorage.setItem(
      LEGACY_AGENDA_QUEUE_STORAGE_KEY,
      JSON.stringify([{ id: 'legacy-1', decisionId: 'GB-LEGACY', title: 'Legacy', addedAt: 'x', source: 'legacy' }]),
    );
    clearAgendaQueue(learnerB);
    expect(listAgendaItems(learnerB)).toHaveLength(0);
    purgeLegacyAgendaQueue();
    expect(window.localStorage.getItem(LEGACY_AGENDA_QUEUE_STORAGE_KEY)).toBeNull();
  });
});
