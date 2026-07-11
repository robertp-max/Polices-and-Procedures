/**
 * WP-1.6 — Event Selector pure-logic + render tests.
 *
 * - Compatibility filtering excludes non-matching families (ID match, not title regex)
 * - Month navigation ranges cross year boundaries correctly
 * - Card model maps reporting period + ids faithfully; uses 'unknown' (not 0/false)
 * - No date-window clamp: 2027 events render when navigated to
 * - Blocked/completed respect packet provider vs event-level fallback
 * - Rendered calendar shows Required approvals/signers + full PacketLifecycleStatus list
 */

import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import type { CesCalendarEvent } from '@/policy/ces/cesViewProjections';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { PacketLifecycleStatus } from '@/policy/packets/contracts';
import {
  EventSelectorCalendar,
  type EventSelectorCalendarProps,
} from './EventSelectorCalendar';
import {
  formatReportingPeriod,
  projectEventCardModel,
  resolveEventDate,
  type EventCardModel,
} from './eventCardModel';
import { ALLOWED_TRANSITIONS } from '@/policy/packets/contracts';
import {
  buildBlockedPredicate,
  buildCompletedPredicate,
  filterEventsInVisibleRange,
  getVisibleRange,
  isEventCompatibleWithTemplate,
  navigateNext,
  navigatePrevious,
  PACKET_LIFECYCLE_STATUS_VALUES,
  type CalendarAnchor,
  type FilterableEvent,
} from './eventFilters';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeCes(partial: Partial<CesCalendarEvent> & Pick<CesCalendarEvent, 'label' | 'day' | 'owner'>): CesCalendarEvent {
  return {
    progress: 0,
    tone: 'teal',
    ...partial,
  };
}

function makeReg(
  partial: Partial<RegulatoryEvent> & Pick<RegulatoryEvent, 'id' | 'title' | 'date'>,
): RegulatoryEvent {
  return {
    domain: 'QAPI',
    cadence: 'Quarterly',
    urgency: 'scheduled',
    policyRefs: [],
    owner: 'MOCK-OWNER',
    ownerRole: 'Compliance Officer',
    processFlow: [],
    requiredForms: [],
    ...partial,
  };
}

function makeFilterable(partial: Partial<FilterableEvent> & Pick<FilterableEvent, 'eventInstanceId' | 'eventTitle' | 'eventDate'>): FilterableEvent {
  return {
    reportingPeriodStart: null,
    reportingPeriodEnd: null,
    eventFamilyId: null,
    workflowId: null,
    workflowInstanceId: 'unknown',
    owner: 'MOCK-OWNER',
    eventStatus: 'scheduled',
    packetStatus: 'unknown',
    requiredFormCompletion: 'unknown',
    evidenceCompleteness: 'unknown',
    approvalStatus: 'unknown',
    signatureStatus: 'unknown',
    blockerCount: 'unknown',
    requiredApprovals: 'unknown',
    requiredSigners: 'unknown',
    domain: null,
    cadence: null,
    regulatoryDriver: null,
    workflowStatus: 'unknown',
    sourceDate: partial.eventDate,
    day: null,
    month: null,
    year: null,
    ...partial,
  };
}

// ─── Compatibility ───────────────────────────────────────────────────────────

