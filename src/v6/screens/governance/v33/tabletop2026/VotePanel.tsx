// Eligibility- and recusal-aware voting. Computes matter-specific quorum via
// QuorumConflictEngine (excluding conflicted directors from the denominator,
// not just the vote), forces recorded votes to 'recused' / 'not_present' for
// ineligible participants, and renders both the full facilitated-group vote
// matrix and a simplified solo-learner "cast your vote" control.

import type { Participant, QuorumRule, VoteMatrixEntry, VoteValue } from './engine/groupState';
import type { MatterConflict, QuorumViolation } from './QuorumConflictEngine';
import { computeMatterQuorum, isEligibleForMatter } from './QuorumConflictEngine';
import { AlertTriangle, CircleAlert } from 'lucide-react';

export interface VotePanelProps {
  matterId: string;
  matterTitle: string;
  participants: Participant[];
  quorumRule: QuorumRule;
  votes: VoteMatrixEntry[];
  onCastVote: (participantId: string, vote: VoteValue) => void;
  matterConflicts?: MatterConflict[];
  roomOccupancy?: Record<string, boolean>;
  /** Solo-learner mode: renders one "your vote" control instead of the full matrix. */
  solo?: boolean;
  soloParticipantId?: string;
  readOnly?: boolean;
}

const VOTE_OPTIONS: { value: VoteValue; label: string }[] = [
  { value: 'aye', label: 'Aye' },
  { value: 'nay', label: 'Nay' },
  { value: 'abstain', label: 'Abstain' },
];

function voteLabel(v: VoteValue): string {
  switch (v) {
    case 'aye': return 'Aye';
    case 'nay': return 'Nay';
    case 'abstain': return 'Abstain';
    case 'recused': return 'Recused';
    case 'not_present': return 'Not Present';
    default: return v;
  }
}

function violationMessage(v: QuorumViolation): string {
  return v.message;
}

function QuorumBand(props: { matterId: string; result: ReturnType<typeof computeMatterQuorum> }) {
  const { result } = props;
  return (
    <div className={`bs-quorum-band${result.quorumMet ? '' : ' not-met'}`} role="status">
      <strong>{result.presentEligible} / {result.quorumThresholdForMatter}</strong>
      <span>
        {result.quorumMet ? 'Quorum met' : 'Quorum NOT met'} for this matter · {result.seatedEligibleForMatter} eligible of {result.seatedTotal} seated
        {result.excludedForConflict.length > 0 ? ` (${result.excludedForConflict.length} excluded for conflict/recusal)` : ''}
      </span>
    </div>
  );
}

export default function VotePanel(props: VotePanelProps) {
  const {
    matterId,
    matterTitle,
    participants,
    quorumRule,
    votes,
    onCastVote,
    matterConflicts = [],
    roomOccupancy,
    solo = false,
    soloParticipantId,
    readOnly = false,
  } = props;

  const quorum = computeMatterQuorum({
    matterId,
    participants,
    quorumRule,
    conflicts: matterConflicts,
    roomOccupancy,
  });

  const votesByParticipant = new Map<string, VoteValue>(
    votes.filter((v) => v.matterId === matterId).map((v) => [v.participantId, v.vote]),
  );

  if (solo) {
    const p = participants.find((x) => x.id === soloParticipantId) ?? participants[0];
    const myVote = p ? votesByParticipant.get(p.id) : undefined;
    return (
      <div className="bs-rail-card">
        <header><strong>Cast Your Vote</strong></header>
        <p style={{ fontSize: 11, color: 'var(--bs-muted)' }}>{matterTitle}</p>
        <QuorumBand matterId={matterId} result={quorum} />
        <div className="bs-disposition-chips" role="radiogroup" aria-label="Your vote">
          {VOTE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={myVote === opt.value}
              className={`bs-chip${myVote === opt.value ? ' selected' : ''}`}
              onClick={() => p && onCastVote(p.id, opt.value)}
              disabled={readOnly || !p || !isEligibleForMatter(p, matterConflicts)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {p && !isEligibleForMatter(p, matterConflicts) && (
          <p className="bs-supplemental-flag" role="note">
            <CircleAlert size={12} aria-hidden="true" /> You are recused, conflicted, or not present for this matter — your vote is recorded as {voteLabel(myVote ?? 'recused')}.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bs-rail-card">
      <header><strong>Vote — {matterTitle}</strong></header>
      <QuorumBand matterId={matterId} result={quorum} />

      {quorum.violations.length > 0 && (
        <div className="bs-contradiction" role="alert">
          <AlertTriangle size={16} aria-hidden="true" />
          <div>
            <strong>Quorum/recusal issue</strong>
            <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
              {quorum.violations.map((v, i) => (
                <li key={i} style={{ fontSize: 10.5, lineHeight: 1.5 }}>{violationMessage(v)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="bs-vote-matrix">
        <table>
          <thead>
            <tr>
              <th scope="col">Director</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Vote</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => {
              const eligible = isEligibleForMatter(p, matterConflicts);
              const recordedVote = votesByParticipant.get(p.id);
              const effectiveVote: VoteValue = !p.present
                ? 'not_present'
                : !eligible
                  ? 'recused'
                  : recordedVote ?? 'abstain';
              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.role.replace('_', ' ')}</td>
                  <td>
                    <span className={`bs-vote-cell ${effectiveVote}`}>{voteLabel(effectiveVote)}</span>
                  </td>
                  <td>
                    {eligible && p.present ? (
                      <div className="bs-disposition-chips">
                        {VOTE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={recordedVote === opt.value}
                            className={`bs-chip${recordedVote === opt.value ? ' selected' : ''}`}
                            onClick={() => onCastVote(p.id, opt.value)}
                            disabled={readOnly}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: 10, color: 'var(--bs-muted)' }}>vote not counted</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
