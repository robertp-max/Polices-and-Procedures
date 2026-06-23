/**
 * eCIgn Path B — Phase 2-live A: replica publisher SELECTOR (feature flag).
 *
 * The switch between the (default) fake reference adapter and a live-sandbox
 * adapter. DEFAULT is always fake. Live mode first requires Gate-B readiness
 * (`LiveSandboxNotReadyError` otherwise); even when ready, the live adapter is
 * INTENTIONALLY NOT IMPLEMENTED in subphase A (`LiveAdapterNotImplementedError`).
 * No Google client, no network — zero external effects.
 */
import type { ReplicaKind } from '../artifactContracts';
import { FakeReplicaPublisher } from '../replicas/fakeReplicaPublisher';
import type { ReplicaPublisher } from '../replicas/replicaPublisher';
import { assessLiveReadiness, type LiveReadinessIssue } from './liveReadiness';
import type { SandboxConfig } from './sandboxConfig';

export class LiveSandboxNotReadyError extends Error {
  readonly issues: readonly LiveReadinessIssue[];
  constructor(issues: readonly LiveReadinessIssue[]) {
    super(`live sandbox not ready: ${issues.join(', ')}`);
    this.issues = issues;
    this.name = 'LiveSandboxNotReadyError';
  }
}

export class LiveAdapterNotImplementedError extends Error {
  readonly replicaKind: ReplicaKind;
  constructor(replicaKind: ReplicaKind) {
    super(`live ${replicaKind} adapter not implemented (gated to Phase 2-live B / Gate C)`);
    this.replicaKind = replicaKind;
    this.name = 'LiveAdapterNotImplementedError';
  }
}

export interface SelectPublisherDeps {
  /** Override the fake factory (tests). */
  readonly fake?: (kind: ReplicaKind) => ReplicaPublisher;
}

/**
 * Resolve a replica publisher from config.
 * - `fake` mode → the reference fake adapter (default, fully functional).
 * - `live-sandbox` mode → requires Gate-B readiness; if ready, throws
 *   `LiveAdapterNotImplementedError` (live wiring is a later, approved subphase).
 */
export function selectReplicaPublisher(
  kind: ReplicaKind,
  cfg: SandboxConfig,
  deps: SelectPublisherDeps = {},
): ReplicaPublisher {
  const makeFake = deps.fake ?? ((k: ReplicaKind) => new FakeReplicaPublisher(k));
  if (cfg.mode === 'fake') return makeFake(kind);
  const readiness = assessLiveReadiness(cfg);
  if (!readiness.ready) throw new LiveSandboxNotReadyError(readiness.issues);
  throw new LiveAdapterNotImplementedError(kind);
}