describe('template ↔ event compatibility', () => {
  it('excludes non-matching event families (ID match, not title regex)', () => {
    const template = {
      compatible_event_family_ids: ['qapi_meeting'],
      compatible_workflow_ids: [] as string[],
    };

    expect(
      isEventCompatibleWithTemplate(
        { eventFamilyId: 'qapi_meeting', workflowId: 'QA-WF-03' },
        template,
      ),
    ).toBe(true);

    expect(
      isEventCompatibleWithTemplate(
        { eventFamilyId: 'governing_body_meeting', workflowId: 'GV-WF-01' },
        template,
      ),
    ).toBe(false);

    // Title-like strings must NOT match via regex — only exact family IDs
    expect(
      isEventCompatibleWithTemplate(
        { eventFamilyId: 'QAPI Committee — Q2 Data Review', workflowId: null },
        template,
      ),
    ).toBe(false);

    // eventSubType alias for family
    expect(
      isEventCompatibleWithTemplate(
        { eventSubType: 'qapi_meeting', workflowId: null },
        template,
      ),
    ).toBe(true);
  });

  it('matches workflow ids when family list is empty', () => {
    const template = {
      compatibleEventFamilyIds: [] as string[],
      compatibleWorkflowIds: ['QA-WF-03', 'CL-WF-26'],
    };
    expect(
      isEventCompatibleWithTemplate({ eventFamilyId: 'anything', workflowId: 'QA-WF-03' }, template),
    ).toBe(true);
    expect(
      isEventCompatibleWithTemplate({ eventFamilyId: 'anything', workflowId: 'OTHER' }, template),
    ).toBe(false);
  });

  it('requires both family and workflow when both lists are non-empty', () => {
    const template = {
      compatible_event_family_ids: ['qapi_meeting'],
      compatible_workflow_ids: ['QA-WF-03'],
    };
    expect(
      isEventCompatibleWithTemplate(
        { eventFamilyId: 'qapi_meeting', workflowId: 'QA-WF-03' },
        template,
      ),
    ).toBe(true);
    expect(
      isEventCompatibleWithTemplate(
        { eventFamilyId: 'qapi_meeting', workflowId: 'OTHER' },
        template,
      ),
    ).toBe(false);
  });

  it('passes all events when no template / empty compatibility lists', () => {
    expect(isEventCompatibleWithTemplate({ eventFamilyId: 'x' }, null)).toBe(true);
    expect(
      isEventCompatibleWithTemplate(
        { eventFamilyId: 'x' },
        { compatible_event_family_ids: [], compatible_workflow_ids: [] },
      ),
    ).toBe(true);
  });
});

// ─── Month navigation / ranges ───────────────────────────────────────────────

describe('month navigation ranges', () => {
  it('produces full-month inclusive ranges', () => {
    const anchor: CalendarAnchor = { year: 2026, month: 5, day: 15 };
    const range = getVisibleRange('month', anchor);
    expect(range.start).toBe('2026-05-01');
    expect(range.end).toBe('2026-05-31');
  });

  it('crosses year boundaries on previous (Jan → Dec prior year)', () => {
    const jan: CalendarAnchor = { year: 2026, month: 1, day: 10 };
    const prev = navigatePrevious('month', jan);
    expect(prev).toEqual({ year: 2025, month: 12, day: 10 });
    const range = getVisibleRange('month', prev);
    expect(range.start).toBe('2025-12-01');
    expect(range.end).toBe('2025-12-31');
  });

  it('crosses year boundaries on next (Dec → Jan next year)', () => {
    const dec: CalendarAnchor = { year: 2026, month: 12, day: 20 };
    const next = navigateNext('month', dec);
    expect(next).toEqual({ year: 2027, month: 1, day: 20 });
    const range = getVisibleRange('month', next);
    expect(range.start).toBe('2027-01-01');
    expect(range.end).toBe('2027-01-31');
  });

  it('week view spans Sun–Sat and may cross months', () => {
    // 2026-01-01 is a Thursday → week is Dec 28 2025 – Jan 3 2026
    const anchor: CalendarAnchor = { year: 2026, month: 1, day: 1 };
    const range = getVisibleRange('week', anchor);
    expect(range.start).toBe('2025-12-28');
    expect(range.end).toBe('2026-01-03');
  });
});

// ─── Card model projection ───────────────────────────────────────────────────

