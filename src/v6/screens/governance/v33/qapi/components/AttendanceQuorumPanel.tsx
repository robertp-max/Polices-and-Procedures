// §4 depth — Attendance & quorum panel for the QAPI Board packet workspace.
//
// Drives entirely from the Q1/Q2 2026 Governing Body decision-side records in
// ../gbDecisions.ts (the only place a real roster, quorum count, and per-motion
// mover/second/vote exists in this codebase). Q3/Q4 have no normalized GB
// meeting record yet, so this panel shows an honest "attendance record
// pending" state rather than inventing a roster or a quorum figure.
//
// The panel never simply repeats the source's stated quorum numbers — it
// independently recomputes voting-seat and present-voting counts from the
// roster itself and flags any mismatch as a data-quality hold rather than
// silently trusting a pre-computed figure. It also checks, per motion, that
// the mover and second are both recorded as present voting members and that
// the recorded vote tally does not exceed the number of eligible voters —
// the closest honest analogue this data supports to "never count a
// conflicted/ineligible vote when the decision depends on it," since no
// conflict-of-interest disclosure is cross-referenced to any 2026 GB meeting
// in the current source.

import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Users } from 'lucide-react';
import {
  GB_DECISIONS_BY_QUARTER,
  type GbAttendanceRecord,
  type GbMotion,
  type GbQuarterDecisionRecord,
} from '../gbDecisions';
import type { QuarterKey } from '../model/qapi2026.types';

export interface AttendanceQuorumPanelProps {
  quarter: QuarterKey;
}

function parseVoteTally(vote: string): { yes: number; no: number; abstain: number } | null {
  const m = vote.match(/(\d+)\s*-\s*(\d+)(?:-(\d+))?/);
  if (!m) return null;
  return { yes: Number(m[1]), no: Number(m[2]), abstain: m[3] ? Number(m[3]) : 0 };
}

function RosterList({ attendance }: { attendance: GbAttendanceRecord[] }) {
  return (
    <ul className="qd-roster" aria-label="Eligible roster and attendance">
      {attendance.map((a) => (
        <li key={a.name} className={a.present ? 'present' : 'absent'}>
          <span className="qd-roster-status" aria-hidden="true">{a.present ? '●' : '○'}</span>
          <div>
            <strong>{a.name}</strong>
            <small>{a.role}</small>
          </div>
          <div className="qd-roster-tags">
            {a.votingMember && <i className="qd-tag vote">Voting</i>}
            {a.present && a.remote && <i className="qd-tag remote">Remote</i>}
            {!a.present && a.excused && <i className="qd-tag excused">Excused</i>}
            {!a.present && !a.excused && <i className="qd-tag unexcused">Absent</i>}
          </div>
        </li>
      ))}
    </ul>
  );
}

function MotionEligibilityCheck({
  motion,
  presentVotingNames,
  eligibleCount,
}: {
  motion: GbMotion;
  presentVotingNames: Set<string>;
  eligibleCount: number;
}) {
  const tally = parseVoteTally(motion.vote);
  const totalCast = tally ? tally.yes + tally.no + tally.abstain : null;
  const moverEligible = presentVotingNames.has(motion.mover);
  const secondEligible = presentVotingNames.has(motion.second);
  const tallyWithinEligible = totalCast === null ? true : totalCast <= eligibleCount;
  const clean = moverEligible && secondEligible && tallyWithinEligible;
  return (
    <li className={clean ? 'qd-ok' : 'qd-warn'}>
      {clean ? <CheckCircle2 size={13} aria-hidden="true" /> : <AlertTriangle size={13} aria-hidden="true" />}
      <div>
        <strong>{motion.id}</strong> — {motion.subject}
        <small>
          Mover {motion.mover}{!moverEligible && ' (not recorded present — verify before treating this vote as valid)'}
          {' · '}Second {motion.second}{!secondEligible && ' (not recorded present — verify)'}
          {' · '}Vote {motion.vote}
          {!tallyWithinEligible && ' · recorded tally exceeds eligible voting members — reviewer confirmation required'}
        </small>
      </div>
    </li>
  );
}

function PendingAttendance({ quarter }: { quarter: QuarterKey }) {
  return (
    <section className="qd-panel" aria-label={`${quarter} attendance and quorum`}>
      <div className="qd-pending-card">
        <ShieldAlert size={22} aria-hidden="true" />
        <h3>Attendance record pending</h3>
        <p>
          No Governing Body meeting attendance, quorum, or roll-call record has been normalized for {quarter} yet.
          No roster or quorum count is shown for this quarter — a placeholder figure would misrepresent who was
          present and could misstate whether a quorum existed.
        </p>
      </div>
    </section>
  );
}

