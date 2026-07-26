import type { CasePack, PacketConflictGroup } from './engine/caseTypes';

export type PacketDisposition = 'full' | 'partial' | 'hold';

export type ConflictClassification =
  | 'reconciled'
  | 'limited_unresolved'
  | 'material_unresolved'
  | 'context_only';

export type ConflictReliance =
  | 'record_a'
  | 'record_b'
  | 'both_with_limitation'
  | 'neither_pending_validation';

export interface ConflictDetermination {
  classification: ConflictClassification | null;
  reliance: ConflictReliance | null;
  note: string;
  completedAt: string | null;
}

export interface PacketReadinessStateV2 {
  schemaVersion: 2;
  conflictDeterminations: Record<string, ConflictDetermination>;
  disposition: PacketDisposition | null;
  mattersProceeding: string[];
  mattersHeld: string[];
  followUp: {
    action: string;
    owner: string;
    dueDate: string | null;
    returnDate: string | null;
  };
  boardRationale: string;
  lockedAt: string | null;
}

export type PacketReadinessState = PacketReadinessStateV2;
export type Round0Stage = 'check' | 'conflicts' | 'decision' | 'review';

export interface Round0NextAction {
  stage: Round0Stage;
  label: string;
  targetId?: string;
  remainingCount?: number;
}

export interface PacketMatter {
  id: string;
  label: string;
}

export interface PacketReadinessCompletion {
  packetCheckComplete: boolean;
  conflictsComplete: boolean;
  dispositionSelected: boolean;
  matterScopeComplete: boolean;
  followUpRequired: boolean;
  followUpCompleteWhenRequired: boolean;
  boardRationaleComplete: boolean;
  canLock: boolean;
  firstIncomplete: Round0NextAction | null;
}

interface ConflictDeterminationV1 {
  classification?: ConflictClassification | null;
  reliedUponExhibitIds?: string[];
  note?: string;
  savedAt?: string | null;
}

interface PacketReadinessStateV1 {
  schemaVersion: 1;
  conflictDeterminations?: Record<string, ConflictDeterminationV1>;
  disposition?: PacketDisposition | null;
  rationale?: {
    verifiedEvidence?: string;
    unresolvedEvidence?: string;
    relianceScope?: string;
    followUpAction?: string;
    owner?: string;
    dueDate?: string | null;
  };
  lockedAt?: string | null;
}

const CLASSIFICATIONS: ConflictClassification[] = [
  'reconciled',
  'limited_unresolved',
  'material_unresolved',
  'context_only',
];

