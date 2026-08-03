// Governing Body Boardroom Simulation — Participant Workspace.
//
// Role-specific individual view for a facilitated group session: shows this
// participant's own standing (present/recused/conflicted), a
// role-appropriate reminder of what they are there to weigh in on,
// individual critical-competency capture against one of the case pack's
// decision nodes (graded with the real engine/diagnostics logic, not a
// re-implementation of it), and an individual attestation. A recused or
// conflicted participant is blocked from capturing/voting on the CURRENT
// matter and is visibly told why — but can still capture competency on
// other matters/nodes in the pack.

import { useMemo, useState } from 'react';
import type { Dispatch } from 'react';
import { CheckCircle2, FileText, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';

import type { CasePack, DecisionNode } from './engine/caseTypes';
import { emptyAttemptSelections } from './engine/caseTypes';
import { buildDiagnostics } from './engine/diagnostics';
import type { GroupAction, GroupSessionState, ParticipantRole } from './engine/groupState';

const ROLE_GUIDANCE: Record<ParticipantRole, string> = {
  chair: 'You run the meeting order, rule on motions, and ensure every matter is classified into the correct session type before deliberation begins.',
  facilitator: 'You keep the contemporaneous record: motions, seconds, amendments, votes, and the disposition of every matter must be captured accurately.',
  compliance_officer: 'You weigh whether the packet, forms, and workflow activations satisfy the regulatory and accreditation standard the Board is held to.',
  clinical_manager: 'You weigh the clinical-quality evidence: metric trends, PIP sustainability, and whether any patient-safety escalation is being under-stated.',
  administrator: 'You weigh resourcing and operational feasibility: budget/staffing requests, and whether a proposed action is achievable within the agency\'s means.',
  community_member: 'You bring an independent, non-operational perspective — your vote should reflect the record presented, not management\'s framing of it.',
  member: 'You are a seated voting member. Your vote should reflect the evidence cited, not just the recommendation presented.',
  observer: 'You are a non-voting attendee. You may follow along and capture your own competency practice, but you do not vote or move motions.',
};

const MULTI_SELECT_KINDS: DecisionNode['kind'][] = ['classify_evidence', 'workflow_select', 'forms_select', 'risk_rank'];

function nowIso(): string {
  return new Date().toISOString();
}

export interface ParticipantWorkspaceProps {
  casePack: CasePack;
  state: GroupSessionState;
  dispatch: Dispatch<GroupAction>;
  participantId: string;
}

export default function ParticipantWorkspace({ casePack, state, dispatch, participantId }: ParticipantWorkspaceProps) {
  const participant = state.participants.find((p) => p.id === participantId);

  const capturableNodes = useMemo(
    () => casePack.decisionNodes.filter((n) => (n.options?.length ?? 0) > 0),
    [casePack],
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>(capturableNodes[0]?.id ?? '');
  const [chosenOptionIds, setChosenOptionIds] = useState<string[]>([]);
  const [citedEvidenceIds, setCitedEvidenceIds] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<ReturnType<typeof buildDiagnostics>[number] | null>(null);

  const node = capturableNodes.find((n) => n.id === selectedNodeId) ?? null;
  const multiSelect = node ? MULTI_SELECT_KINDS.includes(node.kind) : false;

  const candidateEvidence = useMemo(() => {
    if (!node) return [];
    const decoyIds = casePack.exhibits
      .filter((e) => (e.relevance === 'decoy' || e.relevance === 'conflicting') && !node.requiredEvidenceIds.includes(e.id))
      .slice(0, 4)
      .map((e) => e.id);
    const ids = Array.from(new Set([...node.requiredEvidenceIds, ...decoyIds]));
    return ids
      .map((id) => casePack.exhibits.find((e) => e.id === id))
      .filter((e): e is NonNullable<typeof e> => Boolean(e));
  }, [node, casePack.exhibits]);

  if (!participant) {
    return (
      <div className="bs-rail-card">
        <p>This participant is no longer on the session roster.</p>
      </div>
    );
  }

  const isCurrentMatter = state.currentMatterId !== null && node?.matterId === state.currentMatterId;
  const barredFromCurrentMatter = !participant.present || participant.recused || participant.conflict;
  const blocked = isCurrentMatter && barredFromCurrentMatter;

  const alreadyAttested = Boolean(state.individualAttestations[participantId]);

  function toggleOption(optionId: string) {
    if (!node) return;
    setChosenOptionIds((prev) => {
      if (multiSelect) {
        return prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId];
      }
      return prev.includes(optionId) ? [] : [optionId];
    });
  }

  function toggleEvidence(exhibitId: string) {
    setCitedEvidenceIds((prev) => (prev.includes(exhibitId) ? prev.filter((id) => id !== exhibitId) : [...prev, exhibitId]));
  }

  function selectNode(id: string) {
    setSelectedNodeId(id);
    setChosenOptionIds([]);
    setCitedEvidenceIds([]);
    setLastResult(null);
  }

  function submitCapture() {
    if (!node || blocked || chosenOptionIds.length === 0) return;
    const selections = emptyAttemptSelections();
    selections.nodeSelections[node.id] = {
      nodeId: node.id,
      selectedOptionIds: chosenOptionIds,
      evidenceCited: citedEvidenceIds,
      timestampIso: nowIso(),
    };
    const diagnostics = buildDiagnostics(casePack, selections);
    const diagnostic = diagnostics.find((d) => d.nodeId === node.id) ?? null;
    if (!diagnostic) return;

    setLastResult(diagnostic);
    dispatch({ type: 'capture_competency', capture: { participantId, nodeId: node.id, result: diagnostic.result } });
    dispatch({ type: 'record_group_diagnostic', diagnostic });
  }

  function submitAttestation() {
    dispatch({ type: 'attest', participantId });
  }

  return (
    <div className="bs-group" style={{ maxWidth: 760 }}>
      <div className="bs-group-head">
        <div>
          <span className="bs-kicker" style={{ color: 'var(--bs-gold)' }}>Participant Workspace</span>
          <strong>{participant.name}</strong>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="bs-badge conf-public" style={{ textTransform: 'capitalize' }}>{participant.role.replace(/_/g, ' ')}</span>
          <span className={`bs-badge ${participant.present ? 'val-validated' : 'val-conflicting'}`}>{participant.present ? 'Present' : 'Absent'}</span>
          {participant.conflict ? <span className="bs-badge val-provisional">Conflict Disclosed</span> : null}
          {participant.recused ? <span className="bs-badge val-provisional">Recused</span> : null}
        </div>
      </div>

      <div className="bs-rail-card">
        <header><strong>Your Role This Session</strong></header>
        <p style={{ fontSize: 12, color: 'var(--bs-ink)', lineHeight: 1.55 }}>{ROLE_GUIDANCE[participant.role]}</p>
      </div>

      {blocked ? (
        <div className="bs-contradiction">
          <UserX size={16} />
          <div>
            <strong>You are excluded from the current matter</strong>
            <p>
              Because you are {!participant.present ? 'not present' : participant.conflict ? 'conflicted' : 'recused'} for this
              matter, your input is excluded from its record and from the eligible-voter denominator. You may still
              capture competency on a different decision below.
            </p>
          </div>
        </div>
      ) : null}

      <div className="bs-rail-card">
        <header><strong>Individual Critical-Competency Capture</strong></header>
        <div className="bs-motion-field">
          <label htmlFor="pw-node">Decision to answer</label>
          <select id="pw-node" value={selectedNodeId} onChange={(e) => selectNode(e.target.value)}>
            {capturableNodes.map((n) => <option key={n.id} value={n.id}>{n.title}</option>)}
          </select>
        </div>

        {node ? (
          <div className="bs-decision-prompt" style={{ boxShadow: 'none', border: '1px solid var(--bs-line)' }}>
            <header>
              <h3 style={{ fontSize: 16 }}>{node.title}</h3>
            </header>
            <p className="bs-prompt-text">{node.prompt}</p>

            <div className="bs-option-list">
              {(node.options ?? []).map((opt) => {
                const selected = chosenOptionIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`bs-option${selected ? ' selected' : ''}`}
                    disabled={blocked}
                    onClick={() => toggleOption(opt.id)}
                  >
                    <span className="bs-option-mark">{selected ? '✓' : ''}</span>
                    <span className="bs-option-text">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {candidateEvidence.length > 0 ? (
              <div className="bs-motion-field">
                <label>Cite supporting evidence</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {candidateEvidence.map((ex) => (
                    <label key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                      <input
                        type="checkbox"
                        checked={citedEvidenceIds.includes(ex.id)}
                        onChange={() => toggleEvidence(ex.id)}
                      />
                      <FileText size={12} style={{ color: 'var(--bs-bronze)', flex: 'none' }} />
                      {ex.title}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              className="bs-rail-action"
              disabled={blocked || chosenOptionIds.length === 0}
              onClick={submitCapture}
            >
              Record My Decision
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 11, color: 'var(--bs-muted)' }}>No option-based decisions available in this case pack.</p>
        )}

        {lastResult ? (
          <div className={`bs-diagnostic ${lastResult.result}`}>
            <header>
              <strong>Result</strong>
              <span className={`bs-diagnostic-result ${lastResult.result}`}>{lastResult.result.replace('_', ' ')}</span>
            </header>
            <p>{lastResult.whyUserActionSucceededOrFailed}</p>
            {lastResult.evidenceMissed.length > 0 ? <p><strong>Evidence missed:</strong> {lastResult.evidenceMissed.join(', ')}</p> : null}
            {lastResult.evidenceMisused.length > 0 ? <p><strong>Evidence misused:</strong> {lastResult.evidenceMisused.join(', ')}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="bs-rail-card">
        <header><strong>Individual Attestation</strong></header>
        {alreadyAttested ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--bs-success)' }}>
            <ShieldCheck size={16} />
            <span style={{ fontSize: 12 }}>You have attested to your personal engagement with this matter.</span>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 11.5, color: 'var(--bs-ink)', lineHeight: 1.5 }}>
              By attesting, you confirm this input reflects your own independent review of the record — not a
              restatement of another member's position.
            </p>
            <button type="button" className="bs-rail-action secondary" onClick={submitAttestation}>
              <CheckCircle2 size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              I Attest
            </button>
          </>
        )}
      </div>

      {participant.conflict && !participant.recused ? (
        <div className="bs-contradiction">
          <ShieldAlert size={16} />
          <div>
            <strong>Unresolved conflict on file</strong>
            <p>You have a disclosed conflict of interest but have not been marked recused. Ask the facilitator to update your status before the current matter proceeds to a vote.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