export default function AttendanceQuorumPanel({ quarter }: AttendanceQuorumPanelProps) {
  const record: GbQuarterDecisionRecord | undefined =
    quarter === 'Q1' || quarter === 'Q2' ? GB_DECISIONS_BY_QUARTER[quarter] : undefined;

  const computed = useMemo(() => {
    if (!record) return null;
    const votingSeats = record.attendance.filter((a) => a.votingMember);
    const presentVoting = votingSeats.filter((a) => a.present);
    const presentVotingNames = new Set(presentVoting.map((a) => a.name));
    const seatsMismatch = votingSeats.length !== record.quorum.votingSeatsFilled;
    const presentMismatch = presentVoting.length !== record.quorum.votingMembersPresent;
    const quorumMetComputed = presentVoting.length >= record.quorum.requiredForQuorum;
    return { votingSeats, presentVoting, presentVotingNames, seatsMismatch, presentMismatch, quorumMetComputed };
  }, [record]);

  if (!record || !computed) return <PendingAttendance quarter={quarter} />;

  const { attendance, quorum, motions, gbMeeting } = record;
  const dataQualityIssue = computed.seatsMismatch || computed.presentMismatch || computed.quorumMetComputed !== quorum.met;
  const validToProceed = quorum.met && computed.quorumMetComputed && !dataQualityIssue;

  return (
    <section className="qd-panel" aria-labelledby={`qd-attendance-${quarter}`}>
      <header className="qd-panel-head">
        <Users size={16} aria-hidden="true" />
        <div>
          <span>ATTENDANCE &amp; QUORUM</span>
          <h3 id={`qd-attendance-${quarter}`}>{quarter} Governing Body meeting — {gbMeeting.date}</h3>
        </div>
      </header>

      <RosterList attendance={attendance} />

      <div className="qd-quorum-grid">
        <article>
          <span>Voting seats filled</span>
          <strong>{quorum.votingSeatsFilled}</strong>
          {computed.seatsMismatch && <small className="qd-flag">roster shows {computed.votingSeats.length} — verify</small>}
        </article>
        <article>
          <span>Voting members present</span>
          <strong>{quorum.votingMembersPresent}</strong>
          {computed.presentMismatch && <small className="qd-flag">roster shows {computed.presentVoting.length} — verify</small>}
        </article>
        <article><span>Required for quorum</span><strong>{quorum.requiredForQuorum}</strong></article>
        <article><span>Confirmed by</span><strong>{quorum.confirmedBy}</strong><small>{quorum.confirmedAtLocalTime}</small></article>
      </div>
      <p className="qd-quorum-statement">{quorum.statement}</p>

      <div className="qd-conflict-block">
        <div>
          <h4>Disclosed conflicts of interest</h4>
          <p className="qd-empty">
            No conflict-of-interest disclosure is cross-referenced to this meeting's normalized record. Individual
            disclosures are filed on GV-FM-006 (Conflict of Interest Disclosure) — none is linked to this meeting yet,
            so none is asserted here.
          </p>
        </div>
        <div>
          <h4>Recused matters</h4>
          <p className="qd-empty">
            No recusal is recorded for this meeting. Every present voting member above is treated as eligible on
            every motion below; if a recusal is later disclosed for a specific matter, that member must be removed
            from the vote count for that matter before the outcome is treated as valid.
          </p>
        </div>
      </div>

      {motions.length > 0 && (
        <div className="qd-motion-checks">
          <h4>Per-motion eligibility check</h4>
          <ul>
            {motions.map((m) => (
              <MotionEligibilityCheck
                key={m.id}
                motion={m}
                presentVotingNames={computed.presentVotingNames}
                eligibleCount={computed.presentVoting.length}
              />
            ))}
          </ul>
        </div>
      )}

      {dataQualityIssue ? (
        <p className="qd-result hold">
          <AlertTriangle size={15} aria-hidden="true" />
          Hold — roster-derived quorum figures do not match the recorded quorum statement above; resolve before
          treating this meeting's votes as valid.
        </p>
      ) : (
        <p className={validToProceed ? 'qd-result ok' : 'qd-result hold'}>
          {validToProceed ? <CheckCircle2 size={15} aria-hidden="true" /> : <AlertTriangle size={15} aria-hidden="true" />}
          {validToProceed
            ? 'Valid to proceed — quorum met, no unresolved conflicts on record.'
            : 'Hold — quorum not met for this meeting.'}
        </p>
      )}
    </section>
  );
}
