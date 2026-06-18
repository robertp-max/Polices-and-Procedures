/* ═══════════════════════════════════════════════════════════════════
   Canonical CES signed-package resolver.

   After eCIgn finalization, the signed document is promoted into exactly one
   canonical CES evidence artifact (artifactType `signed_package`) stored in
   the regulatory execution store and keyed by the canonical form-instance id.
   This is the SAME artifact surfaced by the Artifact Viewer, Evidence Center,
   Audit Mode, and the task/event completion gates.

   This helper resolves that artifact from the execution store's evidence map
   by canonical ids so the finalize confirmation panel reports the real
   canonical evidence (not the isolated HHC mirror path, which is non-canonical for CES).

   It deliberately accepts a minimal structural shape (not the full
   `EvidenceDoc`) so it stays decoupled and unit-testable.
   ═══════════════════════════════════════════════════════════════════ */

export interface SignedPackageLike {
  id: string;
  linkedFormInstanceId?: string;
  artifactType?: string;
  kind?: string;
  status?: string;
  supersededAt?: string;
  driveFileId?: string;
  driveUploadStatus?: string;
  webViewLink?: string;
}

export interface CanonicalEvidenceQuery {
  /** The CES event id (and its instance aliases) the signing belongs to. */
  eventId: string;
  /** The canonical CES form-instance id the artifact is bound to. */
  formInstanceId: string;
  /** Additional event-instance aliases for the same source event. */
  eventAliases?: readonly string[];
}

const SIGNED_PACKAGE_TYPES = new Set(['signed_package', 'signed_form_instance']);

function isSignedPackage(doc: SignedPackageLike): boolean {
  return SIGNED_PACKAGE_TYPES.has(doc.artifactType ?? '') || doc.kind === 'signed_package';
}

/**
 * Returns every non-superseded canonical signed-package artifact bound to the
 * given canonical form-instance id, de-duplicated across event aliases.
 */
export function resolveCanonicalSignedPackages<T extends SignedPackageLike>(
  evidenceByEvent: Record<string, T[] | undefined>,
  query: CanonicalEvidenceQuery,
): T[] {
  const { eventId, formInstanceId } = query;
  if (!eventId || !formInstanceId) return [];

  const aliases = [eventId, ...(query.eventAliases ?? [])];
  const seen = new Set<string>();
  const matches: T[] = [];

  for (const alias of aliases) {
    if (!alias) continue;
    for (const doc of evidenceByEvent[alias] ?? []) {
      if (!doc || seen.has(doc.id)) continue;
      seen.add(doc.id);
      if (
        doc.linkedFormInstanceId === formInstanceId
        && isSignedPackage(doc)
        && doc.status !== 'SUPERSEDED'
        && !doc.supersededAt
      ) {
        matches.push(doc);
      }
    }
  }

  return matches;
}
