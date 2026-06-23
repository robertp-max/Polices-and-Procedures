/**
 * Session Store — In-memory + optional JSON file persistence.
 *
 * Set BRAD_SESSION_PERSIST=true (or BRAD_SESSION_DIR=/path) to enable.
 * Each session is written to a separate .json file on every save.
 * On startup, all session files are loaded back into memory.
 *
 * MVP persistence — no new dependencies. Upgrade to SQLite/Redis for
 * production multi-instance deployments. The interface is stable.
 */

import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BradSessionState, StoredMessage } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PERSIST_ENABLED = process.env['BRAD_SESSION_PERSIST'] === 'true';
const SESSION_DIR = process.env['BRAD_SESSION_DIR']
  ?? path.join(__dirname, 'data', 'sessions');

function ensureDir(dir: string): void {
  try { fs.mkdirSync(dir, { recursive: true }); } catch { /* exists */ }
}

function sessionFilePath(threadId: string): string {
  // Sanitize threadId for filename safety
  const safe = threadId.replace(/[^a-zA-Z0-9\-_]/g, '_');
  return path.join(SESSION_DIR, `${safe}.json`);
}

function writeSessionFile(state: BradSessionState): void {
  try {
    ensureDir(SESSION_DIR);
    fs.writeFileSync(sessionFilePath(state.threadId), JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    // Non-fatal — in-memory still works
    console.warn('[brad:session-store] Failed to persist session:', (e as Error).message);
  }
}

function loadAllSessionFiles(): Map<string, BradSessionState> {
  const result = new Map<string, BradSessionState>();
  if (!PERSIST_ENABLED) return result;
  try {
    ensureDir(SESSION_DIR);
    const files = fs.readdirSync(SESSION_DIR).filter(f => f.endsWith('.json'));
    for (const f of files) {
      try {
        const raw = fs.readFileSync(path.join(SESSION_DIR, f), 'utf-8');
        const state = JSON.parse(raw) as BradSessionState;
        if (state.threadId) result.set(state.threadId, state);
      } catch { /* skip corrupt files */ }
    }
    if (result.size > 0) {
      console.info(`[brad:session-store] Loaded ${result.size} persisted session(s).`);
    }
  } catch { /* non-fatal */ }
  return result;
}

const MAX_SESSIONS = 200;
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

/** Create a fresh session state for a new thread. */
export function createSessionState(threadId: string): BradSessionState {
  const now = new Date().toISOString();
  return {
    sessionId: randomUUID(),
    threadId,
    createdAt: now,
    updatedAt: now,
    mode: 'general',
    urgency: 'low',
    caseStatus: 'active',
    caseTitle: null,
    caseSummary: null,
    detectedIncidentType: null,
    userRole: 'unknown',
    activeDomains: [],
    activeSubdomains: [],
    activePolicies: [],
    activeForms: [],
    lastUserIntent: 'unknown',
    lifeSafetyFlag: false,
    escalationRequired: false,
    formsRequired: false,
    qapiTriggerPossible: false,
    complianceRiskLevel: 'none',
    immediateActions: [],
    pendingTasks: [],
    completedTasks: [],
    openQuestions: [],
    safetyStatus: 'unknown',
    locationStatus: 'unknown',
    threatStatus: 'unknown',
    documentationStage: 'not_started',
    followUpQuestion: null,
    followUpAnswer: null,
    peopleInvolved: [],
    whatBradTold: [],
    timeline: [],
    recentMessages: [],
    messageCount: 0,
  };
}

class SessionStore {
  private readonly data = new Map<string, {
    state: BradSessionState;
    lastAccess: number;
  }>();

  constructor() {
    // Load persisted sessions on startup
    if (PERSIST_ENABLED) {
      const loaded = loadAllSessionFiles();
      for (const [threadId, state] of loaded) {
        this.data.set(threadId, { state, lastAccess: Date.now() });
      }
    }
  }

  load(threadId: string): BradSessionState | null {
    const entry = this.data.get(threadId);
    if (!entry) return null;
    if (Date.now() - entry.lastAccess > SESSION_TTL_MS) {
      this.data.delete(threadId);
      if (PERSIST_ENABLED) {
        try { fs.unlinkSync(sessionFilePath(threadId)); } catch { /* ok */ }
      }
      return null;
    }
    entry.lastAccess = Date.now();
    return entry.state;
  }

  save(state: BradSessionState): void {
    this.evictIfNeeded();
    this.data.set(state.threadId, {
      state,
      lastAccess: Date.now(),
    });
    if (PERSIST_ENABLED) writeSessionFile(state);
  }

  delete(threadId: string): void {
    this.data.delete(threadId);
    if (PERSIST_ENABLED) {
      try { fs.unlinkSync(sessionFilePath(threadId)); } catch { /* ok */ }
    }
  }

  list(): Array<{ threadId: string; caseTitle: string | null; mode: string; updatedAt: string; caseStatus: string }> {
    return Array.from(this.data.values())
      .sort((a, b) => b.lastAccess - a.lastAccess)
      .map(e => ({
        threadId: e.state.threadId,
        caseTitle: e.state.caseTitle,
        mode: e.state.mode,
        updatedAt: e.state.updatedAt,
        caseStatus: e.state.caseStatus ?? 'active',
      }));
  }

  private evictIfNeeded(): void {
    if (this.data.size < MAX_SESSIONS) return;
    // Remove oldest 20% on overflow
    const entries = Array.from(this.data.entries())
      .sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    entries.slice(0, Math.floor(MAX_SESSIONS * 0.2)).forEach(([k]) => this.data.delete(k));
  }
}

export const sessionStore = new SessionStore();

/* ── Helper: append a message to session recent history ──────────── */

export function appendMessage(
  state: BradSessionState,
  msg: Omit<StoredMessage, 'id' | 'timestamp'> & { timestamp?: string },
): void {
  const entry: StoredMessage = {
    id: randomUUID(),
    timestamp: msg.timestamp ?? new Date().toISOString(),
    role: msg.role,
    content: msg.content.slice(0, 600), // keep compact
    mode: msg.mode,
    urgency: msg.urgency,
  };
  state.recentMessages.push(entry);
  if (state.recentMessages.length > 8) {
    state.recentMessages = state.recentMessages.slice(-8);
  }
  state.messageCount++;
  state.updatedAt = entry.timestamp;
}

/* ── Helper: add timeline event ───────────────────────────────────── */

export function addTimelineEvent(
  state: BradSessionState,
  actor: 'user' | 'brad' | 'system',
  eventType: BradSessionState['timeline'][0]['eventType'],
  summary: string,
  metadata?: Record<string, unknown>,
): void {
  state.timeline.push({
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    actor,
    eventType,
    summary,
    metadata,
  });
  // Keep timeline at most 30 events
  if (state.timeline.length > 30) {
    state.timeline = state.timeline.slice(-30);
  }
}
