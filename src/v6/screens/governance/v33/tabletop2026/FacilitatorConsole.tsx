// Governing Body Boardroom Simulation — Facilitator Console.
//
// The facilitator's live-meeting driver: session clock, quorum, active
// conflicts, session controls (Pause/Lock/Mute All/End), the current
// matter's motion lifecycle (move -> second -> amend -> discuss -> vote),
// Executive Session toggle, the live vote matrix, a public-record summary,
// and — right rail — workflow-coverage progress against all 14 Governing
// Body workflows with each workflow's linked forms.
//
// Pure UI over the shared engine/groupState reducer: this component owns no
// governance state of its own (participants, votes, meeting record all live
// in `state` / flow through `dispatch`). Local component state here is
// strictly session-chrome (clock tick, pause/lock/mute flags, in-progress
// motion form fields) — none of it is authoritative.

import { useEffect, useMemo, useState } from 'react';
import type { Dispatch } from 'react';
import {
  AlertTriangle, CheckCircle2, Circle, Clock, Gavel, Lock, LogOut, MicOff,
  Pause, Play, ShieldAlert, Unlock,
} from 'lucide-react';

import type { CasePack, GvWorkflowId } from './engine/caseTypes';
import { ALL_GV_WORKFLOW_IDS } from './engine/caseTypes';
import type { GroupAction, GroupSessionState, VoteValue } from './engine/groupState';
import { recomputeQuorum } from './engine/groupState';
import { GV_WORKFLOW_BY_ID, GV_WORKFLOWS } from './data/workflowCoverage';

