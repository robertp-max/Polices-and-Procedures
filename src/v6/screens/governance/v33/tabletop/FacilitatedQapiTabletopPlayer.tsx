// Facilitated (same-device) group 2026 QAPI Tabletop (§5).
//
// One shared screen: session setup -> roster/roles -> facilitator-paced
// rounds with per-participant initial positions, a recorded motion + vote +
// dissent per decision, a shared surveyor defense, and then EACH required
// participant completing their OWN changed-facts transfer + attestation.
// A group score never substitutes for an individual's own completion — every
// participant's pass/fail and evidence commit is computed and executed
// separately.

import { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, FileSearch, FileWarning, Lock, Plus, ShieldAlert, Trash2, Users,
} from 'lucide-react';
import { commitEvidence } from '../compliance/complianceStore';
import { useLearnerId } from '../compliance/complianceIdentity';
import { getComplianceEvidenceService } from '../compliance/complianceEvidenceAdapter';
import { integrityHash } from '../assessments/assessmentUtils';
import {
  QAPI2026_TABLETOP,
  QAPI2026_TABLETOP_ASSIGNMENT_ID,
  QAPI2026_TABLETOP_ID,
  scoreQ26Tabletop,
  type Q26Decision,
  type Q26Exhibit,
  type Q26Score,
} from './qapi2026TabletopCase';
import { buildQ26Form, selectQ26FormIndex } from './qapi2026TabletopForms';
import {
  PARTICIPANT_ROLE_LABEL,
  REQUIRED_PARTICIPANT_ROLES,
  SOLO_STEP_LABEL,
  SOLO_STEP_ORDER,
  createFacilitatedState,
  makeParticipantId,
  newFacilitatedSessionId,
  saveFacilitatedState,
  type FacilitatedPhase,
  type FacilitatedTabletopState,
  type TabletopMotion,
  type TabletopParticipant,
  type TabletopParticipantRole,
} from './TabletopSessionStore';
import './tabletop2026.css';

const c = QAPI2026_TABLETOP;
const DECISION_STEPS: Record<Extract<FacilitatedPhase, 'conflict_quorum' | 'q1_baseline' | 'q2_injects' | 'q3_injects' | 'q4_closure' | 'directive'>, { round: Q26Decision['round']; onlyConflict?: boolean }> = {
  conflict_quorum: { round: 'Q1', onlyConflict: true },
  q1_baseline: { round: 'Q1' },
  q2_injects: { round: 'Q2' },
  q3_injects: { round: 'Q3' },
  q4_closure: { round: 'Q4' },
  directive: { round: 'YEAR_END' },
};

function emptyMotion(decisionId: string): TabletopMotion {
  return { decisionId, motionText: '', conditions: '', outcomeOptionId: null, votesFor: [], votesAgainst: [], abstained: [], recusedParticipantIds: [], dissent: '' };
}

