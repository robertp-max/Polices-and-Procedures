// Governing Body portal — the ONE navigation authority (spec §2).
//
// Before this module, three systems competed: local React state (`setView`,
// nine independent overlay/player useStates), `window.location.pathname`
// parsing, and `window.location.hash` parsing — and every user navigation used
// `history.replaceState`, so the portal created no history entries at all.
// Browser Back therefore left /governance entirely and Back never closed a
// drawer, modal, or player.
//
// Here, one typed GovernanceRouteState is the single source of truth. It is
// serialized to a canonical hash, parsed back losslessly, and every view, tab,
// selected entity, overlay, and player is DERIVED from it.

export type GovernanceViewKey =
  | 'home'
  | 'compliance'
  | 'meetings'
  | 'decisions'
  | 'workflows'
  | 'oversight'
  | 'evidence';

export type GovernanceOverlayType = 'readiness-gate' | 'decision' | 'search';

export interface GovernanceOverlay {
  type: GovernanceOverlayType;
  id?: string;
  /** For 'readiness-gate': the launch mode the user attempted ('solo' | 'group'). */
  mode?: string;
}

export interface GovernanceRouteState {
  view: GovernanceViewKey;
  /** Tab within the view (e.g. 'training', 'lifecycle', 'qapi', 'due'). */
  subview?: string;
  /** Selected entity id (module, requirement, course, case, workflow instance). */
  entityId?: string;
  /** Entity kind or player mode ('module' | 'requirement' | 'assessment' | 'solo' | 'group' | period). */
  mode?: string;
  /** Transient state layered above the page. Closed first by Back. */
  overlay?: GovernanceOverlay;
  /** Canonical route to return to (e.g. the decision that opened the handbook). */
  returnTo?: string;
  /** Restored after the destination renders (history.scrollRestoration = 'manual'). */
  scrollY?: number;
}

const VIEWS: GovernanceViewKey[] = ['home', 'compliance', 'meetings', 'decisions', 'workflows', 'oversight', 'evidence'];

const MEETINGS_TABS = ['lifecycle', 'agenda', 'schedule'];
const OVERSIGHT_TABS = ['qapi', 'domains', 'data'];
const COMPLIANCE_TABS = ['required', 'training', 'policies', 'tabletop', 'annual', 'completed'];
const WORKFLOW_TABS = ['due', 'blockers', 'scheduled', 'event', 'completed', 'library'];
const OVERSIGHT_PERIODS = ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'];
/** Entity kinds that appear as a path segment before the id. */
const COMPLIANCE_ENTITY_KINDS = ['module', 'requirement', 'assessment'];

export const DEFAULT_ROUTE: GovernanceRouteState = { view: 'home' };

function isView(value: string): value is GovernanceViewKey {
  return (VIEWS as string[]).includes(value);
}

/* ── Serialize ─────────────────────────────────────────────────────────── */

/**
 * Canonical hash for a route state. Query-ish extras (returnTo) ride in the
 * hash so a deep link is a single copyable URL fragment.
 */
export function serializeGovernanceRoute(state: GovernanceRouteState): string {
  const segments: string[] = [state.view];

  if (state.view === 'decisions') {
    // #decisions/GB-READINESS-005 — the open dossier IS the route.
    if (state.overlay?.type === 'decision' && state.overlay.id) segments.push(state.overlay.id);
  } else if (state.view === 'compliance') {
    if (state.subview) segments.push(state.subview);
    if (state.subview === 'tabletop' && state.entityId) {
      segments.push(state.entityId);
      if (state.mode) segments.push(state.mode);
    } else if (state.subview === 'remediation' && state.entityId) {
      segments.push(state.entityId);
    } else if (state.mode && state.entityId && COMPLIANCE_ENTITY_KINDS.includes(state.mode)) {
      segments.push(state.mode, state.entityId);
    }
  } else if (state.view === 'workflows') {
    if (state.subview) segments.push(state.subview);
    if (state.entityId) segments.push(state.entityId);
  } else if (state.view === 'oversight') {
    if (state.subview) segments.push(state.subview);
    if (state.mode) segments.push(state.mode);
  } else if (state.view === 'evidence') {
    if (state.subview) segments.push(state.subview);
  } else if (state.view === 'meetings') {
    if (state.subview) segments.push(state.subview);
  }

  let hash = `#${segments.filter(Boolean).map(encodeURIComponent).join('/')}`;

  const extras: string[] = [];
  // A decision overlay opened from a NON-decisions view is carried explicitly.
  if (state.overlay && !(state.view === 'decisions' && state.overlay.type === 'decision')) {
    extras.push(`overlay=${state.overlay.type}${state.overlay.id ? `:${state.overlay.id}` : ''}${state.overlay.mode ? `:${state.overlay.mode}` : ''}`);
  }
  if (state.returnTo) extras.push(`returnTo=${encodeURIComponent(state.returnTo)}`);
  if (extras.length) hash += `?${extras.join('&')}`;

  return hash;
}

