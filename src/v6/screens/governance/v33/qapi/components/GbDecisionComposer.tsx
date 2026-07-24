// §4 depth — Governing Body decision composer.
//
// Authors a NEW Board decision as a current working-session action. It never
// edits or fabricates a historical GB record: attendance/quorum-derived
// voters are pre-populated from ../gbDecisions.ts (Q1/Q2 only) purely as a
// starting roster, and the user must explicitly set an outcome — nothing is
// auto-approved. Recused voters are removed from the vote count. When the
// compliance evidence service is disconnected (the default dev state), the
// composer clearly labels its output as a preview, never an official record.

import { useMemo, useState } from 'react';
import { AlertTriangle, ClipboardList, Gavel, Info, Lock, ShieldCheck } from 'lucide-react';
import { GB_DECISIONS_BY_QUARTER } from '../gbDecisions';
import { getDisconnectedNotice, isEvidenceServiceConnected } from '../../compliance/complianceEvidenceAdapter';
import type { QuarterKey } from '../model/qapi2026.types';

export interface GbDecisionComposerProps {
  quarter: QuarterKey;
  /** Optional prefill when opened from a specific decision-docket matter. */
  prefillSubject?: string;
  prefillMatterId?: string;
}

type VoteChoice = 'undeclared' | 'yes' | 'no' | 'abstain' | 'recused';

interface VoterRow {
  name: string;
  role: string;
  choice: VoteChoice;
}

const GB_FORMS: Array<{ id: string; title: string }> = [
  { id: 'GV-FM-006', title: 'Conflict of Interest Disclosure' },
  { id: 'GV-FM-008', title: 'GB Annual Self-Assessment Tool' },
  { id: 'GV-FM-012', title: 'Executive Session Confidentiality Agreement' },
  { id: 'GV-FM-023', title: 'Annual Compliance Report to GB' },
  { id: 'GV-FM-024', title: 'GB Training & Education Log' },
  { id: 'CO-FM-001', title: 'Annual Compliance Program Attestation' },
  { id: 'CO-FM-010', title: 'Anti-Kickback Attestation' },
  { id: 'EN-FM-001', title: 'Universal Policy Acknowledgment' },
  { id: 'EN-FM-036', title: 'Annual Department Compliance Attestation' },
];

function buildInitialVoters(quarter: QuarterKey): VoterRow[] {
  const record = quarter === 'Q1' || quarter === 'Q2' ? GB_DECISIONS_BY_QUARTER[quarter] : undefined;
  if (!record) return [];
  return record.attendance
    .filter((a) => a.votingMember && a.present)
    .map((a) => ({ name: a.name, role: a.role, choice: 'undeclared' as VoteChoice }));
}

