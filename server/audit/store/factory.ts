/**
 * Audit-store factory + configuration.
 *
 *   AUDIT_STORE_BACKEND=jsonl      (default) — file-backed JsonlAuditEventStore
 *   AUDIT_STORE_BACKEND=firestore            — transactional FirestoreAuditEventStore
 *   (any other value)                        — FAIL CLOSED at startup
 *
 * Firestore is NOT selected merely because Firestore env vars exist; it must be
 * chosen explicitly. If selected but no Firestore binding has been provisioned
 * (via configureFirestoreBinding), startup fails clearly — it never silently
 * falls back to JSONL.
 */
import type { AuditEventStore } from './auditEventStore.js';
import { JsonlAuditEventStore } from './jsonlStore.js';
import { FirestoreAuditEventStore } from './firestoreStore.js';
import type { FirestoreLike } from './firestorePort.js';
import { initAdminFirestore } from './firebaseAdmin.js';

export type AuditStoreBackend = 'jsonl' | 'firestore';

export function resolveAuditBackend(env: NodeJS.ProcessEnv = process.env): AuditStoreBackend {
  const raw = (env.AUDIT_STORE_BACKEND ?? 'jsonl').trim().toLowerCase();
  if (raw === 'jsonl' || raw === 'firestore') return raw;
  throw new Error(
    `Unknown AUDIT_STORE_BACKEND "${env.AUDIT_STORE_BACKEND}". Use "jsonl" (default) or "firestore".`,
  );
}

/**
 * A future real adapter over @google-cloud/firestore / firebase-admin (or the
 * Firestore emulator) registers its binding here. Absent a binding, selecting
 * the firestore backend fails closed.
 */
let firestoreBinding: FirestoreLike | null = null;
export function configureFirestoreBinding(binding: FirestoreLike | null): void {
  firestoreBinding = binding;
}

let singleton: AuditEventStore | null = null;

export function getAuditEventStore(): AuditEventStore {
  if (singleton) return singleton;
  const backend = resolveAuditBackend();
  if (backend === 'jsonl') {
    singleton = new JsonlAuditEventStore();
    return singleton;
  }
  // firestore — use an injected binding (tests/emulator) or initialize the real
  // Admin SDK adapter. Any init failure throws (fail closed; never JSONL).
  const binding = firestoreBinding ?? initAdminFirestore();
  singleton = new FirestoreAuditEventStore(binding);
  return singleton;
}

/** Test hook: inject a specific store (e.g., in-memory) and reset the singleton. */
export function setAuditEventStoreForTesting(store: AuditEventStore | null): void {
  singleton = store;
}