/* ── Parse ─────────────────────────────────────────────────────────────── */

export interface ParsedRoute {
  state: GovernanceRouteState;
  /**
   * True when the incoming URL was legacy/invalid and the canonical form
   * differs — the caller must normalize with replaceState (never pushState).
   */
  normalized: boolean;
}

/** Legacy pathname → route state, kept working so old links and bookmarks resolve. */
function legacyPathView(pathname: string): Pick<GovernanceRouteState, 'view' | 'subview' | 'mode' | 'entityId'> | null {
  const academyModule = pathname.match(/^\/governance\/academy\/modules\/([^/]+)$/);
  if (academyModule) {
    return {
      view: 'compliance',
      subview: 'training',
      mode: 'module',
      entityId: decodeURIComponent(academyModule[1]),
    };
  }
  if (pathname === '/governance/academy') return { view: 'compliance', subview: 'training' };
  if (pathname.startsWith('/governance/learning/policies') || pathname === '/governance/policies') return { view: 'compliance', subview: 'policies' };
  if (pathname === '/governance/records') return { view: 'evidence' };
  if (pathname === '/governance/qapi' || pathname === '/governance/oversight') return { view: 'oversight', subview: 'qapi' };
  if (pathname === '/governance/risk') return { view: 'oversight', subview: 'domains' };
  if (pathname === '/governance/calendar') return { view: 'meetings', subview: 'schedule' };
  if (pathname === '/governance/board-books') return { view: 'meetings', subview: 'agenda' };
  if (pathname === '/governance/meetings') return { view: 'meetings', subview: 'lifecycle' };
  if (pathname === '/governance/decisions') return { view: 'decisions' };
  if (pathname === '/governance/workflows') return { view: 'workflows', subview: 'due' };
  if (pathname === '/governance/evidence') return { view: 'evidence' };
  return null;
}

function parseOverlayExtra(raw: string): GovernanceOverlay | undefined {
  const [type, id, mode] = raw.split(':');
  if (type !== 'readiness-gate' && type !== 'decision' && type !== 'search') return undefined;
  return { type, ...(id ? { id } : {}), ...(mode ? { mode } : {}) };
}

/** Default tab per view, so a bare `#compliance` resolves to a real state. */
function defaultSubview(view: GovernanceViewKey): string | undefined {
  switch (view) {
    case 'compliance': return 'required';
    case 'meetings': return 'lifecycle';
    case 'oversight': return 'qapi';
    case 'workflows': return 'due';
    default: return undefined;
  }
}

/**
 * Parses hash (preferred) or legacy pathname into canonical route state.
 * Unknown/invalid input degrades to the closest valid state and is flagged
 * `normalized` so the caller can replaceState instead of pushing garbage.
 */