describe('event card model projection', () => {
  it('maps reporting period + ids faithfully', () => {
    const ces = makeCes({
      id: 'unit-1',
      label: 'Fallback label',
      day: 21,
      month: 5,
      owner: 'MOCK-UNIT-OWNER',
      sourceEventId: 'evt-qapi-q2-2026',
      sourceDate: '2026-05-21',
      workflowId: undefined,
      workflow: 'QA-WF-03',
    });
    const reg = makeReg({
      id: 'evt-qapi-q2-2026',
      title: 'Q2 QAPI Committee',
      date: '2026-05-21',
      eventSubType: 'qapi_meeting',
      workflowId: 'QA-WF-03',
      reportingPeriodStart: '2026-04-01',
      reportingPeriodEnd: '2026-06-30',
      owner: 'MOCK-RN-A',
      urgency: 'due-soon',
    });

    const card = projectEventCardModel({
      calendarEvent: ces,
      regulatoryEvent: reg,
      fallbackYear: 2026,
    });

    expect(card.eventTitle).toBe('Q2 QAPI Committee');
    expect(card.eventDate).toBe('2026-05-21');
    expect(card.reportingPeriodStart).toBe('2026-04-01');
    expect(card.reportingPeriodEnd).toBe('2026-06-30');
    expect(card.eventFamilyId).toBe('qapi_meeting');
    expect(card.eventInstanceId).toBe('evt-qapi-q2-2026');
    expect(card.workflowId).toBe('QA-WF-03');
    expect(card.owner).toBe('MOCK-RN-A');
    expect(card.eventStatus).toBe('due-soon');
    expect(formatReportingPeriod(card.reportingPeriodStart, card.reportingPeriodEnd)).toBe(
      '2026-04-01 → 2026-06-30',
    );
  });

  it("uses 'unknown' (not 0/false) for absent packet/status fields", () => {
    const ces = makeCes({
      id: 'evt-bare',
      label: 'Bare event',
      day: 3,
      month: 3,
      owner: 'MOCK-OWNER',
      sourceDate: '2026-03-03',
    });
    const card = projectEventCardModel({
      calendarEvent: ces,
      regulatoryEvent: null,
      packetStatus: null,
      fallbackYear: 2026,
    });

    expect(card.packetStatus).toBe('unknown');
    expect(card.evidenceCompleteness).toBe('unknown');
    expect(card.approvalStatus).toBe('unknown');
    expect(card.signatureStatus).toBe('unknown');
    expect(card.blockerCount).toBe('unknown');
    expect(card.workflowInstanceId).toBe('unknown');
    expect(card.requiredFormCompletion).toBe('unknown');
    expect(card.requiredApprovals).toBe('unknown');
    expect(card.requiredSigners).toBe('unknown');

    // Never invent numeric zero / boolean false for those fields
    expect(card.blockerCount).not.toBe(0);
    expect(card.evidenceCompleteness).not.toBe(0);
    expect(card.packetStatus).not.toBe(false as unknown as string);
  });

  it('derives required approvals and signers from event definition', () => {
    const ces = makeCes({
      id: 'evt-with-roles',
      label: 'Role event',
      day: 10,
      month: 5,
      owner: 'MOCK-OWNER',
      sourceDate: '2026-05-10',
    });
    const reg = makeReg({
      id: 'evt-with-roles',
      title: 'Role event',
      date: '2026-05-10',
      approvals: [
        {
          id: 'ap-1',
          targetKind: 'event',
          targetLabel: 'Packet',
          approverRole: 'MOCK-APPROVER-ROLE',
          required: true,
        },
        {
          id: 'ap-2',
          targetKind: 'minutes',
          targetLabel: 'Minutes',
          approverRole: 'MOCK-OPTIONAL-ROLE',
          required: false,
        },
      ],
      minutes: {
        status: 'missing',
        dueOffsetDays: 3,
        signOffRoles: ['MOCK-SIGNER-A', 'MOCK-SIGNER-B'],
      },
    });
    const card = projectEventCardModel({ calendarEvent: ces, regulatoryEvent: reg });
    expect(card.requiredApprovals).toEqual(['MOCK-APPROVER-ROLE']);
    expect(card.requiredSigners).toEqual(['MOCK-SIGNER-A', 'MOCK-SIGNER-B']);
  });

  it('surfaces packet snapshot fields when provided (still no invention)', () => {
    const ces = makeCes({
      id: 'evt-1',
      label: 'Event',
      day: 1,
      month: 6,
      owner: 'MOCK-OWNER',
      sourceDate: '2026-06-01',
    });
    const card = projectEventCardModel({
      calendarEvent: ces,
      packetStatus: {
        packetStatus: 'DRAFT_GENERATED',
        blockerCount: 2,
        evidenceCompleteness: 40,
        approvalStatus: 'pending',
        signatureStatus: 'not_started',
        workflowInstanceId: 'wf-inst-9',
      },
    });
    expect(card.packetStatus).toBe('DRAFT_GENERATED');
    expect(card.blockerCount).toBe(2);
    expect(card.evidenceCompleteness).toBe(40);
    expect(card.workflowInstanceId).toBe('wf-inst-9');
  });

  it('resolveEventDate prefers regulatory date, then sourceDate, then y/m/d', () => {
    const ces = makeCes({
      label: 'X',
      day: 15,
      month: 4,
      owner: 'MOCK-OWNER',
      sourceDate: '2026-04-10',
    });
    expect(
      resolveEventDate(ces, makeReg({ id: 'r', title: 'T', date: '2026-04-21' }), 2026),
    ).toBe('2026-04-21');
    expect(resolveEventDate(ces, null, 2026)).toBe('2026-04-10');
    expect(
      resolveEventDate(
        makeCes({ label: 'Y', day: 7, month: 2, owner: 'MOCK-OWNER' }),
        null,
        2027,
      ),
    ).toBe('2027-02-07');
  });
});

