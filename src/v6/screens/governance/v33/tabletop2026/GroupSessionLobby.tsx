// Governing Body Boardroom Simulation — Facilitated Group Lobby.
//
// Same-device facilitated-group entry screen: the facilitator picks a case
// pack, mints/regenerates a join code, builds the seated roster (name + role
// + per-participant conflict-of-interest disclosure + recusal), and — once
// the roster is valid — hands a freshly constructed GroupSessionState off to
// the parent, which owns the single shared `groupSessionReducer` instance
// for the rest of the session (see FacilitatorConsole / ParticipantWorkspace).
//
// No realtime backend: this is one facilitator, one screen, one shared
// reducer. Building the roster here is plain data construction (no
// dispatches) — createGroupSessionState + a light manual splice for the
// pre-meeting COI-disclosure notes is all pure data, not a side effect.

import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AlertTriangle, Copy, Plus, RefreshCw, ShieldAlert, Trash2, Users } from 'lucide-react';

import type { CasePack } from './engine/caseTypes';
import type { GroupSessionState, MeetingEvent, Participant, ParticipantRole, QuorumRule } from './engine/groupState';
import { createGroupSessionState } from './engine/groupState';

import { Q1_CASE_PACK } from './data/q1Case';
import { Q2_2026_CASE } from './data/q2Case';
import { Q3_2026_CASE } from './data/q3Case';
import { Q4_CASE_PACK } from './data/q4Case';
import { ANNUAL_2026_CASE } from './data/annualCase';
import { formatPassStandardLabel } from '../compliance/passStandardFormat';

const DEFAULT_CASE_PACKS: CasePack[] = [Q1_CASE_PACK, Q2_2026_CASE, Q3_2026_CASE, Q4_CASE_PACK, ANNUAL_2026_CASE];

const ROLE_OPTIONS: { value: ParticipantRole; label: string; votingSeat: boolean }[] = [
  { value: 'chair', label: 'Chair', votingSeat: true },
  { value: 'clinical_manager', label: 'Clinical / QAPI', votingSeat: true },
  { value: 'compliance_officer', label: 'Compliance', votingSeat: true },
  { value: 'administrator', label: 'Finance / Administrator', votingSeat: true },
  { value: 'community_member', label: 'Voting Member (Community)', votingSeat: true },
  { value: 'member', label: 'Voting Member', votingSeat: true },
  { value: 'facilitator', label: 'Secretary / Facilitator (attendee)', votingSeat: false },
  { value: 'observer', label: 'Observer (attendee)', votingSeat: false },
];

const ROLE_LABEL: Record<ParticipantRole, string> = Object.fromEntries(
  ROLE_OPTIONS.map((r) => [r.value, r.label]),
) as Record<ParticipantRole, string>;

