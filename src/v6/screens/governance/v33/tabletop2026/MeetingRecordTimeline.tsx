// Bottom "Live Meeting Record" — a chronological, horizontally-scrolling strip
// of chips recording everything that has happened in the session so far
// (motions, votes, recusals, actions, notes, next-up markers). Purely
// presentational: TabletopSession owns the entry list and appends to it as
// the learner progresses through the CasePack.
//
// Ground-up build for tabletop2026/ — does not reuse ../tabletop/* markup.

import type { ComponentType } from 'react';
import { FileSignature, Vote, UserX, ListChecks, StickyNote, ArrowRightCircle } from 'lucide-react';

export type RecordChipKind = 'motion' | 'vote' | 'recusal' | 'action' | 'note' | 'next_up';

export interface RecordChip {
  id: string;
  kind: RecordChipKind;
  label: string;
  text: string;
  timestampIso: string;
}

const KIND_CLASS: Record<RecordChipKind, string> = {
  motion: 'motion',
  vote: 'vote',
  recusal: 'recusal',
  action: 'action',
  note: 'note',
  next_up: '',
};

const KIND_ICON: Record<RecordChipKind, ComponentType<{ size?: number }>> = {
  motion: FileSignature,
  vote: Vote,
  recusal: UserX,
  action: ListChecks,
  note: StickyNote,
  next_up: ArrowRightCircle,
};

function formatClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export interface MeetingRecordTimelineProps {
  entries: RecordChip[];
}

export default function MeetingRecordTimeline({ entries }: MeetingRecordTimelineProps) {
  return (
    <section className="bs-meeting-record" aria-label="Live meeting record">
      <header>
        <strong>Live Meeting Record</strong>
        <span className="bs-kicker">{entries.length} entr{entries.length === 1 ? 'y' : 'ies'}</span>
      </header>
      {entries.length === 0 ? (
        <p style={{ color: 'var(--bs-muted)', fontSize: 11 }}>
          Nothing recorded yet — motions, votes, recusals, and notes will appear here as the meeting proceeds.
        </p>
      ) : (
        <ol className="bs-meeting-record-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {entries.map((entry) => {
            const Icon = KIND_ICON[entry.kind];
            return (
              <li key={entry.id} className={`bs-record-chip ${KIND_CLASS[entry.kind]}`.trim()}>
                <Icon size={12} />
                <span>
                  <b>{entry.label}</b> {entry.text}
                </span>
                <span className="bs-visually-hidden">{formatClock(entry.timestampIso)}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