export default function FacilitatedQapiTabletopPlayer({ onExit }: { onExit: () => void }) {
  // Facilitator's authenticated identity anchors the group session; each
  // participant record is namespaced under it.
  const facilitatorLearnerId = useLearnerId();
  const [session, setSession] = useState<FacilitatedTabletopState | null>(null);
  const [activeParticipantId, setActiveParticipantId] = useState<string | null>(null);
  const [individualResults, setIndividualResults] = useState<Record<string, { score: Q26Score; recorded: boolean; notice: string }>>({});
  const [attemptNumber] = useState(1);

  const form = useMemo(() => buildQ26Form(session?.formIndex ?? selectQ26FormIndex('facilitated-room', attemptNumber)), [session?.formIndex, attemptNumber]);
  const exhibitsById = useMemo(() => new Map(c.exhibits.map((e) => [e.id, e])), []);
  const exhibitsInOrder = useMemo(
    () => form.exhibitOrder.map((id) => exhibitsById.get(id)).filter((e): e is Q26Exhibit => Boolean(e)),
    [form, exhibitsById],
  );
  const criticalExhibits = useMemo(() => c.exhibits.filter((e) => e.critical), []);

  if (!session) {
    return <SetupScreen onExit={onExit} onStart={(s) => { setSession(s); saveFacilitatedState(s); }} />;
  }

  const update = (fn: (s: FacilitatedTabletopState) => FacilitatedTabletopState) =>
    setSession((s) => {
      if (!s) return s;
      const next = fn(s);
      saveFacilitatedState(next);
      return next;
    });

  const allCriticalOpen = criticalExhibits.every((e) => session.inspectedExhibitIds.includes(e.id));
  const inspect = (id: string) => update((s) => (s.inspectedExhibitIds.includes(id) ? s : { ...s, inspectedExhibitIds: [...s.inspectedExhibitIds, id] }));

  const requiredParticipants = session.roster.filter((p) => REQUIRED_PARTICIPANT_ROLES.includes(p.role));

  function decisionsForStep(step: keyof typeof DECISION_STEPS): Q26Decision[] {
    const spec = DECISION_STEPS[step];
    return form.decisions.filter((d) => d.round === spec.round && (spec.onlyConflict ? d.dimension === 'authority_quorum_conflict' : d.dimension !== 'authority_quorum_conflict' || spec.round !== 'Q1'));
  }

  function isStepComplete(step: FacilitatedPhase): boolean {
    if (!session) return false;
    if (step === 'brief') return true;
    if (step === 'pre_read') return allCriticalOpen;
    if (step in DECISION_STEPS) {
      const decisions = decisionsForStep(step as keyof typeof DECISION_STEPS);
      return decisions.every((d) => Boolean(session.motions[d.id]?.outcomeOptionId));
    }
    if (step === 'surveyor') return c.surveyor.every((q) => Boolean(session.groupSurveyor[q.id]));
    if (step === 'transfer') return requiredParticipants.every((p) => c.transfer.every((t) => Boolean(p.transferAnswers[t.id])) && Boolean(p.attestedAt));
    return true;
  }

  const canAdvance = isStepComplete(session.currentStep);

  const unlockNext = () => {
    if (!canAdvance) return;
    const i = SOLO_STEP_ORDER.indexOf(session.currentStep);
    if (i >= SOLO_STEP_ORDER.length - 1) return;
    const next = SOLO_STEP_ORDER[i + 1];
    update((s) => ({ ...s, currentStep: next, unlockedSteps: s.unlockedSteps.includes(next) ? s.unlockedSteps : [...s.unlockedSteps, next] }));
  };
  const goToStep = (step: FacilitatedPhase) => {
    if (!session.unlockedSteps.includes(step)) return;
    update((s) => ({ ...s, currentStep: step }));
  };

  const setInitialPosition = (participantId: string, decisionId: string, optionId: string) =>
    update((s) => ({ ...s, roster: s.roster.map((p) => (p.participantId === participantId ? { ...p, initialPositions: { ...p.initialPositions, [decisionId]: optionId } } : p)) }));

  const updateMotion = (decisionId: string, patch: Partial<TabletopMotion>) =>
    update((s) => ({ ...s, motions: { ...s.motions, [decisionId]: { ...(s.motions[decisionId] ?? emptyMotion(decisionId)), ...patch } } }));

  const toggleMotionRecusal = (decisionId: string, participantId: string) =>
    update((s) => {
      const m = s.motions[decisionId] ?? emptyMotion(decisionId);
      const already = m.recusedParticipantIds.includes(participantId);
      const recusedParticipantIds = already ? m.recusedParticipantIds.filter((id) => id !== participantId) : [...m.recusedParticipantIds, participantId];
      const votesFor = m.votesFor.filter((id) => id !== participantId);
      const votesAgainst = m.votesAgainst.filter((id) => id !== participantId);
      const abstained = m.abstained.filter((id) => id !== participantId);
      return { ...s, motions: { ...s.motions, [decisionId]: { ...m, recusedParticipantIds, votesFor, votesAgainst, abstained } } };
    });

  const setVote = (decisionId: string, participantId: string, vote: 'for' | 'against' | 'abstain') =>
    update((s) => {
      const m = s.motions[decisionId] ?? emptyMotion(decisionId);
      const strip = (arr: string[]) => arr.filter((id) => id !== participantId);
      const next: TabletopMotion = { ...m, votesFor: strip(m.votesFor), votesAgainst: strip(m.votesAgainst), abstained: strip(m.abstained) };
      if (vote === 'for') next.votesFor = [...next.votesFor, participantId];
      if (vote === 'against') next.votesAgainst = [...next.votesAgainst, participantId];
      if (vote === 'abstain') next.abstained = [...next.abstained, participantId];
      return { ...s, motions: { ...s.motions, [decisionId]: next } };
    });

  const setGroupSurveyor = (id: string, optionId: string) => update((s) => ({ ...s, groupSurveyor: { ...s.groupSurveyor, [id]: optionId } }));

  const setParticipantTransfer = (participantId: string, transferId: string, optionId: string) =>
    update((s) => ({ ...s, roster: s.roster.map((p) => (p.participantId === participantId ? { ...p, transferAnswers: { ...p.transferAnswers, [transferId]: optionId } } : p)) }));

  const attestParticipant = (participantId: string) =>
    update((s) => ({ ...s, roster: s.roster.map((p) => (p.participantId === participantId ? { ...p, attestedAt: new Date().toISOString() } : p)) }));

  const submitParticipant = async (participant: TabletopParticipant) => {
    const decisions: Record<string, string> = {};
    for (const [decisionId, motion] of Object.entries(session.motions)) if (motion.outcomeOptionId) decisions[decisionId] = motion.outcomeOptionId;
    const score = scoreQ26Tabletop({
      decisions,
      surveyor: session.groupSurveyor,
      transferAnswers: participant.transferAnswers,
      inspectedExhibitIds: session.inspectedExhibitIds,
      attested: Boolean(participant.attestedAt),
    });
    const payload = {
      assignmentId: QAPI2026_TABLETOP_ASSIGNMENT_ID,
      learnerId: `${facilitatorLearnerId}:${participant.participantId}`,
      role: 'GB' as const,
      sourceId: QAPI2026_TABLETOP_ID,
      sourceType: 'tabletop' as const,
      sourceVersion: `form-${form.formIndex}`,
      effectiveDate: null,
      readCompletedAt: new Date().toISOString(),
      attestedAt: participant.attestedAt,
      answersSnapshot: { decisions, surveyor: session.groupSurveyor, transferAnswers: participant.transferAnswers, initialPosition: participant.initialPositions },
      score: score.scorePercent,
      outcome: score.passed ? ('passed' as const) : ('failed' as const),
      criticalErrors: score.criticalReasons,
      attemptNumber: 1,
      remediationPath: 'none' as const,
      activeTimeSeconds: Math.max(0, Math.round((Date.now() - Date.parse(session.startedAt)) / 1000)),
      completedAt: score.passed ? new Date().toISOString() : null,
    };
    let recorded = false;
    let notice = getComplianceEvidenceService().disconnectedNotice;
    if (score.passed) {
      const saved = await commitEvidence(QAPI2026_TABLETOP_ASSIGNMENT_ID, { ...payload, integrityHash: integrityHash(payload) } as never);
      recorded = saved.ok;
      if (!saved.ok) notice = saved.message;
    }
    setIndividualResults((prev) => ({ ...prev, [participant.participantId]: { score, recorded, notice } }));
  };

  const submitAll = async () => {
    for (const p of requiredParticipants) await submitParticipant(p);
  };

  return (
    <div className="tabletop-shell">
      <header className="assessment-bar">
        <button className="assessment-back" onClick={onExit} aria-label="Save & exit to My Compliance"><ArrowLeft size={17} /> Save &amp; exit</button>
        <div className="assessment-bar-title"><span>2026 QAPI TABLETOP · FACILITATED GROUP · {c.minutes} MIN</span><strong>{session.title || c.title}</strong></div>
      </header>

      <div className="tabletop-layout">
        <aside className="tabletop-exhibits" aria-label="Case exhibits">
          <h2><FileSearch size={16} /> Exhibits</h2>
          <p className="tabletop-exhibit-note">The room opens exhibits together. Decoys look relevant but are immaterial; injects are clearly marked and never real source data.</p>
          <ul>
            {exhibitsInOrder.map((e) => (
              <li key={e.id}>
                <button className={session.inspectedExhibitIds.includes(e.id) ? 'opened' : ''} onClick={() => inspect(e.id)}>
                  <span className="tabletop-exhibit-code">{e.quarter} · {e.code}{e.critical && <em title="Critical exhibit"> ●</em>}</span>
                  <strong>{e.title}</strong>
                  <span className="q26tt-badge-row">
                    {e.decoy && <span className="q26tt-badge q26tt-badge-decoy">Decoy</span>}
                    {e.isInject && <span className="q26tt-badge q26tt-badge-inject">Exercise inject</span>}
                  </span>
                  {session.inspectedExhibitIds.includes(e.id) && <small>{e.summary}</small>}
                  {session.inspectedExhibitIds.includes(e.id) && e.isInject && e.injectNote && <p className="q26tt-inject-note">{e.injectNote}</p>}
                </button>
              </li>
            ))}
          </ul>
          <div className="tabletop-exhibit-progress">{session.inspectedExhibitIds.filter((id) => criticalExhibits.some((e) => e.id === id)).length}/{criticalExhibits.length} critical exhibits opened</div>
        </aside>

        <main className="tabletop-canvas">
          <ol className="q26tt-round-rail">
            {SOLO_STEP_ORDER.map((step, i) => (
              <li key={step} className={step === session.currentStep ? 'active' : session.unlockedSteps.includes(step) ? 'done' : ''}>
                <button
                  type="button"
                  disabled={!session.unlockedSteps.includes(step)}
                  onClick={() => goToStep(step)}
                  aria-current={step === session.currentStep ? 'step' : undefined}
                  style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: session.unlockedSteps.includes(step) ? 'pointer' : 'default', padding: 0 }}
                >
                  <span>{i + 1}</span>{SOLO_STEP_LABEL[step]}
                </button>
              </li>
            ))}
          </ol>

          <p className="q26tt-quiet">Facilitator: {session.facilitatorName || '—'} · Quorum rule: {session.quorumRule || '—'} · {requiredParticipants.length} required participants seated</p>

          {session.currentStep === 'brief' && (
            <section className="tabletop-brief">
              <span className="assessment-kicker"><ShieldAlert size={15} /> ASSESSMENT — NO ANSWERS ARE REVEALED UNTIL SCORING</span>
              <h1>{c.title}</h1>
              <p>{c.context}</p>
              <div className="tabletop-standard">
                <h3>What counts as complete</h3>
                <ul>
                  <li>Group score ≥ {c.passScore}% AND zero critical errors from the recorded motion outcomes.</li>
                  <li>Every required participant completes their own changed-facts transfer and attestation — a group score never substitutes for that.</li>
                  <li>All critical exhibits opened, every decision resolved by a recorded motion, and the surveyor defense answered.</li>
                </ul>
                <h3>Automatic critical failures</h3>
                <ul className="tabletop-critical-list">{c.automaticCriticalFailures.map((f) => <li key={f}>{f}</li>)}</ul>
              </div>
              <button className="assessment-primary" onClick={unlockNext}>Begin pre-read <ArrowRight size={15} /></button>
            </section>
          )}

          {session.currentStep === 'pre_read' && (
            <section className="tabletop-round">
              <header className="tabletop-round-head"><span>PRE-READ</span><h2>Reconstruct the packet together</h2><p>Open every critical exhibit as a room before the facilitator unlocks the first round.</p></header>
              <ul className="q26tt-contradictions">
                {c.contradictions.map((ct) => (<li key={ct.id}><strong>{ct.title}</strong><span>{ct.detail}</span></li>))}
              </ul>
              {!allCriticalOpen && <p className="assessment-critical-note">Open all critical exhibits in the left rail to continue.</p>}
              <div className="tabletop-nav">
                <button className="assessment-primary" disabled={!canAdvance} onClick={unlockNext}>Facilitator: unlock next round <ArrowRight size={15} /></button>
              </div>
            </section>
          )}

          {session.currentStep in DECISION_STEPS && (
            <MotionRoundStep
              step={session.currentStep as keyof typeof DECISION_STEPS}
              decisions={decisionsForStep(session.currentStep as keyof typeof DECISION_STEPS)}
              roster={session.roster}
              motions={session.motions}
              onInitialPosition={setInitialPosition}
              onMotionField={updateMotion}
              onToggleRecusal={toggleMotionRecusal}
              onVote={setVote}
              canAdvance={canAdvance}
              onUnlockNext={unlockNext}
            />
          )}

          {session.currentStep === 'surveyor' && (
            <section className="tabletop-round">
              <header className="tabletop-round-head"><span>SURVEYOR DEFENSE</span><h2>Defend the record as a room</h2><p>Reach a shared answer for each question.</p></header>
              {c.surveyor.map((q) => (
                <fieldset key={q.id} className="assessment-question">
                  <legend>{q.prompt}</legend>
                  {q.options.map((o) => (
                    <label key={o.id} className="assessment-option">
                      <input type="radio" name={q.id} checked={session.groupSurveyor[q.id] === o.id} onChange={() => setGroupSurveyor(q.id, o.id)} />
                      <span>{o.text}</span>
                    </label>
                  ))}
                </fieldset>
              ))}
              <div className="tabletop-nav">
                <button className="assessment-primary" disabled={!canAdvance} onClick={unlockNext}>Facilitator: unlock transfer round <ArrowRight size={15} /></button>
              </div>
            </section>
          )}

          {session.currentStep === 'transfer' && (
            <TransferStep
              roster={requiredParticipants}
              activeParticipantId={activeParticipantId ?? requiredParticipants[0]?.participantId ?? null}
              onSelectParticipant={setActiveParticipantId}
              onAnswer={setParticipantTransfer}
              onAttest={attestParticipant}
              canAdvance={canAdvance}
              onUnlockNext={unlockNext}
            />
          )}

          {session.currentStep === 'attestation' && (
            <AttestationStep
              roster={requiredParticipants}
              results={individualResults}
              onSubmitAll={() => void submitAll()}
              onExit={onExit}
              minutes={c.minutes}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ---- Setup screen ------------------------------------------------------------

function SetupScreen({ onExit, onStart }: { onExit: () => void; onStart: (s: FacilitatedTabletopState) => void }) {
  const [title, setTitle] = useState('2026 QAPI Tabletop — Facilitated Session');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [facilitator, setFacilitator] = useState('');
  const [quorumRule, setQuorumRule] = useState('Majority of seated, non-recused directors');
  const [roster, setRoster] = useState<TabletopParticipant[]>([]);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<TabletopParticipantRole>('chair');

  const addParticipant = () => {
    const name = newName.trim();
    if (!name) return;
    const participantId = makeParticipantId(name, newRole);
    if (roster.some((p) => p.participantId === participantId)) return;
    setRoster((r) => [...r, {
      participantId, name, role: newRole, hasConflict: false, conflictNote: '', recused: false,
      initialPositions: {}, transferAnswers: {}, attestedAt: null, evidence: null,
    }]);
    setNewName('');
  };
  const removeParticipant = (id: string) => setRoster((r) => r.filter((p) => p.participantId !== id));
  const patchParticipant = (id: string, patch: Partial<TabletopParticipant>) => setRoster((r) => r.map((p) => (p.participantId === id ? { ...p, ...patch } : p)));

  const missingRoles = REQUIRED_PARTICIPANT_ROLES.filter((role) => !roster.some((p) => p.role === role));
  const canStart = missingRoles.length === 0 && facilitator.trim().length > 0;

  const start = () => {
    if (!canStart) return;
    const sessionId = newFacilitatedSessionId(`${Date.now()}`);
    const formIndex = selectQ26FormIndex('facilitated-room', 1);
    onStart(createFacilitatedState({ sessionId, formIndex, title, sessionDate: date, facilitatorName: facilitator, quorumRule, roster }));
  };

  return (
    <div className="tabletop-shell">
      <header className="assessment-bar">
        <button className="assessment-back" onClick={onExit} aria-label="Save & exit to My Compliance"><ArrowLeft size={17} /> Save &amp; exit</button>
        <div className="assessment-bar-title"><span>2026 QAPI TABLETOP · FACILITATED GROUP</span><strong>Session setup</strong></div>
      </header>
      <div className="q26tt-entry">
        <div className="q26tt-entry-head">
          <span className="q26tt-entry-kicker"><Users size={13} /> Same-device room</span>
          <h1>Set up the room</h1>
          <p>Name the session, assign the facilitator, set the quorum rule, and seat every required role before starting.</p>
        </div>

        <div className="q26tt-setup-grid">
          <div className="q26tt-field"><label htmlFor="q26-title">Session title</label><input id="q26-title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="q26tt-field"><label htmlFor="q26-date">Session date</label><input id="q26-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="q26tt-field"><label htmlFor="q26-facilitator">Facilitator name</label><input id="q26-facilitator" value={facilitator} onChange={(e) => setFacilitator(e.target.value)} placeholder="Required" /></div>
          <div className="q26tt-field"><label htmlFor="q26-quorum">Quorum rule</label><input id="q26-quorum" value={quorumRule} onChange={(e) => setQuorumRule(e.target.value)} /></div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-editorial)', color: 'var(--forest)', fontSize: 18 }}>Roster &amp; roles</h2>
        <p className="q26tt-hint">Required roles: {REQUIRED_PARTICIPANT_ROLES.map((r) => PARTICIPANT_ROLE_LABEL[r]).join(', ')}. Observer/Surveyor is optional and non-voting.</p>

        <div className="q26tt-roster">
          {roster.map((p) => (
            <div key={p.participantId} className={`q26tt-roster-row${p.hasConflict ? ' conflict' : ''}`}>
              <div><strong>{p.name}</strong><div className="q26tt-quiet">{PARTICIPANT_ROLE_LABEL[p.role]}</div></div>
              <label className="q26tt-conflict-toggle">
                <input type="checkbox" checked={p.hasConflict} onChange={(e) => patchParticipant(p.participantId, { hasConflict: e.target.checked })} /> Discloses a conflict
              </label>
              {p.hasConflict ? (
                <input aria-label={`Conflict note for ${p.name}`} placeholder="Conflict note" value={p.conflictNote} onChange={(e) => patchParticipant(p.participantId, { conflictNote: e.target.value })} />
              ) : <span />}
              <button className="q26tt-roster-remove" onClick={() => removeParticipant(p.participantId)} aria-label={`Remove ${p.name}`}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>

        <div className="q26tt-roster-add">
          <div className="q26tt-field"><label htmlFor="q26-new-name">Name</label><input id="q26-new-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Dana Ruiz" /></div>
          <div className="q26tt-field">
            <label htmlFor="q26-new-role">Role</label>
            <select id="q26-new-role" value={newRole} onChange={(e) => setNewRole(e.target.value as TabletopParticipantRole)}>
              {(Object.keys(PARTICIPANT_ROLE_LABEL) as TabletopParticipantRole[]).map((r) => <option key={r} value={r}>{PARTICIPANT_ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <button className="assessment-secondary" onClick={addParticipant}><Plus size={15} /> Add participant</button>
        </div>

        {missingRoles.length > 0 && (
          <p className="q26tt-role-missing">Still need: {missingRoles.map((r) => PARTICIPANT_ROLE_LABEL[r]).join(', ')}.</p>
        )}

        <div className="tabletop-nav">
          <button className="assessment-primary" disabled={!canStart} onClick={start}>Start session <ArrowRight size={15} /></button>
        </div>
      </div>
    </div>
  );
}

// ---- Motion / vote round ------------------------------------------------

function MotionRoundStep({
  step, decisions, roster, motions, onInitialPosition, onMotionField, onToggleRecusal, onVote, canAdvance, onUnlockNext,
}: {
  step: keyof typeof DECISION_STEPS;
  decisions: Q26Decision[];
  roster: TabletopParticipant[];
  motions: Record<string, TabletopMotion>;
  onInitialPosition: (participantId: string, decisionId: string, optionId: string) => void;
  onMotionField: (decisionId: string, patch: Partial<TabletopMotion>) => void;
  onToggleRecusal: (decisionId: string, participantId: string) => void;
  onVote: (decisionId: string, participantId: string, vote: 'for' | 'against' | 'abstain') => void;
  canAdvance: boolean;
  onUnlockNext: () => void;
}) {
  const titles: Record<keyof typeof DECISION_STEPS, { title: string; body: string }> = {
    conflict_quorum: { title: 'Conflict & quorum', body: 'A disclosed director conflict intersects the very CAP under review. Decide how the Board is properly seated before any vote.' },
    q1_baseline: { title: 'Q1 — Baseline', body: 'Separate decisive evidence from decoys for the Q1 PIP triggers, then decide direction on the restricted personnel matters.' },
    q2_injects: { title: 'Q2 — Worsening injects', body: 'A favorable aggregate arrives beside worsening subgroups, an unreconciled census, and a clinician-ID identity collision.' },
    q3_injects: { title: 'Q3 — Growth & hospitalization injects', body: 'Q3 is unnormalized in the source; the growth and vendor scenarios here are exercise injects layered on that gap.' },
    q4_closure: { title: 'Q4 — Closure claims', body: "Management treats two PIPs' silence in the record as closure. Decide what the record actually supports." },
    directive: { title: 'Motion & directive drafting', body: 'Draft the year-end directive. A material directive without an owner, due date, effectiveness measure, and return date is a critical failure.' },
  };
  const { title, body } = titles[step];

  return (
    <section className="tabletop-round">
      <header className="tabletop-round-head"><span>REQUIRED DECISIONS — RECORDED BY MOTION</span><h2>{title}</h2><p>{body}</p></header>
      {decisions.map((dec) => {
        const motion = motions[dec.id] ?? emptyMotion(dec.id);
        const eligible = roster.filter((p) => !p.recused && !motion.recusedParticipantIds.includes(p.participantId));
        return (
          <div key={dec.id} className="q26tt-motion">
            <h3>{dec.prompt}</h3>

            <div className="q26tt-quiet">Individual initial positions (recorded before the vote):</div>
            {roster.map((p) => (
              <label key={p.participantId} className="q26tt-vote-row">
                <span>{p.name} — {PARTICIPANT_ROLE_LABEL[p.role]}</span>
                <select value={p.initialPositions[dec.id] ?? ''} onChange={(e) => onInitialPosition(p.participantId, dec.id, e.target.value)} style={{ gridColumn: '2 / span 3' }}>
                  <option value="" disabled>Choose an initial position…</option>
                  {dec.options.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}
                </select>
              </label>
            ))}

            <div className="q26tt-field">
              <label>Motion text (Recorder)
                <textarea value={motion.motionText} onChange={(e) => onMotionField(dec.id, { motionText: e.target.value })} placeholder="Move that the Board…" />
              </label>
            </div>
            <div className="q26tt-field">
              <label>Conditions (Recorder)
                <textarea value={motion.conditions} onChange={(e) => onMotionField(dec.id, { conditions: e.target.value })} placeholder="Conditioned on…" />
              </label>
            </div>

            <div className="q26tt-quiet">Recuse from this vote:</div>
            {roster.map((p) => (
              <label key={p.participantId} className="q26tt-conflict-toggle">
                <input type="checkbox" checked={motion.recusedParticipantIds.includes(p.participantId) || p.recused} disabled={p.recused} onChange={() => onToggleRecusal(dec.id, p.participantId)} />
                {p.name}{p.hasConflict ? ' (disclosed conflict)' : ''}{p.recused ? ' — standing recusal' : ''}
              </label>
            ))}

            <div className="q26tt-vote-grid">
              {eligible.map((p) => (
                <div key={p.participantId} className="q26tt-vote-row">
                  <span>{p.name}</span>
                  <label><input type="radio" name={`${dec.id}-${p.participantId}`} checked={motion.votesFor.includes(p.participantId)} onChange={() => onVote(dec.id, p.participantId, 'for')} /> For</label>
                  <label><input type="radio" name={`${dec.id}-${p.participantId}`} checked={motion.votesAgainst.includes(p.participantId)} onChange={() => onVote(dec.id, p.participantId, 'against')} /> Against</label>
                  <label><input type="radio" name={`${dec.id}-${p.participantId}`} checked={motion.abstained.includes(p.participantId)} onChange={() => onVote(dec.id, p.participantId, 'abstain')} /> Abstain</label>
                </div>
              ))}
              {roster.filter((p) => !eligible.includes(p)).map((p) => (
                <div key={p.participantId} className="q26tt-vote-row recused"><span>{p.name}</span><span className="q26tt-recused-note" style={{ gridColumn: '2 / span 3' }}>Recused — excluded from this vote</span></div>
              ))}
            </div>
            <p className="q26tt-quiet">{motion.votesFor.length} for · {motion.votesAgainst.length} against · {motion.abstained.length} abstained · {eligible.length} eligible</p>

            <div className="q26tt-field">
              <label>Recorded outcome (what the motion resolves to — this is what gets scored)
                <select value={motion.outcomeOptionId ?? ''} onChange={(e) => onMotionField(dec.id, { outcomeOptionId: e.target.value || null })}>
                  <option value="" disabled>Select the adopted outcome…</option>
                  {dec.options.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}
                </select>
              </label>
            </div>
            <div className="q26tt-field">
              <label>Dissent (preserved in the record, optional)
                <textarea value={motion.dissent} onChange={(e) => onMotionField(dec.id, { dissent: e.target.value })} placeholder="Any participant's recorded disagreement with the outcome…" />
              </label>
            </div>
          </div>
        );
      })}
      <div className="tabletop-nav">
        <button className="assessment-primary" disabled={!canAdvance} onClick={onUnlockNext}>Facilitator: unlock next round <ArrowRight size={15} /></button>
      </div>
    </section>
  );
}

// ---- Per-participant transfer + attestation --------------------------------

function TransferStep({
  roster, activeParticipantId, onSelectParticipant, onAnswer, onAttest, canAdvance, onUnlockNext,
}: {
  roster: TabletopParticipant[];
  activeParticipantId: string | null;
  onSelectParticipant: (id: string) => void;
  onAnswer: (participantId: string, transferId: string, optionId: string) => void;
  onAttest: (participantId: string) => void;
  canAdvance: boolean;
  onUnlockNext: () => void;
}) {
  const active = roster.find((p) => p.participantId === activeParticipantId) ?? roster[0];
  if (!active) return <p className="q26tt-quiet">No required participants seated.</p>;

  const activeComplete = c.transfer.every((t) => Boolean(active.transferAnswers[t.id])) && Boolean(active.attestedAt);

  return (
    <section className="tabletop-round">
      <header className="tabletop-round-head"><span>CHANGED-FACTS TRANSFER — INDIVIDUAL</span><h2>Each required participant answers on their own</h2><p>The group already decided the case together; now each person must show they can reapply the rule themselves, and attest individually.</p></header>

      <nav className="q26tt-participant-tabs">
        {roster.map((p) => {
          const done = c.transfer.every((t) => Boolean(p.transferAnswers[t.id])) && Boolean(p.attestedAt);
          return (
            <button key={p.participantId} className={`${p.participantId === active.participantId ? 'active' : ''} ${done ? 'complete' : ''}`} onClick={() => onSelectParticipant(p.participantId)}>
              {done && <CheckCircle2 size={13} />} {p.name}
            </button>
          );
        })}
      </nav>

      <div className="q26tt-participant-panel">
        {c.transfer.map((t) => (
          <fieldset key={t.id} className="assessment-question" style={{ marginBottom: 14 }}>
            <legend><span className="tabletop-transfer-facts">{t.changedFacts}</span><br />{t.prompt}</legend>
            {t.options.map((o) => (
              <label key={o.id} className="assessment-option">
                <input type="radio" name={`${active.participantId}-${t.id}`} checked={active.transferAnswers[t.id] === o.id} onChange={() => onAnswer(active.participantId, t.id, o.id)} />
                <span>{o.text}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <div className="assessment-attest">
          <label>
            <input type="checkbox" checked={Boolean(active.attestedAt)} onChange={() => onAttest(active.participantId)} disabled={!c.transfer.every((t) => Boolean(active.transferAnswers[t.id]))} />
            <span>I, {active.name} ({PARTICIPANT_ROLE_LABEL[active.role]}), attest that these are my own answers and my own governance judgment on this case.</span>
          </label>
        </div>
        {activeComplete && <p className="q26tt-quiet">{active.name} has completed their individual transfer and attestation.</p>}
      </div>

      <div className="tabletop-nav">
        <button className="assessment-primary" disabled={!canAdvance} onClick={onUnlockNext}>Facilitator: unlock scoring <ArrowRight size={15} /></button>
      </div>
    </section>
  );
}

// ---- Scoring / attestation summary -----------------------------------------

function AttestationStep({
  roster, results, onSubmitAll, onExit, minutes,
}: {
  roster: TabletopParticipant[];
  results: Record<string, { score: Q26Score; recorded: boolean; notice: string }>;
  onSubmitAll: () => void;
  onExit: () => void;
  minutes: number;
}) {
  const anyScored = Object.keys(results).length > 0;
  return (
    <section className="tabletop-review">
      <h2>Score &amp; individual completion</h2>
      <p className="q26tt-group-note">Every required participant's own pass/fail and evidence record is computed separately from the shared motion outcomes and their own transfer answer — a shared score never auto-completes anyone's individual record.</p>

      {!anyScored && (
        <div className="tabletop-nav">
          <button className="assessment-primary" onClick={onSubmitAll}><Lock size={13} /> Lock &amp; score every required participant</button>
        </div>
      )}

      {anyScored && (
        <div className="q26tt-individual-status">
          {roster.map((p) => {
            const r = results[p.participantId];
            if (!r) return <div key={p.participantId} className="q26tt-individual-row"><span>{p.name}</span><span>Not yet scored</span></div>;
            return (
              <div key={p.participantId} className={`q26tt-individual-row ${r.score.passed ? 'pass' : 'fail'}`}>
                <span>{r.score.passed ? <CheckCircle2 size={15} /> : <ShieldAlert size={15} />} {p.name} — {PARTICIPANT_ROLE_LABEL[p.role]}</span>
                <span>{r.score.scorePercent}% · {r.score.passed ? (r.recorded ? 'Recorded' : 'Preview only') : r.score.criticalFailure ? 'Critical failure' : 'Below standard'}</span>
              </div>
            );
          })}
          {roster.some((p) => results[p.participantId]?.score.passed && !results[p.participantId]?.recorded) && (
            <p className="assessment-preview-note"><FileWarning size={15} /> {Object.values(results).find((r) => r.score.passed && !r.recorded)?.notice} Passing attempts above are <strong>not</strong> recorded as official completion.</p>
          )}
        </div>
      )}

      <p className="q26tt-quiet">Case standard: {minutes} minutes allotted; ≥ {c.passScore}% with zero critical errors, per participant.</p>
      <button className="assessment-primary" onClick={onExit}>Return to My Compliance</button>
    </section>
  );
}