export default function GbDecisionComposer({ quarter, prefillSubject, prefillMatterId }: GbDecisionComposerProps) {
  const initialVoters = useMemo(() => buildInitialVoters(quarter), [quarter]);
  const attendancePending = initialVoters.length === 0;

  const [subject, setSubject] = useState(prefillSubject ?? '');
  const [motionText, setMotionText] = useState('');
  const [conditions, setConditions] = useState('');
  const [mover, setMover] = useState('');
  const [second, setSecond] = useState('');
  const [voters, setVoters] = useState<VoterRow[]>(initialVoters);
  const [outcome, setOutcome] = useState<'Pending' | 'Approved' | 'Failed' | 'Tabled'>('Pending');
  const [dissent, setDissent] = useState('');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [requiredEvidence, setRequiredEvidence] = useState('');
  const [effectivenessCriterion, setEffectivenessCriterion] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [linkedMinuteEntry, setLinkedMinuteEntry] = useState(prefillMatterId ?? '');
  const [linkedFormId, setLinkedFormId] = useState('');
  const [recorded, setRecorded] = useState(false);

  const evidenceConnected = isEvidenceServiceConnected();

  const tally = useMemo(() => {
    const counted = voters.filter((v) => v.choice !== 'recused');
    const yes = counted.filter((v) => v.choice === 'yes').length;
    const no = counted.filter((v) => v.choice === 'no').length;
    const abstain = counted.filter((v) => v.choice === 'abstain').length;
    const undeclared = counted.filter((v) => v.choice === 'undeclared').length;
    return { yes, no, abstain, undeclared, recused: voters.length - counted.length, eligible: counted.length };
  }, [voters]);

  const suggestedOutcome =
    tally.undeclared > 0
      ? 'Vote incomplete'
      : tally.yes > tally.no
        ? 'Would pass'
        : tally.yes === tally.no
          ? 'Tied — chair breaks tie per bylaws'
          : 'Would fail';

  function updateVoter(index: number, patch: Partial<VoterRow>) {
    setVoters((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addManualVoter() {
    setVoters((prev) => [...prev, { name: '', role: 'Voting member (manually added)', choice: 'undeclared' }]);
  }

  const canRecord = Boolean(subject.trim() && motionText.trim() && mover.trim() && second.trim() && outcome !== 'Pending');

  return (
    <section className="qd-panel qd-composer" aria-labelledby={`qd-composer-${quarter}`}>
      <header className="qd-panel-head">
        <Gavel size={16} aria-hidden="true" />
        <div>
          <span>DECISION COMPOSER · CURRENT UAT SESSION</span>
          <h3 id={`qd-composer-${quarter}`}>Draft a {quarter} Board decision</h3>
        </div>
      </header>

      <p className="qd-composer-notice">
        <Info size={13} aria-hidden="true" />
        This composer authors a <strong>new</strong> decision as a current working-session action. It never edits or
        fabricates a historical Board record, and nothing here is auto-approved — the outcome must be set explicitly.
      </p>

      {attendancePending && (
        <p className="qd-flag-row">
          <AlertTriangle size={13} aria-hidden="true" />
          No normalized attendance record exists for {quarter}. Add eligible voters manually below — do not assume a
          quorum or a specific roster.
        </p>
      )}

      <fieldset className="qd-fieldset">
        <legend>Motion</legend>
        <label className="qd-field" htmlFor={`qd-subject-${quarter}`}>
          Subject
          <input id={`qd-subject-${quarter}`} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short label for the minutes" />
        </label>
        <label className="qd-field" htmlFor={`qd-motiontext-${quarter}`}>
          Motion text ("Moved that…")
          <textarea id={`qd-motiontext-${quarter}`} value={motionText} onChange={(e) => setMotionText(e.target.value)} rows={3} />
        </label>
        <label className="qd-field" htmlFor={`qd-conditions-${quarter}`}>
          Conditions (optional)
          <textarea id={`qd-conditions-${quarter}`} value={conditions} onChange={(e) => setConditions(e.target.value)} rows={2} />
        </label>
        <div className="qd-field-row">
          <label className="qd-field" htmlFor={`qd-mover-${quarter}`}>
            Maker (moved by)
            <input id={`qd-mover-${quarter}`} value={mover} onChange={(e) => setMover(e.target.value)} list={`qd-voter-names-${quarter}`} />
          </label>
          <label className="qd-field" htmlFor={`qd-second-${quarter}`}>
            Second
            <input id={`qd-second-${quarter}`} value={second} onChange={(e) => setSecond(e.target.value)} list={`qd-voter-names-${quarter}`} />
          </label>
        </div>
        <datalist id={`qd-voter-names-${quarter}`}>
          {voters.filter((v) => v.name).map((v) => <option key={v.name} value={v.name} />)}
        </datalist>
      </fieldset>

      <fieldset className="qd-fieldset">
        <legend>Eligible voters &amp; vote</legend>
        {voters.length === 0 && (
          <p className="qd-empty">No voters added yet. Use "Add voter" to record who is eligible to vote on this matter.</p>
        )}
        <ul className="qd-voter-list">
          {voters.map((v, i) => (
            <li key={i} className="qd-voter-row">
              <input
                aria-label={`Voter ${i + 1} name`}
                value={v.name}
                onChange={(e) => updateVoter(i, { name: e.target.value })}
                placeholder="Voter name"
              />
              <select
                aria-label={`Vote for ${v.name || `voter ${i + 1}`}`}
                value={v.choice}
                onChange={(e) => updateVoter(i, { choice: e.target.value as VoteChoice })}
              >
                <option value="undeclared">— not yet cast —</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="abstain">Abstain</option>
                <option value="recused">Recused (conflict of interest)</option>
              </select>
              {v.choice === 'recused' && (
                <i className="qd-tag recused"><Lock size={11} aria-hidden="true" /> removed from vote count</i>
              )}
            </li>
          ))}
        </ul>
        <button type="button" className="qd-secondary" onClick={addManualVoter}>Add voter</button>
        <div className="qd-tally-row" aria-live="polite">
          <span>Yes {tally.yes}</span>
          <span>No {tally.no}</span>
          <span>Abstain {tally.abstain}</span>
          <span>Recused {tally.recused}</span>
          <span>Eligible cast {tally.eligible}</span>
        </div>
        <p className="qd-suggested"><Info size={13} aria-hidden="true" /> Tally reading only — not a decision: <strong>{suggestedOutcome}</strong></p>
      </fieldset>

      <fieldset className="qd-fieldset">
        <legend>Outcome &amp; record</legend>
        <label className="qd-field" htmlFor={`qd-outcome-${quarter}`}>
          Outcome (set explicitly — never pre-selected)
          <select id={`qd-outcome-${quarter}`} value={outcome} onChange={(e) => setOutcome(e.target.value as typeof outcome)}>
            <option value="Pending">Pending — no outcome set yet</option>
            <option value="Approved">Approved</option>
            <option value="Failed">Failed</option>
            <option value="Tabled">Tabled</option>
          </select>
        </label>
        <label className="qd-field" htmlFor={`qd-dissent-${quarter}`}>
          Dissent / minority note (optional)
          <textarea id={`qd-dissent-${quarter}`} value={dissent} onChange={(e) => setDissent(e.target.value)} rows={2} />
        </label>
      </fieldset>

      <fieldset className="qd-fieldset">
        <legend>Directive</legend>
        <div className="qd-field-row">
          <label className="qd-field" htmlFor={`qd-owner-${quarter}`}>
            Owner
            <input id={`qd-owner-${quarter}`} value={owner} onChange={(e) => setOwner(e.target.value)} />
          </label>
          <label className="qd-field" htmlFor={`qd-due-${quarter}`}>
            Due date
            <input id={`qd-due-${quarter}`} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>
        <label className="qd-field" htmlFor={`qd-evidence-${quarter}`}>
          Required evidence
          <input
            id={`qd-evidence-${quarter}`}
            value={requiredEvidence}
            onChange={(e) => setRequiredEvidence(e.target.value)}
            placeholder="e.g. two consecutive months at target"
          />
        </label>
        <label className="qd-field" htmlFor={`qd-criterion-${quarter}`}>
          Effectiveness criterion
          <input id={`qd-criterion-${quarter}`} value={effectivenessCriterion} onChange={(e) => setEffectivenessCriterion(e.target.value)} />
        </label>
        <div className="qd-field-row">
          <label className="qd-field" htmlFor={`qd-return-${quarter}`}>
            Return date
            <input id={`qd-return-${quarter}`} type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </label>
          <label className="qd-field" htmlFor={`qd-minute-${quarter}`}>
            Linked minute entry
            <input
              id={`qd-minute-${quarter}`}
              value={linkedMinuteEntry}
              onChange={(e) => setLinkedMinuteEntry(e.target.value)}
              placeholder="e.g. matter id / minute paragraph"
            />
          </label>
        </div>
        <label className="qd-field" htmlFor={`qd-form-${quarter}`}>
          Linked form
          <select id={`qd-form-${quarter}`} value={linkedFormId} onChange={(e) => setLinkedFormId(e.target.value)}>
            <option value="">— none —</option>
            {GB_FORMS.map((f) => <option key={f.id} value={f.id}>{f.id} — {f.title}</option>)}
          </select>
        </label>
        {linkedFormId && (
          <a className="qd-form-link" href={`/forms/${linkedFormId}`} target="_blank" rel="noreferrer">
            Open {linkedFormId} <ClipboardList size={12} aria-hidden="true" />
          </a>
        )}
      </fieldset>

      {!evidenceConnected && (
        <p className="qd-evidence-notice" role="note">
          <AlertTriangle size={13} aria-hidden="true" /> {getDisconnectedNotice()}
        </p>
      )}

      <button type="button" className="qd-primary" disabled={!canRecord} onClick={() => setRecorded(true)}>
        {evidenceConnected ? 'Record decision (official)' : 'Record decision (preview only)'}
      </button>

      {recorded && (
        <div className="qd-recorded-summary" role="status">
          <ShieldCheck size={15} aria-hidden="true" />
          <div>
            <strong>{evidenceConnected ? 'Recorded' : 'Preview recorded'} — current UAT session action, not a historical Board record.</strong>
            <p>
              {subject || 'Untitled motion'} · Moved by {mover}, seconded by {second} · Outcome: {outcome} · Yes{' '}
              {tally.yes}-No {tally.no}-Abstain {tally.abstain}{tally.recused ? `-Recused ${tally.recused}` : ''}
            </p>
            {!evidenceConnected && <p className="qd-evidence-notice">{getDisconnectedNotice()}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
