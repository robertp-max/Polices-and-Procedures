/* ═══════════════════════════════════════════════════════════════════════════
   CONTROL REGISTRY — server-authoritative operational store (P5).
   ----------------------------------------------------------------------------
   Separates control DEFINITION (the canonical 116-control registry, read-only
   here) from OPERATIONAL STATE: scope instances, evidence artifacts,
   verification executions, sign-offs, deficiencies, corrective actions, waivers,
   and an append-only audit trail. Versioned + optimistic-concurrency + idempotent.

   Persistence is an append-only JSONL ledger (single-instance local adapter,
   consistent with the repo's audit-store pattern). Swap for an approved
   multi-instance provider (e.g. Firestore) at production activation — the store
   interface is deliberately narrow so that swap is mechanical.

   Readiness is NOT recomputed here — it delegates to the ONE engine in
   controlReadinessEngine.ts so no surface can disagree.
   ═══════════════════════════════════════════════════════════════════════════ */
import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { deriveControlReadiness, type ControlReadinessResult } from '../../src/policy/data/controlReadinessEngine.js';

export type EvidenceReviewStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CORRECTION_REQUESTED';
export type DeficiencySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SignoffDecision = 'APPROVED' | 'DECLINED';

export interface EvidenceArtifact {
  id: string; controlId: string; instanceId?: string; requirementId?: string;
  title: string; documentType: string; sourceProvider: string; sourceRecordId?: string;
  effectiveDate?: string; expirationDate?: string; uploadedAt: string; actor: string;
  phiClassification: 'NONE' | 'SYNTHETIC' | 'PHI'; hash: string;
  reviewStatus: EvidenceReviewStatus; reviewer?: string; reviewedAt?: string; rejectionReason?: string;
  supersedesArtifactId?: string; legalHold: boolean;
}
export interface VerificationExecution {
  id: string; controlId: string; instanceId?: string; method: string; period?: string;
  sampleSize?: number; findings?: string; effectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE' | 'NOT_TESTED';
  nextDueDate?: string; verifier: string; performedAt: string;
}
export interface SignoffExecution {
  id: string; controlId: string; requirementId?: string; signer: string; verifiedRole: string;
  attestationVersion: string; decision: SignoffDecision; signedAt: string; artifactHash?: string; revoked: boolean;
}
export interface Deficiency {
  id: string; controlId: string; severity: DeficiencySeverity; condition: string;
  correctiveActionRequired: boolean; owner?: string; dueDate?: string; status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  openedAt: string; closedAt?: string; closureApprover?: string;
}
export interface Waiver {
  id: string; controlId: string; requirementId?: string; reason: string; approver: string;
  effectiveFrom: string; effectiveTo?: string; revoked: boolean;
}
export interface ScopeInstance {
  id: string; controlId: string; scopeLabel: string; applicable: boolean; createdAt: string; actor: string;
}
export interface ControlAuditEvent {
  id: string; controlId: string; entity: string; action: string; actor: string; at: string; ref?: string;
}

interface ControlState {
  instances: ScopeInstance[]; evidence: EvidenceArtifact[]; verifications: VerificationExecution[];
  signoffs: SignoffExecution[]; deficiencies: Deficiency[]; waivers: Waiver[]; version: number;
}

const DATA_DIR = process.env.CONTROL_REGISTRY_STORE_DIR || path.join(process.cwd(), 'data', 'control-registry');
const LEDGER = path.join(DATA_DIR, 'events.jsonl');
const nowIso = (nowIsoOverride?: string): string => nowIsoOverride ?? new Date().toISOString();

export class ControlRegistryStore {
  private readonly byControl = new Map<string, ControlState>();
  private readonly seenIdempotency = new Set<string>();
  private readonly persist: boolean;