const RELIANCE_CHOICES: ConflictReliance[] = [
  'record_a',
  'record_b',
  'both_with_limitation',
  'neither_pending_validation',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isClassification(value: unknown): value is ConflictClassification {
  return CLASSIFICATIONS.includes(value as ConflictClassification);
}

function isReliance(value: unknown): value is ConflictReliance {
  return RELIANCE_CHOICES.includes(value as ConflictReliance);
}

function isDisposition(value: unknown): value is PacketDisposition {
  return value === 'full' || value === 'partial' || value === 'hold';
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function isPresent(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function isIsoDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isAfterSourceCutoff(
  asOfDate: string | null | undefined,
  sourceCutoff: string | null | undefined,
): boolean {
  if (!isIsoDate(asOfDate) || !isIsoDate(sourceCutoff)) return false;
  return asOfDate > sourceCutoff;
}

export function createPacketReadinessState(
  conflictGroups: readonly PacketConflictGroup[],
): PacketReadinessState {
  return {
    schemaVersion: 2,
    conflictDeterminations: Object.fromEntries(
      conflictGroups.map((group) => [
        group.id,
        {
          classification: null,
          reliance: null,
          note: '',
          completedAt: null,
        },
      ]),
    ),
    disposition: null,
    mattersProceeding: [],
    mattersHeld: [],
    followUp: {
      action: '',
      owner: '',
      dueDate: null,
      returnDate: null,
    },
    boardRationale: '',
    lockedAt: null,
  };
}

function normalizeV2Determination(value: unknown): ConflictDetermination {
  if (!isRecord(value)) {
    return {
      classification: null,
      reliance: null,
      note: '',
      completedAt: null,
    };
  }

  return {
    classification: isClassification(value.classification) ? value.classification : null,
    reliance: isReliance(value.reliance) ? value.reliance : null,
    note: text(value.note),
    completedAt: nullableText(value.completedAt),
  };
}

function migrateReliance(
  determination: ConflictDeterminationV1,
  group: PacketConflictGroup,
): ConflictReliance | null {
  const selected = determination.reliedUponExhibitIds ?? [];
  const usesA = selected.includes(group.exhibitIds[0]);
  const usesB = selected.includes(group.exhibitIds[1]);
  if (usesA && usesB) return 'both_with_limitation';
  if (usesA) return 'record_a';
  if (usesB) return 'record_b';
  if (determination.savedAt) return 'neither_pending_validation';
  return null;
}

function migrateV1(
  candidate: PacketReadinessStateV1,
  conflictGroups: readonly PacketConflictGroup[],
  casePack?: CasePack,
): PacketReadinessState {
  const fresh = createPacketReadinessState(conflictGroups);
  const previous = candidate.conflictDeterminations ?? {};
  const migratedKeys = new Set<string>();

  const conflictDeterminations = Object.fromEntries(
    conflictGroups.map((group) => {
      const related = [group.id, ...group.exhibitIds]
        .map((key) => ({ key, determination: previous[key] }))
        .filter(
          (
            item,
          ): item is { key: string; determination: ConflictDeterminationV1 } =>
            Boolean(item.determination),
        );
      if (!related.length) return [group.id, fresh.conflictDeterminations[group.id]];
      related.forEach(({ key }) => migratedKeys.add(key));
      const existing = related[0].determination;
      const migratedNotes = related
        .map(({ key, determination }) =>
          text(determination.note).trim()
            ? `${key}: ${text(determination.note).trim()}`
            : '',
        )
        .filter(Boolean);

      return [
        group.id,
        {
          classification: isClassification(existing.classification)
            ? existing.classification
            : null,
          reliance: migrateReliance(existing, group),
          note: migratedNotes.join('\n'),
          completedAt: nullableText(existing.savedAt),
        },
      ];
    }),
  );

  const rationale = candidate.rationale ?? {};
  const rationaleParts = [
    text(rationale.verifiedEvidence),
    text(rationale.unresolvedEvidence),
    text(rationale.relianceScope),
  ].filter((part) => part.trim());
  const unmatchedNotes = Object.entries(previous)
    .filter(
      ([key, determination]) =>
        !migratedKeys.has(key) && text(determination.note).trim(),
    )
    .map(
      ([key, determination]) =>
        `${key}: ${text(determination.note).trim()}`,
    );
  if (unmatchedNotes.length) {
    rationaleParts.push(`Migrated evidence notes:\n${unmatchedNotes.join('\n')}`);
  }
  const disposition = isDisposition(candidate.disposition) ? candidate.disposition : null;
  const allMatterIds = casePack ? derivePacketMatters(casePack).map((matter) => matter.id) : [];

  return {
    ...fresh,
    conflictDeterminations,
    disposition,
    mattersProceeding: disposition === 'full' ? allMatterIds : [],
    mattersHeld: disposition === 'hold' ? allMatterIds : [],
    followUp: {
      action: text(rationale.followUpAction),
      owner: text(rationale.owner),
      dueDate: nullableText(rationale.dueDate),
      returnDate: null,
    },
    boardRationale: rationaleParts.join('\n\n'),
    lockedAt: nullableText(candidate.lockedAt),
  };
}

export function normalizePacketReadinessState(
  value: unknown,
  conflictGroups: readonly PacketConflictGroup[],
  casePack?: CasePack,
): PacketReadinessState {
  const fresh = createPacketReadinessState(conflictGroups);
  if (!isRecord(value)) return fresh;

  if (value.schemaVersion === 1) {
    return migrateV1(value as unknown as PacketReadinessStateV1, conflictGroups, casePack);
  }

  if (value.schemaVersion !== 2) return fresh;

  const existingDeterminations = isRecord(value.conflictDeterminations)
    ? value.conflictDeterminations
    : {};
  const followUp = isRecord(value.followUp) ? value.followUp : {};

  return {
    schemaVersion: 2,
    conflictDeterminations: Object.fromEntries(
      conflictGroups.map((group) => [
        group.id,
        normalizeV2Determination(existingDeterminations[group.id]),
      ]),
    ),
    disposition: isDisposition(value.disposition) ? value.disposition : null,
    mattersProceeding: stringList(value.mattersProceeding),
    mattersHeld: stringList(value.mattersHeld),
    followUp: {
      action: text(followUp.action),
      owner: text(followUp.owner),
      dueDate: nullableText(followUp.dueDate),
      returnDate: nullableText(followUp.returnDate),
    },
    boardRationale: text(value.boardRationale),
    lockedAt: nullableText(value.lockedAt),
  };
}

export function derivePacketMatters(casePack: CasePack): PacketMatter[] {
  const matters = new Map<string, PacketMatter>();
  casePack.decisionNodes.forEach((node) => {
    if (!matters.has(node.matterId)) {
      matters.set(node.matterId, {
        id: node.matterId,
        label: node.title,
      });
    }
  });
  return [...matters.values()];
}

export function isConflictDeterminationComplete(
  determination: ConflictDetermination | undefined,
): boolean {
  return Boolean(
    determination?.classification &&
      determination.reliance &&
      isPresent(determination.note) &&
      determination.completedAt,
  );
}

export function packetRequiresFollowUp(state: PacketReadinessState): boolean {
  const unresolved = Object.values(state.conflictDeterminations).some(
    ({ classification }) =>
      classification === 'limited_unresolved' || classification === 'material_unresolved',
  );
  return state.disposition === 'partial' || state.disposition === 'hold' || unresolved;
}

function hasCompleteMatterScope(state: PacketReadinessState, casePack: CasePack): boolean {
  if (!state.disposition) return false;
  const matterIds = derivePacketMatters(casePack).map((matter) => matter.id);
  const proceeding = new Set(state.mattersProceeding);
  const held = new Set(state.mattersHeld);
  const noOverlap = [...proceeding].every((id) => !held.has(id));
  const coversAll = matterIds.every((id) => proceeding.has(id) || held.has(id));
  const onlyKnown = [...proceeding, ...held].every((id) => matterIds.includes(id));
  if (!noOverlap || !coversAll || !onlyKnown) return false;
  if (state.disposition === 'full') {
    return matterIds.every((id) => proceeding.has(id)) && held.size === 0;
  }
  if (state.disposition === 'hold') {
    return matterIds.every((id) => held.has(id)) && proceeding.size === 0;
  }
  return proceeding.size > 0 && held.size > 0;
}

function nextIncompleteAction(
  state: PacketReadinessState,
  casePack: CasePack,
): Round0NextAction | null {
  const groups = casePack.packetConflictGroups;
  const incompleteGroups = groups.filter(
    (group) => !isConflictDeterminationComplete(state.conflictDeterminations[group.id]),
  );
  if (incompleteGroups.length > 0) {
    const completedCount = groups.length - incompleteGroups.length;
    return {
      stage: completedCount === 0 ? 'check' : 'conflicts',
      label: `Review ${incompleteGroups.length} evidence problem${
        incompleteGroups.length === 1 ? '' : 's'
      }`,
      targetId: incompleteGroups[0].id,
      remainingCount: incompleteGroups.length,
    };
  }

  if (!state.disposition) {
    return {
      stage: 'decision',
      label: 'Choose what the Board may do',
      targetId: 'round0-disposition',
    };
  }

  if (!hasCompleteMatterScope(state, casePack)) {
    return {
      stage: 'decision',
      label: 'Select which matters may proceed',
      targetId: 'round0-matter-scope',
    };
  }

  if (packetRequiresFollowUp(state)) {
    if (!isPresent(state.followUp.action)) {
      return {
        stage: 'decision',
        label: 'Add a follow-up action',
        targetId: 'round0-follow-up-action',
      };
    }
    if (!isPresent(state.followUp.owner)) {
      return {
        stage: 'decision',
        label: 'Assign a follow-up owner',
        targetId: 'round0-follow-up-owner',
      };
    }
    if (!isIsoDate(state.followUp.dueDate)) {
      return {
        stage: 'decision',
        label: 'Add a follow-up due date',
        targetId: 'round0-follow-up-due',
      };
    }
    if (!isIsoDate(state.followUp.returnDate)) {
      return {
        stage: 'decision',
        label: 'Add a return-to-Board date',
        targetId: 'round0-follow-up-return',
      };
    }
  }

  if (!isPresent(state.boardRationale)) {
    return {
      stage: 'decision',
      label: 'Add the Board rationale',
      targetId: 'round0-board-rationale',
    };
  }

  return null;
}

export function getRound0NextAction(
  state: PacketReadinessState,
  casePack: CasePack,
): Round0NextAction {
  return (
    nextIncompleteAction(state, casePack) ?? {
      stage: 'review',
      label: 'Lock Round 0 and continue',
      targetId: 'round0-lock',
    }
  );
}

export function getPacketReadinessCompletion(
  state: PacketReadinessState,
  casePack: CasePack,
): PacketReadinessCompletion {
  const conflictsComplete = casePack.packetConflictGroups.every((group) =>
    isConflictDeterminationComplete(state.conflictDeterminations[group.id]),
  );
  const dispositionSelected = state.disposition !== null;
  const matterScopeComplete = hasCompleteMatterScope(state, casePack);
  const followUpRequired = packetRequiresFollowUp(state);
  const followUpCompleteWhenRequired =
    !followUpRequired ||
    (isPresent(state.followUp.action) &&
      isPresent(state.followUp.owner) &&
      isIsoDate(state.followUp.dueDate) &&
      isIsoDate(state.followUp.returnDate));
  const boardRationaleComplete = isPresent(state.boardRationale);
  const firstIncomplete = nextIncompleteAction(state, casePack);

  return {
    packetCheckComplete: true,
    conflictsComplete,
    dispositionSelected,
    matterScopeComplete,
    followUpRequired,
    followUpCompleteWhenRequired,
    boardRationaleComplete,
    canLock: state.lockedAt === null && firstIncomplete === null,
    firstIncomplete,
  };
}

export interface BoardRecordPreview {
  disposition: string;
  unresolvedEvidence: BoardRecordEvidenceIssue[];
  mattersProceeding: string[];
  mattersHeld: string[];
  followUp: string | null;
  rationale: string;
}

export interface BoardRecordEvidenceIssue {
  id: string;
  title: string;
  recordIds: string[];
  sourceCutoff: string;
  classification: string;
  boardDecision: string;
  affectedMatters: string[];
  note: string;
}

const CLASSIFICATION_LABELS: Record<ConflictClassification, string> = {
  reconciled: 'Reconciled',
  limited_unresolved: 'Unresolved for named matters',
  material_unresolved: 'Unresolved for the whole packet',
  context_only: 'Context only',
};

const RELIANCE_LABELS: Record<ConflictReliance, string> = {
  record_a: 'Rely on Record A',
  record_b: 'Rely on Record B',
  both_with_limitation: 'Rely on both with a limitation',
  neither_pending_validation: 'Rely on neither pending validation',
};

const DISPOSITION_LABELS: Record<PacketDisposition, string> = {
  full: 'Proceed on all matters — Full reliance',
  partial: 'Proceed only on unaffected matters — Partial reliance',
  hold: 'Do not use this packet — Hold',
};

export function buildBoardRecordPreview(
  state: PacketReadinessState,
  casePack: CasePack,
): BoardRecordPreview {
  const matterLabels = new Map(
    derivePacketMatters(casePack).map((matter) => [matter.id, matter.label]),
  );
  const unresolvedEvidence = casePack.packetConflictGroups.flatMap((group) => {
    const determination = state.conflictDeterminations[group.id];
    if (
      determination?.classification !== 'limited_unresolved' &&
      determination?.classification !== 'material_unresolved'
    ) {
      return [];
    }

    return [
      {
        id: group.id,
        title: group.title,
        recordIds: group.exhibitIds.map(
          (exhibitId) =>
            casePack.exhibits.find((exhibit) => exhibit.id === exhibitId)?.sourceId ??
            exhibitId,
        ),
        sourceCutoff: group.sourceCutoff,
        classification: CLASSIFICATION_LABELS[determination.classification],
        boardDecision: determination.reliance
          ? RELIANCE_LABELS[determination.reliance]
          : 'Board decision not selected',
        affectedMatters: group.affectedMatterIds.map(
          (id) => matterLabels.get(id) ?? id,
        ),
        note: determination.note,
      },
    ];
  });
  const followUp = packetRequiresFollowUp(state)
    ? [
        state.followUp.action,
        state.followUp.owner ? `Owner: ${state.followUp.owner}` : '',
        state.followUp.dueDate ? `Due: ${state.followUp.dueDate}` : '',
        state.followUp.returnDate ? `Return to Board: ${state.followUp.returnDate}` : '',
      ]
        .filter(Boolean)
        .join(' · ')
    : null;

  return {
    disposition: state.disposition
      ? DISPOSITION_LABELS[state.disposition]
      : 'No disposition selected',
    unresolvedEvidence,
    mattersProceeding: state.mattersProceeding.map(
      (id) => matterLabels.get(id) ?? id,
    ),
    mattersHeld: state.mattersHeld.map((id) => matterLabels.get(id) ?? id),
    followUp,
    rationale: state.boardRationale,
  };
}
