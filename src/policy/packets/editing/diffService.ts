export type PacketDiffScope =
  | 'section'
  | 'page'
  | 'data'
  | 'attachment'
  | 'workflow'
  | 'signature-requirement';

export type PacketDiffKind = 'added' | 'removed' | 'changed';

export interface PacketScopedDiff {
  readonly scope: PacketDiffScope;
  readonly kind: PacketDiffKind;
  readonly path: string;
  readonly before: unknown;
  readonly after: unknown;
  readonly summary: string;
}

export interface PacketVersionSnapshot {
  readonly versionId: string;
  readonly sections?: unknown;
  readonly pages?: unknown;
  readonly data?: unknown;
  readonly attachments?: unknown;
  readonly workflows?: unknown;
  readonly signatureRequirements?: unknown;
}

export interface PacketVersionDiff {
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly sectionDiffs: readonly PacketScopedDiff[];
  readonly pageDiffs: readonly PacketScopedDiff[];
  readonly dataDiffs: readonly PacketScopedDiff[];
  readonly attachmentDiffs: readonly PacketScopedDiff[];
  readonly workflowDiffs: readonly PacketScopedDiff[];
  readonly signatureRequirementDiffs: readonly PacketScopedDiff[];
  readonly diffs: readonly PacketScopedDiff[];
  readonly summary: string;
}

const keyFields = [
  'id',
  'sectionId',
  'pageId',
  'attachmentId',
  'workflowId',
  'signatureRequirementId',
  'key',
  'path',
  'title',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? 'undefined' : serialized;
  }
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

function valuesEqual(before: unknown, after: unknown): boolean {
  return stableStringify(before) === stableStringify(after);
}

function recordItemKey(value: Record<string, unknown>, fallback: string): string {
  for (const field of keyFields) {
    const candidate = value[field];
    if (typeof candidate === 'string' && candidate.trim().length > 0) return candidate;
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return String(candidate);
  }

  return fallback;
}

function indexCollection(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    return Object.fromEntries(
      value.map((item, index) => {
        const key = isRecord(item) ? recordItemKey(item, String(index)) : String(index);
        return [key, item];
      }),
    );
  }

  if (isRecord(value)) return value;
  if (value === undefined || value === null) return {};
  return { value };
}

function diffKind(before: unknown, after: unknown): PacketDiffKind {
  if (before === undefined) return 'added';
  if (after === undefined) return 'removed';
  return 'changed';
}

function scopeLabel(scope: PacketDiffScope): string {
  if (scope === 'signature-requirement') return 'signature requirement';
  return scope;
}

function buildScopedDiff(scope: PacketDiffScope, path: string, before: unknown, after: unknown): PacketScopedDiff {
  const kind = diffKind(before, after);
  const label = scopeLabel(scope);
  return {
    scope,
    kind,
    path,
    before: before === undefined ? null : before,
    after: after === undefined ? null : after,
    summary: `${label} ${path} ${kind}.`,
  };
}

function diffIndexedCollection(scope: PacketDiffScope, before: unknown, after: unknown): readonly PacketScopedDiff[] {
  const beforeIndex = indexCollection(before);
  const afterIndex = indexCollection(after);
  const keys = [...new Set([...Object.keys(beforeIndex), ...Object.keys(afterIndex)])].sort();

  return keys.flatMap((key) => {
    const beforeValue = beforeIndex[key];
    const afterValue = afterIndex[key];
    return valuesEqual(beforeValue, afterValue) ? [] : [buildScopedDiff(scope, key, beforeValue, afterValue)];
  });
}

function diffDataValue(before: unknown, after: unknown, path: string): readonly PacketScopedDiff[] {
  if (valuesEqual(before, after)) return [];

  if (isRecord(before) && isRecord(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    return keys.flatMap((key) => diffDataValue(before[key], after[key], `${path}.${key}`));
  }

  return [buildScopedDiff('data', path, before, after)];
}

function summarizeDiffs(diffs: readonly PacketScopedDiff[]): string {
  if (diffs.length === 0) return 'No section, page, data, attachment, workflow, or signature-requirement diffs.';

  const counts = diffs.reduce<Record<PacketDiffScope, number>>(
    (accumulator, diff) => ({
      ...accumulator,
      [diff.scope]: accumulator[diff.scope] + 1,
    }),
    {
      section: 0,
      page: 0,
      data: 0,
      attachment: 0,
      workflow: 0,
      'signature-requirement': 0,
    },
  );

  return `Diff includes ${counts.section} section, ${counts.page} page, ${counts.data} data, ${counts.attachment} attachment, ${counts.workflow} workflow, and ${counts['signature-requirement']} signature-requirement changes.`;
}

export function diffPacketVersions(fromSnapshot: PacketVersionSnapshot, toSnapshot: PacketVersionSnapshot): PacketVersionDiff {
  const sectionDiffs = diffIndexedCollection('section', fromSnapshot.sections, toSnapshot.sections);
  const pageDiffs = diffIndexedCollection('page', fromSnapshot.pages, toSnapshot.pages);
  const dataDiffs = diffDataValue(fromSnapshot.data, toSnapshot.data, 'data');
  const attachmentDiffs = diffIndexedCollection('attachment', fromSnapshot.attachments, toSnapshot.attachments);
  const workflowDiffs = diffIndexedCollection('workflow', fromSnapshot.workflows, toSnapshot.workflows);
  const signatureRequirementDiffs = diffIndexedCollection(
    'signature-requirement',
    fromSnapshot.signatureRequirements,
    toSnapshot.signatureRequirements,
  );
  const diffs = [
    ...sectionDiffs,
    ...pageDiffs,
    ...dataDiffs,
    ...attachmentDiffs,
    ...workflowDiffs,
    ...signatureRequirementDiffs,
  ];

  return {
    fromVersion: fromSnapshot.versionId,
    toVersion: toSnapshot.versionId,
    sectionDiffs,
    pageDiffs,
    dataDiffs,
    attachmentDiffs,
    workflowDiffs,
    signatureRequirementDiffs,
    diffs,
    summary: summarizeDiffs(diffs),
  };
}