  constructor(opts: { persist?: boolean } = {}) {
    this.persist = opts.persist ?? process.env.NODE_ENV === 'production';
    if (this.persist && !existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  }

  private state(controlId: string): ControlState {
    let s = this.byControl.get(controlId);
    if (!s) { s = { instances: [], evidence: [], verifications: [], signoffs: [], deficiencies: [], waivers: [], version: 0 }; this.byControl.set(controlId, s); }
    return s;
  }

  private audit(ev: Omit<ControlAuditEvent, 'id' | 'at'>, at?: string): void {
    const rec: ControlAuditEvent = { id: randomUUID(), at: nowIso(at), ...ev };
    if (this.persist) { try { appendFileSync(LEDGER, JSON.stringify(rec) + '\n'); } catch { /* best effort */ } }
  }

  /** Idempotency guard: returns true if this key was already applied. */
  private duplicate(key?: string): boolean {
    if (!key) return false;
    if (this.seenIdempotency.has(key)) return true;
    this.seenIdempotency.add(key);
    return false;
  }

  addInstance(i: Omit<ScopeInstance, 'id' | 'createdAt'>, opts: { idempotencyKey?: string; at?: string } = {}): ScopeInstance {
    const s = this.state(i.controlId);
    if (this.duplicate(opts.idempotencyKey)) return s.instances[s.instances.length - 1];
    const rec: ScopeInstance = { id: randomUUID(), createdAt: nowIso(opts.at), ...i };
    s.instances.push(rec); s.version += 1;
    this.audit({ controlId: i.controlId, entity: 'scope_instance', action: 'created', actor: i.actor, ref: rec.id }, opts.at);
    return rec;
  }
  addEvidence(a: Omit<EvidenceArtifact, 'id' | 'uploadedAt' | 'reviewStatus' | 'legalHold'> & Partial<Pick<EvidenceArtifact, 'reviewStatus' | 'legalHold'>>, opts: { idempotencyKey?: string; at?: string } = {}): EvidenceArtifact {
    const s = this.state(a.controlId);
    const rec: EvidenceArtifact = { id: randomUUID(), uploadedAt: nowIso(opts.at), reviewStatus: a.reviewStatus ?? 'PENDING', legalHold: a.legalHold ?? false, ...a };
    if (this.duplicate(opts.idempotencyKey)) return rec;
    s.evidence.push(rec); s.version += 1;
    this.audit({ controlId: a.controlId, entity: 'evidence', action: 'added', actor: a.actor, ref: rec.id }, opts.at);
    return rec;
  }
  reviewEvidence(controlId: string, artifactId: string, decision: EvidenceReviewStatus, reviewer: string, reason?: string, at?: string): EvidenceArtifact | null {
    const s = this.state(controlId); const art = s.evidence.find((e) => e.id === artifactId); if (!art) return null;
    art.reviewStatus = decision; art.reviewer = reviewer; art.reviewedAt = nowIso(at); if (reason) art.rejectionReason = reason;
    s.version += 1; this.audit({ controlId, entity: 'evidence', action: `review:${decision}`, actor: reviewer, ref: artifactId }, at);
    return art;
  }
  addVerification(v: Omit<VerificationExecution, 'id' | 'performedAt'>, opts: { at?: string } = {}): VerificationExecution {
    const s = this.state(v.controlId); const rec: VerificationExecution = { id: randomUUID(), performedAt: nowIso(opts.at), ...v };
    s.verifications.push(rec); s.version += 1;
    this.audit({ controlId: v.controlId, entity: 'verification', action: 'recorded', actor: v.verifier, ref: rec.id }, opts.at);
    return rec;
  }
  addSignoff(so: Omit<SignoffExecution, 'id' | 'signedAt' | 'revoked'>, opts: { at?: string } = {}): SignoffExecution {
    const s = this.state(so.controlId); const rec: SignoffExecution = { id: randomUUID(), signedAt: nowIso(opts.at), revoked: false, ...so };
    s.signoffs.push(rec); s.version += 1;
    this.audit({ controlId: so.controlId, entity: 'signoff', action: `decision:${so.decision}`, actor: so.signer, ref: rec.id }, opts.at);
    return rec;
  }
  openDeficiency(d: Omit<Deficiency, 'id' | 'openedAt' | 'status'>, opts: { at?: string } = {}): Deficiency {
    const s = this.state(d.controlId); const rec: Deficiency = { id: randomUUID(), openedAt: nowIso(opts.at), status: 'OPEN', ...d };
    s.deficiencies.push(rec); s.version += 1;
    this.audit({ controlId: d.controlId, entity: 'deficiency', action: `opened:${d.severity}`, actor: d.owner ?? 'system', ref: rec.id }, opts.at);
    return rec;
  }
  addWaiver(w: Omit<Waiver, 'id' | 'revoked'>, opts: { at?: string } = {}): Waiver {
    const s = this.state(w.controlId); const rec: Waiver = { id: randomUUID(), revoked: false, ...w };
    s.waivers.push(rec); s.version += 1;
    this.audit({ controlId: w.controlId, entity: 'waiver', action: 'granted', actor: w.approver, ref: rec.id }, opts.at);
    return rec;
  }

  getState(controlId: string): ControlState { return this.state(controlId); }

  /** Readiness via the ONE shared engine, computed from operational records. */
  readiness(controlId: string, def: { hasRequiredDocs: boolean; hasEvidenceRequirements: boolean; hasSignoffRequirements: boolean; requiredDocsPresentAndCurrent: boolean; now?: string }): ControlReadinessResult {
    const s = this.state(controlId);
    const now = def.now ? Date.parse(def.now) : Date.now();
    const acceptedEvidence = s.evidence.filter((e) => e.reviewStatus === 'ACCEPTED');
    const anyExpired = acceptedEvidence.some((e) => e.expirationDate && Date.parse(e.expirationDate) < now);
    const openCritical = s.deficiencies.some((d) => d.status !== 'CLOSED' && (d.severity === 'CRITICAL' || d.severity === 'HIGH'));
    const overdueVerification = s.verifications.some((v) => v.nextDueDate && Date.parse(v.nextDueDate) < now);
    return deriveControlReadiness({
      definitionApproved: true,
      applicable: s.instances.length === 0 ? true : s.instances.some((i) => i.applicable),
      hasRequiredDocs: def.hasRequiredDocs,
      hasEvidenceRequirements: def.hasEvidenceRequirements,
      hasSignoffRequirements: def.hasSignoffRequirements,
      requiredDocsPresentAndCurrent: def.requiredDocsPresentAndCurrent,
      requiredEvidencePresentAndAccepted: acceptedEvidence.length > 0,
      anyRequiredEvidenceExpired: anyExpired,
      requiredVerificationComplete: s.verifications.some((v) => v.effectiveness === 'EFFECTIVE'),
      verificationOverdue: overdueVerification,
      requiredSignoffsComplete: s.signoffs.some((so) => so.decision === 'APPROVED' && !so.revoked),
      openCriticalDeficiency: openCritical,
      overdueRequiredAction: s.deficiencies.some((d) => d.status !== 'CLOSED' && d.dueDate && Date.parse(d.dueDate) < now),
      implementationComplete: acceptedEvidence.length > 0,
    });
  }
}

export const LEDGER_PATH = LEDGER;
