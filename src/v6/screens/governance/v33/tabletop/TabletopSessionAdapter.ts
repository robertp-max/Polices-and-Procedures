// Storage adapter boundary for 2026 QAPI tabletop sessions (§5).
//
// Today this is SAME-DEVICE only: a solo learner or a facilitated group
// gathered around one screen. State is persisted to localStorage so a
// refresh/resume doesn't lose progress, but it is explicitly NOT an
// authoritative record — same non-authoritative posture as compliance
// drafts (see compliance/complianceStore.ts). The only authoritative
// record is a compliance evidence record committed via commitEvidence().
//
// The adapter interface is deliberately narrow and swappable so a FUTURE
// connected-session adapter (multiple devices, a real facilitator/participant
// channel) can be dropped in later without touching callers. No fake
// real-time sync is implemented here — every read is a plain synchronous
// snapshot of what THIS device has stored.

export type TabletopSessionMode = 'solo' | 'facilitated';

export interface TabletopSessionRecord<TState = unknown> {
  sessionId: string;
  mode: TabletopSessionMode;
  caseId: string;
  updatedAt: string;
  state: TState;
}

export interface TabletopSessionAdapter {
  /** True only for an adapter that can actually sync across devices/participants in real time. Always false here. */
  readonly connectedRealtime: boolean;
  load<TState>(sessionId: string): TabletopSessionRecord<TState> | null;
  save<TState>(record: TabletopSessionRecord<TState>): void;
  remove(sessionId: string): void;
  /** All sessions this device has stored, optionally filtered by mode. */
  list(mode?: TabletopSessionMode): TabletopSessionRecord[];
}

const KEY_PREFIX = 'care-indeed:gb:tabletop:session:';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Default, present-day adapter: this device's localStorage only. Two
 * facilitated-mode users on two different devices do NOT see each other's
 * state through this adapter — that requires a future connected adapter.
 */
class SameDeviceTabletopSessionAdapter implements TabletopSessionAdapter {
  readonly connectedRealtime = false;

  load<TState>(sessionId: string): TabletopSessionRecord<TState> | null {
    if (typeof window === 'undefined') return null;
    return safeParse<TabletopSessionRecord<TState>>(window.localStorage.getItem(KEY_PREFIX + sessionId));
  }

  save<TState>(record: TabletopSessionRecord<TState>): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(KEY_PREFIX + record.sessionId, JSON.stringify(record));
    } catch {
      /* storage full/disabled — best-effort resume only, never authoritative */
    }
  }

  remove(sessionId: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(KEY_PREFIX + sessionId);
    } catch {
      /* ignore */
    }
  }

  list(mode?: TabletopSessionMode): TabletopSessionRecord[] {
    if (typeof window === 'undefined') return [];
    const out: TabletopSessionRecord[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith(KEY_PREFIX)) continue;
      const record = safeParse<TabletopSessionRecord>(window.localStorage.getItem(key));
      if (record && (!mode || record.mode === mode)) out.push(record);
    }
    return out;
  }
}

let activeAdapter: TabletopSessionAdapter = new SameDeviceTabletopSessionAdapter();

/** Inject a future connected-session adapter (multi-device / real-time). Not wired today. */
export function setTabletopSessionAdapter(adapter: TabletopSessionAdapter): void {
  activeAdapter = adapter;
}

export function getTabletopSessionAdapter(): TabletopSessionAdapter {
  return activeAdapter;
}