function nowIso(): string {
  return new Date().toISOString();
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const RECORD_CHIP_CLASS: Record<string, string> = {
  motion: 'motion', second: 'motion', amend: 'motion',
  vote: 'vote',
  recuse: 'recusal', dissent: 'recusal',
  inject_release: 'note', next_up: 'note', note: 'note', action: 'action',
};

export interface FacilitatorConsoleProps {
  casePack: CasePack;
  state: GroupSessionState;
  dispatch: Dispatch<GroupAction>;
  onEndSession?: () => void;
}

export default function FacilitatorConsole({ casePack, state, dispatch, onEndSession }: FacilitatorConsoleProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [locked, setLocked] = useState(false);
  const [mutedAll, setMutedAll] = useState(false);
  const [execSession, setExecSession] = useState(false);

  const [moverId, setMoverId] = useState('');
  const [motionText, setMotionText] = useState('');
  const [seconderId, setSeconderId] = useState('');
  const [secondText, setSecondText] = useState('');
  const [amendText, setAmendText] = useState('');
  const [discussionNote, setDiscussionNote] = useState('');

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const matterId = state.currentMatterId ?? casePack.decisionNodes[0]?.matterId ?? casePack.id;
  const quorum = useMemo(() => recomputeQuorum(state), [state]);
  const conflicted = state.participants.filter((p) => p.conflict);

  const controlsDisabled = locked || paused;

  function openMatterIfNeeded() {
    if (state.currentMatterId !== matterId) {
      dispatch({ type: 'open_matter', matterId, timestampIso: nowIso() });
    }
  }

  function handleMove() {
    if (!moverId || !motionText.trim()) return;
    openMatterIfNeeded();
    dispatch({ type: 'motion', participantId: moverId, matterId, text: motionText.trim(), timestampIso: nowIso() });
    setMotionText('');
  }

  function handleSecond() {
    if (!seconderId) return;
    dispatch({ type: 'second', participantId: seconderId, matterId, text: secondText.trim() || 'Seconded.', timestampIso: nowIso() });
    setSecondText('');
  }

  function handleAmend() {
    if (!amendText.trim()) return;
    dispatch({ type: 'amend', participantId: moverId || seconderId || state.participants[0]?.id || '', matterId, text: amendText.trim(), timestampIso: nowIso() });
    setAmendText('');
  }

  function handleNote() {
    if (!discussionNote.trim()) return;
    dispatch({ type: 'note', matterId, text: discussionNote.trim(), timestampIso: nowIso() });
    setDiscussionNote('');
  }

  function castVote(participantId: string, vote: VoteValue) {
    dispatch({ type: 'cast_vote', participantId, matterId, vote, timestampIso: nowIso() });
  }

  function toggleExecSession() {
    const next = !execSession;
    setExecSession(next);
    dispatch({
      type: 'note', matterId,
      text: next ? 'Chair called Executive Session to review restricted matters.' : 'Executive Session closed; returning to public session.',
      timestampIso: nowIso(),
    });
  }

  function togglePause() {
    const next = !paused;
    setPaused(next);
    dispatch({ type: 'note', matterId, text: next ? 'Session paused by facilitator.' : 'Session resumed by facilitator.', timestampIso: nowIso() });
  }

  function toggleLock() {
    const next = !locked;
    setLocked(next);
    dispatch({ type: 'note', matterId, text: next ? 'Facilitator locked the floor — no new motions.' : 'Facilitator reopened the floor.', timestampIso: nowIso() });
  }

  function toggleMuteAll() {
    const next = !mutedAll;
    setMutedAll(next);
    dispatch({ type: 'note', matterId, text: next ? 'Facilitator muted all lines.' : 'Facilitator unmuted all lines.', timestampIso: nowIso() });
  }

  function endSession() {
    dispatch({ type: 'note', matterId, text: 'Session ended by facilitator.', timestampIso: nowIso() });
    onEndSession?.();
  }

  function toggleWorkflow(id: GvWorkflowId) {
    if (state.activatedWorkflowIds.includes(id)) return;
    dispatch({ type: 'activate_workflow', workflowId: id });
  }

  const votesForMatter = state.voteMatrix.filter((v) => v.matterId === matterId);
  const voteOf = (participantId: string): VoteValue | null => votesForMatter.find((v) => v.participantId === participantId)?.vote ?? null;

  const recentRecord = [...state.meetingRecord].slice(-14).reverse();
  const coveragePct = Math.round((state.activatedWorkflowIds.length / ALL_GV_WORKFLOW_IDS.length) * 100);
  const donutCircumference = 2 * Math.PI * 34;
  const donutOffset = donutCircumference * (1 - coveragePct / 100);

  return (
    <div className="bs-session">
      <div className="bs-command-bar">
        <div className="bs-command-identity">
          <div className="bs-command-crest"><Gavel size={15} /></div>
          <div>
            <span>Facilitator Console &middot; {state.joinCode}</span>
            <strong>{casePack.title}</strong>
          </div>
        </div>
        <div className="bs-command-meta">
          <span><Clock size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />Session time</span>
          <b>{formatClock(elapsedSeconds)}</b>
          <span>Quorum</span>
          <b style={{ color: quorum.quorumMet ? undefined : '#e08a6a' }}>{quorum.eligibleVoters}/{quorum.requiredVotes}</b>
          <span>Conflicts active</span>
          <b style={{ color: conflicted.length > 0 ? '#e08a6a' : undefined }}>{conflicted.length}</b>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="bs-chip" onClick={togglePause}>
          {paused ? <Play size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} /> : <Pause size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />}
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button type="button" className={`bs-chip${locked ? ' selected warn' : ''}`} onClick={toggleLock}>
          {locked ? <Lock size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} /> : <Unlock size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />}
          {locked ? 'Floor Locked' : 'Lock Floor'}
        </button>
        <button type="button" className={`bs-chip${mutedAll ? ' selected warn' : ''}`} onClick={toggleMuteAll}>
          <MicOff size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
          {mutedAll ? 'All Muted' : 'Mute All'}
        </button>
        <button type="button" className={`bs-chip${execSession ? ' selected' : ''}`} onClick={toggleExecSession}>
          <ShieldAlert size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
          {execSession ? 'In Executive Session' : 'Enter Executive Session'}
        </button>
        <button type="button" className="bs-chip selected warn" onClick={endSession}>
          <LogOut size={11} style={{ verticalAlign: '-1px', marginRight: 4 }} />
          End Session
        </button>
      </div>

      {quorum.quorumMet ? (
        <div className="bs-quorum-band">
          <strong>{quorum.eligibleVoters} of {quorum.totalMembers}</strong>
          <span>eligible voters present, unrecused, unconflicted — quorum met to act on this matter ({quorum.requiredVotes} required).</span>
        </div>
      ) : (
        <div className="bs-quorum-band not-met">
          <strong>{quorum.eligibleVoters} of {quorum.totalMembers}</strong>
          <span>eligible voters present — quorum NOT met ({quorum.requiredVotes} required). No vote taken now would be valid.</span>
        </div>
      )}

      <div className="bs-layout" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(280px,.9fr)' }}>
        <div className="bs-boardtable">
          <div className="bs-decision-prompt">
            <header>
              <span className="bs-kicker">Current Matter{execSession ? ' · Executive Session' : ''}</span>
              <h3>{casePack.title}</h3>
            </header>
            <p className="bs-prompt-text">{casePack.subtitle}</p>

            <div className="bs-motion-builder">
              <div className="bs-motion-field">
                <label htmlFor="fc-mover">Moved by</label>
                <select id="fc-mover" value={moverId} onChange={(e) => setMoverId(e.target.value)} disabled={controlsDisabled}>
                  <option value="">Select a member&hellip;</option>
                  {state.participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="bs-motion-field">
                <label htmlFor="fc-motion-text">Motion text</label>
                <textarea id="fc-motion-text" value={motionText} onChange={(e) => setMotionText(e.target.value)} disabled={controlsDisabled} placeholder="I move that the Board&hellip;" />
              </div>
              <button type="button" className="bs-rail-action secondary" disabled={controlsDisabled || !moverId || !motionText.trim()} onClick={handleMove}>
                Move Motion
              </button>

              <div className="bs-motion-field">
                <label htmlFor="fc-seconder">Seconded by</label>
                <select id="fc-seconder" value={seconderId} onChange={(e) => setSeconderId(e.target.value)} disabled={controlsDisabled}>
                  <option value="">Select a member&hellip;</option>
                  {state.participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <button type="button" className="bs-rail-action secondary" disabled={controlsDisabled || !seconderId} onClick={handleSecond}>
                Second
              </button>

              <div className="bs-motion-field">
                <label htmlFor="fc-amend">Amendment (optional)</label>
                <textarea id="fc-amend" value={amendText} onChange={(e) => setAmendText(e.target.value)} disabled={controlsDisabled} placeholder="Amend the motion to&hellip;" />
              </div>
              <button type="button" className="bs-rail-action secondary" disabled={controlsDisabled || !amendText.trim()} onClick={handleAmend}>
                Record Amendment
              </button>

              <div className="bs-motion-field">
                <label htmlFor="fc-discussion">Discussion note</label>
                <textarea id="fc-discussion" value={discussionNote} onChange={(e) => setDiscussionNote(e.target.value)} disabled={controlsDisabled} placeholder="Note for the record&hellip;" />
              </div>
              <button type="button" className="bs-rail-action secondary" disabled={controlsDisabled || !discussionNote.trim()} onClick={handleNote}>
                Add Discussion Note
              </button>
            </div>
          </div>

          <div className="bs-vote-matrix">
            <table>
              <caption className="bs-visually-hidden">Live vote matrix for the current matter</caption>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th colSpan={3}>Take Vote</th>
                  <th>Recorded</th>
                </tr>
              </thead>
              <tbody>
                {state.participants.map((p) => {
                  const barred = !p.present || p.recused || p.conflict;
                  const recorded = voteOf(p.id);
                  return (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{p.role.replace(/_/g, ' ')}</td>
                      <td>
                        <button type="button" className="bs-toggle-pill" disabled={controlsDisabled || barred} onClick={() => castVote(p.id, 'aye')}>Aye</button>
                      </td>
                      <td>
                        <button type="button" className="bs-toggle-pill" disabled={controlsDisabled || barred} onClick={() => castVote(p.id, 'nay')}>Nay</button>
                      </td>
                      <td>
                        <button type="button" className="bs-toggle-pill" disabled={controlsDisabled || barred} onClick={() => castVote(p.id, 'abstain')}>Abstain</button>
                      </td>
                      <td>
                        {recorded ? <span className={`bs-vote-cell ${recorded}`}>{recorded.replace('_', ' ')}</span> : <span className="bs-vote-cell not_present">no vote</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bs-meeting-record">
            <header>
              <strong>Public Record Summary</strong>
              <span className="bs-kicker">{state.meetingRecord.length} entries</span>
            </header>
            <div className="bs-meeting-record-list">
              {recentRecord.length === 0 ? <span style={{ fontSize: 10, color: 'var(--bs-muted)' }}>No entries recorded yet.</span> : null}
              {recentRecord.map((ev) => {
                const who = ev.participantId ? state.participants.find((p) => p.id === ev.participantId)?.name : undefined;
                return (
                  <span key={ev.id} className={`bs-record-chip ${RECORD_CHIP_CLASS[ev.type] ?? 'note'}`}>
                    <b>{ev.type}</b>
                    {who ? `${who}: ` : ''}{ev.text}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="bs-decision-rail">
          <div className="bs-rail-card">
            <header><strong>Workflow Coverage</strong></header>
            <div className="bs-coverage-donut-row">
              <svg className="bs-score-donut" viewBox="0 0 84 84" role="img" aria-label={`${coveragePct}% of workflows activated`}>
                <circle className="track" cx="42" cy="42" r="34" />
                <circle
                  className="value" cx="42" cy="42" r="34"
                  strokeDasharray={donutCircumference} strokeDashoffset={donutOffset}
                />
                <text x="42" y="46" textAnchor="middle" className="bs-score-donut-label" fill="var(--bs-forest)">{coveragePct}%</text>
              </svg>
              <div>
                <strong style={{ fontFamily: 'var(--font-editorial)', color: 'var(--bs-forest)', fontSize: 20 }}>
                  {state.activatedWorkflowIds.length} / {ALL_GV_WORKFLOW_IDS.length}
                </strong>
                <div style={{ fontSize: 9, color: 'var(--bs-muted)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Workflows engaged</div>
              </div>
            </div>
            <ul className="bs-workflow-checklist">
              {GV_WORKFLOWS.map((wf) => {
                const done = state.activatedWorkflowIds.includes(wf.id);
                return (
                  <li key={wf.id} className={done ? 'done' : ''}>
                    <button
                      type="button"
                      onClick={() => toggleWorkflow(wf.id)}
                      disabled={done}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 0, textAlign: 'left', width: '100%', color: 'inherit' }}
                      title={GV_WORKFLOW_BY_ID[wf.id].forms.join(', ')}
                    >
                      {done ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                      <span>{wf.id} &middot; {wf.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p style={{ fontSize: 9, color: 'var(--bs-muted)', lineHeight: 1.5 }}>
              Hover a workflow for its linked forms. Click an unengaged workflow once the Board has genuinely acted on
              its trigger this session.
            </p>
          </div>

          {conflicted.length > 0 ? (
            <div className="bs-rail-card">
              <header><strong>Active Conflicts</strong></header>
              <div className="bs-contradiction">
                <AlertTriangle size={16} />
                <div>
                  <strong>{conflicted.length} member(s) with a disclosed conflict</strong>
                  <p>{conflicted.map((p) => p.name).join(', ')} — excluded from the eligible-voter denominator for the current matter until the conflict is resolved.</p>
                </div>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
