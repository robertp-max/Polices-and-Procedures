export type PacketDisposition = 'full' | 'partial' | 'hold';

export type ConflictClassification =
  | 'reconciled'
  | 'limited_unresolved'
  | 'material_unresolved'
  | 'context_only';

export interface ConflictDetermination {
  classification: ConflictClassification | null;
  reliedUponExhibitIds: string[];
  note: string;
  savedAt: string | null;
}

export interface PacketReadinessState {
  schemaVersion: 1;
  reviewedCriterionIds: string[];
  conflictDeterminations: Record<string, ConflictDetermination>;
  disposition: PacketDisposition | null;
  rationale: {
    verifiedEvidence: string;
    unresolvedEvidence: string;
    relianceScope: string;
    followUpAction: string;
    owner: string;
    dueDate: string | null;
  };
  lockedAt: string | null;
}

export interface PacketReadinessCaseData {
  checks: Array<{ id: string }>;
  requiredConflictIds: string[];
}

export interface PacketReadinessCompletion {
  allCriteriaReviewed: boolean;
  allMaterialConflictsClassified: boolean;
  dispositionSelected: boolean;
  rationaleComplete: boolean;
  followUpCompleteWhenRequired: boolean;
  canLock: boolean;
  blockers: string[];
}

export function createPacketReadinessState(requiredConflictIds: string[]): PacketReadinessState {
  return {
    schemaVersion: 1,
    reviewedCriterionIds: [],
    conflictDeterminations: Object.fromEntries(
      requiredConflictIds.map((id) => [
        id,
        {
          classification: null,
          reliedUponExhibitIds: [],
          note: '',
          savedAt: null,
        },
      ]),
    ),
    disposition: null,
    rationale: {
      verifiedEvidence: '',
      unresolvedEvidence: '',
      relianceScope: '',
      followUpAction: '',
      owner: '',
      dueDate: null,
    },
    lockedAt: null,
  };
}

export function normalizePacketReadinessState(
  value: unknown,
  requiredConflictIds: string[],
): PacketReadinessState {
  const fresh = createPacketReadinessState(requiredConflictIds);
  if (!value || typeof value !== 'object') return fresh;
  const candidate = value as Partial<PacketReadinessState>;
  if (candidate.schemaVersion !== 1) return fresh;

  const conflictDeterminations = Object.fromEntries(
    requiredConflictIds.map((id) => {
      const existing = candidate.conflictDeterminations?.[id];
      return [
        id,
        existing
          ? {
              classification: existing.classification ?? null,
              reliedUponExhibitIds: existing.reliedUponExhibitIds ?? [],
              note: existing.note ?? '',
              savedAt: existing.savedAt ?? null,
            }
          : fresh.conflictDeterminations[id],
      ];
    }),
  );

  return {
    ...fresh,
    reviewedCriterionIds: candidate.reviewedCriterionIds ?? [],
    conflictDeterminations,
    disposition: candidate.disposition ?? null,
    rationale: {
      ...fresh.rationale,
      ...candidate.rationale,
    },
    lockedAt: candidate.lockedAt ?? null,
  };
}

function isPresent(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function getPacketReadinessCompletion(
  state: PacketReadinessState,
  caseData: PacketReadinessCaseData,
): PacketReadinessCompletion {
  const allCriteriaReviewed = caseData.checks.every((check) =>
    state.reviewedCriterionIds.includes(check.id),
  );
  const allMaterialConflictsClassified = caseData.requiredConflictIds.every((id) => {
    const determination = state.conflictDeterminations[id];
    return Boolean(
      determination?.classification &&
        isPresent(determination.note) &&
        determination.savedAt,
    );
  });
  const dispositionSelected = state.disposition !== null;
  const rationaleComplete =
    isPresent(state.rationale.verifiedEvidence) &&
    isPresent(state.rationale.unresolvedEvidence) &&
    isPresent(state.rationale.relianceScope);
  const hasUnresolvedConflict = Object.values(state.conflictDeterminations).some(
    ({ classification }) =>
      classification === 'limited_unresolved' || classification === 'material_unresolved',
  );
  const followUpRequired =
    state.disposition === 'partial' || state.disposition === 'hold' || hasUnresolvedConflict;
  const followUpCompleteWhenRequired =
    !followUpRequired ||
    (isPresent(state.rationale.followUpAction) &&
      isPresent(state.rationale.owner) &&
      isPresent(state.rationale.dueDate));

  const blockers: string[] = [];
  if (!allCriteriaReviewed) blockers.push('Review every packet-readiness criterion.');
  if (!allMaterialConflictsClassified) {
    blockers.push('Classify every material conflict and save a determination note.');
  }
  if (!dispositionSelected) blockers.push('Select a Board disposition.');
  if (!isPresent(state.rationale.verifiedEvidence)) {
    blockers.push('Identify the evidence that was verified.');
  }
  if (!isPresent(state.rationale.unresolvedEvidence)) {
    blockers.push('State what remains unresolved, or enter "None".');
  }
  if (!isPresent(state.rationale.relianceScope)) {
    blockers.push('Document which matters may or may not be relied upon.');
  }
  if (!followUpCompleteWhenRequired) {
    blockers.push('Assign the required follow-up action, owner, and due date.');
  }

  const canLock =
    state.lockedAt === null &&
    allCriteriaReviewed &&
    allMaterialConflictsClassified &&
    dispositionSelected &&
    rationaleComplete &&
    followUpCompleteWhenRequired;

  return {
    allCriteriaReviewed,
    allMaterialConflictsClassified,
    dispositionSelected,
    rationaleComplete,
    followUpCompleteWhenRequired,
    canLock,
    blockers,
  };
}
