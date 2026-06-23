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
import { DriveSandboxPublisher, type AsyncReplicaPublisher, type DriveClient } from './driveSandboxPublisher';

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

export interface SelectLiveDriveDeps {
  /** Injected Drive transport (fake in tests; real `createLiveDriveClient` in the manual proof). */
  readonly client: DriveClient;
}

/**
 * Live-sandbox Drive publisher (async). Requires `live-sandbox` mode + Gate-B
 * readiness + a sandbox folder id + an injected `DriveClient`; otherwise throws
 * `LiveSandboxNotReadyError`. The Evidence Center live adapter remains gated to a
 * later subphase. (Drive live is async, so it is intentionally NOT returned by the
 * synchronous `selectReplicaPublisher`, which keeps fake as the default.)
 */
export function selectLiveDrivePublisher(cfg: SandboxConfig, deps: SelectLiveDriveDeps): AsyncReplicaPublisher {
  if (cfg.mode !== 'live-sandbox') throw new LiveSandboxNotReadyError(['sandbox_disabled']);
  const readiness = assessLiveReadiness(cfg);
  if (!readiness.ready) throw new LiveSandboxNotReadyError(readiness.issues);
  if (cfg.sandboxDriveFolderId === undefined) throw new LiveSandboxNotReadyError(['missing_sandbox_folder']);
  return new DriveSandboxPublisher({ client: deps.client, sandboxFolderId: cfg.sandboxDriveFolderId });
}