// ─── Blocked / completed predicates (F2) ─────────────────────────────────────

describe('blocked and completed predicates (provider vs event-level)', () => {
  const eventBlocked = makeFilterable({
    eventInstanceId: 'e-blocked',
    eventTitle: 'Blocked event',
    eventDate: '2026-05-01',
    eventStatus: 'blocked',
  });
  const packetBlocked = makeFilterable({
    eventInstanceId: 'e-pkt-blocked',
    eventTitle: 'Packet blocked',
    eventDate: '2026-05-02',
    eventStatus: 'on-track',
    packetStatus: 'BLOCKED',
    packetSnapshot: { isBlocked: true, packetStatus: 'BLOCKED' },
  });
  const eventComplete = makeFilterable({
    eventInstanceId: 'e-complete',
    eventTitle: 'Complete event',
    eventDate: '2026-05-03',
    eventStatus: 'complete',
  });
  const packetComplete = makeFilterable({
    eventInstanceId: 'e-pkt-complete',
    eventTitle: 'Packet complete',
    eventDate: '2026-05-04',
    eventStatus: 'on-track',
    packetSnapshot: { isCompleted: true, packetStatus: 'LOCKED' },
  });

  it('without provider: uses event-level urgency only', () => {
    const blocked = buildBlockedPredicate(true, false);
    expect(blocked(eventBlocked)).toBe(true);
    expect(blocked(packetBlocked)).toBe(false); // event status is on-track

    const completed = buildCompletedPredicate(true, false);
    expect(completed(eventComplete)).toBe(true);
    expect(completed(packetComplete)).toBe(false);
  });

  it('with provider: uses packet-level snapshot flags only', () => {
    const blocked = buildBlockedPredicate(true, true);
    expect(blocked(packetBlocked)).toBe(true);
    expect(blocked(eventBlocked)).toBe(false); // no packet snapshot

    const completed = buildCompletedPredicate(true, true);
    expect(completed(packetComplete)).toBe(true);
    expect(completed(eventComplete)).toBe(false);
  });

  it("provider present + stale event.packetStatus='BLOCKED' but snapshot not blocked = excluded", () => {
    const staleCard = makeFilterable({
      eventInstanceId: 'e-stale-blocked',
      eventTitle: 'Stale blocked card',
      eventDate: '2026-05-05',
      eventStatus: 'blocked', // event-level noise
      packetStatus: 'BLOCKED', // stale projection — must NOT be consulted
      packetSnapshot: {
        isBlocked: false,
        packetStatus: 'DRAFT_GENERATED',
      },
    });
    const blocked = buildBlockedPredicate(true, true);
    expect(blocked(staleCard)).toBe(false);

    // Snapshot truly blocked still matches
    expect(
      blocked(
        makeFilterable({
          eventInstanceId: 'e-snap-blocked',
          eventTitle: 'Snap blocked',
          eventDate: '2026-05-06',
          eventStatus: 'on-track',
          packetStatus: 'DRAFT_GENERATED', // card field disagrees — ignored
          packetSnapshot: { isBlocked: true, packetStatus: 'BLOCKED' },
        }),
      ),
    ).toBe(true);
  });

  it('provider present + stale event.packetStatus completed-ish but snapshot not completed = excluded', () => {
    const staleComplete = makeFilterable({
      eventInstanceId: 'e-stale-complete',
      eventTitle: 'Stale complete',
      eventDate: '2026-05-07',
      eventStatus: 'complete',
      packetStatus: 'LOCKED',
      packetSnapshot: {
        isCompleted: false,
        packetStatus: 'UNDER_REVIEW',
      },
    });
    const completed = buildCompletedPredicate(true, true);
    expect(completed(staleComplete)).toBe(false);
  });
});

