// Spec §2 — canonical route grammar, round-tripping, normalization, and the
// Back close-order contract. These are the pure-logic guarantees behind the
// browser-history behavior; the Playwright suite exercises the real browser.

import { describe, expect, it } from 'vitest';
import {
  closeTopmostLayer,
  parseGovernanceRoute,
  routesEqual,
  serializeGovernanceRoute,
  type GovernanceRouteState,
} from './governanceRoute';

/** Every canonical example listed in the addendum. */
const CANONICAL: string[] = [
  '#home',
  '#meetings/lifecycle',
  '#meetings/agenda',
  '#meetings/schedule',
  '#decisions',
  '#decisions/GB-READINESS-005',
  '#compliance/required',
  '#compliance/training',
  '#compliance/training/module/GB-001',
  '#compliance/policies',
  '#compliance/policies/requirement/REQ-123',
  '#compliance/policies/assessment/COURSE-9',
  '#compliance/tabletop',
  '#compliance/tabletop/tabletop2026-q1/solo',
  '#compliance/tabletop/tabletop2026-q1/group',
  '#compliance/remediation/GB-001',
  '#workflows/due',
  '#workflows/due/WF-INST-1',
  '#oversight/qapi/Q1',
  '#oversight/domains/Annual',
  '#evidence',
  '#evidence/forms',
];

describe('canonical routes round-trip losslessly', () => {
  it.each(CANONICAL)('%s parses and re-serializes to itself', (hash) => {
    const { state } = parseGovernanceRoute(hash, '/governance');
    expect(serializeGovernanceRoute(state)).toBe(hash);
  });

  it('does not flag canonical URLs as needing normalization', () => {
    for (const hash of CANONICAL) {
      expect(parseGovernanceRoute(hash, '/governance').normalized, hash).toBe(false);
    }
  });
});

describe('parsing produces the right typed state', () => {
  it('reads a module deep link', () => {
    const { state } = parseGovernanceRoute('#compliance/training/module/GB-001');
    expect(state).toMatchObject({ view: 'compliance', subview: 'training', mode: 'module', entityId: 'GB-001' });
  });
  it('reads a tabletop case + mode', () => {
    const { state } = parseGovernanceRoute('#compliance/tabletop/tabletop2026-q1/group');
    expect(state).toMatchObject({ view: 'compliance', subview: 'tabletop', entityId: 'tabletop2026-q1', mode: 'group' });
  });
  it('treats a decision id as an overlay on the decisions view', () => {
    const { state } = parseGovernanceRoute('#decisions/GB-READINESS-005');
    expect(state.view).toBe('decisions');
    expect(state.overlay).toEqual({ type: 'decision', id: 'GB-READINESS-005' });
  });
  it('carries a readiness-gate overlay with case and mode', () => {
    const hash = '#compliance/tabletop?overlay=readiness-gate:tabletop2026-q1:solo';
    const { state } = parseGovernanceRoute(hash);
    expect(state.overlay).toEqual({ type: 'readiness-gate', id: 'tabletop2026-q1', mode: 'solo' });
    expect(serializeGovernanceRoute(state)).toBe(hash);
  });
  it('carries a returnTo target (handbook → decision)', () => {
    const state: GovernanceRouteState = { view: 'decisions', overlay: { type: 'decision', id: 'GB-READINESS-005' }, returnTo: '#decisions/GB-READINESS-005' };
    const round = parseGovernanceRoute(serializeGovernanceRoute(state));
    expect(round.state.returnTo).toBe('#decisions/GB-READINESS-005');
  });
});

