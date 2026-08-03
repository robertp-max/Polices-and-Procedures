import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ClipboardCheck, ExternalLink, FileText, Gavel, LogOut, UserRound } from 'lucide-react';

import type { TabletopAccessMode } from '../compliance/accessMode';
import { isPrivilegedAccessMode } from '../compliance/accessMode';
import FacilitatorConsole from './FacilitatorConsole';
import GroupSessionLobby from './GroupSessionLobby';
import ParticipantWorkspace from './ParticipantWorkspace';
import PrivilegedAccessBanner from './PrivilegedAccessBanner';
import type { GroupAction, GroupSessionState } from './engine/groupState';
import { groupSessionReducer } from './engine/groupState';
import { resolveTabletopCasePack } from './tabletopCaseRegistry';
import {
  fetchTabletopPacketArtifacts,
  formatPacketGeneratedAt,
  openProtectedPacket,
  type TabletopPacketArtifact,
} from './tabletopPacketArtifacts';
import { useTabletopBodyLock } from './useTabletopBodyLock';

export interface FacilitatedGroupSessionProps {
  caseId: string;
  accessMode: TabletopAccessMode;
  onExit: () => void;
}

export default function FacilitatedGroupSession({
  caseId,
  accessMode,
  onExit,
}: FacilitatedGroupSessionProps) {
  useTabletopBodyLock(true);
  const casePack = resolveTabletopCasePack(caseId);
  const [session, setSession] = useState<GroupSessionState | null>(null);
  const [workspace, setWorkspace] = useState<'facilitator' | 'participant'>('facilitator');
  const [participantId, setParticipantId] = useState('');
  const [ended, setEnded] = useState(false);
  const [packetArtifact, setPacketArtifact] = useState<TabletopPacketArtifact | null>(null);
  const [packetNotice, setPacketNotice] = useState('Loading controlled packet artifact...');

  const dispatch = useCallback((action: GroupAction) => {
    setSession((current) => (current ? groupSessionReducer(current, action) : current));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTabletopPacketArtifacts(controller.signal)
      .then((payload) => {
        const artifact = payload.artifacts.find((candidate) => candidate.caseId === caseId) ?? null;
        setPacketArtifact(artifact);
        setPacketNotice(
          artifact
            ? payload.classification
            : (payload.notice ?? 'No controlled packet artifact has been generated for this case.'),
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setPacketArtifact(null);
        setPacketNotice(
          error instanceof Error ? error.message : 'Controlled packet artifact is unavailable.',
        );
      });
    return () => controller.abort();
  }, [caseId]);

  if (!casePack) {
    return (
      <div className="bs-root bs-group-shell">
        <p>Unknown tabletop case &quot;{caseId}&quot;.</p>
        <button type="button" className="bs-rail-action secondary" onClick={onExit}>
          <ArrowLeft size={14} aria-hidden="true" /> Return to Tabletop Hub
        </button>
      </div>
    );
  }

  const officialBoundary =
    'Facilitated-group records remain a review workspace. They do not create individual official completion evidence unless each learner completes the required competency capture and the immutable evidence repository accepts it.';
  const packetReference = (
    <section className="bs-group-packet-reference" aria-label={`${casePack.title} controlled packet reference`}>
      <div>
        <span>Controlled Board Packet</span>
        <strong>
          {packetArtifact
            ? `${packetArtifact.period} packet · v${packetArtifact.version} · ${packetArtifact.status.replaceAll('_', ' ')}`
            : 'Packet unavailable'}
        </strong>
        <p>
          {packetArtifact
            ? `${packetArtifact.pageCount} pages · source cutoff ${packetArtifact.sourceCutoff} · last generated ${formatPacketGeneratedAt(packetArtifact.generatedAt)} by ${packetArtifact.generatedBy}. Human review remains required.`
            : packetNotice}
        </p>
      </div>
      {packetArtifact && (
        <div>
          <button type="button" onClick={() => openProtectedPacket(packetArtifact)}>
            <FileText size={14} aria-hidden="true" /> Review Packet
          </button>
          <button type="button" onClick={() => openProtectedPacket(packetArtifact)}>
            <ExternalLink size={14} aria-hidden="true" /> Open Packet in New Tab
          </button>
        </div>
      )}
    </section>
  );

  if (!session) {
    return (
      <div className="bs-root bs-group-shell">
        <header className="bs-group-route-header">
          <div>
            <span>Facilitated Group · {casePack.quarter}</span>
            <strong>{casePack.title}</strong>
          </div>
          <button type="button" className="bs-rail-action secondary" onClick={onExit}>
            <ArrowLeft size={14} aria-hidden="true" /> Tabletop Hub
          </button>
        </header>
        {isPrivilegedAccessMode(accessMode) && (
          <PrivilegedAccessBanner mode={accessMode} />
        )}
        <p className="bs-group-evidence-boundary" role="note">
          <ClipboardCheck size={15} aria-hidden="true" /> {officialBoundary}
        </p>
        {packetReference}
        <GroupSessionLobby
          casePacks={[casePack]}
          onStart={({ session: started }) => {
            setSession(started);
            setParticipantId(started.participants[0]?.id ?? '');
          }}
        />
      </div>
    );
  }

  if (ended) {
    const attestedCount = Object.values(session.individualAttestations).filter(Boolean).length;
    return (
      <div className="bs-root bs-group-shell">
        <section className="bs-group-end-summary" aria-labelledby="group-session-summary-title">
          <span>Facilitated session review</span>
          <h1 id="group-session-summary-title">{casePack.title}</h1>
          <p>{officialBoundary}</p>
          {packetReference}
          <dl>
            <div><dt>Session</dt><dd>{session.joinCode}</dd></div>
            <div><dt>Participants</dt><dd>{session.participants.length}</dd></div>
            <div><dt>Meeting-record entries</dt><dd>{session.meetingRecord.length}</dd></div>
            <div><dt>Individual attestations</dt><dd>{attestedCount} of {session.participants.length}</dd></div>
            <div><dt>Competency captures</dt><dd>{session.competencyCaptures.length}</dd></div>
            <div><dt>Activated workflows</dt><dd>{session.activatedWorkflowIds.length}</dd></div>
          </dl>
          <div className="bs-group-end-actions">
            <button type="button" className="bs-rail-action secondary" onClick={() => setEnded(false)}>
              <Gavel size={14} aria-hidden="true" /> Reopen Review
            </button>
            <button type="button" className="bs-rail-action" onClick={onExit}>
              <LogOut size={14} aria-hidden="true" /> Return to Tabletop Hub
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bs-root bs-group-shell">
      {isPrivilegedAccessMode(accessMode) && (
        <PrivilegedAccessBanner mode={accessMode} />
      )}
      <p className="bs-group-evidence-boundary" role="note">
        <ClipboardCheck size={15} aria-hidden="true" /> {officialBoundary}
      </p>
      {packetReference}
      <nav className="bs-group-workspace-nav" aria-label="Facilitated session workspace">
        <button
          type="button"
          className={workspace === 'facilitator' ? 'active' : ''}
          aria-current={workspace === 'facilitator' ? 'page' : undefined}
          onClick={() => setWorkspace('facilitator')}
        >
          <Gavel size={14} aria-hidden="true" /> Facilitator Console
        </button>
        <button
          type="button"
          className={workspace === 'participant' ? 'active' : ''}
          aria-current={workspace === 'participant' ? 'page' : undefined}
          onClick={() => setWorkspace('participant')}
        >
          <UserRound size={14} aria-hidden="true" /> Participant Workspace
        </button>
        {workspace === 'participant' && (
          <label>
            Participant
            <select value={participantId} onChange={(event) => setParticipantId(event.target.value)}>
              {session.participants.map((participant) => (
                <option key={participant.id} value={participant.id}>{participant.name}</option>
              ))}
            </select>
          </label>
        )}
      </nav>
      {workspace === 'facilitator' ? (
        <FacilitatorConsole
          casePack={casePack}
          state={session}
          dispatch={dispatch}
          onEndSession={() => setEnded(true)}
        />
      ) : (
        <ParticipantWorkspace
          casePack={casePack}
          state={session}
          dispatch={dispatch}
          participantId={participantId}
        />
      )}
    </div>
  );
}
