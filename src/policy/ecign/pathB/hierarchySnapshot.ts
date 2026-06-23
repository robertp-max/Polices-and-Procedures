/**
 * eCIgn Path B — Phase 1 contract: immutable signer-hierarchy snapshot.
 *
 * When an artifact family enters `prepared_for_signature`, the signer hierarchy
 * in force is captured as an immutable snapshot for that family. Reuses the
 * existing `SignerRole` / `ECIgnPermissionRole` / `ProductionSignerTier` types.
 * CONTRACT ONLY.
 */
import type { ECIgnPermissionRole, SignerRole } from '../types';
import type { ProductionSignerTier } from '../signerAuthority';
import type { AuthorityDomain } from '../signerAuthority';
import type { EventId, HierarchySnapshotId, IsoTimestamp } from './ids';

export interface HierarchySnapshot {
  readonly snapshotId: HierarchySnapshotId;
  readonly domain: AuthorityDomain;
  readonly eventId: EventId;
  /** Ordered, ascending, unique required tiers (e.g. [1,2,5]). */
  readonly orderedRequiredTiers: readonly ProductionSignerTier[];
  /** Allowed signer roles per tier (keyed by tier number). */
  readonly requiredRolesByTier: Readonly<Record<number, readonly SignerRole[]>>;
  /** Minimum eCIgn permission required per tier (keyed by tier number). */
  readonly requiredPermissionByTier: Readonly<Record<number, ECIgnPermissionRole>>;
  readonly governingBodyRequired: boolean;
  /** When true, one signer identity may not satisfy two tiers (no self-approval). */
  readonly blocksSelfApproval: boolean;
  readonly capturedAt: IsoTimestamp;
}

/** A concrete signer assignment to a tier (used by self-approval / progression checks). */
export interface TierSignerAssignment {
  readonly signerTier: ProductionSignerTier;
  readonly signerId: string;
}