export function parseGovernanceRoute(hash: string, pathname = ''): ParsedRoute {
  const raw = (hash || '').replace(/^#/, '');
  const [pathPart, queryPart] = raw.split('?');
  let decodeFailed = false;
  const segments = pathPart.split('/').filter(Boolean).map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      decodeFailed = true;
      return segment;
    }
  });

  let overlay: GovernanceOverlay | undefined;
  let returnTo: string | undefined;
  if (queryPart) {
    for (const pair of queryPart.split('&')) {
      const [key, value = ''] = pair.split('=');
      if (key === 'overlay') overlay = parseOverlayExtra(value);
      if (key === 'returnTo') returnTo = decodeURIComponent(value);
    }
  }

  // No usable hash → fall back to legacy pathname, then home. Always normalize.
  if (!segments.length) {
    const legacy = legacyPathView(pathname);
    if (legacy) {
      return { state: { ...legacy, subview: legacy.subview ?? defaultSubview(legacy.view) }, normalized: true };
    }
    return { state: { ...DEFAULT_ROUTE }, normalized: true };
  }

  const [rawView, ...rest] = segments;
  // Legacy hash aliases.
  const aliased = rawView === 'records' ? 'evidence' : rawView === 'my-work' ? 'compliance' : rawView;
  let normalized = aliased !== rawView || decodeFailed;

  if (!isView(aliased)) {
    const legacy = legacyPathView(pathname);
    if (legacy) return { state: { ...legacy, subview: legacy.subview ?? defaultSubview(legacy.view) }, normalized: true };
    return { state: { ...DEFAULT_ROUTE }, normalized: true };
  }

  const view = aliased;
  const state: GovernanceRouteState = { view };
  if (overlay) state.overlay = overlay;
  if (returnTo) state.returnTo = returnTo;

  const allowed = (list: string[], value?: string) => (value && list.includes(value) ? value : undefined);

  switch (view) {
    case 'decisions': {
      // #decisions/<decisionId> is the open dossier.
      if (rest[0]) state.overlay = { type: 'decision', id: rest[0] };
      break;
    }
    case 'compliance': {
      const tab = allowed([...COMPLIANCE_TABS, 'remediation'], rest[0]);
      if (rest[0] && !tab) normalized = true;
      state.subview = tab ?? defaultSubview(view);
      if (state.subview === 'tabletop' && rest[1]) {
        state.entityId = rest[1];
        const mode = allowed(['solo', 'group'], rest[2]);
        if (rest[2] && !mode) normalized = true;
        if (mode) state.mode = mode;
      } else if (state.subview === 'remediation' && rest[1]) {
        state.entityId = rest[1];
      } else if (rest[1] && COMPLIANCE_ENTITY_KINDS.includes(rest[1])) {
        if (rest[2]) {
          state.mode = rest[1];
          state.entityId = rest[2];
        } else {
          normalized = true; // kind without an id is not a real destination
        }
      } else if (rest[1]) {
        normalized = true;
      }
      break;
    }
    case 'meetings': {
      const tab = allowed(MEETINGS_TABS, rest[0]);
      if (rest[0] && !tab) normalized = true;
      state.subview = tab ?? defaultSubview(view);
      break;
    }
    case 'oversight': {
      const tab = allowed(OVERSIGHT_TABS, rest[0]);
      if (rest[0] && !tab) normalized = true;
      state.subview = tab ?? defaultSubview(view);
      const period = allowed(OVERSIGHT_PERIODS, rest[1]);
      if (rest[1] && !period) normalized = true;
      if (period) state.mode = period;
      break;
    }
    case 'workflows': {
      const tab = allowed(WORKFLOW_TABS, rest[0]);
      if (rest[0] && !tab) normalized = true;
      state.subview = tab ?? defaultSubview(view);
      if (rest[1]) state.entityId = rest[1];
      break;
    }
    case 'evidence': {
      const sub = allowed(['forms'], rest[0]);
      if (rest[0] && !sub) normalized = true;
      if (sub) state.subview = sub;
      break;
    }
    case 'home':
    default:
      if (rest.length) normalized = true;
      break;
  }

  // If the canonical serialization differs from what arrived, normalize it.
  if (!normalized && serializeGovernanceRoute(state) !== `#${raw}`) normalized = true;

  return { state, normalized };
}

/* ── Comparison ────────────────────────────────────────────────────────── */

/**
 * Identity for history purposes. scrollY is deliberately excluded: a scroll
 * update must never create a new history entry.
 */
export function routesEqual(a: GovernanceRouteState, b: GovernanceRouteState): boolean {
  return (
    a.view === b.view &&
    (a.subview ?? '') === (b.subview ?? '') &&
    (a.entityId ?? '') === (b.entityId ?? '') &&
    (a.mode ?? '') === (b.mode ?? '') &&
    (a.returnTo ?? '') === (b.returnTo ?? '') &&
    (a.overlay?.type ?? '') === (b.overlay?.type ?? '') &&
    (a.overlay?.id ?? '') === (b.overlay?.id ?? '') &&
    (a.overlay?.mode ?? '') === (b.overlay?.mode ?? '')
  );
}

/**
 * The topmost transient layer, in the order Back must close it (spec §2):
 * readiness modal → decision reference → decision drawer → command palette →
 * player → subsection/tab → prior page. Returns the route with that single
 * layer removed, or null when the route is already a plain page.
 */
export function closeTopmostLayer(state: GovernanceRouteState): GovernanceRouteState | null {
  // 1–4: any overlay (readiness gate, decision dossier, search) closes first.
  if (state.overlay) {
    const next: GovernanceRouteState = { ...state };
    delete next.overlay;
    return next;
  }
  // 5: an open player/entity closes back to its tab.
  if (state.entityId) {
    const next: GovernanceRouteState = { ...state };
    delete next.entityId;
    delete next.mode;
    // `#compliance/remediation/x` has no standalone tab — fall back to Required.
    if (next.subview === 'remediation') next.subview = 'required';
    return next;
  }
  // 6: a non-default subsection returns to the view's default tab.
  const fallback = defaultSubview(state.view);
  if (state.subview && fallback && state.subview !== fallback) {
    return { ...state, subview: fallback };
  }
  if (state.subview && !fallback) {
    const next: GovernanceRouteState = { ...state };
    delete next.subview;
    return next;
  }
  // 7: caller falls back to the prior page (real history).
  return null;
}