// ─── No date-window clamp ────────────────────────────────────────────────────

describe('no hardcoded date-window clamp', () => {
  it('includes 2027 events when the visible range is navigated to 2027', () => {
    const events = [
      { eventDate: '2026-05-19', id: 'a' },
      { eventDate: '2027-03-15', id: 'b' },
      { eventDate: '2027-03-20', id: 'c' },
      { eventDate: '2028-01-01', id: 'd' },
    ];

    // Navigate: Dec 2026 → next month → Jan 2027 → … → March 2027
    let anchor: CalendarAnchor = { year: 2026, month: 12, day: 1 };
    anchor = navigateNext('month', anchor); // 2027-01
    anchor = navigateNext('month', anchor); // 2027-02
    anchor = navigateNext('month', anchor); // 2027-03
    expect(anchor).toEqual({ year: 2027, month: 3, day: 1 });

    const range = getVisibleRange('month', anchor);
    expect(range).toEqual({ start: '2027-03-01', end: '2027-03-31' });

    const visible = filterEventsInVisibleRange(events, range);
    expect(visible.map((e) => e.id)).toEqual(['b', 'c']);
    // 2026 and 2028 events are out of this month — not because of a studio clamp
    expect(visible.find((e) => e.id === 'a')).toBeUndefined();
    expect(visible.find((e) => e.id === 'd')).toBeUndefined();
  });

  it('does not reject far-future years in getVisibleRange', () => {
    const range = getVisibleRange('month', { year: 2031, month: 8, day: 1 });
    expect(range.start).toBe('2031-08-01');
    expect(range.end).toBe('2031-08-31');
  });
});

// ─── Full lifecycle status list (F3) ─────────────────────────────────────────

describe('PACKET_LIFECYCLE_STATUS_VALUES', () => {
  it('is derived from ALLOWED_TRANSITIONS.packet keys (canonical runtime source)', () => {
    const transitionKeys = Object.keys(ALLOWED_TRANSITIONS.packet);
    expect(PACKET_LIFECYCLE_STATUS_VALUES.length).toBe(transitionKeys.length);
    expect([...PACKET_LIFECYCLE_STATUS_VALUES].sort()).toEqual(
      [...transitionKeys].sort(),
    );
    // Sanity: includes known states from the contracts machine
    expect(PACKET_LIFECYCLE_STATUS_VALUES).toContain(
      'SOURCE_COLLECTION' satisfies PacketLifecycleStatus,
    );
    expect(PACKET_LIFECYCLE_STATUS_VALUES).toContain('AMENDMENT_REQUIRED');
    expect(PACKET_LIFECYCLE_STATUS_VALUES).toContain('SIGNATURE_EXPIRED');
  });
});