describe('normalization uses replaceState semantics, never a pushed entry', () => {
  it('flags legacy hash aliases', () => {
    expect(parseGovernanceRoute('#records').state.view).toBe('evidence');
    expect(parseGovernanceRoute('#records').normalized).toBe(true);
    expect(parseGovernanceRoute('#my-work').state.view).toBe('compliance');
    expect(parseGovernanceRoute('#my-work').normalized).toBe(true);
  });
  it('flags legacy pathnames with no hash', () => {
    const parsed = parseGovernanceRoute('', '/governance/academy');
    expect(parsed.state).toMatchObject({ view: 'compliance', subview: 'training' });
    expect(parsed.normalized).toBe(true);
  });
  it('preserves legacy academy module deep links', () => {
    const parsed = parseGovernanceRoute('', '/governance/academy/modules/GB-001');
    expect(parsed.state).toMatchObject({ view: 'compliance', subview: 'training', mode: 'module', entityId: 'GB-001' });
    expect(parsed.normalized).toBe(true);
  });
  it('recovers from an unknown view', () => {
    const parsed = parseGovernanceRoute('#not-a-view/whatever', '/governance');
    expect(parsed.state.view).toBe('home');
    expect(parsed.normalized).toBe(true);
  });
  it('recovers from an invalid tab and an entity kind with no id', () => {
    expect(parseGovernanceRoute('#compliance/not-a-tab').normalized).toBe(true);
    expect(parseGovernanceRoute('#compliance/not-a-tab').state.subview).toBe('required');
    const kindOnly = parseGovernanceRoute('#compliance/training/module');
    expect(kindOnly.normalized).toBe(true);
    expect(kindOnly.state.entityId).toBeUndefined();
  });
  it('fills the default tab for a bare view', () => {
    expect(parseGovernanceRoute('#compliance').state.subview).toBe('required');
    expect(parseGovernanceRoute('#meetings').state.subview).toBe('lifecycle');
    expect(parseGovernanceRoute('#oversight').state.subview).toBe('qapi');
    expect(parseGovernanceRoute('#workflows').state.subview).toBe('due');
  });
});

describe('routesEqual — duplicate-entry suppression', () => {
  it('ignores scrollY so a scroll update never looks like a new destination', () => {
    const a: GovernanceRouteState = { view: 'compliance', subview: 'training', scrollY: 0 };
    const b: GovernanceRouteState = { view: 'compliance', subview: 'training', scrollY: 940 };
    expect(routesEqual(a, b)).toBe(true);
  });
  it('separates different entities and overlays', () => {
    expect(routesEqual(
      { view: 'compliance', subview: 'training', mode: 'module', entityId: 'GB-001' },
      { view: 'compliance', subview: 'training', mode: 'module', entityId: 'GB-002' },
    )).toBe(false);
    expect(routesEqual(
      { view: 'decisions' },
      { view: 'decisions', overlay: { type: 'decision', id: 'X' } },
    )).toBe(false);
  });
});

describe('Back closes one layer at a time, in the specified order', () => {
  it('closes an overlay before anything else', () => {
    const withOverlay: GovernanceRouteState = {
      view: 'compliance', subview: 'tabletop', entityId: 'tabletop2026-q1', mode: 'solo',
      overlay: { type: 'readiness-gate', id: 'tabletop2026-q1', mode: 'solo' },
    };
    const next = closeTopmostLayer(withOverlay)!;
    expect(next.overlay).toBeUndefined();
    // the underlying case selection survives the overlay close
    expect(next.entityId).toBe('tabletop2026-q1');
  });
  it('then closes the open player/entity back to its tab', () => {
    const next = closeTopmostLayer({ view: 'compliance', subview: 'training', mode: 'module', entityId: 'GB-001' })!;
    expect(next).toMatchObject({ view: 'compliance', subview: 'training' });
    expect(next.entityId).toBeUndefined();
    expect(next.mode).toBeUndefined();
  });
  it('sends remediation (which has no tab of its own) back to Required', () => {
    const next = closeTopmostLayer({ view: 'compliance', subview: 'remediation', entityId: 'GB-001' })!;
    expect(next).toMatchObject({ view: 'compliance', subview: 'required' });
  });
  it('then returns a non-default subsection to the default tab', () => {
    expect(closeTopmostLayer({ view: 'meetings', subview: 'schedule' })).toMatchObject({ view: 'meetings', subview: 'lifecycle' });
  });
  it('finally reports "no layer left" so the caller uses real history', () => {
    expect(closeTopmostLayer({ view: 'meetings', subview: 'lifecycle' })).toBeNull();
    expect(closeTopmostLayer({ view: 'home' })).toBeNull();
  });
});
