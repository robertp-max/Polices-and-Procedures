// Separates public-session from confidential executive-session work: a
// docket-classification step (session_classification / board_vs_management
// competencies), a locked confidential pane that only opens once the Chair
// formally calls executive session, and two independent note surfaces so
// restricted content is never typed into the public-facing field by
// accident.

import { useMemo } from 'react';
import type { Exhibit } from './engine/caseTypes';
import { Lock, ShieldAlert, Unlock } from 'lucide-react';

export type SessionClassification = 'public' | 'executive_session';

export interface MatterClassification {
  matterId: string;
  matterTitle: string;
  classification: SessionClassification | null;
  /** Provided once feedback should be revealed (e.g. after the node is submitted). */
  correctClassification?: SessionClassification;
}

export interface ExecutiveSessionWorkspaceProps {
  exhibits: Exhibit[];
  matters: MatterClassification[];
  onClassify: (matterId: string, classification: SessionClassification) => void;
  showFeedback?: boolean;
  sessionCalled: boolean;
  onCallSession: () => void;
  publicNote: string;
  onPublicNoteChange: (v: string) => void;
  confidentialNote: string;
  onConfidentialNoteChange: (v: string) => void;
  readOnly?: boolean;
}

export default function ExecutiveSessionWorkspace(props: ExecutiveSessionWorkspaceProps) {
  const {
    exhibits,
    matters,
    onClassify,
    showFeedback = false,
    sessionCalled,
    onCallSession,
    publicNote,
    onPublicNoteChange,
    confidentialNote,
    onConfidentialNoteChange,
    readOnly = false,
  } = props;

  const publicExhibits = useMemo(() => exhibits.filter((e) => e.confidentiality === 'public'), [exhibits]);
  const restrictedExhibits = useMemo(
    () => exhibits.filter((e) => e.confidentiality === 'restricted' || e.confidentiality === 'executive_session'),
    [exhibits],
  );

  return (
    <div className="bs-boardtable" style={{ gap: 14 }}>
      <div className="bs-decision-prompt">
        <header>
          <p className="bs-kicker">Docket Classification</p>
          <h3>Classify today's matters</h3>
          <p className="bs-prompt-text">
            Classify each matter as Public Session or Executive Session before the agenda proceeds.
          </p>
        </header>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {matters.map((m) => {
            const feedbackOk = showFeedback && m.correctClassification
              ? m.classification === m.correctClassification
              : null;
            return (
              <li key={m.matterId} className="bs-participant-row" style={{ gridTemplateColumns: '1fr auto' }}>
                <div className="bs-participant-meta">
                  <strong>{m.matterTitle}</strong>
                  {feedbackOk !== null && (
                    <small style={{ color: feedbackOk ? 'var(--bs-success)' : 'var(--bs-danger)' }}>
                      {feedbackOk ? 'Correctly classified' : `Should be: ${m.correctClassification === 'public' ? 'Public Session' : 'Executive Session'}`}
                    </small>
                  )}
                </div>
                <div className="bs-disposition-chips">
                  <button
                    type="button"
                    className={`bs-chip${m.classification === 'public' ? ' selected' : ''}`}
                    onClick={() => onClassify(m.matterId, 'public')}
                    disabled={readOnly}
                  >
                    Public Session
                  </button>
                  <button
                    type="button"
                    className={`bs-chip${m.classification === 'executive_session' ? ' selected warn' : ''}`}
                    onClick={() => onClassify(m.matterId, 'executive_session')}
                    disabled={readOnly}
                  >
                    Executive Session
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        <div className="bs-inspector">
          <header>
            <strong>Public Session</strong>
            <span className="bs-badge conf-public">public</span>
          </header>
          <div className="bs-inspector-body">
            <p>{publicExhibits.length} public exhibit{publicExhibits.length === 1 ? '' : 's'} available to this session.</p>
            <div className="bs-motion-field">
              <label htmlFor="es-public-note">Public-session notes</label>
              <textarea
                id="es-public-note"
                value={publicNote}
                onChange={(e) => onPublicNoteChange(e.target.value)}
                placeholder="Record only what may appear in the public record…"
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <div className="bs-inspector">
          <header>
            <strong>
              {sessionCalled ? <Unlock size={14} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} /> : <Lock size={14} aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 6 }} />}
              Executive Session
            </strong>
            <span className="bs-badge conf-executive_session">restricted</span>
          </header>
          <div className="bs-inspector-body">
            {!sessionCalled ? (
              <>
                <p>Confidential exhibits and notes are locked until the Chair calls executive session.</p>
                <button type="button" className="bs-rail-action" onClick={onCallSession} disabled={readOnly}>
                  Call Executive Session
                </button>
              </>
            ) : (
              <>
                <p className="bs-supplemental-flag" role="note">
                  <ShieldAlert size={12} aria-hidden="true" /> {restrictedExhibits.length} restricted/executive-session exhibit{restrictedExhibits.length === 1 ? '' : 's'} unlocked. Nothing here belongs in the public minutes.
                </p>
                <ul>
                  {restrictedExhibits.map((e) => (
                    <li key={e.id}>{e.title}</li>
                  ))}
                </ul>
                <div className="bs-motion-field">
                  <label htmlFor="es-confidential-note">Confidential executive-session notes</label>
                  <textarea
                    id="es-confidential-note"
                    value={confidentialNote}
                    onChange={(e) => onConfidentialNoteChange(e.target.value)}
                    placeholder="Findings, clinician references, recommended actions, current status…"
                    disabled={readOnly}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