// ─── Render tests (F6) ───────────────────────────────────────────────────────

describe('EventSelectorCalendar render (jsdom)', () => {
  let container: HTMLDivElement;
  let root: Root;

  // Enable React act() environment for createRoot + jsdom.
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function mount(props: Partial<EventSelectorCalendarProps> = {}) {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    const onSelectEvent: EventSelectorCalendarProps['onSelectEvent'] =
      props.onSelectEvent ?? ((_event: EventCardModel) => undefined);

    // Fixed calendar fixture in the current month so the pill is always visible.
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = Math.min(15, new Date(year, month, 0).getDate());
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const calendarEvents: CesCalendarEvent[] = [
      {
        id: 'mock-evt-render-1',
        label: 'MOCK-EVENT-TITLE',
        day,
        month,
        owner: 'MOCK-OWNER',
        progress: 0,
        tone: 'teal',
        sourceEventId: 'mock-evt-render-1',
        sourceDate: iso,
        sourceKind: 'v3-regulatory-event',
        workflow: 'MOCK-WF-01',
      },
    ];
    const regulatoryEvents: RegulatoryEvent[] = [
      makeReg({
        id: 'mock-evt-render-1',
        title: 'MOCK-EVENT-TITLE',
        date: iso,
        eventSubType: 'mock_family',
        workflowId: 'MOCK-WF-01',
        owner: 'MOCK-OWNER',
        approvals: [
          {
            id: 'ap-render',
            targetKind: 'event',
            targetLabel: 'Packet',
            approverRole: 'MOCK-APPROVER-ROLE',
            required: true,
          },
        ],
        minutes: {
          status: 'missing',
          dueOffsetDays: 1,
          signOffRoles: ['MOCK-SIGNER-A'],
        },
      }),
    ];

    const merged: EventSelectorCalendarProps = {
      calendarEvents,
      regulatoryEvents,
      packetStatusProvider: () => ({ packetStatus: 'DRAFT_GENERATED' }),
      ...props,
      onSelectEvent,
    };

    act(() => {
      root.render(createElement(EventSelectorCalendar, merged));
    });
    return { iso, day };
  }

  it('packet-status filter enumerates the full PacketLifecycleStatus union', () => {
    mount();
    const select = container.querySelector(
      '[data-testid="packet-status-filter"]',
    ) as HTMLSelectElement | null;
    expect(select).not.toBeNull();
    const optionValues = Array.from(select!.querySelectorAll('option'))
      .map((o) => o.value)
      .filter((v) => v.length > 0);
    expect(optionValues).toEqual([...PACKET_LIFECYCLE_STATUS_VALUES]);
  });

  it('selection drawer shows Required approvals and Required signers fields', async () => {
    mount();

    const pill = Array.from(container.querySelectorAll('button')).find((b) =>
      (b.textContent ?? '').includes('MOCK-EVENT-TITLE'),
    );
    expect(pill).toBeTruthy();

    await act(async () => {
      pill!.click();
      // VeilDrawer mounts on open + rAF visibility
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
    });

    // Drawer content is portaled to document.body
    const bodyText = document.body.textContent ?? '';
    expect(bodyText).toContain('Required approvals');
    expect(bodyText).toContain('Required signers');
    expect(bodyText).toContain('MOCK-APPROVER-ROLE');
    expect(bodyText).toContain('MOCK-SIGNER-A');
    // FR-002 exact labels
    expect(bodyText).toContain('Event-family ID');
    expect(bodyText).toContain('Event-instance ID');
    expect(bodyText).toContain('Workflow-instance ID');
    expect(bodyText).toContain('Required-form completion');
    expect(bodyText).toContain('Evidence completeness');
    expect(bodyText).toContain('Approval status');
    expect(bodyText).toContain('Signature status');
    expect(bodyText).toContain('Blocker count');
  });
});
