import { TONE_TOKENS, type Tone, type ToneTokens } from './tokens';

export const REQUIRED_STATUS_CODES = [
  'draft',
  'brad-draft',
  'review-required',
  'in-review',
  'returned',
  'approved',
  'signed',
  'locked',
  'superseded',
  'missing-evidence',
  'blocked',
  'warning',
  'complete',
  'active',
  'inactive',
  'error',
  'pending',
  'uploaded',
  'validated',
  'promoted',
  'archived',
] as const;

export const SECTION_17_STATUS_CODES = [
  'ready',
  'attention',
  'passed',
  'certified',
  'awaiting',
  'upcoming',
  'backlog',
  'info',
  'review',
] as const;

export type RequiredStatusCode = (typeof REQUIRED_STATUS_CODES)[number];
export type Section17StatusCode = (typeof SECTION_17_STATUS_CODES)[number];
export type StatusCode = RequiredStatusCode | Section17StatusCode;

export type StatusIndicatorKind = 'dot' | 'icon';

export type StatusIndicatorSemantic =
  | 'active'
  | 'approved'
  | 'archived'
  | 'attention'
  | 'awaiting'
  | 'backlog'
  | 'blocked'
  | 'certified'
  | 'complete'
  | 'draft'
  | 'error'
  | 'info'
  | 'inactive'
  | 'locked'
  | 'missing-evidence'
  | 'passed'
  | 'pending'
  | 'promoted'
  | 'ready'
  | 'returned'
  | 'review'
  | 'review-required'
  | 'signed'
  | 'superseded'
  | 'unknown'
  | 'upcoming'
  | 'uploaded'
  | 'validated'
  | 'warning';

export interface StatusIndicator {
  kind: StatusIndicatorKind;
  semantic: StatusIndicatorSemantic;
}

export interface ToneEntry {
  tone: Tone;
  label: string;
  indicator: StatusIndicator;
  tokens: ToneTokens;
}

const dot = (semantic: StatusIndicatorSemantic): StatusIndicator => ({ kind: 'dot', semantic });
const icon = (semantic: StatusIndicatorSemantic): StatusIndicator => ({ kind: 'icon', semantic });

const entry = (
  tone: Tone,
  label: string,
  indicator: StatusIndicator,
): ToneEntry => ({
  tone,
  label,
  indicator,
  tokens: TONE_TOKENS[tone],
});

export const STATUS_TONE = {
  draft: entry('slate', 'Draft', icon('draft')),
  'brad-draft': entry('slate', 'Brad Draft', icon('draft')),
  'review-required': entry('orange', 'Review Required', icon('review-required')),
  'in-review': entry('violet', 'In Review', icon('review')),
  returned: entry('orange', 'Returned', icon('returned')),
  approved: entry('green', 'Approved', icon('approved')),
  signed: entry('green', 'Signed', icon('signed')),
  locked: entry('slate', 'Locked', icon('locked')),
  superseded: entry('slate', 'Superseded', icon('superseded')),
  'missing-evidence': entry('orange', 'Missing Evidence', icon('missing-evidence')),
  blocked: entry('orange', 'Blocked', icon('blocked')),
  warning: entry('orange', 'Warning', icon('warning')),
  complete: entry('teal', 'Complete', icon('complete')),
  active: entry('teal', 'Active', dot('active')),
  inactive: entry('slate', 'Inactive', dot('inactive')),
  error: entry('red', 'Error', icon('error')),
  pending: entry('amber', 'Pending', dot('pending')),
  uploaded: entry('blue', 'Uploaded', icon('uploaded')),
  validated: entry('green', 'Validated', icon('validated')),
  promoted: entry('violet', 'Promoted', icon('promoted')),
  archived: entry('slate', 'Archived', icon('archived')),
  ready: entry('teal', 'Ready', dot('ready')),
  attention: entry('orange', 'Needs Attention', icon('attention')),
  passed: entry('green', 'Passed', icon('passed')),
  certified: entry('green', 'Certified', icon('certified')),
  awaiting: entry('amber', 'Awaiting', dot('awaiting')),
  upcoming: entry('slate', 'Upcoming', dot('upcoming')),
  backlog: entry('slate', 'Backlog', dot('backlog')),
  info: entry('blue', 'Info', icon('info')),
  review: entry('violet', 'In Review', icon('review')),
} satisfies Record<StatusCode, ToneEntry>;

const STATUS_LOOKUP: Readonly<Partial<Record<string, ToneEntry>>> = STATUS_TONE;

const normalizeStatus = (status: string | null | undefined): string | undefined => {
  const normalized = status?.trim().toLowerCase();
  return normalized || undefined;
};

const unknownLabel = (status: string | null | undefined): string => status?.trim() || 'Unknown';

const unknownStatus = (status: string | null | undefined): ToneEntry =>
  entry('slate', unknownLabel(status), dot('unknown'));

export function resolveStatus(status: string | null | undefined): ToneEntry {
  const normalized = normalizeStatus(status);
  const hit = normalized ? STATUS_LOOKUP[normalized] : undefined;
  if (hit) return hit;

  if (import.meta.env?.DEV) {
    console.warn(`[statusTone] unknown status "${status ?? 'Unknown'}" -> slate fallback`);
  }

  return unknownStatus(status);
}