function makeLocalId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function randomJoinCode(): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `GB-${suffix}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface DraftParticipant {
  localId: string;
  name: string;
  role: ParticipantRole;
  present: boolean;
  conflict: boolean;
  coiDetail: string;
  recused: boolean;
}

function seedRoster(): DraftParticipant[] {
  const seed: Array<[string, ParticipantRole]> = [
    ['Board Chair', 'chair'],
    ['Clinical / QAPI Director', 'clinical_manager'],
    ['Compliance Officer', 'compliance_officer'],
    ['Community Member A', 'community_member'],
    ['Community Member B', 'community_member'],
  ];
  return seed.map(([name, role]) => ({
    localId: makeLocalId(), name, role, present: true, conflict: false, coiDetail: '', recused: false,
  }));
}

export interface GroupSessionLobbyProps {
  /** Defaults to the five built-in packs (Q1-Q4 + FY2026 capstone). */
  casePacks?: CasePack[];
  onStart: (input: { session: GroupSessionState; casePack: CasePack }) => void;
}

export default function GroupSessionLobby({ casePacks = DEFAULT_CASE_PACKS, onStart }: GroupSessionLobbyProps) {
  const [casePackId, setCasePackId] = useState<string>(casePacks[0]?.id ?? '');
  const [joinCode, setJoinCode] = useState<string>('GB-2026');
  const [quorumKind, setQuorumKind] = useState<QuorumRule['kind']>('majority_of_voting_members');
  const [roster, setRoster] = useState<DraftParticipant[]>(() => seedRoster());
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const selectedCasePack = useMemo(() => casePacks.find((c) => c.id === casePackId) ?? null, [casePacks, casePackId]);

  const votingSeatCount = roster.filter((p) => ROLE_OPTIONS.find((r) => r.value === p.role)?.votingSeat).length;
  const attendeeCount = roster.length - votingSeatCount;
  const namedOk = roster.every((p) => p.name.trim().length > 0);
  const canStart = Boolean(selectedCasePack) && joinCode.trim().length > 0 && votingSeatCount >= 2 && namedOk;

  function updateParticipant(localId: string, patch: Partial<DraftParticipant>) {
    setRoster((rows) => rows.map((r) => (r.localId === localId ? { ...r, ...patch } : r)));
  }

  function addParticipant() {
    setRoster((rows) => [
      ...rows,
      { localId: makeLocalId(), name: '', role: 'member', present: true, conflict: false, coiDetail: '', recused: false },
    ]);
  }

  function removeParticipant(localId: string) {
    setRoster((rows) => rows.filter((r) => r.localId !== localId));
  }

  async function copyJoinCode() {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1500);
    } catch {
      // Clipboard API unavailable — silently ignore, the code is already visible on screen.
    }
  }

  function handleStart() {
    if (!selectedCasePack || !canStart) return;

    const participants: Participant[] = roster.map((r) => ({
      id: r.localId,
      name: r.name.trim(),
      role: r.role,
      present: r.present,
      recused: r.recused,
      conflict: r.conflict,
    }));

    const quorumRule: QuorumRule =
      quorumKind === 'majority_of_voting_members'
        ? { kind: 'majority_of_voting_members' }
        : quorumKind === 'fixed_count'
          ? { kind: 'fixed_count', count: Math.max(1, Math.ceil(votingSeatCount / 2)) }
          : { kind: 'fraction', numerator: 2, denominator: 3 };

    let session = createGroupSessionState({
      sessionId: `gb-session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      casePackId: selectedCasePack.id,
      joinCode: joinCode.trim(),
      quorumRule,
      participants,
    });

    // Pre-meeting COI disclosures captured during roster build-out are recorded
    // into the meeting record now, as plain data — the session hasn't opened yet.
    const coiEvents: MeetingEvent[] = roster
      .filter((r) => r.conflict)
      .map((r, i) => ({
        id: `pre-coi-${i}`,
        type: 'recuse' as const,
        participantId: r.localId,
        text: r.coiDetail.trim()
          ? `${r.name.trim()} disclosed a conflict of interest prior to convening: ${r.coiDetail.trim()}`
          : `${r.name.trim()} disclosed a conflict of interest prior to convening.`,
        timestampIso: nowIso(),
      }));
    if (coiEvents.length > 0) {
      session = { ...session, meetingRecord: [...session.meetingRecord, ...coiEvents] };
    }

    onStart({ session, casePack: selectedCasePack });
  }

  return (
    <div className="bs-hub">
      <div className="bs-hub-head">
        <div>
          <span className="bs-kicker">Facilitated Group Session</span>
          <h1 className="bs-editorial">Convene the Governing Body</h1>
          <p>
            Build the seated roster, disclose any conflicts before the gavel falls, and generate a join code the room
            can reference. One device runs the whole session — the facilitator records motions, votes, and the
            live meeting record on behalf of everyone present.
          </p>
        </div>
      </div>

      <section className="bs-rail-card">
        <header>
          <strong>1. Select This Session&rsquo;s Case Pack</strong>
        </header>
        <div className="bs-pack-grid">
          {casePacks.map((pack) => {
            const selected = pack.id === casePackId;
            return (
              <button
                key={pack.id}
                type="button"
                className="bs-pack-card"
                aria-pressed={selected}
                onClick={() => setCasePackId(pack.id)}
                style={{
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: selected ? 'var(--bs-shadow-md)' : undefined,
                  outline: selected ? '2px solid var(--bs-bronze)' : undefined,
                  outlineOffset: selected ? '-2px' : undefined,
                }}
              >
                <header>
                  <span>{pack.quarter}</span>
                  <strong>{pack.title}</strong>
                  <small>{pack.subtitle}</small>
                </header>
                <div className="bs-pack-body">
                  <div className="bs-pack-facts">
                    <span><b>{pack.estMinutes}</b> min</span>
                    <span><b>{pack.decisionNodes.length}</b> decisions</span>
                    <span><b>{pack.exhibits.length}</b> exhibits</span>
                  </div>
                </div>
                <footer>
                  <small>{formatPassStandardLabel(pack.passScore, 'points_1000')}</small>
                  {selected ? <small style={{ color: 'var(--bs-forest)', fontWeight: 600 }}>SELECTED</small> : null}
                </footer>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bs-group-grid">
        <div className="bs-rail-card">
          <header>
            <strong>2. Join Code &amp; Quorum Rule</strong>
          </header>
          <div className="bs-motion-field">
            <label htmlFor="gb-join-code">Session join code</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                id="gb-join-code"
                value={joinCode}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setJoinCode(e.target.value.toUpperCase())}
                style={{ flex: 1 }}
              />
              <button type="button" className="bs-rail-action secondary" style={{ width: 'auto', padding: '8px 12px' }} onClick={() => setJoinCode(randomJoinCode())}>
                <RefreshCw size={13} />
              </button>
              <button type="button" className="bs-rail-action secondary" style={{ width: 'auto', padding: '8px 12px' }} onClick={copyJoinCode}>
                <Copy size={13} />
              </button>
            </div>
            {copyState === 'copied' ? <small style={{ color: 'var(--bs-success)' }}>Copied.</small> : null}
          </div>
          <div className="bs-motion-field">
            <label htmlFor="gb-quorum-rule">Quorum rule</label>
            <select id="gb-quorum-rule" value={quorumKind} onChange={(e) => setQuorumKind(e.target.value as QuorumRule['kind'])}>
              <option value="majority_of_voting_members">Simple majority of seated voting members</option>
              <option value="fixed_count">Fixed count</option>
              <option value="fraction">Two-thirds fraction</option>
            </select>
          </div>
          <div className="bs-supplemental-flag" style={{ color: 'var(--bs-muted)', background: 'var(--bs-canvas)', border: '1px solid var(--bs-line)' }}>
            <Users size={13} />
            <span>{votingSeatCount} voting-seat roles, {attendeeCount} non-voting attendee role(s) currently on the roster.</span>
          </div>
        </div>

        <div className="bs-rail-card">
          <header>
            <strong>3. Seated Roster &amp; Conflict Disclosure</strong>
            <button type="button" className="bs-rail-action" style={{ width: 'auto', padding: '8px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={addParticipant}>
              <Plus size={13} /> Add participant
            </button>
          </header>

          <div className="bs-contradiction">
            <AlertTriangle size={16} />
            <div>
              <strong>Roster note</strong>
              <p>
                Quorum is computed from seated voting-member roles only. A Secretary/Facilitator or Observer remains
                visible in the attendance record but is excluded from the quorum denominator and cannot cast a vote.
              </p>
            </div>
          </div>

          <div className="bs-participant-list">
            {roster.map((p) => (
              <div key={p.localId} className="bs-participant-row" style={{ gridTemplateColumns: '1fr', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div className="bs-participant-avatar">
                    {p.name.trim().slice(0, 2).toUpperCase() || '—'}
                  </div>
                  <input
                    aria-label="Participant name"
                    placeholder="Full name"
                    value={p.name}
                    onChange={(e) => updateParticipant(p.localId, { name: e.target.value })}
                    style={{ flex: '1 1 160px', padding: '8px 10px', border: '1px solid var(--bs-line)', borderRadius: 6, fontSize: 11.5 }}
                  />
                  <select
                    aria-label="Participant role"
                    value={p.role}
                    onChange={(e) => updateParticipant(p.localId, { role: e.target.value as ParticipantRole })}
                    style={{ padding: '8px 10px', border: '1px solid var(--bs-line)', borderRadius: 6, fontSize: 11.5 }}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  <div className="bs-participant-toggles">
                    <button
                      type="button"
                      className={`bs-toggle-pill${!p.present ? ' active absent' : ''}`}
                      onClick={() => updateParticipant(p.localId, { present: !p.present })}
                    >
                      {p.present ? 'Present' : 'Absent'}
                    </button>
                    <button
                      type="button"
                      className={`bs-toggle-pill${p.conflict ? ' active conflict' : ''}`}
                      onClick={() => updateParticipant(p.localId, { conflict: !p.conflict })}
                    >
                      COI
                    </button>
                    <button
                      type="button"
                      className={`bs-toggle-pill${p.recused ? ' active recused' : ''}`}
                      onClick={() => updateParticipant(p.localId, { recused: !p.recused })}
                    >
                      Recused
                    </button>
                    <button type="button" className="bs-toggle-pill" aria-label={`Remove ${p.name || 'participant'}`} onClick={() => removeParticipant(p.localId)}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                {p.conflict ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldAlert size={13} style={{ color: 'var(--bs-bronze)', flex: 'none' }} />
                    <input
                      aria-label="Conflict of interest detail"
                      placeholder="Describe the conflict of interest (e.g. vendor equity interest in today's agenda item)"
                      value={p.coiDetail}
                      onChange={(e) => updateParticipant(p.localId, { coiDetail: e.target.value })}
                      style={{ flex: 1, padding: '7px 10px', border: '1px solid #ecdba8', background: '#f7edd4', borderRadius: 6, fontSize: 10.5 }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
            {roster.length === 0 ? <p style={{ color: 'var(--bs-muted)', fontSize: 11 }}>No participants yet — add at least two.</p> : null}
          </div>
        </div>
      </section>

      <button type="button" className="bs-rail-action" disabled={!canStart} onClick={handleStart} style={{ maxWidth: 320 }}>
        Open Facilitator Console
      </button>
      {!canStart ? (
        <small style={{ color: 'var(--bs-muted)' }}>
          Select a case pack, set a join code, and name at least two participants to continue.
        </small>
      ) : null}
    </div>
  );
}

export { ROLE_LABEL as PARTICIPANT_ROLE_LABEL };
