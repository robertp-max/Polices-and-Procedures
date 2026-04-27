/**
 * CEU registry — read-only projection over existing engines.
 * ─────────────────────────────────────────────────────────────────────────────
 * The onboarding engine (and future domain engines) own their persistence.
 * The registry exposes a uniform CEU view by mapping each domain's records
 * into the canonical `ExecutionUnit` shape.
 *
 * For now we provide:
 *   - registerAdapter(): hook for any domain engine to expose its CEUs.
 *   - listAll() / get(): read-through to all registered adapters.
 *
 * The onboarding adapter is intentionally a stub here: the existing engine
 * does not yet emit CEUs in this exact shape, so the adapter returns an empty
 * list until the engine is wired up. This is documented in
 * `Builder/Enterprise/06-System-Alignment.md` §13 (deferred blockers).
 */
import type { ExecutionUnit, ExecutionBatch, CeuDomain } from './types.js';

export interface CeuAdapter {
  domain: CeuDomain;
  listCeus(filter?: { state?: string; subject_user_id?: string; limit?: number }): Promise<ExecutionUnit[]>;
  getCeu(ceu_id: string): Promise<ExecutionUnit | null>;
  listBatches(filter?: { state?: string; subject_user_id?: string; limit?: number }): Promise<ExecutionBatch[]>;
  getBatch(batch_id: string): Promise<ExecutionBatch | null>;
}

const adapters = new Map<CeuDomain, CeuAdapter>();

export function registerAdapter(adapter: CeuAdapter): void {
  adapters.set(adapter.domain, adapter);
}

export function listAdapters(): CeuAdapter[] {
  return Array.from(adapters.values());
}

export async function listAllCeus(filter?: {
  domain?: CeuDomain;
  state?: string;
  subject_user_id?: string;
  limit?: number;
}): Promise<ExecutionUnit[]> {
  const targets = filter?.domain
    ? [adapters.get(filter.domain)].filter((a): a is CeuAdapter => !!a)
    : Array.from(adapters.values());
  const out: ExecutionUnit[] = [];
  for (const a of targets) {
    out.push(...await a.listCeus({
      state: filter?.state,
      subject_user_id: filter?.subject_user_id,
      limit: filter?.limit,
    }));
  }
  if (filter?.limit) return out.slice(0, filter.limit);
  return out;
}

export async function getCeu(ceu_id: string): Promise<ExecutionUnit | null> {
  for (const a of adapters.values()) {
    const r = await a.getCeu(ceu_id);
    if (r) return r;
  }
  return null;
}

export async function listAllBatches(filter?: {
  domain?: CeuDomain;
  state?: string;
  subject_user_id?: string;
  limit?: number;
}): Promise<ExecutionBatch[]> {
  const targets = filter?.domain
    ? [adapters.get(filter.domain)].filter((a): a is CeuAdapter => !!a)
    : Array.from(adapters.values());
  const out: ExecutionBatch[] = [];
  for (const a of targets) {
    out.push(...await a.listBatches({
      state: filter?.state,
      subject_user_id: filter?.subject_user_id,
      limit: filter?.limit,
    }));
  }
  if (filter?.limit) return out.slice(0, filter.limit);
  return out;
}

export async function getBatch(batch_id: string): Promise<ExecutionBatch | null> {
  for (const a of adapters.values()) {
    const r = await a.getBatch(batch_id);
    if (r) return r;
  }
  return null;
}
